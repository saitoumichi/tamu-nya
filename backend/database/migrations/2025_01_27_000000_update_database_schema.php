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
        // usersテーブルの更新
        Schema::table('users', function (Blueprint $table) {
            // 既存のカラムはそのまま保持
            // 必要に応じて新しいカラムを追加
        });

        // fairiesテーブルの更新（既存のテーブルを削除して再作成）
        Schema::dropIfExists('fairies');
        Schema::create('fairies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('category');
            $table->string('forgotten_item');
            $table->integer('difficulty');
            $table->json('situation');
            $table->string('location')->nullable();
            $table->integer('feed_count')->default(0);
            $table->integer('level')->default(1);
            $table->timestamps();
        });

        // feeding_historiesテーブルの更新（既存のテーブルを削除して再作成）
        Schema::dropIfExists('feeding_histories');
        Schema::create('feed_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monster_id')->constrained('fairies')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('item_code');
            $table->timestamp('applied_at');
            $table->string('request_id')->unique();
            $table->timestamps();
        });

        // forgotten_itemsテーブルの作成
        Schema::create('forgotten_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('forgotten_item');
            $table->text('details')->nullable();
            $table->string('category');
            $table->integer('difficulty')->nullable();
            $table->json('situation')->nullable();
            $table->string('location')->nullable();
            $table->timestamp('datetime');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forgotten_items');
        Schema::dropIfExists('feed_logs');
        Schema::dropIfExists('fairies');
    }
};
