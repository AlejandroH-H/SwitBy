import { Request, Response, Router } from 'express';
import crudUserRouter from "./userRouters/crudUser";
import segurityRouter from "./userRouters/segurityUser";

const router = Router();

router.use('/profile', crudUserRouter);
router.use('/profile/segurity', segurityRouter);

export default router;