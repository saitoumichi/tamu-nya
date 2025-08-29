import React, { useState } from 'react';
import { Bell} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HeaderProps {
  appName?: string;
}

const Header: React.FC<HeaderProps> = ({ appName = '忘れ物図鑑' }) => {
  const [notificationCount] = useState(3); // サンプル通知数

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* アプリ名 */}
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-primary">{appName}</h1>
        </div>

        {/* 右側のアクション */}
        <div className="flex items-center gap-2">
          {/* 通知ベル */}
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {/* 通知バッジ */}
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export { Header };
