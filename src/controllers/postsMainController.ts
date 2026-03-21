import { Request, Response } from 'express';
import { initializeDB } from "../db";

export class postCrud {

    async mostrarPost() {

        const db = await initializeDB();

        try {
            const query = `
                SELECT 
                p.id AS post_id,
                p.title,
                p.content,
                p.creationDate,
                p.updateDate,
                p.user_id,
                -- Datos del Autor (Desde Perfiles)
                perf.username AS author_name,
                perf.avatar_url AS author_avatar
                FROM publicaciones AS p 
                -- Unimos con perfiles usando el user_id
                INNER JOIN perfiles AS perf ON p.user_id = perf.user_id
                ORDER BY p.creationDate DESC
            `;
            const stmt = await db.prepare(query);
            console.log(stmt)
            const posts = await stmt.all();
            console.log("aqui se supone hay un post");
            await stmt.finalize();
            return posts;
        } catch (error) {
            console.log("Ocurrio un error: ", error)
        }
    }

    //funcion para editar el contenido de los posts
    async editarPost(req: Request, res: Response) {
    const { title, content, category } = req.body;
    const idStr = req.params.id;
    const id = parseInt(idStr, 10);
    const db = await initializeDB();

        try {
            const categoryId = parseInt(category, 10);
            if (isNaN(categoryId)) {
                return res.status(400).send("Categoría inválida");
            }

            const stmt = await db.run(
                `UPDATE publicaciones SET title = ?, content = ?, category_id = ? WHERE id = ?`,
                [title, content, categoryId, id]
            );

            if (stmt.changes && stmt.changes > 0) {
                res.redirect(`/main`);
            } else {
                res.status(404).send("No se encontró la publicación o no hubo cambios");
            }
        } catch (error) {
            console.error("Ocurrió un error: ", error);
            res.status(500).send("Error interno del servidor");
        }
    }

    async eliminarPost(req: Request, res: Response) {
        const db = await initializeDB();
        const idStr = req.params.id;
        const id = parseInt(idStr, 10);
        
        try {
            await db.run(`DELETE FROM comentarios WHERE publicacion_id = ?`, [id]);
            
            const query = `DELETE FROM publicaciones WHERE id = ?`;
            const stmt = await db.run(query, [id]);
 
            if (stmt.changes && stmt.changes > 0) {
                console.log(`Se borró la publicación ${id} y sus comentarios.`);
                res.redirect(`/main`);
            } else {
                res.status(404).send("No se encontró la publicación");
            }
        } catch (error) {
            console.error("Ocurrió un error: ", error);
            res.status(500).send("Error interno del servidor");
        }
    }
};

