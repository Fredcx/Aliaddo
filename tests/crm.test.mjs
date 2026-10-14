import test from 'node:test';
import assert from 'node:assert/strict';
import { parseContact, parseTask, todayInBrazil, searchTerm, pageNumber, isStage, isUUID, formatDueDate } from '../src/lib/crm.ts';

function form(values) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

test('a contact can exist before an intake and without an email or phone', () => {
  assert.deepEqual(parseContact(form({ name: '  Maria Silva ' })), {
    name: 'Maria Silva', email: null, phone: null, notes: '', stage: 'lead',
  });
});

test('normalizes email and ignores ownership fields from a tampered form', () => {
  assert.deepEqual(parseContact(form({ name: 'Ana', email: ' ANA@EXAMPLE.COM ', profile_id: 'another-user', id: 'other' })), {
    name: 'Ana', email: 'ana@example.com', phone: null, notes: '', stage: 'lead',
  });
});

test('rejects blank names, invalid email, oversized notes and unknown stages', () => {
  for (const values of [{ name: ' ' }, { name: 'Ana', email: 'broken' }, { name: 'Ana', notes: 'x'.repeat(10001) }, { name: 'Ana', stage: 'admin' }, { name: 'Ana', stage: 'toString' }]) {
    assert.throws(() => parseContact(form(values)));
  }
});

test('file payloads cannot be coerced into contact fields', () => {
  const data = form({ name: 'Ana' });
  data.set('notes', new Blob(['not text']));
  assert.throws(() => parseContact(data), /inválido/);
});

test('calendar tasks reject impossible dates but allow overdue follow-ups', () => {
  assert.deepEqual(parseTask(form({ title: ' Retornar ', due_date: '2024-02-29' })), { title: 'Retornar', due_date: '2024-02-29' });
  for (const due_date of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-1-2', '', 'invalid']) {
    assert.throws(() => parseTask(form({ title: 'Retornar', due_date })));
  }
  assert.throws(() => parseTask(form({ title: ' ', due_date: '2026-10-13' })));
});

test('returns do not move a day early at the UTC date boundary', () => {
  assert.equal(todayInBrazil(new Date('2026-10-14T01:00:00Z')), '2026-10-13');
  assert.equal(todayInBrazil(new Date('2026-10-14T03:00:00Z')), '2026-10-14');
  assert.equal(formatDueDate('2026-10-13'), '13/10/2026');
});

test('search preserves Portuguese names while removing filter operators', () => {
  assert.equal(searchTerm('João D’Ávila'), 'João D Ávila');
  assert.equal(searchTerm('ana@example.com'), 'ana@example.com');
  assert.ok(!/[%,()*_]/.test(searchTerm('%),profile_id.neq.anything,(name.ilike.*')));
  assert.equal(searchTerm('a'.repeat(150)).length, 100);
  assert.equal(searchTerm(['repeated', 'query']), '');
});

test('validates identifiers, stages and pagination', () => {
  for (const value of [undefined, '-1', 'Infinity', '1.5', 'nope']) assert.equal(pageNumber(value), 1);
  assert.equal(pageNumber('2'), 2);
  assert.equal(isStage('__proto__'), false);
  assert.equal(isStage('active'), true);
  assert.equal(isUUID('11111111-1111-4111-8111-111111111111'), true);
  assert.equal(isUUID('123'), false);
});
