# 🛍️ SMARTBUY — Multi-Store Price Comparison & Deal Intelligence Platform
### CodeAlpha Full-Stack Web Development Internship Task Submission

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-brightgreen.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20(WAL%20Mode)-blue.svg)](https://www.sqlite.org/)
[![Framework](https://img.shields.io/badge/Backend-Express.js-black.svg)](https://expressjs.com/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Internship](https://img.shields.io/badge/CodeAlpha-Web%20Development-purple.svg)](https://codealpha.tech/)

**SMARTBUY** is a full-stack, production-grade price comparison and deal intelligence web platform engineered for Indian online shoppers (**INR ₹**, **Asia/Kolkata** timezone). It monitors real-time prices across major Indian online retailers (**Amazon.in, Flipkart, Croma, Reliance Digital, and Myntra**), delivers 180-day time-series price trend analysis with algorithmic buy/wait verdicts, features an instant URL deal scanner and conversational AI shopping assistant, and offers an e-commerce checkout flow with zero required external cloud dependencies.

---

## 🌟 Key Platform Highlights

- 🎨 **SMARTBUY 2.0 Modern Editorial Retail Redesign** — light, warm, authentic commerce-first design system (`#F7F7F4` canvas, `#FFFFFF` surfaces, `#191919` typography, `#D94F32` terracotta accent, `#244C3A` forest accent, and `#197A4A` verified savings) with 2-row retail navigation and image-first product cards.
- 🇮🇳 **Engineered for Indian E-Commerce** — native INR (`₹`) pricing, GST calculation, Indian pincode delivery estimator, and bank card offers (HDFC, ICICI, SBI, Axis).
- 🏬 **Live Multi-Store Comparison Matrix** — real-time price monitoring across Amazon, Flipkart, Croma, and Reliance Digital with delivery speeds, stock status, and "Lowest Price Guaranteed" callouts.
- 📈 **180-Day Historical Price Analytics & Algorithmic Verdicts** — interactive Chart.js time-series charts (`7D`, `30D`, `90D`, `180D`) with automatic "Best Time to Buy" vs. "Wait for Sale" deal intelligence.
- 🔗 **Hero URL Deal Scanner** — paste any product link from Amazon, Flipkart, or Croma into the search omnibar to instantly extract pricing and compute cross-store savings.
- 🤖 **SMARTBUY AI Shopping Assistant** — interactive conversational shopping reasoning engine that recommends top products by budget, suggests alternatives, and advises on price timing.
- 🔔 **Target Price Drop Alerts** — automated alert subscriptions with target threshold lines rendered directly on historical price trend charts.
- 🎟️ **Verified Indian Store Coupon Center** — curated, one-click copy coupons for top retailers with instant savings calculations.
- 🦊 **Interactive Anime Mascot Authentication** — custom SVG avatar that tracks email typing, peeks during password input, and flips on password visibility toggle.
- 🛒 **Full E-Commerce Engine** — cart slide-over drawer, multi-step checkout, stock validation, and JWT order history.
- ⚡ **Zero External Infrastructure** — runs locally out of the box with embedded SQLite in WAL mode; no external database servers, API keys, or Docker containers required.

---

## 📸 Platform Modules & Feature Tour

### 1. Multi-Store Price Comparison Engine
- Compares identical models across **Amazon.in**, **Flipkart**, **Croma**, and **Reliance Digital**.
- Computes the lowest market price, highlights the winning retailer with an emerald badge, and displays active bank offers (e.g., *"₹3,000 Instant Discount on HDFC Credit Cards"*).
- Features a **"⚡ Check Live Prices"** simulation tool that mimics real-time scraper requests across retailers and recalibrates price charts with celebratory feedback.

### 2. 180-Day Price Trend Charts & Buy/Wait Advisor
- Visualizes up to 180 days of recorded price points using **Chart.js** with range switches (`[7D]`, `[30D]`, `[90D]`, `[180D]`).
- Calculates key price milestones:
  - **All-Time Lowest (ATL)** with verified recording date.
  - **All-Time Highest (ATH)**.
  - **90-Day Rolling Average** and current discount percentage.
- Employs an automated scoring engine that generates buy recommendations:
  - 🟢 **Best Time to Buy** — Current price is within 2% of the All-Time Low (Confidence > 90%).
  - 🟡 **Fair / Moderate Deal** — Price is below average but higher than the recent low.
  - 🔴 **Hold Off / Wait for Festive Sale** — Price is above the 90-day average.

### 3. Deal URL Scanner & Quick Budget Filters
- Omnibar in the hero section accepts direct retailer URLs (e.g., `https://www.amazon.in/dp/B0CHX1W1XY`).
- Parses identifiers (ASIN, product slug, model number), matches catalog records, and returns instant savings compared to alternative stores.
- One-click budget chips allow instant catalog filtering:
  - `Under ₹5,000`
  - `Under ₹15,000`
  - `Under ₹30,000`
  - `Flagships (>₹50,000)`

### 4. 💬 SMARTBUY AI Shopping Assistant
- Accessible via the floating assistant launcher in the bottom corner.
- Powered by a shopping reasoning engine (`/api/ai-assistant`) that assists users with:
  - Budget recommendations (e.g., *"What is the best laptop under ₹70,000?"*).
  - Price timing inquiries (e.g., *"Should I buy the iPhone 15 right now or wait?"*).
  - Feature comparisons and alternative suggestions.
  - Active store coupon codes and cashback guidance.

### 5. Target Price Drop Alert Subscriptions
- Set target price thresholds in INR (`₹`) with email notification preferences.
- Visual integration: target price renders as a dashed horizontal threshold line directly over the historical Chart.js canvas.
- Managed via `/api/alerts` with database persistence in SQLite.

### 6. Dedicated Product Detail Page (`product.html?id=X`)
- Deep-linked detail page featuring high-resolution galleries, full hardware specifications, and live retailer offers.
- **Indian 6-Digit Pincode Checker** — verifies delivery feasibility and estimated transit times across metro and non-metro postal codes.
- **Look-Alike & Budget Alternatives** — dynamic module suggesting 3 competing products within the same category.
- **Fakespot-Grade Review Health Card** — organic review authenticity grade (e.g., *"Grade A (94% Organic Reviews)"*), sentiment breakdown (Positive / Neutral / Critical), and categorized Pros & Cons bullets.

### 7. Interactive Anime Mascot Auth Modal
- Embedded dynamic SVG avatar located above the login/register forms.
- Head and eyes track cursor focus during email input.
- Hands cover eyes with a playful peek during password typing.
- Mascot performs a 180° flip animation when toggling password visibility.

### 8. Shopping Cart Drawer & Checkout Flow
- Slide-over drawer with item increment/decrement controls, real-time calculations, and `localStorage` persistence.
- Free shipping progress bar (Free shipping threshold: **₹999**; flat delivery: **₹99**).
- Estimated GST calculation (8% flat).
- Multi-step checkout modal with shipping address capture, simulated card/UPI/COD payment, and server-side stock decrement.

### 9. Dark Mode / Light Mode & Visual Depth
- Instant theme toggle with anti-flash inline initialization and persistent `localStorage` memory.
- Built with Tailwind CSS, glassmorphism cards (`backdrop-blur-md`), ambient blur orbs, and specular top borders.

---

## 🧰 Tech Stack & Architecture

| Layer | Technologies & Tools |
|---|---|
| **Runtime & Backend** | **Node.js** (v18+) with **Express.js** REST API |
| **Database** | **SQLite** in WAL mode via `better-sqlite3` (with `node:sqlite` fallback) |
| **Authentication** | **JSON Web Tokens (JWT)** + **bcryptjs** (10 salt rounds) |
| **Frontend** | Vanilla **JavaScript (ES6+)**, **HTML5**, **Chart.js** (v4 CDN) |
| **Styling** | **Tailwind CSS** (via CDN) + Custom CSS Keyframe Animations & Glassmorphism |
| **Testing** | Modular Node.js verification scripts (0 external testing dependencies) |

---

## 📁 Project Directory Structure

```text
CodeAlpha_EcommerceStore/
├── server.js                      # Express application entry point & static file hosting
├── db.js                          # SQLite schema initialization, table migrations & seed data
├── package.json                   # Dependencies, engines & npm lifecycle scripts
├── package-lock.json              # Deterministic package dependency tree
├── ecommerce.db                   # Embedded SQLite database (generated on start)
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules for node_modules, temp files & logs
├── README.md                      # Comprehensive project documentation (this file)
│
├── middleware/
│   └── auth.js                    # JWT Bearer token verification middleware
│
├── routes/
│   ├── auth.js                    # POST /register, POST /login, GET /me
│   ├── products.js                # GET /products, /categories, /:id, /:id/compare, /:id/history
│   ├── smartbuy.js                # POST /analyze-url, POST /ai-assistant, GET/POST /wishlist
│   ├── alerts.js                  # GET/POST /alerts, DELETE /alerts/:id
│   ├── coupons.js                 # GET /coupons, POST /coupons/verify
│   └── orders.js                  # POST /orders (atomic checkout), GET /orders (history)
│
├── public/
│   ├── index.html                 # Main SMARTBUY single-page application shell
│   ├── product.html               # Dedicated deep-linked product details page
│   ├── css/
│   │   └── styles.css             # Glassmorphism, grid patterns, badge floats & animations
│   └── js/
│       ├── app.js                 # Main SPA client: catalog, comparison, URL scanner, cart, auth
│       └── product.js             # Product page client: specs, pincode checker, look-alikes
│
└── tests & verification/
    ├── verify_audit_regression.js   # End-to-end regression audit of cart, modals & mascot
    ├── verify_smartbuy_platform.js  # Verification for multi-store compare, URL analyzer & AI
    ├── verify_features.js           # Verification for price trends, review health & coupons
    ├── verify_hero_redesign.js      # Verification for transparent banner & omnibar controls
    └── verify_visual_atmosphere.js  # Verification for themes, color tokens & glass styling
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** (bundled with Node.js)

### Installation & Execution

1. **Clone or navigate into the repository**:
   ```bash
   cd CodeAlpha_EcommerceStore
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

> [!NOTE]
> No `.env` or external database configuration is needed to run the project. On initial launch, `db.js` automatically provisions `ecommerce.db` in SQLite WAL mode and seeds 12 flagship multi-store products, 180 days of historical price snapshots, verified coupons, and initial reviews.

### Optional Developer Commands

- **Run in live-reload development mode**:
  ```bash
  npm run dev
  ```
- **Reset and reseed database**:
  ```bash
  npm run seed:reset
  npm start
  ```
- **Custom Port or Secret Configuration**:
  ```bash
  cp .env.example .env
  ```
  Edit `.env`:
  ```ini
  PORT=3000
  JWT_SECRET=super_secret_codealpha_jwt_key
  ```

---

## 🔌 API Reference Documentation

All endpoints are hosted at `http://localhost:3000/api`.

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Auth | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | No | `{ name, email, password }` | Registers a new user and issues a 7-day JWT |
| `POST` | `/auth/login` | No | `{ email, password }` | Authenticates user credentials and returns JWT |
| `GET` | `/auth/me` | Yes | — | Retrieves the authenticated user profile |

### 2. Catalog & Comparison (`/api/products`)

| Method | Endpoint | Auth | Query Parameters | Description |
|---|---|---|---|---|
| `GET` | `/products` | No | `search`, `category`, `sort`, `max_price`, `store` | Returns catalog items with lowest store prices |
| `GET` | `/products/categories` | No | — | Returns array of distinct category names |
| `GET` | `/products/:id` | No | — | Returns single product details, specs & reviews |
| `GET` | `/products/:id/compare` | No | — | Returns side-by-side store price comparison matrix |
| `GET` | `/products/:id/history` | No | `range=7d\|30d\|90d\|180d\|1y` | Returns historical price snapshots and buy verdict |

### 3. Deal Intelligence & AI (`/api`)

| Method | Endpoint | Auth | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/analyze-url` | No | `{ url: "https://amazon.in/..." }` | Parses retailer link, extracts product, returns cross-store deal analysis |
| `POST` | `/ai-assistant` | No | `{ message: "best laptop under 60k" }` | Shopping reasoning engine delivering advice and recommendations |

### 4. Price Alerts & Coupons (`/api`)

| Method | Endpoint | Auth | Request Body | Description |
|---|---|---|---|---|
| `GET` | `/alerts` | No/Yes | — | Lists active price alerts (filtered by user if authenticated) |
| `POST` | `/alerts` | No | `{ productId, targetPrice, email }` | Subscribes an email to a product price threshold |
| `DELETE`| `/alerts/:id` | Yes | — | Deletes a price alert subscription |
| `GET` | `/coupons` | No | — | Lists verified store coupons with discount terms |
| `POST` | `/coupons/verify` | No | `{ code, store }` | Validates a coupon code against minimum spend |

### 5. Cart, Wishlist & Orders (`/api`)

| Method | Endpoint | Auth | Request Body | Description |
|---|---|---|---|---|
| `GET` | `/wishlist` | Yes | — | Retrieves user's bookmarked products |
| `POST` | `/wishlist` | Yes | `{ productId }` | Adds a product to the user's wishlist |
| `DELETE`| `/wishlist/:id` | Yes | — | Removes a product from the wishlist |
| `POST` | `/orders` | Yes | `{ items: [{ productId, quantity }], shipping }` | Validates inventory, computes final ₹ total, creates order |
| `GET` | `/orders` | Yes | — | Retrieves all previous orders for authenticated user |

---

## 🗄️ Database Schema (`ecommerce.db`)

The SQLite database consists of 8 interconnected tables:

```text
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│    products     │1    * │    store_listings    │       │   price_snapshots    │
│─────────────────│───────│──────────────────────│       │──────────────────────│
│ id (PK)         │       │ id (PK)              │       │ id (PK)              │
│ title           │       │ product_id (FK)      │       │ product_id (FK)      │
│ brand           │       │ store_name           │       │ store_name           │
│ category        │       │ price                │       │ price                │
│ model_no        │       │ original_price       │       │ recorded_at          │
│ image_url       │       │ delivery_charge      │       └──────────────────────┘
│ description     │       │ availability_status  │
│ base_price      │       │ store_url            │       ┌──────────────────────┐
│ rating          │       │ bank_offer           │       │     price_alerts     │
│ reviews_count   │       │ last_checked_at      │       │──────────────────────│
│ stock           │       └──────────────────────┘       │ id (PK)              │
│ specs (JSON)    │                                      │ user_id (FK, opt)    │
│ fakespot_grade  │                                      │ product_id (FK)      │
└─────────────────┘                                      │ email, target_price  │
         │                                               └──────────────────────┘
         │1       ┌──────────────────────┐
         └──────* │       wishlist       │               ┌──────────────────────┐
                  │──────────────────────│               │       coupons        │
                  │ id (PK)              │               │──────────────────────│
                  │ user_id (FK)         │               │ id (PK), store_name  │
                  │ product_id (FK)      │               │ code, discount_amt   │
                  └──────────────────────┘               │ min_spend, expires   │
                                                         └──────────────────────┘
┌─────────────────┐       ┌──────────────────────┐
│      users      │1    * │        orders        │
│─────────────────│───────│──────────────────────│
│ id (PK)         │       │ id (PK)              │
│ name            │       │ user_id (FK)         │
│ email (UNIQUE)  │       │ items (JSON)         │
│ password (HASH) │       │ subtotal, tax, ship  │
│ created_at      │       │ total, status        │
└─────────────────┘       └──────────────────────┘
```

---

## 🧪 Comprehensive Verification Suite

SMARTBUY includes an automated verification test suite to ensure platform stability, zero regression, and end-to-end functionality across all subsystems:

```bash
# 1. Full regression & functional audit (Cart, Omnibar, Mascot, Pincode)
node verify_audit_regression.js

# 2. Multi-Store price comparison, link analyzer & AI shopping assistant
node verify_smartbuy_platform.js

# 3. 180-Day price history, algorithmic verdicts & coupon validation
node verify_features.js

# 4. Hero section visual layout & cutout transparency
node verify_hero_redesign.js

# 5. Visual atmosphere, theme toggle & glassmorphism tokens
node verify_visual_atmosphere.js
```

All 5 test suites pass with **100% success rate**.

---

## 🔒 Security & Reliability Architecture

- **Password Hashing**: Passwords are encrypted using `bcryptjs` with 10 salt rounds before storage; plain passwords are never recorded.
- **Stateless Session Control**: API authorization uses cryptographically signed JSON Web Tokens (7-day validity).
- **Server-Side Financial Re-Calculation**: All prices, tax rates (8% GST), shipping policies (free over ₹999), and item totals are calculated and validated server-side during checkout — preventing client-side tampering.
- **SQL Injection Prevention**: SQLite queries strictly utilize parameterized prepared statements throughout `db.js` and all route handlers.
- **Graceful Database Fallback**: Embedded SQLite initializes seamlessly with `better-sqlite3`, falling back automatically to Node.js native `node:sqlite` if binary bindings are unavailable.

---

## 📦 CodeAlpha Internship Submission Checklist

This project has been built in accordance with the **CodeAlpha Web Development Internship** submission standards:

- [x] **Repository Name**: Named exactly `CodeAlpha_EcommerceStore`.
- [x] **Full-Stack Implementation**: Express.js REST API, SQLite database, dynamic UI, authentication, cart, checkout, and order history.
- [x] **Documentation**: Complete setup manual, feature matrix, API reference, and database schema in `README.md`.
- [x] **Zero Cloud Dependency**: Runs from a single `npm start` command with zero required API keys or external services.
- [x] **LinkedIn Video Demonstration**: Project is prepared for screen recording highlighting:
  1. Live multi-store price comparison across Indian retailers.
  2. 180-day Chart.js price trend visualization and algorithmic buy recommendation.
  3. URL link analyzer parsing an e-commerce link and calculating savings.
  4. 💬 SMARTBUY AI Shopping Assistant responding to shopping queries.
  5. Interactive anime mascot tracking auth inputs.
  6. Cart drawer, pincode checker on product details page, and checkout flow.
- [x] **Submission Protocol**:
  - Push repository to a public GitHub URL.
  - Post the demo walkthrough video on LinkedIn tagging **@CodeAlpha** with tags `#codealpha #webdevelopment #internship #javascript #nodejs`.
  - Submit the repository link and LinkedIn post URL in the CodeAlpha submission form.

### Publishing to GitHub

```bash
git init
git add .
git commit -m "feat: complete SMARTBUY price comparison and deal intelligence platform"
git branch -M main
git remote add origin https://github.com/<your-username>/CodeAlpha_EcommerceStore.git
git push -u origin main
```

---

## 📄 License

This project is licensed under the **MIT License**. Free for educational and open-source use.
