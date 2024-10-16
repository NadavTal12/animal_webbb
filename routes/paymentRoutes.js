const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

// User Pay Route
router.post('/user_pay', (req, res) => {
  PaymentController.userPay(req, res);
});

module.exports = router;
