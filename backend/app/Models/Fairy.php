<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fairy extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'category',
        'forgotten_item',
        'difficulty',
        'situation',
        'location',
        'feed_count',
        'level',
        'updated_at',
    ];

    protected $casts = [
        'situation' => 'array',
        'difficulty' => 'integer',
        'feed_count' => 'integer',
        'level' => 'integer',
        'updated_at' => 'datetime',
    ];

    /**
     * ユーザーとのリレーション
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 餌やり履歴とのリレーション
     */
    public function feedLogs(): HasMany
    {
        return $this->hasMany(FeedLog::class, 'monster_id');
    }

    /**
     * レベルアップ処理
     */
    public function levelUp(): void
    {
        $this->increment('level');
        $this->feed_count = 0; // レベルアップ後は餌カウントをリセット
        $this->save();
    }

    /**
     * 餌を与える
     */
    public function feed(): void
    {
        $this->increment('feed_count');
        
        // 餌カウントが10に達したらレベルアップ
        if ($this->feed_count >= 10) {
            $this->levelUp();
        }
        
        $this->save();
    }

    /**
     * カテゴリに応じた絵文字を取得
     */
    public function getEmojiAttribute(): string
    {
        $emojiMap = [
            'forget_things' => '🔑',
            'electronics' => '📱',
            'documents' => '📄',
            'clothing' => '👕',
            'other' => '📦'
        ];

        return $emojiMap[$this->category] ?? '📦';
    }
}
