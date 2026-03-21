import { createClient } from "@libsql/client";
import dotenv from "dotenv";

// Cargamos las variables de entorno
dotenv.config();

// Mantenemos una única instancia del cliente para no abrir miles de conexiones
let dbClient: any = null;

export async function initializeDB() {
  if (!dbClient) {
    // Si hay URL en el .env, usa Turso en la nube.
    // Si no, usa un archivo local 'Switby.db' (Ideal para desarrollo sin internet)
    const url = process.env.TURSO_DATABASE_URL || "file:Switby.db";
    const authToken = process.env.TURSO_AUTH_TOKEN;

    dbClient = createClient({
      url: url,
      authToken: authToken,
    });
  }

  // =========================================================
  // EL ADAPTADOR MÁGICO
  // =========================================================
  // Esto hace que el cliente de Turso (@libsql/client) funcione 
  // exactamente igual que tu antiguo paquete 'sqlite', para que 
  // NO tengas que modificar ni una línea en tus controladores.
  return {
    async get(sql: string, params: any[] = []) {
      const result = await dbClient.execute({ sql, args: params });
      return result.rows[0]; // Devuelve el primer resultado o undefined
    },
    async all(sql: string, params: any[] = []) {
      const result = await dbClient.execute({ sql, args: params });
      return result.rows; // Devuelve un array de objetos
    },
    async run(sql: string, params: any[] = []) {
      const result = await dbClient.execute({ sql, args: params });
      return { 
        lastID: result.lastInsertRowid?.toString(), 
        changes: result.rowsAffected 
      };
    },
    async exec(sql: string) {
      await dbClient.executeMultiple(sql);
    },
    async prepare(sql: string) {
       // Adaptador simulado para statements si usaste db.prepare() en algún lado
       return {
         async run(...params: any[]) {
           const result = await dbClient.execute({ sql, args: params });
           return { 
             lastID: result.lastInsertRowid?.toString(), 
             changes: result.rowsAffected 
           };
         },
         async all(...params: any[]) {
            const result = await dbClient.execute({ sql, args: params });
            return result.rows;
         },
         async finalize() { /* no-op */ }
       }
    },
    async transaction(callback: (db: any) => Promise<void>) {
      return await dbClient.transaction(async (tx: any) => {
        const txDb = {
          async get(sql: string, params: any[] = []) {
            const result = await tx.execute({ sql, args: params });
            return result.rows[0];
          },
          async all(sql: string, params: any[] = []) {
            const result = await tx.execute({ sql, args: params });
            return result.rows;
          },
          async run(sql: string, params: any[] = []) {
            const result = await tx.execute({ sql, args: params });
            return { 
              lastID: result.lastInsertRowid?.toString(), 
              changes: result.rowsAffected 
            };
          },
          async exec(sql: string) {
            await tx.executeMultiple(sql);
          },
          async prepare(sql: string) {
            return {
              async run(...params: any[]) {
                const result = await tx.execute({ sql, args: params });
                return { lastID: result.lastInsertRowid?.toString(), changes: result.rowsAffected };
              },
              async all(...params: any[]) {
                const result = await tx.execute({ sql, args: params });
                return result.rows;
              },
              async finalize() { /* no-op */ }
            };
          },
          async finalize() { /* no-op */ }
        };
        await callback(txDb);
      });
    },
    async finalize() {
      // Las promesas de libSQL no necesitan ser "finalizadas" manualmente, 
      // dejamos esto vacío para que no tire error en tus controladores.
    }
  };
}

export async function createTables() {
  const db = await initializeDB();

  // 'exec' ejecuta todo el bloque de SQL de golpe
  await db.exec(`
-- 1. Roles (Mejorado: FOREIGN KEY ahora usa ON DELETE RESTRICT para seguridad)
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rol_name TEXT NOT NULL UNIQUE
);

-- Inserta roles básicos
INSERT OR IGNORE INTO roles (id, rol_name) VALUES (1, 'Usuario');
INSERT OR IGNORE INTO roles (id, rol_name) VALUES (2, 'Administrador');

-- 2. Usuarios (Tabla de Cuenta y Seguridad)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    creationDate DATETIME DEFAULT (datetime('now')),
    is_active INTEGER NOT NULL DEFAULT 1,
    rol_id INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- 3. Perfiles (Tabla 1:1 para Datos Personales y Públicos)
CREATE TABLE IF NOT EXISTS perfiles (
    user_id INTEGER PRIMARY KEY, 
    username TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    last_activity DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4. Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryName TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Inserta categorías básicas
INSERT OR IGNORE INTO categorias (id, categoryName, description) VALUES (1, 'General', 'Categoría general para publicaciones variadas');
INSERT OR IGNORE INTO categorias (id, categoryName, description) VALUES (2, 'Tecnología', 'Publicaciones sobre tecnología e innovación');
INSERT OR IGNORE INTO categorias (id, categoryName, description) VALUES (3, 'Deportes', 'Contenido relacionado con deportes');
INSERT OR IGNORE INTO categorias (id, categoryName, description) VALUES (4, 'Entretenimiento', 'Música, cine, juegos y más');

-- 5. Etiquetas
CREATE TABLE IF NOT EXISTS etiquetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nameTag TEXT NOT NULL UNIQUE
);

-- 6. Publicaciones
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

-- 7. Publicaciones <-> Etiquetas (N:N)
CREATE TABLE IF NOT EXISTS publicaciones_etiquetas (
    publicacion_id INTEGER NOT NULL,
    etiqueta_id INTEGER NOT NULL,
    PRIMARY KEY (publicacion_id, etiqueta_id),
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE
);

-- 8. Comentarios
CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    creationDate DATETIME DEFAULT (datetime('now')),
    user_id INTEGER NOT NULL,
    publicacion_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
);

-- 9. Likes (Sin 'cantidad', con UNIQUE en la combinación user_id/publicacion_id)
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    publicacion_id INTEGER NOT NULL,
    UNIQUE (user_id, publicacion_id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
);

-- Índices de Rendimiento Adicionales
CREATE INDEX IF NOT EXISTS idx_publicaciones_title ON publicaciones (title);
CREATE INDEX IF NOT EXISTS idx_comentarios_date ON comentarios (creationDate);
CREATE INDEX IF NOT EXISTS idx_publicaciones_category ON publicaciones (category_id);
  `);

  console.log("¡Conexión a Turso/Local establecida y tablas verificadas uwu!");
}

// Ejecutar al iniciar
createTables().catch(console.error);
