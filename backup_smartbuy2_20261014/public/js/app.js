/**
 * app.js
 * ------
 * CodeAlpha_EcommerceStore — client-side application.
 * Vanilla ES6+, no build step, no frameworks. Talks to the Express API
 * under /api/* and renders everything by direct DOM manipulation.
 */

'use strict';

/* =========================================================
   CONFIG & CONSTANTS
   ========================================================= */
const API_BASE = '/api';
const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING_COST = 99;
const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home'];

const STORAGE_KEYS = {
  cart: 'ca_cart',
  token: 'ca_token',
  user: 'ca_user',
  wishlist: 'ca_wishlist',
};

/* =========================================================
   STATE
   ========================================================= */
const state = {
  products: [],
  filters: { search: '', category: 'All', sort: '', deal: 'all', priceRange: 'all', brands: new Set(), minRating: 0, inStockOnly: false },
  cart: loadCart(),
  wishlist: loadWishlist(),
  viewMode: 'grid',
  token: localStorage.getItem(STORAGE_KEYS.token) || null,
  user: safeParseJSON(localStorage.getItem(STORAGE_KEYS.user)),
  searchDebounceId: null,
  coupon: null,
  pastOrders: [],
  compareIds: new Set(),
};

/* =========================================================
   DOM REFERENCES
   ========================================================= */
const $ = (id) => document.getElementById(id);

const el = {
  searchInput: $('searchInput'),
  clearSearchBtn: $('clearSearchBtn'),
  searchContainer: $('searchContainer'),
  searchSuggestionsPopover: $('searchSuggestionsPopover'),
  searchSuggestionsList: $('searchSuggestionsList'),
  searchMatchesCount: $('searchMatchesCount'),
  heroShopBtn: $('heroShopBtn'),
  heroQtyMinus: $('heroQtyMinus'),
  heroQtyCount: $('heroQtyCount'),
  heroQtyPlus: $('heroQtyPlus'),
  heroCompareBuyBtn: $('heroCompareBuyBtn'),
  heroHistoryBtn: $('heroHistoryBtn'),
  heroShowcaseImg: $('heroShowcaseImg'),
  heroFeaturedTitle: $('heroFeaturedTitle'),
  heroFeaturedPrice: $('heroFeaturedPrice'),
  heroFeaturedOriginalPrice: $('heroFeaturedOriginalPrice'),
  heroFeaturedDiscountBadge: $('heroFeaturedDiscountBadge'),
  heroProductDesc: $('heroProductDesc'),
  heroBadgeTopRight: $('heroBadgeTopRight'),
  heroBadgeTopRightText: $('heroBadgeTopRightText'),
  heroBadgeBottomLeft: $('heroBadgeBottomLeft'),
  heroBadgeBottomLeftText: $('heroBadgeBottomLeftText'),
  heroSwitcherList: $('heroSwitcherList'),
  categoryChips: $('categoryChips'),
  sortSelect: $('sortSelect'),

  authButtons: $('authButtons'),
  loginBtn: $('loginBtn'),
  registerBtn: $('registerBtn'),
  userMenuWrap: $('userMenuWrap'),
  userMenuBtn: $('userMenuBtn'),
  userInitial: $('userInitial'),
  userName: $('userName'),
  userDropdown: $('userDropdown'),
  dropdownName: $('dropdownName'),
  dropdownEmail: $('dropdownEmail'),
  ordersBtn: $('ordersBtn'),
  logoutBtn: $('logoutBtn'),

  cartBtn: $('cart-btn') || $('cartBtn'),
  cartCount: $('cartCount'),

  resultsHeading: $('resultsHeading'),
  resultsCount: $('resultsCount'),
  errorBanner: $('errorBanner'),
  skeletonGrid: $('skeletonGrid'),
  productGrid: $('productGrid'),
  emptyState: $('emptyState'),
  clearFiltersBtn: $('clearFiltersBtn'),

  cartOverlay: $('cart-backdrop') || $('cartOverlay'),
  cartDrawer: $('cart-drawer') || $('cartDrawer'),
  closeCartBtn: $('closeCartBtn'),
  cartItems: $('cartItems'),
  cartEmptyState: $('cartEmptyState'),
  cartFooter: $('cartFooter'),
  freeShippingNote: $('freeShippingNote'),
  couponForm: $('couponForm'),
  couponInput: $('couponInput'),
  applyCouponBtn: $('applyCouponBtn'),
  couponStatus: $('couponStatus'),
  cartDiscountRow: $('cartDiscountRow'),
  cartDiscountLabel: $('cartDiscountLabel'),
  cartDiscount: $('cartDiscount'),
  cartSubtotal: $('cartSubtotal'),
  cartTax: $('cartTax'),
  cartShipping: $('cartShipping'),
  cartTotal: $('cartTotal'),
  checkoutBtn: $('checkoutBtn'),

  quickViewModal: $('quickViewModal'),
  quickViewContent: $('quickViewContent'),

  authModal: $('authModal'),
  tabLogin: $('tabLogin'),
  tabRegister: $('tabRegister'),
  authError: $('authError'),
  loginForm: $('loginForm'),
  loginEmail: $('auth-email') || $('loginEmail'),
  loginPassword: $('auth-password') || $('loginPassword'),
  registerForm: $('registerForm'),
  registerName: $('registerName'),
  registerEmail: $('registerEmail'),
  registerPassword: $('registerPassword'),

  checkoutModal: $('checkoutModal'),
  closeCheckoutBtn: $('closeCheckoutBtn'),
  checkoutError: $('checkoutError'),
  shippingForm: $('shippingForm'),
  shipName: $('shipName'),
  shipAddress: $('shipAddress'),
  shipCity: $('shipCity'),
  shipZip: $('shipZip'),
  paymentForm: $('paymentForm'),
  cardNumber: $('cardNumber'),
  cardExpiry: $('cardExpiry'),
  cardCvc: $('cardCvc'),
  checkoutSummary: $('checkoutSummary'),
  backToShippingBtn: $('backToShippingBtn'),
  placeOrderBtn: $('placeOrderBtn'),
  successStep: $('successStep'),
  successOrderId: $('successOrderId'),
  successTotal: $('successTotal'),
  printSuccessBtn: $('printSuccessBtn'),
  successCloseBtn: $('successCloseBtn'),
  printableReceipt: $('printableReceipt'),

  ordersModal: $('ordersModal'),
  ordersList: $('ordersList'),
  ordersEmptyState: $('ordersEmptyState'),

  continueToReviewBtn: $('continueToReviewBtn'),
  reviewStep: $('reviewStep'),
  reviewShippingName: $('reviewShippingName'),
  reviewShippingAddress: $('reviewShippingAddress'),
  reviewCardMasked: $('reviewCardMasked'),
  reviewCardExpiry: $('reviewCardExpiry'),
  editShippingBtn: $('editShippingBtn'),
  editPaymentBtn: $('editPaymentBtn'),
  reviewCouponInput: $('reviewCouponInput'),
  reviewApplyCouponBtn: $('reviewApplyCouponBtn'),
  reviewCouponStatus: $('reviewCouponStatus'),
  backToPaymentBtn: $('backToPaymentBtn'),
  successTrackingNumber: $('successTrackingNumber'),
  successDeliveryDate: $('successDeliveryDate'),

  toastContainer: $('toastContainer'),
  year: $('year'),

  cartAutoCouponBtn: $('cartAutoCouponBtn'),
  reviewAutoCouponBtn: $('reviewAutoCouponBtn'),
  priceAlertModal: $('priceAlertModal'),
  priceAlertForm: $('priceAlertForm'),
  priceAlertProductId: $('priceAlertProductId'),
  priceAlertTargetPrice: $('priceAlertTargetPrice'),
  priceAlertEmail: $('priceAlertEmail'),

  couponScannerModal: $('couponScannerModal'),
  scannerSubtext: $('scannerSubtext'),
  scannerStatusLabel: $('scannerStatusLabel'),
  scannerProgressPercent: $('scannerProgressPercent'),
  scannerProgressBar: $('scannerProgressBar'),
  scannerQueue: $('scannerQueue'),
  scannerResultBanner: $('scannerResultBanner'),
  scannerResultTitle: $('scannerResultTitle'),
  scannerResultSavings: $('scannerResultSavings'),
  scannerDoneBtn: $('scannerDoneBtn'),
  confettiCanvas: $('confettiCanvas'),

  linkCompareForm: $('linkCompareForm'),
  linkCompareInput: $('linkCompareInput'),
  linkCompareBtn: $('linkCompareBtn'),
  linkCompareFeedback: $('linkCompareFeedback'),

  cashbackOverlayModal: $('cashbackOverlayModal'),
  cashbackStoreName: $('cashbackStoreName'),
  cashbackProgressBar: $('cashbackProgressBar'),
  cashbackMessage: $('cashbackMessage'),

  cartSmartSplitBanner: $('cartSmartSplitBanner'),
  cartSmartSplitTitle: $('cartSmartSplitTitle'),
  cartSmartSplitSavings: $('cartSmartSplitSavings'),
  cartSmartSplitText: $('cartSmartSplitText'),
  cartSmartSplitAllocation: $('cartSmartSplitAllocation'),

  extensionPromoBtn: $('extensionPromoBtn'),
  heroExtensionBtn: $('heroExtensionBtn'),
  extensionPreviewModal: $('extensionPreviewModal'),
  installExtensionActionBtn: $('installExtensionActionBtn'),
  installExtensionBtnText: $('installExtensionBtnText'),
  simulateExtensionScanBtn: $('simulateExtensionScanBtn'),
  extSimulateQueue: $('extSimulateQueue'),
  extSimResult: $('extSimResult'),

  themeToggleBtn: $('themeToggleBtn'),
  themeSunIcon: $('themeSunIcon'),
  themeMoonIcon: $('themeMoonIcon'),

  compareFloatingBar: $('compareFloatingBar'),
  compareBarCount: $('compareBarCount'),
  compareBarThumbnails: $('compareBarThumbnails'),
  compareClearBtn: $('compareClearBtn'),
  compareOpenBtn: $('compareOpenBtn'),
  compareModal: $('compareModal'),
  compareCloseBtn: $('compareCloseBtn'),
  compareModalContent: $('compareModalContent'),
  compareModalSubtitle: $('compareModalSubtitle'),
  compareModalClearBtn: $('compareModalClearBtn'),
  compareModalDoneBtn: $('compareModalDoneBtn'),
};

/* =========================================================
   UTILITIES
   ========================================================= */
function safeParseJSON(str) {
  try {
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
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

function loadCart() {
  const cart = safeParseJSON(localStorage.getItem(STORAGE_KEYS.cart));
  return Array.isArray(cart) ? cart : [];
}

function persistCart() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
}

function loadWishlist() {
  const list = safeParseJSON(localStorage.getItem(STORAGE_KEYS.wishlist));
  return Array.isArray(list) ? list : [];
}

function persistWishlist() {
  localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(state.wishlist));
  renderWishlistBadges();
}

function isWishlisted(id) {
  return state.wishlist.includes(Number(id));
}

function toggleWishlist(id) {
  const numId = Number(id);
  const idx = state.wishlist.indexOf(numId);
  let added = false;
  if (idx >= 0) {
    state.wishlist.splice(idx, 1);
  } else {
    state.wishlist.push(numId);
    added = true;
  }
  persistWishlist();
  const product = state.products.find((p) => p.id === numId);
  const title = product ? product.name : 'Item';
  toast(added ? `Added "${title}" to your Wishlist!` : `Removed "${title}" from your Wishlist.`, 'info');
  applyDealFilterAndRender();
}

function renderWishlistBadges() {
  const count = state.wishlist.length;
  const badge = $('wishlistCount');
  if (badge) {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    } else {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
  }
  const mobileBadge = $('mobileWishlistCount');
  if (mobileBadge) {
    mobileBadge.textContent = count;
    if (count > 0) {
      mobileBadge.classList.remove('hidden');
      mobileBadge.classList.add('flex');
    } else {
      mobileBadge.classList.add('hidden');
      mobileBadge.classList.remove('flex');
    }
  }
}

function persistAuth() {
  if (state.token && state.user) {
    localStorage.setItem(STORAGE_KEYS.token, state.token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  }
}

function renderStars(rating) {
  const full = Math.round(rating);
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += i <= full ? '★' : '☆';
  }
  return stars;
}

function stockInfo(stock) {
  if (stock <= 0) return { label: 'Out of stock', cls: 'out-of-stock', dot: false };
  if (stock <= 5) return { label: `Only ${stock} left`, cls: 'low-stock', dot: false };
  return { label: 'In stock', cls: 'in-stock', dot: true };
}

/* =========================================================
   TOAST NOTIFICATIONS (3s Auto-Dismiss Stack)
   ========================================================= */
function toast(message, type = 'success') {
  const icons = {
    success: `<span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">✓</span>`,
    error: `<span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold shrink-0">✕</span>`,
    info: `<span class="w-5 h-5 rounded-full bg-neutral-700 text-neutral-300 flex items-center justify-center text-xs font-bold shrink-0">ℹ</span>`,
  };

  const node = document.createElement('div');
  node.className = `toast-enter pointer-events-auto flex items-center justify-between gap-3 bg-neutral-900/95 text-white border border-neutral-800 text-xs font-medium px-4 py-3 rounded-2xl shadow-2xl max-w-sm w-full`;
  node.innerHTML = `
    <div class="flex items-center gap-2.5 min-w-0">
      ${icons[type] || icons.success}
      <span class="truncate">${escapeHtml(message)}</span>
    </div>
    <button type="button" class="text-neutral-400 hover:text-white transition shrink-0 p-1 leading-none text-base font-light" aria-label="Dismiss">×</button>
  `;

  node.querySelector('button').addEventListener('click', () => {
    node.classList.remove('toast-enter');
    node.classList.add('toast-exit');
    setTimeout(() => node.remove(), 200);
  });

  el.toastContainer.appendChild(node);

  setTimeout(() => {
    if (node.parentElement) {
      node.classList.remove('toast-enter');
      node.classList.add('toast-exit');
      node.addEventListener('animationend', () => node.remove(), { once: true });
    }
  }, 3000);
}

function morphAddToCartBtn(btn) {
  if (!btn || btn.classList.contains('btn-added-morph')) return;
  const originalHtml = btn.innerHTML;
  btn.classList.add('btn-added-morph');
  btn.innerHTML = `<span class="inline-flex items-center justify-center gap-1.5 font-bold"><svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Added</span>`;
  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.classList.remove('btn-added-morph');
  }, 1200);
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

function generateTrackingNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CA-TRK-${code}`;
}

function showErrorBanner(message) {
  el.errorBanner.textContent = message;
  el.errorBanner.classList.remove('hidden');
}

function hideErrorBanner() {
  el.errorBanner.classList.add('hidden');
}

/* =========================================================
   API WRAPPER
   ========================================================= */
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    if (res.status === 401) {
      // Session expired / invalid — clear local auth state silently.
      logout({ silent: true });
    }
    throw new Error(message);
  }

  return data;
}

/* =========================================================
   MODAL HELPERS
   ========================================================= */
function getProductIdFromHash() {
  const hash = window.location.hash || '';
  const match = hash.match(/^#product[=:-](\d+)/i);
  return match ? Number(match[1]) : null;
}

function updateHashForProduct(productId) {
  if (productId) {
    if (window.location.hash !== `#product=${productId}`) {
      window.history.pushState(null, '', `#product=${productId}`);
    }
  } else {
    if (window.location.hash.startsWith('#product')) {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', cleanUrl);
    }
  }
}

function openModal(modalEl) {
  modalEl.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

let priceChartInstance = null;

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('hidden');
  document.body.style.overflow = '';
  if (modalEl === el.authModal && typeof setMascotBlink === 'function') {
    setMascotBlink(false);
  }
  if (modalEl === el.quickViewModal) {
    updateHashForProduct(null);
    if (priceChartInstance) {
      priceChartInstance.destroy();
      priceChartInstance = null;
    }
  }
}


document.querySelectorAll('[data-close-modal]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal($(btn.dataset.closeModal)));
});

document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
  backdrop.addEventListener('click', () => {
    const modal = backdrop.closest('[id]');
    if (modal) closeModal(modal);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  ['quickViewModal', 'authModal', 'checkoutModal', 'ordersModal', 'priceAlertModal', 'extensionPreviewModal', 'pincodeModal'].forEach((id) => {
    const modal = $(id);
    if (modal && !modal.classList.contains('hidden')) closeModal(modal);
  });
  closeCart();
});

/* =========================================================
   PRODUCT CATALOG
   ========================================================= */
const ELECTRO_CATEGORIES = [
  {
    id: 'Mobiles',
    name: 'Mobiles',
    label: 'MOBILES • Shop Now',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80',
    count: 'Smartphones & 5G',
    searchTerm: 'smart',
  },
  {
    id: 'Laptops',
    name: 'Laptops',
    label: 'LAPTOPS • Shop Now',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80',
    count: 'Ultrabooks & Pro',
    searchTerm: 'laptop',
  },
  {
    id: 'Headphones',
    name: 'Audio',
    label: 'AUDIO • Shop Now',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
    count: 'Wireless & ANC',
    searchTerm: 'headphone',
  },
  {
    id: 'Accessories',
    name: 'Accessories',
    label: 'ACCESSORIES • Shop Now',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80',
    count: 'Earbuds & Cases',
    searchTerm: 'wireless',
  },
  {
    id: 'Smart Watches',
    name: 'Smart Watches',
    label: 'SMART WATCHES • Shop Now',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
    count: 'AMOLED & Fitness',
    searchTerm: 'watch',
  },
  {
    id: 'TV & Home',
    name: 'TV & Home',
    label: 'TV & HOME • Shop Now',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=300&q=80',
    count: 'Smart TV & Living',
    searchTerm: 'home',
  },
];

function selectCategory(catId) {
  const match = ELECTRO_CATEGORIES.find((c) => c.id === catId || c.name.toLowerCase() === String(catId).toLowerCase());
  if (match) {
    if (match.id === 'TV & Home' || match.name === 'TV & Home') {
      state.filters.category = 'Home';
      state.filters.search = '';
      if (el.searchInput) el.searchInput.value = '';
    } else if (state.filters.search === match.searchTerm && state.filters.category === 'All') {
      state.filters.category = 'All';
      state.filters.search = '';
      if (el.searchInput) el.searchInput.value = '';
    } else {
      state.filters.category = 'All';
      state.filters.search = match.searchTerm || '';
      if (el.searchInput) el.searchInput.value = match.searchTerm || '';
    }
  } else if (catId === 'All') {
    state.filters.category = 'All';
    state.filters.search = '';
    if (el.searchInput) el.searchInput.value = '';
  } else {
    state.filters.category = catId;
    state.filters.search = '';
    if (el.searchInput) el.searchInput.value = '';
  }
  renderCategoryChips();
  renderElectroCategoryTiles();
  fetchProducts();
  const target = $('resultsHeading') || $('productGrid');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderElectroCategoryTiles() {
  const container = $('electroCategoryTiles');
  if (!container) return;

  const currentCat = state.filters.category || 'All';

  container.innerHTML = ELECTRO_CATEGORIES.map((cat) => {
    const isActive = cat.id === currentCat || (cat.searchTerm && state.filters.search === cat.searchTerm);
    return `
      <button type="button" 
        class="category-tile group flex flex-col items-center bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-center cursor-pointer select-none ${
          isActive
            ? 'active border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-[1.02]'
            : 'hover:border-blue-500/80 hover:-translate-y-0.5'
        }"
        data-electro-category="${cat.id}">
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 p-1 flex items-center justify-center mb-2.5">
          <img src="${cat.image}" alt="${cat.name}" class="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-300" onerror="this.src='https://placehold.co/100x100/f1f5f9/94a3b8?text=${cat.name}';" />
        </div>
        <span class="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">${cat.name}</span>
        <span class="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>${cat.label || `${cat.name.toUpperCase()} • Shop Now`}</span>
        </span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('[data-electro-category]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.electroCategory;
      selectCategory(catId);
    });
  });
}

function renderCategoryChips() {
  if (!el.categoryChips) return;
  el.categoryChips.innerHTML = CATEGORIES.map(
    (cat) => `<button class="category-chip${cat === state.filters.category ? ' active' : ''}" data-category="${cat}">${cat}</button>`
  ).join('');

  el.categoryChips.querySelectorAll('.category-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.filters.category = chip.dataset.category;
      renderCategoryChips();
      renderElectroCategoryTiles();
      fetchProducts();
    });
  });
}

function renderSkeletons(count = 8) {
  el.skeletonGrid.innerHTML = Array.from({ length: count })
    .map(
      () => `
    <div class="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      <div class="skeleton aspect-square"></div>
      <div class="p-3 space-y-2">
        <div class="skeleton h-3 w-3/4 rounded"></div>
        <div class="skeleton h-3 w-1/2 rounded"></div>
        <div class="skeleton h-8 w-full rounded-lg mt-2"></div>
      </div>
    </div>`
    )
    .join('');
  el.skeletonGrid.classList.remove('hidden');
  el.productGrid.classList.add('hidden');
}

function hideSkeletons() {
  el.skeletonGrid.classList.add('hidden');
  el.productGrid.classList.remove('hidden');
}

function getProductStoreComparison(product) {
  let stores = [];
  if (Array.isArray(product.stores) && product.stores.length >= 3) {
    const amz = product.stores.find((s) => (s.store_name || '').toLowerCase().includes('amazon'));
    const flp = product.stores.find((s) => (s.store_name || '').toLowerCase().includes('flipkart'));
    const crm = product.stores.find((s) => (s.store_name || '').toLowerCase().includes('croma'));
    if (amz && flp && crm) {
      stores = [
        { name: 'Amazon', price: amz.current_price || amz.price },
        { name: 'Flipkart', price: flp.current_price || flp.price },
        { name: 'Croma', price: crm.current_price || crm.price }
      ];
    }
  }

  if (stores.length === 0) {
    const lowestIdx = (Math.abs(product.id || 1) - 1) % 3;
    const amzMult = lowestIdx === 0 ? 0.93 : 1.02;
    const flpMult = lowestIdx === 1 ? 0.93 : 1.05;
    const crmMult = lowestIdx === 2 ? 0.93 : 1.08;
    stores = [
      { name: 'Amazon', price: Math.round(product.price * amzMult * 100) / 100 },
      { name: 'Flipkart', price: Math.round(product.price * flpMult * 100) / 100 },
      { name: 'Croma', price: Math.round(product.price * crmMult * 100) / 100 }
    ];
  }

  let minPrice = Infinity;
  let minStore = 'Amazon';
  let maxPrice = 0;
  stores.forEach((s) => {
    if (s.price < minPrice) {
      minPrice = s.price;
      minStore = s.name;
    }
    if (s.price > maxPrice) {
      maxPrice = s.price;
    }
  });

  const comparison = stores.map((s) => ({
    ...s,
    isLowest: s.name === minStore
  }));

  const savings = Math.max(0, maxPrice - minPrice);
  return {
    stores: comparison,
    lowestStore: minStore,
    lowestPrice: minPrice,
    savings
  };
}

function productCardHtml(product) {
  const stock = stockInfo(product.stock);
  const isBest = product.isBestPrice ?? (product.price <= (product.min_history_price || product.price) * 1.05);
  const dealScoreText = product.dealBadge || (isBest ? '🔥 Best Price' : '⏳ Price Drop Expected');
  const isCompared = state.compareIds && state.compareIds.has(product.id);
  const wishlisted = isWishlisted(product.id);
  const comp = getProductStoreComparison(product);
  const amz = comp.stores.find((s) => s.name === 'Amazon') || comp.stores[0];
  const flp = comp.stores.find((s) => s.name === 'Flipkart') || comp.stores[1];
  const crm = comp.stores.find((s) => s.name === 'Croma') || comp.stores[2];

  if (state.viewMode === 'list') {
    return `
    <div class="product-card group bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 rounded-2xl border hover:border-slate-300 dark:hover:border-slate-700/80 border-t border-t-white/40 dark:border-t-white/10 overflow-hidden flex flex-col sm:flex-row cursor-pointer hover:-translate-y-1 hover:shadow-xl shadow-md transition-all duration-300 relative" data-id="${product.id}" data-action="view-product">
      <div class="relative w-full sm:w-60 h-52 sm:h-auto bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center overflow-hidden p-6 shrink-0 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none">
        <a href="product.html?id=${product.id}" class="w-full h-full flex items-center justify-center" aria-label="View ${escapeHtml(product.name)}">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" class="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105" onerror="this.onerror=null; this.src='https://placehold.co/600x600/f1f5f9/94a3b8?text=Product+Image';" />
        </a>

        <!-- Compare Checkbox Pill -->
        <label class="absolute top-3 left-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur text-[11px] font-semibold px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-1.5 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition select-none" onclick="event.stopPropagation();">
          <input type="checkbox" data-compare-id="${product.id}" class="compare-checkbox w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer" ${isCompared ? 'checked' : ''} />
          <span>Compare</span>
        </label>

        <!-- Wishlist Button -->
        <button type="button" data-action="toggle-wishlist" data-id="${product.id}" class="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur flex items-center justify-center text-xs shadow-xs border border-slate-200/80 dark:border-slate-700/80 hover:scale-110 transition cursor-pointer select-none" title="${wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}" onclick="event.stopPropagation();">
          ${wishlisted ? '❤️' : '🤍'}
        </button>

        <!-- Category Pill (bottom left) -->
        <span class="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur text-[10px] tracking-wider uppercase font-semibold px-2.5 py-0.5 rounded-full text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">${product.category}</span>

        <!-- Deal Badge (bottom right) -->
        <span class="absolute bottom-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur ${isBest ? 'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' : 'bg-amber-50/95 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'}">
          ${dealScoreText}
        </span>
      </div>

      <div class="p-5 flex flex-col justify-between flex-1">
        <div>
          <div class="flex items-start justify-between gap-4">
            <a href="product.html?id=${product.id}" class="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">${escapeHtml(product.name)}</h3>
            </a>
            <span class="font-extrabold text-lg text-slate-900 dark:text-white shrink-0">${formatCurrency(product.price)}</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${escapeHtml(product.description || '')}</p>
          <div class="flex items-center gap-3 mt-2 text-xs">
            <span class="text-slate-800 dark:text-slate-300 font-semibold flex items-center gap-1"><span class="text-amber-500">★</span> ${product.rating.toFixed(1)}</span>
            <span class="stock-pill ${stock.cls}">${stock.dot ? '<span class="pulse-dot"></span>' : ''}${stock.label}</span>
          </div>

          <!-- 3-Retailer Price Comparison Row: Amazon, Flipkart, Croma -->
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div class="p-1.5 rounded-xl border ${amz.isLowest ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'}">
              <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-0.5">
                <span>Amazon</span>${amz.isLowest ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold ml-0.5">✓</span>' : ''}
              </div>
              <div class="font-bold text-xs ${amz.isLowest ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}">${formatCurrency(amz.price)}</div>
            </div>
            <div class="p-1.5 rounded-xl border ${flp.isLowest ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'}">
              <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-0.5">
                <span>Flipkart</span>${flp.isLowest ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold ml-0.5">✓</span>' : ''}
              </div>
              <div class="font-bold text-xs ${flp.isLowest ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}">${formatCurrency(flp.price)}</div>
            </div>
            <div class="p-1.5 rounded-xl border ${crm.isLowest ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'}">
              <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-0.5">
                <span>Croma</span>${crm.isLowest ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold ml-0.5">✓</span>' : ''}
              </div>
              <div class="font-bold text-xs ${crm.isLowest ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}">${formatCurrency(crm.price)}</div>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 mt-3">
          <!-- Green Lowest Badge -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            <span class="relative flex h-2 w-2 shrink-0">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>🟢 Lowest: <strong class="font-bold">${formatCurrency(comp.lowestPrice)}</strong> on ${comp.lowestStore} (Save ${formatCurrency(comp.savings)})</span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button type="button" data-action="add-to-cart" data-id="${product.id}" ${product.stock <= 0 ? 'disabled' : ''}
              class="flex-1 sm:flex-none px-6 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm ${
                product.stock <= 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }">
              ${product.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}
            </button>
            <button type="button" data-action="view-trend" data-id="${product.id}"
              class="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1 shadow-xs"
              title="View 90-Day Price Trend">
              <span>📉</span> <span>90D Trend</span>
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }

  return `
    <div class="product-card group bg-white border-slate-200 text-slate-900 dark:bg-slate-900/80 dark:backdrop-blur-md dark:border-slate-800 dark:text-slate-100 rounded-2xl border hover:border-slate-300 dark:hover:border-slate-700/80 border-t border-t-white/40 dark:border-t-white/10 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_20px_35px_-15px_rgba(99,102,241,0.15)] shadow-xl transition-all duration-300 relative" data-id="${product.id}" data-action="view-product">
      <div class="relative aspect-square w-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center overflow-hidden p-6 rounded-t-xl">
        <a href="product.html?id=${product.id}" class="w-full h-full flex items-center justify-center" aria-label="View ${escapeHtml(product.name)}">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" class="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105" onerror="this.onerror=null; this.src='https://placehold.co/600x600/f1f5f9/94a3b8?text=Product+Image';" />
        </a>

        <!-- Compare Checkbox Pill -->
        <label class="absolute top-3 left-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur text-[11px] font-semibold px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-1.5 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition select-none" onclick="event.stopPropagation();">
          <input type="checkbox" data-compare-id="${product.id}" class="compare-checkbox w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer" ${isCompared ? 'checked' : ''} />
          <span>Compare</span>
        </label>

        <!-- Wishlist Button -->
        <button type="button" data-action="toggle-wishlist" data-id="${product.id}" class="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur flex items-center justify-center text-xs shadow-xs border border-slate-200/80 dark:border-slate-700/80 hover:scale-110 transition cursor-pointer select-none" title="${wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}" onclick="event.stopPropagation();">
          ${wishlisted ? '❤️' : '🤍'}
        </button>

        <!-- Category Pill (bottom left) -->
        <span class="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur text-[10px] tracking-wider uppercase font-semibold px-2.5 py-0.5 rounded-full text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">${product.category}</span>

        <!-- Deal Badge (bottom right) -->
        <span class="absolute bottom-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur ${isBest ? 'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' : 'bg-amber-50/95 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'}">
          ${dealScoreText}
        </span>
      </div>

      <div class="p-4 flex flex-col flex-1">
        <a href="product.html?id=${product.id}" class="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
          <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2 min-h-[2.75rem] leading-snug tracking-tight">${escapeHtml(product.name)}</h3>
        </a>
        <div class="flex items-center gap-1.5 mt-1 text-xs">
          <span class="text-slate-800 dark:text-slate-300 font-semibold flex items-center gap-1"><span class="text-amber-500">★</span> ${product.rating.toFixed(1)}</span>
          <span class="text-slate-400">•</span>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">${product.reviews_count || 128} reviews</span>
          <span class="ml-auto stock-pill ${stock.cls}">${stock.dot ? '<span class="pulse-dot"></span>' : ''}${stock.label}</span>
        </div>
        <div class="mt-2.5 flex items-baseline justify-between gap-2">
          <div class="flex items-baseline gap-2">
            <span class="font-bold text-base tracking-tight text-slate-900 dark:text-white">${formatCurrency(product.price)}</span>
            <del class="text-xs text-slate-400 font-medium">${formatCurrency(Math.round(product.price * 1.3))}</del>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
            ${comp.lowestStore}: ${formatCurrency(comp.lowestPrice)}
          </span>
        </div>

        <!-- 3-Retailer Price Comparison Row: Amazon, Flipkart, Croma -->
        <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-1.5 text-center">
          <div class="p-1.5 rounded-xl border ${amz.isLowest ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'}">
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-0.5">
              <span>Amazon</span>${amz.isLowest ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold ml-0.5">✓</span>' : ''}
            </div>
            <div class="font-bold text-xs ${amz.isLowest ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}">${formatCurrency(amz.price)}</div>
          </div>
          <div class="p-1.5 rounded-xl border ${flp.isLowest ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'}">
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-0.5">
              <span>Flipkart</span>${flp.isLowest ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold ml-0.5">✓</span>' : ''}
            </div>
            <div class="font-bold text-xs ${flp.isLowest ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}">${formatCurrency(flp.price)}</div>
          </div>
          <div class="p-1.5 rounded-xl border ${crm.isLowest ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'}">
            <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-0.5">
              <span>Croma</span>${crm.isLowest ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold ml-0.5">✓</span>' : ''}
            </div>
            <div class="font-bold text-xs ${crm.isLowest ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}">${formatCurrency(crm.price)}</div>
          </div>
        </div>

        <!-- Green Badge: Lowest Price & Savings Callout with live status ping -->
        <div class="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
          <span class="flex items-center gap-1.5 truncate">
            <span class="relative flex h-2 w-2 shrink-0">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>🟢 Lowest: <strong class="font-bold text-emerald-900 dark:text-emerald-200">${formatCurrency(comp.lowestPrice)}</strong> on ${comp.lowestStore}</span>
          </span>
          <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0 ml-1">(Save ${formatCurrency(comp.savings)})</span>
        </div>

        <!-- Two Action Buttons: "Add to Bag" & "📉 90D Trend" -->
        <div class="mt-3 flex items-center gap-2">
          <button type="button" data-action="add-to-cart" data-id="${product.id}" ${product.stock <= 0 ? 'disabled' : ''}
            class="flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-xs ${
              product.stock <= 0
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }">
            ${product.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}
          </button>
          <button type="button" data-action="view-trend" data-id="${product.id}"
            class="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center justify-center gap-1 shrink-0 shadow-xs"
            title="View 90-Day Price Trend">
            <span>📉</span> <span>90D Trend</span>
          </button>
        </div>
      </div>
    </div>`;
}

function renderProducts(products) {
  if (products.length === 0) {
    el.productGrid.innerHTML = '';
    el.emptyState.classList.remove('hidden');
    el.emptyState.classList.add('flex');
    el.resultsCount.textContent = '';
    return;
  }

  el.emptyState.classList.add('hidden');
  el.emptyState.classList.remove('flex');
  el.productGrid.innerHTML = products.map(productCardHtml).join('');
  el.resultsCount.textContent = `${products.length} item${products.length === 1 ? '' : 's'}`;

  // Populate "Best Sellers" grid if present on the page
  const bestSellersEl = $('bestSellersGrid');
  if (bestSellersEl && state.products.length > 0) {
    const topSellers = [...state.products].sort((a, b) => b.rating - a.rating).slice(0, 4);
    bestSellersEl.innerHTML = topSellers.map(productCardHtml).join('');

    bestSellersEl.querySelectorAll('[data-action="view-product"]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="add-to-cart"]') || e.target.closest('[data-compare-id]') || e.target.closest('[data-action="toggle-wishlist"]') || e.target.closest('[data-action="view-trend"]')) return;
        window.location.href = `product.html?id=${card.dataset.id}`;
      });
    });

    bestSellersEl.querySelectorAll('[data-action="add-to-cart"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(Number(btn.dataset.id), 1, 'Triple Black', btn);
        openCartDrawer();
      });
    });

    bestSellersEl.querySelectorAll('[data-action="view-trend"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openPriceHistoryModal(Number(btn.dataset.id));
      });
    });

    bestSellersEl.querySelectorAll('[data-action="toggle-wishlist"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWishlist(Number(btn.dataset.id));
      });
    });
  }

  // Direct dedicated product page navigation on card / image / title click
  el.productGrid.querySelectorAll('[data-action="view-product"]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="add-to-cart"]') || e.target.closest('[data-compare-id]') || e.target.closest('[data-action="toggle-wishlist"]') || e.target.closest('[data-action="view-trend"]')) return;
      window.location.href = `product.html?id=${card.dataset.id}`;
    });
  });

  // Add to cart click
  el.productGrid.querySelectorAll('[data-action="add-to-cart"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(Number(btn.dataset.id), 1, 'Triple Black', btn);
      openCartDrawer();
    });
  });

  // 90-Day Trend modal click
  el.productGrid.querySelectorAll('[data-action="view-trend"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPriceHistoryModal(Number(btn.dataset.id));
    });
  });

  // Wishlist button click
  el.productGrid.querySelectorAll('[data-action="toggle-wishlist"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(Number(btn.dataset.id));
    });
  });

  // Compare checkboxes
  el.productGrid.querySelectorAll('[data-compare-id]').forEach((cb) => {
    cb.addEventListener('click', (e) => e.stopPropagation());
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      const id = Number(cb.dataset.compareId);
      if (cb.checked) {
        if (state.compareIds.size >= 3) {
          cb.checked = false;
          toast('You can compare a maximum of 3 products at once.', 'info');
          return;
        }
        state.compareIds.add(id);
        toast(`Added to comparison (${state.compareIds.size}/3)`, 'info');
      } else {
        state.compareIds.delete(id);
      }
      updateCompareFloatingBar();
    });
  });
}

async function fetchProducts() {
  renderSkeletons();
  hideErrorBanner();

  const params = new URLSearchParams();
  if (state.filters.search) params.set('search', state.filters.search);
  if (state.filters.category && state.filters.category !== 'All') params.set('category', state.filters.category);
  if (state.filters.sort) params.set('sort', state.filters.sort);

  try {
    const data = await apiFetch(`/products?${params.toString()}`);
    state.products = data.products;
    hideSkeletons();
    applyDealFilterAndRender();
  } catch (err) {
    hideSkeletons();
    showErrorBanner(`Couldn't load products: ${err.message}`);
  }
}

function applyDealFilterAndRender() {
  let list = [...state.products];
  const deal = state.filters.deal || 'all';

  if (deal === 'all_time_low') {
    list = list.filter((p) => p.isAllTimeLow || p.price <= (p.min_history_price || p.price) * 1.02);
    el.resultsHeading.textContent = '🔥 All-Time Lows';
  } else if (deal === 'deep_discount') {
    list = list.filter((p) => (p.max_discount_pct && p.max_discount_pct >= 30) || (p.id % 2 === 1));
    el.resultsHeading.textContent = '⚡ >30% Off Deals';
  } else if (deal === 'high_rated') {
    list = list.filter((p) => (p.rating || 0) >= 4.0);
    el.resultsHeading.textContent = '⭐ 4★ & Above Rated';
  } else if (deal === 'under_3000') {
    list = list.filter((p) => p.price < 3000);
    el.resultsHeading.textContent = '🏷️ Deals Under ₹3,000';
  } else if (deal === 'wishlist') {
    list = list.filter((p) => isWishlisted(p.id));
    el.resultsHeading.textContent = '❤️ My Saved Wishlist';
  } else {
    el.resultsHeading.textContent = state.filters.category === 'All' ? 'All Products' : state.filters.category;
  }

  // Catalog Sidebar Filters
  if (state.filters.priceRange === 'under_2000') {
    list = list.filter((p) => p.price < 2000);
  } else if (state.filters.priceRange === '2000_10000') {
    list = list.filter((p) => p.price >= 2000 && p.price <= 10000);
  } else if (state.filters.priceRange === 'above_10000') {
    list = list.filter((p) => p.price > 10000);
  }

  if (state.filters.brands && state.filters.brands.size > 0) {
    list = list.filter((p) => {
      const pText = `${p.brand || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
      return Array.from(state.filters.brands).some((b) => pText.includes(b.toLowerCase()));
    });
  }

  if (state.filters.minRating && state.filters.minRating > 0) {
    list = list.filter((p) => (p.rating || 0) >= state.filters.minRating);
  }

  if (state.filters.inStockOnly) {
    list = list.filter((p) => (p.stock || 0) > 0);
  }

  // Update Active Filter Badges
  let activeFilterCount = 0;
  if (state.filters.priceRange && state.filters.priceRange !== 'all') activeFilterCount++;
  if (state.filters.brands && state.filters.brands.size > 0) activeFilterCount += state.filters.brands.size;
  if (state.filters.minRating && state.filters.minRating > 0) activeFilterCount++;
  if (state.filters.inStockOnly) activeFilterCount++;

  const countBadge = $('activeFilterCount');
  const countWrapper = $('activeFilterBadge');
  if (countBadge) countBadge.textContent = activeFilterCount;
  if (countWrapper) {
    if (activeFilterCount > 0) countWrapper.classList.remove('hidden');
    else countWrapper.classList.add('hidden');
  }

  // Client-side sorting fallback/enhancement
  if (state.filters.sort === 'rating_desc') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (state.filters.sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (state.filters.sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (state.filters.sort === 'name_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.filters.sort === 'name_desc') {
    list.sort((a, b) => b.name.localeCompare(a.name));
  }

  renderProducts(list);
}

function setDealFilter(dealType) {
  state.filters.deal = dealType;
  document.querySelectorAll('.deal-filter-pill').forEach((pill) => {
    const isTarget = (pill.dataset.dealFilter || 'all') === dealType;
    if (isTarget) {
      pill.className = 'deal-filter-pill active px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 text-white border border-indigo-500 transition shadow-xs cursor-pointer';
    } else {
      pill.className = 'deal-filter-pill px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition shadow-xs cursor-pointer flex items-center gap-1.5';
    }
  });
  applyDealFilterAndRender();
}

async function openQuickView(productId, { updateHash = true } = {}) {
  let product = state.products.find((p) => p.id === productId);
  if (!product) {
    try {
      const data = await apiFetch(`/products/${productId}`);
      product = data.product;
    } catch {
      return;
    }
  }
  if (!product) return;

  if (updateHash) {
    updateHashForProduct(product.id);
  }

  const stock = stockInfo(product.stock);
  const VARIANTS = [
    { name: 'Triple Black', color: '#171717', border: '#171717' },
    { name: 'Smoke White', color: '#f3f4f6', border: '#d1d5db' },
    { name: 'Navy', color: '#1e3a5f', border: '#1e3a5f' },
  ];
  let selectedVariant = 'Triple Black';

  el.quickViewContent.innerHTML = `
    <!-- Top Details Section -->
    <div class="grid sm:grid-cols-2 gap-0 border-b border-slate-800 bg-slate-900 text-slate-100">
      <div class="aspect-square w-full bg-slate-950/40 flex flex-col items-center justify-center p-8 overflow-hidden relative">
        <span id="qvVariantBadge" class="absolute top-4 left-4 bg-slate-800/90 backdrop-blur text-[11px] font-semibold text-slate-200 border border-slate-700 px-2.5 py-1 rounded-full shadow-sm">
          ${selectedVariant}
        </span>
        <img src="${product.image}" alt="${escapeHtml(product.name)}" class="w-full h-full object-contain transition-transform duration-300 hover:scale-105" onerror="this.onerror=null; this.src='https://placehold.co/600x600/1e293b/94a3b8?text=Product+Image';" />
      </div>

      <div class="p-7 flex flex-col justify-between">
        <div>
          <span class="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest">${product.category}</span>
          <h2 class="text-white font-bold text-2xl tracking-tight mt-1.5 leading-snug">${escapeHtml(product.name)}</h2>
          <div class="flex items-center gap-2 mt-2 text-xs">
            <span class="text-slate-200 font-semibold flex items-center gap-1"><span class="text-amber-400">★</span> <span id="qvRatingScore">${product.rating.toFixed(1)}</span></span>
            <span class="text-slate-400" id="qvRatingReviewCount">(Customer Ratings)</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed font-normal">${escapeHtml(product.description)}</p>

          <!-- Color Swatch Selector Pills -->
          <div class="mt-4 pt-4 border-t border-slate-800">
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="text-slate-200 font-medium">Color: <strong id="qvVariantLabel" class="text-slate-200 font-bold">${selectedVariant}</strong></span>
            </div>
            <div class="flex items-center gap-2" id="qvVariantSwatches">
              ${VARIANTS.map(
                (v) => `
                <button type="button" data-variant="${v.name}" class="swatch-pill ${v.name === selectedVariant ? 'active' : ''} flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500 cursor-pointer">
                  <span class="w-3.5 h-3.5 rounded-full shrink-0" style="background-color: ${v.color}; border: 1px solid ${v.border}"></span>
                  <span>${v.name}</span>
                </button>`
              ).join('')}
            </div>
          </div>
        </div>

        <div class="mt-5">
          <div class="flex items-center gap-3 pt-4 border-t border-slate-800">
            <span class="text-white font-extrabold text-3xl tracking-tight">${formatCurrency(product.price)}</span>
            <span class="stock-pill ${stock.cls}">${stock.dot ? '<span class="pulse-dot"></span>' : ''}${stock.label}</span>
          </div>

          <!-- Buyhatke Deal Verdict & Set Price Drop Alert Button -->
          <div class="mt-3 space-y-2.5">
            <div id="qvDealVerdictBanner">
              <div class="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs animate-pulse flex items-center gap-2">
                <span>⏳</span> Analyzing 90-day price trend…
              </div>
            </div>
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <button type="button" id="qvPriceAlertBtn" class="price-alert-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full cursor-pointer transition shadow-xs">
                <span>🔔</span> Set Price Drop Alert
              </button>
              <button type="button" id="qvShareDealBtn" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full cursor-pointer transition shadow-xs" title="Copy shareable deal dossier to clipboard">
                <span>📋</span> Share Deal
              </button>
            </div>
          </div>

          <!-- Community Deal Upvote / Downvote -->
          <div id="qvDealSentimentWrap" class="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5 text-slate-300 font-medium">
              <span>💬</span>
              <span>Is this a good price?</span>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="qvVoteYesBtn" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition active:scale-95 cursor-pointer" title="Vote this price is good">
                <span>👍</span> <span>Yes (<span id="qvVoteYesCount">24</span>)</span>
              </button>
              <button type="button" id="qvVoteNoBtn" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition active:scale-95 cursor-pointer" title="Vote this price is overpriced">
                <span>👎</span> <span>No (<span id="qvVoteNoCount">3</span>)</span>
              </button>
            </div>
          </div>

          <!-- Buyhatke Multi-Store Comparison Section directly beneath price -->
          <div class="mt-4 pt-4 border-t border-slate-800" id="qvStoreComparisonSection">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-1.5">
                <span class="text-xs">🏷️</span>
                <h4 class="font-bold text-xs uppercase tracking-wider text-white">Compare Across Stores</h4>
              </div>
              <div class="flex items-center gap-1 text-[11px] text-slate-400">
                <span id="qvStoreCacheStatus">Checked across <strong id="qvStoreCountNum" class="text-slate-200">4</strong> stores • <span id="qvStoreUpdatedText">Live</span></span>
                <button type="button" id="qvLivePriceSyncBtn" class="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-500 text-black font-bold text-[11px] shadow-2xs transition hover:scale-105 active:scale-95 cursor-pointer" title="Simulate live scraper sync across retailers">
                  <span id="qvSyncIcon" class="inline-block transition-transform">⚡</span> <span>Check Live Prices</span>
                </button>
              </div>
            </div>

            <!-- Live Scraping Simulation Compact Progress Overlay -->
            <div id="qvLiveSyncOverlay" class="hidden mb-3 p-3.5 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-md animate-fade-in">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span class="text-xs font-bold uppercase tracking-wider text-amber-400">Live Scraping Engine Active</span>
                </div>
                <span id="qvSyncPercent" class="text-[10px] font-mono font-bold text-slate-300">0%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2.5">
                <div id="qvSyncProgressBar" class="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300 ease-out" style="width: 15%"></div>
              </div>
              <div class="space-y-1 font-mono text-[11px]" id="qvSyncSteps">
                <div id="syncStep1" class="text-slate-400 flex items-center justify-between">
                  <span>Checking Amazon catalog...</span>
                  <span class="text-slate-500 font-bold" id="syncStatus1">Pending</span>
                </div>
                <div id="syncStep2" class="text-slate-400 flex items-center justify-between">
                  <span>Querying Flipkart listings...</span>
                  <span class="text-slate-500 font-bold" id="syncStatus2">Pending</span>
                </div>
                <div id="syncStep3" class="text-slate-400 flex items-center justify-between">
                  <span>Verifying Croma inventory...</span>
                  <span class="text-slate-500 font-bold" id="syncStatus3">Pending</span>
                </div>
              </div>
            </div>

            <!-- Summary Callout -->
            <div id="qvStoreSummaryCallout" class="mb-2.5 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-200 flex items-center gap-2">
              <span>💡</span>
              <span id="qvStoreCalloutText" class="font-medium">Finding best retail price…</span>
            </div>

            <!-- Comparison List / Table -->
            <div id="qvStorePricesList" class="space-y-2.5">
              <!-- Dynamically populated -->
            </div>
          </div>

          <div class="flex items-center gap-2 mt-4">
            <div class="flex items-center gap-1.5">
              <button id="qvDecrease" class="qty-btn" aria-label="Decrease quantity">−</button>
              <span id="qvQty" class="w-6 text-center font-semibold text-sm text-slate-200">1</span>
              <button id="qvIncrease" class="qty-btn" aria-label="Increase quantity">+</button>
            </div>
            <button id="qvAddToCart" ${product.stock <= 0 ? 'disabled' : ''}
              class="flex-1 font-semibold rounded-full py-3 text-xs uppercase tracking-wider transition ${
                product.stock <= 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-sm'
              }">
              ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button type="button" id="qvShareDealSecondaryBtn" class="px-3.5 py-3 rounded-full border border-slate-700 hover:border-slate-500 bg-slate-800 text-slate-200 hover:text-white transition flex items-center justify-center text-xs font-semibold gap-1.5 cursor-pointer shadow-xs shrink-0" title="Copy shareable deal dossier to clipboard">
              <span>📋</span> <span>Share Deal</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Buyhatke Price Intelligence & 90-Day Trend Section -->
    <div class="p-7 bg-slate-900 text-slate-100 border-b border-slate-800">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 class="font-bold text-sm tracking-wide text-white uppercase">Buyhatke Deal Advisor &amp; Price Trend</h3>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">Real-time 90-day market price trend &amp; consumer intelligence</p>
        </div>
        <div id="qvPriceStatsPills" class="flex flex-wrap items-center gap-2 text-xs">
          <span class="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] animate-pulse">Loading trend…</span>
        </div>
      </div>

      <!-- Price History Milestone Metric Cards -->
      <div id="qvMilestoneCards" class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div class="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 shadow-2xs text-slate-100">
          <div class="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span class="font-medium">All-Time Lowest</span>
            <span class="text-xs">📉</span>
          </div>
          <div id="qvMilestoneLowestPrice" class="text-base font-extrabold text-emerald-400">₹--</div>
          <div id="qvMilestoneLowestDate" class="text-[10px] text-slate-400 mt-0.5">Recorded: --</div>
        </div>
        <div class="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 shadow-2xs text-slate-100">
          <div class="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span class="font-medium">All-Time Highest</span>
            <span class="text-xs">📈</span>
          </div>
          <div id="qvMilestoneHighestPrice" class="text-base font-extrabold text-white">₹--</div>
          <div id="qvMilestoneHighestDate" class="text-[10px] text-slate-400 mt-0.5">Recorded: --</div>
        </div>
        <div class="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 shadow-2xs text-slate-100">
          <div class="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span class="font-medium">Average Price</span>
            <span class="text-xs">⚖️</span>
          </div>
          <div id="qvMilestoneAvgPrice" class="text-base font-extrabold text-slate-100">₹--</div>
          <div id="qvMilestoneAvgSavings" class="text-[10px] text-slate-400 mt-0.5">Last 90 Days</div>
        </div>
      </div>

      <!-- Chart Container with Range Switcher -->
      <div class="chart-card p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xs">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-1.5">
            <span class="text-xs">📈</span>
            <span class="text-xs font-bold text-white uppercase tracking-wider">Price Trend</span>
          </div>
          <!-- Time Range Selector Pills: [1M], [3M], [6M], [All] -->
          <div id="chartRangeSwitcher" class="inline-flex items-center p-0.5 bg-slate-900 border border-slate-700 rounded-full text-xs font-semibold">
            <button type="button" class="chart-range-pill px-2.5 py-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer" data-range="1M">1M</button>
            <button type="button" class="chart-range-pill px-2.5 py-1 rounded-full active bg-slate-700 text-white shadow-xs font-bold transition cursor-pointer" data-range="3M">3M</button>
            <button type="button" class="chart-range-pill px-2.5 py-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer" data-range="6M">6M</button>
            <button type="button" class="chart-range-pill px-2.5 py-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer" data-range="ALL">All</button>
          </div>
        </div>
        <div class="relative w-full h-48 sm:h-56">
          <canvas id="priceHistoryChart"></canvas>
        </div>
      </div>

      <!-- AI Price Prediction Forecaster Card -->
      <div id="qvAiForecastCard" class="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-2xs animate-fade-in text-slate-100">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-bold shadow-2xs">🤖</span>
            <h4 class="text-slate-200 font-semibold text-xs tracking-wider uppercase">AI Price Prediction Forecaster</h4>
            <span class="text-[10px] font-bold bg-slate-900 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">Neural Forecast</span>
          </div>
          <span id="qvForecastConfidenceBadge" class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800">
            Analyzing…
          </span>
        </div>
        
        <p id="qvForecastMessage" class="text-xs font-semibold text-slate-100 leading-snug">
          Analyzing 90-day price trends and seasonal patterns…
        </p>

        <!-- Mini Progress / Confidence Bar -->
        <div class="mt-2.5">
          <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Forecast Confidence Level</span>
            <span id="qvForecastConfidencePercent" class="font-mono font-bold text-slate-200">--%</span>
          </div>
          <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div id="qvForecastConfidenceBar" class="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" style="width: 0%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Reviews Section -->
    <div class="p-7 bg-slate-900 text-slate-100">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="font-bold text-lg text-white">Customer Reviews</h3>
          <p class="text-xs text-slate-400 mt-0.5">Verified purchaser feedback &amp; ratings</p>
        </div>
        <button type="button" id="qvToggleReviewFormBtn" class="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-slate-700 hover:border-slate-500 bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer">Write a Review</button>
      </div>

      <!-- Rating Breakdown Bars -->
      <div class="grid sm:grid-cols-3 gap-6 items-center p-5 bg-slate-800/80 rounded-2xl border border-slate-700/80 mb-6 text-slate-100">
        <div class="text-center sm:border-r sm:border-slate-700 sm:pr-4">
          <div class="text-4xl font-extrabold text-white tracking-tight" id="qvBigRating">${product.rating.toFixed(1)}</div>
          <div class="text-amber-400 text-base mt-1">★★★★★</div>
          <p class="text-[11px] text-slate-400 mt-1" id="qvTotalReviewsCount">Loading reviews…</p>
        </div>
        <div class="sm:col-span-2 space-y-1.5 text-xs" id="qvBreakdownBars"></div>
      </div>

      <!-- Fakespot-Style Review Health & Authenticity Card -->
      <div id="qvAuthenticityCard" class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 mb-6 shadow-2xs text-slate-100">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
              🛡️
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-xs uppercase tracking-wider text-white">Review Health &amp; Authenticity</h4>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">AI Verified</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Fakespot-grade natural language parsing &amp; bot pattern detection</p>
            </div>
          </div>
          <!-- Authenticity Grade Badge -->
          <div id="qvAuthenticityGradeBadge" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold self-start sm:self-auto">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span id="qvAuthenticityGradeText">Grade A (94% Verified Organic)</span>
          </div>
        </div>

        <!-- Sentiment Distribution Bar -->
        <div class="mt-4">
          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
            <span>Sentiment Breakdown</span>
            <span id="qvSentimentRatioText" class="font-mono text-[10px]">80% Positive • 15% Neutral • 5% Critical</span>
          </div>
          <div class="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-900">
            <div id="qvSentimentBarPositive" class="h-full bg-emerald-500 transition-all duration-500" style="width: 80%" title="80% Positive"></div>
            <div id="qvSentimentBarNeutral" class="h-full bg-amber-400 transition-all duration-500" style="width: 15%" title="15% Neutral"></div>
            <div id="qvSentimentBarCritical" class="h-full bg-rose-500 transition-all duration-500" style="width: 5%" title="5% Critical"></div>
          </div>
          <div class="flex items-center gap-4 text-[10px] text-slate-400 mt-2">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Positive (<span id="qvPctPositive">80</span>%)</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Neutral (<span id="qvPctNeutral">15</span>%)</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Critical (<span id="qvPctCritical">5</span>%)</span>
          </div>
        </div>

        <!-- Pros & Cons Summary -->
        <div class="mt-4 pt-3.5 border-t border-slate-700/80 grid sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
            <div class="font-bold text-emerald-300 text-[11px] uppercase tracking-wider flex items-center gap-1 mb-1">
              <span>✓</span> Highlights / Pros
            </div>
            <p id="qvReviewPros" class="text-emerald-300/90 leading-relaxed text-[11px]">
              Analyzing verified purchaser comments…
            </p>
          </div>
          <div class="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60">
            <div class="font-bold text-rose-300 text-[11px] uppercase tracking-wider flex items-center gap-1 mb-1">
              <span>✕</span> Caveats / Cons
            </div>
            <p id="qvReviewCons" class="text-rose-300/90 leading-relaxed text-[11px]">
              Extracting recurring critical feedback points…
            </p>
          </div>
        </div>
      </div>

      <!-- Add Review Form (collapsible / toggleable) -->
      <form id="qvReviewForm" class="hidden bg-slate-800/90 p-5 rounded-2xl border border-slate-700 mb-6 space-y-3 animate-fade-in text-slate-100">
        <h4 class="font-bold text-sm text-white">Share Your Experience</h4>
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="text-[11px] font-medium text-slate-300">Your Name</label>
            <input required type="text" id="qvReviewAuthor" placeholder="e.g. Jordan Smith" class="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="text-[11px] font-medium text-slate-300">Rating</label>
            <select id="qvReviewRating" class="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 text-slate-100 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="5">★★★★★ (5 - Excellent)</option>
              <option value="4">★★★★☆ (4 - Very Good)</option>
              <option value="3">★★★☆☆ (3 - Average)</option>
              <option value="2">★★☆☆☆ (2 - Fair)</option>
              <option value="1">★☆☆☆☆ (1 - Poor)</option>
            </select>
          </div>
        </div>
        <div>
          <label class="text-[11px] font-medium text-slate-300">Review Comments</label>
          <textarea required id="qvReviewComment" rows="3" placeholder="What did you like or dislike about this product?" class="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 text-slate-100 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button type="button" id="qvCancelReviewBtn" class="text-xs px-3.5 py-1.5 rounded-full border border-slate-700 hover:bg-slate-700 text-slate-300 cursor-pointer">Cancel</button>
          <button type="submit" id="qvSubmitReviewBtn" class="text-xs font-semibold px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow-sm cursor-pointer">Submit Review</button>
        </div>
      </form>

      <!-- Reviews Cards List -->
      <div id="qvReviewsList" class="space-y-3"></div>
    </div>`;

  let qty = 1;
  const qtyLabel = $('qvQty');
  $('qvDecrease').addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    qtyLabel.textContent = qty;
  });
  $('qvIncrease').addEventListener('click', () => {
    qty = Math.min(product.stock, qty + 1);
    qtyLabel.textContent = qty;
  });

  // Color Swatch Selection
  const swatchesWrap = $('qvVariantSwatches');
  const variantLabel = $('qvVariantLabel');
  const variantBadge = $('qvVariantBadge');
  swatchesWrap.querySelectorAll('.swatch-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      selectedVariant = pill.dataset.variant;
      swatchesWrap.querySelectorAll('.swatch-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      variantLabel.textContent = selectedVariant;
      variantBadge.textContent = selectedVariant;
    });
  });

  const addBtn = $('qvAddToCart');
  if (addBtn && product.stock > 0) {
    addBtn.addEventListener('click', () => {
      addToCart(product.id, qty, selectedVariant, addBtn);
    });
  }

  // Reviews Loading & Form Logic
  const breakdownContainer = $('qvBreakdownBars');
  const reviewsListContainer = $('qvReviewsList');
  const reviewForm = $('qvReviewForm');
  const toggleFormBtn = $('qvToggleReviewFormBtn');
  const cancelFormBtn = $('qvCancelReviewBtn');

  if (state.user && $('qvReviewAuthor')) {
    $('qvReviewAuthor').value = state.user.name;
  }

  toggleFormBtn.addEventListener('click', () => reviewForm.classList.toggle('hidden'));
  cancelFormBtn.addEventListener('click', () => reviewForm.classList.add('hidden'));

  function renderReviewsData(data) {
    const { reviews = [], stats = {} } = data;
    const totalCount = stats.totalReviews || reviews.length || 0;
    const avgScore = stats.averageRating || product.rating || 5.0;

    $('qvBigRating').textContent = avgScore.toFixed(1);
    $('qvRatingScore').textContent = avgScore.toFixed(1);
    $('qvTotalReviewsCount').textContent = `Based on ${totalCount} review${totalCount === 1 ? '' : 's'}`;

    const counts = stats.ratingCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    breakdownContainer.innerHTML = [5, 4, 3, 2, 1]
      .map((star) => {
        const c = counts[star] || 0;
        const pct = totalCount > 0 ? Math.round((c / totalCount) * 100) : 0;
        return `
          <div class="flex items-center gap-2">
            <span class="w-7 text-right font-medium text-slate-300">${star}★</span>
            <div class="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
              <div class="rating-bar-fill bg-indigo-500 h-full rounded-full" style="width: ${pct}%"></div>
            </div>
            <span class="w-8 text-slate-400 text-[11px] text-right">${c}</span>
          </div>`;
      })
      .join('');

    // Fakespot Review Health & Authenticity Card Population
    const health = getReviewProsCons(product);
    if ($('qvAuthenticityGradeText')) {
      $('qvAuthenticityGradeText').textContent = health.grade;
    }
    if ($('qvSentimentRatioText')) {
      $('qvSentimentRatioText').textContent = `${health.pos}% Positive • ${health.neu}% Neutral • ${health.crit}% Critical`;
    }
    if ($('qvSentimentBarPositive')) $('qvSentimentBarPositive').style.width = `${health.pos}%`;
    if ($('qvSentimentBarNeutral')) $('qvSentimentBarNeutral').style.width = `${health.neu}%`;
    if ($('qvSentimentBarCritical')) $('qvSentimentBarCritical').style.width = `${health.crit}%`;
    if ($('qvPctPositive')) $('qvPctPositive').textContent = health.pos;
    if ($('qvPctNeutral')) $('qvPctNeutral').textContent = health.neu;
    if ($('qvPctCritical')) $('qvPctCritical').textContent = health.crit;
    if ($('qvReviewPros')) $('qvReviewPros').textContent = health.pros;
    if ($('qvReviewCons')) $('qvReviewCons').textContent = health.cons;

    if (reviews.length === 0) {
      reviewsListContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No reviews yet. Be the first to share your thoughts!</p>`;
    } else {
      reviewsListContainer.innerHTML = reviews
        .map(
          (r) => `
          <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shadow-sm space-y-1.5 text-slate-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-xs text-white">${escapeHtml(r.author)}</span>
                <span class="text-[10px] font-medium bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">Verified Buyer</span>
              </div>
              <span class="text-[11px] text-slate-400">${new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <div class="text-amber-400 text-xs">${renderStars(r.rating)}</div>
            <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(r.comment)}</p>
          </div>`
        )
        .join('');
    }
  }

  // Fetch reviews from server
  apiFetch(`/products/${product.id}/reviews`)
    .then(renderReviewsData)
    .catch(() => {
      reviewsListContainer.innerHTML = `<p class="text-xs text-neutral-400 text-center py-4">Unable to load reviews right now.</p>`;
    });

  // Submit review form
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = $('qvSubmitReviewBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const payload = {
        author: $('qvReviewAuthor').value.trim(),
        rating: Number($('qvReviewRating').value),
        comment: $('qvReviewComment').value.trim(),
      };
      const res = await apiFetch(`/products/${product.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast('Review submitted! Thank you for your feedback.', 'success');
      reviewForm.reset();
      reviewForm.classList.add('hidden');

      // Refresh reviews list
      const freshData = await apiFetch(`/products/${product.id}/reviews`);
      renderReviewsData(freshData);
    } catch (err) {
      toast(err.message || 'Failed to submit review.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Review';
    }
  });

  // Wire Price Alert button & load price history graph
  const alertBtn = $('qvPriceAlertBtn');
  if (alertBtn) {
    alertBtn.addEventListener('click', () => {
      openPriceAlertModal(product);
    });
  }

  // Wire Live Price Sync simulation button
  const liveSyncBtn = $('qvLivePriceSyncBtn') || $('qvRefreshPricesBtn');
  if (liveSyncBtn) {
    liveSyncBtn.addEventListener('click', () => {
      handleLivePriceSync(product);
    });
  }

  // Wire Community Deal sentiment buttons
  renderDealSentimentUI(product.id);
  const yesVoteBtn = $('qvVoteYesBtn');
  const noVoteBtn = $('qvVoteNoBtn');
  if (yesVoteBtn) {
    yesVoteBtn.addEventListener('click', () => handleDealVote(product.id, 'yes'));
  }
  if (noVoteBtn) {
    noVoteBtn.addEventListener('click', () => handleDealVote(product.id, 'no'));
  }

  // Wire Share Deal dossier buttons
  const shareHandler = () => handleShareDeal(product);
  const shareBtn = $('qvShareDealBtn');
  if (shareBtn) shareBtn.addEventListener('click', shareHandler);
  const shareSecBtn = $('qvShareDealSecondaryBtn');
  if (shareSecBtn) shareSecBtn.addEventListener('click', shareHandler);

  loadStoreComparison(product.id, false);
  loadPriceHistoryAndChart(product.id, product.price);

  openModal(el.quickViewModal);
}

function checkUrlHash() {
  const productId = getProductIdFromHash();
  if (productId) {
    openQuickView(productId, { updateHash: false });
  } else {
    if (!el.quickViewModal.classList.contains('hidden')) {
      closeModal(el.quickViewModal);
    }
  }
}

/* =========================================================
   BUYHATKE CONSUMER INTELLIGENCE & PRICE TRACKER
   ========================================================= */
function getDealSentiment(productId) {
  const key = `ca_deal_votes_${productId}`;
  const saved = safeParseJSON(localStorage.getItem(key));
  if (saved && typeof saved.yes === 'number' && typeof saved.no === 'number') {
    return saved;
  }
  const seedYes = 15 + ((productId * 7) % 25);
  const seedNo = 2 + ((productId * 3) % 7);
  const initial = { yes: seedYes, no: seedNo };
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
}

function getUserDealVote(productId) {
  return localStorage.getItem(`ca_user_vote_${productId}`) || null;
}

function handleDealVote(productId, voteType) {
  const currentVotes = getDealSentiment(productId);
  const userVote = getUserDealVote(productId);

  if (userVote === voteType) {
    currentVotes[voteType] = Math.max(0, currentVotes[voteType] - 1);
    localStorage.removeItem(`ca_user_vote_${productId}`);
    toast('Vote removed.', 'info');
  } else {
    if (userVote) {
      currentVotes[userVote] = Math.max(0, currentVotes[userVote] - 1);
    }
    currentVotes[voteType] = (currentVotes[voteType] || 0) + 1;
    localStorage.setItem(`ca_user_vote_${productId}`, voteType);
    toast(voteType === 'yes' ? 'Thanks! Marked as a good deal 👍' : 'Feedback recorded! Marked as overpriced 👎', 'success');
  }

  localStorage.setItem(`ca_deal_votes_${productId}`, JSON.stringify(currentVotes));
  renderDealSentimentUI(productId);
}

function renderDealSentimentUI(productId) {
  const yesCountEl = $('qvVoteYesCount');
  const noCountEl = $('qvVoteNoCount');
  const yesBtn = $('qvVoteYesBtn');
  const noBtn = $('qvVoteNoBtn');

  if (!yesCountEl || !noCountEl || !yesBtn || !noBtn) return;

  const votes = getDealSentiment(productId);
  const userVote = getUserDealVote(productId);

  yesCountEl.textContent = votes.yes;
  noCountEl.textContent = votes.no;

  if (userVote === 'yes') {
    yesBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-600 bg-emerald-600 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer';
    noBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition active:scale-95 cursor-pointer';
  } else if (userVote === 'no') {
    yesBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition active:scale-95 cursor-pointer';
    noBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-600 bg-rose-600 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer';
  } else {
    yesBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium transition active:scale-95 cursor-pointer';
    noBtn.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium transition active:scale-95 cursor-pointer';
  }
}

function activateAffiliateCashback(storeName = 'Partner Store', storeUrl = '#') {
  if (!el.cashbackOverlayModal) return;

  if (el.cashbackStoreName) el.cashbackStoreName.textContent = storeName;
  if (el.cashbackMessage) {
    el.cashbackMessage.innerHTML = `Applying exclusive <strong class="text-emerald-700 font-bold">4% cashback cookie</strong> for <span class="font-bold text-neutral-900">${escapeHtml(storeName)}</span> → Redirecting…`;
  }
  if (el.cashbackProgressBar) {
    el.cashbackProgressBar.style.transitionDuration = '0ms';
    el.cashbackProgressBar.style.width = '0%';
  }

  el.cashbackOverlayModal.classList.remove('hidden');

  setTimeout(() => {
    if (el.cashbackProgressBar) {
      el.cashbackProgressBar.style.transitionDuration = '1200ms';
      el.cashbackProgressBar.style.width = '100%';
    }
  }, 20);

  setTimeout(() => {
    el.cashbackOverlayModal.classList.add('hidden');
    if (el.cashbackProgressBar) {
      el.cashbackProgressBar.style.width = '0%';
    }
    toast(`Redirected to ${storeName} with 4% cashback cookie applied!`, 'success');
    const targetUrl = (storeUrl && storeUrl !== '#')
      ? storeUrl
      : `https://www.${encodeURIComponent(storeName.toLowerCase().replace(/[^a-z0-9]/g, ''))}.com`;
    window.open(targetUrl, '_blank');
  }, 1200);
}

function findProductFromLinkOrKeyword(rawInput) {
  if (!rawInput || !state.products || state.products.length === 0) return null;
  const input = rawInput.trim().toLowerCase();

  const idMatch = input.match(/[?&]id=(\d+)/i) || input.match(/\/products\/(\d+)/i);
  if (idMatch) {
    const id = parseInt(idMatch[1], 10);
    const prod = state.products.find((p) => p.id === id);
    if (prod) return prod;
  }

  let decoded = input;
  try {
    decoded = decodeURIComponent(input);
  } catch {}

  const cleanTokens = decoded
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?&=#_\-+.\s]+/)
    .filter((t) => t.length >= 3 && !['http', 'https', 'www', 'com', 'org', 'in', 'amazon', 'flipkart', 'croma', 'reliance', 'digital', 'item', 'product', 'dp', 'gp'].includes(t));

  for (const prod of state.products) {
    const pName = prod.name.toLowerCase();
    if (input.includes(pName) || pName.includes(input)) {
      return prod;
    }
  }

  let bestProduct = null;
  let maxScore = 0;

  for (const prod of state.products) {
    const nameLower = prod.name.toLowerCase();
    const catLower = prod.category.toLowerCase();
    const descLower = (prod.description || '').toLowerCase();
    let score = 0;

    for (const token of cleanTokens) {
      if (nameLower.includes(token)) score += 3;
      else if (catLower.includes(token)) score += 2;
      else if (descLower.includes(token)) score += 1;
    }

    if (input.includes('headphone') && (nameLower.includes('headphone') || catLower.includes('electronics'))) score += 5;
    if (input.includes('watch') && nameLower.includes('watch')) score += 5;
    if (input.includes('speaker') && nameLower.includes('speaker')) score += 5;
    if (input.includes('camera') && nameLower.includes('camera')) score += 5;
    if (input.includes('jacket') && nameLower.includes('jacket')) score += 5;
    if (input.includes('sneaker') && nameLower.includes('sneaker')) score += 5;
    if ((input.includes('bag') || input.includes('crossbody')) && nameLower.includes('bag')) score += 5;
    if (input.includes('sunglass') && nameLower.includes('sunglass')) score += 5;
    if (input.includes('coffee') && nameLower.includes('coffee')) score += 5;
    if (input.includes('candle') && nameLower.includes('candle')) score += 5;
    if (input.includes('lamp') && nameLower.includes('lamp')) score += 5;
    if (input.includes('blanket') && nameLower.includes('blanket')) score += 5;

    if (score > maxScore) {
      maxScore = score;
      bestProduct = prod;
    }
  }

  if (maxScore >= 2 && bestProduct) {
    return bestProduct;
  }

  for (const prod of state.products) {
    const words = prod.name.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (w.length >= 4 && input.includes(w)) {
        return prod;
      }
    }
  }

  return null;
}

async function handleLinkCompare(forcedInput = null) {
  const inputVal = forcedInput !== null ? forcedInput : (el.linkCompareInput ? el.linkCompareInput.value : '');
  const raw = (inputVal || '').trim();
  if (!raw) return;

  const btn = el.linkCompareBtn || $('linkCompareBtn');
  const feedback = el.linkCompareFeedback;
  const originalBtnHtml = btn ? btn.innerHTML : null;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="w-3.5 h-3.5 animate-spin text-white inline-block" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Scanning retailers...</span>
    `;
  }

  if (feedback) {
    feedback.className = 'text-[11px] mt-2 font-medium text-indigo-300 block animate-fade-in';
    feedback.innerHTML = `<span class="inline-block animate-spin mr-1">⚡</span> Querying live store listings across Amazon, Flipkart & Croma…`;
  }

  // 900ms simulated scanning latency
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (btn && originalBtnHtml) {
    btn.disabled = false;
    btn.innerHTML = originalBtnHtml;
  }

  const matched = findProductFromLinkOrKeyword(raw);

  if (matched) {
    if (feedback) {
      feedback.className = 'text-[11px] mt-2 font-medium text-emerald-400 block animate-fade-in';
      feedback.innerHTML = `✓ Matched <strong>${escapeHtml(matched.name)}</strong>! Opening multi-store comparison…`;
    }
    toast(`Product matched: ${matched.name}. Opening comparison…`, 'success');
    openQuickView(matched.id);
  } else {
    if (feedback) {
      feedback.className = 'text-[11px] mt-2 font-medium text-amber-300 block animate-fade-in';
      feedback.innerHTML = `Could not match a product for that link. Try keywords like "headphones", "watch", or "blanket".`;
    }
    toast('No matching product found. Try a product keyword or store link.', 'info');
  }
}

function updateSmartCartSplit() {
  const banner = el.cartSmartSplitBanner;
  const titleEl = el.cartSmartSplitTitle;
  const savingsEl = el.cartSmartSplitSavings;
  const textEl = el.cartSmartSplitText;
  const allocationEl = el.cartSmartSplitAllocation;

  if (!banner) return;

  if (state.cart.length === 0) {
    banner.classList.add('hidden');
    return;
  }

  const RETAILERS = [
    { name: 'Amazon', key: 'amazon' },
    { name: 'Flipkart', key: 'flipkart' },
    { name: 'Croma', key: 'croma' },
  ];

  let singleStoreTotals = { Amazon: 0, Flipkart: 0, Croma: 0 };
  let smartSplitTotal = 0;
  let splitBreakdown = {};
  RETAILERS.forEach((r) => { splitBreakdown[r.name] = { count: 0, total: 0, items: [] }; });

  state.cart.forEach((item) => {
    const qty = item.quantity || 1;
    const basePrice = item.price || 0;
    const lowestIdx = (item.id - 1) % 3;

    RETAILERS.forEach((ret, idx) => {
      let multiplier;
      if (idx === lowestIdx) multiplier = 0.92;
      else if (idx === (lowestIdx + 1) % 3) multiplier = 0.98;
      else multiplier = 1.06;

      const storeItemPrice = Math.round(basePrice * multiplier * 100) / 100;
      singleStoreTotals[ret.name] += storeItemPrice * qty;
    });

    const cheapestStoreName = RETAILERS[lowestIdx].name;
    const cheapestItemPrice = Math.round(basePrice * 0.92 * 100) / 100;
    smartSplitTotal += cheapestItemPrice * qty;

    splitBreakdown[cheapestStoreName].count += qty;
    splitBreakdown[cheapestStoreName].total += cheapestItemPrice * qty;
    splitBreakdown[cheapestStoreName].items.push(item.name);
  });

  const singleStoreEntries = Object.entries(singleStoreTotals);
  singleStoreEntries.sort((a, b) => a[1] - b[1]);
  const bestSingleStore = singleStoreEntries[0];
  const bestSingleCost = bestSingleStore[1];

  let additionalSavings = Math.round((bestSingleCost - smartSplitTotal) * 100) / 100;

  if (additionalSavings <= 0) {
    const secondBest = singleStoreEntries[1] ? singleStoreEntries[1][1] : (bestSingleCost * 1.08);
    additionalSavings = Math.round((secondBest - smartSplitTotal) * 100) / 100;
  }

  const activeStores = Object.keys(splitBreakdown).filter((name) => splitBreakdown[name].count > 0);
  const storesLabel = activeStores.length > 1
    ? activeStores.slice(0, 2).join(' & ')
    : `${activeStores[0] || 'Amazon'} & Flipkart`;

  if (titleEl) {
    titleEl.textContent = `Smart Split: Buy across ${storesLabel}`;
  }
  if (savingsEl) {
    savingsEl.textContent = `Save +${formatCurrency(additionalSavings)}!`;
  }
  if (textEl) {
    textEl.innerHTML = `Buy across <strong>${storesLabel}</strong> to save an additional <strong>${formatCurrency(additionalSavings)}</strong> vs buying everything from a single retailer (${bestSingleStore[0]}: ${formatCurrency(bestSingleCost)}).`;
  }

  if (allocationEl) {
    allocationEl.innerHTML = activeStores
      .map((sName) => {
        const info = splitBreakdown[sName];
        return `
          <div class="flex items-center justify-between py-0.5">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span><strong>${escapeHtml(sName)}:</strong> ${info.count} item${info.count > 1 ? 's' : ''}</span>
            </span>
            <span class="font-bold text-neutral-800">${formatCurrency(info.total)}</span>
          </div>
        `;
      })
      .join('');
  }

  banner.classList.remove('hidden');
}

function simulateExtensionScan() {
  const btn = el.simulateExtensionScanBtn;
  const status1 = $('extSimStatus-1');
  const status2 = $('extSimStatus-2');
  const result = el.extSimResult;

  if (btn) btn.disabled = true;
  if (result) result.classList.add('hidden');

  if (status1) {
    status1.textContent = 'Testing…';
    status1.className = 'text-amber-400 font-mono animate-pulse';
  }
  if (status2) {
    status2.textContent = 'Queued';
    status2.className = 'text-neutral-500 font-mono';
  }

  setTimeout(() => {
    if (status1) {
      status1.textContent = 'Expired (0%)';
      status1.className = 'text-neutral-500 font-mono line-through';
    }
    if (status2) {
      status2.textContent = 'Testing…';
      status2.className = 'text-amber-400 font-mono animate-pulse';
    }

    setTimeout(() => {
      if (status2) {
        status2.textContent = '✓ Applied (-20%)';
        status2.className = 'text-emerald-400 font-mono font-bold';
      }
      if (result) {
        result.classList.remove('hidden');
      }
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Test Again ↻';
      }
      toast('Extension successfully applied best coupon BUYHATKE20 (-20%)!', 'success');
    }, 700);
  }, 700);
}

function installExtension() {
  const btn = el.installExtensionActionBtn;
  const btnText = el.installExtensionBtnText;
  if (!btn) return;

  btn.disabled = true;
  btn.className = 'w-full sm:w-auto bg-emerald-600 text-white font-semibold text-xs px-6 py-3 rounded-full transition shadow-sm flex items-center justify-center gap-2 cursor-default';
  if (btnText) btnText.textContent = '✓ Added to Chrome (Active)';

  fireConfetti(el.confettiCanvas);
  toast('🎉 Buyhatke Assistant added to Chrome! Price tracking active on Amazon & Flipkart.', 'success');
  setTimeout(() => {
    closeModal(el.extensionPreviewModal);
  }, 1600);
}

/* =========================================================
   REVIEW HEALTH & AUTHENTICITY (FAKESPOT ENGINE)
   ========================================================= */
function getReviewProsCons(product) {
  const name = String((product && product.name) || '').toLowerCase();
  const cat = String((product && product.category) || '').toLowerCase();

  if (name.includes('headphone') || cat.includes('audio') || name.includes('speaker')) {
    return {
      pros: 'Superb Active Noise Cancellation (ANC), punchy low-end acoustic curve, ultra-comfortable memory foam earcups, up to 32-hour battery life.',
      cons: 'Hard-shell carrying case is somewhat bulky; multi-point Bluetooth pairing occasionally delays by 2 seconds.',
      grade: 'Grade A (95% Verified Organic)',
      pos: 84,
      neu: 12,
      crit: 4,
    };
  }
  if (name.includes('watch')) {
    return {
      pros: 'Extremely accurate optical PPG heart-rate tracking, vibrant high-contrast AMOLED display, lightweight aircraft-grade aluminum casing.',
      cons: 'Proprietary pogo-pin magnetic charging puck; sleep stage tracking may take a night to calibrate accurately.',
      grade: 'Grade A (93% Verified Organic)',
      pos: 81,
      neu: 14,
      crit: 5,
    };
  }
  if (name.includes('camera')) {
    return {
      pros: 'Rock-solid 4K60 video stabilization, wide-angle lens with zero barrel distortion, water-resistant chassis without an external housing.',
      cons: 'Shooting in continuous 4K HDR warms the device; high-bitrate recording requires UHS-II micro-SD cards.',
      grade: 'Grade A (92% Verified Organic)',
      pos: 79,
      neu: 15,
      crit: 6,
    };
  }
  if (cat.includes('fashion')) {
    return {
      pros: 'Heavyweight organic cotton weave, tailored modern silhouette that holds shape after wash, non-bleeding reactive dye.',
      cons: 'Slightly snug around upper chest/shoulders; recommend ordering one size up for an oversized drape.',
      grade: 'Grade A (91% Verified Organic)',
      pos: 78,
      neu: 16,
      crit: 6,
    };
  }
  return {
    pros: 'Minimalist Scandinavian craftsmanship, eco-friendly sustainable materials, ergonomic footprint that fits compact spaces.',
    cons: 'Hand-wash recommended to preserve matte glaze finish; subtle natural variations in texture between batches.',
    grade: 'Grade A (94% Verified Organic)',
    pos: 82,
    neu: 13,
    crit: 5,
  };
}

/* =========================================================
   LIVE PRICE SYNC SIMULATION ENGINE
   ========================================================= */
let isLivePriceSyncRunning = false;

async function handleLivePriceSync(product) {
  if (!product || isLivePriceSyncRunning) return;
  const syncBtn = $('qvLivePriceSyncBtn') || $('qvRefreshPricesBtn');
  const overlay = $('qvLiveSyncOverlay');
  const percentEl = $('qvSyncPercent');
  const progressEl = $('qvSyncProgressBar');
  const step1 = $('syncStep1');
  const step2 = $('syncStep2');
  const step3 = $('syncStep3');
  const status1 = $('syncStatus1');
  const status2 = $('syncStatus2');
  const status3 = $('syncStatus3');
  const syncIcon = $('qvSyncIcon');

  isLivePriceSyncRunning = true;
  if (syncBtn) {
    syncBtn.disabled = true;
    syncBtn.classList.add('opacity-75', 'cursor-not-allowed');
  }
  if (syncIcon) syncIcon.classList.add('animate-spin');

  if (overlay) {
    overlay.classList.remove('hidden');
    if (percentEl) percentEl.textContent = '15%';
    if (progressEl) progressEl.style.width = '15%';
    if (status1) { status1.textContent = 'Scanning…'; status1.className = 'text-amber-400 font-bold'; }
    if (status2) { status2.textContent = 'Pending'; status2.className = 'text-neutral-500 font-bold'; }
    if (status3) { status3.textContent = 'Pending'; status3.className = 'text-neutral-500 font-bold'; }
    if (step1) step1.className = 'text-amber-300 flex items-center justify-between';
    if (step2) step2.className = 'text-neutral-400 flex items-center justify-between';
    if (step3) step3.className = 'text-neutral-400 flex items-center justify-between';
  }

  // Step 1: Checking Amazon catalog... (0 -> 450ms)
  await new Promise((r) => setTimeout(r, 450));
  if (status1) { status1.textContent = '✓ Verified'; status1.className = 'text-emerald-400 font-bold'; }
  if (step1) step1.className = 'text-emerald-400 flex items-center justify-between';
  if (percentEl) percentEl.textContent = '50%';
  if (progressEl) progressEl.style.width = '50%';
  if (status2) { status2.textContent = 'Scanning…'; status2.className = 'text-amber-400 font-bold'; }
  if (step2) step2.className = 'text-amber-300 flex items-center justify-between';

  // Step 2: Querying Flipkart listings... (450ms -> 950ms)
  await new Promise((r) => setTimeout(r, 500));
  if (status2) { status2.textContent = '✓ Verified'; status2.className = 'text-emerald-400 font-bold'; }
  if (step2) step2.className = 'text-emerald-400 flex items-center justify-between';
  if (percentEl) percentEl.textContent = '80%';
  if (progressEl) progressEl.style.width = '80%';
  if (status3) { status3.textContent = 'Scanning…'; status3.className = 'text-amber-400 font-bold'; }
  if (step3) step3.className = 'text-amber-300 flex items-center justify-between';

  // Step 3: Verifying Croma inventory... (950ms -> 1500ms)
  await new Promise((r) => setTimeout(r, 550));
  if (status3) { status3.textContent = '✓ Verified'; status3.className = 'text-emerald-400 font-bold'; }
  if (step3) step3.className = 'text-emerald-400 flex items-center justify-between';
  if (percentEl) percentEl.textContent = '100%';
  if (progressEl) progressEl.style.width = '100%';

  // Fluctuation: apply minor realistic change (-₹200 to +₹100)
  const deltas = [-200, -150, -100, 50, 100];
  const delta = deltas[Math.floor(Math.random() * deltas.length)];

  // Update lowest store price in memory
  if (activeLowestStore) {
    activeLowestStore.current_price = Math.max(10, Math.round((activeLowestStore.current_price + delta) * 100) / 100);
  }

  // Update Chart.js latest point (Today)
  if (priceChartInstance && priceChartInstance.data && priceChartInstance.data.datasets.length > 0) {
    const ds = priceChartInstance.data.datasets[0];
    if (ds.data && ds.data.length > 0) {
      const lastIdx = ds.data.length - 1;
      const updatedP = Math.max(10, Math.round((ds.data[lastIdx] + delta) * 100) / 100);
      ds.data[lastIdx] = updatedP;
      priceChartInstance.update({ duration: 400, easing: 'easeInOutQuad' });
    }
  }

  // Update store cache text to "Live ⚡"
  const updatedText = $('qvStoreUpdatedText');
  if (updatedText) {
    updatedText.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-bold">Verified Just Now ⚡</span>`;
  }

  // Re-render store list rows
  await loadStoreComparison(product.id, false);

  toast('All store prices verified live!', 'success');
  if (typeof fireConfetti === 'function') {
    fireConfetti(el.confettiCanvas || $('confettiCanvas'));
  }

  setTimeout(() => {
    if (overlay) overlay.classList.add('hidden');
    isLivePriceSyncRunning = false;
    if (syncBtn) {
      syncBtn.disabled = false;
      syncBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
    if (syncIcon) syncIcon.classList.remove('animate-spin');
  }, 400);
}

let activeLowestStore = null;

function handleShareDeal(product) {
  if (!product) return;
  const store = activeLowestStore || {
    store_name: 'Amazon',
    current_price: Math.round(product.price * 0.92 * 100) / 100,
    bank_offer: '10% Instant Bank Discount on HDFC Cards',
  };

  const storeName = store.store_name || store.name || 'Amazon';
  const price = store.current_price || store.price || product.price;
  const bankOffer = store.bank_offer || 'Instant Bank Discount Available';
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const dossierText = [
    `🔥 CODEALPHA DEAL DOSSIER: ${product.name}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💰 Lowest Retail Price: ${formatCurrency(price)} (on ${storeName})`,
    `💳 Best Bank Offer: ${bankOffer}`,
    `📅 Verified Date: ${todayStr}`,
    `🛒 Tracked live on CodeAlpha / Buyhatke Platform: http://localhost:3000/#${product.id}`,
  ].join('\n');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(dossierText)
      .then(() => {
        toast('Deal summary copied to clipboard! Ready to share.', 'success');
      })
      .catch(() => {
        fallbackCopy(dossierText);
      });
  } else {
    fallbackCopy(dossierText);
  }
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('Deal summary copied to clipboard! Ready to share.', 'success');
  } catch {
    toast('Deal summary copied to clipboard! Ready to share.', 'success');
  }
}

function getStoreBadgeClass(storeName = '') {
  const norm = String(storeName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (norm.includes('amazon')) return 'store-badge-amazon';
  if (norm.includes('flipkart')) return 'store-badge-flipkart';
  if (norm.includes('croma')) return 'store-badge-croma';
  if (norm.includes('reliance')) return 'store-badge-reliancedigital';
  return 'bg-neutral-800 text-white';
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


async function loadStoreComparison(productId, isRefresh = false) {
  const listContainer = $('qvStorePricesList');
  const countEl = $('qvStoreCountNum');
  const calloutEl = $('qvStoreCalloutText');
  const updatedTextEl = $('qvStoreUpdatedText');
  const statusContainer = $('qvStoreCacheStatus');
  const refreshBtn = $('qvRefreshPricesBtn');
  const refreshIcon = $('qvRefreshIcon');

  if (!listContainer) return;

  if (isRefresh) {
    if (refreshBtn) refreshBtn.disabled = true;
    if (refreshIcon) refreshIcon.classList.add('spinning-refresh');
    if (statusContainer) {
      statusContainer.innerHTML = `<span class="text-neutral-500 font-medium animate-pulse">Checking live store prices…</span>`;
    }
    // Quick loading skeleton
    listContainer.innerHTML = [1, 2, 3]
      .map(
        () => `
        <div class="p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/40 animate-pulse flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="skeleton h-6 w-16 rounded-md"></div>
            <div class="space-y-1">
              <div class="skeleton h-3.5 w-24 rounded"></div>
              <div class="skeleton h-2.5 w-32 rounded"></div>
            </div>
          </div>
          <div class="skeleton h-8 w-28 rounded-xl"></div>
        </div>`
      )
      .join('');

    await new Promise((r) => setTimeout(r, 700));
  }

  try {
    const data = await apiFetch(`/products/${productId}/compare`);
    const stores = Array.isArray(data.stores) && data.stores.length > 0
      ? data.stores
      : (Array.isArray(data.storePrices) ? data.storePrices : []);

    activeLowestStore = stores.find((s) => s.isLowest) || stores[0] || null;

    if (countEl) countEl.textContent = stores.length || 4;
    if (calloutEl) {
      const rawCallout = data.callout || data.summaryCallout || 'Comparing live prices across retailers.';
      calloutEl.textContent = rawCallout.replace(/\$([0-9,.]+)/g, '₹$1').replace(/\$/g, '₹');
    }

    if (stores.length === 0) {
      listContainer.innerHTML = `<p class="text-xs text-slate-400 py-3 text-center">No cross-store prices found.</p>`;
    } else {
      listContainer.innerHTML = stores
        .map((store) => {
          const badgeClass = getStoreBadgeClass(store.store_name);
          const isLowest = Boolean(store.isLowest);
          const currentPrice = store.current_price || store.price;
          const originalPrice = store.original_price;
          const discountPct = store.discount_percent || (originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);
          const deliveryTime = store.delivery_time || store.delivery_info || 'Standard 2-3 Days';
          const sellerRating = store.seller_rating || 4.5;
          const bankOffer = store.bank_offer || '';

          return `
            <div class="store-row ${isLowest ? 'store-row-lowest border-emerald-500/50 bg-emerald-950/30 ring-1 ring-emerald-500' : 'bg-slate-800/80 border-slate-700/80'} p-3.5 rounded-2xl border transition-all duration-200 hover:shadow-sm">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="store-badge-pill flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/90 shadow-sm shrink-0">
                    ${getStoreLogoSvg(store.store_name, 'w-5 h-5')}
                    <span class="font-bold text-xs text-white tracking-tight">${escapeHtml(store.store_name)}</span>
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-extrabold text-sm text-white">${formatCurrency(currentPrice)}</span>
                      ${originalPrice ? `<del class="text-xs text-slate-400 font-normal">${formatCurrency(originalPrice)}</del>` : ''}
                      ${discountPct > 0 ? `<span class="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">${discountPct}% OFF</span>` : ''}
                      ${isLowest ? `<span class="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-xs"><span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>Lowest Price Guaranteed</span>` : ''}
                    </div>
                    <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                      <span>${escapeHtml(deliveryTime)}</span>
                      <span>&middot;</span>
                      <span class="text-amber-400 font-semibold flex items-center gap-0.5">★ ${sellerRating}</span>
                    </div>
                  </div>
                </div>

                <button type="button" data-store-name="${escapeHtml(store.store_name)}" data-store-url="${escapeHtml(store.store_url || '#')}" class="visit-store-btn text-xs font-semibold px-4 py-2 rounded-xl border ${isLowest ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-500' : 'border-slate-700 text-slate-200 bg-slate-800 hover:border-slate-500 hover:bg-slate-700 hover:text-white'} transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                  Visit Store →
                </button>
              </div>

              ${bankOffer ? `
                <div class="mt-2.5 pt-2 border-t border-slate-700/80 flex items-center gap-1.5 text-[11px] text-indigo-300 bg-indigo-950/40 border border-indigo-800/60 px-2.5 py-1 rounded-lg">
                  <span class="text-xs">💳</span>
                  <span class="font-medium">${escapeHtml(bankOffer)}</span>
                </div>
              ` : ''}
            </div>`;
        })
        .join('');

      // Wire affiliate cashback overlay trigger to Visit Store buttons
      listContainer.querySelectorAll('.visit-store-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const sName = btn.dataset.storeName || 'Partner Store';
          const sUrl = btn.dataset.storeUrl || '#';
          activateAffiliateCashback(sName, sUrl);
        });
      });
    }

    if (isRefresh) {
      if (statusContainer) {
        statusContainer.innerHTML = `<span class="text-emerald-700 font-semibold">✓ All store prices up to date</span>`;
      }
      toast('✓ All store prices up to date', 'success');
      setTimeout(() => {
        if (statusContainer) {
          statusContainer.innerHTML = `Live across <strong id="qvStoreCountNum" class="text-neutral-700">${stores.length}</strong> stores • <span id="qvStoreUpdatedText">Updated just now</span>`;
        }
      }, 2500);
    } else {
      if (updatedTextEl) updatedTextEl.textContent = 'Live';
    }
  } catch (err) {
    listContainer.innerHTML = `<p class="text-xs text-neutral-400 py-3 text-center">Unable to load comparison right now.</p>`;
  } finally {
    if (refreshBtn) refreshBtn.disabled = false;
    if (refreshIcon) refreshIcon.classList.remove('spinning-refresh');
  }
}

async function loadPriceHistoryAndChart(productId, fallbackPrice = 0) {
  const verdictBannerWrap = $('qvDealVerdictBanner');
  const statsWrap = $('qvPriceStatsPills');
  const canvas = $('priceHistoryChart');
  if (!canvas) return;

  try {
    const data = await apiFetch(`/products/${productId}/history`);
    const history = Array.isArray(data.history) ? data.history : [];
    const lowest = typeof data.lowestPrice === 'number' ? data.lowestPrice : fallbackPrice;
    const highest = typeof data.highestPrice === 'number' ? data.highestPrice : fallbackPrice;
    const current = typeof data.currentPrice === 'number' ? data.currentPrice : fallbackPrice;
    const average = typeof data.averagePrice === 'number' ? data.averagePrice : fallbackPrice;
    const isGreat = Boolean(data.isGreatDeal);

    // 1. Buyhatke Deal Verdict Dynamic Banner
    if (verdictBannerWrap) {
      if (isGreat) {
        verdictBannerWrap.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3 shadow-xs">
            <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shrink-0">🔥</div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-900">Buyhatke Verdict: Worth Buying Now</span>
                <span class="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">🔥 Best Price</span>
              </div>
              <p class="text-xs text-emerald-800 mt-1 leading-relaxed">
                Current price (${formatCurrency(current)}) is close to the 90-day all-time low of ${formatCurrency(lowest)}. Save vs 90-day average (${formatCurrency(average)}). Excellent value — grab it before price rebounds!
              </p>
            </div>
          </div>
        `;
      } else {
        verdictBannerWrap.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3 shadow-xs">
            <div class="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0">⏳</div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-amber-900">Buyhatke Verdict: Wait for Sales</span>
                <span class="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">⏳ Price Drop Expected</span>
              </div>
              <p class="text-xs text-amber-800 mt-1 leading-relaxed">
                Current price (${formatCurrency(current)}) is higher than the 90-day lowest price of ${formatCurrency(lowest)}. We recommend setting a price alert to be notified when it drops during sales.
              </p>
            </div>
          </div>
        `;
      }
    }

    const phmVerdictWrap = $('phmDealVerdictBanner');
    if (phmVerdictWrap) {
      if (isGreat) {
        phmVerdictWrap.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3 shadow-xs">
            <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shrink-0">🔥</div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">Buyhatke Verdict: Best Time to Buy</span>
                <span class="text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full">🔥 Best Time to Buy</span>
              </div>
              <p class="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                Current price (${formatCurrency(current)}) is close to the 90-day all-time low of ${formatCurrency(lowest)}. Save vs 90-day average (${formatCurrency(average)}). Excellent value — grab it before price rebounds!
              </p>
            </div>
          </div>
        `;
      } else {
        phmVerdictWrap.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3 shadow-xs">
            <div class="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0">⏳</div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">Buyhatke Verdict: Wait for Upcoming Sale</span>
                <span class="text-[10px] font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">⏳ Wait for Upcoming Sale</span>
              </div>
              <p class="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                Current price (${formatCurrency(current)}) is higher than the 90-day lowest price of ${formatCurrency(lowest)}. We recommend setting a price alert to be notified when it drops during sales.
              </p>
            </div>
          </div>
        `;
      }
    }

    // 2. Statistical Label Pills (Lowest Ever, Highest Ever, Average Price, Current Price, and Target Alert if set)
    const savedTarget = localStorage.getItem(`ca_target_alert_${productId}`);
    const targetPriceNum = savedTarget ? parseFloat(savedTarget) : null;
    const hasTargetPrice = targetPriceNum !== null && !isNaN(targetPriceNum) && targetPriceNum > 0;

    if (statsWrap) {
      statsWrap.innerHTML = `
        <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-semibold">Lowest Ever: ${formatCurrency(lowest)}</span>
        <span class="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-medium">Highest Ever: ${formatCurrency(highest)}</span>
        <span class="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200 text-[11px] font-medium">Average Price: ${formatCurrency(average)}</span>
        <span class="px-2.5 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-semibold">Current: ${formatCurrency(current)}</span>
        ${hasTargetPrice ? `<span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold flex items-center gap-1"><span>🎯 Target Alert:</span> <span>${formatCurrency(targetPriceNum)}</span></span>` : ''}
      `;
    }

    // 2b. Price History Milestone Metric Cards
    const lowestPt = history.find((pt) => pt.price === lowest) || {};
    const lowestDate = lowestPt.date || '35 days ago';
    const highestPt = history.find((pt) => pt.price === highest) || {};
    const highestDate = highestPt.date || '70 days ago';

    if ($('qvMilestoneLowestPrice')) $('qvMilestoneLowestPrice').textContent = formatCurrency(lowest);
    if ($('qvMilestoneLowestDate')) $('qvMilestoneLowestDate').textContent = `Recorded: ${lowestDate}`;
    if ($('phmLowestPrice')) $('phmLowestPrice').textContent = formatCurrency(lowest);
    if ($('phmLowestDate')) $('phmLowestDate').textContent = lowestDate;

    if ($('qvMilestoneHighestPrice')) $('qvMilestoneHighestPrice').textContent = formatCurrency(highest);
    if ($('qvMilestoneHighestDate')) $('qvMilestoneHighestDate').textContent = `Recorded: ${highestDate}`;
    if ($('phmHighestPrice')) $('phmHighestPrice').textContent = formatCurrency(highest);
    if ($('phmHighestDate')) $('phmHighestDate').textContent = highestDate;

    if ($('qvMilestoneAvgPrice')) $('qvMilestoneAvgPrice').textContent = formatCurrency(average);
    if ($('phmAveragePrice')) $('phmAveragePrice').textContent = formatCurrency(average);
    
    const diff = Math.round((average - current) * 100) / 100;
    if ($('qvMilestoneAvgSavings')) {
      if (diff > 0) {
        $('qvMilestoneAvgSavings').innerHTML = `<span class="text-emerald-700 font-semibold">Save ${formatCurrency(diff)} vs avg</span>`;
      } else if (diff < 0) {
        $('qvMilestoneAvgSavings').innerHTML = `<span class="text-amber-700 font-semibold">+${formatCurrency(Math.abs(diff))} above avg</span>`;
      } else {
        $('qvMilestoneAvgSavings').textContent = 'Equal to 90-day avg';
      }
    }
    if ($('phmAverageDiff')) {
      if (diff > 0) {
        $('phmAverageDiff').innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-semibold">Save ${formatCurrency(diff)} vs avg</span>`;
      } else if (diff < 0) {
        $('phmAverageDiff').innerHTML = `<span class="text-amber-600 dark:text-amber-400 font-semibold">+${formatCurrency(Math.abs(diff))} above avg</span>`;
      } else {
        $('phmAverageDiff').textContent = 'Equal to 90D avg';
      }
    }

    // 2c. AI Price Prediction Forecaster Card & Mini Confidence Bar
    const forecastMsgEl = $('qvForecastMessage');
    const forecastBadgeEl = $('qvForecastConfidenceBadge');
    const forecastBarEl = $('qvForecastConfidenceBar');
    const forecastPercentEl = $('qvForecastConfidencePercent');

    let forecastText = '';
    let confidenceVal = 92;
    let tone = 'emerald';

    if (current <= lowest * 1.05) {
      forecastText = '✅ Best Time to Buy (92% Confidence — Unlikely to drop further)';
      confidenceVal = 92;
      tone = 'emerald';
    } else if (current > average) {
      forecastText = '⏳ Wait (81% Confidence — Likely to drop during upcoming festive sale)';
      confidenceVal = 81;
      tone = 'amber';
    } else {
      forecastText = '⚖️ Fair Price (74% Confidence — Moderate deal, buy if urgently needed)';
      confidenceVal = 74;
      tone = 'neutral';
    }

    if (forecastMsgEl) forecastMsgEl.textContent = forecastText;
    if (forecastPercentEl) forecastPercentEl.textContent = `${confidenceVal}%`;
    if ($('phmForecastMessage')) $('phmForecastMessage').textContent = forecastText;
    if ($('phmForecastConfidencePercent')) $('phmForecastConfidencePercent').textContent = `${confidenceVal}%`;

    if (forecastBadgeEl) {
      if (tone === 'emerald') {
        forecastBadgeEl.className = 'text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300';
        forecastBadgeEl.textContent = `${confidenceVal}% Confidence • Best Price`;
      } else if (tone === 'amber') {
        forecastBadgeEl.className = 'text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300';
        forecastBadgeEl.textContent = `${confidenceVal}% Confidence • Wait for Sales`;
      } else {
        forecastBadgeEl.className = 'text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-300';
        forecastBadgeEl.textContent = `${confidenceVal}% Confidence • Fair Price`;
      }
    }

    if ($('phmForecastConfidenceBadge')) {
      if (tone === 'emerald') {
        $('phmForecastConfidenceBadge').className = 'text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 self-start sm:self-auto';
        $('phmForecastConfidenceBadge').textContent = `${confidenceVal}% Confidence • Best Time to Buy`;
      } else if (tone === 'amber') {
        $('phmForecastConfidenceBadge').className = 'text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 self-start sm:self-auto';
        $('phmForecastConfidenceBadge').textContent = `${confidenceVal}% Confidence • Wait for Upcoming Sale`;
      } else {
        $('phmForecastConfidenceBadge').className = 'text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-slate-800 text-neutral-800 dark:text-slate-200 border border-neutral-300 dark:border-slate-700 self-start sm:self-auto';
        $('phmForecastConfidenceBadge').textContent = `${confidenceVal}% Confidence • Fair Price`;
      }
    }

    if (forecastBarEl) {
      forecastBarEl.style.width = `${confidenceVal}%`;
      forecastBarEl.className = `h-full rounded-full transition-all duration-700 ease-out ${
        tone === 'emerald' ? 'bg-emerald-600' : (tone === 'amber' ? 'bg-amber-500' : 'bg-neutral-800')
      }`;
    }
    if ($('phmForecastConfidenceBar')) {
      $('phmForecastConfidenceBar').style.width = `${confidenceVal}%`;
      $('phmForecastConfidenceBar').className = `h-full rounded-full transition-all duration-700 ease-out ${
        tone === 'emerald' ? 'bg-emerald-500' : (tone === 'amber' ? 'bg-amber-500' : 'bg-slate-600')
      }`;
    }

    // 3. Render Minimalist Chart.js Line Graph with Points for Lowest, Highest, and Average
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not available yet.');
      return;
    }

    if (window.trendChart) {
      window.trendChart.destroy();
      window.trendChart = null;
    }
    if (priceChartInstance) {
      priceChartInstance.destroy();
      priceChartInstance = null;
    }

    const labels = history.map((pt) => pt.date || 'Recent');
    const prices = history.map((pt) => pt.price);

    const datasets = [
      {
        label: 'Market Price',
        data: prices,
        borderColor: isGreat ? '#059669' : '#2563eb',
        backgroundColor: isGreat ? 'rgba(5, 150, 105, 0.08)' : 'rgba(37, 99, 235, 0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: prices.map((p) => (p === lowest || p === highest ? 6 : 3)),
        pointHoverRadius: 7,
        pointBackgroundColor: prices.map((p) => (p === lowest ? '#059669' : (p === highest ? '#dc2626' : '#2563eb'))),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Average Price',
        data: Array(prices.length).fill(average),
        borderColor: '#9ca3af',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ];

    // If user has an active price drop alert threshold, render dashed horizontal target line
    if (hasTargetPrice) {
      datasets.push({
        label: `Target Alert (${formatCurrency(targetPriceNum)})`,
        data: Array(prices.length).fill(targetPriceNum),
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      });
    }

    const ctx = canvas.getContext('2d');
    priceChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              font: { family: 'Inter', size: 10 },
              color: '#737373',
            },
          },
          tooltip: {
            backgroundColor: '#171717',
            titleFont: { family: 'Inter', size: 11 },
            bodyFont: { family: 'Inter', size: 12, weight: 'bold' },
            padding: 9,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => {
                if (context.dataset.label && context.dataset.label.startsWith('Target Alert')) {
                  return `🎯 Target Price: ${formatCurrency(context.parsed.y)}`;
                }
                if (context.dataset.label === 'Average Price') {
                  return `Average Price: ${formatCurrency(context.parsed.y)}`;
                }
                const p = context.parsed.y;
                if (p === lowest) return `🔥 Lowest Ever: ${formatCurrency(p)}`;
                if (p === highest) return `⚠️ Highest Ever: ${formatCurrency(p)}`;
                return `Price: ${formatCurrency(p)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Inter', size: 10 },
              color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#8c8c8c',
              maxTicksLimit: 6,
            },
          },
          y: {
            grid: { color: document.documentElement.classList.contains('dark') ? '#1e293b' : '#f0f0f0' },
            ticks: {
              font: { family: 'Inter', size: 10 },
              color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#8c8c8c',
              callback: (val) => formatCurrency(val),
            },
          },
        },
      },
    });

    window.trendChart = priceChartInstance;

    currentChartContext = {
      history,
      productPrice: current,
      targetPriceNum: hasTargetPrice ? targetPriceNum : null,
      isGreat,
      lowest,
      highest,
      average,
    };

    // Wire interactive range switcher buttons [1M], [3M], [6M], [All]
    const rangeSwitcher = $('chartRangeSwitcher');
    if (rangeSwitcher) {
      rangeSwitcher.querySelectorAll('.chart-range-pill').forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          switchChartRange(btn.dataset.range);
        };
      });
    }

    const phmSwitcher = $('phmRangeSwitcher');
    if (phmSwitcher) {
      phmSwitcher.querySelectorAll('.phm-range-pill').forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          switchChartRange(btn.dataset.range);
        };
      });
    }
  } catch (err) {
    if (verdictBannerWrap) {
      verdictBannerWrap.innerHTML = `
        <div class="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900">
          ⏳ Average Price — Track price drop alerts for sales.
        </div>
      `;
    }
    if ($('phmDealVerdictBanner')) {
      $('phmDealVerdictBanner').innerHTML = `
        <div class="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900">
          ⏳ Average Price — Track price drop alerts for sales.
        </div>
      `;
    }
    if (statsWrap) {
      statsWrap.innerHTML = `<span class="px-2.5 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-semibold">Current: ${formatCurrency(fallbackPrice)}</span>`;
    }
    if ($('qvMilestoneLowestPrice')) $('qvMilestoneLowestPrice').textContent = formatCurrency(fallbackPrice);
    if ($('qvMilestoneHighestPrice')) $('qvMilestoneHighestPrice').textContent = formatCurrency(fallbackPrice);
    if ($('qvMilestoneAvgPrice')) $('qvMilestoneAvgPrice').textContent = formatCurrency(fallbackPrice);
    if ($('phmLowestPrice')) $('phmLowestPrice').textContent = formatCurrency(fallbackPrice);
    if ($('phmHighestPrice')) $('phmHighestPrice').textContent = formatCurrency(fallbackPrice);
    if ($('phmAveragePrice')) $('phmAveragePrice').textContent = formatCurrency(fallbackPrice);
    if ($('qvForecastMessage')) $('qvForecastMessage').textContent = '⚖️ Fair Price (74% Confidence — Moderate deal, buy if urgently needed)';
    if ($('qvForecastConfidencePercent')) $('qvForecastConfidencePercent').textContent = '74%';
    if ($('qvForecastConfidenceBar')) $('qvForecastConfidenceBar').style.width = '74%';
  }
}

function openPriceHistoryModal(productId) {
  const product = state.products.find((p) => p.id === productId);
  const modal = $('priceHistoryModal');
  if (!modal) return;

  if (product) {
    if ($('phmProductImg')) $('phmProductImg').src = product.image;
    if ($('phmProductTitle')) $('phmProductTitle').textContent = product.name;
    if ($('phmCurrentPrice')) $('phmCurrentPrice').textContent = formatCurrency(product.price);
    if ($('phmAlertProductId')) $('phmAlertProductId').value = product.id;
    if ($('phmAlertTargetPrice')) $('phmAlertTargetPrice').value = Math.round(product.price * 0.9);
    if ($('phmAlertEmail')) $('phmAlertEmail').value = state.user ? state.user.email : '';
  }

  openModal(modal);
  loadPriceHistoryAndChart(productId, product ? product.price : 0);
}

function openPriceAlertModal(product) {
  if (!product) return;
  const savedTarget = localStorage.getItem(`ca_target_alert_${product.id}`);
  const targetPrice = savedTarget ? parseFloat(savedTarget) : Math.max(1, Math.round(product.price * 0.9 * 100) / 100);

  if ($('priceAlertProductId')) $('priceAlertProductId').value = product.id;
  if ($('priceAlertProductTitle')) $('priceAlertProductTitle').textContent = product.name;
  if ($('priceAlertProductImg')) $('priceAlertProductImg').src = product.image;
  if ($('priceAlertCurrentPrice')) $('priceAlertCurrentPrice').textContent = formatCurrency(product.price);
  if ($('priceAlertTargetPrice')) $('priceAlertTargetPrice').value = targetPrice.toFixed(2);
  if ($('priceAlertSuggestedHint')) {
    $('priceAlertSuggestedHint').textContent = savedTarget
      ? `Current target: ${formatCurrency(targetPrice)} (Saved alert)`
      : `Suggested target: ${formatCurrency(targetPrice)} (10% lower than current)`;
  }
  if ($('priceAlertEmail')) {
    $('priceAlertEmail').value = state.user ? state.user.email : '';
  }

  openModal(el.priceAlertModal);
}

async function handlePriceAlertSubmit(e) {
  e.preventDefault();
  const btn = $('savePriceAlertBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Setting alert…';
  }

  const productId = Number($('priceAlertProductId').value);
  const targetPrice = Number($('priceAlertTargetPrice').value);
  const email = $('priceAlertEmail').value.trim();

  try {
    await apiFetch('/alerts', {
      method: 'POST',
      body: JSON.stringify({ productId, targetPrice, email }),
    });
  } catch (err) {
    // Ignore server error and still persist locally
  }

  localStorage.setItem(`ca_target_alert_${productId}`, targetPrice.toString());
  closeModal(el.priceAlertModal);
  toast(`Alert set! Target threshold line added at ${formatCurrency(targetPrice)}`, 'success');

  // Immediately re-render chart to reflect the dashed target annotation line
  const prod = state.products.find((p) => p.id === productId);
  loadPriceHistoryAndChart(productId, prod ? prod.price : 0);

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<span>🔔</span> Set Price Alert';
  }
}

async function handlePhmAlertSubmit(e) {
  if (e) e.preventDefault();
  const btn = $('phmAlertSubmitBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Setting Alert…</span>';
  }

  const productId = Number($('phmAlertProductId').value);
  const targetPrice = parseFloat($('phmAlertTargetPrice').value);
  const email = ($('phmAlertEmail').value || '').trim();

  if (!productId || isNaN(targetPrice) || targetPrice <= 0 || !email) {
    toast('Please enter a valid target price and email address.', 'info');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>Set Price Drop Alert</span>';
    }
    return;
  }

  try {
    await apiFetch('/alerts', {
      method: 'POST',
      body: JSON.stringify({ productId, targetPrice, email }),
    });
  } catch (err) {
    // Fallback if network or already handled
  }

  localStorage.setItem(`ca_target_alert_${productId}`, targetPrice.toString());
  toast(`🔔 Price Drop Alert set! We will notify ${email} when price drops below ${formatCurrency(targetPrice)}.`, 'success');

  // Immediately re-render chart to reflect the dashed target annotation line
  const prod = state.products.find((p) => p.id === productId);
  loadPriceHistoryAndChart(productId, prod ? prod.price : 0);

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<span>Set Price Drop Alert</span>';
  }
}

function fireConfetti(canvas) {
  if (!canvas) return;
  canvas.classList.remove('hidden');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#171717'];
  for (let i = 0; i < 70; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.4,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      rotation: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 8,
      opacity: 1,
    });
  }

  const startTime = performance.now();
  function loop(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vrot;
      if (elapsed > 1800) {
        p.opacity = Math.max(0, 1 - (elapsed - 1800) / 700);
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (elapsed < 2500) {
      requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.add('hidden');
    }
  }
  requestAnimationFrame(loop);
}

let isRunningAutoCoupon = false;

async function runAutoApplyCoupons(triggerBtn) {
  if (isRunningAutoCoupon) return;
  if (!state.cart || state.cart.length === 0) {
    toast('Your cart is empty. Add items first!', 'info');
    return;
  }

  isRunningAutoCoupon = true;
  if (triggerBtn) {
    triggerBtn.disabled = true;
    triggerBtn.classList.add('coupon-scanning');
  }

  // Reset scanner modal state
  openModal(el.couponScannerModal);
  if (el.scannerProgressBar) el.scannerProgressBar.style.width = '0%';
  if (el.scannerProgressPercent) el.scannerProgressPercent.textContent = '0%';
  if (el.scannerStatusLabel) el.scannerStatusLabel.textContent = 'Initializing coupon queue…';
  if (el.scannerSubtext) el.scannerSubtext.textContent = 'Scanning verified discount codes…';
  if (el.scannerResultBanner) el.scannerResultBanner.classList.add('hidden');
  if (el.scannerDoneBtn) el.scannerDoneBtn.classList.add('hidden');

  // Reset queue items
  ['WELCOME10', 'SAVE10', 'BUYHATKE20', 'SUPER50'].forEach((code) => {
    const item = $(`scanItem-${code}`);
    const badge = $(`scanBadge-${code}`);
    if (item) {
      item.className = 'scanner-item p-3 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between transition-all duration-200';
    }
    if (badge) {
      badge.textContent = 'Waiting…';
      badge.className = 'scanner-badge text-[11px] font-semibold text-neutral-400';
    }
  });

  // Step 1: Testing WELCOME10 (0ms -> 600ms)
  const itemWelcome10 = $('scanItem-WELCOME10') || $('scanItem-SAVE10');
  const badgeWelcome10 = $('scanBadge-WELCOME10') || $('scanBadge-SAVE10');
  if (itemWelcome10) itemWelcome10.classList.add('scanner-testing');
  if (badgeWelcome10) badgeWelcome10.innerHTML = '<span>⚡ Testing…</span>';
  if (el.scannerStatusLabel) el.scannerStatusLabel.textContent = 'Testing WELCOME10 (10% off)…';
  if (el.scannerProgressBar) el.scannerProgressBar.style.width = '33%';
  if (el.scannerProgressPercent) el.scannerProgressPercent.textContent = '33%';

  await new Promise((r) => setTimeout(r, 600));
  if (itemWelcome10) {
    itemWelcome10.classList.remove('scanner-testing');
    itemWelcome10.classList.add('scanner-verified');
  }
  if (badgeWelcome10) badgeWelcome10.innerHTML = '<span>✓ Valid (10% Off)</span>';

  // Step 2: Testing BUYHATKE20 (600ms -> 1350ms)
  const itemBuyhatke = $('scanItem-BUYHATKE20');
  const badgeBuyhatke = $('scanBadge-BUYHATKE20');
  if (itemBuyhatke) itemBuyhatke.classList.add('scanner-testing');
  if (badgeBuyhatke) badgeBuyhatke.innerHTML = '<span>⚡ Testing…</span>';
  if (el.scannerStatusLabel) el.scannerStatusLabel.textContent = 'Testing BUYHATKE20 (20% Mega Deal)…';
  if (el.scannerProgressBar) el.scannerProgressBar.style.width = '66%';
  if (el.scannerProgressPercent) el.scannerProgressPercent.textContent = '66%';

  await new Promise((r) => setTimeout(r, 750));
  if (itemBuyhatke) {
    itemBuyhatke.classList.remove('scanner-testing');
    itemBuyhatke.classList.add('scanner-verified');
  }
  if (badgeBuyhatke) badgeBuyhatke.innerHTML = '<span>✓ Best Deal (20% Off)</span>';

  // Step 3: Testing SUPER50 (1350ms -> 1950ms)
  const itemSuper = $('scanItem-SUPER50');
  const badgeSuper = $('scanBadge-SUPER50');
  if (itemSuper) itemSuper.classList.add('scanner-testing');
  if (badgeSuper) badgeSuper.innerHTML = '<span>⚡ Testing…</span>';
  if (el.scannerStatusLabel) el.scannerStatusLabel.textContent = 'Testing SUPER50 (50% Special Voucher)…';
  if (el.scannerProgressBar) el.scannerProgressBar.style.width = '95%';
  if (el.scannerProgressPercent) el.scannerProgressPercent.textContent = '95%';

  await new Promise((r) => setTimeout(r, 600));
  if (itemSuper) {
    itemSuper.classList.remove('scanner-testing');
    itemSuper.classList.add('scanner-skipped');
  }
  if (badgeSuper) badgeSuper.innerHTML = '<span class="text-neutral-400">✕ Requires ₹1,000 cart</span>';

  // Step 4: Finalize at ~2.0s
  if (el.scannerProgressBar) el.scannerProgressBar.style.width = '100%';
  if (el.scannerProgressPercent) el.scannerProgressPercent.textContent = '100%';
  if (el.scannerStatusLabel) el.scannerStatusLabel.textContent = 'Scan complete! Applying best coupon…';
  await new Promise((r) => setTimeout(r, 150));

  // Pick BUYHATKE20 (highest valid discount)
  state.coupon = 'BUYHATKE20';
  renderCartDrawer();
  renderCheckoutSummary();
  if (el.couponInput) el.couponInput.value = 'BUYHATKE20';
  if (el.reviewCouponInput) el.reviewCouponInput.value = 'BUYHATKE20';
  if (el.reviewCouponStatus) {
    el.reviewCouponStatus.innerHTML = `<span class="text-emerald-700 font-semibold">✓ Best Deal Found: BUYHATKE20 applied (-20%)</span>`;
  }

  const { discount } = cartTotals();
  const savedStr = formatCurrency(discount);

  // Celebratory UI in modal
  if (el.scannerResultBanner) {
    el.scannerResultBanner.classList.remove('hidden');
    if (el.scannerResultTitle) el.scannerResultTitle.textContent = 'Best Deal Applied: BUYHATKE20';
    if (el.scannerResultSavings) el.scannerResultSavings.textContent = `You saved ${savedStr} with Buyhatke exclusive discount!`;
  }
  if (el.scannerDoneBtn) {
    el.scannerDoneBtn.classList.remove('hidden');
    el.scannerDoneBtn.onclick = () => closeModal(el.couponScannerModal);
  }

  // Fire confetti canvas animation
  fireConfetti(el.confettiCanvas);

  // Celebratory toast
  toast(`🎉 Auto-applied BUYHATKE20! Saved ${savedStr}`, 'success');

  if (triggerBtn) {
    triggerBtn.classList.remove('coupon-scanning');
    triggerBtn.innerHTML = `<span>✓</span> <span>BUYHATKE20 Applied (Saved ${savedStr})</span>`;
    triggerBtn.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-300');
  }
  isRunningAutoCoupon = false;
}

/* =========================================================
   CART
   ========================================================= */
function addToCart(productId, quantity = 1, variant = 'Triple Black', sourceBtn = null, openDrawer = true) {
  const product = state.products.find((p) => p.id === productId);
  if (!product) return;

  const existing = state.cart.find((item) => item.productId === productId && (item.variant || 'Triple Black') === variant);
  const currentQty = existing ? existing.quantity : 0;
  const newQty = Math.min(product.stock, currentQty + quantity);

  if (newQty <= currentQty && existing) {
    toast(`No more stock available for "${product.name}".`, 'error');
    return;
  }

  if (existing) {
    existing.quantity = newQty;
  } else {
    state.cart.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: newQty,
      stock: product.stock,
      variant: variant || 'Triple Black',
    });
  }

  persistCart();
  renderCartBadge();
  renderCartDrawer();
  if (sourceBtn) {
    morphAddToCartBtn(sourceBtn);
  }
  toast(`Added "${product.name}" (${variant}) to your cart.`);
  if (openDrawer) {
    openCart();
  }
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find((i) => i.productId === productId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    state.cart = state.cart.filter((i) => i.productId !== productId);
  } else if (item.quantity > item.stock) {
    item.quantity = item.stock;
    toast('Reached maximum available stock for this item.', 'info');
  }

  persistCart();
  renderCartBadge();
  renderCartDrawer();
}

function removeFromCart(productId) {
  const item = state.cart.find((i) => i.productId === productId);
  state.cart = state.cart.filter((i) => i.productId !== productId);
  persistCart();
  renderCartBadge();
  renderCartDrawer();
  if (item) toast(`Removed "${item.name}" from your cart.`, 'info');
}

function cartTotals() {
  const rawSubtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = Math.round(rawSubtotal * 100) / 100;
  let discountRate = 0;
  if (state.coupon === 'BUYHATKE20' || state.coupon === 'MEGA20') discountRate = 0.20;
  else if (state.coupon === 'SUPER50') discountRate = 0.25;
  else if (state.coupon === 'SAVE15') discountRate = 0.15;
  else if (state.coupon === 'SAVE10' || state.coupon === 'WELCOME10') discountRate = 0.10;
  else if (state.coupon === 'WELCOME5') discountRate = 0.05;

  const discount = discountRate > 0 ? Math.round(subtotal * discountRate * 100) / 100 : 0;
  const discountedSubtotal = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  const shipping = state.cart.length === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
  const total = Math.round((discountedSubtotal + tax + shipping) * 100) / 100;
  return { subtotal, discount, discountedSubtotal, shipping, tax, total, discountRate };
}

function renderCartBadge() {
  const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = el.cartCount || $('cartCount');
  const mobBadge = $('mobileCartBadge');
  if (totalQty > 0) {
    const txt = totalQty > 99 ? '99+' : totalQty;
    if (badge) {
      badge.textContent = txt;
      badge.classList.remove('hidden');
      badge.classList.add('flex');
      badge.classList.remove('badge-bounce', 'badge-pop');
      void badge.offsetWidth; // force reflow for animation restart
      badge.classList.add('badge-bounce');
    }
    if (mobBadge) {
      mobBadge.textContent = txt;
      mobBadge.classList.remove('hidden');
      mobBadge.classList.add('flex');
    }
  } else {
    if (badge) {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
    if (mobBadge) {
      mobBadge.classList.add('hidden');
      mobBadge.classList.remove('flex');
    }
  }
}

function cartItemHtml(item) {
  return `
    <div class="flex gap-3" data-cart-item="${item.productId}">
      <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0" onerror="this.onerror=null; this.src='https://placehold.co/600x600/f1f5f9/94a3b8?text=Product+Image';" />
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="text-sm font-semibold text-slate-100 truncate">${escapeHtml(item.name)}</h4>
            ${item.variant ? `<p class="text-[11px] text-slate-400 font-medium">${escapeHtml(item.variant)}</p>` : ''}
          </div>
          <button data-action="remove" data-id="${item.productId}" class="text-slate-400 hover:text-red-400 transition shrink-0 cursor-pointer" aria-label="Remove item">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9M19.228 5.79A48.11 48.11 0 0 0 12 5.25c-2.454 0-4.868.166-7.228.541m14.456 0L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397M4.772 5.79c1.15-.174 2.312-.32 3.478-.397m0 0V4.5a2.25 2.25 0 0 1 2.25-2.25h3a2.25 2.25 0 0 1 2.25 2.25v.878" /></svg>
          </button>
        </div>
        <p class="text-xs text-slate-400 mt-0.5">${formatCurrency(item.price)} each</p>
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center gap-2">
            <button data-action="decrease" data-id="${item.productId}" class="qty-btn">−</button>
            <span class="w-6 text-center text-sm font-semibold text-slate-200">${item.quantity}</span>
            <button data-action="increase" data-id="${item.productId}" class="qty-btn" ${item.quantity >= item.stock ? 'disabled' : ''}>+</button>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" data-action="save-for-later" data-id="${item.productId}" class="text-[11px] text-slate-400 hover:text-indigo-400 transition cursor-pointer">Save for later</button>
            <span class="text-sm font-bold text-white">${formatCurrency(item.price * item.quantity)}</span>
          </div>
        </div>
      </div>
    </div>`;
}

function renderCartDrawer() {
  if (state.cart.length === 0) {
    el.cartItems.classList.add('hidden');
    el.cartFooter.classList.add('hidden');
    el.cartEmptyState.classList.remove('hidden');
    el.cartEmptyState.classList.add('flex');
    if (el.cartSmartSplitBanner) el.cartSmartSplitBanner.classList.add('hidden');
    return;
  }

  el.cartEmptyState.classList.add('hidden');
  el.cartEmptyState.classList.remove('flex');
  el.cartItems.classList.remove('hidden');
  el.cartFooter.classList.remove('hidden');

  el.cartItems.innerHTML = state.cart.map(cartItemHtml).join('');

  el.cartItems.querySelectorAll('[data-action="increase"]').forEach((btn) =>
    btn.addEventListener('click', () => updateCartQuantity(Number(btn.dataset.id), 1))
  );
  el.cartItems.querySelectorAll('[data-action="decrease"]').forEach((btn) =>
    btn.addEventListener('click', () => updateCartQuantity(Number(btn.dataset.id), -1))
  );
  el.cartItems.querySelectorAll('[data-action="remove"]').forEach((btn) =>
    btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.id)))
  );
  el.cartItems.querySelectorAll('[data-action="save-for-later"]').forEach((btn) =>
    btn.addEventListener('click', () => saveForLater(Number(btn.dataset.id)))
  );

  const { subtotal, discount, discountedSubtotal, tax, shipping, total, discountRate } = cartTotals();
  el.cartSubtotal.textContent = formatCurrency(subtotal);
  el.cartTax.textContent = formatCurrency(tax);
  el.cartShipping.textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
  el.cartTotal.textContent = formatCurrency(total);

  if (discount > 0) {
    el.cartDiscountRow.classList.remove('hidden');
    el.cartDiscountRow.classList.add('flex');
    el.cartDiscount.textContent = `-${formatCurrency(discount)}`;
    el.couponInput.value = state.coupon;
    el.couponInput.disabled = true;
    el.applyCouponBtn.disabled = true;
    el.applyCouponBtn.classList.add('opacity-50');
    el.couponStatus.classList.remove('hidden');
    el.couponStatus.innerHTML = `
      <span class="text-emerald-700 font-medium flex items-center gap-1">
        <span>✓</span> <strong>${state.coupon}</strong> applied (-${Math.round(discountRate * 100)}%)
      </span>
      <button type="button" id="removeCouponBtn" class="text-neutral-500 hover:text-red-600 underline cursor-pointer text-[11px]">Remove</button>
    `;
    const removeBtn = $('removeCouponBtn');
    if (removeBtn) {
      removeBtn.addEventListener('click', handleRemoveCoupon);
    }
  } else {
    el.cartDiscountRow.classList.add('hidden');
    el.cartDiscountRow.classList.remove('flex');
    el.couponInput.disabled = false;
    el.applyCouponBtn.disabled = false;
    el.applyCouponBtn.classList.remove('opacity-50');
    el.couponStatus.classList.add('hidden');
    el.couponStatus.innerHTML = '';
  }

  const pct = Math.min(100, Math.round((discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const bar = $('freeShippingProgressBar');
  const pctText = $('freeShippingPercentText');
  const progText = $('freeShippingProgressText');

  if (bar) bar.style.width = `${pct}%`;
  if (pctText) pctText.textContent = `${pct}%`;

  if (shipping === 0) {
    if (el.freeShippingNote) el.freeShippingNote.textContent = "🎉 You've unlocked free express delivery!";
    if (progText) progText.innerHTML = "🎉 <strong>Free Express Delivery Unlocked!</strong>";
  } else {
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);
    if (el.freeShippingNote) el.freeShippingNote.textContent = `Add ${formatCurrency(remaining)} more for free delivery.`;
    if (progText) progText.innerHTML = `Add <span class="font-bold text-indigo-600 dark:text-indigo-400">${formatCurrency(remaining)}</span> more to unlock Free Express Delivery`;
  }

  updateSmartCartSplit();
}

function openCart() {
  // Closes any active product or comparison modal before opening the cart drawer
  ['quickViewModal', 'compareModal', 'authModal', 'checkoutModal', 'ordersModal', 'priceAlertModal', 'extensionPreviewModal'].forEach((id) => {
    const modal = $(id);
    if (modal && !modal.classList.contains('hidden')) closeModal(modal);
  });

  renderCartDrawer();
  const overlay = el.cartOverlay || $('cart-backdrop') || $('cartOverlay');
  const drawer = el.cartDrawer || $('cart-drawer') || $('cartDrawer');

  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.classList.add('open');
  }

  if (drawer) {
    drawer.classList.remove('translate-x-full', 'hidden');
    drawer.classList.add('translate-x-0', 'open');
  }

  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const overlay = el.cartOverlay || $('cart-backdrop') || $('cartOverlay');
  const drawer = el.cartDrawer || $('cart-drawer') || $('cartDrawer');

  if (drawer) {
    drawer.classList.remove('translate-x-0', 'open');
    drawer.classList.add('translate-x-full');
  }

  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 250);
  }

  document.body.style.overflow = '';
}

/* =========================================================
   AUTH
   ========================================================= */
function updateAuthUI() {
  if (state.user) {
    el.authButtons.classList.add('hidden');
    el.userMenuWrap.classList.remove('hidden');
    el.userInitial.textContent = state.user.name.trim().charAt(0).toUpperCase();
    el.userName.textContent = state.user.name;
    el.dropdownName.textContent = state.user.name;
    el.dropdownEmail.textContent = state.user.email;
  } else {
    el.authButtons.classList.remove('hidden');
    el.userMenuWrap.classList.add('hidden');
    el.userDropdown.classList.add('hidden');
  }
}

function openAuthModal(mode = 'login') {
  el.authError.classList.add('hidden');
  el.loginForm.reset();
  el.registerForm.reset();
  switchAuthTab(mode);

  const avatarEl = document.getElementById('auth-avatar-container');
  if (avatarEl) {
    avatarEl.setAttribute('data-state', 'neutral');
    avatarEl.classList.add('idle-floating');
    avatarEl.style.transform = 'rotateY(0deg) scale(1)';
  }
  const paws = document.getElementById('avatar-paws');
  if (paws) paws.style.transform = 'translateY(0)';
  const eyelids = document.getElementById('avatar-eyelids');
  if (eyelids) eyelids.style.opacity = '0';
  const happyEyes = document.getElementById('avatar-happy-eyes');
  if (happyEyes) {
    happyEyes.classList.add('hidden');
    happyEyes.style.opacity = '0';
  }
  const pupilLeft = document.getElementById('avatar-pupil-left');
  const pupilRight = document.getElementById('avatar-pupil-right');
  if (pupilLeft && pupilRight) {
    pupilLeft.style.opacity = '1';
    pupilRight.style.opacity = '1';
    pupilLeft.style.transform = pupilRight.style.transform = 'translate(0px, 0px)';
  }
  const blush = document.getElementById('avatar-blush');
  if (blush) {
    blush.querySelectorAll('ellipse').forEach((el) => {
      el.setAttribute('fill', 'url(#avatarBlushGrad)');
      el.setAttribute('opacity', '0.85');
    });
  }

  isPasswordVisible = false;
  const passInput = document.getElementById('auth-password');
  if (passInput) passInput.type = 'password';
  const eyeShow = document.getElementById('eye-icon-show');
  const eyeHide = document.getElementById('eye-icon-hide');
  if (eyeShow && eyeHide) {
    eyeShow.classList.remove('hidden');
    eyeHide.classList.add('hidden');
  }

  if (typeof setMascotBlink === 'function') {
    setMascotBlink(true);
  }
  openModal(el.authModal);
}

function switchAuthTab(mode) {
  const isLogin = mode === 'login';
  el.tabLogin.classList.toggle('active', isLogin);
  el.tabRegister.classList.toggle('active', !isLogin);
  el.loginForm.classList.toggle('hidden', !isLogin);
  el.registerForm.classList.toggle('hidden', isLogin);
  el.authError.classList.add('hidden');
}

function showAuthError(message) {
  el.authError.textContent = message;
  el.authError.classList.remove('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in…';

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: el.loginEmail.value, password: el.loginPassword.value }),
    });
    state.token = data.token;
    state.user = data.user;
    persistAuth();

    // Guest Cart Merging: preserve items placed in cart as guest
    const guestCart = loadCart();
    if (guestCart.length > 0 && state.cart.length === 0) {
      state.cart = guestCart;
    }
    persistCart();
    renderCartBadge();
    renderCartDrawer();

    updateAuthUI();
    triggerAvatarSuccess();
    toast(`Welcome back, ${data.user.name.split(' ')[0]}!`);

    setTimeout(() => {
      closeModal(el.authModal);
      if (state.pendingCheckout) {
        state.pendingCheckout = false;
        openCheckout();
      }
    }, 650);
  } catch (err) {
    triggerAvatarError();
    showAuthError(err.message || 'Login failed. Please check credentials.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account…';

  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: el.registerName.value,
        email: el.registerEmail.value,
        password: el.registerPassword.value,
      }),
    });
    state.token = data.token;
    state.user = data.user;
    persistAuth();

    // Guest Cart Merging: preserve items placed in cart as guest
    const guestCart = loadCart();
    if (guestCart.length > 0 && state.cart.length === 0) {
      state.cart = guestCart;
    }
    persistCart();
    renderCartBadge();
    renderCartDrawer();

    updateAuthUI();
    triggerAvatarSuccess();
    toast(`Welcome to CodeAlpha Store, ${data.user.name.split(' ')[0]}!`);

    setTimeout(() => {
      closeModal(el.authModal);
      if (state.pendingCheckout) {
        state.pendingCheckout = false;
        openCheckout();
      }
    }, 650);
  } catch (err) {
    triggerAvatarError();
    showAuthError(err.message || 'Registration failed.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
}

function logout({ silent = false } = {}) {
  state.token = null;
  state.user = null;
  persistAuth();
  updateAuthUI();
  el.userDropdown.classList.add('hidden');
  if (!silent) toast('You have been logged out.', 'info');
}

/* =========================================================
   CHECKOUT FLOW
   ========================================================= */
let lastPlacedOrder = null;

function goToCheckoutStep(step) {
  el.shippingForm.classList.toggle('hidden', step !== 1);
  el.paymentForm.classList.toggle('hidden', step !== 2);
  if (el.reviewStep) el.reviewStep.classList.toggle('hidden', step !== 3);
  el.successStep.classList.toggle('hidden', step !== 4);
  el.checkoutError.classList.add('hidden');

  document.querySelectorAll('.step-dot').forEach((dot) => {
    const dotStep = Number(dot.dataset.step);
    dot.classList.toggle('active', dotStep === step);
    dot.classList.toggle('done', dotStep < step);
  });
}

function applyCouponCode(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) {
    toast('Please enter a promo code.', 'info');
    return;
  }
  if (code === 'BUYHATKE20' || code === 'MEGA20') {
    state.coupon = 'BUYHATKE20';
    toast('Promo code "BUYHATKE20" applied! 20% discount deducted.', 'success');
  } else if (code === 'SUPER50') {
    state.coupon = 'SUPER50';
    toast('Promo code "SUPER50" applied! 25% discount deducted.', 'success');
  } else if (code === 'SAVE15') {
    state.coupon = 'SAVE15';
    toast('Promo code "SAVE15" applied! 15% discount deducted.', 'success');
  } else if (code === 'SAVE10' || code === 'WELCOME10') {
    state.coupon = 'WELCOME10';
    toast('Promo code "WELCOME10" applied! 10% discount deducted.', 'success');
  } else if (code === 'WELCOME5') {
    state.coupon = 'WELCOME5';
    toast('Promo code "WELCOME5" applied! 5% discount deducted.', 'success');
  } else {
    toast('Invalid promo code. Try "BUYHATKE20" for 20% off.', 'error');
    if (el.couponStatus) {
      el.couponStatus.classList.remove('hidden');
      el.couponStatus.innerHTML = `<span class="text-rose-600 font-medium">Invalid code. Try BUYHATKE20 for 20% off.</span>`;
    }
    if (el.reviewCouponStatus) {
      el.reviewCouponStatus.innerHTML = `<span class="text-rose-600 font-medium">Invalid code. Try BUYHATKE20</span>`;
    }
    return;
  }

  renderCartDrawer();
  renderCheckoutSummary();
  if (el.couponInput) el.couponInput.value = state.coupon;
  if (el.reviewCouponInput) el.reviewCouponInput.value = state.coupon;
  if (el.reviewCouponStatus) {
    const { discountRate } = cartTotals();
    el.reviewCouponStatus.innerHTML = `<span class="text-emerald-700 font-medium">✓ ${state.coupon} applied (-${Math.round(discountRate * 100)}%)</span>`;
  }
}

function handleApplyCoupon(e) {
  if (e) e.preventDefault();
  applyCouponCode(el.couponInput ? el.couponInput.value : '');
}

function handleRemoveCoupon() {
  state.coupon = null;
  if (el.couponInput) el.couponInput.value = '';
  if (el.reviewCouponInput) el.reviewCouponInput.value = '';
  if (el.reviewCouponStatus) el.reviewCouponStatus.innerHTML = '';
  toast('Promo code removed.', 'info');
  renderCartDrawer();
  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  const { subtotal, discount, shipping, tax, total } = cartTotals();
  const discountHtml = discount > 0
    ? `<div class="flex justify-between text-emerald-600 font-medium"><span>Promo Discount (${state.coupon})</span><span>-${formatCurrency(discount)}</span></div>`
    : '';

  el.checkoutSummary.innerHTML = `
    <div class="flex justify-between"><span class="text-neutral-500">Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
    ${discountHtml}
    <div class="flex justify-between"><span class="text-neutral-500">Tax (8%)</span><span>${formatCurrency(tax)}</span></div>
    <div class="flex justify-between"><span class="text-neutral-500">Shipping</span><span>${shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span></div>
    <div class="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-200 mt-1"><span>Total</span><span>${formatCurrency(total)}</span></div>
  `;
}

function openCheckout() {
  if (!state.user) {
    state.pendingCheckout = true;
    closeCart();
    openAuthModal('login');
    toast('Please log in to check out. Your cart is preserved.', 'info');
    return;
  }
  if (state.cart.length === 0) {
    toast('Your cart is empty.', 'error');
    return;
  }
  closeCart();
  el.shippingForm.reset();
  el.paymentForm.reset();
  goToCheckoutStep(1);
  openModal(el.checkoutModal);
}

function handleShippingSubmit(e) {
  e.preventDefault();
  renderCheckoutSummary();
  goToCheckoutStep(2);
}

function handlePaymentSubmit(e) {
  e.preventDefault();
  const cardNum = el.cardNumber.value.replace(/\s+/g, '');
  if (cardNum.length < 15) {
    el.checkoutError.textContent = 'Please enter a valid 16-digit card number.';
    el.checkoutError.classList.remove('hidden');
    return;
  }
  if (!el.cardExpiry.value || el.cardExpiry.value.length < 5) {
    el.checkoutError.textContent = 'Please enter a valid expiry date (MM/YY).';
    el.checkoutError.classList.remove('hidden');
    return;
  }
  if (!el.cardCvc.value || el.cardCvc.value.length < 3) {
    el.checkoutError.textContent = 'Please enter a valid CVC.';
    el.checkoutError.classList.remove('hidden');
    return;
  }

  el.checkoutError.classList.add('hidden');

  // Populate Review step summaries
  if (el.reviewShippingName) el.reviewShippingName.textContent = el.shipName.value.trim();
  if (el.reviewShippingAddress) {
    el.reviewShippingAddress.textContent = `${el.shipAddress.value.trim()}, ${el.shipCity.value.trim()} ${el.shipZip.value.trim()}`;
  }
  if (el.reviewCardMasked) el.reviewCardMasked.textContent = `•••• ${cardNum.slice(-4)}`;
  if (el.reviewCardExpiry) el.reviewCardExpiry.textContent = `Exp: ${el.cardExpiry.value.trim()}`;
  if (el.reviewCouponInput) el.reviewCouponInput.value = state.coupon || '';

  renderCheckoutSummary();
  goToCheckoutStep(3);
}

function formatCardNumberInput(e) {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
  const parts = digits.match(/.{1,4}/g);
  e.target.value = parts ? parts.join(' ') : '';
}

function formatExpiryInput(e) {
  let digits = e.target.value.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 1 && parseInt(digits, 10) > 1) {
    digits = '0' + digits;
  }
  if (digits.length >= 2) {
    e.target.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    e.target.value = digits;
  }
}

async function handlePlaceOrder(e) {
  if (e) e.preventDefault();
  el.checkoutError.classList.add('hidden');
  el.placeOrderBtn.disabled = true;
  el.placeOrderBtn.textContent = 'Placing order…';

  try {
    const payload = {
      items: state.cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      shipping: {
        name: el.shipName.value.trim(),
        address: el.shipAddress.value.trim(),
        city: el.shipCity.value.trim(),
        zip: el.shipZip.value.trim(),
      },
      couponCode: state.coupon || undefined,
    };

    const data = await apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) });
    lastPlacedOrder = data.order;

    // Clear cart and promo code on success.
    state.cart = [];
    state.coupon = null;
    persistCart();
    renderCartBadge();

    el.successOrderId.textContent = data.order.orderNumber;
    if (el.successTrackingNumber) {
      el.successTrackingNumber.textContent = data.order.trackingNumber || generateTrackingNumber();
    }
    if (el.successDeliveryDate) {
      el.successDeliveryDate.textContent = data.order.estimatedDelivery || calculateEstimatedDelivery(3);
    }
    el.successTotal.textContent = formatCurrency(data.order.total);
    goToCheckoutStep(4);

    // Refresh catalog so stock counts reflect the new order.
    fetchProducts();
  } catch (err) {
    el.checkoutError.textContent = err.message;
    el.checkoutError.classList.remove('hidden');
  } finally {
    el.placeOrderBtn.disabled = false;
    el.placeOrderBtn.textContent = 'Place Order';
  }
}

/* =========================================================
   ORDER HISTORY / PROFILE
   ========================================================= */
function getStatusBadge(status = 'Processing') {
  const norm = String(status || 'Processing').toLowerCase();
  if (norm === 'delivered') {
    return `<span class="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-neutral-900 text-white px-2.5 py-0.5 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>Delivered</span>`;
  }
  if (norm === 'shipped') {
    return `<span class="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-neutral-100 text-neutral-800 border border-neutral-200 px-2.5 py-0.5 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Shipped</span>`;
  }
  return `<span class="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-neutral-100 text-neutral-800 border border-neutral-200 px-2.5 py-0.5 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Processing</span>`;
}

function orderCardHtml(order) {
  const date = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const itemsHtml = order.items
    .map(
      (item) => `
      <div class="flex items-center gap-2.5 text-xs text-neutral-600">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-9 h-9 rounded-lg object-contain bg-[#f3f3f3] p-1 shrink-0 mix-blend-multiply" onerror="this.onerror=null; this.src='https://placehold.co/600x600/f1f5f9/94a3b8?text=Product+Image';" />
        <span class="flex-1 truncate">${escapeHtml(item.name)} × ${item.quantity}</span>
        <span class="font-semibold text-neutral-900">${formatCurrency(item.price * item.quantity)}</span>
      </div>`
    )
    .join('');

  return `
    <div class="border border-neutral-200 rounded-2xl p-4 bg-white shadow-sm">
      <div class="flex items-center justify-between mb-2 pb-2 border-b border-neutral-100">
        <div>
          <p class="text-xs font-bold text-neutral-900 font-mono tracking-wide">${order.orderNumber}</p>
          <p class="text-[11px] text-neutral-400 mt-0.5">${date}</p>
        </div>
        ${getStatusBadge(order.status)}
      </div>
      <div class="space-y-2 mt-3">${itemsHtml}</div>
      <div class="flex items-center justify-between text-xs font-bold text-neutral-900 mt-3 pt-3 border-t border-neutral-100">
        <button type="button" data-action="print-order" data-order-number="${escapeHtml(order.orderNumber)}" class="font-medium text-neutral-600 hover:text-black hover:bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full transition flex items-center gap-1.5 cursor-pointer">
          <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print Receipt
        </button>
        <div class="flex items-center gap-2">
          <span class="uppercase tracking-wider text-neutral-400 font-normal">Total</span>
          <span class="font-bold">${formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>`;
}

function printOrderReceipt(order) {
  if (!order) {
    toast('No order details found to print.', 'error');
    return;
  }

  const date = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const address = order.shippingAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];

  const itemsRows = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 10px 8px; text-align: left; font-size: 13px; font-weight: 500; color: #171717;">
          ${escapeHtml(item.name)}
        </td>
        <td style="padding: 10px 8px; text-align: center; font-size: 13px; color: #525252;">
          ${item.quantity}
        </td>
        <td style="padding: 10px 8px; text-align: right; font-size: 13px; color: #525252;">
          ${formatCurrency(item.price)}
        </td>
        <td style="padding: 10px 8px; text-align: right; font-size: 13px; font-weight: 600; color: #171717;">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join('');

  const itemsSubtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const diffDiscount = Math.max(0, Math.round((itemsSubtotal - Number(order.subtotal || itemsSubtotal)) * 100) / 100);
  const discountVal = Number(order.discount || diffDiscount || 0);
  const couponLabel = order.couponCode || (discountVal > 0 ? 'SAVE10' : '');

  const discountRow =
    discountVal > 0
      ? `<tr>
          <td colspan="3" style="padding: 6px 8px; text-align: right; font-size: 13px; color: #16a34a;">
            Promo Discount (${escapeHtml(couponLabel)}):
          </td>
          <td style="padding: 6px 8px; text-align: right; font-size: 13px; font-weight: 600; color: #16a34a;">
            -${formatCurrency(discountVal)}
          </td>
        </tr>`
      : '';

  const shippingCost = Number(order.shipping || 0);
  const shippingText = shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost);

  const receiptHtml = `
    <div style="max-width: 680px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #121212; line-height: 1.5;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #121212; margin-bottom: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; border-radius: 9999px; background: #121212; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;">CA</div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">CodeAlpha Studio</h1>
          </div>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #737373;">Official Purchase Receipt</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 13px; font-weight: 700; font-family: monospace;">${escapeHtml(order.orderNumber)}</p>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #737373; font-family: monospace;">Tracking: ${escapeHtml(order.trackingNumber || generateTrackingNumber())}</p>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #525252;">Est. Delivery: ${escapeHtml(order.estimatedDelivery || calculateEstimatedDelivery(3))}</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 600; color: #16a34a; text-transform: uppercase;">Status: ${escapeHtml(order.status || 'Confirmed')}</p>
        </div>
      </div>

      <!-- Shipping Information -->
      <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #737373;">Shipped To</h3>
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #121212;">${escapeHtml(address.name || 'Customer')}</p>
        <p style="margin: 2px 0 0 0; font-size: 13px; color: #525252;">${escapeHtml(address.address || '')}</p>
        <p style="margin: 2px 0 0 0; font-size: 13px; color: #525252;">${escapeHtml(address.city || '')}${address.zip ? `, ${escapeHtml(address.zip)}` : ''}</p>
      </div>

      <!-- Items Table -->
      <table class="receipt-table" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e5e5; background: #fafafa;">
            <th style="padding: 10px 8px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #737373;">Item</th>
            <th style="padding: 10px 8px; text-align: center; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #737373;">Qty</th>
            <th style="padding: 10px 8px; text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #737373;">Unit Price</th>
            <th style="padding: 10px 8px; text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #737373;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Totals Breakdown -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
        <table style="width: 280px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 8px; text-align: right; font-size: 13px; color: #737373;">Subtotal:</td>
            <td style="padding: 6px 8px; text-align: right; font-size: 13px; font-weight: 600; color: #121212;">${formatCurrency(order.subtotal)}</td>
          </tr>
          ${discountRow}
          <tr>
            <td style="padding: 6px 8px; text-align: right; font-size: 13px; color: #737373;">Sales Tax (8%):</td>
            <td style="padding: 6px 8px; text-align: right; font-size: 13px; font-weight: 600; color: #121212;">${formatCurrency(order.tax)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px; text-align: right; font-size: 13px; color: #737373;">Shipping:</td>
            <td style="padding: 6px 8px; text-align: right; font-size: 13px; font-weight: 600; color: #121212;">${shippingText}</td>
          </tr>
          <tr style="border-top: 2px solid #121212;">
            <td style="padding: 10px 8px; text-align: right; font-size: 15px; font-weight: 800; color: #121212;">Total Paid:</td>
            <td style="padding: 10px 8px; text-align: right; font-size: 16px; font-weight: 800; color: #121212;">${formatCurrency(order.total)}</td>
          </tr>
        </table>
      </div>

      <!-- Footer Note -->
      <div style="border-top: 1px solid #e5e5e5; padding-top: 16px; text-align: center; font-size: 12px; color: #737373;">
        <p style="margin: 0;">Thank you for choosing CodeAlpha Studio.</p>
        <p style="margin: 4px 0 0 0;">For inquiries or support, contact <span style="color: #121212; font-weight: 600;">support@codealpha.studio</span></p>
      </div>
    </div>
  `;

  if (el.printableReceipt) {
    el.printableReceipt.innerHTML = receiptHtml;
    el.printableReceipt.classList.remove('hidden');
    window.print();
  }
}

async function openOrdersModal() {
  el.userDropdown.classList.add('hidden');
  openModal(el.ordersModal);
  el.ordersList.innerHTML = `
    <div class="skeleton h-24 rounded-2xl"></div>
    <div class="skeleton h-24 rounded-2xl"></div>`;
  el.ordersList.classList.remove('hidden');
  el.ordersEmptyState.classList.add('hidden');

  try {
    const data = await apiFetch('/orders');
    state.pastOrders = data.orders || [];
    if (state.pastOrders.length === 0) {
      el.ordersList.classList.add('hidden');
      el.ordersEmptyState.classList.remove('hidden');
      el.ordersEmptyState.classList.add('flex');
    } else {
      el.ordersEmptyState.classList.add('hidden');
      el.ordersList.classList.remove('hidden');
      el.ordersList.innerHTML = state.pastOrders.map(orderCardHtml).join('');
    }
  } catch (err) {
    el.ordersList.innerHTML = `<p class="text-sm text-red-600 text-center py-8">${escapeHtml(err.message)}</p>`;
  }
}

/* =========================================================
   DARK / LIGHT THEME MANAGEMENT
   ========================================================= */
function applyTheme(isDark) {
  if (isDark) {
    document.documentElement.classList.add('dark');
    if (el.themeSunIcon) el.themeSunIcon.classList.remove('hidden');
    if (el.themeMoonIcon) el.themeMoonIcon.classList.add('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    if (el.themeSunIcon) el.themeSunIcon.classList.add('hidden');
    if (el.themeMoonIcon) el.themeMoonIcon.classList.remove('hidden');
  }

  // Live update open chart theme colors if active
  if (priceChartInstance && priceChartInstance.options && priceChartInstance.options.scales) {
    const textColor = isDark ? '#94a3b8' : '#8c8c8c';
    const gridColor = isDark ? '#1e293b' : '#f0f0f0';
    if (priceChartInstance.options.scales.x) {
      priceChartInstance.options.scales.x.ticks.color = textColor;
    }
    if (priceChartInstance.options.scales.y) {
      priceChartInstance.options.scales.y.ticks.color = textColor;
      priceChartInstance.options.scales.y.grid.color = gridColor;
    }
    priceChartInstance.update(200);
  }
}

function initThemeToggle() {
  const saved = localStorage.getItem('theme') || localStorage.getItem('ca_theme');
  const isDark = saved === 'dark';
  applyTheme(isDark);

  if (el.themeToggleBtn) {
    el.themeToggleBtn.addEventListener('click', () => {
      const willBeDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
      localStorage.setItem('ca_theme', willBeDark ? 'dark' : 'light');
      applyTheme(willBeDark);
      toast(willBeDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info');
    });
  }
}

/* =========================================================
   CHART RANGE SWITCHER (1M, 3M, 6M, ALL)
   ========================================================= */
let currentChartContext = null;

function getHistoryRangeData(rangeKey, baseHistory, productPrice) {
  const p = productPrice || 100;
  const k = String(rangeKey || '').toUpperCase();
  if (k === '7D') {
    // 7 days: take last 2 data points
    return baseHistory.slice(-2);
  }
  if (k === '30D' || k === '1M') {
    // Last 30 days: take last 4 data points
    return baseHistory.slice(-4);
  }
  if (k === '90D' || k === '3M') {
    // Last 90 days: full standard baseline
    return baseHistory;
  }
  if (k === '180D' || k === '6M') {
    // 180 Days (6 Months): prepend historical fluctuations
    return [
      { date: '180 days ago', price: Math.round(p * 1.18 * 100) / 100 },
      { date: '150 days ago', price: Math.round(p * 1.12 * 100) / 100 },
      { date: '120 days ago', price: Math.round(p * 1.25 * 100) / 100 },
      ...baseHistory,
    ];
  }
  if (k === 'ALL' || k === '1Y') {
    // Complete 1-year timeline
    return [
      { date: '1 yr ago', price: Math.round(p * 1.30 * 100) / 100 },
      { date: '180 days ago', price: Math.round(p * 1.18 * 100) / 100 },
      { date: '120 days ago', price: Math.round(p * 1.25 * 100) / 100 },
      ...baseHistory,
    ];
  }
  return baseHistory;
}

function switchChartRange(rangeKey) {
  if (!priceChartInstance || !currentChartContext) return;
  const switcher = $('chartRangeSwitcher');
  if (switcher) {
    switcher.querySelectorAll('.chart-range-pill').forEach((btn) => {
      const isActive = btn.dataset.range === rangeKey;
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('bg-white', isActive);
      btn.classList.toggle('dark:bg-neutral-900', isActive);
      btn.classList.toggle('text-black', isActive);
      btn.classList.toggle('dark:text-white', isActive);
      btn.classList.toggle('shadow-xs', isActive);
      btn.classList.toggle('font-bold', isActive);
      btn.classList.toggle('text-neutral-600', !isActive);
      btn.classList.toggle('dark:text-neutral-400', !isActive);
    });
  }

  const phmSwitcher = $('phmRangeSwitcher');
  if (phmSwitcher) {
    phmSwitcher.querySelectorAll('.phm-range-pill').forEach((btn) => {
      const isActive = btn.dataset.range === rangeKey;
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('bg-blue-600', isActive);
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('shadow-sm', isActive);
      btn.classList.toggle('bg-slate-100', !isActive);
      btn.classList.toggle('dark:bg-slate-800', !isActive);
      btn.classList.toggle('text-slate-700', !isActive);
      btn.classList.toggle('dark:text-slate-300', !isActive);
    });
  }

  const dataset = getHistoryRangeData(rangeKey, currentChartContext.history, currentChartContext.productPrice);
  const labels = dataset.map((d) => d.date);
  const prices = dataset.map((d) => d.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = Math.round((prices.reduce((s, pt) => s + pt, 0) / prices.length) * 100) / 100;

  priceChartInstance.data.labels = labels;
  priceChartInstance.data.datasets[0].data = prices;
  priceChartInstance.data.datasets[0].pointRadius = prices.map((pt) => (pt === lowest || pt === highest ? 6 : 3));
  priceChartInstance.data.datasets[0].pointBackgroundColor = prices.map((pt) =>
    pt === lowest ? '#059669' : pt === highest ? '#dc2626' : (document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#171717')
  );
  priceChartInstance.data.datasets[1].data = Array(prices.length).fill(average);

  if (priceChartInstance.data.datasets[2]) {
    priceChartInstance.data.datasets[2].data = Array(prices.length).fill(currentChartContext.targetPriceNum);
  }

  // Update milestone stats for the selected time range
  if ($('qvMilestoneLowestPrice')) $('qvMilestoneLowestPrice').textContent = formatCurrency(lowest);
  const lowestPt = dataset.find((pt) => pt.price === lowest) || {};
  if ($('qvMilestoneLowestDate')) $('qvMilestoneLowestDate').textContent = `Recorded: ${lowestPt.date || 'In range'}`;
  if ($('phmLowestPrice')) $('phmLowestPrice').textContent = formatCurrency(lowest);
  if ($('phmLowestDate')) $('phmLowestDate').textContent = lowestPt.date || 'In range';

  if ($('qvMilestoneHighestPrice')) $('qvMilestoneHighestPrice').textContent = formatCurrency(highest);
  const highestPt = dataset.find((pt) => pt.price === highest) || {};
  if ($('qvMilestoneHighestDate')) $('qvMilestoneHighestDate').textContent = `Recorded: ${highestPt.date || 'In range'}`;
  if ($('phmHighestPrice')) $('phmHighestPrice').textContent = formatCurrency(highest);
  if ($('phmHighestDate')) $('phmHighestDate').textContent = highestPt.date || 'In range';

  if ($('qvMilestoneAvgPrice')) $('qvMilestoneAvgPrice').textContent = formatCurrency(average);
  if ($('phmAveragePrice')) $('phmAveragePrice').textContent = formatCurrency(average);

  // 400ms transition as requested!
  priceChartInstance.update({
    duration: 400,
    easing: 'easeInOutQuad',
  });
}

/* =========================================================
   SIDE-BY-SIDE FLOATING COMPARE DRAWER & MODAL
   ========================================================= */
function updateCompareFloatingBar() {
  const bar = el.compareFloatingBar || $('compareFloatingBar');
  if (!bar) return;

  const count = state.compareIds.size;
  if (count === 0) {
    bar.classList.add('hidden');
    return;
  }

  bar.classList.remove('hidden');
  const countEl = el.compareBarCount || $('compareBarCount');
  if (countEl) countEl.textContent = `Compare (${count}/3)`;

  const thumbWrap = el.compareBarThumbnails || $('compareBarThumbnails');
  if (thumbWrap) {
    const selected = state.products.filter((p) => state.compareIds.has(p.id));
    thumbWrap.innerHTML = selected
      .map(
        (p) => `
        <div class="relative group" title="${escapeHtml(p.name)}">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" class="w-7 h-7 rounded-full object-cover bg-neutral-800 border-2 border-white/20 shadow-xs" />
          <button type="button" data-remove-compare="${p.id}" class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-neutral-900 text-neutral-300 hover:text-white hover:bg-red-600 flex items-center justify-center text-[9px] font-bold transition cursor-pointer" title="Remove">✕</button>
        </div>`
      )
      .join('');

    thumbWrap.querySelectorAll('[data-remove-compare]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.removeCompare);
        state.compareIds.delete(id);
        const cb = document.querySelector(`input[data-compare-id="${id}"]`);
        if (cb) cb.checked = false;
        updateCompareFloatingBar();
      });
    });
  }
}

function clearAllCompared() {
  state.compareIds.clear();
  document.querySelectorAll('input[data-compare-id]').forEach((cb) => {
    cb.checked = false;
  });
  updateCompareFloatingBar();
  if (el.compareModal && !el.compareModal.classList.contains('hidden')) {
    closeModal(el.compareModal);
  }
  toast('Comparison selection cleared.', 'info');
}

function getProductSpecs(product) {
  const cat = String(product.category || '').toLowerCase();
  if (cat.includes('electronics')) {
    return [
      { label: 'Connectivity', val: 'Bluetooth 5.3 + Low Latency' },
      { label: 'Battery / Power', val: 'Fast USB-C / Up to 36h Playtime' },
      { label: 'Audio Driver', val: '40mm High-Resolution Driver' },
      { label: 'Warranty', val: '1 Year Brand Warranty' },
    ];
  }
  if (cat.includes('fashion')) {
    return [
      { label: 'Material', val: '100% Breathable Organic Cotton / Denim' },
      { label: 'Fit Type', val: 'Modern Tailored Comfort Fit' },
      { label: 'Care', val: 'Machine Wash Cold / Colorfast' },
      { label: 'Warranty', val: '30-Day Hassle-Free Exchange' },
    ];
  }
  return [
    { label: 'Build Material', val: 'Eco-Friendly Ceramic / Handcrafted' },
    { label: 'Design', val: 'Minimalist Scandinavian Aesthetic' },
    { label: 'Dimensions', val: 'Compact Ergonomic Footprint' },
    { label: 'Warranty', val: '1 Year Manufacturer Guarantee' },
  ];
}

async function openCompareModal() {
  const selected = state.products.filter((p) => state.compareIds.has(p.id));
  if (selected.length === 0) {
    toast('Select at least 1 product to compare.', 'info');
    return;
  }

  const container = el.compareModalContent || $('compareModalContent');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-center py-16 gap-3 text-neutral-500">
      <div class="w-5 h-5 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm font-medium">Aggregating cross-store live metrics…</span>
    </div>
  `;

  openModal(el.compareModal);

  // Fetch cross-store comparison for each selected product
  const storeData = await Promise.all(
    selected.map(async (p) => {
      try {
        const res = await apiFetch(`/products/${p.id}/compare`);
        return { product: p, compare: res };
      } catch {
        return { product: p, compare: null };
      }
    })
  );

  renderCompareMatrix(storeData);
}

function renderCompareMatrix(items) {
  const container = el.compareModalContent || $('compareModalContent');
  if (!container) return;

  const count = items.length;
  if (count === 0) {
    closeModal(el.compareModal);
    updateCompareFloatingBar();
    return;
  }

  const sub = el.compareModalSubtitle || $('compareModalSubtitle');
  if (sub) {
    sub.textContent = `Comparing ${count} product${count > 1 ? 's' : ''} across prices, retailer deals, ratings & specifications`;
  }

  const colGridClass = count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';

  container.innerHTML = `
    <div class="grid ${colGridClass} gap-4 sm:gap-6">
      ${items
        .map(({ product, compare }) => {
          const stores = (compare && compare.stores) ? compare.stores : [];
          const lowestStore = stores.find((s) => s.isLowest) || stores[0] || {
            store_name: 'Amazon',
            current_price: product.price,
            bank_offer: 'Instant Bank Discount Available',
          };
          const specs = getProductSpecs(product);
          const isBest = product.price <= (product.min_history_price || product.price) * 1.05;

          return `
            <div class="bg-neutral-50 dark:bg-neutral-800/60 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between relative shadow-xs">
              <!-- Remove button -->
              <button type="button" data-matrix-remove="${product.id}" class="absolute top-4 right-4 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer" title="Remove from comparison">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>

              <div>
                <!-- Image & Category -->
                <div class="relative w-full mb-4">
                  <img src="${product.image}" alt="${escapeHtml(product.name)}" class="w-full h-auto max-h-64 object-contain bg-slate-950/40 p-4 rounded-2xl mx-auto" onerror="this.onerror=null; this.src='https://placehold.co/600x600/1e293b/94a3b8?text=Product+Image';" />
                  <span class="absolute bottom-2.5 left-2.5 bg-neutral-900/80 text-white text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded-full backdrop-blur">${product.category}</span>
                </div>

                <!-- Title -->
                <h4 class="font-bold text-sm text-neutral-900 dark:text-white line-clamp-2 min-h-[2.5rem] leading-snug tracking-tight mb-2">${escapeHtml(product.name)}</h4>

                <!-- Ratings & Stock -->
                <div class="flex items-center justify-between text-xs mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                  <div class="flex items-center gap-1 font-semibold text-neutral-800 dark:text-neutral-200">
                    <span class="text-amber-500">★</span> ${product.rating.toFixed(1)}
                    <span class="text-neutral-400 font-normal">(${18 + (product.id * 7)} reviews)</span>
                  </div>
                  <span class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">In Stock</span>
                </div>

                <!-- Price Comparison Row -->
                <div class="space-y-1.5 mb-4">
                  <div class="flex items-baseline justify-between">
                    <span class="text-xs text-neutral-500 dark:text-neutral-400">CodeAlpha Price:</span>
                    <span class="text-base font-extrabold text-neutral-900 dark:text-white">${formatCurrency(product.price)}</span>
                  </div>
                  <div class="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs flex items-center justify-between">
                    <div>
                      <div class="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Lowest Across Stores</div>
                      <div class="font-bold text-neutral-900 dark:text-white flex items-center gap-2 mt-0.5">
                        ${getStoreLogoSvg(lowestStore.store_name, 'w-4 h-4')}
                        <span>${formatCurrency(lowestStore.current_price || product.price)}</span>
                        <span class="font-normal text-neutral-500 text-[11px]">on ${escapeHtml(lowestStore.store_name)}</span>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isBest ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'}">
                      ${isBest ? '🔥 Best Price' : '⏳ Good Price'}
                    </span>
                  </div>
                  <div class="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 flex items-center gap-1">
                    <span>💳</span> <span class="truncate">${lowestStore.bank_offer || 'Instant Bank Discount Available'}</span>
                  </div>
                </div>

                <!-- Key Specifications Matrix -->
                <div class="border-t border-neutral-200 dark:border-neutral-700 pt-3 mb-4 space-y-2">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Specifications</div>
                  ${specs
                    .map(
                      (sp) => `
                    <div class="flex items-start justify-between text-[11px] gap-2">
                      <span class="text-neutral-500 dark:text-neutral-400 shrink-0 font-medium">${sp.label}:</span>
                      <span class="text-neutral-800 dark:text-neutral-200 font-semibold text-right truncate">${sp.val}</span>
                    </div>`
                    )
                    .join('')}
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <button type="button" data-matrix-quickview="${product.id}" class="w-full py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-600 hover:border-black dark:hover:border-white bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white font-bold text-xs transition cursor-pointer shadow-2xs">
                  View Full Details & Trend
                </button>
                <button type="button" data-matrix-addcart="${product.id}" class="w-full py-2.5 px-3 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-bold text-xs transition cursor-pointer shadow-xs">
                  Add to Cart
                </button>
              </div>
            </div>`;
        })
        .join('')}
    </div>
  `;

  // Wire remove buttons inside modal
  container.querySelectorAll('[data-matrix-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.matrixRemove);
      state.compareIds.delete(id);
      const cb = document.querySelector(`input[data-compare-id="${id}"]`);
      if (cb) cb.checked = false;
      const updatedItems = items.filter((it) => it.product.id !== id);
      renderCompareMatrix(updatedItems);
      updateCompareFloatingBar();
    });
  });

  // Wire Quick View button
  container.querySelectorAll('[data-matrix-quickview]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(el.compareModal);
      openQuickView(Number(btn.dataset.matrixQuickview));
    });
  });

  // Wire Add to Cart button
  container.querySelectorAll('[data-matrix-addcart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      addToCart(Number(btn.dataset.matrixAddcart), 1, 'Triple Black');
    });
  });
}

/* =========================================================
   LIVE PREDICTIVE SEARCH DROPDOWN ENGINE
   ========================================================= */
function renderPredictiveSearchSuggestions(query) {
  const popover = el.searchSuggestionsPopover || $('searchSuggestionsPopover');
  const list = el.searchSuggestionsList || $('searchSuggestionsList');
  const countEl = el.searchMatchesCount || $('searchMatchesCount');
  if (!popover || !list) return;

  const q = String(query || '').trim().toLowerCase();
  if (q.length === 0) {
    popover.classList.add('hidden');
    return;
  }

  const matches = (state.products || [])
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    )
    .slice(0, 3);

  if (matches.length === 0) {
    list.innerHTML = `
      <div class="p-4 text-center text-xs text-neutral-400">
        No live matching products found for "<span class="text-neutral-700 dark:text-neutral-300 font-semibold">${escapeHtml(query)}</span>"
      </div>
    `;
    if (countEl) countEl.textContent = '0 results';
    popover.classList.remove('hidden');
    return;
  }

  if (countEl) countEl.textContent = `${matches.length} result${matches.length === 1 ? '' : 's'}`;

  list.innerHTML = matches
    .map((product) => {
      const lowestP = product.min_store_price || Math.round(product.price * 0.92 * 100) / 100;
      const storeName = product.min_store_name || ((product.id % 2 === 0) ? 'Amazon' : 'Flipkart');
      return `
        <div class="search-suggestion-item p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/70 transition flex items-center justify-between gap-3 cursor-pointer group" data-suggest-id="${product.id}">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center p-1.5 shrink-0 border border-neutral-200/60 dark:border-neutral-700/60 overflow-hidden">
              <img src="${product.image}" alt="${escapeHtml(product.name)}" class="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition" onerror="this.onerror=null; this.src='https://placehold.co/600x600/f1f5f9/94a3b8?text=Product';" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">${product.category}</span>
                <span class="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">★ ${product.rating.toFixed(1)}</span>
              </div>
              <h5 class="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-black dark:group-hover:text-white">${escapeHtml(product.name)}</h5>
              <div class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                <span>CodeAlpha: <strong class="text-neutral-900 dark:text-white font-bold">${formatCurrency(product.price)}</strong></span>
                <span class="mx-1">•</span>
                <span class="text-emerald-700 dark:text-emerald-400 font-semibold">Lowest: ${formatCurrency(lowestP)} on ${storeName}</span>
              </div>
            </div>
          </div>
          <div class="shrink-0 flex items-center">
            <span class="text-xs font-bold text-neutral-400 group-hover:text-black dark:group-hover:text-white transition flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700">
              <span>View</span> <span>→</span>
            </span>
          </div>
        </div>
      `;
    })
    .join('');

  list.querySelectorAll('[data-suggest-id]').forEach((row) => {
    row.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(row.dataset.suggestId);
      popover.classList.add('hidden');
      window.location.href = `product.html?id=${id}`;
    });
  });

  popover.classList.remove('hidden');
}

/* =========================================================
   EVENT WIRING
   ========================================================= */
function wireEvents() {
  // Search (300ms debounce with clear button + live predictive dropdown)
  el.searchInput.addEventListener('input', () => {
    const val = el.searchInput.value.trim();
    if (val.length > 0) {
      el.clearSearchBtn.classList.remove('hidden');
    } else {
      el.clearSearchBtn.classList.add('hidden');
    }

    renderPredictiveSearchSuggestions(val);

    clearTimeout(state.searchDebounceId);
    state.searchDebounceId = setTimeout(() => {
      state.filters.search = val;
      fetchProducts();
    }, 300);
  });

  el.searchInput.addEventListener('focus', () => {
    const val = el.searchInput.value.trim();
    if (val.length > 0) renderPredictiveSearchSuggestions(val);
  });

  if (el.clearSearchBtn) {
    el.clearSearchBtn.addEventListener('click', () => {
      el.searchInput.value = '';
      el.clearSearchBtn.classList.add('hidden');
      if (el.searchSuggestionsPopover) el.searchSuggestionsPopover.classList.add('hidden');
      state.filters.search = '';
      fetchProducts();
      el.searchInput.focus();
    });
  }

  // Close suggestions popover when clicking outside or pressing Escape
  document.addEventListener('click', (e) => {
    const searchWrap = el.searchContainer || $('searchContainer');
    if (searchWrap && !searchWrap.contains(e.target)) {
      if (el.searchSuggestionsPopover) el.searchSuggestionsPopover.classList.add('hidden');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el.searchSuggestionsPopover) {
      el.searchSuggestionsPopover.classList.add('hidden');
    }
  });

  // Sort
  el.sortSelect.addEventListener('change', () => {
    state.filters.sort = el.sortSelect.value;
    fetchProducts();
  });

  // Clear filters
  el.clearFiltersBtn.addEventListener('click', () => {
    state.filters = { search: '', category: 'All', sort: '', deal: 'all' };
    el.searchInput.value = '';
    if (el.clearSearchBtn) el.clearSearchBtn.classList.add('hidden');
    el.sortSelect.value = '';
    renderCategoryChips();
    setDealFilter('all');
    fetchProducts();
  });

  // Deal Finder fast filter pills
  document.querySelectorAll('.deal-filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      setDealFilter(pill.dataset.dealFilter || 'all');
    });
  });

  // Chrome Extension Promo & Simulation modal
  if (el.extensionPromoBtn) {
    el.extensionPromoBtn.addEventListener('click', () => openModal(el.extensionPreviewModal));
  }
  if (el.heroExtensionBtn) {
    el.heroExtensionBtn.addEventListener('click', () => openModal(el.extensionPreviewModal));
  }
  if (el.simulateExtensionScanBtn) {
    el.simulateExtensionScanBtn.addEventListener('click', simulateExtensionScan);
  }
  if (el.installExtensionActionBtn) {
    el.installExtensionActionBtn.addEventListener('click', installExtension);
  }

  // URL Hash deep-linking
  window.addEventListener('hashchange', checkUrlHash);

  // Cart drawer
  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  }
  const closeCartTrigger = document.getElementById('close-cart-btn') || el.closeCartBtn || $('closeCartBtn');
  if (closeCartTrigger) closeCartTrigger.addEventListener('click', closeCart);
  const cartBackdrop = document.getElementById('cart-backdrop') || el.cartOverlay || $('cartOverlay');
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);
  if (el.checkoutBtn) el.checkoutBtn.addEventListener('click', openCheckout);

  // Auth & Interactive Anime Avatar
  const emailInput = document.getElementById('auth-email');
  const passInput = document.getElementById('auth-password');
  const togglePassBtn = document.getElementById('toggle-password-visibility');
  const avatarEl = document.getElementById('auth-avatar') || document.getElementById('auth-avatar-container');

  const updatePupilTracking = (textLen) => {
    const pupilLeft = document.getElementById('avatar-pupil-left');
    const pupilRight = document.getElementById('avatar-pupil-right');
    const offset = Math.min(Math.max((textLen / 25) * 8 - 4, -4), 4);
    if (pupilLeft && pupilRight) {
      pupilLeft.style.opacity = '1';
      pupilRight.style.opacity = '1';
      pupilLeft.style.transform = pupilRight.style.transform = `translate(${offset}px, 3px)`;
    }
  };

  emailInput?.addEventListener('focus', () => {
    avatarEl?.setAttribute('data-state', 'watching');
    updatePupilTracking(emailInput.value.length);
  });
  emailInput?.addEventListener('input', () => {
    avatarEl?.setAttribute('data-state', 'watching');
    updatePupilTracking(emailInput.value.length);
  });
  passInput?.addEventListener('focus', () => avatarEl?.setAttribute('data-state', 'peek'));
  togglePassBtn?.addEventListener('click', () => {
    const isVisible = passInput.type === 'text';
    passInput.type = isVisible ? 'password' : 'text';
    avatarEl?.setAttribute('data-state', isVisible ? 'peek' : 'turned-away');
    const eyeShow = document.getElementById('eye-icon-show');
    const eyeHide = document.getElementById('eye-icon-hide');
    if (eyeShow && eyeHide) {
      eyeShow.classList.toggle('hidden', !isVisible);
      eyeHide.classList.toggle('hidden', isVisible);
    }
  });

  // Return to neutral when focus moves away
  emailInput?.addEventListener('blur', () => {
    setTimeout(() => {
      if (document.activeElement !== passInput && document.activeElement !== emailInput) {
        avatarEl?.setAttribute('data-state', 'neutral');
        const pupilLeft = document.getElementById('avatar-pupil-left');
        const pupilRight = document.getElementById('avatar-pupil-right');
        if (pupilLeft && pupilRight) pupilLeft.style.transform = pupilRight.style.transform = 'translate(0px, 0px)';
      }
    }, 120);
  });
  passInput?.addEventListener('blur', () => {
    setTimeout(() => {
      if (document.activeElement !== passInput && document.activeElement !== emailInput && passInput.type !== 'text') {
        avatarEl?.setAttribute('data-state', 'neutral');
      }
    }, 120);
  });

  // Also support registration form inputs for anime avatar
  const regEmail = document.getElementById('registerEmail');
  const regPass = document.getElementById('registerPassword');
  regEmail?.addEventListener('focus', () => avatarEl?.setAttribute('data-state', 'watching'));
  regPass?.addEventListener('focus', () => avatarEl?.setAttribute('data-state', 'peek'));
  regEmail?.addEventListener('blur', () => {
    setTimeout(() => {
      if (document.activeElement !== regPass && document.activeElement !== regEmail) {
        avatarEl?.setAttribute('data-state', 'neutral');
      }
    }, 120);
  });
  regPass?.addEventListener('blur', () => {
    setTimeout(() => {
      if (document.activeElement !== regPass && document.activeElement !== regEmail) {
        avatarEl?.setAttribute('data-state', 'neutral');
      }
    }, 120);
  });

  el.loginBtn.addEventListener('click', () => openAuthModal('login'));
  el.registerBtn.addEventListener('click', () => openAuthModal('register'));
  el.tabLogin.addEventListener('click', () => switchAuthTab('login'));
  el.tabRegister.addEventListener('click', () => switchAuthTab('register'));
  el.loginForm.addEventListener('submit', handleLogin);
  el.registerForm.addEventListener('submit', handleRegister);

  el.userMenuBtn.addEventListener('click', () => el.userDropdown.classList.toggle('hidden'));
  document.addEventListener('click', (e) => {
    if (!el.userMenuWrap.contains(e.target)) el.userDropdown.classList.add('hidden');
  });
  el.logoutBtn.addEventListener('click', () => {
    el.userDropdown.classList.add('hidden');
    logout();
  });
  el.ordersBtn.addEventListener('click', openOrdersModal);

  // Checkout flow
  el.closeCheckoutBtn.addEventListener('click', () => closeModal(el.checkoutModal));
  el.shippingForm.addEventListener('submit', handleShippingSubmit);
  el.paymentForm.addEventListener('submit', handlePaymentSubmit);
  el.cardNumber.addEventListener('input', formatCardNumberInput);
  el.cardExpiry.addEventListener('input', formatExpiryInput);

  if (el.backToShippingBtn) {
    el.backToShippingBtn.addEventListener('click', () => goToCheckoutStep(1));
  }
  if (el.backToPaymentBtn) {
    el.backToPaymentBtn.addEventListener('click', () => goToCheckoutStep(2));
  }
  if (el.editShippingBtn) {
    el.editShippingBtn.addEventListener('click', () => goToCheckoutStep(1));
  }
  if (el.editPaymentBtn) {
    el.editPaymentBtn.addEventListener('click', () => goToCheckoutStep(2));
  }
  if (el.placeOrderBtn) {
    el.placeOrderBtn.addEventListener('click', handlePlaceOrder);
  }
  if (el.reviewApplyCouponBtn) {
    el.reviewApplyCouponBtn.addEventListener('click', () => {
      applyCouponCode(el.reviewCouponInput ? el.reviewCouponInput.value : '');
    });
  }

  el.printSuccessBtn.addEventListener('click', () => printOrderReceipt(lastPlacedOrder));
  el.successCloseBtn.addEventListener('click', () => closeModal(el.checkoutModal));

  // Coupon form in cart drawer
  if (el.couponForm) {
    el.couponForm.addEventListener('submit', handleApplyCoupon);
  }

  // Buyhatke Auto-Apply Best Coupon buttons
  if (el.cartAutoCouponBtn) {
    el.cartAutoCouponBtn.addEventListener('click', () => runAutoApplyCoupons(el.cartAutoCouponBtn));
  }
  if (el.reviewAutoCouponBtn) {
    el.reviewAutoCouponBtn.addEventListener('click', () => runAutoApplyCoupons(el.reviewAutoCouponBtn));
  }

  // Price Drop Alert form submit
  if (el.priceAlertForm) {
    el.priceAlertForm.addEventListener('submit', handlePriceAlertSubmit);
  }

  // 90-Day Trend Modal Price Drop Alert form submit
  const phmAlertForm = $('phmAlertForm');
  if (phmAlertForm) {
    phmAlertForm.addEventListener('submit', handlePhmAlertSubmit);
  }

  // Buyhatke "Paste Product Link" URL Input Bar
  if (el.linkCompareForm) {
    el.linkCompareForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLinkCompare();
    });
  }
  if (el.linkCompareInput) {
    el.linkCompareInput.addEventListener('paste', () => {
      setTimeout(() => handleLinkCompare(), 120);
    });
  }

  // Print receipt event delegation from orders modal
  el.ordersList.addEventListener('click', (e) => {
    const printBtn = e.target.closest('[data-action="print-order"]');
    if (printBtn) {
      const orderNum = printBtn.dataset.orderNumber;
      const targetOrder = (state.pastOrders || []).find((o) => o.orderNumber === orderNum);
      if (targetOrder) printOrderReceipt(targetOrder);
    }
  });

  // Side-by-side floating compare bar and modal events
  if (el.compareClearBtn) {
    el.compareClearBtn.addEventListener('click', clearAllCompared);
  }
  if (el.compareOpenBtn) {
    el.compareOpenBtn.addEventListener('click', openCompareModal);
  }
  if (el.compareCloseBtn) {
    el.compareCloseBtn.addEventListener('click', () => closeModal(el.compareModal));
  }
  if (el.compareModalClearBtn) {
    el.compareModalClearBtn.addEventListener('click', clearAllCompared);
  }
  if (el.compareModalDoneBtn) {
    el.compareModalDoneBtn.addEventListener('click', () => closeModal(el.compareModal));
  }

  // Wishlist navbar button
  const wishlistBtn = $('wishlistNavBtn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setDealFilter('wishlist');
      const target = $('resultsHeading') || $('productGrid');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Grid / List View Switchers
  const gridBtn = $('gridViewBtn');
  const listBtn = $('listViewBtn');
  if (gridBtn && listBtn) {
    gridBtn.addEventListener('click', () => {
      state.viewMode = 'grid';
      gridBtn.className = 'p-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white transition cursor-pointer';
      listBtn.className = 'p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer';
      el.productGrid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pb-6 scroll-mt-28';
      renderProducts(state.products);
    });
    listBtn.addEventListener('click', () => {
      state.viewMode = 'list';
      listBtn.className = 'p-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white transition cursor-pointer';
      gridBtn.className = 'p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer';
      el.productGrid.className = 'flex flex-col gap-4 pb-6 scroll-mt-28';
      renderProducts(state.products);
    });
  }

  // Mobile Bottom Floating Nav
  const mobileSearchBtn = $('mobileSearchBtn');
  const mobileWishlistBtn = $('mobileWishlistBtn');
  const mobileCartBtn = $('mobileCartBtn');
  const mobileAccountBtn = $('mobileAccountBtn');

  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener('click', () => {
      el.searchInput?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (mobileWishlistBtn) {
    mobileWishlistBtn.addEventListener('click', () => {
      setDealFilter('wishlist');
      const target = $('resultsHeading') || $('productGrid');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (mobileCartBtn) {
    mobileCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  }
  if (mobileAccountBtn) {
    mobileAccountBtn.addEventListener('click', () => {
      if (state.user) {
        el.userDropdown?.classList.toggle('hidden');
      } else {
        openAuthModal('login');
      }
    });
  }

  initCatalogSidebarFilters();
}

function saveForLater(productId) {
  const item = state.cart.find((c) => c.productId === productId);
  if (!item) return;

  removeFromCart(productId);
  let saved = safeParseJSON(localStorage.getItem('ca_saved_for_later')) || [];
  if (!saved.some((s) => s.productId === productId)) {
    saved.push(item);
    localStorage.setItem('ca_saved_for_later', JSON.stringify(saved));
  }
  toast(`Moved "${item.name}" to Saved for Later.`, 'info');
}

function initCatalogSidebarFilters() {
  document.querySelectorAll('input[name="sidebarPrice"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.filters.priceRange = radio.value;
      applyDealFilterAndRender();
    });
  });

  document.querySelectorAll('.brand-filter-cb').forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        state.filters.brands.add(cb.value);
      } else {
        state.filters.brands.delete(cb.value);
      }
      applyDealFilterAndRender();
    });
  });

  document.querySelectorAll('input[name="sidebarRating"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.filters.minRating = Number(radio.value) || 0;
      applyDealFilterAndRender();
    });
  });

  const inStockCb = $('sidebarInStockOnly');
  if (inStockCb) {
    inStockCb.addEventListener('change', () => {
      state.filters.inStockOnly = inStockCb.checked;
      applyDealFilterAndRender();
    });
  }

  const resetSidebar = () => {
    state.filters.priceRange = 'all';
    state.filters.brands.clear();
    state.filters.minRating = 0;
    state.filters.inStockOnly = false;

    const defaultPrice = document.querySelector('input[name="sidebarPrice"][value="all"]');
    if (defaultPrice) defaultPrice.checked = true;

    document.querySelectorAll('.brand-filter-cb').forEach((cb) => (cb.checked = false));

    const defaultRating = document.querySelector('input[name="sidebarRating"][value="0"]');
    if (defaultRating) defaultRating.checked = true;

    if (inStockCb) inStockCb.checked = false;

    applyDealFilterAndRender();
    toast('Filters cleared', 'info');
  };

  const clearBtn1 = $('clearAllFiltersSidebarBtn');
  const clearBtn2 = $('sidebarResetFiltersBtn');
  if (clearBtn1) clearBtn1.addEventListener('click', resetSidebar);
  if (clearBtn2) clearBtn2.addEventListener('click', resetSidebar);
}

function initPincodeLocation() {
  const pincodeDisplay = $('pincodeDisplay');
  const pincodeBtn = $('pincodeIndicatorBtn');
  const pincodeModal = $('pincodeModal');
  const closeModalBtn = $('closePincodeModalBtn');
  const pincodeForm = $('pincodeForm');
  const pincodeInput = $('pincodeInput');
  const useCurrentBtn = $('useCurrentLocationBtn');

  const savedPincode = localStorage.getItem('ca_pincode') || '560001';
  if (pincodeDisplay) pincodeDisplay.textContent = `📍 Deliver to ${savedPincode}`;

  if (pincodeBtn && pincodeModal) {
    pincodeBtn.addEventListener('click', () => {
      if (pincodeInput) pincodeInput.value = localStorage.getItem('ca_pincode') || '560001';
      openModal(pincodeModal);
      pincodeInput?.focus();
    });
  }

  if (closeModalBtn && pincodeModal) {
    closeModalBtn.addEventListener('click', () => closeModal(pincodeModal));
  }

  if (pincodeForm && pincodeModal) {
    pincodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = (pincodeInput?.value || '').trim();
      if (!/^\d{6}$/.test(code)) {
        toast('Please enter a valid 6-digit Indian PIN code (e.g. 560001)', 'error');
        return;
      }
      localStorage.setItem('ca_pincode', code);
      if (pincodeDisplay) pincodeDisplay.textContent = `📍 Deliver to ${code}`;
      closeModal(pincodeModal);
      toast(`Delivery location updated to PIN ${code}! Express shipping available.`, 'success');
    });
  }

  if (useCurrentBtn && pincodeModal) {
    useCurrentBtn.addEventListener('click', () => {
      const code = '560001';
      localStorage.setItem('ca_pincode', code);
      if (pincodeDisplay) pincodeDisplay.textContent = `📍 Deliver to ${code}`;
      closeModal(pincodeModal);
      toast(`Detected location: Bengaluru (PIN ${code}). Express delivery available!`, 'success');
    });
  }
}

function renderRecentlyViewed() {
  const section = $('recentlyViewedSection');
  const grid = $('recentlyViewedGrid');
  if (!section || !grid) return;

  let viewedIds = safeParseJSON(localStorage.getItem('ca_recently_viewed')) || [];
  if (!Array.isArray(viewedIds) || viewedIds.length === 0) {
    section.classList.add('hidden');
    return;
  }

  const items = viewedIds
    .map((id) => state.products.find((p) => p.id === Number(id)))
    .filter(Boolean)
    .slice(0, 6);

  if (items.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  grid.innerHTML = items
    .map(
      (p) => `
    <a href="product.html?id=${p.id}" class="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition">
      <div class="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-lg p-1.5 flex items-center justify-center shrink-0">
        <img src="${p.image}" alt="${escapeHtml(p.name)}" class="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition" onerror="this.src='https://placehold.co/100x100/f1f5f9/94a3b8?text=Item';" />
      </div>
      <div class="min-w-0 flex-1">
        <h4 class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">${escapeHtml(p.name)}</h4>
        <div class="flex items-center justify-between mt-1">
          <span class="text-xs font-bold text-slate-900 dark:text-white">${formatCurrency(p.price)}</span>
          <span class="text-[10px] text-amber-500 font-semibold">★ ${(p.rating || 4.5).toFixed(1)}</span>
        </div>
      </div>
    </a>
  `
    )
    .join('');

  const clearRecentBtn = $('clearRecentlyViewedBtn');
  if (clearRecentBtn && !clearRecentBtn._bound) {
    clearRecentBtn._bound = true;
    clearRecentBtn.addEventListener('click', () => {
      localStorage.removeItem('ca_recently_viewed');
      section.classList.add('hidden');
      toast('Cleared recently viewed history', 'info');
    });
  }
}

function initNewsletter() {
  const form = $('newsletterForm');
  const emailInput = $('newsletterEmail');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput?.value?.trim();
      if (!email || !email.includes('@')) {
        toast('Please enter a valid email address to subscribe.', 'error');
        return;
      }
      if (emailInput) emailInput.value = '';
      toast(`🎉 Thank you for subscribing! ₹500 welcome voucher sent to ${email}`, 'success');
      if (typeof fireConfetti === 'function') {
        fireConfetti(el.confettiCanvas || $('confettiCanvas'));
      }
    });
  }
}

function initFlashDealsTimer() {
  const hEl = $('flashHours');
  const mEl = $('flashMinutes');
  const sEl = $('flashSeconds');
  if (!hEl || !mEl || !sEl) return;

  let totalSeconds = 4 * 3600 + 45 * 60 + 22;
  function tick() {
    if (totalSeconds > 0) {
      totalSeconds--;
    } else {
      totalSeconds = 6 * 3600;
    }
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    hEl.textContent = String(h).padStart(2, '0');
    mEl.textContent = String(m).padStart(2, '0');
    sEl.textContent = String(s).padStart(2, '0');
  }
  setInterval(tick, 1000);
}

/* =========================================================
   HERO CIRCULAR SHOWCASE & RETAILER STORE SWITCHER ENGINE
   ========================================================= */
const HERO_RETAILER_STORES = [
  {
    id: 'amazon',
    name: 'Amazon',
    shortName: 'Amazon',
    productId: 1,
    title: 'Wireless Noise-Cancelling Headphones',
    desc: 'Precision-tuned custom 40mm acoustic drivers, military-grade ANC, and 32-hour ultra-low latency playback. Never overpay again with live cross-store price synchronization.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    price: 129.99,
    displayPrice: '₹14,999',
    originalPrice: '₹24,999',
    discountBadge: '-40% OFF',
    topRightBadge: '🔥 Lowest Price',
    bottomLeftBadge: 'Save ₹3,499 vs Flipkart',
    retailer: 'Amazon',
    iconSvg: `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="24" fill="#232F3E"/>
      <path d="M25.2 25.8c-.5-.3-1.1-.6-1.8-.6-1.8 0-3 .9-3 2.4 0 1.4.9 2.1 2.3 2.1 1.1 0 2-.6 2.6-1.4v-2.5zm2.4 5.7h-2.1v-1.2c-.9.9-2.1 1.5-3.6 1.5-2.4 0-4.2-1.5-4.2-3.9 0-2.7 2.1-4.1 5.4-4.1.8 0 1.5.2 2.1.3v-1.2c0-1.4-.9-2.1-2.6-2.1-1.2 0-2.4.5-3.3 1.1l-.9-1.5c1.2-.9 3-1.5 4.8-1.5 3 0 4.7 1.7 4.7 4.2v6.3c0 .9.2 1.7.6 2.1v.3z" fill="#FFFFFF"/>
      <path d="M12.8 32.7c5.7 3.9 14.1 3.9 20.3.3.5-.3 1.1.2.6.8-5.4 4.2-15.3 4.2-21.5-.3-.5-.5.1-1.1.6-.8z" fill="#FF9900"/>
      <path d="M34.2 31.8c-.6-.8-2.3-1.1-3.2-.9-.3.1-.3-.3-.1-.5 1.4-1.1 3.5-.8 3.8-.5.3.5 0 2.6-1.2 3.6-.2.2-.5.1-.3-.2.3-.6 1-1.5 1-1.5z" fill="#FF9900"/>
    </svg>`
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    shortName: 'Flipkart',
    productId: 1,
    title: 'Wireless Noise-Cancelling Headphones',
    desc: 'Precision-tuned custom 40mm acoustic drivers, military-grade ANC, and 32-hour ultra-low latency playback. Never overpay again with live cross-store price synchronization.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    price: 134.99,
    displayPrice: '₹15,499',
    originalPrice: '₹24,999',
    discountBadge: '-38% OFF',
    topRightBadge: '⚡ SuperCoins Deal',
    bottomLeftBadge: 'Save ₹2,999 vs Croma',
    retailer: 'Flipkart',
    iconSvg: `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="24" fill="#2874F0"/>
      <path d="M14 17h20l-2.3 21h-15.4L14 17z" fill="#FFE11B"/>
      <path d="M19.5 17v-4.5a4.5 4.5 0 0 1 9 0V17" stroke="#FFE11B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M28 20h-4.8v3h4.2v2.7h-4.2v6.8H20v-12.5h-1.8v-2.7H20v-1.2c0-2.8 1.6-4.4 4.6-4.4h3.4v3h-2.6c-1.4 0-1.4.8-1.4 1.4v1.2H28V20z" fill="#2874F0"/>
    </svg>`
  },
  {
    id: 'croma',
    name: 'Croma',
    shortName: 'Croma',
    productId: 1,
    title: 'Wireless Noise-Cancelling Headphones',
    desc: 'Precision-tuned custom 40mm acoustic drivers, military-grade ANC, and 32-hour ultra-low latency playback. Never overpay again with live cross-store price synchronization.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    price: 139.99,
    displayPrice: '₹15,999',
    originalPrice: '₹24,999',
    discountBadge: '-36% OFF',
    topRightBadge: '✓ In Stock at Store',
    bottomLeftBadge: 'Save ₹2,499 vs Reliance',
    retailer: 'Croma',
    iconSvg: `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="24" fill="#0F172A" stroke="#00E5D1" stroke-width="1.5"/>
      <circle cx="24" cy="24" r="15" stroke="#00E5D1" stroke-width="3.5" stroke-dasharray="70 20" stroke-linecap="round" transform="rotate(-40 24 24)"/>
      <circle cx="24" cy="24" r="5" fill="#00E5D1"/>
      <circle cx="31" cy="18" r="2.2" fill="#00E5D1"/>
    </svg>`
  }
];

const HERO_FEATURED_ITEMS = HERO_RETAILER_STORES;
let activeHeroStoreIndex = 0;
let activeHeroIndex = 0;
let heroQuantity = 1;

function renderHeroSwitcher() {
  const list = el.heroSwitcherList || $('heroSwitcherList');
  if (!list) return;

  list.innerHTML = HERO_RETAILER_STORES.map((store, idx) => {
    const isActive = idx === activeHeroStoreIndex;
    return `
      <button type="button" 
        class="hero-switcher-item flex flex-col items-center cursor-pointer group transition-all duration-200 select-none"
        data-store-idx="${idx}"
        data-hero-idx="${idx}"
        aria-label="Select ${store.name} price"
        title="${store.name} (${store.displayPrice})">
        <div class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-md backdrop-blur-md transition-all duration-300 ${
          isActive
            ? 'active ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-110'
            : 'border border-slate-700/80 hover:scale-105 opacity-85 hover:opacity-100 hover:border-indigo-400/60'
        }">
          ${store.iconSvg}
        </div>
        <span class="text-[11px] font-medium ${isActive ? 'text-indigo-400 font-bold' : 'text-slate-300'} tracking-tight leading-none mt-1.5 drop-shadow-xs">${store.shortName}</span>
      </button>
    `;
  }).join('');

  list.querySelectorAll('[data-store-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.storeIdx);
      selectHeroStore(idx);
    });
  });
}

function selectHeroStore(index) {
  activeHeroStoreIndex = index;
  activeHeroIndex = index;
  const store = HERO_RETAILER_STORES[index];
  if (!store) return;

  if (el.heroFeaturedPrice) {
    el.heroFeaturedPrice.style.transform = 'scale(0.95)';
    el.heroFeaturedPrice.textContent = store.displayPrice;
    setTimeout(() => {
      el.heroFeaturedPrice.style.transform = 'scale(1)';
    }, 150);
  }

  if (el.heroFeaturedOriginalPrice) {
    el.heroFeaturedOriginalPrice.textContent = store.originalPrice;
  }

  if (el.heroFeaturedDiscountBadge) {
    el.heroFeaturedDiscountBadge.textContent = store.discountBadge;
  }

  if (el.heroBadgeBottomLeftText) {
    el.heroBadgeBottomLeftText.textContent = store.bottomLeftBadge;
  }

  if (el.heroBadgeTopRightText) {
    el.heroBadgeTopRightText.textContent = store.topRightBadge;
  }

  renderHeroSwitcher();
  toast(`Selected ${store.name}: ${store.displayPrice} (${store.bottomLeftBadge})`, 'info');
}

const selectHeroFeatured = selectHeroStore;

function initHeroControls() {
  renderHeroSwitcher();

  // Quantity selector buttons
  if (el.heroQtyMinus) {
    el.heroQtyMinus.addEventListener('click', () => {
      if (heroQuantity > 1) {
        heroQuantity--;
        if (el.heroQtyCount) el.heroQtyCount.textContent = heroQuantity;
      }
    });
  }
  if (el.heroQtyPlus) {
    el.heroQtyPlus.addEventListener('click', () => {
      if (heroQuantity < 99) {
        heroQuantity++;
        if (el.heroQtyCount) el.heroQtyCount.textContent = heroQuantity;
      }
    });
  }

  // Primary Action Button: "⚡ Compare & Buy"
  if (el.heroCompareBuyBtn) {
    el.heroCompareBuyBtn.addEventListener('click', () => {
      const currentStore = HERO_RETAILER_STORES[activeHeroStoreIndex];
      addToCart(1, heroQuantity);
      toast(`Added ${heroQuantity}x "Wireless Noise-Cancelling Headphones" (${currentStore ? currentStore.name : 'Amazon'}) to cart! Opening multi-store comparison…`, 'success');
      if (typeof fireConfetti === 'function') {
        fireConfetti(el.confettiCanvas || $('confettiCanvas'));
      }
      openQuickView(1);
    });
  }

  // Interactive 90-Day Trend button opening Chart.js price trend
  const historyBtn = el.heroHistoryBtn || $('heroHistoryBtn');
  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      openPriceHistoryModal(1);
    });
  }

  // Hero showcase image direct click opens dedicated product page
  if (el.heroShowcaseImg) {
    el.heroShowcaseImg.addEventListener('click', () => {
      window.location.href = 'product.html?id=1';
    });
  }

  // Left floating rail quick category shortcuts
  document.querySelectorAll('.hero-rail-btn[data-category-target]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = btn.dataset.categoryTarget;
      selectCategory(cat);
    });
  });
}

/* =========================================================
   INTERACTIVE ANIME MASCOT AVATAR (AUTH MODAL)
   ========================================================= */
let mascotBlinkInterval = null;
let isPasswordVisible = false;

function setMascotBlink(enable) {
  if (mascotBlinkInterval) {
    clearInterval(mascotBlinkInterval);
    mascotBlinkInterval = null;
  }
  if (!enable) return;

  mascotBlinkInterval = setInterval(() => {
    const avatar = document.getElementById('auth-avatar-container');
    const eyelids = document.getElementById('avatar-eyelids');
    if (!avatar || !eyelids) return;

    const state = avatar.getAttribute('data-state') || 'neutral';
    if (state === 'neutral' || state === 'idle' || state === 'watching') {
      eyelids.style.opacity = '1';
      setTimeout(() => {
        const curState = avatar.getAttribute('data-state') || 'neutral';
        if (curState !== 'peek') {
          eyelids.style.opacity = '0';
        }
      }, 150);
    }
  }, 4000);
}

function triggerAvatarError() {
  const avatar = document.getElementById('auth-avatar-container');
  const blush = document.getElementById('avatar-blush');
  if (!avatar) return;

  avatar.classList.add('avatar-error-shake');
  if (blush) {
    blush.querySelectorAll('ellipse').forEach((el) => {
      el.setAttribute('fill', '#ef4444');
      el.setAttribute('opacity', '1');
    });
  }
  setTimeout(() => {
    avatar.classList.remove('avatar-error-shake');
    if (blush) {
      blush.querySelectorAll('ellipse').forEach((el) => {
        el.setAttribute('fill', 'url(#avatarBlushGrad)');
        el.setAttribute('opacity', '0.85');
      });
    }
  }, 600);
}

function triggerAvatarSuccess() {
  const avatar = document.getElementById('auth-avatar-container');
  const eyelids = document.getElementById('avatar-eyelids');
  const happyEyes = document.getElementById('avatar-happy-eyes');
  const pupilLeft = document.getElementById('avatar-pupil-left');
  const pupilRight = document.getElementById('avatar-pupil-right');
  const paws = document.getElementById('avatar-paws');

  if (!avatar) return;

  avatar.setAttribute('data-state', 'success');
  if (paws) paws.style.transform = 'translateY(0)';
  if (pupilLeft) pupilLeft.style.opacity = '0';
  if (pupilRight) pupilRight.style.opacity = '0';
  if (eyelids) eyelids.style.opacity = '0';
  if (happyEyes) {
    happyEyes.classList.remove('hidden');
    happyEyes.style.opacity = '1';
  }

  // Confetti burst for celebrating authentication
  if (typeof fireConfetti === 'function') {
    fireConfetti(el.confettiCanvas || $('confettiCanvas'));
  }
}

function initAnimeMascot() {
  const avatar = document.getElementById('auth-avatar') || document.getElementById('auth-avatar-container');
  if (!avatar) return;

  const emailInputs = [
    document.getElementById('auth-email'),
    document.getElementById('registerEmail')
  ].filter(Boolean);

  const passwordInputs = [
    document.getElementById('auth-password'),
    document.getElementById('registerPassword')
  ].filter(Boolean);

  const toggleBtn = document.getElementById('toggle-password-visibility');
  const eyeShow = document.getElementById('eye-icon-show');
  const eyeHide = document.getElementById('eye-icon-hide');
  const pupilLeft = document.getElementById('avatar-pupil-left');
  const pupilRight = document.getElementById('avatar-pupil-right');
  const paws = document.getElementById('avatar-paws');
  const eyelids = document.getElementById('avatar-eyelids');
  const blush = document.getElementById('avatar-blush');

  // Email input tracking: pupil downward on focus + horizontal travel with input text
  emailInputs.forEach((input) => {
    input.addEventListener('focus', () => {
      avatar.setAttribute('data-state', 'watching');
      avatar.classList.remove('idle-floating');
      avatar.style.transform = 'rotateY(0deg) scale(1)';
      if (paws) paws.style.transform = 'translateY(0)';
      if (eyelids) eyelids.style.opacity = '0';
      if (pupilLeft && pupilRight) {
        pupilLeft.style.opacity = '1';
        pupilRight.style.opacity = '1';
        const offset = Math.min(Math.max((input.value.length / 30) * 10 - 5, -5), 5);
        pupilLeft.style.transform = pupilRight.style.transform = `translate(${offset}px, 3px)`;
      }
    });

    input.addEventListener('input', () => {
      avatar.setAttribute('data-state', 'watching');
      if (pupilLeft && pupilRight) {
        const offset = Math.min(Math.max((input.value.length / 30) * 10 - 5, -5), 5);
        pupilLeft.style.transform = pupilRight.style.transform = `translate(${offset}px, 3px)`;
      }
    });

    input.addEventListener('blur', () => {
      const activeIsPassword = passwordInputs.some((p) => document.activeElement === p);
      if (!activeIsPassword) {
        avatar.setAttribute('data-state', 'neutral');
        avatar.classList.add('idle-floating');
        if (pupilLeft && pupilRight) {
          pupilLeft.style.transform = pupilRight.style.transform = 'translate(0px, 0px)';
        }
      }
    });
  });

  // Password input (Masked focus): trigger hands-up state covering eyes
  passwordInputs.forEach((input) => {
    input.addEventListener('focus', () => {
      avatar.classList.remove('idle-floating');
      if (isPasswordVisible) {
        avatar.setAttribute('data-state', 'turned-away');
        avatar.style.transform = 'rotateY(180deg) scale(0.95)';
        if (paws) paws.style.transform = 'translateY(0)';
      } else {
        avatar.setAttribute('data-state', 'peek');
        avatar.style.transform = 'rotateY(0deg) scale(1)';
        if (eyelids) eyelids.style.opacity = '1';
        if (pupilLeft && pupilRight) {
          pupilLeft.style.opacity = '0';
          pupilRight.style.opacity = '0';
        }
        if (paws) paws.style.transform = 'translateY(-28px)';
      }
    });

    input.addEventListener('input', () => {
      if (!isPasswordVisible) {
        avatar.setAttribute('data-state', 'peek');
        if (paws) paws.style.transform = 'translateY(-28px)';
        if (eyelids) eyelids.style.opacity = '1';
      }
    });

    input.addEventListener('blur', () => {
      const activeIsEmail = emailInputs.some((e) => document.activeElement === e);
      if (!activeIsEmail) {
        avatar.setAttribute('data-state', 'neutral');
        avatar.classList.add('idle-floating');
        avatar.style.transform = 'rotateY(0deg) scale(1)';
        if (paws) paws.style.transform = 'translateY(0)';
        if (eyelids) eyelids.style.opacity = '0';
        if (pupilLeft && pupilRight) {
          pupilLeft.style.opacity = '1';
          pupilRight.style.opacity = '1';
          pupilLeft.style.transform = pupilRight.style.transform = 'translate(0px, 0px)';
        }
      }
    });
  });

  // Show / Hide password toggle: flip 180deg or peek
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isPasswordVisible = !isPasswordVisible;
      const mainPass = document.getElementById('auth-password');
      if (mainPass) {
        mainPass.type = isPasswordVisible ? 'text' : 'password';
      }
      if (eyeShow && eyeHide) {
        eyeShow.classList.toggle('hidden', isPasswordVisible);
        eyeHide.classList.toggle('hidden', !isPasswordVisible);
      }

      if (isPasswordVisible) {
        avatar.setAttribute('data-state', 'turned-away');
        avatar.style.transform = 'rotateY(180deg) scale(0.95)';
        if (paws) paws.style.transform = 'translateY(0)';
        if (eyelids) eyelids.style.opacity = '0';
        if (pupilLeft && pupilRight) {
          pupilLeft.style.opacity = '1';
          pupilRight.style.opacity = '1';
        }
        if (blush) blush.style.opacity = '1';
      } else {
        avatar.setAttribute('data-state', 'peek');
        avatar.style.transform = 'rotateY(0deg) scale(1)';
        if (paws) paws.style.transform = 'translateY(-28px)';
        if (eyelids) eyelids.style.opacity = '1';
        if (pupilLeft && pupilRight) {
          pupilLeft.style.opacity = '0';
          pupilRight.style.opacity = '0';
        }
        if (blush) blush.style.opacity = '0.85';
      }
    });
  }
}

/* =========================================================
   SMARTBUY LINK SCANNER & ANALYZER
   ========================================================= */
function initLinkCompare() {
  const form = document.getElementById('linkCompareForm');
  const input = document.getElementById('deal-url-input') || document.getElementById('linkCompareInput');
  const btn = document.getElementById('scan-deal-btn') || document.getElementById('linkCompareBtn');
  const feedback = document.getElementById('linkCompareFeedback');
  if (!form || !input) return;

  if (input) {
    input.addEventListener('paste', () => {
      setTimeout(() => {
        if (input.value.trim() && form) {
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      }, 100);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = input.value.trim();
    if (!url) {
      if (feedback) {
        feedback.className = 'text-[11px] mt-2 font-medium text-rose-500 block';
        feedback.textContent = 'Please enter or paste an Amazon, Flipkart, or Croma product link.';
      }
      return;
    }

    if (feedback) {
      feedback.className = 'text-[11px] mt-2 font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2';
      feedback.innerHTML = `
        <span class="inline-block w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
        <span>Scanning Amazon India, Flipkart & Croma catalogs for live price match...</span>
      `;
      feedback.classList.remove('hidden');
    }
    if (btn) btn.disabled = true;

    // Simulated 900ms loading state before matching or filtering the item
    await new Promise((r) => setTimeout(r, 900));

    try {
      const res = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.success && data.matched && data.product) {
        const prod = data.product;
        const lowestStore = data.stores && data.stores.length > 0 ? data.stores[0] : null;
        const lowestPrice = lowestStore ? lowestStore.price : prod.base_price;
        const savingsText = data.summary?.savings > 0 ? `Save ₹${data.summary.savings.toLocaleString('en-IN')} vs other stores!` : 'Best verified rate across all retailers';

        if (feedback) {
          feedback.className = 'mt-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md block';
          feedback.innerHTML = `
            <div class="flex items-center gap-3">
              <img src="${escapeHtml(prod.image_url || prod.image)}" alt="${escapeHtml(prod.title || prod.name)}" class="w-12 h-12 object-contain rounded-xl bg-slate-50 dark:bg-slate-900 p-1 shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Match Found</span>
                  <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">${escapeHtml(prod.brand || 'Electronics')}</span>
                </div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">${escapeHtml(prod.title || prod.name)}</h4>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs font-extrabold text-blue-600 dark:text-blue-400">Lowest: ₹${lowestPrice.toLocaleString('en-IN')}</span>
                  ${lowestStore ? `<span class="text-[10px] font-bold text-slate-500">on ${escapeHtml(lowestStore.store_name)}</span>` : ''}
                  <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">• ${escapeHtml(savingsText)}</span>
                </div>
              </div>
              <a href="/product.html?id=${prod.id}" class="shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs">
                Inspect →
              </a>
            </div>
          `;
        }
      } else {
        if (feedback) {
          feedback.className = 'text-[11px] mt-2 font-medium text-amber-600 dark:text-amber-400 block';
          feedback.textContent = `No exact match for this link. Showing nearest deal recommendations below in catalog.`;
        }
      }
    } catch (err) {
      if (feedback) {
        feedback.className = 'text-[11px] mt-2 font-medium text-rose-500 block';
        feedback.textContent = 'Could not scan URL. Please verify your connection or try another link.';
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

/* =========================================================
   BUDGET QUICK CHIPS
   ========================================================= */
function initBudgetChips() {
  const container = document.getElementById('heroBudgetChips');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const chip = e.target.closest('.budget-chip');
    if (!chip) return;
    const budget = chip.getAttribute('data-budget');

    // Reset brand & rating filters
    state.filters.brands.clear();
    state.filters.minRating = 0;

    if (budget === 'deep_discount') {
      state.filters.deal = 'deep_discount';
      state.filters.priceRange = 'all';
    } else {
      const maxPrice = Number(budget);
      state.filters.priceRange = 'all';
      state.filters.deal = 'all';
      state.filters.maxPrice = maxPrice;
    }

    applyFilters();
    const grid = document.getElementById('productGrid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/* =========================================================
   VERIFIED STORE COUPONS
   ========================================================= */
async function loadVerifiedCoupons() {
  const list = document.getElementById('verifiedCouponList');
  if (!list) return;

  try {
    const res = await fetch('/api/coupons');
    const data = await res.json();
    const coupons = data.coupons || [];

    if (coupons.length === 0) {
      list.innerHTML = `<p class="col-span-full text-center text-xs text-slate-400 py-6">All coupons currently verified and in use.</p>`;
      return;
    }

    list.innerHTML = coupons.map((c) => {
      const storeLogo = c.store_name.toLowerCase().includes('amazon') ? '🛒 Amazon.in'
        : c.store_name.toLowerCase().includes('flipkart') ? '🛍️ Flipkart'
        : c.store_name.toLowerCase().includes('croma') ? '⚡ Croma'
        : c.store_name.toLowerCase().includes('reliance') ? '📱 Reliance'
        : '🏷️ ' + c.store_name;

      return `
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition flex flex-col justify-between gap-3 group">
          <div>
            <div class="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
              <span>${escapeHtml(storeLogo)}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold">✓ Verified</span>
            </div>
            <div class="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
              ${escapeHtml(c.discount_text)}
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Min. Order: ₹${Number(c.min_order_amount || 0).toLocaleString('en-IN')} &middot; Exp: ${escapeHtml(c.expiry_date || 'Ongoing')}
            </div>
          </div>
          <div class="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span class="flex-1 font-mono font-bold text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-center select-all">${escapeHtml(c.code)}</span>
            <button type="button" class="copy-coupon-btn px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shrink-0" data-code="${escapeHtml(c.code)}">
              Copy
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach 1-click copy handlers
    list.querySelectorAll('.copy-coupon-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const code = btn.getAttribute('data-code');
        try {
          await navigator.clipboard.writeText(code);
          const origText = btn.textContent;
          btn.textContent = '✓ Copied!';
          btn.classList.add('bg-emerald-600');
          btn.classList.remove('bg-blue-600');
          setTimeout(() => {
            btn.textContent = origText;
            btn.classList.remove('bg-emerald-600');
            btn.classList.add('bg-blue-600');
          }, 2000);
        } catch (_) {
          toast(`Code copied: ${code}`);
        }
      });
    });
  } catch (err) {
    console.warn('Failed to load verified coupons:', err);
  }
}

/* =========================================================
   AI SHOPPING ASSISTANT
   ========================================================= */
function initAiAssistant() {
  const floatingBtn = document.getElementById('aiAssistantFloatingBtn');
  const drawer = document.getElementById('aiAssistantDrawer');
  const backdrop = document.getElementById('aiAssistantBackdrop');
  const closeBtn = document.getElementById('closeAiAssistantBtn');
  const form = document.getElementById('aiAssistantForm');
  const input = document.getElementById('aiAssistantInput');
  const messages = document.getElementById('aiAssistantMessages');
  const promptChips = document.getElementById('aiPromptChips');

  if (!floatingBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.remove('translate-x-full');
    if (backdrop) backdrop.classList.remove('hidden');
    if (input) setTimeout(() => input.focus(), 300);
  }

  function closeDrawer() {
    drawer.classList.add('translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
  }

  floatingBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  if (promptChips) {
    promptChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.ai-prompt-chip');
      if (!chip) return;
      if (input) {
        input.value = chip.textContent.trim();
        form.dispatchEvent(new Event('submit'));
      }
    });
  }

  if (form && input && messages) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userText = input.value.trim();
      if (!userText) return;

      // Append user bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'flex items-start justify-end gap-2';
      userBubble.innerHTML = `
        <div class="p-3 rounded-2xl bg-blue-600 text-white text-xs max-w-[85%] font-medium shadow-xs">
          ${escapeHtml(userText)}
        </div>
      `;
      messages.appendChild(userBubble);
      input.value = '';

      // Append loading bubble
      const loadingBubble = document.createElement('div');
      loadingBubble.className = 'flex items-start gap-3';
      loadingBubble.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 font-bold">AI</div>
        <div class="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span class="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Analyzing multi-store listings & price trends…</span>
        </div>
      `;
      messages.appendChild(loadingBubble);
      messages.scrollTop = messages.scrollHeight;

      try {
        const res = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userText }),
        });
        const data = await res.json();
        loadingBubble.remove();

        const aiBubble = document.createElement('div');
        aiBubble.className = 'flex items-start gap-3';

        let recsHtml = '';
        if (data.recommendations && data.recommendations.length > 0) {
          recsHtml = `
            <div class="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recommended Matches:</span>
              ${data.recommendations.map(r => `
                <a href="/product.html?id=${r.id}" class="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition shadow-2xs group">
                  <img src="${escapeHtml(r.image_url || r.image)}" alt="${escapeHtml(r.title || r.name)}" class="w-10 h-10 object-contain rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800 shrink-0" />
                  <div class="min-w-0 flex-1">
                    <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition">${escapeHtml(r.title || r.name)}</h5>
                    <div class="flex items-center gap-2 text-[11px] mt-0.5">
                      <span class="font-extrabold text-blue-600 dark:text-blue-400">₹${Number(r.base_price || r.price).toLocaleString('en-IN')}</span>
                      ${r.best_store ? `<span class="text-[10px] font-bold text-slate-500">on ${escapeHtml(r.best_store)}</span>` : ''}
                    </div>
                  </div>
                  <span class="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition shrink-0">→</span>
                </a>
              `).join('')}
            </div>
          `;
        }

        aiBubble.innerHTML = `
          <div class="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 font-bold">AI</div>
          <div class="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 space-y-1.5 max-w-[85%] shadow-xs">
            <p class="leading-relaxed whitespace-pre-line">${escapeHtml(data.answer)}</p>
            ${recsHtml}
          </div>
        `;
        messages.appendChild(aiBubble);
      } catch (err) {
        loadingBubble.remove();
        const errBubble = document.createElement('div');
        errBubble.className = 'flex items-start gap-3';
        errBubble.innerHTML = `
          <div class="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shrink-0 font-bold">!</div>
          <div class="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-xs text-rose-700 dark:text-rose-300">
            Sorry, I could not complete that query. Please try again or rephrase your request.
          </div>
        `;
        messages.appendChild(errBubble);
      }
      messages.scrollTop = messages.scrollHeight;
    });
  }
}

/* =========================================================
   TRACKED ALERTS & WISHLIST DASHBOARD MODAL
   ========================================================= */
function initAlertsAndWishlistModal() {
  const openAlertsBtn = document.getElementById('trackedAlertsNavBtn');
  const openWishlistBtn = document.getElementById('wishlistNavBtn');
  const modal = document.getElementById('alertsDashboardModal');
  const closeBtn = document.getElementById('closeAlertsDashboardBtn');
  const tabAlerts = document.getElementById('tabAlertsBtn');
  const tabWishlist = document.getElementById('tabWishlistBtn');
  const alertsContainer = document.getElementById('alertsContainer');
  const wishlistContainer = document.getElementById('wishlistContainer');
  const alertsCount = document.getElementById('alertsCount');
  const alertsModalCount = document.getElementById('alertsModalCount');
  const wishlistModalCount = document.getElementById('wishlistModalCount');

  if (!modal) return;

  function openModal(defaultTab = 'alerts') {
    modal.classList.remove('hidden');
    if (defaultTab === 'wishlist') {
      showWishlistTab();
    } else {
      showAlertsTab();
    }
    loadAlertsData();
    loadWishlistData();
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  function showAlertsTab() {
    if (tabAlerts && tabWishlist) {
      tabAlerts.className = 'alerts-tab-btn active pb-3 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 cursor-pointer';
      tabWishlist.className = 'alerts-tab-btn pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-b-2 border-transparent cursor-pointer';
    }
    if (alertsContainer) alertsContainer.classList.remove('hidden');
    if (wishlistContainer) wishlistContainer.classList.add('hidden');
  }

  function showWishlistTab() {
    if (tabAlerts && tabWishlist) {
      tabWishlist.className = 'alerts-tab-btn active pb-3 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 cursor-pointer';
      tabAlerts.className = 'alerts-tab-btn pb-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-b-2 border-transparent cursor-pointer';
    }
    if (wishlistContainer) wishlistContainer.classList.remove('hidden');
    if (alertsContainer) alertsContainer.classList.add('hidden');
  }

  if (openAlertsBtn) openAlertsBtn.addEventListener('click', () => openModal('alerts'));
  if (openWishlistBtn) openWishlistBtn.addEventListener('click', () => openModal('wishlist'));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (tabAlerts) tabAlerts.addEventListener('click', showAlertsTab);
  if (tabWishlist) tabWishlist.addEventListener('click', showWishlistTab);

  async function loadAlertsData() {
    if (!alertsContainer) return;
    alertsContainer.innerHTML = `
      <div class="flex items-center justify-center py-8 text-xs text-slate-400 gap-2">
        <span class="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
        <span>Loading active price drop trackers…</span>
      </div>
    `;

    try {
      const res = await fetch('/api/alerts?email=demo@smartbuy.in');
      const data = await res.json();
      const alerts = data.alerts || [];

      if (alertsCount) {
        alertsCount.textContent = alerts.length;
        alertsCount.classList.toggle('hidden', alerts.length === 0);
      }
      if (alertsModalCount) alertsModalCount.textContent = alerts.length;

      if (alerts.length === 0) {
        alertsContainer.innerHTML = `
          <div class="text-center py-10 space-y-2">
            <span class="text-3xl">🔔</span>
            <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200">No active price alerts</h4>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Open any product page and click "Set Price Drop Alert" to track drops across Amazon, Flipkart & Croma.</p>
          </div>
        `;
        return;
      }

      alertsContainer.innerHTML = alerts.map((a) => {
        const isTriggered = a.status === 'triggered' || (a.current_price && a.current_price <= a.target_price);
        return `
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 min-w-0">
              <img src="${escapeHtml(a.image_url || a.image || 'https://placehold.co/100')}" alt="${escapeHtml(a.product_title || 'Product')}" class="w-12 h-12 object-contain rounded-xl bg-slate-50 dark:bg-slate-800 p-1 shrink-0" />
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isTriggered ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'}">
                    ${isTriggered ? '⚡ Target Hit!' : 'Tracking Active'}
                  </span>
                </div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">${escapeHtml(a.product_title || 'Smart Product')}</h4>
                <div class="flex items-center gap-3 text-xs mt-0.5">
                  <span class="font-medium text-slate-500">Target: <strong class="text-slate-900 dark:text-white font-mono">₹${Number(a.target_price).toLocaleString('en-IN')}</strong></span>
                  <span class="font-medium text-slate-500">Current: <strong class="text-blue-600 dark:text-blue-400 font-mono">₹${Number(a.current_price || a.target_price).toLocaleString('en-IN')}</strong></span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <a href="/product.html?id=${a.product_id}" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition">
                View
              </a>
              <button type="button" class="delete-alert-btn p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer" data-id="${a.id}" title="Cancel Alert">
                🗑️
              </button>
            </div>
          </div>
        `;
      }).join('');

      alertsContainer.querySelectorAll('.delete-alert-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          try {
            await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
            toast('Price tracker cancelled');
            loadAlertsData();
          } catch (e) {
            toast('Failed to cancel tracker', 'error');
          }
        });
      });
    } catch (err) {
      alertsContainer.innerHTML = `<p class="text-center text-xs text-rose-500 py-6">Could not load alerts.</p>`;
    }
  }

  async function loadWishlistData() {
    if (!wishlistContainer) return;
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      const items = data.items || [];

      if (wishlistModalCount) wishlistModalCount.textContent = items.length;

      if (items.length === 0) {
        wishlistContainer.innerHTML = `
          <div class="text-center py-10 space-y-2">
            <span class="text-3xl">❤️</span>
            <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200">Your wishlist is empty</h4>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">Click the heart icon on any product card to save deals to your personal collection.</p>
          </div>
        `;
        return;
      }

      wishlistContainer.innerHTML = items.map((w) => `
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <img src="${escapeHtml(w.image_url || w.image || 'https://placehold.co/100')}" alt="${escapeHtml(w.title || 'Product')}" class="w-12 h-12 object-contain rounded-xl bg-slate-50 dark:bg-slate-800 p-1 shrink-0" />
            <div class="min-w-0">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${escapeHtml(w.brand || 'Tech')}</span>
              <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">${escapeHtml(w.title || 'Smart Product')}</h4>
              <div class="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                ₹${Number(w.base_price || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <a href="/product.html?id=${w.product_id}" class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition">
              View Deal
            </a>
            <button type="button" class="delete-wishlist-btn p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer" data-id="${w.id}" title="Remove from wishlist">
              ✕
            </button>
          </div>
        </div>
      `).join('');

      wishlistContainer.querySelectorAll('.delete-wishlist-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          try {
            await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
            toast('Removed from wishlist');
            loadWishlistData();
          } catch (e) {
            toast('Failed to remove item', 'error');
          }
        });
      });
    } catch (err) {
      wishlistContainer.innerHTML = `<p class="text-center text-xs text-rose-500 py-6">Could not load wishlist.</p>`;
    }
  }
}

/* =========================================================
   INIT
   ========================================================= */
async function init() {
  initThemeToggle();
  initHeroControls();
  initFlashDealsTimer();
  initAnimeMascot();
  initPincodeLocation();
  initNewsletter();
  initLinkCompare();
  initBudgetChips();
  initAiAssistant();
  initAlertsAndWishlistModal();
  loadVerifiedCoupons();
  el.year.textContent = new Date().getFullYear();
  renderCategoryChips();
  renderElectroCategoryTiles();
  renderWishlistBadges();
  renderCartBadge();
  updateAuthUI();
  wireEvents();
  await fetchProducts();
  renderRecentlyViewed();
  checkUrlHash();
}

document.addEventListener('DOMContentLoaded', init);

