#!/bin/bash

# ==================================================
# DEPLOY SCRIPT FOR NEXT.JS FRONTEND APPLICATION
# Author: Your Name
# Description: Auto-deploy script for troyka-front project
# ==================================================

# Цвета для красивого вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Функция для успешного сообщения
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Функция для предупреждения
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Функция для ошибок
error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# ==================================================
# НАСТРОЙКИ СКРИПТА
# ==================================================
PROJECT_DIR="/opt/troyka-front"
SERVICE_NAME="troyka-frontend"
BRANCH="main"
PORT="3000"
NGINX_SITE="troyka-front"

# ==================================================
# ОСНОВНАЯ ЛОГИКА
# ==================================================

log "🚀 Начинаем деплой фронтенда..."
log "Директория проекта: $PROJECT_DIR"
log "Ветка: $BRANCH"
log "Порт: $PORT"

# Проверяем существует ли директория проекта
if [ ! -d "$PROJECT_DIR" ]; then
    error "Project directory $PROJECT_DIR does not exist!"
fi

cd "$PROJECT_DIR" || error "Cannot enter project directory!"

# Проверяем git
if ! command -v git &> /dev/null; then
    error "Git is not installed!"
fi

# Получаем последние изменения из Git
log "Получаем последние изменения из ветки $BRANCH..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Проверяем успешность pull
if [ $? -ne 0 ]; then
    error "Git pull failed!"
fi

success "Код успешно обновлен"

# Проверяем Node.js
if ! command -v node &> /dev/null; then
    error "Node.js is not installed!"
fi

if ! command -v npm &> /dev/null; then
    error "npm is not installed!"
fi

# Устанавливаем зависимости
log "Устанавливаем зависимости..."
npm ci

# Проверяем успешность установки
if [ $? -ne 0 ]; then
    error "npm install failed!"
fi

success "Зависимости успешно установлены"

# Собираем проект
log "Собираем Next.js приложение..."
npm run build

# Проверяем успешность сборки
if [ $? -ne 0 ]; then
    error "Build failed!"
fi

success "Приложение успешно собрано"

# Останавливаем PM2 процесс
log "Останавливаем PM2 процесс $SERVICE_NAME..."
pm2 stop $SERVICE_NAME 2>/dev/null || warning "Process $SERVICE_NAME was not running"

# Даем время для остановки
sleep 3

# Запускаем приложение через PM2
log "Запускаем приложение через PM2..."
pm2 start ecosystem.config.js
pm2 save

# Даем время для запуска
sleep 10

# Проверяем статус PM2 процесса
log "Проверяем статус PM2 процесса..."
if pm2 list | grep -q "$SERVICE_NAME.*online"; then
    success "Приложение успешно запущено!"
else
    error "PM2 process failed to start!"
    echo "Showing PM2 logs:"
    pm2 logs $SERVICE_NAME --lines 20
fi

# Проверяем что приложение отвечает на порту
log "Проверяем доступность приложения на порту $PORT..."
if curl -s http://localhost:$PORT > /dev/null; then
    success "Приложение отвечает на localhost:$PORT"
else
    warning "Приложение не отвечает на localhost:$PORT"
fi

# Перезагружаем Nginx
log "Перезагружаем Nginx..."
systemctl reload nginx

# Проверяем статус Nginx
if systemctl is-active --quiet nginx; then
    success "Nginx успешно перезагружен"
else
    warning "Nginx не запущен, запускаем..."
    systemctl start nginx
fi

# Показываем статус PM2
log "Статус PM2 процессов:"
pm2 list

# Показываем последние логи
log "Показываем последние логи..."
pm2 logs $SERVICE_NAME --lines 10

success "🎉 Деплой фронтенда успешно завершён!"
log "Frontend is running on: http://213.171.4.47"
log "Backend API: http://213.171.4.47:8080"

# ==================================================
# ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
# ==================================================

# Функция для отката (можно добавить позже)
rollback() {
    log "Starting rollback..."
    # Логика отката
}

# Функция для бэкапа
backup() {
    log "Creating backup..."
    TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
    BACKUP_DIR="/opt/backups/troyka-front_$TIMESTAMP"
    mkdir -p "$BACKUP_DIR"
    cp -r .next "$BACKUP_DIR/" 2>/dev/null || true
    cp package*.json "$BACKUP_DIR/" 2>/dev/null || true
    success "Backup created: $BACKUP_DIR"
}

# Вызываем бэкап перед деплоем (раскомментируйте если нужно)
# backup
