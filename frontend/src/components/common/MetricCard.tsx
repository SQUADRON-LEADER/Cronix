import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-[#6C63FF]',
  trend = 'neutral',
  loading = false,
  className,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className={cn('metric-card', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="loading-skeleton h-4 w-24" />
            <div className="loading-skeleton h-9 w-32" />
            <div className="loading-skeleton h-3 w-20" />
          </div>
          {Icon && (
            <div className="loading-skeleton h-12 w-12 rounded-2xl" />
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('metric-card group', className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-xs font-semibold tracking-wider uppercase text-cronix-secondary">{title}</p>
          <p className="text-3xl font-extrabold tracking-tight text-cronix-text break-words pr-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span
                className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full shadow-inset-small',
                  trend === 'up' && 'text-[#38B2AC] bg-[#38B2AC]/10',
                  trend === 'down' && 'text-[#EF4444] bg-[#EF4444]/10',
                  trend === 'neutral' && 'text-cronix-secondary bg-[#163177]/10'
                )}
              >
                {trend === 'up' && '+'}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-cronix-secondary font-medium">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'p-3.5 rounded-2xl transition-all duration-300 ease-out shadow-inset flex-shrink-0 bg-cronix-bg-primary',
              'group-hover:shadow-inset-deep',
              iconColor
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
