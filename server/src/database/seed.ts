import { Pool } from 'pg'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

// Carregar variáveis de ambiente
dotenv.config()

// Criar pool de conexões
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Função para popular o banco com dados de exemplo
export async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...')
    
    // Hash da senha padrão
    const defaultPassword = await bcrypt.hash('123456', 10)
    
    // Inserir usuários
    await db.query(`
      INSERT INTO users (name, email, password, role) VALUES
      ('Admin Sistema', 'admin@sistema.com', $1, 'admin'),
      ('João Silva', 'joao@empresa.com', $1, 'manager'),
      ('Maria Santos', 'maria@empresa.com', $1, 'user')
      ON CONFLICT (email) DO NOTHING
    `, [defaultPassword])
    
    // Inserir POPs
    await db.query(`
      INSERT INTO pops (name, code, address, latitude, longitude, status) VALUES
      ('POP Centro', 'POP-CTR-001', 'Rua das Flores, 123 - Centro', -23.5505, -46.6333, 'active'),
      ('POP Norte', 'POP-NRT-002', 'Av. Paulista, 456 - Bela Vista', -23.5618, -46.6565, 'active'),
      ('POP Sul', 'POP-SUL-003', 'Rua Augusta, 789 - Consolação', -23.5489, -46.6388, 'active'),
      ('POP Oeste', 'POP-OST-004', 'Av. Faria Lima, 321 - Itaim Bibi', -23.5707, -46.6937, 'maintenance')
      ON CONFLICT (code) DO NOTHING
    `)
    
    // Inserir técnicos
    await db.query(`
      INSERT INTO technicians (name, email, phone, specialization, status, pop_id) VALUES
      ('Carlos Oliveira', 'carlos@empresa.com', '(11) 99999-1111', 'Elétrica', 'active', 1),
      ('Ana Costa', 'ana@empresa.com', '(11) 99999-2222', 'Mecânica', 'active', 2),
      ('Pedro Lima', 'pedro@empresa.com', '(11) 99999-3333', 'Eletrônica', 'active', 3),
      ('Lucia Ferreira', 'lucia@empresa.com', '(11) 99999-4444', 'Geral', 'active', 1)
      ON CONFLICT (email) DO NOTHING
    `)
    
    // Inserir geradores
    await db.query(`
      INSERT INTO generators (name, model, serial_number, power_rating, fuel_type, status, pop_id) VALUES
      ('Gerador Principal POP Centro', 'Caterpillar C15', 'CAT001234', 500, 'diesel', 'operational', 1),
      ('Gerador Backup POP Centro', 'Cummins QSK19', 'CUM005678', 350, 'diesel', 'operational', 1),
      ('Gerador Principal POP Norte', 'Volvo TAD1641GE', 'VOL009876', 400, 'diesel', 'operational', 2),
      ('Gerador Principal POP Sul', 'Perkins 2506A', 'PER543210', 300, 'diesel', 'maintenance', 3),
      ('Gerador Principal POP Oeste', 'MWM TCG 2020', 'MWM112233', 450, 'gas', 'operational', 4)
    `)
    
    // Inserir atividades
    await db.query(`
      INSERT INTO activities (title, description, type, status, priority, assigned_to, pop_id, generator_id, scheduled_date) VALUES
      ('Manutenção Preventiva Mensal', 'Verificação geral dos sistemas', 'maintenance', 'completed', 'high', 1, 1, 1, NOW() - INTERVAL '2 days'),
      ('Troca de Filtros', 'Substituição de filtros de ar e combustível', 'maintenance', 'in_progress', 'medium', 2, 2, 3, NOW() + INTERVAL '1 day'),
      ('Inspeção Elétrica', 'Verificação do sistema elétrico', 'inspection', 'pending', 'high', 3, 3, 4, NOW() + INTERVAL '3 days'),
      ('Abastecimento de Combustível', 'Reposição do tanque de diesel', 'fuel', 'pending', 'medium', 1, 1, 1, NOW() + INTERVAL '5 days'),
      ('Teste de Funcionamento', 'Teste completo do gerador', 'test', 'scheduled', 'low', 4, 4, 5, NOW() + INTERVAL '7 days')
    `)
    
    // Inserir abastecimentos
    await db.query(`
      INSERT INTO fuel_supplies (generator_id, technician_id, quantity, fuel_type, cost, supplier, notes) VALUES
      (1, 1, 500.00, 'diesel', 2500.00, 'Petrobras Distribuidora', 'Abastecimento completo do tanque'),
      (3, 2, 300.00, 'diesel', 1500.00, 'Shell Brasil', 'Abastecimento parcial'),
      (2, 1, 400.00, 'diesel', 2000.00, 'BR Distribuidora', 'Manutenção do nível')
    `)
    
    // Inserir manutenções
    await db.query(`
      INSERT INTO maintenances (generator_id, technician_id, type, description, status, scheduled_date, cost, parts_used) VALUES
      (1, 1, 'preventiva', 'Manutenção mensal completa', 'completed', NOW() - INTERVAL '1 week', 800.00, 'Filtros, óleo, velas'),
      (4, 3, 'corretiva', 'Reparo no sistema de ignição', 'in_progress', NOW(), 1200.00, 'Bobina de ignição, cabos'),
      (2, 2, 'preventiva', 'Troca de óleo e filtros', 'scheduled', NOW() + INTERVAL '2 weeks', 600.00, 'Óleo, filtros')
    `)
    
    // Inserir templates de checklist
    await db.query(`
      INSERT INTO checklist_templates (name, description, category, items) VALUES
      ('Checklist Diário Gerador', 'Verificações diárias do gerador', 'daily', 
       '[{"id": 1, "question": "Nível de combustível adequado?", "type": "boolean"}, 
         {"id": 2, "question": "Temperatura do motor normal?", "type": "boolean"}, 
         {"id": 3, "question": "Pressão do óleo (bar)", "type": "number"}, 
         {"id": 4, "question": "Observações gerais", "type": "text"}]'),
      ('Checklist Manutenção Preventiva', 'Checklist para manutenção preventiva', 'maintenance', 
       '[{"id": 1, "question": "Filtro de ar limpo?", "type": "boolean"}, 
         {"id": 2, "question": "Óleo trocado?", "type": "boolean"}, 
         {"id": 3, "question": "Velas verificadas?", "type": "boolean"}, 
         {"id": 4, "question": "Horas de funcionamento", "type": "number"}]')
    `)
    
    console.log('✅ Seed do banco de dados concluído com sucesso!')
    console.log('📊 Dados inseridos:')
    console.log('  - 3 usuários')
    console.log('  - 4 POPs')
    console.log('  - 4 técnicos')
    console.log('  - 5 geradores')
    console.log('  - 5 atividades')
    console.log('  - 3 abastecimentos')
    console.log('  - 3 manutenções')
    console.log('  - 2 templates de checklist')
    
  } catch (error) {
    console.error('❌ Erro ao fazer seed do banco:', error)
    throw error
  } finally {
    await db.end()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seed concluído!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Falha no seed:', error)
      process.exit(1)
    })
}