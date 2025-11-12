import { Request, Response } from 'express';
import { uploadImage } from '../utils/uploadHelper';
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

export default {
  uploadLeadImage,
};
