import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, s3Config } from './config';

export type FileType = 'image' | 'video' | 'audio';

// File size limits in bytes
export const FILE_SIZE_LIMITS: Record<FileType, number> = {
  image: 5 * 1024 * 1024, // 5MB
  video: 15 * 1024 * 1024, // 15MB
  audio: 10 * 1024 * 1024, // 10MB
} as const;

// Valid file types
export const VALID_TYPES: Record<FileType, readonly string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
} as const;

export function formatFileSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)}MB`;
}

export function validateFileType(type: string, fileType: FileType): boolean {
  return VALID_TYPES[fileType].includes(type);
}

export function validateFileSize(size: number, fileType: FileType): boolean {
  return size <= FILE_SIZE_LIMITS[fileType];
}

export class S3Service {
  /**
   * Upload a file to S3
   */
  static async uploadFile(file: Buffer, key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    try {
      await s3Client.send(command);
      // Return direct S3 URL instead of signed URL
      const url = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
      return { key, url };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete a file from S3
   */
  static async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
    });

    try {
      await s3Client.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get a direct URL for a file (no signing needed now that bucket is public)
   */
  static getPublicUrl(key: string) {
    return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
  }
}
