# 🚀 Инструкции по деплою Troyka Frontend

## 📋 Подготовка сервера

### 1. Подключение к серверу
```bash
ssh root@213.171.4.47
```

### 2. Загрузка скриптов деплоя
```bash
# Скачиваем скрипт деплоя
wget https://raw.githubusercontent.com/alexanderoparin/troyka-front/main/deploy-server.sh
chmod +x deploy-server.sh

# Скачиваем скрипт обновления
wget https://raw.githubusercontent.com/alexanderoparin/troyka-front/main/update-server.sh
chmod +x update-server.sh
```

### 3. Запуск деплоя
```bash
sudo ./deploy-server.sh
```

## 🔧 Что делает скрипт деплоя

1. **Обновляет систему** - `apt update && apt upgrade`
2. **Устанавливает Node.js 18** - последняя LTS версия
3. **Устанавливает Nginx** - веб-сервер и reverse proxy
4. **Устанавливает PM2** - менеджер процессов Node.js
5. **Клонирует репозиторий** - `https://github.com/alexanderoparin/troyka-front.git`
6. **Устанавливает зависимости** - `npm ci --production`
7. **Собирает приложение** - `npm run build`
8. **Настраивает переменные окружения** - `.env.local`
9. **Запускает приложение** - через PM2
10. **Настраивает Nginx** - reverse proxy на порт 3000
11. **Настраивает файрвол** - открывает порты 22, 80, 443

## 🌐 Результат

После успешного деплоя:
- **Сайт доступен**: `http://213.171.4.47`
- **Приложение работает** на порту 3000
- **Nginx проксирует** запросы на приложение
- **PM2 управляет** процессом Node.js

## 🔄 Обновление приложения

Для обновления кода:
```bash
sudo ./update-server.sh
```

## 📊 Управление приложением

### PM2 команды
```bash
pm2 status                    # Статус приложения
pm2 logs troyka-frontend      # Логи приложения
pm2 restart troyka-frontend   # Перезапуск
pm2 stop troyka-frontend      # Остановка
pm2 start troyka-frontend     # Запуск
```

### Nginx команды
```bash
systemctl status nginx        # Статус Nginx
nginx -t                      # Проверка конфигурации
systemctl reload nginx        # Перезагрузка конфигурации
systemctl restart nginx       # Перезапуск Nginx
```

## 🔧 Настройка переменных окружения

Файл `.env.local` создается автоматически:
```env
NEXT_PUBLIC_JAVA_API_URL=http://213.171.4.47:8080
NEXT_PUBLIC_JAVA_API_TIMEOUT=30000
NODE_ENV=production
PORT=3000
```

Для изменения настроек:
```bash
nano /opt/troyka-front/.env.local
pm2 restart troyka-frontend
```

## 🐳 Docker деплой (альтернатива)

Если хотите использовать Docker:

```bash
# Скачиваем код
git clone https://github.com/alexanderoparin/troyka-front.git
cd troyka-front

# Собираем Docker образ
docker build -t troyka-front .

# Запускаем контейнер
docker run -d \
  --name troyka-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_JAVA_API_URL=http://213.171.4.47:8080 \
  troyka-front
```

## 🔍 Мониторинг и логи

### Логи приложения
```bash
pm2 logs troyka-frontend --lines 100
```

### Логи Nginx
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Мониторинг ресурсов
```bash
pm2 monit
htop
```

## 🚨 Устранение неполадок

### Приложение не запускается
```bash
pm2 logs troyka-frontend
cd /opt/troyka-front
npm run build
pm2 restart troyka-frontend
```

### Nginx не работает
```bash
nginx -t
systemctl status nginx
systemctl restart nginx
```

### Порт занят
```bash
netstat -tlnp | grep :3000
pm2 restart troyka-frontend
```

## 📱 Настройка домена (опционально)

1. **Купите домен** (например, `troyka-front.com`)
2. **Настройте DNS** - A-запись на `213.171.4.47`
3. **Обновите Nginx конфигурацию**:
   ```bash
   nano /etc/nginx/sites-available/troyka-frontend
   # Замените server_name 213.171.4.47; на server_name troyka-front.com;
   systemctl reload nginx
   ```

## 🔒 SSL сертификат (опционально)

```bash
# Установка Certbot
apt install certbot python3-certbot-nginx

# Получение SSL сертификата
certbot --nginx -d troyka-front.com

# Автоматическое обновление
crontab -e
# Добавьте: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs troyka-frontend`
2. Проверьте статус: `pm2 status`
3. Проверьте Nginx: `systemctl status nginx`
4. Перезапустите: `pm2 restart troyka-frontend`
