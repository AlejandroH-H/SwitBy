import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { initializeDB } from "../../db";

export class userCrud {

    async obtenerDatos(id: string) {
        const db = await initializeDB();

        try {
            const query = `
                SELECT 
                u.id, p.username, 
                u.email, p.first_name,
                 p.last_name, p.bio, 
                 p.avatar_url as avatar
                    FROM usuarios as u 
                    INNER JOIN perfiles p ON u.id = p.user_id
                WHERE u.id = ?
            `;
            const rows: any = await db.get(query, [id]);
            return rows || null;

        } catch (error) {
            console.error("Error al obtener datos del perfil:", error);
            throw error;
        }
    }
    
    // este metodo es para cambiar datos basicos del perfil
    async editarPerfil(req: Request, res: Response) {
        const { username, first_name, last_name, bio, avatar } = req.body
        const id = req.params.id;
        const db = await initializeDB();

        try {
            const stmt = await db.run(
                `UPDATE perfiles SET username = ?, first_name = ?, last_name = ?, bio = ?, avatar_url = ? WHERE user_id = ?`,
                [username, first_name, last_name, bio, avatar, id]
            );

            if (stmt.changes && stmt.changes > 0) {
                const updatedUser = await db.get(
                    `SELECT u.id, p.username, u.email, p.first_name, p.last_name, p.bio, p.avatar_url as avatar
                    FROM usuarios as u 
                    INNER JOIN perfiles p ON u.id = p.user_id 
                    WHERE u.id = ?`, 
                    [id]
                );

                req.session.user = updatedUser;

                req.session.save((err) => {
                    if (err) {
                        console.error("Error al guardar la sesión:", err);
                        return res.redirect(`/profile/${id}`); // Redirigir igual, aunque falle el save
                    }
                    res.redirect(`/profile/${id}`);
                });

            } else {
                res.status(404).send("No se encontró el usuario para actualizar");
            }

            /* if (stmt) {
                //res.send("Se actualizarion los datos bien");
                res.redirect(`/profile/${id}`);
            } else {
                res.status(404).send("No se encontró el usuario para actualizar");
            } */
        } catch (error) {
            console.log("Ocurrio un error: ", error)
        }
    }

    // este metodo es para borrar el perfil definitivamente
    async eliminarPerfil(req: Request, res: Response) {
        const password = req.body.password
        const id = req.session.user?.id;
        const db = await initializeDB();

        if(!id){
            return res.status(400).redirect('/session');
        }

        if (!password) {
            
            return res.status(400).render(`users/deleteProfile`, { 
                error: 'Debes ingresar tu contraseña para confirmar.',
                user: req.session.user 
            });
        }

        try {
            //Validar la contraseña antes de borrar la cuenta

            const user = await db.get(
                'SELECT password FROM usuarios WHERE id = ?',
                [id]
            );

            if (!user) {
                return res.status(404).send("Usuario no encontrado en la base de datos");
            }

            if (!await bcrypt.compare(password, user.password)) {
                return res.render(`users/deleteProfile`, {
                    error: 'La contraseña es incorrecta. Inténtalo de nuevo.',
                    user: req.session.user
                });
            }else{
                await db.run(
                    `DELETE FROM usuarios WHERE id = ?`,
                    [id]
                );
                req.session.destroy((err) => {
                    if (err) console.error("Error al cerrar sesión tras borrar cuenta", err);
                    
                    // Borramos la cookie del lado del cliente
                    res.clearCookie('connect.sid'); 
                    
                    // Redirigimos al inicio o login con un parámetro de éxito (opcional)
                    res.redirect('/session?deleted=true');
                });

            }
            
        } catch (error) {
            console.error("Ocurrió un error al eliminar perfil: ", error);
            res.status(500).send("Error interno del servidor");
        }
    }
};