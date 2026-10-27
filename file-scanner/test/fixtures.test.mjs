// The fixtures this module publishes (fixtures.mjs) answer as the real code does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reputationRefresh } from './fixtures.mjs';
import { THREATS } from '../src/providers/reputation.mjs';
import { NOW } from './helpers.mjs';

test('R26 reputationRefresh gives the real failed refresh answer: a bad checksum names its threat list, an unreadable list names LIST_UNREADABLE, both keep the last good list', async () => {
  const good = new Date(NOW).toISOString();
  const bad = await reputationRefresh('checksum');
  assert.deepEqual(Object.keys(bad), ['ok', 'list_version', 'fetched_at', 'error']);
  assert.equal(bad.ok, false);
  assert.match(bad.list_version, /^[0-9a-f]{16}$/);
  assert.equal(bad.fetched_at, good);
  assert.equal(bad.error, `LIST_CHECKSUM_MISMATCH:${THREATS[0]}`);
  const unreadable = await reputationRefresh('unreadable');
  assert.deepEqual([unreadable.ok, unreadable.list_version, unreadable.fetched_at, unreadable.error], [false, bad.list_version, good, 'LIST_UNREADABLE']);
  assert.deepEqual(await reputationRefresh('checksum', { prior: false }),
    { ok: false, list_version: null, fetched_at: null, error: `LIST_CHECKSUM_MISMATCH:${THREATS[0]}` });
  await assert.rejects(() => reputationRefresh('nothing'), /no failure named/);
});
