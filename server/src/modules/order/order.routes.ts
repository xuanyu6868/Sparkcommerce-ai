import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createHmac, timingSafeEqual } from 'crypto';
import prisma from '../../config/database.js';
import { authMiddleware } from '../../shared/middlewares/auth.js';
import { createError } from '../../shared/middlewares/errorHandler.js';

const router = Router();

// 套餐配置（单位：分，1元=100分）
const PLAN_CONFIG: Record<string, { credits: number; amount: number }> = {
  starter: { credits: 50, amount: 990 },       // 9.9元
  pro: { credits: 200, amount: 2990 },           // 29.9元
  enterprise: { credits: 500, amount: 5990 },   // 59.9元
};

// 创建订单
router.post('/create', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { plan } = req.body;

    if (!PLAN_CONFIG[plan]) {
      throw createError('无效的套餐', 400);
    }

    const config = PLAN_CONFIG[plan];
    const orderNo = `ORD${Date.now()}${uuidv4().substring(0, 8).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNo,
        plan,
        amount: config.amount,
        credits: config.credits,
        status: 'PENDING',
        userId: req.user!.userId,
      }
    });

    // 写入购买日志（管理员可查看）
    await prisma.orderLog.create({
      data: {
        userId: req.user!.userId,
        userEmail: req.user!.email || 'unknown',
        plan,
        amount: config.amount,
        credits: config.credits,
        orderNo,
        status: 'PENDING',
      }
    }).catch((err: any) => {
      console.warn('[OrderLog] 写入失败:', err.message);
    });

    res.status(201).json({
      order,
      paymentUrl: `https://payment.example.com/pay?orderNo=${orderNo}`, // TODO: 真实支付链接
    });
  } catch (err) {
    next(err);
  }
});

// 订单列表
router.get('/list', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// 订单详情
router.get('/:orderNo', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNo: req.params.orderNo }
    });

    if (!order) {
      throw createError('订单不存在', 404);
    }

    if (order.userId !== req.user!.userId) {
      throw createError('无权限查看', 403);
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
});

// 支付回调（需提供支付签名验证）
router.post('/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNo, status, signature } = req.body;

    if (!signature || !verifyPaymentSignature(orderNo, status, signature)) {
      throw createError('支付签名验证失败', 403);
    }

    const order = await prisma.order.findUnique({
      where: { orderNo }
    });

    if (!order) {
      throw createError('订单不存在', 404);
    }

    if (order.status !== 'PENDING') {
      throw createError('订单已处理', 400);
    }

    if (status === 'SUCCESS') {
      await prisma.order.update({
        where: { orderNo },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        }
      });

      // 同步更新订单日志
      await prisma.orderLog.updateMany({
        where: { orderNo },
        data: { status: 'COMPLETED' }
      }).catch(() => {});

      res.json({ message: '支付成功，请联系管理员发放卡密' });
    } else {
      await prisma.order.update({
        where: { orderNo },
        data: { status: 'FAILED' }
      });

      await prisma.orderLog.updateMany({
        where: { orderNo },
        data: { status: 'FAILED' }
      }).catch(() => {});

      res.json({ message: '支付失败' });
    }
  } catch (err) {
    next(err);
  }
});

function verifyPaymentSignature(orderNo: string, status: string, signature: string): boolean {
  const secret = process.env.PAYMENT_SECRET;
  if (!secret) {
    // 开发模式：无 PAYMENT_SECRET 时接受 'development-mode' 签名
    return signature === 'development-mode';
  }
  const expected = createHmac('sha256', secret).update(`${orderNo}:${status}`).digest('hex');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return timingSafeEqual(sigBuf, expBuf);
}

export default router;
