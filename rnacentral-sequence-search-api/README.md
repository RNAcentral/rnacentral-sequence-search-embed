# RNAcentral Sequence Search API

A FastAPI backend service that provides a unified API for RNA sequence searches across multiple RNAcentral databases.

## Overview

This API acts as a proxy/aggregator for the EBI Job Dispatcher service, handling:

- **Multi-database searches**: Submits sequence searches to 50+ RNAcentral databases in parallel
- **Result aggregation**: Merges, deduplicates, and sorts results from all databases
- **Faceted search**: Fetches facets from EBI Search and supports filtering by facets
- **Job management**: Tracks job status across all database searches with Redis

## Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│  Frontend       │────▶│  This API           │────▶│  Job Dispatcher │
│  (React app)    │     │  (FastAPI + Redis)  │     │  (50+ DBs)      │
└─────────────────┘     └─────────────────────┘     └─────────────────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │   EBI Search    │
                        │   (facets)      │
                        └─────────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/databases` | List available databases |
| POST | `/api/submit-job` | Submit a new sequence search |
| GET | `/api/job-status/{job_id}` | Get job status and progress |
| GET | `/api/job-results/{job_id}` | Get search results |
| POST | `/api/job-results/{job_id}/filter` | Get filtered results with facets |

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start the API and Redis
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

The API will be available at `http://localhost:8000`

### Local Development

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start Redis (required for job storage):
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

4. Copy and configure environment:
```bash
cp .env.example .env
# Edit .env as needed
```

5. Run the API:
```bash
uvicorn app.main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Example Usage

### Submit a job

```bash
curl -X POST http://localhost:8000/api/submit-job \
  -H "Content-Type: application/json" \
  -d '{"sequence": "ACGUACGUACGUACGUACGU"}'
```

Response:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "databases_count": 53
}
```

### Check job status

```bash
curl http://localhost:8000/api/job-status/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "progress": 45.5,
  "databases_total": 53,
  "databases_finished": 24,
  "databases_failed": 0
}
```

### Get results

```bash
curl http://localhost:8000/api/job-results/550e8400-e29b-41d4-a716-446655440000
```

### Filter results by facets

```bash
curl -X POST http://localhost:8000/api/job-results/550e8400-e29b-41d4-a716-446655440000/filter \
  -H "Content-Type: application/json" \
  -d '{"selected_facets": {"rna_type": ["lncRNA"], "TAXONOMY": ["9606"]}}'
```

## Configuration

Environment variables (can be set in `.env` file):

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `false` | Enable debug mode |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `JOB_EXPIRY_SECONDS` | `86400` | Job data TTL (24 hours) |
| `MAX_CONCURRENT_DB_REQUESTS` | `10` | Max parallel requests to Job Dispatcher |
| `CORS_ORIGINS` | (see config.py) | Allowed CORS origins |

## Kubernetes Deployment

The Docker image can be deployed to Kubernetes. Example manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rnacentral-sequence-search-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: rnacentral-sequence-search-api
  template:
    metadata:
      labels:
        app: rnacentral-sequence-search-api
    spec:
      containers:
      - name: api
        image: rnacentral-sequence-search-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: rnacentral-sequence-search-api
spec:
  selector:
    app: rnacentral-sequence-search-api
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
```

## Development

### Running tests

```bash
pytest tests/
```

### Code formatting

```bash
# Install dev dependencies
pip install black isort

# Format code
black app/
isort app/
```
