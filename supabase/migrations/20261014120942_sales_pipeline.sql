begin;

alter table public.clients add constraint clients_id_profile_unique unique (id, profile_id);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  contact_id uuid not null,
  source_submission_id uuid,
  title text not null check (length(btrim(title)) between 1 and 160),
  stage text not null default 'new' check (stage in ('new', 'conversation', 'proposal', 'won', 'lost')),
  origin text not null default 'manual' check (origin in ('manual', 'form', 'referral', 'whatsapp', 'other')),
  amount_cents integer check (amount_cents between 0 and 100000000),
  next_step text not null default '' check (length(next_step) <= 200),
  next_date date,
  lost_reason text not null default '' check (length(lost_reason) <= 500),
  notes text not null default '' check (length(notes) <= 5000),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((btrim(next_step) = '' and next_date is null) or (btrim(next_step) <> '' and next_date is not null)),
  check (stage <> 'lost' or length(btrim(lost_reason)) > 0),
  foreign key (contact_id, profile_id) references public.contacts(id, profile_id),
  foreign key (source_submission_id, profile_id) references public.clients(id, profile_id) on delete set null (source_submission_id),
  unique (source_submission_id)
);
create index opportunities_profile_stage_idx on public.opportunities(profile_id, stage, updated_at desc, id);
create index opportunities_contact_idx on public.opportunities(contact_id, profile_id);
create index opportunities_next_date_idx on public.opportunities(profile_id, next_date) where stage in ('new', 'conversation', 'proposal');
alter table public.opportunities enable row level security;
create policy opportunities_owner on public.opportunities for all to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
grant select, insert, update, delete on public.opportunities to authenticated;

create function public.touch_opportunity() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  new.version = old.version + 1;
  return new;
end;
$$;
create trigger opportunities_updated before update on public.opportunities
  for each row execute function public.touch_opportunity();

-- Explicit user action: never infer identity from an email address.
-- The row lock and unique source prevent duplicate contacts on retries.
create function public.opportunity_from_submission(submission_id uuid, existing_contact_id uuid default null)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  submission public.clients%rowtype;
  chosen_contact uuid;
  result_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into submission from public.clients
    where id = submission_id and profile_id = auth.uid() for update;
  if not found then raise exception 'Submission unavailable'; end if;
  select id into result_id from public.opportunities where source_submission_id = submission.id and profile_id = auth.uid();
  if result_id is not null then return result_id; end if;
  if submission.contact_id is not null and existing_contact_id is not null and submission.contact_id <> existing_contact_id then
    raise exception 'Submission already belongs to another contact';
  end if;
  chosen_contact = coalesce(submission.contact_id, existing_contact_id);
  if chosen_contact is not null then
    perform 1 from public.contacts where id = chosen_contact and profile_id = auth.uid();
    if not found then raise exception 'Contact unavailable'; end if;
  else
    insert into public.contacts(profile_id, name, email, phone)
      values (auth.uid(), left(submission.name, 160), left(submission.email, 254), left(submission.phone, 40))
      returning id into chosen_contact;
  end if;
  insert into public.opportunities(profile_id, contact_id, source_submission_id, title, origin, next_step, next_date)
    values (auth.uid(), chosen_contact, submission.id, 'Atendimento de ' || left(submission.name, 140), 'form',
      'Fazer primeiro contato', (now() at time zone 'America/Sao_Paulo')::date)
    returning id into result_id;
  update public.clients set contact_id = chosen_contact where id = submission.id and profile_id = auth.uid();
  return result_id;
end;
$$;
revoke all on function public.opportunity_from_submission(uuid, uuid) from public, anon;
grant execute on function public.opportunity_from_submission(uuid, uuid) to authenticated;
commit;
