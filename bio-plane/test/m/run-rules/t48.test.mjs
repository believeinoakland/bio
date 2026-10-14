/* run-rules T48-28 (N670; DEC-127 (3); K3190, K3195): R33, the draft kind `reading` — the assistant's translation, for one
   member, of a passage of the group's own writing into her language. Its reach, its flag, its test-bar part and its start,
   each with its control beside it (K874). No refusal is new: a draft of any kind is R18's to start. */
import test from "node:test";
import assert from "node:assert/strict";
import { DRAFT_KINDS, ACTION_DRAFT_KINDS, DRAFT_REACH, DRAFT_MODE, ACTION_DRAFTS, draftMayRead, draftKindDeployed,
         deployedModesFor, DEPLOYED_MODES, RUN_MODES, DEPLOYMENT_SEQUENCE, deployable, startAllowed, ASK_BOUNDS,
         checkAskBounds, askBoundReached, TEST_BAR_PARTS, partDeployableOn, partAdmitted, untestedLabel,
         CIVICSMITH_TEST_SET } from "../../../src/run-rules/index.mjs";
import { refusal } from "./helpers.mjs";

const SET = Object.freeze({ id: "fixture", version: 1, matters: Object.freeze([{ id: "M1" }]) });
const bar = (part) => ({ part, set: SET.id, set_version: SET.version, false_alarm_rate: 0, passed: true, graded_by: "harness",
                         at: "2026-10-14T00:00:00Z" });

test("R33: DRAFT_KINDS gains reading after statusreport, last, frozen and named by DRAFT_MODE; it is not an action draft, and every earlier kind keeps its place", () => {
  assert.deepEqual([...DRAFT_KINDS].slice(-2), ["statusreport", "reading"]);
  assert.deepEqual([...DRAFT_KINDS], ["own_words", "translation", "case_account", "account_check", "bearing_note",
                                      "textcheck", "infractiondraft", "bearingdraft", "statusreport", "reading"]);
  assert.equal(DRAFT_KINDS.filter((k) => k === "reading").length, 1);
  assert.ok(Object.isFrozen(DRAFT_KINDS));
  assert.equal(DRAFT_MODE.kinds, DRAFT_KINDS);
  assert.equal(ACTION_DRAFT_KINDS.includes("reading"), false);
  assert.equal(ACTION_DRAFTS.kinds.includes("reading"), false);
});

test("R33: reading is R21's mode in every other respect — interactive, no run and no run row, read-only, R17's ASK_BOUNDS; no mode and no flag of its own", () => {
  assert.deepEqual([DRAFT_MODE.mode, DRAFT_MODE.interactive, DRAFT_MODE.writes_run_row, DRAFT_MODE.read_only, DRAFT_MODE.deploys_apart],
                   ["draft", true, false, true, true]);
  assert.match(DRAFT_MODE.bounds, /^ASK_BOUNDS \(R17\)/);
  const declared = Object.fromEntries(Object.entries(ASK_BOUNDS).map(([k, b]) => [k, b.default]));
  assert.equal(checkAskBounds(declared), null);
  refusal(checkAskBounds({ ...declared, reads: declared.reads + 1 }), "AI_ASK_BOUND_ABOVE_CEILING");
  assert.equal(askBoundReached(declared, { turns: declared.turns }), "turns");
  /* no run: not a run mode, not in the order, not a mode the chain decides */
  assert.equal(RUN_MODES.includes("reading"), false);
  assert.equal(DEPLOYMENT_SEQUENCE.order.includes("reading"), false);
  assert.equal(deployable("reading", []), false, "a kind of draft, not a mode");
  /* no flag: naming it moves no mode */
  for (const v of [true, false]) assert.deepEqual([...deployedModesFor({ reading: v })], [...DEPLOYED_MODES], String(v));
  assert.equal(DEPLOYED_MODES.includes("reading"), false);
});

test("R33: reading deploys under draft's own flag — draftKindDeployed answers true exactly when draft's flag is true, action_drafts playing no part; a flag left out takes today's value (draft true); never throws", () => {
  const VALUES = [true, false, undefined, "true", 1, null];
  for (const draft of VALUES) for (const action of VALUES) for (const leave of [[], ["draft"], ["action_drafts"], ["draft", "action_drafts"]]) {
    const flags = {};
    if (!leave.includes("draft")) flags.draft = draft;
    if (!leave.includes("action_drafts")) flags.action_drafts = action;
    const want = leave.includes("draft") ? DRAFT_MODE.deployed === true : draft === true;
    assert.equal(draftKindDeployed({ kind: "reading", flags }), want, JSON.stringify(flags));
  }
  assert.equal(DRAFT_MODE.deployed, true);
  assert.equal(draftKindDeployed({ kind: "reading" }), true, "today: draft's flag is true");
  assert.equal(draftKindDeployed({ kind: "reading", flags: { draft: false, action_drafts: true } }), false, "action_drafts alone deploys nothing");
  assert.equal(draftKindDeployed({ kind: "reading", flags: { draft: true, action_drafts: false } }), true, "action_drafts plays no part");
  /* control: an action draft still needs both flags */
  assert.equal(draftKindDeployed({ kind: "textcheck", flags: { draft: true, action_drafts: false } }), false);
  /* own keys only; anything that is not a request is false */
  assert.equal(draftKindDeployed({ kind: "reading", flags: Object.create({ draft: false }) }), true, "an inherited false is no flag");
  assert.equal(draftKindDeployed(Object.create({ kind: "reading" })), false);
  for (const kind of ["Reading", " reading", "read", "draft:reading", "readings"])
    assert.equal(draftKindDeployed({ kind, flags: { draft: true } }), false, kind);
});

test("R33: its test-bar part is draft:reading (TEST_BAR_PARTS follows DRAFT_KINDS) — held by its own passed record alone, another kind's bar or transcription's read not counting; on Civicsmith's empty set admitted only on a test instance, labelled", () => {
  assert.equal(TEST_BAR_PARTS.includes("draft:reading"), true);
  assert.deepEqual(TEST_BAR_PARTS.filter((p) => p.startsWith("draft:")), DRAFT_KINDS.map((k) => `draft:${k}`));
  assert.equal(TEST_BAR_PARTS.includes("read"), true, "the use kind read stays its own part");
  assert.equal(partDeployableOn(SET, "draft:reading", { testBars: [bar("draft:reading")] }), true);
  for (const other of ["draft:statusreport", "draft:translation", "read", "reading"])
    assert.equal(partDeployableOn(SET, "draft:reading", { testBars: [bar(other)] }), false, `${other}'s bar is not its own`);
  assert.equal(partDeployableOn(SET, "draft:reading", { testBars: [] }), false);
  if (CIVICSMITH_TEST_SET.matters.length === 0) {
    assert.deepEqual(partAdmitted("draft:reading", {}), { admitted: false, untested: null });
    assert.deepEqual(partAdmitted("draft:reading", {}, { testInstance: true }), { admitted: true, untested: untestedLabel("draft:reading") });
  }
  assert.equal(untestedLabel("draft:reading").part, "draft:reading");
});

test("R33: its reach (DRAFT_REACH) is none — only the passage the door hands in — so draftMayRead is false for it whatever the rest; control: draftMayRead({kind: 'reading', suggestions: true}) is false where own_words with the same arguments is true", () => {
  assert.deepEqual(Object.keys(DRAFT_REACH), [...DRAFT_KINDS]);
  assert.ok(Object.isFrozen(DRAFT_REACH) && Object.isFrozen(DRAFT_REACH.reading));
  assert.deepEqual(Object.keys(DRAFT_REACH.reading), ["scope", "means"]);
  assert.equal(DRAFT_REACH.reading.scope, "none");
  assert.match(DRAFT_REACH.reading.means, /^nothing of the record: only the passage of the group's own writing the door hands in/);
  assert.equal(DRAFT_REACH.reading.scope, DRAFT_REACH.translation.scope, "as a translation is given only its words");
  /* the control the requirement names */
  assert.equal(draftMayRead({ kind: "reading", suggestions: true }), false);
  assert.equal(draftMayRead({ kind: "own_words", suggestions: true }), true);
  /* whatever the rest */
  for (const firsthand of [undefined, null, false, true, "true", 0, {}]) for (const suggestions of [true, false, undefined, null, "true", 1])
    assert.equal(draftMayRead({ kind: "reading", firsthand, suggestions }), false, JSON.stringify({ firsthand, suggestions }));
  assert.equal(draftMayRead({ kind: "reading" }), false);
});

test("R33: started only at the asking member's own act (R18) — with no member's act AI_RUN_NOT_A_MEMBER_ACT whatever standing holds, the detail naming nobody; control: the same standing question still starts an ask", () => {
  for (const startedBy of ["member:ann", " member:ann ", "member:ann/tok1"])
    assert.deepEqual(startAllowed({ startedBy, mode: "draft", kind: "reading" }), { ok: true }, startedBy);
  for (const startedBy of [null, undefined, "", "class:daemon", "class:ai/tok1", "scheduler", "member:"])
    for (const standing of [undefined, null, { author: "member:ann" }]) {
      const r = refusal(startAllowed({ startedBy, mode: "draft", kind: "reading", standing }), "AI_RUN_NOT_A_MEMBER_ACT");
      assert.equal(r.check, "C-22.19");
      assert.match(r.detail, /^a draft, of whatever kind, starts only at the act of the member who asked for the help/);
      assert.equal(r.detail.includes("ann"), false, "the detail names nobody");
    }
  assert.deepEqual(startAllowed({ startedBy: "class:daemon", mode: "ask", standing: { author: "member:ann" } }),
                   { ok: true, exception: "standing_question", author: "member:ann" });
});

test("R33: pure, never throws — every rule that reads a kind answers for reading and for malformed requests about it without throwing, and the same input answers the same", () => {
  const asks = [{ kind: "reading" }, { kind: "reading", flags: null }, { kind: "reading", flags: 3 }, { kind: "reading", flags: [true] },
                { kind: "reading", firsthand: Symbol("x") }, null, undefined, 3, "reading", []];
  for (const a of asks) {
    assert.doesNotThrow(() => draftMayRead(a));
    assert.doesNotThrow(() => draftKindDeployed(a));
    assert.equal(draftMayRead(a), draftMayRead(a));
    assert.equal(draftKindDeployed(a), draftKindDeployed(a));
  }
  for (const flags of [null, 3, "x", [true]])
    assert.equal(draftKindDeployed({ kind: "reading", flags }), DRAFT_MODE.deployed, String(flags));
  assert.doesNotThrow(() => startAllowed({ mode: "draft", kind: "reading" }));
  assert.doesNotThrow(() => partAdmitted("draft:reading", null, null));
});
