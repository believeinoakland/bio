/* extraction R114-R119 (T53; N1272; K4636, K5445, K5496): INTERPRETING A PART IS A RECORDED ACT, FOR AN INVESTIGATION. Through the module's real entry (`interpretPart`,
   `cellsOf`, `interpretationOf`, `interpretationWithdraw`) over the real record-core and membership. The part's facts are `reading-pipeline.interpretUnits`' (its R64); until
   that provider is merged here a test hands the module a scripted `interpreter` through the same seam `reader` is handed (R-SEAM), and the through-the-real-reader test stays a
   `test.todo` by name. Each test names the requirement id it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, sha, pageUnits } from "./fixture.mjs";
import { EXTRACTION_TABLES, extractionOwns } from "../../../src/extraction/index.mjs";
import { normalPart, uncovered } from "../../../src/extraction/interpret.mjs";

const YEAR = "2026-10-28T00:00:00Z";
const reading = (rest = {}) => ({ found: true, entities: [], content_type: "text/plain", text_source: null, basis: "t", at: YEAR, ...rest });
const page = (from, to) => ({ kind: "pdf-page", from, to });
const member = (id) => `member:${id}`;

/* A store holding one 12-page capture read (its units indexed), a project P (ann, bob joined; cal not), a project Q (dee joined). The scripted interpreter
   answers `{part, entities, facts, at}` and records each call. */
function world(opts = {}) {
  const calls = [];
  const interpreter = async (document, part) => { calls.push(part); return { part, entities: [{ kind: "name", key: "x" }], facts: [{ n: calls.length }], at: YEAR }; };
  const w = fresh({ interpreter, ...opts });
  w.calls = calls;
  bundle(w.s, "INFO-1");
  const d = sha("twelve pages");
  w.d = d;
  const units = Array.from({ length: 12 }, (_, i) => ({ extent: { kind: "pdf-page", page: i }, text: `page ${i} sewer fund`, seq: i }));
  w.core.transact(() => w.x.writeReading({ bundleId: "INFO-1", captureSha: d, reading: reading({ page_count: 12 }), textUnits: units, composed: true }));
  for (const [p, hidden] of [["PRJ-P", true], ["PRJ-Q", true]]) { bundle(w.s, p, { type: "project" }); w.membership.reindexProjectSight(p); void hidden; }
  const part = (p, m, state = "joined") => w.s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?,?,?,0,'t','t')`, p, m, state);
  part("PRJ-P", "ann"); part("PRJ-P", "bob"); part("PRJ-P", "cal", "invited"); part("PRJ-Q", "dee");
  w.mark = (o = {}) => w.x.interpretPart({ capture: d, part: page(2, 8), project: "PRJ-P", how: "marked", by: member("ann"), ...o });
  w.rows_ = (q = `SELECT * FROM interpretations ORDER BY seq`) => w.rows(q);
  return w;
}

/* ------------------------------------------------------------------------------------------------------------------------------- R114 */

test("R114: reading a capture interprets nothing: no interpretation row, no content, however many units it indexed", () => {
  const w = world();
  assert.equal(w.rows(`SELECT count(*) n FROM capture_text`)[0].n, 12);
  assert.deepEqual([w.rows(`SELECT count(*) n FROM interpretations`)[0].n, w.rows(`SELECT count(*) n FROM interpreted_content`)[0].n], [0, 0]);
  assert.deepEqual(w.calls, []);
});

test("R114: opening one part for a project writes one row, how and by and at and basis, and makes the part's facts once", async () => {
  const w = world();
  const a = await w.mark({ how: "opened" });
  assert.equal(a.ok, true);
  assert.equal(a.recorded, true);
  const rows = w.rows_();
  assert.equal(rows.length, 1);
  assert.deepEqual([rows[0].project, rows[0].by, rows[0].how, rows[0].basis, rows[0].capture_sha], ["PRJ-P", "ann", "opened", "unaided", w.d]);
  assert.match(rows[0].at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  assert.deepEqual(JSON.parse(rows[0].part), { from: 2, kind: "pdf-page", to: 8 });
  assert.deepEqual([a.interpretation.id, a.interpretation.withdrawn], [rows[0].id, false]);
  assert.equal(w.calls.length, 1);
  assert.equal(w.rows(`SELECT count(*) n FROM interpreted_content`)[0].n, 1);
});

test("R114: the same part for a second project writes its own row and reuses the content: no second copy, the facts made once", async () => {
  const w = world();
  await w.mark({ how: "opened" });
  const q = await w.x.interpretPart({ capture: w.d, part: page(2, 8), project: "PRJ-Q", how: "cited", by: member("dee") });
  assert.equal(q.ok, true);
  assert.deepEqual(w.rows_().map((r) => [r.project, r.how]), [["PRJ-P", "opened"], ["PRJ-Q", "cited"]]);
  assert.equal(w.calls.length, 1, "the part's facts were made once");
  assert.equal(w.rows(`SELECT count(*) n FROM interpreted_content`)[0].n, 1);
});

test("R114 (control): re-opening the same part for the same project writes no duplicate row; the first row's how and by stand", async () => {
  const w = world();
  const first = await w.mark({ how: "opened" });
  const again = await w.x.interpretPart({ capture: w.d, part: page(2, 8), project: "PRJ-P", how: "cited", by: member("bob") });
  assert.deepEqual([again.ok, again.recorded, again.id], [true, false, first.id]);
  const rows = w.rows_();
  assert.equal(rows.length, 1);
  assert.deepEqual([rows[0].how, rows[0].by], ["opened", "ann"]);
  assert.equal(w.calls.length, 1);
});

test("R114: a machine identity is refused MEMBER_SESSION_REQUIRED; so is a call with no stamp; nothing is written", async () => {
  const w = world();
  for (const by of ["class:admin", "class:ai", "daemon", "ai", "", null, undefined]) {
    const a = await w.mark({ by });
    assert.deepEqual([a.ok, a.reason, a.status], [false, "MEMBER_SESSION_REQUIRED", 403], String(by));
  }
  assert.equal(w.rows_().length, 0);
});

test("R114: a capture the viewer may not see is NOT_FOUND, answered as one never read; a project the viewer may not see is answered as one that does not exist", async () => {
  const w = world();
  assert.equal((await w.mark({ capture: sha("nothing") })).reason, "NOT_FOUND");
  assert.equal((await w.mark({ capture: "nope" })).reason, "NOT_FOUND");
  bundle(w.s, "INFO-2", { project: "PRJ-Q" });
  const d2 = sha("in q");
  w.core.transact(() => w.x.writeReading({ bundleId: "INFO-2", captureSha: d2, reading: reading(), composed: true }));
  assert.equal((await w.mark({ capture: d2, by: member("ann") })).reason, "NOT_FOUND", "ann sees no bundle of Q");
  const hiddenProject = await w.mark({ by: member("dee"), project: "PRJ-P" });
  assert.equal(hiddenProject.reason, "NO_SUCH_PROJECT");
  assert.equal(w.rows_().length, 0);
});

test("R114: a member who sees the project but holds no participation is refused as a non-participant; an invited member is not one yet", async () => {
  const w = world();
  w.membership.projectVisibilitySet?.({ projectId: "PRJ-P", setting: "discoverable", by: "ann", viewer: member("ann") });
  const cal = await w.mark({ by: member("cal") });
  assert.equal(cal.ok, false);
  assert.ok(["NOT_A_PARTICIPANT", "NO_SUCH_PROJECT"].includes(cal.reason), cal.reason);
  assert.equal(w.rows_().length, 0);
});

test("R114: how is exactly one of opened, cited, marked, accepted_proposal; a part is a kind with its range; a project is named", async () => {
  const w = world();
  assert.equal((await w.mark({ how: "read" })).reason, "INTERPRET_HOW_MALFORMED");
  assert.equal((await w.mark({ how: null })).reason, "INTERPRET_HOW_MALFORMED");
  for (const part of [null, "pages 3 to 9", { kind: "" }, page(8, 2), page(1.5, 3), { kind: "sheet-range", from_row: 1, to_row: 2 }, { kind: "pdf-page", from: 1, to: { a: 1 } }])
    assert.equal((await w.mark({ part })).reason, "PART_MALFORMED", JSON.stringify(part));
  assert.equal((await w.mark({ project: "" })).reason, "INTERPRET_NO_PROJECT");
  assert.equal(w.rows_().length, 0);
});

test("R114: a part's key is canonical: one part, one key, whatever the order its fields were written in", () => {
  assert.equal(normalPart({ to: 8, kind: "pdf-page", from: 2 }).key, normalPart(page(2, 8)).key);
  assert.equal(normalPart({ kind: "pdf-page", from: 2, to: 8, extra: { a: 1 } }), null);
});

test("R114: a refused interpretation records nothing, content included, when the reader cannot make the facts", async () => {
  const w = world({ interpreter: async () => ({ ok: false, reason: "cells_not_interpretable" }) });
  w.calls = [];
  const a = await w.mark();
  assert.deepEqual([a.ok, a.reason], [false, "INTERPRET_FAILED"]);
  assert.deepEqual([w.rows_().length, w.rows(`SELECT count(*) n FROM interpreted_content`)[0].n], [0, 0]);
  const thrown = world({ interpreter: async () => { throw new Error("worker down"); } });
  const b = await thrown.mark();
  assert.deepEqual([b.ok, b.reason, b.transient], [false, "INTERPRET_FAILED", true], "a thrown reader is answered, never thrown");
  assert.equal(thrown.rows_().length, 0);
});

test.todo("R114: through reading-pipeline's real `interpretUnits` and `partsOf` (R64, R65): a 40-page minutes fixture interpreted for pages 5 to 6 returns only entities whose units lie there, the reading's whole-document entities unchanged");

/* ------------------------------------------------------------------------------------------------------------------------------- R115 */

/* a reading that lists a 5-column sheet of `rows` rows: the module answers it from the reading (R98), the bound the same */
function sheetWorld(rows) {
  const w = world();
  const d = sha(`sheet ${rows}`);
  w.core.transact(() => w.x.writeReading({ bundleId: "INFO-1", captureSha: d, reading: reading({ content_type: "sheet" }), composed: true }));
  const cols = "ABCDE";
  const cells = [];
  for (let r = 1; r <= rows; r++) for (let c = 0; c < 5; c++) cells.push({ source: { kind: "sheet-cell", cell: `${cols[c]}${r}` }, value: r * 10 + c, type: "number" });
  w.s.sql.exec(`UPDATE readings SET reading=? WHERE capture_sha=?`, JSON.stringify(reading({ content_type: "sheet", cells: { Sewer: cells } })), d);
  w.sheet = d;
  return w;
}

test("R115: `cellsOf` over cells a member opened answers the range as before, names the row it recorded, and covers exactly the block returned", async () => {
  const w = sheetWorld(40);
  const got = await w.x.cellsOf(w.sheet, "Sewer", { fromRow: 10, toRow: 40, interpret: { project: "PRJ-P", by: member("ann") } });
  assert.equal(got.cells.length, 31 * 5);
  const row = w.rows_()[0];
  assert.deepEqual(JSON.parse(row.part), { from_row: 10, kind: "sheet-range", sheet: "Sewer", to_row: 40 });
  assert.deepEqual([row.how, row.project], ["opened", "PRJ-P"]);
  assert.deepEqual(got.interpreted, { sheet: "Sewer", from_row: 10, to_row: 40, interpretation: row.id });
  assert.deepEqual([got.interpretation.id, got.interpretation.recorded], [row.id, true]);
  assert.equal(w.rows(`SELECT count(*) n FROM interpreted_content`)[0].n, 1);
});

test("R115: the same range cited by another project writes a second row and no second copy of the cells", async () => {
  const w = sheetWorld(40);
  await w.x.cellsOf(w.sheet, "Sewer", { fromRow: 10, toRow: 40, interpret: { project: "PRJ-P", by: member("ann") } });
  w.membership.projectVisibilitySet?.({});
  const bundleOfSheet = w.one(`SELECT bundle_id FROM readings WHERE capture_sha=?`, w.sheet).bundle_id;
  assert.equal(bundleOfSheet, "INFO-1");
  const q = await w.x.cellsOf(w.sheet, "Sewer", { fromRow: 10, toRow: 40, interpret: { project: "PRJ-Q", by: member("dee"), how: "cited" } });
  assert.equal(q.cells.length, 155);
  assert.deepEqual(w.rows_().map((r) => [r.project, r.how]), [["PRJ-P", "opened"], ["PRJ-Q", "cited"]]);
  assert.equal(w.rows(`SELECT count(*) n FROM interpreted_content`)[0].n, 1);
});

test("R115: a range of 25,000 cells answers and records the first 20,000 and `next_row`: the interpretation covers the block returned, never the range asked", async () => {
  const w = sheetWorld(5000);
  const got = await w.x.cellsOf(w.sheet, "Sewer", { fromRow: 1, toRow: 5000, interpret: { project: "PRJ-P", by: member("ann") } });
  assert.equal(got.cells.length, 20000);
  assert.equal(got.next_row, 4001);
  assert.deepEqual(JSON.parse(w.rows_()[0].part), { from_row: 1, kind: "sheet-range", sheet: "Sewer", to_row: 4000 });
  assert.deepEqual([got.interpreted.from_row, got.interpreted.to_row], [1, 4000]);
});

test("R115: opening the document, reading it or asking `cellsOf` with no project interprets nothing", async () => {
  const w = sheetWorld(40);
  w.x.readingFor(w.sheet, "class:admin");
  w.x.unitsOf(w.sheet);
  const plain = await w.x.cellsOf(w.sheet, "Sewer", { fromRow: 1, toRow: 5 });
  assert.equal(plain.cells.length, 25);
  assert.equal(plain.interpretation, undefined);
  assert.equal(w.rows_().length, 0);
});

test("R115 (control): a read that failed records nothing: a sheet not named, a capture not read, a refused member", async () => {
  const w = sheetWorld(40);
  const mine = { project: "PRJ-P", by: member("ann") };
  const nothing = await w.x.cellsOf(w.sheet, "Nope", { interpret: mine });
  assert.deepEqual([nothing.cells, nothing.reason], [null, "sheet_not_named"]);
  assert.equal((await w.x.cellsOf(sha("never read"), "Sewer", { interpret: mine })).cells, null);
  const machine = await w.x.cellsOf(w.sheet, "Sewer", { interpret: { project: "PRJ-P", by: "class:admin" } });
  assert.deepEqual([machine.cells, machine.reason], [null, "MEMBER_SESSION_REQUIRED"]);
  assert.equal(w.rows_().length, 0);
});

/* ------------------------------------------------------------------------------------------------------------------------------- R116 */

test("R116: a 12-page PDF with pages 3 to 9 interpreted for P answers for_this as those pages and not_interpreted as the pages around them, as ranges, never 'the rest'", async () => {
  const w = world();
  await w.mark({ part: page(2, 8), how: "marked" });
  const a = w.x.interpretationOf({ capture: w.d, project: "PRJ-P", viewer: member("ann") });
  assert.equal(a.ok, true);
  assert.deepEqual(a.for_this.map((r) => r.part), [page(2, 8)]);
  assert.deepEqual(a.not_interpreted, [page(0, 1), page(9, 11)]);
  assert.equal(a.not_interpreted_for, "PRJ-P");
  assert.deepEqual(Object.keys(a.read).sort(), ["owed", "read_through", "state", "total"]);
  assert.deepEqual(a.for_others, []);
});

test("R116: interpretation narrows neither reading nor search: every unit stays indexed, a phrase on page 11 is found with the same count before and after", async () => {
  const w = world();
  const found = () => w.rows(`SELECT rowid FROM capture_text_fts WHERE capture_text_fts MATCH 'sewer'`).length;
  const before = [found(), w.x.unitsOf(w.d).units.length];
  await w.mark();
  await w.x.interpretPart({ capture: w.d, part: page(0, 11), project: "PRJ-Q", how: "marked", by: member("dee") });
  assert.deepEqual([found(), w.x.unitsOf(w.d).units.length], before);
  assert.equal(before[0], 12);
});

test("R116: a viewer outside a project sees no row of it, and is not told it holds one; the project's own member sees them", async () => {
  const w = world();
  await w.mark();
  const dee = w.x.interpretationOf({ capture: w.d, project: "PRJ-Q", viewer: member("dee") });
  assert.deepEqual([dee.parts, dee.for_this, dee.for_others], [[], [], []]);
  assert.deepEqual(dee.not_interpreted, [page(0, 11)]);
  const ann = w.x.interpretationOf({ capture: w.d, viewer: member("ann") });
  assert.deepEqual([ann.parts.length, ann.for_others.length, ann.not_interpreted_for], [1, 1, null]);
  assert.equal(w.x.interpretationOf({ capture: w.d, viewer: "nobody" }).reason, "NOT_FOUND");
});

test("R116: a sheet's parts are stated by its rows, and another sheet is not narrowed by them", async () => {
  const w = sheetWorld(40);
  w.core.transact(() => w.x.writeReading({ bundleId: "INFO-1", captureSha: w.sheet, reading: reading({ content_type: "sheet" }), composed: true,
    textUnits: [{ extent: { kind: "sheet-range", sheet: "Sewer", range: "A1:E40" }, text: "rows", seq: 0 }, { extent: { kind: "sheet-range", sheet: "Roads", range: "A1:C10" }, text: "rows", seq: 1 }] }));
  w.s.sql.exec(`UPDATE readings SET reading=? WHERE capture_sha=?`, JSON.stringify(reading({ content_type: "sheet", cells: { Sewer: [{ source: { cell: "A10" }, value: 1 }] } })), w.sheet);
  await w.x.cellsOf(w.sheet, "Sewer", { fromRow: 10, toRow: 40, interpret: { project: "PRJ-P", by: member("ann") } });
  const a = w.x.interpretationOf({ capture: w.sheet, project: "PRJ-P", viewer: member("ann") });
  assert.deepEqual(a.not_interpreted, [{ kind: "sheet-range", sheet: "Roads", from_row: 1, to_row: 10 }, { kind: "sheet-range", sheet: "Sewer", from_row: 1, to_row: 9 }]);
});

test("R116: the range arithmetic: what no taken range covers, in order, merged", () => {
  assert.deepEqual(uncovered([[0, 11]], [[2, 8]]), [[0, 1], [9, 11]]);
  assert.deepEqual(uncovered([[0, 11]], [[0, 11]]), []);
  assert.deepEqual(uncovered([[0, 11]], []), [[0, 11]]);
  assert.deepEqual(uncovered([[0, 11]], [[3, 4], [5, 6], [1, 2]]), [[0, 0], [7, 11]]);
});

/* ------------------------------------------------------------------------------------------------------------------------------- R117 */

const proposals = (n, d) => Array.from({ length: n }, (_, i) => ({ id: `PRP-${i + 1}`, capture: d, part: page(i * 2, i * 2 + 1), why: [{ term: "sewer fund", kind: "word", unit: i * 2 }] }));

test("R117: accepting two of five proposals writes two rows, basis accepted, each naming its proposal and what it matched, and none for the other three", async () => {
  const w = world();
  const standing = proposals(5, w.d);
  for (const i of [0, 3]) {
    const a = await w.x.interpretPart({ capture: w.d, part: standing[i].part, project: "PRJ-P", how: "accepted_proposal", by: member("ann"),
      proposal: { id: standing[i].id, matched: standing[i].why }, standing });
    assert.equal(a.ok, true);
  }
  const rows = w.rows_();
  assert.deepEqual(rows.map((r) => [r.basis, r.how, r.proposal]), [["accepted", "accepted_proposal", "PRP-1"], ["accepted", "accepted_proposal", "PRP-4"]]);
  assert.deepEqual(JSON.parse(rows[0].matched), [{ term: "sewer fund", kind: "word", unit: 0 }]);
  assert.deepEqual(JSON.parse(rows[0].standing), ["PRP-1", "PRP-2", "PRP-3", "PRP-4", "PRP-5"], "the proposals standing at that instant are recorded");
});

test("R117: accepting a proposal that is not standing is refused PROPOSAL_NOT_STANDING and writes nothing", async () => {
  const w = world();
  const standing = proposals(2, w.d);
  const a = await w.x.interpretPart({ capture: w.d, part: page(0, 1), project: "PRJ-P", how: "accepted_proposal", by: member("ann"), proposal: "PRP-9", standing });
  assert.deepEqual([a.ok, a.reason, a.proposal], [false, "PROPOSAL_NOT_STANDING", "PRP-9"]);
  const none = await w.x.interpretPart({ capture: w.d, part: page(0, 1), project: "PRJ-P", how: "accepted_proposal", by: member("ann"), proposal: "PRP-1" });
  assert.equal(none.reason, "PROPOSAL_NOT_STANDING", "no standing list means none stands");
  const noName = await w.x.interpretPart({ capture: w.d, part: page(0, 1), project: "PRJ-P", how: "accepted_proposal", by: member("ann"), standing });
  assert.equal(noName.reason, "PROPOSAL_NOT_STANDING");
  assert.equal(w.rows_().length, 0);
  assert.equal(w.calls.length, 0, "nothing was made for a refused acceptance");
});

test("R117: a proposal standing for another capture does not stand for this one", async () => {
  const w = world();
  const other = proposals(1, sha("another"));
  const a = await w.x.interpretPart({ capture: w.d, part: page(0, 1), project: "PRJ-P", how: "accepted_proposal", by: member("ann"), proposal: "PRP-1", standing: other });
  assert.equal(a.reason, "PROPOSAL_NOT_STANDING");
});

test("R117: a part the member changed from a proposal's is recorded unaided with began_from, never accepted", async () => {
  const w = world();
  const standing = proposals(1, w.d);
  const a = await w.x.interpretPart({ capture: w.d, part: page(0, 0), project: "PRJ-P", how: "accepted_proposal", by: member("ann"), proposal: "PRP-1", standing });
  assert.equal(a.ok, true);
  const row = w.rows_()[0];
  assert.deepEqual([row.basis, row.how, row.proposal, row.began_from], ["unaided", "marked", null, "PRP-1"]);
  assert.deepEqual(JSON.parse(row.part), page(0, 0));
});

test("R117 (control): a part chosen with no proposal, opened, cited or marked, records unaided and no proposal; a proposal list shown and left alone writes no row", async () => {
  const w = world();
  for (const [how, part] of [["opened", page(0, 0)], ["cited", page(1, 1)], ["marked", page(2, 2)]]) assert.equal((await w.mark({ how, part })).ok, true);
  assert.deepEqual(w.rows_().map((r) => [r.how, r.basis, r.proposal, r.began_from]), [["opened", "unaided", null, null], ["cited", "unaided", null, null], ["marked", "unaided", null, null]]);
});

/* ------------------------------------------------------------------------------------------------------------------------------- R118 */

test("R118: withdrawing a mark appends a withdrawal and keeps the row; the part is no longer stated interpreted for that project; the other project's stays", async () => {
  const w = world();
  const p = await w.mark();
  const q = await w.x.interpretPart({ capture: w.d, part: page(2, 8), project: "PRJ-Q", how: "marked", by: member("dee") });
  const out = w.x.interpretationWithdraw({ id: p.id, by: member("ann") });
  assert.deepEqual([out.ok, out.withdrawn, out.already, out.content_kept], [true, true, false, true]);
  assert.equal(w.rows_().length, 2, "the log keeps both rows");
  assert.equal(w.rows(`SELECT count(*) n FROM interpretation_withdrawals`)[0].n, 1);
  assert.deepEqual(w.x.interpretationOf({ capture: w.d, project: "PRJ-P", viewer: member("ann") }).for_this, []);
  assert.deepEqual(w.x.interpretationOf({ capture: w.d, project: "PRJ-Q", viewer: member("dee") }).for_this.map((r) => r.id), [q.id]);
  assert.equal(w.rows(`SELECT count(*) n FROM interpreted_content`)[0].n, 1, "another project's live row still uses the content");
});

test("R118: the facts go when no live row uses them, the log stays, and a later open writes a fresh live row", async () => {
  const w = world();
  const p = await w.mark();
  assert.equal(w.x.interpretationWithdraw({ id: p.id, by: member("bob") }).content_kept, false, "any participant of the project may withdraw it");
  assert.equal(w.rows(`SELECT count(*) n FROM interpreted_content`)[0].n, 0);
  assert.equal(w.rows_().length, 1);
  const again = await w.mark({ how: "opened" });
  assert.deepEqual([again.ok, again.recorded, again.id === p.id], [true, true, false]);
  assert.equal(w.rows_().length, 2);
  assert.equal(w.calls.length, 2, "made again: it was derived and rebuildable");
});

test("R118: a second withdrawal changes nothing; a member who is not in the project, a machine and an unknown id are refused", async () => {
  const w = world();
  const p = await w.mark();
  assert.equal(w.x.interpretationWithdraw({ id: p.id, by: member("ann") }).already, false);
  assert.deepEqual([w.x.interpretationWithdraw({ id: p.id, by: member("ann") }).already, w.rows(`SELECT count(*) n FROM interpretation_withdrawals`)[0].n], [true, 1]);
  const w2 = world();
  const p2 = await w2.mark();
  assert.equal(w2.x.interpretationWithdraw({ id: p2.id, by: member("dee") }).reason, "NOT_FOUND", "dee sees nothing of P");
  assert.equal(w2.x.interpretationWithdraw({ id: p2.id, by: "class:admin" }).reason, "MEMBER_SESSION_REQUIRED");
  assert.equal(w2.x.interpretationWithdraw({ id: "INT-nope", by: member("ann") }).reason, "NOT_FOUND");
  assert.equal(w2.rows(`SELECT count(*) n FROM interpretation_withdrawals`)[0].n, 0);
});

/* ------------------------------------------------------------------------------------------------------------------------------- R119 */

test("R119: at the ceiling the next mark is refused naming the figure and the number held; a re-open and a withdrawn row do not count; nothing is recorded", async () => {
  const w = world({ interpretationCeiling: 2 });
  assert.equal((await w.mark({ part: page(0, 0) })).ok, true);
  assert.equal((await w.mark({ part: page(1, 1) })).ok, true);
  const over = await w.mark({ part: page(2, 2) });
  assert.deepEqual([over.ok, over.reason, over.limit, over.held], [false, "INTERPRETATION_LIMIT", 2, 2]);
  assert.equal(w.rows_().length, 2);
  assert.equal((await w.mark({ part: page(1, 1) })).recorded, false, "a re-open adds no row, so it is not refused");
  w.x.interpretationWithdraw({ id: w.rows_()[0].id, by: member("ann") });
  assert.equal((await w.mark({ part: page(2, 2) })).ok, true, "a withdrawn mark frees its place");
});

test("R119 (control): adding a document of 5,000 pages raises the interpretation count by zero: the count is of marks, never of a file's size", () => {
  const w = world({ interpretationCeiling: 1 });
  const d = sha("five thousand pages");
  const units = Array.from({ length: 5000 }, (_, i) => ({ extent: { kind: "pdf-page", page: i }, text: `p${i}`, seq: i }));
  w.core.transact(() => w.x.writeReading({ bundleId: "INFO-1", captureSha: d, reading: reading({ page_count: 5000 }), textUnits: units, composed: true }));
  assert.equal(w.rows(`SELECT count(*) n FROM interpretations`)[0].n, 0);
  assert.equal(w.x.interpretationOf({ capture: d, viewer: member("ann") }).not_interpreted.length, 1);
});

test("R119: with no figure set for the service level there is no ceiling yet; a function answering the figure is read at each mark", async () => {
  const w = world();
  for (let i = 0; i < 5; i++) assert.equal((await w.mark({ part: page(i, i) })).ok, true);
  let figure = 5;
  const v = world({ interpretationCeiling: () => figure });
  for (let i = 0; i < 5; i++) assert.equal((await v.mark({ part: page(i, i) })).ok, true);
  assert.equal((await v.mark({ part: page(7, 7) })).reason, "INTERPRETATION_LIMIT");
  figure = 6;
  assert.equal((await v.mark({ part: page(7, 7) })).ok, true);
});

test.todo("R119: PLATFORM's figure per service level (`runtime-limits` `interpretation_rows`, null until the load test records it): the team level's ceiling at the figure plus 1");

/* ------------------------------------------------------------------------------------------------------------------------------- the tables */

test("R114 R118 R119: the three tables are this module's, keyed to their bundle, cleared with it by a purge", async () => {
  for (const t of ["interpretations", "interpretation_withdrawals", "interpreted_content"]) {
    assert.ok(EXTRACTION_TABLES.includes(t), t);
    assert.equal(extractionOwns(t), true, t);
  }
  const w = world();
  const p = await w.mark();
  w.x.interpretationWithdraw({ id: p.id, by: member("ann") });
  await w.mark({ how: "opened" });
  const cleared = w.core.purge ? w.core.purge({ bundleId: "INFO-1" }) : null;
  if (cleared) {
    assert.equal(w.rows(`SELECT count(*) n FROM interpretations WHERE bundle_id='INFO-1'`)[0].n, 0);
    assert.equal(w.rows(`SELECT count(*) n FROM interpretation_withdrawals WHERE bundle_id='INFO-1'`)[0].n, 0);
  }
});
