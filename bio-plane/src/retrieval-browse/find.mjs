/* retrieval-browse — `findIn`'s entry (R1; moved from retrieval R73 by T51-29, K3841): the refusals in order, the scope resolved
 * under the viewer's sight to the captures it holds, the kinds, the term, the cap and the cursor. The matchers are
 * `findin.mjs`'s. It writes nothing: a selection named as the scope is read through the host's `selectionRead` (retrieval
 * R77), never resolved, so the find extends no selection's life (N729). */
import { normalizeType } from "../record-grammar/types.mjs";
import { FIND_KINDS, FIND_CAPTURES_PER_CALL, FIND_IDS_MAX, FIND_ITEMS_DEFAULT, FIND_ITEMS_MAX,
         FIND_TERM_MAX } from "./findin.mjs";
import { BROWSE_ID_CHUNK } from "./browse.mjs";
import { localize } from "../setup-words/index.mjs";

/** R1: a find over one scope, by kind, that records nothing. The scope is resolved under the viewer's sight (every capture
 *  the viewer may not see is left out and counted nowhere, R15); the kinds are answered by `findin.mjs`'s matchers over at
 *  most `FIND_CAPTURES_PER_CALL` captures, in capture-sha order, `next` naming where to continue. `owner` is the control
 *  plane's owner stamp, which a selection scope is read under (retrieval R19: a selection is its maker's); it defaults to
 *  the viewer. It calls no model. Each match carries `recorded`, who recorded it (R4's reads; `findin.mjs`). `r` is the
 *  module's context (`index.mjs`). */
export function findIn(r, { scope = null, kinds = null, term = null, limit = null, cursor = null, viewer = null, owner = null } = {}) {
  const no = (reason, detail, extra = {}) => ({ ok: false, reason, code: reason, detail, ...extra });
  if (typeof viewer !== "string" || !viewer)
    return no("VIEWER_MISSING", localize("retrieval-browse.find.viewer_missing", "a find answers only to a stamped viewer, and this request carries none"));
  if (scope == null || (typeof scope === "object" && !Array.isArray(scope) && !Object.keys(scope).length))
    return no("NO_SCOPE", localize("retrieval-browse.find.scope_missing", "a find runs over one scope: a capture, a selection, a set of ids or a project"));
  const forms = ["capture", "selection", "ids", "project"];
  const keys = scope && typeof scope === "object" && !Array.isArray(scope) ? Object.keys(scope) : null;
  if (!keys || keys.length !== 1 || !forms.includes(keys[0]))
    return no("SCOPE_UNKNOWN", localize("retrieval-browse.find.a_scope_is_exactly_one", "a scope is exactly one of {map}", { map: String(forms.map((f) => `{${f}}`).join(", ")) }), { forms });
  const form = keys[0], value = scope[form];
  /* R14: a host read the module was not handed is a refusal naming it, never a throw. */
  const absent = r.missing(["sight", "localeOf", ...(form === "selection" ? ["selectionRead"] : [])]);
  if (absent.length) return unavailable(absent);
  const resolved = scopeOf(r, form, value, viewer, typeof owner === "string" && owner ? owner : viewer);
  if (resolved.ok === false) return resolved;
  const asked = Array.isArray(kinds) ? kinds : typeof kinds === "string" && kinds ? kinds.split(",") : [];
  const wanted = [...new Set(asked.map((k) => String(k).trim()).filter(Boolean))];
  if (!wanted.length) return no("NO_KINDS", localize("retrieval-browse.find.a_find_names_the_kinds", "a find names the kinds it looks for: {FIND_KINDS}", { FIND_KINDS: String(FIND_KINDS.join(", ")) }), { kinds: FIND_KINDS });
  const unknown = wanted.filter((k) => !FIND_KINDS.includes(k));
  if (unknown.length)
    return no("KIND_UNKNOWN", localize("retrieval-browse.find.no_kind_called_map_the", "no kind called {map}; the kinds are {FIND_KINDS}", { map: String(unknown.map((k) => JSON.stringify(k.slice(0, 40))).join(", ")), FIND_KINDS: String(FIND_KINDS.join(", ")) }), { kinds: FIND_KINDS });
  const words = typeof term === "string" ? term.trim() : "";
  if (wanted.includes("term") && !words) return no("NO_TERM", localize("retrieval-browse.find.term_missing", "the kind term finds a name or term as written, and none was given"));
  const termAbsent = wanted.includes("term") ? r.missing(["planOf", "runQuery"]) : [];
  if (termAbsent.length) return unavailable(termAbsent);
  if (words.length > FIND_TERM_MAX)
    return no("TERM_TOO_LONG", localize("retrieval-browse.find.a_term_is_at_most", "a term is at most {FIND_TERM_MAX} characters", { FIND_TERM_MAX: String(FIND_TERM_MAX) }), { limit: FIND_TERM_MAX, got: words.length });
  const n = Number(limit);
  const cap = limit == null || limit === "" || !Number.isFinite(n) ? FIND_ITEMS_DEFAULT
    : Math.max(1, Math.min(FIND_ITEMS_MAX, Math.floor(n)));
  const after = typeof cursor === "string" && cursor ? cursor : null;
  const remaining = resolved.captures.filter((c) => after === null || c.capture_sha > after);
  const page = remaining.slice(0, FIND_CAPTURES_PER_CALL);
  const next = remaining.length > page.length ? page[page.length - 1].capture_sha : null;
  const finder = r.finder;
  const found = finder.find({ captures: page, kinds: wanted, term: words, limit: cap, viewer,
                              whole: after === null && next === null });
  /* R5, R6: each match names its document and, held, its content row. */
  finder.annotate(found, page, viewer);
  /* R1, R4 (N715): who recorded each match, through the recording modules' reads by capture. */
  const recorded = finder.recorded(found, page, viewer);
  return { ok: true, scope: { form, [form]: value, captures: resolved.captures.length, title: resolved.title ?? null },
           kinds: found, captures_read: page.length, limit: cap, captures_limit: FIND_CAPTURES_PER_CALL, next,
           recorded_read: recorded.read, recorded_not_read: recorded.not_read };
}

/* R14: the refusal for a host read `retrieval` did not hand this module. */
const unavailable = (missing) => ({ ok: false, reason: "HOST_READ_MISSING", code: "HOST_READ_MISSING",
  detail: localize("retrieval-browse.find.this_find_needs_missing_from", "this find needs {missing} from the host, and the module was not handed it", { missing: String(missing.join(", ")) }), missing });

/* R1's scope, resolved under the viewer's sight to the captures it holds (`[{capture_sha, bundle_id}]`, one entry per
   capture under its first visible bundle, in capture-sha order), or the scope's refusal. A capture is held by the bundles
   that register it (provenance's `register`, its R48). */
function scopeOf(r, form, value, viewer, owner) {
  const no = (reason, detail, extra = {}) => ({ ok: false, reason, code: reason, detail, ...extra });
  const sees = r.sight(viewer);
  const byCapture = new Map();
  const keep = (row) => { const b = byCapture.get(row.capture_sha); if (!b || row.bundle_id < b) byCapture.set(row.capture_sha, row.bundle_id); };
  const holdOf = (bundleIds) => {
    for (let i = 0; i < bundleIds.length; i += BROWSE_ID_CHUNK) {
      const part = bundleIds.slice(i, i + BROWSE_ID_CHUNK);
      const rows = r.rowsOf(`SELECT DISTINCT capture_sha, bundle_id, whole FROM register
                              WHERE bundle_id IN (${part.map(() => "?").join(",")})`, ...part).filter((row) => sees(row.bundle_id));
      /* R19: a capture held in parts is one capture, its whole's: the row of a part (provenance R73's `part_of`) is skipped. */
      const parts = r.partsHeldIn([...new Set(rows.filter((row) => Number(row.whole) === 1).map((row) => row.bundle_id))]);
      for (const row of rows) if (!parts.has(row.capture_sha)) keep(row);
    }
  };
  const ownersOf = (sha) => r.rowsOf(`SELECT DISTINCT capture_sha, bundle_id FROM register WHERE capture_sha = ?`, sha)
    .filter((row) => sees(row.bundle_id));
  const SHA = /^[0-9a-f]{64}$/;
  if (form === "capture") {
    const sha = typeof value === "string" ? value.trim() : "";
    const held = sha ? ownersOf(sha) : [];
    if (!held.length)
      return no("CAPTURE_NOT_HELD", localize("retrieval-browse.find.capture_not_held", "this record holds no capture with that fingerprint that you may see"));
    held.forEach(keep);
  } else if (form === "selection") {
    /* retrieval R77: read, never resolved, so the find extends no selection's life and writes nothing (N729). */
    const sel = r.selectionRead({ handle: typeof value === "string" ? value : "", viewer, owner });
    if (!sel || sel.ok !== true) return { ok: false, reason: sel && sel.reason, detail: sel && sel.detail };
    holdOf(sel.members);
  } else if (form === "ids") {
    const list = Array.isArray(value) ? [...new Set(value.filter((v) => typeof v === "string" && v).map((v) => v.trim()))] : [];
    if (list.length > FIND_IDS_MAX)
      return no("SCOPE_TOO_LARGE", localize("retrieval-browse.find.an_enumerated_scope_holds_at", "an enumerated scope holds at most {FIND_IDS_MAX} ids", { FIND_IDS_MAX: String(FIND_IDS_MAX) }), { limit: FIND_IDS_MAX, got: list.length });
    for (const id of list.filter((v) => SHA.test(v))) ownersOf(id).forEach(keep);
    holdOf(list.filter((v) => !SHA.test(v)));
  } else {
    const id = typeof value === "string" ? value.trim() : "";
    const proj = id ? r.oneOf(`SELECT bundle_id, object_type FROM bundles WHERE bundle_id = ?`, id) : null;
    if (!proj || normalizeType(proj.object_type) !== "project" || !sees(id))
      return no("NO_SUCH_PROJECT", localize("retrieval-browse.find.project_not_held", "this record holds no project by that id that you may see"));
    holdOf([id, ...r.rowsOf(`SELECT bundle_id FROM bundles WHERE project = ? ORDER BY bundle_id`, id).map((row) => row.bundle_id)]);
  }
  const captures = [...byCapture].map(([capture_sha, bundle_id]) => ({ capture_sha, bundle_id }))
    .sort((a, b) => (a.capture_sha < b.capture_sha ? -1 : a.capture_sha > b.capture_sha ? 1 : 0));
  /* R5: a capture's title is the title of the bundle R1 attributes it to, a project's its own; a set has none. */
  const titleOf = (id) => {
    const row = id ? r.oneOf(`SELECT title FROM bundles WHERE bundle_id = ?`, id) : null;
    return row && typeof row.title === "string" && row.title.trim() ? row.title : null;
  };
  const title = form === "capture" ? titleOf(captures[0] ? captures[0].bundle_id : null)
    : form === "project" ? titleOf(String(value).trim()) : null;
  return { ok: true, captures, title };
}
