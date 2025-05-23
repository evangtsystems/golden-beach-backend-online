const mongoose = require('mongoose');
const Order = require('../models/order');


// Create New Order
const Guest = require('../models/guest'); // Ensure this is imported at the top

const createOrder = async (req, res) => {
  try {
    const { guestId, restaurantId, tableNumber, items, totalGuestsExpected } = req.body;

    // ✅ Look up guest to get isExtra flag
    const guest = await Guest.findOne({ guestId, restaurantId, tableNumber });
    const isExtra = guest?.isExtra || false;

    // ✅ Construct the order with isExtra
    const newOrder = new Order({
      guestId,
      restaurantId,
      tableNumber,
      items,
      status: 'pending',
      totalGuestsExpected,
      isExtra,
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({ message: 'Order created', orderId: savedOrder._id });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};


// Get All Orders (Optionally Filter by Status or Table)
const getOrders = async (req, res) => {
  try {
    const { restaurantId, status, tableNumber, guestId } = req.query;
    console.log('🔧 Incoming GET Orders Request - restaurantId:', restaurantId);

    const query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (status) query.status = status;
    if (tableNumber) query.tableNumber = Number(tableNumber);
    if (guestId) query.guestId = guestId; // ✅ ADD THIS LINE

    const orders = await Order.find(query).lean();

    const enrichedOrders = orders.map(order => ({
      ...order,
      isExtra: order.isExtra || false,
    }));

    res.status(200).json(enrichedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};




const getCompletedOrders = async (req, res) => {
  const { restaurantId } = req.query;

  try {
    const completedOrders = await Order.find({ 
      restaurantId, 
      status: 'completed' 
    }).sort({ createdAt: -1 });

    res.json(completedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching completed orders.' });
  }
};

const markGroupSubmitted = async (req, res) => {
  try {
    const { restaurantId, tableNumber } = req.body;
    await Order.updateMany(
      { restaurantId, tableNumber, status: 'pending' },
      { $set: { groupSubmitted: true } }
    );
    res.status(200).json({ message: 'Group marked as submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update orders' });
  }
};




// Get Order Status (with validation for ObjectId)
const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid Order ID format' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ status: order.status });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ error: 'Failed to fetch order status' });
  }
};

module.exports = { 
  createOrder, 
  getOrders, 
  getCompletedOrders, 
  getOrderStatus, 
  markGroupSubmitted 
};