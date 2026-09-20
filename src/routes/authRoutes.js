const express = require('express');
const router = express.Router();
const { registroCliente, login } = require('../controllers/authController');

router.post('/registro-cliente', registroCliente); // RF01: autoregistro
router.post('/login', login); // RF01 / RF02: login

module.exports = router;
