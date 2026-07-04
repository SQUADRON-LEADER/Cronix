import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import {
  ListTodo,
  Clock,
  Server,
  Layers,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Calendar,
  Timer,
  Hash,
} from 'lucide-react';
import { StatusChip, getStatusVariant } from '@/components/common';

interface JobDetailsDrawerProps {
  job: import('@/types').Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: (jobId: string) => void;
  onCancel: (jobId: string) => void;
}

export function JobDetailsDrawer({
  job,
  open,
  onOpenChange,
  onRetry,
  onCancel,
}: JobDetailsDrawerProps) {
  if (!job) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="glass-card border-t border-white/10 max-h-[85vh]">
        <DrawerHeader className="border-b border-white/10 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-teal flex items-center justify-center">
                <ListTodo className="w-6 h-6 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl text-white">{job.name}</DrawerTitle>
                <p className="text-sm text-muted-foreground">{job.id}</p>
              </div>
            </div>
            <StatusChip
              status={job.status}
              variant={getStatusVariant(job.status)}
              pulse={job.status === 'running'}
            />
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs">Queue</span>
                </div>
                <p className="font-medium text-white">{job.queueName}</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Server className="w-4 h-4" />
                  <span className="text-xs">Worker</span>
                </div>
                <p className="font-medium text-white">{job.workerName || '-'}</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Hash className="w-4 h-4" />
                  <span className="text-xs">Priority</span>
                </div>
                <p className="font-medium text-white">{job.priority}</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-xs">Attempts</span>
                </div>
                <p className="font-medium text-white">
                  {job.attempts}/{job.maxAttempts}
                </p>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal" />
                Timeline
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'Created', value: job.createdAt, icon: Calendar },
                  { label: 'Scheduled', value: job.scheduledAt, icon: Clock },
                  { label: 'Started', value: job.startedAt, icon: Timer },
                  { label: 'Completed', value: job.completedAt, icon: CheckCircle2 },
                ].map(
                  (item) =>
                    item.value && (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <item.icon className="w-3.5 h-3.5" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="text-sm text-white">
                          {new Date(item.value).toLocaleString()}
                        </span>
                      </div>
                    )
                )}
                {job.duration && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-muted-foreground text-sm">Duration</span>
                    <span className="text-sm font-medium text-teal">{job.duration}ms</span>
                  </div>
                )}
              </div>
            </div>

            {job.error && (
              <div className="glass-card p-4 rounded-xl border-coral/30">
                <h4 className="text-sm font-medium text-coral mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Error
                </h4>
                <p className="text-sm text-muted-foreground font-mono bg-coral/10 p-3 rounded-lg">
                  {job.error}
                </p>
              </div>
            )}

            <div className="glass-card p-4 rounded-xl">
              <h4 className="text-sm font-medium text-white mb-3">Payload</h4>
              <pre className="text-xs text-muted-foreground font-mono bg-white/5 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(job.payload, null, 2)}
              </pre>
            </div>

            {job.result && (
              <div className="glass-card p-4 rounded-xl">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                  Result
                </h4>
                <pre className="text-xs text-muted-foreground font-mono bg-white/5 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(job.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <DrawerFooter className="border-t border-white/10 pt-4">
          <div className="flex gap-3 justify-end">
            {(job.status === 'failed' || job.status === 'retrying') && (
              <Button
                onClick={() => onRetry(job.id)}
                className="btn-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Job
              </Button>
            )}
            {(job.status === 'pending' || job.status === 'queued') && (
              <Button
                onClick={() => onCancel(job.id)}
                variant="outline"
                className="btn-secondary text-coral"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Job
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="btn-secondary"
            >
              Close
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
