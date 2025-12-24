import { Request, Response } from 'express';
import { uploadImage, uploadDocument } from '../utils/uploadHelper';
import { logger } from '../utils/logger';
import User from '../models/User.model';

/**
 * Upload image to Cloudinary or local storage
 */
export const uploadLeadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const url = await uploadImage(req.file.buffer, 'leads');

    logger.info('Image uploaded successfully', { url });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url,
      },
    });
  } catch (error: any) {
    logger.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image',
    });
  }
};

/**
 * Upload verification document to Cloudinary or local storage
 */
export const uploadVerificationDoc = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const { type } = req.body;

    if (!type || !['license', 'vat', 'insurance', 'id', 'reference'].includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid document type. Must be one of: license, vat, insurance, id, reference',
      });
      return;
    }

    const url = await uploadDocument(
      req.file.buffer,
      'verification-documents',
      req.file.mimetype
    );

    logger.info('Verification document uploaded successfully', {
      url,
      type,
      userId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'Verification document uploaded successfully',
      data: {
        url,
        type,
      },
    });
  } catch (error: any) {
    logger.error('Error uploading verification document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload verification document',
    });
  }
};

/**
 * Upload quote document (PDF or image) to Cloudinary or local storage
 */
export const uploadQuoteDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const url = await uploadDocument(
      req.file.buffer,
      'quote-documents',
      req.file.mimetype
    );

    logger.info('Quote document uploaded successfully', {
      url,
      userId: req.user?.id,
      filename: req.file.originalname,
    });

    res.status(200).json({
      success: true,
      message: 'Quote document uploaded successfully',
      data: {
        url,
        filename: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    logger.error('Error uploading quote document:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload quote document',
    });
  }
};

/**
 * Upload portfolio images (multiple) to Cloudinary or local storage
 */
export const uploadPortfolioImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
      return;
    }

    // Upload all images in parallel
    const uploadPromises = files.map(file => uploadImage(file.buffer, 'portfolio'));
    const urls = await Promise.all(uploadPromises);

    logger.info('Portfolio images uploaded successfully', {
      count: urls.length,
      userId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: `${urls.length} image(s) uploaded successfully`,
      data: {
        urls,
      },
    });
  } catch (error: any) {
    logger.error('Error uploading portfolio images:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload portfolio images',
    });
  }
};

/**
 * Upload profile photo and update user's profilePhoto field
 */
export const uploadProfilePhoto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const url = await uploadImage(req.file.buffer, 'profile-photos');

    // Update user's profilePhoto field
    await User.findByIdAndUpdate(req.user.id, { profilePhoto: url });

    logger.info('Profile photo uploaded successfully', {
      url,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        url,
      },
    });
  } catch (error: any) {
    logger.error('Error uploading profile photo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile photo',
    });
  }
};

/**
 * Upload message attachment (image or document)
 */
export const uploadMessageAttachment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const isImage = req.file.mimetype.startsWith('image/');
    const isPdf = req.file.mimetype === 'application/pdf';
    const isVideo = req.file.mimetype.startsWith('video/');

    let url: string;
    let type: 'image' | 'document' | 'pdf' | 'video';

    if (isImage) {
      url = await uploadImage(req.file.buffer, 'message-attachments');
      type = 'image';
    } else if (isPdf) {
      url = await uploadDocument(req.file.buffer, 'message-attachments', req.file.mimetype);
      type = 'pdf';
    } else if (isVideo) {
      url = await uploadDocument(req.file.buffer, 'message-attachments', req.file.mimetype);
      type = 'video';
    } else {
      url = await uploadDocument(req.file.buffer, 'message-attachments', req.file.mimetype);
      type = 'document';
    }

    logger.info('Message attachment uploaded successfully', {
      url,
      type,
      filename: req.file.originalname,
      size: req.file.size,
      userId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'Attachment uploaded successfully',
      data: {
        url,
        type,
        filename: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    logger.error('Error uploading message attachment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload attachment',
    });
  }
};

export default {
  uploadLeadImage,
  uploadVerificationDoc,
  uploadQuoteDocument,
  uploadPortfolioImages,
  uploadProfilePhoto,
  uploadMessageAttachment,
};
