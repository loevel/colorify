
export type ImageSize = '1K' | '2K' | '4K';

export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  loading: boolean;
  palette?: string[]; // Array of hex color codes
  error?: string;
  createdAt?: number; // Added for sorting
}

export interface SavedPage {
  id: string;
  originalUrl: string; // The original black and white outline
  coloredUrl?: string; // The user's colored version (or the work in progress layer)
  thumbnailUrl: string; // For the library view
  theme: string;
  childName: string;
  createdAt: number;
  lastModified: number;
  palette: string[];
}

export type SubscriptionTier = 'free' | 'pro' | 'unlimited';

export interface Child {
  id: string;
  name: string;
  children?: never; // fix typescript structural typing issue if needed
}

export type AccountType = 'personal' | 'family';

export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  accountType: AccountType;
  children: Child[];
  isAdmin?: boolean; // New flag for admin access
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number; // Monthly price in cents for personal
  familyPrice: number; // Monthly price in cents for family
  description: string;
  features: PlanFeature[];
  highlight?: boolean;
}

export type ViewMode = 'generator' | 'library' | 'studio' | 'subscription' | 'privacy' | 'terms' | 'contact' | 'about' | 'admin';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GeneratorConfig {
  childName: string;
  theme: string;
  imageSize: ImageSize;
}

// Type declaration for the custom window property for API key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
