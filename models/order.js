const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  restaurantId: String,
  tableNumber: Number,
  guestId: String,
  items: [
    {
      name: String,
      price: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  isLate: Boolean,
  groupSubmitted: Boolean,
  totalGuestsExpected: Number,
  isExtra: { type: Boolean, default: false }, // ✅ ADD THIS
});

module.exports = mongoose.model('Order', OrderSchema);

