import { Router, Request, Response } from 'express';
import { memoryDB, getNextId, findById, updateById, deleteById } from '../database/memory';

const router = Router();

// GET /api/maintenance - Listar todas as manutenções
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, tipo_ativo, ativo_id, tecnico_id } = req.query;
    let maintenances = memoryDB.manutencoes;

    // Filtros
    if (status) {
      maintenances = maintenances.filter(m => m.status === status);
    }
    if (tipo_ativo) {
      maintenances = maintenances.filter(m => m.tipo_ativo === tipo_ativo);
    }
    if (ativo_id) {
      maintenances = maintenances.filter(m => m.ativo_id === parseInt(ativo_id as string));
    }
    if (tecnico_id) {
      maintenances = maintenances.filter(m => m.tecnico_responsavel_id === parseInt(tecnico_id as string));
    }

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

// GET /api/maintenance/:id - Buscar manutenção por ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const maintenance = memoryDB.manutencoes.find(m => m.id === id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Manutenção não encontrada'
      });
    }

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/maintenance - Criar nova manutenção
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      titulo,
      tipo_ativo,
      ativo_id,
      ativo_nome,
      status,
      data_agendada,
      data_conclusao,
      frequencia,
      checklist,
      observacoes,
      tecnico_responsavel_id,
      fotos_gerais_url,
      atividade_relacionada_id
    } = req.body;

    // Validações básicas
    if (!titulo || !tipo_ativo || !ativo_id || !tecnico_responsavel_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: titulo, tipo_ativo, ativo_id, tecnico_responsavel_id'
      });
    }

    const newMaintenance = {
      id: Math.max(...memoryDB.manutencoes.map(m => m.id), 0) + 1,
      titulo,
      tipo_ativo,
      ativo_id,
      ativo_nome: ativo_nome || '',
      status: status || 'agendada',
      data_agendada: data_agendada ? new Date(data_agendada) : new Date(),
      data_conclusao: data_conclusao ? new Date(data_conclusao) : undefined,
      frequencia: frequencia || 'unica',
      checklist: checklist || [],
      observacoes: observacoes || '',
      tecnico_responsavel_id,
      fotos_gerais_url: fotos_gerais_url || [],
      atividade_relacionada_id: atividade_relacionada_id || undefined,
      created_at: new Date(),
      updated_at: new Date()
    };

    memoryDB.manutencoes.push(newMaintenance);

    res.status(201).json({
      success: true,
      message: 'Manutenção criada com sucesso',
      data: newMaintenance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// PUT /api/maintenance/:id - Atualizar manutenção
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const maintenanceIndex = memoryDB.manutencoes.findIndex(m => m.id === id);

    if (maintenanceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Manutenção não encontrada'
      });
    }

    const updatedMaintenance = {
      ...memoryDB.manutencoes[maintenanceIndex],
      ...req.body,
      id, // Manter o ID original
      updated_at: new Date()
    };

    memoryDB.manutencoes[maintenanceIndex] = updatedMaintenance;

    res.json({
      success: true,
      message: 'Manutenção atualizada com sucesso',
      data: updatedMaintenance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// DELETE /api/maintenance/:id - Deletar manutenção
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const maintenanceIndex = memoryDB.manutencoes.findIndex(m => m.id === id);

    if (maintenanceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Manutenção não encontrada'
      });
    }

    const deletedMaintenance = memoryDB.manutencoes.splice(maintenanceIndex, 1)[0];

    res.json({
      success: true,
      message: 'Manutenção deletada com sucesso',
      data: deletedMaintenance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// PUT /api/maintenance/:id/checklist - Atualizar checklist da manutenção
router.put('/:id/checklist', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { checklist } = req.body;
    const maintenanceIndex = memoryDB.manutencoes.findIndex(m => m.id === id);

    if (maintenanceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Manutenção não encontrada'
      });
    }

    if (!checklist || !Array.isArray(checklist)) {
      return res.status(400).json({
        success: false,
        message: 'Checklist deve ser um array válido'
      });
    }

    memoryDB.manutencoes[maintenanceIndex].checklist = checklist;
    memoryDB.manutencoes[maintenanceIndex].updated_at = new Date();

    res.json({
      success: true,
      message: 'Checklist atualizado com sucesso',
      data: memoryDB.manutencoes[maintenanceIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/maintenance/:id/complete - Finalizar manutenção
router.post('/:id/complete', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { observacoes_finais, fotos_finais } = req.body;
    const maintenanceIndex = memoryDB.manutencoes.findIndex(m => m.id === id);

    if (maintenanceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Manutenção não encontrada'
      });
    }

    const maintenance = memoryDB.manutencoes[maintenanceIndex];

    if (maintenance.status === 'concluida') {
      return res.status(400).json({
        success: false,
        message: 'Manutenção já foi concluída'
      });
    }

    // Atualizar status e dados de conclusão
    memoryDB.manutencoes[maintenanceIndex] = {
      ...maintenance,
      status: 'concluida',
      data_conclusao: new Date(),
      observacoes: observacoes_finais || maintenance.observacoes,
      fotos_gerais_url: [...(maintenance.fotos_gerais_url || []), ...(fotos_finais || [])],
      updated_at: new Date()
    };

    res.json({
      success: true,
      message: 'Manutenção finalizada com sucesso',
      data: memoryDB.manutencoes[maintenanceIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/maintenance/schedule - Cronograma de manutenções
router.get('/schedule/upcoming', (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const daysAhead = parseInt(days as string);
    const today = new Date();
    const futureDate = new Date(today.getTime() + (daysAhead * 24 * 60 * 60 * 1000));

    const upcomingMaintenances = memoryDB.manutencoes.filter(m => {
      const scheduledDate = new Date(m.data_agendada);
      return scheduledDate >= today && scheduledDate <= futureDate && m.status !== 'concluida';
    }).sort((a, b) => new Date(a.data_agendada).getTime() - new Date(b.data_agendada).getTime());

    res.json({
      success: true,
      data: upcomingMaintenances,
      total: upcomingMaintenances.length,
      period: {
        from: today,
        to: futureDate,
        days: daysAhead
      }
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