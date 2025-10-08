"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { apiClient, ContactRequest } from '@/lib/api-client';
import { Mail, MessageCircle, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100, 'Имя не должно превышать 100 символов'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Тема должна содержать минимум 5 символов').max(200, 'Тема не должна превышать 200 символов'),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов').max(2000, 'Сообщение не должно превышать 2000 символов'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const request: ContactRequest = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        subject: data.subject,
        message: data.message,
      };

      const response = await apiClient.sendContactMessage(request);

      if (response.data) {
        setIsSubmitted(true);
        reset();
        toast({
          title: "Сообщение отправлено!",
          description: response.data.message,
        });
      } else {
        throw new Error(response.error || "Ошибка отправки сообщения");
      }
    } catch (error: any) {
      toast({
        title: "Ошибка отправки",
        description: error.message || "Не удалось отправить сообщение",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Контакты
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Свяжитесь с нами для получения поддержки или по любым вопросам
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Контактная информация */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span>Контактная информация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
                    <a 
                      href="mailto:support@24reshai.ru" 
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      support@24reshai.ru
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Реквизиты */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Реквизиты</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Индивидуальный предприниматель</p>
                  <p className="text-gray-700 dark:text-gray-300">Бурцев Даниил Викторович</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">ИНН</p>
                  <p className="text-gray-700 dark:text-gray-300 font-mono">482619660921</p>
                </div>
              </CardContent>
            </Card>

            {/* Время работы */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Время работы</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Поддержка работает 24/7
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Мы отвечаем на письма в течение 24 часов
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Форма обратной связи */}
          <div>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Написать нам</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Сообщение отправлено!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Спасибо за обращение! Мы ответим в течение 24 часов.
                    </p>
                    <Button 
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                    >
                      Отправить еще одно сообщение
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Имя *</Label>
                        <Input 
                          id="name" 
                          placeholder="Ваше имя"
                          className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                          {...register('name')}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="your@email.com"
                          className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+7 (XXX) XXX-XX-XX"
                        className="mt-1"
                        {...register('phone')}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Тема *</Label>
                      <Input 
                        id="subject" 
                        placeholder="Тема сообщения"
                        className={`mt-1 ${errors.subject ? 'border-red-500' : ''}`}
                        {...register('subject')}
                      />
                      {errors.subject && (
                        <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Сообщение *</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Ваше сообщение..."
                        rows={5}
                        className={`mt-1 ${errors.message ? 'border-red-500' : ''}`}
                        {...register('message')}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Отправка...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Отправить сообщение
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
