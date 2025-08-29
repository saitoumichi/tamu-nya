"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribe, unsubscribe, getNotificationPermission, isPushSupported } from '@/lib/push-utils';

export function PushNotification() {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // 初期化時に通知許可の状態を確認
    setPermission(getNotificationPermission());
    
    // Service Workerの登録状態を確認
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const handleSubscribe = async () => {
    if (!isPushSupported()) {
      setMessage({ type: 'error', text: 'プッシュ通知がサポートされていません' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await subscribe();
      if (result.success) {
        setIsSubscribed(true);
        setPermission('granted');
        setMessage({ type: 'success', text: 'プッシュ通知の購読が完了しました！' });
      } else {
        setMessage({ type: 'error', text: result.error || '購読に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '予期しないエラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await unsubscribe();
      if (result.success) {
        setIsSubscribed(false);
        setMessage({ type: 'success', text: 'プッシュ通知の購読を解除しました' });
      } else {
        setMessage({ type: 'error', text: result.error || '購読解除に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '予期しないエラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: '許可済み', icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: 'text-green-600' };
      case 'denied':
        return { text: '拒否', icon: <AlertCircle className="h-4 w-4 text-red-500" />, color: 'text-red-600' };
      default:
        return { text: '未設定', icon: <AlertCircle className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-600' };
    }
  };

  const permissionStatus = getPermissionStatus();

  if (!isPushSupported()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-500" />
            プッシュ通知
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            お使いのブラウザはプッシュ通知をサポートしていません
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          プッシュ通知設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 通知許可の状態 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">通知許可</span>
          <div className="flex items-center gap-2">
            {permissionStatus.icon}
            <span className={`text-sm ${permissionStatus.color}`}>
              {permissionStatus.text}
            </span>
          </div>
        </div>

        {/* 購読状態 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">購読状態</span>
          <span className={`text-sm ${isSubscribed ? 'text-green-600' : 'text-gray-500'}`}>
            {isSubscribed ? '購読中' : '未購読'}
          </span>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className={`p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-3">
          {!isSubscribed ? (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading || permission === 'denied'}
              className="flex-1"
            >
              <Bell className="mr-2 h-4 w-4" />
              {isLoading ? '処理中...' : '通知を有効にする'}
            </Button>
          ) : (
            <Button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              variant="secondary"
              className="flex-1"
            >
              <BellOff className="mr-2 h-4 w-4" />
              {isLoading ? '処理中...' : '通知を無効にする'}
            </Button>
          )}
        </div>

        {/* 説明 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 忘れ物のリマインダーや新しいモンスターの出現をお知らせします</p>
          <p>• 通知許可が必要です</p>
          <p>• 設定はいつでも変更できます</p>
        </div>
      </CardContent>
    </Card>
  );
}
