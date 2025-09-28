import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  environment: process.env.NODE_ENV,
  
  beforeSend(event) {
    // Фильтруем чувствительные данные
    if (event.request?.headers) {
      delete event.request.headers.authorization
      delete event.request.headers.cookie
    }
    
    // Фильтруем переменные окружения
    if (event.contexts?.runtime?.env) {
      const sensitiveKeys = [
        'DATABASE_URL',
        'NEXTAUTH_SECRET', 
        'FAL_API_KEY',
        'ROBOKASSA_PASSWORD_1',
        'ROBOKASSA_PASSWORD_2',
        'S3_SECRET_ACCESS_KEY',
      ]
      
      const env = event.contexts.runtime.env as Record<string, any>
      sensitiveKeys.forEach(key => {
        if (env[key]) {
          env[key] = '[Filtered]'
        }
      })
    }
    
    return event
  },
})
