const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Import routes
const metricsRoutes = require('./routes/metricsRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', metricsRoutes);

module.exports = app;