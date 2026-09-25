/* NEGATIVE CONTROL: (RUN 2026-09-23 by the D-182 worker; each arm ALONE, restored from a per-arm pristine copy and verified by sha256 AND cmp; baseline 31 pass / 0 fail before and after) (A) THE ROW'S CONTROL, restore the default of 1 - in checks/bio-checks.mjs riskTierState return 1 instead of 'undetermined' for an absent/undetermined tier -> 5 FAIL, declared and actual: the no-tier arms fail BY NAME ("a stated undetermined READS UNDETERMINED through op=projection", "an action whose bytes carry no tier READS UNDETERMINED through op=projection", both words arms, and the riskTierState unit arm); the member's-2 and over-strictness arms stayed green, as declared. (B) THE WRITER'S DEFAULT - in src/setup.mjs write "risk_tier: 1" again -> 3 FAIL: the source arm and both driven-writer arms. (C) THE LIAR the row names, a read rendering UNDETERMINED whatever is stored - in src/store.mjs #actionDerived set risk_tier to the constant "undetermined" -> 1 FAIL, "a member's act sets 2, and op=projection reads 2"; every no-tier arm stays GREEN over the constant, which is declared and is why sections 2 and 3 also read the STORED column and bytes. Also found while writing, not by an arm: the first draft's risk:1 search arm was VACUOUS (it read a result key the answer does not carry, so it passed over an empty list); the risk:2 positive beside it caught that and the key was corrected. */
/* NEGATIVE CONTROL, D-483's section 6: (RUN 2026-09-24 by the D-483 worker; each arm ALONE in src/setup.mjs, restored from a per-arm pristine copy and verified by sha256 AND cmp at 96708072...; baseline 58 pass / 0 fail before and after every arm) (A) THE ROW'S CONTROL, default the group to 1 - render ' checked' on SETTABLE_TIERS[0] -> 1 FAIL, declared and actual: "THE DEFAULT IS UNSET: no rendered radio carries a checked attribute". The write arms stayed GREEN, AS DECLARED and not as slack: the driver supplies :checked itself, so markup cannot reach them - which is why arm B exists. (B) THE SAME LIE IN THE WRITER, chosenRiskTier() returning 1 when nothing is checked -> 5 FAIL by name: "reports NO CHOICE" and all four unset arms through the op; the three CHOSEN-tier arms stayed green, the over-strictness direction. (C) HARD-CODED LABELS, the row's second liar - render a literal 'file freely'/'file with caution'/'do not file without counsel' instead of RISK_TIERS[k] -> 2 FAIL: the literal arm and the mechanism arm. THE FINDING WORTH KEEPING, a surprising green: the BEHAVIOURAL label arm ("each label is the PLANE's sentence") stayed GREEN under C, because a hand copy agrees with the vocabulary for free (WORKER.md: an equality that costs nothing is not evidence). A suite holding only that arm would have gone green over a page that had stopped reading the vocabulary at all, which is the drift this row exists to prevent - so the textual and mechanism arms are the load-bearing ones and the behavioural arm is the one that proves they are about a control a member actually sees. */
/* NEGATIVE CONTROL, D-511's section 8 and its arm (ix): RUN BY `test/d511-replay-server-word.control.mjs` (deliberately NOT a `.test.mjs` — it patches COPIES of `src/` and the battery must not discover it). Re-run in one step from `bio-plane/`: `node test/d511-replay-server-word.control.mjs [arm]`. Every arm keeps the statement and changes only its CONDITION, so arm (ζ)'s one-delete pin is never the thing that moves — a control that moves a second variable refutes nothing. RESULTS, RUN 2026-09-24 by the D-511 worker (CONDUCT #20's, cloud) on origin/main e9b21be6 + this item; real sources hashed before and after, UNTOUCHED: YES (index.mjs 809,130 B sha256 622bc0c701e4…, store.mjs 3,236,684 B ea21f838c56b…, setup.mjs 83,079 B 96708072ccc7…, bio-checks.mjs 930,423 B 2f096c516b52…). ALL FIVE ARMS AS DECLARED, exit 0. (baseline) nothing armed → 87/0. **(no-fence) — THE ROW'S CONTROL, the QUEUE row's own words: the class test dropped, `if (false) delete b.replay;`, which is the tree exactly as it stood before D-511 → 82/5: arm (ix)'s THREE assertions BY NAME (the machine's replay lands a stated tier 1 again, the bundle projects, and `op=search q=risk:1` finds it), plus (β) (the founder's act is recorded `promotion-replay`) and (γ) (the probe's lands). (δ), (ε) and the residue arm stayed GREEN as declared — that class was always exempt.** **(any-session) — the session half alone, `if (cls !== "admin") delete b.replay;` → 86/1: (β) BY NAME and nothing else, which is what proves `!viaSession` is load-bearing. ITS FIRST RUN CAME BACK 85/0, ALL GREEN — A SURPRISING GREEN AND A FINDING ABOUT THE ARM, NOT THE SUBJECT: (β) was written under an admin-ROLE member's session on the assumption that her class reads `admin`, and `op=whoami` measured it `member`. The one session that arrives as the ADMIN class is the FOUNDER'S. Arm (β) was moved onto it and a REACH arm now MEASURES all four callers' classes instead of asserting them; the src comment carrying the same wrong sentence was corrected with it. Recorded here as the second measurement, never as the first.** **(any-class) — the class half alone, a fence TIGHTER than the rule: every caller's flag deleted, the migration's included → 85/2: (δ) and the RESIDUE arm BY NAME; arm (ix), (β), (γ) and (ε) stayed green, being about callers who never had the exemption.** (respelled) OVER-STRICTNESS, the same rule as `if (!(!viaSession && cls === "admin")) delete b.replay;` → 87/0, all green: the arms are coupled to behaviour and (ζ) pins the delete's shape, not its guard. RE-RUN 2026-09-24 BY D-512, which INVERTED arm (δ) and its residue arm (BOB #33's step (2) built), added (δ)'s migration-path and second-condition arms, and corrected (ζ) to two deletes and one server write; on origin/main 9f8b69e6 + D-512 (real index.mjs 837,801 B sha256 cbd39b7220af…, store.mjs b1398c2d4762…, setup.mjs 96708072ccc7…, bio-checks.mjs 1b1847df33d3…, untouched: YES). FIRST RUN: 3/5 as declared — no-fence came back 86/4 and any-class 88/2 NOT AS DECLARED, both a finding about the DECLARATIONS: any-class named the (δ)/residue labels the inversion replaced, and no-fence now shows DEFENCE IN DEPTH — with step (1)'s delete disarmed, a non-admin's flag reaches step (2)'s verification (asked only for the admin class) and is refused C-66.6 before any fence, so arm (ix)'s NAMED refusal, (β), (γ) and (δ)'s second-condition arm fail while (ix)'s "nothing landed" and "no search finds it" arms stay GREEN, because nothing lands. Both re-declared in the driver with that reason; SECOND RUN, ALL FIVE AS DECLARED: baseline 90/0 · no-fence 86/4 · any-session 89/1 ((β) alone) · any-class 88/2 ((δ) and its migration path, refused C-32.19 once the admin's proven flag is deleted too) · respelled 90/0. */
/* NEGATIVE CONTROL, D-505's section 7: (RUN 2026-09-24 by the D-505 worker; each arm ALONE on the ONE predicate the item changed - `isAction`, the guard of promote's action block in src/store.mjs - restored after every arm from a uniquely-named pristine copy (d505-pristine-store.mjs, in the session scratchpad and never in the worktree) and verified BY sha256 dd606e24... AND BY cmp at 3,224,435 B; baseline 77 pass / 0 fail before and after every arm) (A) THE ROW'S CONTROL, drop the fence's reach - restore the predicate to `normalizeType(meta.object_type) === "action"` alone, which is what REC-189 left. DECLARED: the EIGHT section-7 arms about the divergent envelope FAIL BY NAME, and nothing else moves - in particular the over-strictness arms (iv), (iv-b), (v), (vi), (vii) and the residue arm (ix) must stay GREEN. ACTUAL: AS DECLARED, 69 pass / 8 fail, every failure in section 7 and named, sections 1-6 untouched. (B) OVER-STRICTNESS, a spelling the item did not anticipate - the same union written as `[meta.object_type, docFmW?.object_type].some(tt => normalizeType(tt) === "action")`. DECLARED: all green, the suite being coupled to behaviour and not to an expression. ACTUAL: AS DECLARED, 77 pass / 0 fail. (C) THE HALF-UNION, AND IT IS THE ARM THAT CHANGED THE SUITE - the meta half dropped, a document-only predicate. FIRST RUN: 76 pass / 0 FAIL, ALL GREEN - a surprising green, and a finding about the ARMS rather than the subject: every arm written to that point handed the plane a document whose bytes said action, so the suite could not tell the union from half of it and a later 'simplification' would have silently given back REC-189's reach. Arm (iv-b), the mirror shape, was written for it; the control re-run then read 1 FAIL by name and is recorded above as the second measurement, not as the first. TWO FURTHER DEFECTS IN THE ARMS THEMSELVES were found by arm (A) and corrected before landing, both recorded at their sites: an 'and NOTHING landed' arm that compared `gone?.ok === true` against false over an answer carrying no `ok` key at all - VACUOUS IN BOTH DIRECTIONS, and it PASSED under the armed control - and a pair of revision arms sharing one bundle and one base, where with the fence removed the first landed, the second came back CAS_STALE (failing for the wrong reason) and the read-back died on a TypeError that goes through NO assertion at all. RE-RUN 2026-09-24 BY D-510, which CORRECTED this section's arms and therefore owes its control again (CLAUDE.md §5: a suite coupled to behaviour survives a change that disarms the control coupled to shape). Both arms re-run ALONE against the REAL `src/store.mjs`, restored from a uniquely-named pristine copy in the session scratchpad (never in the worktree) and verified BY sha256 93648670... AND BY cmp at 3,242,874 B after each; baseline 78 pass / 0 fail before and after. (A) the meta-only predicate -> **74 pass, 4 FAIL**, every failure named and in section 7: the envelope-states-no-type arm (i-b) and the three arms moved to that shape (the DROP, the CHANGE, and the tier-untouched read-back). The figure moved from D-505's 69/8 because the DIVERGENT-envelope arms no longer reach this predicate at all — D-510 refuses them above it — and that is the correction, measured rather than asserted. (C) the half-union, document-only -> **77 pass, 1 FAIL**, arm (iv-b) by name, exactly as D-505 declared: the mirror arm is untouched by this item and still discriminates. So BOTH halves of D-505's union are still driven after the correction, which is the thing a correction most often loses. */
/* D-182 (BIO_Case_Making_v0_1.md §2, "`risk_tier`, RULED 2026-09-21 by BOB #21"): an action's risk tier gains
 * UNDETERMINED, and the plane publishes the three words.
 *
 * WHAT WAS TRUE BEFORE THIS SUITE EXISTED. Both intake writers — `civicos-ui/app.html`'s `mdFor` and
 * `src/setup.mjs`'s — wrote `risk_tier: 1` into EVERY action they created, and C-2.10 admitted only 1, 2 or 3,
 * so the record had no way to say "nobody assessed this". Tier 1 means FILE FREELY (Roadmap §8, Bob's words),
 * so every action a member created told them it was safe to file with no one having looked: an overclaim on
 * the one field that carries legal exposure. D-130's counterparty, one field over, was the same class.
 *
 * WHAT THIS SUITE HOLDS THE ITEM TO, each in the direction that fails:
 *
 *   1. THE VALUE. `undetermined` is a tier the gate accepts, and so is its ABSENCE (both read undetermined);
 *      1, 2 and 3 stay; anything else is refused by C-2.10 BY NAME. Over-strictness is asserted beside it: a
 *      member's stated 2 must still pass.
 *   2. THROUGH THE OPS, A NO-TIER ACTION READS UNDETERMINED — and the arm reads the STORED ROW too, because the
 *      liar the row names is a surface rendering UNDETERMINED over a stored 1. The document's own bytes (op=image)
 *      and the projection column are both asked.
 *   3. A MEMBER'S ACT SETS 2 and it reads *file with caution*, in the plane's words and not a surface's.
 *   4. THE WORDS ARE PUBLISHED, by op=affordances, and are the catalogue's own map (identity, not equality).
 *   5. NOTHING WRITES 1 BY DEFAULT: setup.mjs's writer, driven, writes undetermined; neither writer's SOURCE
 *      carries the old default.
 *
 * WHAT IT CANNOT SEE. A row written BEFORE this landed at the old default reads 1, because its bytes say 1, and
 * nothing in the record distinguishes a stated 1 from a defaulted one; the row forbids back-filling an
 * assessment nobody made, so none is. CORRECTED 2026-09-24 by REC-189: this said no fence refused a MACHINE
 * credential's promote writing a determined tier. One does now — C-32.19 MACHINE_CANNOT_SET_RISK_TIER, in
 * `promote`'s action block — and `machine-fences.test.mjs` block (xiv) drives it; this suite's member arm is a
 * signed-in session for that reason.
 */
import { withReplayProof } from "./replay-proof.mjs";    /* D-512: a replay is honoured only over provenance the plane verifies */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash, webcrypto } from "node:crypto";
import { checkBundle, RISK_TIERS, riskTierState, SURFACE_CHECKS as CHECK_CATALOGUE_SURFACE } from "../checks/bio-checks.mjs";
import { VOCABULARIES } from "../src/affordances.mjs";

const shaHex = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512Hex = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));
const sha = (v) => createHash("sha256").update(v).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const NL = "\n";
/* D-511: the control driver points this at an armed COPY of the sources (REC-173's harness shape). It defaults to
   the real tree, so every run but the control's reads exactly what it read before. */
const SRC_DIR = process.env.D511_SRC || fileURLToPath(new URL("../src", import.meta.url));

const NOW = "2026-07-24T00:00:00Z";

/* A conformant action in every respect EXCEPT the tier line(s), which each case supplies. */
const actionMd = (id, tierLines) => [
  "---", `id: ${id}`, "object_type: action", "schema: action@1",
  'title: "Records request"', "current_state: planned", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []",
  /* CORRECTED 2026-09-25 by D-689, never exempted: this fixture created a `cpra_request` through an operator bearer token — a machine identity — and C-32.20 now refuses a machine stating the law a records request is made under (BOB #35, 2026-09-25: only a member's act states it; a machine may only propose). The kind is not this suite's subject, so the fixture is the law-neutral `records_request` stating no law, which a machine may create. */
  "action_kind: records_request", ...tierLines,
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "",
  "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", "",
].join(NL);

const TIER = {
  undetermined: ["risk_tier: undetermined"],
  absent: [],
  one: ["risk_tier: 1"],
  two: ["risk_tier: 2"],
  three: ["risk_tier: 3"],
  nine: ["risk_tier: 9"],
  quotedTwo: ['risk_tier: "2"'],
  unknown: ["risk_tier: unknown"],
};

const c210 = async (tierLines, id = "ACTN-2026-0001-records-request") => {
  const { findings } = await checkBundle({
    folderName: id, files: new Map([["bundle.md", actionMd(id, tierLines)]]),
    sha256: shaHex, sha512: sha512Hex, resolveTarget: (x) => x === id,
  });
  return findings.filter((f) => f.severity === "error" && f.check === "C-2.10").map((f) => f.message);
};

/* ------------------------------------------------------------- 1. the value */
console.log("\n--- 1. the value: undetermined is a tier, and absence reads as it ---");
{
  t("the three words are Bob's, from Roadmap §8, and the fourth is UNDETERMINED",
    [RISK_TIERS[1], RISK_TIERS[2], RISK_TIERS[3], typeof RISK_TIERS.undetermined],
    ["file freely", "file with caution", "do not file without counsel", "string"]);
  t("riskTierState: absent, null and the literal all read undetermined; 1-3 read as themselves",
    [riskTierState(undefined), riskTierState(null), riskTierState("undetermined"),
     riskTierState(1), riskTierState(2), riskTierState(3)],
    ["undetermined", "undetermined", "undetermined", 1, 2, 3]);
  t("riskTierState: a value the vocabulary does not hold is null, never coerced to a tier",
    [riskTierState(9), riskTierState("2"), riskTierState(0), riskTierState("unknown")], [null, null, null, null]);
  t("C-2.10 accepts a stated undetermined", await c210(TIER.undetermined), []);
  t("C-2.10 accepts the ABSENCE of a tier — refusing it would press a writer to invent one", await c210(TIER.absent), []);
  t("OVER-STRICTNESS: a member's stated 1, 2 and 3 all still pass",
    [await c210(TIER.one), await c210(TIER.two), await c210(TIER.three)], [[], [], []]);
  const nine = await c210(TIER.nine);
  t("C-2.10 refuses a tier out of range BY NAME, listing the vocabulary",
    nine.length === 1 && /risk_tier '9' is not one of 1, 2, 3, undetermined/.test(nine[0]), true);
  t("C-2.10 refuses a quoted \"2\" exactly as it did before this row (no widening)",
    (await c210(TIER.quotedTwo)).length, 1);
  t("C-2.10 refuses a spelling of undetermined the vocabulary does not hold", (await c210(TIER.unknown)).length, 1);
}

/* ------------------------------------------------------------ 2-4. the ops */
console.log("\n--- 2-4. through the ops: the no-tier action, a member's 2, and the published words ---");
{
  const SRC = join(SRC_DIR, "index.mjs");
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    bindings: { ADMIN_TOKEN: "adm-d182", MEMBER_TOKEN: "mem-d182", PROBE_TOKEN: "prb-d182", VERSION: "test" },
  });
  const post = async (op, body) => (await mf.dispatchFetch("http://x/api/?op=" + op + "&token=mem-d182",
    { method: "POST", body: JSON.stringify(body) })).json();
  const get = async (qs) => (await mf.dispatchFetch("http://x/api/?token=mem-d182&" + qs)).json();
  const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

  /* CORRECTED 2026-09-24 by REC-189, never exempted: section 3's "a member's authored act sets 2" was driven
     through `token=mem-d182` — the MEMBER_TOKEN DEPLOY credential, which the control plane stamps `token:member`,
     a MACHINE identity by REC-46's one predicate. The arm was asserting the ruling's OWN overclaim as its positive:
     a machine setting 2 read as a member doing so. REC-189's fence (C-32.19) refuses exactly that, so the member's
     act is now a SIGNED-IN SESSION's, and the writers' no-tier creations stay on the machine credential (they state
     no tier, which the fence does not refuse). AND THE THROW BELOW WAS VACUOUS: the answer arrives wrapped in
     `result`, so `r.ok === false` read `undefined` and a refused promote went on as if it had landed — which is
     how the refusal surfaced as five read-back FAILs rather than one named throw. It now reads through `rP`. */
  const RUTH = await (async () => {
    const add = rP(await (await mf.dispatchFetch("http://x/api/?op=memberadd&token=adm-d182",
      { method: "POST", body: JSON.stringify({ memberId: "ruth", cover: "cover for ruth", role: "admin",
                                               capabilities: ["contribute"] }) })).json());
    const en = rP(await (await mf.dispatchFetch("http://x/api/?op=enroll",
      { method: "POST", body: JSON.stringify({ invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" }) })).json());
    if (!en?.ok) throw new Error(`enroll ruth: ${JSON.stringify(en)}`);
    const lg = rP(await (await mf.dispatchFetch("http://x/api/?op=login",
      { method: "POST", body: JSON.stringify({ role: "member:ruth", password: "ruth-passphrase-1" }) })).json());
    if (!lg?.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
    return lg.token;
  })();

  let seq = 0;
  const promoteAction = async (id, tierLines, base = null, token = "mem-d182") => {
    const text = actionMd(id, tierLines);
    const r = rP(await (await mf.dispatchFetch("http://x/api/?op=promote&token=" + token, { method: "POST", body: JSON.stringify({
      bundleId: id, base, snapKey: `20260724T010000Z_d182${String(++seq).padStart(4, "0")}`, author: "member-ruth",
      meta: { object_type: "action", group: "believe-in-oakland", title: "Records request",
              current_state: "planned", created: NOW, last_updated: NOW },
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
      register: [],
    }) })).json());
    if (r?.ok !== true) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
    return r;
  };
  const projection = async (id) => rP(await get(`op=projection&id=${encodeURIComponent(id)}`));
  const stored = async (id) => (await get(`op=image&id=${encodeURIComponent(id)}`)).result["bundle.md"];

  /* 2. The no-tier action, both spellings the writers may produce. */
  const STATED = "ACTN-2026-0001-stated-undetermined";
  const ABSENT = "ACTN-2026-0002-no-tier-key";
  await promoteAction(STATED, TIER.undetermined);
  await promoteAction(ABSENT, TIER.absent);
  for (const [label, id] of [["a stated undetermined", STATED], ["an action whose bytes carry no tier", ABSENT]]) {
    const p = await projection(id);
    t(`${label} READS UNDETERMINED through op=projection`, p.action.risk_tier, "undetermined");
    t(`${label} carries the plane's words for it, not a surface's`, p.action.risk_tier_words, RISK_TIERS.undetermined);
    /* THE LIAR'S ARM: the row names a surface rendering UNDETERMINED over a stored 1. So the STORED ROW is read. */
    t(`${label}: the stored projection column holds NO tier (not 1)`, p.action_risk_tier, null);
    t(`${label}: the stored bytes carry no tier 1`, /^risk_tier:\s*1\s*$/m.test(await stored(id)), false);
  }
  t("the stated one's bytes say undetermined in the document itself",
    /^risk_tier: undetermined$/m.test(await stored(STATED)), true);

  /* 3. A member's authored act sets 2.
     CORRECTED 2026-09-24 by REC-214 (BOB #33, "Risk-tier revision"): this arm set the tier by a plain op=promote
     revision from the member, which WAS the member's authored act when it was written. It is not any more, and the
     old assertion was wrong for a reason worth keeping: a plain revision records no reason and no history, so a
     later 3 -> 1 by the same route would overwrite "do not file without counsel" silently. After intake the act is
     op=actionrisktier (REQUIRED reason, APPEND-ONLY history), and promote now refuses the plain revision by name
     (RISK_TIER_REWRITTEN, C-90.1) — which is driven in rec214-risk-tier-revision.test.mjs. Every read-side arm
     below is unchanged: the act writes the SAME front-matter path, so the column, the bytes and the search agree. */
  const before = await projection(STATED);
  const act = rP(await (await mf.dispatchFetch(`http://x/api/?op=actionrisktier&token=${RUTH}&target=${encodeURIComponent(STATED)}`,
    { method: "POST", body: JSON.stringify({ tier: 2, reason: "a member assessed the filing" }) })).json());
  if (act?.ok !== true) throw new Error(`actionrisktier ${STATED}: ${JSON.stringify(act)}`);
  const after = await projection(STATED);
  t("a member's act sets 2, and op=projection reads 2", after.action.risk_tier, 2);
  t("…in the plane's words: file with caution", after.action.risk_tier_words, "file with caution");
  t("…and the stored row agrees: the column and the bytes both say 2",
    [after.action_risk_tier, /^risk_tier: 2$/m.test(await stored(STATED))], [2, true]);
  t("the version moved — it was the act, not a read, that set it", after.bundle_sha !== before.bundle_sha, true);

  /* A `risk:` search matches only a STATED tier: the undetermined action is not found at 1. */
  const at1 = rP(await get(`op=search&q=${encodeURIComponent("risk:1")}`));
  const ids1 = (at1?.hits ?? []).map((r) => r.bundle_id);
  t("a search for risk:1 finds neither undetermined action (nothing reads as tier 1 by default)",
    [ids1.includes(ABSENT), ids1.includes(STATED)], [false, false]);
  /* The positive beside it, so an empty answer cannot pass the arm above for free. */
  const at2 = rP(await get(`op=search&q=${encodeURIComponent("risk:2")}`));
  const ids2 = (at2?.hits ?? []).map((r) => r.bundle_id);
  t("…while a search for risk:2 DOES find the action a member set to 2 (the search is live)",
    [ids2.includes(STATED), ids2.includes(ABSENT)], [true, false]);

  /* 4. The words are published through the op, and are the catalogue's map. */
  const aff = await get("op=affordances");
  t("op=affordances publishes vocabularies.risk_tiers with the catalogue's words",
    aff.result?.vocabularies?.risk_tiers, JSON.parse(JSON.stringify(RISK_TIERS)));

  const audit = (await get("op=audit&limit=1000")).result;
  t("op=audit: neither action draws C-2.10 — undetermined is an honest state, not a gap",
    audit.tally?.["C-2.10"] ?? 0, 0);

  await mf.dispose();
}
t("VOCABULARIES.risk_tiers IS the catalogue's map (identity, not a copy)", VOCABULARIES.risk_tiers === RISK_TIERS, true);

/* ------------------------------------------------------- 5. the writers */
console.log("\n--- 5. nothing writes 1 by default ---");
{
  const setupSrc = readFileSync(join(SRC_DIR, "setup.mjs"), "utf8");
  const appSrc = readFileSync(fileURLToPath(new URL("../../civicos-ui/app.html", import.meta.url)), "utf8");
  const defaultsOne = (src) => /["']risk_tier:\s*1["']/.test(src);
  t("src/setup.mjs's writer carries no default of 1", defaultsOne(setupSrc), false);
  t("civicos-ui/app.html's writer carries no default of 1", defaultsOne(appSrc), false);

  /* And setup.mjs's writer DRIVEN, as counterparty.test.mjs drives it: what it writes, judged. */
  const { SETUP_HTML } = await import("../src/setup.mjs");
  const script = SETUP_HTML.slice(SETUP_HTML.lastIndexOf("<script>") + 8, SETUP_HTML.lastIndexOf("</script>"));
  const el = () => ({ addEventListener() {}, classList: { add() {}, remove() {} },
    textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
  const sandbox = {
    document: { querySelector: () => el(), querySelectorAll: () => [], getElementById: () => el(),
                addEventListener() {}, createElement: () => el(), body: { appendChild() {}, removeChild() {} } },
    location: { hash: "", pathname: "/", origin: "https://x" }, history: { replaceState() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
    URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array, crypto: webcrypto,
    setTimeout, TextEncoder, navigator: { clipboard: { writeText: async () => {} } },
  };
  sandbox.window = sandbox;
  const ui = new Function(...Object.keys(sandbox),
    script + "\n;return { mdFor, FIRST_STATE };")(...Object.values(sandbox));
  const text = ui.mdFor("ACTN-2026-0009-intake-check", "action", ui.FIRST_STATE.action,
    "Intake check", "What the member wrote.", NOW);
  t("setup.mjs's writer, driven, writes risk_tier: undetermined", /^risk_tier: undetermined$/m.test(text), true);
  t("…and no tier 1", /^risk_tier:\s*1\s*$/m.test(text), false);
}

/* ------------------------------------- 6. D-483: the member's chooser on the setup page */
/* D-483 (the same design section, BOB #21's ruling): D-182 left this page writing UNDETERMINED because it
 * had no control to ask with. That is truthful and it is also a MISSING AFFORDANCE — a member who HAS
 * assessed the action could not say so at the one surface a sovereign copy serves at `/`. The row adds a
 * radio group over the published vocabulary, UNSET by default, and unset still writes undetermined.
 *
 * THE TWO LIARS THIS SECTION REFUSES, both named by the row:
 *   A PRESELECTED TIER, so nothing is ever undetermined — D-182's overclaim re-entering through the
 *   control built to remove it. The rendered markup is read for `checked` and the page's own reader is
 *   asked what it reports with nothing chosen.
 *   HARD-CODED LABELS, so the page decides what 2 MEANS. The rendered choices and their words are compared
 *   against the catalogue's map, the settable keys are derived INDEPENDENTLY here and compared with the
 *   page's own derivation, and the source is read for the sentences as literals.
 *
 * AND IT IS DRIVEN THROUGH THE OP, not judged as markup: what the page's writer produces for a chosen tier
 * and for no choice is promoted into a real store and read back through op=projection, because a control
 * that collects a value the write path drops would satisfy every markup arm above.
 *
 * WHAT THIS SECTION CANNOT SEE. It drives `mdFor` with what `chosenRiskTier()` returns, as the save handler
 * does; it does not dispatch the button's click event, so the wiring between them is pinned STRUCTURALLY
 * (the save path is read for the call) rather than executed. And the markup arms compare raw sentences, so
 * an arm asserts the vocabulary carries no markup-significant byte that the page's escaper would move.
 */
console.log("\n--- 6. D-483: the tier chooser, unset by default, over the published vocabulary ---");
{
  const setupSrc = readFileSync(join(SRC_DIR, "setup.mjs"), "utf8");
  const { SETUP_HTML } = await import("../src/setup.mjs");
  const script = SETUP_HTML.slice(SETUP_HTML.lastIndexOf("<script>") + 8, SETUP_HTML.lastIndexOf("</script>"));

  /* The settable tiers, derived HERE from the catalogue and never read from the page, so the comparison
     below is between two derivations rather than a value compared with itself. */
  const SETTABLE = Object.keys(RISK_TIERS).filter((k) => riskTierState(Number(k)) === Number(k));
  console.log(`  corpus: ${SETTABLE.length} settable tiers ${JSON.stringify(SETTABLE)}; vocabulary has ${Object.keys(RISK_TIERS).length} keys`);
  t("the vocabulary offered is NON-EMPTY and holds the three tiers (no arm below may pass over nothing)",
    [SETTABLE.length, SETTABLE.includes("undetermined")], [3, false]);

  /* A DOM stub that REMEMBERS its elements, unlike section 5's: this arm reads back what the page WROTE
     into the choices container, and a fresh stub per query would discard the subject. `checked` is the
     member's state: null is a form nobody has touched. */
  const drive = (checked) => {
    const nodes = new Map();
    const node = () => ({ addEventListener() {}, classList: { add() {}, remove() {} }, checked: false,
      textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
    const querySelector = (sel) => {
      if (sel === "input[name=n-risk]:checked")
        return checked === null ? null : { value: String(checked), checked: true };
      if (!nodes.has(sel)) nodes.set(sel, node());
      return nodes.get(sel);
    };
    const sandbox = {
      document: { querySelector, querySelectorAll: () => [], getElementById: () => node(),
                  addEventListener() {}, createElement: () => node(),
                  body: { appendChild() {}, removeChild() {} } },
      location: { hash: "", pathname: "/", origin: "https://x" }, history: { replaceState() {} },
      sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
      fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
      URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array, crypto: webcrypto,
      setTimeout, TextEncoder, navigator: { clipboard: { writeText: async () => {} } },
    };
    sandbox.window = sandbox;
    const ui = new Function(...Object.keys(sandbox),
      script + "\n;return { mdFor, FIRST_STATE, chosenRiskTier, SETTABLE_TIERS };")(...Object.values(sandbox));
    return { ui, nodes };
  };

  /* --- the control as a member first meets it: nothing touched --- */
  const fresh = drive(null);
  const html = fresh.nodes.get("#n-risk-choices").innerHTML;
  t("the chooser RENDERED: one radio per settable tier, and the container is not empty",
    (html.match(/type="radio"/g) || []).length, SETTABLE.length);
  t("THE DEFAULT IS UNSET: no rendered radio carries a checked attribute",
    /\bchecked\b/.test(html), false);
  t("…and with nothing chosen the page reports NO CHOICE, never a tier", fresh.ui.chosenRiskTier(), null);
  t("the page's own derivation of the settable tiers matches the catalogue's, key for key",
    fresh.ui.SETTABLE_TIERS, SETTABLE);

  /* --- the choices are the vocabulary's, and the words are the plane's --- */
  const values = [...html.matchAll(/value="([^"]+)"/g)].map((m) => m[1]);
  t("the choices ARE the vocabulary's settable keys, in its own order", values, SETTABLE);
  const labels = [...html.matchAll(/<span>([^<]*)<\/span>/g)].map((m) => m[1]);
  t("…and each label is the PLANE's sentence for that tier, not a word this page chose",
    labels, SETTABLE.map((k) => RISK_TIERS[k]));
  t("what leaving it alone will write is stated in the vocabulary's OWN undetermined sentence",
    fresh.nodes.get("#n-risk-unset").textContent.includes(RISK_TIERS.undetermined), true);
  /* THE SENTENCES ARE NOT WRITTEN IN THE PAGE. Judged over the source with its COMMENTS REMOVED, and the
     narrowing is a finding rather than a convenience: the first form of this arm read the whole file and
     failed on D-182's own history comment in mdFor, which says an old default "told a member the action
     was safe to file freely" — prose EXPLAINING the rule, cited by the arm enforcing it (WORKER.md's
     sweep-arm shape). A comment cannot become a label; only a literal can. The stripper's limit, stated:
     it can only over-strip, which WEAKENS this arm and can never make it fail falsely, so the floor below
     guards that it did not eat the file, and the two arms after it pin the mechanism and the behaviour. */
  const nocomment = setupSrc.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/<!--[\s\S]*?-->/g, " ");
  console.log(`  setup.mjs: ${setupSrc.length} B, ${nocomment.length} B with comments stripped`);
  t("the comment stripper left a real file behind (it cannot fail this arm falsely, only weaken it)",
    nocomment.length > setupSrc.length * 0.5, true);
  t("src/setup.mjs carries NONE of the tier sentences as a literal — the words arrive from the catalogue",
    SETTABLE.map((k) => nocomment.includes(RISK_TIERS[k])).concat(nocomment.includes(RISK_TIERS.undetermined)),
    [false, false, false, false]);
  t("…and the one expression that becomes a label reads the MAP, by key, through the page's escaper",
    /escH\(RISK_TIERS\[k\]\)/.test(setupSrc), true);
  /* THE MATCHER'S DECLARED LIMIT: the two arms above compare raw sentences against rendered markup, which
     is only sound while no sentence carries a byte the page's escaper moves. Asserted, so a future
     sentence with one fails HERE by name instead of quietly weakening those arms. */
  t("…(the arms above compare raw text: the vocabulary carries no markup-significant byte)",
    Object.values(RISK_TIERS).map((w) => /[&<>"]/.test(w)), [false, false, false, false]);
  /* The wiring between the control and the writer, pinned structurally: this section drives mdFor the way
     the save handler does, so an arm is owed that the save handler really does it that way. */
  t("the form's save path sends the chosen tier alongside the counterparty (the page's real route)",
    /risk_tier:\s*chosenRiskTier\(\)/.test(setupSrc), true);

  /* --- and through the op: what the page WRITES for each answer, promoted and read back --- */
  const bytesFor = (checked, id) => {
    const { ui } = drive(checked);
    return ui.mdFor(id, "action", ui.FIRST_STATE.action, "Intake check", "What the member wrote.", NOW,
      false, null, { counterparty: { state: "named", name: "City Clerk" }, risk_tier: ui.chosenRiskTier() });
  };

  const SRC = join(SRC_DIR, "index.mjs");
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    bindings: { ADMIN_TOKEN: "adm-d483", MEMBER_TOKEN: "mem-d483", PROBE_TOKEN: "prb-d483", VERSION: "test" },
  });
  const post = async (op, body, token = "mem-d483") =>
    (await mf.dispatchFetch("http://x/api/?op=" + op + "&token=" + token,
      { method: "POST", body: JSON.stringify(body) })).json();
  const get = async (qs) => (await mf.dispatchFetch("http://x/api/?token=mem-d483&" + qs)).json();
  const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

  /* NEGATIVE CONTROL FOR THIS CORRECTION, RUN 2026-09-24 at c20-batch14, one arm, restored from a
     uniquely-named pristine copy and verified BY sha256 AND BY `cmp` (33,710 B, floored):
       (A) the writer put back on the MACHINE credential (`token = "mem-d483"`), everything else held.
           DECLARED: the suite must FAIL AT THE ACT, naming the refusal. ACTUAL: AS DECLARED — it throws
           `promote ACTN-2026-0011-member-chose-1: {"ok":false,"reason":"MACHINE_CANNOT_SET_RISK_TIER",
           "check":"C-32.19",…}` from `promoteText`, which is the whole point of the change: before it, the
           identical refusal produced a TypeError at `p.action.risk_tier` and a tally of "assertions unknown".
     BASELINE, unarmed, before and after: 58 pass / 0 fail. */
  /* CORRECTED 2026-09-24 AT INTEGRATION (c20-batch14), never exempted, and it is section 3's correction
     arriving here one landing later — the note at the head of section 3 describes this exact pair of defects
     and this block was written on a base that did not yet carry the fix.
       (1) THE WRITER WAS A MACHINE. These arms promote through `token=mem-d483`, the MEMBER_TOKEN DEPLOY
           credential, which the control plane stamps `token:member` — a MACHINE identity by REC-46's one
           predicate, not a member. REC-189's fence (C-32.19, on BOB #21's D-182 and widened by BOB #32)
           refuses a machine credential that STATES a tier of 1, 2 or 3, so on this union every arm below
           promoted nothing. The arms claim "a member choosing tier N", so the member is now a SIGNED-IN
           SESSION's, exactly as section 3's writer is.
       (2) THE THROW WAS VACUOUS. The refusal arrives WRAPPED — MEASURED at the op on this tree:
           `{"ok":true,"result":{"ok":false,"reason":"MACHINE_CANNOT_SET_RISK_TIER","check":"C-32.19",…}}` —
           so `r.ok === false` read `undefined`, a refused promote went on as if it had landed, and the suite
           died at `p.action.risk_tier` with a TypeError that went through NO assertion at all (the tally read
           "assertions unknown"). It now reads through `rP` and demands `ok === true`, so a refusal throws by
           name at the act instead of surfacing as a null three lines later.
     The old arms were right about the SUBJECT — D-483's chooser writes what the member picked — and wrong
     about WHO was writing. Neither figure nor claim is weakened: the same three tiers and the same no-choice
     case are driven, through a caller the fence lets author. */
  const RUTH = await (async () => {
    const add = rP(await post("memberadd", { memberId: "ruth", cover: "cover for ruth", role: "admin",
                                             capabilities: ["contribute"] }, "adm-d483"));
    const en = rP(await (await mf.dispatchFetch("http://x/api/?op=enroll",
      { method: "POST", body: JSON.stringify({ invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" }) })).json());
    if (!en?.ok) throw new Error(`enroll ruth: ${JSON.stringify(en)}`);
    const lg = rP(await (await mf.dispatchFetch("http://x/api/?op=login",
      { method: "POST", body: JSON.stringify({ role: "member:ruth", password: "ruth-passphrase-1" }) })).json());
    if (!lg?.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
    return lg.token;
  })();

  let seq = 0;
  const promoteText = async (id, text, token = RUTH) => {
    const r = rP(await post("promote", {
      bundleId: id, base: null, snapKey: `20260724T020000Z_d483${String(++seq).padStart(4, "0")}`,
      author: "member-ruth",
      meta: { object_type: "action", group: "believe-in-oakland", title: "Intake check",
              current_state: "planned", created: NOW, last_updated: NOW },
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    }, token));
    if (r?.ok !== true) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
    return r;
  };
  const projection = async (id) => rP(await get(`op=projection&id=${encodeURIComponent(id)}`));
  const stored = async (id) => (await get(`op=image&id=${encodeURIComponent(id)}`)).result["bundle.md"];

  /* THE ROW'S accepts-when, both halves, through a route a caller has. Tier 1 is driven as well as 2: the
     control must still let a member author FILE FREELY, which is the over-strictness direction — a fix that
     made the riskiest-sounding value unwritable would pass every arm about undetermined. */
  const CHOSEN = [[1, "ACTN-2026-0011-member-chose-1"], [2, "ACTN-2026-0012-member-chose-2"],
                  [3, "ACTN-2026-0013-member-chose-3"]];
  for (const [tier, id] of CHOSEN) {
    await promoteText(id, bytesFor(tier, id));
    const p = await projection(id);
    t(`a member choosing tier ${tier} has it WRITTEN THROUGH THE OP: op=projection reads ${tier}`,
      p.action.risk_tier, tier);
    t(`…in the plane's words for ${tier}, not the page's`, p.action.risk_tier_words, RISK_TIERS[tier]);
    t(`…and the stored column and the document's own bytes both say ${tier}`,
      [p.action_risk_tier, new RegExp("^risk_tier: " + tier + "$", "m").test(await stored(id))], [tier, true]);
  }

  const NONE = "ACTN-2026-0014-member-chose-nothing";
  await promoteText(NONE, bytesFor(null, NONE));
  const pn = await projection(NONE);
  t("a member choosing NOTHING still writes undetermined: op=projection reads undetermined",
    pn.action.risk_tier, "undetermined");
  t("…carrying the plane's undetermined sentence", pn.action.risk_tier_words, RISK_TIERS.undetermined);
  t("…and the stored column holds NO tier while the bytes SAY undetermined (absence stated, not omitted)",
    [pn.action_risk_tier, /^risk_tier: undetermined$/m.test(await stored(NONE))], [null, true]);
  t("…and no tier 1 reached those bytes", /^risk_tier:\s*1\s*$/m.test(await stored(NONE)), false);

  const audit = (await get("op=audit&limit=1000")).result;
  t("op=audit: none of the four actions this page wrote draws C-2.10", audit.tally?.["C-2.10"] ?? 0, 0);

  await mf.dispose();
}

/* ------------------------------------------------- 7. D-505: the fence asks the DOCUMENT, not the envelope */
/* D-505 (`BIO_Case_Making_v0_1.md` §2, `risk_tier`, with BOB #32's 2026-09-24 rule; row order SCHEDULER #18).
 *
 * WHAT REC-189 LEFT OPEN, and it was not visible from the row. REC-189 put C-32.19 inside `promote`'s action
 * block, and that block opens on `normalizeType(meta.object_type) === "action"` — the CALLER'S envelope. But
 * nothing downstream of the write reads the envelope for this: `#projectRow` writes
 * `action_risk_tier: fm.object_type === "action" ? num(fm.risk_tier) : null` off the promoted BYTES, and
 * `query.mjs` maps the `risk:` search onto that column. MEASURED 2026-09-24 through op=promote before the fix:
 * a machine credential promoting a document whose bytes say `object_type: action` and `risk_tier: 1`, under
 * `meta: { object_type: "information" }`, LANDED — the stored bundle.md carried tier 1, `action_risk_tier` read
 * 1, and `op=search q=risk:1` returned the bundle. The fence was on one spelling of "this is an action" and the
 * record was on another, so the one field carrying legal exposure was machine-settable by renaming the envelope.
 *
 * THE FIX IS A UNION, so this section's load-bearing arms are the OVER-STRICTNESS ones: the old shape must
 * still refuse (the predicate was added to, not swapped), a promote that reaches the union with NO tier must
 * still land, and a MEMBER's must still land and read its tier — the fence is about WHO writes, and widening
 * what counts as an action must not have widened who is refused.
 *
 * CORRECTED 2026-09-24 BY D-510, NEVER EXEMPTED, and the shape of the correction is recorded because the
 * arms did not merely move. D-510 makes `promote` REFUSE an envelope whose stated type contradicts the
 * document's (ENVELOPE_TYPE_DISAGREES, C-86.1), above this fence, so THE DIVERGENT ENVELOPE NO LONGER
 * REACHES C-32.19 AT ALL: arms (i), (iii), (v) and (vi) were written on that shape and would have gone green
 * for free on a refusal that is not this fence's. The arms that test the UNION are moved to the shape that
 * still reaches it — an envelope stating NO type, where the DOCUMENT is the only thing saying `action` — and
 * (i) is re-pointed at the new refusal so the divergent shape is still driven to a named answer. Arm (vii),
 * which asserted that `action_risk_tier` and `bundles.object_type` DISAGREED, is INVERTED rather than
 * deleted: that disagreement is exactly what D-510 closed. Every correction carries its reason at its site.
 *
 * WHAT THIS SECTION CANNOT SEE, stated rather than left to be discovered: the `!pkg.replay` exemption. A
 * machine credential that puts `replay: true` in the promote body still lands a stated tier, and arm (ix)
 * PINS that as the behaviour on this tree rather than smoothing it. It is a DELIBERATE closure at the site
 * (the record's own history must be holdable verbatim) whose exemption is nevertheless CALLER-ASSERTED, and
 * that is D-505's reported finding, routed rather than fixed here: the fix spans every replay-exempt arm in
 * `promote`, not this one, and REC-173's server-verified migration replay is its precedent.
 */
console.log("\n--- 7. D-505: the fence reads the DOCUMENT's type, not the envelope's (D-510: and a disagreeing envelope is refused above it) ---");
{
  const SRC = join(SRC_DIR, "index.mjs");
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    bindings: { ADMIN_TOKEN: "adm-d505", MEMBER_TOKEN: "mem-d505", PROBE_TOKEN: "prb-d505", VERSION: "test" },
  });
  const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
  const get = async (qs) => rP(await (await mf.dispatchFetch("http://x/api/?token=mem-d505&" + qs)).json());
  const post = async (op, body, token = "mem-d505") =>
    rP(await (await mf.dispatchFetch("http://x/api/?op=" + op + "&token=" + token,
      { method: "POST", body: JSON.stringify(body) })).json());

  /* MACHINE is the MEMBER_TOKEN deploy credential, which the control plane stamps `token:member` — a MACHINE
     identity by REC-46's one predicate, and the identity REC-189's fence is about. MEMBER is a signed-in
     session, the only caller the fence lets author a tier. Section 3's note has the receipts for the pair. */
  const MEMBER = await (async () => {
    const add = await post("memberadd", { memberId: "ruth", cover: "cover for ruth", role: "admin",
                                          capabilities: ["contribute"] }, "adm-d505");
    const en = rP(await (await mf.dispatchFetch("http://x/api/?op=enroll",
      { method: "POST", body: JSON.stringify({ invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" }) })).json());
    if (!en?.ok) throw new Error(`enroll ruth: ${JSON.stringify(en)}`);
    const lg = rP(await (await mf.dispatchFetch("http://x/api/?op=login",
      { method: "POST", body: JSON.stringify({ role: "member:ruth", password: "ruth-passphrase-1" }) })).json());
    if (!lg?.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
    return lg.token;
  })();

  let seq = 0;
  /* ONE driver for every arm, so the ONLY thing an arm varies is what it names: the envelope's type, the
     credential, the tier lines, and whether it asserts `replay`. It RETURNS the answer rather than throwing,
     because half these arms are about a refusal. */
  /* `noMetaType` ADDED 2026-09-24 BY D-510, and it is what keeps this section driving D-505's union after
     that landing: `promote` now refuses an envelope whose stated type contradicts the document's, so the
     DIVERGENT shape can no longer reach C-32.19 at all. The shape that still reaches the union's DOCUMENT
     arm is an envelope that states NO type — the document is then the only thing saying `action`, which is
     exactly the half a document-only-blind predicate would lose. */
  const promote = async (id, tierLines, { metaType = "action", token = "mem-d505", base = null, extra = {},
                                          noMetaType = false } = {}) => {
    const text = actionMd(id, tierLines);
    const meta = { group: "believe-in-oakland", title: "Records request",
                   current_state: "planned", created: NOW, last_updated: NOW };
    if (!noMetaType) meta.object_type = metaType;
    return post("promote", {
      bundleId: id, base, snapKey: `20260724T030000Z_d505${String(++seq).padStart(4, "0")}`,
      author: "member-ruth", meta,
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [], ...extra,
    }, token);
  };

  /* (i) THE ROW'S ARM. The envelope says information; the bytes say action and state tier 1.
     CORRECTED 2026-09-24 BY D-510, NEVER EXEMPTED — and the old assertions are quoted here because they were
     RIGHT WHEN WRITTEN and the reason they stopped being right is the point. This read
     `MACHINE_CANNOT_SET_RISK_TIER` / `C-32.19` / *"only a member's authored act sets 1, 2 or 3"*. D-510
     refuses a divergent envelope OUTRIGHT — `ENVELOPE_TYPE_DISAGREES`, C-86.1 — at the top of `promote`'s
     type-dependent region, above this fence, because the request contradicts itself before any question
     about who may set a tier arises. D-505's guarantee is kept A FORTIORI: this promote still lands nothing,
     which (ii) drives from the read side. What is LOST is that this shape drives the union; arm (i-b) below
     is the shape that still does, and it is added rather than the coverage being quietly given up. */
  const DIVERGENT = "ACTN-2026-0021-divergent-envelope";
  const refused = await promote(DIVERGENT, TIER.one, { metaType: "information" });
  t("a MACHINE promote calling its action `information` in the envelope is refused BY NAME",
    [refused?.ok, refused?.reason], [false, "ENVELOPE_TYPE_DISAGREES"]);
  t("…and the refusal names the check the catalogue holds", refused?.check, "C-86.1");
  t("…and says what it is about: the document's word against the envelope's, and that nothing was written",
    /The record goes by the document/.test(refused?.detail ?? "")
      && /Nothing was written\./.test(refused?.detail ?? ""), true);

  /* (i-b) AND THE UNION, STILL DRIVEN — added 2026-09-24 by D-510 for the coverage (i) gave up. The envelope
     states NO type at all, so the DOCUMENT is the only thing saying `action`: D-510 does not refuse that (it
     is not a disagreement, it is a silence), and C-32.19 must still refuse the tier. A document-only-blind
     predicate — REC-189's original `meta.object_type` alone — LANDS this, which is what makes the arm
     discriminating rather than decorative. */
  const NOENV = "ACTN-2026-0029-envelope-states-no-type";
  const noEnv = await promote(NOENV, TIER.one, { noMetaType: true });
  t("a MACHINE promote whose envelope states NO type still reaches C-32.19 off the document's own bytes",
    [noEnv?.ok, noEnv?.reason, noEnv?.check], [false, "MACHINE_CANNOT_SET_RISK_TIER", "C-32.19"]);

  /* (ii) NOTHING LANDED. The refusal is worth nothing if the bytes arrived anyway — and this is the arm that
     would have caught the defect from the READ side, which is where a reader meets it. */
  /* CORRECTED BEFORE LANDING, by this section's OWN control arm A (below): this read `gone?.ok === true`
     against `false`, and it PASSED WITH THE FENCE REMOVED — op=projection's answer carries no `ok` key at
     all, so the arm compared `undefined === true` and was VACUOUS in both directions. It now asks for the
     one field a landed bundle certainly has. WORKER.md's shape: a headline totality assertion that passes
     over nothing, found by the control rather than by reading. */
  const gone = await get(`op=projection&id=${encodeURIComponent(DIVERGENT)}`);
  t("…and NOTHING landed: no bundle of that id exists to project", gone?.bundle_id ?? null, null);
  const at1 = await get(`op=search&q=${encodeURIComponent("risk:1")}`);
  t("…and no search at risk:1 finds it (the column the defect reached is empty)",
    (at1?.hits ?? []).map((h) => h.bundle_id).includes(DIVERGENT), false);

  /* (iii) THE SAME DIVERGENCE ON A REVISION, which is BOB #32's clause reached through the envelope: once a
     member has set a tier the machine may not write it AT ALL, dropping it included. */
  /* TWO SEPARATE HELD ACTIONS, ONE PER ARM, AND THAT IS A CORRECTION THIS SECTION'S OWN CONTROL FORCED: the
     first draft revised ONE bundle twice off ONE base, so with the fence removed the DROP landed, the base
     went stale, and the CHANGE arm came back `CAS_STALE` — failing for the wrong reason — after which the
     read-back died on `still.action` with a TypeError, which goes through NO assertion at all (WORKER.md).
     An arm that cannot fail for its own reason proves nothing about the fence. */
  const heldTwo = async (id) => {
    const made = await promote(id, TIER.two, { token: MEMBER });
    if (made?.ok !== true) throw new Error(`member promote ${id}: ${JSON.stringify(made)}`);
    return get(`op=projection&id=${encodeURIComponent(id)}`);
  };
  const tierOf = async (id) => (await get(`op=projection&id=${encodeURIComponent(id)}`))?.action?.risk_tier ?? null;
  const DROP = "ACTN-2026-0022-member-set-two-drop";
  const CHANGE = "ACTN-2026-0027-member-set-two-change";
  const pDrop = await heldTwo(DROP);
  const pChange = await heldTwo(CHANGE);
  t("a member's 2 lands and reads 2 (the held tier these arms are about)",
    [pDrop.action.risk_tier, pChange.action.risk_tier], [2, 2]);
  /* CORRECTED 2026-09-24 BY D-510, NEVER EXEMPTED, for the reason at (i): these two read
     `MACHINE_CANNOT_SET_RISK_TIER` and a divergent envelope no longer reaches that fence. They are moved to
     the envelope-states-NO-type shape rather than re-pointed at the new code, because what BOB #32's clause
     needs driven is that a machine may neither DROP nor CHANGE a member's tier — not which refusal a
     self-contradicting request meets. The old code is asserted at (i) instead. */
  const dropped = await promote(DROP, TIER.absent, { noMetaType: true, base: pDrop.bundle_sha });
  t("a MACHINE revision whose envelope states no type may not DROP the member's 2 either",
    [dropped?.ok, dropped?.reason], [false, "MACHINE_CANNOT_SET_RISK_TIER"]);
  const changed = await promote(CHANGE, TIER.three, { noMetaType: true, base: pChange.bundle_sha });
  t("…nor CHANGE it to 3 under one", [changed?.ok, changed?.reason], [false, "MACHINE_CANNOT_SET_RISK_TIER"]);
  t("…and each member's tier is untouched after its refusal",
    [await tierOf(DROP), await tierOf(CHANGE)], [2, 2]);

  /* (iv) OVER-STRICTNESS: the predicate was ADDED TO, not swapped. The shape REC-189 refuses is refused still. */
  const plain = await promote("ACTN-2026-0023-plain-envelope", TIER.one);
  t("OVER-STRICTNESS: the envelope-says-action shape REC-189 built is refused exactly as before",
    [plain?.ok, plain?.reason], [false, "MACHINE_CANNOT_SET_RISK_TIER"]);

  /* (iv-b) AND THE OTHER HALF OF THE UNION, PINNED — added because THIS SECTION'S OWN CONTROL ARM C found it
     unpinned. Every arm above hands the plane a document whose bytes say `object_type: action`, so a swap of
     the union for a DOCUMENT-ONLY predicate left all 76 assertions green: the suite could not tell the union
     from half of it, and a later "simplification" would have silently given back REC-189's reach. The
     discriminating shape is the mirror of the row's: the ENVELOPE says action and the document carries no
     `object_type` at all. REC-189 refuses it; the union must keep refusing it; a document-only predicate does
     not (measured: it LANDS). The arm asserts the REASON, so a refusal under some other name does not pass it. */
  const noType = actionMd("ACTN-2026-0028-envelope-only", TIER.one)
    .replace(/^object_type: action\n/m, "");
  const envelopeOnly = await post("promote", {
    bundleId: "ACTN-2026-0028-envelope-only", base: null, snapKey: "20260724T030000Z_d505env0",
    author: "member-ruth",
    meta: { object_type: "action", group: "believe-in-oakland", title: "Records request",
            current_state: "planned", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: noType, bytes: noType.length, sha256: sha(noType) }], register: [],
  });
  t("OVER-STRICTNESS, the mirror: the ENVELOPE alone saying action still reaches the fence",
    [envelopeOnly?.ok, envelopeOnly?.reason], [false, "MACHINE_CANNOT_SET_RISK_TIER"]);

  /* (v) OVER-STRICTNESS: the union costs a machine nothing where no tier is at stake. A divergent envelope is
     not itself the offence — stating a tier is. */
  /* CORRECTED 2026-09-24 BY D-510, NEVER EXEMPTED: this read `metaType: "information"` and asserted the
     promote LANDED, which was true and is not any more — D-510 refuses the divergent envelope itself. The
     arm's CLAIM is unchanged and is still the one worth making (the union costs a machine nothing where no
     tier is at stake), so it is moved to the envelope-states-no-type shape, where the union is still what
     decides. */
  const NOTIER = "ACTN-2026-0024-divergent-no-tier";
  const landed = await promote(NOTIER, TIER.undetermined, { noMetaType: true });
  t("OVER-STRICTNESS: a machine's promote reaching the union but stating NO tier still LANDS", landed?.ok, true);
  t("…and reads undetermined, with no tier in the stored column",
    [(await get(`op=projection&id=${encodeURIComponent(NOTIER)}`)).action_risk_tier], [null]);

  /* (vi) OVER-STRICTNESS, the direction that matters most: the fence is about WHO WRITES. Widening what counts
     as an action must not have widened who is refused, so a MEMBER's divergent promote still authors a tier. */
  /* CORRECTED 2026-09-24 BY D-510, NEVER EXEMPTED: this read `metaType: "information"` and asserted the
     MEMBER's divergent promote LANDED. D-510's refusal is about the REQUEST and not about the credential, so
     a member's self-contradicting envelope is refused too — that is a deliberate widening and it is asserted
     as its own arm in `d510-promoted-type.test.mjs` §2. What THIS arm is for is unchanged and still needed:
     the C-32.19 fence is about WHO WRITES, so widening what counts as an action must not have widened who is
     refused. It is moved to the shape that still reaches the union. */
  const MDIV = "ACTN-2026-0025-member-divergent";
  const mlanded = await promote(MDIV, TIER.three, { noMetaType: true, token: MEMBER });
  t("OVER-STRICTNESS: a MEMBER's promote reaching the union by the document alone still LANDS", mlanded?.ok, true);
  const mp = await get(`op=projection&id=${encodeURIComponent(MDIV)}`);
  /* (vii) INVERTED 2026-09-24 BY D-510, AND THE INVERSION IS THE ITEM. This arm asserted the DISAGREEMENT the
     fix rested on: `action_risk_tier` 3 read off the document while `object_type` read `information` off the
     envelope. That disagreement is what D-510 closed — `bundles.object_type` is now the DOCUMENT's own type —
     so the arm asserts the agreement instead of being deleted, and it still discriminates in the direction
     that matters: it fails over a store that had simply stopped projecting tiers, and it fails again the day
     anything goes back to typing a bundle from its envelope. */
  t("the stored tier column is derived from the DOCUMENT's object_type…", mp.action_risk_tier, 3);
  t("…and since D-510 the bundle's own type is derived from the SAME bytes: they can no longer disagree",
    mp.object_type, "action");

  /* (viii) THE MATCHER'S REACH, stated: `promote` is the ONE writer of `bundle.md` in `src/store.mjs`, so a
     fence there is a fence on the write. Pinned structurally, because the sentence above is load-bearing and
     a second writer added later would silently make it false. */
  const storeSrc = readFileSync(join(SRC_DIR, "store.mjs"), "utf8");
  const inserts = storeSrc.match(/INSERT INTO files \(bundle_id,path,content,blob_sha,bytes,sha256\)/g) ?? [];
  t("…and `promote` is still the ONE writer of a bundle's files in src/store.mjs", inserts.length, 1);

  /* (ix) THE RESIDUE — INVERTED 2026-09-24 BY D-511, NEVER DELETED, WHICH IS WHAT D-505 WROTE IT FOR. It asserted
     a HOLE, deliberately: a machine credential asserting `replay` in the body still landed a stated tier, because
     the exemption was the CALLER'S to claim and nothing removed the flag from the request body. BOB #33 ruled on
     that finding (INVESTIGATIVE-SESSION.md §11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S") and
     D-511 built step (1): `index.mjs`'s promote stamp block deletes a caller's `replay` unless the call arrives
     under the ADMIN class with no session. So the same package now reaches C-32.19 and is refused BY NAME, and the
     arm says the same thing from the other side. THE READ-BACK IS DEFENSIVE rather than destructured: the version
     of this arm that went red on D-511's tree then died on `.action` of a null answer, a TypeError that goes
     through NO assertion at all and ends the module while the tally reads clean (WORKER.md) — measured here, and
     corrected here. Section 8 drives the rule itself, across the callers it distinguishes. */
  const REPLAYED = "ACTN-2026-0026-machine-asserted-replay";
  const replayed = await promote(REPLAYED, TIER.one, { extra: { replay: true } });
  t("D-511 (the inversion of D-505's residue arm): a MACHINE asserting `replay` is now REFUSED BY NAME — the flag "
    + "is deleted before the store sees it, so C-32.19 judges the promotion as what it is",
    [replayed?.ok, replayed?.reason, replayed?.check], [false, "MACHINE_CANNOT_SET_RISK_TIER", "C-32.19"]);
  t("…and NOTHING landed: no bundle of that id exists to project, so the record publishes no tier at all",
    (await get(`op=projection&id=${encodeURIComponent(REPLAYED)}`))?.bundle_id ?? null, null);
  t("…and no search at risk:1 finds it either — the column D-505 measured the defect in is empty",
    ((await get(`op=search&q=${encodeURIComponent("risk:1")}`))?.hits ?? [])
      .map((h) => h.bundle_id).includes(REPLAYED), false);

  await mf.dispose();
}

/* =========================================================================================================
 * 8. D-511: `replay` IS THE SERVER'S WORD, NEVER THE CALLER'S.
 *
 * INVESTIGATIVE-SESSION.md §11 item 5, RULED 2026-09-24 by BOB #33 on D-505's finding. Step (1), a FENCE: the
 * plane deletes a caller's `replay` unless the call arrives under the ADMIN class with NO SESSION — the one class
 * `migrate.mjs` uses (REC-173 narrowed it, and the tool refuses to run under any other). Step (2), the end state,
 * is a BUILD and is not this row's: every replayed promotion names a drive-provenance capture the plane verifies.
 *
 * WHY THE ARMS BELOW DRIVE THE MANIFEST AND NOT ONLY A REFUSAL. A refusal shows a fence fired; it does not show
 * the FLAG was removed, and those are different claims. `promote` writes `kind: pkg.replay ? "promotion-replay" :
 * "promotion"` into the history a reader can see, so the manifest is the one place the record says out loud what
 * it took the promotion to BE. A session's promotion that lands is the discriminating case, because a member may
 * author a tier and no fence refuses her — what must be true is that the record does not call her act a replay.
 *
 * WHY THE SESSION ARM IS THE LOAD-BEARING ONE, AND WHICH SESSION IT HAD TO BE — CORRECTED BY THIS SECTION'S OWN
 * CONTROL BEFORE LANDING, and recorded rather than smoothed. `index.mjs`'s session block sets `cls = kind` from
 * `sess.role === "admin" ? "admin" : "member"`, and the first draft of this section asserted that an ADMIN-ROLE
 * MEMBER'S session therefore arrives as `cls === "admin"`. THE CONTROL'S `any-session` ARM CAME BACK GREEN, which
 * is a finding about the ARM: measured through `op=whoami`, ruth's session arrives as `member`, because
 * `sessions.role` for a member login is the string `member:<id>` and `m.role === "admin"` only decides her
 * CAPABILITIES (`Store#sessionRights`). The session that arrives as the ADMIN class is the FOUNDER'S — the one
 * whose `sessions.role` is literally `admin` (`Store.ROOT_ADMIN`, `rootOfTrust: true`), created by `op=claim` and
 * `op=login`. That is the session `op=export` refuses in this file with *"this refuses the founder's own browser
 * too, which is the one place in this system where being the founder is not enough"*, and it is the one caller for
 * which `!viaSession` and not the class test decides. So arm (β) is driven under the FOUNDER, the REACH arm below
 * measures all four callers' classes rather than asserting them, and `any-session` now fails by name.
 *
 * WHAT THIS SECTION CANNOT SEE, stated rather than left to be discovered: it drives `op=promote`, which is the one
 * door that hands a caller's body to `Store#promote` (`src/store.mjs`'s op table calls `this.promote(body)`; every
 * other `this.promote({...})` in that file builds its package server-side and none passes `replay`). It cannot see
 * a caller outside this repository, and the structural arm below cannot see the delete respelled as an assignment.
 * ========================================================================================================= */
console.log("\n--- 8. D-511: `replay` is the server's word, never the caller's ---");
{
  const SRC = join(SRC_DIR, "index.mjs");
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    /* D-512: evidence storage, so arm (δ)'s drive-provenance capture can be HELD and the replay VERIFIED. */
    r2Buckets: ["CAPTURES"],
    bindings: { ADMIN_TOKEN: "adm-d511", MEMBER_TOKEN: "mem-d511", PROBE_TOKEN: "prb-d511", VERSION: "test" },
  });
  const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
  const getAs = async (token, qs) => rP(await (await mf.dispatchFetch(`http://x/api/?token=${token}&` + qs)).json());
  const get = (qs) => getAs("mem-d511", qs);
  const post = async (op, body, token) =>
    rP(await (await mf.dispatchFetch("http://x/api/?op=" + op + "&token=" + token,
      { method: "POST", body: JSON.stringify(body) })).json());

  /* THE FOUNDER'S SESSION: `op=claim` spends the bootstrap credential, `op=login` (role `admin` by default) mints
     a session whose stored role is the literal `admin`, which is the one session `classify`'s successor reads as
     the ADMIN class. The deploy token keeps working afterwards, which the REACH arm below measures. */
  const claimed = await post("claim", { bootstrapToken: "adm-d511", password: "founder-passphrase-d511" }, "");
  const fl = await post("login", { password: "founder-passphrase-d511" }, "");
  const FOUNDER = fl?.token;
  t("FIXTURE: the founder claimed this instance and signed in, so the one SESSION that arrives as the ADMIN class "
    + "exists to be driven", [claimed?.ok, typeof FOUNDER], [true, "string"]);

  /* AN ORDINARY MEMBER'S SESSION, for the over-strictness direction: the fence must cost an honest caller nothing. */
  const RUTH = await (async () => {
    const add = await post("memberadd", { memberId: "ruth", cover: "cover for ruth", role: "admin",
                                          capabilities: ["contribute"] }, "adm-d511");
    const en = rP(await (await mf.dispatchFetch("http://x/api/?op=enroll",
      { method: "POST", body: JSON.stringify({ invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" }) })).json());
    if (!en?.ok) throw new Error(`enroll ruth: ${JSON.stringify(en)}`);
    const lg = rP(await (await mf.dispatchFetch("http://x/api/?op=login",
      { method: "POST", body: JSON.stringify({ role: "member:ruth", password: "ruth-passphrase-1" }) })).json());
    if (!lg?.token) throw new Error(`login ruth: ${JSON.stringify(lg)}`);
    return lg.token;
  })();

  /* REACH, AND IT IS WHAT THE SECTION HEADER RESTS ON: the class the plane reads for each caller, asked of the
     plane rather than assumed. If ruth's session did not arrive as the ADMIN class, arm (β) would be measuring the
     class test and not the session test, and the control's `any-session` arm could not fail. */
  const clsOf = async (token) => {
    const w = await getAs(token, "op=whoami");
    return [w?.tokenClass ?? null, w?.session ?? null];
  };
  t("REACH, MEASURED AND NOT ASSERTED: the FOUNDER'S session is the one session that arrives as the ADMIN class, "
    + "exactly as the deploy token does — so `!viaSession` and not the class test is what tells her browser from "
    + "the root of trust; an admin-ROLE member's session arrives as `member`, which is what the control caught",
    [await clsOf(FOUNDER), await clsOf(RUTH), await clsOf("adm-d511"), await clsOf("mem-d511")],
    [["admin", true], ["member", true], ["admin", false], ["member", false]]);

  let seq = 0;
  /* `proof: true` (D-512): the package names a held drive-provenance capture listing it (`replay-proof.mjs`), the
     only form of `replay` BOB #33's step (2) honours. */
  const promote = async (id, token, { proof = false, ...extra } = {}) => {
    const text = actionMd(id, TIER.one);
    const pkg = {
      bundleId: id, base: null, snapKey: `20260724T040000Z_d511${String(++seq).padStart(4, "0")}`,
      author: "member-ruth",
      meta: { object_type: "action", group: "believe-in-oakland", title: "Records request",
              current_state: "planned", created: NOW, last_updated: NOW },
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [], ...extra,
    };
    return post("promote", proof ? await withReplayProof(mf, `token=${token}`, pkg) : pkg, token);
  };
  /* The history's own word for what a promotion was. Read defensively: a missing manifest FAILS the arm rather
     than ending the module on a TypeError, which is what the previous shape of arm (ix) did when it went red. */
  const kindOf = async (id) => {
    const raw = (await get(`op=image&id=${encodeURIComponent(id)}`))?.["_history/manifest.json"] ?? null;
    if (typeof raw !== "string") return null;
    try { return (JSON.parse(raw).entries ?? [])[0]?.kind ?? null; } catch { return "UNPARSEABLE"; }
  };

  /* (α) THE FIXTURE, AND IT IS AN ARM: an admin-ROLE member's session is the caller the rule's second half is
     about, and the whole section is vacuous if she never landed anything. */
  const SESS_PLAIN = "ACTN-2026-0511-session-no-replay";
  const plain = await promote(SESS_PLAIN, RUTH);
  t("FIXTURE/OVER-STRICTNESS: an ordinary member's session promoting an action with tier 1 and NO `replay` lands, "
    + "exactly as before — the fence costs an honest caller nothing",
    [plain?.ok, await kindOf(SESS_PLAIN), (await get(`op=projection&id=${encodeURIComponent(SESS_PLAIN)}`))?.action?.risk_tier],
    [true, "promotion", 1]);

  /* (β) THE SESSION HALF, DRIVEN AT THE RECORD, UNDER THE ONE SESSION THE CLASS TEST CANNOT TELL APART FROM THE
     ROOT OF TRUST. The founder is not a machine identity, so C-32.19 does not refuse her tier and no fence fires —
     which is exactly why this arm asks the MANIFEST instead. `promote` writes `kind: pkg.replay ?
     "promotion-replay" : "promotion"` into the history a reader can see, so the manifest is where the record says
     what it took the act to BE. Her `replay: true` must reach the store as no flag at all. This is the arm
     `!viaSession` exists for, and the control's `any-session` arm is the proof that it is. */
  const SESS_REPLAY = "ACTN-2026-0511-founder-asserts-replay";
  const sessReplay = await promote(SESS_REPLAY, FOUNDER, { replay: true });
  t("D-511 (β), THE SESSION HALF: the FOUNDER'S session sending `replay: true` lands — she authors tiers and no "
    + "fence refuses her — but the history records a `promotion`, NEVER a `promotion-replay`: her flag never "
    + "reached the store, though her class is the very class the exemption belongs to",
    [sessReplay?.ok, await kindOf(SESS_REPLAY)], [true, "promotion"]);

  /* (γ) THE MACHINE HALF, a second class beside section 7's member token, so the rule is not read as a two-case
     list the next class would fall outside. */
  const PROBE_REPLAY = "ACTN-2026-0511-probe-asserts-replay";
  const probeReplay = await promote(PROBE_REPLAY, "prb-d511", { replay: true });
  t("D-511 (γ): the PROBE deploy token's `replay: true` is refused C-32.19 by name too",
    [probeReplay?.ok, probeReplay?.reason, probeReplay?.check], [false, "MACHINE_CANNOT_SET_RISK_TIER", "C-32.19"]);

  /* (δ) THE ADMIN CLASS WITH NO SESSION — THE MIGRATION PATH, AND THE RESIDUE, INVERTED 2026-09-24 BY D-512, NEVER
     DELETED, WHICH IS WHAT D-511 WROTE IT FOR. It PINNED a residue: the root of trust sending `replay: true` with no
     drive-provenance capture landed a stated tier 1 and the record published it, because step (1) kept the admin's
     flag as the admin's own word. BOB #33's step (2) honours `replay` only where the plane VERIFIES it against the
     held provenance, so the same bare package is now REFUSED by name (C-66.6) and the record publishes nothing; and
     the migration path the exemption exists for survives in the only form it ever had honestly — a replay that
     SHOWS its provenance lands as a `promotion-replay`. The member token carrying the same proof is still judged by
     C-32.19: the class test is kept as the second condition, as BOB #33 ruled. */
  const ADMIN_REPLAY = "ACTN-2026-0511-root-asserts-replay";
  const adminReplay = await promote(ADMIN_REPLAY, "adm-d511", { replay: true });
  const RU = CHECK_CATALOGUE_SURFACE.REPLAY_UNVERIFIED;
  t("D-512 (δ), THE INVERSION OF D-511'S RESIDUE ARM: the ADMIN class with NO SESSION asserting `replay` with no "
    + "drive-provenance capture to show is REFUSED BY NAME, REPLAY_UNVERIFIED (C-66.6), with its canned translation",
    [adminReplay?.ok, adminReplay?.reason, adminReplay?.check, adminReplay?.translation === RU?.translation && !!RU?.translation],
    [false, "REPLAY_UNVERIFIED", "C-66.6", true]);
  t("RESIDUE CLOSED (BOB #33 step (2), BUILT BY D-512): nothing landed — the root of trust can no longer state a tier "
    + "under a replay it cannot show, and the record publishes none",
    (await get(`op=projection&id=${encodeURIComponent(ADMIN_REPLAY)}`))?.bundle_id ?? null, null);
  const ADMIN_PROVEN = "ACTN-2026-0512-root-shows-replay";
  const adminProven = await promote(ADMIN_PROVEN, "adm-d511", { replay: true, proof: true });
  t("D-512 (δ) OVER-STRICTNESS, THE MIGRATION PATH: the ADMIN class replaying the same action over a held "
    + "drive-provenance capture that lists this bundle and these bytes LANDS, the history records a "
    + "`promotion-replay`, and the Drive-era tier is carried verbatim",
    [adminProven?.ok, await kindOf(ADMIN_PROVEN),
     (await get(`op=projection&id=${encodeURIComponent(ADMIN_PROVEN)}`))?.action?.risk_tier], [true, "promotion-replay", 1]);
  const MEMBER_PROVEN = "ACTN-2026-0512-member-shows-replay";
  const memberProven = await promote(MEMBER_PROVEN, "mem-d511", { replay: true, proof: true });
  t("D-512 (δ), THE SECOND CONDITION: the MEMBER deploy token carrying the SAME proof is still refused C-32.19 — "
    + "provenance does not hand a class the root of trust's exemption",
    [memberProven?.ok, memberProven?.reason], [false, "MACHINE_CANNOT_SET_RISK_TIER"]);

  /* (ε) AND THE SAME CLASS WITHOUT THE FLAG IS REFUSED, which is what makes (δ) about the FLAG and not about the
     class: D-511 did not hand the admin token a standing exemption from C-32.19. */
  const ADMIN_PLAIN = "ACTN-2026-0511-root-no-replay";
  const adminPlain = await promote(ADMIN_PLAIN, "adm-d511");
  t("D-511 (ε) OVER-STRICTNESS: the ADMIN class promoting the same action with NO `replay` is refused C-32.19 "
    + "exactly as before — the exemption is the flag's, never the class's",
    [adminPlain?.ok, adminPlain?.reason], [false, "MACHINE_CANNOT_SET_RISK_TIER"]);

  /* (ζ) THE MATCHER'S REACH, pinned structurally because the section header's sentence is load-bearing: a SECOND
     place that strips or restores `replay` would make every behavioural arm above true and the rule false. This
     pins the SHAPE (one delete) and not the spelling of its guard, so a respelling of the condition — the
     over-strictness direction — does not fail it. What it cannot see is the delete written as an assignment. */
  /* CORRECTED 2026-09-24 by D-512, never exempted: this pinned ONE `delete b.replay;`, which was the whole rule while
     the class test was. Step (2) reads the caller's flag once and deletes it, so the ONLY write of `b.replay` after
     that is the server's, on a verified replay: TWO deletes (the class test, kept as the second condition, and the
     read-once) and ONE assignment, guarded by the proof. A third site, or an assignment anywhere else, still fails. */
  const idxSrc = readFileSync(SRC, "utf8");
  t("D-511 (ζ), AS D-512 LEFT IT: `src/index.mjs` deletes a caller's `replay` in exactly TWO places and sets it in "
    + "exactly ONE — on a replay the plane verified",
    [(idxSrc.match(/delete b\.replay;/g) ?? []).length, (idxSrc.match(/\bb\.replay\s*=[^=]/g) ?? []).length,
     (idxSrc.match(/if \(proven\) b\.replay = true;/g) ?? []).length], [2, 1, 1]);

  await mf.dispose();
}

console.log(`\nrisk-tier: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
