/* basis-versions: one question shared by several projects (R11, R13, R15, R31). Carried from the old probe
   `test/d216-sharing.probe.mjs` (D-216, "sharing is the `refs` edge"): its share for this module — the version set
   `op=basisversions` answers is identical whichever project is named, before and after two projects diverge (with its
   vacuity guards: two named readings, legs present, the two stances distinguishable), and two or three projects may
   stand on readings of one question, diverging or agreeing, each act written on its own project and the question's
   bytes untouched; a project whose citation is later severed loses the standing to move its stance.
   Not carried: the bar per project (`op=strengthbarof`, crossed declarations, an absent bar) — `strength` R14; the
   `cites` edge itself, `op=cite`/`op=sever` on a project, `op=backlinks` and the `refs` projection count via
   `op=stats` — `connections`; `op=inquirystrength` taking no project — `strength`; the arms reading `store.mjs` or
   `queuestate.mjs` source text (`#strengthWalk`, `#setCurrentVersionRow`, `#requiredStrengthFor`, `#projectBar`, the
   notification slugs) — source text, stale. The pointer's place in the project's bytes, a severed or never-citing
   project refused, and no `current` on a no-project read are already proven by acts.test.mjs (R13, R15, R31) and
   reads.test.mjs (R11). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, merge, V } from "./fixture.mjs";
import { basisVersionsOps } from "../../../src/basis-versions/index.mjs";

const LEDGER = "INFO-2026-3000-ledger", MINUTES = "INFO-2026-3000-minutes", AUDIT = "INFO-2026-3000-audit";
const Q = "INQ-2026-3000-sewer-transfers";
const T = "2026-09-27T00:00:00Z";
const ALICE = "member:alice";
const ONE = "opening account", TWO = "the audit alone";

/* Two readings of one question: the first two legs graded on both axes, the second one leg. */
function reading(name, description, ground, legs) {
  return {
    versions: [{ name, description, relationship: "and", state: "suggested", hidden: false, derived_from: null,
                 author: ALICE, at: T }],
    grounds: [{ version: name, ground, asserted_by: ALICE, at: T }],
    legs: legs.map(([target, grade, axis, source]) => ({ version: name, target, role: "supports", ground,
                                                        grade, grade_axis: axis, grade_source: source })),
  };
}

function setup() {
  const w = world();
  for (const d of [LEDGER, MINUTES, AUDIT]) w.doc(d);
  w.member("alice");
  const r = w.inquiry(Q, block(merge(
    reading(ONE, "the ledger and the minutes together show the transfer", "paper trail",
            [[LEDGER, "B", "capture", "capture"], [MINUTES, "C", "connection", "testimony"]]),
    reading(TWO, "the audit carries the finding without the paper trail", "the audit",
            [[AUDIT, "B", "capture", "capture"]]))));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const a = w.project("Oversight", "alice", [Q]);
  const b = w.project("Budget", "alice", [Q]);
  return { w, a, b };
}
const read = (w, project) => w.bv.basisVersions({ id: Q, viewer: V("alice"), ...(project ? { project } : {}) });
const current = (w, project, version) =>
  w.bv.versionCurrent({ target: Q, version, project, author: ALICE, viewer: V("alice"), identity: ALICE });
const stance = (w, project) => read(w, project).current ?? null;

test("R11: op=basisversions answers the same version set whichever project is named — the same readings, legs, grades, descriptions, totals and bounds — before and after the two projects stand on different readings; only the project's CURRENT differs", () => {
  const { w, a, b } = setup();
  const rA = read(w, a), rB = read(w, b), rNone = read(w);
  /* vacuity guards: the shared set is non-empty, named, and carries its legs */
  assert.deepEqual(rA.versions.map((v) => v.name).sort(), [ONE, TWO]);
  assert.deepEqual(rA.versions.map((v) => v.legs.length).sort(), [1, 2]);
  assert.deepEqual(rA.versions.find((v) => v.name === ONE).legs.map((l) => [l.target_id, l.grade_authored]),
                   [[LEDGER, "B"], [MINUTES, "C"]]);
  const same = (x, y) => {
    assert.deepEqual(x.versions, y.versions);
    assert.deepEqual([x.total, x.count, x.truncated, x.limit, x.offset], [y.total, y.count, y.truncated, y.limit, y.offset]);
  };
  same(rA, rB); same(rA, rNone);
  /* the same through the dispatch entry, the project named in the query string */
  const op = (p) => basisVersionsOps(w.bv, new URL(`https://x/?id=${Q}&viewer=${encodeURIComponent(V("alice"))}${p ? `&project=${p}` : ""}`), {}).basisversions();
  same(op(a), op(b)); same(op(a), rA);
  /* diverge */
  for (const v of [ONE, TWO]) assert.equal(w.bv.versionAccept({ target: Q, version: v, author: ALICE, viewer: V("alice") }).ok, true, v);
  assert.equal(current(w, a, ONE).ok, true);
  assert.equal(current(w, b, TWO).ok, true);
  const dA = read(w, a), dB = read(w, b);
  assert.deepEqual([dA.current?.version, dB.current?.version], [ONE, TWO], "the stances are distinguishable");
  same(dA, dB); same(dA, read(w));
  assert.deepEqual(dA.versions.map((v) => [v.name, v.state]).sort(), [[ONE, "accepted"], [TWO, "accepted"]],
                   "each team still sees the other team's reading");
  assert.deepEqual(op(a).current, dA.current);
  assert.deepEqual(op(b).current, dB.current);
});

test("R13, R15, R31: projects drawing on one question may stand on different readings or on the same one — a third project agreeing with the first — each act written on its own project only, the others and the question's bytes unmoved; a project whose citation is severed loses the standing to move its stance", () => {
  const { w, a, b } = setup();
  const c = w.project("Third", "alice", []);
  for (const v of [ONE, TWO]) assert.equal(w.bv.versionAccept({ target: Q, version: v, author: ALICE, viewer: V("alice") }).ok, true, v);
  const qSha = w.sha(Q), qText = w.text(Q);
  const shas = () => [w.sha(a), w.sha(b), w.sha(c)];

  /* A stands on the first reading: only A's bytes move */
  let before = shas();
  const mA = current(w, a, ONE);
  assert.deepEqual([mA.ok, mA.project, mA.version], [true, a, ONE]);
  let after = shas();
  assert.deepEqual([after[0] !== before[0], after[1], after[2]], [true, before[1], before[2]]);
  const stanceA = stance(w, a);
  assert.deepEqual([stanceA?.version, stance(w, b)], [ONE, null], "non-null against null before B's act");

  /* B stands on the second reading of the same question: permitted, and A's pointer does not move */
  before = shas();
  const mB = current(w, b, TWO);
  assert.deepEqual([mB.ok, mB.project, mB.version], [true, b, TWO]);
  after = shas();
  assert.deepEqual([after[0], after[1] !== before[1], after[2]], [before[0], true, before[2]]);
  assert.deepEqual(stance(w, a), stanceA, "A's pointer is identical across B's act");
  assert.equal(stance(w, b)?.version, TWO);

  /* a third project that does not draw on the question is refused; once it cites it, it may agree with A */
  assert.equal(current(w, c, ONE).reason, "VERSION_CURRENT_UNRELATED");
  const cited = w.revise(c, w.text(c).replace("references: []",
    ["references:", "  - rel: cites", `    target: ${Q}`, "    status: confirmed", '    note: ""'].join("\n")), { type: "project" });
  assert.equal(cited.ok, true, JSON.stringify(cited).slice(0, 300));
  before = shas();
  const mC = current(w, c, ONE);
  assert.deepEqual([mC.ok, mC.project, mC.version], [true, c, ONE]);
  after = shas();
  assert.deepEqual([after[0], after[1], after[2] !== before[2]], [before[0], before[1], true]);
  assert.deepEqual([stance(w, a)?.version, stance(w, b)?.version, stance(w, c)?.version], [ONE, TWO, ONE],
                   "two projects agree, the other still differs");
  for (const p of [a, b, c])
    assert.equal((w.text(p).match(new RegExp(`inquiry: "${Q}"`, "g")) ?? []).length, 1, `one current_versions row on ${p}`);

  /* the question itself never moved and holds no stance */
  assert.equal(w.sha(Q), qSha);
  assert.equal(w.text(Q), qText);
  assert.equal(qText.includes("current_versions"), false);

  /* B severs its citation: the row stays (recorded, not deleted) but B may no longer move its stance */
  const sev = w.revise(b, w.text(b).replace("status: confirmed", "status: severed"), { type: "project" });
  assert.equal(sev.ok, true, JSON.stringify(sev).slice(0, 300));
  const bSha = w.sha(b);
  const refused = current(w, b, ONE);
  assert.deepEqual([refused.ok, refused.reason, refused.check], [false, "VERSION_CURRENT_UNRELATED", "C-25.30"]);
  assert.equal(w.sha(b), bSha, "a refused act writes nothing");
  assert.equal(w.sha(Q), qSha);
});
