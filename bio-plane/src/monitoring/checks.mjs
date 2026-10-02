/* monitoring — its checks (requirements: `build/requirements/monitoring.md`, R27, R42, R66; K6, K49).
 *
 * Moved from `legacy-checks` (the legacy check catalogue) in T8 with their comments: C-18.5, `checkGatheringGrammar` and
 * its four vocabularies. The grammar it reads (`isPublicHttpsLocator`, `ISO_TS_RE`) is `record-grammar`'s (T19). `legacy-checks` (since deleted) could not import this module, so its `checkBundle` stopped running C-18.5: this
 * module registers it with promotion (at the write, R27) and with record-core's audit (R42).
 *
 * T18 (R42 as worded, K649 (6)): the C-48.8 and C-48.9 rows (`DRIVE_TICK_EXPORT_IS_THE_SHELL`,
 * `DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL`) are copied here from the catalogue's `DRIVE_CAPTURE_CHECKS` with their
 * comments, code, number, translation and reasons unchanged, their `where` naming this module's site; they are no longer
 * read in place, and the catalogue's copy is T19's layer 1's to delete (K529). The rest of C-48 is `acquisition`'s (its
 * R29). New with them (N242's share, DEC-49): C-18.10, the row of C-18.5's refusal at the write, `GATHERING_REFUSED`,
 * which until now reached the wire with no translation (queue's C-19.2 `INBOX_REFUSED` is its twin). All three rows
 * were taken by the stamp 1.49.0 (T19's promotion job). T22 (R52, K1019): C-18.11–C-18.15, the refusals of an address's
 * frequency setting (`FREQUENCY_CHECKS`), taken by 1.53.0 (T23's promotion job).
 *
 * T24 (N506, K1159): the link sweep's arms of C-18.5 (`sweepErrors`, its fields, cadences and bounds, the term matcher)
 * left with the sweep for `link-sweep`, a later module, which hands them back at composition through R66's registration
 * (`checkGatheringGrammar`'s `sweepArm`); with nothing registered, C-18.5 reads no `sweeps[]` entry. C-18.17 and C-18.18
 * (the fence's refusals) left with the fence. C-18.16 `SWEEP_TERM_REFUSED` stays: R66 keeps that refusal one of this
 * module's `gatheringCheck`, which mints it. */

import { isPublicHttpsLocator } from "../record-grammar/locator.mjs";
import { ISO_TS_RE } from "../record-grammar/ids.mjs";

/* The catalogue's finding shape (legacy-checks' private `f`), for the check that moved here. */
function f(check, severity, message, extra) {
  return { check, severity, message, ...(extra || {}) };
}
function asText(v) {
  if (typeof v === 'string') return v;
  return new TextDecoder().decode(v);
}

const at = (fn, region) => `src/monitoring/index.mjs ${fn} > ${region}`;

/* D-472 — THE SHELL, ON A TICK, AND WHY IT IS ITS OWN CODE RATHER THAN C-48.5
   FIRING FROM A SECOND PLACE. A capture that meets the shell has captured
   nothing and the member's remedy is to share the file. A TICK that meets the
   shell has not captured anything either — it never would — and what it has
   lost is the CHECK: the record's last comparison still stands, undisturbed,
   and nothing about the document changed. Those are two different facts about
   the member's own situation, and DEC-49's canned translation is the sentence
   they actually read, so one sentence cannot be true of both. PL-4's rule cuts
   the same way it did for C-48.5/C-48.7: two predicates, two sites, both
   drivable — `op=acquire` drives the pair in `acquisition`, `op=monitor` drives
   this pair, and this module's tests drive both of these by name (`test/m/monitoring/tick.test.mjs` R4,
   `invariants.test.mjs` R42). */
export const DRIVE_TICK_CHECKS = Object.freeze({
  DRIVE_TICK_EXPORT_IS_THE_SHELL: Object.freeze({
    check: 'C-48.8',
    where: at('monitor', 'is-drive-tick-export'),
    translation: 'The check of that Google Drive document did not run: the export address answered '
      + 'with a web page rather than a document, which is what Drive does when a file stops being '
      + 'shared with anyone who has the link. Nothing was compared and nothing about the record '
      + 'changed — what is known is that this instance could not see the document today.',
  }),
  /* THE SAME TICK, CAUGHT ON THE BYTES. C-48.7's reasoning one op over: the
     declared type and the first kibibyte are two different pieces of evidence,
     and "Google told us it was a document and it was a web page" is the more
     serious fact. On a tick the consequence is the same either way and it is
     still worth two codes, because a tick that compared the shell would report
     the document CHANGED on every visit — the cry-wolf this row exists to end. */
  DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL: Object.freeze({
    check: 'C-48.9',
    where: at('monitor', 'is-drive-tick-bytes'),
    translation: 'The check of that Google Drive document did not run: the export address said it '
      + 'was sending a document and sent a web page instead. This instance reads the bytes rather '
      + 'than the label, so the application page was recognised and not compared against the '
      + 'captured document — comparing it would report a change on every visit that nobody made.',
  }),
});

/* C-18.10 — the gathering grammar's refusal at the write (R27; N242's share): a non-replay promotion carrying a
   `data/gathering.json` whose C-18.5 grammar finds an error. The `findings` beside it name each C-18.5 error; the
   translation is the sentence a member reads, so it says what happened and that nothing was saved. */
export const GATHERING_CHECKS = Object.freeze({
  GATHERING_REFUSED: Object.freeze({
    check: 'C-18.10',
    where: at('gatheringCheck', 'is-gathering-refused'),
    translation: 'This was not saved: the list of things to gather that it carries is not written the way the record '
      + 'writes them, and a gathering request is shown to members as data, so it must stay within its grammar. The '
      + 'findings beside this say which requests and what is wrong with each. Nothing was changed.',
  }),
});

/* C-18.11–C-18.15 — the refusals of R52's act, `addressFrequencySet` (monitoring R17 as Bob agreed it, K1019), each
   with nothing written, asked in this order. The translations are the sentences a member reads. All five were taken by
   the stamp 1.53.0 (T23's promotion job). */
export const FREQUENCY_CHECKS = Object.freeze({
  MACHINE_CANNOT_SET_FREQUENCY: Object.freeze({
    check: 'C-18.11',
    where: at('addressFrequencySet', 'is-frequency-member'),
    translation: 'How often an address is checked is set by a named member, with the member\'s reason. An assistant '
      + 'or a machine may suggest it; it may not set it. Nothing was changed.',
  }),
  NO_SUCH_ADDRESS: Object.freeze({
    check: 'C-18.12',
    where: at('addressFrequencySet', 'is-frequency-address'),
    translation: 'No monitored document you can see is checked at that address, so there is no check whose frequency '
      + 'could be set there. Nothing was changed.',
  }),
  BAD_FREQUENCY: Object.freeze({
    check: 'C-18.13',
    where: at('addressFrequencySet', 'is-frequency-word'),
    translation: 'That is not a frequency this record knows. Choose one of the listed frequencies, or none to return '
      + 'the address to the frequency its documents set. Nothing was changed.',
  }),
  NOT_A_SOURCE_OWNER: Object.freeze({
    check: 'C-18.14',
    where: at('addressFrequencySet', 'is-frequency-owner'),
    translation: 'The frequency of an address is set by an owner of a project that holds a monitored document there, '
      + 'and you own none of them. Ask an owner of one of those projects. Nothing was changed.',
  }),
  FREQUENCY_NO_REASON: Object.freeze({
    check: 'C-18.15',
    where: at('addressFrequencySet', 'is-frequency-reason'),
    translation: 'A frequency is set with a reason: one of the listed reasons, or your own words of up to 2,000 '
      + 'characters. Nothing was changed.',
  }),
});

/* C-18.16 — a sweep term refused at the write (link-sweep R2 through R66; K1036 (7)), with nothing written: the one
   refusal R27 answers before `GATHERING_REFUSED` when a registered sweep grammar marks a finding with this code. Taken by
   the stamp 1.54.0 (T24's L2). C-18.17 and C-18.18, the fence's refusals, left with the fence for `link-sweep` (N506). */
export const SWEEP_TERM_CHECKS = Object.freeze({
  SWEEP_TERM_REFUSED: Object.freeze({
    check: 'C-18.16',
    where: at('gatheringCheck', 'is-sweep-term'),
    translation: 'This was not saved: a search term of a sweep is a pattern the record cannot match safely. A term may '
      + 'be plain words or a simple pattern between slashes, without references back to an earlier part, look-aheads '
      + 'or look-behinds. The findings beside this name the term and what in it was refused. Nothing was changed.',
  }),
});

/** R42: every row this module holds, keyed by code, for a reader that looks one up by the code an answer carries. */
export const MONITORING_CHECKS = Object.freeze({ ...DRIVE_TICK_CHECKS, ...GATHERING_CHECKS, ...FREQUENCY_CHECKS, ...SWEEP_TERM_CHECKS });

/** A refusal answer naming one of this module's rows (DEC-49): its code, row and member's sentence, and the detail. */
export function frequencyRefusal(code, detail, extra) {
  const row = FREQUENCY_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
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
   which would be a second grammar pretending to be the same one.
   R66: `sweepArm`, when given, is the share a later module registered (`{module, grammar}`), which reads each
   `sweeps[]` entry that is an object. */
export function checkGatheringGrammar(ctx, findings, sweepArm = null) {
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
  /* R66 (N506): the sweep arms are the ones a later module registers; with none registered no `sweeps[]` entry is read.
     A non-object entry is this module's finding; an object entry is the registered grammar's, one finding per field,
     each `{field, message, code?}` placed here at its index. A grammar that throws, or answers no list, fails closed: the
     entry draws a C-18.5 error saying so, so the file is refused, never admitted. */
  if (!sweepArm || typeof sweepArm.grammar !== 'function') return;
  const sweeps = Array.isArray(g.sweeps) ? g.sweeps : [];
  const ids = new Set();
  for (let i = 0; i < sweeps.length; i++) {
    const s = sweeps[i];
    if (typeof s !== 'object' || s === null || Array.isArray(s)) { findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}] is not an object`)); continue; }
    let errs;
    try { errs = sweepArm.grammar(s, ids); } catch (e) { errs = e instanceof Error ? e : new Error(String(e)); }
    if (!Array.isArray(errs)) {
      const why = errs instanceof Error ? `failed (${String(errs.message).slice(0, 120)})` : 'answered no list of findings';
      findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}] could not be checked: the sweep grammar ${String(sweepArm.module)} `
        + `registered ${why}, so the entry is refused, never admitted`));
      continue;
    }
    for (const err of errs) {
      const e = err && typeof err === 'object' ? err : { message: String(err) };
      const field = typeof e.field === 'string' && e.field ? `.${e.field}` : '';
      findings.push(f('C-18.5', 'error', `gathering.json sweeps[${i}]${field} ${String(e.message ?? 'is refused')}`,
        typeof e.code === 'string' && e.code ? { code: e.code } : undefined));
    }
  }
}
