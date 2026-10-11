import {
  ClothingItem,
  User,
  SwapProposal,
  ChatMessage,
  Dispute,
  PlatformKPIs,
  ExchangeMethod,
  MeetupLocation
} from '../types';

/**
 * Normalizes host and base API paths so whether VITE_API_BASE_URL includes or omits `/api`
 * (or trailing slashes), routes are resolved properly without `/api/api` duplicate path errors.
 */
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

// If configured with e.g. "https://api.example.com/api", HOST_BASE is "https://api.example.com"
export const HOST_BASE = RAW_BASE.endsWith('/api') ? RAW_BASE.slice(0, -4) : RAW_BASE;
export const API_BASE = RAW_BASE.endsWith('/api') ? RAW_BASE : (RAW_BASE ? `${RAW_BASE}/api` : '/api');

export const TOKEN_STORAGE_KEY = 'threadloop_jwt_token';

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // storage unavailable
    }
  },
  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // storage unavailable
    }
  },
};

/**
 * Resolves an endpoint path to an absolute or normalized URL:
 * - /health or other root routes resolve to HOST_BASE (e.g. /health)
 * - /api/... routes resolve to HOST_BASE/api/...
 * - relative routes (e.g. /items) resolve to API_BASE/items
 */
export function resolveEndpointUrl(endpoint: string): string {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (clean.startsWith('/health')) {
    return `${HOST_BASE}${clean}`;
  }

  if (clean.startsWith('/api/')) {
    return `${HOST_BASE}${clean}`;
  }

  return `${API_BASE}${clean}`;
}

// ==========================================
// DTO & Request/Response Types (matching Spring Boot)
// ==========================================

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  tokenType?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  city?: string;
  state?: string;
  zip?: string;
  bio?: string;
  avatar?: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  avatar?: string;
  location?: {
    city?: string;
    state?: string;
    zip?: string;
    lat?: number;
    lng?: number;
  };
}

export interface HealthCheckResponse {
  status: string;
  database: string;
  engine: string;
  totalUsers: number;
  timestamp: string;
}

export interface ItemFilterParams {
  category?: string;
  condition?: string;
  brandTier?: string;
  gender?: string;
  status?: string;
  search?: string;
  ownerId?: string;
}

export interface SwapFilterParams {
  userId?: string;
  status?: string;
}

export interface ProposeSwapRequest {
  requesterId: string;
  requestedItemId: string;
  offeredItemIds: string[];
  exchangeMethod: ExchangeMethod | string;
  initialMessage: string;
  meetupLocation?: MeetupLocation;
}

export type SwapStatusAction = 'accept' | 'reject' | 'confirmAgreement' | 'ship' | 'complete';

export interface SwapStatusUpdateRequest {
  action: SwapStatusAction;
  userId?: string;
  trackingNumber?: string;
  carrierName?: string;
}

export interface SendMessageRequest {
  swapId: string;
  senderId: string;
  text: string;
  actionData?: Record<string, any>;
}

export interface CreateDisputeRequest {
  swapId: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description: string;
}

export interface ResolveDisputeRequest {
  status?: string;
  resolutionNotes: string;
}

export interface DeleteItemResponse {
  success: boolean;
  message?: string;
  id?: string;
  error?: string;
}

// ==========================================
// Generic Fetch Wrapper
// ==========================================

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const url = resolveEndpointUrl(endpoint);
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message || errorData.error) {
        errorMsg = errorData.message || errorData.error;
      }
    } catch {
      // no JSON body
    }
    throw new Error(errorMsg);
  }

  // Handle empty or 204 No Content responses gracefully
  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
}

// ==========================================
// API Client Service
// ==========================================

export const api = {
  /**
   * Auth Controller: /api/auth
   * Endpoints:
   * - POST /api/auth/register
   * - POST /api/auth/login
   * - GET  /api/auth/me
   * - POST /api/auth/logout
   */
  auth: {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
      const res = await request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.success && res.token) {
        tokenStorage.set(res.token);
      }
      return res;
    },

    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const res = await request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (res.success && res.token) {
        tokenStorage.set(res.token);
      }
      return res;
    },

    me: (): Promise<AuthResponse> =>
      request<AuthResponse>('/api/auth/me'),

    logout: async (): Promise<AuthResponse> => {
      try {
        return await request<AuthResponse>('/api/auth/logout', {
          method: 'POST',
        });
      } finally {
        tokenStorage.clear();
      }
    },
  },

  /**
   * Health Controller: /health
   * Endpoints:
   * - GET /health
   */
  health: {
    check: (): Promise<HealthCheckResponse> =>
      request<HealthCheckResponse>('/health'),
  },
  // Backward-compatible alias
  checkHealth: (): Promise<HealthCheckResponse> =>
    request<HealthCheckResponse>('/health'),

  /**
   * KPI Controller: /api/kpis
   * Endpoints:
   * - GET /api/kpis
   */
  kpis: {
    get: (): Promise<PlatformKPIs> =>
      request<PlatformKPIs>('/api/kpis'),
  },
  // Backward-compatible alias
  getKPIs: (): Promise<PlatformKPIs> =>
    request<PlatformKPIs>('/api/kpis'),

  /**
   * Hub Controller: /api/hubs
   * Endpoints:
   * - GET /api/hubs
   */
  hubs: {
    getAll: (): Promise<MeetupLocation[]> =>
      request<MeetupLocation[]>('/api/hubs'),
  },
  // Backward-compatible alias
  getHubs: (): Promise<MeetupLocation[]> =>
    request<MeetupLocation[]>('/api/hubs'),

  /**
   * User Controller: /api/users
   * Endpoints:
   * - GET   /api/users
   * - GET   /api/users/{id}
   * - PATCH /api/users/{id}
   */
  users: {
    getAll: (): Promise<User[]> =>
      request<User[]>('/api/users'),

    getById: (id: string): Promise<User> =>
      request<User>(`/api/users/${id}`),

    update: (id: string, data: UpdateUserRequest | Partial<User>): Promise<User> =>
      request<User>(`/api/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  /**
   * Item Controller: /api/items
   * Endpoints:
   * - GET    /api/items
   * - GET    /api/items/{id}
   * - POST   /api/items
   * - PATCH  /api/items/{id}
   * - DELETE /api/items/{id}
   */
  items: {
    getAll: (filters?: ItemFilterParams): Promise<ClothingItem[]> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v && v !== 'all' && v !== 'All') {
            params.append(k, String(v));
          }
        });
      }
      const qs = params.toString() ? `?${params.toString()}` : '';
      return request<ClothingItem[]>(`/api/items${qs}`);
    },

    getById: (id: string): Promise<ClothingItem> =>
      request<ClothingItem>(`/api/items/${id}`),

    create: (data: Partial<ClothingItem>): Promise<ClothingItem> =>
      request<ClothingItem>('/api/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, updates: Partial<ClothingItem>): Promise<ClothingItem> =>
      request<ClothingItem>(`/api/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    delete: (id: string): Promise<DeleteItemResponse> =>
      request<DeleteItemResponse>(`/api/items/${id}`, {
        method: 'DELETE',
      }),
  },

  /**
   * Clothes Upload Controller: /api/clothes
   * Endpoints:
   * - GET    /api/clothes
   * - GET    /api/clothes/{id}
   * - POST   /api/clothes/upload (multipart with Cloudinary)
   * - POST   /api/clothes        (application/json)
   * - DELETE /api/clothes/{id}
   */
  clothes: {
    getAll: (): Promise<ClothingItem[]> =>
      request<ClothingItem[]>('/api/clothes'),

    getById: (id: string): Promise<ClothingItem> =>
      request<ClothingItem>(`/api/clothes/${id}`),

    upload: async (formData: FormData): Promise<ClothingItem> => {
      const token = tokenStorage.get();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const url = resolveEndpointUrl('/api/clothes/upload');
      const response = await fetch(url, {
        credentials: 'include',
        headers,
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `Upload failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message || errorData.error) {
            errorMsg = errorData.message || errorData.error;
          }
        } catch {
          // no body
        }
        throw new Error(errorMsg);
      }

      return response.json();
    },

    create: (data: Partial<ClothingItem>): Promise<ClothingItem> =>
      request<ClothingItem>('/api/clothes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    delete: (id: string): Promise<DeleteItemResponse> =>
      request<DeleteItemResponse>(`/api/clothes/${id}`, {
        method: 'DELETE',
      }),
  },

  /**
   * Swap Controller: /api/swaps
   * Endpoints:
   * - GET   /api/swaps
   * - GET   /api/swaps/{id}
   * - POST  /api/swaps
   * - PATCH /api/swaps/{id}/status
   */
  swaps: {
    getAll: (params?: SwapFilterParams): Promise<SwapProposal[]> => {
      const q = new URLSearchParams();
      if (params?.userId) q.append('userId', params.userId);
      if (params?.status) q.append('status', params.status);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return request<SwapProposal[]>(`/api/swaps${qs}`);
    },

    getById: (id: string): Promise<SwapProposal> =>
      request<SwapProposal>(`/api/swaps/${id}`),

    propose: (data: ProposeSwapRequest): Promise<SwapProposal> =>
      request<SwapProposal>('/api/swaps', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (
      id: string,
      action: SwapStatusAction,
      options?: { userId?: string; trackingNumber?: string; carrierName?: string }
    ): Promise<SwapProposal> =>
      request<SwapProposal>(`/api/swaps/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ action, ...options }),
      }),
  },

  /**
   * Message Controller: /api/messages
   * Endpoints:
   * - GET  /api/messages?swapId={swapId}
   * - POST /api/messages
   */
  messages: {
    getAll: (swapId?: string): Promise<ChatMessage[]> => {
      const qs = swapId ? `?swapId=${encodeURIComponent(swapId)}` : '';
      return request<ChatMessage[]>(`/api/messages${qs}`);
    },

    getBySwap: (swapId: string): Promise<ChatMessage[]> =>
      request<ChatMessage[]>(`/api/messages?swapId=${encodeURIComponent(swapId)}`),

    send: (data: SendMessageRequest): Promise<ChatMessage> =>
      request<ChatMessage>('/api/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  /**
   * Dispute Controller: /api/disputes
   * Endpoints:
   * - GET   /api/disputes
   * - POST  /api/disputes
   * - PATCH /api/disputes/{id}
   */
  disputes: {
    getAll: (): Promise<Dispute[]> =>
      request<Dispute[]>('/api/disputes'),

    create: (data: CreateDisputeRequest): Promise<Dispute> =>
      request<Dispute>('/api/disputes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    resolve: (id: string, notes: string, status = 'resolved'): Promise<Dispute> =>
      request<Dispute>(`/api/disputes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, resolutionNotes: notes }),
      }),
  },

  /**
   * Seed Controller: /api/seed
   * Endpoints:
   * - POST /api/seed
   */
  seed: {
    reset: (): Promise<{ success: boolean; message: string }> =>
      request<{ success: boolean; message: string }>('/api/seed', {
        method: 'POST',
      }),
  },
  // Backward-compatible alias
  resetDatabase: (): Promise<{ success: boolean; message: string }> =>
    request<{ success: boolean; message: string }>('/api/seed', {
      method: 'POST',
    }),
};
