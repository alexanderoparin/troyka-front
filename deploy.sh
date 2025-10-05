#!/bin/bash

# Простой скрипт деплоя фронтенда Troyka
# Использование: ./deploy.sh

set -e

# Цвета для вывода
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m"

log() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +%H:%M:%S)] ✅${NC} $1"
}

error() {
    echo -e "${RED}[$(date +%H:%M:%S)] ❌${NC} $1"
}

log "🚀 Начинаем обновление Troyka Frontend"

# Переходим в директорию проекта
cd /opt/troyka-front

# Проверяем статус git
log "�� Проверяем статус git..."
if [ -n "$(git status --porcelain)" ]; then
    error "Есть несохраненные изменения в git. Сначала закоммитьте их."
    exit 1
fi

# Получаем последние изменения
log "📥 Получаем последние изменения из git..."
git fetch origin
git pull origin main

success "Код обновлен из git"

# Устанавливаем зависимости
log "📦 Устанавливаем зависимости..."
npm ci

success "Зависимости установлены"

# Собираем проект
log "🏗️ Собираем проект..."
npm run build

success "Проект собран успешно"

# Перезапускаем фронтенд через PM2
log "🔄 Перезапускаем фронтенд..."
pm2 restart troyka-frontend

success "Фронтенд перезапущен"

# Проверяем статус
log "📊 Проверяем статус сервисов..."
pm2 status

success "🎉 Обновление завершено успешно!"
