import React from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { BottomTabs } from './bottom-tabs';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="forest-background forest-theme">
      {/* 森の背景レイヤー */}
      <div className="forest-layers">
        <div className="forest-layer forest-back"></div>
        <div className="forest-layer forest-mid"></div>
        <div className="forest-layer forest-front"></div>
      </div>
      
      {/* ヘッダー */}
      <Header />
      
      <div className="flex relative z-10">
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
