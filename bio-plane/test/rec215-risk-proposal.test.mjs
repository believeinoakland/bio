/* NEGATIVE CONTROL: RUN 2026-09-25 (REC-215 worker, branch land/worker/REC-215 over origin/main 5e8a65a8), each arm
   ALONE, each declared BEFORE the run, restored by `cp` from a uniquely-named per-arm pristine copy kept outside the
   worktree and verified by sha256 AND `cmp` AND a byte count (src/store.mjs 3,481,514 B sha256 03220e4dfc6f33ff…;
   checks/bio-checks.mjs 1,009,340 B sha256 f06582cc4d0ad990…, identical before and after every arm).
   (a) BASELINE — nothing armed. 43 pass / 0 fail, exit 0.
   (b1) THE ROW'S NAMED ARM — LET THE PROPOSAL WRITE THE TIER: `actionRiskPropose` calls the member's revision act
       with the proposed tier under a member's name. DECLARED to fail: §1's "PROPOSING WROTE NO BYTES", §2's "THE
       TIER IS THE MEMBER'S", its index arm, its act's-own-answer arm, its member-revision arm (the member's
       revision then meets RISK_TIER_UNCHANGED), §5's "STILL undetermined". DECLARED to hold: every label arm, §3,
       §4, §6, §7. RESULT 37/6, AS DECLARED, exit 1 — "THE TIER IS THE MEMBER'S" failing by name.
   (c) OVER-STRICTNESS — `riskProposalLabel` answers `machine_proposed` for EVERY proposer (a member's proposal
       labelled machine work). DECLARED to fail: §3's three label arms. RESULT 40/3, AS DECLARED. §1's arm comparing
       the wire's label with the composer's own answer STAYED GREEN, as REC-195 recorded for its twin: both sides
       move together, an equality that costs nothing; the arms that see a label LIE are §3's, which assert values.
   (d) THE READ COMPOSES THE TWO — `op=projection`'s `risk_tier` falls back to the first proposal when no member
       stated one. DECLARED to fail: §2's act's-own-answer arm (the read half) and §5's "STILL undetermined";
       DECLARED to hold: §1's byte arm, because the bytes are untouched. RESULT 41/2, AS DECLARED. */
/* REC-215 — A PROPOSAL OF AN ACTION'S RISK TIER, LABELLED MACHINE WORK AND STORED APART FROM THE MEMBER'S VALUE
 * (BOB #33's risk-tier ruling, 2026-09-24, item 3, recorded in the BOB inbox entry of 21:55Z;
 * `docs/architecture/BIO_Case_Making_v0_1.md` §2, `risk_tier`: *only a member's authored act sets 1, 2 or 3* and
 * *a machine may PROPOSE that a tier be reconsidered, as labelled machine work*).
 *
 * `op=actionriskpropose` is REC-195's `op=actionlawspropose` one field over, and this suite holds it to the two
 * things the row accepts it on, each in the direction that fails:
 *
 *   1. A PROPOSAL IS READ LABELLED MACHINE WORK — the label is the PLANE's answer (`riskProposalLabel`), carries
 *      the published sentence, and stands on EVERY proposal, so a surface that never learned the key cannot
 *      render a machine's tier as nobody's.
 *   2. THE TIER IS UNCHANGED UNTIL A MEMBER ACTS — asserted about the BYTES (byte-identical after a proposal),
 *      about the READ (`risk_tier` and `risk_tier_history` as they were), about the INDEX (`op=search q=risk:`),
 *      and ACROSS the member's act: once a member revises, the tier and its history entry are the member's, the
 *      proposal still stands as machine work, and nothing in either answer relates the two.
 *
 * AND WHAT WOULD MAKE EITHER CLAIM HOLLOW:
 *   3. OVER-STRICTNESS — a member's proposal is a proposal and is NOT machine work; the wire's "2" is a tier;
 *      proposing the tier already held is not refused (the ruling does not forbid it).
 *   4. THE SHAPE — a tier is judged by the SAME grammar the member's act uses (`#riskTierAsked`, C-90.2), and the
 *      basis by its own row (C-90.6); a refused proposal writes nothing. The existence refusals, and a credential
 *      that cannot see the action refused as if it did not exist.
 *   5. ONE STANDING PROPOSAL PER PROPOSER.
 *   6. THE EMPTY ANSWER IS A STATEMENT, and the read's cut is published.
 *   7. IT IS NOT AN ACT: NON_ACTS, never ACTS (BOB #33 21:55Z, REC-195's reasoning).
 *   8. THE PURGE TAKES THEM (D-113).
 *
 * WHAT THIS SUITE CANNOT SEE: whether a proposed tier is RIGHT, or where the proposer got its basis — the plane
 * stores what it was handed, under the proposer's name. It drives Miniflare through the control plane — a real
 * caller's route — and a green harness is not a serving build (D-108).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { RISK_TIERS, RISK_TIER_REVISION_CHECKS, RISK_PROPOSAL_STATES, RISK_PROPOSAL_BASIS_MAX,
         riskProposalLabel } from "../checks/bio-checks.mjs";
import { ACTS, NON_ACTS } from "../src/affordances.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const PINNED_MS = Date.parse("2026-08-20T00:00:00Z");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r215", MEMBER_TOKEN: "mem-r215", PROBE_TOKEN: "prb-r215",
              VERSION: "test", BIO_NOW_MS: String(PINNED_MS) },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

/* THE OPS UNDER TEST, through the CONTROL PLANE, their names UNINTERPOLATED so coverage credits them. */
const propose = async (tok, target, body) =>
  rP(await POST(`op=actionriskpropose&token=${tok}&target=${encodeURIComponent(target)}`, body));
const actionrisktier = async (tok, target, body) =>
  rP(await POST(`op=actionrisktier&token=${tok}&target=${encodeURIComponent(target)}`, body));
const actionOf = async (tok, id) =>
  rP(await GET(`op=projection&token=${tok}&id=${encodeURIComponent(id)}`))?.action ?? null;
const textOf = async (tok, id) => {
  const f = rP(await GET(`op=file&token=${tok}&id=${encodeURIComponent(id)}&path=bundle.md`));
  return typeof f?.text === "string" ? f.text : "";
};

const actionMd = (id, { tier = "3" } = {}) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Records request"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "action_kind: other", `risk_tier: ${tier}`,
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "",
  "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", `### Session ${LATER} | Formation | nadia`,
  "Trigger: intake", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const inquiryMd = (id) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Not an action"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Question", "", "Does this refuse?", "",
  "## Session Log", "", `### Session ${LATER} | Formation | nadia`,
  "Trigger: intake", "Changes: created.", ""].join("\n");

const enrol = async (memberId, password, role) => {
  const add = rP(await POST("op=memberadd&token=adm-r215",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};

try {
const NADIA = await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");   /* ADMINS_FIRST: the second member is an administrator */
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member");
const MACHINE = "mem-r215";   /* MEMBER_TOKEN: a machine credential by REC-46's predicate */

let snapKeySeq = 0;
const promote = async (tok, id, text, type = "action") =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: `${id}-new-${String(++snapKeySeq).padStart(4, "0")}`,
    files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }],
    register: [],
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "action" ? "planned" : "open", created: NOW, last_updated: LATER },
  }));
const searchIds = async (q) => (rP(await GET(`op=search&token=${NADIA}&q=${encodeURIComponent(q)}`))?.hits ?? [])
  .map((h) => h.bundle_id);

const ACT = "ACTN-2026-2150-counsel-first";
const BARE = "ACTN-2026-2151-never-assessed";
const INQ = "INQ-2026-2152-not-an-action";
const BASIS = "the counterparty is a city agency with no pending litigation named in the correspondence";

t("the fixtures land through op=promote (the corpus is non-empty before anything is asked of it)",
  [(await promote(NADIA, ACT, actionMd(ACT, { tier: "3" })))?.ok,
   (await promote(NADIA, BARE, actionMd(BARE, { tier: "undetermined" })))?.ok,
   (await promote(NADIA, INQ, inquiryMd(INQ), "inquiry"))?.ok], [true, true, true]);

/* ===================================================================== */
console.log("--- 1. a machine's proposal is READ, and it is labelled machine work ---");
{
  const bytesBefore = await textOf(NADIA, ACT);
  const p = await propose(MACHINE, ACT, { tier: 1, basis: BASIS });
  t("a machine credential's proposal LANDS through the control plane, with its tier and its basis",
    [p?.ok, p?.target, p?.proposal?.tier, p?.proposal?.tier_words, p?.proposal?.basis],
    [true, ACT, 1, RISK_TIERS[1], BASIS]);
  t("the act's own answer labels it machine work, names the credential that proposed, and carries the "
  + "PUBLISHED sentence rather than one of its own",
    [p?.proposal?.machine_work, p?.proposal?.state, p?.proposal?.by, p?.proposal?.says],
    [true, "machine_proposed", "class:member", RISK_PROPOSAL_STATES.machine_proposed]);
  t("the sentence says out loud that it is not the tier, not in its history, and changes nothing on its own",
    [/That is machine work, labelled as machine work/.test(p?.proposal?.says ?? ""),
     /not in the tier's history/.test(p?.proposal?.says ?? ""),
     /until a member revises the tier themselves/.test(p?.proposal?.says ?? "")], [true, true, true]);

  const a = await actionOf(PILAR, ACT);
  const prop = a?.risk_tier_proposals?.proposals?.[0] ?? null;
  t("the ACTION'S OWN READ carries it, in its own block, labelled the same way",
    [a?.risk_tier_proposals?.proposals?.length, prop?.machine_work, prop?.state, prop?.by, prop?.tier, prop?.basis],
    [1, true, "machine_proposed", "class:member", 1, BASIS]);
  t("the label a reader is shown is the catalogue's ONE composer's answer",
    [prop?.state, prop?.machine_work, prop?.says],
    [riskProposalLabel("class:member").state, riskProposalLabel("class:member").machine_work,
     riskProposalLabel("class:member").says]);
  t("the block SAYS what it holds and how much of it is machine work",
    /1 proposal of this action's risk tier, 1 of them machine work/.test(a?.risk_tier_proposals?.says ?? ""), true);
  t("PROPOSING WROTE NO BYTES: the stored document (a real one) is byte-identical after the proposal",
    [bytesBefore.length > 600, sha(await textOf(NADIA, ACT))], [true, sha(bytesBefore)]);
}

/* ===================================================================== */
console.log("\n--- 2. the tier is UNCHANGED until a member acts ---");
{
  const a = await actionOf(PILAR, ACT);
  t("THE TIER IS THE MEMBER'S: a proposal of 1 stands, and the action's tier still reads 3 in its own words, "
  + "with no revision in its history",
    [a?.risk_tier, a?.risk_tier_words, a?.risk_tier_history?.current, a?.risk_tier_history?.revisions?.length],
    [3, RISK_TIERS[3], 3, 0]);
  t("...and the INDEX agrees: op=search q=risk:3 finds the action and q=risk:1 does not",
    [(await searchIds("risk:3")).includes(ACT), (await searchIds("risk:1")).includes(ACT)], [true, false]);
  const onBare = await propose(MACHINE, BARE, { tier: 2, basis: BASIS });
  t("the act's own answer says the same thing at the time it wrote the proposal — an action nobody assessed is "
  + "still UNDETERMINED after a machine proposed a tier for it",
    [onBare?.ok, onBare?.risk_tier, (await actionOf(PILAR, BARE))?.risk_tier], [true, "undetermined", "undetermined"]);

  /* THE MEMBER ACTS. The tier becomes the member's; the proposal stays what it was. */
  const rev = await actionrisktier(PILAR, ACT, { tier: 1, reason: "counsel reviewed the request and cleared it" });
  const after = await actionOf(PILAR, ACT);
  const last = after?.risk_tier_history?.revisions?.at(-1) ?? null;
  t("a member revises the tier and it is THEIRS — the history entry names the member and the member's reason, "
  + "not the machine that proposed the same number",
    [rev?.ok, after?.risk_tier, last?.by, last?.reason, last?.prior],
    [true, 1, "pilar", "counsel reviewed the request and cleared it", 3]);
  t("the machine's proposal still stands, still labelled machine work, still apart from the history",
    [after?.risk_tier_proposals?.proposals?.[0]?.machine_work, after?.risk_tier_proposals?.proposals?.[0]?.by,
     after?.risk_tier_history?.revisions?.some((r) => r.by === "class:member")], [true, "class:member", false]);
  t("AND NOTHING RELATES THEM: neither answer says the member adopted, accepted or acted on the proposal",
    /adopt|accepted|acted on|from the proposal|because/i.test(JSON.stringify(
      [after?.risk_tier_history, after?.risk_tier_proposals])), false);
  t("the member's act carries no proposal key at all",
    ["proposal" in (rev ?? {}), Object.keys(rev ?? {}).includes("risk_tier_proposals")], [false, false]);
}

/* ===================================================================== */
console.log("\n--- 3. OVER-STRICTNESS: a member's proposal is NOT machine work; the wire's \"2\" is a tier ---");
{
  const p = rP(await POST(`op=actionriskpropose&token=${NADIA}&target=${encodeURIComponent(BARE)}&tier=2`
    + `&basis=${encodeURIComponent("the clerk named a pending claim")}`));
  t("a signed-in member may propose — the ruling says a machine MAY, not that nobody else may — and is named; "
  + "the tier arrives on the query string as \"2\" and is read as 2",
    [p?.ok, p?.proposal?.by, p?.proposal?.state, p?.proposal?.machine_work, p?.proposal?.tier],
    [true, "nadia", "member_proposed", false, 2]);
  t("...with its own published sentence, which does not call a member's proposal machine work",
    [p?.proposal?.says, /machine work/.test(p?.proposal?.says ?? "")],
    [RISK_PROPOSAL_STATES.member_proposed, false]);
  const a = await actionOf(NADIA, BARE);
  t("the read holds BOTH proposals apart, each under its own proposer, and counts only one as machine work",
    [a?.risk_tier_proposals?.proposals?.length, a?.risk_tier_proposals?.proposals?.filter((x) => x.machine_work).length,
     /2 proposals of this action's risk tier, 1 of them machine work/.test(a?.risk_tier_proposals?.says ?? "")],
    [2, 1, true]);
  t("THE LABEL BLOCK IS ON EVERY PROPOSAL, not only on machine ones",
    a?.risk_tier_proposals?.proposals?.every((x) => "machine_work" in x && "state" in x && "by" in x && "says" in x),
    true);
  const same = await propose(MACHINE, ACT, { tier: 1, basis: "the same exposure, read again" });
  t("a proposal of the tier ALREADY HELD is not refused — the ruling forbids a machine setting the tier, not "
  + "agreeing with it — and the tier is still the member's",
    [same?.ok, same?.risk_tier, (await actionOf(NADIA, ACT))?.risk_tier_history?.revisions?.length], [true, 1, 1]);
}

/* ===================================================================== */
console.log("\n--- 4. the shape: the tier by the member's own grammar, the basis by its own row ---");
{
  const before = (await actionOf(NADIA, ACT))?.risk_tier_proposals?.proposals;
  const cases = [
    ["`undetermined` — not a tier anybody proposes", { tier: "undetermined", basis: BASIS }, "BAD_RISK_TIER", "C-90.2"],
    ["a tier outside 1..3", { tier: 4, basis: BASIS }, "BAD_RISK_TIER", "C-90.2"],
    ["no tier at all", { basis: BASIS }, "BAD_RISK_TIER", "C-90.2"],
    ["no basis", { tier: 2 }, "RISK_PROPOSAL_BASIS_REFUSED", "C-90.6"],
    ["a blank basis", { tier: 2, basis: "   " }, "RISK_PROPOSAL_BASIS_REFUSED", "C-90.6"],
    ["a basis over the bound", { tier: 2, basis: "x".repeat(RISK_PROPOSAL_BASIS_MAX + 1) }, "RISK_PROPOSAL_BASIS_REFUSED", "C-90.6"],
    ["a basis with a quotation mark", { tier: 2, basis: `the clerk said "maybe"` }, "RISK_PROPOSAL_BASIS_REFUSED", "C-90.6"],
  ];
  for (const [what, body, code, check] of cases) {
    const r = await propose(MACHINE, ACT, body);
    t(`${what}: refused ${code} (${check}), with the catalogue's own translation`,
      [r?.ok, r?.reason, r?.check, r?.translation, RISK_TIER_REVISION_CHECKS[code].check],
      [false, code, check, RISK_TIER_REVISION_CHECKS[code].translation, check]);
  }
  t("a basis of EXACTLY the bound is not refused (the bound is inclusive)",
    (await propose(MACHINE, BARE, { tier: 3, basis: "y".repeat(RISK_PROPOSAL_BASIS_MAX) }))?.ok, true);
  t("a refused proposal wrote nothing: the standing proposals on the action are what they were",
    (await actionOf(NADIA, ACT))?.risk_tier_proposals?.proposals, before);
  const noTarget = rP(await POST(`op=actionriskpropose&token=${MACHINE}`, { tier: 2, basis: BASIS }));
  t("no target is refused NO_TARGET", [noTarget?.ok, noTarget?.reason], [false, "NO_TARGET"]);
  const ghost = await propose(MACHINE, "ACTN-2026-9999-nowhere", { tier: 2, basis: BASIS });
  t("an action that does not exist is refused NO_SUCH_BUNDLE", [ghost?.ok, ghost?.reason], [false, "NO_SUCH_BUNDLE"]);
  const wrong = await propose(MACHINE, INQ, { tier: 2, basis: BASIS });
  t("a question is not an action: refused NOT_AN_ACTION", [wrong?.ok, wrong?.reason, wrong?.object_type],
    [false, "NOT_AN_ACTION", "inquiry"]);
  const probe = await propose("prb-r215", ACT, { tier: 2, basis: BASIS });
  t("a credential that cannot SEE the action is refused exactly as it would be for one that does not exist",
    [probe?.ok, probe?.reason], [false, "NO_SUCH_BUNDLE"]);
}

/* ===================================================================== */
console.log("\n--- 5. one standing proposal per proposer: a restatement replaces its OWN and nobody else's ---");
{
  const again = await propose(MACHINE, BARE, { tier: 1, basis: "restated" });
  const a = await actionOf(NADIA, BARE);
  const mine = a?.risk_tier_proposals?.proposals?.find((x) => x.by === "class:member") ?? null;
  const theirs = a?.risk_tier_proposals?.proposals?.find((x) => x.by === "nadia") ?? null;
  t("the same proposer restating replaces its own proposal whole",
    [again?.ok, mine?.tier, mine?.basis], [true, 1, "restated"]);
  t("...and the OTHER proposer's proposal is untouched, still two proposals in all",
    [theirs?.tier, a?.risk_tier_proposals?.proposals?.length], [2, 2]);
  t("the action's tier is STILL undetermined after four proposals: no number of proposals is an assessment",
    [a?.risk_tier, a?.risk_tier_history?.revisions?.length], ["undetermined", 0]);
}

/* ===================================================================== */
console.log("\n--- 6. the empty answer is a STATEMENT, and the cut is published ---");
{
  const fresh = "ACTN-2026-2153-untouched";
  t("a fourth action lands", (await promote(NADIA, fresh, actionMd(fresh)))?.ok, true);
  const blk = (await actionOf(PILAR, fresh))?.risk_tier_proposals ?? null;
  t("an action nobody proposed for answers with an empty list AND a sentence — never a bare []",
    [blk?.proposals, blk?.truncated,
     /no proposal of this action's risk tier stands in the record/.test(blk?.says ?? "")], [[], false, true]);
  t("the read publishes its own bound", blk?.limit, 12);
}

/* ===================================================================== */
console.log("\n--- 7. it is NOT an act on the action: NON_ACTS, never ACTS ---");
{
  t("actionriskpropose is published in NON_ACTS and is absent from ACTS (BOB #33 21:55Z: every *propose op)",
    [typeof NON_ACTS.actionriskpropose, ACTS.some((a) => a.id === "actionriskpropose")], ["string", false]);
  const aff = rP(await GET(`op=affordances&token=${NADIA}&target=${encodeURIComponent(ACT)}`));
  t("...so an action's affordances never OFFER it — the surface shows the proposal, and offers no act on it",
    [aff?.ok !== false, JSON.stringify(aff ?? {}).includes("actionriskpropose")], [true, false]);
}

/* ===================================================================== */
console.log("\n--- 8. the whole-store purge takes the proposals with the actions (D-113) ---");
{
  const pg = rP(await POST("op=purge&token=adm-r215&confirm=bio", {}));
  t("op=purge ALL reports the risk-tier proposal rows it took — one on ACT (the machine's, restated), two on BARE "
  + "(the machine's and nadia's)", [pg?.ok, pg?.removed?.actionRiskProposals], [true, 3]);
  t("and nothing is left to read", await actionOf(NADIA, ACT), null);
}

} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  fail++;
}

await mf.dispose();
console.log(`\nrec215-risk-proposal: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
