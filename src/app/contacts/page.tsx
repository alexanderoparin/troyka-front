import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Контакты
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Свяжитесь с нами для получения поддержки или по любым вопросам
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Контактная информация */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span>Контактная информация</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a 
                      href="mailto:support@24reshai.ru" 
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      support@24reshai.ru
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Реквизиты */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Реквизиты</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">Индивидуальный предприниматель</p>
                  <p className="text-gray-700">Бурцев Даниил Викторович</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">ИНН</p>
                  <p className="text-gray-700 font-mono">482619660921</p>
                </div>
                <div className="text-sm text-gray-500 mt-4">
                  <p>Остальная информация будет добавлена позже</p>
                </div>
              </CardContent>
            </Card>

            {/* Время работы */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Время работы</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Поддержка работает 24/7
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Мы отвечаем на письма в течение 24 часов
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Форма обратной связи */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Написать нам</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Имя</Label>
                      <Input 
                        id="name" 
                        placeholder="Ваше имя"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Тема</Label>
                    <Input 
                      id="subject" 
                      placeholder="Тема сообщения"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Сообщение</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Ваше сообщение..."
                      rows={5}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Отправить сообщение
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
