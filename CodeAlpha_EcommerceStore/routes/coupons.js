/**
 * routes/coupons.js
 * -----------------
 * Handles verified store coupons and promo codes for SMARTBUY.
 * GET /api/coupons?store=...
 */

const express = require('express');
const { db } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { store } = req.query;
    let query = 'SELECT * FROM coupons WHERE is_verified = 1';
    const params = [];

    if (store && store !== 'All' && store !== 'all') {
      query += ' AND LOWER(store_name) LIKE ?';
      params.push(`%${store.trim().toLowerCase()}%`);
    }

    query += ' ORDER BY id ASC';
    const coupons = db.prepare(query).all(...params);

    res.json({
      coupons,
      count: coupons.length,
      lastVerified: '2026-10-13',
    });
  } catch (err) {
    console.error('Fetch coupons error:', err);
    res.status(500).json({ error: 'Unable to fetch verified coupons.' });
  }
});

module.exports = router;
