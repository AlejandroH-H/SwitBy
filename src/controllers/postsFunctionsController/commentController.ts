import { Request, Response } from "express";
import { initializeDB } from "../../db";

export class CommentController {
    async getComments(req: Request, res: Response) {
        const postId = req.params.postId;
        const db = await initializeDB();

        try {
            // Traemos el comentario
            const comments = await db.all(`
                SELECT 
                    c.id, c.content, c.creationDate, c.user_id,
                    p.username, p.avatar_url
                FROM comentarios c
                INNER JOIN perfiles p ON c.user_id = p.user_id
                WHERE c.publicacion_id = ?
                ORDER BY c.creationDate ASC
            `, [postId]);
            // Json para Javascript por parte del cliente
            return res.json({ success: true, comments });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error al cargar comentarios' });
        }
    }

    async createComment(req: Request, res: Response) {
      const userId = req.session.user?.id;
      const { postId, content } = req.body;

      // Lógica para crear los comentarios

      if (!userId) return res.status(401).json({ success: false, message: 'No autorizado' });
      if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Comentario Vacío' });
    
      const db = await initializeDB();

      //Guardado de los comentarios en la DB
      try {
        const result = await db.run(
          `INSERT INTO comentarios (content, user_id, publicacion_id) VALUES (?, ?, ?)`, [content, userId, postId]
        )

        return res.json({ 
          success: true, 
          commentId: result.lastID,
          user: { 
            username: req.session.user?.username, 
            avatar: req.session.user?.avatar
          }
        });
      } catch (e) {
        console.error(e)
        return res.status(500).json({ success: false, message: 'Error al guardar comentario' });
      }
    
    }

    async deleteComment(req: Request, res: Response) {
        const userId = req.session.user?.id;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ success: false, message: 'No autorizado' });

        const db = await initializeDB();
        try {
            // Verificar que el comentario pertenezca al usuario antes de borrar
            const comment = await db.get('SELECT user_id FROM comentarios WHERE id = ?', [id]);
            
            if (!comment || comment.user_id !== userId) {
              return res.status(403).json({ success: false, message: 'No tienes permiso para borrar esto' });
            }

            await db.run('DELETE FROM comentarios WHERE id = ?', [id]);
            return res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error interno' });
        }
    }
}