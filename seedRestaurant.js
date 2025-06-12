const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('./models/restaurantModel');

dotenv.config(); // Load .env for MONGO_URI

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Define the restaurant
    const restaurant = {
      identifier: 'restaurant1',
      name: 'Restaurant 1',
      description: 'Demo restaurant',
    };

    // Check if it already exists
    const existing = await Restaurant.findOne({ identifier: restaurant.identifier });
    if (existing) {
      console.log('ℹ️ Restaurant already exists:', existing.identifier);
    } else {
      await Restaurant.create(restaurant);
      console.log('✅ Restaurant created:', restaurant.identifier);
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error seeding restaurant:', error);
    mongoose.disconnect();
  }
};

seed();
