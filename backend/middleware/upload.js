const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create profile images directory
const profileImagesDir = path.join(uploadsDir, 'profiles');
if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}

// Create documents directory for CVs and other files
const documentsDir = path.join(uploadsDir, 'documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'profileImage') {
      cb(null, profileImagesDir);
    } else if (file.fieldname === 'coverImage') {
      cb(null, profileImagesDir);
    } else if (file.fieldname === 'cv' || file.fieldname === 'coverLetter') {
      cb(null, documentsDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const fieldPrefix = file.fieldname === 'profileImage' ? 'profile' : 
                       file.fieldname === 'coverImage' ? 'cover' :
                       file.fieldname === 'cv' ? 'cv' :
                       file.fieldname === 'coverLetter' ? 'coverletter' : 'file';
    
    cb(null, `${fieldPrefix}-${req.user?._id || 'anonymous'}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type based on field
  if (file.fieldname === 'profileImage' || file.fieldname === 'coverImage') {
    // Image files only for profile/cover images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile/cover images.'), false);
    }
  } else if (file.fieldname === 'cv' || file.fieldname === 'coverLetter') {
    // PDF and document files for CV/cover letter
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed for CV/cover letter.'), false);
    }
  } else {
    cb(new Error('Invalid file field.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
    files: 5 // Allow multiple files per request
  }
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 5MB.'
          });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Only 1 file allowed.'
          });
        } else {
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
          });
        }
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Helper function to delete old files
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Helper function to get file URL
const getFileUrl = (filename, type = 'profile') => {
  if (!filename) return null;
  // Return the URL path that will be served by Express static middleware
  const folder = type === 'document' ? 'documents' : 'profiles';
  return `/uploads/${folder}/${filename}`;
};

// Middleware for multiple file upload
const uploadMultiple = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 10MB.'
          });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files uploaded.'
          });
        } else {
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
          });
        }
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteFile,
  getFileUrl,
  uploadsDir,
  profileImagesDir,
  documentsDir
};
