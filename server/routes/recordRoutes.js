const express = require('express');
const mongoose = require('mongoose');
const Record = require('../models/Record');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Every record route needs a logged-in user
router.use(protect);

// Only these fields may be set from the request body
const pickFields = (body) => ({
  borrowerName: body.borrowerName,
  mobile: body.mobile,
  email: body.email,
  department: body.department,
  bookTitle: body.bookTitle,
  dueDate: body.dueDate,
});

const handleError = (err, res) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  return res.status(500).json({ message: 'Server error' });
};

const checkId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid record id' });
  }
  next();
};

// GET /api/records/stats  -> summary card numbers (must be above /:id)
router.get('/stats', async (req, res) => {
  try {
    const [total, issued, returned] = await Promise.all([
      Record.countDocuments(),
      Record.countDocuments({ status: 'Issued' }),
      Record.countDocuments({ status: 'Returned' }),
    ]);
    res.json({ total, issued, returned });
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/records?search=...&status=...
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status && ['Issued', 'Returned'].includes(status)) filter.status = status;

    if (search) {
      // escape special regex characters so the search is safe
      const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { borrowerName: { $regex: safe, $options: 'i' } },
        { mobile: { $regex: safe } },
      ];
    }

    const records = await Record.find(filter).sort({ issueDateTime: -1 });
    res.json(records);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/records/:id
router.get('/:id', checkId, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    handleError(err, res);
  }
});

// POST /api/records (admin)
router.post('/', adminOnly, async (req, res) => {
  try {
    const record = await Record.create(pickFields(req.body));
    res.status(201).json(record);
  } catch (err) {
    handleError(err, res);
  }
});

// PUT /api/records/:id (admin)
router.put('/:id', adminOnly, checkId, async (req, res) => {
  try {
    const record = await Record.findByIdAndUpdate(req.params.id, pickFields(req.body), {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    handleError(err, res);
  }
});

// PATCH /api/records/:id/status (admin) -> Issued / Returned
router.patch('/:id/status', adminOnly, checkId, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Issued', 'Returned'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Issued or Returned' });
    }
    const record = await Record.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after', runValidators: true }
    );
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    handleError(err, res);
  }
});

// DELETE /api/records/:id (admin)
router.delete('/:id', adminOnly, checkId, async (req, res) => {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    handleError(err, res);
  }
});

module.exports = router;