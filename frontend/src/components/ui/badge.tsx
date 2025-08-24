import React from 'react';
import { cn } from '@/lib/utils';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

interface BadgeProps {
  rarity: Rarity;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ rarity, className }) => {
  const rarityConfig = {
    common: {
      label: 'Common',
      classes: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    rare: {
      label: 'Rare',
      classes: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    epic: {
      label: 'Epic',
      classes: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    legendary: {
      label: 'Legendary',
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  };

  const config = rarityConfig[rarity];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export { Badge };
export type { Rarity };
