# Troyka Frontend

Фронтенд приложения для генерации изображений товаров с помощью ИИ.

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Открыть http://localhost:3000
```

### Сборка для продакшена

```bash
# Сборка проекта
npm run build

# Запуск продакшен версии
npm start
```

## 📦 Деплой

### Автоматический деплой

```bash
# Сделать скрипт исполняемым
chmod +x deploy.sh

# Запустить деплой
./deploy.sh production
```

### Ручной деплой

1. **Сборка проекта:**
```bash
   npm run build
   ```

2. **Копирование файлов на сервер:**
   - `.next/` - собранное приложение
   - `public/` - статические файлы
   - `package.json` - зависимости
   - `.env.local` - переменные окружения

3. **Установка зависимостей на сервере:**
```bash
   npm ci --production
   ```

4. **Запуск:**
```bash
   npm start
   ```

### Docker деплой

```bash
# Сборка образа
docker build -t troyka-front .

# Запуск контейнера
docker run -p 3000:3000 troyka-front
```

## 🔧 Переменные окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_JAVA_API_URL=http://your-backend-url
NEXT_PUBLIC_JAVA_API_TIMEOUT=30000
```

## 🛠️ Доступные скрипты

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для продакшена
- `npm start` - Запуск продакшен версии
- `npm run lint` - Проверка кода линтером
- `npm run type-check` - Проверка типов TypeScript

## 📁 Структура проекта

```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx        # Главная страница
│   ├── studio/         # Студия генерации
│   ├── history/        # История генераций
│   ├── account/        # Личный кабинет
│   ├── pricing/        # Тарифы
│   └── layout.tsx      # Корневой layout
├── components/         # React компоненты
│   ├── ui/            # UI компоненты
│   ├── generation-form.tsx
│   ├── file-upload.tsx
│   └── ...
├── contexts/          # React контексты
│   └── auth-context.tsx
├── lib/               # Утилиты и API клиент
│   ├── api-client.ts
│   ├── grammar.ts
│   └── utils.ts
└── hooks/             # Кастомные хуки
    └── use-image-history.ts
```

## 🔗 API интеграция

Приложение интегрируется с Java бэкендом через следующие эндпоинты:

- `POST /auth/register` - Регистрация
- `POST /auth/login` - Авторизация
- `GET /users/me` - Информация о пользователе
- `GET /fal/user/points` - Баланс поинтов
- `POST /fal/image/run/create` - Генерация изображений
- `POST /files/upload` - Загрузка файлов
- `GET /users/me/image-history` - История генераций

## 🎨 Технологии

- **Next.js 14** - React фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Radix UI** - UI компоненты
- **React Hook Form** - Формы
- **Zod** - Валидация
- **TanStack Query** - Управление состоянием

## 📝 Лицензия

Private