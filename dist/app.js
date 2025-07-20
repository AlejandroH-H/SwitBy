"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
//Configuración para las vistas
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//Configuración de variables de entorno
dotenv_1.default.config({ path: '../.env' });
//Middlewares sobre ajustes (en un futuro hay que moverlos a su respectiva carpeta)
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use((0, express_session_1.default)({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
//Ruta principal: (Tendrá más cosas, como su session y su comprobación de loogin)
app.get('/', (req, res) => {
    res.send("Prueba");
});
//Ruta para la escritura incorrecta de la URL
app.use((req, res, next) => {
    res.send("Página no encontrada D:");
});
//Puerto de escucha del servidor
const PORT = process.env.PORT || 2000;
app.get("/", (req, res) => {
    res.send("Bienvenido");
});
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${PORT}`);
});
