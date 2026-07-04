import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { MetricCard } from '@/components/common';
import { AreaChartComponent, BarChartComponent, JobStatusChart } from '@/components/charts';
import {
  useDashboardMetrics,
  useThroughputMetrics,
  useJobsByStatus,
  useWorkerHealth,
  useWorkers,
  useQueues,
} from '@/hooks';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: throughputData, isLoading: throughputLoading } = useThroughputMetrics();
  const { data: jobsByStatus, isLoading: statusLoading } = useJobsByStatus();
  const { data: workerHealth, isLoading: workerLoading } = useWorkerHealth();
  const { data: workers } = useWorkers();
  const { data: queues } = useQueues();

  const isLoading = metricsLoading || throughputLoading || statusLoading || workerLoading;

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title font-display">Dashboard</h1>
          <p className="page-description">Monitor your distributed job scheduler</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-28 loading-skeleton" style={{ borderRadius: 32 }} />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 loading-skeleton" style={{ borderRadius: 32 }} />
          <div className="h-80 loading-skeleton" style={{ borderRadius: 32 }} />
        </div>
      </div>
    );
  }

  const dashboardData = metrics?.data || {
    totalJobs: 0,
    jobsCompleted: 0,
    jobsFailed: 0,
    jobsPending: 0,
    workersOnline: 0,
    totalWorkers: 0,
    throughput: 0,
    avgLatency: 0,
    successRate: 100,
  };

  return (
    <div className="page-container select-none">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Title */}
        <motion.div variants={item} className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="page-title font-display">Dashboard</h1>
            <p className="page-description">Monitor your distributed job scheduler</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-cronix-secondary uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-inset-small bg-cronix-bg-primary">
            <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-pulse" />
            System Live
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <MetricCard
            title="Total Jobs"
            value={dashboardData.totalJobs.toLocaleString()}
            icon={Activity}
            iconColor="text-[#6C63FF]"
            trend="up"
            change={12.5}
            changeLabel="vs last week"
          />
          <MetricCard
            title="Completed"
            value={dashboardData.jobsCompleted.toLocaleString()}
            icon={CheckCircle2}
            iconColor="text-[#38B2AC]"
            trend="up"
            change={8.2}
            changeLabel="vs last week"
          />
          <MetricCard
            title="Failed"
            value={dashboardData.jobsFailed.toLocaleString()}
            icon={XCircle}
            iconColor="text-[#EF4444]"
            trend="down"
            change={-3.1}
            changeLabel="vs last week"
          />
          <MetricCard
            title="Pending"
            value={dashboardData.jobsPending.toLocaleString()}
            icon={Clock}
            iconColor="text-amber-500"
          />
          <MetricCard
            title="Workers Live"
            value={`${dashboardData.workersOnline}/${dashboardData.totalWorkers}`}
            icon={Server}
            iconColor="text-[#6C63FF]"
          />
          <MetricCard
            title="Throughput"
            value={`${dashboardData.throughput.toFixed(1)}/m`}
            icon={TrendingUp}
            iconColor="text-[#38B2AC]"
            trend="up"
            change={15.3}
            changeLabel="vs last hour"
          />
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Throughput Area Chart */}
          <div className="lg:col-span-2 glass-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-cronix-text font-display">Job Throughput</h3>
                <p className="text-xs text-cronix-secondary font-medium">Jobs completed per 5 minute intervals</p>
              </div>
              <select className="input-field max-w-[160px] h-9 px-3 py-1 font-semibold text-xs tracking-tight">
                <option>Last 2 hours</option>
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
              </select>
            </div>
            <AreaChartComponent
              data={(throughputData?.data || []).map(d => ({ timestamp: d.timestamp, value: d.value }))}
              height={260}
              color="#6C63FF"
            />
          </div>

          {/* Job Status Donut Chart */}
          <div className="glass-card p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-cronix-text font-display mb-1">Jobs by Status</h3>
              <p className="text-xs text-cronix-secondary font-medium mb-6">Current active job status metrics</p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-[160px]">
              <JobStatusChart data={jobsByStatus?.data || []} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3.5">
              {(jobsByStatus?.data || []).slice(0, 4).map((item) => (
                <div key={item.status} className="flex items-center justify-between px-3 py-1.5 rounded-xl shadow-inset-small bg-cronix-bg-primary">
                  <span className="text-[10px] uppercase font-bold text-cronix-secondary capitalize">{item.status}</span>
                  <span className="text-xs font-extrabold text-cronix-text">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Health & Queues Row */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Worker Health Bar Chart */}
          <div className="glass-card p-6 md:p-8">
            <h3 className="text-lg font-bold text-cronix-text font-display mb-1">Worker Health Scores</h3>
            <p className="text-xs text-cronix-secondary font-medium mb-8">Average successful jobs score per node</p>
            <BarChartComponent
              data={workerHealth?.data || []}
              height={180}
              layout="vertical"
              color="#6C63FF"
            />
          </div>

          {/* Active Queues list */}
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-cronix-text font-display mb-1">Active Queues</h3>
                <p className="text-xs text-cronix-secondary font-medium">Monitoring active job queues depth</p>
              </div>
              <button className="text-xs font-bold text-[#6C63FF] hover:text-[#8B84FF] transition-colors uppercase tracking-wider font-display">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {(queues?.data || []).slice(0, 3).map((queue) => (
                <div
                  key={queue.id}
                  className="flex items-center justify-between p-4 rounded-[20px] shadow-inset bg-cronix-bg-primary hover:shadow-inset-deep transition-all duration-300 ease-out"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.15)]',
                        queue.status === 'active' && 'bg-[#38B2AC]',
                        queue.status === 'paused' && 'bg-amber-400',
                        queue.status === 'draining' && 'bg-[#EF4444]'
                      )}
                    />
                    <div>
                      <p className="text-sm font-bold text-cronix-text font-display">{queue.name}</p>
                      <p className="text-xs text-cronix-secondary font-semibold">{queue.projectName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-[#6C63FF] font-display">{queue.throughput}/m</p>
                    <p className="text-[10px] uppercase font-bold text-cronix-secondary mt-0.5">{queue.jobsPending} pending</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Workers Activity Table */}
        <motion.div variants={item} className="glass-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-cronix-text font-display mb-1">Recent Worker Activity</h3>
              <p className="text-xs text-cronix-secondary font-medium">Live resource consumption and job execution totals</p>
            </div>
            <button className="text-xs font-bold text-[#6C63FF] hover:text-[#8B84FF] transition-colors uppercase tracking-wider font-display">
              View all workers
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Status</th>
                  <th>Current Job</th>
                  <th>CPU</th>
                  <th>Memory</th>
                  <th>Jobs Completed</th>
                  <th>Last Heartbeat</th>
                </tr>
              </thead>
              <tbody>
                {(workers?.data || []).slice(0, 4).map((worker) => (
                  <tr key={worker.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cronix-bg-primary shadow-extruded-small text-[#6C63FF] flex items-center justify-center flex-shrink-0">
                          <Server className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-cronix-text font-display">{worker.name}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={cn(
                          'status-badge uppercase tracking-wider text-[10px] font-bold',
                          worker.status === 'online' && 'success',
                          worker.status === 'busy' && 'warning',
                          worker.status === 'offline' && 'error',
                          worker.status === 'error' && 'error'
                        )}
                      >
                        {worker.status}
                      </span>
                    </td>
                    <td className="text-cronix-secondary font-medium truncate max-w-[160px]">
                      {worker.currentJob ? worker.currentJob.name : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 h-2 rounded-full shadow-inset-small bg-cronix-bg-primary overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500 ease-out',
                              worker.cpuUsage > 80 ? 'bg-[#EF4444]' : 'bg-[#6C63FF]'
                            )}
                            style={{ width: `${worker.cpuUsage}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-cronix-secondary">{worker.cpuUsage}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-16 h-2 rounded-full shadow-inset-small bg-cronix-bg-primary overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500 ease-out',
                              worker.memoryUsage > 80 ? 'bg-[#EF4444]' : 'bg-[#38B2AC]'
                            )}
                            style={{ width: `${worker.memoryUsage}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-cronix-secondary">{worker.memoryUsage}%</span>
                      </div>
                    </td>
                    <td className="text-cronix-text font-bold">{worker.jobsCompleted.toLocaleString()}</td>
                    <td className="text-cronix-secondary font-medium text-xs">
                      {new Date(worker.lastHeartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* High-level system stats footer */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-5 rounded-[24px] flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-cronix-bg-primary shadow-inset text-[#6C63FF] flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-cronix-secondary uppercase tracking-wider">Avg. Latency</p>
              <p className="text-lg font-extrabold text-cronix-text font-display">{dashboardData.avgLatency}ms</p>
            </div>
          </div>
          <div className="glass-card p-5 rounded-[24px] flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-cronix-bg-primary shadow-inset text-[#38B2AC] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-cronix-secondary uppercase tracking-wider">Success Rate</p>
              <p className="text-lg font-extrabold text-cronix-text font-display">{dashboardData.successRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="glass-card p-5 rounded-[24px] flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-cronix-bg-primary shadow-inset text-[#EF4444] flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-cronix-secondary uppercase tracking-wider">Failed Jobs (24h)</p>
              <p className="text-lg font-extrabold text-cronix-text font-display">{dashboardData.jobsFailed.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
