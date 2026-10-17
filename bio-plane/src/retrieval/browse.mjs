/* retrieval — browse (R85, R86; T50-10; N1092, K3314; DEC-238 F1, F2, S23): what the viewer may see, newest first by last
 * change, with no words: documents, questions, actions, plans and the team's people and organisations, with `only`
 * narrowing to what is new since an instant, what the viewer watches, or what is flagged for a second look. Watching and
 * flagging are held by a later module (`following`) and reach this file only through `registerBrowseMarks` (R86).
 *
 * IT WRITES NOTHING and moves no looked-at mark (membership's `lookedAt`): browsing twice moves nothing. A bundle is
 * listed only when `membership`'s gate passes it, so an absent or unrecognised viewer sees nothing, never everything;
 * entities are team-wide (`entities` R51) but are not listed to a viewer the gate does not recognise either. A hidden
 * bundle is neither listed nor counted, and a flagged one the viewer cannot see is not shown through its flag. */
import { viewerPredicate } from "../membership/index.mjs";
import { SELECTION_ID_CHUNK } from "./schema.mjs";

/* R85: the kinds a browse is narrowed to, the bundle types behind the four that are bundles, and the entity kinds behind
   `entity` (a person; an organisation is an institution, a body or a movement). */
export const BROWSE_KINDS = Object.freeze(["document", "question", "action", "plan", "entity"]);
export const BROWSE_ONLY = Object.freeze(["new_since", "watched", "flagged"]);
const BUNDLE_TYPES = Object.freeze({ document: "information", question: "inquiry", action: "action", plan: "action_plan" });
const ORGANISATION_KINDS = Object.freeze(["institution", "body", "movement"]);
const ENTITY_KINDS = Object.freeze(["person", ...ORGANISATION_KINDS]);
const ITEM_KIND_OF_TYPE = Object.freeze(Object.fromEntries(Object.entries(BUNDLE_TYPES).map(([k, t]) => [t, k])));
/* R85: the page bound (1-200, default 50); R86: the most ids a marks read answers for a list, and for a page. */
export const BROWSE_LIMIT_DEFAULT = 50;
export const BROWSE_LIMIT_MAX = 200;
export const BROWSE_MARKS_MAX = 5000;

const text = (v) => (typeof v === "string" ? v : null);
const ms = (iso) => { const t = typeof iso === "string" ? Date.parse(iso) : NaN; return Number.isFinite(t) ? t : -Infinity; };
const refuse = (reason, detail, extra = {}) => ({ ok: false, reason, code: reason, detail, ...extra });
const idOf = (v) => (typeof v === "string" ? v : v && typeof v === "object" && typeof v.id === "string" ? v.id : null);
const flagOf = (f) => ({ by: text(f.by), at: text(f.at), note: text(f.note) });

export class Browser {
  constructor(r) { this.r = r; }

  /** R85: `op=browse`. Refusals in order, each reading nothing: VIEWER_MISSING, KIND_UNKNOWN, ONLY_UNKNOWN, NO_SINCE,
   *  BAD_SINCE. Answers `{ok, kinds, only, items, count, limit, truncated, next}`, each item `{kind, id, title,
   *  last_changed, new, watched, flagged}`, newest first, ties by id; `undetermined` when the marks could not be read. */
  read({ kinds = null, only = null, since = null, after = null, limit = null, viewer = null } = {}) {
    if (typeof viewer !== "string" || !viewer)
      return refuse("VIEWER_MISSING", "a browse answers only to a stamped viewer, and this request carries none");
    const asked = Array.isArray(kinds) ? kinds : typeof kinds === "string" && kinds ? kinds.split(",") : [];
    const named = [...new Set(asked.map((k) => String(k).trim()).filter(Boolean))];
    const unknown = named.filter((k) => k !== "all" && !BROWSE_KINDS.includes(k));
    if (unknown.length)
      return refuse("KIND_UNKNOWN", `no kind called ${unknown.map((k) => JSON.stringify(k.slice(0, 40))).join(", ")}; the kinds are ${BROWSE_KINDS.join(", ")}`,
        { kinds: BROWSE_KINDS });
    const wanted = !named.length || named.includes("all") ? [...BROWSE_KINDS] : BROWSE_KINDS.filter((k) => named.includes(k));
    const mode = only == null || only === "" ? null : String(only).trim();
    if (mode !== null && !BROWSE_ONLY.includes(mode))
      return refuse("ONLY_UNKNOWN", `no filter called ${JSON.stringify(mode.slice(0, 40))}; the filters are ${BROWSE_ONLY.join(", ")}`, { only: BROWSE_ONLY });
    const hasSince = since !== null && since !== undefined && since !== "";
    if (mode === "new_since" && !hasSince) return refuse("NO_SINCE", "new_since counts from an instant, and none was given");
    if (hasSince && (typeof since !== "string" || !Number.isFinite(Date.parse(since))))
      return refuse("BAD_SINCE", "since is an instant, as 2026-10-01T00:00:00Z");
    const sinceMs = hasSince ? Date.parse(since) : null;
    const n = Number(limit);
    const cap = limit == null || limit === "" || !Number.isFinite(n) ? BROWSE_LIMIT_DEFAULT : Math.max(1, Math.min(BROWSE_LIMIT_MAX, Math.floor(n)));
    const out = { ok: true, kinds: wanted, only: mode };
    const reg = this.r.browseMarks();
    const gate = viewerPredicate(viewer);
    const recognised = gate.scope !== "DENY";
    const undetermined = [];
    const fromList = { watched: new Set(), flagged: new Map() };

    /* The candidates: every item the viewer may see of the kinds asked, or, for watched and flagged, those the marks name. */
    let rows;
    if (!recognised) rows = [];
    else if (mode === "watched" || mode === "flagged") {
      if (!reg) return { ...out, items: [], count: 0, limit: cap, truncated: false, next: null,
                         undetermined: { why: "no module has registered the watches and flags, so which items are watched or flagged is not read" } };
      const got = this.#call(reg, { viewer, only: mode, limit: BROWSE_MARKS_MAX });
      const list = got.ok && got.value && Array.isArray(got.value.items) && typeof got.value.truncated === "boolean" ? got.value : null;
      if (!list) return { ...out, items: [], count: 0, limit: cap, truncated: false, next: null,
                          undetermined: { why: got.why || "the registered read of watches and flags answered another shape than its contract's" } };
      const ids = [];
      for (const entry of list.items.slice(0, BROWSE_MARKS_MAX)) {
        const id = idOf(entry);
        if (!id) continue;
        ids.push(id);
        if (mode === "watched") fromList.watched.add(id);
        else if (entry && typeof entry === "object") fromList.flagged.set(id, flagOf(entry));
      }
      rows = this.#byIds([...new Set(ids)], wanted, gate);
      if (list.truncated) out.markedTruncated = true;
    } else rows = this.#all(wanted, gate);

    let items = rows.map((r) => ({ ...r, ms: ms(r.last_changed) }));
    if (mode === "new_since") items = items.filter((r) => r.ms > sinceMs);
    items.sort((a, b) => (a.ms === b.ms ? (a.id < b.id ? -1 : a.id > b.id ? 1 : 0) : a.ms > b.ms ? -1 : 1));
    const cursor = parseCursor(after);
    if (cursor) items = items.filter((r) => r.ms < cursor.ms || (r.ms === cursor.ms && r.id > cursor.id));
    const page = items.slice(0, cap);
    const truncated = items.length > cap || out.markedTruncated === true;
    delete out.markedTruncated;

    /* The marks of the page's own ids (R86: at most 200), read once. */
    let marks = { watched: new Set(), flagged: new Map() };
    if (!reg) undetermined.push("no module has registered the watches and flags, so watched and flagged are not read");
    else if (page.length) {
      const got = this.#call(reg, { viewer, ids: page.map((r) => r.id) });
      const v = got.ok ? got.value : null;
      if (v && Array.isArray(v.watched) && Array.isArray(v.flagged)) {
        marks = { watched: new Set(v.watched.filter((x) => typeof x === "string")),
                  flagged: new Map(v.flagged.filter((f) => f && typeof f === "object" && typeof f.id === "string").map((f) => [f.id, flagOf(f)])) };
      } else undetermined.push(got.why || "the registered read of watches and flags answered another shape than its contract's");
    }
    const shown = page.map((r) => ({
      kind: r.kind, id: r.id, title: r.title, last_changed: r.last_changed,
      new: sinceMs !== null && r.ms > sinceMs,
      watched: marks.watched.has(r.id) || fromList.watched.has(r.id),
      flagged: marks.flagged.get(r.id) || fromList.flagged.get(r.id) || null,
    }));
    return { ...out, items: shown, count: shown.length, limit: cap, truncated,
             next: truncated && page.length ? cursorOf(page[page.length - 1]) : null,
             ...(undetermined.length ? { undetermined: { why: undetermined[0] } } : {}) };
  }

  /* R86: one call of the registered read; a throw, a promise (its rejection caught) or a non-object is no answer. */
  #call(reg, arg) {
    let a;
    try { a = reg.fn(arg); } catch (e) { return { ok: false, why: `the registered read of watches and flags threw: ${String((e && e.message) || e).slice(0, 200)}` }; }
    if (a && typeof a.then === "function") {
      Promise.resolve(a).catch(() => {});
      return { ok: false, why: "the registered read of watches and flags answered a promise: it is called in process, synchronously" };
    }
    return a && typeof a === "object" && !Array.isArray(a) ? { ok: true, value: a }
      : { ok: false, why: "the registered read of watches and flags answered another shape than its contract's" };
  }

  /* Every bundle of the kinds asked that the gate passes, and every entity of them, as `{kind, id, title, last_changed}`. */
  #all(wanted, gate) {
    const rows = [];
    const types = wanted.filter((k) => BUNDLE_TYPES[k]).map((k) => BUNDLE_TYPES[k]);
    if (types.length)
      for (const b of this.r.rowsOf(`SELECT b.bundle_id, b.object_type, b.title, b.last_updated FROM bundles b
                                      WHERE (${gate.sql}) AND b.object_type IN (${types.map(() => "?").join(",")})`, ...gate.args, ...types))
        rows.push(bundleRow(b));
    if (wanted.includes("entity"))
      for (const e of this.#entities(`SELECT entity_id, kind, label, at FROM entities WHERE kind IN (${ENTITY_KINDS.map(() => "?").join(",")})`, ENTITY_KINDS))
        rows.push(entityRow(e));
    return rows;
  }

  /* The same for named ids only, in chunks under the variable bound; an id the gate does not pass is simply absent. */
  #byIds(ids, wanted, gate) {
    const rows = [];
    const types = wanted.filter((k) => BUNDLE_TYPES[k]).map((k) => BUNDLE_TYPES[k]);
    for (let i = 0; i < ids.length; i += SELECTION_ID_CHUNK) {
      const part = ids.slice(i, i + SELECTION_ID_CHUNK);
      const marks = part.map(() => "?").join(",");
      if (types.length)
        for (const b of this.r.rowsOf(`SELECT b.bundle_id, b.object_type, b.title, b.last_updated FROM bundles b
                                        WHERE b.bundle_id IN (${marks}) AND (${gate.sql})
                                          AND b.object_type IN (${types.map(() => "?").join(",")})`, ...part, ...gate.args, ...types))
          rows.push(bundleRow(b));
      if (wanted.includes("entity"))
        for (const e of this.#entities(`SELECT entity_id, kind, label, at FROM entities WHERE entity_id IN (${marks})
                                          AND kind IN (${ENTITY_KINDS.map(() => "?").join(",")})`, [...part, ...ENTITY_KINDS]))
          rows.push(entityRow(e));
    }
    return rows;
  }

  /* The registry's table is another module's: a store that has not made it holds no entity to list. */
  #entities(sql, args) {
    try { return this.r.rowsOf(sql, ...args); } catch { return []; }
  }
}

const bundleRow = (b) => ({ kind: ITEM_KIND_OF_TYPE[b.object_type] || "document", id: b.bundle_id, title: text(b.title) || null,
                            last_changed: text(b.last_updated) });
/* An entity's last change is its creation instant: the registry holds no later one (R85). */
const entityRow = (e) => ({ kind: e.kind === "person" ? "person" : "organization", id: e.entity_id, title: text(e.label) || null,
                            last_changed: text(e.at) });

/* The cursor `next` carries: the last item's instant and id, in the order the list is kept. */
const cursorOf = (r) => `${Number.isFinite(r.ms) ? r.ms : "-"}|${r.id}`;
function parseCursor(after) {
  if (typeof after !== "string" || !after) return null;
  const at = after.indexOf("|");
  if (at < 1) return null;
  const head = after.slice(0, at);
  const t = head === "-" ? -Infinity : Number(head);
  return Number.isNaN(t) ? null : { ms: t, id: after.slice(at + 1) };
}
