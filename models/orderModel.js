const AbstractModel = require('./abstractModel');

class Order extends AbstractModel {
  constructor() {
    super('orders'); // Specifies the MongoDB collection name
  }

  // Basic validation to check fields and types
  validateOrder(order) {
    const validAttributes = ['uuid', 'user', 'products', 'address', 'date', 'shop', 'status', 'price'];
    const requiredAttributes = {
      uuid: 'string',
      user: 'string',
      products: 'object', // Assuming products is an array
      address: 'string',
      date: 'string',
      shop: 'string',
      status: 'string',
      price: 'number'
    };

    // Allowed status values
    const allowedStatuses = ['ordered', 'shipped', 'delivered'];

    // Check for missing fields
    for (let attr of Object.keys(requiredAttributes)) {
      if (!(attr in order)) {
        throw new Error(`Missing required field: ${attr}`);
      }
    }

    // Check for extra fields and correct types
    for (let key in order) {
      if (!validAttributes.includes(key)) {
        throw new Error(`Invalid field: ${key}`);
      }
      if (typeof order[key] !== requiredAttributes[key]) {
        throw new Error(`Invalid type for field ${key}. Expected ${requiredAttributes[key]}.`);
      }
      // Validate status field
      if (key === 'status' && !allowedStatuses.includes(order[key])) {
        throw new Error(`Invalid status: ${order[key]}. Allowed values are: ${allowedStatuses.join(', ')}`);
      }
    }
  }

  async create(order) {
    // Validate order attributes
    this.validateOrder(order);
    return super.create(order); // Use the inherited create method
  }

  // Search for orders by attribute (like UUID)
  async search(attribute, value) {
    await this.init(); // Make sure the collection is initialized
    const filter = {};
    filter[attribute] = value;
    return this.collection.find(filter).toArray(); // Use `this.collection` instead of `this.db`
  }
}

module.exports = new Order();
