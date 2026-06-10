const { Reserva, Mesa, Administrador, LogAcaoAdmin } = require('../models');
const { Op } = require('sequelize');

const includeCompleto = [
  { model: Mesa, as: 'mesa', attributes: ['id_mesa', 'numero', 'capacidade', 'ativa'] },
];

// GET /reservas
const listar = async (req, res) => {
  try {
    const { status, data, email, telefone, nome } = req.query;
    const where = {};
    if (status) where.status = status;
    if (email) where.email = email;
    if (telefone) where.telefone = telefone;
    if (nome) where.nome = nome;
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

// POST /reservas — criada pelo cliente, sem mesa ainda
const criar = async (req, res) => {
  try {
    const { nome, email, telefone, data_hora, num_pessoas, observacoes } = req.body;

    const reserva = await Reserva.create({
      nome, email, telefone, data_hora, num_pessoas, observacoes,
      id_mesa: null,
      status: 'pendente',
    });

    return res.status(201).json(reserva);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: error.errors.map((e) => e.message) });
    }
    return res.status(500).json({ erro: 'Erro ao criar reserva', detalhe: error.message });
  }
};

// PATCH /reservas/:id/status — usado pelo admin
const atualizarStatus = async (req, res) => {
  try {
    const { status, id_mesa, descricao } = req.body;
    const statusValidos = ['pendente', 'confirmada', 'cancelada', 'concluida'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}` });
    }

    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });

    const dados = { status };

    if (status === 'confirmada') {
      if (!id_mesa) return res.status(400).json({ erro: 'Informe id_mesa para confirmar a reserva' });

      const mesa = await Mesa.findByPk(id_mesa);
      if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });
      if (!mesa.ativa) return res.status(400).json({ erro: 'Mesa indisponível' });
      if (reserva.num_pessoas > mesa.capacidade) {
        return res.status(400).json({ erro: `Mesa ${mesa.numero} comporta no máximo ${mesa.capacidade} pessoas` });
      }

      const janela = 2 * 60 * 60 * 1000;
      const conflito = await Reserva.findOne({
        where: {
          id_mesa,
          id_reserva: { [Op.ne]: reserva.id_reserva },
          status: { [Op.in]: ['pendente', 'confirmada'] },
          data_hora: {
            [Op.between]: [
              new Date(new Date(reserva.data_hora).getTime() - janela),
              new Date(new Date(reserva.data_hora).getTime() + janela),
            ],
          },
        },
      });
      if (conflito) return res.status(409).json({ erro: 'Mesa já reservada neste horário' });

      dados.id_mesa = id_mesa;
    }

    const statusAnterior = reserva.status;
    await reserva.update(dados);

    await LogAcaoAdmin.create({
      id_admin: req.admin.id_admin,
      acao: 'status_atualizado',
      entidade: 'reserva',
      entidade_id: reserva.id_reserva,
      descricao: descricao || `${statusAnterior} → ${status}`,
    });

    const reservaAtualizada = await Reserva.findByPk(reserva.id_reserva, { include: includeCompleto });
    return res.json(reservaAtualizada);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao atualizar status', detalhe: error.message });
  }
};

// DELETE /reservas/:id — cancelamento pelo cliente
const remover = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });
    if (['cancelada', 'concluida'].includes(reserva.status)) {
      return res.status(400).json({ erro: 'Reserva já encerrada' });
    }
    await reserva.update({ status: 'cancelada' });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao cancelar reserva', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizarStatus, remover };