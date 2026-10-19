// The catalogue's words (CR-17; K4094, K4113; JOURNEY-CHECK #7 R27; the words rule, setup-words R13, R14; R19, R20, R29,
// R32): every label, hint, statement and legend GET /providers gives the Settings screens reaches a member through a
// key, the vendor and product names stay data, and a tool drawn as a legend has a display name, never its slug. Read
// under a pseudo-locale (pseudo/register.mjs): a child process runs the member with setup-words replaced by one whose
// `localize` follows each sentence with its bracketed id, so a sentence that came by no key is the one with no bracket.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = (f) => fileURLToPath(new URL(f, import.meta.url));
const served = JSON.parse(execFileSync(process.execPath, ['--no-warnings', '--import', HERE('./pseudo/register.mjs'), HERE('./pseudo/served.mjs')],
  { encoding: 'utf8', maxBuffer: 1 << 24 }));
const { offered, held, refused } = served.providers;
const KEYED = /⟦([A-Za-z0-9_.-]+)⟧/g;
const idsIn = (s) => [...String(s).matchAll(KEYED)].map((m) => m[1]);

// The vendor, product and recipient names the catalogue holds as data (K4113: vendor and product names stay data), and
// the exact string R19 allows where a tool states nothing.
const NAMES = new Set(['Uva Software, LLC', 'Scanii', 'Amazon Web Services', 'OPSWAT, Inc.', 'MetaDefender Core', 'Microsoft Corporation',
  'Sophos Ltd', 'SophosLabs Intelix', 'Glasswall Solutions Ltd', 'Glasswall Halo', 'Joe Security LLC', 'VMRay GmbH', 'VMRay Analyzer (cloud)',
  'CrowdStrike, Inc.', 'WildFire (standalone API)', 'Cloudflare, Inc.', 'Cloudflare URL intelligence', 'Google LLC', 'Splunk LLC',
  'Elasticsearch B.V.', 'Elastic (_bulk API)']);
const NOT_STATED = 'not stated';

/** Every text of a descriptor a member may read, as [path, text]. */
function memberTexts(d) {
  const out = [['vendor', d.vendor], ['product', d.product], ['licence_note', d.licence_note]];
  for (const c of d.config) out.push([`config.${c.name}.label`, c.label]);
  for (const k of ['recipient', 'region', 'file_retention', 'result_retention']) out.push([`handling.${k}`, d.handling[k]]);
  if (Array.isArray(d.handling.sub_processors)) for (const n of d.handling.sub_processors) out.push(['handling.sub_processors', n]);
  else out.push(['handling.sub_processors', d.handling.sub_processors]);
  if (d.mode_required) out.push(['mode_required.description', d.mode_required.description]);
  if (d.mode_check) out.push(['mode_check', d.mode_check]);
  return out;
}
/** The texts that reach a member by no key and are not a name or R19's "not stated": the findings. */
const plain = (d) => memberTexts(d).filter(([, t]) => !idsIn(t).length && !NAMES.has(t) && t !== NOT_STATED).map(([p, t]) => `${d.provider_id} ${p}: ${t}`);

test('R19 R29 R32 (the words rule): every sentence a descriptor serves a member comes through a key; only names and "not stated" stay plain', () => {
  assert.ok(offered.length >= 20, 'the whole catalogue was read');
  assert.deepEqual(offered.flatMap(plain), []);
});

test('R19 R29 (the words rule) control: a descriptor with one plain sentence, in each member-facing field, is found', () => {
  const base = offered.find((d) => d.provider_id === 'icap');
  assert.deepEqual(plain(base), []);
  const keyed = '⟦x.y⟧';
  const variants = {
    label: { ...base, config: [{ ...base.config[0], label: 'Server address' }, ...base.config.slice(1)] },
    region: { ...base, handling: { ...base.handling, region: 'held at its own site' } },
    licence: { ...base, licence_note: 'its own licence' },
    product: { ...base, product: 'any server' },
    retention: { ...base, handling: { ...base.handling, file_retention: 'kept a day' } },
    mode: { ...base, mode_required: { params: {}, description: 'private mode' }, mode_check: keyed },
  };
  for (const [name, d] of Object.entries(variants)) assert.equal(plain(d).length, 1, name);
  assert.deepEqual(plain({ ...base, vendor: 'Uva Software, LLC', handling: { ...base.handling, sub_processors: NOT_STATED } }), []);
});

test('R19 R29 R32 (setup-words R13, K4094) every config label the catalogue gives `setup` is keyed, each field by its own id; the hints it holds are in those labels', () => {
  const labels = offered.flatMap((d) => d.config.map((c) => [`${d.provider_id}.${c.name}`, c.label]));
  assert.ok(labels.length >= 36, 'the catalogue gives at least the 36 labels the local walk found');
  for (const [where, label] of labels) {
    assert.equal(typeof label, 'string', where);
    assert.equal(idsIn(label).length, 1, `${where}: one key`);
  }
  // a region label is the keyed sentence filled with the tool's own regions, one text with its list in it
  const regions = offered.filter((d) => d.config.some((c) => c.name === 'region'));
  assert.equal(regions.length, 7);
  for (const d of regions) {
    const label = d.config.find((c) => c.name === 'region').label;
    for (const region of Object.keys(d.hosts)) assert.ok(label.includes(region), `${d.provider_id}: ${region}`);
  }
});

test('R19 R20 R29 (K4094) a tool drawn as a legend has a display name, never its slug: every offered descriptor names a vendor and a product, each other than its provider_id', () => {
  const names = new Set();
  for (const d of offered) {
    for (const part of [d.vendor, d.product]) {
      assert.equal(typeof part, 'string', d.provider_id);
      assert.ok(part.length > 0, d.provider_id);
      assert.notEqual(part, d.provider_id, `${d.provider_id}: the slug is not a name`);
      assert.doesNotMatch(part, /^[a-z0-9]+(-[a-z0-9]+)+$/, `${d.provider_id}: a slug shape`);
    }
    const display = `${d.vendor} · ${d.product}`;
    assert.ok(!names.has(display), `${d.provider_id}: a name of its own`);
    names.add(display);
  }
  // the two the walk found drawn as slugs, by their display name from the catalogue
  for (const id of ['google-web-risk', 'opswat-deep-cdr']) {
    const d = offered.find((x) => x.provider_id === id);
    assert.ok(d && d.vendor && d.product, id);
  }
  // the refused and held lists carry ids only: a tool in use is always an offered one, so a screen names it from `offered`
  for (const x of [...refused, ...held]) assert.ok(!offered.some((d) => d.provider_id === x.provider_id), x.provider_id);
});

test('R19 R29 (K4113) the generic templates\' "stated by the administrator" is read by key wherever a member reads it, and the engine family it holds stays one data text', () => {
  for (const id of ['icap', 'syslog-tls', 'https-webhook']) {
    const d = offered.find((x) => x.provider_id === id);
    assert.equal(d.template, true, id);
    assert.equal(idsIn(d.vendor).length, 1, `${id} vendor`);
    for (const k of ['recipient', 'region', 'result_retention']) assert.equal(idsIn(d.handling[k]).length, 1, `${id} ${k}`);
    assert.equal(idsIn(d.product).length, 1, `${id} product`);
  }
  const icap = offered.find((x) => x.provider_id === 'icap');
  assert.equal(icap.engine_family.length, 1);
  assert.equal(idsIn(icap.engine_family[0]).length, 0, 'a family is a name R31 compares, never a sentence by locale');
});

test('R28 R32 the test probe\'s sentences are keyed', () => {
  assert.equal(served.probes.length, 3);
  for (const s of served.probes) assert.equal(idsIn(s).length, 1, s);
});

// Every id this round wrote (K874): each one is named here and is found, under the pseudo-locale, in what is served.
const CATALOGUE_IDS = [
  'stated_by_the_administrator', 'no_file_is_sent', 'where_it_runs', 'the_organizations_own_licence',
  'icap_server_address_host_or_host', 'icap_service_name_default_avscan', 'sandbox_environment_id_default_160',
  'cloudflare_account_id', 'instance_location', 'instance_customer_id', 'any_icap_server_rfc_3507',
  'any_syslog_collector_rfc_5424', 'any_https_endpoint_taking_a_json', 'scanii_chosen_by_the_team',
  'metadefender_cloud_the_organizations_own_paid', 'metadefender_core_the_organizations_own_servers',
  'deep_cdr_opswat_inc_cloud_or', 'glasswall_where_that_deployment_runs', 'vmray_kept_in_the_account',
  'vmray_us_or_germany_as_the', 'vmray_the_organizations_own_subscription', 'falcon_sandbox_the_falcon_cloud_chosen',
  'wildfire_benign_14_days_malicious', 'wildfire_the_organizations_own_wildfire_api', 'cloudflare_intel_cloudflares_network',
  'splunk_hec_the_organizations_own_splunk', 'splunk_hec_the_organizations_own_splunk_2', 'sentinel_the_workspaces_region',
  'google_secops_the_instances_region', 'google_secops_the_organizations_own_instance', 'elastic_the_organizations_own_deployment',
  'syslog_tls_the_organizations_own_collector', 'https_webhook_the_organizations_own_endpoint',
  'metadefender_get_v4_apikey_before_each', 'joe_sandbox_post_account_info_before_each', 'falcon_sandbox_get_settings_before_each',
].map((i) => `file-scanner.catalogue.${i}`);
const ROUTE_IDS = ['the_eicar_test_file_answered', 'the_eicar_test_file_did', 'no_safe_view'].map((i) => `file-scanner.routes.${i}`);

test('R19 R29 R32 (K874) each id this round wrote is the key of a sentence the member serves', () => {
  const seen = new Set(offered.flatMap((d) => memberTexts(d).flatMap(([, t]) => idsIn(t))));
  for (const id of CATALOGUE_IDS) assert.ok(seen.has(id), id);
  const probed = new Set(served.probes.flatMap(idsIn));
  for (const id of ROUTE_IDS) assert.ok(probed.has(id), id);
  // control: an id that is not one of the module's is not among them
  assert.ok(!seen.has('file-scanner.catalogue.not_an_id'));
});
