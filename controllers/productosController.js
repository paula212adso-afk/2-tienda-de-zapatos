// controllers/productosController.js
// RF04 — Registrar productos     (admin)
// RF05 — Modificar productos     (admin)
// RF06 — Eliminar productos      (admin)
// RF07 — Visualizar productos    (cliente)
// RF08 — Ver detalle del producto(cliente)
// RF09 — Buscar productos        (cliente)
// RF10 — Filtrar productos       (cliente)
const db = require('../config/db');

// ── RF07: GET /api/productos ──────────────────────────────────
// Lista todos los productos disponibles del catálogo
// También sirve de base para RF09 (búsqueda) y RF10 (filtros)
// Query params opcionales: buscar, categoria_id, talla, precio_min, precio_max, marca
exports.listar = async (req, res) => {
  try {
    const { buscar, categoria_id, talla, precio_min, precio_max, marca } = req.query;

    // Construcción dinámica de la consulta (RF09 y RF10)
    let sql    = `SELECT p.id, p.nombre, p.marca, p.precio, p.talla,
                         c.nombre AS categoria, p.stock, p.imagen_url, p.descripcion
                  FROM productos p
                  JOIN categorias c ON p.categoria_id = c.id
                  WHERE p.activo = 1 AND p.stock > 0`;
    const params = [];

    // RF09 — Buscar por nombre o marca
    if (buscar) {
      sql += ' AND (p.nombre LIKE ? OR p.marca LIKE ?)';
      params.push(`%${buscar}%`, `%${buscar}%`);
    }

    // RF10 — Filtrar por categoría
    if (categoria_id) {
      sql += ' AND p.categoria_id = ?';
      params.push(categoria_id);
    }

    // RF10 — Filtrar por talla
    if (talla) {
      sql += ' AND p.talla = ?';
      params.push(talla);
    }

    // RF10 — Filtrar por marca
    if (marca) {
      sql += ' AND p.marca LIKE ?';
      params.push(`%${marca}%`);
    }

    // RF10 — Filtrar por rango de precio
    if (precio_min) {
      sql += ' AND p.precio >= ?';
      params.push(Number(precio_min));
    }
    if (precio_max) {
      sql += ' AND p.precio <= ?';
      params.push(Number(precio_max));
    }

    sql += ' ORDER BY p.creado_en DESC';

    const [productos] = await db.query(sql, params);

    if (productos.length === 0) {
      return res.json({ ok: true, total: 0, productos: [], mensaje: 'No se encontraron productos' });
    }

    res.json({ ok: true, total: productos.length, productos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ── RF08: GET /api/productos/:id ─────────────────────────────
// Ver detalle completo de un producto
exports.detalle = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.nombre, p.marca, p.descripcion, p.precio,
              p.talla, c.nombre AS categoria, p.stock, p.imagen_url
       FROM productos p
       JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ? AND p.activo = 1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado o no disponible' });
    }

    res.json({ ok: true, producto: rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// ── RF04: POST /api/productos ─────────────────────────────────
// Admin registra un nuevo producto
exports.crear = async (req, res) => {
  try {
    const { nombre, marca, descripcion, precio, talla, categoria_id, stock, imagen_url } = req.body;

    // Validaciones
    if (!nombre || !marca || !precio || !talla || !categoria_id) {
      return res.status(400).json({ error: 'Nombre, marca, precio, talla y categoría son obligatorios' });
    }
    if (precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }
    if (stock < 0) {
      return res.status(400).json({ error: 'El stock no puede ser negativo' });
    }

    // Verificar que la categoría existe
    const [cat] = await db.query('SELECT id FROM categorias WHERE id = ?', [categoria_id]);
    if (cat.length === 0) {
      return res.status(400).json({ error: 'La categoría no existe' });
    }

    const [result] = await db.query(
      `INSERT INTO productos (nombre, marca, descripcion, precio, talla, categoria_id, stock, imagen_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, marca, descripcion || null, precio, talla, categoria_id, stock || 0, imagen_url || null]
    );

    res.status(201).json({ ok: true, mensaje: 'Producto registrado', id: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar el producto' });
  }
};

// ── RF05: PUT /api/productos/:id ──────────────────────────────
// Admin modifica un producto existente
exports.modificar = async (req, res) => {
  try {
    const { nombre, marca, descripcion, precio, talla, categoria_id, stock, imagen_url } = req.body;
    const { id } = req.params;

    // Verificar que existe
    const [existe] = await db.query(
      'SELECT id FROM productos WHERE id = ? AND activo = 1', [id]
    );
    if (existe.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Validaciones
    if (precio !== undefined && precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ error: 'El stock no puede ser negativo' });
    }

    await db.query(
      `UPDATE productos
       SET nombre       = COALESCE(?, nombre),
           marca        = COALESCE(?, marca),
           descripcion  = COALESCE(?, descripcion),
           precio       = COALESCE(?, precio),
           talla        = COALESCE(?, talla),
           categoria_id = COALESCE(?, categoria_id),
           stock        = COALESCE(?, stock),
           imagen_url   = COALESCE(?, imagen_url)
       WHERE id = ?`,
      [nombre, marca, descripcion, precio, talla, categoria_id, stock, imagen_url, id]
    );

    res.json({ ok: true, mensaje: 'Producto actualizado' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al modificar el producto' });
  }
};

// ── RF06: DELETE /api/productos/:id ──────────────────────────
// Admin elimina un producto (baja lógica, no borra de la BD)
exports.eliminar = async (req, res) => {
  try {
    const [existe] = await db.query(
      'SELECT id FROM productos WHERE id = ? AND activo = 1', [req.params.id]
    );
    if (existe.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await db.query('UPDATE productos SET activo = 0 WHERE id = ?', [req.params.id]);

    res.json({ ok: true, mensaje: 'Producto eliminado del catálogo' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

// ── EXTRA: GET /api/productos/categorias ─────────────────────
// Lista las categorías disponibles (útil para RF10)
exports.categorias = async (req, res) => {
  try {
    const [categorias] = await db.query('SELECT id, nombre FROM categorias ORDER BY nombre');
    res.json({ ok: true, categorias });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};
