const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({ erro: 'Erro no banco de dados', detalhe: err.message });
  }
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({ erro: 'Sem conexão com o banco de dados' });
  }

  return res.status(500).json({ erro: 'Erro interno do servidor' });
};

module.exports = errorHandler;
