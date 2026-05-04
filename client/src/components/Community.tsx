import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Zap, Heart, ArrowRight, Wand2, LayoutGrid, Copy, Download, Check, Loader2 } from 'lucide-react';
import { communityApi, resolveAssetUrl } from '../services/api';

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
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[3.5rem]">
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

interface CommunityCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  buttonText: string;
  isPrimary?: boolean;
  onClick?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ icon, title, desc, buttonText, isPrimary = false, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  if (isPrimary) {
    return (
      <div onClick={onClick} className="group p-10 rounded-[3.5rem] bg-stone-900 text-white shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur border border-white/10 group-hover:rotate-12 transition-transform">
          <LayoutGrid className="w-8 h-8 text-neon" />
        </div>
        <h3 className="text-3xl font-impact uppercase italic mb-4 tracking-tight">{title}</h3>
        <p className="text-stone-400 mb-8 text-lg leading-snug">{desc}</p>
        <button className="bg-neon text-stone-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-white transition-colors">
          {buttonText}
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative p-10 rounded-[3.5rem] bg-stone-50 border border-stone-100 transition-all duration-500 cursor-pointer overflow-hidden"
    >
      <ParticleLayer isHovered={isHovered} />
      
      <div className="relative z-10">
        <motion.div 
          animate={{ 
            backgroundColor: isHovered ? "#1c1917" : "#ffffff",
            borderColor: isHovered ? "#292524" : "#f5f5f4"
          }}
          className="w-16 h-16 rounded-2xl border flex items-center justify-center mb-8 transition-all duration-500"
        >
          <div className={`transition-colors duration-500 ${isHovered ? 'text-neon' : 'text-stone-900'}`}>
            {icon}
          </div>
        </motion.div>
        
        <h3 className={`text-3xl font-impact uppercase italic mb-4 tracking-tight transition-colors duration-500 ${isHovered ? 'text-white' : 'text-stone-900'}`}>
          {title}
        </h3>
        
        <p className={`mb-8 text-lg leading-snug transition-colors duration-500 ${isHovered ? 'text-stone-400' : 'text-stone-500'}`}>
          {desc}
        </p>
        
        <button className={`font-black text-sm flex items-center gap-2 group-hover:gap-4 transition-all ${isHovered ? 'text-neon' : 'text-stone-900'}`}>
          {buttonText} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const ActivityItem: React.FC<{ i: number }> = ({ i }) => {
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const getDetailImages = (i: number) => {
    if (i === 0) return [
      '/口红详情图1.webp',
      '/口红详情图2.webp',
      '/口红详情图3.webp',
      '/口红详情图4.webp',
      '/口红详情图5.webp',
      '/口红详情图6.webp',
      '/口红详情图7.webp',
      '/口红详情图8.webp',
    ];
    if (i === 1) return [
      '/手表详情图1.webp',
      '/手表详情图2.webp',
      '/手表详情图3.webp',
      '/手表详情图4.webp',
      '/手表详情图5.webp',
      '/手表详情图6.webp',
      '/手表详情图7.webp',
      '/手表详情图8.webp',
    ];
    if (i === 2) return [
      '/冰箱详情图1.webp',
      '/冰箱详情图2.webp',
      '/冰箱详情图3.webp',
      '/冰箱详情图4.webp',
      '/冰箱详情图5.webp',
      '/冰箱详情图6.webp',
      '/冰箱详情图7.webp',
      '/冰箱详情图8.webp',
    ];
    if (i === 3) return [
      '/鞋子详情图1.webp',
      '/鞋子详情图2.webp',
      '/鞋子详情图3.webp',
      '/鞋子详情图4.webp',
      '/鞋子详情图5.webp',
      '/鞋子详情图6.webp',
      '/鞋子详情图7.webp',
      '/鞋子详情图8.webp',
    ];
    if (i === 4) return [
      '/蛋糕详情图1.webp',
      '/蛋糕详情图2.webp',
      '/蛋糕详情图3.webp',
      '/蛋糕详情图4.webp',
      '/蛋糕详情图5.webp',
      '/蛋糕详情图6.webp',
      '/蛋糕详情图7.webp',
    ];
    return [];
  };

  const detailsImages = getDetailImages(i);
  const hasDetails = detailsImages.length > 0;

  const images = [
    '/口红.webp',
    '/手表主图.webp',
    '/冰箱主图.webp',
    '/鞋子主图.webp',
    '/蛋糕主图.webp'
  ];

  const types = ['美妆口红', '腕表配饰', '家居家电', '时尚鞋履', '食品摄影'];

  const descriptions = [
    '告别昂贵影棚拍摄。AI 一键生成高质感口红展示，5 分钟完成商品图，实测自然流量点击率提升 210%。',
    '解决反光材质拍摄难题。极致光影还原产品真实高级感，让你的主图在搜索列表中脱颖而出。',
    '无需搭建实景影棚。低成本打造北欧自然光高级家居场景，省时省力，大幅降低视觉试错成本。',
    '打破传统平铺僵局。动态张力呈现，全方位抓取用户眼球，让单品展现出大牌限量款的视觉溢价。',
    '摆脱同质化白底图疲劳。微距级细节还原，食品色泽更诱人，直击吃货软肋，打造现象级爆款。'
  ];

  const prompts = [
    '高品质，精致，专业，高级感，品牌感强，商业广告风，写实风格，品牌宣传， 高端质感，品牌调性，精致高级，光影细腻，统一色调，专业布光，立体光影， 简约大气，品质感，克制美学，旗舰店视觉，细节精致，质感强，商业大片， 柔和明暗，高端布景，大气构图，品牌感，专业摄影，高级色调，官方视觉， 高亮度，全域亮光，光线充足，画面通透，色彩鲜亮，色调明快，饱满构图， 视觉吸睛，高清锐利，浅色背景，完整展示，高通透感，轻快氛围，大众审美， 高清画质，明亮色调，清新光线，柔和高光，色彩均匀，醒目画面，爆款视觉， 引流主图，简约摆拍，全域补光，浅色布景，干净高光，自然亮色，均匀提亮， 活力画面，高点击率， 产品特写，口红商品图，主体突出，外观清晰，展示完整，核心卖点突出， 适合商品转化，视觉层级清晰，版式整齐，构图稳定 --- 风格说明： - 天猫平台提供：高端质感、品牌调性、精致高级、光影细腻、商业大片、旗舰店视觉 - 明亮吸睛主图提供：高亮度、全域亮光、画面通透、色彩鲜亮、视觉吸睛、高点击率 - 用户需求：适合品牌宣传、产品特写 基于这些提示词给我生成一张具体的商品图',
    '用户需求：智能手表的商品详情图，有科技感，适合数码商品 选用风格：数码科技质感详情风（#8）- 专用于详情页长图 --- 完整提示词 科技感，专业，理性，工业风，高级质感，品牌科技风，商业广告大片，写实风格， 电商详情页风格，视觉统一，参数展示清晰，功能卖点突出，适合品牌宣传，适合数码商品，图文结合， 现代科技设计，未来感，线条利落，细节丰富，高清成图，构图稳定，视觉层级清晰， 深空灰背景，金属银背景，科技蓝背景，无影棚，精准布光，硬光勾勒，高光锐利，阴影干净，明暗对比， 金属反光，玻璃通透，磨砂质感，按键细节，接口特写，机身线条，结构轮廓，产品全貌， 多角度展示，功能模块特写，规格对比，配件搭配，无多余装饰，极简工业风，高清单品，主体突出， 产品细节图，参数说明图，电商主图，详情长图，静物摄影，商业棚拍，光线干净，版式整齐， 智能手表商品详情图，纵向长图，模块化排版，信息分区明确，标题区，副标题区，核心卖点区，规格区，参数区， 细节展示区，场景展示区，功能说明区，对比展示区，品牌信息区，产品信息区，层级清晰，留白充足，阅读路径明确， 版式整齐，适合中文电商详情图，主体突出，产品居中或主视觉突出，外观清晰，细节清晰，轮廓明确， 主体干净，展示完整，重点信息突出，卖点可视化，产品与文案协调排布，商品形态自然，结构合理，比例准确， 光影层次分明，柔和商业摄影灯光，棚拍光感，自然高光，真实阴影，轮廓光清晰，反射自然，光影层次分明， 背景光柔和，氛围感强，视觉聚焦明确，局部高光强化质感，整体明暗控制平衡，画面干净通透 --- 风格说明： - 数码科技质感详情风 提供：科技感、未来感、工业风、冷色调背景、精准布光 - 版式结构内置词 提供：纵向长图、模块化排版、信息分区明确、层级清晰、适合中文电商详情图 - 商品展示内置词 提供：主体突出、外观清晰、细节清晰、轮廓明确、展示完整 - 光影氛围内置词 提供：光影层次分明、轮廓光清晰、反射自然、局部高光强化质感、画面干净通透',
    '最终提示词（拼接后） 用户输入：双开门大冰箱的商品详情图，要有金属质感，产品细节，使用场景等，以及光亮的背景，但是不能影响到产品展示 选用风格：生活化场景详情（#15）+ 精致布景详情（#16）组合 --- 完整提示词 双开门大冰箱的商品详情图，要有金属质感，产品细节，使用场景等，以及光亮的背景，但是不能影响到产品展示 高品质，精致，专业，高级感，简约，品牌感强，商业广告风，写实风格， 视觉统一，营销展示感强，适合品牌宣传，适合商品转化，图文结合， 现代设计感，审美在线，细节丰富，高清成图，构图稳定，视觉层级清晰， 电商竖版长图，详情页全长构图，真实居家实景，生活环境实拍， 日常使用状态，真人互动使用，自然收纳展示，无棚拍布景， 自然室内柔光，原生生活氛围，商品环境融合，全景整体展示， 版式整齐，留白充足，阅读路径明确，层级清晰，纵向长图，模块化排版， 电商竖版长图，长幅详情构图，多层内容排布，高级软装实景， 氛围自然柔光，分层立体布景，雅致实景环境，商品组合搭配， 全景场景展示，45度角度实拍，表层质感特写，五金配件细节， 光亮背景，专业影棚，商业摄影，高亮环境， 金属质感，表面质感，立体光影，材质纹理，做工精细， 产品细节清晰，轮廓明确，主体突出，展示完整， 使用场景真实自然，生活化情境，场景使用图，无纯白背景， 商品主体突出，光亮背景不干扰产品展示，画面以商品为中心，信息分区明确， 商品介绍模块：商品全景图、品牌标识、核心卖点突出展示， 规格参数模块：尺寸测量图、重量参数、材质标注、颜色款式选择示意， 使用场景模块：真实生活化场景，自然环境光线，场景使用图， 细节做工模块：多角度实拍，360度展示，材质纹理，做工展示， 图片展示多元化，全方位立体展示商品，图片内含清晰可辨认的中国汉字， 画面饱满、信息完整、条理清晰、购买逻辑流畅 --- 风格说明： - 生活化场景详情（#15） 提供：居家实景、使用场景、自然光、生活化情境 - 精致布景详情（#16） 提供：高级软装、层次布景、质感特写、多角度展示 - 光亮背景约束 确保：背景明亮但不干扰产品展示，商品主体突出',
    '要潮流高级棚拍质感，干净浅灰纯色背景，专业无影柔光布光，完整展示鞋身整体造型、鞋面材质纹理、鞋帮与鞋底细节，构图居中对称、大面积 留白，8K 高清写实，风格简约轻奢、街头潮流风，适合电商主图与详情页使用。 【匹配风格1 - 活力多巴胺潮流风 #7】 高饱和明亮多巴胺撞色风格，马卡龙渐变底色搭配几何色块、潮流艺术拼接元素，光线明亮充沛、整体高亮度通透画质；结合亚克力、彩色磨砂潮流摆件布景，构图活泼饱满、层次 丰富，色调鲜艳清爽、元气感十足，年轻化潮牌视觉设计，光影明快柔和，氛围轻松活泼、创意感强，色彩干净通透，适配潮玩、文创、年轻美妆、潮流小百货等年轻化电商设计。 高品质，精致，专业，简约，审美在线，细节丰富，构图稳定，视觉层级清晰， 撞色，高饱和，明亮，多巴胺，渐变，几何，潮流，活泼，元气，创意，彩色， 亚克力，磨砂，高亮度，亮色，年轻， 商业广告风，写实风格，视觉统一，版式整齐，图文结合，适合商品转化， 街头潮流风，潮牌视觉，年轻化，设计感，元气感，创意感 【匹配风格2 - 精致布景详情 #16】 艺术布景，种草氛围，高级精致，种草长图，电商竖版长图，竖版纵向超长图 长幅详情构图，多层内容排布，高级软装实景， 氛围自然柔光，分层立体布景，雅致实景环境，商品组合搭配， 全景场景展示，45度角度实拍，表层质感特写，五金配件细节， 版式整齐，留白充足，阅读路径明确，层级清晰，纵向长图，模块化排版 【匹配风格3 - 生活化场景详情 #15】 居家实景，使用演示，温馨自然，生活化长图 真实居家实景，生活环境实拍，日常使用状态，真人互动使用，自然收纳展示， 自然室内柔光，原生生活氛围，商品环境融合，全景整体展示， 层级清晰，纵向长图，模块化排版 干净浅灰纯色背景，无影棚柔光布光，光线均匀柔和，色彩还原无色差， 浅灰底色，低饱和色，通透干净，明亮光线，专业影棚，商业摄影， 构图居中对称，大面积留白，极简画面，主体突出，无杂物， 8K 高清写实，高清单品，细节清晰，品质画面， 皮质，网面，橡胶鞋底，材质纹理，做工精细，真实质感， 简约轻奢，街头潮流风，潮牌视觉，年轻化，设计感， 完整展示鞋身整体造型，鞋面材质纹理，鞋帮与鞋底细节， 电商详情长图，竖版纵向超长图，画面必须完整展示提示词中提到的所有内容和细节，信息无裁切、无遗漏， 图片内含清晰可辨认的中国汉字，画面饱满、信息完整、条理清晰、购买逻辑流畅 --- 风格说明： - 活力多巴胺潮流风（#7）：提供潮流、街头、年轻化、潮牌视觉、街头潮流风 - 精致布景详情（#16）：提供高级软装、种草氛围、长幅详情构图、多层内容排布 - 生活化场景详情（#15）：提供居家实景、生活场景、自然光、细节清晰展示 三个风格叠加，确保：潮流高级感 + 棚拍质感 + 材质细节 + 居家生活场景 + 电商详情图 每一个模块一张图，不要挤在一张长图里面',
    '用户输入：帮我生成一张芝士奶酪蛋糕商品详情图，要竖版长图详情页构图，真实甜品店实景氛围，自然暖光柔和光线，多层整体展示、切面内馅特写、奶油芝士纹理、果肉配料细 节，摆盘精致高级，低饱和温柔色调，食欲感十足，高清写实无过度美化，包含整体外观、局部细节、食材原料、食用场景多模块，排版整洁信息丰富，适合烘焙甜品电商详情页。 匹配风格：实景写实商用风（#5）+ 生活化场景详情（#15）+ 日系清新治愈风（#2） --- 完整提示词 帮我生成一张芝士奶酪蛋糕商品详情图，要竖版长图详情页构图，真实甜品店实景氛围，自然暖光柔和光线，多层整体展示、切面内馅特写、奶油芝士纹理、果肉配料细节，摆盘精 致高级，低饱和温柔色调，食欲感十足，高清写实无过度美化，包含整体外观、局部细节、食材原料、食用场景多模块，排版整洁信息丰富，适合烘焙甜品电商详情页。 【匹配风格1 - 实景写实商用风 #5】 全真实现货商用实拍效果，依托户外自然光或室内日常实景环境，光线自然柔和、明暗过渡均衡；严格还原商品原生色彩与实物材质纹理，无过度滤镜、无美颜失真，画面干净整洁 、场景自然融合，多角度写实构图，细节清晰完整，高度还原实物真实质感与比例，风格朴素客观、真实耐看，全品类通用，适配电商详情页、商品实拍、线下同款写实展示需求。 高品质，精致，专业，简约，商业广告风，写实风格，审美在线，细节丰富，构图稳定， 实景，自然光，写实，真实，原生色彩，无滤镜，清晰，自然，干净， 实物，细节，商用，电商，详情页，全品类，多角度，无失真， 棚拍，专业摄影，高清图，细节图，多图，展示，场景图， 视觉统一，图文结合，适合商品转化，视觉层级清晰，版式整齐 【匹配风格2 - 生活化场景详情 #15】 居家实景，使用演示，温馨自然，生活化长图，电商竖版长图，竖版纵向超长图 真实居家实景，生活环境实拍，日常使用状态，真人互动使用，自然收纳展示， 自然室内柔光，原生生活氛围，商品环境融合，全景整体展示， 层级清晰，纵向长图，模块化排版，版式整齐，留白充足，阅读路径明确 【匹配风格3 - 日系清新治愈风 #2】 主打日系生活化治愈调性，依托窗边自然柔光与白纱漫反射光线，搭配原木奶油浅色系色调与日式简约布景；融入棉麻软装、绿植原木小摆件点缀，画面低饱和低对比、通透干净， 自带淡胶片温柔质感，背景柔和虚化，光影温润暖调，整体营造松弛居家、素雅清新、自然原生态的氛围感，色调柔和不艳丽，风格温柔简约，适配日用、服饰，家居类生活化电商 实拍场景。 高品质，精致，专业，简约，审美在线，细节丰富，构图稳定，视觉层级清晰， 窗边光，原木，奶油色，白纱，绿植，棉麻，低饱和，通透，胶片感， 柔和，居家，松弛，素雅，清新，自然光，暖调，虚化，森系， 日系，小清新，生活化，下午茶，素净，淡雅，暖黄光， 构图稳定，图文结合，视觉统一，版式整齐，留白充足 电商详情长图，竖版纵向超长图，画面必须完整展示提示词中提到的所有内容和细节， 多层整体展示，切面内馅特写，奶油芝士纹理，果肉配料细节， 整体外观，局部细节，食材原料，食用场景，多模块排版， 真实甜品店实景氛围，自然暖光柔和光线，低饱和温柔色调， 摆盘精致高级，食欲感十足，高清写实无过度美化， 烘焙甜品电商详情页，排版整洁信息丰富， 图片内含清晰可辨认的中国汉字，画面饱满、信息完整、条理清晰、购买逻辑流畅 --- 风格说明： - 实景写实商用风（#5）：提供写实、高清、真实质感、电商详情页适配 - 生活化场景详情（#15）：提供居家实景、生活场景、自然光、竖版长图结构 - 日系清新治愈风（#2）：提供奶油色、低饱和、暖调、温柔感、日系治愈氛围 三个风格叠加，确保：真实甜品场景 + 暖光柔和氛围 + 低饱和温柔色调 + 多层细节展示 + 电商详情图，每一个模块一张图，不要挤在一张长图里面'
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(prompts[i % prompts.length]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mainImageUrl = images[i % images.length];
  const displayImageUrl = selectedImage || mainImageUrl;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = displayImageUrl;
    link.download = `rendered-image-${i + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="p-10 rounded-[3.5rem] bg-stone-50 border border-stone-100 flex flex-col lg:flex-row gap-12 group/item hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700"
    >
      <div className={`w-full ${hasDetails ? 'lg:w-[560px]' : 'lg:w-[450px]'} flex-shrink-0 relative flex flex-col sm:flex-row gap-4 sm:h-[600px]`}>
        <div 
          className="flex-1 h-[400px] sm:h-full rounded-[2.5rem] overflow-hidden relative bg-stone-100 backdrop-blur-sm flex items-center justify-center cursor-pointer group/img" 
        >
          {displayImageUrl.endsWith('.mp4') ? (
            <video 
              key={displayImageUrl}
              src={displayImageUrl} 
              className="w-full h-full object-cover transition-transform duration-[4s] group-hover/img:scale-105" 
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <motion.img 
              key={displayImageUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={displayImageUrl} 
              className="w-full h-full object-cover transition-transform duration-[4s] group-hover/img:scale-105" 
              alt="Artwork"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute top-6 left-6 pointer-events-none">
            <div className="px-4 py-2 bg-stone-900 text-neon text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
              爆款视觉案例 _{100 + i}
            </div>
          </div>
        </div>

        {hasDetails && (
          <div className="sm:w-[84px] shrink-0 flex sm:flex-col gap-3 py-1 overflow-x-auto sm:overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <div 
              onClick={() => setSelectedImage(null)}
              className={`w-[72px] h-[72px] shrink-0 rounded-2xl overflow-hidden bg-stone-100 cursor-pointer border-2 transition-all duration-300 ${
                !selectedImage ? 'border-stone-400 shadow-md scale-100' : 'border-transparent opacity-60 hover:opacity-100 scale-95 hover:scale-100 hover:shadow-sm'
              }`}
            >
              <img src={mainImageUrl} className="w-full h-full object-cover" alt="Main Thumb" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
            </div>
            {detailsImages.map((src, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedImage(src)}
                className={`w-[72px] h-[72px] shrink-0 rounded-2xl overflow-hidden bg-stone-100 cursor-pointer border-2 transition-all duration-300 ${
                  selectedImage === src ? 'border-stone-400 shadow-md scale-100' : 'border-transparent opacity-60 hover:opacity-100 scale-95 hover:scale-100 hover:shadow-sm'
                }`}
              >
                <img src={src} className="w-full h-full object-cover" alt={`Detail Thumb ${idx}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-neon">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-stone-900 font-impact italic text-xl uppercase tracking-tight">{types[i % types.length]}</div>
              <div className="text-stone-300 text-[10px] font-black uppercase tracking-widest">系统生成 • {i + 1}天前</div>
            </div>
          </div>
          
          <h3 className="text-3xl font-impact uppercase italic mb-4 leading-tight text-stone-900">
            高转化{types[i % types.length]}视觉打法
          </h3>
          
          <p className="text-stone-500 text-base leading-relaxed mb-8 max-w-xl">
            {descriptions[i % descriptions.length]}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setShowPrompt(!showPrompt)}
              className={`px-8 py-4 rounded-3xl text-sm font-black uppercase tracking-widest transition-all inline-flex items-center gap-3 whitespace-nowrap ${showPrompt ? 'bg-stone-900 text-white shadow-xl' : 'bg-white border-2 border-stone-100 text-stone-900 hover:border-black shadow-sm'}`}
            >
              {showPrompt ? '关闭参数' : '解析提示词'}
              <ArrowRight className={`w-4 h-4 transition-transform ${showPrompt ? 'rotate-90' : ''}`} />
            </button>
            <button
              onClick={handleDownload}
              className="px-8 py-4 bg-white border-2 border-stone-100 text-stone-900 rounded-3xl text-sm font-black uppercase tracking-widest hover:border-black shadow-sm transition-all inline-flex items-center gap-3 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              下载原图
            </button>
            <div className="flex -space-x-4 ml-2">
              {[
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
                'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
                'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=100'
              ].map((p, idx) => (
                <div key={idx} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-stone-200">
                  <img src={p} className="w-full h-full object-cover" alt="Editor" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-white bg-stone-100 flex items-center justify-center text-[10px] font-black text-stone-400">
                +4K
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showPrompt && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-stone-900 p-8 rounded-[2rem] text-sm text-stone-400 font-mono relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-[10px] font-black text-neon uppercase tracking-[0.3em]">提示词解析</div>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-[10px] font-bold text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-neon" /> : <Copy className="w-3 h-3" />}
                    {copied ? '已复制' : '复制提示词'}
                  </button>
                </div>
                <div className="leading-relaxed">
                  {prompts[i % prompts.length]}
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-8">
                  <div>
                    <div className="text-[8px] font-black uppercase text-white/30 mb-1">渲染引擎</div>
                    <div className="text-neon">OCTANE 2026</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase text-white/30 mb-1">随机种子</div>
                    <div className="text-white">924855120</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase text-white/30 mb-1">引导系数</div>
                    <div className="text-white">7.5</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

interface CommunityProps {
  onNavigate: (view: 'home' | 'studio' | 'community' | 'pricing' | 'profile' | 'auth') => void;
}

export const Community: React.FC<CommunityProps> = ({ onNavigate }) => {
  const [communityImages, setCommunityImages] = React.useState<any[]>([]);
  const [communityLoading, setCommunityLoading] = React.useState(true);

  React.useEffect(() => {
    communityApi.getImages({ page: 1, limit: 6, sort: 'popular' })
      .then(({ images }) => setCommunityImages(images))
      .catch(() => {})
      .finally(() => setCommunityLoading(false));
  }, []);
  return (
    <div className="pt-32 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start justify-between mb-24 gap-12">
          <div className="max-w-2xl">
            <h1 className="text-8xl font-impact mb-8 tracking-tighter leading-tight italic uppercase whitespace-pre-line">
              <AnimatedWord text="专业" className="block" hoverColor="currentColor" />
              <AnimatedWord text="提示词" className="text-neon not-italic block" hoverColor="#00ff00" delay={0.1} />
              <AnimatedWord 
                text="出爆火主图、详情图" 
                className="text-3xl md:text-4xl mt-6 text-stone-900 italic tracking-tight normal-case block" 
                delay={0.3} 
                hoverColor="currentColor"
              />
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 80 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-2 bg-stone-900 mb-10 rounded-full" 
            />
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
              className="text-stone-500 text-xl font-medium leading-relaxed"
            >
              这里是全球顶尖电商视觉方案的策源地。加入致力于重塑商业影像的先行者集群，在这里商品即艺术，视觉即生产力。
            </motion.p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="p-8 bg-stone-900 text-white rounded-[2.5rem] flex items-center gap-6 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="text-4xl font-impact italic mb-1 uppercase">52,401</div>
                <div className="text-neon text-[10px] font-black uppercase tracking-widest">网络活跃节点数</div>
              </div>
              <Users className="w-16 h-16 text-white/5 absolute -right-4 -bottom-4 group-hover:scale-110 group-hover:text-neon/10 transition-all duration-700" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-10 mb-32">
          <CommunityCard 
            icon={<Wand2 className="w-8 h-8" />}
            title="生成高转化电商图"
            desc="输入产品信息或创意灵感，秒生成高清主图、场景图和多风格展示图。无需拍摄，节省时间，让你的产品快速上架，提升点击和购买转化率。"
            buttonText="进入工作台"
            onClick={() => onNavigate('studio')}
          />

          <CommunityCard 
            icon={<LayoutGrid className="w-8 h-8" />}
            title="查看历史素材"
            desc="管理历史生成图片和品牌视觉模板，轻松复用素材，保持全渠道视觉一致性。批量管理、多风格保存，节省设计成本，让你的品牌更专业可信。"
            buttonText="前往我的主页"
            onClick={() => onNavigate('profile')}
            isPrimary
          />

          <CommunityCard 
            icon={<Zap className="w-8 h-8" />}
            title="算力充值"
            desc="算力不足？浏览我们的订阅方案，获取更多高性能渲染算力与定制化模型支持。"
            buttonText="查看订阅方案"
            onClick={() => onNavigate('pricing')}
          />
        </div>

        {/* Feed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pb-32">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-12 flex-wrap gap-6">
              <h2 className="text-5xl font-impact uppercase italic italic leading-tight">爆款提示词模版</h2>
            </div>

            <div className="space-y-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <ActivityItem key={i} i={i} />
              ))}
              <div className="pt-12 text-center">
                <button className="px-12 py-5 bg-stone-50 border-2 border-stone-100 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all">
                  加载更多动态
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-12">
            <div>
              <h3 className="text-xl font-impact uppercase italic mb-8 border-b-4 border-neon pb-2 inline-block">推荐工作流</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: '极简白底', icon: '✨' },
                  { name: '光影重塑', icon: '🌞' },
                  { name: '赛博朋克', icon: '🌃' },
                  { name: '暗黑质感', icon: '🌑' },
                  { name: '商拍大片', icon: '📸' }
                ].map((tag, idx) => (
                   <motion.button 
                    key={tag.name} 
                    onClick={() => onNavigate('studio')}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: idx * 0.2
                    }}
                    className="px-5 py-3 bg-stone-50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all border border-stone-100 shadow-sm flex items-center gap-2 group"
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform">{tag.icon}</span>
                    {tag.name}
                  </motion.button>
                ))}
              </div>
            </div>

            <div onClick={() => onNavigate('pricing')} className="p-8 bg-stone-50 rounded-[3rem] border border-stone-100 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-stone-900 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-bl-[4rem] flex items-start justify-end p-6 transition-all group-hover:bg-neon/20 group-hover:scale-110 origin-top-right">
                 <Zap className="w-8 h-8 text-neon" />
              </div>
              <div className="relative z-10">
                <div className="text-stone-900 text-[10px] font-black uppercase tracking-widest mb-4 inline-block bg-neon px-3 py-1 rounded-full shadow-sm">额度预警</div>
                <h3 className="text-3xl font-impact uppercase italic mb-6 leading-tight text-stone-900">免费渲染额度<br/>即将用尽</h3>
                <div className="w-full bg-stone-200 h-2 rounded-full mb-2 overflow-hidden">
                  <div className="bg-stone-900 h-full w-[85%] rounded-full relative overflow-hidden">
                     <div className="absolute inset-0 w-full h-full bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-stone-400 mb-8 uppercase tracking-widest">
                  <span>已用 85%</span>
                  <span>剩余极速算力</span>
                </div>
                
                <button className="w-full py-4 bg-stone-900 border border-stone-900 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase text-neon hover:bg-neon hover:text-black transition-all shadow-xl flex items-center justify-center gap-2 group/btn">
                  解锁 PRO 级算力
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div onClick={() => onNavigate('profile')} className="relative aspect-square rounded-[3.5rem] bg-stone-900 p-10 flex flex-col justify-end overflow-hidden group cursor-pointer border border-stone-800">
              <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-700 via-stone-900 to-black opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" alt="Assets" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
              
              <div className="relative z-10">
                <div className="text-neon text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm drop-shadow-md">专属空间</div>
                <h4 className="text-white text-3xl font-impact uppercase italic leading-tight mb-4 drop-shadow-lg">管理您的<br/>私域资产库</h4>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:bg-neon transition-colors shadow-xl">
                  <ArrowRight className="w-6 h-6 text-stone-900 group-hover:-rotate-45 transition-transform" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* 社区最新作品 */}
        {communityImages.length > 0 && (
          <div className="pb-32">
            <div className="flex items-center justify-between mb-12 flex-wrap gap-6">
              <h2 className="text-5xl font-impact uppercase italic leading-tight">社区最新作品</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {communityImages.map((img) => (
                <div key={img.id} className="group relative aspect-square rounded-[2rem] overflow-hidden bg-stone-50 border border-stone-100">
                  <img
                    src={resolveAssetUrl(img.url)}
                    className="w-full h-full object-cover"
                    alt={img.prompt}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                    <p className="text-white text-xs leading-relaxed line-clamp-3">{img.prompt}</p>
                    <span className="text-neon text-[10px] font-black mt-2">{img.user?.name || '匿名'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {communityLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
          </div>
        )}
      </div>
    </div>
  );
};
