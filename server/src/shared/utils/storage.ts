/**
 * 本地文件存储工具
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// 确保上传目录存在
async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * 保存图片到本地
 * @param imageData Base64 或 URL
 * @param extension 文件扩展名
 */
export async function saveImageLocally(
  imageData: string,
  extension: string = 'png'
): Promise<string> {
  await ensureUploadDir();

  const filename = `${uuidv4()}.${extension}`;
  const filepath = join(UPLOAD_DIR, filename);

  // 判断是 Base64 还是 URL
  if (imageData.startsWith('data:')) {
    // Base64 格式: data:image/png;base64,xxxxx
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(filepath, buffer);
  } else if (imageData.startsWith('http')) {
    // URL 格式：下载并保存
    const response = await fetch(imageData);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filepath, buffer);
  } else {
    throw new Error('Invalid image data format');
  }

  // 返回相对路径（用于 API 访问）
  return `/uploads/${filename}`;
}

/**
 * 从 URL 下载图片并保存到本地
 */
export async function downloadAndSaveImage(imageUrl: string): Promise<string> {
  // 根据 URL 推断扩展名
  const extension = getExtensionFromUrl(imageUrl) || 'png';
  return saveImageLocally(imageUrl, extension);
}

/**
 * 从 URL 获取扩展名
 */
function getExtensionFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop()?.toLowerCase();
    if (ext && ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
      return ext;
    }
  } catch {
    // 无效 URL
  }
  return null;
}
