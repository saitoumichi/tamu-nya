# TAMU-NYA API Documentation

## 概要
TAMU-NYAは忘れ物防止とモンスター育成を組み合わせたアプリケーションです。このドキュメントでは、アプリケーションで使用できるAPIエンドポイントについて説明します。

## ベースURL
```
http://localhost:8000/api
```

## 認証
一部のAPIエンドポイントでは認証が必要です。認証されていない場合は401エラーが返されます。

## データベース設計

### 1. ユーザーDB
| 列名 | 型 | メモ |
|------|-----|------|
| id | bigint PK | ユーザーの一意なID |
| name | varchar | ユーザーの名前 |
| email | varchar | ユーザーのメールアドレス |
| password | varchar | ハッシュ化されたパスワード |
| email_verified_at | timestamp | メールアドレス確認日時（未確認の場合はNULL） |
| created_at | timestamp | アカウント作成日時 |
| updated_at | timestamp | アカウント更新日時 |

### 2. モンスターDB
| 列名 | 型 | メモ |
|------|-----|------|
| id | bigint PK | モンスターの一意なID |
| user_id | bigint FK users | モンスターの所有者（ユーザー） |
| name | varchar | モンスターの名前（表示名） |
| category | varchar | モンスターのカテゴリ（例: forget_things、forget_scheduleなど） |
| forgotten_item | varchar | 忘れ物アイテム名（例: 🔑 鍵） |
| difficulty | int | 困った度（1–5） |
| situation | json/array | 状況（例: ["morning", "in_a_hurry"]） |
| location | varchar | 忘れ物の場所（任意） |
| feed_count | int | 餌を与えた回数（レベルアップ基準） |
| level | int | モンスターのレベル（最大100） |
| updated_at | timestamp | 最終更新日時 |

### 3. 餌やり履歴DB
| 列名 | 型 | メモ |
|------|-----|------|
| id | bigint PK | 餌やり履歴の一意なID |
| monster_id | bigint FK monsters | どのモンスターに対しての餌か |
| user_id | bigint FK users | 餌を与えたユーザー |
| item_code | varchar | 餌のアイテムコード（例: basic_food） |
| applied_at | timestamp | 餌やり日時 |
| request_id | varchar | 冪等化用のリクエストID（同一リクエストの二重適用防止） |

## API エンドポイント一覧

### 1. 認証 API

#### 1.1 新規ユーザー登録
```
POST /api/auth/signup
```
**説明**: 新規ユーザーを作成します。

**リクエストボディ**:
```json
{
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "password": "password123"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "created_at": "2024-08-27T10:00:00.000000Z"
  },
  "message": "ユーザーを作成しました"
}
```

#### 1.2 ログイン
```
POST /api/auth/login
```
**説明**: ユーザーがログインします。

**リクエストボディ**:
```json
{
  "email": "tanaka@example.com",
  "password": "password123"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "message": "ログインしました"
}
```

### 2. ユーザー管理 API

#### 2.1 プロフィール取得
```
GET /api/users/profile
```
**説明**: 認証されたユーザーのプロフィール情報を取得します。

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "email_verified_at": "2024-08-27T10:00:00.000000Z",
    "created_at": "2024-08-27T10:00:00.000000Z",
    "updated_at": "2024-08-27T10:00:00.000000Z"
  },
  "message": "プロフィールを取得しました"
}
```

#### 2.2 ユーザーのモンスター一覧取得
```
GET /api/users/me/monsters
```
**説明**: 認証されたユーザーが所有するモンスター一覧を取得します。

**レスポンス例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "忘れ物モンスター",
      "category": "forget_things",
      "forgotten_item": "🔑 鍵",
      "difficulty": 3,
      "situation": ["morning", "in_a_hurry"],
      "location": "玄関",
      "feed_count": 15,
      "level": 3,
      "updated_at": "2024-08-27T10:00:00.000000Z"
    }
  ],
  "message": "モンスター一覧を取得しました"
}
```

### 3. モンスター管理 API

#### 3.1 モンスター作成
```
POST /api/monsters
```
**説明**: 新しいモンスター（忘れ物）を作成します。

**リクエストボディ**:
```json
{
  "name": "忘れ物モンスター",
  "category": "forget_things",
  "forgotten_item": "🔑 鍵",
  "difficulty": 3,
  "situation": ["morning", "in_a_hurry"],
  "location": "玄関"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "忘れ物モンスター",
    "category": "forget_things",
    "forgotten_item": "🔑 鍵",
    "difficulty": 3,
    "situation": ["morning", "in_a_hurry"],
    "location": "玄関",
    "feed_count": 0,
    "level": 1,
    "updated_at": "2024-08-27T10:00:00.000000Z"
  },
  "message": "モンスターを作成しました"
}
```

#### 3.2 モンスターに餌を与える
```
POST /api/monsters/{id}/feed
```
**説明**: 指定されたモンスターに餌を与えます。

**リクエストボディ**:
```json
{
  "item_code": "basic_food",
  "request_id": "req_12345"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "monster": {
      "id": 1,
      "feed_count": 16,
      "level": 3,
      "updated_at": "2024-08-27T11:00:00.000000Z"
    },
    "feeding_record": {
      "id": 1,
      "monster_id": 1,
      "user_id": 1,
      "item_code": "basic_food",
      "applied_at": "2024-08-27T11:00:00.000000Z"
    }
  },
  "message": "餌を与えました"
}
```

### 4. 忘れ物管理 API

#### 4.1 新しい忘れ物を登録
```
POST /api/forgotten-items
```
**説明**: 新しい忘れ物を登録します。

**リクエストボディ**:
```json
{
  "item_name": "🔑 鍵",
  "category": "forget_things",
  "difficulty": 3,
  "situation": ["morning", "in_a_hurry"],
  "location": "玄関"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "item_name": "🔑 鍵",
    "category": "forget_things",
    "difficulty": 3,
    "situation": ["morning", "in_a_hurry"],
    "location": "玄関",
    "created_at": "2024-08-27T10:00:00.000000Z"
  },
  "message": "忘れ物を登録しました"
}
```

#### 4.2 忘れ物統計情報取得
```
GET /api/forgotten-items/stats
```
**説明**: 忘れ物の統計情報を取得します。

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "total_forgotten_items": 12,
    "forgotten_items_this_month": 3,
    "most_common_category": "forget_things",
    "average_difficulty": 2.8,
    "most_common_situation": ["morning", "in_a_hurry"],
    "category_breakdown": {
      "forget_things": 8,
      "forget_schedule": 4
    }
  },
  "message": "統計情報を取得しました"
}
```

## エラーハンドリング

### HTTPステータスコード
- **200**: 成功
- **201**: 作成成功
- **400**: 不正なリクエスト
- **401**: 認証エラー
- **403**: 認可エラー
- **404**: リソースが見つからない
- **422**: バリデーションエラー
- **500**: サーバーエラー

### エラーレスポンス例
```json
{
  "success": false,
  "message": "エラーメッセージ",
  "errors": {
    "field_name": ["具体的なエラー内容"]
  }
}
```