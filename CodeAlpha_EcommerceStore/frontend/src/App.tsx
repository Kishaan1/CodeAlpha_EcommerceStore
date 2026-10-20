import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Compare } from './pages/Compare';
import { Checkout } from './pages/Checkout';
import { Account } from './pages/Account';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F7F7F4] dark:bg-[#0B0F19] text-[#191919] dark:text-[#F8FAFC] transition-colors selection:bg-[#D94F32] selection:text-white">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/compare/:id" element={<Compare />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account" element={<Account />} />
            </Routes>
          </main>

          {/* Site-wide Modals & Drawers */}
          <AuthModal />
          <CartDrawer />

          {/* Footer */}
          <footer className="border-t border-[#E7E5E0] dark:border-slate-800 bg-[#FAF7F2] dark:bg-slate-900/90 py-12 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-3">
                <span className="font-extrabold text-base text-[#191919] dark:text-white">
                  VYBE BOT AI RADAR
                </span>
                <p className="text-xs leading-relaxed">
                  Real-time multi-retailer intelligence across Amazon.in, Flipkart, Croma, and Reliance Digital. Good finds. Better prices.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Catalog</h4>
                <ul className="space-y-1.5">
                  <li><a href="/catalog?category=Electronics" className="hover:underline">Electronics</a></li>
                  <li><a href="/catalog?category=Mobiles" className="hover:underline">Mobiles & Flagships</a></li>
                  <li><a href="/catalog?category=Fashion" className="hover:underline">Fashion & Lifestyle</a></li>
                  <li><a href="/catalog?category=Home%20%26%20Kitchen" className="hover:underline">Home & Kitchen</a></li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Intelligence</h4>
                <ul className="space-y-1.5">
                  <li><a href="/compare" className="hover:underline">Multi-Store Price Radar</a></li>
                  <li><a href="/catalog?sort=discount" className="hover:underline">Today's Deals</a></li>
                  <li><a href="/account" className="hover:underline">Price Drop Watchlist</a></li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Policies & Security</h4>
                <p className="text-[11px] leading-relaxed">
                  Data matched via authorized feeds and public store comparison indices. Prices refreshed periodically. All trademarks belong to respective store owners.
                </p>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
              <p>&copy; {new Date().getFullYear()} VYBE BOT AI RADAR. Built with React, TypeScript & Vite.</p>
              <div className="flex gap-4">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Security</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
