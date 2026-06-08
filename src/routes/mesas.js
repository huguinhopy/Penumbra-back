const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mesaController');
const { autenticar } = require('../middlewares/auth');

router.get('/disponibilidade', ctrl.verificarDisponibilidade);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);

router.use(autenticar);

router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.remover);

module.exports = router;