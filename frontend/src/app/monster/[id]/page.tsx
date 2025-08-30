"use client";

import React, { use } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Search, Clock, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Ravi_Prakash } from 'next/font/google';

interface MonsterDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MonsterDetailPage({ params }: MonsterDetailPageProps) {
  const { id } = use(params);
  const [monster, setMonster] = React.useState<{
    id: string;
    name: string;
    category: string;
    categoryEmoji: string;
    rank: string;
    firstSeen: string;
    lastSeen: string;
    encounterCount: number;
    intimacyLevel: number;
    evolutionCondition: string;
    evolutionProgress: number;
    evolutionTarget: number;
    lastLevelUp: string;
    recommendation: string;
    imageUrl: string;
  } | null>(null);

  // LocalStorageからモンスターデータを読み込んでモンスター情報を生成
  React.useEffect(() => {
    try {
      console.log('モンスター詳細ページ - ID:', id);
      console.log('IDの型:', typeof id);
      console.log('IDの値:', id);
      
      // 図鑑画面で生成されたモンスターデータを取得
      const encyclopediaMonsters = JSON.parse(localStorage.getItem('encyclopediaMonsters') || '[]');
      console.log('図鑑画面のモンスターデータ:', encyclopediaMonsters);
      
      // 指定されたIDのモンスターを検索
      let targetMonster = null;
      
      // 図鑑画面のモンスターデータから検索
      if (encyclopediaMonsters.length > 0) {
        const foundMonster = encyclopediaMonsters.find((m: { id: number | string }) => m.id.toString() === id);
        console.log('図鑑画面から見つかったモンスター:', foundMonster);
        
        if (foundMonster) {
          // 図鑑画面のモンスターデータを詳細画面用に変換
          targetMonster = {
            id: foundMonster.id.toString(),
            name: foundMonster.name,
            category: foundMonster.category,
            categoryEmoji: foundMonster.categoryEmoji,
            rank: foundMonster.rank,
            firstSeen: foundMonster.lastSeenAt || '',
            lastSeen: foundMonster.lastSeenAt || '',
            encounterCount: 1, // 図鑑画面では遭遇回数が不明なため
            intimacyLevel: 1,
            evolutionCondition: `${foundMonster.name}を5回入力`,
            evolutionProgress: 1,
            evolutionTarget: 5,
            lastLevelUp: foundMonster.lastSeenAt || '',
            recommendation: `${foundMonster.name}をお忘れなく!`,
            imageUrl: foundMonster.thumbUrl
          };
        }
      }
      
      // 図鑑画面にない場合は、thingsRecordsから検索
      if (!targetMonster) {
        const thingsRecords = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
        console.log('LocalStorageから読み込まれたthingsRecords:', thingsRecords);
        
        // 指定されたIDのモンスターを検索
        const targetRecords = thingsRecords.filter((record: { thingId: string; thingType: string; createdAt: string }) => {
          return record.thingId === id;
        });
        console.log('検索されたtargetRecords:', targetRecords);
        
        if (targetRecords.length > 0) {
          const encounterCount = targetRecords.length;
          const intimacyLevel = encounterCount;
          
          // レア度を計算（図鑑と同じロジック、5段階評価）
          let rank: string = 'C';
          if (encounterCount > 20) rank = 'SS';
          if (encounterCount > 15) rank = 'S';
          if (encounterCount > 10) rank = 'A';
          if (encounterCount > 5) rank = 'B';
          
          // 画像パスを生成
          let imageUrl = '/monsters/wallet/wallet-monster.jpg';
          if (id === 'key') {
            imageUrl = `/monsters/key/key-monster-${Math.min(Math.ceil(intimacyLevel / 5), 5)}.jpg`;
          } else if (id === 'umbrella') {
            imageUrl = `/monsters/umbrella/umbrella-monster-${Math.min(Math.ceil(intimacyLevel / 5), 5)}.jpg`;
          } else if (id === 'wallet') {
            imageUrl = `/monsters/wallet/wallet-monster${intimacyLevel > 5 ? `-${Math.min(Math.ceil(intimacyLevel / 5), 5)}` : ''}.jpg`;
          } else if (id === 'medicine') {
            imageUrl = `/monsters/medicine/medicine-monster-${Math.min(Math.ceil(intimacyLevel / 5), 5)}.jpg`;
          } else if (id === 'smartphone') {
            imageUrl = `/monsters/phone/phone_monsters${intimacyLevel > 5 ? Math.min(Math.ceil(intimacyLevel / 5), 5) : ''}.jpg`;
          } else if (id === 'homework') {
            imageUrl = `/monsters/homework/homework_monsters${intimacyLevel > 5 ? Math.min(Math.ceil(intimacyLevel / 5), 5) : ''}.jpg`;
          } else if (id === 'schedule') {
            imageUrl = '/monsters/schedule/schedule_monsters.png';
          } else if (id === 'time') {
            imageUrl = '/monsters/late/late_monsters.jpg';
          }
          
          targetMonster = {
            id: id,
            name: targetRecords[0].thingType || '忘れ物',
            category: id,
            categoryEmoji: '🧠',
            rank: rank,
            firstSeen: targetRecords[targetRecords.length - 1]?.createdAt || '',
            lastSeen: targetRecords[0]?.createdAt || '',
            encounterCount: encounterCount,
            intimacyLevel: intimacyLevel,
            evolutionCondition: `${targetRecords[0].thingType || '忘れ物'}を${Math.ceil(intimacyLevel / 5) * 5}回入力`,
            evolutionProgress: encounterCount,
            evolutionTarget: Math.ceil(intimacyLevel / 5) * 5,
            lastLevelUp: targetRecords[0]?.createdAt || '',
            recommendation: `${targetRecords[0].thingType || '忘れ物'}をお忘れなく!`,
            imageUrl: imageUrl
          };
        }
      }
      
      if (targetMonster) {
        setMonster(targetMonster);
      }
    } catch (error) {
      console.error('モンスター詳細ページでエラーが発生:', error);
    }
  }, [id]);

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

  // モンスターが読み込まれていない場合はローディング表示
  if (!monster) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-gray-600">モンスター情報を読み込み中...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 text-gray-900">
          <Link href="/encyclopedia">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{monster.name}</h1>
            <p className="text-gray-600">入力回数 {monster.encounterCount}回</p>
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
              <div className="flex-1 space-y-4 text-gray-900">
                <div className="flex items-center gap-3 text-gray-900">
                  <h2 className="text-xl font-semibold">{monster.name}</h2>
                  {/* レベル表示を追加 */}
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    Lv.{(() => {
                      // feedページと同様のレベル計算ロジック
                      const feed = JSON.parse(localStorage.getItem('monsterFeed') || '{}');
                      const fedCount = feed[monster.category]?.fed || 0;
                      return Math.min(Math.floor(fedCount / 5), 100);
                    })()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>初出日: {monster.firstSeen}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
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

        {/* レベル情報 */}
        <div className="text-gray-900">
        <Card>
          <CardHeader>
            <CardTitle>レベル情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">現在のレベル</span>
              <span className="text-lg font-semibold text-emerald-600">
                Lv.{(() => {
                  const feed = JSON.parse(localStorage.getItem('monsterFeed') || '{}');
                  const fedCount = feed[monster.category]?.fed || 0;
                  return Math.min(Math.floor(fedCount / 5), 100);
                })()}
              </span>
            </div>
            <Progress
              value={(() => {
                const feed = JSON.parse(localStorage.getItem('monsterFeed') || '{}');
                const fedCount = feed[monster.category]?.fed || 0;
                return (fedCount % 5) * 20; // 5個ごとにレベルアップなので、残りを20%単位で表示
              })()}
              max={100}
              label="次のレベルまで"
              showPercentage
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                次のレベルまであと{
                  (() => {
                    const feed = JSON.parse(localStorage.getItem('monsterFeed') || '{}');
                    const fedCount = feed[monster.category]?.fed || 0;
                    const currentLevel = Math.min(Math.floor(fedCount / 5), 100);
                    if (currentLevel >= 100) return '最大レベル';
                    return `${5 - (fedCount % 5)}個`;
                  })()
                }のえさ
              </span>
              <span>{monster.lastLevelUp}</span>
            </div>
          </CardContent>
        </Card>
        </div>

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
            {monster.lastSeen} {monster.lastLevelUp ? monster.lastLevelUp.split(' ')[1] : ''}
          </div>
          <Button variant="ghost" size="sm">
            履歴
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
