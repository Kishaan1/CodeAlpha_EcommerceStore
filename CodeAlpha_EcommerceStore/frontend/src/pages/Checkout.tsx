import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart, user } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('124, 5th Main, Indiranagar, Bengaluru');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560001');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('upi');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any>(null);

  if (cart.length === 0 && !orderConfirmed) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="px-5 py-2.5 rounded-full bg-[#191919] dark:bg-white text-white dark:text-[#191919] text-xs font-bold"
        >
          Return to Shopping
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderPayload = {
        shipping: {
          name,
          email,
          address,
          city,
          zip: pincode,
          state: 'Karnataka',
          country: 'India'
        },
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        paymentMethod
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      setOrderConfirmed({
        orderNumber: data.orderNumber || `VB-${Date.now().toString().slice(-6)}`,
        items: cart,
        total: cartTotal,
        address: `${address}, ${city} - ${pincode}`
      });
      clearCart();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[#191919] dark:text-white">
            Order Confirmed!
          </h1>
          <p className="text-xs font-bold text-slate-500">
            Order Reference: #{orderConfirmed.orderNumber}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#FAF7F2] dark:bg-slate-900 border border-[#E7E5E0] dark:border-slate-800 text-left space-y-4">
          <div className="flex justify-between text-xs font-bold pb-3 border-b border-slate-200 dark:border-slate-800">
            <span>Delivering to</span>
            <span className="text-slate-600 dark:text-slate-300 truncate max-w-xs">{orderConfirmed.address}</span>
          </div>

          <div className="space-y-2">
            {orderConfirmed.items.map((item: any) => (
              <div key={item.product.id} className="flex justify-between text-xs">
                <span>{item.quantity}x {item.product.name}</span>
                <span className="font-bold">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm font-black pt-3 border-t border-slate-200 dark:border-slate-800">
            <span>Total Paid</span>
            <span>₹{orderConfirmed.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="px-6 py-3 rounded-full bg-[#191919] dark:bg-white text-white dark:text-[#191919] text-xs font-bold"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <button
          type="button"
          onClick={() => navigate('/catalog')}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-[#191919] dark:text-white">
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500">Fast 256-bit encrypted checkout with price match guarantee</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Details */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
          {/* Shipping Address */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E7E5E0] dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-sm text-[#191919] dark:text-white">
              1. Delivery Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full mt-1 bg-[#FAF7F2] dark:bg-slate-800 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full mt-1 bg-[#FAF7F2] dark:bg-slate-800 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full mt-1 bg-[#FAF7F2] dark:bg-slate-800 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full mt-1 bg-[#FAF7F2] dark:bg-slate-800 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  className="w-full mt-1 bg-[#FAF7F2] dark:bg-slate-800 px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#E7E5E0] dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-sm text-[#191919] dark:text-white">
              2. Payment Method
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                />
                <span className="text-xs font-bold">UPI / GPay / PhonePe / Paytm</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <span className="text-xs font-bold">Credit / Debit Card (Visa, Mastercard, RuPay)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <span className="text-xs font-bold">Pay on Delivery</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-[#191919] dark:bg-white text-white dark:text-[#191919] hover:bg-[#D94F32] dark:hover:bg-[#D94F32] dark:hover:text-white font-extrabold text-sm transition shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming Order...' : `Place Order • ₹${cartTotal.toLocaleString('en-IN')}`}
          </button>
        </form>

        {/* Order Summary Column */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E7E5E0] dark:border-slate-800 h-fit space-y-4">
          <h3 className="font-extrabold text-sm">Order Summary ({cart.length} items)</h3>
          <div className="divide-y divide-slate-200 dark:divide-slate-700/60 max-h-64 overflow-y-auto">
            {cart.map(item => (
              <div key={item.product.id} className="py-2.5 flex justify-between text-xs">
                <div className="truncate max-w-[180px]">
                  <p className="font-bold truncate">{item.product.name}</p>
                  <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Delivery Charges</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-base font-black pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Total Amount</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
