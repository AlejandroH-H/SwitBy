import { Request, Response, Router } from 'express';
import { SearchController } from '../controllers/searchController';

const router = Router();
const searchController = new SearchController();

// Servimos la vista de búsqueda. Si se envía `?q=...` el controller
// ejecutará la búsqueda y la plantilla recibirá los resultados.
router.get('/search', (req: Request, res: Response) => {
  return searchController.searchPage(req, res);
});

export default router;