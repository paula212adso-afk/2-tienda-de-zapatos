const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Administrador = sequelize.define('Administrador', {
  id_administrador: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  nivel_acceso: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'estandar' },
}, {
  tableName: 'administradores',
  timestamps: false,
});

module.exports = Administrador;
