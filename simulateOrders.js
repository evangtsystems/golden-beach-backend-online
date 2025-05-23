const axios = require('axios');

// API Endpoints
const GUEST_API_URL = 'http://localhost:5000/api/guests/register';
const ORDER_API_URL = 'http://localhost:5000/api/orders';

// Simulation Data for 5 Tables
const tables = [
  { tableNumber: 1, totalGuests: 2 },
  { tableNumber: 2, totalGuests: 1 },
  { tableNumber: 3, totalGuests: 3 },
  { tableNumber: 4, totalGuests: 2 },
  { tableNumber: 5, totalGuests: 1 },
];

// Simulate Orders for Each Guest
async function simulateOrders() {
  for (const table of tables) {
    const { tableNumber, totalGuests } = table;

    // Step 1: Register Guest Count for the Table
    try {
      await axios.post(GUEST_API_URL, {
        restaurantId: 'golden_beach',
        tableNumber,
        guestId: `count_holder_table_${tableNumber}`, // Just a placeholder guestId for count holder
        guestCount: totalGuests,
      });
      console.log(`👥 Guest count registered for Table ${tableNumber}`);
    } catch (err) {
      console.error(`❌ Failed to register guest count for Table ${tableNumber}:`, err.response?.data || err.message);
      continue;
    }

    // Step 2: Simulate Orders for Each Guest
    for (let guest = 1; guest <= totalGuests; guest++) {
      const guestId = `guest${guest}_table${tableNumber}`;
      try {
        await axios.post(ORDER_API_URL, {
          restaurantId: 'golden_beach',
          tableNumber,
          guestId,
          status: 'pending',
          items: generateRandomItems(),
          totalGuestsExpected: totalGuests,
          groupSubmitted: true, // Simulating all guests have submitted
          archived: false,
        });
        console.log(`✅ Table ${tableNumber} - Guest ${guest} Order Placed`);
      } catch (err) {
        console.error(`❌ Table ${tableNumber} - Guest ${guest} Order Failed:`, err.response?.data || err.message);
      }
    }
  }

  console.log('🚀 All Simulated Orders Completed!');
}

// Helper: Generate Random Items for Realistic Orders
function generateRandomItems() {
  const menu = [
    { name: 'Coffee', price: 3.5 },
    { name: 'Juice', price: 4.0 },
    { name: 'Beer', price: 5.0 },
    { name: 'Cocktail', price: 7.5 },
    { name: 'Wine', price: 6.5 },
    { name: 'Whiskey', price: 8.0 },
    { name: 'Water', price: 1.5 },
  ];
  const itemsCount = Math.floor(Math.random() * 3) + 1; // 1-3 items per order

  return Array.from({ length: itemsCount }, () => {
    const item = menu[Math.floor(Math.random() * menu.length)];
    return { ...item };
  });
}

// Start Simulation
simulateOrders();
