import React from 'react';
import { cn } from '@/lib/utils';

interface ChipProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ 
  label, 
  emoji, 
  selected = false, 
  onClick, 
  className 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
        'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
        selected
          ? 'border-primary bg-primary text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
        className
      )}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      {label}
    </button>
  );
};

export { Chip };
