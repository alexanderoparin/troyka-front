# 🚀 Инструкции по развёртыванию TROYKA.AI

## ✅ Проверка готовности

Убедитесь, что все компоненты проекта созданы:

- [x] Next.js 14 приложение с TypeScript
- [x] Prisma схема и миграции
- [x] Все основные страницы (лендинг, студия, история, pricing, account)
- [x] NextAuth с email magic link и Telegram Login Widget
- [x] API эндпоинты для генерации, оплат, вебхуков
- [x] FAL.ai интеграция для генерации изображений
- [x] Robokassa для приёма платежей
- [x] S3 хранилище (Yandex/Timeweb)
- [x] Docker конфигурация и CI/CD
- [x] Подробный README

## 🏗 Быстрый запуск для тестирования

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

```bash
cp env.sample .env.local
```

Заполните основные переменные для тестирования:

```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/troyka_ai

# Для тестирования можно использовать заглушки
FAL_API_KEY=test-key
ROBOKASSA_LOGIN=test-login
ROBOKASSA_PASSWORD_1=test-pass1
ROBOKASSA_PASSWORD_2=test-pass2
ROBOKASSA_TEST_MODE=true

S3_PROVIDER=YANDEX
S3_ENDPOINT=https://storage.yandexcloud.net
S3_ACCESS_KEY_ID=test-key
S3_SECRET_ACCESS_KEY=test-secret
S3_BUCKET=test-bucket
```

### 3. Настройка базы данных

```bash
# Генерация Prisma Client
npx prisma generate

# Применение миграций
npx prisma migrate dev --name init

# Заполнение тестовыми данными
npm run db:seed
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу http://localhost:3000

## 🎯 Проверка функциональности

### Основные страницы:
- ✅ **/** - Главная страница с hero секцией и ценами
- ✅ **/studio** - Форма генерации изображений
- ✅ **/history** - История генераций с поиском
- ✅ **/pricing** - Планы подписки с Robokassa
- ✅ **/account** - Профиль пользователя и баланс
- ✅ **/legal** - Политика конфиденциальности и оферта

### API эндпоинты:
- ✅ `GET /api/health` - Проверка состояния сервиса
- ✅ `GET /api/wallet` - Баланс пользователя
- ✅ `POST /api/wallet/purchase` - Создание заказа
- ✅ `POST /api/generate` - Запуск генерации
- ✅ `GET /api/jobs/recent` - Недавние генерации
- ✅ `GET /api/jobs/[id]` - Информация о задаче
- ✅ `POST /api/upload` - Загрузка изображений
- ✅ `POST /api/webhooks/fal` - Вебхук FAL
- ✅ `POST /api/payments/robokassa/callback` - Вебхук Robokassa

## 🔧 Настройка внешних сервисов

Для полнофункциональной работы настройте:

1. **PostgreSQL** - база данных
2. **FAL.ai** - генерация изображений
3. **Robokassa** - приём платежей
4. **Yandex Object Storage** или **Timeweb** - хранилище файлов
5. **SMTP сервер** - для magic link авторизации
6. **Telegram Bot** - для Telegram Login Widget
7. **Sentry** - мониторинг ошибок

Подробные инструкции по настройке каждого сервиса см. в [README.md](README.md).

## 🐳 Деплой в продакшн

### Docker Compose

```bash
# Создайте продакшн .env файл
cp env.sample .env

# Заполните все необходимые переменные
nano .env

# Запустите все сервисы
docker-compose up -d

# Проверьте логи
docker-compose logs -f app
```

### Проверка деплоя

```bash
# Проверка здоровья приложения
curl http://localhost:3000/api/health

# Должен вернуть:
# {"ok":true,"version":"1.0.0","services":{"database":"ok",...}}
```

## 🎉 Готово!

Ваш MVP TROYKA.AI готов к работе! 

### Что у вас есть:

✅ **Полнофункциональный веб-сайт** для генерации изображений товаров  
✅ **Система поинтов** с бонусом +6 поинтов при регистрации  
✅ **Приём платежей** через российский Robokassa  
✅ **Генерация изображений** через FAL.ai (Nano Banana)  
✅ **Безопасное хранилище** в российском облаке  
✅ **Адаптивный дизайн** с тёмной темой  
✅ **SEO оптимизация** и мониторинг  
✅ **Docker деплой** и CI/CD  

### Следующие шаги:

1. 🌐 Настройте домен **troyka-ai.ru**
2. 🔐 Получите SSL сертификат
3. 📊 Настройте мониторинг и аналитику
4. 🚀 Запустите рекламные кампании
5. 📈 Масштабируйте по потребности

**Удачи с запуском!** 🚀
