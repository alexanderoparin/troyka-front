#!/bin/bash

# Скрипт для обновления базы данных - добавление поля phone
# Выполните на сервере: ./update_database.sh

echo "🔧 Обновление базы данных - добавление поля phone..."

# Переходим в директорию бэкенда
cd /opt/troyka-back

# Проверяем, что мы в правильной директории
if [ ! -f "pom.xml" ]; then
    echo "❌ Ошибка: pom.xml не найден. Убедитесь, что вы в директории troyka-back"
    exit 1
fi

echo "📁 Текущая директория: $(pwd)"

# Останавливаем приложение (если запущено)
echo "⏹️ Останавливаем приложение..."
sudo systemctl stop troyka-back || echo "Приложение не было запущено"

# Подключаемся к базе данных и выполняем SQL
echo "🗄️ Подключаемся к базе данных..."

# Замените эти параметры на ваши реальные данные подключения к БД
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="troyka"
DB_USER="troyka_user"
DB_SCHEMA="troyka"

# Выполняем SQL скрипт
psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -c "ALTER TABLE $DB_SCHEMA.users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL;"
psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -c "CREATE INDEX IF NOT EXISTS idx_users_phone ON $DB_SCHEMA.users(phone);"

if [ $? -eq 0 ]; then
    echo "✅ Поле phone успешно добавлено в таблицу users"
else
    echo "❌ Ошибка при выполнении SQL скрипта"
    exit 1
fi

# Перезапускаем приложение
echo "🚀 Перезапускаем приложение..."
sudo systemctl start troyka-back

# Проверяем статус
sleep 5
if systemctl is-active --quiet troyka-back; then
    echo "✅ Приложение успешно запущено"
else
    echo "❌ Ошибка при запуске приложения"
    sudo systemctl status troyka-back
fi

echo "🎉 Обновление завершено!"
echo "📱 Теперь пользователи могут указывать номер телефона при регистрации"
