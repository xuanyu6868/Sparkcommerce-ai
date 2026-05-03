import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, User, Loader2 } from 'lucide-react';
import { CartoonFamily } from './CartoonFamily';
import { authApi } from '../services/api';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authStatus, setAuthStatus] = useState<'neutral' | 'error' | 'success'>('neutral');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStatus('neutral');
    setErrorMsg('');
    setIsLoading(true);

    const form = e.target as HTMLFormElement;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement;
    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement | undefined;

    const email = emailInput?.value || '';
    const password = passwordInput?.value || '';
    const name = nameInput?.value || undefined;

    try {
      if (isLogin) {
        await authApi.login(email, password);
      } else {
        await authApi.register(email, password, name);
      }
      setAuthStatus('success');
      setTimeout(() => {
        onLogin();
      }, 800);
    } catch (err: any) {
      setAuthStatus('error');
      setErrorMsg(err.message || '操作失败，请重试');
      setTimeout(() => setAuthStatus('neutral'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans selection:bg-neon selection:text-black pt-20 pb-4">
      {/* Left Image Section */}
      <div className="hidden md:flex md:w-1/2 bg-stone-900 relative overflow-hidden items-center justify-center m-4 rounded-[2rem] shadow-2xl">
        <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-800 via-stone-900 to-black"></div>
        </div>

        <div className="absolute top-10 left-10 flex items-center gap-3 z-10 w-fit">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-neon drop-shadow-[0_0_8px_rgba(0,255,0,0.5)]" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white">睿思星启</span>
        </div>

        <CartoonFamily status={authStatus} />
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-neon" />
            </div>
            <span className="font-black text-xl tracking-tighter text-black">睿思星启</span>
          </div>

          <div className="flex items-center gap-6 mb-12 border-b border-stone-100 pb-6">
            <button
              onClick={() => { setIsLogin(true); setAuthStatus('neutral'); setErrorMsg(''); }}
              className={`text-2xl font-black tracking-tight transition-all ${isLogin ? 'text-stone-900' : 'text-stone-300 hover:text-stone-500'}`}
            >
              登录
            </button>
            <button
              onClick={() => { setIsLogin(false); setAuthStatus('neutral'); setErrorMsg(''); }}
              className={`text-2xl font-black tracking-tight transition-all ${!isLogin ? 'text-stone-900' : 'text-stone-300 hover:text-stone-500'}`}
            >
              注册
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest pl-1">用户名</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="您的名字"
                      className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-900 placeholder:text-stone-400 font-medium focus:outline-none focus:border-stone-900 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest pl-1">电子邮箱</label>
                <input
                  type="email"
                  name="email"
                  placeholder="hello@example.com"
                  className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-900 placeholder:text-stone-400 font-medium focus:outline-none focus:border-stone-900 focus:bg-white transition-all shadow-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">密码</label>
                  {isLogin && <span className="text-xs font-bold text-stone-300 uppercase tracking-widest">忘记密码？</span>}
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className={`w-full px-5 py-4 bg-stone-50 border-2 rounded-2xl text-stone-900 placeholder:text-stone-400 font-medium focus:outline-none focus:bg-white transition-all shadow-sm tracking-widest ${authStatus === 'error' ? 'border-red-500 focus:border-red-500' : 'border-stone-100 focus:border-stone-900'}`}
                  required
                  minLength={6}
                />
                <AnimatePresence>
                  {authStatus === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-500 font-bold tracking-wide pl-1"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 bg-stone-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-neon hover:text-black flex items-center justify-center gap-3 transition-all shadow-2xl shadow-stone-200 group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? '进入工作台' : '创建账户'}
                    {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-16 pt-8 border-t border-stone-100 text-center">
            <p className="text-xs font-bold text-stone-400 tracking-widest">
              睿思星启 · 电商影像实验室 v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
