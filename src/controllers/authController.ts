import { Request, Response } from 'express';
import { SessionController } from '../controllers/sessionController';
import { RegisterController } from '../controllers/registerController';

const sessionController = new SessionController();
const registerController = new RegisterController();

export class AuthController {
    async login(req: Request, res: Response) {
        return await sessionController.loginUser(req, res);
    }

    async register(req: Request, res: Response) {
        return await registerController.registerUser(req, res);
    }

    async logout(req: Request, res: Response) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al cerrar sesión' });
            }
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: 'Sesión cerrada correctamente' });
        });
    }
}
