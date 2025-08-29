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
    content: '',
    note: '',
    forgottenItem: '',
    details: '',
    difficulty: 3,
    situation: [] as string[],
    location: '',
    datetime: new Date().toISOString().slice(0, 16)
  });

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
          if (data.categories) setCategories(data.categories);
          if (data.things) setThings(data.things);
          if (data.situations) setSituations(data.situations);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    
    // 選択された「忘れたもの」の情報を図鑑に送る
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
        content: formData.content,
        details: formData.details,
        difficulty: formData.difficulty,
        location: formData.location,
        datetime: formData.datetime,
        createdAt: new Date().toISOString()
      };
      
      // 既存のデータを取得して追加
      const existingRecords = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
      existingRecords.push(thingsRecord);
      localStorage.setItem('thingsRecords', JSON.stringify(existingRecords));
      
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
    }
    
    // 成長リザルトモーダルを表示
    setShowResultModal(true);
  };

  const handleCategorySelect = (categoryId: string) => {
    console.log('カテゴリ選択:', categoryId);
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  const handleSituationSelect = (situationId: string) => {
    setFormData(prev => ({
      ...prev,
      situation: prev.situation.includes(situationId)
        ? prev.situation.filter(id => id !== situationId)
        : [...prev.situation, situationId]
    }));
  };

  const handleSituationToggle = (situationId: string) => {
    setFormData(prev => ({
      ...prev,
      situation: prev.situation.includes(situationId)
        ? prev.situation.filter(id => id !== situationId)
        : [...prev.situation, situationId]
    }));
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


              {/* タイトル */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-400"
                  placeholder="忘れ物のタイトル"
                  maxLength={120}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/120文字
                </p>
              </div>

              {/* 忘れたもの */}
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
                      onClick={() => {
                        const selectedThing = things.find(t => t.id === thing.id);
                        setFormData(prev => ({ 
                          ...prev, 
                          forgottenItem: thing.id,
                          category: selectedThing?.categoryId || ''
                        }));
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 選択されたカテゴリ表示 */}
              {formData.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選択されたカテゴリ
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const selectedCategory = categories.find(cat => cat.id === formData.category);
                      return selectedCategory ? (
                        <>
                          <span className="text-2xl">{selectedCategory.emoji}</span>
                          <span className="font-medium text-gray-900">{selectedCategory.name}</span>
                        </>
                      ) : (
                        <span className="text-gray-500">カテゴリが選択されていません</span>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* 内容 */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <input
                  type="text"
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="忘れ物の内容"
                  maxLength={120}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.content.length}/120文字
                </p>
              </div>

              {/* 困った度 */}
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

              {/* 内容・詳細 */}
              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                  内容・詳細
                </label>
                <textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="詳細や状況などを記録"
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.details.length}/2000文字
                </p>
              </div>

              {/* 日時表示 */}
              <div className="text-sm text-gray-500">
                {new Date().toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              
              {/* 場所 */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  場所
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="忘れ物をした場所"
                />
              </div>

              {/* 日時入力 */}
              <div>
                <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-2">
                  日時
                </label>
                <input
                  type="datetime-local"
                  id="datetime"
                  value={formData.datetime}
                  onChange={(e) => setFormData(prev => ({ ...prev, datetime: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* カテゴリ */}
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

              {/* 状況 */}
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
                      onClick={() => handleSituationSelect(situation.id)}
                    />
                  ))}
                </div>
              </div>

              {/* 送信ボタン */}
              <Button type="button" onClick={handleSubmit} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                送信
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
