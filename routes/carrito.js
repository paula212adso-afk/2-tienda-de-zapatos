// routes/carrito.js
const router = require('express').Router();
const ctrl   = require('../controllers/carritoController');
const { verificarToken, soloCliente } = require('../middleware/auth');

// Todas las rutas del carrito requieren ser cliente autenticado
router.use(verificarToken, soloCliente);

router.get('/',        ctrl.verCarrito);         // RF12 — ver carrito
router.post('/',       ctrl.agregar);            // RF12 — agregar ítem
router.put('/:id',     ctrl.actualizarCantidad); // RF11 — cambiar cantidad
router.delete('/todo', ctrl.vaciarCarrito);       // vaciar todo
router.delete('/:id',  ctrl.eliminarItem);        // RF12 — eliminar ítem

module.exports = router;
