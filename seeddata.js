const mongoose = require('mongoose');

// הגדרת הסכמות
const userSchema = new mongoose.Schema({
  uuid: String,
  email: String,
  name: String,
  address: String,
  password: String,
  is_admin: Boolean
});

const supplierSchema = new mongoose.Schema({
  uuid: String,
  name: String,
  address: String
});

const storeSchema = new mongoose.Schema({
  uuid: String,
  address: String,
  inventory: [
    {
      product_uuid: String,
      amount_in_stock: Number
    }
  ]
});

const productSchema = new mongoose.Schema({
  uuid: String,
  name: String,
  description: String,
  image: String,
  price: Number,
  amount_sold: Number,
  supplier: String
});

const orderSchema = new mongoose.Schema({
  uuid: String,
  user: String,
  address: String,
  products: [
    {
      product_uuid: String,
      quantity: Number
    }
  ]
});

const cartSchema = new mongoose.Schema({
  uuid: String,
  user: String,
  products: [
    {
      product_uuid: String,
      quantity: Number
    }
  ]
});

// נתונים פקטיביים
const usersData = [
  {
    "uuid": "u001",
    "email": "yossi.cohen@example.com",
    "name": "Yossi Cohen",
    "address": "12 Herzl St, Tel Aviv",
    "password": "hashed_password_1",
    "is_admin": false
  },
  {
    "uuid": "u002",
    "email": "noa.levi@example.com",
    "name": "Noa Levi",
    "address": "15 Rothschild Blvd, Haifa",
    "password": "hashed_password_2",
    "is_admin": false
  },
  {
    "uuid": "u003",
    "email": "admin@example.com",
    "name": "Rami David",
    "address": "20 Ben Yehuda St, Jerusalem",
    "password": "hashed_password_3",
    "is_admin": true
  }
];

const suppliersData = [
  {
    "uuid": "s001",
    "name": "Pet Supplies Co.",
    "address": "21 Weizmann St, Tel Aviv"
  },
  {
    "uuid": "s002",
    "name": "Best Pet Toys Ltd.",
    "address": "7 King George St, Haifa"
  },
  {
    "uuid": "s003",
    "name": "Aquatic World Ltd.",
    "address": "8 Herzl St, Jerusalem"
  }
];

const storesData = [
  {
    "uuid": "s001",
    "address": "1 Dizengoff St, Tel Aviv",
    "inventory": [
      { "product_uuid": "p001", "amount_in_stock": 50 },
      { "product_uuid": "p002", "amount_in_stock": 75 }
    ]
  },
  {
    "uuid": "s002",
    "address": "10 HaYarkon St, Tel Aviv",
    "inventory": [
      { "product_uuid": "p003", "amount_in_stock": 30 }
    ]
  }
];

const productsData = [
  {
    "uuid": "p001",
    "name": "Dog Collar",
    "description": "Adjustable leather collar for dogs",
    "image": "base64_encoded_image_data",
    "price": 49.99,
    "amount_sold": 15,
    "supplier": "s001"
  },
  {
    "uuid": "p002",
    "name": "Cat Toy Mouse",
    "description": "Interactive toy for cats, made with safe materials",
    "image": "base64_encoded_image_data",
    "price": 29.99,
    "amount_sold": 35,
    "supplier": "s002"
  },
  {
    "uuid": "p003",
    "name": "Aquarium Filter",
    "description": "High-quality filter for medium-sized aquariums",
    "image": "base64_encoded_image_data",
    "price": 149.99,
    "amount_sold": 10,
    "supplier": "s003"
  }
];

const ordersData = [
  {
    "uuid": "o001",
    "user": "u001",
    "address": "12 Herzl St, Tel Aviv",
    "products": [
      { "product_uuid": "p001", "quantity": 1 },
      { "product_uuid": "p002", "quantity": 3 }
    ]
  },
  {
    "uuid": "o002",
    "user": "u002",
    "address": "15 Rothschild Blvd, Haifa",
    "products": [
      { "product_uuid": "p003", "quantity": 2 }
    ]
  }
];

const cartsData = [
  {
    "uuid": "c001",
    "user": "u001",
    "products": [
      { "product_uuid": "p001", "quantity": 1 },
      { "product_uuid": "p002", "quantity": 3 }
    ]
  },
  {
    "uuid": "c002",
    "user": "u002",
    "products": [
      { "product_uuid": "p003", "quantity": 2 }
    ]
  }
];

// חיבור ל-MongoDB
mongoose.connect('mongodb://localhost:27017/project_db') // שנה את 'your_database_name' לשם המאגר שלך
  .then(() => {
    console.log('Connected to MongoDB');
    seedData(); // קריאה לפונקציה להחדרת נתונים
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
  });

// פונקציה להחדרת נתונים
async function seedData() {
  const User = mongoose.model('User', userSchema);
  const Supplier = mongoose.model('Supplier', supplierSchema);
  const Store = mongoose.model('Store', storeSchema);
  const Product = mongoose.model('Product', productSchema);
  const Order = mongoose.model('Order', orderSchema);
  const Cart = mongoose.model('Cart', cartSchema);

  // הכנסה למאגר
  try {
    await User.insertMany(usersData);
    await Supplier.insertMany(suppliersData);
    await Store.insertMany(storesData);
    await Product.insertMany(productsData);
    await Order.insertMany(ordersData);
    await Cart.insertMany(cartsData);

    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    // סגירת החיבור
    mongoose.connection.close();
  }
}
