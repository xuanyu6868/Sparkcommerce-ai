/**
 * 图片存储工具 — 阿里云 OSS（未配置时降级为本地存储）
 *
 * 配置项：
 *   OSS_REGION, OSS_BUCKET, OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET
 */

import OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

let client: OSS | null = null;

function isOssConfigured(): boolean {
  return !!(process.env.OSS_REGION && process.env.OSS_BUCKET && process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET);
}

function getClient(): OSS {
  if (client) return client;
  client = new OSS({
    region: process.env.OSS_REGION!,
    bucket: process.env.OSS_BUCKET!,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
    secure: true,
  });
  return client;
}

function getCdnBase(): string {
  const customCdn = process.env.OSS_CDN_URL;
  if (customCdn) return customCdn.replace(/\/+$/, '');
  return `https://${process.env.OSS_BUCKET}.${process.env.OSS_REGION}.aliyuncs.com`;
}

// ============ 本地存储降级 ============

const LOCAL_DIR = join(process.cwd(), 'uploads');

async function ensureLocalDir(): Promise<void> {
  if (!existsSync(LOCAL_DIR)) {
    await mkdir(LOCAL_DIR, { recursive: true });
  }
}

async function saveToLocal(imageData: string, filename: string): Promise<void> {
  await ensureLocalDir();
  const filepath = join(LOCAL_DIR, filename);
  if (imageData.startsWith('data:')) {
    const base64Data = imageData.split(',')[1];
    await writeFile(filepath, Buffer.from(base64Data, 'base64'));
  } else if (imageData.startsWith('http')) {
    const response = await fetch(imageData);
    if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
    await writeFile(filepath, Buffer.from(await response.arrayBuffer()));
  } else {
    throw new Error('Invalid image data format');
  }
}

/**
 * 将图片数据上传至 OSS，返回可公开访问的 CDN URL
 * @param imageData Base64 或图片 URL
 * @param extension 文件扩展名
 */
export async function saveImageLocally(
  imageData: string,
  extension: string = 'png'
): Promise<string> {
  const filename = `${uuidv4()}.${extension}`;

  if (isOssConfigured()) {
    const key = `images/${filename}`;
    const cdnBase = getCdnBase();
    const ossClient = getClient();

    if (imageData.startsWith('data:')) {
      const base64Data = imageData.split(',')[1];
      await ossClient.put(key, Buffer.from(base64Data, 'base64'));
    } else if (imageData.startsWith('http')) {
      const response = await fetch(imageData);
      if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
      await ossClient.put(key, Buffer.from(await response.arrayBuffer()));
    } else {
      throw new Error('Invalid image data format');
    }

    return `${cdnBase}/${key}`;
  }

  // 降级：保存到本地
  await saveToLocal(imageData, filename);
  return `/uploads/${filename}`;
}

/**
 * 从 URL 下载图片并上传到 OSS
 */
export async function downloadAndSaveImage(imageUrl: string): Promise<string> {
  const extension = getExtensionFromUrl(imageUrl) || 'png';
  return saveImageLocally(imageUrl, extension);
}

function getExtensionFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop()?.toLowerCase();
    if (ext && ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
      return ext;
    }
  } catch {
    // noop
  }
  return null;
}
