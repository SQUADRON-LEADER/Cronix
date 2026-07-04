export type JobStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'retrying' | 'cancelled';
export type WorkerStatus = 'online' | 'offline' | 'busy' | 'error';
export type QueueStatus = 'active' | 'paused' | 'draining';
export type ProjectStatus = 'active' | 'inactive' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  queueCount: number;
  jobCount: number;
  workerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Queue {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  status: QueueStatus;
  priority: number;
  jobsPending: number;
  jobsProcessing: number;
  jobsCompleted: number;
  jobsFailed: number;
  throughput: number;
  avgLatency: number;
  createdAt: string;
}

export interface Job {
  id: string;
  name: string;
  queueId: string;
  queueName: string;
  projectId: string;
  projectName: string;
  status: JobStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  workerId?: string;
  workerName?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  name: string;
  status: WorkerStatus;
  queues: string[];
  queuesNames: string[];
  currentJob?: Job;
  jobsCompleted: number;
  jobsFailed: number;
  lastHeartbeat: string;
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  version: string;
  metadata: Record<string, unknown>;
}

export interface ExecutionLog {
  id: string;
  jobId: string;
  jobName: string;
  queueId: string;
  queueName: string;
  workerId: string;
  workerName: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface DeadLetterJob {
  id: string;
  originalJobId: string;
  jobName: string;
  queueId: string;
  queueName: string;
  projectId: string;
  projectName: string;
  error: string;
  attempts: number;
  failedAt: string;
  payload: Record<string, unknown>;
  canRetry: boolean;
}

export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface QueueMetrics {
  queueId: string;
  queueName: string;
  throughput: MetricPoint[];
  latency: MetricPoint[];
  queueDepth: MetricPoint[];
  successRate: MetricPoint[];
}

export interface DashboardMetrics {
  totalJobs: number;
  jobsCompleted: number;
  jobsFailed: number;
  jobsPending: number;
  jobsRunning: number;
  totalWorkers: number;
  workersOnline: number;
  totalQueues: number;
  queuesActive: number;
  throughput: number;
  avgLatency: number;
  successRate: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
