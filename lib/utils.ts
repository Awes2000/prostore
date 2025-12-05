import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//convert a prisma object into a regular JS object
export function convertToPlainObject<T> (value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Format number with exactly 2 decimal places
export function formatNumberWithDecimal(num: number): string {
  return num.toFixed(2);
}
