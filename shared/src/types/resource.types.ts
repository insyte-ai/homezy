// Resource Center Types

export enum ResourceType {
  GUIDE = 'guide',
  BLOG = 'blog',
  TIP = 'tip',
  CASE_STUDY = 'case-study',
  INDUSTRY_INSIGHT = 'industry-insight',
  VIDEO = 'video',
  WEBINAR = 'webinar',
}

export enum ResourceCategory {
  GETTING_STARTED = 'getting-started',
  HOME_IMPROVEMENT_TIPS = 'home-improvement-tips',
  HIRING_GUIDES = 'hiring-guides',
  PRO_BUSINESS_TIPS = 'pro-business-tips',
  CASE_STUDIES = 'case-studies',
  INDUSTRY_INSIGHTS = 'industry-insights',
  SEASONAL_MAINTENANCE = 'seasonal-maintenance',
  DIY_VS_HIRE = 'diy-vs-hire',
}

export enum TargetAudience {
  HOMEOWNER = 'homeowner',
  PRO = 'pro',
  BOTH = 'both',
}

export enum ResourceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface Author {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  bio?: string;
}

export interface ResourceTag {
  id: string;
  name: string;
  slug: string;
}

export interface ResourceContent {
  body: string;
  format?: 'html' | 'markdown' | 'blocks';
  videoUrl?: string;
  videoThumbnail?: string;
  downloadUrl?: string;
  readingTime?: number;
}

export interface Resource {
  id: string;
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: ResourceContent;
  type: ResourceType;
  category: ResourceCategory;
  tags: ResourceTag[];
  targetAudience?: TargetAudience;
  featuredImage?: string;
  thumbnail?: string;
  author: Author;
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  popular?: boolean;
  viewCount?: number;
  relatedResourceIds?: string[];
  status?: ResourceStatus;
  createdBy?: string;
  createdAt?: string | Date;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  image?: string;
  resourceCount?: number;
}

export interface ResourceFilters {
  category?: ResourceCategory;
  type?: ResourceType;
  tags?: string[];
  search?: string;
  featured?: boolean;
  targetAudience?: TargetAudience;
  limit?: number;
  offset?: number;
}

export interface ResourceStats {
  totalResources: number;
  categoryCounts: Record<string, number>;
  typeCounts: Record<string, number>;
}

export interface ResourcePagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ResourceListResponse {
  resources: Resource[];
  pagination: ResourcePagination;
}
