/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/wire-vocabulary.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and neither the battery nor the fleet walk must discover it (FL-2/FL-3/PL-3's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. Every arm is armed ALONE with the other defences held OPEN, every restore is verified BY sha256 AND BY CONTENT (`cmp`) AND by size against a UNIQUELY-NAMED per-arm pristine copy with its byte count printed and floored at 1,000 B, and every arm names what MUST fail AND what MUST NOT. FIVE ARMS, ALL FIVE AS DECLARED on the recorded pass (2026-09-13); figures read `wire-vocabulary / harness / fanout`, each `pass/fail`.
 *   (1) W-A · BASELINE, nothing armed -> **83/0 · 214/0 · 182/0**, and it is not decoration:
 *       it is what distinguishes five-arms-broken from five-arms-working. Every suite reached
 *       its own FOOT, which is what the runner matches on, so a killed module reads `-1`.
 *   (2) W-B · THE ARM THIS SUITE EXISTS FOR — the colon restored in `harness.mjs`
 *       (`level-empty-${reported}` back to `level-empty:${reported}`, the exact pre-fix name)
 *       -> **65/18 · 211/3 · 180/2**, with **C-25.2 named in this suite's own output** — the
 *       refusal VF-4 measured live, reproduced from the grammar rather than from a mock.
 *       F10 and dedup HELD, as declared: a name defect is not a control-flow one.
 *   (3) W-C · the kind swapped for one §9 does not hold (`new-version`, D-324's own fixture
 *       spelling) -> **69/14 · 210/4 · 180/2**, **C-27.3 named**, and the NAME arms HELD, so
 *       the two defects are separably visible rather than collapsing into one red.
 *   (4) W-D · OVER-STRICTNESS, run as its own arm rather than inferred from the baseline —
 *       ten currently-legal names (a 64-character one, one bearing spaces, one starting with a
 *       digit), all five kinds, all four levels and a whole legal `basis-version` candidate,
 *       every one driven over the real validation -> **83/0**. A fence tighter than its rule
 *       is not a safer fence, and this is the direction that catches one.
 *   (5) W-E · the PERMISSIVE mock restored in `plane-suggest.mjs` -> **83/0 · 202/12 · 177/5**.
 *       This suite HOLDS under it, as declared, because it passes through no mock at all —
 *       which is the whole reason the item builds both halves. The arm found its own gap
 *       first: `fanout.test.mjs` read **176/0** with the mock fully widened, because every
 *       candidate it submitted was already legal, and arm B6b was added there in answer.
 */
/* D-323 / D-324 — THE EMPTY-RUN INSTRUMENT'S OWN OBJECT, DRIVEN THROUGH THE
 * PLANE'S REAL VALIDATION, WITH NO MOCK ANYWHERE IN THIS FILE.
 *
 * ---- WHY A SUITE WITH NO PLANE IN IT ---------------------------------------
 *
 * §9's `level-empty` kind is VF-1's owed control 7: the object that makes an
 * honest empty-handed run distinguishable from a run that failed silently.
 * **On every deployed plane, that object could not be written at all.** VF-4
 * measured it live at 0.57.0 (MEASUREMENTS M-8) and every one of this member's
 * own suites was green over it, because both plane mocks answered `op=suggest`
 * with `{ wrote: true }` for any `name`, any `kind`, any `level` and any
 * `description`. Three arms across two suites asserted the refused spelling
 * LANDS.
 *
 * So the mocks are corrected (`test/plane-suggest.mjs`, derived from the plane's
 * catalog) AND this suite exists beside them, because a corrected mock is still
 * a mock. **Everything asserted here is asserted against expressions IMPORTED
 * FROM THE PLANE** — `VERSION_NAME_RE`, `SUGGEST_KINDS`, `SUGGEST_LEVELS`,
 * `isBoilerplate`, `reportsAs` — evaluated on the candidate `emptyLevelCandidates`
 * actually composes. Nothing here is re-typed, staged or reproduced: rename a
 * kind, move the name grammar or respell a level in `bio-plane/` and this file
 * goes red without being edited.
 *
 * ---- WHAT THIS SUITE CAN AND CANNOT SEE, STATED ----------------------------
 *
 * IT SEES the four refusals a composed empty-level candidate can earn on its own
 * shape: the closed kind set (C-27.3), the empty-level vocabulary (C-27.6), the
 * placeholder predicate (C-27.12) and the version-name grammar (C-25.2, plus the
 * description floor C-25.1 that sits beside it at the same gate).
 *
 * IT CANNOT SEE anything that needs a store: whether the run exists, whether the
 * viewer may read the question, leg reachability, the strength pair, the
 * independence trace, the substance comparison, `promote`'s frontmatter
 * grammar. Those are `bio-plane/test/suggest.test.mjs`'s, and the live answer is
 * `bio-plane/test/vf4-suggestprobe.mjs`'s. **This suite closes the VOCABULARY —
 * it does not close the endpoint, and a green here is not evidence a real
 * `op=suggest` would write.**
 * ========================================================================= */

/* D-186: owns $TMPDIR for this process and removes it on exit. */
import "../../bio-plane/test/sandbox.mjs";

import { LEVELS, REPORTING_LEVEL, emptyLevelCandidates } from "../src/harness.mjs";
import { REPORT_KEYS, checkReport } from "../src/subsession.mjs";
import {
  VERSION_NAME_RE, SUGGEST_KINDS, SUGGEST_LEVELS, isBoilerplate,
} from "../../bio-plane/checks/bio-checks.mjs";
import { reportsAs } from "../../bio-plane/src/skilldoctrine.mjs";
import { OBSERVATION_LEVELS } from "../../bio-plane/src/airun.mjs";
import { WIRE_KINDS, WIRE_LEVELS, DESCRIPTION_MIN } from "./plane-suggest.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* THE WIRE, AS ONE FUNCTION, AND EVERY PREDICATE IN IT IS THE PLANE'S OWN.
 *
 * This is the plane's `suggestVersion` shape/check order for the fields a
 * composed candidate carries, and NOTHING ELSE — see the header. It returns the
 * list of refusals a deployed plane would raise, in the order it would raise
 * them, so an assertion can say WHICH refusal and not merely "refused". */
function wireRefusals(c) {
  const out = [];
  const kind = String(c?.kind ?? "").trim();
  /* is-suggest-shape */
  if (!Object.prototype.hasOwnProperty.call(SUGGEST_KINDS, kind)) out.push("C-27.3");
  if (kind === "level-empty"
      && !(SUGGEST_LEVELS.includes(String(c?.level ?? "")) && String(c?.observed_at ?? "").trim() !== ""))
    out.push("C-27.6");
  /* is-suggest-checks, CHECK 5 */
  if (isBoilerplate(c?.description)) out.push("C-27.12");
  /* promote's document gate */
  const name = String(c?.name ?? "").trim();
  if (!name || !VERSION_NAME_RE.test(name)) out.push("C-25.2");
  if (!(typeof c?.description === "string" && c.description.trim().length >= DESCRIPTION_MIN))
    out.push("C-25.1");
  return out;
}

/* THE CORPUS, PRINTED AND FLOORED. A headline totality assertion over an empty
   fixture has passed in this repository three times. */
const REPORTS = LEVELS.map((l, i) => ({ level: l, state: "LOOKED_ABSENT", observed_at: `log:${i + 1}` }));
const CANDIDATES = emptyLevelCandidates({ reports: REPORTS }, "INQ-1");
console.log(`\ncorpus: ${LEVELS.length} level(s) reported LOOKED_ABSENT -> ${CANDIDATES.length} candidate(s)`);
for (const c of CANDIDATES) console.log(`  ${JSON.stringify({ name: c.name, kind: c.kind, level: c.level })}`);

console.log("\n--- W1 · THE FIXTURE IS NON-EMPTY, and it is floored rather than assumed ---");
{
  t("four levels are reported", REPORTS.length, 4);
  t("four candidates are composed — one per empty level, never one for the run",
    CANDIDATES.length, LEVELS.length);
  t("and the corpus is FLOORED, so a table that stopped composing fails here",
    CANDIDATES.length >= 4, true);
}

console.log("\n--- W2 · THE TABLE'S OWN CANDIDATE IS ACCEPTED BY THE WIRE (D-323, the item's whole point) ---");
{
  /* THE ARM THIS SUITE EXISTS FOR. Before 2026-09-13 this read
     ["C-25.2","C-27.12"] on every level and ["C-25.2","C-27.6","C-27.12"] on the
     document level — measured against these same imported expressions before a
     byte of the fix was written. */
  for (const c of CANDIDATES)
    t(`'${c.name}' is refused by NOTHING the wire holds`, wireRefusals(c), []);
}

console.log("\n--- W3 · EACH FIELD AGAINST THE PLANE'S OWN EXPRESSION, so a green names WHY ---");
{
  for (const c of CANDIDATES) {
    t(`'${c.name}' passes VERSION_NAME_RE`, VERSION_NAME_RE.test(c.name), true);
    t(`'${c.name}' carries no colon — the character the grammar has never admitted`,
      c.name.includes(":"), false);
    t(`'${c.name}' names a kind the catalogue holds`,
      Object.prototype.hasOwnProperty.call(SUGGEST_KINDS, c.kind), true);
    t(`'${c.name}' names a level SUGGEST_LEVELS holds`, SUGGEST_LEVELS.includes(c.level), true);
    t(`'${c.name}' carries an observation-log address`,
      typeof c.observed_at === "string" && c.observed_at.trim() !== "", true);
    t(`'${c.name}' is not filler by the plane's OWN predicate`, isBoilerplate(c.description), false);
    t(`'${c.name}' clears C-25.1's description floor of ${DESCRIPTION_MIN}`,
      c.description.trim().length >= DESCRIPTION_MIN, true);
  }
}

console.log("\n--- W4 · THE TWO VOCABULARIES, PINNED TO THE PLANE IN BOTH DIRECTIONS ---");
{
  /* The member ships alone and imports nothing from the plane at runtime, so
     BOTH of its level constants are source pins and this is where they are held.
     Floor AND ceiling: a fifth level, a renamed one, or a reporting spelling
     that stops matching all fail here rather than being refused live. */
  t("LEVELS is exactly the plane's OBSERVATION_LEVELS key order",
    LEVELS, Object.keys(OBSERVATION_LEVELS));
  t("REPORTING_LEVEL is TOTAL over LEVELS — every level has a reporting spelling",
    LEVELS.filter((l) => !REPORTING_LEVEL[l]), []);
  t("every reporting spelling is one the plane holds",
    LEVELS.map((l) => REPORTING_LEVEL[l]).filter((s) => !SUGGEST_LEVELS.includes(s)), []);
  t("the pairing is exactly the one the plane's OWN bridge produces (skilldoctrine reportsAs)",
    LEVELS.map((l) => REPORTING_LEVEL[l]), LEVELS.map((l) => reportsAs(l)));
  t("and it is a CEILING too: the two vocabularies cover the same four levels",
    [...LEVELS.map((l) => REPORTING_LEVEL[l])].sort(), [...SUGGEST_LEVELS].sort());
  /* THE ONE THAT DISAGREES, NAMED — so the next reader knows the map is not
     decoration and which member it exists for. */
  t("exactly one level is spelled differently on the two sides, and it is `document`",
    LEVELS.filter((l) => REPORTING_LEVEL[l] !== l), ["document"]);
}

console.log("\n--- W5 · WHY `description` HAD TO BE COMPOSED: a REPORT has no such field ---");
{
  /* VF-4 recorded this as *"a report carrying only summary"*. It is
     unconditional: `description` is not a key of REPORT_KEYS, and `checkReport`
     refuses any report that carries one — so `r.description` read `undefined` on
     EVERY contract-honouring report, and all four candidates carried
     `description: null`, which the plane refuses C-27.12. */
  t("`description` is not a field of the REPORT contract",
    Object.prototype.hasOwnProperty.call(REPORT_KEYS, "description"), false);
  const refused = checkReport({ level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:1",
                                description: "a description the contract has no room for" });
  t("and a report that carries one is REFUSED BY NAME", refused?.code ?? null, "REPORT_UNKNOWN_FIELD");
  t("so no contract-honouring report can supply one, which is why the TABLE composes it",
    checkReport({ level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:1" }), null);

  /* COMPOSED, NOT SUBSTITUTED. Every word is a fact the report carried. */
  const c = CANDIDATES[0];
  t("the composed description names the level it is about", c.description.includes("meaning"), true);
  t("and the observation-log address that establishes it", c.description.includes("log:1"), true);
  t("and the question it belongs to", c.description.includes("INQ-1"), true);
}

console.log("\n--- W6 · THE MODEL'S SUMMARY IS APPENDED, NEVER SUBSTITUTED ---");
{
  /* A model that writes "n/a" must not be able to turn the instrument's own
     object back into filler — which is what a bare `description: r.summary`
     would have done, one field further along the same defect. */
  const withSummary = emptyLevelCandidates(
    { reports: [{ level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:1",
                  summary: "four searches, no minutes published since March" }] }, "INQ-1")[0];
  t("a real summary is carried through", withSummary.description.includes("no minutes published"), true);
  t("and the composed account is still there beside it", withSummary.description.includes("log:1"), true);
  t("that candidate is refused by nothing", wireRefusals(withSummary), []);

  for (const filler of ["n/a", "TBD", "  ", "<level summary>", "none"]) {
    const c = emptyLevelCandidates(
      { reports: [{ level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:1", summary: filler }] },
      "INQ-1")[0];
    t(`a summary of ${JSON.stringify(filler)} cannot make the candidate filler`,
      wireRefusals(c), []);
  }
}

console.log("\n--- W7 · OVER-STRICTNESS: every currently-legal name, kind and level still passes ---");
{
  /* THE ARM THAT MUST NOT FAIL. A fence tighter than its rule is not a safer
     fence, and correcting a spelling must not narrow what the wire accepts.
     Every one of these is legal TODAY on the deployed plane; the derivation is
     over the plane's own vocabulary, not over a list this file invented. */
  const LEGAL_NAMES = ["v1", "a", "alternative reading", "reading_2", "v1.0.1", "A-B_c.d e9",
                       "9lives", "x".repeat(64), "level-empty-documents",
                       "the reading that rests on the audit trail alone"];
  for (const n of LEGAL_NAMES)
    t(`a legal name ${JSON.stringify(n.length > 24 ? n.slice(0, 21) + "..." : n)} still passes the grammar`,
      VERSION_NAME_RE.test(n), true);
  for (const k of WIRE_KINDS)
    t(`§9's kind '${k}' is still accepted`,
      Object.prototype.hasOwnProperty.call(SUGGEST_KINDS, k), true);
  for (const l of WIRE_LEVELS)
    t(`the level '${l}' is still accepted`, SUGGEST_LEVELS.includes(l), true);
  /* And a whole legal non-empty-level candidate, composed the way the model's
     judgement composes one, must be refused by nothing either. */
  t("a legal `basis-version` candidate with a real description is refused by nothing",
    wireRefusals({ kind: "basis-version", name: "alternative reading",
                   description: "the same evidence read as a timing failure rather than a policy one" }), []);
  /* THE DIRECTION THAT CATCHES A GRAMMAR SILENTLY WIDENED. If somebody admits
     the colon after all, this arm says so instead of the estate finding out from
     a member's version being named like a principal. */
  t("the grammar still REFUSES a colon — it was not widened to make this item pass",
    VERSION_NAME_RE.test("level-empty:content"), false);
  t("and the kind set is still CLOSED at §9's five", WIRE_KINDS.length, 5);
  t("`new-version` is still not one of them — D-324's fixture spelling, refused",
    Object.prototype.hasOwnProperty.call(SUGGEST_KINDS, "new-version"), false);
}

console.log("\n--- W8 · THE OLD SPELLINGS, DRIVEN: each one names the refusal the live plane gives ---");
{
  /* NOT a re-statement of the fix: these are the exact pre-fix values, run
     through the same imported expressions, so the suite carries its own
     before/after and a regression cannot pass by looking plausible. */
  t("the colon form earns C-25.2 — VF-4's live BASIS_REFUSED, reproduced locally",
    wireRefusals({ kind: "level-empty", name: "level-empty:content", level: "content",
                   observed_at: "log:1", description: "a description long enough to clear the floor" }),
    ["C-25.2"]);
  t("the log's `document` spelling earns C-27.6 — a DIFFERENT check, which no live run reached",
    wireRefusals({ kind: "level-empty", name: "level-empty-document", level: "document",
                   observed_at: "log:1", description: "a description long enough to clear the floor" }),
    ["C-27.6"]);
  t("a null description earns C-27.12 and C-25.1 together",
    wireRefusals({ kind: "level-empty", name: "level-empty-content", level: "content",
                   observed_at: "log:1", description: null }),
    ["C-27.12", "C-25.1"]);
  t("D-324's `new-version` earns C-27.3",
    wireRefusals({ kind: "new-version", name: "v1",
                   description: "a description long enough to clear the floor" }),
    ["C-27.3"]);
  t("and the whole pre-fix candidate for the document level earns all three at once",
    wireRefusals({ kind: "level-empty", name: "level-empty:document", level: "document",
                   observed_at: "log:1", description: null }),
    ["C-27.6", "C-27.12", "C-25.2", "C-25.1"]);
}

console.log(`\nwire-vocabulary: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
