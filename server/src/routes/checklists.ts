import { Router, Request, Response } from 'express';
import { memoryDB, getNextId, findById, updateById, deleteById } from '../database/memory';

const router = Router();

// GET /api/checklists - Listar todos os templates de checklist
router.get('/', (req: Request, res: Response) => {
  try {
    const { ativo } = req.query;
    let templates = memoryDB.checklistTemplates;

    // Filtro por status ativo
    if (ativo !== undefined) {
      const isActive = ativo === 'true';
      templates = templates.filter(t => !!t.ativo === isActive);
    }

    res.json({
      success: true,
      data: templates,
      total: templates.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/checklists/:id - Buscar template por ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const template = memoryDB.checklistTemplates.find(t => t.id === id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template de checklist não encontrado'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/checklists - Criar novo template de checklist
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      nome,
      descricao,
      itens
    } = req.body;

    // Validações básicas
    if (!nome || !itens || !Array.isArray(itens)) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome, itens (array)'
      });
    }

    // Validar estrutura dos itens
    for (const item of itens) {
      if (!item.id || !item.tipo || !item.titulo) {
        return res.status(400).json({
          success: false,
          message: 'Cada item deve ter: id, tipo, titulo'
        });
      }
    }

    const newTemplate = {
      id: Math.max(...memoryDB.checklistTemplates.map(t => t.id), 0) + 1,
      nome,
      descricao: descricao || '',
      itens,
      created_at: new Date(),
      updated_at: new Date()
    };

    memoryDB.checklistTemplates.push(newTemplate);

    res.status(201).json({
      success: true,
      message: 'Template de checklist criado com sucesso',
      data: newTemplate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// PUT /api/checklists/:id - Atualizar template de checklist
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const templateIndex = memoryDB.checklistTemplates.findIndex(t => t.id === id);

    if (templateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Template de checklist não encontrado'
      });
    }

    // Validar itens se fornecidos
    if (req.body.itens && Array.isArray(req.body.itens)) {
      for (const item of req.body.itens) {
        if (!item.id || !item.tipo || !item.titulo) {
          return res.status(400).json({
            success: false,
            message: 'Cada item deve ter: id, tipo, titulo'
          });
        }
      }
    }

    const updatedTemplate = {
      ...memoryDB.checklistTemplates[templateIndex],
      ...req.body,
      id, // Manter o ID original
      updated_at: new Date()
    };

    memoryDB.checklistTemplates[templateIndex] = updatedTemplate;

    res.json({
      success: true,
      message: 'Template de checklist atualizado com sucesso',
      data: updatedTemplate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// DELETE /api/checklists/:id - Deletar template de checklist
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const templateIndex = memoryDB.checklistTemplates.findIndex(t => t.id === id);

    if (templateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Template de checklist não encontrado'
      });
    }

    // Verificar se o template está sendo usado em alguma manutenção
    const isInUse = memoryDB.manutencoes.some(m => 
      m.checklist && m.checklist.some((item: any) => 
        memoryDB.checklistTemplates[templateIndex].itens.some(templateItem => templateItem.id === item.id)
      )
    );

    if (isInUse) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar template que está sendo usado em manutenções'
      });
    }

    const deletedTemplate = memoryDB.checklistTemplates.splice(templateIndex, 1)[0];

    res.json({
      success: true,
      message: 'Template de checklist deletado com sucesso',
      data: deletedTemplate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/checklists/:id/duplicate - Duplicar template
router.post('/:id/duplicate', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const template = memoryDB.checklistTemplates.find(t => t.id === id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template de checklist não encontrado'
      });
    }

    const { nome } = req.body;
    const newName = nome || `${template.nome} (Cópia)`;

    const duplicatedTemplate = {
      id: Math.max(...memoryDB.checklistTemplates.map(t => t.id), 0) + 1,
      nome: newName,
      descricao: template.descricao,
      itens: template.itens.map(item => ({
        ...item,
        id: `${item.id}_copy_${Date.now()}`
      })),
      created_at: new Date(),
      updated_at: new Date()
    };

    memoryDB.checklistTemplates.push(duplicatedTemplate);

    res.status(201).json({
      success: true,
      message: 'Template duplicado com sucesso',
      data: duplicatedTemplate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/checklists/:id/usage - Verificar uso do template
router.get('/:id/usage', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const template = memoryDB.checklistTemplates.find(t => t.id === id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template de checklist não encontrado'
      });
    }

    // Buscar manutenções que usam este template
    const usedInMaintenances = memoryDB.manutencoes.filter(m => 
      m.checklist && m.checklist.some((item: any) => 
        template.itens.some(templateItem => templateItem.id === item.id)
      )
    );

    res.json({
      success: true,
      data: {
        template_id: id,
        template_name: template.nome,
        usage_count: usedInMaintenances.length,
        used_in_maintenances: usedInMaintenances.map(m => ({
          id: m.id,
          titulo: m.titulo,
          status: m.status,
          data_agendada: m.data_agendada
        }))
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