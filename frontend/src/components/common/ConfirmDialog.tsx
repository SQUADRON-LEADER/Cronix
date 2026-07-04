import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const iconMap = {
    default: <Info className="w-6 h-6 text-teal" />,
    destructive: <Trash2 className="w-6 h-6 text-coral" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-400" />,
  };

  const buttonStyles = {
    default: 'bg-teal hover:bg-teal-600',
    destructive: 'bg-coral hover:bg-coral-600',
    warning: 'bg-amber-500 hover:bg-amber-600',
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-card border-white/10 max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/5">
              {iconMap[variant]}
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-white">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="btn-secondary">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={`${buttonStyles[variant]} text-white font-medium transition-all duration-200`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
