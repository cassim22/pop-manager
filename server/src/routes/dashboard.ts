import { Router } from 'express'
import { memoryDB } from '../database/memory'

const router = Router()

// GET /api/dashboard/stats - Estatísticas gerais do dashboard
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalPops: memoryDB.pops.length,
      activePops: memoryDB.pops.filter(pop => pop.status === 'operacional').length,
      totalTechnicians: memoryDB.technicians.length,
      activeTechnicians: memoryDB.technicians.filter(tech => tech.status === 'ativo').length,
      totalGenerators: memoryDB.generators.length,
      activeGenerators: memoryDB.generators.filter(gen => gen.status === 'ativo').length,
      totalActivities: memoryDB.activities.length,
      pendingActivities: memoryDB.activities.filter(act => act.status === 'pendente').length,
      completedActivities: memoryDB.activities.filter(act => act.status === 'concluida').length,
      criticalPops: memoryDB.pops.filter(pop => pop.status === 'critico').length,
      maintenancePops: memoryDB.pops.filter(pop => pop.status === 'manutencao').length
    }
    
    res.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /api/dashboard/alerts - Alertas do sistema
router.get('/alerts', (req, res) => {
  try {
    const alerts = []
    
    // Alertas de POPs críticos
    const criticalPops = memoryDB.pops.filter(pop => pop.status === 'critico')
    criticalPops.forEach(pop => {
      alerts.push({
        id: `critical-pop-${pop.id}`,
        type: 'critical',
        title: 'POP em Estado Crítico',
        message: `POP ${pop.nome} está em estado crítico`,
        timestamp: new Date().toISOString(),
        data: { popId: pop.id, popName: pop.nome }
      })
    })
    
    // Alertas de geradores com problemas
    const problematicGenerators = memoryDB.generators.filter(gen => 
      gen.status === 'manutencao' || gen.status === 'inativo'
    )
    problematicGenerators.forEach(gen => {
      alerts.push({
        id: `generator-issue-${gen.id}`,
        type: gen.status === 'inativo' ? 'critical' : 'warning',
        title: 'Problema no Gerador',
        message: `Gerador ${gen.modelo} está ${gen.status}`,
        timestamp: new Date().toISOString(),
        data: { generatorId: gen.id, generatorModel: gen.modelo }
      })
    })
    
    // Alertas de atividades pendentes há muito tempo
    const oldPendingActivities = memoryDB.activities.filter(act => {
      if (act.status !== 'pendente') return false
      const activityDate = new Date(act.data_inicio)
      const daysDiff = (Date.now() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff > 7 // Atividades pendentes há mais de 7 dias
    })
    
    oldPendingActivities.forEach(act => {
      alerts.push({
        id: `old-activity-${act.id}`,
        type: 'warning',
        title: 'Atividade Pendente',
        message: `Atividade "${act.descricao}" está pendente há mais de 7 dias`,
        timestamp: new Date().toISOString(),
        data: { activityId: act.id, description: act.descricao }
      })
    })
    
    // Ordenar por criticidade e data
    alerts.sort((a, b) => {
      const typeOrder = { critical: 0, warning: 1, info: 2 }
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type]
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
    
    res.json(alerts.slice(0, 10)) // Retornar apenas os 10 mais importantes
  } catch (error) {
    console.error('Erro ao buscar alertas:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /api/dashboard/smart-actions - Ações inteligentes sugeridas
router.get('/smart-actions', (req, res) => {
  try {
    const actions = []
    
    // Sugerir manutenções preventivas
    const popsNeedingMaintenance = memoryDB.pops.filter(pop => {
      // Lógica simples: POPs que não tiveram manutenção recente
      return pop.status === 'operacional' && Math.random() > 0.7 // Simulação
    })
    
    if (popsNeedingMaintenance.length > 0) {
      actions.push({
        id: 'preventive-maintenance',
        type: 'maintenance',
        title: 'Manutenção Preventiva',
        description: `${popsNeedingMaintenance.length} POPs podem precisar de manutenção preventiva`,
        priority: 'medium',
        estimatedTime: '2-4 horas',
        data: { pops: popsNeedingMaintenance.map(p => p.id) }
      })
    }
    
    // Sugerir otimização de rotas
    const pendingActivities = memoryDB.activities.filter(act => act.status === 'pendente')
    if (pendingActivities.length > 3) {
      actions.push({
        id: 'optimize-routes',
        type: 'optimization',
        title: 'Otimizar Rotas',
        description: `Otimizar rotas para ${pendingActivities.length} atividades pendentes`,
        priority: 'low',
        estimatedTime: '30 minutos',
        data: { activities: pendingActivities.map(a => a.id) }
      })
    }
    
    // Sugerir verificação de geradores
    const inactiveGenerators = memoryDB.generators.filter(gen => gen.status === 'inativo')
    if (inactiveGenerators.length > 0) {
      actions.push({
        id: 'check-generators',
        type: 'inspection',
        title: 'Verificar Geradores',
        description: `${inactiveGenerators.length} geradores precisam de verificação`,
        priority: 'high',
        estimatedTime: '1-2 horas',
        data: { generators: inactiveGenerators.map(g => g.id) }
      })
    }
    
    res.json(actions)
  } catch (error) {
    console.error('Erro ao buscar ações inteligentes:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /api/dashboard/recent-activities - Atividades recentes
router.get('/recent-activities', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8
    
    const recentActivities = memoryDB.activities
      .sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime())
      .slice(0, limit)
      .map(activity => ({
        id: activity.id,
        descricao: activity.descricao,
        status: activity.status,
        data_inicio: activity.data_inicio,
        data_fim: activity.data_fim,
        tecnico_id: activity.tecnico_id,
        pop_id: activity.pop_id,
        tipo: activity.tipo
      }))
    
    res.json(recentActivities)
  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /api/dashboard/upcoming-maintenances - Próximas manutenções
router.get('/upcoming-maintenances', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5
    
    // Simular próximas manutenções baseadas em atividades de manutenção
    const maintenanceActivities = memoryDB.activities
      .filter(act => act.tipo === 'manutencao' && act.status === 'pendente')
      .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
      .slice(0, limit)
      .map(activity => ({
        id: activity.id,
        descricao: activity.descricao,
        data_prevista: activity.data_inicio,
        pop_id: activity.pop_id,
        tecnico_id: activity.tecnico_id,
        prioridade: activity.prioridade || 'media'
      }))
    
    res.json(maintenanceActivities)
  } catch (error) {
    console.error('Erro ao buscar próximas manutenções:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /api/dashboard/capacity-metrics - Métricas de capacidade
router.get('/capacity-metrics', (req, res) => {
  try {
    const metrics = {
      networkCapacity: {
        total: memoryDB.pops.reduce((sum, pop) => sum + (pop.quantidade_clientes || 0), 0),
        used: memoryDB.pops.reduce((sum, pop) => sum + Math.floor((pop.quantidade_clientes || 0) * 0.8), 0),
        available: memoryDB.pops.reduce((sum, pop) => sum + Math.floor((pop.quantidade_clientes || 0) * 0.2), 0)
      },
      generatorCapacity: {
        total: memoryDB.generators.length,
        active: memoryDB.generators.filter(gen => gen.status === 'ativo').length,
        maintenance: memoryDB.generators.filter(gen => gen.status === 'manutencao').length,
        inactive: memoryDB.generators.filter(gen => gen.status === 'inativo').length
      },
      technicianCapacity: {
        total: memoryDB.technicians.length,
        available: memoryDB.technicians.filter(tech => tech.status === 'ativo').length,
        busy: memoryDB.activities.filter(act => act.status === 'em_andamento').length,
        offline: memoryDB.technicians.filter(tech => tech.status === 'inativo').length
      }
    }
    
    res.json(metrics)
  } catch (error) {
    console.error('Erro ao buscar métricas de capacidade:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router