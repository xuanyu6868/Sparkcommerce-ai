import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Heart, Copy, Download } from 'lucide-react';
import { CardStack } from './LandingPage';

export interface ImageItem {
  id: string;
  url: string;
  prompt: string;
  assembledPrompt?: string;
  tags?: string[];
  stackItems?: { url: string; title: string; engine: string }[];
}

interface ImageGridProps {
  images: ImageItem[];
  onImageClick: (image: ImageItem) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick }) => {
  const handleCopyPrompt = (e: React.MouseEvent, image: ImageItem) => {
    e.stopPropagation();
    const text = image.assembledPrompt || image.prompt;
    navigator.clipboard.writeText(text);
    alert('提示词已复制到剪贴板');
  };

  const handleDownloadImage = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = `rendered-image-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            layoutId={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative cursor-pointer aspect-square rounded-2xl ${!image.stackItems && 'overflow-hidden'} bg-stone-50 border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-stone-200/50 hover:z-50 transition-all duration-300`}
            onClick={() => onImageClick(image)}
          >
            {image.stackItems ? (
              <div className="absolute inset-0 z-0">
                <CardStack mini items={image.stackItems} />
              </div>
            ) : (
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ imageRendering: '-webkit-optimize-contrast', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            )}
            
            {/* Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t pointer-events-none ${image.stackItems ? 'from-black/90 rounded-2xl' : 'from-black/80 rounded-2xl'} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end z-10`}>
              <div className="flex flex-wrap gap-1 mb-3">
                {image.tags?.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[9px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm font-medium text-white line-clamp-2 mb-4 leading-snug">
                {image.prompt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="p-2.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors text-white pointer-events-auto"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleCopyPrompt(e, image)}
                    className="p-2.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors text-white pointer-events-auto"
                    title="复制提示词"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={(e) => handleDownloadImage(e, image.url, image.id)}
                  className="p-2.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors text-white pointer-events-auto"
                  title="下载原图"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
