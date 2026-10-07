/* The provider contract's descriptor (R19) and engine families (R31): pure, never throwing.
 *
 * Beside R19's fields a descriptor may state four of this module's own: `max_bytes` (the tool's size limit, R5),
 * `template: true` (a generic transport whose hosts, engine family and handling the administrator supplies, R20) and
 * `host_from_spec: true` (a product the organization runs on its own servers, whose host the spec names, as a
 * template's is), and `per_engine: true` (a tool that reports one result per engine, each verdict then of its engine's
 * family alone, R31). `hosts` is a list of host names, or an object of such lists by region; a name `*.example.com`
 * stands for any host under that domain. */

export const KINDS = Object.freeze(['scan', 'cdr', 'sandbox', 'url_reputation', 'log_sink']);
export const TRANSPORTS = Object.freeze(['https', 'icap', 'syslog_tls', 'azure_blob']);
export const SAMPLE_SHARING = Object.freeze(['none', 'vendor_internal_research', 'third_parties', 'public', 'not stated']);
export const SENDS = Object.freeze(['file_bytes', 'url', 'hostname', 'hash_prefix', 'counts']);
export const NEVER_SENDS_REQUIRED = Object.freeze(['file_name', 'member_identity', 'ip_address']);
export const NOT_STATED = 'not stated';
const HANDLING_FIELDS = ['sends', 'never_sends', 'recipient', 'sub_processors', 'region', 'file_retention',
  'result_retention', 'sample_sharing'];
const FIELDS = ['provider_id', 'vendor', 'product', 'kinds', 'transport', 'reach', 'hosts', 'engine_family',
  'credentials', 'test_probe', 'handling', 'mode_required', 'mode_check', 'licence_note', 'source_urls', 'read_on'];
const OWN = ['max_bytes', 'template', 'host_from_spec', 'per_engine'];
const PROBES = ['eicar', 'macro_document', 'test_address', 'zero_counts'];
// Who Cloudflare is, for S12: a url_reputation tool may send an address only to Cloudflare in the group's account.
const CLOUDFLARE = /^cloudflare\b/i;

const str = (v) => typeof v === 'string' && v.length > 0;
const strList = (v, nonEmpty) => Array.isArray(v) && (!nonEmpty || v.length > 0) && v.every(str);
const stated = (v, check) => v === NOT_STATED || check(v);
const hostName = (h) => str(h) && /^(\*\.)?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(h);

/** The hosts a descriptor states, flattened over its regions. */
export function allHosts(d) {
  if (Array.isArray(d.hosts)) return d.hosts;
  return Object.values(d.hosts || {}).flat();
}

function malformed(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return 'descriptor';
  for (const k of Object.keys(d)) if (!FIELDS.includes(k) && !OWN.includes(k)) return k;
  for (const k of FIELDS) if (!(k in d)) return k;
  if (!str(d.provider_id) || !/^[a-z0-9][a-z0-9-]*$/.test(d.provider_id)) return 'provider_id';
  if (!str(d.vendor)) return 'vendor';
  if (!str(d.product)) return 'product';
  if (!strList(d.kinds, true) || !d.kinds.every((k) => KINDS.includes(k)) || new Set(d.kinds).size !== d.kinds.length) return 'kinds';
  if (!TRANSPORTS.includes(d.transport)) return 'transport';
  if (d.reach !== 'public' && d.reach !== 'tunnel') return 'reach';
  const own = d.template === true || d.host_from_spec === true;
  if (Array.isArray(d.hosts)) {
    if (!d.hosts.every(hostName) || (!own && d.hosts.length === 0)) return 'hosts';
  } else if (d.hosts && typeof d.hosts === 'object') {
    const lists = Object.entries(d.hosts);
    if (!lists.length || !lists.every(([r, l]) => str(r) && Array.isArray(l) && l.every(hostName))) return 'hosts';
  } else return 'hosts';
  if (!strList(d.engine_family, true)) return 'engine_family';
  if (!strList(d.credentials, false)) return 'credentials';
  if (!d.test_probe || !PROBES.includes(d.test_probe.kind)
    || (d.test_probe.kind === 'test_address' && !str(d.test_probe.address))) return 'test_probe';
  const h = d.handling;
  if (!h || typeof h !== 'object' || Array.isArray(h)) return 'handling';
  for (const k of Object.keys(h)) if (!HANDLING_FIELDS.includes(k)) return `handling.${k}`;
  if (!stated(h.sends, (v) => strList(v, true) && v.every((s) => SENDS.includes(s)))) return 'handling.sends';
  if (!stated(h.never_sends, (v) => strList(v, false))) return 'handling.never_sends';
  for (const k of ['recipient', 'region', 'file_retention', 'result_retention']) if (!str(h[k])) return `handling.${k}`;
  if (!stated(h.sub_processors, (v) => strList(v, false))) return 'handling.sub_processors';
  if (!SAMPLE_SHARING.includes(h.sample_sharing)) return 'handling.sample_sharing';
  if (d.mode_required !== null && !(d.mode_required && typeof d.mode_required === 'object'
    && str(d.mode_required.description) && d.mode_required.params && typeof d.mode_required.params === 'object')) return 'mode_required';
  if (d.mode_check !== null && !str(d.mode_check)) return 'mode_check';
  if (!str(d.licence_note)) return 'licence_note';
  if (!strList(d.source_urls, !own) || !d.source_urls.every((u) => /^https:\/\//.test(u))) return 'source_urls';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.read_on || '')) return 'read_on';
  if (d.max_bytes !== undefined && !(Number.isSafeInteger(d.max_bytes) && d.max_bytes > 0)) return 'max_bytes';
  for (const k of ['template', 'host_from_spec', 'per_engine']) if (d[k] !== undefined && d[k] !== true) return k;
  return null;
}

/** R19: `{ok:true}` or the first refusal, in R19's order. Pure; never throws. */
export function validateDescriptor(d) {
  try {
    const field = malformed(d);
    if (field) return { ok: false, code: 'DESCRIPTOR_MALFORMED', field };
    const h = d.handling;
    if (h.sample_sharing === 'third_parties' || h.sample_sharing === 'public') return { ok: false, code: 'PROVIDER_SHARES_SAMPLES' };
    if (h.sample_sharing === NOT_STATED) return { ok: false, code: 'HANDLING_NOT_STATED' };
    if (h.never_sends === NOT_STATED || !NEVER_SENDS_REQUIRED.every((x) => h.never_sends.includes(x))) {
      return { ok: false, code: 'NEVER_SENDS_INCOMPLETE' };
    }
    if (d.kinds.includes('url_reputation') && Array.isArray(h.sends)
      && (h.sends.includes('url') || h.sends.includes('hostname')) && !CLOUDFLARE.test(h.recipient)) {
      return { ok: false, code: 'ADDRESS_WOULD_LEAVE' };
    }
    if (d.mode_required && !d.mode_check) return { ok: false, code: 'PRIVATE_MODE_UNVERIFIABLE' };
    return { ok: true };
  } catch {
    return { ok: false, code: 'DESCRIPTOR_MALFORMED', field: 'descriptor' };
  }
}

/** R31: a family as stated, each name lower-cased; a statement naming ClamAV includes `clamav`. */
export function normaliseFamily(list) {
  const out = [...new Set((list || []).map((n) => String(n).trim().toLowerCase()).filter(Boolean))];
  if (out.some((n) => /clam/.test(n)) && !out.includes('clamav')) out.push('clamav');
  return out;
}
