"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RefundPage() {
  const router = useRouter()

  return (
    <div className="space-y-8 max-w-4xl mx-auto pt-8 md:pt-16 px-4">
      {/* Кнопка "Назад" - видима на мобильных */}
      <div className="md:hidden mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад на главную</span>
        </Button>
      </div>
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Политика возврата</h1>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <RotateCcw className="h-5 w-5" />
            Возврат средств
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            Если по каким-либо причинам Вы решили отказаться от приобретенной услуги, то можете сделать это в соответствии с Законом РФ «О защите прав потребителей» от 07.02.1992 № 2300-1.
          </p>
          
          <div className="space-y-2">
            <p>
              <strong>Почта для заявок на возврат:</strong> <a href="mailto:support@24reshai.ru" className="text-primary hover:underline">support@24reshai.ru</a>
            </p>
            <p>
              <strong>Срок рассмотрения заявки:</strong> до 7 дней.
            </p>
          </div>

          <div className="mt-6">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              В заявке на возврат укажите:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Email, на который зарегистрирован аккаунт</li>
              <li>Количество неиспользованных поинтов</li>
              <li>Реквизиты для возврата (номер карты или расчетный счет)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Контактная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>ИП Бурцев Даниил Викторович</strong></p>
          <p>ИНН: 482619660921</p>
          <p>Email: support@24reshai.ru</p>
        </CardContent>
      </Card>
    </div>
  )
}

