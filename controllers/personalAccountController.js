const Order = require('../models/orderModel'); // Import the Order model

class PersonalAccountController {
  // Get user orders by user ID
  async getUserOrders(req, res) {
    try {
      const { user_id } = req.query;

      // Fetch all orders for the given user ID
      const orders = await Order.search('user', user_id);
      if (orders.length === 0) {
        return res.status(404).json({ error: 'No orders found for this user' });
      }

      res.status(200).json({ orders });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new PersonalAccountController();
