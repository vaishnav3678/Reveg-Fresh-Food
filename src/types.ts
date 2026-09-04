export type ProductCategory = 'all' | 'diwali' | 'sweets' | 'namkeen' | 'festive';

export interface Product {
  id: string;
  name: string;
  category: 'diwali' | 'sweets' | 'namkeen';
  secondaryCategories?: string[];
  description: string;
  detailedDescription?: string;
  image: string;
  isPopular?: boolean;
  isFestiveSpecial?: boolean;
  packSizes: string[];
  tasteProfile?: string;
  ingredientsHighlight?: string[];
  texture?: string;
}

export interface FestivalCategory {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  iconName: string;
  items: string[];
  sampleProducts: string[];
}

export interface GiftBoxTier {
  id: string;
  name: string;
  capacity: number;
  badge: string;
  description: string;
  recommendedFor: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'pending' | 'completed' | 'cancelled';

export interface CustomerInquiry {
  id: string;
  inquiryId: string;
  customerName: string;
  phone: string;
  email?: string;
  product?: string;
  quantity?: string;
  message: string;
  source: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryStats {
  total: number;
  newCount: number;
  pendingCount: number;
  contactedCount: number;
  completedCount: number;
  cancelledCount: number;
  todayCount: number;
  thisWeekCount: number;
  thisMonthCount: number;
}
