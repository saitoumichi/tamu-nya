<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * ユーザー登録
     */
    public function signup(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            // Sanctumトークンを生成
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
                'message' => 'ユーザー登録が完了しました'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'ユーザー登録に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ユーザーログイン
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            if (!Auth::attempt($validated)) {
                throw ValidationException::withMessages([
                    'email' => ['認証情報が正しくありません。'],
                ]);
            }

            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
                'message' => 'ログインが完了しました'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'ログインに失敗しました: ' . $e->getMessage()
            ], 401);
        }
    }

    /**
     * ユーザーログアウト
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            // 現在のユーザーのトークンを削除
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'ログアウトが完了しました'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'ログアウトに失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ユーザープロフィール取得
     */
    public function profile(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => '認証が必要です'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'プロフィールを取得しました'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'プロフィールの取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

}
