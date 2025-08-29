"use client";

import React, { useState,useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    reminderNotifications: true,
    achievementNotifications: true,
    soundNotifications: true
  });

  const [reminderSettings, setReminderSettings] = useState([
    {
      id: 1,
      name: '鍵の確認',
      time: '07:50',
      days: ['月', '火', '水', '木', '金'],
      enabled: true,
      category: 'key',
      categoryEmoji: '🔑',
      description: '出かける前に鍵を確認'
    },
    {
      id: 2,
      name: '薬の服用',
      time: '21:00',
      days: ['月', '火', '水', '木', '金', '土', '日'],
      enabled: true,
      category: 'medicine',
      categoryEmoji: '💊',
      description: '寝る前の薬を忘れずに'
    },
    {
      id: 3,
      name: '傘の確認',
      time: '08:00',
      days: ['月', '火', '水', '木', '金'],
      enabled: false,
      category: 'umbrella',
      categoryEmoji: '☔',
      description: '雨の日の傘チェック'
    }
  ]);

  const [showQuickSetup, setShowQuickSetup] = useState(false);

  // LocalStorageから通知設定を読み込み



  useEffect(() => {


    const loadNotificationSettings = () => {


      const savedSettings = JSON.parse(localStorage.getItem('notificationSettings') || '[]');


      if (savedSettings.length > 0) {


        // 既存のサンプルデータと新しい設定を結合


        const combinedSettings = [...reminderSettings, ...savedSettings];


        setReminderSettings(combinedSettings);


      }


    };





    loadNotificationSettings();





    // LocalStorageの変更を監視


    const handleStorageChange = () => {


      loadNotificationSettings();


    };





    window.addEventListener('notificationSettingsChanged', handleStorageChange);


    return () => {


      window.removeEventListener('notificationSettingsChanged', handleStorageChange);


    };


  }, []);




  useEffect(() => {
    const loadNotificationSettings = () => {
      const savedSettings = JSON.parse(localStorage.getItem('notificationSettings') || '[]');
      if (savedSettings.length > 0) {
        // 既存のサンプルデータと新しい設定を結合
        const combinedSettings = [...reminderSettings, ...savedSettings];
        setReminderSettings(combinedSettings);
      }
    };

    loadNotificationSettings();

    // LocalStorageの変更を監視
    const handleStorageChange = () => {
      loadNotificationSettings();
    };

    window.addEventListener('notificationSettingsChanged', handleStorageChange);
    return () => {
      window.removeEventListener('notificationSettingsChanged', handleStorageChange);
    };
  }, []);

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

  const handleQuickSetup = () => {
    // 基本的な通知設定を有効化
    setNotificationSettings({
      pushNotifications: true,
      emailNotifications: false,
      reminderNotifications: true,
      achievementNotifications: true,
      soundNotifications: true
    });
    
    // 基本的なリマインダーを有効化
    setReminderSettings(prev => 
      prev.map(reminder => ({
        ...reminder,
        enabled: reminder.category === 'key' || reminder.category === 'medicine'
      }))
    );
    
    setShowQuickSetup(false);
  };

  const [permissionStatus, setPermissionStatus] = useState({
    text: '読み込み中...',
    icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
    color: 'text-gray-500'
  });

  useEffect(() => {
    const updatePermissionStatus = () => {
      if (!('Notification' in window)) {
        setPermissionStatus({
          text: 'サポートされていません',
          icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
          color: 'text-gray-500'
        });
        return;
      }
      
      switch (window.Notification.permission) {
        case 'granted':
          setPermissionStatus({
            text: '許可済み',
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            color: 'text-green-600'
          });
          break;
        case 'denied':
          setPermissionStatus({
            text: '拒否',
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
            color: 'text-red-600'
          });
          break;
        default:
          setPermissionStatus({
            text: '未設定',
            icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
            color: 'text-yellow-600'
          });
      }
    };

    updatePermissionStatus();
  }, []);

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

        {/* 通知許可の状態 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Bell className="h-5 w-5 text-primary" />
              通知許可の状態
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">ブラウザの通知許可</span>
              <div className="flex items-center gap-2">
                {permissionStatus.icon}
                <span className={`text-sm ${permissionStatus.color}`}>
                  {permissionStatus.text}
                </span>
              </div>
            </div>
            {typeof window !== 'undefined' && window.Notification?.permission === 'default' && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  通知を有効にするには、ブラウザの通知許可を許可してください。
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* リマインダー設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Clock className="h-5 w-5 text-primary" />
              設定されている通知
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reminderSettings.length > 0 ? (
              <div className="space-y-4">
                {reminderSettings.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors",
                      reminder.enabled ? "border-primary bg-primary/5" : "border-gray-200 hover:bg-gray-50"
                    )}
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
          <Link href="/notifications/new">
            <Button size="lg" className="px-8">
              <Plus className="mr-2 h-5 w-5" />
              新規登録
            </Button>
          </Link>
        </div>

        {/* クイック設定モーダル */}
        {showQuickSetup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">クイック設定</h3>
              <p className="text-gray-600 mb-6">
                基本的な通知設定を自動で有効化します。鍵の確認と薬の服用のリマインダーが設定されます。
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowQuickSetup(false)}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleQuickSetup}
                  className="flex-1"
                >
                  設定する
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
