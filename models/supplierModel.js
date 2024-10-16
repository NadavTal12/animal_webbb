// supplierModel.js
const AbstractModel = require('./abstractModel'); // Import the AbstractModel

class SupplierModel extends AbstractModel {
  constructor() {
    super('suppliers'); // Name of the collection in the database
  }

  // Validate supplier attributes
  validateSupplier(supplier) {
    const errors = [];

    // Check if uuid is present and a valid string
    if (!supplier.uuid || typeof supplier.uuid !== 'string') {
      errors.push('Invalid or missing uuid.');
    }

    // Check if name is present and is a string with at least 1 character
    if (!supplier.name || typeof supplier.name !== 'string' || supplier.name.trim() === '') {
      errors.push('Invalid or missing name.');
    }

    // Check if addr is present and is a string with at least 1 character
    if (!supplier.addr || typeof supplier.addr !== 'string' || supplier.addr.trim() === '') {
      errors.push('Invalid or missing address.');
    }

    return errors;
  }

  // Override the create method to include validation
  async create(supplier) {
    const errors = this.validateSupplier(supplier);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }
    return super.create(supplier); // Call the parent class's create method
  }

  // Override the update method to include validation
  async update(filter, update) {
    // Validate the update data if it includes supplier attributes
    if (update.$set) {
      const errors = this.validateSupplier(update.$set);
      if (errors.length > 0) {
        throw new Error(`Validation errors: ${errors.join(', ')}`);
      }
    }
    return super.update(filter, update); // Call the parent class's update method
  }
}

module.exports = new SupplierModel();
