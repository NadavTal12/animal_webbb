const { connectToDB, ensureCollectionExists } = require('../config/db');

class AbstractModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.db = null;
    this.collection = null;
  }

  async init() {
    if (!this.db || !this.collection) {
      try {
        this.db = await connectToDB(); // התחבר למסד הנתונים
        await ensureCollectionExists(this.collectionName); // ודא שהקולקציה קיימת
        this.collection = this.db.collection(this.collectionName); // שמור את הקולקציה
        console.log(`Collection ${this.collectionName} initialized`);
      } catch (error) {
        console.error(`Error initializing collection ${this.collectionName}:`, error);
        throw error;
      }
    }
  }

  // יצירת מסמך חדש
  async create(document) {
    await this.init(); // ודא שהקולקציה מאותחלת
    try {
      const result = await this.collection.insertOne(document);
      if (result.insertedId) {
        console.log(`Document inserted with ID: ${result.insertedId}`);
        return { ...document, _id: result.insertedId }; // החזר את המסמך עם ה-ID שהוכנס
      } else {
        throw new Error('Failed to insert document');
      }
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // עדכון מסמך קיים לפי פילטר
  async update(filter, update) {
    await this.init(); // ודא שהקולקציה מאותחלת
    try {
      const result = await this.collection.updateOne(filter, update);
      if (result.modifiedCount > 0) {
        console.log(`Document updated with filter: ${JSON.stringify(filter)}`);
        return true;
      } else {
        console.log('No documents matched the filter for update.');
        return false;
      }
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // מחיקת מסמך לפי פילטר
  async delete(filter) {
    await this.init(); // ודא שהקולקציה מאותחלת
    try {
      const result = await this.collection.deleteOne(filter);
      if (result.deletedCount > 0) {
        console.log(`Document deleted with filter: ${JSON.stringify(filter)}`);
        return true;
      } else {
        console.log('No documents matched the filter for deletion.');
        return false;
      }
    } catch (error) {
      console.error(`Error deleting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // החזרת כל המסמכים או לפי שאילתה
  async list(query = {}) {
    await this.init(); // ודא שהקולקציה מאותחלת
    try {
      const documents = await this.collection.find(query).toArray();
      return documents;
    } catch (error) {
      console.error(`Error listing documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // חיפוש מסמכים לפי מאפיין וערך
  async search(attribute, value) {
    await this.init(); // ודא שהקולקציה מאותחלת
    try {
      const query = { [attribute]: value }; // יצירת שאילתה דינמית
      const documents = await this.collection.find(query).toArray();
      console.log(`Searching documents in ${this.collectionName} by ${attribute}: ${value}`);
      return documents;
    } catch (error) {
      console.error(`Error searching in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // החזרת מסמך לפי UUID
  async get(uuid) {
    await this.init(); // ודא שהקולקציה מאותחלת
    try {
      const document = await this.collection.findOne({ uuid });
      if (document) {
        console.log(`Found document in ${this.collectionName} by uuid: ${uuid}`);
        return document;
      } else {
        console.log(`No document found in ${this.collectionName} with uuid: ${uuid}`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting document by uuid from ${this.collectionName}:`, error);
      throw error;
    }
  }
}

module.exports = AbstractModel;
