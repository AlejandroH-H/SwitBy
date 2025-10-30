import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const dbPath = path.join(__dirname, "../../Switby.db");

export async function initializeDB() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

export async function createTables() {
  const db = await initializeDB();

  await db.exec(`
    
-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kindRol INTEGER NOT NULL UNIQUE DEFAULT 0 --Será 0 para usuarios normales y 1 para administradores
);

-- 2. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    creationDate DATETIME DEFAULT (datetime('now')),
    rol_id INTEGER,
    FOREIGN KEY (rol_id) REFERENCES roles(kindRol) ON DELETE SET NULL
);

-- 3. Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryName TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL
);

-- 4. Etiquetas
CREATE TABLE IF NOT EXISTS etiquetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nameTag TEXT NOT NULL UNIQUE
);

-- 5. Publicaciones
CREATE TABLE IF NOT EXISTS publicaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    creationDate DATETIME DEFAULT (datetime('now')),
    updateDate DATETIME DEFAULT (datetime('now')),
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- 6. Publicaciones <-> Etiquetas (N:N)
CREATE TABLE IF NOT EXISTS publicaciones_etiquetas (
    publicacion_id INTEGER NOT NULL,
    etiqueta_id INTEGER NOT NULL,
    PRIMARY KEY (publicacion_id, etiqueta_id),
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE
);

-- 7. Comentarios
CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    creationDate DATETIME DEFAULT (datetime('now')),
    user_id INTEGER NOT NULL,
    publicacion_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
);

-- 8. Likes
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    publicacion_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 0,
    UNIQUE (user_id, publicacion_id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
);

    `);

  console.log("chamo hemos creado la base de  datos uwu");
}

createTables().catch(console.error);
