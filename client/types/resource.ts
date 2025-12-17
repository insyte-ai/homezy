// Resource Center Types for Client

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
  publishedAt?: string;
  updatedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  popular?: boolean;
  viewCount?: number;
  relatedResourceIds?: string[];
  status?: ResourceStatus;
  createdBy?: string;
  createdAt?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  image?: string;
  resourceCount?: number;
  targetAudience: TargetAudience;
}

export interface ResourceFilters {
  category?: ResourceCategory | string;
  type?: ResourceType | string;
  tags?: string[];
  search?: string;
  featured?: boolean;
  targetAudience?: TargetAudience | string;
  status?: ResourceStatus | string;
  limit?: number;
  offset?: number;
  sort?: string;
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

// Type label mappings
export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  [ResourceType.GUIDE]: 'Guide',
  [ResourceType.BLOG]: 'Blog',
  [ResourceType.TIP]: 'Tip',
  [ResourceType.CASE_STUDY]: 'Case Study',
  [ResourceType.INDUSTRY_INSIGHT]: 'Industry Insight',
  [ResourceType.VIDEO]: 'Video',
  [ResourceType.WEBINAR]: 'Webinar',
};

export const RESOURCE_TYPE_COLORS: Record<ResourceType, string> = {
  [ResourceType.GUIDE]: 'bg-blue-100 text-blue-800',
  [ResourceType.BLOG]: 'bg-purple-100 text-purple-800',
  [ResourceType.TIP]: 'bg-green-100 text-green-800',
  [ResourceType.CASE_STUDY]: 'bg-orange-100 text-orange-800',
  [ResourceType.INDUSTRY_INSIGHT]: 'bg-yellow-100 text-yellow-800',
  [ResourceType.VIDEO]: 'bg-red-100 text-red-800',
  [ResourceType.WEBINAR]: 'bg-indigo-100 text-indigo-800',
};

export const TARGET_AUDIENCE_LABELS: Record<TargetAudience, string> = {
  [TargetAudience.HOMEOWNER]: 'Homeowner',
  [TargetAudience.PRO]: 'Professional',
  [TargetAudience.BOTH]: 'Everyone',
};
