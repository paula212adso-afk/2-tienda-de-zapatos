const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Usuario = sequelize.define('Usuario', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  correo: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  contrasena: { type: DataTypes.STRING(255), allowNull: false },
  fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'usuarios',
  timestamps: false,
});

module.exports = Usuario;
