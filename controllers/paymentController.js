const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Shop = require('../models/shopModel');
const { v4: uuidv4 } = require('uuid');

class PaymentController {
  async userPay(req, res) {
    try {
      const { cart_id, store_id, shipping_address } = req.body;

      // Fetch the user's cart
      const cart = await Cart.search('uuid', cart_id);
      if (cart.length === 0) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      const userCart = cart[0];

      // Fetch the store and check stock
      const store = await Shop.search('uuid', store_id);
      if (store.length === 0) {
        return res.status(404).json({ error: 'Store not found' });
      }
      const selectedStore = store[0];

      let totalPrice = 0;

      // Check stock and update store inventory
      for (const productEntry of userCart.products) {
        const product = await Product.search('uuid', productEntry.product_uuid);
        if (product.length === 0) {
          return res.status(404).json({ error: `Product ${productEntry.product_uuid} not found` });
        }
        const productDetails = product[0];

        // חיפוש מלאי בחנות
        const storeInventoryItem = selectedStore.inventory.find(item => item.product_uuid === productEntry.product_uuid);
        if (!storeInventoryItem || storeInventoryItem.amount_in_stock < productEntry.quantity) {
          return res.status(400).json({ error: `המלאי לא מספיק עבור המוצר ${productDetails.name} בחנות הנבחרת` });
        }

        // עדכון מלאי החנות
        storeInventoryItem.amount_in_stock -= productEntry.quantity;

        // עדכון המלאי בבסיס הנתונים
        await Shop.update(
          { uuid: store_id, 'inventory.product_uuid': productEntry.product_uuid },
          { $set: { 'inventory.$.amount_in_stock': storeInventoryItem.amount_in_stock } }
        );

        // חישוב סך הכל לתשלום
        totalPrice += productDetails.price * productEntry.quantity;

        // עדכון מכירות - המרת כמות ל-Number במקרה שמגיעה כמחרוזת
        const quantity = Number(productEntry.quantity);
        await Product.update(
          { uuid: productDetails.uuid },
          { $inc: { amount_sold: quantity } }  // ווידוא ש-amount_sold הוא מספר
        );
      }

      // יצירת הזמנה
      const newOrder = {
        uuid: uuidv4(),
        user: userCart.user,
        products: userCart.products,
        address: shipping_address,
        date: new Date().toISOString(),
        status: 'ordered',
        price: totalPrice,
        shop: store_id
      };
      await Order.create(newOrder);

      // ריקון העגלה
      await Cart.update({ uuid: cart_id }, { $set: { products: [] } });

      res.status(200).json({ message: 'Payment successful', order_id: newOrder.uuid });
    } catch (error) {
      console.error(`Error processing payment: ${error.message}`);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new PaymentController();
