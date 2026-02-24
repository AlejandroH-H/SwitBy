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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCrud = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../../db");
class userCrud {
    obtenerDatos(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield (0, db_1.initializeDB)();
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
                const rows = yield db.get(query, [id]);
                return rows || null;
            }
            catch (error) {
                console.error("Error al obtener datos del perfil:", error);
                throw error;
            }
        });
    }
    // este metodo es para cambiar datos basicos del perfil
    editarPerfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, first_name, last_name, bio, avatar } = req.body;
            const id = req.params.id;
            const db = yield (0, db_1.initializeDB)();
            try {
                const stmt = yield db.run(`UPDATE perfiles SET username = ?, first_name = ?, last_name = ?, bio = ?, avatar_url = ? WHERE user_id = ?`, [username, first_name, last_name, bio, avatar, id]);
                if (stmt.changes && stmt.changes > 0) {
                    const updatedUser = yield db.get(`SELECT u.id, p.username, u.email, p.first_name, p.last_name, p.bio, p.avatar_url as avatar
                    FROM usuarios as u 
                    INNER JOIN perfiles p ON u.id = p.user_id 
                    WHERE u.id = ?`, [id]);
                    req.session.user = updatedUser;
                    req.session.save((err) => {
                        if (err) {
                            console.error("Error al guardar la sesión:", err);
                            return res.redirect(`/profile/${id}`); // Redirigir igual, aunque falle el save
                        }
                        res.redirect(`/profile/${id}`);
                    });
                }
                else {
                    res.status(404).send("No se encontró el usuario para actualizar");
                }
                /* if (stmt) {
                    //res.send("Se actualizarion los datos bien");
                    res.redirect(`/profile/${id}`);
                } else {
                    res.status(404).send("No se encontró el usuario para actualizar");
                } */
            }
            catch (error) {
                console.log("Ocurrio un error: ", error);
            }
        });
    }
    // este metodo es para borrar el perfil definitivamente
    eliminarPerfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const password = req.body.password;
            const id = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.id;
            const db = yield (0, db_1.initializeDB)();
            if (!id) {
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
                const user = yield db.get('SELECT password FROM usuarios WHERE id = ?', [id]);
                if (!user) {
                    return res.status(404).send("Usuario no encontrado en la base de datos");
                }
                if (!(yield bcrypt_1.default.compare(password, user.password))) {
                    return res.render(`users/deleteProfile`, {
                        error: 'La contraseña es incorrecta. Inténtalo de nuevo.',
                        user: req.session.user
                    });
                }
                else {
                    yield db.run(`DELETE FROM usuarios WHERE id = ?`, [id]);
                    req.session.destroy((err) => {
                        if (err)
                            console.error("Error al cerrar sesión tras borrar cuenta", err);
                        // Borramos la cookie del lado del cliente
                        res.clearCookie('connect.sid');
                        // Redirigimos al inicio o login con un parámetro de éxito (opcional)
                        res.redirect('/session?deleted=true');
                    });
                }
            }
            catch (error) {
                console.error("Ocurrió un error al eliminar perfil: ", error);
                res.status(500).send("Error interno del servidor");
            }
        });
    }
}
exports.userCrud = userCrud;
;
