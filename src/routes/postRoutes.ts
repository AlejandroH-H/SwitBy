import { Request, Response, Router } from 'express';
import { postCrud } from "../controllers/postsMainController";

const postsController = new postCrud();

const router = Router();

router.post('/post/edit/:id', (req: Request, res: Response) => {
    postsController.editarPost(req, res);
});

export default router;