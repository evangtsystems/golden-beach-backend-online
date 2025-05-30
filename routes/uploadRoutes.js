const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { uploadImageToFirebase } = require('../utils/firebaseUpload');
const MenuItem = require('../models/MenuItems'); // your MongoDB model

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {

  try {
    const { name, description, price, category, restaurantId } = req.body;

    // Upload to Firebase and get URL
    const imageUrl = await uploadImageToFirebase(req.file, 'menuImages');

    // Save to MongoDB
    const newItem = new MenuItem({
      name,
      description,
      price: parseFloat(price),
      category,
      imageUrl,
      restaurantId
    });

    await newItem.save();

    res.json({ success: true, item: newItem });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});
// GET /menu-item?restaurantId=xyz
router.get('/', async (req, res) => {

  const { restaurantId } = req.query;
  console.log('Fetching menu items for restaurant:', restaurantId); // 👈 Add this

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: 'Missing restaurantId' });
  }

  try {
    const items = await MenuItem.find({ restaurantId });
    console.log('Found items:', items); // 👈 And this
    res.json(items);
  } catch (err) {
    console.error('Failed to fetch menu items:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;

    const updatedFields = {
      name,
      description,
      price: parseFloat(price),
      category,
    };

    if (req.file) {
      // If there's a new image uploaded, upload to Firebase and update URL
      const imageUrl = await uploadImageToFirebase(req.file, 'menuImages');
      updatedFields.imageUrl = imageUrl;
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedItem) return res.status(404).json({ success: false, message: 'Menu item not found' });

    res.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});



module.exports = router;
