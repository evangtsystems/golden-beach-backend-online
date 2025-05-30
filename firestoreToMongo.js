const admin = require('firebase-admin');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config(); // Load .env variables

const serviceAccount = require('C:/Users/evangelos.lampos/Downloads/qrmenuapp-bc491-77cea674f57e.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

// Use environment variables
const mongoUri = process.env.MONGO_URI;
const dbName = 'golden_beach';

const force = process.argv.includes('--force'); // Add --force flag support

async function migrateMenuItems() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(dbName);
    const menuCollection = db.collection('menuItems');

    if (force) {
      console.log('⚠️ Force mode enabled — clearing entire menuItems collection...');
      await menuCollection.deleteMany({});
    }

    const restaurantsSnapshot = await firestore.collection('restaurants').get();

    for (const restaurantDoc of restaurantsSnapshot.docs) {
      const restaurantId = restaurantDoc.id;
      const menuItemsSnapshot = await firestore
        .collection('restaurants')
        .doc(restaurantId)
        .collection('menuItems')
        .get();

      const items = menuItemsSnapshot.docs.map(doc => ({
        ...doc.data(),
        restaurantId,
      }));

      if (items.length > 0) {
        const existingCount = await menuCollection.countDocuments({ restaurantId });
        if (existingCount === 0 || force) {
          await menuCollection.insertMany(items);
          console.log(`✅ Migrated ${items.length} items for ${restaurantId}`);
        } else {
          console.log(`⚠️ Skipped ${restaurantId} — items already exist (${existingCount})`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

migrateMenuItems();
