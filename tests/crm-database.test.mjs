import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const owner = '11111111-1111-4111-8111-111111111111';
const outsider = '22222222-2222-4222-8222-222222222222';
const contact = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherContact = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const intake = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const otherIntake = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

async function login(id) {
  await db.exec('reset role; set role authenticated;');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
}

before(async () => {
  // Minimal existing schema, with the same owner policies as supabase_setup.sql.
  await db.exec(`
    create role authenticated;
    create role anon;
    create schema auth;
    grant usage on schema auth, public to authenticated, anon;
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table public.profiles(id uuid primary key);
    create table public.clients (
      id uuid primary key, profile_id uuid not null references public.profiles(id),
      name text not null, email text not null, phone text, status text default 'Aguardando',
      created_at timestamptz not null default now()
    );
    alter table public.clients enable row level security;
    create policy clients_owner on public.clients for all using (profile_id = auth.uid());
    grant select, insert, update, delete on public.clients to authenticated;
    insert into profiles values ('${owner}'), ('${outsider}');
    insert into clients(id, profile_id, name, email) values
      ('${intake}', '${owner}', 'Original response', 'shared@example.com'),
      ('${otherIntake}', '${outsider}', 'Other account', 'shared@example.com');
  `);
  await db.exec(await readFile(new URL('../supabase/migrations/20261014120928_client_management.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/migrations/20261014120942_sales_pipeline.sql', import.meta.url), 'utf8'));
  // Reproduce broad hosted-project defaults, then verify the explicit restriction.
  await db.exec('grant all on contacts, client_tasks, opportunities to anon, authenticated;');
  await db.exec(await readFile(new URL('../supabase/migrations/20261014175010_crm_explicit_permissions.sql', import.meta.url), 'utf8'));
  await db.query('insert into contacts(id, profile_id, name, email) values ($1, $2, $3, $4), ($5, $6, $7, $4)',
    [contact, owner, 'Owner contact', 'shared@example.com', otherContact, outsider, 'Other contact']);
});

beforeEach(async () => { await login(owner); });
after(async () => { await db.close(); });

test('migration preserves existing submissions and never merges shared emails', async () => {
  const { rows } = await db.query('select name, email, contact_id from clients where id = $1', [intake]);
  assert.deepEqual(rows, [{ name: 'Original response', email: 'shared@example.com', contact_id: null }]);
  // A second person using a shared email is permitted even within the same account.
  await db.query('insert into contacts(profile_id, name, email) values ($1, $2, $3)', [owner, 'Family member', 'shared@example.com']);
});

test('RLS isolates reads, updates and inserts between accounts', async () => {
  const { rows } = await db.query('select id from contacts where id = $1', [otherContact]);
  assert.equal(rows.length, 0);
  const changed = await db.query("update contacts set notes = 'tampered' where id = $1 returning id", [otherContact]);
  assert.equal(changed.rows.length, 0);
  await assert.rejects(db.query('insert into contacts(profile_id, name) values ($1, $2)', [outsider, 'Spoofed']), /row-level security/);
  await assert.rejects(db.query('update contacts set profile_id = $1 where id = $2', [outsider, contact]), /row-level security/);
});

test('composite keys reject cross-account submission links and tasks', async () => {
  await assert.rejects(db.query('update clients set contact_id = $1 where id = $2', [otherContact, intake]), /foreign key/);
  await assert.rejects(db.query("insert into client_tasks(profile_id, contact_id, title, due_date) values ($1, $2, 'Return', '2026-10-13')", [owner, otherContact]), /foreign key/);
});

test('link, archive and unlink preserve the original intake', async () => {
  await db.query('update clients set contact_id = $1 where id = $2', [contact, intake]);
  await db.query("update contacts set stage = 'archived' where id = $1", [contact]);
  let result = await db.query('select name, contact_id from clients where id = $1', [intake]);
  assert.equal(result.rows[0].contact_id, contact);
  assert.equal(result.rows[0].name, 'Original response');
  await db.query('update clients set contact_id = null where id = $1', [intake]);
  result = await db.query('select contact_id from clients where id = $1', [intake]);
  assert.equal(result.rows[0].contact_id, null);
});

test('tasks can be completed and reopened; outsiders cannot read or change them', async () => {
  const { rows: [task] } = await db.query("insert into client_tasks(profile_id, contact_id, title, due_date) values ($1, $2, 'Return', '2026-10-13') returning id", [owner, contact]);
  await db.query('update client_tasks set completed_at = now() where id = $1', [task.id]);
  assert.ok((await db.query('select completed_at from client_tasks where id = $1', [task.id])).rows[0].completed_at);
  await login(outsider);
  assert.equal((await db.query('select * from client_tasks where id = $1', [task.id])).rows.length, 0);
  assert.equal((await db.query('update client_tasks set completed_at = null where id = $1 returning id', [task.id])).rows.length, 0);
  await login(owner);
  await db.query('update client_tasks set completed_at = null where id = $1', [task.id]);
  assert.equal((await db.query('select completed_at from client_tasks where id = $1', [task.id])).rows[0].completed_at, null);
});

test('database rejects invalid stages and empty task titles even outside the app', async () => {
  await assert.rejects(db.query("update contacts set stage = 'unknown' where id = $1", [contact]), /check constraint/);
  await assert.rejects(db.query("insert into client_tasks(profile_id, contact_id, title, due_date) values ($1, $2, ' ', '2026-10-13')", [owner, contact]), /check constraint/);
});

test('anonymous users cannot access contacts or follow-ups', async () => {
  await db.exec('reset role; set role anon;');
  await assert.rejects(db.query('select * from contacts'), /permission denied/);
  await assert.rejects(db.query('select * from client_tasks'), /permission denied/);
  await assert.rejects(db.query('select * from opportunities'), /permission denied/);
  await assert.rejects(db.query('select opportunity_from_submission($1, null)', [intake]), /permission denied/);
});

test('API roles cannot truncate management tables even with broad project defaults', async () => {
  for (const table of ['contacts', 'client_tasks', 'opportunities']) {
    const { rows: [permissions] } = await db.query("select has_table_privilege('anon', $1, 'SELECT') as anonymous_read, has_table_privilege('anon', $1, 'TRUNCATE') as anonymous_truncate, has_table_privilege('authenticated', $1, 'TRUNCATE') as signed_in_truncate", [table]);
    assert.deepEqual(permissions, { anonymous_read: false, anonymous_truncate: false, signed_in_truncate: false });
  }
});

test('opportunities enforce owner relationships and reject invalid closures', async () => {
  await assert.rejects(db.query("insert into opportunities(profile_id, contact_id, title) values ($1, $2, 'Wrong owner')", [owner, otherContact]), /foreign key/);
  await assert.rejects(db.query("insert into opportunities(profile_id, contact_id, title, stage) values ($1, $2, 'Incomplete', 'lost')", [owner, contact]), /check constraint/);
  const { rows: [item] } = await db.query("insert into opportunities(profile_id, contact_id, title) values ($1, $2, 'Valid') returning id, version", [owner, contact]);
  assert.equal(item.version, 1);
  await login(outsider);
  assert.equal((await db.query('select id from opportunities where id=$1', [item.id])).rows.length, 0);
  assert.equal((await db.query("update opportunities set stage='won' where id=$1 returning id", [item.id])).rows.length, 0);
  await login(owner);
  await db.query("update opportunities set stage='conversation' where id=$1 and version=1", [item.id]);
  assert.equal((await db.query("update opportunities set stage='proposal' where id=$1 and version=1 returning id", [item.id])).rows.length, 0);
  assert.equal((await db.query('select version from opportunities where id=$1', [item.id])).rows[0].version, 2);
});

test('form conversion is atomic and retrying it does not duplicate contact or opportunity', async () => {
  const beforeCount = (await db.query('select count(*)::int as n from contacts')).rows[0].n;
  const { rows: [result] } = await db.query('select opportunity_from_submission($1, null) as id', [intake]);
  const retry = await db.query('select opportunity_from_submission($1, null) as id', [intake]);
  assert.equal(retry.rows[0].id, result.id);
  assert.equal((await db.query('select count(*)::int as n from contacts')).rows[0].n, beforeCount + 1);
  const converted = (await db.query('select contact_id, origin from opportunities where id=$1', [result.id])).rows[0];
  assert.notEqual(converted.contact_id, contact, 'shared email must not merge people');
  assert.equal(converted.origin, 'form');
  assert.equal((await db.query('select contact_id from clients where id=$1', [intake])).rows[0].contact_id, converted.contact_id);
  await login(outsider);
  await assert.rejects(db.query('select opportunity_from_submission($1, null)', [intake]), /unavailable/);
});

test('conversion to an explicitly chosen contact checks ownership and preserves identity', async () => {
  const submission = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
  await db.query("insert into clients(id,profile_id,name,email) values ($1,$2,'Same person','shared@example.com')", [submission, owner]);
  await assert.rejects(db.query('select opportunity_from_submission($1,$2)', [submission, otherContact]), /unavailable/);
  assert.equal((await db.query('select contact_id from clients where id=$1', [submission])).rows[0].contact_id, null);
  await db.query('select opportunity_from_submission($1,$2)', [submission, contact]);
  assert.equal((await db.query('select contact_id from clients where id=$1', [submission])).rows[0].contact_id, contact);
  await db.query('delete from clients where id=$1', [submission]);
  assert.equal((await db.query('select count(*)::int as n from opportunities where contact_id=$1 and source_submission_id is null', [contact])).rows[0].n, 2);
});
