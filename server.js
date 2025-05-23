const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const orderRoutes = require('./routes/orders');
const guestRoutes = require('./routes/guestRoutes');
const authRoutes = require('./routes/authRoutes'); // ✅ NEW

dotenv.config();

const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); // ✅ Enable credentials for cookies
app.use(express.json());
app.use(cookieParser()); // ✅ Enable cookie parsing


app.use('/api/guests', guestRoutes);
app.use('/api/auth', authRoutes); // ✅ NEW
app.use('/api/orders', orderRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`)))
  .catch((err) => console.error('MongoDB connection error:', err));

