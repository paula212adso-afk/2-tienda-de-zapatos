const jwt = require('jsonwebtoken');

/**
 * Verifica el token JWT enviado en el header Authorization: Bearer <token>
 * Deja disponible en req.usuario: { id_usuario, rol, id_referencia, correo }
 */
function autenticar(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'No se proporcionó un token de acceso' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

/**
 * Restringe el acceso a ciertos roles.
 * Uso: verificarRol('administrador'), verificarRol('administrador', 'trabajador')
 * Cumple RF05-CA09, RF06-CA07 (control de acceso y permisos insuficientes).
 */
function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tiene permisos suficientes para realizar esta acción' });
    }
    next();
  };
}

module.exports = { autenticar, verificarRol };
