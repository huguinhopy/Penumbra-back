const { Mesa, Reserva, LogAcaoAdmin } = require('../models');
const { Op } = require('sequelize');

// GET /mesas
const listar = async (req, res) => {
  try {
    const { ativa } = req.query;
    const where = {};
    if (ativa !== undefined) where.ativa = ativa === 'true';
    const mesas = await Mesa.findAll({ where, order: [['numero', 'ASC']] });
    return res.json(mesas);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar mesas', detalhe: error.message });
  }
};

// GET /mesas/:id
const buscarPorId = async (req, res) => {
  try {
    const mesa = await Mesa.findByPk(req.params.id, {
      include: [{
        model: Reserva,
        as: 'reservas',
        attributes: ['id_reserva', 'nome', 'email', 'data_hora', 'num_pessoas', 'status'],
      }],
    });
    if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });
    return res.json(mesa);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar mesa', detalhe: error.message });
  }
};

// GET /mesas/disponibilidade?data_hora=...&num_pessoas=...
const verificarDisponibilidade = async (req, res) => {
  try {
    const { data_hora, num_pessoas } = req.query;
    if (!data_hora || !num_pessoas) {
      return res.status(400).json({ erro: 'Informe data_hora e num_pessoas' });
    }
    const dataReserva = new Date(data_hora);
    const janela = 2 * 60 * 60 * 1000;
    const mesas = await Mesa.findAll({
      where: { capacidade: { [Op.gte]: parseInt(num_pessoas) }, ativa: true },
      order: [['capacidade', 'ASC']],
    });
    const disponibilidade = await Promise.all(
      mesas.map(async (mesa) => {
        const conflito = await Reserva.findOne({
          where: {
            id_mesa: mesa.id_mesa,
            status: { [Op.in]: ['pendente', 'confirmada'] },
            data_hora: {
              [Op.between]: [
                new Date(dataReserva.getTime() - janela),
                new Date(dataReserva.getTime() + janela),
              ],
            },
          },
        });
        return { ...mesa.toJSON(), disponivel: !conflito };
      })
    );
    return res.json(disponibilidade);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao verificar disponibilidade', detalhe: error.message });
  }
};

// POST /mesas
const criar = async (req, res) => {
  try {
    const { numero, capacidade, ativa } = req.body;
    const mesa = await Mesa.create({ numero, capacidade, ativa });

    await LogAcaoAdmin.create({
      id_admin: req.admin.id_admin,
      acao: 'mesa_criada',
      entidade: 'mesa',
      entidade_id: mesa.id_mesa,
      descricao: `Mesa ${mesa.numero} com ${mesa.capacidade} lugares`,
    });

    return res.status(201).json(mesa);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: error.errors.map((e) => e.message) });
    }
    return res.status(500).json({ erro: 'Erro ao criar mesa', detalhe: error.message });
  }
};

// PUT /mesas/:id
const atualizar = async (req, res) => {
  try {
    const mesa = await Mesa.findByPk(req.params.id);
    if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });

    const { numero, capacidade, ativa } = req.body;
    await mesa.update({ numero, capacidade, ativa });

    await LogAcaoAdmin.create({
      id_admin: req.admin.id_admin,
      acao: 'mesa_atualizada',
      entidade: 'mesa',
      entidade_id: mesa.id_mesa,
      descricao: `Mesa ${mesa.numero} atualizada`,
    });

    return res.json(mesa);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: error.errors.map((e) => e.message) });
    }
    return res.status(500).json({ erro: 'Erro ao atualizar mesa', detalhe: error.message });
  }
};

// DELETE /mesas/:id
const remover = async (req, res) => {
  try {
    const mesa = await Mesa.findByPk(req.params.id);
    if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });
    await mesa.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao remover mesa', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId, verificarDisponibilidade, criar, atualizar, remover };