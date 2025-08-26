'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ConversionState {
  status: 'idle' | 'uploading' | 'converting' | 'completed' | 'error'
  progress: number
  message: string
  downloadUrl?: string
  fileName?: string
}

export default function Home() {
  const [conversionState, setConversionState] = useState<ConversionState>({
    status: 'idle',
    progress: 0,
    message: ''
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    
    if (!file) return
    
    if (file.type !== 'application/pdf') {
      setConversionState({
        status: 'error',
        progress: 0,
        message: 'Vui lòng chọn file PDF hợp lệ'
      })
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setConversionState({
        status: 'error',
        progress: 0,
        message: 'File quá lớn. Vui lòng chọn file nhỏ hơn 50MB'
      })
      return
    }

    try {
      setConversionState({
        status: 'uploading',
        progress: 10,
        message: 'Đang tải file lên...'
      })

      const formData = new FormData()
      formData.append('pdf', file)

      setConversionState(prev => ({
        ...prev,
        status: 'converting',
        progress: 30,
        message: 'Đang chuyển đổi PDF sang Word...'
      }))

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Lỗi khi chuyển đổi file')
      }

      setConversionState(prev => ({
        ...prev,
        progress: 80,
        message: 'Đang hoàn thiện file Word...'
      }))

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const fileName = file.name.replace('.pdf', '.docx')

      setConversionState({
        status: 'completed',
        progress: 100,
        message: 'Chuyển đổi thành công!',
        downloadUrl,
        fileName
      })

    } catch (error) {
      setConversionState({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Có lỗi xảy ra khi chuyển đổi file'
      })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: conversionState.status === 'uploading' || conversionState.status === 'converting'
  })

  const handleDownload = () => {
    if (conversionState.downloadUrl && conversionState.fileName) {
      const link = document.createElement('a')
      link.href = conversionState.downloadUrl
      link.download = conversionState.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const resetState = () => {
    if (conversionState.downloadUrl) {
      URL.revokeObjectURL(conversionState.downloadUrl)
    }
    setConversionState({
      status: 'idle',
      progress: 0,
      message: ''
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Chuyển đổi PDF sang Word
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Chuyển đổi tài liệu PDF thành file Word (.docx) với bảo toàn hoàn toàn các công thức toán học, 
          hóa học và định dạng gốc
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Tải lên file PDF</CardTitle>
          <CardDescription>
            Hỗ trợ file PDF chứa công thức toán học, vật lý, hóa học. Kích thước tối đa: 50MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${conversionState.status === 'uploading' || conversionState.status === 'converting' 
                ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Thả file PDF vào đây' : 'Kéo thả file PDF hoặc nhấp để chọn'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Chỉ chấp nhận file PDF, tối đa 50MB
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {(conversionState.status === 'uploading' || conversionState.status === 'converting') && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{conversionState.message}</span>
                <span className="text-gray-600">{conversionState.progress}%</span>
              </div>
              <Progress value={conversionState.progress} className="w-full" />
            </div>
          )}

          {/* Success State */}
          {conversionState.status === 'completed' && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                <div className="flex items-center justify-between">
                  <span>{conversionState.message}</span>
                  <div className="space-x-2">
                    <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                      Tải về Word
                    </Button>
                    <Button onClick={resetState} variant="outline">
                      Chuyển đổi file khác
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {conversionState.status === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                <div className="flex items-center justify-between">
                  <span>{conversionState.message}</span>
                  <Button onClick={resetState} variant="outline">
                    Thử lại
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Bảo toàn công thức</h3>
          <p className="text-sm text-gray-600">
            Giữ nguyên các công thức toán học, vật lý, hóa học trong quá trình chuyển đổi
          </p>
        </div>
        
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Xử lý nhanh chóng</h3>
          <p className="text-sm text-gray-600">
            Chuyển đổi file PDF sang Word chỉ trong vài phút với chất lượng cao
          </p>
        </div>
        
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">An toàn bảo mật</h3>
          <p className="text-sm text-gray-600">
            File được xử lý cục bộ, không lưu trữ trên server, đảm bảo tính bảo mật
          </p>
        </div>
      </div>
    </div>
  )
}
