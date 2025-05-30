const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const orderRoutes = require('./routes/orders');
const guestRoutes = require('./routes/guestRoutes');
const authRoutes = require('./routes/authRoutes'); // ✅ NEW
const uploadRoutes = require('./routes/uploadRoutes');

dotenv.config();

const app = express();
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://qr-menu.gtsystems.gr'], // ✅ Accept both local and production origins
  })
);
app.use(express.json());
app.use(cookieParser());



app.use('/api/menu-item', uploadRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/auth', authRoutes); // ✅ NEW
app.use('/api/orders', orderRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`)))
  .catch((err) => console.error('MongoDB connection error:', err));

