import cloudinary from '../config/cloudinary';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

/**
 * Upload to Cloudinary or local filesystem based on environment
 */
export const uploadImage = async (
  buffer: Buffer,
  folder: string
): Promise<string> => {
  try {
    // For local development, save to local filesystem
    if (process.env.NODE_ENV === 'development' && !process.env.CLOUDINARY_URL) {
      return await saveToLocalStorage(buffer, folder);
    }

    // For production, upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: `homezy/${folder}`,
        resource_type: 'image' as any,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' },
        ],
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Save to local storage for development
 */
const saveToLocalStorage = async (
  buffer: Buffer,
  folder: string
): Promise<string> => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads', folder);
    await fs.mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${randomString}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    // Process image with sharp before saving
    const processedBuffer = await sharp(buffer)
      .flatten({ background: '#ffffff' })
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
        background: '#ffffff',
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    await fs.writeFile(filepath, processedBuffer);

    // Return a URL that can be served by the backend
    const port = process.env.PORT || 5001;
    const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
    return `${baseUrl}/uploads/${folder}/${filename}`;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    throw new Error('Failed to save file locally');
  }
};

/**
 * Upload document (PDF, image, video, or office doc) to Cloudinary or local filesystem
 */
export const uploadDocument = async (
  buffer: Buffer,
  folder: string,
  mimeType: string
): Promise<string> => {
  try {
    // For local development, save to local filesystem
    if (process.env.NODE_ENV === 'development' && !process.env.CLOUDINARY_URL) {
      return await saveDocumentToLocalStorage(buffer, folder, mimeType);
    }

    // For production, upload to Cloudinary
    return new Promise((resolve, reject) => {
      const isVideo = mimeType.startsWith('video/');
      const isImage = mimeType.startsWith('image/');
      const isPdf = mimeType === 'application/pdf';

      // Determine resource type for Cloudinary
      let resourceType: 'image' | 'video' | 'raw' = 'raw';
      if (isImage) resourceType = 'image';
      if (isVideo) resourceType = 'video';

      const uploadOptions: any = {
        folder: `homezy/${folder}`,
        resource_type: resourceType,
      };

      // Only add transformations for images, not videos/PDFs/docs
      if (isImage) {
        uploadOptions.transformation = [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' },
        ];
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Get file extension from mime type
 */
const getExtensionFromMimeType = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/webm': 'webm',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  };
  return mimeToExt[mimeType] || 'bin';
};

/**
 * Save document to local storage for development
 */
const saveDocumentToLocalStorage = async (
  buffer: Buffer,
  folder: string,
  mimeType: string
): Promise<string> => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads', folder);
    await fs.mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = getExtensionFromMimeType(mimeType);
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');
    const isPdf = mimeType === 'application/pdf';

    // Process images with sharp, save videos/PDFs/docs as-is
    if (isImage && !mimeType.includes('gif')) {
      const processedBuffer = await sharp(buffer)
        .flatten({ background: '#ffffff' })
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
          background: '#ffffff',
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      await fs.writeFile(filepath, processedBuffer);
    } else {
      // Save videos, PDFs, GIFs, and other docs as-is
      await fs.writeFile(filepath, buffer);
    }

    // Return a URL that can be served by the backend
    const port = process.env.PORT || 5001;
    const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
    return `${baseUrl}/uploads/${folder}/${filename}`;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    throw new Error('Failed to save file locally');
  }
};

/**
 * Delete image from Cloudinary or local filesystem
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    if (!url || !url.includes('cloudinary')) {
      // If it's a local file, delete it from local storage
      if (url.includes('/uploads/')) {
        const filename = url.split('/uploads/')[1];
        const filepath = path.join(process.cwd(), 'uploads', filename);
        await fs.unlink(filepath).catch(() => {});
      }
      return;
    }

    // Extract public ID from Cloudinary URL
    const urlParts = url.split('/');
    const versionIndex = urlParts.findIndex((part) => part.startsWith('v'));
    const publicIdWithExtension = urlParts.slice(versionIndex + 1).join('/');
    const publicId = publicIdWithExtension.split('.')[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error as this is not critical
  }
};
