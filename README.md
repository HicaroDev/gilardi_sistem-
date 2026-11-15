# Ponto Eletrônico

Sistema de ponto eletrônico online (MVP) — substitui a planilha de Excel. Construído com **Next.js (App Router) + TypeScript** no frontend e **Supabase (Postgres + Auth)** no backend, com deploy na **Vercel**.

## Stack

- Next.js 14 (App Router, TypeScript)
- Supabase JS + Supabase SSR (Auth + Postgres + RLS)
- Tailwind CSS
- Deploy: Vercel

## Estrutura de pastas

```
supabase/
  migrations/
    001_initial.sql          # profiles, clock_events, absence_justifications + RLS
src/
  app/
    layout.tsx               # Root layout + metadata
    page.tsx                 # /  (funcionário: próximo evento + botão + histórico)
    login/
      page.tsx               # /login (e-mail/senha via Supabase Auth)
    gestor/
      page.tsx               # /gestor (lista de funcionários + status do dia)
      [userId]/
        page.tsx             # /gestor/[userId] (histórico detalhado + justificativas)
    hora-extra/
      page.tsx               # registro de hora extra (início/fim)
    justificativa/
      page.tsx               # justificativa de falta (texto livre)
    actions.ts               # Server Actions (registro de ponto, justificativa)
  components/
    ClockButton.tsx          # botão único do próximo evento esperado
    EventHistory.tsx         # agrupamento de batidas por dia
    ui/button.tsx            # botão base
  lib/
    supabase/
      server.ts              # cliente Supabase (Server Components)
      browser.ts             # cliente Supabase (client components)
      client.ts              # cliente supabase-js direto
  middleware.ts              # proteção de rotas + redirecionamento por role
  types/
    supabase.ts              # tipos TypeScript gerados do schema
.env.example                 # variáveis de ambiente (copiar para .env.local)
```

## Requisitos funcionais (MVP)

1. Login (e-mail/senha via Supabase Auth) com redirecionamento por `role`.
2. Funcionário vê o próximo evento esperado do dia e registra com um clique (hora vem do servidor).
3. Funcionário vê histórico dos próprios dias/eventos.
4. Funcionário registra hora extra (início/fim) e justificativa de falta.
5. Gestor vê lista de funcionários com status do dia atual.
6. Gestor abre histórico detalhado de um funcionário específico.
7. RLS no Supabase garantindo isolamento de dados por usuário.
8. Deploy em Vercel.

## Modelagem de dados

Tabelas criadas pela migration `supabase/migrations/001_initial.sql`:

- `profiles` — um registro por usuário autenticado (`id`, `full_name`, `role: funcionario | gestor`).
- `clock_events` — cada batida de ponto (`event_type: entrada | saida_almoco | volta_almoco | saida_final | hora_extra_inicio | hora_extra_fim`, `occurred_at` do servidor).
- `absence_justifications` — justificativa de falta (`date`, `reason`, `created_by`).

RLS: funcionário lê/escreve só as próprias linhas (`auth.uid() = user_id`); gestor lê todas (via `role = 'gestor'`). Um trigger cria o perfil automaticamente ao cadastrar usuário no `auth.users`.

## Setup local

1. Instale dependências:

```bash
npm install
```

2. Copie o arquivo de ambiente e preencha com os valores do seu projeto Supabase:

```bash
cp .env.example .env.local
```

Preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-do-supabase
```

3. Execute a migration no Supabase (via SQL Editor do painel Supabase ou Supabase CLI):

```sql
-- cole o conteúdo de supabase/migrations/001_initial.sql
```

4. Rode o projeto em desenvolvimento:

```bash
npm run dev
```

Abra `http://localhost:3000`.

5. (Primeiro acesso) Cadastre um usuário em **Authentication > Users** no painel Supabase, defina e-mail/senha, e adicione metadata `full_name`. O perfil será criado automaticamente pelo trigger. Para promover a gestor, atualize o `role` na tabela `profiles` para `gestor`.

## Deploy na Vercel

1. Faça push do código para um repositório GitHub.
2. No Vercel, importe o repositório.
3. Adicione as variáveis de ambiente em **Settings > Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-do-supabase
```

4. Conecte o projeto ao Supabase e execute a migration `supabase/migrations/001_initial.sql` no SQL Editor.
5. Faça o deploy. A aplicação estará disponível na URL gerada pela Vercel.

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run start    # iniciar servidor de produção
npm run lint     # lint
```

## LGPD / privacidade

Dados de ponto são dados pessoais e trabalhistas. O MVP armazena apenas o estritamente necessário (e-mail, nome, horários de batida, justificativa de falta) e controla acesso por RLS: funcionário vê só o próprio histórico; gestor vê todos. Uma análise formal de LGPD fica para iteração posterior.

## Escopo fora do MVP

Folha de pagamento, integração com Google Agenda, aprovação/edição manual de registros pelo gestor, multi-empresa / múltiplos gestores.
