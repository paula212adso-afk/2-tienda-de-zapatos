const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Trabajador = sequelize.define('Trabajador', {
  id_trabajador: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  cargo: { type: DataTypes.STRING(100), allowNull: false },
  permisos_inventario: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  creado_por: { type: DataTypes.INTEGER, allowNull: false }, // id_administrador
  estado: { type: DataTypes.ENUM('activo', 'inactivo'), allowNull: false, defaultValue: 'activo' },
}, {
  tableName: 'trabajadores',
  timestamps: false,
});

module.exports = Trabajador;
