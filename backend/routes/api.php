<?php

use App\Http\Controllers\ItemController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// 忘れ物管理API
Route::prefix('items')->group(function () {
    Route::get('/', [ItemController::class, 'index']); // 忘れ物一覧取得
    Route::post('/', [ItemController::class, 'store']); // 忘れ物登録
    Route::get('/recent', [ItemController::class, 'recent']); // 最近の忘れ物取得
    Route::get('/statistics', [ItemController::class, 'statistics']); // 統計データ取得
    Route::get('/{item}', [ItemController::class, 'show']); // 忘れ物詳細取得
    Route::put('/{item}', [ItemController::class, 'update']); // 忘れ物更新
    Route::delete('/{item}', [ItemController::class, 'destroy']); // 忘れ物削除
});