const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },            // stored hashed
    // Set for members. It links a member to the loans recorded under this mobile number.
    mobile: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);