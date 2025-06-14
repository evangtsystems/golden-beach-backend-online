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

    let imageUrl = '';

    // ✅ Only upload if an image was actually provided
    if (req.file) {
      imageUrl = await uploadImageToFirebase(req.file, 'menuImages');
    }

    const newItem = new MenuItem({
      name,
      description,
      price: parseFloat(price),
      category,
      imageUrl, // Will be empty string if no image was uploaded
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
    const { name, description, price, category, removeImage } = req.body;

    const updatedFields = {
      name,
      description,
      price: parseFloat(price),
      category,
    };

    if (removeImage === 'true') {
      updatedFields.imageUrl = ''; // or `null`, depending on your schema
    }

    if (req.file) {
      const imageUrl = await uploadImageToFirebase(req.file, 'menuImages');
      updatedFields.imageUrl = imageUrl;
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    console.error('Delete failed:', err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});




module.exports = router;