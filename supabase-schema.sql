-- ============================================================
-- SCHEMA DO BANCO — Edital Verticalizado PCPR 2026
-- Cole este script inteiro no SQL Editor do Supabase e clique em "Run"
-- ============================================================

create table if not exists public.progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  item_id text not null,
  estudei boolean default false,
  estudei_date date,
  rev1_done boolean default false,
  rev1_date date,
  rev2_done boolean default false,
  rev2_date date,
  rev3_done boolean default false,
  rev3_date date,
  questoes_total integer default 0,
  incidencia text default '',
  updated_at timestamp with time zone default now(),
  unique (user_id, item_id)
);

-- Se a tabela já existia antes desta atualização, adiciona a coluna nova sem apagar dados:
alter table public.progress add column if not exists incidencia text default '';

-- Ativa a segurança de linha (cada usuário só acessa seus próprios dados)
alter table public.progress enable row level security;

drop policy if exists "Usuário vê seu próprio progresso" on public.progress;
create policy "Usuário vê seu próprio progresso"
  on public.progress for select
  using (auth.uid() = user_id);

drop policy if exists "Usuário insere seu próprio progresso" on public.progress;
create policy "Usuário insere seu próprio progresso"
  on public.progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuário atualiza seu próprio progresso" on public.progress;
create policy "Usuário atualiza seu próprio progresso"
  on public.progress for update
  using (auth.uid() = user_id);

drop policy if exists "Usuário apaga seu próprio progresso" on public.progress;
create policy "Usuário apaga seu próprio progresso"
  on public.progress for delete
  using (auth.uid() = user_id);

-- Atualiza automaticamente o campo updated_at a cada gravação
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists progress_set_updated_at on public.progress;
create trigger progress_set_updated_at
  before update on public.progress
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- PAINEL ADMINISTRATIVO
-- ============================================================

-- Tabela de perfis (espelha nome/e-mail de auth.users para poder listar candidatos)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Usuário vê seu próprio perfil" on public.profiles;
create policy "Usuário vê seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- Cria/atualiza o perfil automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Preenche perfis de usuários que já existiam antes deste script
insert into public.profiles (id, email, full_name)
select id, email, coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do update set email = excluded.email;

-- Tabela de administradores (quem está aqui pode ver o progresso de todo mundo)
create table if not exists public.admins (
  user_id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamp with time zone default now()
);

alter table public.admins enable row level security;

drop policy if exists "Usuário verifica se é admin" on public.admins;
create policy "Usuário verifica se é admin"
  on public.admins for select
  using (auth.uid() = user_id);

-- Admins podem ver o perfil de todos os candidatos
drop policy if exists "Admin vê todos os perfis" on public.profiles;
create policy "Admin vê todos os perfis"
  on public.profiles for select
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Admins podem ver o progresso de todos os candidatos
drop policy if exists "Admin vê todo o progresso" on public.progress;
create policy "Admin vê todo o progresso"
  on public.progress for select
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Admins podem apagar o progresso de um candidato (botão "resetar" no painel)
drop policy if exists "Admin apaga progresso de qualquer usuário" on public.progress;
create policy "Admin apaga progresso de qualquer usuário"
  on public.progress for delete
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- ⚠️ Depois de rodar este script, transforme SEU usuário em admin.
-- Troque o e-mail abaixo pelo seu e faça login pelo menos uma vez antes de rodar:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'seu-email@exemplo.com'
-- on conflict do nothing;

-- ============================================================
-- CONFIGURAÇÕES GERAIS (título da página + brasão da instituição)
-- Editáveis pelo painel administrativo
-- ============================================================

create table if not exists public.app_settings (
  id smallint primary key default 1,
  hero_title text default 'Agente de Polícia Judiciária · PCPR 2026',
  hero_image_url text,
  updated_at timestamp with time zone default now(),
  constraint app_settings_singleton check (id = 1)
);

insert into public.app_settings (id) values (1) on conflict (id) do nothing;

alter table public.app_settings enable row level security;

-- Qualquer usuário logado pode ler (precisa aparecer pra todo mundo)
drop policy if exists "Usuários logados leem as configurações" on public.app_settings;
create policy "Usuários logados leem as configurações"
  on public.app_settings for select
  using (auth.role() = 'authenticated');

-- Só admin pode alterar
drop policy if exists "Admin atualiza as configurações" on public.app_settings;
create policy "Admin atualiza as configurações"
  on public.app_settings for update
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute procedure public.set_updated_at();

-- Bucket público para o brasão da instituição
insert into storage.buckets (id, name, public)
values ('brasoes', 'brasoes', true)
on conflict (id) do nothing;

-- Só admin pode enviar/atualizar/apagar arquivos nesse bucket
drop policy if exists "Admin envia brasão" on storage.objects;
create policy "Admin envia brasão"
  on storage.objects for insert
  with check (bucket_id = 'brasoes' and exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "Admin atualiza brasão" on storage.objects;
create policy "Admin atualiza brasão"
  on storage.objects for update
  using (bucket_id = 'brasoes' and exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "Admin apaga brasão" on storage.objects;
create policy "Admin apaga brasão"
  on storage.objects for delete
  using (bucket_id = 'brasoes' and exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Leitura do arquivo é pública (o bucket já é público, isso é só reforço)
drop policy if exists "Qualquer um vê o brasão" on storage.objects;
create policy "Qualquer um vê o brasão"
  on storage.objects for select
  using (bucket_id = 'brasoes');
