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

const API_BASE = '/api';

export interface HealthCheckResponse {
  status: string;
  database: string;
  engine: string;
  totalUsers: number;
  timestamp: string;
}

// Generic fetch wrapper with error handling
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
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

  return response.json();
}

export const api = {
  // Health & DB status
  checkHealth: (): Promise<HealthCheckResponse> => request<HealthCheckResponse>('/health'),

  // Platform KPIs
  getKPIs: (): Promise<PlatformKPIs> => request<PlatformKPIs>('/kpis'),

  // Safe Meetup Hubs
  getHubs: (): Promise<MeetupLocation[]> => request<MeetupLocation[]>('/hubs'),

  // Users
  users: {
    getAll: (): Promise<User[]> => request<User[]>('/users'),
    getById: (id: string): Promise<User> => request<User>(`/users/${id}`),
    update: (id: string, data: Partial<User>): Promise<User> => 
      request<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  // Clothing Items
  items: {
    getAll: (filters?: {
      category?: string;
      condition?: string;
      brandTier?: string;
      gender?: string;
      search?: string;
      ownerId?: string;
      status?: string;
    }): Promise<ClothingItem[]> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v && v !== 'all' && v !== 'All') params.append(k, v);
        });
      }
      const qs = params.toString() ? `?${params.toString()}` : '';
      return request<ClothingItem[]>(`/items${qs}`);
    },

    getById: (id: string): Promise<ClothingItem> => request<ClothingItem>(`/items/${id}`),

    create: (data: Partial<ClothingItem>): Promise<ClothingItem> =>
      request<ClothingItem>('/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, updates: Partial<ClothingItem>): Promise<ClothingItem> =>
      request<ClothingItem>(`/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    delete: (id: string): Promise<{ success: boolean; id: string }> =>
      request<{ success: boolean; id: string }>(`/items/${id}`, {
        method: 'DELETE',
      }),
  },

  // Swap Proposals
  swaps: {
    getAll: (params?: { userId?: string; status?: string }): Promise<SwapProposal[]> => {
      const qs = new URLSearchParams(params as any).toString();
      return request<SwapProposal[]>(`/swaps${qs ? `?${qs}` : ''}`);
    },

    getById: (id: string): Promise<SwapProposal> => request<SwapProposal>(`/swaps/${id}`),

    propose: (data: {
      requesterId: string;
      requestedItemId: string;
      offeredItemIds: string[];
      exchangeMethod: ExchangeMethod;
      initialMessage: string;
      meetupLocation?: MeetupLocation;
    }): Promise<SwapProposal> =>
      request<SwapProposal>('/swaps', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (
      id: string,
      action: 'accept' | 'reject' | 'confirmAgreement' | 'ship' | 'complete',
      options?: { userId?: string; trackingNumber?: string; carrierName?: string }
    ): Promise<SwapProposal> =>
      request<SwapProposal>(`/swaps/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ action, ...options }),
      }),
  },

  // Chat Messages
  messages: {
    getBySwap: (swapId: string): Promise<ChatMessage[]> =>
      request<ChatMessage[]>(`/messages?swapId=${swapId}`),

    send: (data: {
      swapId: string;
      senderId: string;
      text: string;
      actionData?: any;
    }): Promise<ChatMessage> =>
      request<ChatMessage>('/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Disputes & Moderation
  disputes: {
    getAll: (): Promise<Dispute[]> => request<Dispute[]>('/disputes'),

    create: (data: {
      swapId: string;
      reporterId: string;
      reportedUserId: string;
      reason: string;
      description: string;
    }): Promise<Dispute> =>
      request<Dispute>('/disputes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    resolve: (id: string, notes: string): Promise<Dispute> =>
      request<Dispute>(`/disputes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'resolved', resolutionNotes: notes }),
      }),
  },

  // Reset/Seed Database
  resetDatabase: (): Promise<{ success: boolean; message: string }> =>
    request<{ success: boolean; message: string }>('/seed', {
      method: 'POST',
    }),
};
