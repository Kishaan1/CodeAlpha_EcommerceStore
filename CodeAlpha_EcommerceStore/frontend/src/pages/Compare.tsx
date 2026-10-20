import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, ExternalLink, ShieldCheck, TrendingDown, ArrowRight } from 'lucide-react';
import type { Product, StoreListing } from '../types';

export const Compare: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(id ? Number(id) : 1);
  const [listings, setListings] = useState<StoreListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || []);
        if (!id && d.products && d.products.length > 0) {
          setSelectedProductId(d.products[0].id);
        }
      });
  }, [id]);

  useEffect(() => {
    if (!selectedProductId) return;
    setLoading(true);
    fetch(`/api/products/${selectedProductId}/compare`)
      .then(r => r.json())
      .then(d => {
        setListings(d.stores || d.listings || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedProductId]);

  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D94F32]/10 text-[#D94F32] font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligence Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#191919] dark:text-white tracking-tight">
          Multi-Retailer Price Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Side-by-side comparison across authorized Indian marketplaces. Match identical models and inspect shipping, bank discounts, and net lowest price.
        </p>
      </div>

      {/* Product Selector Dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-slate-900 border border-[#E7E5E0] dark:border-slate-800">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Compare Product:</label>
        <select
          value={selectedProductId}
          onChange={e => setSelectedProductId(Number(e.target.value))}
          className="flex-1 bg-white dark:bg-slate-800 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[#191919] dark:text-white focus:outline-none"
        >
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} — ₹{p.price.toLocaleString('en-IN')}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Product Banner */}
      {activeProduct && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E7E5E0] dark:border-slate-800 items-center">
          <div className="md:col-span-3 flex justify-center p-4 bg-[#FAF7F2] dark:bg-slate-800/40 rounded-2xl">
            <img
              src={activeProduct.image || activeProduct.image_url}
              alt={activeProduct.name}
              className="h-36 w-auto object-contain"
            />
          </div>
          <div className="md:col-span-9 space-y-2">
            <span className="text-xs font-bold text-[#D94F32] uppercase">{activeProduct.brand}</span>
            <h2 className="text-xl font-extrabold text-[#191919] dark:text-white">{activeProduct.name}</h2>
            <p className="text-xs text-slate-500 line-clamp-2">{activeProduct.description}</p>
            <div className="pt-2 flex items-center gap-4 text-xs font-bold">
              <span className="text-emerald-600">
                Verified Lowest: ₹{activeProduct.price.toLocaleString('en-IN')}
              </span>
              <Link
                to={`/product/${activeProduct.id}`}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              >
                <span>Full Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Grid */}
      <section className="space-y-4">
        <h3 className="font-extrabold text-lg text-[#191919] dark:text-white">
          Active Retailer Offers ({listings.length})
        </h3>

        {loading ? (
          <div className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((l, idx) => (
              <div
                key={l.id || idx}
                className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                  idx === 0
                    ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">{l.store_name}</span>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                        Lowest
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-black text-[#191919] dark:text-white">
                      ₹{l.price?.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      Delivery: {l.delivery_charge === 0 ? 'FREE' : `+₹${l.delivery_charge}`}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {l.bank_offer || 'Standard marketplace offer applies.'}
                  </p>
                </div>

                <a
                  href={l.store_url || 'https://amazon.in'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#D94F32] hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <span>Go to {l.store_name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
