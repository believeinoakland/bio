/* The pair over one version (R7–R10, R20), independence over a version, a partition and a candidate (R11, R12, R27),
   and the moved check rows (R24: C-30.1–C-30.9, C-71.1–C-71.9), each refusal driven at the interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";
import { STRENGTH_AXES, VERSION_STRENGTH_CHECKS, PARTITION_INDEPENDENCE_CHECKS, VERSION_LEGS_MAX, ORIGIN_LIMIT,
         refusePairComposed } from "../../../src/strength/index.mjs";

const INQ = "INQ-2026-0001-a";
const A = "INFO-2026-0001-a", B = "INFO-2026-0002-a", C = "INFO-2026-0003-a";

function versioned() {
  const w = world();
  w.inquiry(INQ, [{ target: A }, { target: B }, { target: C }], "ENT-1");
  w.bundle(A); w.bundle(B); w.bundle(C);
  w.connection.set(`ENT-1|${A}`, "B");
  w.connection.set(`ENT-1|${B}`, "A");
  w.ceilings.set(C, { grade: "B", why: "the bytes are held" });
  w.version(INQ, "main", "accepted", [
    { target: A, grade: "D", axis: "connection", source: "resolution", ground: "papers" },
    { target: B, grade: "C", axis: "connection", source: "resolution", ground: "papers" },
    { target: C, grade: "A", axis: "capture", source: "capture", ground: "papers" },
  ]);
  w.version(INQ, "idea", "suggested", [{ target: A, grade: "A", axis: "connection", source: "hunch", ground: "" }]);
  return w;
}
const vs = (w, a) => w.s.versionStrength({ id: INQ, viewer: MACHINE, ...a });
const refused = (r, code) => {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.equal(r.reason, code);
  assert.equal(r.check, VERSION_STRENGTH_CHECKS[code]?.check ?? PARTITION_INDEPENDENCE_CHECKS[code].check);
  assert.ok(r.translation && r.translation.length > 20);
};

test("R7, R24: C-30.1 no inquiry, C-30.2 not an inquiry (absent and invisible alike), in order", () => {
  const w = versioned();
  refused(w.s.versionStrength({ viewer: MACHINE }), "VERSION_STRENGTH_NO_INQUIRY");
  assert.equal(VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_NO_INQUIRY.check, "C-30.1");
  refused(vs(w, { id: A }), "VERSION_STRENGTH_NOT_AN_INQUIRY");
  const absent = vs(w, { id: "INQ-2026-0099-a", version: "main" });
  const unseen = vs(w, { version: "main", viewer: "nobody" });
  refused(absent, "VERSION_STRENGTH_NOT_AN_INQUIRY");
  refused(unseen, "VERSION_STRENGTH_NOT_AN_INQUIRY");
  assert.equal(absent.detail, unseen.detail, "an invisible inquiry answers as an absent one (R22)");
  assert.equal(VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_NOT_AN_INQUIRY.check, "C-30.2");
});

test("R7, R24: C-30.9 too many states, then C-30.5 unknown state, then C-30.3 no version, C-30.4 no such version, C-30.6 excluded", () => {
  const w = versioned();
  refused(vs(w, { states: "accepted,accepted,accepted,accepted,accepted", version: "nope" }), "VERSION_STRENGTH_TOO_MANY_STATES");
  assert.equal(VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_TOO_MANY_STATES.check, "C-30.9");
  refused(vs(w, { states: "accepted,maybe", version: "nope" }), "VERSION_STRENGTH_UNKNOWN_STATE");
  assert.equal(VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_UNKNOWN_STATE.check, "C-30.5");
  refused(vs(w, {}), "VERSION_STRENGTH_NO_VERSION");
  w.project("PROJ-2026-0042-abc");
  refused(vs(w, { project: "PROJ-2026-0042-abc" }), "VERSION_STRENGTH_NO_VERSION");
  assert.equal(VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_NO_VERSION.check, "C-30.3");
  refused(vs(w, { version: "nope" }), "VERSION_STRENGTH_NO_SUCH_VERSION");
  w.currents.set(`PROJ-2026-0042-abc|${INQ}`, "gone");
  const outlived = vs(w, { project: "PROJ-2026-0042-abc" });
  refused(outlived, "VERSION_STRENGTH_NO_SUCH_VERSION");
  assert.match(outlived.detail, /pointer has outlived the reading/);
  assert.equal(VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_NO_SUCH_VERSION.check, "C-30.4");
  const ex = vs(w, { version: "idea" });
  refused(ex, "VERSION_STRENGTH_STATE_EXCLUDED");
  assert.match(ex.detail, /Ask again naming suggested/);
  assert.equal(VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_STATE_EXCLUDED.check, "C-30.6");
});

test("R8, R20: states default to accepted; any other set is a what-if and says so in words beside state_set", () => {
  const w = versioned();
  const d = vs(w, { version: "main" });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.deepEqual(d.state_set, ["accepted"]);
  assert.equal(d.what_if, false);
  assert.match(d.filter, /counting only readings a member has adopted \(accepted\).*not filtered/);
  const wi = vs(w, { version: "idea", states: ["suggested", "accepted", "suggested"] });
  assert.equal(wi.ok, true);
  assert.deepEqual(wi.state_set, ["suggested", "accepted"], "deduped, in the machine's order");
  assert.equal(wi.what_if, true);
  assert.match(wi.filter, /^WHAT-IF — a view you constructed, not what this record stands on/);
  /* R20: a what-if writes nothing. */
  assert.equal(w.rows(`SELECT state FROM inquiry_basis_versions WHERE name='idea'`)[0].state, "suggested");
});

test("R8: the project's CURRENT is measured when no version is named; at most 500 legs, legs_complete saying so", () => {
  const w = versioned();
  w.project("PROJ-2026-0042-abc");
  w.currents.set(`PROJ-2026-0042-abc|${INQ}`, "main");
  const r = vs(w, { project: "PROJ-2026-0042-abc" });
  assert.equal(r.ok, true);
  assert.equal(r.version, "main");
  assert.equal(r.current, "main");
  assert.equal(r.legs_complete, true);
  const many = Array.from({ length: VERSION_LEGS_MAX + 3 }, (_, k) => ({ target: `INFO-2026-${String(k).padStart(4, "0")}-z`, ground: "" }));
  w.version(INQ, "big", "accepted", many);
  const big = vs(w, { version: "big" });
  assert.equal(big.legs_read, VERSION_LEGS_MAX);
  assert.equal(big.legs_complete, false);
});

test("R9: each leg's grade comes from the record; inert legs are named in ungraded or hunches, counted ones in graded", () => {
  const w = versioned();
  w.testimony.set("INFO-2026-0004-a", "D");
  w.version(INQ, "mixed", "accepted", [
    { target: A, grade: "D", axis: "connection", source: "resolution", ground: "" },          /* earns B */
    { target: "INFO-2026-0005-a", grade: "A", axis: "connection", source: "resolution", ground: "" }, /* earns nothing */
    { target: "INFO-2026-0006-a", grade: "C", axis: "connection", source: "testimony", ground: "" },  /* signed account */
    { target: "INFO-2026-0004-a", grade: "A", axis: "testimony", source: "testimony", ground: "" },   /* observation: D */
    { target: C, grade: "A", axis: "capture", source: "capture", ground: "" },                 /* ceiling B */
    { target: "INFO-2026-0007-a", grade: "A", axis: "capture", source: "capture", ground: "" }, /* no bytes */
    { target: B, grade: "A", axis: null, source: null, ground: "" },                           /* no axis */
    { target: B, grade: "A", axis: "connection", source: "hunch", ground: "" },                /* hunch */
  ]);
  const r = vs(w, { version: "mixed" });
  assert.equal(r.ok, true);
  const g = Object.fromEntries(r.graded.map((x) => [x.ord, x]));
  assert.equal(g[0].grade, "B", "the earned letter, not the authored one");
  assert.equal(g[0].authored, "D");
  assert.equal(g[2].grade, "C", "a member's signed testimony about the connection survives");
  assert.equal(g[3].grade, "D");
  assert.equal(g[4].grade, "B");
  assert.match(g[4].why, /authored at A and is reported at B/);
  assert.deepEqual(r.ungraded.map((x) => x.ord).sort(), [1, 5, 6]);
  assert.deepEqual(r.hunches.map((x) => x.ord), [7]);
  assert.equal(r.grades_from, "earnedBasisRegistry");
  assert.equal(r.subject_entity, "ENT-1");
});

test("R10: exactly the three axes, R4's arithmetic over the version's grounds, and independence beside them", () => {
  const w = versioned();
  const r = vs(w, { version: "main" });
  assert.deepEqual(Object.keys(r.pair).sort(), [...STRENGTH_AXES].sort());
  assert.equal(r.pair.connection.grade, "B", "min(B, A) in one set");
  assert.equal(r.pair.capture.grade, "B");
  assert.deepEqual(Object.keys(r.independence).sort(), ["checked", "complete", "limit", "parts", "shared"]);
  for (const k of ["strength", "grade", "score", "overall", "composed", "letter", "rating", "value"]) assert.ok(!(k in r));
});

test("R10, R24: C-30.7 refuses a composed figure (each forbidden key, a pair of other keys) and C-30.8 an unfiltered answer", () => {
  const w = versioned();
  const good = vs(w, { version: "main" });
  assert.equal(refusePairComposed(good), null);
  for (const k of ["strength", "grade", "score", "overall", "composed", "letter", "rating", "value"]) {
    const r = refusePairComposed({ ...good, [k]: "B" });
    assert.equal(r.reason, "VERSION_STRENGTH_COMPOSED", k);
    assert.equal(r.check, "C-30.7");
  }
  assert.equal(refusePairComposed({ ...good, pair: { ...good.pair, overall: {} } }).check, "C-30.7");
  assert.equal(refusePairComposed({ ...good, pair: { capture: good.pair.capture } }).check, "C-30.7");
  assert.equal(refusePairComposed({ ...good, pair: null }).check, "C-30.7");
  const nf = refusePairComposed({ ...good, filter: "" });
  assert.equal(nf.reason, "VERSION_STRENGTH_UNFILTERED");
  assert.equal(nf.check, "C-30.8");
  assert.equal(refusePairComposed({ ...good, state_set: [] }).check, "C-30.8");
  assert.ok(VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_UNFILTERED.translation.length > 20);
});

test("R11, R24: C-71.1, C-71.2 (absent and invisible alike), C-71.8 two subjects, C-71.9 no such version", () => {
  const w = versioned();
  const pi = (a) => w.s.partitionIndependence({ id: INQ, viewer: MACHINE, ...a });
  refused(w.s.partitionIndependence({ viewer: MACHINE }), "PARTITION_INDEPENDENCE_NO_INQUIRY");
  assert.equal(PARTITION_INDEPENDENCE_CHECKS.PARTITION_INDEPENDENCE_NO_INQUIRY.check, "C-71.1");
  refused(pi({ id: A }), "PARTITION_INDEPENDENCE_NOT_AN_INQUIRY");
  const absent = pi({ id: "INQ-2026-0099-a", version: "main" });
  const unseen = pi({ version: "main", viewer: null });
  refused(absent, "PARTITION_INDEPENDENCE_NOT_AN_INQUIRY");
  assert.equal(absent.detail, unseen.detail);
  assert.equal(PARTITION_INDEPENDENCE_CHECKS.PARTITION_INDEPENDENCE_NOT_AN_INQUIRY.check, "C-71.2");
  const two = pi({ version: "main", partition: [[0]] });
  refused(two, "PARTITION_INDEPENDENCE_TWO_SUBJECTS");
  assert.equal(two.check, "C-71.8");
  refused(pi({ version: "nope" }), "PARTITION_INDEPENDENCE_NO_SUCH_VERSION");
  assert.equal(PARTITION_INDEPENDENCE_CHECKS.PARTITION_INDEPENDENCE_NO_SUCH_VERSION.check, "C-71.9");
});

test("R11, R24: a proposed partition is refused C-71.3 unreadable, C-71.7 too many, C-71.4 unknown, C-71.5 twice, C-71.6 not total", () => {
  const w = versioned();
  const pi = (partition) => w.s.partitionIndependence({ id: INQ, viewer: MACHINE, partition });
  for (const bad of ["not json", "[]", [[]], [["x"]], [[-1]], [{ label: "", legs: [0] }], [{ label: "x".repeat(201), legs: [0] }],
                     [{ label: "same", legs: [0] }, { label: "same", legs: [1] }], [{ label: "no legs" }]]) {
    const r = pi(bad);
    refused(r, "PARTITION_INDEPENDENCE_UNREADABLE");
    assert.equal(r.check, "C-71.3");
  }
  refused(pi(Array.from({ length: VERSION_LEGS_MAX + 1 }, () => [0])), "PARTITION_INDEPENDENCE_TOO_MANY_LEGS");
  assert.equal(PARTITION_INDEPENDENCE_CHECKS.PARTITION_INDEPENDENCE_TOO_MANY_LEGS.check, "C-71.7");
  w.basis.set("INQ-2026-0002-a", Array.from({ length: VERSION_LEGS_MAX + 1 }, (_, ord) => ({ ord, target_id: A, target_type: "information", role: "supports" })));
  w.bundle("INQ-2026-0002-a", "inquiry");
  refused(w.s.partitionIndependence({ id: "INQ-2026-0002-a", viewer: MACHINE, partition: [[0]] }), "PARTITION_INDEPENDENCE_TOO_MANY_LEGS");
  assert.equal(w.calls.limits.at(-1), VERSION_LEGS_MAX + 1, "the basis is read bounded, one past the limit (inquiry R16)");
  const unk = pi([[0, 1, 2, 9]]);
  refused(unk, "PARTITION_INDEPENDENCE_UNKNOWN_LEG");
  assert.equal(unk.check, "C-71.4");
  const twice = pi([[0, 1], [1, 2]]);
  refused(twice, "PARTITION_INDEPENDENCE_LEG_TWICE");
  assert.equal(twice.check, "C-71.5");
  const partial = pi([[0], [1]]);
  refused(partial, "PARTITION_INDEPENDENCE_NOT_TOTAL");
  assert.equal(partial.check, "C-71.6");
  assert.deepEqual(partial.unplaced, [2]);
});

test("R11: it writes nothing and carries no strength key; groups are named as asked or by position", () => {
  const w = versioned();
  const before = JSON.stringify(w.rows(`SELECT * FROM inquiry_basis_versions`));
  const r = w.s.partitionIndependence({ id: INQ, viewer: MACHINE, partition: JSON.stringify([{ label: "papers", legs: [0, 1] }, [2]]) });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.wrote, false);
  assert.deepEqual(r.partition.map((p) => p.label), ["papers", "part 2"]);
  assert.deepEqual(r.partition[1].targets, [C]);
  for (const k of ["pair", "strength", "grade", "capture", "connection", "testimony"]) assert.ok(!(k in r), k);
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM inquiry_basis_versions`)), before);
});

test("R12: independence names shared origins (document, capture, address), at most five, checked only with two or more parts", () => {
  const w = versioned();
  w.capture("s1", A, "https://example.test/a");
  w.capture("s2", B, "https://example.test/a");     /* B shares A's address */
  w.capture("s3", C, "https://example.test/c");
  const r = w.s.partitionIndependence({ id: INQ, viewer: MACHINE, partition: [[0], [1], [2]] });
  assert.equal(r.independence.checked, true);
  assert.equal(r.independence.parts, 3);
  assert.equal(r.independence.complete, true);
  assert.equal(r.independence.limit, ORIGIN_LIMIT);
  assert.deepEqual(r.independence.shared, [{ a: "part 1", b: "part 2", through: ["address:https://example.test/a"] }]);
  const one = w.s.partitionIndependence({ id: INQ, viewer: MACHINE, partition: [[0, 1, 2]] });
  assert.equal(one.independence.checked, false);
  assert.equal(one.independence.complete, null, "a bound nothing tested did not hold");
  /* The same document in two parts: at most five origins named per pair. */
  for (let k = 0; k < 7; k++) w.capture(`t${k}`, A, `https://example.test/t${k}`);
  const same = w.s.candidateIndependence({ legs: [{ target: A, ground: "x" }, { target: A, ground: "y" }], parts: 2 });
  assert.equal(same.shared[0].through.length, 5);
  assert.equal(same.shared[0].through[0], `bundle:${A}`);
});

test("R12: an origin list cut at 200 makes the answer complete: false, never clean", () => {
  const w = versioned();
  for (let k = 0; k <= ORIGIN_LIMIT; k++) w.capture(`c${k}`, A);
  const r = w.s.candidateIndependence({ legs: [{ target: A, ground: "x" }, { target: B, ground: "y" }], parts: 2 });
  assert.equal(r.complete, false);
});

test("R12, R27: the same legs give the same independence over a version, a partition and a candidate (one implementation)", () => {
  const w = versioned();
  w.capture("s1", A, "https://example.test/a");
  w.capture("s2", C, "https://example.test/a");
  w.version(INQ, "split", "considering", [
    { target: A, ground: "one" }, { target: B, ground: "one" }, { target: C, ground: "two" }]);
  const fromVersion = w.s.partitionIndependence({ id: INQ, viewer: MACHINE, version: "split" }).independence;
  const fromStrength = vs(w, { version: "split", states: "considering" }).independence;
  const fromPartition = w.s.partitionIndependence({ id: INQ, viewer: MACHINE,
    partition: [{ label: "one", legs: [0, 1] }, { label: "two", legs: [2] }] }).independence;
  const fromCandidate = w.s.candidateIndependence({ legs: [
    { target: A, ground: "one" }, { target: B, ground: " one " }, { target: C, ground: "two" }], parts: 2 });
  assert.deepEqual(fromVersion, fromStrength);
  assert.deepEqual(fromVersion, fromPartition);
  assert.deepEqual(fromVersion, fromCandidate);
  assert.equal(fromVersion.shared.length, 1);
});

test("R27: candidateIndependence groups legs by ground into the declared parts, with the same origin limit", () => {
  const w = versioned();
  const r = w.s.candidateIndependence({ legs: [{ target: A, ground: "x" }, { target: B, ground: "y" }, { target: C }], parts: 2 });
  assert.deepEqual(r, { checked: true, parts: 2, shared: [], complete: true, limit: ORIGIN_LIMIT });
  assert.equal(w.s.candidateIndependence({ legs: [{ target: A, ground: "x" }], parts: 1 }).checked, false);
});
