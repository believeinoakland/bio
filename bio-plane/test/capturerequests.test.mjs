/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/capturerequests.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-3's `suggest.control.mjs` precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad: a worker's harness was overwritten mid-turn by a concurrent worker on 2026-08-07, and a harness silently replaced between ARM and RESTORE reports a restore it never performed. Every arm is armed ALONE against a whole tree, every restore is verified BY sha256 AND BY CONTENT, and every arm names the assertions that MUST fail.
   THE ITEM'S SPINE IS ARM (1) AND EVERYTHING ELSE IS SECONDARY TO IT.
   ALL NINE ARMS RUN 2026-08-08 IN WORKTREE agent-ad191a5dd58a9327f, every one behaving as declared, baseline 97/97 and hygiene 467/467 before each. Figures below are MEASURED, not predicted.
   (1) THE SPINE — THE AI DOES NOT CAPTURE, IT REQUESTS. In src/index.mjs op=acquire's capture-request arm replace `if (!d || d.draining !== true) {` with `if (false) {` -> 89 pass, 8 FAIL: a member's, an operator's and THE DAEMON'S OWN credential each become able to perform the fetch (C-28.13, CAPTURE_NOT_DRAINING), no-fetch-left-the-instance flips, and the DEC-49 floor fails because the code becomes undrivable. The daemon's own arm is the sharpest: the gate is the ROW'S STATE and not the caller's class, which is what makes it hold for PL-11's unminted `token:ai`.
   (2) CONDUCT 1, THE AGENT (C-28.6). In src/store.mjs #captureRequestConduct replace `if (!CAPTURE_UA_MODES.includes(q.ua_mode))` with `if (false)` -> 95 pass, 2 FAIL naming the illegible-mode arm and the floor. NOTE C-28.6 HAS TWO PRODUCERS and this arm neuters the DRIVABLE one: the contact-URL refusal behind it guards the composed CivicOS string, which carries the component by construction, so the floor measures the CODE'S reachability rather than a BRANCH'S (PL-3's arm-6 finding, met again here).
   (3) CONDUCT 1b, THE UNRECORDED MEMBER AGENT (C-28.7). Replace `if (!ua)` (the member-browser branch) with `if (false)` -> 95 pass, 2 FAIL; and the RECORDED member-agent arm STAYS GREEN, because BOB-3 PERMITS that fetch and a check that refuses it is a defect in the check.
   (4) CONDUCT 2, THE PURPOSE TOKEN (C-28.8). Replace `if (!CAPTURE_PURPOSES.includes(q.purpose))` with `if (false)` -> 93 pass, 4 FAIL: the refusal, its canned translation, "no request left the instance", and the terminal-row arm.
   (5) CONDUCT 3, RATE (C-28.9). Replace `if (this.#captureRequestHostHeld(q.host, nowMs))` with `if (false)` -> 94 pass, 3 FAIL. THIS ARM'S DECLARATION WAS CORRECTED AFTER ITS FIRST RUN AND THE CORRECTION IS A FINDING: "the held request is still queued" does NOT fail, because the per-host governor inside `governedFetch` refuses the fetch one layer down anyway. What the drain's rule buys is visible where the arm DOES fail — the request is turned away BEFORE the attempt and the run's log carries D-104's GOVERNED split, instead of our own politeness being reported to the run as the source failing.
   (6) ATTRIBUTION, ONE PRINCIPAL (C-28.11). In src/store.mjs #captureRequestAttribution replace `if (!row || !plane || !claude)` with `if (false)` -> 92 pass, 5 FAIL: a capture is MADE for an act the record cannot attribute, the read composes a half attribution, and the member-facing notification announces it.
   (7a) THE PURGE (D-113), against hygiene.test.mjs. Remove BOTH `DELETE FROM capture_requests` lines -> hygiene FAILS naming it: `72 of 73 tables covered by purge or a stated exemption (uncovered: ["capture_requests"])`.
   (7b) THE HALF hygiene CANNOT SEE. Remove ONLY the whole-store DELETE -> hygiene stays GREEN at 467/467 while a purge reporting scope ALL leaves the outbound queue standing; this suite drops to 94 pass, 3 FAIL naming it. MEASURED AND REPORTED: the D-113 check derives its covered set from `DELETE FROM <table>` anywhere in the purge METHOD, so one arm satisfies it. Delegated to whoever owns hygiene rather than fixed here.
   (8) THE COMPLETION NOTIFICATION. Remove `...this.#conditionsCaptureRequested(viewer, now),` from #queueConditions -> 93 pass, 4 FAIL: a completed capture is silent and the run waits on something that already happened.
   (9) OVER-STRICTNESS, and these PASS rather than fail: a document under a robots.txt `Disallow` path CAPTURES (BOB-3); a RECORDED member-browser agent CAPTURES and its agent leaves verbatim; a second request for the same address from the same run is the standing row and not a second fetch; and a `purpose: acquire` request captures exactly as `investigate` does. A fence that refuses correct work is a defect in the fence.
 * ========================================================================= */
/* IS-BUILD-PLAN PL-4 / IS-4 / SWEEP §4b.1 — `capture_requests`, DRAINED BY THE DAEMON.
 *
 * WHAT IS ASSERTED HERE, in the order the blocks run:
 *
 *  1. THE SHAPE. A scratch-class table in `capture_sessions`' family, before the
 *     `host_governor` block, in `purge` in BOTH arms and counted by `op=stats`.
 *  2. THE DOOR. A request is a ROW: `captureRequest` contains no outbound call
 *     at all, asserted over its own source, and a request that arrives carrying
 *     a capture is refused by name.
 *  3. THE SPINE. Request -> drain -> the capture lands at `collected` and never
 *     higher. A member, a probe and an operator each holding a REAL request id
 *     are refused when they try to make the fetch themselves.
 *  4. DEC-47's CONDUCT, ONCE AT THE DRAIN: the agent, the purpose token, rate.
 *     Each driven out of the plane and pinned by its own C-number against WHAT
 *     THE PLANE SENT rather than against the registry the number was read from.
 *  5. BOTH PRINCIPALS. The attribution names the daemon AS THE ACTOR, machine-
 *     shaped, at the session's request, with the plane principal AND the
 *     Claude-account principal — and a row that can name only one is refused.
 *  6. THE NOTIFICATION. The completion surfaces on D-61's catalogued kind,
 *     carrying both principals in its basis.
 *  7. BOB-3. A `robots.txt` disallow does not bar a public document, and the
 *     recorded member-browser agent is permitted — both DRIVEN, because a rule
 *     that is absent by decision needs an arm proving the absence is real.
 *  8. DEC-49: the driven code set EQUALS the registry, floor as well as ceiling.
 * ========================================================================= */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CAPTURE_REQUEST_CHECKS, CAPTURE_PURPOSES, CAPTURE_UA_MODES,
         userAgentIsLegible, civicosUserAgent, isMachineIdentity } from "../checks/bio-checks.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT, PL-1's discipline carried forward: an arm that throws on
   `.code` of undefined takes every arm behind it with it and reports one defect
   as none. An accumulating assertion is only HALF that fix — a TypeError never
   reaches it. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : null;

/* THE DOCUMENT THE SESSION ASKS FOR. Two of them sit under a path Oakland's real
   robots.txt disallows — 63 of its 82 Disallow rules are Public Ethics
   Commission publications (SOURCE-ACCESS.md, MEASURED 2026-07-30) — because
   BOB-3 ruled that a disallow does not bar a public document and an absent rule
   needs an arm. */
const PEC = "https://www.oaklandca.gov/Government/Boards-Commissions/Public-Ethics-Commission/Publications/annual-report-2025.pdf";
const BUDGET = "https://www.oaklandca.gov/files/assets/fy25-27-budget.pdf";
const OTHER = "https://records.alamedacountyca.gov/contracts/2026-0042.pdf";
const HELD = "https://www.cooling-off.example.gov/held.pdf";
const BODY = new Uint8Array(4096).map((_, i) => (i * 31 + 7) % 256);

/* WHAT THE SOURCE SAW. The egress mock records the agent of every request, so
   the conduct assertions are made against the BYTES THAT LEFT rather than
   against the row the drain judged — the "checked one thing, sent another" gap
   is only closed by looking at what arrived. */
const SEEN = [];
let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl4", MEMBER_TOKEN: "mem-pl4", PROBE_TOKEN: "prb-pl4",
              DAEMON_TOKEN: "dmn-pl4", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-pl4",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              /* Pinned far out of the test window so only the hand-driven drain
                 runs and the assertions are deterministic (the task-drain
                 suite's trick, carried by the archive monitor). */
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService(request) {
    SEEN.push({ url: request.url, agent: request.headers.get("user-agent") });
    return new Response(BODY, { headers: { "content-type": "application/pdf" } });
  },
});
MF = mf;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));
const DO = async (p, body) => rP(await (await doStub.fetch("http://x/" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

/* The door's body, isolated once so every source arm asks the same question of
   the same text. Comments are BLANKED length-preservingly first: this file's
   subject is named in dozens of comments inside the very span it walks — the
   word `fetch` appears in the door's own prose about not fetching — so a walk
   over raw source would read the endpoint's explanation of the fence as a
   breach of it. That is the false positive PL-1 measured one family over. */
const decomment = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length));
function doorBlock() {
  const at = STORE_SRC.indexOf("captureRequest(a = {}) {");
  if (at < 0) return "";
  const end = STORE_SRC.indexOf("\n  #captureRequestAttribution(", at);
  return STORE_SRC.slice(at, end < 0 ? at + 20000 : end);
}

/* ---------------------------------------------------------------- fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-pl4",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const MEMBER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";

const inquiryMd = (id, { question = `What does ${id} rest on?`, memberUa = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  ...(memberUa ? [`member_user_agent: "${memberUa}"`] : []),
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const promote = async (id, text, type) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base: null,
  snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected",
          created: NOW, last_updated: LATER } });

const INQ = "INQ-2026-4000-sewer-transfers";
const INQ_UA = "INQ-2026-4000-browser-delegated";
{
  const a = await promote(INQ, inquiryMd(INQ), "inquiry");
  if (!a.ok) throw new Error(`promote ${INQ}: ${JSON.stringify(a).slice(0, 600)}`);
  const b = await promote(INQ_UA, inquiryMd(INQ_UA, { memberUa: MEMBER_UA }), "inquiry");
  if (!b.ok) throw new Error(`promote ${INQ_UA}: ${JSON.stringify(b).slice(0, 600)}`);
}

const RUN = "RUN-2026-0808-pl4";
const RUN_UA = "RUN-2026-0808-pl4-browser";
const openRun = async (run, ctx, claude = "project") => POST(`op=airunopen&token=${RUTH}`, {
  run, contextType: "inquiry", contextId: ctx,
  label: "PL-4 fixture — the run every request names", mode: "check",
  principalClaude: claude, principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", biasManifest: null,
  bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }], leaseMs: 900000 });
{
  const a = await openRun(RUN, INQ);
  if (a?.started !== true) throw new Error(`airunopen: ${JSON.stringify(a)}`);
  const b = await openRun(RUN_UA, INQ_UA);
  if (b?.started !== true) throw new Error(`airunopen: ${JSON.stringify(b)}`);
}

/* THE ONE SUBMITTER and THE ONE DRAIN, so no arm can quietly differ in what it
   sent or in how it drained. */
const request = async (body, tok = RUTH) => POST(`op=capturerequest&token=${tok}`,
  { target: INQ, run: RUN, purpose: "investigate", ...body });
const drain = async () => await doStub.captureRequestDrain({ actor: "suite" });

const DRIVEN = new Set(), WIRE = new Map();
const drive = (r) => { const c = codeOf(r); if (c && c in CAPTURE_REQUEST_CHECKS) { DRIVEN.add(c); WIRE.set(c, r.check); } return r; };

/* ====================================================================== 1
 * THE SHAPE: SCRATCH-CLASS, IN `capture_sessions`' FAMILY, AND IN `purge`.
 * ====================================================================== */
console.log("\n--- 1. the table's shape, its position, and its place in purge (D-113) ---");
{
  const tbl = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS capture_requests");
  const gov = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS host_governor");
  t("the table exists in schema.mjs", tbl > -1, true);
  t("and it is declared BEFORE the host_governor block (CLAUDE.md's trap: hygiene asserts the "
  + "literal ends on a `);`)", tbl > -1 && gov > -1 && tbl < gov, true);
  const body = SCHEMA_SRC.slice(tbl, SCHEMA_SRC.indexOf("\n);", tbl));
  t("it carries BOTH principals as NOT NULL columns — an act that can name one is refused at the "
  + "write rather than half-recorded (DEC-27(b))",
    [/principal_plane\s+TEXT NOT NULL/.test(body), /principal_claude\s+TEXT NOT NULL/.test(body)],
    [true, true]);
  t("it is SCRATCH: it carries an expiry, like capture_sessions and ai_runs",
    /expires\s+TEXT NOT NULL/.test(body), true);
  t("and it carries NO bytes and NO provenance chain — a request is an ASK",
    [/\bbytes\b/.test(body), /provenance/.test(body)], [false, false]);
  /* THE SCHEMA TRAPS, asserted over THIS table's own span rather than trusted:
     both have cost this project time inside the last week (CLAUDE.md), and both
     survive `node --check`. */
  const comments = body.split("\n").filter((l) => l.trim().startsWith("--") || /\s--\s/.test(l));
  t("NO SEMICOLON inside any inline `--` comment on this table — #migrate splits the schema on `;` "
  + "and a semicolon in a column comment TRUNCATES the statement (PL-1 paid ~15 minutes for this)",
    comments.filter((l) => l.slice(l.indexOf("--")).includes(";")), []);
  t("and NO BACKTICK anywhere in it — a balanced stray pair still parses, so `node --check` "
  + "would not have saved us", body.includes("`"), false);
}
{
  const pStart = STORE_SRC.indexOf("purge({ bundleId");
  const pEnd = STORE_SRC.indexOf("\n  /* ---- credentials", pStart);
  const purgeSrc = STORE_SRC.slice(pStart, pEnd > pStart ? pEnd : pStart + 40000);
  const deletes = [...purgeSrc.matchAll(/DELETE FROM capture_requests([^\n]*)/g)].map((m) => m[1].trim());
  t("purge deletes capture_requests in BOTH arms — per-bundle by `target`, whole-store outright. "
  + "PL-3's delegated trap: a table keyed on something other than bundle_id cannot ride the TABLES "
  + "list and needs its own DELETE in each arm (D-113 arriving through a column name)",
    [deletes.length, deletes.some((d) => d.startsWith("WHERE target=?")), deletes.some((d) => d.startsWith("`"))],
    [2, true, true]);
  t("and the table is NOT in the TABLES list, because it is not keyed on bundle_id",
    /const TABLES\s*=\s*\[[^\]]*capture_requests/.test(purgeSrc), false);
}

/* ====================================================================== 2
 * THE DOOR: A REQUEST IS A ROW. IT FETCHES NOTHING.
 * ====================================================================== */
console.log("\n--- 2. the door writes a row and holds no fetch (the spine, asserted as an absence) ---");
{
  const door = decomment(doorBlock());
  t("the door's body was actually read — a silent locate failure would make every arm here vacuous",
    door.length > 1500, true);
  t("and it contains NO outbound call of any kind: no fetch, no SELF, no env.STORE. THE AI DOES NOT "
  + "CAPTURE, IT REQUESTS — and a fence you can only see by reading carefully is a fence that grows "
  + "a hole nobody notices",
    [/\bfetch\s*\(/.test(door), /\bSELF\b/.test(door), /env\.STORE/.test(door)], [false, false, false]);
  t("every refusal in the door names its code as a STRING LITERAL through a helper called `refusal`, "
  + "which is what lets the DEC-49 guard COMPARE the code instead of reading past a variable (REC-71)",
    (door.match(/refusal\("[A-Z_]+"/g) || []).length >= 5, true);
}
{
  const r = drive(await request({ run: "RUN-does-not-exist" }));
  t("a request naming no live run is refused: the session launch IS the authorisation (DEC-47)",
    [r.ok, codeOf(r), r.check], [false, "CAPTURE_REQUEST_NO_RUN", "C-28.1"]);
  const p = drive(await request({ address: "http://insecure.example.gov/x.pdf" }));
  t("a non-public address is refused — what is authorised is scoped to 'areas anybody can go through'",
    [p.ok, codeOf(p), p.check], [false, "CAPTURE_REQUEST_NOT_PUBLIC", "C-28.2"]);
  const q = drive(await request({ address: PEC, target: "INFO-2026-4000-not-a-question" }));
  t("a request under something that is not a question is refused",
    [q.ok, codeOf(q), q.check], [false, "CAPTURE_REQUEST_NOT_AN_INQUIRY", "C-28.3"]);
  const c = drive(await request({ address: PEC, capture_sha: sha("bytes I brought myself") }));
  t("A REQUEST THAT ARRIVES CARRYING A CAPTURE IS REFUSED BY NAME. A provenance hop a caller can "
  + "hand us is one a caller can invent, so the fields are refused rather than silently dropped",
    [c.ok, codeOf(c), c.check, c.fields], [false, "CAPTURE_REQUEST_CARRIES_A_CAPTURE", "C-28.4", ["capture_sha"]]);
  const c2 = drive(await request({ address: PEC, provenance_chain: [{ hop: "invented" }] }));
  t("and the same refusal catches a hand-supplied provenance chain",
    [c2.ok, codeOf(c2), c2.fields], [false, "CAPTURE_REQUEST_CARRIES_A_CAPTURE", ["provenance_chain"]]);
  /* ADDED 2026-08-08 BY PL-15 (D-213), AND ADDED HERE RATHER THAN EXEMPTED
     THERE. PL-15's out-of-inquiry lead put two more refusals inside THIS door's
     `is-capture-request` region, so they belong in THIS family — a family is a
     DEC-49 floor and minting a second one for two rows on somebody else's door
     buys slack for everybody else's walk (SK-1's rule). But block 9 below holds
     this family to a FLOOR: every code in it must be DRIVEN by this suite, and
     two codes driven only by `leadslug.test.mjs` would have made that arm fail.
     The honest repair is to drive them here too rather than to narrow the arm —
     a floor relaxed to fit new rows is not a floor. */
  const ld = drive(await request({ address: PEC, lead_inquiry: "INFO-2026-4000-not-a-question" }));
  t("PL-15: a LEAD naming something that is not a question is refused by name — a notification "
  + "filed on a document has no question and therefore nobody to reach (D-213)",
    [ld.ok, codeOf(ld), ld.check], [false, "CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY", "C-28.14"]);
  const ls = drive(await request({ address: PEC, lead_inquiry: INQ }));
  t("PL-15: and a LEAD pointing back at the question the run is working is refused by name — that "
  + "is ordinary evidence for this question, not evidence for another one (D-213)",
    [ls.ok, codeOf(ls), ls.check], [false, "CAPTURE_REQUEST_LEAD_IS_THE_TARGET", "C-28.15"]);
  t("no fetch has left this instance yet: six refusals and one door, and the source has seen nothing",
    SEEN.length, 0);
}

/* ====================================================================== 3
 * THE SPINE: REQUEST -> DRAIN -> CAPTURE, AND NOBODY ELSE MAY FETCH.
 * ====================================================================== */
console.log("\n--- 3. THE SPINE: the AI requests, the daemon captures ---");
const REQ1 = await request({ address: PEC });
t("a well-formed request is accepted and lands in state `requested`",
  [REQ1.ok, REQ1.state, REQ1.requested, typeof REQ1.request === "string"],
  [true, "requested", true, true]);
t("it copies BOTH principals from the run, so the attribution survives the run's expiry "
+ "(ai_runs is SCRATCH; an act attributable only while the asker lives is unaccountable afterwards)",
  REQ1.principals, { plane: "member:ruth", claude: "project" });
t("and STILL nothing has left this instance — the row is an ASK", SEEN.length, 0);

console.log("\n--- 3a. a caller holding a REAL request id cannot make the plane fetch for it ---");
{
  /* THE GATE IS A SHAPE, NOT A CLASS LIST, which is what makes it hold for the
     `ai` credential class PL-11 has not minted yet. Three callers, three
     classes, one refusal. */
  const asMember = await POST(`op=acquire&token=mem-pl4`, { via: "capture-request", request: REQ1.request });
  const asAdmin  = await POST(`op=acquire&token=adm-pl4`, { via: "capture-request", request: REQ1.request });
  const asDaemon = await POST(`op=acquire&token=dmn-pl4`, { via: "capture-request", request: REQ1.request });
  for (const [who, r] of [["a member session's credential", asMember],
                          ["an OPERATOR's credential", asAdmin],
                          /* THE DAEMON'S OWN CREDENTIAL, and it is the sharpest of
                             the three: even the class that DOES drain is refused
                             outside a drain tick. The gate is the row's state and
                             not the caller's class, which is what makes it hold
                             for the `ai` class PL-11 has not minted yet. */
                          ["the DAEMON's own credential, outside a drain tick", asDaemon]]) {
    drive(r);
    t(`${who} holding a real request id is refused: only the drain fetches`,
      [r.ok, codeOf(r), r.check], [false, "CAPTURE_NOT_DRAINING", "C-28.13"]);
  }
  t("and no fetch left the instance for any of the three", SEEN.length, 0);
  /* THE READ THE ARM ASKS, DRIVEN THROUGH THE CONTROL PLANE. `op=invitelook`
     shipped with a ReferenceError while 1276 assertions passed, so a store-level
     answer is not evidence that a caller can reach the question — and this
     particular question is the one the whole fence turns on. */
  const seen0 = await GET(`op=capturerequestdraining&token=adm-pl4&request=${REQ1.request}`);
  t("op=capturerequestdraining answers through the control plane, and OUTSIDE a drain tick it says "
  + "the row is `requested` and NOT draining — which is the fact the arm above refuses on",
    [seen0.found, seen0.state, seen0.draining], [true, "requested", false]);
  const seenNone = await GET(`op=capturerequestdraining&token=adm-pl4&request=CR-no-such-request`);
  t("and a request that does not exist answers NOT FOUND and NOT DRAINING — an unknown row and a "
  + "queued one are both refused, so a caller learns nothing by guessing ids",
    [seenNone.found, seenNone.draining, seenNone.address], [false, false, null]);
  t("it is CLASS-FENCED: no member session reaches it, because it exists for op=acquire's arm and "
  + "not for a person",
    (await GET(`op=capturerequestdraining&token=mem-pl4&request=${REQ1.request}`))?.error
      ?? (await mf.dispatchFetch(`http://x/api/?op=capturerequestdraining&token=mem-pl4`)).status,
    "forbidden for token class");
  t("the refusal names the shape rather than the class, so it holds for a credential class that "
  + "does not exist yet (PL-11's `token:ai`)",
    /drain/.test(String(asMember.detail)) && /REQUESTS/.test(String(asMember.detail)), true);
}

console.log("\n--- 3b. the drain, and the capture lands at `collected` and never higher ---");
const D1 = await drain();
t("the drain is configured (a SELF binding and a daemon credential reached the Durable Object) — "
+ "asserted directly, because an inert tick would make every arm below pass by doing nothing",
  D1.configured, true);
t("it captured the requested document", D1.captured.map((c) => c.address), [PEC]);
t("exactly one request left this instance, and it went to the address the row named",
  SEEN.map((s) => s.url), [PEC]);
{
  const rows = await GET(`op=capturerequests&token=${RUTH}&run=${RUN}`);
  const row = rows.requests.find((r) => r.request === REQ1.request);
  t("the row is `captured` and carries the sha the daemon filed",
    [row.state, typeof row.capture_sha === "string" && row.capture_sha.length === 64], ["captured", true]);
  const listed = await GET(`op=list&token=${RUTH}&limit=1000`);
  const landed = (listed.bundles || []).filter((b) => b.current_state && b.bundle_id.startsWith("INFO"));
  t("A CAPTURE IS NOT EVIDENCE: whatever the daemon filed is at `collected` and NEVER higher — "
  + "sweep material never ratifies itself (Intake Doctrine, SWEEP §1.7)",
    [...new Set(landed.map((b) => b.current_state))].filter((s) => s !== "collected"), []);
}

/* ====================================================================== 4
 * DEC-47's CONDUCT, ENFORCED ONCE AND AT THE DRAIN.
 * ====================================================================== */
console.log("\n--- 4. DEC-47's conduct: enforced ONCE, at the drain ---");
{
  /* THE ENFORCEMENT POINT IS ASSERTED STRUCTURALLY as well as driven, because
     "once" is a claim about WHERE and no behavioural arm can see a second copy
     that happens to agree. */
  const conduct = Object.entries(CAPTURE_REQUEST_CHECKS)
    .filter(([k]) => k.startsWith("CAPTURE_CONDUCT_"));
  /* CORRECTED 2026-08-08 BY THE DEC-49 GUARD ITSELF, and recorded rather than
     quietly fixed. This first read `captureRequestDrain`, and the guard failed
     the harness naming the byte offsets: the region marker is not inside that
     function's body, it is inside `#captureRequestConduct`, which the drain
     calls. A `where` that names the wrong function is the wrong-span-clean-
     verdict class — the walk would have judged another function's refusals and
     reported a clean pass — and it was caught by an instrument rather than by
     reading, which is the only way that class is ever caught. */
  t("every conduct row's `where` names ONE span — the conduct region the drain calls — and no other",
    [...new Set(conduct.map(([, v]) => v.where))],
    ["src/store.mjs #captureRequestConduct > is-capture-conduct"]);
  t("and that span is a REGION inside ONE function, resolvable by name: a marker pair inside an "
  + "unnamed span is a `where` the guard cannot resolve, which means nothing checks the site at all",
    /#captureRequestConduct\(q, nowMs, hostsThisTick\) \{/.test(STORE_SRC), true);
  const door = decomment(doorBlock());
  t("and the DOOR enforces none of it: no purpose roster, no agent composer, no governor read. "
  + "One enforcement point, so the rules cannot be half applied by a caller that arrived another way",
    [/CAPTURE_PURPOSES/.test(door), /civicosUserAgent/.test(door), /host_governor/.test(door)],
    [false, false, false]);
}

console.log("\n--- 4a. CONDUCT 2: the purpose token ---");
{
  const r = await request({ address: `${OTHER}?m=0`, purpose: "scrape" });
  t("the door accepts it — conduct is not the door's business", r.ok, true);
  const d = await drain();
  const ref = d.refused.find((x) => x.request === r.request);
  drive(ref);
  t("and the DRAIN turns it away by name: an unknown purpose is this instance telling a source "
  + "something false about why it is asking",
    [codeOf(ref), ref?.check ?? null], ["CAPTURE_CONDUCT_NO_PURPOSE", "C-28.8"]);
  t("its translation is CANNED and rendered from the registry, never composed at the site",
    ref?.translation ?? null, CAPTURE_REQUEST_CHECKS.CAPTURE_CONDUCT_NO_PURPOSE.translation);
  t("and NO request left the instance for it", SEEN.filter((s) => s.url === OTHER).length, 0);
  const rows = await GET(`op=capturerequests&token=${RUTH}&state=refused`);
  t("the row is terminal — `refused`, not left queued to be retried forever",
    rows.requests.filter((x) => x.request === r.request).map((x) => x.state), ["refused"]);
}

console.log("\n--- 4b. CONDUCT 1: the agent, and it carries a contact URL ---");
{
  t("the agent the drain composed is the agent the SOURCE SAW — one composer, not a copy of one "
  + "(SOURCE-ACCESS.md: two bare tokens across three call sites that did not agree cost 403s and "
  + "three sessions of wrong reasoning)",
    SEEN[0].agent, civicosUserAgent("0.60.0", "biosmoke-pl4", "investigate"));
  t("it names a contact a third party can reach — D-94 MEASURED that removing this component flips "
  + "admission 200 to 403 uniformly, so it is load-bearing rather than stylistic",
    userAgentIsLegible(SEEN[0].agent), true);
  t("and it carries the PURPOSE the request named, so a source can tell an investigation fetch from "
  + "a routine re-check", SEEN[0].agent.includes("investigate"), true);
  t("it does not impersonate a browser", /Mozilla/.test(SEEN[0].agent), false);
  /* EVERY ARM BELOW USES ITS OWN ADDRESS. The door is idempotent on (run,
     address), so two arms sharing one address are COUPLED: neuter a check in the
     first and the second silently receives the first's standing row instead of
     its own refusal. Measured while running arm (2) of the control, which is the
     only way a coupling like this is ever found. */
  const r = await request({ address: `${OTHER}?m=1`, ua_mode: "chrome-pretend" });
  const d = await drain();
  const ref = d.refused.find((x) => x.request === r.request);
  drive(ref);
  t("an agent mode outside the two legible forms is refused at the drain by name",
    [codeOf(ref), ref?.check ?? null], ["CAPTURE_CONDUCT_UA_ILLEGIBLE", "C-28.6"]);
}

console.log("\n--- 4c. CONDUCT 1b: BOB-3's member-browser agent is PERMITTED, and never INVENTED ---");
{
  const unrecorded = await POST(`op=capturerequest&token=${RUTH}`,
    { target: INQ, run: RUN, address: `${OTHER}?m=2`, purpose: "investigate", ua_mode: "member-browser" });
  const d = await drain();
  const ref = d.refused.find((x) => x.request === unrecorded.request);
  drive(ref);
  t("a member-browser fetch under a question that records NO member agent is refused — BOB-3 permits "
  + "DELEGATING an agent a member actually used, and composing one would be inventing a client",
    [codeOf(ref), ref?.check ?? null], ["CAPTURE_CONDUCT_UA_UNRECORDED", "C-28.7"]);
  t("and nothing left the instance under a fabricated agent",
    SEEN.filter((s) => /Mozilla/.test(s.agent || "")).length, 0);

  /* THE OVER-STRICTNESS ARM. A check that refuses correct work is a defect in
     the check, and BOB-3 RULED this fetch permitted. */
  const before = SEEN.length;
  const ok = await POST(`op=capturerequest&token=${RUTH}`,
    { target: INQ_UA, run: RUN_UA, address: `${OTHER}?m=3`, purpose: "investigate", ua_mode: "member-browser" });
  const d2 = await drain();
  t("OVER-STRICTNESS ARM: with the member's own agent RECORDED on the question, the fetch is MADE — "
  + "BOB-3 permits it and a fence that refused it would be a defect in the fence",
    d2.captured.map((c) => c.request), [ok.request]);
  t("and the agent that left is the member's own, verbatim, not a composed one",
    SEEN.slice(before).map((s) => s.agent), [MEMBER_UA]);
}

console.log("\n--- 4d. CONDUCT 3: rate, and a held request is STILL QUEUED ---");
{
  /* The governor is put into cool-off through its own reporting path, exactly
     as a real 429 would — not by writing the row by hand, because a state a
     test can only reach by hand is a state the plane may never produce. */
  await DO("governorreport", { host: "www.cooling-off.example.gov", status: 429, retry_after_ms: 600000 });
  const r = await request({ address: HELD });
  const d = await drain();
  const h = d.held.find((x) => x.request === r.request);
  drive(h);
  t("a request to a host in cool-off is HELD by name, not fetched",
    [codeOf(h), h?.check ?? null], ["CAPTURE_CONDUCT_HOST_HELD", "C-28.9"]);
  t("and nothing left the instance for that host",
    SEEN.filter((s) => s.url === HELD).length, 0);
  const rows = await GET(`op=capturerequests&token=${RUTH}&state=requested`);
  t("THE HELD REQUEST IS STILL QUEUED — a held request is paced, never lost, and nothing needs "
  + "re-asking", rows.requests.filter((x) => x.request === r.request).map((x) => x.state), ["requested"]);
  /* D-104's SPLIT, on the run's own log: our pacing holding a host is a fact
     about US and never about the source. Writing "source unreachable" here is
     precisely what D-104 exists to stop. */
  const log = await GET(`op=airunlog&token=${RUTH}&run=${RUN}`);
  const entry = [...(log.entries || [])].reverse().find((e) => e.subject === HELD);
  t("and the run's log says so in the record's own vocabulary: LOOKED_INDETERMINATE, GOVERNED, "
  + "condition `governor-holding-host` — never 'the source was unreachable' (D-104)",
    [entry.state, entry.governed, entry.condition],
    ["LOOKED_INDETERMINATE", true, "governor-holding-host"]);
}
{
  /* THE PER-TICK HOST BOUND. Two requests, one host, one tick: a person opens a
     few tabs and then reads; a loop opens forty. */
  const a = await request({ address: `${BUDGET}?a=1` });
  const b = await request({ address: `${BUDGET}?b=2` });
  const before = SEEN.length;
  const d = await drain();
  const mine = (list) => list.filter((x) => x.request === a.request || x.request === b.request);
  t("one drain tick fetches from one host ONCE, and says which request it deferred BY C-NUMBER",
    [mine(d.captured).length, mine(d.held).map((x) => x.code), mine(d.held).map((x) => x.check)],
    [1, ["CAPTURE_CONDUCT_TICK_SPENT"], ["C-28.10"]]);
  drive(mine(d.held)[0]);
  t("and exactly one request left the instance for that host in that tick",
    SEEN.slice(before).filter((s) => s.url.startsWith(BUDGET)).length, 1);
  const d2 = await drain();
  t("the deferred one is fetched on the NEXT tick — spread out, never dropped",
    mine(d2.captured).length, 1);
}

/* ====================================================================== 5
 * ATTRIBUTION: BOTH PRINCIPALS, AND THE ACT IS VISIBLY THE MACHINE'S.
 * ====================================================================== */
console.log("\n--- 5. attribution states BOTH principals (DEC-27(b), DEC-55.4) ---");
{
  const rows = await GET(`op=capturerequests&token=${RUTH}&run=${RUN}`);
  const row = rows.requests.find((r) => r.request === REQ1.request);
  const a = row.attribution;
  t("the ACTOR is the daemon and is MACHINE-SHAPED — `token:<class>`, never a person's name",
    [a.actor, isMachineIdentity(a.actor), a.machine_attributed], ["token:daemon", true, true]);
  t("the act is recorded as the daemon's AT THE SESSION'S REQUEST, naming the run and its question",
    a.at_the_request_of, { run: RUN, inquiry: INQ });
  t("and BOTH principals are named: the plane credential the writes ran under AND which level of "
  + "the Claude-account cascade paid for the reasoning. They are DIFFERENT principals",
    a.principals, { plane: "member:ruth", claude: "project" });
  t("neither is a token VALUE",
    [a.principals.plane.includes("adm-pl4"), a.principals.claude.includes("adm-pl4")], [false, false]);
  /* THE ACTOR CANNOT BE A PERSON'S NAME AND THERE IS NO REFUSAL FOR IT, which
     is a decision this item took while driving the family: the composer builds
     the actor from MACHINE_AUTHOR_PREFIX and a literal, so a branch refusing a
     person's name would be a gate for a condition the code cannot produce and a
     DEC-49 code nobody could ever drive. Asserted over the composer's source
     instead of pretended at with an unreachable `if`. */
  t("the machine attribution is BY CONSTRUCTION: the actor is the prefix and a literal, with no "
  + "path by which a caller's or a member's name could reach it",
    /const actor = `\$\{MACHINE_AUTHOR_PREFIX\}daemon`;/.test(STORE_SRC), true);
  t("THE SENTENCE THE RECORD STATES names both, because a structured field a surface may or may not "
  + "open is not a statement",
    [a.statement.includes("the daemon captured this"), a.statement.includes("at the investigative session's request"),
     a.statement.includes("member:ruth"), a.statement.includes("paid by project")],
    [true, true, true, true]);
}
console.log("\n--- 5a. A RECORD NAMING ONLY ONE PRINCIPAL FAILS, and no capture is made for it ---");
{
  /* The one-principal row is written AT THE DURABLE OBJECT, because the door
     refuses to make one — which is itself the point: the two fences agree, and
     the drain's is the one under test here. */
  /* THE ROW IS MADE THROUGH THE REAL DOOR, and the half-named principal comes
     from a REAL HOLE rather than from hand-written SQL: `aiRunOpen`'s guard is
     `!principalClaude`, so a principal of WHITESPACE passes it and the run is
     opened naming nobody while looking like it names somebody. A state a test
     can only reach by hand is a state the plane may never produce; this one the
     plane produces today. Reported as a finding and delegated — the check is
     PL-5's and widening this item to reach a neighbouring family's rule is the
     mistake REC-71 exists to correct. */
  const BLANK = "RUN-2026-0808-pl4-blank";
  const opened = await openRun(BLANK, INQ, " ");
  t("FIXTURE ARMS THE TRAP HONESTLY: a run opens with a WHITESPACE Claude principal, because "
  + "aiRunOpen's guard is a falsiness test — so the half-named row below is one the plane can "
  + "really produce", opened.started, true);
  const planted = await POST(`op=capturerequest&token=${RUTH}`,
    { target: INQ, run: BLANK, address: `${OTHER}?m=4`, purpose: "investigate" });
  const R = planted.request;
  const before = SEEN.length;
  const d = await drain();
  const ref = d.refused.find((x) => x.request === R);
  drive(ref);
  t("a request that can name only ONE principal is refused at the drain BY NAME",
    [codeOf(ref), ref?.check ?? null], ["CAPTURE_ATTRIBUTION_ONE_PRINCIPAL", "C-28.11"]);
  t("and NO fetch was made for an act the record could not attribute", SEEN.length - before, 0);
  const rows = await GET(`op=capturerequests&token=${RUTH}&target=${INQ}`);
  const row = rows.requests.find((x) => x.request === R);
  t("the READ answers with the same refusal rather than a half attribution — a read cannot state "
  + "less carefully than the write did",
    [row.attribution.ok, row.attribution.code], [false, "CAPTURE_ATTRIBUTION_ONE_PRINCIPAL"]);
}

/* ====================================================================== 6
 * THE COMPLETION NOTIFICATION.
 * ====================================================================== */
console.log("\n--- 6. completion notifies on D-61's catalogued kind, carrying both principals ---");
{
  const q = await GET(`op=queue&token=${RUTH}&limit=200`);
  const items = (q.items || []).filter((i) => i.kind === "capture-completed-unattended"
    && i.subject && i.subject.kind === "capture_request");
  t("a completed request surfaces as an item on the EXISTING catalogued kind — the subscriber is "
  + "extended, no channel is invented (§4)", items.length > 0, true);
  /* NULL-TOLERANT for the reason `codeOf` is: an arm that throws on `.basis` of
     undefined takes every arm behind it with it, and a control that kills the
     producer would then report ONE failure where there are four. */
  const mine = items.find((i) => i.basis && i.basis.request === REQ1.request) || null;
  const b = (mine && mine.basis) || {};
  t("it names the request, the run and the question it was asked under",
    [b.request ?? null, b.run ?? null, b.inquiry ?? null], [REQ1.request, RUN, INQ]);
  t("and its basis carries the WHOLE attribution: both principals, and the act visibly the machine's",
    [b.attribution?.principals ?? null, b.attribution?.actor ?? null],
    [{ plane: "member:ruth", claude: "project" }, "token:daemon"]);
  t("the item says a capture is not evidence — the document entered the STORE and no leg of any claim",
    String(mine?.detail ?? "").includes("NOT an entry of that document into the leg of a claim"), true);
  t("and NO item was minted for the row that could name only one principal — a notification that "
  + "could not say whose act it was would be DEC-27(b)'s defect surfaced to a member",
    items.filter((i) => i.basis && i.basis.run === "RUN-2026-0808-pl4-blank"), []);
}

/* ====================================================================== 7
 * BOB-3, AND THE IDEMPOTENT DOOR.
 * ====================================================================== */
console.log("\n--- 7. BOB-3: a robots.txt disallow does not bar a public document ---");
{
  t("OVER-STRICTNESS ARM, DRIVEN: the document captured in block 3 sits under the exact path shape "
  + "Oakland's robots.txt disallows — 63 of its 82 Disallow rules are Public Ethics Commission "
  + "publications — and it CAPTURED. An absence by decision needs an arm proving it is real",
    SEEN.filter((s) => s.url === PEC).length, 1);
  t("and the plane never asked for a robots.txt at all",
    SEEN.filter((s) => /robots\.txt/.test(s.url)), []);
  t("there is no robots rule anywhere in the conduct family",
    Object.keys(CAPTURE_REQUEST_CHECKS).filter((k) => /ROBOT/i.test(k)), []);
  t("nor any robots read in the drain's source",
    /robots/i.test(STORE_SRC.slice(STORE_SRC.indexOf("async captureRequestDrain"),
                                   STORE_SRC.indexOf("#captureRequestHostHeld"))), false);
}
console.log("\n--- 7a. the door is idempotent on (run, address): asking twice is asking once ---");
{
  const before = SEEN.length;
  const again = await request({ address: PEC });
  t("a second request for the same address from the same run returns the STANDING row",
    [again.ok, again.already, again.requested, again.request], [true, true, false, REQ1.request]);
  const d = await drain();
  t("and no second fetch is queued at somebody else's server",
    [SEEN.length - before, d.captured.length], [0, 0]);
}
console.log("\n--- 7b. OVER-STRICTNESS: `acquire` is a truthful purpose too ---");
{
  const before = SEEN.length;
  const r = await request({ address: `${BUDGET}?c=3`, purpose: "acquire" });
  const d = await drain();
  t("a run re-fetching a source a member already named uses the existing purpose token and captures",
    d.captured.map((c) => c.request), [r.request]);
  t("and the agent it sent says `acquire`, not `investigate`",
    SEEN.slice(before).map((s) => s.agent.includes("acquire")), [true]);
}

/* ====================================================================== 8
 * PURGE, PROVED BY CONSEQUENCE.
 * ====================================================================== */
console.log("\n--- 8. purge takes the table, PROVED by counting rather than asserted (D-113) ---");
{
  const s0 = await GET(`op=stats&token=${RUTH}`);
  t("op=stats counts the table, so a purge can PROVE it took the rows", s0.captureRequests > 0, true);
  const p1 = await POST(`op=purge&token=adm-pl4&confirm=bio&bundleId=${INQ_UA}`, {});
  t("a PER-BUNDLE purge takes the requests asked under THAT question and names the scope",
    [p1.scope, p1.removed.captureRequests > 0], [INQ_UA, true]);
  const s1 = await GET(`op=stats&token=${RUTH}`);
  t("and leaves the requests asked under every other question standing", s1.captureRequests > 0, true);
  const p2 = await POST(`op=purge&token=adm-pl4&confirm=bio`, {});
  t("a WHOLE-STORE purge reports scope ALL and takes the rest — a purge reporting ALL while an "
  + "outbound queue stood would leave a leftover visible from OUTSIDE this instance",
    [p2.scope, p2.removed.captureRequests > 0], ["ALL", true]);
  const s2 = await GET(`op=stats&token=${RUTH}`);
  t("nothing survives it", s2.captureRequests, 0);
}

/* ====================================================================== 9
 * DEC-49: THE DRIVEN SET EQUALS THE REGISTRY, FLOOR AS WELL AS CEILING.
 * ====================================================================== */
console.log("\n--- 9. DEC-49: every code driven out of the plane, every one translated ---");
{
  const registry = Object.keys(CAPTURE_REQUEST_CHECKS).sort();
  const driven = [...DRIVEN].sort();
  t("EVERY code in the family was DRIVEN out of the plane — the floor, and the half a ceiling "
  + "cannot see: a code nobody can reach is a refusal nobody can prove fires",
    registry.filter((c) => !DRIVEN.has(c)), []);
  t("and nothing was driven that the registry does not name (the ceiling)",
    driven.filter((c) => !registry.includes(c)), []);
  t("every code the plane SENT carried the C-number the registry holds — asserted against the wire "
  + "and not against the table the number was read from",
    [...WIRE.entries()].filter(([code, num]) => CAPTURE_REQUEST_CHECKS[code].check !== num), []);
  t("every row carries a canned translation of real length",
    Object.entries(CAPTURE_REQUEST_CHECKS)
      .filter(([, v]) => typeof v.translation !== "string" || v.translation.length < 60).map(([k]) => k), []);
  /* TWO NUMBERS IN THIS FAMILY'S RANGE ARE UNALLOCATED, AND THAT IS ASSERTED
     RATHER THAN LEFT AS A GAP A LATER READER WOULD "FIX" BY REUSING THEM.
     C-28.5 was a second attribution refusal at the DOOR: with the same predicate
     at the door and at the drain, the door's refusal made the DRAIN'S
     unreachable, so one of the two could never be driven — and a code nobody can
     drive is a refusal nobody can prove fires. C-28.12 refused an actor that was
     not machine-shaped, which the composer cannot produce because it builds the
     actor from a prefix and a literal: a gate for a condition the code cannot
     reach is the empty gate this project refuses everywhere else. BOTH WERE
     FOUND BY DRIVING THE FAMILY rather than by reading it. */
  t("C-28.5 and C-28.12 are UNALLOCATED, and no row claims either — a number left free is free "
  + "because a code that could not be driven was removed, not because one was forgotten",
    Object.values(CAPTURE_REQUEST_CHECKS).map((v) => v.check).filter((c) => c === "C-28.5" || c === "C-28.12"),
    []);
  t("every C-number is unique inside the family",
    Object.values(CAPTURE_REQUEST_CHECKS).map((v) => v.check).length
      - new Set(Object.values(CAPTURE_REQUEST_CHECKS).map((v) => v.check)).size, 0);
  t("and every `where` names a REGION rather than a whole function (REC-71): a whole-function span "
  + "conscripts every refusal that arrives there later",
    Object.values(CAPTURE_REQUEST_CHECKS).filter((v) => !v.where.includes(" > ")).map((v) => v.check), []);
}
console.log("\n--- 9a. the vocabularies are CLOSED, and the plane reads them rather than re-typing ---");
{
  t("the purpose roster is closed and small", CAPTURE_PURPOSES, ["investigate", "acquire"]);
  t("the agent-mode roster is closed and has exactly two members — there is no third legible form",
    CAPTURE_UA_MODES, ["civicos", "member-browser"]);
  t("the store IMPORTS both rather than re-typing them: a hand-typed vocabulary agrees with its "
  + "author at zero cost",
    /CAPTURE_REQUEST_CHECKS, CAPTURE_PURPOSES, CAPTURE_UA_MODES, userAgentIsLegible/.test(STORE_SRC), true);
  t("and the control plane composes its agent through the catalog's ONE composer",
    /return civicosUserAgent\(version, instance, purpose\)/.test(INDEX_SRC), true);
}

} catch (e) {
  console.log(`  FAIL  suite threw: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
