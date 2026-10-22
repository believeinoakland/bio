/* retrieval-browse — "Find in this" and browse, split from retrieval (build/requirements/retrieval-browse.md; T51-29, N1212,
 * K617, K624, K3841). Two reads that are not a search of the whole record's text: `findIn`, a find over one scope by kind
 * (people, money, dates, requirements, events, a term), each match a citable address with who already recorded it; and
 * `browse`, what the viewer may see, newest first, with no words, narrowed to what is new, watched, flagged or awaiting
 * review, with the whole set's count and the scopes a member narrows a find to (DEC-330 A14, A15). It writes nothing, runs
 * no search statement of its own and mints nothing.
 *
 * K61 / P4: `retrievalBrowseOf(deps)` answers the one instance per Durable Object storage. This module imports nothing of
 * `retrieval` (a later module): it calls back only through five host reads `retrieval` hands it — `sight`, `planOf`,
 * `runQuery`, `localeOf` and `selectionRead` (R14) — so the gate, the compile and the selections stay `retrieval`'s own
 * rules. A missing host read is a refusal named in the answer, never a throw. */
import { Browser } from "./browse.mjs";
import { Finder } from "./findin.mjs";
import { findIn } from "./find.mjs";
import { Marks } from "./marks.mjs";

export { Browser, BROWSE_KINDS, BROWSE_ONLY, BROWSE_SCOPES, BROWSE_LIMIT_DEFAULT, BROWSE_LIMIT_MAX, BROWSE_MARKS_MAX,
         BROWSE_ID_CHUNK } from "./browse.mjs";
export { Finder, FIND_KINDS, FIND_MATCHERS, FIND_CAPTURES_PER_CALL, FIND_IDS_MAX, FIND_ITEMS_DEFAULT, FIND_ITEMS_MAX,
         FIND_WORDS_MAX, FIND_TERM_MAX, FIND_EVENT_TYPES, FIND_PEOPLE_KINDS, FIND_ORIGIN, FIND_ROW_CELLS_MAX,
         RECORDED_BY_MODULES, RECORDED_BY_LIMIT, RECORDED_NONE_REGISTERED, matchMoney, matchDates, matchRequirements,
         cutWords, extentOfSource } from "./findin.mjs";

/* R14: the host reads, and what each is for. */
const HOST_READS = Object.freeze(["sight", "planOf", "runQuery", "localeOf", "selectionRead"]);

const instances = new WeakMap();

export class RetrievalBrowse {
  #sql; #marks;

  constructor({ sql, membership = null, host = null, order = null, entities = undefined, recorders = null, provenance = undefined, ...reads }) {
    if (!sql || typeof sql.exec !== "function") throw new Error("retrieval-browse: deps.sql is the Durable Object's sql");
    this.#sql = sql;
    this.membership = membership;
    this.reads = Object.freeze(Object.fromEntries(HOST_READS.filter((n) => typeof reads[n] === "function").map((n) => [n, reads[n]])));
    this.#marks = new Marks({ order, host, entities, recorders, provenance });
    this.finder = new Finder(this);
    this.browser = new Browser(this);
  }

  /* The module's own two reads over the Durable Object's sql (other modules' read contracts only). */
  rowsOf(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  oneOf(q, ...a) { const r = this.rowsOf(q, ...a); return r.length ? r[0] : null; }

  /* The host reads, as the moved code calls them. */
  sight(viewer) { return this.reads.sight(viewer); }
  planOf(input) { return this.reads.planOf(input); }
  runQuery(statement, tally) { return this.reads.runQuery(statement, tally); }
  localeOf() { return this.reads.localeOf(); }
  selectionRead(args) { return this.reads.selectionRead(args); }
  /** R14: which of `names` the host did not hand. */
  missing(names) { return names.filter((n) => !this.reads[n]); }

  entitiesFor() { return this.#marks.entitiesFor(); }
  /** R19: the parts of the captures held in parts by `bundleIds`, as provenance marks them (its R73): the digests of the
   *  parts' rows, which are no capture of their own. Only a bundle with a row of a whole (`register.whole`, provenance
   *  R48) is asked. */
  partsHeldIn(bundleIds) {
    const prov = this.#marks.provenanceFor();
    const parts = new Set();
    if (!prov || typeof prov.registeredFor !== "function") return parts;
    for (const id of bundleIds)
      for (const row of prov.registeredFor(id)) if (row.part_of) parts.add(row.capture_sha);
    return parts;
  }
  recordedReads() { return this.#marks.recordedReads(); }
  browseMarks() { return this.#marks.browseMarks(); }

  /** R1–R9: `op=findin` (`find.mjs`). */
  findIn(args = {}) { return findIn(this, args); }
  /** R10–R12: `op=browse` (`browse.mjs`). */
  browse(args = {}) { return this.browser.read(args); }
  /** R13: the ids a scope of `BROWSE_SCOPES` holds. */
  scopeMembers(args = {}) { return this.browser.scopeMembers(args); }
  /** R4, R11. */
  registerRecordedBy(module, fn) { return this.#marks.registerRecordedBy(module, fn); }
  registerBrowseMarks(module, fn) { return this.#marks.registerBrowseMarks(module, fn); }
}

/** R14: the one instance per Durable Object storage. `deps`: the Durable Object's `sql`, `membership`, `host` (from which
 *  `events`, `standards`, `money`, `people` and `entities` are made when first asked, unless handed as `recorders` and
 *  `entities`), `order` (`MODULE_ORDER` unless a test hands its own) and the five host reads. */
export function retrievalBrowseOf(deps) {
  const key = deps && deps.sql;
  let r = key && typeof key === "object" ? instances.get(key) : undefined;
  if (!r) {
    r = new RetrievalBrowse(deps || {});
    if (key && typeof key === "object") instances.set(key, r);
  }
  return r;
}
