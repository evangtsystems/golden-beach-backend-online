const Guest = require('../models/guest'); // You’ll create this model next

// GET Guest Count
exports.getGuestCount = async (req, res) => {
  const { restaurantId, tableNumber } = req.query;

  try {
    const guest = await Guest.findOne({ restaurantId, tableNumber });
    res.json({ count: guest ? guest.guestCount : 0 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching guest count', error: err });
  }
};

// POST Set Guest Count
exports.setGuestCount = async (req, res) => {
  const { restaurantId, tableNumber, guestCount } = req.body;

  try {
    const guest = await Guest.findOneAndUpdate(
      { restaurantId, tableNumber },
      { guestCount },
      { upsert: true, new: true }
    );
    res.json({ message: 'Guest count updated', guest });
  } catch (err) {
    res.status(500).json({ message: 'Error setting guest count', error: err });
  }
};
