const bcrypt = require('bcryptjs');
const { Usuario, Administrador, Trabajador, Cliente } = require('../models');
const generarToken = require('../utils/generarToken');

/**
 * RF01 - Pasos 5,6,7: Autoregistro de cliente desde el sitio web.
 * POST /api/auth/registro-cliente
 */
async function registroCliente(req, res) {
  const { nombre, correo, contrasena, telefono, direccion } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios' });
  }

  try {
    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) {
      // RF01 - Alternativa: correo ya registrado
      return res.status(409).json({ mensaje: 'El correo ya se encuentra registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const usuario = await Usuario.create({ nombre, correo, contrasena: hash });
    const cliente = await Cliente.create({
      id_usuario: usuario.id_usuario,
      telefono: telefono || null,
      direccion: direccion || null,
      creado_por: null, // autoregistro
      estado: 'activo',
    });

    const token = generarToken(usuario, 'cliente', cliente.id_cliente);

    return res.status(201).json({
      mensaje: 'Cuenta de cliente creada exitosamente',
      token,
      usuario: { id_usuario: usuario.id_usuario, nombre, correo, rol: 'cliente' },
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al registrar el cliente', error: error.message });
  }
}

/**
 * RF01 - Pasos 8,9 / RF02 - Pasos 5,6,7: Login para cliente, trabajador o administrador.
 * POST /api/auth/login
 */
async function login(req, res) {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
  }

  try {
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    // Determinar el rol consultando cada tabla de perfil
    const admin = await Administrador.findOne({ where: { id_usuario: usuario.id_usuario } });
    if (admin) {
      const token = generarToken(usuario, 'administrador', admin.id_administrador);
      return res.json({
        mensaje: 'Inicio de sesión exitoso',
        token,
        usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, rol: 'administrador' },
      });
    }

    const trabajador = await Trabajador.findOne({ where: { id_usuario: usuario.id_usuario } });
    if (trabajador) {
      if (trabajador.estado === 'inactivo') {
        return res.status(403).json({ mensaje: 'Esta cuenta ha sido desactivada' });
      }
      const token = generarToken(usuario, 'trabajador', trabajador.id_trabajador);
      return res.json({
        mensaje: 'Inicio de sesión exitoso',
        token,
        usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, rol: 'trabajador' },
      });
    }

    const cliente = await Cliente.findOne({ where: { id_usuario: usuario.id_usuario } });
    if (cliente) {
      if (cliente.estado === 'inactivo') {
        return res.status(403).json({ mensaje: 'Esta cuenta ha sido desactivada' });
      }
      const token = generarToken(usuario, 'cliente', cliente.id_cliente);
      return res.json({
        mensaje: 'Inicio de sesión exitoso',
        token,
        usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, rol: 'cliente' },
      });
    }

    // Usuario existe en la tabla base pero no tiene perfil asociado
    return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
}

module.exports = { registroCliente, login };
