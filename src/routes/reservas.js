const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservaController');

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.patch('/:id/status', ctrl.atualizarStatus);
router.delete('/:id', ctrl.remover);

module.exports = router;
