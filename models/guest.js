const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  guestId: { type: String, required: true, unique: true },
  restaurantId: { type: String, required: true },
  tableNumber: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  isCountHolder: { type: Boolean, default: false }, // Special doc for guest count
  guestCount: { type: Number }, // Only used when isCountHolder is true
  isExtra: { type: Boolean, default: false }, // ✅ Add this line
});

module.exports = mongoose.model('Guest', guestSchema);
