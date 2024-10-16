const mongoose = require('mongoose');

// חיבור ל-MongoDB
mongoose.connect('mongodb://localhost:27017/project_db') // שנה את 'project_db' לשם המאגר שלך
  .then(() => {
    console.log('Connected to MongoDB');
    updateStoreName('s002', 'HaYarkon branch'); // החלף את ה-UUID ואת השם החדש שברצונך להגדיר
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
  });

// הגדרת המודל עבור stores
const storeSchema = new mongoose.Schema({
  uuid: String,
  address: String,
  inventory: [
    {
      product_uuid: String,
      amount_in_stock: Number
    }
  ],
  name: String // שדה שם החנות
});

const Store = mongoose.model('Store', storeSchema);

// פונקציה לעדכון שם החנות
async function updateStoreName(uuid, newName) {
  try {
    const result = await Store.updateOne(
      { uuid: uuid }, // חיפוש החנות לפי UUID
      { $set: { name: newName } } // עדכון השדה name לערך החדש
    );

    if (result.modifiedCount > 0) {
      console.log(`Store with UUID ${uuid} has been updated to: ${newName}`);
    } else {
      console.log(`No store found with UUID ${uuid} or no changes made.`);
    }
  } catch (error) {
    console.error('Error while updating the store name:', error);
  } finally {
    // סגירת החיבור
    mongoose.connection.close();
  }
}
