const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/logController');
const { autenticar } = require('../middlewares/auth');

router.use(autenticar);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);

module.exports = router;