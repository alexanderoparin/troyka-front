#!/bin/bash

# Обновляем конфигурацию nginx, добавляя /contact/ в регулярное выражение
sed -i 's/location ~ \^\\/(auth|users|files|health|generate|pricing|fal)\\//location ~ ^\/(auth|users|files|health|generate|pricing|fal|contact)\//' /etc/nginx/sites-available/24reshai.ru

# Проверяем конфигурацию
nginx -t

if [ $? -eq 0 ]; then
    echo "Конфигурация nginx корректна, перезагружаем..."
    systemctl reload nginx
    echo "Nginx успешно перезагружен!"
else
    echo "Ошибка в конфигурации nginx!"
    exit 1
fi
