const User = require('../models/User'); // Mongoose model for users
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT (store in environment variable in production)
const JWT_SECRET = 'your_super_secret_key';

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ restaurantId: user.restaurantId, restaurantName: user.restaurantName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(401).json({ error: 'User not found' });

    res.json({ restaurantId: user.restaurantId, restaurantName: user.restaurantName });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

exports.registerAdmin = async (req, res) => {
  const { email, password, restaurantId, restaurantName } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' }); // ✅ Return immediately
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Hashed Password:', hashedPassword);

    const newUser = new User({
      email,
      password: hashedPassword,
      restaurantId,
      restaurantName,
    });

    await newUser.save();

    return res.status(201).json({ message: 'Admin user registered successfully!' }); // ✅ Proper status code for resource creation
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' }); // ✅ Return on error
  }
};


// POST /api/auth/logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};
