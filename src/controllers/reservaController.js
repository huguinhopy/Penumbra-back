const { Reserva, Administrador, Mesa } = require('../models');
const { Op } = require('sequelize');

const includeCompleto = [
  { model: Administrador, as: 'administrador', attributes: ['id_admin', 'nome', 'email'] },
  { model: Mesa, as: 'mesa', attributes: ['id_mesa', 'numero', 'capacidade'] },
  
];

// GET /reservas
const listar = async (req, res) => {
  try {
    const { status, data, id_admin } = req.query;
    const where = {};

    if (status) where.status = status;
    if (id_admin) where.id_admin = id_admin;
    if (data) {
      const inicio = new Date(data);
      const fim = new Date(data);
      fim.setDate(fim.getDate() + 1);
      where.data_hora = { [Op.between]: [inicio, fim] };
    }

    const reservas = await Reserva.findAll({
      where,
      include: includeCompleto,
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
    const { id_admin, id_mesa, data_hora, num_pessoas, observacoes } = req.body;

    // Valida usuário
    const usuario = await Usuario.findByPk(id_admin);
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

    // Valida mesa
    const mesa = await Mesa.findByPk(id_mesa);
    if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });

    // Valida capacidade
    if (num_pessoas > mesa.capacidade) {
      return res.status(400).json({
        erro: `Mesa ${mesa.numero} comporta no máximo ${mesa.capacidade} pessoas`,
      });
    }

    // Verifica conflito de horário (janela de 2h)
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

    if (conflito) {
      return res.status(409).json({ erro: 'Mesa já reservada neste horário' });
    }

    const reserva = await Reserva.create({
      id_admin,
      id_mesa,
      data_hora,
      num_pessoas,
      observacoes,
    });

    const reservaCompleta = await Reserva.findByPk(reserva.id_reserva, { include: includeCompleto });
    return res.status(201).json(reservaCompleta);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const erros = error.errors.map((e) => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erros });
    }
    return res.status(500).json({ erro: 'Erro ao criar reserva', detalhe: error.message });
  }
};

// PATCH /reservas/:id/status
const atualizarStatus = async (req, res) => {
  try {
    const { status, id_admin } = req.body;
    const statusValidos = ['pendente', 'confirmada', 'cancelada', 'concluida'];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}` });
    }

    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });

    

    await reserva.update({ status, id_admin: id_admin || reserva.id_admin });
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

    const { id_mesa, data_hora, num_pessoas, observacoes } = req.body;
    await reserva.update({ id_mesa, data_hora, num_pessoas, observacoes });

    const reservaAtualizada = await Reserva.findByPk(reserva.id_reserva, { include: includeCompleto });
    return res.json(reservaAtualizada);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const erros = error.errors.map((e) => e.message);
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erros });
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
