-- Database Schema DDL for Cronix Distributed Job Scheduler
-- PostgreSQL Compatibility

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- admin, member, viewer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organization Members Table
CREATE TABLE IF NOT EXISTS organization_members (
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (organization_id, user_id)
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, archived
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Queues Table
CREATE TABLE IF NOT EXISTS queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, paused, draining
    priority INTEGER NOT NULL DEFAULT 0,
    max_concurrency INTEGER NOT NULL DEFAULT 5,
    retry_policy_type VARCHAR(50) NOT NULL DEFAULT 'FIXED', -- FIXED, LINEAR, EXPONENTIAL
    retry_base_delay_sec INTEGER NOT NULL DEFAULT 5,
    retry_max_delay_sec INTEGER NOT NULL DEFAULT 300,
    retry_max_attempts INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, name)
);

-- Workers Table
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL, -- online, offline, busy, error, draining
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uptime_seconds BIGINT NOT NULL DEFAULT 0,
    cpu_usage DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    memory_usage DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    version VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    queue_id UUID NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, queued, running, completed, failed, retrying, cancelled
    priority INTEGER NOT NULL DEFAULT 0,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    payload JSONB,
    result JSONB,
    error_message TEXT,
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled Jobs (Cron/Recurring Jobs)
CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    queue_id UUID NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
    cron_expression VARCHAR(255) NOT NULL,
    payload JSONB,
    priority INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dead Letter Jobs (DLQ)
CREATE TABLE IF NOT EXISTS dead_letter_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_job_id UUID NOT NULL,
    queue_id UUID NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
    job_name VARCHAR(255) NOT NULL,
    error_message TEXT,
    attempts INTEGER NOT NULL,
    failed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payload JSONB,
    can_retry BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Worker Queues (Association for worker queue subscription)
CREATE TABLE IF NOT EXISTS worker_queues (
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    queue_id UUID NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
    PRIMARY KEY (worker_id, queue_id)
);

-- Job Execution Logs
CREATE TABLE IF NOT EXISTS job_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    queue_id UUID NOT NULL,
    queue_name VARCHAR(255) NOT NULL,
    worker_id UUID,
    worker_name VARCHAR(255),
    level VARCHAR(50) NOT NULL, -- info, warn, error, debug
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_ms INTEGER,
    metadata JSONB
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- info, warning, error, success
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_jobs_status_queue_scheduled ON jobs (status, queue_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_id ON jobs (queue_id);
CREATE INDEX IF NOT EXISTS idx_jobs_worker_id ON jobs (worker_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_next_run ON scheduled_jobs (next_run_at);
CREATE INDEX IF NOT EXISTS idx_workers_last_heartbeat ON workers (last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_job_executions_job_id ON job_executions (job_id);
CREATE INDEX IF NOT EXISTS idx_job_executions_timestamp ON job_executions (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read);


-- Seeding Initial Data for Development
-- Pre-hashed bcrypt values:
-- 'admin123' -> $2a$10$8.UnVuG9HHgffUDAlk8GP.3nS356N78553p8K4.yvK5k9x7e02Cki
-- 'member123' -> $2a$10$eE6hSOmvL64N03tC.7m8.eFj7h3eK1.o4z2R1G2Gk1u7jVn02e3yK

INSERT INTO users (id, email, name, password_hash, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@cronix.com', 'John Doe', '$2a$10$8.UnVuG9HHgffUDAlk8GP.3nS356N78553p8K4.yvK5k9x7e02Cki', 'admin'),
('22222222-2222-2222-2222-222222222222', 'member@cronix.com', 'Jane Smith', '$2a$10$eE6hSOmvL64N03tC.7m8.eFj7h3eK1.o4z2R1G2Gk1u7jVn02e3yK', 'member')
ON CONFLICT (email) DO NOTHING;

INSERT INTO organizations (id, name, description) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cronix Global', 'Primary enterprise organization for scheduling')
ON CONFLICT DO NOTHING;

INSERT INTO organization_members (organization_id, user_id, role) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'admin'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'member')
ON CONFLICT DO NOTHING;

-- Seed Projects (matching mock projects in mockData.ts)
INSERT INTO projects (id, name, description, status, organization_id) VALUES
('33333333-3333-3333-3333-333333333333', 'E-Commerce Platform', 'Main e-commerce backend services', 'active', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('44444444-4444-4444-4444-444444444444', 'Payment Processing', 'Payment gateway and transaction handling', 'active', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('55555555-5555-5555-5555-555555555555', 'Data Analytics', 'Data pipeline and analytics jobs', 'active', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('66666666-6666-6666-6666-666666666666', 'Email Service', 'Email notification and marketing', 'inactive', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('77777777-7777-7777-7777-777777777777', 'Legacy Integration', 'Legacy system migration tasks', 'archived', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
ON CONFLICT DO NOTHING;

-- Seed Queues (matching mock queues)
INSERT INTO queues (id, name, project_id, status, priority, max_concurrency, retry_policy_type, retry_base_delay_sec, retry_max_delay_sec, retry_max_attempts) VALUES
('b1111111-1111-1111-1111-111111111111', 'primary-queue', '33333333-3333-3333-3333-333333333333', 'active', 10, 10, 'LINEAR', 5, 60, 3),
('b2222222-2222-2222-2222-222222222222', 'payment-critical', '44444444-4444-4444-4444-444444444444', 'active', 20, 15, 'FIXED', 3, 10, 5),
('b3333333-3333-3333-3333-333333333333', 'data-pipeline', '55555555-5555-5555-5555-555555555555', 'active', 5, 2, 'EXPONENTIAL', 10, 600, 3),
('b4444444-4444-4444-4444-444444444444', 'email-bulk', '66666666-6666-6666-6666-666666666666', 'paused', 3, 5, 'FIXED', 30, 300, 2),
('b5555555-5555-5555-5555-555555555555', 'retry-queue', '33333333-3333-3333-3333-333333333333', 'active', 2, 5, 'LINEAR', 5, 30, 5)
ON CONFLICT DO NOTHING;

-- Seed Scheduled Jobs
INSERT INTO scheduled_jobs (id, name, queue_id, cron_expression, payload, priority, max_attempts) VALUES
('c1111111-1111-1111-1111-111111111111', 'Daily Sales Report Generator', 'b3333333-3333-3333-3333-333333333333', '0 0 1 * * ?', '{"format": "pdf", "recipient": "executives@cronix.com"}', 5, 3),
('c2222222-2222-2222-2222-222222222222', 'Hourly Cache Invalidation', 'b1111111-1111-1111-1111-111111111111', '0 0 * * * ?', '{"regions": ["all"]}', 10, 2)
ON CONFLICT DO NOTHING;
