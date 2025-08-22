import { Router } from 'express'
import { memoryDB, getNextId, findById, updateById, deleteById } from '../database/memory'

const router = Router()

// GET /api/pops - Listar todos os POPs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query
    
    let filteredPops = [...memoryDB.pops]
    
    // Filtro por busca
    if (search) {
      const searchLower = String(search).toLowerCase()
      filteredPops = filteredPops.filter(pop => 
        pop.name.toLowerCase().includes(searchLower) ||
        pop.code.toLowerCase().includes(searchLower) ||
        (pop.address && pop.address.toLowerCase().includes(searchLower))
      )
    }
    
    // Filtro por status
    if (status) {
      filteredPops = filteredPops.filter(pop => pop.status === status)
    }
    
    // Ordenação
    filteredPops.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    
    // Paginação
    const total = filteredPops.length
    const offset = (Number(page) - 1) * Number(limit)
    const paginatedPops = filteredPops.slice(offset, offset + Number(limit))
    
    res.json({
      data: paginatedPops,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Erro ao buscar POPs:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /api/pops/:id - Buscar POP por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const pop = findById(memoryDB.pops, Number(id))
    
    if (!pop) {
      return res.status(404).json({ error: 'POP não encontrado' })
    }
    
    res.json(pop)
  } catch (error) {
    console.error('Erro ao buscar POP:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// POST /api/pops - Criar novo POP
router.post('/', async (req, res) => {
  try {
    const { name, code, address, latitude, longitude, status = 'active' } = req.body
    
    // Validações básicas
    if (!name || !code) {
      return res.status(400).json({ error: 'Nome e código são obrigatórios' })
    }
    
    // Verificar se código já existe
    const existingPop = memoryDB.pops.find(pop => pop.code === code)
    if (existingPop) {
      return res.status(409).json({ error: 'Código do POP já existe' })
    }
    
    const newPop: POP = {
      id: getNextId(),
      name,
      code,
      address,
      latitude,
      longitude,
      status,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    memoryDB.pops.push(newPop)
    
    res.status(201).json(newPop)
  } catch (error) {
    console.error('Erro ao criar POP:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// PUT /api/pops/:id - Atualizar POP
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, code, address, latitude, longitude, status } = req.body
    
    // Verificar se código já existe em outro POP
    const existingPop = memoryDB.pops.find(pop => pop.code === code && pop.id !== Number(id))
    if (existingPop) {
      return res.status(409).json({ error: 'Código do POP já existe' })
    }
    
    const updatedPop = updateById(memoryDB.pops, Number(id), {
      name,
      code,
      address,
      latitude,
      longitude,
      status
    })
    
    if (!updatedPop) {
      return res.status(404).json({ error: 'POP não encontrado' })
    }
    
    res.json(updatedPop)
  } catch (error) {
    console.error('Erro ao atualizar POP:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// DELETE /api/pops/:id - Deletar POP
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const popId = Number(id)
    
    // Verificar se há dependências (geradores, técnicos, etc.)
    const hasGenerators = memoryDB.generators.some(gen => gen.pop_id === popId)
    const hasTechnicians = memoryDB.technicians.some(tech => tech.pop_id === popId)
    
    if (hasGenerators || hasTechnicians) {
      return res.status(409).json({ 
        error: 'Não é possível deletar POP com geradores ou técnicos associados' 
      })
    }
    
    const deleted = deleteById(memoryDB.pops, popId)
    
    if (!deleted) {
      return res.status(404).json({ error: 'POP não encontrado' })
    }
    
    res.json({ message: 'POP deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar POP:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router