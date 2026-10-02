/* link-sweep — its checks (requirements: `build/requirements/link-sweep.md`, R1–R3; K1036 (7); DEC-49).
 *
 * Moved from `monitoring/checks.mjs` with N506 (K1159): the sweep's share of C-18.5 (`sweepGrammar`, the arm
 * `monitoring.registerSweep` takes as `grammar`, monitoring R66), its vocabularies, and the rows C-18.16–C-18.18. The
 * rows were stamped by 1.54.0 (T24's L2) as monitoring's; moving here re-points each `where` to this module's site, so
 * each is `awaiting stamp` until T25's L2 (S2; accepted red 5). */

import { isPublicHttpsLocator } from "../record-grammar/locator.mjs";
import { listFormats } from "../formats.mjs";
import { compileTerm, inScope } from "./sweep-match.mjs";

const at = (fn, region, file) => `src/link-sweep/${file}.mjs ${fn} > ${region}`;

/* C-18.16–C-18.18 — the link sweep's refusals at the write (R2, R3; K1036 (7)), each with nothing written. */
export const SWEEP_CHECKS = Object.freeze({
  SWEEP_TERM_REFUSED: Object.freeze({
    check: 'C-18.16',
    where: at('sweepGrammar', 'is-sweep-term', 'checks'),
    translation: 'This was not saved: a search term of a sweep is a pattern the record cannot match safely. A term may '
      + 'be plain words or a simple pattern between slashes, without references back to an earlier part, look-aheads '
      + 'or look-behinds. The findings beside this name the term and what in it was refused. Nothing was changed.',
  }),
  SWEEP_NOT_A_MEMBER: Object.freeze({
    check: 'C-18.17',
    where: at('sweepFence', 'is-sweep-member', 'sweep'),
    translation: 'This was not saved: a sweep is added, removed or changed only by a named member. An assistant or a '
      + 'machine may stop a sweep by unratifying it, and nothing more. Nothing was changed.',
  }),
  SWEEP_RATIFY_NOT_AN_OWNER: Object.freeze({
    check: 'C-18.18',
    where: at('sweepFence', 'is-sweep-owner', 'sweep'),
    translation: 'This was not saved: a sweep is ratified, and a ratified sweep is changed, only by an owner of the '
      + 'project its list belongs to. Ask an owner of that project; anyone may still stop the sweep by unratifying it. '
      + 'Nothing was changed.',
  }),
});

/** Every row this module holds, keyed by code, for a reader that looks one up by the code an answer carries. */
export const LINK_SWEEP_CHECKS = SWEEP_CHECKS;

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
  for (const k of Object.keys(s)) if (!SWEEP_FIELDS.includes(k)) bad(null, `carries '${String(k).slice(0, 40)}', which is not a sweep's field (${SWEEP_FIELDS.join(', ')})`);
  for (const k of SWEEP_FIELDS) if (!(k in s)) bad(k, 'is missing');
  if ('id' in s) {
    if (typeof s.id !== 'string' || !SWEEP_ID_RE.test(s.id)) bad('id', 'must be 1 to 40 lowercase letters, digits or hyphens, starting with a letter or digit');
    else if (seen.has(s.id)) bad('id', `'${s.id}' is not unique within the file`);
    else seen.add(s.id);
  }
  if ('title' in s && (typeof s.title !== 'string' || !s.title.trim() || s.title.length > SWEEP_BOUNDS.title || /[\r\n]/.test(s.title)))
    bad('title', `must be a nonempty single line of at most ${SWEEP_BOUNDS.title} characters`);
  if ('ratified' in s && typeof s.ratified !== 'boolean') bad('ratified', 'must be boolean');
  const list = (v, [lo, hi]) => Array.isArray(v) && v.length >= lo && v.length <= hi;
  let sources = null;
  if ('sources' in s) {
    if (!list(s.sources, SWEEP_BOUNDS.sources)) bad('sources', `must be an array of ${SWEEP_BOUNDS.sources.join(' to ')} prefixes`);
    else {
      const wrong = s.sources.findIndex((p) => !isPublicHttpsLocator(p) || /[?#]/.test(p));
      if (wrong >= 0) bad('sources', `[${wrong}] is not a public https prefix without a query or fragment`);
      else sources = s.sources;
    }
  }
  const scoped = (field, v) => {
    const wrong = v.findIndex((u) => !isPublicHttpsLocator(u) || (sources && !inScope(u, sources)));
    if (wrong >= 0) bad(field, `[${wrong}] is not a public https locator within the sweep's sources`);
  };
  if ('seeds' in s) {
    if (!list(s.seeds, SWEEP_BOUNDS.seeds)) bad('seeds', `must be an array of ${SWEEP_BOUNDS.seeds.join(' to ')} locators`);
    else scoped('seeds', s.seeds);
  }
  if ('match' in s) {
    const m = s.match;
    if (typeof m !== 'object' || m === null || Array.isArray(m)) bad('match', 'must be an object');
    else {
      for (const k of Object.keys(m)) if (!['terms', 'paths', 'formats'].includes(k)) bad('match', `carries '${String(k).slice(0, 40)}', which is not terms, paths or formats`);
      if (m.terms !== undefined) {
        if (!list(m.terms, SWEEP_BOUNDS.terms)) bad('match.terms', `must be an array of at most ${SWEEP_BOUNDS.terms[1]} terms`);
        else m.terms.forEach((t, j) => {
          const c = compileTerm(t);
          /* DEC-49 REGION is-sweep-term */
          if (!c.ok) bad(`match.terms[${j}]`, `SWEEP_TERM_REFUSED: the term ${JSON.stringify(String(t).slice(0, 80))} is refused for ${c.construct} (${c.detail})`,
            { code: 'SWEEP_TERM_REFUSED', refusal: { code: 'SWEEP_TERM_REFUSED', check: SWEEP_CHECKS.SWEEP_TERM_REFUSED.check,
                                                     translation: SWEEP_CHECKS.SWEEP_TERM_REFUSED.translation } });
          /* END DEC-49 REGION is-sweep-term */
        });
      }
      if (m.paths !== undefined) {
        if (!list(m.paths, SWEEP_BOUNDS.paths)) bad('match.paths', `must be an array of at most ${SWEEP_BOUNDS.paths[1]} prefixes`);
        else scoped('match.paths', m.paths);
      }
      if (m.formats !== undefined) {
        const known = listFormats();
        if (!list(m.formats, SWEEP_BOUNDS.formats)) bad('match.formats', `must be an array of at most ${SWEEP_BOUNDS.formats[1]} format names`);
        else { const wrong = m.formats.findIndex((x) => !known.includes(x)); if (wrong >= 0) bad('match.formats', `[${wrong}] is not a format this instance reads (${known.join(', ')})`); }
      }
    }
  }
  if ('cadence' in s && !SWEEP_CADENCES.includes(s.cadence)) bad('cadence', `must be one of: ${SWEEP_CADENCES.join(', ')}`);
  if ('budget' in s) {
    const b = s.budget;
    const n = (v, [lo, hi]) => Number.isInteger(v) && v >= lo && v <= hi;
    if (typeof b !== 'object' || b === null || Array.isArray(b) || Object.keys(b).some((k) => k !== 'per_run' && k !== 'backlog')
        || !n(b.per_run, SWEEP_BOUNDS.per_run) || !n(b.backlog, SWEEP_BOUNDS.backlog))
      bad('budget', `must be {per_run, backlog}: per_run an integer ${SWEEP_BOUNDS.per_run.join(' to ')}, backlog an integer ${SWEEP_BOUNDS.backlog.join(' to ')}`);
  }
  return out;
}
