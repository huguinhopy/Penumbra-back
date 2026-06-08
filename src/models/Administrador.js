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
      type: DataTypes.ENUM('atendente', 'gerente', 'administrador', 'dono'),
      allowNull: false,
      defaultValue: 'atendente',
    },
    tentativas_login: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bloqueado_ate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ultimo_acesso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'administradores',
    timestamps: false,
  }
);

module.exports = Administrador;