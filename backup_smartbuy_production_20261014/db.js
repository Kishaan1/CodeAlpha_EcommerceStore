/**
 * db.js
 * -----
 * SMARTBUY Database Engine
 * File-based SQLite database using better-sqlite3 (with node:sqlite fallback).
 * Stores products, multi-store listings, historical price snapshots,
 * price alerts, verified store coupons, customer reviews, and wishlists.
 */

const path = require('path');
const DB_PATH = path.join(__dirname, 'ecommerce.db');

let db;
try {
  const Database = require('better-sqlite3');
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (e) {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  if (!db.pragma) {
    db.pragma = (stmt) => db.exec(`PRAGMA ${stmt}`);
  }
  if (!db.transaction) {
    db.transaction = (fn) => (...args) => {
      db.exec('BEGIN');
      try {
        const result = fn(...args);
        db.exec('COMMIT');
        return result;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    };
  }
}

const SMARTBUY_PRODUCTS = [
  // ---------------- Electronics ----------------
  {
    id: 1,
    title: 'Sony WH-1000XM4 Wireless Noise-Cancelling Headphones',
    name: 'Sony WH-1000XM4 Wireless Noise-Cancelling Headphones',
    brand: 'Sony',
    category: 'Electronics',
    model_no: 'WH1000XM4/B',
    description: 'Industry-leading noise cancellation with Dual Noise Sensor technology, 30-hour battery life with quick charging, touch sensor controls, and Speak-to-Chat function.',
    base_price: 19990.00,
    price: 19990.00,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
    reviews_count: 1420,
    stock: 35,
    is_demo_data: 1,
  },
  {
    id: 2,
    title: 'Apple Watch SE (2nd Gen) GPS 44mm Smart Fitness Watch',
    name: 'Apple Watch SE (2nd Gen) GPS 44mm Smart Fitness Watch',
    brand: 'Apple',
    category: 'Electronics',
    model_no: 'MNL83HN/A',
    description: 'Retina OLED display, Crash Detection, enhanced Workout app, optical heart rate sensor, waterproof up to 50m, and seamless Apple ecosystem synchronization.',
    base_price: 24900.00,
    price: 24900.00,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    rating: 4.6,
    reviews_count: 980,
    stock: 28,
    is_demo_data: 1,
  },
  {
    id: 3,
    title: 'JBL Flip 6 Portable Waterproof Bluetooth Speaker',
    name: 'JBL Flip 6 Portable Waterproof Bluetooth Speaker',
    brand: 'JBL',
    category: 'Electronics',
    model_no: 'JBLFLIP6BLKIN',
    description: '2-way speaker system engineered for bold, crystal-clear, powerful sound with dual passive radiators, IP67 waterproof and dustproof rating, and 12 hours playtime.',
    base_price: 8999.00,
    price: 8999.00,
    image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80',
    rating: 4.5,
    reviews_count: 730,
    stock: 45,
    is_demo_data: 1,
  },
  {
    id: 4,
    title: 'GoPro HERO11 Black 5.3K 60fps Waterproof Action Camera',
    name: 'GoPro HERO11 Black 5.3K 60fps Waterproof Action Camera',
    brand: 'GoPro',
    category: 'Electronics',
    model_no: 'CHDHX-111-RW',
    description: 'Revolutionary new sensor with ultra-versatile 8:7 aspect ratio, Emmy-winning HyperSmooth 5.0 stabilization, 5.3K video capture, dual LCD screens, and 10m waterproof build.',
    base_price: 36990.00,
    price: 36990.00,
    image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
    reviews_count: 512,
    stock: 18,
    is_demo_data: 1,
  },
  // ---------------- Fashion ----------------
  {
    id: 5,
    title: "Levi's Men's Trucker Denim Jacket Standard Fit",
    name: "Levi's Men's Trucker Denim Jacket Standard Fit",
    brand: "Levi's",
    category: 'Fashion',
    model_no: '72334-0136',
    description: 'The original jean jacket since 1967. Premium 100% heavy cotton denim with point collar, button-flap chest pockets, welt hand pockets, and side hem adjusters.',
    base_price: 3499.00,
    price: 3499.00,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',
    rating: 4.4,
    reviews_count: 650,
    stock: 40,
    is_demo_data: 1,
  },
  {
    id: 6,
    title: 'Nike Air Zoom Pegasus 40 Running Shoes',
    name: 'Nike Air Zoom Pegasus 40 Running Shoes',
    brand: 'Nike',
    category: 'Fashion',
    model_no: 'DV3853-001',
    description: 'Engineered mesh upper for breathability and comfort, Dual Zoom Air units with Nike React foam for high-energy response, and iconic waffle-inspired rubber tread.',
    base_price: 7995.00,
    price: 7995.00,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    rating: 4.8,
    reviews_count: 1120,
    stock: 32,
    is_demo_data: 1,
  },
  {
    id: 7,
    title: 'Fossil Minimalist Genuine Leather Crossbody Bag',
    name: 'Fossil Minimalist Genuine Leather Crossbody Bag',
    brand: 'Fossil',
    category: 'Fashion',
    model_no: 'ZB7888200',
    description: 'Crafted from rich glazed leather with brass hardware, adjustable crossbody strap, multiple interior slip pockets, and a zippered main compartment.',
    base_price: 5495.00,
    price: 5495.00,
    image_url: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80',
    rating: 4.3,
    reviews_count: 340,
    stock: 24,
    is_demo_data: 1,
  },
  {
    id: 8,
    title: 'Ray-Ban Classic Aviator Polarized Sunglasses',
    name: 'Ray-Ban Classic Aviator Polarized Sunglasses',
    brand: 'Ray-Ban',
    category: 'Fashion',
    model_no: 'RB3025-001/58',
    description: 'Gold metal frame with crystal green G-15 polarized lenses that absorb 85% of visible light, offering 100% UV protection and exceptional clarity.',
    base_price: 9490.00,
    price: 9490.00,
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80',
    rating: 4.6,
    reviews_count: 890,
    stock: 55,
    is_demo_data: 1,
  },
  // ---------------- Home & Kitchen ----------------
  {
    id: 9,
    title: 'Hario V60 Ceramic Pour-Over Coffee Maker Set',
    name: 'Hario V60 Ceramic Pour-Over Coffee Maker Set',
    brand: 'Hario',
    category: 'Home & Kitchen',
    model_no: 'XVD-60B',
    description: 'Japanese Arita-ware ceramic cone with spiral interior ribs for optimal extraction, heatproof borosilicate glass carafe (600ml), and 40 unbleached filters.',
    base_price: 2899.00,
    price: 2899.00,
    image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
    reviews_count: 480,
    stock: 30,
    is_demo_data: 1,
  },
  {
    id: 10,
    title: 'Bath & Body Luxury Scented Soy Candle Trio',
    name: 'Bath & Body Luxury Scented Soy Candle Trio',
    brand: 'Bath & Body',
    category: 'Home & Kitchen',
    model_no: 'SC-TRIO-300',
    description: 'Hand-poured 100% natural soy wax candles in Amber & Sandalwood, Himalayan Sea Salt, and French Lavender. 45-hour clean burn per tumbler with lead-free cotton wicks.',
    base_price: 1499.00,
    price: 1499.00,
    image_url: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=900&q=80',
    image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=900&q=80',
    rating: 4.5,
    reviews_count: 620,
    stock: 60,
    is_demo_data: 1,
  },
  {
    id: 11,
    title: 'Philips Smart Wi-Fi Minimalist LED Desk Lamp',
    name: 'Philips Smart Wi-Fi Minimalist LED Desk Lamp',
    brand: 'Philips',
    category: 'Home & Kitchen',
    model_no: '9290023841',
    description: 'Touch-sensitive dimming with 4 color temperature presets (Relax, Read, Concentrate, Energize), eye-care honeycomb lens, USB charging pass-through, and Alexa support.',
    base_price: 2499.00,
    price: 2499.00,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    rating: 4.4,
    reviews_count: 410,
    stock: 38,
    is_demo_data: 1,
  },
  {
    id: 12,
    title: 'FabIndia 100% Organic Cotton Herringbone Throw Blanket',
    name: 'FabIndia 100% Organic Cotton Herringbone Throw Blanket',
    brand: 'FabIndia',
    category: 'Home & Kitchen',
    model_no: 'FI-TH-1082',
    description: 'Handcrafted premium 260 GSM breathable cotton with classic twill herringbone weave, decorative fringed hems, and azo-free dyes. Size: 130cm x 170cm.',
    base_price: 1899.00,
    price: 1899.00,
    image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews_count: 290,
    stock: 25,
    is_demo_data: 1,
  },
];

const SEED_COUPONS = [
  {
    store_name: 'Amazon.in',
    code: 'AMZFLAT500',
    discount_text: 'Flat ₹500 off on electronics & accessories',
    min_order_amount: 2999.00,
    expiry_date: '2026-12-31',
    is_verified: 1,
    verified_date: '2026-10-13',
  },
  {
    store_name: 'Flipkart',
    code: 'FKEXTRA10',
    discount_text: 'Extra 10% instant discount with Axis Bank Cards',
    min_order_amount: 1500.00,
    expiry_date: '2026-11-30',
    is_verified: 1,
    verified_date: '2026-10-13',
  },
  {
    store_name: 'Croma',
    code: 'CROMAHDFC',
    discount_text: 'Flat ₹1,500 off on HDFC Bank Credit & Debit Cards',
    min_order_amount: 10000.00,
    expiry_date: '2026-12-15',
    is_verified: 1,
    verified_date: '2026-10-12',
  },
  {
    store_name: 'Reliance Digital',
    code: 'REL500',
    discount_text: 'Flat ₹500 instant cashback on orders above ₹4,000',
    min_order_amount: 4000.00,
    expiry_date: '2026-11-15',
    is_verified: 1,
    verified_date: '2026-10-11',
  },
  {
    store_name: 'Myntra',
    code: 'MYNTRA20',
    discount_text: 'Extra 20% off on premium fashion brands',
    min_order_amount: 1999.00,
    expiry_date: '2026-10-31',
    is_verified: 1,
    verified_date: '2026-10-13',
  },
  {
    store_name: 'SMARTBUY Exclusive',
    code: 'BUYHATKE20',
    discount_text: 'Exclusive 20% off verified partner discounts',
    min_order_amount: 500.00,
    expiry_date: '2026-12-31',
    is_verified: 1,
    verified_date: '2026-10-13',
  },
  {
    store_name: 'SMARTBUY Welcome',
    code: 'WELCOME10',
    discount_text: 'Flat 10% off for first-time shoppers',
    min_order_amount: 499.00,
    expiry_date: '2026-12-31',
    is_verified: 1,
    verified_date: '2026-10-13',
  },
  {
    store_name: 'Flash Sale',
    code: 'SUPER50',
    discount_text: 'Flat 50% discount on select clearance items',
    min_order_amount: 1000.00,
    expiry_date: '2026-10-25',
    is_verified: 1,
    verified_date: '2026-10-10',
  },
];

const RETAILER_CONFIGS = [
  {
    store_name: 'Amazon.in',
    multiplier: 0.94,
    delivery_charge: 0,
    delivery_time: '⚡ Prime Next-Day Free',
    url_base: 'https://www.amazon.in/dp/',
    bank_offer: 'Flat ₹1,500 off on HDFC Cards',
    seller_rating: 4.8,
  },
  {
    store_name: 'Flipkart',
    multiplier: 0.97,
    delivery_charge: 40,
    delivery_time: '⚡ 1-2 Days • SuperCoins',
    url_base: 'https://www.flipkart.com/item/',
    bank_offer: '10% Cashback on Axis Bank Cards',
    seller_rating: 4.6,
  },
  {
    store_name: 'Croma',
    multiplier: 1.02,
    delivery_charge: 0,
    delivery_time: 'Express Delivery • Free Setup',
    url_base: 'https://www.croma.com/p/',
    bank_offer: 'Flat ₹1,000 off on ICICI Cards',
    seller_rating: 4.5,
  },
  {
    store_name: 'Reliance Digital',
    multiplier: 1.06,
    delivery_charge: 49,
    delivery_time: 'Instant Delivery in 3 hrs',
    url_base: 'https://www.reliancedigital.in/p/',
    bank_offer: '₹2,000 Cashback on SBI Cards',
    seller_rating: 4.4,
  },
  {
    store_name: 'Myntra',
    multiplier: 1.08,
    delivery_charge: 99,
    delivery_time: 'Standard 2-4 Days',
    url_base: 'https://www.myntra.com/',
    bank_offer: 'Extra 10% off with Kotak Cards',
    seller_rating: 4.3,
  },
];

function initDatabase() {
  // Create all SMARTBUY tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      model_no TEXT NOT NULL,
      image_url TEXT NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      base_price REAL NOT NULL,
      price REAL NOT NULL,
      rating REAL NOT NULL DEFAULT 4.6,
      reviews_count INTEGER NOT NULL DEFAULT 850,
      stock INTEGER NOT NULL DEFAULT 25,
      is_demo_data INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS store_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      store_name TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL NOT NULL,
      delivery_charge REAL NOT NULL DEFAULT 0,
      availability_status TEXT NOT NULL DEFAULT 'In Stock',
      store_url TEXT NOT NULL,
      bank_offer TEXT,
      last_checked_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS price_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      price REAL NOT NULL,
      timestamp TEXT NOT NULL,
      store_name TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS price_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_email TEXT NOT NULL,
      email TEXT,
      target_price REAL NOT NULL,
      current_price REAL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT NOT NULL,
      code TEXT NOT NULL,
      discount_text TEXT NOT NULL,
      min_order_amount REAL NOT NULL,
      expiry_date TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 1,
      verified_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      added_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS store_comparisons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      store_name TEXT NOT NULL,
      current_price REAL NOT NULL,
      original_price REAL NOT NULL,
      delivery_time TEXT NOT NULL,
      store_url TEXT NOT NULL,
      seller_rating REAL NOT NULL DEFAULT 4.5,
      bank_offer TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS store_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      store_name TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL NOT NULL,
      delivery_info TEXT NOT NULL,
      store_url TEXT NOT NULL,
      in_stock INTEGER DEFAULT 1,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      date TEXT,
      price REAL NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      author TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      shipping REAL NOT NULL,
      total REAL NOT NULL,
      shipping_name TEXT,
      shipping_address TEXT,
      shipping_city TEXT,
      shipping_zip TEXT,
      status TEXT NOT NULL DEFAULT 'Processing',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Migration helper for existing products table
  try {
    const cols = db.prepare('PRAGMA table_info(products)').all().map((c) => c.name);
    if (!cols.includes('title')) db.exec('ALTER TABLE products ADD COLUMN title TEXT;');
    if (!cols.includes('brand')) db.exec('ALTER TABLE products ADD COLUMN brand TEXT;');
    if (!cols.includes('model_no')) db.exec('ALTER TABLE products ADD COLUMN model_no TEXT;');
    if (!cols.includes('image_url')) db.exec('ALTER TABLE products ADD COLUMN image_url TEXT;');
    if (!cols.includes('base_price')) db.exec('ALTER TABLE products ADD COLUMN base_price REAL;');
    if (!cols.includes('is_demo_data')) db.exec('ALTER TABLE products ADD COLUMN is_demo_data INTEGER DEFAULT 1;');
    if (!cols.includes('created_at')) db.exec("ALTER TABLE products ADD COLUMN created_at TEXT DEFAULT (datetime('now'));");
  } catch (_) {}

  // Migration helper for price_alerts table
  try {
    const alertCols = db.prepare('PRAGMA table_info(price_alerts)').all().map((c) => c.name);
    if (!alertCols.includes('user_email')) db.exec('ALTER TABLE price_alerts ADD COLUMN user_email TEXT;');
    if (!alertCols.includes('current_price')) db.exec('ALTER TABLE price_alerts ADD COLUMN current_price REAL;');
    if (!alertCols.includes('status')) db.exec("ALTER TABLE price_alerts ADD COLUMN status TEXT DEFAULT 'active';");
  } catch (_) {}

  // 1. Populate / Seed Products
  const { count: prodCount } = db.prepare('SELECT COUNT(*) AS count FROM products').get();
  if (prodCount === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (id, title, name, brand, category, model_no, image_url, image, description, base_price, price, rating, reviews_count, stock, is_demo_data, created_at)
      VALUES (@id, @title, @name, @brand, @category, @model_no, @image_url, @image, @description, @base_price, @price, @rating, @reviews_count, @stock, @is_demo_data, datetime('now'))
    `);
    const insertAll = db.transaction((items) => {
      for (const item of items) insertProduct.run(item);
    });
    insertAll(SMARTBUY_PRODUCTS);
    console.log(`✅ Seeded ${SMARTBUY_PRODUCTS.length} SMARTBUY products into ecommerce.db`);
  } else {
    // Update existing rows to ensure title, brand, model_no, base_price are populated
    const updateProduct = db.prepare(`
      UPDATE products
      SET title = COALESCE(title, name),
          brand = COALESCE(brand, ?),
          model_no = COALESCE(model_no, ?),
          image_url = COALESCE(image_url, image),
          base_price = COALESCE(base_price, price),
          is_demo_data = 1
      WHERE id = ?
    `);
    for (const p of SMARTBUY_PRODUCTS) {
      updateProduct.run(p.brand, p.model_no, p.id);
    }
  }

  // 2. Populate / Seed store_listings and store_comparisons
  const { count: listingCount } = db.prepare('SELECT COUNT(*) AS count FROM store_listings').get();
  if (listingCount === 0) {
    db.prepare('DELETE FROM store_comparisons').run();
    db.prepare('DELETE FROM store_prices').run();

    const insertListing = db.prepare(`
      INSERT INTO store_listings (product_id, store_name, price, original_price, delivery_charge, availability_status, store_url, bank_offer, last_checked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const insertComp = db.prepare(`
      INSERT INTO store_comparisons (product_id, store_name, current_price, original_price, delivery_time, store_url, seller_rating, bank_offer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertStorePrice = db.prepare(`
      INSERT INTO store_prices (product_id, store_name, price, original_price, delivery_info, store_url, in_stock)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    const allProds = db.prepare('SELECT id, name, price FROM products').all();
    for (const p of allProds) {
      const lowestIndex = (p.id - 1) % 3; // Rotate lowest store between Amazon, Flipkart, Croma
      const storeCountToUse = p.category === 'Fashion' ? 5 : 4;

      for (let i = 0; i < storeCountToUse; i++) {
        const store = RETAILER_CONFIGS[i];
        let multiplier = store.multiplier;

        if (i === lowestIndex) {
          multiplier = 0.92; // Guaranteed lowest offer
        } else if (i === (lowestIndex + 1) % storeCountToUse) {
          multiplier = 0.98;
        } else if (i === (lowestIndex + 2) % storeCountToUse) {
          multiplier = 1.05;
        } else {
          multiplier = 1.10;
        }

        const currentPrice = Math.round(p.price * multiplier * 100) / 100;
        const originalPrice = Math.round(p.price * 1.35 * 100) / 100;
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const storeUrl = `${store.url_base}${slug}-${p.id}`;

        insertListing.run(
          p.id,
          store.store_name,
          currentPrice,
          originalPrice,
          store.delivery_charge,
          'In Stock',
          storeUrl,
          store.bank_offer
        );

        insertComp.run(
          p.id,
          store.store_name.replace('.in', ''),
          currentPrice,
          originalPrice,
          store.delivery_time,
          storeUrl,
          store.seller_rating,
          store.bank_offer
        );

        insertStorePrice.run(
          p.id,
          store.store_name.replace('.in', ''),
          currentPrice,
          originalPrice,
          store.delivery_time,
          storeUrl
        );
      }
    }
    console.log('✅ Seeded store_listings, store_comparisons, and store_prices');
  }

  // 3. Populate / Seed price_snapshots (at least 10–12 realistic data points spanning 7D, 30D, 90D, 180D)
  const { count: snapshotCount } = db.prepare('SELECT COUNT(*) AS count FROM price_snapshots').get();
  if (snapshotCount === 0) {
    db.prepare('DELETE FROM price_history').run();

    const insertSnapshot = db.prepare(`
      INSERT INTO price_snapshots (product_id, price, timestamp, store_name)
      VALUES (?, ?, datetime('now', ?), ?)
    `);

    const insertHistory = db.prepare(`
      INSERT INTO price_history (product_id, date, price, recorded_at)
      VALUES (?, ?, ?, datetime('now', ?))
    `);

    // 12 authentic price snapshots simulating pre-sale inflation and genuine festive drops
    const SNAPSHOT_TIMELINE = [
      { daysOffset: -180, multiplier: 1.25, label: '180 days ago', store: 'Amazon.in' },
      { daysOffset: -150, multiplier: 1.18, label: '150 days ago', store: 'Flipkart' },
      { daysOffset: -120, multiplier: 1.14, label: '120 days ago', store: 'Croma' },
      { daysOffset: -90,  multiplier: 1.15, label: '90 days ago',  store: 'Amazon.in' },
      { daysOffset: -70,  multiplier: 1.28, label: '70 days ago',  store: 'Flipkart' }, // Pre-sale price hike
      { daysOffset: -50,  multiplier: 1.08, label: '50 days ago',  store: 'Amazon.in' },
      { daysOffset: -35,  multiplier: 0.88, label: '35 days ago',  store: 'Amazon.in' }, // All-Time Low Festive Sale
      { daysOffset: -21,  multiplier: 1.02, label: '21 days ago',  store: 'Croma' },
      { daysOffset: -14,  multiplier: 1.05, label: '14 days ago',  store: 'Reliance Digital' },
      { daysOffset: -7,   multiplier: 0.96, label: '7 days ago',   store: 'Amazon.in' },
      { daysOffset: -3,   multiplier: 1.02, label: '3 days ago',   store: 'Flipkart' },
      { daysOffset: 0,    multiplier: 1.00, label: 'Today',        store: 'Amazon.in' }, // Current base price
    ];

    const allProds = db.prepare('SELECT id, price FROM products').all();
    for (const p of allProds) {
      for (const pt of SNAPSHOT_TIMELINE) {
        const variance = ((p.id % 5) - 2) * 0.015;
        const adjustedMultiplier = pt.daysOffset === 0 ? 1.00 : Math.max(0.82, pt.multiplier + variance);
        const recordedPrice = Math.round(p.price * adjustedMultiplier * 100) / 100;

        insertSnapshot.run(p.id, recordedPrice, `${pt.daysOffset} days`, pt.store);

        // Also seed price_history for backward compatibility
        insertHistory.run(p.id, pt.label, recordedPrice, `${pt.daysOffset} days`);
      }
    }
    console.log('✅ Seeded 12-point time-series price_snapshots & price_history');
  }

  // 4. Populate / Seed verified store coupons
  const { count: couponCount } = db.prepare('SELECT COUNT(*) AS count FROM coupons').get();
  if (couponCount === 0) {
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (store_name, code, discount_text, min_order_amount, expiry_date, is_verified, verified_date)
      VALUES (@store_name, @code, @discount_text, @min_order_amount, @expiry_date, @is_verified, @verified_date)
    `);
    const insertAllCoupons = db.transaction((coupons) => {
      for (const c of coupons) insertCoupon.run(c);
    });
    insertAllCoupons(SEED_COUPONS);
    console.log(`✅ Seeded ${SEED_COUPONS.length} verified coupons into ecommerce.db`);
  }

  // 5. Populate / Seed initial Wishlist items
  const { count: wishCount } = db.prepare('SELECT COUNT(*) AS count FROM wishlist').get();
  if (wishCount === 0) {
    const insertWish = db.prepare(`
      INSERT INTO wishlist (user_email, product_id)
      VALUES (?, ?)
    `);
    insertWish.run('shopper@smartbuy.in', 1);
    insertWish.run('shopper@smartbuy.in', 2);
    insertWish.run('shopper@smartbuy.in', 6);
    console.log('✅ Seeded demo wishlist items into ecommerce.db');
  }

  // 6. Populate / Seed Reviews
  const { count: reviewCount } = db.prepare('SELECT COUNT(*) AS count FROM reviews').get();
  if (reviewCount === 0) {
    const SAMPLE_REVIEWS = [
      {
        rating: 5,
        author: 'Aarav Sharma (Bengaluru)',
        comment: 'SmartBuy saved me ₹3,490 on this purchase! Tracked the price drop from ₹24,999 to ₹19,990 and bought on Amazon right on time.',
      },
      {
        rating: 5,
        author: 'Priya Iyer (Mumbai)',
        comment: 'The 90-day price trend chart is super accurate. Detected the pre-festive price hike and notified me when the real discount happened.',
      },
      {
        rating: 4,
        author: 'Rohan Verma (Delhi NCR)',
        comment: 'Excellent multi-store comparison. Was about to buy on Croma but found it ₹1,200 cheaper on Flipkart with next-day delivery.',
      },
      {
        rating: 5,
        author: 'Ananya Deshmukh (Pune)',
        comment: 'Auto-apply coupon engine worked flawlessly at checkout. Definitely bookmarking SMARTBUY for all future gadget purchases.',
      },
    ];

    const insertReview = db.prepare(`
      INSERT INTO reviews (product_id, author, rating, comment, created_at)
      VALUES (@product_id, @author, @rating, @comment, datetime('now', @offset))
    `);

    const allProducts = db.prepare('SELECT id FROM products').all();
    for (const p of allProducts) {
      SAMPLE_REVIEWS.forEach((rev, idx) => {
        insertReview.run({
          product_id: p.id,
          author: rev.author,
          rating: rev.rating,
          comment: rev.comment,
          offset: `-${(idx + 1) * 3} days`,
        });
      });
    }
    console.log('✅ Seeded customer reviews into ecommerce.db');
  }
}

module.exports = { db, initDatabase };
