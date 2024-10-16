const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Cart = require('../models/cartModel'); // הוספת Cart ליצירת עגלה אוטומטית

// Create User
router.post('/create', async (req, res) => {
  try {
    const user = await User.create(req.body);
    // יצירת עגלה ריקה אוטומטית לאחר יצירת המשתמש
    await Cart.create({ user: user.uuid, products: [] });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update User
router.put('/update', async (req, res) => {
  try {
    const { uuid, name, email, address, is_admin } = req.body;

    const user = await User.search('uuid', uuid);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare the update fields based on what is provided
    const updateFields = {};
    
    if (name) updateFields.name = name; // Update name if provided
    if (email) updateFields.email = email; // Update email if provided
    if (address) updateFields.address = address; // Update address if provided
    if (is_admin !== undefined) updateFields.is_admin = is_admin; // Update is_admin if provided

    const success = await User.update({ uuid }, { $set: updateFields });
    if (success) {
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Delete User
router.delete('/delete', async (req, res) => {
  try {
    const success = await User.delete(req.body);
    res.status(200).json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List Users
router.get('/list', async (req, res) => {
  try {
    const users = await User.list();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search User
router.get('/search', async (req, res) => {
  try {
    const { attribute, value } = req.query;
    const users = await User.search(attribute, value);
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
