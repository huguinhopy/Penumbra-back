const sequelize = require('../config/database');
const Mesa = require('./Mesa');
const Reserva = require('./Reserva');
const Administrador = require('./Administrador');
const LogAcaoAdmin = require('./LogAcaoAdmin');

Mesa.hasMany(Reserva, { foreignKey: 'id_mesa', as: 'reservas' });
Reserva.belongsTo(Mesa, { foreignKey: 'id_mesa', as: 'mesa' });

Administrador.hasMany(LogAcaoAdmin, { foreignKey: 'id_admin', as: 'logs' });
LogAcaoAdmin.belongsTo(Administrador, { foreignKey: 'id_admin', as: 'admin' });

module.exports = { sequelize, Mesa, Reserva, Administrador, LogAcaoAdmin };