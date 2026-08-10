/* NEGATIVE CONTROL: RUN 2026-08-09 (PL-17) through `test/sufficiency-state.control.mjs` — EIGHT arms including a BASELINE and an OVER-STRICTNESS arm, each armed ALONE with every other defence held OPEN, every restore verified by sha256 AND by `cmp` against a uniquely-named per-arm pristine copy with a byte count printed and floored against the empty-string digest. Whole: 35 pass, 0 fail. (0) baseline 35/0 · (1) the minted value falls through to `claimed` -> 30/5 · (2) a blank reads as the minted value -> 32/3 · (3) `none:` joins the machine prefixes -> 30/5 · (4) the vocabulary published as a literal copy -> 33/2, and NOTE WHAT DOES NOT FAIL: every wire assertion passes, because an identical copy agrees at zero cost · (5) a text restates its own key -> 33/2 · (6) OVER-STRICTNESS, the value re-spelled -> 35/0 · (7) the state wired into C-25.6, the NEXT item's change made for one run -> 33/2. THREE ARMS CAME BACK OTHER THAN DECLARED AND ALL THREE ARE RECORDED IN THAT DRIVER'S HEADER RATHER THAN SMOOTHED: arm (6) caught this suite HAND-TYPING two case variants of a minted literal; arm (7) caught this suite's SWEEP MATCHER grading sites by the spelling they use today, so a converted site vanished from the sweep while the assertion over it went on passing; arm (3) fell on two pins its declaration did not anticipate and the reason is a design finding, not an instrument one. TO RE-RUN IT IN ONE STEP: `node test/sufficiency-state.control.mjs` from `bio-plane/`. */

/* PL-17 / DEC-65 — THE THIRD `asserted_by` STATE.
 *
 * DEC-65, answered 2026-08-09 by session BOB under Bob's standing delegation:
 * *"take (b) as amended by FL-3 … with the third `asserted_by` state minted
 * FIRST."* FL-3 measured the reason and it is the whole item: under DEC-65's
 * shape (b) a machine's SINGLE-PART ground row would carry `asserted_by:
 * class:ai` **in a field whose published meaning is *a member said this part is
 * enough on its own*** — the record claiming something nobody claimed, which is
 * the overclaim class this project ranks worst. The honest shape is a third
 * state, and this suite holds it to what it must be.
 *
 * WHAT IS ASSERTED, each in the direction that fails:
 *
 *   1. THE STATE IS TOTAL AND IT IS DERIVED, NOT LISTED. Every spelling the
 *      plane itself mints for a machine is composed from the plane's own
 *      `MACHINE_STAMP_PREFIXES` x `ACTOR_CLASSES` and `NON_MEMBER_AUTHORS`
 *      rather than typed here — REC-46's finding was that a word list goes
 *      stale the moment a fourth spelling is written. The corpus is PRINTED and
 *      FLOORED, and the classification is asserted TOTAL IN BOTH DIRECTIONS:
 *      no value reaches a state outside the published set, and no published
 *      state goes unreached.
 *
 *   2. THE BACK DOOR IS SHUT, and this is the assertion the state exists to
 *      earn. DEC-32: the default is AND, and *independent sufficiency is only
 *      ever reached by an affirmative, attributed act*. So over the WHOLE
 *      corpus `isSufficiencyClaimed` answers TRUE for a named member and for
 *      nothing else — not for the new value, not for a blank, not for any
 *      machine spelling. A state that widened what may be CLAIMED would be a
 *      way to reach the maximum without the act, which is the one thing this
 *      mint must not be.
 *
 *   3. "NOBODY SAID" AND "THE RECORD DOES NOT SAY" STAY APART. The new value is
 *      NOT a blank and a blank is NOT the new value, in both directions —
 *      DEC-65's own words, *distinct from both a member's affirmative claim and
 *      from a silent default*. It is the same distinction the machine-identity
 *      block draws when it refuses to call an ABSENT identity a machine one.
 *
 *   4. THE COLLISION PIN. `isMachineIdentity(SUFFICIENCY_UNCLAIMED)` is FALSE,
 *      asserted rather than reasoned about, so that a later addition to
 *      `MACHINE_STAMP_PREFIXES` that swallowed this value fails HERE and loudly
 *      instead of hiding behind the arm ordering inside `sufficiencyClaimState`.
 *
 *   5. THE WORDS A MEMBER READS. Published through
 *      `vocabularies.sufficiency_claim_states`, IMPORTED and never restated
 *      (REC-35's identity pin, fifth restatement), and held to DEC-49's rule
 *      that a term carries the sentence a member reads INSTEAD OF it — plus
 *      DEC-32's ban, which is a constraint on US: *never show AND / OR /
 *      disjunction / grounds — not even as tooltips*.
 *
 *   6. THROUGH THE OP (D-43). A store-level export and a passing battery are
 *      not evidence a caller can reach it, so `op=affordances` is called and the
 *      published map compared against the catalogue's own.
 *
 *   7. WHAT IS **NOT** WIRED, MEASURED RATHER THAN ASSUMED. `C-25.6`, `C-2.8`
 *      and PL-3's endpoint guard are UNCHANGED — DEC-65's sequencing puts them
 *      in the item that owns those files. So this suite goes TO THE CHECK, the
 *      way FL-3 did when it found DEC-65's C-number was wrong, and PINS WHAT
 *      THE GATE ACTUALLY DOES WITH THE VALUE TODAY. That pin is written to FAIL
 *      when the next item wires the state, which is the point: the next item
 *      corrects it and says why, rather than finding it stale.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { SUFFICIENCY_UNCLAIMED, SUFFICIENCY_CLAIM_STATES, sufficiencyClaimState,
         isSufficiencyClaimed, isSufficiencyUnclaimed,
         isMachineIdentity, isMachineStamp,
         MACHINE_STAMP_PREFIXES, ACTOR_CLASSES, NON_MEMBER_AUTHORS,
         basisVersionFindings, checkInquiryBasis } from "../checks/bio-checks.mjs";
import { VOCABULARIES } from "../src/affordances.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const CHECKS = fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url));
const AFFORD = fileURLToPath(new URL("../src/affordances.mjs", import.meta.url));
const CHECKS_SRC = readFileSync(CHECKS, "utf8");
const AFFORD_SRC = readFileSync(AFFORD, "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl17", MEMBER_TOKEN: "mem-pl17", PROBE_TOKEN: "prb-pl17", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/* ================================================================= *
 * 1. THE CORPUS — COMPOSED FROM THE PLANE'S OWN VOCABULARY, PRINTED
 *    AND FLOORED.
 *
 * WHAT THIS MATCHER CAN AND CANNOT SEE, and the sentence is load-bearing.
 * IT CAN see every machine spelling this plane MINTS, because the prefixes and
 * the class words are imported from the module that mints them: a new prefix or
 * a new actor class joins this corpus on its next run without anyone editing
 * this file. IT CANNOT see a machine identity minted by a DIFFERENT system and
 * handed to us as a member's name — `isMachineIdentity` does not claim to, and
 * neither does the field: C-25.6's own comment records the staged
 * named-member-now posture, under which any named identity outside the closed
 * set reads as a member until per-member credentials exist. That limit is the
 * FIELD's, it predates this state, and this state neither widens nor narrows
 * it.
 * ================================================================= */
const MACHINE_SPELLINGS = [
  ...MACHINE_STAMP_PREFIXES.flatMap((p) => ACTOR_CLASSES.map((c) => p + c)),
  ...MACHINE_STAMP_PREFIXES.map((p) => p + "ai"),
  ...ACTOR_CLASSES,
  ...NON_MEMBER_AUTHORS,
  /* CASE-FOLDED AT THE GATE, because the value there is hand-written by a
     caller and `Token:member` is the same claim as `token:member`. */
  "TOKEN:member", "Class:AI",
];
const BLANK_SPELLINGS = ["", "   ", "\t", null, undefined];
/* DERIVED FROM THE CONSTANT, NEVER TYPED, and the first draft typed two of them
   — caught by the OVER-STRICTNESS arm, which re-spells the value and requires
   correct work in an unanticipated spelling to PASS. A hand-typed variant of a
   minted literal is the same defect as a hand-copied number in a document
   nobody re-measures: it agrees for free until the day the literal moves. */
const titleCase = (s) => s.replace(/(^|[-:])([a-z])/g, (_, a, b) => a + b.toUpperCase());
const UNCLAIMED_SPELLINGS = [
  SUFFICIENCY_UNCLAIMED,
  SUFFICIENCY_UNCLAIMED.toUpperCase(),
  titleCase(SUFFICIENCY_UNCLAIMED),
  "  " + SUFFICIENCY_UNCLAIMED + "  ",
];
const MEMBER_SPELLINGS = ["dave", "Ada Lovelace", "j.okonkwo", "member-with-a-hyphen", "none", "unclaimed"];

const CORPUS = [
  ...MACHINE_SPELLINGS.map((v) => [v, "machine_stamped"]),
  ...BLANK_SPELLINGS.map((v) => [v, "unstated"]),
  ...UNCLAIMED_SPELLINGS.map((v) => [v, "unclaimed"]),
  ...MEMBER_SPELLINGS.map((v) => [v, "claimed"]),
];

console.log("\n--- 1. the state is total over a corpus composed from the plane's own vocabulary ---");
console.log(`  corpus: ${CORPUS.length} value(s) — ${MACHINE_SPELLINGS.length} machine spellings `
  + `(${MACHINE_STAMP_PREFIXES.length} minted prefix(es) x ${ACTOR_CLASSES.length} actor class(es), `
  + `plus ${NON_MEMBER_AUTHORS.length} surface/AI identit(ies)), ${BLANK_SPELLINGS.length} blank forms, `
  + `${UNCLAIMED_SPELLINGS.length} spellings of the minted no-claim value, ${MEMBER_SPELLINGS.length} member names`);
/* FLOOR THE REACH. A headline totality assertion passes over an empty corpus —
   measured three times in this repository — so the corpus is asserted non-empty
   at a floor derived from the imported vocabularies rather than at a numeral. */
t("the corpus is non-empty and reaches every minted machine spelling — a totality assertion over an empty set is not evidence",
  CORPUS.length >= (MACHINE_STAMP_PREFIXES.length * ACTOR_CLASSES.length) + NON_MEMBER_AUTHORS.length + 4, true);

t("every value in the corpus reads as the state it belongs to",
  CORPUS.filter(([v, want]) => sufficiencyClaimState(v) !== want).map(([v]) => String(v)), []);
t("no value reaches a state outside the published set — the classifier cannot invent a fifth answer",
  [...new Set(CORPUS.map(([v]) => sufficiencyClaimState(v)))]
    .filter((s) => !(s in SUFFICIENCY_CLAIM_STATES)), []);
t("and every published state is REACHED by the corpus — the other direction, so a state with no producer is named",
  Object.keys(SUFFICIENCY_CLAIM_STATES)
    .filter((k) => !CORPUS.some(([v]) => sufficiencyClaimState(v) === k)), []);

/* ================================================================= *
 * 2. THE BACK DOOR IS SHUT (DEC-32).
 * ================================================================= */
console.log("\n--- 2. DEC-32: independent sufficiency is only ever reached by an affirmative, attributed act ---");
t("over the WHOLE corpus, isSufficiencyClaimed is TRUE for a named member and for NOTHING else",
  CORPUS.filter(([v, want]) => isSufficiencyClaimed(v) !== (want === "claimed")).map(([v]) => String(v)), []);
t("the minted no-claim value is NOT a claim — the one assertion this state exists to earn",
  isSufficiencyClaimed(SUFFICIENCY_UNCLAIMED), false);
t("nor is a blank field a claim",
  BLANK_SPELLINGS.filter(isSufficiencyClaimed).map(String), []);
t("nor is any machine spelling a claim, including the `class:ai` a background run's credential would stamp",
  MACHINE_SPELLINGS.filter(isSufficiencyClaimed), []);

console.log("\n--- 3. 'nobody said' and 'the record does not say' stay apart, in both directions ---");
t("the minted value is not read as a silence",
  sufficiencyClaimState(SUFFICIENCY_UNCLAIMED), "unclaimed");
t("and a silence is not read as the minted value — a blank stays UNSTATED, which is what both gates still refuse",
  BLANK_SPELLINGS.map(isSufficiencyUnclaimed), [false, false, false, false, false]);
t("a machine's stamp is read as neither: it is not a claim, and it is not the record saying nobody claimed",
  ["class:ai", "token:member", "daemon"].map(sufficiencyClaimState),
  ["machine_stamped", "machine_stamped", "machine_stamped"]);

console.log("\n--- 4. the collision pin: the minted value is not, and must never become, a machine identity ---");
t("isMachineIdentity(SUFFICIENCY_UNCLAIMED) is FALSE — a machine did not say this, nobody did",
  isMachineIdentity(SUFFICIENCY_UNCLAIMED), false);
t("and it is not a minted machine STAMP either — the namespace is deliberately neither `token:` nor `class:`",
  isMachineStamp(SUFFICIENCY_UNCLAIMED), false);
t("the value's namespace is not one of the plane's machine prefixes",
  MACHINE_STAMP_PREFIXES.filter((p) => SUFFICIENCY_UNCLAIMED.startsWith(p)), []);
t("and it is not smuggled in as a bare class word or a surface identity either",
  [...ACTOR_CLASSES, ...NON_MEMBER_AUTHORS].includes(SUFFICIENCY_UNCLAIMED), false);
/* THE SHAPE, not the spelling: a value that could be a person's name is a value
   that collides with one. The colon is what puts it in the control plane's own
   minted grammar, which is the REC-46 lesson taken before it repeats. */
t("the value carries a namespace, so it cannot collide with a member's name",
  /^[a-z]+:[a-z-]+$/.test(SUFFICIENCY_UNCLAIMED), true);

/* ================================================================= *
 * 5. THE WORDS A MEMBER READS.
 * ================================================================= */
console.log("\n--- 5. the published words: DEC-49's rule, and DEC-32's ban on the analyst's vocabulary ---");
t("op=affordances publishes the states — IMPORTED, the SAME object, not a copy (REC-35's identity pin)",
  VOCABULARIES.sufficiency_claim_states === SUFFICIENCY_CLAIM_STATES, true);
t("affordances.mjs spells none of the four texts as a literal of its own",
  Object.values(SUFFICIENCY_CLAIM_STATES).filter((s) => stripComments(AFFORD_SRC).includes(s)), []);
/* ARM E's THREE RULES, APPLIED HERE, AND WHY THEY ARE APPLIED HERE.
   `civicos-ui/check-refusal-codes.mjs` arm E holds every published vocabulary's
   texts to exactly these rules — but it walks TWO named modules
   (`src/airun.mjs`, `src/queuestate.mjs`) and reaches neither of the files this
   vocabulary lives in. That was MEASURED rather than assumed: adding
   `checks/bio-checks.mjs` to arm E's list harvests four maps that are not
   member-facing text at all (`OBJECT_TYPES`, `LEGACY_TYPE_ALIASES`,
   `FORBIDDEN_ALIASES`, `EARNED_SOURCE_AXIS`), and adding `src/affordances.mjs`
   harvests `RUNGS`, whose values are single ladder words — both would fail arm
   E's phrase rule on correct code, which is an over-strict guard and the kind
   that gets switched off. So the rules are carried HERE, in the battery, and
   the limitation is STATED rather than left for the next reader to trip on. */
t("every state carries text — a term with no text puts the machine word itself in front of a member",
  Object.entries(SUFFICIENCY_CLAIM_STATES).filter(([, v]) => !String(v).trim()).map(([k]) => k), []);
t("every text is a PHRASE and not a token (arm E's word count, not a character count)",
  Object.entries(SUFFICIENCY_CLAIM_STATES).filter(([, v]) => String(v).trim().split(/\s+/).length < 3).map(([k]) => k), []);
t("no text restates its own key — a vocabulary whose text is the machine word is the member decoding it anyway",
  Object.entries(SUFFICIENCY_CLAIM_STATES).filter(([k, v]) => String(v).trim() === k).map(([k]) => k), []);
/* DEC-32's BAN, and WHAT THIS MATCHER CAN AND CANNOT SEE. It CAN see the
   analyst's four words — AND / OR as standalone tokens, `disjunct*`, `ground*`
   — in any case. It CANNOT see a sentence that TEACHES the structure without
   using the words ("the strongest of these, rather than the weakest of all"),
   and no matcher can; that is what a reading by a person is for, and the
   delegation to UI names it. */
/* THE MATCHER WAS WRONG ON ITS FIRST RUN AND THE CORRECTION IS RECORDED HERE
   RATHER THAN SMOOTHED. It was written `/\b(AND|OR)\b|disjunct|ground/i` — one
   case-insensitive alternation — and it fired on BOTH correct texts, because
   the `i` flag makes `\bAND\b` match the ordinary English conjunction "and".
   An over-strict guard that refuses correct work is the opposite defect and the
   worse one: this arm would have forced the texts to be written around a word
   nobody objects to. The operator is a CAPITALISED token in DEC-32's own
   prohibition and the words are not, so the two halves get the case rule each
   actually needs. */
const BANNED_OPERATOR = /\b(?:AND|OR)\b/;          // the analyst's operator: capitalised, standalone
const BANNED_TERM = /disjunct|ground/i;            // the analyst's nouns, in any case
const speaksAnalyst = (s) => BANNED_OPERATOR.test(String(s)) || BANNED_TERM.test(String(s));
t("no published text speaks the analyst's vocabulary — DEC-32's ban is a constraint on us, not only on the surface",
  Object.entries(SUFFICIENCY_CLAIM_STATES).filter(([, v]) => speaksAnalyst(v)).map(([k]) => k), []);
/* THE OVER-STRICTNESS DIRECTION, kept in the suite and not only in the control,
   because this is the arm that already caught its own matcher once. */
t("and the ban's matcher does NOT fire on ordinary lower-case English — an over-strict guard refuses correct work",
  speaksAnalyst("a member said so, and the record holds their name"), false);
t("while it DOES fire on the analyst's own words, so the arm above is not passing by never firing",
  ["these legs are AND-related", "the OR branch", "a disjunctive basis", "the grounds[] block"].map(speaksAnalyst),
  [true, true, true, true]);

/* ================================================================= *
 * 6. THROUGH THE OP (D-43).
 * ================================================================= */
console.log("\n--- 6. through the op: a caller can actually reach the vocabulary ---");
const aff = await GET("op=affordances&token=mem-pl17");
t("op=affordances answers ok", aff.ok === true, true);
t("and carries the four states with their texts, byte-equal to the catalogue's",
  aff.result?.vocabularies?.sufficiency_claim_states, SUFFICIENCY_CLAIM_STATES);

/* ================================================================= *
 * 7. WHAT IS **NOT** WIRED — MEASURED AT THE CHECK, THE WAY FL-3 DID.
 *
 * DEC-65 as originally worded named the WRONG C-NUMBER (`C-25.15` is
 * `VERSION_ORPHAN_ROW` and unrelated), and it was caught only because FL-3 went
 * to the check before it went to the edit. This block is that habit made into
 * assertions: it names the two checks BY THEIR CODES, reads what they actually
 * do with the minted value, and pins it.
 *
 * EVERY ASSERTION IN THIS BLOCK IS A PIN ON THE CURRENT, UNWIRED STATE, and it
 * is WRITTEN TO FAIL when the item that owns `C-25.6` / `C-2.8` and PL-3's
 * endpoint guard lands DEC-65's shape (b). THAT IS THE POINT. The next item
 * CORRECTS these, never exempts them, and says in a comment why each old
 * expectation was right when it was written.
 * ================================================================= */
console.log("\n--- 7. the gates are UNCHANGED, and here is exactly what they do with the value today ---");
/* READ THE SUFFICIENCY ARM BY ITS SENTENCE, NOT BY ITS C-NUMBER, AND THE FIRST
   DRAFT OF THIS SUITE DID THE LATTER AND WAS WRONG. `C-25.6` is one rule and a
   code-level test happens to work there; `C-2.8` is a WHOLE FAMILY of basis
   rules, so "did a C-2.8 finding appear" answered TRUE for the inquiry-level
   fixture over an unrelated rule entirely and read as *the gate refuses the
   minted value* — the exact opposite of the truth. A check asserted by its code
   where the code covers more than the rule is an assertion about the wrong
   thing, and it failed in the direction that would have been believed. */
const NOT_A_MEMBER = /is not a named member/;
const suffRefused = (findings) => findings.some((x) => NOT_A_MEMBER.test(String(x.message ?? "")));
const versionFindings = (fm) => { const out = []; basisVersionFindings(fm, out); return out; };
const versionFm = (assertedBy) => ({
  id: "INQ-2026-0001",
  basis_versions: [{ name: "v1", description: "one part, composed by a run", relationship: "and",
                     state: "suggested", hidden: false, at: "2026-08-09T00:00:00Z" }],
  basis_version_grounds: [{ version: "v1", ground: "whole", asserted_by: assertedBy, at: "2026-08-09T00:00:00Z" }],
  basis_version_legs: [{ version: "v1", target: "INFO-2026-0002", role: "supports", ground: "whole" }],
});
t("the rule is C-25.6 / VERSION_GROUND_UNASSERTED and NOT C-25.15, which DEC-65 named and which is VERSION_ORPHAN_ROW — pinned so the entry's own correction cannot be lost",
  [...new Set(versionFindings(versionFm("class:ai")).filter((x) => NOT_A_MEMBER.test(x.message)).map((x) => x.check))],
  ["C-25.6"]);
t("C-25.6 REFUSES a machine's stamp in the field — unchanged, and it is the refusal DEC-65 is about",
  suffRefused(versionFindings(versionFm("class:ai"))), true);
t("C-25.6 REFUSES a blank — the silent default is still refused, and this item did not touch that",
  suffRefused(versionFindings(versionFm(""))), true);
t("C-25.6 ACCEPTS a named member — unchanged",
  suffRefused(versionFindings(versionFm("dave"))), false);
/* CORRECTED 2026-08-09 BY PL-19, WHICH LANDED DEC-65's SHAPE (b). NOT EXEMPTED,
   AND HERE IS WHY THE OLD EXPECTATION WAS RIGHT WHEN IT WAS WRITTEN.
   PL-17 wrote: *"the minted value passes C-25.6 TODAY — not because this item
   widened anything, but because C-25.6's member arm asks only 'non-blank and
   not a machine', which any string satisfies. The state is INERT."* Every word
   of that was true of the tree PL-17 left, and it was the honest way to say
   that a minted state nothing consumes is a mechanism believed on its
   EXISTENCE.
   WHAT CHANGED: C-25.6 now asks `isSufficiencyUnclaimed` and admits the value
   DELIBERATELY, under DEC-65's single-part licence. The verdict below is the
   same BOOLEAN and it would have gone on passing while its sentence had become
   false — which is exactly the shape a stale pin takes, so the ASSERTION IS
   REPLACED rather than relabelled: it now drives the licence's BOUNDARY, in
   both directions, where a boolean that passes for the wrong reason cannot.
   The two-part fixture is the half that would catch a widening. */
const versionFm2 = (assertedBy) => ({
  id: "INQ-2026-0001",
  basis_versions: [{ name: "v1", description: "two parts, composed by a run", relationship: "or",
                     state: "suggested", hidden: false, at: "2026-08-09T00:00:00Z" }],
  basis_version_grounds: [
    { version: "v1", ground: "ledger", asserted_by: assertedBy, at: "2026-08-09T00:00:00Z" },
    { version: "v1", ground: "audit", asserted_by: assertedBy, at: "2026-08-09T00:00:00Z" }],
  basis_version_legs: [
    { version: "v1", target: "INFO-2026-0002", role: "supports", ground: "ledger" },
    { version: "v1", target: "INFO-2026-0003", role: "supports", ground: "audit" }],
});
t("C-25.6 ADMITS the minted value on a version declaring exactly ONE part — DEC-65's licence, landed by PL-19, and the arithmetic is the whole of it: with one part there is no maximum to take",
  suffRefused(versionFindings(versionFm(SUFFICIENCY_UNCLAIMED))), false);
t("AND REFUSES IT ON A VERSION DECLARING TWO — the licence's BOUND, which is the half a widening would break and the half a boolean that merely kept passing could not see",
  versionFindings(versionFm2(SUFFICIENCY_UNCLAIMED))
    .filter((x) => /nobody asserted it/.test(String(x.message ?? ""))).map((x) => x.check),
  ["C-25.6", "C-25.6"]);
t("and a MACHINE's stamp is still refused on a SINGLE-part version — the licence is the record saying nobody claimed, never the record saying a machine claimed",
  suffRefused(versionFindings(versionFm("class:ai"))), true);
const inquiryFm = (assertedBy) => ({
  id: "INQ-2026-0001",
  basis: [{ target: "INFO-2026-0002", role: "supports", ground: "whole" }],
  grounds: [{ ground: "whole", asserted_by: assertedBy, at: "2026-08-09T00:00:00Z" }],
});
const inquiryFindings = (fm) => { const out = []; checkInquiryBasis(fm, out); return out; };
t("C-2.8's own sufficiency arm one level down REFUSES a machine's stamp — the sibling rule, unchanged",
  suffRefused(inquiryFindings(inquiryFm("class:ai"))), true);
/* CORRECTED 2026-08-09 BY PL-19, AND THE CORRECTION IS TO THE REASON RATHER
   THAN TO THE VERDICT. PL-17 asserted this as *"the two asking sites are in the
   SAME unwired state and neither is half-done"*, which was the right thing to
   assert while both were unwired. They are no longer in the same state, and
   that is a DECIDED CLOSURE and not a half-done job: C-25.6 governs a VERSION,
   which a machine composes; C-2.8 governs the INQUIRY's own `grounds[]`, whose
   only writer is `groundInquiry`, which refuses a machine credential outright
   (`MACHINE_CANNOT_GROUND`, REC-64 / C-32.8). There is no machine writer here
   for the third state to keep honest, so admitting it would widen what the
   record may hold for a population that cannot produce it. The verdict is
   unchanged BY COINCIDENCE — C-2.8's member arm still asks only "non-blank and
   not a machine" — so the assertion is REPLACED by one that measures the thing
   that is actually true, rather than left standing on a boolean that agrees for
   free. `dec65-single-part.test.mjs` drives the closure at its own op. */
t("C-2.8 is DELIBERATELY NOT WIRED and it is not the same state as C-25.6: it still asks only non-blank-and-not-a-machine, so the minted value is not DISTINGUISHED here — it is merely not a machine",
  [suffRefused(inquiryFindings(inquiryFm(SUFFICIENCY_UNCLAIMED))),
   suffRefused(inquiryFindings(inquiryFm("a member who wrote the words none")))],
  [false, false]);

/* THE SWEEP, INVERTED RATHER THAN LISTED. The question is not "which two checks
   did I happen to read" but "what makes a site recognisable IN PRINCIPLE as one
   that judges a sufficiency assertion". The answer: it reads an `asserted_by`
   and judges it with `isMachineIdentity`. That matcher finds its own sites
   without being told their names, so a THIRD asking site written next month is
   found by this assertion rather than missed by a list. */
/* AND THE MATCHER IS RUN OVER FLATTENED SOURCE, WHICH IT WAS NOT ON ITS FIRST
   RUN. Written line-wise it found ONE of the two sites, because `checkGrounds`
   wraps its condition across two lines and `basisVersionFindings` does not —
   the identical rule, invisible to the matcher for a line break. WHAT MAKES
   THIS WORTH RECORDING RATHER THAN QUIETLY FIXING: the totality assertion
   underneath it PASSED over that half-corpus, so a sweep that had reported
   "no site consumes it" would have been right by luck over a set it could not
   see. That is why the reach is printed and floored and not merely asserted.

   AND IT WAS WRONG A SECOND TIME, CAUGHT BY THE ARM THAT WIRES THE STATE IN.
   The first flattened matcher recognised a site by `isMachineIdentity` ALONE —
   grading by the spelling the sites happen to use TODAY. So the moment a site
   was converted to the new predicate it VANISHED from the sweep, and the
   assertion underneath went on reporting "nothing consumes the state" while
   something did. A classifier that grades one literal hides exactly what it was
   built to find. The recognisable-in-principle property is *this expression
   judges an `asserted_by`*, so the matcher names every predicate that can do
   the judging — the old one and the ones this item minted — and a THIRD asking
   site written next month is found by the shape rather than missed by a list. */
const JUDGING_PREDICATE = "(?:isMachineIdentity|isSufficiencyClaimed|isSufficiencyUnclaimed|sufficiencyClaimState)";
const askingSites = [...stripComments(CHECKS_SRC).replace(/\s+/g, " ")
  .matchAll(new RegExp(`[^;{}]*asserted_by[^;{}]*${JUDGING_PREDICATE}\\s*\\([^)]*\\)`
                       + `|[^;{}]*${JUDGING_PREDICATE}\\s*\\([^)]*asserted_by[^)]*\\)`, "g"))]
  .map((m) => m[0].trim());
console.log(`  sweep: ${askingSites.length} site(s) in checks/bio-checks.mjs judge an \`asserted_by\` with isMachineIdentity`);
t("the sweep FINDS its sites rather than being handed them — a matcher that sees nothing is a walk looking in the wrong place",
  askingSites.length >= 2, true);
/* CORRECTED 2026-08-09 BY PL-19. NOT EXEMPTED — the old assertion was
   `askingSites.filter(consumes) === []`, *"NONE of them consumes the minted
   state yet"*, and it was RIGHT WHEN WRITTEN and is the pin that did its job:
   it went red the moment C-25.6 started consuming the state, which is precisely
   what PL-17 built it to do.
   IT IS REPLACED BY ITS INVERSE RATHER THAN DELETED, because "nothing consumes
   it" and "exactly these consume it" are the same question asked before and
   after, and the second is the one that keeps biting: a THIRD asking site
   written next month is found by the same shape and reported UNCLASSIFIED here
   rather than scored zero.
   AND PL-19 FOUND A GAP IN THIS MATCHER WHILE CORRECTING IT, which is worth
   more than the correction. Its FIND set (`JUDGING_PREDICATE`, four spellings)
   was WIDER than its VERDICT set (three spellings — `sufficiencyClaimState` was
   missing from the second). PL-19's first draft wired C-25.6 through
   `sufficiencyClaimState`, and the site was duly FOUND by the sweep and then
   graded as NOT consuming the state: the assertion above went on passing over a
   site that had just started consuming it. That is arm (7)'s own finding —
   a classifier grading one literal hides exactly what it was built to find —
   surviving the fix for it, one regex to the right. The verdict is now derived
   FROM the find set so the two cannot drift again. */
const CONSUMES = new RegExp(`${JUDGING_PREDICATE.replace("isMachineIdentity|", "")}|SUFFICIENCY_UNCLAIMED`);
t("THE MATCHER'S TWO HALVES ARE ONE LIST: every predicate the sweep can FIND a site by is a predicate it can GRADE one by, except the pre-DEC-65 one — so a site wired through any of them cannot vanish into a passing assertion",
  ["sufficiencyClaimState(x)", "isSufficiencyClaimed(x)", "isSufficiencyUnclaimed(x)", "isMachineIdentity(x)"]
    .map((s) => CONSUMES.test(s)), [true, true, true, false]);
const consuming = askingSites.filter((l) => CONSUMES.test(l));
console.log(`  sweep: ${consuming.length} of ${askingSites.length} asking site(s) now consume the third state`);
t("EXACTLY ONE asking site consumes the minted state, and it is C-25.6's — PL-19 landed DEC-65's shape (b) there and nowhere else",
  [consuming.length, consuming.some((l) => /isSufficiencyUnclaimed/.test(l))], [1, true]);
t("and the OTHER site is C-2.8's, still asking the pre-DEC-65 question — a stated closure with its reason at the site, not a site the sweep missed",
  askingSites.filter((l) => !CONSUMES.test(l)).length >= 1, true);
/* WHAT THIS SWEEP CANNOT SEE, stated plainly: it reads ONE file. PL-3's
   endpoint guard lives in `src/store.mjs` and refuses on `legsIn.length > 0`
   before any of these checks is reached — FL-3 measured that it is the site
   that FIRES FIRST, and it is deliberately NOT in this item's paths. A sweep
   that reported "two sites" as the whole answer would have repeated exactly the
   one-site premise DEC-65's own entry had to be corrected for. */

await mf.dispose();
console.log(`\n${fail === 0 ? "ok" : "FAIL"}  sufficiency-state.test.mjs  ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
