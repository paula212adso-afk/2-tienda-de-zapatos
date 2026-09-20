const jwt = require('jsonwebtoken');

/**
 * @param {object} usuario - registro de la tabla usuarios
 * @param {string} rol - 'administrador' | 'trabajador' | 'cliente'
 * @param {number} id_referencia - id_administrador / id_trabajador / id_cliente
 */
function generarToken(usuario, rol, id_referencia) {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      nombre: usuario.nombre,
      rol,
      id_referencia,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

module.exports = generarToken;
