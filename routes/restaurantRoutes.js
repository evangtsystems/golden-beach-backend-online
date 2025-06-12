const express = require('express');
const router = express.Router();
const Restaurant = require('../models/restaurantModel'); // make sure this model exists

// GET /api/restaurant/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findOne({ identifier: id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
