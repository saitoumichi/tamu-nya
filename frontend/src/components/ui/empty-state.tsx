import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  action, 
  className 
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 text-center',
      className
    )}>
      {/* イラストプレースホルダー */}
      <div className="mb-6 h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-4xl">📭</span>
      </div>
      
      {/* タイトル */}
      <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
      
      {/* 説明 */}
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      
      {/* アクション */}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

export { EmptyState };
