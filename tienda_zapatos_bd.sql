-- ============================================================
-- Proyecto Tienda de Zapatos - GRUPO MIL MILLAS
-- Script de creación de base de datos
-- Basado en RF01, RF02, RF03, RF04, RF05, RF06, RF07, RF08
-- Motor: MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS tienda_zapatos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tienda_zapatos;

-- ============================================================
-- 1. USUARIOS (tabla base común a Administrador, Trabajador, Cliente)
-- ============================================================
CREATE TABLE usuarios (
    id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL,
    correo          VARCHAR(150)    NOT NULL UNIQUE,
    contrasena      VARCHAR(255)    NOT NULL,
    fecha_registro  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. ADMINISTRADORES (RF01, RF02, RF06, RF07, RF08)
-- ============================================================
CREATE TABLE administradores (
    id_administrador  INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario        INT NOT NULL UNIQUE,
    nivel_acceso      VARCHAR(50) NOT NULL DEFAULT 'estandar',
    CONSTRAINT fk_admin_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. TRABAJADORES (RF02, RF05, RF07)
-- Solo el administrador puede crear un trabajador -> creado_por obligatorio
-- ============================================================
CREATE TABLE trabajadores (
    id_trabajador       INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario          INT NOT NULL UNIQUE,
    cargo               VARCHAR(100) NOT NULL,
    permisos_inventario BOOLEAN NOT NULL DEFAULT TRUE,
    creado_por          INT NOT NULL,
    estado              ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
    CONSTRAINT fk_trabajador_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_trabajador_admin
        FOREIGN KEY (creado_por) REFERENCES administradores(id_administrador)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- 4. CLIENTES (RF01, RF03, RF08)
-- Puede autoregistrarse (creado_por NULL) o ser creado por el admin
-- ============================================================
CREATE TABLE clientes (
    id_cliente    INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario    INT NOT NULL UNIQUE,
    telefono      VARCHAR(20),
    direccion     VARCHAR(200),
    creado_por    INT NULL,
    estado        ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
    CONSTRAINT fk_cliente_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_cliente_admin
        FOREIGN KEY (creado_por) REFERENCES administradores(id_administrador)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 5. CATEGORIAS (RF05, RF06)
-- ============================================================
CREATE TABLE categorias (
    id_categoria   INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL UNIQUE,
    descripcion    VARCHAR(255)
) ENGINE=InnoDB;

-- ============================================================
-- 6. PROVEEDORES (RF05, RF06)
-- ============================================================
CREATE TABLE proveedores (
    id_proveedor   INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(150) NOT NULL,
    telefono       VARCHAR(20),
    correo         VARCHAR(150),
    direccion      VARCHAR(200)
) ENGINE=InnoDB;

-- ============================================================
-- 7. PRODUCTOS (RF03, RF04, RF05, RF06)
-- Fusiona el modelo simple (catálogo/inventario) con el completo (gestión)
-- ============================================================
CREATE TABLE productos (
    id_producto         INT AUTO_INCREMENT PRIMARY KEY,
    codigo              VARCHAR(50)  NOT NULL UNIQUE,
    nombre              VARCHAR(150) NOT NULL,
    descripcion         VARCHAR(255),
    imagen              VARCHAR(255),
    precio              DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    stock               INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_minimo        INT NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    tallas              VARCHAR(100),
    estado              ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
    id_categoria        INT NULL,
    id_proveedor        INT NULL,
    fecha_registro      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
        ON DELETE SET NULL,
    CONSTRAINT fk_producto_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 8. HISTORIAL_MOVIMIENTOS (auditoría, RF05, RF06)
-- Registra quién agregó/editó/eliminó cada producto
-- ============================================================
CREATE TABLE historial_movimientos (
    id_movimiento   INT AUTO_INCREMENT PRIMARY KEY,
    tipo_operacion  ENUM('agregar','editar','eliminar','inactivar') NOT NULL,
    fecha           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario      INT NOT NULL,
    id_producto     INT NOT NULL,
    detalle         VARCHAR(500),
    CONSTRAINT fk_historial_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE RESTRICT,
    CONSTRAINT fk_historial_producto
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- ÍNDICES adicionales para consultas frecuentes
-- ============================================================
CREATE INDEX idx_productos_estado ON productos(estado);
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_historial_producto ON historial_movimientos(id_producto);
CREATE INDEX idx_historial_usuario ON historial_movimientos(id_usuario);

-- ============================================================
-- DATOS DE PRUEBA (opcional, para verificar que todo funciona)
-- ============================================================
INSERT INTO usuarios (nombre, correo, contrasena) VALUES
('Paula Andrea Martinez', 'paula.admin@zapateria.com', 'hash_pendiente_1');

INSERT INTO administradores (id_usuario, nivel_acceso)
VALUES (1, 'total');

INSERT INTO categorias (nombre, descripcion) VALUES
('Deportivos', 'Calzado deportivo para hombre y mujer'),
('Formales', 'Calzado formal y de vestir');

INSERT INTO proveedores (nombre, telefono, correo, direccion) VALUES
('Distribuidora Calzado Antioquia', '3001234567', 'contacto@distcalzado.com', 'Medellín, Antioquia');
