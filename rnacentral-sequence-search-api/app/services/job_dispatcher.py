import asyncio
import httpx
from typing import Optional
from app.config import get_settings
from app.models.job import JobStatus, SearchHit


settings = get_settings()


class JobDispatcherService:
    """Service for interacting with EBI Job Dispatcher API."""

    def __init__(self):
        self.base_url = settings.job_dispatcher_base_url
        self.tool = settings.job_dispatcher_tool
        self.email = settings.job_dispatcher_email

    def _get_tool_url(self) -> str:
        """Get the Job Dispatcher URL for the tool."""
        return f"{self.base_url}/{self.tool}"

    async def submit_job(self, sequence: str, database: str = "all") -> Optional[str]:
        """
        Submit a sequence search job.
        database can be 'all' (default) or a specific database like 'mirbase-0'.
        Returns the job ID if successful, None otherwise.
        """
        # Format sequence as FASTA if not already
        fasta_sequence = sequence
        if not sequence.startswith(">"):
            fasta_sequence = f">query\n{sequence}"

        url = f"{self._get_tool_url()}/run"

        form_data = {
            "email": self.email,
            "sequence": fasta_sequence,
            "database": database,
            "alphabet": "rna",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    url,
                    data=form_data,
                    headers={"Accept": "text/plain"}
                )
                if response.status_code == 200:
                    return response.text.strip()
                else:
                    return None
            except Exception:
                return None

    async def get_job_status(self, job_id: str) -> JobStatus:
        """Get the status of a job."""
        url = f"{self._get_tool_url()}/status/{job_id}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(url, headers={"Accept": "text/plain"})
                if response.status_code == 200:
                    status_text = response.text.strip().upper()
                    if status_text in ("RUNNING", "PENDING", "QUEUED"):
                        return JobStatus.RUNNING
                    elif status_text == "FINISHED":
                        return JobStatus.FINISHED
                    elif status_text == "NOT_FOUND":
                        return JobStatus.NOT_FOUND
                    else:
                        return JobStatus.ERROR
                else:
                    return JobStatus.ERROR
            except Exception:
                return JobStatus.ERROR

    async def get_job_results(self, job_id: str) -> list[SearchHit]:
        """Get the results of a completed job."""
        url = f"{self._get_tool_url()}/result/{job_id}/json"

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.get(url, headers={"Accept": "application/json"})
                if response.status_code == 200:
                    json_data = response.json()
                    return self._parse_results(json_data)
                else:
                    return []
            except Exception:
                return []

    def _parse_results(self, json_data: list) -> list[SearchHit]:
        """Parse Job Dispatcher JSON results into SearchHit objects."""
        hits = []
        for i, hit in enumerate(json_data):
            try:
                search_hit = SearchHit(
                    id=hit.get("result_id", i),
                    rnacentral_id=hit.get("rnacentral_id", ""),
                    description=hit.get("description", ""),
                    score=float(hit.get("score", 0)),
                    bias=float(hit.get("bias", 0)),
                    e_value=float(hit.get("e_value", 0)),
                    identity=float(hit.get("identity", 0)),
                    query_coverage=float(hit.get("query_coverage", 0)),
                    target_coverage=float(hit.get("target_coverage", 0)),
                    alignment=hit.get("alignment", ""),
                    alignment_length=int(hit.get("alignment_length", 0)),
                    target_length=int(hit.get("target_length", 0)),
                    query_length=int(hit.get("query_length", 0)),
                    gaps=float(hit.get("gaps", 0)),
                    gap_count=int(hit.get("gap_count", 0)),
                    match_count=int(hit.get("match_count", 0)),
                    nts_count1=int(hit.get("nts_count1", 0)),
                    nts_count2=int(hit.get("nts_count2", 0)),
                    alignment_start=float(hit.get("alignment_start", 0)),
                    alignment_stop=float(hit.get("alignment_stop", 0)),
                )
                if search_hit.rnacentral_id:  # Only include hits with valid IDs
                    hits.append(search_hit)
            except Exception:
                continue
        return hits

    async def submit_jobs_to_databases(
        self,
        sequence: str,
        databases: list[str],
        max_concurrent: int = 10
    ) -> dict[str, Optional[str]]:
        """
        Submit jobs to multiple databases concurrently.
        Returns a dict mapping database ID to job ID (or None if failed).
        """
        semaphore = asyncio.Semaphore(max_concurrent)

        async def submit_with_semaphore(db: str) -> tuple[str, Optional[str]]:
            async with semaphore:
                job_id = await self.submit_job(sequence, db)
                return (db, job_id)

        tasks = [submit_with_semaphore(db) for db in databases]
        results = await asyncio.gather(*tasks)
        return dict(results)

    async def get_statuses_for_jobs(
        self,
        db_jobs: dict[str, str],
        max_concurrent: int = 10
    ) -> dict[str, JobStatus]:
        """
        Get statuses for multiple database jobs concurrently.
        db_jobs is a dict mapping database ID to job ID.
        """
        semaphore = asyncio.Semaphore(max_concurrent)

        async def get_status_with_semaphore(db: str, job_id: str) -> tuple[str, JobStatus]:
            async with semaphore:
                status = await self.get_job_status(job_id)
                return (db, status)

        tasks = [get_status_with_semaphore(db, job_id) for db, job_id in db_jobs.items()]
        results = await asyncio.gather(*tasks)
        return dict(results)

    async def get_results_for_jobs(
        self,
        db_jobs: dict[str, str],
        max_concurrent: int = 10
    ) -> list[SearchHit]:
        """
        Get and merge results from multiple database jobs.
        db_jobs is a dict mapping database ID to job ID.
        Returns merged and sorted results.
        """
        semaphore = asyncio.Semaphore(max_concurrent)

        async def get_results_with_semaphore(db: str, job_id: str) -> list[SearchHit]:
            async with semaphore:
                return await self.get_job_results(job_id)

        tasks = [get_results_with_semaphore(db, job_id) for db, job_id in db_jobs.items()]
        results_lists = await asyncio.gather(*tasks)

        # Merge all results
        all_hits = []
        for hits in results_lists:
            all_hits.extend(hits)

        # Deduplicate by rnacentral_id (keep highest score)
        seen = {}
        for hit in all_hits:
            if hit.rnacentral_id not in seen or hit.score > seen[hit.rnacentral_id].score:
                seen[hit.rnacentral_id] = hit

        # Sort by score descending
        sorted_hits = sorted(seen.values(), key=lambda h: h.score, reverse=True)

        # Re-assign IDs
        for i, hit in enumerate(sorted_hits):
            hit.id = i

        return sorted_hits
