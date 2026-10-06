/* run-rules R16 (the mode `ask`), R17 (per-ask bounds) and R18 (an AI run or ask starts only at a member's act, with the
   standing question's one exception); T33-49. Each refusal has its negative control beside it. */
import test from "node:test";
import assert from "node:assert/strict";
import { ASK_MODE, RUN_MODES, DEPLOYMENT_SEQUENCE, DEPLOYED_MODES, ASK_BOUNDS, checkAskBounds, askBoundReached,
         startAllowed } from "../../../src/run-rules/index.mjs";
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
