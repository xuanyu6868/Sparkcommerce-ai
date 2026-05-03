import { Router, Request, Response } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import imageRoutes from '../modules/image/image.routes.js';
import communityRoutes from '../modules/community/community.routes.js';
import pricingRoutes from '../modules/pricing/pricing.routes.js';
import orderRoutes from '../modules/order/order.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';

const router = Router();

// 认证相关
router.use('/auth', authRoutes);

// 用户相关
router.use('/users', userRoutes);

// 图片生成
router.use('/images', imageRoutes);

// 社区
router.use('/community', communityRoutes);

// 定价
router.use('/pricing', pricingRoutes);

// 订单
router.use('/orders', orderRoutes);

// 管理员
router.use('/admin', adminRoutes);

// 健康检查
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
