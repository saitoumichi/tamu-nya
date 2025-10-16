-- Supabase用のテーブル作成スクリプト

-- usersテーブル
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- password_reset_tokensテーブル
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL
);

-- sessionsテーブル
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

-- fairiesテーブル（モンスター）
CREATE TABLE IF NOT EXISTS fairies (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    forgotten_item VARCHAR(255) NOT NULL,
    difficulty INTEGER NOT NULL,
    situation JSONB NOT NULL,
    location VARCHAR(255) NULL,
    feed_count INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- feed_logsテーブル（餌やり履歴）
CREATE TABLE IF NOT EXISTS feed_logs (
    id BIGSERIAL PRIMARY KEY,
    monster_id BIGINT NOT NULL REFERENCES fairies(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_code VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP NOT NULL,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- forgotten_itemsテーブル（忘れ物記録）
CREATE TABLE IF NOT EXISTS forgotten_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    forgotten_item VARCHAR(255) NOT NULL,
    details TEXT NULL,
    category VARCHAR(255) NOT NULL,
    difficulty INTEGER NULL,
    situation JSONB NULL,
    location VARCHAR(255) NULL,
    datetime TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- custom_cardsテーブル（カスタムカード）
CREATE TABLE IF NOT EXISTS custom_cards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('category', 'thing', 'situation')),
    name VARCHAR(255) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    card_id VARCHAR(255) NOT NULL,
    category_id VARCHAR(255) NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- personal_access_tokensテーブル（Laravel Sanctum）
CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_fairies_user_id ON fairies(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_logs_monster_id ON feed_logs(monster_id);
CREATE INDEX IF NOT EXISTS idx_feed_logs_user_id ON feed_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_forgotten_items_user_id ON forgotten_items(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_cards_user_id ON custom_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_access_tokens_tokenable ON personal_access_tokens(tokenable_type, tokenable_id);

-- テストユーザーを作成
INSERT INTO users (name, email, password, created_at, updated_at) 
VALUES ('テストユーザー', 'test@example.com', '$2y$12$1d6ViBF2BKKT8QpvIFTSa.aA9s8OxaerUO8tgeUv.hjsEyyvXvYrG', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
