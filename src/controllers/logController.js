const { LogAcaoAdmin, Administrador } = require('../models');

const listar = async (req, res) => {
  try {
    const { id_admin, entidade, entidade_id } = req.query;
    const where = {};
    if (id_admin) where.id_admin = id_admin;
    if (entidade) where.entidade = entidade;
    if (entidade_id) where.entidade_id = entidade_id;

    const logs = await LogAcaoAdmin.findAll({
      where,
      include: [
        { model: Administrador, as: 'admin', attributes: ['id_admin', 'nome', 'email'] },
      ],
      order: [['realizado_em', 'DESC']],
    });
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar logs', detalhe: error.message });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const log = await LogAcaoAdmin.findByPk(req.params.id, {
      include: [
        { model: Administrador, as: 'admin', attributes: ['id_admin', 'nome', 'email'] },
      ],
    });
    if (!log) return res.status(404).json({ erro: 'Log não encontrado' });
    return res.json(log);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar log', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId };