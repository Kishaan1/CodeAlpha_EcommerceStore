/**
 * product.js
 * ----------
 * Dedicated product details page controller for CodeAlpha_EcommerceStore.
 * Vanilla ES6+, talks to Express API under /api/*.
 */

'use strict';

const API_BASE = '/api';
const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING_COST = 99;

const STORAGE_KEYS = {
  cart: 'ca_cart',
  token: 'ca_token',
  user: 'ca_user',
};

const VARIANTS = [
  { name: 'Triple Black', color: '#1a1a1a', border: '#404040' },
  { name: 'Silver Platinum', color: '#e5e7eb', border: '#9ca3af' },
  { name: 'Midnight Blue', color: '#1e3a8a', border: '#3b82f6' },
  { name: 'Smoke White', color: '#f3f4f6', border: '#d1d5db' },
  { name: 'Navy', color: '#0f172a', border: '#334155' },
];

let state = {
  product: null,
  compareData: null,
  historyData: null,
  reviewsData: null,
  allProducts: [],
  cart: loadCart(),
  selectedVariant: 'Triple Black',
  quantity: 1,
  activeRange: '90d',
  targetAlertPrice: null,
  priceChartInstance: null,
  coupon: null,
  selectedConfig: 'Standard Edition',
  configDelta: 0,
};

const $ = (id) => document.getElementById(id);

/* =========================================================
   UTILITIES
   ========================================================= */
function safeParseJSON(str) {
  try { return JSON.parse(str); } catch (_) { return null; }
}

function loadCart() {
  const c = safeParseJSON(localStorage.getItem(STORAGE_KEYS.cart));
  return Array.isArray(c) ? c : [];
}

function persistCart() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
}

function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderStars(rating) {
  const full = Math.round(rating);
  let s = '';
  for (let i = 1; i <= 5; i++) {
    s += i <= full ? '★' : '☆';
  }
  return s;
}

function toast(message, type = 'success') {
  const container = $('toastContainer');
  if (!container) return;

  const icons = {
    success: `<span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">✓</span>`,
    error: `<span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold shrink-0">✕</span>`,
    info: `<span class="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">ℹ</span>`,
  };

  const node = document.createElement('div');
  node.className = `toast-enter pointer-events-auto flex items-center justify-between gap-3 bg-slate-900/95 text-white border border-slate-800 text-xs font-medium px-4 py-3 rounded-2xl shadow-2xl max-w-sm w-full`;
  node.innerHTML = `
    <div class="flex items-center gap-2.5 min-w-0">
      ${icons[type] || icons.success}
      <span class="truncate">${escapeHtml(message)}</span>
    </div>
    <button class="text-slate-400 hover:text-white text-sm leading-none shrink-0" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(node);
  setTimeout(() => {
    node.classList.remove('toast-enter');
    node.classList.add('toast-leave');
    node.addEventListener('animationend', () => node.remove());
  }, 3200);
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Server error');
  }
  return res.json();
}

/* =========================================================
   THEME TOGGLE
   ========================================================= */
function initThemeToggle() {
  const btn = $('themeToggleBtn');
  const sun = $('themeSunIcon');
  const moon = $('themeMoonIcon');
  if (!btn) return;

  document.documentElement.classList.remove('dark');
  localStorage.setItem('theme', 'light');
  localStorage.setItem('ca_theme', 'light');

  function updateIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    if (sun) sun.classList.toggle('hidden', !isDark);
    if (moon) moon.classList.toggle('hidden', isDark);
  }

  updateIcons();

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    localStorage.setItem('ca_theme', isDark ? 'dark' : 'light');
    updateIcons();
    if (state.historyData) {
      renderPriceChart(state.historyData, state.activeRange);
    }
  });
}

/* =========================================================
   CART DRAWER & LOCALSTORAGE SYNCHRONIZATION
   ========================================================= */
function openCart() {
  renderCartDrawer();
  const overlay = $('cart-backdrop');
  const drawer = $('cart-drawer');
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.classList.add('z-[90]');
    requestAnimationFrame(() => overlay.classList.add('open'));
  }
  if (drawer) {
    drawer.classList.remove('translate-x-full', 'hidden');
    drawer.classList.add('translate-x-0', 'z-[100]');
    requestAnimationFrame(() => drawer.classList.add('open'));
  }
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const overlay = $('cart-backdrop');
  const drawer = $('cart-drawer');
  if (drawer) {
    drawer.classList.remove('translate-x-0', 'open');
    drawer.classList.add('translate-x-full');
  }
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => overlay.classList.add('hidden'), 250);
  }
  document.body.style.overflow = '';
}

function renderCartBadge() {
  const badge = $('cartCount');
  if (!badge) return;
  const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQty > 0) {
    badge.textContent = totalQty > 99 ? '99+' : totalQty;
    badge.classList.remove('hidden');
    badge.classList.add('flex');
  } else {
    badge.classList.add('hidden');
    badge.classList.remove('flex');
  }
}

function renderCartDrawer() {
  const container = $('cartItems');
  const emptyState = $('cartEmptyState');
  const footer = $('cartFooter');
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    if (footer) footer.classList.add('hidden');
    renderCartBadge();
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (footer) footer.classList.remove('hidden');

  container.innerHTML = state.cart
    .map((item) => `
      <div class="flex items-center gap-3.5 pb-3 border-b border-neutral-100 dark:border-slate-800">
        <div class="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 shrink-0 border border-slate-200/60 dark:border-slate-700/60">
          <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-full h-full object-contain" onerror="this.onerror=null; this.src='https://placehold.co/600x600/1e293b/94a3b8?text=Product';" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-xs text-slate-900 dark:text-white truncate">${escapeHtml(item.name)}</h4>
          <p class="text-[11px] text-slate-400 mt-0.5">Finish: ${escapeHtml(item.variant || 'Triple Black')}</p>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button class="w-5 h-5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white" onclick="window.changeCartQty(${item.productId}, -1)">−</button>
              <span class="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">${item.quantity}</span>
              <button class="w-5 h-5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white" onclick="window.changeCartQty(${item.productId}, 1)">+</button>
            </div>
            <span class="font-extrabold text-xs text-slate-900 dark:text-white">${formatCurrency(item.price * item.quantity)}</span>
          </div>
        </div>
        <button class="p-1 text-slate-400 hover:text-rose-500 transition" onclick="window.removeCartItem(${item.productId})">✕</button>
      </div>
    `)
    .join('');

  updateCartTotals();
  updateSmartCartSplit();
  renderCartBadge();
}

function updateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountRate = state.coupon === 'BUYHATKE20' ? 0.20 : 0;
  const discount = Math.round(subtotal * discountRate * 100) / 100;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = state.cart.length === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
  const total = Math.round((discountedSubtotal + tax + shipping) * 100) / 100;

  if ($('cartSubtotal')) $('cartSubtotal').textContent = formatCurrency(subtotal);
  if ($('cartTax')) $('cartTax').textContent = formatCurrency(tax);
  if ($('cartShipping')) $('cartShipping').textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
  if ($('cartTotal')) $('cartTotal').textContent = formatCurrency(total);

  const discountRow = $('cartDiscountRow');
  if (discountRow) {
    if (discount > 0) {
      discountRow.classList.remove('hidden');
      discountRow.classList.add('flex');
      if ($('cartDiscount')) $('cartDiscount').textContent = `-${formatCurrency(discount)}`;
    } else {
      discountRow.classList.add('hidden');
      discountRow.classList.remove('flex');
    }
  }
}

function updateSmartCartSplit() {
  const banner = $('cartSmartSplitBanner');
  if (!banner) return;
  if (state.cart.length === 0) {
    banner.classList.add('hidden');
    return;
  }
  const additionalSavings = state.cart.length * 15.5;
  banner.classList.remove('hidden');
  const savingsEl = $('cartSmartSplitSavings');
  if (savingsEl) savingsEl.textContent = `Save +${formatCurrency(additionalSavings)}!`;
}

window.changeCartQty = function (productId, delta) {
  const item = state.cart.find((i) => i.productId === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((i) => i.productId !== productId);
  }
  persistCart();
  renderCartDrawer();
};

window.removeCartItem = function (productId) {
  state.cart = state.cart.filter((i) => i.productId !== productId);
  persistCart();
  renderCartDrawer();
  toast('Item removed from cart.', 'info');
};

function addCurrentProductToCart(quantity = 1, openDrawer = true) {
  if (!state.product) return;
  const p = state.product;
  const existing = state.cart.find((i) => i.productId === p.id && i.variant === state.selectedVariant);

  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      productId: p.id,
      name: p.name,
      image: p.image,
      price: p.price,
      quantity,
      stock: p.stock || 20,
      variant: state.selectedVariant,
    });
  }

  persistCart();
  renderCartBadge();
  toast(`Added ${quantity}x "${p.name}" (${state.selectedVariant}) to Bag!`, 'success');

  if (openDrawer) {
    openCart();
  }
}

/* =========================================================
   STORE BADGE HELPERS
   ========================================================= */
function getStoreBadgeClass(storeName = '') {
  const s = storeName.toLowerCase();
  if (s.includes('amazon')) return 'bg-[#ff9900]/15 text-[#b36b00] dark:text-[#ff9900] border border-[#ff9900]/30';
  if (s.includes('flipkart')) return 'bg-[#2874f0]/15 text-[#2874f0] dark:text-[#60a5fa] border border-[#2874f0]/30';
  if (s.includes('croma')) return 'bg-[#00e9bf]/15 text-[#008f75] dark:text-[#00e9bf] border border-[#00e9bf]/30';
  return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
}

function getStoreLogoSvg(storeName = '', sizeClass = 'w-5 h-5') {
  const norm = String(storeName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (norm.includes('amazon')) {
    return `<svg class="${sizeClass} shrink-0" viewBox="0 0 32 32" fill="none" aria-label="Amazon">
      <rect width="32" height="32" rx="16" fill="#232F3E"/>
      <path d="M16.8 17.2c-.3-.2-.7-.4-1.2-.4-1.2 0-2 .6-2 1.6 0 .9.6 1.4 1.5 1.4.7 0 1.3-.4 1.7-.9v-1.7zm1.6 3.8h-1.4v-.8c-.6.6-1.4 1-2.4 1-1.6 0-2.8-1-2.8-2.6 0-1.8 1.4-2.7 3.6-2.7.5 0 1 .1 1.4.2v-.8c0-.9-.6-1.4-1.7-1.4-.8 0-1.6.3-2.2.7l-.6-1c.8-.6 2-1 3.2-1 2 0 3.1 1.1 3.1 2.8v4.2c0 .6.1 1.1.4 1.4v.2z" fill="#FFFFFF"/>
      <path d="M8.5 21.8c3.8 2.6 9.4 2.6 13.5.2.3-.2.7.1.4.5-3.6 2.8-10.2 2.8-14.3-.2-.3-.3.1-.7.4-.5z" fill="#FF9900"/>
      <path d="M22.8 21.2c-.4-.5-1.5-.7-2.1-.6-.2 0-.2-.2-.1-.3.9-.7 2.3-.5 2.5-.3.2.3 0 1.7-.8 2.4-.1.1-.3 0-.2-.1.2-.4.7-1.1.7-1.1z" fill="#FF9900"/>
    </svg>`;
  }
  if (norm.includes('flipkart')) {
    return `<svg class="${sizeClass} shrink-0" viewBox="0 0 32 32" fill="none" aria-label="Flipkart">
      <rect width="32" height="32" rx="16" fill="#2874F0"/>
      <path d="M9.5 11.5h13l-1.5 13.5h-10l-1.5-13.5z" fill="#FFE11B"/>
      <path d="M13 11.5v-3a3 3 0 0 1 6 0v3" stroke="#FFE11B" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path d="M18.5 13.5h-3.2v2h2.8v1.8h-2.8v4.5h-2.2V13.5h-1.2v-1.8h1.2v-.8c0-1.8 1.1-2.9 3.1-2.9h2.3v2z" fill="#2874F0"/>
    </svg>`;
  }
  if (norm.includes('croma')) {
    return `<svg class="${sizeClass} shrink-0" viewBox="0 0 32 32" fill="none" aria-label="Croma">
      <rect width="32" height="32" rx="16" fill="#0F172A" stroke="#00E5D1" stroke-width="1.2"/>
      <circle cx="16" cy="16" r="10" stroke="#00E5D1" stroke-width="2.5" stroke-dasharray="48 14" stroke-linecap="round" transform="rotate(-40 16 16)"/>
      <circle cx="16" cy="16" r="3.2" fill="#00E5D1"/>
    </svg>`;
  }
  if (norm.includes('reliance')) {
    return `<svg class="${sizeClass} shrink-0" viewBox="0 0 32 32" fill="none" aria-label="Reliance Digital">
      <rect width="32" height="32" rx="16" fill="#E42529"/>
      <text x="16" y="21" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#FFFFFF">RD</text>
    </svg>`;
  }
  return `<span class="${sizeClass} rounded-full bg-slate-700 text-[10px] font-bold text-white flex items-center justify-center shrink-0">🏪</span>`;
}

/* =========================================================
   PAGE POPULATION
   ========================================================= */
function populateProductUI(product) {
  document.title = `${product.name} — CodeAlpha Store`;

  // Breadcrumbs
  if ($('breadcrumbCategory')) $('breadcrumbCategory').textContent = product.category;
  if ($('breadcrumbTitle')) $('breadcrumbTitle').textContent = product.name;

  // Image & Badges
  if ($('pdMainImage')) {
    $('pdMainImage').src = product.image || product.image_url;
    $('pdMainImage').alt = product.name || product.title;
  }
  if ($('pdVariantBadge')) $('pdVariantBadge').textContent = state.selectedVariant;
  if ($('pdCategoryBadge')) $('pdCategoryBadge').textContent = product.category;

  // Gallery Thumbnails
  const galleryWrap = $('pdGalleryThumbnails');
  if (galleryWrap) {
    const mainImg = product.image || product.image_url;
    const angles = [
      { label: 'Front View', img: mainImg },
      { label: 'Angle View', img: mainImg },
      { label: 'Detail View', img: mainImg },
      { label: 'Case / Lifestyle', img: mainImg },
    ];
    galleryWrap.innerHTML = angles.map((a, idx) => `
      <button type="button" class="gallery-thumb-btn w-12 h-12 rounded-xl border p-1 bg-white dark:bg-slate-800 transition cursor-pointer hover:border-blue-500 ${idx === 0 ? 'ring-2 ring-blue-600 border-blue-600' : 'border-slate-200 dark:border-slate-700 opacity-80'}" data-img="${a.img}" title="${a.label}">
        <img src="${a.img}" alt="${a.label}" class="w-full h-full object-contain" />
      </button>
    `).join('');

    galleryWrap.querySelectorAll('.gallery-thumb-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if ($('pdMainImage')) $('pdMainImage').src = btn.dataset.img;
        galleryWrap.querySelectorAll('.gallery-thumb-btn').forEach((b) => b.classList.remove('ring-2', 'ring-blue-600', 'border-blue-600'));
        btn.classList.add('ring-2', 'ring-blue-600', 'border-blue-600');
      });
    });
  }

  // Title, Ratings, Description
  if ($('pdTitle')) $('pdTitle').textContent = product.name;
  if ($('pdRatingScore')) $('pdRatingScore').textContent = (product.rating || 4.8).toFixed(1);
  if ($('pdDescription')) $('pdDescription').textContent = product.description;

  // Price & Original
  const originalPrice = product.price * 1.18;
  if ($('pdPrice')) $('pdPrice').textContent = formatCurrency(product.price);
  if ($('pdOriginalPrice')) $('pdOriginalPrice').textContent = formatCurrency(originalPrice);

  // Color Swatches
  const swatchesWrap = $('pdVariantSwatches');
  if (swatchesWrap) {
    swatchesWrap.innerHTML = VARIANTS.map(
      (v) => `
      <button type="button" data-variant="${v.name}" class="swatch-pill ${v.name === state.selectedVariant ? 'ring-2 ring-indigo-500 scale-105' : 'opacity-85'} flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400 cursor-pointer">
        <span class="w-4 h-4 rounded-full shrink-0 shadow-xs" style="background-color: ${v.color}; border: 1px solid ${v.border}"></span>
        <span>${v.name}</span>
      </button>`
    ).join('');

    swatchesWrap.querySelectorAll('[data-variant]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedVariant = btn.dataset.variant;
        if ($('pdVariantLabel')) $('pdVariantLabel').textContent = state.selectedVariant;
        if ($('pdVariantBadge')) $('pdVariantBadge').textContent = state.selectedVariant;
        swatchesWrap.querySelectorAll('[data-variant]').forEach((b) => b.classList.remove('ring-2', 'ring-indigo-500', 'scale-105'));
        btn.classList.add('ring-2', 'ring-indigo-500', 'scale-105');
      });
    });
  }

  // Stock Pill
  const stockPill = $('pdStockPill');
  if (stockPill) {
    const isOut = (product.stock || 20) <= 0;
    stockPill.innerHTML = isOut
      ? '<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Out of Stock'
      : '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> In Stock';
  }

  // Bundle Mini Card details
  if ($('bundleMainImg')) $('bundleMainImg').src = product.image;
  if ($('bundleMainTitle')) $('bundleMainTitle').textContent = product.name;
  if ($('bundleMainPrice')) $('bundleMainPrice').textContent = formatCurrency(product.price);
  if ($('bundleTotalPrice')) {
    const bundleTotal = Math.max(0, product.price + 499 + 899 - 350);
    $('bundleTotalPrice').textContent = formatCurrency(bundleTotal);
  }
}

function populateStoresComparison(data) {
  const list = $('pdStoresList');
  const bestDealText = $('pdBestDealText');
  if (!list) return;

  const stores = (data && data.stores && data.stores.length > 0)
    ? data.stores
    : [
        { store_name: 'Amazon', current_price: state.product.price, bank_offer: 'Flat ₹500 off with HDFC Cards', isLowest: true },
        { store_name: 'Flipkart', current_price: state.product.price + 80, bank_offer: '5% Unlimited Cashback on Axis Bank', isLowest: false },
        { store_name: 'Croma', current_price: state.product.price + 150, bank_offer: 'Free Express Next-Day Delivery', isLowest: false },
      ];

  if (bestDealText) {
    const raw = data.callout || data.summaryCallout || '💡 Best deal verified live across all retail partners.';
    bestDealText.textContent = raw.replace(/\$([0-9,.]+)/g, '₹$1').replace(/\$/g, '₹');
  }

  list.innerHTML = stores
    .map((store) => {
      const isLowest = Boolean(store.isLowest);
      const curPrice = Number(store.current_price || store.price || 0);
      const origPrice = Number(store.original_price || (curPrice * 1.15));
      const deliveryCharge = Number(store.delivery_charge || 0);
      const totalEstimated = curPrice + deliveryCharge;
      const bankOffer = store.bank_offer || 'Instant Bank Discount Available';
      const availability = store.availability_status || 'In Stock';
      const storeUrl = store.store_url || `https://www.google.com/search?q=${encodeURIComponent(state.product.name + ' ' + store.store_name)}`;

      return `
        <div class="store-row ${isLowest ? 'border-emerald-500/50 bg-emerald-950/20 ring-1 ring-emerald-500/80' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'} p-4 rounded-2xl border transition-all duration-200 hover:shadow-md">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="store-badge-pill flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs shrink-0">
                ${getStoreLogoSvg(store.store_name, 'w-5 h-5')}
                <span class="font-bold text-xs text-slate-900 dark:text-white tracking-tight">${escapeHtml(store.store_name)}</span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-extrabold text-base text-slate-900 dark:text-white">${formatCurrency(curPrice)}</span>
                  ${origPrice > curPrice ? `<del class="text-xs text-slate-400 font-normal">${formatCurrency(origPrice)}</del>` : ''}
                  ${isLowest ? '<span class="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-xs">Lowest Listed Price</span>' : ''}
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span class="${deliveryCharge === 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}">
                    ${deliveryCharge === 0 ? '✓ Free Express Delivery' : `+ ${formatCurrency(deliveryCharge)} Delivery`}
                  </span>
                  <span>&middot;</span>
                  <span>Est. Total: <strong class="text-slate-900 dark:text-white">${formatCurrency(totalEstimated)}</strong></span>
                  <span>&middot;</span>
                  <span class="text-emerald-600 dark:text-emerald-400 font-medium">${escapeHtml(availability)}</span>
                </div>
              </div>
            </div>
            <a href="${escapeHtml(storeUrl)}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold px-4 py-2 rounded-xl border text-center ${isLowest ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 shadow-xs'} transition cursor-pointer shrink-0">
              View Deal →
            </a>
          </div>
          <div class="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[11px]">
            <div class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 min-w-0 truncate">
              <span>💳</span>
              <span class="font-medium truncate">${escapeHtml(bankOffer)}</span>
            </div>
            <span class="text-[10px] text-slate-400 shrink-0">Verified Live</span>
          </div>
        </div>
      `;
    })
    .join('');
}

/* =========================================================
   CHART.JS 90-DAY PRICE TREND & AI FORECASTER
   ========================================================= */
function renderPriceChart(historyData, range = '90d') {
  const canvas = $('pdPriceHistoryChart');
  if (!canvas) return;

  const points = (historyData && Array.isArray(historyData.history) && historyData.history.length > 0)
    ? historyData.history
    : [
        { date: '90 days ago', price: state.product.price * 1.15 },
        { date: '70 days ago', price: state.product.price * 1.20 },
        { date: '50 days ago', price: state.product.price * 1.08 },
        { date: '35 days ago', price: state.product.price * 0.95 },
        { date: '15 days ago', price: state.product.price * 1.04 },
        { date: 'Today', price: state.product.price },
      ];

  const labels = points.map((p) => p.date);
  const prices = points.map((p) => Number(p.price));
  const minP = historyData?.lowestPrice || Math.min(...prices);
  const maxP = historyData?.highestPrice || Math.max(...prices);
  const avgP = historyData?.averagePrice || Math.round(prices.reduce((s, x) => s + x, 0) / prices.length);

  // Milestone metric cards
  if ($('pdMilestoneLowestPrice')) $('pdMilestoneLowestPrice').textContent = formatCurrency(minP);
  if ($('pdMilestoneHighestPrice')) $('pdMilestoneHighestPrice').textContent = formatCurrency(maxP);
  if ($('pdMilestoneAvgPrice')) $('pdMilestoneAvgPrice').textContent = formatCurrency(avgP);
  if ($('pdMilestoneLowestDate')) $('pdMilestoneLowestDate').textContent = `Recorded: ${labels[prices.indexOf(minP)] || 'Recent'}`;
  if ($('pdMilestoneHighestDate')) $('pdMilestoneHighestDate').textContent = `Recorded: ${labels[prices.indexOf(maxP)] || 'Peak'}`;

  // Deal Verdict banner
  const verdict = historyData?.verdict;
  const isNearLow = state.product.price <= minP * 1.05;
  if ($('pdVerdictText')) {
    if (verdict?.headline) {
      $('pdVerdictText').textContent = `${verdict.headline} — ${verdict.advice || ''}`;
    } else {
      $('pdVerdictText').textContent = isNearLow
        ? `Current price (${formatCurrency(state.product.price)}) is near the all-time low (${formatCurrency(minP)}). Excellent buying opportunity!`
        : `Current price is above the recorded low of ${formatCurrency(minP)}. We suggest setting a price alert.`;
    }
  }
  if ($('pdVerdictTag')) {
    $('pdVerdictTag').textContent = verdict?.status === 'great_deal' ? '🟢 Genuine Deal' : (isNearLow ? '🔥 Best Price' : '⏳ Good Price');
  }

  // AI Price Prediction Forecaster card updates
  const forecastMsg = $('pdForecastMessage');
  const forecastBadge = $('pdForecastConfidenceBadge');
  const forecastBar = $('pdForecastConfidenceBar');
  const forecastPct = $('pdForecastConfidencePercent');

  if (forecastMsg) {
    if (verdict?.advice) {
      forecastMsg.textContent = `${verdict.headline}: ${verdict.advice}`;
    } else {
      forecastMsg.textContent = isNearLow
        ? '✅ Best Time to Buy (92% Confidence — Unlikely to drop further across festive cycles)'
        : '⏳ Wait (81% Confidence — Likely to drop during upcoming sales)';
    }
  }
  if (forecastBadge) {
    forecastBadge.textContent = isNearLow ? '92% High Confidence' : '81% Moderate Confidence';
  }
  if (forecastBar) {
    forecastBar.style.width = isNearLow ? '92%' : '81%';
  }
  if (forecastPct) {
    forecastPct.textContent = isNearLow ? '92%' : '81%';
  }

  if (window.trendChart) {
    window.trendChart.destroy();
    window.trendChart = null;
  }
  if (state.priceChartInstance) {
    state.priceChartInstance.destroy();
    state.priceChartInstance = null;
  }

  const isDark = document.documentElement.classList.contains('dark');
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, isDark ? 'rgba(37, 99, 235, 0.4)' : 'rgba(37, 99, 235, 0.25)');
  gradient.addColorStop(1, isDark ? 'rgba(37, 99, 235, 0.0)' : 'rgba(37, 99, 235, 0.0)');

  const chartDatasets = [
    {
      label: 'Market Price (₹)',
      data: prices,
      borderColor: '#2563EB',
      borderWidth: 3,
      backgroundColor: gradient,
      fill: true,
      tension: 0.35,
      pointBackgroundColor: '#2563EB',
      pointBorderColor: '#ffffff',
      pointHoverRadius: 7,
      pointRadius: 4,
    },
  ];

  if (state.targetAlertPrice) {
    chartDatasets.push({
      label: `Target Alert (₹${state.targetAlertPrice.toLocaleString('en-IN')})`,
      data: new Array(prices.length).fill(state.targetAlertPrice),
      borderColor: '#ef4444',
      borderWidth: 2,
      borderDash: [6, 6],
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 0,
    });
  }

  state.priceChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: chartDatasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: Boolean(state.targetAlertPrice) },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#e2e8f0',
          bodyColor: '#38bdf8',
          padding: 10,
          cornerRadius: 12,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 11, family: 'Inter' } },
        },
        y: {
          grid: { color: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)' },
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            font: { size: 11, family: 'Inter' },
            callback: (val) => formatCurrency(val),
          },
        },
      },
    },
  });
  window.trendChart = state.priceChartInstance;
}

/* =========================================================
   REVIEWS & AUTHENTICITY
   ========================================================= */
function populateReviewsUI(reviewsData) {
  const reviews = (reviewsData && Array.isArray(reviewsData.reviews)) ? reviewsData.reviews : [];
  const stats = (reviewsData && reviewsData.stats) ? reviewsData.stats : { averageRating: 4.8, totalReviews: 24 };

  if ($('pdBigRating')) $('pdBigRating').textContent = (stats.averageRating || 4.8).toFixed(1);
  if ($('pdTotalReviewsCount')) $('pdTotalReviewsCount').textContent = `Based on ${stats.totalReviews || reviews.length} verified reviews`;
  if ($('pdReviewsCount')) $('pdReviewsCount').textContent = stats.totalReviews || reviews.length;

  // Breakdown bars
  const barsContainer = $('pdBreakdownBars');
  if (barsContainer) {
    const total = stats.totalReviews || 24;
    const mockCounts = stats.ratingCounts || { 5: 18, 4: 4, 3: 2, 2: 0, 1: 0 };
    barsContainer.innerHTML = [5, 4, 3, 2, 1]
      .map((star) => {
        const count = mockCounts[star] || 0;
        const pct = Math.round((count / total) * 100);
        return `
          <div class="flex items-center gap-3">
            <span class="w-8 text-right font-semibold text-slate-700 dark:text-slate-300">${star}★</span>
            <div class="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div class="bg-indigo-500 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
            <span class="w-10 text-right text-slate-400 font-mono">${count}</span>
          </div>
        `;
      })
      .join('');
  }

  // Reviews List
  const listContainer = $('pdReviewsList');
  if (listContainer) {
    if (reviews.length === 0) {
      listContainer.innerHTML = `
        <div class="p-4 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          No written customer reviews yet. Be the first to share your thoughts!
        </div>
      `;
    } else {
      listContainer.innerHTML = reviews
        .map((r) => `
          <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-bold text-xs text-slate-900 dark:text-white">${escapeHtml(r.author)}</span>
                <span class="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Verified Buyer</span>
              </div>
              <span class="text-[11px] text-slate-400">${new Date(r.created_at || Date.now()).toLocaleDateString()}</span>
            </div>
            <div class="text-amber-500 text-xs">${renderStars(r.rating || 5)}</div>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtml(r.comment)}</p>
          </div>
        `)
        .join('');
    }
  }
}

/* =========================================================
   RELATED PRODUCTS RECOMMENDATIONS
   ========================================================= */
function populateRelatedProducts(allProducts) {
  const container = $('relatedProductsGrid');
  if (!container || !Array.isArray(allProducts)) return;

  const currentId = state.product ? state.product.id : 0;
  const filtered = allProducts.filter((p) => p.id !== currentId).slice(0, 4);

  container.innerHTML = filtered
    .map((product) => `
      <div class="product-card group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:shadow-xl transition-all duration-300 cursor-pointer" onclick="window.location.href='product.html?id=${product.id}'">
        <div>
          <div class="aspect-square w-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4 overflow-hidden mb-3">
            <img src="${product.image}" alt="${escapeHtml(product.name)}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" onerror="this.onerror=null; this.src='https://placehold.co/600x600/1e293b/94a3b8?text=Product';" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">${product.category}</span>
          <h3 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mt-1 mb-2 leading-snug group-hover:text-indigo-500 transition">${escapeHtml(product.name)}</h3>
        </div>
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div class="text-[10px] text-slate-400">Best Price</div>
            <div class="text-sm font-black text-slate-900 dark:text-white">${formatCurrency(product.price)}</div>
          </div>
          <a href="product.html?id=${product.id}" class="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition" onclick="event.stopPropagation();">
            View →
          </a>
        </div>
      </div>
    `)
    .join('');
}

/* =========================================================
   SEARCH AUTOCOMPLETE
   ========================================================= */
function initSearch() {
  const input = $('searchInput');
  const clearBtn = $('clearSearchBtn');
  const popover = $('searchSuggestionsPopover');
  const list = $('searchSuggestionsList');
  if (!input) return;

  function handleSearch(q) {
    const val = String(q || '').trim().toLowerCase();
    if (clearBtn) clearBtn.classList.toggle('hidden', val.length === 0);
    if (!popover || !list) return;

    if (val.length === 0) {
      popover.classList.add('hidden');
      return;
    }

    const matches = state.allProducts.filter(
      (p) => p.name.toLowerCase().includes(val) || p.category.toLowerCase().includes(val)
    ).slice(0, 4);

    if (matches.length === 0) {
      list.innerHTML = `<div class="p-3 text-center text-xs text-slate-400">No matching products found</div>`;
      popover.classList.remove('hidden');
      return;
    }

    list.innerHTML = matches
      .map((p) => `
        <div class="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-3 cursor-pointer" onclick="window.location.href='product.html?id=${p.id}'">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" class="w-9 h-9 object-contain rounded-lg bg-slate-100 dark:bg-slate-800 p-1" />
          <div class="min-w-0 flex-1">
            <h5 class="text-xs font-semibold text-slate-900 dark:text-white truncate">${escapeHtml(p.name)}</h5>
            <div class="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">${formatCurrency(p.price)}</div>
          </div>
        </div>
      `)
      .join('');

    popover.classList.remove('hidden');
  }

  input.addEventListener('input', (e) => handleSearch(e.target.value));
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      handleSearch('');
    });
  }

  document.addEventListener('click', (e) => {
    if (popover && !$('searchContainer').contains(e.target)) {
      popover.classList.add('hidden');
    }
  });
}

/* =========================================================
   SIMULATE LIVE SCRAPING
   ========================================================= */
function simulateLiveSync() {
  const overlay = $('pdLiveSyncOverlay');
  const bar = $('pdSyncProgressBar');
  const pct = $('pdSyncPercent');
  const s1 = $('pdSyncStep1');
  const s2 = $('pdSyncStep2');
  const s3 = $('pdSyncStep3');
  const icon = $('pdSyncIcon');
  if (!overlay) return;

  overlay.classList.remove('hidden');
  if (icon) icon.classList.add('animate-spin');

  let step = 0;
  const interval = setInterval(() => {
    step++;
    if (step === 1) {
      bar.style.width = '40%';
      pct.textContent = '40%';
      if (s1) { s1.textContent = '✓ Updated'; s1.className = 'text-emerald-400 font-bold'; }
    } else if (step === 2) {
      bar.style.width = '75%';
      pct.textContent = '75%';
      if (s2) { s2.textContent = '✓ Verified'; s2.className = 'text-emerald-400 font-bold'; }
    } else if (step >= 3) {
      clearInterval(interval);
      bar.style.width = '100%';
      pct.textContent = '100%';
      if (s3) { s3.textContent = '✓ In Stock'; s3.className = 'text-emerald-400 font-bold'; }
      if (icon) icon.classList.remove('animate-spin');
      setTimeout(() => {
        overlay.classList.add('hidden');
        toast('All store prices verified live across Amazon, Flipkart & Croma!', 'success');
      }, 700);
    }
  }, 400);
}

/* =========================================================
   EVENT WIREUP
   ========================================================= */
function wireEvents() {
  // Cart Trigger
  const cartBtn = $('cart-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCart);
  const closeCartBtn = $('close-cart-btn') || $('closeCartBtn');
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  const cartBackdrop = $('cart-backdrop');
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  // Quantity Controls
  const minus = $('pdQtyMinus');
  const plus = $('pdQtyPlus');
  const countEl = $('pdQtyCount');

  if (minus && plus && countEl) {
    minus.addEventListener('click', () => {
      state.quantity = Math.max(1, state.quantity - 1);
      countEl.textContent = state.quantity;
    });
    plus.addEventListener('click', () => {
      state.quantity = Math.min(20, state.quantity + 1);
      countEl.textContent = state.quantity;
    });
  }

  // Add to Bag / Buy Now Buttons
  const addBagBtn = $('addToBagBtn');
  if (addBagBtn) {
    addBagBtn.addEventListener('click', () => {
      addCurrentProductToCart(state.quantity, true);
    });
  }

  const buyNowBtn = $('buyNowBtn');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      addCurrentProductToCart(state.quantity, true);
    });
  }

  // Live Sync Button
  const syncBtn = $('pdLiveSyncBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', simulateLiveSync);
  }

  // Price History Range Switcher Pills: [7D], [30D], [90D], [180D]
  const rangeSwitcher = $('pdRangeSwitcher');
  if (rangeSwitcher) {
    rangeSwitcher.querySelectorAll('.pd-range-pill').forEach((pill) => {
      pill.addEventListener('click', async () => {
        state.activeRange = pill.dataset.range || '90d';
        rangeSwitcher.querySelectorAll('.pd-range-pill').forEach((p) => p.classList.remove('active', 'bg-white', 'dark:bg-slate-700', 'text-slate-900', 'dark:text-white', 'font-bold'));
        pill.classList.add('active', 'bg-white', 'dark:bg-slate-700', 'text-slate-900', 'dark:text-white', 'font-bold');
        try {
          const freshHistory = await apiFetch(`/products/${state.product.id}/history?range=${state.activeRange}`);
          state.historyData = freshHistory;
          renderPriceChart(freshHistory, state.activeRange);
        } catch (_) {
          if (state.historyData) {
            renderPriceChart(state.historyData, state.activeRange);
          }
        }
      });
    });
  }

  // Share Deal Button
  const shareBtn = $('pdShareDealBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const p = state.product;
      const text = `🔥 SMARTBUY Deal Alert: ${p.title || p.name} is at ₹${Number(p.base_price || p.price).toLocaleString('en-IN')}! Compare live on SMARTBUY: ${window.location.href}`;
      navigator.clipboard.writeText(text).then(() => {
        toast('Deal summary copied to clipboard! Share anywhere.', 'success');
      }).catch(() => {
        toast('Copied deal URL to clipboard.', 'info');
      });
    });
  }

  // Price Drop Alert Button & Modal
  const alertBtn = $('pdPriceAlertBtn');
  const alertModal = $('priceAlertModal');
  const closeAlertBtn = $('closePriceAlertModalBtn');
  const alertForm = $('priceAlertForm');

  if (alertBtn && alertModal) {
    alertBtn.addEventListener('click', () => {
      alertModal.classList.remove('hidden');
      if ($('alertTargetPriceInput') && state.product) {
        $('alertTargetPriceInput').value = Math.round((state.product.price || state.product.base_price) * 0.9);
      }
    });
  }

  if (closeAlertBtn && alertModal) {
    closeAlertBtn.addEventListener('click', () => alertModal.classList.add('hidden'));
  }

  if (alertForm) {
    alertForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const targetVal = parseFloat($('alertTargetPriceInput').value) || 0;
      const emailVal = $('alertEmailInput').value || 'shopper@smartbuy.in';
      if (alertModal) alertModal.classList.add('hidden');

      try {
        await apiFetch('/alerts', {
          method: 'POST',
          body: JSON.stringify({
            productId: state.product.id,
            targetPrice: targetVal,
            email: emailVal,
          }),
        });
        state.targetAlertPrice = targetVal;
        renderPriceChart(state.historyData, state.activeRange);
        toast(`Price Drop Tracker activated for ₹${targetVal.toLocaleString('en-IN')}! Target threshold line added to graph.`, 'success');
      } catch (err) {
        state.targetAlertPrice = targetVal;
        renderPriceChart(state.historyData, state.activeRange);
        toast(`Tracker active at ₹${targetVal.toLocaleString('en-IN')}`, 'success');
      }
    });
  }

  // Write Review Toggle & Form
  const reviewToggleBtn = $('pdToggleReviewFormBtn');
  const reviewForm = $('pdReviewForm');
  const cancelReviewBtn = $('pdCancelReviewBtn');

  if (reviewToggleBtn && reviewForm) {
    reviewToggleBtn.addEventListener('click', () => reviewForm.classList.toggle('hidden'));
  }
  if (cancelReviewBtn && reviewForm) {
    cancelReviewBtn.addEventListener('click', () => reviewForm.classList.add('hidden'));
  }
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const author = $('pdReviewAuthor').value;
      const rating = parseInt($('pdReviewRating').value, 10) || 5;
      const comment = $('pdReviewComment').value;

      try {
        await apiFetch(`/products/${state.product.id}/reviews`, {
          method: 'POST',
          body: JSON.stringify({ author, rating, comment }),
        });
        toast('Thank you! Your verified review has been published.', 'success');
        reviewForm.reset();
        reviewForm.classList.add('hidden');
        // Refresh reviews
        const updatedReviews = await apiFetch(`/products/${state.product.id}/reviews`);
        populateReviewsUI(updatedReviews);
      } catch (err) {
        toast(err.message || 'Unable to submit review right now.', 'error');
      }
    });
  }

  // Coupon code
  const couponForm = $('couponForm');
  if (couponForm) {
    couponForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = ($('couponInput').value || '').trim().toUpperCase();
      if (val === 'BUYHATKE20' || val === 'MEGA20') {
        state.coupon = 'BUYHATKE20';
        toast('Promo BUYHATKE20 applied! 20% discount added to order.', 'success');
        renderCartDrawer();
      } else {
        toast('Invalid promo code. Try BUYHATKE20', 'error');
      }
    });
  }

  // Checkout button
  const checkoutBtn = $('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      toast('Redirecting to secure 256-bit payment gateway…', 'info');
    });
  }

  // Frequently Bought Together Bundle Add-All Action
  const bundleAddBtn = $('bundleAddAllBtn');
  if (bundleAddBtn) {
    bundleAddBtn.addEventListener('click', () => {
      if (!state.product) return;
      const p = state.product;
      const existingMain = state.cart.find((i) => i.productId === p.id && i.variant === state.selectedVariant);
      if (existingMain) {
        existingMain.quantity += 1;
      } else {
        state.cart.push({
          productId: p.id,
          name: p.name,
          image: p.image,
          price: p.price,
          quantity: 1,
          stock: p.stock || 20,
          variant: state.selectedVariant,
        });
      }

      const existingCase = state.cart.find((i) => i.productId === 9901);
      if (existingCase) {
        existingCase.quantity += 1;
      } else {
        state.cart.push({
          productId: 9901,
          name: 'Hard EVA Carry Case',
          image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=300&q=80',
          price: 499,
          quantity: 1,
          stock: 50,
          variant: 'Standard',
        });
      }

      const existingCharger = state.cart.find((i) => i.productId === 9902);
      if (existingCharger) {
        existingCharger.quantity += 1;
      } else {
        state.cart.push({
          productId: 9902,
          name: '65W Fast GaN Charger',
          image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=300&q=80',
          price: 899,
          quantity: 1,
          stock: 50,
          variant: 'Black',
        });
      }

      persistCart();
      renderCartBadge();
      renderCartDrawer();
      openCart();
      toast('Bundle added! Added 3 items to your shopping bag with ₹350 savings.', 'success');
    });
  }

  // Configuration / Tier Chips
  document.querySelectorAll('.pd-config-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedConfig = btn.dataset.config;
      state.configDelta = Number(btn.dataset.delta) || 0;
      if ($('pdConfigLabel')) $('pdConfigLabel').textContent = state.selectedConfig;
      document.querySelectorAll('.pd-config-chip').forEach((b) => {
        b.className = 'pd-config-chip px-3.5 py-1.5 rounded-xl border text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition cursor-pointer';
      });
      btn.className = 'pd-config-chip px-3.5 py-1.5 rounded-xl border text-xs font-semibold bg-indigo-600 text-white border-indigo-500 shadow-xs cursor-pointer';
      if (state.product) {
        const adjusted = state.product.price + state.configDelta;
        if ($('pdPrice')) $('pdPrice').textContent = formatCurrency(adjusted);
        if ($('pdOriginalPrice')) $('pdOriginalPrice').textContent = formatCurrency(adjusted * 1.18);
      }
    });
  });

  // Pincode Delivery Quick-Checker Form
  const pincodeForm = $('pdPincodeCheckForm');
  if (pincodeForm) {
    pincodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = ($('pdPincodeInput').value || '').trim();
      if (pin.length !== 6 || !/^\d+$/.test(pin)) {
        toast('Please enter a valid 6-digit Indian postal code.', 'error');
        return;
      }
      localStorage.setItem('ca_pincode', pin);
      const res = $('pdPincodeResult');
      if (res) res.classList.remove('hidden');
      if ($('pdPincodeSpeedText')) {
        $('pdPincodeSpeedText').textContent = `Delivery by Tomorrow, 2 PM • Free Express Delivery for ${pin}`;
      }
      if ($('pdPincodeSubText')) {
        $('pdPincodeSubText').textContent = `Cash on Delivery & Open-Box Verification eligible for Pin ${pin}.`;
      }
      toast(`Pincode verified! Fast express delivery active for ${pin}.`, 'success');
    });
  }

  // Specifications Tabs Switching
  document.querySelectorAll('.spec-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.spec-tab-btn').forEach((b) => {
        b.className = 'spec-tab-btn px-3.5 py-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white font-medium transition cursor-pointer';
      });
      btn.className = 'spec-tab-btn active px-3.5 py-1.5 rounded-full bg-indigo-600 text-white font-bold transition shadow-xs cursor-pointer';

      $('tabContentTechSpecs')?.classList.toggle('hidden', target !== 'tech-specs');
      $('tabContentWarranty')?.classList.toggle('hidden', target !== 'warranty-support');
      $('tabContentInTheBox')?.classList.toggle('hidden', target !== 'in-the-box');
    });
  });
}

/* =========================================================
   CHEAPER ALTERNATIVES & STORE COUPONS
   ========================================================= */
function populateCheaperAlternatives(allProducts) {
  const container = $('cheaperAlternativesGrid');
  if (!container || !Array.isArray(allProducts) || !state.product) return;

  const currentPrice = state.product.price || state.product.base_price;
  const currentId = state.product.id;

  // Filter items in same or adjacent category with lower price
  let cheaper = allProducts
    .filter((p) => p.id !== currentId && (p.price || p.base_price) < currentPrice)
    .sort((a, b) => (a.price || a.base_price) - (b.price || b.base_price))
    .slice(0, 4);

  if (cheaper.length === 0) {
    cheaper = allProducts.filter((p) => p.id !== currentId).slice(0, 4);
  }

  container.innerHTML = cheaper.map((item) => {
    const itemPrice = item.price || item.base_price;
    const savings = Math.max(0, currentPrice - itemPrice);
    return `
      <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between gap-3 group hover:border-emerald-400 transition">
        <div>
          <div class="w-full aspect-square rounded-2xl bg-slate-50 dark:bg-slate-800 p-3 mb-3 flex items-center justify-center overflow-hidden">
            <img src="${escapeHtml(item.image || item.image_url)}" alt="${escapeHtml(item.name || item.title)}" class="w-full h-full object-contain group-hover:scale-105 transition-transform" />
          </div>
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Save ₹${savings.toLocaleString('en-IN')}</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${escapeHtml(item.brand || 'Electronics')}</span>
          </div>
          <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">${escapeHtml(item.name || item.title)}</h4>
        </div>
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="font-extrabold text-sm text-slate-900 dark:text-white">${formatCurrency(itemPrice)}</span>
          <a href="/product.html?id=${item.id}" class="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition">
            Compare →
          </a>
        </div>
      </div>
    `;
  }).join('');
}

async function loadProductStoreCoupons() {
  const container = $('pdStoreCouponsList');
  if (!container) return;

  try {
    const res = await apiFetch('/coupons');
    const coupons = (res.coupons || []).slice(0, 3);
    if (coupons.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400">No active retailer coupons right now.</p>`;
      return;
    }

    container.innerHTML = coupons.map((c) => `
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-xs text-slate-900 dark:text-white">${escapeHtml(c.store_name)}</span>
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">• ${escapeHtml(c.discount_text)}</span>
          </div>
          <p class="text-[10px] text-slate-400 truncate">Min order: ₹${Number(c.min_order_amount || 0).toLocaleString('en-IN')}</p>
        </div>
        <button type="button" class="copy-pd-coupon-btn px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 hover:border-blue-500 transition cursor-pointer shrink-0" data-code="${escapeHtml(c.code)}">
          ${escapeHtml(c.code)}
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.copy-pd-coupon-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const code = btn.dataset.code;
        try {
          await navigator.clipboard.writeText(code);
          const orig = btn.textContent;
          btn.textContent = '✓ Copied!';
          btn.classList.add('text-emerald-600');
          setTimeout(() => {
            btn.textContent = orig;
            btn.classList.remove('text-emerald-600');
          }, 2000);
        } catch (_) {
          toast(`Code copied: ${code}`);
        }
      });
    });
  } catch (e) {
    console.warn('Coupons fetch failed:', e);
  }
}

/* =========================================================
   INITIALIZATION
   ========================================================= */
async function initProductPage() {
  initThemeToggle();
  initSearch();
  wireEvents();
  renderCartBadge();

  // 1. Read Product ID from URL
  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get('id')) || 1;

  try {
    // 2. Parallel API requests
    const [productData, compareData, historyData, reviewsData, catalogData] = await Promise.all([
      apiFetch(`/products/${productId}`),
      apiFetch(`/products/${productId}/compare`).catch(() => ({})),
      apiFetch(`/products/${productId}/history?range=90d`).catch(() => ({})),
      apiFetch(`/products/${productId}/reviews`).catch(() => ({})),
      apiFetch('/products').catch(() => ({ products: [] })),
    ]);

    state.product = productData.product || productData;
    state.compareData = compareData;
    state.historyData = historyData;
    state.reviewsData = reviewsData;
    state.allProducts = Array.isArray(catalogData) ? catalogData : (catalogData.products || []);

    // 3. Populate Page
    populateProductUI(state.product);
    populateStoresComparison(compareData);
    renderPriceChart(historyData, state.activeRange);
    populateReviewsUI(reviewsData);
    populateSpecificationsUI(state.product);
    populateRelatedProducts(state.allProducts);
    populateCheaperAlternatives(state.allProducts);
    loadProductStoreCoupons();
    recordRecentlyViewed(productId);

  } catch (err) {
    console.error('Failed to load product details:', err);
    toast('Unable to load product data. Showing fallback demonstration.', 'error');
  }
}

function recordRecentlyViewed(productId) {
  try {
    const key = 'ca_recently_viewed';
    let list = safeParseJSON(localStorage.getItem(key)) || [];
    if (!Array.isArray(list)) list = [];
    list = list.filter((id) => Number(id) !== Number(productId));
    list.unshift(Number(productId));
    localStorage.setItem(key, JSON.stringify(list.slice(0, 12)));
  } catch (_) {}
}

function populateSpecificationsUI(product) {
  const container = $('pdDynamicSpecsGrid');
  if (!container || !product) return;

  const specs = [
    { label: 'Brand & Model', val: `${product.brand || 'CodeAlpha'} Flagship Series` },
    { label: 'Category', val: product.category || 'Electronics' },
    { label: 'Connectivity', val: 'Bluetooth 5.3 Low-Latency / USB-C Audio' },
    { label: 'Driver / Processor', val: 'Custom 40mm Neodymium Titanium Acoustic Drivers' },
    { label: 'Noise Cancellation', val: 'Active Hybrid ANC (-42dB attenuation)' },
    { label: 'Battery Endurance', val: '32 Hours with Fast Fuel (10 min = 5 hrs)' },
    { label: 'Weight & Ergonomics', val: '248g Lightweight Aluminum-Polymer' },
    { label: 'Water / Sweat Rating', val: 'IPX4 Weather Resistant Certification' },
  ];

  container.innerHTML = specs
    .map(
      (s) => `
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <span class="text-slate-500 dark:text-slate-400 font-medium">${s.label}:</span>
        <span class="font-bold text-slate-900 dark:text-white text-right">${s.val}</span>
      </div>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', initProductPage);
