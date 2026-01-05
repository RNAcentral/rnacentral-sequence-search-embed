import json
import uuid
from typing import Optional
from datetime import datetime
import redis.asyncio as redis
from app.config import get_settings
from app.models.job import JobStatus, SearchHit
from app.models.database import get_database_ids
from app.services.job_dispatcher import JobDispatcherService
from app.services.ebi_search import EbiSearchService


settings = get_settings()


class JobManager:
    """
    Manages the lifecycle of sequence search jobs.
    Submits to multiple databases in parallel and aggregates results.
    """

    def __init__(self):
        self.redis: Optional[redis.Redis] = None
        self.job_dispatcher = JobDispatcherService()
        self.ebi_search = EbiSearchService()

    async def connect(self):
        """Connect to Redis."""
        self.redis = redis.from_url(settings.redis_url, decode_responses=True)

    async def disconnect(self):
        """Disconnect from Redis."""
        if self.redis:
            await self.redis.close()

    def _job_key(self, job_id: str) -> str:
        return f"job:{job_id}"

    def _results_key(self, job_id: str) -> str:
        return f"results:{job_id}"

    async def create_job(
        self,
        sequence: str,
        databases: Optional[list[str]] = None
    ) -> str:
        """
        Create a new search job.
        Submits to all databases in parallel.
        Returns our internal job ID.
        """
        internal_job_id = str(uuid.uuid4())

        # Use all databases if none specified
        if not databases:
            databases = get_database_ids()

        # Submit jobs to all databases in parallel
        db_jobs = await self.job_dispatcher.submit_jobs_to_databases(
            sequence,
            databases,
            max_concurrent=settings.max_concurrent_db_requests
        )

        # Filter out failed submissions
        successful_jobs = {db: jid for db, jid in db_jobs.items() if jid is not None}
        failed_dbs = [db for db, jid in db_jobs.items() if jid is None]

        # Store job metadata in Redis
        job_data = {
            "job_id": internal_job_id,
            "sequence": sequence,
            "databases": databases,
            "db_jobs": successful_jobs,
            "failed_dbs": failed_dbs,
            "status": JobStatus.RUNNING.value,
            "created_at": datetime.utcnow().isoformat(),
        }

        await self.redis.setex(
            self._job_key(internal_job_id),
            settings.job_expiry_seconds,
            json.dumps(job_data)
        )

        return internal_job_id

    async def get_job_status(self, job_id: str) -> dict:
        """
        Get the current status of a job, including progress across all databases.
        """
        job_data = await self._get_job_data(job_id)
        if not job_data:
            return {
                "job_id": job_id,
                "status": JobStatus.NOT_FOUND,
                "progress": 0,
                "databases_total": 0,
                "databases_finished": 0,
                "databases_failed": 0,
            }

        db_jobs = job_data.get("db_jobs", {})
        failed_dbs = job_data.get("failed_dbs", [])

        # Get statuses for all database jobs in parallel
        db_statuses = await self.job_dispatcher.get_statuses_for_jobs(
            db_jobs,
            max_concurrent=settings.max_concurrent_db_requests
        )

        # Count statuses
        finished_count = sum(1 for s in db_statuses.values() if s == JobStatus.FINISHED)
        error_count = sum(1 for s in db_statuses.values() if s == JobStatus.ERROR)
        running_count = sum(1 for s in db_statuses.values() if s == JobStatus.RUNNING)

        total_dbs = len(db_jobs) + len(failed_dbs)
        failed_count = len(failed_dbs) + error_count

        # Determine overall status
        if running_count > 0:
            overall_status = JobStatus.RUNNING
        elif finished_count > 0:
            overall_status = JobStatus.FINISHED
            # Fetch and store results when finished
            if job_data.get("status") != JobStatus.FINISHED.value:
                await self._fetch_and_store_results(job_id, job_data)
                job_data["status"] = JobStatus.FINISHED.value
                await self.redis.setex(
                    self._job_key(job_id),
                    settings.job_expiry_seconds,
                    json.dumps(job_data)
                )
        else:
            overall_status = JobStatus.ERROR

        # Calculate progress
        if total_dbs > 0:
            progress = ((finished_count + error_count) / total_dbs) * 100
        else:
            progress = 0

        return {
            "job_id": job_id,
            "status": overall_status,
            "progress": progress,
            "databases_total": total_dbs,
            "databases_finished": finished_count,
            "databases_failed": failed_count,
        }

    async def get_job_results(
        self,
        job_id: str,
        selected_facets: Optional[dict[str, list[str]]] = None,
        text_filter: Optional[str] = None,
    ) -> dict:
        """
        Get the results of a completed job, with optional facet filtering.
        """
        job_data = await self._get_job_data(job_id)
        if not job_data:
            return {
                "job_id": job_id,
                "status": JobStatus.NOT_FOUND,
                "hit_count": 0,
                "entries": [],
                "facets": [],
            }

        # Get cached results
        results_json = await self.redis.get(self._results_key(job_id))
        if not results_json:
            # Results not cached, fetch them
            await self._fetch_and_store_results(job_id, job_data)
            results_json = await self.redis.get(self._results_key(job_id))

        if not results_json:
            return {
                "job_id": job_id,
                "status": JobStatus.ERROR,
                "hit_count": 0,
                "entries": [],
                "facets": [],
            }

        results = json.loads(results_json)
        hits = [SearchHit(**h) for h in results]

        # Get RNAcentral IDs for facet fetching
        rnacentral_ids = [h.rnacentral_id for h in hits]

        # Build filter query
        filter_query = self.ebi_search.build_filter_query(
            selected_facets or {},
            text_filter
        )

        # Fetch facets
        facets = await self.ebi_search.fetch_facets_for_ids(
            rnacentral_ids,
            filter_query
        )

        # Filter hits if there's a filter
        if filter_query:
            matching_ids = await self.ebi_search.fetch_matching_ids(
                rnacentral_ids,
                filter_query
            )
            hits = self.ebi_search.filter_hits_by_ids(hits, matching_ids)

        return {
            "job_id": job_id,
            "status": JobStatus.FINISHED,
            "hit_count": len(hits),
            "entries": hits,
            "facets": facets,
        }

    async def _get_job_data(self, job_id: str) -> Optional[dict]:
        """Get job data from Redis."""
        job_json = await self.redis.get(self._job_key(job_id))
        if job_json:
            return json.loads(job_json)
        return None

    async def _fetch_and_store_results(self, job_id: str, job_data: dict):
        """Fetch results from all databases in parallel and store in Redis."""
        db_jobs = job_data.get("db_jobs", {})

        # Get results from all finished database jobs in parallel
        hits = await self.job_dispatcher.get_results_for_jobs(
            db_jobs,
            max_concurrent=settings.max_concurrent_db_requests
        )

        # Store results in Redis
        results_json = json.dumps([h.model_dump() for h in hits])
        await self.redis.setex(
            self._results_key(job_id),
            settings.job_expiry_seconds,
            results_json
        )


# Global job manager instance
job_manager = JobManager()
