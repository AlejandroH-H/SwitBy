import { Request, Response } from 'express';
import { initializeDB } from '../db';

export class SearchController {
  async searchPosts(req: Request, res: Response) {
    const query = req.query.q as string

    if (!query || query.trim() === '') {
      // cuando no hay consulta sólo devolvemos arrays vacíos con la misma forma que en el caso exitoso
      return res.json({ success: true, users: [], posts: [] });
    }

    const searchTerms = `%${query.trim()}%`;
    const db = await initializeDB();

    try {
      const userSearch = await db.all(`
        SELECT user_id, username FROM perfiles WHERE username LIKE ? LIMIT 5
      `, searchTerms);

      const postSearch = await db.all(`
        SELECT id, title FROM publicaciones WHERE title LIKE ? OR content LIKE ? LIMIT 5
      `, [searchTerms, searchTerms]);

      const [users, posts] = await Promise.all([userSearch, postSearch]);

      return res.json({ 
            success: true, 
            users: users, 
            posts: posts 
          });
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // método adicional para renderizar la página de búsqueda
  async searchPage(req: Request, res: Response) {
    const query = req.query.q as string;
    const emptyModel = { users: [], posts: [] };

    if (!query || query.trim() === '') {
      return res.render('layouts/search', { searchResults: emptyModel, query: '', user: req.session.user, error: null });
    }

    const searchTerms = `%${query.trim()}%`;
    const db = await initializeDB();

    try {
      const userSearch = await db.all(`
        SELECT user_id, username FROM perfiles WHERE username LIKE ? LIMIT 5
      `, searchTerms);

      const postSearch = await db.all(`
        SELECT id, title FROM publicaciones WHERE title LIKE ? OR content LIKE ? LIMIT 5
      `, [searchTerms, searchTerms]);

      const [users, posts] = await Promise.all([userSearch, postSearch]);
      return res.render('layouts/search', { searchResults: { users, posts }, query, user: req.session.user, error: null });
    } catch (error) {
      console.error("Error en la búsqueda de página:", error);
      return res.status(500).render('layouts/search', { searchResults: emptyModel, query, user: req.session.user, error: 'Error interno del servidor' });
    }
  }
}