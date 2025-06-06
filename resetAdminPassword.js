const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User'); // Adjust path if needed

async function resetAdminPassword() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@example.com';
  const plainPassword = '123456';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const result = await User.updateOne(
    { email },
    {
      $set: {
        password: hashedPassword,
        isAdmin: true,
        restaurantId: 'restaurant1',
        restaurantName: 'Golden Beach',
      },
    }
  );

  console.log(`✅ Password reset. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  await mongoose.disconnect();
}

resetAdminPassword().catch(console.error);
