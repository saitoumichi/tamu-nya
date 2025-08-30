# 忘れ物図鑑アプリ (tamu-nya)

忘れ物を記録してモンスターを育てる楽しいアプリです。忘れ物の傾向を分析し、改善に繋げることができます。

## 📋 目次

- [システム構成](#システム構成)
- [必要な環境](#必要な環境)  
- [初回セットアップ](#初回セットアップ)
- [開発環境の起動](#開発環境の起動)
- [アプリの使用方法](#アプリの使用方法)
- [トラブルシューティング](#トラブルシューティング)

## 🏗️ システム構成

- **フロントエンド**: Next.js 14 (TypeScript, Tailwind CSS)
- **バックエンド**: Laravel 11 (PHP 8.3)
- **データベース**: MySQL 8.0
- **管理ツール**: phpMyAdmin
- **コンテナ化**: Docker & Docker Compose

## 💻 必要な環境

- Docker Desktop (最新版推奨)
- Git

## 🚀 初回セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd tamu-nya
```

### 2. Dockerコンテナのビルドと起動

**重要**: 初回は全てのサービスをビルドする必要があります。

```bash
# 全サービスをビルドして起動（初回実行時）
docker-compose up --build -d
```

このコマンドで以下の4つのサービスが起動します：
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000  
- **phpMyAdmin**: http://localhost:8080
- **MySQL**: localhost:3306

### 3. データベースのセットアップ

#### 3-1. コンテナが正常に起動していることを確認

```bash
# 全コンテナの状態を確認
docker ps
```

以下のような出力が表示されれば正常です：
```
CONTAINER ID   IMAGE                   PORTS                    NAMES
bcb2c67865cc   tamu-nya-frontend       0.0.0.0:3000->3000/tcp   tamu-nya-frontend-1
035887a9dbf1   tamu-nya-backend        0.0.0.0:8000->80/tcp     tamu-nya-backend-1
f93038cdc941   phpmyadmin/phpmyadmin   0.0.0.0:8080->80/tcp     tamu-nya-phpmyadmin-1
e9cb939ec162   mysql:8.0               0.0.0.0:3306->3306/tcp   tamu-nya-mysql-1
```

#### 3-2. データベースのマイグレーション実行

```bash
# Laravelのマイグレーションを実行
docker exec tamu-nya-backend-1 php artisan migrate
```

#### 3-3. データベース接続の確認

```bash
# データベースのテーブルが作成されたか確認
docker exec tamu-nya-mysql-1 mysql -u root -ppassword -D forgottenapp -e "SHOW TABLES;"
```

以下のようなテーブルが表示されれば成功です：
```
Tables_in_forgottenapp
cache
cache_locks
custom_cards
failed_jobs
forgotten_items
job_batches
jobs
migrations
password_reset_tokens
sessions
users
```

### 4. アプリケーションの動作確認

#### 4-1. フロントエンド確認
ブラウザで http://localhost:3000 にアクセスし、「忘れ物図鑑」のページが表示されることを確認

#### 4-2. バックエンドAPI確認
```bash
# APIの動作確認
curl http://localhost:8000/api/forgotten-items
```

正常なレスポンスが返ってくれば成功です。

#### 4-3. phpMyAdmin確認  
ブラウザで http://localhost:8080 にアクセスし、以下の情報でログイン：
- **サーバ**: tamu-nya-mysql-1
- **ユーザ名**: root
- **パスワード**: password

## 🔄 開発環境の起動

初回セットアップ後は、以下のコマンドで簡単に起動できます：

```bash
# 開発環境の起動
docker-compose up -d

# 停止
docker-compose down

# コンテナの状態確認
docker ps
```

## 📱 アプリの使用方法

### 1. ユーザー登録・ログイン
- http://localhost:3000/register でアカウント作成
- http://localhost:3000/login でログイン

### 2. 忘れ物の記録
- http://localhost:3000/input で忘れ物を記録
- カテゴリ、忘れ物の種類、困った度、状況を選択

### 3. 分析画面
- http://localhost:3000/analysis で忘れ物の傾向を分析
- 期間別、カテゴリ別の統計を確認

### 4. 図鑑機能
- http://localhost:3000/encyclopedia で記録した忘れ物のモンスターを確認

### 5. カスタムカード作成
- http://localhost:3000/create で独自のカテゴリ・忘れ物・状況カードを作成

## 🔧 トラブルシューティング

### コンテナが起動しない場合

```bash
# 全コンテナを停止
docker-compose down

# 不要なイメージやコンテナを削除
docker system prune -f

# 再度ビルドして起動
docker-compose up --build -d
```

### データベース接続エラーの場合

```bash
# MySQLコンテナのログを確認
docker logs tamu-nya-mysql-1

# バックエンドコンテナのログを確認  
docker logs tamu-nya-backend-1

# データベースが完全に起動するまで待機（30秒程度）
sleep 30

# マイグレーション再実行
docker exec tamu-nya-backend-1 php artisan migrate
```

### フロントエンドが表示されない場合

```bash
# フロントエンドコンテナのログを確認
docker logs tamu-nya-frontend-1

# 必要に応じてコンテナを再起動
docker restart tamu-nya-frontend-1
```

### ポートが使用済みの場合

以下のポートが使用されています。他のアプリケーションで使用中の場合は停止してください：
- 3000: フロントエンド
- 8000: バックエンド  
- 8080: phpMyAdmin
- 3306: MySQL

### 完全なリセット

```bash
# 全コンテナとボリュームを削除（データベースの内容も削除されます）
docker-compose down -v

# イメージも削除
docker-compose down --rmi all -v

# 再セットアップ
docker-compose up --build -d
sleep 30
docker exec tamu-nya-backend-1 php artisan migrate
```

## 📝 開発時のコマンド一覧

```bash
# PHP関連コマンド（バックエンドコンテナ内で実行）
docker exec tamu-nya-backend-1 php artisan migrate        # マイグレーション
docker exec tamu-nya-backend-1 php artisan migrate:fresh  # マイグレーション初期化
docker exec tamu-nya-backend-1 php artisan tinker        # Tinker起動
docker exec tamu-nya-backend-1 php -m                    # PHPモジュール確認

# MySQL関連コマンド
docker exec tamu-nya-mysql-1 mysql -u root -ppassword -D forgottenapp -e "SHOW TABLES;"
docker exec tamu-nya-mysql-1 mysql -u root -ppassword -D forgottenapp -e "SELECT * FROM forgotten_items LIMIT 5;"

# コンテナ内のシェルに入る
docker exec -it tamu-nya-backend-1 /bin/bash    # バックエンド
docker exec -it tamu-nya-frontend-1 /bin/bash   # フロントエンド
docker exec -it tamu-nya-mysql-1 /bin/bash      # MySQL
```

## 🌐 アクセスURL

- **アプリメイン画面**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000  
- **phpMyAdmin**: http://localhost:8080
- **新規登録**: http://localhost:3000/register
- **ログイン**: http://localhost:3000/login
- **忘れ物入力**: http://localhost:3000/input
- **分析画面**: http://localhost:3000/analysis
- **図鑑**: http://localhost:3000/encyclopedia
- **カスタムカード作成**: http://localhost:3000/create

---

## 🎯 初回セットアップのまとめ

1. `git clone` でプロジェクトをクローン
2. `docker-compose up --build -d` でコンテナをビルド・起動
3. `docker exec tamu-nya-backend-1 php artisan migrate` でDB初期化
4. http://localhost:3000 でアプリ動作確認

この4ステップで開発環境が完成します！