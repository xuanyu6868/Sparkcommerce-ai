import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Wand2,
  Loader2,
  ChevronDown,
  Square,
  Monitor,
  RectangleHorizontal,
  Smartphone,
  Sparkles,
  Film,
  Palette,
  Paintbrush,
  Zap,
  Box,
  Image as ImageIcon,
  SquareDashed,
  Frame,
  Aperture,
  Wind,
  FileText,
  Cpu,
  Diamond,
  Shirt,
  Leaf,
  Tag,
  Briefcase,
  Heart,
  Camera,
  PlayCircle,
  LucideIcon,
} from "lucide-react";

interface HeroProps {
  onGenerate: (prompt: string, aspectRatio: string, styleParams: {
    engineStyle: string;
    mainImageStyle: string;
    detailStyle: string;
    commerceStyle: string;
    isMainImage: boolean;
  }) => void;
  isGenerating: boolean;
  credits: number;
  onCreditsUpdate: (credits: number) => void;
}

interface OptionItem {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  prompt?: string;
  icon: LucideIcon;
}

const ASPECT_RATIOS: OptionItem[] = [
  { label: "1:1", value: "1:1", icon: Square },
  { label: "4:3", value: "4:3", icon: Monitor },
  { label: "16:9", value: "16:9", icon: RectangleHorizontal },
  { label: "9:16", value: "9:16", icon: Smartphone },
];

const STYLES: OptionItem[] = [
  { id: "none", name: "默认", prompt: "", icon: Sparkles },
  {
    id: "cinematic",
    name: "电影感",
    prompt: "cinematic lighting, ultra-detailed, 8k, masterpiece",
    icon: Film,
  },
  {
    id: "anime",
    name: "二次元",
    prompt: "anime style, vibrant colors, detailed cel shading",
    icon: Palette,
  },
  {
    id: "oil",
    name: "油画",
    prompt: "oil painting, thick brushstrokes, classical texture",
    icon: Paintbrush,
  },
  {
    id: "cyber",
    name: "赛博朋克",
    prompt: "cyberpunk aesthetic, neon glows, futuristic details",
    icon: Zap,
  },
  {
    id: "3d",
    name: "3D 渲染",
    prompt: "3d render, unreal engine 5, octane render, volumetric lighting",
    icon: Box,
  },
];

const MAIN_IMAGE_STYLES: OptionItem[] = [
  { id: "none", name: "无/默认", prompt: "", icon: ImageIcon },
  {
    id: "minimalist",
    name: "极简白底",
    prompt: "minimalist white background, studio lighting, clean",
    icon: SquareDashed,
  },
  {
    id: "scene",
    name: "高级场景",
    prompt: "high-end scene, natural lighting, luxurious setting",
    icon: Frame,
  },
  {
    id: "macro",
    name: "微距特写",
    prompt: "macro photography, extreme detail, sharp focus",
    icon: Aperture,
  },
  {
    id: "dynamic",
    name: "动态捕捉",
    prompt: "dynamic motion, action shot, high speed photography",
    icon: Wind,
  },
];

const DETAIL_IMAGE_STYLES: OptionItem[] = [
  { id: "none", name: "无/默认", prompt: "", icon: FileText },
  {
    id: "tech",
    name: "数码科技",
    prompt: "tech style, futuristic, metallic, glowing parts",
    icon: Cpu,
  },
  {
    id: "beauty",
    name: "美妆奢华",
    prompt: "luxury beauty, soft lighting, elegant, premium",
    icon: Diamond,
  },
  {
    id: "fashion",
    name: "时尚潮流",
    prompt: "fashion editorial, trendy, high contrast, vibrant",
    icon: Shirt,
  },
  {
    id: "nature",
    name: "自然温馨",
    prompt: "natural background, organic, fresh, sunlight",
    icon: Leaf,
  },
];

const COMMERCE_STYLES: OptionItem[] = [
  { id: "none", name: "无/默认", prompt: "", icon: Tag },
  {
    id: "tmall",
    name: "天猫大牌",
    prompt: "professional e-commerce, high quality, commercial photography",
    icon: Briefcase,
  },
  {
    id: "xiaohongshu",
    name: "种草风",
    prompt: "lifestyle photography, cozy, soft tones, instagram style",
    icon: Heart,
  },
  {
    id: "ins",
    name: "INS极简",
    prompt: "minimalist instagram style, aesthetic, pastel colors",
    icon: Camera,
  },
  {
    id: "douyin",
    name: "爆款视觉",
    prompt: "eye-catching, bright colors, high contrast, trendy",
    icon: PlayCircle,
  },
];

const AnimatedWord = ({
  text,
  className,
}: {
  text: string;
  className: string;
}) => {
  return (
    <span className={className}>
      {text.split("").map((char, i) =>
        char === "<" ||
        char === "b" ||
        char === "r" ||
        char === "/" ||
        char === ">" ? (
          <span key={i}>{char}</span>
        ) : (
          <motion.span
            key={i}
            className="inline-block cursor-default"
            whileHover={{
              y: -20,
              scale: 1.15,
              rotate: Math.random() > 0.5 ? 5 : -5,
              transition: { type: "spring", stiffness: 400, damping: 10 },
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ),
      )}
    </span>
  );
};

const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-32 h-32 bg-stone-50 border border-stone-100 rounded-full blur-2xl"
          animate={{
            x: [Math.random() * 800, Math.random() * 800],
            y: [Math.random() * 600, Math.random() * 600],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

export const Hero: React.FC<HeroProps> = ({ onGenerate, isGenerating, credits, onCreditsUpdate }) => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [mainImageStyle, setMainImageStyle] = useState("none");
  const [detailImageStyle, setDetailImageStyle] = useState("none");
  const [commerceStyle, setCommerceStyle] = useState("none");
  const [isMainImage, setIsMainImage] = useState(true);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt, aspectRatio, {
        engineStyle: selectedStyle,
        mainImageStyle,
        detailStyle: detailImageStyle,
        commerceStyle,
        isMainImage,
      });
    }
  };

  return (
    <section className="pt-48 pb-20 px-6 relative z-10">
      <FloatingParticles />

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-neon/5 blur-[120px] rounded-full -z-10 opacity-60" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-impact tracking-tighter mb-8 text-stone-900 leading-tight uppercase italic select-none"
          >
            <AnimatedWord text="开始生成" className="block" />
            <AnimatedWord
              text="商业大片"
              className="text-neon block -rotate-1 not-italic"
            />
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-20 h-1.5 bg-neon mx-auto rounded-full mb-10 shadow-[0_0_15px_#00FF00]"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-stone-400 text-xl md:text-2xl font-medium tracking-tight flex flex-col md:flex-row items-center justify-center gap-3"
          >
            <span>将文字瞬间编译为商业视觉资产</span>
            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-stone-300"></span>
            <span className="flex items-center gap-3 bg-stone-900 text-white rounded-full px-5 py-2 mt-2 md:mt-0 shadow-lg border border-stone-800">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00FF00]" />
                <span className="text-stone-300 font-medium text-base">搭载超强视觉大模型</span>
              </span>
              <span className="bg-gradient-to-r from-[#00FF00] to-green-400 text-black font-black px-3 py-1 rounded-full text-sm md:text-base tracking-wider shadow-[0_0_15px_rgba(0,255,0,0.4)]">
                GPT-IMAGE-2
              </span>
            </span>
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border-2 border-stone-100 p-4 rounded-[4rem] shadow-3xl shadow-stone-200/50"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述您的杰作... (例如: 一个在云端漫步的机械鲸鱼)"
                className="w-full bg-stone-50/50 border-none rounded-[3rem] py-10 pl-12 pr-40 text-stone-900 placeholder:text-stone-300 focus:ring-4 focus:ring-neon/10 transition-all text-2xl font-bold leading-snug resize-none min-h-[220px]"
              />
              <div className="absolute right-6 bottom-6 flex items-center gap-4">
                {prompt && (
                  <button
                    type="button"
                    onClick={() => setPrompt("")}
                    className="p-4 text-stone-300 hover:text-stone-900 transition-colors uppercase text-xs font-black tracking-widest"
                  >
                    清空
                  </button>
                )}
                <div className="flex items-center gap-1 bg-stone-100 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setIsMainImage(true)}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${isMainImage ? 'bg-stone-900 text-neon' : 'text-stone-400'}`}
                  >
                    主图
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMainImage(false)}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!isMainImage ? 'bg-stone-900 text-neon' : 'text-stone-400'}`}
                  >
                    详情图
                  </button>
                </div>
                <button
                  disabled={isGenerating || !prompt.trim() || credits < 5}
                  className="bg-stone-900 text-white px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-neon hover:text-black hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-2xl shadow-stone-200 active:scale-95 duration-300"
                >
                  {isGenerating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Wand2 className="w-6 h-6" />
                  )}
                  {isGenerating ? "生成中..." : `生成图像 (-5积分)`}
                </button>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-end justify-between px-10 pb-8 gap-6">
              <div className="flex flex-wrap items-start gap-3 xl:gap-4 flex-1 overflow-visible w-full">
                <div
                  className={`relative shrink-0 ${openDropdown === "ratio" ? "z-50" : "z-20"}`}
                >
                  <label className="text-[11px] uppercase font-black text-stone-300 block mb-3 tracking-[0.2em] px-1">
                    生成比例
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleDropdown("ratio")}
                    className="w-[140px] px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 text-sm font-black uppercase tracking-widest flex items-center justify-between hover:border-stone-400 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {ASPECT_RATIOS.find((r) => r.value === aspectRatio)
                        ?.icon &&
                        React.createElement(
                          ASPECT_RATIOS.find((r) => r.value === aspectRatio)!
                            .icon,
                          { className: "w-4 h-4 text-stone-500" },
                        )}
                      {
                        ASPECT_RATIOS.find((r) => r.value === aspectRatio)
                          ?.label
                      }
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openDropdown === "ratio" ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openDropdown === "ratio" && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-stone-100 rounded-2xl shadow-2xl overflow-hidden z-20">
                      {ASPECT_RATIOS.map((ratio) => (
                        <button
                          key={ratio.value}
                          type="button"
                          onClick={() => {
                            setAspectRatio(ratio.value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                            aspectRatio === ratio.value
                              ? "bg-stone-900 text-neon"
                              : "text-stone-400 hover:bg-stone-50 hover:text-stone-900"
                          }`}
                        >
                          <ratio.icon
                            className={`w-4 h-4 ${aspectRatio === ratio.value ? "text-neon" : "text-stone-500"}`}
                          />
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`relative shrink-0 ${openDropdown === "style" ? "z-50" : "z-20"}`}
                >
                  <label className="text-[11px] uppercase font-black text-stone-300 block mb-3 tracking-[0.2em] px-1">
                    引擎风格
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleDropdown("style")}
                    className="w-[140px] px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 text-sm font-black uppercase tracking-widest flex items-center justify-between hover:border-stone-400 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {STYLES.find((s) => s.id === selectedStyle)?.icon &&
                        React.createElement(
                          STYLES.find((s) => s.id === selectedStyle)!.icon,
                          { className: "w-4 h-4 text-stone-500" },
                        )}
                      {STYLES.find((s) => s.id === selectedStyle)?.name}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openDropdown === "style" ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openDropdown === "style" && (
                    <div className="absolute top-full left-0 mt-2 w-[180px] bg-white border border-stone-100 rounded-2xl shadow-2xl overflow-hidden z-20 max-h-[240px] overflow-y-auto custom-scrollbar">
                      {STYLES.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setSelectedStyle(style.id);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                            selectedStyle === style.id
                              ? "bg-stone-900 text-neon"
                              : "text-stone-400 hover:bg-stone-50 hover:text-stone-900"
                          }`}
                        >
                          <style.icon
                            className={`w-4 h-4 ${selectedStyle === style.id ? "text-neon" : "text-stone-500"}`}
                          />
                          {style.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`relative shrink-0 ${openDropdown === "mainImage" ? "z-50" : "z-20"}`}
                >
                  <label className="text-[11px] uppercase font-black text-stone-300 block mb-3 tracking-[0.2em] px-1">
                    商品主图
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleDropdown("mainImage")}
                    className="w-[140px] px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 text-sm font-black uppercase tracking-widest flex items-center justify-between hover:border-stone-400 transition-all shadow-sm truncate"
                  >
                    <div className="flex items-center gap-3 truncate">
                      {MAIN_IMAGE_STYLES.find((s) => s.id === mainImageStyle)
                        ?.icon &&
                        React.createElement(
                          MAIN_IMAGE_STYLES.find(
                            (s) => s.id === mainImageStyle,
                          )!.icon,
                          { className: "w-4 h-4 flex-shrink-0 text-stone-500" },
                        )}
                      <span className="truncate">
                        {
                          MAIN_IMAGE_STYLES.find((s) => s.id === mainImageStyle)
                            ?.name
                        }
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${openDropdown === "mainImage" ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openDropdown === "mainImage" && (
                    <div className="absolute top-full left-0 mt-2 w-[180px] bg-white border border-stone-100 rounded-2xl shadow-2xl overflow-hidden z-20 max-h-[240px] overflow-y-auto custom-scrollbar">
                      {MAIN_IMAGE_STYLES.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setMainImageStyle(style.id);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                            mainImageStyle === style.id
                              ? "bg-stone-900 text-neon"
                              : "text-stone-400 hover:bg-stone-50 hover:text-stone-900"
                          }`}
                        >
                          <style.icon
                            className={`w-4 h-4 flex-shrink-0 ${mainImageStyle === style.id ? "text-neon" : "text-stone-500"}`}
                          />
                          <span className="truncate">{style.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`relative shrink-0 ${openDropdown === "detailImage" ? "z-50" : "z-20"}`}
                >
                  <label className="text-[11px] uppercase font-black text-stone-300 block mb-3 tracking-[0.2em] px-1">
                    商品详情图
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleDropdown("detailImage")}
                    className="w-[140px] px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 text-sm font-black uppercase tracking-widest flex items-center justify-between hover:border-stone-400 transition-all shadow-sm truncate"
                  >
                    <div className="flex items-center gap-3 truncate">
                      {DETAIL_IMAGE_STYLES.find(
                        (s) => s.id === detailImageStyle,
                      )?.icon &&
                        React.createElement(
                          DETAIL_IMAGE_STYLES.find(
                            (s) => s.id === detailImageStyle,
                          )!.icon,
                          { className: "w-4 h-4 flex-shrink-0 text-stone-500" },
                        )}
                      <span className="truncate">
                        {
                          DETAIL_IMAGE_STYLES.find(
                            (s) => s.id === detailImageStyle,
                          )?.name
                        }
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${openDropdown === "detailImage" ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openDropdown === "detailImage" && (
                    <div className="absolute top-full left-0 mt-2 w-[180px] bg-white border border-stone-100 rounded-2xl shadow-2xl overflow-hidden z-20 max-h-[240px] overflow-y-auto custom-scrollbar">
                      {DETAIL_IMAGE_STYLES.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setDetailImageStyle(style.id);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                            detailImageStyle === style.id
                              ? "bg-stone-900 text-neon"
                              : "text-stone-400 hover:bg-stone-50 hover:text-stone-900"
                          }`}
                        >
                          <style.icon
                            className={`w-4 h-4 flex-shrink-0 ${detailImageStyle === style.id ? "text-neon" : "text-stone-500"}`}
                          />
                          <span className="truncate">{style.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`relative shrink-0 ${openDropdown === "commerce" ? "z-50" : "z-20"}`}
                >
                  <label className="text-[11px] uppercase font-black text-stone-300 block mb-3 tracking-[0.2em] px-1">
                    电商风格
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleDropdown("commerce")}
                    className="w-[140px] px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 text-sm font-black uppercase tracking-widest flex items-center justify-between hover:border-stone-400 transition-all shadow-sm truncate"
                  >
                    <div className="flex items-center gap-3 truncate">
                      {COMMERCE_STYLES.find((s) => s.id === commerceStyle)
                        ?.icon &&
                        React.createElement(
                          COMMERCE_STYLES.find((s) => s.id === commerceStyle)!
                            .icon,
                          { className: "w-4 h-4 flex-shrink-0 text-stone-500" },
                        )}
                      <span className="truncate">
                        {
                          COMMERCE_STYLES.find((s) => s.id === commerceStyle)
                            ?.name
                        }
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${openDropdown === "commerce" ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openDropdown === "commerce" && (
                    <div className="absolute top-full left-0 mt-2 w-[180px] bg-white border border-stone-100 rounded-2xl shadow-2xl overflow-hidden z-20 max-h-[240px] overflow-y-auto custom-scrollbar">
                      {COMMERCE_STYLES.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setCommerceStyle(style.id);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                            commerceStyle === style.id
                              ? "bg-stone-900 text-neon"
                              : "text-stone-400 hover:bg-stone-50 hover:text-stone-900"
                          }`}
                        >
                          <style.icon
                            className={`w-4 h-4 flex-shrink-0 ${commerceStyle === style.id ? "text-neon" : "text-stone-500"}`}
                          />
                          <span className="truncate">{style.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mt-8"
        >
          <div className="flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-[2rem] border border-stone-200/50 italic shadow-sm">
            <div className="w-2.5 h-2.5 bg-neon rounded-full animate-pulse shadow-[0_0_12px_#00FF00]"></div>
            <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest">
              安全的云端渲染
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
