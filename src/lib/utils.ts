import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const cleanEmptyKeys = (obj: Record<string, any>) => {
  for (const key in obj) {
    if (key === "") {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      cleanEmptyKeys(obj[key]);
    }
  }
};
