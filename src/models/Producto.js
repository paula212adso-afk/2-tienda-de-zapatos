const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Producto = sequelize.define('Producto', {
  id_producto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.STRING(255), allowNull: true },
  imagen: { type: DataTypes.STRING(255), allowNull: true },
  precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  stock_minimo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  tallas: { type: DataTypes.STRING(100), allowNull: true },
  estado: { type: DataTypes.ENUM('activo', 'inactivo'), allowNull: false, defaultValue: 'activo' },
  id_categoria: { type: DataTypes.INTEGER, allowNull: true },
  id_proveedor: { type: DataTypes.INTEGER, allowNull: true },
  fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  fecha_actualizacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'productos',
  timestamps: false,
});

module.exports = Producto;
