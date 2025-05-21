import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date in a consistent way for both server and client rendering
 * @param dateString - The date string to format
 * @returns Formatted date string in DD/MM/YYYY format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0].split('-').reverse().join('/')
}
