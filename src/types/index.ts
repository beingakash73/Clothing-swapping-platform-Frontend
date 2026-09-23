export type ClothingCondition = 'new_with_tags' | 'like_new' | 'gently_used' | 'worn_with_love';

export type BrandTier = 'luxury' | 'designer_sustainable' | 'premium' | 'high_street' | 'vintage' | 'fast_fashion';

export type Category = 
  | 'Jackets & Coats' 
  | 'Sweaters & Knitwear' 
  | 'Dresses & Jumpsuits' 
  | 'Tops & Shirts' 
  | 'Pants & Denim' 
  | 'Skirts & Shorts' 
  | 'Footwear' 
  | 'Bags & Accessories';

export type GenderFit = 'Women' | 'Men' | 'Unisex' | 'Kids';

export interface ClothingItem {
  id: string;
  title: string;
  description: string;
  brand: string;
  brandTier: BrandTier;
  category: Category;
  subcategory?: string;
  size: string;
  gender: GenderFit;
  condition: ClothingCondition;
  conditionNotes?: string;
  material?: string;
  color: string;
  originalPrice: number;
  estimatedSwapValue: number; // in swap credits / dollar equivalent
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerCity: string;
  ownerState: string;
  ownerRating: number;
  ownerSwapsCount: number;
  coordinates: { lat: number; lng: number };
  status: 'available' | 'in_negotiation' | 'swapped' | 'reserved';
  tags: string[];
  ecoSavedKgCo2: number;
  ecoSavedLitersWater: number;
  imageUrl?: string;
  imagePublicId?: string;
  createdAt: string;
  distanceKm?: number;
}

export type ClothesUploadDto = ClothingItem;

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
  bio: string;
  location: {
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  completedSwaps: number;
  ecoScore: number;
  waterSavedLiters: number;
  co2SavedKg: number;
  wasteDivertedKg: number;
  badges: UserBadge[];
  closetItemIds: string[];
  joinedDate: string;
}

export type SwapStatus = 
  | 'pending' 
  | 'negotiating' 
  | 'accepted' 
  | 'shipped' 
  | 'completed' 
  | 'rejected' 
  | 'cancelled';

export type ExchangeMethod = 'local_meetup' | 'courier_shipping';

export interface MeetupLocation {
  name: string;
  address: string;
  type: 'safe_hub' | 'cafe' | 'community_center' | 'transit_hub';
  lat: number;
  lng: number;
}

export interface SwapProposal {
  id: string;
  requesterId: string;
  receiverId: string;
  requestedItemId: string;
  offeredItemIds: string[];
  status: SwapStatus;
  exchangeMethod: ExchangeMethod;
  meetupLocation?: MeetupLocation;
  trackingNumber?: string;
  carrierName?: string;
  initialMessage: string;
  fairnessScore: number; // 0 - 100 percentage
  valueDifference: number;
  requesterConfirmedAt?: string;
  receiverConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  swapId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
  actionData?: {
    type: 'counter_offer' | 'method_selected' | 'agreement_confirmed' | 'item_shipped' | 'swap_completed';
    details?: any;
  };
}

export interface Dispute {
  id: string;
  swapId: string;
  reporterId: string;
  reportedUserId: string;
  reason: 'item_condition_mismatch' | 'non_delivery' | 'counterfeit' | 'unresponsive_user' | 'other';
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  resolutionNotes?: string;
  createdAt: string;
}

export interface PlatformKPIs {
  totalUsers: number;
  activeListings: number;
  completedSwaps: number;
  totalKgWasteDiverted: number;
  totalLitersWaterSaved: number;
  totalKgCo2Avoided: number;
  swapSuccessRate: number;
}
