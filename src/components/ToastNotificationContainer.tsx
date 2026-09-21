import { useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Zap,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastNotificationContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  onViewOrder?: (orderId: number) => void;
  onClearAll?: () => void;
}

export function ToastNotificationContainer({
  toasts,
  onDismiss,
  onViewOrder,
  onClearAll,
}: ToastNotificationContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notification-container"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.length > 2 && onClearAll && (
        <div className="flex justify-end pointer-events-auto">
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-mono text-neutral-400 hover:text-white bg-neutral-900/90 border border-neutral-800 rounded-lg px-2.5 py-1 backdrop-blur-md shadow-lg transition"
          >
            Clear all ({toasts.length})
          </button>
        </div>
      )}

      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onViewOrder={onViewOrder}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  key?: string;
  toast: ToastNotification;
  onDismiss: (id: string) => void;
  onViewOrder?: (orderId: number) => void;
}

function ToastItem({
  toast,
  onDismiss,
  onViewOrder,
}: ToastItemProps) {
  const isCompleted = toast.newStatus === 'Completed';
  const isInProgress = toast.newStatus === 'In progress';

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 ${
        isCompleted
          ? 'bg-neutral-950/95 border-emerald-500/40 shadow-emerald-950/30'
          : isInProgress
          ? 'bg-neutral-950/95 border-amber-500/40 shadow-amber-950/30'
          : 'bg-neutral-950/95 border-neutral-800 shadow-neutral-950/50'
      }`}
    >
      {/* Top ambient color bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isCompleted
            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
            : isInProgress
            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
        }`}
      />

      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div
          className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border ${
            isCompleted
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : isInProgress
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : isInProgress ? (
            <Zap className="w-5 h-5 animate-pulse" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : isInProgress
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}
            >
              Order #{toast.orderId}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {toast.timestamp}
            </span>
          </div>

          <h4 className="text-xs font-bold text-white mt-1 truncate">
            {toast.title}
          </h4>

          <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
            {toast.message}
          </p>

          {/* Quick Action Button */}
          {onViewOrder && (
            <button
              type="button"
              onClick={() => onViewOrder(toast.orderId)}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-lg px-2.5 py-1 transition cursor-pointer"
            >
              <span>View in Orders Tab</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="shrink-0 p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
