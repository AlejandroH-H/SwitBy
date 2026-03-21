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
exports.initializeDB = initializeDB;
exports.createTables = createTables;
const client_1 = require("@libsql/client");
const dotenv_1 = __importDefault(require("dotenv"));
// Cargamos las variables de entorno
dotenv_1.default.config();
// Mantenemos una única instancia del cliente para no abrir miles de conexiones
let dbClient = null;
function initializeDB() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!dbClient) {
            // Si hay URL en el .env, usa Turso en la nube.
            // Si no, usa un archivo local 'Switby.db' (Ideal para desarrollo sin internet)
            const url = process.env.TURSO_DATABASE_URL || "file:Switby.db";
            const authToken = process.env.TURSO_AUTH_TOKEN;
            dbClient = (0, client_1.createClient)({
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
            get(sql_1) {
                return __awaiter(this, arguments, void 0, function* (sql, params = []) {
                    const result = yield dbClient.execute({ sql, args: params });
                    return result.rows[0]; // Devuelve el primer resultado o undefined
                });
            },
            all(sql_1) {
                return __awaiter(this, arguments, void 0, function* (sql, params = []) {
                    const result = yield dbClient.execute({ sql, args: params });
                    return result.rows; // Devuelve un array de objetos
                });
            },
            run(sql_1) {
                return __awaiter(this, arguments, void 0, function* (sql, params = []) {
                    var _a;
                    const result = yield dbClient.execute({ sql, args: params });
                    return {
                        lastID: (_a = result.lastInsertRowid) === null || _a === void 0 ? void 0 : _a.toString(),
                        changes: result.rowsAffected
                    };
                });
            },
            exec(sql) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield dbClient.executeMultiple(sql);
                });
            },
            prepare(sql) {
                return __awaiter(this, void 0, void 0, function* () {
                    // Adaptador simulado para statements si usaste db.prepare() en algún lado
                    return {
                        run(...params) {
                            return __awaiter(this, void 0, void 0, function* () {
                                var _a;
                                const result = yield dbClient.execute({ sql, args: params });
                                return {
                                    lastID: (_a = result.lastInsertRowid) === null || _a === void 0 ? void 0 : _a.toString(),
                                    changes: result.rowsAffected
                                };
                            });
                        },
                        all(...params) {
                            return __awaiter(this, void 0, void 0, function* () {
                                const result = yield dbClient.execute({ sql, args: params });
                                return result.rows;
                            });
                        },
                        finalize() {
                            return __awaiter(this, void 0, void 0, function* () { });
                        }
                    };
                });
            },
            transaction(callback) {
                return __awaiter(this, void 0, void 0, function* () {
                    return yield dbClient.transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                        const txDb = {
                            get(sql_1) {
                                return __awaiter(this, arguments, void 0, function* (sql, params = []) {
                                    const result = yield tx.execute({ sql, args: params });
                                    return result.rows[0];
                                });
                            },
                            all(sql_1) {
                                return __awaiter(this, arguments, void 0, function* (sql, params = []) {
                                    const result = yield tx.execute({ sql, args: params });
                                    return result.rows;
                                });
                            },
                            run(sql_1) {
                                return __awaiter(this, arguments, void 0, function* (sql, params = []) {
                                    var _a;
                                    const result = yield tx.execute({ sql, args: params });
                                    return {
                                        lastID: (_a = result.lastInsertRowid) === null || _a === void 0 ? void 0 : _a.toString(),
                                        changes: result.rowsAffected
                                    };
                                });
                            },
                            exec(sql) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    yield tx.executeMultiple(sql);
                                });
                            },
                            prepare(sql) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    return {
                                        run(...params) {
                                            return __awaiter(this, void 0, void 0, function* () {
                                                var _a;
                                                const result = yield tx.execute({ sql, args: params });
                                                return { lastID: (_a = result.lastInsertRowid) === null || _a === void 0 ? void 0 : _a.toString(), changes: result.rowsAffected };
                                            });
                                        },
                                        all(...params) {
                                            return __awaiter(this, void 0, void 0, function* () {
                                                const result = yield tx.execute({ sql, args: params });
                                                return result.rows;
                                            });
                                        },
                                        finalize() {
                                            return __awaiter(this, void 0, void 0, function* () { });
                                        }
                                    };
                                });
                            },
                            finalize() {
                                return __awaiter(this, void 0, void 0, function* () { });
                            }
                        };
                        yield callback(txDb);
                    }));
                });
            },
            finalize() {
                return __awaiter(this, void 0, void 0, function* () {
                    // Las promesas de libSQL no necesitan ser "finalizadas" manualmente, 
                    // dejamos esto vacío para que no tire error en tus controladores.
                });
            }
        };
    });
}
function createTables() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield initializeDB();
        // 'exec' ejecuta todo el bloque de SQL de golpe
        yield db.exec(`
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
    });
}
// Ejecutar al iniciar
createTables().catch(console.error);
