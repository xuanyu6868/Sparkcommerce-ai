import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database.js';
import { authMiddleware, adminMiddleware } from '../../shared/middlewares/auth.js';
import { createError } from '../../shared/middlewares/errorHandler.js';

const router = Router();

// 所有管理员路由需要登录 + 管理员权限
router.use(authMiddleware, adminMiddleware);

// 生成卡密
router.post('/keys/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { count = 1, credits, plan } = req.body;

    if (!credits || credits <= 0) {
      throw createError('积分数量必须大于0', 400);
    }
    if (!plan) {
      throw createError('请指定套餐类型', 400);
    }

    const keys = [];
    for (let i = 0; i < count; i++) {
      const code = `SPARK-${plan.toUpperCase()}-${uuidv4().substring(0, 8).toUpperCase()}`;
      const key = await prisma.redeemKey.create({
        data: {
          code,
          credits,
          plan,
          createdBy: req.user!.userId,
        }
      });
      keys.push(key);
    }

    res.status(201).json({ keys });
  } catch (err) {
    next(err);
  }
});

// 获取所有卡密列表
router.get('/keys', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { used, page = 1, limit = 50 } = req.query;

    const where: any = {};
    if (used === 'true') where.used = true;
    if (used === 'false') where.used = false;

    const total = await prisma.redeemKey.count({ where });
    const keys = await prisma.redeemKey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json({
      keys,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (err) {
    next(err);
  }
});

// 获取待处理订单（已支付未发卡密）
router.get('/orders/pending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 检查哪些订单还没有对应的 redeem key（简化：返回已支付订单）
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// 获取用户列表
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const total = await prisma.user.count();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        totalCredits: true,
        createdAt: true,
      }
    });

    res.json({
      users,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
