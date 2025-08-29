import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className={cn(
        'relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all',
        'mx-4 max-h-[90vh] overflow-y-auto',
        className
      )}>
        {/* ヘッダー */}
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="モーダルを閉じる"
              title="モーダルを閉じる"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* コンテンツ */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export { Modal };
