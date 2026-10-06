/* The declared flow: defineProgression and readProgression (R1–R5), its versions (R23), the declarer (R26), the
   refusal rows (R27, R28) and the outward text (R30). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, seeded, MEMBER, portionUnknown, noSuchDatedFact } from "./fixture.mjs";
import { PROGRESSION_CHECKS, GENERIC_CODES, STAGE_REQUIREDNESS } from "../../../src/progressions/index.mjs";
import { SHARED_ACT_CHECKS } from "../../../src/record-grammar/index.mjs";
import { noSuchEntity, noEntity, ENTITY_CHECKS } from "../../../src/entities/index.mjs";
import { noSha, EXTRACTION_CHECKS } from "../../../src/extraction/index.mjs";
import { listenerRefusal } from "../../../src/membership/index.mjs";
import { noSuchStandard } from "../../../src/standards/index.mjs";

const S = (o = {}) => ({ key: "a", cardinality: "1", required: "always", ...o });

test("R1: refusals in order, each writing nothing; a bad stage refuses the whole definition", () => {
  const w = world();
  const before = w.snapshot();
  const d = (b) => w.p.defineProgression({ declaredBy: "member:alice", ...b });
  assert.equal(d({}).reason, "NO_KEY");
  assert.equal(d({ progressionKey: "  " , label: "x", stages: [S()] }).reason, "NO_KEY");
  assert.equal(d({ progressionKey: "k", stages: [S()] }).reason, "PROGRESSION_NO_LABEL");
  assert.equal(d({ progressionKey: "k", label: "L" }).reason, "NO_STAGES");
  assert.equal(d({ progressionKey: "k", label: "L", stages: [] }).reason, "NO_STAGES");
  assert.equal(d({ progressionKey: "k", label: "L", stages: [S(), S({ key: "" })] }).reason, "NO_STAGE_KEY");
  assert.equal(d({ progressionKey: "k", label: "L", stages: [S(), S()] }).reason, "DUPLICATE_STAGE");
  assert.equal(d({ progressionKey: "k", label: "L", stages: [S(), S({ key: "b", cardinality: "" })] }).reason, "NO_CARDINALITY");
  const bad = d({ progressionKey: "k", label: "L", stages: [S(), S({ key: "b", required: "often" })] });
  assert.equal(bad.reason, "BAD_REQUIRED");
  for (const word of STAGE_REQUIREDNESS) assert.match(bad.detail, new RegExp(word));
  assert.deepEqual([...STAGE_REQUIREDNESS], ["always", "usually", "sometimes", "never", "unless_exception"]);
  // per stage, in order: stage 2's missing key is heard before stage 3's bad requiredness
  assert.equal(d({ progressionKey: "k", label: "L", stages: [S(), S({ key: "" }), S({ key: "c", required: "x" })] }).reason, "NO_STAGE_KEY");
  // UNKNOWN_AFTER after every per-stage check, and a later stage's bad field is still heard first
  assert.equal(d({ progressionKey: "k", label: "L", stages: [S({ after: "zz" }), S({ key: "b", cardinality: "" })] }).reason, "NO_CARDINALITY");
  const ua = d({ progressionKey: "k", label: "L", stages: [S(), S({ key: "b", after: "zz" })] });
  assert.equal(ua.reason, "UNKNOWN_AFTER");
  assert.equal(ua.after, "zz");
  assert.deepEqual(w.snapshot(), before);
  // negative control: every stage good is written
  assert.equal(d({ progressionKey: "k", label: "L", stages: [S(), S({ key: "b", after: "a" })], basis: "b" }).ok, true);
});

test("R2 R26: a first declaration is version 1 with its basis, its citation optional; the declarer is the stamp; bounds", () => {
  const w = world();
  const r = w.p.defineProgression({ progressionKey: "m", label: "Meeting", note: "n".repeat(1500), declaredBy: "member:alice",
    stages: [S({ key: "meeting" }), S({ key: "minutes", after: "meeting", within: "7 days" })],
    basis: "b".repeat(5000), citation: "c".repeat(3000) });
  assert.equal(r.ok, true);
  assert.equal(r.version, 1);
  assert.equal(r.declared_by, "member:alice");
  assert.equal(r.prior_version, null);
  assert.equal(r.basis.statement.length, 4000);
  assert.equal(r.basis.citation.length, 2000);
  assert.equal(r.basis.stated, true);
  const read = w.p.readProgression({ progressionKey: "m" });
  assert.equal(read.note.length, 1000);
  assert.equal(read.declared_by, "member:alice");
  assert.equal(read.basis.statement.length, 4000);
  // a citation stays optional at version 1: the basis alone writes it, and reads back, in the answer and every version
  const plain = w.p.defineProgression({ progressionKey: "n", label: "N", stages: [S()], declaredBy: "class:member",
                                       basis: "  the clerk's published calendar  " });
  assert.equal(plain.ok, true);
  assert.equal(plain.version, 1);
  assert.deepEqual(plain.basis, { statement: "the clerk's published calendar", citation: null, stated: true, standard: null });
  const back = w.p.readProgression({ progressionKey: "n" });
  assert.equal(back.declared_by, "class:member");
  assert.deepEqual(back.basis, plain.basis);
  assert.deepEqual(back.versions.map((v) => [v.version, v.basis]), [[1, plain.basis]]);
  assert.deepEqual(w.rows(`SELECT version, basis_statement, basis_citation FROM progression_def_versions WHERE progression_key='n'`),
                   [{ version: 1, basis_statement: "the clerk's published calendar", basis_citation: null }]);
});

test("R2: a first declaration without a basis statement is refused NO_BASIS (C-33.40), after every stage check, writing nothing", () => {
  const w = world();
  const before = w.snapshot();
  const d = (extra, stages = [S(), S({ key: "b", after: "a" })]) =>
    w.p.defineProgression({ progressionKey: "k", label: "L", stages, declaredBy: "member:alice", citation: "Ord. 1", ...extra });
  // absent, not a string, blank, only whitespace: each judged as R4 judges a revision's, with a citation sent or not
  const absences = [{}, { basis: undefined }, { basis: null }, { basis: 7 }, { basis: true }, { basis: {} }, { basis: ["why"] },
                    { basis: "" }, { basis: "   " }, { basis: "\t\n " }, { basis: "", citation: undefined }];
  for (const extra of absences) {
    const r = d(extra);
    const shown = JSON.stringify(extra);
    assert.equal(r.ok, false, shown);
    assert.deepEqual([r.reason, r.code, r.check, r.translation],
                     ["NO_BASIS", "NO_BASIS", SHARED_ACT_CHECKS.NO_BASIS.check, SHARED_ACT_CHECKS.NO_BASIS.translation], shown);
    assert.equal(r.check, "C-33.40");
    assert.equal(r.progression_key, "k");
    assert.equal(r.version, null);
    assert.ok(typeof r.detail === "string" && /first/.test(r.detail), shown);
  }
  // every stage check is heard before the missing basis
  const stageFirst = [
    [[S(), S({ key: "" })], "NO_STAGE_KEY"], [[S(), S()], "DUPLICATE_STAGE"], [[S(), S({ key: "b", cardinality: "" })], "NO_CARDINALITY"],
    [[S(), S({ key: "b", required: "often" })], "BAD_REQUIRED"], [[S(), S({ key: "b", after: "zz" })], "UNKNOWN_AFTER"],
  ];
  for (const [stages, code] of stageFirst) assert.equal(d({}, stages).reason, code);
  assert.equal(w.p.defineProgression({ progressionKey: "k", stages: [S()] }).reason, "PROGRESSION_NO_LABEL");
  assert.equal(w.p.defineProgression({ progressionKey: "k", label: "L" }).reason, "NO_STAGES");
  // nothing written: no definition, no stage, no version
  assert.deepEqual(w.snapshot(), before);
  for (const t of ["progression_defs", "progression_stages", "progression_def_versions", "progression_stage_versions"])
    assert.equal(w.count(t), 0, t);
  assert.equal(w.p.readProgression({ progressionKey: "k" }).found, false);
  // negative control: the same declaration with a basis is written as version 1
  const ok = d({ basis: "why" });
  assert.equal(ok.ok, true);
  assert.equal(ok.version, 1);
  assert.equal(w.count("progression_def_versions"), 1);
  // and a declaration of a key already standing is no first declaration: identical is unchanged with no basis (R3)
  assert.equal(d({}).unchanged, true);
});

test("R3: a declaration identical to the current version writes nothing and answers unchanged", () => {
  const w = world();
  w.define();
  const before = w.snapshot();
  const again = w.define();
  assert.equal(again.ok, true);
  assert.equal(again.unchanged, true);
  assert.equal(again.version, 1);
  assert.deepEqual(w.snapshot(), before);
  // over-strictness arm: a different declarer or basis alone is still no revision; any stage field is one
  assert.equal(w.p.defineProgression({ progressionKey: "proc", label: "Procurement", declaredBy: "member:zed",
    stages: w.p.readProgression({ progressionKey: "proc" }).stages.map((s) => ({ key: s.stage_key, after: s.after_stage,
      cardinality: s.cardinality, within: s.within_interval, required: s.required })) }).unchanged, true);
  assert.equal(w.define("proc", { contract: { within: "3 weeks" } }).reason, "NO_BASIS");
});

test("R4 R23: a revision needs basis then citation, judged after every stage; it appends N+1 and every version stands", () => {
  const w = world();
  w.define();
  const nb = w.define("proc", { contract: { required: "always" } });
  assert.equal(nb.reason, "NO_BASIS");
  assert.equal(nb.code, "NO_BASIS");
  assert.deepEqual([nb.check, nb.translation], [SHARED_ACT_CHECKS.NO_BASIS.check, SHARED_ACT_CHECKS.NO_BASIS.translation]);
  const nc = w.define("proc", { contract: { required: "always" } }, { basis: "the rule changed" });
  assert.equal(nc.reason, "NO_CITATION");
  assert.deepEqual([nc.check, nc.translation], [SHARED_ACT_CHECKS.NO_CITATION.check, SHARED_ACT_CHECKS.NO_CITATION.translation]);
  // a bad stage is heard before a missing basis
  assert.equal(w.define("proc", { contract: { required: "nope" } }).reason, "BAD_REQUIRED");
  w.clock.now = "2026-09-02T00:00:00.000Z";
  const rev = w.define("proc", { contract: { required: "always" } }, { basis: "the rule changed", citation: "Ord. 12", declaredBy: "member:bea" });
  assert.equal(rev.ok, true);
  assert.equal(rev.version, 2);
  assert.equal(rev.prior_version, 1);
  assert.equal(rev.declared_by, "member:bea");
  assert.equal(rev.at, "2026-09-02T00:00:00.000Z");
  const v1 = w.p.readProgression({ progressionKey: "proc", version: 1 });
  assert.equal(v1.stages.find((s) => s.stage_key === "contract").required, "usually");
  assert.equal(v1.current, false);
  assert.equal(w.p.readProgression({ progressionKey: "proc" }).stages.find((s) => s.stage_key === "contract").required, "always");
  // R23: nothing deletes a version; a third declaration leaves both earlier ones intact
  w.define("proc", { contract: { required: "sometimes" } }, { basis: "again", citation: "Ord. 13" });
  const all = w.p.readProgression({ progressionKey: "proc" });
  assert.deepEqual(all.versions.map((v) => v.version), [1, 2, 3]);
  assert.deepEqual(w.p.readProgression({ progressionKey: "proc", version: 1 }).stages, v1.stages);
  assert.equal(w.count("progression_def_versions"), 3);
});

test("R4: a definition declared before versions were kept is first written as version 1, basis not recorded", () => {
  const w = world();
  w.st.sql.exec(`INSERT INTO progression_defs (progression_key,label,note,declared_by,at) VALUES ('old','Old',NULL,'member:x','2026-01-01T00:00:00Z')`);
  w.st.sql.exec(`INSERT INTO progression_stages (progression_key,stage_key,stage_no,label,after_stage,cardinality,within_interval,required)
                 VALUES ('old','a',1,NULL,NULL,'1',NULL,'always')`);
  const before = w.p.readProgression({ progressionKey: "old" });
  assert.equal(before.version, 1);
  assert.equal(before.basis.stated, false);
  const r = w.p.defineProgression({ progressionKey: "old", label: "Old", stages: [S({ required: "usually" })], basis: "b", citation: "c" });
  assert.equal(r.version, 2);
  const v1 = w.p.readProgression({ progressionKey: "old", version: 1 });
  assert.equal(v1.declared_by, "member:x");
  assert.equal(v1.stages[0].required, "always");
  assert.equal(v1.basis.stated, false);
});

test("R5: NO_KEY; an undeclared key is found:false; a read names versions, current and basis; PROGRESSION_VERSION_NOT_HELD names the versions held", () => {
  const w = world();
  assert.equal(w.p.readProgression({}).reason, "NO_KEY");
  assert.deepEqual(w.p.readProgression({ progressionKey: "none" }), { ok: true, progression_key: "none", found: false, stages: [] });
  w.define();
  const r = w.p.readProgression({ progressionKey: "proc" });
  assert.equal(r.found, true);
  assert.equal(r.version, 1);
  assert.equal(r.current, true);
  assert.equal(r.current_version, 1);
  assert.deepEqual(r.stages.map((s) => s.stage_key), ["need", "award", "contract"]);
  assert.deepEqual(Object.keys(r.stages[0]).sort(), ["after_stage", "cardinality", "label", "required", "stage_key", "stage_no", "within_interval"]);
  assert.deepEqual(r.versions.map((v) => [v.version, v.declared_by, typeof v.at, v.basis.stated]), [[1, "member:alice", "string", true]]);
  for (const bad of [7, "x", 0]) {
    const nf = w.p.readProgression({ progressionKey: "proc", version: bad });
    assert.equal(nf.reason, "PROGRESSION_VERSION_NOT_HELD");
    assert.equal(nf.check, "C-100.8");
    assert.deepEqual(nf.versions_held, [1]);
    assert.match(nf.detail, /holds versions 1/);
  }
});

test("R27 R28: every refusal this module answers carries its code with its row and translation, or is one it answers from its owner or as a generic code", async () => {
  // C-100 and the three moved rows: one function and one marked region each (N118, N242), ids unique, a translation
  const kept = ["PROGRESSION_NO_LABEL", "PROGRESSION_VERSION_NOT_HELD", "NOT_A_DISPOSITION", "NO_STAGES", "NO_STAGE_KEY", "DUPLICATE_STAGE", "NO_CARDINALITY", "BAD_REQUIRED", "UNKNOWN_AFTER",
    "NO_PLACEMENTS", "NO_SUCH_PROGRESSION", "NO_STAGE", "BAD_STAGE", "NO_CAPTURE", "DUPLICATE_PLACEMENT", "NOT_CONCERNED",
    "NO_REASON", "BAD_REASON", "NO_DECIDER", "NO_DEFINITION_VERSION", "DEFINITION_MOVED",
    "NOT_ATTESTED_BY_DOCUMENT"];
  assert.deepEqual(Object.keys(PROGRESSION_CHECKS).sort(), [...kept].sort());
  const ids = new Set();
  for (const c of kept) {
    const row = PROGRESSION_CHECKS[c];
    assert.match(row.check, /^C-\d+\.\d+$/, c);
    assert.ok(!ids.has(row.check), `${c}: ${row.check} used twice`);
    ids.add(row.check);
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, c);
    // one function, one region; R35's shared answer is its own exported function in checks.mjs
    assert.match(row.where, c === "NOT_A_DISPOSITION" ? /^src\/progressions\/checks\.mjs notADisposition > is-disposition-word$/
                                                      : /^src\/progressions\/index\.mjs #?[A-Za-z]+ > is-[a-z-]+$/, c);
  }
  // the ids of the rows that left C-100 in T10 are retired, never reused
  for (const retired of ["C-100.1", "C-100.9", "C-100.12", "C-100.19", "C-100.23", "C-100.25"])
    assert.ok(!ids.has(retired), retired);
  // N285: the renamed codes keep their ids; the old names and the retired NO_SHA row are gone
  assert.equal(PROGRESSION_CHECKS.PROGRESSION_NO_LABEL.check, "C-100.2");
  assert.equal(PROGRESSION_CHECKS.PROGRESSION_VERSION_NOT_HELD.check, "C-100.8");
  assert.equal(PROGRESSION_CHECKS.NOT_A_DISPOSITION.check, "C-100.20");
  for (const gone of ["NO_LABEL", "NOT_FOUND", "NO_SHA", "NO_ENTITY"]) assert.equal(PROGRESSION_CHECKS[gone], undefined, gone);
  // the generic code (N118): no row of this module's
  assert.deepEqual([...GENERIC_CODES], ["NO_KEY"]);
  for (const c of GENERIC_CODES) assert.equal(PROGRESSION_CHECKS[c], undefined, c);
  // R28: the three moved rows keep their ids; the shared act rows are record-grammar's (its R29), never this module's
  assert.equal(PROGRESSION_CHECKS.UNKNOWN_AFTER.check, "C-33.26");
  assert.equal(PROGRESSION_CHECKS.NO_DEFINITION_VERSION.check, "C-33.42");
  assert.equal(PROGRESSION_CHECKS.DEFINITION_MOVED.check, "C-33.43");
  assert.deepEqual(Object.keys(SHARED_ACT_CHECKS).sort(), ["NO_BASIS", "NO_CITATION"]);
  assert.deepEqual([SHARED_ACT_CHECKS.NO_BASIS.check, SHARED_ACT_CHECKS.NO_CITATION.check], ["C-33.40", "C-33.41"]);
  for (const shared of ["NO_BASIS", "NO_CITATION"]) assert.equal(PROGRESSION_CHECKS[shared], undefined, shared);

  // every refusal each act answers, driven at the interface, and what it carries
  const w = seeded();
  w.define();
  w.std.held.set("STD-2026-0001", { portion: "s 2", inForce: { state: "in_force", why: "w" } });
  const B = (basis) => w.p.defineProgression({ progressionKey: "k2", label: "L", stages: [S()], basis, viewer: MEMBER });
  const S2 = (o) => ({ progressionKey: "k", label: "L", stages: [S(), S({ key: "b", ...o })] });
  const P = (...ps) => w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements: ps, threadedBy: "member:alice", viewer: MEMBER });
  const Dc = (b) => w.p.dischargeStage({ progressionKey: "proc", entityId: "ENT-1", stageKey: "need", captureSha: "sa", reason: "r",
                                         citation: "c", declaredBy: "member:alice", ...b });
  const X = (b) => w.p.disposeProposal({ key: "proc::award", to: "deferred", reason: "r", definitionVersion: 1, decidedBy: "member:alice", ...b });
  const f = () => {};
  const answered = [
    w.p.defineProgression({}), w.p.defineProgression({ progressionKey: "k" }), w.p.defineProgression({ progressionKey: "k", label: "L" }),
    w.p.defineProgression(S2({ key: "" })), w.p.defineProgression(S2({ key: "a" })), w.p.defineProgression(S2({ cardinality: "" })),
    w.p.defineProgression(S2({ required: "x" })), w.p.defineProgression(S2({ after: "q" })), w.p.defineProgression(S2({ after: "a" })),
    w.define("proc", { need: { required: "usually" } }), w.define("proc", { need: { required: "usually" } }, { basis: "b" }),
    w.p.readProgression({}), w.p.readProgression({ progressionKey: "proc", version: 9 }),
    await w.p.threadInstance({}), await w.p.threadInstance({ progressionKey: "proc" }), await w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1" }),
    await w.p.threadInstance({ progressionKey: "nope", entityId: "ENT-1", placements: [{}] }),
    await w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-9", placements: [{}] }),
    await P({}), await P({ stage: "bid" }), await P({ stage: "need" }), await P({ stage: "need", captureSha: "sa" }, { stage: "need", captureSha: "sa" }),
    await P({ stage: "need", captureSha: "zz" }),
    await P({ stage: "need", captureSha: "sa", event: "EVT-2026-zzzzzzzzzzzzzzzz" }), await P({ stage: "need", captureSha: "sa", datedFact: "DF-x" }),
    B({ statement: "b", standard: "STD-2026-0009" }), B({ statement: "b", standard: "STD-2026-0001", portion: "s 3" }),
    w.p.readInstance({}), w.p.readInstance({ progressionKey: "proc" }), w.p.readExceptions({}), w.p.readExceptions({ progressionKey: "proc" }),
    Dc({ progressionKey: "" }), Dc({ entityId: "" }), Dc({ stageKey: "" }), Dc({ captureSha: "" }), Dc({ reason: "" }), Dc({ citation: "" }),
    Dc({ progressionKey: "nope" }), Dc({ entityId: "ENT-9" }), Dc({ stageKey: "bid" }), Dc({ captureSha: "zz" }),
    w.p.captureProgressions({}),
    X({ key: "" }), X({ key: "proc::" }), X({ to: "adopted" }), X({ reason: "" }), X({ reason: "a\nb" }), X({ decidedBy: "" }),
    X({ key: "nope::award" }), X({ key: "proc::bid" }), X({ definitionVersion: null }), X({ definitionVersion: 2 }),
    w.p.onThreaded("scheduler", f) && w.p.onThreaded("scheduler", f), w.p.onThreaded("", f),
  ];
  const seen = new Set();
  for (const r of answered) {
    assert.equal(r.ok, false, JSON.stringify(r));
    assert.equal(r.code, r.reason);
    seen.add(r.code);
    if (PROGRESSION_CHECKS[r.code] || SHARED_ACT_CHECKS[r.code]) {
      const row = PROGRESSION_CHECKS[r.code] || SHARED_ACT_CHECKS[r.code];
      assert.deepEqual([r.check, r.translation], [row.check, row.translation], r.code);
    } else if (r.code === "NO_SUCH_ENTITY") assert.deepEqual(r, noSuchEntity("ENT-9"));          // entities R36 (N208)
    else if (r.code === "NO_ENTITY") assert.deepEqual(r, noEntity(r.detail));                  // entities R37 (N285)
    else if (r.code === "NO_SHA") {                                                              // extraction R63 (N285)
      assert.deepEqual(r, noSha(r.detail));
      assert.equal(r.check, EXTRACTION_CHECKS.NO_SHA.check);
    }
    else if (r.code === "NO_SUCH_STANDARD") assert.deepEqual(r, noSuchStandard("STD-2026-0009"));  // standards R17 (R39)
    else if (r.code === "NO_SUCH_DATED_FACT") assert.deepEqual(r, noSuchDatedFact("DF-x", { stage_key: "need", capture_sha: "sa" }));  // events R7 (K1568 (3))
    else if (r.code === "PORTION_UNKNOWN") assert.deepEqual(r, portionUnknown("STD-2026-0001", "s 3", { portion_held: "s 2" }));  // K1563 (10)
    else if (r.code === "LISTENER_DECLARED") assert.deepEqual(r, listenerRefusal([{ module: "scheduler" }], "scheduler", f));
    else if (r.code === "LISTENER_MALFORMED") assert.deepEqual(r, listenerRefusal([], "", f));   // membership R81 (N202)
    else {
      assert.ok(GENERIC_CODES.includes(r.code), `${r.code} answers with no row and is not a generic code`);
      assert.deepEqual([r.check, r.translation], [undefined, undefined], r.code);
      assert.ok(typeof r.detail === "string" && r.detail.length > 10, r.code);
    }
  }
  // the drive reached every code: each row, each generic code, the shared act rows and the owners' answers
  assert.deepEqual([...seen].sort(), [...kept, ...GENERIC_CODES, "NO_BASIS", "NO_CITATION", "NO_SUCH_ENTITY",
                                      "LISTENER_DECLARED", "LISTENER_MALFORMED", "NO_SHA", "NO_ENTITY", "NO_SUCH_STANDARD", "PORTION_UNKNOWN", "NO_SUCH_DATED_FACT"].sort());
});

test("R27: NO_ENTITY is entities' one answer (its R37, noEntity, C-91.5) at every act that asks for an entity, whatever shape of absence; writes nothing", async () => {
  const w = seeded();
  w.define();
  assert.equal(PROGRESSION_CHECKS.NO_ENTITY, undefined);                 // C-100.9 gave way (N285)
  assert.equal(ENTITY_CHECKS.NO_ENTITY.check, "C-91.5");
  const before = w.snapshot();
  const acts = {
    thread: (entityId) => w.p.threadInstance({ progressionKey: "proc", entityId, placements: [{ stage: "need", captureSha: "sa" }],
                                               threadedBy: "member:alice", viewer: MEMBER }),
    instance: (entityId) => w.p.readInstance({ progressionKey: "proc", entityId, viewer: MEMBER }),
    discharge: (entityId) => w.p.dischargeStage({ progressionKey: "proc", entityId, stageKey: "need", captureSha: "sa", reason: "r",
                                                  citation: "c", declaredBy: "member:alice", viewer: MEMBER }),
    exceptions: (entityId) => w.p.readExceptions({ progressionKey: "proc", entityId, viewer: MEMBER }),
  };
  for (const [name, act] of Object.entries(acts))
    for (const absent of [undefined, null, "", "   ", 7, true, {}, ["ENT-1"]]) {
      const r = await act(absent);
      const shown = `${name} ${JSON.stringify(absent)}`;
      assert.deepEqual(r, noEntity(r.detail), shown);                    // field for field entities' answer, with the act's sentence
      assert.deepEqual([r.code, r.check, r.translation], ["NO_ENTITY", "C-91.5", ENTITY_CHECKS.NO_ENTITY.translation], shown);
      assert.ok(typeof r.detail === "string" && r.detail.length > 10, shown);
    }
  // NO_KEY is still heard first; a key and an entity named is no NO_ENTITY (negative control)
  assert.equal(w.p.readInstance({ entityId: "" }).code, "NO_KEY");
  assert.deepEqual(w.snapshot(), before);
  for (const act of Object.values(acts)) assert.notEqual((await act("ENT-1")).code, "NO_ENTITY");
});

test("R30: no place is named in this module's outward text", () => {
  const texts = Object.values(PROGRESSION_CHECKS).map((r) => r.translation).join("\n");
  const w = world();
  const outward = JSON.stringify([w.p.defineProgression({}), w.define(), w.p.readProgression({ progressionKey: "proc", version: 9 })]);
  for (const place of ["Oakland", "Alameda", "California"]) {
    assert.ok(!texts.includes(place), place);
    assert.ok(!outward.includes(place), place);
  }
});
