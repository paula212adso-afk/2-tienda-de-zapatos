const { Op } = require('sequelize');
const { Producto, HistorialMovimiento, Categoria, Proveedor } = require('../models');

/**
 * RF03: Consultar catálogo de productos (cliente / público).
 * Muestra solo productos activos con información básica: imagen, nombre, precio.
 * GET /api/catalogo
 */
async function consultarCatalogo(req, res) {
  try {
    const productos = await Producto.findAll({
      where: { estado: 'activo' },
      attributes: ['id_producto', 'nombre', 'imagen', 'precio', 'tallas'],
    });

    if (productos.length === 0) {
      // RF03 - Alternativa
      return res.json({ mensaje: 'No hay productos disponibles', productos: [] });
    }

    return res.json(productos);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al consultar el catálogo', error: error.message });
  }
}

/**
 * RF04: Consultar inventario completo (administrador / trabajador).
 * Incluye todos los productos, tallas y cantidades disponibles.
 * GET /api/inventario
 */
async function consultarInventario(req, res) {
  try {
    const productos = await Producto.findAll({
      include: [
        { model: Categoria, attributes: ['nombre'] },
        { model: Proveedor, attributes: ['nombre'] },
      ],
    });

    if (productos.length === 0) {
      // RF04 - Alternativa
      return res.json({ mensaje: 'No hay productos registrados en el inventario', productos: [] });
    }

    return res.json(productos);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al consultar el inventario', error: error.message });
  }
}

/**
 * RF05 (trabajador) / RF06 (administrador): Agregar producto.
 * POST /api/productos
 */
async function agregarProducto(req, res) {
  const { codigo, nombre, descripcion, imagen, precio, stock, stock_minimo, tallas, id_categoria, id_proveedor } = req.body;

  // RF05-CA02: validación de campos obligatorios y formato
  if (!codigo || !nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({ mensaje: 'Código, nombre, precio y stock son obligatorios' });
  }
  if (Number(precio) < 0) {
    return res.status(400).json({ mensaje: 'El precio no puede ser negativo' });
  }
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    return res.status(400).json({ mensaje: 'El stock debe ser un número entero no negativo' });
  }

  try {
    // RF05-CA03: prevención de productos duplicados (mismo código o nombre)
    const duplicado = await Producto.findOne({
      where: { [Op.or]: [{ codigo }, { nombre }] },
    });
    if (duplicado) {
      return res.status(409).json({ mensaje: 'El producto ya existe en el inventario' });
    }

    const producto = await Producto.create({
      codigo,
      nombre,
      descripcion,
      imagen,
      precio,
      stock,
      stock_minimo: stock_minimo || 0,
      tallas,
      id_categoria: id_categoria || null,
      id_proveedor: id_proveedor || null,
      estado: 'activo',
    });

    await HistorialMovimiento.create({
      tipo_operacion: 'agregar',
      id_usuario: req.usuario.id_usuario,
      id_producto: producto.id_producto,
      detalle: `Producto "${nombre}" agregado por ${req.usuario.rol} (${req.usuario.correo})`,
    });

    return res.status(201).json({ mensaje: 'Producto agregado exitosamente', producto });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al agregar el producto', error: error.message });
  }
}

/**
 * RF05 (trabajador) / RF06 (administrador): Editar producto.
 * PUT /api/productos/:id
 */
async function editarProducto(req, res) {
  const { id } = req.params;
  const { nombre, descripcion, imagen, precio, stock, stock_minimo, tallas, id_categoria, id_proveedor, estado } = req.body;

  try {
    const producto = await Producto.findByPk(id);
    if (!producto) {
      // RF06-CA03: producto no encontrado
      return res.status(404).json({ mensaje: 'El producto ya no existe en el inventario' });
    }

    if (precio !== undefined && Number(precio) < 0) {
      return res.status(400).json({ mensaje: 'El precio no puede ser negativo' });
    }
    if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
      return res.status(400).json({ mensaje: 'El stock debe ser un número entero no negativo' });
    }

    const valoresAnteriores = {
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      estado: producto.estado,
    };

    if (nombre !== undefined) producto.nombre = nombre;
    if (descripcion !== undefined) producto.descripcion = descripcion;
    if (imagen !== undefined) producto.imagen = imagen;
    if (precio !== undefined) producto.precio = precio;
    if (stock !== undefined) producto.stock = stock;
    if (stock_minimo !== undefined) producto.stock_minimo = stock_minimo;
    if (tallas !== undefined) producto.tallas = tallas;
    if (id_categoria !== undefined) producto.id_categoria = id_categoria;
    if (id_proveedor !== undefined) producto.id_proveedor = id_proveedor;
    if (estado !== undefined) producto.estado = estado;

    await producto.save();

    await HistorialMovimiento.create({
      tipo_operacion: 'editar',
      id_usuario: req.usuario.id_usuario,
      id_producto: producto.id_producto,
      detalle: `Editado por ${req.usuario.rol} (${req.usuario.correo}). Antes: ${JSON.stringify(valoresAnteriores)}`,
    });

    return res.json({ mensaje: 'Producto actualizado exitosamente', producto });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al actualizar el producto', error: error.message });
  }
}

/**
 * RF05 (trabajador) / RF06 (administrador): Eliminar producto.
 * DELETE /api/productos/:id
 *
 * A4/A4 (ambos RF): si el producto tiene dependencias activas (historial de
 * movimientos u otras tablas futuras como ventas), se impide la eliminación
 * física y se sugiere/aplica la inactivación lógica.
 */
async function eliminarProducto(req, res) {
  const { id } = req.params;

  try {
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'El producto ya no existe en el inventario' });
    }

    const tieneMovimientos = await HistorialMovimiento.count({ where: { id_producto: id } });

    if (tieneMovimientos > 0) {
      // Dependencias activas -> inactivación lógica en lugar de eliminación física
      producto.estado = 'inactivo';
      await producto.save();

      await HistorialMovimiento.create({
        tipo_operacion: 'inactivar',
        id_usuario: req.usuario.id_usuario,
        id_producto: producto.id_producto,
        detalle: `Inactivado por ${req.usuario.rol} (${req.usuario.correo}) por tener movimientos asociados`,
      });

      return res.status(409).json({
        mensaje: 'Este producto no puede eliminarse porque tiene movimientos asociados. Se marcó como inactivo.',
        producto,
      });
    }

    // Nota: historial_movimientos tiene ON DELETE RESTRICT hacia productos,
    // por lo que NO se puede registrar el log de "eliminar" antes de borrar
    // (bloquearía el propio borrado) ni después (el producto ya no existe).
    // Como agregarProducto siempre deja un registro "agregar", en la práctica
    // esta rama de eliminación física solo se alcanza si nunca hubo movimientos
    // (por ejemplo, un producto insertado directamente en la BD).
    await producto.destroy();

    return res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al eliminar el producto', error: error.message });
  }
}

module.exports = {
  consultarCatalogo,
  consultarInventario,
  agregarProducto,
  editarProducto,
  eliminarProducto,
};
