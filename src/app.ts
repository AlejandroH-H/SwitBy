import express, { Request, Response } from "express"
import path from "path"
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import dotenv from 'dotenv'
import session from 'express-session'

const app = express()

//Configuración para las vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Configuración de variables de entorno

if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

//Middlewares sobre ajustes (en un futuro hay que moverlos a su respectiva carpeta)
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

//Ruta principal: (Tendrá más cosas, como su session y su comprobación de loogin)
app.get('/', (req: Request, res: Response) => {
  res.send("Prueba");
})

//Ruta para la escritura incorrecta de la URL
app.use((req: Request, res: Response, next: Function) => {
  res.send("Página no encontrada D:");
})

//Puerto de escucha del servidor
const PORT = process.env.PORT || 2000

console.log(process.env.PORT);

app.get("/", (req: Request, res: Response) => {
  res.send("Bienvenido");
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`)
})