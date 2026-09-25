/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/rec207-bias-debt-settle.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/rec207-bias-debt-settle.control.mjs [arm]`. RESULTS, RUN 2026-09-24 by the REC-207 worker (cloud session WORKER REC-207 (SCHEDULER #19)) on origin/main 1a7f0bcc0 + this item (real src/index.mjs 813,575 B sha256 719552485cb3…, src/store.mjs 3,316,859 B c9ca9654fd4c…, src/schema.mjs 251,439 B c78cf8b80a89…, src/queuestate.mjs 23,647 B 402dc615e667…, checks/bio-checks.mjs 958,311 B 5f16a92dac4a…, untouched: YES), ELEVEN ARMS, each patching a COPY, each anchor occurring exactly its declared number of times, RE-RUN after ARM C was added and every declaration re-read: (1) baseline -> 37/0. (2) **discharge-any-rerun — THE ROW'S CONTROL, the lens comparison alone removed so any re-run discharges -> 36/1: ARM O1, THE OTHER-LENS ARM, BY NAME**, with ARM O2 (the undetermined hand), R3 and R4 GREEN — the asymmetry is what makes it evidence rather than an outcome that cost nothing. (3) undetermined-discharges — two absent hashes read as agreement -> 36/1: ARM O2 by name, O1 green. (4) no-reason-required -> 32/5: S2, S2b AND S3, S4, S5 — **NOT AS FIRST DECLARED (S3/S4 were declared GREEN), and the cause is the SUITE'S SHAPE: ARM S runs against one store in sequence, so the reasonless resolve this arm lets through settles the obligation S3 and S4 were going to act on and both meet ALREADY_SETTLED; everything after ARM S is untouched.** (5) settlement-not-appended — the append-only row not written while `bias_debts` is still stamped -> 30/7: S5, S7, C3, R4, L1, L2, N1, **with ARM S4 GREEN — the ACT still claims the settlement and only the RECORD is missing, which is why this suite reads op=biasdebt rather than the act's own answer**. (6) held-dropped -> 33/4: H1 by name plus C3, L2 and N1 — **NOT AS FIRST DECLARED (H1 alone), and the cause is the mechanism: restating clears `settled_kind`, so the resolve stops naming itself later.** (7) machine-allowed -> 34/3: S3 by name plus S4 and S5 — **NOT AS FIRST DECLARED, arm (4)'s cascade one act later; S2 stays GREEN, the pair that says only the machine fence moved.** (8) sight-dropped -> 36/1: G5 by name, with G2 GREEN (that run genuinely does not exist), which is what makes G5 a measurement of SIGHT and not of spelling. (9) context-check-dropped -> 35/2: G3 and G5. (10) door-taskresolve — `instead` put back as it was -> 36/1: ARM Q1, the row's headline, by name. (11) spelling (OVER-STRICTNESS) — the lens comparison written `!(formed === inForce)` -> 37/0, ALL GREEN as declared. BEFORE THIS ITEM: no re-run link, no resolve act and no settlement table — the suite cannot load a store without `bias_debt_settlements`.
 * =========================================================================
 * REC-207 — WHAT SETTLES A BIAS-DEBT OBLIGATION, AND EACH ACT IS RECORDED.
 *
 * BOB #32, 2026-09-23 23:42Z (`BIO_Declared_Bias_v0_1.md`, "Bias debt, and HUNCH DEBT"):
 *   *"Three acts settle a bias-debt obligation, and each is RECORDED; none clears it silently. (1) The lens
 *   moves back, as built. (2) A re-run under the CURRENT lens discharges the debt of the run it re-runs, and
 *   the obligation is closed with the discharging run's id and lens pins, so a reader sees WHICH run settled
 *   it. A re-run under any other lens discharges nothing. (3) A member's resolve with a REQUIRED stated
 *   reason: an authored act, attributed, dated and append-only."*
 *
 * WHAT WAS WRONG, measured on the unedited tree (`1a7f0bcc0`): D-86 raised the obligation and NOTHING but the
 * lens moving back took it out of the queue. There was no link in the record between a run and the run it
 * re-runs, so discharge (2) had nothing to address. `op=taskresolve` addresses rows in `tasks` by id and a
 * bias debt is keyed by the RUN, so discharge (3) had no door — and `#dispositionOf` pointed EVERY obligation
 * at `taskresolve`, so the queue named a door this item cannot go through. And the one settlement that did
 * exist wrote a bare `cleared_at`: a reader could see THAT the obligation had gone and never WHY.
 *
 * THE ROW'S ACCEPTS-WHEN, and each has its arm: a re-run under the current lens closes the obligation NAMING
 * THAT RUN (ARM R); one under another lens leaves it open (ARM O); a resolve without a reason is refused BY
 * NAME (ARM S2).
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, one store; (ii) no surface — it asserts what the plane SENDS,
 * and no member surface offers either door (stated, not implied: `app.html` is untouched by this item);
 * (iii) the REAPER's path — a re-run killed by its lease is closed by `#aiRunTerminate` directly and never
 * reaches the discharge, and no op can expire a lease, so ARM N drives the neighbouring fact it CAN reach
 * (a re-run merely OPENED discharges nothing) and the reaper arm stays unmeasured HERE and is named rather
 * than claimed; (iv) `moved: null`, which no op can write — D-86's suite says the same and for the same
 * reason; (v) whether a member who is not a recipient SHOULD be able to resolve: the plane admits any member
 * the run's read gate admits (ARM S7 drives it) and that is a decision, not a measurement.
 * ========================================================================= */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed COPY of the sources. */
const SRC_DIR = process.env.REC207_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec207", MEM = "mem-rec207";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* The delay is pinned an hour out so the only alarm that fires is the one this suite fires by hand. */
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test", BIAS_DEBT_DELAY_MS: "3600000" },
});

try {

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const GET = async (q) => parse(await RAW(q));
const E = encodeURIComponent;
const ns = await mf.getDurableObjectNamespace("STORE");
const obj = ns.get(ns.idFromName("bio"));
let clock = Date.now() + 10 * 86400000;
const fire = async () => { clock += 60000; return obj.onAlarm(clock); };

const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return "token=" + lg.token;
};

/* RUTH owns the project and authors the lens. ALICE opens every run. CORA is joined and opened nothing.
   PIA is in no project and can read nothing here. */
const RUTH  = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
/* The second member of a group must be an administrator (ADMINS_FIRST), so gus exists to satisfy that rule
   and is used for nothing else — d86-bias-debt.test.mjs's fixture, for the same reason. */
await member("gus", ["contribute"], "admin");
const ALICE = await member("alice", ["contribute"]);
const CORA  = await member("cora", ["contribute"]);
const PIA   = await member("pia",  ["contribute"]);

const NOW = "2026-09-24T00:00:00Z", LATER = "2026-09-24T01:00:00Z";
const inquiryMd = (id) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: human", "  capability_tier: member",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: member", 'disposition_reason: ""',
  "---", "", "## Question", "", `Did ${id} happen?`, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
const projectMd = () => ["---", "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references: []",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");
let seq = 0;
const bundle = (id, type) => {
  const md = type === "project" ? projectMd() : inquiryMd(id);
  return {
    ...(type === "project" ? {} : { bundleId: id }), base: null,
    snapKey: `20260924T1500${String(++seq).padStart(2, "0")}Z_rec207aa`,
    /* CORRECTED 2026-09-25 (D-563, C-86.3), never exempted: this label contradicted the title the other documents
       state, and is now refused; a project document here states no title, so the label stays its only name. */
    meta: { object_type: type, group: "believe-in-oakland", ...(type === "project" ? { title: `title for ${id}` } : {}),
            current_state: type === "project" ? "forming" : "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [],
  };
};

const Q = "INQ-2026-9207-question", Q2 = "INQ-2026-9207-other";
let P = null;
console.log("\n--- FIXTURE: one project, two readable questions, alice and cora joined, pia never invited ---");
{
  const p = await POST(`op=promote&${RUTH}`, bundle("rec207 project", "project"));
  P = p?.bundleId;
  const q = await POST(`op=promote&${RUTH}`, bundle(Q, "inquiry"));
  const q2 = await POST(`op=promote&${RUTH}`, bundle(Q2, "inquiry"));
  const inv = [];
  for (const h of ["alice", "cora"])
    inv.push((await POST(`op=projectinvite&${RUTH}&projectId=${E(P)}&handle=${h}`))?.ok);
  const joined = [(await POST(`op=projectjoin&${ALICE}&projectId=${E(P)}`))?.state,
                  (await POST(`op=projectjoin&${CORA}&projectId=${E(P)}`))?.state];
  t("FIXTURE: two questions and a project are promoted; alice and cora are JOINED; pia was never invited",
    [p?.ok, !!P, q?.ok, q2?.ok, inv, joined], [true, true, true, true, [true, true], ["joined", "joined"]]);
}

let runSeq = 0;
const openAs = async (tok, contextId, contextType, extra = {}) => {
  const run = `RUN-2026-0924-rec207-${++runSeq}`;
  const r = await POST(`op=airunopen&${tok}`, {
    run, contextType, contextId, label: "REC-207 run", mode: "check",
    principalClaude: "member", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }],
    leaseMs: 30 * 86400000, ...extra });
  return { run, r, started: r?.started === true };
};
const closeAs = async (tok, run) => POST(`op=airunclose&${tok}`, { run, bound: "completed" });
const queue = async (tok) => GET(`op=queue&${tok}&limit=500`);
const ITEMS = (q) => (q && Array.isArray(q.items)) ? q.items : [];
const debtOf = (q, run) => ITEMS(q).filter((i) => i && i.kind === "bias-debt" && i.subject?.id === run);
const debts = (q) => ITEMS(q).filter((i) => i && i.kind === "bias-debt").map((i) => i.subject?.id).sort();
const readDebt = async (run, tok = `token=${ADM}`) => GET(`op=biasdebt&${tok}&run=${E(run)}`);
const resolve = async (tok, body) => POST(`op=biasdebtresolve&${tok}`, body);

/* THE LENS: one bias bundle, written and adopted through the real doors, then revised. */
const FMs = (id, state, text, note) => ["---",
  `id: ${id}`, "object_type: bias", "schema: bias@1", `title: "House lens"`, `current_state: ${state}`,
  "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: human", "  capability_tier: member",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
  "statements:",
  "  - id: s1", '    kind: "scrutiny"', '    subject: "ENT-2026-0007"', `    text: ${JSON.stringify(text)}`,
  '    justification: "The office is a party to several matters this group is examining."',
  "    citations: []", "    locked: false",
  "---", "", "## Statements", "", "The lens this group works under.", "",
  "## Adoption", "", "Adopted at the members' meeting.", "",
  "## What This Does Not Enforce", "",
  "BIO checks that each statement names a registered subject and carries a justification. It does NOT check "
  + "whether a second source was independent of the first.", "",
  "## Session Log", "", "## Review Notes", "", note].join("\n");
const BIAS = "BIAS-2026-0207-house-lens";
let BIAS_SHA = null;
const writeBias = async (state, text, note = "") => {
  const md = FMs(BIAS, state, text, note);
  const r = await POST(`op=promote&${RUTH}`, { bundleId: BIAS, base: BIAS_SHA,
    snapKey: `20260924T16${String(++seq).padStart(4, "0")}Z_bias`,
    meta: { object_type: "bias", group: "believe-in-oakland", current_state: state,
            created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
  if (r?.bundleSha) BIAS_SHA = r.bundleSha;
  return r;
};
const lensNow = async () => GET(`op=biasmanifest&${RUTH}&scope=instance`);
const handed = (m) => JSON.stringify({ scope: "instance", scope_id: "", statements_sha: m.statements_sha,
  bundles: (m.bundles ?? []).map((b) => ({ bundle_id: b.bundle_id, revision: b.revision })) });
const STALE = JSON.stringify({ scope: "instance", scope_id: "", statements_sha: "0".repeat(64), bundles: [] });
const TEXT1 = "Claims from the city attorney's office need a second record.";
const TEXT2 = "Claims from the city attorney's office need TWO independent records.";

/* ---------------------------------------------------------------------------------------------------
   THE GROUND: a lens in force, four runs opened HANDED it, then a revision that moves it. Every run
   below is handed the lens in force at its open, because "a re-run under the CURRENT lens" is a fact
   about what the run was FORMED under and a run handed nothing was formed under nothing.
   --------------------------------------------------------------------------------------------------- */
let L1 = null, L2 = null;
const RES = { run: null }, RERUN = { run: null }, OTHER = { run: null }, NONE = { run: null },
      LENSBACK = { run: null }, PROJ = { run: null };
console.log("\n--- GROUND · a lens in force, five runs opened under it, then a revision that moves it ---");
{
  const w1 = await writeBias("draft", TEXT1);
  const w2 = await writeBias("proposed", TEXT1);
  const ad = await GET(`op=biasadopt&${RUTH}&bundleId=${BIAS}`);
  const w3 = await writeBias("adopted", TEXT1);
  L1 = await lensNow();
  for (const slot of [RES, RERUN, OTHER, NONE, LENSBACK])
    Object.assign(slot, await openAs(ALICE, Q, "inquiry", { biasManifest: handed(L1) }));
  /* ONE RUN OVER THE PROJECT, and it is the only run here PIA cannot see. Every other run is over an
     INQUIRY, which no project gates, so there is no viewer for whom those are invisible — the sight arms
     below would be measuring nothing if they used one. It is handed no manifest, because the sight arms do
     not depend on the hand and the project scope's hash is not the instance scope's. */
  Object.assign(PROJ, await openAs(ALICE, P, "project"));
  t("GROUND 0 (REACH): a lens is adopted and IN FORCE and six runs are open under it — every arm below "
    + "compares something real",
    [w1?.ok, w2?.ok, ad?.ok, w3?.ok, L1?.in_force, typeof L1?.statements_sha,
     [RES, RERUN, OTHER, NONE, LENSBACK, PROJ].map((r) => r.started)],
    [true, true, true, true, true, "string", [true, true, true, true, true, true]]);
  const w4 = await writeBias("adopted", TEXT2);
  L2 = await lensNow();
  const tick = await fire();
  t("GROUND 1 (D-86, UNCHANGED): the revision raises one obligation per run, and every one is OPEN",
    [w4?.ok, L2?.statements_sha !== L1?.statements_sha, [...(tick?.biasdebt?.raised ?? [])].sort(),
     debts(await queue(`token=${ADM}`))],
    [true, true, [RES, RERUN, OTHER, NONE, LENSBACK, PROJ].map((r) => r.run).sort(),
     [RES, RERUN, OTHER, NONE, LENSBACK, PROJ].map((r) => r.run).sort()]);
}

console.log("\n--- ARM S · DISCHARGE (3): A MEMBER'S RESOLVE, WITH A REQUIRED STATED REASON ---");
{
  const noReason = await resolve(ALICE, { run: RES.run });
  const blank = await resolve(ALICE, { run: RES.run, reason: "   \n  " });
  t("ARM S2 (THE ROW'S ACCEPTS-WHEN — A RESOLVE WITHOUT A REASON IS REFUSED BY NAME): both the absent reason "
    + "and a whitespace-only one are refused BIAS_DEBT_NO_REASON, with the code, its C-number and a canned "
    + "translation a surface can render",
    [noReason?.ok, noReason?.code, noReason?.reason, noReason?.check, (noReason?.translation ?? "").length > 60,
     blank?.code],
    [false, "BIAS_DEBT_NO_REASON", "BIAS_DEBT_NO_REASON", "C-26.16", true, "BIAS_DEBT_NO_REASON"]);
  t("ARM S2b (AND NOTHING WAS SETTLED): the obligation the refused act named is still open and still in the queue",
    [(await readDebt(RES.run))?.open, debtOf(await queue(ALICE), RES.run).length], [true, 1]);

  const machine = await resolve(`token=${ADM}`, { run: RES.run, reason: "the daemon says it is fine" });
  t("ARM S3 (A MACHINE MAY NOT, BY SHAPE): an admin CREDENTIAL — no session, so the server stamps `token:admin` "
    + "— is refused MACHINE_CANNOT_RESOLVE before the row is read, and the debt stands",
    [machine?.code, machine?.check, (await readDebt(RES.run))?.open],
    ["BIAS_DEBT_MACHINE_CANNOT_RESOLVE", "C-26.15", true]);

  const REASON = "The lens change narrows which claims need a second record, and this run cited none from "
                + "that office, so nothing it concluded turns on the change.";
  const ok = await resolve(ALICE, { run: RES.run, reason: REASON });
  const read = await readDebt(RES.run);
  const s = (read?.settlements ?? [])[0];
  t("ARM S4 (THE ACT): a member's resolve with a stated reason settles the obligation, ATTRIBUTED and DATED",
    [ok?.ok, ok?.settled?.kind, ok?.settled?.actor, ok?.settled?.reason === REASON,
     typeof ok?.settled?.at === "string" && /^\d{4}-\d{2}-\d{2}T/.test(ok.settled.at)],
    [true, "resolved", "alice", true, true]);
  t("ARM S5 (RECORDED, NEVER CLEARED SILENTLY): op=biasdebt reads it settled, names WHICH act settled it, and "
    + "carries the append-only settlement with the member, the date, the reason and the lens pins it was "
    + "settled over",
    [read?.found, read?.open, read?.settled?.settled, read?.settled?.kind, read?.settled?.kind_state,
     (read?.settlements ?? []).length, s?.kind, s?.actor, s?.reason === REASON,
     s?.lens_then === L1?.statements_sha, s?.lens_now === L2?.statements_sha, read?.truncated],
    [true, false, true, "resolved", "determined", 1, "resolved", "alice", true, true, true, false]);
  t("ARM S6 (IT LEAVES THE LIST): the settled obligation is in nobody's queue, and the five unsettled ones "
    + "are untouched",
    [debtOf(await queue(ALICE), RES.run).length, debts(await queue(ALICE)).length], [0, 5]);

  const again = await resolve(CORA, { run: RES.run, reason: "and I agree with alice" });
  t("ARM S7 (APPENDED, NEVER REPLACED): a second resolve of a settled obligation is refused by name and says "
    + "what settled it — the row is not overwritten",
    [again?.code, again?.check, again?.settled?.kind, (await readDebt(RES.run))?.settlements?.length],
    ["BIAS_DEBT_ALREADY_SETTLED", "C-26.19", "resolved", 1]);

  const unseen = await resolve(PIA, { run: PROJ.run, reason: "I would like this to go away" });
  const absent = await resolve(PIA, { run: "RUN-that-never-existed", reason: "I would like this to go away" });
  t("ARM S8 (HIDDEN AND ABSENT ARE ONE ANSWER): pia cannot read these runs, and her refusal for a real "
    + "obligation is BYTE-IDENTICAL to her refusal for a run that does not exist, but for the run id she "
    + "herself named",
    [unseen?.code, JSON.stringify({ ...unseen, run: null }) === JSON.stringify({ ...absent, run: null }),
     (await readDebt(PROJ.run))?.open],
    ["BIAS_DEBT_NO_SUCH_DEBT", true, true]);
  const pRead = await readDebt(PROJ.run, PIA), pAbsent = await readDebt("RUN-that-never-existed", PIA);
  t("ARM S9 (AND THE READ IS THE SAME ONE ANSWER): op=biasdebt answers pia identically for a real debt she "
    + "cannot see and for a run that never existed, but for the id she named",
    [pRead?.found, JSON.stringify({ ...pRead, run: null }) === JSON.stringify({ ...pAbsent, run: null })],
    [false, true]);
  const noRun = await resolve(ALICE, { reason: "no run named" });
  t("ARM S10 (THE SHAPE REFUSALS ARE ASKED BEFORE THE RECORD IS READ): an act naming no run is refused "
    + "BIAS_DEBT_NO_RUN, and an over-long reason BIAS_DEBT_REASON_TOO_LONG with the bound it broke",
    [noRun?.code, (await resolve(ALICE, { run: RERUN.run, reason: "x".repeat(4001) }))?.code,
     (await resolve(ALICE, { run: RERUN.run, reason: "x".repeat(4001) }))?.limit],
    ["BIAS_DEBT_NO_RUN", "BIAS_DEBT_REASON_TOO_LONG", 4000]);
}

console.log("\n--- ARM H · A SETTLEMENT HOLDS ACROSS SWEEPS, AND ONLY WHILE THE LENS DELTA STANDS ---");
{
  /* A revision that changes no statement moves the lens INPUTS and not the lens: the sweep runs again over
     every run, and the run a member settled must NOT be re-raised. This is the arm the whole `held` branch
     exists for, and without it the resolve would be undone by the next alarm. */
  const w5 = await writeBias("adopted", TEXT2, "\nA note that changes the bytes and no statement.\n");
  const again = await fire();
  t("ARM H1 (HELD): a sweep over an unmoved lens delta finds the settled debt, HOLDS it, and re-raises nothing "
    + "— the member is not asked the same question twice (DEC-69)",
    [w5?.ok, again?.biasdebt?.held, again?.biasdebt?.raised, again?.biasdebt?.restated,
     (await readDebt(RES.run))?.open, debtOf(await queue(ALICE), RES.run).length],
    [true, [RES.run], [], [], false, 0]);
}

console.log("\n--- ARM R · DISCHARGE (2): A RE-RUN UNDER THE CURRENT LENS, CLOSED, NAMING THAT RUN ---");
{
  const rr = await openAs(ALICE, Q, "inquiry", { biasManifest: handed(L2), rerunOf: RERUN.run });
  t("ARM R1 (THE AUTHORED LINK): the re-run opens, and the answer echoes the run it says it re-runs",
    [rr.started, rr.r?.rerun_of], [true, RERUN.run]);
  t("ARM R2 (OPENING IS NOT RUNNING): with the re-run merely OPEN, the obligation is still open — the "
    + "discharge is taken at the close and not at the existence of a row",
    [(await readDebt(RERUN.run))?.open, debtOf(await queue(ALICE), RERUN.run).length], [true, 1]);
  const closed = await closeAs(ALICE, rr.run);
  const read = await readDebt(RERUN.run);
  const s = (read?.settlements ?? [])[0];
  t("ARM R3 (THE ROW'S ACCEPTS-WHEN — A RE-RUN UNDER THE CURRENT LENS CLOSES THE OBLIGATION NAMING THAT RUN): "
    + "the close discharges it, and the close's own answer names the run it settled and the lens it ran under",
    [closed?.terminated, closed?.bias_debt?.re_ran, closed?.bias_debt?.discharged,
     closed?.bias_debt?.lens_ran_under === L2?.statements_sha,
     closed?.bias_debt?.lens_in_force === L2?.statements_sha],
    [true, RERUN.run, true, true, true]);
  t("ARM R4 (CLOSED WITH THE DISCHARGING RUN'S ID AND LENS PINS, so a reader sees WHICH run settled it): "
    + "op=biasdebt reads the settlement, names the discharging run, and carries both pins",
    [read?.open, read?.settled?.kind, s?.kind, s?.by_run, s?.actor, s?.reason,
     s?.lens_then === L1?.statements_sha, s?.lens_now === L2?.statements_sha],
    [false, "rerun", "rerun", rr.run, null, null, true, true]);
  t("ARM R5 (IT LEAVES THE LIST): the discharged obligation is in nobody's queue", 
    [debtOf(await queue(ALICE), RERUN.run).length, debtOf(await queue(`token=${ADM}`), RERUN.run).length], [0, 0]);
}

console.log("\n--- ARM O · A RE-RUN UNDER ANY OTHER LENS DISCHARGES NOTHING ---");
{
  const stale = await openAs(ALICE, Q, "inquiry", { biasManifest: STALE, rerunOf: OTHER.run });
  const closed = await closeAs(ALICE, stale.run);
  t("ARM O1 (THE ROW'S ACCEPTS-WHEN — ONE UNDER ANOTHER LENS LEAVES IT OPEN): a re-run formed under a lens "
    + "that is not the one in force discharges nothing, SAYS SO, and the obligation stands",
    [closed?.terminated, closed?.bias_debt?.discharged, closed?.bias_debt?.outcome,
     closed?.bias_debt?.lens_ran_under === "0".repeat(64), closed?.bias_debt?.lens_in_force === L2?.statements_sha,
     (await readDebt(OTHER.run))?.open, (await readDebt(OTHER.run))?.settlements?.length,
     debtOf(await queue(ALICE), OTHER.run).length],
    [true, false, "other_lens", true, true, true, 0, 1]);

  const none = await openAs(ALICE, Q, "inquiry", { biasManifest: null, rerunOf: NONE.run });
  const closedNone = await closeAs(ALICE, none.run);
  t("ARM O2 (AN EQUALITY THAT COSTS NOTHING IS NOT EVIDENCE): a re-run handed NO lens has no hash to compare, "
    + "so the answer is UNDETERMINED and stated — never two absences read as agreement",
    [closedNone?.bias_debt?.discharged, closedNone?.bias_debt?.outcome, closedNone?.bias_debt?.lens_ran_under,
     /undetermined/.test(closedNone?.bias_debt?.stated ?? ""), (await readDebt(NONE.run))?.open],
    [false, "lens_undetermined", null, true, true]);

  const plain = await openAs(ALICE, Q, "inquiry", { biasManifest: handed(L2) });
  const closedPlain = await closeAs(ALICE, plain.run);
  t("ARM O3 (A RUN THAT NAMES NO RE-RUN IS UNTOUCHED): an ordinary close carries no bias-debt block at all, "
    + "so this item changed nothing for every run that names none",
    [closedPlain?.terminated, "bias_debt" in (closedPlain ?? {})], [true, false]);
}

console.log("\n--- ARM G · THE LINK IS JUDGED AT THE DOOR (C-33.45 to C-33.47) ---");
{
  const self = `RUN-2026-0924-rec207-self`;
  const s = await POST(`op=airunopen&${ALICE}`, { run: self, contextType: "inquiry", contextId: Q,
    principalClaude: "member", skillVersion: "investigative-session@1", rerunOf: self });
  const unknown = await openAs(ALICE, Q, "inquiry", { rerunOf: "RUN-that-never-existed" });
  const hidden = await openAs(ALICE, Q, "inquiry", { rerunOf: RES.run, contextType: "inquiry" });
  const elsewhere = await openAs(ALICE, Q2, "inquiry", { rerunOf: RES.run });
  t("ARM G1 (SELF): a run cannot be the re-run of itself — refused by name, with its C-number and a canned "
    + "translation", [s?.started, s?.code, s?.check, (s?.translation ?? "").length > 60],
    [false, "AI_RUN_RERUN_SELF", "C-33.45", true]);
  t("ARM G2 (UNKNOWN): a link to a run that is not there is refused by name, and the run is NOT opened",
    [unknown.started, unknown.r?.code, unknown.r?.check,
     (await GET(`op=airun&token=${ADM}&run=${E(unknown.run)}`))?.found],
    [false, "AI_RUN_RERUN_UNKNOWN", "C-33.46", false]);
  t("ARM G3 (ANOTHER CONTEXT): a link to a run in a different question is refused by name — the lens a debt "
    + "is owed against is the INDEBTED run's context's",
    [elsewhere.started, elsewhere.r?.code, elsewhere.r?.check],
    [false, "AI_RUN_RERUN_OTHER_CONTEXT", "C-33.47"]);
  t("ARM G4 (OVER-STRICTNESS): a link to a real run in the SAME context is accepted — the three refusals "
    + "above are the link being judged, not the field being refused",
    [hidden.started, hidden.r?.rerun_of], [true, RES.run]);
  /* THE SIGHT PAIR, and it is the same request twice. Both open over the INQUIRY and name the run over
     the PROJECT; the only difference is who is asking. Alice is joined and is told the truth — the run is
     real and is somewhere else. Pia is not, and is told exactly what she would be told about a run that
     does not exist. Offering to re-run something is not a way to establish that it exists. */
  const piaSees = await POST(`op=airunopen&${PIA}`, { run: "RUN-2026-0924-rec207-pia", contextType: "inquiry",
    contextId: Q, principalClaude: "member", skillVersion: "investigative-session@1", rerunOf: PROJ.run });
  const aliceSees = await POST(`op=airunopen&${ALICE}`, { run: "RUN-2026-0924-rec207-as", contextType: "inquiry",
    contextId: Q, principalClaude: "member", skillVersion: "investigative-session@1", rerunOf: PROJ.run });
  t("ARM G5 (UNSEEN ANSWERS AS ABSENT, and the PAIR is what makes it evidence): the identical request is "
    + "answered OTHER_CONTEXT for the member who can see the named run and UNKNOWN for the member who "
    + "cannot — so the first answer is sight, not spelling",
    [aliceSees?.started, aliceSees?.code, piaSees?.started, piaSees?.code],
    [false, "AI_RUN_RERUN_OTHER_CONTEXT", false, "AI_RUN_RERUN_UNKNOWN"]);
}

console.log("\n--- ARM C · THE CATALOGUE: every code this item mints has a row, a C-number and a translation ---");
{
  /* READ FROM THE CATALOGUE THE ARMED COPY CARRIES, not from the repository's, so the control driver's
     patched trees are graded on their own catalogue and this arm cannot be satisfied by a file the run
     never used. */
  const CAT = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));
  const rows = [
    ["BIAS_DEBT_NO_RUN", "C-26.13", CAT.BIAS_CHECKS], ["BIAS_DEBT_NO_ACTOR", "C-26.14", CAT.BIAS_CHECKS],
    ["BIAS_DEBT_MACHINE_CANNOT_RESOLVE", "C-26.15", CAT.BIAS_CHECKS],
    ["BIAS_DEBT_NO_REASON", "C-26.16", CAT.BIAS_CHECKS],
    ["BIAS_DEBT_REASON_TOO_LONG", "C-26.17", CAT.BIAS_CHECKS],
    ["BIAS_DEBT_NO_SUCH_DEBT", "C-26.18", CAT.BIAS_CHECKS],
    ["BIAS_DEBT_ALREADY_SETTLED", "C-26.19", CAT.BIAS_CHECKS],
    ["AI_RUN_RERUN_SELF", "C-33.45", CAT.ACT_SHAPE_CHECKS],
    ["AI_RUN_RERUN_UNKNOWN", "C-33.46", CAT.ACT_SHAPE_CHECKS],
    ["AI_RUN_RERUN_OTHER_CONTEXT", "C-33.47", CAT.ACT_SHAPE_CHECKS],
  ];
  t("ARM C1 (TEN CODES, TEN ROWS): every refusal this item mints carries its declared C-number, a `where` "
    + "naming where it fires, and a canned translation a surface can render instead of the machine word",
    rows.map(([code, num, fam]) => [code, fam[code]?.check === num, !!fam[code]?.where,
                                    (fam[code]?.translation ?? "").length > 60]),
    rows.map(([code]) => [code, true, true, true]));
  t("ARM C2 (NO TRANSLATION IS A COPY OF ANOTHER'S): ten distinct sentences, because a translation shared "
    + "between two codes tells a member the same thing about two different conditions",
    new Set(rows.map(([code, , fam]) => fam[code]?.translation)).size, 10);
  /* WHAT IS DRIVEN AND WHAT IS NOT, STATED. Nine of the ten are refused through the op somewhere above.
     "BIAS_DEBT_NO_ACTOR" is NOT, and cannot be from outside: `index.mjs` stamps `actor` onto the body of
     every `op=biasdebtresolve` — a member's id from the session, `token:<class>` otherwise — so no caller
     can present the store with an act naming nobody. It is the STORE's own fence for a caller that reaches
     `biasDebtResolve` by another road, it is pinned here by name, and calling it driven would be the claim
     this record must not make. */
  t("ARM C3 (THE UNDRIVEN ONE, NAMED): BIAS_DEBT_NO_ACTOR is unreachable through the control plane, and the "
    + "evidence is that a member's call reaches the SUBJECT refusals instead — it got past the actor checks, "
    + "so an actor was stamped. The code is pinned here by name and STATED rather than counted as driven",
    [CAT.BIAS_CHECKS.BIAS_DEBT_NO_ACTOR.check,
     (await resolve(ALICE, { run: RES.run, reason: "a member on this call always has a name" }))?.code,
     (await readDebt(RES.run))?.settlements?.length],
    ["C-26.14", "BIAS_DEBT_ALREADY_SETTLED", 1]);
}

console.log("\n--- ARM L · THE LENS MOVING BACK IS STILL A DISCHARGE, AND NOW IT IS RECORDED ---");
{
  const w6 = await writeBias("adopted", TEXT1);
  const L3 = await lensNow();
  const tick = await fire();
  const read = await readDebt(LENSBACK.run);
  const s = (read?.settlements ?? [])[0];
  t("ARM L1 (THE THIRD ACT, UNCHANGED IN EFFECT AND NO LONGER SILENT): back at the lens the runs opened under, "
    + "the sweep clears the outstanding obligation — and now writes WHAT settled it, with no actor and no "
    + "reason, because a sweep is not a person",
    [w6?.ok, L3?.statements_sha === L1?.statements_sha, (tick?.biasdebt?.cleared ?? []).includes(LENSBACK.run),
     read?.open, read?.settled?.kind, s?.kind, s?.actor, s?.reason, s?.by_run],
    [true, true, true, false, "lens_returned", "lens_returned", null, null, null]);
  t("ARM L2 (AND THE TWO ALREADY SETTLED STAY SETTLED, each still naming its OWN act): the member's resolve "
    + "and the re-run's discharge are not overwritten by the lens returning",
    [(await readDebt(RES.run))?.settled?.kind, (await readDebt(RERUN.run))?.settled?.kind,
     (await readDebt(RES.run))?.settlements?.length, (await readDebt(RERUN.run))?.settlements?.length],
    ["resolved", "rerun", 1, 1]);
}

console.log("\n--- ARM N · NEW DEBT IS STILL NEW DEBT: the lens moving ONWARDS re-raises a settled obligation ---");
{
  const w7 = await writeBias("adopted", "Claims from that office need a second record and a date.");
  const L4 = await lensNow();
  const tick = await fire();
  const read = await readDebt(RES.run);
  t("ARM N1 (THE HOLD IS OVER THE DELTA, NOT FOREVER): a lens that moves to a NEW sha raises the settled "
    + "obligations again as NEW debt — the member answered one change, not every future one — and the "
    + "append-only settlement of the old one is still on record",
    [w7?.ok, L4?.statements_sha !== L1?.statements_sha, (tick?.biasdebt?.restated ?? []).includes(RES.run),
     read?.open, read?.settled?.settled, (read?.settlements ?? []).length, read?.settlements?.[0]?.kind],
    [true, true, true, true, false, 1, "resolved"]);
  t("ARM N2 (AND IT IS BACK IN THE LIST): the re-raised obligation is offered to its recipients again",
    debtOf(await queue(ALICE), RES.run).length, 1);
}

console.log("\n--- ARM Q · THE QUEUE NAMES THE DOOR THIS ITEM CAN ACTUALLY GO THROUGH ---");
{
  const it = debtOf(await queue(ALICE), RES.run)[0];
  const others = ITEMS(await queue(ALICE)).filter((i) => i && i.class === "OBLIGATION" && i.kind !== "bias-debt");
  t("ARM Q1 (THE ROW'S HEADLINE): a bias-debt OBLIGATION is still not DISPOSED of, and the act it names "
    + "instead is op=biasdebtresolve — not op=taskresolve, which addresses tasks and not runs",
    [it?.class, it?.disposition?.available, it?.disposition?.instead,
     /op=biasdebtresolve/.test(it?.disposition?.detail ?? "")],
    ["OBLIGATION", false, "biasdebtresolve", true]);
  /* A SURPRISING GREEN IS A FINDING ABOUT THE ARM. This corpus is EMPTY in this fixture — no other
     OBLIGATION kind has a producer that fires here — so the arm below proves nothing about the
     `taskresolve` branch and its size is asserted so a reader can see that rather than infer a pass.
     What DOES hold the branch is the source itself: `#dispositionOf` chooses on `item.kind`, and Q1
     drives the only kind this item changed. Stated rather than smoothed. */
  t("ARM Q2 (THE CORPUS, PRINTED): no other OBLIGATION kind is in this fixture's queue, so this arm is "
    + "VACUOUS and says so — the taskresolve branch is unmeasured HERE",
    [others.length, others.map((i) => i.disposition?.instead)], [0, []]);
}

console.log("\n--- ARM P · THE WHOLE-STORE PURGE takes every settlement with the debts it explains ---");
{
  await POST(`op=purge&token=${ADM}&confirm=bio`, {});
  t("ARM P1: after a whole-store purge no debt and no settlement is on record",
    [(await readDebt(RES.run))?.found, debts(await queue(`token=${ADM}`)).length], [false, 0]);
}

} finally {
  await mf.dispose();
}

console.log(`\nrec207-bias-debt-settle: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
