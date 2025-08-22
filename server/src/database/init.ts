import { Pool } from 'pg'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Criar pool de conexões
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// SQL para criar as tabelas
const createTablesSQL = `
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de POPs (Pontos de Presença)
CREATE TABLE IF NOT EXISTS pops (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de técnicos
CREATE TABLE IF NOT EXISTS technicians (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  specialization VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  pop_id INTEGER REFERENCES pops(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de geradores
CREATE TABLE IF NOT EXISTS generators (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(100),
  serial_number VARCHAR(100),
  power_rating INTEGER,
  fuel_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'operational',
  pop_id INTEGER REFERENCES pops(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de atividades
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_to INTEGER REFERENCES technicians(id),
  pop_id INTEGER REFERENCES pops(id),
  generator_id INTEGER REFERENCES generators(id),
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de abastecimentos
CREATE TABLE IF NOT EXISTS fuel_supplies (
  id SERIAL PRIMARY KEY,
  generator_id INTEGER REFERENCES generators(id),
  technician_id INTEGER REFERENCES technicians(id),
  quantity DECIMAL(10, 2),
  fuel_type VARCHAR(50),
  cost DECIMAL(10, 2),
  supplier VARCHAR(255),
  receipt_photo VARCHAR(500),
  notes TEXT,
  supply_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de manutenções
CREATE TABLE IF NOT EXISTS maintenances (
  id SERIAL PRIMARY KEY,
  generator_id INTEGER REFERENCES generators(id),
  technician_id INTEGER REFERENCES technicians(id),
  type VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  next_maintenance_date TIMESTAMP,
  cost DECIMAL(10, 2),
  parts_used TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de modelos de checklist
CREATE TABLE IF NOT EXISTS checklist_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  items JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de checklists preenchidos
CREATE TABLE IF NOT EXISTS checklists (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES checklist_templates(id),
  generator_id INTEGER REFERENCES generators(id),
  technician_id INTEGER REFERENCES technicians(id),
  responses JSONB,
  status VARCHAR(50) DEFAULT 'completed',
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_activities_pop_id ON activities(pop_id);
CREATE INDEX IF NOT EXISTS idx_activities_technician ON activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_generators_pop_id ON generators(pop_id);
CREATE INDEX IF NOT EXISTS idx_fuel_supplies_generator ON fuel_supplies(generator_id);
CREATE INDEX IF NOT EXISTS idx_maintenances_generator ON maintenances(generator_id);
CREATE INDEX IF NOT EXISTS idx_checklists_generator ON checklists(generator_id);
`

// Função para inicializar o banco de dados
export async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados...')
    
    // Executar SQL de criação das tabelas
    await db.query(createTablesSQL)
    
    console.log('✅ Banco de dados inicializado com sucesso!')
    console.log('📋 Tabelas criadas:')
    console.log('  - users')
    console.log('  - pops')
    console.log('  - technicians')
    console.log('  - generators')
    console.log('  - activities')
    console.log('  - fuel_supplies')
    console.log('  - maintenances')
    console.log('  - checklist_templates')
    console.log('  - checklists')
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error)
    throw error
  } finally {
    await db.end()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Inicialização concluída!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Falha na inicialização:', error)
      process.exit(1)
    })
}