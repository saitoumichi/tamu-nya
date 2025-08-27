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

// 追加: ローカル時刻を <input type="datetime-local"> 用に整形
const getLocalDatetime = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
};

export default function InputPage() {
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    note: '',
    forgottenItem: '',
    details: '',
    difficulty: 3,
    situation: [] as string[],           // 選択したシチュエーションタグ
    situationNote: '',                   // 追加: どのような状況だったか（自由記述）
    location: '',                        // 場所
    datetime: getLocalDatetime(),        // 入力用に整形済みの現在時刻
  });

  const [showResultModal, setShowResultModal] = useState(false);
  const [monsterInfo, setMonsterInfo] = useState<{
    name: string;
    encounterCount: number;
    intimacyLevel: number;
    rarity: string;
  } | null>(null);

  useEffect(() => {
    console.log('showResultModal changed:', showResultModal);
  }, [showResultModal]);

  const categories = [
    { id: 'forget_things', name: '物忘れ', emoji: '🔍' },
    { id: 'forget_schedule', name: '予定忘れ', emoji: '📅' },
    { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰' },
    { id: 'another', name: 'その他', emoji: '😊' },
  ];

  const things = [
    { id: 'key', name: '鍵', emoji: '🔑' },
    { id: 'medicine', name: '薬', emoji: '💊' },
    { id: 'umbrella', name: '傘', emoji: '☔' },
    { id: 'wallet', name: '財布', emoji: '👛' },
    { id: 'smartphone', name: 'スマホ', emoji: '📱' },
    { id: 'schedule', name: '予定', emoji: '📅' },
    { id: 'time', name: '遅刻', emoji: '⏰' },
    { id: 'homework', name: '宿題', emoji: '📄' },
    { id: 'another', name: 'その他', emoji: '😊' },
  ];

  const situations = [
    { id: 'morning', name: '朝', emoji: '🌅' },
    { id: 'home', name: '家', emoji: '🏠' },
    { id: 'before_going_out', name: '外出前', emoji: '🚪' },
    { id: 'in_a_hurry', name: '急いでた', emoji: '⏰' },
    { id: 'rain', name: '雨', emoji: '🌧️' },
    { id: 'work', name: '仕事', emoji: '💼' },
    { id: 'school', name: '学校', emoji: '🎒' },
    { id: 'memory',  name: '物忘れ',   emoji: '🎒' },
    { id: 'schedule',name: '予定忘れ', emoji: '🗓️' },
    { id: 'late',    name: '寝坊・遅刻', emoji: '⏰' },
    { id: 'another', name: 'その他', emoji: '😊' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');

    if (formData.forgottenItem) {
      const selectedThing = things.find(thing => thing.id === formData.forgottenItem);
      console.log('選択された忘れ物:', selectedThing);

      // 保存データ（図鑑で読み込む）
      const thingsRecord = {
        id: Date.now().toString(),
        category: formData.category,
        thingType: selectedThing?.name || '忘れ物',
        thingId: formData.forgottenItem,
        title: formData.title,
        content: formData.content,
        details: formData.details,
        difficulty: formData.difficulty,
        // 追加保存: 状況ブロックの情報
        situation: formData.situation,          // 選択タグの配列
        situationNote: formData.situationNote,  // 自由記述
        location: formData.location,            // 場所
        datetime: formData.datetime,            // 日時（ローカル）
        createdAt: new Date().toISOString(),
      };

      const existingRecords = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
      existingRecords.push(thingsRecord);
      localStorage.setItem('thingsRecords', JSON.stringify(existingRecords));

      const sameThingRecords = existingRecords.filter((record: { thingId: string }) => record.thingId === formData.forgottenItem);
      const encounterCount = sameThingRecords.length;
      const intimacyLevel = encounterCount;

      let rarity = 'common';
      if (intimacyLevel > 5) rarity = 'uncommon';
      if (intimacyLevel > 10) rarity = 'rare';
      if (intimacyLevel > 15) rarity = 'epic';
      if (intimacyLevel > 20) rarity = 'legendary';

      setMonsterInfo({
        name: selectedThing?.name || '忘れ物',
        encounterCount,
        intimacyLevel,
        rarity
      });

      console.log('図鑑用データが保存されました:', thingsRecord);
      console.log('モンスター情報:', { encounterCount, intimacyLevel, rarity });
    }

    setShowResultModal(true);
  };

  const handleCategorySelect = (categoryId: string) => {
    console.log('カテゴリ選択:', categoryId);
    setFormData(prev => ({ ...prev, category: categoryId }));
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
            <CardTitle className="flex items-center gap-2 text-black">
              <Plus className="h-5 w-5 text-primary" />
              忘れ物を記録
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* カテゴリ選択 */}
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                      onClick={() => setFormData(prev => ({ ...prev, forgottenItem: thing.id }))}
                    />
                  ))}
                </div>
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

              {/* 追加：状況ブロック（日時・場所・どんな状況） */}
              <div className="rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">状況</h4>

                {/* 日時 */}
                <div className="mb-4">
                  <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-2">
                    日時
                  </label>
                  <input
                    id="datetime"
                    type="datetime-local"
                    value={formData.datetime}
                    onChange={(e) => setFormData(prev => ({ ...prev, datetime: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* 場所 */}
                <div className="mb-4">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    場所
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="例）自宅／駅の改札／学校の教室"
                    maxLength={120}
                  />
                </div>

                {/* シチュエーション（タグ選択） */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    シチュエーション
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {situations.map((s) => (
                      <Chip
                        key={s.id}
                        label={s.name}
                        emoji={s.emoji}
                        selected={formData.situation.includes(s.id)}
                        onClick={() => handleSituationToggle(s.id)}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    複数選択できます
                  </p>
                </div>

                {/* どのような状況だったか（自由記述） */}
                <div>
                  <label htmlFor="situationNote" className="block text-sm font-medium text-gray-700 mb-2">
                    どのような状況だったか
                  </label>
                  <textarea
                    id="situationNote"
                    rows={3}
                    value={formData.situationNote}
                    onChange={(e) => setFormData(prev => ({ ...prev, situationNote: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="例）朝急いで家を出た／雨で視界が悪かった など"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.situationNote.length}/500文字
                  </p>
                </div>
              </div>

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

              {/* メモ（自由記述） */}
              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                  メモ
                </label>
                <textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="詳細や思い出などを記録"
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.details.length}/2000文字
                </p>
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
              <span>{monsterInfo?.rarity || 'common'}</span>
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
