"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Modal } from '@/components/ui/modal';
import { Plus, Save, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const categories = [
    { id: 'forget_things', name: '物忘れ', emoji: '🔍' },
    { id: 'forget_schedule', name: '予定忘れ', emoji: '📅' },
    { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰' }
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
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここでAPIを呼び出し
    setShowResultModal(true);
  };

  const handleCategorySelect = (categoryId: string) => {
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              忘れ物を記録
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* カテゴリ選択（必須） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  カテゴリ <span className="text-red-500">*</span>
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

              {/* 忘れたもの（必須） */}
              <div>
                <label htmlFor="forgottenItem" className="block text-sm font-medium text-gray-700 mb-2">
                  忘れたもの <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="forgottenItem"
                  value={formData.forgottenItem}
                  onChange={(e) => setFormData(prev => ({ ...prev, forgottenItem: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="忘れたものを入力"
                  maxLength={120}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.forgottenItem.length}/120文字
                </p>
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

              {/* 困った度（必須） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  困った度 <span className="text-red-500">*</span>
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
                      aria-label={`困った度レベル${level}を選択`}
                      title={`困った度レベル${level}を選択`}
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

              {/* 送信ボタン */}
              <Button type="submit" className="w-full" disabled={!formData.category || !formData.forgottenItem}>
                <Save className="mr-2 h-4 w-4" />
                送信
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 結果モーダル */}
        <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title="成長リザルト"
        >
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">カギモンスターが レベル3に成長!</h3>
            <p className="text-gray-600 mb-6">
              忘れ物を記録することで、モンスターが成長しました！
            </p>

            <div className="flex justify-center gap-6 mb-6 text-sm text-gray-600">
              <span>遭遇5</span>
              <span className="text-gray-300">|</span>
              <span>親密度75%</span>
              <span className="text-gray-300">|</span>
              <span>コモン</span>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setShowResultModal(false)}
                className="w-full"
              >
                図鑑で見る
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowResultModal(false)}
                className="w-full"
              >
                対策追加
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
