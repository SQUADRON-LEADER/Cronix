import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  RefreshCw,
  Trash2,
  Eye,
  MoreVertical,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, ConfirmDialog, SearchInput, ListSkeleton } from '@/components/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { useDeadLetterJobs, useRetryDlqJob, useDeleteDlqJob } from '@/hooks';
import type { DeadLetterJob } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DeadLetterQueuePage() {
  const { data: dlqJobs, isLoading } = useDeadLetterJobs();
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<DeadLetterJob | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'retry' | 'delete';
    job: DeadLetterJob | null;
  }>({ open: false, type: 'retry', job: null });

  const retryDlqJob = useRetryDlqJob();
  const deleteDlqJob = useDeleteDlqJob();

  const filteredJobs = dlqJobs?.data.filter(
    (job) =>
      job.jobName.toLowerCase().includes(search.toLowerCase()) ||
      job.queueName.toLowerCase().includes(search.toLowerCase()) ||
      job.error.toLowerCase().includes(search.toLowerCase())
  );

  const handleRetry = (job: DeadLetterJob) => {
    setConfirmDialog({ open: true, type: 'retry', job });
  };

  const handleDelete = (job: DeadLetterJob) => {
    setConfirmDialog({ open: true, type: 'delete', job });
  };

  const confirmAction = () => {
    if (!confirmDialog.job) return;
    if (confirmDialog.type === 'retry') {
      retryDlqJob.mutate(confirmDialog.job.id);
    } else {
      deleteDlqJob.mutate(confirmDialog.job.id);
    }
    setConfirmDialog({ open: false, type: 'retry', job: null });
    setDrawerOpen(false);
  };

  const handleViewJob = (job: DeadLetterJob) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Dead Letter Queue</h1>
          <p className="page-description">Failed jobs that exceeded max retries</p>
        </div>
        <ListSkeleton count={4} />
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
            <h1 className="page-title">Dead Letter Queue</h1>
            <p className="page-description">Failed jobs that exceeded max retries</p>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search failed jobs..."
              className="w-64"
            />
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-coral/20 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-coral" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Failed</p>
              <p className="text-2xl font-bold text-cronix-text">{dlqJobs?.data.length || 0}</p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-teal" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Recoverable</p>
              <p className="text-2xl font-bold text-teal">
                {dlqJobs?.data.filter((j) => j.canRetry).length || 0}
              </p>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Recent (24h)</p>
              <p className="text-2xl font-bold text-cronix-text">
                {dlqJobs?.data.filter((j) => {
                  const failedAt = new Date(j.failedAt);
                  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                  return failedAt > dayAgo;
                }).length || 0}
              </p>
            </div>
          </div>
        </motion.div>

        {filteredJobs?.length === 0 ? (
          <EmptyState
            icon={AlertOctagon}
            title="No dead letter jobs"
            description="Great! No jobs have failed beyond recovery."
          />
        ) : (
          <motion.div variants={item} className="space-y-4">
            {filteredJobs?.map((job) => (
              <motion.div
                key={job.id}
                variants={item}
                whileHover={{ scale: 1.01 }}
                className="glass-card glass-hover rounded-xl p-4 cursor-pointer"
                onClick={() => handleViewJob(job)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-coral/20 flex items-center justify-center flex-shrink-0">
                      <AlertOctagon className="w-6 h-6 text-coral" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-cronix-text truncate">{job.jobName}</h3>
                        {job.canRetry && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal/20 text-teal">
                            Recoverable
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Queue: {job.queueName} | Project: {job.projectName}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-coral" />
                          {job.attempts} attempts
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(job.failedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
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
                      {job.canRetry && (
                        <DropdownMenuItem
                          className="cursor-pointer text-teal"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetry(job);
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retry Job
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        className="cursor-pointer text-coral"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(job);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-coral/10 border border-coral/20">
                  <p className="text-sm text-coral font-mono">{job.error}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="glass-card border-t border-white/10 max-h-[85vh]">
          <DrawerHeader className="border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-coral/20 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6 text-coral" />
              </div>
              <div>
                <DrawerTitle className="text-xl text-white">
                  {selectedJob?.jobName}
                </DrawerTitle>
                <p className="text-sm text-muted-foreground">{selectedJob?.id}</p>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedJob && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Queue</p>
                    <p className="font-medium text-white">{selectedJob.queueName}</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Project</p>
                    <p className="font-medium text-white">{selectedJob.projectName}</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Attempts</p>
                    <p className="font-medium text-coral">{selectedJob.attempts}</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="font-medium text-coral">Failed</p>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-xl border-coral/30">
                  <h4 className="text-sm font-medium text-coral mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Error Message
                  </h4>
                  <p className="text-sm text-muted-foreground font-mono bg-coral/10 p-3 rounded-lg">
                    {selectedJob.error}
                  </p>
                </div>

                <div className="glass-card p-4 rounded-xl">
                  <h4 className="text-sm font-medium text-white mb-3">Payload</h4>
                  <pre className="text-xs text-muted-foreground font-mono bg-white/5 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedJob.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="border-t border-white/10 pt-4">
            <div className="flex gap-3 justify-end">
              {selectedJob?.canRetry && (
                <Button
                  onClick={() => selectedJob && handleRetry(selectedJob)}
                  className="btn-primary"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Job
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => selectedJob && handleDelete(selectedJob)}
                className="btn-secondary text-coral"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setDrawerOpen(false)}
                className="btn-secondary"
              >
                Close
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.type === 'retry' ? 'Retry Job?' : 'Delete Job?'}
        description={
          confirmDialog.type === 'retry'
            ? 'This will requeue the job for processing. Are you sure?'
            : 'This action cannot be undone. The job will be permanently deleted.'
        }
        variant={confirmDialog.type === 'delete' ? 'destructive' : 'default'}
        confirmLabel={confirmDialog.type === 'retry' ? 'Retry' : 'Delete'}
        onConfirm={confirmAction}
      />
    </div>
  );
}
