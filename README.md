# POP Manager - Sistema de Gerenciamento de POPs

🚀 **Agora integrado ao Vercel para deploy em produção!**

Sistema completo para gerenciamento de Pontos de Presença (POPs), incluindo controle de atividades, técnicos, abastecimentos e dashboard analítico.

## 📋 Funcionalidades

- **Dashboard Analítico**: Visão geral com métricas e gráficos
- **Gerenciamento de POPs**: CRUD completo com mapa interativo
- **Controle de Atividades**: Agendamento e acompanhamento de tarefas
- **Gestão de Técnicos**: Cadastro e controle de especialistas
- **Controle de Abastecimentos**: Registro de combustível e custos
- **Interface Responsiva**: Design moderno com Tailwind CSS
- **API RESTful**: Backend completo com validações

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Query** para gerenciamento de estado
- **React Router** para navegação
- **Leaflet** para mapas interativos
- **Recharts** para gráficos
- **Radix UI** para componentes acessíveis

### Backend
- **Vercel Serverless Functions** (Node.js)
- **Banco de dados em memória** (facilmente migrável)
- **CORS configurado** para produção
- **Validação de dados** integrada

## 🚀 Deploy no Vercel

### Opção 1: Deploy Automático (Recomendado)

1. **Criar repositório no GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/seu-usuario/pop-manager.git
   git push -u origin main
   ```

2. **Conectar ao Vercel**:
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório
   - Configure:
     - Framework: **Vite**
     - Build Command: `npm run vercel-build`
     - Output Directory: `dist`

3. **Configurar variáveis de ambiente**:
   ```
   NODE_ENV=production
   VITE_API_URL=https://seu-projeto.vercel.app/api
   ```

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 💻 Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/pop-manager.git
cd pop-manager

# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
npm run vercel-build # Build otimizado para Vercel
npm run deploy       # Deploy direto para Vercel
```

## 📁 Estrutura do Projeto

```
pop-manager/
├── api/                    # Vercel Serverless Functions
│   ├── pops.js            # API de POPs
│   ├── activities.js      # API de Atividades
│   ├── technicians.js     # API de Técnicos
│   ├── supplies.js        # API de Abastecimentos
│   └── dashboard.js       # API do Dashboard
├── src/
│   ├── components/        # Componentes React
│   ├── pages/            # Páginas da aplicação
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilitários
│   └── types/            # Tipos TypeScript
├── public/               # Arquivos estáticos
├── vercel.json          # Configuração do Vercel
├── package.json         # Dependências e scripts
├── .env.example         # Exemplo de variáveis de ambiente
├── DEPLOY_GUIDE.md      # Guia detalhado de deploy
└── README.md            # Este arquivo
```

## 🌐 APIs Disponíveis

Todas as APIs estão disponíveis em `/api/*` após o deploy:

### POPs
- `GET /api/pops` - Listar POPs
- `POST /api/pops` - Criar POP
- `PUT /api/pops?id={id}` - Atualizar POP
- `DELETE /api/pops?id={id}` - Deletar POP

### Atividades
- `GET /api/activities` - Listar atividades
- `POST /api/activities` - Criar atividade
- `PUT /api/activities?id={id}` - Atualizar atividade
- `DELETE /api/activities?id={id}` - Deletar atividade

### Técnicos
- `GET /api/technicians` - Listar técnicos
- `POST /api/technicians` - Criar técnico
- `PUT /api/technicians?id={id}` - Atualizar técnico
- `DELETE /api/technicians?id={id}` - Deletar técnico

### Abastecimentos
- `GET /api/supplies` - Listar abastecimentos
- `POST /api/supplies` - Criar abastecimento
- `PUT /api/supplies?id={id}` - Atualizar abastecimento
- `DELETE /api/supplies?id={id}` - Deletar abastecimento

### Dashboard
- `GET /api/dashboard` - Obter estatísticas

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

### Banco de Dados

Atualmente usa banco em memória. Para migrar para PostgreSQL:

1. Adicione as variáveis de ambiente do banco
2. Instale `pg` ou `prisma`
3. Atualize as funções serverless

## 📊 Funcionalidades Detalhadas

### Dashboard
- Estatísticas em tempo real
- Gráficos interativos
- Métricas de performance
- Atividades recentes

### Gerenciamento de POPs
- Mapa interativo com marcadores
- Formulário completo de cadastro
- Status de operação
- Informações de localização

### Controle de Atividades
- Calendário de agendamentos
- Priorização de tarefas
- Atribuição a técnicos
- Controle de status

### Gestão de Técnicos
- Cadastro completo
- Especialização por área
- Controle de disponibilidade
- Histórico de atividades

### Controle de Abastecimentos
- Registro de combustível
- Controle de custos
- Histórico por POP
- Relatórios de consumo

## 🔒 Segurança

- HTTPS automático no Vercel
- CORS configurado
- Validação de dados
- Sanitização de inputs
- Headers de segurança

## 📈 Performance

- Build otimizado com Vite
- Code splitting automático
- Lazy loading de componentes
- Cache de APIs com React Query
- CDN global do Vercel

## 🐛 Solução de Problemas

Consulte o [Guia de Deploy](./DEPLOY_GUIDE.md) para soluções detalhadas.

### Problemas Comuns

1. **Build falha**: Verifique `npm run type-check`
2. **APIs não funcionam**: Confirme o `vercel.json`
3. **CORS errors**: Verifique as configurações das funções

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- 📧 Email: seu-email@exemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/pop-manager/issues)
- 📖 Docs: [Documentação Completa](./DEPLOY_GUIDE.md)

---

**Desenvolvido com ❤️ para gerenciamento eficiente de POPs**

🌟 **Agora com deploy automático no Vercel!** 🌟