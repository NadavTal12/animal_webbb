const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const connectionURL = 'mongodb://localhost:27017';
const databaseName = 'project_db';

let db;

const connectToDB = async () => {
  if (db) return db; // Return the existing db connection
  try {
    const client = await MongoClient.connect(connectionURL); // הסר את useNewUrlParser ו-useUnifiedTopology
    db = client.db(databaseName);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error("Can't connect to the database", error);
    throw error;
  }
};

// Function to ensure a collection exists; creates it if missing
const ensureCollectionExists = async (collectionName) => {
  try {
    const db = await connectToDB(); // Ensure we have a database connection
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      console.log(`Collection ${collectionName} created`);
    } else {
      console.log(`Collection ${collectionName} already exists`);
    }
  } catch (error) {
    console.error(`Error ensuring collection ${collectionName} exists:`, error);
    throw error;
  }
};

module.exports = { connectToDB, ensureCollectionExists };
