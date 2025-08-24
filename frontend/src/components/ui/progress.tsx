import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max, 
  label, 
  showPercentage = false, 
  className 
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export { Progress };
