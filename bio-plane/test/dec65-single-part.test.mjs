/* NEGATIVE CONTROL: RUN 2026-08-09 (PL-19) through `test/dec65-single-part.control.mjs` — SEVEN arms including a BASELINE and an OVER-STRICTNESS arm, each armed ALONE with every other defence held OPEN, every restore verified by sha256 AND by `cmp` against a uniquely-named per-arm pristine copy with a byte count printed and floored against the empty-string digest; zero restore problems. Whole: 37 pass, 0 fail. (0) baseline 37/0 · (1) PL-3's guard reverted to refusing on ANY leg -> 28/9, THE ARM THAT PROVES THIS HAD TO BE ONE ITEM: C-25.6 fully wired and the feature still unreachable through the op · (2) the licence widened to any number of parts -> 32/5 · (3) the stamp reverted so a machine's row carries its own identity -> 28/9 · (4) C-25.6's licence removed -> 34/3 · (5) `none:` added to MACHINE_STAMP_PREFIXES, the wrong fix PL-17 recorded -> 36/1 · (6) OVER-STRICTNESS, the value re-spelled -> 37/0. THREE ARMS CAME BACK OTHER THAN DECLARED AND ALL THREE ARE IN THAT DRIVER'S HEADER RATHER THAN SMOOTHED: (2) showed the two sites are NOT redundant — widen the guard and a clean named refusal becomes one in another family's words; (4) showed my own declaration was wrong about what the patch does, and that the check half's contribution is the BOUND rather than the admission; and (5) showed PL-17's recorded wrong fix NO LONGER REFUSES the value at all, because PL-19 wired the check through the sufficiency predicate whose arm ordering PL-17 built for exactly this — the claim measured against the patch it was written to survive. TO RE-RUN IT IN ONE STEP: `node test/dec65-single-part.control.mjs` from `bio-plane/`. */

/* PL-19 / DEC-65 SHAPE (b) — THE SINGLE-PART LICENCE, AT BOTH SITES.
 *
 * THE RULING. DEC-65 was answered 2026-08-09 by session BOB under Bob's
 * standing delegation, and enacted by CONDUCT in three steps. Step one was
 * PL-17: mint an explicit "no independent-sufficiency claim was made" value for
 * a field whose published meaning is *a member said this part is enough on its
 * own*, so a machine's ground row never wears a member's meaning. THIS IS STEP
 * TWO: land the exemption itself.
 *
 * WHY IT IS ONE ITEM AND NOT TWO, WHICH IS THE MEASUREMENT THAT SHAPED IT.
 * FL-3 measured that PL-3's endpoint guard in `src/store.mjs` refuses on
 * `legsIn.length > 0` — ANY leg at all, whatever the partition — and therefore
 * FIRES FIRST. Amending `C-25.6` alone would have landed, passed its own suite,
 * and changed no behaviour a caller could reach. So this suite drives BOTH, and
 * drives the endpoint FIRST, in the order the plane meets them.
 *
 * THE LICENCE, AND ITS BOUND. A machine credential may compose a reading that
 * declares EXACTLY ONE part. The argument is arithmetic and is the whole of it:
 * with one part there is no MAXIMUM to take, so §12 derives the same
 * conservative weakest-leg answer whether or not anybody asserted independent
 * sufficiency, and no member is credited with a structural claim they did not
 * make. TWO parts is a different thing — there the maximum is live — and this
 * state does not license it. Both directions are driven here, because a licence
 * asserted only on the side that passes is a licence with no bound.
 *
 * WHAT IS ASSERTED, each in the direction that fails:
 *
 *   1. THE FIXTURE ARMS. The credential this suite calls a machine really is
 *      one by the plane's OWN predicate, and the inquiry really holds legs.
 *      An arm that did not arm is a finding, and a licence measured under a
 *      member's token would be measuring nothing.
 *
 *   2. THE SITE THAT FIRES FIRST (`src/store.mjs`, `SUGGEST_UNWRITABLE_STATE`).
 *      One part LANDS; two parts is REFUSED BY NAME; legs with NO declared part
 *      is refused; one part declared TWICE is refused. Through `op=suggest`.
 *
 *   3. THE STAMP, WHICH IS THE POINT OF THE THIRD STATE. The landed row carries
 *      `SUFFICIENCY_UNCLAIMED` and NEVER the composer's machine identity — read
 *      back out of THE RECORD's own bytes and cross-checked against
 *      `op=basisversions`, never off the candidate the caller sent.
 *
 *   4. THE DOCUMENT GATE (`C-25.6`), reached the other way — through
 *      `op=promote`, which is the door a hand-authored document takes. A gate
 *      that agreed with the endpoint only in a unit test would be two rules.
 *
 *   5. DEC-32 IS NOT WIDENED, and this is the assertion the whole item has to
 *      earn. `isSufficiencyClaimed` is still FALSE for the stamped value, and
 *      the DERIVED STRENGTH of the machine's landed reading is byte-identical
 *      to the same reading under a member's claim — which is DEC-65's arithmetic
 *      argument MEASURED rather than reasoned about.
 *
 *   6. OVER-STRICTNESS. Correct work in spellings this item did not anticipate
 *      must still be ACCEPTED: a member whose NAME contains the word the value
 *      is built from, a member composing two parts, unusual part labels, and the
 *      minted value in a case nobody typed. A fence tighter than its rule is not
 *      a safer fence.
 *
 *   7. THE CLASS SWEEP, over BOTH files and INVERTED. The question is not "which
 *      two sites did I read" but "what makes a site recognisable IN PRINCIPLE as
 *      one that judges a sufficiency assertion". What the matcher cannot see is
 *      PRINTED, not left implied.
 *
 *   8. C-2.8's CLOSURE, DRIVEN AT ITS OWN OP RATHER THAN ASSERTED IN A COMMENT.
 *      The reason C-2.8 is not wired is that `op=inquiryground` refuses a
 *      machine credential outright, so there is no machine writer for the third
 *      state to keep honest. That is a claim about the plane, so it is measured
 *      by calling the op — a mechanism believed on its EXISTENCE is the defect
 *      this project meets most.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SUFFICIENCY_UNCLAIMED, isSufficiencyClaimed, isSufficiencyUnclaimed,
         isMachineIdentity, basisVersionFindings } from "../checks/bio-checks.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const CHECKS_SRC = readFileSync(join(DIR, "..", "checks", "bio-checks.mjs"), "utf8");
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT: an arm that throws on `.code` of undefined ends the module and
   reports one defect as none — the tally then reads clean over nothing. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : null;
const codesOf = (r) => [...new Set([
  ...(r && typeof r.code === "string" ? [r.code] : []),
  ...((r?.findings ?? []).map((x) => x?.code).filter((x) => typeof x === "string")),
])].sort();

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl19", MEMBER_TOKEN: "mem-pl19", PROBE_TOKEN: "prb-pl19", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-pl19",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  /* THE ADD IS CHECKED TOO. Without this the enrol below fails with
     NO_SUCH_INVITATION — a refusal about the INVITE that is really a refusal
     about the HANDLE, and a fixture that reads the second as the first spends
     an hour in the wrong op. */
  if (!add.invite) throw new Error(`memberadd ${memberId}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);
/* THE SECOND ADMINISTRATOR IS NOT DECORATION: `memberadd` answers ADMINS_FIRST
   until two exist, so an ordinary member cannot be enrolled before this. */
await enrol("sam", "admin", ["contribute", "publish"]);
/* THE OVER-STRICTNESS SUBJECT, ENROLLED RATHER THAN IMAGINED: a real member
   whose handle contains the very word the minted value is built from. If the
   licence were implemented by matching a literal instead of asking the
   predicate, this member's genuine claim would be read as nobody's. */
const NONESUCH = await enrol("none-so-blind", "member", ["contribute"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const inquiryMd = (id, question = `What does ${id} rest on?`) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
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

const promote = async (id, text, type, base = null, register = []) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base,
  snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register,
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected",
          created: NOW, last_updated: LATER } });
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (!r.ok) throw new Error(`promote ${a[0]}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};

const LEDGER = "INFO-2026-4000-ledger", AUDIT = "INFO-2026-4000-audit",
      MINUTES = "INFO-2026-4000-minutes";
for (const d of [LEDGER, AUDIT, MINUTES])
  await mustPromote(d, infoMd(d), "information", null,
    [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${d}`), encoding: "binary", bytes: 10 }]);

const INQ = "INQ-2026-4000-sewer-transfers";
await mustPromote(INQ, inquiryMd(INQ), "inquiry");
const RUN = "RUN-2026-0809-pl19";
{
  const opened = await POST(`op=airunopen&token=${RUTH}`, {
    run: RUN, contextType: "inquiry", contextId: INQ,
    label: "PL-19 fixture — the run every suggestion names", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 });
  if (opened?.started !== true) throw new Error(`airunopen: ${JSON.stringify(opened)}`);
}
const suggest = async (body, tok) => POST(`op=suggest&token=${tok}`, { target: INQ, run: RUN, ...body });
const versionsOf = async () => GET(`op=basisversions&token=${RUTH}&id=${encodeURIComponent(INQ)}`);
const stampsOf = (composition) => String(composition ?? "").split("\n")
  .filter((l) => l.startsWith("ground\t")).map((l) => l.split("\t")[2]);

console.log("\n=== PL-19 / DEC-65 shape (b) · the single-part licence, at both sites ===");

/* ================================================================= *
 * 1. THE FIXTURE ARMS.
 * ================================================================= */
console.log("\n--- 1. the fixture arms: the credential this suite calls a machine IS one, by the plane's own predicate ---");
{
  /* MEASURED FROM WHAT THE PLANE WROTE, not read off a binding and not asked of
     a read op. `mem-pl19` is a SHARED token with no member behind it, and what
     matters is the identity the plane STAMPS on an act it performs under it —
     which is exactly what both gates then judge. So the fixture writes the ONE
     kind a machine could always write (§9's `level-empty`, untouched by this
     item) and reads the author back out of the record. A suite that assumed this
     would be measuring the licence under a member's credential and proving
     nothing at all; an arm that did not arm is a finding. */
  const probe = await suggest({ kind: "level-empty", name: "the fixture arming probe",
    description: "We searched the document level for a superseding reading and found none.",
    relationship: "and", level: "documents", observed_at: "observation:pl19-arming-1" }, "mem-pl19");
  const stamped = String((await versionsOf())?.versions
    ?.find((v) => v.name === "the fixture arming probe")?.author ?? "");
  console.log(`  the shared token stamps: ${JSON.stringify(stamped)}`);
  t("the credential this suite submits under is a MACHINE by the plane's ONE predicate — measured from an act the plane performed under it, so the licence below is genuinely being tested against a machine",
    [probe.ok, stamped !== "", isMachineIdentity(stamped)], [true, true, true]);
  t("and RUTH is not — the two arms of every assertion below are genuinely different credentials",
    isMachineIdentity("ruth"), false);
  t("the over-strictness member is enrolled and is a NAMED MEMBER whose handle contains the word the minted value is built from",
    [NONESUCH !== null && NONESUCH !== undefined, isMachineIdentity("none-so-blind"),
     isSufficiencyClaimed("none-so-blind"), isSufficiencyUnclaimed("none-so-blind")],
    [true, false, true, false]);
}

/* ================================================================= *
 * 2. THE SITE THAT FIRES FIRST — PL-3's ENDPOINT GUARD.
 * ================================================================= */
console.log("\n--- 2. the site that FIRES FIRST: PL-3's endpoint guard, driven through op=suggest ---");
const LANDED = {};
{
  const onePart = await suggest({ kind: "basis-version", name: "the run one-part reading",
    description: "The ledger alone shows the transfer, composed overnight with nobody to sign for it.",
    relationship: "and", grounds: [{ ground: "paper trail" }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail" }] }, "mem-pl19");
  LANDED.machine = onePart;
  t("A MACHINE CREDENTIAL MAY COMPOSE A SINGLE-PART READING — DEC-65 shape (b), and before PL-19 this same submission was refused on `legsIn.length > 0` before any check was reached",
    [onePart.ok, codeOf(onePart), onePart.state, onePart.kind],
    [true, null, "suggested", "basis-version"]);

  const twoParts = await suggest({ kind: "basis-version", name: "the run two-part reading",
    description: "Either the ledger or the audit would carry this answer, said by nobody in particular.",
    relationship: "or", grounds: [{ ground: "paper trail" }, { ground: "the audit" }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail" },
           { target: AUDIT, role: "supports", ground: "the audit" }] }, "mem-pl19");
  t("BUT TWO PARTS IS REFUSED BY NAME — the licence's BOUND: with two parts the MAXIMUM is live, and choosing which legs are separately sufficient is the authored act DEC-32 reserves to a member",
    [twoParts.ok, codeOf(twoParts), twoParts.branches], [false, "SUGGEST_UNWRITABLE_STATE", 2]);
  t("and the refusal NAMES THE RIGHT RULE: C-25.6, not C-25.15 — which is `VERSION_ORPHAN_ROW` and was cited at this very site until PL-19, so a member repairing this was being sent to an unrelated rule",
    [/C-25\.6/.test(String(twoParts.detail ?? "")), /C-25\.15/.test(String(twoParts.detail ?? ""))],
    [true, false]);

  const noPart = await suggest({ kind: "basis-version", name: "the run unpartitioned reading",
    description: "A reading resting on two documents with no account at all of how they are arranged.",
    relationship: "and",
    legs: [{ target: LEDGER, role: "supports" }, { target: MINUTES, role: "supports" }] }, "mem-pl19");
  t("LEGS WITH NO DECLARED PART IS STILL REFUSED: C-25.5 makes a version's partition TOTAL, so a reading that rests on anything CARRIES the arrangement — the licence is for ONE part, never for none",
    [noPart.ok, codeOf(noPart)], [false, "SUGGEST_UNWRITABLE_STATE"]);

  const twiceDeclared = await suggest({ kind: "basis-version", name: "the run doubled part",
    description: "One part declared twice, which is not one part however it is counted at a glance.",
    relationship: "and", grounds: [{ ground: "paper trail" }, { ground: "paper trail" }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail" }] }, "mem-pl19");
  t("AND ONE PART DECLARED TWICE IS NOT ONE PART — a version does not earn the licence by repeating its single row, which is why the guard counts DISTINCT labels and not rows",
    [twiceDeclared.ok, codeOf(twiceDeclared)], [false, "SUGGEST_UNWRITABLE_STATE"]);

  /* THE UNCHANGED HALF, asserted rather than assumed: the member path is what
     DEC-65 explicitly did not touch, and an exemption that quietly narrowed it
     would be the opposite defect. */
  const memberTwoParts = await suggest({ kind: "basis-version", name: "ruth two-part reading",
    description: "Either the ledger or the audit would carry this answer, and Ruth says so herself.",
    relationship: "or", grounds: [{ ground: "paper trail" }, { ground: "the audit" }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail" },
           { target: AUDIT, role: "supports", ground: "the audit" }] }, RUTH);
  LANDED.member = memberTwoParts;
  t("AND THE MEMBER PATH IS UNCHANGED: a named member may still declare two separately sufficient parts, which DEC-65 did not touch and this item must not have narrowed",
    [memberTwoParts.ok, memberTwoParts.state], [true, "suggested"]);
  t("THE KIND THAT RESTS ON NOTHING IS STILL A MACHINE'S TO WRITE — §9's `level-empty`, unchanged, so the licence ADDED a shape rather than replacing the one a background run already had",
    (await suggest({ kind: "level-empty", name: "the run found nothing at the meaning level",
      description: "We searched the meaning layer for a superseding reading and found none.",
      relationship: "and", level: "meaning", observed_at: "observation:pl19-meaning-1" }, "mem-pl19")).ok,
    true);
}

/* ================================================================= *
 * 3. THE STAMP — READ BACK OUT OF THE RECORD.
 * ================================================================= */
console.log("\n--- 3. the stamp: the machine's row says NOBODY claimed, never that a machine did ---");
{
  t("the endpoint publishes THE RECORD's bytes, so the stamp below is what was written and not what was sent",
    LANDED.machine?.composition_of, "record");
  t("THE MACHINE'S SINGLE-PART ROW CARRIES THE EXPLICIT NO-CLAIM VALUE — the whole reason PL-17 minted a third state: `class:ai` standing in this field would make the record claim something nobody claimed",
    stampsOf(LANDED.machine?.composition), [SUFFICIENCY_UNCLAIMED]);
  t("and it is NOT the composer's machine identity, asserted in the direction that fails rather than left to be read off the line above",
    stampsOf(LANDED.machine?.composition).some(isMachineIdentity), false);
  t("THE MEMBER'S ROWS STILL CARRY THE MEMBER — the substitution is conditioned on the composer being a machine and on nothing else",
    stampsOf(LANDED.member?.composition), ["ruth", "ruth"]);
  /* CROSS-OP, because one op agreeing with itself agrees at zero cost. */
  const vs = await versionsOf();
  const mine = (vs?.versions ?? []).find((v) => v.name === "the run one-part reading");
  t("AND `op=basisversions` — a DIFFERENT op over the same projection — reads back the same stamp, so this is the record's state and not one endpoint's answer about itself",
    [vs?.ok, stampsOf(mine?.composition)], [true, [SUFFICIENCY_UNCLAIMED]]);
  t("the version's own AUTHOR still names the machine that composed it: WHO COMPOSED a reading and WHO ASSERTED its structure are different facts, and only the second is a claim",
    isMachineIdentity(mine?.author ?? ""), true);
}

/* ================================================================= *
 * 4. THE DOCUMENT GATE (C-25.6), REACHED THE OTHER WAY.
 * ================================================================= */
console.log("\n--- 4. C-25.6 at the document gate, through op=promote: the other door into the same rule ---");
{
  const versionDoc = (id, rows, legs, rel) => inquiryMd(id).replace("---\n\n## Question",
    ["basis_versions:", `  - name: "v1"`, `    description: "a reading composed for the gate"`,
     `    relationship: "${rel}"`, `    state: "suggested"`, `    hidden: false`,
     `    derived_from: null`, `    at: "${NOW}"`,
     "basis_version_grounds:",
     ...rows.flatMap(([g, by]) => [`  - version: "v1"`, `    ground: "${g}"`,
                                   `    asserted_by: "${by}"`, `    at: "${NOW}"`]),
     "basis_version_legs:",
     ...legs.flatMap(([tgt, g]) => [`  - version: "v1"`, `    target: "${tgt}"`,
                                    `    role: "supports"`, `    ground: "${g}"`]),
     "---", "", "## Question"].join("\n"));

  const one = await promote("INQ-2026-4000-gate-one",
    versionDoc("INQ-2026-4000-gate-one", [["paper trail", SUFFICIENCY_UNCLAIMED]],
               [[LEDGER, "paper trail"]], "and"), "inquiry");
  t("A HAND-AUTHORED DOCUMENT carrying the no-claim value on a SINGLE-part version PASSES op=promote — the gate and the endpoint are one rule, driven at both doors rather than at one and reasoned about at the other",
    [one?.ok, codesOf(one).includes("VERSION_GROUND_UNASSERTED")], [true, false]);

  const two = await promote("INQ-2026-4000-gate-two",
    versionDoc("INQ-2026-4000-gate-two",
               [["paper trail", SUFFICIENCY_UNCLAIMED], ["the audit", SUFFICIENCY_UNCLAIMED]],
               [[LEDGER, "paper trail"], [AUDIT, "the audit"]], "or"), "inquiry");
  t("AND THE SAME VALUE ON A TWO-PART VERSION IS REFUSED AT THE GATE — the bound holds at the door a document takes, which is the door PL-3's guard cannot police",
    [two?.ok, codesOf(two).includes("VERSION_GROUND_UNASSERTED")], [false, true]);

  const mach = await promote("INQ-2026-4000-gate-machine",
    versionDoc("INQ-2026-4000-gate-machine", [["paper trail", "class:ai"]],
               [[LEDGER, "paper trail"]], "and"), "inquiry");
  t("A MACHINE'S STAMP ON A SINGLE-PART VERSION IS STILL REFUSED: the licence is the record saying `nobody claimed this` OUTRIGHT, never the record saying `a machine claimed this` — different findings, and the second is the overclaim DEC-65 was raised about",
    [mach?.ok, codesOf(mach).includes("VERSION_GROUND_UNASSERTED")], [false, true]);

  const blank = await promote("INQ-2026-4000-gate-blank",
    versionDoc("INQ-2026-4000-gate-blank", [["paper trail", ""]],
               [[LEDGER, "paper trail"]], "and"), "inquiry");
  t("AND A BLANK IS STILL REFUSED: undetermined is first-class only when it is STATED, so the silent default did not become legal alongside the stated one",
    [blank?.ok, codesOf(blank).includes("VERSION_GROUND_UNASSERTED")], [false, true]);
}

/* ================================================================= *
 * 5. DEC-32 IS NOT WIDENED — THE ARITHMETIC, MEASURED.
 * ================================================================= */
console.log("\n--- 5. DEC-32 is not widened: the arithmetic argument, measured rather than reasoned about ---");
{
  t("`isSufficiencyClaimed` is still FALSE for the value the plane now stamps — a consumer taking a MAXIMUM over parts asked this one predicate before PL-19 and gets the same answer after it",
    isSufficiencyClaimed(SUFFICIENCY_UNCLAIMED), false);
  /* THE ARITHMETIC ARGUMENT IS THAT WITH ONE PART THERE IS NO MAXIMUM TO TAKE.
     That is a claim about the DERIVED STRENGTH, so it is measured on the plane's
     own pair rather than restated: the same single-part reading under a member's
     claim and under the no-claim value must derive the SAME answer. If it did
     not, the state would be changing what the record CLAIMS and not only what it
     SAYS, which is the one thing this licence must not do. */
  const memberOne = await suggest({ kind: "basis-version", name: "ruth one-part reading",
    description: "The minutes alone show the transfer, and Ruth signs for the whole of that.",
    relationship: "and", grounds: [{ ground: "the minutes" }],
    legs: [{ target: MINUTES, role: "supports", grade: "B", grade_axis: "capture",
             grade_source: "capture", ground: "the minutes" }] }, RUTH);
  const machineOne = await suggest({ kind: "basis-version", name: "the run minutes reading",
    description: "The minutes alone show the transfer, composed by a run with nobody to sign for it.",
    relationship: "and", grounds: [{ ground: "the minutes" }],
    legs: [{ target: MINUTES, role: "supports", grade: "B", grade_axis: "capture",
             grade_source: "capture", ground: "the minutes" }] }, "mem-pl19");
  const pairOf = (r) => [r?.pair?.capture?.state, r?.pair?.capture?.grade,
                         r?.pair?.connection?.state, r?.pair?.connection?.grade];
  console.log(`  member's pair: ${JSON.stringify(pairOf(memberOne))} · machine's: ${JSON.stringify(pairOf(machineOne))}`);
  t("BOTH LANDED, so the comparison below is over two readings the record actually holds and not over two refusals agreeing",
    [memberOne.ok, machineOne.ok], [true, true]);
  t("AND THE DERIVED STRENGTH IS IDENTICAL: with exactly ONE part there is no maximum to take, so the conservative weakest-leg answer is what DEC-32 gives either way — DEC-65's whole argument, measured on the plane's own arithmetic rather than restated from the ruling",
    pairOf(machineOne), pairOf(memberOne));
  t("and the pair actually RESOLVED — two `undefined`s comparing equal is an equality that costs nothing to produce, which is the instrument failure this repository has measured most",
    [pairOf(memberOne)[0] !== undefined, pairOf(memberOne).filter((x) => x !== undefined).length >= 2],
    [true, true]);
}

/* ================================================================= *
 * 6. OVER-STRICTNESS — CORRECT WORK IN SPELLINGS NOBODY ANTICIPATED.
 * ================================================================= */
console.log("\n--- 6. OVER-STRICTNESS: a fence tighter than its rule is not a safer fence ---");
{
  /* THE ARM THIS ITEM MOST NEEDED. A licence implemented by matching the literal
     `none:independent-sufficiency` would be blind to case; one implemented by
     matching the WORD `none` would read this member's genuine claim as nobody's.
     The member is REAL and enrolled, not a string handed to a predicate. */
  const oddName = await suggest({ kind: "basis-version", name: "a member whose name contains the word",
    description: "The audit alone carries this, and the member saying so is called none-so-blind.",
    relationship: "and", grounds: [{ ground: "the audit" }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit" }] }, NONESUCH);
  t("A GENUINE MEMBER CLAIM LANDS AND IS STAMPED WITH THEIR NAME even though their handle contains the word the minted value is built from — the licence asks the PREDICATE and never matches the literal",
    [oddName.ok, stampsOf(oddName?.composition)], [true, ["none-so-blind"]]);
  t("and that stamp reads as a CLAIM, not as the no-claim state — the direction that would have been believed if it were wrong",
    [stampsOf(oddName?.composition).every(isSufficiencyClaimed),
     stampsOf(oddName?.composition).some(isSufficiencyUnclaimed)], [true, false]);

  /* AN UNANTICIPATED PART LABEL. `GROUND_LABEL_RE` admits spaces, digits,
     hyphens and underscores, so a licence keyed on a tidy one-word label would
     refuse correct work at the count. */
  const oddLabel = await suggest({ kind: "basis-version", name: "the run oddly labelled part",
    description: "One part, whose label carries spaces and digits because the grammar allows them.",
    relationship: "and", grounds: [{ ground: "fund 2026 transfers_A-1" }],
    legs: [{ target: LEDGER, role: "supports", ground: "fund 2026 transfers_A-1" }] }, "mem-pl19");
  t("A SINGLE PART WHOSE LABEL USES EVERY CHARACTER THE GRAMMAR ALLOWS still lands — the count is over DISTINCT LABELS and not over a shape somebody expected them to have",
    [oddLabel.ok, stampsOf(oddLabel?.composition)], [true, [SUFFICIENCY_UNCLAIMED]]);

  /* CASE, AT THE GATE. The value reaches a check hand-written in a document
     exactly as `token:member` does, so `None:Independent-Sufficiency` is the
     same statement — DERIVED from the constant and never typed. */
  const cased = (s) => s.replace(/(^|[-:])([a-z])/g, (_, a, b) => a + b.toUpperCase());
  const versionFm = (assertedBy) => ({
    id: "INQ-2026-0001",
    basis_versions: [{ name: "v1", description: "one part", relationship: "and",
                       state: "suggested", hidden: false, at: NOW }],
    basis_version_grounds: [{ version: "v1", ground: "whole", asserted_by: assertedBy, at: NOW }],
    basis_version_legs: [{ version: "v1", target: "INFO-2026-0002", role: "supports", ground: "whole" }],
  });
  const refusedAt = (fm) => { const out = []; basisVersionFindings(fm, out); return out.some((x) => /is not a named member|nobody asserted it/.test(String(x.message ?? ""))); };
  t("THE VALUE IS CASE-FOLDED AT THE GATE, in three spellings DERIVED from the constant rather than typed — a hand-typed variant agrees for free until the literal moves, which PL-17's own over-strictness arm caught in its sibling suite",
    [SUFFICIENCY_UNCLAIMED, SUFFICIENCY_UNCLAIMED.toUpperCase(), cased(SUFFICIENCY_UNCLAIMED),
     `  ${SUFFICIENCY_UNCLAIMED}  `].map((v) => refusedAt(versionFm(v))),
    [false, false, false, false]);
  t("and a MEMBER NAMED after the value's own namespace word is not swallowed by it — `none` is a name and `none:independent-sufficiency` is a statement, which is exactly why the value carries a colon",
    [refusedAt(versionFm("none")), refusedAt(versionFm("unclaimed")), refusedAt(versionFm("nobody"))],
    [false, false, false]);
}

/* ================================================================= *
 * 7. THE CLASS SWEEP, OVER BOTH FILES, INVERTED.
 * ================================================================= */
console.log("\n--- 7. the class sweep: every site that judges a sufficiency assertion, found by shape ---");
{
  /* WHAT MAKES A SITE RECOGNISABLE IN PRINCIPLE: an expression that reads an
     `asserted_by` (or, at the endpoint, the identity that will be STAMPED into
     one) and judges it with one of the plane's identity or sufficiency
     predicates. Named by SHAPE so a third site written next month is found, and
     run over BOTH files because the site that fires first is in the other one —
     a sweep confined to the catalog would have repeated exactly the one-site
     premise DEC-65's own entry had to be corrected for. */
  const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const PRED = "(?:isMachineIdentity|isMachineStamp|isSufficiencyClaimed|isSufficiencyUnclaimed|sufficiencyClaimState)";
  const CORPUS = [["checks/bio-checks.mjs", CHECKS_SRC], ["src/store.mjs", STORE_SRC]];
  const sitesIn = (src) => [...stripComments(src).replace(/\s+/g, " ")
    .matchAll(new RegExp(`[^;{}]*asserted_by[^;{}]*${PRED}\\s*\\([^)]*\\)`
                         + `|[^;{}]*${PRED}\\s*\\([^)]*asserted_by[^)]*\\)`, "g"))].map((m) => m[0].trim());
  const found = CORPUS.map(([f, src]) => [f, sitesIn(src)]);
  const total = found.reduce((n, [, s]) => n + s.length, 0);
  console.log(`  corpus: ${CORPUS.map(([f, s]) => `${f} ${s.length} chars`).join(" · ")}`);
  console.log(`  sweep: ${total} site(s) judging an \`asserted_by\` — ${found.map(([f, s]) => `${f}: ${s.length}`).join(", ")}`);
  t("THE SWEEP REACHES BOTH FILES AND FINDS SOMETHING IN THE CATALOG — a totality assertion over an empty corpus is not evidence, measured three times in this repository, so the reach is floored rather than trusted",
    [CORPUS.every(([, s]) => s.length > 100_000), found[0][1].length >= 3, total >= 3],
    [true, true, true]);
  const consuming = found.flatMap(([f, s]) => s.filter((l) => /isSufficiency(Claimed|Unclaimed)|sufficiencyClaimState|SUFFICIENCY_UNCLAIMED/.test(l)).map((l) => f));
  t("EXACTLY ONE of them consumes the third state, and it is in the CATALOG — C-25.6, which is where DEC-65 put it",
    consuming, ["checks/bio-checks.mjs"]);
  /* WHAT THIS MATCHER CAN AND CANNOT SEE, AND THE SENTENCE IS LOAD-BEARING —
     REWRITTEN AFTER THE RUN, BECAUSE THE FIRST VERSION OF IT WAS WRONG AND THE
     SUITE SAID SO. It was declared that the matcher would find NOTHING in
     `src/store.mjs`, on the reasoning that PL-3's guard judges the SESSION and
     the PART COUNT and never touches an `asserted_by`. That reasoning is right
     about the GUARD and it is not the whole of what is in that file: the matcher
     found ONE site, and it is the STAMP in `#suggestionPersisted` — the line
     that decides what goes INTO an `asserted_by`. That is exactly a site of this
     class, it is one this item wrote, and a declaration that expected zero would
     have hidden it. The assertion below is corrected to what is true and the
     wrong declaration is left in this comment rather than erased, because "the
     sweep found one more than I predicted" is the shape of a sweep working.
     IT CAN see any expression, however spelled or wrapped across lines, that
     mentions `asserted_by` within one statement of a judging predicate — the
     source is flattened first, because a line-wise matcher found only ONE of the
     two catalog sites when PL-17 wrote it (`checkGrounds` wraps its condition)
     and the totality assertion underneath PASSED over that half-corpus.
     IT CANNOT see PL-3's ENDPOINT GUARD, and that is not a hole to be widened
     away: the guard names no `asserted_by` and shares no shape with these sites.
     It is named here, pinned structurally below, and DRIVEN in block 2.
     IT ALSO CANNOT see a site in a THIRD file. The corpus is printed above so a
     reader can tell a clean result from a walk looking in the wrong place. */
  console.log(`  the store site the matcher found: ${JSON.stringify(found[1][1][0] ?? null)}`);
  /* AND ITS WINDOW ENDS AT THE PREDICATE CALL — the alternation closes on the
     first `)`, so the matched text names the QUESTION and not the VALUE the
     stamp then chooses. That is a limit of the matcher and is stated rather
     than worked around: what the stamp writes is driven in block 3, out of the
     record's own bytes, which is where a value belongs to be checked. */
  t("THE SWEEP REACHES THE WRITER IN `src/store.mjs` TOO — the stamp that decides what goes INTO an `asserted_by` is a site of this class, and the declaration that predicted ZERO here was WRONG in the direction that would have hidden it",
    [found[1][1].length,
     found[1][1].every((l) => /asserted_by/.test(l) && new RegExp(PRED).test(l))], [1, true]);
  t("BUT IT CANNOT SEE PL-3's GUARD, WHICH IS STATED RATHER THAN PAPERED OVER: that guard judges the SESSION and the PART COUNT and names no `asserted_by`, so it shares no shape with these sites — it is pinned structurally here and DRIVEN through the op in block 2",
    found[1][1].some((l) => /legsIn|declaredParts/.test(l)), false);
  t("the guard IS there, though, and the sweep says so by a different shape — the part count beside the machine predicate, in the file the matcher above could not speak for",
    /const singlePart = declaredParts\.length === 1/.test(STORE_SRC)
      && /isMachineIdentity\(who\) && !singlePart/.test(STORE_SRC), true);
}

/* ================================================================= *
 * 8. C-2.8's CLOSURE, DRIVEN AT ITS OWN OP.
 * ================================================================= */
console.log("\n--- 8. why C-2.8 is NOT wired: a decided closure, measured at the op rather than asserted in a comment ---");
{
  /* THE CLOSURE'S WHOLE JUSTIFICATION IS A CLAIM ABOUT THE PLANE — *there is no
     machine writer for the inquiry's own grounds[]* — so it is driven. A closure
     believed on the strength of a comment is the defect this project meets most,
     and if this op ever stops refusing, THIS assertion is what says the closure
     has to be reopened. */
  const machineGround = await POST(
    `op=inquiryground&token=mem-pl19&target=${encodeURIComponent(INQ)}`,
    { grounds: [{ ground: "paper trail", legs: [0] }], reason: "a machine grouping the basis" });
  t("`op=inquiryground` REFUSES A MACHINE CREDENTIAL OUTRIGHT — so the inquiry's own grounds[] has no machine writer, which is the entire reason C-25.6 needed the third state and C-2.8 does not",
    [machineGround?.ok, machineGround?.reason], [false, "MACHINE_CANNOT_GROUND"]);
  /* THE REFUSAL'S OWN WORDS, QUOTED FROM WHAT IT ACTUALLY SAYS RATHER THAN FROM
     what a first draft of this suite guessed it said (`/a machine credential may
     not/i`, which does not appear in it). The sentence that matters is the one
     drawing the line this closure rests on: a machine may GATHER and may not
     DECIDE that part of the gathering was enough on its own. */
  t("and the refusal draws the line the closure rests on IN ITS OWN WORDS — a machine may surface and gather, and may not decide that part of the gathering was sufficient by itself",
    [/may surface a question and gather/i.test(String(machineGround?.detail ?? "")),
     /may not decide that part of the gathering was sufficient/i.test(String(machineGround?.detail ?? ""))],
    [true, true]);
  t("C-2.8 therefore still asks the pre-DEC-65 question, and this suite says so out loud: it is a CLOSURE DECIDED, not a site the sweep missed",
    /DEC-65's SINGLE-PART LICENCE STOPS ONE LEVEL UP/.test(CHECKS_SRC), true);
}

} finally {
  await mf.dispose();
}
console.log(`\n${fail === 0 ? "ok" : "FAIL"}  dec65-single-part.test.mjs  ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
