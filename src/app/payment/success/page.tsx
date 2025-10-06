'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const invId = searchParams.get('InvId');
    if (invId) {
      setOrderId(invId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Оплата успешна!</CardTitle>
          <CardDescription>
            Ваш платеж был успешно обработан
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Номер заказа:</p>
              <p className="font-mono text-sm">{orderId}</p>
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