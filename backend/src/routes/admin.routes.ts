import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireRole('admin'));

router.get('/dashboard-stats', AdminController.getDashboardStats);
router.get('/students', AdminController.getStudents);
router.get('/leaderboard', AdminController.getLeaderboard);

// Question Management
router.get('/questions', AdminController.getQuestions);
router.post('/questions', AdminController.createQuestion);
router.put('/questions/:id', AdminController.updateQuestion);
router.delete('/questions/:id', AdminController.deleteQuestion);

// Submissions & Runtime Marking
router.get('/submissions', AdminController.getSubmissions);
router.post('/evaluate', AdminController.evaluateSubmission);

// Audit & Controls
router.get('/audit-logs', AdminController.getAuditLogs);
router.post('/assessment/status', AdminController.updateAssessmentStatus);

export default router;
