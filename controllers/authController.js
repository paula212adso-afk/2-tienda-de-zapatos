// controllers/authController.js
// RF01 — Crear cuenta cliente
// RF02 — Login cliente
// RF03 — Login administrador
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// ── RF01: POST /api/auth/registro ────────────────────────────
// El cliente crea su propia cuenta
exports.registro = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    // Validaciones básicas
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
    }
    if (contrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el correo ya existe
    const [existe] = await db.query(
      'SELECT id FROM usuarios WHERE correo = ?', [correo]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Cifrar contraseña y guardar
    const hash = await bcrypt.hash(contrasena, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, hash, 'cliente']
    );

    res.status(201).json({
      ok: true,
      mensaje: 'Cuenta creada exitosamente',
      id: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── RF02 y RF03: POST /api/auth/login ────────────────────────
// Tanto cliente como admin usan el mismo endpoint
// El sistema detecta el rol y devuelve el token con ese rol
exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    // Buscar usuario activo
    const [rows] = await db.query(
      'SELECT id, nombre, correo, contrasena, rol FROM usuarios WHERE correo = ? AND activo = 1',
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];

    // Verificar contraseña
    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '8h' }
    );

    res.json({
      ok: true,
      token,
      usuario: {
        id:     usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol:    usuario.rol
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
