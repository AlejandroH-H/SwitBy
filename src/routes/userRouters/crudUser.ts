import { Request, Response, Router } from 'express';
import { userThings } from "../../controllers/userController";

const crudUserRouter = Router();
const userController = new userThings();

crudUserRouter.get('/:id', (req: Request, res: Response) => { 
    const id = req.params.id;
    res.render("users/profile", { user: req.session.user });
});

crudUserRouter.get('/edit/:id', (req: Request, res: Response) => {
    res.render('users/editProfile', { user: req.session.user });
});

crudUserRouter.post('/edit/:id', (req: Request, res: Response) => {
    userController.editarPerfil(req, res);
});

crudUserRouter.get('/delete/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    res.render('users/deleteProfile', { id, user: req.session.user });
});

crudUserRouter.post('/delete/:id', (req: Request, res: Response) => {
    userController.eliminarPerfil(req, res);
});

export default crudUserRouter;