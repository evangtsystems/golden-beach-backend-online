const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User'); // Adjust path if needed

async function setAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@goldenbeach.com';

  const result = await User.updateOne(
    { email },
    { $set: { isAdmin: true } }
  );

  console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

  await mongoose.disconnect();
}

setAdmin().catch(console.error);
