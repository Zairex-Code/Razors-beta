import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/client'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const document = await prisma.document.findUnique({
      where: { id }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const supabase = createClient()

    const urlParts = document.url.split('/')
    const bucketIndex = urlParts.findIndex(part => part === 'documents')
    const filePath = urlParts.slice(bucketIndex + 1).join('/')

    if (filePath) {
      await supabase.storage.from('documents').remove([filePath])
    }

    await prisma.document.delete({
      where: { id }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}