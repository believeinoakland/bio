/* citation R24 (T51 fix round 10; DEC-439, DEC-440, DEC-441; K5303; D-M1, C-M4): `legGrade`, a member's capture-axis grade
   on a cited document leg, up to the ceiling the record earns for it. At the module's interface (the op as the door calls
   it, `citationOps` over an address) over the real `inquiry` booted on the host, whose `earned` registry (leg-earning R1) is
   the ceiling's one answer; the walker's case: a member cites a captured document into a question, then grades how well the
   team's copy shows it. Each refusal has a control. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, STAMP, inqMd } from "./fixture.mjs";
import { Citation, citationOps, inquiryServices, DECLARED_OPS, CITE_LEG_GRADE_CHECKS } from "../../../src/citation/index.mjs";

const Q = "INQ-2026-0001-q", DOC = "INFO-2026-0001-doc";
const ANN = { viewer: V("ann"), author: V("ann"), identity: V("ann") };

/* The module over the real inquiry's services (its `earned` is leg-earning's answer, no stand-in). */
function real(w) {
  return new Citation({ record: w.record, membership: w.membership, promotion: w.promotion, content: w.content,
                        retrieval: w.retrieval, provenance: w.prov, inquiry: inquiryServices(w.inquiryModule), now: () => Date.parse(STAMP) });
}
const call = (c, op, fields) => {
  const q = new URLSearchParams(Object.entries(fields).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)]));
  return citationOps(c, new URL(`http://x/?${q}`))[op]();
};

/* A question resting on one captured document (cited as `supports`), and the module that grades it. */
async function cited(opts = {}) {
  const w = world({ inquiry: true });
  w.info(DOC);
  w.inquiry(Q, opts.extra ?? []);
  const h = await w.select([DOC]);
  const r = w.cit.cite({ project: Q, handle: h, viewer: V("ann"), owner: "o", author: V("ann"), identity: V("ann"), role: "supports", note: "it says so" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return { w, c: real(w) };
}
const grade = (c, more = {}) => call(c, "leggrade", { project: Q, target: DOC, grade: "B", reason: "a clean scan", ...ANN, ...more });
const sessionLog = (w) => w.md(Q).slice(w.md(Q).indexOf("## Session Log"));

/* A question whose document holds a leg of a kind the record derives (the document is the test's own input; no write is
   reached: the refusal comes first). */
function derivedLeg(target, extra = []) {
  const w = world({ inquiry: true });
  w.info(DOC);
  w.inquiry(Q);
  const text = inqMd(Q, ["basis:", `  - target: ${target}`, "    role: supports", ...extra]);
  return { w, c: new Citation({ record: new Proxy(w.record, { get(t, k) {
    if (k === "readFile") return (b, p) => (b === Q && p === "bundle.md" ? { text, sha256: "x" } : t.readFile(b, p));
    const v = t[k]; return typeof v === "function" ? v.bind(t) : v;
  } }), membership: w.membership, promotion: w.promotion, content: w.content, retrieval: w.retrieval, provenance: w.prov,
    inquiry: inquiryServices(w.inquiryModule), now: () => Date.parse(STAMP) }),
    before: w.snapshot() };
}

test("R24: a grade at the ceiling is written on the cited leg (capture axis) and read back by basisFor; the answer carries the leg and the ceiling; one Session Log entry names the author, the grade and the reason", async () => {
  const { w, c } = await cited();
  const r = grade(c);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const leg = w.fm(Q).basis[0];
  assert.deepEqual([leg.target, leg.role, leg.grade, leg.grade_axis, leg.grade_source], [DOC, "supports", "B", "capture", "capture"]);
  assert.equal(leg.note, "it says so", "the leg keeps everything else it had");
  const read = w.inquiryModule.basisFor(Q).legs.find((l) => l.target_id === DOC);
  assert.deepEqual([read.grade, read.grade_axis, read.grade_source], ["B", "capture", "capture"]);
  assert.deepEqual([r.target, r.grade, r.ceiling, r.role], [DOC, "B", "B", "supports"]);
  assert.equal(r.bundleSha, w.record.head(Q).bundleSha);
  assert.equal(w.fm(Q).last_updated, STAMP);
  const entries = sessionLog(w).split("\n").filter((l) => /^### Session .*\| Graded /.test(l));
  assert.equal(entries.length, 1, "one entry");
  const log = sessionLog(w).slice(sessionLog(w).indexOf(entries[0]));
  for (const fact of [DOC, "B", "a clean scan", V("ann")]) assert.ok(log.includes(fact), `the entry names ${fact}: ${log}`);
});

test("R24: a weaker grade is the member's account of a poorer copy and is written; grading again replaces the grade, never adds a leg", async () => {
  const { w, c } = await cited();
  assert.equal(grade(c, { grade: "C", reason: "pages skewed" }).ok, true);
  assert.deepEqual(w.fm(Q).basis.map((l) => [l.target, l.grade]), [[DOC, "C"]]);
  assert.equal(grade(c, { grade: "B", reason: "re-read it, it is fine" }).ok, true);
  assert.deepEqual(w.fm(Q).basis.map((l) => [l.target, l.grade, l.grade_axis, l.grade_source]), [[DOC, "B", "capture", "capture"]]);
  assert.equal(sessionLog(w).split("\n").filter((l) => /^### Session .*\| Graded /.test(l)).length, 2, "each act has its entry");
});

test("R24: a grade above the ceiling is GRADE_OVER_CEILING naming the ceiling, writing nothing (R8: no leg is given a grade the record did not earn); control: the ceiling itself lands", async () => {
  const { w, c } = await cited();
  const before = w.md(Q), snap = w.snapshot();
  const r = grade(c, { grade: "A" });
  assert.deepEqual([r.ok, r.reason, r.ceiling, r.grade], [false, "GRADE_OVER_CEILING", "B", "A"]);
  assert.equal(r.check, CITE_LEG_GRADE_CHECKS.GRADE_OVER_CEILING.check);
  assert.ok(typeof r.detail === "string" && r.detail.includes("B"), "the sentence names the ceiling");
  assert.equal(w.md(Q), before);
  assert.deepEqual(w.snapshot(), snap);
  assert.equal(grade(c, { grade: "B" }).ok, true, "control: the ceiling lands");
});

test("R24: refusals in order, each writing nothing: a machine, the citing object (absent, unseen, not a question), a grade outside A to D, a missing or unwritable reason, a leg that is not there", async () => {
  const { w, c } = await cited();
  const before = w.md(Q);
  const machine = grade(c, { author: "token:bot" });
  assert.deepEqual([machine.ok, machine.reason], [false, "MACHINE_CANNOT_GRADE_LEG"]);
  assert.equal(machine.check, CITE_LEG_GRADE_CHECKS.MACHINE_CANNOT_GRADE_LEG.check);
  assert.equal(grade(c, { author: "" }).reason, "MACHINE_CANNOT_GRADE_LEG", "an unnamed author");
  const absent = grade(c, { project: "INQ-2026-9999-none" });
  assert.equal(absent.ok, false);
  assert.deepEqual(absent, { ...grade(c, { project: "INQ-2026-9999-none" }) }, "an absent one answers as membership says");
  const proj = w.project();
  assert.equal(grade(c, { project: proj }).reason, "NOT_AN_INQUIRY");
  for (const bad of ["E", "a", "", "AB", undefined]) {
    const r = grade(c, { grade: bad });
    assert.deepEqual([r.ok, r.reason], [false, "BAD_GRADE"], `grade ${JSON.stringify(bad)}`);
    assert.deepEqual(r.grades, ["A", "B", "C", "D"]);
  }
  assert.equal(grade(c, { reason: "  " }).reason, "NO_REASON");
  assert.equal(grade(c, { reason: undefined }).reason, "NO_REASON");
  assert.equal(grade(c, { reason: 'say "this"' }).reason, "BAD_REASON");
  assert.equal(grade(c, { reason: "x".repeat(161) }).reason, "BAD_REASON");
  assert.equal(grade(c, { target: "INFO-2026-0002-other" }).reason, "NOT_CITED");
  assert.equal(grade(c, { content_id: "a".repeat(64) }).reason, "NOT_CITED", "another part of the document is another leg (R22)");
  assert.equal(w.md(Q), before, "nothing written");
  assert.equal(grade(c).ok, true, "control: the same call with a named member, a grade and a reason lands");
});

test("R24: a leg of a kind the record derives (calculation, duty occurrence, derived connection) or another team's finding is refused LEG_NOT_GRADABLE, writing nothing; control: a document leg is graded", async () => {
  const IMP = `imported:${"c".repeat(64)}/INFO-2026-0007-x`;
  const cases = [
    ["calculation", "CALC-2026-0003", []],
    ["occurrence", `occurrence:DUT-2026-0004/OCC-${"0123456789abcdef".repeat(2)}`, []],
    ["derived_connection", "d".repeat(64), []],
    ["imported", IMP, ["    target_edition: 3"]],
  ];
  for (const [kind, target, extra] of cases) {
    const { w, c, before } = derivedLeg(target, extra);
    const r = grade(c, { target });
    assert.deepEqual([r.ok, r.reason, r.kind], [false, "LEG_NOT_GRADABLE", kind], kind);
    assert.equal(r.check, CITE_LEG_GRADE_CHECKS.LEG_NOT_GRADABLE.check);
    assert.deepEqual(w.snapshot(), before, `${kind}: nothing written`);
  }
  const { w, c } = await cited();
  assert.equal(grade(c).ok, true);
  assert.equal(w.fm(Q).basis[0].grade, "B");
});

test("R24: a document the record holds no capture of has no ceiling to grade under: GRADE_OVER_CEILING with a null ceiling, writing nothing", async () => {
  /* an uncaptured document: the record holds no bytes whose arrival a grade could measure */
  const w = world({ inquiry: true });
  w.info(DOC, { captured: false });
  w.inquiry(Q);
  const h = await w.select([DOC]);
  assert.equal(w.cit.cite({ project: Q, handle: h, viewer: V("ann"), owner: "o", author: V("ann"), identity: V("ann"), role: "supports" }).ok, true);
  const c = real(w), before = w.md(Q);
  const r = grade(c);
  assert.deepEqual([r.ok, r.reason, r.ceiling], [false, "GRADE_OVER_CEILING", null]);
  assert.equal(w.md(Q), before);
});

test("R24: a leg that already carries another axis's grade is not overwritten: LEG_GRADE_OTHER_AXIS names the axis, writing nothing", () => {
  const { w, c, before } = derivedLeg(DOC, ["    grade: C", "    grade_axis: testimony", "    grade_source: testimony"]);
  const r = grade(c);
  assert.deepEqual([r.ok, r.reason, r.axis], [false, "LEG_GRADE_OTHER_AXIS", "testimony"]);
  assert.deepEqual(w.snapshot(), before);
});

test("R24: the leg is found by its target and its part: the whole-document leg and a named-part leg of the same document are two legs, and the grade lands on the one named", async () => {
  const { w, c } = await cited();
  const h = await w.select([DOC]);
  const part = w.cit.cite({ project: Q, handle: h, viewer: V("ann"), owner: "o", author: V("ann"), identity: V("ann"), role: "supports",
                            extent: { extent_kind: "pdf-page", extent_page: "2" } });
  assert.equal(part.ok, true, JSON.stringify(part).slice(0, 300));
  assert.equal(w.fm(Q).basis.length, 2);
  const r = grade(c, { reason: "page 2 is crisp", extent_kind: "pdf-page", extent_page: 2 });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const legs = w.fm(Q).basis;
  assert.equal(legs[0].grade, undefined, "the whole-document leg is untouched");
  assert.deepEqual([legs[1].grade, legs[1].extent_page], ["B", 2]);
  assert.equal(grade(c, { reason: "all of it is crisp" }).ok, true);
  assert.deepEqual(w.fm(Q).basis.map((l) => l.grade), ["B", "B"]);
});

test("R24: leggrade is declared beside the module's other ops: a mutating member act, reversible, no machine class, accepting the project, the leg, the grade and the reason", () => {
  const d = DECLARED_OPS.leggrade;
  assert.ok(d, "declared");
  assert.deepEqual([d.mutating, d.weight, d.needs, d.machineClasses], [true, "reversible", "contribute", []]);
  assert.ok(d.classes.includes("member") && d.classes.includes("admin") && !d.classes.includes("probe"));
  for (const f of ["project", "target", "content_id", "grade", "reason"]) assert.ok(d.fields.accepts.includes(f), f);
  assert.deepEqual(d.fields.requires, ["project", "target", "grade", "reason"]);
  assert.deepEqual(d.stamps, ["author", "viewer"]);
});

test("R24: the op reads its fields from the body as cite does (R20), the address where the body is silent, the body winning where both differ; the door's stamps stay in the address", async () => {
  const { w, c } = await cited();
  const url = (fields) => new URL(`http://x/?${new URLSearchParams(Object.entries(fields).filter(([, v]) => v !== undefined))}`);
  const stamps = { viewer: V("ann"), author: V("ann"), identity: V("ann") };
  const r = citationOps(c, url({ project: Q, target: DOC, grade: "C", reason: "from the address", ...stamps }), { grade: "B", reason: "from the body" }).leggrade();
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(w.fm(Q).basis[0].grade, "B", "the body wins");
  assert.ok(w.md(Q).includes("from the body") && !w.md(Q).includes("from the address"));
  const bodyOnly = citationOps(c, url(stamps), { project: Q, target: DOC, grade: "D", reason: "all in the body" }).leggrade();
  assert.equal(bodyOnly.ok, true, JSON.stringify(bodyOnly).slice(0, 300));
  assert.equal(w.fm(Q).basis[0].grade, "D");
});
