"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// 絵文字フォールバック用マップ
const THING_EMOJI_MAP: { [key: string]: string } = {
  key: '🔑',
  medicine: '💊',
  umbrella: '☔',
  wallet: '👛',
  smartphone: '📱',
  schedule: '📅',
  time: '⏰',
  homework: '📄',
  another: '😊'
};

export default function FeedPage() {
  const [feedInventory, setFeedInventory] = useState(0);
  const [monsterFeed, setMonsterFeed] = useState<{ [thingId: string]: { fed: number } }>({});
  const [monsters, setMonsters] = useState<Array<{
    thingId: string;
    thingType: string;
    encounterCount: number;
    stage: number;
  }>>([]);

  // ユーティリティ関数
  const readFeedInventory = (): number => {
    return parseInt(localStorage.getItem('feedInventory') || '0');
  };

  const writeFeedInventory = (n: number): void => {
    localStorage.setItem('feedInventory', n.toString());
  };

  const readMonsterFeed = (): { [thingId: string]: { fed: number } } => {
    return JSON.parse(localStorage.getItem('monsterFeed') || '{}');
  };

  const writeMonsterFeed = (obj: { [thingId: string]: { fed: number } }): void => {
    localStorage.setItem('monsterFeed', JSON.stringify(obj));
  };

  const aggregateMonstersFromThingsRecords = () => {
    const existingRecords = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
    const forgetRecords = existingRecords.filter((record: any) => record.didForget === true);
    
    const monsterMap = new Map();
    forgetRecords.forEach((record: any) => {
      if (record.thingId && record.thingId !== 'none') {
        if (!monsterMap.has(record.thingId)) {
          monsterMap.set(record.thingId, {
            thingId: record.thingId,
            thingType: record.thingType,
            encounterCount: 0,
            stage: 0
          });
        }
        monsterMap.get(record.thingId).encounterCount++;
      }
    });
    
    return Array.from(monsterMap.values());
  };

  const refreshInventory = () => {
    const inventory = readFeedInventory();
    setFeedInventory(inventory);
  };

  const refreshMonsterFeed = () => {
    const feed = readMonsterFeed();
    setMonsterFeed(feed);
  };

  const refreshMonsters = () => {
    const monsterList = aggregateMonstersFromThingsRecords();
    const feed = readMonsterFeed();
    
    // 各モンスターの成長段階を計算
    const monstersWithStage = monsterList.map(monster => ({
      ...monster,
      stage: Math.floor((feed[monster.thingId]?.fed || 0) / 15)
    }));
    
    setMonsters(monstersWithStage);
  };

  const handleFeedMonster = (thingId: string) => {
    if (feedInventory <= 0) return;
    
    const newInventory = feedInventory - 1;
    const newMonsterFeed = { ...monsterFeed };
    
    if (!newMonsterFeed[thingId]) {
      newMonsterFeed[thingId] = { fed: 0 };
    }
    newMonsterFeed[thingId].fed++;
    
    // 保存
    writeFeedInventory(newInventory);
    writeMonsterFeed(newMonsterFeed);
    
    // 状態更新
    setFeedInventory(newInventory);
    setMonsterFeed(newMonsterFeed);
    
    // モンスター一覧を再計算
    refreshMonsters();
    
    // イベント発火
    window.dispatchEvent(new CustomEvent('feed:inventoryChanged'));
    
    // 成長演出（15個ごと）
    if (newMonsterFeed[thingId].fed % 15 === 0) {
      // 軽い演出（アラート）
      alert('成長！');
    }
  };

  // 初期化とイベント購読
  useEffect(() => {
    refreshInventory();
    refreshMonsterFeed();
    refreshMonsters();

    // feed:claimed イベントを購読
    const handleFeedClaimed = () => {
      refreshInventory();
    };

    window.addEventListener('feed:claimed', handleFeedClaimed);

    return () => {
      window.removeEventListener('feed:claimed', handleFeedClaimed);
    };
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">えさあげ会場</h1>
            <p className="text-gray-600">モンスターにえさをあげて成長させよう</p>
          </div>
        </div>

        {/* えさあげ会場 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎪 えさあげ会場
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 在庫表示 */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-medium text-blue-800">
                えさ 在庫：{feedInventory}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                えさは15個で1段階成長
              </div>
            </div>

            {/* モンスターグリッド */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {monsters.map((monster) => (
                <div
                  key={monster.thingId}
                  className="text-center p-3 rounded-lg border-2 border-gray-200 hover:border-primary transition-all"
                >
                  <div 
                    className="text-3xl mb-2 floaty"
                    style={{
                      transform: `scale(${1 + monster.stage * 0.05})`
                    }}
                  >
                    {THING_EMOJI_MAP[monster.thingId] || '😊'}
                  </div>
                  <div className="font-medium text-sm text-gray-800 mb-1">
                    {monster.thingType}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    段階{monster.stage}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleFeedMonster(monster.thingId)}
                    disabled={feedInventory <= 0}
                    className="w-full"
                  >
                    えさをあげる
                  </Button>
                </div>
              ))}
            </div>

            {monsters.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                モンスターがいません
              </div>
            )}
          </CardContent>
        </Card>

        <style jsx>{`
          @keyframes floaty {
            0% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
            100% { transform: translateY(0); }
          }
          .floaty {
            animation: floaty 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    </MainLayout>
  );
}
