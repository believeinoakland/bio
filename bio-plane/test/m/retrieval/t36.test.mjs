/* retrieval, T36 (T36-18; N715, N724, N729; K1941, K1972, K1991, K2063, K2092), at the module's interface: who
 * recorded a found match (R73's `recorded`, R76 `registerRecordedBy`), a `.docx` table's date or amount column as one
 * result (R74), and a selection read that writes nothing (R77), with `findIn`'s `{selection}` scope reading through it.
 *
 * The four recording modules' reads (`events` R49, `standards` R49, `money` R24, `people` R36) are handed in as their
 * stated shape, so each arm here checks what retrieval does with what they answer. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { RECORDED_BY_MODULES, RECORDED_BY_LIMIT, RECORDED_NONE_REGISTERED, SELECTION_TTL_MS, FIND_KINDS }
  from "../../../src/retrieval/index.mjs";
import { listenerRefusal, MODULE_ORDER } from "../../../src/membership/index.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";
import { fresh, hold, doc, docx, wp, wr } from "../extraction/fixture.mjs";
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

test("R73 (N715): each match carries recorded — every item of the four reads whose extent is the same as, narrower than or wider than the match's, with its module, record, kind, field, relation, by, at and withdrawn; a disjoint one is not; recorded: [] when none", () => {
  const rec = quiet();
  const a = { sha: world().cap("a.pdf", "a bytes").sha };
  const at = "2026-10-08T01:00:00Z";
  rec.events = recorder("events", [
    { capture: a.sha, extent: page(0), record: "EV-1", kind: "dated_fact", field: "extent", by: V("ann"), at },
    { capture: a.sha, extent: page(1), record: "EV-2", kind: "dated_fact", field: "extent", by: V("ann"), at }]);
  rec.money = recorder("money", [
    { capture: a.sha, extent: { kind: "pdf-page", page: 0, rect: [10, 10, 50, 20] }, record: "MF-1", kind: "money_fact",
      field: "source", by: V("vera"), at, withdrawn: true }]);
  rec.standards = recorder("standards", [
    { capture: a.sha, extent: { kind: "document" }, record: "STD-1", kind: "standard", field: "text", by: V("ann"), at }]);
  const { w, b } = corpus(rec);
  const ans = find(w, { scope: { ids: ["INFO-A", "INFO-B"] }, kinds: ["money", "requirements"] });
  const money = kindOf(ans, "money").items;
  const ofA = money.find((m) => m.capture_sha === a.sha), ofB = money.find((m) => m.capture_sha === b.sha);
  assert.deepEqual(ofA.recorded.map((x) => [x.module, x.record, x.kind, x.field, x.relation, x.by, x.at, x.withdrawn]), [
    ["events", "EV-1", "dated_fact", "extent", "same", V("ann"), at, false],
    ["standards", "STD-1", "standard", "text", "wider", V("ann"), at, false],
    ["money", "MF-1", "money_fact", "source", "narrower", V("vera"), at, true]]);
  assert.deepEqual(ofB.recorded, [], "nothing recorded from b");
  const req = kindOf(ans, "requirements").items[0];
  assert.deepEqual(req.recorded.map((x) => [x.record, x.relation]), [["EV-2", "same"], ["STD-1", "wider"]],
    "page 1's requirement: its own fact and the whole document, never page 0's");
  assert.ok([...money, req].every((m) => !("recorded_truncated" in m)));
  assert.deepEqual(ans.recorded_read, ["events", "standards", "money", "people"]);
});

test("R73 (N715): each of the four reads is called once per capture the call reads, in events, standards, money, people order, under the same viewer with limit 500 and no extent; a hidden record is neither shown nor counted; a truncated read marks its capture's matches recorded_truncated", () => {
  const rec = quiet();
  const order = [];
  for (const m of RECORDED_BY_MODULES) { const f = rec[m].recordedBy; rec[m].recordedBy = (x) => { order.push(m); return f(x); }; }
  const { w, a, b } = corpus(rec);
  const people = recorder("people", [
    { capture: a.sha, extent: page(0), record: "PF-1", kind: "person_fact", field: "citation", by: V("ann"), at: "t", sight: [V("ann")] }],
    { truncated: true });
  rec.people.recordedBy = (x) => { order.push("people"); return people.recordedBy(x); };
  order.length = 0;
  const vera = find(w, { scope: { ids: ["INFO-A", "INFO-B"] }, kinds: ["money"] });
  assert.deepEqual(order, ["events", "events", "standards", "standards", "money", "money", "people", "people"]);
  for (const m of ["events", "standards", "money"])
    assert.deepEqual(rec[m].calls.slice(-2), [a.sha, b.sha].sort().map((s) => ({ captureSha: s, limit: RECORDED_BY_LIMIT, viewer: V("vera") })));
  assert.equal(RECORDED_BY_LIMIT, 500);
  const ofA = (ans) => kindOf(ans, "money").items.find((m) => m.capture_sha === a.sha);
  assert.deepEqual(ofA(vera).recorded, [], "vera may not see the person fact: not shown");
  assert.equal(ofA(vera).recorded_truncated, true);
  assert.equal(kindOf(vera, "money").items.find((m) => m.capture_sha === b.sha).recorded_truncated, true);
  const ann = w.retrieval.findIn({ viewer: V("ann"), scope: { ids: ["INFO-A", "INFO-B"] }, kinds: ["money"] });
  assert.deepEqual(ofA(ann).recorded.map((x) => [x.module, x.record]), [["people", "PF-1"]]);
});

test("R73 (N715): a table result is related through its table.extent by content.extentRelation; a match with no extent is recorded by nothing; reading writes nothing", () => {
  const rec = quiet();
  const cell = (c, value, type) => ({ source: { kind: "sheet-cell", ref: `S!${c}`, sheet: "S", cell: c }, value, type,
                                      declared: null, cached: null, formula: null });
  const xsha = world().cap("book.xlsx", "x").sha, msha = world().cap("min.pdf", "m").sha;
  rec.money = recorder("money", [
    { capture: xsha, extent: { kind: "sheet-range", sheet: "S", range: "A2:A3" }, record: "MF-9", kind: "money_fact", field: "source", by: V("ann"), at: "t" },
    { capture: xsha, extent: { kind: "sheet-cell", sheet: "S", cell: "B9" }, record: "MF-0", kind: "money_fact", field: "source", by: V("ann"), at: "t" }]);
  rec.events = recorder("events", [{ capture: msha, extent: { kind: "document" }, record: "EV-5", kind: "dated_fact", field: "extent", by: "x", at: "t" }]);
  const w2 = corpus(rec).w;
  const x2 = w2.cap("book.xlsx", "x");
  w2.doc("INFO-X", {}, { captures: [x2] });
  w2.read(x2, "INFO-X", { cells: { S: [cell("A1", "Amount (USD)", "text"), cell("A2", "5", "number"), cell("A3", "7", "number")] } });
  find(w2, { scope: { capture: x2.sha }, kinds: ["money"] });
  const snap = () => JSON.stringify(w2.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '%fts%' ORDER BY name`)
    .map((t) => [t.name, w2.rows(`SELECT * FROM "${t.name}"`)]));
  const before = snap();
  const [col] = kindOf(find(w2, { scope: { capture: x2.sha }, kinds: ["money"] }), "money").items;
  assert.deepEqual([col.table.column, col.table.extent], ["A", { kind: "sheet-range", sheet: "S", range: "A2:A3" }]);
  /* content's relation (its R6) as it reads a range against a cell elsewhere: not the match's. */
  assert.deepEqual(col.recorded.map((r) => [r.record, r.relation]), [["MF-9", "same"]]);
  assert.equal(snap(), before, "a find with its recorder reads writes nothing");
  /* An events item without a place (extent null) relates to nothing. */
  const m = w2.cap("min.pdf", "m");
  w2.doc("INFO-M", {}, { captures: [m] });
  w2.st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, content_type, reader_version, found, entity_count, reading, at)
                  VALUES (?,?,'meeting_minutes',1,1,1,?,?)`, m.sha, "INFO-M",
    JSON.stringify({ entities: [{ kind: "legislation", key: "1", label: "Item one" }] }), "t");
  const ev = kindOf(find(w2, { scope: { capture: m.sha }, kinds: ["events"] }), "events").items[0];
  assert.deepEqual([ev.extent, ev.recorded], [null, []]);
});

test("R73, R76 (N715): recorded_read names the reads that answered; recorded_not_read names each that refused, threw, answered a promise (its rejection caught) or answered another shape, with why, and the line saying no later module is registered; such a read changes nothing else", async () => {
  const rec = quiet();
  rec.events.recordedBy = () => ({ ok: false, reason: "EXTENT_MALFORMED", code: "EXTENT_MALFORMED" });
  rec.standards.recordedBy = () => { throw new Error("standards broke"); };
  rec.money.recordedBy = async () => { throw new Error("rejected"); };
  rec.people.recordedBy = () => ({ ok: true, items: "none" });
  const { w, a } = corpus(rec);
  const unhandled = [];
  const onUnhandled = (e) => unhandled.push(e);
  process.on("unhandledRejection", onUnhandled);
  const ans = find(w, { scope: { capture: a.sha }, kinds: ["money", "dates"] });
  await new Promise((r) => setTimeout(r, 20));
  process.off("unhandledRejection", onUnhandled);
  assert.deepEqual(unhandled, [], "a rejecting read never leaves an unhandled rejection");
  assert.deepEqual(ans.recorded_read, []);
  assert.deepEqual(ans.recorded_not_read.map((x) => [x.module, x.captures ?? null]),
    [["events", 1], ["standards", 1], ["money", 1], ["people", 1], [null, null]]);
  assert.match(ans.recorded_not_read[0].why, /refused: EXTENT_MALFORMED/);
  assert.match(ans.recorded_not_read[1].why, /threw: standards broke/);
  assert.match(ans.recorded_not_read[2].why, /promise/);
  assert.match(ans.recorded_not_read[3].why, /another shape/);
  assert.deepEqual(ans.recorded_not_read[4], { module: null, why: RECORDED_NONE_REGISTERED });
  assert.ok(ans.kinds.every((k) => k.items.length && k.items.every((m) => Array.isArray(m.recorded) && m.recorded.length === 0)));
  /* Nothing else moved: the same find with four quiet reads answers the same kinds, bar the recorded lists. */
  const calm = find(corpus().w, { scope: { capture: a.sha }, kinds: ["money", "dates"] });
  assert.deepEqual(ans.kinds, calm.kinds);
  assert.deepEqual(calm.recorded_read, [...RECORDED_BY_MODULES]);
  assert.deepEqual(calm.recorded_not_read, [{ module: null, why: RECORDED_NONE_REGISTERED }]);
});

test("R76 (N715): registerRecordedBy — a malformed registration and a second by one module are refused through membership's listenerRefusal; the four R73 names are held already; registered reads run after the four in the modules' total order, each answering into recorded, and one that throws is named in recorded_not_read and changes nothing else", () => {
  const { w, a } = corpus();
  const r = w.retrieval;
  for (const [m, f] of [["", () => {}], [null, () => {}], ["citation", null], ["citation", "fn"]])
    assert.deepEqual(r.registerRecordedBy(m, f), listenerRefusal([], m, f), `${m} ${typeof f}`);
  assert.equal(r.registerRecordedBy("events", () => {}).reason, "LISTENER_DECLARED", "one of the four");
  const calls = [];
  const cite = (x) => { calls.push(["citation", x]); return { ok: true, module: "citation", capture_sha: x.captureSha, truncated: false,
    items: [{ module: "citation", record: "CIT-1", kind: "citation", field: "extent", extent: JSON.parse(canonicalExtent(page(0))), relation: null,
              by: V("ann"), at: "t", withdrawn: false }] }; };
  /* Registered latest-module first. */
  assert.equal(r.registerRecordedBy("queue", () => { calls.push(["queue"]); throw new Error("late"); }).ok, true);
  assert.equal(r.registerRecordedBy("citation", cite).ok, true);
  const again = () => {};
  assert.deepEqual(r.registerRecordedBy("citation", again), listenerRefusal([{ module: "citation" }], "citation", again));
  assert.ok(MODULE_ORDER.indexOf("citation") < MODULE_ORDER.indexOf("queue"));
  const ans = find(w, { scope: { capture: a.sha }, kinds: ["money"] });
  assert.deepEqual(calls.map((c) => c[0]), ["citation", "queue"]);
  assert.deepEqual(calls[0][1], { captureSha: a.sha, limit: RECORDED_BY_LIMIT, viewer: V("vera") });
  assert.deepEqual(ans.recorded_read, [...RECORDED_BY_MODULES, "citation"]);
  assert.deepEqual(ans.recorded_not_read.map((x) => x.module), ["queue"], "no 'none registered' line once one is");
  assert.match(ans.recorded_not_read[0].why, /threw: late/);
  assert.deepEqual(kindOf(ans, "money").items[0].recorded.map((x) => [x.module, x.record, x.relation]), [["citation", "CIT-1", "same"]]);
});

/* N724: a `.docx` read from its bytes by `extraction`'s own read (its R1, R70: the cells as office-readers emits them,
   the text units as the reading's), held in this store as extraction holds a reading and its units. */
const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
async function heldDocx(w, bundleId, body) {
  const x = fresh();
  const bytes = docx(body);
  const digest = await hold(x.evidence, bytes);
  const r = await x.x.read(doc({ digest, bytes: bytes.length, ct: DOCX_CT, format: "docx", headers: [["content-type", DOCX_CT]] }));
  const real = w.cap(`${bundleId}.docx`, `docx bytes of ${bundleId}`);
  w.doc(bundleId, {}, { captures: [real] });
  w.read(real, bundleId, { cells: r.reading.cells });
  for (const u of r.text_units) w.unit(real.sha, bundleId, u.seq, u.text, u.extent);
  return { cap: real, cells: r.reading.cells, units: r.text_units };
}
const table = (rows) => `<w:tbl><w:tblGrid>${rows[0].map(() => "<w:gridCol/>").join("")}</w:tblGrid>`
  + rows.map((r) => `<w:tr>${r.map((t) => `<w:tc>${t ? wp(wr(t)) : "<w:p/>"}</w:tc>`).join("")}</w:tr>`).join("") + "</w:tbl>";

test("R74 (N724): a .docx table held as cells is a held table — its date column and its amount column are each one result naming the table (its capture, its doc-table extent, the column and the row count, its words the header), never one item per row or cell; other cells and the body are matched as paragraphs", async () => {
  const { w } = corpus();
  const body = wp(wr("A deposit of $5 was paid on March 2, 2026."))
    + table([["Paid on", "Amount ($)", "Payee"], ["2026-03-01", "$1,250.00", "Hall rental, $20 deposit"],
             ["2026-04-15", "312.50", "Chairs"], ["March 9, 2026", "40", "Refund"]])
    + wp(wr("Signed by the Treasurer."));
  const { cap, cells, units } = await heldDocx(w, "INFO-DOCX", body);
  assert.deepEqual(Object.keys(cells), ["table 1"]);
  assert.ok(units.length > 3 && units.every((u) => u.extent.kind === "doc-para"), "a .docx's units are its paragraphs, a table's cells' included");
  const ans = find(w, { scope: { capture: cap.sha }, kinds: ["money", "dates"] });
  const show = (i) => (i.table ? ["table", i.words, i.table.column, i.table.rows, i.table.extent, i.table.capture_sha === i.capture_sha]
                                : ["para", i.as_read, i.extent.kind]);
  assert.deepEqual(kindOf(ans, "money").items.map(show), [
    ["para", "$5", "doc-para"], ["para", "$20", "doc-para"],
    ["table", "Amount ($)", "B", 3, { kind: "doc-table", table: 0 }, true]]);
  assert.deepEqual(kindOf(ans, "dates").items.map(show), [
    ["para", "March 2, 2026", "doc-para"], ["table", "Paid on", "A", 3, { kind: "doc-table", table: 0 }, true]]);
  assert.ok([...kindOf(ans, "money").items, ...kindOf(ans, "dates").items].every((i) => i.capture_sha === cap.sha));
  for (const i of [...kindOf(ans, "money").items, ...kindOf(ans, "dates").items].filter((x) => x.table))
    assert.deepEqual([i.origin, i.capture_sha, i.extent], ["search", cap.sha, i.table.extent]);
  /* A table whose paragraphs are not one run in reading order (a nested table's paragraphs fall between its cells'):
     its amount column is still one result, and the paragraphs its cells name (their `paras`, T37) are left out. */
  const nested = `<w:tbl><w:tblGrid><w:gridCol/><w:gridCol/></w:tblGrid>`
    + `<w:tr><w:tc>${wp(wr("Fee"))}</w:tc><w:tc>${wp(wr("Note"))}</w:tc></w:tr>`
    + `<w:tr><w:tc>${wp(wr("$7"))}</w:tc><w:tc>${table([["Inner", "words"]])}</w:tc></w:tr>`
    + `<w:tr><w:tc>${wp(wr("$9"))}</w:tc><w:tc>${wp(wr("plain"))}</w:tc></w:tr></w:tbl>`;
  const { cap: c3, cells: k3 } = await heldDocx(w, "INFO-DOCX3", nested);
  assert.deepEqual(Object.keys(k3), ["table 1", "table 2"]);
  assert.deepEqual(kindOf(find(w, { scope: { capture: c3.sha }, kinds: ["money"] }), "money").items.map(show),
    [["table", "Fee", "A", 2, { kind: "doc-table", table: 0 }, true]]);
  /* The same table with a column of words only: nothing is a column, and its amounts are found where they are written. */
  const { cap: c2 } = await heldDocx(w, "INFO-DOCX2", table([["Item", "Note"], ["Paving", "about $30"], ["Lights", "none"]]));
  assert.deepEqual(kindOf(find(w, { scope: { capture: c2.sha }, kinds: ["money"] }), "money").items.map(show), [["para", "$30", "doc-para"]]);
});

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
  assert.deepEqual(w.retrieval.selectionRead({ handle: s.handle, owner: "x", viewer: V("vera") }).reason, "NOT_YOURS");
  assert.deepEqual(w.retrieval.selectionRead({ handle: s.handle, viewer: V("vera") }).reason, "NOT_YOURS");
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
  assert.equal(find(w, { scope: { selection: s.handle }, kinds: ["money"], owner: V("ann") }).reason, "NOT_YOURS");
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
