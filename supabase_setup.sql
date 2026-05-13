-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (Consultants/Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  niche text,
  company_name text,
  username text unique, -- For the public form URL /f/[username]
  primary_color text default '#0071E3',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Anyone can view profile by username" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger to create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, niche, username)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'niche',
    coalesce(
      regexp_replace(lower(split_part(new.email, '@', 1)), '[^a-z0-9]+', '-', 'g') || '-' || substr(new.id::text, 1, 4),
      'user-' || substr(new.id::text, 1, 8)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Settings (Motor IA, Branding & Form Settings per Professional)
create table if not exists public.settings (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  intro_text text default 'Olá, este é o seu planejamento personalizado.',
  rules_text text default 'Seja objetivo e claro. Use tom amigável.',
  structure_text text default 'Siga EXATAMENTE a estrutura de tópicos abaixo, utilizando Markdown:',
  outro_text text default 'Obrigado por confiar em nosso trabalho.',
  primary_color text default '#0071E3',
  form_cover_image_url text,
  form_fields jsonb default '[
    {"id": "name", "label": "Seu Nome Completo", "type": "text", "required": true, "placeholder": "Ex: João Silva"},
    {"id": "email", "label": "Seu Melhor E-mail", "type": "email", "required": true, "placeholder": "joao@empresa.com"},
    {"id": "company", "label": "Nome da Empresa", "type": "text", "required": true, "placeholder": "Ex: Acme Corp"},
    {"id": "challenge", "label": "Qual seu maior desafio hoje?", "type": "textarea", "required": true, "placeholder": "Descreva o problema que você está enfrentando..."},
    {"id": "goal", "label": "Qual seu objetivo principal?", "type": "textarea", "required": true, "placeholder": "Onde você quer chegar resolvendo esse problema?"}
  ]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(profile_id)
);

alter table public.settings enable row level security;
create policy "Users can view own settings" on settings for select using (auth.uid() = profile_id);
create policy "Users can update own settings" on settings for update using (auth.uid() = profile_id);
create policy "Users can insert own settings" on settings for insert with check (auth.uid() = profile_id);

-- 3. Clients (Leads that answered the form)
create table if not exists public.clients (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null, -- The consultant
  name text not null,
  email text not null,
  status text default 'Aguardando' check (status in ('Aguardando', 'Processando', 'Pronto', 'Enviado')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.clients enable row level security;
create policy "Users can view own clients" on clients for select using (auth.uid() = profile_id);
create policy "Users can manage own clients" on clients for all using (auth.uid() = profile_id);

-- 4. Form Responses
create table if not exists public.responses (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  question text not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.responses enable row level security;
-- Consultants can view responses of their clients
create policy "Users can view responses of own clients" on responses for select using (
  exists (
    select 1 from public.clients c
    where c.id = responses.client_id and c.profile_id = auth.uid()
  )
);
create policy "Users can manage responses of own clients" on responses for all using (
  exists (
    select 1 from public.clients c
    where c.id = responses.client_id and c.profile_id = auth.uid()
  )
);

-- 5. Documents (Generated by AI / Gemini)
create table if not exists public.documents (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  content text not null, -- Markdown generated by AI / edited by professional
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(client_id)
);

alter table public.documents enable row level security;
create policy "Users can view documents of own clients" on documents for select using (
  exists (
    select 1 from public.clients c
    where c.id = documents.client_id and c.profile_id = auth.uid()
  )
);

create policy "Users can manage documents of own clients" on documents for all using (
  exists (
    select 1 from public.clients c
    where c.id = documents.client_id and c.profile_id = auth.uid()
  )
);

-- 6. Storage Buckets Setup
insert into storage.buckets (id, name, public) values ('form-covers', 'form-covers', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict (id) do nothing;

create policy "Cover images are publicly accessible." on storage.objects for select using (bucket_id = 'form-covers');
create policy "Users can upload cover images." on storage.objects for insert with check (bucket_id = 'form-covers' and auth.role() = 'authenticated');
create policy "Users can update their own cover images." on storage.objects for update using (bucket_id = 'form-covers' and auth.role() = 'authenticated');
create policy "Users can delete their own cover images." on storage.objects for delete using (bucket_id = 'form-covers' and auth.role() = 'authenticated');

create policy "Logos are publicly accessible." on storage.objects for select using (bucket_id = 'logos');
create policy "Users can upload logos." on storage.objects for insert with check (bucket_id = 'logos' and auth.role() = 'authenticated');
create policy "Users can update their own logos." on storage.objects for update using (bucket_id = 'logos' and auth.role() = 'authenticated');
create policy "Users can delete their own logos." on storage.objects for delete using (bucket_id = 'logos' and auth.role() = 'authenticated');

