# TAMU-NYA API ドキュメント

## 概要
TAMU-NYAは忘れ物防止とモンスター育成を組み合わせたアプリケーションです。このドキュメントでは、アプリケーションで使用できるAPIエンドポイントについて説明します。

## ベースURL
```
http://localhost:8000/api
```

## 認証
一部のAPIエンドポイントでは認証が必要です。認証されていない場合は401エラーが返されます。

## API エンドポイント一覧

### 1. ユーザー管理 API

#### 1.1 プロフィール取得
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

#### 1.2 プロフィール更新
```
PUT /api/users/profile
```
**説明**: ユーザーのプロフィール情報を更新します。

**リクエストボディ**:
```json
{
  "name": "田中太郎",
  "email": "newemail@example.com"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "田中太郎",
    "email": "newemail@example.com",
    "updated_at": "2024-08-27T10:30:00.000000Z"
  },
  "message": "プロフィールを更新しました"
}
```

#### 1.3 統計情報取得
```
GET /api/users/stats
```
**説明**: ユーザーの統計情報（モンスター数、忘れ物数など）を取得します。

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "total_monsters": 5,
    "total_forgotten_items": 12,
    "forgotten_items_this_month": 3,
    "monsters_level_avg": 3.2,
    "achievement_rate": 75.5
  },
  "message": "統計情報を取得しました"
}
```

#### 1.4 ユーザーのモンスター一覧取得
```
GET /api/users/{id}/monsters
```
**説明**: 指定されたユーザーIDのモンスター一覧を取得します。

**レスポンス例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "忘れ物モンスター",
      "type": "forget",
      "level": 3,
      "affection": 80,
      "evolved": false
    },
    {
      "id": 2,
      "name": "記憶モンスター",
      "type": "memory",
      "level": 2,
      "affection": 65,
      "evolved": false
    }
  ],
  "message": "モンスター一覧を取得しました"
}
```

#### 1.5 ユーザーの忘れ物一覧取得
```
GET /api/users/{id}/forgotten-items
```
**説明**: 指定されたユーザーIDの忘れ物一覧を取得します。

**レスポンス例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category": "forget_things",
      "title": "鍵を家に忘れた",
      "difficulty": 4,
      "created_at": "2024-08-27T08:00:00.000000Z"
    },
    {
      "id": 2,
      "category": "forget_schedule",
      "title": "会議の時間を忘れた",
      "difficulty": 3,
      "created_at": "2024-08-27T14:00:00.000000Z"
    }
  ],
  "message": "忘れ物一覧を取得しました"
}
```

### 2. 忘れ物管理 API

#### 2.1 忘れ物一覧取得
```
GET /api/forgotten-items
```
**説明**: 全ての忘れ物の一覧を取得します。

#### 2.2 忘れ物作成
```
POST /api/forgotten-items
```
**説明**: 新しい忘れ物を記録します。

**リクエストボディ**:
```json
{
  "category": "forget_things",
  "title": "鍵を家に忘れた",
  "forgotten_item": "鍵",
  "details": "朝急いでいた時に忘れた",
  "difficulty": 4,
  "situation": ["morning", "in_a_hurry"],
  "location": "家",
  "datetime": "2024-08-27T08:00:00"
}
```

#### 2.3 忘れ物詳細取得
```
GET /api/forgotten-items/{id}
```
**説明**: 指定されたIDの忘れ物の詳細情報を取得します。

#### 2.4 忘れ物更新
```
PUT /api/forgotten-items/{id}
```
**説明**: 指定されたIDの忘れ物情報を更新します。

#### 2.5 忘れ物削除
```
DELETE /api/forgotten-items/{id}
```
**説明**: 指定されたIDの忘れ物を削除します。

#### 2.6 ユーザー別忘れ物取得
```
GET /api/forgotten-items/user/{userId}
```
**説明**: 指定されたユーザーIDの忘れ物一覧を取得します。

#### 2.7 カテゴリ別忘れ物取得
```
GET /api/forgotten-items/category/{category}
```
**説明**: 指定されたカテゴリの忘れ物一覧を取得します。

### 3. モンスター管理 API

#### 3.1 モンスター一覧取得
```
GET /api/monsters
```
**説明**: 全てのモンスターの一覧を取得します。

#### 3.2 モンスター詳細取得
```
GET /api/monsters/{id}
```
**説明**: 指定されたIDのモンスターの詳細情報を取得します。

#### 3.3 モンスター作成
```
POST /api/monsters
```
**説明**: 新しいモンスターを作成します。

#### 3.4 モンスター更新
```
PUT /api/monsters/{id}
```
**説明**: 指定されたIDのモンスター情報を更新します。

#### 3.5 モンスター削除
```
DELETE /api/monsters/{id}
```
**説明**: 指定されたIDのモンスターを削除します。

#### 3.6 モンスターレベルアップ
```
POST /api/monsters/{id}/level-up
```
**説明**: 指定されたIDのモンスターのレベルを上げます。

#### 3.7 モンスター好感度アップ
```
POST /api/monsters/{id}/affection-up
```
**説明**: 指定されたIDのモンスターの好感度を上げます。

#### 3.8 モンスター進化
```
POST /api/monsters/{id}/evolve
```
**説明**: 指定されたIDのモンスターを進化させます。

### 4. プッシュ通知 API

#### 4.1 通知購読
```
POST /api/push/subscription
```
**説明**: プッシュ通知の購読を登録します。

#### 4.2 通知購読解除
```
DELETE /api/push/subscription
```
**説明**: プッシュ通知の購読を解除します。

#### 4.3 忘れ物チェック通知送信
```
POST /api/push/send-forget-item
```
**説明**: 忘れ物チェックのプッシュ通知を送信します。

#### 4.4 カスタム通知送信
```
POST /api/push/send-custom
```
**説明**: カスタムのプッシュ通知を送信します。

### 5. 統計・分析 API

#### 5.1 忘れ物サマリー
```
GET /api/analytics/forgotten-items/summary
```
**説明**: 忘れ物の統計サマリーを取得します。

#### 5.2 忘れ物トレンド
```
GET /api/analytics/forgotten-items/trends
```
**説明**: 忘れ物のトレンド分析を取得します。

#### 5.3 モンスター成長分析
```
GET /api/analytics/monsters/growth
```
**説明**: モンスターの成長分析を取得します。

#### 5.4 ユーザープログレス
```
GET /api/analytics/user/{userId}/progress
```
**説明**: 指定されたユーザーの進捗状況を取得します。

## エラーレスポンス

### 認証エラー (401)
```json
{
  "success": false,
  "message": "認証が必要です"
}
```

### バリデーションエラー (422)
```json
{
  "success": false,
  "message": "バリデーションエラー",
  "errors": {
    "field_name": ["エラーメッセージ"]
  }
}
```

### サーバーエラー (500)
```json
{
  "success": false,
  "message": "サーバーエラーが発生しました"
}
```

## 使用例

### cURL での使用例

#### プロフィール取得
```bash
curl -X GET "http://localhost:8000/api/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 忘れ物作成
```bash
curl -X POST "http://localhost:8000/api/forgotten-items" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "forget_things",
    "title": "鍵を家に忘れた",
    "forgotten_item": "鍵",
    "difficulty": 4,
    "datetime": "2024-08-27T08:00:00"
  }'
```

### JavaScript (Fetch API) での使用例

#### プロフィール取得
```javascript
const response = await fetch('/api/users/profile', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const data = await response.json();
console.log(data);
```

#### 忘れ物作成
```javascript
const response = await fetch('/api/forgotten-items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    category: 'forget_things',
    title: '鍵を家に忘れた',
    forgotten_item: '鍵',
    difficulty: 4,
    datetime: '2024-08-27T08:00:00'
  })
});

const data = await response.json();
console.log(data);
```

## 注意事項

1. **認証**: 一部のAPIエンドポイントでは認証が必要です
2. **レート制限**: APIの使用頻度に制限がある場合があります
3. **データ形式**: 日時はISO 8601形式（YYYY-MM-DDTHH:mm:ss）で送信してください
4. **エラーハンドリング**: 適切なエラーハンドリングを実装してください

## サポート

APIに関する質問や問題がある場合は、開発チームまでお問い合わせください。
