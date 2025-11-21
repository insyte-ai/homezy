import { Request, Response } from 'express';
import { uploadImage, uploadDocument } from '../utils/uploadHelper';
import { logger } from '../utils/logger';

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

export default {
  uploadLeadImage,
  uploadVerificationDoc,
};
