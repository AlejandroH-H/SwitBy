import { Request, Response, Router } from 'express';
import { userThings } from "../../controllers/userController";

const segurityRouter = Router();
const userController = new userThings();

segurityRouter.get('/:id', (req: Request, res: Response) => { 
    const id = req.params.id;
    res.render('users/segurityProfile', { user: req.session.user });
});

segurityRouter.get('/password/:id', (req: Request, res: Response) => { 
    const id = req.params.id;
    res.render('users/authSegurity/passwordSegurity', { user: req.session.user });
});

segurityRouter.post('/password/:id', (req: Request, res: Response) => { 
    userController.passwordSegurity(req, res);
});

segurityRouter.get('/email/:id', (req: Request, res: Response) => { 
    const id = req.params.id;
    res.render('users/authSegurity/emailSegurity', { user: req.session.user });
});

segurityRouter.post('/email/:id', (req: Request, res: Response) => { 
    userController.emailSegurity(req, res);
});

export default segurityRouter;