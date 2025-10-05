import { Request, Response, Router } from 'express';
import { RegisterController } from '../controllers/registerController';

const router = Router();
const manejoRegistro = new RegisterController();

router.get('/register', (req: Request, res: Response) => {
  res.send("Registro");
});

router.post('/register', (req: Request, res: Response) => manejoRegistro.registerUser(req, res));

export default router;