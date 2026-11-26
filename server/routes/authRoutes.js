const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

// Compare two strings without leaking how many characters matched
const safeEqual = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

// What the app needs after a successful login or sign-up
const authReply = (user) => ({
  token: jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' }),
  role: user.role,
  username: user.username,
  name: user.name || user.username,
  isMember: user.role === 'viewer' && Boolean(user.mobile),
});

// POST /api/auth/register
// type "member": a borrower who can see only their own books (needs a 10-digit mobile)
// type "librarian": staff who can manage records (needs the LIBRARIAN_CODE from the server .env)
router.post('/register', async (req, res) => {
  try {
    const b = req.body || {};
    const name = String(b.name || '').trim();
    const username = String(b.username || '').trim().toLowerCase();
    const password = String(b.password || '');
    const type = b.type === 'librarian' ? 'librarian' : 'member';
    const mobile = String(b.mobile || '').trim();

    if (!name) return res.status(400).json({ message: 'Enter your name.' });
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({
        message: 'Username must be 3 to 30 characters: lowercase letters, numbers and underscore only.',
      });
    }
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    if (password.length > 72) return res.status(400).json({ message: 'Password must be 72 characters or fewer.' });

    let role = 'viewer';
    let userMobile = '';

    if (type === 'librarian') {
      const code = process.env.LIBRARIAN_CODE;
      if (!code) return res.status(403).json({ message: 'Librarian sign-up is turned off.' });
      if (!safeEqual(b.accessCode || '', code)) {
        return res.status(403).json({ message: 'That librarian access code is not correct.' });
      }
      role = 'admin';
    } else {
      if (!/^\d{10}$/.test(mobile)) {
        return res.status(400).json({ message: 'Mobile must be exactly 10 digits.' });
      }
      userMobile = mobile;
    }

    if (await User.findOne({ username })) {
      return res.status(409).json({ message: 'That username is taken. Try another.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, username, password: hashed, role, mobile: userMobile });
    res.status(201).json(authReply(user));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'That username is taken. Try another.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: String(username).trim().toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid username or password' });

    const match = await bcrypt.compare(String(password), user.password);
    if (!match) return res.status(401).json({ message: 'Invalid username or password' });

    res.json(authReply(user));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;