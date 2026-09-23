// routes/auth.js
const router = require('express').Router();
const ctrl   = require('../controllers/authController');

// RF01 — Cliente crea su cuenta
router.post('/registro', ctrl.registro);

// RF02 y RF03 — Login (cliente y admin usan el mismo endpoint)
router.post('/login', ctrl.login);

module.exports = router;
