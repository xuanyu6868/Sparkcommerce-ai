import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database.js';
import { promptEngine } from '../../services/promptEngine.js';
import { aiConfig, IMAGE_API_ENDPOINT, isAiConfigured } from '../../config/ai.js';
import { authMiddleware } from '../../shared/middlewares/auth.js';
import { createError } from '../../shared/middlewares/errorHandler.js';
import { downloadAndSaveImage, saveImageLocally } from '../../shared/utils/storage.js';

const router = Router();

// 生成图片
router.post('/generate', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      prompt,
      aspectRatio = '1:1',
      engineStyle = 'none',
      mainImageStyle = 'none',
      detailStyle = 'none',
      commerceStyle = 'none',
      isMainImage = true,
    } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      throw createError('提示词不能为空', 400);
    }

    // 检查额度
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { credits: true }
    });

    if (!user || user.credits <= 0) {
      throw createError('额度不足，请购买套餐', 403);
    }

    // 组装 Prompt
    const assembled = promptEngine.assemble({
      userPrompt: prompt,
      aspectRatio,
      engineStyle,
      mainImageStyle,
      detailStyle,
      commerceStyle,
      isMainImage
    });

    console.log('[Prompt Engine]', {
      matchedStyles: assembled.matchedStyleNames,
      triggeredKeywords: assembled.triggeredKeywords,
      finalPrompt: assembled.finalPrompt.substring(0, 100) + '...'
    });

    // 调用 MiniMax API 生成图片
    if (!isAiConfigured()) {
      throw createError('AI 图片生成服务未配置，请在 .env 中设置 AI_API_KEY', 503);
    }
    const imageUrl = await callMiniMaxAPI(assembled.finalPrompt, aspectRatio);

    // 获取图片尺寸
    const dimensions = promptEngine.getImageDimensions(aspectRatio);

    // 扣减额度（每次生成消耗5积分）
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { credits: { decrement: 5 } }
    });

    // 保存到数据库
    const image = await prisma.image.create({
      data: {
        url: imageUrl,
        prompt: prompt,
        assembledPrompt: assembled.finalPrompt,
        aspectRatio,
        engineStyle: engineStyle !== 'none' ? engineStyle : null,
        mainImageStyle: mainImageStyle !== 'none' ? mainImageStyle : null,
        detailStyle: detailStyle !== 'none' ? detailStyle : null,
        commerceStyle: commerceStyle !== 'none' ? commerceStyle : null,
        matchedStyles: JSON.stringify(assembled.matchedStyles),
        triggeredKeywords: JSON.stringify(assembled.triggeredKeywords),
        width: dimensions.width,
        height: dimensions.height,
        userId: req.user!.userId,
      }
    });

    res.status(201).json({
      message: '生成成功',
      image,
      remainingCredits: user.credits - 5,
    });
  } catch (err) {
    next(err);
  }
});

// 获取我的图片列表
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, public: isPublic } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId: req.user!.userId };
    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.image.count({ where })
    ]);

    res.json({
      images,
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

// 获取单张图片详情
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const image = await prisma.image.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        likes: {
          select: { userId: true }
        }
      }
    });

    if (!image) {
      throw createError('图片不存在', 404);
    }

    // 增加浏览量
    await prisma.image.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } }
    });

    // 检查当前用户是否点赞
    const isLiked = req.user
      ? image.likes.some((like: any) => like.userId === req.user!.userId)
      : false;

    res.json({
      image: {
        ...image,
        isLiked,
        likeCount: image.likes.length
      }
    });
  } catch (err) {
    next(err);
  }
});

// 删除图片
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const image = await prisma.image.findUnique({
      where: { id: req.params.id }
    });

    if (!image) {
      throw createError('图片不存在', 404);
    }

    if (image.userId !== req.user!.userId) {
      throw createError('无权限删除', 403);
    }

    await prisma.image.delete({ where: { id: req.params.id } });

    res.json({ message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

// 切换公开状态
router.patch('/:id/public', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const image = await prisma.image.findUnique({
      where: { id: req.params.id }
    });

    if (!image) {
      throw createError('图片不存在', 404);
    }

    if (image.userId !== req.user!.userId) {
      throw createError('无权限操作', 403);
    }

    const updated = await prisma.image.update({
      where: { id: req.params.id },
      data: { isPublic: !image.isPublic }
    });

    res.json({ image: updated });
  } catch (err) {
    next(err);
  }
});

// 点赞
router.post('/:id/like', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const image = await prisma.image.findUnique({
      where: { id: req.params.id }
    });

    if (!image) {
      throw createError('图片不存在', 404);
    }

    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_imageId: {
          userId: req.user!.userId,
          imageId: req.params.id
        }
      }
    });

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      await prisma.image.update({
        where: { id: req.params.id },
        data: { likeCount: { decrement: 1 } }
      });
      res.json({ message: '已取消点赞', liked: false });
    } else {
      // 添加点赞
      await prisma.like.create({
        data: {
          userId: req.user!.userId,
          imageId: req.params.id
        }
      });
      await prisma.image.update({
        where: { id: req.params.id },
        data: { likeCount: { increment: 1 } }
      });
      res.json({ message: '点赞成功', liked: true });
    }
  } catch (err) {
    next(err);
  }
});

// ============================================
// 图片生成 API 调用 (OpenAI compatible / GPT image-2)
interface ImageGenerationResponse {
  created: string;
  data: {
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }[];
}

async function callMiniMaxAPI(
  prompt: string,
  aspectRatio: string
): Promise<string> {
  const body: Record<string, any> = {
    model: 'gpt-image-2',
    prompt: prompt,
    n: 1,
    size: aspectRatioToSize(aspectRatio),
    quality: aiConfig.quality,
    output_format: 'png',
  };

  // 显式指定 response_format 以便优先使用 b64_json
  body.response_format = 'b64_json';

  const response = await fetch(IMAGE_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aiConfig.apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`图片生成 API 请求失败: ${response.status} - ${errorText}`);
  }

  const data: ImageGenerationResponse = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error('AI 未返回图片');
  }

  const item = data.data[0];
  let localPath: string;

  // GPT image-1 默认返回 b64_json
  if (item.b64_json) {
    localPath = await saveImageLocally(`data:image/png;base64,${item.b64_json}`, 'png');
    console.log(`[Image saved from base64] ${localPath}`);
  } else if (item.url) {
    localPath = await downloadAndSaveImage(item.url);
    console.log(`[Image saved from URL] ${localPath}`);
  } else {
    throw new Error('AI 未返回图片数据');
  }

  return localPath;
}

function aspectRatioToSize(ratio: string): string {
  const map: Record<string, string> = {
    '1:1': '1024x1024',
    '4:3': '1024x768',
    '16:9': '1536x1024',
    '9:16': '1024x1536',
    '3:4': '1024x1536',
  };
  return map[ratio] || '1024x1024';
}

export default router;
