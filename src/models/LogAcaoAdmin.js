const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogAcaoAdmin = sequelize.define(
  'LogAcaoAdmin',
  {
    id_log: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_admin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'administradores', key: 'id_admin' },
    },
    acao: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Ação não pode ser vazia' },
      },
    },
    entidade: {
      type: DataTypes.ENUM('reserva', 'mesa', 'admin', 'auth'),
      allowNull: false,
    },
    entidade_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    realizado_em: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'log_acoes_admin',
    timestamps: false,
  }
);

module.exports = LogAcaoAdmin;