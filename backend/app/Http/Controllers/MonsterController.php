<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MonsterController extends Controller
{
    /**
     * モンスター一覧を取得
     */
    public function index()
    {
        try {
            $monsters = [
                [
                    'id' => 1,
                    'name' => '忘れ物モンスター',
                    'type' => 'forget',
                    'level' => 3,
                    'affection' => 80,
                    'evolved' => false,
                    'image_url' => '/monsters/forget/monster-1.jpg'
                ],
                [
                    'id' => 2,
                    'name' => '記憶モンスター',
                    'type' => 'memory',
                    'level' => 2,
                    'affection' => 65,
                    'evolved' => false,
                    'image_url' => '/monsters/memory/monster-2.jpg'
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
     * モンスター詳細を取得
     */
    public function show($id)
    {
        try {
            $monster = [
                'id' => (int)$id,
                'name' => '忘れ物モンスター',
                'type' => 'forget',
                'level' => 3,
                'affection' => 80,
                'evolved' => false,
                'image_url' => '/monsters/forget/monster-1.jpg',
                'description' => 'このモンスターは忘れ物から生まれました',
                'created_at' => now()->subDays(10),
                'updated_at' => now()
            ];

            return response()->json([
                'success' => true,
                'data' => $monster,
                'message' => 'モンスター詳細を取得しました'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'モンスター詳細の取得に失敗しました'
            ], 500);
        }
    }

    /**
     * モンスターを作成
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|string|max:255',
                'level' => 'sometimes|integer|min:1|max:100',
                'affection' => 'sometimes|integer|min:0|max:100'
            ]);

            $monster = array_merge($validated, [
                'id' => rand(1000, 9999),
                'level' => $validated['level'] ?? 1,
                'affection' => $validated['affection'] ?? 0,
                'evolved' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => $monster,
                'message' => 'モンスターを作成しました'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'バリデーションエラー',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'モンスターの作成に失敗しました'
            ], 500);
        }
    }

    /**
     * モンスターを更新
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'type' => 'sometimes|string|max:255',
                'level' => 'sometimes|integer|min:1|max:100',
                'affection' => 'sometimes|integer|min:0|max:100'
            ]);

            $monster = array_merge(['id' => (int)$id], $validated, [
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => $monster,
                'message' => 'モンスターを更新しました'
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
                'message' => 'モンスターの更新に失敗しました'
            ], 500);
        }
    }

    /**
     * モンスターを削除
     */
    public function destroy($id)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => "ID: {$id} のモンスターを削除しました"
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'モンスターの削除に失敗しました'
            ], 500);
        }
    }

    /**
     * モンスターのレベルアップ
     */
    public function levelUp($id)
    {
        try {
            $monster = [
                'id' => (int)$id,
                'name' => '忘れ物モンスター',
                'level' => 4, // レベルアップ後
                'affection' => 85,
                'updated_at' => now()
            ];

            return response()->json([
                'success' => true,
                'data' => $monster,
                'message' => 'モンスターがレベルアップしました！'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'レベルアップに失敗しました'
            ], 500);
        }
    }

    /**
     * モンスターの好感度アップ
     */
    public function affectionUp($id)
    {
        try {
            $monster = [
                'id' => (int)$id,
                'name' => '忘れ物モンスター',
                'level' => 3,
                'affection' => 90, // 好感度アップ後
                'updated_at' => now()
            ];

            return response()->json([
                'success' => true,
                'data' => $monster,
                'message' => 'モンスターの好感度が上がりました！'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '好感度アップに失敗しました'
            ], 500);
        }
    }

    /**
     * モンスターの進化
     */
    public function evolve($id)
    {
        try {
            $monster = [
                'id' => (int)$id,
                'name' => '進化した忘れ物モンスター',
                'level' => 5,
                'affection' => 100,
                'evolved' => true, // 進化済み
                'updated_at' => now()
            ];

            return response()->json([
                'success' => true,
                'data' => $monster,
                'message' => 'モンスターが進化しました！'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '進化に失敗しました'
            ], 500);
        }
    }
}
