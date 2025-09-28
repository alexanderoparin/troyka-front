# Скрипт деплоя фронтенда Troyka для Windows PowerShell
# Использование: .\deploy.ps1 [environment]
# environment: dev, staging, production (по умолчанию: production)

param(
    [string]$Environment = "production"
)

# Устанавливаем политику выполнения для текущего процесса
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Функции для вывода сообщений
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ⚠️ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ❌ $Message" -ForegroundColor Red
}

# Проверка на ошибки
$ErrorActionPreference = "Stop"

Write-Log "🚀 Начинаем деплой Troyka Frontend в окружение: $Environment"

# Проверка наличия Node.js
try {
    $nodeVersion = node -v
    Write-Success "Node.js версия: $nodeVersion"
} catch {
    Write-Error "Node.js не установлен. Установите Node.js 18+ и попробуйте снова."
    exit 1
}

# Проверка версии Node.js
$nodeVersionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($nodeVersionNumber -lt 18) {
    Write-Error "Требуется Node.js версии 18 или выше. Текущая версия: $nodeVersion"
    exit 1
}

# Проверка наличия npm
try {
    $npmVersion = npm -v
    Write-Success "npm версия: $npmVersion"
} catch {
    Write-Error "npm не установлен"
    exit 1
}

# Проверка наличия git
try {
    $gitVersion = git --version
    Write-Success "Git версия: $gitVersion"
} catch {
    Write-Error "git не установлен"
    exit 1
}

# Проверка статуса git
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Warning "Есть несохраненные изменения в git. Рекомендуется закоммитить их перед деплоем."
    $continue = Read-Host "Продолжить деплой? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Log "Деплой отменен"
        exit 0
    }
}

# Получение последних изменений из git
Write-Log "📥 Получаем последние изменения из git..."
git fetch origin
git pull origin main

Write-Success "Код обновлен из git"

# Установка зависимостей
Write-Log "📦 Устанавливаем зависимости..."
npm ci --production=false

Write-Success "Зависимости установлены"

# Проверка типов TypeScript
Write-Log "🔍 Проверяем типы TypeScript..."
npm run type-check

Write-Success "Проверка типов прошла успешно"

# Линтинг
Write-Log "🔍 Запускаем линтер..."
npm run lint

Write-Success "Линтинг прошел успешно"

# Сборка проекта
Write-Log "🏗️ Собираем проект..."
npm run build

Write-Success "Проект собран успешно"

# Проверка переменных окружения
Write-Log "🔧 Проверяем переменные окружения..."

if (-not (Test-Path ".env.local")) {
    Write-Warning "Файл .env.local не найден. Создайте его с необходимыми переменными."
    Write-Host "Пример содержимого .env.local:"
    Write-Host "NEXT_PUBLIC_JAVA_API_URL=http://your-backend-url"
    Write-Host "NEXT_PUBLIC_JAVA_API_TIMEOUT=30000"
}

# Создание директории для деплоя
$DeployDir = "deploy"
Write-Log "📁 Создаем директорию для деплоя: $DeployDir"

if (Test-Path $DeployDir) {
    Remove-Item -Recurse -Force $DeployDir
}

New-Item -ItemType Directory -Path $DeployDir | Out-Null

# Копирование файлов для продакшена
Write-Log "📋 Копируем файлы для продакшена..."

# Копируем собранное приложение
Copy-Item -Recurse -Force ".next" "$DeployDir\"
Copy-Item -Recurse -Force "public" "$DeployDir\"
if (Test-Path "out") {
    Copy-Item -Recurse -Force "out" "$DeployDir\"
}

# Копируем необходимые файлы
Copy-Item "package.json" "$DeployDir\"
if (Test-Path "package-lock.json") {
    Copy-Item "package-lock.json" "$DeployDir\"
}
Copy-Item "next.config.js" "$DeployDir\"
Copy-Item "tsconfig.json" "$DeployDir\"
Copy-Item "tailwind.config.ts" "$DeployDir\"
Copy-Item "postcss.config.js" "$DeployDir\"

# Копируем переменные окружения
if (Test-Path ".env.local") {
    Copy-Item ".env.local" "$DeployDir\"
    Write-Success "Переменные окружения скопированы"
} else {
    Write-Warning "Файл .env.local не найден"
}

# Создание скрипта запуска
$StartScript = @"
@echo off
set NODE_ENV=production
set PORT=%PORT%
if "%PORT%"=="" set PORT=3000

echo 🚀 Запускаем Troyka Frontend на порту %PORT%
npm start
"@

$StartScript | Out-File -FilePath "$DeployDir\start.bat" -Encoding ASCII

# Создание README для деплоя
$ReadmeContent = @"
# Troyka Frontend

## Запуск

``````bash
# Установка зависимостей
npm ci --production

# Запуск приложения
start.bat
``````

## Переменные окружения

- `NEXT_PUBLIC_JAVA_API_URL` - URL бэкенда
- `NEXT_PUBLIC_JAVA_API_TIMEOUT` - Таймаут API запросов
- `PORT` - Порт для запуска (по умолчанию 3000)

## Структура

- `.next\` - Собранное Next.js приложение
- `public\` - Статические файлы
- `package.json` - Зависимости
- `start.bat` - Скрипт запуска
"@

$ReadmeContent | Out-File -FilePath "$DeployDir\README.md" -Encoding UTF8

Write-Success "Файлы для деплоя подготовлены в директории: $DeployDir"

# Создание архива для деплоя
$ArchiveName = "troyka-front-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Write-Log "📦 Создаем архив: $ArchiveName"

# Создаем ZIP архив
Compress-Archive -Path "$DeployDir\*" -DestinationPath $ArchiveName -Force

Write-Success "Архив создан: $ArchiveName"

# Информация о деплое
Write-Log "📊 Информация о деплое:"
Write-Host "  - Окружение: $Environment"
Write-Host "  - Архив: $ArchiveName"
$archiveSize = (Get-Item $ArchiveName).Length / 1MB
Write-Host "  - Размер архива: $([math]::Round($archiveSize, 2)) MB"
Write-Host "  - Директория деплоя: $DeployDir"

# Инструкции для сервера
Write-Host ""
Write-Log "📋 Инструкции для деплоя на сервере:"
Write-Host "1. Скопируйте архив $ArchiveName на сервер"
Write-Host "2. Распакуйте архив: Expand-Archive -Path $ArchiveName -DestinationPath ."
Write-Host "3. Установите зависимости: npm ci --production"
Write-Host "4. Запустите приложение: .\start.bat"
Write-Host ""
Write-Host "Или используйте Docker:"
Write-Host "1. Создайте Dockerfile в директории с распакованными файлами"
Write-Host "2. Соберите образ: docker build -t troyka-front ."
Write-Host "3. Запустите контейнер: docker run -p 3000:3000 troyka-front"

# Очистка временных файлов
Write-Log "🧹 Очищаем временные файлы..."
Remove-Item -Recurse -Force $DeployDir

Write-Success "🎉 Деплой подготовлен успешно!"
Write-Success "Архив готов для загрузки на сервер: $ArchiveName"
