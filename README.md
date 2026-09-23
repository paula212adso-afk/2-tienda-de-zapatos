# 👟 API REST — Tienda de Zapatos
**Node.js + Express + MySQL · Proyecto SENA**

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
# El archivo .env ya viene diligenciado con valores de ejemplo.
# Ajusta DB_USER / DB_PASSWORD si tu MySQL local es distinto.

# 3. Crear la base de datos
# Opción A: MySQL Workbench -> abrir y ejecutar database/tienda_zapatos.sql
# Opción B: por consola
mysql -u root -p < database/tienda_zapatos.sql

# 4. Arrancar el servidor
npm run dev          # desarrollo (auto-recarga)
npm start            # producción
```

> ⚠️ El archivo `.env` incluido trae un `JWT_SECRET` real generado y credenciales de MySQL de ejemplo (`root` / `root`). Si este repositorio va a ser público, considera moverlas a tu propio `.env` local y agregar `.env` al `.gitignore` antes de subir cambios sensibles.

---

## Autenticación

La API usa **JWT (JSON Web Token)**.  
Después de hacer login, copia el `token` y agrégalo en Postman:
```
Headers → Authorization: Bearer <token>
```

---

## Endpoints completos

### 🔐 AUTH

| RF | Método | Ruta | Rol | Body |
|----|--------|------|-----|------|
| RF01 | POST | `/api/auth/registro` | Público | `{ nombre, correo, contrasena }` |
| RF02/03 | POST | `/api/auth/login` | Público | `{ correo, contrasena }` |

**Ejemplo RF01 — Registro:**
```json
POST /api/auth/registro
{
  "nombre": "Carlos Pérez",
  "correo": "carlos@correo.com",
  "contrasena": "123456"
}
```

**Ejemplo RF02/03 — Login:**
```json
POST /api/auth/login
{
  "correo": "admin@zapateria.com",
  "contrasena": "Admin1234"
}
```
→ Respuesta incluye el `token` para usar en los demás endpoints.

---

### 👟 PRODUCTOS

| RF | Método | Ruta | Rol | Descripción |
|----|--------|------|-----|-------------|
| RF07 | GET | `/api/productos` | Cliente/Admin | Ver catálogo completo |
| RF09 | GET | `/api/productos?buscar=nike` | Cliente/Admin | Buscar por nombre o marca |
| RF10 | GET | `/api/productos?categoria_id=1&talla=42&precio_max=200000` | Cliente/Admin | Filtrar |
| RF08 | GET | `/api/productos/:id` | Cliente/Admin | Ver detalle de un producto |
| RF04 | POST | `/api/productos` | Admin | Registrar producto |
| RF05 | PUT | `/api/productos/:id` | Admin | Modificar producto |
| RF06 | DELETE | `/api/productos/:id` | Admin | Eliminar producto |
| — | GET | `/api/productos/categorias` | Público | Ver categorías disponibles |

**Filtros disponibles (RF09, RF10):**
```
GET /api/productos?buscar=tenis
GET /api/productos?categoria_id=1
GET /api/productos?talla=42
GET /api/productos?marca=Nike
GET /api/productos?precio_min=50000&precio_max=200000
GET /api/productos?categoria_id=1&talla=42&precio_max=200000
```

**Ejemplo RF04 — Registrar producto (admin):**
```json
POST /api/productos
Authorization: Bearer <token_admin>
{
  "nombre": "Tenis Air Max",
  "marca": "Nike",
  "descripcion": "Tenis de alto rendimiento",
  "precio": 350000,
  "talla": "42",
  "categoria_id": 1,
  "stock": 20,
  "imagen_url": "/img/airmax.jpg"
}
```

---

### 🛒 CARRITO

| RF | Método | Ruta | Rol | Descripción |
|----|--------|------|-----|-------------|
| RF12 | GET | `/api/carrito` | Cliente | Ver carrito con total |
| RF12 | POST | `/api/carrito` | Cliente | Agregar producto |
| RF11 | PUT | `/api/carrito/:id` | Cliente | Cambiar cantidad |
| RF12 | DELETE | `/api/carrito/:id` | Cliente | Eliminar ítem |
| — | DELETE | `/api/carrito/todo` | Cliente | Vaciar carrito |

**Ejemplo RF12 — Agregar al carrito:**
```json
POST /api/carrito
Authorization: Bearer <token_cliente>
{
  "producto_id": 1,
  "cantidad": 2
}
```

**Ejemplo RF11 — Cambiar cantidad:**
```json
PUT /api/carrito/1
Authorization: Bearer <token_cliente>
{
  "cantidad": 3
}
```

---

### 📦 PEDIDOS

| RF | Método | Ruta | Rol | Descripción |
|----|--------|------|-----|-------------|
| RF13 | POST | `/api/pedidos` | Cliente | Confirmar pedido desde carrito |
| RF14 | GET | `/api/pedidos` | Cliente | Ver mis pedidos |
| RF14 | GET | `/api/pedidos/:id` | Cliente | Ver detalle y estado de un pedido |
| — | GET | `/api/pedidos/admin/todos` | Admin | Ver todos los pedidos |
| — | PUT | `/api/pedidos/admin/:id/estado` | Admin | Cambiar estado del pedido |

**Ejemplo RF13 — Realizar pedido:**
```
POST /api/pedidos
Authorization: Bearer <token_cliente>
(sin body — toma todo el carrito actual)
```

**Ejemplo — Admin actualiza estado:**
```json
PUT /api/pedidos/admin/1/estado
Authorization: Bearer <token_admin>
{
  "estado": "confirmado"
}
```
Estados válidos: `pendiente` → `confirmado` → `enviado` → `entregado` / `cancelado`

---

## Credenciales de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin | admin@zapateria.com | Admin1234 |
| Cliente | maria@correo.com | Admin1234 |

---

## Estructura del proyecto

```
api-zapatos/
├── config/
│   └── db.js                    # Pool de conexiones MySQL
├── controllers/
│   ├── authController.js        # RF01, RF02, RF03
│   ├── productosController.js   # RF04–RF10
│   ├── carritoController.js     # RF11, RF12
│   └── pedidosController.js     # RF13, RF14
├── database/
│   └── tienda_zapatos.sql       # Script de creación de la base de datos
├── middleware/
│   └── auth.js                  # JWT + roles
├── routes/
│   ├── auth.js
│   ├── productos.js
│   ├── carrito.js
│   └── pedidos.js
├── .env                         # Variables de entorno (ya diligenciado)
├── .gitignore
├── package.json
└── server.js
```
