# RunJourney 🏃

Aplicação web para gestão e acompanhamento de treinos de corrida. Dashboard visual, gamificação, gráficos de evolução e calendário de treinos.

## Stack

- **Next.js 15** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS** + Shadcn UI
- **Recharts** (gráficos)
- **Framer Motion** (animações)
- **Prisma ORM** + PostgreSQL (Supabase)
- **JWT** em cookie HTTP Only

## Funcionalidades

- Dashboard com progresso do plano, próximo treino, consistência e XP
- CRUD de planos de treino (um ativo por vez)
- CRUD de treinos com 5 tipos (leve, intervalado, longão, tiros, recuperação)
- Conclusão de treino com cálculo automático de pace e aderência
- Gráficos: distância, pace, peso e longões
- Calendário mensal com cores por status
- Gamificação: XP, níveis e 9 conquistas
- Insights automáticos de progresso
- Autenticação simples (usuário/senha por env)

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (PostgreSQL gratuito)

## Configuração Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite `.env` com seus valores (veja `.env.example`):

```env
# Transaction pooler (app / Vercel) — porta 6543
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[SENHA]@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session pooler (migrations) — porta 5432
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[SENHA]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

APP_USERNAME="admin"
APP_PASSWORD="sua-senha-secreta"
JWT_SECRET="chave-secreta-com-minimo-32-caracteres-aleatorios"
```

**Onde obter a senha:** [Dashboard Supabase](https://supabase.com/dashboard/project/jayiwdclpnvoriegagfz) → **Project Settings** → **Database** → Connection string, ou **Reset database password** se não lembrar.

### 3. Configurar banco de dados

```bash
npx prisma db push
npm run db:seed
```

### 4. Executar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e faça login com as credenciais do `.env`.

## Supabase — Configuração do Banco

Projeto já criado: **RunJourney** (`jayiwdclpnvoriegagfz`, São Paulo).

### Obter connection strings

1. Acesse [Dashboard → RunJourney → Connect](https://supabase.com/dashboard/project/jayiwdclpnvoriegagfz/settings/database)
2. Em **Connection string**, escolha **URI**
3. Use duas URLs:
   - **Transaction pooler** (porta `6543`) → `DATABASE_URL`
   - **Session pooler** (porta `5432`) → `DIRECT_URL`
4. Substitua `[YOUR-PASSWORD]` pela senha do banco

### Vincular CLI (opcional)

```bash
supabase link --project-ref jayiwdclpnvoriegagfz
```

### Sincronizar schema

```bash
npx prisma db push
npm run db:seed
```

## Deploy na Vercel

1. Importe o repositório na [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente:
   - `DATABASE_URL` (Transaction pooler, porta 6543)
   - `DIRECT_URL` (Session pooler, porta 5432)
   - `APP_USERNAME`
   - `APP_PASSWORD`
   - `JWT_SECRET`
3. Deploy

### Seed em produção

```bash
npm run db:seed
```

Ou use o Prisma Studio:

```bash
npm run db:studio
```

## Estrutura do Projeto

```
src/
├── actions/          # Server Actions (auth, planos, treinos)
├── app/              # Rotas (App Router)
│   ├── (app)/        # Rotas protegidas
│   └── login/        # Tela de login
├── components/       # Componentes React
│   ├── charts/       # Gráficos Recharts
│   ├── dashboard/    # Cards do dashboard
│   ├── calendar/     # Calendário de treinos
│   ├── layout/       # Shell e sidebar
│   ├── plans/        # Formulários de planos/treinos
│   └── ui/           # Shadcn UI
├── lib/              # Utilitários, auth, db, constants
├── repositories/     # Acesso ao banco (Prisma)
├── services/         # Lógica de negócio
└── middleware.ts     # Proteção de rotas JWT
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run db:push` | Sincronizar schema com banco |
| `npm run db:seed` | Criar plano Meia Maratona 2026 (sem dados fictícios) |
| `npm run db:studio` | Abrir Prisma Studio |

## Gamificação

### XP por tipo de treino

| Tipo | XP |
|------|-----|
| Recuperação | 5 |
| Corrida leve | 10 |
| Intervalado | 20 |
| Tiros | 25 |
| Longão | 30 |

### Conquistas

- Primeira corrida
- 5 / 10 / 25 treinos concluídos
- 50km / 100km acumulados
- Primeiro longão
- Primeiro 10km
- Primeira meia maratona

## Licença

Uso pessoal.
