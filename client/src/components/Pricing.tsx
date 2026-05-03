import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Rocket, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { pricingApi, orderApi, Plan } from '../services/api';
import { UserInfo } from '../App';

const ParticleLayer = ({ isHovered }: { isHovered: boolean }) => {
  const rows = 8;
  const cols = 8;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
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
              animate={isHovered ? { scale: 1.1, opacity: 1 } : { scale: 0, opacity: 0 }}
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

const AnimatedWord = ({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className: string;
  delay?: number;
}) => {
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
            transition: { type: "spring", stiffness: 500, damping: 15 }
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

interface PricingCardProps {
  plan: Plan;
  isPopular: boolean;
  onPurchase: (plan: Plan) => void;
  purchasingId: string | null;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, isPopular, onPurchase, purchasingId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isLoading = purchasingId === plan.id;

  const icons: Record<string, React.ReactNode> = {
    starter: <Zap className="w-6 h-6" />,
    pro: <Rocket className="w-6 h-6" />,
    enterprise: <Sparkles className="w-6 h-6" />,
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -10 }}
      className={`relative p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] flex flex-col justify-between transition-all duration-500 overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-stone-200/50 ${isPopular ? 'bg-black text-white' : 'bg-stone-50 border border-stone-100'}`}
    >
      {!isPopular && <ParticleLayer isHovered={isHovered} />}

      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neon text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-black z-20">
          最受欢迎
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <motion.span
            animate={{
              backgroundColor: isHovered && !isPopular ? "#1c1917" : (isPopular ? "rgba(255,255,255,0.1)" : "#ffffff"),
              borderColor: isHovered && !isPopular ? "#292524" : (isPopular ? "rgba(255,255,255,0.2)" : "#f5f5f4")
            }}
            className="p-3 rounded-2xl border flex items-center justify-center shadow-sm"
          >
            <div className={`transition-colors duration-500 ${isHovered || isPopular ? 'text-neon' : 'text-stone-900'}`}>
              {icons[plan.id] || <Zap className="w-6 h-6" />}
            </div>
          </motion.span>
          <AnimatedWord
            text={plan.name}
            className={`font-impact uppercase tracking-wider text-lg ${isHovered || isPopular ? 'text-white/50' : 'text-stone-400'}`}
          />
        </div>

        <div className="mb-10">
          <AnimatedWord
            text={`¥${plan.price}`}
            className={`text-5xl sm:text-7xl font-impact tracking-tighter transition-colors duration-500 ${isHovered || isPopular ? 'text-white' : 'text-stone-900'}`}
          />
          <span className={`ml-2 font-medium ${isHovered ? 'text-stone-500' : (isPopular ? 'text-white/30' : 'text-stone-400')}`}>
            / {plan.credits} 积分
          </span>
        </div>

        <ul className="space-y-4 mb-12">
          {plan.features.map((feature, i) => (
            <li key={i} className={`flex items-center gap-3 text-sm transition-colors duration-500 ${isHovered ? 'text-stone-300' : (isPopular ? 'text-white/80' : 'text-stone-600')}`}>
              <Check className={`w-4 h-4 ${isHovered || isPopular ? 'text-neon' : 'text-green-500'}`} />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => onPurchase(plan)}
        disabled={isLoading}
        className={`relative z-10 w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed ${isPopular ? 'bg-neon text-black hover:bg-white' : (isHovered ? 'bg-neon text-black' : 'bg-white text-stone-900 border-2 border-stone-100 hover:border-stone-900')}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            购买中...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            立即购买
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </button>
    </motion.div>
  );
};

interface PricingProps {
  user?: UserInfo | null;
  onCreditsUpdate?: (credits: number) => void;
}

export const Pricing: React.FC<PricingProps> = ({ user, onCreditsUpdate }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingSuccess, setPurchasingSuccess] = useState<string | null>(null);

  useEffect(() => {
    pricingApi.getPlans()
      .then(({ plans: plansData }) => {
        setPlans(plansData);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handlePurchase = async (plan: Plan) => {
    if (!user) {
      alert('请先登录后再购买');
      return;
    }

    setPurchasingId(plan.id);
    setPurchasingSuccess(null);

    try {
      // 1. 创建订单
      await orderApi.createOrder(plan.id);

      // 2. 模拟支付完成（实际应跳转第三方支付）
      setPurchasingSuccess(plan.id);
      setPurchasingId(null);

      // 3. 订单已创建，积分需通过管理员发放的卡密兑换获取
      alert('下单成功！请联系管理员（微信 AXZ8902）获取卡密，然后在个人中心 → 积分兑换中兑换积分。');

      // 4. 3秒后清除成功状态
      setTimeout(() => setPurchasingSuccess(null), 3000);

    } catch (err: any) {
      alert(err.message || '购买失败，请重试');
      setPurchasingId(null);
    }
  };

  return (
    <div className="pt-28 sm:pt-32 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20 select-none">
          <motion.h1
            className="text-5xl sm:text-6xl md:text-8xl font-impact mb-6 tracking-tighter text-stone-900 leading-tight uppercase"
          >
            <AnimatedWord text="选择你的" className="block italic" />
            <AnimatedWord text="积分套餐" className="block text-neon -rotate-1" />
          </motion.h1>
          <p className="text-stone-500 text-base sm:text-xl font-medium">
            为不同规模的卖家量身定制，让 AI 视觉资产助力您的生意增长。
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-10">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isPopular={plan.isPopular}
                  onPurchase={handlePurchase}
                  purchasingId={purchasingId}
                />
              ))}
            </div>

            {purchasingSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-neon px-8 py-4 rounded-full font-black text-sm tracking-wider shadow-2xl z-50"
              >
                购买成功！积分已到账
              </motion.div>
            )}
          </>
        )}

        {!user && (
          <p className="text-center text-stone-400 text-sm mt-8">
            请先登录后再购买积分套餐
          </p>
        )}
      </div>
    </div>
  );
};
