import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto w-full relative z-20">
      {/* Mobile Footer */}
      <div className="md:hidden px-4 py-4 pb-6">
        {/* Логотип и название */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">24</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">24reshai</span>
        </div>

        {/* Навигация */}
        <nav className="flex justify-center space-x-6 mb-4">
          <Link 
            href="/contacts" 
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
          >
            Контакты
          </Link>
          <Link 
            href="/pricing" 
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
          >
            Тарифы
          </Link>
        </nav>

        {/* Разделитель */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-2">
          {/* Политики - горизонтально с переносом */}
          <div className="flex flex-row flex-wrap justify-center items-center gap-x-2 gap-y-1 mb-3">
            <Link 
              href="/refund" 
              className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
            >
              Политика возврата
            </Link>
            <Link 
              href="/legal" 
              className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
            >
              Пользовательское соглашение
            </Link>
            <Link 
              href="/privacy" 
              className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
            >
              Политика конфиденциальности
            </Link>
          </div>

          {/* Копирайт */}
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2025 24reshai.ru. Все права защищены.
          </p>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-8 sm:pb-12">
        <div className="flex flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Логотип и название */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">24</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">24reshai</span>
          </div>

          {/* Навигация */}
          <nav className="flex flex-wrap justify-center md:justify-end space-x-6">
            <Link 
              href="/contacts" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
            >
              Контакты
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
            >
              Тарифы
            </Link>
          </nav>
        </div>

        {/* Нижняя часть */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
              © 2025 24reshai.ru. Все права защищены.
            </p>
            <div className="flex flex-row flex-wrap justify-center items-center gap-x-3 gap-y-1 sm:gap-x-4">
              <Link 
                href="/refund" 
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 whitespace-nowrap"
              >
                Политика возврата
              </Link>
              <Link 
                href="/legal" 
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 whitespace-nowrap"
              >
                Пользовательское соглашение
              </Link>
              <Link 
                href="/privacy" 
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 whitespace-nowrap"
              >
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
