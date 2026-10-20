import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Package, Bell, Heart, LogOut, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PriceAlert } from '../types';

export const Account: React.FC = () => {
  const { user, token, logout, openAuthModal } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'alerts' | 'profile'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    setLoading(true);
    // Fetch orders and alerts for this user
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/alerts').then(r => r.json())
    ])
      .then(([ordersData, alertsData]) => {
        setOrders(ordersData.orders || []);
        setAlerts(alertsData.alerts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold">Please sign in to view your account</h2>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="px-5 py-2.5 rounded-full bg-[#191919] dark:bg-white text-white dark:text-[#191919] text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#FAF7F2] dark:bg-slate-900 border border-[#E7E5E0] dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D94F32] text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#191919] dark:text-white">{user.name}</h1>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-[#191919] dark:bg-white text-white dark:text-[#191919]'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'bg-[#191919] dark:bg-white text-white dark:text-[#191919]'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Price Alerts ({alerts.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <Package className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No past orders yet</p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold">Order #{order.order_number || order.id}</span>
                  <span className="text-slate-500">{order.created_at || 'Just now'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Status: <strong className="text-emerald-600 capitalize">{order.status || 'Confirmed'}</strong>
                  </span>
                  <span className="text-sm font-black text-[#191919] dark:text-white">
                    ₹{order.total_amount?.toLocaleString('en-IN') || order.total?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No active price drop alerts</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#191919] dark:text-white">
                    {alert.product_title || `Product #${alert.product_id}`}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Target: <strong className="text-emerald-600">₹{alert.target_price?.toLocaleString('en-IN')}</strong> &bull; Status: {alert.status}
                  </p>
                </div>
                <Link
                  to={`/product/${alert.product_id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-[#D94F32] hover:text-white transition"
                >
                  View Product
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
