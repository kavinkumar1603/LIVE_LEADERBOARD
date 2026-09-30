import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/webp',
    'image/bmp',
    'image/gif',
    'image/avif'
  ];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase()) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image screenshots (PNG, JPEG, WEBP) are allowed.'));
  }
};

export const uploadScreenshot = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB max to fit in MongoDB Document size limit
  }
});

