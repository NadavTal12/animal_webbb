const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const { v4: uuidv4 } = require('uuid');

class CartManagerController {
  // Get the user's cart, or create one if not exists
  async getCart(req, res) {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Fetch the user's cart using the user_id
      let carts = await Cart.search('user', user_id);

      if (!carts || carts.length === 0) {
        // Create a new cart if none exists
        const newCart = {
          uuid: uuidv4(),
          user: user_id,
          products: []
        };

        await Cart.create(newCart);
        carts = [newCart]; // Set the new cart to the response array
      }

      res.status(200).json({ cart: carts[0] }); // Return the cart
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Add a product to the user's cart
  async addToCart(req, res) {
    try {
      const { cart_id, product_id, user_id } = req.body;  // הוספנו user_id

      // Validate request body
      if (!product_id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      // Fetch the user's cart or create a new one if not exists
      let cart = await Cart.get(cart_id);
      if (!cart) {
        cart = {
          uuid: uuidv4(),  // יצירת uuid חדש לעגלה
          user: user_id || 'guest',  // אם אין מזהה משתמש, נשתמש ב-guest
          products: [],
        };
        await Cart.create(cart);
      }

      // Fetch the product
      const product = await Product.search('uuid', product_id); // שימוש ב-uuid
      if (!product || product.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if the product is already in the cart
      const productInCart = cart.products.find(
        (item) => item.product_uuid === product_id
      );

      if (productInCart) {
        // If the product exists in the cart, increase the quantity
        productInCart.quantity += 1;
      } else {
        // If the product does not exist in the cart, add it with quantity 1
        cart.products.push({
          product_uuid: product_id,
          quantity: 1,
        });
      }

      // Update the cart in the database
      await Cart.update({ uuid: cart.uuid }, { $set: { products: cart.products } });

      res.status(200).json({ message: 'Product added to cart', cart });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Remove a product from the cart
  async removeFromCart(req, res) {
    try {
      const { cart_id, product_id } = req.body;

      const cart = await Cart.get(cart_id);
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      cart.products = cart.products.filter(p => p.product_uuid !== product_id);

      await Cart.update({ uuid: cart_id }, { $set: { products: cart.products } });

      res.status(200).json({ message: 'Product removed from cart', cart });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update the quantity of a product in the cart
  async updateProductQuantity(req, res) {
    try {
      const { cart_id, product_id, quantity } = req.body;

      const cart = await Cart.get(cart_id);
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const productInCart = cart.products.find(
        (item) => item.product_uuid === product_id
      );

      if (productInCart) {
        productInCart.quantity = quantity;
        await Cart.update({ uuid: cart_id }, { $set: { products: cart.products } });
        res.status(200).json({ message: 'Product quantity updated', cart });
      } else {
        res.status(404).json({ error: 'Product not found in cart' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CartManagerController();
