require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// node seedUser.js <username> <password> <admin|viewer>
const [, , username, password, role] = process.argv;

if (!username || !password || !['admin', 'viewer'].includes(role)) {
  console.log('Usage: node seedUser.js <username> <password> <admin|viewer>');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const hashed = await bcrypt.hash(password, 10);
    // Create the user, or update it if it already exists
    await User.findOneAndUpdate(
      { username },
      { username, password: hashed, role },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`User "${username}" saved with role "${role}"`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();