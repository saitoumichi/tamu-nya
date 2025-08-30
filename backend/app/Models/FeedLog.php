<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'monster_id',
        'user_id',
        'item_code',
        'applied_at',
        'request_id',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
    ];

    /**
     * モンスターとのリレーション
     */
    public function monster(): BelongsTo
    {
        return $this->belongsTo(Fairy::class, 'monster_id');
    }

    /**
     * ユーザーとのリレーション
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 冪等性チェック用のリクエストIDで検索
     */
    public static function findByRequestId(string $requestId): ?self
    {
        return static::where('request_id', $requestId)->first();
    }
}
