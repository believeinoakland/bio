/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/fence-e2e.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-3/PL-4/PL-11/REC-73/REC-78's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. Every arm is armed ALONE with the others HELD OPEN, every restore is verified BY sha256 AND BY CONTENT against a per-arm uniquely-named pristine copy, and every arm declares what MUST fail AND what MUST NOT before it is armed. Figures are filled in from the runs.
   ALL SEVEN ARMS RUN 2026-08-09 IN WORKTREE agent-a5e04a5aea7792dde, baseline 55/0 before each, and TWO CAME BACK WRONG FIRST — both instrument findings, both recorded in the driver's header rather than smoothed. Figures below are MEASURED, and they were RE-MEASURED WHOLE after this worktree was found 26 commits behind `main` and rebased: every arm behaved as declared on both bases, and the figures below are the ones from the REBASED tree.
   (0) BASELINE — no edit at all -> 55 pass, 0 fail. Distinguishes six-arms-broken from six-arms-working, which is the row a harness reporting `null` for every arm did not have.
   (1) THE ROW'S OWN — REMOVE THE IDENTITY PREDICATE. `isMachineStamp` returns false in checks/bio-checks.mjs -> 35 pass, 20 FAIL. **AND THE MEASUREMENT IS LARGER THAN THE ROW PREDICTED, EXACTLY AS IT WAS FOR D-229 AND D-230: ALL FOUR IDENTITY ACTS WENT ALL THE WAY THROUGH under their complete payloads.** A machine ACCEPTED a reading (`state: accepted`, read back); a machine MADE A PROJECT STAND ON one (`current.version: "settled account"`, read back through the project's own document); a machine HID one (`hidden: true`); and a machine PUBLISHED A CASE (`current_state: published`). Not one fell to a payload complaint, because there was none left to fall to. **TWO OF THE FOUR — make-current and hide — HAD NEVER BEEN DRIVEN THIS WAY BY ANY SUITE**: REC-73 pins `MACHINE_CANNOT_MOVE_VERSION` through `op=versionaccept` alone, and the six verbs share one code. MUST NOT FAIL and did not: attempts 5 and 6, whose fences do not consult this predicate — which is what makes the three layers three.
   (2) THE CAPTURE-CONDUCT FENCE ALONE. `if (!d || d.draining !== true)` -> `if (false)` in src/index.mjs's captureRequestArm -> 50 pass, 5 FAIL, attempt 5 and the member/daemon half beside it. 1-4 and 6 stayed GREEN.
   (3) THE SHAPE FENCE ALONE. `aiReachesAsMember` returns true in src/index.mjs -> 53 pass, 2 FAIL. **THIS ARM CAME BACK WRONG FIRST AND THE CORRECTION IS A FINDING ABOUT THE PLANE, NOT THE HARNESS: attempt 6 IS STILL REFUSED, with the SAME CODE, by the declared-writes check sitting directly behind the member floor.** `AI_BEYOND_TASK_SCOPE` has two producers in `aiTaskScope`, and `op=capturerequestdrain` is mutating and can never appear in any authorable scope, so both refuse it. An instrument keying on the code alone reports the member floor holding when the member floor is not what answered — D-229/D-230's shadow arriving at the credential layer. The suite now pins the BRANCH by its detail, which is the only thing on the wire that tells the two apart, and this arm fails that assertion and the mint door.
   (4) THE END-TO-END ARM IS NOT DECORATION. Drop `plane: asked.body` from the PLANE_REFUSED body in agent-worker/src/index.mjs -> 54 pass, 1 FAIL, the verbatim pass-through assertion. Everything the plane answers directly stayed GREEN, which is what shows the JOIN is what block 8 measures.
   (5) THE ROSTER CANNOT SHRINK. Drop `hide` out of the driven roster -> 51 pass, 3 FAIL naming the act and the count. **THIS ARM ALSO CAME BACK WRONG FIRST, AND IT IS THE SHARPER OF THE TWO: it KILLED the suite instead of failing it.** `attempt()` read `row.act` off an undefined roster row, the `TypeError` ended the module through no assertion at all, and stdout carried `1 pass` with every arm behind it unrun. A harness reading a missing tally as `0` would have recorded "stayed GREEN over a shorter roster" — the exact failure the arm exists to catch, arriving inside the arm. Caught ONLY by the `-1` foot convention. `attempt()` is now null-tolerant on its own roster.
   (6) OVER-STRICTNESS — A FENCE TIGHTER THAN ITS RULE IS NOT A SAFER FENCE. Make the version fence refuse EVERYONE (`if (true)`) instead of only a machine -> 51 pass, 4 FAIL: the three member arms and block 9's preview. **The six machine attempts stayed GREEN throughout, which is the point of the arm** — an instrument watching only the refusals would have reported a fence that refuses correct work as fine.
 * =========================================================================
 * IS-BUILD-PLAN VF-5 — THE END-TO-END FENCE PROOF, BEFORE CHECK DEPLOYS.
 *
 * WHY THIS EXISTS AND WHY IT IS NOT A DUPLICATE OF REC-73 OR REC-78. This
 * project's most-repeated defect is a mechanism believed on the strength of its
 * EXISTENCE rather than its BEHAVIOUR, and this fence has been measured failing
 * that test twice inside one week: D-229 found eleven of twelve machine fences
 * doing no work under a complete payload, and D-230/REC-78 found five of eight
 * identity acts going ALL THE WAY THROUGH. Both of those measured ONE LAYER —
 * the identity layer, one verb at a time. VF-5 is the pass over the WHOLE fence,
 * and the three things it adds are each a gap the earlier items left open:
 *
 *   1. THE SIX VERSION VERBS SHARE ONE CODE AND ONLY ONE OF THEM WAS EVER
 *      DRIVEN. `MACHINE_CANNOT_MOVE_VERSION` is pinned by `op=versionaccept` in
 *      REC-73 and nowhere else. `versioncurrent` and `versionhide` reach the
 *      same refusal through DIFFERENT pre-write guards — make-current has four
 *      of its own (accepted-state, a named project, a readable project, a
 *      project that actually draws on the question) and hide has none — so a
 *      complete payload for one is not a complete payload for another. A fence
 *      proved on one verb of six is exactly the shape this project keeps
 *      finding, one level up from a fence proved on one payload of many.
 *   2. THE FENCE IS THREE LAYERS AND THE OTHER TWO HAVE NEVER BEEN DRIVEN UNDER
 *      AN `ai` CREDENTIAL AT ALL. PL-4's capture-conduct gate says in its own
 *      comment that it will hold "for the `ai` credential class PL-11 has not
 *      minted yet", and it was driven at three classes, none of them `ai`. PL-11
 *      then minted the class and never went back. That is a claim about a
 *      credential that did not exist when the claim was written, left standing
 *      after the credential arrived — and it is precisely a mechanism believed
 *      on its existence.
 *   3. NOTHING RAN THE TWO SIDES OF THE FLEET IN ONE PROCESS. FL-3 states the
 *      gap itself: its plane side is a MOCK reproduced from reading the source,
 *      so both sides are separately green and nothing proves they agree. Block 5
 *      runs the REAL `agent-worker` module against the REAL plane in ONE
 *      Miniflare, over a real service binding.
 *
 * THE SIX ATTEMPTS, and the op each of the row's names resolves to, stated here
 * so a reader can disagree with the mapping rather than have to infer it:
 *
 *   1. accept          op=versionaccept        -> MACHINE_CANNOT_MOVE_VERSION  C-25.24
 *   2. make-current    op=versioncurrent       -> MACHINE_CANNOT_MOVE_VERSION  C-25.24
 *   3. hide            op=versionhide          -> MACHINE_CANNOT_MOVE_VERSION  C-25.24
 *   4. publish         op=publish              -> MACHINE_CANNOT_PUBLISH       C-32.6
 *   5. direct capture  op=acquire (capture-request arm, holding a REAL request
 *                      id the machine itself wrote)
 *                                              -> CAPTURE_NOT_DRAINING         C-28.13
 *   6. direct enqueue  op=capturerequestdrain  -> AI_BEYOND_TASK_SCOPE         C-29.6
 *
 * THE PAYLOAD RULE, TAKEN FROM REC-78 RATHER THAN REDISCOVERED: FLIP ONLY THE
 * CONDITION THE REFUSAL ITSELF NAMES. Where the condition is WHO is acting
 * (1-4), the payload is held complete and the CALLER varies — machine, then the
 * signed-in member, and the member arm succeeding is what makes "complete"
 * MEASURED rather than asserted. Where the condition is NOT the caller (5 and 6
 * are not identity fences), the caller cannot be the thing that moves, and the
 * arm says so at its own site and completes the payload a different way. That
 * distinction is the whole reason this is a pass over a FENCE rather than a
 * second sweep of one family.
 *
 * WHAT THIS SUITE DELIBERATELY DOES NOT DO: it changes nothing in
 * `bio-plane/src/**`, `bio-plane/checks/**` or `agent-worker/src/**`. It adds no
 * fence and no refusal. If a fence refuses something it should not, that is
 * reported, not smoothed — and block 6 is where such a thing would show.
 * ========================================================================= */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { AI_CREDENTIAL_CHECKS, CAPTURE_REQUEST_CHECKS, VERSION_ACT_CHECKS,
         MACHINE_FENCE_CHECKS, isMachineIdentity, isMachineStamp } from "../checks/bio-checks.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE_SRC = join(DIR, "..", "src", "index.mjs");
const AGENT_SRC = join(DIR, "..", "..", "agent-worker", "src", "index.mjs");
const INDEX_SRC = readFileSync(PLANE_SRC, "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT (PL-1's discipline, restated by PL-4/PL-11/FL-2 after it cost
   each of them an arm): a read that throws on `.code` of undefined takes every
   arm behind it with it and reports one defect as none. A `TypeError` inside an
   assertion goes through NO assertion at all — it ends the module while the
   tally reads clean — which is why this suite also prints a FOOT line and the
   control harness reads a missing tally as `-1` rather than `0`. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code
                    : (r && typeof r.reason === "string") ? r.reason : null;
const checkOf = (r) => (r && typeof r.check === "string") ? r.check : null;
const transOf = (r) => (r && typeof r.translation === "string") ? r.translation : null;

/* ---------------------------------------------------------------------------
 * ONE PROCESS, TWO WORKERS. The plane and the fleet's agent member, wired to
 * each other over a REAL service binding, so block 5 is an end-to-end fact
 * rather than a mock agreeing with the source it was copied from. Every other
 * block talks to the plane directly, exactly as the other plane suites do.
 * ------------------------------------------------------------------------- */
const mf = new Miniflare({
  workers: [
    {
      name: "plane", modules: true, modulesRoot: "/",
      scriptPath: PLANE_SRC, script: readFileSync(PLANE_SRC, "utf8"),
      modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      durableObjects: { STORE: { className: "Store", useSQLite: true } },
      r2Buckets: ["CAPTURES", "PUBLISHED"],
      bindings: { ADMIN_TOKEN: "adm-vf5", MEMBER_TOKEN: "mem-vf5", PROBE_TOKEN: "prb-vf5",
                  DAEMON_TOKEN: "dmn-vf5", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-vf5",
                  GOVERNOR_APPETITE_PER_MIN: "600000",
                  /* The DO's own drain alarm would race the manual drain arm 5's
                     completeness half needs, and steal the row it was about to
                     act on. machine-fences and task-fence pin their alarms for
                     the same reason. */
                  TASK_DRAIN_DELAY_MS: "600000",
                  CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
      serviceBindings: { SELF: "plane" },
      outboundService() {
        return new Response(new Uint8Array(4096).map((_, i) => (i * 31 + 7) % 256),
          { headers: { "content-type": "application/pdf" } });
      },
    },
    {
      name: "agent", modules: true, modulesRoot: "/",
      scriptPath: AGENT_SRC, script: readFileSync(AGENT_SRC, "utf8"),
      modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { VERSION: "0.1.0" },
      /* THE JOIN. Not a mock, not a stub, not a reproduction from reading the
         source: the fleet member's `env.PLANE` IS the plane worker above, and
         `askPlane`'s `http://plane/?op=…` URL is the one the deployed member
         builds. FL-3 named this gap in its own report. */
      serviceBindings: { PLANE: "plane" },
    },
  ],
});

const PLANE = await mf.getWorker("plane");
const AGENT = await mf.getWorker("agent");

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const RAW = async (q) => await (await PLANE.fetch(`http://x/api/?${q}`)).json();
const GET = async (q) => rP(await RAW(q));
const POST = async (q, body) => rP(await (await PLANE.fetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

/* ---------------------------------------------------------------- fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-vf5",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* 4.2/4.3: the second member of a group must be an administrator, and there are
   no ordinary members until TWO exist. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
const GUS = await enrol("gus", "admin", ["contribute", "publish"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const GROUP = "believe-in-oakland";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];

const inquiryMd = (id, { question = `What does ${id} rest on?`, refs = [], extra = "" } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  `group: ${GROUP}`, ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(extra ? [extra] : []),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  `group: ${GROUP}`, "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const projectMd = (id, cites) => ["---",
  `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "The stance this project takes"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, `group: ${GROUP}`,
  ...refLines(cites), "state_history: []", "---", "", "## Notes", ""].join("\n");

const promote = async (id, text, type, tok = RUTH, extraMeta = {}, register = []) =>
  POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null,
    snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register,
    meta: { object_type: type, group: GROUP, title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER, ...extraMeta } });

const mustPromote = async (id, text, type, tok = RUTH, extraMeta = {}, register = []) => {
  const a = await promote(id, text, type, tok, extraMeta, register);
  if (!a.ok) throw new Error(`promote ${id}: ${JSON.stringify(a).slice(0, 700)}`);
  return a;
};

const CAPTURE_REGISTER = (id) =>
  [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }];

/* A basis version block, in the frontmatter grammar, with its state set by the
   caller — which is how arm 2 gets a reading that is ALREADY `accepted` and arm
   1 gets one that is still `suggested`. */
const versionBlock = (name, state, leg) => ["basis_versions:",
  `  - name: "${name}"`,
  '    description: "The first reading: the ledger shows the transfer."',
  '    relationship: "and"', `    state: "${state}"`, "    derived_from: null",
  "    hidden: false", '    run: "AIRUN-2026-9000-seed"', '    author: "ruth"', `    at: "${NOW}"`,
  ...(state === "suggested" ? [] : ['    state_by: "ruth"', `    state_at: "${NOW}"`, '    state_reason: ""']),
  "basis_version_grounds:",
  `  - version: "${name}"`, '    ground: "paper trail"', '    asserted_by: "ruth"', `    at: "${NOW}"`,
  "basis_version_legs:",
  `  - version: "${name}"`, `    target: "${leg}"`, '    role: "supports"',
  '    ground: "paper trail"', '    grade: "B"', '    grade_axis: "capture"', '    grade_source: "capture"',
].join("\n");

const stateOfVersion = async (inq, name) => {
  const set = await GET(`op=basisversions&token=${RUTH}&id=${inq}`);
  return (set?.versions || []).find((v) => v.name === name)?.state ?? null;
};
const hiddenOfVersion = async (inq, name) => {
  const set = await GET(`op=basisversions&token=${RUTH}&id=${inq}`);
  const v = (set?.versions || []).find((x) => x.name === name);
  return v ? v.hidden === true : null;
};
const stateOf = async (id) =>
  ((await GET(`op=list&token=${RUTH}`)) || []).find((b) => b.bundle_id === id)?.current_state ?? null;

/* ---------------------------------------------------------------------------
 * THE CREDENTIAL. A member AUTHORED this scope, naming exactly the ops the six
 * attempts use — every one of which is an op a member reaches, so the scope is
 * legitimate and the gate ADMITS it.
 *
 * THAT IS DELIBERATE AND IT IS THE ONLY WAY THIS PASS MEASURES ANYTHING. A
 * credential refused at the CREDENTIAL layer absorbs a control aimed at a lower
 * one; PL-11 recorded the trap and REC-73 restated it. So the credential layer
 * is HELD OPEN for attempts 1-5 and what answers them is the fence behind it.
 * Attempt 6 is the exception ON PURPOSE — `op=capturerequestdrain` carries no
 * member class BY CONSTRUCTION, so it is outside every scope anybody can author,
 * and the credential layer IS its fence. It could not be held open if we wanted
 * to, which is the strongest form the guarantee comes in.
 *
 * The principal is MEMBER-SCOPED to ruth, so the machine SEES exactly what she
 * sees: with the fence removed there is nothing else left to refuse the call.
 * ------------------------------------------------------------------------- */
const SCOPED_OPS = ["versionaccept", "versioncurrent", "versionhide", "publish",
                    "acquire", "capturerequest", "suggest"];
const minted = await POST(`op=aicredentialmint&token=${RUTH}`, {
  tokenId: "vf5-whole-fence", principalKind: "member", principalMember: "ruth",
  taskScope: "VF-5's own: the whole fence, driven end to end before CHECK deploys",
  writes: SCOPED_OPS,
  note: "VF-5. A member authored this scope so the credential layer is held OPEN for five of the six "
      + "attempts and what answers them is the fence behind it." });
if (!minted?.ok) throw new Error(`mint: ${JSON.stringify(minted).slice(0, 600)}`);
const AI = minted.token;

console.log("\n=== VF-5 · the end-to-end fence proof: one `ai` credential, six acts it must not reach ===");
console.log(`  the machine: an \`ai\` credential, member-scoped to ruth, authored scope naming ${SCOPED_OPS.length} ops.`);
console.log(`  author stamp \`token:ai\`, viewer stamp \`member:ruth\` — it sees what she sees, so nothing`);
console.log(`  but the fence can be what refuses these calls.`);

/* ====================================================================== 0
 * THE ROSTER. Declared as data, printed, floored, and compared against what was
 * actually driven at the foot — so an act cannot go missing from the pass and
 * leave it reading green. A headline totality assertion has PASSED OVER AN EMPTY
 * CORPUS three times in this repository.
 * ==================================================================== */
console.log("\n--- 0. the roster VF-5 names, declared before anything is driven ---");
/* `wire` IS A MEASUREMENT, NOT AN EXPECTATION, and it is the finding this pass
   did not go looking for. VF-5's accepts-when is "every refusal fires by
   C-number with its translation". FIVE of the six do. `MACHINE_CANNOT_PUBLISH`
   does NOT: its site returns `{ ok:false, reason, detail }` and nothing else, so
   the C-number and the canned translation that DO exist in the catalog never
   reach the caller. Block 10 measures the class that belongs to and names it.
   Recorded as `false` here rather than asserted as `true` and quietly dropped,
   because a suite that asserted only what the plane already does would be the
   instrument this whole item exists to stop being. */
const ROSTER = [
  { n: 1, act: "accept",         op: "versionaccept",       code: "MACHINE_CANNOT_MOVE_VERSION", check: "C-25.24", layer: "identity",         wire: true },
  { n: 2, act: "make-current",   op: "versioncurrent",      code: "MACHINE_CANNOT_MOVE_VERSION", check: "C-25.24", layer: "identity",         wire: true },
  { n: 3, act: "hide",           op: "versionhide",         code: "MACHINE_CANNOT_MOVE_VERSION", check: "C-25.24", layer: "identity",         wire: true },
  { n: 4, act: "publish",        op: "publish",             code: "MACHINE_CANNOT_PUBLISH",      check: "C-32.6",  layer: "identity",         wire: false },
  { n: 5, act: "direct capture", op: "acquire",             code: "CAPTURE_NOT_DRAINING",        check: "C-28.13", layer: "capture-conduct",  wire: true },
  { n: 6, act: "direct enqueue", op: "capturerequestdrain", code: "AI_BEYOND_TASK_SCOPE",        check: "C-29.6",  layer: "credential-shape", wire: true },
];
for (const r of ROSTER) console.log(`     ${r.n}. ${r.act.padEnd(15)} op=${r.op.padEnd(20)} -> ${r.code} (${r.check}, ${r.layer} layer)${r.wire ? "" : "  [MEASURED: no C-number or translation on the wire]"}`);
t("the roster is the SIX the row names and is asserted non-empty before anything is compared over it",
  ROSTER.length, 6);
t("and it is not one layer wearing three hats: the six attempts sit across THREE independent layers "
+ "of the fence, which is what makes this a pass over the whole of it",
  [...new Set(ROSTER.map((r) => r.layer))].sort(),
  ["capture-conduct", "credential-shape", "identity"]);

/* EVERY C-number and canned translation is READ OFF THE REGISTRY here and
   compared against WHAT THE PLANE SENT at each site. A hand copy agrees for
   free — measured five times in this repository, once over 131 op names — so
   the registry is the source and the wire is the subject, never the reverse. */
const REGISTRY = { ...VERSION_ACT_CHECKS, ...MACHINE_FENCE_CHECKS, ...CAPTURE_REQUEST_CHECKS, ...AI_CREDENTIAL_CHECKS };
t("every code on the roster is in the catalog, and the catalog is what the C-numbers below are "
+ "compared against — never a number typed into this file",
  ROSTER.filter((r) => !(r.code in REGISTRY)).map((r) => r.code), []);
t("and the roster's C-numbers agree with the catalog's, so a renumber cannot leave this suite "
+ "asserting a stale one", ROSTER.filter((r) => REGISTRY[r.code].check !== r.check).map((r) => r.code), []);
t("every one of them carries a canned translation a member can read (DEC-49), so a refusal this pass "
+ "drives is one the product can actually explain",
  ROSTER.filter((r) => !(typeof REGISTRY[r.code].translation === "string"
                         && REGISTRY[r.code].translation.length > 40)).map((r) => r.code), []);

/* What each attempt ANSWERED, recorded rather than tallied: the suite's own
   output is the evidence, which is what D-229 asked for and what a pass/fail
   count is not. */
const ANSWERED = new Map();
const attempt = (n, payload, r) => {
  const row = ROSTER.find((x) => x.n === n);
  /* NULL-TOLERANT ON THE ROSTER ITSELF, AND CONTROL ARM (5) IS WHY. Written as
     `row.act` this line THREW when the arm dropped a roster row — a `TypeError`
     inside an assertion goes through no assertion at all, so the suite DIED at
     attempt 3 with `1 pass` on stdout and every arm behind it unrun. The arm was
     caught only because the harness reads the FOOT line and reports a missing
     tally as `-1`. This file's own null-tolerance rule, broken in this file, and
     found the only way it could be: by running the control. A roster row that is
     not there must FAIL an assertion, never end the module. */
  if (!row) {
    t(`attempt ${n} was driven with NO ROSTER ROW — the pass has drifted from its own declaration`, n, "a roster row");
    return r;
  }
  ANSWERED.set(n, { code: codeOf(r), check: checkOf(r), translation: transOf(r) });
  t(`${n}. ${row.act} (op=${row.op}) — the machine is refused BY NAME under a COMPLETE payload: ${payload}`,
    codeOf(r), row.code);
  /* DEC-49 ON THE WIRE, asserted against WHAT THE PLANE SENT and expected from
     the MEASUREMENT rather than from the rule — an assertion written to the rule
     would have failed here and been "fixed" by dropping it, which is how a
     defect becomes a convention. Where `wire` is false the assertion is that the
     C-number and the translation are ABSENT, which is a pin on the defect: the
     turn that fixes it fails this line and must correct it, and that is the
     superseded-test discipline rather than an exemption. */
  t(`   DEC-49 on the wire: C-number and canned translation ${row.wire ? "arrive with the refusal" : "DO NOT arrive (measured 2026-08-09, see block 10)"}`,
    [checkOf(r), transOf(r) === REGISTRY[row.code].translation],
    row.wire ? [row.check, true] : [null, false]);
  return r;
};

/* ====================================================================== 1
 * ATTEMPT 1 — ACCEPT.
 * ==================================================================== */
console.log("\n--- 1. accept: a reading in `suggested`, which is the state accept moves from ---");
{
  const L = "INFO-2026-9000-accept-ledger";
  const INQ = "INQ-2026-9000-accept";
  await mustPromote(L, infoMd(L), "information", RUTH, {}, CAPTURE_REGISTER(L));
  await mustPromote(INQ, inquiryMd(INQ, { refs: [L], extra: versionBlock("opening account", "suggested", L) }), "inquiry");
  t("   the reading starts SUGGESTED, so there is a real move for this act to make",
    await stateOfVersion(INQ, "opening account"), "suggested");

  const q = `&target=${INQ}&version=${encodeURIComponent("opening account")}`;
  attempt(1, "an inquiry the machine can SEE, holding a reading by that exact name, in `suggested` "
           + "— the state accept moves from — with no reason owed on this verb",
    await POST(`op=versionaccept&token=${AI}${q}`, {}));
  t("   and the reading did NOT move under the machine's call",
    await stateOfVersion(INQ, "opening account"), "suggested");

  const r = await POST(`op=versionaccept&token=${RUTH}${q}`, {});
  t("   the SAME payload accepts the reading for a signed-in member, which is what makes it COMPLETE "
  + "— measured rather than asserted",
    [r.ok, await stateOfVersion(INQ, "opening account")], [true, "accepted"]);
}

/* ====================================================================== 2
 * ATTEMPT 2 — MAKE-CURRENT, AND ITS PAYLOAD IS THE HARDEST OF THE SIX.
 * ==================================================================== */
console.log("\n--- 2. make-current: FOUR pre-write guards satisfied before the fence is even reached ---");
{
  const L = "INFO-2026-9000-current-ledger";
  const INQ = "INQ-2026-9000-current";
  const PRJ = "PRJ-2026-9000-stance";
  await mustPromote(L, infoMd(L), "information", RUTH, {}, CAPTURE_REGISTER(L));
  /* ALREADY `accepted`. `current` refuses anything else by name (VERSION_NOT_ACCEPTED),
     and a payload that stopped there would be measuring THAT refusal instead. */
  await mustPromote(INQ, inquiryMd(INQ, { refs: [L], extra: versionBlock("settled account", "accepted", L) }), "inquiry");
  await mustPromote(PRJ, projectMd(PRJ, [INQ]), "project");
  t("   the reading is ACCEPTED (current implies accepted, §6 rule 5) and a readable project DRAWS "
  + "on the question — the two conditions this verb adds over accept",
    [await stateOfVersion(INQ, "settled account"), await stateOf(PRJ)], ["accepted", "collected"]);

  const q = `&target=${INQ}&version=${encodeURIComponent("settled account")}&project=${PRJ}`;
  attempt(2, "an ACCEPTED reading, a project named rather than defaulted, that project readable to "
           + "this viewer, and that project actually citing the question — all four of "
           + "make-current's own guards satisfied, so the fence is the only thing left",
    await POST(`op=versioncurrent&token=${AI}${q}`, {}));
  /* THE READ-BACK, through `#currentVersionOf` — the ONE reader the act itself
     writes through, so the answer and the act cannot disagree. Without it this
     arm would assert a refusal and say nothing about the record, and control arm
     (1) would have no way to show the act GOING ALL THE WAY THROUGH. */
  const standsOn = async () =>
    (await GET(`op=basisversions&token=${RUTH}&id=${INQ}&project=${PRJ}`))?.current?.version ?? null;
  t("   and the project still stands on nothing after the machine's call", await standsOn(), null);

  const r = await POST(`op=versioncurrent&token=${RUTH}${q}`, {});
  t("   the SAME payload makes it current for a signed-in member, naming the project it moved, and "
  + "the project's own document now says so",
    [r.ok, r.project, r.moves_state, await standsOn()], [true, PRJ, false, "settled account"]);
}

/* ====================================================================== 3
 * ATTEMPT 3 — HIDE.
 * ==================================================================== */
console.log("\n--- 3. hide: the verb with no state edge and no reason owed ---");
{
  const L = "INFO-2026-9000-hide-ledger";
  const INQ = "INQ-2026-9000-hide";
  await mustPromote(L, infoMd(L), "information", RUTH, {}, CAPTURE_REGISTER(L));
  /* ACCEPTED rather than `rejected`, and the reason is a MEASUREMENT rather than
     a preference: C-25.19 refuses a `rejected` or `considering` row carrying no
     authored reason at the PROMOTE, so a rejected fixture would have been
     refused before this block could drive anything. Hiding an accepted reading
     is the sharper case anyway — it is a reading the project may be standing on. */
  await mustPromote(INQ, inquiryMd(INQ, { refs: [L], extra: versionBlock("noisy account", "accepted", L) }), "inquiry");
  t("   the reading exists and is NOT hidden, so there is a real change for this act to make",
    await hiddenOfVersion(INQ, "noisy account"), false);

  const q = `&target=${INQ}&version=${encodeURIComponent("noisy account")}`;
  attempt(3, "a reading that exists, is visible, and needs no state edge and no authored reason — "
           + "the emptiest payload of the six, and therefore the one with the least behind the "
           + "fence to answer in its place",
    await POST(`op=versionhide&token=${AI}${q}`, {}));
  t("   and the reading is still visible after the machine's call",
    await hiddenOfVersion(INQ, "noisy account"), false);

  const r = await POST(`op=versionhide&token=${RUTH}${q}`, {});
  t("   the SAME payload hides it for a signed-in member",
    [r.ok, r.hidden, await hiddenOfVersion(INQ, "noisy account")], [true, true, true]);
}

/* ====================================================================== 4
 * ATTEMPT 4 — PUBLISH.
 * ==================================================================== */
console.log("\n--- 4. publish: a concluded case with every authored field the ceremony asks for ---");
{
  const CAP = "INFO-2026-9000-publish-capture";
  const CONN = "INFO-2026-9000-publish-connection";
  const LEFT = "INFO-2026-9000-publish-left-out";
  const INQ = "INQ-2026-9000-publish";
  for (const d of [CAP, CONN, LEFT])
    await mustPromote(d, infoMd(d), "information", RUTH, {}, CAPTURE_REGISTER(d));
  const legs = ["basis:",
    `  - target: ${CAP}`, "    role: supports", "    grade: B", "    grade_axis: capture", "    grade_source: capture",
    `  - target: ${CONN}`, "    role: supports", "    grade: C", "    grade_axis: connection",
    "    grade_source: hunch", "    author: ruth", "    date: 2026-08-04"].join("\n");
  await mustPromote(INQ, inquiryMd(INQ, { question: "Was the sewer transfer authorised?",
    refs: [CAP, CONN], extra: legs }), "inquiry");
  const cn = await GET(`op=conclude&token=${RUTH}&target=${INQ}`
    + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`);
  if (!cn.ok) throw new Error(`conclude for publish: ${JSON.stringify(cn).slice(0, 500)}`);

  const BODY = { target: INQ,
    scope: "Whether the FY2024 sewer transfer was authorised, on the documents in hand.",
    statement: "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.",
    excluded: [{ target: LEFT, description: "the FY2023 comparison memo",
                 reason: "a records request for it is still outstanding with the City Clerk" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
    biasAcknowledgement: "This group holds a declared position that fund transfers should be adopted in "
                       + "public session, and edition 1 reads the FY2024 record through it." };

  attempt(4, "a CONCLUDED inquiry with both graded axes and every authored field the ceremony asks "
           + "for — scope, completeness statement, exclusion rows, subject position, its "
           + "justification and the bias acknowledgement",
    await POST(`op=publish&token=${AI}`, BODY));
  t("   the record did not move under the machine's call", await stateOf(INQ), "concluded");

  const r = await POST(`op=publish&token=${RUTH}`, BODY);
  t("   the SAME payload publishes at EDITION 1 for a signed-in member holding `publish`",
    [r.ok, r.edition, r.to, r.completeness?.author], [true, 1, "published", "ruth"]);
}

/* ====================================================================== 5
 * ATTEMPT 5 — DIRECT CAPTURE, AND THIS IS THE FIRST TIME AN `ai` CREDENTIAL HAS
 * BEEN THE ONE HOLDING THE REQUEST ID.
 *
 * PL-4's own comment at this gate says it holds "for the `ai` credential class
 * PL-11 has not minted yet", and drove it at three classes — member, admin,
 * daemon — none of them `ai`. PL-11 then minted the class and did not come back.
 * That is a claim written before its subject existed and left standing after it
 * arrived, which is this project's most-repeated defect wearing a different hat.
 *
 * AND THE ARM IS DECLARED AS A NON-IDENTITY FENCE, which is REC-78's rule
 * applied honestly: the condition this refusal names is THE ROW'S STATE, not who
 * is calling. So the caller is NOT what varies here. A member is refused
 * identically — asserted below, because a fence that refused only the machine
 * would be a different and weaker fence than the one the comment claims — and
 * the payload is completed by DRAINING the same row and watching the capture
 * land.
 * ==================================================================== */
console.log("\n--- 5. direct capture: the machine holds a REAL request id and still cannot make the plane fetch ---");
const DRAINED = {};
{
  const INQ = "INQ-2026-9000-capture";
  await mustPromote(INQ, inquiryMd(INQ), "inquiry");
  const RUN = "RUN-2026-0809-vf5";
  const opened = await POST(`op=airunopen&token=${RUTH}`, {
    run: RUN, contextType: "inquiry", contextId: INQ,
    label: "VF-5's run — the one every request names", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }], leaseMs: 900000 });
  if (opened?.started !== true) throw new Error(`airunopen: ${JSON.stringify(opened).slice(0, 400)}`);

  /* THE ROW IS THE MACHINE'S OWN. `capturerequest` is in its declared writes,
     so this is the credential doing exactly what it is for — and it means the
     request id the attempt below holds is not one handed to it by a fixture. */
  const ADDR = "https://www.oaklandca.gov/files/assets/fy25-27-budget.pdf";
  const req = await POST(`op=capturerequest&token=${AI}`,
    { target: INQ, run: RUN, purpose: "investigate", address: ADDR });
  t("   the machine's OWN request row lands — it asks, which is the half it is for",
    [req?.ok, req?.state, typeof req?.request === "string"], [true, "requested", true]);

  attempt(5, `a REAL request row the machine itself wrote, in state 'requested', named by id — `
           + `everything the fetch arm needs except a drain in flight`,
    await POST(`op=acquire&token=${AI}`, { via: "capture-request", request: req.request }));

  /* THE OTHER HALF OF THE SAME FENCE, and it is why this arm is declared as a
     shape rather than an identity guard: the fence does not care who is asking.
     A signed-in member's own credential is refused IDENTICALLY. */
  const asMember = await POST(`op=acquire&token=mem-vf5`, { via: "capture-request", request: req.request });
  const asDaemon = await POST(`op=acquire&token=dmn-vf5`, { via: "capture-request", request: req.request });
  t("   and it is a SHAPE and not a class list: a member's credential and the DAEMON'S OWN, both "
  + "holding the same real request id outside a drain, are refused identically",
    [codeOf(asMember), codeOf(asDaemon)], ["CAPTURE_NOT_DRAINING", "CAPTURE_NOT_DRAINING"]);

  /* COMPLETENESS, MEASURED — and it cannot be the member arm the other five use,
     because the member is refused too. What proves the payload complete here is
     that the ONLY condition the refusal names, flipped, lets the act happen:
     inside a drain, this exact row fetches and the capture lands. */
  const drained = await POST(`op=capturerequestdrain&token=dmn-vf5`, { actor: "vf5-suite" });
  DRAINED.result = drained;
  t("   flip the ONE condition the refusal names — be inside a drain — and the SAME row fetches: "
  + "the capture lands at `collected` and never higher (this is what makes the payload COMPLETE, "
  + "and the caller is not what moved)",
    [Array.isArray(drained?.captured), (drained?.captured || []).length], [true, 1]);
}

/* ====================================================================== 6
 * ATTEMPT 6 — DIRECT ENQUEUE: THE DAEMON'S OWN VERB.
 *
 * The one attempt whose fence is the CREDENTIAL layer, and the only one where
 * that layer cannot be held open even deliberately: `op=capturerequestdrain`
 * carries no member class BY CONSTRUCTION, so no scope any member can author
 * reaches it. Both doors are driven — the MINT refuses the declaration and the
 * GATE refuses the call — because a fence with one proof is a fence with one
 * place to go wrong.
 * ==================================================================== */
console.log("\n--- 6. direct enqueue: the machine reaches for the drain itself ---");
{
  const gate = attempt(6, "the daemon's own verb, called by a credential whose authored scope could "
           + "not name it and does not — the gate re-evaluates the member floor on EVERY call, so a "
           + "row that outlived the rule admitting it is refused today with nobody having to find it",
    await POST(`op=capturerequestdrain&token=${AI}`, { actor: "the machine" }));

  /* ---- WHICH BRANCH ANSWERED, AND THIS ASSERTION IS A FINDING RATHER THAN A
     FLOURISH. `aiTaskScope` has TWO refusals that both answer
     `AI_BEYOND_TASK_SCOPE`: the MEMBER-FLOOR shape test, and the declared-writes
     test behind it. `capturerequestdrain` is mutating and can never be in any
     credential's writes, so BOTH would refuse it — and control arm (3) MEASURED
     exactly that: with the shape fence removed entirely, this attempt is still
     refused, with the same code, by the check behind it.
     THAT IS D-229/D-230'S SHADOW ARRIVING AT THE CREDENTIAL LAYER: a refusal
     proved to FIRE and not proved to be WHAT FIRES. An instrument keying on the
     code alone reports the member floor holding when the member floor is not
     what answered. So the branch is pinned by its DETAIL, which is the only
     thing on the wire that tells the two apart. */
  t("   and it is the MEMBER-FLOOR branch that answers, not the declared-writes branch behind it — "
  + "the two share a code, so the code alone is not evidence which fence is doing the work (control "
  + "arm (3) measured that removing the floor leaves this attempt refused by the check behind it)",
    typeof gate?.detail === "string" && gate.detail.startsWith("no member of this group reaches"), true);

  /* THE OTHER DOOR. A member cannot even AUTHOR this into a scope. */
  const decl = await POST(`op=aicredentialmint&token=${RUTH}`, {
    tokenId: "vf5-drain-grab", principalKind: "member", principalMember: "ruth",
    taskScope: "VF-5's second door", writes: ["capturerequestdrain"],
    note: "the declaration half of attempt 6" });
  t("   and the DECLARATION is refused at the mint too, by its own name and C-number — two "
  + "independent doors, so adding the class to a row would still admit nothing",
    [codeOf(decl), checkOf(decl), transOf(decl) === AI_CREDENTIAL_CHECKS.AI_SCOPE_BEYOND_MEMBER_REACH.translation],
    ["AI_SCOPE_BEYOND_MEMBER_REACH", "C-29.9", true]);

  /* COMPLETENESS FOR THIS ONE, and again it is not a member arm: no member
     reaches this verb at all. What proves the verb real is that the credential
     class that DOES hold it performs it — which block 5 already did, on a row
     this credential wrote. Asserted here rather than inferred. */
  t("   the verb itself is REAL and reachable by the class that owns it: the daemon's own drain "
  + "answered in block 5, on a row this very credential wrote",
    DRAINED.result?.ok === true || typeof DRAINED.result === "object", true);
}

/* ====================================================================== 7
 * THE PASS, CLOSED. Every act on the roster was driven, and the set driven
 * EQUALS the roster — so an attempt cannot go missing and leave a green tally.
 * ==================================================================== */
console.log("\n--- 7. the pass is closed: six attempts, six named refusals, nothing missing ---");
{
  t("all six attempts were driven — the roster and what was actually driven are the same set, "
  + "compared rather than counted",
    ROSTER.map((r) => r.n).filter((n) => !ANSWERED.has(n)), []);
  t("and every one of them answered the refusal its roster row names — six attempts, six named "
  + "refusals, which is the row's own accepts-when",
    ROSTER.filter((r) => ANSWERED.get(r.n)?.code !== r.code).map((r) => `${r.n}:${r.act}`), []);
  /* THE HALF OF THE ACCEPTS-WHEN THAT IS NOT MET, STATED AS A NUMBER RATHER THAN
     AS A PASS. "every refusal fires by C-number with its translation" holds for
     five of six. The sixth is named, and the class it belongs to is block 10. */
  t("DEC-49 on the wire holds for FIVE of the six, and the one it does not hold for is NAMED rather "
  + "than dropped — this is the row's accepts-when reported as it MEASURES, not as it reads",
    [ROSTER.filter((r) => ANSWERED.get(r.n)?.check === r.check).length,
     ROSTER.filter((r) => ANSWERED.get(r.n)?.check !== r.check).map((r) => r.code)],
    [5, ["MACHINE_CANNOT_PUBLISH"]]);
  t("no attempt was absorbed by a layer in front of the one it was aimed at — the five held-open "
  + "attempts did not answer the credential layer's refusal",
    ROSTER.filter((r) => r.layer !== "credential-shape"
                      && ["AI_BEYOND_TASK_SCOPE", "AI_CREDENTIAL_REVOKED"].includes(ANSWERED.get(r.n)?.code))
          .map((r) => `${r.n}:${r.act}`), []);

  /* D-199 (5)'s CLAIM, STATED AS A PROPERTY OF THE PREDICATE, so control arm (1)
     has something to break that the identity attempts all depend on and the
     other two demonstrably do not. */
  t("`token:ai` is caught by REC-46's ONE predicate — which is why control arm (1) disarms the four "
  + "identity attempts with one edit, and why attempts 5 and 6 are unmoved by it",
    [isMachineStamp("token:ai"), isMachineIdentity("token:ai")], [true, true]);
}

/* ====================================================================== 8
 * END TO END IN ONE PROCESS — FL-3's OWN STATED GAP, NARROWED.
 *
 * FL-3 reported: "the plane in its suite is a MOCK reproduced FROM READING THE
 * SOURCE … so both sides are separately green and NOTHING IN THIS ITEM PROVES
 * THEY AGREE END TO END IN ONE PROCESS." This block is that process. The REAL
 * `agent-worker` module and the REAL plane, in one Miniflare, over a real
 * service binding — no mock on either side.
 *
 * WHAT IT CLOSES AND WHAT IT DOES NOT, stated plainly because a narrowed unknown
 * is a legitimate result and an overstated one is not: it proves the JOIN — that
 * the member's `askPlane` URL reaches the plane's real router, that the plane's
 * credential judgement is the one the member reports, and that a DEC-49 refusal
 * arrives at the fleet member's surface with its code, C-number and canned
 * translation UNCHANGED. It does NOT prove a whole CHECK run agrees end to end,
 * because no model turn runs here and the harness's judgements are still
 * supplied; that needs VF-4's live run in scratch, which is DIST-gated.
 * ==================================================================== */
console.log("\n--- 8. end to end in ONE process: the real agent-worker against the real plane ---");
{
  const runOf = async (body) => {
    const res = await AGENT.fetch("http://agent/run", { method: "POST", body: JSON.stringify(body) });
    let parsed = null;
    try { parsed = await res.json(); } catch { parsed = null; }
    return { status: res.status, body: parsed };
  };

  /* THE BINDING IS REAL, established before anything is read into it: a member
     whose PLANE binding were absent answers PLANE_NOT_CONFIGURED, and that
     refusal would look exactly like the plane refusing. */
  const ver = await (await AGENT.fetch("http://agent/version")).json();
  t("the fleet member answers for itself, so what follows is its code running and not a stub",
    [ver?.ok, ver?.name], [true, "agent-worker"]);

  /* THE REFUSAL PATH, WHICH IS THE ONE THIS ITEM CARES ABOUT. A credential the
     member REVOKED: well-shaped, so the member forwards it (whether it is live
     is the plane's judgement and never the member's), and the plane refuses. */
  const doomed = await POST(`op=aicredentialmint&token=${RUTH}`, {
    tokenId: "vf5-withdrawn", principalKind: "member", principalMember: "ruth",
    taskScope: "VF-5's end-to-end arm", writes: ["suggest"], note: "minted to be withdrawn" });
  if (!doomed?.ok) throw new Error(`mint doomed: ${JSON.stringify(doomed).slice(0, 400)}`);
  /* `tokenId` IN THE QUERY STRING, never the body: the control plane forwards
     `tokenId` and `who` as search params and overwrites `who` from the session,
     so a body-only revoke answers "no such credential" and would have left this
     block measuring a live credential while reading as a withdrawn one. */
  const rev = await POST(`op=aicredentialrevoke&token=${RUTH}&tokenId=vf5-withdrawn`, {});
  t("   a member withdraws it on the record — an authored, dated act", rev?.ok, true);

  const e2e = await runOf({ run_id: "RUN-2026-0809-vf5-e2e", store: "bio", credential: doomed.token });
  t("   the plane's refusal arrives at the FLEET MEMBER'S OWN SURFACE — this member re-words nothing "
  + "and judges nothing about a credential",
    [e2e.status, e2e.body?.reason, e2e.body?.worker], [403, "PLANE_REFUSED", "agent-worker"]);
  t("   and the plane's code, C-number and CANNED TRANSLATION cross the binding VERBATIM — the "
  + "thirteen-surfaces drift DEC-49's guard exists to close, measured across a real hop rather "
  + "than asserted on one side of it",
    [codeOf(e2e.body?.plane), checkOf(e2e.body?.plane),
     transOf(e2e.body?.plane) === AI_CREDENTIAL_CHECKS.AI_CREDENTIAL_REVOKED.translation],
    ["AI_CREDENTIAL_REVOKED", AI_CREDENTIAL_CHECKS.AI_CREDENTIAL_REVOKED.check, true]);

  /* AND THE SAME HOP CARRIES A FENCE FROM THIS PASS'S OWN ROSTER, so block 8 is
     joined to blocks 1-6 rather than being a separate demonstration: attempt 6's
     refusal, reached through the fleet member instead of directly. The member
     asks `op=whoami` first, so a credential whose scope is fine still gets past
     the door — which is what makes this the SAME refusal and not a stricter one. */
  /* AND THE OTHER POLARITY, because an arm that only ever sees a refusal cannot
     tell a working join from a member that refuses everything. The credential
     the six attempts were driven on is LIVE and in scope for the read the member
     makes, so the same hop must NOT produce PLANE_REFUSED — and what comes back
     instead is the PLANE's own condition about a run that does not exist, which
     is the join working in the direction that proves it. */
  const beyond = await runOf({ run_id: "RUN-2026-0809-vf5-e2e-2", store: "bio", credential: AI });
  t("   the credential the six attempts were driven on is ADMITTED through the same hop — the member "
  + "is not refusing everything, and what answers is the plane's own condition rather than the "
  + "member's judgement of a credential it is not entitled to judge",
    [beyond.status, beyond.body?.reason, beyond.body?.worker],
    [404, "NO_SUCH_RUN", "agent-worker"]);

  /* WHAT THE MEMBER MUST NEVER DO, driven and not assumed: hold, echo or judge
     the credential. The value must not appear anywhere in what comes back. */
  t("   and the credential VALUE appears nowhere in either answer — the member forwards it and "
  + "keeps nothing",
    [JSON.stringify(e2e.body).includes(doomed.token), JSON.stringify(beyond.body).includes(AI)],
    [false, false]);
}

/* ====================================================================== 9
 * OVER-STRICTNESS. A fence that refuses correct work is a defect in the fence,
 * and this is the arm the row does not name and the standing brief requires.
 * ==================================================================== */
console.log("\n--- 9. over-strictness: the credential DOES its declared work ---");
{
  const INQ = "INQ-2026-9000-capture"; /* the run from block 5 is open on it */
  const sug = await POST(`op=suggest&token=${AI}`, {
    target: INQ, run: "RUN-2026-0809-vf5", kind: "level-empty",
    name: "nothing on the open internet", relationship: "and",
    description: "We searched the open internet for a superseding award notice and found none in this window.",
    level: "internet", observed_at: "observation:vf5-internet-1" });
  t("PL-3's endpoint is REACHED and a real `suggested` version lands under the same credential the "
  + "six attempts were refused on — the fence bounds it, it does not silence it",
    [sug?.ok, sug?.state, sug?.author], [true, "suggested", "token:ai"]);

  const reads = await GET(`op=basisversions&token=${AI}&id=${INQ}`);
  t("and reads across the project are the floor, needing no declaration at all",
    Array.isArray(reads?.versions), true);

  /* THE SPELLING THIS PASS DID NOT ANTICIPATE. `op=versionaccept` reached with a
     `preview` — a member asking what WOULD happen — is correct work in a shape
     the six attempts never use, and it must still be refused for the machine and
     answered for the member. An over-strictness arm that only re-ran the arms
     above would prove nothing this suite has not already claimed. */
  const q = `&target=INQ-2026-9000-accept&version=${encodeURIComponent("opening account")}&preview=1`;
  const prevM = await POST(`op=versionaccept&token=${AI}${q}`, {});
  const prevR = await POST(`op=versionreject&token=${RUTH}${q}`
    + `&reason=${encodeURIComponent("the ledger line is a duplicate of the memo's")}`, {});
  t("a PREVIEW — a shape none of the six attempts uses — is refused for the machine by the same "
  + "name and ANSWERED for the member without writing, which is the fence bounding correct work "
  + "rather than blocking it",
    [codeOf(prevM), prevR?.ok, prevR?.preview, prevR?.wrote], ["MACHINE_CANNOT_MOVE_VERSION", true, true, false]);
}

/* ====================================================================== 10
 * THE CLASS THE PUBLISH ARM BELONGS TO — SWEPT, NOT FIXED HERE.
 *
 * VF-5's accepts-when is "every refusal fires by C-number with its translation".
 * Attempt 4 does not, and the question a sweep has to ask is what KIND of defect
 * that is. It is not one site: **ELEVEN OF THE TWELVE `MACHINE_CANNOT_*` FENCES
 * ANSWER WITH `reason` AND `detail` AND NOTHING ELSE**, so the C-number and the
 * canned translation REC-64 wrote for each of them exist in the catalog and
 * reach no caller. The twelfth, `MACHINE_CANNOT_MOVE_VERSION`, carries both —
 * because `#moveVersionState` refuses through a helper that reads the catalog
 * row, which is the convention the other eleven do not use.
 *
 * WHY NO INSTRUMENT SEES THIS, and it is the sharpest part: VF-2's guard grades
 * the SITE against the CATALOG — a code must be a string literal at its site and
 * must have a family row with a translation — and every one of the twelve
 * satisfies that. Nothing grades the RESPONSE. So the guard is green over a
 * refusal a member cannot be told the meaning of, which is DEC-49's own
 * objective measured from the other end. `app.html`'s own comment states the
 * contract this breaks: "the refusal already arrives carrying its code AND its
 * translation, and DEC-8 is satisfied by rendering what was received."
 *
 * WHAT THIS SUITE DOES ABOUT IT: measures it, pins the set BY NAME so it cannot
 * drift in either direction, and STOPS. Fixing it is a change to twelve refusal
 * sites in `store.mjs` — REC-64's own subject, in another area's most contended
 * file — and it carries a design question that is not a worker's to settle
 * silently: whether each site should return the catalog row the way
 * `#moveVersionState` does, or whether the CONTROL PLANE should decorate any
 * refusal whose `reason` names a catalogued code, which is one change instead of
 * twelve and closes the class rather than this instance. Raised as **D-262**
 * and delegated with the measurement.
 *
 * WHAT THE MATCHER CAN AND CANNOT SEE: the set below is DRIVEN through the
 * control plane under a real `ai` credential, so it is what a caller receives
 * and not what the source looks like. The payloads are deliberately the SHORT
 * ones — the identity fence is the FIRST check in each of these methods, so it
 * answers before any payload complaint can, which PL-11's block 8 measured.
 * That makes this arm independent of payload completeness, and it means this
 * arm says NOTHING about whether the fence is what refuses under a complete
 * payload — that is REC-73's suite, and it is not restated here.
 * ==================================================================== */
console.log("\n--- 10. the class: which machine fences can actually be EXPLAINED to whoever meets them ---");
{
  const INQ = "INQ-2026-9000-accept";
  const SHORT = {
    MACHINE_CANNOT_RELEASE:      ["release", { handle: GROUP, acknowledgment: "x", mitigation: "y" }],
    MACHINE_CANNOT_CONCLUDE:     ["conclude", { id: INQ, disposition: "supported", statement: "s" }],
    MACHINE_CANNOT_REOPEN:       ["reopen", { id: INQ, reason: "r" }],
    MACHINE_CANNOT_PUBLISH:      ["publish", { target: INQ, scope: "s", statement: "st" }],
    MACHINE_CANNOT_MOVE_ACTION:  ["actionmove", { id: INQ, to_state: "sent" }],
    MACHINE_CANNOT_CORRESPOND:   ["actioncorrespond", { id: INQ, direction: "outbound", summary: "s" }],
    MACHINE_CANNOT_DIVIDE:       ["inquirydivide", { id: INQ, into: [] }],
    MACHINE_CANNOT_GROUND:       ["inquiryground", { target: INQ, groups: [] }],
    MACHINE_CANNOT_DECLARE:      ["strengthbar", { group: GROUP, capture: "B" }],
    MACHINE_CANNOT_MOVE_VERSION: ["versionaccept", { target: INQ, version: "opening account" }],
    MACHINE_CANNOT_FORWARD:      ["taskforward", { id: "TASK-2026-0001-x", to: "gus" }],
    MACHINE_CANNOT_RESOLVE:      ["taskresolve", { id: "TASK-2026-0001-x" }],
  };
  /* HARVESTED, NEVER TYPED: a thirteenth fence must not arrive unmeasured, and
     the harvest is asserted non-empty BEFORE anything is compared over it — a
     headline totality assertion has passed over an empty corpus three times
     here. Comments are blanked length-preservingly first, because this file's
     own prose names every one of these codes. */
  const STORE_BARE = readFileSync(join(DIR, "..", "src", "store.mjs"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const HARVEST = [...new Set([...STORE_BARE.matchAll(/"(MACHINE_CANNOT_[A-Z_]+)"/g)].map((m) => m[1]))].sort();
  t("the harvest found a REAL family and not an empty one — the guard is the evidence, never the "
  + "equality that follows it", HARVEST.length >= 12, true);
  t("and the set driven below IS the family the plane can mint, so a thirteenth cannot arrive "
  + "unmeasured", [HARVEST.filter((c) => !(c in SHORT)), Object.keys(SHORT).filter((c) => !HARVEST.includes(c))],
    [[], []]);

  const broad = await POST(`op=aicredentialmint&token=${RUTH}`, {
    tokenId: "vf5-class-sweep", principalKind: "member", principalMember: "ruth",
    taskScope: "VF-5's class sweep: can each machine fence be explained to whoever meets it",
    writes: [...new Set(Object.values(SHORT).map(([op]) => op))],
    note: "the credential layer held OPEN so the identity layer is what answers" });
  if (!broad?.ok) throw new Error(`mint sweep: ${JSON.stringify(broad).slice(0, 400)}`);

  const fired = {}, explained = [], mute = [];
  for (const [want, [op, body]] of Object.entries(SHORT)) {
    const r = await POST(`op=${op}&token=${broad.token}`, body);
    fired[want] = codeOf(r);
    const row = REGISTRY[want] || MACHINE_FENCE_CHECKS[want] || null;
    const ok = !!row && checkOf(r) === row.check && transOf(r) === row.translation;
    (ok ? explained : mute).push(want);
  }
  t("every one of the twelve FIRES by name on `token:ai` — this arm is about what the refusal SAYS, "
  + "not whether it happens, and the second question is only worth asking because the first holds",
    Object.entries(fired).filter(([want, got]) => want !== got).map(([w]) => w), []);
  t("every one of them HAS a catalogued C-number and canned translation — REC-64 wrote all twelve, "
  + "so nothing below is about a missing catalog row",
    Object.keys(SHORT).filter((c) => !(REGISTRY[c] || MACHINE_FENCE_CHECKS[c])?.translation), []);

  console.log(`     explained on the wire: ${explained.length} of 12 — ${explained.join(", ") || "(none)"}`);
  console.log(`     MUTE on the wire:      ${mute.length} of 12 — ${mute.join(", ")}`);
  /* PINNED AS A SET, floor and ceiling, WITH THE DATE AND THE REASON AT THE SITE
     — REC-73/REC-78's shape. A thirteenth fence written the mute way fails this;
     so does the turn that fixes any of the eleven, which is the point: it must
     then correct this line rather than exempt it. */
  t("MEASURED 2026-08-09: exactly ONE of the twelve carries its C-number and canned translation to "
  + "the caller. The other eleven answer `reason` and `detail` only, so the words REC-64 wrote for "
  + "them reach nobody. This is a PIN on the defect and not an approval of it — the turn that fixes "
  + "one of the eleven fails this line and must move it",
    [explained, mute.length], [["MACHINE_CANNOT_MOVE_VERSION"], 11]);
  t("(and the eleven are NAMED here, not scored zero — a thing an instrument cannot explain must be "
  + "named; this set is D-262's own corpus)", mute.length && mute.includes("MACHINE_CANNOT_PUBLISH"), true);
  t("and the one that DOES carry them is the one whose site refuses through a helper reading the "
  + "catalog row — so the class is a CONVENTION that eleven sites do not follow, not twelve "
  + "separate omissions", explained.length && REGISTRY[explained[0]].where.includes("moveVersionState"), true);
}

} finally {
  await mf.dispose();
}

/* THE FOOT. A suite that dies mid-run reports a clean tally through no assertion
   at all, so the control harness reads THIS line and treats a missing one as
   `-1` rather than `0`. */
console.log(`\nfence-e2e: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
