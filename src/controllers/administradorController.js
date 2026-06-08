const { Administrador, LogAcaoAdmin } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { enviarConviteAdmin } = require('../services/mailService');

// POST /administradores/login
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Informe e-mail e senha' });

    const admin = await Administrador.findOne({ where: { email } });

    if (admin && admin.bloqueado_ate && new Date() < new Date(admin.bloqueado_ate)) {
      return res.status(403).json({ erro: 'Conta bloqueada temporariamente. Tente novamente mais tarde.' });
    }

    if (!admin) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    const senhaValida = await bcrypt.compare(senha, admin.senha_hash);

    if (!senhaValida) {
      const tentativas = (admin.tentativas_login || 0) + 1;
      const bloqueado_ate = tentativas >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await admin.update({ tentativas_login: tentativas, bloqueado_ate });

      await LogAcaoAdmin.create({
        id_admin: admin.id_admin,
        acao: 'login_falhou',
        entidade: 'auth',
        entidade_id: admin.id_admin,
        descricao: `Tentativa ${tentativas} de 5`,
      });

      if (bloqueado_ate) {
        return res.status(403).json({ erro: 'Conta bloqueada por 15 minutos após 5 tentativas.' });
      }
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    await admin.update({ tentativas_login: 0, bloqueado_ate: null, ultimo_acesso: new Date() });

    await LogAcaoAdmin.create({
      id_admin: admin.id_admin,
      acao: 'login_realizado',
      entidade: 'auth',
      entidade_id: admin.id_admin,
    });

    const token = jwt.sign(
      { id_admin: admin.id_admin, nivel_acesso: admin.nivel_acesso },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const { senha_hash: _, ...adminSemSenha } = admin.toJSON();
    return res.json({ token, admin: adminSemSenha });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro no login', detalhe: error.message });
  }
};

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

    if (req.admin) {
      await LogAcaoAdmin.create({
        id_admin: req.admin.id_admin,
        acao: 'admin_criado',
        entidade: 'admin',
        entidade_id: admin.id_admin,
        descricao: `${admin.nome} (${admin.nivel_acesso}) criado por ${req.admin.id_admin}`,
      });

      await enviarConviteAdmin({ nome, email, senha_temporaria: senha });
    }

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

    await LogAcaoAdmin.create({
      id_admin: req.admin.id_admin,
      acao: 'admin_atualizado',
      entidade: 'admin',
      entidade_id: admin.id_admin,
      descricao: `Dados de ${admin.nome} atualizados`,
    });

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

    if (admin.nivel_acesso === 'dono') {
      return res.status(403).json({ erro: 'O dono não pode ser removido' });
    }

    if (req.params.id === String(req.admin.id_admin)) {
      return res.status(403).json({ erro: 'Você não pode remover a si mesmo' });
    }

    await LogAcaoAdmin.create({
      id_admin: req.admin.id_admin,
      acao: 'admin_removido',
      entidade: 'admin',
      entidade_id: admin.id_admin,
      descricao: `${admin.nome} (${admin.nivel_acesso}) removido`,
    });

    await admin.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao remover administrador', detalhe: error.message });
  }
};

module.exports = { login, listar, buscarPorId, criar, atualizar, remover };