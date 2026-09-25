/* NEGATIVE CONTROL: RUN 2026-09-24 (REC-195 worker, branch land/worker/REC-195 over origin/main 68fecb8d), each
   arm ALONE with the others held open, each declared BEFORE the run, restored by `cp` from a UNIQUELY-NAMED
   per-arm pristine copy kept OUTSIDE the worktree and verified by sha256 AND `cmp` AND a byte count with a
   minimum guarded (src/store.mjs 3,234,533 B sha256 ed09903a10cd7402…; checks/bio-checks.mjs 930,423 B sha256
   2f096c516b52887f…, both identical before and after every arm).
   (a) BASELINE — nothing armed. 40 pass / 0 fail, exit 0. It is not decoration: it is what distinguishes
       four-arms-working from four-arms-broken.
   (b1) THE ROW'S NAMED ARM — LET THE PROPOSAL WRITE THE LIST: `actionLawsPropose` promotes the proposed
       citations into the action's own frontmatter, claiming the governing-laws act so C-73.1 lets it through.
       DECLARED to fail: §1's "PROPOSING WROTE NO BYTES", §2's "THE LIST IS THE MEMBER'S" and its sentence arm,
       §5's "still undetermined". DECLARED to hold: §1's label arms, §3, §4, §6, §7. RESULT 35/5, AS DECLARED —
       and the FIFTH failure is §2's "the act's own answer said the same thing", which the declaration did not
       name and should have: it reads the same list through the same reader, which is the property that makes
       the act and the read unable to disagree. Every other arm held.
   (b2) THE SAME WRITE, NOT CLAIMING THE ACT — the identical promotion without the governing-laws flag.
       DECLARED: everything stays GREEN, because D-149's OWN fence (C-73.1, GOVERNING_LAWS_REWRITTEN) refuses a
       write that moves the list outside `op=actionlaws` whatever route it came from. RESULT 40/0, AS DECLARED.
       The value of the arm is that this is MEASURED rather than reasoned: the proposal is kept off the list by
       two independent mechanisms, and only one of them is this item's.
   (c) OVER-STRICTNESS — `lawProposalState` returns `machine_proposed` for EVERY proposer, i.e. correct work
       (a member's proposal) labelled as the machine's. DECLARED to fail: §3's three arms. DECLARED to hold:
       everything else. RESULT 37/3, AS DECLARED. **AND ONE SURPRISING GREEN, RECORDED RATHER THAN SMOOTHED:**
       §1's arm comparing the wire's label against `lawProposalLabel`'s own answer STAYED GREEN under this arm,
       because both sides move together — an equality that costs nothing to produce is not evidence. That arm
       is kept for what it does prove (ONE composer, not two agreeing), and the arms that can see a label
       LYING are §3's, which assert the VALUE.
   (d) THE READ COMPOSES THE TWO — `op=projection`'s `governing_laws` falls back to the first proposal when no
       member has stated a list (the same defect as (b1), arriving at the READ instead of the write).
       DECLARED to fail: §2's list arms and §5's. DECLARED to hold: §1's byte arm — and that is the reason this
       arm exists: the bytes are untouched, so the write-side assertion passes over a read that tells a member
       an unstated list is stated. RESULT 37/3, AS DECLARED, §1's byte arm GREEN throughout. */
/* REC-195 — A MACHINE'S PROPOSAL OF THE LAWS GOVERNING AN ACTION, STORED APART FROM THE MEMBER'S LIST
 * (D-149, Bob 2026-09-22; `docs/architecture/BIO_Case_Making_v0_1.md` §2, *A RECORDS REQUEST NAMES EVERY LAW
 * THAT GOVERNS IT*).
 *
 * THE RULING'S OWN WORDS: *the machine may propose the list from the counterparty, labelled as machine work,
 * and never sets it.* D-149 built the refusing half (`MACHINE_CANNOT_SET_LAWS`, C-32.18) and left the proposal
 * unbuilt; `store.mjs actionLaws` said so in its own comment. This suite holds the proposal to the two things
 * the row accepts it on, each in the direction that fails:
 *
 *   1. A PROPOSAL IS READ LABELLED MACHINE WORK — the label is the PLANE's answer about who proposed
 *      (`lawProposalLabel`), it carries the published sentence, and it is present on EVERY proposal rather
 *      than only on machine ones, so a surface that never learned the key cannot render a machine's citations
 *      as nobody's (`#mintLabel`'s reason, one construct over).
 *   2. THE ACTION'S LIST IS UNCHANGED UNTIL THE MEMBER ACTS — asserted about the BYTES (the stored document is
 *      byte-identical after a proposal), about the READ (`governing_laws` stays UNDETERMINED with its
 *      sentence), and ACROSS the member's act: once a member states the list it is the member's, the proposal
 *      still stands as machine work, and NOTHING in either answer relates the two.
 *
 * AND THE THINGS THAT WOULD MAKE EITHER CLAIM HOLLOW:
 *   3. A MEMBER'S PROPOSAL IS NOT MACHINE WORK — the over-strictness direction. A label that said "machine"
 *      for every proposer would pass every arm in section 1 while lying about half the corpus.
 *   4. THE SHAPE, through the SAME grammar the member's act uses: one helper (`#lawEntries`) judges a list of
 *      citations for both acts, so the four C-73 codes a member meets are the four a proposer meets, and a
 *      change to what a citation may be cannot reach one act and miss the other.
 *   5. ONE STANDING PROPOSAL PER PROPOSER: a proposer restating replaces its OWN rows and nobody else's, and
 *      two proposers' lists stand side by side.
 *   6. THE EMPTY ANSWER IS A STATEMENT, not an empty list (REC-146's finding on the pairing read), and the
 *      read's cut is published.
 *   7. THE PURGE TAKES THEM (D-113): a proposal outliving its action would be citations standing against a
 *      request the record no longer holds.
 *
 * NO NEW REFUSAL CODE IS MINTED BY THIS ITEM, and that is a decision rather than an omission. Every condition
 * this act can meet is one the plane already spells: the four shape codes come from the shared grammar
 * (C-73.2..5, whose `where` moved to `#lawEntries` with it), and NO_AUTHOR, NO_TARGET, NO_SUCH_BUNDLE and
 * NOT_AN_ACTION are already minted at several sites each and already roomless. Inventing a parallel family
 * would have told a reader the plane draws a distinction between a member's list and a machine's proposal AT
 * THE GRAMMAR, which it does not: the distinction is WHERE THE ROWS LIVE and WHOSE NAME IS ON THEM.
 *
 * WHAT THIS SUITE CANNOT SEE: whether a proposed citation is the RIGHT law for the agency asked — by design
 * nobody but a member can, and the plane does not try (D-149: the plane encodes no law's rules). It cannot see
 * WHERE a proposer got its citations: the plane stores what it was handed, under the proposer's name, and no
 * arm here is evidence that a proposal was derived from the counterparty rather than invented. It drives
 * Miniflare through the control plane — a real caller's route — and a green harness is not a serving build
 * (D-108).
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { LAW_LEVELS, GOVERNING_LAWS_MAX, GOVERNING_LAW_CHECKS, LAW_PROPOSAL_STATES,
         lawProposalLabel } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const PINNED_MS = Date.parse("2026-08-20T00:00:00Z");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r195", MEMBER_TOKEN: "mem-r195", PROBE_TOKEN: "prb-r195",
              VERSION: "test", BIO_NOW_MS: String(PINNED_MS) },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

/* THE OPS UNDER TEST, through the CONTROL PLANE, their names UNINTERPOLATED so coverage credits them. */
const propose = async (tok, target, laws) =>
  rP(await POST(`op=actionlawspropose&token=${tok}&target=${encodeURIComponent(target)}`, { laws }));
const actionlaws = async (tok, target, laws) =>
  rP(await POST(`op=actionlaws&token=${tok}&target=${encodeURIComponent(target)}`, { laws }));
const actionOf = async (tok, id) =>
  rP(await GET(`op=projection&token=${tok}&id=${encodeURIComponent(id)}`))?.action ?? null;
const textOf = async (tok, id) => {
  const f = rP(await GET(`op=file&token=${tok}&id=${encodeURIComponent(id)}&path=bundle.md`));
  return typeof f?.text === "string" ? f.text : "";
};

const actionMd = (id, { kind = "other", title = "Records request" } = {}) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "${title}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  `action_kind: ${kind}`, "risk_tier: 1",
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
  const add = rP(await POST("op=memberadd&token=adm-r195",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};

try {
const NADIA = await enrol("nadia", "nadia-passphrase-1", "admin");
/* The SECOND member of a group is an administrator (ADMINS_FIRST): administrative access is shared before
   there are ordinary members. Enrolled and otherwise unused — pilar is the ordinary member below. */
await enrol("omar", "omar-passphrase-1", "admin");
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member");

let snapKeySeq = 0;
const promote = async (tok, id, text, type = "action") =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: `${id}-new-${String(++snapKeySeq).padStart(4, "0")}`,
    files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }],
    register: [],
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "action" ? "planned" : "open", created: NOW, last_updated: LATER },
  }));

const ACT = "ACTN-2026-1495-oakland-request";
const BARE = "ACTN-2026-1496-nothing-proposed";
const INQ = "INQ-2026-1497-not-an-action";
/* Oakland's layers, as D-149's correction states them: a city agency is governed by the CPRA and the city's own
   sunshine ordinance — NOT by federal FOIA, which governs federal agencies only. */
const OAKLAND = [
  { level: "state", citation: "Cal. Gov. Code § 7920.000 et seq. (California Public Records Act)" },
  { level: "local", citation: "Oakland Municipal Code ch. 2.20 (Sunshine Ordinance)" },
];
const FEDERAL = [{ level: "federal", citation: "5 U.S.C. § 552 (FOIA)" }];

t("the fixtures land through op=promote (the corpus is non-empty before anything is asked of it)",
  [(await promote(NADIA, ACT, actionMd(ACT)))?.ok,
   (await promote(NADIA, BARE, actionMd(BARE)))?.ok,
   (await promote(NADIA, INQ, inquiryMd(INQ), "inquiry"))?.ok], [true, true, true]);

/* ===================================================================== */
console.log("--- 1. a machine's proposal is READ, and it is labelled machine work ---");
{
  const bytesBefore = await textOf(NADIA, ACT);
  const p = await propose("mem-r195", ACT, OAKLAND);
  t("a machine credential's proposal LANDS — the half D-149 left unbuilt, reached through the control plane",
    [p?.ok, p?.target, p?.proposal?.laws], [true, ACT, OAKLAND]);
  t("the act's own answer labels it machine work, names the credential that proposed, and carries the "
  + "PUBLISHED sentence rather than one of its own",
    [p?.proposal?.machine_work, p?.proposal?.state, p?.proposal?.by, p?.proposal?.says],
    [true, "machine_proposed", "class:member", LAW_PROPOSAL_STATES.machine_proposed]);
  t("the sentence says out loud that it is not the list and never becomes one on its own",
    [/That is machine work, labelled as machine work/.test(p?.proposal?.says ?? ""),
     /until a member states it themselves/.test(p?.proposal?.says ?? "")], [true, true]);

  const a = await actionOf(PILAR, ACT);
  const prop = a?.governing_laws_proposals?.proposals?.[0] ?? null;
  t("and the ACTION'S OWN READ carries it, in its own block, labelled the same way by the same reader",
    [a?.governing_laws_proposals?.proposals?.length, prop?.machine_work, prop?.state, prop?.by, prop?.laws],
    [1, true, "machine_proposed", "class:member", OAKLAND]);
  t("the label a reader is shown is the plane's own answer, composed in ONE place (the catalogue's) — not a "
  + "second composition that agrees with it for free",
    [prop?.state, prop?.machine_work, prop?.says],
    [lawProposalLabel("class:member").state, lawProposalLabel("class:member").machine_work,
     lawProposalLabel("class:member").says]);
  t("the block SAYS what it holds and how much of it is machine work",
    /1 proposal of the laws that govern this action, 1 of them machine work/.test(
      a?.governing_laws_proposals?.says ?? ""), true);
  t("PROPOSING WROTE NO BYTES: the stored document (a real one) is byte-identical after the proposal",
    [bytesBefore.length > 600, sha(await textOf(NADIA, ACT))], [true, sha(bytesBefore)]);
}

/* ===================================================================== */
console.log("\n--- 2. the action's list is UNCHANGED until the member acts ---");
{
  const a = await actionOf(PILAR, ACT);
  t("THE LIST IS THE MEMBER'S: a proposal standing against this action, and the list still reads UNDETERMINED "
  + "with its own sentence, nobody named, no level asserted",
    [a?.governing_laws?.state, a?.governing_laws?.laws, a?.governing_laws?.by,
     JSON.stringify(a?.governing_laws).match(/"level"/g)],
    ["undetermined", [], null, null]);
  t("...and the undetermined sentence is unchanged by the proposal's existence — it still says the record "
  + "assumes no law, never that one was proposed",
    [/^UNDETERMINED: no member has stated which laws govern this action/.test(a?.governing_laws?.stated ?? ""),
     /propos/i.test(a?.governing_laws?.stated ?? "")], [true, false]);
  t("the act's own answer said the same thing at the time it wrote the proposal — read through the ONE reader "
  + "of the list, so the act and the action's read cannot disagree about whose it is",
    (await propose("mem-r195", BARE, OAKLAND))?.governing_laws?.state, "undetermined");

  /* THE MEMBER ACTS. The list becomes the member's; the proposal stays what it was. */
  const set = await actionlaws(PILAR, ACT, OAKLAND);
  const after = await actionOf(PILAR, ACT);
  t("a member states the list and it is THEIRS — attributed to the member, not to the machine that proposed "
  + "the same citations",
    [set?.ok, after?.governing_laws?.state, after?.governing_laws?.by, after?.governing_laws?.laws],
    [true, "stated", "pilar", OAKLAND]);
  t("the machine's proposal still stands, still labelled machine work, still not the list",
    [after?.governing_laws_proposals?.proposals?.[0]?.machine_work,
     after?.governing_laws_proposals?.proposals?.[0]?.by], [true, "class:member"]);
  t("AND NOTHING RELATES THEM: neither answer says the member adopted, accepted or acted on the proposal — "
  + "why somebody acted is a claim about a person and the record cannot support it",
    /adopt|accepted|acted on|from the proposal|because/i.test(JSON.stringify(
      [after?.governing_laws, after?.governing_laws_proposals])), false);
  t("the member's act carries no proposal key at all, and the proposal's answer carried no list key beyond "
  + "the state of the member's own",
    ["proposal" in (set ?? {}), Object.keys((set ?? {})).includes("governing_laws_proposals")], [false, false]);
}

/* ===================================================================== */
console.log("\n--- 3. OVER-STRICTNESS: a member's proposal is a proposal, and is NOT machine work ---");
{
  const p = await propose(NADIA, BARE, OAKLAND);
  t("a signed-in member may propose — D-149 says a machine MAY, not that nobody else may — and is named",
    [p?.ok, p?.proposal?.by, p?.proposal?.state, p?.proposal?.machine_work],
    [true, "nadia", "member_proposed", false]);
  t("...with its own published sentence, which does not call a member's proposal machine work",
    [p?.proposal?.says, /machine work/.test(p?.proposal?.says ?? "")],
    [LAW_PROPOSAL_STATES.member_proposed, false]);
  const a = await actionOf(NADIA, BARE);
  t("the read holds BOTH proposals apart, each under its own proposer, and counts only one as machine work",
    [a?.governing_laws_proposals?.proposals?.length,
     a?.governing_laws_proposals?.proposals?.filter((x) => x.machine_work).length,
     /2 proposals of the laws that govern this action, 1 of them machine work/
       .test(a?.governing_laws_proposals?.says ?? "")], [2, 1, true]);
  t("THE LABEL BLOCK IS ON EVERY PROPOSAL, not only on machine ones — a key that appears only for machines "
  + "makes ABSENCE carry the meaning, and a surface that never learned it renders a machine's citations as "
  + "nobody's",
    a?.governing_laws_proposals?.proposals?.every((x) =>
      "machine_work" in x && "state" in x && "by" in x && "says" in x), true);
}

/* ===================================================================== */
console.log("\n--- 4. the shape, judged by the SAME grammar the member's act is judged by ---");
{
  const cases = [
    ["NO_LAWS", [], "C-73.2"],
    ["BAD_LAW_LEVEL", [{ level: "municipal", citation: "Oakland Municipal Code ch. 2.20" }], "C-73.3"],
    ["BAD_CITATION", [{ level: "local", citation: "" }], "C-73.4"],
    ["BAD_CITATION", [{ level: "local", citation: `He said "no"` }], "C-73.4"],
    ["BAD_CITATION", [OAKLAND[0], OAKLAND[0]], "C-73.4"],
    ["TOO_MANY_LAWS", Array.from({ length: GOVERNING_LAWS_MAX + 1 },
      (_, i) => ({ level: "local", citation: `Ordinance ${i}` })), "C-73.5"],
  ];
  for (const [code, laws, check] of cases) {
    const r = await propose("mem-r195", ACT, laws);
    t(`a proposal ${code === "NO_LAWS" ? "of nothing" : `whose list meets ${code}`} is refused ${code}, with `
    + `the SAME C-number a member meets at op=actionlaws (${check})`,
      [r?.ok, r?.reason, r?.check, GOVERNING_LAW_CHECKS[code].check], [false, code, check, check]);
  }
  t("a refused proposal wrote nothing: the standing proposal is still the one that landed",
    (await actionOf(NADIA, ACT))?.governing_laws_proposals?.proposals?.[0]?.laws, OAKLAND);
  t("the three levels are the catalogue's own, and a proposal is judged against the same array the act is",
    LAW_LEVELS, ["federal", "state", "local"]);
  const noTarget = rP(await POST(`op=actionlawspropose&token=mem-r195`, { laws: OAKLAND }));
  t("no target is refused NO_TARGET", [noTarget?.ok, noTarget?.reason], [false, "NO_TARGET"]);
  const ghost = await propose("mem-r195", "ACTN-2026-9999-nowhere", OAKLAND);
  t("an action that does not exist (or that this caller may not see) is refused NO_SUCH_BUNDLE",
    [ghost?.ok, ghost?.reason], [false, "NO_SUCH_BUNDLE"]);
  const wrong = await propose("mem-r195", INQ, OAKLAND);
  t("a question is not an action: refused NOT_AN_ACTION, because governing laws are a REQUEST's",
    [wrong?.ok, wrong?.reason, wrong?.object_type], [false, "NOT_AN_ACTION", "inquiry"]);
  /* MEASURED, NOT PREDICTED: the probe credential is fenced OUT OF SIGHT of this corpus, so its proposal is
     refused NO_SUCH_BUNDLE for an action that plainly exists — the fail-closed viewer stamp doing its job at a
     new door, and the reason the stamp is on this op at all. An action a caller may not see must refuse
     exactly as an absent one does, or the act becomes a way to learn that an action exists by proposing
     against it. Recorded as an arm rather than smoothed away: the first draft of section 2 drove this op with
     the probe and read the refusal as a defect in the op. */
  const probe = await propose("prb-r195", ACT, OAKLAND);
  t("a credential that cannot SEE the action is refused exactly as it would be for one that does not exist",
    [probe?.ok, probe?.reason], [false, "NO_SUCH_BUNDLE"]);
}

/* ===================================================================== */
console.log("\n--- 5. one standing proposal per proposer: a restatement replaces its OWN and nobody else's ---");
{
  const again = await propose("mem-r195", BARE, FEDERAL);
  const a = await actionOf(NADIA, BARE);
  const mine = a?.governing_laws_proposals?.proposals?.find((x) => x.by === "class:member") ?? null;
  const theirs = a?.governing_laws_proposals?.proposals?.find((x) => x.by === "nadia") ?? null;
  t("the same proposer restating replaces its own list whole",
    [again?.ok, mine?.laws], [true, FEDERAL]);
  t("...and the OTHER proposer's proposal is untouched, still theirs, still two proposals in all",
    [theirs?.laws, theirs?.by, a?.governing_laws_proposals?.proposals?.length], [OAKLAND, "nadia", 2]);
  t("the action's list is STILL undetermined after three proposals and one restatement: no number of "
  + "proposals is a statement",
    a?.governing_laws?.state, "undetermined");
}

/* ===================================================================== */
console.log("\n--- 6. the empty answer is a STATEMENT, and the cut is published ---");
{
  const fresh = "ACTN-2026-1498-untouched";
  t("a fourth action lands", (await promote(NADIA, fresh, actionMd(fresh)))?.ok, true);
  const a = await actionOf(PILAR, fresh);
  const blk = a?.governing_laws_proposals ?? null;
  t("an action nobody proposed for answers with an empty list AND a sentence — never a bare [], which on this "
  + "surface would read as 'nothing applies'",
    [blk?.proposals, blk?.truncated,
     /no proposal of the laws governing this action stands in the record/.test(blk?.says ?? "")],
    [[], false, true]);
  t("and the sentence states what its emptiness is ABOUT, and is not a claim about the law",
    [/a statement about proposals and about nothing else/.test(blk?.says ?? ""),
     /governs|applies to this agency/.test((blk?.says ?? "").replace(/whether any law governs this request is answered beside this/, ""))],
    [true, false]);
  t("the read publishes its own bound rather than implying there are no more",
    blk?.limit, 12);
}

/* ===================================================================== */
console.log("\n--- 7. the whole-store purge takes the proposals with the actions (D-113) ---");
{
  const pg = rP(await POST("op=purge&token=adm-r195&confirm=bio", {}));
  /* The counter is the purge's proof and counts ROWS, one per proposed citation — three standing proposals
     across two actions: the machine's two on ACT, the machine's one and the member's two on BARE. */
  t("op=purge ALL reports the governing-law proposal rows it took — three standing proposals, five citations",
    [pg?.ok, pg?.removed?.actionLawProposals], [true, 5]);
  t("and nothing is left to read: the action is gone with its proposals",
    await actionOf(NADIA, ACT), null);
}

} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  fail++;
}

await mf.dispose();
console.log(`\nrec195-laws-proposal: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
