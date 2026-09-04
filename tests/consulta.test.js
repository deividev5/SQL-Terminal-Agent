// consulta.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { consultaSchema } from '../src/consulta.js';

test('aceita SELECT simples', () => {
  const r = consultaSchema.safeParse({ sql: 'SELECT * FROM access_logs' });
  assert.equal(r.success, true);
});

test('rejeita comandos de escrita', () => {
  const r = consultaSchema.safeParse({ sql: 'DELETE FROM access_logs' });
  assert.equal(r.success, false);
});

test('rejeita múltiplas instruções', () => {
  const r = consultaSchema.safeParse({ sql: 'SELECT 1; SELECT 2' });
  assert.equal(r.success, false);
});

test('rejeita comentários', () => {
  const r = consultaSchema.safeParse({ sql: 'SELECT 1 -- comentário' });
  assert.equal(r.success, false);
});

test('rejeita SQL vazio', () => {
  const r = consultaSchema.safeParse({ sql: '' });
  assert.equal(r.success, false);
});