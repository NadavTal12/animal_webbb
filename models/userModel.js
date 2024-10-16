const AbstractModel = require('./abstractModel');

class User extends AbstractModel {
  constructor() {
    super('users'); // Specifies the MongoDB collection name
  }

  // Basic validation to check fields and types
  validateUser(user) {
    const validAttributes = ['email', 'name', 'uuid', 'address', 'password', 'is_admin'];
    const requiredAttributes = {
      email: 'string',
      name: 'string',
      uuid: 'string',
      address: 'string',
      password: 'string',
      is_admin: 'boolean'
    };

    // Check for missing fields
    for (let attr of Object.keys(requiredAttributes)) {
      if (!(attr in user)) {
        throw new Error(`Missing required field: ${attr}`);
      }
    }

    // Check for extra fields and correct types
    for (let key in user) {
      if (!validAttributes.includes(key)) {
        throw new Error(`Invalid field: ${key}`);
      }
      if (typeof user[key] !== requiredAttributes[key]) {
        throw new Error(`Invalid type for field ${key}. Expected ${requiredAttributes[key]}.`);
      }
    }
  }

  async create(user) {
    // Ensure is_admin is always false for new users
    user.is_admin = false;

    // Validate user attributes
    this.validateUser(user);
    return super.create(user); // Use the inherited create method
  }
}

module.exports = new User();
