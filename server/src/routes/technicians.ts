import { Router, Request, Response } from 'express'
import { memoryDB } from '../database/memory'

interface RequestWithDB extends Request {
  memoryDB: typeof memoryDB
}

const router = Router()

// GET /api/technicians - Listar técnicos com filtros e paginação
router.get('/', async (req: RequestWithDB, res: Response) => {
  try {
    const {
      search,
      status,
      pop_id,
      page = '1',
      limit = '10'
    } = req.query

    let filteredTechnicians = [...req.memoryDB.technicians]

    // Aplicar filtros
    if (search) {
      const searchLower = (search as string).toLowerCase()
      filteredTechnicians = filteredTechnicians.filter(tech =>
        tech.name.toLowerCase().includes(searchLower) ||
        tech.email.toLowerCase().includes(searchLower) ||
        tech.phone.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      filteredTechnicians = filteredTechnicians.filter(tech => tech.status === status)
    }

    if (pop_id) {
      filteredTechnicians = filteredTechnicians.filter(tech => tech.pop_id === parseInt(pop_id as string))
    }

    const total = filteredTechnicians.length
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    // Aplicar paginação
    const paginatedTechnicians = filteredTechnicians.slice(offset, offset + limitNum)

    // Adicionar informações do POP
    const techniciansWithPOP = paginatedTechnicians.map(tech => {
      const pop = req.memoryDB.pops.find(p => p.id === tech.pop_id)
      return {
        ...tech,
        pop_name: pop?.name || null,
        pop_code: pop?.code || null
      }
    })
    
    res.json({
      data: techniciansWithPOP,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar técnicos:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /api/technicians/:id - Buscar técnico por ID
router.get('/:id', async (req: RequestWithDB, res: Response) => {
  try {
    const { id } = req.params;
    
    const technician = req.memoryDB.technicians.find(t => t.id === parseInt(id));
    
    if (!technician) {
      return res.status(404).json({ error: 'Técnico não encontrado' });
    }
    
    // Adicionar informações do POP
    const pop = req.memoryDB.pops.find(p => p.id === technician.pop_id);
    const technicianWithPOP = {
      ...technician,
      pop_name: pop?.name || null,
      pop_code: pop?.code || null
    };
    
    res.json({ data: technicianWithPOP });
  } catch (error) {
    console.error('Erro ao buscar técnico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
})

// POST /api/technicians - Criar novo técnico
router.post('/', async (req: RequestWithDB, res: Response) => {
  try {
    const { name, email, phone, specialization, pop_id, status = 'active' } = req.body;
    
    // Validações básicas
    if (!name || !email || !phone || !specialization || !pop_id) {
      return res.status(400).json({ error: 'Campos obrigatórios: name, email, phone, specialization, pop_id' });
    }
    
    // Verificar se o POP existe
    const popExists = req.memoryDB.pops.find(p => p.id === pop_id);
    if (!popExists) {
      return res.status(400).json({ error: 'POP não encontrado' });
    }
    
    // Verificar se o email já existe
    const emailExists = req.memoryDB.technicians.find(t => t.email === email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }
    
    const newTechnician: Technician = {
      id: Math.max(...req.memoryDB.technicians.map(t => t.id), 0) + 1,
      name,
      email,
      phone,
      specialization,
      pop_id,
      status,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    req.memoryDB.technicians.push(newTechnician);
    
    res.status(201).json({ data: newTechnician });
  } catch (error) {
    console.error('Erro ao criar técnico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
})

// PUT /api/technicians/:id - Atualizar técnico
router.put('/:id', async (req: RequestWithDB, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization, pop_id, status } = req.body;
    
    const technicianIndex = req.memoryDB.technicians.findIndex(t => t.id === parseInt(id));
    if (technicianIndex === -1) {
      return res.status(404).json({ error: 'Técnico não encontrado' });
    }
    
    // Verificar se o POP existe (se fornecido)
    if (pop_id) {
      const popExists = req.memoryDB.pops.find(p => p.id === pop_id);
      if (!popExists) {
        return res.status(400).json({ error: 'POP não encontrado' });
      }
    }
    
    // Verificar se o email já existe (exceto para o próprio técnico)
    if (email) {
      const emailExists = req.memoryDB.technicians.find(t => t.email === email && t.id !== parseInt(id));
      if (emailExists) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
    }
    
    // Atualizar técnico
    const updatedTechnician = {
      ...req.memoryDB.technicians[technicianIndex],
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(specialization && { specialization }),
      ...(pop_id && { pop_id }),
      ...(status && { status }),
      updated_at: new Date()
    };
    
    req.memoryDB.technicians[technicianIndex] = updatedTechnician;
    
    res.json({ data: updatedTechnician });
  } catch (error) {
    console.error('Erro ao atualizar técnico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
})

// DELETE /api/technicians/:id - Deletar técnico
router.delete('/:id', async (req: RequestWithDB, res: Response) => {
  try {
    const { id } = req.params;
    
    const technicianIndex = req.memoryDB.technicians.findIndex(t => t.id === parseInt(id));
    if (technicianIndex === -1) {
      return res.status(404).json({ error: 'Técnico não encontrado' });
    }
    
    // Verificar se existem atividades associadas ao técnico
    const hasActivities = req.memoryDB.activities.some(a => a.technician_id === parseInt(id));
    if (hasActivities) {
      return res.status(400).json({ error: 'Não é possível deletar técnico com atividades associadas' });
    }
    
    const deletedTechnician = req.memoryDB.technicians[technicianIndex];
    req.memoryDB.technicians.splice(technicianIndex, 1);
    
    res.json({ message: 'Técnico deletado com sucesso', data: deletedTechnician });
  } catch (error) {
    console.error('Erro ao deletar técnico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
})

// GET /api/technicians/:id/activities - Buscar atividades do técnico
router.get('/:id/activities', async (req: RequestWithDB, res: Response) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10', status } = req.query;
    
    // Verificar se o técnico existe
    const technicianExists = req.memoryDB.technicians.find(t => t.id === parseInt(id));
    if (!technicianExists) {
      return res.status(404).json({ error: 'Técnico não encontrado' });
    }
    
    let filteredActivities = req.memoryDB.activities.filter(a => a.technician_id === parseInt(id));
    
    // Aplicar filtro de status se fornecido
    if (status) {
      filteredActivities = filteredActivities.filter(a => a.status === status);
    }
    
    const total = filteredActivities.length;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    // Aplicar paginação
    const paginatedActivities = filteredActivities.slice(offset, offset + limitNum);
    
    // Adicionar informações relacionadas
    const activitiesWithDetails = paginatedActivities.map(activity => {
      const pop = req.memoryDB.pops.find(p => p.id === activity.pop_id);
      const generator = req.memoryDB.generators.find(g => g.id === activity.generator_id);
      return {
        ...activity,
        pop_name: pop?.name || null,
        pop_code: pop?.code || null,
        generator_name: generator?.name || null
      };
    });
    
    res.json({
      data: techniciansWithPOP,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar atividades do técnico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
})

export default router