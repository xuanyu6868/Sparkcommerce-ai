/**
 * API 服务层
 * 接入后端 Express + Prisma API
 */

const API_BASE = (() => {
  const envBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;
  if (envBase && envBase.trim()) return envBase.trim().replace(/\/+$/, '');
  return '/api';
})();

// ============ 类型定义 ============

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role?: string;
  tier: string;
  credits: number;
  totalCredits: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  assembledPrompt?: string;
  aspectRatio: string;
  createdAt: string;
}

export interface GenerateResponse {
  message: string;
  image: GeneratedImage;
  remainingCredits: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  credits: number;
  generationCount: number;
  features: string[];
  isPopular: boolean;
}

export interface PlansResponse {
  plans: Plan[];
  creditsPerGeneration: number;
}

export interface UsageStats {
  usage: {
    remaining: number;
    total: number;
    used: number;
    imageCount: number;
  };
}

// ============ Token 管理 ============

const TOKEN_KEY = 'spark_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ============ API 客户端 ============

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '网络错误' }));
    throw new Error(error.error || `请求失败: ${response.status}`);
  }

  return response.json();
}

// ============ 认证 API ============

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setToken(data.token);
    return data;
  },

  async me(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  logout(): void {
    removeToken();
  },
};

// ============ 用户 API ============

export const userApi = {
  async getProfile(): Promise<{ user: User }> {
    return request<{ user: User }>('/users/profile');
  },

  async updateProfile(data: { name?: string; avatar?: string; bio?: string }): Promise<{ user: User }> {
    return request<{ user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getUsage(): Promise<UsageStats> {
    return request<UsageStats>('/users/usage');
  },

  async redeem(key: string): Promise<{ message: string; creditsAdded: number; currentCredits: number }> {
    return request<{ message: string; creditsAdded: number; currentCredits: number }>('/users/redeem', {
      method: 'POST',
      body: JSON.stringify({ key }),
    });
  },
};

// ============ 图片生成 API ============

export const imageApi = {
  async generate(params: {
    prompt: string;
    aspectRatio?: string;
    engineStyle?: string;
    mainImageStyle?: string;
    detailStyle?: string;
    commerceStyle?: string;
    isMainImage?: boolean;
  }): Promise<GenerateResponse> {
    return request<GenerateResponse>('/images/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: params.prompt,
        aspectRatio: params.aspectRatio || '1:1',
        engineStyle: params.engineStyle || 'none',
        mainImageStyle: params.mainImageStyle || 'none',
        detailStyle: params.detailStyle || 'none',
        commerceStyle: params.commerceStyle || 'none',
        isMainImage: params.isMainImage !== false,
      }),
    });
  },

  async list(page = 1, limit = 20): Promise<{ images: GeneratedImage[]; pagination: any }> {
    return request<{ images: GeneratedImage[]; pagination: any }>(
      `/images?page=${page}&limit=${limit}`
    );
  },

  async getOne(id: string): Promise<any> {
    return request<any>(`/images/${id}`);
  },

  async delete(id: string): Promise<any> {
    return request<any>(`/images/${id}`, { method: 'DELETE' });
  },

  async togglePublic(id: string): Promise<any> {
    return request<any>(`/images/${id}/public`, { method: 'PATCH' });
  },

  async like(id: string): Promise<{ liked: boolean }> {
    return request<{ liked: boolean }>(`/images/${id}/like`, { method: 'POST' });
  },
};

// ============ 定价 API ============

export const pricingApi = {
  async getPlans(): Promise<PlansResponse> {
    return request<PlansResponse>('/pricing/plans');
  },
};

// ============ 订单 API ============

export const orderApi = {
  async createOrder(plan: string): Promise<{ order: any; paymentUrl: string }> {
    return request<{ order: any; paymentUrl: string }>('/orders/create', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  },

  async list(): Promise<{ orders: any[] }> {
    return request<{ orders: any[] }>('/orders/list');
  },

  async getOne(orderNo: string): Promise<{ order: any }> {
    return request<{ order: any }>(`/orders/${orderNo}`);
  },
};

// ============ 社区 API ============

export const communityApi = {
  async getImages(params?: { page?: number; limit?: number; style?: string; sort?: string }): Promise<{ images: any[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.style) query.set('style', params.style);
    if (params?.sort) query.set('sort', params.sort);
    return request<{ images: any[]; pagination: any }>(`/community/images?${query}`);
  },

  async getLeaderboard(): Promise<{ leaderboard: any[] }> {
    return request<{ leaderboard: any[] }>('/community/leaderboard');
  },

  async getInspiration(limit = 6): Promise<{ images: any[] }> {
    return request<{ images: any[] }>(`/community/inspiration?limit=${limit}`);
  },

  async getStyles(): Promise<{ styles: { id: string; name: string }[] }> {
    return request<{ styles: { id: string; name: string }[] }>('/community/styles');
  },
};

// ============ 管理员 API ============

export const adminApi = {
  async generateKeys(count: number, credits: number, plan: string): Promise<{ keys: any[] }> {
    return request<{ keys: any[] }>('/admin/keys/generate', {
      method: 'POST',
      body: JSON.stringify({ count, credits, plan }),
    });
  },

  async getKeys(params?: { used?: boolean; page?: number }): Promise<{ keys: any[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.used !== undefined) query.set('used', String(params.used));
    if (params?.page) query.set('page', String(params.page));
    return request<{ keys: any[]; pagination: any }>(`/admin/keys?${query}`);
  },

  async getUsers(): Promise<{ users: any[]; pagination: any }> {
    return request<{ users: any[]; pagination: any }>('/admin/users');
  },
};
