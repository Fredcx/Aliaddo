-- 1. Cria a tabela 'forms' para permitir múltiplos formulários
create table if not exists public.forms (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Meu Formulário',
  slug text not null,
  intro_text text default 'Olá, este é o seu planejamento personalizado.',
  rules_text text default '{}',
  structure_text text default '',
  outro_text text default 'Obrigado por confiar em nosso trabalho.',
  primary_color text default '#0071E3',
  form_cover_image_url text,
  form_fields jsonb default '[
    {"id": "name", "label": "Seu Nome Completo", "type": "text", "required": true, "placeholder": "Ex: João Silva"},
    {"id": "email", "label": "Seu Melhor E-mail", "type": "email", "required": true, "placeholder": "joao@empresa.com"},
    {"id": "challenge", "label": "Qual seu maior desafio hoje?", "type": "textarea", "required": true, "placeholder": "Descreva o problema que você está enfrentando..."},
    {"id": "goal", "label": "Qual seu objetivo principal?", "type": "textarea", "required": true, "placeholder": "Onde você quer chegar resolvendo esse problema?"}
  ]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(profile_id, slug)
);

-- Ativar segurança para a tabela forms
alter table public.forms enable row level security;
create policy "Users can view own forms" on forms for select using (auth.uid() = profile_id);
create policy "Anyone can view form by slug" on forms for select using (true);
create policy "Users can update own forms" on forms for update using (auth.uid() = profile_id);
create policy "Users can insert own forms" on forms for insert with check (auth.uid() = profile_id);
create policy "Users can delete own forms" on forms for delete using (auth.uid() = profile_id);

-- 2. Migrar os dados antigos da tabela 'settings' para a nova tabela 'forms'
-- Assim não perdemos o formulário atual! Ele vai virar o "Formulário Padrão"
insert into public.forms (profile_id, title, slug, intro_text, rules_text, structure_text, outro_text, primary_color, form_cover_image_url, form_fields)
select 
  profile_id, 
  'Formulário Padrão', 
  'padrao', 
  intro_text, 
  rules_text, 
  structure_text, 
  outro_text, 
  primary_color, 
  form_cover_image_url, 
  form_fields
from public.settings
on conflict do nothing;

-- 3. Conectar a tabela 'clients' aos novos formulários
alter table public.clients add column form_id uuid references public.forms(id) on delete cascade;

-- Atualizar os clientes antigos para ficarem vinculados ao "Formulário Padrão" recém-migrado
update public.clients c
set form_id = f.id
from public.forms f
where c.profile_id = f.profile_id and f.slug = 'padrao';
