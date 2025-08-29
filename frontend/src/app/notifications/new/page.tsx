"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ArrowLeft, Save, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NotificationSetting {
  id: string;
  name: string;
  time: string;
  days: string[];
  enabled: boolean;
  category: string;
  categoryEmoji: string;
  description: string;
}

export default function NewNotificationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    time: '08:00',
    days: [] as string[],
    description: ''
  });

  const weekDays = [
    { id: '月', name: '月', emoji: '🌅' },
    { id: '火', name: '火', emoji: '🔥' },
    { id: '水', name: '水', emoji: '💧' },
    { id: '木', name: '木', emoji: '🌳' },
    { id: '金', name: '金', emoji: '⭐' },
    { id: '土', name: '土', emoji: '🌙' },
    { id: '日', name: '日', emoji: '☀️' }
  ];

  const handleDayToggle = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(id => id !== dayId)
        : [...prev.days, dayId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name.trim() === '' || formData.days.length === 0) {
      alert('タイトルと曜日を入力してください');
      return;
    }

    // 新しい通知設定を作成
    const newNotification: NotificationSetting = {
      id: Date.now().toString(),
      name: formData.name,
      time: formData.time,
      days: formData.days,
      enabled: true,
      category: 'custom',
      categoryEmoji: '🔔',
      description: formData.description
    };

    // LocalStorageから既存の設定を取得
    const existingSettings = JSON.parse(localStorage.getItem('notificationSettings') || '[]');
    existingSettings.push(newNotification);
    localStorage.setItem('notificationSettings', JSON.stringify(existingSettings));

    // 通知ページにデータ更新を通知
    window.dispatchEvent(new CustomEvent('notificationSettingsChanged'));

    // 設定完了後、通知ページに戻る
    router.push('/notifications');
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 text-black">
          <Link href="/notifications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">新規通知設定</h1>
          </div>
        </div>

        {/* フォーム */}
        <Card>
          <CardHeader>
          <div className="text-black">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              通知設定
            </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* タイトル */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2">
                  通知タイトル
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
                  text-gray-700"
                  placeholder="例: 鍵の確認"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.name.length}/50文字
                </p>
              </div>

              {/* 時間設定 */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  通知時間
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
                    text-gray-400"
                  />
                </div>
              </div>

              {/* 曜日選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  通知する曜日
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <Chip
                      key={day.id}
                      label={day.name}
                      emoji={day.emoji}
                      selected={formData.days.includes(day.id)}
                      onClick={() => handleDayToggle(day.id)}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  選択された曜日: {formData.days.length > 0 ? formData.days.join('、') : 'なし'}
                </p>
              </div>

              {/* 保存ボタン */}
              <div className="flex justify-end gap-3 pt-4">
                <Link href="/notifications">
                  <Button variant="primary" type="button">
                    キャンセル
                  </Button> 
                </Link>
                <Button type="submit" className="px-8">
                  <Save className="mr-2 h-4 w-4" />
                  保存
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}