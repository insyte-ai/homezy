import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with individual environment variables
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured successfully');
} else if (process.env.CLOUDINARY_URL) {
  // Fallback to CLOUDINARY_URL if individual vars not set
  cloudinary.config(process.env.CLOUDINARY_URL);
  console.log('Cloudinary configured with CLOUDINARY_URL');
} else {
  console.warn(
    'Cloudinary credentials not configured. Using local file storage for development.'
  );
  if (process.env.NODE_ENV === 'production') {
    console.error(
      'WARNING: Cloudinary credentials are recommended in production'
    );
  }
}

export default cloudinary;
