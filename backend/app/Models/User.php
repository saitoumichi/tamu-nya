<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * ユーザーのモンスター（Fairy）とのリレーション
     */
    public function fairies(): HasMany
    {
        return $this->hasMany(Fairy::class);
    }

    /**
     * ユーザーの餌やり履歴とのリレーション
     */
    public function feedLogs(): HasMany
    {
        return $this->hasMany(FeedLog::class);
    }

    /**
     * ユーザーの忘れ物履歴とのリレーション
     */
    public function forgottenItems(): HasMany
    {
        return $this->hasMany(ForgottenItem::class);
    }

    /**
     * ユーザーの統計情報を取得
     */
    public function getStats(): array
    {
        return [
            'total_monsters' => $this->fairies()->count(),
            'total_forgotten_items' => $this->forgottenItems()->count(),
            'forgotten_items_this_month' => $this->forgottenItems()
                ->whereMonth('created_at', now()->month)
                ->count(),
            'monsters_level_avg' => $this->fairies()->avg('level') ?? 0,
            'achievement_rate' => $this->calculateAchievementRate(),
        ];
    }

    /**
     * 達成率を計算
     */
    private function calculateAchievementRate(): float
    {
        $totalMonsters = $this->fairies()->count();
        if ($totalMonsters === 0) {
            return 0.0;
        }

        $highLevelMonsters = $this->fairies()->where('level', '>=', 5)->count();
        return round(($highLevelMonsters / $totalMonsters) * 100, 1);
    }
}
