"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Plus, Bell, Clock, Calendar, Settings } from 'lucide-react';

export default function SettingsPage() {
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      name: 'カギ確認',
      schedule: '平日 7:50',
      enabled: true,
      category: 'key',
      categoryEmoji: '🔑'
    },
    {
      id: 2,
      name: '薬の服用',
      schedule: '毎日 21:00',
      enabled: true,
      category: 'medicine',
      categoryEmoji: '💊'
    }
  ]);

  const handleToggleAlert = (alertId: number) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, enabled: !alert.enabled }
          : alert
      )
    );
  };

  const handleDeleteAlert = (alertId: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">通知・アラート設定</h1>
            <p className="text-gray-600">忘れ物防止のためのアラートを設定</p>
          </div>
        </div>

        {/* アラート一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              設定済みアラート
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{alert.categoryEmoji}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{alert.name}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {alert.schedule}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* トグルスイッチ */}
                      <button
                        onClick={() => handleToggleAlert(alert.id)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          alert.enabled ? 'bg-primary' : 'bg-gray-200'
                        )}
                        aria-label={`アラート${alert.name}を${alert.enabled ? '無効' : '有効'}にする`}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            alert.enabled ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                      
                      {/* 削除ボタン */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
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
                設定されたアラートがありません
              </div>
            )}
          </CardContent>
        </Card>

        {/* 新規アラートボタン */}
        <div className="flex justify-center">
          <Button
            onClick={() => setShowNewAlertModal(true)}
            size="lg"
            className="px-8"
          >
            <Plus className="mr-2 h-5 w-5" />
            新規アラート
          </Button>
        </div>

        {/* 新規アラートモーダル */}
        <Modal
          isOpen={showNewAlertModal}
          onClose={() => setShowNewAlertModal(false)}
          title="新規アラート作成"
        >
          <div className="space-y-6 py-4">
            {/* プリセットテンプレート */}
            <div>
              <h4 className="font-medium mb-3">プリセットテンプレート</h4>
              <div className="grid grid-cols-1 gap-2">
                <button className="text-left p-3 rounded-lg border hover:bg-gray-50">
                  <div className="font-medium">鍵確認</div>
                  <div className="text-sm text-gray-500">平日 7:50</div>
                </button>
                <button className="text-left p-3 rounded-lg border hover:bg-gray-50">
                  <div className="font-medium">薬の服用</div>
                  <div className="text-sm text-gray-500">毎日 21:00</div>
                </button>
                <button className="text-left p-3 rounded-lg border hover:bg-gray-50">
                  <div className="font-medium">傘の確認</div>
                  <div className="text-sm text-gray-500">雨の日 8:00</div>
                </button>
              </div>
            </div>

            {/* カスタム設定 */}
            <div>
              <h4 className="font-medium mb-3">カスタム設定</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    アラート名
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                    placeholder="例：鍵確認"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    時間
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                    title="アラートの時間を選択"
                    placeholder="時間を選択"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    曜日
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
                      <button
                        key={day}
                        className="px-3 py-1 rounded-full border border-gray-300 hover:border-primary hover:bg-primary/5"
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowNewAlertModal(false)}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={() => setShowNewAlertModal(false)}
                className="flex-1"
              >
                作成
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
