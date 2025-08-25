"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Bell, BellOff, Settings, Clock, Calendar, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    reminderNotifications: true,
    achievementNotifications: true
  });

  const [reminderSettings, setReminderSettings] = useState([
    {
      id: 1,
      name: '鍵の確認',
      time: '07:50',
      days: ['月', '火', '水', '木', '金'],
      enabled: true,
      category: 'key',
      categoryEmoji: '🔑'
    },
    {
      id: 2,
      name: '薬の服用',
      time: '21:00',
      days: ['月', '火', '水', '木', '金', '土', '日'],
      enabled: true,
      category: 'medicine',
      categoryEmoji: '💊'
    },
    {
      id: 3,
      name: '傘の確認',
      time: '08:00',
      days: ['月', '火', '水', '木', '金'],
      enabled: false,
      category: 'umbrella',
      categoryEmoji: '☔'
    }
  ]);

  const handleToggleSetting = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleToggleReminder = (id: number) => {
    setReminderSettings(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, enabled: !reminder.enabled }
          : reminder
      )
    );
  };

  const handleDeleteReminder = (id: number) => {
    setReminderSettings(prev => prev.filter(reminder => reminder.id !== id));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">通知設定</h1>
            <p className="text-gray-600">プッシュ通知とリマインダーの設定</p>
          </div>
        </div>

        {/* 通知の種類設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              通知の種類
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(notificationSettings).map(([key, value]) => {
              const labels = {
                pushNotifications: 'プッシュ通知',
                emailNotifications: 'メール通知',
                reminderNotifications: 'リマインダー通知',
                achievementNotifications: '実績通知'
              };

              return (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{labels[key as keyof typeof notificationSettings]}</span>
                  <button
                    onClick={() => handleToggleSetting(key as keyof typeof notificationSettings)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      value ? 'bg-primary' : 'bg-gray-200'
                    )}
                    aria-label={`${labels[key as keyof typeof notificationSettings]}を${value ? '無効' : '有効'}にする`}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        value ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* リマインダー設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              リマインダー設定
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reminderSettings.length > 0 ? (
              <div className="space-y-4">
                {reminderSettings.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reminder.categoryEmoji}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{reminder.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{reminder.time}</span>
                          <span>•</span>
                          <span>{reminder.days.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* トグルスイッチ */}
                      <button
                        onClick={() => handleToggleReminder(reminder.id)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          reminder.enabled ? 'bg-primary' : 'bg-gray-200'
                        )}
                        aria-label={`リマインダー${reminder.name}を${reminder.enabled ? '無効' : '有効'}にする`}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            reminder.enabled ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                      
                      {/* 削除ボタン */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                設定されたリマインダーがありません
              </div>
            )}
          </CardContent>
        </Card>

        {/* 新規リマインダー追加ボタン */}
        <div className="flex justify-center">
          <Button size="lg" className="px-8">
            <Plus className="mr-2 h-5 w-5" />
            新規リマインダー
          </Button>
        </div>

        {/* 通知の説明 */}
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 space-y-2">
              <h4 className="font-medium text-gray-900 mb-3">通知について</h4>
              <p>• プッシュ通知: 忘れ物のリマインダーや新しいモンスターの出現をお知らせ</p>
              <p>• リマインダー: 設定した時間に忘れ物防止のアラートを表示</p>
              <p>• 実績通知: モンスターの成長や進化をお知らせ</p>
              <p>• 設定はいつでも変更できます</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
