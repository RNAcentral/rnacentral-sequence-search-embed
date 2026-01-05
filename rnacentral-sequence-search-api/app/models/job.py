from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    FINISHED = "finished"
    ERROR = "error"
    NOT_FOUND = "not_found"


class SubmitJobRequest(BaseModel):
    sequence: str = Field(..., min_length=10, max_length=10000, description="RNA/DNA sequence to search")
    databases: list[str] = Field(default=[], description="List of database IDs to search (empty = all)")

    class Config:
        json_schema_extra = {
            "example": {
                "sequence": "ACGUACGUACGUACGUACGU",
                "databases": []
            }
        }


class SubmitJobResponse(BaseModel):
    job_id: str = Field(..., description="Unique job identifier")
    status: JobStatus = Field(..., description="Current job status")
    databases_count: int = Field(..., description="Number of databases being searched")


class DatabaseJobStatus(BaseModel):
    database: str
    job_id: str
    status: JobStatus


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress: float = Field(..., ge=0, le=100, description="Progress percentage")
    databases_total: int
    databases_finished: int
    databases_failed: int
    database_statuses: Optional[list[DatabaseJobStatus]] = None


class SearchHit(BaseModel):
    id: int
    rnacentral_id: str
    description: str
    score: float
    bias: float
    e_value: float
    identity: float
    query_coverage: float
    target_coverage: float
    alignment: str
    alignment_length: int
    target_length: int
    query_length: int
    gaps: float
    gap_count: int
    match_count: int
    nts_count1: int
    nts_count2: int
    alignment_start: float
    alignment_stop: float


class FacetValue(BaseModel):
    label: str
    value: str
    count: int


class Facet(BaseModel):
    id: str
    label: str
    total: int = 0
    facetValues: list[FacetValue] = []


class JobResultsResponse(BaseModel):
    job_id: str
    status: JobStatus
    hit_count: int
    entries: list[SearchHit]
    facets: list[Facet] = []
    text_search_error: bool = False


class FacetsRequest(BaseModel):
    selected_facets: dict[str, list[str]] = Field(default={}, description="Selected facet filters")
    text_filter: Optional[str] = Field(default=None, description="Text search filter")


class FacetsResponse(BaseModel):
    job_id: str
    hit_count: int
    entries: list[SearchHit]
    facets: list[Facet]
