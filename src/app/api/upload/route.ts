import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { type Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Allowed file types and sizes
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
};

const MAX_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  video: 50 * 1024 * 1024, // 50MB
  audio: 10 * 1024 * 1024, // 10MB
};

export async function POST(request: Request) {
  // Verify authentication
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse form data
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const type = formData.get('type') as 'image' | 'video' | 'audio';

  // Validate input
  if (!file || !type || !ALLOWED_TYPES[type]) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Validate file type
  if (!ALLOWED_TYPES[type].includes(file.type)) {
    return NextResponse.json(
      {
        error: `Invalid file type. Allowed types: ${ALLOWED_TYPES[type].join(', ')}`,
      },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_SIZES[type]) {
    return NextResponse.json(
      {
        error: `File too large. Maximum size: ${MAX_SIZES[type] / 1024 / 1024}MB`,
      },
      { status: 400 }
    );
  }

  let filePath = '';
  try {
    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    filePath = join(process.cwd(), 'public/uploads', filename);

    // Save file to uploads directory
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return URL to access the file
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    // Clean up failed upload
    if (filePath) {
      await unlink(filePath).catch(() => {});
    }

    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
