// server.js — Punto de entrada de la API
require('dotenv').config();
const express = require('express');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARES GLOBALES ───────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── RUTAS ─────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/carrito',   require('./routes/carrito'));
app.use('/api/pedidos',   require('./routes/pedidos'));

// ── RUTA RAÍZ — verifica que la API está viva ─────────────────
app.get('/', (req, res) => {
  res.json({
    mensaje: '👟 API Tienda de Zapatos funcionando',
    version: '1.0.0',
    endpoints: {
      auth:      '/api/auth',
      productos: '/api/productos',
      carrito:   '/api/carrito',
      pedidos:   '/api/pedidos'
    }
  });
});

// ── MANEJO DE RUTAS NO ENCONTRADAS ───────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ── ARRANCAR SERVIDOR ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});
