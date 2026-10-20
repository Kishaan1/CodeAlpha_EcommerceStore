/**
 * server.js
 * ---------
 * Entry point for CodeAlpha_EcommerceStore.
 * - Initializes (and seeds, if empty) the file-based SQLite database.
 * - Wires up the REST API under /api/*.
 * - Serves the static Vanilla JS frontend from /public.
 *
 * Run with: npm install && npm start
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const { initDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const alertRoutes = require('./routes/alerts');
const couponRoutes = require('./routes/coupons');
const smartbuyRoutes = require('./routes/smartbuy');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Make sure the database file exists, has its schema, and is seeded.
initDatabase();

// 2. Core middleware.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. API routes.
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api', smartbuyRoutes);

// Simple health check, handy for confirming the server is alive.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 4. Static frontend.
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// 5. Unknown API routes -> 404 JSON. Dedicated product page -> product.html. Everything else -> index.html.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

app.get('/product', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'product.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// 6. Centralized error handler (last).
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log('\n============================================');
  console.log('  🛍️  CodeAlpha_EcommerceStore is running!');
  console.log(`  ➜  App:  http://localhost:${PORT}`);
  console.log(`  ➜  API:  http://localhost:${PORT}/api`);
  console.log('============================================\n');
});
