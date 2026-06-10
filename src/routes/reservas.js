const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservaController');
const { autenticar } = require('../middlewares/auth');

router.post('/', ctrl.criar);
router.delete('/:id', ctrl.remover);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.patch('/:id/status', autenticar, ctrl.atualizarStatus);

module.exports = router;