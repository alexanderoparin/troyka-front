#!/bin/bash

# Скрипт деплоя Troyka Frontend на Ubuntu сервер
# Использование: ./deploy-server.sh

set -e  # Остановить выполнение при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода сообщений
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Конфигурация
REPO_URL="https://github.com/alexanderoparin/troyka-front.git"
APP_DIR="/opt/troyka-front"
SERVICE_NAME="troyka-frontend"
NGINX_SITE="troyka-frontend"
PORT=3000

log "🚀 Начинаем деплой Troyka Frontend на Ubuntu сервер"

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    error "Запустите скрипт с правами root: sudo ./deploy-server.sh"
    exit 1
fi

# Обновление системы
log "📦 Обновляем систему..."
apt update && apt upgrade -y

# Установка Node.js 18
log "🔧 Устанавливаем Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node -v)
success "Node.js установлен: $NODE_VERSION"

# Установка Nginx
log "🌐 Устанавливаем Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
fi

success "Nginx установлен и запущен"

# Установка PM2 для управления процессами
log "⚙️ Устанавливаем PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

success "PM2 установлен"

# Создание директории приложения
log "📁 Создаем директорию приложения: $APP_DIR"
mkdir -p $APP_DIR
cd $APP_DIR

# Клонирование или обновление репозитория
if [ -d ".git" ]; then
    log "📥 Обновляем код из репозитория..."
    git fetch origin
    git reset --hard origin/main
    git pull origin main
else
    log "📥 Клонируем репозиторий..."
    git clone $REPO_URL .
fi

success "Код обновлен из репозитория"

# Установка зависимостей
log "📦 Устанавливаем зависимости..."
npm ci --production

success "Зависимости установлены"

# Сборка приложения
log "🏗️ Собираем приложение..."
npm run build

success "Приложение собрано"

# Создание файла переменных окружения
log "🔧 Настраиваем переменные окружения..."
cat > .env.local << EOF
NEXT_PUBLIC_JAVA_API_URL=http://213.171.4.47:8080
NEXT_PUBLIC_JAVA_API_TIMEOUT=30000
NODE_ENV=production
PORT=$PORT
EOF

success "Переменные окружения настроены"

# Создание PM2 конфигурации
log "⚙️ Настраиваем PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    }
  }]
}
EOF

# Запуск приложения через PM2
log "🚀 Запускаем приложение..."
pm2 delete $SERVICE_NAME 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

success "Приложение запущено через PM2"

# Настройка Nginx
log "🌐 Настраиваем Nginx..."
cat > /etc/nginx/sites-available/$NGINX_SITE << EOF
server {
    listen 80;
    server_name 213.171.4.47;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:$PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Активация сайта
ln -sf /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации Nginx
nginx -t

# Перезапуск Nginx
systemctl reload nginx

success "Nginx настроен и перезапущен"

# Настройка файрвола
log "🔥 Настраиваем файрвол..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

success "Файрвол настроен"

# Проверка статуса
log "📊 Проверяем статус сервисов..."
echo "=== PM2 Status ==="
pm2 status

echo "=== Nginx Status ==="
systemctl status nginx --no-pager -l

echo "=== Port Status ==="
netstat -tlnp | grep :$PORT || echo "Порт $PORT не слушается"

# Информация о деплое
log "📋 Информация о деплое:"
echo "  - Приложение: $SERVICE_NAME"
echo "  - Директория: $APP_DIR"
echo "  - Порт: $PORT"
echo "  - URL: http://213.171.4.47"
echo "  - PM2: pm2 status"
echo "  - Логи: pm2 logs $SERVICE_NAME"
echo "  - Перезапуск: pm2 restart $SERVICE_NAME"

success "🎉 Деплой завершен успешно!"
success "Сайт доступен по адресу: http://213.171.4.47"

# Полезные команды
echo ""
log "📚 Полезные команды:"
echo "  pm2 status                    - Статус приложения"
echo "  pm2 logs $SERVICE_NAME        - Логи приложения"
echo "  pm2 restart $SERVICE_NAME     - Перезапуск приложения"
echo "  pm2 stop $SERVICE_NAME        - Остановка приложения"
echo "  systemctl status nginx        - Статус Nginx"
echo "  nginx -t                      - Проверка конфигурации Nginx"
echo "  systemctl reload nginx        - Перезагрузка Nginx"
