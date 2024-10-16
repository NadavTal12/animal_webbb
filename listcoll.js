const mongoose = require('mongoose');

// התחברות למאגר MongoDB
mongoose.connect('mongodb://localhost:27017/project_db') // שנה את 'database_name' לשם מאגר שלך
  .then(() => {
    console.log('Connected to MongoDB');
    listCollections();
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
  });

// פונקציה לבדיקת האוספים והמידע בהם
async function listCollections() {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // אם אין אוספים, הצג הודעה
    if (collections.length === 0) {
      console.log('No collections found.');
      return;
    }

    console.log('Collections:');
    for (const collection of collections) {
      console.log(collection.name);
      
      // הצגת כמה מסמכים יש באוסף
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  Number of documents: ${count}`);
      
      // הצגת המסמכים הראשונים
      const documents = await mongoose.connection.db.collection(collection.name).find().limit(5).toArray();
      console.log('  Sample documents:', documents);
    }
  } catch (error) {
    console.error('Error fetching collections:', error);
  } finally {
    mongoose.connection.close(); // סגירת החיבור
  }
}
