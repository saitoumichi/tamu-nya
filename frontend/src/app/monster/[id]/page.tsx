"use client";

import React, { use } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, Rarity } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Search, Clock, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface MonsterDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MonsterDetailPage({ params }: MonsterDetailPageProps) {
  const { id } = use(params);

  // サンプルデータ（実際のAPIから取得）
  const monster = {
    id: id,
    name: id === '1' ? 'カギモンスター' : id === '2' ? '傘の守護者' : '財布の精霊',
    level: id === '1' ? 3 : id === '2' ? 2 : 1,
    category: id === '1' ? 'key' : id === '2' ? 'umbrella' : 'wallet',
    categoryEmoji: id === '1' ? '🔑' : id === '2' ? '☔' : '👛',
    rarity: id === '1' ? 'common' : id === '2' ? 'rare' : 'epic' as Rarity,
    firstSeen: '2024/04/10',
    lastSeen: '2024/04/24',
    encounterCount: id === '1' ? 5 : id === '2' ? 3 : 1,
    intimacyLevel: id === '1' ? 75 : id === '2' ? 45 : 20,
    evolutionCondition: id === '1' ? 'カギ忘れ5回' : id === '2' ? '傘忘れ3回' : '財布忘れ1回',
    evolutionProgress: id === '1' ? 5 : id === '2' ? 2 : 1,
    evolutionTarget: id === '1' ? 5 : id === '2' ? 3 : 1,
    lastLevelUp: '2024/04/24 04:24',
    recommendation: id === '1' ? '明日7:50にカギをお忘れなく!' : id === '2' ? '雨の日は傘をお忘れなく!' : '財布を持ってお出かけください!',
    imageUrl: (id === '1' 
      ? '/monsters/key-monsters/key-monster-1.jpg' 
      : id === '2'
      ? '/monsters/umbrella_monsters/umbrella-monster-1.jpg'
      : '/monsters/wallet_monsters/wallet-monster.jpg') as string
  };

  const history = [
    {
      id: 1,
      date: '2024/04/24',
      time: '19:00',
      title: '鍵を忘れた',
      location: '自宅'
    },
    {
      id: 2,
      date: '2024/04/23',
      time: '08:30',
      title: '鍵を忘れた',
      location: '会社'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-4">
          <Link href="/encyclopedia">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{monster.name}</h1>
            <p className="text-gray-600">レベル {monster.level}回</p>
          </div>
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* 基本情報 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {/* モンスターイラスト */}
              <div className="w-32 h-32 flex-shrink-0">
                <img 
                  src={monster.imageUrl} 
                  alt={monster.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    // 画像読み込みエラー時は絵文字を表示
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'text-8xl flex items-center justify-center w-full h-full';
                    fallback.textContent = monster.categoryEmoji;
                    target.parentNode?.appendChild(fallback);
                  }}
                />
              </div>
              
              {/* 基本情報 */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{monster.name}</h2>
                  <Badge rarity={monster.rarity} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>初出日: {monster.firstSeen}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>最終出現日: {monster.lastSeen}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  遭遇回数: {monster.encounterCount}回
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 進化条件 */}
        <Card>
          <CardHeader>
            <CardTitle>進化条件 {monster.evolutionCondition}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress
              value={monster.evolutionProgress}
              max={monster.evolutionTarget}
              label="進化"
              showPercentage
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>レベルアップ: {monster.evolutionProgress}回</span>
              <span>{monster.lastLevelUp}</span>
            </div>
          </CardContent>
        </Card>

        {/* 推奨対策 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              推奨対策
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{monster.recommendation}</p>
            <Button className="w-full">
              アラート作成
            </Button>
          </CardContent>
        </Card>

        {/* 履歴 */}
        <Card>
          <CardHeader>
            <CardTitle>履歴</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                  >
                                      <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex-shrink-0">
                      <img 
                        src={monster.imageUrl} 
                        alt={monster.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          // 画像読み込みエラー時は絵文字を表示
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'text-2xl flex items-center justify-center w-full h-full';
                          fallback.textContent = monster.categoryEmoji;
                          target.parentNode?.appendChild(fallback);
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.location}</p>
                    </div>
                  </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{item.date}</div>
                      <div>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                まだ履歴がありません
              </div>
            )}
          </CardContent>
        </Card>

        {/* 下部アクションバー */}
        <div className="flex items-center justify-between p-4 bg-white border-t rounded-t-lg">
          <div className="text-sm text-gray-500">
            {monster.lastSeen} {monster.lastLevelUp.split(' ')[1]}
          </div>
          <Button variant="ghost" size="sm">
            履歴
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
