// supplierRoutes.js
const express = require('express');
const router = express.Router();
const SupplierModel = require('../models/supplierModel'); // Import the SupplierModel
const { v4: uuidv4 } = require('uuid'); // To generate UUIDs

// Create a new supplier
router.post('/create', async (req, res) => {
  try {
    const { name, addr } = req.body;

    // Create a new supplier object
    const newSupplier = {
      uuid: uuidv4(),
      name,
      addr
    };

    // Save the new supplier to the database
    const createdSupplier = await SupplierModel.create(newSupplier);
    res.status(201).json({ message: 'Supplier created successfully', supplier: createdSupplier });
  } catch (error) {
    console.error(`Error creating supplier: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Get a supplier by UUID
router.get('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;

    // Get the supplier by UUID
    const supplier = await SupplierModel.get(uuid);
    if (supplier) {
      res.status(200).json(supplier);
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  } catch (error) {
    console.error(`Error fetching supplier: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// List all suppliers
router.get('/', async (req, res) => {
  try {
    // List all suppliers
    const suppliers = await SupplierModel.list();
    res.status(200).json(suppliers);
  } catch (error) {
    console.error(`Error listing suppliers: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Update a supplier by UUID
router.put('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const { name, addr } = req.body;

    // Update the supplier
    const updated = await SupplierModel.update({ uuid }, { $set: { name, addr } });
    if (updated) {
      res.status(200).json({ message: 'Supplier updated successfully' });
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  } catch (error) {
    console.error(`Error updating supplier: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Delete a supplier by UUID
router.delete('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;

    // Delete the supplier
    const deleted = await SupplierModel.delete({ uuid });
    if (deleted) {
      res.status(200).json({ message: 'Supplier deleted successfully' });
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  } catch (error) {
    console.error(`Error deleting supplier: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
