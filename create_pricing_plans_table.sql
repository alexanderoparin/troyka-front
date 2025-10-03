-- Создание таблицы для тарифных планов
CREATE TABLE IF NOT EXISTS troyka.pricing_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    price_rub INTEGER NOT NULL, -- цена в копейках
    unit_price_rub_computed INTEGER NOT NULL, -- цена за поинт в копейках
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false, -- популярный тариф
    sort_order INTEGER DEFAULT 0, -- порядок сортировки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON troyka.pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_sort_order ON troyka.pricing_plans(sort_order);

-- Вставка начальных данных
INSERT INTO troyka.pricing_plans (id, name, description, credits, price_rub, unit_price_rub_computed, is_active, is_popular, sort_order) VALUES
('starter', 'Стартер', 'Идеально для начинающих', 100, 99000, 990, true, false, 1),
('pro', 'Профи', 'Самый популярный выбор', 300, 299000, 997, true, true, 2),
('business', 'Бизнес', 'Для активных пользователей', 600, 549000, 915, true, false, 3),
('premium', 'Премиум', 'Максимальная выгода', 1000, 899000, 899, true, false, 4)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    credits = EXCLUDED.credits,
    price_rub = EXCLUDED.price_rub,
    unit_price_rub_computed = EXCLUDED.unit_price_rub_computed,
    is_active = EXCLUDED.is_active,
    is_popular = EXCLUDED.is_popular,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

-- Создание функции для обновления updated_at
CREATE OR REPLACE FUNCTION troyka.update_pricing_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER trigger_update_pricing_plans_updated_at
    BEFORE UPDATE ON troyka.pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION troyka.update_pricing_plans_updated_at();
