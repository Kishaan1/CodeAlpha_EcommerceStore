import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, TrendingDown, Star, Sparkles } from 'lucide-react';
import type { Product } from '../types';
import { useApp } from '../context/AppContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const navigate = useNavigate();
  const wishlisted = isInWishlist(product.id);

  const discount = product.max_discount_pct || 25;
  const originalPrice = Math.round(product.price * (1 + discount / 100));

  return (
    <div className="group rounded-2xl border border-[#E7E5E0] dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Stage */}
      <div className="relative aspect-square bg-[#FAF7F2] dark:bg-slate-800/60 p-4 overflow-hidden flex items-center justify-center">
        {/* Deal Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-[#D94F32] text-white text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            <span>{discount}% OFF</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition cursor-pointer ${
            wishlisted
              ? 'bg-red-50 text-red-500 shadow-sm'
              : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-red-500'
          }`}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} />
        </button>

        {/* Product Image */}
        <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
          <img
            src={product.image || product.image_url}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span className="uppercase tracking-wider">{product.category}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">{product.rating || 4.7}</span>
              <span className="text-slate-400">({product.reviews_count || 120})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.id}`}
            className="font-bold text-xs sm:text-sm text-[#191919] dark:text-white line-clamp-2 hover:text-[#D94F32] transition"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Multi-Store Info */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-[#191919] dark:text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#197A4A] dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
            <span>Lowest on {product.min_store_name || 'Amazon.in'}</span>
            <Link to={`/compare/${product.id}`} className="underline text-slate-500 hover:text-slate-900 dark:hover:text-white">
              Compare 3 stores
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="w-full py-2 rounded-xl bg-[#191919] dark:bg-white text-white dark:text-[#191919] hover:bg-[#D94F32] dark:hover:bg-[#D94F32] dark:hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/product/${product.id}`)}
              className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
