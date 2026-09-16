import test from 'node:test';
import assert from 'node:assert/strict';
import { readDisplayMode, saveDisplayMode, displayModeKey } from '../src/display-preference.js';

test('display preference defaults to standard, persists both modes, and rejects unknown values', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.equal(readDisplayMode(storage), 'standard');
  assert.equal(saveDisplayMode(storage, 'child'), true);
  assert.equal(values.get(displayModeKey), 'child');
  assert.equal(readDisplayMode(storage), 'child');
  saveDisplayMode(storage, 'standard');
  assert.equal(readDisplayMode(storage), 'standard');
  values.set(displayModeKey, 'bad-data');
  assert.equal(readDisplayMode(storage), 'standard');
});

test('blocked or absent localStorage does not break the viewer', () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
  for (const storage of [undefined, blocked]) {
    assert.equal(readDisplayMode(storage), 'standard');
    assert.equal(saveDisplayMode(storage, 'child'), false);
  }
});
