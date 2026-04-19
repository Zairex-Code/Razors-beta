'use client'

import { createClient } from '@/utils/supabase/client'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const importId = formData.get('importId') as string
    const type = formData.get('type') as string

    if (!file || !importId) {
      return NextResponse.json({ error: 'Missing file or importId' }, { status: 400 })
    }

    const supabase = createClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `imports/${importId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    const document = await prisma.document.create({
      data: {
        importId,
        type: type || fileExt || 'document',
        url: urlData.publicUrl
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}