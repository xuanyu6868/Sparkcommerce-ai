import React from 'react';
import { motion } from 'motion/react';

interface CardStackProps {
  mini?: boolean;
  items?: { url: string; title: string; engine: string }[];
  onImageClick?: (image: any) => void;
}

export const CardStack: React.FC<CardStackProps> = ({ mini = false, items, onImageClick }) => {
  const [isStackHovered, setIsStackHovered] = React.useState(false);

  const cards = items || [
    { url: "/cup_raw.webp", title: "原始拍摄", engine: "基础模型" },
    { url: "/cup_rendered.webp", title: "商业渲染", engine: "神经渲染引擎" }
  ];

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${mini ? 'pt-0' : 'pt-20'}`}
      onMouseEnter={() => setIsStackHovered(true)}
      onMouseLeave={() => setIsStackHovered(false)}
    >
      {cards.map((card, i) => {
        const isLast = i === cards.length - 1;
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
            <div className={`absolute inset-x-0 bottom-0 ${mini ? 'p-4' : 'p-8'} bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
              <div className={`${mini ? 'text-[8px]' : 'text-xs'} font-black uppercase tracking-widest opacity-50 mb-1`}>{card.engine}</div>
              <div className={`${mini ? 'text-sm' : 'text-xl'} font-bold italic font-impact uppercase`}>{card.title}</div>
            </div>
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
