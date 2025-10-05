#!/bin/bash

# Скрипт деплоя фронтенда Troyka
# Использование: ./deploy.sh [environment]
# environment: dev, staging, production (по умолчанию: production)

set -e  # Остановить выполнение при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
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

# Проверка аргументов
ENVIRONMENT=${1:-production}

log "🚀 Начинаем деплой Troyka Frontend в окружение: $ENVIRONMENT"

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    error "Node.js не установлен. Установите Node.js 18+ и попробуйте снова."
    exit 1
fi

# Проверка версии Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Требуется Node.js версии 18 или выше. Текущая версия: $(node -v)"
    exit 1
fi

success "Node.js версия: $(node -v)"

# Проверка наличия npm
if ! command -v npm &> /dev/null; then
    error "npm не установлен"
    exit 1
fi

# Проверка наличия git
if ! command -v git &> /dev/null; then
    error "git не установлен"
    exit 1
fi

# Проверка статуса git
if [ -n "$(git status --porcelain)" ]; then
    warning "Есть несохраненные изменения в git. Рекомендуется закоммитить их перед деплоем."
    read -p "Продолжить деплой? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Деплой отменен"
        exit 0
    fi
fi

# Получение последних изменений из git
log "📥 Получаем последние изменения из git..."
git fetch origin
git pull origin main

success "Код обновлен из git"

# Установка зависимостей
log "📦 Устанавливаем зависимости..."
npm ci --production=false

success "Зависимости установлены"

# Проверка типов TypeScript
log "🔍 Проверяем типы TypeScript..."
npm run type-check

success "Проверка типов прошла успешно"

# Линтинг
log "🔍 Запускаем линтер..."
npm run lint

success "Линтинг прошел успешно"

# Сборка проекта
log "🏗️ Собираем проект..."
npm run build

success "Проект собран успешно"

# Проверка переменных окружения
log "🔧 Проверяем переменные окружения..."

if [ ! -f ".env.local" ]; then
    warning "Файл .env.local не найден. Создайте его с необходимыми переменными."
    echo "Пример содержимого .env.local:"
    echo "NEXT_PUBLIC_JAVA_API_URL=http://your-backend-url"
    echo "NEXT_PUBLIC_JAVA_API_TIMEOUT=30000"
fi

# Создание директории для деплоя
DEPLOY_DIR="deploy"
log "📁 Создаем директорию для деплоя: $DEPLOY_DIR"

if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR"
fi

mkdir -p "$DEPLOY_DIR"

# Копирование файлов для продакшена
log "📋 Копируем файлы для продакшена..."

# Копируем собранное приложение
cp -r .next "$DEPLOY_DIR/"
cp -r public "$DEPLOY_DIR/"
cp -r out "$DEPLOY_DIR/" 2>/dev/null || true

# Копируем необходимые файлы
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/" 2>/dev/null || true
cp next.config.js "$DEPLOY_DIR/"
cp tsconfig.json "$DEPLOY_DIR/"
cp tailwind.config.js "$DEPLOY_DIR/"
cp postcss.config.js "$DEPLOY_DIR/"

# Копируем переменные окружения
if [ -f ".env.local" ]; then
    cp .env.local "$DEPLOY_DIR/"
    success "Переменные окружения скопированы"
else
    warning "Файл .env.local не найден"
fi

# Создание скрипта запуска
cat > "$DEPLOY_DIR/start.sh" << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=${PORT:-3000}

echo "🚀 Запускаем Troyka Frontend на порту $PORT"
exec npm start
EOF

chmod +x "$DEPLOY_DIR/start.sh"

# Создание README для деплоя
cat > "$DEPLOY_DIR/README.md" << EOF
# Troyka Frontend

## Запуск

\`\`\`bash
# Установка зависимостей
npm ci --production

# Запуск приложения
./start.sh
\`\`\`

## Переменные окружения

- \`NEXT_PUBLIC_JAVA_API_URL\` - URL бэкенда
- \`NEXT_PUBLIC_JAVA_API_TIMEOUT\` - Таймаут API запросов
- \`PORT\` - Порт для запуска (по умолчанию 3000)

## Структура

- \`.next/\` - Собранное Next.js приложение
- \`public/\` - Статические файлы
- \`package.json\` - Зависимости
- \`start.sh\` - Скрипт запуска
EOF

success "Файлы для деплоя подготовлены в директории: $DEPLOY_DIR"

# Создание архива для деплоя
ARCHIVE_NAME="troyka-front-$(date +%Y%m%d-%H%M%S).tar.gz"
log "📦 Создаем архив: $ARCHIVE_NAME"

tar -czf "$ARCHIVE_NAME" -C "$DEPLOY_DIR" .

success "Архив создан: $ARCHIVE_NAME"

# Информация о деплое
log "📊 Информация о деплое:"
echo "  - Окружение: $ENVIRONMENT"
echo "  - Архив: $ARCHIVE_NAME"
echo "  - Размер архива: $(du -h "$ARCHIVE_NAME" | cut -f1)"
echo "  - Директория деплоя: $DEPLOY_DIR"

# Инструкции для сервера
echo
log "📋 Инструкции для деплоя на сервере:"
echo "1. Скопируйте архив $ARCHIVE_NAME на сервер"
echo "2. Распакуйте архив: tar -xzf $ARCHIVE_NAME"
echo "3. Установите зависимости: npm ci --production"
echo "4. Запустите приложение: ./start.sh"
echo
echo "Или используйте Docker:"
echo "1. Создайте Dockerfile в директории с распакованными файлами"
echo "2. Соберите образ: docker build -t troyka-front ."
echo "3. Запустите контейнер: docker run -p 3000:3000 troyka-front"

# Очистка временных файлов
log "🧹 Очищаем временные файлы..."
rm -rf "$DEPLOY_DIR"

success "🎉 Деплой подготовлен успешно!"
success "Архив готов для загрузки на сервер: $ARCHIVE_NAME"
