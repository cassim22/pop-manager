import { Router, Request, Response } from 'express';
import { memoryDB } from '../database/memory';

const router = Router();

// GET /api/generators - Listar todos os geradores
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, pop_id, tipo } = req.query;
    let generators = memoryDB.generators;

    // Filtros
    if (status) {
      generators = generators.filter(g => g.status === status);
    }
    if (pop_id) {
      generators = generators.filter(g => g.pop_id === parseInt(pop_id as string));
    }
    if (tipo) {
      generators = generators.filter(g => g.tipo === tipo);
    }

    res.json({
      success: true,
      data: generators,
      total: generators.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/generators/:id - Buscar gerador por ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const generator = memoryDB.generators.find(g => g.id === id);

    if (!generator) {
      return res.status(404).json({
        success: false,
        message: 'Gerador não encontrado'
      });
    }

    res.json({
      success: true,
      data: generator
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/generators - Criar novo gerador
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      nome,
      modelo,
      fabricante,
      numero_serie,
      potencia_kva,
      tipo,
      combustivel,
      status,
      pop_id,
      localizacao,
      data_instalacao,
      ultima_manutencao,
      proxima_manutencao,
      horas_funcionamento,
      nivel_combustivel,
      observacoes
    } = req.body;

    // Validações básicas
    if (!nome || !modelo || !fabricante || !pop_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome, modelo, fabricante, pop_id'
      });
    }

    const newGenerator = {
      id: Math.max(...memoryDB.generators.map(g => g.id), 0) + 1,
      nome,
      modelo,
      fabricante,
      numero_serie: numero_serie || null,
      potencia_kva: potencia_kva || 0,
      tipo: tipo || 'principal',
      combustivel: combustivel || 'diesel',
      status: status || 'operacional',
      pop_id,
      localizacao: localizacao || null,
      data_instalacao: data_instalacao ? new Date(data_instalacao) : new Date(),
      ultima_manutencao: ultima_manutencao ? new Date(ultima_manutencao) : null,
      proxima_manutencao: proxima_manutencao ? new Date(proxima_manutencao) : null,
      horas_funcionamento: horas_funcionamento || 0,
      nivel_combustivel: nivel_combustivel || 0,
      observacoes: observacoes || null,
      created_at: new Date(),
      updated_at: new Date()
    };

    memoryDB.generators.push(newGenerator);

    res.status(201).json({
      success: true,
      message: 'Gerador criado com sucesso',
      data: newGenerator
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// PUT /api/generators/:id - Atualizar gerador
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const generatorIndex = memoryDB.generators.findIndex(g => g.id === id);

    if (generatorIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Gerador não encontrado'
      });
    }

    const updatedGenerator = {
      ...memoryDB.generators[generatorIndex],
      ...req.body,
      id, // Manter o ID original
      updated_at: new Date()
    };

    memoryDB.generators[generatorIndex] = updatedGenerator;

    res.json({
      success: true,
      message: 'Gerador atualizado com sucesso',
      data: updatedGenerator
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// DELETE /api/generators/:id - Deletar gerador
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const generatorIndex = memoryDB.generators.findIndex(g => g.id === id);

    if (generatorIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Gerador não encontrado'
      });
    }

    const deletedGenerator = memoryDB.generators.splice(generatorIndex, 1)[0];

    res.json({
      success: true,
      message: 'Gerador deletado com sucesso',
      data: deletedGenerator
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/generators/:id/maintenance-history - Histórico de manutenções do gerador
router.get('/:id/maintenance-history', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const generator = memoryDB.generators.find(g => g.id === id);

    if (!generator) {
      return res.status(404).json({
        success: false,
        message: 'Gerador não encontrado'
      });
    }

    // Buscar manutenções relacionadas ao gerador
    const maintenances = memoryDB.manutencoes.filter(m => 
      m.tipo_ativo === 'Gerador' && m.ativo_id === id
    );

    res.json({
      success: true,
      data: maintenances,
      total: maintenances.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/generators/:id/fuel-history - Histórico de abastecimentos do gerador
router.get('/:id/fuel-history', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const generator = memoryDB.generators.find(g => g.id === id);

    if (!generator) {
      return res.status(404).json({
        success: false,
        message: 'Gerador não encontrado'
      });
    }

    // Buscar abastecimentos relacionados ao gerador
    const fuelHistory = memoryDB.abastecimentos.filter(a => a.gerador_id === id);

    res.json({
      success: true,
      data: fuelHistory,
      total: fuelHistory.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router;