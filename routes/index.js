// app/routes/index.js
const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sampleController');

// Define a route that uses a controller
router.get('/', sampleController.home);

module.exports = router;
