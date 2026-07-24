import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utilidad para combinar clases CSS de Tailwind de forma segura (merge de conflictos)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
