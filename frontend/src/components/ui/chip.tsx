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
      type="button"
      onClick={onClick}
      className={cn(
        'forest-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
        'border-2 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:ring-offset-2 focus:ring-offset-transparent',
        selected && 'selected',
        className
      )}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      {label}
    </button>
  );
};

export { Chip };
