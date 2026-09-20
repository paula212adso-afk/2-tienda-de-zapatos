/**
 * Crea el primer administrador del sistema con la contraseña hasheada
 * correctamente (el script SQL trae un registro de ejemplo con una
 * contraseña sin hashear, que no sirve para iniciar sesión).
 *
 * Uso:
 *   node src/utils/seedAdmin.js "Nombre Admin" correo@ejemplo.com "contraseña123"
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Administrador } = require('../models');

async function seedAdmin() {
  const [, , nombre, correo, contrasena] = process.argv;

  if (!nombre || !correo || !contrasena) {
    console.log('Uso: node src/utils/seedAdmin.js "Nombre" correo@ejemplo.com contraseña');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();

    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) {
      console.log('Ya existe un usuario con ese correo.');
      process.exit(1);
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuario.create({ nombre, correo, contrasena: hash });
    await Administrador.create({ id_usuario: usuario.id_usuario, nivel_acceso: 'total' });

    console.log(`✅ Administrador "${nombre}" creado con correo ${correo}.`);
    process.exit(0);
  } catch (error) {
    console.error('Error creando administrador:', error.message);
    process.exit(1);
  }
}

seedAdmin();
