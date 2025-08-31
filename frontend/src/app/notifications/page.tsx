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
        <div className="forest-card p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-forest-primary flex items-center gap-2">
                🔔 通知設定
              </h1>
              <p className="text-forest-secondary">プッシュ通知とリマインダーの設定</p>
            </div>
          </div>
        </div>

        {/* 通知許可の状態 */}
        <div className="forest-card p-6 rounded-xl">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-forest-primary">
              <Bell className="h-5 w-5 text-forest-accent" />
              通知許可の状態
            </h2>
          </div>
          <div>
            <div className="flex items-center justify-between p-4 bg-emerald-900/20 rounded-lg border-2 border-emerald-400/30">
              <span className="text-sm font-medium text-forest-primary">ブラウザの通知許可</span>
              <div className="flex items-center gap-2">
                {permissionStatus.icon}
                <span className={`text-sm ${permissionStatus.color}`}>
                  {permissionStatus.text}
                </span>
              </div>
            </div>
            {permissionStatus.text === '未設定' && (
              <div className="mt-3 p-3 bg-emerald-900/30 rounded-lg border-2 border-emerald-400/40">
                <p className="text-sm text-forest-accent">
                  通知を有効にするには、ブラウザの通知許可を許可してください。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* リマインダー設定 */}
        <div className="forest-card p-6 rounded-xl">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-forest-primary">
              <Clock className="h-5 w-5 text-forest-accent" />
              設定されている通知
            </h2>
          </div>
          <div>
            {reminderSettings.length > 0 ? (
              <div className="space-y-4">
                {reminderSettings.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border-2 transition-colors backdrop-filter backdrop-blur-sm",
                      reminder.enabled ? "border-emerald-400/40 bg-emerald-900/30" : "border-emerald-400/20 bg-emerald-900/10 hover:bg-emerald-900/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reminder.categoryEmoji}</span>
                      <div>
                        <h4 className="font-medium text-forest-primary">{reminder.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-forest-secondary">
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
                          reminder.enabled ? 'bg-emerald-500' : 'bg-emerald-900/40'
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
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="forest-button px-3 py-1 text-sm rounded-lg bg-red-900/30 text-red-400 border-red-400/30 hover:bg-red-900/50"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-forest-secondary">
                設定されたリマインダーがありません
              </div>
            )}
          </div>
        </div>

        {/* 新規リマインダー追加ボタン */}
        <div className="flex justify-center">
          <Link href="/notifications/new">
            <button className="forest-button px-8 py-3 text-lg rounded-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              新規登録
            </button>
          </Link>
        </div>

        {/* クイック設定モーダル */}
        {showQuickSetup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="forest-card rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-forest-primary">クイック設定</h3>
              <p className="text-forest-secondary mb-6">
                基本的な通知設定を自動で有効化します。鍵の確認と薬の服用のリマインダーが設定されます。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuickSetup(false)}
                  className="forest-button flex-1 px-4 py-2 rounded-lg bg-emerald-900/20 border-emerald-400/30"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleQuickSetup}
                  className="forest-button flex-1 px-4 py-2 rounded-lg"
                >
                  設定する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
