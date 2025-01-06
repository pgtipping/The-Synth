import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { headers } from 'next/headers';

type FileType = 'image' | 'video' | 'audio';

// File size limits in bytes
const FILE_SIZE_LIMITS: Record<FileType, number> = {
  image: 5 * 1024 * 1024, // 5MB
  video: 15 * 1024 * 1024, // 15MB
  audio: 10 * 1024 * 1024, // 10MB
} as const;

// Valid file types
const VALID_TYPES: Record<FileType, readonly string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
} as const;

async function ensureDirectoryExists(dir: string) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    if ((error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}

function formatFileSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)}MB`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const typeParam = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (
      !typeParam ||
      typeof typeParam !== 'string' ||
      !(typeParam in FILE_SIZE_LIMITS)
    ) {
      return NextResponse.json(
        { error: 'Invalid file type parameter' },
        { status: 400 }
      );
    }

    const type = typeParam as FileType;

    // Validate file type
    if (!VALID_TYPES[type]?.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS[type]) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size for ${type} is ${formatFileSize(
            FILE_SIZE_LIMITS[type]
          )}`,
        },
        { status: 400 }
      );
    }

    // Create unique filename
    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;

    // Ensure upload directories exist
    const baseUploadDir = join(process.cwd(), 'public', 'uploads');
    const typeUploadDir = join(baseUploadDir, type);
    await ensureDirectoryExists(baseUploadDir);
    await ensureDirectoryExists(typeUploadDir);

    try {
      await writeFile(
        join(typeUploadDir, filename),
        Buffer.from(await file.arrayBuffer())
      );
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
    }

    // Get the host from the request headers
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

    // Return the absolute URL for the uploaded file
    return NextResponse.json({
      url: `${protocol}://${host}/uploads/${type}/${filename}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
