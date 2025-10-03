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
  imageUrls?: string[];
  numImages?: number;
  outputFormat?: 'JPEG' | 'PNG';
}

export interface ImageResponse {
  description: string;
  imageUrls: string[];
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

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    // На продакшене используем HTTPS через домен, на локальной разработке - HTTP
    this.baseUrl = process.env.NEXT_PUBLIC_JAVA_API_URL || 
      (typeof window !== 'undefined' && (window.location.hostname === '24reshai.ru' || window.location.hostname.includes('24reshai'))
        ? 'https://24reshai.ru' 
        : 'http://localhost:8080');
    this.timeout = parseInt(process.env.NEXT_PUBLIC_JAVA_API_TIMEOUT || '30000');
    
    // Отладочная информация (только в development)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('API Base URL:', this.baseUrl);
      console.log('Current hostname:', window.location.hostname);
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
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
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

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Image Generation API
  async generateImage(request: ImageRequest): Promise<ApiResponse<ImageResponse>> {
    return this.request<ImageResponse>('/fal/image/run/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // File Upload API
  async uploadFile(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseUrl}/files/upload`;
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

    const url = `${this.baseUrl}/users/avatar/upload`;
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
    const url = `${this.baseUrl}/users/avatar`;
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
    const url = `${this.baseUrl}/users/avatar`;
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
    // Если filename уже полный URL, заменяем HTTP на HTTPS и IP на домен
    if (filename.startsWith('http://')) {
      let url = filename.replace('http://', 'https://');
      // Заменяем IP адрес на домен для правильного SSL
      url = url.replace('213.171.4.47:8080', '24reshai.ru');
      return url;
    }
    if (filename.startsWith('https://')) {
      return filename;
    }
    // Если filename начинается с /files/, добавляем baseUrl
    if (filename.startsWith('/files/')) {
      return `${this.baseUrl}${filename}`;
    }
    // Иначе добавляем /files/ к filename
    return `${this.baseUrl}/files/${filename}`;
  }

  // User API
  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    return this.request<UserInfo>('/users/me');
  }

  async getImageHistory(): Promise<ApiResponse<ImageGenerationHistory[]>> {
    return this.request<ImageGenerationHistory[]>('/users/me/image-history');
  }

  // Get user points/balance
  async getUserPoints(): Promise<ApiResponse<number>> {
    const url = `${this.baseUrl}/fal/user/points`;
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
    return this.request<{message: string}>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ApiResponse<{message: string}>> {
    return this.request<{message: string}>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Pricing methods
  async getPricingPlans(): Promise<ApiResponse<PricingPlanResponse[]>> {
    return this.request<PricingPlanResponse[]>('/pricing/plans', {
      method: 'GET',
    });
  }

  async getAllPricingPlans(): Promise<ApiResponse<PricingPlanResponse[]>> {
    return this.request<PricingPlanResponse[]>('/pricing/plans/all', {
      method: 'GET',
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }
}

// Экспортируем singleton instance
export const apiClient = new ApiClient();
