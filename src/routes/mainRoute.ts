import { Request, Response, Router } from 'express';

const router = Router();

router.get("/main", (req: Request, res: Response) => {
  res.render("layouts/main");
});

export default router;