<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ForgottenItem;
use App\Models\Fairy;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // テストユーザーを作成
        $user = User::create([
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // テスト用の忘れ物データを作成
        $forgottenItems = [
            [
                'user_id' => $user->id,
                'title' => '鍵を家に忘れた',
                'forgotten_item' => '鍵',
                'details' => '朝急いでいた時に忘れた',
                'category' => 'forget_things',
                'difficulty' => 4,
                'situation' => ['morning', 'in_a_hurry'],
                'location' => '家',
                'datetime' => now()->subDays(1)->setTime(8, 0),
            ],
            [
                'user_id' => $user->id,
                'title' => 'スマホを忘れた',
                'forgotten_item' => 'スマートフォン',
                'details' => '電車に乗る前に気づいた',
                'category' => 'electronics',
                'difficulty' => 3,
                'situation' => ['morning', 'distracted'],
                'location' => '駅',
                'datetime' => now()->subDays(2)->setTime(7, 30),
            ],
            [
                'user_id' => $user->id,
                'title' => '書類を忘れた',
                'forgotten_item' => '会議資料',
                'details' => '重要な会議の資料を忘れた',
                'category' => 'documents',
                'difficulty' => 5,
                'situation' => ['work', 'late'],
                'location' => 'オフィス',
                'datetime' => now()->subDays(3)->setTime(9, 0),
            ],
        ];

        foreach ($forgottenItems as $item) {
            ForgottenItem::create($item);
        }

        // テスト用のモンスター（Fairy）データを作成
        $fairies = [
            [
                'user_id' => $user->id,
                'name' => '鍵の精霊',
                'category' => 'forget_things',
                'forgotten_item' => '🔑 鍵',
                'difficulty' => 4,
                'situation' => ['morning', 'in_a_hurry'],
                'location' => '家',
                'feed_count' => 3,
                'level' => 1,
            ],
            [
                'user_id' => $user->id,
                'name' => 'スマホの精霊',
                'category' => 'electronics',
                'forgotten_item' => '📱 スマートフォン',
                'difficulty' => 3,
                'situation' => ['morning', 'distracted'],
                'location' => '駅',
                'feed_count' => 7,
                'level' => 1,
            ],
        ];

        foreach ($fairies as $fairy) {
            Fairy::create($fairy);
        }

        $this->command->info('テストデータの投入が完了しました！');
    }
}
