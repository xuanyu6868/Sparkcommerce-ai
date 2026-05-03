import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface CompanyProfileTransitionProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuildingIcon = ({ delay, className, windows = [], floors = 5 }: { delay: number, className?: string, windows?: number[], floors?: number }) => {
  const floorHeight = 60;
  const viewBoxHeight = 100 + floors * floorHeight + 20;

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ y: "100%", opacity: 0, transition: { duration: 0.4, ease: "easeIn" } }}
      className={`absolute origin-bottom ${className}`}
    >
      <svg viewBox={`0 0 200 ${viewBoxHeight}`} className="w-full h-auto drop-shadow-2xl" overflow="visible">
        {/* Top Roof */}
        <polygon points="100,20 20,60 100,100 180,60" fill="#fff" stroke="#111" strokeWidth="4" strokeLinejoin="miter"/>
        <polygon points="100,40 40,70 100,100 160,70" fill="none" stroke="#111" strokeWidth="2.5" strokeLinejoin="miter"/>
        
        {/* Front Left Wall */}
        <polygon points={`20,60 100,100 100,${100 + floors * floorHeight} 20,${60 + floors * floorHeight}`} fill="#f8f9fa" stroke="#111" strokeWidth="4" strokeLinejoin="miter"/>
        
        {/* Front Right Wall */}
        <polygon points={`100,100 180,60 180,${60 + floors * floorHeight} 100,${100 + floors * floorHeight}`} fill="#e9ecef" stroke="#111" strokeWidth="4" strokeLinejoin="miter"/>
        
        {/* Render Windows */}
        {Array.from({ length: floors }).map((_, i) => {
          const leftIdx = i * 2;
          const rightIdx = i * 2 + 1;
          
          return (
            <g key={i}>
              {/* Windows Left */}
              <polygon 
                points={`35,${90 + i * floorHeight} 85,${115 + i * floorHeight} 85,${145 + i * floorHeight} 35,${120 + i * floorHeight}`} 
                fill={windows.includes(leftIdx) ? '#00ff00' : '#fff'} 
                stroke="#111" 
                strokeWidth="3" 
                strokeLinejoin="miter"
              />
              {/* Windows Right */}
              <polygon 
                points={`115,${115 + i * floorHeight} 165,${90 + i * floorHeight} 165,${120 + i * floorHeight} 115,${145 + i * floorHeight}`} 
                fill={windows.includes(rightIdx) ? '#00ff00' : '#fff'} 
                stroke="#111" 
                strokeWidth="3" 
                strokeLinejoin="miter"
              />
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
};

export const CompanyProfileTransition: React.FC<CompanyProfileTransitionProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="company-profile-modal"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] bg-[#FAFAFA]"
        >
          {/* Grid Background */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-60" style={{
            backgroundImage: 'linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          {/* Top Bar */}
          <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-50 pointer-events-none">
            <div className="w-16 h-16 border-[3px] border-black rounded-full flex items-center justify-center bg-white text-black font-black text-xl tracking-tighter pointer-events-auto">
              {/* Logo placeholder */}
              RS
            </div>
            <div className="flex items-center gap-4 pointer-events-auto">
              <button onClick={onClose} className="w-10 h-10 bg-[#00FF00] rounded-full flex items-center justify-center border-[3px] border-black hover:scale-110 transition-transform">
                <X size={20} strokeWidth={4} className="text-black" />
              </button>
              <div className="px-6 py-2 bg-black text-white font-black text-sm md:text-lg rounded-full border-[3px] border-black flex items-center gap-2 cursor-pointer hover:bg-stone-800 transition-colors">
                联系我们 <span className="text-[#00FF00] bg-white/20 rounded-full w-5 h-5 flex items-center justify-center">→</span>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden z-10 w-full h-full">
            <div className="relative w-full min-h-screen max-w-7xl mx-auto flex flex-col md:flex-row">
              {/* Left Column: Text */}
              <div className="w-full md:w-1/2 pt-28 md:pt-36 pb-12 pl-6 sm:pl-10 md:pl-20 flex flex-col z-20 pointer-events-none min-h-[100dvh]">
                <div className="flex flex-col gap-6 w-full max-w-3xl pointer-events-auto flex-shrink-0">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.1, duration: 0.5 } }}>
                    <h2 className="text-xs md:text-sm font-black tracking-widest text-[#111] uppercase mb-2">/// 关于我们</h2>
                    <h1 className="text-[3rem] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] font-black uppercase tracking-tighter" style={{ color: '#111', backgroundColor: '#00FF00', display: 'inline-block', padding: '0.1em 0.2em' }}>
                      <span className="block whitespace-nowrap">用AI重构效率</span>
                      <span className="block whitespace-nowrap">为企业创造增长</span>
                    </h1>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } }}
                    className="bg-white border-[3px] border-black p-5 md:p-8 shadow-[6px_6px_0_#111] mt-2 relative"
                  >
                    <div className="absolute top-0 right-0 w-8 h-8 bg-[#00FF00] border-l-[3px] border-b-[3px] border-black flex items-center justify-center">
                        <span className="font-black text-black leading-none">✦</span>
                    </div>
                    <p className="text-sm md:text-base font-bold leading-relaxed text-black max-w-md">
                      睿思星启科技是一家专注于AI企业服务与效率提升的技术团队。
                      我们致力于将前沿AI工具与企业实际业务深度结合，帮助企业实现自动化、智能化与流程优化。
                      从AI应用落地到效率体系搭建，我们让技术真正服务于增长。
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }} className="bg-[#00FF00] border-[3px] border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_#111]">
                      <span className="text-3xl md:text-4xl font-black text-white" style={{ WebkitTextStroke: '1.5px #111', textShadow: '2px 2px 0 #111' }}>100+</span>
                      <span className="text-[10px] md:text-xs font-black uppercase mt-1 tracking-widest text-[#111] text-center">已交付<br/>项目</span>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.4 } }} className="bg-white border-[3px] border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_#111]">
                      <span className="text-3xl md:text-4xl font-black text-[#00FF00]" style={{ WebkitTextStroke: '1.5px #111', textShadow: '2px 2px 0 #111' }}>5年+</span>
                      <span className="text-[10px] md:text-xs font-black uppercase mt-1 tracking-widest text-[#111] text-center">扎根<br/>AI行业</span>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }} className="bg-black border-[3px] border-black py-4 px-2 flex flex-col items-center justify-center shadow-[4px_4px_0_#00FF00] lg:col-span-1 col-span-2">
                      <span className="text-xl md:text-2xl lg:text-3xl font-black text-white" style={{ WebkitTextStroke: '1px #111' }}>企业提效</span>
                      <span className="text-[10px] md:text-xs font-black mt-1 tracking-widest text-[#00FF00] text-center">AI工具<br/>核心领域</span>
                    </motion.div>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.6 } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="mt-12 md:mt-16 lg:mt-20 mb-10 md:mb-12 flex-shrink-0 flex flex-col gap-3 font-mono text-sm md:text-base font-bold pointer-events-auto bg-white/50 backdrop-blur-sm p-6 rounded-3xl w-max border-[1px] border-stone-200"
                >
                  <p className="text-black font-black mb-1 uppercase tracking-widest text-xs md:text-sm">联系我们 ///</p>
                  <p className="flex items-center gap-3"><span className="text-[#00cc00] w-16">Email:</span> 2583875567@qq.com</p>
                  <p className="flex items-center gap-3"><span className="text-[#00cc00] w-16">WeChat:</span> AXZ8902</p>
                  <p className="flex items-center gap-3"><span className="text-[#00cc00] w-16">QQ:</span> 2583875567</p>
                  
                  <p className="mt-6 md:mt-10 text-[10px] md:text-xs text-stone-500">蜀ICP备202022313号-2</p>
                </motion.div>
              </div>

              {/* Right Column: Isometric Buildings */}
              <div className="absolute right-0 bottom-0 w-[100%] md:w-[75%] lg:w-[65%] h-[100%] z-10 pointer-events-none overflow-visible md:-translate-y-48 lg:-translate-y-64 md:translate-x-20 lg:translate-x-32">
                <div className="relative w-full h-full">
                  {/* Back layer */}
                  <BuildingIcon delay={0.1} className="w-[140px] md:w-[180px] lg:w-[220px] bottom-[15%] right-[55%] z-10 opacity-70" floors={7} windows={[3, 8, 13]} />
                  <BuildingIcon delay={0.2} className="w-[160px] md:w-[200px] lg:w-[240px] bottom-[10%] right-[20%] z-20 opacity-80" floors={8} windows={[1, 6, 9, 14]} />
                  <BuildingIcon delay={0.3} className="w-[120px] md:w-[140px] lg:w-[160px] bottom-[20%] right-[-5%] z-10 opacity-75" floors={6} windows={[0, 5, 8]} />
                  
                  {/* Mid layer */}
                  <BuildingIcon delay={0.4} className="w-[180px] md:w-[260px] lg:w-[320px] -bottom-[5%] right-[40%] z-30 opacity-95" floors={6} windows={[3, 4, 8, 11]} />
                  <BuildingIcon delay={0.5} className="w-[170px] md:w-[240px] lg:w-[300px] -bottom-[10%] right-[5%] z-40" floors={7} windows={[2, 7, 10]} />
                  
                  {/* Foreground layer */}
                  <BuildingIcon delay={0.6} className="w-[220px] md:w-[320px] lg:w-[420px] -bottom-[20%] right-[45%] z-50" floors={5} windows={[0, 5, 8, 9]} />
                  <BuildingIcon delay={0.7} className="w-[260px] md:w-[360px] lg:w-[460px] -bottom-[25%] right-[-10%] z-60" floors={5} windows={[1, 4, 7]} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
