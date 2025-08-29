# PHP 8.2を使用
FROM php:8.2-fpm

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx \
    supervisor

# PHP拡張をインストール
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Composerをインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 作業ディレクトリを設定
WORKDIR /var/www

# アプリケーションファイルをコピー
COPY . /var/www

# 依存関係をインストール
RUN composer install --no-dev --optimize-autoloader

# 権限を設定
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# 環境変数ファイルをコピー
COPY .env.example .env

# アプリケーションキーを生成
RUN php artisan key:generate

# 設定ファイルをコピー
COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# ポート80を公開
EXPOSE 80

# Supervisorでサービスを起動
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
