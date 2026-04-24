import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', taskController.list);
router.get('/export', taskController.exportCSV);
router.get('/:id', taskController.getOne);
router.post('/', taskController.create);
router.patch('/:id', taskController.update);
router.delete('/:id', taskController.remove);

export default router;
