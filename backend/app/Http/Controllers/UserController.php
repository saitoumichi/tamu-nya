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

    public function updateProfile()
    {
        // TODO: プロフィール更新の実装
    }

    public function stats()
    {
        // TODO: 統計情報の実装
    }

    public function getMonsters()
    {
        // TODO: モンスター一覧の実装
    }

    public function getForgottenItems()
    {
        // TODO: 忘れ物一覧の実装
    }
}
