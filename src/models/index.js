const sequelize = require('../config/db');
const Usuario = require('./Usuario');
const Administrador = require('./Administrador');
const Trabajador = require('./Trabajador');
const Cliente = require('./Cliente');
const Categoria = require('./Categoria');
const Proveedor = require('./Proveedor');
const Producto = require('./Producto');
const HistorialMovimiento = require('./HistorialMovimiento');

// Usuario 1:1 Administrador / Trabajador / Cliente
Usuario.hasOne(Administrador, { foreignKey: 'id_usuario' });
Administrador.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Usuario.hasOne(Trabajador, { foreignKey: 'id_usuario' });
Trabajador.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Usuario.hasOne(Cliente, { foreignKey: 'id_usuario' });
Cliente.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Administrador crea Trabajadores / Clientes
Administrador.hasMany(Trabajador, { foreignKey: 'creado_por' });
Trabajador.belongsTo(Administrador, { foreignKey: 'creado_por' });

Administrador.hasMany(Cliente, { foreignKey: 'creado_por' });
Cliente.belongsTo(Administrador, { foreignKey: 'creado_por' });

// Producto <-> Categoria / Proveedor
Categoria.hasMany(Producto, { foreignKey: 'id_categoria' });
Producto.belongsTo(Categoria, { foreignKey: 'id_categoria' });

Proveedor.hasMany(Producto, { foreignKey: 'id_proveedor' });
Producto.belongsTo(Proveedor, { foreignKey: 'id_proveedor' });

// Historial de movimientos
Producto.hasMany(HistorialMovimiento, { foreignKey: 'id_producto' });
HistorialMovimiento.belongsTo(Producto, { foreignKey: 'id_producto' });

Usuario.hasMany(HistorialMovimiento, { foreignKey: 'id_usuario' });
HistorialMovimiento.belongsTo(Usuario, { foreignKey: 'id_usuario' });

module.exports = {
  sequelize,
  Usuario,
  Administrador,
  Trabajador,
  Cliente,
  Categoria,
  Proveedor,
  Producto,
  HistorialMovimiento,
};
