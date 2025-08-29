"use client";
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';

// 型定義
interface ThingsRecord {
  id: string;
  category: string;
  categoryName?: string;
  categoryEmoji?: string;
  thingType: string;
  thingId: string; // 例: 'key' | 'umbrella' | 'wallet' | 'medicine' | 'smartphone' | 'homework' | 'schedule' | 'time'
  title?: string;
  difficulty: number; // 1〜10想定（難易度でランク判定）
  situation?: string[];
  createdAt: string;
  didForget: boolean;
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

  // monstersステートの変更を監視
  useEffect(() => {
    console.log('monstersステートが変更されました:', monsters.length, '件');
  }, [monsters]);

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
        return '/monsters/late/late_monsters.jpg'; // lateディレクトリを使用
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

  // 元の thingId を新しいカテゴリへマッピング
  // 物忘れ: key/umbrella/wallet/medicine/smartphone/homework など
  // 予定忘れ: schedule
  // 寝坊・遅刻: time
  const NEW_CATEGORY_MAP: Record<string, 'forget_things' | 'forget_schedule' | 'oversleep_late'> = {
    key: 'forget_things',
    umbrella: 'forget_things',
    wallet: 'forget_things',
    medicine: 'forget_things',
    smartphone: 'forget_things',
    homework: 'forget_things',
    schedule: 'forget_schedule',
    time: 'oversleep_late',
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
  useEffect(() => {
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
  const generateMonsters = () => {
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

    // 既存のモンスターを読み込み（入力画面で作成されたもの）
    const existingMonsters: Monster[] = [
      {
        id: 100,
        name: '薬の精',
        category: 'medicine',
        categoryName: '薬',
        categoryEmoji: '💊',
        rank: 'C',
        lastSeenAt: '1週間前',
        thumbUrl: '/monsters/medicine/medicine-monster-1.jpg',
      },
      {
        id: 101,
        name: 'スマホの精',
        category: 'smartphone',
        categoryName: 'スマホ',
        categoryEmoji: '📱',
        rank: 'B',
        lastSeenAt: '3日前',
        thumbUrl: '/monsters/phone/phone_monsters.jpg',
      },
      {
        id: 102,
        name: '宿題の精',
        category: 'homework',
        categoryName: '宿題',
        categoryEmoji: '📄',
        rank: 'A',
        lastSeenAt: '5日前',
        thumbUrl: '/monsters/homework/homework_monsters.jpg',
      },
      {
        id: 103,
        name: '予定の精',
        category: 'schedule',
        categoryName: '予定',
        categoryEmoji: '📅',
        rank: 'C',
        lastSeenAt: '2週間前',
        thumbUrl: '/monsters/schedule/schedule_monsters.png',
      },
      {
        id: 104,
        name: '時間の精',
        category: 'time',
        categoryName: '遅刻',
        categoryEmoji: '⏰',
        rank: 'B',
        lastSeenAt: '1週間前',
        thumbUrl: '/monsters/time/time_monster.png',
      },
    ];

    // LocalStorage から things を読み込む
    const thingsRecords: ThingsRecord[] = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
    console.log('図鑑で読み込まれたthingsデータ:', thingsRecords);
    console.log('didForget === true の記録数:', thingsRecords.filter(r => r.didForget === true).length);

    // thingId ごとに 1 体生成（最新の記録時間、最大難易度 で代表化）
    const byThingId = new Map<string, { latestAt: string; maxDifficulty: number; sample: ThingsRecord }>();

    for (const rec of thingsRecords) {
      // didForget === true の記録のみを対象とする
      if (rec.didForget !== true) continue;
      
      const prev = byThingId.get(rec.thingId);
      if (!prev) {
        byThingId.set(rec.thingId, { latestAt: rec.createdAt, maxDifficulty: rec.difficulty ?? 3, sample: rec });
      } else {
        const latestAt = new Date(rec.createdAt) > new Date(prev.latestAt) ? rec.createdAt : prev.latestAt;
        const maxDifficulty = Math.max(prev.maxDifficulty, rec.difficulty ?? 3);
        byThingId.set(rec.thingId, { latestAt, maxDifficulty, sample: rec });
      }
    }

    console.log('byThingId のサイズ:', byThingId.size);
    console.log('生成されるモンスター数:', byThingId.size);

    const thingsMonsters: Monster[] = Array.from(byThingId.entries()).map(([thingId, info], index) => {
      const sample = info.sample;
      const displayName = sample.thingType || '忘れ物';
      
      // カスタムカテゴリの情報があれば使用、なければデフォルト
      const categoryName = sample.categoryName || displayName;
      const categoryEmoji = sample.categoryEmoji || (
        thingId === 'key' ? '🔑' :
        thingId === 'umbrella' ? '☔' :
        thingId === 'wallet' ? '👛' :
        thingId === 'medicine' ? '💊' :
        thingId === 'smartphone' ? '📱' :
        thingId === 'homework' ? '📄' :
        thingId === 'schedule' ? '📅' :
        thingId === 'time' ? '⏰' : '😊'
      );

      // カテゴリIDを正しく設定
      // 入力画面で保存されたカテゴリIDがあれば使用、なければthingIdをマッピング
      const categoryId = sample.category || NEW_CATEGORY_MAP[thingId] || 'forget_things';

      console.log(`モンスター生成: ${displayName} (${thingId}) -> カテゴリID: ${categoryId}`, {
        sampleCategory: sample.category,
        mappedCategory: NEW_CATEGORY_MAP[thingId],
        finalCategory: categoryId
      });

      return {
        id: 1000 + index,
        name: displayName,
        category: categoryId, // カテゴリIDを使用
        categoryName: categoryName,
        categoryEmoji: categoryEmoji,
        rank: getRankByEncounterCount(thingsRecords.filter(r => r.thingId === thingId && r.didForget === true).length),
        lastSeenAt: getTimeAgo(info.latestAt),
        thumbUrl: getImagePathByThingId(thingId),
      };
    });

    const finalMonsters = [...baseMonsters, ...existingMonsters, ...thingsMonsters];
    console.log('最終的なモンスター数:', finalMonsters.length);
    console.log('baseMonsters:', baseMonsters.length, 'existingMonsters:', existingMonsters.length, 'thingsMonsters:', thingsMonsters.length);
    console.log('setMonsters を呼び出します:', finalMonsters);
    
    // モンスターの詳細もログに出力
    finalMonsters.forEach((monster, index) => {
      console.log(`モンスター${index + 1}:`, monster.name, monster.category, monster.rank);
    });
    
    setMonsters(finalMonsters);
    
    // モンスターデータをLocalStorageに保存（詳細画面で使用）
    localStorage.setItem('encyclopediaMonsters', JSON.stringify(finalMonsters));
    
    console.log('setMonsters 完了');
  };

  // 初回読み込みとLocalStorageの変更を監視
  useEffect(() => {
    let isInitialized = false;

    const loadAndGenerate = () => {
      if (isInitialized) {
        console.log('generateMonsters が実行されました（更新）');
      } else {
        console.log('generateMonsters が実行されました（初回）');
        isInitialized = true;
      }
      generateMonsters();
    };

    // 初回読み込み
    loadAndGenerate();

    // LocalStorageの変更を監視
    const handleStorageChange = () => {
      console.log('LocalStorage変更を検知しました');
      // 少し遅延を入れて実行
      setTimeout(() => {
        loadAndGenerate();
      }, 100);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('thingsRecordsChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('thingsRecordsChanged', handleStorageChange);
    };
  }, []);

  // ------- フィルタ処理 -------
  const matchesNewCategory = (monster: Monster, selected: string) => {
    if (!selected) return true; // すべて
    
    // モンスターのカテゴリ情報を取得
    let monsterCategoryId: string;
    
    // デバッグ用ログ
    console.log(`フィルタリング処理開始: ${monster.name}`, {
      category: monster.category,
      categoryName: monster.categoryName,
      categoryEmoji: monster.categoryEmoji,
      selected: selected
    });
    
    if (monster.categoryName && monster.categoryEmoji && monster.category !== monster.categoryName) {
      // 新しいデータ構造（入力画面から保存されたデータ）
      // categoryプロパティにカテゴリIDが保存されている
      monsterCategoryId = monster.category;
      console.log(`新しいデータ構造を使用: ${monsterCategoryId}`);
    } else {
      // 古いデータ構造（サンプルデータ）
      // thingIdをカテゴリIDにマッピング
      monsterCategoryId = NEW_CATEGORY_MAP[monster.category] || 'forget_things';
      console.log(`古いデータ構造を使用: ${monster.category} -> ${monsterCategoryId}`);
    }
    
    // 選択されたカテゴリと一致するかチェック
    const categoryMatch = monsterCategoryId === selected;
    
    console.log(`フィルタリング結果: モンスター ${monster.name} (${monster.category}) -> カテゴリID: ${monsterCategoryId}, 選択: ${selected}, 一致: ${categoryMatch}`);
    
    return categoryMatch;
  };

  const filteredMonsters = monsters.filter((m) => {
    const categoryMatch = matchesNewCategory(m, selectedCategory);
    const rankMatch = !selectedRank || m.rank === selectedRank;
    
    // フィルタリング結果をログに出力
    if (selectedCategory || selectedRank) {
      console.log(`フィルタリング結果: ${m.name} (${m.category}) - カテゴリ: ${categoryMatch}, ランク: ${rankMatch}`);
    }
    
    if (!categoryMatch) return false;
    if (!rankMatch) return false;
    return true;
  });

  // デバッグ
  console.log('フィルター前のモンスター数:', monsters.length);
  console.log('フィルター後のモンスター数:', filteredMonsters.length);
  console.log('選択中のカテゴリ(新3分類):', selectedCategory);
  console.log('選択中のランク:', selectedRank);
  
  // フィルタリング詳細（フィルターが適用されている場合のみ）
  if (selectedCategory || selectedRank) {
    console.log('フィルタリング詳細:', {
      totalMonsters: monsters.length,
      filteredCount: filteredMonsters.length,
      selectedCategory,
      selectedRank,
      monsters: filteredMonsters.map(m => {
        // カテゴリIDを正しく取得
        let categoryId: string;
        if (m.categoryName && m.categoryEmoji && m.category !== m.categoryName) {
          categoryId = m.category; // 新しいデータ構造
        } else {
          categoryId = NEW_CATEGORY_MAP[m.category] || 'forget_things'; // 古いデータ構造
        }
        
        return {
          name: m.name, 
          category: m.category, 
          categoryId: categoryId,
          categoryName: m.categoryName,
          rank: m.rank 
        };
      })
    });
  }

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
          <div className="space-y-4">
            {/* 時系列順で横並びに表示 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMonsters.map((monster) => (
                <Link key={monster.id} href={`/monster/${monster.id}`}>
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
