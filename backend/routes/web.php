<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PushNotificationController;

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
