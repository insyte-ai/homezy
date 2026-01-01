import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPhotoSave extends Document {
  photoId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  savedToProjectId: string; // HomeProject ID (usually "My Ideas")
  savedToResourceId?: string; // ProjectResource ID when saved
}

const PhotoSaveSchema = new Schema<IPhotoSave>(
  {
    photoId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    savedToProjectId: {
      type: String,
      required: true,
    },
    savedToResourceId: String,
  },
  {
    timestamps: true,
    toJSON: {
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

// Ensure one save per user per photo
PhotoSaveSchema.index({ photoId: 1, userId: 1 }, { unique: true });

// User's saved photos (sorted by most recent)
PhotoSaveSchema.index({ userId: 1, createdAt: -1 });

export const PhotoSave: Model<IPhotoSave> = mongoose.model<IPhotoSave>(
  'PhotoSave',
  PhotoSaveSchema
);

export default PhotoSave;
