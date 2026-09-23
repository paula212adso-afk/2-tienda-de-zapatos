// middleware/auth.js
// Verifica el token JWT y protege rutas según rol
const jwt = require('jsonwebtoken');

// ── Verifica que el token sea válido ──────────────────────────
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, nombre, correo, rol }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// ── Solo administrador ────────────────────────────────────────
function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol admin' });
  }
  next();
}

// ── Solo cliente ──────────────────────────────────────────────
function soloCliente(req, res, next) {
  if (req.usuario?.rol !== 'cliente') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol cliente' });
  }
  next();
}

// ── Admin o cliente (cualquiera autenticado) ──────────────────
function autenticado(req, res, next) {
  // verificarToken ya corrió antes, solo pasamos
  next();
}

module.exports = { verificarToken, soloAdmin, soloCliente, autenticado };
