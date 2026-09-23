// routes/pedidos.js
const router = require('express').Router();
const ctrl   = require('../controllers/pedidosController');
const { verificarToken, soloCliente, soloAdmin } = require('../middleware/auth');

// ── Rutas del cliente ─────────────────────────────────────────
router.post('/',    verificarToken, soloCliente, ctrl.realizarPedido);  // RF13
router.get('/',     verificarToken, soloCliente, ctrl.misPedidos);      // RF14
router.get('/:id',  verificarToken, soloCliente, ctrl.detallePedido);   // RF14 detalle

// ── Rutas del admin ───────────────────────────────────────────
router.get('/admin/todos',          verificarToken, soloAdmin, ctrl.todosLosPedidos);
router.put('/admin/:id/estado',     verificarToken, soloAdmin, ctrl.actualizarEstado);

module.exports = router;
