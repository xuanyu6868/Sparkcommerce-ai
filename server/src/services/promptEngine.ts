/**
 * Prompt 组装引擎
 * 将用户输入 + 风格选择 → 组装成完整的 AI 生图 Prompt
 *
 * 更新：适配新的中文强化提示词结构
 */

import { STYLE_TEMPLATES, StyleTemplate, GLOBAL_PRODUCT_DETAIL_RULES, GLOBAL_NEGATIVE_PROMPT, PRODUCT_DETAIL_MODULES, DetailModulePrompt, buildFinalPrompt } from '../config/promptStyles.js';

// 用户选择参数
export interface UserSelections {
  userPrompt: string;           // 用户输入的提示词
  aspectRatio: string;          // 1:1 | 4:3 | 16:9 | 9:16 | 3:4
  engineStyle: string;          // cinematic | anime | oil | cyber | 3d | none (兼容旧版)
  mainImageStyle: string;       // minimalist | scene | macro | dynamic | none (兼容旧版)
  detailStyle: string;          // tech | beauty | fashion | nature | none (兼容旧版)
  commerceStyle: string;        // tmall | xiaohongshu | ins | douyin | none (兼容旧版)
  isMainImage: boolean;         // true=主图模式, false=详情图模式
}

// 组装结果
export interface AssembledPrompt {
  finalPrompt: string;          // 最终发送给AI的prompt
  matchedStyles: string[];      // 匹配到的风格ID列表
  matchedStyleNames: string[]; // 匹配到的风格名称列表
  triggeredKeywords: string[];  // 被触发的关键词
  negativePrompt?: string;      // 负面提示词
}

// 比例追加词（用于主图模式）
const ASPECT_RATIO_PROMPTS: Record<string, string> = {
  '1:1': '1:1 方形比例，主体居中，产品展示',
  '4:3': '4:3 标准比例，平衡构图，多用途布局',
  '16:9': '16:9 宽屏比例，电影感构图，戏剧性场景',
  '9:16': '9:16 竖版比例，短视频格式，社媒适配',
  '3:4': '3:4 竖版比例，人像展示，编辑布局',
};

class PromptEngine {
  private styleToTemplateMap: Record<string, string> = {
    cinematic: 'tmall_pro',
    anime: 'japanese_clean',
    oil: 'japanese_clean',
    cyber: 'dopamine_trend',
    '3d': '3c_tech',
    minimalist: 'business_minimal_main',
    scene: 'lifestyle_detail',
    macro: 'texture_detail_main',
    dynamic: 'sports_outdoor',
    tech: '3c_tech',
    beauty: 'skincare_closeup',
    fashion: 'sports_outdoor',
    nature: 'home_lifestyle',
    tmall: 'tmall_pro',
    xiaohongshu: 'japanese_clean',
    ins: 'delicate_scene_detail',
    douyin: 'dopamine_trend',
  };

  /**
   * 核心方法：组装完整 Prompt
   */
  assemble(userSelections: UserSelections): AssembledPrompt {
    const {
      userPrompt,
      aspectRatio,
      engineStyle,
      mainImageStyle,
      detailStyle,
      commerceStyle,
    } = userSelections;

    // 收集显式选择的风格 ID
    const explicitStyleIds = [
      engineStyle !== 'none' ? this.styleToTemplateMap[engineStyle] : null,
      mainImageStyle !== 'none' ? this.styleToTemplateMap[mainImageStyle] : null,
      detailStyle !== 'none' ? this.styleToTemplateMap[detailStyle] : null,
      commerceStyle !== 'none' ? this.styleToTemplateMap[commerceStyle] : null,
    ].filter(Boolean) as string[];

    // 关键词匹配风格（作为补充）
    const keywordMatch = this.matchStyles(userPrompt);

    // 优先使用显式选择的风格，其次关键词匹配，最后默认
    let primaryStyleId = explicitStyleIds[0] || keywordMatch.matchedStyles[0] || 'realistic_commercial';

    const primaryStyle = STYLE_TEMPLATES.find(s => s.id === primaryStyleId)
      || STYLE_TEMPLATES.find(s => s.id === 'realistic_commercial');

    if (!primaryStyle) {
      throw new Error('未找到匹配的风格模板');
    }

    // 构建最终 Prompt
    const finalPrompt = buildFinalPrompt(
      userPrompt,
      primaryStyle,
      [],
      { splitModules: false }
    );

    // 添加比例信息
    const aspectText = ASPECT_RATIO_PROMPTS[aspectRatio] || ASPECT_RATIO_PROMPTS['1:1'];
    const finalPromptWithAspect = `${finalPrompt}\n\n图片比例要求：${aspectText}`;

    return {
      finalPrompt: this.truncatePrompt(finalPromptWithAspect, 2000),
      matchedStyles: [primaryStyleId],
      matchedStyleNames: [primaryStyle.name],
      triggeredKeywords: keywordMatch.triggeredKeywords,
      negativePrompt: primaryStyle.negativePrompt || GLOBAL_NEGATIVE_PROMPT
    };
  }

  /**
   * 关键词匹配风格 - 简单匹配（支持多风格触发）
   * 返回匹配到的风格ID列表
   */
  matchStyles(userPrompt: string): {
    matchedStyles: string[];
    matchedStyleNames: string[];
    triggeredKeywords: string[];
  } {
    const normalizedPrompt = userPrompt.toLowerCase();
    const matchedStyles: string[] = [];
    const matchedStyleNames: string[] = [];
    const triggeredKeywords: string[] = [];

    for (const template of STYLE_TEMPLATES) {
      const matched = template.keywords.filter(keyword =>
        normalizedPrompt.includes(keyword.toLowerCase())
      );

      if (matched.length > 0) {
        matchedStyles.push(template.id);
        matchedStyleNames.push(template.name);
        triggeredKeywords.push(...matched);
      }
    }

    // 如果没有匹配任何风格，使用默认风格
    if (matchedStyles.length === 0) {
      matchedStyles.push('realistic_commercial');
      matchedStyleNames.push('实景写实商用风');
    }

    return {
      matchedStyles,
      matchedStyleNames,
      triggeredKeywords: [...new Set(triggeredKeywords)] // 去重
    };
  }

  /**
   * 获取图片尺寸（基于比例）
   */
  getImageDimensions(aspectRatio: string): { width: number; height: number } {
    const dimensions: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '4:3': { width: 1024, height: 768 },
      '16:9': { width: 1280, height: 720 },
      '9:16': { width: 720, height: 1280 },
      '3:4': { width: 768, height: 1024 },
    };
    return dimensions[aspectRatio] || dimensions['1:1'];
  }

  /**
   * Prompt 长度控制（中文优化版）
   * 中文每个字符算一个单位，英文每个字符算0.5个单位
   */
  private truncatePrompt(prompt: string, maxLength: number = 2000): string {
    // 计算有效长度（中文=1，英文=0.5）
    const calculateLength = (str: string): number => {
      let length = 0;
      for (const char of str) {
        length += char.charCodeAt(0) > 127 ? 1 : 0.5;
      }
      return length;
    };

    if (calculateLength(prompt) <= maxLength) return prompt;

    // 保留核心高质量描述
    const qualitySuffix = '，超高质量，8K分辨率，专业商业摄影，高细节，锐利焦点，精致光影，杰作';
    const parts = prompt.split('\n\n');

    let result = '';
    for (const part of parts) {
      const newResult = result + part + '\n\n';
      if (calculateLength(newResult) > maxLength - calculateLength(qualitySuffix)) {
        break;
      }
      result = newResult;
    }

    return result.trim() + qualitySuffix;
  }

  /**
   * 获取所有风格列表（供前端展示）
   */
  getAllStyles(): StyleTemplate[] {
    return STYLE_TEMPLATES;
  }
}

// 单例导出
export const promptEngine = new PromptEngine();
