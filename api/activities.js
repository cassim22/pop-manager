// Vercel Serverless Function para Atividades

// Simulação do banco de dados em memória
let activities = [
  {
    id: 1,
    title: "Manutenção Ar Condicionado",
    description: "Verificar e limpar filtros do ar condicionado",
    type: "manutencao_ar_condicionado",
    status: "pending",
    priority: "medium",
    assigned_to: 1,
    pop_id: 1,
    scheduled_date: new Date(Date.now() + 86400000), // Amanhã
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    title: "Limpeza do POP",
    description: "Limpeza geral das instalações",
    type: "limpeza_pop",
    status: "in_progress",
    priority: "low",
    assigned_to: 2,
    pop_id: 2,
    scheduled_date: new Date(),
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
          // Buscar atividade por ID
          const activity = activities.find(a => a.id === parseInt(id));
          if (!activity) {
            return res.status(404).json({ error: 'Atividade não encontrada' });
          }
          return res.json(activity);
        } else {
          // Listar todas as atividades
          const page = parseInt(query.page) || 1;
          const limit = parseInt(query.limit) || 10;
          const busca = query.busca || '';
          const status = query.status;
          
          let filteredActivities = activities;
          
          if (busca) {
            filteredActivities = activities.filter(activity => 
              activity.title.toLowerCase().includes(busca.toLowerCase()) ||
              activity.description.toLowerCase().includes(busca.toLowerCase())
            );
          }
          
          if (status) {
            filteredActivities = filteredActivities.filter(activity => activity.status === status);
          }
          
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedActivities = filteredActivities.slice(startIndex, endIndex);
          
          return res.json({
            dados: paginatedActivities,
            total: filteredActivities.length,
            pagina: page,
            limite: limit,
            total_paginas: Math.ceil(filteredActivities.length / limit)
          });
        }
        
      case 'POST':
        // Criar nova atividade
        const { 
          title, 
          description, 
          type, 
          status = 'pending', 
          priority = 'medium', 
          assigned_to, 
          pop_id, 
          scheduled_date 
        } = req.body;
        
        if (!title) {
          return res.status(400).json({ error: 'Título é obrigatório' });
        }
        
        const newActivity = {
          id: nextId++,
          title,
          description,
          type,
          status,
          priority,
          assigned_to: assigned_to ? parseInt(assigned_to) : null,
          pop_id: pop_id ? parseInt(pop_id) : null,
          scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        activities.push(newActivity);
        return res.status(201).json(newActivity);
        
      case 'PUT':
        // Atualizar atividade
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }
        
        const activityIndex = activities.findIndex(a => a.id === parseInt(id));
        if (activityIndex === -1) {
          return res.status(404).json({ error: 'Atividade não encontrada' });
        }
        
        const updates = req.body;
        if (updates.assigned_to) updates.assigned_to = parseInt(updates.assigned_to);
        if (updates.pop_id) updates.pop_id = parseInt(updates.pop_id);
        if (updates.scheduled_date) updates.scheduled_date = new Date(updates.scheduled_date);
        
        activities[activityIndex] = {
          ...activities[activityIndex],
          ...updates,
          updated_at: new Date()
        };
        
        return res.json(activities[activityIndex]);
        
      case 'DELETE':
        // Deletar atividade
        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }
        
        const deleteIndex = activities.findIndex(a => a.id === parseInt(id));
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Atividade não encontrada' });
        }
        
        activities.splice(deleteIndex, 1);
        return res.status(204).end();
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${method} não permitido` });
    }
  } catch (error) {
    console.error('Erro na API de Atividades:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};