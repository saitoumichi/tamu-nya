<?php

namespace App\Services;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use App\Models\PushSubscription;
use Illuminate\Support\Facades\Log;

class WebPushService
{
    private WebPush $webPush;

    public function __construct()
    {
        $auth = [
            'VAPID' => [
                'subject' => 'mailto:' . config('app.support_email', 'support@example.com'),
                'publicKey' => config('services.webpush.vapid_public'),
                'privateKey' => config('services.webpush.vapid_private'),
            ]
        ];

        $this->webPush = new WebPush($auth);
    }

    /**
     * 特定のメールアドレスでWebPushインスタンスを作成
     */
    private function createWebPushWithEmail(string $email): WebPush
    {
        $auth = [
            'VAPID' => [
                'subject' => 'mailto:' . $email,
                'publicKey' => config('services.webpush.vapid_public'),
                'privateKey' => config('services.webpush.vapid_private'),
            ]
        ];

        return new WebPush($auth);
    }

    /**
     * 特定のユーザーにプッシュ通知を送信
     */
    public function sendToUser(int $userId, array $payload): array
    {
        $subscriptions = PushSubscription::where('user_id', $userId)->get();
        return $this->sendToSubscriptions($subscriptions, $payload);
    }

    /**
     * 全ユーザーにプッシュ通知を送信
     */
    public function sendToAll(array $payload): array
    {
        $subscriptions = PushSubscription::all();
        return $this->sendToSubscriptions($subscriptions, $payload);
    }

    /**
     * 特定のサブスクリプションにプッシュ通知を送信
     */
    public function sendToSubscriptions($subscriptions, array $payload): array
    {
        $results = [];

        foreach ($subscriptions as $subscription) {
            $sub = Subscription::create([
                'endpoint' => $subscription->endpoint,
                'publicKey' => $subscription->p256dh,
                'authToken' => $subscription->auth,
            ]);

            $this->webPush->queueNotification($sub, json_encode($payload));
        }

        // 通知を送信
        foreach ($this->webPush->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();

            if ($report->isSuccess()) {
                $results[] = [
                    'endpoint' => $endpoint,
                    'success' => true,
                    'message' => '送信成功'
                ];
            } else {
                $results[] = [
                    'endpoint' => $endpoint,
                    'success' => false,
                    'message' => $report->getReason(),
                    'status_code' => $report->getResponse()->getStatusCode()
                ];

                // 失敗したサブスクリプションを削除
                if ($report->getResponse()->getStatusCode() === 410) {
                    PushSubscription::where('endpoint', $endpoint)->delete();
                    Log::info("無効なサブスクリプションを削除: {$endpoint}");
                }
            }
        }

        return $results;
    }

    /**
     * 忘れ物チェックの通知を送信
     */
    public function sendForgetItemCheck(int $userId = null): array
    {
        $payload = [
            'title' => 'お知らせ',
            'body' => '忘れ物チェック！',
            'icon' => '/icon.png',
            'badge' => '/badge.png',
            'data' => [
                'url' => '/forget-item-check'
            ]
        ];

        if ($userId) {
            return $this->sendToUser($userId, $payload);
        }

        return $this->sendToAll($payload);
    }
}
