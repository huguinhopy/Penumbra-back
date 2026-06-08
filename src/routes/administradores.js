const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/administradorController');
const { autenticar } = require('../middlewares/auth');

router.post('/login', ctrl.login);

router.use(autenticar);

router.get('/', ctrl.listar);
router.post('/', ctrl.criar);
router.get('/:id', ctrl.buscarPorId);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.remover);

module.exports = router;