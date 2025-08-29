<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateVapidKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webpush:generate-vapid-keys';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'WebPush用のVAPIDキーを生成します';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('VAPIDキーを生成中...');

        try {
            $keys = VAPID::createVapidKeys();

            $this->info('VAPIDキーが生成されました！');
            $this->newLine();
            $this->info('以下のキーを.envファイルに追加してください：');
            $this->newLine();
            $this->line('VAPID_PUBLIC=' . $keys['publicKey']);
            $this->line('VAPID_PRIVATE=' . $keys['privateKey']);
            $this->newLine();
            $this->warn('注意: VAPID_PRIVATEキーは機密情報です。公開しないでください。');

        } catch (\Exception $e) {
            $this->error('VAPIDキーの生成に失敗しました: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
