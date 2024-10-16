const AbstractModel = require('./abstractModel');
const { v4: uuidv4 } = require('uuid');  // ייבוא uuid

class Cart extends AbstractModel {
  constructor() {
    super('carts'); // Specifies the MongoDB collection name
  }

  // Basic validation to check fields and types
  validateCart(cart) {
    const validAttributes = ['products', 'user', 'uuid'];
    const requiredAttributes = {
      products: 'object', // Assuming products is an array
      user: 'string',
      uuid: 'string',  // Ensure uuid is present
    };

    // Check for missing fields
    for (let attr of Object.keys(requiredAttributes)) {
      if (!(attr in cart)) {
        throw new Error(`Missing required field: ${attr}`);
      }
    }

    // Check for extra fields and correct types
    for (let key in cart) {
      if (!validAttributes.includes(key)) {
        throw new Error(`Invalid field: ${key}`);
      }
      if (typeof cart[key] !== requiredAttributes[key]) {
        throw new Error(`Invalid type for field ${key}. Expected ${requiredAttributes[key]}.`);
      }
    }
  }

  async create(cart) {
    // Generate uuid if not present
    if (!cart.uuid) {
      cart.uuid = uuidv4();  // Create a new uuid for the cart
    }

    // Validate cart attributes
    this.validateCart(cart);
    return super.create(cart); // Use the inherited create method
  }

  // Get the cart by user ID
  async getCartByUser(user_id) {
    return this.search('user', user_id);
  }

  // Add a product to the cart
  async addToCart(cart_id, product_uuid, quantity = 1) {
    const cart = await this.get(cart_id);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Check if the product is already in the cart
    const productIndex = cart.products.findIndex(p => p.product_uuid === product_uuid);

    if (productIndex > -1) {
      // If the product already exists, update the quantity
      cart.products[productIndex].quantity += quantity;
    } else {
      // If the product is not in the cart, add it
      cart.products.push({ product_uuid, quantity });
    }

    // Update the cart in the database
    return this.update({ uuid: cart_id }, { $set: { products: cart.products } });
  }

  // Remove a product from the cart
  async removeFromCart(cart_id, product_uuid) {
    const cart = await this.get(cart_id);

    if (!cart) {
      throw new Error('Cart not found');
    }

    // Filter out the product from the cart
    cart.products = cart.products.filter(p => p.product_uuid !== product_uuid);

    // Update the cart in the database
    return this.update({ uuid: cart_id }, { $set: { products: cart.products } });
  }
}

module.exports = new Cart();
