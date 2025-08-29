<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ForgottenItemController extends Controller
{
    /**
     * 忘れ物一覧を取得
     */
    public function index(): JsonResponse
    {
        // 現在はダミーデータを返す（データベース接続後は実際のデータを取得）
        $items = [
            [
                'id' => 1,
                'category' => 'forget_things',
                'title' => '鍵を家に忘れた',
                'forgotten_item' => '鍵',
                'details' => '朝急いでいた時に忘れた',
                'difficulty' => 4,
                'situation' => ['morning', 'in_a_hurry'],
                'location' => '家',
                'datetime' => '2024-08-27 08:00:00',
                'created_at' => '2024-08-27 08:00:00'
            ],
            [
                'id' => 2,
                'category' => 'forget_schedule',
                'title' => '会議の時間を忘れた',
                'forgotten_item' => '会議の時間',
                'details' => '午後の会議の時間を忘れていた',
                'difficulty' => 3,
                'situation' => ['work'],
                'location' => 'オフィス',
                'datetime' => '2024-08-27 14:00:00',
                'created_at' => '2024-08-27 14:00:00'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $items,
            'message' => '忘れ物一覧を取得しました'
        ]);
    }

    /**
     * 忘れ物を作成
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'forgotten_item' => 'required|string|max:255',
            'details' => 'nullable|string|max:2000',
            'difficulty' => 'required|integer|min:1|max:5',
            'situation' => 'nullable|array',
            'location' => 'nullable|string|max:255',
            'datetime' => 'required|date'
        ]);

        // 現在はダミーレスポンスを返す（データベース接続後は実際に保存）
        $item = array_merge($validated, [
            'id' => rand(1000, 9999),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'data' => $item,
            'message' => '忘れ物を記録しました'
        ], 201);
    }

    /**
     * 忘れ物の詳細を取得
     */
    public function show(int $id): JsonResponse
    {
        // 現在はダミーデータを返す
        $item = [
            'id' => $id,
            'category' => 'forget_things',
            'title' => '鍵を家に忘れた',
            'forgotten_item' => '鍵',
            'details' => '朝急いでいた時に忘れた',
            'difficulty' => 4,
            'situation' => ['morning', 'in_a_hurry'],
            'location' => '家',
            'datetime' => '2024-08-27 08:00:00',
            'created_at' => '2024-08-27 08:00:00'
        ];

        return response()->json([
            'success' => true,
            'data' => $item,
            'message' => '忘れ物の詳細を取得しました'
        ]);
    }

    /**
     * 忘れ物を更新
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'sometimes|string|max:255',
            'title' => 'sometimes|string|max:255',
            'forgotten_item' => 'sometimes|string|max:255',
            'details' => 'sometimes|nullable|string|max:2000',
            'difficulty' => 'sometimes|integer|min:1|max:5',
            'situation' => 'sometimes|nullable|array',
            'location' => 'sometimes|nullable|string|max:255',
            'datetime' => 'sometimes|date'
        ]);

        // 現在はダミーレスポンスを返す
        $item = array_merge(['id' => $id], $validated, [
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'data' => $item,
            'message' => '忘れ物を更新しました'
        ]);
    }

    /**
     * 忘れ物を削除
     */
    public function destroy(int $id): JsonResponse
    {
        // 現在はダミーレスポンスを返す
        return response()->json([
            'success' => true,
            'message' => "ID: {$id} の忘れ物を削除しました"
        ]);
    }

    /**
     * ユーザー別の忘れ物を取得
     */
    public function getByUser(int $userId): JsonResponse
    {
        // 現在はダミーデータを返す
        $items = [
            [
                'id' => 1,
                'user_id' => $userId,
                'category' => 'forget_things',
                'title' => '鍵を家に忘れた',
                'forgotten_item' => '鍵',
                'created_at' => '2024-08-27 08:00:00'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $items,
            'message' => "ユーザーID: {$userId} の忘れ物を取得しました"
        ]);
    }

    /**
     * カテゴリ別の忘れ物を取得
     */
    public function getByCategory(string $category): JsonResponse
    {
        // 現在はダミーデータを返す
        $items = [
            [
                'id' => 1,
                'category' => $category,
                'title' => 'カテゴリ別の忘れ物',
                'forgotten_item' => 'サンプルアイテム',
                'created_at' => '2024-08-27 08:00:00'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $items,
            'message' => "カテゴリ: {$category} の忘れ物を取得しました"
        ]);
    }
}
