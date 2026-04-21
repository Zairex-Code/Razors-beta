'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/client'
import { uploadFileToStorage } from '@/lib/storage'

export async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: {
      inventory: {
        include: {
          location: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function getProductsForImport() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      brand: true,
      model: true,
      sku: true,
      category: true,
      imageUrl: true
    },
    orderBy: { name: 'asc' }
  })
  return products.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    brand: p.brand ?? undefined,
    model: p.model ?? undefined,
    imageUrl: p.imageUrl ?? undefined
  }))
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      inventory: { include: { location: true } },
      importItems: true,
      saleItems: true
    }
  })
}

export async function getProductBySku(sku: string) {
  return prisma.product.findUnique({
    where: { sku },
    include: { inventory: true }
  })
}

export async function getProductOptions() {
  const [allBrands, allCategories] = await Promise.all([
    prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand']
    }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ['category']
    })
  ])

  const brands = allBrands.map(r => r.brand).filter((b): b is string => !!b).sort()
  const categories = allCategories.map(r => r.category).filter((c): c is string => !!c).sort()

  return { brands, categories }
}

export async function uploadProductImage(file: File): Promise<string> {
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const fileExt = file.name.split('.').pop()
  const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `products/${fileName}`

  const { data, error } = await supabaseAdmin.storage
    .from('products')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Error al subir imagen: ${error.message}`)
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function searchProducts(query: string) {
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { model: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: { name: 'asc' },
    take: 10
  })
}

export async function createProduct(data: {
  sku: string
  name: string
  brand?: string
  model?: string
  category: string
  pricePen: number
  imageUrl?: string
}) {
  const locations = await prisma.location.findMany({
    where: { isActive: true }
  })

  const product = await prisma.product.create({
    data: {
      sku: data.sku,
      name: data.name,
      brand: data.brand || null,
      model: data.model || null,
      category: data.category,
      pricePen: data.pricePen,
      imageUrl: data.imageUrl || null,
      inventory: {
        create: locations.map(location => ({
          locationId: location.id,
          stock: 0
        }))
      }
    }
  })

  revalidatePath('/dashboard/inventory')
  return product
}

export async function updateInventoryStock(
  productId: string,
  locationId: string,
  quantity: number,
  operation: 'ADD' | 'SUBTRACT'
) {
  const current = await prisma.inventory.findUnique({
    where: {
      productId_locationId: { productId, locationId }
    }
  })

  if (!current) {
    return prisma.inventory.create({
      data: {
        productId,
        locationId,
        stock: operation === 'ADD' ? quantity : -quantity
      }
    })
  }

  const newStock = operation === 'ADD'
    ? current.stock + quantity
    : current.stock - quantity

  return prisma.inventory.update({
    where: { productId_locationId: { productId, locationId } },
    data: { stock: Math.max(0, newStock) }
  })
}

export async function updateProduct(id: string, data: {
  name: string
  brand?: string
  model?: string
  category: string
  pricePen: number
  imageUrl?: string
}) {
  const product = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      brand: data.brand || null,
      model: data.model || null,
      category: data.category,
      pricePen: data.pricePen,
      imageUrl: data.imageUrl || null
    }
  })

  revalidatePath('/dashboard/inventory')
  return product
}

export async function deleteProduct(id: string, force: boolean = false) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      saleItems: true,
      importItems: true
    }
  })

  if (!product) {
    throw new Error('Producto no encontrado')
  }

  const hasHistory = product.saleItems.length > 0 || product.importItems.length > 0

  if (hasHistory) {
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    })
  } else {
    if (force) {
      await prisma.product.delete({
        where: { id }
      })
    } else {
      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      })
    }
  }

  revalidatePath('/dashboard/inventory')
  return { success: true, softDeleted: hasHistory }
}