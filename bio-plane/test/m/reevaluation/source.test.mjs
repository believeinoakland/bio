/* reevaluation: a source's rung moved (R28, N364; DEC-78 item 5(e), K547). A dependent carries the cause `source` when a
   live leg rests on a capture whose source moved rung after the dependent's last write; the moves are those this module
   heard from `sources.onDisclosure` and kept, one row per move whose rung changed (R18); each is told to R8's listeners as
   `kind: "source"`, carrying no value; `rungOf` is never called on a read; the leg's grade is never changed. The source
   is the real `sources` module; the knocks capture pulled are the fixture's stand-in. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, U, V, MACHINE } from "./fixture.mjs";
import { CAUSE_SOURCES } from "../../../src/reevaluation/index.mjs";

const DOC = "INFO-2026-0001-given", ELSE = "INFO-2026-0002-fetched";
const D = "INQ-2026-0001-passage", W = "INQ-2026-0002-whole", O = "INQ-2026-0003-other";
const ADMIN = "class:admin";
const VALUE = "clerk of the works";

/** DOC holds capture a, given by a knocker; D rests on a passage of it (graded), W on DOC whole, O on another document.
 *  The source behind a is minted by a member's read (sources R1). */
function given() {
  const w = world();
  const a = w.cap("a", "the given text"), b = w.cap("b", "a fetched text");
  w.doc(DOC, [a]); w.doc(ELSE, [b]);
  w.read(a.sha, [U(0, "x"), U(1, "the fee rose")]);
  const ca = w.passage(DOC, a.sha);
  w.inquiry(D, { legs: [{ target: DOC, content_id: ca, grade: "B", grade_axis: "capture", grade_source: "capture" }] });
  w.inquiry(W, { legs: [{ target: DOC }] });
  w.inquiry(O, { legs: [{ target: ELSE }] });
  const src = w.knocked(a.sha);
  return { w, a, b, ca, src };
}
const sourced = (o) => o.causes.filter((c) => c.source === "source");

test("R28 R2: a live leg on a capture whose source moved rung after the dependent's last write carries `source`, with both rungs and the move's instant; a passage leg and a whole-document leg alike", () => {
  const { w, a, ca, src } = given();
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0, "a source minted is no move");
  const e = w.disclose(src, { kind: "attribute", attribute: "role", value: VALUE });
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(r.obligations.map((o) => [o.bundle_id, o.target]), [[D, DOC], [W, DOC]], "O rests on a fetched document");
  for (const o of r.obligations) {
    const [c] = sourced(o);
    assert.deepEqual([c.source, c.since, c.ord, c.source_id, c.entry, c.rung_before, c.rung_after, c.capture_sha],
      ["source", w.clock.now, 0, src, e.entry, "unknown", "partly_known", a.sha]);
    assert.match(c.detail, /moved from unknown to partly_known at .*grade is unchanged/s);
    assert.deepEqual(o.reeval, { flag: true, since: w.clock.now, source: "source" });
  }
  const d = r.obligations.find((o) => o.bundle_id === D);
  assert.deepEqual([d.legs[0].grade, d.legs[0].grade_authored], ["B", "B"], "it never regrades");
  assert.equal(w.fm(D).basis[0].grade, "B");
  assert.equal(w.rows(`SELECT grade FROM inquiry_basis WHERE bundle_id=?`, D)[0].grade, "B");
  assert.ok(CAUSE_SOURCES.includes("source"));
  /* asked of the target */
  assert.deepEqual(w.r.reevaluations({ target: DOC, viewer: ADMIN }).obligations.map((o) => o.bundle_id), [D, W]);
  assert.equal(w.r.reevaluations({ target: ELSE, viewer: ADMIN }).count, 0);
  assert.ok(ca);
});

test("R28: a dependent written after the move does not carry it; a later move does; a severed leg rests on nothing", () => {
  const { w, src } = given();
  w.disclose(src);
  const text = w.text(D).replace(/last_updated: "[^"]+"/, 'last_updated: "2026-09-29T00:00:00Z"');
  assert.equal(w.promote(D, text).ok, true);
  assert.deepEqual(w.r.reevaluations({ viewer: ADMIN }).obligations.map((o) => o.bundle_id), [W], "D was written after");
  w.clock.now = "2026-09-30T00:00:00Z";
  w.disclose(src, { kind: "name", value: "Pat Q. Example" });
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(r.obligations.map((o) => [o.bundle_id, sourced(o).map((c) => [c.rung_before, c.rung_after])]),
    [[D, [["partly_known", "known_to_group"]]], [W, [["partly_known", "known_to_group"], ["unknown", "partly_known"]]]],
    "each move a cause, the latest first");
  /* a severed leg */
  const SEV = "INQ-2026-0004-sev";
  w.inquiry(SEV, { legs: [{ target: DOC }], refs: [{ target: DOC, rel: "cites", status: "severed" }] });
  w.clock.now = "2026-09-30T01:00:00Z";
  w.disclose(src, { kind: "name", value: "Pat Q. Example" }, { knownTo: "public", evidence: { cite: "https://example.org/x" } });
  assert.ok(!w.r.reevaluations({ viewer: ADMIN }).obligations.some((o) => o.bundle_id === SEV), "a severed leg is not live");
});

test("R28 R18: a move whose rung did not change writes nothing and tells nobody; each move kept is one row with no value", () => {
  const { w, src } = given();
  const heard = [];
  w.r.onBasisChanged("conformance", (e) => heard.push(e));
  w.disclose(src, { kind: "attribute", attribute: "role", value: VALUE });
  assert.equal(w.count("reevaluation_source_moves"), 1);
  w.disclose(src, { kind: "attribute", attribute: "employer", value: "the works department" });
  assert.equal(w.count("reevaluation_source_moves"), 1, "partly_known to partly_known is no move");
  assert.equal(heard.length, 1);
  const rows = w.rows(`SELECT source_id, entry_id, rung_before, rung_after, at FROM reevaluation_source_moves`);
  assert.deepEqual(Object.keys(rows[0]).sort(), ["at", "entry_id", "rung_after", "rung_before", "source_id"]);
  assert.ok(!JSON.stringify(rows).includes(VALUE) && !JSON.stringify(heard).includes(VALUE), "no value is kept or told");
  assert.deepEqual(w.r.sourceMoved({ source: src, rung_before: "known_to_group", rung_after: "known_to_group" }), { ok: true, moved: false });
  assert.deepEqual(w.r.sourceMoved({}), { ok: true, moved: false });
  assert.equal(w.count("reevaluation_source_moves"), 1);
});

test("R28 R8: each move is told once to R8's listeners as kind source, after its row is written, naming the live legs; a listener that throws never undoes the disclosure", () => {
  const { w, src } = given();
  const heard = [];
  w.r.onBasisChanged("conformance", (e) => { heard.push({ ...e, rows: w.count("reevaluation_source_moves") }); });
  w.r.onBasisChanged("consequences", () => { throw new Error("boom"); });
  const e = w.disclose(src);
  assert.equal(e.ok, true, "the act stands");
  assert.equal(heard.length, 1);
  const [h] = heard;
  assert.deepEqual([h.kind, h.subject, h.source, h.since, h.rung_before, h.rung_after, h.rows],
    ["source", src, "source", w.clock.now, "unknown", "partly_known", 1]);
  assert.deepEqual(h.dependents, [{ bundle_id: D, ord: 0, role: "supports", state: "open", target: DOC },
                                  { bundle_id: W, ord: 0, role: "supports", state: "open", target: DOC }]);
  assert.equal(typeof h.detail, "string");
  const direct = w.r.sourceMoved({ source: src, entry: "x", rung_before: "partly_known", rung_after: "known_to_group" });
  assert.deepEqual([direct.moved, direct.dependents, direct.listeners_failed], [true, 2, ["consequences"]]);
});

test("R28 R16 R9: a recorded re-evaluation closes the source cause until the source moves again; changesOf answers it with its target", () => {
  const { w, src } = given();
  w.disclose(src);
  const ch = w.r.changesOf({ findings: [D, O], viewer: ADMIN });
  assert.deepEqual(ch.findings.map((f) => [f.id, f.causes.map((c) => [c.source, c.target, c.rung_after])]),
    [[D, [["source", DOC, "partly_known"]]], [O, []]]);
  assert.equal(w.r.recordReevaluation({ dependent: D, target: DOC, source: "source", note: "x", author: MACHINE, viewer: ADMIN }).code,
    "MACHINE_CANNOT_RECORD_REEVALUATION");
  const ok = w.r.recordReevaluation({ dependent: D, target: DOC, source: "source", note: "the role changes nothing",
                                      author: "alice", viewer: ADMIN });
  assert.deepEqual([ok.ok, ok.since], [true, w.clock.now]);
  assert.deepEqual(w.r.reevaluations({ viewer: ADMIN }).obligations.map((o) => o.bundle_id), [W]);
  assert.deepEqual(w.r.changesOf({ findings: [D], viewer: ADMIN }).findings[0].causes, []);
  w.clock.now = "2026-09-29T00:00:00Z";
  w.disclose(src, { kind: "name", value: "Pat Q. Example" });
  assert.deepEqual(w.r.reevaluations({ viewer: ADMIN }).obligations.map((o) => o.bundle_id), [D, W], "moved again: owed again");
});

test("R28 R18 R20: the reads write nothing and never call rungOf; a dependent the viewer may not see is withheld", () => {
  const { w, src } = given();
  w.disclose(src);
  w.sources.rungOf = () => { throw new Error("rungOf is never called on a read"); };
  w.member("ann");
  const before = w.snapshot();
  const all = w.r.reevaluations({ viewer: ADMIN });
  w.r.changesOf({ findings: [D, W], viewer: ADMIN });
  w.r.reevaluations({ target: DOC, viewer: ADMIN });
  const ann = w.r.reevaluations({ viewer: V("ann") });
  assert.deepEqual(w.snapshot(), before, "no table changes across the reads, the source read log included");
  assert.equal(all.count, 2);
  assert.deepEqual(ann.obligations.map((o) => o.bundle_id), [D, W], "a member sees the same record facts");
  const none = w.r.reevaluations({ viewer: "nobody" });
  assert.deepEqual([none.count, Object.keys(none).filter((k) => /withheld|hidden/.test(k))], [0, []]);
});

test("R28: a capture no source stands behind, and a store where no move was ever heard, carry no source cause", () => {
  const w = world();
  const a = w.cap("a", "fetched");
  w.doc(DOC, [a]);
  w.inquiry(D, { legs: [{ target: DOC }] });
  assert.equal(w.count("reevaluation_source_moves"), 0);
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0);
  const { w: w2, src } = given();
  const other = w2.knocked(w2.cap("z", "another given text").sha);
  w2.disclose(other);
  assert.equal(w2.r.reevaluations({ viewer: ADMIN }).count, 0, "a move of a source behind no capture a leg rests on");
  assert.ok(src && inquiryMd);
});
