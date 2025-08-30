<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ForgottenItemController;
use App\Http\Controllers\MonsterController;
use App\Http\Controllers\AuthController;

// グローバルミドルウェアとしてCORSヘッダーを設定
Route::get('/', function () {
    return view('welcome');
});

// 認証関連のAPI
Route::prefix('api/auth')->group(function () {
    Route::post('/signup', [AuthController::class, 'signup']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');
});

// ユーザー管理のAPI
Route::prefix('api/users')->middleware('auth')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::get('/me/monsters', [MonsterController::class, 'getUserMonsters']);
});

// モンスター管理のAPI
Route::prefix('api/monsters')->middleware('auth')->group(function () {
    Route::post('/', [MonsterController::class, 'store']);
    Route::post('/{id}/feed', [MonsterController::class, 'feed']);
    Route::post('/{id}/level-up', [MonsterController::class, 'levelUp']);
});

// 忘れ物管理のAPI
Route::prefix('api/forgotten-items')->group(function () {
    Route::get('/', [ForgottenItemController::class, 'index']);
    Route::post('/', [ForgottenItemController::class, 'store']);
    Route::get('/{id}', [ForgottenItemController::class, 'show']);
    Route::put('/{id}', [ForgottenItemController::class, 'update']);
    Route::delete('/{id}', [ForgottenItemController::class, 'destroy']);
    Route::get('/user/{userId}', [ForgottenItemController::class, 'getUserItems']);
    Route::get('/category/{category}', [ForgottenItemController::class, 'getCategoryItems']);
    Route::get('/stats', [ForgottenItemController::class, 'getStats']);
});
