import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap } from 'lucide-react';
import { UserInfo } from '../App';

interface NavbarProps {
  onNavigate: (view: 'home' | 'studio' | 'community' | 'pricing' | 'profile' | 'auth' | 'admin') => void;
  currentView: string;
  isAuthenticated: boolean;
  onOpenCompanyProfile?: () => void;
  user?: UserInfo | null;
  credits?: number;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentView,
  isAuthenticated,
  onOpenCompanyProfile,
  user,
  credits = 0,
  isAdmin = false,
}) => {
  return (
    <div className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-[95%] max-w-5xl">
      <nav className="bg-white/80 backdrop-blur-2xl border border-stone-100 rounded-2xl sm:rounded-[2rem] shadow-2xl shadow-stone-200/50 px-3 sm:px-10 py-3 sm:py-0 min-h-16 sm:h-20 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-black hidden sm:block">睿思星启</span>
        </div>

        <div className="order-3 sm:order-none w-full sm:w-auto flex items-center justify-center gap-5 sm:gap-10 overflow-x-auto sm:overflow-visible whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={onOpenCompanyProfile}
            className="text-xs sm:text-sm font-black uppercase tracking-widest transition-all text-black hover:text-neon"
          >
            公司简介
          </button>
          <button
            onClick={() => onNavigate('community')}
            className={`text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${currentView === 'community' ? 'text-neon translate-y-[-1px]' : 'text-black hover:text-neon'}`}
          >
            社区
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className={`text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${currentView === 'pricing' ? 'text-neon translate-y-[-1px]' : 'text-black hover:text-neon'}`}
          >
            定价
          </button>
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${currentView === 'admin' ? 'text-neon translate-y-[-1px]' : 'text-black hover:text-neon'}`}
            >
              管理
            </button>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* 积分显示 */}
              <div className="hidden sm:flex items-center gap-1.5 bg-stone-900 text-neon px-3 py-1.5 rounded-full">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-xs font-black tracking-wider">{credits}</span>
              </div>
              <button
                onClick={() => onNavigate('profile')}
                className={`text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${currentView === 'profile' ? 'text-neon translate-y-[-1px]' : 'text-black hover:text-neon'}`}
              >
                {user?.name || '我的'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className={`text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${currentView === 'profile' ? 'text-neon translate-y-[-1px]' : 'text-black hover:text-neon'}`}
            >
              我的
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* 移动端积分显示 */}
          {isAuthenticated && (
            <div className="sm:hidden flex items-center gap-1.5 bg-stone-900 text-neon px-2.5 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-black tracking-wider">{credits}</span>
            </div>
          )}
          <button
            onClick={() => isAuthenticated ? onNavigate('studio') : onNavigate('auth')}
            className={`px-4 sm:px-8 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-impact tracking-[0.14em] sm:tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
              currentView === 'studio'
              ? 'bg-stone-50 text-stone-300 border border-stone-100'
              : 'bg-stone-900 text-neon hover:bg-black shadow-stone-200'
            }`}
          >
            {!isAuthenticated ? (
              <>
                <span className="sm:hidden">登录</span>
                <span className="hidden sm:inline">登录与注册</span>
              </>
            ) : currentView === 'studio' ? '工作台' : (
              <>
                <span className="sm:hidden">创作</span>
                <span className="hidden sm:inline">开始创作</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};
