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
  difficulty: number; // 1〜10想定
  situation?: string[];
  createdAt: string;
  didForget: boolean;
}

interface Monster {
  id: number;
  name: string;
  category: string; // 元の thingId（例: 'wallet'）
  categoryName: string; // 表示名
  categoryEmoji: string;
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
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

export default function EncyclopediaPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [fairies, setFairies] = useState<Monster[]>([]);
  const [apiData, setApiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fairyFeed, setFairyFeed] = useState<{ [key: string]: { fed: number } } | null>(null);

  // fairiesステートの変更を監視
  useEffect(() => {
    console.log('fairiesステートが変更されました:', fairies.length, '件');
  }, [fairies]);

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

  // 画像パス（妖精の画像を使用）
  const getImagePathByThingId = (thingId: string): string => {
    switch (thingId) {
      case 'key':
        return '/fairies/key/key1.jpg';
      case 'umbrella':
        return '/fairies/umbrella/umbrella1.jpg';
      case 'wallet':
        return '/fairies/wallet/wallet1.jpg';
      case 'medicine':
        return '/fairies/medicine/medicine1.jpg';
      case 'smartphone':
        return '/fairies/phone/phone1.jpg';
      case 'homework':
        return '/fairies/homework/homework1.jpg';
      case 'schedule':
        return '/fairies/schedule/schedule1.jpg';
      case 'time':
        return '/fairies/time/time1.jpg';
      default:
        return '/fairies/wallet/wallet1.jpg';
    }
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
    { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰' }
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
              { id: 'forget_things', name: '物忘れ', emoji: '🔍' },
              { id: 'forget_schedule', name: '予定忘れ', emoji: '📅' },
              { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰' },
              ...customCategories
            ]);
          } else {
            // カスタムカテゴリがない場合は基本カテゴリのみ
            setCategories([
              { id: '', name: 'すべて', emoji: '🌟' },
              { id: 'forget_things', name: '物忘れ', emoji: '🔍' },
              { id: 'forget_schedule', name: '予定忘れ', emoji: '📅' },
              { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰' }
            ]);
          }
        } catch (error) {
          console.error('カスタムカテゴリの読み込みに失敗:', error);
          // エラー時も基本カテゴリを表示
          setCategories([
            { id: '', name: 'すべて', emoji: '🌟' },
            { id: 'forget_things', name: '物忘れ', emoji: '🔍' },
            { id: 'forget_schedule', name: '予定忘れ', emoji: '📅' },
            { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰' }
          ]);
        }
      } else {
        // カスタムカテゴリがない場合は基本カテゴリのみ
        setCategories([
          { id: '', name: 'すべて', emoji: '🌟' },
          { id: 'forget_things', name: '物忘れ', emoji: '🔍' },
          { id: 'forget_schedule', name: '予定忘れ', emoji: '📅' },
          { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰' }
        ]);
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



  // APIからデータを取得
  const fetchAPIData = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await apiClient.getForgottenItems();
      if (result.success && result.data) {
        setApiData(result.data);
        console.log('API取得データ:', result.data);
      }
    } catch (error) {
      console.error('API取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // ------- データ生成 -------
  const generateFairies = () => {

    // LocalStorage から things を読み込む
    const thingsRecords: ThingsRecord[] = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
    console.log('図鑑で読み込まれたthingsデータ:', thingsRecords);
    console.log('didForget === true の記録数:', thingsRecords.filter(r => r.didForget === true).length);

    // APIデータをthingsRecords形式に変換して統合
    // thingIdの正規化関数
    const normalizeThingId = (itemName: string): string => {
      const normalized = itemName?.toLowerCase().replace(/\s+/g, '_') || 'item';
      // APIの忘れ物名を標準的なthingIdにマッピング
      const mapping: { [key: string]: string } = {
        '鍵': 'key',
        '傘': 'umbrella', 
        '財布': 'wallet',
        '薬': 'medicine',
        'スマホ': 'smartphone',
        '宿題': 'homework',
        '予定': 'schedule',
        '遅刻': 'time',
        '時間': 'time'
      };
      return mapping[itemName] || normalized;
    };

    const apiRecords: ThingsRecord[] = apiData.map((item: any, index: number) => {
      const itemName = item.forgotten_item || item.title || '忘れ物';
      return {
        id: `api_${item.id || index}`,
        category: item.category || 'forget_things',
        categoryName: item.category || '忘れ物',
        categoryEmoji: '📦',
        thingType: itemName,
        thingId: normalizeThingId(itemName), // 正規化されたthingIdを使用
        title: item.title || '',
        difficulty: item.difficulty || 3,
        situation: Array.isArray(item.situation) ? item.situation : [],
        createdAt: item.datetime || item.created_at || new Date().toISOString(),
        didForget: true
      };
    });

    console.log('API変換後データ:', apiRecords);

    // LocalStorageとAPIデータを統合
    const allRecords = [...thingsRecords.filter(r => r.didForget === true), ...apiRecords];

    console.log('統合前のLocalStorageデータ数:', thingsRecords.filter(r => r.didForget === true).length);
    console.log('統合前のAPIデータ数:', apiRecords.length);
    console.log('統合後の全レコード数:', allRecords.length);

    // thingId ごとに 1 体生成（最新の記録時間、最大難易度 で代表化）
    // 重複を完全に排除するため、thingIdとcategory両方でキーを作成
    const byUniqueKey = new Map<string, { latestAt: string; maxDifficulty: number; sample: ThingsRecord }>();

    for (const rec of allRecords) {
      // didForget === true の記録のみを対象とする
      if (rec.didForget !== true) continue;
      
      // thingIdとカテゴリの組み合わせでユニークキーを作成
      const uniqueKey = `${rec.thingId}_${rec.category || 'default'}`;
      console.log(`処理中のレコード: ${rec.thingType} (${rec.thingId}) -> キー: ${uniqueKey}`);
      
      const prev = byUniqueKey.get(uniqueKey);
      if (!prev) {
        byUniqueKey.set(uniqueKey, { latestAt: rec.createdAt, maxDifficulty: rec.difficulty ?? 3, sample: rec });
      } else {
        const latestAt = new Date(rec.createdAt) > new Date(prev.latestAt) ? rec.createdAt : prev.latestAt;
        const maxDifficulty = Math.max(prev.maxDifficulty, rec.difficulty ?? 3);
        byUniqueKey.set(uniqueKey, { latestAt, maxDifficulty, sample: rec });
      }
    }

    console.log('byUniqueKey のサイズ:', byUniqueKey.size);
    console.log('生成される妖精数:', byUniqueKey.size);

    const thingsFairies: Monster[] = Array.from(byUniqueKey.entries()).map(([uniqueKey, info], index) => {
      // uniqueKeyから元のthingIdを取得
      const thingId = uniqueKey.split('_')[0];
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
         lastSeenAt: getTimeAgo(info.latestAt),
         thumbUrl: getImagePathByThingId(thingId),
       };
    });

    // 実際の記録があるものだけを表示し、重複を排除
    const finalFairies = thingsFairies;
    console.log('最終的な妖精数:', finalFairies.length);
    console.log('thingsFairies:', thingsFairies.length);
    console.log('setFairies を呼び出します:', finalFairies);
    
    // 妖精の詳細もログに出力
    finalFairies.forEach((fairy, index) => {
      console.log(`妖精${index + 1}:`, fairy.name, fairy.category);
    });
    
    setFairies(finalFairies);
    
    // 妖精データをLocalStorageに保存（詳細画面で使用）
    localStorage.setItem('encyclopediaFairies', JSON.stringify(finalFairies));
    
    console.log('setFairies 完了');
  };

  // 初回読み込みとデータ更新を監視
  useEffect(() => {
    // APIデータを取得
    fetchAPIData();
  }, [user, token]);

  // APIデータが更新されたら妖精生成
  useEffect(() => {
    let isInitialized = false;

    const loadAndGenerate = () => {
      if (isInitialized) {
        console.log('generateFairies が実行されました（更新）');
      } else {
        console.log('generateFairies が実行されました（初回）');
        isInitialized = true;
      }
      generateFairies();
    };

    // APIデータまたはLocalStorageが更新されたら再生成
    loadAndGenerate();

    // LocalStorageの変更を監視
    const handleStorageChange = () => {
      console.log('LocalStorage変更を検知しました');
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
  }, [apiData]); // apiDataが変更されたら再実行

  // fairyFeed をクライアントで読み込み＆更新監視
  useEffect(() => {
    const load = () => {
      try {
        const feed = JSON.parse(localStorage.getItem('fairyFeed') || '{}');
        setFairyFeed(feed);
      } catch {
        setFairyFeed({});
      }
    };
    load();
    const onChange = () => load();
    window.addEventListener('storage', onChange);
    window.addEventListener('feed:inventoryChanged', onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('feed:inventoryChanged', onChange);
    };
  }, []);

  // ------- フィルタ処理 -------
  const matchesNewCategory = (fairy: Monster, selected: string) => {
    if (!selected) return true; // すべて
    
    // 妖精のカテゴリ情報を取得
    let fairyCategoryId: string;
    
    // デバッグ用ログ
    console.log(`フィルタリング処理開始: ${fairy.name}`, {
      category: fairy.category,
      categoryName: fairy.categoryName,
      categoryEmoji: fairy.categoryEmoji,
      selected: selected
    });
    
    if (fairy.categoryName && fairy.categoryEmoji && fairy.category !== fairy.categoryName) {
      // 新しいデータ構造（入力画面から保存されたデータ）
      // categoryプロパティにカテゴリIDが保存されている
      fairyCategoryId = fairy.category;
      console.log(`新しいデータ構造を使用: ${fairyCategoryId}`);
    } else {
      // 古いデータ構造（サンプルデータ）
      // thingIdをカテゴリIDにマッピング
      fairyCategoryId = NEW_CATEGORY_MAP[fairy.category] || 'forget_things';
      console.log(`古いデータ構造を使用: ${fairy.category} -> ${fairyCategoryId}`);
    }
    
    // 選択されたカテゴリと一致するかチェック
    const categoryMatch = fairyCategoryId === selected;
    
    console.log(`フィルタリング結果: 妖精 ${fairy.name} (${fairy.category}) -> カテゴリID: ${fairyCategoryId}, 選択: ${selected}, 一致: ${categoryMatch}`);
    
    return categoryMatch;
  };

  const filteredFairies = fairies.filter((f) => {
    const categoryMatch = matchesNewCategory(f, selectedCategory);
    
    // フィルタリング結果をログに出力
    if (selectedCategory) {
      console.log(`フィルタリング結果: ${f.name} (${f.category}) - カテゴリ: ${categoryMatch}`);
    }
    
    if (!categoryMatch) return false;
    return true;
  });

  // デバッグ
  console.log('フィルター前の妖精数:', fairies.length);
  console.log('フィルター後の妖精数:', filteredFairies.length);
  console.log('選択中のカテゴリ(新3分類):', selectedCategory);
  
  // フィルタリング詳細（フィルターが適用されている場合のみ）
  if (selectedCategory) {
    console.log('フィルタリング詳細:', {
      totalFairies: fairies.length,
      filteredCount: filteredFairies.length,
      selectedCategory,
      fairies: filteredFairies.map(f => {
        // カテゴリIDを正しく取得
        let categoryId: string;
        if (f.categoryName && f.categoryEmoji && f.category !== f.categoryName) {
          categoryId = f.category; // 新しいデータ構造
        } else {
          categoryId = NEW_CATEGORY_MAP[f.category] || 'forget_things'; // 古いデータ構造
        }
        
                 return {
           name: f.name, 
           category: f.category, 
           categoryId: categoryId,
           categoryName: f.categoryName
         };
      })
    });
  }

  // 認証ローディング中は安定したプレースホルダを表示
  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-accent"></div>
        </div>
      </MainLayout>
    );
  }

  // 未認証の場合
  if (!user) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="forest-card p-8 rounded-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-forest-primary mb-4">
                図鑑を見るにはログインが必要です
              </h2>
              <p className="text-forest-secondary mb-6">
                忘れ物を記録してモンスターを収集しましょう。
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/login">
                  <button className="forest-button px-6 py-2 rounded-lg">ログイン</button>
                </Link>
                <Link href="/register">
                  <button className="forest-button px-6 py-2 rounded-lg">新規登録</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ローディング中
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-accent"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="forest-card p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-forest-primary flex items-center gap-2">
                📚 図鑑
              </h1>
              <p className="text-forest-secondary">
                収集した妖精たち ({filteredFairies.length}体)
                {selectedCategory && (
                  <span className="ml-2 text-forest-accent font-medium">
                    • {categories.find(c => c.id === selectedCategory)?.name}カテゴリ
                  </span>
                )}
              </p>
              <p className="text-sm text-forest-secondary mt-1">
                カテゴリを選択して、特定の種類の忘れ物妖精を絞り込めます
              </p>
            </div>
            <Link href="/input">
              <button className="forest-button px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                忘れ物を記録
              </button>
            </Link>
          </div>
        </div>

        {/* カテゴリフィルター */}
        <div className="forest-card p-6 rounded-xl">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-forest-primary">
              <Filter className="h-5 w-5 text-forest-accent" />
              カテゴリで絞り込み
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium forest-label mb-3">
                忘れ物の種類を選択してください
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {categories.filter(c => c.id !== '').map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    emoji={c.emoji}
                    selected={selectedCategory === c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className="justify-center py-3 text-base"
                  />
                ))}
              </div>
              {selectedCategory && (
                <div className="mt-3 p-2 bg-emerald-900/30 rounded-lg border-2 border-emerald-400/40">
                  <div className="text-sm text-forest-accent text-center">
                    📍 選択中: {categories.find(c => c.id === selectedCategory)?.name}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 妖精一覧 */}
        {filteredFairies.length > 0 ? (
          <div className="space-y-4">
            {/* 時系列順で横並びに表示 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFairies.map((fairy) => (
                <Link key={fairy.id} href={`/monster/${fairy.id}`}>
                  <div className="forest-card p-4 rounded-xl hover:scale-105 transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            src={fairy.thumbUrl}
                            alt={fairy.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'text-4xl flex items-center justify-center w-full h-full';
                              fallback.textContent = fairy.categoryEmoji;
                              target.parentNode?.appendChild(fallback);
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-forest-primary truncate">{fairy.name}</h3>
                          </div>
                          
                          {/* レベル表示を追加 */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-emerald-900/40 text-forest-accent px-2 py-1 rounded-full font-medium border border-emerald-400/30">
                              Lv.{fairyFeed === null ? '...' : Math.min(Math.floor(((fairyFeed[fairy.category]?.fed || 0) / 5)), 100)}
                            </span>
                          </div>
                          <div className="text-xs text-forest-secondary">{fairy.lastSeenAt}</div>
                        </div>
                      </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
                      <div className="forest-card p-8 rounded-xl text-center">
              <div className="text-6xl mb-4">🧚</div>
              <h3 className="text-xl font-bold text-forest-primary mb-2">
                妖精が見つかりません
              </h3>
              <p className="text-forest-secondary mb-6">
                フィルターを調整するか、新しい忘れ物を記録してみてください
              </p>
            <Link href="/input">
              <button className="forest-button px-6 py-2 rounded-lg flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                忘れ物を記録
              </button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
