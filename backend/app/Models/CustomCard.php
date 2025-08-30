<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomCard extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'name',
        'emoji',
        'card_id',
        'category_id',
        'description'
    ];

    /**
     * ユーザーとの関係
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
