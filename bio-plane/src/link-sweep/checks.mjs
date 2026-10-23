/* link-sweep — its checks (requirements: `build/requirements/link-sweep.md`, R1–R3; K1036 (7); DEC-49).
 *
 * Moved from `monitoring/checks.mjs` with N506 (K1159): the sweep's share of C-18.5 (`sweepGrammar`, the arm
 * `monitoring.registerSweep` takes as `grammar`, monitoring R66), its vocabularies, and the rows C-18.16–C-18.18. The
 * rows were stamped by 1.54.0 (T24's L2) as monitoring's; moving here re-points each `where` to this module's site, so
 * each is `awaiting stamp` until T25's L2 (S2; accepted red 5). */

import { isPublicHttpsLocator } from "../record-grammar/locator.mjs";
import { listFormats } from "../formats.mjs";
import { compileTerm, inScope } from "./sweep-match.mjs";
import { word, localize } from '../setup-words/index.mjs';

const at = (fn, region, file) => `src/link-sweep/${file}.mjs ${fn} > ${region}`;

/* C-18.16–C-18.18 — the link sweep's refusals at the write (R2, R3; K1036 (7)), each with nothing written. */
export const SWEEP_CHECKS = Object.freeze({
  SWEEP_TERM_REFUSED: Object.freeze({
    check: 'C-18.16',
    where: at('sweepGrammar', 'is-sweep-term', 'checks'),
    translation: word('refusal.SWEEP_TERM_REFUSED'),
  }),
  SWEEP_NOT_A_MEMBER: Object.freeze({
    check: 'C-18.17',
    where: at('sweepFence', 'is-sweep-member', 'sweep'),
    translation: word('refusal.SWEEP_NOT_A_MEMBER'),
  }),
  SWEEP_RATIFY_NOT_AN_OWNER: Object.freeze({
    check: 'C-18.18',
    where: at('sweepFence', 'is-sweep-owner', 'sweep'),
    translation: word('refusal.SWEEP_RATIFY_NOT_AN_OWNER'),
  }),
  /* R13, R14 (T51; K4189): the member's doors to define and ratify a sweep are a named member's; awaiting the stamp. */
  MACHINE_CANNOT_SET_SWEEP: Object.freeze({
    check: 'C-18.24',
    where: at('sweepSet', 'is-sweep-set-member', 'sweep'),
    translation: localize('link-sweep.checks.machine_cannot_set_sweep', 'Only a named member defines or ratifies a sweep, and this came from an automated credential. Nothing was changed.'),
  }),
});

/** A refusal answer naming one of this module's rows (DEC-49): its code, row and member's sentence, and the detail. */
export function sweepRefusal(code, detail, extra) {
  const row = SWEEP_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
}

/** R1: a sweep's fields, as C-18.5 reads them. */
export const SWEEP_FIELDS = Object.freeze(['id', 'title', 'ratified', 'sources', 'seeds', 'match', 'cadence', 'budget']);
export const SWEEP_ID_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
/** R1: the cadences a sweep takes (monitoring R14's intervals). */
export const SWEEP_CADENCES = Object.freeze(['daily', 'weekly', 'monthly']);
/** R1's bounds: sources, seeds, terms, paths and formats, each [least, most]; per_run and backlog; the title. */
export const SWEEP_BOUNDS = Object.freeze({ sources: [1, 20], seeds: [1, 10], terms: [0, 20], paths: [0, 20], formats: [0, 10],
                                            per_run: [1, 100], backlog: [1, 1000], title: 200 });

/** R1, R2: C-18.5's sweep arm over one entry of a file's `sweeps[]` that is an object (`ids` collects the file's ids,
 *  for uniqueness), the `grammar` this module registers with `monitoring.registerSweep` (monitoring R66, K1206). Each
 *  way the entry breaks its grammar is one finding per field, `{check: "C-18.5", severity: "error", message, field}`:
 *  `message` says what is wrong, beginning with the field it is about (`cadence is missing`), or with `carries` for a
 *  key that is not a sweep's field (`field` null); monitoring's R27 places it after the entry's place in the file
 *  (`gathering.json sweeps[<i>]`), as C-18.5 worded it before the split. A term R2's matcher refuses also carries
 *  `code: "SWEEP_TERM_REFUSED"` and `refusal`, the row C-18.16 answers with, naming the term and the construct. */
export function sweepGrammar(s, ids) {
  const out = [];
  const bad = (field, text, extra) => out.push({ check: 'C-18.5', severity: 'error', field, message: field ? `${field} ${text}` : text,
                                                  ...(extra || {}) });
  if (!s || typeof s !== 'object' || Array.isArray(s)) return out;
  const seen = ids instanceof Set ? ids : new Set();
  for (const k of Object.keys(s)) if (!SWEEP_FIELDS.includes(k)) bad(null, localize('link-sweep.checks.carries_string_which_is_not', 'carries \'{String}\', which is not a sweep\'s field ({SWEEP_FIELDS})', { String: String(String(k).slice(0, 40)), SWEEP_FIELDS: String(SWEEP_FIELDS.join(', ')) }));
  for (const k of SWEEP_FIELDS) if (!(k in s)) bad(k, localize('link-sweep.checks.is_missing', 'is missing'));
  if ('id' in s) {
    if (typeof s.id !== 'string' || !SWEEP_ID_RE.test(s.id)) bad('id', localize('link-sweep.checks.must_be_1_to_40', 'must be 1 to 40 lowercase letters, digits or hyphens, starting with a letter or digit'));
    else if (seen.has(s.id)) bad('id', localize('link-sweep.checks.id_is_not_unique_within', '\'{id}\' is not unique within the file', { id: String(s.id) }));
    else seen.add(s.id);
  }
  if ('title' in s && (typeof s.title !== 'string' || !s.title.trim() || s.title.length > SWEEP_BOUNDS.title || /[\r\n]/.test(s.title)))
    bad('title', localize('link-sweep.checks.must_be_a_nonempty_single', 'must be a nonempty single line of at most {title} characters', { title: String(SWEEP_BOUNDS.title) }));
  if ('ratified' in s && typeof s.ratified !== 'boolean') bad('ratified', localize('link-sweep.checks.must_be_boolean', 'must be boolean'));
  const list = (v, [lo, hi]) => Array.isArray(v) && v.length >= lo && v.length <= hi;
  let sources = null;
  if ('sources' in s) {
    if (!list(s.sources, SWEEP_BOUNDS.sources)) bad('sources', localize('link-sweep.checks.must_be_an_array_of', 'must be an array of {sources} prefixes', { sources: String(SWEEP_BOUNDS.sources.join(' to ')) }));
    else {
      const wrong = s.sources.findIndex((p) => !isPublicHttpsLocator(p) || /[?#]/.test(p));
      if (wrong >= 0) bad('sources', localize('link-sweep.checks.wrong_is_not_a_public', '[{wrong}] is not a public https prefix without a query or fragment', { wrong: String(wrong) }));
      else sources = s.sources;
    }
  }
  const scoped = (field, v) => {
    const wrong = v.findIndex((u) => !isPublicHttpsLocator(u) || (sources && !inScope(u, sources)));
    if (wrong >= 0) bad(field, localize('link-sweep.checks.wrong_is_not_a_public_2', '[{wrong}] is not a public https locator within the sweep\'s sources', { wrong: String(wrong) }));
  };
  if ('seeds' in s) {
    if (!list(s.seeds, SWEEP_BOUNDS.seeds)) bad('seeds', localize('link-sweep.checks.must_be_an_array_of_2', 'must be an array of {seeds} locators', { seeds: String(SWEEP_BOUNDS.seeds.join(' to ')) }));
    else scoped('seeds', s.seeds);
  }
  if ('match' in s) {
    const m = s.match;
    if (typeof m !== 'object' || m === null || Array.isArray(m)) bad('match', localize('link-sweep.checks.must_be_an_object', 'must be an object'));
    else {
      for (const k of Object.keys(m)) if (!['terms', 'paths', 'formats'].includes(k)) bad('match', localize('link-sweep.checks.carries_string_which_is_not_2', 'carries \'{String}\', which is not terms, paths or formats', { String: String(String(k).slice(0, 40)) }));
      if (m.terms !== undefined) {
        if (!list(m.terms, SWEEP_BOUNDS.terms)) bad('match.terms', localize('link-sweep.checks.must_be_an_array_of_3', 'must be an array of at most {v1} terms', { v1: String(SWEEP_BOUNDS.terms[1]) }));
        else m.terms.forEach((t, j) => {
          const c = compileTerm(t);
          /* DEC-49 REGION is-sweep-term */
          if (!c.ok) bad(`match.terms[${j}]`, localize('link-sweep.checks.sweep_term_refused_the_term', 'SWEEP_TERM_REFUSED: the term {stringify} is refused for {construct} ({detail})', { stringify: String(JSON.stringify(String(t).slice(0, 80))), construct: String(c.construct), detail: String(c.detail) }),
            { code: 'SWEEP_TERM_REFUSED', refusal: { code: 'SWEEP_TERM_REFUSED', check: SWEEP_CHECKS.SWEEP_TERM_REFUSED.check,
                                                     translation: SWEEP_CHECKS.SWEEP_TERM_REFUSED.translation } });
          /* END DEC-49 REGION is-sweep-term */
        });
      }
      if (m.paths !== undefined) {
        if (!list(m.paths, SWEEP_BOUNDS.paths)) bad('match.paths', localize('link-sweep.checks.must_be_an_array_of_4', 'must be an array of at most {v1} prefixes', { v1: String(SWEEP_BOUNDS.paths[1]) }));
        else scoped('match.paths', m.paths);
      }
      if (m.formats !== undefined) {
        const known = listFormats();
        if (!list(m.formats, SWEEP_BOUNDS.formats)) bad('match.formats', localize('link-sweep.checks.must_be_an_array_of_5', 'must be an array of at most {v1} format names', { v1: String(SWEEP_BOUNDS.formats[1]) }));
        else { const wrong = m.formats.findIndex((x) => !known.includes(x)); if (wrong >= 0) bad('match.formats', localize('link-sweep.checks.wrong_is_not_a_format', '[{wrong}] is not a format this instance reads ({known})', { wrong: String(wrong), known: String(known.join(', ')) })); }
      }
    }
  }
  if ('cadence' in s && !SWEEP_CADENCES.includes(s.cadence)) bad('cadence', localize('link-sweep.checks.must_be_one_of_sweep', 'must be one of: {SWEEP_CADENCES}', { SWEEP_CADENCES: String(SWEEP_CADENCES.join(', ')) }));
  if ('budget' in s) {
    const b = s.budget;
    const n = (v, [lo, hi]) => Number.isInteger(v) && v >= lo && v <= hi;
    if (typeof b !== 'object' || b === null || Array.isArray(b) || Object.keys(b).some((k) => k !== 'per_run' && k !== 'backlog')
        || !n(b.per_run, SWEEP_BOUNDS.per_run) || !n(b.backlog, SWEEP_BOUNDS.backlog))
      bad('budget', localize('link-sweep.checks.must_be_budget', 'must be {per_run, backlog}: per_run an integer {per_run_range}, backlog an integer {backlog_range}', { per_run_range: String(SWEEP_BOUNDS.per_run.join(' to ')), backlog_range: String(SWEEP_BOUNDS.backlog.join(' to ')) }));
  }
  return out;
}
