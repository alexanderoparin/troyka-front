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

  // Ответ FAL с деталями
  if (lower.includes('сервис fal.ai вернул ошибку')) {
    const bodyText = extractFalBody(message)
    const bodyJson = tryParseJson(bodyText)

    if (bodyJson) {
      const detail = bodyJson.detail || bodyJson.error || bodyJson.message
      if (typeof detail === 'string' && detail.trim().length > 0) {
        return { title: 'Ошибка генерации', description: detail }
      }
      // Частые структуры FAL
      const firstErr = Array.isArray(bodyJson.errors) ? bodyJson.errors[0] : null
      if (firstErr && typeof firstErr.message === 'string') {
        return { title: 'Ошибка генерации', description: firstErr.message }
      }
    }

    // Если не json — покажем весь хвост как есть, но коротко
    if (bodyText) {
      const short = bodyText.length > 300 ? bodyText.slice(0, 300) + '…' : bodyText
      return { title: 'Ошибка генерации', description: short }
    }
  }

  // Прочие случаи
  if (typeof message === 'string' && message.trim().length > 0) {
    return { title: 'Ошибка', description: message }
  }

  return fallback
}


