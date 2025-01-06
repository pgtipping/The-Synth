import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractFirstImage(content: string): string | null {
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = content.match(imgRegex);
  return match ? match[1] : null;
}

export function truncateHTML(html: string, maxLength: number): string {
  // Remove HTML tags for length calculation
  const textContent = html.replace(/<[^>]*>/g, '');

  if (textContent.length <= maxLength) {
    return html;
  }

  // Find the last space before maxLength
  const truncated = textContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace === -1) {
    return truncated + '...';
  }

  return truncated.substring(0, lastSpace) + '...';
}
