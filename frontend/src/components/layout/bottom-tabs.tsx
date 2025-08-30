import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, BookOpen, BarChart3, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomTabs = () => {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'ホーム',
      href: '/',
      icon: Home,
      active: pathname === '/'
    },
    {
      name: '入力',
      href: '/input',
      icon: Plus,
      active: pathname === '/input'
    },
    {
      name: '図鑑',
      href: '/encyclopedia',
      icon: BookOpen,
      active: pathname === '/encyclopedia'
    },
    {
      name: '分析',
      href: '/analysis',
      icon: BarChart3,
      active: pathname === '/analysis'
    },
    {
      name: '作成',
      href: '/create',
      icon: Plus,
      active: pathname === '/create'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-0 forest-card md:hidden">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 px-3 py-2 transition-all duration-300 rounded-lg',
                tab.active
                  ? 'text-forest-accent transform scale-110'
                  : 'text-forest-secondary hover:text-forest-primary hover:transform hover:scale-105'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export { BottomTabs };
