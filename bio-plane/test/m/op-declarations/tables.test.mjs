/* op-declarations: the tables (R2–R6), read as they are exported. The act gate (R1) and the module's purity (R5, R7)
   are `gate.test.mjs`'s and `purity.test.mjs`'s. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as O from "../../../src/op-declarations/index.mjs";

const { OPS, SESSION_OPS, NEEDS, UNATTENDED_BY_DECISION, PLAN_RUN_SCOPE } = O;
const BINDING_CLASSES = ["admin", "member", "probe", "daemon"];
/* Membership §5's working capabilities (membership's vocabulary; `view` gates nothing, so no op needs it). */
const CAPABILITIES = ["contribute", "publish", "create_projects"];
const LISTS = Object.entries(O).filter(([, v]) => Array.isArray(v));
const both = (op) => SESSION_OPS.member.has(op) && SESSION_OPS.admin.has(op);
const inSession = (op) => SESSION_OPS.member.has(op) || SESSION_OPS.admin.has(op);
const named = (k) => O[k];

test("R2: OPS maps every op to a well-formed spec {classes, machineClasses?, mutating}: classes null (public) or a list of binding classes and session kinds, machineClasses within classes, and no spec names ai", () => {
  const ops = Object.keys(OPS);
  assert.ok(ops.length >= 370, `${ops.length} specs`);
  for (const op of ops) {
    const s = OPS[op];
    assert.equal(Object.getPrototypeOf(s), Object.prototype, op);
    assert.deepEqual(Object.keys(s).filter((k) => !["classes", "machineClasses", "mutating"].includes(k)), [], op);
    assert.equal(typeof s.mutating, "boolean", op);
    if (s.classes !== null) {
      assert.ok(Array.isArray(s.classes) && s.classes.length > 0, op);
      assert.equal(new Set(s.classes).size, s.classes.length, op);
      for (const c of s.classes) assert.ok(BINDING_CLASSES.includes(c), `${op}: ${c}`);
    }
    if ("machineClasses" in s) {
      assert.ok(Array.isArray(s.classes) && Array.isArray(s.machineClasses), op);
      assert.equal(new Set(s.machineClasses).size, s.machineClasses.length, op);
      for (const c of s.machineClasses) assert.ok(s.classes.includes(c), `${op}: ${c}`);
    }
    /* No spec names `ai`, anywhere in it: an agent credential is admitted by its task scope alone. */
    assert.ok(!JSON.stringify(s).includes('"ai"'), `${op} names ai`);
  }
  /* The public surface is exactly the ops that gate themselves. */
  assert.deepEqual(ops.filter((op) => OPS[op].classes === null).sort(),
    ["bootstrap", "casedocument", "caseflags", "claim", "enroll", "groupidentity", "instancegroup", "invitelook", "knock",
     "knockerconsent", "login", "publishedbytes", "publishedcase", "publishedmanifest", "reviewcomment", "reviewcopy",
     "statementack", "verify"]);
  /* Inherited names are no op. */
  for (const k of ["toString", "constructor", "__proto__", "hasOwnProperty"]) assert.ok(!Object.hasOwn(OPS, k), k);
});

test("R2 (daemon-token convert): exactly four ops admit daemon — acquire, capturerequestdrain, monitor, reevaluationraise — over the exported OPS", () => {
  const daemon = Object.keys(OPS).filter((op) => Array.isArray(OPS[op].classes) && OPS[op].classes.includes("daemon"));
  assert.deepEqual(daemon.sort(), ["acquire", "capturerequestdrain", "monitor", "reevaluationraise"]);
  for (const op of daemon) {
    assert.equal(OPS[op].mutating, true, op);
    assert.ok(!("machineClasses" in OPS[op]), op);
  }
});

test("R3: SESSION_OPS is {member, admin}, two sets of op names each with a spec; every mutating op a session reaches has a NEEDS row and every NEEDS row is an op a session reaches, naming one capability or null", () => {
  assert.deepEqual(Object.keys(SESSION_OPS).sort(), ["admin", "member"]);
  for (const kind of ["member", "admin"]) {
    const set = SESSION_OPS[kind];
    assert.equal(typeof set.has, "function");
    assert.equal([...set].length, set.size);
    for (const op of set) assert.ok(Object.hasOwn(OPS, op), `${kind}: ${op} has no spec`);
    for (const op of set) assert.ok(OPS[op].classes !== null && OPS[op].classes.includes(kind === "admin" ? "admin" : "member"),
      `${kind}: ${op}'s classes do not admit a ${kind} session`);
  }
  /* The founder's set holds every member act and adds only the founder's own. */
  assert.deepEqual([...SESSION_OPS.admin].filter((op) => !SESSION_OPS.member.has(op)).sort(), ["governorconfig"]);
  assert.deepEqual([...SESSION_OPS.member].filter((op) => !SESSION_OPS.admin.has(op)).sort(), []);
  for (const [op, need] of Object.entries(NEEDS)) {
    assert.ok(Object.hasOwn(OPS, op), `${op} has no spec`);
    assert.ok(need === null || CAPABILITIES.includes(need), `${op}: ${need}`);
    const reached = inSession(op) || (!OPS[op].mutating && Array.isArray(OPS[op].classes)
      && (OPS[op].classes.includes("member") || OPS[op].classes.includes("admin")));
    assert.ok(reached, `${op} is in NEEDS and no session reaches it`);
  }
  for (const op of new Set([...SESSION_OPS.member, ...SESSION_OPS.admin]))
    if (OPS[op].mutating) assert.ok(Object.hasOwn(NEEDS, op), `${op}: a session reaches this mutating op and NEEDS has no row`);
  /* An op with no row needs nothing: the act gate answers null for it (R1). */
  assert.equal(O.ACT_GATE.needs("search"), null);
  assert.ok(!Object.hasOwn(NEEDS, "search"));
});

test("R3: UNATTENDED_BY_DECISION maps only ops no session reaches, each to the citation of the recorded decision, and holds no op without one", () => {
  const ops = Object.keys(UNATTENDED_BY_DECISION);
  assert.deepEqual(ops.sort(), ["capturerequestdrain", "cpuprobe", "instancegroupseed", "livefire", "purge",
                                "reevaluationraise", "reproject", "taskdrain"]);
  for (const op of ops) {
    assert.ok(Object.hasOwn(OPS, op), op);
    assert.equal(OPS[op].mutating, true, op);
    assert.ok(!inSession(op), `${op} is reached by a session`);
    const cite = UNATTENDED_BY_DECISION[op];
    assert.equal(typeof cite, "string", op);
    assert.ok(cite.trim().length > 40, `${op}: ${cite}`);
  }
  /* A citation names where the decision was recorded, and keeps its words when the table moves. */
  assert.match(UNATTENDED_BY_DECISION.cpuprobe, /^src\/control-plane\/ops\.mjs, op=cpuprobe's OPS row/);
});

test("R3 (rec155-session-routes, versionstate, members converts): §4.10's five in both session sets riding contribute, livefire and reproject unattended by decision, the six version acts contribute, select/selection/selectionlist in the member session set", () => {
  for (const op of ["provenancechain", "provenanceroute", "calibrate", "calibrationsubject", "calibrationsignal"]) {
    assert.ok(both(op), op);
    assert.equal(NEEDS[op], "contribute", op);
    assert.ok(OPS[op].classes.includes("probe") && OPS[op].mutating, op);
  }
  assert.deepEqual([...named("PROVENANCE_JUDGEMENT_ACTIONS")], ["provenancechain", "provenanceroute"]);
  assert.deepEqual([...named("CALIBRATION_WRITE_ACTIONS")], ["calibrate", "calibrationsubject", "calibrationsignal"]);
  for (const op of ["livefire", "reproject"]) {
    assert.match(UNATTENDED_BY_DECISION[op], /§4\.10 \(BOB #19\)/, op);
    assert.ok(!inSession(op), op);
  }
  for (const op of ["versionaccept", "versionreject", "versionconsider", "versionrevert", "versioncurrent", "versionhide"]) {
    assert.equal(NEEDS[op], "contribute", op);
    assert.ok(both(op) && named("VERSION_ACTIONS").includes(op), op);
  }
  assert.equal(named("VERSION_ACTIONS").length, 6);
  for (const op of ["select", "selection", "selectionlist"]) assert.ok(SESSION_OPS.member.has(op), op);
  /* governorconfig is the founder's session's alone. */
  assert.ok(SESSION_OPS.admin.has("governorconfig") && !SESSION_OPS.member.has("governorconfig"));
});

test("R4: every act list is a list of distinct op names, each with a spec; the composed lists are exactly their parts; the bearer fences' lists reach both session sets", () => {
  assert.ok(LISTS.length >= 55, `${LISTS.length} lists`);
  for (const [name, list] of LISTS) {
    assert.ok(list.length > 0, name);
    assert.equal(new Set(list).size, list.length, `${name} repeats an op`);
    for (const op of list) assert.ok(Object.hasOwn(OPS, op), `${name}: ${op} has no spec`);
  }
  const eqSet = (a, b, what) => assert.deepEqual([...new Set(a)].sort(), [...new Set(b)].sort(), what);
  eqSet(O.QUERY_AUTHOR_ACTIONS, [...O.CONFORMANCE_ACTIONS, ...O.CONSEQUENCES_ACTIONS, ...O.FILINGS_ACTIONS, ...O.ESCALATION_ACTIONS,
    ...O.ACTIONS_ACTIONS, ...O.ACTION_CLOCKS_ACTIONS, ...O.ACTION_PLANS_ACTIONS], "QUERY_AUTHOR_ACTIONS");
  eqSet(O.ACTION_LAYER_ACTIONS, [...O.STANDARDS_ACTIONS, ...O.QUERY_AUTHOR_ACTIONS, ...O.PLAN_PROPOSAL_ACTIONS], "ACTION_LAYER_ACTIONS");
  eqSet(O.ACTION_LAYER_READS, [...O.STANDARDS_READS, ...O.CONFORMANCE_READS, ...O.CONSEQUENCES_READS, ...O.FILINGS_READS,
    ...O.ESCALATION_READS, ...O.ACTIONS_READS, ...O.ACTION_PLANS_READS], "ACTION_LAYER_READS");
  /* A list named for acts holds mutating ops, one named for reads non-mutating ones. */
  for (const [name, list] of LISTS) {
    if (/_READS$/.test(name)) for (const op of list) assert.equal(OPS[op].mutating, false, `${name}: ${op}`);
    if (/_ACTIONS$/.test(name) && !["REGISTRY_ACTIONS", "RECOGNISER_ACTIONS", "PROGRESSION_ACTIONS"].includes(name))
      for (const op of list) assert.equal(OPS[op].mutating, true, `${name}: ${op}`);
  }
  /* The three sets a member reads AND writes through are named whole (their reads keyed on an entity, not the corpus). */
  for (const name of ["REGISTRY_ACTIONS", "RECOGNISER_ACTIONS", "PROGRESSION_ACTIONS"])
    assert.ok(named(name).some((op) => OPS[op].mutating) && named(name).some((op) => !OPS[op].mutating), name);
  /* The bearer fences' subjects (GOVERNANCE_ACTIONS, IDENTITY_ACTIONS) are a named administrator's own session acts. */
  assert.deepEqual([...O.GOVERNANCE_ACTIONS], ["adminendorse", "adminremove", "membercaps"]);
  assert.deepEqual([...O.IDENTITY_ACTIONS], ["groupnameset", "groupdomainset"]);
  for (const op of [...O.GOVERNANCE_ACTIONS, ...O.IDENTITY_ACTIONS]) assert.ok(both(op) && OPS[op].mutating, op);
  /* The custodial acts keep every bearer but the operator's two classes out by `machineClasses`. */
  for (const op of O.CUSTODIAL_ACTIONS) assert.deepEqual([...OPS[op].machineClasses], ["admin", "probe"], op);
  for (const op of O.OWN_KEY_ACTIONS) assert.deepEqual([...OPS[op].machineClasses], [], op);
});

test("R3, R4 (transcribe convert): transcribe and transcriptionattest are a person's acts — both session sets, admin and member classes only, contribute — with the read beside them open", () => {
  for (const op of ["transcribe", "transcriptionattest"]) {
    assert.deepEqual([...OPS[op].classes], ["admin", "member"], op);
    assert.equal(OPS[op].mutating, true, op);
    assert.ok(both(op), op);
    assert.equal(NEEDS[op], "contribute", op);
  }
  assert.equal(OPS.transcription.mutating, false);
  assert.ok(OPS.transcription.classes.includes("probe"));
  assert.equal(NEEDS.transcription, null);
});

test("R4, R3 (N-A12, K704, K709, K711, K705): the action layer's new ops — action-plans' fifteen, actions' four, action-clocks' two, filings' three — each declared with its spec, its list, both session sets for an act and its capability", () => {
  const acts = {
    ACTION_PLANS_ACTIONS: ["planopen", "plansubjectadd", "plansubjectremove", "optionadd", "optionrevise", "optionadopt",
                           "optiondispose", "scenarioset", "checkpointrecord", "optionstart", "planclose"],
    PLAN_PROPOSAL_ACTIONS: ["optionpropose"],
    ACTIONS_ACTIONS: ["actioncreate", "actionpressure"],
    ACTION_CLOCKS_ACTIONS: ["reminderset", "reminderanswer"],
  };
  const reads = { ACTION_PLANS_READS: ["plan", "plans", "planproposals"], ACTIONS_READS: ["action", "actions"] };
  for (const [name, list] of [...Object.entries(acts), ...Object.entries(reads)]) assert.deepEqual([...named(name)], list, name);
  /* action-plans' ops are exactly `actionPlansOps`' fifteen (action-plans R1–R34, K711). */
  assert.equal([...acts.ACTION_PLANS_ACTIONS, ...acts.PLAN_PROPOSAL_ACTIONS, ...reads.ACTION_PLANS_READS].length, 15);
  for (const op of ["communicationprepare", "templatesave"]) assert.ok(O.FILINGS_ACTIONS.includes(op), op);
  assert.ok(O.FILINGS_READS.includes("templates"));
  const allActs = [...Object.values(acts).flat(), "communicationprepare", "templatesave"];
  for (const op of allActs) {
    /* A machine reaches each and its module refuses it by name or labels it (conclude's posture). */
    assert.deepEqual([...OPS[op].classes], ["admin", "member", "probe"], op);
    assert.ok(!("machineClasses" in OPS[op]), op);
    assert.equal(OPS[op].mutating, true, op);
    assert.ok(both(op), op);
    assert.ok(O.ACTION_LAYER_ACTIONS.includes(op), op);
    assert.equal(NEEDS[op], ["reminderset", "reminderanswer"].includes(op) ? null : "contribute", op);
    assert.ok(Object.hasOwn(NEEDS, op), op);
  }
  /* Every act but the proposal reads `author` from the query; the proposal's stamp is its proposer. */
  for (const op of allActs) assert.equal(O.QUERY_AUTHOR_ACTIONS.includes(op), op !== "optionpropose", op);
  for (const op of [...Object.values(reads).flat(), "templates"]) {
    assert.deepEqual([...OPS[op].classes], ["admin", "member", "probe"], op);
    assert.equal(OPS[op].mutating, false, op);
    assert.ok(O.ACTION_LAYER_READS.includes(op), op);
    assert.ok(!Object.hasOwn(NEEDS, op), op);
  }
});

test("R2, R4 (K660, K683): a plan-mode run's agent credential scope — the reads plan, plans and agent-worker R51's, the writes optionpropose, airuntick and airunclose — each reachable by an agent credential: it admits member, carries no machineClasses, and is no bearer-fenced act", () => {
  assert.deepEqual([...PLAN_RUN_SCOPE.reads], ["plan", "plans", "determination", "standard", "consequencesof",
                                               "availableactions", "publishededitions", "profiles"]);
  assert.deepEqual([...PLAN_RUN_SCOPE.writes], ["optionpropose", "airuntick", "airunclose"]);
  const reachable = (op) => Array.isArray(OPS[op].classes) && OPS[op].classes.includes("member")
    && !Array.isArray(OPS[op].machineClasses) && !O.GOVERNANCE_ACTIONS.includes(op) && !O.IDENTITY_ACTIONS.includes(op);
  for (const op of PLAN_RUN_SCOPE.reads) {
    assert.ok(reachable(op), op);
    assert.equal(OPS[op].mutating, false, `${op}: a read needs no declared write`);
  }
  for (const op of PLAN_RUN_SCOPE.writes) {
    assert.ok(reachable(op), op);
    assert.equal(OPS[op].mutating, true, `${op}: a write is declared`);
  }
  /* Control: an op no agent can be scoped to is not reachable by this shape. */
  assert.equal(reachable("capturerequestdrain"), false);
  assert.equal(reachable("signerregister"), false);
  assert.equal(reachable("adminendorse"), false);
});

test("R6: an op spec for every op the tables name — the session sets, NEEDS, the unattended decisions, every act list and the plan-run scope — and every spec's op is one the door can answer by name", () => {
  const namedOps = new Set([...SESSION_OPS.member, ...SESSION_OPS.admin, ...Object.keys(NEEDS),
                            ...Object.keys(UNATTENDED_BY_DECISION), ...PLAN_RUN_SCOPE.reads, ...PLAN_RUN_SCOPE.writes]);
  for (const [, list] of LISTS) list.forEach((op) => namedOps.add(op));
  for (const op of namedOps) assert.ok(Object.hasOwn(OPS, op), `${op} has no spec`);
  /* A spec's key is an op name the door can be asked for: lower-case letters, nothing that is a path or a parameter. */
  for (const op of Object.keys(OPS)) assert.match(op, /^[a-z]+$/, op);
  /* The ops the T18 modules serve (action-plans, actions, action-clocks, filings) each have a spec — the ones that had
     none before this module (N-A12, K704, K705, K709, K711). */
  for (const op of ["planopen", "plansubjectadd", "plansubjectremove", "plan", "plans", "optionadd", "optionrevise",
                    "optionpropose", "optionadopt", "optiondispose", "scenarioset", "checkpointrecord", "optionstart",
                    "planclose", "planproposals", "actioncreate", "action", "actions", "actionpressure", "reminderset",
                    "reminderanswer", "communicationprepare", "templatesave", "templates"])
    assert.ok(Object.hasOwn(OPS, op), op);
});
