import { Schema, model, Document } from 'mongoose';

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

export interface IAuthor {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  bio?: string;
}

export interface IResourceTag {
  id: string;
  name: string;
  slug: string;
}

export interface IResourceContent {
  body: string;
  format?: 'html' | 'markdown' | 'blocks';
  videoUrl?: string;
  videoThumbnail?: string;
  downloadUrl?: string;
  readingTime?: number;
}

export interface IResource extends Document {
  slug: string;
  title: string;
  excerpt: string;
  content: IResourceContent;

  // Classification
  type: ResourceType;
  category: ResourceCategory;
  tags: IResourceTag[];
  targetAudience?: TargetAudience;

  // Visual
  featuredImage?: string;
  thumbnail?: string;

  // Meta
  author: IAuthor;
  publishedAt?: Date;
  updatedAt?: Date;

  // SEO
  metaTitle?: string;
  metaDescription?: string;

  // Engagement
  featured?: boolean;
  popular?: boolean;
  viewCount?: number;

  // Related content
  relatedResourceIds?: string[];

  // CMS workflow
  status: ResourceStatus;
  createdBy?: string;

  createdAt: Date;
}

const AuthorSchema = new Schema<IAuthor>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    title: { type: String },
    avatar: { type: String },
    bio: { type: String },
  },
  { _id: false }
);

const ResourceTagSchema = new Schema<IResourceTag>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
  },
  { _id: false }
);

const ResourceContentSchema = new Schema<IResourceContent>(
  {
    body: { type: String, required: true },
    format: {
      type: String,
      enum: ['html', 'markdown', 'blocks'],
      default: 'html',
    },
    videoUrl: { type: String },
    videoThumbnail: { type: String },
    downloadUrl: { type: String },
    readingTime: { type: Number },
  },
  { _id: false }
);

const ResourceSchema = new Schema<IResource>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: ResourceContentSchema,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ResourceType),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(ResourceCategory),
      required: true,
    },
    tags: {
      type: [ResourceTagSchema],
      default: [],
    },
    targetAudience: {
      type: String,
      enum: Object.values(TargetAudience),
    },
    featuredImage: { type: String },
    thumbnail: { type: String },
    author: {
      type: AuthorSchema,
      required: true,
    },
    publishedAt: { type: Date },
    metaTitle: { type: String },
    metaDescription: { type: String },
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    relatedResourceIds: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(ResourceStatus),
      default: ResourceStatus.DRAFT,
    },
    createdBy: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ResourceSchema.index({ slug: 1 });
ResourceSchema.index({ status: 1, publishedAt: -1 });
ResourceSchema.index({ category: 1, status: 1 });
ResourceSchema.index({ type: 1, status: 1 });
ResourceSchema.index({ featured: 1, status: 1 });
ResourceSchema.index({ targetAudience: 1, status: 1 });
ResourceSchema.index({ 'tags.slug': 1 });

// Text index for search
ResourceSchema.index({
  title: 'text',
  excerpt: 'text',
  'content.body': 'text',
});

export const Resource = model<IResource>('Resource', ResourceSchema);
export default Resource;
