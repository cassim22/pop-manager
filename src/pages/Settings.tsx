import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, RefreshCw, User, Bell, Shield, Database, Mail, Globe, Clock } from 'lucide-react'
import { useUpdateUserProfile } from '@/hooks/useAPI'


const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    // Configurações de usuário
    nome: 'Administrador',
    email: 'admin@empresa.com',
    cargo: 'Administrador do Sistema',
    tema: 'light',
    idioma: 'pt-BR',
    
    // Configurações de notificações
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    alertasManutencao: true,
    alertasVencimento: true,
    
    // Configurações do sistema
    backupAutomatico: true,
    frequenciaBackup: 'diario',
    retencaoLogs: '30',
    timeoutSessao: '60',
    
    // Configurações de integração
    apiGLPI: '',
    urlServidor: 'http://localhost:3000',
    versaoAPI: 'v1'
  })

  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const updateProfile = useUpdateUserProfile()

  const handleSave = async () => {
    if (!hasChanges) return

    try {
      // Preparar dados para salvar no perfil do usuário
      const profileData = {
        nome: settings.nome,
        email: settings.email,
        cargo: settings.cargo,
        configuracoes: {
          tema: settings.tema,
          idioma: settings.idioma,
          notificacoes: {
            email: settings.emailNotifications,
            push: settings.pushNotifications,
            sms: settings.smsNotifications,
            alertas_manutencao: settings.alertasManutencao,
            alertas_vencimento: settings.alertasVencimento
          },
          sistema: {
            backup_automatico: settings.backupAutomatico,
            frequencia_backup: settings.frequenciaBackup,
            retencao_logs: settings.retencaoLogs,
            timeout_sessao: settings.timeoutSessao
          },
          integracao: {
            api_glpi: settings.apiGLPI,
            url_servidor: settings.urlServidor,
            versao_api: settings.versaoAPI
          }
        }
      }

      await updateProfile.mutateAsync(profileData)
      setHasChanges(false)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
    }
  }

  const handleReset = () => {
    // Aqui seria implementada a lógica para restaurar configurações padrão
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Configure as preferências e parâmetros do sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
            {hasChanges && <Badge variant="destructive" className="ml-2 h-2 w-2 p-0" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="usuario" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usuario" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Usuário
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="integracao" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Integração
          </TabsTrigger>
        </TabsList>

        {/* Configurações de Usuário */}
        <TabsContent value="usuario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Perfil do Usuário
              </CardTitle>
              <CardDescription>
                Configure suas informações pessoais e preferências
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={settings.nome}
                    onChange={(e) => handleSettingChange('nome', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={settings.cargo}
                  onChange={(e) => handleSettingChange('cargo', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tema">Tema</Label>
                  <Select value={settings.tema} onValueChange={(value) => handleSettingChange('tema', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="idioma">Idioma</Label>
                  <Select value={settings.idioma} onValueChange={(value) => handleSettingChange('idioma', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Notificações */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Canais de Notificação
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações por E-mail</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações via e-mail</p>
                    </div>
                    <Button
                      variant={settings.emailNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                    >
                      {settings.emailNotifications ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações no navegador</p>
                    </div>
                    <Button
                      variant={settings.pushNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
                    >
                      {settings.pushNotifications ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações SMS</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações via SMS</p>
                    </div>
                    <Button
                      variant={settings.smsNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSettingChange('smsNotifications', !settings.smsNotifications)}
                    >
                      {settings.smsNotifications ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Tipos de Alerta</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertas de Manutenção</Label>
                      <p className="text-sm text-muted-foreground">Notificar sobre manutenções pendentes</p>
                    </div>
                    <Button
                      variant={settings.alertasManutencao ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSettingChange('alertasManutencao', !settings.alertasManutencao)}
                    >
                      {settings.alertasManutencao ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertas de Vencimento</Label>
                      <p className="text-sm text-muted-foreground">Notificar sobre documentos vencendo</p>
                    </div>
                    <Button
                      variant={settings.alertasVencimento ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSettingChange('alertasVencimento', !settings.alertasVencimento)}
                    >
                      {settings.alertasVencimento ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações do Sistema */}
        <TabsContent value="sistema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Configure parâmetros de segurança e backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Backup e Segurança
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">Realizar backup automático dos dados</p>
                    </div>
                    <Button
                      variant={settings.backupAutomatico ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSettingChange('backupAutomatico', !settings.backupAutomatico)}
                    >
                      {settings.backupAutomatico ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequenciaBackup">Frequência do Backup</Label>
                      <Select value={settings.frequenciaBackup} onValueChange={(value) => handleSettingChange('frequenciaBackup', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diario">Diário</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="retencaoLogs">Retenção de Logs (dias)</Label>
                      <Input
                        id="retencaoLogs"
                        type="number"
                        value={settings.retencaoLogs}
                        onChange={(e) => handleSettingChange('retencaoLogs', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Sessão e Segurança
                </h4>
                <div>
                  <Label htmlFor="timeoutSessao">Timeout da Sessão (minutos)</Label>
                  <Input
                    id="timeoutSessao"
                    type="number"
                    value={settings.timeoutSessao}
                    onChange={(e) => handleSettingChange('timeoutSessao', e.target.value)}
                    className="max-w-xs"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Tempo limite para logout automático por inatividade
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Integração */}
        <TabsContent value="integracao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Configurações de Integração
              </CardTitle>
              <CardDescription>
                Configure integrações com sistemas externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiGLPI">Token API GLPI</Label>
                <Input
                  id="apiGLPI"
                  type="password"
                  value={settings.apiGLPI}
                  onChange={(e) => handleSettingChange('apiGLPI', e.target.value)}
                  placeholder="Token de acesso à API do GLPI"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="urlServidor">URL do Servidor</Label>
                  <Input
                    id="urlServidor"
                    value={settings.urlServidor}
                    onChange={(e) => handleSettingChange('urlServidor', e.target.value)}
                    placeholder="http://localhost:3000"
                  />
                </div>
                <div>
                  <Label htmlFor="versaoAPI">Versão da API</Label>
                  <Select value={settings.versaoAPI} onValueChange={(value) => handleSettingChange('versaoAPI', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1">v1</SelectItem>
                      <SelectItem value="v2">v2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings