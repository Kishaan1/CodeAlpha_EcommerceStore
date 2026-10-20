/**
 * routes/alerts.js
 * ----------------
 * SMARTBUY Price Drop Tracker API
 * POST   /api/alerts        -> registers a target-price tracker
 * GET    /api/alerts        -> lists tracked items with target vs current price
 * DELETE /api/alerts/:id    -> cancels/deletes price tracker
 * PUT    /api/alerts/:id    -> updates target price threshold
 */

const express = require('express');
const { db } = require('../db');

const router = express.Router();

// POST /api/alerts - Create new price tracker
router.post('/', (req, res) => {
  try {
    const { productId, email, user_email, targetPrice } = req.body || {};

    const pId = productId || (req.body && req.body.product_id);
    const tPrice = targetPrice !== undefined ? targetPrice : (req.body && req.body.target_price);
    const rawEmail = email || user_email || (req.body && req.body.email);

    if (!pId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const product = db.prepare('SELECT id, name, title, price, base_price, image_url, image FROM products WHERE id = ?').get(pId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const cleanEmail = String(rawEmail || 'shopper@smartbuy.in').trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const numTargetPrice = parseFloat(tPrice);
    if (isNaN(numTargetPrice) || numTargetPrice <= 0) {
      return res.status(400).json({ error: 'Please enter a valid positive target price.' });
    }

    const currentPrice = product.price || product.base_price;
    const status = currentPrice <= numTargetPrice ? 'triggered' : 'active';

    const insert = db.prepare(`
      INSERT INTO price_alerts (product_id, user_email, email, target_price, current_price, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    const info = insert.run(product.id, cleanEmail, cleanEmail, numTargetPrice, currentPrice, status);

    res.status(201).json({
      success: true,
      message: `Alert set! We will notify you when price hits ₹${numTargetPrice.toLocaleString('en-IN')}`,
      alert: {
        id: info.lastInsertRowid,
        productId: product.id,
        productName: product.title || product.name,
        currentPrice,
        targetPrice: numTargetPrice,
        userEmail: cleanEmail,
        email: cleanEmail,
        status,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Create price alert error:', err);
    res.status(500).json({ error: 'Unable to set price alert at this time.' });
  }
});

// GET /api/alerts - List tracked alerts with target vs current price
router.get('/', (req, res) => {
  try {
    const { email } = req.query;
    let query = `
      SELECT pa.id, pa.product_id, pa.user_email, pa.target_price, pa.status, pa.created_at,
             p.title, p.name, p.brand, p.category, p.image_url, p.image, p.price AS current_price,
             COALESCE((SELECT MIN(sl.price) FROM store_listings sl WHERE sl.product_id = p.id), p.price) AS lowest_store_price,
             COALESCE((SELECT sl.store_name FROM store_listings sl WHERE sl.product_id = p.id ORDER BY sl.price ASC LIMIT 1), 'Amazon.in') AS lowest_store_name
      FROM price_alerts pa
      JOIN products p ON pa.product_id = p.id
    `;
    const params = [];

    if (email && email.trim()) {
      query += ' WHERE LOWER(pa.user_email) = ? OR LOWER(pa.email) = ?';
      const cleanEmail = email.trim().toLowerCase();
      params.push(cleanEmail, cleanEmail);
    }

    query += ' ORDER BY pa.id DESC';
    const rows = db.prepare(query).all(...params);

    const alerts = rows.map((r) => {
      const bestPrice = r.lowest_store_price || r.current_price;
      const isTriggered = bestPrice <= r.target_price;
      const status = isTriggered ? 'triggered' : (r.status || 'active');

      return {
        id: r.id,
        productId: r.product_id,
        productTitle: r.title || r.name,
        brand: r.brand,
        category: r.category,
        imageUrl: r.image_url || r.image,
        targetPrice: r.target_price,
        currentPrice: r.current_price,
        lowestStorePrice: bestPrice,
        lowestStoreName: r.lowest_store_name,
        status,
        isTriggered,
        userEmail: r.user_email,
        createdAt: r.created_at,
      };
    });

    res.json({
      alerts,
      count: alerts.length,
    });
  } catch (err) {
    console.error('List price alerts error:', err);
    res.status(500).json({ error: 'Unable to fetch tracked alerts.' });
  }
});

// DELETE /api/alerts/:id - Cancel/delete tracked alert
router.delete('/:id', (req, res) => {
  try {
    const alertId = Number(req.params.id);
    const existing = db.prepare('SELECT id FROM price_alerts WHERE id = ?').get(alertId);

    if (!existing) {
      return res.status(404).json({ error: 'Tracked alert not found.' });
    }

    db.prepare('DELETE FROM price_alerts WHERE id = ?').run(alertId);

    res.json({
      success: true,
      message: 'Price alert tracker removed successfully.',
      deletedId: alertId,
    });
  } catch (err) {
    console.error('Delete price alert error:', err);
    res.status(500).json({ error: 'Unable to remove price alert.' });
  }
});

// PUT /api/alerts/:id - Update target threshold
router.put('/:id', (req, res) => {
  try {
    const alertId = Number(req.params.id);
    const { targetPrice } = req.body || {};
    const num = parseFloat(targetPrice);

    if (isNaN(num) || num <= 0) {
      return res.status(400).json({ error: 'Please enter a valid target price.' });
    }

    db.prepare('UPDATE price_alerts SET target_price = ? WHERE id = ?').run(num, alertId);

    res.json({
      success: true,
      message: `Target threshold updated to ₹${num.toLocaleString('en-IN')}`,
      updatedId: alertId,
      targetPrice: num,
    });
  } catch (err) {
    console.error('Update price alert error:', err);
    res.status(500).json({ error: 'Unable to update price alert.' });
  }
});

module.exports = router;
