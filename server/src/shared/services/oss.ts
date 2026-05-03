/**
 * 阿里云 OSS 上传服务
 * 使用 aliyun-oss SDK 将图片上传到 OSS
 */

import { Readable } from 'stream';
import { createReadStream, unlinkSync } from 'fs';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ossConfig, isOssConfigured } from '../../config/oss.js';

let OSS: any = null;

async function getOSSClient(): Promise<any> {
  if (!OSS) {
    try {
      OSS = await import('ali-oss');
    } catch {
      throw new Error('ali-oss 未安装，请执行: npm install ali-oss');
    }
  }

  const client = new OSS.default({
    region: ossConfig.region,
    accessKeyId: ossConfig.accessKeyId,
    accessKeySecret: ossConfig.accessKeySecret,
    bucket: ossConfig.bucket,
    secure: true,
  });

  return client;
}

/**
 * 上传本地文件到 OSS
 * @param localPath 本地文件路径
 * @returns OSS 可访问 URL
 */
export async function uploadToOSS(localPath: string): Promise<string> {
  if (!isOssConfigured()) {
    throw new Error('OSS 未配置，请检查 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET');
  }

  const client = await getOSSClient();
  const ext = extname(localPath) || '.png';
  const objectKey = `images/${uuidv4()}${ext}`;

  console.log(`[OSS] 上传文件: ${localPath} → ${objectKey}`);

  try {
    const result = await client.put(objectKey, localPath, {
      headers: {
        'Cache-Control': 'public, max-age=31536000',  // 缓存 1 年
      },
    });

    const url = result.url || `${ossConfig.baseUrl}/${objectKey}`;
    console.log(`[OSS] 上传成功: ${url}`);

    // 删除本地临时文件
    try {
      unlinkSync(localPath);
      console.log(`[OSS] 已删除本地临时文件: ${localPath}`);
    } catch (err) {
      console.warn(`[OSS] 删除本地文件失败: ${localPath}`, err);
    }

    return url;
  } catch (err: any) {
    console.error(`[OSS] 上传失败:`, err?.message || err);
    throw new Error(`OSS 上传失败: ${err?.message || '未知错误'}`);
  }
}

/**
 * 从 Base64 数据直接上传到 OSS（跳过本地存储）
 * @param base64Data Base64 图片数据（不含 data: 前缀）
 * @returns OSS 可访问 URL
 */
export async function uploadBase64ToOSS(base64Data: string, ext: string = 'png'): Promise<string> {
  if (!isOssConfigured()) {
    throw new Error('OSS 未配置');
  }

  const client = await getOSSClient();
  const objectKey = `images/${uuidv4()}.${ext}`;
  const buffer = Buffer.from(base64Data, 'base64');

  console.log(`[OSS] 上传 Base64 图片: ${objectKey} (${(buffer.length / 1024).toFixed(1)}KB)`);

  try {
    const result = await client.put(objectKey, buffer, {
      headers: {
        'Cache-Control': 'public, max-age=31536000',
      },
    });

    return result.url || `${ossConfig.baseUrl}/${objectKey}`;
  } catch (err: any) {
    console.error(`[OSS] 上传 Base64 失败:`, err?.message || err);
    throw new Error(`OSS 上传失败: ${err?.message || '未知错误'}`);
  }
}
