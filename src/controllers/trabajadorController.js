const bcrypt = require('bcryptjs');
const { Usuario, Trabajador } = require('../models');

/**
 * RF02 - Pasos 1-4: El administrador crea una cuenta de trabajador.
 * POST /api/trabajadores
 */
async function crearTrabajador(req, res) {
  const { nombre, correo, contrasena, cargo, permisos_inventario } = req.body;
  const id_administrador = req.usuario.id_referencia;

  if (!nombre || !correo || !contrasena || !cargo) {
    return res.status(400).json({ mensaje: 'Nombre, correo, contraseña y cargo son obligatorios' });
  }

  try {
    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) {
      return res.status(409).json({ mensaje: 'El correo ya se encuentra registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuario.create({ nombre, correo, contrasena: hash });
    const trabajador = await Trabajador.create({
      id_usuario: usuario.id_usuario,
      cargo,
      permisos_inventario: permisos_inventario ?? true,
      creado_por: id_administrador,
      estado: 'activo',
    });

    return res.status(201).json({
      mensaje: 'Trabajador creado exitosamente',
      trabajador: { id_trabajador: trabajador.id_trabajador, nombre, correo, cargo },
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al crear el trabajador', error: error.message });
  }
}

/**
 * GET /api/trabajadores
 */
async function listarTrabajadores(req, res) {
  try {
    const trabajadores = await Trabajador.findAll({ include: [{ model: Usuario, attributes: ['nombre', 'correo'] }] });
    return res.json(trabajadores);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al listar trabajadores', error: error.message });
  }
}

/**
 * GET /api/trabajadores/:id
 */
async function obtenerTrabajador(req, res) {
  try {
    const trabajador = await Trabajador.findByPk(req.params.id, {
      include: [{ model: Usuario, attributes: ['nombre', 'correo'] }],
    });
    if (!trabajador) {
      return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
    }
    return res.json(trabajador);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener el trabajador', error: error.message });
  }
}

/**
 * RF07: Eliminar (o inactivar) la cuenta de un trabajador.
 * DELETE /api/trabajadores/:id
 */
async function eliminarTrabajador(req, res) {
  try {
    const trabajador = await Trabajador.findByPk(req.params.id);
    if (!trabajador) {
      return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
    }

    try {
      await trabajador.destroy();
      return res.json({ mensaje: 'Cuenta de trabajador eliminada correctamente' });
    } catch (fkError) {
      // El trabajador tiene procesos pendientes asociados (p. ej. historial_movimientos)
      trabajador.estado = 'inactivo';
      await trabajador.save();
      return res.status(409).json({
        mensaje: 'No es posible eliminar esta cuenta porque tiene información asociada. La cuenta fue marcada como inactiva.',
      });
    }
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al eliminar el trabajador', error: error.message });
  }
}

module.exports = { crearTrabajador, listarTrabajadores, obtenerTrabajador, eliminarTrabajador };
