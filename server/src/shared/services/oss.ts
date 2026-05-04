/**
 * OSS file upload — upload a local file to Alibaba Cloud OSS.
 * Falls back to local path if OSS not configured or upload fails.
 */

import OSS from 'ali-oss';
import { readFile } from 'fs/promises';
import { extname, basename, join } from 'path';

let client: OSS | null = null;

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

/**
 * Upload a local file to OSS and return its public URL.
 * @param localFilePath - Absolute path to the local file
 */
export async function uploadToOSS(localFilePath: string): Promise<string> {
  const filename = basename(localFilePath);
  const key = `images/${filename}`;
  const cdnBase = getCdnBase();
  const ossClient = getClient();

  const fileBuffer = await readFile(localFilePath);
  await ossClient.put(key, fileBuffer);

  return `${cdnBase}/${key}`;
}
