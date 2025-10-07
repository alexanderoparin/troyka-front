'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isTest, setIsTest] = useState<boolean>(false);

  useEffect(() => {
    // Получаем параметры от Робокассы
    const invId = searchParams.get('InvId') || 
                  searchParams.get('payment_id') || 
                  searchParams.get('transaction_id') || 
                  searchParams.get('order_id') ||
                  searchParams.get('id');
    
    const amount = searchParams.get('OutSum') || 
                  searchParams.get('amount') || 
                  searchParams.get('sum');
    
    const method = searchParams.get('PaymentMethod');
    const test = searchParams.get('IsTest');
    
    if (invId) {
      setPaymentId(invId);
    }
    
    if (amount) {
      setPaymentAmount(amount);
    }
    
    if (method) {
      setPaymentMethod(method);
    }
    
    if (test === '1') {
      setIsTest(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-800 dark:text-green-200">
            {isTest ? 'Тестовая оплата успешна!' : 'Оплата успешна!'}
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Ваш платеж был успешно обработан
            {isTest && (
              <span className="block text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                (Тестовый режим)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(paymentId || paymentAmount || paymentMethod) && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
              {paymentId && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">ID платежа:</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{paymentId}</p>
                </div>
              )}
              {paymentAmount && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Сумма платежа:</p>
                  <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">{paymentAmount} ₽</p>
                </div>
              )}
              {paymentMethod && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Способ оплаты:</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {paymentMethod === 'BankCard' ? 'Банковская карта' : paymentMethod}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/studio">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Перейти в студию
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/account">Мой аккаунт</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}