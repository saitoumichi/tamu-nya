<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ForgottenItemController;
use App\Http\Controllers\MonsterController;
use App\Http\Controllers\CustomCardController;
use Illuminate\Support\Facades\Route;

// 認証関連のAPI
Route::prefix('auth')->group(function () {
    Route::post('signup', [AuthController::class, 'signup']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

// ユーザー管理のAPI
Route::prefix('users')->middleware('auth:sanctum')->group(function () {
    Route::get('profile', [AuthController::class, 'profile']);
    Route::get('me/monsters', [MonsterController::class, 'getUserMonsters']);
});

// モンスター管理のAPI
Route::prefix('monsters')->middleware('auth:sanctum')->group(function () {
    Route::post('/', [MonsterController::class, 'store']);
    Route::post('{id}/feed', [MonsterController::class, 'feed']);
    Route::post('{id}/level-up', [MonsterController::class, 'levelUp']);
});

// 忘れ物管理のAPI
Route::prefix('forgotten-items')->group(function () {
    // 公開エンドポイント（一時的に認証不要）
    Route::get('stats', [ForgottenItemController::class, 'getStats']);
    
    // 認証が必要なエンドポイント
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/', [ForgottenItemController::class, 'index']);
        Route::post('/', [ForgottenItemController::class, 'store']);
        Route::get('{id}', [ForgottenItemController::class, 'show']);
        Route::put('{id}', [ForgottenItemController::class, 'update']);
        Route::delete('{id}', [ForgottenItemController::class, 'destroy']);
        Route::get('user/{userId}', [ForgottenItemController::class, 'getUserItems']);
        Route::get('category/{category}', [ForgottenItemController::class, 'getCategoryItems']);
    });
});

// カスタムカード管理のAPI
Route::prefix('custom-cards')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [CustomCardController::class, 'index']);
    Route::post('/', [CustomCardController::class, 'store']);
    Route::put('{id}', [CustomCardController::class, 'update']);
    Route::delete('{id}', [CustomCardController::class, 'destroy']);
});