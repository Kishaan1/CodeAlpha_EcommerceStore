import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';
import { useApp } from '../context/AppContext';

export const Catalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || '';
  const filterType = searchParams.get('filter') || '';
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(100000);

  useEffect(() => {
    setLoading(true);
    let url = `/api/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        let list: Product[] = data.products || [];
        if (filterType === 'wishlist') {
          list = list.filter(p => wishlist.includes(p.id));
        }
        setProducts(list);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [search, category, sort, filterType, wishlist]);

  // Client-side filtering for brand and price
  const brands = ['All', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))];
  const filteredProducts = products.filter(p => {
    const matchBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchPrice = p.price <= maxPrice;
    return matchBrand && matchPrice;
  });

  const clearFilters = () => {
    setSearchParams({});
    setSelectedBrand('All');
    setMaxPrice(100000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Sort Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E5E0] dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#191919] dark:text-white tracking-tight">
            {filterType === 'wishlist' ? 'My Saved Wishlist' : category !== 'All' ? category : search ? `Search: "${search}"` : 'All Products'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {filteredProducts.length} verified products with price radar
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Sort by:</label>
          <select
            value={sort}
            onChange={e => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value) next.set('sort', e.target.value);
              else next.delete('sort');
              setSearchParams(next);
            }}
            className="bg-white dark:bg-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[#191919] dark:text-white focus:outline-none"
          >
            <option value="">Featured / Best Deal</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6 bg-[#FAF7F2] dark:bg-slate-900/60 p-5 rounded-3xl border border-[#E7E5E0] dark:border-slate-800 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="font-extrabold text-sm flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#D94F32]" /> Filters
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-bold text-[#D94F32] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Category
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Electronics', 'Mobiles', 'Fashion', 'Home & Kitchen', 'Gaming'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    if (c === 'All') next.delete('category');
                    else next.set('category', c);
                    setSearchParams(next);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    category === c
                      ? 'bg-[#191919] dark:bg-white text-white dark:text-[#191919]'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#D94F32]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Brand
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {brands.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBrand(b)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                    selectedBrand === b
                      ? 'bg-[#D94F32]/10 text-[#D94F32] font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Max Budget</span>
              <span>₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={150000}
              step={1000}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#D94F32]"
            />
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-3xl">🔍</div>
              <h3 className="font-bold text-base">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your budget or clearing search filters to see all available deals.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 rounded-full bg-[#191919] dark:bg-white text-white dark:text-[#191919] text-xs font-bold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
