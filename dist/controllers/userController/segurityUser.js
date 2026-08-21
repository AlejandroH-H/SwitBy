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
exports.userSegurity = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../../db");
class userSegurity {
    // este metodo es para cambiar la contrasena
    passwordSegurity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = parseInt(String(((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.id) || '0'), 10);
            const { currentPassword, newPassword, confirmPassword } = req.body;
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.render('users/authSegurity/passwordSegurity', { error: 'Todos los campos son obligatorios.', user: req.session.user });
            }
            if (newPassword !== confirmPassword) {
                return res.render('users/authSegurity/passwordSegurity', { error: 'Las contraseñas nuevas no coinciden.', user: req.session.user });
            }
            // Validación Regex en Backend (Seguridad extra)
            const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}/;
            if (!passwordRegex.test(newPassword)) {
                return res.render('users/authSegurity/passwordSegurity', {
                    error: 'La contraseña es muy débil. Debe incluir mayúsculas, minúsculas, números y símbolos.',
                    user: req.session.user
                });
            }
            const db = yield (0, db_1.initializeDB)();
            try {
                // Obtener hash actual
                const user = yield db.get('SELECT password FROM usuarios WHERE id = ?', [userId]);
                if (!user)
                    return res.redirect('/logout');
                // A. Verificar contraseña actual
                const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
                if (!isMatch) {
                    return res.render('users/authSegurity/passwordSegurity', { error: 'La contraseña actual es incorrecta.', user: req.session.user });
                }
                // B. Verificar que NO sea igual a la anterior
                const isSameAsBefore = yield bcrypt_1.default.compare(newPassword, user.password);
                if (isSameAsBefore) {
                    return res.render('users/authSegurity/passwordSegurity', {
                        error: 'Por seguridad, la nueva contraseña no puede ser igual a la anterior.',
                        user: req.session.user
                    });
                }
                // C. Hashear y Guardar
                const newHash = yield bcrypt_1.default.hash(newPassword, 10);
                yield db.run('UPDATE usuarios SET password = ? WHERE id = ?', [newHash, userId]);
                // Éxito:
                return res.render('users/authSegurity/passwordSegurity', { success: '¡Contraseña actualizada correctamente!', user: req.session.user });
            }
            catch (error) {
                console.error(error);
                return res.status(500).render('users/authSegurity/passwordSegurity', { error: 'Error del servidor.', user: req.session.user });
            }
        });
    }
    // este metodo es para modificar el correo electronico
    emailSegurity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = parseInt(String(((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.id) || '0'), 10);
            const { currentEmail, newEmail, confirmEmail } = req.body;
            const viewPath = 'users/authSegurity/emailSegurity';
            // 1. Validaciones básicas
            if (!currentEmail || !newEmail || !confirmEmail) {
                return res.render(viewPath, {
                    error: 'Todos los campos son obligatorios.',
                    user: req.session.user
                });
            }
            if (newEmail !== confirmEmail) {
                return res.render(viewPath, {
                    error: 'Los nuevos correos electrónicos no coinciden.',
                    user: req.session.user
                });
            }
            // 2. Validación de formato Regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                return res.render(viewPath, {
                    error: 'El formato del nuevo correo no es válido.',
                    user: req.session.user
                });
            }
            const db = yield (0, db_1.initializeDB)();
            try {
                // Obtenemos el correo actual de la BD
                const user = yield db.get('SELECT email FROM usuarios WHERE id = ?', [userId]);
                if (!user)
                    return res.redirect('/auth/logout');
                if (currentEmail !== user.email) {
                    return res.render(viewPath, {
                        error: 'El correo electrónico actual no coincide con nuestros registros.',
                        user: req.session.user
                    });
                }
                // Verificar que el nuevo sea diferente al actual
                if (newEmail === user.email) {
                    return res.render(viewPath, {
                        error: 'El nuevo correo debe ser diferente al actual.',
                        user: req.session.user
                    });
                }
                // Verificar que el nuevo correo NO esté en uso por otra persona
                const emailTaken = yield db.get('SELECT id FROM usuarios WHERE email = ?', [newEmail]);
                if (emailTaken) {
                    return res.render(viewPath, {
                        error: 'Este correo electrónico ya está registrado en otra cuenta.',
                        user: req.session.user
                    });
                }
                // Actualizar en Base de Datos
                yield db.run('UPDATE usuarios SET email = ? WHERE id = ?', [newEmail, userId]);
                // Actualizamos el dato en la cookie para que se refleje sin reloguear
                if (req.session.user) {
                    req.session.user.email = newEmail;
                }
                return res.render(viewPath, {
                    success: '¡Correo electrónico actualizado correctamente!',
                    user: req.session.user
                });
            }
            catch (error) {
                console.error("Error al cambiar email:", error);
                return res.status(500).render(viewPath, {
                    error: 'Error interno del servidor.',
                    user: req.session.user
                });
            }
        });
    }
}
exports.userSegurity = userSegurity;
;
