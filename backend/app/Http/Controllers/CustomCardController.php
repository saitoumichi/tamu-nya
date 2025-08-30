<?php

namespace App\Http\Controllers;

use App\Models\CustomCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CustomCardController extends Controller
{
    /**
     * ユーザーのカスタムカード一覧を取得
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            $cards = CustomCard::where('user_id', $user->id)
                ->orderBy('type')
                ->orderBy('created_at')
                ->get();

            // タイプ別にグループ化
            $grouped = [
                'categories' => $cards->where('type', 'category')->values(),
                'things' => $cards->where('type', 'thing')->values(),
                'situations' => $cards->where('type', 'situation')->values(),
            ];

            return response()->json([
                'success' => true,
                'data' => $grouped,
                'message' => 'カスタムカード一覧を取得しました'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'カスタムカードの取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * カスタムカードを作成
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'type' => 'required|in:category,thing,situation',
                'name' => 'required|string|max:255',
                'emoji' => 'required|string|max:10',
                'card_id' => 'required|string|max:255',
                'category_id' => 'nullable|string|max:255',
                'description' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'バリデーションエラー',
                    'errors' => $validator->errors()
                ], 400);
            }

            $user = Auth::user();

            // 既存カードの重複チェック
            $existing = CustomCard::where('user_id', $user->id)
                ->where('card_id', $request->card_id)
                ->where('type', $request->type)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'このIDのカードは既に存在します'
                ], 409);
            }

            $card = CustomCard::create([
                'user_id' => $user->id,
                'type' => $request->type,
                'name' => $request->name,
                'emoji' => $request->emoji,
                'card_id' => $request->card_id,
                'category_id' => $request->category_id,
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => true,
                'data' => $card,
                'message' => 'カスタムカードを作成しました'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'カスタムカードの作成に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * カスタムカードを更新
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'emoji' => 'sometimes|required|string|max:10',
                'category_id' => 'nullable|string|max:255',
                'description' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'バリデーションエラー',
                    'errors' => $validator->errors()
                ], 400);
            }

            $user = Auth::user();
            $card = CustomCard::where('user_id', $user->id)->findOrFail($id);

            $card->update($request->only(['name', 'emoji', 'category_id', 'description']));

            return response()->json([
                'success' => true,
                'data' => $card,
                'message' => 'カスタムカードを更新しました'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'カスタムカードの更新に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * カスタムカードを削除
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = Auth::user();
            $card = CustomCard::where('user_id', $user->id)->findOrFail($id);

            $card->delete();

            return response()->json([
                'success' => true,
                'message' => 'カスタムカードを削除しました'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'カスタムカードの削除に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }
}
