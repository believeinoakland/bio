/* run-rules T41-21 (N820; K2405, K2418): R19 as amended (the test bar), R23 (RUN_ORIGINS), R24 (the mode `enquire`),
   R25 (the new draft kinds) and R26 (the `pages` bound and the "no AI" read). Each refusal has its negative control. */
import test from "node:test";
import assert from "node:assert/strict";
import { TEST_BAR_PARTS, TEST_BAR_RECORD, checkTestBarRecord, testBarHeld, testBarHeldOn, partDeployable, partDeployableOn,
         CIVICSMITH_TEST_SET, TEST_MATTER_SHAPE, DEPLOYMENT_SEQUENCE, RUN_MODES, DEPLOYED_MODES, deployedModesFor,
         deployable, ASK_MODE, DRAFT_MODE, ENQUIRE_MODE, DRAFT_KINDS, DRAFT_REACH, draftMayRead, startAllowed,
         checkAskBounds, ASK_BOUNDS, RUN_ORIGINS, originAllowed, RUN_BOUNDS, PLANE_COUNTED_BOUNDS, checkConsume,
         checkBound, runStatusFor, finishedBound, checkPagesRead, AI_RUN_CHECKS, translationOf } from "../../../src/run-rules/index.mjs";
import { refusal } from "./helpers.mjs";

const SET = Object.freeze({ id: "civicsmith-fixture", version: 3, matters: [{ id: "M1" }] });
const bar = (part, extra = {}) => ({ part, set: SET.id, set_version: SET.version, false_alarm_rate: 0.1, passed: true,
                                     graded_by: "harness", at: "2026-10-09T00:00:00Z", ...extra });
const ver = (mode) => ({ mode, run: `RUN-${mode}`, verified_by: "member:ann", at: "t", evidence: "op=audit clean" });

test("R19 (T41): TEST_BAR_PARTS names every AI part — each mode, the explorer's use, each draft kind, transcription and reading — and TEST_BAR_RECORD is ai-runs R75's shape; checkTestBarRecord refuses each unfit field (AI_TEST_BAR_UNFIT, C-22.22, naming it); never throws", () => {
  assert.ok(Object.isFrozen(TEST_BAR_PARTS));
  assert.deepEqual([...TEST_BAR_PARTS], ["check", "investigate", "extract", "plan", "ask", "enquire", "explore",
    ...DRAFT_KINDS.map((k) => `draft:${k}`), "transcribe", "read"]);
  for (const m of [...RUN_MODES, ASK_MODE.mode, ENQUIRE_MODE.mode]) assert.ok(TEST_BAR_PARTS.includes(m), `mode ${m}`);
  for (const k of DRAFT_KINDS) assert.ok(TEST_BAR_PARTS.includes(`draft:${k}`), `draft kind ${k}`);
  assert.deepEqual([...TEST_BAR_RECORD.fields], ["part", "set", "set_version", "false_alarm_rate", "passed", "graded_by", "at"]);
  assert.deepEqual(Object.keys(TEST_BAR_RECORD.means), [...TEST_BAR_RECORD.fields]);
  assert.ok(Object.isFrozen(TEST_BAR_RECORD) && Object.isFrozen(TEST_BAR_RECORD.fields));
  /* controls: every part, a failed result, the rate's ends, a machine grader (the harness writes R75's records) */
  for (const p of TEST_BAR_PARTS) assert.equal(checkTestBarRecord(bar(p)), null, p);
  for (const extra of [{ passed: false }, { false_alarm_rate: 0 }, { false_alarm_rate: 1 }, { graded_by: "class:daemon" }])
    assert.equal(checkTestBarRecord(bar("check", extra)), null, JSON.stringify(extra));
  for (const v of [null, undefined, 3, "check", [], [bar("check")]])
    assert.equal(refusal(checkTestBarRecord(v), "AI_TEST_BAR_UNFIT").field, null);
  const cases = [
    ["part", [undefined, null, "", "draft", "Check", "draft:", "draft:prose", "explorer", 3]],
    ["set", [undefined, null, "", "  ", 3]],
    ["set_version", [undefined, null, 0, -1, 1.5, "3", NaN]],
    ["false_alarm_rate", [undefined, null, -0.01, 1.01, "0.1", NaN, Infinity]],
    ["passed", [undefined, null, "true", 1, 0]],
    ["graded_by", [undefined, null, "", " "]],
    ["at", [undefined, null, "", " ", 3]],
  ];
  for (const [field, values] of cases) for (const v of values) {
    const r = refusal(checkTestBarRecord(bar("check", { [field]: v })), "AI_TEST_BAR_UNFIT");
    assert.deepEqual([r.check, r.field], ["C-22.22", field], `${field} = ${JSON.stringify(v)}`);
    assert.match(r.detail, /Nothing was recorded$/);
  }
});

test("R19 (T41): Civicsmith's set is frozen data held here, versioned; the bar is held for a part only on a well-formed passed record on that set at its current version, never on another set (a group's) or an earlier version, and never while the set holds no matter", () => {
  assert.ok(Object.isFrozen(CIVICSMITH_TEST_SET) && Object.isFrozen(CIVICSMITH_TEST_SET.matters));
  assert.equal(CIVICSMITH_TEST_SET.id, "civicsmith");
  assert.ok(Number.isSafeInteger(CIVICSMITH_TEST_SET.version) && CIVICSMITH_TEST_SET.version >= 1);
  assert.ok(Object.isFrozen(TEST_MATTER_SHAPE));
  assert.match(TEST_MATTER_SHAPE.answered_by, /never a machine/);
  /* on a set with a matter: held exactly for a passed, well-formed record of its id and current version */
  for (const p of TEST_BAR_PARTS) {
    assert.equal(testBarHeldOn(SET, p, [bar(p)]), true, p);
    assert.equal(testBarHeldOn(SET, p, []), false, `${p}: no record`);
  }
  for (const extra of [{ passed: false }, { set: "group:oak" }, { set_version: SET.version - 1 }, { set_version: SET.version + 1 },
                       { false_alarm_rate: 2 }, { part: "investigate" }])
    assert.equal(testBarHeldOn(SET, "check", [bar("check", extra)]), false, JSON.stringify(extra));
  assert.equal(testBarHeldOn(SET, "check", [null, 3, bar("check", { passed: false }), bar("check")]), true, "one good record among junk");
  for (const p of ["", "draft", null, "nope"]) assert.equal(testBarHeldOn(SET, p, [bar("check")]), false, String(p));
  /* a new version re-asks the bar: the same record no longer holds it */
  assert.equal(testBarHeldOn({ ...SET, version: SET.version + 1 }, "check", [bar("check")]), false);
  /* an empty or malformed set holds no bar */
  for (const s of [{ ...SET, matters: [] }, { ...SET, matters: null }, { ...SET, id: "" }, null, 3])
    assert.equal(testBarHeldOn(s, "check", [bar("check", { set: s?.id ?? SET.id })]), false, JSON.stringify(s));
  /* Civicsmith's own set: held only for its id and version; while it holds no matter, for no part */
  const own = (p) => bar(p, { set: CIVICSMITH_TEST_SET.id, set_version: CIVICSMITH_TEST_SET.version });
  for (const p of TEST_BAR_PARTS)
    assert.equal(testBarHeld(p, [own(p)]), CIVICSMITH_TEST_SET.matters.length > 0, p);
  assert.equal(testBarHeld("check", [bar("check")]), false, "another set's record never opens the gate");
});

test("R19 (T41): the deploy gate reads the test bar besides the chain — partDeployable answers true only when the bar is held and, for a mode of the order, the chain too (investigate only after check's verification); a part outside the order needs the bar alone; deployable(mode, verifications) stays the chain", () => {
  const held = (parts, verified = []) => ({ testBars: parts.map((p) => bar(p)), verifications: verified.map(ver) });
  /* the bar alone does not deploy a chain mode beyond the first */
  assert.equal(partDeployableOn(SET, "check", held(["check"])), true);
  assert.equal(partDeployableOn(SET, "investigate", held(["investigate"])), false, "no verification of check");
  assert.equal(partDeployableOn(SET, "investigate", held(["investigate"], ["check"])), true);
  /* the chain alone does not deploy: no bar, no deploy, whatever the verifications */
  for (const m of DEPLOYMENT_SEQUENCE.order)
    assert.equal(partDeployableOn(SET, m, held([], ["check", "investigate", "extract"])), false, m);
  assert.equal(partDeployableOn(SET, "check", held(["investigate"])), false, "another part's bar is not this one's");
  /* parts outside the order: the bar alone */
  for (const p of TEST_BAR_PARTS.filter((x) => !DEPLOYMENT_SEQUENCE.order.includes(x))) {
    assert.equal(partDeployableOn(SET, p, held([p])), true, p);
    assert.equal(partDeployableOn(SET, p, held([])), false, p);
  }
  assert.equal(partDeployableOn(SET, "draft", held(["draft:own_words"])), false, "the mode draft is measured per kind");
  for (const x of [null, undefined, 3]) assert.equal(partDeployableOn(SET, "check", x), false, String(x));
  /* the gate on Civicsmith's set: nothing deploys while it holds no matter */
  if (CIVICSMITH_TEST_SET.matters.length === 0)
    for (const p of TEST_BAR_PARTS)
      assert.equal(partDeployable(p, { testBars: [bar(p, { set: "civicsmith", set_version: CIVICSMITH_TEST_SET.version })],
                                       verifications: ["check", "investigate", "extract"].map(ver) }), false, p);
  /* control: deployable keeps its chain-only answer, which ai-runs reads until it re-points */
  assert.equal(deployable("check", []), true);
  assert.equal(deployable("investigate", [ver("check")]), true);
});

test("R23: RUN_ORIGINS is [member, explore], frozen; a member-origin run is admitted, an explore-origin run only while investigate is deployable (R19), else AI_RUN_EXPLORE_NOT_DEPLOYABLE (C-22.27); any other or absent origin AI_RUN_ORIGIN_UNKNOWN (C-22.25); never throws", () => {
  assert.ok(Object.isFrozen(RUN_ORIGINS));
  assert.deepEqual([...RUN_ORIGINS], ["member", "explore"]);
  assert.deepEqual(originAllowed({ origin: "member" }), { ok: true });
  assert.deepEqual(originAllowed({ origin: "member", investigateDeployable: false }), { ok: true });
  assert.deepEqual(originAllowed({ origin: "explore", investigateDeployable: true }), { ok: true });
  for (const d of [false, undefined, null, "true", 1, {}]) {
    const r = refusal(originAllowed({ origin: "explore", investigateDeployable: d }), "AI_RUN_EXPLORE_NOT_DEPLOYABLE");
    assert.deepEqual([r.check, r.origin], ["C-22.27", "explore"]);
    assert.match(r.detail, /^an exploring run opens only while investigating is switched on/);
  }
  for (const o of [undefined, null, "", "Member", "explorer", "system", "scheduler", 3, ["member"]]) {
    const r = refusal(originAllowed({ origin: o, investigateDeployable: true }), "AI_RUN_ORIGIN_UNKNOWN");
    assert.equal(r.check, "C-22.25");
    assert.match(r.detail, /is not where a run comes from/);
  }
  for (const x of [null, undefined, 3, "member"]) refusal(originAllowed(x), "AI_RUN_ORIGIN_UNKNOWN");
  /* control: the flag the gate reads is R19's own answer, so it is false on Civicsmith's set while it is empty */
  if (CIVICSMITH_TEST_SET.matters.length === 0)
    refusal(originAllowed({ origin: "explore", investigateDeployable: partDeployable("investigate", {}) }), "AI_RUN_EXPLORE_NOT_DEPLOYABLE");
});

test("B3, B4 (K2482, K2485; ai-runs R73, R75): the rows of ai-runs' T41 acts are held here and read by key — AI_GROUP_TEST_INVALID C-22.24 (groupTestSet), AI_RUN_EXPLORE_NEEDS_STEP C-22.26 and AI_RUN_STEP_UNKNOWN C-22.28 (an exploring run's step), each minted by ai-runs, with a plain-words translation", () => {
  const rows = { AI_GROUP_TEST_INVALID: ["C-22.24", /groupTestSet/], AI_RUN_EXPLORE_NEEDS_STEP: ["C-22.26", /open/],
                 AI_RUN_STEP_UNKNOWN: ["C-22.28", /open/] };
  for (const [code, [n, site]] of Object.entries(rows)) {
    const row = AI_RUN_CHECKS[code];
    assert.ok(row, code);
    assert.equal(row.check, n, code);
    assert.match(row.where, /^src\/ai-runs\/index\.mjs /, `${code} is minted by ai-runs`);
    assert.match(row.where, site, code);
    assert.equal(translationOf(code), row.translation, code);
    assert.ok(row.translation.length >= 40, code);
    assert.doesNotMatch(row.translation, /\b[A-Z][A-Z_]{3,}\b/, `${code}: plain words`);
  }
  assert.match(AI_RUN_CHECKS.AI_GROUP_TEST_INVALID.translation, /never switch a part on or off/, "a group's set opens no gate");
  assert.match(AI_RUN_CHECKS.AI_RUN_STEP_UNKNOWN.translation, /cannot see is answered exactly as something that does not exist/);
  /* beside the test bar's own row, which ai-runs also answers through checkTestBarRecord */
  assert.equal(AI_RUN_CHECKS.AI_TEST_BAR_UNFIT.check, "C-22.22");
  /* control: no code of a later module sneaks in under C-22 */
  const c22 = Object.values(AI_RUN_CHECKS).map((r) => r.check).filter((c) => /^C-22\.2\d$/.test(c)).sort();
  assert.deepEqual(c22, ["C-22.20", "C-22.21", "C-22.22", "C-22.23", "C-22.24", "C-22.25", "C-22.26", "C-22.27", "C-22.28"]);
});

test("R24: ENQUIRE_MODE describes the mode enquire, frozen — interactive, no run, read-only within ASK_SCOPE, bounded by ASK_BOUNDS, writing nothing itself; deployed apart by its own flag (false today), set once R19's test bar is held for it; startAllowed admits it only at a member's act", () => {
  assert.ok(Object.isFrozen(ENQUIRE_MODE));
  assert.equal(ENQUIRE_MODE.mode, "enquire");
  assert.deepEqual([ENQUIRE_MODE.interactive, ENQUIRE_MODE.writes_run_row, ENQUIRE_MODE.read_only, ENQUIRE_MODE.deploys_apart, ENQUIRE_MODE.deployed],
                   [true, false, true, true, false]);
  assert.equal(ENQUIRE_MODE.reach, "within answers' ASK_SCOPE (its R1); no write op of any module");
  assert.match(ENQUIRE_MODE.writes, /^nothing: its proposals are stored by investigation R12, R20 and steps R24/);
  assert.match(ENQUIRE_MODE.bounds, /^ASK_BOUNDS \(R17\)/);
  assert.match(ENQUIRE_MODE.when, /once R19's test bar is held for it/);
  assert.equal(checkAskBounds(Object.fromEntries(Object.entries(ASK_BOUNDS).map(([k, b]) => [k, b.default]))), null);
  /* not a run, not in the order */
  assert.equal(RUN_MODES.includes("enquire"), false);
  assert.equal(DEPLOYMENT_SEQUENCE.order.includes("enquire"), false);
  /* its own flag alone deploys it */
  assert.equal(DEPLOYED_MODES.includes("enquire"), false);
  assert.deepEqual([...deployedModesFor({ enquire: true })], ["check", "enquire"]);
  for (const f of [{ ask: true }, { draft: true }, { plan: true }, { verification_recorded: { at: "t" } }, { enquire: "true" }, { enquire: 1 }])
    assert.equal(deployedModesFor(f).includes("enquire"), false, JSON.stringify(f));
  assert.equal(deployedModesFor({ enquire: true, ask: true }).includes("ask"), true);
  assert.equal(deployedModesFor({ enquire: true }).includes("ask"), false, "enquire's flag never deploys ask");
  assert.equal(deployable("enquire", []), true, "the chain never decides it");
  assert.equal(partDeployableOn(SET, "enquire", { testBars: [bar("enquire")] }), true);
  assert.equal(partDeployableOn(SET, "enquire", { testBars: [bar("ask")] }), false, "its own bar, not ask's");
  /* only at a member's act; the standing question's exception is ask's alone */
  for (const startedBy of ["member:ann", "member:ann/tok1"]) assert.deepEqual(startAllowed({ startedBy, mode: "enquire" }), { ok: true });
  for (const startedBy of [null, "class:daemon", "scheduler", "class:ai/tok1"])
    for (const standing of [undefined, { author: "member:ann" }]) {
      const r = refusal(startAllowed({ startedBy, mode: "enquire", standing }), "AI_RUN_NOT_A_MEMBER_ACT");
      assert.match(r.detail, /^the interview and planning start only at the act of the member whose matter it is/);
    }
  /* control: the standing question still starts an ask */
  assert.equal(startAllowed({ startedBy: "class:daemon", mode: "ask", standing: { author: "member:ann" } }).ok, true);
});

test("R25: DRAFT_KINDS gains case_account, account_check and bearing_note — each R21's mode in every other respect (no new mode, no new flag), its reach ASK_SCOPE narrowed to the case's or the source's own record (DRAFT_REACH)", () => {
  assert.deepEqual([...DRAFT_KINDS], ["own_words", "translation", "case_account", "account_check", "bearing_note"]);
  assert.ok(Object.isFrozen(DRAFT_KINDS) && Object.isFrozen(DRAFT_REACH));
  assert.equal(DRAFT_MODE.kinds, DRAFT_KINDS);
  assert.equal(DRAFT_MODE.kind_reach, DRAFT_REACH);
  assert.deepEqual(Object.keys(DRAFT_REACH), [...DRAFT_KINDS]);
  assert.deepEqual(Object.fromEntries(Object.entries(DRAFT_REACH).map(([k, r]) => [k, r.scope])),
    { own_words: "ask_scope", translation: "none", case_account: "case_record", account_check: "case_record", bearing_note: "source_record" });
  for (const k of ["case_account", "account_check", "bearing_note"]) {
    assert.ok(Object.isFrozen(DRAFT_REACH[k]), k);
    assert.match(DRAFT_REACH[k].means, /^within answers' ASK_SCOPE, narrowed to the (case's|source's) own record/, k);
    /* R21's mode in every other respect: one mode, one flag, no run */
    assert.equal(RUN_MODES.includes(k), false, k);
    assert.equal(deployable(k, []), false, `${k} is a kind of draft, not a mode`);
    assert.deepEqual([...deployedModesFor({ [k]: true })], [...DEPLOYED_MODES], `${k} is no flag`);
    /* their reach is narrowed, not a member's grant: draftMayRead (R22) stays false for them */
    assert.equal(draftMayRead({ kind: k, suggestions: true }), false, k);
  }
  assert.match(DRAFT_REACH.case_account.means, /time order, by question, by rule/);
  assert.match(DRAFT_REACH.account_check.means, /skills R44/);
  assert.match(DRAFT_REACH.bearing_note.means, /run-productions R23/);
  assert.deepEqual([DRAFT_MODE.interactive, DRAFT_MODE.writes_run_row, DRAFT_MODE.read_only], [true, false, true]);
  assert.deepEqual([...deployedModesFor({ draft: true })], ["check", "draft"]);
  /* a draft of any kind starts only at a member's act */
  for (const kind of ["case_account", "account_check", "bearing_note"]) {
    assert.deepEqual(startAllowed({ startedBy: "member:ann", mode: "draft", kind }), { ok: true });
    refusal(startAllowed({ startedBy: "class:daemon", mode: "draft", kind, standing: { author: "member:ann" } }), "AI_RUN_NOT_A_MEMBER_ACT");
  }
  /* control: own_words still reads through a grant */
  assert.equal(draftMayRead({ kind: "own_words", suggestions: true }), true);
});

test("R26: RUN_BOUNDS gains pages after proposals, counted by the plane as mints is (a caller's non-zero figure AI_RUN_BOUND_PLANE_COUNTED; a declared allowance accepted); a read inside a document under a \"no AI\" material limit is AI_RUN_READ_NO_AI (C-22.23) whatever the bound", () => {
  const keys = Object.keys(RUN_BOUNDS);
  assert.equal(keys.indexOf("pages"), keys.indexOf("proposals") + 1);
  assert.equal(keys.at(-1), "lease");
  assert.match(RUN_BOUNDS.pages, /pages of documents/);
  assert.deepEqual([...PLANE_COUNTED_BOUNDS], ["mints", "surfaces", "proposals", "pages"]);
  assert.equal(checkBound("pages"), null);
  assert.equal(runStatusFor("pages"), "stopped");
  /* declared at the open, counted by the plane */
  assert.equal(checkConsume([{ bound: "pages", allowed: 40 }], { list: true }), null);
  refusal(checkConsume([{ bound: "pages", allowed: 0 }], { list: true }), "AI_RUN_BOUND_NO_ALLOWANCE");
  for (const v of [1, 7]) {
    assert.equal(refusal(checkConsume({ pages: v }, { map: true }), "AI_RUN_BOUND_PLANE_COUNTED").bound, "pages");
    refusal(checkConsume([{ bound: "pages", allowed: 9, consumed: v }], { list: true }), "AI_RUN_BOUND_PLANE_COUNTED");
  }
  assert.equal(checkConsume({ pages: 0 }, { map: true }), null, "a zero claims nothing");
  assert.equal(finishedBound([{ bound: "pages", allowed: 5, consumed: 5 }]), "pages");
  assert.equal(finishedBound([{ bound: "pages", allowed: 5, consumed: 5 }, { bound: "proposals", allowed: 1, consumed: 1 }]), "proposals");
  /* the "no AI" read: a limit on, covering reading (uses absent means all) */
  for (const limits of [[{ on: true }], [{ on: true, uses: ["read"] }], [{ uses: ["ask", "read"] }], [{}],
                        [{ on: false }, { on: true, uses: ["read"], reason: "sealed by court order" }]]) {
    const r = refusal(checkPagesRead({ limits, pages: 1000 }), "AI_RUN_READ_NO_AI");
    assert.equal(r.check, "C-22.23");
    assert.match(r.detail, /whatever its reading bound allows/);
    assert.equal(r.detail.includes("court"), false, "the detail never quotes a limit's reason");
  }
  /* controls: no limit, a limit off, a limit covering other uses only */
  for (const limits of [undefined, null, [], [{ on: false }], [{ on: true, uses: ["ask", "draft"] }], [{ on: true, uses: [] }],
                        [null, 3, "x"], { on: true }])
    assert.equal(checkPagesRead({ limits }), null, JSON.stringify(limits));
  for (const x of [null, undefined, 3]) assert.equal(checkPagesRead(x), null);
  assert.equal(AI_RUN_CHECKS.AI_RUN_READ_NO_AI.check, "C-22.23");
});
