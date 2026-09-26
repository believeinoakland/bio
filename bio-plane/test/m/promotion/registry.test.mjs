/* promotion's registry and invariants — requirement-named tests (build/requirements/promotion.md R35–R40). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { makePromotion, doc, infoDoc, create, revise, T0 } from "./fixtures.mjs";
import { runCaseGate, runGate } from "../../../src/promotion/index.mjs";
import { PROMOTED_TYPE_CHECKS, ACT_SHAPE_CHECKS, PROJECT_ID_CHECKS, BIAS_CHECKS, projectNameKey, STATES, vocabFor }
  from "../../../checks/bio-checks.mjs";

const ID = "INFO-2026-0001";

test("R39: a later module registers once a check before the write and a projection after it, both in the one transaction, run in the modules' order", () => {
  const { p, record } = makePromotion();
  const seen = [];
  assert.deepEqual(p.registerStep("legacy-store", { check: () => { seen.push("check:legacy-store"); return null; },
                                                     project: (c) => { seen.push("project:legacy-store"); return { extra: c.bundleSha, ok: "ignored" }; } }).ok, true);
  assert.deepEqual(p.registerStep("publication", { check: (c) => { seen.push("check:publication"); assert.equal(record.head(c.bundleId), null); return null; },
                                                    project: (c) => { seen.push("project:publication"); assert.equal(record.head(c.bundleId).bundleSha, c.bundleSha); return null; } }).ok, true);
  assert.equal(p.registerStep("publication", { check: () => null }).reason, "STEP_DECLARED");
  const r = p.promote(create(ID, infoDoc(ID)));
  assert.equal(r.ok, true);
  assert.equal(r.extra, r.bundleSha);
  assert.equal(seen.length, 4);
  assert.deepEqual(seen.filter((s) => s.startsWith("check")).length, 2);
  /* A registered check's refusal refuses the whole promotion with its own reason, writing nothing. */
  const q = makePromotion();
  q.p.registerStep("x", { check: () => ({ ok: false, reason: "X_REFUSES" }) });
  assert.equal(q.p.promote(create(ID, infoDoc(ID))).reason, "X_REFUSES");
  assert.equal(q.record.dump().includes(ID), false);
});

test("R39: steps run in the modules' total order given at creation", async () => {
  const { makeRecord, makeMembership } = await import("./fixtures.mjs");
  const { promotionOf } = await import("../../../src/promotion/index.mjs");
  const p = promotionOf({}, { record: makeRecord(), membership: makeMembership(), order: ["a", "b", "legacy-store"] });
  p.registerFact("producingGroup", "legacy-store", () => "g");
  const seen = [];
  for (const m of ["legacy-store", "b", "a"]) p.registerStep(m, { check: () => { seen.push(m); return null; } });
  assert.equal(p.promote(create(ID, infoDoc(ID, { group: "g" }))).ok, true);
  assert.deepEqual(seen, ["a", "b", "legacy-store"]);
});

test("R40: a fact with no registered provider refuses the act that needs it with FACT_UNAVAILABLE; a fact registered twice is STEP_DECLARED", () => {
  const bare = makePromotion({ facts: false });
  const r = bare.p.promote(create(ID, infoDoc(ID)));
  assert.deepEqual([r.reason, r.fact], ["FACT_UNAVAILABLE", "producingGroup"]);
  bare.p.registerFact("producingGroup", "legacy-store", () => "test-group");
  const a = bare.p.promote(create(ID, infoDoc(ID, { current_state: "verified" })));
  assert.equal(a.ok, true);
  const c = bare.p.promote(revise(ID, a.bundleSha, infoDoc(ID, { current_state: "retired" })));
  assert.deepEqual([c.reason, c.fact], ["FACT_UNAVAILABLE", "citedBy"]);
  assert.equal(bare.p.registerFact("producingGroup", "legacy-store", () => "x").reason, "STEP_DECLARED");
  assert.equal(bare.p.registerFact("producingGroup", "other", () => "x").reason, "STEP_DECLARED");
  const reopen = makePromotion({ facts: false });
  reopen.p.registerFact("producingGroup", "legacy-store", () => "test-group");
  const inq = doc({ id: "INQ-2026-0001", object_type: "inquiry", title: "Q", current_state: "concluded", created: T0, last_updated: T0 });
  assert.equal(reopen.p.promote({ ...create("INQ-2026-0001", inq), replay: true }).ok, true);
  const x = reopen.p.reopen({ target: "INQ-2026-0001", reason: "why", viewer: "member:a", author: "member:a" });
  assert.deepEqual([x.reason, x.fact], ["FACT_UNAVAILABLE", "caseMember"]);
});

test("R35: promote, reopen and runCaseGate make no network call; runGate's one outside question is hasCapture; times are the clock's or the document's", async () => {
  const fetch0 = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = () => { calls++; throw new Error("no network"); };
  try {
    const env = makePromotion({ now: () => "2026-09-26T12:34:56.789Z" });
    const a = env.p.promote(create(ID, infoDoc(ID)));
    assert.equal(env.record.manifestEntry(ID, "k1").created, T0);
    const inq = doc({ id: "INQ-2026-0001", object_type: "inquiry", title: "Q", current_state: "deferred", created: T0, last_updated: T0, state_history: "[]" });
    env.p.promote({ ...create("INQ-2026-0001", inq), replay: true });
    const r = env.p.reopen({ target: "INQ-2026-0001", reason: "why", viewer: "member:a", author: "member:a" });
    assert.equal(r.at, "2026-09-26T12:34:56Z");
    runCaseGate({ caseId: "CASE-2026-0001", edition: 1, fm: {}, priorCase: null });
    let probes = 0;
    await runGate({ bundleId: ID, image: { "bundle.md": infoDoc(ID) }, knownIds: new Set(), registers: [{ path: "p", capture_sha: "e".repeat(64) }],
                    hasCapture: async () => { probes++; return { present: true }; } });
    assert.equal(probes, 1);
    assert.equal(a.ok, true);
  } finally { globalThis.fetch = fetch0; }
  assert.equal(calls, 0);
});

test("R36: no place is named: a group elsewhere promotes, reopens and is refused in words that name no jurisdiction", () => {
  const env = makePromotion({ group: "lakeshore-tenants" });
  const answers = [];
  const a = env.p.promote(create(ID, infoDoc(ID, { group: "lakeshore-tenants" })));
  answers.push(a, env.p.promote(revise(ID, "0".repeat(64), infoDoc(ID))), env.p.promote({}),
               env.p.promote(create("INFO-2026-0002", infoDoc("INFO-2026-0002"), { meta: { object_type: "bias" } })));
  assert.equal(a.ok, true);
  assert.equal(env.record.head(ID).groupId, "lakeshore-tenants");
  for (const x of answers) assert.doesNotMatch(JSON.stringify(x), /oakland|alameda|california/i);
});

test("R37: every no names which kind of no, and an undetermined fact is never rounded to a refusal or a pass", () => {
  const env = makePromotion({ facts: false });
  const got = [env.p.promote(null), env.p.promote({}), env.p.promote(create(ID, infoDoc(ID))),
               env.p.reopen({}), env.p.reopen({ author: "member:a" }), env.p.reopen({ author: "member:a", reason: "r" })];
  for (const r of got) { assert.equal(r.ok, false); assert.match(r.reason, /^[A-Z_]+$/); }
  assert.equal(got[2].reason, "FACT_UNAVAILABLE");
});

test("R38: a rule held at the door and in the catalogue is the catalogue's one function or row, never a second copy", () => {
  const env = makePromotion();
  /* Name uniqueness is the catalogue's projectNameKey. */
  const names = ["Sewer Fund", "sewer  fund", " SEWER FUND ", "Sewer-Fund", "Sewer Funds"];
  const pd = (t) => doc({ object_type: "project", title: t, current_state: "forming", created: T0, last_updated: T0 });
  const first = env.p.promote({ base: null, snapKey: "a", author: "member:a", files: [{ path: "bundle.md", text: pd(names[0]) }], meta: {} });
  assert.equal(first.ok, true);
  for (const n of names.slice(1)) {
    const r = env.p.promote({ base: null, snapKey: n, author: "member:a", files: [{ path: "bundle.md", text: pd(n) }], meta: {} });
    assert.equal(r.reason === "NAME_TAKEN", projectNameKey(n) === projectNameKey(names[0]), n);
  }
  /* Each door refusal with a catalogue row carries that row's check id. */
  const { p, record } = makePromotion();
  const h = p.promote(create(ID, infoDoc(ID)));
  assert.equal(p.promote(revise(ID, "1".repeat(64), infoDoc(ID))).check, ACT_SHAPE_CHECKS.CAS_STALE.check);
  assert.equal(p.promote(create("INFO-2026-0002", infoDoc("INFO-2026-0002"), { meta: { object_type: "action" } })).check,
               PROMOTED_TYPE_CHECKS.ENVELOPE_TYPE_DISAGREES.check);
  assert.equal(p.promote({ bundleId: "PROJ-2026-0001-x", base: null, snapKey: "s", files: [{ path: "bundle.md", text: pd("x") }], meta: {} }).check,
               PROJECT_ID_CHECKS.PROJECT_ID_SUPPLIED.check);
  /* The state machine is the catalogue's table: bias refusals carry its row. */
  const b = "BIAS-2026-0001";
  const bd = (s) => doc({ id: b, object_type: "bias", title: "Lens", current_state: s, created: T0, last_updated: T0 });
  const bb = p.promote({ ...create(b, bd("adopted")), replay: true });
  const back = p.promote(revise(b, bb.bundleSha, bd("proposed")));
  assert.equal(back.check, BIAS_CHECKS.BIAS_ILLEGAL_TRANSITION.check);
  assert.deepEqual(back.legal_from, vocabFor(STATES, "bias").edges.adopted);
  void h; void record;
});
