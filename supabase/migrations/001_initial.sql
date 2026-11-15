-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- profiles: um registro por usuário autenticado (auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('funcionario', 'gestor')),
  created_at timestamptz not null default now()
);

-- clock_events: cada batida de ponto
create table clock_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_type text not null check (event_type in (
    'entrada',
    'saida_almoco',
    'volta_almoco',
    'saida_final',
    'hora_extra_inicio',
    'hora_extra_fim'
  )),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- absence_justifications: justificativa de falta
create table absence_justifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  reason text not null,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Índices úteis para consultas frequentes
create index idx_clock_events_user_date on clock_events (user_id, occurred_at);
create index idx_clock_events_type on clock_events (event_type);
create index idx_absence_justifications_user_date on absence_justifications (user_id, date);

-- RLS: habilitar
alter table profiles enable row level security;
alter table clock_events enable row level security;
alter table absence_justifications enable row level security;

-- profiles: funcionário lê/escreve próprio perfil; gestor lê todos
create policy "profiles: usuário vê próprio perfil"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: gestor vê todos os perfis"
  on profiles for select
  using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'gestor'
    )
  );

create policy "profiles: usuário insere próprio perfil (signup via trigger)"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles: usuário atualiza próprio perfil"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- clock_events: funcionário lê/escreve próprios eventos; gestor lê todos
create policy "clock_events: usuário vê próprios eventos"
  on clock_events for select
  using (auth.uid() = user_id);

create policy "clock_events: gestor vê todos os eventos"
  on clock_events for select
  using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'gestor'
    )
  );

create policy "clock_events: usuário insere próprios eventos"
  on clock_events for insert
  with check (auth.uid() = user_id);

-- absence_justifications: funcionário lê/escreve próprias justificativas; gestor lê todas, escreve qualquer uma
create policy "absence_justifications: usuário vê próprias justificativas"
  on absence_justifications for select
  using (auth.uid() = user_id);

create policy "absence_justifications: gestor vê todas as justificativas"
  on absence_justifications for select
  using (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'gestor'
    )
  );

create policy "absence_justifications: usuário insere própria justificativa"
  on absence_justifications for insert
  with check (auth.uid() = user_id);

create policy "absence_justifications: gestor insere justificativa para qualquer usuário"
  on absence_justifications for insert
  with check (
    exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'gestor'
    )
  );

-- Trigger para criar perfil automaticamente ao cadastrar usuário no auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, raw_user_meta_data ->> 'full_name', 'funcionario');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
