// Vercel Serverless Function para Abastecimentos

// Simulação do banco de dados em memória
let supplies = [
  {
    id: 1,
    pop_id: 1,
    generator_id: 1,
    fuel_type: "diesel",
    quantity: 500,
    unit: "litros",
    cost: 2500.00,
    supplier: "Posto Shell",
    supply_date: new Date(),
    notes: "Abastecimento de rotina",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    pop_id: 2,
    generator_id: 2,
    fuel_type: "gasolina",
    quantity: 200,
    unit: "litros",
    cost: 1200.00,
    supplier: "Posto Ipiranga",
    supply_date: new Date(Date.now() - 86400000), // Ontem
    notes: "Abastecimento emergencial",
    created_at: new Date(),
    updated_at: new Date()
  }
];

let nextId = 3;

// Função para aplicar CORS
function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export default async function handler(req, res) {
  // Aplicar CORS
  if (applyCors(req, res)) return;

  const { method, query } = req;
  const { id } = query;

  try {
    switch (method) {
      case 'GET':
        if (id) {
          // Buscar abastecimento por ID
          const supply = supplies.find(s => s.id === parseInt(id));
          if (!supply) {
            return res.status(404).json({ error: 'Abastecimento não encontrado' });
          }
          return res.json(supply);
        } else {
          // Listar todos os abastecimentos
          const page = parseInt(query.page) || 1;
          const limit = parseInt(query.limit) || 10;
          const busca = query.busca || '';
          const pop_id = query.pop_id;
          const fuel_type = query.fuel_type;
          
          let filteredSupplies = supplies;
          
          if (busca) {
            filteredSupplies = supplies.filter(supply => 
              supply.supplier.toLowerCase().includes(busca.toLowerCase()) ||
              supply.notes.toLowerCase().includes(busca.toLowerCase()) ||
              supply.fuel_type.toLowerCase().includes(busca.toLowerCase())
            );
          }
          
          if (pop_id) {
            filteredSupplies = filteredSupplies.filter(supply => supply.pop_id === parseInt(pop_id));
          }
          
          if (fuel_type) {
            filteredSupplies = filteredSupplies.filter(supply => supply.fuel_type === fuel_type);
          }
          
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedSupplies = filteredSupplies.slice(startIndex, endIndex);
          
          return res.json({
            dados: paginatedSupplies,
            total: filteredSupplies.length,
            pagina: page,
            limite: limit,
            total_paginas: Math.ceil(filteredSupplies.length / limit)
          });
        }
        
      case 'POST':
        // Criar novo abastecimento
        const { 
          pop_id, 
          generator_id, 
          fuel_type, 
          quantity, 
          unit = 'litros', 
          cost, 
          supplier, 
          supply_date, 
          notes 
        } = req.body;
        
        if (!pop_id || !fuel_type || !quantity || !supplier) {
          return res.status(400).json({ error: 'POP, tipo de combustível, quantidade e fornecedor são obrigatórios' });
        }
        
        const newSupply = {
          id: nextId++,
          pop_id: parseInt(pop_id),
          generator_id: generator_id ? parseInt(generator_id) : null,
          fuel_type,
          quantity: parseFloat(quantity),
          unit,
          cost: cost ? parseFloat(cost) : null,
          supplier,
          supply_date: supply_date ? new Date(supply_date) : new Date(),
          notes: notes || '',
          created_at: new Date(),
          updated_at: new Date()
        };
        
        supplies.push(newSupply);
        return res.status(201).json(newSupply);
        
      case 'PUT':
        // Atualizar abastecimento
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }
        
        const supplyIndex = supplies.findIndex(s => s.id === parseInt(id));
        if (supplyIndex === -1) {
          return res.status(404).json({ error: 'Abastecimento não encontrado' });
        }
        
        const updates = req.body;
        if (updates.pop_id) updates.pop_id = parseInt(updates.pop_id);
        if (updates.generator_id) updates.generator_id = parseInt(updates.generator_id);
        if (updates.quantity) updates.quantity = parseFloat(updates.quantity);
        if (updates.cost) updates.cost = parseFloat(updates.cost);
        if (updates.supply_date) updates.supply_date = new Date(updates.supply_date);
        
        supplies[supplyIndex] = {
          ...supplies[supplyIndex],
          ...updates,
          updated_at: new Date()
        };
        
        return res.json(supplies[supplyIndex]);
        
      case 'DELETE':
        // Deletar abastecimento
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }
        
        const deleteIndex = supplies.findIndex(s => s.id === parseInt(id));
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Abastecimento não encontrado' });
        }
        
        supplies.splice(deleteIndex, 1);
        return res.status(204).end();
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${method} não permitido` });
    }
  } catch (error) {
    console.error('Erro na API de Abastecimentos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};