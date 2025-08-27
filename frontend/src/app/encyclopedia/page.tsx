"use client";
export const dynamic = 'force-dynamic';
import React, { useState } from 'react';

// 型定義
interface ThingsRecord {
  id: string;
  category: string;
  thingType: string;
  thingId: string;
  title: string;
  content: string;
  details: string;
  difficulty: number;
  location: string;
  datetime: string;
  createdAt: string;
}

interface Monster {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  categoryEmoji: string;
  rarity: Rarity;
  intimacyLevel: number;
  lastSeenAt: string;
  thumbUrl: string;
}
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Badge, Rarity } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Filter, Plus } from 'lucide-react';
import Link from 'next/link';

export default function EncyclopediaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<Rarity | ''>('');
  const [monsters, setMonsters] = useState<Monster[]>([]);

  // 時間を「○時間前」「○分前」の形式で表示する関数
  const getTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return created.toLocaleDateString('ja-JP');
  };

  // 親密度に応じて画像パスを取得する関数
  const getImagePathByIntimacy = (thingId: string, intimacyLevel: number): string => {
    // 親密度に応じて画像番号を決定（5レベルごとに変化）
    let imageNumber = 1;
    if (intimacyLevel > 5) imageNumber = 2;
    if (intimacyLevel > 10) imageNumber = 3;
    if (intimacyLevel > 15) imageNumber = 4;
    if (intimacyLevel > 20) imageNumber = 5;
    
    // 最大レベルは5枚目の画像まで
    imageNumber = Math.min(imageNumber, 5);
    
    let imagePath = '/monsters/things/things-monster.jpg'; // デフォルト
    
    if (thingId === 'key') {
      imagePath = `/monsters/key/key-monster-${imageNumber}.jpg`;
    } else if (thingId === 'umbrella') {
      imagePath = `/monsters/umbrella/umbrella-monster-${imageNumber}.jpg`;
    } else if (thingId === 'wallet') {
      imagePath = `/monsters/wallet/wallet-monster${imageNumber > 1 ? `-${imageNumber}` : ''}.jpg`;
    } else if (thingId === 'medicine') {
      imagePath = `/monsters/medicine/medicine-monster-${imageNumber}.jpg`;
    } else if (thingId === 'smartphone') {
      imagePath = `/monsters/phone/phone_monsters${imageNumber > 1 ? imageNumber : ''}.jpg`;
    } else if (thingId === 'homework') {
      imagePath = `/monsters/homework/homework_monsters${imageNumber > 1 ? imageNumber : ''}.jpg`;
    }
    
    console.log(`${thingId}の親密度${intimacyLevel}、画像${imageNumber}枚目:`, imagePath);
    return imagePath;
  };

  // 親密度に応じてrarityを取得する関数（画像変化と同じタイミング）
  const getRarityByIntimacy = (intimacyLevel: number): Rarity => {
    if (intimacyLevel >= 1 && intimacyLevel <= 5) return 'common';      // 1-5: 1枚目の画像
    if (intimacyLevel >= 6 && intimacyLevel <= 10) return 'uncommon';   // 6-10: 2枚目の画像
    if (intimacyLevel >= 11 && intimacyLevel <= 15) return 'rare';      // 11-15: 3枚目の画像
    if (intimacyLevel >= 16 && intimacyLevel <= 20) return 'epic';      // 16-20: 4枚目の画像
    if (intimacyLevel >= 21) return 'legendary';                        // 21+: 5枚目の画像
    return 'common';
  };

  // LocalStorageからthingsデータを読み込んでモンスターを生成
  React.useEffect(() => {
    // 既存のサンプルモンスター
    const baseMonsters = [
      {
        id: 1,
        name: '鍵の精',
        category: 'key',
        categoryName: '鍵',
        categoryEmoji: '🔑',
        rarity: 'common' as Rarity,
        intimacyLevel: 15,
        lastSeenAt: '2時間前',
        thumbUrl: '/monsters/key-monsters/key-monster-1.jpg'
      },
      {
        id: 2,
        name: '傘の守護者',
        category: 'umbrella',
        categoryName: '傘',
        categoryEmoji: '☔',
        rarity: 'rare' as Rarity,
        intimacyLevel: 8,
        lastSeenAt: '1日前',
        thumbUrl: '/monsters/umbrella_monsters/umbrella-monster-1.jpg'
      },
      {
        id: 3,
        name: '財布の精霊',
        category: 'wallet',
        categoryName: '財布',
        categoryEmoji: '👛',
        rarity: 'epic' as Rarity,
        intimacyLevel: 25,
        lastSeenAt: '3日前',
        thumbUrl: '/monsters/wallet_monsters/wallet-monster.jpg'
      }
    ];

    // LocalStorageからthingsデータを読み込み
    const thingsRecords = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
    console.log('図鑑で読み込まれたthingsデータ:', thingsRecords);
    
    // thingsデータからモンスターを生成（重複を避けて親密度を管理）
    const thingsMonstersMap = new Map<string, Monster>();
    
    thingsRecords.forEach((record: ThingsRecord, index: number) => {
      console.log('処理中のrecord:', record);
      console.log('record.thingId:', record.thingId);
      
      // 既存のモンスターが存在するかチェック
      const existingMonster = thingsMonstersMap.get(record.thingId);
      
      if (existingMonster) {
        // 既存のモンスターの親密度を+1、最終記録時間を更新
        existingMonster.intimacyLevel += 1;
        existingMonster.lastSeenAt = getTimeAgo(record.createdAt);
        
        // 親密度に応じて画像とrarityを更新
        existingMonster.thumbUrl = getImagePathByIntimacy(record.thingId, existingMonster.intimacyLevel);
        existingMonster.rarity = getRarityByIntimacy(existingMonster.intimacyLevel);
        
        console.log(`${record.thingType}の親密度が${existingMonster.intimacyLevel}に上がり、rarityが${existingMonster.rarity}になりました`);
      } else {
        // 新しいモンスターを作成
        // 忘れ物の種類に応じて適切な画像パスを生成（親密度1用）
        let imagePath = '/monsters/things/things-monster.jpg'; // デフォルト
        
        if (record.thingId === 'key') {
          imagePath = '/monsters/key/key-monster-1.jpg';
          console.log('鍵のモンスター用画像パス:', imagePath);
        } else if (record.thingId === 'umbrella') {
          imagePath = '/monsters/umbrella/umbrella-monster-1.jpg';
          console.log('傘のモンスター用画像パス:', imagePath);
        } else if (record.thingId === 'wallet') {
          imagePath = '/monsters/wallet/wallet-monster.jpg';
          console.log('財布のモンスター用画像パス:', imagePath);
        } else if (record.thingId === 'medicine') {
          imagePath = '/monsters/medicine/medicine-monster-1.jpg';
          console.log('薬のモンスター用画像パス:', imagePath);
        } else if (record.thingId === 'smartphone') {
          imagePath = '/monsters/phone/phone_monsters.jpg';
          console.log('スマホのモンスター用画像パス:', imagePath);
        } else if (record.thingId === 'homework') {
          imagePath = '/monsters/homework/homework_monsters.jpg';
          console.log('宿題のモンスター用画像パス:', imagePath);
        } else {
          console.log('該当する画像が見つからないthingId:', record.thingId);
        }
        
        const monster: Monster = {
          id: 1000 + index, // ユニークID
          name: `${record.thingType}`,
          category: record.thingId || 'things',
          categoryName: record.thingType || '忘れ物',
          categoryEmoji: '',
          rarity: getRarityByIntimacy(1), // 親密度1用のrarity
          intimacyLevel: 1, // 初期親密度は1
          lastSeenAt: getTimeAgo(record.createdAt),
          thumbUrl: getImagePathByIntimacy(record.thingId, 1) // 親密度1用の画像
        };
        
        thingsMonstersMap.set(record.thingId, monster);
        console.log('新しいモンスターが作成されました:', monster);
      }
    });
    
    // Mapからモンスターの配列を取得
    const thingsMonsters = Array.from(thingsMonstersMap.values());

    // ベースモンスターとthingsモンスターを結合
    const allMonsters = [...baseMonsters, ...thingsMonsters];
    setMonsters(allMonsters);
    console.log('生成された全モンスター:', allMonsters);
    console.log('全モンスター数:', allMonsters.length);
    console.log('財布のモンスター:', allMonsters.filter(m => m.category === 'wallet'));
  }, []);

  // サンプルデータ（実際のAPIから取得）
  const baseMonsters = [
    {
      id: 1,
      name: '鍵の精',
      category: 'key',
      categoryName: '鍵',
      categoryEmoji: '🔑',
      rarity: 'common' as Rarity,
      intimacyLevel: 15,
      lastSeenAt: '2時間前',
      thumbUrl: '/monsters/key/key-monster-1.jpg'
    },
    {
      id: 2,
      name: '傘の守護者',
      category: 'umbrella',
      categoryName: '傘',
      categoryEmoji: '☔',
      rarity: 'rare' as Rarity,
      intimacyLevel: 8,
      lastSeenAt: '1日前',
      thumbUrl: '/monsters/umbrella/umbrella-monster-1.jpg'
    },
    {
      id: 3,
      name: '財布の精霊',
      category: 'wallet',
      categoryName: '財布',
      categoryEmoji: '👛',
      rarity: 'epic' as Rarity,
      intimacyLevel: 25,
      lastSeenAt: '3日前',
      thumbUrl: '/monsters/wallet/wallet-monster-1.jpg'
    }
  ];

  const things = [
    { id: '', name: 'すべて', emoji: '🌟' },
    { id: 'key', name: '鍵', emoji: '🔑' },
    { id: 'medicine', name: '薬', emoji: '💊' },
    { id: 'umbrella', name: '傘', emoji: '☔' },
    { id: 'wallet', name: '財布', emoji: '👛' },
    { id: 'smartphone', name: 'スマホ', emoji: '📱' }
  ];

  const rarities: { value: Rarity | ''; label: string }[] = [
    { value: '', label: 'すべて' },
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
    { value: 'epic', label: 'Epic' },
    { value: 'legendary', label: 'Legendary' }
  ];

  const filteredMonsters = monsters.filter(monster => {
    if (selectedCategory && monster.category !== selectedCategory) return false;
    if (selectedRarity && monster.rarity !== selectedRarity) return false;
    return true;
  });

  // デバッグ用：フィルター後のモンスター数を確認
  console.log('フィルター前のモンスター数:', monsters.length);
  console.log('フィルター後のモンスター数:', filteredMonsters.length);
  console.log('選択中のカテゴリ:', selectedCategory);
  console.log('選択中のレアリティ:', selectedRarity);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">図鑑</h1>
            <p className="text-gray-600">収集したモンスターたち</p>
          </div>
          <Link href="/input">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              忘れ物を記録
            </Button>
          </Link>
        </div>

        {/* フィルター */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Filter className="h-5 w-5 text-primary" />
              フィルター
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* カテゴリフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                忘れたもの
              </label>
              <div className="flex flex-wrap gap-2">
                {things.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    emoji={category.emoji}
                    selected={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(category.id)}
                  />
                ))}
              </div>
            </div>

            {/* レア度フィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                レア度
              </label>
              <div className="flex flex-wrap gap-2">
                {rarities.map((rarity) => (
                  <Chip
                    key={rarity.value}
                    label={rarity.label}
                    selected={selectedRarity === rarity.value}
                    onClick={() => setSelectedRarity(rarity.value)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* モンスター一覧 */}
        {filteredMonsters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMonsters.map((monster) => (
              <Link key={monster.id} href={`/monster/${monster.category}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 flex-shrink-0">
                        <img 
                          src={monster.thumbUrl} 
                          alt={monster.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            // 画像読み込みエラー時は絵文字を表示
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'text-4xl flex items-center justify-center w-full h-full';
                            fallback.textContent = monster.categoryEmoji;
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{monster.name}</h3>
                          <Badge rarity={monster.rarity} />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-500">{monster.categoryEmoji}</span>
                          <span className="text-sm text-gray-600">{monster.categoryName}</span>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          親密度: {monster.intimacyLevel}
                        </div>
                        <div className="text-xs text-gray-400">
                          {monster.lastSeenAt}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="モンスターが見つかりません"
            description="フィルターを調整するか、新しい忘れ物を記録してみてください"
            action={
              <Link href="/input">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  忘れ物を記録
                </Button>
              </Link>
            }
          />
        )}
      </div>
    </MainLayout>
  );
}
