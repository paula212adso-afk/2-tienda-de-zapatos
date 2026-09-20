const express = require('express');
const router = express.Router();
const { autenticar, verificarRol } = require('../middleware/auth');
const {
  crearCliente,
  listarClientes,
  obtenerCliente,
  eliminarCliente,
} = require('../controllers/clienteController');

// Todas las rutas requieren estar autenticado y ser administrador (RF01, RF08)
router.use(autenticar, verificarRol('administrador'));

router.post('/', crearCliente);
router.get('/', listarClientes);
router.get('/:id', obtenerCliente);
router.delete('/:id', eliminarCliente);

module.exports = router;
