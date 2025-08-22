// Vercel Serverless Function para Dashboard

// Simulação do banco de dados em memória
const pops = [
  { id: 1, name: "POP Centro", status: "active" },
  { id: 2, name: "POP Norte", status: "active" },
  { id: 3, name: "POP Sul", status: "maintenance" },
  { id: 4, name: "POP Leste", status: "inactive" }
];

const activities = [
  { id: 1, status: "pending", priority: "high", type: "manutencao_ar_condicionado" },
  { id: 2, status: "in_progress", priority: "medium", type: "limpeza_pop" },
  { id: 3, status: "completed", priority: "low", type: "verificacao_equipamentos" },
  { id: 4, status: "pending", priority: "high", type: "manutencao_gerador" },
  { id: 5, status: "completed", priority: "medium", type: "limpeza_pop" }
];

const technicians = [
  { id: 1, status: "active", specialization: "Ar Condicionado" },
  { id: 2, status: "active", specialization: "Elétrica" },
  { id: 3, status: "vacation", specialization: "Rede" },
  { id: 4, status: "active", specialization: "Gerador" }
];

const supplies = [
  { id: 1, cost: 2500.00, supply_date: new Date() },
  { id: 2, cost: 1200.00, supply_date: new Date(Date.now() - 86400000) },
  { id: 3, cost: 3000.00, supply_date: new Date(Date.now() - 172800000) }
];

// Função para aplicar CORS
function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

  const { method } = req;

  try {
    if (method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Método ${method} não permitido` });
    }

    // Estatísticas dos POPs
    const popsStats = {
      total: pops.length,
      active: pops.filter(p => p.status === 'active').length,
      maintenance: pops.filter(p => p.status === 'maintenance').length,
      inactive: pops.filter(p => p.status === 'inactive').length
    };

    // Estatísticas das Atividades
    const activitiesStats = {
      total: activities.length,
      pending: activities.filter(a => a.status === 'pending').length,
      in_progress: activities.filter(a => a.status === 'in_progress').length,
      completed: activities.filter(a => a.status === 'completed').length,
      high_priority: activities.filter(a => a.priority === 'high').length,
      medium_priority: activities.filter(a => a.priority === 'medium').length,
      low_priority: activities.filter(a => a.priority === 'low').length
    };

    // Estatísticas dos Técnicos
    const techniciansStats = {
      total: technicians.length,
      active: technicians.filter(t => t.status === 'active').length,
      vacation: technicians.filter(t => t.status === 'vacation').length,
      inactive: technicians.filter(t => t.status === 'inactive').length
    };

    // Estatísticas de Abastecimentos
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySupplies = supplies.filter(s => {
      const supplyDate = new Date(s.supply_date);
      return supplyDate.getMonth() === currentMonth && supplyDate.getFullYear() === currentYear;
    });
    
    const suppliesStats = {
      total_this_month: monthlySupplies.length,
      total_cost_this_month: monthlySupplies.reduce((sum, s) => sum + s.cost, 0),
      average_cost: monthlySupplies.length > 0 ? monthlySupplies.reduce((sum, s) => sum + s.cost, 0) / monthlySupplies.length : 0
    };

    // Atividades por tipo
    const activitiesByType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    // Técnicos por especialização
    const techniciansBySpecialization = technicians.reduce((acc, tech) => {
      acc[tech.specialization] = (acc[tech.specialization] || 0) + 1;
      return acc;
    }, {});

    // Atividades recentes (últimas 5)
    const recentActivities = activities
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)
      .map(activity => ({
        id: activity.id,
        status: activity.status,
        priority: activity.priority,
        type: activity.type
      }));

    // Dados para gráficos
    const chartData = {
      pops_status: [
        { name: 'Ativo', value: popsStats.active, color: '#10B981' },
        { name: 'Manutenção', value: popsStats.maintenance, color: '#F59E0B' },
        { name: 'Inativo', value: popsStats.inactive, color: '#EF4444' }
      ],
      activities_status: [
        { name: 'Pendente', value: activitiesStats.pending, color: '#F59E0B' },
        { name: 'Em Progresso', value: activitiesStats.in_progress, color: '#3B82F6' },
        { name: 'Concluída', value: activitiesStats.completed, color: '#10B981' }
      ],
      activities_priority: [
        { name: 'Alta', value: activitiesStats.high_priority, color: '#EF4444' },
        { name: 'Média', value: activitiesStats.medium_priority, color: '#F59E0B' },
        { name: 'Baixa', value: activitiesStats.low_priority, color: '#10B981' }
      ]
    };

    const dashboardData = {
      pops: popsStats,
      activities: activitiesStats,
      technicians: techniciansStats,
      supplies: suppliesStats,
      activities_by_type: activitiesByType,
      technicians_by_specialization: techniciansBySpecialization,
      recent_activities: recentActivities,
      charts: chartData,
      last_updated: new Date().toISOString()
    };

    return res.json(dashboardData);
    
  } catch (error) {
    console.error('Erro na API do Dashboard:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};