import { Request, Response } from "express";
import { initializeDB } from "../../db";

export class LikesController{
    async likePost(req: Request, res: Response) {
        const userId = req.session.user?.id;
        const { postId } = req.body;

        if (!userId) return res.status(401).json({ success: false, message: 'No autorizado' });

        const db = await initializeDB();

        try {
            // Verificar si el usuario le ha dado likes a la publicación
            const existingLike = await db.get(
                `SELECT id FROM likes WHERE user_id = ? AND publicacion_id = ?`, [userId, postId]
            );

            let liked = false;

            if (existingLike) {
                // Si ya existe un like, lo eliminamos
                await db.run(
                    `DELETE FROM likes WHERE id = ?`, [existingLike.id]
                );
                liked = false;
            } else {
                // Si no existe, agregamos un nuevo like
                await db.run(
                    `INSERT INTO likes (user_id, publicacion_id) VALUES (?, ?)`, [userId, postId]
                );
                liked = true;
            }

            const countResult = await db.get(
                'SELECT COUNT(*) as count FROM likes WHERE publicacion_id = ?',
                [postId]
            );

            return res.json({ 
                success: true, 
                liked: liked, 
                newCount: countResult.count 
            }); 

        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Error al procesar el like' });
        }
    }
}