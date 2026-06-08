require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

const iniciar = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com PostgreSQL estabelecida');

    await sequelize.sync();
    console.log('✅ Modelos sincronizados com o banco');

    app.listen(PORT, () => {
      console.log(`🚀 Penumbra API v2 rodando em http://localhost:${PORT}`);
      console.log(`📋 Rotas disponíveis:`);
      console.log(`   GET    /health`);
      console.log(`\n   [Auth]`);
      console.log(`   POST   /api/administradores/login`);
      console.log(`\n   [Administradores] 🔒`);
      console.log(`   GET    /api/administradores`);
      console.log(`   POST   /api/administradores`);
      console.log(`   GET    /api/administradores/:id`);
      console.log(`   PUT    /api/administradores/:id`);
      console.log(`   DELETE /api/administradores/:id`);
      console.log(`\n   [Mesas]`);
      console.log(`   GET    /api/mesas`);
      console.log(`   GET    /api/mesas/disponibilidade?data_hora=&num_pessoas=`);
      console.log(`   GET    /api/mesas/:id`);
      console.log(`   POST   /api/mesas 🔒`);
      console.log(`   PUT    /api/mesas/:id 🔒`);
      console.log(`   DELETE /api/mesas/:id 🔒`);
      console.log(`\n   [Reservas]`);
      console.log(`   POST   /api/reservas`);
      console.log(`   DELETE /api/reservas/:id`);
      console.log(`   GET    /api/reservas?status=&data=&email=&telefone= 🔒`);
      console.log(`   GET    /api/reservas/:id 🔒`);
      console.log(`   PATCH  /api/reservas/:id/status 🔒`);
      console.log(`\n   [Logs] 🔒`);
      console.log(`   GET    /api/logs?id_admin=&id_reserva=`);
      console.log(`   GET    /api/logs/:id`);
      console.log(`\n   🔒 = requer token JWT`);
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar servidor:', error.message);
    process.exit(1);
  }
};

iniciar();
