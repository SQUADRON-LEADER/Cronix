import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Activity,
  Server,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MetricCard } from '@/components/common';
import {
  AreaChartComponent,
  BarChartComponent,
  MultiLineChart,
  DonutChart,
} from '@/components/charts';
import {
  useDashboardMetrics,
  useThroughputMetrics,
  useLatencyMetrics,
  useJobsByStatus,
  useJobsByQueue,
  useWorkerHealth,
  useHourlyJobs,
} from '@/hooks';
import { ChartSkeleton } from '@/components/common/LoadingSkeleton';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function MetricsPage() {
  const [timeRange, setTimeRange] = useState('2h');
  const { data: metrics } = useDashboardMetrics();
  const { data: throughputData, isLoading: throughputLoading } = useThroughputMetrics();
  const { data: latencyData, isLoading: latencyLoading } = useLatencyMetrics();
  const { data: jobsByStatus } = useJobsByStatus();
  const { data: jobsByQueue } = useJobsByQueue();
  const { data: workerHealth, isLoading: workerLoading } = useWorkerHealth();
  const { data: hourlyJobs, isLoading: hourlyLoading } = useHourlyJobs();

  const jobsByStatusChartData = jobsByStatus?.data.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color:
      item.status === 'completed'
        ? '#00BFA6'
        : item.status === 'running'
        ? '#22D3EE'
        : item.status === 'pending'
        ? '#A855F7'
        : item.status === 'failed'
        ? '#FF6584'
        : '#F59E0B',
  })) || [];

  return (
    <div className="page-container">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={item} className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Metrics</h1>
            <p className="page-description">Analyze system performance and analytics</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10">
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="2h">Last 2 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Jobs"
            value={metrics?.data.totalJobs.toLocaleString() || '0'}
            icon={Activity}
            iconColor="text-teal"
          />
          <MetricCard
            title="Success Rate"
            value={`${metrics?.data.successRate || 0}%`}
            icon={TrendingUp}
            iconColor="text-teal"
          />
          <MetricCard
            title="Avg Latency"
            value={`${metrics?.data.avgLatency || 0}ms`}
            icon={Clock}
            iconColor="text-cyan-400"
          />
          <MetricCard
            title="Throughput"
            value={`${metrics?.data.throughput || 0}/m`}
            icon={BarChart3}
            iconColor="text-purple-400"
          />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {throughputLoading || latencyLoading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-cronix-text flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-teal" />
                      Job Throughput
                    </h3>
                    <p className="text-sm text-muted-foreground">Jobs processed over time</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal">
                      {metrics?.data.throughput || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">per minute</p>
                  </div>
                </div>
                <AreaChartComponent
                  data={(throughputData?.data || []).map(d => ({ timestamp: d.timestamp, value: d.value }))}
                  height={250}
                  color="#6C63FF"
                />
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-cronix-text flex items-center gap-2">
                      <Clock className="w-5 h-5 text-cyan-400" />
                      Response Latency
                    </h3>
                    <p className="text-sm text-muted-foreground">Average processing time</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-400">
                      {metrics?.data.avgLatency || 0}ms
                    </p>
                    <p className="text-xs text-muted-foreground">avg latency</p>
                  </div>
                </div>
                <AreaChartComponent
                  data={(latencyData?.data || []).map(d => ({ timestamp: d.timestamp, value: d.value }))}
                  height={250}
                  color="#6C63FF"
                  gradientId="latencyGradient"
                />
              </div>
            </>
          )}
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-cronix-text font-display">Jobs Distribution</h3>
              <p className="text-sm text-muted-foreground">By status</p>
            </div>
            <DonutChart
              data={jobsByStatusChartData}
              height={220}
              showLabels
            />
          </div>

          <div className="glass-card p-6 rounded-2xl lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-cronix-text font-display">Jobs by Queue</h3>
              <p className="text-sm text-muted-foreground">Distribution across queues</p>
            </div>
            <BarChartComponent
              data={jobsByQueue?.data || []}
              height={220}
              layout="vertical"
              color="#6C63FF"
            />
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-cronix-text font-display">Hourly Job Distribution</h3>
              <p className="text-sm text-muted-foreground">Completed vs Failed jobs</p>
            </div>
          </div>
          {hourlyLoading ? (
            <ChartSkeleton />
          ) : (
            <MultiLineChart
              data={hourlyJobs?.data.map((d) => ({
                timestamp: d.hour,
                completed: d.completed,
                failed: d.failed,
              })) || []}
              lines={[
                { dataKey: 'completed', color: '#38B2AC', name: 'Completed' },
                { dataKey: 'failed', color: '#EF4444', name: 'Failed' },
              ]}
              height={250}
              showLegend
            />
          )}
        </motion.div>

        <motion.div variants={item} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-cronix-text font-display flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-400" />
                Worker Health Score
              </h3>
              <p className="text-sm text-muted-foreground">Performance metric per worker</p>
            </div>
          </div>
          {workerLoading ? (
            <ChartSkeleton />
          ) : (
            <BarChartComponent
              data={workerHealth?.data || []}
              height={200}
              color="#6C63FF"
            />
          )}
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Workers', value: metrics?.data.totalWorkers, icon: Server },
            { label: 'Workers Online', value: metrics?.data.workersOnline, icon: Activity },
            { label: 'Active Queues', value: metrics?.data.queuesActive, icon: TrendingUp },
            { label: 'Jobs Running', value: metrics?.data.jobsRunning, icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 rounded-xl text-center">
              <stat.icon className="w-6 h-6 text-teal mx-auto mb-2" />
              <p className="text-2xl font-bold text-cronix-text">{stat.value || 0}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
