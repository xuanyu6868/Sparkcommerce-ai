import { Router } from 'express';
import prisma from '../../config/database.js';
import { authMiddleware, optionalAuth } from '../../shared/middlewares/auth.js';
import { createError } from '../../shared/middlewares/errorHandler.js';

const router = Router();

// 获取社区作品流
router.get('/images', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, style, sort = 'latest' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isPublic: true };
    if (style) {
      // SQLite: 使用 contains 查询 JSON 字符串
      where.matchedStyles = { contains: style as string };
    }

    const orderBy: any = {};
    if (sort === 'latest') {
      orderBy.createdAt = 'desc';
    } else if (sort === 'popular') {
      orderBy.likeCount = 'desc';
    } else if (sort === 'trending') {
      // 综合热度 = 点赞 * 2 + 浏览
      orderBy.likeCount = 'desc';
    }

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          },
          likes: {
            select: { userId: true }
          }
        }
      }),
      prisma.image.count({ where })
    ]);

    // 处理 isLiked 字段
    const imagesWithLiked = images.map((img: any) => ({
      ...img,
      isLiked: req.user ? img.likes.some((like: any) => like.userId === req.user!.userId) : false,
      likeCount: img.likes.length,
    }));

    res.json({
      images: imagesWithLiked,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    next(err);
  }
});

// 获取创作者排行榜
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { period = 'all', limit = 20 } = req.query;

    // 获取用户及其公开图片的统计数据
    const users = await prisma.user.findMany({
      where: {
        images: {
          some: { isPublic: true }
        }
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        images: {
          where: { isPublic: true },
          select: {
            id: true,
            likeCount: true,
            viewCount: true,
            createdAt: true,
          }
        }
      },
      take: Number(limit),
    });

    // 计算每个用户的得分
    const leaderboard = users
      .map((user: any) => {
        const totalLikes = user.images.reduce((sum: number, img: any) => sum + img.likeCount, 0);
        const totalViews = user.images.reduce((sum: number, img: any) => sum + img.viewCount, 0);
        const imageCount = user.images.length;

        return {
          user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
          },
          stats: {
            imageCount,
            totalLikes,
            totalViews,
            score: totalLikes * 2 + totalViews, // 综合得分
          }
        };
      })
      .sort((a: any, b: any) => b.stats.score - a.stats.score)
      .map((item: any, index: number) => ({
        ...item,
        rank: index + 1
      }));

    res.json({ leaderboard });
  } catch (err) {
    next(err);
  }
});

// 获取灵感推荐（随机公开作品）
router.get('/inspiration', async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;

    const images = await prisma.image.findMany({
      where: { isPublic: true },
      orderBy: { likeCount: 'desc' },
      take: Number(limit),
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.json({ images });
  } catch (err) {
    next(err);
  }
});

// 获取风格列表（用于筛选）
router.get('/styles', (req, res) => {
  const styles = [
    { id: 'tmall_pro', name: '天猫大牌' },
    { id: 'xiaohongshu_lifestyle', name: '小红书种草' },
    { id: 'skincare_closeup', name: '美妆微距特写' },
    { id: '3c_tech', name: '3C数码科技' },
    { id: 'food_gourmet', name: '美食餐饮' },
    { id: 'home_lifestyle', name: '家居生活' },
    { id: 'sports_outdoor', name: '运动户外' },
    { id: 'jewelry_luxury', name: '珠宝奢品' },
    { id: 'packaging_commercial', name: '包装设计' },
    { id: 'anime_style', name: '二次元插画' },
  ];

  res.json({ styles });
});

export default router;
