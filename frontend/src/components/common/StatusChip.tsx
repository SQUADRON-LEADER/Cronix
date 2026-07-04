import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending' | 'running';

interface StatusChipProps {
  status: string;
  variant?: StatusVariant;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'text-[#38B2AC] shadow-inset-small bg-cronix-bg-primary',
  warning: 'text-amber-500 shadow-inset-small bg-cronix-bg-primary',
  error: 'text-coral shadow-inset-small bg-cronix-bg-primary',
  info: 'text-blue-500 shadow-inset-small bg-cronix-bg-primary',
  neutral: 'text-cronix-secondary shadow-inset-small bg-cronix-bg-primary',
  pending: 'text-purple-500 shadow-inset-small bg-cronix-bg-primary',
  running: 'text-cyan-600 shadow-inset-small bg-cronix-bg-primary',
};

const dotColors: Record<StatusVariant, string> = {
  success: 'bg-[#38B2AC]',
  warning: 'bg-amber-400',
  error: 'bg-coral',
  info: 'bg-blue-400',
  neutral: 'bg-cronix-secondary',
  pending: 'bg-purple-400',
  running: 'bg-cyan-500',
};

export function StatusChip({
  status,
  variant = 'neutral',
  pulse = false,
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
        variantStyles[variant],
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant], pulse && 'animate-pulse')} />
      {status}
    </span>
  );
}

export function getStatusVariant(status: string): StatusVariant {
  const statusMap: Record<string, StatusVariant> = {
    completed: 'success',
    success: 'success',
    online: 'success',
    active: 'success',
    running: 'running',
    processing: 'running',
    pending: 'pending',
    queued: 'pending',
    retrying: 'warning',
    warning: 'warning',
    paused: 'warning',
    draining: 'warning',
    busy: 'warning',
    failed: 'error',
    error: 'error',
    offline: 'error',
    cancelled: 'neutral',
    inactive: 'neutral',
    archived: 'neutral',
  };
  return statusMap[status.toLowerCase()] || 'neutral';
}
