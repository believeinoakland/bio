// R33 (T51 CR-17; K4120; amends R19): `handling.on_own` is a boolean each descriptor states, never read from `recipient`'s words.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../src/handler.mjs';
import { PROVIDERS, providerById } from '../src/providers/catalogue.mjs';
import { validateDescriptor } from '../src/providers/descriptor.mjs';
import { depsWith } from './helpers.mjs';
import { word } from '../../bio-plane/src/setup-words/index.mjs';

// The tools that run on the organization's own server or service, by the word key of the recipient their descriptor names.
const OWN_RECIPIENT = {
  'metadefender-core': 'file-scanner.catalogue.metadefender_core_the_organizations_own',
  'defender-storage': 'file-scanner.catalogue.microsoft_the_organizations_own_azure',
  'splunk-hec': 'file-scanner.catalogue.splunk_hec_the_organizations_own_splunk',
  sentinel: 'file-scanner.catalogue.microsoft_the_organizations_own_workspace',
  'google-secops': 'file-scanner.catalogue.google_llc_the_organizations_own',
  elastic: 'file-scanner.catalogue.elastic_the_organizations_own',
};
const OWN = Object.keys(OWN_RECIPIENT);

test('R33 every catalogue descriptor states on_own as a boolean, true exactly for the self-run tools whose recipient names the organization\'s own server or service', () => {
  assert.ok(PROVIDERS.length >= 20);
  for (const d of PROVIDERS) {
    assert.equal(typeof d.handling.on_own, 'boolean', d.provider_id);
    assert.equal(d.handling.on_own, OWN.includes(d.provider_id), d.provider_id);
    // what the recipient's word names agrees with it (the check the statement replaces on the screen's side)
    assert.equal(OWN_RECIPIENT[d.provider_id] !== undefined && d.handling.recipient === word(OWN_RECIPIENT[d.provider_id]), d.handling.on_own, d.provider_id);
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
