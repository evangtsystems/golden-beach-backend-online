const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User'); // Adjust path if needed

async function resetAdminPassword() {
  await mongoose.connect(process.env.MONGO_URI);

  const newEmail = 'admin@goldenbeach.com';
  const oldEmail = 'admin@example.com'; // adjust if needed
  const plainPassword = 'Golden2025++';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  let adminUser = await User.findOne({ email: newEmail });

  if (adminUser) {
    // User already exists with the new email — update password and info
    const result = await User.updateOne(
      { email: newEmail },
      {
        $set: {
          password: hashedPassword,
          isAdmin: true,
          restaurantId: 'restaurant1',
          restaurantName: 'Golden Beach',
        },
      }
    );
    console.log(`✅ Updated existing admin. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  } else {
    // Try to find old admin and update their email
    const oldAdmin = await User.findOne({ email: oldEmail });
    if (oldAdmin) {
      const result = await User.updateOne(
        { email: oldEmail },
        {
          $set: {
            email: newEmail,
            password: hashedPassword,
            isAdmin: true,
            restaurantId: 'restaurant1',
            restaurantName: 'Golden Beach',
          },
        }
      );
      console.log(`✅ Updated old admin email. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    } else {
      // No admin found — create a new one
      const newAdmin = new User({
        email: newEmail,
        password: hashedPassword,
        isAdmin: true,
        restaurantId: 'restaurant1',
        restaurantName: 'Golden Beach',
      });
      await newAdmin.save();
      console.log('✅ Created new admin user.');
    }
  }

  await mongoose.disconnect();
}

resetAdminPassword().catch(console.error);
