/* The declared flow: defineProgression and readProgression (R1–R5), its versions (R23), the declarer (R26), the
   refusal rows (R27, R28) and the outward text (R30). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { PROGRESSION_CHECKS, STAGE_REQUIREDNESS } from "../../../src/progressions/index.mjs";
import { ACT_SHAPE_CHECKS } from "../../../checks/bio-checks.mjs";

const S = (o = {}) => ({ key: "a", cardinality: "1", required: "always", ...o });

test("R1: refusals in order, each writing nothing; a bad stage refuses the whole definition", () => {
  const w = world();
  const before = w.snapshot();
  const d = (b) => w.p.defineProgression({ declaredBy: "member:alice", ...b });
  assert.equal(d({}).reason, "NO_KEY");
  assert.equal(d({ progressionKey: "  " , label: "x", stages: [S()] }).reason, "NO_KEY");
  assert.equal(d({ progressionKey: "k", stages: [S()] }).reason, "NO_LABEL");
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
  assert.equal(d({ progressionKey: "k", label: "L", stages: [S(), S({ key: "b", after: "a" })] }).ok, true);
});

test("R2 R26: a first declaration is version 1 with its basis or stated:false; the declarer is the stamp; bounds", () => {
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
  const bare = w.p.defineProgression({ progressionKey: "n", label: "N", stages: [S()], declaredBy: "class:member" });
  assert.deepEqual(bare.basis, { statement: null, citation: null, stated: false });
  assert.equal(w.p.readProgression({ progressionKey: "n" }).declared_by, "class:member");
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
  assert.equal(nb.check, ACT_SHAPE_CHECKS.NO_BASIS.check);
  const nc = w.define("proc", { contract: { required: "always" } }, { basis: "the rule changed" });
  assert.equal(nc.reason, "NO_CITATION");
  assert.equal(nc.check, ACT_SHAPE_CHECKS.NO_CITATION.check);
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

test("R5: NO_KEY; an undeclared key is found:false; a read names versions, current and basis; NOT_FOUND names the versions held", () => {
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
  assert.deepEqual(r.versions.map((v) => [v.version, v.declared_by, typeof v.at, v.basis.stated]), [[1, "member:alice", "string", false]]);
  for (const bad of [7, "x", 0]) {
    const nf = w.p.readProgression({ progressionKey: "proc", version: bad });
    assert.equal(nf.reason, "NOT_FOUND");
    assert.deepEqual(nf.versions_held, [1]);
    assert.match(nf.detail, /holds versions 1/);
  }
});

test("R27 R28: every refusal code this module answers carries its code, catalogue row and translation", () => {
  const codes = ["NO_KEY", "NO_LABEL", "NO_STAGES", "NO_STAGE_KEY", "DUPLICATE_STAGE", "NO_CARDINALITY", "BAD_REQUIRED",
    "UNKNOWN_AFTER", "NOT_FOUND", "NO_ENTITY", "NO_PLACEMENTS", "NO_SUCH_PROGRESSION", "NO_SUCH_ENTITY", "NO_STAGE",
    "BAD_STAGE", "NO_CAPTURE", "DUPLICATE_PLACEMENT", "NOT_CONCERNED", "NO_REASON", "NO_SHA", "NOT_A_DISPOSITION",
    "BAD_REASON", "NO_DECIDER", "NO_DEFINITION_VERSION", "DEFINITION_MOVED", "LISTENER_DECLARED"];
  assert.deepEqual(Object.keys(PROGRESSION_CHECKS).sort(), [...codes].sort());
  const ids = new Set();
  for (const c of codes) {
    const row = PROGRESSION_CHECKS[c];
    assert.match(row.check, /^C-\d+\.\d+$/, c);
    assert.ok(!ids.has(row.check), `${c}: ${row.check} used twice`);
    ids.add(row.check);
    assert.ok(typeof row.translation === "string" && row.translation.length > 40, c);
    assert.match(row.where, /^src\/progressions\/index\.mjs /, c);
  }
  // R28: the three moved rows keep their ids; the shared act rows stay in the catalogue
  assert.equal(PROGRESSION_CHECKS.UNKNOWN_AFTER.check, "C-33.26");
  assert.equal(PROGRESSION_CHECKS.NO_DEFINITION_VERSION.check, "C-33.42");
  assert.equal(PROGRESSION_CHECKS.DEFINITION_MOVED.check, "C-33.43");
  for (const moved of ["UNKNOWN_AFTER", "NO_DEFINITION_VERSION", "DEFINITION_MOVED"]) assert.equal(ACT_SHAPE_CHECKS[moved], undefined, moved);
  assert.ok(ACT_SHAPE_CHECKS.NO_BASIS && ACT_SHAPE_CHECKS.NO_CITATION);
  // each refusal as answered carries its row
  const w = world();
  w.define();
  for (const r of [w.p.defineProgression({}), w.p.readProgression({ progressionKey: "proc", version: 2 }),
                   w.p.defineProgression({ progressionKey: "k", label: "L", stages: [S({ after: "q" })] })]) {
    assert.equal(r.code, r.reason);
    assert.equal(r.check, PROGRESSION_CHECKS[r.reason].check);
    assert.equal(r.translation, PROGRESSION_CHECKS[r.reason].translation);
  }
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
