const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mesa = sequelize.define(
  'Mesa',
  {
    id_mesa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'Número da mesa deve ser positivo' },
      },
    },
    capacidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'Capacidade deve ser de pelo menos 1 pessoa' },
        max: { args: [50], msg: 'Capacidade não pode exceder 50 pessoas' },
      },
    },
    ativa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'mesas',
    timestamps: false,
  }
);

module.exports = Mesa;
