// controllers/carritoController.js
// RF11 — Gestionar cantidades (aumentar / disminuir)
// RF12 — Carrito de compras (agregar, ver, eliminar ítem)
const db = require('../config/db');

// ── RF12: GET /api/carrito ────────────────────────────────────
// Cliente ve su carrito con subtotales y total
exports.verCarrito = async (req, res) => {
  try {
    const cliente_id = req.usuario.id;

    const [items] = await db.query(
      `SELECT c.id, p.id AS producto_id, p.nombre, p.marca,
              p.precio, p.imagen_url, c.cantidad,
              (p.precio * c.cantidad) AS subtotal
       FROM carrito c
       JOIN productos p ON c.producto_id = p.id
       WHERE c.cliente_id = ? AND p.activo = 1`,
      [cliente_id]
    );

    const total = items.reduce((sum, i) => sum + Number(i.subtotal), 0);

    res.json({ ok: true, items, total: total.toFixed(2) });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

// ── RF12: POST /api/carrito ───────────────────────────────────
// Cliente agrega un producto al carrito
// Si el producto ya está, aumenta la cantidad
exports.agregar = async (req, res) => {
  try {
    const cliente_id  = req.usuario.id;
    const { producto_id, cantidad = 1 } = req.body;

    if (!producto_id) {
      return res.status(400).json({ error: 'producto_id es obligatorio' });
    }
    if (cantidad < 1) {
      return res.status(400).json({ error: 'La cantidad debe ser al menos 1' });
    }

    // Verificar que el producto existe y tiene stock
    const [prod] = await db.query(
      'SELECT id, stock FROM productos WHERE id = ? AND activo = 1',
      [producto_id]
    );
    if (prod.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar stock suficiente
    const [enCarrito] = await db.query(
      'SELECT cantidad FROM carrito WHERE cliente_id = ? AND producto_id = ?',
      [cliente_id, producto_id]
    );
    const cantidadActual = enCarrito.length > 0 ? enCarrito[0].cantidad : 0;

    if (cantidadActual + cantidad > prod[0].stock) {
      return res.status(400).json({
        error: `Stock insuficiente. Disponible: ${prod[0].stock}, en carrito: ${cantidadActual}`
      });
    }

    // INSERT o UPDATE (si ya existe en el carrito)
    await db.query(
      `INSERT INTO carrito (cliente_id, producto_id, cantidad)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`,
      [cliente_id, producto_id, cantidad]
    );

    res.json({ ok: true, mensaje: 'Producto agregado al carrito' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
};

// ── RF11: PUT /api/carrito/:id ────────────────────────────────
// Cliente cambia la cantidad de un ítem del carrito
exports.actualizarCantidad = async (req, res) => {
  try {
    const cliente_id = req.usuario.id;
    const { cantidad } = req.body;
    const { id }       = req.params; // id del carrito

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ error: 'La cantidad debe ser al menos 1' });
    }

    // Verificar que el ítem pertenece al cliente
    const [item] = await db.query(
      'SELECT c.id, c.producto_id FROM carrito c WHERE c.id = ? AND c.cliente_id = ?',
      [id, cliente_id]
    );
    if (item.length === 0) {
      return res.status(404).json({ error: 'Ítem no encontrado en tu carrito' });
    }

    // Verificar stock
    const [prod] = await db.query(
      'SELECT stock FROM productos WHERE id = ?', [item[0].producto_id]
    );
    if (cantidad > prod[0].stock) {
      return res.status(400).json({
        error: `Stock insuficiente. Disponible: ${prod[0].stock}`
      });
    }

    await db.query('UPDATE carrito SET cantidad = ? WHERE id = ?', [cantidad, id]);

    res.json({ ok: true, mensaje: 'Cantidad actualizada' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cantidad' });
  }
};

// ── RF12: DELETE /api/carrito/:id ─────────────────────────────
// Cliente elimina un ítem del carrito
exports.eliminarItem = async (req, res) => {
  try {
    const cliente_id = req.usuario.id;

    const [result] = await db.query(
      'DELETE FROM carrito WHERE id = ? AND cliente_id = ?',
      [req.params.id, cliente_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ítem no encontrado en tu carrito' });
    }

    res.json({ ok: true, mensaje: 'Ítem eliminado del carrito' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
};

// ── EXTRA: DELETE /api/carrito ────────────────────────────────
// Vacía todo el carrito del cliente
exports.vaciarCarrito = async (req, res) => {
  try {
    await db.query('DELETE FROM carrito WHERE cliente_id = ?', [req.usuario.id]);
    res.json({ ok: true, mensaje: 'Carrito vaciado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
};
