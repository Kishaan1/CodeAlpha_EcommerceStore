import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  TrendingDown,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ExternalLink,
  Bell,
  Sparkles
} from 'lucide-react';
import type { Product, StoreListing } from '../types';
import { useApp } from '../context/AppContext';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, addRecentlyViewed, user, openAuthModal } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [compareListings, setCompareListings] = useState<StoreListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/products/${id}`).then(r => r.json()),
      fetch(`/api/products/${id}/compare`).then(r => r.json())
    ])
      .then(([prodData, compData]) => {
        if (prodData.product) {
          setProduct(prodData.product);
          addRecentlyViewed(prodData.product);
        }
        if (compData.stores || compData.listings) {
          setCompareListings(compData.stores || compData.listings || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handlePriceAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!targetPrice) return;

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: Number(id),
          email: user.email,
          targetPrice: Number(targetPrice)
        })
      });
      if (res.ok) {
        setAlertSuccess(`✓ Price alert active! We'll notify ${user.email} when price drops below ₹${Number(targetPrice).toLocaleString('en-IN')}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#D94F32] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Retrieving real-time multi-store offers...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <Link to="/catalog" className="text-xs font-bold text-[#D94F32]">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const discount = product.max_discount_pct || 25;
  const originalPrice = Math.round(product.price * (1 + discount / 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-400 flex items-center gap-2">
        <Link to="/" className="hover:text-slate-600 dark:hover:text-white">Home</Link>
        <span>/</span>
        <Link to={`/catalog?category=${encodeURIComponent(product.category)}`} className="hover:text-slate-600 dark:hover:text-white">{product.category}</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Gallery & Zoom Showcase */}
        <div className="lg:col-span-6 bg-[#FAF7F2] dark:bg-slate-800/40 p-8 rounded-3xl border border-[#E7E5E0] dark:border-slate-800 flex items-center justify-center relative min-h-[420px]">
          <img
            src={product.image || product.image_url}
            alt={product.name}
            className="max-h-96 w-auto object-contain drop-shadow-xl"
          />
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md cursor-pointer transition ${
              wishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
          </button>
        </div>

        {/* Right: Pricing, Actions & Buy Buttons */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#D94F32] uppercase tracking-wider">{product.brand}</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#191919] dark:text-white tracking-tight leading-snug">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating || 4.7}</span>
              </div>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{product.reviews_count || 120} verified ratings</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-600 font-bold">In Stock ({product.stock} units)</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/50 border border-[#E7E5E0] dark:border-slate-800 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#191919] dark:text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-slate-400 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#D94F32] text-white text-xs font-bold">
                {discount}% OFF
              </span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Lowest observed price among verified retailers in India
            </p>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="py-3.5 rounded-2xl bg-[#191919] dark:bg-white text-white dark:text-[#191919] hover:bg-[#D94F32] dark:hover:bg-[#D94F32] dark:hover:text-white font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <button
              type="button"
              onClick={() => {
                addToCart(product, 1);
                navigate('/checkout');
              }}
              className="py-3.5 rounded-2xl bg-[#D94F32] hover:bg-[#BF3F24] text-white font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Buy Now</span>
            </button>
          </div>

          {/* Description & Specs */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-[#191919] dark:text-white">Product Overview</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#D94F32]" />
              <span>Next-Day Dispatch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-[#D94F32]" />
              <span>7-Day Return</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D94F32]" />
              <span>Brand Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Store Comparison Radar Table */}
      <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#191919] dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D94F32]" />
              Live Multi-Store Price Radar
            </h2>
            <p className="text-xs text-slate-500">Comparing real prices and offers across Indian retailers</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-[#E7E5E0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Retailer Store</th>
                <th className="py-3 px-4">Current Price</th>
                <th className="py-3 px-4">Delivery</th>
                <th className="py-3 px-4">Bank Discount</th>
                <th className="py-3 px-4 text-right">Direct Offer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {compareListings.map((listing, idx) => (
                <tr key={listing.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                    <span>{listing.store_name}</span>
                    {idx === 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Best Price
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-black text-sm text-[#191919] dark:text-white">
                    ₹{listing.price?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 font-medium">
                    {listing.delivery_charge === 0 ? 'FREE' : `+₹${listing.delivery_charge}`}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {listing.bank_offer || 'No additional card offer'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={listing.store_url || 'https://amazon.in'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-[#D94F32] hover:text-white transition"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Price Alert Form */}
      <section className="rounded-3xl bg-[#FAF7F2] dark:bg-slate-800/50 border border-[#E7E5E0] dark:border-slate-800 p-6 sm:p-8 space-y-4 max-w-2xl">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#D94F32]" />
          <h3 className="font-extrabold text-base">Set a Price Drop Alert</h3>
        </div>
        <p className="text-xs text-slate-500">
          We will monitor Amazon, Flipkart, and Croma every hour. If the price falls below your target, you'll receive an instant alert.
        </p>

        <form onSubmit={handlePriceAlert} className="flex gap-3">
          <input
            type="number"
            value={targetPrice}
            onChange={e => setTargetPrice(e.target.value)}
            placeholder={`Enter target price (e.g. ₹${Math.round(product.price * 0.9)})`}
            className="flex-1 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-slate-700"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#191919] dark:bg-white text-white dark:text-[#191919] hover:bg-[#D94F32] dark:hover:bg-[#D94F32] dark:hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Create Alert
          </button>
        </form>

        {alertSuccess && (
          <p className="text-xs font-bold text-emerald-600 animate-in fade-in">
            {alertSuccess}
          </p>
        )}
      </section>
    </div>
  );
};
