/* NEGATIVE CONTROL (M0-18, run 2026-08-09, worktree agent-a62aec7acd493144e): the
   provenance floor added to this file is armed by `test/provenance-floor.control.mjs`
   — COMMITTED, so it re-runs in one step. 58 of 58 checks as declared over eight arms,
   each armed ALONE with every other defence held open, every restore verified by sha256
   AND by a full byte comparison against a UNIQUELY-NAMED per-arm pristine copy with the
   byte count printed and floored. ARM 6 (three stages) is armed on this file and is a DIFFERENT exposure from the
   floors: a pin owed to an uncommitted file FAILS here and PASSES in the pre-M0-18 spelling.
   TWO ARMS CAME BACK WRONG FIRST AND BOTH FOUND DEFECTS IN THE HARNESS RATHER THAN IN
   THE SUBJECT — the harness pinned the very refusal codes its arm was about to test, and
   spelled an `op=` token that op-claims then read as a real claim. Recorded at their
   sites in the control, not smoothed. */
/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/machine-fences.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-3's, PL-4's and PL-11's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad, and every restore is verified BY sha256 AND BY CONTENT.
   ALL FIVE ARMS RUN 2026-08-08 IN WORKTREE agent-a75c0395e77e7eaed, every one behaving as declared, baseline 45/0 before each. Figures below are MEASURED.
   (1) NEUTER THE PREDICATE — `isMachineStamp` returns false in checks/bio-checks.mjs — and ALL TWELVE complete-payload arms FAIL NAMING THE MACHINE REFUSAL, not a payload complaint -> 15 pass, 30 FAIL. **AND HERE IS WHAT THE COMPLETE PAYLOAD BOUGHT, WHICH IS MORE THAN THE ITEM PREDICTED: TEN OF THE TWELVE ACTS THEN WENT ALL THE WAY THROUGH.** The machine RELEASED a collected document to `verified`, CONCLUDED a question, REOPENED one, PUBLISHED a case at edition 1, MOVED an action, wrote a CORRESPONDENCE entry at ord 0, DIVIDED a question into two children, GROUPED a basis, SET THE GROUP'S REQUIRED EVIDENTIARY STRENGTH (`author: token:ai` in the row, read back), and ACCEPTED a reading. Under PL-11's payloads the same edit produced ONE success and eleven payload complaints; under these it produces ten. **THE TWO THAT DID NOT: `taskforward` and `taskresolve`, both answering `NOT_YOURS` — REC-4's assignee fence catching what the machine fence let past.** Those two verbs are the only pair in the family with a SECOND independent fence behind the first, and nobody knew that until the arm was run with a payload good enough to reach it.
   (2) THE SENTINEL, ISOLATED — short-circuit `isMachineIdentity` for `token:` instead -> 17 pass, 28 FAIL, and `MACHINE_CANNOT_DECLARE` falls with it. It is the one act PL-11 measured going ALL THE WAY THROUGH, so it is the regression sentinel; the arm takes down BOTH its pin and the read-back that finds the bar declared, because a machine getting past a refusal and a machine changing what the group requires of its own evidence are two different facts.
   (3) THE SWEEP MUST BE ABLE TO GO BLIND AND SAY SO — make the identity predicate match nothing -> **43 pass, 2 FAIL, RE-MEASURED 2026-08-08 BY REC-78 IN WORKTREE agent-ae602f80abcaf9e01, all five arms re-run and every one still behaving as declared.** It read 42/3 when this suite expected a set of EIGHT unpinned codes: a blind walk found none of them, so the set arm failed too and was counted as a third failure. REC-78 pinned all eight and the expectation is now the EMPTY set, which a blind walk satisfies by accident — so that arm no longer fails here and the corpus FLOOR is the whole of what catches blindness. **THE ARM IS UNCHANGED AND STILL BEHAVES AS DECLARED; the figure moved because the SUBJECT moved, and it is recorded rather than smoothed.**
   (4) A THIRTEENTH FENCE MUST NOT ARRIVE UNMEASURED — drop `MACHINE_CANNOT_GROUND` out of the driven set -> 43 pass, 2 FAIL, naming the code and the count.
   (5) OVER-STRICTNESS, and it is not a separate arm because it is BUILT INTO EVERY PIN: each of the twelve payloads is driven a SECOND time by a signed-in MEMBER and must SUCCEED -> 45/0, all twelve member arms green. That is what makes a payload complete rather than merely valid.
   POLARITY: every pin asserts a specific code and its member twin asserts ok:true, so an arm cannot pass by asserting nothing; the harvest is asserted NON-EMPTY before it is compared; the sweep's corpus is floored on size before any membership claim is made over it.
   AND THE INSTRUMENT FAILED FIRST, INSIDE ITS OWN SWEEP. Block 4's unpinned-set arm reads `test/` for quoted codes, and on the first run it read THIS FILE — whose expected set is a literal array of exactly those codes — so every one of them counted as PINNED BY A SUITE and the arm reported an empty set. REC-73's own subject, arriving inside REC-73's own sweep, found the only way it could be: by running it.
 * =========================================================================
 * REC-73 / D-229 — THE TWELVE `MACHINE_CANNOT_*` FENCES, PROVED RATHER THAN
 * BELIEVED.
 *
 * WHY THIS SUITE EXISTS, AND IT IS AN INSTRUMENT FINDING RATHER THAN A DEFECT
 * REPORT. PL-11 ran DEC-55.5's second half for the first time in this project —
 * not *do the refusals fire* but *does removing the predicate make them all
 * pass* — and one edit disarmed all twelve. It then did the thing that turns a
 * pass into a finding: it recorded WHAT EACH ACT ANSWERED INSTEAD. Every one
 * fell through to an ordinary payload complaint sitting behind the fence
 * (`NO_ACKNOWLEDGMENT`, `NO_CONCLUSION`, `NO_REASON`, `NO_TARGET`,
 * `NO_PARTITION`, `NO_SUCH_TASK`, `VERSION_ACT_NO_SUCH_VERSION`), and NOT ONE
 * was refused AS A MACHINE. The twelfth is the proof rather than the exception:
 * `MACHINE_CANNOT_DECLARE` FULLY SUCCEEDED and a machine SET THE GROUP'S
 * REQUIRED EVIDENTIARY STRENGTH, because its payload happened to be complete.
 *
 * SO THE DEFECT WAS IN THE INSTRUMENT, NOT IN THE PLANE. Every one of the twelve
 * fences fires today and always did. What had never been shown is that the FENCE
 * is what fires — a refusal driven under a payload the plane would have refused
 * anyway has been shown to refuse, and has not been shown to be the thing that
 * refuses. THIS IS THE SHARPEST INSTANCE OF THIS SESSION'S MOST-REPEATED
 * FINDING: AN INSTRUMENT THAT PROVES LESS THAN IT APPEARS TO.
 *
 * WHAT THIS SUITE DOES ABOUT IT, IN ONE SENTENCE: it drives each of the twelve
 * acts under a COMPLETE payload — one that would otherwise SUCCEED, which is
 * what `MACHINE_CANNOT_DECLARE` proved is possible — and asserts the refusal by
 * name; then drives the SAME payload as a signed-in member and asserts it
 * succeeds. The member arm is not decoration: it is the EVIDENCE that the
 * payload was complete, measured rather than asserted, and it is the
 * over-strictness arm at the same time.
 *
 * WHAT IS DELIBERATELY NOT DONE: REC-46's predicate is not weakened, rewritten
 * or widened, and no new fence is added. REC-46 is why this was measurable in
 * ONE edit rather than eleven, and it is the only reason the question was ever
 * asked. The fences were believed on the strength of their first half; that is
 * a fact about the controls, and the controls are what this item moves.
 *
 * THE BLOCKS:
 *   1. THE HARVEST. The twelve are read OUT OF `store.mjs`, never typed, so a
 *      thirteenth cannot arrive unmeasured — asserted non-empty, and asserted
 *      EQUAL to the set actually driven below.
 *   2. THE TWELVE, each with a complete payload: machine refused BY NAME, the
 *      record UNMOVED, and the same payload accepted from a member.
 *   3. THE SWEEP. Which OTHER refusals are believed on the strength of their
 *      first half — a walk over every refusal `store.mjs` mints, reporting how
 *      much each one SHADOWS and whether any suite pins it at all.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
/* M0-18 — ONE mechanism, imported. This suite's exposure is NOT its siblings'
   and the difference is argued in full at the pin roster walk in block 4. */
import { readGitProvenance, repoPath, reportProvenance } from "../scripts/provenance.mjs";
import { isMachineIdentity, isMachineStamp } from "../checks/bio-checks.mjs";
import { makePublishingProject } from "./publishingproject.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "..", "..");                  // bio-plane/test -> repo root
const SRC = (f) => join(DIR, "..", "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT (PL-1's discipline, PL-4's restatement, PL-11's measured cost):
   an arm that throws on `.code` of undefined takes every arm behind it with it
   and reports one defect as none. */
const codeOf = (r) => (r && typeof r.reason === "string") ? r.reason
                    : (r && typeof r.code === "string") ? r.code : null;

/* Comments BLANKED length-preservingly before any source walk: this file's
   subject is named in dozens of comments inside the spans it walks, and a walk
   over raw source would read a fence's own explanation as a refusal site. */
const decomment = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length));
const STORE_BARE = decomment(STORE_SRC);

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec73", MEMBER_TOKEN: "mem-rec73", PROBE_TOKEN: "prb-rec73",
              DAEMON_TOKEN: "dmn-rec73", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-rec73",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              /* The DO's own drain alarm would race the manual drain the task
                 arms need, and steal the task they were about to act on.
                 task-fence.test.mjs pins it for the same reason. */
              TASK_DRAIN_DELAY_MS: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() { return new Response(new Uint8Array(2048), { headers: { "content-type": "application/pdf" } }); },
});
MF = mf;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());

try {

/* ---------------------------------------------------------------- fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-rec73",
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
const ANNA = await enrol("anna", "member", ["contribute"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const GROUP = "believe-in-oakland";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role}`])]
  : [];

const inquiryMd = (id, { question = `What does ${id} rest on?`, state = "open", refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  `group: ${GROUP}`, ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
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

const actionMd = (id) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Action ${id}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  `group: ${GROUP}`, "references: []", "state_history: []",
  "action_kind: cpra_request", "risk_tier: 1",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "", "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

const promote = async (id, text, type, tok = RUTH, extraMeta = {}, extraFiles = [], register = []) =>
  POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null,
    snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...extraFiles],
    register,
    meta: { object_type: type, group: GROUP, title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER, ...extraMeta } });

const mustPromote = async (id, text, type, tok = RUTH, extraMeta = {}, extraFiles = [], register = []) => {
  const a = await promote(id, text, type, tok, extraMeta, extraFiles, register);
  if (!a.ok) throw new Error(`promote ${id}: ${JSON.stringify(a).slice(0, 700)}`);
  return a;
};

const stateOf = async (id) =>
  ((await GET(`op=list&token=${RUTH}`)) || []).find((b) => b.bundle_id === id)?.current_state ?? null;

/* THE BROAD CREDENTIAL, AND WHY IT IS THE RIGHT INSTRUMENT — PL-11's block 8
   reasoning, one layer down. A credential refused at the CREDENTIAL layer
   absorbs a control aimed at the IDENTITY layer, so the scope here is one a
   MEMBER AUTHORED naming exactly the twelve ops (every one of which is an op a
   member reaches, so the scope is legitimate and the gate admits it). And the
   principal is MEMBER-SCOPED on purpose: an `ai` credential's viewer stamp IS
   its principal (`member:ruth`), so this machine SEES everything Ruth sees.
   That is what makes "complete payload" mean what it says — with the fence
   removed there is nothing else left to refuse the call. */
const MACHINE_OPS = ["release", "conclude", "reopen", "publish", "actionmove", "actioncorrespond",
                     "inquirydivide", "inquiryground", "strengthbar", "versionaccept",
                     "taskforward", "taskresolve",
                     /* `select` is not one of the twelve. It is here because a
                        selection is readable ONLY by the credential that made
                        it (`owner` is server-stamped, `class:ai` for this one),
                        so a handle Ruth made would be refused NOT_YOURS to the
                        machine — and release's arm would then be measuring the
                        selection's ownership rather than the fence. The machine
                        makes its own handle over the SAME ids. */
                     "select"];
const minted = await POST(`op=aicredentialmint&token=${RUTH}`, {
  tokenId: "rec73-complete-payload", principalKind: "member", principalMember: "ruth",
  taskScope: "REC-73's own: the twelve acts, driven with payloads that would otherwise succeed",
  writes: MACHINE_OPS,
  note: "REC-73 / D-229. A member authored this scope so the credential layer is held OPEN and what "
      + "answers these calls is the identity fence rather than the gate in front of it." });
if (!minted?.ok) throw new Error(`mint: ${JSON.stringify(minted).slice(0, 500)}`);
const AI = minted.token;

console.log("\n=== REC-73 / D-229 · the twelve MACHINE_CANNOT_* fences, under COMPLETE payloads ===");
console.log(`  the machine: an \`ai\` credential, member-scoped to ruth, authored scope naming ${MACHINE_OPS.length} ops (the twelve acts, plus op=select)`);
console.log(`  author stamp \`token:ai\`, viewer stamp \`member:ruth\` — it sees what she sees, so nothing`);
console.log(`  but the fence can be what refuses these calls.`);

/* ====================================================================== 1
 * THE HARVEST — PRODUCED BY READING THE PLANE, NEVER BY TYPING.
 * ==================================================================== */
console.log("\n--- 1. the twelve are harvested from source, so a thirteenth cannot arrive unmeasured ---");
const HARVEST = [...new Set([...STORE_BARE.matchAll(/"(MACHINE_CANNOT_[A-Z_]+)"/g)].map((m) => m[1]))].sort();
t("the harvest found a REAL family and not an empty set — the guard is the evidence, never the "
+ "equality that follows it", HARVEST.length >= 12, true);
t("`token:ai` is caught by REC-46's ONE predicate, which is why one edit disarms the whole family "
+ "and why this suite had to be written",
  [isMachineStamp("token:ai"), isMachineIdentity("token:ai")], [true, true]);

/* ====================================================================== 2
 * THE TWELVE. Each fixture is built so that the payload below WOULD SUCCEED.
 * ==================================================================== */
console.log("\n--- 2. each act: a COMPLETE payload, refused BY NAME as a machine, then accepted from a member ---");

/* Every act registers itself here. `op` is spelled as a LITERAL `op=<name>` at
   the call site as well, because scripts/coverage.mjs reads op reach out of the
   suite sources and an op reached only through a template hole reads as
   UNREACHED (D-43's class arriving through the test rather than the plane). */
const DRIVEN = [];
/* Each act reports the payload it was driven under and what it answered, so the
   suite's own output is the record D-229 asked for rather than a tally. */
const fence = (code, payload, machineAnswer) => {
  DRIVEN.push({ code, payload, machineAnswer });
  t(`${code} — the machine is refused BY NAME under a COMPLETE payload: ${payload}`,
    machineAnswer, code);
};

/* -------------------------------------------------------- (i) RELEASE */
{
  const DOC = "INFO-2026-7300-release";
  const ds = JSON.stringify({ v: 1 });
  const snap = "<html>snapshot</html>";
  const md = infoMd(DOC).replace("visuals: []",
    `visuals: []\ncontent_hash: "sha256:${sha("release body")}"`);
  await mustPromote(DOC, md, "information", RUTH, {}, [
    { path: "data/dataset.json", text: ds, bytes: ds.length, sha256: sha(ds) },
    { path: "snapshots/page.html", text: snap, bytes: snap.length, sha256: sha(snap) }]);
  const ACK = encodeURIComponent("homogeneous batch of one, bulk-release risks weighed");
  const MIT = encodeURIComponent("sender domain verified by hand against the portal");

  const mh = (await POST(`op=select&token=${AI}&kind=enumerated`, { ids: [DOC] })).handle;
  const m = await GET(`op=release&token=${AI}&handle=${mh}&acknowledgment=${ACK}&mitigation=${MIT}`);
  fence("MACHINE_CANNOT_RELEASE",
    "a collected Information carrying a well-formed content_hash, data/dataset.json and a "
    + "snapshots/ file, in the machine's OWN selection, with both the acknowledgment and the "
    + "mitigation authored", codeOf(m));

  const rh = (await POST(`op=select&token=${RUTH}&kind=enumerated`, { ids: [DOC] })).handle;
  const r = await GET(`op=release&token=${RUTH}&handle=${rh}&acknowledgment=${ACK}&mitigation=${MIT}`);
  t("  and the SAME payload releases for a signed-in member, which is what makes it COMPLETE — and "
  + "proves in the same breath that the machine's call wrote nothing",
    [r.ok, r.released, r.weight, await stateOf(DOC)], [true, [DOC], "refuse", "verified"]);
}

/* -------------------------------------------------------- (ii) CONCLUDE */
{
  const DOC = "INFO-2026-7300-conclude-basis";
  const INQ = "INQ-2026-7300-conclude";
  await mustPromote(DOC, infoMd(DOC), "information");
  await mustPromote(INQ, inquiryMd(INQ, { refs: [DOC], legs: [{ target: DOC, role: "supports" }] }), "inquiry");
  const CONCL = encodeURIComponent("The transfer rests on a 1998 resolution never rescinded");
  const FALS = encodeURIComponent("A rescinding resolution, or a memo naming a different authority");

  const m = await GET(`op=conclude&token=${AI}&target=${INQ}&conclusion=${CONCL}&falsifier=${FALS}`);
  fence("MACHINE_CANNOT_CONCLUDE",
    "an OPEN inquiry carrying one basis leg, with the conclusion AND the falsifier both authored",
    codeOf(m));
  t("  the record did not move under the machine's call", await stateOf(INQ), "open");

  const r = await GET(`op=conclude&token=${RUTH}&target=${INQ}&conclusion=${CONCL}&falsifier=${FALS}`);
  t("  and the SAME payload concludes for a signed-in member, attributed to her by the server",
    [r.ok, r.from, r.to, r.basis_legs, r.author], [true, "open", "concluded", 1, "ruth"]);
}

/* -------------------------------------------------------- (iii) REOPEN */
{
  const DOC = "INFO-2026-7300-reopen-basis";
  const INQ = "INQ-2026-7300-reopen";
  await mustPromote(DOC, infoMd(DOC), "information");
  await mustPromote(INQ, inquiryMd(INQ, { refs: [DOC], legs: [{ target: DOC, role: "supports" }] }), "inquiry");
  /* The disposition is taken through the act that creates it, so what is
     reopened is a real deferral with a real authored reason. */
  const h = (await POST(`op=select&token=${RUTH}&kind=enumerated`, { ids: [INQ] })).handle;
  const dp = await GET(`op=dispose&token=${RUTH}&handle=${h}&to=deferred&reason=${encodeURIComponent("waiting on the audit")}`);
  if (!dp.ok) throw new Error(`dispose: ${JSON.stringify(dp).slice(0, 400)}`);
  const WHY = encodeURIComponent("the audit landed and it names the transfer");

  const m = await GET(`op=reopen&token=${AI}&target=${INQ}&reason=${WHY}`);
  fence("MACHINE_CANNOT_REOPEN",
    "a DEFERRED inquiry — reopenable, which is the state this act needs — with the reason authored",
    codeOf(m));
  t("  the record did not move under the machine's call", await stateOf(INQ), "deferred");

  const r = await GET(`op=reopen&token=${RUTH}&target=${INQ}&reason=${WHY}`);
  t("  and the SAME payload reopens for a signed-in member",
    [r.ok, r.from, r.to, r.author], [true, "deferred", "open", "ruth"]);
}

/* -------------------------------------------------------- (iv) PUBLISH */
{
  const CAP = "INFO-2026-7300-publish-capture";
  const CONN = "INFO-2026-7300-publish-connection";
  const LEFT = "INFO-2026-7300-publish-left-out";
  const INQ = "INQ-2026-7300-publish";
  for (const d of [CAP, CONN, LEFT])
    await mustPromote(d, infoMd(d), "information", RUTH, {}, [],
      [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${d}`), encoding: "binary", bytes: 10 }]);
  const legs = ["basis:",
    `  - target: ${CAP}`, "    role: supports", "    grade: B", "    grade_axis: capture", "    grade_source: capture",
    `  - target: ${CONN}`, "    role: supports", "    grade: C", "    grade_axis: connection",
    "    grade_source: hunch", "    author: ruth", "    date: 2026-08-04"].join("\n");
  const md = inquiryMd(INQ, { question: "Was the sewer transfer authorised?", refs: [CAP, CONN] })
    .replace("---\n\n## Question", `${legs}\n---\n\n## Question`);
  await mustPromote(INQ, md, "inquiry");
  const cn = await GET(`op=conclude&token=${RUTH}&target=${INQ}`
    + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`);
  if (!cn.ok) throw new Error(`conclude for publish: ${JSON.stringify(cn).slice(0, 400)}`);

  /* ADDED 2026-08-10, CASE-2 / DEC-72: publication is a PRODUCTION OF A PROJECT
     and is fenced to a project OWNER. Fixture, not subject — this block's
     subject is the MACHINE fence, and the payload exists so that ONLY the
     credential can be what refuses it. RUTH owns it and is the member half of
     the pair below; the project declares no bar, so nothing is newly gated. */
  const PUB_PRJ = await makePublishingProject({
    post: POST, mf, sha, machineToken: "adm-rec73", owner: "ruth",
    id: "PROJ-2026-7300-publish", created: NOW, updated: LATER });
  const BODY = { target: INQ, project: PUB_PRJ, roles: { [INQ]: "load_bearing" },
    scope: "Whether the FY2024 sewer transfer was authorised, on the documents in hand.",
    statement: "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.",
    excluded: [{ target: LEFT, description: "the FY2023 comparison memo",
                 reason: "a records request for it is still outstanding with the City Clerk" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
    biasAcknowledgement: "This group holds a declared position that fund transfers should be adopted in "
                       + "public session, and edition 1 reads the FY2024 record through it." };

  const m = await POST(`op=publish&token=${AI}`, BODY);
  fence("MACHINE_CANNOT_PUBLISH",
    "a CONCLUDED inquiry with both graded axes, and every authored field the ceremony asks for — "
    + "scope, completeness statement, exclusion rows, subject position, its justification and the "
    + "bias acknowledgement",
    codeOf(m));
  t("  the record did not move under the machine's call", await stateOf(INQ), "concluded");

  const r = await POST(`op=publish&token=${RUTH}`, BODY);
  t("  and the SAME payload publishes at EDITION 1 for a signed-in member holding `publish`",
    [r.ok, r.edition, r.to, r.completeness?.author], [true, 1, "published", "ruth"]);
}

/* -------------------------------------------------------- (v) MOVE_ACTION */
{
  const ACT = "ACTN-2026-7300-move";
  await mustPromote(ACT, actionMd(ACT), "action", RUTH, { current_state: "planned" });
  const WHY = encodeURIComponent("the finding is concluded and the records request goes out today");

  const m = await GET(`op=actionmove&token=${AI}&target=${ACT}&to=active&reason=${WHY}`);
  fence("MACHINE_CANNOT_MOVE_ACTION",
    "a PLANNED action moved to `active` — a legal edge in the catalog's own table — with the reason "
    + "authored, and no resolution, which is exactly what a non-resolving move requires",
    codeOf(m));
  t("  the record did not move under the machine's call", await stateOf(ACT), "planned");

  const r = await GET(`op=actionmove&token=${RUTH}&target=${ACT}&to=active&reason=${WHY}`);
  t("  and the SAME payload moves the action for a signed-in member",
    [r.ok, r.from, r.to, r.author], [true, "planned", "active", "ruth"]);
}

/* -------------------------------------------------------- (vi) CORRESPOND */
{
  const ACT = "ACTN-2026-7300-correspond";
  await mustPromote(ACT, actionMd(ACT), "action", RUTH, { current_state: "planned" });
  const q = `&target=${ACT}&direction=sent&at=2026-08-11&medium=email&party=${encodeURIComponent("City Clerk")}`
    + `&account=${encodeURIComponent("We sent the request by email and kept the send receipt.")}`;

  const m = await GET(`op=actioncorrespond&token=${AI}${q}`);
  fence("MACHINE_CANNOT_CORRESPOND",
    "an action, a legal direction, a well-formed date, and a NAMED ACCOUNT — the testimony arm, "
    + "where the author IS the evidence, which is precisely why a machine may not take it",
    codeOf(m));

  const r = await GET(`op=actioncorrespond&token=${RUTH}${q}`);
  t("  and the SAME payload records the entry for a signed-in member — `ord` 0 is the proof the "
  + "machine's call appended nothing, measured rather than assumed",
    [r.ok, r.ord, r.held_as, r.author], [true, 0, "testimony", "ruth"]);
}

/* -------------------------------------------------------- (vii) DIVIDE */
{
  const A = "INFO-2026-7300-divide-a", B = "INFO-2026-7300-divide-b";
  const INQ = "INQ-2026-7300-divide";
  const KID_A = "INQ-2026-7300-authority", KID_B = "INQ-2026-7300-signature";
  for (const d of [A, B]) await mustPromote(d, infoMd(d), "information");
  await mustPromote(INQ, inquiryMd(INQ, { question: "Was it authorised, and did anyone sign it?",
    refs: [A, B], legs: [{ target: A, role: "supports" }, { target: B, role: "supports" }] }), "inquiry");
  const BODY = {
    reason: "This was two questions: whether the transfer was authorised at all, and who signed it.",
    children: [{ id: KID_A, question: "Was the FY2024 sewer fund transfer authorised?", legs: [0] },
               { id: KID_B, question: "Did anyone with delegated authority sign the memo?", legs: [1] }] };

  const m = await POST(`op=inquirydivide&token=${AI}&target=${INQ}`, BODY);
  fence("MACHINE_CANNOT_DIVIDE",
    "an OPEN inquiry with two basis legs, a reason, TWO children with canonical INQ- ids that do "
    + "not yet exist, each with its own authored question, and EVERY leg apportioned a home",
    codeOf(m));
  t("  the record did not move under the machine's call", await stateOf(INQ), "open");

  const r = await POST(`op=inquirydivide&token=${RUTH}&target=${INQ}`, BODY);
  t("  and the SAME payload divides for a signed-in member — the children the machine did NOT "
  + "create are created here, which is the same fact from the other side",
    [r.ok, r.to, r.terminal, r.into, r.apportioned_by],
    [true, "divided", true, [KID_A, KID_B], "ruth"]);
}

/* -------------------------------------------------------- (viii) GROUND */
{
  const A = "INFO-2026-7300-ground-a", B = "INFO-2026-7300-ground-b";
  const INQ = "INQ-2026-7300-ground";
  for (const d of [A, B]) await mustPromote(d, infoMd(d), "information");
  await mustPromote(INQ, inquiryMd(INQ, { refs: [A, B],
    legs: [{ target: A, role: "supports" }, { target: B, role: "supports" }] }), "inquiry");
  const BODY = { grounds: [{ ground: "charter", legs: [0] }, { ground: "code", legs: [1] }] };

  const m = await POST(`op=inquiryground&token=${AI}&target=${INQ}`, BODY);
  fence("MACHINE_CANNOT_GROUND",
    "an inquiry with two basis legs and a TOTAL partition over them — every leg in exactly one "
    + "group, both labels legal, and no reason owed because there is no earlier structure",
    codeOf(m));

  const r = await POST(`op=inquiryground&token=${RUTH}&target=${INQ}`, BODY);
  t("  and the SAME payload groups for a signed-in member — `authored` rather than `restructured` "
  + "is the proof the machine's call wrote no structure for this one to revise",
    [r.ok, r.act, r.grouped, r.grounds?.map((x) => x.asserted_by)],
    [true, "authored", true, ["ruth", "ruth"]]);
}

/* --------------------------------------------------- (ix) DECLARE — THE SENTINEL */
{
  /* THE ONE THAT WENT ALL THE WAY THROUGH. PL-11's arm (1) recorded that with
     the predicate neutered a machine SET THE GROUP'S REQUIRED EVIDENTIARY
     STRENGTH — no payload complaint behind it, because this act's payload was
     already complete. It needs no fixture at all, which is exactly why it was
     the one that succeeded. */
  const barOf = async () => (await GET(`op=strengthbarof&token=${RUTH}&group=${GROUP}`))?.bar ?? null;
  t("  no bar is declared for this group before either call — the guard, so 'it was set' cannot be "
  + "true before the act", await barOf(), null);
  const BODY = { capture: "B", connection: "C" };

  const m = await POST(`op=strengthbar&token=${AI}`, BODY);
  fence("MACHINE_CANNOT_DECLARE",
    "a legal grade on BOTH axes and the group defaulted — the payload PL-11 measured going all the "
    + "way through, which is why this act is the regression sentinel rather than the exception",
    codeOf(m));
  t("  and NOTHING was declared by the machine's call — the sentinel's whole point, since this is "
  + "the act PL-11 measured going through", await barOf(), null);

  const r = await POST(`op=strengthbar&token=${RUTH}`, BODY);
  t("  and the SAME payload sets the group's required strength for a signed-in member holding `publish`",
    [r.ok, r.capture, r.connection, r.author], [true, "B", "C", "ruth"]);
}

/* -------------------------------------------------------- (x) MOVE_VERSION */
{
  const L = "INFO-2026-7300-version-ledger";
  const INQ = "INQ-2026-7300-version";
  await mustPromote(L, infoMd(L), "information", RUTH, {}, [],
    [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${L}`), encoding: "binary", bytes: 10 }]);
  const versions = ["basis_versions:",
    '  - name: "opening account"',
    '    description: "The first reading: the ledger shows the transfer."',
    '    relationship: "and"', '    state: "suggested"', "    derived_from: null",
    "    hidden: false", '    run: "AIRUN-2026-7300-first"', '    author: "ruth"', `    at: "${NOW}"`,
    "basis_version_grounds:",
    '  - version: "opening account"', '    ground: "paper trail"', '    asserted_by: "ruth"', `    at: "${NOW}"`,
    "basis_version_legs:",
    '  - version: "opening account"', `    target: "${L}"`, '    role: "supports"',
    '    ground: "paper trail"', '    grade: "B"', '    grade_axis: "capture"', '    grade_source: "capture"',
  ].join("\n");
  const md = inquiryMd(INQ, { refs: [L] }).replace("---\n\n## Question", `${versions}\n---\n\n## Question`);
  await mustPromote(INQ, md, "inquiry");
  const stateOfVersion = async () => {
    const set = await GET(`op=basisversions&token=${RUTH}&id=${INQ}`);
    return (set?.versions || []).find((v) => v.name === "opening account")?.state ?? null;
  };
  t("  the reading starts SUGGESTED, so there is a real move for this act to make",
    await stateOfVersion(), "suggested");
  const q = `&target=${INQ}&version=${encodeURIComponent("opening account")}`;

  const m = await POST(`op=versionaccept&token=${AI}${q}`, {});
  fence("MACHINE_CANNOT_MOVE_VERSION",
    "an inquiry the machine can SEE, holding a reading by that exact name, in `suggested` — the "
    + "state `accept` moves from — with no reason owed on this verb",
    codeOf(m));
  t("  the reading did not move under the machine's call", await stateOfVersion(), "suggested");

  const r = await POST(`op=versionaccept&token=${RUTH}${q}`, {});
  t("  and the SAME payload accepts the reading for a signed-in member",
    [r.ok, await stateOfVersion()], [true, "accepted"]);
}

/* ------------------------------------------------ (xi)/(xii) FORWARD, RESOLVE */
{
  /* A task exists only by the route its producer has: enqueued at the Durable
     Object by the capture path, filed by a promote, and drained. There is no
     control-plane `op=taskenqueue` — deliberately (index.mjs says so) — so the
     fixture reaches past the door the same way task-fence.test.mjs does. */
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`,
    { method: "POST", body: JSON.stringify(body) })).json();
  const AT = "2026-07-31T12:00:00Z";
  let n = 0;
  const makeTask = async () => {
    n++;
    const cap = (n + 0x7300).toString(16).padStart(64, "0");
    const bundle = `INFO-2026-7300-task-fixture-${n}`;
    await doPost("taskenqueue", { kind: "authority-undetermined", captureSha: cap,
      subject: "https://www.oaklandca.gov/documents/agenda.pdf", at: AT });
    await mustPromote(bundle, infoMd(bundle), "information", RUTH, {}, [],
      [{ sha256: cap, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }]);
    /* The drain is the consumer and is a MACHINE op by declaration — a
       signed-in session is refused it, which is the plane saying that filing
       the queue is not a member's act. So the fixture uses the machine
       credential the harness binds, exactly as queue-state.test.mjs does. */
    const d = await POST("op=taskdrain&token=mem-rec73", { now: AT });
    const made = (d?.created || []).find((c) => c.refers_to === bundle);
    if (!made) throw new Error(`drain created no task for ${bundle}: ${JSON.stringify(d).slice(0, 400)}`);
    return made.id;
  };
  const rowOf = async (id) =>
    ((await GET(`op=tasks&token=${RUTH}`))?.tasks || []).find((x) => x.id === id) ?? null;

  const taskF = await makeTask();
  const fBody = { id: taskF, to: "anna", now: AT };
  const mf1 = await POST(`op=taskforward&token=${AI}`, fBody);
  fence("MACHINE_CANNOT_FORWARD",
    "a REAL drained task by its real id, forwarded to an ACTIVE member who is not already its "
    + "assignee — the payload the assignee herself succeeds with two lines below",
    codeOf(mf1));
  t("  the task did not move under the machine's call",
    [(await rowOf(taskF))?.assignee, (await rowOf(taskF))?.status], ["ruth", "open"]);
  const rf = await POST(`op=taskforward&token=${RUTH}`, fBody);
  t("  and the SAME payload forwards it for the signed-in assignee", [rf.ok, rf.assignee], [true, "anna"]);

  const taskR = await makeTask();
  const rBody = { id: taskR, now: AT };
  const mr1 = await POST(`op=taskresolve&token=${AI}`, rBody);
  fence("MACHINE_CANNOT_RESOLVE",
    "a REAL drained task by its real id, in `open`, resolved by a caller the fence would otherwise "
    + "admit — the assignee's own payload",
    codeOf(mr1));
  t("  the task did not move under the machine's call", (await rowOf(taskR))?.status, "open");
  const rr = await POST(`op=taskresolve&token=${RUTH}`, rBody);
  t("  and the SAME payload resolves it for the signed-in assignee", [rr.ok, rr.status], [true, "resolved"]);
}

/* ====================================================================== 3
 * THE SWEEP AND THE COMPLETENESS ARM.
 * ==================================================================== */
console.log("\n--- 3. the driven set IS the harvested set: a thirteenth fence cannot arrive unmeasured ---");
{
  const drivenCodes = DRIVEN.map((d) => d.code).sort();
  t("(twelve acts were actually driven — the guard before the equality, because two empty sets are "
  + "equal and prove nothing)", drivenCodes.length, 12);
  t("EVERY MACHINE_CANNOT_* the plane can mint was driven under a COMPLETE payload",
    HARVEST.filter((c) => !drivenCodes.includes(c)), []);
  t("and nothing was driven that the plane does not mint", drivenCodes.filter((c) => !HARVEST.includes(c)), []);
  t("every one of them answered with its OWN name — this is the whole item, stated once as a set",
    DRIVEN.filter((d) => d.machineAnswer !== d.code).map((d) => [d.code, d.machineAnswer]), []);
}

/* ====================================================================== 4
 * THE SWEEP — WHICH OTHER REFUSALS ARE BELIEVED ON THE STRENGTH OF THEIR
 * FIRST HALF.
 *
 * WHAT THE INSTRUMENT IS. A refusal that sits in front of other refusals in the
 * same method SHADOWS them: while it fires, nothing behind it can. So a control
 * that drives it with a payload the plane would have refused anyway has shown
 * that the refusal FIRES and has not shown that the refusal is WHAT FIRES. This
 * walk measures the shadow — how many distinct refusals sit BEHIND each one in
 * its own method — and reports which of them any suite pins at all.
 *
 * AND WHAT IT CANNOT SEE, STATED RATHER THAN DISCOVERED. It cannot tell a
 * complete payload from an incomplete one: that is the judgement REC-73 made by
 * hand for twelve acts, and no walk over source can make it. It reads a method
 * as the span between two headers at class indent, so a refusal inside a nested
 * helper is attributed to the enclosing method. And it decides "pinned" by
 * looking for the code as a quoted literal in `test/`, so a suite that asserts a
 * code through a variable reads as no pin at all. Every one of those errs
 * towards reporting MORE work than exists, which is the safe direction for an
 * instrument whose subject is instruments.
 * ==================================================================== */
console.log("\n--- 4. the sweep: an instrument that proves less than it appears to, looked for elsewhere ---");
{
  const heads = [...STORE_BARE.matchAll(/^ {2}(?:static\s+)?(?:async\s+)?(#?[A-Za-z_$][\w$]*)\s*\(/gm)]
    .filter((m) => !/^(if|for|while|switch|catch|return|constructor)$/.test(m[1]));
  const methods = heads.map((h, i) => ({
    name: h[1], body: STORE_BARE.slice(h.index, i + 1 < heads.length ? heads[i + 1].index : STORE_BARE.length) }));
  const CODE = /(?:reason:\s*"([A-Z][A-Z0-9_]{2,})"|\brefusals?\s*\(\s*"([A-Z][A-Z0-9_]{2,})"|\brefuse\s*\(\s*"([A-Z][A-Z0-9_]{2,})")/g;
  /* An IDENTITY guard: the 300 characters in front of the refusal ask WHO the
     caller is rather than WHAT they sent. Deliberately generous — see the
     header's note on which direction this errs in. */
  const IDENTITY = /isMachineIdentity|isMachineStamp|isAdminMember|#isAdmin|\bactor\b|\bauthor\b|\bwho\b|\bviewer\b|principal|assignee|owner/;

  /* THIS FILE IS EXCLUDED FROM THE CORPUS IT READS, AND IT WAS NOT A
     PRECAUTION — it was measured. The expected set below is a literal array of
     quoted codes, so on the first run every one of them read as PINNED BY A
     SUITE and the arm reported an empty set: the instrument had cited itself as
     the evidence. That is REC-73's own subject arriving inside REC-73's own
     sweep, found the only way it could be — by running it. A mention here is
     not a pin, and the walk now says so. */
  const SELF = "machine-fences.test.mjs";

  /* ---- M0-18 · THIS WALK IS A DIFFERENT EXPOSURE FROM ITS SIX SIBLINGS, AND
   * IT NEEDED A DIFFERENT ANSWER. STATED HERE RATHER THAN COLLAPSED INTO THEM.
   *
   * The six walks M0-18 guarded elsewhere in this battery all FLOOR on what they
   * found, so a phantom could only push a floor UP and the fix was to compute the
   * floor over `git ls-tree HEAD` while the sweep kept reading the whole tree.
   * NOTHING HERE FLOORS ON THIS WALK. `methods` and `rows` come from
   * `STORE_BARE`, a `readFileSync` of one named path, and no arrival can inflate
   * those — the floor two blocks down is not this walk's, and the comment beside
   * it saying "the corpus this is claimed over is floored above" was WRONG about
   * WHICH corpus and is corrected below.
   *
   * WHAT THIS WALK DOES IS SATISFY A REQUIREMENT, WHICH FAILS IN THE GENEROUS
   * DIRECTION. `pinned()` asks whether ANY suite in this directory quotes a
   * refusal code, and the `unpinned` arm at the foot of this block demands the
   * answer be EMPTY. A phantom `.mjs` deposited into `test/` — `refs/stash` is
   * repository-wide across all sixty worktrees and `push -u` carries untracked
   * files (D-238, measured) — can only ADD strings, so it can only SHRINK
   * `unpinned`. A ratchet whose whole stated virtue is that it "cannot drift
   * either way" could therefore be satisfied by a file no other checkout has.
   * Blindness fails safe here (an empty walk pins nothing and `unpinned` grows,
   * loudly); ARRIVAL fails generous, and generous is the direction this project
   * treats as the serious one.
   *
   * SO `pinned()` ASKS ONLY THE COMMIT, AND THAT IS THE OPPOSITE NARROWING FROM
   * THE SIX. There it would have hidden a finding; here it is what makes the
   * finding visible, because a pin nobody has committed is a pin no other
   * checkout can see — the repository is the channel.
   *
   * THE COST, STATED BEFORE IT IS PAID rather than discovered by whoever pays it:
   * a worker who WRITES a pinning suite and has not committed it yet sees this
   * arm go RED. `scripts/provenance.mjs` deliberately REPORTS rather than fails
   * for exactly that reason, and this file departs from that provisional on one
   * ground: the report-only argument is about an instrument that would red on ANY
   * uncommitted suite, and this arm reds only when an uncommitted file is the
   * SOLE pin for a shadowing identity refusal. That is a narrow, true and
   * one-step-fixable state, and the failure NAMES the file and the code rather
   * than saying the count moved. THE ALTERNATIVE, if that proves wrong in
   * practice: assert on `unpinnedTree` and merely PRINT `unpinnedHead`. Reversing
   * costs one line, and the two sets are computed separately here so that it is
   * one line. */
  const TEST_FILES = readdirSync(DIR).filter((f) => f.endsWith(".mjs") && f !== SELF);
  const PROV = readGitProvenance(REPO);
  const committed = (f) => PROV.inHead === null ? true : PROV.inHead.has(repoPath(REPO, join(DIR, f)));
  const readOf = (f) => readFileSync(join(DIR, f), "utf8");
  const TESTS = TEST_FILES.map(readOf);
  const TESTS_HEAD = TEST_FILES.filter(committed).map(readOf);
  const pinnedTree = (code) => TESTS.some((s) => s.includes(`"${code}"`));
  const pinned = (code) => TESTS_HEAD.some((s) => s.includes(`"${code}"`));
  /* SAY UNVERIFIED, NEVER CLEAN (D-233). When git cannot answer, `committed()`
     says true for everything, the two rosters collapse, and this arm degrades to
     exactly its pre-M0-18 behaviour — which is the honest degradation and is
     asserted below rather than assumed. */
  const PIN_HEAD_SAYS = PROV.inHead === null
    ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so `pinned()` read the whole working tree and this is NOT a claim about any commit"
    : `in the commit at HEAD (${PROV.headSha})`;

  const rows = [];
  for (const m of methods) {
    const seq = [];
    for (const h of m.body.matchAll(CODE)) {
      const c = h[1] || h[2] || h[3];
      if (!seq.some((s) => s.code === c)) seq.push({ code: c, at: h.index });
    }
    seq.forEach((s, i) => {
      if (!IDENTITY.test(m.body.slice(Math.max(0, s.at - 300), s.at))) return;
      rows.push({ method: m.name, code: s.code, shadows: seq.length - 1 - i,
        pinned: pinned(s.code), pinnedTree: pinnedTree(s.code) });
    });
  }
  /* THE CORPUS IS FLOORED BEFORE ANY CLAIM IS MADE OVER IT. A walk that stopped
     yielding would otherwise report "nothing believed on half its evidence" and
     read as good news — REC-70's blind ratchet, one instrument over.
     CORRECTED 2026-08-09 BY M0-18, NEVER EXEMPTED, and the correction is about
     WHICH corpus this arm floors: `methods` and `rows` are read out of
     `STORE_BARE`, a `readFileSync` of ONE named path, so this line has never said
     anything about the `readdirSync` of `test/` that feeds `pinned()`. The old
     note at the `unpinned` arm claimed it did. The pin roster is floored
     separately, immediately below, which is what that note was reaching for. */
  t("(the walk reached a real corpus: methods, and identity-flavoured refusals inside them — read out of "
  + "store.mjs by name, so this floor is NOT a statement about the test/ walk below it)",
    [methods.length >= 300, rows.length >= 90], [true, true]);
  console.log(`  pin roster: ${TEST_FILES.length} suite(s) in test/ walked, ${TESTS_HEAD.length} of them `
    + `${PIN_HEAD_SAYS} — \`pinned()\` reads THOSE`);
  reportProvenance({
    prov: PROV,
    items: TEST_FILES.map((f) => ({ path: repoPath(REPO, join(DIR, f)), what: f,
      counted: "read as a source of refusal-code pins" })),
    instrument: "the pin roster walk",
    corpus: `${TEST_FILES.length} suite(s) walked, ${TESTS_HEAD.length} of them in the commit`,
    totals: PROV.inHead === null ? [] : [
      { label: "pinning suites", contaminated: TEST_FILES.length, reproducible: TESTS_HEAD.length, source: "suites" },
    ],
  });
  /* AND THE PIN ROSTER REACHED SOMETHING. `pinned()` returning false for
     everything makes `unpinned` GROW, which fails loudly — but it would fail
     while naming eight codes rather than naming the blind walk, and the next
     reader would go looking for the wrong defect. Floored so the blindness is
     reported as blindness. */
  t(`(and the PIN ROSTER reached a real corpus — a walk that read nothing would fail the arm below `
  + `while naming codes instead of naming itself: ${TESTS_HEAD.length} suite(s) ${PIN_HEAD_SAYS})`,
    TESTS_HEAD.length >= 50, true);

  const fences = rows.filter((r) => r.code.startsWith("MACHINE_CANNOT_"));
  t("the walk SEES the class it was built from — all twelve fences are identity guards it found",
    [...new Set(fences.map((r) => r.code))].sort(), HARVEST);
  t("and EVERY ONE of them shadows at least one payload complaint, which is the whole reason a "
  + "complete payload was needed to prove any of them",
    fences.filter((r) => r.shadows < 1).map((r) => r.code), []);

  const shadowing = rows.filter((r) => r.shadows >= 1 && !r.code.startsWith("MACHINE_CANNOT_"));
  const unpinned = [...new Set(shadowing.filter((r) => !r.pinned).map((r) => r.code))].sort();
  /* M0-18: the same answer over the WHOLE working tree, kept so the DIFFERENCE
     is nameable. A code in `pinnedOnlyByUncommitted` is one this checkout can
     see pinned and no other checkout can — the phantom's signature, and the
     thing the failure message must say instead of "a code went unpinned". */
  const unpinnedTree = [...new Set(shadowing.filter((r) => !r.pinnedTree).map((r) => r.code))].sort();
  const pinnedOnlyByUncommitted = unpinned.filter((c) => !unpinnedTree.includes(c));
  console.log(`  ${rows.length} identity-flavoured refusals across ${methods.length} methods; `
    + `${shadowing.length} of them shadow something and are NOT part of the twelve.`);
  console.log("  the ten deepest shadows outside the family, which is where this class lives next:");
  for (const r of [...shadowing].sort((a, b) => b.shadows - a.shadows).slice(0, 10))
    console.log(`    ${r.code.padEnd(32)} ${r.method.padEnd(26)} shadows ${String(r.shadows).padEnd(3)} `
      + `${r.pinned ? "pinned by a suite" : "** NO SUITE PINS IT AT ALL **"}`);
  /* WORSE THAN BELIEVED ON HALF ITS EVIDENCE: not measured at all. Pinned as an
     EXACT SET rather than a ceiling, so it must be moved deliberately in BOTH
     directions — a ceiling with slack is not a ratchet (PL-4 measured one 19
     codes low that had already flipped a control from RED to GREEN). To move
     it: name the code, say whether it was pinned or removed, and date it.

     MOVED 2026-08-08 BY REC-78, FROM EIGHT TO NONE, and every member of the set
     moved for the SAME reason — PINNED, none removed. All eight are now driven
     in `test/shadowed-refusals.test.mjs`, each under a payload complete but for
     the one condition it guards, each followed by the same act driven to
     success: BAD_HANDLE (enroll), EDITION_NOT_INCREMENTED (ratify), LEASE_HELD
     (actioncorrespond), NOT_ACTIVE (projectowneradd), NOT_AN_OWNER
     (projectownerremove), NO_AUTHOR (provenancechain, at the Durable Object
     route — REC-78 measured that NO caller class can reach it through the op,
     and pins the unreachability beside it), NO_CASE (queuemute), NO_OWNERS
     (projectownerrescue).

     THE EMPTY SET IS STILL A SET AND STILL FAILS IN BOTH DIRECTIONS. A ninth
     unpinned identity refusal appearing fails this arm; deleting REC-78's suite
     puts all eight back and fails it too, because `pinned()` reads `test/` and
     nothing else.

     CORRECTED 2026-08-09 BY M0-18, NEVER EXEMPTED, AND THE OLD NOTE HERE WAS
     WRONG ABOUT WHICH CORPUS DEFENDED THIS ARM. It read: *"the corpus this is
     claimed over is floored above, so an empty answer produced by a walk that
     went blind is caught before it gets here."* The floor above is over
     `methods` and `rows`, both read out of `store.mjs` BY NAME. The walk that
     can go blind is the `readdirSync` of `test/` behind `pinned()`, and nothing
     floored it. That floor now exists, immediately after the report — the note
     was reaching for a defence that had not been built.

     AND BLINDNESS WAS NEVER THIS ARM'S EXPOSURE ANYWAY. A pin roster that read
     NOTHING makes `unpinned` GROW and fails loudly. What could pass quietly is
     the opposite: an ARRIVAL. `pinned()` now asks `git ls-tree HEAD`, so a pin
     living only in an uncommitted file no longer satisfies this set, and the
     arm below names that case as itself rather than as a missing pin. The full
     argument, its cost, and the one-line way to reverse it are at the pin roster
     walk above. */
  t("the identity refusals that shadow something and that NO suite pins at all — MEASURED "
  + "2026-08-08 by REC-73, moved to EMPTY 2026-08-08 by REC-78 which pinned all eight, and this is "
  + "a set rather than a count so it cannot drift either way. M0-18: a pin is a pin IN THE COMMIT, "
  + `because a pin no other checkout can see is not one (${PIN_HEAD_SAYS})`,
    unpinned, []);
  /* NAMED SEPARATELY so the two failures do not read alike. A code here is
     pinned in this tree and in no commit — the arm above will already be red,
     and this is the sentence that says WHY, so nobody goes looking for a missing
     assertion that is sitting uncommitted in their own working directory. */
  t("...and no code owes its pin to a file that is in no commit — a pin that arrived rather than being "
  + "written here would satisfy the set above for free, which is D-238's payload in the generous direction",
    pinnedOnlyByUncommitted, []);
}

console.log(`\n${fail === 0 ? "OK" : "FAILED"}  ${pass} pass, ${fail} fail`);
} finally {
  await mf.dispose();
}
process.exit(fail === 0 ? 0 : 1);
