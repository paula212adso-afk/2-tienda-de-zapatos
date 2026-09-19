# API Tienda de Zapatos — Grupo Mil Millas

API REST en Node.js + Express + Sequelize (MySQL) + JWT que implementa los
requisitos funcionales RF01 a RF08 sobre el esquema `tienda_zapatos_bd.sql`.

## 1. Instalación

```bash
cd api-zapateria
npm install
cp .env.example .env
```

Edita `.env` con los datos de tu MySQL (host, usuario, contraseña) y una
`JWT_SECRET` propia.

Antes de arrancar, crea la base de datos ejecutando tu script:

```bash
mysql -u root -p < tienda_zapatos_bd.sql
```

## 2. Crear el primer administrador

El script SQL trae un administrador de ejemplo, pero su contraseña **no**
está hasheada con bcrypt, así que no sirve para iniciar sesión por la API.
Crea uno nuevo con:

```bash
node src/utils/seedAdmin.js "Paula Martinez" paula@zapateria.com "MiClaveSegura123"
```

## 3. Arrancar el servidor

```bash
npm run dev     # con nodemon (recarga automática)
# o
npm start
```

Por defecto queda en `http://localhost:3000`.

## 4. Endpoints — mapeados a cada RF

### Autenticación (`/api/auth`)

| Método | Ruta | RF | Descripción |
|---|---|---|---|
| POST | `/api/auth/registro-cliente` | RF01 | Autoregistro de cliente |
| POST | `/api/auth/login` | RF01 / RF02 | Login de cliente, trabajador o administrador |

Body de `login`:
```json
{ "correo": "paula@zapateria.com", "contrasena": "MiClaveSegura123" }
```
Respuesta incluye `token` — úsalo en las demás peticiones como header:
`Authorization: Bearer <token>`

### Clientes (`/api/clientes`) — solo administrador

| Método | Ruta | RF |
|---|---|---|
| POST | `/api/clientes` | RF01 (admin crea cliente) |
| GET | `/api/clientes` | — listado |
| GET | `/api/clientes/:id` | — detalle |
| DELETE | `/api/clientes/:id` | RF08 (eliminar/inactivar) |

### Trabajadores (`/api/trabajadores`) — solo administrador

| Método | Ruta | RF |
|---|---|---|
| POST | `/api/trabajadores` | RF02 (admin crea trabajador) |
| GET | `/api/trabajadores` | — listado |
| GET | `/api/trabajadores/:id` | — detalle |
| DELETE | `/api/trabajadores/:id` | RF07 (eliminar/inactivar) |

### Productos (`/api/productos`)

| Método | Ruta | Rol requerido | RF |
|---|---|---|---|
| GET | `/api/productos/catalogo` | público | RF03 — catálogo (solo activos) |
| GET | `/api/productos/inventario` | admin, trabajador | RF04 — inventario completo |
| POST | `/api/productos` | admin, trabajador | RF05 / RF06 — agregar |
| PUT | `/api/productos/:id` | admin, trabajador | RF05 / RF06 — editar |
| DELETE | `/api/productos/:id` | admin, trabajador | RF05 / RF06 — eliminar (o inactivar si tiene movimientos) |

Body de ejemplo para agregar producto:
```json
{
  "codigo": "ZAP-001",
  "nombre": "Tenis deportivo Air Runner",
  "descripcion": "Tenis para running, suela de goma",
  "precio": 189900,
  "stock": 25,
  "stock_minimo": 5,
  "tallas": "38,39,40,41,42",
  "id_categoria": 1,
  "id_proveedor": 1
}
```

## 5. Reglas de negocio implementadas

- **RF01**: correo único al crear/registrar cliente; mensajes de error
  específicos ("El correo ya se encuentra registrado", "Usuario o
  contraseña incorrectos").
- **RF02**: solo el administrador puede crear trabajadores (no hay endpoint
  de autoregistro de trabajador).
- **RF03**: catálogo público filtra por `estado = 'activo'` y solo expone
  imagen, nombre, precio y tallas.
- **RF04**: inventario completo requiere sesión de admin o trabajador.
- **RF05/RF06**: validación de precio/stock no negativos, prevención de
  código o nombre duplicado, y registro en `historial_movimientos` de cada
  operación (agregar/editar/eliminar/inactivar).
- **Eliminación de productos**: como la tabla `historial_movimientos` tiene
  `ON DELETE RESTRICT` hacia `productos`, y cada alta de producto ya genera
  un registro de historial, en la práctica un producto casi nunca podrá
  eliminarse físicamente — el sistema lo detecta y lo **inactiva** en su
  lugar, tal como piden los criterios de aceptación A4 de RF05 y RF06.
- **RF07/RF08**: al eliminar cuentas, si existe una restricción de llave
  foránea (información asociada), la cuenta se marca `inactivo` en lugar de
  fallar.
- Control de acceso por rol con JWT (`administrador`, `trabajador`,
  `cliente`) vía middleware `verificarRol`.

## 6. Pendiente / a definir con tu equipo / no lo vamos a implementar por ahora

- Tablas de **ventas/pedidos** no existen aún en el script SQL — cuando las
  agreguen, son las que realmente activarán la restricción de FK en RF07/RF08
  y en la eliminación de productos.
- Paginación y filtros de búsqueda en catálogo/inventario (por categoría,
  proveedor, rango de precio) si el proyecto lo pide más adelante.
- Recuperación de contraseña (no estaba en ninguno de los 8 RF entregados).
