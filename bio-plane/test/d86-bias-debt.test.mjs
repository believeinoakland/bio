/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d86-bias-debt.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/d86-bias-debt.control.mjs [arm]`. RESULTS, RUN 2026-09-23 by the D-86 worker (CONDUCT #18's, cloud) on 02603e88 + this item (real src/store.mjs 2,919,986 B sha256 35662f7626f6…, src/queuestate.mjs 18,447 B 539ecda9c4e1…, src/schema.mjs 225,681 B 0e6963a92e93…, src/index.mjs 731,481 B c7d77e7eee13…, untouched: YES), ALL EIGHT ARMS AS DECLARED at the first run, each patching a COPY, each anchor occurring exactly its declared number of times: (1) baseline -> 20/0. (2) drop-registration — THE ROW'S CONTROL, the `bias-debt` entry removed from #schedConsumers -> 8/12: ARM M1 (THE MOVED-LENS ARM, BY NAME), L1, M2, M3, A1, I1, R1, R2, C1, C2, B1, B2; the absence arms M4, R3, R4, Z1, W1 stay green, which is why they are not evidence. (3) flip — aiRunRead's ONE comparison inverted at its three sites (`openSha === nowSha`) -> 8/12, and ARM A1 STAYS GREEN: the honest sweep FOLLOWS the function, while every fixed expectation (L1 M1-M4 I1 R1 R2 D1 C1 C2 B2) fails. (4) moved-null — the comparison made undetermined -> 9/11: nothing raised and nothing cleared, A1 and M4 green (the suite's only reach into `moved: null`). (5) liar — a SECOND comparison in the sweep, over the two hashes op=airun publishes -> 20/0, GREEN, as declared: it agrees today. (6) liar+flip — the second comparison PLUS the function inverted -> 16/4: ARM A1 BY NAME, with L1, D1, C1 (the arms that read op=airun's own `moved`); the items did not move, which is the lie. (7) owners-dropped — a fence tighter than the rule, recipients narrowed to the principal -> 19/1: R2. (8) spelling (OVER-STRICTNESS) — the same read destructured -> 20/0. BEFORE THIS ITEM: no producer, no consumer; the suite cannot load a store with no `bias_debts` table.
 * =========================================================================
 * D-86 — A LENS CHANGE LEAVES BIAS DEBT, AND NOW SOMETHING RAISES IT.
 *
 * `NOTIFICATIONS.md` §The catalogue: *"a re-run owed after a lens change `[OBLIGATION]` (D-86 — DISCLOSED, never
 * blocking)"*, and §The item contract; `BIO_Content_Framework_v0_10.md` §13 (bias debt and ageing are one mechanism:
 * the temporal half blocks, the bias half SURFACES). A `bias-debt` consumer on the one alarm raises ONE OBLIGATION per
 * run whose recorded lens `moved` — computed by `aiRunRead`'s comparison and never a copy — its basis naming both
 * hashes, to recipients the producer names inside the run's read gate. `moved: null` raises nothing; nothing is
 * refused (DEC-20).
 *
 * WHAT WAS WRONG, measured on the unedited tree (`02603e88`): `queuestate.mjs` catalogued `bias-debt` with no
 * producer, `#schedConsumers` held no sweep, and a run whose lens had moved said so on `op=airun` and nowhere a member
 * is told. The overdue-scan registration still said bias debt is "blocking a state transition", which DEC-20 reversed.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: a SECOND comparison in the sweep — the two
 * hashes compared again — agrees with `aiRunRead` today and passes every fixed expectation below. So ARM A asks,
 * for EVERY run, that the queue carries an item exactly when `op=airun` reads `moved: true`: the control changes the
 * ONE function, and the item must follow it (the `flip` arm leaves ARM A green and the fixed arms red; `liar+flip`
 * turns ARM A red BY NAME).
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, one store; (ii) no surface — it asserts what the plane SENDS on
 * `op=queue`; (iii) `moved: null` — a run with no readable lens at its open, or one opened before D-85 with a hand
 * the reader cannot compare. No op can write either (`lens_at_open` is written at every open), so the null branch
 * is driven only by the control's `moved-null` arm, which must raise nothing; (iv) the alarm is fired through the
 * Durable Object's `onAlarm`, as every scheduler suite does — `alarm()` is workerd's reserved entry and cannot be
 * called; (v) what DISCHARGES a debt other than the lens moving back: no act exists (DESIGN GAP, reported).
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed COPY of the sources. */
const SRC_DIR = process.env.D86_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-d86", MEM = "mem-d86";
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
/* The virtual clock the alarm is fired at: always past every real wake, so every due consumer runs. */
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

/* RUTH owns the project and authors the lens. ALICE opens every run. CORA is joined, owns nothing, opened nothing.
   PIA is in no project. */
const RUTH  = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
await member("gus", ["contribute"], "admin");
const ALICE = await member("alice", ["contribute"]);
const CORA  = await member("cora", ["contribute"]);
const PIA   = await member("pia",  ["contribute"]);

const NOW = "2026-09-23T00:00:00Z", LATER = "2026-09-23T01:00:00Z";
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
    snapKey: `20260923T1500${String(++seq).padStart(2, "0")}Z_dd86aa11`,
    /* CORRECTED 2026-09-25 (D-563, C-86.3), never exempted: this label contradicted the title the other documents
       state, and is now refused; a project document here states no title, so the label stays its only name. */
    meta: { object_type: type, group: "believe-in-oakland", ...(type === "project" ? { title: `title for ${id}` } : {}),
            current_state: type === "project" ? "forming" : "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [],
  };
};

const Q = "INQ-2026-9186-question";
let P = null;
console.log("\n--- FIXTURE: one project (alice and cora joined, ruth its owner, pia not), one readable question ---");
{
  const p = await POST(`op=promote&${RUTH}`, bundle("d86 project", "project"));
  P = p?.bundleId;
  const q = await POST(`op=promote&${RUTH}`, bundle(Q, "inquiry"));
  const inv = [];
  for (const h of ["alice", "cora"])
    inv.push((await POST(`op=projectinvite&${RUTH}&projectId=${E(P)}&handle=${h}`))?.ok);
  const joined = [(await POST(`op=projectjoin&${ALICE}&projectId=${E(P)}`))?.state,
                  (await POST(`op=projectjoin&${CORA}&projectId=${E(P)}`))?.state];
  t("FIXTURE: the project and the question are promoted; alice and cora are JOINED; pia was never invited",
    [p?.ok, !!P, q?.ok, inv, joined], [true, true, true, [true, true], ["joined", "joined"]]);
}

let runSeq = 0;
const openAs = async (tok, contextId, contextType) => {
  const run = `RUN-2026-0923-d86-${++runSeq}`;
  const r = await POST(`op=airunopen&${tok}`, {
    run, contextType, contextId, label: "D-86 run", mode: "check",
    principalClaude: "member", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }],
    leaseMs: 30 * 86400000 });
  return { run, started: r?.started === true };
};
const lensOf = async (run) => parse(await RAW(`op=airun&token=${ADM}&run=${E(run)}`))?.session?.bias ?? null;
const queue = async (tok) => GET(`op=queue&${tok}&limit=500`);
const ITEMS = (q) => (q && Array.isArray(q.items)) ? q.items : [];
const debtOf = (q, run) => ITEMS(q).filter((i) => i && i.kind === "bias-debt" && i.subject?.id === run);
const debts = (q) => ITEMS(q).filter((i) => i && i.kind === "bias-debt").map((i) => i.subject?.id).sort();

/* THE LENS: one bias bundle, written and adopted through the real doors, then revised. */
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
const BIAS = "BIAS-2026-0186-house-lens";
let BIAS_SHA = null;
const writeBias = async (state, text, note = "") => {
  const md = FMs(BIAS, state, text) + note;
  const r = await POST(`op=promote&${RUTH}`, { bundleId: BIAS, base: BIAS_SHA,
    snapKey: `20260923T16${String(++seq).padStart(4, "0")}Z_bias`,
    meta: { object_type: "bias", group: "believe-in-oakland", current_state: state,
            created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
  if (r?.bundleSha) BIAS_SHA = r.bundleSha;
  return r;
};
const lensNow = async () => GET(`op=biasmanifest&${RUTH}&scope=instance`);
const TEXT1 = "Claims from the city attorney's office need a second record.";
const TEXT2 = "Claims from the city attorney's office need TWO independent records.";

console.log("\n--- ARM Z · NO LENS EVER ADOPTED: the consumer holds no alarm and sweeps nothing ---");
const PRE = await openAs(ALICE, Q, "inquiry");          // opened while NO lens is in force
{
  const tick = await fire();
  t("ARM Z1 (SELF-TERMINATING): with runs but no lens ever adopted, the bias-debt consumer does not tick",
    [PRE.started, "biasdebt" in (tick || {}), (tick?.probes ?? []).includes("bias-debt")], [true, false, false]);
}

console.log("\n--- ARM L · a lens comes into force; the runs opened under it owe nothing yet ---");
let L1 = null;
const MOV = { run: null }, QMOV = { run: null };
{
  const w1 = await writeBias("draft", TEXT1);
  const w2 = await writeBias("proposed", TEXT1);
  const ad = await GET(`op=biasadopt&${RUTH}&bundleId=${BIAS}`);
  const w3 = await writeBias("adopted", TEXT1);
  L1 = await lensNow();
  Object.assign(MOV, await openAs(ALICE, P, "project"));
  Object.assign(QMOV, await openAs(ALICE, Q, "inquiry"));
  t("ARM L0 (REACH): a lens is adopted and IN FORCE, and two runs opened under it — every arm below compares "
    + "something real", [w1?.ok, w2?.ok, ad?.ok, w3?.ok, L1?.in_force, typeof L1?.statements_sha, MOV.started, QMOV.started],
    [true, true, true, true, true, "string", true, true]);
  const tick = await fire();
  t("ARM L1 (THE LENS CAME INTO FORCE AFTER PRE OPENED): the sweep reads three runs and raises ONE item — for the run "
    + "opened before any lens, whose `moved` is true — and none for the two opened under the lens",
    [tick?.biasdebt?.read, tick?.biasdebt?.raised, tick?.biasdebt?.complete, (await lensOf(PRE.run))?.moved,
     (await lensOf(MOV.run))?.moved], [3, [PRE.run], true, true, false]);
}

console.log("\n--- ARM M · THE LENS MOVES: adopting a new revision after a run opened raises one item naming both hashes ---");
let L2 = null, FRESH = null;
{
  const w4 = await writeBias("adopted", TEXT2);
  L2 = await lensNow();
  FRESH = await openAs(ALICE, Q, "inquiry");        // opened AFTER the revision: its lens has not moved
  const tick = await fire();
  const b = tick?.biasdebt;
  t("ARM M1 (THE ROW'S ACCEPTS-WHEN): the revision raises one item for each run opened under the old lens, "
    + "restates PRE's, and raises none for the run opened after it",
    [w4?.ok, L2?.statements_sha !== L1?.statements_sha, [...(b?.raised ?? [])].sort(), b?.restated, FRESH.started],
    [true, true, [MOV.run, QMOV.run].sort(), [PRE.run], true]);
  const q = await queue(`token=${ADM}`);
  const it = debtOf(q, MOV.run)[0];
  t("ARM M2 (BOTH HASHES): the item is an OBLIGATION of kind bias-debt whose basis names the lens at the open and "
    + "the lens now, as op=airun publishes them, computed by aiRunRead",
    [it?.class, it?.kind, it?.basis?.lens_then === L1?.statements_sha, it?.basis?.lens_now === L2?.statements_sha,
     it?.basis?.moved_basis, it?.basis?.computed_by, it?.subject?.kind, it?.subject?.context?.id === P],
    ["OBLIGATION", "bias-debt", true, true, "at_open", "aiRunRead", "run", true]);
  const pre = debtOf(q, PRE.run)[0];
  t("ARM M3 (NONE IN FORCE IS SAID, NEVER A HASH INVENTED): the run opened before any lens names no lens then, and "
    + "says so in words", [pre?.basis?.lens_then, pre?.basis?.lens_now === L2?.statements_sha,
     /none in force/.test(pre?.basis?.stated ?? "")], [null, true, true]);
  t("ARM M4 (AN UNMOVED LENS RAISES NONE): the run opened after the revision has no item",
    debtOf(q, FRESH.run).length, 0);
}

console.log("\n--- ARM A · THE ITEM FOLLOWS aiRunRead: for every run, an item exactly when op=airun reads moved true ---");
{
  const q = await queue(`token=${ADM}`);
  const rows = [];
  for (const r of [PRE, MOV, QMOV, FRESH]) rows.push([(await lensOf(r.run))?.moved === true, debtOf(q, r.run).length === 1]);
  t("ARM A1 (ONE COMPARISON): across all four runs, the queue carries an item exactly where op=airun reads moved true",
    rows.map(([m, i]) => m === i), [true, true, true, true]);
}

console.log("\n--- ARM I · IDEMPOTENT: one item per run, not one per alarm tick ---");
{
  const q0 = debts(await queue(`token=${ADM}`));
  const quiet = await fire();
  /* A revision that changes no statement moves the lens INPUTS and not the lens: the sweep runs again, over every
     run, and must write nothing new. */
  const w5 = await writeBias("adopted", TEXT2, "\nA note that changes the bytes and no statement.\n");
  const again = await fire();
  const q1 = debts(await queue(`token=${ADM}`));
  t("ARM I1: with nothing changed the consumer does not tick; a revision changing no statement re-sweeps every run "
    + "and raises nothing, restates nothing — and the queue holds the same one item per run",
    ["biasdebt" in (quiet || {}), w5?.ok, again?.biasdebt?.read, again?.biasdebt?.raised, again?.biasdebt?.restated,
     again?.biasdebt?.unchanged, q1, q1.length === new Set(q1).size, JSON.stringify(q0) === JSON.stringify(q1)],
    [false, true, 4, [], [], 4, [PRE.run, MOV.run, QMOV.run].sort(), true, true]);
}

console.log("\n--- ARM R · RECIPIENTS, named by the producer and each inside the run's read gate ---");
{
  const mine = debts(await queue(ALICE)), cora = debts(await queue(CORA)), pia = debts(await queue(PIA));
  const ruth = debts(await queue(RUTH));
  const it = debtOf(await queue(`token=${ADM}`), MOV.run)[0];
  t("ARM R1 (THE PRINCIPAL): alice, whose runs they are, is told of all three",
    mine, [PRE.run, MOV.run, QMOV.run].sort());
  t("ARM R2 (THE PROJECT'S OWNER): ruth owns the project the moved run is over and is told of that one only",
    [ruth, it?.recipients], [[MOV.run], ["alice", "ruth"]]);
  t("ARM R3 (NOT A RECIPIENT): cora can read every run and is named on none, so she is told of none",
    cora, []);
  t("ARM R4 (OUTSIDE THE GATE): pia cannot read the project run and is not a recipient of the others", pia, []);
}

console.log("\n--- ARM D · DISCLOSED, NEVER BLOCKING (DEC-20): a run in debt still works ---");
{
  const tick = await POST(`op=airuntick&${ALICE}`, { run: MOV.run });
  const lens = await lensOf(MOV.run);
  t("ARM D1: a run whose lens moved still ticks, refused nothing, and its own read still says moved",
    [tick?.ok !== false && !tick?.code, lens?.moved], [true, true]);
}

console.log("\n--- ARM C · THE LENS MOVES BACK: the obligation it no longer rests on leaves the queue ---");
{
  const w6 = await writeBias("adopted", TEXT1);
  const L3 = await lensNow();
  const tick = await fire();
  const q = debts(await queue(`token=${ADM}`));
  t("ARM C1: back at the lens the two runs opened under, both are CLEARED — the reader says moved false — PRE, "
    + "which opened under no lens, stays, and the run opened under the revision now owes one",
    [w6?.ok, L3?.statements_sha === L1?.statements_sha, [...(tick?.biasdebt?.cleared ?? [])].sort(),
     tick?.biasdebt?.raised, (await lensOf(MOV.run))?.moved, q],
    [true, true, [MOV.run, QMOV.run].sort(), [FRESH.run], false, [PRE.run, FRESH.run].sort()]);
  const w7 = await writeBias("adopted", TEXT2);
  const back = await fire();
  t("ARM C2: and moving it again RESTATES the cleared rows — still one item per run — and clears FRESH's",
    [w7?.ok, [...(back?.biasdebt?.restated ?? [])].sort(), back?.biasdebt?.raised, back?.biasdebt?.cleared,
     debts(await queue(`token=${ADM}`))],
    [true, [PRE.run, MOV.run, QMOV.run].sort(), [], [FRESH.run], [PRE.run, MOV.run, QMOV.run].sort()]);
}

console.log("\n--- ARM W · WHOLE-STORE PURGE takes every debt with its run ---");
{
  await POST(`op=purge&token=${ADM}&confirm=bio`, {});
  t("ARM W1: after a whole-store purge no debt is in the queue", debts(await queue(`token=${ADM}`)), []);
}

/* PART 2 — BOUNDED. The batch pinned to ONE run per tick, so a sweep over three runs must span three ticks and
   the consumer must stay due until it completes; a sweep that read the whole store at once, or that recorded its
   fingerprint before finishing, fails here. Driven by the machine credential alone. */
{
  const mf2 = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test", BIAS_DEBT_DELAY_MS: "3600000",
                BIAS_DEBT_BATCH: "1" },
  });
  try {
    console.log("\n--- ARM B · BOUNDED: one run per tick, the consumer due until the sweep completes ---");
    const sha2 = (v) => createHash("sha256").update(v).digest("hex");
    const P2 = async (q, body) => { const r = await mf2.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body ?? {}) });
                                    try { const j = JSON.parse(await r.text()); return j && "result" in j ? j.result : j; } catch { return null; } };
    const ns2 = await mf2.getDurableObjectNamespace("STORE");
    const o2 = ns2.get(ns2.idFromName("bio"));
    let c2 = Date.now() + 10 * 86400000;
    /* A MEMBER creates the question: a machine credential's creation is bound to a run (REC-171). */
    const m2 = async (id) => {
      const add = await P2(`op=memberadd&token=${ADM}`, { memberId: id, cover: `cover for ${id}`, role: "admin",
                                                          capabilities: ["contribute", "publish", "create_projects"] });
      await P2("op=enroll", { invite: add?.invite, handle: id, password: `${id}-passphrase-1` });
      return "token=" + (await P2("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` }))?.token;
    };
    const R2 = await m2("ruth"); await m2("gus");
    const md = inquiryMd("INQ-2026-9186-bounded");
    const q = await P2(`op=promote&${R2}`, { bundleId: "INQ-2026-9186-bounded", base: null,
      snapKey: "20260923T170000Z_dd86bb22",
      meta: { object_type: "inquiry", group: "believe-in-oakland", current_state: "open",
              created: NOW, last_updated: LATER },
      files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha2(md) }], register: [] });
    let bsha = null;
    const wb = async (state, text) => {
      const m = FMs(BIAS, state, text);
      const r = await P2(`op=promote&${R2}`, { bundleId: BIAS, base: bsha,
        snapKey: `20260923T17${String(++seq).padStart(4, "0")}Z_bias`,
        meta: { object_type: "bias", group: "believe-in-oakland", current_state: state,
                created: NOW, last_updated: LATER },
        files: [{ path: "bundle.md", text: m, bytes: m.length, sha256: sha2(m) }], register: [] });
      if (r?.bundleSha) bsha = r.bundleSha;
      return r?.ok;
    };
    const ok = [await wb("draft", TEXT1), await wb("proposed", TEXT1),
                rP(await (await mf2.dispatchFetch(`http://x/api/?op=biasadopt&${R2}&bundleId=${BIAS}`)).json())?.ok === true,
                await wb("adopted", TEXT1)];
    const opened = [];
    for (let i = 1; i <= 3; i++) {
      const r = await P2(`op=airunopen&${R2}`, { run: `RUN-2026-0923-d86b-${i}`, contextType: "inquiry",
        contextId: "INQ-2026-9186-bounded", label: "bounded", mode: "check", principalClaude: "member",
        skillVersion: "investigative-session@1", bounds: [{ bound: "fetches", allowed: 5, unit: "requests" }],
        leaseMs: 30 * 86400000 });
      opened.push(r?.started === true);
    }
    const first = await o2.onAlarm(c2 += 60000);        // lens now in force: nothing moved, fingerprint recorded
    await wb("adopted", TEXT2);
    const ticks = [];
    for (let i = 0; i < 4; i++) { const r = await o2.onAlarm(c2 += 60000); ticks.push(r?.biasdebt ? [r.biasdebt.read, r.biasdebt.complete, r.biasdebt.raised.length] : null); }
    t("ARM B1 (REACH): the store, the lens and three runs exist", [q?.ok, ok, opened, first?.biasdebt?.read],
      [true, [true, true, true, true], [true, true, true], 1]);
    t("ARM B2: after the revision three ticks read one run each and raise one each; the third completes the sweep "
      + "and the fourth tick finds nothing due", ticks, [[1, false, 1], [1, false, 1], [1, true, 1], null]);
  } catch (e) {
    console.log(`  FAIL  part 2 threw: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
    fail += 1;
  } finally {
    await mf2.dispose();
  }
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail += 1;
} finally {
  await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
}

/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean, so this line
   existing at all is part of what the count means (WORKER.md). */
console.log(`\nd86-bias-debt: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
