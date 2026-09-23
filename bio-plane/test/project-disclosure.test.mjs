/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/project-disclosure.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/project-disclosure.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once), the real sources are hashed before and after, and what each arm MUST fail is declared in the driver before it arms.
   RESULTS, RE-RUN 2026-09-19 by REC-145 in worktree agent-a3372f65d0555dbd9 on base 1d439e31 + this item (real src/index.mjs 663,811 B sha256 3f4f83fdb5d6…, src/store.mjs 2,642,854 B sha256 478f0bf051b4…, src/airun.mjs 130,844 B sha256 eeee9cc93b75…, untouched: YES), every arm AS DECLARED: baseline 27/0 · restore-title 24/3 · restore-title-fork 25/2 · count-hidden 21/6 (REC-139's three plus REC-145's three §3 count arms — declaration widened from this run, see the driver) · report-nothing 23/4 · **inquiry-consults-projects — REC-145's CONTROL, the project consult restored for an inquiry context -> 24/3: THE LIAR'S ARM (ground back to PARTICIPANT), sam's only-hidden-question PERMITTED arm and nora's PERMITTED arm, by name; nora's byte-identity arm stays GREEN (both her runs are then refused identically — it proves no bit, not the permission)** · gate-dropped-everywhere (the row's liar) -> 26/1, only the PROJECT-CONTEXT refusal arm · consult-unless-inquiry (over-strictness, the same rule spelled the other way) -> 27/0 · run-stamp-dropped 23/4 · sight-via-redactor 27/0. REC-139's "gate-over-sight" arm is RETIRED (a no-op once the verdict consults no project over a question; stated in the driver).
   RESULTS, RUN 2026-09-18 in worktree agent-a590a3b1c261bf1ff on base ee9f201c (real src/index.mjs 659,412 B sha256 a1c37a51e595…, src/store.mjs 2,607,068 B sha256 0406cea9a0c7…, untouched: YES), every arm AS DECLARED: (a) baseline 21/0 · (b) restore-title — promote's NAME_TAKEN carries the other project's id and title again -> 18/3, the two CREATE payload arms and ONE ANSWER, fork's held green · (c) restore-title-fork — the same at forkProject alone -> 19/2, the two FORK arms · (d) count-hidden — the run report counts every citing project again -> 18/3, sam's open and tick byte-identity arms and THE LIAR'S ARM, with olga's, ruth's and the machine's counts green (they see both) · (e) report-nothing, the liar — zero projects to everyone -> 17/4, every byte-identity arm GREEN (the lie) and the liar's, olga's, ruth's and the machine's count arms red · (f) gate-over-sight, the second liar — DEC-63's verdict computed over sight too -> 20/1, only §3's refusal arm · (g) run-stamp-dropped — the control plane's viewer stamp removed from the three run verbs -> 17/4, fails CLOSED (no project stated, never every one): the four visible-count arms · (h) sight-via-redactor, the over-strictness arm -> 21/0. NOT AN ARM: *"let a caller-chosen id through"* — plane-minted ids were not built (design gap), so there is no fence to remove; §4 pins EXISTS as KNOWN.
 * =========================================================================
 * REC-139 / D-428 / IC-156 — A REFUSAL, OR A REPORT, NEVER NAMES OR DESCRIBES A PROJECT THE CALLER
 * CANNOT SEE. Membership Architecture v2 §7 (BOB #15, 2026-09-18, at `7b733d07`, *"What a refusal may
 * say about a project the caller cannot see"*) and §7.9 (*"Not its existence, not its name"*).
 *
 * TWO OF THE RULING'S THREE POINTS ARE BUILT AND DRIVEN HERE:
 *   (1) `NAME_TAKEN` (7.1's instance-wide name uniqueness, at `promote` and at `forkProject`) carries
 *       neither the other project's id nor its title. PROVISIONALLY, while the point is OPEN for Bob,
 *       uniqueness still holds: the refusal is still said, and it reveals only the name the caller typed.
 *   (3) An inquiry RUN's report (`projectGate`, on `airunopen` / `airuntick`) counts ONLY the citing
 *       projects its caller can see. DEC-63 decides who may START a run and is unchanged: the gate's
 *       verdict is still computed over every citing project. [SUPERSEDED 2026-09-19 by REC-145: Bob
 *       amended DEC-63 — over a question the verdict consults NO project; a project context keeps the
 *       joined gate. §3 is corrected and carries REC-145's arms. The count is unchanged.]
 * THE THIRD, plane-minted project ids (which closes `EXISTS`), is NOT built: the design does not say
 * whether a caller-supplied id for a new project is refused or ignored, and REC-139's row says STOP on
 * that. §4 below pinned the creation's EXISTS as KNOWN so a change to it is noticed — and it WAS noticed:
 * REC-141 (2026-09-18, IC-158) built the mint BOB #15 then decided, and §4 is CORRECTED to the refusal.
 *
 * WHAT WAS WRONG, measured on the unedited tree (`ee9f201c` + the claim), raw:
 *   - vera (never invited) creating a project named like iris's hidden one: 200, NAME_TAKEN, with
 *     `bundleId` = the hidden project's id and `title` = its canonical title.
 *   - the same through `op=projectfork`: NAME_TAKEN with the same two fields.
 *   - sam's run over a question his project cites answered `projectGate.projects: 1`, and `2` once a
 *     project he cannot see also cited it.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (a) drop uniqueness, so no NAME_TAKEN is said at all. §1 still requires the refusal.
 *   (b) report ZERO projects to everyone. §2 requires a VISIBLE citing project to be counted — sam's own,
 *       an invited member's skeleton view, and an administrator's sight — and a machine credential to
 *       count all of them.
 *   (c) keep the count honest by dropping the GATE's use of the hidden project (so a question cited only
 *       by a project the caller cannot see reads as projectless and is permitted). §3 pins DEC-63's verdict.
 *       [REC-145, 2026-09-19: that "liar" is now the RULING, as Bob amended DEC-63. The liar REC-145's row
 *       names instead is (d): drop the gate for EVERY context — §3's project-context arm catches it.]
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.PROJECT_DISCLOSURE_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const SHOW = process.env.PROJECT_DISCLOSURE_SHOW === "1";   /* print the raw answers (the before-table) */

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec139", MEM = "mem-rec139";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
}));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* THE RAW ANSWER: status, content type and the body's exact bytes — nothing parsed away. */
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, type: res.headers.get("content-type"), body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const show = (label, r) => { if (SHOW) console.log(`  RAW ${label}: ${r.status} ${r.type} ${r.body}`); };
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const E = encodeURIComponent;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 700)}`); return r; };

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-139" }));
const CAPS = ["contribute", "publish", "create_projects"];
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: CAPS });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-139` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-139` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* The founder counts as the first administrator, so the second must be one too (ADMINS_FIRST). */
const RUTH = await enrol("ruth", "admin");    /* an administrator: sees every project (§7.3) */
const IRIS = await enrol("iris", "member");   /* owns the HIDDEN project */
const VERA = await enrol("vera", "member");   /* NEVER invited to it: the caller who cannot see it */
const SAM  = await enrol("sam", "member");    /* owns the VISIBLE project; never invited to the hidden one */
const OLGA = await enrol("olga", "member");   /* joins sam's project, and is INVITED (not joined) to iris's */
const NORA = await enrol("nora", "member");   /* REC-145: in NO project at all, invited to none */

const inquiryMd = (id) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "---", "", "## Question", "", "Did it?", "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7), which writes
   it into the bytes and refuses a creation that names one (C-59.1) or bytes that carry one (C-59.2). So a
   project's creation bytes carry no `id:` line and its request no bundleId (`id` is null for a project); the
   minted id is read from the answer. Every other type still names its own. */
const projectMd = (id, title) => ["---", ...(id === null ? [] : [`id: ${id}`]), "object_type: project", `title: "${title}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");
let seq = 0;
const create = (tok, id, type, title) => {
  const md = type === "project" ? projectMd(id, title) : inquiryMd(id);
  return RAW(`op=promote&token=${tok}`, {
    ...(type === "project" ? {} : { bundleId: id }), base: null, snapKey: `20260701T0000${String(++seq).padStart(2, "0")}Z_rec139`,
    meta: { object_type: type, group: "believe-in-oakland", title,
            current_state: type === "project" ? "forming" : "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
};
const cite = async (tok, project, ids) => {
  const handle = (await POST(`op=select&token=${tok}&kind=enumerated`, { ids }))?.handle;
  if (!handle) throw new Error(`select for ${project}`);
  return POST(`op=cite&token=${tok}&project=${E(project)}&handle=${handle}&note=${E("drawn on")}`, {});
};

/* CORRECTED 2026-09-18 (REC-141): the three project ids were CHOSEN here; they are now the ids the plane minted. */
const H_TITLE = "Sewer Fund Transfers", V_TITLE = "Franchise Fee Diversion", VERAS_TITLE = "Vera's own project";
const Q = "INQ-2026-9139-transfers";
const HIDDEN = must("iris creates the hidden project", parse(await create(IRIS, null, "project", H_TITLE))).bundleId;
const VISIBLE = must("sam creates the visible project", parse(await create(SAM, null, "project", V_TITLE))).bundleId;
const VERAS = must("vera creates her own project", parse(await create(VERA, null, "project", VERAS_TITLE))).bundleId;
must("the question", parse(await create(ADM, Q, "inquiry", "Did the transfer follow the adopted process?")));
must("sam invites olga", await POST(`op=projectinvite&token=${SAM}&projectId=${VISIBLE}&handle=olga`));
must("olga joins sam's project", await POST(`op=projectjoin&token=${OLGA}&projectId=${VISIBLE}`));
must("iris invites olga (she never joins)", await POST(`op=projectinvite&token=${IRIS}&projectId=${HIDDEN}&handle=olga`));
must("ruth is invited to sam's project", await POST(`op=projectinvite&token=${SAM}&projectId=${VISIBLE}&handle=ruth`));
must("ruth joins it", await POST(`op=projectjoin&token=${RUTH}&projectId=${VISIBLE}`));
must("sam's project cites the question", await cite(SAM, VISIBLE, [Q]));

/* FIXTURE READ-BACK through ops other than the ones that wrote it: the hidden project is hidden from
   vera and sam and visible to olga and ruth, so every arm below measures the viewer it names. */
const listed = async (tok) => ((await POST(`op=list&token=${tok}&limit=1000`))?.bundles ?? []).map((b) => b.bundle_id);
t("FIXTURE: vera and sam do NOT see the hidden project; olga (invited) and ruth (administrator) DO",
  [(await listed(VERA)).includes(HIDDEN), (await listed(SAM)).includes(HIDDEN),
   (await listed(OLGA)).includes(HIDDEN), (await listed(RUTH)).includes(HIDDEN)], [false, false, true, true]);

/* ======================================================== 1. NAME_TAKEN */
console.log("\n--- 1. NAME_TAKEN names neither the other project's id nor its title ---");
{
  /* A differently-cased spelling on purpose: echoing the STORED title would disclose its casing too. */
  const TYPED = "sewer  FUND transfers";
  const viaCreate = await create(VERA, null, "project", TYPED);
  show("vera creates a project named like the hidden one", viaCreate);
  const c = parse(viaCreate);
  t("CREATE: uniqueness still holds (provisional, OPEN for Bob) — vera is refused NAME_TAKEN", codeOf(c), "NAME_TAKEN");
  t("CREATE: the refusal carries NO bundleId and NO title", [c && "bundleId" in c, c && "title" in c], [false, false]);
  t("CREATE: neither the hidden id nor its stored title appears ANYWHERE in the raw body",
    [viaCreate.body.includes(HIDDEN), viaCreate.body.includes(H_TITLE)], [false, false]);

  /* CORRECTED 2026-09-18 (REC-141): no newId — a named one is refused (C-59.3) before the name is judged. */
  const viaFork = await RAW(`op=projectfork&token=${VERA}&projectId=${VERAS}&title=${E(TYPED)}`);
  show("vera forks her own project under the hidden one's name", viaFork);
  const f = parse(viaFork);
  t("FORK: uniqueness still holds — NAME_TAKEN", codeOf(f), "NAME_TAKEN");
  t("FORK: the refusal carries NO bundleId and NO title", [f && "bundleId" in f, f && "title" in f], [false, false]);
  t("FORK: neither the hidden id nor its stored title appears in the raw body",
    [viaFork.body.includes(HIDDEN), viaFork.body.includes(H_TITLE)], [false, false]);

  /* ONE ANSWER, whichever project holds the name: vera colliding with a project she CAN see (her own)
     gets the same bytes as colliding with one she cannot. */
  const own = await create(VERA, null, "project", VERAS_TITLE);
  t("ONE ANSWER: a collision with a project vera CAN see is byte-identical to one with a project she cannot",
    { status: own.status, type: own.type, sha: sha(own.body) },
    { status: viaCreate.status, type: viaCreate.type, sha: sha(viaCreate.body) });
  t("OVER-STRICTNESS: a name nobody holds is NOT refused (uniqueness is not a blanket refusal)",
    parse(await create(VERA, null, "project", "Sewer Fund Transfers, revisited"))?.ok, true);
}

/* ======================================================== 2. THE RUN REPORT */
console.log("\n--- 2. an inquiry run's report counts only the citing projects its caller can see ---");
let runSeq = 0;
/* A FIXED clock one day AHEAD of the wall clock, so both reads compute the same lease expiry and no
   run lapses to the reaper between them (a run opened in the past is reaped and its tick then reports
   `stopped`, which carries no gate — measured on the first draft of this suite). */
const RUN_AT = new Date(Math.floor(Date.now() / 3600000) * 3600000 + 86400000).toISOString().replace(/\.\d{3}Z$/, "Z");
const openRaw = (tok, run) => RAW(`op=airunopen&token=${tok}`, {
  run, contextType: "inquiry", contextId: Q, label: "evidence sweep", mode: "check",
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }],
  leaseMs: 600000, at: RUN_AT });
const tickRaw = (tok, run) => RAW(`op=airuntick&token=${tok}`, { run, at: RUN_AT });
const gateOf = (r) => parse(r)?.projectGate ?? null;
/* The run id is the only thing the two reads differ in by construction, so it is the only thing
   normalised; every other byte is compared. */
const norm = (r, run) => ({ status: r.status, type: r.type, sha: sha(r.body.split(run).join("RUN")) });

const RUN_BEFORE = { sam: `RUN-rec139-sam-${++runSeq}`, olga: `RUN-rec139-olga-${++runSeq}`,
                     ruth: `RUN-rec139-ruth-${++runSeq}`, adm: `RUN-rec139-adm-${++runSeq}` };
const before = {
  sam: await openRaw(SAM, RUN_BEFORE.sam), olga: await openRaw(OLGA, RUN_BEFORE.olga),
  ruth: await openRaw(RUTH, RUN_BEFORE.ruth), adm: await openRaw(ADM, RUN_BEFORE.adm) };
const tickBefore = await tickRaw(SAM, RUN_BEFORE.sam);
show("sam opens a run, ONLY his project citing", before.sam);

must("iris's HIDDEN project now cites the same question", await cite(IRIS, HIDDEN, [Q]));
const back = ((await POST(`op=backlinks&token=${ADM}&target=${E(Q)}`))?.backlinks ?? []).map((x) => x.from).sort();
t("FIXTURE READ-BACK (the admin token, op=backlinks): BOTH projects now draw on the question", back, [HIDDEN, VISIBLE].sort());

const RUN_AFTER = { sam: `RUN-rec139-sam-${++runSeq}`, olga: `RUN-rec139-olga-${++runSeq}`,
                    ruth: `RUN-rec139-ruth-${++runSeq}`, adm: `RUN-rec139-adm-${++runSeq}` };
const after = {
  sam: await openRaw(SAM, RUN_AFTER.sam), olga: await openRaw(OLGA, RUN_AFTER.olga),
  ruth: await openRaw(RUTH, RUN_AFTER.ruth), adm: await openRaw(ADM, RUN_AFTER.adm) };
/* Each run is ticked ONCE after its open, so the two ticks carry the same `ticks` count; ticking the
   first run twice moved that counter, which is the run and not the report (measured, first draft). */
const tickAfter = await tickRaw(SAM, RUN_AFTER.sam);
show("sam opens a run, his project AND the hidden one citing", after.sam);
show("sam's tick before", tickBefore);
show("sam's tick after", tickAfter);

t("THE RUN STARTED both times (the report is a SUCCESS answer; a refusal would measure nothing)",
  [parse(before.sam)?.started, parse(after.sam)?.started], [true, true]);
t("sam (never invited to the hidden project): airunopen's raw answer is BYTE-IDENTICAL whether or not it cites",
  norm(after.sam, RUN_AFTER.sam), norm(before.sam, RUN_BEFORE.sam));
t("sam: airuntick's raw answer is BYTE-IDENTICAL too (each run ticked once after its open)",
  norm(tickAfter, RUN_AFTER.sam), norm(tickBefore, RUN_BEFORE.sam));
/* CORRECTED 2026-09-19 by REC-145 (DEC-63 as amended by Bob; Membership v2 §7, BOB #16), never
   exempted: this pinned `applied: true, ground: "PARTICIPANT"` — sam admitted BECAUSE he joined the
   citing project. Over a question the verdict now consults no project, so the ground is INQUIRY and the
   gate did not apply. What the arm exists for is unchanged: sam's own citing project is still COUNTED. */
t("THE LIAR'S ARM: sam's OWN citing project is still counted — the report is not emptied",
  gateOf(after.sam), { applied: false, ground: "INQUIRY", why: gateOf(before.sam)?.why ?? null, projects: 1 });
t("SEES IT: olga (INVITED to the hidden project — the skeleton shows what it cites, §7.9) counts it: 1 then 2",
  [gateOf(before.olga)?.projects, gateOf(after.olga)?.projects], [1, 2]);
t("SEES IT: ruth (an administrator, §7.3) counts it: 1 then 2",
  [gateOf(before.ruth)?.projects, gateOf(after.ruth)?.projects], [1, 2]);
t("MACHINE CREDENTIAL (the admin token, unfiltered): counts every citing project, 1 then 2",
  [gateOf(before.adm)?.ground, gateOf(before.adm)?.projects, gateOf(after.adm)?.projects],
  ["NO_MEMBER_BEHIND_CALLER", 1, 2]);
t("no report names the hidden project anywhere in its raw body",
  [after.sam, after.olga, after.ruth, tickAfter].map((r) => r.body.includes(HIDDEN)), [false, false, false, false]);

/* ======================================================== 3. DEC-63 AS AMENDED (REC-145) */
/* CORRECTED 2026-09-19 by REC-145, never exempted. This section was titled *"DEC-63 IS UNCHANGED"* and
   pinned sam REFUSED `AI_RUN_NOT_PROJECT_MEMBER` over a question only a project he cannot see cites —
   REC-139's reading, under which who may START a run was not a disclosure rule. Bob amended DEC-63 on
   2026-09-18 (*"a project doesn't own an area of enquiry to the exclusion of others"*), and BOB #16 read
   it at the code: a run whose context is an INQUIRY consults no project, so that refusal is never said
   over a question — and the refusal was itself the one bit §7.9 forbids (it told sam a hidden project
   cites the question). A PROJECT context keeps the joined gate. REC-145's row is this section's contract.
   PREMISE THE TREE DOES NOT MEET, stated: the row's accept names a DISCOVERABLE project beside a hidden
   one. §7.14 (discoverable-or-hidden) is designed and NOT built — no store code knows the word — so today
   every project a member was not invited to is hidden from them, and nora's two unseen projects below
   are iris's (hidden) and sam's (uninvited, therefore equally unseen). */
console.log("\n--- 3. DEC-63 as amended: a run over a question consults NO project; a project context keeps its gate ---");
{
  const openCtx = (tok, run, contextType, contextId) => RAW(`op=airunopen&token=${tok}`, {
    run, contextType, contextId, label: "evidence sweep", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }],
    leaseMs: 600000, at: RUN_AT });
  /* The run id and the question id are the only things two opens differ in by construction. */
  const normQ = (r, run, ctx) => ({ status: r.status, type: r.type, sha: sha(r.body.split(run).join("RUN").split(ctx).join("CTX")) });

  const Q2 = "INQ-2026-9139-only-hidden";
  must("a second question", parse(await create(ADM, Q2, "inquiry", "Only the hidden project asks this")));
  must("only the HIDDEN project cites it", await cite(IRIS, HIDDEN, [Q2]));
  const r = parse(await openCtx(SAM, `RUN-rec139-q2-${++runSeq}`, "inquiry", Q2));
  t("sam over a question ONLY a project he cannot see cites is PERMITTED (REC-145), and the count names it not",
    [r?.started, codeOf(r) === "AI_RUN_NOT_PROJECT_MEMBER", r?.projectGate?.projects],
    [true, false, 0]);
  t("and that answer names no project", JSON.stringify(r).includes(HIDDEN), false);

  /* THE ROW'S ACCEPT: a member in NO project, over a question cited by TWO projects she cannot see, is
     permitted with a count naming neither — and the answer is BYTE-IDENTICAL to the one over a question
     NO project cites, which is what "carries no bit" means when it is measured rather than asserted. */
  const Q3 = "INQ-2026-9145-uncited";
  must("a question no project cites", parse(await create(ADM, Q3, "inquiry", "Nobody's project asks this")));
  const backQ = ((await POST(`op=backlinks&token=${ADM}&target=${E(Q)}`))?.backlinks ?? []).map((x) => x.from).sort();
  t("FIXTURE READ-BACK (admin token): the question nora asks is cited by BOTH projects, neither of them hers",
    backQ, [HIDDEN, VISIBLE].sort());
  const runCited = `RUN-rec145-nora-${++runSeq}`, runBare = `RUN-rec145-nora-${++runSeq}`;
  const cited = await openCtx(NORA, runCited, "inquiry", Q);
  const bare = await openCtx(NORA, runBare, "inquiry", Q3);
  show("nora over the question two unseen projects cite", cited);
  t("REC-145 PERMITTED: nora (no project) runs over a question a hidden AND an unseen project cite — it STARTS, "
    + "on the INQUIRY ground, and the count names neither",
    [parse(cited)?.started, codeOf(parse(cited)), gateOf(cited)?.ground, gateOf(cited)?.projects],
    [true, null, "INQUIRY", 0]);
  t("REC-145 NO BIT: nora's answer over the cited question is BYTE-IDENTICAL to her answer over an uncited one",
    normQ(cited, runCited, Q), normQ(bare, runBare, Q3));
  t("REC-145: neither cited project's id appears in nora's raw answer",
    [cited.body.includes(HIDDEN), cited.body.includes(VISIBLE)], [false, false]);

  /* THE LIAR'S ARM (the row's: *"dropping the gate for every context"*). A run whose context is the
     PROJECT ITSELF is still refused to a non-participant — olga SEES iris's project (invited, not joined)
     and nora sees neither; both are refused by the same code. */
  const oh = parse(await openCtx(OLGA, `RUN-rec145-olga-${++runSeq}`, "project", HIDDEN));
  const nv = parse(await openCtx(NORA, `RUN-rec145-norap-${++runSeq}`, "project", VISIBLE));
  /* CORRECTED 2026-09-19 by REC-153 (BOB #16, `7d03e852`), never exempted: nora cannot SEE sam's project, and
     the open now asks sight before position — a project the caller cannot see answers as one that does not
     exist (`AI_RUN_NO_SUCH_CONTEXT`, C-22.11). She is still REFUSED, never started; C-22.8 is now said only to a
     caller who sees the project, which olga's half keeps (and which the gate-dropped control still catches). */
  t("REC-145 PROJECT CONTEXT KEEPS THE GATE: olga (invited, not joined) over the hidden project is REFUSED "
    + "AI_RUN_NOT_PROJECT_MEMBER, and nora over sam's (which she cannot see) is refused as for an absent project",
    [oh?.started, codeOf(oh), nv?.started, codeOf(nv)], [false, "AI_RUN_NOT_PROJECT_MEMBER", false, "AI_RUN_NO_SUCH_CONTEXT"]);
  t("REC-145 OVER-STRICTNESS: sam, who JOINED his own project, still runs over it (the gate is not a wall)",
    [parse(await openCtx(SAM, `RUN-rec145-samp-${++runSeq}`, "project", VISIBLE))?.started], [true]);
}

/* ======================================================== 4. CLOSED BY REC-141 */
console.log("\n--- 4. CLOSED BY REC-141: a CREATION naming a hidden project's id answers as one naming a free id ---");
{
  /* CORRECTED 2026-09-18 (REC-141, IC-158). This pinned `EXISTS` AS MEASURED, as KNOWN, while BOB #15's
     "the plane mints project ids" was undecided in its mechanism. It is now decided and built: a creation
     naming an id is refused BEFORE any id is looked up, one answer taken or not (`project-mint.test.mjs`). */
  const named = (id) => { const md = projectMd(null, "Anything at all");
    return RAW(`op=promote&token=${VERA}`, { bundleId: id, base: null, snapKey: `20260701T0000${String(++seq).padStart(2, "0")}Z_rec139`,
      meta: { object_type: "project", group: "believe-in-oakland", title: "Anything at all", current_state: "forming",
              created: NOW, last_updated: LATER },
      files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] }); };
  const r = await named(HIDDEN), f = await named(HIDDEN.replace(/-\d{4}-/, "-9999-"));
  show("vera creates at the hidden project's id", r);
  t("REC-141: vera's CREATION at the hidden id is refused PROJECT_ID_SUPPLIED, not EXISTS", codeOf(parse(r)), "PROJECT_ID_SUPPLIED");
  t("REC-141: byte-identical to her creation at a never-minted id",
    { status: r.status, type: r.type, sha: sha(r.body) }, { status: f.status, type: f.type, sha: sha(f.body) });
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nproject-disclosure: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
