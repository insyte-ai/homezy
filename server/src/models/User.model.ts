// @ts-nocheck - Temporary: disable type checking for Railway deployment
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type {
  User as UserType,
  HomeownerProfile,
  ProProfile,
  ServiceArea,
  VerificationDocument,
  PortfolioItem,
  Availability,
  WeeklySchedule,
  SavedSearch,
  NotificationPreferences,
} from '@homezy/shared';

export interface IUser extends Omit<UserType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  password: string;
  refreshTokenVersion: number;
  magicLinkToken?: string;
  magicLinkExpiry?: Date;
  hasSetPassword: boolean;
  isGuestAccount: boolean;
  proOnboardingCompleted: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementRefreshTokenVersion(): Promise<void>;
  generateMagicLinkToken(): Promise<string>;
  clearMagicLinkToken(): Promise<void>;
}

const WeeklyScheduleSchema = new Schema<WeeklySchedule>({
  monday: {
    isAvailable: { type: Boolean, default: false },
    startTime: String,
    endTime: String,
  },
  tuesday: {
    isAvailable: { type: Boolean, default: false },
    startTime: String,
    endTime: String,
  },
  wednesday: {
    isAvailable: { type: Boolean, default: false },
    startTime: String,
    endTime: String,
  },
  thursday: {
    isAvailable: { type: Boolean, default: false },
    startTime: String,
    endTime: String,
  },
  friday: {
    isAvailable: { type: Boolean, default: false },
    startTime: String,
    endTime: String,
  },
  saturday: {
    isAvailable: { type: Boolean, default: false },
    startTime: String,
    endTime: String,
  },
  sunday: {
    isAvailable: { type: Boolean, default: false },
    startTime: String,
    endTime: String,
  },
}, { _id: false });

const AvailabilitySchema = new Schema<Availability>({
  schedule: { type: WeeklyScheduleSchema, required: true },
  unavailableDates: [{ type: Date }],
  maxAppointmentsPerDay: { type: Number, default: 5 },
  bufferTimeMinutes: { type: Number, default: 30 },
}, { _id: false });

const PortfolioItemSchema = new Schema<PortfolioItem>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  images: [{ type: String }],
  beforeImages: [{ type: String }],
  afterImages: [{ type: String }],
  completionDate: { type: Date, required: true },
  isFeatured: { type: Boolean, default: false },
});

const VerificationDocumentSchema = new Schema<VerificationDocument>({
  type: {
    type: String,
    enum: ['license', 'vat', 'insurance', 'id', 'portfolio', 'reference'],
    required: true,
  },
  url: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  uploadedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewNotes: String,
});

const ServiceAreaSchema = new Schema<ServiceArea>({
  emirate: { type: String, required: true },
  neighborhoods: [{ type: String }],
  serviceRadius: Number,
  willingToTravelOutside: { type: Boolean, default: false },
  extraTravelCost: Number,
}, { _id: false });

const ProProfileSchema = new Schema<ProProfile>({
  businessName: { type: String, required: true },
  brandName: { type: String }, // Optional brand/trading name if different from legal business name
  businessEmail: { type: String }, // Optional business contact email (e.g., manager/admin) different from account email
  slug: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
    index: true, // Index for fast lookups
  },
  tagline: String,
  bio: String,
  // Remove required from array elements, add default empty array
  categories: { type: [String], default: [] },
  serviceAreas: { type: [ServiceAreaSchema], default: [] },
  yearsInBusiness: Number,
  teamSize: Number,
  languages: { type: [String], default: [] },

  // Verification
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verificationDocuments: { type: [VerificationDocumentSchema], default: [] },

  // Portfolio
  portfolio: { type: [PortfolioItemSchema], default: [] },
  featuredProjects: { type: [String], default: [] },

  // Pricing
  hourlyRateMin: Number,
  hourlyRateMax: Number,
  minimumProjectSize: Number,

  // Stats (calculated fields)
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  projectsCompleted: { type: Number, default: 0 },
  responseTimeHours: { type: Number, default: 24 },
  quoteAcceptanceRate: { type: Number, default: 0 },

  // Settings
  availability: AvailabilitySchema,
  // Make businessType required only when requesting verification
  businessType: {
    type: String,
    enum: ['sole-establishment', 'llc', 'general-partnership', 'limited-partnership', 'civil-company', 'foreign-branch', 'free-zone'],
    required: function(this: any) {
      // Only required when verification status is approved or rejected (has gone through verification)
      return this.verificationStatus && this.verificationStatus !== 'pending';
    },
  },
  tradeLicenseNumber: String,
  vatNumber: String,
}, { _id: false });

const SavedSearchSchema = new Schema<SavedSearch>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: String,
  emirate: String,
  minRating: Number,
  notifyOnNew: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const NotificationPreferencesSchema = new Schema<NotificationPreferences>({
  email: {
    newQuote: { type: Boolean, default: true },
    newMessage: { type: Boolean, default: true },
    projectUpdate: { type: Boolean, default: true },
    reviewRequest: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    serviceReminders: { type: Boolean, default: true },
    seasonalReminders: { type: Boolean, default: true },
    expenseAlerts: { type: Boolean, default: true },
  },
  push: {
    newQuote: { type: Boolean, default: true },
    newMessage: { type: Boolean, default: true },
    projectUpdate: { type: Boolean, default: true },
    serviceReminders: { type: Boolean, default: true },
  },
  doNotDisturbStart: String,
  doNotDisturbEnd: String,
}, { _id: false });

const HomeownerProfileSchema = new Schema<HomeownerProfile>({
  favoritePros: [{ type: String }],
  savedSearches: [SavedSearchSchema],
  notificationPreferences: {
    type: NotificationPreferencesSchema,
    default: () => ({}),
  },

  // Home management onboarding
  onboardingCompleted: { type: Boolean, default: false },
  onboardingSkippedAt: Date,
  primaryPropertyId: { type: String, index: true },
}, { _id: false });

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: function(this: any) {
        // Password is only required if using local auth (not Google)
        return !this.googleId;
      },
      select: false, // Don't include password by default in queries
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    firstName: {
      type: String,
      required: false,
      trim: true,
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['guest', 'homeowner', 'pro', 'admin'],
      default: 'homeowner',
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isGuestAccount: {
      type: Boolean,
      default: false,
    },
    hasSetPassword: {
      type: Boolean,
      default: false,
    },
    proOnboardingCompleted: {
      type: Boolean,
      default: false,
    },
    magicLinkToken: {
      type: String,
      select: false,
    },
    magicLinkExpiry: {
      type: Date,
      select: false,
    },
    profilePhoto: String,
    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
    homeownerProfile: HomeownerProfileSchema,
    proProfile: ProProfileSchema,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.refreshTokenVersion;
        return ret;
      },
    },
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'proProfile.categories': 1 });
UserSchema.index({ 'proProfile.serviceAreas.emirate': 1 });
UserSchema.index({ 'proProfile.verificationStatus': 1 });
UserSchema.index({ 'proProfile.rating': -1 });

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Method to increment refresh token version (for logout/invalidation)
UserSchema.methods.incrementRefreshTokenVersion = async function (): Promise<void> {
  this.refreshTokenVersion += 1;
  await this.save();
};

// Method to generate magic link token
UserSchema.methods.generateMagicLinkToken = async function (): Promise<string> {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex');

  // Hash the token before storing
  this.magicLinkToken = crypto.createHash('sha256').update(token).digest('hex');

  // Set expiry to 24 hours from now
  this.magicLinkExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await this.save();

  // Return the unhashed token to send to user
  return token;
};

// Method to clear magic link token
UserSchema.methods.clearMagicLinkToken = async function (): Promise<void> {
  this.magicLinkToken = undefined;
  this.magicLinkExpiry = undefined;
  await this.save();
};

// Create and export model
export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
