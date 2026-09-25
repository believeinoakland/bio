/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/airun-contextkind.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/airun-contextkind.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once), the real sources are hashed before and after, and what each arm MUST fail is declared in the driver before it arms.
   RESULTS, RE-RUN 2026-09-19 by REC-153 in worktree agent-a7fe9ecc71d7b4add after BOB #16's corrections (`7d03e852`), on origin/main merged at cd48a160 + this item (real src/index.mjs 663,888 B sha256 7d80fc4e243a…, src/store.mjs 2,663,009 B sha256 32df899682ff…, src/airun.mjs 135,145 B sha256 79b0f286f520…, untouched: YES), every arm AS DECLARED on its first run: baseline 44/0 · **kind-check-dropped — THE ROW'S CONTROL, the call in `aiRunOpen` answering "no refusal" -> 22/22: every MISLABELLED, VOCABULARY-refused, UNSEEN-refused, MACHINE ABSENT and AGENT SIGHT arm fails by name; the member byte arms stay GREEN as declared (both opens permitted alike — a byte arm proves no bit)** · refuse-every-inquiry (the row's liar) 38/6 · **vocabulary-open (BOB #16 (2) undone: the word matched against the bundle's type) 42/2 — `information` over the Information bundle OPENS** · **machine-carve-out (BOB #16 (1) undone: a caller with no member let through an unseen id) 38/6 — every MACHINE ABSENT and AGENT SIGHT arm** · unseen-permitted 34/10 · sight-not-asked 40/4 · mismatch-names-kind 43/1 · sight-via-roster-form (over-strictness) 44/0. FIRST BUILD (superseded, kept as the record): kind-check-dropped 23/12 over a 35-assertion suite that pinned the machine carve-out and the open vocabulary BOB #16 then reversed. BEFORE, the unedited tree ran the first draft 23/12: olga (not joined) opened a run over sam's PROJECT labelled `inquiry` — `[true, null, "INQUIRY"]`.
 * =========================================================================
 * REC-153 — `aiRunOpen` REFUSES A `contextType` THAT DOES NOT MATCH THE NAMED BUNDLE'S TYPE, AND AN ID
 * THE CALLER CANNOT SEE ANSWERS AS ABSENT. Membership Architecture v2 §7, the DEC-63 ruling bullet,
 * *"AND THE CONTEXT KIND IS CHECKED"* (BOB #16, 2026-09-19, `ed249814`), with the two points BOB #16 added
 * on this item's findings at `7d03e852`: a machine sees no more than its principal, and the kind is
 * `RUN_CONTEXTS`' closed vocabulary.
 *
 * THE DEFECT, measured on the unedited tree (`52218bdd` + the claim) by this suite's first draft: a member who
 * had NOT joined a project opened a run over THAT PROJECT'S ID by calling it an `inquiry` — `started: true`,
 * ground `INQUIRY` — walking around the joined gate the same open labelled `project` meets.
 *
 * WHAT IS BUILT (one refusal, `AI_RUN_NO_SUCH_CONTEXT`, C-22.11), in this order:
 *   1. the kind is `inquiry` or `project`, exactly; any other word is refused before any bundle is read;
 *   2. an id the caller cannot see — never minted, or hidden from them — answers as absent, for EVERY caller
 *      and every kind; an `ai` credential sees as its principal member, so its answer is that member's own;
 *   3. a bundle the caller sees must be the kind named, whoever asks;
 *   4. then the joined gate, over a project the caller can see, unchanged.
 * Rules 2 and 3 answer with one object built only from what the caller sent.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (a) refuse every `inquiry`-context open. §5 requires a correctly labelled run over a real question to
 *       OPEN, for a participant, a non-participant, a machine and an agent.
 *   (b) refuse only the SEEN mismatch and let an unseen id through. §4 requires vera's open over the project
 *       hidden from her, and every caller's over a never-minted id, to be REFUSED.
 *   (c) keep the byte-identity by PERMITTING both. §4's REFUSED arms are separate from its byte arms for
 *       exactly this: a byte arm proves no bit, not the refusal.
 *   (d) keep the machine carve-out. §4 and §7 require a machine's unseen id to answer as the member's does.
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { AI_RUN_CHECKS } from "../checks/bio-checks.mjs";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.AIRUN_CONTEXTKIND_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const SHOW = process.env.AIRUN_CONTEXTKIND_SHOW === "1";   /* print the raw answers (the before-table) */

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec153", MEM = "mem-rec153";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
}));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, type: res.headers.get("content-type"), body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const show = (label, r) => { if (SHOW) console.log(`  RAW ${label}: ${r.status} ${r.type} ${r.body}`); };
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 700)}`); return r; };

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-153" }));
const CAPS = ["contribute", "publish", "create_projects"];
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: CAPS });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-153` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-153` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin");    /* an administrator: sees every project (§7.3), joins none here */
const SAM  = await enrol("sam", "member");    /* owns (so has JOINED) the visible project */
const OLGA = await enrol("olga", "member");   /* INVITED to sam's project, never joins: sees it, not a participant */
const IRIS = await enrol("iris", "member");   /* owns the HIDDEN project */
const VERA = await enrol("vera", "member");   /* never invited to either: sam's and iris's are both unseen by her */

const inquiryMd = (id) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "---", "", "## Question", "", "Did it?", "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
/* REC-141 (IC-158): a project's id is MINTED by the plane — the creation names none, and the answer carries it. */
const projectMd = (title) => ["---", "object_type: project", `title: "${title}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "current_state: collected",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "---", "", "## Summary", "", "A fixture.", ""].join("\n");
let seq = 0;
const create = async (tok, id, type, title) => {
  const md = type === "project" ? projectMd(title) : type === "information" ? infoMd(id) : inquiryMd(id);
  const r = parse(await RAW(`op=promote&token=${tok}`, {
    ...(type === "project" ? {} : { bundleId: id }), base: null,
    snapKey: `20260701T0000${String(++seq).padStart(2, "0")}Z_rec153`,
    /* CORRECTED 2026-09-25 (D-563, C-86.3), never exempted: an inquiry's document carries its own title and question,
       so the caller's label contradicted it and is now refused; the other documents here state none or the same one. */
    meta: { object_type: type, group: "believe-in-oakland", ...(type === "inquiry" ? {} : { title }),
            current_state: type === "project" ? "forming" : type === "information" ? "collected" : "open",
            created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] }));
  must(`create ${type} ${title}`, r);
  return r.bundleId;
};

const V_TITLE = "Parking Citation Revenue", H_TITLE = "Stormwater Bond Draws";
const VISIBLE = await create(SAM, null, "project", V_TITLE);
const HIDDEN = await create(IRIS, null, "project", H_TITLE);
const Q = await create(ADM, "INQ-2026-9153-question", "inquiry", "Did the fund follow its adopted purpose?");
const INFO = await create(ADM, "INFO-2026-9153-budget", "information", "The adopted budget");
/* Two ids nothing ever mints, one per prefix, so an id's SHAPE cannot be what the answer turns on. */
const NEVER_P = "PROJ-2026-9153-nevermint", NEVER_Q = "INQ-2026-9153-nevermint";
must("sam invites olga (she never joins)", await POST(`op=projectinvite&token=${SAM}&projectId=${VISIBLE}&handle=olga`));

const listed = async (tok) => ((await POST(`op=list&token=${tok}&limit=1000`))?.bundles ?? []).map((b) => b.bundle_id);
t("FIXTURE: the plane minted both project ids, and they differ",
  [typeof VISIBLE === "string" && VISIBLE.startsWith("PROJ-"), typeof HIDDEN === "string" && HIDDEN.startsWith("PROJ-"),
   VISIBLE !== HIDDEN], [true, true, true]);
t("FIXTURE: sam, olga (invited) and ruth (administrator) SEE the visible project; vera does NOT",
  [(await listed(SAM)).includes(VISIBLE), (await listed(OLGA)).includes(VISIBLE),
   (await listed(RUTH)).includes(VISIBLE), (await listed(VERA)).includes(VISIBLE)], [true, true, true, false]);
t("FIXTURE: vera does NOT see the hidden project; ruth does",
  [(await listed(VERA)).includes(HIDDEN), (await listed(RUTH)).includes(HIDDEN)], [false, true]);
t("FIXTURE: vera DOES see the question and the Information bundle (only projects are filtered)",
  [(await listed(VERA)).includes(Q), (await listed(VERA)).includes(INFO)], [true, true]);
t("FIXTURE: the two never-minted ids are absent to the administrator token",
  [(await listed(ADM)).includes(NEVER_P), (await listed(ADM)).includes(NEVER_Q)], [false, false]);

/* A FIXED clock one day ahead of the wall clock, so no run lapses to the reaper between reads
   (project-disclosure.test.mjs's measured reason). */
const RUN_AT = new Date(Math.floor(Date.now() / 3600000) * 3600000 + 86400000).toISOString().replace(/\.\d{3}Z$/, "Z");
let runSeq = 0;
const nextRun = () => `RUN-rec153-${++runSeq}`;
const openRaw = (tok, run, contextType, contextId, over = {}) => RAW(`op=airunopen&token=${tok}`, {
  run, contextType, contextId, label: "evidence sweep", mode: "check",
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }],
  leaseMs: 600000, at: RUN_AT, ...over });
const open = async (tok, contextType, contextId, over) => parse(await openRaw(tok, nextRun(), contextType, contextId, over));
/* The run id and the context id are the only things two opens differ in by construction. */
const norm = (r, run, ctx) => ({ status: r.status, type: r.type,
  sha: sha(r.body.split(run).join("RUN").split(ctx).join("CTX")) });
const verdict = (r) => [r?.started ?? null, codeOf(r), r?.projectGate?.ground ?? null];
const REFUSED = (code) => [false, code, null];
const NO = REFUSED("AI_RUN_NO_SUCH_CONTEXT");

/* ======================================================== 1. THE DEFECT */
console.log("\n--- 1. a PROJECT's id labelled `inquiry` is refused — the walk around the joined gate is closed ---");
{
  const byOlga = await open(OLGA, "inquiry", VISIBLE);
  t("REC-153 MISLABELLED: olga (SEES the project, has NOT joined) opening it as an `inquiry` is REFUSED", verdict(byOlga), NO);
  t("REC-153 MISLABELLED: ruth (an administrator, sees it, not joined) is refused the same way",
    verdict(await open(RUTH, "inquiry", VISIBLE)), NO);
  /* A MISMATCH IS REFUSED, not a non-participant's mismatch: the record would say the run is over a question. */
  t("REC-153 MISLABELLED: sam (JOINED — the gate would admit him as `project`) is refused too: a mismatch is refused",
    verdict(await open(SAM, "inquiry", VISIBLE)), NO);
  t("REC-153 MISLABELLED: a machine credential (no participation to ask, sees every project) is refused too",
    verdict(await open(MEM, "inquiry", VISIBLE)), NO);
  t("REC-153 MISLABELLED: sam opening the QUESTION as a `project` is refused",
    verdict(await open(SAM, "project", Q)), NO);
  t("REC-153 MISLABELLED: the Information bundle opened as an `inquiry` is refused",
    verdict(await open(SAM, "inquiry", INFO)), NO);

  const row = AI_RUN_CHECKS.AI_RUN_NO_SUCH_CONTEXT || {};
  t("the refusal carries its C-number and the catalogue's own translation",
    [byOlga?.check, byOlga?.translation, typeof row.translation === "string" && row.translation.length > 40],
    [row.check ?? "(no catalogue row)", row.translation ?? "(no catalogue row)", true]);
  t("the refusal names no title and says nothing of the project's participants",
    [JSON.stringify(byOlga).includes(V_TITLE), /sam|owner/i.test(String(byOlga?.detail))], [false, false]);

  /* ONE ANSWER: a mismatch over a bundle the caller SEES says no more than an id nobody minted. */
  const oS = nextRun(), oN = nextRun();
  const olgaSeen = await openRaw(OLGA, oS, "inquiry", VISIBLE);
  const olgaNever = await openRaw(OLGA, oN, "inquiry", NEVER_P);
  t("ONE ANSWER: olga's refusal over the project she SEES is byte-identical to her refusal over a never-minted id",
    norm(olgaSeen, oS, VISIBLE), norm(olgaNever, oN, NEVER_P));

  /* NOTHING WAS WRITTEN: the refused run id is free, so the same id correctly labelled meets the gate. */
  const RID = nextRun();
  const first = parse(await openRaw(SAM, RID, "inquiry", VISIBLE));
  const again = parse(await openRaw(SAM, RID, "project", VISIBLE));
  t("a refused open WRITES NOTHING: the same run id then opens correctly labelled",
    [verdict(first), verdict(again)], [NO, [true, null, "PARTICIPANT"]]);
}

/* ======================================================== 2. THE CLOSED VOCABULARY */
console.log("\n--- 2. the kind is RUN_CONTEXTS' closed vocabulary: any other word is refused before any bundle is read ---");
{
  /* BOB #16 (`7d03e852`): a closed vocabulary REFUSES, it does not ignore. The first build matched the word
     against the bundle's type, so `information` over an Information bundle OPENED. */
  const info = await open(SAM, "information", INFO);
  t("REC-153 VOCABULARY: `information` over an INFORMATION bundle (the type matches the word) is REFUSED", verdict(info), NO);
  t("REC-153 VOCABULARY: and the refusal says the WORD is not a kind of run context",
    /is not a kind of run context/.test(String(info?.detail)), true);
  t("REC-153 VOCABULARY: `Project` (a spelling, not the kind) over the visible project is refused",
    verdict(await open(OLGA, "Project", VISIBLE)), NO);
  t("REC-153 VOCABULARY: `Inquiry` over the question is refused, by a member and a machine alike",
    [verdict(await open(SAM, "Inquiry", Q)), verdict(await open(MEM, "Inquiry", Q))], [NO, NO]);
  /* The word is judged before the id, so an unknown word over a hidden id and over a visible question read
     alike but for what the caller sent — the refusal carries no bit about the id. */
  const wH = nextRun(), wQ = nextRun();
  const wordHidden = await openRaw(VERA, wH, "information", HIDDEN);
  const wordQ = await openRaw(VERA, wQ, "information", Q);
  t("REC-153 VOCABULARY: vera's unknown word over the hidden project reads as over the question (the id is not read)",
    norm(wordHidden, wH, HIDDEN), norm(wordQ, wQ, Q));
}

/* ======================================================== 3. THE JOINED GATE, OVER A PROJECT THE CALLER SEES */
console.log("\n--- 3. the same open labelled `project` still meets the joined gate ---");
{
  t("REC-153 LABELLED `project`: olga (invited, not joined) is refused by the JOINED GATE, not by the kind check",
    verdict(await open(OLGA, "project", VISIBLE)), REFUSED("AI_RUN_NOT_PROJECT_MEMBER"));
  t("REC-153 LABELLED `project`: ruth (administrator, not joined) likewise — no administrator bypass",
    verdict(await open(RUTH, "project", VISIBLE)), REFUSED("AI_RUN_NOT_PROJECT_MEMBER"));
  t("REC-153 LABELLED `project`: sam (joined) OPENS, on the PARTICIPANT ground",
    verdict(await open(SAM, "project", VISIBLE)), [true, null, "PARTICIPANT"]);
  t("REC-153 LABELLED `project`: a machine credential OPENS, not asked (NO_MEMBER_BEHIND_CALLER)",
    verdict(await open(MEM, "project", VISIBLE)), [true, null, "NO_MEMBER_BEHIND_CALLER"]);
}

/* ======================================================== 4. UNSEEN IS ABSENT, FOR EVERY CALLER */
console.log("\n--- 4. an id the caller cannot see answers exactly as a never-minted one — for every caller and kind ---");
{
  const rH = nextRun(), rN = nextRun(), rNQ = nextRun();
  const hidden = await openRaw(VERA, rH, "inquiry", HIDDEN);
  const never = await openRaw(VERA, rN, "inquiry", NEVER_P);
  const neverQ = await openRaw(VERA, rNQ, "inquiry", NEVER_Q);
  show("vera: inquiry over the hidden project", hidden);
  show("vera: inquiry over a never-minted id", never);
  t("REC-153 UNSEEN REFUSED: vera opening the project HIDDEN from her as an `inquiry` is REFUSED", verdict(parse(hidden)), NO);
  t("REC-153 UNSEEN REFUSED: and a never-minted id is refused by the same code",
    [verdict(parse(never)), verdict(parse(neverQ))], [NO, NO]);
  t("REC-153 BYTE-IDENTICAL: vera's raw answer over the hidden project equals her answer over a never-minted id",
    norm(hidden, rH, HIDDEN), norm(never, rN, NEVER_P));
  t("REC-153 BYTE-IDENTICAL: and over a never-minted id of the other prefix (the id's shape is not read)",
    norm(hidden, rH, HIDDEN), norm(neverQ, rNQ, NEVER_Q));
  const rV = nextRun();
  const unseenVisible = await openRaw(VERA, rV, "inquiry", VISIBLE);
  t("REC-153 BYTE-IDENTICAL: sam's project (never shown to vera) answers her exactly as the never-minted id",
    norm(unseenVisible, rV, VISIBLE), norm(never, rN, NEVER_P));
  t("the hidden project's title appears nowhere in vera's raw answer", hidden.body.includes(H_TITLE), false);

  /* UNDER `project` TOO: sight before position (`#noSuchProject`'s order). Absent and hidden are ONE answer,
     as REC-138 required — now the absent answer rather than the joined gate's refusal. */
  const pH = nextRun(), pN = nextRun();
  const hiddenP = await openRaw(VERA, pH, "project", HIDDEN);
  const neverP = await openRaw(VERA, pN, "project", NEVER_P);
  t("REC-153 UNSEEN REFUSED: under `project`, the hidden project and a never-minted id are one ABSENT refusal, byte for byte",
    [verdict(parse(hiddenP)), norm(hiddenP, pH, HIDDEN)], [NO, norm(neverP, pN, NEVER_P)]);

  /* A MACHINE SEES NO MORE THAN ITS PRINCIPAL (BOB #16, `7d03e852`): an operator credential sees every bundle,
     so only a never-minted id is unseen to it — and it gets the absent answer the member gets, byte for byte. */
  const mN = nextRun(), mP = nextRun();
  const machineNever = await openRaw(MEM, mN, "inquiry", NEVER_Q);
  const machineNeverP = await openRaw(MEM, mP, "project", NEVER_P);
  t("REC-153 MACHINE ABSENT: a machine credential's `inquiry` open over a never-minted id is REFUSED as absent",
    verdict(parse(machineNever)), NO);
  t("REC-153 MACHINE ABSENT: and under `project` too", verdict(parse(machineNeverP)), NO);
  t("REC-153 MACHINE ABSENT: byte-identical to the member's own answer over a never-minted id",
    norm(machineNever, mN, NEVER_Q), norm(neverQ, rNQ, NEVER_Q));
}

/* ======================================================== 5. THE LIAR'S ARM */
console.log("\n--- 5. a correctly labelled inquiry run still opens ---");
{
  t("REC-153 LIAR'S ARM: sam (a participant elsewhere) opens a run over the QUESTION labelled `inquiry`",
    verdict(await open(SAM, "inquiry", Q)), [true, null, "INQUIRY"]);
  t("REC-153 LIAR'S ARM: vera (in NO project) opens it too — a question consults no project",
    verdict(await open(VERA, "inquiry", Q)), [true, null, "INQUIRY"]);
  t("REC-153 LIAR'S ARM: olga and ruth open it too",
    [verdict(await open(OLGA, "inquiry", Q)), verdict(await open(RUTH, "inquiry", Q))],
    [[true, null, "INQUIRY"], [true, null, "INQUIRY"]]);
  t("REC-153 LIAR'S ARM: a machine credential opens it",
    verdict(await open(MEM, "inquiry", Q)), [true, null, "NO_MEMBER_BEHIND_CALLER"]);
}

/* ======================================================== 6. THE ORDER */
console.log("\n--- 6. the kind check runs at the open, before the gate and before the run's own shape ---");
{
  t("ORDER: a mislabelled open that also omits the skill version is refused on its CONTEXT, not its shape",
    codeOf(await open(OLGA, "inquiry", VISIBLE, { skillVersion: null })), "AI_RUN_NO_SUCH_CONTEXT");
  t("ORDER: a correctly labelled open without a skill version still meets C-22.7 (the check added nothing there)",
    codeOf(await open(SAM, "inquiry", Q, { skillVersion: null })), "AI_RUN_SKILL_VERSION_UNNAMED");
}

/* ======================================================== 7. AN AI CREDENTIAL SEES AS ITS PRINCIPAL */
console.log("\n--- 7. a machine sees no more than its principal: vera's agent answers as vera does ---");
{
  /* An `ai` credential carries its principal member's viewer and stamps NO actor (it is not asked about
     participation). BOB #16: its open over an id its PRINCIPAL cannot see answers as absent, exactly as that
     member's own open does. The first build let it through (a machine was not refused an unheld id). */
  const cred = await POST(`op=aicredentialmint&token=${RUTH}`, {
    tokenId: "vera-agent-153", principalKind: "member", principalMember: "vera",
    taskScope: "runs", writes: ["airunopen"], note: "vera's agent, allowed to open its own runs" });
  const AK = cred?.token;
  t("FIXTURE: an `ai` credential for vera is minted, and it opens a run over the question",
    [typeof AK === "string", verdict(AK ? await open(AK, "inquiry", Q) : null)],
    [true, [true, null, "NO_MEMBER_BEHIND_CALLER"]]);
  const aH = nextRun(), vH = nextRun(), aP = nextRun(), vP = nextRun();
  const agentHidden = await openRaw(AK, aH, "inquiry", HIDDEN);
  const veraHidden = await openRaw(VERA, vH, "inquiry", HIDDEN);
  const agentHiddenP = await openRaw(AK, aP, "project", HIDDEN);
  const veraHiddenP = await openRaw(VERA, vP, "project", HIDDEN);
  show("vera's agent: inquiry over the hidden project", agentHidden);
  show("vera herself: inquiry over the hidden project", veraHidden);
  t("REC-153 AGENT SIGHT: vera's agent over the project hidden from vera is REFUSED as absent",
    [verdict(parse(agentHidden)), verdict(parse(agentHiddenP))], [NO, NO]);
  /* The control plane's envelope carries `tokenClass` — the CALLER'S OWN credential class (`ai` vs `member`),
     which it already knows and which says nothing about the id — so the two are compared on the ANSWER the
     plane gave, byte for byte (measured: the raw bodies differ in that one envelope line and nowhere else). */
  const answer = (r, run) => sha(JSON.stringify(parse(r)).split(run).join("RUN"));
  t("REC-153 AGENT SIGHT: its answer is byte-identical to vera's OWN open over it, under `inquiry` and under `project`",
    [answer(agentHidden, aH), answer(agentHiddenP, aP)], [answer(veraHidden, vH), answer(veraHiddenP, vP)]);
  t("REC-153 AGENT SIGHT: and over sam's project (unseen by vera) the same absent refusal",
    verdict(await open(AK, "project", VISIBLE)), NO);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nairun-contextkind: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
