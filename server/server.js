// Load variables from .env into process.env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');

const app = express();

app.use(cors());          // allow the React app to call this API
app.use(express.json());  // read JSON request bodies

// Simple test route
app.get('/', (req, res) => res.send('LibraTrack API is running'));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start listening
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });