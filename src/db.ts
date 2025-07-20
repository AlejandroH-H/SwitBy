import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const dbPath = path.join(__dirname, '../../Switby.db');

export async function initializeDB() {
    return open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}

export async function createTables() {
    const db = await initializeDB();
    
    await db.exec(`
    

    
    CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE
    );

    
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT NOT NULL UNIQUE,
        contrasena TEXT NOT NULL,
        fecha_creacion DATE DEFAULT (datetime('now')),
        rol_id INTEGER NOT NULL,
        FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL
    );

    
    CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        descripcion TEXT NOT NULL
    );

    
    CREATE TABLE IF NOT EXISTS publicaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        contenido TEXT NOT NULL,
        fecha_creacion DATE DEFAULT (datetime('now')),
        fecha_actualizacion DATE DEFAULT (datetime('now')),
        usuario_id INTEGER NOT NULL,
        categoria_id INTEGER,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
    );

    
    CREATE TABLE IF NOT EXISTS etiquetas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE
    );

    
    CREATE TABLE IF NOT EXISTS publicaciones_etiquetas (
        publicacion_id INTEGER NOT NULL,
        etiqueta_id INTEGER NOT NULL,
        PRIMARY KEY (publicacion_id, etiqueta_id),
        FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
        FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE
    );

   
    CREATE TABLE IF NOT EXISTS comentarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contenido TEXT NOT NULL,
        fecha_creacion TEXT DEFAULT (datetime('now')),
        usuario_id INTEGER NOT NULL,
        publicacion_id INTEGER NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
    );

   
    CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        publicacion_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT,
        UNIQUE (usuario_id, publicacion_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
    );
    `);

    console.log('chamo hemos creado la base de  datos uwu');
}

createTables().catch(console.error);