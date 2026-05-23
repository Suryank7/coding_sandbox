import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { aiController } from '../controllers/aiController';

const router = Router();

// Project Routes
router.post('/projects', projectController.createProject);
router.get('/projects/:id', projectController.getProject);
router.put('/projects/:id/files', projectController.updateFileContent);

// Audit & AI Routes
router.post('/sessions/:sessionId/audit', projectController.appendAuditLog);
router.post('/sessions/:sessionId/assess', aiController.assessSession);

export default router;
