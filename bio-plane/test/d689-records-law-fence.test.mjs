/* NEGATIVE CONTROL: (RUN 2026-09-25 by the D-689 worker on land/worker/D-689 over REC-201 @ 45ce0bc5, each arm ALONE on
   src/store.mjs, restored by cp from a uniquely-named per-arm pristine copy in the session scratchpad and verified by
   sha256 d4ce2471e08a… AND cmp at 3,478,649 B, floored; baseline 28 pass / 0 fail here and machine-fences 92/0.)
   (A) THE ROW'S CONTROL, FIRST SPELLING — the fence's CALL in promote, `if (machineLaw)` -> `if (false && machineLaw)`.
   DECLARED: §3's refusals fail by name. ACTUAL: this suite DIED BEFORE ITS FOOT (tally -1) at its own guard "(the
   fence's call is found exactly ONCE in the copy…)", because §2a builds the pre-fence plane by disarming that SAME
   line and the arm had already rewritten it. A finding about the ARM, not the subject; machine-fences failed as
   declared (below). Re-spelled at the fence's region as (A2), which moves the same condition and leaves §2a's
   anchor alone. (A2) THE ROW'S CONTROL — lift the fence at is-machine-state-records-law, `if (false && (!who || …`.
   DECLARED: §3's machine refusals and §5's change/removal/retype refusals fail; §1, §2b's MACHINE-STATED reads and
   §4 hold. ACTUAL 21/7, AS DECLARED, the first failure BY NAME "an `ai` credential CREATING a cpra_request is
   refused BY NAME — MACHINE_CANNOT_STATE_RECORDS_LAW, C-32.20…", and the pre-fence machine row STILL read
   MACHINE-STATED (the read does not rest on the fence). Plus one downstream: §3's member over-strictness arm, whose
   id the machine's creation had already taken. machine-fences 87/5: block xvi's pin, its two follow-ons, and
   section 3's own-name set arm. (B) THE READ LIES — #recordsLawStatedBy answers `member` for every author.
   DECLARED: §2's MACHINE-STATED arms fail; §3-§5's fence arms hold. ACTUAL 25/3, AS DECLARED. (C) LAST WRITER, NOT
   INTRODUCER — the walk stops at the latest version. DECLARED: the two carry-forward attribution arms fail. ACTUAL
   26/2, AS DECLARED ("…STILL reads MACHINE-STATED — she carried it, she did not state it" and "…the law still reads
   as hers"). (D) OVER-STRICTNESS, A PRESENCE NOT A CHANGE — `nextKey !== heldKey` -> `nextKey !== null`. DECLARED:
   the carry-forward arms fail. ACTUAL 24/4: both carry-forward arms, plus §5's REMOVAL arm — a removal states
   nothing, so a presence fence ADMITS it: the spelling is over-strict and under-strict at once, found rather than
   declared — and the retype arm downstream of it (its base went stale when the removal landed); and machine-fences 90/2, block xv's two
   RISK-TIER carry-forward arms, whose fixture is a member's cpra_request a machine revises — the over-strict fence
   caught in a second suite. (E) RESPELLED — `nextKey !== heldKey && !(who && !isMachineIdentity(who))`. DECLARED all
   green. ACTUAL 28/0 and 92/0, AS DECLARED. */
/* D-689: A MACHINE MAY ONLY PROPOSE THE LAW A RECORDS REQUEST IS MADE UNDER (BOB #35, 2026-09-25 08:25Z, (b) FENCE
 * BOTH, from DEC-24 and D-149; `docs/architecture/BIO_Case_Making_v0_1.md` §2, *A RECORDS REQUEST NAMES EVERY LAW
 * THAT GOVERNS IT*).
 *
 * *Which law governs a request is a characterization the member makes and answers for.* So a machine credential may
 * neither CREATE a `cpra_request` (the kind names the California Public Records Act) nor state a `records_request`'s
 * `law`. It may PROPOSE either (REC-195's `op=actionlawspropose`), labelled as machine work, and a member's own act
 * adopts. Existing rows are not rewritten: a `cpra_request` a machine created reads MACHINE-STATED from its recorded
 * author class, never as a member's statement.
 *
 * WHAT THIS SUITE HOLDS THE ROW TO, each in the direction that fails:
 *   1. THE ONE KEY AND THE WORDS: `recordsLawStatement` is what counts as stating the law; a machine-written statement
 *      reads MACHINE-STATED in both sentences, and the sentences a member's statement reads are REC-201's and
 *      D-149's BYTE FOR BYTE.
 *   2. THE PRE-FENCE ROW, MADE BY A PRE-FENCE PLANE: this suite runs a COPY of `src/` with the fence's one call
 *      disarmed (and nothing else), lets an `ai` credential create a cpra_request there, and then reopens the SAME
 *      persisted store under the real plane. That row reads MACHINE-STATED, its bytes unchanged — and a member
 *      revising its plan does not turn it into a member's statement (carrying forward is not adopting).
 *   3. THE FENCE, BY NAME: an `ai` credential creating a cpra_request, or a records_request stating a `law`, is
 *      refused MACHINE_CANNOT_STATE_RECORDS_LAW with C-32.20 and its translation on the wire, and nothing lands.
 *   4. PROPOSE, THEN A MEMBER ADOPTS: the machine creates a records_request stating no law (it may) and proposes the
 *      law; a member's revision states it, and the read names the member.
 *   5. A CHANGE, NEVER A PRESENCE: a machine's revision carrying the member's law forward lands; one that changes or
 *      removes it is refused by the same name (BOB #32's rule for the tier, applied); a machine's revision that
 *      states nothing about the law lands.
 *
 * WHAT IT CANNOT SEE: whether the law stated is the RIGHT one — nobody but a member can say, by design. And the
 * pre-fence plane is this tree with the fence disarmed, not the historical build: every other behaviour it has is
 * today's, which is the point (one variable moved), and it is why the row it writes stands in for one written before
 * the fence rather than being one.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { recordsLawOf, recordsLawStatement, governingLawsOf, MACHINE_FENCE_CHECKS } from "../checks/bio-checks.mjs";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = join(PLANE, "..");
const IDX = join(PLANE, "src", "index.mjs");
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const PINNED_MS = Date.parse("2026-08-20T00:00:00Z");
const PERSIST = mkdtempSync(join(tmpdir(), "d689-persist-"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const codeOf = (r) => (r && typeof r.reason === "string") ? r.reason : (r && typeof r.code === "string") ? r.code : null;

const mk = (scriptPath) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath, script: readFileSync(scriptPath, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d689", MEMBER_TOKEN: "mem-d689", PROBE_TOKEN: "prb-d689",
              VERSION: "test", BIO_NOW_MS: String(PINNED_MS) },
  defaultPersistRoot: PERSIST,
});
let mf = null;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const login = async (memberId, password) => {
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg?.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};

const actionMd = (id, { kind = "records_request", law = null, plan = "Ask for the transfer ledger." } = {}) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Records request ${id}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  `action_kind: ${kind}`, "risk_tier: undetermined",
  ...(law === null ? [] : [`law: "${law}"`]),
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "",
  "## Plan", "", plan, "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

let snapKeySeq = 0;
const promote = async (tok, id, text, base = null) =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `${id}-${base ? "rev" : "new"}-${String(++snapKeySeq).padStart(4, "0")}`,
    files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }],
    register: [],
    meta: { object_type: "action", group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: "planned", created: NOW, last_updated: LATER },
  }));
const view = async (tok, id) => rP(await GET(`op=projection&token=${tok}&id=${encodeURIComponent(id)}`)) ?? null;
const textOf = async (tok, id) => {
  const f = rP(await GET(`op=file&token=${tok}&id=${encodeURIComponent(id)}&path=bundle.md`));
  return typeof f?.text === "string" ? f.text : "";
};

const CPRA_SENTENCE = "UNDETERMINED: no member has stated which laws govern this action. The record assumes none — not "
  + "federal law, not state law, not a local ordinance. Which laws apply follows the agency asked, and a member states "
  + "them, each by citation. This action's kind, cpra_request, is its member's statement that the California Public "
  + "Records Act governs it; nothing else is inferred from the kind.";
const WA_LAW = "Wash. Rev. Code ch. 42.56 (Public Records Act)";

/* ===================================================================== */
console.log("\n--- 1. the one key, and the words a machine's statement reads in ---");
{
  t("recordsLawStatement: a cpra_request states the CPRA; a records_request states its law; nothing else states one",
    [recordsLawStatement({ action_kind: "cpra_request" }),
     recordsLawStatement({ action_kind: "records_request", law: WA_LAW }),
     recordsLawStatement({ action_kind: "records_request" }),
     recordsLawStatement({ action_kind: "records_request", law: "  " }),
     recordsLawStatement({ action_kind: "other", law: WA_LAW }),
     recordsLawStatement(null)],
    [JSON.stringify(["cpra_request", null]), JSON.stringify(["records_request", WA_LAW]), null, null, null, null]);
  const cpra = { action_kind: "cpra_request" };
  const wa = { action_kind: "records_request", law: WA_LAW };
  t("OMITTED or MEMBER, both readers answer exactly as REC-201 and D-149 shipped — the member's sentence is not moved",
    [JSON.stringify(recordsLawOf(cpra, { class: "member", by: "ruth", at: NOW }).stated),
     governingLawsOf(cpra).stated, governingLawsOf(cpra, { class: "member", by: "ruth" }).stated,
     governingLawsOf(wa, { class: "member", by: "ruth" }).stated === governingLawsOf(wa).stated],
    [JSON.stringify(recordsLawOf(cpra).stated), CPRA_SENTENCE, CPRA_SENTENCE, true]);
  const m = { class: "machine", by: "token:ai", at: NOW };
  t("a MACHINE-written cpra_request reads MACHINE-STATED in both sentences, and never as a member's statement",
    [/MACHINE-STATED/.test(recordsLawOf(cpra, m).stated), /MACHINE-STATED, not a member's statement/.test(governingLawsOf(cpra, m).stated),
     /is its member's statement/.test(governingLawsOf(cpra, m).stated), recordsLawOf(cpra, m).stated_by],
    [true, true, false, m]);
  t("a MACHINE-written law on a records_request reads MACHINE-STATED, the citation still verbatim",
    [recordsLawOf(wa, m).law, /MACHINE-STATED/.test(recordsLawOf(wa, m).stated),
     /MACHINE-STATED, not a member's statement/.test(governingLawsOf(wa, m).stated),
     /as its author's statement/.test(governingLawsOf(wa, m).stated)],
    [WA_LAW, true, true, false]);
  const u = { class: "undetermined", by: null, at: null };
  t("an UNDETERMINED author is said, and is not read as a member's statement",
    [/not recorded/.test(recordsLawOf(cpra, u).stated), /is its member's statement/.test(governingLawsOf(cpra, u).stated)],
    [true, false]);
  t("the catalogue row: C-32.20, sited at its one region, with a canned translation",
    [MACHINE_FENCE_CHECKS.MACHINE_CANNOT_STATE_RECORDS_LAW?.check,
     MACHINE_FENCE_CHECKS.MACHINE_CANNOT_STATE_RECORDS_LAW?.where,
     typeof MACHINE_FENCE_CHECKS.MACHINE_CANNOT_STATE_RECORDS_LAW?.translation],
    ["C-32.20", "src/store.mjs #machineRecordsLawRefusal > is-machine-state-records-law", "string"]);
}

/* ===================================================================== */
console.log("\n--- 2a. a PRE-FENCE plane: this tree with the fence's one call disarmed, and nothing else ---");
const OLD_MACHINE = "ACTN-2026-6890-cpra-by-machine";
const OLD_MEMBER = "ACTN-2026-6891-cpra-by-member";
const oldMachineMd = actionMd(OLD_MACHINE, { kind: "cpra_request" });
let AI_TOKEN = null;
{
  const tree = mkdtempSync(join(tmpdir(), "d689-prefence-"));
  cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
  cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
  cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
  const storePath = join(tree, "bio-plane", "src", "store.mjs");
  const src = readFileSync(storePath, "utf8");
  const ANCHOR = "        if (machineLaw) return machineLaw;\n";
  const n = src.split(ANCHOR).length - 1;
  t("(the fence's call is found exactly ONCE in the copy, so the pre-fence plane moves one variable)", n, 1);
  if (n !== 1) throw new Error(`pre-fence anchor found ${n} times`);
  writeFileSync(storePath, src.replace(ANCHOR, "        if (false && machineLaw) return machineLaw;   /* PRE-FENCE */\n"));

  mf = mk(join(tree, "bio-plane", "src", "index.mjs"));
  const add = rP(await POST("op=memberadd&token=adm-d689",
    { memberId: "ruth", cover: "cover for ruth", role: "admin", capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add?.invite, handle: "ruth", password: "ruth-passphrase-1" }));
  if (!en?.ok) throw new Error(`enroll ruth: ${JSON.stringify(en)}`);
  const RUTH0 = await login("ruth", "ruth-passphrase-1");
  const minted = rP(await POST(`op=aicredentialmint&token=${RUTH0}`, {
    tokenId: "d689-machine", principalKind: "member", principalMember: "ruth",
    taskScope: "D-689's own: create and revise records requests, and propose their law",
    writes: ["promote", "actionlawspropose"],
    note: "D-689. A member authored this scope so the credential layer is held open and the identity fence answers." }));
  if (!minted?.ok) throw new Error(`mint: ${JSON.stringify(minted).slice(0, 400)}`);
  AI_TOKEN = minted.token;

  const old = await promote(AI_TOKEN, OLD_MACHINE, oldMachineMd);
  t("PRE-FENCE: the `ai` credential's cpra_request LANDS, as every one did before this row", old?.ok, true);
  t("...and the pre-fence plane already read it as MACHINE-STATED from its author stamp (the read is not the fence)",
    (await view(RUTH0, OLD_MACHINE))?.action?.law?.stated_by?.class, "machine");
  const mem = await promote(RUTH0, OLD_MEMBER, actionMd(OLD_MEMBER, { kind: "cpra_request" }));
  t("PRE-FENCE: a member's cpra_request lands beside it", mem?.ok, true);
  await mf.dispose();
}

/* ===================================================================== */
console.log("\n--- 2b. the real plane, over the SAME store: the pre-fence rows read as what they are ---");
mf = mk(IDX);
const RUTH = await login("ruth", "ruth-passphrase-1");
{
  const a = (await view(RUTH, OLD_MACHINE))?.action ?? null;
  t("the pre-fence MACHINE cpra_request reads MACHINE-STATED from its recorded author class — kind unchanged, "
  + "the author named, the member's sentence NOT used",
    [a?.kind, a?.law?.state, a?.law?.stated_by?.class, a?.law?.stated_by?.by,
     /MACHINE-STATED/.test(a?.law?.stated ?? ""), /MACHINE-STATED, not a member's statement/.test(a?.governing_laws?.stated ?? ""),
     a?.governing_laws?.stated === CPRA_SENTENCE],
    ["cpra_request", "kind", "machine", "token:ai", true, true, false]);
  t("...and it is NEVER REWRITTEN: its stored bytes are the bytes the machine filed",
    sha(await textOf(RUTH, OLD_MACHINE)), sha(oldMachineMd));
  const b = (await view(RUTH, OLD_MEMBER))?.action ?? null;
  t("the pre-fence MEMBER cpra_request reads as its member's statement, D-149's sentence byte for byte",
    [b?.law?.stated_by?.class, b?.law?.stated_by?.by, b?.governing_laws?.stated], ["member", "ruth", CPRA_SENTENCE]);

  /* CARRYING FORWARD IS NOT ADOPTING. A member revising the plan of the machine's cpra_request does not make the
     machine's statement hers; the read names who INTRODUCED the statement, not who wrote last. */
  const base = (await view(RUTH, OLD_MACHINE))?.bundle_sha;
  const rev = await promote(RUTH, OLD_MACHINE, actionMd(OLD_MACHINE, { kind: "cpra_request", plan: "Ask for the ledger and the memo." }), base);
  t("a member's revision of the plan lands, and the kind STILL reads MACHINE-STATED — she carried it, she did not state it",
    [rev?.ok, (await view(RUTH, OLD_MACHINE))?.action?.law?.stated_by?.class], [true, "machine"]);
  const base2 = (await view(RUTH, OLD_MACHINE))?.bundle_sha;
  const mrev = await promote(AI_TOKEN, OLD_MACHINE,
    actionMd(OLD_MACHINE, { kind: "cpra_request", plan: "Ask for the ledger, the memo and the index." }), base2);
  t("a machine's revision CARRYING the pre-fence kind forward lands — the fence asks a change, and the row is not "
  + "rewritten", [mrev?.ok, (await view(RUTH, OLD_MACHINE))?.action?.kind], [true, "cpra_request"]);
}

/* ===================================================================== */
console.log("\n--- 3. the fence, by name: a machine states no law ---");
{
  const CPRA = "ACTN-2026-6892-cpra-refused";
  const m = await POST(`op=promote&token=${AI_TOKEN}`, {
    bundleId: CPRA, base: null, snapKey: `${CPRA}-new-${String(++snapKeySeq).padStart(4, "0")}`,
    files: [{ path: "bundle.md", text: actionMd(CPRA, { kind: "cpra_request" }), bytes: Buffer.byteLength(actionMd(CPRA, { kind: "cpra_request" })), sha256: sha(actionMd(CPRA, { kind: "cpra_request" })) }],
    register: [], meta: { object_type: "action", group: "believe-in-oakland", title: `Bundle ${CPRA}`,
                          current_state: "planned", created: NOW, last_updated: LATER } });
  const row = MACHINE_FENCE_CHECKS.MACHINE_CANNOT_STATE_RECORDS_LAW;
  t("an `ai` credential CREATING a cpra_request is refused BY NAME — MACHINE_CANNOT_STATE_RECORDS_LAW, C-32.20, the "
  + "canned translation on the wire",
    [codeOf(rP(m)), m?.check ?? rP(m)?.check, (m?.translation ?? rP(m)?.translation) === row.translation],
    ["MACHINE_CANNOT_STATE_RECORDS_LAW", "C-32.20", true]);
  t("...nothing landed", (await view(RUTH, CPRA))?.bundle_sha ?? null, null);
  const WA = "ACTN-2026-6893-wa-refused";
  const w = await promote(AI_TOKEN, WA, actionMd(WA, { law: WA_LAW }));
  t("an `ai` credential creating a records_request STATING a law is refused by the same name, and nothing landed",
    [codeOf(w), (await view(RUTH, WA))?.bundle_sha ?? null], ["MACHINE_CANNOT_STATE_RECORDS_LAW", null]);
  const r = await promote(RUTH, CPRA, actionMd(CPRA, { kind: "cpra_request" }));
  t("OVER-STRICTNESS: the SAME cpra_request creates for a signed-in member, and reads as hers",
    [r?.ok, (await view(RUTH, CPRA))?.action?.law?.stated_by?.class], [true, "member"]);
}

/* ===================================================================== */
console.log("\n--- 4. propose, then a member adopts ---");
const PROP = "ACTN-2026-6894-proposed";
{
  const c = await promote(AI_TOKEN, PROP, actionMd(PROP));
  const a0 = (await view(RUTH, PROP))?.action ?? null;
  t("a machine MAY create the law-neutral records_request stating no law — it reads UNDETERMINED, nobody named",
    [c?.ok, a0?.law?.state, a0?.law?.law, a0?.law?.stated_by ?? null], [true, "undetermined", null, null]);
  const p = rP(await POST(`op=actionlawspropose&token=${AI_TOKEN}&target=${PROP}`,
    { laws: [{ level: "state", citation: WA_LAW }] }));
  const a1 = (await view(RUTH, PROP))?.action ?? null;
  t("...and PROPOSES the law: the proposal stands labelled machine work, and the action's law is still undetermined",
    [p?.ok, p?.proposal?.machine_work, a1?.governing_laws_proposals?.proposals?.[0]?.laws?.[0]?.citation, a1?.law?.state],
    [true, true, WA_LAW, "undetermined"]);
  const adopt = await promote(RUTH, PROP, actionMd(PROP, { law: WA_LAW }), (await view(RUTH, PROP))?.bundle_sha);
  const a2 = (await view(RUTH, PROP))?.action ?? null;
  t("a MEMBER ADOPTS it by her own act: her revision states the law, and the read names her, not the proposer",
    [adopt?.ok, a2?.law?.state, a2?.law?.law, a2?.law?.stated_by?.class, a2?.law?.stated_by?.by, /MACHINE-STATED/.test(a2?.law?.stated ?? "")],
    [true, "stated", WA_LAW, "member", "ruth", false]);
}

/* ===================================================================== */
console.log("\n--- 5. a change, never a presence ---");
{
  const carry = await promote(AI_TOKEN, PROP, actionMd(PROP, { law: WA_LAW, plan: "Ask for the port's lease files." }),
    (await view(RUTH, PROP))?.bundle_sha);
  t("a machine's revision CARRYING the member's law forward lands, and the law still reads as hers",
    [carry?.ok, (await view(RUTH, PROP))?.action?.law?.stated_by?.by], [true, "ruth"]);
  const before = (await view(RUTH, PROP))?.bundle_sha;
  const changed = await promote(AI_TOKEN, PROP, actionMd(PROP, { law: "5 U.S.C. § 552", plan: "Ask for the port's lease files." }), before);
  t("a machine's revision CHANGING the law is refused by name, and the version did not move",
    [codeOf(changed), (await view(RUTH, PROP))?.bundle_sha === before], ["MACHINE_CANNOT_STATE_RECORDS_LAW", true]);
  const removed = await promote(AI_TOKEN, PROP, actionMd(PROP, { plan: "Ask for the port's lease files." }), before);
  t("a machine's revision REMOVING the member's law is refused by the same name (BOB #32's rule for the tier, applied)",
    [codeOf(removed), (await view(RUTH, PROP))?.action?.law?.law], ["MACHINE_CANNOT_STATE_RECORDS_LAW", WA_LAW]);
  const retyped = await promote(AI_TOKEN, PROP, actionMd(PROP, { kind: "cpra_request", plan: "Ask for the port's lease files." }), before);
  t("a machine's revision turning it into a cpra_request is refused by the same name",
    codeOf(retyped), "MACHINE_CANNOT_STATE_RECORDS_LAW");
  const OTHER = "ACTN-2026-6895-other";
  await promote(RUTH, OTHER, actionMd(OTHER, { kind: "other" }));
  const neutral = await promote(AI_TOKEN, OTHER, actionMd(OTHER, { kind: "records_request" }), (await view(RUTH, OTHER))?.bundle_sha);
  t("OVER-STRICTNESS: a machine's revision that states NOTHING about the law (other -> a records_request naming none) lands",
    [neutral?.ok, (await view(RUTH, OTHER))?.action?.law?.state], [true, "undetermined"]);
  /* LAST, because it writes `governing_laws` into PROP's bytes and every revision above re-sends the document whole. */
  const list = rP(await POST(`op=actionlaws&token=${RUTH}&target=${PROP}`, { laws: [{ level: "state", citation: WA_LAW }] }));
  t("...and the proposal's LIST is adopted by op=actionlaws, the member's act D-149 built", [list?.ok, list?.by], [true, "ruth"]);
}

await mf.dispose();
console.log(`\nd689-records-law-fence: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
