const express = require('express');
const router = express.Router();
const Shop = require('../models/shopModel'); // שימוש ב-shopModel

// Create Shop
router.post('/create', async (req, res) => {
  try {
    const shop = await Shop.create(req.body);
    res.status(201).json(shop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Shop
router.put('/update', async (req, res) => {
  try {
    const { filter, update } = req.body;
    const success = await Shop.update(filter, update);
    res.status(200).json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Shop
router.delete('/delete', async (req, res) => {
  try {
    const success = await Shop.delete(req.body);
    res.status(200).json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List all shops - this needs to handle the /stores/list endpoint
router.get('/list', async (req, res) => {  // Ensure this endpoint matches the fetch URL
  try {
    const shops = await Shop.list(); // Get all shops (stores)
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search Store
router.get('/search', async (req, res) => {
  try {
    const { attribute, value } = req.query;
    const stores = await Shop.search(attribute, value); // חיפוש לפי המזהה
    res.status(200).json(stores);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
