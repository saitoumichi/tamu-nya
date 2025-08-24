import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // アニメーション完了後にコールバック実行
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />
  };

  const colors = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    warning: 'border-yellow-200 bg-yellow-50'
  };

  return (
    <div
      className={cn(
        'fixed right-4 top-4 z-50 w-80 transform rounded-lg border p-4 shadow-lg transition-all duration-300',
        colors[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{title}</h4>
          {message && <p className="mt-1 text-sm text-gray-600">{message}</p>}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          aria-label="トーストを閉じる"
          title="トーストを閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export { Toast };
export type { ToastType };
