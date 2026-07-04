import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ListTodo,
  RefreshCw,
  XCircle,
  MoreVertical,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusChip, getStatusVariant, SearchInput, EmptyState } from '@/components/common';
import { JobDetailsDrawer } from './JobDetailsDrawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useJobs, useRetryJob, useCancelJob } from '@/hooks';
import { cn } from '@/lib/utils';
import type { Job, JobStatus } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const statusFilters: JobStatus[] = ['pending', 'queued', 'running', 'completed', 'failed', 'retrying'];

export function JobsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: jobs, isLoading } = useJobs({ page, limit: 15, search });
  const retryJob = useRetryJob();
  const cancelJob = useCancelJob();

  const filteredJobs = jobs?.data.data.filter(
    (job) => statusFilter === 'all' || job.status === statusFilter
  );

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  const handleRetry = (jobId: string) => {
    retryJob.mutate(jobId);
  };

  const handleCancel = (jobId: string) => {
    cancelJob.mutate(jobId);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Jobs</h1>
          <p className="page-description">Monitor and manage job execution</p>
        </div>
        <div className="loading-skeleton h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item} className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="page-title">Jobs</h1>
            <p className="page-description">Monitor and manage job execution</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                {statusFilters.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search jobs..."
              className="w-64"
            />
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusFilters.map((status) => {
            const count = filteredJobs?.filter((j) => j.status === status).length || 0;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                className={cn(
                  'glass-card p-4 rounded-xl text-center transition-all hover:scale-105',
                  statusFilter === status && 'ring-2 ring-[#6C63FF]'
                )}
              >
                <StatusChip status={status} variant={getStatusVariant(status)} />
                <p className="text-2xl font-bold text-cronix-text mt-2">{count}</p>
              </button>
            );
          })}
        </motion.div>

        <motion.div variants={item} className="glass-card rounded-2xl overflow-hidden">
          {filteredJobs?.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No jobs found"
              description="No jobs match your current filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Queue</th>
                    <th>Status</th>
                    <th>Attempts</th>
                    <th>Worker</th>
                    <th>Duration</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs?.map((job) => (
                    <motion.tr
                      key={job.id}
                      variants={item}
                      className="cursor-pointer"
                      onClick={() => handleViewJob(job)}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#163177]/10 flex items-center justify-center">
                            <ListTodo className="w-4 h-4 text-[#6C63FF]" />
                          </div>
                          <div>
                            <p className="font-medium text-cronix-text">{job.name}</p>
                            <p className="text-xs text-muted-foreground">{job.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted-foreground">{job.queueName}</td>
                      <td>
                        <StatusChip
                          status={job.status}
                          variant={getStatusVariant(job.status)}
                          pulse={job.status === 'running'}
                        />
                      </td>
                      <td>
                        <span className="text-cronix-text">{job.attempts}</span>
                        <span className="text-muted-foreground">/{job.maxAttempts}</span>
                      </td>
                      <td className="text-muted-foreground">
                        {job.workerName || '-'}
                      </td>
                      <td className="text-muted-foreground">
                        {job.duration ? `${job.duration}ms` : '-'}
                      </td>
                      <td className="text-muted-foreground text-sm">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="text-muted-foreground">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-card border-white/10">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewJob(job);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {(job.status === 'failed' || job.status === 'retrying') && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRetry(job.id);
                                }}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry Job
                              </DropdownMenuItem>
                            )}
                            {(job.status === 'pending' || job.status === 'queued') && (
                              <DropdownMenuItem
                                className="cursor-pointer text-coral"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancel(job.id);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Job
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {jobs?.data.totalPages && jobs.data.totalPages > 1 && (
          <motion.div variants={item} className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary"
            >
              Previous
            </Button>
            <span className="text-muted-foreground text-sm">
              Page {page} of {jobs.data.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === jobs.data.totalPages}
              className="btn-secondary"
            >
              Next
            </Button>
          </motion.div>
        )}
      </motion.div>

      <JobDetailsDrawer
        job={selectedJob}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onRetry={handleRetry}
        onCancel={handleCancel}
      />
    </div>
  );
}
