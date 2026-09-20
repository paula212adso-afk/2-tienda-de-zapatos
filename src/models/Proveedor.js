const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Proveedor = sequelize.define('Proveedor', {
  id_proveedor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  telefono: { type: DataTypes.STRING(20), allowNull: true },
  correo: { type: DataTypes.STRING(150), allowNull: true },
  direccion: { type: DataTypes.STRING(200), allowNull: true },
}, {
  tableName: 'proveedores',
  timestamps: false,
});

module.exports = Proveedor;
