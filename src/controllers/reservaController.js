const { Reserva, Mesa, Administrador, LogAcaoAdmin } = require('../models');
const { Op } = require('sequelize');

const includeCompleto = [
  { model: Mesa, as: 'mesa', attributes: ['id_mesa', 'numero', 'capacidade', 'ativa'] },
  {
    model: LogAcaoAdmin,
    as: 'logs',
    include: [{ model: Administrador, as: 'admin', attributes: ['id_admin', 'nome'] }],
  },
];

// GET /reservas
const listar = async (req, res) => {
  try {
    const { status, data, email } = req.query;
    const where = {};
    if (status) where.status = status;
    if (email) where.email = email;
    if (data) {
      const inicio = new Date(data);
      const fim = new Date(data);
      fim.setDate(fim.getDate() + 1);
      where.data_hora = { [Op.between]: [inicio, fim] };
    }
    const reservas = await Reserva.findAll({
      where,
      include: [{ model: Mesa, as: 'mesa', attributes: ['id_mesa', 'numero', 'capacidade'] }],
      order: [['data_hora', 'ASC']],
    });
    return res.json(reservas);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar reservas', detalhe: error.message });
  }
};

// GET /reservas/:id
const buscarPorId = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id, { include: includeCompleto });
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });
    return res.json(reserva);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar reserva', detalhe: error.message });
  }
};

// POST /reservas
const criar = async (req, res) => {
  try {
    const { email, nome, telefone, id_mesa, data_hora, num_pessoas, observacoes } = req.body;

    const mesa = await Mesa.findByPk(id_mesa);
    if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });
    if (!mesa.ativa) return res.status(400).json({ erro: 'Mesa indisponível no momento' });
    if (num_pessoas > mesa.capacidade) {
      return res.status(400).json({
        erro: `Mesa ${mesa.numero} comporta no máximo ${mesa.capacidade} pessoas`,
      });
    }

    const janela = 2 * 60 * 60 * 1000;
    const dataReserva = new Date(data_hora);
    const conflito = await Reserva.findOne({
      where: {
        id_mesa,
        status: { [Op.in]: ['pendente', 'confirmada'] },
        data_hora: {
          [Op.between]: [
            new Date(dataReserva.getTime() - janela),
            new Date(dataReserva.getTime() + janela),
          ],
        },
      },
    });
    if (conflito) return res.status(409).json({ erro: 'Mesa já reservada neste horário' });

    const reserva = await Reserva.create({ email, nome, telefone, id_mesa, data_hora, num_pessoas, observacoes });
    const reservaCompleta = await Reserva.findByPk(reserva.id_reserva, { include: includeCompleto });
    return res.status(201).json(reservaCompleta);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: error.errors.map((e) => e.message) });
    }
    return res.status(500).json({ erro: 'Erro ao criar reserva', detalhe: error.message });
  }
};

// PATCH /reservas/:id/status
const atualizarStatus = async (req, res) => {
  try {
    const { status, id_admin, descricao } = req.body;
    const statusValidos = ['pendente', 'confirmada', 'cancelada', 'concluida'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}` });
    }

    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });

    const admin = await Administrador.findByPk(id_admin);
    if (!admin) return res.status(403).json({ erro: 'Administrador não encontrado' });

    const statusAnterior = reserva.status;
    await reserva.update({ status });

    await LogAcaoAdmin.create({
      id_admin,
      id_reserva: reserva.id_reserva,
      acao: `status: ${statusAnterior} → ${status}`,
      descricao: descricao || null,
    });

    const reservaAtualizada = await Reserva.findByPk(reserva.id_reserva, { include: includeCompleto });
    return res.json(reservaAtualizada);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao atualizar status', detalhe: error.message });
  }
};

// PUT /reservas/:id
const atualizar = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });
    if (['cancelada', 'concluida'].includes(reserva.status)) {
      return res.status(400).json({ erro: 'Não é possível editar uma reserva cancelada ou concluída' });
    }
    const { id_mesa, data_hora, num_pessoas, observacoes, nome, telefone } = req.body;
    await reserva.update({ id_mesa, data_hora, num_pessoas, observacoes, nome, telefone });
    const reservaAtualizada = await Reserva.findByPk(reserva.id_reserva, { include: includeCompleto });
    return res.json(reservaAtualizada);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: error.errors.map((e) => e.message) });
    }
    return res.status(500).json({ erro: 'Erro ao atualizar reserva', detalhe: error.message });
  }
};

// DELETE /reservas/:id
const remover = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });
    await reserva.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao remover reserva', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizarStatus, atualizar, remover };