import json
from pathlib import Path

# Custom semantic extraction from README.md, docker-compose.yml, and docs/architecture.md
nodes = [
    {
        "id": "cronix",
        "type": "System",
        "label": "Cronix",
        "description": "Distributed Job Scheduler platform capable of enqueuing, running, and retrying asynchronous tasks.",
        "source_location": "README.md"
    },
    {
        "id": "backend",
        "type": "Component",
        "label": "Backend Service",
        "description": "Java 21 and Spring Boot 3 monolith handling REST requests, STOMP sockets, and concurrent job executions.",
        "source_location": "docs/architecture.md"
    },
    {
        "id": "frontend",
        "type": "Component",
        "label": "Frontend Dashboard",
        "description": "React Vite application hosting the telemetry, settings, and jobs management view.",
        "source_location": "README.md"
    },
    {
        "id": "database",
        "type": "Component",
        "label": "PostgreSQL Database",
        "description": "Relational store containing schema tables for users, projects, queues, jobs, and telemetry logs.",
        "source_location": "database/schema.sql"
    },
    {
        "id": "redis",
        "type": "Component",
        "label": "Redis Cache",
        "description": "Key-value cache storing worker metadata and statistics.",
        "source_location": "backend/src/main/resources/application.yml"
    },
    {
        "id": "nginx",
        "type": "Component",
        "label": "Nginx Server",
        "description": "Reverse proxy hosting the compiled frontend and routing /api/v1 and /ws to the backend.",
        "source_location": "frontend/nginx.conf"
    },
    {
        "id": "docker_compose",
        "type": "Deployment",
        "label": "Docker Compose",
        "description": "Orchestrator spinning up the database, cache, backend scheduler, and frontend.",
        "source_location": "docker-compose.yml"
    },
    {
        "id": "retry_engine",
        "type": "Process",
        "label": "Retry Engine",
        "description": "Retry logic applying fixed, linear, and exponential backoffs, and routing failed jobs to the DLQ.",
        "source_location": "docs/architecture.md"
    },
    {
        "id": "orphan_recovery",
        "type": "Process",
        "label": "Orphan Job Recovery",
        "description": "Daemon checking worker heartbeats every 5 seconds and recovering jobs from unresponsive workers.",
        "source_location": "docs/architecture.md"
    }
]

edges = [
    {
        "source": "cronix",
        "target": "backend",
        "type": "CONTAINS",
        "label": "contains backend monolith",
        "description": "Main orchestrator logic runs inside the backend service.",
        "source_location": "docs/architecture.md"
    },
    {
        "source": "cronix",
        "target": "frontend",
        "type": "CONTAINS",
        "label": "contains user dashboard",
        "description": "Exposes UI dashboard view to users.",
        "source_location": "README.md"
    },
    {
        "source": "backend",
        "target": "database",
        "type": "USES",
        "label": "persists state",
        "description": "Persists jobs, queues, users, and logs.",
        "source_location": "docs/architecture.md"
    },
    {
        "source": "backend",
        "target": "redis",
        "type": "USES",
        "label": "caches session metadata",
        "description": "Caches worker heartbeats and session tokens.",
        "source_location": "backend/src/main/resources/application.yml"
    },
    {
        "source": "nginx",
        "target": "frontend",
        "type": "SERVES",
        "label": "hosts frontend assets",
        "description": "Serves static react files on root port 80.",
        "source_location": "frontend/nginx.conf"
    },
    {
        "source": "nginx",
        "target": "backend",
        "type": "PROXIES",
        "label": "proxies API requests",
        "description": "Forwards /api/v1 and /ws connections.",
        "source_location": "frontend/nginx.conf"
    },
    {
        "source": "docker_compose",
        "target": "cronix",
        "type": "DEPLOYS",
        "label": "orchestrates deployment",
        "description": "Binds all services together.",
        "source_location": "docker-compose.yml"
    },
    {
        "source": "backend",
        "target": "retry_engine",
        "type": "EXECUTES",
        "label": "triggers backoff rules",
        "description": "Applies retry strategies on task failures.",
        "source_location": "docs/architecture.md"
    },
    {
        "source": "backend",
        "target": "orphan_recovery",
        "type": "RUNS",
        "label": "checks node heartbeats",
        "description": "Periodically sweeps for unresponsive nodes.",
        "source_location": "docs/architecture.md"
    }
]

semantic_data = {
    "nodes": nodes,
    "edges": edges,
    "hyperedges": [],
    "input_tokens": 0,
    "output_tokens": 0
}

Path('graphify-out/.graphify_semantic.json').write_text(
    json.dumps(semantic_data, indent=2, ensure_ascii=False),
    encoding='utf-8'
)
print("Semantic extraction completed successfully.")
