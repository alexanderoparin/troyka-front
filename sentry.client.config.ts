import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  environment: process.env.NODE_ENV,
  
  beforeSend(event) {
    // Фильтруем чувствительные данные
    if (event.request?.headers) {
      delete event.request.headers.Authorization
      delete event.request.headers.Cookie
    }
    return event
  },
})
