import { motion } from 'framer-motion';
import { LucideIcon, Inbox, Search, FileX, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className || ''}`}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-teal/20 rounded-full blur-3xl opacity-30" />
        <div className="relative glass-card p-6 rounded-2xl mb-6">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

export function NoSearchResults() {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
    />
  );
}

export function NoData() {
  return (
    <EmptyState
      icon={FileX}
      title="No data available"
      description="There's no data to display at the moment."
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="No notifications"
      description="You're all caught up! No new notifications."
    />
  );
}
