import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Copy, Share2, Check } from 'lucide-react';
import { ImageItem } from './ImageGrid';

interface ImageModalProps {
  image: ImageItem | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!image) return null;

  const displayPrompt = image.assembledPrompt || image.prompt;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `rendered-image-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          layoutId={image.id}
          className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] border border-stone-100"
        >
          <div className="w-full md:w-2/3 h-full overflow-hidden bg-stone-50 flex items-center justify-center">
            <img
              src={image.url}
              alt={image.prompt}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="w-full md:w-1/3 p-8 flex flex-col justify-between overflow-y-auto bg-white">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-sm font-mono text-stone-400 uppercase tracking-widest font-semibold">元数据详情</h2>
                <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-900" />
                </button>
              </div>
              
               <div className="mb-8">
                 <p className="text-xs text-stone-400 uppercase mb-2 font-bold tracking-tight">AI 生成提示词</p>
                 <div className="bg-stone-50 border border-stone-100 p-4 rounded-xl text-stone-700 text-sm leading-relaxed mb-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                   {displayPrompt}
                 </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy}
                    className="flex-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors text-stone-700"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? '已复制' : '复制提示词'}
                  </button>
                  <button className="bg-white hover:bg-stone-50 border border-stone-200 rounded-lg p-2.5 transition-colors text-stone-700">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {image.tags && (
                <div className="mb-8">
                  <p className="text-xs text-stone-400 uppercase mb-3 font-bold tracking-tight">标签分类</p>
                  <div className="flex flex-wrap gap-2">
                    {image.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full text-stone-600 font-medium">
                        {tag === 'Abstract' ? '抽象' : 
                         tag === 'Ethereal' ? '空灵' : 
                         tag === 'Architecture' ? '建筑' : 
                         tag === 'Minimalism' ? '极简' : 
                         tag === 'Sci-fi' ? '科幻' : 
                         tag === 'Space' ? '空间' : 
                         tag === 'Macro' ? '微距' : tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <button 
                onClick={handleDownload}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-md active:scale-[0.98]"
              >
                <Download className="w-5 h-5" />
                下载原图
              </button>
              <p className="text-center text-[10px] text-stone-300 mt-4 font-medium uppercase tracking-wider">
                知识共享 署名-非商业性使用 4.0
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
