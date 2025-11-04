import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type {
  User as UserType,
  HomeownerProfile,
  ProfessionalProfile,
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
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementRefreshTokenVersion(): Promise<void>;
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
    enum: ['license', 'insurance', 'id', 'portfolio', 'reference'],
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

const ProfessionalProfileSchema = new Schema<ProfessionalProfile>({
  businessName: { type: String, required: true },
  tagline: String,
  bio: String,
  categories: [{ type: String, required: true }],
  serviceAreas: [ServiceAreaSchema],
  yearsInBusiness: Number,
  teamSize: Number,
  languages: [{ type: String, default: [] }],

  // Verification
  verificationStatus: {
    type: String,
    enum: ['pending', 'basic', 'comprehensive', 'rejected'],
    default: 'pending',
  },
  verificationDocuments: [VerificationDocumentSchema],

  // Portfolio
  portfolio: [PortfolioItemSchema],
  featuredProjects: [{ type: String }],

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
  businessType: {
    type: String,
    enum: ['sole-proprietor', 'llc', 'corporation'],
    required: true,
  },
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
  },
  push: {
    newQuote: { type: Boolean, default: true },
    newMessage: { type: Boolean, default: true },
    projectUpdate: { type: Boolean, default: true },
  },
  doNotDisturbStart: String,
  doNotDisturbEnd: String,
}, { _id: false });

const HomeownerProfileSchema = new Schema<HomeownerProfile>({
  favoriteProfessionals: [{ type: String }],
  savedSearches: [SavedSearchSchema],
  notificationPreferences: {
    type: NotificationPreferencesSchema,
    default: () => ({}),
  },
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
      required: true,
      select: false, // Don't include password by default in queries
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: [
        'guest',
        'homeowner',
        'professional-pending',
        'professional-basic',
        'professional-comprehensive',
        'admin',
      ],
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
    profilePhoto: String,
    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
    homeownerProfile: HomeownerProfileSchema,
    professionalProfile: ProfessionalProfileSchema,
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
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'professionalProfile.categories': 1 });
UserSchema.index({ 'professionalProfile.serviceAreas.emirate': 1 });
UserSchema.index({ 'professionalProfile.verificationStatus': 1 });
UserSchema.index({ 'professionalProfile.rating': -1 });

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

// Create and export model
export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User;
