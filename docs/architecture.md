# Cronix Distributed Job Scheduler: System Architecture

This document describes the structural architecture, database schemas, and claiming mechanisms implemented in the Cronix project.

---

## Architecture Design Principles

Cronix follows **Clean Architecture** patterns, separating business logic from frameworks, UI, and databases.

```
       +---------------------------------------------+
       |                 Presentation                |
       |  (REST Controllers, DTOs, STOMP WebSockets) |
       +----------------------v----------------------+
                              |
       +----------------------v----------------------+
       |                  Application                |
       |       (Use Cases, Transactional Services)   |
       +----------------------v----------------------+
                              |
       +----------------------v----------------------+
       |                    Domain                   |
       |        (Pure Entities, Interface Ports)     |
       +---------------------------------------------+
                              ^
       +----------------------|----------------------+
       |                Infrastructure               |
       |  (Spring Data JPA, PostgreSQL, STOMP Broker)|
       +---------------------------------------------+
```

### Module Boundaries
1. **Domain**: Clean Java classes representing scheduler models (`Job`, `Queue`, `Worker`, `ScheduledJob`). It contains no frameworks, JPA annotations, or library dependencies (except Lombok).
2. **Application**: Contains the application logic, orchestrating DTO mappers and managing entities.
3. **Infrastructure**: Framework adapters. Includes Spring Security, JWT token parsers, PostgreSQL persistence entities, Redis caching, STOMP WebSocket configurations, and worker polling loops.
4. **Presentation**: Exposes API endpoints, handles request validation, handles global exception mapping, and manages STOMP routes.

---

## Database Schema (ER Diagram)

Below is the entity relationship model mapping organizations, projects, queues, jobs, and executions.

```mermaid
erDiagram
    ORGANIZATIONS {
        uuid id PK
        varchar name
        text description
        timestamp created_at
    }
    USERS {
        uuid id PK
        varchar email UK
        varchar name
        varchar password_hash
        varchar role
        timestamp created_at
    }
    ORGANIZATION_MEMBERS {
        uuid organization_id FK
        uuid user_id FK
        varchar role
    }
    PROJECTS {
        uuid id PK
        varchar name
        text description
        varchar status
        uuid organization_id FK
        timestamp created_at
    }
    QUEUES {
        uuid id PK
        varchar name
        uuid project_id FK
        varchar status
        integer priority
        integer max_concurrency
        varchar retry_policy_type
        integer retry_base_delay_sec
        integer retry_max_delay_sec
        integer retry_max_attempts
        timestamp created_at
    }
    JOBS {
        uuid id PK
        varchar name
        uuid queue_id FK
        varchar status
        integer priority
        integer attempts
        integer max_attempts
        jsonb payload
        jsonb result
        text error_message
        uuid worker_id FK
        timestamp scheduled_at
        timestamp started_at
        timestamp completed_at
        timestamp created_at
    }
    SCHEDULED_JOBS {
        uuid id PK
        varchar name
        uuid queue_id FK
        varchar cron_expression
        jsonb payload
        integer priority
        integer max_attempts
        timestamp last_run_at
        timestamp next_run_at
    }
    DEAD_LETTER_JOBS {
        uuid id PK
        uuid original_job_id
        uuid queue_id FK
        varchar job_name
        text error_message
        integer attempts
        timestamp failed_at
        jsonb payload
        boolean can_retry
    }
    WORKERS {
        uuid id PK
        varchar name UK
        varchar status
        timestamp last_heartbeat
        bigint uptime_seconds
        double cpu_usage
        double memory_usage
        varchar version
        jsonb metadata
    }
    WORKER_QUEUES {
        uuid worker_id FK
        uuid queue_id FK
    }
    JOB_EXECUTIONS {
        uuid id PK
        uuid job_id
        varchar job_name
        uuid queue_id
        varchar queue_name
        uuid worker_id
        varchar worker_name
        varchar level
        text message
        timestamp timestamp
        integer duration_ms
        jsonb metadata
    }

    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : owns
    USERS ||--o{ ORGANIZATION_MEMBERS : joins
    ORGANIZATIONS ||--o{ PROJECTS : groups
    PROJECTS ||--o{ QUEUES : contains
    QUEUES ||--o{ JOBS : enqueues
    QUEUES ||--o{ SCHEDULED_JOBS : triggers
    QUEUES ||--o{ DEAD_LETTER_JOBS : discards
    WORKERS ||--o{ WORKER_QUEUES : subscribes
    QUEUES ||--o{ WORKER_QUEUES : routes
    WORKERS ||--o{ JOBS : claims
```

---

## Concurrency & Distributed Claiming

To prevent race conditions where multiple distributed worker threads claim the same job, Cronix uses PostgreSQL's native `FOR UPDATE SKIP LOCKED` transaction query.

### Sequence Flow of Atomic Claim

```mermaid
sequencePanel
    loop Every 1000ms
        WorkerPoller->>QueueRepository: Check Queue Concurrency (running < max)
        opt Concurrency OK
            WorkerPoller->>JobClaimer: claimJob(queueId, workerId)
            activate JobClaimer
            Note over JobClaimer: Start REQUIRES_NEW Transaction
            JobClaimer->>PostgreSQL: Query next queued job (FOR UPDATE SKIP LOCKED)
            alt Job Found
                PostgreSQL-->>JobClaimer: Return Job Row (Locked)
                JobClaimer->>PostgreSQL: UPDATE job set status='running', worker_id=workerId, started_at=now
                JobClaimer-->>WorkerPoller: Return claimed Job Details
                Note over JobClaimer: Commit Transaction & Release DB Lock
                deactivate JobClaimer
                WorkerPoller->>ThreadPool: Submit execution task asynchronously
                activate ThreadPool
                ThreadPool->>JobExecution: Run Simulated Workload
                ThreadPool->>PostgreSQL: UPDATE job set status='completed', completed_at=now
                ThreadPool->>PostgreSQL: INSERT INTO job_executions (Log)
                deactivate ThreadPool
            else No Job
                PostgreSQL-->>JobClaimer: Return empty
                Note over JobClaimer: Commit Transaction
                JobClaimer-->>WorkerPoller: Return empty
                deactivate JobClaimer
            end
        end
    end
```

### Advantages of this approach:
- **No external lock latency**: Avoids network hops to external distributed lock providers (like Zookeeper or Redis Redlock) for each claim operation.
- **Instant lock release**: By wrapping the query and status update in a short `REQUIRES_NEW` transaction, the lock on the row is held for less than a millisecond, freeing resources immediately while execution proceeds inside a thread pool.
- **Never blocks workers**: Using `SKIP LOCKED` ensures that if a row is currently being locked by another worker node, subsequent queries simply skip it and fetch the next item, avoiding lock wait queues.
