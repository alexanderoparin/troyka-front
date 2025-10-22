"use client"

import { useAuth } from "@/contexts/auth-context"
import { usePaymentHistory } from "@/hooks/use-payment-history"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export default function PaymentHistoryPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { history: paymentHistory, isLoading: historyLoading, error: historyError, refetch } = usePaymentHistory()
  const router = useRouter()

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'created':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Оплачен</Badge>
      case 'created':
        return <Badge variant="secondary">Создан</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Ожидает оплаты</Badge>
      case 'failed':
        return <Badge variant="destructive">Неудачный</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="border-red-500 text-red-700">Отменен</Badge>
      case 'refunded':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Возвращен</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center space-y-8 py-20">
        <div className="space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-3xl font-bold">Требуется авторизация</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Войдите в аккаунт, чтобы просмотреть историю платежей
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => router.push("/login")}>
            <CreditCard className="w-5 h-5 mr-2" />
            Войти в аккаунт
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-12 sm:pt-16 lg:pt-20">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к аккаунту
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">История платежей</h1>
        <p className="text-muted-foreground">
          Все ваши платежи и пополнения баланса
        </p>
      </div>

      {/* Payment History Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Платежи
          </CardTitle>
          <CardDescription>
            {paymentHistory?.length || 0} платежей в истории
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : historyError ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Ошибка загрузки истории</p>
              <p className="mb-4">{historyError}</p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Попробовать снова
              </Button>
            </div>
          ) : paymentHistory && paymentHistory.length > 0 ? (
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <h3 className="font-medium">{payment.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          Платеж #{payment.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {payment.amount.toLocaleString('ru-RU')} ₽
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>
                        <strong>Поинты:</strong> {payment.creditsAmount}
                      </span>
                      <span>
                        <strong>Создан:</strong> {formatDate(new Date(payment.createdAt))}
                      </span>
                      {payment.paidAt && (
                        <span>
                          <strong>Оплачен:</strong> {formatDate(new Date(payment.paidAt))}
                        </span>
                      )}
                    </div>
                    {payment.isTest && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5 border-orange-300 text-orange-600 dark:border-orange-600 dark:text-orange-400">
                        Тест
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">История платежей пуста</p>
              <p className="mb-4">Пополните баланс, чтобы начать создавать изображения</p>
              <Button asChild>
                <Link href="/pricing">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Пополнить баланс
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
