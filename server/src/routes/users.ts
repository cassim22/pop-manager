import { Router, Request, Response } from 'express';
import { memoryDB, User, getNextId, findById, updateById, deleteById } from '../database/memory';

const router = Router();

// GET /api/users - Listar todos os usuários
router.get('/', (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    let users = memoryDB.users;

    // Filtro por role
    if (role) {
      users = users.filter(u => u.role === role);
    }

    // Remover informações sensíveis da resposta
    const safeUsers = users.map(user => {
      const { ...safeUser } = user;
      return safeUser;
    });

    res.json({
      success: true,
      data: safeUsers,
      total: safeUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const user = memoryDB.users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Remover informações sensíveis
    const { ...safeUser } = user;

    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/users - Criar novo usuário
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      nome,
      email,
      role,
      dashboard_config
    } = req.body;

    // Validações básicas
    if (!nome || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome, email, role'
      });
    }

    // Verificar se email já existe
    const existingUser = memoryDB.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Validar role
    const validRoles = ['admin', 'supervisor', 'tecnico'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role deve ser: admin, supervisor ou tecnico'
      });
    }

    const defaultDashboardConfig = {
      admin: ['pops-status', 'activities-pending', 'technicians-status', 'generators-status', 'maintenance-schedule'],
      supervisor: ['activities-pending', 'technicians-status', 'maintenance-schedule', 'supplies-summary'],
      tecnico: ['my-activities', 'pops-status', 'my-schedule']
    };

    const newUser = {
      id: Math.max(...memoryDB.users.map(u => u.id), 0) + 1,
      nome,
      email: email.toLowerCase(),
      role,
      dashboard_config: dashboard_config || { widgets: defaultDashboardConfig[role as keyof typeof defaultDashboardConfig] },
      created_at: new Date(),
      updated_at: new Date()
    };

    memoryDB.users.push(newUser);

    // Retornar usuário sem informações sensíveis
    const { ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userIndex = memoryDB.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se email já existe (exceto para o próprio usuário)
    if (req.body.email) {
      const existingUser = memoryDB.users.find(u => 
        u.email.toLowerCase() === req.body.email.toLowerCase() && u.id !== id
      );
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    // Validar role se fornecida
    if (req.body.role) {
      const validRoles = ['admin', 'supervisor', 'tecnico'];
      if (!validRoles.includes(req.body.role)) {
        return res.status(400).json({
          success: false,
          message: 'Role deve ser: admin, supervisor ou tecnico'
        });
      }
    }

    const updatedUser = {
      ...memoryDB.users[userIndex],
      ...req.body,
      id, // Manter o ID original
      email: req.body.email ? req.body.email.toLowerCase() : memoryDB.users[userIndex].email,
      updated_at: new Date()
    };

    memoryDB.users[userIndex] = updatedUser;

    // Retornar usuário sem informações sensíveis
    const { ...safeUser } = updatedUser;

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// DELETE /api/users/:id - Deletar usuário
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userIndex = memoryDB.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se é o último admin
    const user = memoryDB.users[userIndex];
    if (user.role === 'admin') {
      const adminCount = memoryDB.users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível deletar o último administrador do sistema'
        });
      }
    }

    const deletedUser = memoryDB.users.splice(userIndex, 1)[0];

    // Retornar usuário sem informações sensíveis
    const { ...safeUser } = deletedUser;

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso',
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// PUT /api/users/:id/dashboard-config - Atualizar configuração do dashboard
router.put('/:id/dashboard-config', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { dashboard_config } = req.body;
    const userIndex = memoryDB.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (!dashboard_config || !dashboard_config.widgets || !Array.isArray(dashboard_config.widgets)) {
      return res.status(400).json({
        success: false,
        message: 'Configuração do dashboard deve conter um array de widgets'
      });
    }

    memoryDB.users[userIndex].dashboard_config = dashboard_config;
    memoryDB.users[userIndex].updated_at = new Date();

    const { ...safeUser } = memoryDB.users[userIndex];

    res.json({
      success: true,
      message: 'Configuração do dashboard atualizada com sucesso',
      data: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/users/roles/available - Listar roles disponíveis
router.get('/roles/available', (req: Request, res: Response) => {
  try {
    const roles = [
      {
        value: 'admin',
        label: 'Administrador',
        description: 'Acesso total ao sistema',
        permissions: ['read', 'write', 'delete', 'manage_users', 'system_config']
      },
      {
        value: 'supervisor',
        label: 'Supervisor',
        description: 'Gerenciamento de operações e equipe',
        permissions: ['read', 'write', 'manage_activities', 'view_reports']
      },
      {
        value: 'tecnico',
        label: 'Técnico',
        description: 'Execução de atividades e manutenções',
        permissions: ['read', 'write_own_activities', 'view_assigned_tasks']
      }
    ];

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/users/stats - Estatísticas dos usuários
router.get('/stats/overview', (req: Request, res: Response) => {
  try {
    const stats = {
      total_users: memoryDB.users.length,
      by_role: {
        admin: memoryDB.users.filter(u => u.role === 'admin').length,
        supervisor: memoryDB.users.filter(u => u.role === 'supervisor').length,
        tecnico: memoryDB.users.filter(u => u.role === 'tecnico').length
      },
      recent_users: memoryDB.users
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(u => {
          const { ...safeUser } = u;
          return safeUser;
        })
    };

    res.json({
      success: true,
      data: stats
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