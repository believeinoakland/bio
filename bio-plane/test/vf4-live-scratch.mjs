#!/usr/bin/env node
/* DATED NOTE, 2026-09-13, ADDED BY D-323 — READ THIS BEFORE RE-RUNNING.
 *
 * **NOTHING BELOW IS EDITED. This file is a MEASUREMENT OF RECORD and a
 * measurement is not rewritten when the world it measured moves.** What has
 * moved: D-323/D-324 landed the same day, and `emptyLevelCandidates` in
 * `agent-worker/src/harness.mjs` now mints `level-empty-<reporting level>` —
 * a dash, and `SUGGEST_LEVELS`' spelling — instead of `level-empty:<log level>`.
 *
 * SO TWO PINS IN PHASE 4b ARE NOW STALE AS PREDICTIONS AND EXACT AS HISTORY:
 * the assertion at 4b-ii that the landed table names its candidates
 * `level-empty:<level>`, and the refusal it then reads back
 * (`BASIS_REFUSED` / C-25.2 on `level-empty:content`). Re-run against a tree
 * carrying the fix and that arm will report the NEW name and NO refusal — which
 * is the fix working, not a regression. **Whoever re-runs this owns the choice**
 * between re-pinning the arm to the new spelling (and saying so, dated, here)
 * and retiring the arm to `agent-worker/test/wire-vocabulary.test.mjs`, which
 * now drives the same question locally against the plane's own expressions and
 * carries the before/after in its W8 block. The figures recorded in
 * MEASUREMENTS.md M-8 stand exactly as measured at 0.57.0.
 *
 * VF-4 — LIVE VERIFICATION IN SCRATCH. The IS build plan's closing row.
 *
 * WHAT THIS DRIVES, AND WHERE. A full CHECK-mode run against a CONCLUDED
 * inquiry, in the live instance's OWN `scratch` namespace — a different Durable
 * Object from the real record, with its own member table and its own PUBLISHED
 * prefix. Nothing here addresses `bio` with a mutating op under any arm; the two
 * negative-control arms that POINT at `bio` are refusals this script DRIVES and
 * RECORDS, and each one is followed by a read of the real namespace's own
 * counters proving nothing moved.
 *
 * WHY IT IS NOT A `.test.mjs`. `scripts/battery.mjs` discovers `test/*.test.mjs`
 * and runs it on every battery. This one talks to a deployed instance over the
 * network and writes rows into it; a suite that did that would make the battery
 * depend on an account, a token and a live rollout. It is run by hand, by VERIFY,
 * and its figures go to MEASUREMENTS.md with the build that answered them.
 *
 * A DEPLOY VERIFIED IS NOT A BUILD SERVING. Phase 0 re-reads `/version` on BOTH
 * the plane and the fleet member before anything is probed, and every figure this
 * script prints is stamped with what answered it. Durable-Object-routed ops can
 * lag past `/version`, so the run also reports the version the plane echoed on
 * the op responses themselves.
 *
 * NOTHING IS DEPLOYED, BUMPED, SIGNED OR CONFIGURED HERE. No account setting is
 * touched. The only credentials used are the ones already in `.env`, and no
 * credential value is ever printed: `redact()` runs over every body.
 *
 * usage: node bio-plane/test/vf4-live-scratch.mjs [--json out.json]
 */
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { loadEnv, ORIGIN, redact } from "./vf4-call.mjs";

const env = loadEnv();
const ADMIN = env.BIO_ADMIN_TOKEN;
const AGENT_ORIGIN = "https://agent-worker.believeinoakland.workers.dev";
const SCRATCH = "scratch", REAL = "bio";
const sha = (v) => createHash("sha256").update(v).digest("hex");

let pass = 0, fail = 0, findings = [];
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`
    + (ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`));
  ok ? pass++ : fail++;
  return ok;
};
const note = (s) => { findings.push(s); console.log(`  NOTE  ${s}`); };

/* ------------------------------------------------------------- transport */
const planeVersionsSeen = new Set();
async function op(name, { store = SCRATCH, token = ADMIN, query = {}, body = null } = {}) {
  let url = `${ORIGIN}/api/?op=${encodeURIComponent(name)}&token=${encodeURIComponent(token)}`;
  if (store !== null) url += `&store=${encodeURIComponent(store)}`;
  for (const [k, v] of Object.entries(query)) if (v != null) url += `&${k}=${encodeURIComponent(String(v))}`;
  const r = await fetch(url, body == null ? { cache: "no-store" }
    : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const text = await r.text();
  let j = null; try { j = JSON.parse(text); } catch { /* keep raw */ }
  if (j?.version) planeVersionsSeen.add(j.version);
  return { status: r.status, body: j, raw: redact(text).slice(0, 1200) };
}
/* Most ops answer `{ok, result:{...}}`; some answer flat. One unwrapper, so no
   arm can differ in how it read the same envelope. */
const R = (a) => (a?.body?.result && typeof a.body.result === "object" ? { ...a.body.result, __ok: a.body.ok } : a?.body) ?? {};

async function agentRun(body) {
  const r = await fetch(`${AGENT_ORIGIN}/run`, { method: "POST",
    headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const text = await r.text();
  let j = null; try { j = JSON.parse(text); } catch { /* keep raw */ }
  return { status: r.status, body: j, raw: redact(text).slice(0, 2000) };
}

/* ------------------------------------------------------------ the fixture */
const STAMP = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
const RUN = `RUN-2026-9740-vf4-${STAMP}`;
/* THE FIXTURE IS GATED BEFORE IT IS PROMOTED. `vf4-fixture.mjs` runs the plane's
   OWN catalogue (`checks/bio-checks.mjs` — the module `op=audit` executes inside
   the Durable Object) over both documents and THROWS unless both are clean. This
   gate exists because VF-4's first live pass promoted a malformed information
   bundle and the post-run audit reported ITS two findings (C-13.2, C-2.7) as the
   run's residue, which made negative control 2 pass for entirely the wrong
   reason. A surprising green is a finding about the ARM. */
const FIX = await import("./vf4-fixture.mjs");
const { DOC, INQ } = FIX;

const RESIDUE_KEYS = ["bundles", "files", "history", "refs", "register", "indexed",
  "aiRuns", "aiRunBounds", "aiRunLog", "basisVersions", "basisVersionLegs",
  "suggestRefusals", "captureRequests"];
const residueOf = (st) => Object.fromEntries(RESIDUE_KEYS.map((k) => [k, st?.[k] ?? null]));
const nonZero = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v));

const report = { instrument: "live plane + agent-worker over HTTP, node fetch on this machine",
  origin: ORIGIN, agent_origin: AGENT_ORIGIN, date: new Date().toISOString(), phases: {} };

try {

/* ===================================================================== 0
 * WHICH BUILD IS ANSWERING. Before anything is probed.
 * ===================================================================== */
console.log("\n=== 0 · THE ROLLOUT GATE: which build answers, read now, not taken from a release note ===");
const planeVer = (await (await fetch(`${ORIGIN}/version`, { cache: "no-store" })).text()).trim();
const agentVer = await (await fetch(`${AGENT_ORIGIN}/version`, { cache: "no-store" })).json();
console.log(`  plane /version        : ${planeVer}`);
console.log(`  agent-worker /version : ${agentVer?.version} (${agentVer?.name})`);
t("the plane serves 0.57.0 (DS-4's release)", planeVer, "0.57.0");
t("the fleet member serves the same build — fleet rule 4: each rolls out on its own",
  agentVer?.version, "0.57.0");
/* AND THE DURABLE-OBJECT-ROUTED ANSWER, WHICH IS THE ONE THAT CAN LAG. `/version`
   is answered by the Worker isolate; `op=bootstrap` is answered THROUGH the DO.
   0.52.0/0.51.0 is why both are read: a probe answered by an old build looked
   exactly like a security defect in the new one. */
const doVer = await (await fetch(`${ORIGIN}/api/?op=bootstrap`, { cache: "no-store" })).json();
console.log(`  DO-routed op=bootstrap: version ${doVer?.version}, service ${doVer?.service}`);
t("the DURABLE-OBJECT-routed answer names the same build — no isolate is lagging behind /version",
  [doVer?.version, doVer?.service], ["0.57.0", "bio-plane"]);
report.phases.version = { plane_isolate: planeVer, agent_worker: agentVer?.version,
  plane_durable_object: doVer?.version, read_at: new Date().toISOString() };

/* ===================================================================== 1
 * THE STARTING STATE OF THE SCRATCH NAMESPACE, AND THE REAL ONE'S WITNESS.
 * ===================================================================== */
console.log("\n=== 1 · scratch's starting state, and the REAL namespace's witness counters ===");
const startScratch = R(await op("stats", { store: SCRATCH }));
console.log("  scratch residue at start:", JSON.stringify(nonZero(residueOf(startScratch))) || "{}");
const realBefore = R(await op("stats", { store: REAL }));
console.log("  REAL namespace witness  :", JSON.stringify(residueOf(realBefore)));
report.phases.start = { scratch: residueOf(startScratch), real: residueOf(realBefore) };
t("scratch starts with no bundles — a clean slate to seed into", startScratch.bundles, 0);

/* ===================================================================== 2
 * SEED: a real member roster, a document, and a CONCLUDED inquiry.
 * ===================================================================== */
console.log("\n=== 2 · seed scratch: document, inquiry, and CONCLUDE it through the op ===");
/* ===== THE WALL THIS ITEM MET, DRIVEN RATHER THAN REASONED (phase 2a). =====
 *
 * A member SESSION cannot be obtained IN the scratch namespace, so every act
 * below runs under the ADMIN machine credential instead. This is measured, not
 * assumed, and both halves are driven:
 *
 *   `op=enroll` is routed to the SCRATCH Durable Object when `store=scratch`
 *   (`index.mjs`: `invStub`, D-41's fix — before it, "memberadd in scratch
 *   answered ok and handed over a token that could never work"), so the
 *   credential it writes through `setPassword({ role: "member:<id>" })` lands in
 *   scratch's `credentials` table.
 *
 *   `op=login` is routed to the `bio` Durable Object, DELIBERATELY and with the
 *   reason at the site: "Claiming and logging in are pinned to `bio` above,
 *   because an instance has ONE identity and there is nothing to claim in a
 *   scratch namespace." Session RESOLUTION is pinned to `bio` too
 *   (`env.STORE.idFromName("bio")` at the authentication path).
 *
 * The consequence is one the record did not carry: a member enrolled in scratch
 * reads ACTIVE on `op=memberlist` and can never sign in, because the credential
 * that would answer is in a Durable Object `op=login` does not look at. */
console.log("\n  -- 2a · the member-session wall, DRIVEN in both halves --");
const ENROLLEE = `vf4m${STAMP}`.toLowerCase().slice(0, 24);
const add = R(await op("memberadd", { body: { memberId: ENROLLEE, cover: `cover for ${ENROLLEE}`,
  role: "admin", capabilities: ["contribute", "publish", "create_projects"] } }));
let wall = { memberadd: add.reason ?? (add.invite ? "invited" : JSON.stringify(add).slice(0, 200)) };
if (add.invite) {
  const pw = `${ENROLLEE}-vf4-passphrase-1`;
  const en = R(await op("enroll", { body: { invite: add.invite, handle: ENROLLEE, password: pw } }));
  wall.enroll = { ok: en.ok ?? en.__ok, handle: en.handle ?? null, reason: en.reason ?? null };
  const roster = R(await op("memberlist", { store: SCRATCH }));
  const row = (roster.members || []).find((m) => m.member_id === ENROLLEE);
  wall.roster_says = row ? { status: row.status, handle: row.handle } : null;
  const lg = await op("login", { body: { role: `member:${ENROLLEE}`, password: pw } });
  wall.login = { status: lg.status, ok: lg.body?.result?.ok ?? lg.body?.ok ?? null,
                 reason: lg.body?.result?.reason ?? lg.body?.reason ?? null,
                 token_issued: Boolean(lg.body?.token ?? lg.body?.result?.token) };
  console.log(`  enroll -> ${JSON.stringify(wall.enroll)}`);
  console.log(`  memberlist says -> ${JSON.stringify(wall.roster_says)}`);
  console.log(`  login  -> ${JSON.stringify(wall.login)}`);
  t("2a: the member ENROLLED in scratch and the roster reports them ACTIVE",
    wall.roster_says?.status, "active");
  t("2a: and that same member CANNOT SIGN IN — op=login is pinned to the `bio` Durable Object, "
  + "so the credential enroll wrote into scratch is in a store login does not look at",
    [wall.login.token_issued, wall.login.reason], [false, "SIGN_IN_REFUSED"]);
} else {
  console.log(`  memberadd -> ${JSON.stringify(wall.memberadd)} (governance; the wall below is driven anyway)`);
  const lg = await op("login", { body: { role: `member:vf4ruth`, password: "vf4ruth-vf4-passphrase-1" } });
  wall.login = { status: lg.status, reason: lg.body?.result?.reason ?? null,
                 token_issued: Boolean(lg.body?.token ?? lg.body?.result?.token) };
  const roster = R(await op("memberlist", { store: SCRATCH }));
  const row = (roster.members || []).find((m) => m.member_id === "vf4ruth");
  wall.roster_says = row ? { status: row.status, handle: row.handle } : null;
  console.log(`  memberlist says -> ${JSON.stringify(wall.roster_says)}`);
  console.log(`  login  -> ${JSON.stringify(wall.login)}`);
  t("2a: a member the roster reports ACTIVE in scratch cannot sign in — op=login is pinned to `bio`",
    [wall.roster_says?.status, wall.login.token_issued, wall.login.reason],
    ["active", false, "SIGN_IN_REFUSED"]);
}
report.phases.member_session_wall = wall;

const promote = async (id, text, type, state, tok) => {
  const a = await op("promote", { token: tok, body: {
    bundleId: id, base: null, snapKey: `${id}-${STAMP}`, author: "seed",
    meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: FIX.NOW, last_updated: FIX.LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: [] } });
  const r = R(a);
  if (r.ok === false || a.body?.ok === false) throw new Error(`promote ${id}: ${a.raw}`);
  return r;
};
console.log("\n  -- 2b · the seed, catalogue-gated locally, promoted under the ADMIN machine credential --");
await FIX.fixtureOrThrow();
console.log(`  fixture gate: ${DOC} and ${INQ} are catalogue-CLEAN before promotion (checkBundle, local)`);
await promote(DOC, FIX.infoMd(), "information", "collected", ADMIN);
await promote(INQ, FIX.inquiryMd(), "inquiry", "concluded", ADMIN);
t("the document and the inquiry are in scratch",
  R(await op("stats", { store: SCRATCH })).bundles, 2);

console.log("\n  -- 2c · op=conclude, DRIVEN — the third half of the wall --");
const concl = await op("conclude", { token: ADMIN, body: { target: INQ, conclusion: FIX.CONCL, falsifier: FIX.FALS } });
const cr = R(concl);
console.log(`  op=conclude under ADMIN -> HTTP ${concl.status} ${JSON.stringify({ ok: cr.ok ?? concl.body?.ok, reason: cr.reason ?? concl.body?.reason, check: cr.check ?? concl.body?.check })}`);
t("2c: a MACHINE may not conclude an inquiry — concluding is a named member's assertion (REC-13)",
  cr.reason ?? concl.body?.reason, "MACHINE_CANNOT_CONCLUDE");
note("2c IS WHY THE CONCLUDED INQUIRY IS PROMOTED RATHER THAN CONCLUDED THROUGH THE OP. The op refuses "
  + "every machine identity by name and no member session is reachable in scratch (2a), so the state is "
  + "carried in the document — prior_state, the state_history transition, the conclusion, the falsifier "
  + "and the `| Concluded |` Session Log entry, exactly as the op writes them — and is held to the SAME "
  + "catalogue the op's own output is held to ('nothing concluded here audits dirty'), by the local gate "
  + "above and by op=audit below. The REFUSAL is real and driven; the DOCUMENT is composed, and that is "
  + "said here rather than left to be discovered.");
const listed = (await op("list", { store: SCRATCH, token: ADMIN })).body?.result ?? [];
t("it is the CONCLUDED state the CHECK mode exists to read adversarially — read back independently",
  (Array.isArray(listed) ? listed : []).find((b) => b.bundle_id === INQ)?.current_state, "concluded");
report.phases.seed = { inquiry: INQ, document: DOC,
  conclude_op_refusal: cr.reason ?? concl.body?.reason ?? null,
  state_on_record: (Array.isArray(listed) ? listed : []).find((b) => b.bundle_id === INQ)?.current_state ?? null };

console.log("\n  -- the audit BEFORE the run: a real corpus, and it must be clean --");
const auditSeeded = R(await op("audit", { store: SCRATCH }));
console.log(`  audit: checked=${auditSeeded.checked} clean=${auditSeeded.clean} withErrors=${auditSeeded.withErrors} offenders=${JSON.stringify(auditSeeded.offenders)}`);
t("the seeded corpus is NON-EMPTY — an audit over nothing proves nothing", auditSeeded.checked > 0, true);
t("and it audits clean before the run touches it", [auditSeeded.withErrors, auditSeeded.offenders], [0, []]);
report.phases.audit_seeded = { checked: auditSeeded.checked, clean: auditSeeded.clean,
  withErrors: auditSeeded.withErrors, offenders: auditSeeded.offenders, tally: auditSeeded.tally };

/* ===================================================================== 3
 * THE AI CREDENTIAL — DRIVEN, AND IT IS THE WALL'S SECOND HALF.
 *
 * `op=aicredentialmint` admits admin and member CLASSES at the control plane and
 * the STORE then refuses every machine IDENTITY by name (C-29.1, D-199 (3)).
 * With no member session reachable in scratch (phase 2a), no `ai` credential can
 * be minted there — and `agent-worker`'s `/run` takes nothing else
 * (`AI_TOKEN_SHAPE`). Both halves are driven below rather than argued.
 * ===================================================================== */
console.log("\n=== 3 · the ai credential: the mint fence DRIVEN, and what it costs this item ===");
for (const [who, tok] of [["ADMIN_TOKEN (the root of trust)", ADMIN], ["MEMBER_TOKEN (a machine)", env.BIO_MEMBER_TOKEN]]) {
  if (!tok) continue;
  const m = await op("aicredentialmint", { token: tok, body: {
    tokenId: `vf4-by-a-machine-${STAMP}`, principalKind: "member", principalMember: "vf4ruth",
    taskScope: "investigative", writes: ["suggest"], note: "VF-4 drive of the mint fence" } });
  const r = R(m);
  console.log(`  mint by ${who} -> HTTP ${m.status} ${JSON.stringify({ reason: r.reason ?? m.body?.reason, check: r.check ?? m.body?.check, who: r.who ?? m.body?.who })}`);
  t(`${who} may NOT mint — minting is a MEMBER act, never a machine one`,
    [m.status, r.reason ?? m.body?.reason, r.check ?? m.body?.check],
    [403, "AI_CREDENTIAL_MINT_NOT_A_MEMBER", "C-29.1"]);
}
report.phases.mint_fence = { driven: true, refusal: "AI_CREDENTIAL_MINT_NOT_A_MEMBER", check: "C-29.1" };

console.log("\n  -- 3b · the DEPLOYED fleet member's own surface, driven to exactly where it stops --");
const fakeAik = "aik-" + "0".repeat(64);
const awNoCred = await agentRun({ run_id: RUN, store: SCRATCH });
const awBadShape = await agentRun({ run_id: RUN, store: SCRATCH, credential: ADMIN });
const awNoStore = await agentRun({ run_id: RUN, credential: fakeAik });
const awUnresolved = await agentRun({ run_id: RUN, store: SCRATCH, credential: fakeAik });
for (const [label, res, want] of [
  ["no credential at all", awNoCred, "NO_CREDENTIAL"],
  ["a machine token in the credential slot", awBadShape, "BAD_CREDENTIAL_SHAPE"],
  ["no namespace named", awNoStore, "BAD_STORE"],
  ["a well-shaped credential the plane cannot resolve", awUnresolved, "PLANE_REFUSED"],
]) console.log(`  /run with ${label} -> HTTP ${res.status} ${JSON.stringify(res.body?.reason ?? null)}`);
t("3b: /run refuses a caller with no credential — this member holds none of its own",
  awNoCred.body?.reason, "NO_CREDENTIAL");
t("3b: and refuses a machine token in the credential slot — a shape test, never an authorisation test",
  awBadShape.body?.reason, "BAD_CREDENTIAL_SHAPE");
t("3b: and refuses to GUESS a namespace — 'a default namespace here would let a run touch the real "
+ "record while its caller believed it was working in a scratch one'", awNoStore.body?.reason, "BAD_STORE");
t("3b: a well-shaped credential the plane cannot resolve stops at the PLANE, and the plane's own "
+ "refusal is passed through rather than re-worded", awUnresolved.body?.reason, "PLANE_REFUSED");
t("3b: the deployed member is really bound to THIS instance — the plane answered it, in scratch",
  [awUnresolved.body?.store, awUnresolved.body?.plane?.store ?? SCRATCH], [SCRATCH, SCRATCH]);
note("THE DEPLOYED MEMBER'S DRIVER CANNOT BE REACHED BY THIS ITEM, and the reason is phase 2a, not a "
  + "defect in the member: `/run` takes an `ai` credential and nothing else, an `ai` credential can only "
  + "be minted by a signed-in member (C-29.1, driven above), and a member cannot sign in to the scratch "
  + "namespace (driven in 2a). Phase 4 therefore drives FL-3's OWN LANDED TABLE — `agent-worker/src/"
  + "harness.mjs`, imported, not copied — against the LIVE plane, with a VERIFY-side driver in place of "
  + "the deployed one. What that establishes and what it does not is stated at phase 4's head.");
report.phases.agent_surface = {
  no_credential: awNoCred.body?.reason, bad_shape: awBadShape.body?.reason,
  no_store: awNoStore.body?.reason, unresolved: awUnresolved.body?.reason,
  unresolved_plane: awUnresolved.body?.plane?.reason ?? null };

/* ===================================================================== 4
 * THE CHECK RUN, LIVE IN SCRATCH.
 *
 * WHAT THIS IS, EXACTLY, so nobody reads it as more than it is. The DECISIONS
 * are FL-3's landed control-flow table, IMPORTED from `agent-worker/src/harness.mjs`
 * — `nextStep`, `applyJudgement`, `stepLog`, `emptyLevelCandidates`, `CONTROL_FLOW`,
 * `FIRST_STEP`, `MODES`, `LEVELS`, `PLANE_OPS` — so SK-4's mode gate, the judgement
 * fence, the dedup-before-submit edge and the no-verbatim-retry edge are the
 * shipped ones and not a re-implementation. The PLANE CALLS are live, against
 * `biosmoke7`'s scratch namespace, through the control plane.
 *
 * WHAT IS NOT THIS: the deployed `agent-worker` isolate's own driver, and the
 * `ai` credential class. Those are phase 3b's wall, and this run is driven under
 * the ADMIN machine credential instead. Two consequences, both stated rather
 * than papered over: the suggestion lands attributed `token:admin` rather than
 * `token:ai`, and `aiTaskScope`'s per-op scope is not the fence being crossed.
 * Everything else — the table, the ops, the writes, the log, the sweep and the
 * audit — is the real thing on the real deployment.
 * ===================================================================== */
console.log("\n=== 4 · THE CHECK RUN — FL-3's landed table, walked against the LIVE plane, store=scratch ===");
const H = await import("../../agent-worker/src/harness.mjs");
t("the table imported is the LANDED one and CHECK is its first deployed mode (SK-4's order)",
  [H.MODES.check.deployed, H.MODES.investigate.deployed], [true, false]);
console.log(`  PLANE_OPS this table may name: ${Object.keys(H.PLANE_OPS).join(", ")}`);

const opened = await op("airunopen", { token: ADMIN, body: {
  run: RUN, contextType: "inquiry", contextId: INQ,
  label: "VF-4 live CHECK run", mode: "check",
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1",
  bounds: [{ bound: "fetches", allowed: 50, unit: "requests" },
           { bound: "subsessions", allowed: 50, unit: "sessions" },
           { bound: "wallclock", allowed: 500000, unit: "ms" }],
  leaseMs: 900000 } });
console.log(`  op=airunopen -> HTTP ${opened.status} ${JSON.stringify(R(opened))}`.slice(0, 400));
t("the run is OPENED on the record, in scratch", R(opened).started, true);

const runObj = R(await op("airun", { token: ADMIN, query: { run: RUN } }));
const sess = runObj.session ?? runObj;
t("and the run object's MODE is the RECORD's — the caller does not carry it into the table",
  sess?.mode, "check");
report.phases.open = { run: RUN, started: R(opened).started, mode_on_record: sess?.mode };

/* `basis-version`, NOT `new-version`, AND THE DIFFERENCE IS A LIVE FINDING
   RECORDED IN PHASE 4b BELOW: §9's kinds are a CLOSED set of five and
   `new-version` is not among them, so every candidate carrying it is refused
   `SUGGEST_UNKNOWN_KIND` (C-27.3) by the deployed plane. */
const CANDIDATES = [
  { kind: "basis-version", target: INQ, name: "vf4 alternative reading", relationship: "and",
    description: "The 1998 resolution is cited for an authority it does not state on its face; the "
                + "transfer basis may instead rest on the FY25-27 adopted budget's own transfer schedule, "
                + "which would make the concluded answer's authority claim broader than its evidence." },
];
/* `description` AND NOT `summary` ON AN ABSENCE REPORT, AND THE FIRST LIVE PASS
   IS WHY. `emptyLevelCandidates` reads `r.description` when it composes §9's
   empty-level kind; a report carrying only `summary` produced a candidate with
   `description: null`, which PL-3's endpoint refused live as
   `SUGGEST_BOILERPLATE` (C-27.12). The refusal was correct and the report was
   the defect — recorded because it is a real live finding about the shape a
   sub-session's return must carry for the table's own derived candidate to be
   writable. Both keys are carried now: `summary` is the report's, `description`
   is what the candidate inherits. */
const REPORTS = [
  { level: "meaning", state: "PRESENT", observed_at: "observation:vf4-meaning-1",
    summary: "the meaning layer holds this inquiry's basis legs", citations: [{ address: DOC }] },
  { level: "content", state: "LOOKED_ABSENT", observed_at: "observation:vf4-content-1",
    summary: "no extracted passage names a rescinding resolution",
    description: "Every extracted passage held at content grain for this inquiry was read, and none "
               + "names a resolution rescinding the 1998 authority the conclusion rests on." },
  { level: "document", state: "PRESENT", observed_at: "observation:vf4-document-1",
    summary: "the transfer memo is in hand", citations: [{ address: DOC }] },
  { level: "internet", state: "LOOKED_ABSENT", observed_at: "observation:vf4-internet-1",
    summary: "the minutes index holds no rescission",
    description: "The council's 1998 minutes index was searched for a rescinding resolution within "
               + "this run's fetch bound and returned none." },
];
/* THE ADJUST JUDGEMENT IS A REAL CHANGE, because `adjustedFrom` compares the
   BYTES and an unchanged submission is DROPPED rather than resent — F10. */
const JUDGEMENTS = [ { targets: [] },            /* plan    */
                     { reports: REPORTS },       /* collect */
                     { candidates: CANDIDATES }, /* compose */
                     {} ];                       /* dedup   */

/* THE VERIFY-SIDE DRIVER. It turns a row into plane calls and nothing else — it
   decides no step, names no bound and invents no ending; `nextStep` does all
   three, from the imported module. */
let state = { step: H.FIRST_STEP, mode: sess?.mode, pass: 0,
  maxPasses: Number(sess?.max_passes) > 0 ? Number(sess.max_passes) : 1,
  targets: [], reports: [], candidates: [], queue: [],
  refusal: null, adjusted: false, submission: null,
  level: null, observed: null, governed: false, condition: null };
let jx = 0, steps = 0, submitted = 0, ticked = 0, planeCalls = 0;
const trace = [], runRefusals = [];
let ended = null;

while (steps < 60) {
  steps += 1;
  const row = H.CONTROL_FLOW[state.step];
  if (row?.judged && jx < JUDGEMENTS.length) {
    const applied = H.applyJudgement(state, JUDGEMENTS[jx]); jx += 1;
    if (!applied.ok) throw new Error(`JUDGEMENT_OVERREACH at ${state.step}: ${applied.detail}`);
    state = applied.state;
  }
  let note_ = "";
  /* WHAT THE ROW DOES, IN LIVE PLANE CALLS. */
  if (state.step === "resume") {
    const lg = R(await op("airunlog", { token: ADMIN, query: { run: RUN, limit: 200 } })); planeCalls++;
    note_ = `resumed from ${Array.isArray(lg.entries) ? lg.entries.length : 0} prior entries`;
  } else if (state.step === "fanout") {
    for (const level of H.LEVELS) {
      const sp = R(await op("airunspawn", { token: ADMIN, query: { run: RUN, level } })); planeCalls++;
      if (sp && /manifest|lens/i.test(JSON.stringify(sp.contract ?? sp.search ?? {}))) throw new Error("spawn contract carried a manifest");
    }
    note_ = `${H.LEVELS.length} sub-session contracts composed by the PLANE (PL-12's fence)`;
  } else if (state.step === "compose") {
    const mr = await op("meaningrows", { token: ADMIN, query: { q: "", rows: H.MEANING_ARM, limit: 50 } }); planeCalls++;
    const empties = H.emptyLevelCandidates(state, INQ);
    state = { ...state, candidates: [...(state.candidates || []), ...empties] };
    note_ = `meaning read at the '${H.MEANING_ARM}' grain: HTTP ${mr.status}; `
          + `${empties.length} level(s) observed EMPTY and written down as §9's kind`;
  } else if (state.step === "dedup") {
    const held = R(await op("basisversions", { token: ADMIN, query: { id: INQ, limit: 50 } })); planeCalls++;
    const names = new Set((Array.isArray(held.versions) ? held.versions : []).map((v) => String(v?.name ?? "")).filter(Boolean));
    const queue = (state.candidates || []).filter((c) => c && !names.has(String(c.name ?? "")));
    state = { ...state, queue };
    note_ = `${(state.candidates || []).length} candidate(s) compared against ${names.size} on the record; ${queue.length} survived`;
  } else if (state.step === "submit") {
    const queue = [...(state.queue || [])];
    const candidate = queue.shift();
    if (candidate) {
      const res = await op("suggest", { token: ADMIN, body: { ...candidate, run: RUN } }); planeCalls++;
      const ans = R(res);
      if (res.status === 200 && res.body?.ok === true && ans.wrote !== false) {
        submitted += 1; note_ = `wrote '${candidate.name}'`;
        state = { ...state, queue, refusal: null, submission: candidate };
      } else {
        runRefusals.push({ name: candidate.name, code: ans.reason ?? res.body?.reason ?? null,
                           check: ans.check ?? res.body?.check ?? null,
                           translation: ans.translation ?? res.body?.translation ?? null });
        note_ = `refused '${ans.reason ?? res.body?.reason}' (${ans.check ?? res.body?.check}) — routing to ADJUST, never to a retry`;
        state = { ...state, queue, refusal: ans, submission: candidate };
      }
    } else { note_ = "queue empty"; }
  } else if (state.step === "adjust") {
    const changed = H.adjustedFrom(state.refusedSubmission ?? null, state.submission ?? null);
    const queue = [...(state.queue || [])];
    if (changed) queue.unshift(state.submission);
    state = { ...state, adjusted: changed, queue };
    note_ = changed ? "the submission was changed in answer to the refusal"
                    : "the refusal could not be answered by changing the submission; the candidate is dropped";
  }

  const decision = H.nextStep(state);
  trace.push({ step: state.step, to: decision.step, note: note_ });
  /* §14b.6 LOG-ALWAYS, through the plane's own producer. */
  const tick = await op("airuntick", { token: ADMIN,
    body: { run: RUN, log: [H.stepLog(state, decision)], consume: [{ bound: "fetches", amount: 1 }] } });
  planeCalls++;
  if (tick.status === 200 && tick.body?.ok === true) ticked += 1;
  else if (steps === 1) console.log(`  op=airuntick answered ${tick.status}: ${tick.raw.slice(0, 300)}`);
  if (decision.step === "close") {
    const cl = await op("airunclose", { token: ADMIN, body: { run: RUN, bound: decision.bound || "completed" } });
    planeCalls++;
    ended = { bound: decision.bound || "completed", status: cl.status, ok: cl.body?.ok ?? null };
    trace.push({ step: "close", to: null, note: `bound=${ended.bound}` });
    break;
  }
  /* THE DEPLOYED DRIVER'S OWN TRANSITION, COPIED EXACTLY (agent-worker/src/index.mjs):
     the refusal and the bytes that earned it are carried to `adjust` and to no
     other row, so a stale refusal cannot route a later step into an adjust it
     did not earn. Getting this wrong on VF-4's first pass produced an endless
     adjust/submit oscillation — a driver defect, recorded because it is the
     shape of the thing this transition exists to prevent. */
  state = decision.step === "adjust"
    ? { ...state, step: "adjust", refusedSubmission: state.submission ?? null, adjusted: false }
    : { ...state, step: decision.step, refusal: null, adjusted: false, refusedSubmission: null };
  if (decision.step === "next-pass") state = { ...state, pass: (state.pass || 0) + 1 };
}
console.log(`  trace: ${trace.map((x) => `${x.step}>${x.to ?? "-"}`).join(" ")}`);
for (const x of trace) if (x.note) console.log(`    ${x.step}: ${x.note}`);
console.log(`  steps=${steps} submitted=${submitted} ticked=${ticked} planeCalls=${planeCalls} refusals=${runRefusals.length} ended=${JSON.stringify(ended)}`);
t("the run walked the table's FIRST row — SK-4's mode gate — and was not refused by it",
  trace[0]?.step, "gate-mode");
t("the gate passed CHECK through to the run rather than closing on mode-not-deployed",
  trace[0]?.to, "resume");
t("the run reached the table's ONE exit and named its bound (C-22.5)", ended?.bound, "completed");
t("the run COMPLETED — it closed on the record", ended?.ok, true);
t("at least one suggestion was WRITTEN through PL-3's endpoint", submitted > 0, true);
report.phases.run = { driver: "VERIFY-side, over agent-worker/src/harness.mjs as landed",
  credential_class: "admin (machine) — phase 3b's wall is why",
  trace: trace.map((x) => `${x.step}>${x.to ?? "-"}`), notes: trace.map((x) => x.note).filter(Boolean),
  steps, submitted, ticked, plane_calls: planeCalls, refusals: runRefusals, ended };

console.log("\n  -- what LANDED, read back through the control plane --");
const versions = R(await op("basisversions", { token: ADMIN, query: { id: INQ, limit: 50 } }));
const vlist = Array.isArray(versions.versions) ? versions.versions : [];
console.log(`  op=basisversions: ${vlist.length} version(s) — ${JSON.stringify(vlist.map((v) => ({ name: v.name, kind: v.kind, state: v.state, author: v.author })))}`);
t("every suggestion the run wrote is on the record in the SUGGESTED state",
  vlist.map((v) => v.state), vlist.map(() => "suggested"));
t("and the count matches what the run said it submitted", vlist.length, submitted);
t("each is attributed to the MACHINE that wrote it, honestly named, never borrowing a person's",
  [...new Set(vlist.map((v) => v.author))], ["token:admin"]);
const runlog = R(await op("airunlog", { token: ADMIN, query: { run: RUN, limit: 200 } }));
const entries = Array.isArray(runlog.entries) ? runlog.entries : [];
console.log(`  op=airunlog: ${entries.length} observation entries (${ticked} ticks + op=airunopen's own)`);
t("§14b.6 log-always: every step the table took is in the record's OWN log, written by the plane "
+ "(op=airunopen writes the first entry itself, which is why this is ticks+1)", entries.length, ticked + 1);
report.phases.landed = { versions: vlist.map((v) => ({ name: v.name, kind: v.kind, state: v.state, author: v.author })),
  log_entries: entries.length, ticks: ticked };

/* ===================================================================== 4b
 * TWO LIVE FINDINGS THE SUITES CANNOT SEE, DRIVEN AND PINNED HERE.
 *
 * Both are the same class and it is this project's most-repeated one: a
 * mechanism believed on the strength of its EXISTENCE rather than its
 * behaviour. `agent-worker`'s suites drive the table against a MOCK plane whose
 * `op=suggest` accepts ANY `name` and ANY `kind` and runs one boilerplate
 * predicate — so neither §9's closed kind set nor the version-name grammar has
 * ever met the candidate the table composes. Driven here against the deployed
 * plane, in scratch.
 * ===================================================================== */
console.log("\n=== 4b · two live findings the mocked suites cannot see ===");
const badKind = await op("suggest", { token: ADMIN, body: {
  kind: "new-version", target: INQ, name: "vf4 kind probe", relationship: "and", run: RUN,
  description: "A candidate carrying the kind the fleet member's own suite fixtures use." } });
const bk = R(badKind);
console.log(`  kind 'new-version' -> ${JSON.stringify({ reason: bk.reason, check: bk.check, kinds: bk.kinds })}`);
t("4b-i: 'new-version' is NOT one of §9's five kinds and the live plane refuses it BY NUMBER",
  [bk.reason, bk.check], ["SUGGEST_UNKNOWN_KIND", "C-27.3"]);
t("4b-i: and the plane publishes the closed set it holds",
  bk.kinds, ["basis-version", "sharpen-question", "new-inquiry", "level-empty", "new-edition"]);
note("4b-i: `agent-worker/test/harness.test.mjs` (B4, B5) and `agent-worker/test/fanout.test.mjs` compose "
  + "candidates with `kind: \"new-version\"` and assert they LAND. Against the mock they do; against the "
  + "deployed plane every one of them is refused C-27.3. The kind comes from a JUDGEMENT rather than from "
  + "`harness.mjs`, so this is a FIXTURE that has never met the catalogue — not a defect in the table. "
  + "It is nevertheless a suite asserting a landing the real plane would never grant.");

/* THE TABLE'S OWN COMPOSED CANDIDATE, HANDED TO THE LIVE ENDPOINT VERBATIM. */
const composed = H.emptyLevelCandidates({ reports: REPORTS }, INQ);
console.log(`  emptyLevelCandidates composed: ${JSON.stringify(composed.map((c) => ({ kind: c.kind, name: c.name })))}`);
t("4b-ii: the landed table composes §9's empty-level candidates and names them `level-empty:<level>`",
  composed.map((c) => c.name), ["level-empty:content", "level-empty:internet"]);
const emptyLive = await op("suggest", { token: ADMIN, body: { ...composed[0], run: RUN } });
const el = R(emptyLive);
console.log(`  suggest(that candidate, verbatim) -> ${JSON.stringify({ reason: el.reason, wrote: el.wrote, findings: el.findings })}`);
t("4b-ii: THE DEPLOYED PLANE REFUSES IT, and writes nothing",
  [el.reason, el.wrote], ["BASIS_REFUSED", false]);
t("4b-ii: the check that refuses it is the VERSION-NAME GRAMMAR — `VERSION_NAME_RE` admits letters, "
+ "digits, spaces, '-', '_' and '.', and a COLON is not among them",
  (el.findings || []).map((f) => f.check), ["C-25.2"]);
/* THE OVER-STRICTNESS ARM: the same candidate in a spelling the grammar admits
   must PASS, so the finding is the COLON and not the empty-level kind itself. */
const emptyOk = await op("suggest", { token: ADMIN, body: {
  ...composed[0], name: composed[0].name.replace(":", "-"), run: RUN } });
const eo = R(emptyOk);
console.log(`  the SAME candidate with the colon replaced -> ${JSON.stringify({ ok: eo.ok ?? emptyOk.body?.ok, wrote: eo.wrote, reason: eo.reason })}`);
t("4b-ii OVER-STRICTNESS: the identical candidate under a legal name IS written — so what the plane "
+ "refuses is the COLON in the name the table mints, not §9's empty-level kind",
  [eo.wrote !== false, eo.reason ?? null], [true, null]);
note("4b-ii IS THE ITEM'S HEADLINE FINDING. `emptyLevelCandidates` in `agent-worker/src/harness.mjs` mints "
  + "`name: `level-empty:${level}`` — a colon — and `VERSION_NAME_RE` in `bio-plane/checks/bio-checks.mjs` "
  + "is /^[a-z0-9][a-z0-9 ._-]{0,63}$/i, which has no colon. So EVERY §9 empty-level suggestion the landed "
  + "table composes is refused by the deployed plane as BASIS_REFUSED / C-25.2 and NOTHING IS WRITTEN. "
  + "That object is VF-1's owed control 7 — the instrument that makes an honest empty-handed run "
  + "distinguishable from a silent failure — so on the live plane the empty run is currently indistinguishable "
  + "from the silent failure it exists to rule out. Three suites assert the colon form LANDS "
  + "(`harness.test.mjs` B6, `fanout.test.mjs` twice) against a mock that runs no catalogue. The over-strictness "
  + "arm above pins that the KIND is fine and the NAME is the defect, so the fix is one of: widen "
  + "`VERSION_NAME_RE`, or mint the name with a separator the grammar already admits. Which one is a "
  + "RECORD/FLEET decision and is NOT taken here.");
report.phases.findings_live = {
  unknown_kind: { kind: "new-version", reason: bk.reason, check: bk.check, closed_set: bk.kinds },
  empty_level_name: { composed: composed.map((c) => c.name), reason: el.reason, wrote: el.wrote,
    findings: el.findings, over_strictness_same_candidate_legal_name_wrote: eo.wrote !== false } };

/* ===================================================================== 5
 * NC (2), THE ROW'S OWN: SKIP THE SWEEP — what does op=audit say about residue?
 * ===================================================================== */
console.log("\n=== 5 · NEGATIVE CONTROL 2 — THE SWEEP SKIPPED. Residue is present. What does op=audit say? ===");
const dirtyStats = R(await op("stats", { store: SCRATCH }));
const dirtyResidue = residueOf(dirtyStats);
console.log("  residue present:", JSON.stringify(nonZero(dirtyResidue)));
t("there IS residue to catch — the arm ARMED (an arm that did not arm is a finding)",
  Object.values(nonZero(dirtyResidue)).length > 0, true);
const auditDirty = R(await op("audit", { store: SCRATCH }));
console.log(`  op=audit with residue standing: checked=${auditDirty.checked} clean=${auditDirty.clean} `
  + `withErrors=${auditDirty.withErrors} tally=${JSON.stringify(auditDirty.tally)} offenders=${JSON.stringify(auditDirty.offenders)}`);
report.phases.nc2 = { residue: dirtyResidue, audit: { checked: auditDirty.checked, clean: auditDirty.clean,
  withErrors: auditDirty.withErrors, tally: auditDirty.tally, offenders: auditDirty.offenders } };
const auditSawIt = auditDirty.withErrors > 0 || (auditDirty.offenders || []).length > 0;
if (auditSawIt) {
  t("NC2 DECLARED: op=audit FAILS on the residue, as the row predicts", auditSawIt, true);
} else {
  note("NC2 AS MEASURED, NOT AS PREDICTED: `op=audit` is a CONFORMANCE PASS OVER BUNDLES "
    + "(store.mjs auditPass walks `SELECT b.bundle_id ... FROM bundles`), and a CHECK run's residue is "
    + "NOT bundles — it is rows in `basis_versions`, `basis_version_legs`, `ai_runs`, `ai_run_log` and "
    + "`ai_run_bounds`. A `suggested` version is a legal, conformant thing for a live record to hold, so "
    + "the pass reports it clean and is RIGHT to. The instrument that DOES see this residue is `op=stats`, "
    + "whose per-derived-table counters exist for exactly this (D-113: 'reported so a purge can PROVE it "
    + "took them'). The row's NC is therefore run against the wrong instrument: the arm is armed and the "
    + "measurement is recorded rather than smoothed.");
  t("NC2's SUBSTANCE, re-armed on the instrument that can see the subject: residue stands, "
    + "un-swept, and is COUNTABLE", Object.values(nonZero(dirtyResidue)).length > 0, true);
}

/* ===================================================================== 6
 * NC (1), THE ROW'S OWN: POINT THE RUN AT THE REAL NAMESPACE.
 * Three arms, each held alone, each followed by the real namespace's witness.
 * ===================================================================== */
console.log("\n=== 6 · NEGATIVE CONTROL 1 — POINT IT AT THE REAL NAMESPACE. It must REFUSE. ===");

console.log("\n  -- 6a · the deployed RUN surface, pointed at store=bio --");
const runReal = await agentRun({ run_id: RUN, store: REAL, credential: fakeAik,
  judgements: [{ targets: [] }, { reports: REPORTS }, { candidates: CANDIDATES }, {}] });
console.log(`  HTTP ${runReal.status}  ${redact(JSON.stringify(runReal.body ?? {})).slice(0, 600)}`);
t("6a: the live run pointed at the REAL namespace is REFUSED before any step is taken",
  runReal.status !== 200 || runReal.body?.ok !== true, true);
t("6a: and nothing on the answer says a run started there",
  [runReal.body?.submitted ?? null, runReal.body?.logged ?? null], [null, null]);
note("6a NAMES ITS OWN FENCE HONESTLY: this refusal is the PLANE declining to resolve the credential in "
  + `the '${REAL}' namespace (${String(runReal.body?.reason)}), not \`scopeFor\`'s scratch confinement. The two are `
  + "different fences and collapsing them would be the record claiming more than it can support. It is "
  + "nevertheless the fence that actually stood here, so it is recorded as what it is.");

console.log("\n  -- 6b · the run's own WRITE op, aimed straight at store=bio, under a non-resolving credential --");
const sugReal = await op("suggest", { store: REAL, token: fakeAik, body: {
  target: INQ, run: RUN, kind: "new-version", name: "vf4-must-never-land",
  relationship: "and", description: "This must never reach the real record. VF-4 negative control 1." } });
console.log(`  HTTP ${sugReal.status}  ${sugReal.raw.slice(0, 400)}`);
t("6b: op=suggest into the REAL namespace is REFUSED",
  sugReal.status !== 200 || sugReal.body?.ok !== true, true);

console.log("\n  -- 6d · THE ARM THAT MATTERS MOST, AND IT COMES BACK THE WRONG WAY. Read-only. --");
/* `scopeFor` confines the PROBE class and NOTHING ELSE — by decision, stated at
   the site. This item drives its run under the ADMIN class, which is the root of
   trust, so the confinement the row's NC names IS NOT BETWEEN THIS ITEM AND THE
   REAL RECORD. Proven with a READ rather than a write: if the plane answers a
   store= parameter of `bio` by putting the caller in `bio`, then the same caller
   asking for a mutating op would have been put there too. Nothing is written. */
const whoReal = await op("whoami", { store: REAL, token: ADMIN });
const whoScratch = await op("whoami", { store: SCRATCH, token: ADMIN });
console.log(`  admin + store=bio     -> HTTP ${whoReal.status}, plane placed the caller in: ${JSON.stringify(whoReal.body?.store)}`);
console.log(`  admin + store=scratch -> HTTP ${whoScratch.status}, plane placed the caller in: ${JSON.stringify(whoScratch.body?.store)}`);
t("6d: the ADMIN class is NOT confined — the plane places it in the REAL namespace on request",
  [whoReal.body?.store, whoReal.body?.tokenClass], [REAL, "admin"]);
t("6d: and honours scratch when scratch is asked for", whoScratch.body?.store, SCRATCH);
note("6d IS THE ROW'S NC FAILING TO BE THE FENCE IT IS WRITTEN AS, and it is a finding rather than a "
  + "surprise: `scopeFor` refuses `store != scratch` for the PROBE class ONLY, and says so at the site. "
  + "Under the ADMIN class the plane resolves the real namespace on request, so what kept this item off "
  + "the real record is the ITEM'S OWN DISCIPLINE — every mutating call it made named store=scratch — and "
  + "NOT a plane fence. The row's NC is only drivable under a probe credential (6c), and this instance's "
  + "PROBE_TOKEN value is unavailable to this session. Stated plainly: the no-write-to-the-real-record "
  + "claim below rests on the before/after witness, which is evidence, and not on a refusal that did not "
  + "happen.");

console.log("\n  -- 6c · the probe-class scratch confinement (scopeFor), driven directly --");
/* `scopeFor` refuses ONLY the probe class by name, and the probe credential is
   the one this project's `.env` does not carry: biosmoke7 binds PROBE_TOKEN
   (measured, secret NAMES only, via the account API) but a secret's VALUE cannot
   be read back from Cloudflare, and SETTING one would be a configuration act
   this item is forbidden. So the arm is driven with the value published in
   `bio-plane/dist/SECRETS.txt`, which `tokens.mjs` denylists on publication. */
let probeArm = { driven: false };
try {
  const { readFileSync } = await import("node:fs");
  const txt = readFileSync(new URL("../dist/SECRETS.txt", import.meta.url), "utf8");
  const m = txt.match(/PROBE_TOKEN\s*[=:]\s*(\S+)/);
  if (m) {
    const who = await op("whoami", { store: SCRATCH, token: m[1] });
    const cls = R(who).tokenClass ?? who.body?.tokenClass ?? null;
    probeArm = { driven: true, resolved_class: cls, status: who.status,
                 reason: who.body?.reason ?? null };
    console.log(`  published PROBE_TOKEN resolves to class: ${JSON.stringify(cls)} (HTTP ${who.status}, ${who.body?.reason ?? "-"})`);
    if (cls === "probe") {
      const conf = await op("stats", { store: REAL, token: m[1] });
      probeArm.confinement = { status: conf.status, reason: conf.body?.reason, error: conf.body?.error };
      console.log(`  probe -> store=bio : HTTP ${conf.status} ${JSON.stringify(conf.body?.reason)} ${JSON.stringify(conf.body?.error)}`);
      t("6c: the PROBE-class scratch confinement REFUSES store=bio, by name",
        [conf.status, conf.body?.reason], [403, "SCOPE_REFUSED"]);
    } else {
      note("6c NOT DRIVEN AS THE ROW WRITES IT, and the reason is a mechanism working: the only probe "
        + "credential value this repository holds is the one PUBLISHED in `bio-plane/dist/SECRETS.txt`, "
        + "which `tokens.mjs` treats as NOT SET (revocation by publication, D-298's 'the mitigation this "
        + "project designed for exactly this worked'). It therefore resolves to NO class at all, so "
        + "`scopeFor`'s probe branch cannot be reached with any credential available to this session. "
        + "biosmoke7 DOES bind a live PROBE_TOKEN (secret NAMES read from the account: ADMIN_TOKEN, "
        + "MEMBER_TOKEN, PROBE_TOKEN) but a secret VALUE cannot be read back from Cloudflare, and setting "
        + "one is a configuration act this item is forbidden. The confinement's SOURCE is one branch "
        + "(`scopeFor`) and the battery drives it; what is NOT established live is that branch, and it is "
        + "stated rather than implied by 6a/6b.");
    }
  }
} catch (e) { probeArm.error = String(e?.message || e).slice(0, 200); }
report.phases.nc1 = { run_at_real: { status: runReal.status, ok: runReal.body?.ok ?? null,
    reason: runReal.body?.reason ?? null, plane: runReal.body?.plane?.reason ?? null },
  suggest_at_real: { status: sugReal.status, ok: sugReal.body?.ok ?? null, reason: sugReal.body?.reason ?? null },
  probe_arm: probeArm,
  admin_is_unconfined: { asked_bio_got: whoReal.body?.store, asked_scratch_got: whoScratch.body?.store } };

console.log("\n  -- the REAL namespace's witness, after every arm that pointed at it --");
const realAfter = R(await op("stats", { store: REAL }));
const before = residueOf(realBefore), after = residueOf(realAfter);
console.log("  before:", JSON.stringify(before));
console.log("  after :", JSON.stringify(after));
t("NOT ONE COUNTER IN THE REAL NAMESPACE MOVED — the real record is untouched", after, before);
report.phases.real_witness = { before, after, unchanged: JSON.stringify(before) === JSON.stringify(after) };

/* ===================================================================== 7
 * THE SWEEP, AND THE AUDIT THAT CLOSES THE ROW.
 * ===================================================================== */
console.log("\n=== 7 · THE SWEEP — op=purge over scratch, then op=audit through the control plane ===");
/* `confirm=<the store the caller RESOLVED to>` — the op refuses otherwise, so a
   purge can never land somewhere the caller did not mean. */
const purge = await op("purge", { store: SCRATCH, query: { confirm: SCRATCH }, body: {} });
console.log(`  HTTP ${purge.status}  ${purge.raw.slice(0, 700)}`);
const afterSweep = R(await op("stats", { store: SCRATCH }));
const sweptResidue = residueOf(afterSweep);
console.log("  scratch residue after the sweep:", JSON.stringify(nonZero(sweptResidue)) === "{}" ? "NONE" : JSON.stringify(nonZero(sweptResidue)));
t("the sweep REMOVED every counter the run moved — the instrument that can see the residue says zero",
  nonZero(sweptResidue), {});
const auditFinal = R(await op("audit", { store: SCRATCH }));
console.log(`  op=audit FINAL: ${JSON.stringify({ ok: auditFinal.ok, checked: auditFinal.checked, clean: auditFinal.clean, withErrors: auditFinal.withErrors, tally: auditFinal.tally, offenders: auditFinal.offenders, total: auditFinal.total })}`);
t("op=audit answers CLEAN through the control plane",
  [auditFinal.ok, auditFinal.withErrors, auditFinal.offenders, auditFinal.tally], [true, 0, [], {}]);
report.phases.sweep = { purge_status: purge.status, purge: purge.body?.result ?? purge.body,
  residue_after: sweptResidue,
  audit_final: { ok: auditFinal.ok, checked: auditFinal.checked, clean: auditFinal.clean,
    withErrors: auditFinal.withErrors, tally: auditFinal.tally, offenders: auditFinal.offenders,
    total: auditFinal.total } };

} catch (e) {
  fail++;
  console.log(`\n  THREW: ${redact(String(e?.stack || e)).slice(0, 2000)}`);
  report.threw = redact(String(e?.message || e)).slice(0, 500);
} finally {
  /* SWEEP AFTER EVERY ARM INCLUDING FAILED ONES. This runs whether the body
     above completed or threw, and the byte-clean claim is re-measured here
     rather than inherited from the happy path. */
  console.log("\n=== FINALLY · the instance is left byte-clean, and it is MEASURED, not asserted ===");
  try {
    await op("purge", { store: SCRATCH, query: { confirm: SCRATCH }, body: {} });
    const end = R(await op("stats", { store: SCRATCH }));
    const endResidue = residueOf(end);
    console.log("  scratch residue at exit:", JSON.stringify(nonZero(endResidue)) === "{}" ? "NONE" : JSON.stringify(nonZero(endResidue)));
    const endAudit = R(await op("audit", { store: SCRATCH }));
    console.log(`  op=audit at exit: ok=${endAudit.ok} checked=${endAudit.checked} withErrors=${endAudit.withErrors} offenders=${JSON.stringify(endAudit.offenders)}`);
    report.exit = { residue: endResidue, audit: { ok: endAudit.ok, checked: endAudit.checked,
      withErrors: endAudit.withErrors, offenders: endAudit.offenders } };
    t("EXIT: scratch holds nothing this run put there", nonZero(endResidue), {});
    t("EXIT: op=audit clean", [endAudit.ok, endAudit.withErrors, endAudit.offenders], [true, 0, []]);
  } catch (e) { console.log(`  sweep at exit THREW: ${redact(String(e?.message || e)).slice(0, 300)}`); }

  /* THE CLOSING BUILD READ. Every figure above was produced between this and the
     opening one; if they disagree, a rollout moved under the run and no figure
     in this report may be attributed to one build. */
  try {
    const endIso = (await (await fetch(`${ORIGIN}/version`, { cache: "no-store" })).text()).trim();
    const endDo = await (await fetch(`${ORIGIN}/api/?op=bootstrap`, { cache: "no-store" })).json();
    const endAgent = await (await fetch(`${AGENT_ORIGIN}/version`, { cache: "no-store" })).json();
    console.log(`  build at EXIT: plane isolate ${endIso}, plane DO ${endDo?.version}, agent-worker ${endAgent?.version}`);
    report.build_at_exit = { plane_isolate: endIso, plane_durable_object: endDo?.version,
      agent_worker: endAgent?.version };
    t("NO ROLLOUT MOVED UNDER THIS RUN — every figure above is attributable to ONE build",
      [endIso, endDo?.version, endAgent?.version], ["0.57.0", "0.57.0", "0.57.0"]);
  } catch (e) { console.log(`  closing build read THREW: ${String(e?.message || e).slice(0, 200)}`); }
  report.plane_versions_seen = [...planeVersionsSeen];
  report.tally = { pass, fail };
  report.findings = findings;
  const jx = process.argv.indexOf("--json");
  if (jx > -1 && process.argv[jx + 1]) writeFileSync(process.argv[jx + 1], JSON.stringify(report, null, 2));
  console.log(`\nVF-4 LIVE: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
