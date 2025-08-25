<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

# Laravel Backend

## WebPush設定

このプロジェクトでは、WebPushを使用してプッシュ通知を実装しています。

### 1. VAPIDキーの生成

以下のコマンドでVAPIDキーを生成してください：

```bash
php artisan webpush:generate-vapid-keys
```

### 2. 環境変数の設定

生成されたVAPIDキーを`.env`ファイルに追加してください：

```env
# WebPush設定
VAPID_PUBLIC=your_generated_public_key
VAPID_PRIVATE=your_generated_private_key

# サポートメールアドレス
APP_SUPPORT_EMAIL=support@example.com
```

### 3. データベースのセットアップ

マイグレーションを実行してプッシュ通知用のテーブルを作成してください：

```bash
php artisan migrate
```

### 4. 使用方法

#### プッシュ通知のサブスクリプション保存
```bash
POST /api/push/subscription
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "p256dh": "public_key_here",
  "auth": "auth_token_here",
  "ua": "User-Agent"
}
```

#### 忘れ物チェック通知の送信
```bash
POST /api/push/send-forget-item
{
  "user_id": 1  # オプション：特定のユーザーに送信
}
```

#### カスタム通知の送信
```bash
POST /api/push/send-custom
{
  "title": "通知タイトル",
  "body": "通知内容",
  "user_id": 1,  # オプション
  "icon": "/icon.png",
  "badge": "/badge.png",
  "url": "/redirect-url"
}
```

### 5. フロントエンドとの連携

フロントエンドでは、`/src/lib/push-utils.ts`を使用してプッシュ通知の購読・購読解除を行ってください。

## セキュリティ

- VAPID_PRIVATEキーは機密情報です。公開しないでください。
- 本番環境では適切な認証・認可を実装してください。
