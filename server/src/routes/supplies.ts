import { Router, Request, Response } from 'express';
import { memoryDB, Abastecimento, getNextId, findById, updateById, deleteById } from '../database/memory';

const router = Router();

// GET /api/supplies - Listar todos os abastecimentos
router.get('/', (req: Request, res: Response) => {
  try {
    const { gerador_id, tecnico_id, data_inicio, data_fim, tipo_combustivel } = req.query;
    let supplies = memoryDB.abastecimentos;

    // Filtros
    if (gerador_id) {
      supplies = supplies.filter(s => s.gerador_id === parseInt(gerador_id as string));
    }
    if (tecnico_id) {
      supplies = supplies.filter(s => s.tecnico_responsavel_id === parseInt(tecnico_id as string));
    }
    if (tipo_combustivel) {
      supplies = supplies.filter(s => s.tipo_combustivel === tipo_combustivel);
    }
    if (data_inicio) {
      const startDate = new Date(data_inicio as string);
      supplies = supplies.filter(s => new Date(s.data_abastecimento) >= startDate);
    }
    if (data_fim) {
      const endDate = new Date(data_fim as string);
      supplies = supplies.filter(s => new Date(s.data_abastecimento) <= endDate);
    }

    // Ordenar por data mais recente
    supplies.sort((a, b) => new Date(b.data_abastecimento).getTime() - new Date(a.data_abastecimento).getTime());

    res.json({
      success: true,
      data: supplies,
      total: supplies.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/supplies/:id - Buscar abastecimento por ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const supply = memoryDB.abastecimentos.find(s => s.id === id);

    if (!supply) {
      return res.status(404).json({
        success: false,
        message: 'Abastecimento não encontrado'
      });
    }

    res.json({
      success: true,
      data: supply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/supplies - Criar novo abastecimento
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      gerador_id,
      gerador_nome,
      data_abastecimento,
      quantidade_litros,
      valor_total,
      valor_por_litro,
      tipo_combustivel,
      fornecedor,
      numero_nf,
      tecnico_responsavel_id,
      tecnico_responsavel_nome,
      hodometro_atual,
      nivel_tanque_antes,
      nivel_tanque_depois,
      observacoes,
      foto_nota_fiscal,
      foto_bomba
    } = req.body;

    // Validações básicas
    if (!gerador_id || !data_abastecimento || !quantidade_litros || !tecnico_responsavel_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: gerador_id, data_abastecimento, quantidade_litros, tecnico_responsavel_id'
      });
    }

    // Validar se o gerador existe
    const generator = memoryDB.generators.find(g => g.id === gerador_id);
    if (!generator) {
      return res.status(400).json({
        success: false,
        message: 'Gerador não encontrado'
      });
    }

    // Validar se o técnico existe
    const technician = memoryDB.technicians.find(t => t.id === tecnico_responsavel_id);
    if (!technician) {
      return res.status(400).json({
        success: false,
        message: 'Técnico não encontrado'
      });
    }

    const newSupply = {
      id: Math.max(...memoryDB.abastecimentos.map(s => s.id), 0) + 1,
      gerador_id,
      gerador_nome: gerador_nome || generator.nome,
      data_abastecimento: new Date(data_abastecimento),
      quantidade_litros: parseFloat(quantidade_litros),
      valor_total: valor_total ? parseFloat(valor_total) : 0,
      valor_por_litro: valor_por_litro ? parseFloat(valor_por_litro) : 0,
      tipo_combustivel: tipo_combustivel || 'diesel',
      fornecedor: fornecedor || '',
      numero_nf: numero_nf || '',
      tecnico_responsavel_id,
      tecnico_responsavel_nome: tecnico_responsavel_nome || technician.nome,
      hodometro_atual: hodometro_atual || 0,
      nivel_tanque_antes: nivel_tanque_antes || 'baixo',
      nivel_tanque_depois: nivel_tanque_depois || 'alto',
      observacoes: observacoes || '',
      foto_nota_fiscal: foto_nota_fiscal || undefined,
      foto_bomba: foto_bomba || undefined,
      created_at: new Date(),
      updated_at: new Date()
    };

    memoryDB.abastecimentos.push(newSupply);

    res.status(201).json({
      success: true,
      message: 'Abastecimento registrado com sucesso',
      data: newSupply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// PUT /api/supplies/:id - Atualizar abastecimento
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const supplyIndex = memoryDB.abastecimentos.findIndex(s => s.id === id);

    if (supplyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Abastecimento não encontrado'
      });
    }

    const updatedSupply = {
      ...memoryDB.abastecimentos[supplyIndex],
      ...req.body,
      id, // Manter o ID original
      updated_at: new Date()
    };

    memoryDB.abastecimentos[supplyIndex] = updatedSupply;

    res.json({
      success: true,
      message: 'Abastecimento atualizado com sucesso',
      data: updatedSupply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// DELETE /api/supplies/:id - Deletar abastecimento
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const supplyIndex = memoryDB.abastecimentos.findIndex(s => s.id === id);

    if (supplyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Abastecimento não encontrado'
      });
    }

    const deletedSupply = memoryDB.abastecimentos.splice(supplyIndex, 1)[0];

    res.json({
      success: true,
      message: 'Abastecimento deletado com sucesso',
      data: deletedSupply
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/supplies/analytics/summary - Resumo analítico dos abastecimentos
router.get('/analytics/summary', (req: Request, res: Response) => {
  try {
    const { periodo = '30' } = req.query;
    const days = parseInt(periodo as string);
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    const supplies = memoryDB.abastecimentos.filter(s => 
      new Date(s.data_abastecimento) >= startDate
    );

    const summary = {
      total_abastecimentos: supplies.length,
      total_litros: supplies.reduce((sum, s) => sum + s.quantidade_litros, 0),
      total_valor: supplies.reduce((sum, s) => sum + s.valor_total, 0),
      valor_medio_litro: supplies.length > 0 
        ? supplies.reduce((sum, s) => sum + s.valor_por_litro, 0) / supplies.length 
        : 0,
      geradores_abastecidos: [...new Set(supplies.map(s => s.gerador_id))].length,
      fornecedores: [...new Set(supplies.map(s => s.fornecedor))].filter(f => f),
      tipos_combustivel: [...new Set(supplies.map(s => s.tipo_combustivel))],
      periodo_analise: {
        inicio: startDate,
        fim: new Date(),
        dias: days
      }
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/supplies/analytics/by-generator - Abastecimentos por gerador
router.get('/analytics/by-generator', (req: Request, res: Response) => {
  try {
    const { periodo = '90' } = req.query;
    const days = parseInt(periodo as string);
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    const supplies = memoryDB.abastecimentos.filter(s => 
      new Date(s.data_abastecimento) >= startDate
    );

    const byGenerator = supplies.reduce((acc, supply) => {
      const generatorId = supply.gerador_id;
      if (!acc[generatorId]) {
        acc[generatorId] = {
          gerador_id: generatorId,
          gerador_nome: supply.gerador_nome,
          total_abastecimentos: 0,
          total_litros: 0,
          total_valor: 0,
          ultimo_abastecimento: null,
          media_litros_por_abastecimento: 0
        };
      }
      
      acc[generatorId].total_abastecimentos++;
      acc[generatorId].total_litros += supply.quantidade_litros;
      acc[generatorId].total_valor += supply.valor_total;
      
      if (!acc[generatorId].ultimo_abastecimento || 
          new Date(supply.data_abastecimento) > new Date(acc[generatorId].ultimo_abastecimento)) {
        acc[generatorId].ultimo_abastecimento = supply.data_abastecimento;
      }
      
      return acc;
    }, {} as any);

    // Calcular médias
    Object.values(byGenerator).forEach((gen: any) => {
      gen.media_litros_por_abastecimento = gen.total_litros / gen.total_abastecimentos;
    });

    res.json({
      success: true,
      data: Object.values(byGenerator),
      periodo: {
        inicio: startDate,
        fim: new Date(),
        dias: days
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