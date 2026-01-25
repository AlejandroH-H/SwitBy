import { Router } from 'express';
import { CommentController } from '../../controllers/postsFunctionsController/commentController';
import { LikesController } from '../../controllers/postsFunctionsController/likesController';

const router = Router();
const commentController = new CommentController();
const likesController = new LikesController();

// Rutas API para Likes
router.post('/like', likesController.likePost);

// Rutas API (devuelven JSON)
router.get('/comments/:postId', commentController.getComments);
router.post('/comments', commentController.createComment);
router.delete('/comments/:id', commentController.deleteComment);

export default router;