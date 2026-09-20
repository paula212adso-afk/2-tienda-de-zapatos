const express = require('express');
const router = express.Router();
const { autenticar, verificarRol } = require('../middleware/auth');
const {
  consultarCatalogo,
  consultarInventario,
  agregarProducto,
  editarProducto,
  eliminarProducto,
} = require('../controllers/productoController');

// RF03: catálogo público, no requiere autenticación
router.get('/catalogo', consultarCatalogo);

// RF04: inventario completo, solo administrador y trabajador
router.get('/inventario', autenticar, verificarRol('administrador', 'trabajador'), consultarInventario);

// RF05 (trabajador) y RF06 (administrador): gestionar productos
router.post('/', autenticar, verificarRol('administrador', 'trabajador'), agregarProducto);
router.put('/:id', autenticar, verificarRol('administrador', 'trabajador'), editarProducto);
router.delete('/:id', autenticar, verificarRol('administrador', 'trabajador'), eliminarProducto);

module.exports = router;
