const { Administrador, LogAcaoAdmin } = require('../models');
const bcrypt = require('bcryptjs');

// GET /administradores
const listar = async (req, res) => {
  try {
    const admins = await Administrador.findAll({
      attributes: { exclude: ['senha_hash'] },
      order: [['nome', 'ASC']],
    });
    return res.json(admins);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao listar administradores', detalhe: error.message });
  }
};

// GET /administradores/:id
const buscarPorId = async (req, res) => {
  try {
    const admin = await Administrador.findByPk(req.params.id, {
      attributes: { exclude: ['senha_hash'] },
      include: [
        {
          model: LogAcaoAdmin,
          as: 'logs',
          limit: 20,
          order: [['realizado_em', 'DESC']],
        },
      ],
    });
    if (!admin) return res.status(404).json({ erro: 'Administrador não encontrado' });
    return res.json(admin);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar administrador', detalhe: error.message });
  }
};

// POST /administradores
const criar = async (req, res) => {
  try {
    const { nome, email, senha, nivel_acesso } = req.body;
    if (!senha || senha.length < 6) {
      return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    const admin = await Administrador.create({ nome, email, senha_hash, nivel_acesso });

    const { senha_hash: _, ...adminSemSenha } = admin.toJSON();
    return res.status(201).json(adminSemSenha);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'E-mail já cadastrado' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: error.errors.map((e) => e.message) });
    }
    return res.status(500).json({ erro: 'Erro ao criar administrador', detalhe: error.message });
  }
};

// PUT /administradores/:id
const atualizar = async (req, res) => {
  try {
    const admin = await Administrador.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ erro: 'Administrador não encontrado' });

    const { nome, email, senha, nivel_acesso } = req.body;
    const dados = { nome, email, nivel_acesso };

    if (senha) {
      if (senha.length < 6) return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
      dados.senha_hash = await bcrypt.hash(senha, 10);
    }

    await admin.update(dados);
    const { senha_hash: _, ...adminSemSenha } = admin.toJSON();
    return res.json(adminSemSenha);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'E-mail já cadastrado' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: error.errors.map((e) => e.message) });
    }
    return res.status(500).json({ erro: 'Erro ao atualizar administrador', detalhe: error.message });
  }
};

// DELETE /administradores/:id
const remover = async (req, res) => {
  try {
    const admin = await Administrador.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ erro: 'Administrador não encontrado' });
    await admin.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao remover administrador', detalhe: error.message });
  }
};

// POST /administradores/login
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Informe e-mail e senha' });

    const admin = await Administrador.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
    if (!senhaValida) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const { senha_hash: _, ...adminSemSenha } = admin.toJSON();
    return res.json({ mensagem: 'Login realizado', admin: adminSemSenha });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro no login', detalhe: error.message });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover, login };
