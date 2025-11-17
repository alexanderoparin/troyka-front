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

  const hasStatus = typeof (raw as any)?.status === 'number'
  const status: number | undefined = hasStatus ? (raw as any).status : undefined
  const message = hasStatus ? ((raw as any).message || (raw as any).error || '') : (typeof raw === 'string' ? raw : (raw as any)?.message || '')
  const lower = String(message).toLowerCase()

  // Фильтр безопасности Gemini (content_filter)
  if (lower.includes('заблокированы фильтром безопасности') || lower.includes('content_filter')) {
    return {
      title: 'Контент заблокирован фильтром безопасности',
      description: 'Промпт или изображение были заблокированы. Попробуйте изменить текст промпта или загрузить другое изображение.'
    }
  }

  // Приоритетная обработка по HTTP-статусу (если есть)
  if (typeof status === 'number') {
    if (status === 422) {
      return {
        title: 'Невозможно обработать запрос',
        description: message || 'Проверьте загруженное изображение и параметры, затем попробуйте снова.'
      }
    }
    if (status === 429) {
      return {
        title: 'Слишком много запросов',
        description: 'Подождите немного и попробуйте снова.'
      }
    }
    if (status === 400) {
      return {
        title: 'Некорректный запрос',
        description: 'Проверьте параметры и попробуйте снова.'
      }
    }
    if (status === 401 || status === 403) {
      return {
        title: 'Сервис генерации недоступен',
        description: 'Попробуйте позже. Если проблема повторяется — напишите в поддержку.'
      }
    }
    if (status >= 500 || status === 502 || status === 503 || status === 504) {
      return {
        title: 'Сервис генерации недоступен',
        description: 'Попробуйте позже. Если проблема повторяется — напишите в поддержку.'
      }
    }
  }

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

  // Ответ от сервиса генерации/FAL — всегда дружелюбное сообщение, без статуса и причин
  if (
    lower.includes('сервис генерации вернул ошибку') ||
    lower.includes('сервис генерации недоступен') ||
    lower.includes('fal.ai')
  ) {
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


