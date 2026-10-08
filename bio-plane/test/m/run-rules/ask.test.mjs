/* run-rules R16 (the modes `ask` and `draft` deployed apart), R17 (per-ask bounds), R18 (an AI run or ask starts only at a
   member's act, with the standing question's one exception, never a draft's), R21 (the mode `draft`) and R22 (the
   translation draft, and whether a draft may read); T33-49, T35-43, T37-49. Each refusal has its negative control beside it. */
import test from "node:test";
import assert from "node:assert/strict";
import { ASK_MODE, DRAFT_MODE, RUN_MODES, DEPLOYMENT_SEQUENCE, DEPLOYED_MODES, deployedModesFor, deployable, ASK_BOUNDS,
         checkAskBounds, askBoundReached, startAllowed, DRAFT_KINDS, TRANSLATION_DRAFT_MAX_WORDS,
         draftMayRead } from "../../../src/run-rules/index.mjs";
import { refusal } from "./helpers.mjs";

const NAMES = ["turns", "bytes", "wall_ms", "reads"];
const DEFAULTS = Object.fromEntries(NAMES.map((k) => [k, ASK_BOUNDS[k].default]));

test("R16: ASK_MODE describes the mode ask, frozen — read-only with answers' ASK_SCOPE its whole reach, interactive and no run (no run row), deploys apart: not in DEPLOYMENT_SEQUENCE.order, deployed only by its own flag in DEPLOYED_MODES, not deployed today", () => {
  assert.ok(Object.isFrozen(ASK_MODE));
  assert.equal(ASK_MODE.mode, "ask");
  assert.equal(ASK_MODE.read_only, true);
  assert.match(ASK_MODE.reach, /^answers' ASK_SCOPE \(its R1\), the whole of an ask's reach; no write op of any module$/);
  assert.equal(ASK_MODE.interactive, true);
  assert.equal(ASK_MODE.writes_run_row, false);
  assert.match(ASK_MODE.why, /writes no run row/);
  assert.equal(ASK_MODE.deploys_apart, true);
  assert.match(ASK_MODE.when, /reviewed change of its own .*whatever the run modes' state/);
  /* not in the order, and not one of the run modes */
  assert.equal(DEPLOYMENT_SEQUENCE.order.includes("ask"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(DEPLOYMENT_SEQUENCE.deploys_apart, "ask"), false);
  assert.deepEqual(RUN_MODES, DEPLOYMENT_SEQUENCE.order);
  assert.ok(Object.isFrozen(RUN_MODES));
  assert.equal(RUN_MODES.includes("ask"), false);
  /* its own flag decides its place in DEPLOYED_MODES: false today, so absent; the run modes' state is not consulted */
  assert.equal(ASK_MODE.deployed, false);
  assert.equal(DEPLOYED_MODES.includes("ask"), DEPLOYMENT_SEQUENCE.order.includes("ask") || ASK_MODE.deployed);
  assert.equal(DEPLOYED_MODES.includes("ask"), false);
  /* control: the run chain's first mode is still deployed */
  assert.equal(DEPLOYED_MODES.includes("check"), true);
});

test("R16 (T35): ask and draft each deploy apart by a flag of their own — DEPLOYED_MODES holds each exactly when its own flag is true: draft's flag alone adds draft and not ask, ask's flag alone adds ask and not draft, both add both, and neither flag, nor the chain's verification, nor plan's flag moves the other", () => {
  /* today: both flags false, so neither is deployed, and DEPLOYED_MODES is the one computation with today's flags */
  assert.deepEqual([ASK_MODE.deployed, DRAFT_MODE.deployed], [false, false]);
  assert.deepEqual([...DEPLOYED_MODES], [...deployedModesFor()]);
  assert.deepEqual([...deployedModesFor({})], [...DEPLOYED_MODES]);
  assert.ok(Object.isFrozen(deployedModesFor()) && Object.isFrozen(deployedModesFor({ draft: true })));
  for (const m of ["ask", "draft"]) assert.equal(DEPLOYED_MODES.includes(m), false, m);
  /* every combination of every flag: ask and draft are each in exactly when their own flag is true */
  const states = [undefined, null, { at: "t" }];
  for (const verification_recorded of states) for (const plan of [false, true]) for (const ask of [false, true]) for (const draft of [false, true]) {
    const got = deployedModesFor({ verification_recorded, plan, ask, draft });
    const why = JSON.stringify({ verification_recorded, plan, ask, draft });
    assert.equal(got.includes("ask"), ask, `ask: ${why}`);
    assert.equal(got.includes("draft"), draft, `draft: ${why}`);
    assert.equal(got.includes("plan"), plan, `plan: ${why}`);
    /* the chain is the chain's: its first member always, its second only once verified, whatever the apart flags */
    assert.equal(got[0], "check", why);
    assert.equal(got.includes("investigate"), verification_recorded != null, why);
    assert.equal(got.includes("extract"), false, why);
    assert.equal(new Set(got).size, got.length, `each mode once: ${why}`);
  }
  /* draft's flag flipped alone */
  assert.deepEqual([...deployedModesFor({ draft: true })], ["check", "draft"]);
  /* control: ask's flag flipped alone leaves draft out */
  assert.deepEqual([...deployedModesFor({ ask: true })], ["check", "ask"]);
  /* only a literal true deploys: a truthy word is no reviewed flag */
  for (const v of [1, "true", "yes", {}, [true]]) {
    assert.equal(deployedModesFor({ draft: v }).includes("draft"), false, JSON.stringify(v));
    assert.equal(deployedModesFor({ ask: v }).includes("ask"), false, JSON.stringify(v));
  }
  /* never throws: no flags at all is today's flags */
  for (const x of [null, undefined, 3, "draft", []]) assert.deepEqual([...deployedModesFor(x)], [...DEPLOYED_MODES], String(x));
  /* inherited keys are no flags */
  assert.equal(deployedModesFor(Object.create({ draft: true, ask: true })).some((m) => m === "draft" || m === "ask"), false);
});

test("R17: ASK_BOUNDS names turns, bytes, wall_ms and reads, each with a provisional positive default; checkAskBounds refuses an unknown name (C-22.15), a missing or zero figure (C-22.16), a non-positive or non-integer figure (C-22.13), a figure above its default's ceiling (C-22.21); never throws", () => {
  assert.deepEqual(Object.keys(ASK_BOUNDS), NAMES);
  assert.ok(Object.isFrozen(ASK_BOUNDS));
  for (const k of NAMES) {
    assert.ok(Object.isFrozen(ASK_BOUNDS[k]), k);
    assert.ok(Number.isSafeInteger(ASK_BOUNDS[k].default) && ASK_BOUNDS[k].default > 0, k);
    assert.ok(typeof ASK_BOUNDS[k].means === "string" && ASK_BOUNDS[k].means.length > 10, k);
  }
  /* controls: the defaults, and every figure from 1 to the ceiling */
  assert.equal(checkAskBounds({ ...DEFAULTS }), null);
  assert.equal(checkAskBounds({ turns: 1, bytes: 1, wall_ms: 1, reads: 1 }), null);
  assert.equal(checkAskBounds({ reads: 3, wall_ms: 5, bytes: 7, turns: 2 }), null, "any order");
  /* not a map */
  for (const b of [null, undefined, [], [DEFAULTS], "turns", 3, true]) {
    const r = refusal(checkAskBounds(b), "AI_RUN_BOUND_UNKNOWN");
    assert.equal(r.bound, null);
  }
  /* an unknown name, an own key only */
  for (const k of ["turn", "", "Turns", "fetches", "toString", "lease"]) {
    const r = refusal(checkAskBounds({ ...DEFAULTS, [k]: 1 }), "AI_RUN_BOUND_UNKNOWN");
    assert.equal(r.bound, k);
  }
  refusal(checkAskBounds({ ...DEFAULTS, ...JSON.parse('{"__proto__": 1}') }), "AI_RUN_BOUND_UNKNOWN");
  /* a missing figure: left out, absent or zero */
  for (const k of NAMES) {
    const { [k]: _, ...rest } = DEFAULTS;
    assert.equal(refusal(checkAskBounds(rest), "AI_RUN_BOUND_NO_ALLOWANCE").bound, k);
    for (const v of [null, undefined, 0]) assert.equal(refusal(checkAskBounds({ ...DEFAULTS, [k]: v }), "AI_RUN_BOUND_NO_ALLOWANCE").bound, k);
  }
  /* non-positive or not a whole number */
  for (const v of [-1, 1.5, "3", true, NaN, Infinity, -Infinity, 2 ** 53, [1], { n: 1 }])
    for (const k of NAMES) assert.equal(refusal(checkAskBounds({ ...DEFAULTS, [k]: v }), "AI_RUN_CONSUME_INVALID").bound, k);
  /* above the ceiling: the default plus one, and far above */
  for (const k of NAMES) for (const v of [DEFAULTS[k] + 1, Number.MAX_SAFE_INTEGER]) {
    const r = refusal(checkAskBounds({ ...DEFAULTS, [k]: v }), "AI_ASK_BOUND_ABOVE_CEILING");
    assert.deepEqual([r.check, r.bound, r.limit], ["C-22.21", k, DEFAULTS[k]]);
  }
  /* the first fault in the order given wins, then the bounds left out */
  assert.equal(checkAskBounds({ nope: 1, turns: -1 }).code, "AI_RUN_BOUND_UNKNOWN");
  assert.equal(checkAskBounds({ turns: -1, nope: 1 }).code, "AI_RUN_CONSUME_INVALID");
  assert.equal(checkAskBounds({ reads: 1 }).bound, "turns");
});

test("R17: askBoundReached answers the first bound reached in ASK_BOUNDS' order, or null; a malformed declaration reads as the ceiling, a malformed count as nothing spent; never throws", () => {
  const b = { turns: 3, bytes: 100, wall_ms: 1000, reads: 5 };
  assert.equal(askBoundReached(b, {}), null);
  assert.equal(askBoundReached(b, { turns: 2, bytes: 99, wall_ms: 999, reads: 4 }), null);
  for (const k of NAMES) {
    assert.equal(askBoundReached(b, { [k]: b[k] }), k, `${k} at its figure`);
    assert.equal(askBoundReached(b, { [k]: b[k] + 7 }), k, `${k} past it`);
  }
  /* every pair: the earlier in ASK_BOUNDS' order wins, whatever the used map's order */
  for (let i = 0; i < NAMES.length; i++) for (let j = i + 1; j < NAMES.length; j++)
    assert.equal(askBoundReached(b, { [NAMES[j]]: 1e9, [NAMES[i]]: 1e9 }), NAMES[i]);
  /* a declared figure absent, invalid or above the ceiling is read as the ceiling */
  for (const bad of [undefined, 0, -1, 1.5, "3", DEFAULTS.turns + 1]) {
    assert.equal(askBoundReached({ ...b, turns: bad }, { turns: DEFAULTS.turns - 1 }), null, String(bad));
    assert.equal(askBoundReached({ ...b, turns: bad }, { turns: DEFAULTS.turns }), "turns", String(bad));
  }
  assert.equal(askBoundReached(null, { reads: DEFAULTS.reads }), "reads");
  /* a used figure that is not a number counts nothing */
  for (const bad of ["9", null, true, [9], { n: 9 }, NaN]) assert.equal(askBoundReached(b, { turns: bad }), null, String(bad));
  for (const [x, y] of [[null, null], [3, "x"], [[], []], [undefined, undefined]]) assert.equal(askBoundReached(x, y), null);
  /* own keys only */
  assert.equal(askBoundReached(b, Object.create({ turns: 99 })), null);
});

test("R18: startAllowed answers {ok: true} for a member's act; with no member's act, {ok: true, exception: 'standing_question'} only when standing names an author and the mode is ask; otherwise AI_RUN_NOT_A_MEMBER_ACT (C-22.19); never throws", () => {
  /* a member's act: the member's session, or a credential that member minted; any mode, standing or not */
  for (const startedBy of ["member:ann", " member:ann ", "member:ann/tok1"])
    for (const mode of ["check", "ask", "plan", null])
      for (const standing of [null, { author: "member:bob" }])
        assert.deepEqual(startAllowed({ startedBy, mode, standing }), { ok: true }, `${startedBy} ${mode}`);
  /* the one exception */
  assert.deepEqual(startAllowed({ startedBy: "class:daemon", mode: "ask", standing: { author: "member:ann" } }),
    { ok: true, exception: "standing_question", author: "member:ann" });
  assert.deepEqual(startAllowed({ mode: " ask ", standing: { author: "member:ann/tok1" } }),
    { ok: true, exception: "standing_question", author: "member:ann" });
  /* no member's act and no standing question */
  for (const startedBy of [null, undefined, "", "  ", "class:daemon", "class:ai/tok1", "token:x", "ann", "member:", "member: ",
                           "daemon", "scheduler", 3, {}])
    for (const mode of ["check", "ask"])
      refusal(startAllowed({ startedBy, mode }), "AI_RUN_NOT_A_MEMBER_ACT");
  /* a standing question that names no member author, or asks for anything but ask */
  for (const standing of [{}, { author: "" }, { author: "class:daemon" }, { author: "ann" }, "member:ann", true, []])
    refusal(startAllowed({ startedBy: "class:daemon", mode: "ask", standing }), "AI_RUN_NOT_A_MEMBER_ACT");
  for (const mode of ["check", "investigate", "extract", "plan", "", null, "ASK", "asks"]) {
    const r = refusal(startAllowed({ startedBy: "class:daemon", mode, standing: { author: "member:ann" } }), "AI_RUN_NOT_A_MEMBER_ACT");
    assert.match(r.detail, /^a standing question starts only an ask/);
  }
  const plain = refusal(startAllowed(), "AI_RUN_NOT_A_MEMBER_ACT");
  assert.equal(plain.check, "C-22.19");
  assert.match(plain.detail, /^no member's act started this/);
  /* the detail names nobody */
  assert.equal(startAllowed({ startedBy: "class:ai/tok9", mode: "check", standing: { author: "member:zed" } }).detail.includes("zed"), false);
  for (const x of [null, 3, "x", [], undefined]) refusal(startAllowed(x), "AI_RUN_NOT_A_MEMBER_ACT");
});

test("R18 (T35): a draft starts only at a member's own act — startAllowed({startedBy, mode: 'draft'}) is {ok: true} when startedBy names a member, and with no member's act it is AI_RUN_NOT_A_MEMBER_ACT whatever standing holds, the standing exception being ask's alone", () => {
  for (const startedBy of ["member:ann", " member:ann ", "member:ann/tok1"])
    for (const standing of [undefined, null, { author: "member:bob" }])
      assert.deepEqual(startAllowed({ startedBy, mode: "draft", standing }), { ok: true }, `${startedBy} ${JSON.stringify(standing)}`);
  assert.deepEqual(startAllowed({ startedBy: "member:ann", mode: " draft " }), { ok: true });
  /* no member's act: refused with no standing, and with a standing question naming a member author */
  for (const startedBy of [null, undefined, "", "  ", "class:daemon", "class:ai/tok1", "token:x", "ann", "member:", "scheduler", 3, {}])
    for (const standing of [undefined, null, {}, { author: "member:ann" }, { author: "member:ann/tok1" }, { author: "class:daemon" }]) {
      const r = refusal(startAllowed({ startedBy, mode: "draft", standing }), "AI_RUN_NOT_A_MEMBER_ACT");
      assert.equal(r.check, "C-22.19");
      assert.match(r.detail, /^a draft of a member's own words starts only at the act of the member who asked for the help/);
      assert.match(r.detail, /exception is an ask's alone/);
      assert.match(r.detail, /Nothing was started$/);
      assert.equal(r.exception, undefined);
    }
  assert.equal(refusal(startAllowed({ mode: "draft", standing: { author: "member:zed" } }), "AI_RUN_NOT_A_MEMBER_ACT").detail.includes("zed"), false,
    "the detail names nobody");
  /* control: the same standing question still starts an ask */
  assert.deepEqual(startAllowed({ startedBy: "class:daemon", mode: "ask", standing: { author: "member:ann" } }),
    { ok: true, exception: "standing_question", author: "member:ann" });
});

test("R21: DRAFT_MODE describes the mode draft, frozen — interactive and no run (writes no run row, keeps nothing, the draft answered and never stored), read-only within answers' ASK_SCOPE with no write op, a firsthand field reading nothing, bounded by ASK_BOUNDS; deploys apart: not in DEPLOYMENT_SEQUENCE.order, no part of R19's chain, deployed only by its own flag, false today; RUN_MODES does not hold it", () => {
  assert.ok(Object.isFrozen(DRAFT_MODE));
  assert.equal(DRAFT_MODE.mode, "draft");
  assert.notEqual(DRAFT_MODE, ASK_MODE);
  assert.equal(DRAFT_MODE.interactive, true);
  assert.equal(DRAFT_MODE.writes_run_row, false);
  assert.match(DRAFT_MODE.why, /no run: it writes no run row and keeps nothing/);
  assert.match(DRAFT_MODE.keeps, /^nothing: the draft is answered into the member's field, never stored/);
  assert.match(DRAFT_MODE.keeps, /member's words only by the member's own act of keeping or editing it/);
  /* read-only: within answers' ASK_SCOPE, no write op; a firsthand field reads nothing at all */
  assert.equal(DRAFT_MODE.read_only, true);
  assert.equal(DRAFT_MODE.reach, "within answers' ASK_SCOPE (its R1); no write op of any module");
  assert.match(DRAFT_MODE.firsthand_reach, /^nothing: a draft for a field that records what the member saw reads nothing at all$/);
  /* bounded by R17's ASK_BOUNDS, judged by checkAskBounds and askBoundReached as an ask's are */
  assert.match(DRAFT_MODE.bounds, /^ASK_BOUNDS \(R17\), declared when the draft starts$/);
  const declared = Object.fromEntries(Object.entries(ASK_BOUNDS).map(([k, { default: d }]) => [k, d]));
  assert.equal(checkAskBounds(declared), null);
  refusal(checkAskBounds({ ...declared, turns: declared.turns + 1 }), "AI_ASK_BOUND_ABOVE_CEILING");
  assert.equal(askBoundReached(declared, { reads: declared.reads }), "reads");
  /* deploys apart, by its own flag, false until the change that serves agent-worker's POST /draft */
  assert.equal(DRAFT_MODE.deploys_apart, true);
  assert.equal(DRAFT_MODE.deployed, false);
  assert.match(DRAFT_MODE.when, /^only by a reviewed change of its own that sets this flag, the change that serves agent-worker's POST \/draft/);
  assert.match(DRAFT_MODE.when, /whatever the run modes' state and whatever ask's flag$/);
  assert.equal(DEPLOYED_MODES.includes("draft"), false);
  /* not in the order, not one of the order's apart modes, not a run mode: a run opened in mode draft is refused (ai-runs R40) */
  assert.equal(DEPLOYMENT_SEQUENCE.order.includes("draft"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(DEPLOYMENT_SEQUENCE.deploys_apart, "draft"), false);
  assert.equal(RUN_MODES.includes("draft"), false);
  /* no part of R19's chain: no verification, or every verification, leaves its deployability its own flag's */
  const v = (mode) => ({ mode, run: `RUN-${mode}`, verified_by: "member:ann", at: "t", evidence: "e" });
  for (const vs of [[], [v("check"), v("investigate"), v("extract")]]) assert.equal(deployable("draft", vs), true);
  /* control: a word that is no mode is still decided false */
  assert.equal(deployable("drafts", []), false);
});

test("R21 (T37): a draft is of one of two kinds — own_words, everything R21 says (reach within answers' ASK_SCOPE, a firsthand field reading nothing), and translation, whose reach is R22's and not ASK_SCOPE; DRAFT_MODE names the kinds", () => {
  assert.equal(DRAFT_MODE.kinds, DRAFT_KINDS);
  assert.deepEqual([...DRAFT_MODE.kinds], ["own_words", "translation"]);
  /* own_words: R21's reach — within ASK_SCOPE, and through a grant only off a firsthand field with suggestions on */
  assert.equal(DRAFT_MODE.reach, "within answers' ASK_SCOPE (its R1); no write op of any module");
  assert.equal(draftMayRead({ kind: "own_words", firsthand: false, suggestions: true }), true);
  assert.equal(draftMayRead({ kind: "own_words", firsthand: true, suggestions: true }), false, "a firsthand field reads nothing at all");
  assert.equal(draftMayRead({ kind: "own_words", firsthand: false, suggestions: false }), false, "K1841 (2): only with the suggestions switch on");
  /* translation: its own reach, which is not ASK_SCOPE */
  assert.match(DRAFT_MODE.translation_reach, /^nothing of the record: /);
  assert.notEqual(DRAFT_MODE.translation_reach, DRAFT_MODE.reach);
  assert.equal(draftMayRead({ kind: "translation", firsthand: false, suggestions: true }), false);
  /* still one mode: no kind is a mode of its own */
  for (const k of DRAFT_KINDS) {
    assert.equal(RUN_MODES.includes(k), false, k);
    assert.equal(DEPLOYMENT_SEQUENCE.order.includes(k), false, k);
    assert.equal(deployable(k, []), false, `${k} is a kind of draft, not a mode`);
  }
});

test("R22: DRAFT_KINDS is [own_words, translation], frozen and named by DRAFT_MODE; a translation draft is R21's mode in every other respect — interactive, no run, read-only, ASK_BOUNDS, deployed by draft's own flag — with no new mode and no new flag: RUN_MODES, DEPLOYED_MODES and the flags unchanged", () => {
  assert.ok(Object.isFrozen(DRAFT_KINDS));
  assert.deepEqual([...DRAFT_KINDS], ["own_words", "translation"]);
  assert.equal(DRAFT_MODE.kinds, DRAFT_KINDS);
  assert.ok(Object.isFrozen(DRAFT_MODE));
  /* R21's mode in every other respect */
  assert.equal(DRAFT_MODE.mode, "draft");
  assert.deepEqual([DRAFT_MODE.interactive, DRAFT_MODE.writes_run_row, DRAFT_MODE.read_only, DRAFT_MODE.deploys_apart],
                   [true, false, true, true]);
  assert.match(DRAFT_MODE.bounds, /^ASK_BOUNDS \(R17\)/);
  /* no new mode, no new flag */
  assert.deepEqual([...RUN_MODES], ["check", "investigate", "extract", "plan"]);
  assert.deepEqual([...DEPLOYED_MODES], ["check"]);
  assert.deepEqual(Object.keys(DEPLOYMENT_SEQUENCE.deploys_apart), ["plan"]);
  assert.deepEqual([ASK_MODE.deployed, DRAFT_MODE.deployed], [false, false]);
  for (const flag of ["translation", "own_words", "translation_draft"])
    assert.deepEqual([...deployedModesFor({ [flag]: true })], [...DEPLOYED_MODES], `${flag} is no flag`);
  /* the translation draft runs on draft's flag: flipping it deploys the mode draft, and nothing named for a kind */
  assert.deepEqual([...deployedModesFor({ draft: true })], ["check", "draft"]);
  /* control: ask's flag alone still leaves draft out */
  assert.equal(deployedModesFor({ ask: true }).includes("draft"), false);
});

test("R22: a translation draft's reach is nothing of the record — no read op of any module, ASK_SCOPE included, whatever the suggestions switch — so it is given only the words asked about, at most 100 a draft (K2201); the draft is answered to the plane and never kept by the mode, the words stored being instance-setup's", () => {
  assert.equal(TRANSLATION_DRAFT_MAX_WORDS, 100);
  assert.match(DRAFT_MODE.translation_reach, /^nothing of the record: no read op of any module, answers' ASK_SCOPE included, whatever the member's suggestions switch;/);
  assert.match(DRAFT_MODE.translation_reach, /given only the interface words it is asked about, at most 100 a draft/);
  assert.match(DRAFT_MODE.translation_keeps, /^nothing: the draft is answered to the plane and never kept by the run;/);
  assert.match(DRAFT_MODE.translation_keeps, /labelled draft, adopted or confirmed are instance-setup's, never the mode's$/);
  /* whatever the suggestions switch and the firsthand mark, a translation draft may not read through a grant */
  for (const suggestions of [true, false, undefined, null, "true", 1])
    for (const firsthand of [false, true, undefined, null])
      assert.equal(draftMayRead({ kind: "translation", firsthand, suggestions }), false, JSON.stringify({ suggestions, firsthand }));
  /* control: own_words with the same arguments that let it read */
  assert.equal(draftMayRead({ kind: "own_words", firsthand: false, suggestions: true }), true);
});

test("R22: draftMayRead({kind, firsthand, suggestions}) is true only for own_words, not firsthand, with suggestions true; false for translation whatever the rest, for an unknown kind, for firsthand and for suggestions not true; never throws", () => {
  const KINDS = ["own_words", "translation", "", " own_words", "own_words ", "OWN_WORDS", "ownwords", "draft", "ask",
                 "__proto__", "toString", null, undefined, 3, true, ["own_words"], { kind: "own_words" }];
  const FIRSTHAND = [undefined, null, false, true, "true", "false", 1, 0, "", {}, []];
  const SUGGESTIONS = [true, false, undefined, null, "true", 1, {}, [true]];
  /* the whole table: true exactly when the kind is own_words, firsthand is absent, null or false, and suggestions is true */
  for (const kind of KINDS) for (const firsthand of FIRSTHAND) for (const suggestions of SUGGESTIONS) {
    const want = kind === "own_words" && (firsthand === undefined || firsthand === null || firsthand === false) && suggestions === true;
    const got = draftMayRead({ kind, firsthand, suggestions });
    assert.equal(typeof got, "boolean");
    assert.equal(got, want, JSON.stringify({ kind, firsthand, suggestions }));
  }
  /* firsthand left out is not firsthand */
  assert.equal(draftMayRead({ kind: "own_words", suggestions: true }), true);
  /* suggestions left out is not on */
  assert.equal(draftMayRead({ kind: "own_words", firsthand: false }), false);
  /* every kind of DRAFT_KINDS but own_words is false with the arguments that let own_words read */
  for (const k of DRAFT_KINDS) assert.equal(draftMayRead({ kind: k, suggestions: true }), k === "own_words", k);
  /* inherited keys are no arguments */
  assert.equal(draftMayRead(Object.create({ kind: "own_words", suggestions: true })), false);
  /* never throws: anything that is not a request is false */
  for (const x of [undefined, null, 3, "own_words", true, [], () => 1]) assert.equal(draftMayRead(x), false, String(x));
  assert.equal(draftMayRead(), false);
});

test("R22, R18: startAllowed answers for a translation draft as for any draft — only at a member's own act, whatever standing holds", () => {
  for (const startedBy of ["member:ann", "member:ann/tok1"])
    assert.deepEqual(startAllowed({ startedBy, mode: "draft", kind: "translation" }), { ok: true }, startedBy);
  for (const startedBy of [null, "class:daemon", "class:ai/tok1", "scheduler"])
    for (const standing of [undefined, { author: "member:ann" }]) {
      const r = refusal(startAllowed({ startedBy, mode: "draft", kind: "translation", standing }), "AI_RUN_NOT_A_MEMBER_ACT");
      assert.match(r.detail, /^a draft of a member's own words starts only at the act of the member who asked for the help/);
    }
  /* the kind changes nothing: the same answers as a draft that names none */
  for (const startedBy of ["member:ann", "class:daemon"])
    assert.deepEqual(startAllowed({ startedBy, mode: "draft", kind: "translation" }), startAllowed({ startedBy, mode: "draft" }));
});
