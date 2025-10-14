-- Скрипт для удаления полей firstName, lastName, phone из таблицы user
-- Выполнить на продакшн базе данных

-- Удаляем колонки из таблицы user
ALTER TABLE troyka.user DROP COLUMN IF EXISTS first_name;
ALTER TABLE troyka.user DROP COLUMN IF EXISTS last_name;
ALTER TABLE troyka.user DROP COLUMN IF EXISTS phone;

-- Проверяем результат
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'troyka' 
  AND table_name = 'user' 
ORDER BY ordinal_position;
