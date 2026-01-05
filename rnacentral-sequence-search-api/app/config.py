import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API settings
    api_title: str = "RNAcentral Sequence Search API"
    api_version: str = "1.0.0"
    debug: bool = False

    # Job Dispatcher settings
    # Use test endpoint for development; production would be https://www.ebi.ac.uk/Tools/services/rest
    job_dispatcher_base_url: str = "http://test.jd.sdo.ebi.ac.uk:8180/Tools/services/rest"
    job_dispatcher_tool: str = "rnacentral_nhmmer"
    job_dispatcher_email: str = "rnacentral@ebi.ac.uk"

    # EBI Search settings
    ebi_search_base_url: str = "https://www.ebi.ac.uk/ebisearch/ws/rest/rnacentral"

    # Redis settings (for job state storage)
    redis_url: str = "redis://localhost:6379"

    # Job settings
    job_expiry_seconds: int = 86400  # 24 hours
    max_concurrent_db_requests: int = 10

    # CORS settings
    cors_origins: list[str] = [
        "http://localhost:8080",
        "http://localhost:3000",
        "https://rnacentral.org",
        "https://www.rnacentral.org",
        "https://search.rnacentral.org",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
