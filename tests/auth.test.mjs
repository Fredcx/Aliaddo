import test from 'node:test';
import assert from 'node:assert/strict';
import { recoveryEmail, recoveryRedirect, authDestination, newPassword, isPublicAuthRoute } from '../src/lib/auth-validation.ts';

test('recovery validates and normalizes the email without accepting files', () => {
  assert.equal(recoveryEmail(' User@Example.com '), 'user@example.com');
  for (const value of [null, {}, '', 'invalid', 'a@b', 'a b@example.com', 'x'.repeat(255) + '@example.com']) {
    assert.throws(() => recoveryEmail(value));
  }
});

test('email links use the configured site, never a submitted redirect', () => {
  assert.equal(recoveryRedirect('https://aliaddo.vercel.app/'), 'https://aliaddo.vercel.app/auth/callback?next=/reset-password');
  assert.equal(recoveryRedirect('http://localhost:3000/ignored?next=other'), 'http://localhost:3000/auth/callback?next=/reset-password');
  for (const value of [undefined, 'bad-url', 'http://public.example', 'javascript:alert(1)', 'https://user:pass@example.com']) {
    assert.throws(() => recoveryRedirect(value));
  }
});

test('callback permits only home or password reset destinations', () => {
  assert.equal(authDestination('/reset-password'), '/reset-password');
  for (const value of [null, '//evil.example', 'https://evil.example', '/\\evil.example', '/reset-password?next=evil', '/api/seed']) {
    assert.equal(authDestination(value), '/home');
  }
});

test('recovery request and callback are public; password change is protected', () => {
  for (const path of ['/login', '/forgot-password', '/auth/callback']) assert.equal(isPublicAuthRoute(path), true);
  for (const path of ['/reset-password', '/clients', '/login-other', '/auth/callback-other']) assert.equal(isPublicAuthRoute(path), false);
});

test('password validation preserves spaces, requires confirmation, and respects byte limit', () => {
  assert.equal(newPassword(' example pass ', ' example pass '), ' example pass ');
  assert.equal(newPassword('x'.repeat(72), 'x'.repeat(72)), 'x'.repeat(72));
  for (const [password, confirmation] of [['short', 'short'], ['long enough', 'different'], [null, null], ['á'.repeat(37), 'á'.repeat(37)]]) {
    assert.throws(() => newPassword(password, confirmation));
  }
});
