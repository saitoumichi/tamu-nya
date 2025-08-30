<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class Authenticate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 簡易的な認証チェック
        // 実際の実装ではJWTトークンの検証を行う
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => '認証が必要です'
            ], 401);
        }

        return $next($request);
    }
}
