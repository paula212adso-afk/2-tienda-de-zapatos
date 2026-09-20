const express = require('express');
const router = express.Router();
const { autenticar, verificarRol } = require('../middleware/auth');
const {
  crearTrabajador,
  listarTrabajadores,
  obtenerTrabajador,
  eliminarTrabajador,
} = require('../controllers/trabajadorController');

// Todas las rutas requieren estar autenticado y ser administrador (RF02, RF07)
router.use(autenticar, verificarRol('administrador'));

router.post('/', crearTrabajador);
router.get('/', listarTrabajadores);
router.get('/:id', obtenerTrabajador);
router.delete('/:id', eliminarTrabajador);

module.exports = router;
