"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Badge, Rarity } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

export default function EncyclopediaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<Rarity | ''>('');

  // サンプルデータ（実際のAPIから取得）
  const monsters = [
    {
      id: 1,
      name: '鍵の精',
      category: 'key',
      categoryName: '鍵',
      categoryEmoji: '🔑',
      rarity: 'common' as Rarity,
      intimacyLevel: 15,
      lastSeenAt: '2時間前',
      thumbUrl: '🔑'
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
      thumbUrl: '☔'
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
      thumbUrl: '👛'
    }
  ];

  const categories = [
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
    { value: 'rare', label: 'Rare' },
    { value: 'epic', label: 'Epic' },
    { value: 'legendary', label: 'Legendary' }
  ];

  const filteredMonsters = monsters.filter(monster => {
    if (selectedCategory && monster.category !== selectedCategory) return false;
    if (selectedRarity && monster.rarity !== selectedRarity) return false;
    return true;
  });

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
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              フィルター
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* カテゴリフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
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
              <Link key={monster.id} href={`/monster/${monster.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{monster.thumbUrl}</div>
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
