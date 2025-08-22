// Vercel Serverless Function para Técnicos

// Simulação do banco de dados em memória
let technicians = [
  {
    id: 1,
    name: "João Silva",
    email: "joao.silva@empresa.com",
    phone: "(11) 99999-1111",
    specialization: "Ar Condicionado",
    status: "active",
    nivel_acesso: "tecnico",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria.santos@empresa.com",
    phone: "(11) 99999-2222",
    specialization: "Elétrica",
    status: "active",
    nivel_acesso: "tecnico",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro.costa@empresa.com",
    phone: "(11) 99999-3333",
    specialization: "Rede",
    status: "vacation",
    nivel_acesso: "senior",
    created_at: new Date(),
    updated_at: new Date()
  }
];

let nextId = 4;

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
          // Buscar técnico por ID
          const technician = technicians.find(t => t.id === parseInt(id));
          if (!technician) {
            return res.status(404).json({ error: 'Técnico não encontrado' });
          }
          return res.json(technician);
        } else {
          // Listar todos os técnicos
          const page = parseInt(query.page) || 1;
          const limit = parseInt(query.limit) || 10;
          const busca = query.busca || '';
          const status = query.status;
          const especialidade = query.especialidade;
          
          let filteredTechnicians = technicians;
          
          if (busca) {
            filteredTechnicians = technicians.filter(tech => 
              tech.name.toLowerCase().includes(busca.toLowerCase()) ||
              tech.email.toLowerCase().includes(busca.toLowerCase()) ||
              tech.specialization.toLowerCase().includes(busca.toLowerCase())
            );
          }
          
          if (status) {
            filteredTechnicians = filteredTechnicians.filter(tech => tech.status === status);
          }
          
          if (especialidade) {
            filteredTechnicians = filteredTechnicians.filter(tech => 
              tech.specialization.toLowerCase().includes(especialidade.toLowerCase())
            );
          }
          
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedTechnicians = filteredTechnicians.slice(startIndex, endIndex);
          
          return res.json({
            dados: paginatedTechnicians,
            total: filteredTechnicians.length,
            pagina: page,
            limite: limit,
            total_paginas: Math.ceil(filteredTechnicians.length / limit)
          });
        }
        
      case 'POST':
        // Criar novo técnico
        const { 
          name, 
          email, 
          phone, 
          specialization, 
          status = 'active', 
          nivel_acesso = 'tecnico' 
        } = req.body;
        
        if (!name || !email) {
          return res.status(400).json({ error: 'Nome e email são obrigatórios' });
        }
        
        // Verificar se email já existe
        const existingTechnician = technicians.find(tech => tech.email === email);
        if (existingTechnician) {
          return res.status(409).json({ error: 'Email já está em uso' });
        }
        
        const newTechnician = {
          id: nextId++,
          name,
          email,
          phone,
          specialization,
          status,
          nivel_acesso,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        technicians.push(newTechnician);
        return res.status(201).json(newTechnician);
        
      case 'PUT':
        // Atualizar técnico
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }
        
        const technicianIndex = technicians.findIndex(t => t.id === parseInt(id));
        if (technicianIndex === -1) {
          return res.status(404).json({ error: 'Técnico não encontrado' });
        }
        
        const updates = req.body;
        
        // Verificar se email já existe (se estiver sendo atualizado)
        if (updates.email && updates.email !== technicians[technicianIndex].email) {
          const existingTechnician = technicians.find(tech => tech.email === updates.email);
          if (existingTechnician) {
            return res.status(409).json({ error: 'Email já está em uso' });
          }
        }
        
        technicians[technicianIndex] = {
          ...technicians[technicianIndex],
          ...updates,
          updated_at: new Date()
        };
        
        return res.json(technicians[technicianIndex]);
        
      case 'DELETE':
        // Deletar técnico
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }
        
        const deleteIndex = technicians.findIndex(t => t.id === parseInt(id));
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Técnico não encontrado' });
        }
        
        technicians.splice(deleteIndex, 1);
        return res.status(204).end();
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${method} não permitido` });
    }
  } catch (error) {
    console.error('Erro na API de Técnicos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};