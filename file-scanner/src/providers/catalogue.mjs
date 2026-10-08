/* The catalogue (R20) and engine families (R31). Every offered descriptor passes R19 (a test pins it); its `handling`
 * is the study's statement (`build/plan/study-security-tools-N710.md`, `study-scanner-N705.md`), read on the date it
 * states. Each descriptor's `config` names the settings its adapter reads (R19, N777). A generic transport is a
 * template: the administrator's statement (`spec.config.engine_family`, `spec.config.handling`) and the spec's `host`
 * complete it, and R19 validates the result (`resolveDescriptor`). */
import { validateDescriptor, normaliseFamily } from './descriptor.mjs';

const READ_ON = '2026-10-07';
const NEVER = Object.freeze(['file_name', 'member_identity', 'ip_address']);
const ADMIN = 'stated by the administrator';

const descriptor = (d) => Object.freeze({
  mode_required: null, mode_check: null, credentials: [], read_on: READ_ON, ...d,
  config: Object.freeze((d.config || []).map((f) => Object.freeze({ ...f }))),
  handling: Object.freeze({ never_sends: NEVER, sub_processors: [], ...d.handling }),
});

// R19 (N777): the settings each adapter reads from the spec's `config`, by name, so a settings page asks each one.
const field = (name, label, required) => ({ name, label, required });
// A template's own statement (K2175): its engine family and its handling, both required, as the tool's maker states them.
const TEMPLATE_CONFIG = () => [
  field('engine_family', 'The engines the tool runs, as its maker names them', true),
  field('handling', 'The tool\'s statement of what it receives, keeps and shares', true),
  field('source_urls', 'Where that statement is published', false),
];
const AZURE_TENANT = field('tenant_id', 'Microsoft Entra tenant ID', true);

// MetaDefender reports one result per engine; the engines its tiers run, as OPSWAT names them (N705 §2.2; the list is
// this adapter's assumption, wider than any one tier). An engine it reports outside this list is answered under
// `metadefender-unlisted`, so every verdict's engine stays in its family (R31).
const METADEFENDER_ENGINES = ['ahnlab', 'antiy', 'avira', 'bitdefender', 'bkav', 'clamav', 'comodo', 'crowdstrike',
  'cyren', 'emsisoft', 'eset', 'filseclab', 'fortinet', 'huorong', 'ikarus', 'jiangmin', 'k7', 'mcafee', 'microsoft',
  'nanoav', 'quickheal', 'sophos', 'tachyon', 'trendmicro', 'varist', 'vir.it', 'xvirus', 'zillya', 'metadefender-unlisted'];
const MD_PRIVATE = Object.freeze({
  params: Object.freeze({ samplesharing: '0', privateprocessing: '1' }),
  description: 'private mode: samplesharing 0 and private processing on every call (paid licence only)',
});
const MD_CHECK = 'GET /v4/apikey/ before each send: the key\'s licence is paid and private processing is on';
const MD_URLS = ['https://www.opswat.com/docs/mdcloud/operation/private-scanning-with-metadefender-cloud-apis',
  'https://www.opswat.com/docs/mdcloud/metadefender-cloud-api-v4', 'https://www.opswat.com/legal/terms-of-service'];
const INTELIX = {
  vendor: 'Sophos Ltd', product: 'SophosLabs Intelix', transport: 'https', reach: 'public',
  hosts: { us: ['us.api.labs.sophos.com', 'api.labs.sophos.com'], de: ['de.api.labs.sophos.com', 'api.labs.sophos.com'],
    au: ['au.api.labs.sophos.com', 'api.labs.sophos.com'] },
  engine_family: ['sophos'], credentials: ['client_id', 'client_secret'],
  handling: { sends: ['file_bytes'], recipient: 'Sophos Ltd', sub_processors: [],
    region: 'the region chosen; dynamic analysis traffic may be routed to another region; malicious files to the SophosLabs Hub (UK)',
    file_retention: 'clean files up to 30 days; malicious files retained indefinitely in the SophosLabs Hub (UK)',
    result_retention: 'metadata up to 6 months for research', sample_sharing: 'vendor_internal_research' },
  licence_note: 'the organization\'s own Intelix account (free monthly allowance, then pay as you go)',
  source_urls: ['https://www.sophos.com/en-us/legal/product-privacy-information/sophoslabs-intelix'],
};

/** R20: the descriptors offered, frozen, keyed by `provider_id` in the catalogue's order. */
export const PROVIDERS = Object.freeze([
  // ── scan
  descriptor({ provider_id: 'scanii', vendor: 'Uva Software, LLC', product: 'Scanii', kinds: ['scan'],
    transport: 'https', reach: 'public', max_bytes: 2_147_483_648,
    hosts: { us1: ['api-us1.scanii.com'], eu1: ['api-eu1.scanii.com'], eu2: ['api-eu2.scanii.com'],
      ap1: ['api-ap1.scanii.com'], ap2: ['api-ap2.scanii.com'], ca1: ['api-ca1.scanii.com'] },
    // Its own engine with Sophos as the second (N705 §2.1); one family with Sophos Intelix (K1946 T7).
    engine_family: ['scanii', 'sophos'], credentials: ['api_key', 'api_secret'], test_probe: { kind: 'eicar' },
    handling: { sends: ['file_bytes'], recipient: 'Uva Software, LLC', sub_processors: ['Amazon Web Services'],
      region: 'chosen by the group: US1, EU1, EU2, AP1, AP2 or CA1; content never leaves it',
      file_retention: 'deleted on completion of analysis', result_retention: 'up to 400 days in the processing region',
      sample_sharing: 'none' },
    licence_note: 'the group\'s own key; terms allow use within its own products made available to its clients',
    source_urls: ['https://docs.scanii.com/article/142-privacy-policy', 'https://docs.scanii.com/article/143-terms-of-service',
      'https://docs.scanii.com/article/144-version-2-0-resources'] }),
  descriptor({ provider_id: 'metadefender-cloud', vendor: 'OPSWAT, Inc.', product: 'MetaDefender Cloud (private mode)',
    kinds: ['scan'], transport: 'https', reach: 'public', hosts: ['api.metadefender.com'], max_bytes: 146_800_640,
    per_engine: true, engine_family: METADEFENDER_ENGINES, credentials: ['api_key'], test_probe: { kind: 'eicar' },
    mode_required: MD_PRIVATE, mode_check: MD_CHECK,
    handling: { sends: ['file_bytes'], recipient: 'OPSWAT, Inc.', sub_processors: 'not stated', region: 'not stated',
      file_retention: 'private mode: not stored or shared; permanently removed from storage',
      result_retention: 'scan results remain in the MetaDefender Cloud database, limited to the submitter',
      sample_sharing: 'none' },
    licence_note: 'the organization\'s own paid licence; "solely for Your internal use" (OPSWAT\'s written yes needed for product use)',
    source_urls: MD_URLS }),
  descriptor({ provider_id: 'metadefender-core', vendor: 'OPSWAT, Inc.', product: 'MetaDefender Core', kinds: ['scan'],
    transport: 'https', reach: 'tunnel', hosts: [], host_from_spec: true, per_engine: true,
    engine_family: METADEFENDER_ENGINES, credentials: ['api_key'], test_probe: { kind: 'eicar' },
    handling: { sends: ['file_bytes'], recipient: 'the organization\'s own MetaDefender Core server',
      region: 'the organization\'s own servers', file_retention: 'as the organization configures its server',
      result_retention: 'as the organization configures its server', sample_sharing: 'none' },
    licence_note: 'the organization\'s own licence', source_urls: ['https://www.opswat.com/docs/mdcore/metadefender-core'] }),
  descriptor({ provider_id: 'icap', vendor: ADMIN, product: 'any ICAP server (RFC 3507)', kinds: ['scan'],
    transport: 'icap', reach: 'public', hosts: [], template: true, engine_family: [ADMIN], test_probe: { kind: 'eicar' },
    config: [...TEMPLATE_CONFIG(), field('service', 'ICAP service name (default avscan)', false),
      field('tls', 'Connect over TLS (port 11344 unless the address names one)', false)],
    handling: { sends: ['file_bytes'], recipient: ADMIN, region: ADMIN, file_retention: ADMIN, result_retention: ADMIN,
      sample_sharing: 'none' },
    licence_note: 'the organization\'s own server and licence', source_urls: [] }),
  descriptor({ provider_id: 'defender-storage', vendor: 'Microsoft Corporation', product: 'Microsoft Defender for Storage',
    kinds: ['scan'], transport: 'azure_blob', reach: 'public', max_bytes: 2_147_483_648,
    hosts: ['*.blob.core.windows.net', 'login.microsoftonline.com'], engine_family: ['microsoft-defender'],
    credentials: ['client_id', 'client_secret'], test_probe: { kind: 'eicar' },
    config: [AZURE_TENANT, field('storage_account', 'Azure storage account name', true),
      field('container', 'Blob container the files are scanned in', true)],
    handling: { sends: ['file_bytes'], recipient: 'Microsoft (the organization\'s own Azure storage account)',
      region: 'the storage account\'s region; content read within it',
      file_retention: 'the service does not retain the scanned content; this adapter deletes the blob after the result',
      result_retention: 'the blob\'s index tag, deleted with it; alerts as the organization\'s Defender for Cloud keeps them',
      sample_sharing: 'none' },
    licence_note: 'the organization\'s own Azure subscription, billed per GB scanned',
    source_urls: ['https://learn.microsoft.com/en-us/azure/defender-for-cloud/on-upload-malware-scanning'] }),
  descriptor({ provider_id: 'sophos-intelix', ...INTELIX, kinds: ['scan', 'sandbox'], max_bytes: 33_554_432,
    test_probe: { kind: 'eicar' } }),
  // ── cdr
  descriptor({ provider_id: 'opswat-deep-cdr', vendor: 'OPSWAT, Inc.', product: 'Deep CDR (MetaDefender Cloud or Core)',
    kinds: ['cdr'], transport: 'https', reach: 'public', hosts: { cloud: ['api.metadefender.com'], core: [] },
    max_bytes: 146_800_640, engine_family: ['opswat-deep-cdr'], credentials: ['api_key'],
    test_probe: { kind: 'macro_document' }, mode_required: MD_PRIVATE, mode_check: MD_CHECK,
    handling: { sends: ['file_bytes'], recipient: 'OPSWAT, Inc. (Cloud), or the organization\'s own Core server',
      sub_processors: 'not stated', region: 'not stated (Cloud); the organization\'s own servers (Core)',
      file_retention: 'Cloud: not stored in private mode; the sanitized copy deleted after 24 hours',
      result_retention: 'Cloud: scan results remain, limited to the submitter', sample_sharing: 'none' },
    licence_note: 'the organization\'s own licence', source_urls: ['https://www.opswat.com/docs/mdcloud/operation/data-sanitization-on-metadefender-cloud',
      'https://www.opswat.com/docs/mdcore/metadefender-core'] }),
  descriptor({ provider_id: 'glasswall-halo', vendor: 'Glasswall Solutions Ltd', product: 'Glasswall Halo', kinds: ['cdr'],
    transport: 'https', reach: 'public', hosts: [], host_from_spec: true, max_bytes: 1_073_741_824,
    engine_family: ['glasswall'], credentials: ['api_token'], test_probe: { kind: 'macro_document' },
    handling: { sends: ['file_bytes'], recipient: 'the Glasswall Halo deployment the organization runs or subscribes to',
      region: 'where that deployment runs', file_retention: 'removed according to the deployment\'s file retention policy',
      result_retention: 'the analysis report, as the deployment keeps it', sample_sharing: 'none' },
    licence_note: 'an entitlement to a number of files or a volume a day',
    source_urls: ['https://docs.glasswall.com/rest-api/about-glasswall-apis', 'https://docs.glasswall.com/halo/2.18.1/glasswall-halo-faqs'] }),
  // ── sandbox
  descriptor({ provider_id: 'joe-sandbox', vendor: 'Joe Security LLC', product: 'Joe Sandbox Cloud (Light and above)',
    kinds: ['sandbox'], transport: 'https', reach: 'public', hosts: ['jbxcloud.joesecurity.org'], max_bytes: 104_857_600,
    engine_family: ['joe-sandbox'], credentials: ['api_key'], test_probe: { kind: 'eicar' },
    mode_required: Object.freeze({ params: Object.freeze({ 'accept-tac': '1' }),
      description: 'an edition of Light or above, whose analyses and results are private' }),
    mode_check: 'POST /api/v2/account/info before each send: the account is not of the Basic edition',
    handling: { sends: ['file_bytes'], recipient: 'Joe Security LLC', region: 'not stated',
      file_retention: 'kept until the customer deletes it; then securely deleted in near real time',
      result_retention: 'kept until the customer deletes it', sample_sharing: 'none' },
    licence_note: 'the organization\'s own Light, Pro or Enterprise subscription',
    source_urls: ['https://joesecurity.org/joe-sandbox-cloud', 'https://www.joesandbox.com/pdpp'] }),
  descriptor({ provider_id: 'vmray', vendor: 'VMRay GmbH', product: 'VMRay Analyzer (cloud)', kinds: ['sandbox'],
    transport: 'https', reach: 'public', hosts: { us: ['cloud.vmray.com'], de: ['eu.cloud.vmray.com'] },
    max_bytes: 104_857_600, engine_family: ['vmray'], credentials: ['api_key'], test_probe: { kind: 'eicar' },
    handling: { sends: ['file_bytes'], recipient: 'VMRay GmbH', region: 'US or Germany, as the account is hosted',
      file_retention: 'not stated beyond the account', result_retention: 'kept in the account', sample_sharing: 'none' },
    licence_note: 'the organization\'s own subscription', source_urls: ['https://www.vmray.com/?p=3550'] }),
  descriptor({ provider_id: 'falcon-sandbox', vendor: 'CrowdStrike, Inc.', product: 'Falcon Sandbox (Falcon Intelligence)',
    kinds: ['sandbox'], transport: 'https', reach: 'public', max_bytes: 104_857_600,
    hosts: { 'us-1': ['api.crowdstrike.com'], 'us-2': ['api.us-2.crowdstrike.com'], 'eu-1': ['api.eu-1.crowdstrike.com'] },
    engine_family: ['crowdstrike'], credentials: ['client_id', 'client_secret'], test_probe: { kind: 'eicar' },
    config: [field('environment_id', 'Sandbox environment ID (default 160, Windows 10 64-bit)', false)],
    mode_required: Object.freeze({ params: Object.freeze({ is_confidential: 'true' }),
      description: 'community access off: every upload confidential' }),
    mode_check: 'GET /falconx/entities/settings/v1 before each send: community access is off for the API client',
    handling: { sends: ['file_bytes'], recipient: 'CrowdStrike, Inc.', region: 'the Falcon cloud chosen',
      file_retention: 'stored in the Falcon platform; period not stated', result_retention: 'kept in the Falcon platform',
      sample_sharing: 'none' },
    licence_note: 'with the organization\'s Falcon subscription',
    source_urls: ['https://developer.crowdstrike.com/api-reference/collections/falconx-sandbox/'] }),
  descriptor({ provider_id: 'wildfire', vendor: 'Palo Alto Networks, Inc.', product: 'WildFire (standalone API)',
    kinds: ['sandbox'], transport: 'https', reach: 'public', max_bytes: 104_857_600,
    hosts: { global: ['wildfire.paloaltonetworks.com'], eu: ['eu.wildfire.paloaltonetworks.com'],
      jp: ['jp.wildfire.paloaltonetworks.com'], sg: ['sg.wildfire.paloaltonetworks.com'],
      uk: ['uk.wildfire.paloaltonetworks.com'], ca: ['ca.wildfire.paloaltonetworks.com'],
      au: ['au.wildfire.paloaltonetworks.com'] },
    engine_family: ['wildfire'], credentials: ['api_key'], test_probe: { kind: 'eicar' },
    handling: { sends: ['file_bytes'], recipient: 'Palo Alto Networks, Inc.',
      region: 'the regional cloud chosen; some metadata shared across regional clouds',
      file_retention: 'benign 14 days; malicious 10 years', result_retention: 'signatures and reports kept indefinitely',
      sample_sharing: 'vendor_internal_research' },
    licence_note: 'the organization\'s own WildFire API subscription (150 submissions a day base)',
    source_urls: ['https://docs.paloaltonetworks.com/wildfire/u-v/wildfire-whats-new/latest-wildfire-cloud-features/standalone-wildfire-api-subscription',
      'https://docs.paloaltonetworks.com/wildfire/u-v/wildfire-whats-new/latest-wildfire-cloud-features/updated-wildfire-retention-period'] }),
  // ── url_reputation
  descriptor({ provider_id: 'cloudflare-intel', vendor: 'Cloudflare, Inc.', product: 'Cloudflare URL intelligence',
    kinds: ['url_reputation'], transport: 'https', reach: 'public', hosts: ['api.cloudflare.com'],
    engine_family: ['cloudflare-intel'], credentials: ['api_token'],
    config: [field('account_id', 'Cloudflare account ID', true)],
    test_probe: { kind: 'test_address', address: 'https://malware.testcategory.com/' },
    handling: { sends: ['url'], recipient: 'Cloudflare, Inc. (the group\'s own account)', region: 'Cloudflare\'s network',
      file_retention: 'no file is sent', result_retention: 'not stated', sample_sharing: 'none' },
    licence_note: 'the group\'s own Cloudflare account, a token with Intel Read',
    source_urls: ['https://developers.cloudflare.com/api/resources/intel/subresources/urls/methods/get'] }),
  descriptor({ provider_id: 'google-web-risk', vendor: 'Google LLC', product: 'Web Risk (Update API)',
    kinds: ['url_reputation'], transport: 'https', reach: 'public', hosts: ['webrisk.googleapis.com'],
    engine_family: ['google-web-risk'], credentials: ['api_key'],
    test_probe: { kind: 'test_address', address: 'http://testsafebrowsing.appspot.com/s/malware.html' },
    handling: { sends: ['hash_prefix'], recipient: 'Google LLC', region: 'not stated',
      file_retention: 'no file is sent; the server sees only a hash prefix on a local match',
      result_retention: 'not stated', sample_sharing: 'none' },
    licence_note: 'the organization\'s own Google Cloud project; results must not be redistributed',
    source_urls: ['https://docs.cloud.google.com/web-risk/docs/overview', 'https://cloud.google.com/web-risk/pricing'] }),
  // ── log_sink
  descriptor({ provider_id: 'splunk-hec', vendor: 'Splunk LLC', product: 'Splunk HTTP Event Collector', kinds: ['log_sink'],
    transport: 'https', reach: 'public', hosts: [], host_from_spec: true, engine_family: ['splunk-hec'],
    credentials: ['hec_token'], test_probe: { kind: 'zero_counts' },
    handling: { sends: ['counts'], recipient: 'the organization\'s own Splunk', region: 'where it runs',
      file_retention: 'no file is sent', result_retention: 'as the organization keeps its logs', sample_sharing: 'none' },
    licence_note: 'the organization\'s own Splunk', source_urls: ['https://help.splunk.com/en/splunk-enterprise/get-data-in/collect-http-event-data/use-curl-to-manage-http-event-collector-tokens-events-and-services'] }),
  descriptor({ provider_id: 'sentinel', vendor: 'Microsoft Corporation', product: 'Microsoft Sentinel (Logs Ingestion API)',
    kinds: ['log_sink'], transport: 'https', reach: 'public', hosts: ['*.ingest.monitor.azure.com', 'login.microsoftonline.com'],
    engine_family: ['sentinel'], credentials: ['client_id', 'client_secret'], test_probe: { kind: 'zero_counts' },
    config: [AZURE_TENANT, field('endpoint', 'Data collection endpoint host', true),
      field('dcr_id', 'Data collection rule immutable ID', true), field('stream', 'Stream name in the rule', true)],
    handling: { sends: ['counts'], recipient: 'Microsoft (the organization\'s own workspace)', region: 'the workspace\'s region',
      file_retention: 'no file is sent', result_retention: 'as the workspace keeps its logs', sample_sharing: 'none' },
    licence_note: 'the organization\'s own Azure workspace',
    source_urls: ['https://learn.microsoft.com/en-us/azure/azure-monitor/logs/logs-ingestion-api-overview'] }),
  descriptor({ provider_id: 'google-secops', vendor: 'Google LLC', product: 'Google Security Operations (ImportLogs)',
    kinds: ['log_sink'], transport: 'https', reach: 'public',
    hosts: { us: ['us-chronicle.googleapis.com', 'oauth2.googleapis.com'], europe: ['europe-chronicle.googleapis.com', 'oauth2.googleapis.com'],
      'asia-southeast1': ['asia-southeast1-chronicle.googleapis.com', 'oauth2.googleapis.com'] },
    engine_family: ['google-secops'], credentials: ['service_account_key'], test_probe: { kind: 'zero_counts' },
    config: [field('project', 'Google Cloud project ID', true), field('location', 'Instance location', true),
      field('instance', 'Instance (customer) ID', true), field('log_type', 'Log type the counts are imported as', true)],
    handling: { sends: ['counts'], recipient: 'Google LLC (the organization\'s own instance)', region: 'the instance\'s region',
      file_retention: 'no file is sent', result_retention: 'as the instance keeps its logs', sample_sharing: 'none' },
    licence_note: 'the organization\'s own instance', source_urls: ['https://docs.cloud.google.com/chronicle/docs/reference/ingestion-methods'] }),
  descriptor({ provider_id: 'elastic', vendor: 'Elasticsearch B.V.', product: 'Elastic (_bulk API)', kinds: ['log_sink'],
    transport: 'https', reach: 'public', hosts: [], host_from_spec: true, engine_family: ['elastic'],
    credentials: ['api_key'], test_probe: { kind: 'zero_counts' },
    config: [field('index', 'Index the counts are written to (default civicsmith-security-counts)', false)],
    handling: { sends: ['counts'], recipient: 'the organization\'s own Elastic deployment', region: 'where it runs',
      file_retention: 'no file is sent', result_retention: 'as the organization keeps its logs', sample_sharing: 'none' },
    licence_note: 'the organization\'s own deployment', source_urls: ['https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-bulk'] }),
  descriptor({ provider_id: 'syslog-tls', vendor: ADMIN, product: 'any syslog collector (RFC 5424 over TLS)', kinds: ['log_sink'],
    transport: 'syslog_tls', reach: 'public', hosts: [], template: true, engine_family: ['syslog'],
    test_probe: { kind: 'zero_counts' }, config: TEMPLATE_CONFIG(),
    handling: { sends: ['counts'], recipient: ADMIN, region: ADMIN, file_retention: 'no file is sent',
      result_retention: ADMIN, sample_sharing: 'none' },
    licence_note: 'the organization\'s own collector', source_urls: [] }),
  descriptor({ provider_id: 'https-webhook', vendor: ADMIN, product: 'any HTTPS endpoint taking a JSON POST', kinds: ['log_sink'],
    transport: 'https', reach: 'public', hosts: [], template: true, engine_family: ['webhook'], credentials: ['token'],
    test_probe: { kind: 'zero_counts' },
    config: [...TEMPLATE_CONFIG(), field('path', 'Path on the endpoint (default /)', false)],
    handling: { sends: ['counts'], recipient: ADMIN, region: ADMIN, file_retention: 'no file is sent',
      result_retention: ADMIN, sample_sharing: 'none' },
    licence_note: 'the organization\'s own endpoint', source_urls: [] }),
]);

/** R20: refused by name, with R19's code or NOT_OFFERED (DEC-168 S10–S12). */
export const REFUSED_PROVIDERS = Object.freeze([
  ['virustotal-upload', 'PROVIDER_SHARES_SAMPLES'], ['jotti', 'PROVIDER_SHARES_SAMPLES'],
  ['hybrid-analysis', 'PROVIDER_SHARES_SAMPLES'], ['joe-sandbox-basic', 'PROVIDER_SHARES_SAMPLES'],
  ['urlscan-io', 'PROVIDER_SHARES_SAMPLES'], ['any-run', 'NOT_OFFERED'],
  ['virustotal-url-submit', 'ADDRESS_WOULD_LEAVE'], ['google-web-risk-lookup', 'ADDRESS_WOULD_LEAVE'],
  ['sophos-intelix-url', 'ADDRESS_WOULD_LEAVE'], ['metadefender-url', 'ADDRESS_WOULD_LEAVE'],
  ['cloudflare-url-scanner', 'NOT_OFFERED'], ['cloudflare-logpush', 'NOT_OFFERED'],
].map(([provider_id, reason]) => Object.freeze({ provider_id, reason })));

/** R20: held until the vendor states its handling (K1949). */
export const HELD_PROVIDERS = Object.freeze(['trend-vision-one', 'votiro', 'checkpoint-threat-extraction']
  .map((provider_id) => Object.freeze({ provider_id, missing: 'HANDLING_NOT_STATED' })));

export const GENERIC = Object.freeze(PROVIDERS.filter((d) => d.template).map((d) => d.provider_id));
export const CATALOGUE_READ_ON = READ_ON;

const BY_ID = new Map(PROVIDERS.map((d) => [d.provider_id, d]));
export const providerById = (id) => BY_ID.get(id) || null;

/** The descriptor a call works under: a template completed by the administrator's statement and the spec's host,
 *  validated by R19; any other descriptor as catalogued. `{ok:true, descriptor}` or `{ok:false, code, field?}`. */
export function resolveDescriptor(d, spec) {
  if (!d.template) return { ok: true, descriptor: d };
  const config = (spec && spec.config) || {};
  const host = spec && spec.host;
  // A statement that is not a list is left as given, so R19 refuses it by name rather than this throwing.
  const family = (v) => (Array.isArray(v) ? normaliseFamily(v) : v);
  const resolved = { ...d, template: undefined, hosts: host ? [String(host).split(':')[0]] : [],
    engine_family: d.kinds.includes('scan') ? family(config.engine_family) : family(config.engine_family || d.engine_family),
    handling: { ...d.handling, ...(config.handling || {}) }, source_urls: config.source_urls || [] };
  delete resolved.template;
  resolved.host_from_spec = true;
  const v = validateDescriptor(resolved);
  return v.ok ? { ok: true, descriptor: Object.freeze(resolved) } : v;
}

/** R31: a provider's engine family; `clamav`'s is `["clamav"]`; null for an id not offered. */
export function engineFamily(providerId) {
  if (providerId === 'clamav') return ['clamav'];
  const d = BY_ID.get(providerId);
  return d ? normaliseFamily(d.engine_family) : null;
}

function verdictFamily(v) {
  if (!v || typeof v !== 'object' || typeof v.engine !== 'string' || !v.engine) return [];
  const d = BY_ID.get(v.tool);
  // A per-engine tool's verdict, and a template's (whose engine is the administrator's statement), are their engine's.
  if (v.tool === 'clamav' || !d || d.template || d.per_engine) return normaliseFamily([v.engine]);
  return normaliseFamily(d.engine_family);
}

/** R31: true exactly when two verdicts' engine families share no name. Pure; never throws. */
export function differentEngine(a, b) {
  try {
    const fa = verdictFamily(a), fb = verdictFamily(b);
    return fa.length > 0 && fb.length > 0 && !fa.some((n) => fb.includes(n));
  } catch { return false; }
}

// Every offered descriptor passes R19 when the module loads; a catalogue that does not is a build fault.
for (const d of PROVIDERS) {
  const v = validateDescriptor(d);
  if (!v.ok) throw new Error(`catalogue: ${d.provider_id} fails R19 (${v.code}${v.field ? ` ${v.field}` : ''})`);
}
