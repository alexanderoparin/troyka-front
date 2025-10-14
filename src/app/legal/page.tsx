import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function LegalPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Пользовательское соглашение</h1>
        <p className="text-muted-foreground text-gray-600 dark:text-gray-300">
          Условия использования сервиса 24reshai
        </p>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <FileText className="h-5 w-5" />
              Пользовательское соглашение
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <h3 className="font-semibold">1. Условия использования</h3>
            <p>
              Используя сервис 24reshai, вы соглашаетесь с данными условиями.
              Сервис предназначен для создания изображений товаров с помощью ИИ.
            </p>

            <h3 className="font-semibold">2. Система поинтов</h3>
            <p>
              • При регистрации вы получаете +6 поинтов бесплатно<br/>
              • 1 генерация изображения = 3 поинта<br/>
              • Поинты не имеют срока действия
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
            </p>
            <p>
              • Нарушающие авторские права<br/>
              • Содержащие неприемлемый контент<br/>
              • Для незаконных целей
            </p>

            <h3 className="font-semibold">5. Возврат денежных средств</h3>
            <p>
              Возврат денежных средств возможен в течение 14 дней с момента покупки.
            </p>
            <p>
              <strong>Условия возврата:</strong><br/>
              • Возврат только неиспользованных поинтов<br/>
              • Возвращаемая сумма рассчитывается по курсу 6 рублей за поинт<br/>
              • Заявка на возврат подается через support@24reshai.ru<br/>
              • Возврат осуществляется в течение 5 рабочих дней
            </p>
            <p>
              <strong>В заявке на возврат укажите:</strong><br/>
              • Email, на который зарегистрирован аккаунт<br/>
              • Количество неиспользованных поинтов<br/>
              • Реквизиты для возврата (номер карты или расчетный счет)
            </p>

            <h3 className="font-semibold">6. Ответственность</h3>
            <p>
              Мы стремимся обеспечить стабильную работу сервиса, но не гарантируем
              100% доступность. В случае технических проблем мы компенсируем
              потраченные поинты.
            </p>

            <h3 className="font-semibold">7. Изменения условий</h3>
            <p>
              Мы можем обновлять данные условия. Актуальная версия всегда доступна на сайте.
            </p>
          </CardContent>
        </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Контактная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>ИП Бурцев Даниил Викторович</strong></p>
          <p>ИНН: 482619660921</p>
          <p>Email: support@24reshai.ru</p>
        </CardContent>
      </Card>
    </div>
  )
}
