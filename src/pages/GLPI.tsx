import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  X, 
  FileUp, 
  History, 
  Filter, 
  Download
} from 'lucide-react'
import { useImportGLPI, useImportGLPIStatus } from '@/hooks/useAPI'
import { ImportacaoGLPI } from '@/types/entities'
import { formatDate, formatFileSize } from '@/lib/utils'

const GLPI: React.FC = () => {
  // Estado para o arquivo selecionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [importId, setImportId] = useState<string>('')
  const [importHistory] = useState<ImportacaoGLPI[]>([
    {
      id: 'imp-001',
      arquivo_nome: 'chamados-glpi-jan2023.pdf',
      status: 'concluida',
      total_registros: 45,
      registros_processados: 45,
      registros_importados: 42,
      registros_duplicados: 3,
      erros: [],
      data_importacao: new Date('2023-01-15T10:30:00')
    },
    {
      id: 'imp-002',
      arquivo_nome: 'chamados-glpi-fev2023.pdf',
      status: 'concluida',
      total_registros: 38,
      registros_processados: 38,
      registros_importados: 35,
      registros_duplicados: 2,
      erros: ['Registro #123 com formato inválido'],
      data_importacao: new Date('2023-02-12T14:15:00')
    },
    {
      id: 'imp-003',
      arquivo_nome: 'chamados-glpi-mar2023.csv',
      status: 'erro',
      total_registros: 52,
      registros_processados: 10,
      registros_importados: 8,
      registros_duplicados: 1,
      erros: ['Erro de conexão com o servidor', 'Formato de arquivo incompatível'],
      data_importacao: new Date('2023-03-05T09:45:00')
    }
  ])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Mutation para importar arquivo GLPI
  const importGLPI = useImportGLPI({
    onSuccess: (data) => {
      setImportId(data.id)
      setSelectedFile(null)
    }
  })
  
  // Query para acompanhar o status da importação
  const importStatus = useImportGLPIStatus(importId)
  
  // Manipuladores de eventos para upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }
  
  const handleImport = () => {
    if (selectedFile) {
      importGLPI.mutate(selectedFile)
    }
  }
  
  // Renderizar o status da importação atual
  const renderImportStatus = () => {
    if (!importId || !importStatus.data) return null
    
    const status = importStatus.data
    const progress = status.registros_processados / status.total_registros * 100
    
    return (
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${status.status === 'processando' ? 'animate-spin' : ''}`} />
            Importação em Andamento
          </CardTitle>
          <CardDescription>
            Arquivo: {status.arquivo_nome}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Status: </span>
              <StatusBadge status={status.status} />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progresso:</span>
                <span>{status.registros_processados} de {status.total_registros} registros</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Importados:</p>
                <p className="font-medium">{status.registros_importados}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duplicados:</p>
                <p className="font-medium">{status.registros_duplicados}</p>
              </div>
            </div>
            
            {status.erros.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-red-500 mb-1">Erros:</p>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  {status.erros.map((erro, index) => (
                    <li key={index} className="text-red-500">{erro}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Componente para exibir o status como badge
  const StatusBadge: React.FC<{ status: ImportacaoGLPI['status'] }> = ({ status }) => {
    switch (status) {
      case 'processando':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Processando</Badge>
      case 'concluida':
        return <Badge className="bg-green-500 hover:bg-green-600">Concluída</Badge>
      case 'erro':
        return <Badge className="bg-red-500 hover:bg-red-600">Erro</Badge>
      default:
        return null
    }
  }
  
  // Componente para exibir o ícone de status
  const StatusIcon: React.FC<{ status: ImportacaoGLPI['status'] }> = ({ status }) => {
    switch (status) {
      case 'processando':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'concluida':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'erro':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Upload className="h-8 w-8" />
          Integração GLPI
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Upload de Arquivo GLPI</CardTitle>
              <CardDescription>
                Faça upload de arquivos PDF ou CSV exportados do GLPI para importar chamados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
                  ${importGLPI.isLoading ? 'opacity-50 pointer-events-none' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <FileText className="h-10 w-10 text-primary mb-2" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleImport()
                        }}
                        disabled={importGLPI.isLoading}
                      >
                        {importGLPI.isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Importando...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Importar Arquivo
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFile(null)
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-medium">Clique ou arraste um arquivo</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Suporta arquivos PDF e CSV exportados do GLPI
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.csv"
                  onChange={handleFileChange}
                  disabled={importGLPI.isLoading}
                />
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p className="font-medium">Instruções:</p>
                <ol className="list-decimal pl-5 space-y-1 mt-1">
                  <li>Exporte seus chamados do GLPI em formato PDF ou CSV</li>
                  <li>Faça upload do arquivo usando o campo acima</li>
                  <li>O sistema processará automaticamente os dados</li>
                  <li>Os chamados serão convertidos em atividades no sistema</li>
                </ol>
              </div>
            </CardContent>
          </Card>
          
          {renderImportStatus()}
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Importações
              </CardTitle>
              <CardDescription>
                Últimas importações realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importHistory.length > 0 ? (
                  importHistory.map((importItem) => (
                    <div 
                      key={importItem.id} 
                      className="p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <StatusIcon status={importItem.status} />
                          <div>
                            <p className="font-medium text-sm line-clamp-1">
                              {importItem.arquivo_nome}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(importItem.data_importacao)}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={importItem.status} />
                      </div>
                      
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Total:</p>
                          <p className="font-medium">{importItem.total_registros}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Importados:</p>
                          <p className="font-medium">{importItem.registros_importados}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duplicados:</p>
                          <p className="font-medium">{importItem.registros_duplicados}</p>
                        </div>
                      </div>
                      
                      {importItem.erros.length > 0 && (
                        <div className="mt-2">
                          <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {importItem.erros.length} erro(s)
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Nenhuma importação realizada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default GLPI