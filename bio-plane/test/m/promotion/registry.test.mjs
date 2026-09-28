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

/* The modules' total order, as `build/modules.json` states it: its ids by layer, then by their place in the file. */
const modulesOrder = async () => {
  const { readFile } = await import("node:fs/promises");
  const { modules } = JSON.parse(await readFile(new URL("../../../../build/modules.json", import.meta.url), "utf8"));
  return modules.map((m, i) => [m.layer, i, m.id]).sort((a, b) => (a[0] - b[0]) || (a[1] - b[1])).map((x) => x[2]);
};

test("R39: two steps registered in reverse order still run in the modules' order when none is given (connections writes refs before inquiry reads them)", () => {
  const { p } = makePromotion();
  const seen = [];
  for (const m of ["inquiry", "connections"])
    p.registerStep(m, { check: () => { seen.push(`check:${m}`); return null; }, project: () => { seen.push(`project:${m}`); return null; } });
  assert.equal(p.promote(create(ID, infoDoc(ID))).ok, true);
  assert.deepEqual(seen, ["check:connections", "check:inquiry", "project:connections", "project:inquiry"]);
});

test("R39, R45, R46: with no order given, every module's steps and listeners run in the modules' total order, the layer order of build/modules.json; an unknown module runs last", async () => {
  const order = await modulesOrder();
  const { p, record } = makePromotion();
  const checks = [], projections = [], committed = [], reopened = [];
  /* Registered in the reverse of the order, an unknown module first. */
  for (const m of ["not-a-module", ...[...order].reverse()]) {
    assert.equal(p.registerStep(m, { check: () => { checks.push(m); return null; },
                                     project: () => { projections.push(m); return null; } }).ok, true);
    assert.equal(p.onCommitted(m, () => { committed.push(m); }).ok, true);
    assert.equal(p.onReopened(m, () => { reopened.push(m); return null; }).ok, true);
  }
  const want = [...order, "not-a-module"];
  const inq = "INQ-2026-0001";
  const r = p.promote({ ...create(inq, doc({ id: inq, object_type: "inquiry", title: "Q", current_state: "deferred",
    created: T0, last_updated: T0, group: "test-group", state_history: "[]" })), replay: true });
  assert.equal(r.ok, true, JSON.stringify(r));
  await new Promise((res) => setTimeout(res, 0));
  assert.deepEqual(checks, want);
  assert.deepEqual(projections, want);
  assert.deepEqual(committed, want);
  assert.equal(p.reopen({ target: inq, reason: "why", viewer: "member:a", author: "member:a" }).ok, true);
  assert.deepEqual(reopened, want);
  assert.equal(record.head(inq).currentState, "open");
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

test("R40: fact(name, ...args) reads a registered fact for a later module; unprovided it is FACT_UNAVAILABLE, never a value; a throwing provider is FACT_FAILED", () => {
  const { p } = makePromotion({ caseMember: new Set(["INQ-2026-0001"]) });
  assert.deepEqual(p.fact("caseMember", "INQ-2026-0001"), { ok: true, fact: "caseMember", value: true });
  /* A false value is a value, and is told apart from an unprovided fact. */
  assert.deepEqual(p.fact("caseMember", "INQ-2026-0002"), { ok: true, fact: "caseMember", value: false });
  assert.deepEqual(p.fact("citedBy", ID), { ok: true, fact: "citedBy", value: [] });
  for (const name of ["nobodyProvides", "", null, undefined, 7]) {
    const r = p.fact(name);
    assert.equal(r.ok, false);
    assert.equal(r.reason, "FACT_UNAVAILABLE");
    assert.equal("value" in r, false);
    assert.equal(r.fact, typeof name === "string" ? name : null);
  }
  p.registerFact("fragile", "legacy-store", () => { throw new Error("down"); });
  const f = p.fact("fragile");
  assert.deepEqual([f.ok, f.reason, f.fact, "value" in f], [false, "FACT_FAILED", "fragile", false]);
  assert.match(f.detail, /down/);
  /* The arguments reach the provider as given. */
  p.registerFact("echo", "later", (...a) => a);
  assert.deepEqual(p.fact("echo", 1, "two", null).value, [1, "two", null]);
});

const tick = () => new Promise((r) => setTimeout(r, 0));

test("R45: onCommitted — after an accepted promotion commits, every listener is called once, in the modules' total order, with {bundleId, bundleSha, type, replay}; a second registration is LISTENER_DECLARED", async () => {
  const { makeRecord, makeMembership } = await import("./fixtures.mjs");
  const { promotionOf } = await import("../../../src/promotion/index.mjs");
  const record = makeRecord();
  const p = promotionOf({}, { record, membership: makeMembership(), order: ["scheduler", "legacy-store"] });
  p.registerFact("producingGroup", "legacy-store", () => "g");
  const seen = [];
  for (const m of ["legacy-store", "scheduler"])
    assert.equal(p.onCommitted(m, (n) => { seen.push([m, n, record.head(n.bundleId)?.bundleSha]); }).ok, true);
  assert.equal(p.onCommitted("scheduler", () => {}).reason, "LISTENER_DECLARED");
  assert.equal(p.onCommitted("", () => {}).ok, false);
  const a = p.promote(create(ID, infoDoc(ID, { group: "g" })));
  assert.equal(a.ok, true);
  assert.deepEqual(seen, [], "never inside the promotion's own call");
  await tick();
  const n = { bundleId: ID, bundleSha: a.bundleSha, type: "information", replay: false };
  assert.deepEqual(seen, [["scheduler", n, a.bundleSha], ["legacy-store", n, a.bundleSha]]);
  const b = p.promote({ ...revise(ID, a.bundleSha, infoDoc(ID, { group: "g", title: "Again" })), replay: true });
  await tick();
  assert.deepEqual(seen.slice(2).map(([m, x]) => [m, x]), [["scheduler", { bundleId: ID, bundleSha: b.bundleSha, type: "information", replay: true }],
                                                          ["legacy-store", { bundleId: ID, bundleSha: b.bundleSha, type: "information", replay: true }]]);
  /* Never for a refused promotion, nor for one answered wrote: false. */
  const before = seen.length;
  assert.equal(p.promote(revise(ID, "0".repeat(64), infoDoc(ID, { group: "g" }), { snapKey: "k3" })).reason, "CAS_STALE");
  const again = p.promote({ ...revise(ID, a.bundleSha, infoDoc(ID, { group: "g", title: "Again" })), replay: true });
  assert.deepEqual([again.ok, again.wrote], [true, false]);
  const stepRefused = makePromotion();
  let called = 0;
  stepRefused.p.onCommitted("x", () => { called++; });
  stepRefused.p.registerStep("later", { project: () => ({ ok: false, reason: "LATER_SAYS_NO" }) });
  assert.equal(stepRefused.p.promote(create(ID, infoDoc(ID))).reason, "LATER_SAYS_NO");
  await tick();
  assert.equal(seen.length, before);
  assert.equal(called, 0);
});

test("R45: inside a caller's transaction the notice waits for that transaction's commit, and a promotion rolled back with it is never announced", async () => {
  const { p, record } = makePromotion();
  const got = [];
  p.onCommitted("later", (n) => { got.push([n.bundleId, record.head(n.bundleId)?.bundleSha ?? null]); });
  /* The caller's transaction commits: the notice comes after, and the record then holds what it names. */
  let inner;
  const outer = record.transact(() => {
    inner = p.promote(create(ID, infoDoc(ID)));
    record.db.prepare("INSERT INTO side VALUES ('caller','v')").run();
    return { ok: true };
  });
  assert.deepEqual([outer.ok, inner.ok], [true, true]);
  assert.deepEqual(got, []);
  await tick();
  assert.deepEqual(got, [[ID, inner.bundleSha]]);
  /* The caller's transaction rolls back after promote answered ok: nothing is announced. */
  const other = "INFO-2026-0002";
  const rolled = record.transact(() => {
    const r = p.promote(create(other, infoDoc(other)));
    assert.equal(r.ok, true);
    return { ok: false, reason: "CALLER_CHANGED_ITS_MIND" };
  });
  assert.equal(rolled.reason, "CALLER_CHANGED_ITS_MIND");
  assert.equal(record.head(other), null);
  await tick();
  assert.deepEqual(got, [[ID, inner.bundleSha]]);
  /* Several promotions in one caller's transaction: one notice each, in commit order. */
  const ids = ["INFO-2026-0003", "INFO-2026-0004"];
  record.transact(() => { for (const id of ids) p.promote(create(id, infoDoc(id))); return { ok: true }; });
  await tick();
  assert.deepEqual(got.slice(1).map(([id]) => id), ids);
});

test("R45: a listener runs outside the transaction and writes no row of the promotion; one that throws or rejects changes neither the answer, what was written, nor another listener's notice", async () => {
  const { p, record } = makePromotion();
  const order = [];
  p.onCommitted("a-throws", () => { order.push("a"); throw new Error("boom"); });
  p.onCommitted("b-rejects", async () => { order.push("b"); throw new Error("later boom"); });
  p.onCommitted("c-writes", (n) => {
    order.push("c");
    /* Outside the promotion's transaction: a write here is its own, and a refusal of it touches nothing promoted. */
    const r = record.transact(() => { record.db.prepare("INSERT INTO side VALUES ('listener', ?)").run(n.bundleId); return { ok: false, reason: "NO" }; });
    assert.equal(r.reason, "NO");
  });
  const a = p.promote(create(ID, infoDoc(ID)));
  const answer = JSON.stringify(a), after = record.dump();
  await tick(); await tick();
  assert.deepEqual(order, ["a", "b", "c"]);
  assert.equal(JSON.stringify(a), answer);
  assert.equal(record.dump(), after);
  assert.equal(record.head(ID).bundleSha, a.bundleSha);
  /* The acts that promote through promote are announced too: reopen and fork. */
  const inq = "INQ-2026-0001";
  const seen = [];
  p.onCommitted("d-counts", (n) => seen.push(n.bundleId));
  const d = p.promote({ ...create(inq, doc({ id: inq, object_type: "inquiry", title: "Q", current_state: "deferred", created: T0,
    last_updated: T0, state_history: "[]" })), replay: true });
  assert.equal(d.ok, true);
  assert.equal(p.reopen({ target: inq, reason: "why", viewer: "member:a", author: "member:a" }).ok, true);
  await tick();
  assert.deepEqual(seen, [inq, inq]);
});

test("R47: registerCaseCatalogue — a later module registers the case-document catalogue once; any second registration is STEP_DECLARED; a fn that is not a function (or no module) is LISTENER_MALFORMED; R33 then runs it, with no change of shape or GATE_VERSION", async () => {
  const { checkCaseDocument } = await import("../../../checks/bio-checks.mjs");
  const { GATE_VERSION } = await import("../../../src/promotion/index.mjs");
  const { p } = makePromotion();
  const ctx = { caseId: "CASE-2026-0001", edition: 2, fm: { schema: "bio-case-document/4", case_id: "CASE-2026-0001" },
                priorCase: { assertions: [] }, body: "the body", memberBasis: { "INQ-2026-0001": [] } };
  /* Before any registration, the catalogue's own checkCaseDocument (R33), answered as the free gate answers. */
  assert.deepEqual(p.runCaseGate(ctx), runCaseGate(ctx));
  for (const [m, fn] of [["ratification", "not a function"], ["ratification", null], ["", () => []], [null, () => []]]) {
    const r = p.registerCaseCatalogue(m, fn);
    assert.deepEqual([r.ok, r.reason], [false, "LISTENER_MALFORMED"]);
  }
  assert.deepEqual(p.runCaseGate(ctx), runCaseGate(ctx), "a malformed registration registers nothing");
  const calls = [];
  const fn = (fm, c) => { calls.push([fm, c]); return [{ check: "C-41.1", severity: "error", message: "no", repairs: ["fix"] },
                                                       { check: "C-41.2", severity: "warn", message: "hm" }]; };
  assert.deepEqual(p.registerCaseCatalogue("ratification", fn), { ok: true, module: "ratification" });
  for (const m of ["ratification", "publication"]) {
    const r = p.registerCaseCatalogue(m, () => []);
    assert.deepEqual([r.ok, r.reason, r.module], [false, "STEP_DECLARED", "ratification"]);
  }
  const got = p.runCaseGate(ctx);
  assert.deepEqual(got, { gateVersion: GATE_VERSION, ok: false, findings: [{ check: "C-41.1", detail: "no", repairs: ["fix"] }], warnings: 1 });
  /* The registered catalogue is asked with the facts the document cannot carry about itself, as R33 lists them. */
  assert.deepEqual(calls, [[ctx.fm, { caseId: ctx.caseId, edition: ctx.edition, priorCase: ctx.priorCase, body: ctx.body,
                                     memberBasis: ctx.memberBasis }]]);
  /* The free gate and another host's promotion still run checkCaseDocument: a registration is its host's. */
  const want = checkCaseDocument(ctx.fm, { caseId: ctx.caseId, edition: ctx.edition, priorCase: ctx.priorCase, body: ctx.body,
                                           memberBasis: ctx.memberBasis }).filter((f) => f.severity === "error").map((f) => f.check);
  assert.deepEqual(runCaseGate(ctx).findings.map((f) => f.check), want);
  const other = makePromotion();
  assert.deepEqual(other.p.runCaseGate(ctx).findings.map((f) => f.check), want);
  assert.equal(other.p.registerCaseCatalogue("ratification", () => []).ok, true);
  assert.deepEqual(other.p.runCaseGate(ctx), { gateVersion: GATE_VERSION, ok: true, findings: [], warnings: 0 });
});

test("R33: the case gate never throws: a registered catalogue that throws or answers no list of findings fails closed (ok false), never passes", () => {
  for (const bad of [() => { throw new Error("broken"); }, () => null, () => "fine", () => [null], () => ({ findings: [] })]) {
    const { p } = makePromotion();
    assert.equal(p.registerCaseCatalogue("ratification", bad).ok, true);
    for (const args of [{ caseId: "CASE-2026-0001", edition: 1, fm: {}, priorCase: null }, {}, undefined, null]) {
      const r = p.runCaseGate(args);
      assert.equal(r.ok, false);
      assert.deepEqual(r.findings.map((f) => f.check), ["CASE_CATALOGUE_FAILED"]);
      assert.equal(typeof r.findings[0].detail, "string");
    }
  }
});

test("R39, R40, R47: STEP_DECLARED is one answer at every registration that already holds what it registers (a step, a fact, the case catalogue), and the malformed registrations carry their rows (C-102.6, C-102.7)", async () => {
  const { REGISTRATION_CHECKS } = await import("../../../checks/bio-checks.mjs");
  const { p } = makePromotion();
  p.registerStep("later", {});
  p.registerCaseCatalogue("ratification", () => []);
  const twice = [p.registerStep("later", {}), p.registerFact("citedBy", "later", () => []),
                 p.registerCaseCatalogue("later", () => [])];
  for (const r of twice) {
    assert.deepEqual([r.ok, r.reason], [false, "STEP_DECLARED"]);
    assert.equal(typeof r.detail, "string");
    assert.equal(typeof r.module, "string", "it names the module that holds the registration");
  }
  assert.equal(twice[1].fact, "citedBy");
  assert.equal(twice[1].module, "legacy-store");
  for (const [r, code] of [[p.registerFact("", "m", () => 1), "FACT_MALFORMED"], [p.registerFact("f", "", () => 1), "FACT_MALFORMED"],
                           [p.registerFact("f", "m", 1), "FACT_MALFORMED"], [p.registerStep("", {}), "STEP_MODULE_UNNAMED"],
                           [p.registerStep(undefined), "STEP_MODULE_UNNAMED"]]) {
    assert.deepEqual([r.ok, r.reason, r.check, r.translation], [false, code, REGISTRATION_CHECKS[code].check, REGISTRATION_CHECKS[code].translation]);
  }
  /* Nothing a refused registration named was registered. */
  assert.equal(p.fact("f").reason, "FACT_UNAVAILABLE");
});
