const express = require('express');
var router = express.Router();

router.use('/foodFactory/api/user', require('./v1/user'))
router.use('/foodFactory/api/food', require('./v1/food'))
router.use('/foodFactory/api/ingredients', require('./v1/ingredients'))
router.use('/foodFactory/api/order', require('./v1/order'))

module.exports = router;