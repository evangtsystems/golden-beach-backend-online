const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true },
  name: String,
  description: String,
  logoUrl: String,
  // ... add more fields as needed
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
