import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ProductWithBrand = {
  name: string
  brand?: string | null
  model?: string | null
}

export function productName(p: ProductWithBrand): string {
  const parts: string[] = []
  if (p.brand) parts.push(p.brand.trim())
  parts.push(p.name.trim())
  if (p.model) parts.push(`- ${p.model.trim()}`)
  return parts.join(' ')
}
