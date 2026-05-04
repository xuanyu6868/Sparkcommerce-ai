/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ImageGrid, ImageItem } from './components/ImageGrid';
import { authApi, userApi, imageApi, getToken, resolveAssetUrl } from './services/api';
import { ContactFooter } from './components/ContactFooter';

const LandingPage = React.lazy(() => import('./components/LandingPage'));
const Community = React.lazy(() => import('./components/Community'));
const Pricing = React.lazy(() => import('./components/Pricing'));
const Profile = React.lazy(() => import('./components/Profile'));
const AuthPage = React.lazy(() => import('./components/AuthPage'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const ImageModal = React.lazy(() => import('./components/ImageModal'));
const CompanyProfileTransition = React.lazy(() => import('./components/CompanyProfileTransition'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const SAMPLE_IMAGES: ImageItem[] = [
  {
    id: '0',
    url: '/手表AI生成图.png',
    prompt: 'Luxury silver watch with complex inner gears, macro photography, studio lighting, sharp focus',
    tags: ['高级腕表', '商业摄影'],
    stackItems: [
      { url: '/手表.png', title: '原始拍摄', engine: '基础模型' },
      { url: '/手表AI生成图.png', title: '商业渲染', engine: '神经渲染引擎' }
    ]
  },
  {
    id: '1',
    url: '/音响AI生成图.png',
    prompt: 'High-end smart speaker, minimalist design, dark studio background, cinematic lighting',
    tags: ['数码产品', '商业摄影', '宏距'],
    stackItems: [
      { url: '/音响.png', title: '原始拍摄', engine: '基础模型' },
      { url: '/音响AI生成图.png', title: '商业渲染', engine: '神经渲染引擎' }
    ]
  },
  {
    id: '2',
    url: '/台灯AI生成图.png',
    prompt: 'A minimalist modern desk lamp emitting warm light, placed on a wooden table, dark moody lighting',
    tags: ['家居设计', '柔光'],
    stackItems: [
      { url: '/台灯.png', title: '原始拍摄', engine: '基础模型' },
      { url: '/台灯AI生成图.png', title: '商业渲染', engine: '神经渲染引擎' }
    ]
  },
  {
    id: '3',
    url: '/电动牙刷AI生成图.png',
    prompt: 'Premium electric toothbrush on water surface with ripples, product photography, studio lighting',
    tags: ['美妆个护', '生活方式', '商业摄影'],
    stackItems: [
      { url: '/电动牙刷.png', title: '原始拍摄', engine: '基础模型' },
      { url: '/电动牙刷AI生成图.png', title: '商业渲染', engine: '神经渲染引擎' }
    ]
  }
];

const WARMUP_IMAGES = [
  '/保鲜盒主图.png',
  '/帆布包主图.png',
  '/无线鼠标主图.png',
  '/cup_raw.png',
  '/cup_rendered.png',
];

type AppView = 'home' | 'studio' | 'community' | 'pricing' | 'profile' | 'auth' | 'discover' | 'admin';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  credits: number;
  totalCredits: number;
  role?: string;
}

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [images, setImages] = useState<ImageItem[]>(SAMPLE_IMAGES);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCompanyProfileOpen, setIsCompanyProfileOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // 初始化：检查本地 token 并获取用户信息
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.me()
        .then(({ user: userData }) => {
          setIsAuthenticated(true);
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            credits: userData.credits,
            totalCredits: userData.totalCredits,
            role: userData.role,
          });
          setCredits(userData.credits);
          setIsAdmin(userData.role === 'ADMIN');
        })
        .catch(() => {
          // token 无效，清除
          setIsAuthenticated(false);
          setUser(null);
        });
    }
  }, []);

  useEffect(() => {
    const preload = () => {
      WARMUP_IMAGES.forEach((src) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
      });
    };

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preload, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(preload, 800);
    return () => window.clearTimeout(timer);
  }, []);

  const handleLogin = useCallback(() => {
    // 重新获取用户信息
    authApi.me()
      .then(({ user: userData }) => {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          credits: userData.credits,
          totalCredits: userData.totalCredits,
          role: userData.role,
        });
        setCredits(userData.credits);
        setIsAdmin(userData.role === 'ADMIN');
      })
      .catch(() => {});
    setIsAuthenticated(true);
    setView('studio');
  }, []);

  const handleLogout = useCallback(() => {
    authApi.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCredits(0);
    setView('home');
  }, []);

  const handleGenerate = async (prompt: string, aspectRatio: string, styleParams: {
    engineStyle: string;
    mainImageStyle: string;
    detailStyle: string;
    commerceStyle: string;
    isMainImage: boolean;
  }) => {
    if (!isAuthenticated) {
      handleNavigate('auth');
      return;
    }

    if (credits < 5) {
      alert('积分不足，请先购买积分套餐');
      handleNavigate('pricing');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await imageApi.generate({
        prompt,
        aspectRatio: aspectRatio === '1:1' ? '1:1' : aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : '3:4',
        engineStyle: styleParams.engineStyle,
        mainImageStyle: styleParams.mainImageStyle,
        detailStyle: styleParams.detailStyle,
        commerceStyle: styleParams.commerceStyle,
        isMainImage: styleParams.isMainImage,
      });

      // 更新剩余积分
      setCredits(response.remainingCredits);

      // 转换后端图片格式为前端格式（拼接后端地址）
      const newImage: ImageItem = {
        id: response.image.id,
        url: resolveAssetUrl(response.image.url),
        prompt: response.image.prompt,
        assembledPrompt: response.image.assembledPrompt,
        tags: ['AI 生成', '创作者系列'],
      };
      setImages([newImage, ...images]);
    } catch (error: any) {
      console.error(error);
      if (error.message.includes('额度不足') || error.message.includes('403')) {
        alert('积分不足，请先购买积分套餐');
        handleNavigate('pricing');
      } else {
        alert('生成失败，请重试');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNavigate = (newView: AppView) => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleCreditsUpdate = (newCredits: number) => {
    setCredits(newCredits);
    if (user) {
      setUser({ ...user, credits: newCredits });
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return <LandingPage onStart={() => handleNavigate('studio')} onNavigate={handleNavigate} />;
      case 'community':
        return <Community onNavigate={handleNavigate} />;
      case 'pricing':
        return <Pricing user={user} onCreditsUpdate={handleCreditsUpdate} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} onLogout={handleLogout} onCreditsUpdate={handleCreditsUpdate} />;
      case 'studio':
        return (
          <main className="pb-40">
            <Hero
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              credits={credits}
              onCreditsUpdate={handleCreditsUpdate}
            />

            <div className="max-w-7xl mx-auto px-6 mb-24 flex flex-col md:flex-row items-end justify-between gap-12">
              <div className="flex flex-col select-none">
                <h2 className="text-6xl md:text-8xl font-impact tracking-tighter italic uppercase leading-tight mb-4">
                  高转化 <br />
                  <span className="text-neon transition-all hover:text-black hover:drop-shadow-[0_0_10px_#00FF00]">图库</span>
                </h2>
                <div className="w-24 h-2 bg-stone-900 mt-6 mb-8" />
                <p className="text-stone-400 text-lg md:text-xl font-medium tracking-tight max-w-xl leading-relaxed">
                  不再受困于昂贵的模特与外景。<span className="text-stone-900 font-bold border-b-2 border-neon">降本增效 90%</span>，一键批量输出商品主图、详情页与社媒种草图，用顶尖视觉引爆每一次点击与转化。
                </p>
              </div>
            </div>

            <ImageGrid images={images} onImageClick={setSelectedImage} />
          </main>
        );
      case 'auth':
        return <AuthPage onLogin={handleLogin} />;
      case 'admin':
        return <AdminPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 selection:bg-neon selection:text-black">
      <Navbar
        onNavigate={handleNavigate}
        currentView={view}
        isAuthenticated={isAuthenticated}
        onOpenCompanyProfile={() => setIsCompanyProfileOpen(true)}
        user={user}
        credits={credits}
        isAdmin={isAdmin}
      />

      <Suspense fallback={<PageLoader />}>
        {renderContent()}
      </Suspense>

      <ContactFooter />

      <Suspense fallback={null}>
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />

        <CompanyProfileTransition
          isOpen={isCompanyProfileOpen}
          onClose={() => setIsCompanyProfileOpen(false)}
        />
      </Suspense>
    </div>
  );
}
