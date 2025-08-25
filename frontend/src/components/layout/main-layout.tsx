import React from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { BottomTabs } from './bottom-tabs';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header />
      
      <div className="flex">
        {/* サイドバー（デスクトップ） */}
        <Sidebar />
        
        {/* メインコンテンツ */}
        <main className="flex-1 md:ml-64">
          <div className="container mx-auto p-4 pb-20 md:pb-4">
            {children}
          </div>
        </main>
      </div>
      
      {/* ボトムタブ（モバイル） */}
      <BottomTabs />
    </div>
  );
};

export { MainLayout };
