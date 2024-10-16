const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Store = require('../models/shopModel');

// Create Order
router.post('/create', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Order
router.put('/update', async (req, res) => {
  try {
    const { filter, update } = req.body;
    const success = await Order.update(filter, update);
    res.status(200).json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Order
router.delete('/delete', async (req, res) => {
  try {
    const success = await Order.delete(req.body);
    res.status(200).json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List Orders
router.get('/list', async (req, res) => {
  try {
    const orders = await Order.list();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search Orders by UUID or User UUID
router.get('/search', async (req, res) => {
  try {
    const { attribute, value } = req.query;

    if (attribute === 'uuid') {
      // חיפוש לפי מזהה הזמנה
      console.log('Searching for order by UUID:', value);

      const orders = await Order.search(attribute, value);
      if (orders.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const orderDetails = orders[0];

      // Fetch user details
      const user = await User.search('uuid', orderDetails.user);
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const userDetails = user[0];

      // Fetch store details
      const store = await Store.search('uuid', orderDetails.shop);
      if (store.length === 0) {
        return res.status(404).json({ error: 'Store not found' });
      }
      const storeDetails = store[0];

      // Fetch product details for each product in the order
      const productDetails = await Promise.all(
        orderDetails.products.map(async (item) => {
          const product = await Product.search('uuid', item.product_uuid);
          if (product.length > 0) {
            return {
              ...product[0],
              quantity: item.quantity,
            };
          }
        })
      );

      // Return all details as a single object
      res.status(200).json({
        order: orderDetails,
        user: userDetails,
        store: storeDetails,
        products: productDetails,
      });
    } else if (attribute === 'user') {
      // חיפוש לפי מזהה משתמש
      console.log('Searching for orders by user UUID:', value);

      const orders = await Order.search('user', value); // חיפוש לפי מזהה משתמש
      if (orders.length === 0) {
        return res.status(404).json({ error: 'No orders found for this user' });
      }

      // Fetch product details for each order
      const orderDetails = await Promise.all(
        orders.map(async (order) => {
          const productDetails = await Promise.all(
            order.products.map(async (item) => {
              const product = await Product.search('uuid', item.product_uuid);
              if (product.length > 0) {
                return {
                  ...product[0],
                  quantity: item.quantity,
                };
              }
            })
          );
          return {
            order, // פרטי ההזמנה
            products: productDetails, // פרטי המוצרים
          };
        })
      );

      return res.status(200).json(orderDetails);
    } else {
      return res.status(400).json({ error: 'Invalid search attribute' });
    }
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
