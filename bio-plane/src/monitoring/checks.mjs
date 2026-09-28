/* monitoring — its checks (requirements: `build/requirements/monitoring.md`, R27, R42; K6, K49).
 *
 * Moved from `legacy-checks` (`checks/bio-checks.mjs`) in T8 with their comments: C-18.5, `checkGatheringGrammar` and
 * its four vocabularies. `legacy-checks` cannot import this module, so its `checkBundle` no longer runs C-18.5: this
 * module registers it with promotion (at the write, R27) and with record-core's audit (R42). The C-48.8 and C-48.9
 * rows stay in `legacy-checks` (`DRIVE_CAPTURE_CHECKS`), read in place as capture reads the C-48 family (K72 (1)). */

import { isPublicHttpsLocator, ISO_TS_RE } from "../../checks/bio-checks.mjs";

/* The catalogue's finding shape (legacy-checks' private `f`), for the check that moved here. */
function f(check, severity, message) {
  return { check, severity, message };
}
function asText(v) {
  if (typeof v === 'string') return v;
  return new TextDecoder().decode(v);
}

export const GATH_ID_RE = /^GATH-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;
export const CRITICALITY_ENUM = ['crucial', 'supporting'];
export const CADENCE_ENUM = ['hourly', 'daily', 'weekly', 'monthly', 'none'];
export const GATH_STATUS_ENUM = ['open', 'captured', 'retired'];

/** C-18.5 (error): data/gathering.json field grammar. A leaked write token can
 *  litter the queue but never steer a member's session: the exporter renders
 *  these fields as quoted data, and this grammar bounds what they can carry
 *  (F5, doctrine 0.7). Scoped by declared contract: enforced only where the
 *  file is present. */
/* 1.16.6: exported. The gate already ran this at ratification, but a queue
   entry that cannot steer a session can still waste a member's attention, and a
   request refused at the WRITE never lands at all. Exporting the existing
   function is how the plane refuses at write without reimplementing the grammar,
   which would be a second grammar pretending to be the same one. */
export function checkGatheringGrammar(ctx, findings) {
  const raw = ctx.files.get('data/gathering.json');
  if (!raw) return;
  let g;
  try { g = JSON.parse(asText(raw)); } catch { return; } // C-14.3 reports
  if (typeof g !== 'object' || g === null || Array.isArray(g)) {
    findings.push(f('C-18.5', 'error', 'data/gathering.json must be a JSON object'));
    return;
  }
  if (g.daemon !== undefined) {
    const dmn = g.daemon;
    if (typeof dmn !== 'object' || dmn === null || Array.isArray(dmn)) {
      findings.push(f('C-18.5', 'error', 'gathering.json daemon block must be an object'));
    } else {
      if (typeof dmn.enabled !== 'boolean') findings.push(f('C-18.5', 'error', 'gathering.json daemon.enabled must be boolean'));
      for (const bk of ['tick_budget', 'sweep_budget']) {
        if (dmn[bk] !== undefined && !(Number.isInteger(dmn[bk]) && dmn[bk] >= 0)) {
          findings.push(f('C-18.5', 'error', `gathering.json daemon.${bk} must be a non-negative integer`));
        }
      }
    }
  }
  const reqs = Array.isArray(g.requests) ? g.requests : [];
  for (let i = 0; i < reqs.length; i++) {
    const r = reqs[i];
    if (typeof r !== 'object' || r === null) { findings.push(f('C-18.5', 'error', `gathering.json requests[${i}] is not an object`)); continue; }
    if (!GATH_ID_RE.test(r.id || '')) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].id '${r.id}' does not match the GATH grammar`));
    const tgt = r.target;
    if (!tgt || typeof tgt !== 'object') findings.push(f('C-18.5', 'error', `gathering.json requests[${i}] missing target block`));
    else {
      if (typeof tgt.text !== 'string' || tgt.text.length === 0 || tgt.text.length > 200 || /[\r\n]/.test(tgt.text)) {
        findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].target.text must be a nonempty single-line string under 200 chars`));
      }
      if (tgt.description !== undefined && (typeof tgt.description !== 'string' || tgt.description.length > 2000)) {
        findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].target.description must be a string under 2000 chars`));
      }
    }
    const locs = Array.isArray(r.locators) ? r.locators : null;
    if (!locs || locs.length === 0) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].locators must be a nonempty array`));
    else for (let L = 0; L < locs.length; L++) {
      if (!isPublicHttpsLocator(locs[L])) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].locators[${L}] '${String(locs[L]).slice(0, 40)}' is not an https public-host locator`));
    }
    if (typeof r.authority !== 'string' || r.authority.trim() === '') findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].authority must be a nonempty string`));
    if (!CRITICALITY_ENUM.includes(r.criticality)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].criticality must be one of: ${CRITICALITY_ENUM.join(', ')}`));
    if (r.cadence !== undefined && !CADENCE_ENUM.includes(r.cadence)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].cadence must be one of: ${CADENCE_ENUM.join(', ')}`));
    if (!GATH_STATUS_ENUM.includes(r.status)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].status must be one of: ${GATH_STATUS_ENUM.join(', ')}`));
    if (r.planted !== undefined && !ISO_TS_RE.test(r.planted)) findings.push(f('C-18.5', 'error', `gathering.json requests[${i}].planted must be an ISO 8601 UTC instant`));
  }
  const sweeps = Array.isArray(g.sweeps) ? g.sweeps : [];
  for (let i = 0; i < sweeps.length; i++) {
    const s = sweeps[i];
    if (typeof s !== 'object' || s === null) { findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}] is not an object`)); continue; }
    if (typeof s.id !== 'string' || s.id.trim() === '') findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].id must be a nonempty string`));
    if (s.ratified !== undefined && typeof s.ratified !== 'boolean') findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].ratified must be boolean`));
    if (s.sources !== undefined) {
      if (!Array.isArray(s.sources)) findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].sources must be an array`));
      else for (let L = 0; L < s.sources.length; L++) if (!isPublicHttpsLocator(s.sources[L])) findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}].sources[${L}] is not an https public-host locator`));
    }
  }
}
