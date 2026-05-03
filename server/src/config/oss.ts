/**
 * 阿里云 OSS 配置
 * 存储生成的商品图，走 CDN 加速访问
 */

export interface OSSConfig {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  baseUrl: string;      // OSS 外网访问地址（可绑定 CDN 域名）
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.warn(`[OSS] 缺少环境变量 ${key}，图片将保存到本地`);
    return '';
  }
  return value;
}

export const ossConfig: OSSConfig = {
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: getRequiredEnv('OSS_ACCESS_KEY_ID'),
  accessKeySecret: getRequiredEnv('OSS_ACCESS_KEY_SECRET'),
  bucket: process.env.OSS_BUCKET || 'sparkcommerce-images',
  baseUrl: process.env.OSS_BASE_URL || '',
};

export function isOssConfigured(): boolean {
  return !!(ossConfig.accessKeyId && ossConfig.accessKeySecret);
}
