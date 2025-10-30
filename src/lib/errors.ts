// Утилиты форматирования ошибок API/FAL для пользовательских тостов

export interface FormattedError {
  title: string
  description: string
}

function extractFalBody(message: string): string | null {
  const marker = 'тело ответа:'
  const idx = message.toLowerCase().indexOf(marker)
  if (idx === -1) return null
  const body = message.substring(idx + marker.length).trim()
  return body.length > 0 ? body : null
}

function tryParseJson(text: string | null): any | null {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function formatApiError(raw: unknown): FormattedError {
  const fallback: FormattedError = {
    title: 'Ошибка генерации',
    description: 'Не удалось создать изображение. Попробуйте ещё раз позже.'
  }

  const message = typeof raw === 'string' ? raw : (raw as any)?.message || ''
  const lower = message.toLowerCase()

  // Недостаточно поинтов
  if (lower.includes('недостаточно поинтов')) {
    return {
      title: 'Недостаточно поинтов',
      description: 'Для продолжения пополните баланс в разделе Тарифы.'
    }
  }

  // Сетевая недоступность FAL
  if (lower.includes('не удалось подключиться к сервису fal.ai')) {
    return {
      title: 'Сервис временно недоступен',
      description: 'fal.ai недоступен или соединение прервано. Проверьте интернет и попробуйте позже.'
    }
  }

  // Ответ FAL — всегда дружелюбное сообщение, без статуса и причин
  if (lower.includes('сервис fal.ai вернул ошибку')) {
    return {
      title: 'Сервис генерации недоступен',
      description: 'Попробуйте изменить параметры или загрузить другое изображение.'
    }
  }

  // Прочие случаи
  if (typeof message === 'string' && message.trim().length > 0) {
    return { title: 'Ошибка', description: message }
  }

  return fallback
}


