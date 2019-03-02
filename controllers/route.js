const Router = require('express').Router;
const router = Router();

const controller =require('./main.controller');

// router for processing excel
router.post('/processExcel',controller.processExcel)

module.exports = router;