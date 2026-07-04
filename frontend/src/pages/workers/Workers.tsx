import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  MoreVertical,
  Activity,
  Cpu,
  HardDrive,
  Play,
  Pause,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusChip, getStatusVariant, SearchInput, EmptyState } from '@/components/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkers, useRestartWorker } from '@/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function WorkersPage() {
  const { data: workers, isLoading } = useWorkers();
  const [search, setSearch] = useState('');
  const restartWorker = useRestartWorker();

  const filteredWorkers = workers?.data.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.queuesNames.some((q) => q.toLowerCase().includes(search.toLowerCase()))
  );

  const onlineCount = workers?.data.filter((w) => w.status === 'online' || w.status === 'busy').length || 0;
  const totalCpu = workers?.data.reduce((sum, w) => sum + w.cpuUsage, 0) || 0;
  const totalMemory = workers?.data.reduce((sum, w) => sum + w.memoryUsage, 0) || 0;

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Workers</h1>
          <p className="page-description">Monitor and manage worker nodes</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="loading-skeleton h-64 rounded-2xl" />
          ))}
        </div>
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
            <h1 className="page-title">Workers</h1>
            <p className="page-description">Monitor and manage worker nodes</p>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search workers..."
              className="w-64"
            />
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-teal" />
              <div>
                <p className="text-muted-foreground text-sm">Total</p>
                <p className="text-2xl font-bold text-cronix-text">{workers?.data.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-teal" />
              <div>
                <p className="text-muted-foreground text-sm">Online</p>
                <p className="text-2xl font-bold text-teal">{onlineCount}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-muted-foreground text-sm">Avg CPU</p>
                <p className="text-2xl font-bold text-cronix-text">
                  {workers?.data.length ? Math.round(totalCpu / workers.data.length) : 0}%
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-muted-foreground text-sm">Avg Memory</p>
                <p className="text-2xl font-bold text-cronix-text">
                  {workers?.data.length ? Math.round(totalMemory / workers.data.length) : 0}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {filteredWorkers?.length === 0 ? (
          <EmptyState
            icon={Server}
            title="No workers found"
            description="No workers match your search criteria."
          />
        ) : (
          <motion.div
            variants={item}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredWorkers?.map((worker) => (
              <motion.div
                key={worker.id}
                variants={item}
                whileHover={{ scale: 1.02 }}
                className="glass-card glass-hover rounded-2xl overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          worker.status === 'online' && 'bg-teal/20',
                          worker.status === 'busy' && 'bg-cyan-500/20',
                          worker.status === 'offline' && 'bg-coral/20',
                          worker.status === 'error' && 'bg-coral/20'
                        )}
                      >
                        <Server
                          className={cn(
                            'w-6 h-6',
                            worker.status === 'online' && 'text-teal',
                            worker.status === 'busy' && 'text-cyan-400',
                            worker.status === 'offline' && 'text-coral',
                            worker.status === 'error' && 'text-coral'
                          )}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-cronix-text">{worker.name}</h3>
                        <StatusChip
                          status={worker.status}
                          variant={getStatusVariant(worker.status)}
                          pulse={worker.status === 'online' || worker.status === 'busy'}
                        />
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass-card border-white/10">
                        <DropdownMenuItem className="cursor-pointer">
                          <Activity className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => restartWorker.mutate(worker.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Restart Worker
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-coral">
                          <Pause className="w-4 h-4 mr-2" />
                          Drain Worker
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {worker.currentJob && (
                    <div className="mb-4 p-3 rounded-xl shadow-inset bg-cronix-bg-primary">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Current Job</p>
                      <p className="text-sm font-semibold text-cronix-text truncate">{worker.currentJob.name}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">CPU</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full shadow-inset bg-cronix-bg-primary overflow-hidden border-none">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              worker.cpuUsage > 80 ? 'bg-coral' : 'bg-teal'
                            )}
                            style={{ width: `${worker.cpuUsage}%` }}
                          />
                        </div>
                        <span className="text-xs text-cronix-text w-10 font-bold">{worker.cpuUsage}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Memory</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full shadow-inset bg-cronix-bg-primary overflow-hidden border-none">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              worker.memoryUsage > 80 ? 'bg-coral' : 'bg-cyan-400'
                            )}
                            style={{ width: `${worker.memoryUsage}%` }}
                          />
                        </div>
                        <span className="text-xs text-cronix-text w-10 font-bold">{worker.memoryUsage}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-[#163177]/5 border-t border-[#163177]/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Queues</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {worker.queuesNames.slice(0, 3).map((queue) => (
                        <span
                          key={queue}
                          className="text-xs px-2.5 py-0.5 rounded-full shadow-inset-small bg-cronix-bg-primary text-cronix-text font-semibold"
                        >
                          {queue}
                        </span>
                      ))}
                      {worker.queuesNames.length > 3 && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full shadow-inset-small bg-cronix-bg-primary text-cronix-secondary font-medium">
                          +{worker.queuesNames.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Jobs Completed</p>
                    <p className="text-sm font-bold text-[#6C63FF]">{worker.jobsCompleted.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
