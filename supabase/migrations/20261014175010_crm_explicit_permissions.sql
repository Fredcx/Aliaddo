begin;
-- Supabase projects may grant broad default privileges to API roles.
-- RLS protects rows; explicit grants also exclude anonymous discovery and TRUNCATE.
revoke all on public.contacts, public.client_tasks, public.opportunities from public, anon, authenticated;
grant select, insert, update, delete on public.contacts, public.client_tasks, public.opportunities to authenticated;
commit;
