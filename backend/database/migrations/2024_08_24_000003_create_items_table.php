<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // 忘れ物のタイトル（例：「鍵」「財布」）
            $table->text('description')->nullable(); // 詳細な説明
            $table->string('category'); // カテゴリ（例：「🔑」「💰」「📱」）
            $table->string('location')->nullable(); // 忘れた場所
            $table->timestamp('datetime'); // 忘れた日時
            $table->tinyInteger('severity')->default(1); // 重要度 (1-5)
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // ユーザーID
            $table->timestamps();
            $table->softDeletes(); // 論理削除対応
            
            // インデックス
            $table->index(['user_id', 'created_at']);
            $table->index(['category']);
            $table->index(['datetime']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};