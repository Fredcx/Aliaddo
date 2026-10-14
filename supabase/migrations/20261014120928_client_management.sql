-- Additive migration: existing clients are form submissions, not unique people.
-- Apply after the existing setup scripts. No historical records are merged.
begin;

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 160),
  email text check (email is null or length(email) <= 254),
  phone text check (phone is null or length(phone) <= 40),
  stage text not null default 'lead' check (stage in ('lead', 'active', 'paused', 'archived')),
  notes text not null default '' check (length(notes) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, profile_id)
);

create index contacts_profile_name_idx on public.contacts(profile_id, name, id);
-- Deliberately not unique: families and companies may share an email address.
create index contacts_profile_email_idx on public.contacts(profile_id, lower(email));

alter table public.contacts enable row level security;
create policy contacts_owner on public.contacts for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
grant select, insert, update, delete on public.contacts to authenticated;

alter table public.clients add column contact_id uuid;
alter table public.clients add constraint clients_contact_owner_fk
  foreign key (contact_id, profile_id) references public.contacts(id, profile_id);
create index clients_contact_idx on public.clients(profile_id, contact_id, created_at desc);

create table public.client_tasks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  contact_id uuid not null,
  title text not null check (length(btrim(title)) between 1 and 200),
  due_date date not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (contact_id, profile_id) references public.contacts(id, profile_id) on delete cascade
);
create index client_tasks_pending_idx on public.client_tasks(profile_id, due_date, id)
  where completed_at is null;
create index client_tasks_contact_idx on public.client_tasks(contact_id);
alter table public.client_tasks enable row level security;
create policy client_tasks_owner on public.client_tasks for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
grant select, insert, update, delete on public.client_tasks to authenticated;

create function public.touch_contact_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger contacts_updated_at before update on public.contacts
  for each row execute function public.touch_contact_updated_at();

commit;
