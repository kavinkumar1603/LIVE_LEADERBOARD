import { Router, Request, Response, NextFunction } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { uploadScreenshot } from '../middleware/upload.middleware';

const router = Router();

// Safe multer wrapper to intercept upload errors (size, filetype) with clean JSON
const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadScreenshot.single('screenshot')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed. Please ensure file is an image under 15MB.'
      });
    }
    next();
  });
};

// Leaderboard is viewable by all authenticated users (students & faculty)
router.get('/leaderboard', authenticate, StudentController.getLeaderboard);

// Student-only action routes
router.use(authenticate, requireRole('student'));

router.get('/dashboard', StudentController.getDashboard);
router.get('/questions/:questionId', StudentController.getQuestionDetails);
router.post('/submissions', handleUpload, StudentController.submitScreenshot);

export default router;

