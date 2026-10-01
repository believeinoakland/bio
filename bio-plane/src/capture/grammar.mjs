/* capture — the information grammar, C-2.7 (K585 (3)'s capture ruling; `build/plan/draft-T18.md` §1b; R37). The type
 * arm the catalogue's `checkBundle` runs over an `information` bundle: its two enumerations, the source and monitoring
 * blocks, the content hash (recomputed from the canonical dataset when both exist), what the verified state requires,
 * and the change records. Capture owns it because capture brings information into the record and is the earliest
 * module that owns their intake (the ruling). It leaves the catalogue by REGISTERING with record-core's grammar seam
 * (`registerGrammar`, its R67), once per storage in `captureOf`: record-core's audit and promotion's gate pass the
 * registrations to `checkBundle` as `opts.grammars`, and a grammar claiming an arm's whole id list runs IN THAT ARM'S
 * PLACE over the same context, so the findings, their ids, severities and order are the catalogue's own. Copied
 * whole from the catalogue in T18; the catalogue holds a copy (rule 1, K767) only for the callers that still judge
 * through its own `checkBundle` without registering this grammar (instance-setup's tests), and the last of them to
 * re-point deletes it. Its shared grammar (`canonicalJson`, `ISO_TS_RE`) is record-grammar's (its R2, R12). Pure: no
 * store, no network, no clock. */
import { canonicalJson, ISO_TS_RE } from "../record-grammar/index.mjs";

/* The catalogue's finding shape (`f`), so a finding from this arm is the one the built-in arm made. */
const f = (check, severity, message, repairs) => {
  const out = { check, severity, message };
  if (repairs) { out.repairable = true; out.repairs = repairs; }
  return out;
};
const asText = (v) => (typeof v === "string" ? v : new TextDecoder().decode(v));

const INFO_ENUMS = {
  criticality: ['crucial', 'supporting'],
  source_status: ['unchanged', 'modified', 'removed']
};
/** The monitoring cadences an information item may name (C-2.7). `monitoring` keys its interval table off THIS array
 *  rather than a local copy of the words, so a frequency the grammar gains cannot silently fall through to a default
 *  interval (REC-26's map rule). */
export const MONITOR_FREQ = Object.freeze(['hourly', 'daily', 'weekly', 'monthly', 'per_meeting', 'none']);
const CONTENT_HASH_RE = /^sha256:[0-9a-f]{64}$/;

/** C-2.7: the information grammar, `arm(ctx, findings)` over `checkBundle`'s context. */
export async function checkInformationExtension(ctx, findings) {
  if (ctx.fm?.object_type !== 'information') return;
  const fm = ctx.fm;
  for (const [field, legal] of Object.entries(INFO_ENUMS)) {
    if (!legal.includes(fm[field])) {
      findings.push(f('C-2.7', 'error', `${field} '${fm[field]}' is not one of: ${legal.join(', ')}`));
    }
  }
  const src = fm.source;
  if (!src || typeof src !== 'object') findings.push(f('C-2.7', 'error', 'source block is missing'));
  else for (const k of ['locator', 'authority', 'retrieved']) {
    if (!src[k]) findings.push(f('C-2.7', 'error', `source.${k} is missing`));
  }
  const mon = fm.monitoring;
  if (!mon || typeof mon !== 'object') findings.push(f('C-2.7', 'error', 'monitoring block is missing'));
  else {
    if (typeof mon.enabled !== 'boolean') findings.push(f('C-2.7', 'error', `monitoring.enabled '${mon.enabled}' is not boolean`));
    if (!MONITOR_FREQ.includes(mon.frequency)) findings.push(f('C-2.7', 'error', `monitoring.frequency '${mon.frequency}' is not one of: ${MONITOR_FREQ.join(', ')}`));
  }
  const ch = fm.content_hash;
  const chOk = typeof ch === 'string' && CONTENT_HASH_RE.test(ch);
  if (ch !== undefined && ch !== null && ch !== '' && !chOk) {
    findings.push(f('C-2.7', 'error', `content_hash '${String(ch).slice(0, 24)}…' is not sha256:<64 hex>`));
  }
  // Recompute the hash from the canonical dataset when both exist.
  const dsRaw = ctx.files.get('data/dataset.json');
  if (dsRaw && chOk) {
    try {
      const canon = canonicalJson(JSON.parse(asText(dsRaw)));
      const actual = 'sha256:' + await ctx.sha256(canon);
      if (actual !== ch) {
        findings.push(f('C-2.7', 'error', `content_hash does not match the canonicalized data/dataset.json (declared ${ch.slice(7, 19)}…, actual ${actual.slice(7, 19)}…)`,
          ['refresh content_hash and append a change record', 'restore data/dataset.json from history']));
      }
    } catch { /* C-14.3 already reports unparsable JSON */ }
  }
  // verified-state entry requirements
  if (fm.current_state === 'verified') {
    if (!chOk) findings.push(f('C-2.7', 'error', 'verified state requires a well-formed content_hash'));
    if (!dsRaw) findings.push(f('C-2.7', 'error', 'verified state requires data/dataset.json'));
    const hasSnap = [...ctx.files.keys()].some(p => p.startsWith('snapshots/'))
      || (ctx.elided && [...ctx.elided].some(p => p.startsWith('snapshots/')));
    if (!hasSnap) findings.push(f('C-2.7', 'error', 'verified state requires at least one file in snapshots/'));
  }
  // change records, when present
  const chRaw = ctx.files.get('data/changes.json');
  if (chRaw) {
    try {
      const recs = JSON.parse(asText(chRaw));
      const arr = recs && Array.isArray(recs.records) ? recs.records : null;
      if (!arr) findings.push(f('C-2.7', 'error', 'data/changes.json must be {"records": [...]}'));
      else for (let i = 0; i < arr.length; i++) {
        const r = arr[i];
        if (!r || !ISO_TS_RE.test(r.detected || '') || !['modified', 'removed', 'corrected'].includes(r.kind) || !r.summary) {
          findings.push(f('C-2.7', 'error', `changes.json records[${i}] lacks detected/kind/summary in the required shape`));
        }
      }
    } catch { /* C-14.3 reports */ }
  }
}

/** What `captureOf` registers with record-core (its R67): the arm claims C-2.7 whole. */
export const INFORMATION_GRAMMAR = Object.freeze({ ids: Object.freeze(['C-2.7']), arm: checkInformationExtension });
