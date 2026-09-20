const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const trabajadorRoutes = require('./routes/trabajadorRoutes');
const productoRoutes = require('./routes/productoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Tienda de Zapatos - Grupo Mil Millas', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);          // RF01 (autoregistro/login), RF02 (login)
app.use('/api/clientes', clienteRoutes);   // RF01 (admin), RF08
app.use('/api/trabajadores', trabajadorRoutes); // RF02 (admin), RF07
app.use('/api/productos', productoRoutes); // RF03, RF04, RF05, RF06

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

module.exports = app;
