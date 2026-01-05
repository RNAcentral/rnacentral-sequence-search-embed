from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import jobs
from app.services.job_manager import job_manager


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await job_manager.connect()
    yield
    # Shutdown
    await job_manager.disconnect()


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(jobs.router)


@app.get("/")
async def root():
    return {
        "name": settings.api_title,
        "version": settings.api_version,
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
