<?php

namespace App\Http\Controllers;

use App\Models\Fairy;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class MonsterController extends Controller
{
    /**
     * モンスター作成
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category' => 'required|string|max:255',
                'forgotten_item' => 'required|string|max:255',
                'difficulty' => 'required|integer|min:1|max:5',
                'situation' => 'required|array',
                'situation.*' => 'string|max:255',
                'location' => 'nullable|string|max:255',
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => '認証が必要です'
                ], 401);
            }

            $monster = Fairy::create(array_merge($validated, [
                'user_id' => $user->id,
                'feed_count' => 0,
                'level' => 1,
            ]));

            return response()->json([
                'success' => true,
                'data' => $monster,
                'message' => 'モンスターを作成しました'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'モンスターの作成に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ユーザーが所有するモンスター一覧取得
     */
    public function getUserMonsters(): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => '認証が必要です'
                ], 401);
            }

            $monsters = Fairy::where('user_id', $user->id)
                ->orderBy('updated_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $monsters,
                'message' => 'ユーザーのモンスター一覧を取得しました'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'モンスター一覧の取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * モンスターに餌やり
     */
    public function feed(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => '認証が必要です'
                ], 401);
            }

            $monster = Fairy::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $monster->feed();

            return response()->json([
                'success' => true,
                'data' => $monster,
                'message' => 'モンスターに餌を与えました'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '餌やりに失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * モンスターレベルアップ
     */
    public function levelUp(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => '認証が必要です'
                ], 401);
            }

            $monster = Fairy::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $monster->levelUp();

            return response()->json([
                'success' => true,
                'data' => $monster,
                'message' => 'モンスターがレベルアップしました！'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'レベルアップに失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }
}
