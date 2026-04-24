import { Router } from 'express';
import * as orgController from '../controllers/org.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', orgController.getOrg);
router.patch('/', requireAdmin, orgController.updateOrg);
router.get('/stats', orgController.stats);
router.get('/audit-logs', orgController.auditLogs);

router.post('/invite', requireAdmin, orgController.invite);
router.post('/invite/:token/accept', orgController.acceptInvite);

router.delete('/members/:userId', requireAdmin, orgController.removeMember);
router.patch('/members/:userId/role', requireAdmin, orgController.updateRole);

export default router;
