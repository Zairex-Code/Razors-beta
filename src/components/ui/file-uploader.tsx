'use client'

import { useState, useCallback } from 'react'
import { Upload, X, FileText, Image, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'

type FileType = 'document' | 'image' | 'any'

interface UploadedFile {
  name: string
  url: string
  type: string
  size: number
}

interface FileUploaderProps {
  bucket: string
  folder?: string
  accept?: string
  fileType?: FileType
  maxSize?: number
  onUploadComplete?: (file: UploadedFile) => void
  onUploadError?: (error: string) => void
  className?: string
}

export function FileUploader({
  bucket,
  folder = '',
  accept,
  fileType = 'any',
  maxSize = 10 * 1024 * 1024,
  onUploadComplete,
  onUploadError,
  className
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const getAcceptString = () => {
    if (accept) return accept
    switch (fileType) {
      case 'document':
        return '.pdf,.doc,.docx,.xls,.xlsx'
      case 'image':
        return 'image/*'
      default:
        return '*/*'
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return <Image className="w-8 h-8 text-primary" />
    }
    return <FileText className="w-8 h-8 text-primary" />
  }

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > maxSize) {
      const errorMsg = `El tamaño del archivo excede el límite de ${maxSize / 1024 / 1024}MB`
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      const uploadedFileData: UploadedFile = {
        name: file.name,
        url: urlData.publicUrl,
        type: file.type,
        size: file.size
      }

      setUploadedFile(uploadedFileData)
      onUploadComplete?.(uploadedFileData)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al subir'
      setError(errorMsg)
      onUploadError?.(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }, [bucket, folder, maxSize, supabase, onUploadComplete, onUploadError])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      uploadFile(file)
    }
  }, [uploadFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }, [uploadFile])

  const handleRemove = useCallback(async () => {
    if (!uploadedFile) return

    try {
      const filePath = uploadedFile.url.split(`${bucket}/`)[1]
      await supabase.storage.from(bucket).remove([filePath])
      setUploadedFile(null)
    } catch (err) {
      console.error('Failed to delete file:', err)
    }
  }, [uploadedFile, bucket, supabase])

  if (uploadedFile) {
    return (
      <div className={cn('flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20', className)}>
        {getFileIcon(uploadedFile.name)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{uploadedFile.name}</p>
          <p className="text-xs text-gray-500">
            {(uploadedFile.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <CheckCircle className="w-5 h-5 text-green-400" />
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-700 hover:border-primary/50 hover:bg-foreground/5',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          type="file"
          accept={getAcceptString()}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <>
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-gray-400">Subiendo...</p>
          </>
        ) : (
          <>
            <div className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
              isDragging ? 'bg-primary/20 text-primary' : 'bg-foreground/5 text-gray-500'
            )}>
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">Arrastrar y soltar o hacer clic para subir</p>
              <p className="text-xs text-gray-500 mt-1">
                Máx {(maxSize / 1024 / 1024).toFixed(0)}MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

interface MultiFileUploaderProps extends Omit<FileUploaderProps, 'onUploadComplete'> {
  maxFiles?: number
  onUploadsComplete?: (files: UploadedFile[]) => void
}

export function MultiFileUploader({
  maxFiles = 5,
  onUploadsComplete,
  ...props
}: MultiFileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const handleUploadComplete = useCallback((file: UploadedFile) => {
    setFiles(prev => {
      const newFiles = [...prev, file]
      if (newFiles.length >= maxFiles) {
        onUploadsComplete?.(newFiles)
      }
      return newFiles
    })
  }, [maxFiles, onUploadsComplete])

  const handleRemove = useCallback((fileUrl: string) => {
    setFiles(prev => prev.filter(f => f.url !== fileUrl))
  }, [])

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div key={file.url} className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <FileText className="w-6 h-6 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            onClick={() => handleRemove(file.url)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {files.length < maxFiles && (
        <FileUploader {...props} onUploadComplete={handleUploadComplete} />
      )}
    </div>
  )
}
