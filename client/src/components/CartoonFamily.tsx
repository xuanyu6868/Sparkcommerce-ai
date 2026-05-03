import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

const Mouth = ({ status, color = '#2D2D2D', width = 16, className = "" }: { status: string, color?: string, width?: number, className?: string }) => {
  if (status === 'success') {
    return (
      <div 
        style={{ width, height: width / 2, borderColor: color }} 
        className={`border-b-[3px] border-l-[3px] border-r-[3px] rounded-b-full ${className}`} 
      />
    );
  }
  if (status === 'error') {
    return (
      <div 
        style={{ width, height: width / 2, borderColor: color }} 
        className={`border-t-[3px] border-l-[3px] border-r-[3px] rounded-t-full mt-1 ${className}`} 
      />
    );
  }
  return <div style={{ width, height: 3, backgroundColor: color }} className={`rounded-full mt-1 ${className}`} />;
};

const Eyebrow = ({ status, type = 'left' }: { status: string, type?: 'left' | 'right' }) => {
  if (status !== 'error') return null;
  return (
    <div 
      className={`absolute w-3 h-1 bg-[#2D2D2D] rounded-full top-[-8px] ${type === 'left' ? 'rotate-12 right-0' : '-rotate-12 left-0'}`} 
    />
  );
};

export const CartoonFamily = ({ status = 'neutral' }: { status?: 'neutral' | 'success' | 'error' }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [windowSize, setWindowSize] = useState({ width: 1000, height: 800 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [mouseX, mouseY]);

  const smX = useSpring(mouseX, { damping: 30, stiffness: 80 });
  const smY = useSpring(mouseY, { damping: 30, stiffness: 80 });

  // Body tilt using skewX so the bottom stays flat.
  // Positive skewX moves top to the left. 
  // If mouse is at right (windowSize.width), we want top to lean right, so skewX is negative.
  const purpleSkew = useTransform(smX, [0, windowSize.width], [15, -15]);
  const blackSkew = useTransform(smX, [0, windowSize.width], [22, -22]);
  const orangeSkew = useTransform(smX, [0, windowSize.width], [10, -10]);
  const yellowSkew = useTransform(smX, [0, windowSize.width], [18, -18]);

  // Eye pupil movements tracking mouse
  const pupilX = useTransform(smX, [0, windowSize.width], [-8, 8]);
  const pupilY = useTransform(smY, [0, windowSize.height], [-8, 8]);
  
  const smallPupilX = useTransform(smX, [0, windowSize.width], [-4, 4]);
  const smallPupilY = useTransform(smY, [0, windowSize.height], [-4, 4]);
  
  const dotEyeX = useTransform(smX, [0, windowSize.width], [-5, 5]);
  const dotEyeY = useTransform(smY, [0, windowSize.height], [-5, 5]);

  return (
    <div className="relative w-[360px] h-[300px] flex items-end justify-center pointer-events-none">
      {/* Purple */}
      <motion.div 
        style={{ skewX: purpleSkew }}
        className="absolute bottom-0 left-[20px] w-[140px] h-[270px] bg-[#7952F5] rounded-[14px] flex justify-center origin-bottom shadow-sm"
      >
        <div className="absolute top-[40px] flex gap-[22px]">
          <div className="relative w-[22px] h-[22px] bg-white rounded-full flex items-center justify-center shadow-inner">
            <Eyebrow status={status} type="left" />
            <motion.div style={{ x: pupilX, y: pupilY }} className="w-2.5 h-2.5 bg-[#2D2D2D] rounded-full" />
          </div>
          <div className="relative w-[22px] h-[22px] bg-white rounded-full flex items-center justify-center shadow-inner">
            <Eyebrow status={status} type="right" />
            <motion.div style={{ x: pupilX, y: pupilY }} className="w-2.5 h-2.5 bg-[#2D2D2D] rounded-full" />
          </div>
        </div>
        <div className="absolute top-[80px]">
          <Mouth status={status} width={20} />
        </div>
      </motion.div>

      {/* Neon */}
      <motion.div 
        style={{ skewX: blackSkew }}
        className="absolute bottom-0 left-[150px] w-[80px] h-[200px] bg-neon rounded-t-[20px] flex justify-center origin-bottom shadow-[0_0_20px_rgba(0,255,0,0.3)] z-10"
      >
        <div className="absolute top-[35px] flex gap-[12px]">
          <div className="relative w-[16px] h-[16px] bg-white rounded-full flex items-center justify-center shadow-inner">
            <Eyebrow status={status} type="left" />
            <motion.div style={{ x: smallPupilX, y: smallPupilY }} className="w-1.5 h-1.5 bg-[#2D2D2D] rounded-full" />
          </div>
          <div className="relative w-[16px] h-[16px] bg-white rounded-full flex items-center justify-center shadow-inner">
            <Eyebrow status={status} type="right" />
            <motion.div style={{ x: smallPupilX, y: smallPupilY }} className="w-1.5 h-1.5 bg-[#2D2D2D] rounded-full" />
          </div>
        </div>
        <div className="absolute top-[65px]">
          <Mouth status={status} width={14} color="#2D2D2D" />
        </div>
      </motion.div>

      {/* Orange */}
      <motion.div 
        style={{ skewX: orangeSkew }}
        className="absolute bottom-0 left-[-40px] w-[210px] h-[130px] bg-[#FF9A6C] rounded-t-[120px] flex justify-center origin-bottom shadow-sm z-20"
      >
        <div className="absolute top-[50px] flex gap-[28px]">
          <div className="relative">
            <Eyebrow status={status} type="left" />
            <motion.div style={{ x: dotEyeX, y: dotEyeY }} className="w-2.5 h-2.5 bg-[#2D2D2D] rounded-full" />
          </div>
          <div className="relative">
            <Eyebrow status={status} type="right" />
            <motion.div style={{ x: dotEyeX, y: dotEyeY }} className="w-2.5 h-2.5 bg-[#2D2D2D] rounded-full" />
          </div>
        </div>
        <div className="absolute top-[75px]">
          <Mouth status={status} width={18} />
        </div>
      </motion.div>

      {/* Yellow */}
      <motion.div 
        style={{ skewX: yellowSkew }}
        className="absolute bottom-0 right-[15px] w-[110px] h-[120px] bg-[#F2DC5D] rounded-t-[55px] flex items-center flex-col origin-bottom shadow-sm z-20"
      >
        <div className="mt-[30px] flex gap-[18px]">
          <div className="relative">
            <Eyebrow status={status} type="left" />
            <motion.div style={{ x: dotEyeX, y: dotEyeY }} className="w-2.5 h-2.5 bg-[#2D2D2D] rounded-full" />
          </div>
          <div className="relative">
            <Eyebrow status={status} type="right" />
            <motion.div style={{ x: dotEyeX, y: dotEyeY }} className="w-2.5 h-2.5 bg-[#2D2D2D] rounded-full" />
          </div>
        </div>
        <div className="mt-[10px]">
          <Mouth status={status} width={30} />
        </div>
      </motion.div>
    </div>
  );
};
