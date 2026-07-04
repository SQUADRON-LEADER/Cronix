import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { LoginPage, RegisterPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { ProjectsPage } from '@/pages/projects';
import { QueuesPage } from '@/pages/queues';
import { JobsPage } from '@/pages/jobs';
import { WorkersPage } from '@/pages/workers';
import { ExecutionLogsPage } from '@/pages/logs';
import { DeadLetterQueuePage } from '@/pages/dlq';
import { MetricsPage } from '@/pages/metrics';
import { SettingsPage } from '@/pages/settings';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'queues',
        element: <QueuesPage />,
      },
      {
        path: 'jobs',
        element: <JobsPage />,
      },
      {
        path: 'workers',
        element: <WorkersPage />,
      },
      {
        path: 'scheduled',
        element: <JobsPage />,
      },
      {
        path: 'retry-queue',
        element: <JobsPage />,
      },
      {
        path: 'dlq',
        element: <DeadLetterQueuePage />,
      },
      {
        path: 'logs',
        element: <ExecutionLogsPage />,
      },
      {
        path: 'metrics',
        element: <MetricsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
