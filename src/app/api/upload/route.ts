import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { headers } from 'next/headers';
import {
  S3Service,
  FileType,
  validateFileType,
  validateFileSize,
  formatFileSize,
  FILE_SIZE_LIMITS,
} from '@/lib/s3/service';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as FileType | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json(
        { error: 'File type not specified' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file.type, type)) {
      return NextResponse.json(
        { error: `Invalid file type. Supported types: ${type}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size, type)) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size for ${type} files is ${formatFileSize(FILE_SIZE_LIMITS[type])}`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const extension = file.name.split('.').pop() || '';
    const filename = `${uuidv4()}.${extension}`;
    const key = `${type}/${filename}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3 and get direct URL
    const { url } = await S3Service.uploadFile(buffer, key, file.type);

    return NextResponse.json({
      success: true,
      url,
      key,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Add DELETE endpoint to remove files
export async function DELETE(request: Request) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: 'No file key provided' },
        { status: 400 }
      );
    }

    await S3Service.deleteFile(key);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
