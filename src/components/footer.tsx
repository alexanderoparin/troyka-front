import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Логотип и название */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Troyka</span>
          </div>

          {/* Навигация */}
          <nav className="flex flex-wrap justify-center md:justify-end space-x-6">
            <Link 
              href="/contacts" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Контакты
            </Link>
            <Link 
              href="/legal" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Правовая информация
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Тарифы
            </Link>
          </nav>
        </div>

        {/* Нижняя часть */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-gray-500">
              © 2025 Troyka. Все права защищены.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/privacy" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Политика конфиденциальности
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Пользовательское соглашение
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
