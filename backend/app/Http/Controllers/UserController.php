<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * プロフィール取得
     * 認証されたユーザーのプロフィール情報を取得
     */
    public function profile(Request $request)
    {
        try {
            // 現在認証されているユーザーを取得
            // 実際の認証システムがない場合、ダミーユーザーを返す
            $user = [
                'id' => 1,
                'name' => '田中太郎',
                'email' => 'tanaka@example.com',
                'email_verified_at' => now(),
                'created_at' => now()->subDays(30),
                'updated_at' => now()
            ];

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'プロフィールを取得しました'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'プロフィールの取得に失敗しました'
            ], 500);
        }
    }

    /**
     * プロフィール更新
     */
    public function updateProfile(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255'
            ]);

            // ダミーレスポンス
            $user = [
                'id' => 1,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'updated_at' => now()
            ];

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'プロフィールを更新しました'
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'バリデーションエラー',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'プロフィールの更新に失敗しました'
            ], 500);
        }
    }

    /**
     * 統計情報取得
     */
    public function stats()
    {
        try {
            $stats = [
                'total_monsters' => 5,
                'total_forgotten_items' => 12,
                'forgotten_items_this_month' => 3,
                'monsters_level_avg' => 3.2,
                'achievement_rate' => 75.5
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => '統計情報を取得しました'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '統計情報の取得に失敗しました'
            ], 500);
        }
    }

    /**
     * ユーザーのモンスター一覧取得
     */
    public function getMonsters($id)
    {
        try {
            $monsters = [
                [
                    'id' => 1,
                    'name' => '忘れ物モンスター',
                    'type' => 'forget',
                    'level' => 3,
                    'affection' => 80,
                    'evolved' => false
                ],
                [
                    'id' => 2,
                    'name' => '記憶モンスター',
                    'type' => 'memory',
                    'level' => 2,
                    'affection' => 65,
                    'evolved' => false
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $monsters,
                'message' => 'モンスター一覧を取得しました'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'モンスター一覧の取得に失敗しました'
            ], 500);
        }
    }

    /**
     * ユーザーの忘れ物一覧取得
     */
    public function getForgottenItems($id)
    {
        try {
            $forgottenItems = [
                [
                    'id' => 1,
                    'category' => 'forget_things',
                    'title' => '鍵を家に忘れた',
                    'difficulty' => 4,
                    'created_at' => now()->subDays(5)
                ],
                [
                    'id' => 2,
                    'category' => 'forget_schedule',
                    'title' => '会議の時間を忘れた',
                    'difficulty' => 3,
                    'created_at' => now()->subDays(2)
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $forgottenItems,
                'message' => '忘れ物一覧を取得しました'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '忘れ物一覧の取得に失敗しました'
            ], 500);
        }
    }
}
