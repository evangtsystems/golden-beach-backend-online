const express = require('express');
const Guest = require('../models/guest');
const Order = require('../models/order');
const mongoose = require('mongoose'); // ✅ Add this line

// ✅ Correct Import Using Destructuring
const { createOrder, getOrders, getOrderStatus, getCompletedOrders, markGroupSubmitted } = require('../controllers/orderController');

const router = express.Router();

// backend/routes/orderRoutes.js
// routes/orderRoutes.js
router.post('/clear-table', async (req, res) => {
  let { restaurantId, tableNumber } = req.body;
  tableNumber = Number(tableNumber); // Ensure it's a number

  try {
    // 1️⃣ Delete completed orders
    const orderResult = await Order.deleteMany({
      restaurantId,
      tableNumber,
      status: 'completed',
    });

    // 2️⃣ Delete ALL guests (extras + count holder)
    const guestResult = await Guest.deleteMany({
      restaurantId,
      tableNumber,
    });

    console.log(`🧼 Cleared ${orderResult.deletedCount} completed orders and ${guestResult.deletedCount} guests from table ${tableNumber}`);
    res.json({
      message: 'Table cleared successfully.',
      deletedOrders: orderResult.deletedCount,
      deletedGuests: guestResult.deletedCount,
    });
  } catch (err) {
    console.error('❌ Error clearing table:', err);
    res.status(500).json({ error: 'Failed to clear table.' });
  }
});










// ✅ Add the missing route
// ✅ Safe Update Status Route with Validation and Logging
router.post('/update-status', async (req, res) => {
  const { orderId, newStatus } = req.body;

  console.log('🔧 Received orderId:', orderId);
  console.log('🔧 New status:', newStatus);

  // Validate orderId format
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    console.log('❌ Invalid ObjectId format.');
    return res.status(400).json({ error: 'Invalid orderId format.' });
  }

  try {
    const updated = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });

    if (!updated) {
      console.log('❌ Order not found in the database.');
      return res.status(404).json({ error: 'Order not found.' });
    }

    console.log('✅ Order status updated successfully.');
    res.json({ message: 'Order status updated successfully.' });
  } catch (err) {
    console.error('❌ Error updating status:', err);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// ✅ Check if all guests have submitted their orders
router.get('/check-group-submission', async (req, res) => {
  const { restaurantId, tableNumber } = req.query;

  try {
    const guestRecord = await Guest.findOne({ restaurantId, tableNumber });

    // ✅ Return allSubmitted: false instead of 404 to prevent frontend issues
    if (!guestRecord) {
      return res.status(200).json({ allSubmitted: false, message: 'Guest count not set yet.' });
    }

    const totalGuests = guestRecord.guestCount || 0;
    const uniqueGuests = await Order.distinct('guestId', { restaurantId, tableNumber });

    const allSubmitted = uniqueGuests.length >= totalGuests;
    res.status(200).json({ allSubmitted });
  } catch (err) {
    console.error('Error checking group submission:', err);
    res.status(500).json({ error: 'Failed to check group submission status.' });
  }
});


// ✅ Mark group as submitted
router.post('/mark-group-submitted', markGroupSubmitted);

// ✅ Test Route
router.get('/test', (req, res) => {
  res.send('Orders route is working!');
});

// ✅ Orders Routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/completed', getCompletedOrders); // ✅ Corrected
router.get('/status', getOrderStatus);

module.exports = router;
