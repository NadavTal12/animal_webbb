const User = require('../models/userModel'); // Import the User model
const { v4: uuidv4 } = require('uuid'); // To generate UUIDs

class UserAuthController {
  // Signup a new user
  async signup(req, res) {
    try {
      const { email, name, address, password } = req.body;

      // Check if the email already exists in the database
      const existingUsers = await User.search('email', email);
      if (existingUsers.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const newUser = {
        uuid: uuidv4(),
        email,
        name: name || 'משתמש חדש', // ערך ברירת מחדל אם השם לא סופק
        address: address || '',
        password, // שמירת הסיסמה בטקסט פשוט (יש לשקול להשתמש בהצפנה)
        is_admin: false, // משתמש חדש אינו מנהל
      };

      const createdUser = await User.create(newUser);
      res.status(201).json({ message: 'User created successfully', user: createdUser });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Login a user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Check if the user exists
      const user = await User.search('email', email);
      if (user.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Check the password (plain text comparison)
      if (user[0].password !== password) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const { password: _, ...userWithoutPassword } = user[0]; // הסרת הסיסמה מהתשובה
      res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UserAuthController();
