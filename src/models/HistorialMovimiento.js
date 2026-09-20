const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HistorialMovimiento = sequelize.define('HistorialMovimiento', {
  id_movimiento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo_operacion: { type: DataTypes.ENUM('agregar', 'editar', 'eliminar', 'inactivar'), allowNull: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  id_producto: { type: DataTypes.INTEGER, allowNull: false },
  detalle: { type: DataTypes.STRING(500), allowNull: true },
}, {
  tableName: 'historial_movimientos',
  timestamps: false,
});

module.exports = HistorialMovimiento;
