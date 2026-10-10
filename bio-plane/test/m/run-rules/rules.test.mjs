/* run-rules R1–R8 and R13: the run's vocabulary and pure rules (moved from ai-runs R1–R8 with their meaning unchanged;
   R13 the planning run's `proposals` bound, K660). Each refusal has its negative control beside it. */
import test from "node:test";
import assert from "node:assert/strict";
import { RUN_BOUNDS, RUN_ENDINGS, RUN_STATUS, RUN_NEVER_STARTED, runStatusFor, STANDARD_BASIS, RUN_CONTEXTS,
         checkBound, checkConsume, PLANE_COUNTED_BOUNDS, PLANE_DECIDED_BOUNDS, finishedBound, projectGate,
         PROJECT_GATE_GROUNDS, runConsultsProjects, checkRunContextKind, runPrincipalOf, runPrincipalGate,
         checkSkillVersion, parseSkillVersion, translationOf, AI_RUN_CHECKS } from "../../../src/run-rules/index.mjs";
import { refusal } from "./helpers.mjs";

const BOUNDS = ["fetches", "subsessions", "wallclock", "runtime", "mints", "surfaces", "proposals", "pages", "lease"];
const ENDINGS = ["completed", "cancelled", "mode-not-deployed"];

test("R1: the bounds and endings are exactly the named ones; runStatusFor answers never-started for mode-not-deployed, stopped for every bound, finished otherwise", () => {
  assert.deepEqual(Object.keys(RUN_BOUNDS), BOUNDS);
  assert.deepEqual(Object.keys(RUN_ENDINGS), ENDINGS);
  assert.deepEqual(Object.keys(RUN_STATUS), ["running", "finished", "stopped", "never-started"]);
  assert.deepEqual(Object.keys(RUN_NEVER_STARTED), ["mode-not-deployed"]);
  for (const b of BOUNDS) assert.equal(runStatusFor(b), "stopped", b);
  assert.equal(runStatusFor("mode-not-deployed"), "never-started");
  for (const e of ["completed", "cancelled", "", null, undefined, "anything", "__proto__"]) assert.equal(runStatusFor(e), "finished", String(e));
  /* control: running is never an answer about a run that ended */
  for (const x of [...BOUNDS, ...ENDINGS, "running"]) assert.notEqual(runStatusFor(x), "running");
  /* every bound and ending carries its sentence (converted from airun ARM V6 and skillsequencing: the ending texts) */
  for (const v of Object.values({ ...RUN_BOUNDS, ...RUN_ENDINGS, ...STANDARD_BASIS, ...RUN_CONTEXTS })) {
    assert.equal(typeof v, "string");
    assert.ok(v.length >= 10, v);
  }
  assert.match(RUN_ENDINGS.cancelled, /a member stopped it/);
  assert.match(RUN_ENDINGS["mode-not-deployed"], /\bno member\b/);
  assert.doesNotMatch(RUN_ENDINGS["mode-not-deployed"], /a member stopped it/);
  assert.notEqual(RUN_ENDINGS.cancelled, RUN_ENDINGS["mode-not-deployed"]);
  for (const e of ENDINGS) assert.equal(Object.prototype.hasOwnProperty.call(RUN_BOUNDS, e), false, `${e} is an ending, not a bound`);
});

test("R2: checkBound passes every bound and ending and refuses any other name as AI_RUN_BOUND_UNNAMED (C-22.5), the detail naming the value, the bounds and the endings", () => {
  for (const b of [...BOUNDS, ...ENDINGS]) assert.equal(checkBound(b), null, b);
  for (const b of [null, undefined, "", " ", "fetch", "LEASE", "__proto__", "constructor", "toString", 3, {}])
    refusal(checkBound(b), "AI_RUN_BOUND_UNNAMED");
  const r = checkBound("fetch");
  assert.equal(r.check, "C-22.5");
  /* converted from airun's C-22.5 detail arm: the sentence names what was sent and what is legal */
  assert.match(r.detail, /^'fetch' names no bound and no ending/);
  for (const n of [...BOUNDS, ...ENDINGS]) assert.ok(r.detail.includes(n), n);
  assert.match(checkBound(null).detail, /^'\(absent\)'/);
});

test("R3: checkConsume — a non-map/non-list shape or an unknown bound C-22.15; any figure for lease, or a caller's non-zero mints/surfaces, C-22.14; an absent or zero declared allowance C-22.16; a figure not a non-negative safe integer C-22.13", () => {
  assert.deepEqual(PLANE_DECIDED_BOUNDS, ["lease"]);
  /* the tick's map: controls first */
  assert.equal(checkConsume(null, { map: true }), null);
  assert.equal(checkConsume(undefined, { map: true }), null);
  assert.equal(checkConsume({}, { map: true }), null);
  assert.equal(checkConsume({ fetches: 2, subsessions: 0, wallclock: 10, runtime: 0, mints: 0, surfaces: 0, proposals: 0 }, { map: true }), null);
  assert.equal(checkConsume({ fetches: Number.MAX_SAFE_INTEGER }, { map: true }), null);
  for (const shape of [[{ bound: "fetches", amount: 1 }], [], "fetches", 3, true])
    refusal(checkConsume(shape, { map: true }), "AI_RUN_BOUND_UNKNOWN");
  for (const k of ["fetchs", "", "Fetches", "toString"]) refusal(checkConsume({ [k]: 1 }, { map: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume(JSON.parse('{"__proto__": 1}'), { map: true }), "AI_RUN_BOUND_UNKNOWN");
  for (const v of [0, 1, -1, "1", null]) refusal(checkConsume({ lease: v }, { map: true }), "AI_RUN_BOUND_PLANE_COUNTED");
  for (const b of ["mints", "surfaces"]) refusal(checkConsume({ [b]: 1 }, { map: true }), "AI_RUN_BOUND_PLANE_COUNTED");
  for (const v of [-1, 1.5, "2", true, null, NaN, Infinity, 2 ** 53, [1], { n: 1 }]) {
    refusal(checkConsume({ fetches: v }, { map: true }), "AI_RUN_CONSUME_INVALID");
    refusal(checkConsume({ surfaces: v }, { map: true }), "AI_RUN_CONSUME_INVALID");
  }
  /* the open's list */
  assert.equal(checkConsume(null, { list: true }), null);
  assert.equal(checkConsume([], { list: true }), null);
  assert.equal(checkConsume([{ bound: "fetches", allowed: 3 }, { bound: "surfaces", allowed: 1, consumed: 0 },
                             { bound: "mints", allowed: 2, consumed: null }, { bound: "wallclock", allowed: 60000, consumed: 5 }], { list: true }), null);
  for (const shape of [{ fetches: 3 }, "fetches", 3]) refusal(checkConsume(shape, { list: true }), "AI_RUN_BOUND_UNKNOWN");
  for (const e of [["fetches", 3], null, 3, "fetches"]) refusal(checkConsume([e], { list: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume([{ allowed: 3 }], { list: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume([{ bound: "fetchs", allowed: 3 }], { list: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume([{ bound: "lease", allowed: 3 }], { list: true }), "AI_RUN_BOUND_PLANE_COUNTED");
  refusal(checkConsume([{ bound: "fetches" }], { list: true }), "AI_RUN_BOUND_NO_ALLOWANCE");
  refusal(checkConsume([{ bound: "fetches", allowed: null }], { list: true }), "AI_RUN_BOUND_NO_ALLOWANCE");
  refusal(checkConsume([{ bound: "fetches", allowed: 0 }], { list: true }), "AI_RUN_BOUND_NO_ALLOWANCE");
  for (const v of ["3", -1, 1.5, NaN, true]) refusal(checkConsume([{ bound: "fetches", allowed: v }], { list: true }), "AI_RUN_CONSUME_INVALID");
  refusal(checkConsume([{ bound: "fetches", allowed: 3, consumed: -1 }], { list: true }), "AI_RUN_CONSUME_INVALID");
  refusal(checkConsume([{ bound: "mints", allowed: 3, consumed: 1 }], { list: true }), "AI_RUN_BOUND_PLANE_COUNTED");
  /* the first refusal wins, in the order given, and it names its bound */
  assert.equal(checkConsume({ fetches: -1, nope: 1 }, { map: true }).code, "AI_RUN_CONSUME_INVALID");
  assert.equal(checkConsume({ nope: 1, fetches: -1 }, { map: true }).code, "AI_RUN_BOUND_UNKNOWN");
  assert.equal(checkConsume({ nope: 1 }, { map: true }).bound, "nope");
  /* never throws: options that are not an object are no options */
  for (const o of [null, 3]) assert.equal(checkConsume([["fetches", 1]], o), null);
});

test("R13: proposals is a bound after surfaces, counted by the plane — a caller's non-zero figure is AI_RUN_BOUND_PLANE_COUNTED, a zero claims nothing, and its declared allowance is uncapped here (control: an unknown bound is still AI_RUN_BOUND_UNKNOWN)", () => {
  const keys = Object.keys(RUN_BOUNDS);
  assert.equal(keys.indexOf("proposals"), keys.indexOf("surfaces") + 1);
  assert.deepEqual(PLANE_COUNTED_BOUNDS.slice(0, 3), ["mints", "surfaces", "proposals"]);
  assert.equal(runStatusFor("proposals"), "stopped");
  assert.equal(checkBound("proposals"), null);
  for (const v of [1, 5, 6]) {
    const r = refusal(checkConsume({ proposals: v }, { map: true }), "AI_RUN_BOUND_PLANE_COUNTED");
    assert.equal(r.bound, "proposals");
    refusal(checkConsume([{ bound: "proposals", allowed: 9, consumed: v }], { list: true }), "AI_RUN_BOUND_PLANE_COUNTED");
  }
  assert.equal(checkConsume({ proposals: 0 }, { map: true }), null);
  refusal(checkConsume({ proposals: -1 }, { map: true }), "AI_RUN_CONSUME_INVALID");
  /* the member declares the allowance at the open; no figure — five or any other — caps it */
  for (const allowed of [1, 5, 6, 1000]) assert.equal(checkConsume([{ bound: "proposals", allowed }], { list: true }), null, String(allowed));
  refusal(checkConsume([{ bound: "proposals", allowed: 0 }], { list: true }), "AI_RUN_BOUND_NO_ALLOWANCE");
  /* an exhausted proposals bound ends the run, after surfaces and before lease in the tie-break */
  assert.equal(finishedBound([{ bound: "proposals", allowed: 5, consumed: 5 }]), "proposals");
  assert.equal(finishedBound([{ bound: "proposals", allowed: 5, consumed: 5 }, { bound: "surfaces", allowed: 1, consumed: 1 }]), "surfaces");
  assert.equal(finishedBound([{ bound: "proposals", allowed: 5, consumed: 5 }], { expired: true }), "proposals");
  /* the caller-spendable bounds named in C-22.15's detail leave out every plane-counted and plane-decided bound */
  const detail = checkConsume({ nope: 1 }, { map: true }).detail;
  assert.match(detail, /fetches, subsessions, wallclock, runtime \(/);
  /* control */
  refusal(checkConsume({ proposal: 1 }, { map: true }), "AI_RUN_BOUND_UNKNOWN");
});

test("R4: finishedBound — an offered bound wins; else the first exhausted bound (allowed above 0, consumed at or past it) in R1's order; else lease when expired; else completed", () => {
  assert.equal(finishedBound([{ bound: "fetches", allowed: 1, consumed: 5 }], { offered: "cancelled", expired: true }), "cancelled");
  assert.equal(finishedBound([], { offered: "mode-not-deployed" }), "mode-not-deployed");
  /* every pair of bounds: the earlier in R1's order wins, whatever the rows' order */
  const order = BOUNDS.filter((b) => b !== "lease");
  for (let i = 0; i < order.length; i++) for (let j = i + 1; j < order.length; j++) {
    const rows = [{ bound: order[j], allowed: 1, consumed: 1 }, { bound: order[i], allowed: 2, consumed: 3 }];
    assert.equal(finishedBound(rows), order[i]);
    assert.equal(finishedBound(rows, { expired: true }), order[i], "an exhausted bound wins over the lease");
  }
  assert.equal(finishedBound([{ bound: "fetches", allowed: 0, consumed: 9 }]), "completed", "allowed 0 is no ceiling");
  assert.equal(finishedBound([{ bound: "fetches", allowed: 2, consumed: 1 }]), "completed", "not yet exhausted");
  assert.equal(finishedBound([{ bound: "fetches", allowed: 2, consumed: 1 }], { expired: true }), "lease");
  assert.equal(finishedBound([], {}), "completed");
  assert.equal(finishedBound(null), "completed");
  assert.equal(finishedBound(null, { offered: "" }), "completed");
  assert.equal(finishedBound([null, 3, { bound: "fetches" }]), "completed");
  for (const o of [null, 3, "x"]) assert.equal(finishedBound([], o), "completed", String(o));
});

test("R5: runPrincipalGate compares caller and principal with a member credential's /<tokenId> removed; equal and non-empty passes, anything else is AI_RUN_NOT_PRINCIPAL (C-22.12) naming the act", () => {
  assert.equal(runPrincipalOf("member:ann/tok1"), "member:ann");
  assert.equal(runPrincipalOf(" member:ann "), "member:ann");
  assert.equal(runPrincipalOf("class:ai/tok1"), "class:ai/tok1");
  assert.equal(runPrincipalOf(null), "");
  assert.equal(runPrincipalGate({ caller: "member:ann", principal: "member:ann" }), null);
  assert.equal(runPrincipalGate({ caller: "member:ann", principal: "member:ann/tok1" }), null);
  assert.equal(runPrincipalGate({ caller: "member:ann/tok2", principal: "member:ann/tok1" }), null);
  assert.equal(runPrincipalGate({ caller: "class:ai/tok1", principal: "class:ai/tok1" }), null);
  for (const [caller, principal] of [["class:ai/tok2", "class:ai/tok1"], ["member:bob", "member:ann"], ["", ""], [" ", " "],
                                     [null, "member:ann"], ["member:ann", null], [null, null], ["member:ann", "class:ai/tok1"]])
    refusal(runPrincipalGate({ caller, principal }), "AI_RUN_NOT_PRINCIPAL");
  const plain = runPrincipalGate({ caller: "member:bob", principal: "member:ann" });
  assert.equal(plain.check, "C-22.12");
  assert.match(plain.detail, /^ticking or closing a run is its principal's act/);
  const named = runPrincipalGate({ caller: "member:bob", principal: "member:ann", act: "opening a question under a run" });
  assert.match(named.detail, /^opening a question under a run is its principal's act/);
  /* never throws: a call with no object is refused, never thrown on */
  for (const x of [null, undefined, 3, "x"]) refusal(runPrincipalGate(x), "AI_RUN_NOT_PRINCIPAL");
  /* the detail names nobody */
  for (const r of [plain, named]) for (const who of ["ann", "bob"]) assert.equal(r.detail.includes(who), false);
});

test("R6: projectGate — no actor passes unapplied (NO_MEMBER_BEHIND_CALLER); an inquiry context passes unapplied (INQUIRY); a project context passes when the actor joined one of its projects (PARTICIPANT), else AI_RUN_NOT_PROJECT_MEMBER (C-22.8)", () => {
  assert.deepEqual(Object.keys(PROJECT_GATE_GROUNDS), ["NO_MEMBER_BEHIND_CALLER", "INQUIRY", "PARTICIPANT"]);
  for (const actor of [null, "", "  "]) {
    const none = projectGate({ actor, contextType: "project", contextId: "P", projects: ["P"] });
    assert.deepEqual([none.permitted, none.applied, none.ground, none.why], [true, false, "NO_MEMBER_BEHIND_CALLER", PROJECT_GATE_GROUNDS.NO_MEMBER_BEHIND_CALLER]);
  }
  for (const projectsJoined of [[], ["P"]]) {
    const inq = projectGate({ actor: "ann", contextType: "inquiry", contextId: "I", projects: ["P"], projectsJoined });
    assert.deepEqual([inq.permitted, inq.applied, inq.ground, inq.why], [true, false, "INQUIRY", PROJECT_GATE_GROUNDS.INQUIRY]);
  }
  const joined = projectGate({ actor: "ann", contextType: "project", contextId: "P", projects: ["P"], projectsJoined: ["P"] });
  assert.deepEqual([joined.permitted, joined.applied, joined.ground, joined.why], [true, true, "PARTICIPANT", PROJECT_GATE_GROUNDS.PARTICIPANT]);
  const out = refusal(projectGate({ actor: "ann", contextType: "project", contextId: "P-SECRET", projects: ["Q-HIDDEN"], projectsJoined: [] }), "AI_RUN_NOT_PROJECT_MEMBER");
  assert.equal(out.check, "C-22.8");
  assert.equal(out.permitted, undefined, "a refusal carries no second verdict field");
  assert.ok(out.detail.includes("project P-SECRET"), "the detail names only what the caller sent");
  assert.equal(out.detail.includes("Q-HIDDEN"), false, "the projects are never named");
  /* never throws: a call with no object has no actor behind it */
  for (const x of [null, undefined, 3]) assert.equal(projectGate(x).ground, "NO_MEMBER_BEHIND_CALLER");
  assert.equal(runConsultsProjects("project"), true);
  for (const k of ["inquiry", "", null, "Project", "information"]) assert.equal(runConsultsProjects(k), false, String(k));
});

test("R7: checkRunContextKind — a context type outside RUN_CONTEXTS, or a context whose held kind (an unseen one absent) differs, is AI_RUN_NO_SUCH_CONTEXT (C-22.11)", () => {
  assert.deepEqual(Object.keys(RUN_CONTEXTS), ["inquiry", "project"]);
  assert.equal(checkRunContextKind({ contextType: "inquiry", contextId: "I", found: "inquiry" }), null);
  assert.equal(checkRunContextKind({ contextType: "project", contextId: "P", found: "project" }), null);
  for (const [t, found] of [["Inquiry", "inquiry"], ["information", "information"], ["", "inquiry"], [null, "inquiry"],
                            ["__proto__", "__proto__"], ["inquiry", "project"], ["project", "inquiry"], ["inquiry", null],
                            ["project", undefined]])
    refusal(checkRunContextKind({ contextType: t, contextId: "X", found }), "AI_RUN_NO_SUCH_CONTEXT");
  assert.equal(checkRunContextKind({ contextType: "inquiry", found: "project" }).check, "C-22.11");
  const absent = checkRunContextKind({ contextType: "project", contextId: "P", found: null });
  const other = checkRunContextKind({ contextType: "project", contextId: "P", found: "inquiry" });
  assert.deepEqual(absent, other, "an absent, a hidden and a mismatched context are one answer");
  for (const x of [null, undefined, 3]) refusal(checkRunContextKind(x), "AI_RUN_NO_SUCH_CONTEXT");
});

test("R8: checkSkillVersion — a blank version, or one not <pack>@<edition>, is AI_RUN_SKILL_VERSION_UNNAMED (C-22.7), the detail quoting the value; any well-formed version is accepted, current pack or not", () => {
  for (const v of [null, undefined, "", "   ", 3, "3", "bio", "bio@", "@1", "bio@1@2", "bio @1", "bio@ 1", {}, ["bio@1"]])
    refusal(checkSkillVersion(v), "AI_RUN_SKILL_VERSION_UNNAMED");
  for (const v of ["bio@1", " bio@1 ", "someone-elses-pack@2026.1+abc", "x@y", "never-written@0"]) assert.equal(checkSkillVersion(v), null, v);
  assert.equal(checkSkillVersion(null).check, "C-22.7");
  /* converted from skillpack's R8 arm: the refusal's note quotes the value it refused */
  assert.match(checkSkillVersion("3").detail, /^'3' names no pack/);
  assert.match(checkSkillVersion(" bio @1 ").detail, /^'bio @1' names no pack/);
  assert.match(checkSkillVersion("").detail, /named no skill version/);
  assert.deepEqual(parseSkillVersion("bio@3+d1"), { pack: "bio", edition: "3", digest: "d1" });
  assert.deepEqual(parseSkillVersion(" bio@3 "), { pack: "bio", edition: "3", digest: null });
  for (const v of ["3", "", null]) assert.equal(parseSkillVersion(v), null);
  assert.equal(translationOf("AI_RUN_SKILL_VERSION_UNNAMED"), AI_RUN_CHECKS.AI_RUN_SKILL_VERSION_UNNAMED.translation);
});
