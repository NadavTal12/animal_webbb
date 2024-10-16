const express = require('express');
const router = express.Router();
const PersonalAccountController = require('../controllers/personalAccountController');

// Get User Orders Route
router.get('/get_user_orders', (req, res) => {
  PersonalAccountController.getUserOrders(req, res);
});

module.exports = router;
