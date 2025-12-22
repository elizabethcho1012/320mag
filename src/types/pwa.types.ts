// PWA App Types for CCC Directory Integration

export type ValidationStatus = 'pending' | 'validating' | 'approved' | 'rejected';
export type AppStatus = 'active' | 'hidden' | 'removed';
export type ReportReason = 'broken' | 'inappropriate' | 'spam' | 'misleading' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';
export type PricingType = 'free' | 'freemium' | 'paid' | 'subscription';

export interface LighthouseScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
  overallScore: number;
}

export interface Developer {
  name: string;
  email: string;
  website?: string;
}

export interface AppMetadata {
  manifest?: Record<string, any>;
  serviceWorkerUrl?: string;
  themeColor?: string;
}

export interface PWAApp {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  categories: string[];
  targetAudience?: string;
  pricing: PricingType;
  price?: number;
  developer: Developer;
  screenshots: string[];
  featuredScreenshot?: string;
  icon: string;
  apkUrl?: string;
  version?: string;
  updateNotes?: string;
  downloadCount: number;
  lighthouseScore?: LighthouseScore;
  validationStatus: ValidationStatus;
  validationMessage?: string;
  reportCount: number;
  reportedBy: string[];
  isHidden: boolean;
  status: AppStatus;
  submittedBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  lastValidatedAt?: Date;
  metadata?: AppMetadata;
}

export interface PWAReport {
  id: string;
  appId: string;
  userId: string;
  reason: ReportReason;
  comment?: string;
  ipHash: string;
  userAgent: string;
  createdAt: Date;
  status: ReportStatus;
}

export interface PWADownload {
  id: string;
  appId: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  userAgent: string;
  referrer?: string;
}

export interface PWACategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  appCount: number;
  order: number;
  createdAt: Date;
}

export interface PWAValidation {
  id: string;
  appId: string;
  lighthouseReport: Record<string, any>;
  scores: Omit<LighthouseScore, 'overallScore'>;
  passed: boolean;
  errors: string[];
  warnings: string[];
  createdAt: Date;
}

// Form types for submission
export interface PWAAppSubmissionData {
  name: string;
  description: string;
  url: string;
  category: string;
  additionalCategories?: string[];
  targetAudience?: string;
  pricing: PricingType;
  price?: number;
  developerName: string;
  developerEmail: string;
  developerWebsite?: string;
  screenshots: File[];
}

// Filter and sort types
export type PWASortBy = 'newest' | 'popular' | 'recently_updated';

export interface PWAAppFilters {
  category?: string;
  sortBy?: PWASortBy;
  search?: string;
  limit?: number;
  offset?: number;
}
