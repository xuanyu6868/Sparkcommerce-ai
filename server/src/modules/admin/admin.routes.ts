import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database.js';
import { authMiddleware, adminMiddleware } from '../../shared/middlewares/auth.js';
import { createError } from '../../shared/middlewares/errorHandler.js';

const router = Router();

// 所有管理员路由需要登录 + 管理员权限
router.use(authMiddleware, adminMiddleware);

// ---------------------------------------------------------------------------
// 生成卡密（支持指定 targetUserId 发放给特定用户）
// ---------------------------------------------------------------------------
router.post('/keys/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { count = 1, credits, plan, targetUserId } = req.body;

    if (!credits || credits <= 0) {
      throw createError('积分数量必须大于0', 400);
    }
    if (!plan) {
      throw createError('请指定套餐类型', 400);
    }

    if (targetUserId) {
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser) {
        throw createError('目标用户不存在', 404);
      }
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
          targetUserId: targetUserId || null,
        }
      });
      keys.push(key);
    }

    res.status(201).json({ keys });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// 获取所有卡密列表（附带 targetUser 信息）
// ---------------------------------------------------------------------------
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

    const targetUserIds = keys.filter((k: any) => k.targetUserId).map((k: any) => k.targetUserId!);
    const users = targetUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: targetUserIds } },
          select: { id: true, email: true, name: true }
        })
      : [];
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    const keysWithUser = keys.map((k: any) => ({
      ...k,
      targetUser: k.targetUserId ? (userMap.get(k.targetUserId) || null) : null,
    }));

    res.json({
      keys: keysWithUser,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// 获取待处理订单
// ---------------------------------------------------------------------------
router.get('/orders/pending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// 获取用户列表（附带购买次数 / 兑换次数）
// ---------------------------------------------------------------------------
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

    const userIds = users.map((u: any) => u.id);

    const orderCounts = await prisma.order.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: { id: true },
    });
    const orderCountMap = new Map(orderCounts.map((o: any) => [o.userId, o._count.id]));

    const redeemCounts = await prisma.redeemKey.groupBy({
      by: ['usedBy'],
      where: { usedBy: { in: userIds }, used: true },
      _count: { id: true },
    });
    const redeemCountMap = new Map(redeemCounts.map((r: any) => [r.usedBy, r._count.id]));

    const usersWithStats = users.map((u: any) => ({
      ...u,
      orderCount: orderCountMap.get(u.id) || 0,
      redeemCount: redeemCountMap.get(u.id) || 0,
    }));

    res.json({
      users: usersWithStats,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// 获取购买日志
// ---------------------------------------------------------------------------
router.get('/purchase-logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const total = await prisma.orderLog.count();
    const logs = await prisma.orderLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json({
      logs,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
