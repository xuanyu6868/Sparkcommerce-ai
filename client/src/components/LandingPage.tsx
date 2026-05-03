import React from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowRight, Zap, Users, LayoutGrid, Sparkles, Image as ImageIcon, Search } from 'lucide-react';
import { ParticleBackground } from './ParticleBackground';
import { ImageModal } from './ImageModal';
import { ImageItem } from './ImageGrid';

interface LandingPageProps {
  onStart: () => void;
  onNavigate: (view: 'home' | 'studio' | 'community' | 'pricing' | 'profile') => void;
}

const AnimatedWord = ({ text, className, delay = 0, hoverColor }: { text: string; className: string; delay?: number; hoverColor?: string }) => {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.5, 
            delay: delay + i * 0.03,
            ease: [0.215, 0.61, 0.355, 1]
          }}
          className="inline-block cursor-default select-none"
          whileHover={{ 
            y: -15, 
            scale: 1.25,
            rotate: Math.random() > 0.5 ? 15 : -15,
            ...(hoverColor ? { color: hoverColor } : {}),
            transition: { type: "spring", stiffness: 500, damping: 15 }
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

const ParticleLayer = ({ isHovered }: { isHovered: boolean }) => {
  const rows = 12;
  const cols = 10;
  
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[4rem]">
      <div 
        className="grid w-full h-full"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)` 
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          
          // Calculate distance to nearest edge
          const distX = Math.min(c, cols - 1 - c);
          const distY = Math.min(r, rows - 1 - r);
          const minDistToEdge = Math.min(distX, distY);
          
          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={isHovered ? {
                scale: 1.1,
                opacity: 1,
              } : {
                scale: 0,
                opacity: 0,
              }}
              transition={{ 
                duration: 0.2, 
                delay: isHovered ? minDistToEdge * 0.05 + Math.random() * 0.15 : 0,
                ease: "easeOut"
              }}
              className="bg-stone-900 w-full h-full"
            />
          );
        })}
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  desc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, subtitle, desc }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -10 }}
      className="group relative h-[600px] flex flex-col justify-between p-14 rounded-[4rem] bg-stone-50 border border-stone-100 transition-all duration-500 cursor-pointer overflow-hidden"
    >
      <ParticleLayer isHovered={isHovered} />
      
      <div className="relative z-10">
        <motion.div 
          animate={{ 
            backgroundColor: isHovered ? "#1c1917" : "#ffffff",
            borderColor: isHovered ? "#292524" : "#f5f5f4"
          }}
          className="w-24 h-24 rounded-[2rem] shadow-sm border flex items-center justify-center mb-12 transition-all duration-500"
        >
          <div className={`transition-colors duration-500 ${isHovered ? 'text-neon' : 'text-stone-900'}`}>
            {icon}
          </div>
        </motion.div>
        
        <h3 className={`text-6xl font-impact mb-8 tracking-tighter uppercase italic leading-tight transition-colors duration-500 ${isHovered ? 'text-white' : 'text-stone-900'}`}>
          {title} <br />
          <span className={`transition-colors duration-500 ${isHovered ? 'text-neon' : 'text-stone-900'}`}>
            {subtitle}
          </span>
        </h3>
        
        <motion.p 
          animate={{ 
            color: isHovered ? "#d6d3d1" : "#a8a29e",
            y: isHovered ? -5 : 0 
          }}
          className="text-xl font-medium leading-tight transition-all duration-500"
        >
          {desc}
        </motion.p>
      </div>
    </motion.div>
  );
};

const Counter = ({ value, duration = 2 }: { value: string; duration?: number }) => {
  const [displayValue, setDisplayValue] = React.useState("0");
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(nodeRef, { once: false });

  React.useEffect(() => {
    if (isInView) {
      const numericPart = value.replace(/[^0-9.]/g, '');
      const suffix = value.replace(/[0-9.]/g, '');
      const targetValue = parseFloat(numericPart);
      let startTime: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        const current = progress * targetValue;
        
        if (value.includes(',')) {
          setDisplayValue(current.toLocaleString(undefined, { maximumFractionDigits: 1 }) + suffix);
        } else {
          setDisplayValue(current.toFixed(value.includes('.') ? 1 : 0) + suffix);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayValue("0");
    }
  }, [isInView, value, duration]);

  return <span ref={nodeRef}>{displayValue}</span>;
};

export const CardStack = ({ mini = false, items, onImageClick }: { mini?: boolean; items?: {url: string; title: string; engine: string}[], onImageClick?: (image: any) => void }) => {
  const [isStackHovered, setIsStackHovered] = React.useState(false);

  const cards = items || [
    {
      url: "/cup_raw.png",
      title: "原始拍摄",
      engine: "基础模型"
    },
    {
      url: "/cup_rendered.png",
      title: "商业渲染",
      engine: "神经渲染引擎"
    }
  ];

  return (
    <div 
      className={`relative w-full h-full flex items-center justify-center ${mini ? 'pt-0' : 'pt-20'}`}
      onMouseEnter={() => setIsStackHovered(true)}
      onMouseLeave={() => setIsStackHovered(false)}
    >
      {cards.map((card, i) => {
        const isLast = i === cards.length - 1;
        
        // Dynamic animation values
        const rotation = isStackHovered 
          ? (i - (cards.length - 1) / 2) * (mini ? 8 : 25) 
          : (mini ? 0 : (i - (cards.length - 1) / 2) * 2);

        const xOffset = isStackHovered 
          ? (i - (cards.length - 1) / 2) * (mini ? 30 : 160)
          : (mini ? 0 : (i - (cards.length - 1) / 2) * 4);

        return (
          <motion.div
            key={i}
            initial={false}
            animate={{ 
              rotate: rotation,
              x: xOffset,
              y: isStackHovered ? (mini ? -20 : -40) : 0,
              zIndex: i,
              scale: isStackHovered ? (mini ? 1.05 : 1.02) : 1,
              transition: { type: "spring", stiffness: 150, damping: 15 }
            }}
            whileHover={{ 
              y: mini ? -60 : -180,
              rotate: 0,
              scale: 1.1,
              zIndex: 100,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            onClick={() => onImageClick && onImageClick(card)}
            className={`absolute ${mini ? 'w-full h-full border-none shadow-xl rounded-2xl' : 'w-64 md:w-80 h-96 md:h-[28rem] border-2 md:border-4 border-white shadow-2xl rounded-[3rem]'} bg-stone-50 overflow-hidden origin-bottom group ${onImageClick ? 'cursor-pointer' : ''}`}
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              willChange: isStackHovered ? 'transform' : 'auto'
            }}
          >
            <img 
              src={card.url} 
              className="w-full h-full object-cover"
              style={{
                imageRendering: '-webkit-optimize-contrast',
                WebkitFontSmoothing: 'antialiased',
                transform: 'translateZ(0)'
              }}
              alt={card.title}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            {/* Card Info Overlay */}
            <div className={`absolute inset-x-0 bottom-0 ${mini ? 'p-4' : 'p-8'} bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
              <div className={`${mini ? 'text-[8px]' : 'text-xs'} font-black uppercase tracking-widest opacity-50 mb-1`}>{card.engine}</div>
              <div className={`${mini ? 'text-sm' : 'text-xl'} font-bold italic font-impact uppercase`}>{card.title}</div>
            </div>
            {/* Side Label */}
            {!mini && (
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 rotate-90 text-[8px] font-black tracking-widest text-stone-300 opacity-20 group-hover:opacity-100 transition-opacity">
                素材_{i+1}_处理
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};


export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onNavigate }) => {
  const [selectedImage, setSelectedImage] = React.useState<any>(null);

  return (
    <div className="min-h-screen bg-white selection:bg-neon selection:text-black relative">
      <ParticleBackground />
      {/* Hero Section */}
      <section className="pt-36 md:pt-60 pb-24 md:pb-40 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="inline-flex items-center gap-3 px-4 sm:px-6 py-2.5 bg-stone-50 border border-stone-100 rounded-full text-stone-900 text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] sm:tracking-[0.2em] mb-8 md:mb-12 shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-neon animate-pulse" />
            睿思星启 — 电商视觉革命
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="text-5xl sm:text-7xl md:text-[8rem] font-impact tracking-tighter text-stone-900 mb-8 md:mb-12 leading-tight uppercase flex flex-col items-center select-none pl-0 sm:pl-4 md:pl-8"
          >
            <AnimatedWord text="一站生成！" className="block italic" hoverColor="currentColor" />
            <AnimatedWord text="全平台电商视觉" className="block text-neon -rotate-2" hoverColor="#00ff00" />
            <div className="flex flex-wrap justify-center font-display text-stone-900 leading-tight">
              <AnimatedWord text="秒级响应出" className="" hoverColor="currentColor" />
              <AnimatedWord text="爆款" className="text-red-500" hoverColor="#ef4444" />
            </div>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-stone-400 text-base sm:text-2xl md:text-3xl mb-10 sm:mb-16 max-w-4xl mx-auto font-medium leading-tight tracking-tight"
          >
            小红书爆款图 · 高转化电商主图 · 详情页自动生成<br />
            无缝覆盖淘宝、抖音、拼多多、Amazon、Shopee、SHEIN、Temu 等国内外核心赛道。
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button onClick={onStart} className="animated-button shadow-3xl shadow-stone-200/50">
              <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                ></path>
              </svg>
              <span className="text font-impact tracking-widest text-2xl uppercase">开始创作</span>
              <span className="circle"></span>
              <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                ></path>
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid - Bento Style */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 sm:gap-10">
            <FeatureCard 
              icon={<Zap className="w-12 h-12" />}
              title="极速"
              subtitle="出图"
              desc="告别繁琐修图流程，AI 秒级重塑产品质感。无论是白底图还是全场景商业短片，速度提升 10 倍，让新品抢占首屏流量。"
            />
            <FeatureCard 
              icon={<Sparkles className="w-12 h-12" />}
              title="爆款出"
              subtitle="主图"
              desc="基于千万级电商热销数据，AI 智能匹配高转化构图法则。精准击穿用户心智，打造令对手绝望的点击率收割机。"
            />
            <FeatureCard 
              icon={<LayoutGrid className="w-12 h-12" />}
              title="详情页"
              subtitle="转化王"
              desc="深度击穿‘跳出率高、转化率低’的核心痛点。AI 自动剖析商品逻辑，生成兼具视觉美感与极强诱导力的黄金卖点，让您的流量损耗降到最低，订单转化直接翻倍。"
            />
        </div>
      </section>

      {/* New Enhanced Showcase Section - "The Real World" */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1.5 bg-stone-100 rounded-full text-[10px] font-black tracking-widest uppercase mb-6"
            >
              流量主图引擎
            </motion.div>
            <motion.h2 
            className="text-5xl sm:text-7xl font-impact italic uppercase leading-tight tracking-tighter mb-6 text-red-500 cursor-default select-none origin-left"
            >
              <motion.span 
                whileHover={{ x: 20, scale: 1.05, color: "#ff0000" }} 
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="inline-block"
              >
                爆款出主图
              </motion.span> 
              <br />
              <motion.span 
                whileHover={{ x: 40, scale: 1.05, color: "#1c1917" }} 
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="text-stone-500 inline-block"
              >
                全网点击王
              </motion.span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
      {
        url: "/保鲜盒主图.png",
        title: "清透质感",
        desc: "极致表现保鲜盒的晶莹材质与密封细节，通过虚实结合的光影，在货架丛中脱颖而出，激发食欲与整洁感。"
      },
      {
        url: "/帆布包主图.png",
        title: "文艺溢价",
        desc: "为简约帆布包注入自然采光氛围，模拟真实生活场景中的柔和阴影，大幅提升产品的审美格调与品牌溢价。"
      },
      {
        url: "/无线鼠标主图.png",
        title: "科技跃迁",
        desc: "运用硬核工业风背景与精准轮廓光，渲染出无线鼠标的未来主义美学，精准击穿科技极客的点击决策点。"
      }
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        viewport={{ once: true }}
        onClick={() => setSelectedImage({ id: `showcase-${i}`, url: item.url, prompt: item.desc, tags: ['展示样例', item.title] })}
        className="group relative cursor-pointer aspect-square rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-stone-50 border border-stone-100 shadow-sm hover:shadow-2xl transition-all duration-500"
      >
        <img 
          src={item.url} 
          className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105 p-4" 
          alt={item.title}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-black/40 to-transparent p-6 sm:p-10 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="absolute top-8 right-8 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            <button className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white hover:text-stone-900 transition-colors shadow-lg">
              <Search className="w-5 h-5" />
            </button>
          </div>
          <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <h4 className="text-white text-3xl font-impact uppercase italic mb-3 tracking-tight drop-shadow-md">{item.title}</h4>
            <p className="text-stone-300 text-sm font-medium leading-relaxed mb-6">{item.desc}</p>
            <div className="inline-flex items-center gap-2 text-neon text-sm font-bold uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
              点击查看全图 <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Horizontal Bar Charts */}
      <section className="py-24 sm:py-40 px-4 sm:px-6 bg-stone-900 text-white rounded-[2.5rem] sm:rounded-[5rem] mx-3 sm:mx-6 my-14 sm:my-20 shadow-3xl shadow-stone-200 relative overflow-hidden">
        {/* Floating Decorative Elements */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 text-neon opacity-40 pointer-events-none drop-shadow-[0_0_20px_rgba(0,255,0,0.5)]"
        >
          <Zap className="w-32 h-32" />
        </motion.div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-20 text-center">
            <h2 className="text-5xl md:text-6xl font-impact tracking-tighter italic uppercase mb-4">
              <AnimatedWord text="视觉效能" className="text-white" /> {" "}
              <AnimatedWord text="碾压级进化" className="text-neon" />
            </h2>
            <p className="text-stone-500 font-medium text-lg uppercase tracking-widest">传统模式 vs 睿思星启 AI 引擎</p>
          </div>

          <div className="space-y-16">
            {[
              { 
                label: "视觉制作成本", 
                painPoint: "告别单张 2000+ 的昂贵拍摄费", 
                value: 99.9, 
                suffix: "%", 
                prefix: "-", 
                color: "#00ff00",
                desc: "低至 0.5 元/张，甚至赶不上传统拍摄的一杯咖啡钱。"
              },
              { 
                label: "新品上新速度", 
                painPoint: "拒绝动辄 72 小时的修图等待", 
                value: 700, 
                suffix: "X", 
                prefix: "", 
                color: "#ffffff",
                desc: "10 秒极速测款，让您的上新速度比对手快一个层级。"
              },
              { 
                label: "全网搜索点击率", 
                painPoint: "破除“进店难、没流量”的僵局", 
                value: 320, 
                suffix: "%", 
                prefix: "+", 
                color: "#00ff00",
                desc: "基于爆款大数据构图，比设计师更懂成交心理学。"
              },
              { 
                label: "单人 SKU 管理", 
                painPoint: "解决“千款难更”的规模化痛点", 
                value: 10000, 
                suffix: "+", 
                prefix: "", 
                color: "#ffffff",
                desc: "一键全量适配 100+ 平台规格，单人管理万级货架资产。"
              }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-baseline gap-6">
                    <h3 className="text-2xl sm:text-3xl font-black italic tracking-tight text-white whitespace-nowrap">{stat.label}</h3>
                    <span className="text-stone-500 text-xs font-black uppercase tracking-widest hidden md:block">{stat.painPoint}</span>
                  </div>
                  <div className="text-neon text-5xl md:text-6xl font-impact tracking-tighter flex items-center">
                    <span>{stat.prefix}</span>
                    <Counter value={stat.value.toString()} />
                    <span>{stat.suffix}</span>
                  </div>
                </div>
                
                <div className="relative h-3 bg-stone-800 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                    className="absolute inset-y-0 left-0 bg-stone-700 w-full"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(stat.value / 100 * 100, 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 0.8, ease: "circOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent"
                    style={{ backgroundColor: stat.color }}
                  >
                    <motion.div 
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-white/30 blur-md w-20 transform -skew-x-12"
                    />
                  </motion.div>
                </div>
                
                <p className="text-stone-400 text-sm font-medium group-hover:text-stone-300 transition-colors">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Showcase - Immersive */}
      <section className="py-24 sm:py-40 px-4 sm:px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-14 md:gap-20 items-center">
            <div className="flex-1">
              <motion.h2 
                className="text-4xl sm:text-6xl font-black tracking-tighter uppercase mb-6 sm:mb-8 leading-tight cursor-default"
              >
                <AnimatedWord text="白底图变" className="block" />
                <AnimatedWord text="爆款高点击主图" className="text-stone-300 block italic" delay={0.2} />
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-stone-400 text-lg sm:text-2xl font-medium mb-8 sm:mb-12 leading-snug"
              >
                只需一张普通底图，即刻激发商业视觉潜能。<br />
                让每一张图都具备“自发性流量”的视觉吸引力。
              </motion.p>
              <div className="flex gap-4">
                <motion.button 
                  onClick={onStart} 
                  whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="custom-ripple-button h-14 sm:h-16 px-7 sm:px-10 text-base sm:text-lg font-impact uppercase italic tracking-wider transition-all"
                >
                  <span className="mr-3">立即预览效果</span>
                  <svg width="24" height="24" viewBox="0 0 100 100">
                    <polygon points="20,10 80,50 20,90"></polygon>
                    <polygon points="40,10 100,50 40,90"></polygon>
                    <polygon points="60,10 120,50 60,90"></polygon>
                  </svg>
                </motion.button>
              </div>
            </div>
            <div className="flex-1 w-full relative flex justify-center">
              <div className="w-full max-w-md">
                <CardStack onImageClick={(image) => setSelectedImage({ id: `card-${image.title}`, url: image.url, prompt: image.engine, tags: ['展示样例', image.title] })} />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-stone-200/50 rounded-full blur-[80px] -z-10" />
              <div className="absolute -top-10 -right-10 w-60 h-60 bg-stone-100 rounded-full blur-[100px] -z-10" />
            </div>
        </div>
      </section>

      {/* How it works - Minimal Steps */}
      <section className="py-24 sm:py-40 px-4 sm:px-6 border-t border-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 md:gap-24">
            {[
              { step: "01", title: "上传底图", desc: "上传商品原型图或 3D 模型渲染底图。" },
              { step: "02", title: "匹配场景", desc: "输入场景关键词，AI 智能匹配商业意境。" },
              { step: "03", title: "极速出图", desc: "秒级生成超高清商业大片，直接用于商用。" }
            ].map((item, i) => (
              <div key={i} className="group cursor-default">
                <div className="text-7xl sm:text-9xl font-black text-stone-100 mb-5 sm:mb-8 tracking-tighter transition-colors duration-500 overflow-hidden">
                  <AnimatedWord text={item.step} className="" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight uppercase italic">
                  <AnimatedWord text={item.title} className="" />
                </h3>
                <p className="text-stone-400 text-base sm:text-xl font-medium leading-tight group-hover:text-stone-600 transition-colors duration-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Highlight */}
      <section className="py-24 sm:py-40 px-4 sm:px-6 bg-stone-50 rounded-[2.5rem] sm:rounded-[5rem] mx-3 sm:mx-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-14 sm:mb-24 gap-8">
            <div className="max-w-xl">
              <h2 className="text-5xl sm:text-8xl md:text-[8rem] font-impact tracking-tighter leading-tight uppercase mb-6 sm:mb-8 italic">
                <AnimatedWord text="世界级" className="block" />
                <div className="flex flex-wrap">
                  <AnimatedWord text="艺术" className="mr-4" />
                  <AnimatedWord text="杰作" className="text-neon not-italic" />
                </div>
              </h2>
              <motion.p 
                whileHover={{ x: 10 }}
                className="text-stone-400 text-lg sm:text-2xl md:text-3xl font-medium transition-all duration-300"
              >
                来自全球顶尖创作者的灵感火花。
              </motion.p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="aspect-[3/4] relative group">
               <CardStack mini onImageClick={(image) => setSelectedImage({ id: `card-mini-${image.title}`, url: image.url, prompt: image.engine, tags: ['展示样例', image.title] })} />
            </div>
            <div className="aspect-[3/4] relative group">
               <CardStack mini onImageClick={(image) => setSelectedImage({ id: `card-mini-${image.title}`, url: image.url, prompt: image.engine, tags: ['展示样例', image.title] })} items={[
                 { url: "/headphones_raw.png", title: "原始拍摄", engine: "基础模型" },
                 { url: "/headphones_rendered.png", title: "商业渲染", engine: "神经渲染引擎" }
               ]} />
            </div>
            <div className="aspect-[3/4] relative group">
               <CardStack mini onImageClick={(image) => setSelectedImage({ id: `card-mini-${image.title}`, url: image.url, prompt: image.engine, tags: ['展示样例', image.title] })} items={[
                 { url: "/oil_raw.png", title: "原始拍摄", engine: "基础模型" },
                 { url: "/oil_rendered.png", title: "商业渲染", engine: "神经渲染引擎" }
               ]} />
            </div>
            <div className="aspect-[3/4] relative group">
               <CardStack mini onImageClick={(image) => setSelectedImage({ id: `card-mini-${image.title}`, url: image.url, prompt: image.engine, tags: ['展示样例', image.title] })} items={[
                 { url: "/shoes_raw.png", title: "原始拍摄", engine: "基础模型" },
                 { url: "/shoes_rendered.png", title: "商业渲染", engine: "神经渲染引擎" }
               ]} />
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 sm:py-32 px-4 sm:px-6 text-center border-t border-stone-50">
        <div className="flex items-center justify-center gap-2 mb-8 scale-150">
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-stone-900">睿思星启</span>
        </div>
        <p className="text-stone-300 text-xs font-black uppercase tracking-[0.5em]">© 2026 用心打造. 保留所有权利.</p>
      </footer>

      <ImageModal 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
};
