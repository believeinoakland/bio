// R33 (T51 CR-17; K4120; amends R19): `handling.on_own` is a boolean each descriptor states, never read from `recipient`'s words.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../src/handler.mjs';
import { PROVIDERS, providerById } from '../src/providers/catalogue.mjs';
import { validateDescriptor } from '../src/providers/descriptor.mjs';
import { depsWith } from './helpers.mjs';

// The tools that run on the organization's own server or service, by the recipient their descriptor names in English
// ("the organization's own …", or a vendor with "(the organization's own …)").
const OWN = ['metadefender-core', 'defender-storage', 'splunk-hec', 'sentinel', 'google-secops', 'elastic'];

test('R33 every catalogue descriptor states on_own as a boolean, true exactly for the self-run tools whose recipient names the organization\'s own server or service', () => {
  assert.ok(PROVIDERS.length >= 20);
  for (const d of PROVIDERS) {
    assert.equal(typeof d.handling.on_own, 'boolean', d.provider_id);
    assert.equal(d.handling.on_own, OWN.includes(d.provider_id), d.provider_id);
    // what the recipient's English names agrees with it (the check the statement replaces on the screen's side)
    assert.equal(/^the organization\b|\(the organization's own [^)]+\)$/.test(d.handling.recipient), d.handling.on_own, d.provider_id);
  }
});

test('R33 control: a descriptor whose handling lacks on_own, or holds it as anything but a boolean, is refused DESCRIPTOR_MALFORMED naming handling.on_own', () => {
  const base = providerById('metadefender-core');
  assert.deepEqual(validateDescriptor(base), { ok: true });
  const { on_own, ...without } = base.handling;
  assert.equal(on_own, true);
  assert.deepEqual(validateDescriptor({ ...base, handling: without }), { ok: false, code: 'DESCRIPTOR_MALFORMED', field: 'handling.on_own' });
  for (const v of ['true', 1, null, undefined]) {
    assert.deepEqual(validateDescriptor({ ...base, handling: { ...base.handling, on_own: v } }), { ok: false, code: 'DESCRIPTOR_MALFORMED', field: 'handling.on_own' }, String(v));
  }
  assert.deepEqual(validateDescriptor({ ...base, handling: { ...base.handling, on_own: false } }), { ok: true });
});

test('R33 GET /providers serves on_own, a boolean, for each offered descriptor', async () => {
  const a = await (await handle(new Request('https://file-scanner/providers'), depsWith())).json();
  assert.equal(a.offered.length, PROVIDERS.length);
  for (const d of a.offered) assert.equal(d.handling.on_own, OWN.includes(d.provider_id), d.provider_id);
});
