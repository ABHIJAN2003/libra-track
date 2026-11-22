const mongoose = require('mongoose');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const recordSchema = new mongoose.Schema(
  {
    borrowerName: { type: String, required: [true, 'Borrower name is required'], trim: true },
    mobile: {
      type: String,
      required: [true, 'Mobile is required'],
      match: [/^\d{10}$/, 'Mobile must be exactly 10 digits'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      validate: {
        validator: (v) => !v || emailRegex.test(v), // empty is allowed
        message: 'Email format is invalid',
      },
    },
    department: { type: String, trim: true, default: '' },
    bookTitle: { type: String, required: [true, 'Book title is required'], trim: true },
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    issueDateTime: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: { values: ['Issued', 'Returned'], message: 'Status must be Issued or Returned' },
      default: 'Issued',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Record', recordSchema);