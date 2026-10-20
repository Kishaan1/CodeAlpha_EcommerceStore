/**
 * routes/products.js
 * ------------------
 * SMARTBUY Product & Comparison API
 * GET /api/products             -> list products (supports ?search=&category=&sort=&max_price=&store=)
 * GET /api/products/categories  -> list distinct categories
 * GET /api/products/:id         -> product details + aggregated best price + historical low/high/avg
 * GET /api/products/:id/compare -> side-by-side store breakdown with savings relative to cheapest offer
 * GET /api/products/:id/history -> time-series price snapshots (?range=7d|30d|90d|180d|1y)
 */

const express = require('express');
const { db } = require('../db');

const router = express.Router();

const SORT_COLUMNS = {
  price_asc: 'p.price ASC',
  price_desc: 'p.price DESC',
  rating_desc: 'p.rating DESC',
  rating: 'p.rating DESC',
  name_asc: 'p.name ASC',
  name_desc: 'p.name DESC',
  discount: 'max_discount_pct DESC',
};

// GET /api/products/categories
router.get('/categories', (req, res) => {
  try {
    const rows = db
      .prepare('SELECT DISTINCT category FROM products ORDER BY category ASC')
      .all();
    res.json({ categories: rows.map((r) => r.category) });
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ error: 'Unable to fetch categories right now.' });
  }
});

// GET /api/products
router.get('/', (req, res) => {
  try {
    const { search = '', category = 'All', sort = '', max_price = '', store = '' } = req.query;

    let query = `
      SELECT p.*,
        COALESCE((SELECT COUNT(*) FROM store_listings sl WHERE sl.product_id = p.id), 4) AS store_count,
        COALESCE((SELECT MIN(price) FROM store_listings sl WHERE sl.product_id = p.id), p.price) AS min_store_price,
        COALESCE((SELECT sl.store_name FROM store_listings sl WHERE sl.product_id = p.id ORDER BY sl.price ASC LIMIT 1), 'Amazon.in') AS min_store_name,
        COALESCE((SELECT MAX(ROUND(((original_price - price) / original_price) * 100)) FROM store_listings sl WHERE sl.product_id = p.id), 28) AS max_discount_pct,
        COALESCE((SELECT MIN(price) FROM price_snapshots ps WHERE ps.product_id = p.id), p.price) AS min_history_price,
        COALESCE((SELECT MAX(price) FROM price_snapshots ps WHERE ps.product_id = p.id), p.price * 1.25) AS max_history_price,
        COALESCE((SELECT AVG(price) FROM price_snapshots ps WHERE ps.product_id = p.id), p.price) AS avg_history_price
      FROM products p
      WHERE 1 = 1
    `;
    const params = [];

    const term = String(search).trim().toLowerCase();
    if (term) {
      query += ' AND (LOWER(p.name) LIKE ? OR LOWER(p.title) LIKE ? OR LOWER(p.brand) LIKE ? OR LOWER(p.model_no) LIKE ? OR LOWER(p.description) LIKE ?)';
      params.push(`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`);
    }

    if (category && category !== 'All' && category !== 'all') {
      const catNorm = category.trim().toLowerCase();
      if (catNorm === 'electronics' || catNorm === 'audio') {
        query += " AND (LOWER(p.category) = 'electronics' OR LOWER(p.name) LIKE '%headphone%' OR LOWER(p.name) LIKE '%speaker%' OR LOWER(p.name) LIKE '%watch%' OR LOWER(p.name) LIKE '%camera%')";
      } else if (catNorm === 'fashion') {
        query += " AND (LOWER(p.category) = 'fashion' OR LOWER(p.name) LIKE '%jacket%' OR LOWER(p.name) LIKE '%shoes%' OR LOWER(p.name) LIKE '%bag%' OR LOWER(p.name) LIKE '%sunglasses%')";
      } else if (catNorm === 'home & kitchen' || catNorm === 'home' || catNorm === 'kitchen') {
        query += " AND (LOWER(p.category) = 'home & kitchen' OR LOWER(p.category) = 'home' OR LOWER(p.name) LIKE '%lamp%' OR LOWER(p.name) LIKE '%candle%' OR LOWER(p.name) LIKE '%coffee%' OR LOWER(p.name) LIKE '%blanket%')";
      } else if (catNorm === 'appliances') {
        query += " AND (LOWER(p.category) = 'appliances' OR LOWER(p.category) = 'home & kitchen' OR LOWER(p.name) LIKE '%lamp%' OR LOWER(p.name) LIKE '%coffee%')";
      } else if (catNorm === 'flash deals' || catNorm === 'deals') {
        // Return products with major discounts
        query += " AND p.price < 10000";
      } else {
        query += ' AND (p.category = ? OR LOWER(p.category) = ?)';
        params.push(category, catNorm);
      }
    }

    if (max_price && !isNaN(parseFloat(max_price))) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(max_price));
    }

    if (store && store !== 'All' && store !== 'all') {
      query += ' AND EXISTS (SELECT 1 FROM store_listings sl WHERE sl.product_id = p.id AND LOWER(sl.store_name) LIKE ?)';
      params.push(`%${store.trim().toLowerCase()}%`);
    }

    query += ` ORDER BY ${SORT_COLUMNS[sort] || 'p.id ASC'}`;

    const storeListingStmt = db.prepare(`
      SELECT store_name, price AS current_price, original_price, delivery_charge, availability_status, store_url, bank_offer
      FROM store_listings
      WHERE product_id = ?
      ORDER BY price ASC
    `);

    const rawProducts = db.prepare(query).all(...params);
    const products = rawProducts.map((p) => {
      let stores = storeListingStmt.all(p.id);
      if (!stores || stores.length === 0) {
        stores = db.prepare(`
          SELECT store_name, current_price, original_price, delivery_time, store_url, bank_offer
          FROM store_comparisons
          WHERE product_id = ?
          ORDER BY current_price ASC
        `).all(p.id);
      }

      const lowestStorePrice = stores.length > 0 ? stores[0].current_price : p.price;
      const highestStorePrice = stores.length > 0 ? Math.max(...stores.map((s) => s.current_price)) : p.price;
      const savings = Math.max(0, Math.round((highestStorePrice - lowestStorePrice) * 100) / 100);

      return {
        ...p,
        title: p.title || p.name,
        brand: p.brand || 'SMARTBUY Select',
        model_no: p.model_no || `SB-${p.id}`,
        image_url: p.image_url || p.image,
        stores,
        lowest_price: lowestStorePrice,
        lowest_store: stores.length > 0 ? stores[0].store_name : 'Amazon.in',
        savings,
        isAllTimeLow: Boolean(lowestStorePrice <= p.min_history_price * 1.03),
        isBestPrice: Boolean(lowestStorePrice <= p.min_history_price * 1.05 || lowestStorePrice < p.avg_history_price),
        dealBadge: (lowestStorePrice <= p.min_history_price * 1.05)
          ? '🔥 Great Deal'
          : (lowestStorePrice > p.avg_history_price ? '⏳ Wait for a Drop' : '⚖️ Fair Price'),
      };
    });

    res.json({ products, count: products.length });
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Unable to fetch products right now.' });
  }
});

// GET /api/products/:id - Product details + aggregated best price + historical low/high/avg
router.get('/:id', (req, res) => {
  try {
    const productId = req.params.id;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const storeListings = db.prepare(`
      SELECT id, store_name, price, original_price, delivery_charge, availability_status, store_url, bank_offer
      FROM store_listings
      WHERE product_id = ?
      ORDER BY price ASC
    `).all(productId);

    // Also get store_prices for backward compatibility
    const storePrices = db.prepare('SELECT * FROM store_prices WHERE product_id = ? ORDER BY price ASC').all(productId);

    // Aggregate statistics from price_snapshots
    const historyStats = db.prepare(`
      SELECT MIN(price) AS historical_low,
             MAX(price) AS historical_high,
             AVG(price) AS historical_avg
      FROM price_snapshots
      WHERE product_id = ?
    `).get(productId);

    const lowestStore = storeListings[0] || { store_name: 'Amazon.in', price: product.price };
    const highestStore = storeListings[storeListings.length - 1] || lowestStore;
    const savings = Math.max(0, Math.round((highestStore.price - lowestStore.price) * 100) / 100);

    const histLow = historyStats ? historyStats.historical_low : product.price;
    const histHigh = historyStats ? historyStats.historical_high : product.price * 1.25;
    const histAvg = historyStats ? Math.round(historyStats.historical_avg * 100) / 100 : product.price;

    let dealVerdict = '⚖️ Fair Price';
    if (lowestStore.price <= histLow * 1.05) {
      dealVerdict = '🔥 Great Deal';
    } else if (lowestStore.price > histAvg) {
      dealVerdict = '⏳ Wait for a Drop';
    }

    res.json({
      product: {
        ...product,
        title: product.title || product.name,
        brand: product.brand || 'SMARTBUY Select',
        model_no: product.model_no || `SB-${product.id}`,
        image_url: product.image_url || product.image,
        base_price: product.base_price || product.price,
      },
      stores: storeListings,
      storeListings,
      storePrices,
      bestPrice: lowestStore.price,
      lowestStore: lowestStore.store_name,
      highestStore: highestStore.store_name,
      savings,
      historical_low: histLow,
      historical_high: histHigh,
      historical_avg: histAvg,
      dealVerdict,
    });
  } catch (err) {
    console.error('Fetch product error:', err);
    res.status(500).json({ error: 'Unable to fetch this product right now.' });
  }
});

// GET /api/products/:id/compare - Side-by-side store breakdown with savings calculation
router.get('/:id/compare', (req, res) => {
  try {
    const productId = req.params.id;
    const product = db.prepare('SELECT id, name, title, price, brand, image_url, image FROM products WHERE id = ?').get(productId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    let rows = db.prepare(`
      SELECT id, store_name, price AS current_price, original_price, delivery_charge, availability_status, store_url, bank_offer
      FROM store_listings
      WHERE product_id = ?
      ORDER BY price ASC
    `).all(productId);

    if (rows.length === 0) {
      rows = db.prepare(`
        SELECT id, store_name, current_price, original_price, delivery_time, store_url, seller_rating, bank_offer
        FROM store_comparisons
        WHERE product_id = ?
        ORDER BY current_price ASC
      `).all(productId);
    }

    const minPrice = rows.length > 0 ? rows[0].current_price : product.price;
    const maxPrice = rows.length > 0 ? Math.max(...rows.map((r) => r.current_price)) : product.price;
    const cheapestStore = rows[0] || { store_name: 'Amazon.in', current_price: product.price };
    const savings = Math.round((maxPrice - minPrice) * 100) / 100;
    const savingsPercent = maxPrice > 0 ? Math.round(((maxPrice - minPrice) / maxPrice) * 100) : 0;

    const stores = rows.map((r, idx) => ({
      id: r.id,
      store_name: r.store_name,
      current_price: r.current_price,
      price: r.current_price,
      original_price: r.original_price,
      discount_percent: r.original_price > 0 ? Math.round(((r.original_price - r.current_price) / r.original_price) * 100) : 0,
      delivery_charge: r.delivery_charge || 0,
      delivery_time: r.delivery_time || (r.delivery_charge === 0 ? '⚡ Free Delivery' : `₹${r.delivery_charge} Delivery`),
      availability_status: r.availability_status || 'In Stock',
      store_url: r.store_url || '#',
      seller_rating: r.seller_rating || (4.5 + (idx === 0 ? 0.3 : 0)),
      bank_offer: r.bank_offer || 'Instant Bank Discount Available',
      isLowest: idx === 0,
      savingsVsCheapest: Math.round((r.current_price - minPrice) * 100) / 100,
    }));

    const callout = savings > 0
      ? `💡 Buy on ${cheapestStore.store_name} and save ₹${savings.toLocaleString('en-IN')} (${savingsPercent}%) compared to other sellers.`
      : `💡 Best retail deal found on ${cheapestStore.store_name}.`;

    res.json({
      productId: Number(productId),
      productName: product.title || product.name,
      catalogPrice: product.price,
      lowestPrice: minPrice,
      maxPrice,
      savings,
      savingsPercent,
      cheapestStore: cheapestStore.store_name,
      summaryCallout: callout,
      callout,
      storeCount: stores.length,
      stores,
      storePrices: stores,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Fetch store comparison error:', err);
    res.status(500).json({ error: 'Unable to fetch store comparison.' });
  }
});

// GET /api/products/:id/history - Time-series price snapshots (?range=7d|30d|90d|180d|1y)
router.get('/:id/history', (req, res) => {
  try {
    const productId = req.params.id;
    const { range = '90d' } = req.query;
    const rangeClean = String(range).toLowerCase();

    const product = db.prepare('SELECT id, name, title, price FROM products WHERE id = ?').get(productId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    // Determine day filter limit based on range
    let dayLimit = 90;
    if (rangeClean === '7d') dayLimit = 7;
    else if (rangeClean === '30d' || rangeClean === '1m') dayLimit = 30;
    else if (rangeClean === '90d' || rangeClean === '3m') dayLimit = 90;
    else if (rangeClean === '180d' || rangeClean === '6m') dayLimit = 180;
    else if (rangeClean === '1y' || rangeClean === 'all') dayLimit = 365;

    let rows = db.prepare(`
      SELECT id, price, timestamp, store_name
      FROM price_snapshots
      WHERE product_id = ?
        AND timestamp >= datetime('now', ?)
      ORDER BY timestamp ASC
    `).all(productId, `-${dayLimit} days`);

    if (rows.length === 0) {
      rows = db.prepare(`
        SELECT id, price, timestamp, store_name
        FROM price_snapshots
        WHERE product_id = ?
        ORDER BY timestamp ASC
      `).all(productId);
    }

    const history = rows.map((r) => {
      const d = new Date(r.timestamp);
      const dateLabel = isNaN(d.getTime()) ? r.timestamp : d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      return {
        id: r.id,
        date: dateLabel,
        price: r.price,
        store: r.store_name,
        timestamp: r.timestamp,
      };
    });

    const prices = history.map((h) => h.price);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const currentPrice = product.price;
    const averagePrice = Math.round((prices.reduce((s, p) => s + p, 0) / prices.length) * 100) / 100;
    const savingsVsAverage = Math.round((averagePrice - currentPrice) * 100) / 100;
    const isGreatDeal = currentPrice <= lowestPrice * 1.05;

    let verdictType = 'fair';
    let verdictTitle = '⚖️ Fair Price — Buy If Urgently Needed';
    let verdictRecommendation = 'Current price is within standard 90-day seasonal fluctuations.';

    if (isGreatDeal) {
      verdictType = 'best';
      verdictTitle = '🔥 Great Deal — Best Time to Buy';
      verdictRecommendation = `Current price (₹${currentPrice.toLocaleString('en-IN')}) is near the all-time low (₹${lowestPrice.toLocaleString('en-IN')}). High chance of price rebounding soon.`;
    } else if (currentPrice > averagePrice) {
      verdictType = 'wait';
      verdictTitle = '⏳ Wait for Upcoming Festive Sale';
      verdictRecommendation = `Current price is ₹${(currentPrice - averagePrice).toLocaleString('en-IN')} higher than the historical average. We recommend setting a price alert.`;
    }

    res.json({
      productId: Number(productId),
      productName: product.title || product.name,
      range: rangeClean,
      currentPrice,
      lowestPrice,
      highestPrice,
      averagePrice,
      savingsVsAverage,
      isGreatDeal,
      verdict: {
        type: verdictType,
        title: verdictTitle,
        headline: verdictTitle,
        advice: verdictRecommendation,
        status: verdictType === 'best' ? 'great_deal' : verdictType,
        recommendation: verdictRecommendation,
        text: verdictTitle,
      },
      history,
      stats: {
        currentPrice,
        lowestPrice,
        highestPrice,
        averagePrice,
        savingsVsAverage,
        isGreatDeal,
      },
    });
  } catch (err) {
    console.error('Fetch price history error:', err);
    res.status(500).json({ error: 'Unable to fetch price history.' });
  }
});

// GET /api/products/:id/reviews
router.get('/:id/reviews', (req, res) => {
  try {
    const productId = req.params.id;
    const reviews = db
      .prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC, id DESC')
      .all(productId);

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    for (const r of reviews) {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
      sum += r.rating;
    }
    const total = reviews.length;
    const avg = total > 0 ? Math.round((sum / total) * 10) / 10 : 4.6;

    res.json({
      reviews,
      stats: {
        averageRating: avg,
        totalReviews: total,
        ratingCounts: counts,
      },
    });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ error: 'Unable to fetch reviews.' });
  }
});

module.exports = router;
