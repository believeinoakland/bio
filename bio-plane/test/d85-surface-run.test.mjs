/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d85-surface-run.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/d85-surface-run.control.mjs [arm]`. RESULTS, RUN 2026-09-23 by the D-85 worker (CONDUCT #14's, cloud) on f05c1efd + this item (real src/index.mjs 711,476 B sha256 3e29b9eabc5e…, src/store.mjs 2,831,568 B 6a14a6c063e9…, src/airun.mjs 139,535 B fdef7964b6f0…, checks/bio-checks.mjs 825,591 B 4e4487b043e0…, untouched: YES), ALL SIXTEEN ARMS AS DECLARED (five declarations corrected at the first run, the ARMS right: a refusal that becomes a landing also SPENDS alice's bound, so L1/L7 and M3 move with it; `stamp-not-deleted` leaves M2 green because the forged session is refused): baseline 47/0 · **drop-run-check — THE ROW'S CONTROL, `promote`'s call of the gate disarmed -> 27/20: ARM O1 (THE OUTSIDE-A-RUN ARM, BY NAME), O2, O3, R1-R5, F1, F2, U0-U2, S1, S2, B1, B3, M3, L1, L7** · no-sight -> 46/1: U1 · no-principal -> 35/12 · gate-credential-runs-only (THE LIAR, position asked only of a credential's run) -> 36/11: R1 R3 (a SESSION's run) by name, R2 green · exact-match (a fence tighter than the rule) -> 33/14: L1 first · no-status -> 46/1: S1 · no-bound-required -> 46/1: B1 · no-bound-cap -> 45/2: B3 M3 · no-stamp -> 17/30 · stamp-not-deleted -> 46/1: M1 · no-link-row -> 41/6: L4 L5 N3 P1 T6 W1 · hand-by-now (THE RULE-3 LIAR, stale judged against the lens NOW) -> 45/2: T4 T5 · moved-by-hand (the pre-item `moved`) -> 45/2: T2 T6 · no-lens-at-open -> 40/7 · sight-by-row (over-strictness) -> 47/0. BEFORE THIS ITEM (the suite run against f05c1efd's src/ with this item's checks/): 8 pass, 39 fail — alice's credential created questions naming no run, under cora's run and under an ended one, all landing with no link and no bound; a run handed a stale lens could not be told from one whose lens moved. D-637 (2026-09-25, on 11818309 + this item): no-lens-at-open's anchor had drifted to 0 matches (REC-207 appended `rerun_of` after the lens), so it did not arm; re-anchored on `...state), lensAtOpen,` (1 match here and on origin/main 95fe7bc7) -> run alone 40/7 AS DECLARED: L4 T1 T2 T3 T4 T5 T6 by name; store.mjs 3,471,769 B d9b8fcd7153f untouched: YES.
 * =========================================================================
 * D-85 — AN ASSISTANT OPENS A QUESTION ONLY INSIDE A RUN IT HOLDS, AND A RUN KEEPS THE LENS IN FORCE AT ITS OPEN.
 *
 * `INVESTIGATIVE-SESSION.md` §11 item 5, rules 2 and 3 (BOB #25, 2026-09-21), with §3 (the run
 * carries the lens). RULE 2: an `ai` credential's creation of an inquiry names a RUNNING run whose PRINCIPAL it is;
 * the plane records the link in an instance row keyed by the new inquiry — never a line in its signed bytes — and
 * counts it against a declared `surfaces` bound, refused when none is declared (the `mints` bound's rule); the
 * inquiry's read states its run and that run's lens block, and an inquiry surfaced before the rule states `not
 * recorded`. RULE 3: `aiRunOpen` also records the effective set's `statements_sha` for the run's context, computed by
 * the plane at that instant, and the run's read tells `moved` (the lens changed after the open) from a stale hand
 * (the run was handed a lens other than the one in force).
 *
 * WHAT WAS WRONG, measured on the unedited tree (`f05c1efd`): an `ai` credential holding `promote` created an inquiry
 * naming no run at all — no link, no lens, no bound — and `aiRunOpen` stored only the manifest it was handed, so a
 * run handed a stale lens read `moved: true` exactly as a run whose lens changed after it opened.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: (1) fence ONE caller kind — every refusal and
 * landing is driven from an `ai` credential against a run its member's SESSION opened AND one the credential itself
 * opened, and the member's own session runs every arm and must stay UNTOUCHED; (2) decide `stale` by comparing the
 * hand with the lens NOW rather than the lens AT THE OPEN — ARM T2 hands a stale lens while nothing moves, and ARM T5
 * moves the lens under a correct hand; the two must read differently, and only a recorded open can tell them apart.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, one store; (ii) no surface — it asserts what the plane SENDS;
 * (iii) a run opened BEFORE this item (its `lens_at_open` is NULL): no op can write one, so the `not recorded` branch
 * of the RUN's lens (and its `unreadable` twin) is NOT asserted here — the QUESTION's `not recorded` is driven (ARM N); (iv) an
 * organisation-kind `ai` key (REC-152's suite covers that branch of `runPrincipalOf`); (v) token classes other than
 * `ai` (admin, member, probe tokens) — NOT driven here. CORRECTED 2026-09-23 by REC-171: this line read "they are not
 * the assistant the rule names and are untouched", which BOB #30 ruled wrong (the rule binds every creation D-78 stamps
 * `agent`); they are now bound, and `rec171-surface-token.test.mjs` drives each of them.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed COPY of the sources. */
const SRC_DIR = process.env.D85_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { AI_RUN_CHECKS, SURFACE_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-d85", MEM = "mem-d85";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
});

try {

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, type: res.headers.get("content-type"), body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const GET = async (q) => parse(await RAW(q));
const E = encodeURIComponent;

const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return "token=" + lg.token;
};

/* 4.2/4.3: two administrators before any member. RUTH owns the project and authors the lens. */
const RUTH  = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
await member("gus", ["contribute"], "admin");
/* ALICE opens every run below: she is the PRINCIPAL. CORA is her JOINED co-participant. PIA is in no project. */
const ALICE = await member("alice", ["contribute"]);
const CORA  = await member("cora", ["contribute"]);
const PIA   = await member("pia",  ["contribute"]);

const NOW = "2026-09-23T00:00:00Z", LATER = "2026-09-23T01:00:00Z";
const inquiryMd = (id, surfacedBy = "agent") => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", `surfaced_by: ${surfacedBy}`, 'disposition_reason: ""',
  "---", "", "## Question", "", `Did ${id} happen?`, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
const projectMd = () => ["---", "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references: []",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");
let seq = 0;
const bundle = (id, type, extra = {}) => {
  const md = type === "project" ? projectMd() : inquiryMd(id);
  return {
    ...(type === "project" ? {} : { bundleId: id }), base: null,
    snapKey: `20260923T1300${String(++seq).padStart(2, "0")}Z_dd85aa11`,
    meta: { object_type: type, group: "believe-in-oakland", title: `title for ${id}`,
            current_state: type === "project" ? "forming" : "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [], ...extra,
  };
};

const Q = "INQ-2026-9185-question";   // a question every member can read, created by a MEMBER before any run
let P = null;
console.log("\n--- FIXTURE: one project (alice and cora joined, pia not), one readable question ---");
{
  const p = await POST(`op=promote&${RUTH}`, bundle("d85 project", "project"));
  P = p?.bundleId;
  const q = await POST(`op=promote&${RUTH}`, bundle(Q, "inquiry"));
  t("FIXTURE: the project and the question are promoted", [p?.ok, !!P, q?.ok], [true, true, true]);
  const inv = [];
  for (const h of ["alice", "cora"])
    inv.push((await POST(`op=projectinvite&${RUTH}&projectId=${E(P)}&handle=${h}`))?.ok);
  const joined = [(await POST(`op=projectjoin&${ALICE}&projectId=${E(P)}`))?.state,
                  (await POST(`op=projectjoin&${CORA}&projectId=${E(P)}`))?.state];
  t("FIXTURE: alice and cora are JOINED participants of the project; pia was never invited",
    [inv, joined], [[true, true], ["joined", "joined"]]);
}

/* THE CREDENTIALS: each member mints an `ai` credential whose principal is herself, declaring `promote` (the door a
   question is created through) and the run verbs. */
const mint = async (tok, tokenId) => POST(`op=aicredentialmint&${tok}`,
  { tokenId, principalKind: "member", taskScope: "investigative",
    writes: ["airunopen", "airuntick", "airunclose", "promote"],
    note: "D-85: opens questions under its member's runs" });
const ak = await mint(ALICE, "alice-agent"), ck = await mint(CORA, "cora-agent"), pk = await mint(PIA, "pia-agent");
const AK = ak?.token ? `token=${ak.token}` : null, CK = ck?.token ? `token=${ck.token}` : null;
const PK = pk?.token ? `token=${pk.token}` : null;
t("FIXTURE: alice, cora and pia each mint an `ai` credential whose principal is themselves",
  [ak?.credential?.principal, ck?.credential?.principal, pk?.credential?.principal, !!AK, !!CK, !!PK],
  ["member:alice", "member:cora", "member:pia", true, true, true]);

let runSeq = 0;
const openAs = async (tok, contextId, contextType, { surfaces = 3, biasManifest = undefined } = {}) => {
  const run = `RUN-2026-0923-d85-${++runSeq}`;
  const bounds = [{ bound: "fetches", allowed: 50, unit: "requests" }];
  if (surfaces != null) bounds.push({ bound: "surfaces", allowed: surfaces, unit: "questions" });
  const r = await POST(`op=airunopen&${tok}`, {
    run, contextType, contextId, label: "D-85 run", mode: "check",
    principalClaude: "member", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", bounds, leaseMs: 600000,
    ...(biasManifest === undefined ? {} : { biasManifest }) });
  return { run, r };
};
const readRun = async (run) => parse(await RAW(`op=airun&token=${ADM}&run=${E(run)}`))?.session ?? null;
const surfacesOf = async (run) => {
  const b = ((await readRun(run))?.budget ?? []).find((x) => x.bound === "surfaces");
  return b ? [b.allowed, b.consumed] : null;
};
const projection = async (id, tok = RUTH) => GET(`op=projection&${tok}&id=${E(id)}`);
const stats = async () => GET(`op=stats&token=${ADM}`);

let inqSeq = 0;
const freshId = () => `INQ-2026-9185-surfaced-${++inqSeq}`;
/* THE ONE CREATOR. Every creation names a FRESH id unless an arm names one. */
const create = (tok, run, extra = {}, id = freshId()) => RAW(`op=promote&${tok}`,
  bundle(id, "inquiry", { ...(run === undefined ? {} : { run }), ...extra }));

const QRUN = await openAs(ALICE, Q, "inquiry");                     // alice's SESSION's run over the question
const KRUN = await openAs(AK, Q, "inquiry");                        // a run alice's CREDENTIAL opened
const PRUN = await openAs(ALICE, P, "project");                     // alice's run over the project pia cannot see
const NRUN = await openAs(ALICE, Q, "inquiry", { surfaces: null }); // alice's run that declares NO surfaces bound
const BRUN = await openAs(ALICE, Q, "inquiry", { surfaces: 1 });    // alice's run allowed ONE question
const CRUN = await openAs(CORA, Q, "inquiry");                      // cora's run
t("REACH: the six runs are really running and the plane STAMPED each principal — every refusal below would pass "
  + "vacuously over a run that never started",
  [QRUN.r?.started, KRUN.r?.started, PRUN.r?.started, NRUN.r?.started, BRUN.r?.started, CRUN.r?.started,
   (await readRun(QRUN.run))?.principal?.plane, (await readRun(KRUN.run))?.principal?.plane,
   await surfacesOf(QRUN.run), await surfacesOf(NRUN.run)],
  [true, true, true, true, true, true, "member:alice", "member:alice/alice-agent", [3, 0], null]);

const NP = AI_RUN_CHECKS.AI_RUN_NOT_PRINCIPAL;
const S = SURFACE_CHECKS;
const refusedAs = (a) => [a?.ok, a?.code, a?.check, a?.translation];
const WANT = (code) => [false, code, (code === "AI_RUN_NOT_PRINCIPAL" ? NP : S[code])?.check,
                        (code === "AI_RUN_NOT_PRINCIPAL" ? NP : S[code])?.translation];
const exists = async (id) => !!(await projection(id, RUTH))?.bundle_id;

console.log("\n--- ARM O · OUTSIDE A RUN: an assistant's question naming no run is refused by name, and nothing lands ---");
{
  const before = (await stats())?.inquiryRunSurfacings;
  const id1 = freshId(), id2 = freshId();
  const o1 = parse(await create(AK, undefined, {}, id1));
  const o2 = parse(await create(AK, "RUN-2026-0923-never-minted", {}, id2));
  t("ARM O1 (OUTSIDE A RUN): alice's credential creating a question naming no run is refused SURFACE_NO_RUN, "
    + "C-66.1, with the catalogue's translation", refusedAs(o1), WANT("SURFACE_NO_RUN"));
  t("ARM O2: and one naming a run nobody minted is refused the same way", refusedAs(o2), WANT("SURFACE_NO_RUN"));
  t("ARM O3 (NOTHING LANDED): neither question exists and no link was written",
    [await exists(id1), await exists(id2), (await stats())?.inquiryRunSurfacings], [false, false, before]);
}

console.log("\n--- ARM R · ANOTHER PRINCIPAL'S RUN: refused from the credential, whichever kind of run it is ---");
{
  const before = [await surfacesOf(QRUN.run), await surfacesOf(KRUN.run), await surfacesOf(CRUN.run)];
  const ids = [freshId(), freshId(), freshId()];
  const r1 = parse(await create(CK, QRUN.run, {}, ids[0]));
  const r2 = parse(await create(CK, KRUN.run, {}, ids[1]));
  const r3 = parse(await create(AK, CRUN.run, {}, ids[2]));
  t("ARM R1 (THE OTHER PRINCIPAL, a SESSION's run): cora's credential cannot open a question under the run "
    + "alice's session opened — AI_RUN_NOT_PRINCIPAL, C-22.12", refusedAs(r1), WANT("AI_RUN_NOT_PRINCIPAL"));
  t("ARM R2 (THE OTHER PRINCIPAL, a CREDENTIAL's run): nor under the run alice's credential opened",
    refusedAs(r2), WANT("AI_RUN_NOT_PRINCIPAL"));
  t("ARM R3: nor alice's credential under cora's run", refusedAs(r3), WANT("AI_RUN_NOT_PRINCIPAL"));
  t("ARM R4: the detail names the ACT refused", /^opening a question under a run is its principal's act/
    .test(r1?.detail ?? ""), true);
  t("ARM R5 (NOTHING LANDED, NOTHING SPENT): no question exists and no run's bound moved",
    [await exists(ids[0]), await exists(ids[1]), await exists(ids[2]),
     await surfacesOf(QRUN.run), await surfacesOf(KRUN.run), await surfacesOf(CRUN.run)],
    [false, false, false, ...before]);
}

console.log("\n--- ARM F · THE FORGED STAMP: a principal SENT in the body is never believed ---");
{
  const id = freshId();
  const f1 = parse(await create(AK, CRUN.run, { assistantPrincipal: "member:cora/cora-agent" }, id));
  t("ARM F1: alice's credential sending cora's credential as `assistantPrincipal` under cora's run is still "
    + "refused — the control plane overwrites the field", refusedAs(f1), WANT("AI_RUN_NOT_PRINCIPAL"));
  t("ARM F2: and nothing landed", await exists(id), false);
}

console.log("\n--- ARM U · SIGHT: a run over a context the caller cannot see answers as a run never minted ---");
{
  const NEVER = "RUN-2026-0923-never-minted";
  const norm = (r, run) => ({ status: r.status, type: r.type, body: r.body.split(run).join("<RUN>") });
  const id = "INQ-2026-9185-pia-question";
  const uN = await create(PK, NEVER, {}, id);
  t("ARM U0 (REACH): pia's credential under a never-minted run is refused for the RUN",
    parse(uN)?.code, "SURFACE_NO_RUN");
  const uU = await create(PK, PRUN.run, {}, id);
  t("ARM U1 (SIGHT): under alice's run over the project pia cannot see, the answer is BYTE-IDENTICAL to a "
    + "never-minted run's (the id sent is the only difference)", norm(uU, PRUN.run), norm(uN, NEVER));
  const cU = parse(await create(CK, PRUN.run));
  t("ARM U2 (SIGHT IS NOT POSITION): cora's credential, whose member CAN see the project, is told the run is "
    + "not hers", cU?.code, "AI_RUN_NOT_PRINCIPAL");
}

console.log("\n--- ARM S · STATUS: the caller's own ENDED run is refused, and position is asked before status ---");
{
  const ended = await openAs(ALICE, Q, "inquiry");
  const closed = parse(await RAW(`op=airunclose&${ALICE}`, { run: ended.run, bound: "completed" }));
  t("ARM S0 (REACH): alice's run is opened and then ENDED by her", [ended.r?.started, closed?.terminated], [true, true]);
  const s1 = parse(await create(AK, ended.run));
  t("ARM S1: alice's credential cannot open a question under her ENDED run — SURFACE_RUN_NOT_RUNNING, C-66.2",
    refusedAs(s1), WANT("SURFACE_RUN_NOT_RUNNING"));
  const s2 = parse(await create(CK, ended.run));
  t("ARM S2 (ORDER): cora's credential under alice's ENDED run is told it is not hers, never its status",
    s2?.code, "AI_RUN_NOT_PRINCIPAL");
}

console.log("\n--- ARM B · THE BOUND: none declared is refused; past the bound is refused; reaching it ends the run ---");
{
  const b0 = parse(await create(AK, NRUN.run));
  t("ARM B1 (NO BOUND): under alice's run that declares no `surfaces` bound — SURFACE_NO_BOUND, C-66.3",
    refusedAs(b0), WANT("SURFACE_NO_BOUND"));
  const idA = freshId(), idB = freshId();
  const first = parse(await create(AK, BRUN.run, {}, idA));
  t("ARM B2 (REACH): the first question under a run allowed ONE lands and spends the bound",
    [first?.ok, first?.surfaced_in?.bound, await surfacesOf(BRUN.run)],
    [true, { bound: "surfaces", allowed: 1, consumed: 1 }, [1, 1]]);
  const second = parse(await create(AK, BRUN.run, {}, idB));
  t("ARM B3 (PAST THE BOUND): the second is refused SURFACE_BOUND_REACHED, C-66.4, and nothing landed or was spent",
    [...refusedAs(second), await exists(idB), await surfacesOf(BRUN.run)],
    [...WANT("SURFACE_BOUND_REACHED"), false, [1, 1]]);
  const tk = parse(await RAW(`op=airuntick&${ALICE}`, { run: BRUN.run }));
  const after = await readRun(BRUN.run);
  t("ARM B4 (THE BOUND ENDS THE RUN): alice's next tick ends it, and the run says the `surfaces` bound stopped it",
    [!!tk, after?.status, after?.condition?.bound], [true, "stopped", "surfaces"]);
}

console.log("\n--- ARM L · INSIDE THE CALLER'S OWN RUN: it lands with its row, naming the run, from both kinds of run ---");
const LANDED = [];
{
  const idQ = freshId(), idK = freshId(), idP = freshId();
  const l1 = parse(await create(AK, QRUN.run, {}, idQ));
  const l2 = parse(await create(AK, KRUN.run, {}, idK));
  const l3 = parse(await create(AK, PRUN.run, {}, idP));
  LANDED.push(idQ, idK, idP);
  t("ARM L1 (A SESSION's RUN): alice's credential opens a question under the run her SESSION opened — one "
    + "principal — and the answer names the run and its bound", [l1?.ok, l1?.surfaced_in?.run, l1?.surfaced_in?.bound],
    [true, QRUN.run, { bound: "surfaces", allowed: 3, consumed: 1 }]);
  t("ARM L2 (A CREDENTIAL's RUN): and under the run the credential itself opened", [l2?.ok, l2?.surfaced_in?.run],
    [true, KRUN.run]);
  t("ARM L3 (A PROJECT RUN): and under her run over the project", [l3?.ok, l3?.surfaced_in?.run], [true, PRUN.run]);
  const p1 = await projection(idQ, AK);
  t("ARM L4 (THE ROW, READ BACK): op=projection states the run the question was opened inside, WHO opened it (the "
    + "credential's stamp), the run's context, and the run's lens block",
    [p1?.surfaced_in?.recorded, p1?.surfaced_in?.run, p1?.surfaced_in?.by, p1?.surfaced_in?.context,
     typeof p1?.surfaced_in?.lens, p1?.surfaced_in?.lens?.at_open?.recorded, p1?.surfaced_in?.lens?.moved],
    [true, QRUN.run, "member:alice/alice-agent", { type: "inquiry", id: Q }, "object", true, false]);
  t("ARM L5 (ONE READER): the question's lens block IS the run's `bias` block from op=airun, not a second copy",
    JSON.stringify(p1?.surfaced_in?.lens), JSON.stringify((await readRun(QRUN.run))?.bias));
  const md = parse(await RAW(`op=file&${RUTH}&id=${E(idQ)}&path=bundle.md`));
  const text = typeof md === "string" ? md : (md?.text ?? md?.content ?? JSON.stringify(md));
  t("ARM L6 (NEVER IN THE SIGNED BYTES): the question's bundle.md names no run — the link is an instance row",
    [typeof text === "string" && text.includes("Question"), text.includes(QRUN.run), /surfaced_by: agent/.test(text)],
    [true, false, true]);
  t("ARM L7 (COUNTED): each landing spent one of its own run's `surfaces`",
    [await surfacesOf(QRUN.run), await surfacesOf(KRUN.run), await surfacesOf(PRUN.run)], [[3, 1], [3, 1], [3, 1]]);
}

console.log("\n--- ARM M · A MEMBER's OWN QUESTION IS UNTOUCHED, through every arm the assistant is refused at ---");
{
  const before = (await stats())?.inquiryRunSurfacings;
  const ids = [freshId(), freshId(), freshId(), freshId(), freshId(), freshId()];
  const m = [
    parse(await create(ALICE, undefined, {}, ids[0])),                                       // outside any run
    parse(await create(ALICE, CRUN.run, {}, ids[1])),                                        // another principal's run
    parse(await create(ALICE, NRUN.run, {}, ids[2])),                                        // a run with no bound
    parse(await create(ALICE, BRUN.run, {}, ids[3])),                                        // a run past its bound
    parse(await create(ALICE, "RUN-2026-0923-never-minted", {}, ids[4])),                    // a run nobody minted
    parse(await create(ALICE, undefined, { assistantPrincipal: "member:alice/alice-agent" }, ids[5])), // a forged stamp
  ];
  t("ARM M1: alice's SESSION creates a question in each of those six shapes, and every one lands, as before",
    m.map((x) => [x?.ok, x?.code ?? null]), ids.map(() => [true, null]));
  t("ARM M2: none carries `surfaced_in` and no link was written — a member's creation is not asked",
    [m.map((x) => "surfaced_in" in (x ?? {})), (await stats())?.inquiryRunSurfacings],
    [ids.map(() => false), before]);
  t("ARM M3: no run's bound moved", [await surfacesOf(CRUN.run), await surfacesOf(BRUN.run)], [[3, 0], [1, 1]]);
}

console.log("\n--- ARM N · NOT RECORDED: a question no run is recorded for says so, never a guess ---");
{
  const q = await projection(Q, RUTH);
  t("ARM N1: the fixture's question (a member's, made before any run) reads `not recorded`",
    q?.surfaced_in, { recorded: false, stated: "not recorded", run: null, lens: null });
  const v = await projection(LANDED[2], PIA);
  const proj = await projection(P, RUTH);
  const list = (await GET(`op=projection&${RUTH}&limit=5`))?.bundles ?? [];
  t("ARM N2: a non-inquiry reads null, and the list arm carries no derived read",
    [proj && "surfaced_in" in proj, proj?.surfaced_in, list.length > 0, list.some((b) => "surfaced_in" in b)],
    [true, null, true, false]);
  t("ARM N3 (SIGHT): pia can read the question (a question is instance-visible) but not the run's context — the run "
    + "is withheld and the answer says one IS recorded", [v?.surfaced_in?.recorded, v?.surfaced_in?.run, v?.surfaced_in?.lens],
    [true, null, null]);
}

console.log("\n--- ARM P · PURGE: the link clears in BOTH arms (D-113) ---");
{
  const s0 = (await stats())?.inquiryRunSurfacings;
  const id = LANDED[0];
  const p1 = await POST(`op=purge&token=${ADM}&confirm=bio&bundleId=${E(id)}`, {});
  const s1 = (await stats())?.inquiryRunSurfacings;
  t("ARM P1 (PER-BUNDLE): purging an assistant's question takes its link with it", [!!p1, s0 - s1], [true, 1]);
  const again = parse(await create(ALICE, undefined, {}, id));
  t("ARM P2: a MEMBER's question later created under the same id does not inherit the purged link",
    [again?.ok, (await projection(id, RUTH))?.surfaced_in?.recorded], [true, false]);
}

/* ======================= RULE 3 — THE LENS IN FORCE AT THE OPEN ======================= */
const FMs = (id, state, text) => ["---",
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
  "## Session Log", "", "## Review Notes", ""].join("\n");
const BIAS = "BIAS-2026-0185-house-lens";
let BIAS_SHA = null;
const writeBias = async (state, text) => {
  const md = FMs(BIAS, state, text);
  const r = await POST(`op=promote&${RUTH}`, { bundleId: BIAS, base: BIAS_SHA, snapKey: `20260923T14${String(++seq).padStart(4, "0")}Z_bias`,
    meta: { object_type: "bias", group: "believe-in-oakland", title: "House lens", current_state: state,
            created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
  if (r?.bundleSha) BIAS_SHA = r.bundleSha;
  return r;
};
const lensNow = async () => GET(`op=biasmanifest&${RUTH}&scope=instance`);
const handed = (m) => JSON.stringify({ scope: "instance", scope_id: "", statements_sha: m.statements_sha,
  bundles: (m.bundles ?? []).map((b) => ({ bundle_id: b.bundle_id, revision: b.revision })) });

console.log("\n--- ARM T · RULE 3: the run records the lens in force at its open, and tells `moved` from a stale hand ---");
{
  const pre = await openAs(ALICE, Q, "inquiry");   // opened while NO lens is in force, handed nothing
  const w1 = await writeBias("draft", "Claims from the city attorney's office need a second record.");
  const w2 = await writeBias("proposed", "Claims from the city attorney's office need a second record.");
  const ad = await GET(`op=biasadopt&${RUTH}&bundleId=${BIAS}`);
  const w3 = await writeBias("adopted", "Claims from the city attorney's office need a second record.");
  const L1 = await lensNow();
  t("ARM T0 (REACH): a lens is adopted and IN FORCE, so every arm below compares something real",
    [w1?.ok, w2?.ok, ad?.ok, w3?.ok, L1?.in_force, typeof L1?.statements_sha], [true, true, true, true, true, "string"]);

  const STALE = JSON.stringify({ scope: "instance", scope_id: "", statements_sha: "0".repeat(64), bundles: [] });
  const good = await openAs(ALICE, Q, "inquiry", { biasManifest: handed(L1) });
  const stale = await openAs(ALICE, Q, "inquiry", { biasManifest: STALE });
  const none = await openAs(ALICE, Q, "inquiry", { biasManifest: null });
  const kgood = await openAs(AK, Q, "inquiry", { biasManifest: handed(L1) });
  const kstale = await openAs(AK, Q, "inquiry", { biasManifest: STALE });
  const r = {};
  for (const [k, v] of Object.entries({ good, stale, none, kgood, kstale, pre }))
    r[k] = (await readRun(v.run))?.bias ?? null;
  const pick = (b) => [b?.hand, b?.moved, b?.moved_basis, b?.at_open?.recorded, b?.at_open?.statements_sha === L1.statements_sha];
  t("ARM T1 (THE HAND IN FORCE): a run handed the lens in force reads hand `in_force`, moved false, and records the "
    + "lens the PLANE computed at its open — from a session AND from a credential",
    [pick(r.good), pick(r.kgood)], [["in_force", false, "at_open", true, true], ["in_force", false, "at_open", true, true]]);
  t("ARM T2 (A STALE HAND READS STALE, NOT MOVED — THE ROW'S ACCEPTS-WHEN): a run handed a lens other than the one in "
    + "force reads hand `stale` and moved FALSE, from a session AND from a credential",
    [pick(r.stale), pick(r.kstale)], [["stale", false, "at_open", true, true], ["stale", false, "at_open", true, true]]);
  t("ARM T3 (THE EMPTY HAND): a run handed NOTHING while a lens was in force does not say `no manifest was in force` "
    + "— it says what is true, and reads stale", [r.none?.in_force, r.none?.stated, r.none?.hand, r.none?.moved],
    [false, "no manifest was handed to this run, and one was in force when it opened", "stale", false]);
  t("ARM T4 (NOTHING IN FORCE, NOTHING HANDED): the run opened before the lens reads §3's sentence — true at its "
    + "open — its hand `in_force`, and MOVED, because a lens came into force after it opened",
    [r.pre?.stated, r.pre?.hand, r.pre?.moved, r.pre?.at_open?.in_force, r.pre?.now?.in_force],
    ["no manifest was in force", "in_force", true, false, true]);

  const w4 = await writeBias("adopted", "Claims from the city attorney's office need TWO independent records.");
  const L2 = await lensNow();
  const after = {};
  for (const [k, v] of Object.entries({ good, stale, kgood })) after[k] = (await readRun(v.run))?.bias ?? null;
  t("ARM T5 (THE LENS MOVES): after a revision, the correct hand reads moved TRUE and still hand `in_force`; the "
    + "stale hand reads moved true and still `stale` — two facts, two fields",
    [w4?.ok, L2?.statements_sha !== L1.statements_sha,
     [after.good?.moved, after.good?.hand], [after.kgood?.moved, after.kgood?.hand], [after.stale?.moved, after.stale?.hand]],
    [true, true, [true, "in_force"], [true, "in_force"], [true, "stale"]]);

  /* THE QUESTION'S READ CARRIES THE SAME LENS BLOCK. */
  const lensed = await openAs(AK, Q, "inquiry", { biasManifest: STALE });
  const id = freshId();
  const landed = parse(await create(AK, lensed.run, {}, id));
  const pq = await projection(id, AK);
  t("ARM T6 (THE QUESTION STATES ITS RUN's LENS): a question opened under a stale-handed run reads that run's lens "
    + "block, hand `stale`, moved false", [landed?.ok, pq?.surfaced_in?.lens?.hand, pq?.surfaced_in?.lens?.moved,
     pq?.surfaced_in?.lens?.at_open?.statements_sha === L2.statements_sha], [true, "stale", false, true]);
  /* A STRUCTURAL ARM T7 (a regex over store.mjs's text for the pre-rule branch) stood here at the first run and was
     REMOVED 2026-09-23 before landing: a source match proves a spelling, not a behaviour, and the branch is named in
     "WHAT THIS SUITE CANNOT SEE" (iii) instead. (The same pre-landing pass took the design corpus's directory prefix
     out of this header: a suite whose source spells it is doc-facing to the gate's selector (and so is one naming a tool that reaches the corpus), which raised `statepaths.test.mjs`'s
     MEASUREMENTS-only selection 60 -> 61, over M0-121's ceiling — measured, 20/0 after.) */
}

console.log("\n--- ARM W · WHOLE-STORE PURGE takes every link ---");
{
  const s0 = (await stats())?.inquiryRunSurfacings;
  await POST(`op=purge&token=${ADM}&confirm=bio`, {});
  const s1 = (await stats())?.inquiryRunSurfacings;
  t("ARM W1: before the purge the store held links; after it, none", [s0 > 0, s1], [true, 0]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail += 1;
} finally {
  await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
}

/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean, so this line
   existing at all is part of what the count means (WORKER.md). */
console.log(`\nd85-surface-run: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
