"use client";
export const dynamic = 'force-dynamic';
import React, { useState } from 'react';

// 型定義
interface ThingsRecord {
  id: string;
  category: string;
  thingType: string;
  thingId: string; // 例: 'key' | 'umbrella' | 'wallet' | 'medicine' | 'smartphone' | 'homework' | 'schedule' | 'time'
  title: string;
  content: string;
  details: string;
  difficulty: number; // 1〜10想定（難易度でランク判定）
  location: string;
  datetime: string;
  createdAt: string;
}

// ランク定義（SSランク、Sランク、Aランク、Bランク、Cランク）
type Rank = 'SS' | 'S' | 'A' | 'B' | 'C';

interface Monster {
  id: number;
  name: string;
  category: string; // 元の thingId（例: 'wallet'）
  categoryName: string; // 表示名
  categoryEmoji: string;
  rank: Rank; // ← 親密度ではなくランク
  lastSeenAt: string;
  thumbUrl: string;
}

interface CategoryCard {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  type: 'category';
}

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Filter, Plus } from 'lucide-react';
import Link from 'next/link';

export default function EncyclopediaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRank, setSelectedRank] = useState<Rank | ''>('');
  const [monsters, setMonsters] = useState<Monster[]>([]);

  // ------- ユーティリティ -------
  // 経過時間表示
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

  // 画像パス（固定: 親密度の概念は削除）
  const getImagePathByThingId = (thingId: string): string => {
    switch (thingId) {
      case 'key':
        return '/monsters/key/key-monster-1.jpg';
      case 'umbrella':
        return '/monsters/umbrella/umbrella-monster-1.jpg';
      case 'wallet':
        return '/monsters/wallet/wallet-monster.jpg';
      case 'medicine':
        return '/monsters/medicine/medicine-monster-1.jpg';
      case 'smartphone':
        return '/monsters/phone/phone_monsters.jpg';
      case 'homework':
        return '/monsters/homework/homework_monsters.jpg';
      case 'schedule':
        return '/monsters/schedule/schedule_monsters.png';
      case 'time':
        return '/monsters/time/time_monster.png';
      default:
        return '/monsters/wallet/wallet-monster.jpg';
    }
  };

  // 難易度→ランク（5段階評価）
  const getRankByDifficulty = (difficulty?: number): Rank => {
    const d = difficulty ?? 3; // 未指定なら中間
    if (d >= 9) return 'SS';
    if (d >= 7) return 'S';
    if (d >= 5) return 'A';
    if (d >= 3) return 'B';
    return 'C';
  };

  // 遭遇回数→ランク（5段階評価）
  const getRankByEncounterCount = (encounterCount: number): Rank => {
    if (encounterCount > 20) return 'SS';
    if (encounterCount > 15) return 'S';
    if (encounterCount > 10) return 'A';
    if (encounterCount > 5) return 'B';
    return 'C';
  };

  // 元の thingId を新しい3カテゴリへマッピング
  // 物忘れ: key/umbrella/wallet/medicine/smartphone/homework など
  // 予定忘れ: schedule
  // 寝坊・遅刻: time
  const NEW_CATEGORY_MAP: Record<string, 'misplacement' | 'missed_schedule' | 'overslept'> = {
    key: 'misplacement',
    umbrella: 'misplacement',
    wallet: 'misplacement',
    medicine: 'misplacement',
    smartphone: 'misplacement',
    homework: 'misplacement',
    schedule: 'missed_schedule',
    time: 'overslept',
  };

  // 表示用カテゴリ一覧（UIのフィルタ）
  const [categories, setCategories] = useState([
    { id: '', name: 'すべて', emoji: '🌟' },
    { id: 'forget_things', name: '物忘れ', emoji: '🔍' },
    { id: 'forget_schedule', name: '予定忘れ', emoji: '📅' },
    { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰' },
    { id: 'another', name: 'その他', emoji: '😊' },
  ]);

  // カスタムカテゴリを読み込み
  React.useEffect(() => {
    const loadCustomCategories = () => {
      const saved = localStorage.getItem('customCards');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.categories && data.categories.length > 0) {
            // カスタムカテゴリを追加
            const customCategories = data.categories.map((cat: CategoryCard) => ({
              id: cat.id,
              name: cat.name,
              emoji: cat.emoji
            }));
            
            setCategories([
              { id: '', name: 'すべて', emoji: '🌟' },
              ...customCategories
            ]);
          }
        } catch (error) {
          console.error('カスタムカテゴリの読み込みに失敗:', error);
        }
      }
    };

    loadCustomCategories();

    // LocalStorageの変更を監視
    const handleStorageChange = () => loadCustomCategories();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customCardsChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customCardsChanged', handleStorageChange);
    };
  }, []);

  // ランクフィルタ一覧（5段階評価）
  const ranks: { value: Rank | ''; label: string }[] = [
    { value: '', label: 'すべて' },
    { value: 'SS', label: 'SSランク' },
    { value: 'S', label: 'Sランク' },
    { value: 'A', label: 'Aランク' },
    { value: 'B', label: 'Bランク' },
    { value: 'C', label: 'Cランク' },
  ];

  // ------- データ生成 -------
  React.useEffect(() => {
    // 既存のサンプル（固定）
    const baseMonsters: Monster[] = [
      {
        id: 1,
        name: '鍵の精',
        category: 'key',
        categoryName: '鍵',
        categoryEmoji: '🔑',
        rank: 'B',
        lastSeenAt: '2時間前',
        thumbUrl: '/monsters/key/key-monster-1.jpg',
      },
      {
        id: 2,
        name: '傘の守護者',
        category: 'umbrella',
        categoryName: '傘',
        categoryEmoji: '☔',
        rank: 'A',
        lastSeenAt: '1日前',
        thumbUrl: '/monsters/umbrella/umbrella-monster-1.jpg'
      },
      {
        id: 3,
        name: '財布の精霊',
        category: 'wallet',
        categoryName: '財布',
        categoryEmoji: '👛',
        rank: 'S',
        lastSeenAt: '3日前',
        thumbUrl: '/monsters/wallet/wallet-monster.jpg',
      },
    ];

    // LocalStorage から things を読み込む
    const thingsRecords: ThingsRecord[] = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
    console.log('図鑑で読み込まれたthingsデータ:', thingsRecords);

    // thingId ごとに 1 体生成（最新の記録時間、最大難易度 で代表化）
    const byThingId = new Map<string, { latestAt: string; maxDifficulty: number; sample: ThingsRecord }>();

    for (const rec of thingsRecords) {
      const prev = byThingId.get(rec.thingId);
      if (!prev) {
        byThingId.set(rec.thingId, { latestAt: rec.createdAt, maxDifficulty: rec.difficulty ?? 3, sample: rec });
      } else {

        const latestAt = new Date(rec.createdAt) > new Date(prev.latestAt) ? rec.createdAt : prev.latestAt;
        const maxDifficulty = Math.max(prev.maxDifficulty, rec.difficulty ?? 3);
        byThingId.set(rec.thingId, { latestAt, maxDifficulty, sample: rec });
      }
    }

    const thingsMonsters: Monster[] = Array.from(byThingId.entries()).map(([thingId, info], index) => {
      const sample = info.sample;
      const displayName = sample.thingType || '忘れ物';
      const emoji =
        thingId === 'key' ? '🔑' :
        thingId === 'umbrella' ? '☔' :
        thingId === 'wallet' ? '👛' :
        thingId === 'medicine' ? '💊' :
        thingId === 'smartphone' ? '📱' :
        thingId === 'homework' ? '📄' :
        thingId === 'schedule' ? '📅' :
        thingId === 'time' ? '⏰' : '😊';

      return {
        id: 1000 + index,
        name: displayName,
        category: thingId,
        categoryName: displayName,
        categoryEmoji: emoji,
        rank: getRankByEncounterCount(thingsRecords.filter(r => r.thingId === thingId).length),
        lastSeenAt: getTimeAgo(info.latestAt),
        thumbUrl: getImagePathByThingId(thingId),
      };
    });


    setMonsters([...baseMonsters, ...thingsMonsters]);
  }, []);

  // ------- フィルタ処理 -------
  const matchesNewCategory = (monster: Monster, selected: string) => {
    if (!selected) return true; // すべて
    const mapped = NEW_CATEGORY_MAP[monster.category];
    return mapped === selected;
  };

  const filteredMonsters = monsters.filter((m) => {
    if (!matchesNewCategory(m, selectedCategory)) return false;
    if (selectedRank && m.rank !== selectedRank) return false;
    return true;
  });

  // デバッグ
  console.log('フィルター前のモンスター数:', monsters.length);
  console.log('フィルター後のモンスター数:', filteredMonsters.length);
  console.log('選択中のカテゴリ(新3分類):', selectedCategory);
  console.log('選択中のランク:', selectedRank);

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
            {/* カテゴリフィルター（新3分類） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    emoji={c.emoji}
                    selected={selectedCategory === c.id}
                    onClick={() => setSelectedCategory(c.id)}
                  />
                ))}
              </div>
            </div>

            {/* ランクフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ランク</label>
              <div className="flex flex-wrap gap-2">
                {ranks.map((r) => (
                  <Chip
                    key={r.value || 'all'}
                    label={r.label}
                    selected={selectedRank === r.value}
                    onClick={() => setSelectedRank(r.value)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* モンスター一覧 */}
        {filteredMonsters.length > 0 ? (
          <div className="space-y-6">
            {/* カテゴリ別にグループ化 */}
            {(() => {
              const groupedMonsters = new Map<string, Monster[]>();
              
              // カテゴリ別にモンスターをグループ化
              filteredMonsters.forEach(monster => {
                const categoryId = monster.category;
                if (!groupedMonsters.has(categoryId)) {
                  groupedMonsters.set(categoryId, []);
                }
                groupedMonsters.get(categoryId)!.push(monster);
              });

              return Array.from(groupedMonsters.entries()).map(([categoryId, monsters]) => {
                const category = categories.find(cat => cat.id === categoryId);
                if (!category) return null;

                return (
                  <div key={categoryId} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.emoji}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <span className="text-sm text-gray-500">({monsters.length}体)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {monsters.map((monster) => (
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
                                    {/* SS/S/A/B/C ランク表示（5段階評価）*/}
                                    <span
                                      className={
                                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ' +
                                        (monster.rank === 'SS'
                                          ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                                          : monster.rank === 'S'
                                          ? 'border-purple-500 text-purple-600 bg-purple-50'
                                          : monster.rank === 'A'
                                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                                          : monster.rank === 'B'
                                          ? 'border-green-500 text-green-600 bg-green-50'
                                          : 'border-gray-400 text-gray-600 bg-gray-50')
                                      }
                                      aria-label={`${monster.rank}ランク`}
                                    >
                                      {monster.rank}ランク
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm text-gray-500">{monster.categoryEmoji}</span>
                                    <span className="text-sm text-gray-600">{monster.categoryName}</span>
                                  </div>
                                  <div className="text-xs text-gray-400">{monster.lastSeenAt}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
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
