const { LogAcaoAdmin, Administrador, Reserva } = require('../models');

// GET /logs
const listar = async (req, res) => {
  try {
    const { id_admin, id_reserva } = req.query;
    const where = {};
    if (id_admin) where.id_admin = id_admin;
    if (id_reserva) where.id_reserva = id_reserva;

    const logs = await LogAcaoAdmin.findAll({
      where,
      include: [
        { model: Administrador, as: 'admin', attributes: ['id_admin', 'nome', 'email'] },
        { model: Reserva, as: 'reserva', attributes: ['id_reserva', 'nome', 'email', 'status'] },
      ],
      order: [['realizado_em', 'DESC']],
    });
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar logs', detalhe: error.message });
  }
};

// GET /logs/:id
const buscarPorId = async (req, res) => {
  try {
    const log = await LogAcaoAdmin.findByPk(req.params.id, {
      include: [
        { model: Administrador, as: 'admin', attributes: ['id_admin', 'nome', 'email'] },
        { model: Reserva, as: 'reserva' },
      ],
    });
    if (!log) return res.status(404).json({ erro: 'Log não encontrado' });
    return res.json(log);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar log', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId };
