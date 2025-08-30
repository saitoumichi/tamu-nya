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
        Schema::create('custom_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'category', 'thing', 'situation'
            $table->string('name');
            $table->string('emoji');
            $table->string('card_id'); // カードのユニークID
            $table->string('category_id')->nullable(); // things用のカテゴリ参照
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'card_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_cards');
    }
};
