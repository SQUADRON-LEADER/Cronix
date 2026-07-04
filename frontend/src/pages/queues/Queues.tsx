import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Pause,
  Play,
  MoreVertical,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusChip, getStatusVariant, SearchInput, TableSkeleton } from '@/components/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQueues, usePauseQueue, useResumeQueue } from '@/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function QueuesPage() {
  const { data: queues, isLoading } = useQueues();
  const [search, setSearch] = useState('');
  const pauseQueue = usePauseQueue();
  const resumeQueue = useResumeQueue();

  const filteredQueues = queues?.data.filter(
    (q) =>
      q.name.toLowerCase().includes(search.toLowerCase()) ||
      q.projectName.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Queues</h1>
          <p className="page-description">Manage job queues and throughput</p>
        </div>
        <TableSkeleton rows={5} columns={6} />
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
        <motion.div variants={item} className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Queues</h1>
            <p className="page-description">Manage job queues and throughput</p>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search queues..."
              className="w-64"
            />
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Queues', value: queues?.data.length || 0, icon: Layers, color: 'text-teal' },
            { label: 'Active', value: queues?.data.filter(q => q.status === 'active').length || 0, icon: CheckCircle2, color: 'text-teal' },
            { label: 'Paused', value: queues?.data.filter(q => q.status === 'paused').length || 0, icon: Pause, color: 'text-amber-400' },
            { label: 'Total Pending', value: queues?.data.reduce((sum, q) => sum + q.jobsPending, 0) || 0, icon: Clock, color: 'text-purple-400' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <stat.icon className={cn('w-5 h-5', stat.color)} />
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={item} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Queue</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Jobs</th>
                  <th>Throughput</th>
                  <th>Avg Latency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueues?.map((queue) => (
                  <tr key={queue.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-teal" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{queue.name}</p>
                          <p className="text-xs text-muted-foreground">Priority: {queue.priority}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{queue.projectName}</td>
                    <td>
                      <StatusChip
                        status={queue.status}
                        variant={getStatusVariant(queue.status)}
                        pulse={queue.status === 'active'}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{queue.jobsPending}</span>
                        <span className="text-muted-foreground">pending</span>
                        <span className="text-teal">{queue.jobsProcessing}</span>
                        <span className="text-muted-foreground">processing</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-teal" />
                        <span className="text-white font-medium">{queue.throughput}/m</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={cn(
                          'font-medium',
                          queue.avgLatency < 100 && 'text-teal',
                          queue.avgLatency >= 100 && queue.avgLatency < 500 && 'text-amber-400',
                          queue.avgLatency >= 500 && 'text-coral'
                        )}
                      >
                        {queue.avgLatency}ms
                      </span>
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-card border-white/10">
                          {queue.status === 'active' ? (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => pauseQueue.mutate(queue.id)}
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Pause Queue
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => resumeQueue.mutate(queue.id)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Resume Queue
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="cursor-pointer text-coral">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Drain Queue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
