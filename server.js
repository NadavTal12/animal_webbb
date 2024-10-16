const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { connectToDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// הגדרת הנתיבים
const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes'); // שימוש ב-shopRoutes לנתיב של חנויות
const userAuthRoutes = require('./routes/userAuthRoutes');
const cartManagerRoutes = require('./routes/cartManagerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const personalAccountRoutes = require('./routes/personalAccountRoutes');
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const biRoutes = require('./routes/biRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Middleware to parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'assets' and 'Pages' directories
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'Pages')));
app.use(express.static(path.join(__dirname, 'js')));

// Use routes
app.use('/bi', biRoutes);
app.use('/users', userRoutes);
app.use('/auth', userAuthRoutes);
app.use('/carts', cartRoutes);
app.use('/cart-manager', cartManagerRoutes);
app.use('/payment', paymentRoutes);
app.use('/personal', personalAccountRoutes);
app.use('/products', productRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/stores', shopRoutes); // וודא שהנתיב '/stores' מתייחס ל-shopRoutes בצורה נכונה
app.use('/orders', orderRoutes); // חיבור נתיב ההזמנות

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Pages', 'index.html'));
});

// Connect to DB and start the server
(async () => {
  try {
    const db = await connectToDB('mongodb://localhost:27017/project_db');
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
})();
