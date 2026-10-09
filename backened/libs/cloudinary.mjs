import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null;

    // 1. Agar DiskStorage hai (file.path available hai)
    if (file.path) {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto'
      });
      
      // Upload hone ke baad temporary local file delete karein
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result;
    }

    // 2. Agar MemoryStorage hai (file.buffer available hai)
    if (file.buffer) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Stream Upload Error:', error);
              return resolve(null);
            }
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });
    }

    return null;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);

    // Error aane par local temp file clean up karein
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return null;
  }
};