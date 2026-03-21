import { Request, Response, Router } from 'express';
import { userThings } from "../../controllers/userController";

const crudUserRouter = Router();
const userController = new userThings();

crudUserRouter.get('/myprofile/:id', (req: Request, res: Response) => { 
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

crudUserRouter.get('/:id', async (req, res) => { 
    try {
        const id = req.params.id;
        const targetUser = await userController.obtenerDatos(id);

        console.log("ID del Perfil visitado:", id);
        console.log("ID del Usuario en sesión:", req.session.user?.id);

        if (!targetUser) {
            return res.status(404).send("Usuario no encontrado");
        }

        res.render("users/profile", { 
            user: targetUser, 
            currentUser: req.session.user || null 
        });
    } catch (error) {
        res.status(500).send("Error en el servidor");
    }
});

export default crudUserRouter;