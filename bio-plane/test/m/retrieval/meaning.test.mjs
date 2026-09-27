/* retrieval: the meaning-grain read (R10–R15, R31's C-23.1 and C-23.2), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, T0, VOCAB } from "./fixture.mjs";
import { MEANING_READ_CHECKS, meaningLevels } from "../../../src/retrieval/index.mjs";
import { MEANING, MEANING_AXIS_CAP } from "../../../src/query.mjs";

function legs(w) {
  w.doc("INFO-1");
  w.doc("INFO-2");
  w.doc("INQ-1", { object_type: "inquiry", title: "Question one" });
  w.doc("INQ-2", { object_type: "inquiry", title: "Question two" });
  const leg = (inq, ord, target, type, grade, axis = "capture") => w.st.sql.exec(
    `INSERT INTO inquiry_basis (bundle_id, ord, target_id, target_type, role, grade, grade_axis, grade_source, at)
     VALUES (?,?,?,?, 'supports', ?, ?, 'capture', ?)`, inq, ord, target, type, grade, axis, T0);
  leg("INQ-1", 0, "INFO-1", "information", "A");
  leg("INQ-1", 1, "INFO-2", "information", "B", "connection");
  leg("INQ-1", 2, "INQ-2", "inquiry", "A");
  leg("INQ-2", 0, "INFO-2", "information", null);
  leg("INQ-2", 1, "INFO-2", "information", "C");
}

test("R10, R31: no rows is MEANING_ROWS_NO_ARM (C-23.1) and an unknown arm MEANING_ROWS_UNKNOWN_ARM (C-23.2), naming every arm with its grain; each carries its check and translation", () => {
  const w = world();
  const none = w.retrieval.meaningRows({ q: "x", viewer: V("vera") });
  assert.deepEqual([none.ok, none.reason, none.check, none.translation],
    [false, "MEANING_ROWS_NO_ARM", "C-23.1", MEANING_READ_CHECKS.MEANING_ROWS_NO_ARM.translation]);
  for (const k of Object.keys(MEANING)) assert.ok(none.detail.includes(k));
  const bad = w.retrieval.meaningRows({ rows: "Bogus", viewer: V("vera") });
  assert.deepEqual([bad.ok, bad.reason, bad.check, bad.translation],
    [false, "MEANING_ROWS_UNKNOWN_ARM", "C-23.2", MEANING_READ_CHECKS.MEANING_ROWS_UNKNOWN_ARM.translation]);
  for (const [k, a] of Object.entries(MEANING)) assert.ok(bad.detail.includes(`${k} (${a.rowGrain})`), k);
  assert.match(bad.detail, /"bogus"/);
  /* The rows are this module's: C-23.1 and C-23.2, their translations in words. */
  assert.deepEqual(Object.entries(MEANING_READ_CHECKS).map(([k, r]) => [k, r.check]),
    [["MEANING_ROWS_NO_ARM", "C-23.1"], ["MEANING_ROWS_UNKNOWN_ARM", "C-23.2"]]);
  assert.ok(Object.values(MEANING_READ_CHECKS).every((r) => r.translation.length > 40 && r.where));
});

test("R11: the answer carries arm, table, grain, identity, query, gate, cached, rows, count, limit, offset, total (gated, never above what paging reaches) and the four-level statement", () => {
  const w = world();
  legs(w);
  const r = w.retrieval.meaningRows({ q: "", rows: "leg", viewer: V("vera"), limit: 2 });
  assert.equal(r.ok, true);
  for (const k of ["arm", "table", "grain", "identity", "query", "gate", "cached", "rows", "count", "limit", "offset", "total",
                   "level", "scope", "levels", "says"])
    assert.ok(Object.prototype.hasOwnProperty.call(r, k), k);
  assert.deepEqual([r.arm, r.table, r.grain, r.identity], ["leg", MEANING.leg.table, MEANING.leg.rowGrain, MEANING.leg.identity]);
  assert.deepEqual([r.count, r.limit, r.offset, r.total], [2, 2, 0, 5]);
  assert.deepEqual(Object.keys(r.query), ["q", "warnings", "meaningArms"]);
  assert.equal(r.gate.applied, 3, "count, rows, levels");
  assert.deepEqual(r.cached, []);
  const rest = w.retrieval.meaningRows({ q: "", rows: "leg", viewer: V("vera"), limit: 2, offset: 4 });
  assert.equal(rest.count, 1);
  /* An absent viewer: nothing, and a zero total. */
  const deny = w.retrieval.meaningRows({ q: "", rows: "leg", viewer: null });
  assert.deepEqual([deny.count, deny.total, deny.gate.scope], [0, 0, "DENY"]);
});

test("R12, R55: a leg row carries grade resolved on the capture axis, grade_authored verbatim and grade_why; connection legs, null grades and inquiry targets pass unchanged; one resolver call per page; with no resolver every leg passes unchanged; a second registration RESOLVER_DECLARED, a malformed one RESOLVER_MALFORMED", () => {
  const w = world();
  legs(w);
  const read = () => w.retrieval.meaningRows({ q: "", rows: "leg", viewer: V("vera") }).rows;
  const key = (r) => `${r.bundle_id}/${r.ord}`;
  /* No resolver registered. */
  const bare = Object.fromEntries(read().map((r) => [key(r), r]));
  assert.deepEqual([bare["INQ-1/0"].grade, bare["INQ-1/0"].grade_authored, bare["INQ-1/0"].grade_why], ["A", "A", null],
    "with nothing registered the leg passes unchanged (R55)");
  assert.equal(w.retrieval.registerLegGrades("strength", "not a function").reason, "RESOLVER_MALFORMED");
  assert.deepEqual([bare["INQ-1/1"].grade, bare["INQ-1/1"].grade_authored, bare["INQ-1/1"].grade_why], ["B", "B", null], "connection axis");
  assert.deepEqual([bare["INQ-1/2"].grade, bare["INQ-1/2"].grade_why], ["A", null], "an inquiry target");
  assert.deepEqual([bare["INQ-2/0"].grade, bare["INQ-2/0"].grade_authored, bare["INQ-2/0"].grade_why], [null, null, null], "a null grade");
  /* The resolver strength registers: B is the most INFO-1 can earn; INFO-2's C stands. */
  const calls = [];
  assert.equal(w.retrieval.registerLegGrades("strength", (ls) => {
    calls.push(ls);
    return ls.map((l) => (l.target_id === "INFO-1" && l.grade === "A" ? { grade: "B", why: "the record can support no more than B" } : null));
  }).ok, true);
  assert.equal(w.retrieval.registerLegGrades("other", () => []).reason, "RESOLVER_DECLARED");
  const got = Object.fromEntries(read().map((r) => [key(r), r]));
  assert.equal(calls.length, 1, "one call for the page");
  assert.deepEqual(calls[0].map((l) => [l.target_id, l.grade]).sort(), [["INFO-1", "A"], ["INFO-2", "C"]]);
  assert.deepEqual([got["INQ-1/0"].grade, got["INQ-1/0"].grade_authored, got["INQ-1/0"].grade_why],
    ["B", "A", "the record can support no more than B"]);
  assert.deepEqual([got["INQ-2/1"].grade, got["INQ-2/1"].grade_authored, got["INQ-2/1"].grade_why], ["C", "C", null]);
  /* Every other arm passes through untouched. */
  assert.ok(w.retrieval.meaningRows({ q: "", rows: "resolves", viewer: V("vera") }).rows.every((r) => !("grade_authored" in r)));
});

test("R13: the four-level statement — level; scope over the query's other arms; all four levels named (internet undetermined with its reason, document counted, content and meaning counted at the arm's own level and undetermined otherwise, each naming the read that answers it); says distinguishes no document in scope, no row of this kind, and rows the filters excluded", () => {
  const w = world();
  legs(w);
  const r = w.retrieval.meaningRows({ q: "", rows: "leg", viewer: V("vera") });
  assert.equal(r.level, "meaning");
  assert.deepEqual([r.scope.documents, r.scope.documents_with_rows, r.scope.documents_without_rows], [4, 2, 2]);
  assert.deepEqual(Object.keys(r.levels), ["internet", "document", "content", "meaning"]);
  assert.equal(r.levels.internet.state, "UNDETERMINED");
  assert.match(r.levels.internet.why, /observation log/);
  assert.equal(r.levels.document.state, "COUNTED");
  assert.equal(r.levels.content.state, "UNDETERMINED");
  assert.match(r.levels.content.why, /passage:/);
  assert.equal(r.levels.meaning.state, "COUNTED");
  assert.match(r.says, /5 row\(s\) over 4 document/);
  /* The three empties. */
  const noDoc = w.retrieval.meaningRows({ q: "id:NOPE", rows: "leg", viewer: V("vera") });
  assert.match(noDoc.says, /no document was in scope/);
  const noRows = w.retrieval.meaningRows({ q: "id:INFO-1", rows: "leg", viewer: V("vera") });
  assert.match(noRows.says, /none of which holds a row of this kind/);
  const filtered = w.retrieval.meaningRows({ q: "leg:cuts_against", rows: "leg", viewer: V("vera") });
  assert.equal(filtered.total, 0);
  assert.match(filtered.says, /filters excluded/);
  /* The content arm at its own level. */
  const content = w.retrieval.meaningRows({ q: "", rows: "content", viewer: V("vera") });
  assert.deepEqual([content.level, content.levels.content.state, content.levels.meaning.state], ["content", "COUNTED", "UNDETERMINED"]);
  assert.match(content.levels.content.why, /cited or marked citable/);
  /* The pure statement's zero-document branch, without a corpus. */
  assert.match(meaningLevels("meaning", 0, 0, 0).levels.document.why, /no document is in scope/);
});

test("R14 (K102): for rows=passage the statement carries the content-axis tally over the scope's captures, the captures not read split by the missing-row cause, and `says` leads with coverage, saying nobody has read only the never_looked ones", () => {
  const w = world();
  /* The level's first row is written before any capture below is registered, so a capture with no row entered after
     it (never_looked); one capture's reading predates the log (pre_log). */
  w.observe({ level: "content", subject_kind: "capture", subject: "0".repeat(64), authority_kind: "extract", state: "PRESENT",
              at: "2026-09-26T00:00:00Z" });
  const full = w.cap("full", "f"), part = w.cap("part", "p"), unidx = w.cap("unidx", "u"), never = w.cap("never", "n"),
        prelog = w.cap("prelog", "q"), none = w.cap("none", "z");
  w.doc("INFO-1", {}, { captures: [full, part, unidx, never, prelog, none] });
  const ex = (c, state) => w.observe({ level: "content", subject_kind: "capture", subject: c.sha, authority_kind: "extract", state, authority: "INFO-1" });
  const ix = (c, state, bound = null) => w.observe({ level: "content", subject_kind: "capture", subject: c.sha, authority_kind: "derive", state, bound, authority: "INFO-1" });
  ex(full, "PRESENT"); ix(full, "PRESENT");
  ex(part, "PRESENT"); ix(part, "partial", "unit bound");
  ex(unidx, "PRESENT");                         /* extracted, no index observation: undetermined */
  ex(none, "LOOKED_INDETERMINATE");             /* no text */
  w.reading(prelog.sha, "INFO-1");              /* read before the log: pre_log */
  w.unit(full.sha, "INFO-1", 0, "the budget passed");
  w.unit(part.sha, "INFO-1", 0, "a budget line");
  const miss = w.retrieval.meaningRows({ q: "passage:zzqx", rows: "passage", viewer: V("vera") });
  const s = miss.scope;
  assert.deepEqual([s.captures_counted, s.captures_truncated, s.captures_bound], [6, false, MEANING_AXIS_CAP]);
  assert.deepEqual([s.indexed_full, s.indexed_partial, s.indexed_none, s.not_extracted, s.undetermined], [1, 1, 1, 1, 2]);
  assert.deepEqual(s.not_read, { never_looked: 1, undetermined: 1 });
  assert.deepEqual(miss.content_axis, { vocabulary: VOCAB.CONTENT_AXIS_STATES, undetermined_value: "undetermined" });
  assert.match(miss.says, /^Coverage: /, "says leads with coverage");
  assert.match(miss.says, /1 never extracted — nobody has read them/);
  assert.match(miss.says, /1 have no extraction this record can account for/);
  assert.match(miss.says, /so it cannot say that nobody read them/);
  assert.match(miss.says, /covers only the part of the record that has been read/);
  assert.doesNotMatch(miss.says, /2 never extracted|3 never extracted/, "the undetermined captures are not said to be unread");
  /* A hit: the count of passages, and the coverage still leads. */
  const hit = w.retrieval.meaningRows({ q: "passage:budget", rows: "passage", viewer: V("vera") });
  assert.equal(hit.total, 2);
  assert.match(hit.says, /^Coverage: .*2 passage\(s\) matched/);
  /* A state the vocabulary does not know is counted undetermined, never dropped. */
  const odd = w.cap("odd", "o");
  w.doc("INFO-2", {}, { captures: [odd] });
  ex(odd, "PRESENT"); ix(odd, "SOMETHING_NEW");
  const w2 = w.retrieval.meaningRows({ q: "passage:zzqx id:INFO-2", rows: "passage", viewer: V("vera") });
  assert.deepEqual([w2.scope.captures_counted, w2.scope.indexed_full + w2.scope.indexed_partial + w2.scope.indexed_none
    + w2.scope.not_extracted + w2.scope.undetermined], [1, 1]);
});

test("R14: the tally counts at most 500 captures, observing truncation by reading one more", () => {
  const w = world();
  const caps = Array.from({ length: MEANING_AXIS_CAP + 1 }, (_, i) => w.cap(`c${i}`, `bytes ${i}`));
  w.doc("INFO-1", {}, { captures: caps });
  const r = w.retrieval.meaningRows({ q: "passage:zzqx", rows: "passage", viewer: V("vera") });
  assert.deepEqual([r.scope.captures_counted, r.scope.captures_truncated, r.scope.captures_bound], [MEANING_AXIS_CAP, true, MEANING_AXIS_CAP]);
  assert.match(r.says, /the tally covers the first 500 capture\(s\)/);
});
