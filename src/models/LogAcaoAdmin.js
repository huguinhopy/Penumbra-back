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
    id_reserva: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'reservas', key: 'id_reserva' },
    },
    acao: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Ação não pode ser vazia' },
      },
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
