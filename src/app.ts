import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import session from "express-session";

// Inicialización de la app
const app = express();

// Configuración de variables de entorno
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Configuración para las vistas
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

import registerRouter from "./routes/registerRoute";
import sessionRouter from "./routes/sessionRoute";

// Rutas
app.use(registerRouter);
app.use(sessionRouter);


// Rutas principales
app.get("/", (req: Request, res: Response) => {
  res.send("Bienvenido");
});

// Ruta para la escritura incorrecta de la URL
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send("Página no encontrada D:");
});

// Puerto de escucha del servidor
const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`);
});