const AbstractModel = require('./abstractModel');

class Product extends AbstractModel {
  constructor() {
    super('products'); // Specifies the MongoDB collection name
  }

  // מביא את כל המוצרים מהמסד
  async list() {
    return super.list(); // השימוש בפונקציה המוגדרת ב-AbstractModel שמביאה את כל הרשומות
  }

  // Basic validation to check fields and types
  validateProduct(product) {
    const validAttributes = ['uuid', 'name', 'description', 'image', 'price', 'amount_sold', 'supplier'];
    const requiredAttributes = {
      uuid: 'string',
      name: 'string',
      description: 'string',
      image: 'string', // Assuming base64 encoded string
      price: 'number',
      amount_sold: 'number',
      supplier: 'string' // UUID of the supplier
    };

    // Check for missing fields
    for (let attr of Object.keys(requiredAttributes)) {
      if (!(attr in product)) {
        throw new Error(`Missing required field: ${attr}`);
      }
    }

    // Check for extra fields and correct types
    for (let key in product) {
      if (!validAttributes.includes(key)) {
        throw new Error(`Invalid field: ${key}`);
      }
      if (typeof product[key] !== requiredAttributes[key]) {
        throw new Error(`Invalid type for field ${key}. Expected ${requiredAttributes[key]}.`);
      }
    }
  }

  async create(product) {
    // Validate product attributes
    this.validateProduct(product);
    return super.create(product); // Use the inherited create method
  }

  async update(filter, update) {
    // If the update includes product attributes, validate them
    if (update.$set) {
      const errors = this.validateProduct(update.$set);
      if (errors.length > 0) {
        throw new Error(`Validation errors: ${errors.join(', ')}`);
      }
    }
    return super.update(filter, update);
  }
}

module.exports = new Product();
