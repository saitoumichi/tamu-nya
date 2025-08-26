<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PushNotificationController;
use App\Http\Controllers\ForgottenItemController;
use App\Http\Controllers\MonsterController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AnalyticsController;

Route::get('/', function () {
    return view('welcome');
});

// プッシュ通知のルート
Route::prefix('api/push')->group(function () {
    Route::post('/subscription', [PushNotificationController::class, 'store']);
    Route::delete('/subscription', [PushNotificationController::class, 'destroy']);
    Route::post('/send-forget-item', [PushNotificationController::class, 'sendForgetItemCheck']);
    Route::post('/send-custom', [PushNotificationController::class, 'sendCustomNotification']);
});

// 忘れ物管理のAPI
Route::prefix('api/forgotten-items')->group(function () {
    Route::get('/', [ForgottenItemController::class, 'index']);
    Route::post('/', [ForgottenItemController::class, 'store']);
    Route::get('/{id}', [ForgottenItemController::class, 'show']);
    Route::put('/{id}', [ForgottenItemController::class, 'update']);
    Route::delete('/{id}', [ForgottenItemController::class, 'destroy']);
    Route::get('/user/{userId}', [ForgottenItemController::class, 'getByUser']);
    Route::get('/category/{category}', [ForgottenItemController::class, 'getByCategory']);
});

// モンスター管理のAPI
Route::prefix('api/monsters')->group(function () {
    Route::get('/', [MonsterController::class, 'index']);
    Route::get('/{id}', [MonsterController::class, 'show']);
    Route::post('/', [MonsterController::class, 'store']);
    Route::put('/{id}', [MonsterController::class, 'update']);
    Route::delete('/{id}', [MonsterController::class, 'destroy']);
    Route::post('/{id}/level-up', [MonsterController::class, 'levelUp']);
    Route::post('/{id}/affection-up', [MonsterController::class, 'affectionUp']);
    Route::post('/{id}/evolve', [MonsterController::class, 'evolve']);
});

// ユーザー管理のAPI
Route::prefix('api/users')->group(function () {
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::get('/stats', [UserController::class, 'stats']);
    Route::get('/{id}/monsters', [UserController::class, 'getMonsters']);
    Route::get('/{id}/forgotten-items', [UserController::class, 'getForgottenItems']);
});

// 統計・分析のAPI
Route::prefix('api/analytics')->group(function () {
    Route::get('/forgotten-items/summary', [AnalyticsController::class, 'forgottenItemsSummary']);
    Route::get('/forgotten-items/trends', [AnalyticsController::class, 'forgottenItemsTrends']);
    Route::get('/monsters/growth', [AnalyticsController::class, 'monstersGrowth']);
    Route::get('/user/{userId}/progress', [AnalyticsController::class, 'userProgress']);
});
