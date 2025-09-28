#!/bin/bash

# Скрипт обновления Troyka Frontend на сервере
# Использование: ./update-server.sh

set -e

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

# Конфигурация
APP_DIR="/opt/troyka-front"
SERVICE_NAME="troyka-frontend"

log "🔄 Обновляем Troyka Frontend..."

cd $APP_DIR

# Получение последних изменений
log "📥 Получаем последние изменения из Git..."
git fetch origin
git pull origin main

# Установка зависимостей
log "📦 Обновляем зависимости..."
npm ci --production

# Сборка приложения
log "🏗️ Пересобираем приложение..."
npm run build

# Перезапуск приложения
log "🔄 Перезапускаем приложение..."
pm2 restart $SERVICE_NAME

success "🎉 Обновление завершено!"
success "Приложение перезапущено и готово к работе"

# Показать статус
pm2 status
