import { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoFile {
  id: string
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

interface PhotoUploadProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  maxSize?: number // em MB
  acceptedTypes?: string[]
  className?: string
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onUpload,
  maxFiles = 10,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className
}) => {
  const [files, setFiles] = useState<PhotoFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de arquivo não suportado. Use: ${acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo: ${maxSize}MB`
    }
    return null
  }

  const createPhotoFile = (file: File): PhotoFile => {
    const error = validateFile(file)
    return {
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: error ? 'error' : 'pending',
      error: error || undefined
    }
  }

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const remainingSlots = maxFiles - files.length
    const filesToAdd = fileArray.slice(0, remainingSlots)
    
    const photoFiles = filesToAdd.map(createPhotoFile)
    setFiles(prev => [...prev, ...photoFiles])
  }, [files.length, maxFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      handleFiles(selectedFiles)
    }
    // Reset input value para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFiles])

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const simulateUpload = async (photoFile: PhotoFile): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          
          setFiles(prev => prev.map(f => 
            f.id === photoFile.id 
              ? { ...f, progress: 100, status: 'success' }
              : f
          ))
          resolve()
        } else {
          setFiles(prev => prev.map(f => 
            f.id === photoFile.id 
              ? { ...f, progress: Math.round(progress) }
              : f
          ))
        }
      }, 200)
    })
  }

  const handleUpload = async () => {
    const validFiles = files.filter(f => f.status === 'pending')
    if (validFiles.length === 0) return

    setIsUploading(true)
    
    // Marcar arquivos como uploading
    setFiles(prev => prev.map(f => 
      f.status === 'pending' ? { ...f, status: 'uploading' as const } : f
    ))

    try {
      // Simular upload de cada arquivo
      await Promise.all(validFiles.map(simulateUpload))
      
      // Chamar callback com os arquivos válidos
      await onUpload(validFiles.map(f => f.file))
      
      // Limpar arquivos após upload bem-sucedido
      setTimeout(() => {
        files.forEach(f => URL.revokeObjectURL(f.preview))
        setFiles([])
      }, 1000)
      
    } catch (error) {
      // Marcar arquivos com erro
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' 
          ? { ...f, status: 'error', error: 'Erro no upload' }
          : f
      ))
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validFilesCount = files.filter(f => f.status !== 'error').length
  const canUpload = validFilesCount > 0 && !isUploading

  return (
    <div className={cn('space-y-4', className)}>
      {/* Área de Drop */}
      <Card 
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          files.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => files.length < maxFiles && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className={cn(
            'h-12 w-12 mb-4',
            isDragOver ? 'text-blue-500' : 'text-gray-400'
          )} />
          <h3 className="text-lg font-medium mb-2">
            {files.length >= maxFiles 
              ? 'Limite de arquivos atingido'
              : 'Arraste fotos aqui ou clique para selecionar'
            }
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Máximo {maxFiles} arquivos • Até {maxSize}MB cada<br />
            Formatos: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={files.length >= maxFiles}
          />
        </CardContent>
      </Card>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Arquivos Selecionados ({files.length}/{maxFiles})
                </h4>
                {canUpload && (
                  <Button onClick={handleUpload} disabled={isUploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Enviando...' : `Enviar ${validFilesCount} foto${validFilesCount !== 1 ? 's' : ''}`}
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((photoFile) => (
                  <div key={photoFile.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="relative">
                      <img
                        src={photoFile.preview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      {photoFile.status === 'success' && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {photoFile.status === 'error' && (
                        <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                          <AlertCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{photoFile.file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(photoFile.file.size)}</p>
                      
                      {photoFile.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={photoFile.progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">{photoFile.progress}%</p>
                        </div>
                      )}
                      
                      {photoFile.status === 'error' && photoFile.error && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {photoFile.error}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {photoFile.status === 'success' && (
                        <Badge variant="outline" className="mt-1 text-green-600 border-green-600">
                          Enviado
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(photoFile.id)}
                      disabled={photoFile.status === 'uploading'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PhotoUpload