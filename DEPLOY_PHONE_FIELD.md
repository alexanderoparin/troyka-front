# 📱 Деплой поля телефона - Полная инструкция

## ✅ Что обновлено:

### **Frontend (Next.js)**
- ✅ `RegisterRequest` - добавлено поле `phone`
- ✅ `UserInfo` - добавлено поле `phone`
- ✅ Форма регистрации - поле для ввода телефона
- ✅ Страница аккаунта - отображение телефона

### **Backend (Java Spring Boot)**
- ✅ `User` entity - добавлено поле `phone`
- ✅ `RegisterRequest` DTO - добавлено поле `phone`
- ✅ `UserInfoDTO` - добавлено поле `phone`
- ✅ `AuthService` - обработка телефона при регистрации

### **Database (PostgreSQL)**
- ✅ SQL скрипт для добавления поля `phone VARCHAR(20)`
- ✅ Индекс для быстрого поиска по телефону

## 🚀 Пошаговый деплой:

### 1. **Обновить базу данных на сервере**

```bash
# Подключиться к серверу
ssh root@213.171.4.47

# Перейти в директорию бэкенда
cd /opt/troyka-back

# Выполнить SQL команды
psql -h localhost -p 5432 -d troyka -U troyka_user -c "ALTER TABLE troyka.users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL;"
psql -h localhost -p 5432 -d troyka -U troyka_user -c "CREATE INDEX IF NOT EXISTS idx_users_phone ON troyka.users(phone);"
```

### 2. **Обновить бэкенд на сервере**

```bash
# На сервере в /opt/troyka-back
git pull origin main
mvn clean package -DskipTests
sudo systemctl stop troyka-back
sudo systemctl start troyka-back
sudo systemctl status troyka-back
```

### 3. **Обновить фронтенд на сервере**

```bash
# На сервере в /opt/troyka-front
git pull origin main
npm run build
sudo systemctl restart nginx
```

## 🔧 Альтернативный способ (автоматический):

Если у вас есть скрипты деплоя, используйте их:

```bash
# Для бэкенда
cd /opt/troyka-back
./deploy-server.sh

# Для фронтенда  
cd /opt/troyka-front
./deploy-frontend.sh
```

## ✅ Проверка работы:

1. **Откройте** `https://24reshai.ru/register`
2. **Зарегистрируйтесь** с номером телефона
3. **Проверьте** отображение в профиле
4. **Убедитесь**, что регистрация без телефона работает

## 🐛 Если что-то пошло не так:

### Проверить логи бэкенда:
```bash
sudo journalctl -u troyka-back -f
```

### Проверить логи nginx:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Проверить статус сервисов:
```bash
sudo systemctl status troyka-back
sudo systemctl status nginx
```

## 📋 Структура поля в БД:

```sql
-- Поле добавлено в таблицу troyka.users
phone VARCHAR(20) NULL  -- Номер телефона (необязательное)
```

## 🎯 Результат:

После деплоя:
- ✅ Пользователи могут указывать телефон при регистрации
- ✅ Телефон отображается в профиле с иконкой 📞
- ✅ Поле необязательное - старые пользователи не пострадают
- ✅ API полностью поддерживает поле телефона
