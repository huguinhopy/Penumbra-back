const express = require('express');
const app = express();
const cors = require('cors')

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/administradores', require('./routes/administradores'));
app.use('/api/mesas', require('./routes/mesas'));
app.use('/api/reservas', require('./routes/reservas'));
app.use('/api/logs', require('./routes/logs'));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));
app.use(require('./middlewares/errorHandler'));

module.exports = app;
