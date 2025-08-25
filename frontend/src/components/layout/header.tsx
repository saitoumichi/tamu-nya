import React from 'react';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  appName?: string;
}

const Header: React.FC<HeaderProps> = ({ appName = '忘れ物図鑑' }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* アプリ名 */}
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-primary">{appName}</h1>
        </div>

        {/* 右側のアクション */}
        <div className="flex items-center space-x-2">
          {/* 通知ベル */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {/* 通知バッジ */}
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
          </Button>

          {/* プロフィール */}
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export { Header };
