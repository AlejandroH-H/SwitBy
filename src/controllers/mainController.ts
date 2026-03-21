import { Request, Response } from 'express';
import { initializeDB } from '../db';
import { postCrud } from "./postsMainController";

const postsController = new postCrud();

export class UserController {

  async getMain (req: Request, res: Response) {
    try {
      const verPost = await postsController.mostrarPost() ?? [];
      res.status(200).render("layouts/main", { 
        user: req.session.user,
        receivePosts: verPost
      });
    } catch (error) {
      console.log("Error: ", error)
    }
  }

  async getCreatePost (req: Request, res: Response){
    res.status(200).render("post/create", {
      user: req.session.user
    });
  }

  async postCreatePost (req: Request, res: Response){
    const { title, content, category } = req.body; //Requiriendo los datos desde la vista
    const userID = req.session.user?.id; //Posterior revisión para validar mejor

    //const nowTime = new Date().toLocaleDateString('es-VE') //Uso de la clase Date, para la definición de la fecha de creación del post

    if (!userID) {
      return res.status(401).redirect('/session');
    }

    if (!title || !content || !category) {
      return res.status(400).send("Faltan datos obligatorios");
    }

    const db = await initializeDB();

    try {
      const categoryId = parseInt(category, 10);
      if (isNaN(categoryId)) {
        return res.status(400).send("Categoría inválida");
      }

      const stmt = await db.prepare(`INSERT INTO publicaciones (title, content, user_id, category_id) VALUES (?, ?, ?, ?)`);
      await stmt.run(title, content, userID, categoryId);
      await stmt.finalize();

      res.status(201).redirect('/main');
    } catch (e) {
      console.error(e);
      res.status(500).send("Error al crear la publicación");
    }
  }
}