import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '@/env.mjs';
import crypto from 'crypto';
import { TRPCError } from '@trpc/server';

interface ImageSize {
  width: number;
  height: number | null;
  suffix: string;
}

interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
}

const imageSizes: ImageSize[] = [
  { width: 300, height: null, suffix: 'thumbnail' },
  { width: 800, height: null, suffix: 'medium' },
  { width: 1200, height: null, suffix: 'large' },
];

export class ImageService {
  private s3Client: S3Client | null = null;
  private bucket: string | null = null;

  private initializeS3() {
    if (
      !env.AWS_ACCESS_KEY_ID ||
      !env.AWS_SECRET_ACCESS_KEY ||
      !env.AWS_REGION ||
      !env.AWS_BUCKET_NAME
    ) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'AWS credentials not configured',
      });
    }

    this.s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucket = env.AWS_BUCKET_NAME;
  }

  private ensureS3Client() {
    if (!this.s3Client || !this.bucket) {
      this.initializeS3();
    }
  }

  private generateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private async getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    return {
      width,
      height,
      aspectRatio: width / height,
    };
  }

  private async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    this.ensureS3Client();

    if (!this.s3Client || !this.bucket) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'S3 client not initialized',
      });
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    await this.s3Client.send(command);
    return `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async processAndUploadImage(
    buffer: Buffer,
    originalFilename: string
  ): Promise<{
    original: string;
    variants: Record<string, string>;
    metadata: ImageMetadata;
  }> {
    const hash = this.generateHash(buffer);
    const ext = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
    const variants: Record<string, string> = {};

    // Get original image metadata
    const metadata = await this.getImageMetadata(buffer);

    // Upload original
    const originalKey = `original/${hash}.${ext}`;
    const originalUrl = await this.uploadToS3(
      buffer,
      originalKey,
      `image/${ext === 'jpg' ? 'jpeg' : ext}`
    );

    // Process and upload variants
    for (const size of imageSizes) {
      const optimizedBuffer = await sharp(buffer)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();

      const variantKey = `optimized/${size.suffix}/${hash}.webp`;
      const variantUrl = await this.uploadToS3(
        optimizedBuffer,
        variantKey,
        'image/webp'
      );

      variants[size.suffix] = variantUrl;
    }

    return {
      original: originalUrl,
      variants,
      metadata,
    };
  }
}
