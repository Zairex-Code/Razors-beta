import { createClient } from '@/utils/supabase/client'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export class StorageUploadError extends Error {
  constructor(message: string, public fileName?: string) {
    super(message)
    this.name = 'StorageUploadError'
  }
}

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100)
}

function getSupabaseAdmin() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function uploadFileToStorage(
  bucket: string,
  folder: string,
  file: File | Blob,
  fileName?: string
): Promise<string> {
  const supabase = createClient()

  const originalName = fileName || (file instanceof File ? file.name : 'file')
  const sanitizedName = sanitizeFileName(originalName)
  const ext = sanitizedName.split('.').pop()
  const baseName = sanitizedName.substring(0, sanitizedName.length - (ext ? ext.length + 1 : 0))
  const uniqueFileName = `${baseName}_${Date.now()}.${ext}`
  const filePath = `${folder}/${uniqueFileName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new StorageUploadError(`Error al subir "${originalName}": ${error.message}`, originalName)
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function uploadFileToStorageAdmin(
  bucket: string,
  folder: string,
  file: File | Blob,
  fileName?: string
): Promise<string> {
  const supabase = getSupabaseAdmin()

  const originalName = fileName || (file instanceof File ? file.name : 'file')
  const sanitizedName = sanitizeFileName(originalName)
  const ext = sanitizedName.split('.').pop()
  const baseName = sanitizedName.substring(0, sanitizedName.length - (ext ? ext.length + 1 : 0))
  const uniqueFileName = `${baseName}_${Date.now()}.${ext}`
  const filePath = `${folder}/${uniqueFileName}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new StorageUploadError(`Error al subir "${originalName}": ${error.message}`, originalName)
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return urlData.publicUrl
}