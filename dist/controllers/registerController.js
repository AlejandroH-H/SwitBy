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
exports.RegisterController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
class RegisterController {
    registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Estos campos son Obligatorios!' });
            }
            const db = yield (0, db_1.initializeDB)();
            //Validar existencia del usuario
            const revUser = yield db.get('SELECT * FROM usuarios WHERE email = ? OR name = ?', [email, name]);
            if (revUser) {
                return res.status(400).json({ message: 'El usuario ya existe :)' });
            }
            //Hashear la contraseña y guardar el usuario en la base de datos
            const passwordHash = yield bcrypt_1.default.hash(password, 10);
            yield db.run('INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)', [name, email, passwordHash]);
            return res.status(201).json({ message: 'Usuario registrado correctamente :D' });
        });
    }
}
exports.RegisterController = RegisterController;
