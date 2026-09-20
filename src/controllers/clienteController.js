const bcrypt = require('bcryptjs');
const { Usuario, Cliente } = require('../models');

/**
 * RF01 - Pasos 1-4: El administrador crea una cuenta de cliente.
 * POST /api/clientes
 */
async function crearCliente(req, res) {
  const { nombre, correo, contrasena, telefono, direccion } = req.body;
  const id_administrador = req.usuario.id_referencia;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios' });
  }

  try {
    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) {
      return res.status(409).json({ mensaje: 'El correo ya se encuentra registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuario.create({ nombre, correo, contrasena: hash });
    const cliente = await Cliente.create({
      id_usuario: usuario.id_usuario,
      telefono: telefono || null,
      direccion: direccion || null,
      creado_por: id_administrador,
      estado: 'activo',
    });

    return res.status(201).json({
      mensaje: 'Cliente creado exitosamente',
      cliente: { id_cliente: cliente.id_cliente, nombre, correo, telefono, direccion },
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al crear el cliente', error: error.message });
  }
}

/**
 * GET /api/clientes
 * Listado de clientes (administrador).
 */
async function listarClientes(req, res) {
  try {
    const clientes = await Cliente.findAll({ include: [{ model: Usuario, attributes: ['nombre', 'correo'] }] });
    return res.json(clientes);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al listar clientes', error: error.message });
  }
}

/**
 * GET /api/clientes/:id
 */
async function obtenerCliente(req, res) {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [{ model: Usuario, attributes: ['nombre', 'correo'] }],
    });
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    return res.json(cliente);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener el cliente', error: error.message });
  }
}

/**
 * RF08: Eliminar (o inactivar) la cuenta de un cliente.
 * DELETE /api/clientes/:id
 *
 * Nota: si el cliente tiene pedidos/información asociada (tablas que aún no
 * existen en este proyecto: pedidos, ventas, etc.), Sequelize/MySQL lanzará
 * un error de restricción de llave foránea que se captura abajo y se traduce
 * en la inactivación lógica sugerida por el RF.
 */
async function eliminarCliente(req, res) {
  try {
    const cliente = await Cliente.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    try {
      await cliente.destroy();
      return res.json({ mensaje: 'Cuenta de cliente eliminada correctamente' });
    } catch (fkError) {
      // El cliente tiene información asociada (pedidos u otra dependencia)
      cliente.estado = 'inactivo';
      await cliente.save();
      return res.status(409).json({
        mensaje: 'No es posible eliminar esta cuenta porque tiene información asociada. La cuenta fue marcada como inactiva.',
      });
    }
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al eliminar el cliente', error: error.message });
  }
}

module.exports = { crearCliente, listarClientes, obtenerCliente, eliminarCliente };
