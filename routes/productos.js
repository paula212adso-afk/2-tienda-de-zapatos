// routes/productos.js
const router = require('express').Router();
const ctrl   = require('../controllers/productosController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// ── Públicas (cualquiera autenticado puede ver) ───────────────
router.get('/categorias',  ctrl.categorias);          // lista de categorías (RF10)
router.get('/',            verificarToken, ctrl.listar);   // RF07, RF09, RF10
router.get('/:id',         verificarToken, ctrl.detalle);  // RF08

// ── Solo admin ────────────────────────────────────────────────
router.post('/',           verificarToken, soloAdmin, ctrl.crear);     // RF04
router.put('/:id',         verificarToken, soloAdmin, ctrl.modificar); // RF05
router.delete('/:id',      verificarToken, soloAdmin, ctrl.eliminar);  // RF06

module.exports = router;
