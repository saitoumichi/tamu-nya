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

export default function InputPage() {
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
          monsterMap.set(record.thingId, {
            thingId: record.thingId,
            thingType: record.thingType || '不明',
            emoji: things.find(t => t.id === record.thingId)?.emoji || '😊',
            count: 0
          });
        }
        monsterMap.get(record.thingId)!.count++;
      }
    });
    
    return Array.from(monsterMap.values());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    
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
      
      // 今日の分のえさを受取済みとして記録
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('dailyFeedClaimedAt', today);
      setHasClaimedFeedToday(true);
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
        
        // 今日の分のえさを受取済みとして記録
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem('dailyFeedClaimedAt', today);
        setHasClaimedFeedToday(true);
      } else {
        // 新規モンスターモード（従来どおり）
        if (formData.forgottenItem) {
          const selectedThing = things.find(thing => thing.id === formData.forgottenItem);
          const selectedCategory = categories.find(cat => cat.id === formData.category);
          console.log('選択された忘れ物:', selectedThing);
          console.log('選択されたカテゴリ:', selectedCategory);
          
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
          
          // 今日の分のえさを受取済みとして記録
          const today = new Date().toISOString().slice(0, 10);
          localStorage.setItem('dailyFeedClaimedAt', today);
          setHasClaimedFeedToday(true);
        }
      }
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

  // 画像パスを生成する関数
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
        return '/monsters/late/late_monsters.jpg';
      default:
        return '/monsters/wallet/wallet-monster.jpg';
    }
  };

  const handleDifficultyChange = (difficulty: number) => {
    setFormData(prev => ({ ...prev, difficulty }));
  };

  const handleModalClose = () => {
    console.log('Modal close called');
    setShowResultModal(false);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-black">
                <Plus className="h-5 w-5 text-primary" />
                忘れ物を記録
              </CardTitle>
              <Link href="/create">
                <Button variant="ghost" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  カード作成
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 今日の状態 - 最上部に移動 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
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
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="忘れ物のタイトル"
                    maxLength={120}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/120文字
                  </p>
                </div>
              )}

              {/* 既存モンスター一覧 - 既存モードのときだけ表示 */}
              {formData.didForget && forgetMode === 'existing' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
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
                    <p className="text-sm text-gray-500 text-center py-4">
                      既存のモンスターがありません。新規モードで作成してください。
                    </p>
                  )}
                </div>
              )}

              {/* 忘れたもの - 新規モードのときだけ表示 */}
              {formData.didForget && forgetMode === 'new' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
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
                  <p className="text-sm text-gray-600">
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
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
              <Button 
                type="button" 
                onClick={handleSubmit} 
                className="w-full"
                disabled={formData.didForget && forgetMode === 'existing' && !selectedExistingMonster}
              >
                <Save className="mr-2 h-4 w-4" />
                {hasClaimedFeedToday ? '送信' : '今日の分のえさをもらう'}
              </Button>
            </form>
          </CardContent>
        </Card>

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
