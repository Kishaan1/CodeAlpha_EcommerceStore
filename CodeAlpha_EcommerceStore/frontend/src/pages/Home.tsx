import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, TrendingDown, Percent, Layers, BarChart2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlScanInput, setUrlScanInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load products', err);
        setLoading(false);
      });
  }, []);

  const handleUrlScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlScanInput.trim()) return;
    setScanning(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlScanInput })
      });
      const data = await res.json();
      setScanResult(data.product || data.match || null);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const categories = [
    { name: 'Electronics', icon: '🎧', desc: 'Headphones, Audio & Tech' },
    { name: 'Mobiles', icon: '📱', desc: 'Smartphones & Flagships' },
    { name: 'Laptops', icon: '💻', desc: 'Productivity & Gaming' },
    { name: 'Fashion', icon: '👟', desc: 'Sneakers, Watches & Apparel' },
    { name: 'Home & Kitchen', icon: '☕', desc: 'Coffee, Décor & Essentials' },
    { name: 'Gaming', icon: '🎮', desc: 'Consoles, Accessories & Gear' }
  ];

  const deals = products.slice(0, 4);
  const trending = products.slice(4, 8);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Stage */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-white dark:from-[#0B0F19] dark:to-slate-900 border-b border-[#E7E5E0] dark:border-slate-800 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Headline Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#191919]/5 dark:bg-white/10 text-[#D94F32] font-extrabold text-xs tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Retailer Price Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#191919] dark:text-white tracking-tight leading-[1.1]">
              Good Finds. <br />
              <span className="text-[#D94F32]">Better Prices.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Vybe Bot AI Radar tracks live prices across Amazon.in, Flipkart, Croma, and Reliance Digital. Stop overpaying on tech, lifestyle, and electronics.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/catalog"
                className="px-6 py-3.5 rounded-full bg-[#191919] dark:bg-white text-white dark:text-[#191919] hover:bg-[#D94F32] dark:hover:bg-[#D94F32] dark:hover:text-white font-bold text-sm transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Verified Deals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/compare"
                className="px-6 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#191919] dark:text-white font-bold text-sm transition cursor-pointer"
              >
                Compare Prices
              </Link>
            </div>

            {/* URL Paste Scanner */}
            <div className="pt-4 max-w-lg">
              <form onSubmit={handleUrlScan} className="relative flex items-center">
                <input
                  type="url"
                  value={urlScanInput}
                  onChange={e => setUrlScanInput(e.target.value)}
                  placeholder="Paste any Amazon or Flipkart URL to inspect..."
                  className="w-full bg-white dark:bg-slate-800 text-xs px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm pr-24 focus:outline-none focus:border-[#D94F32]"
                />
                <button
                  type="submit"
                  disabled={scanning}
                  className="absolute right-1.5 px-3.5 py-2 bg-[#D94F32] hover:bg-[#BF3F24] text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {scanning ? 'Scanning...' : 'Scan URL'}
                </button>
              </form>

              {scanResult && (
                <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-900 dark:text-emerald-200">
                      Found: {scanResult.title || scanResult.name}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Best Price: ₹{(scanResult.currentLowestPrice || scanResult.lowest_price)?.toLocaleString('en-IN')} on {scanResult.lowestStore || scanResult.lowest_store || 'Amazon.in'}
                    </p>
                  </div>
                  <Link
                    to={`/product/${scanResult.id}`}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
                  >
                    View
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Mascot Hero Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-[#D94F32]/10 p-8 flex flex-col items-center justify-center border border-white/60 dark:border-slate-800 shadow-2xl backdrop-blur-md">
              <img
                src="/assets/vybe-mascot.png"
                alt="Vybe Bot 3D Mascot"
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain drop-shadow-2xl animate-pulse"
              />

              {/* Float Chip 1 */}
              <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md text-xs font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Live Price Match</span>
              </div>

              {/* Float Chip 2 */}
              <div className="absolute bottom-6 right-6 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md text-xs font-bold flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                <span>180-Day History Low</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Tiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#191919] dark:text-white">
              Browse Categories
            </h2>
            <p className="text-xs text-slate-500">Intelligent discovery across verified retailers</p>
          </div>
          <Link to="/catalog" className="text-xs font-bold text-[#D94F32] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map(cat => (
            <Link
              key={cat.name}
              to={`/catalog?category=${encodeURIComponent(cat.name)}`}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#D94F32] transition group text-center space-y-2 shadow-2xs"
            >
              <div className="text-3xl transition-transform group-hover:scale-110">{cat.icon}</div>
              <h3 className="font-bold text-xs text-[#191919] dark:text-white group-hover:text-[#D94F32] transition">
                {cat.name}
              </h3>
              <p className="text-[10px] text-slate-400 line-clamp-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Today's Flash Deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#191919] dark:text-white">
                Today's Best Discounts
              </h2>
              <p className="text-xs text-slate-500">Verified price drops with real store comparisons</p>
            </div>
          </div>
          <Link to="/catalog?sort=discount" className="text-xs font-bold text-[#D94F32] hover:underline">
            See all deals &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {deals.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600">
              <TrendingDown className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#191919] dark:text-white">
                Trending on Vybe Radar
              </h2>
              <p className="text-xs text-slate-500">Most compared & tracked items this week</p>
            </div>
          </div>
          <Link to="/catalog" className="text-xs font-bold text-[#D94F32] hover:underline">
            View full catalog &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {trending.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 5. Trust & Architecture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E7E5E0] dark:border-slate-800 p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base">Verified Multi-Store Match</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We never fabricate discounts or prices. Each product comparison is computed directly from live listings on Amazon.in, Flipkart, and Croma.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center font-bold">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base">180-Day Price Radar</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Inspect historical lows, highs, and averages before you buy so you know if today's sale price is a genuine bargain or an artificial markup.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center font-bold">
              <Percent className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base">Automated Coupon Intelligence</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Save time with our coupon auto-scanner testing verified codes such as BUYHATKE20 and AMZFLAT500 directly in your cart.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
