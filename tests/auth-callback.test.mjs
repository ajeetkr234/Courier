import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('landing page never passes Supabase auth fragments to querySelector', () => {
  const source = readFileSync(new URL('../src/features/landing/LandingPage.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /document\.querySelector\(hash\)/);
  assert.match(source, /document\.getElementById\(anchorId\)/);
  assert.match(source, /\^#\[A-Za-z\]/);
});
