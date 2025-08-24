<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ItemController extends Controller
{
    /**
     * 忘れ物一覧を取得
     */
    public function index(Request $request): JsonResponse
    {
        $query = Item::with('user')
            ->byUser(auth()->id() ?? 1) // 認証未実装時は仮にユーザーID=1を使用
            ->orderBy('datetime', 'desc');

        // カテゴリでフィルタ
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // 期間でフィルタ
        if ($request->has('from')) {
            $query->where('datetime', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('datetime', '<=', $request->to);
        }

        $items = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $items,
            'message' => '忘れ物一覧を取得しました'
        ]);
    }

    /**
     * 新しい忘れ物を登録
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'category' => 'required|string|max:50',
                'location' => 'nullable|string|max:255',
                'datetime' => 'required|date',
                'severity' => 'nullable|integer|min:1|max:5'
            ]);

            $validated['user_id'] = auth()->id() ?? 1; // 認証未実装時は仮にユーザーID=1を使用
            $validated['severity'] = $validated['severity'] ?? 1;

            $item = Item::create($validated);

            return response()->json([
                'success' => true,
                'data' => $item->load('user'),
                'message' => '忘れ物を登録しました'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
                'message' => '入力データに誤りがあります'
            ], 422);
        }
    }

    /**
     * 特定の忘れ物の詳細を取得
     */
    public function show(Item $item): JsonResponse
    {
        // 本人の忘れ物のみ閲覧可能にする（認証実装後）
        if ($item->user_id !== (auth()->id() ?? 1)) {
            return response()->json([
                'success' => false,
                'message' => 'アクセス権限がありません'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $item->load('user'),
            'message' => '忘れ物の詳細を取得しました'
        ]);
    }

    /**
     * 忘れ物情報を更新
     */
    public function update(Request $request, Item $item): JsonResponse
    {
        // 本人の忘れ物のみ更新可能にする（認証実装後）
        if ($item->user_id !== (auth()->id() ?? 1)) {
            return response()->json([
                'success' => false,
                'message' => 'アクセス権限がありません'
            ], 403);
        }

        try {
            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string|max:1000',
                'category' => 'sometimes|string|max:50',
                'location' => 'nullable|string|max:255',
                'datetime' => 'sometimes|date',
                'severity' => 'nullable|integer|min:1|max:5'
            ]);

            $item->update($validated);

            return response()->json([
                'success' => true,
                'data' => $item->load('user'),
                'message' => '忘れ物を更新しました'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
                'message' => '入力データに誤りがあります'
            ], 422);
        }
    }

    /**
     * 忘れ物を削除（論理削除）
     */
    public function destroy(Item $item): JsonResponse
    {
        // 本人の忘れ物のみ削除可能にする（認証実装後）
        if ($item->user_id !== (auth()->id() ?? 1)) {
            return response()->json([
                'success' => false,
                'message' => 'アクセス権限がありません'
            ], 403);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => '忘れ物を削除しました'
        ]);
    }

    /**
     * 最近の忘れ物を取得（ダッシュボード用）
     */
    public function recent(Request $request): JsonResponse
    {
        $days = $request->get('days', 7);
        
        $items = Item::byUser(auth()->id() ?? 1)
            ->recent($days)
            ->orderBy('datetime', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
            'message' => "最近{$days}日間の忘れ物を取得しました"
        ]);
    }

    /**
     * カテゴリ別統計を取得
     */
    public function statistics(Request $request): JsonResponse
    {
        $userId = auth()->id() ?? 1;
        $days = $request->get('days', 30);

        $stats = Item::byUser($userId)
            ->recent($days)
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->get();

        $totalItems = Item::byUser($userId)->recent($days)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $stats,
                'total' => $totalItems,
                'period_days' => $days
            ],
            'message' => 'カテゴリ別統計を取得しました'
        ]);
    }
}