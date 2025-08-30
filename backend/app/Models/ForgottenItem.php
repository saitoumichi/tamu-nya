<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForgottenItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'forgotten_item',
        'details',
        'category',
        'difficulty',
        'situation',
        'location',
        'datetime',
    ];

    protected $casts = [
        'difficulty' => 'integer',
        'situation' => 'array',
        'datetime' => 'datetime',
    ];

    /**
     * ユーザーとのリレーション
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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

    /**
     * 困った度の表示用テキスト
     */
    public function getDifficultyTextAttribute(): string
    {
        $difficultyTexts = [
            1 => '少し困った',
            2 => '困った',
            3 => 'かなり困った',
            4 => 'とても困った',
            5 => '最悪だった'
        ];

        return $difficultyTexts[$this->difficulty] ?? '不明';
    }

    /**
     * 状況の表示用テキスト
     */
    public function getSituationTextAttribute(): string
    {
        if (!$this->situation || empty($this->situation)) {
            return '';
        }

        $situationTexts = [
            'morning' => '朝',
            'in_a_hurry' => '急いでいた',
            'tired' => '疲れていた',
            'distracted' => '気が散っていた',
            'late' => '遅刻しそうだった'
        ];

        return implode('、', array_map(function($situation) use ($situationTexts) {
            return $situationTexts[$situation] ?? $situation;
        }, $this->situation));
    }
}
