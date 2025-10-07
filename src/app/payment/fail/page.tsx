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

  useEffect(() => {
    const invId = searchParams.get('InvId');
    if (invId) {
      setPaymentId(invId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">Оплата не прошла</CardTitle>
          <CardDescription>
            Произошла ошибка при обработке платежа
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentId && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">ID платежа:</p>
              <p className="font-mono text-sm">{paymentId}</p>
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

