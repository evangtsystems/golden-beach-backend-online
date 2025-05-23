// models/GuestCount.js
const mongoose = require('mongoose');

const guestCountSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  tableNumber: { type: Number, required: true },
  guestCount: { type: Number, required: true },
});

module.exports = mongoose.model('GuestCount', guestCountSchema);
