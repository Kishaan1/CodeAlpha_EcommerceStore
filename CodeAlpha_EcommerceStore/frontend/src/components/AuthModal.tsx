import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, login } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@vybe.market');
    setPassword('password123');
    setError(null);
  };

  const handleSocialClick = (provider: 'Google' | 'Apple') => {
    setError(`${provider} OAuth is not configured on this server environment. Please use email or demo credentials.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={closeAuthModal} />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#0B0F19] rounded-3xl shadow-2xl border border-[#E7E5E0] dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Mascot & Brand Stage (45%) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FAF7F2] via-[#F4EFE6] to-[#ECE5D8] dark:from-[#0B0F19] dark:via-[#10182B] dark:to-[#151F32] p-8 flex flex-col justify-between items-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E7E5E0] dark:border-slate-800 select-none">
          <div className="w-full flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] font-bold tracking-wider text-[#191919] dark:text-cyan-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              VYBE BOT • RADAR
            </span>
            <span className="text-[10px] font-bold text-[#D94F32] bg-[#D94F32]/10 px-2 py-0.5 rounded-md">
              ONLINE
            </span>
          </div>

          {/* Center Mascot Image & State */}
          <div className="my-auto text-center relative py-6 flex flex-col items-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
              <img
                src="/assets/vybe-mascot.png"
                alt="Vybe Bot Mascot"
                className="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="mt-4 px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-md max-w-xs">
              {mode === 'login'
                ? "Welcome back! Ready to unlock verified savings? 🐱✨"
                : "Join Vybe Radar to track prices across Amazon & Flipkart! 🚀"}
            </div>
          </div>

          <div className="w-full text-center text-[11px] text-slate-500 dark:text-slate-400">
            ⚡ Multi-Store Real-Time Match &bull; 🛡️ Safe Verified Tracking
          </div>
        </div>

        {/* Right Column: Authentication Form (55%) */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white dark:bg-[#0B0F19]">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191919] dark:text-white tracking-tight">
              Account Access
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in or create an account for orders, price drop alerts & watchlist.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#F7F7F4] dark:bg-slate-800 p-1 rounded-xl mb-5 border border-[#E7E5E0] dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-[#191919] dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-[#191919] dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Aria Stark"
                    className="w-full bg-[#F7F7F4] dark:bg-slate-800 text-sm px-3.5 py-2.5 rounded-xl border border-[#E7E5E0] dark:border-slate-700 text-[#191919] dark:text-white focus:outline-none focus:border-[#D94F32]"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="shopper@example.com"
                  className="w-full bg-[#F7F7F4] dark:bg-slate-800 text-sm px-3.5 py-2.5 rounded-xl border border-[#E7E5E0] dark:border-slate-700 text-[#191919] dark:text-white focus:outline-none focus:border-[#D94F32]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="text-[11px] font-semibold text-[#D94F32] hover:underline cursor-pointer"
                  >
                    Fill demo login
                  </button>
                )}
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F7F4] dark:bg-slate-800 text-sm px-3.5 py-2.5 pr-10 rounded-xl border border-[#E7E5E0] dark:border-slate-700 text-[#191919] dark:text-white focus:outline-none focus:border-[#D94F32]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#191919] dark:bg-white text-white dark:text-[#191919] hover:bg-[#D94F32] dark:hover:bg-[#D94F32] dark:hover:text-white font-bold py-3 rounded-xl text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Social Row */}
          <div className="mt-6 pt-5 border-t border-[#E7E5E0] dark:border-slate-800">
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Or continue with
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialClick('Google')}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-center"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialClick('Apple')}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-center"
              >
                Apple
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
