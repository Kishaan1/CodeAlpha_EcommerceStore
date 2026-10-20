import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Sun,
  Moon,
  Sparkles,
  MapPin,
  X,
  Menu
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    cartCount,
    wishlist,
    user,
    logout,
    openAuthModal,
    openCartDrawer
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    'All',
    'Electronics',
    'Mobiles',
    'Laptops',
    'Fashion',
    'Home & Kitchen',
    'Gaming',
    'Audio'
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 border-b border-[#E7E5E0] dark:border-slate-800 backdrop-blur-md transition-colors">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#F2E9DC] dark:bg-[#10182B] text-[#191919] dark:text-[#E2E8F0] text-[11px] font-medium py-1.5 px-4 border-b border-[#E7E5E0] dark:border-[#26334A]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="font-bold text-[#D94F32] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> VYBE BOT AI RADAR
            </span>
            <span className="text-[#888888] hidden sm:inline">•</span>
            <span className="text-[#686868] dark:text-slate-400 hidden sm:inline">
              LIVE COMPARISON: AMAZON.IN • FLIPKART • CROMA • RELIANCE DIGITAL
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1 text-xs text-[#191919] dark:text-slate-200">
              <MapPin className="w-3 h-3 text-[#D94F32]" />
              <span>Deliver to 560001</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Header Shell */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-[#191919] dark:bg-white text-white dark:text-[#191919] flex items-center justify-center font-black text-lg transition-transform group-hover:scale-105">
            VB
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#191919] dark:text-white leading-none">
              VYBE BOT
            </span>
            <span className="text-[10px] tracking-widest text-[#D94F32] font-semibold mt-0.5">
              AI RADAR
            </span>
          </div>
        </Link>

        {/* Global Omnibar Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden md:block">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, or compare Amazon & Flipkart prices..."
              className="w-full bg-[#F7F7F4] dark:bg-slate-800/90 text-[#191919] dark:text-white placeholder-slate-400 pl-11 pr-24 py-2.5 rounded-full border border-[#E7E5E0] dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94F32]/30 focus:border-[#D94F32] transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4" />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 bg-[#191919] dark:bg-white text-white dark:text-[#191919] hover:bg-[#D94F32] dark:hover:bg-[#D94F32] dark:hover:text-white text-xs font-bold rounded-full transition cursor-pointer"
            >
              Scan
            </button>
          </div>
        </form>

        {/* Right Actions Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Wishlist Link */}
          <Link
            to="/catalog?filter=wishlist"
            className="relative p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D94F32] text-white text-[10px] font-bold flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={openCartDrawer}
            className="relative p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-[#191919] dark:bg-white text-white dark:text-[#191919] text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Button / Dropdown */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#E7E5E0] dark:border-slate-700 bg-[#F7F7F4] dark:bg-slate-800 text-xs font-bold text-[#191919] dark:text-white cursor-pointer hover:border-[#D94F32] transition"
                >
                  <div className="w-6 h-6 rounded-full bg-[#D94F32] text-white flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[80px] truncate">{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-[#E7E5E0] dark:border-slate-700 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Account Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#191919] dark:bg-white text-white dark:text-[#191919] text-xs font-bold hover:bg-[#D94F32] dark:hover:bg-[#D94F32] dark:hover:text-white transition shadow-sm cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. Category Strip */}
      <nav className="border-t border-[#E7E5E0] dark:border-slate-800 bg-[#FAF7F2] dark:bg-slate-900/60 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 sm:gap-2 py-2 text-xs font-semibold whitespace-nowrap">
          {categories.map(cat => (
            <Link
              key={cat}
              to={cat === 'All' ? '/catalog' : `/catalog?category=${encodeURIComponent(cat)}`}
              className="px-3 py-1 rounded-full text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-[#D94F32] transition"
            >
              {cat}
            </Link>
          ))}
          <Link
            to="/compare"
            className="ml-auto px-3 py-1 rounded-full bg-[#D94F32]/10 text-[#D94F32] font-bold hover:bg-[#D94F32] hover:text-white transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Multi-Store Radar</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full bg-[#F7F7F4] dark:bg-slate-800 px-4 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </form>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-center text-xs font-bold"
            >
              All Products
            </Link>
            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-[#D94F32]/10 text-[#D94F32] text-center text-xs font-bold"
            >
              Price Compare
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
