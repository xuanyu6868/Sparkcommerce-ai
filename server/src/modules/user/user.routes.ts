import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database.js';
import { authMiddleware } from '../../shared/middlewares/auth.js';
import { createError } from '../../shared/middlewares/errorHandler.js';

const router = Router();

// 获取用户资料
router.get('/profile', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  // ... existing code unchanged
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        tier: true,
        credits: true,
        totalCredits: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw createError('用户不存在', 404);
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// 更新用户资料
router.put('/profile', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, avatar, bio } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, avatar, bio },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        tier: true,
        credits: true,
      }
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// 获取额度使用统计
router.get('/usage', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        credits: true,
        totalCredits: true,
      }
    });

    if (!user) {
      throw createError('用户不存在', 404);
    }

    const imageCount = await prisma.image.count({
      where: { userId: req.user!.userId }
    });

    res.json({
      usage: {
        remaining: user.credits,
        total: user.totalCredits,
        used: user.totalCredits - user.credits,
        imageCount,
      }
    });
  } catch (err) {
    next(err);
  }
});

// 积分卡密兑换
router.post('/redeem', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.body;

    if (!key || typeof key !== 'string') {
      throw createError('请输入卡密', 400);
    }

    const redeemKey = await prisma.redeemKey.findUnique({
      where: { code: key.trim() }
    });

    if (!redeemKey) {
      throw createError('卡密无效', 404);
    }
    if (redeemKey.used) {
      throw createError('该卡密已被使用', 409);
    }

    // 标记卡密已使用
    await prisma.redeemKey.update({
      where: { id: redeemKey.id },
      data: {
        used: true,
        usedBy: req.user!.userId,
        usedAt: new Date(),
      }
    });

    // 增加用户积分
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        credits: { increment: redeemKey.credits },
        totalCredits: { increment: redeemKey.credits },
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { credits: true }
    });

    res.json({
      message: '兑换成功',
      creditsAdded: redeemKey.credits,
      currentCredits: user?.credits || 0,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
