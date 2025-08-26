import { NextRequest, NextResponse } from 'next/server'
import formidable from 'formidable'
import { convertPDFToDocx } from '@/lib/pdfConverter'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData()
    const file = formData.get('pdf') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Không tìm thấy file PDF' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File phải có định dạng PDF' },
        { status: 400 }
      )
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json(
        { error: 'File quá lớn. Vui lòng chọn file nhỏ hơn 50MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Convert PDF to DOCX
    const docxBuffer = await convertPDFToDocx(buffer)

    // Return the DOCX file
    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '.docx')}"`,
        'Content-Length': docxBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi chuyển đổi file. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes
