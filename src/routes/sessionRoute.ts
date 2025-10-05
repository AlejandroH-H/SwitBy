import { Request, Response, Router } from 'express';
import { SessionController } from '../controllers/sessionController';

const router = Router();
const manejoSession= new SessionController();

router.get('/session', (req: Request, res: Response) => {
  res.send("Inicio de Sesión");
});

router.post('/session', (req: Request, res: Response) => manejoSession.loginUser(req, res));

export default router;