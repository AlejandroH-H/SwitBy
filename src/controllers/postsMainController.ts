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

    async editarPost(req: Request, res: Response) {
        const { title, content, category } = req.body
        const id = req.params.id;
        const db = await initializeDB();

        try {
            const stmt = await db.run(
                `UPDATE publicaciones SET title = ?, content = ?, category = ? WHERE user_id = ?`,
                [title, content, category, id]
            );

            if (stmt.changes && stmt.changes > 0) {
                const updatePost = await db.get(`
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
                `, [id]
                );

                req.session.user = updatePost;

                req.session.save((err) => {
                    if (err) {
                        console.error("Error al guardar la sesión:", err);
                        return res.redirect(`/main`); // Redirigir igual, aunque falle el save
                    }
                    res.redirect(`/main`);
                });

            } else {
                res.status(404).send("No se encontró la publicacion para editar");
            }
        } catch (error) {
            console.log("Ocurrio un error: ", error)
        }
    }
};

