import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { 
  MOCK_ITEMS, 
  MOCK_USERS, 
  MOCK_SWAP_PROPOSALS, 
  MOCK_MESSAGES, 
  MOCK_DISPUTES, 
  PLATFORM_KPIS 
} from '../data/mockData';
import { evaluateSwapFairness } from '../utils/calculator';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  items: ClothingItem[];
  swaps: SwapProposal[];
  messages: ChatMessage[];
  disputes: Dispute[];
  kpis: PlatformKPIs;
  activeSwapModalItem: ClothingItem | null;
  toastMessage: string | null;
  isApiConnected: boolean;
  isLoading: boolean;
  // Auth & User Actions
  login: (emailOrId: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: { name: string; email: string; city: string; state: string; bio?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  openSwapModal: (item: ClothingItem) => void;
  closeSwapModal: () => void;
  addClothingItem: (itemData: Partial<ClothingItem>, files?: File[]) => Promise<ClothingItem>;
  updateClothingItem: (itemId: string, updates: Partial<ClothingItem>) => void;
  deleteClothingItem: (itemId: string) => void;
  proposeSwap: (
    requestedItemId: string, 
    offeredItemIds: string[], 
    exchangeMethod: ExchangeMethod, 
    initialMessage: string, 
    meetupLocation?: MeetupLocation
  ) => SwapProposal | null;
  acceptSwap: (swapId: string) => void;
  rejectSwap: (swapId: string) => void;
  confirmAgreement: (swapId: string) => void;
  completeSwap: (swapId: string) => void;
  sendMessage: (swapId: string, text: string) => void;
  resolveDispute: (disputeId: string, notes: string) => void;
  deleteListingAsAdmin: (itemId: string) => void;
  showToast: (msg: string) => void;
  resetToSampleData: () => void;
  refreshFromApi: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'threadloop_users_v1',
  CURRENT_USER_ID: 'threadloop_current_user_id_v1',
  ITEMS: 'threadloop_items_v1',
  SWAPS: 'threadloop_swaps_v1',
  MESSAGES: 'threadloop_messages_v1',
  DISPUTES: 'threadloop_disputes_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (saved === 'null' || saved === 'undefined' || saved === '') return null;
    return saved || 'user_maya';
  });

  const [items, setItems] = useState<ClothingItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return saved ? JSON.parse(saved) : MOCK_ITEMS;
  });

  const [swaps, setSwaps] = useState<SwapProposal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SWAPS);
    return saved ? JSON.parse(saved) : MOCK_SWAP_PROPOSALS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : MOCK_MESSAGES;
  });

  const [disputes, setDisputes] = useState<Dispute[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISPUTES);
    return saved ? JSON.parse(saved) : MOCK_DISPUTES;
  });

  const [liveKpis, setLiveKpis] = useState<PlatformKPIs | null>(null);
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activeSwapModalItem, setActiveSwapModalItem] = useState<ClothingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SWAPS, JSON.stringify(swaps));
  }, [swaps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(disputes));
  }, [disputes]);

  // Initial fetch and sync from Backend REST API (Spring Boot + MongoDB)
  const refreshFromApi = useCallback(async () => {
    try {
      const health = await api.checkHealth();
      if (health.status === 'ok') {
        setIsApiConnected(true);
        const [fetchedUsers, fetchedItems, fetchedSwaps, fetchedDisputes, fetchedKpis] = await Promise.all([
          api.users.getAll().catch(() => null),
          api.items.getAll().catch(() => null),
          api.swaps.getAll().catch(() => null),
          api.disputes.getAll().catch(() => null),
          api.getKPIs().catch(() => null),
        ]);

        if (fetchedUsers && fetchedUsers.length > 0) setUsers(fetchedUsers);
        if (fetchedItems && fetchedItems.length > 0) setItems(fetchedItems);
        if (fetchedSwaps && fetchedSwaps.length > 0) setSwaps(fetchedSwaps);
        if (fetchedDisputes && fetchedDisputes.length > 0) setDisputes(fetchedDisputes as any);
        if (fetchedKpis) setLiveKpis(fetchedKpis);
      } else {
        setIsApiConnected(false);
      }
    } catch (e) {
      console.log('API running in local offline cache mode:', e);
      setIsApiConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await refreshFromApi();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [refreshFromApi]);

  const currentUser = currentUserId ? (users.find(u => u.id === currentUserId) || null) : null;
  const isAuthenticated = !!currentUser;

  const login = async (emailOrId: string, _password?: string): Promise<{ success: boolean; message?: string }> => {
    const trimmed = emailOrId.trim().toLowerCase();
    const found = users.find(u => 
      u.id.toLowerCase() === trimmed || 
      u.email.toLowerCase() === trimmed ||
      u.name.toLowerCase() === trimmed
    );
    if (found) {
      setCurrentUserId(found.id);
      showToast(`Welcome back, ${found.name}! 🎉`);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials. Please select a demo persona or create an account.' };
  };

  const register = async (userData: { name: string; email: string; city: string; state: string; bio?: string }): Promise<{ success: boolean; message?: string }> => {
    const newUserId = `user_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: userData.name,
      email: userData.email,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: userData.bio || 'Passionate about circular fashion & zero waste garment exchange.',
      location: {
        city: userData.city || 'New York',
        state: userData.state || 'NY',
        zip: '10001',
        lat: 40.7128,
        lng: -74.0060,
      },
      rating: 5.0,
      reviewCount: 0,
      completedSwaps: 0,
      ecoScore: 100,
      waterSavedLiters: 0,
      co2SavedKg: 0,
      wasteDivertedKg: 0,
      badges: [{
        id: 'badge_welcome',
        name: 'Circular Pioneer',
        icon: '🌱',
        description: 'Joined the zero-waste garment exchange community.',
        unlockedAt: new Date().toISOString(),
      }],
      closetItemIds: [],
      joinedDate: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUserId);
    showToast(`Welcome to ThreadLoop, ${newUser.name}! 🌿`);
    return { success: true };
  };

  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    showToast('You have been safely signed out. See you next time!');
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
      showToast(`Switched persona to ${found.name} (${found.role === 'admin' ? 'Admin' : 'User'})`);
    }
  };

  const openSwapModal = (item: ClothingItem) => {
    setActiveSwapModalItem(item);
  };

  const closeSwapModal = () => {
    setActiveSwapModalItem(null);
  };

  const addClothingItem = async (
    itemData: Partial<ClothingItem>,
    files?: File[]
  ): Promise<ClothingItem> => {
    const activeUser = currentUser || users[0];
    const newItemId = itemData.id || `item_${Date.now()}`;

    // 1) If files are provided and backend API is connected, upload to Cloudinary
    if (files && files.length > 0 && isApiConnected) {
      try {
        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));
        if (files[0]) formData.append('file', files[0]);

        if (itemData.title) formData.append('title', itemData.title);
        if (itemData.description) formData.append('description', itemData.description);
        if (itemData.brand) formData.append('brand', itemData.brand);
        if (itemData.brandTier) formData.append('brandTier', itemData.brandTier);
        if (itemData.category) formData.append('category', itemData.category);
        if (itemData.subcategory) formData.append('subcategory', itemData.subcategory);
        if (itemData.size) formData.append('size', itemData.size);
        if (itemData.gender) formData.append('gender', itemData.gender);
        if (itemData.condition) formData.append('condition', itemData.condition);
        if (itemData.conditionNotes) formData.append('conditionNotes', itemData.conditionNotes);
        if (itemData.material) formData.append('material', itemData.material);
        if (itemData.color) formData.append('color', itemData.color);
        if (itemData.originalPrice !== undefined) formData.append('originalPrice', String(itemData.originalPrice));
        if (itemData.estimatedSwapValue !== undefined) formData.append('estimatedSwapValue', String(itemData.estimatedSwapValue));
        if (itemData.tags && itemData.tags.length > 0) {
          itemData.tags.forEach((t) => formData.append('tags', t));
        }
        formData.append('ownerId', activeUser.id);

        const uploadedItem = await api.clothes.upload(formData);

        setItems((prev) => [uploadedItem, ...prev]);
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === activeUser.id) {
              return {
                ...u,
                closetItemIds: [...u.closetItemIds, uploadedItem.id],
              };
            }
            return u;
          })
        );

        showToast(`"${uploadedItem.title}" uploaded to Cloudinary & published! ☁️✨`);
        return uploadedItem;
      } catch (err: any) {
        console.warn('Cloudinary upload via backend failed, using fallback:', err);
        showToast(err.message || 'Upload to Cloudinary encountered an issue, saving locally.');
      }
    }

    // 2) Fallback or preset/URL creation
    const previewUrl = files && files[0]
      ? URL.createObjectURL(files[0])
      : (itemData.images && itemData.images.length > 0 ? itemData.images[0] : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80');

    const newItem: ClothingItem = {
      id: newItemId,
      title: itemData.title || 'Untitled Garment',
      description: itemData.description || '',
      brand: itemData.brand || 'Unbranded',
      brandTier: itemData.brandTier || 'high_street',
      category: itemData.category || 'Tops & Shirts',
      subcategory: itemData.subcategory || '',
      size: itemData.size || 'M',
      gender: itemData.gender || 'Unisex',
      condition: itemData.condition || 'gently_used',
      conditionNotes: itemData.conditionNotes || '',
      material: itemData.material || 'Cotton blend',
      color: itemData.color || 'Neutral',
      originalPrice: itemData.originalPrice || 100,
      estimatedSwapValue: itemData.estimatedSwapValue || 50,
      images: itemData.images && itemData.images.length > 0
        ? itemData.images
        : [previewUrl],
      imageUrl: itemData.imageUrl || previewUrl,
      ownerId: activeUser.id,
      ownerName: activeUser.name,
      ownerAvatar: activeUser.avatar,
      ownerCity: activeUser.location.city,
      ownerState: activeUser.location.state,
      ownerRating: activeUser.rating,
      ownerSwapsCount: activeUser.completedSwaps,
      coordinates: { lat: activeUser.location.lat, lng: activeUser.location.lng },
      status: 'available',
      tags: itemData.tags || ['Pre-loved', 'Sustainable'],
      ecoSavedKgCo2: Math.round(((itemData.originalPrice || 100) * 0.04) * 10) / 10,
      ecoSavedLitersWater: Math.round((itemData.originalPrice || 100) * 18),
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);

    // Update user's closet item list
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === activeUser.id) {
          return {
            ...u,
            closetItemIds: [...u.closetItemIds, newItemId],
          };
        }
        return u;
      })
    );

    // Persist to API database
    if (isApiConnected) {
      api.items.create({ ...newItem, ownerId: activeUser.id }).catch((err) => {
        console.error('Failed to sync item to API:', err);
      });
    }

    showToast(`"${newItem.title}" was added to your closet!`);
    return newItem;
  };

  const updateClothingItem = (itemId: string, updates: Partial<ClothingItem>) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item)));
    if (isApiConnected) {
      api.items.update(itemId, updates).catch((err) => console.error('API update item error:', err));
    }
    showToast('Listing updated successfully.');
  };

  const deleteClothingItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        closetItemIds: u.closetItemIds.filter((id) => id !== itemId),
      }))
    );
    if (isApiConnected) {
      // Delete through clothes endpoint which destroys Cloudinary asset and deletes from MongoDB
      api.clothes.delete(itemId).catch(() => {
        api.items.delete(itemId).catch((err) => console.error('API delete item error:', err));
      });
    }
    showToast('Listing removed from marketplace and Cloudinary.');
  };

  const deleteListingAsAdmin = (itemId: string) => {
    deleteClothingItem(itemId);
    showToast('Moderation action: Listing removed for community compliance.');
  };

  const proposeSwap = (
    requestedItemId: string,
    offeredItemIds: string[],
    exchangeMethod: ExchangeMethod,
    initialMessage: string,
    meetupLocation?: MeetupLocation
  ): SwapProposal | null => {
    if (!currentUser) {
      showToast('Please sign in to propose a swap!');
      return null;
    }

    const requestedItem = items.find(i => i.id === requestedItemId);
    if (!requestedItem) throw new Error('Target item not found');

    const offeredItems = items.filter(i => offeredItemIds.includes(i.id));
    const offeredTotalValue = offeredItems.reduce((sum, item) => sum + item.estimatedSwapValue, 0);

    const fairness = evaluateSwapFairness(requestedItem.estimatedSwapValue, offeredTotalValue);

    const newSwapId = `swap_${Date.now()}`;
    const newSwap: SwapProposal = {
      id: newSwapId,
      requesterId: currentUser.id,
      receiverId: requestedItem.ownerId,
      requestedItemId,
      offeredItemIds,
      status: 'pending',
      exchangeMethod,
      meetupLocation,
      initialMessage,
      fairnessScore: fairness.score,
      valueDifference: fairness.difference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSwaps(prev => [newSwap, ...prev]);

    // Create the initial chat message
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      swapId: newSwapId,
      senderId: currentUser.id,
      text: initialMessage || `Hi! I'd love to swap my ${offeredItems.map(i => i.title).join(' and ')} for your ${requestedItem.title}.`,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);

    // Mark offered item as in_negotiation
    setItems(prev => prev.map(i => {
      if (offeredItemIds.includes(i.id)) {
        return { ...i, status: 'in_negotiation' };
      }
      return i;
    }));

    // Sync to Backend API
    if (isApiConnected) {
      api.swaps.propose({
        requesterId: currentUser.id,
        requestedItemId,
        offeredItemIds,
        exchangeMethod,
        initialMessage,
        meetupLocation,
      }).catch(err => console.error('API propose swap error:', err));
    }

    closeSwapModal();
    showToast('Swap request sent successfully! Persisted to database.');
    return newSwap;
  };

  const acceptSwap = (swapId: string) => {
    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        return { ...s, status: 'negotiating', updatedAt: new Date().toISOString() };
      }
      return s;
    }));

    const swap = swaps.find(s => s.id === swapId);
    if (swap) {
      const systemMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        swapId: swap.id,
        senderId: currentUser?.id || 'user_unknown',
        text: `Accepted the swap request! Let's finalize the exchange details (meetup or shipping).`,
        timestamp: new Date().toISOString(),
        isSystem: true,
      };
      setMessages(prev => [...prev, systemMsg]);
    }

    if (isApiConnected && currentUser) {
      api.swaps.updateStatus(swapId, 'accept', { userId: currentUser.id }).catch(err =>
        console.error('API accept swap error:', err)
      );
    }

    showToast('Swap proposal accepted! You can now coordinate exchange in chat.');
  };

  const rejectSwap = (swapId: string) => {
    const swap = swaps.find(s => s.id === swapId);
    if (swap) {
      // Revert items back to available
      setItems(prev => prev.map(i => {
        if (swap.offeredItemIds.includes(i.id)) {
          return { ...i, status: 'available' };
        }
        return i;
      }));
    }

    setSwaps(prev => prev.map(s => s.id === swapId ? { ...s, status: 'rejected', updatedAt: new Date().toISOString() } : s));

    if (isApiConnected) {
      api.swaps.updateStatus(swapId, 'reject').catch(err => console.error('API reject swap error:', err));
    }

    showToast('Swap request declined.');
  };

  const confirmAgreement = (swapId: string) => {
    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        const isRequester = s.requesterId === (currentUser?.id || '');
        const now = new Date().toISOString();
        const updated = {
          ...s,
          requesterConfirmedAt: isRequester ? now : s.requesterConfirmedAt,
          receiverConfirmedAt: !isRequester ? now : s.receiverConfirmedAt,
          updatedAt: now,
          status: 'accepted' as const,
        };
        return updated;
      }
      return s;
    }));

    const systemMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      swapId,
      senderId: currentUser?.id || 'user_unknown',
      text: `🤝 Swap agreement confirmed by ${currentUser?.name || 'User'}! Items are locked in for exchange.`,
      timestamp: new Date().toISOString(),
      isSystem: true,
    };
    setMessages(prev => [...prev, systemMsg]);

    if (isApiConnected && currentUser) {
      api.swaps.updateStatus(swapId, 'confirmAgreement', { userId: currentUser.id }).catch(err =>
        console.error('API confirm agreement error:', err)
      );
    }

    showToast('Swap agreement locked! Ready for pickup or shipping.');
  };

  const completeSwap = (swapId: string) => {
    const swap = swaps.find(s => s.id === swapId);
    if (!swap) return;

    // Trigger confetti celebration!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#15803d', '#f59e0b', '#3b82f6', '#ec4899']
      });
    } catch {
      // ignore
    }

    // Update swap status
    setSwaps(prev => prev.map(s => s.id === swapId ? { ...s, status: 'completed', updatedAt: new Date().toISOString() } : s));

    // Update items status to swapped
    setItems(prev => prev.map(i => {
      if (i.id === swap.requestedItemId || swap.offeredItemIds.includes(i.id)) {
        return { ...i, status: 'swapped' };
      }
      return i;
    }));

    // Reward users with eco impact metrics & completed swaps count
    setUsers(prev => prev.map(u => {
      if (u.id === swap.requesterId || u.id === swap.receiverId) {
        return {
          ...u,
          completedSwaps: u.completedSwaps + 1,
          ecoScore: u.ecoScore + 50,
          waterSavedLiters: u.waterSavedLiters + 2700,
          co2SavedKg: Math.round((u.co2SavedKg + 5.5) * 10) / 10,
          wasteDivertedKg: Math.round((u.wasteDivertedKg + 1.2) * 10) / 10,
        };
      }
      return u;
    }));

    const systemMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      swapId,
      senderId: currentUser?.id || 'user_unknown',
      text: `🎉 Swap completed! 2 garments diverted from landfills and 5,400L water conserved. Leave a review!`,
      timestamp: new Date().toISOString(),
      isSystem: true,
    };
    setMessages(prev => [...prev, systemMsg]);

    if (isApiConnected && currentUser) {
      api.swaps.updateStatus(swapId, 'complete', { userId: currentUser.id }).catch(err =>
        console.error('API complete swap error:', err)
      );
    }

    showToast('Congratulations! Swap successfully completed and logged to your eco impact!');
  };

  const sendMessage = (swapId: string, text: string) => {
    if (!text.trim()) return;
    const currentId = currentUser?.id || 'user_unknown';
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      swapId,
      senderId: currentId,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);

    if (isApiConnected && currentUser) {
      api.messages.send({ swapId, senderId: currentUser.id, text }).then((_dbMsg) => {
        // Refresh message list from API
        api.messages.getBySwap(swapId).then(list => setMessages(list)).catch(() => {});
      }).catch(err => console.error('API send message error:', err));
    } else {
      // Offline simulated counterparty response
      const swap = swaps.find(s => s.id === swapId);
      if (swap) {
        const otherUserId = swap.requesterId === currentId ? swap.receiverId : swap.requesterId;
        const otherUser = users.find(u => u.id === otherUserId);
        if (otherUser && otherUser.role !== 'admin') {
          setTimeout(() => {
            const autoReplies = [
              `Sounds great! I'll prepare the garment carefully and steam it before we trade.`,
              `Checked my schedule, meeting at the local swap hub works perfectly for me.`,
              `I appreciate the transparent value trade! Excited to give this piece a second life.`
            ];
            const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
            const replyMsg: ChatMessage = {
              id: `msg_${Date.now() + 1}`,
              swapId,
              senderId: otherUserId,
              text: randomReply,
              timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, replyMsg]);
          }, 1500);
        }
      }
    }
  };

  const resolveDispute = (disputeId: string, notes: string) => {
    setDisputes(prev => prev.map(d => d.id === disputeId ? {
      ...d,
      status: 'resolved',
      resolutionNotes: notes,
    } : d));

    if (isApiConnected) {
      api.disputes.resolve(disputeId, notes).catch(err => console.error('API resolve dispute error:', err));
    }

    showToast('Dispute marked as resolved.');
  };

  const resetToSampleData = async () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.SWAPS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.DISPUTES);

    if (isApiConnected) {
      try {
        await api.resetDatabase();
        await refreshFromApi();
        showToast('Database reset and re-seeded to pristine sample data!');
        return;
      } catch (err) {
        console.error('Failed to reset DB via API:', err);
      }
    }

    setUsers(MOCK_USERS);
    setCurrentUserId('user_maya');
    setItems(MOCK_ITEMS);
    setSwaps(MOCK_SWAP_PROPOSALS);
    setMessages(MOCK_MESSAGES);
    setDisputes(MOCK_DISPUTES);
    showToast('Marketplace state reset to pristine sample data.');
  };

  // Compute live KPIs
  const completedSwapsCount = swaps.filter(s => s.status === 'completed').length;
  const kpis: PlatformKPIs = liveKpis || {
    ...PLATFORM_KPIS,
    activeListings: items.filter(i => i.status === 'available').length,
    completedSwaps: PLATFORM_KPIS.completedSwaps + completedSwapsCount,
    totalKgWasteDiverted: PLATFORM_KPIS.totalKgWasteDiverted + (completedSwapsCount * 2.4),
    totalLitersWaterSaved: PLATFORM_KPIS.totalLitersWaterSaved + (completedSwapsCount * 5400),
    totalKgCo2Avoided: PLATFORM_KPIS.totalKgCo2Avoided + (completedSwapsCount * 11),
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        users,
        items,
        swaps,
        messages,
        disputes,
        kpis,
        activeSwapModalItem,
        toastMessage,
        isApiConnected,
        isLoading,
        login,
        register,
        logout,
        switchUser,
        openSwapModal,
        closeSwapModal,
        addClothingItem,
        updateClothingItem,
        deleteClothingItem,
        proposeSwap,
        acceptSwap,
        rejectSwap,
        confirmAgreement,
        completeSwap,
        sendMessage,
        resolveDispute,
        deleteListingAsAdmin,
        showToast,
        resetToSampleData,
        refreshFromApi,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
