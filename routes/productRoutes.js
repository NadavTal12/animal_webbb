const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

// Create Product
router.post('/create', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Product
router.put('/update', async (req, res) => {
  try {
    const { filter, update } = req.body;
    const success = await Product.update(filter, update);
    res.status(200).json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Product
router.delete('/delete', async (req, res) => {
  try {
    const success = await Product.delete(req.body);
    res.status(200).json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List Products
router.get('/list', async (req, res) => {
  try {
    const products = await Product.list(); // מביא את כל המוצרים מהמסד
    res.status(200).json(products); // מחזיר את המוצרים כ-JSON
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search Product
router.get('/search', async (req, res) => {
  try {
    const { attribute, value } = req.query;
    const products = await Product.search(attribute, value);
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
