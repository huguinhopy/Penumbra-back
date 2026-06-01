require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

const iniciar = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com PostgreSQL estabelecida');

    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados com o banco');

    app.listen(PORT, () => {
      console.log(`🚀 Penumbra API v2 rodando em http://localhost:${PORT}`);
      console.log(`\n📋 Rotas disponíveis:`);
      console.log(`   GET    /health`);
      console.log(`\n   [Administradores]`);
      console.log(`   POST   /api/administradores/login`);
      console.log(`   GET    /api/administradores`);
      console.log(`   POST   /api/administradores`);
      console.log(`   GET    /api/administradores/:id`);
      console.log(`   PUT    /api/administradores/:id`);
      console.log(`   DELETE /api/administradores/:id`);
      console.log(`\n   [Mesas]`);
      console.log(`   GET    /api/mesas?ativa=true`);
      console.log(`   GET    /api/mesas/disponibilidade?data_hora=&num_pessoas=`);
      console.log(`   POST   /api/mesas`);
      console.log(`   GET    /api/mesas/:id`);
      console.log(`   PUT    /api/mesas/:id`);
      console.log(`   DELETE /api/mesas/:id`);
      console.log(`\n   [Reservas]`);
      console.log(`   GET    /api/reservas?status=&data=&email=`);
      console.log(`   POST   /api/reservas`);
      console.log(`   GET    /api/reservas/:id`);
      console.log(`   PUT    /api/reservas/:id`);
      console.log(`   PATCH  /api/reservas/:id/status`);
      console.log(`   DELETE /api/reservas/:id`);
      console.log(`\n   [Logs]`);
      console.log(`   GET    /api/logs?id_admin=&id_reserva=`);
      console.log(`   GET    /api/logs/:id`);
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar servidor:', error.message);
    process.exit(1);
  }
};

iniciar();
