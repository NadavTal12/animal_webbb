const AbstractModel = require('./abstractModel');

class Shop extends AbstractModel {
  constructor() {
    super('stores'); // Specifies the MongoDB collection name for stores
  }

  // Basic validation to check fields and types
  validateShop(shop) {
    const validAttributes = ['uuid', 'address', 'inventory', 'name'];
    const requiredAttributes = {
      uuid: 'string',
      address: 'string',
      inventory: 'object', // Assuming inventory is an array
      name: 'string'
    };

    // Check for missing fields
    for (let attr of Object.keys(requiredAttributes)) {
      if (!(attr in shop)) {
        throw new Error(`Missing required field: ${attr}`);
      }
    }

    // Check for extra fields and correct types
    for (let key in shop) {
      if (!validAttributes.includes(key)) {
        throw new Error(`Invalid field: ${key}`);
      }
      if (typeof shop[key] !== requiredAttributes[key]) {
        throw new Error(`Invalid type for field ${key}. Expected ${requiredAttributes[key]}.`);
      }
    }
  }

  // Get inventory item by product_uuid and store_id
  async getInventoryByProduct(store_id, product_uuid) {
    const store = await this.get(store_id);
    if (!store) throw new Error('Store not found');
    
    const inventoryItem = store.inventory.find(item => item.product_uuid === product_uuid);
    return inventoryItem || null;
  }

  // Update inventory for a product in a specific store
  async updateInventory(store_id, product_uuid, newStock) {
    return await this.update(
      { uuid: store_id, 'inventory.product_uuid': product_uuid },
      { $set: { 'inventory.$.amount_in_stock': newStock } }
    );
  }

  // Check if there is enough stock for a product in the store
  async checkStock(store_id, product_uuid, requiredQuantity) {
    const inventoryItem = await this.getInventoryByProduct(store_id, product_uuid);
    if (!inventoryItem) {
      throw new Error(`Product with UUID ${product_uuid} not found in store`);
    }
    if (inventoryItem.amount_in_stock < requiredQuantity) {
      throw new Error(`Insufficient stock for product ${product_uuid} in store ${store_id}`);
    }
    return true;
  }
}

module.exports = new Shop();
