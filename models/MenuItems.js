const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },

  restaurantId: String,
}, { collection: 'menuItems' });  // <--- add this line to specify exact collection name

module.exports = mongoose.model('MenuItem', menuItemSchema);





