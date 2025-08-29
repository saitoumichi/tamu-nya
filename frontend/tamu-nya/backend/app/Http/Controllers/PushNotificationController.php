<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\WebPushService;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PushNotificationController extends Controller
{
    public function __construct(
        private WebPushService $webPushService
    ) {}

    /**
     * プッシュ通知のサブスクリプションを保存
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|string',
            'p256dh' => 'required|string',
            'auth' => 'required|string',
            'ua' => 'nullable|string',
        ]);

        $subscription = PushSubscription::updateOrCreate(
            ['endpoint' => $request->endpoint],
            [
                'user_id' => Auth::check() ? Auth::id() : null,
                'p256dh' => $request->p256dh,
                'auth' => $request->auth,
                'ua' => $request->ua,
            ]
        );

        return response()->json([
            'message' => 'サブスクリプションが保存されました',
            'subscription' => $subscription
        ], 201);
    }

    /**
     * プッシュ通知のサブスクリプションを削除
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|string',
        ]);

        $deleted = PushSubscription::where('endpoint', $request->endpoint)->delete();

        if ($deleted) {
            return response()->json(['message' => 'サブスクリプションが削除されました']);
        }

        return response()->json(['message' => 'サブスクリプションが見つかりません'], 404);
    }

    /**
     * 忘れ物チェックの通知を送信
     */
    public function sendForgetItemCheck(Request $request): JsonResponse
    {
        $userId = $request->input('user_id');

        try {
            $results = $this->webPushService->sendForgetItemCheck($userId);

            $successCount = count(array_filter($results, fn($r) => $r['success']));
            $failureCount = count($results) - $successCount;

            return response()->json([
                'message' => '通知を送信しました',
                'total' => count($results),
                'success' => $successCount,
                'failure' => $failureCount,
                'results' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => '通知の送信に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * カスタム通知を送信
     */
    public function sendCustomNotification(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:500',
            'user_id' => 'nullable|integer|exists:users,id',
            'icon' => 'nullable|string',
            'badge' => 'nullable|string',
            'url' => 'nullable|string',
        ]);

        $payload = [
            'title' => $request->title,
            'body' => $request->body,
            'icon' => $request->icon,
            'badge' => $request->badge,
            'data' => [
                'url' => $request->url
            ]
        ];

        try {
            $userId = $request->input('user_id');

            if ($userId) {
                $results = $this->webPushService->sendToUser($userId, $payload);
            } else {
                $results = $this->webPushService->sendToAll($payload);
            }

            $successCount = count(array_filter($results, fn($r) => $r['success']));
            $failureCount = count($results) - $successCount;

            return response()->json([
                'message' => '通知を送信しました',
                'total' => count($results),
                'success' => $successCount,
                'failure' => $failureCount,
                'results' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => '通知の送信に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
