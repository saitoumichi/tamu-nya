import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, BookOpen, BarChart3, Settings, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
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
      name: '通知設定',
      href: '/notifications',
      icon: Bell,
      active: pathname === '/notifications'
    },
    {
      name: '設定',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings'
    }
  ];

  return (
    <aside className="hidden w-64 border-r bg-white md:block">
      <div className="flex h-full flex-col">
        {/* ロゴ */}
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-semibold text-primary">忘れ物図鑑</h2>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5',
                  item.active ? 'text-white' : 'text-gray-500'
                )} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export { Sidebar };
