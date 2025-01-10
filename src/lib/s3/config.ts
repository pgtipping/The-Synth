import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error('AWS_ACCESS_KEY_ID is not defined');
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS_SECRET_ACCESS_KEY is not defined');
}

if (!process.env.AWS_REGION) {
  throw new Error('AWS_REGION is not defined');
}

if (!process.env.AWS_BUCKET_NAME) {
  throw new Error('AWS_BUCKET_NAME is not defined');
}

export const s3Config = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
  bucketName: process.env.AWS_BUCKET_NAME,
};

// Create S3 client instance
export const s3Client = new S3Client({
  credentials: s3Config.credentials,
  region: s3Config.region,
});
