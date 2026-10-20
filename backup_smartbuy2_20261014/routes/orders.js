/**
 * routes/orders.js
 * ---------------
 * POST /api/orders  -> place a new order (protected) — validates items
 *                      against live product data, computes totals server-side,
 *                      decrements stock, and returns a generated Order ID.
 * GET  /api/orders  -> list the logged-in user's past orders (protected)
 */

const express = require('express');
const crypto = require('crypto');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const TAX_RATE = 0.08; // 8% flat sales tax (mock)
const FREE_SHIPPING_THRESHOLD = 75;
const FLAT_SHIPPING_COST = 6.99;

function round2(value) {
  return Math.round(value * 100) / 100;
}

function generateOrderNumber() {
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CA-${Date.now().toString().slice(-6)}-${suffix}`;
}

function generateTrackingNumber() {
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CA-TRK-${suffix}`;
}

function calculateEstimatedDelivery(businessDays = 3) {
  const d = new Date();
  let count = 0;
  while (count < businessDays) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
  }
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

router.post('/', authenticate, (req, res) => {
  try {
    const { items, shipping, couponCode } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty. Add something before checking out.' });
    }

    if (!shipping || !shipping.name || !shipping.address || !shipping.city || !shipping.zip) {
      return res.status(400).json({ error: 'Please complete all shipping details.' });
    }

    const productStmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productStmt.get(item.productId);
      if (!product) {
        return res.status(400).json({ error: `A product in your cart is no longer available.` });
      }

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (quantity > product.stock) {
        return res
          .status(400)
          .json({ error: `Only ${product.stock} unit(s) of "${product.name}" are left in stock.` });
      }

      subtotal += product.price * quantity;
      validatedItems.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      });
    }

    subtotal = round2(subtotal);
    const normalizedCoupon = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : '';
    let discountRate = 0;
    if (normalizedCoupon === 'BUYHATKE20' || normalizedCoupon === 'MEGA20') discountRate = 0.20;
    else if (normalizedCoupon === 'SUPER50') discountRate = 0.25;
    else if (normalizedCoupon === 'SAVE15') discountRate = 0.15;
    else if (normalizedCoupon === 'SAVE10') discountRate = 0.10;
    else if (normalizedCoupon === 'WELCOME5') discountRate = 0.05;

    const discount = discountRate > 0 ? round2(subtotal * discountRate) : 0;
    const discountedSubtotal = round2(Math.max(0, subtotal - discount));
    const shippingCost = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
    const tax = round2(discountedSubtotal * TAX_RATE);
    const total = round2(discountedSubtotal + tax + shippingCost);
    const orderNumber = generateOrderNumber();
    const trackingNumber = generateTrackingNumber();
    const estimatedDelivery = calculateEstimatedDelivery(3);

    const insert = db.prepare(`
      INSERT INTO orders (
        order_number, user_id, items_json, subtotal, tax, shipping, total,
        shipping_name, shipping_address, shipping_city, shipping_zip, status
      ) VALUES (
        @order_number, @user_id, @items_json, @subtotal, @tax, @shipping, @total,
        @shipping_name, @shipping_address, @shipping_city, @shipping_zip, @status
      )
    `);

    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    const placeOrder = db.transaction(() => {
      const info = insert.run({
        order_number: orderNumber,
        user_id: req.user.id,
        items_json: JSON.stringify(validatedItems),
        subtotal: discountedSubtotal,
        tax,
        shipping: shippingCost,
        total,
        shipping_name: shipping.name,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_zip: shipping.zip,
        status: 'Processing',
      });

      for (const item of validatedItems) {
        updateStock.run(item.quantity, item.productId);
      }

      return info.lastInsertRowid;
    });

    const orderId = placeOrder();

    res.status(201).json({
      order: {
        id: orderId,
        orderNumber,
        trackingNumber,
        estimatedDelivery,
        items: validatedItems,
        subtotal,
        discount,
        couponCode: discount > 0 ? normalizedCoupon : null,
        tax,
        shipping: shippingCost,
        total,
        shippingAddress: shipping,
        status: 'Processing',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Something went wrong while placing your order. Please try again.' });
  }
});

router.get('/', authenticate, (req, res) => {
  try {
    const rows = db
      .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
      .all(req.user.id);

    const orders = rows.map((row) => {
      const idHex = (row.id * 1337).toString(16).padStart(6, '0').slice(-6).toUpperCase();
      return {
        id: row.id,
        orderNumber: row.order_number,
        trackingNumber: `CA-TRK-${idHex}`,
        items: JSON.parse(row.items_json),
        subtotal: row.subtotal,
        tax: row.tax,
        shipping: row.shipping,
        total: row.total,
        shippingAddress: {
          name: row.shipping_name,
          address: row.shipping_address,
          city: row.shipping_city,
          zip: row.shipping_zip,
        },
        status: row.status,
        createdAt: row.created_at,
      };
    });

    res.json({ orders });
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Unable to fetch your order history right now.' });
  }
});

module.exports = router;
