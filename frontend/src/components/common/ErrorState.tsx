import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'default' | 'network';
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading the data. Please try again.',
  onRetry,
  variant = 'default',
  className,
}: ErrorStateProps) {
  const Icon = variant === 'network' ? WifiOff : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className || ''}`}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-coral/20 rounded-full blur-3xl opacity-30" />
        <div className="relative glass-card p-6 rounded-2xl border-coral/30">
          <Icon className="w-12 h-12 text-coral" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="btn-secondary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </motion.div>
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      variant="network"
      title="Connection lost"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}
