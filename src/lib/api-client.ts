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
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ImageRequest {
  prompt: string;
  inputImageUrls?: string[];
  numImages?: number;
  outputFormat?: 'JPEG' | 'PNG';
  sessionId?: number;
}

export interface ImageResponse {
  description: string;
  imageUrls: string[];
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
  iterationNumber: number;
  createdAt: string;
  imageCount: number;
  outputFormat: string;
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
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  points?: number;
  avatar?: string;
  createdAt?: string;
  emailVerified?: boolean;
}

export interface ImageGenerationHistory {
  imageUrl: string;
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
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  message: string;
  status: string;
  messageId?: string;
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
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;

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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
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
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || data.error || 'Произошла ошибка',
          status: response.status,
        };
      }

      return {
        data,
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

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Image Generation API
  async generateImage(request: ImageRequest): Promise<ApiResponse<ImageResponse>> {
    return this.request<ImageResponse>('/api/fal/image/run/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
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
    // Если filename уже полный URL, возвращаем как есть
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    // Если filename начинается с /files/, используем напрямую (для аватаров и других файлов)
    if (filename.startsWith('/files/')) {
      return `${this.baseUrl}${filename}`;
    }
    // Иначе добавляем /files/ к filename
    return `${this.baseUrl}/files/${filename}`;
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
    const url = `${this.baseUrl}/api/fal/user/points`;
    const token = this.getToken();
    
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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
        const errorData = await response.json();
        return {
          error: errorData.message || errorData.error || 'Ошибка получения баланса',
          status: response.status,
        };
      }

      const points = await response.json();
      return {
        data: points,
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
        error: error.message || 'Ошибка получения баланса',
        status: 0,
      };
    }
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

}

// Экспортируем singleton instance
export const apiClient = new ApiClient();
