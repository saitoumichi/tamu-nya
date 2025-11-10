"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Modal } from '@/components/ui/modal';
import { Plus, Save, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

// 追加ユーティリティ（ファイル内の上部に追記）
const readFeedInventory = () => parseInt(localStorage.getItem('feedInventory') || '0');
const writeFeedInventory = (n: number) => localStorage.setItem('feedInventory', String(Math.max(0, n)));
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
};

export default function InputPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    note: '',
    forgottenItem: '',
    difficulty: 3,
    situation: [] as string[],
    didForget: true // デフォルトは忘れた（既存の動作を維持）
  });

  const [hasClaimedFeedToday, setHasClaimedFeedToday] = useState(false);
  const [forgetMode, setForgetMode] = useState<'new' | 'existing'>('new');
  const [selectedExistingMonster, setSelectedExistingMonster] = useState<{
    thingId: string;
    thingType: string;
    emoji: string;
  } | null>(null);

  const [showResultModal, setShowResultModal] = useState(false);
  const [monsterInfo, setMonsterInfo] = useState<{
    name: string;
    encounterCount: number;
    intimacyLevel: number;
    rank: string;
  } | null>(null);

  useEffect(() => {
    console.log('showResultModal changed:', showResultModal);
  }, [showResultModal]);

  useEffect(() => {
    // 今日の日付を取得
    const today = new Date().toISOString().slice(0, 10);
    
    // localStorage から前回の受取日を取得
    const lastClaimedDate = localStorage.getItem('dailyFeedClaimedAt');
    
    // 今日受取済みかどうかを判定
    setHasClaimedFeedToday(lastClaimedDate === today);
  }, []);

  // カスタムカードデータを読み込み（createページで作成したもの）
  const [categories, setCategories] = useState([
    { id: 'forget_things', name: '物忘れ', emoji: '🔍' },
    { id: 'forget_schedule', name: '予定忘れ', emoji: '📅' },
    { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰' },
    { id: 'another', name: 'その他', emoji: '😊' },
  ]);

  const [things, setThings] = useState([
    { id: 'key', name: '鍵', emoji: '🔑', categoryId: 'forget_things' },
    { id: 'medicine', name: '薬', emoji: '💊', categoryId: 'forget_things' },
    { id: 'umbrella', name: '傘', emoji: '☔', categoryId: 'forget_things' },
    { id: 'wallet', name: '財布', emoji: '👛', categoryId: 'forget_things' },
    { id: 'smartphone', name: 'スマホ', emoji: '📱', categoryId: 'forget_things' },
    { id: 'schedule', name: '予定', emoji: '📅', categoryId: 'forget_schedule' },
    { id: 'time', name: '遅刻', emoji: '⏰', categoryId: 'oversleep_late' },
    { id: 'homework', name: '宿題', emoji: '📄', categoryId: 'forget_things' },
    { id: 'another', name: 'その他', emoji: '😊', categoryId: 'another' },
  ]);

  const [situations, setSituations] = useState([
    { id: 'morning', name: '朝', emoji: '🌅' },
    { id: 'home', name: '家', emoji: '🏠' },
    { id: 'before_going_out', name: '外出前', emoji: '🚪' },
    { id: 'in_a_hurry', name: '急いでた', emoji: '⏰' },
    { id: 'rain', name: '雨', emoji: '🌧️' },
    { id: 'work', name: '仕事', emoji: '💼' },
    { id: 'school', name: '学校', emoji: '🎒' },
    { id: 'another', name: 'その他', emoji: '😊' },
  ]);

  // LocalStorageからカスタムカードデータを読み込み
  useEffect(() => {
    const loadCustomCards = () => {
      const saved = localStorage.getItem('customCards');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories((prev) => {
              const map = new Map(prev.map((item) => [item.id, item]));
              for (const item of data.categories) {
                map.set(item.id, { ...map.get(item.id), ...item });
              }
              return Array.from(map.values());
            });
          }
          if (Array.isArray(data.things) && data.things.length > 0) {
            setThings((prev) => {
              const map = new Map(prev.map((item) => [item.id, item]));
              for (const item of data.things) {
                map.set(item.id, { ...map.get(item.id), ...item });
              }
              return Array.from(map.values());
            });
          }
          if (Array.isArray(data.situations) && data.situations.length > 0) {
            setSituations((prev) => {
              const map = new Map(prev.map((item) => [item.id, item]));
              for (const item of data.situations) {
                map.set(item.id, { ...map.get(item.id), ...item });
              }
              return Array.from(map.values());
            });
          }
        } catch (error) {
          console.error('カスタムカードデータの読み込みに失敗:', error);
        }
      }
    };

    loadCustomCards();

    // LocalStorageの変更を監視
    const handleStorageChange = () => loadCustomCards();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customCardsChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customCardsChanged', handleStorageChange);
    };
  }, []);

  // 既存モンスター一覧を生成
  const getExistingMonsters = () => {
    const existingRecords = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
    const forgetRecords = existingRecords.filter((record: { didForget?: boolean }) => record.didForget === true);
    
    const monsterMap = new Map();
    forgetRecords.forEach((record: { thingId?: string; thingType?: string }) => {
      if (record.thingId && record.thingId !== 'none') {
        if (!monsterMap.has(record.thingId)) {
          // 図鑑と同じ絵文字マッピングを使用
          const getCategoryEmoji = (thingId: string) => {
            switch (thingId) {
              case 'key':
                return '🔑';
              case 'umbrella':
                return '☔';
              case 'wallet':
                return '👛';
              case 'medicine':
                return '💊';
              case 'smartphone':
                return '📱';
              case 'homework':
                return '📄';
              case 'schedule':
                return '📅';
              case 'time':
                return '⏰';
              default:
                return '😊';
            }
          };
          
          monsterMap.set(record.thingId, {
            thingId: record.thingId,
            thingType: record.thingType || '不明',
            emoji: getCategoryEmoji(record.thingId),
            count: 0
          });
        }
        monsterMap.get(record.thingId)!.count++;
      }
    });
    
    return Array.from(monsterMap.values());
  };

  // APIに忘れ物を送信する関数
  const saveToAPI = async (itemData: {
    category: string;
    title: string;
    forgotten_item: string;
    details?: string;
    difficulty: number;
    situation?: string[];
    location?: string;
    datetime: string;
  }) => {
    try {
      const result = await apiClient.createForgottenItem(itemData);
      console.log('API保存成功:', result);
      return result;
    } catch (error) {
      console.error('API保存エラー:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');

    // 関数冒頭で const isClaim = !hasClaimedFeedToday; を定義
    const isClaim = !hasClaimedFeedToday;
    
    if (formData.didForget === false) {
      // 忘れていない場合の処理
      const thingsRecord = {
        id: Date.now().toString(),
        category: formData.category,
        thingType: '忘れなかった',
        thingId: 'none',
        difficulty: formData.difficulty,
        situation: formData.situation,
        createdAt: new Date().toISOString(),
        didForget: false
      };
      
      // 既存のデータを取得して追加
      const existingRecords = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
      existingRecords.push(thingsRecord);
      localStorage.setItem('thingsRecords', JSON.stringify(existingRecords));
      
      // thingsRecordsChanged イベントを dispatch
      window.dispatchEvent(new CustomEvent('thingsRecordsChanged'));
      
      // モンスター情報を計算（thingId==='none' の件数で算出）
      const noneRecords = existingRecords.filter((record: { thingId: string }) => record.thingId === 'none');
      const encounterCount = noneRecords.length;
      const intimacyLevel = encounterCount;
      
      setMonsterInfo({
        name: '忘れなかった',
        encounterCount,
        intimacyLevel,
        rank: 'C'
      });
      
      console.log('忘れなかった記録が保存されました:', thingsRecord);
      console.log('モンスター情報:', { encounterCount, intimacyLevel, rank: 'C' });
      
      // 今日の分のえさを受取済みとして記録（削除 - 新しい処理で統一）
    } else {
      // 忘れた場合の処理
      if (forgetMode === 'existing') {
        // 既存モンスターモード
        if (!selectedExistingMonster) {
          alert('既存モンスターを選択してください');
          return;
        }
        
        const thingsRecord = {
          id: Date.now().toString(),
          thingType: selectedExistingMonster.thingType,
          thingId: selectedExistingMonster.thingId,
          difficulty: formData.difficulty,
          situation: formData.situation,
          createdAt: new Date().toISOString(),
          didForget: true
        };
        
        // 既存のデータを取得して追加
        const existingRecords = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
        existingRecords.push(thingsRecord);
        localStorage.setItem('thingsRecords', JSON.stringify(existingRecords));
        
        // thingsRecordsChanged イベントを dispatch
        window.dispatchEvent(new CustomEvent('thingsRecordsChanged'));
        
        // モンスター情報を計算
        const sameThingRecords = existingRecords.filter((record: { thingId: string }) => record.thingId === selectedExistingMonster.thingId);
        const encounterCount = sameThingRecords.length;
        const intimacyLevel = encounterCount;
        
        // ランクを計算（図鑑と同じロジック、5段階評価）
        let rank = 'C';
        if (intimacyLevel > 5) rank = 'B';
        if (intimacyLevel > 10) rank = 'A';
        if (intimacyLevel > 15) rank = 'S';
        if (intimacyLevel > 20) rank = 'SS';
        
        setMonsterInfo({
          name: selectedExistingMonster.thingType,
          encounterCount,
          intimacyLevel,
          rank
        });
        
        console.log('既存モンスター記録が保存されました:', thingsRecord);
        console.log('モンスター情報:', { encounterCount, intimacyLevel, rank });
        
        // 今日の分のえさを受取済みとして記録（削除 - 新しい処理で統一）
      } else {
        // 新規モンスターモード（従来どおり）
        if (formData.forgottenItem) {
          const selectedThing = things.find(thing => thing.id === formData.forgottenItem);
          const selectedCategory = categories.find(cat => cat.id === formData.category);
          console.log('選択された忘れ物:', selectedThing);
          console.log('選択されたカテゴリ:', selectedCategory);
          
          // APIに送信するデータ
          const apiData = {
            category: formData.category,
            title: formData.title || selectedThing?.name || '忘れ物',
            forgotten_item: selectedThing?.name || '忘れ物',
            details: `困った度: ${formData.difficulty}/5`,
            difficulty: formData.difficulty,
            situation: formData.situation.map(id => 
              situations.find(s => s.id === id)?.name || id
            ),
            location: '',
            datetime: new Date().toISOString()
          };

          try {
            // APIに保存
            await saveToAPI(apiData);
            console.log('APIに保存成功');
          } catch (error) {
            console.error('APIへの保存に失敗:', error);
            alert('データの保存に失敗しました。ネットワークを確認してください。');
            return;
          }
          
          // LocalStorageに保存（図鑑で読み込むため）
          const thingsRecord = {
            id: Date.now().toString(),
            category: formData.category,
            categoryName: selectedCategory?.name || '不明',
            categoryEmoji: selectedCategory?.emoji || '😊',
            thingType: selectedThing?.name || '忘れ物',
            thingId: formData.forgottenItem,
            title: formData.title,
            difficulty: formData.difficulty,
            situation: formData.situation,
            createdAt: new Date().toISOString(),
            didForget: true
          };
          
          // 既存のデータを取得して追加
          const existingRecords = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
          existingRecords.push(thingsRecord);
          localStorage.setItem('thingsRecords', JSON.stringify(existingRecords));
          
          // thingsRecordsChanged イベントを dispatch
          window.dispatchEvent(new CustomEvent('thingsRecordsChanged'));
          
          // モンスター情報を計算
          const sameThingRecords = existingRecords.filter((record: { thingId: string }) => record.thingId === formData.forgottenItem);
          const encounterCount = sameThingRecords.length;
          const intimacyLevel = encounterCount;
          
          // ランクを計算（図鑑と同じロジック、5段階評価）
          let rank = 'C';
          if (intimacyLevel > 5) rank = 'B';
          if (intimacyLevel > 10) rank = 'A';
          if (intimacyLevel > 15) rank = 'S';
          if (intimacyLevel > 20) rank = 'SS';
          
          setMonsterInfo({
            name: selectedThing?.name || '忘れ物',
            encounterCount,
            intimacyLevel,
            rank
          });
          
          console.log('図鑑用データが保存されました:', thingsRecord);
          console.log('モンスター情報:', { encounterCount, intimacyLevel, rank });
          
          // 今日の分のえさを受取済みとして記録（削除 - 新しい処理で統一）
        }
      }
    }
    
    // えさの受け取り処理を追加
    if (isClaim) {
      const inv = readFeedInventory();
      writeFeedInventory(inv + 5); // ★ ここでちょうど5個だけ加算
      const today = todayStr();
      localStorage.setItem('dailyFeedClaimedAt', today); // 当日受取済みフラグ
      localStorage.setItem('feedDaily', JSON.stringify({ date: today, count: 1 })); // 任意の当日カウンタ
      setHasClaimedFeedToday(true); // ボタン表示を「送信」に切り替え
      window.dispatchEvent(new CustomEvent('feed:claimed')); // ホーム等が在庫を即時反映
    }
    
    // 成長リザルトモーダルを表示
    setShowResultModal(true);
  };

  const handleCategorySelect = (categoryId: string) => {
    console.log('カテゴリ選択:', categoryId);
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  const handleExistingMonsterSelect = (monster: { thingId: string; thingType: string; emoji: string }) => {
    setSelectedExistingMonster(monster);
  };

  const handleSituationToggle = (situationId: string) => {
    setFormData(prev => ({
      ...prev,
      situation: prev.situation.includes(situationId)
        ? prev.situation.filter(id => id !== situationId)
        : [...prev.situation, situationId]
    }));
  };

  // 画像パスを生成する関数（図鑑と同じ）
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

  const handleDifficultyChange = (difficulty: number) => {
    setFormData(prev => ({ ...prev, difficulty }));
  };

  const handleModalClose = () => {
    console.log('Modal close called');
    setShowResultModal(false);
  };

  // 認証ローディング中
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
              <div className="text-6xl mb-4">✍️</div>
              <h2 className="text-2xl font-bold text-forest-primary mb-4">
                忘れ物を記録するにはログインが必要です
              </h2>
              <p className="text-forest-secondary mb-6">
                忘れ物を記録してモンスターを育てましょう。<br />
                まずはログインしてください。
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/login">
                  <button className="forest-button px-6 py-3 text-lg rounded-lg">
                    ログイン
                  </button>
                </Link>
                <Link href="/register">
                  <button className="forest-button px-6 py-3 text-lg rounded-lg">
                    新規登録
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="forest-card p-6 rounded-xl">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-forest-primary text-xl font-bold">
                <Plus className="h-5 w-5 text-emerald-600" />
                忘れ物を記録
              </h2>
              <Link href="/create">
                <Button variant="ghost" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  カード作成
                </Button>
              </Link>
            </div>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 今日の状態 - 最上部に移動 */}
              <div>
                <label className="block text-sm font-medium forest-label mb-3">
                  今日の状態
                </label>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    label="忘れた"
                    emoji="⚠️"
                    selected={formData.didForget === true}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      didForget: true 
                    }))}
                  />
                  <Chip
                    label="忘れ物をしていない"
                    emoji="✅"
                    selected={formData.didForget === false}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      didForget: false,
                      forgottenItem: '', // 忘れ物を選択解除
                      category: ''        // カテゴリもリセット
                    }))}
                  />
                </div>
              </div>

              {/* 忘れた場合のモード選択 */}
              {formData.didForget && (
                <div>
                  <label className="block text-sm font-medium forest-label mb-3">
                    モード選択
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      label="新しいモンスターを作成"
                      emoji="🆕"
                      selected={forgetMode === 'new'}
                      onClick={() => {
                        setForgetMode('new');
                        setSelectedExistingMonster(null);
                        setFormData(prev => ({ ...prev, category: '', title: '', forgottenItem: '' }));
                      }}
                    />
                    <Chip
                      label="既存のモンスターに記録"
                      emoji="📝"
                      selected={forgetMode === 'existing'}
                      onClick={() => {
                        setForgetMode('existing');
                        setSelectedExistingMonster(null);
                        setFormData(prev => ({ ...prev, category: '', title: '', forgottenItem: '' }));
                      }}
                    />
                  </div>
                </div>
              )}

              {/* カテゴリ選択 - 新規モードのときだけ表示 */}
              {formData.didForget && forgetMode === 'new' && (
                <div>
                  <label className="block text-sm font-medium forest-label mb-3">
                    カテゴリ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Chip
                        key={category.id}
                        label={category.name}
                        emoji={category.emoji}
                        selected={formData.category === category.id}
                        onClick={() => handleCategorySelect(category.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* タイトル - 新規モードのときだけ表示 */}
              {formData.didForget && forgetMode === 'new' && (
                <div>
                  <label htmlFor="title" className="block text-sm font-medium forest-label mb-2">
                    タイトル
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full forest-input px-3 py-2"
                    placeholder="忘れ物のタイトル"
                    maxLength={120}
                  />
                  <p className="text-xs text-forest-secondary mt-1">
                    {formData.title.length}/120文字
                  </p>
                </div>
              )}

              {/* 既存モンスター一覧 - 既存モードのときだけ表示 */}
              {formData.didForget && forgetMode === 'existing' && (
                <div>
                  <label className="block text-sm font-medium forest-label mb-3">
                    既存モンスターを選択
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getExistingMonsters().map((monster) => (
                      <div
                        key={monster.thingId}
                        className={cn(
                          'p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md',
                          selectedExistingMonster?.thingId === monster.thingId
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                        onClick={() => handleExistingMonsterSelect(monster)}
                      >
                        <div className="text-center">
                          {/* 画像表示 */}
                          <div className="w-16 h-16 mx-auto mb-2">
                            <img
                              src={getImagePathByThingId(monster.thingId)}
                              alt={monster.thingType}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                // 画像読み込みエラー時は絵文字を表示
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = document.createElement('div');
                                fallback.className = 'text-3xl flex items-center justify-center w-full h-full';
                                fallback.textContent = monster.emoji;
                                target.parentNode?.appendChild(fallback);
                              }}
                            />
                          </div>
                          <div className="font-medium text-sm text-gray-800 mb-1">
                            {monster.thingType}
                          </div>
                          <div className="text-xs text-gray-500">
                            累計{monster.count}回
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {getExistingMonsters().length === 0 && (
                    <p className="text-sm text-forest-secondary text-center py-4">
                      既存のモンスターがありません。新規モードで作成してください。
                    </p>
                  )}
                </div>
              )}

              {/* 忘れたもの - 新規モードのときだけ表示 */}
              {formData.didForget && forgetMode === 'new' && (
                <div>
                  <label className="block text-sm font-medium forest-label mb-3">
                    忘れたもの
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {things.map((thing) => (
                      <Chip
                        key={thing.id}
                        label={thing.name}
                        emoji={thing.emoji}
                        selected={formData.forgottenItem === thing.id}
                        onClick={() => setFormData(prev => ({ ...prev, forgottenItem: thing.id }))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 困った度 - didForget === true のときだけ表示 */}
              {formData.didForget && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    困った度
                  </label>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleDifficultyChange(level)}
                        className={cn(
                          'w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg transition-colors',
                          formData.difficulty >= level
                            ? 'border-yellow-400 bg-yellow-400 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        )}
                        aria-label={`レベル${level}`}
                      >
                        <Star className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-forest-secondary">
                    レベル {formData.difficulty}: {formData.difficulty === 1 ? '全然困らなかった' :
                      formData.difficulty === 2 ? '少し困った' :
                      formData.difficulty === 3 ? '困った' :
                      formData.difficulty === 4 ? 'かなり困った' : '非常に困った'}
                  </p>
                </div>
              )}

              {/* 状況 - didForget === true のときだけ表示 */}
              {formData.didForget && (
                <div>
                  <label className="block text-sm font-medium forest-label mb-3">
                    状況
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {situations.map((situation) => (
                      <Chip
                        key={situation.id}
                        label={situation.name}
                        emoji={situation.emoji}
                        selected={formData.situation.includes(situation.id)}
                        onClick={() => handleSituationToggle(situation.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 送信ボタン */}
              <button 
                type="button" 
                onClick={handleSubmit} 
                className="forest-button w-full px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={formData.didForget && forgetMode === 'existing' && !selectedExistingMonster}
              >
                <Save className="h-4 w-4" />
                {hasClaimedFeedToday ? '送信' : '今日の分のえさをもらう'}
              </button>
            </form>
          </div>
        </div>

        {/* 結果モーダル */}
        <Modal
          isOpen={showResultModal}
          onClose={handleModalClose}
          title="成長リザルト"
        >
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2 text-black">
              {monsterInfo ? `${monsterInfo.name}を${monsterInfo.encounterCount}回入力しました!` : 'モンスターが成長!'}
            </h3>

            <div className="flex justify-center gap-6 mb-6 text-sm text-gray-600">
              <span>遭遇{monsterInfo?.encounterCount || 0}回目</span>
              <span className="text-gray-300">|</span>
              <span>親密度{monsterInfo?.intimacyLevel || 0}</span>
              <span className="text-gray-300">|</span>
              <span>{monsterInfo?.rank || 'C'}ランク</span>
            </div>

            <div className="space-y-3">
              <Link href="/encyclopedia" onClick={handleModalClose}>
                <Button className="w-full">
                  図鑑で見る
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
