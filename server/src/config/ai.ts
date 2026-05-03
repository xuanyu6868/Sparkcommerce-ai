// GPT image-1 API 配置
// 文档: https://cloud.tencent.com/developer/article/2658878

export interface AIConfig {
  provider: 'openai';
  apiKey: string;
  baseUrl: string;
  model: string;
  quality: string;
  timeoutMs: number;
}

function getRequiredEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value) {
    if (fallback !== undefined) return fallback;
    console.warn(`[Warning] Missing environment variable: ${key} — AI image generation will fail until set.`);
    return '';
  }
  return value;
}

export const aiConfig: AIConfig = {
  provider: 'openai',
  apiKey: getRequiredEnv('AI_API_KEY'),
  baseUrl: process.env.AI_API_HOST || 'https://lingsuan.nmyh.cc',
  model: process.env.AI_MODEL || 'gpt-image-2',
  // 默认改为 medium，显著降低单次生成耗时
  quality: process.env.AI_QUALITY || 'medium',
  // 给高质生成留足余量；如有需要可环境变量覆盖
  timeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS || 300000),
};

function normalizeBaseUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/v1') ? trimmed.slice(0, -3) : trimmed;
}

export function isAiConfigured(): boolean {
  return aiConfig.apiKey.length > 0;
}

// 图片生成 API 端点
export const IMAGE_API_ENDPOINT = `${normalizeBaseUrl(aiConfig.baseUrl)}/v1/images/generations`;
