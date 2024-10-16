const express = require('express');
const router = express.Router();
const CartManagerController = require('../controllers/cartManagerController');

// Add to Cart
router.post('/add_to_cart', (req, res) => {
  CartManagerController.addToCart(req, res);
});

// Get Cart
router.get('/get_cart', (req, res) => {
  CartManagerController.getCart(req, res);
});

// Remove from Cart
router.post('/remove_from_cart', (req, res) => {
  CartManagerController.removeFromCart(req, res);
});

// Update Product Quantity in Cart
router.post('/update_product_quantity', (req, res) => {
  CartManagerController.updateProductQuantity(req, res);
});

module.exports = router;
