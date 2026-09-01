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
