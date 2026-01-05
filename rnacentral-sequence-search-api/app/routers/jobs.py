from fastapi import APIRouter, HTTPException
from app.models.job import (
    SubmitJobRequest,
    SubmitJobResponse,
    JobStatusResponse,
    JobResultsResponse,
    FacetsRequest,
    FacetsResponse,
    JobStatus,
)
from app.models.database import RNACENTRAL_DATABASES
from app.services.job_manager import job_manager


router = APIRouter(prefix="/api", tags=["jobs"])


@router.get("/databases")
async def get_databases():
    """Get list of available RNAcentral databases."""
    return RNACENTRAL_DATABASES


@router.post("/submit-job", response_model=SubmitJobResponse)
async def submit_job(request: SubmitJobRequest):
    """
    Submit a new sequence search job.
    Submits to all databases in parallel by default.
    """
    try:
        job_id = await job_manager.create_job(
            sequence=request.sequence,
            databases=request.databases if request.databases else None
        )
        return SubmitJobResponse(
            job_id=job_id,
            status=JobStatus.RUNNING,
            databases_count=len(request.databases) if request.databases else len(RNACENTRAL_DATABASES)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/job-status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Get the current status of a job.
    Includes progress information across all database searches.
    """
    result = await job_manager.get_job_status(job_id)
    return JobStatusResponse(**result)


@router.get("/job-results/{job_id}", response_model=JobResultsResponse)
async def get_job_results(job_id: str):
    """
    Get the results of a completed job.
    Returns merged and deduplicated results from all databases.
    """
    result = await job_manager.get_job_results(job_id)
    if result["status"] == JobStatus.NOT_FOUND:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResultsResponse(**result)


@router.post("/job-results/{job_id}/filter", response_model=FacetsResponse)
async def filter_job_results(job_id: str, request: FacetsRequest):
    """
    Get filtered results for a job.
    Apply facet filters and/or text search to narrow down results.
    """
    result = await job_manager.get_job_results(
        job_id,
        selected_facets=request.selected_facets,
        text_filter=request.text_filter
    )
    if result["status"] == JobStatus.NOT_FOUND:
        raise HTTPException(status_code=404, detail="Job not found")
    return FacetsResponse(
        job_id=result["job_id"],
        hit_count=result["hit_count"],
        entries=result["entries"],
        facets=result["facets"]
    )
