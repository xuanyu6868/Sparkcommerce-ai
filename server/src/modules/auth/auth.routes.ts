import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/database.js';
import { hashPassword, comparePassword } from '../../shared/utils/password.js';
import { generateToken } from '../../shared/utils/jwt.js';
import { createError } from '../../shared/middlewares/errorHandler.js';
import { authMiddleware } from '../../shared/middlewares/auth.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
});

// 注册
router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.issues[0].message, 400);
    }
    const { email, password, name } = parsed.data;

    // 检查邮箱是否已存在
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw createError('该邮箱已被注册', 409);
    }

    // 创建用户（积分需购买）
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || `用户${Date.now()}`,
        credits: 0,
        totalCredits: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        credits: true,
      }
    });

    // 生成 Token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: '注册成功',
      user,
      token
    });
  } catch (err) {
    next(err);
  }
});

// 登录
router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.issues[0].message, 400);
    }
    const { email, password } = parsed.data;

    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw createError('邮箱或密码错误', 401);
    }

    // 验证密码
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw createError('邮箱或密码错误', 401);
    }

    // 生成 Token
    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tier: user.tier,
        credits: user.credits,
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
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

// 初始化管理员账号（仅在没有管理员时可用）
router.post('/setup-admin', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      throw createError('邮箱和密码不能为空', 400);
    }

    const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (existing) {
      throw createError('已存在管理员账号', 409);
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || '管理员',
        role: 'ADMIN',
        credits: 0,
        totalCredits: 0,
      }
    });

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: '管理员账号创建成功',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
