/**
 * Cloudflare R2 Storage Adapter (Production)
 *
 * S3-compatible API with zero egress fees.
 * Pre-signed URLs for direct client upload/download.
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StoragePort {
  presignUpload(key: string, contentType: string, expiresIn?: number): Promise<{ url: string; key: string }>;
  presignDownload(key: string, expiresIn?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}

export class R2StorageAdapter implements StoragePort {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.R2_BUCKET_NAME!;
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async presignUpload(key: string, contentType: string, expiresIn = 300) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn });
    return { url, key };
  }

  async presignDownload(key: string, expiresIn = 300) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteObject(key: string) {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

// Lazy singleton
let storageInstance: R2StorageAdapter | null = null;

export function getStorage(): StoragePort {
  if (!storageInstance) {
    if (process.env.R2_BUCKET_NAME) {
      storageInstance = new R2StorageAdapter();
    } else {
      // Fallback: local storage adapter (sandbox)
      return new LocalStorageAdapter();
    }
  }
  return storageInstance;
}

/** Local storage adapter (sandbox fallback) */
class LocalStorageAdapter implements StoragePort {
  async presignUpload(key: string) {
    return { url: `/api/upload/${key}`, key };
  }
  async presignDownload(key: string) {
    return `/api/upload/${key}`;
  }
  async deleteObject(_key: string) {
    // No-op in sandbox
  }
}
