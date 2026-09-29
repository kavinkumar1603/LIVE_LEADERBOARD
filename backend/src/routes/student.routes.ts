import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { uploadScreenshot } from '../middleware/upload.middleware';

const router = Router();

// Leaderboard is viewable by all authenticated users (students & faculty)
router.get('/leaderboard', authenticate, StudentController.getLeaderboard);

// Student-only action routes
router.use(authenticate, requireRole('student'));

router.get('/dashboard', StudentController.getDashboard);
router.get('/questions/:questionId', StudentController.getQuestionDetails);
router.post('/submissions', uploadScreenshot.single('screenshot'), StudentController.submitScreenshot);

export default router;
