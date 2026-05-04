/**
 * Alibaba Cloud OSS configuration.
 * OSS is optional — if env vars are not set, images are stored locally.
 */

export function isOssConfigured(): boolean {
  return !!(process.env.OSS_REGION && process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET && process.env.OSS_BUCKET);
}
