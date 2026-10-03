/* R28 (D-269, DEC-32 clause 1): no analyst's word in anything this module answers for a member. Driven at the
   interface: every read that answers a pair is called over fixtures that reach every branch of the arithmetic and of
   the walk, and every sentence in the answer (each `detail`, `why`, `filter` and `note`) is classified by the family
   `vocabulary.mjs` derives from DEC-32 itself. Record values are neutral (ids, ground labels "P1"…), so a hit can only
   be this module's own words. Carries `bio-plane/test/analystvocab.test.mjs`'s §1 corpus, §3 totality, §4 verdict and
   instrument and §4a, over the rendered answers instead of lifted source (P7). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE, ADMIN, REASON } from "./fixture.mjs";
import { analystHits, ATOMS, CONNECTIVES, NOUNS, RESIDUE, residueAnchored, DEC32_ENTRY } from "./vocabulary.mjs";
import { STRENGTH_AXES, VERSION_STRENGTH_CHECKS, PARTITION_INDEPENDENCE_CHECKS,
         STRENGTH_BAR_CHECKS } from "../../../src/strength/index.mjs";
import { legCapped } from "../../../src/inquiry/index.mjs";

const PROSE_KEYS = ["detail", "why", "filter", "note"];

/* Every sentence in an answer, with where it sits. */
function sentences(x, where = "", out = []) {
  if (Array.isArray(x)) x.forEach((v, i) => sentences(v, `${where}[${i}]`, out));
  else if (x && typeof x === "object")
    for (const [k, v] of Object.entries(x)) {
      if (PROSE_KEYS.includes(k) && typeof v === "string") out.push([`${where}.${k}`, v]);
      else sentences(v, `${where}.${k}`, out);
    }
  return out;
}
/* The verdict over a corpus: no sentence carries a hit. */
function clean(corpus) {
  const hits = corpus.flatMap(([where, s]) => analystHits(s).map((h) => `${where}: "${h.token}" (${h.why}) in: ${s}`));
  assert.deepEqual(hits, [], "an analyst's word reaches a member");
}
/* A world whose capture bound is inquiry's own `legCapped`, so its sentences are the ones a member reads. */
function real(opts) {
  const w = world(opts);
  w.s.inquiry = { ...w.s.inquiry, legCapped };
  return w;
}
const cycle = (w, a, b) => { w.inquiry(a, [{ target: b }]); w.inquiry(b, [{ target: a }]); };
const conn = (target, grade, ground) => ({ target, grade, axis: "connection", source: "resolution", ...(ground ? { ground } : {}) });

const LANDED = "capture B — the STRONGEST of the 2 independently sufficient grounds this conclusion rests on, which is "
  + "\"G1\", and no stronger than the weakest capture WITHIN that ground, which is T.";

test("R28: the vocabulary is DEC-32 clause 1's own, read from the ruling, and it fires on D-269's landed sentence", () => {
  assert.ok(DEC32_ENTRY.length > 2000, "DEC-32's entry was found");
  for (const atom of ["and", "or", "disjunction", "grounds"]) assert.ok(ATOMS.includes(atom), atom);
  assert.deepEqual(CONNECTIVES, ["and", "or"]);
  assert.equal(NOUNS.length, 2);
  for (const [term, anchored] of residueAnchored()) assert.ok(anchored, `${term} is DEC-32's own word`);
  assert.equal(RESIDUE.length, 4);
  /* The instrument fires on the subject, on its split form once built, and on every spelling. */
  assert.ok(analystHits(LANDED).length > 0);
  assert.ok(analystHits("… independently " + "sufficient sets this conclusion rests on …").length > 0);
  for (const w of ["the ground this rests on", "a disjunctive basis", "the conjunctive reading", "a partition of the legs",
                   "the OR branch", "the AND/OR relationship", "these are and-related legs", "the OR of them",
                   "the relationship is AND", "grounding"])
    assert.ok(analystHits(w).length > 0, w);
  /* And not on ordinary English: the conjunction, capitalised for emphasis or not. */
  for (const w of ["the capture and the connection", "LOOKED FOR AND NOT THERE", "no stronger than the weakest capture WITHIN that set"])
    assert.deepEqual(analystHits(w), [], w);
});

test("R28: every axis detail strengthOf answers, over every branch of the arithmetic (R3, R4), carries no analyst's word", () => {
  const corpus = [];
  const reached = new Set();
  const cases = [
    ["graded, one part", (w) => w.inquiry("INQ-2026-0001-a", [conn("INFO-2026-0001-a", "B")]),
     (c) => c.state === "graded" && !c.grounds && !c.not_load_bearing.length],
    ["graded, through a sub-inquiry, with an inert leg", (w) => {
      w.inquiry("INQ-2026-0002-a", [conn("INFO-2026-0009-a", "C")]);
      w.inquiry("INQ-2026-0001-a", [{ target: "INQ-2026-0002-a" }, { target: "INFO-2026-0002-a" }]);
    }, (c) => c.state === "graded" && c.weakest.through === "INFO-2026-0009-a" && c.not_load_bearing.length > 0],
    ["graded by the strongest set, one open set beside it, an inert leg", (w) => {
      cycle(w, "INQ-2026-0008-a", "INQ-2026-0009-a");
      w.inquiry("INQ-2026-0001-a", [conn("INFO-2026-0001-a", "B", "P1"), { target: "INFO-2026-0002-a", ground: "P1" },
                                    { target: "INQ-2026-0008-a", ground: "P2" }]);
    }, (c) => c.state === "graded" && c.weakest.ground === "P1"
         && c.grounds.filter((g) => g.state === "undetermined").length === 1 && c.not_load_bearing.length > 0],
    ["graded by the strongest set, two open sets beside it", (w) => {
      cycle(w, "INQ-2026-0008-a", "INQ-2026-0009-a");
      w.inquiry("INQ-2026-0001-a", [conn("INFO-2026-0001-a", "C", "P1"), conn("INFO-2026-0002-a", "B", "P2"),
                                    { target: "INQ-2026-0008-a", ground: "P3" }, { target: "INQ-2026-0009-a", ground: "P4" }]);
    }, (c) => c.state === "graded" && c.grade === "B" && c.grounds.filter((g) => g.state === "undetermined").length === 2],
    ["graded by a leg every set needs", (w) =>
      w.inquiry("INQ-2026-0001-a", [conn("INFO-2026-0001-a", "D"), conn("INFO-2026-0002-a", "A", "P1")]),
     (c) => c.state === "graded" && c.grade === "D" && c.grounds && !c.weakest.ground],
    ["undetermined, one part", (w) => cycle(w, "INQ-2026-0001-a", "INQ-2026-0002-a"),
     (c) => c.state === "undetermined" && !c.grounds],
    ["undetermined, every set", (w) => {
      cycle(w, "INQ-2026-0008-a", "INQ-2026-0009-a");
      w.inquiry("INQ-2026-0001-a", [{ target: "INQ-2026-0008-a", ground: "P1" }, { target: "INQ-2026-0009-a", ground: "P2" }]);
    }, (c) => c.state === "undetermined" && c.grounds.every((g) => g.ground !== null)],
    ["undetermined, a leg every set needs", (w) => {
      cycle(w, "INQ-2026-0008-a", "INQ-2026-0009-a");
      w.inquiry("INQ-2026-0001-a", [conn("INFO-2026-0001-a", "B", "P1"), { target: "INQ-2026-0008-a" }]);
    }, (c) => c.state === "undetermined" && c.grounds.some((g) => g.ground === null)],
    ["unrated, one part", (w) => w.inquiry("INQ-2026-0001-a", [{ target: "INFO-2026-0001-a" }]),
     (c) => c.state === "unrated" && c.population === 1 && !c.grounds],
    ["unrated, every set", (w) =>
      w.inquiry("INQ-2026-0001-a", [{ target: "INFO-2026-0001-a", ground: "P1" }, { target: "INFO-2026-0002-a", ground: "P2" }]),
     (c) => c.state === "unrated" && c.grounds.length === 2],
    ["unrated, resting on nothing", (w) => w.inquiry("INQ-2026-0001-a", []),
     (c) => c.state === "unrated" && c.population === 0],
  ];
  for (const [name, build, reach] of cases) {
    const w = real();
    build(w);
    const p = w.s.strengthOf("INQ-2026-0001-a");
    assert.ok(reach(p.connection), `${name}: the branch was reached — ${JSON.stringify(p.connection).slice(0, 300)}`);
    reached.add(name);
    for (const axis of STRENGTH_AXES) corpus.push(...sentences(p[axis], `${name} · ${axis}`));
  }
  assert.equal(reached.size, cases.length);
  assert.ok(corpus.filter(([w]) => w.endsWith(".detail")).length >= cases.length * STRENGTH_AXES.length);
  clean(corpus);
});

test("R28: every named member's why the walk answers (R1, R2, R3, R5), on every branch, carries no analyst's word", () => {
  const w = real();
  w.ceilings.set("INFO-2026-0001-a", { grade: "C", why: "The document was read in by a measured transcription." });
  w.ceilings.set("INFO-2026-0002-a", { grade: null });
  cycle(w, "INQ-2026-0008-a", "INQ-2026-0009-a");
  w.inquiry("INQ-2026-0007-a", []);
  w.inquiry("INQ-2026-0001-a", [
    { target: "INFO-2026-0001-a", grade: "A", axis: "capture", source: "capture", ground: "P1" },  /* capped */
    { target: "INFO-2026-0002-a", grade: "B", axis: "capture", source: "capture", ground: "P1" },  /* undetermined ceiling */
    { target: "INFO-2026-0003-a", grade: "A", axis: "testimony", source: "testimony", ground: "P1" }, /* read at D */
    { target: "INFO-2026-0004-a", grade: "A", axis: "connection", source: "hunch", ground: "P1" },    /* a hunch */
    { target: "INQ-2026-0007-a", grade: "A", axis: "capture", source: "capture", ground: "P2" },      /* no referent; unrated */
    { target: "INQ-2026-0008-a", ground: "P2" },                                                      /* undetermined below */
    { target: "INFO-2026-0005-a", ground: "P2" },                                                     /* no grade */
    conn("INFO-2026-0006-a", "B", "P2"),                                                             /* another axis */
  ]);
  const p = w.s.strengthOf("INQ-2026-0001-a");
  const corpus = STRENGTH_AXES.flatMap((axis) => sentences(p[axis], axis));
  const whys = corpus.filter(([where]) => where.endsWith(".why")).map(([, s]) => s).join("\n");
  /* Totality: every sentence the walk composes for a member was reached. */
  for (const [what, re] of [
    ["a capped capture", /can support no more than C for INFO-2026-0001-a/],
    ["an undetermined ceiling", /capture can support is undetermined/],
    ["testimony read at its one letter", /is read at D here/],
    ["a hunch", /marked as a hunch/],
    ["a grade with no referent", /has no referent/],
    ["a sub-inquiry unrated", /INQ-2026-0007-a is UNRATED on/],
    ["a sub-inquiry undetermined, its detail embedded", /INQ-2026-0008-a is undetermined on connection: this connection axis/],
    /* The walk's own "reached its depth bound of 6 here" is written only below the top level, where the level's
       `detail` (embedded above) is all that travels up; it never reaches an answer. */
    ["an ungraded leg", /the leg carries no grade/],
    ["a grade on another axis", /grade is on the connection axis/],
    ["capture beside a member's own words", /graded as testimony/],
  ]) assert.match(whys, re, what);
  clean(corpus);
});

test("R28: inquiryStrength's answer (a withheld member's sentence included), a candidate's pair and the pair R17 registers carry no analyst's word", () => {
  const w = real();
  w.member("alice");
  w.member("carol");
  w.bundle("INFO-2026-0001-a");
  w.project("PROJ-2026-0001-hid", ["alice"]);
  w.inquiry("INQ-2026-0001-a", [conn("INFO-2026-0001-a", "B", "P1"), conn("PROJ-2026-0001-hid", "D", "P2"),
                                { target: "INFO-2026-0002-a", ground: "P2" }]);
  const carol = w.s.inquiryStrength({ id: "INQ-2026-0001-a", viewer: "member:carol" });
  assert.equal(carol.out_of_view, true);
  const corpus = sentences(carol, "inquiryStrength");
  assert.ok(corpus.some(([, s]) => /out of your view/.test(s)), "the withheld sentence was reached");
  const c = w.s.candidatePair({ inquiry: "INQ-2026-0001-a", legs: [
    { target: "INFO-2026-0001-a", grade: "B", grade_axis: "connection", grade_source: "resolution", ground: "P1" },
    { target: "INFO-2026-0002-a", grade: "A", grade_axis: "connection", grade_source: "hunch", ground: "P2" }] });
  assert.equal(c.error, null);
  corpus.push(...sentences(c.pair, "candidatePair"));
  /* The pair R17 registers with inquiry's grouping act, as the act would call it. */
  let grounded = null;
  w.s.inquiry = { ...w.s.inquiry, onGrounded: (module, fn) => { grounded = fn; return { ok: true, module }; } };
  w.s.registerGrounded();
  assert.equal(typeof grounded, "function");
  corpus.push(...sentences(grounded("INQ-2026-0001-a"), "registered"));
  assert.ok(corpus.some(([where]) => where.startsWith("registered")));
  assert.ok(corpus.length >= 12);
  clean(corpus);
});

test("R28: versionStrength's filter, pair and graded, ungraded and hunches sentences, every branch of R9, carry no analyst's word", () => {
  const w = real();
  const INQ = "INQ-2026-0001-a";
  w.inquiry(INQ, [], "ENT-1");
  w.inquiry("INQ-2026-0002-a", []);
  w.connection.set("ENT-1|INFO-2026-0002-a", "B");
  w.testimony.set("INFO-2026-0006-a", "D");
  w.ceilings.set("INFO-2026-0008-a", { grade: null, why: "The bytes are held and no fidelity was measured.", undetermined_because: "unmeasured" });
  for (const t of ["INFO-2026-0010-a", "INFO-2026-0011-a", "INFO-2026-0012-a"])
    w.ceilings.set(t, { grade: "B", why: "The bytes are held." });
  const legs = [
    { target: "INFO-2026-0000-a", grade: "A", axis: "connection", source: "hunch", ground: "P1" },
    { target: "INFO-2026-0001-a", grade: "A", axis: null, source: null, ground: "P1" },
    { target: "INFO-2026-0002-a", grade: "D", axis: "connection", source: "resolution", ground: "P1" },
    { target: "INFO-2026-0003-a", grade: "C", axis: "connection", source: "testimony", ground: "P1" },
    { target: "INFO-2026-0004-a", grade: "A", axis: "connection", source: "resolution", ground: "P2" },
    { target: "INQ-2026-0002-a", grade: "D", axis: "testimony", source: "testimony", ground: "P2" },
    { target: "INFO-2026-0006-a", grade: "D", axis: "testimony", source: "testimony", ground: "P2" },
    { target: "INFO-2026-0007-a", grade: "D", axis: "testimony", source: "testimony", ground: "P2" },
    { target: "INFO-2026-0008-a", grade: "B", axis: "capture", source: "capture", ground: "P2" },
    { target: "INFO-2026-0009-a", grade: "B", axis: "capture", source: "capture", ground: "P2" },
    { target: "INFO-2026-0010-a", grade: null, axis: "capture", source: null, ground: "P2" },
    { target: "INFO-2026-0011-a", grade: "A", axis: "capture", source: "capture", ground: "P2" },
    { target: "INFO-2026-0012-a", grade: "C", axis: "capture", source: "capture", ground: "P2" },
  ];
  w.version(INQ, "main", "accepted", legs);
  const d = w.s.versionStrength({ id: INQ, version: "main", viewer: MACHINE });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const wi = w.s.versionStrength({ id: INQ, version: "main", states: "suggested,accepted", viewer: MACHINE });
  assert.equal(wi.what_if, true);
  /* Totality: each leg reached the branch it was written for. */
  const bucket = (r, ord) => ["graded", "ungraded", "hunches"].find((k) => r[k].some((x) => x.ord === ord));
  assert.deepEqual(legs.map((_, ord) => bucket(d, ord)),
    ["hunches", "ungraded", "graded", "graded", "ungraded", "ungraded", "graded", "ungraded", "ungraded", "ungraded",
     "ungraded", "graded", "graded"]);
  assert.match(d.graded.find((x) => x.ord === 11).why, /authored at A and is reported at B/);
  const corpus = [...sentences(d, "default"), ...sentences(wi, "what-if")];
  assert.ok(corpus.some(([w]) => w === "default.filter") && corpus.some(([w]) => w === "what-if.filter"));
  clean(corpus);
});

test("R28: the bar's sentences (R14–R16) carry no analyst's word", () => {
  const w = real();
  w.member(ADMIN, "admin");
  w.project("PROJ-2026-0001-abc");
  w.project("PROJ-2026-0002-abc");
  w.file("PROJ-2026-0001-abc", "bundle.md", "---\nrequired_strength:\n  capture: B\n---\n");
  const none = w.s.strengthBarOf({ viewer: MACHINE });
  const set = w.s.strengthBarSet({ reason: REASON, capture: "B", author: ADMIN });
  const corpus = [
    ...sentences(w.s.projectBar("PROJ-2026-0001-abc"), "declared"), ...sentences(w.s.projectBar("PROJ-2026-0002-abc"), "absent"),
    ...sentences(none, "no default"), ...sentences(set, "set"), ...sentences(w.s.strengthBarOf({ viewer: MACHINE }), "default"),
    ...sentences(world({ group: null }).s.strengthBarOf({ viewer: MACHINE }), "no group"),
    ...sentences(w.s.strengthBarOf({ project: "PROJ-2026-0001-abc", viewer: MACHINE }), "of a project"),
  ];
  assert.ok(corpus.length >= 6, JSON.stringify(corpus));
  clean(corpus);
});

test("R28: every refusal row's translation (C-30, C-71, C-32.9, C-107) carries no analyst's word", () => {
  const rows = [VERSION_STRENGTH_CHECKS, PARTITION_INDEPENDENCE_CHECKS, STRENGTH_BAR_CHECKS]
    .flatMap((t) => Object.entries(t).map(([code, row]) => [`${row.check} ${code}.translation`, row.translation]));
  assert.equal(rows.length, 9 + 9 + 4);
  for (const [where, t] of rows) assert.ok(typeof t === "string" && t.length > 20, where);
  clean(rows);
});

test("R28: the sentences R29 and R5 added (an uncorroborated anonymous observation's why, on the live pair, a version and a candidate) carry no analyst's word", () => {
  const w = real();
  w.observation("INFO-2026-0001-observation", "member-ann");
  w.testimony.set("INFO-2026-0001-observation", "D");
  const leg = { target: "INFO-2026-0001-observation", grade: "D", axis: "testimony", source: "testimony" };
  const levels = { "INFO-2026-0001-observation": "group" };
  w.inquiry("INQ-2026-0001-a", [leg], "ENT-1");
  w.version("INQ-2026-0001-a", "v1", "accepted", [{ ...leg, ground: "" }]);
  const answers = [
    w.s.strengthOf("INQ-2026-0001-a", { levels }),
    w.s.versionStrength({ id: "INQ-2026-0001-a", version: "v1", viewer: MACHINE, levels }),
    w.s.candidatePair({ inquiry: "INQ-2026-0001-a", levels,
      legs: [{ target: leg.target, grade: "D", grade_axis: "testimony", grade_source: "testimony" }] }),
  ];
  const corpus = answers.flatMap((a, i) => sentences(a, `answer ${i}`));
  const anon = corpus.filter(([, s]) => /credited anonymously/.test(s));
  assert.ok(anon.length >= 3, "the sentence was reached on every path");
  clean(corpus);
});

test("R28: the sentences T28 added (another group's finding, R33; anonymous evidence, R34; the method in words, R31; a recomputed pair, R32) carry no analyst's word", async () => {
  const { GRADING_METHOD_VERSION, gradingMethodText, recomputePair } = await import("../../../src/strength/index.mjs");
  const w = real();
  const REF = `imported:${"c".repeat(64)}/INQ-2026-0500-a`;
  w.acceptedFinding(REF, 2, { pair: { capture: "B", connection: { state: "undetermined" } } });
  w.bundle("INFO-2026-0001-a");
  w.capture("knock", "INFO-2026-0001-a");
  w.inquiry("INQ-2026-0001-a", [{ target: REF, edition: 2, ground: "P1" }, { target: REF, edition: 3, ground: "P2" },
                                { target: REF, grade: "A", axis: "capture", source: "capture", edition: 2 },
                                conn("INFO-2026-0001-a", "B", "P1")]);
  const levels = { knock: "group" };
  const answers = [w.s.strengthOf("INQ-2026-0001-a", { levels }),
                   w.s.candidatePair({ inquiry: "INQ-2026-0001-a", legs: [{ target: REF }], levels }),
                   recomputePair({ version: GRADING_METHOD_VERSION, levels,
                     legs: [{ target: REF, kind: "imported" }, { target: REF, kind: "imported", answer: { capture: "C" } },
                            { target: "INFO-2026-0001-a", kind: "document", grade: "B", grade_axis: "connection", captures: ["knock"] }] })];
  const corpus = answers.flatMap((a, i) => sentences(a, `answer ${i}`));
  for (const re of [/another group's finding, in that group's case/, /publishes connection as undetermined/,
                    /without saying which edition/, /does not hold at edition 3/, /nothing here establishes what/,
                    /attests anonymously/, /case file states no answer/, /not a document, so a capture grade/])
    assert.ok(corpus.some(([, s]) => re.test(s)), `reached: ${re}`);
  corpus.push(["gradingMethodText", gradingMethodText(GRADING_METHOD_VERSION)]);
  corpus.push(["recomputePair refusal", recomputePair({ version: "x" }).detail]);
  clean(corpus);
});
