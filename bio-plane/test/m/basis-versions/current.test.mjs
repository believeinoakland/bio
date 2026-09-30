/* basis-versions: CURRENT as a project property (R9, R11, R13, R15, R31), carried from `test/current.test.mjs` (IS-BUILD-PLAN
   PL-13 / IS-3). What is carried: the version set is project-independent (op=basisversions answers the same versions
   whichever project is named, or none); a named project that stands on nothing answers `current: null`, present, and the
   answer is read from the project's own bytes; the make-current receipt names the act, project and version; moving one
   project's stance moves no other project's stance and no version's state; re-pointing replaces the project's one row
   for that question; a legacy `focus`-typed question is an inquiry to the acts and holds its own row beside another's.
   What is not carried, and why: the queue vocabulary and op=queuemute (block 1, `queue`); both feed slugs, their
   convergence silence, `basis.elsewhere`/pointer/options_grain, severed and never-citing projects not homes, ages,
   run attribution and the unattributed count, `case.excluded`, dispositions and op=proposedispose, and the purge
   silencing both producers (blocks 4–8, `queue-producers` and `queue`); the STRUCTURAL arms reading the writer's and
   the schema's source text (ARM 4, never carried: this suite tests behaviour). Already proven here: the pointer's dated
   row, the new revision, the `Stands on` Session Log entry and the question's unmoved bytes (acts R15, R31), no
   `current` field on a read naming no project (reads R11), severed and non-citing projects not drawing (reads R37). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, inqMd, projMd, V } from "./fixture.mjs";
import { basisVersionsOps } from "../../../src/basis-versions/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", DOC3 = "INFO-2026-0003-c";
const Q = "INQ-2026-0001-q", FOC = "FOCUS-2026-0002-legacy";
const T = "2026-09-27T00:00:00Z", NOW = "2026-09-28T01:00:00Z";
const ALICE = "member:alice";
const ACC = { state: "accepted", state_by: ALICE, state_at: T, state_reason: "" };

/* A question with two accepted readings and two suggested ones (one hidden), and four projects: A and B cite it, C never
   does, SEV cites it `severed` — the old suite's fixture, in this world. */
function setup() {
  const w = world();
  for (const d of [DOC, DOC2, DOC3]) w.doc(d);
  w.member("alice");
  const r = w.inquiry(Q, block(merge(version("opening account", [DOC, DOC2], ACC), version("the audit alone", [DOC3], ACC),
    version("composed by hand", [DOC]), version("read elsewhere", [DOC], { hidden: true }))));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const A = w.project("Oversight", "alice", [Q]), B = w.project("Budget", "alice", [Q]);
  const C = w.project("Unrelated", "alice", []), SEV = w.project("Withdrawn", "alice", [], { severed: [Q] });
  return { w, A, B, C, SEV };
}
const current = (w, project, version, target = Q, o = {}) =>
  w.bv.versionCurrent({ target, version, project, author: ALICE, viewer: V("alice"), identity: ALICE, ...o });
const read = (w, project) => w.bv.basisVersions({ id: Q, viewer: V("alice"), ...(project ? { project } : {}) });

test("R9, R11: the version set is project-independent — op=basisversions answers the same non-empty versions, states, compositions, total and paging whichever project is named or none, and naming a project adds only the project's own fields", () => {
  const { w, A, B, C, SEV } = setup();
  assert.equal(current(w, A, "opening account").ok, true);
  assert.equal(current(w, B, "the audit alone").ok, true);
  const anon = read(w);
  assert.deepEqual(anon.versions.map((v) => [v.name, v.state, v.hidden]),
    [["opening account", "accepted", false], ["the audit alone", "accepted", false], ["composed by hand", "suggested", false],
     ["read elsewhere", "suggested", true]], "the non-empty guard: four readings, the hidden one returned flagged");
  const common = ({ current: _c, conclusion: _k, conclusion_stance: _s, conclusion_history: _h, ...rest }) => rest;
  for (const p of [A, B, C, SEV, "PROJ-2026-0404-none"]) {
    const named = read(w, p);
    assert.deepEqual(common(named), anon, `the same versions and envelope with project ${p}`);
    assert.deepEqual(Object.keys(named).filter((k) => !(k in anon)).sort(),
      ["conclusion", "conclusion_history", "conclusion_stance", "current"], `only the project's fields are added for ${p}`);
  }
  assert.deepEqual([read(w, A).current.version, read(w, B).current.version], ["opening account", "the audit alone"],
    "two projects on two readings, one version set");
  /* through the op, the project a query parameter */
  const op = (p) => basisVersionsOps(w.bv, new URL(`https://x/?id=${Q}&viewer=${encodeURIComponent(V("alice"))}&limit=50`
    + (p ? `&project=${p}` : "")), {}).basisversions();
  assert.deepEqual(common(op(A)).versions, common(op(B)).versions);
  assert.deepEqual(op(A).versions, op().versions);
  assert.equal(op(A).versions.length, 4);
  /* the same page whichever project is named */
  const page = (p) => w.bv.basisVersions({ id: Q, viewer: V("alice"), limit: 2, offset: 1, project: p });
  assert.deepEqual([page(A).versions.map((v) => v.name), page(A).truncated], [["the audit alone", "composed by hand"], true]);
  assert.deepEqual(page(A).versions, page(B).versions);
});

test("R11: a named project that stands on nothing answers `current: null`, present — a different answer from the absent field of a read naming no project — and the answer is the project's own bytes", () => {
  const { w, A, C, SEV } = setup();
  for (const p of [A, C, SEV]) {
    const r = read(w, p);
    assert.equal(Object.prototype.hasOwnProperty.call(r, "current"), true, `current present for ${p}`);
    assert.equal(r.current, null, `${p} stands on nothing`);
  }
  assert.equal(Object.prototype.hasOwnProperty.call(read(w), "current"), false, "no project named, no field");
  assert.equal(current(w, A, "opening account").ok, true);
  assert.deepEqual(read(w, A).current, { project: A, version: "opening account", at: NOW, by: ALICE });
  /* a revision of the project's document without the row: the stance goes with its bytes (no second place states it) */
  const text = w.text(A);
  const stripped = text.replace(/current_versions:\n(?: {2}- .*\n| {4}.*\n)+/, "");
  assert.notEqual(stripped, text, "the row was found in the project's bytes");
  const rv = w.revise(A, stripped, { type: "project" });
  assert.equal(rv.ok, true, JSON.stringify(rv).slice(0, 300));
  assert.equal(read(w, A).current, null, "the read answers from the project's document");
  assert.equal(w.bv.currentOf(A, Q, V("alice")), null);
});

test("R13, R15, R31: the receipt names the act, project and version; one project's act moves no other project's stance and no version's state; re-pointing replaces the project's one row for the question", () => {
  const { w, A, B } = setup();
  const qSha = w.sha(Q), bSha = w.sha(B);
  const statesBefore = read(w).versions.map((v) => [v.name, v.state, v.hidden, v.composition]);
  const act = current(w, A, "opening account", Q, { reason: "the team agreed" });
  assert.deepEqual([act.ok, act.act, act.project, act.version, act.target, act.moves_state, act.from, act.to],
    [true, "current", A, "opening account", Q, false, "accepted", "accepted"]);
  assert.equal(read(w, B).current, null, "B's stance did not move when A's did");
  assert.equal(w.sha(B), bSha, "B's bytes did not move");
  assert.equal(w.sha(Q), qSha, "the question's bytes did not move");
  assert.deepEqual(read(w).versions.map((v) => [v.name, v.state, v.hidden, v.composition]), statesBefore,
    "a stance is not a state: no version moved");
  /* B diverges, then converges: each act re-points B's one row */
  assert.equal(current(w, B, "the audit alone").ok, true, "a different reading of the same question refuses nothing");
  assert.deepEqual([read(w, A).current.version, read(w, B).current.version], ["opening account", "the audit alone"]);
  assert.equal(current(w, B, "opening account").ok, true);
  assert.deepEqual([read(w, A).current.version, read(w, B).current.version], ["opening account", "opening account"]);
  const rows = w.text(B).split("\n").filter((l) => l.startsWith("  - inquiry: "));
  assert.deepEqual(rows, [`  - inquiry: "${Q}"`], "one row for the question, replaced, never appended");
  assert.equal((w.text(B).match(/\| Stands on \|/g) || []).length, 2, "each act its own Session Log entry");
  assert.equal(w.sha(Q), qSha, "still the question's bytes unmoved");
  assert.deepEqual(read(w).versions.map((v) => [v.name, v.state]), statesBefore.map(([n, s]) => [n, s]));
});

test("R13, R15: a legacy focus-typed question is an inquiry to the acts — its reading is accepted and made current like any other — and a project standing on two questions holds one row for each, read separately", () => {
  const { w, A, B } = setup();
  const text = inqMd(FOC, block(version("legacy reading", [DOC]))).replace("object_type: inquiry", "object_type: focus")
    .replace("schema: inquiry@1", "schema: focus@1");
  const f = w.promotion.promote({ bundleId: FOC, base: null, snapKey: "focus-1", author: ALICE,
    files: [{ path: "bundle.md", text }], meta: { object_type: "focus" } });
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.deepEqual(w.bv.basisVersions({ id: FOC, viewer: V("alice") }).versions.map((v) => v.name), ["legacy reading"]);
  const acc = w.bv.versionAccept({ target: FOC, version: "legacy reading", author: ALICE, viewer: V("alice"), reason: "the evidence holds" });
  assert.deepEqual([acc.ok, acc.to], [true, "accepted"]);
  /* A draws on both questions */
  const both = w.revise(A, projMd("Oversight", [Q, FOC]), { type: "project" });
  assert.equal(both.ok, true, JSON.stringify(both).slice(0, 300));
  assert.equal(current(w, A, "opening account").ok, true);
  const leg = current(w, A, "legacy reading", FOC);
  assert.deepEqual([leg.ok, leg.target, leg.project, leg.version], [true, FOC, A, "legacy reading"]);
  assert.deepEqual([w.bv.currentOf(A, Q, V("alice")).version, w.bv.currentOf(A, FOC, V("alice")).version],
    ["opening account", "legacy reading"]);
  assert.deepEqual(w.text(A).split("\n").filter((l) => l.startsWith("  - inquiry: ")), [`  - inquiry: "${Q}"`, `  - inquiry: "${FOC}"`]);
  assert.deepEqual(w.bv.basisVersions({ id: FOC, viewer: V("alice"), project: A }).current,
    { project: A, version: "legacy reading", at: NOW, by: ALICE });
  /* negative control: B does not draw on the legacy question */
  assert.equal(current(w, B, "legacy reading", FOC).reason, "VERSION_CURRENT_UNRELATED");
  assert.equal(w.bv.currentOf(B, FOC, V("alice")), null);
});
