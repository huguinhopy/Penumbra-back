const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/logController');

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);

module.exports = router;
