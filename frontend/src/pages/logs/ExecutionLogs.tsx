import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput, EmptyState, LoadingSkeleton } from '@/components/common';
import { useExecutionLogs } from '@/hooks';
import type { ExecutionLog, PaginationParams } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const LEVEL_CONFIG: Record<ExecutionLog['level'], { icon: typeof Info; color: string; bg: string; label: string }> = {
  info:  { icon: Info,          color: 'text-blue-400',   bg: 'bg-blue-500/20',   label: 'INFO'  },
  warn:  { icon: AlertTriangle, color: 'text-amber-400',  bg: 'bg-amber-500/20',  label: 'WARN'  },
  error: { icon: AlertCircle,   color: 'text-coral',      bg: 'bg-coral/20',      label: 'ERROR' },
  debug: { icon: Bug,           color: 'text-violet-400', bg: 'bg-violet-500/20', label: 'DEBUG' },
};

function LogLevelBadge({ level }: { level: ExecutionLog['level'] }) {
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.info;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export function ExecutionLogsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState<ExecutionLog['level'] | 'all'>('all');

  const params: PaginationParams = {
    page,
    limit: 20,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    search: search || undefined,
  };

  const { data, isLoading } = useExecutionLogs(params);

  const responseData = data?.data;
  const logs = responseData?.data ?? [];
  const totalPages = responseData?.totalPages ?? 1;
  const total = responseData?.total ?? 0;

  const filteredLogs =
    levelFilter === 'all' ? logs : logs.filter((l: ExecutionLog) => l.level === levelFilter);

  const levelCounts = {
    info:  logs.filter((l) => l.level === 'info').length,
    warn:  logs.filter((l) => l.level === 'warn').length,
    error: logs.filter((l) => l.level === 'error').length,
    debug: logs.filter((l) => l.level === 'debug').length,
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Execution Logs</h1>
          <p className="page-description">Real-time job execution audit trail</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

        {/* Header */}
        <motion.div
          variants={item}
          className="page-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="page-title">Execution Logs</h1>
            <p className="page-description">Real-time job execution audit trail</p>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search logs..."
              className="w-64"
            />
          </div>
        </motion.div>

        {/* Level stats */}
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(Object.keys(LEVEL_CONFIG) as ExecutionLog['level'][]).map((lvl) => {
            const cfg = LEVEL_CONFIG[lvl];
            const Icon = cfg.icon;
            const active = levelFilter === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setLevelFilter(active ? 'all' : lvl)}
                className={`glass-card p-4 rounded-xl flex items-center gap-4 transition-all text-left
                  ${active ? 'ring-2 ring-white/30 scale-[1.02]' : 'glass-hover'}`}
              >
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-mono">{cfg.label}</p>
                  <p className={`text-xl font-bold ${cfg.color}`}>{levelCounts[lvl]}</p>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Log entries */}
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No logs found"
            description={search ? `No logs match "${search}"` : 'No execution logs available yet.'}
          />
        ) : (
          <>
            <motion.div variants={item} className="glass-card rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[120px_80px_1fr_140px_80px] gap-4 px-4 py-3 border-b border-white/10 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                <span>Timestamp</span>
                <span>Level</span>
                <span>Message</span>
                <span>Job / Worker</span>
                <span className="text-right">Duration</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5">
                {filteredLogs.map((log: ExecutionLog) => {
                  const cfg = LEVEL_CONFIG[log.level] ?? LEVEL_CONFIG.info;
                  return (
                    <motion.div
                      key={log.id}
                      variants={item}
                      className="grid grid-cols-[120px_80px_1fr_140px_80px] gap-4 px-4 py-3 hover:bg-white/5 transition-colors items-start"
                    >
                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Level */}
                      <div>
                        <LogLevelBadge level={log.level} />
                      </div>

                      {/* Message */}
                      <p className={`text-sm font-mono break-all ${cfg.color}`}>{log.message}</p>

                      {/* Job / Worker */}
                      <div className="space-y-0.5">
                        <p className="text-xs text-cronix-text truncate">{log.jobName}</p>
                        <p className="text-xs text-muted-foreground truncate">{log.workerName}</p>
                      </div>

                      {/* Duration */}
                      <p className="text-xs text-muted-foreground font-mono text-right">
                        {log.duration != null ? `${log.duration}ms` : '—'}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Pagination */}
            <motion.div variants={item} className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {total} logs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="btn-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
