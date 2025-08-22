import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { memoryDB } from './database/memory'

// Carregar variáveis de ambiente
dotenv.config()

// Criar aplicação Express
const app = express()
const PORT = process.env.PORT || 3001

// Middlewares de segurança
app.use(helmet())
app.use(compression())

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // máximo 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente em alguns minutos.'
})
app.use('/api/', limiter)

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Middleware para adicionar banco em memória ao request
app.use((req, res, next) => {
  (req as any).memoryDB = memoryDB
  next()
})

// Importar rotas
import popsRoutes from './routes/pops'
import techniciansRoutes from './routes/technicians'
import activitiesRoutes from './routes/activities'
import generatorsRoutes from './routes/generators'
import maintenanceRoutes from './routes/maintenance'
import checklistsRoutes from './routes/checklists'
import suppliesRoutes from './routes/supplies'
import usersRoutes from './routes/users'
import dashboardRoutes from './routes/dashboard'

// Rotas de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// Registrar rotas da API
app.use('/api/pops', popsRoutes)
app.use('/api/technicians', techniciansRoutes)
app.use('/api/activities', activitiesRoutes)
app.use('/api/generators', generatorsRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/checklists', checklistsRoutes)
app.use('/api/supplies', suppliesRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Rota de teste de conexão com banco
app.get('/api/test-db', async (req, res) => {
  try {
    const stats = {
      pops: memoryDB.pops.length,
      technicians: memoryDB.technicians.length,
      generators: memoryDB.generators.length,
      activities: memoryDB.activities.length
    }
    
    res.json({ 
      status: 'OK', 
      message: 'Banco de dados em memória funcionando',
      timestamp: new Date().toISOString(),
      stats
    })
  } catch (error) {
    console.error('Erro ao acessar banco:', error)
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Erro ao acessar banco de dados',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
})

// Importar e usar rotas da API
// TODO: Implementar rotas quando o schema estiver pronto
// import apiRoutes from './routes'
// app.use('/api', apiRoutes)

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err)
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      status: err.status || 500,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
})

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Rota não encontrada',
      status: 404,
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  })
})

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`)
  console.log(`🔗 API disponível em: http://localhost:${PORT}/api`)
  console.log(`❤️  Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...')
  
  server.close(async () => {
    console.log('📡 Servidor HTTP encerrado')
    
    console.log('🔌 Banco em memória limpo')
    
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...')
  
  server.close(async () => {
    console.log('📡 Servidor HTTP encerrado')
    
    console.log('🔌 Banco em memória limpo')
    
    process.exit(0)
  })
})

export default app