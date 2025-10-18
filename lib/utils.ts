/**
 * Utility functions
 */

import { type ClassValue, clsx } from 'clsx';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format bytes to human-readable format
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format date to readable string
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

// Validate MongoDB connection URI
export function validateMongoUri(uri: string): { valid: boolean; error?: string } {
  try {
    // Basic validation
    if (!uri || uri.trim().length === 0) {
      return { valid: false, error: 'URI cannot be empty' };
    }

    // Check if it starts with mongodb:// or mongodb+srv://
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      return { valid: false, error: 'URI must start with mongodb:// or mongodb+srv://' };
    }

    // Extract host
    const match = uri.match(/^mongodb(\+srv)?:\/\/([^/]+)/);
    if (!match) {
      return { valid: false, error: 'Invalid URI format' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URI format' };
  }
}

// Extract host from MongoDB URI
export function extractHostFromUri(uri: string): string {
  try {
    const match = uri.match(/^mongodb(\+srv)?:\/\/([^@]+@)?([^/]+)/);
    if (match && match[3]) {
      return match[3];
    }
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Pretty print JSON
export function prettyPrintJson(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

// Parse JSON safely
export function parseJsonSafely(json: string): { success: boolean; data?: any; error?: string } {
  try {
    const data = JSON.parse(json);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Truncate string
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Check if value is ObjectId-like
export function isObjectIdLike(value: any): boolean {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}
