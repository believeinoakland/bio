/* ai-runs R1–R8, R35, R39: the run's vocabulary and pure rules, and the catalogue rows the module holds. */
import test from "node:test";
import assert from "node:assert/strict";
import { RUN_BOUNDS, RUN_ENDINGS, RUN_STATUS, RUN_NEVER_STARTED, runStatusFor, STANDARD_BASIS, RUN_CONTEXTS,
         checkBound, checkConsume, PLANE_COUNTED_BOUNDS, PLANE_DECIDED_BOUNDS, finishedBound, projectGate,
         PROJECT_GATE_GROUNDS, runConsultsProjects, checkRunContextKind, runPrincipalOf, runPrincipalGate,
         checkSkillVersion, parseSkillVersion, translationOf, AI_RUN_CHECKS } from "../../../src/airun.mjs";
import { AI_RUNS_CHECKS, AI_RUN_OWN_CHECKS, AI_RUN_ACT_SHAPE_CHECKS, AI_RUNS_CONTEXT_CHECKS, SURFACE_RUN_CHECKS,
         AI_RUN_OPEN_CHECKS, DEPLOYMENT_SEQUENCE, DEPLOYED_MODES } from "../../../src/ai-runs/index.mjs";
import * as CATALOGUE from "../../../checks/bio-checks.mjs";

const BOUNDS = ["fetches", "subsessions", "wallclock", "runtime", "mints", "surfaces", "lease"];
const ENDINGS = ["completed", "cancelled", "mode-not-deployed"];

/** A refusal built from its row: code, check, translation and a detail. */
function refusal(r, code) {
  assert.ok(r, `expected ${code}`);
  assert.equal(r.ok, false);
  assert.equal(r.code, code);
  assert.equal(r.check, AI_RUN_CHECKS[code].check);
  assert.equal(r.translation, AI_RUN_CHECKS[code].translation);
  assert.equal(typeof r.detail, "string");
}

test("R1: the bounds and endings are exactly the named ones, and runStatusFor keys every ending and bound", () => {
  assert.deepEqual(Object.keys(RUN_BOUNDS), BOUNDS);
  assert.deepEqual(Object.keys(RUN_ENDINGS), ENDINGS);
  assert.deepEqual(Object.keys(RUN_STATUS), ["running", "finished", "stopped", "never-started"]);
  assert.deepEqual(Object.keys(RUN_NEVER_STARTED), ["mode-not-deployed"]);
  for (const b of BOUNDS) assert.equal(runStatusFor(b), "stopped", b);
  assert.equal(runStatusFor("mode-not-deployed"), "never-started");
  assert.equal(runStatusFor("completed"), "finished");
  assert.equal(runStatusFor("cancelled"), "finished");
  for (const v of Object.values({ ...RUN_BOUNDS, ...RUN_ENDINGS })) assert.equal(typeof v, "string");
});

test("R2: checkBound passes every bound and ending and refuses anything else as AI_RUN_BOUND_UNNAMED (C-22.5)", () => {
  for (const b of [...BOUNDS, ...ENDINGS]) assert.equal(checkBound(b), null, b);
  for (const b of [null, undefined, "", " ", "fetch", "LEASE", "__proto__", "constructor", 3])
    refusal(checkBound(b), "AI_RUN_BOUND_UNNAMED");
  assert.equal(checkBound(null).check, "C-22.5");
});

test("R3: checkConsume — shape and unknown bound C-22.15, lease and a caller's non-zero mints/surfaces C-22.14, no allowance C-22.16, a bad figure C-22.13", () => {
  assert.deepEqual(PLANE_COUNTED_BOUNDS, ["mints", "surfaces"]);
  assert.deepEqual(PLANE_DECIDED_BOUNDS, ["lease"]);
  /* the tick's map */
  assert.equal(checkConsume(null, { map: true }), null);
  assert.equal(checkConsume({ fetches: 2, runtime: 0, mints: 0, surfaces: 0 }, { map: true }), null);
  refusal(checkConsume([{ bound: "fetches", amount: 1 }], { map: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume("fetches", { map: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume({ fetchs: 1 }, { map: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume(JSON.parse('{"__proto__": 1}'), { map: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume({ lease: 0 }, { map: true }), "AI_RUN_BOUND_PLANE_COUNTED");
  refusal(checkConsume({ mints: 1 }, { map: true }), "AI_RUN_BOUND_PLANE_COUNTED");
  refusal(checkConsume({ surfaces: -1 }, { map: true }), "AI_RUN_CONSUME_INVALID");
  for (const v of [-1, 1.5, "2", true, null, NaN, Infinity, 2 ** 53])
    refusal(checkConsume({ fetches: v }, { map: true }), "AI_RUN_CONSUME_INVALID");
  /* the open's list */
  assert.equal(checkConsume(null, { list: true }), null);
  assert.equal(checkConsume([{ bound: "fetches", allowed: 3 }, { bound: "surfaces", allowed: 1, consumed: 0 }], { list: true }), null);
  refusal(checkConsume({ fetches: 3 }, { list: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume([["fetches", 3]], { list: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume([null], { list: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume([{ allowed: 3 }], { list: true }), "AI_RUN_BOUND_UNKNOWN");
  refusal(checkConsume([{ bound: "lease", allowed: 3 }], { list: true }), "AI_RUN_BOUND_PLANE_COUNTED");
  refusal(checkConsume([{ bound: "fetches" }], { list: true }), "AI_RUN_BOUND_NO_ALLOWANCE");
  refusal(checkConsume([{ bound: "fetches", allowed: 0 }], { list: true }), "AI_RUN_BOUND_NO_ALLOWANCE");
  refusal(checkConsume([{ bound: "fetches", allowed: "3" }], { list: true }), "AI_RUN_CONSUME_INVALID");
  refusal(checkConsume([{ bound: "fetches", allowed: 3, consumed: -1 }], { list: true }), "AI_RUN_CONSUME_INVALID");
  refusal(checkConsume([{ bound: "mints", allowed: 3, consumed: 1 }], { list: true }), "AI_RUN_BOUND_PLANE_COUNTED");
  /* the first refusal wins, in the order given */
  assert.equal(checkConsume({ fetches: -1, nope: 1 }, { map: true }).code, "AI_RUN_CONSUME_INVALID");
});

test("R4: finishedBound — an offered bound wins, else the first exhausted bound in R1's order, else lease when expired, else completed", () => {
  assert.equal(finishedBound([{ bound: "fetches", allowed: 1, consumed: 5 }], { offered: "cancelled", expired: true }), "cancelled");
  const rows = [{ bound: "surfaces", allowed: 1, consumed: 1 }, { bound: "fetches", allowed: 2, consumed: 3 },
                { bound: "mints", allowed: 4, consumed: 4 }];
  assert.equal(finishedBound(rows), "fetches");
  assert.equal(finishedBound(rows, { expired: true }), "fetches", "an exhausted bound wins over the lease");
  assert.equal(finishedBound([{ bound: "fetches", allowed: 0, consumed: 9 }]), "completed", "allowed 0 is no ceiling");
  assert.equal(finishedBound([{ bound: "fetches", allowed: 2, consumed: 1 }], { expired: true }), "lease");
  assert.equal(finishedBound([], {}), "completed");
  assert.equal(finishedBound(null, { offered: "" }), "completed");
});

test("R5: runPrincipalGate compares with a member credential's /<tokenId> removed; equal and non-empty passes, else AI_RUN_NOT_PRINCIPAL naming the act", () => {
  assert.equal(runPrincipalOf("member:ann/tok1"), "member:ann");
  assert.equal(runPrincipalOf("class:ai/tok1"), "class:ai/tok1");
  assert.equal(runPrincipalGate({ caller: "member:ann", principal: "member:ann/tok1" }), null);
  assert.equal(runPrincipalGate({ caller: "member:ann/tok2", principal: "member:ann/tok1" }), null);
  assert.equal(runPrincipalGate({ caller: "class:ai/tok1", principal: "class:ai/tok1" }), null);
  refusal(runPrincipalGate({ caller: "class:ai/tok2", principal: "class:ai/tok1" }), "AI_RUN_NOT_PRINCIPAL");
  refusal(runPrincipalGate({ caller: "member:bob", principal: "member:ann" }), "AI_RUN_NOT_PRINCIPAL");
  refusal(runPrincipalGate({ caller: "", principal: "" }), "AI_RUN_NOT_PRINCIPAL");
  refusal(runPrincipalGate({ caller: " ", principal: " " }), "AI_RUN_NOT_PRINCIPAL");
  refusal(runPrincipalGate({ caller: null, principal: "member:ann" }), "AI_RUN_NOT_PRINCIPAL");
  const named = runPrincipalGate({ caller: "member:bob", principal: "member:ann", act: "opening a question under a run" });
  assert.match(named.detail, /^opening a question under a run is its principal's act/);
  assert.equal(named.check, "C-22.12");
});

test("R6: projectGate — no actor passes unapplied, an inquiry passes unapplied, a joined project passes, else AI_RUN_NOT_PROJECT_MEMBER (C-22.8)", () => {
  const none = projectGate({ actor: "", contextType: "project", contextId: "P", projects: ["P"] });
  assert.deepEqual([none.permitted, none.applied, none.ground, none.why], [true, false, "NO_MEMBER_BEHIND_CALLER", PROJECT_GATE_GROUNDS.NO_MEMBER_BEHIND_CALLER]);
  const inq = projectGate({ actor: "ann", contextType: "inquiry", contextId: "I", projects: ["P"], projectsJoined: [] });
  assert.deepEqual([inq.permitted, inq.applied, inq.ground], [true, false, "INQUIRY"]);
  const joined = projectGate({ actor: "ann", contextType: "project", contextId: "P", projects: ["P"], projectsJoined: ["P"] });
  assert.deepEqual([joined.permitted, joined.applied, joined.ground], [true, true, "PARTICIPANT"]);
  const out = projectGate({ actor: "ann", contextType: "project", contextId: "P", projects: ["P"], projectsJoined: [] });
  refusal(out, "AI_RUN_NOT_PROJECT_MEMBER");
  assert.equal(out.check, "C-22.8");
  assert.equal(runConsultsProjects("project"), true);
  assert.equal(runConsultsProjects("inquiry"), false);
});

test("R7: checkRunContextKind — a type outside RUN_CONTEXTS, or a held kind that differs (an unseen one absent), is AI_RUN_NO_SUCH_CONTEXT (C-22.11)", () => {
  assert.deepEqual(Object.keys(RUN_CONTEXTS), ["inquiry", "project"]);
  assert.equal(checkRunContextKind({ contextType: "inquiry", contextId: "I", found: "inquiry" }), null);
  assert.equal(checkRunContextKind({ contextType: "project", contextId: "P", found: "project" }), null);
  for (const [t, found] of [["Inquiry", "inquiry"], ["information", "information"], ["", "inquiry"],
                            ["inquiry", "project"], ["project", "inquiry"], ["inquiry", null], ["project", undefined]])
    refusal(checkRunContextKind({ contextType: t, contextId: "X", found }), "AI_RUN_NO_SUCH_CONTEXT");
  const absent = checkRunContextKind({ contextType: "project", contextId: "P", found: null });
  const other = checkRunContextKind({ contextType: "project", contextId: "P", found: "inquiry" });
  assert.deepEqual(absent, other, "an absent, a hidden and a mismatched context are one answer");
});

test("R8: checkSkillVersion — blank or not <pack>@<edition> is AI_RUN_SKILL_VERSION_UNNAMED (C-22.7); any well-formed version passes", () => {
  for (const v of [null, undefined, "", "   ", 3, "3", "bio", "bio@", "@1", "bio@1@2", "bio @1", "bio@ 1"])
    refusal(checkSkillVersion(v), "AI_RUN_SKILL_VERSION_UNNAMED");
  for (const v of ["bio@1", " bio@1 ", "someone-elses-pack@2026.1+abc", "x@y"]) assert.equal(checkSkillVersion(v), null, v);
  assert.deepEqual(parseSkillVersion("bio@3+d1"), { pack: "bio", edition: "3", digest: "d1" });
  assert.deepEqual(parseSkillVersion("bio@3"), { pack: "bio", edition: "3", digest: null });
  assert.equal(parseSkillVersion("3"), null);
  assert.equal(translationOf("AI_RUN_SKILL_VERSION_UNNAMED"), AI_RUN_CHECKS.AI_RUN_SKILL_VERSION_UNNAMED.translation);
  assert.equal(translationOf("NOT_A_CODE"), null);
});

test("R35: every check the module owns is one row here (C-22.7 named from the catalogue, where skills claims it), with its C-number, translation and a site in this module, and not a second copy in the catalogue", () => {
  const ids = Object.values(AI_RUNS_CHECKS).map((r) => r.check).sort();
  const want = ["C-22.5", "C-22.8", "C-22.11", "C-22.12", "C-22.13", "C-22.14", "C-22.15", "C-22.16",
                "C-33.29", "C-33.30", "C-33.31", "C-33.45", "C-33.46", "C-33.47", "C-36.1", "C-36.2", "C-36.3",
                "C-66.1", "C-66.2", "C-66.3", "C-66.4", "C-109.1"].sort();
  assert.deepEqual(ids, want);
  for (const [code, row] of Object.entries(AI_RUNS_CHECKS)) {
    assert.ok(typeof row.translation === "string" && row.translation.length > 20, code);
    assert.match(row.where, /^src\/(ai-runs\/|airun\.mjs)/, code);
    assert.equal(AI_RUN_CHECKS[code] === undefined || AI_RUN_CHECKS[code] === row, true, code);
  }
  /* the families as the module publishes them */
  assert.deepEqual(Object.keys(AI_RUNS_CONTEXT_CHECKS), ["AI_RUNS_NO_CONTEXT_TYPE", "AI_RUNS_UNKNOWN_CONTEXT_TYPE", "AI_RUNS_NO_CONTEXT_ID"]);
  assert.deepEqual(Object.keys(SURFACE_RUN_CHECKS), ["SURFACE_NO_RUN", "SURFACE_RUN_NOT_RUNNING", "SURFACE_NO_BOUND", "SURFACE_BOUND_REACHED"]);
  assert.deepEqual(Object.keys(AI_RUN_OPEN_CHECKS), ["AI_RUN_MODE_NOT_DEPLOYED"]);
  assert.equal(Object.keys(AI_RUN_ACT_SHAPE_CHECKS).length, 6);
  /* airun.mjs's AI_RUN_CHECKS carries the run's rows and the observation log's, one object */
  for (const code of Object.keys(AI_RUN_OWN_CHECKS)) assert.equal(AI_RUN_CHECKS[code], AI_RUN_OWN_CHECKS[code]);
  /* one copy: the catalogue holds none of them any more */
  const catalogue = Object.entries(CATALOGUE).filter(([k, v]) => /_CHECKS$/.test(k) && v && typeof v === "object")
    .flatMap(([, fam]) => Object.values(fam)).filter((r) => r && typeof r.check === "string").map((r) => r.check);
  for (const id of want) assert.equal(catalogue.includes(id), false, `${id} is still in the catalogue`);
  /* C-22.7: named, not held — the catalogue keeps the row skills claims (its R25), and checkSkillVersion builds from it */
  assert.equal(catalogue.filter((c) => c === "C-22.7").length, 1);
  assert.equal(checkSkillVersion("3").translation, CATALOGUE.AI_RUN_CHECKS.AI_RUN_SKILL_VERSION_UNNAMED.translation);
  assert.equal(AI_RUN_CHECKS.AI_RUN_SKILL_VERSION_UNNAMED, CATALOGUE.AI_RUN_CHECKS.AI_RUN_SKILL_VERSION_UNNAMED);
});

test("R39: no place is named in the module's outward text — its rows' translations, its vocabularies' sentences, its refusals' details, the deployment order's text", () => {
  const PLACE = /oakland|alameda|california|berkeley|san francisco|\bcounty of\b/i;
  const texts = [
    ...Object.values(AI_RUNS_CHECKS).map((r) => r.translation),
    ...Object.values(RUN_BOUNDS), ...Object.values(RUN_ENDINGS), ...Object.values(STANDARD_BASIS),
    ...Object.values(RUN_CONTEXTS), ...Object.values(PROJECT_GATE_GROUNDS),
    checkBound("x").detail, checkConsume({ x: 1 }, { map: true }).detail, checkSkillVersion("3").detail,
    projectGate({ actor: "a", contextType: "project", contextId: "P" }).detail,
    checkRunContextKind({ contextType: "x" }).detail, runPrincipalGate({}).detail,
    JSON.stringify(DEPLOYMENT_SEQUENCE),
  ];
  for (const t of texts) assert.equal(PLACE.test(String(t)), false, String(t).slice(0, 80));
  assert.deepEqual(DEPLOYED_MODES, [DEPLOYMENT_SEQUENCE.order[0]]);
});
