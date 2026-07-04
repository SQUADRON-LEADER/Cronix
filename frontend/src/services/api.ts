import axios from 'axios';
import type {
  PaginationParams,
  PaginatedResponse,
  Project,
  Queue,
  Job,
  Worker,
  ExecutionLog,
  DeadLetterJob,
  DashboardMetrics,
  MetricPoint,
  User,
} from '@/types';
import {
  mockProjects,
  mockQueues,
  mockJobs,
  mockWorkers,
  mockExecutionLogs,
  mockDeadLetterJobs,
  mockDashboardMetrics,
  mockThroughputData,
  mockLatencyData,
  mockQueueDepthData,
  mockJobsByStatus,
  mockJobsByQueue,
  mockWorkerHealth,
  mockHourlyJobs,
} from './mockData';

// ── Axios instance ────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && token !== 'demo-token-cronix-2024') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      const token = localStorage.getItem('auth_token');
      if (token !== 'demo-token-cronix-2024') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Helper: wrap mock as axios-like response ──────────────────
const mock = <T>(data: T): { data: T } => ({ data });

const paginate = <T>(
  items: T[],
  params?: PaginationParams
): PaginatedResponse<T> => {
  const page  = params?.page  ?? 1;
  const limit = params?.limit ?? 20;
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);
  return {
    data:       slice,
    total:      items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit),
  };
};

// ── Flag: is backend reachable? (Force false for Frontend Mock mode) ──
async function isBackendOnline(): Promise<boolean> {
  return false;
}

// ── Projects ──────────────────────────────────────────────────
export const projectsApi = {
  getAll: async () => {
    if (await isBackendOnline()) return api.get<Project[]>('/projects');
    return mock(mockProjects);
  },
  getById: async (id: string) => {
    if (await isBackendOnline()) return api.get<Project>(`/projects/${id}`);
    return mock(mockProjects.find((p) => p.id === id) ?? mockProjects[0]);
  },
  create: async (data: Partial<Project>) => {
    if (await isBackendOnline()) return api.post<Project>('/projects', data);
    const newProject: Project = {
      id: `proj-${Math.floor(Math.random() * 1000)}`,
      name: data.name || 'New Project',
      description: data.description || '',
      status: 'active',
      queueCount: 0,
      jobCount: 0,
      workerCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProjects.push(newProject);
    return mock(newProject);
  },
  update: async (id: string, data: Partial<Project>) => {
    if (await isBackendOnline()) return api.put<Project>(`/projects/${id}`, data);
    const proj = mockProjects.find((p) => p.id === id) ?? mockProjects[0];
    if (data.name) proj.name = data.name;
    if (data.description) proj.description = data.description;
    return mock(proj);
  },
  delete: async (id: string) => {
    if (await isBackendOnline()) return api.delete<{ success: boolean }>(`/projects/${id}`);
    const index = mockProjects.findIndex((p) => p.id === id);
    if (index !== -1) mockProjects.splice(index, 1);
    return mock({ success: true });
  },
};

// ── Queues ────────────────────────────────────────────────────
export const queuesApi = {
  getAll: async () => {
    if (await isBackendOnline()) return api.get<Queue[]>('/queues');
    return mock(mockQueues);
  },
  getById: async (id: string) => {
    if (await isBackendOnline()) return api.get<Queue>(`/queues/${id}`);
    return mock(mockQueues.find((q) => q.id === id) ?? mockQueues[0]);
  },
  pause: async (id: string) => {
    if (await isBackendOnline()) return api.post<Queue>(`/queues/${id}/pause`);
    const q = mockQueues.find((item) => item.id === id) ?? mockQueues[0];
    q.status = 'paused';
    return mock(q);
  },
  resume: async (id: string) => {
    if (await isBackendOnline()) return api.post<Queue>(`/queues/${id}/resume`);
    const q = mockQueues.find((item) => item.id === id) ?? mockQueues[0];
    q.status = 'active';
    return mock(q);
  },
  drain: async (id: string) => {
    if (await isBackendOnline()) return api.post<Queue>(`/queues/${id}/drain`);
    const q = mockQueues.find((item) => item.id === id) ?? mockQueues[0];
    q.status = 'draining';
    return mock(q);
  },
};

// ── Jobs ──────────────────────────────────────────────────────
export const jobsApi = {
  getAll: async (params?: PaginationParams) => {
    if (await isBackendOnline()) return api.get<PaginatedResponse<Job>>('/jobs', { params });
    return mock(paginate(mockJobs, params));
  },
  getById: async (id: string) => {
    if (await isBackendOnline()) return api.get<Job>(`/jobs/${id}`);
    return mock(mockJobs.find((j) => j.id === id) ?? mockJobs[0]);
  },
  retry: async (id: string) => {
    if (await isBackendOnline()) return api.post<Job>(`/jobs/${id}/retry`);
    const j = mockJobs.find((item) => item.id === id) ?? mockJobs[0];
    j.status = 'running';
    j.attempts += 1;
    return mock(j);
  },
  cancel: async (id: string) => {
    if (await isBackendOnline()) return api.post<Job>(`/jobs/${id}/cancel`);
    const j = mockJobs.find((item) => item.id === id) ?? mockJobs[0];
    j.status = 'cancelled';
    return mock(j);
  },
  requeue: async (id: string) => {
    if (await isBackendOnline()) return api.post<Job>(`/jobs/${id}/requeue`);
    const j = mockJobs.find((item) => item.id === id) ?? mockJobs[0];
    j.status = 'pending';
    j.attempts = 0;
    return mock(j);
  },
};

// ── Workers ───────────────────────────────────────────────────
export const workersApi = {
  getAll: async () => {
    if (await isBackendOnline()) return api.get<Worker[]>('/workers');
    return mock(mockWorkers);
  },
  getById: async (id: string) => {
    if (await isBackendOnline()) return api.get<Worker>(`/workers/${id}`);
    return mock(mockWorkers.find((w) => w.id === id) ?? mockWorkers[0]);
  },
  restart: async (id: string) => {
    if (await isBackendOnline()) return api.post<Worker>(`/workers/${id}/restart`);
    const w = mockWorkers.find((item) => item.id === id) ?? mockWorkers[0];
    w.status = 'online';
    return mock(w);
  },
  drain: async (id: string) => {
    if (await isBackendOnline()) return api.post<Worker>(`/workers/${id}/drain`);
    const w = mockWorkers.find((item) => item.id === id) ?? mockWorkers[0];
    w.status = 'online';
    return mock(w);
  },
};

// ── Logs ──────────────────────────────────────────────────────
export const logsApi = {
  getAll: async (params?: PaginationParams) => {
    if (await isBackendOnline()) return api.get<PaginatedResponse<ExecutionLog>>('/logs', { params });
    return mock(paginate(mockExecutionLogs, params));
  },
};

// ── DLQ ───────────────────────────────────────────────────────
export const dlqApi = {
  getAll: async () => {
    if (await isBackendOnline()) return api.get<DeadLetterJob[]>('/dlq');
    return mock(mockDeadLetterJobs);
  },
  retry: async (id: string) => {
    if (await isBackendOnline()) return api.post<{ success: boolean }>(`/dlq/${id}/retry`);
    const index = mockDeadLetterJobs.findIndex((item) => item.id === id);
    if (index !== -1) mockDeadLetterJobs.splice(index, 1);
    return mock({ success: true });
  },
  delete: async (id: string) => {
    if (await isBackendOnline()) return api.delete<{ success: boolean }>(`/dlq/${id}`);
    const index = mockDeadLetterJobs.findIndex((item) => item.id === id);
    if (index !== -1) mockDeadLetterJobs.splice(index, 1);
    return mock({ success: true });
  },
  requeue: async (id: string) => {
    if (await isBackendOnline()) return api.post<{ success: boolean }>(`/dlq/${id}/requeue`);
    const index = mockDeadLetterJobs.findIndex((item) => item.id === id);
    if (index !== -1) mockDeadLetterJobs.splice(index, 1);
    return mock({ success: true });
  },
};

// ── Metrics ───────────────────────────────────────────────────
export const metricsApi = {
  getDashboard: async () => {
    if (await isBackendOnline()) return api.get<DashboardMetrics>('/metrics/dashboard');
    return mock(mockDashboardMetrics);
  },
  getThroughput: async () => {
    if (await isBackendOnline()) return api.get<MetricPoint[]>('/metrics/throughput');
    return mock(mockThroughputData);
  },
  getLatency: async () => {
    if (await isBackendOnline()) return api.get<MetricPoint[]>('/metrics/latency');
    return mock(mockLatencyData);
  },
  getQueueDepth: async () => {
    if (await isBackendOnline()) return api.get<MetricPoint[]>('/metrics/queue-depth');
    return mock(mockQueueDepthData);
  },
  getJobsByStatus: async () => {
    if (await isBackendOnline()) return api.get<{ status: string; count: number }[]>('/metrics/jobs-by-status');
    return mock(mockJobsByStatus);
  },
  getJobsByQueue: async () => {
    if (await isBackendOnline()) return api.get<{ name: string; value: number }[]>('/metrics/jobs-by-queue');
    return mock(mockJobsByQueue);
  },
  getWorkerHealth: async () => {
    if (await isBackendOnline()) return api.get<{ name: string; value: number }[]>('/metrics/worker-health');
    return mock(mockWorkerHealth);
  },
  getHourlyJobs: async () => {
    if (await isBackendOnline())
      return api.get<{ hour: string; completed: number; failed: number }[]>('/metrics/hourly-jobs');
    return mock(mockHourlyJobs);
  },
};

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string) => {
    if (await isBackendOnline()) {
      return api.post<{ token: string; user: User }>('/auth/login', { email, password });
    }
    return mock({
      token: 'demo-token-cronix-2024',
      user: {
        id: 'user-demo-1',
        email,
        name: 'Alex Chen',
        role: 'admin' as const,
      },
    });
  },
  register: async (email: string, password: string, name: string) => {
    if (await isBackendOnline()) {
      return api.post<{ token: string; user: User }>('/auth/register', { email, password, name });
    }
    return mock({
      token: 'demo-token-cronix-2024',
      user: {
        id: 'user-demo-1',
        email,
        name,
        role: 'admin' as const,
      },
    });
  },
  logout: async () => {
    if (await isBackendOnline()) {
      return api.post<{ success: boolean }>('/auth/logout');
    }
    return mock({ success: true });
  },
  me: async () => {
    if (await isBackendOnline()) {
      return api.get<User>('/auth/me');
    }
    return mock({
      id: 'user-demo-1',
      email: 'demo@cronix.dev',
      name: 'Alex Chen',
      role: 'admin' as const,
    });
  },
};
