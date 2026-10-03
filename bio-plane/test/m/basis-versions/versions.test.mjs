/* basis-versions: what the old `test/versions.test.mjs` (IS-BUILD-PLAN PL-1 / IS-1, a Miniflare suite over op=promote
 * and op=basisversions) proves of this module, at its interface, over the fixture's real promotion.
 *
 * Carried: op=basisversions' own fields for a written and a derived version (relationship, grounds sorted, description,
 * derived_from, claim, run, regroup, each leg's fields in order) (R9); a version byte-identical after an unrelated
 * promotion re-stating it (R6, R29); VERSION_FROZEN's one-row translation, the field named, the repair, and nothing
 * landing (R6, R29); a name unique per inquiry only (R1); an evidence-only derivation is no regroup, while a bare or a
 * machine's regroup is refused (R3, C-25.9); hidden-by-document stays counted with its legs (R9); counts after a purge,
 * through record-core's purge and this module's read (R34); the empty and absent inquiry answers (R8, R9); the per-code
 * C-25 map driven through real promotions and reads, a floor and a ceiling (R1–R3, R6, R8, R35); the catalogue's
 * checkBundle finding VERSION_NO_RELATIONSHIP, carried at this module's `basisVersionFindings` over the same bytes the
 * promotion refuses (checkBundle is the catalogue's, `record-grammar`'s, not this module's interface); the over-strictness
 * round trip (a correct version written unlike any fixture lands and reads back whole, in authored order).
 *
 * Not carried as it stood: the old pin "D-164 unlanded: a leg carries no extent" is stale; what R3 and R5 now require
 * of a leg's extent is tested instead (a part's referent and a pinned capture inside the composition, a whole-document
 * extent one value with no extent, an unproduced extent refused).
 *
 * Not carried: every pin reading source text (one write site, no second table, no hidden filter, no ai_runs join, the
 * D-227 LIMIT count, the viewer-gate spelling, the op table, no claim table, the catalogue's literal count, no second
 * translation copy) — tests check behaviour at the interface; the parseFrontmatter nested-array measurement
 * (`record-grammar`'s grammar); op=stats' counts (control-plane's; R34 is proved through record-core's purge here);
 * op=airunopen / op=airun and killing a run (`ai-runs`; this module's half — the run reported, never resolved — is
 * carried as a version naming a run the store never held); the second member reading through the worker (sight is
 * membership's; R33 is proved in reads.test.mjs); the translations' vocabulary (no requirement of this module states
 * it); a rewording landing as a separate inquiry (`inquiry`'s write, not this module's). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, merge, inqMd, V, MACHINE } from "./fixture.mjs";
import { BASIS_VERSION_CHECKS, basisVersionFindings, basisVersionsOps } from "../../../src/basis-versions/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

const LEDGER = "INFO-2026-1000-ledger", MINUTES = "INFO-2026-1000-minutes";
const AUDIT = "INFO-2026-1000-audit", EMAIL = "INFO-2026-1000-email";
const INQ = "INQ-2026-1000-sewer-transfers", INQ2 = "INQ-2026-1000-second-question";
const T = "2026-09-27T00:00:00Z", LATER = "2026-09-27T12:00:00Z";
const RUTH = "member:ruth", DAVE = "member:dave";

/* One version as three sibling arrays joined by its name, the fixture's `block` idiom. */
/* A field given as `undefined` is left out of the document (the fixture's `block` would write the word). */
const defined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
function ver(name, { grounds = [], legs = [], ...fields }) {
  return {
    versions: [defined({ name, relationship: "and", state: "suggested", hidden: false, derived_from: null, author: RUTH, at: T,
                         ...fields })],
    grounds: grounds.map((g) => defined({ version: name, asserted_by: RUTH, at: T, ...g })),
    legs: legs.map((l) => defined({ version: name, role: "supports", ...l })),
  };
}
const V1F = {
  description: "The first reading: the ledger and the minutes together show the transfer.",
  run: "AIRUN-2026-1000-first",
  grounds: [{ ground: "paper trail", statement: "The ledger and minutes read together." }],
  legs: [{ target: LEDGER, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" },
         { target: MINUTES, ground: "paper trail", grade: "C", grade_axis: "connection", grade_source: "testimony",
           note: "the clerk's own summary", date: "2026-09-01" }],
};
const V1 = (o = {}) => ver("opening account", { ...V1F, ...o });
const V2 = (o = {}) => ver("two independent readings", {
  relationship: "or", derived_from: "opening account", run: "AIRUN-2026-1000-second",
  description: "Second reading: the audit stands alone, and so does the paper trail.",
  regroup_by: RUTH, regroup_at: LATER, regroup_note: "the audit was not in the record when the first reading was composed",
  grounds: [{ ground: "the audit" }, { ground: "paper trail" }],
  legs: [{ target: LEDGER, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" },
         { target: MINUTES, ground: "paper trail", grade: "C", grade_axis: "connection", grade_source: "testimony" },
         { target: AUDIT, ground: "the audit", grade: "B", grade_axis: "capture", grade_source: "capture" }],
  ...o });

function setup() {
  const w = world();
  const caps = {};
  for (const d of [LEDGER, MINUTES, AUDIT, EMAIL]) caps[d] = w.doc(d);
  w.member("ruth"); w.member("dave");
  return { w, caps };
}
const read = (w, id, o = {}) => w.bv.basisVersions({ id, viewer: V("ruth"), ...o });
const byName = (a, n) => (a?.versions ?? []).find((v) => v.name === n) ?? null;
/* `target_edition` (N522, K1305): the edition a leg on another group's finding names, null on every other leg */
const LEG_KEYS = ["ord", "target_id", "target_type", "role", "grade", "grade_axis", "grade_source", "note", "at", "ground",
                  "content_id", "target_edition", "grade_authored", "grade_why"];

test("R9: op=basisversions answers each version's own fields — relationship, grounds sorted, description, derived_from, claim, run, regroup — and each leg's fields in order, for a written version and one derived from it", () => {
  const { w } = setup();
  assert.equal(w.inquiry(INQ, block(V1())).ok, true);
  const a1 = read(w, INQ);
  assert.deepEqual([a1.ok, a1.total, a1.versions.map((v) => v.name)], [true, 1, ["opening account"]]);
  const r2 = w.revise(INQ, inqMd(INQ, block(merge(V1(), V2()))));
  assert.equal(r2.ok, true, JSON.stringify(r2).slice(0, 400));
  /* through the op entry, the stamps from the query string */
  const url = new URL(`https://x/?id=${INQ}&viewer=${encodeURIComponent(V("ruth"))}`);
  const a2 = basisVersionsOps(w.bv, url, null).basisversions();
  assert.deepEqual([a2.total, a2.versions.map((v) => v.name)], [2, ["opening account", "two independent readings"]],
    "the derived version stands beside the one it derives from");
  const v1 = byName(a2, "opening account"), v2 = byName(a2, "two independent readings");
  assert.deepEqual([v1.relationship, v1.grounds, v2.relationship, v2.grounds],
    ["and", ["paper trail"], "or", ["paper trail", "the audit"]], "the partition and the relationship on both, grounds sorted");
  assert.deepEqual([v1.description, v2.description], [V1F.description,
    "Second reading: the audit stands alone, and so does the paper trail."]);
  assert.deepEqual([v1.derived_from, v2.derived_from], [null, "opening account"]);
  assert.deepEqual([v1.claim, v1.run, v2.run], [null, "AIRUN-2026-1000-first", "AIRUN-2026-1000-second"]);
  assert.deepEqual([v1.leg_count, v1.legs.length, v1.legs_complete, v2.leg_count, v2.legs.length, v2.legs_complete],
    [2, 2, true, 3, 3, true]);
  assert.deepEqual([v2.regroup, v1.regroup],
    [{ by: RUTH, at: LATER, note: "the audit was not in the record when the first reading was composed" }, null]);
  assert.deepEqual([v1.author, v1.at, v1.state, v1.hidden, v1.moved, v1.affirmed], [RUTH, T, "suggested", false, null, null]);
  for (const l of [...v1.legs, ...v2.legs]) assert.deepEqual(Object.keys(l), LEG_KEYS, "the leg's fields, in order");
  assert.deepEqual(v1.legs.map((l) => [l.ord, l.target_id, l.target_type, l.role, l.ground, l.grade, l.grade_axis, l.grade_source,
                                       l.note, l.at, typeof l.content_id, l.grade_authored, l.grade_why]),
    [[0, LEDGER, "information", "supports", "paper trail", "B", "capture", "capture", null, null, "string", "B", null],
     [1, MINUTES, "information", "supports", "paper trail", "C", "connection", "testimony", "the clerk's own summary",
      "2026-09-01", "string", "C", null]]);
  /* a claim is a field of the version; a run the store never held is reported, never resolved */
  const Q3 = "INQ-2026-1000-reword";
  assert.equal(w.inquiry(Q3, block(merge(ver("first reading", { ...V1F, run: "AIRUN-2026-9999-never-existed" }),
    ver("tightened wording", { ...V1F, derived_from: "first reading", claim: "The transfers exceeded the cap in one quarter.",
                               description: "Same legs, a tighter statement of what they support." })))).ok, true);
  const a3 = read(w, Q3);
  assert.deepEqual([byName(a3, "tightened wording").claim, byName(a3, "first reading").claim, byName(a3, "first reading").run],
    ["The transfers exceeded the cap in one quarter.", null, "AIRUN-2026-9999-never-existed"]);
});

test("R6, R29: a version is byte-identical, by every published field and by its composition, after an unrelated later promotion re-stating it — which the freeze accepts", () => {
  const { w } = setup();
  assert.equal(w.inquiry(INQ, block(merge(V1(), V2()))).ok, true);
  const before = byName(read(w, INQ), "opening account");
  assert.deepEqual(before.composition.split("\n").map((l) => l.split("\t")[0]),
    ["name", "description", "claim", "relationship", "derived_from", "ground", "leg", "leg"], "the fields it freezes");
  const text = inqMd(INQ, block(merge(V1(), V2()))).replace("What happened?", "Where did the sewer fund transfers go?");
  const r = w.revise(INQ, text);
  assert.deepEqual([r.ok, r.reason ?? null], [true, null], "re-stating an unchanged composition is not an edit");
  assert.equal(w.text(INQ), text, "the unrelated change landed");
  const after = byName(read(w, INQ), "opening account");
  assert.equal(JSON.stringify(after), JSON.stringify(before));
  assert.equal(after.composition, before.composition);
});

test("R6, R29: an in-place edit of a held version is VERSION_FROZEN with C-25.11, the one row's translation, the field that moved and the repair; nothing lands", () => {
  const { w } = setup();
  assert.equal(w.inquiry(INQ, block(merge(V1(), V2()))).ok, true);
  const shaBefore = w.sha(INQ), textBefore = w.text(INQ);
  const before = JSON.stringify(read(w, INQ));
  const r = w.revise(INQ, inqMd(INQ, block(merge(
    V1({ description: "The first reading: the ledger and the minutes together show a transfer." }), V2()))));
  assert.deepEqual([r.ok, r.reason, r.version, r.changed], [false, "VERSION_FROZEN", "opening account", "description changed"]);
  assert.deepEqual([r.findings[0].check, r.findings[0].code, r.findings[0].translation],
    ["C-25.11", "VERSION_FROZEN", BASIS_VERSION_CHECKS.VERSION_FROZEN.translation]);
  assert.ok(r.findings[0].repairs.some((x) => /derived_from: 'opening account'/.test(x)), "derive a new version instead");
  assert.deepEqual([w.sha(INQ), w.text(INQ), JSON.stringify(read(w, INQ))], [shaBefore, textBefore, before], "nothing landed");
});

test("R1: a version's name is unique within its inquiry and only within it — the same name on another inquiry lands as its own composition", () => {
  const { w } = setup();
  assert.equal(w.inquiry(INQ, block(V1())).ok, true);
  const dup = w.inquiry("INQ-2026-1000-dup", block(merge(ver("one account", V1F),
    ver("one account", { ...V1F, description: "A different reading entirely, same name." }))));
  assert.deepEqual([dup.ok, dup.reason, dup.findings.some((f) => f.code === "VERSION_NAME_NOT_UNIQUE")],
    [false, "BASIS_VERSION_REFUSED", true]);
  assert.equal(w.record.head("INQ-2026-1000-dup"), null, "nothing landed");
  const other = w.inquiry(INQ2, block(V1({ description: "A different question, and its own first reading." })));
  assert.equal(other.ok, true, JSON.stringify(other).slice(0, 300));
  const a = read(w, INQ2);
  assert.deepEqual(a.versions.map((v) => v.name), ["opening account"]);
  assert.notEqual(byName(a, "opening account").composition, byName(read(w, INQ), "opening account").composition);
});

test("R3 (C-25.9): a derived version regrouping its parent's partition needs an attributed regroup — refused bare and refused from a machine identity; one that only adds evidence inside the inherited partition is no regroup and lands", () => {
  const { w } = setup();
  const base = ver("as composed", V1F);
  const regrouped = (o) => V2({ derived_from: "as composed", ...o }).versions[0];
  const with2 = (o) => { const b = V2(); b.versions = [{ ...regrouped(o), name: "regrouped" }];
    b.grounds = b.grounds.map((g) => ({ ...g, version: "regrouped" })); b.legs = b.legs.map((l) => ({ ...l, version: "regrouped" }));
    return merge(base, b); };
  const code = (r) => [r.ok, r.reason, r.findings?.map((f) => [f.code, f.check])];
  const bare = w.inquiry("INQ-2026-1000-regroup", block(with2({ regroup_by: undefined, regroup_at: undefined, regroup_note: undefined })));
  assert.deepEqual(code(bare), [false, "BASIS_VERSION_REFUSED", [["VERSION_REGROUP_UNATTRIBUTED", "C-25.9"]]]);
  for (const who of [MACHINE, "token:member"]) {
    const m = w.inquiry("INQ-2026-1000-regroup-m", block(with2({ regroup_by: who, regroup_note: "the machine regrouped it" })));
    assert.deepEqual(code(m), [false, "BASIS_VERSION_REFUSED", [["VERSION_REGROUP_UNATTRIBUTED", "C-25.9"]]], who);
  }
  assert.equal(w.record.head("INQ-2026-1000-regroup"), null);
  assert.equal(w.record.head("INQ-2026-1000-regroup-m"), null);
  const attributed = w.inquiry("INQ-2026-1000-regroup-a", block(with2({})));
  assert.equal(attributed.ok, true, JSON.stringify(attributed).slice(0, 300));
  const evidenceOnly = w.inquiry("INQ-2026-1000-regroup-ok", block(merge(base, ver("one more document", {
    ...V1F, derived_from: "as composed", description: "The same argument with the email added to the paper trail.",
    legs: [...V1F.legs, { target: EMAIL, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" }] }))));
  assert.deepEqual([evidenceOnly.ok, evidenceOnly.reason ?? null], [true, null]);
});

test("R9: a version the document hides stays returned, counted in total, with every leg, flagged; its composition does not move", () => {
  const { w } = setup();
  assert.equal(w.inquiry(INQ, block(merge(V1(), V2()))).ok, true);
  const comp = byName(read(w, INQ), "opening account").composition;
  assert.equal(w.revise(INQ, inqMd(INQ, block(merge(V1({ hidden: true }), V2())))).ok, true);
  const a = read(w, INQ);
  const v1 = byName(a, "opening account");
  assert.deepEqual([a.total, a.count, v1.hidden, v1.legs.length, v1.composition], [2, 2, true, 2, comp]);
});

test("R34: after record-core's purge of an inquiry, its version and leg rows are gone, the counts fall, and op=basisversions answers it with none", () => {
  const { w } = setup();
  const DOOMED = "INQ-2026-1000-purged";
  assert.equal(w.inquiry(INQ, block(V1())).ok, true);
  assert.equal(w.inquiry(DOOMED, block(ver("the only reading", V1F))).ok, true);
  const before = [w.count("inquiry_basis_versions"), w.count("inquiry_basis_version_legs")];
  assert.deepEqual([read(w, DOOMED).total, before], [1, [2, 4]]);
  const p = w.record.purge({ bundleId: DOOMED });
  assert.deepEqual([p.removed.inquiry_basis_versions, p.removed.inquiry_basis_version_legs], [1, 2]);
  assert.deepEqual([w.count("inquiry_basis_versions"), w.count("inquiry_basis_version_legs")], [1, 2]);
  const after = read(w, DOOMED);
  assert.deepEqual([after.ok, after.total, after.versions], [true, 0, []]);
  assert.equal(read(w, INQ).total, 1, "another inquiry's versions stay");
});

test("R8, R9: an inquiry with no versions answers the whole envelope — ok, total 0, the default bound, not truncated, inquiry_present; one the record does not hold answers the same envelope without inquiry_present", () => {
  const { w } = setup();
  const EMPTY = "INQ-2026-1000-no-versions";
  assert.equal(w.inquiry(EMPTY, block({})).ok, true);
  const e = read(w, EMPTY);
  assert.deepEqual([e.ok, e.versions, e.count, e.total, e.limit, e.offset, e.truncated, e.inquiry_present],
    [true, [], 0, 0, 200, 0, false, true]);
  const absent = read(w, "INQ-2026-9999-not-here");
  assert.deepEqual([absent.ok, absent.versions, absent.total, absent.limit, absent.truncated, "inquiry_present" in absent],
    [true, [], 0, 200, false, false]);
});

test("R1, R2, R3, R6, R8, R35: every C-25 row this module's grammar, promotion check and read declare is reached by a real promotion or read, sent with its own C-number and its row's translation — a floor and a ceiling", () => {
  const { w } = setup();
  const PROJ = w.project("A project", "ruth", []);
  assert.equal(w.inquiry(INQ, block(merge(V1(), V2()))).ok, true);
  const wire = new Map();
  const collect = (r) => {
    assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
    const all = [...(typeof r.code === "string" ? [r] : []), ...(r.findings ?? [])];
    for (const f of all) {
      if (!BASIS_VERSION_CHECKS[f.code]) { wire.set(f.code, f.check); continue; }
      assert.equal(f.translation, BASIS_VERSION_CHECKS[f.code].translation, `${f.code}: its row's translation`);
      assert.ok(!wire.has(f.code) || wire.get(f.code) === f.check, `${f.code}: one C-number`);
      wire.set(f.code, f.check);
    }
  };
  let n = 0;
  const bad = (b) => { const id = `INQ-2026-1001-b${++n}`; const r = w.inquiry(id, block(b)); collect(r);
    assert.equal(w.record.head(id), null, "a refused version never lands"); };
  bad(V1({ description: "short" }));
  bad(merge(V1(), V1({ description: "Another reading with one name." })));
  bad(V1({ relationship: undefined }));
  bad(V1({ relationship: "or" }));
  bad(V1({ legs: [V1F.legs[0], { target: MINUTES }] }));
  bad(V1({ grounds: [] }));
  bad(V1({ derived_from: "nowhere" }));
  bad(merge(ver("a", { ...V1F, derived_from: "b" }), ver("b", { ...V1F, derived_from: "a", description: "The mirror reading, word for word." })));
  bad(merge(ver("as composed", V1F), (() => { const b = V2({ derived_from: "as composed", regroup_by: undefined, regroup_at: undefined,
    regroup_note: undefined }); b.versions[0].name = "regrouped"; b.grounds.forEach((g) => { g.version = "regrouped"; });
    b.legs.forEach((l) => { l.version = "regrouped"; }); return b; })()));
  bad(V1({ legs: [{ target: PROJ, ground: "paper trail" }] }));
  bad(V1({ state: "pondering" }));
  bad(V1({ hidden: "archived" }));
  bad(V1({ legs: [{ target: `INQ-2026-1001-b${n + 1}`, ground: "paper trail" }] }));
  bad(merge(V1(), { legs: [{ version: "not a version", target: LEDGER, role: "supports", ground: "paper trail" }] }));
  bad(V1({ legs: [{ target: "INFO-2026-9999-never-captured", ground: "paper trail" }] }));
  bad(V1({ state: "rejected" }));
  collect(w.revise(INQ, inqMd(INQ, block(merge(V1({ description: "The first reading, reworded in place, which is refused." }), V2())))));
  collect(w.bv.basisVersions({ viewer: V("ruth") }));
  collect(w.bv.basisVersions({ id: PROJ, viewer: V("ruth") }));
  const got = Object.fromEntries([...wire].sort());
  assert.deepEqual(got, Object.fromEntries(Object.entries(BASIS_VERSION_CHECKS).map(([k, r]) => [k, r.check]).sort()),
    "every declared code reached, nothing undeclared sent, each with its own number");
  assert.deepEqual(got, {
    BASIS_VERSIONS_NOT_AN_INQUIRY: "C-25.18", BASIS_VERSIONS_NO_INQUIRY: "C-25.17",
    VERSION_DERIVATION_CYCLE: "C-25.8", VERSION_DERIVED_FROM_UNKNOWN: "C-25.7", VERSION_DISPOSITION_UNATTRIBUTED: "C-25.19",
    VERSION_FROZEN: "C-25.11", VERSION_GROUND_UNASSERTED: "C-25.6", VERSION_HIDDEN_NOT_BOOLEAN: "C-25.13",
    VERSION_LEG_NOT_CITABLE: "C-25.10", VERSION_LEG_SELF: "C-25.14", VERSION_LEG_UNRESOLVED: "C-25.16",
    VERSION_NAME_NOT_UNIQUE: "C-25.2", VERSION_NO_DESCRIPTION: "C-25.1", VERSION_NO_RELATIONSHIP: "C-25.3",
    VERSION_ORPHAN_ROW: "C-25.15", VERSION_PARTITION_INCOMPLETE: "C-25.5", VERSION_REGROUP_UNATTRIBUTED: "C-25.9",
    VERSION_RELATIONSHIP_DISAGREES: "C-25.4", VERSION_STATE_UNKNOWN: "C-25.12" }, "the C-numbers pinned by name");
});

test("R3, R6: one grammar at both gates — the bytes a promotion refuses for VERSION_NO_RELATIONSHIP are the bytes basisVersionFindings finds it in, and no version with an empty relationship is ever written", () => {
  const { w } = setup();
  const ID = "INQ-2026-1002-bothgates";
  const md = inqMd(ID, block(V1({ relationship: undefined })));
  const r = w.inquiry(ID, block(V1({ relationship: undefined })));
  assert.deepEqual([r.ok, r.reason, r.findings.map((f) => f.code)], [false, "BASIS_VERSION_REFUSED", ["VERSION_NO_RELATIONSHIP"]]);
  const f = [];
  basisVersionFindings(parseFrontmatter(md).data, f);
  assert.deepEqual(f.filter((x) => x.severity === "error").map((x) => [x.code, x.check]), [["VERSION_NO_RELATIONSHIP", "C-25.3"]]);
  const landed = read(w, ID);
  assert.deepEqual([landed.total, landed.versions], [0, []], "nothing landed");
  assert.equal(w.count("inquiry_basis_versions"), 0);
});

test("R3, R5: a leg's extent — a part of the document is a leg_referent line in the composition and the leg reads that part's content row; a pinned capture is a leg_capture line after the referents; a whole-document extent is one value with no extent; an extent nothing produces is refused and nothing lands", () => {
  const { w, caps } = setup();
  const one = (legs, extra = {}) => ver("paged", { description: "the ledger's third page carries the entry", grounds: [{ ground: "main" }],
    legs, ...extra });
  const Q = "INQ-2026-1003-extent";
  const r = w.inquiry(Q, block(one([{ target: LEDGER, ground: "main", extent_kind: "pdf-page", extent_page: 2 },
                                    { target: MINUTES, ground: "main", extent_capture: caps[MINUTES] }])));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const v = read(w, Q).versions[0];
  const lines = v.composition.split("\n");
  const ref = lines.filter((l) => l.startsWith("leg_referent\t"));
  assert.equal(ref.length, 1);
  assert.match(ref[0], /^leg_referent\t0\t.+/);
  assert.deepEqual(lines.slice(-2), [ref[0], `leg_capture\t1\t${caps[MINUTES]}`], "the pin after the referents");
  const part = w.content.contentRow(v.legs[0].content_id);
  assert.deepEqual([part.bundle_id, part.extent_kind], [LEDGER, "pdf-page"], "the leg reads the part it names");
  assert.equal(w.content.contentRow(v.legs[1].content_id).extent_kind, "document");
  /* a whole-document extent and no extent are one composition */
  const QA = "INQ-2026-1003-whole-a", QB = "INQ-2026-1003-whole-b";
  assert.equal(w.inquiry(QA, block(one([{ target: LEDGER, ground: "main" }]))).ok, true);
  assert.equal(w.inquiry(QB, block(one([{ target: LEDGER, ground: "main", extent_kind: "document" }]))).ok, true);
  const [ca, cb] = [read(w, QA).versions[0].composition, read(w, QB).versions[0].composition];
  assert.equal(ca, cb);
  assert.equal(/leg_referent|leg_capture/.test(ca), false);
  /* once stored, the part is frozen with the version */
  const moved = w.revise(Q, inqMd(Q, block(one([{ target: LEDGER, ground: "main", extent_kind: "pdf-page", extent_page: 3 },
                                                 { target: MINUTES, ground: "main", extent_capture: caps[MINUTES] }]))));
  assert.equal(moved.reason, "VERSION_FROZEN");
  /* an extent nothing produces */
  const QD = "INQ-2026-1003-dom";
  const dom = w.inquiry(QD, block(one([{ target: LEDGER, ground: "main", extent_kind: "dom" }])));
  assert.deepEqual([dom.ok, dom.reason, dom.findings.map((f) => f.code)], [false, "BASIS_VERSION_REFUSED", ["CONTENT_EXTENT_NO_PRODUCER"]]);
  assert.equal(typeof dom.findings[0].translation, "string");
  assert.equal(w.record.head(QD), null);
});

test("R1, R3, R9: over-strictness — a correct version written unlike any fixture (a punctuated name, mixed-case labels, legs out of ground order, an ungraded leg, a cuts_against leg, an attributed considering state) lands and reads back whole in authored order", () => {
  const { w } = setup();
  const ODD = "INQ-2026-1003-unlike";
  const odd = ver("v3.2 rev-B_final", {
    description: "Three routes, any one of which answers it, composed after the audit landed.",
    relationship: "or", state: "considering", author: DAVE, at: "2026-07-03T11:22:33Z",
    state_by: DAVE, state_at: "2026-07-03T11:22:33Z", state_reason: "holding this one until the third route's papers are captured",
    claim: "At least one quarter's transfers were made without the required authorisation.",
    grounds: [{ ground: "route-1_papers", asserted_by: DAVE, statement: "The papers alone answer it." },
              { ground: "route 2 audit", asserted_by: DAVE }, { ground: "ROUTE3", asserted_by: DAVE }],
    legs: [{ target: AUDIT, ground: "route 2 audit" },
           { target: EMAIL, ground: "ROUTE3", role: "cuts_against", grade: "D", grade_axis: "connection", grade_source: "testimony",
             note: "an aide's recollection", date: T },
           { target: LEDGER, ground: "route-1_papers" }, { target: MINUTES, ground: "route-1_papers" }] });
  const r = w.inquiry(ODD, block(odd));
  assert.deepEqual([r.ok, r.reason ?? null], [true, null], JSON.stringify(r).slice(0, 300));
  const v = byName(read(w, ODD), "v3.2 rev-B_final");
  assert.deepEqual([v.legs.map((l) => [l.target_id, l.ground, l.role, l.grade]), v.state, v.relationship, v.grounds, v.moved],
    [[[AUDIT, "route 2 audit", "supports", null], [EMAIL, "ROUTE3", "cuts_against", "D"],
      [LEDGER, "route-1_papers", "supports", null], [MINUTES, "route-1_papers", "supports", null]],
     "considering", "or", ["ROUTE3", "route 2 audit", "route-1_papers"],
     { by: DAVE, at: "2026-07-03T11:22:33Z", reason: "holding this one until the third route's papers are captured" }]);
});
