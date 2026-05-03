/**
 * Prompt 组装引擎
 * 将用户输入 + 风格选择 → 组装成完整的 AI 生图 Prompt
 *
 * 支持主图模式和详情图模式
 */
import { STYLE_TEMPLATES, buildFinalPrompt, StyleTemplate } from '../config/promptStyles.js';

export interface UserSelections {
  userPrompt: string;
  aspectRatio: string;
  engineStyle: string;
  mainImageStyle: string;
  detailStyle: string;
  commerceStyle: string;
  isMainImage: boolean;
}

export interface AssembledPrompt {
  finalPrompt: string;
  matchedStyle: string;
  matchedStyleName: string;
  triggeredKeywords: string[];
}

// 旧版风格ID → 新风格ID 映射表
const styleToTemplateMap: Record<string, string> = {
  cinematic: '3c_tech',
  anime: 'mother_baby',
  oil: 'food_drink',
  cyber: '3c_tech',
  '3d': '3c_tech',
  minimalist: 'daily_goods',
  scene: 'home_appliance',
  macro: 'beauty_care',
  dynamic: 'sports',
  tech: '3c_tech',
  beauty: 'beauty_care',
  fashion: 'fashion',
  nature: 'daily_goods',
  tmall: 'fashion',
  xiaohongshu: 'beauty_care',
  ins: 'luxury',
  douyin: 'fashion',
};

const ASPECT_RATIO_TEXT: Record<string, string> = {
  '1:1': '1:1',
  '4:3': '4:3',
  '16:9': '16:9',
  '9:16': '9:16',
  '3:4': '3:4',
};

class PromptEngine {
  private compactPrompt(text: string, maxLen: number): string {
    const compacted = text
      .replace(/\r/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return compacted.length > maxLen ? compacted.slice(0, maxLen) : compacted;
  }

  assemble(userSelections: UserSelections): AssembledPrompt {
    const { userPrompt, aspectRatio, isMainImage } = userSelections;

    // 优先用显式选择的风格 → 关键词匹配 → 默认风格
    const explicitIds = [
      userSelections.engineStyle !== 'none' ? styleToTemplateMap[userSelections.engineStyle] : null,
      userSelections.mainImageStyle !== 'none' ? styleToTemplateMap[userSelections.mainImageStyle] : null,
      userSelections.detailStyle !== 'none' ? styleToTemplateMap[userSelections.detailStyle] : null,
      userSelections.commerceStyle !== 'none' ? styleToTemplateMap[userSelections.commerceStyle] : null,
    ].filter(Boolean) as string[];

    const keywordMatch = this.matchStyle(userPrompt);
    const styleId = explicitIds[0] || keywordMatch.matchedId || 'daily_goods';
    const style = STYLE_TEMPLATES.find(s => s.id === styleId) || STYLE_TEMPLATES[0];

    const mode = isMainImage ? 'main' : 'detail';
    const finalPrompt = buildFinalPrompt(
      userPrompt,
      style,
      mode,
      ASPECT_RATIO_TEXT[aspectRatio] || '1:1'
    );
    const cappedPrompt = this.compactPrompt(
      finalPrompt,
      mode === 'detail' ? 1800 : 1200
    );

    return {
      finalPrompt: cappedPrompt,
      matchedStyle: style.id,
      matchedStyleName: style.name,
      triggeredKeywords: keywordMatch.triggeredKeywords,
    };
  }

  matchStyle(userPrompt: string): { matchedId: string | null; triggeredKeywords: string[] } {
    const normalized = userPrompt.toLowerCase();
    const triggered: string[] = [];

    for (const template of STYLE_TEMPLATES) {
      const matched = template.keywords.filter(k =>
        normalized.includes(k.toLowerCase())
      );
      if (matched.length > 0) {
        triggered.push(...matched);
        return { matchedId: template.id, triggeredKeywords: [...new Set(triggered)] };
      }
    }

    return { matchedId: null, triggeredKeywords: [] };
  }

  getImageDimensions(aspectRatio: string): { width: number; height: number } {
    const dims: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '4:3': { width: 1024, height: 768 },
      '16:9': { width: 1280, height: 720 },
      '9:16': { width: 720, height: 1280 },
      '3:4': { width: 768, height: 1024 },
    };
    return dims[aspectRatio] || dims['1:1'];
  }
}

export const promptEngine = new PromptEngine();
