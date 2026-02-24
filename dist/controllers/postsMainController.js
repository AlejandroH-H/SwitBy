"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCrud = void 0;
const db_1 = require("../db");
class postCrud {
    mostrarPost() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, db_1.initializeDB)();
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
                const stmt = yield db.prepare(query);
                console.log(stmt);
                const posts = yield stmt.all();
                console.log("aqui se supone hay un post");
                yield stmt.finalize();
                return posts;
            }
            catch (error) {
                console.log("Ocurrio un error: ", error);
            }
        });
    }
    //funcion para editar el contenido de los posts
    editarPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, content, category } = req.body;
            const id = req.params.id;
            const db = yield (0, db_1.initializeDB)();
            try {
                const stmt = yield db.run(`UPDATE publicaciones SET title = ?, content = ?, category_id = ? WHERE id = ?`, [title, content, category, id]);
                if (stmt.changes && stmt.changes > 0) {
                    res.redirect(`/main`);
                }
                else {
                    res.status(404).send("No se encontró la publicación o no hubo cambios");
                }
            }
            catch (error) {
                console.error("Ocurrió un error: ", error);
                res.status(500).send("Error interno del servidor");
            }
        });
    }
    eliminarPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, db_1.initializeDB)();
            const id = req.params.id;
            try {
                yield db.run(`DELETE FROM comentarios WHERE publicacion_id = ?`, [id]);
                const query = `DELETE FROM publicaciones WHERE id = ?`;
                const stmt = yield db.run(query, [id]);
                if (stmt.changes && stmt.changes > 0) {
                    console.log(`Se borró la publicación ${id} y sus comentarios.`);
                    res.redirect(`/main`);
                }
                else {
                    res.status(404).send("No se encontró la publicación");
                }
            }
            catch (error) {
                console.error("Ocurrió un error: ", error);
                res.status(500).send("Error interno del servidor");
            }
        });
    }
}
exports.postCrud = postCrud;
;
