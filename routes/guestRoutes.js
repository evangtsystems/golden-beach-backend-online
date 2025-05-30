const express = require('express');
const router = express.Router();
const Guest = require('../models/guest');

// Register a guest (each guest gets their own document)
router.post('/register', async (req, res) => {
  const { guestId, restaurantId, tableNumber } = req.body;

  if (!guestId || !restaurantId || tableNumber === undefined) {
    return res.status(400).json({ error: 'Missing guestId, restaurantId, or tableNumber' });
  }

  const tableNum = Number(tableNumber);

  try {
    const exists = await Guest.findOne({ guestId });
    if (exists) {
      return res.status(200).json({ message: 'Guest already registered' });
    }

    // Get expected guest count for this table
    const countHolder = await Guest.findOne({
      restaurantId,
      tableNumber: tableNum,
      isCountHolder: true,
    });
    const expectedCount = countHolder?.guestCount || 0;

    // Count how many guests are already registered (excluding countHolder)
    const currentCount = await Guest.countDocuments({
      restaurantId,
      tableNumber: tableNum,
      isCountHolder: { $ne: true },
    });

    const isExtra = currentCount >= expectedCount;

    const guest = new Guest({
      guestId,
      restaurantId,
      tableNumber: tableNum,
      isExtra,
    });

    await guest.save();

    res.status(201).json({
      message: isExtra ? 'Extra guest registered' : 'Guest registered successfully',
      isExtra,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to register guest',
      details: err.message,
    });
  }
});

// Store guest count ONCE per table using a special document
router.post('/count', async (req, res) => {
  const { restaurantId, tableNumber, guestCount } = req.body;

  console.log('[POST /guests/count]', { restaurantId, tableNumber, guestCount });

  const tableNum = Number(tableNumber);
  const count = Number(guestCount);

  if (!restaurantId || !tableNum || !count || count <= 0) {
    return res.status(400).json({ error: 'Invalid data. All fields are required and guestCount must be > 0.' });
  }

  const dummyGuestId = `countHolder_${restaurantId}_${tableNum}`;

  try {
    await Guest.findOneAndUpdate(
      { restaurantId, tableNumber: tableNum, isCountHolder: true },
      {
        guestId: dummyGuestId,
        restaurantId,
        tableNumber: tableNum,
        guestCount: count,
        isCountHolder: true,
      },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'Guest count set successfully' });
  } catch (err) {
    console.error('❌ Failed to set guest count:', err);
    res.status(500).json({ error: 'Failed to set guest count', details: err.message });
  }
});

// Reset all guests for a table
router.post('/reset', async (req, res) => {
  const { restaurantId, tableNumber } = req.body;

  if (!restaurantId || tableNumber === undefined) {
    return res.status(400).json({ error: 'restaurantId and tableNumber are required' });
  }

  const tableNum = Number(tableNumber);

  try {
    await Guest.deleteMany({ restaurantId, tableNumber: tableNum });

    return res.status(200).json({ message: 'Guest count and registrations reset.' });
  } catch (err) {
    console.error('❌ Error in /guests/reset:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Fetch guest count for the table
router.get('/count', async (req, res) => {
  const { restaurantId, tableNumber } = req.query;
  const tableNum = Number(tableNumber);

  try {
    const countHolder = await Guest.findOne({ restaurantId, tableNumber: tableNum, isCountHolder: true });
    const count = countHolder ? countHolder.guestCount : 0;
    res.status(200).json({ count });
  } catch (err) {
    console.error('❌ Error fetching guest count:', err);
    res.status(500).json({ error: 'Failed to fetch guest count' });
  }
});
// ✅ Add to your routes/guestRoutes.js or wherever guests are handled
// ✅ Corrected: Fetch all guests for a table
router.get('/', async (req, res) => {
  const { restaurantId, tableNumber } = req.query;
  try {
    const guests = await Guest.find({ restaurantId, tableNumber: Number(tableNumber) });
    res.json(guests);
  } catch (err) {
    console.error('❌ Failed to fetch guests:', err);
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});


module.exports = router;
