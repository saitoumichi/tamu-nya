// VAPIDキーをUint8Arrayに変換する関数
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// プッシュ通知の購読関数
export async function subscribe() {
  try {
    // Service Workerを登録
    const reg = await navigator.serviceWorker.register('/sw.js');
    
    // 通知許可をリクエスト
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      throw new Error('通知許可が拒否されました');
    }

    // プッシュ購読を作成
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC!)
    });

    // サーバーに購読情報を送信
    const response = await fetch(process.env.NEXT_PUBLIC_API_BASE + '/push/subscribe', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(sub)
    });

    if (!response.ok) {
      throw new Error('サーバーへの送信に失敗しました');
    }

    return { success: true, subscription: sub };
  } catch (error) {
    console.error('プッシュ通知の購読に失敗:', error);
    return { success: false, error: error.message };
  }
}

// プッシュ通知の購読解除関数
export async function unsubscribe() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      // サーバーに購読解除を通知
      await fetch(process.env.NEXT_PUBLIC_API_BASE + '/push/unsubscribe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ subscription: subscription })
      });
    }

    return { success: true };
  } catch (error) {
    console.error('プッシュ通知の購読解除に失敗:', error);
    return { success: false, error: error.message };
  }
}

// 通知許可の状態を確認
export function getNotificationPermission(): NotificationPermission | 'default' {
  if (!('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

// プッシュ通知がサポートされているかチェック
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}
