/* intent's objective: R1 (C-2.9's objective arm, at the write and in the audit), R22 (the arm moved, every refusal a
   row), R2 (setCondition), R3–R5 (progress), R6 (gaps), R7 (watchSet). */
import test from "node:test";
import assert from "node:assert/strict";
import { checkBundle } from "../../../checks/bio-checks.mjs";
import { INTENT_CHECKS } from "../../../src/intent/index.mjs";
import { world, seeded, V, MACHINE, COND, projMd } from "./fixture.mjs";

const strip = (r) => { const { detail, project, ...rest } = r; return rest; };

test("R1 a promotion of a project whose document states no objective, or an empty one, is refused and writes nothing; one stating it is accepted", () => {
  const w = world();
  w.member("alice");
  for (const objective of [null, "", "   "]) {
    const before = w.snapshot();
    const r = w.promotion.promote({ base: null, snapKey: `s${objective === null ? "n" : objective.length}`, author: V("alice"),
      ownerMemberId: "alice", files: [{ path: "bundle.md", text: projMd(`P ${String(objective).length}`, objective) }],
      meta: { object_type: "project" } });
    assert.equal(r.ok, false);
    assert.equal(r.reason, "NO_OBJECTIVE");
    assert.equal(r.check, "C-2.9");
    assert.ok(r.translation);
    assert.deepEqual(w.snapshot(), before, "a refused promotion writes nothing");
  }
  const P = w.project("Stated", "alice");
  assert.ok(w.record.head(P));
  /* a revision that empties the objective is refused too */
  const emptied = w.text(P).replace(/^objective: .*$/m, 'objective: ""');
  const r = w.revise(P, emptied, V("alice"));
  assert.equal(r.reason, "NO_OBJECTIVE");
  const dropped = w.text(P).replace(/^objective: .*\n/m, "");
  assert.equal(w.revise(P, dropped, V("alice")).reason, "NO_OBJECTIVE");
  /* a revision that keeps it is accepted */
  assert.equal(w.revise(P, w.text(P).replace("current_state: forming", "current_state: forming"), V("alice")).ok, true);
});

test("R22 C-2.9's objective arm moved to intent with its test: the catalogue no longer reports it, intent's audit check does (same id), and every refusal this module names has a row", async () => {
  const noObjective = projMd("X", null).replace("---\n", "---\nid: PROJ-2026-0001-x\n");
  const cat = await checkBundle({ folderName: "PROJ-2026-0001-x", files: new Map([["bundle.md", noObjective]]),
                                  sha256: async () => "0" });
  assert.ok(!cat.findings.some((f) => f.check === "C-2.9" && /objective/.test(f.message)), "the catalogue's arm is gone");
  /* the audit keeps it, through intent's registered check (record-core R59) */
  const w = world();
  w.member("alice");
  const P = w.project("Audited", "alice");
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='bundle.md'`, w.text(P).replace(/^objective: .*\n/m, ""), P);
  const pass = await w.record.auditPass({ limit: 50 });
  assert.equal(pass.tally["C-2.9"], 1);
  assert.equal(pass.tallyDetail["C-2.9/NO_OBJECTIVE"], 1);
  /* every refusal code intent.md names has its row here, with a check id and a translation */
  const named = ["NO_OBJECTIVE", "MACHINE_CANNOT_SET_OBJECTIVE", "NO_SUCH_PROJECT", "CONDITION_UNREADABLE", "NO_SUCH_PROGRESSION",
    "NO_SUCH_ENTITY", "BAD_STAGE", "BAD_GRADE", "BAD_SHARE", "MACHINE_CANNOT_DECLARE_GOAL", "NO_STATEMENT", "NO_SUCH_GOAL",
    "NO_SUCH_ASPIRATION", "NO_REASON", "MACHINE_CANNOT_DECLARE_ASPIRATION", "NOT_YOURS", "GROUP_ASPIRATION_NOT_ADMIN",
    "NO_LESSON", "MACHINE_CANNOT_TRIAGE", "MACHINE_CANNOT_CHOOSE_THE_QUESTION"];
  for (const code of named) {
    assert.ok(INTENT_CHECKS[code], `${code} has a row`);
    assert.match(INTENT_CHECKS[code].check, /^C-\d+\.\d+$/);
    assert.ok(INTENT_CHECKS[code].translation.length > 20);
  }
  const ids = Object.values(INTENT_CHECKS).map((r) => r.check);
  assert.equal(new Set(ids).size, ids.length, "one row per check id");
});

test("R2 setCondition's refusals, in order: machine, absent or unseen project (one answer), not joined, unreadable, no progression, no entity, bad stage, bad grade, bad share", async () => {
  const w = seeded();
  w.entity("ENT-1");
  w.define();
  const P = w.P;
  const hidden = w.project("Hidden one", "carol");
  const set = (condition, author = V("bob"), project = P, viewer = author) => w.i.setCondition({ project, condition, author, viewer });
  for (const who of ["", null, MACHINE, "class:daemon"]) assert.equal(set(COND, who).reason, "MACHINE_CANNOT_SET_OBJECTIVE");
  const absent = set(COND, V("bob"), "PROJ-2026-9999-nothing");
  const unseen = set(COND, V("bob"), hidden);
  assert.equal(absent.reason, "NO_SUCH_PROJECT");
  assert.deepEqual(strip(unseen), strip(absent), "an unseen project answers as an absent one");
  assert.equal(set(COND, V("carol")).reason, "PROJECT_ACT_NOT_A_PARTICIPANT", "an invited member has not joined");
  for (const bad of [{}, { ...COND, satisfied: undefined }, { ...COND, required: "B" }, { ...COND, relation: "friend_of" },
                     { ...COND, progression: "" }, { ...COND, filter: "kind=body" }, { ...COND, filter: { k: { nested: 1 } } },
                     { ...COND, required: { grade: "B", stages: "need" } }, "text"])
    assert.equal(set(bad).reason, "CONDITION_UNREADABLE", JSON.stringify(bad));
  assert.equal(set({ ...COND, progression: "nope", required: { grade: "E" } }).reason, "NO_SUCH_PROGRESSION", "asked before the grade");
  assert.equal(set({ ...COND, entity: "ENT-9", required: { grade: "E" } }).reason, "NO_SUCH_ENTITY");
  assert.equal(set({ ...COND, required: { grade: "E", stages: ["need", "signoff"] } }).reason, "BAD_STAGE");
  assert.equal(set({ ...COND, required: { grade: "E", stages: ["need"] } }).reason, "BAD_GRADE");
  for (const share of [0, 101, 50.5, "50", null, -1]) assert.equal(set({ ...COND, satisfied: { share } }).reason, "BAD_SHARE", String(share));
  for (const r of [set(COND, MACHINE), absent, set(COND, V("carol")), set({}), set({ ...COND, satisfied: { share: 0 } })]) {
    assert.ok(r.check && r.translation, `${r.reason} carries its row`);
  }
  assert.equal(w.fm(P).objective_condition, undefined, "no refusal wrote anything");
});

test("R2 success writes a new revision of the project document through promotion carrying the condition, its author and time; the earlier revision stays in history; null removes it; a raw promotion is held to the same grammar", async () => {
  const w = seeded();
  w.entity("ENT-1");
  w.define();
  const P = w.P;
  const before = w.record.head(P);
  const r = w.i.setCondition({ project: P, condition: COND, author: V("bob"), viewer: V("bob") });
  assert.equal(r.ok, true);
  assert.equal(r.project, P);
  assert.equal(r.at, w.clock.now);
  assert.deepEqual(r.condition.required, COND.required);
  const after = w.record.head(P);
  assert.equal(after.rowVersion, before.rowVersion + 1);
  const oc = w.fm(P).objective_condition;
  assert.equal(oc.progression, "proc");
  assert.equal(oc.entity, "ENT-1");
  assert.deepEqual(oc.required_stages, ["need", "award"]);
  assert.equal(oc.required_grade, "B");
  assert.equal(oc.share, 50);
  assert.equal(oc.set_by, V("bob"));
  assert.equal(oc.set_at, w.clock.now);
  const hist = w.rows(`SELECT COUNT(*) AS n FROM history WHERE bundle_id=? AND path='bundle.md'`, P)[0].n;
  assert.equal(hist, 1, "the earlier revision is held in history");
  assert.equal(w.rows(`SELECT author FROM manifest WHERE bundle_id=? ORDER BY rowid DESC LIMIT 1`, P)[0].author, V("bob"));
  /* read back through progress */
  assert.deepEqual(w.i.progress({ project: P, viewer: V("bob") }).condition.required, COND.required);
  /* null removes it, as another revision */
  const off = w.i.setCondition({ project: P, condition: null, author: V("bob"), viewer: V("bob") });
  assert.equal(off.ok, true);
  assert.equal(off.condition, null);
  assert.equal(w.fm(P).objective_condition, undefined);
  assert.equal(w.record.head(P).rowVersion, before.rowVersion + 2);
  /* a raw promotion carrying an unreadable or wrong condition is refused at the write */
  const bad = w.text(P).replace("references: []", "references: []\nobjective_condition:\n  progression: nope\n  entity: ENT-1\n  required_grade: B\n  required_stages: []\n  share: 50");
  assert.equal(w.revise(P, bad, V("bob")).reason, "NO_SUCH_PROGRESSION");
  const badShare = w.text(P).replace("references: []", "references: []\nobjective_condition:\n  progression: proc\n  entity: ENT-1\n  required_grade: B\n  required_stages: []\n  share: 500");
  assert.equal(w.revise(P, badShare, V("bob")).reason, "BAD_SHARE");
});

test("R3 with no condition the answer carries condition null and says progress cannot be computed, never reading as zero; an absent or unseen project is NO_SUCH_PROJECT", () => {
  const w = seeded();
  const r = w.i.progress({ project: w.P, viewer: V("bob") });
  assert.equal(r.ok, true);
  assert.equal(r.condition, null);
  assert.equal(r.computable, false);
  assert.match(r.why, /cannot be computed/);
  for (const k of ["matched", "meeting", "short", "undetermined", "satisfied"]) assert.equal(r[k], null, `${k} is not zero`);
  assert.equal(r.objective, "Find out what happened.");
  const hidden = w.project("Hidden", "carol");
  const a = w.i.progress({ project: "PROJ-2026-9999-x", viewer: V("bob") });
  const b = w.i.progress({ project: hidden, viewer: V("bob") });
  assert.equal(a.reason, "NO_SUCH_PROJECT");
  assert.deepEqual(strip(b), strip(a));
});

/* ENT-1 the condition's entity; ENT-2 and ENT-4, ENT-5 are member_of ENT-1; ENT-3 is not related. */
async function measured() {
  const w = seeded();
  for (const [id, kind] of [["ENT-1", "body"], ["ENT-2", "office"], ["ENT-3", "body"], ["ENT-4", "body"], ["ENT-5", "body"]])
    w.entity(id, kind);
  w.relate("ENT-2", "ENT-1", "member_of");
  w.relate("ENT-4", "ENT-1", "member_of");
  w.relate("ENT-5", "ENT-1", "member_of");
  w.relate("ENT-3", "ENT-1", "proxy_for");
  w.define();
  await w.thread("ENT-1", { need: "A", award: "B" });      // meets B
  await w.thread("ENT-2", { need: "A", award: "C" });      // short: grade C
  await w.thread("ENT-3", { need: "A", award: "A" });      // not related by member_of
  await w.thread("ENT-4", { need: "A" });                  // grade undetermined, every required stage placed
  await w.thread("ENT-5", { award: "A" });                 // short: need missing, grade undetermined
  return w;
}
const condOf = (share, extra = {}) => ({ progression: "proc", entity: "ENT-1", relation: "member_of",
                                          required: { grade: "B", stages: ["need"] }, satisfied: { share }, ...extra });

test("R4 matched instances are the entity's own and those standing in its relation to it; the share decides satisfied: true when meeting/matched reaches it, false when it cannot even if every undetermined instance met it, else null", async () => {
  const w = await measured();
  const P = w.P;
  const at = (share, extra) => {
    assert.equal(w.i.setCondition({ project: P, condition: condOf(share, extra), author: V("bob"), viewer: V("bob") }).ok, true);
    return w.i.progress({ project: P, viewer: V("bob") });
  };
  /* 4 matched: 1 meeting, 2 short, 1 undetermined */
  assert.equal(at(25).satisfied, true, "1/4 reaches 25%");
  assert.equal(at(26).satisfied, null, "1/4 misses 26%, 2/4 would reach it");
  assert.equal(at(50).satisfied, null, "2/4 would reach 50%");
  assert.equal(at(51).satisfied, false, "even 2/4 misses 51%");
  assert.equal(at(100).satisfied, false);
  /* the relation narrows: with no relation only ENT-1's own instance matches */
  const own = at(100, { relation: null });
  assert.equal(own.matched, 1);
  assert.equal(own.satisfied, true);
  /* nothing matching: no share of nothing is taken */
  w.entity("ENT-9");
  const none = at(50, { entity: "ENT-9", relation: null });
  assert.equal(none.matched, 0);
  assert.equal(none.satisfied, null);
  assert.ok(none.satisfied_why);
});

test("R4 the filter: what the record evaluates narrows (entity_kind), what it cannot makes each matched instance undetermined with why, never excluded; the grade and stages decide meeting; derived on read, nothing stored", async () => {
  const w = await measured();
  const P = w.P;
  const run = (c) => {
    assert.equal(w.i.setCondition({ project: P, condition: c, author: V("bob"), viewer: V("bob") }).ok, true);
    return w.i.progress({ project: P, viewer: V("bob") });
  };
  const kinds = run(condOf(25, { filter: { entity_kind: "body" } }));
  assert.equal(kinds.matched, 3, "ENT-2 is an office and does not pass");
  assert.ok(![...kinds.short, ...kinds.undetermined].some((x) => x.entity_id === "ENT-2"));
  const opaque = run(condOf(25, { filter: { contract_value: "1000" } }));
  assert.equal(opaque.matched, 4, "an unevaluable filter excludes nothing");
  assert.equal(opaque.undetermined.length, 4);
  assert.equal(opaque.meeting, 0);
  assert.ok(opaque.undetermined.every((x) => /cannot evaluate the filter/.test(x.why)));
  assert.equal(opaque.satisfied, null);
  /* stages: requiring award makes ENT-4 short on stages; grade A makes ENT-1 short on grade */
  const strict = run({ ...condOf(25), required: { grade: "A", stages: ["need", "award"] } });
  assert.equal(strict.meeting, 0);
  assert.deepEqual(strict.short.map((x) => x.entity_id).sort(), ["ENT-1", "ENT-2", "ENT-4", "ENT-5"]);
  /* no grade required: the grade is never asked, so ENT-4's undetermined grade does not matter */
  const stagesOnly = run({ ...condOf(50), required: { grade: null, stages: ["need"] } });
  assert.deepEqual(stagesOnly.instances.meeting.map((x) => x.entity_id).sort(), ["ENT-1", "ENT-2", "ENT-4"]);
  assert.equal(stagesOnly.satisfied, true);
  /* derived on read: a new thread moves the answer with no write by intent, and a read writes nothing */
  const snap = w.snapshot();
  w.i.progress({ project: P, viewer: V("bob") });
  assert.deepEqual(w.snapshot(), snap, "a read writes nothing");
  await w.thread("ENT-5", { need: "A", award: "A" });
  const moved = w.i.progress({ project: P, viewer: V("bob") });
  assert.ok(moved.instances.meeting.some((x) => x.entity_id === "ENT-5"));
});

test("R5 each short instance names why: the stages missing, or the grade reached against the grade required and the weakest link; bundle ids the viewer may not see are null, counts and grades the same for every reader", async () => {
  const w = await measured();
  const P = w.P;
  /* ENT-2's award document sits in a project bob does not participate in */
  const hidden = w.project("Elsewhere", "carol");
  w.resolve("ent-2-award", hidden, "ENT-2", "C");
  assert.equal((await w.progressions.threadInstance({ progressionKey: "proc", entityId: "ENT-2", threadedBy: V("alice"),
    placements: [{ stage: "need", captureSha: "ent-2-need" }, { stage: "award", captureSha: "ent-2-award" }] })).ok, true);
  w.join(P, "dave");
  assert.equal(w.i.setCondition({ project: P, condition: { ...condOf(25), required: { grade: "B", stages: ["need"] } },
                                   author: V("bob"), viewer: V("bob") }).ok, true);
  const bob = w.i.progress({ project: P, viewer: V("bob") });
  const alice = w.i.progress({ project: P, viewer: V("alice") });
  const e2 = bob.short.find((x) => x.entity_id === "ENT-2");
  assert.deepEqual(e2.why.grade_reached, "C");
  assert.deepEqual(e2.why.grade_required, "B");
  assert.deepEqual(e2.why.weakest_link, { from_stage: "need", to_stage: "award", a_grade: "A", b_grade: "C", grade: "C" });
  const e5 = bob.short.find((x) => x.entity_id === "ENT-5");
  assert.deepEqual(e5.why, { stages_missing: ["need"] });
  const docOf = (r) => r.short.find((x) => x.entity_id === "ENT-2").documents.find((d) => d.stage_key === "award").documents[0];
  assert.equal(docOf(bob).bundle_id, null, "bob may not see the bundle");
  assert.equal(docOf(alice).bundle_id, hidden, "an administrator may");
  assert.equal(docOf(bob).capture_sha, docOf(alice).capture_sha);
  for (const k of ["matched", "meeting", "satisfied"]) assert.equal(bob[k], alice[k]);
  assert.deepEqual(bob.short.map((x) => [x.entity_id, x.grade]), alice.short.map((x) => [x.entity_id, x.grade]));
});

test("R6 one gap per short instance: a missing stage names the progression, entity and stage; a short grade names the link to strengthen; each is an objective-gap proposal, offered in the proposals list", async () => {
  const w = await measured();
  const P = w.P;
  assert.deepEqual(w.i.gaps({ project: P, viewer: V("bob") }).gaps, [], "no condition, no gaps");
  assert.equal(w.i.setCondition({ project: P, condition: condOf(25), author: V("bob"), viewer: V("bob") }).ok, true);
  const g = w.i.gaps({ project: P, viewer: V("bob") });
  const pr = w.i.progress({ project: P, viewer: V("bob") });
  assert.equal(g.gaps.length, pr.short.length);
  for (const gap of g.gaps) {
    assert.equal(gap.kind, "objective-gap");
    assert.equal(gap.source, "intent");
    assert.equal(gap.surfaced_by, "machine");
    for (const k of ["key", "grade", "basis", "instances"]) assert.ok(k in gap, k);
    assert.equal(gap.basis.progression, "proc");
    assert.equal(gap.basis.project, P);
  }
  const miss = g.gaps.find((x) => x.basis.entity === "ENT-5");
  assert.deepEqual(miss.basis.stages_missing, ["need"]);
  const weak = g.gaps.find((x) => x.basis.entity === "ENT-2");
  assert.equal(weak.basis.link.to_stage, "award");
  assert.equal(weak.basis.grade_required, "B");
  const offered = w.i.proposals({ project: P, viewer: V("bob") }).proposals.filter((p) => p.kind === "objective-gap");
  assert.deepEqual(offered.map((p) => p.key).sort(), g.gaps.map((p) => p.key).sort());
});

test("R7 watchSet answers what the condition reads: its entity and related entities, its progression, the captures placed in matched instances; empty with no condition", async () => {
  const w = await measured();
  const P = w.P;
  assert.deepEqual(w.i.watchSet({ project: P }), { entities: [], progressions: [], captures: [] });
  assert.equal(w.i.setCondition({ project: P, condition: condOf(25), author: V("bob"), viewer: V("bob") }).ok, true);
  const s = w.i.watchSet({ project: P });
  assert.deepEqual(s.entities, ["ENT-1", "ENT-2", "ENT-4", "ENT-5"]);
  assert.deepEqual(s.progressions, ["proc"]);
  assert.deepEqual(s.captures.sort(), ["ent-1-award", "ent-1-need", "ent-2-award", "ent-2-need", "ent-4-need", "ent-5-award"]);
  assert.ok(!s.captures.some((c) => c.startsWith("ent-3")), "an unmatched instance's captures are not watched");
});
