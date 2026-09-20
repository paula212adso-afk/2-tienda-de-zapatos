const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Categoria = sequelize.define('Categoria', {
  id_categoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  descripcion: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'categorias',
  timestamps: false,
});

module.exports = Categoria;
