import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { isCartDrawerOpen, closeCartDrawer, cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useApp();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'BUYHATKE20' || code === 'SUPER50' || code === 'AMZFLAT500') {
      const discountVal = code === 'SUPER50' ? cartTotal * 0.5 : code === 'BUYHATKE20' ? cartTotal * 0.2 : 500;
      setDiscount(Math.min(discountVal, cartTotal));
      setCouponMsg(`✓ ${code} applied successfully!`);
    } else {
      setDiscount(0);
      setCouponMsg('✗ Invalid or expired coupon code');
    }
  };

  const finalTotal = Math.max(0, cartTotal - discount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={closeCartDrawer} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#0B0F19] text-[#191919] dark:text-slate-100 shadow-2xl flex flex-col border-l border-[#E7E5E0] dark:border-slate-800">
          {/* Header */}
          <div className="p-5 border-b border-[#E7E5E0] dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg tracking-tight">Shopping Bag</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                {cart.length} items
              </span>
            </div>
            <button
              type="button"
              onClick={closeCartDrawer}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-2xl">
                  🛍️
                </div>
                <h3 className="font-bold text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Browse verified multi-store deals and find lowest prices across Amazon & Flipkart.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCartDrawer();
                    navigate('/catalog');
                  }}
                  className="mt-2 px-5 py-2.5 rounded-full bg-[#191919] dark:bg-white text-white dark:text-[#191919] font-bold text-xs hover:bg-[#D94F32] transition cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.product.id}
                  className="flex gap-3.5 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-[#FAF7F2]/60 dark:bg-slate-800/40 relative"
                >
                  <img
                    src={item.product.image || item.product.image_url}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-white shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold truncate text-[#191919] dark:text-white">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] font-semibold text-[#197A4A] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full inline-block mt-1">
                        Matched on {item.selectedStore || 'Amazon.in'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-black text-sm">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#E7E5E0] dark:border-slate-800 bg-[#FAF7F2] dark:bg-slate-900/80 space-y-4">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Coupon: BUYHATKE20"
                    className="w-full bg-white dark:bg-slate-800 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-[#D94F32] hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className={`text-[11px] font-semibold ${discount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {couponMsg}
                </p>
              )}

              {/* Subtotal Calculation */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Delivery</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#191919] dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                onClick={() => {
                  closeCartDrawer();
                  navigate('/checkout');
                }}
                className="w-full py-3.5 rounded-2xl bg-[#191919] dark:bg-white text-white dark:text-[#191919] hover:bg-[#D94F32] dark:hover:bg-[#D94F32] dark:hover:text-white font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verified SSL Checkout with Price Match Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
