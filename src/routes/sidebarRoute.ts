import { Router } from 'express';
import { SidebarController } from '../controllers/sidebarController';

const router = Router();
const sidebarController = new SidebarController();

router.get('/friends', sidebarController.getFriends);
router.get('/categories', sidebarController.getCategories);
router.get('/topics', sidebarController.getTopics);
router.get('/messages', sidebarController.getMessages);

export default router;