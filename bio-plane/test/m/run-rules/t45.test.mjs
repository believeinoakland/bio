/* run-rules T45-10 (N861, N887; Actions D11b, D21, D25): R27, the action drafts — `DRAFT_KINDS` gains `textcheck`,
   `infractiondraft` and `bearingdraft`; their reach (`DRAFT_REACH`, `draftMayRead`); their one deploy flag
   `action_drafts` (`ACTION_DRAFTS`, `draftKindDeployed`). No refusal is new: a draft of any kind is R18's to start. */
import test from "node:test";
import assert from "node:assert/strict";
import { DRAFT_KINDS, ACTION_DRAFT_KINDS, DRAFT_REACH, DRAFT_MODE, ACTION_DRAFTS, draftMayRead, draftKindDeployed,
         deployedModesFor, DEPLOYED_MODES, RUN_MODES, DEPLOYMENT_SEQUENCE, deployable, startAllowed, ASK_BOUNDS,
         checkAskBounds, TEST_BAR_PARTS, partDeployableOn } from "../../../src/run-rules/index.mjs";
import { refusal } from "./helpers.mjs";

const ACTION = ["textcheck", "infractiondraft", "bearingdraft"];
const EARLIER = ["own_words", "translation", "case_account", "account_check", "bearing_note"];
const UNKNOWN = ["", "draft", "text_check", "TextCheck", "infraction_draft", "bearing", " textcheck", "statusreportdraft",
                 "__proto__", "toString", null, undefined, 3, true, ["textcheck"], { kind: "textcheck" }];

test("R27: DRAFT_KINDS gains textcheck, infractiondraft and bearingdraft after R25's three, frozen and named by DRAFT_MODE; each is R21's mode in every other respect — no run, no run row, read-only, ASK_BOUNDS, no mode and no flag of its own name, the test bar held per kind (draft:<kind>)", () => {
  assert.deepEqual([...DRAFT_KINDS], [...EARLIER, ...ACTION]);
  assert.deepEqual([...ACTION_DRAFT_KINDS], ACTION);
  assert.ok(Object.isFrozen(DRAFT_KINDS) && Object.isFrozen(ACTION_DRAFT_KINDS));
  assert.equal(DRAFT_MODE.kinds, DRAFT_KINDS);
  /* R21's mode: interactive, no run row, read-only, R17's bounds */
  assert.deepEqual([DRAFT_MODE.mode, DRAFT_MODE.interactive, DRAFT_MODE.writes_run_row, DRAFT_MODE.read_only, DRAFT_MODE.deploys_apart],
                   ["draft", true, false, true, true]);
  assert.match(DRAFT_MODE.bounds, /^ASK_BOUNDS \(R17\)/);
  assert.equal(checkAskBounds(Object.fromEntries(Object.entries(ASK_BOUNDS).map(([k, b]) => [k, b.default]))), null);
  for (const k of ACTION) {
    assert.equal(RUN_MODES.includes(k), false, `${k} is no run`);
    assert.equal(DEPLOYMENT_SEQUENCE.order.includes(k), false, k);
    assert.equal(deployable(k, []), false, `${k} is a kind of draft, not a mode`);
    assert.deepEqual([...deployedModesFor({ [k]: true })], [...DEPLOYED_MODES], `${k} is no flag`);
    /* the test bar is held per kind */
    assert.ok(TEST_BAR_PARTS.includes(`draft:${k}`), k);
    const SET = { id: "fixture", version: 1, matters: [{ id: "M1" }] };
    const bar = (part) => ({ part, set: "fixture", set_version: 1, false_alarm_rate: 0, passed: true, graded_by: "h", at: "t" });
    assert.equal(partDeployableOn(SET, `draft:${k}`, { testBars: [bar(`draft:${k}`)] }), true, k);
    for (const other of ACTION.filter((x) => x !== k))
      assert.equal(partDeployableOn(SET, `draft:${k}`, { testBars: [bar(`draft:${other}`)] }), false, `${k}: ${other}'s bar is not its own`);
  }
});

test("R27: startAllowed for an action draft is R18's for any draft — only at the asking member's own act; with no member's act refused AI_RUN_NOT_A_MEMBER_ACT whatever standing holds (control: the standing question still starts an ask)", () => {
  for (const kind of ACTION) {
    for (const startedBy of ["member:ann", "member:ann/tok1"])
      assert.deepEqual(startAllowed({ startedBy, mode: "draft", kind }), { ok: true }, `${kind} ${startedBy}`);
    for (const startedBy of [null, "class:daemon", "class:ai/tok1", "scheduler", ""])
      for (const standing of [undefined, null, { author: "member:ann" }]) {
        const r = refusal(startAllowed({ startedBy, mode: "draft", kind, standing }), "AI_RUN_NOT_A_MEMBER_ACT");
        assert.equal(r.check, "C-22.19");
        assert.match(r.detail, /^a draft, of whatever kind, starts only at the act of the member who asked for the help/);
        assert.equal(r.detail.includes("ann"), false, "the detail names nobody");
      }
  }
  assert.deepEqual(startAllowed({ startedBy: "class:daemon", mode: "ask", standing: { author: "member:ann" } }),
    { ok: true, exception: "standing_question", author: "member:ann" });
});

test("R27: DRAFT_REACH — textcheck reads nothing of the record, given only the prepared text; infractiondraft, through the member's grant, only the matter's own record she may see (plan, actions, correspondence, findings); bearingdraft only the action and the reply with the request's claims; both through the reads the grant already admits, no op added, no write op", () => {
  assert.ok(Object.isFrozen(DRAFT_REACH));
  assert.deepEqual(Object.keys(DRAFT_REACH), [...DRAFT_KINDS]);
  assert.deepEqual(ACTION.map((k) => DRAFT_REACH[k].scope), ["none", "matter_record", "action_reply"]);
  for (const k of ACTION) {
    assert.ok(Object.isFrozen(DRAFT_REACH[k]), k);
    assert.deepEqual(Object.keys(DRAFT_REACH[k]), ["scope", "means"], k);
  }
  assert.match(DRAFT_REACH.textcheck.means, /^nothing of the record: only the prepared text it is asked about/);
  assert.equal(DRAFT_REACH.textcheck.scope, DRAFT_REACH.translation.scope, "as a translation is given only its words");
  assert.match(DRAFT_REACH.infractiondraft.means,
    /^through the asking member's grant, only the matter's own record the member may see: its plan, actions, correspondence and findings/);
  assert.match(DRAFT_REACH.bearingdraft.means,
    /^through the asking member's grant, only the action and the reply it is asked about, with the request's claims/);
  for (const k of ["infractiondraft", "bearingdraft"]) {
    assert.match(DRAFT_REACH[k].means, /the record reads the grant already admits \(credentials' AI_GRANT_OPS, no op added\)/, k);
    assert.match(DRAFT_REACH[k].means, /no write op of any module$/, k);
  }
  /* control: R25's narrowed reaches are unchanged */
  assert.deepEqual(EARLIER.map((k) => DRAFT_REACH[k].scope), ["ask_scope", "none", "case_record", "case_record", "source_record"]);
});

test("R27: draftMayRead is true for infractiondraft and bearingdraft whatever suggestions while firsthand is absent or false, false for textcheck; its answers for R22's and R25's kinds unchanged, and false for an unknown kind; never throws", () => {
  const FIRSTHAND = [undefined, null, false, true, "true", "false", 1, 0, "", {}, []];
  const SUGGESTIONS = [true, false, undefined, null, "true", 1, {}, [true]];
  for (const kind of [...DRAFT_KINDS, ...UNKNOWN]) for (const firsthand of FIRSTHAND) for (const suggestions of SUGGESTIONS) {
    const notFirsthand = firsthand === undefined || firsthand === null || firsthand === false;
    const want = notFirsthand && ((kind === "own_words" && suggestions === true) || kind === "infractiondraft" || kind === "bearingdraft");
    const got = draftMayRead({ kind, firsthand, suggestions });
    assert.equal(typeof got, "boolean");
    assert.equal(got, want, JSON.stringify({ kind, firsthand, suggestions }));
  }
  /* left out: firsthand absent is not firsthand, and suggestions left out is no matter for the action drafts */
  for (const k of ["infractiondraft", "bearingdraft"]) assert.equal(draftMayRead({ kind: k }), true, k);
  assert.equal(draftMayRead({ kind: "textcheck" }), false);
  /* inherited keys are no arguments */
  assert.equal(draftMayRead(Object.create({ kind: "infractiondraft" })), false);
  for (const x of [undefined, null, 3, "infractiondraft", [], () => 1]) assert.equal(draftMayRead(x), false, String(x));
});

test("R27: the action drafts deploy by one flag of their own, action_drafts, false today and set only by a reviewed change once the test bar is held for each; it names no mode (deployedModesFor takes it, no mode moves); draft's flag alone never deploys them", () => {
  assert.ok(Object.isFrozen(ACTION_DRAFTS));
  assert.equal(ACTION_DRAFTS.flag, "action_drafts");
  assert.equal(ACTION_DRAFTS.kinds, ACTION_DRAFT_KINDS);
  assert.equal(ACTION_DRAFTS.deployed, false);
  assert.match(ACTION_DRAFTS.when, /^only by a reviewed change of its own that sets this flag, once R19's test bar is held for each of the three/);
  for (const k of ACTION) assert.ok(ACTION_DRAFTS.when.includes(`draft:${k}`), k);
  assert.match(ACTION_DRAFTS.when, /draft's flag alone never deploys them$/);
  assert.equal(DRAFT_MODE.action_drafts, ACTION_DRAFTS);
  /* a name deployedModesFor's flags may carry, moving no mode */
  for (const v of [true, false, "true"]) {
    assert.deepEqual([...deployedModesFor({ action_drafts: v })], [...DEPLOYED_MODES], String(v));
    assert.deepEqual([...deployedModesFor({ action_drafts: v, draft: true })], ["check", "draft"], String(v));
  }
  assert.equal(DEPLOYED_MODES.includes("action_drafts"), false);
});

test("R27: draftKindDeployed({kind, flags}) — an action draft only when both draft's flag and action_drafts are exactly true; R22's and R25's kinds exactly when draft's flag is; an unknown kind false; a flag left out takes today's value (both false); never throws", () => {
  const VALUES = [true, false, undefined, "true", 1, null];
  for (const kind of [...DRAFT_KINDS, ...UNKNOWN]) for (const draft of VALUES) for (const action of VALUES)
    for (const leave of [[], ["draft"], ["action_drafts"], ["draft", "action_drafts"]]) {
      const flags = {};
      if (!leave.includes("draft")) flags.draft = draft;
      if (!leave.includes("action_drafts")) flags.action_drafts = action;
      const d = !leave.includes("draft") && draft === true;
      const a = !leave.includes("action_drafts") && action === true;
      const want = ACTION.includes(kind) ? d && a : EARLIER.includes(kind) ? d : false;
      const got = draftKindDeployed({ kind, flags });
      assert.equal(typeof got, "boolean");
      assert.equal(got, want, JSON.stringify({ kind, flags }));
    }
  /* today: no flag set, nothing deployed */
  for (const kind of DRAFT_KINDS) {
    assert.equal(draftKindDeployed({ kind }), false, kind);
    assert.equal(draftKindDeployed({ kind, flags: {} }), DRAFT_MODE.deployed, kind);
  }
  /* draft's flag alone never deploys an action draft; action_drafts alone deploys nothing */
  for (const kind of ACTION) {
    assert.equal(draftKindDeployed({ kind, flags: { draft: true } }), false, kind);
    assert.equal(draftKindDeployed({ kind, flags: { action_drafts: true } }), false, kind);
    assert.equal(draftKindDeployed({ kind, flags: { draft: true, action_drafts: true } }), true, kind);
  }
  /* control: R22's and R25's kinds follow draft's flag alone, action_drafts changing nothing for them */
  for (const kind of EARLIER) {
    assert.equal(draftKindDeployed({ kind, flags: { draft: true } }), true, kind);
    assert.equal(draftKindDeployed({ kind, flags: { draft: false, action_drafts: true } }), false, kind);
  }
  /* own keys only; anything that is not a request is false */
  assert.equal(draftKindDeployed({ kind: "textcheck", flags: Object.create({ draft: true, action_drafts: true }) }), false);
  assert.equal(draftKindDeployed(Object.create({ kind: "own_words", flags: { draft: true } })), false);
  for (const x of [undefined, null, 3, "textcheck", [], () => 1]) assert.equal(draftKindDeployed(x), false, String(x));
  for (const flags of [null, 3, "x", [true]]) assert.equal(draftKindDeployed({ kind: "own_words", flags }), false, String(flags));
});
