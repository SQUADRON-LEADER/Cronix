import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, queuesApi, jobsApi, workersApi, logsApi, dlqApi, metricsApi, authApi } from '@/services/api';
import type { PaginationParams } from '@/types';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof projectsApi.create>[0]) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof projectsApi.update>[1] }) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useQueues = () => {
  return useQuery({
    queryKey: ['queues'],
    queryFn: () => queuesApi.getAll(),
  });
};

export const useQueue = (id: string) => {
  return useQuery({
    queryKey: ['queues', id],
    queryFn: () => queuesApi.getById(id),
    enabled: !!id,
  });
};

export const usePauseQueue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => queuesApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
    },
  });
};

export const useResumeQueue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => queuesApi.resume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] });
    },
  });
};

export const useJobs = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => jobsApi.getAll(params),
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id),
    enabled: !!id,
  });
};

export const useRetryJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useCancelJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useWorkers = () => {
  return useQuery({
    queryKey: ['workers'],
    queryFn: () => workersApi.getAll(),
  });
};

export const useWorker = (id: string) => {
  return useQuery({
    queryKey: ['workers', id],
    queryFn: () => workersApi.getById(id),
    enabled: !!id,
  });
};

export const useRestartWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workersApi.restart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
  });
};

export const useExecutionLogs = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: () => logsApi.getAll(params),
  });
};

export const useDeadLetterJobs = () => {
  return useQuery({
    queryKey: ['dlq'],
    queryFn: () => dlqApi.getAll(),
  });
};

export const useRetryDlqJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dlqApi.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dlq'] });
    },
  });
};

export const useDeleteDlqJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dlqApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dlq'] });
    },
  });
};

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['metrics', 'dashboard'],
    queryFn: () => metricsApi.getDashboard(),
    refetchInterval: 30000,
  });
};

export const useThroughputMetrics = () => {
  return useQuery({
    queryKey: ['metrics', 'throughput'],
    queryFn: () => metricsApi.getThroughput(),
  });
};

export const useLatencyMetrics = () => {
  return useQuery({
    queryKey: ['metrics', 'latency'],
    queryFn: () => metricsApi.getLatency(),
  });
};

export const useJobsByStatus = () => {
  return useQuery({
    queryKey: ['metrics', 'jobs-by-status'],
    queryFn: () => metricsApi.getJobsByStatus(),
  });
};

export const useJobsByQueue = () => {
  return useQuery({
    queryKey: ['metrics', 'jobs-by-queue'],
    queryFn: () => metricsApi.getJobsByQueue(),
  });
};

export const useWorkerHealth = () => {
  return useQuery({
    queryKey: ['metrics', 'worker-health'],
    queryFn: () => metricsApi.getWorkerHealth(),
  });
};

export const useHourlyJobs = () => {
  return useQuery({
    queryKey: ['metrics', 'hourly-jobs'],
    queryFn: () => metricsApi.getHourlyJobs(),
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authApi.register(email, password, name),
  });
};
