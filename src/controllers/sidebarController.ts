import { Request, Response } from 'express';
import { initializeDB } from '../db';

export class SidebarController {

    // 1. Vista de Amigos (Sugerencias de usuarios)
    async getFriends(req: Request, res: Response) {
        const userId = req.session.user?.id;
        const db = await initializeDB();

        try {
            // Buscamos usuarios que NO sean el usuario actual (Sugerencias)
            const sugerencias = await db.all(`
                SELECT user_id, username, avatar_url, bio 
                FROM perfiles 
                WHERE user_id != ? 
                LIMIT 10
            `, [userId || 0]);

            res.render('layouts/pages/friends', { 
                user: req.session.user,
                sugerencias,
                activePage: 'amigos' // Para resaltar el menú activo
            });
        } catch (error) {
            console.error(error);
            res.redirect('/main');
        }
    }

    // 2. Vista de Categorías
    async getCategories(req: Request, res: Response) {
        const db = await initializeDB();
        try {
            // Obtenemos las categorías y contamos cuántos posts tiene cada una
            const categorias = await db.all(`
                SELECT c.id, c.categoryName, COUNT(p.id) as total_posts
                FROM categorias c
                LEFT JOIN publicaciones p ON c.id = p.category_id
                GROUP BY c.id
            `);

            res.render('layouts/pages/categories', { 
                user: req.session.user,
                categorias,
                activePage: 'categorias'
            });
        } catch (error) {
            res.redirect('/main');
        }
    }

    // 3. Vista de Temas (Trending/Hashtags)
    async getTopics(req: Request, res: Response) {
        // En un futuro, aquí extraerías hashtags de los posts.
        // Por ahora, enviaremos datos simulados para la vista.
        const temasPopulares = [
            { nombre: '#Programación', posts: 120 },
            { nombre: '#JavaScript', posts: 85 },
            { nombre: '#DesarrolloWeb', posts: 60 },
            { nombre: '#Tecnología2026', posts: 42 }
        ];

        res.render('layouts/pages/topics', { 
            user: req.session.user,
            temas: temasPopulares,
            activePage: 'temas'
        });
    }

    // 4. Vista de Mensajes (Chat UI)
    async getMessages(req: Request, res: Response) {
        // Renderizamos la interfaz del chat
        res.render('layouts/pages/messages', { 
            user: req.session.user,
            activePage: 'mensajes'
        });
    }
}