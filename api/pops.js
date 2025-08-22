// Vercel Serverless Function para POPs
const cors = require('cors');

// Simulação do banco de dados em memória (em produção, usar banco real)
let pops = [
  {
    id: 1,
    name: "POP Central",
    code: "POP-001",
    address: "Rua Principal, 123, Centro, São Paulo, SP",
    latitude: -23.5505,
    longitude: -46.6333,
    status: "active",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: "POP Norte",
    code: "POP-002",
    address: "Av. Norte, 456, Zona Norte, São Paulo, SP",
    latitude: -23.5000,
    longitude: -46.6000,
    status: "active",
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

module.exports = async (req, res) => {
  // Aplicar CORS
  if (applyCors(req, res)) return;

  const { method, query } = req;
  const { id } = query;

  try {
    switch (method) {
      case 'GET':
        if (id) {
          // Buscar POP por ID
          const pop = pops.find(p => p.id === parseInt(id));
          if (!pop) {
            return res.status(404).json({ error: 'POP não encontrado' });
          }
          return res.json(pop);
        } else {
          // Listar todos os POPs
          const page = parseInt(query.page) || 1;
          const limit = parseInt(query.limit) || 10;
          const busca = query.busca || '';
          
          let filteredPops = pops;
          if (busca) {
            filteredPops = pops.filter(pop => 
              pop.name.toLowerCase().includes(busca.toLowerCase()) ||
              pop.code.toLowerCase().includes(busca.toLowerCase())
            );
          }
          
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedPops = filteredPops.slice(startIndex, endIndex);
          
          return res.json({
            dados: paginatedPops,
            total: filteredPops.length,
            pagina: page,
            limite: limit,
            total_paginas: Math.ceil(filteredPops.length / limit)
          });
        }
        
      case 'POST':
        // Criar novo POP
        const { name, code, address, latitude, longitude, status = 'active' } = req.body;
        
        if (!name || !code) {
          return res.status(400).json({ error: 'Nome e código são obrigatórios' });
        }
        
        // Verificar se código já existe
        const existingPop = pops.find(pop => pop.code === code);
        if (existingPop) {
          return res.status(409).json({ error: 'Código do POP já existe' });
        }
        
        const newPop = {
          id: nextId++,
          name,
          code,
          address,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          status,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        pops.push(newPop);
        return res.status(201).json(newPop);
        
      case 'PUT':
        // Atualizar POP
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }
        
        const popIndex = pops.findIndex(p => p.id === parseInt(id));
        if (popIndex === -1) {
          return res.status(404).json({ error: 'POP não encontrado' });
        }
        
        const updates = req.body;
        pops[popIndex] = {
          ...pops[popIndex],
          ...updates,
          updated_at: new Date()
        };
        
        return res.json(pops[popIndex]);
        
      case 'DELETE':
        // Deletar POP
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }
        
        const deleteIndex = pops.findIndex(p => p.id === parseInt(id));
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'POP não encontrado' });
        }
        
        pops.splice(deleteIndex, 1);
        return res.status(204).end();
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${method} não permitido` });
    }
  } catch (error) {
    console.error('Erro na API de POPs:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};