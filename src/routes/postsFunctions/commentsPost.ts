import { Router } from 'express';
import { CommentController } from '../../controllers/postsFunctionsController/commentController';
import { LikesController } from '../../controllers/postsFunctionsController/likesController';
import { SearchController } from '../../controllers/searchController';

const router = Router();
const commentController = new CommentController();
const likesController = new LikesController();
const searchController = new SearchController();

// Rutas API para Likes
router.post('/like', likesController.likePost);

// Rutas API (devuelven JSON)
router.get('/comments/:postId', commentController.getComments);
router.post('/comments', commentController.createComment);
router.delete('/comments/:id', commentController.deleteComment);

//Rutas API para la búsqueda

router.get('/search', searchController.searchPosts);

export default router;