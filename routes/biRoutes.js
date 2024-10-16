const express = require('express');
const router = express.Router();
const BIModel = require('../models/BIModel'); 

// Route to get sales analysis by supplier
router.get('/sales_analysis_by_supplier', async (req, res) => {
  try {
    const analysis = await BIModel.getSalesAnalysisBySupplier();
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error fetching sales analysis by supplier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get top N best-selling products
router.get('/top_best_sellers', async (req, res) => {
  try {
    const n = parseInt(req.query.n, 10); // Get 'n' from query params
    const bestSellers = await BIModel.getTopBestSellers(n);
    res.status(200).json(bestSellers);
  } catch (error) {
    console.error('Error fetching top best sellers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get revenue grouped by a specified attribute within a given time range
router.get('/revenue_by_attribute', async (req, res) => {
  try {
    // Extract query parameters: attribute, startDate, endDate
    const { attribute, startDate, endDate } = req.query;
    // Validate required parameters
    if (!attribute || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters: attribute, startDate, and endDate' });
    }

    // Call the model function with the provided parameters
    const result = await BIModel.getRevenueByAttribute(attribute, startDate, endDate);
    
    // Return the result
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching revenue by attribute:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;