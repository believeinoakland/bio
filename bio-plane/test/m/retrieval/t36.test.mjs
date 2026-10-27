/* retrieval, T36 (N729, K1991, K2092) and T51 (R90), at the module's interface: a selection read that writes nothing (R77),
 * `findIn`'s `{selection}` scope reading through it, and the find through the four real `recordedBy` reads. The find itself
 * (its matchers, `recorded`, `registerRecordedBy`) is `retrieval-browse`'s (its R1-R4), tested there; what stays here is
 * what needs `retrieval`'s own selections and real recording modules. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { RECORDED_BY_MODULES, RECORDED_NONE_REGISTERED, SELECTION_TTL_MS, FIND_KINDS }
  from "../../../src/retrieval/index.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";
import { world as eventsWorld, MEMBER as EV_MEMBER } from "../events/fixture.mjs";
import { retrievalOf } from "../../../src/retrieval/index.mjs";
import { standardsOf } from "../../../src/standards/index.mjs";
import { moneyOf } from "../../../src/money/index.mjs";
import { peopleOf } from "../../../src/people/index.mjs";

const page = (n) => ({ kind: "pdf-page", page: n });

/** A recording module's read as R49 states it: the rows a viewer may see that cite an extent of the capture. `rows`
 *  are `{capture, extent, record, kind, field, by, at, withdrawn, sight?}`, `sight` the viewers who may see the row
 *  (every viewer when absent). Each call is logged. */
function recorder(module, rows = [], { truncated = false } = {}) {
  const calls = [];
  return {
    calls,
    recordedBy(a) {
      calls.push(a);
      const items = rows.filter((r) => r.capture === a.captureSha && (!r.sight || r.sight.includes(a.viewer)))
        .map((r) => ({ module, record: r.record, kind: r.kind, field: r.field, extent: JSON.parse(canonicalExtent(r.extent)),
                       relation: null, by: r.by, at: r.at, withdrawn: !!r.withdrawn }));
      return { ok: true, module, capture_sha: a.captureSha, items, truncated };
    },
  };
}
const quiet = () => Object.fromEntries(RECORDED_BY_MODULES.map((m) => [m, recorder(m)]));

/* A world with English, the four reads handed in, and two documents: a's page 0 holds an amount and a date, page 1 a
   requirement; b holds an amount. */
function corpus(recorders = quiet(), opts = {}) {
  const w = world({ deps: { recorders }, ...opts });
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:ann");
  w.read = (cap, bundleId, extra = {}) => w.st.sql.exec(`INSERT OR REPLACE INTO readings (capture_sha, bundle_id, content_type,
      reader_version, found, entity_count, reading, at) VALUES (?,?,?,1,0,0,?,?)`, cap.sha, bundleId, "generic",
    JSON.stringify({ content_type: "generic", entities: [], ...extra }), "2026-10-08T00:00:00Z");
  const a = w.cap("a.pdf", "a bytes"), b = w.cap("b.pdf", "b bytes");
  w.doc("INFO-A", {}, { captures: [a] });
  w.doc("INFO-B", {}, { captures: [b] });
  w.read(a, "INFO-A"); w.read(b, "INFO-B");
  w.unit(a.sha, "INFO-A", 0, "The grant of $40,000 was awarded on March 5, 2026.");
  w.unit(a.sha, "INFO-A", 1, "The Clerk shall publish it.");
  w.unit(b.sha, "INFO-B", 0, "A fee of $10 applies.");
  return { w, a, b, recorders };
}
const find = (w, args) => w.retrieval.findIn({ viewer: V("vera"), ...args });
const kindOf = (ans, k) => ans.kinds.find((x) => x.kind === k);


test("R77 (N729): selectionRead answers what selectionResolve answers at weight report — the members re-resolved under the viewer with the drift — and writes nothing: expires and every selection row byte-identical, no sweep; an unknown, released or expired handle is NO_SUCH_SELECTION (the expired one left unswept), another owner's NOT_YOURS; never throws", async () => {
  const { w } = corpus();
  const proj = w.project("Hidden", "ann");
  const s = await w.retrieval.selectionCreate({ owner: "o", viewer: V("ann"), ids: ["INFO-A", "INFO-B", proj] });
  const old = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "" });
  const rows = () => JSON.stringify([w.rows(`SELECT * FROM selections ORDER BY handle`), w.rows(`SELECT * FROM selection_items ORDER BY handle, ord`)]);
  const before = rows();
  w.clock.sel += 1000;
  const read = w.retrieval.selectionRead({ handle: s.handle, owner: "o", viewer: V("vera") });
  assert.equal(rows(), before, "nothing written");
  assert.deepEqual([read.ok, read.members, read.drift.hidden, read.moved, read.weight, read.expires],
    [true, ["INFO-A", "INFO-B"], [proj], true, "report", s.expires]);
  const resolved = w.retrieval.selectionResolve({ handle: s.handle, owner: "o", viewer: V("vera"), weight: "report" });
  assert.deepEqual({ ...read, expires: null }, { ...resolved, expires: null }, "the same answer, bar the life");
  assert.notEqual(resolved.expires, s.expires, "resolve extends; read did not");
  const after = rows();
  assert.equal(w.retrieval.selectionRead({ handle: "sel-nope", owner: "o", viewer: V("vera") }).reason, "NO_SUCH_SELECTION");
  assert.deepEqual(w.retrieval.selectionRead({ handle: s.handle, owner: "x", viewer: V("vera") }).reason, "SELECTION_NOT_YOURS");
  assert.deepEqual(w.retrieval.selectionRead({ handle: s.handle, viewer: V("vera") }).reason, "SELECTION_NOT_YOURS");
  /* `old` expires (resolve renewed `s`): read answers NO_SUCH_SELECTION and leaves it in place, unswept. */
  w.clock.sel += SELECTION_TTL_MS;
  assert.deepEqual(w.retrieval.selectionRead({ handle: old.handle, owner: "o", viewer: V("vera") }),
                   { ok: false, reason: "NO_SUCH_SELECTION", detail: "unknown, released, or expired" });
  assert.equal(rows(), after, "the expired selection stays as it was");
  assert.equal(w.count("selections"), 2);
  const t = await w.retrieval.selectionCreate({ owner: "o", viewer: V("vera"), q: "" });
  w.retrieval.selectionRelease({ handle: t.handle, owner: "o" });
  assert.equal(w.retrieval.selectionRead({ handle: t.handle, owner: "o", viewer: V("vera") }).reason, "NO_SUCH_SELECTION");
  for (const bad of [undefined, null, {}, { handle: 5, owner: [], viewer: {} }])
    assert.equal(w.retrieval.selectionRead(bad).ok, false);
  w.st.db.exec(`ALTER TABLE selections RENAME TO selections_gone`);
  assert.equal(w.retrieval.selectionRead({ handle: s.handle, owner: "o", viewer: V("vera") }).reason, "NO_SUCH_SELECTION", "never throws");
});

test("R73, R77 (N729): findIn over a {selection} reads it through selectionRead: expires and the selection rows byte-identical after the find, a refused find writes nothing, an expired handle is refused NO_SUCH_SELECTION and left unswept", async () => {
  const { w, a } = corpus();
  const s = await w.retrieval.selectionCreate({ owner: V("vera"), viewer: V("vera"), ids: ["INFO-A", "INFO-B"] });
  find(w, { scope: { capture: a.sha }, kinds: ["term"], term: "x" });   /* R69's first touch */
  const rows = () => JSON.stringify([w.rows(`SELECT * FROM selections`), w.rows(`SELECT * FROM selection_items`)]);
  const before = rows();
  w.clock.sel += 1000;
  const ok = find(w, { scope: { selection: s.handle }, kinds: [...FIND_KINDS], term: "fee" });
  assert.deepEqual([ok.ok, ok.scope.captures], [true, 2]);
  assert.equal(rows(), before);
  assert.equal(find(w, { scope: { selection: s.handle }, kinds: ["vibes"] }).reason, "KIND_UNKNOWN");
  assert.equal(find(w, { scope: { selection: s.handle }, kinds: ["money"], owner: V("ann") }).reason, "SELECTION_NOT_YOURS");
  assert.equal(rows(), before, "a refused find writes nothing");
  w.clock.sel += SELECTION_TTL_MS;
  assert.equal(find(w, { scope: { selection: s.handle }, kinds: ["money"] }).reason, "NO_SUCH_SELECTION");
  assert.equal(rows(), before, "the expired selection is not swept by a find");
});

/* T36 L5 (B4; K2122): R73 through the four real reads. The store is events' own test world (record-core, membership,
   provenance, extraction, content, entities and events, real), retrieval made over the same host, as the plane makes
   it after them; standards, money and people are reached as the plane reaches them, by their factories on the host. */
test("R73 (N715; K2122): through the four real recordedBy reads — a dated fact recorded from a found passage, then the same find names who recorded it; every read answered; a passage nobody recorded from carries recorded: []", async () => {
  const ew = eventsWorld();
  /* The plane's boot: each module made and migrated before retrieval (plane/store.mjs:167–195, :407–413). */
  for (const of of [standardsOf, moneyOf, peopleOf]) { const m = of(ew.host); if (typeof m.migrate === "function") m.migrate(); }
  const r = retrievalOf(ew.host, { record: ew.record, membership: ew.membership, extraction: ew.x });
  r.migrate();
  const s = ew.capture("minutes", { pages: 2, units: [
    { seq: 0, extent: page(0), text: "The agreement was signed on March 4, 2026 for $5,000." },
    { seq: 1, extent: page(1), text: "The next meeting is on April 9, 2026." }] });
  const look = (viewer) => r.findIn({ viewer, scope: { capture: s }, kinds: ["dates"] });
  const first = look(EV_MEMBER);
  assert.equal(first.ok, true, JSON.stringify(first).slice(0, 300));
  const p0 = kindOf(first, "dates").items.find((i) => i.extent && i.extent.page === 0);
  assert.deepEqual(p0.recorded, [], "nothing recorded yet");
  /* The member records the found passage's date, citing the match's own capture and extent. */
  const made = ew.ev.recordDatedFact({ captureSha: p0.capture_sha, extent: p0.extent, kind: "signed", value: p0.date,
                                       method: "read by a member", by: EV_MEMBER });
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 400));
  const fact = made.dated_fact;
  const again = look(EV_MEMBER);
  assert.deepEqual(again.recorded_read, [...RECORDED_BY_MODULES]);
  assert.deepEqual(again.recorded_not_read, [{ module: null, why: RECORDED_NONE_REGISTERED }]);
  const items = kindOf(again, "dates").items;
  const named = items.find((i) => i.extent && i.extent.page === 0).recorded;
  assert.deepEqual(named.map((x) => [x.module, x.record, x.kind, x.field, x.relation, x.by, x.withdrawn]),
    [["events", fact.dated_fact_id, "dated_fact", "extent", "same", EV_MEMBER, false]]);
  assert.equal(typeof named[0].at, "string");
  assert.deepEqual(items.find((i) => i.extent && i.extent.page === 1).recorded, [], "page 1: nobody recorded from it");
});
