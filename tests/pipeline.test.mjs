import test from 'node:test';
import assert from 'node:assert/strict';
import { parseOpportunity, nextSalesStage, currency, isSalesStage } from '../src/lib/pipeline.ts';
function form(values) { const data = new FormData(); for (const [key, value] of Object.entries(values)) data.set(key, value); return data; }

test('opportunities support services without a price or scheduled follow-up', () => {
  const result = parseOpportunity(form({ title: ' Consultoria inicial ' }));
  assert.equal(result.title, 'Consultoria inicial'); assert.equal(result.amount_cents, null);
  assert.equal(result.next_date, null); assert.equal(result.stage, 'new');
});
test('money is stored as integer cents; ambiguous and negative values are rejected', () => {
  for (const value of ['1500,01', '1500.01']) assert.equal(parseOpportunity(form({ title: 'Serviço', amount: value })).amount_cents, 150001);
  assert.equal(parseOpportunity(form({ title: 'Serviço', amount: '0' })).amount_cents, 0);
  for (const amount of ['-5', '1.500,00', '1e4', 'NaN', '1.999', '1000000.01']) assert.throws(() => parseOpportunity(form({ title: 'Serviço', amount })));
  assert.match(currency(null), /combinar/);
});
test('a follow-up needs both an action and a real calendar date', () => {
  for (const fields of [{ next_step: 'Retornar' }, { next_date: '2026-10-14' }, { next_step: 'Retornar', next_date: '2026-02-30' }]) assert.throws(() => parseOpportunity(form({ title: 'Serviço', ...fields })));
  assert.equal(parseOpportunity(form({ title: 'Serviço', next_step: 'Retornar', next_date: '2024-02-29' })).next_date, '2024-02-29');
});
test('closing requires a reason and reopening clears it', () => {
  assert.throws(() => parseOpportunity(form({ title: 'Serviço', stage: 'lost' })));
  assert.equal(parseOpportunity(form({ title: 'Serviço', stage: 'lost', lost_reason: 'Sem interesse' })).lost_reason, 'Sem interesse');
  assert.equal(parseOpportunity(form({ title: 'Serviço', stage: 'new', lost_reason: 'Antigo motivo' })).lost_reason, '');
});
test('rejects invalid stages, origins and injected ownership fields', () => {
  assert.equal(isSalesStage('__proto__'), false);
  for (const fields of [{ stage: 'toString' }, { origin: '__proto__' }, { title: 'x'.repeat(161) }]) assert.throws(() => parseOpportunity(form({ title: 'Serviço', ...fields })));
  assert.equal(Object.hasOwn(parseOpportunity(form({ title: 'Serviço', profile_id: 'other' })), 'profile_id'), false);
  assert.equal(nextSalesStage('proposal'), 'won'); assert.equal(nextSalesStage('won'), null);
});
