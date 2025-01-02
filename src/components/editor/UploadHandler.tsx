'use client';

import { useState } from 'react';

interface UploadHandlerProps {
  onUpload: (file: File, type: 'image' | 'video' | 'audio') => Promise<string>;
  onError: (error: string) => void;
}

export default function UploadHandler({
  onUpload,
  onError,
}: UploadHandlerProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    file: File,
    type: 'image' | 'video' | 'audio'
  ) => {
    if (!file) return;

    // Validate file type and size
    const validTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    };

    if (!validTypes[type].includes(file.type)) {
      onError(
        `Invalid file type for ${type}. Supported types: ${validTypes[type].join(', ')}`
      );
      return;
    }

    const maxSize = {
      image: 5 * 1024 * 1024, // 5MB
      video: 50 * 1024 * 1024, // 50MB
      audio: 10 * 1024 * 1024, // 10MB
    };

    if (file.size > maxSize[type]) {
      onError(
        `File too large. Maximum size for ${type}: ${maxSize[type] / 1024 / 1024}MB`
      );
      return;
    }

    try {
      setIsUploading(true);

      // Create FormData and append file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Upload file to backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      onError('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (
    type: 'image' | 'video' | 'audio',
    callback: (url: string) => void
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept =
      type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = await handleFileUpload(file, type);
        if (url) {
          callback(url);
        }
      }
    };

    input.click();
  };

  return {
    handleFileInput,
    isUploading,
  };
}
