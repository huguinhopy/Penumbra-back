const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Administrador = sequelize.define(
  'Administrador',
  {
    id_admin: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nome não pode ser vazio' },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: { msg: 'Este e-mail já está cadastrado' },
      validate: {
        isEmail: { msg: 'E-mail inválido' },
      },
    },
    senha_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nivel_acesso: {
      type: DataTypes.ENUM('super_admin', 'admin'),
      allowNull: false,
      defaultValue: 'admin',
    },
  },
  {
    tableName: 'administradores',
    timestamps: false,
  }
);

module.exports = Administrador;
