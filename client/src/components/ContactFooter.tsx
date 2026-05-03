import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate, AnimatePresence } from 'motion/react';
import { Mail, MessageCircle, MapPin, Phone, User } from 'lucide-react';

export const ContactFooter: React.FC = () => {
  const [isPulling, setIsPulling] = useState(false);
  const [hasDropped, setHasDropped] = useState(false);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      animate(dragX, [80, -40, 20, 0], {
        type: 'spring',
        stiffness: 60,
        damping: 8,
        onComplete: () => setHasDropped(true),
      });
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 40, stiffness: 1000 };
  const qrX = useSpring(mouseX, springConfig);
  const qrY = useSpring(mouseY, springConfig);
  const [isHoveringFooter, setIsHoveringFooter] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const rotateString = useTransform(dragX, [-200, 200], [-25, 25]);

  const handleDragEnd = (_: any, info: any) => {
    setIsPulling(false);
    const pullAmount = Math.max(0, info.offset.y);
    const currentScrollY = window.scrollY;
    const THRESHOLD = 300;
    if (pullAmount >= THRESHOLD) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pullAmount > 20) {
      const scrollJump = pullAmount * 6;
      const targetScrollY = Math.max(0, currentScrollY - scrollJump);
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    }
    animate(dragY, 0, { type: 'spring', stiffness: 80, damping: 10 });
    animate(dragX, 0, { type: 'spring', stiffness: 80, damping: 10 });
  };

  // 动态生成电话线：锯齿线从顶部(WeChat)直连电话位置
  const cordPath = useTransform([dragX, dragY], ([xPos, yPos]: any[]) => {
    const phoneY = 190 + (yPos || 0); // 电话中心在 SVG 中的 Y 坐标
    const phoneX = 50 + (xPos || 0);  // 电话在 SVG 中的 X 坐标
    const points = 24;
    const width = 8;
    let path = `M 50 0`;
    for (let i = 1; i <= points; i++) {
      const t = i / points;
      const x = 50 + (phoneX - 50) * t + (i % 2 === 0 ? width : -width);
      const y = phoneY * t;
      path += ` L ${x} ${y}`;
    }
    return path;
  });

  return (
    <footer
      className="bg-[#111111] py-40 pb-60 px-6 relative overflow-hidden select-none cursor-default pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHoveringFooter(true)}
      onMouseLeave={() => setIsHoveringFooter(false)}
    >
      <div className="max-w-7xl mx-auto relative text-center">

        {/* Floating Icons */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-10 left-[20%] text-white opacity-80 pointer-events-none"
        >
          <Mail className="w-16 h-16 -rotate-12" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-10 left-[10%] text-[#22c55e] pointer-events-none"
        >
          <MessageCircle className="w-20 h-20 rotate-12" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-12 right-[30%] text-[#0099ff] pointer-events-none"
        >
          <User className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [-10, 10, -10] }}
          transition={{ duration: 4.5, repeat: Infinity }}
          className="absolute top-20 right-[15%] text-[#ea580c] pointer-events-none"
        >
          <MapPin className="w-20 h-20" />
          <div className="w-16 h-2 bg-black/40 blur-sm rounded-full mx-auto mt-2" />
        </motion.div>

        {/* Main Text */}
        <h2 className="text-[8rem] md:text-[14rem] font-impact text-white leading-tight tracking-tight uppercase relative z-10">
          联系我们
        </h2>

        {/* WeChat badge + phone connected by cord */}
        <div className="relative z-10 flex flex-col items-center">
          {/* WeChat Badge - 电话线起点 */}
          <span className="bg-[#1a1a1a] px-6 md:px-8 py-3 md:py-4 rounded-full text-white font-mono text-lg md:text-2xl tracking-widest border border-white/10 shadow-2xl flex items-center gap-3">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-[#22c55e]" />
            WeChat: <span className="text-[#22c55e] font-bold">AXZ8902</span>
          </span>

          {/* 电话线 + 电话区域 */}
          <div className="relative w-40 h-[280px] flex flex-col items-center mt-2">
            <svg
              width="100"
              height="280"
              viewBox="0 0 100 280"
              className="absolute inset-0 overflow-visible pointer-events-none"
              style={{ zIndex: 5 }}
            >
              {/* 电话线顶部一个小圆点连接 WeChat */}
              <circle cx="50" cy="0" r="4" fill="#22c55e" opacity="0.6" />
              <motion.path
                d={cordPath}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"
              />
            </svg>

            {/* 电话 */}
            <motion.div
              drag
              dragConstraints={{ top: -140, bottom: 140, left: -200, right: 200 }}
              dragElastic={0.3}
              onDragStart={() => setIsPulling(true)}
              onDragEnd={handleDragEnd}
              style={{ x: dragX, y: dragY, rotate: rotateString }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing group pointer-events-auto"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                animate={hasDropped && !isPulling ? { rotate: [0, -5, 4, -2, 0] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-32 h-32 text-neon flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(0,255,0,0.4)] group-hover:drop-shadow-[0_0_30px_rgba(0,255,0,0.6)] transition-all"
              >
                <Phone className="w-24 h-24 rotate-[135deg]" fill="currentColor" />
              </motion.div>
            </motion.div>

            {/* Hint Text */}
            <motion.div
              animate={{
                opacity: isPulling ? 0 : [0.4, 0.8, 0.4],
                y: isPulling ? 20 : 0
              }}
              transition={{ opacity: { duration: 2, repeat: Infinity } }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-stone-500 text-[10px] font-black uppercase tracking-[0.5em] whitespace-nowrap pointer-events-none"
            >
              Pull to return home
            </motion.div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-20 pt-20 border-t border-white/5 text-center">
        <p className="text-stone-600 text-[10px] font-black uppercase tracking-[0.4em]">
          © 2026 睿思星启 — ALL RIGHTS RESERVED
        </p>
      </div>

      {/* QR Code Cursor Follower */}
      <AnimatePresence>
        {isHoveringFooter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              x: qrX,
              y: qrY,
              translateX: '-50%',
              translateY: '-50%',
              zIndex: 9999,
              pointerEvents: 'none'
            }}
            className="w-48 h-48 bg-white p-2 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden"
          >
            <div className="w-full h-full relative overflow-hidden rounded-xl bg-white">
              <img
                src="/qr_code_v2.png"
                alt="联系我们二维码"
                className="absolute inset-0 w-full h-full object-contain p-1"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};
