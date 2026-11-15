# SDD — ponto-app

> Selo 🟡 PLANEJADO. Gerado por /reversa-new (modo expresso). Score: 78/100 (aprovado, acima do limite de 60).

## Componente
Aplicação web única (Next.js) cobrindo tela de funcionário e tela de gestor, com Supabase como backend (Postgres + Auth).

## Modelo de dados (Supabase/Postgres)

```sql
-- profiles: um registro por usuário autenticado
create table profiles (
  id uuid primary key references auth.users(id),
  full_name text not null,
  role text not null check (role in ('funcionario', 'gestor')),
  created_at timestamptz not null default now()
);

-- clock_events: cada batida de ponto
create table clock_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  event_type text not null check (event_type in ('entrada', 'saida_almoco', 'volta_almoco', 'saida_final', 'hora_extra_inicio', 'hora_extra_fim')),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- absence_justifications: justificativa de falta
create table absence_justifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  date date not null,
  reason text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);
```

RLS (Row Level Security): `profiles` e `clock_events` — um funcionário só lê/escreve as próprias linhas (`auth.uid() = user_id`); gestor (via `role = 'gestor'` no próprio `profiles`) lê todas as linhas. `absence_justifications` segue a mesma regra de leitura; escrita permitida pro próprio funcionário ou pelo gestor.

## Páginas / rotas (Next.js App Router)

- `/login` — login via Supabase Auth (e-mail/senha).
- `/` (funcionário) — mostra o próximo evento esperado do dia e um botão único; lista o histórico dos últimos dias.
- `/gestor` — lista de funcionários com status do dia atual; clique abre `/gestor/[userId]` com histórico detalhado.
- `/gestor/[userId]` — histórico de um funcionário específico.
- Redirecionamento por `role`: funcionário cai em `/`, gestor em `/gestor`.

## Lógica de "próximo evento esperado"
Dado os eventos já registrados hoje para o usuário, calcular o próximo esperado na sequência `entrada → saida_almoco → volta_almoco → saida_final`. Hora extra é um par independente (`hora_extra_inicio`/`hora_extra_fim`) que pode ser disparado a qualquer momento após `saida_final`.

## Fora do componente (ver PRD, Escopo out)
Integração Google Agenda, folha de pagamento, edição manual de registro pelo gestor, multi-gestor.

## Riscos / gaps corrigidos (ciclo de score)
- Iteração 1 (score 58): faltava modelo de RLS explícito — corrigido.
- Iteração 2 (score 78): faltava lógica de "próximo evento" — corrigido. Aprovado sem nova iteração.
