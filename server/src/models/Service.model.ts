import mongoose, { Document, Schema } from 'mongoose';

// Service Type (e.g., "Pipe Repair", "Leak Detection")
export interface IServiceType {
  id: string;
  name: string;
}

// Sub-service (e.g., "Plumbing", "Electrical")
export interface ISubService {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  serviceTypes?: IServiceType[];
}

// Service Category (e.g., "Repairs & Maintenance")
export interface IServiceCategory {
  id: string;
  name: string;
  icon?: string;
  subservices: ISubService[];
}

// Service Group (e.g., "Interior Work", "Exterior Work")
export interface IServiceGroup extends Document {
  id: string;
  name: string;
  categories: IServiceCategory[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceTypeSchema = new Schema<IServiceType>({
  id: { type: String, required: true },
  name: { type: String, required: true },
});

const SubServiceSchema = new Schema<ISubService>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  icon: { type: String },
  serviceTypes: [ServiceTypeSchema],
});

const ServiceCategorySchema = new Schema<IServiceCategory>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String },
  subservices: [SubServiceSchema],
});

const ServiceGroupSchema = new Schema<IServiceGroup>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    categories: [ServiceCategorySchema],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient searching
ServiceGroupSchema.index({ id: 1 });
ServiceGroupSchema.index({ 'categories.subservices.slug': 1 });
ServiceGroupSchema.index({ 'categories.subservices.name': 'text' });

const ServiceGroup = mongoose.model<IServiceGroup>('ServiceGroup', ServiceGroupSchema);

export default ServiceGroup;
