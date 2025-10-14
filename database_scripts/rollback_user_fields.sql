-- Скрипт для отката изменений (добавление полей обратно)
-- Выполнить только в случае необходимости отката

-- Добавляем колонки обратно в таблицу user
ALTER TABLE troyka.user ADD COLUMN first_name VARCHAR(255);
ALTER TABLE troyka.user ADD COLUMN last_name VARCHAR(255);
ALTER TABLE troyka.user ADD COLUMN phone VARCHAR(20);

-- Проверяем результат
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'troyka' 
  AND table_name = 'user' 
ORDER BY ordinal_position;
