'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string | null>(null);
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
    
    const test = searchParams.get('IsTest');
    
    if (invId) {
      setPaymentId(invId);
    }
    
    if (amount) {
      setPaymentAmount(amount);
    }
    
    if (test === '1') {
      setIsTest(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-800 dark:text-red-200">
            {isTest ? 'Тестовая оплата не прошла' : 'Оплата не прошла'}
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            Произошла ошибка при обработке платежа
            {isTest && (
              <span className="block text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                (Тестовый режим)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(paymentId || paymentAmount) && (
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
            </div>
          )}
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/pricing">
                <RefreshCw className="w-4 h-4 mr-2" />
                Попробовать снова
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/studio">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться в студию
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

