const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cliente = sequelize.define('Cliente', {
  id_cliente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  telefono: { type: DataTypes.STRING(20), allowNull: true },
  direccion: { type: DataTypes.STRING(200), allowNull: true },
  creado_por: { type: DataTypes.INTEGER, allowNull: true }, // id_administrador, null si fue autoregistro
  estado: { type: DataTypes.ENUM('activo', 'inactivo'), allowNull: false, defaultValue: 'activo' },
}, {
  tableName: 'clientes',
  timestamps: false,
});

module.exports = Cliente;
