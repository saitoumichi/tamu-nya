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
      name: '作成',
      href: '/create',
      icon: Plus,
      active: pathname === '/create'
    },
  ];

  return (
    <aside className="hidden w-64 border-r-0 forest-card md:block">
      <div className="flex h-full flex-col">
        {/* ロゴ */}
        <div className="flex h-16 items-center border-b border-emerald-400/30 px-6">
          <div className="text-forest-primary font-bold text-lg flex items-center gap-2">
            🧚‍♀️ ナビゲーション
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'forest-nav-item flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                  item.active && 'active'
                )}
              >
                <Icon className="h-5 w-5" />
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
