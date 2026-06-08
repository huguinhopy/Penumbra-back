const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reserva = sequelize.define(
  'Reserva',
  {
    id_reserva: {
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
      validate: {
        isEmail: { msg: 'E-mail inválido' },
      },
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    id_mesa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'mesas', key: 'id_mesa' },
    },
    data_hora: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Data/hora inválida' },
        isFuture(value) {
          if (new Date(value) <= new Date()) {
            throw new Error('A reserva deve ser para uma data futura');
          }
        },
      },
    },
    num_pessoas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'Número de pessoas deve ser pelo menos 1' },
      },
    },
    status: {
      type: DataTypes.ENUM('pendente', 'confirmada', 'cancelada', 'concluida'),
      allowNull: false,
      defaultValue: 'pendente',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    criado_em: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    atualizado_em: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'reservas',
    timestamps: false,
    hooks: {
      beforeUpdate: (reserva) => {
        reserva.atualizado_em = new Date();
      },
    },
  }
);

module.exports = Reserva;