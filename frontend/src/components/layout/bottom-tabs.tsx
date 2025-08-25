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
      name: '通知',
      href: '/notifications',
      icon: Bell,
      active: pathname === '/notifications'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 px-3 py-2 transition-colors',
                tab.active
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className={cn(
                'h-5 w-5',
                tab.active ? 'text-primary' : 'text-gray-500'
              )} />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export { BottomTabs };
