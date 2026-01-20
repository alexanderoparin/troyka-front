// API клиент для работы с Java бэкендом
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  expiresAt: string;
  isNewUser?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ImageRequest {
  prompt: string;
  inputImageUrls?: string[];
  numImages?: number;
  sessionId?: number;
  styleId?: number;
  aspectRatio?: string;
  model?: 'nano-banana' | 'nano-banana-pro';
  resolution?: '1K' | '2K' | '4K';
}

export interface ImageResponse {
  imageUrls: string[];
  balance?: number;
}

// Queue generation interfaces
export interface QueueRequestStatus {
  id: number;
  falRequestId: string;
  queueStatus: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  queuePosition?: number;
  prompt: string;
  imageUrls: string[];
  sessionId: number;
  createdAt: string;
  updatedAt: string;
}

// Типы для сессий
export interface Session {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastImageUrl?: string;
  messageCount: number;
}

export interface SessionMessage {
  id: number;
  prompt: string;
  imageUrls: string[];
  inputImageUrls: string[];
  createdAt: string;
  imageCount: number;
  styleId?: number;
  styleName?: string;
  aspectRatio?: string;
  modelType?: string;
}

export interface SessionDetail {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  history: SessionMessage[];
  totalMessages: number;
  hasMore: boolean;
}

export interface CreateSessionRequest {
  name?: string;
}

export interface CreateSessionResponse {
  id: number;
  name: string;
  createdAt: string;
  message: string;
}

export interface RenameSessionRequest {
  name: string;
}

export interface RenameSessionResponse {
  id: number;
  name: string;
  message: string;
}

export interface DeleteSessionResponse {
  id: number;
  message: string;
  deletedHistoryCount: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export interface UserInfo {
  username: string;
  email: string;
  role: string;
  points?: number;
  avatar?: string;
  createdAt?: string;
  emailVerified?: boolean;
  telegramId?: number;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramPhotoUrl?: string;
  telegramNotificationsEnabled?: boolean;
}

export interface ImageGenerationHistory {
  imageUrls: string[];
  prompt: string;
  createdAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface PricingPlanResponse {
  id: string;
  name: string;
  description?: string;
  credits: number;
  priceRub: number; // цена в копейках
  unitPriceRubComputed: number; // цена за поинт в копейках
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
}

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  message: string;
  status: string;
  messageId?: string;
}

// Art Style interfaces
export interface ArtStyle {
  id: number;
  name: string;
  prompt: string;
}

export interface UserArtStyle {
  styleId: number;
  styleName: string;
}

export interface UpdateUserArtStyleRequest {
  styleId: number;
}

// Prompt enhancement interfaces
export interface EnhancePromptRequest {
  prompt: string;
  imageUrls?: string[];
  styleId?: number;
}

export interface EnhancePromptResponse {
  enhancedPrompt: string;
}

// Telegram OAuth interfaces
export interface TelegramAuthRequest {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  email?: string;
}

// Добавляем интерфейсы для платежей
export interface PaymentRequest {
  amount: number;
  description: string;
  credits?: number;
}

export interface PaymentResponse {
  paymentUrl: string;
  paymentId: string;
  amount: number;
  status: string;
}

export interface PaymentHistory {
  id: number;
  amount: number;
  description: string;
  status: string;
  creditsAmount: number;
  paidAt: string | null;
  createdAt: string;
  isTest?: boolean;
}

// Admin panel interfaces
export interface AdminPaymentDTO {
  id: number;
  userId: number;
  username: string;
  email: string;
  telegramId: number | null;
  telegramUsername: string | null;
  telegramFirstName: string | null;
  telegramPhotoUrl: string | null;
  amount: number;
  description: string;
  creditsAmount: number;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  isTest: boolean;
}

export interface AdminUserDTO {
  id: number;
  username: string;
  email: string;
  role: string;
  emailVerified: boolean;
  telegramId: number | null;
  telegramUsername: string | null;
  telegramFirstName: string | null;
  telegramPhotoUrl: string | null;
  points: number;
  createdAt: string;
  updatedAt: string;
  hasSuccessfulPayment: boolean;
}

export interface AdminStatsDTO {
  totalUsers: number;
  totalPayments: number;
  todayPayments: number;
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  todayRegistrations: number;
  weekRegistrations: number;
  monthRegistrations: number;
  yearRegistrations: number;
}

export interface UserStatisticsDTO {
  startDate: string | null;
  endDate: string | null;
  regularModelCount: number;
  proModelCount: number;
  proModelByResolution: {
    [key: string]: number;
  };
  totalCount: number;
  totalPointsSpent: number;
  regularModelPointsSpent: number;
  proModelPointsSpent: number;
  proModelPointsByResolution: {
    [key: string]: number;
  };
  totalCostUsd: number | null;
  regularModelCostUsd: number | null;
  proModelCostUsd: number | null;
  proModelCostUsdByResolution: {
    [key: string]: number | null;
  } | null;
}

// System status interfaces
export type SystemStatus = 'ACTIVE' | 'DEGRADED' | 'MAINTENANCE';

export interface SystemStatusResponse {
  status: SystemStatus;
  message: string | null;
}

export interface SystemStatusRequest {
  status: SystemStatus;
  message?: string;
}

export interface SystemStatusHistoryDTO {
  id: number;
  status: SystemStatus;
  message: string | null;
  username: string | null;
  isSystem: boolean;
  createdAt: string;
}

export interface SystemStatusWithMetadata {
  status: SystemStatus;
  message: string | null;
  isSystem: boolean | null;
}

// Generation provider interfaces
export interface GenerationProviderDTO {
  code: string;
  displayName: string;
  available: boolean;
  active: boolean;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private onUnauthorizedCallback: (() => void) | null = null;
  // Защита от множественных одновременных вызовов getUserPoints
  private isGettingUserPoints: boolean = false;
  private lastGetUserPointsTime: number = 0;
  private getUserPointsDebounceMs: number = 1000; // 1 секунда
  private pendingGetUserPointsPromise: Promise<ApiResponse<number>> | null = null;
  private lastUserPointsResult: ApiResponse<number> | null = null; // Кэш последнего результата

  constructor() {
    // На продакшене используем HTTPS через домен, на локальной разработке - HTTP
    this.baseUrl = process.env.NEXT_PUBLIC_JAVA_API_URL || 'https://24reshai.ru';
    this.timeout = parseInt(process.env.NEXT_PUBLIC_JAVA_API_TIMEOUT || '30000');
    
    // Отладочная информация (только в development)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // console.log('API Base URL:', this.baseUrl);
      // console.log('Current hostname:', window.location.hostname);
    }
  }

  // Метод для установки callback при 401 ошибке
  setOnUnauthorized(callback: () => void): void {
    this.onUnauthorizedCallback = callback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    customTimeout?: number
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Добавляем JWT токен если есть
    const token = this.getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeout = customTimeout ?? this.timeout;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Проверяем Content-Type для определения типа ответа
      const contentType = response.headers.get('content-type');
      let data;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          // Проверяем, не пустой ли ответ
          if (text.trim() === '') {
            data = null;
          } else {
            try {
              data = JSON.parse(text);
            } catch (parseError) {
              console.error('Ошибка парсинга JSON:', parseError, 'Текст ответа:', text);
              data = { message: text || 'Ошибка парсинга JSON' };
            }
          }
        } else {
          // Если не JSON, читаем как текст
          const text = await response.text();
          data = { message: text };
        }
      } catch (error) {
        // Ошибка чтения ответа
        console.error('Ошибка чтения ответа:', error);
        data = { message: 'Ошибка чтения ответа' };
      }

      if (!response.ok) {
        // Если получили 401 (Unauthorized), токен истек или недействителен
        if (response.status === 401) {
          // Удаляем токен из localStorage
          this.removeToken();
          // Вызываем callback для уведомления о необходимости разлогинивания
          if (this.onUnauthorizedCallback) {
            this.onUnauthorizedCallback();
          }
        }
        
        return {
          error: data?.message || data?.error || 'Произошла ошибка',
          status: response.status,
        };
      }

      return {
        data: data !== null ? data : undefined,
        status: response.status,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          error: 'Превышено время ожидания запроса',
          status: 408,
        };
      }

      return {
        error: error.message || 'Ошибка сети',
        status: 0,
      };
    }
  }

  // Управление токенами
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getAuthToken(): string | null {
    return this.getToken();
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    // Очищаем кэш баланса при logout
    this.lastUserPointsResult = null;
  }

  // Auth API
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  logout(): void {
    this.removeToken();
  }

  async logoutWithServer(): Promise<ApiResponse<{ message: string; status: string }>> {
    const response = await this.request<{ message: string; status: string }>('/api/auth/logout', {
      method: 'POST',
    });
    
    // Удаляем токен после успешного logout на сервере
    if (response.data) {
      this.removeToken();
    }
    
    return response;
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/auth/verify-email?token=${token}`, {
      method: 'GET',
    });
  }

  async resendVerificationEmail(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/auth/resend-verification', {
      method: 'POST',
    });
  }

  async checkAndSendVerificationEmail(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/auth/check-and-send-verification', {
      method: 'POST',
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Функции конвертации для отправки на бэкенд
  private convertModelToEnum(model: 'nano-banana' | 'nano-banana-pro' | undefined): 'NANO_BANANA' | 'NANO_BANANA_PRO' | undefined {
    if (!model) return undefined;
    return model === 'nano-banana' ? 'NANO_BANANA' : 'NANO_BANANA_PRO';
  }

  private convertResolutionToEnum(resolution: '1K' | '2K' | '4K' | undefined): 'RESOLUTION_1K' | 'RESOLUTION_2K' | 'RESOLUTION_4K' | undefined {
    if (!resolution) return undefined;
    return `RESOLUTION_${resolution}` as 'RESOLUTION_1K' | 'RESOLUTION_2K' | 'RESOLUTION_4K';
  }

  // Image Generation API
  async generateImage(request: ImageRequest): Promise<ApiResponse<ImageResponse>> {
    const backendRequest = {
      ...request,
      model: this.convertModelToEnum(request.model),
      resolution: this.convertResolutionToEnum(request.resolution),
    };
    return this.request<ImageResponse>('/api/fal/image/run/create', {
      method: 'POST',
      body: JSON.stringify(backendRequest),
    }, 180000); // 3 минуты таймаут для генерации изображений (соответствует бэкенду)
  }

  // Queue Generation API
  async submitToQueue(request: ImageRequest): Promise<ApiResponse<QueueRequestStatus>> {
    const backendRequest = {
      ...request,
      model: this.convertModelToEnum(request.model),
      resolution: this.convertResolutionToEnum(request.resolution),
    };
    return this.request<QueueRequestStatus>('/api/generate/submit', {
      method: 'POST',
      body: JSON.stringify(backendRequest),
    });
  }

  async getQueueStatus(id: number): Promise<ApiResponse<QueueRequestStatus>> {
    return this.request<QueueRequestStatus>(`/api/generate/status/${id}`);
  }

  async getUserActiveRequests(): Promise<ApiResponse<QueueRequestStatus[]>> {
    return this.request<QueueRequestStatus[]>('/api/generate/user/active');
  }

  // File Upload API
  async uploadFile(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/api/files/upload`;
    const token = this.getToken();
    
    // Устанавливаем только Authorization, Content-Type браузер установит автоматически
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Если получили 401 (Unauthorized), токен истек или недействителен
        if (response.status === 401) {
          this.removeToken();
          if (this.onUnauthorizedCallback) {
            this.onUnauthorizedCallback();
          }
        }
        
        const errorData = await response.json();
        return {
          error: errorData.message || errorData.error || 'Ошибка загрузки файла',
          status: response.status,
        };
      }

      const fileUrl = await response.text();
      // Если URL относительный, делаем его абсолютным
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${this.baseUrl}${fileUrl}`;
      
      return {
        data: fullUrl,
        status: response.status,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          error: 'Превышено время ожидания загрузки',
          status: 408,
        };
      }

      return {
        error: error.message || 'Ошибка загрузки файла',
        status: 0,
      };
    }
  }

  // Avatar Upload API
  async uploadAvatar(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/api/users/avatar/upload`;
    const token = this.getToken();
    
    if (!token) {
      return {
        data: undefined,
        error: 'Требуется авторизация',
        status: 401,
      };
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Если получили 401 (Unauthorized), токен истек или недействителен
        if (response.status === 401) {
          this.removeToken();
          if (this.onUnauthorizedCallback) {
            this.onUnauthorizedCallback();
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        return {
          data: undefined,
          error: errorData.message || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      const result = await response.text();
      // Извлекаем URL из ответа (формат: "Аватар успешно загружен и сохранен: http://...")
      const urlMatch = result.match(/http:\/\/[^\s]+/);
      const avatarUrl = urlMatch ? urlMatch[0] : result;
      
      return {
        data: avatarUrl,
        error: undefined,
        status: response.status,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          data: undefined,
          error: 'Превышено время ожидания',
          status: 408,
        };
      }
      return {
        data: undefined,
        error: error.message || 'Ошибка загрузки аватара',
        status: 0,
      };
    }
  }

  // Get user avatar
  async getUserAvatar(): Promise<ApiResponse<string>> {
    const url = `${this.baseUrl}/api/users/avatar`;
    const token = this.getToken();
    
    if (!token) {
      return {
        data: undefined,
        error: 'Требуется авторизация',
        status: 401,
      };
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          return {
            data: undefined,
            error: undefined,
            status: 404,
          };
        }
        const errorData = await response.json().catch(() => ({}));
        return {
          data: undefined,
          error: errorData.message || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      const result = await response.text();
      return {
        data: result,
        error: undefined,
        status: response.status,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          data: undefined,
          error: 'Превышено время ожидания',
          status: 408,
        };
      }
      return {
        data: undefined,
        error: error.message || 'Ошибка получения аватара',
        status: 0,
      };
    }
  }

  // Delete user avatar
  async deleteUserAvatar(): Promise<ApiResponse<void>> {
    const url = `${this.baseUrl}/api/users/avatar`;
    const token = this.getToken();
    
    if (!token) {
      return {
        data: undefined,
        error: 'Требуется авторизация',
        status: 401,
      };
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: undefined,
          error: errorData.message || `HTTP ${response.status}`,
          status: response.status,
        };
      }

      return {
        data: undefined,
        error: undefined,
        status: response.status,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          data: undefined,
          error: 'Превышено время ожидания',
          status: 408,
        };
      }
      return {
        data: undefined,
        error: error.message || 'Ошибка удаления аватара',
        status: 0,
      };
    }
  }

  // Get file URL
  getFileUrl(filename: string): string {
    // Если filename уже полный URL, проверяем нужно ли проксирование
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      // Проксируем изображения от FAL AI через наш сервер
      if (this.isFalMediaUrl(filename)) {
        return this.proxyFalMediaUrl(filename);
      }
      return filename;
    }
    // Если filename начинается с /files/, используем напрямую (для аватаров и других файлов)
    if (filename.startsWith('/files/')) {
      return `${this.baseUrl}${filename}`;
    }
    // Иначе добавляем /files/ к filename
    return `${this.baseUrl}/files/${filename}`;
  }

  /**
   * Проверить, является ли URL изображением от FAL AI.
   */
  private isFalMediaUrl(url: string): boolean {
    return url.includes('v3.fal.media') || url.includes('v3b.fal.media');
  }

  /**
   * Проксировать URL изображения от FAL AI через наш сервер.
   * Преобразует: https://v3.fal.media/files/kangaroo/file.jpg
   *           -> https://24reshai.ru/images/v1/kangaroo/file.jpg
   * Преобразует: https://v3b.fal.media/files/b/lion/file.jpg
   *           -> https://24reshai.ru/images/v2/b/lion/file.jpg
   */
  public proxyFalMediaUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Определяем версию API по домену
      let apiVersion = 'v1';
      if (urlObj.hostname === 'v3b.fal.media') {
        apiVersion = 'v2';
      }
      
      // Извлекаем путь к файлу после /files/
      const filesIndex = urlObj.pathname.indexOf('/files/');
      if (filesIndex !== -1) {
        const filePath = urlObj.pathname.substring(filesIndex + '/files/'.length);
        return `${this.baseUrl}/api/images/${apiVersion}/${filePath}`;
      }
      
      return url; // Возвращаем оригинал если не удалось распарсить
    } catch (error) {
      console.error('Error proxying FAL media URL:', error);
      return url;
    }
  }

  // Get example file URL
  getExampleFileUrl(filename: string): string {
    return `https://24reshai.ru/files/examples/${filename}`;
  }

  // User API
  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    return this.request<UserInfo>('/api/users/me');
  }

  async getImageHistory(page: number = 0, size: number = 10): Promise<ApiResponse<ImageGenerationHistory[]>> {
    return this.request<ImageGenerationHistory[]>(`/api/users/me/image-history?page=${page}&size=${size}`);
  }

  // Get user points/balance
  async getUserPoints(): Promise<ApiResponse<number>> {
    // Проверяем debounce и наличие активного запроса
    const now = Date.now();
    const timeSinceLastCall = now - this.lastGetUserPointsTime;
    
    // Если есть активный промис, возвращаем его
    if (this.pendingGetUserPointsPromise) {
      return this.pendingGetUserPointsPromise;
    }
    
    // Проверяем debounce (только если нет активного запроса)
    if (timeSinceLastCall < this.getUserPointsDebounceMs) {
      // Возвращаем последний известный результат, если он есть
      if (this.lastUserPointsResult) {
        return this.lastUserPointsResult;
      }
      // Если результата нет, все равно выполняем запрос (первый раз)
    }
    
    const url = `${this.baseUrl}/api/fal/user/points`;
    const token = this.getToken();
    
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Создаем промис и сохраняем его
    this.isGettingUserPoints = true;
    this.lastGetUserPointsTime = now;
    this.pendingGetUserPointsPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Если получили 401 (Unauthorized), токен истек или недействителен
          if (response.status === 401) {
            this.removeToken();
            // Очищаем кэш при logout
            this.lastUserPointsResult = null;
            if (this.onUnauthorizedCallback) {
              this.onUnauthorizedCallback();
            }
          }
          
          const errorData = await response.json().catch(() => ({}));
          return {
            error: errorData.message || errorData.error || 'Ошибка получения баланса',
            status: response.status,
          };
        }

        const points = await response.json();
        const result = {
          data: points,
          status: response.status,
        };
        // Сохраняем результат в кэш для использования при debounce
        this.lastUserPointsResult = result;
        return result;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return {
            error: 'Превышено время ожидания запроса',
            status: 408,
          };
        }
        
        return {
          error: error.message || 'Ошибка сети',
          status: 0,
        };
      } finally {
        // Сбрасываем флаги через небольшую задержку
        setTimeout(() => {
          this.isGettingUserPoints = false;
          this.pendingGetUserPointsPromise = null;
        }, 500);
      }
    })();
    
    return this.pendingGetUserPointsPromise;
  }

  // Password Reset API
  async requestPasswordReset(email: string): Promise<ApiResponse<{message: string}>> {
    return this.request<{message: string}>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ApiResponse<{message: string}>> {
    return this.request<{message: string}>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Pricing methods
  async getPricingPlans(): Promise<ApiResponse<PricingPlanResponse[]>> {
    return this.request<PricingPlanResponse[]>('/api/pricing/plans', {
      method: 'GET',
    });
  }

  async getAllPricingPlans(): Promise<ApiResponse<PricingPlanResponse[]>> {
    return this.request<PricingPlanResponse[]>('/api/pricing/plans/all', {
      method: 'GET',
    });
  }

  // Contact Form API
  async sendContactMessage(request: ContactRequest): Promise<ApiResponse<ContactResponse>> {
    return this.request<ContactResponse>('/api/contact/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/api/health');
  }

  // Payment methods
  public async createPayment(request: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    const response = await this.request<PaymentResponse>('/api/payment/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  }

  public async getPaymentHistory(): Promise<ApiResponse<PaymentHistory[]>> {
    const response = await this.request<PaymentHistory[]>('/api/payment/history', {
      method: 'GET',
    });
    return response;
  }

  // Sessions API
  async getSessionsList(page: number = 0, size: number = 10): Promise<ApiResponse<PageResponse<Session>>> {
    return this.request<PageResponse<Session>>(`/api/sessions?page=${page}&size=${size}`);
  }

  async createSession(request: CreateSessionRequest = {}): Promise<ApiResponse<CreateSessionResponse>> {
    return this.request<CreateSessionResponse>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getSessionDetail(sessionId: number, page: number = 0, size: number = 20): Promise<ApiResponse<SessionDetail>> {
    return this.request<SessionDetail>(`/api/sessions/${sessionId}?page=${page}&size=${size}`);
  }

  async renameSession(sessionId: number, request: RenameSessionRequest): Promise<ApiResponse<RenameSessionResponse>> {
    return this.request<RenameSessionResponse>(`/api/sessions/${sessionId}/rename`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteSession(sessionId: number): Promise<ApiResponse<DeleteSessionResponse>> {
    return this.request<DeleteSessionResponse>(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async getDefaultSession(): Promise<ApiResponse<Session>> {
    return this.request<Session>('/api/sessions/default');
  }

  // Telegram OAuth methods
  async loginWithTelegram(telegramData: TelegramAuthRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/telegram/login', {
      method: 'POST',
      body: JSON.stringify(telegramData),
    });

    if (response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async linkTelegram(telegramData: TelegramAuthRequest): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/users/me/telegram/link', {
      method: 'POST',
      body: JSON.stringify(telegramData),
    });
  }

  async unlinkTelegram(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/users/me/telegram/unlink', {
      method: 'DELETE',
    });
  }

  // Update username
  async updateUsername(username: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/users/me/username', {
      method: 'PUT',
      body: JSON.stringify({ username }),
    });
  }

  // Update email
  async updateEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/users/me/email', {
      method: 'PUT',
      body: JSON.stringify({ email }),
    });
  }

  // Get all art styles
  async getArtStyles(): Promise<ApiResponse<ArtStyle[]>> {
    return this.request<ArtStyle[]>('/api/art-styles');
  }

  async getUserArtStyle(): Promise<ApiResponse<UserArtStyle>> {
    return this.request<UserArtStyle>('/api/art-styles/user');
  }

  async updateUserArtStyle(styleId: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/art-styles/user', {
      method: 'PUT',
      body: JSON.stringify({ styleId }),
    });
  }

  // Prompt enhancement API
  async enhancePrompt(request: EnhancePromptRequest): Promise<ApiResponse<EnhancePromptResponse>> {
    return this.request<EnhancePromptResponse>('/api/prompt/enhance', {
      method: 'POST',
      body: JSON.stringify(request),
    }, 60000); // 60 секунд таймаут для запросов улучшения промпта
  }

  // Admin panel methods
  async getAdminPayments(): Promise<ApiResponse<AdminPaymentDTO[]>> {
    return this.request<AdminPaymentDTO[]>('/api/admin/payments');
  }

  async getAdminUsers(): Promise<ApiResponse<AdminUserDTO[]>> {
    return this.request<AdminUserDTO[]>('/api/admin/users');
  }

  async searchAdminUsers(query?: string, limit: number = 20): Promise<ApiResponse<AdminUserDTO[]>> {
    const params = new URLSearchParams();
    if (query) {
      params.append('query', query);
    }
    params.append('limit', limit.toString());
    const queryString = params.toString();
    return this.request<AdminUserDTO[]>(`/api/admin/users/search?${queryString}`);
  }

  async getAdminStats(): Promise<ApiResponse<AdminStatsDTO>> {
    return this.request<AdminStatsDTO>('/api/admin/stats');
  }

  async getUserStatistics(
    userIds: number[] | null,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<ApiResponse<UserStatisticsDTO>> {
    const params = new URLSearchParams();
    if (userIds && userIds.length > 0) {
      userIds.forEach(userId => params.append('userIds', userId.toString()));
    }
    if (startDate) {
      params.append('startDate', startDate);
    }
    if (endDate) {
      params.append('endDate', endDate);
    }
    const queryString = params.toString();
    const url = `/api/admin/users/statistics${queryString ? `?${queryString}` : ''}`;
    return this.request<UserStatisticsDTO>(url);
  }

  // System status methods
  async getSystemStatus(): Promise<ApiResponse<SystemStatusResponse>> {
    // Добавляем заголовки для предотвращения кэширования
    return this.request<SystemStatusResponse>('/api/system/status', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }

  // Admin system status methods
  async getAdminSystemStatus(): Promise<ApiResponse<SystemStatusWithMetadata>> {
    return this.request<SystemStatusWithMetadata>('/api/admin/system/status');
  }

  async updateSystemStatus(request: SystemStatusRequest): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/admin/system/status', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async getSystemStatusHistory(limit: number = 50): Promise<ApiResponse<SystemStatusHistoryDTO[]>> {
    return this.request<SystemStatusHistoryDTO[]>(`/api/admin/system/history?limit=${limit}`);
  }

  // Generation providers methods
  async getGenerationProviders(): Promise<ApiResponse<GenerationProviderDTO[]>> {
    return this.request<GenerationProviderDTO[]>('/api/admin/generation-providers');
  }

  async setActiveProvider(provider: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/api/admin/generation-providers/active', {
      method: 'PUT',
      body: JSON.stringify({ provider }),
    });
  }
}

// Экспортируем singleton instance
export const apiClient = new ApiClient();
