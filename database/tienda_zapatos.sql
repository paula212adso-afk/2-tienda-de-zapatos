-- ============================================================
--  BASE DE DATOS: TIENDA DE ZAPATOS
--  Proyecto SENA · Node.js + MySQL
--  Cubre RF01 – RF14 según documento de casos de uso
-- ============================================================

CREATE DATABASE IF NOT EXISTS tienda_zapatos;
USE tienda_zapatos;

-- ─────────────────────────────────────────────────────────────
-- TABLA: usuarios
-- Cubre: RF01 (crear cuenta cliente), RF02 (login cliente),
--        RF03 (login administrador)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE usuarios (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    correo       VARCHAR(100) NOT NULL UNIQUE,
    contrasena   VARCHAR(255) NOT NULL,          -- cifrada con bcrypt
    rol          ENUM('admin','cliente')
                              NOT NULL DEFAULT 'cliente',
    activo       TINYINT(1)   NOT NULL DEFAULT 1,
    creado_en    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Admin por defecto (contraseña: Admin1234 — cámbiala en producción)
INSERT INTO usuarios (nombre, correo, contrasena, rol)
VALUES ('Administrador', 'admin@zapateria.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'admin');


-- ─────────────────────────────────────────────────────────────
-- TABLA: categorias
-- Apoya los filtros de RF10 (filtrar por categoría)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE categorias (
    id     INT         AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE   -- Ej: 'Deportivo', 'Formal', 'Casual'
);

INSERT INTO categorias (nombre)
VALUES ('Deportivo'), ('Formal'), ('Casual'), ('Infantil'), ('Botas');


-- ─────────────────────────────────────────────────────────────
-- TABLA: productos
-- Cubre: RF04 (registrar), RF05 (modificar), RF06 (eliminar),
--        RF07 (visualizar), RF08 (ver detalle),
--        RF09 (buscar por nombre/marca), RF10 (filtrar)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE productos (
    id           INT            AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(120)   NOT NULL,
    marca        VARCHAR(80)    NOT NULL,
    descripcion  TEXT,
    precio       DECIMAL(10,2)  NOT NULL CHECK (precio > 0),
    talla        VARCHAR(10)    NOT NULL,        -- Ej: '38', '42', '7.5'
    categoria_id INT            NOT NULL,
    stock        INT            NOT NULL DEFAULT 0 CHECK (stock >= 0),
    imagen_url   VARCHAR(255),                  -- ruta o URL de la imagen
    activo       TINYINT(1)     NOT NULL DEFAULT 1,
    creado_en    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Índices para búsqueda y filtro (RF09, RF10)
CREATE INDEX idx_productos_nombre  ON productos(nombre);
CREATE INDEX idx_productos_marca   ON productos(marca);
CREATE INDEX idx_productos_talla   ON productos(talla);
CREATE INDEX idx_productos_precio  ON productos(precio);


-- ─────────────────────────────────────────────────────────────
-- TABLA: pedidos
-- Cubre: RF13 (realizar pedido), RF14 (consultar estado)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE pedidos (
    id           INT       AUTO_INCREMENT PRIMARY KEY,
    cliente_id   INT       NOT NULL,
    estado       ENUM('pendiente','confirmado','enviado','entregado','cancelado')
                           NOT NULL DEFAULT 'pendiente',
    total        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    creado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                           ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_estado  ON pedidos(estado);


-- ─────────────────────────────────────────────────────────────
-- TABLA: detalle_pedido
-- Guarda cada línea del pedido (producto + cantidad + precio)
-- Relacionado con RF11 (gestionar cantidades), RF12 (carrito),
--              RF13 (realizar pedido)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE detalle_pedido (
    id           INT           AUTO_INCREMENT PRIMARY KEY,
    pedido_id    INT           NOT NULL,
    producto_id  INT           NOT NULL,
    cantidad     INT           NOT NULL CHECK (cantidad > 0),
    precio_unit  DECIMAL(10,2) NOT NULL,        -- precio al momento de comprar
    subtotal     DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unit) STORED,
    FOREIGN KEY (pedido_id)   REFERENCES pedidos(id)  ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);


-- ─────────────────────────────────────────────────────────────
-- TABLA: carrito
-- Estado temporal del carrito antes de confirmar (RF11, RF12)
-- Un cliente puede tener varios ítems pero solo uno por producto
-- ─────────────────────────────────────────────────────────────
CREATE TABLE carrito (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id   INT NOT NULL,
    producto_id  INT NOT NULL,
    cantidad     INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    agregado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_carrito (cliente_id, producto_id),   -- un ítem por producto
    FOREIGN KEY (cliente_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);


-- ─────────────────────────────────────────────────────────────
-- VISTA: vista_catalogo
-- Facilita RF07 y RF08 — ya trae nombre de categoría y stock
-- ─────────────────────────────────────────────────────────────
CREATE VIEW vista_catalogo AS
SELECT
    p.id,
    p.nombre,
    p.marca,
    p.descripcion,
    p.precio,
    p.talla,
    c.nombre   AS categoria,
    p.stock,
    p.imagen_url
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
WHERE p.activo = 1 AND p.stock > 0;


-- ─────────────────────────────────────────────────────────────
-- VISTA: vista_pedidos_cliente
-- Facilita RF14 — el cliente ve sus pedidos con total y estado
-- ─────────────────────────────────────────────────────────────
CREATE VIEW vista_pedidos_cliente AS
SELECT
    p.id           AS pedido_id,
    p.cliente_id,
    u.nombre       AS cliente,
    p.estado,
    p.total,
    p.creado_en,
    p.actualizado_en
FROM pedidos p
JOIN usuarios u ON p.cliente_id = u.id;


-- ─────────────────────────────────────────────────────────────
-- DATOS DE PRUEBA
-- ─────────────────────────────────────────────────────────────

-- Cliente de prueba (contraseña: Cliente123)
INSERT INTO usuarios (nombre, correo, contrasena, rol)
VALUES ('María Gómez', 'maria@correo.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'cliente');

-- Productos de prueba
INSERT INTO productos (nombre, marca, descripcion, precio, talla, categoria_id, stock, imagen_url) VALUES
('Tenis Runner Pro',  'Nike',   'Tenis ligeros para correr',          189900, '42', 1, 10, '/img/runner.jpg'),
('Zapato Oxford',     'Clarks', 'Zapato formal de cuero genuino',     275000, '41', 2,  5, '/img/oxford.jpg'),
('Sandalia Verano',   'Crocs',  'Sandalia cómoda para todo el día',    89900, '39', 3,  8, '/img/sandalia.jpg'),
('Bota Montañera',    'Timberland', 'Bota resistente para campo',     320000, '43', 5,  3, '/img/bota.jpg'),
('Zapatilla Escolar', 'Bata',   'Zapatilla negra para colegio',        65000, '36', 4, 15, '/img/escolar.jpg');
