import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, FileText } from "lucide-react"

export default function LegalPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Правовая информация</h1>
        <p className="text-muted-foreground">
          Политика конфиденциальности и условия использования сервиса TROYKA.AI
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Политика конфиденциальности
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <h3 className="font-semibold">1. Сбор информации</h3>
            <p>
              Мы собираем только необходимую информацию для предоставления услуг:
              email адрес, имя пользователя, данные о генерациях изображений.
            </p>

            <h3 className="font-semibold">2. Использование данных</h3>
            <p>
              Ваши данные используются исключительно для:
              • Предоставления услуг генерации изображений
              • Обработки платежей
              • Связи с пользователями по вопросам сервиса
            </p>

            <h3 className="font-semibold">3. Защита данных</h3>
            <p>
              Мы применяем современные методы шифрования и защиты данных.
              Ваши изображения хранятся в приватном режиме и доступны только вам.
            </p>

            <h3 className="font-semibold">4. Права пользователей</h3>
            <p>
              Вы имеете право на доступ, исправление и удаление ваших персональных данных.
              Для этого обратитесь к нам по адресу support@troyka-ai.ru
            </p>

            <h3 className="font-semibold">5. Cookies</h3>
            <p>
              Мы используем технические cookies для обеспечения работы сайта и
              аналитические cookies для улучшения пользовательского опыта.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Пользовательское соглашение
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <h3 className="font-semibold">1. Условия использования</h3>
            <p>
              Используя сервис TROYKA.AI, вы соглашаетесь с данными условиями.
              Сервис предназначен для создания изображений товаров с помощью ИИ.
            </p>

            <h3 className="font-semibold">2. Система поинтов</h3>
            <p>
              • При регистрации вы получаете +6 поинтов бесплатно
              • 1 генерация изображения = 3 поинта
              • Поинты не имеют срока действия
              • Возврат неиспользованных поинтов возможен в течение 14 дней
            </p>

            <h3 className="font-semibold">3. Права на изображения</h3>
            <p>
              Созданные изображения принадлежат вам. Вы можете использовать их
              в коммерческих целях без ограничений. Мы не претендуем на права
              на созданный контент.
            </p>

            <h3 className="font-semibold">4. Ограничения</h3>
            <p>
              Запрещается создавать изображения:
              • Нарушающие авторские права
              • Содержащие неприемлемый контент
              • Для незаконных целей
            </p>

            <h3 className="font-semibold">5. Ответственность</h3>
            <p>
              Мы стремимся обеспечить стабильную работу сервиса, но не гарантируем
              100% доступность. В случае технических проблем мы компенсируем
              потраченные поинты.
            </p>

            <h3 className="font-semibold">6. Изменения условий</h3>
            <p>
              Мы можем обновлять данные условия. О существенных изменениях
              мы уведомляем пользователей по email за 30 дней.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Контактная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>ООО "ТРОYKA ИИ"</strong></p>
          <p>Email: support@troyka-ai.ru</p>
          <p>Адрес: Россия, г. Москва</p>
          <p>Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
