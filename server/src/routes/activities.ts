import { Router, Request, Response } from 'express'
import { memoryDB } from '../database/memory'

interface RequestWithDB extends Request {
  memoryDB: typeof memoryDB
}

const router = Router()

// GET /api/activities - Listar todas as atividades
router.get('/', async (req: RequestWithDB, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status, 
      priority, 
      assigned_to, 
      pop_id,
      type,
      date_from,
      date_to
    } = req.query
    
    let filteredActivities = [...req.memoryDB.activities]
    
    // Filtro por busca
    if (search) {
      const searchLower = (search as string).toLowerCase()
      filteredActivities = filteredActivities.filter(activity =>
        activity.title.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower)
      )
    }
    
    // Filtro por status
    if (status) {
      filteredActivities = filteredActivities.filter(activity => activity.status === status)
    }
    
    // Filtro por prioridade
    if (priority) {
      filteredActivities = filteredActivities.filter(activity => activity.priority === priority)
    }
    
    // Filtro por técnico
    if (assigned_to) {
      filteredActivities = filteredActivities.filter(activity => activity.assigned_to === Number(assigned_to))
    }
    
    // Filtro por POP
    if (pop_id) {
      filteredActivities = filteredActivities.filter(activity => activity.pop_id === Number(pop_id))
    }
    
    // Filtro por tipo
    if (type) {
      filteredActivities = filteredActivities.filter(activity => activity.type === type)
    }
    
    // Filtro por data
    if (date_from) {
      const fromDate = new Date(date_from as string)
      filteredActivities = filteredActivities.filter(activity => new Date(activity.scheduled_date) >= fromDate)
    }
    
    if (date_to) {
      const toDate = new Date(date_to as string)
      filteredActivities = filteredActivities.filter(activity => new Date(activity.scheduled_date) <= toDate)
    }
    
    const total = filteredActivities.length
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const offset = (pageNum - 1) * limitNum
    
    // Ordenação e paginação
    filteredActivities.sort((a, b) => {
      const dateA = new Date(a.scheduled_date).getTime()
      const dateB = new Date(b.scheduled_date).getTime()
      if (dateA !== dateB) return dateB - dateA
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    const paginatedActivities = filteredActivities.slice(offset, offset + limitNum)
    
    // Adicionar informações relacionadas
    const activitiesWithDetails = paginatedActivities.map(activity => {
      const technician = req.memoryDB.technicians.find(t => t.id === activity.assigned_to)
      const pop = req.memoryDB.pops.find(p => p.id === activity.pop_id)
      const generator = req.memoryDB.generators.find(g => g.id === activity.generator_id)
      return {
        ...activity,
        technician_name: technician?.name || null,
        pop_name: pop?.name || null,
        pop_code: pop?.code || null,
        generator_name: generator?.name || null,
        generator_model: generator?.model || null
      }
    })
    
    res.json({
      data: activitiesWithDetails,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /api/activities/:id - Buscar atividade por ID
router.get('/:id', async (req: RequestWithDB, res: Response) => {
  try {
    const { id } = req.params
    
    const activity = req.memoryDB.activities.find(a => a.id === Number(id))
    
    if (!activity) {
      return res.status(404).json({ error: 'Atividade não encontrada' })
    }
    
    // Adicionar informações relacionadas
    const technician = req.memoryDB.technicians.find(t => t.id === activity.assigned_to)
    const pop = req.memoryDB.pops.find(p => p.id === activity.pop_id)
    const generator = req.memoryDB.generators.find(g => g.id === activity.generator_id)
    
    const activityWithDetails = {
      ...activity,
      technician_name: technician?.name || null,
      technician_email: technician?.email || null,
      pop_name: pop?.name || null,
      pop_code: pop?.code || null,
      generator_name: generator?.name || null,
      generator_model: generator?.model || null
    }
    
    res.json(activityWithDetails)
  } catch (error) {
    console.error('Erro ao buscar atividade:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// POST /api/activities - Criar nova atividade
router.post('/', async (req: RequestWithDB, res: Response) => {
  try {
    const { 
      title, 
      description, 
      type, 
      status = 'pending', 
      priority = 'medium', 
      assigned_to, 
      pop_id, 
      generator_id, 
      scheduled_date 
    } = req.body
    
    // Validações básicas
    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' })
    }
    
    // Verificar se técnico existe (se fornecido)
    if (assigned_to) {
      const techExists = req.memoryDB.technicians.find(t => t.id === assigned_to)
      if (!techExists) {
        return res.status(400).json({ error: 'Técnico não encontrado' })
      }
    }
    
    // Verificar se POP existe (se fornecido)
    if (pop_id) {
      const popExists = req.memoryDB.pops.find(p => p.id === pop_id)
      if (!popExists) {
        return res.status(400).json({ error: 'POP não encontrado' })
      }
    }
    
    // Verificar se gerador existe (se fornecido)
    if (generator_id) {
      const genExists = req.memoryDB.generators.find(g => g.id === generator_id)
      if (!genExists) {
        return res.status(400).json({ error: 'Gerador não encontrado' })
      }
    }
    
    const newActivity: Activity = {
      id: Math.max(...req.memoryDB.activities.map(a => a.id), 0) + 1,
      title,
      description,
      type,
      status,
      priority,
      assigned_to,
      pop_id,
      generator_id,
      scheduled_date,
      completed_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    req.memoryDB.activities.push(newActivity)
    
    res.status(201).json(newActivity)
  } catch (error) {
    console.error('Erro ao criar atividade:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// PUT /api/activities/:id - Atualizar atividade
router.put('/:id', async (req: RequestWithDB, res: Response) => {
  try {
    const { id } = req.params
    const { 
      title, 
      description, 
      type, 
      status, 
      priority, 
      assigned_to, 
      pop_id, 
      generator_id, 
      scheduled_date,
      completed_date
    } = req.body
    
    // Verificar se atividade existe
    const activityIndex = req.memoryDB.activities.findIndex(a => a.id === Number(id))
    if (activityIndex === -1) {
      return res.status(404).json({ error: 'Atividade não encontrada' })
    }
    
    // Verificações de existência (similar ao POST)
    if (assigned_to) {
      const techExists = req.memoryDB.technicians.find(t => t.id === assigned_to)
      if (!techExists) {
        return res.status(400).json({ error: 'Técnico não encontrado' })
      }
    }
    
    if (pop_id) {
      const popExists = req.memoryDB.pops.find(p => p.id === pop_id)
      if (!popExists) {
        return res.status(400).json({ error: 'POP não encontrado' })
      }
    }
    
    if (generator_id) {
      const genExists = req.memoryDB.generators.find(g => g.id === generator_id)
      if (!genExists) {
        return res.status(400).json({ error: 'Gerador não encontrado' })
      }
    }
    
    const updatedActivity = {
      ...req.memoryDB.activities[activityIndex],
      title,
      description,
      type,
      status,
      priority,
      assigned_to,
      pop_id,
      generator_id,
      scheduled_date,
      completed_date,
      updated_at: new Date().toISOString()
    }
    
    req.memoryDB.activities[activityIndex] = updatedActivity
    
    res.json(updatedActivity)
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// DELETE /api/activities/:id - Deletar atividade
router.delete('/:id', async (req: RequestWithDB, res: Response) => {
  try {
    const { id } = req.params
    
    const activityIndex = req.memoryDB.activities.findIndex(a => a.id === Number(id))
    
    if (activityIndex === -1) {
      return res.status(404).json({ error: 'Atividade não encontrada' })
    }
    
    req.memoryDB.activities.splice(activityIndex, 1)
    
    res.json({ message: 'Atividade deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar atividade:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// PATCH /api/activities/:id/status - Atualizar apenas o status da atividade
router.patch('/:id/status', async (req: RequestWithDB, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' })
    }
    
    const activityIndex = req.memoryDB.activities.findIndex(a => a.id === Number(id))
    
    if (activityIndex === -1) {
      return res.status(404).json({ error: 'Atividade não encontrada' })
    }
    
    // Se status for 'completed', definir completed_date
    const completedDate = status === 'completed' ? new Date().toISOString() : null
    
    const updatedActivity = {
      ...req.memoryDB.activities[activityIndex],
      status,
      completed_date: completedDate,
      updated_at: new Date().toISOString()
    }
    
    req.memoryDB.activities[activityIndex] = updatedActivity
    
    res.json(updatedActivity)
  } catch (error) {
    console.error('Erro ao atualizar status da atividade:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router