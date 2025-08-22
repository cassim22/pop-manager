# Guia de Deploy no Vercel

Este guia fornece instruções passo a passo para fazer o deploy da aplicação POP Manager no Vercel.

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Node.js 18+ instalado
- Git configurado
- Repositório no GitHub/GitLab/Bitbucket

## 🚀 Deploy Automático via GitHub

### 1. Preparar o Repositório

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - POP Manager ready for Vercel"

# Adicionar repositório remoto
git remote add origin https://github.com/seu-usuario/pop-manager.git

# Push para o GitHub
git push -u origin main
```

### 2. Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure as seguintes opções:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Configurar Variáveis de Ambiente

No painel do Vercel, vá em Settings > Environment Variables e adicione:

```
NODE_ENV=production
VITE_API_URL=https://seu-projeto.vercel.app/api
```

### 4. Deploy

Clique em "Deploy" e aguarde o processo ser concluído.

## 🛠️ Deploy Manual via CLI

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Login no Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# Deploy de desenvolvimento
vercel

# Deploy de produção
vercel --prod
```

## ⚙️ Configurações Importantes

### Arquivo vercel.json

O projeto já inclui um arquivo `vercel.json` configurado com:

- Roteamento para SPA (Single Page Application)
- Configuração das funções serverless da API
- Headers CORS para as rotas da API
- Configurações de build otimizadas

### Scripts do Package.json

Os seguintes scripts foram adicionados:

- `vercel-build`: Build otimizado para produção
- `start`: Inicia o servidor de preview
- `deploy`: Deploy direto para produção

## 🔧 Estrutura das APIs Serverless

As seguintes APIs foram convertidas para funções serverless:

- `/api/pops` - Gerenciamento de POPs
- `/api/activities` - Gerenciamento de atividades
- `/api/technicians` - Gerenciamento de técnicos
- `/api/supplies` - Gerenciamento de abastecimentos
- `/api/dashboard` - Dados do dashboard

## 🌐 URLs de Acesso

Após o deploy, você terá:

- **Frontend**: `https://seu-projeto.vercel.app`
- **API**: `https://seu-projeto.vercel.app/api/*`

## 🔍 Verificação do Deploy

### 1. Testar o Frontend

Acesse `https://seu-projeto.vercel.app` e verifique se:

- A página carrega corretamente
- A navegação funciona
- Os dados são exibidos

### 2. Testar as APIs

```bash
# Testar API de POPs
curl https://seu-projeto.vercel.app/api/pops

# Testar Dashboard
curl https://seu-projeto.vercel.app/api/dashboard
```

## 🐛 Solução de Problemas

### Build Falha

1. Verifique se todas as dependências estão no `package.json`
2. Execute `npm run type-check` localmente
3. Verifique os logs de build no Vercel

### APIs não Funcionam

1. Verifique se os arquivos estão na pasta `/api`
2. Confirme se o `vercel.json` está configurado corretamente
3. Verifique os logs das funções no Vercel

### Problemas de CORS

1. Verifique se os headers CORS estão configurados nas funções
2. Confirme se a `VITE_API_URL` está correta

## 📊 Monitoramento

### Logs

Acesse os logs no painel do Vercel:

1. Vá para seu projeto
2. Clique na aba "Functions"
3. Selecione uma função para ver os logs

### Analytics

O Vercel fornece analytics automáticos:

- Tempo de resposta
- Número de requisições
- Erros 4xx/5xx
- Uso de banda

## 🔄 Atualizações

### Deploy Automático

Com GitHub conectado, cada push para a branch `main` fará deploy automático.

### Deploy Manual

```bash
# Fazer alterações
git add .
git commit -m "Suas alterações"
git push

# Ou deploy direto
npm run deploy
```

## 💰 Custos

### Plano Hobby (Gratuito)

- 100GB de banda por mês
- Funções serverless ilimitadas
- 1 build concorrente
- Domínios `.vercel.app`

### Plano Pro ($20/mês)

- 1TB de banda
- Builds mais rápidos
- Domínios customizados
- Analytics avançados

## 🔒 Segurança

### Variáveis de Ambiente

- Nunca commite arquivos `.env` com dados sensíveis
- Use o painel do Vercel para configurar variáveis de produção
- Prefixe variáveis do frontend com `VITE_`

### HTTPS

- Todos os deploys do Vercel usam HTTPS automaticamente
- Certificados SSL são renovados automaticamente

## 📞 Suporte

- [Documentação do Vercel](https://vercel.com/docs)
- [Comunidade do Vercel](https://github.com/vercel/vercel/discussions)
- [Status do Vercel](https://vercel-status.com/)

---

**Pronto!** Sua aplicação POP Manager está agora rodando no Vercel com todas as funcionalidades disponíveis globalmente. 🎉