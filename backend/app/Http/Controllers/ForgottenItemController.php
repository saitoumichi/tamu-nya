<?php

namespace App\Http\Controllers;

use App\Models\ForgottenItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ForgottenItemController extends Controller
{
    /**
     * CORSヘッダーをレスポンスに追加
     */
    private function addCorsHeaders($response)
    {
        $response->header('Access-Control-Allow-Origin', '*');
        $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return $response;
    }

    /**
     * 忘れ物一覧を取得
     */
    public function index(): JsonResponse
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => '認証が必要です'
                ], 401);
            }

            $items = ForgottenItem::where('user_id', $userId)
                ->orderBy('datetime', 'desc')
                ->get();

            // 各アイテムに表示用の属性を追加
            $formattedItems = $items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'user_id' => $item->user_id,
                    'title' => $item->title,
                    'forgotten_item' => $item->forgotten_item,
                    'details' => $item->details,
                    'category' => $item->category,
                    'category_name' => $item->category_name,
                    'emoji' => $item->emoji,
                    'difficulty' => $item->difficulty,
                    'difficulty_text' => $item->difficulty_text,
                    'situation' => $item->situation,
                    'situation_text' => $item->situation_text,
                    'location' => $item->location,
                    'datetime' => $item->datetime,
                    'created_at' => $item->created_at,
                    'updated_at' => $item->updated_at,
                ];
            });

            $response = response()->json([
                'success' => true,
                'data' => $formattedItems,
                'message' => '忘れ物一覧を取得しました'
            ]);

            return $this->addCorsHeaders($response);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '忘れ物一覧の取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 忘れ物を作成
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'category' => 'required|string|max:255',
                'title' => 'required|string|max:255',
                'forgotten_item' => 'required|string|max:255',
                'details' => 'nullable|string|max:2000',
                'difficulty' => 'required|integer|min:1|max:5',
                'situation' => 'nullable|array',
                'situation.*' => 'string|max:255',
                'location' => 'nullable|string|max:255',
                'datetime' => 'required|date'
            ]);

            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => '認証が必要です'
                ], 401);
            }

            $item = ForgottenItem::create(array_merge($validated, [
                'user_id' => $userId
            ]));

            $response = response()->json([
                'success' => true,
                'data' => $item,
                'message' => '忘れ物を記録しました'
            ], 201);

            return $this->addCorsHeaders($response);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '忘れ物の記録に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 忘れ物の詳細を取得
     */
    public function show(int $id): JsonResponse
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => '認証が必要です'
                ], 401);
            }

            $item = ForgottenItem::where('id', $id)
                ->where('user_id', $userId)
                ->firstOrFail();

            $response = response()->json([
                'success' => true,
                'data' => $item,
                'message' => '忘れ物の詳細を取得しました'
            ]);

            return $this->addCorsHeaders($response);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '忘れ物の詳細取得に失敗しました: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * 忘れ物を更新
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => '認証が必要です'
                ], 401);
            }

            $validated = $request->validate([
                'category' => 'sometimes|string|max:255',
                'title' => 'sometimes|string|max:255',
                'forgotten_item' => 'sometimes|string|max:255',
                'details' => 'nullable|string|max:2000',
                'difficulty' => 'sometimes|integer|min:1|max:5',
                'situation' => 'nullable|array',
                'situation.*' => 'string|max:255',
                'location' => 'nullable|string|max:255',
                'datetime' => 'sometimes|date'
            ]);

            $item = ForgottenItem::where('id', $id)
                ->where('user_id', $userId)
                ->firstOrFail();
            $item->update($validated);

            $response = response()->json([
                'success' => true,
                'data' => $item,
                'message' => '忘れ物を更新しました'
            ]);

            return $this->addCorsHeaders($response);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '忘れ物の更新に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 忘れ物を削除
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => '認証が必要です'
                ], 401);
            }

            $item = ForgottenItem::where('id', $id)
                ->where('user_id', $userId)
                ->firstOrFail();
            $item->delete();

            $response = response()->json([
                'success' => true,
                'message' => '忘れ物を削除しました'
            ]);

            return $this->addCorsHeaders($response);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '忘れ物の削除に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ユーザー別忘れ物取得
     */
    public function getUserItems(int $userId): JsonResponse
    {
        try {
            $items = ForgottenItem::where('user_id', $userId)
                ->orderBy('datetime', 'desc')
                ->get();

            $response = response()->json([
                'success' => true,
                'data' => $items,
                'message' => 'ユーザーの忘れ物一覧を取得しました'
            ]);

            return $this->addCorsHeaders($response);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'ユーザーの忘れ物一覧取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * カテゴリ別忘れ物取得
     */
    public function getCategoryItems(string $category): JsonResponse
    {
        try {
            $items = ForgottenItem::where('category', $category)
                ->orderBy('datetime', 'desc')
                ->get();

            $response = response()->json([
                'success' => true,
                'data' => $items,
                'message' => 'カテゴリ別の忘れ物一覧を取得しました'
            ]);

            return $this->addCorsHeaders($response);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'カテゴリ別の忘れ物一覧取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 忘れ物の統計情報取得
     */
    public function getStats(): JsonResponse
    {
        try {
            // データベースドライバーによって異なるSQLを使用
            $driver = config('database.default');
            $connection = config("database.connections.{$driver}.driver");

            if ($connection === 'sqlite') {
                // SQLite用のクエリ
                $monthlyTrend = ForgottenItem::selectRaw('strftime("%Y-%m", datetime) as month, COUNT(*) as count')
                    ->groupBy('month')
                    ->orderBy('month', 'desc')
                    ->limit(12)
                    ->get();
            } else {
                // MySQL用のクエリ
                $monthlyTrend = ForgottenItem::selectRaw('DATE_FORMAT(datetime, "%Y-%m") as month, COUNT(*) as count')
                    ->groupBy('month')
                    ->orderBy('month', 'desc')
                    ->limit(12)
                    ->get();
            }

            $stats = [
                'total_count' => ForgottenItem::count(),
                'category_distribution' => ForgottenItem::selectRaw('category, COUNT(*) as count')
                    ->groupBy('category')
                    ->get(),
                'difficulty_average' => ForgottenItem::avg('difficulty'),
                'monthly_trend' => $monthlyTrend,
                'recent_activity' => ForgottenItem::where('created_at', '>=', now()->subDays(7))
                    ->count(),
            ];


            $response = response()->json([
                'success' => true,
                'data' => $stats,
                'message' => '忘れ物の統計情報を取得しました'
            ]);

            return $this->addCorsHeaders($response);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '統計情報の取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }
}
