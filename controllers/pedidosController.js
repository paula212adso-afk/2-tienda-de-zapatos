// controllers/pedidosController.js
// RF13 — Realizar pedido
// RF14 — Consultar estado del pedido
const db = require('../config/db');

// ── RF13: POST /api/pedidos ───────────────────────────────────
// Convierte el carrito en un pedido confirmado
// Descuenta el stock de cada producto
exports.realizarPedido = async (req, res) => {
  const conn = await db.getConnection(); // transacción para garantizar integridad
  try {
    const cliente_id = req.usuario.id;

    // 1. Obtener el carrito actual del cliente
    const [items] = await conn.query(
      `SELECT c.producto_id, c.cantidad, p.precio, p.stock, p.nombre
       FROM carrito c
       JOIN productos p ON c.producto_id = p.id
       WHERE c.cliente_id = ? AND p.activo = 1`,
      [cliente_id]
    );

    if (items.length === 0) {
      conn.release();
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // 2. Verificar stock de cada producto antes de proceder
    for (const item of items) {
      if (item.cantidad > item.stock) {
        conn.release();
        return res.status(400).json({
          error: `Stock insuficiente para "${item.nombre}". Disponible: ${item.stock}`
        });
      }
    }

    // 3. Calcular total
    const total = items.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);

    await conn.beginTransaction();

    // 4. Crear el pedido
    const [pedido] = await conn.query(
      'INSERT INTO pedidos (cliente_id, estado, total) VALUES (?, ?, ?)',
      [cliente_id, 'pendiente', total.toFixed(2)]
    );
    const pedido_id = pedido.insertId;

    // 5. Insertar detalle del pedido y descontar stock
    for (const item of items) {
      await conn.query(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unit) VALUES (?, ?, ?, ?)',
        [pedido_id, item.producto_id, item.cantidad, item.precio]
      );
      await conn.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.producto_id]
      );
    }

    // 6. Vaciar el carrito
    await conn.query('DELETE FROM carrito WHERE cliente_id = ?', [cliente_id]);

    await conn.commit();
    conn.release();

    res.status(201).json({
      ok: true,
      mensaje: 'Pedido realizado exitosamente',
      pedido_id,
      total: total.toFixed(2),
      estado: 'pendiente'
    });

  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ error: 'Error al realizar el pedido' });
  }
};

// ── RF14: GET /api/pedidos ────────────────────────────────────
// Cliente consulta todos sus pedidos con su estado actual
exports.misPedidos = async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `SELECT id AS pedido_id, estado, total, creado_en, actualizado_en
       FROM pedidos
       WHERE cliente_id = ?
       ORDER BY creado_en DESC`,
      [req.usuario.id]
    );

    res.json({ ok: true, total: pedidos.length, pedidos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

// ── RF14: GET /api/pedidos/:id ────────────────────────────────
// Cliente consulta el detalle y estado de un pedido específico
exports.detallePedido = async (req, res) => {
  try {
    const cliente_id = req.usuario.id;
    const pedido_id  = req.params.id;

    // Verificar que el pedido pertenece al cliente
    const [pedido] = await db.query(
      'SELECT id, estado, total, creado_en, actualizado_en FROM pedidos WHERE id = ? AND cliente_id = ?',
      [pedido_id, cliente_id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Obtener líneas del pedido
    const [detalle] = await db.query(
      `SELECT dp.producto_id, p.nombre, p.marca, dp.cantidad,
              dp.precio_unit, dp.subtotal
       FROM detalle_pedido dp
       JOIN productos p ON dp.producto_id = p.id
       WHERE dp.pedido_id = ?`,
      [pedido_id]
    );

    res.json({
      ok: true,
      pedido: {
        ...pedido[0],
        productos: detalle
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
};

// ── ADMIN: GET /api/admin/pedidos ─────────────────────────────
// Admin ve todos los pedidos de todos los clientes
exports.todosLosPedidos = async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `SELECT p.id AS pedido_id, u.nombre AS cliente, u.correo,
              p.estado, p.total, p.creado_en
       FROM pedidos p
       JOIN usuarios u ON p.cliente_id = u.id
       ORDER BY p.creado_en DESC`
    );

    res.json({ ok: true, total: pedidos.length, pedidos });

  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

// ── ADMIN: PUT /api/admin/pedidos/:id/estado ──────────────────
// Admin actualiza el estado de un pedido
exports.actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: `Estado no válido. Opciones: ${estadosValidos.join(', ')}`
      });
    }

    const [result] = await db.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ ok: true, mensaje: `Estado actualizado a: ${estado}` });

  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};
