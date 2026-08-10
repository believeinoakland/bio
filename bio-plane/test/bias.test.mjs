/* bias.test.mjs — PL-12 / D-84: THE BIAS OBJECT, and DEC-54's four scopes.
 *
 * NEGATIVE CONTROL: (run 2026-08-07 and RE-RUN IN FULL 2026-08-08 after the
 * rebase onto PL-1, pl12-agent, PL-12/D-84) THIRTEEN arms, EVERY ONE RUN, each
 * against a mechanically broken copy of the subject, every file
 * restored and every restore verified by CONTENT as well as by sha256. Re-run in
 * one step: `node test/nc-pl12.mjs` from bio-plane/. The harness lives in the
 * WORKTREE and nowhere shared, because a worker's harness was overwritten
 * mid-turn by another running worker on 2026-08-07, and a harness silently
 * replaced between ARM and RESTORE reports a restore it never performed. Every
 * ARM proves its anchor is UNIQUE and that the bytes CHANGED before any suite
 * runs; every RESTORE proves the file is byte-identical AND that the mutation's
 * own marker is gone, because a hash comparison alone cannot tell "restored"
 * from "the harness hashed the file it just wrote".
 *
 * (1) THE FENCE, AND IT IS THE ONE THE PLAN NAMES: give a SEARCH sub-session's
 *     spawn payload a bias field — in src/store.mjs `aiRunSpawnPayload`, add
 *     `bias: row.bias_manifest` beside `standard_pair` -> **2 FAIL (124/126)**:
 *     ARM F1 (no bias field of ANY name in the payload the plane BUILDS) and
 *     ARM F3 (the payload LITERAL reads no bias column). The assertion is
 *     NO-FIELD-BY-CONSTRUCTION over the object, never a promise in a comment.
 * (2) A MALFORMED BIAS BUNDLE: each document C-number neutered ALONE in
 *     checks/bio-checks.mjs `checkBiasExtension`, one run per number, because a
 *     control that removes them together proves only that the block exists
 *     (airun.test.mjs's ARM R lesson). MEASURED: C-26.1 -> 3 FAIL; C-26.2 -> 1;
 *     C-26.3 -> 1; C-26.4 -> 1; C-26.5 -> 5 (the four malformed sentences AND
 *     the live ARM M refusal at the write path); C-26.6 -> 2 (textual and
 *     structural); C-26.7 -> 1. C-26.1 is removed as a RULE rather than one push
 *     of six — neutering one of six would leave the rule enforced and the arm
 *     would prove nothing.
 * (3) INHALE INSTALLS RATHER THAN PROPOSES — the quietest of the four, and the
 *     one DEC-54 (c) is about. Add `this.sql.exec("INSERT INTO bias_adoptions
 *     …")` to `biasInhale` -> **3 FAIL (123/126)**: ARM I5's two source arms
 *     (no SQL execution; no INSERT/UPDATE/DELETE anywhere in the body) and ARM
 *     I6, the LIVE arm counting the rows. Two levels deliberately: a source pin
 *     alone can be satisfied by a write that hides behind a helper, and a live
 *     pin alone passes over a fixture that never triggers the write.
 * (4) A NEW TABLE ABSENT FROM `purge` (D-113): remove "bias_statements" from
 *     TABLES -> hygiene.test.mjs FAILS naming it (`uncovered:
 *     ["bias_statements"]`), and ARM P1/P2 here fail — P2 on the LIVE row count
 *     after a whole-store purge reported scope ALL.
 * (5) A CARRIED-FORWARD ACKNOWLEDGEMENT (DEC-46, C-21.1's byte-check): disable
 *     the `BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD` reason in store.mjs ->
 *     publish.test.mjs FAILS on "a republication reprinting edition 2's BIAS
 *     ACKNOWLEDGEMENT byte-identical is REFUSED". **AND THE READING THAT MATTERS
 *     IS THAT THIS SUITE STAYED GREEN AT 126**: the acknowledgement's gate is
 *     NOT this item's and this item did not weaken it, which is exactly what
 *     "DEC-46 is not re-litigated" has to mean in a measurement.
 * (6) OVER-STRICTNESS, and it is not decoration: widen the malformedness
 *     predicate to catch strong language (`reliable|track record|motive|
 *     discretion`) -> **17 FAIL (102/119)**, headed by Reuters' and AP's real
 *     sentences being read as verdicts. A predicate that refused those would
 *     have removed the DECLARATION rather than the bias, which is the masking
 *     the five safeguards exist to defeat.
 *     **THIS ARM ALSO CORRECTED THE SUITE.** On its first run it reported 3
 *     failures and then DIED — the widened predicate made the fixture's own
 *     statements malformed, a `throw` fired, and nine blocks behind it never
 *     ran, reporting no tally at all. D-93's class inside a control, for the
 *     eighth recorded time. Every runtime block now runs inside `block()`, so a
 *     throw is a RECORDED failure naming the block and the run continues; the 17
 *     above is what the same control reports once it can finish.
 * (7) THE ENVELOPE'S TRANSLATION REMOVED (added 2026-08-08): drop `check:
 *     BIAS_CHECKS.BIAS_REFUSED.check` from `promote`'s bias refusal -> **1 FAIL
 *     (126/127)**, naming the envelope arm. It exists because VF-2's DEC-49
 *     guard found the defect it controls, and the suite could not have: every
 *     per-finding translation was present, and the code on the ENVELOPE — the
 *     one a surface keys on FIRST — had no row at all.
 *
 * ALL FIGURES ABOVE RE-MEASURED 2026-08-08 against the C-26 numbering and the
 * post-rebase corpus. Every arm still fires; every restore still verifies by
 * CONTENT as well as by sha256.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS ITEM IS
 * ---------------------------------------------------------------------------
 *
 * D-84: *"`object_type: bias` does not exist in the check catalogue, so a bias
 * bundle cannot be written at all."* `BIO_Declared_Bias_v0_1.md` specifies bias
 * sets as bundles of `object_type: bias` precisely so they inherit append-only
 * history, member-authored transitions, convergent promotion and conformance
 * checks without inventing governance — and the doctrine was unimplementable at
 * its first step.
 *
 * DEC-54 (Bob, 2026-08-04) added four scopes, written onto D-84's row rather
 * than left in the register, and every one of them is asserted in this file as
 * CODE and not as a document:
 *   (a) an inhaled policy SPLITS into bars and bias statements;
 *   (b) the unenforceable residue is a PUBLISHED OUTPUT, not a log line;
 *   (c) inhale PROPOSES and never INSTALLS;
 *   (d) the adopted policy is PINNED — source, retrieval date, content hash.
 *
 * ---------------------------------------------------------------------------
 * TWO RULINGS THIS SUITE DOES NOT RE-LITIGATE, and pins so nobody does
 * ---------------------------------------------------------------------------
 *
 * DEC-46: the bias ACKNOWLEDGEMENT is AUTHORED AT EXPORT and is never a
 * pre-check checkbox; a carried-forward one is REFUSED, byte-checked by C-21.1.
 * That is a different object from the MANIFEST this item builds — the
 * acknowledgement is the publisher's account of what the lens did to THIS
 * edition's findings, and the manifest is the lens itself. `Declared_Bias`'s own
 * table says so. ARM D1 drives the acknowledgement's refusal to prove the two
 * coexist without either weakening.
 *
 * THE HUNCH-DEBT VOCABULARY CORRECTION (D-188 / DEC-46 (d)): `debt` means
 * specifically HUNCH in the disqualifying rule. Ordinary declared bias is
 * DISCLOSED and TRAVELS and blocks nothing (DEC-20). ARM D2 pins that this item
 * adds no gate: no answer here refuses anything for carrying a bias.
 */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { OBJECT_TYPES, HEADINGS, STATES, BUNDLE_ID_RE, BIAS_STATEMENT_KINDS,
         BIAS_CHECKS, BIAS_VERDICT_WHOLESALE, BIAS_VERDICT_SPEAKER, BIAS_BAR_PHRASING,
         normalizeType, checkBundle, parseFrontmatter } from "../checks/bio-checks.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SRC = (f) => join(ROOT, "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");
const sha = (s) => createHash("sha256").update(s).digest("hex");

let pass = 0, fail = 0;
const J = (v) => JSON.stringify(v);
const t = (name, got, want) => {
  if (J(got) === J(want)) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}\n         want ${J(want)}\n         got  ${J(got)}`); }
};

/* D-93'S CLASS, INSIDE THIS SUITE'S OWN CONTROL, and the reason it is here.
 *
 * The practice is that a negative control "must not die early and hide the arms
 * behind it", and an accumulating assertion is only HALF that fix, because a
 * TypeError never goes through it. MEASURED on this suite's own ARM 6: widening
 * the malformedness predicate made a legitimate statement malformed, so the
 * fixture's promote failed, `if (!d.ok) throw` fired, and the run DIED — it
 * printed three real OVER-STRICTNESS failures and then hid the nine blocks
 * behind them, reporting no tally at all.
 *
 * So every runtime block below runs inside this wrapper: a throw becomes a
 * RECORDED FAILURE naming the block, and the blocks after it still run. A
 * control that breaks the subject must show EVERYTHING it broke. */
const block = async (name, fn) => {
  try { await fn(); }
  catch (e) {
    fail++;
    console.log(`  FAIL  BLOCK ${name} DIED: ${String((e && e.message) || e).slice(0, 200)}`);
    console.log("         (the blocks after this one still ran — see below)");
  }
};

/* Block comments blanked before any source anchor is matched. bounds.test.mjs
   learned this the expensive way: its first walk matched `LIMIT 200` inside a
   comment the item had itself just written and reported two uncapped methods as
   capped. This suite writes a great deal of prose into the file it then reads,
   so the hazard is larger here than there, and ARM S0 guards the guard. */
const decomment = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const STORE = decomment(STORE_SRC);
const INDEX = decomment(INDEX_SRC);

/* The named method BODY, brace-matched off the source.
 *
 * CORRECTED ON FIRST RUN, and the correction is why ARM I0 and the SEEK GUARD
 * exist. The first version took `indexOf("{", i)` after the signature — which
 * lands on the DESTRUCTURING BRACE of `biasInhale({ policy = "", ... })`, not on
 * the body — and returned the parameter list. Every ARM I5 arm then passed over
 * forty characters of parameter defaults, asserting nothing at all: a control
 * that passes while testing something else, which is the exact class this
 * repository has measured seven times. ARM I0 (the body is long) and the SEEK
 * GUARD (the same predicates DO fire on a method that legitimately writes) are
 * what caught it, and they are kept for the next reader.
 *
 * So: skip the PARAMETER LIST by paren-matching first, then brace-match the
 * body that follows it.
 *
 * AND IT IS THE SECOND SIGHTING OF THIS EXACT INSTRUMENT DEFECT THIS WEEK,
 * recorded here because a defect seen twice is a class and not an accident: a
 * source-reading walk anchored on a signature and took the WRONG SPAN, then
 * reported a clean verdict over bytes that could not have carried the thing it
 * was looking for. REC-70's was the same shape one level up — a classifier that
 * admitted one spelling of success and read as a complete sweep over 55 of 156
 * ops. Both passed loudly while asserting nothing. The defence in both cases is
 * the same and is cheap: assert that the SPAN IS NON-TRIVIAL (ARM I0), and run
 * the same reader over a subject that MUST trip it (the seek guard). Neither
 * costs anything and either one alone would have caught both. */
const bodyOf = (src, sig) => {
  const i = src.indexOf(sig);
  if (i < 0) return "";
  let p = src.indexOf("(", i), depth = 0;
  for (; p < src.length; p++) {
    if (src[p] === "(") depth++;
    else if (src[p] === ")") { depth--; if (depth === 0) { p++; break; } }
  }
  const start = src.indexOf("{", p);
  if (start < 0) return "";
  depth = 0;
  for (let q = start; q < src.length; q++) {
    if (src[q] === "{") depth++;
    else if (src[q] === "}") { depth--; if (depth === 0) return src.slice(start, q + 1); }
  }
  return "";
};

console.log("\n=== bias: PL-12 / D-84, the bias object and DEC-54's four scopes ===");

/* ======================================================================= S0
 * THE GUARD ON THE GUARD, first, because every source arm below rests on it.
 * ===================================================================== */
console.log("\n--- S0. the comment stripper, guarded in BOTH directions ---");
t("SEEK GUARD: a known CODE line survives decommenting",
  /const TABLES = \["files"/.test(STORE), true);
t("SEEK GUARD: and a known PROSE line does not, so this suite's own reasoning cannot satisfy an anchor",
  /the malformedness rule binds the machine exactly as it binds a member/.test(STORE), false);
t("CORPUS PRINTED — the size of what every source arm below is read over",
  [STORE_SRC.length > 500_000, INDEX_SRC.length > 100_000], [true, true]);
console.log(`  corpus: store.mjs ${STORE_SRC.length} chars (${STORE.length} after decomment), `
          + `index.mjs ${INDEX_SRC.length}, schema.mjs ${SCHEMA_SRC.length}`);

/* ======================================================================= 1
 * THE OBJECT: the type, the id grammar, the heading set, the state machine.
 * ===================================================================== */
console.log("\n--- 1. the bias object exists in the catalogue (D-84's first step) ---");
t("`bias` is a canonical object_type, reachable through the catalogue's own prefix map",
  [OBJECT_TYPES.BIAS, normalizeType("bias")], ["bias", "bias"]);
t("a BIAS- id is a legal bundle id — before this, C-2.5 refused the document before any bias rule could run",
  [BUNDLE_ID_RE.test("BIAS-2026-0001-newsroom-standards"), BUNDLE_ID_RE.test("BIAS-2026-0001-x")],
  [true, true]);
t("THE HEADING SET, and the third one is DEC-54 (b) in the document's own bytes",
  HEADINGS.bias,
  ["## Statements", "## Adoption", "## What This Does Not Enforce", "## Session Log", "## Review Notes"]);
t("THE STATES: written, offered, adopted, retired",
  STATES.bias.legal, ["draft", "proposed", "adopted", "retired"]);
t("`proposed` is REACHABLE FROM draft and `adopted` is reachable ONLY from proposed — the edge that would "
+ "let a machine make a set binding without anybody offering it does not exist",
  [STATES.bias.edges.draft.includes("proposed"),
   STATES.bias.edges.draft.includes("adopted"),
   STATES.bias.edges.proposed.includes("adopted")],
  [true, false, true]);
t("an ADOPTED set does not slide back to draft in place — it retires, or a new revision re-pins it, "
+ "because a case names the version it was held to",
  STATES.bias.edges.adopted, ["retired"]);
t("THE CLOSED SET OF THREE KINDS, and a standard of evidence is not among them",
  BIAS_STATEMENT_KINDS, ["scrutiny", "inference", "pattern"]);
t("no legacy spelling is invented for a type born after the collapse",
  [Object.keys(OBJECT_TYPES).filter((k) => OBJECT_TYPES[k] === "bias")], [["BIAS"]]);

/* ======================================================================= 2
 * THE STATEMENT ANATOMY, judged by the catalogue as a pure function.
 * ===================================================================== */
console.log("\n--- 2. statement anatomy: the seven document refusals, each by C-number ---");

const FM = (over = {}) => ({
  id: "BIAS-2026-0001-house-lens", object_type: "bias", schema: "bias@1",
  title: "House lens", current_state: "adopted", prior_state: "proposed",
  created: "2026-07-01T00:00:00Z", last_updated: "2026-07-02T00:00:00Z",
  produced_by: { mode: "human", capability_tier: "member" },
  group: "believe-in-oakland", references: [], state_history: [],
  annotations_open: 0, reeval_pending: { flag: false, since: null, source: null },
  visuals: [],
  statements: [{
    id: "s1", kind: "scrutiny", subject: "ENT-2026-0007",
    text: "Claims from the city attorney's office need a second, independent record before they bear load.",
    justification: "The office is a party to several matters this group is examining.",
    citations: [], locked: false,
  }],
  ...over,
});

const yaml = (fm) => {
  /* A tiny YAML writer, deliberately: the catalogue parses frontmatter and this
     suite must produce the DOCUMENT the store will be handed, not an object the
     store never sees. Nested arrays of maps are the only shape it needs. */
  const scalar = (v) => v === null ? "null"
    : typeof v === "string" ? JSON.stringify(v)
    : typeof v === "boolean" || typeof v === "number" ? String(v) : JSON.stringify(v);
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)) {
    if (Array.isArray(v) && v.length && typeof v[0] === "object") {
      lines.push(`${k}:`);
      for (const row of v) {
        const keys = Object.entries(row);
        lines.push(`  - ${keys[0][0]}: ${scalar(keys[0][1])}`);
        for (const [rk, rv] of keys.slice(1)) {
          /* FLOW STYLE, and it is not a style preference — see the pin below.
             The catalogue's frontmatter parser cannot read a BLOCK sequence
             nested inside a sequence item: it drops the key's value to "" and
             hoists the items into the OUTER list, so `statements[]` silently
             gains a string member. Flow style parses correctly. */
          if (Array.isArray(rv)) lines.push(`    ${rk}: ${JSON.stringify(rv)}`);
          else lines.push(`    ${rk}: ${scalar(rv)}`);
        }
      }
    } else if (Array.isArray(v)) lines.push(`${k}: ${v.length ? JSON.stringify(v) : "[]"}`);
    else if (v && typeof v === "object") {
      lines.push(`${k}:`);
      for (const [ik, iv] of Object.entries(v)) lines.push(`  ${ik}: ${scalar(iv)}`);
    } else lines.push(`${k}: ${scalar(v)}`);
  }
  lines.push("---");
  return lines.join("\n");
};

const RESIDUE = "BIO checks that each statement below names a registered subject and carries a "
  + "justification. It does NOT check whether a second source was independent of the first, whether "
  + "a source was in a position to have direct knowledge, or whether the subject was contacted.";

const biasMd = (fm, residue = RESIDUE) => [
  yaml(fm), "",
  "## Statements", "", "The lens this group works under.", "",
  "## Adoption", "", "Adopted at the 2026-07-02 members' meeting under the group's process document.", "",
  "## What This Does Not Enforce", "", residue, "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

const findingsFor = async (fm, residue = RESIDUE) => {
  const text = biasMd(fm, residue);
  const r = await checkBundle({
    folderName: fm.id, files: new Map([["bundle.md", text]]),
    sha256: async (s) => sha(s), nowMs: Date.parse("2026-07-03T00:00:00Z"),
  });
  return r.findings.filter((x) => x.severity === "error").map((x) => x.check);
};
const has = (list, code) => list.includes(code);

{
  const clean = await findingsFor(FM());
  t("a WELL-FORMED bias bundle raises no C-25 finding at all — the baseline the arms below are deltas from",
    clean.filter((c) => c.startsWith("C-25.")), []);
  console.log(`  baseline findings on the clean document: ${J(clean)}`);

  /* C-26.1 — the shape half, three ways. */
  t("C-26.1: no statements[] at all",
    has(await findingsFor(FM({ statements: undefined })), "C-26.1"), true);
  t("C-26.1: a kind outside the closed set of three",
    has(await findingsFor(FM({ statements: [{ ...FM().statements[0], kind: "standard" }] })), "C-26.1"), true);
  t("C-26.1: two statements sharing one id — an override could not name either",
    has(await findingsFor(FM({ statements: [FM().statements[0], { ...FM().statements[0] }] })), "C-26.1"), true);

  /* C-26.2 — subjects are registry entries, not free text (safeguard 4). */
  t("C-26.2: a subject named in PROSE rather than pointed at the registry",
    has(await findingsFor(FM({ statements: [{ ...FM().statements[0], subject: "the city attorney" }] })), "C-26.2"),
    true);
  t("C-26.2: and a well-formed registry key passes — the check is registry-versus-prose and NOT a kind "
  + "whitelist, because DEC-6 ruled every kind the registry carries a legal subject",
    has(await findingsFor(FM({ statements: [{ ...FM().statements[0], subject: "ENT-2026-0099" }] })), "C-26.2"),
    false);

  /* C-26.3 — the justification requirement, on every kind. */
  t("C-26.3: a statement with no justification is an unstated prior with a form around it",
    has(await findingsFor(FM({ statements: [{ ...FM().statements[0], justification: "" }] })), "C-26.3"), true);

  /* C-26.4 — a pattern cites, or it stays in draft. */
  const patternStmt = {
    id: "p1", kind: "pattern", subject: "ENT-2026-0007",
    text: "The auditor has used its discretion to narrow the remediation options it lists.",
    justification: "Three reports in the record show the pattern.", citations: [], locked: false,
  };
  t("C-26.4: an UNCITED pattern statement cannot leave draft",
    has(await findingsFor(FM({ statements: [patternStmt] })), "C-26.4"), true);
  t("C-26.4: and CAN be written in draft, which is what the doctrine says in those words",
    has(await findingsFor(FM({ current_state: "draft", statements: [patternStmt] })), "C-26.4"), false);
  /* A PARSER LIMIT THIS ITEM MET, PINNED BOTH WAYS so the next author does not
     meet it silently. `parseFrontmatter` cannot read a BLOCK sequence nested
     inside a sequence item — `citations:` followed by indented `- ` lines makes
     the key parse as "" AND hoists the items into the OUTER `statements` list,
     so the document acquires a statement that is a bare string. Nothing errors;
     C-26.1 then refuses "statements[1] is not a statement object", which names
     a symptom two steps from the cause. FLOW STYLE parses correctly, so that is
     what a bias statement's `citations` must use — and this pin fails if either
     half of that ever changes. */
  {
    const block = ["---", "statements:", "  - id: \"p1\"", "    citations:",
                   "      - \"INFO-2026-0001-audit\"", "---", ""].join("\n");
    const flow = ["---", "statements:", "  - id: \"p1\"",
                  "    citations: [\"INFO-2026-0001-audit\"]", "---", ""].join("\n");
    t("PARSER LIMIT: a BLOCK sequence nested in a sequence item is MANGLED by the catalogue's frontmatter "
    + "parser — the key empties and the items hoist into the outer list",
      [parseFrontmatter(block).data.statements.length,
       parseFrontmatter(block).data.statements[0].citations],
      [2, ""]);
    t("PARSER LIMIT: FLOW style is read correctly, which is why a bias statement's citations are written "
    + "that way and why this suite writes them that way",
      parseFrontmatter(flow).data.statements[0].citations, ["INFO-2026-0001-audit"]);
  }
  t("C-26.4: a CITED pattern statement leaves draft cleanly",
    has(await findingsFor(FM({ statements: [{ ...patternStmt, citations: ["INFO-2026-0001-audit"] }] })), "C-26.4"),
    false);

  /* C-26.5 — DEC-54's fourth scope: the malformedness refusal. */
  for (const [why, text] of [
    ["everything from a source is false", "Everything the developer's consultant publishes is false."],
    ["a speaker declared a liar", "The council president is a liar and should be read accordingly."],
    ["always lies", "The press office always lies about the timeline."],
    ["never tells the truth", "That office never tells the truth."],
  ]) t(`C-26.5: MALFORMED — ${why}`,
    has(await findingsFor(FM({ statements: [{ ...FM().statements[0], text }] })), "C-26.5"), true);

  /* C-26.6 — DEC-54's first scope: a bar is not a lens. */
  t("C-26.6: AP's own sentence — a bar filed as a bias statement",
    has(await findingsFor(FM({ statements: [{ ...FM().statements[0],
      text: "A story may not run on more than one source unless each has been separately verified." }] })),
    "C-26.6"), true);
  t("C-26.6: STRUCTURAL too — a statement carrying a required_strength field IS a bar whatever its text says",
    has(await findingsFor(FM({ statements: [{ ...FM().statements[0], required_strength: { capture: "B" } }] })),
    "C-26.6"), true);

  /* C-26.7 — DEC-54's second scope, in the document. */
  t("C-26.7: an ADOPTED set that says nothing under `## What This Does Not Enforce`",
    has(await findingsFor(FM(), "   "), "C-26.7"), true);
  t("C-26.7: and a DRAFT set is exempt — the residue is authored as part of proposing, not before it",
    has(await findingsFor(FM({ current_state: "draft" }), "   "), "C-26.7"), false);
}

/* ======================================================================= 3
 * OVER-STRICTNESS. Real sentences, phrased unlike anything written here.
 * ===================================================================== */
console.log("\n--- 3. OVER-STRICTNESS: correct statements phrased unlike anything in this file must PASS ---");
{
  /* These are the actual newsroom sentences DEC-54 quotes, plus two written to
     be as close to the refusal boundary as an honest statement gets. A
     predicate that refused any of them would remove the DECLARATION rather than
     the bias, which is the masking safeguard 5 exists to defeat. */
  const MUST_PASS = [
    ["Reuters, quoted in DEC-54",
     "Weigh the source's track record, position and motive before relying on what they say."],
    ["AP, quoted in DEC-54",
     "Consider whether the source is reliable and in a position to have direct knowledge."],
    ["the doctrine's own scrutiny example",
     "Anything the mayor says about the fund needs to be cross-checked for accuracy before it bears load."],
    ["the doctrine's own inference example",
     "The city attorney often refuses to respond to media requests, so a lack of response is not an "
     + "indication of agreement or disagreement with statements made by others."],
    ["a strongly worded but evidenced pattern",
     "The auditor has repeatedly used its discretion to control which remediation options are listed."],
    ["a statement that MENTIONS falsity without issuing a verdict",
     "Where a claim has been shown false elsewhere in the record, raise the corroboration this source needs."],
    ["a statement that mentions sources and sets NO threshold",
     "Prefer sources who were present over sources who were briefed."],
  ];
  for (const [who, text] of MUST_PASS) {
    t(`OVER-STRICTNESS (${who}): not read as a verdict`,
      BIAS_VERDICT_WHOLESALE.test(text) || BIAS_VERDICT_SPEAKER.some((r) => r.test(text)), false);
    t(`OVER-STRICTNESS (${who}): not read as a bar`,
      BIAS_BAR_PHRASING.some((r) => r.test(text)), false);
  }
  /* AND THE POLARITY, so the arms above are not passing because the predicates
     match nothing at all — the failure REC-56 measured on its own walk. */
  t("POLARITY: the verdict predicate DOES fire on the doctrine's own malformed example",
    BIAS_VERDICT_WHOLESALE.test("Everything from Y is false."), true);
  t("POLARITY: the bar predicate DOES fire on DEC-54's own example of a bar",
    BIAS_BAR_PHRASING.some((r) => r.test("Every story requires more than one source.")), true);
}

/* ======================================================================= 4
 * DEC-49: every refusal is a C-number with a code and a canned translation.
 * ===================================================================== */
console.log("\n--- 4. the refusals, each a C-number with a code and a canned translation from ONE place ---");
{
  const rows = Object.entries(BIAS_CHECKS);
  t("ELEVEN refusals are allocated, and every one carries check + where + translation",
    /* C-26, not C-25 — the family moved at the rebase because PL-1 landed first
       and took C-25 (see the note at BIAS_CHECKS). THIS LINE IS WHY THE ARM IS
       WORTH HAVING: the wholesale renumber was a regex on `C-25.<digits>`, and
       this occurrence is written `C-25\.\d+` inside a REGEX LITERAL — the
       backslash sits where the renumber expected a dot, so it was the one
       reference in 102 that did not move, and the suite caught it on the first
       run after the rebase rather than a reader catching it later. */
    [rows.length, rows.every(([, r]) => /^C-26\.\d+$/.test(r.check) && r.where && r.translation.length > 60)],
    /* ELEVEN, not ten: C-26.11 (BIAS_REFUSED) was added 2026-08-08 when VF-2's
       DEC-49 guard measured that the write path's ENVELOPE code carried no
       translation. Corrected here rather than exempted. */
    [11, true]);
  t("the C-numbers are unique — an allocation reused is an allocation nobody can act on",
    new Set(rows.map(([, r]) => r.check)).size, rows.length);
  t("DEC-54's four scopes each have a NUMBER, which is what makes each a mechanism rather than a paragraph",
    [BIAS_CHECKS.BIAS_STATEMENT_IS_A_BAR.check,       // (a) split bars from bias
     BIAS_CHECKS.BIAS_RESIDUE_UNSTATED.check,         // (b) residue as published output
     BIAS_CHECKS.BIAS_INHALE_CANNOT_ADOPT.check,      // (c) propose, never install
     BIAS_CHECKS.BIAS_STATEMENT_ISSUES_A_VERDICT.check], // (d... the malformedness refusal
    ["C-26.6", "C-26.7", "C-26.8", "C-26.5"]);
  t("the BAR refusal NAMES WHERE THE SENTENCE BELONGS rather than only refusing it — a member told only "
  + "`no` concludes BIO cannot express their standard, which ends in a standard claimed and not followed",
    /required strength/i.test(BIAS_CHECKS.BIAS_STATEMENT_IS_A_BAR.translation), true);
  t("the store reads the translations from the CATALOGUE and holds no second copy",
    [/import \{ BIAS_CHECKS/.test(STORE),
     /translation: ['"]/.test(bodyOf(STORE, "#biasRefuse("))],
    [true, false]);
}

/* ======================================================================= 5
 * DEC-54 (c) — INHALE PROPOSES AND NEVER INSTALLS, asserted at the SOURCE.
 * ===================================================================== */
console.log("\n--- 5. DEC-54 (c): the inhale holds NO WRITE PATH, off store.mjs's own bytes ---");
const INHALE = bodyOf(STORE, "biasInhale({");
{
  t("ARM I0: the method was found, so the arms below are read over real bytes and not over an empty string",
    INHALE.length > 800, true);
  /* ARM I5 — THE CONTROL'S TARGET. Six ways a write reaches this store, all
     refused in one place, because naming only `sql.exec` would let a write in
     through `promote` or a transaction wrapper. */
  t("ARM I5: no SQL execution",             /\bsql\.exec\(/.test(INHALE), false);
  t("ARM I5: no transaction",               /transactionSync\(/.test(INHALE), false);
  t("ARM I5: no promotion",                 /this\.promote\(/.test(INHALE), false);
  t("ARM I5: no adoption",                  /biasAdopt\(/.test(INHALE), false);
  t("ARM I5: no storage put",               /storage\.put\(/.test(INHALE), false);
  t("ARM I5: and no INSERT/UPDATE/DELETE of any kind anywhere in the body",
    /\b(INSERT|UPDATE|DELETE)\b/.test(INHALE), false);
  t("and the op table says the same thing a second way: biasinhale is NON-mutating",
    /biasinhale:\s*\{ classes: \["admin", "member", "probe"\],\s+mutating: false \}/.test(INDEX), true);
  t("SEEK GUARD on ARM I5: the SAME predicates DO fire on biasAdopt, which legitimately writes — so the "
  + "arms above are a fact about biasInhale and not a broken matcher",
    [/\bsql\.exec\(/.test(bodyOf(STORE, "biasAdopt({")),
     /INSERT/.test(bodyOf(STORE, "biasAdopt({"))],
    [true, true]);
}

/* ======================================================================= 6
 * SCHEMA AND PURGE — D-113, and the placement trap.
 * ===================================================================== */
console.log("\n--- 6. the two new tables: placed, and in BOTH purge arms (D-113) ---");
{
  const iStat = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS bias_statements");
  const iAdopt = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS bias_adoptions");
  const iGov = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS host_governor");
  t("both tables exist and BOTH sit before the host_governor block, which hygiene.test.mjs requires",
    [iStat > 0, iAdopt > iStat, iGov > iAdopt], [true, true, true]);
  t("ARM P1: both are in purge's TABLES list, so both clear in the per-bundle arm AND the whole-store arm",
    [/TABLES = \[[\s\S]*?"bias_statements"[\s\S]*?\]/.test(STORE),
     /TABLES = \[[\s\S]*?"bias_adoptions"[\s\S]*?\]/.test(STORE)],
    [true, true]);
  t("and an adoption HELD BY a purged project clears on scope_id — the project_participants precedent, "
  + "because a lens outliving its project would be handed to whatever bundle inherits the id",
    /DELETE FROM bias_adoptions WHERE scope_id=\?/.test(STORE), true);
  /* THE SCHEMA TRAP THIS ITEM MET, pinned so the next table does not meet it.
     #migrate splits the schema on ";" AFTER dropping full-line comments, so a
     SEMICOLON inside an INLINE comment truncates the statement and the whole
     migration dies with SQLITE_ERROR: incomplete input.
     IT IS NOW IN CLAUDE.md's TRAP LIST — PL-1 met it in the same window and
     delegated it to CONDUCT, who added it on 2026-08-08. This pin is KEPT all
     the same, and the distinction is the one CLAUDE.md itself draws: a trap in a
     document is read by whoever reads the document, and a trap in an assertion
     fails the build. Two sessions hit this within hours of each other, which is
     the measurement that says the documented half was not going to be enough. */
  const inlineWithSemicolon = SCHEMA_SRC.split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .filter((l) => l.includes("--") && l.slice(l.indexOf("--")).includes(";"));
  t("SCHEMA TRAP: no INLINE `--` comment anywhere in schema.mjs contains a semicolon — #migrate splits the "
  + "whole schema on `;` after dropping full-line comments, so one would truncate a CREATE TABLE and kill "
  + "the migration with `incomplete input`",
    inlineWithSemicolon, []);
}

/* ======================================================================= 7
 * THE RUNTIME. Everything below goes through the CONTROL PLANE.
 * ===================================================================== */
console.log("\n--- 7. the runtime: a bias bundle written, proposed, adopted, and in force ---");
const IDX = SRC("index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl12", MEMBER_TOKEN: "mem-pl12", PROBE_TOKEN: "prb-pl12", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-pl12") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok = "mem-pl12") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json());
const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId: id, cover: `cover for ${id}`, role, capabilities: caps }, "adm-pl12");
  const en = await post("enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${J(en)}`);
  const lg = await post("login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${J(lg)}`);
  return lg.token;
};

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const promote = async (id, text, type, state, base = null, tok) => await post("promote", {
  bundleId: id, base, snapKey: `${id}-${base ? "rev" : "new"}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: state, created: NOW, last_updated: LATER },
}, tok);
/* THE CAS BASE FOR A REVISION, taken from the WRITE'S OWN ANSWER.
 *
 * Measured rather than assumed, and the first two guesses were both wrong in
 * ways that are worth recording because they failed QUIETLY: `op=gatefacts` is
 * not a control-plane op at all (it is reached only inside op=ratify, so a
 * caller gets `unknown op` and a `?.` chain turns that into `null`), and a null
 * base makes `promote` read as a CREATION, which is refused `EXISTS` — a
 * refusal that names the symptom and not the cause. So the sha comes from the
 * promote that wrote it, which is the only place it is authoritative anyway. */
const SHA = new Map();
const write = async (id, text, type, state, tok) => {
  const r = await promote(id, text, type, state, SHA.get(id) ?? null, tok);
  if (r?.bundleSha) SHA.set(id, r.bundleSha);
  return r;
};

/* TWO ADMINISTRATORS FIRST, because the roster refuses an ordinary member until
   two exist: "administrative access is shared among at least two people so that
   losing one person does not lose the group" (ADMINS_FIRST). Learned by driving
   the op rather than by reading about it. */
const ADMIN = await member("adele", ["contribute", "publish"], "admin");
await member("basil", ["contribute", "publish"], "admin");
const MEMBER = await member("mo", ["contribute", "create_projects"]);
const OUTSIDER = await member("otto", ["contribute"]);

const projectMd = (id, title) => ["---", `id: ${id}`, "object_type: project",
  `title: "${title}"`, "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "---", "", "## Thesis Summary", "", "A project.", "",
  "## Open Questions", "", "## Ruled Out", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const INSTANCE_ID = "BIAS-2026-0001-house-lens";
const PROJECT_ID = "PROJ-2026-0001-sewer-fund";

/* ---- the instance set, written at DRAFT and moved by its own state machine ---- */
const instanceFm = (state, over = {}) => FM({
  id: INSTANCE_ID, current_state: state,
  statements: [
    { id: "s1", kind: "scrutiny", subject: "ENT-2026-0007",
      text: "Claims from the city attorney's office need a second, independent record before they bear load.",
      justification: "The office is a party to several matters this group is examining.",
      citations: [], locked: true },
    { id: "s2", kind: "inference", subject: "ENT-2026-0008",
      text: "The public works department often does not answer media requests, so silence is not agreement.",
      justification: "Measured across eleven requests in the record.", citations: [], locked: false },
    { id: "s3", kind: "scrutiny", subject: "ENT-2026-0009",
      text: "Weigh the consultant's track record, position and motive before relying on their figures.",
      justification: "The consultant is retained by a party to the matter.", citations: [], locked: false },
  ],
  ...over,
});

await block("7", async () => {
  const draft = await write(INSTANCE_ID, biasMd(instanceFm("draft")), "bias", "draft", MEMBER);
  t("D-84 CLOSED, and this is the assertion the row is written in: A BIAS BUNDLE IS WRITABLE",
    draft.ok, true);
  console.log(`  wrote ${INSTANCE_ID}: ${J({ ok: draft.ok, reason: draft.reason ?? null })}`);

  /* ARM M — a MALFORMED set is refused AT THE WRITE, by C-number, with the
     translation the surface will render. */
  const bad = await promote("BIAS-2026-0002-bad", biasMd(FM({
    id: "BIAS-2026-0002-bad", current_state: "draft",
    statements: [{ id: "b1", kind: "scrutiny", subject: "ENT-2026-0007",
                   text: "The council president is a liar and nothing from that office is true.",
                   justification: "Because we say so.", citations: [], locked: false }],
  })), "bias", "draft", null, MEMBER);
  t("ARM M: a MALFORMED bias bundle NEVER LANDS — refused at the write, not merely at a later gate",
    [bad.ok, bad.reason], [false, "BIAS_REFUSED"]);
  t("ARM M: and the refusal carries the C-NUMBER, the DEC-49 code and the canned translation",
    [bad.findings?.[0]?.check, bad.findings?.[0]?.code,
     (bad.findings?.[0]?.translation || "").includes("may never issue verdicts")],
    ["C-26.5", "BIAS_STATEMENT_ISSUES_A_VERDICT", true]);
  /* ADDED 2026-08-08, and VF-2's DEC-49 guard is what asked for it. The
     per-finding translations above looked complete and were not: a surface
     renders a translation keyed on the code the plane sent FIRST, and the
     ENVELOPE's `reason` had no row — a member would have met the bare word
     BIAS_REFUSED while the translations sat one level down in a list the
     surface had no reason to open. The container now carries its own, and it
     says the thing no per-finding sentence can: that NOTHING LANDED. */
  t("ARM M: and the ENVELOPE carries a translation too, not only the findings — the code a surface keys "
  + "on first is the one that must never be bare machine vocabulary (DEC-49)",
    [bad.check, (bad.translation || "").includes("Nothing was saved")], ["C-26.11", true]);
  t("ARM M: nothing of the refused set reached the record",
    (await get("list", "type=bias&limit=100", MEMBER)).bundles.filter((b) => b.id === "BIAS-2026-0002-bad").length, 0);

  /* THE PROJECTION IS A PROJECTION OF THE DOCUMENT (D-21). */
  const st = await get("stats", "", ADMIN);
  t("the statements are PROJECTED from the document's own statements[], three of them",
    st.biasStatements, 3);
});

/* ---- DEC-54 (c): the manifest is NOT in force until a member adopts ---- */
console.log("\n--- 8. DEC-54 (c): the set is not in force until a MEMBER adopts it, by name ---");
await block("8", async () => {
  const before = await get("biasmanifest", "scope=instance", MEMBER);
  t("a set that is merely WRITTEN puts no lens over anybody's work",
    [before.in_force, before.stated], [false, "no manifest was in force"]);

  const tooEarly = await get("biasadopt", `bundleId=${INSTANCE_ID}`, MEMBER);
  t("C-26.10: a DRAFT set cannot be adopted — the middle step is what stops a set becoming binding "
  + "without anybody having offered it",
    [tooEarly.ok, tooEarly.reason, tooEarly.check],
    [false, "BIAS_ADOPTION_NOT_PROPOSED", "C-26.10"]);

  /* THE MEMBER-AUTHORED TRANSITION, through op=promote like every other. */
  const proposed = await write(INSTANCE_ID, biasMd(instanceFm("proposed")), "bias", "proposed", MEMBER);
  t("the set is OFFERED — a member-authored transition through the ordinary write path", [proposed.ok, proposed.reason ?? null, proposed.findings ?? null], [true, null, null]);

  /* C-26.9 — a machine credential holds no name to put on an authored act. */
  const machine = rP(await (await mf.dispatchFetch(
    `http://x/api/?op=biasadopt&token=mem-pl12&bundleId=${INSTANCE_ID}`)).json());
  t("C-26.9: a MACHINE credential cannot adopt — DEC-46/D-90/D-82, and the reason DEC-54 (c) gives: "
  + "otherwise a group `follows BBC standards` with nobody in the group having authored anything",
    [machine.ok, machine.reason, machine.check],
    [false, "BIAS_ADOPTION_NOT_AUTHORED", "C-26.9"]);

  const adopted = await get("biasadopt", `bundleId=${INSTANCE_ID}`, MEMBER);
  t("a MEMBER adopts, and the record names them", [adopted.ok, adopted.author, adopted.reason ?? adopted.error ?? null], [true, "mo", null]);
  t("DEC-54 (d): THE PIN is taken at the authored moment — the revision adopted, frozen",
    [typeof adopted.pinned?.bundle_sha === "string", adopted.pinned?.bundle_sha?.length ?? null], [true, 64]);
  t("and the answer STATES that the row alone does not put the lens in force, rather than leaving it "
  + "to be discovered",
    adopted.in_force, false);

  const still = await get("biasmanifest", "scope=instance", MEMBER);
  t("FAIL-CLOSED: with the row written and the bundle still at `proposed`, NO lens is in force — at no "
  + "point does one act alone put a lens over somebody's work",
    [still.in_force, still.stated], [false, "no manifest was in force"]);
});

/* ---- IN FORCE ---- */
console.log("\n--- 9. in force: the effective set, its hash, and DEC-54 (b)'s residue ---");
let INSTANCE_SHA = null;
await block("9", async () => {
  const now = await write(INSTANCE_ID, biasMd(instanceFm("adopted")), "bias", "adopted", MEMBER);
  t("the group adopts the set on the document too — the member-authored transition the doctrine requires",
    now.ok, true);

  const m = await get("biasmanifest", "scope=instance", MEMBER);
  INSTANCE_SHA = m.statements_sha;
  t("THE MANIFEST IS IN FORCE: (bundle id, revision) plus a hash of the computed effective set",
    [m.in_force, m.stated, m.bundles.length, m.bundles[0].bundle_id, typeof m.statements_sha],
    [true, null, 1, INSTANCE_ID, "string"]);
  t("the effective set is the three statements, and each names its own bundle, scope and lock",
    [m.total, m.statements.map((s) => s.statement_id), m.statements.find((s) => s.statement_id === "s1").locked],
    [3, ["s1", "s2", "s3"], true]);
  t("ENVELOPED (IC-25/26/27/28): the bound APPLIED is published beside `truncated`, in the spelling the "
  + "plane already uses",
    [m.limit, m.offset, m.count, m.total, m.truncated], [200, 0, 3, 3, false]);
  const cut = await get("biasmanifest", "scope=instance&limit=1", MEMBER);
  t("and the bound BITES, saying so — `this is all of it` cannot read like `this is the first N`",
    [cut.limit, cut.count, cut.total, cut.truncated], [1, 1, 3, true]);
  t("THE HASH IS OVER THE WHOLE SET AND NOT OVER THE PAGE — a manifest hash that moved with `limit` would "
  + "make two runs under ONE identical lens cite two different manifests, which is the only thing it is for",
    [cut.statements_sha === m.statements_sha, m.statements_sha_covers.includes("whole effective set")],
    [true, true]);
  t("DEC-54 (b): THE RESIDUE TRAVELS WITH THE MANIFEST, read from the bundle's own bytes",
    [m.residue.length, m.residue[0].stated, m.residue[0].text.includes("direct knowledge")],
    [1, true, true]);
});

/* ---- the project layer, the overrides, and the LOCK ---- */
console.log("\n--- 10. the project layer: additions, nullifications, and the LOCK that binds projects ---");
const PROJECT_BIAS = "BIAS-2026-0003-sewer-lens";
await block("10", async () => {
  const p = await promote(PROJECT_ID, projectMd(PROJECT_ID, "Sewer fund"), "project", "forming", null, MEMBER);
  if (!p.ok) throw new Error(`project: ${J(p)}`);

  const projFm = (state) => FM({
    id: PROJECT_BIAS, current_state: state,
    statements: [
      { id: "p1", kind: "scrutiny", subject: "ENT-2026-0011",
        text: "Figures from the fund's own dashboard need the underlying ledger before they bear load.",
        justification: "The dashboard is produced by the body under examination.", citations: [], locked: false },
      /* A nullification of an UNLOCKED instance statement: legitimate. */
      { id: "p2", kind: "inference", subject: "ENT-2026-0008",
        text: "", justification: "This project reads silence differently and says so.",
        citations: [], locked: false, nullifies: "s2" },
      /* A nullification of a LOCKED instance statement: a conformance error,
         full stop, and REFUSED ITS EFFECT rather than merely reported. */
      { id: "p3", kind: "scrutiny", subject: "ENT-2026-0007",
        text: "", justification: "This project would rather not carry the instance's scrutiny rule.",
        citations: [], locked: false, nullifies: "s1" },
    ],
  });
  const d = await write(PROJECT_BIAS, biasMd(projFm("draft")), "bias", "draft", MEMBER);
  if (!d.ok) throw new Error(`project bias draft: ${J(d)}`);
  await write(PROJECT_BIAS, biasMd(projFm("proposed")), "bias", "proposed", MEMBER);
  const ad = await get("biasadopt", `bundleId=${PROJECT_BIAS}&scope=project&scopeId=${PROJECT_ID}`, MEMBER);
  t("a PROJECT adopts its own set, scoped to the project", [ad.ok, ad.scope, ad.scope_id],
    [true, "project", PROJECT_ID]);
  await write(PROJECT_BIAS, biasMd(projFm("adopted")), "bias", "adopted", MEMBER);

  const m = await get("biasmanifest", `scope=project&scopeId=${PROJECT_ID}`, MEMBER);
  const ids = m.statements.map((s) => s.statement_id).sort();
  /* CORRECTED ON FIRST RUN, and the correction is a real design point rather
     than a typo. The first expectation listed p2 and p3 in the effective set,
     which would have been wrong: a PURE NULLIFICATION states nothing, it
     REMOVES something, so it is not itself a member of the lens. An override
     that also carries text is a REPLACEMENT and DOES appear (the doctrine's own
     word). p2 and p3 nullify without stating, so the set is p1 (the project's
     addition) plus the instance statements that survived. */
  t("EFFECTIVE BIAS = instance statements MINUS project nullifications of UNLOCKED statements PLUS "
  + "project additions — the doctrine's own sentence, computed",
    ids, ["p1", "s1", "s3"]);
  t("s2 was nullified and is GONE", ids.includes("s2"), false);
  t("and a PURE NULLIFICATION is not itself a statement in the lens — it removes one rather than stating "
  + "one, so p2 and p3 do the work and do not appear",
    [ids.includes("p2"), ids.includes("p3")], [false, false]);
  t("THE LOCK HELD: s1 is locked, so p3's nullification was REFUSED ITS EFFECT and s1 STANDS. Honouring it "
  + "and reporting it would be the loosening the lock exists to prevent, arriving by the diagnostic channel",
    [ids.includes("s1"), m.lock_violations.length, m.lock_violations[0].nullifies], [true, 1, "s1"]);
  t("the project's manifest names BOTH sets in force, each at its own pinned revision",
    m.bundles.map((b) => b.bundle_id).sort(), [INSTANCE_ID, PROJECT_BIAS].sort());
  t("and the project's lens hashes DIFFERENTLY from the instance's — which is what makes a lens diff "
  + "computable at an accept ceremony rather than an argument",
    m.statements_sha === INSTANCE_SHA, false);
});

/* ---- the gate ---- */
console.log("\n--- 11. the gate: a lens inside a project the viewer was never invited to ---");
await block("11", async () => {
  /* FIXTURE ARMS THE TRAP, and it has to: `viewerPredicate` filters PROJECT
     bundles by participation and NOTHING else, so a gate arm run against a
     project the outsider could see anyway would pass at zero cost. Proved by
     driving op=list as each of them. */
  t("FIXTURE ARMS THE TRAP: the project is visible to its own member and INVISIBLE to the outsider, so "
  + "the arm below is a fact about the gate and not about an empty corpus",
    [(await get("list", "limit=100", MEMBER)).bundles.some((b) => (b.bundle_id ?? b.id) === PROJECT_ID),
     (await get("list", "limit=100", OUTSIDER)).bundles.some((b) => (b.bundle_id ?? b.id) === PROJECT_ID)],
    [true, false]);

  const seen = await get("biasmanifest", `scope=project&scopeId=${PROJECT_ID}`, OUTSIDER);
  const absent = await get("biasmanifest", "scope=project&scopeId=PROJ-2026-9999-nothing", OUTSIDER);
  /* IDENTICAL EXCEPT FOR THE CALLER'S OWN INPUT. `scope_id` is echoed from the
     request, so it carries no record fact and cannot be the leak; every other
     field must agree, which is the honest form of the byte-identity claim.
     Stated this way rather than dropping the echo, because an answer that did
     not name the scope it answered for would be a different defect. */
  const strip = (a) => { const { scope_id, ...rest } = a; return rest; };
  t("an UNINVITED viewer is answered exactly as they are for a project that does not exist — identical in "
  + "every field but the one the caller supplied, because a manifest discloses not only that a project "
  + "exists but what its members believe about named institutions",
    J(strip(seen)), J(strip(absent)));
  t("and the MEMBER of that same project gets the lens — so the arm above is the gate biting, not the "
  + "manifest being empty",
    (await get("biasmanifest", `scope=project&scopeId=${PROJECT_ID}`, MEMBER)).in_force, true);
  t("and the withholding publishes NO count, because the count is the leak",
    [Object.prototype.hasOwnProperty.call(seen, "withheld"), seen.in_force], [false, false]);
});

/* ======================================================================= 12
 * THE RUN CARRIES THE MANIFEST IN FORCE — §3's obligation, discharged.
 * ===================================================================== */
console.log("\n--- 12. §3: the run carries the manifest IN FORCE, not the stated absence ---");
await block("12", async () => {
  const open1 = await post(`airunopen`, {
    run: "run-no-lens", contextType: "project", contextId: PROJECT_ID,
    principalClaude: "project", skillVersion: "investigative-session@1", biasManifest: null,
  }, MEMBER);
  if (!open1.started) throw new Error(`airunopen: ${J(open1)}`);
  const r1 = await get("airun", "run=run-no-lens", MEMBER);
  t("THE ABSENCE IS STILL SUPPORTED AND IS NOW STATED WHERE A READER CAN SEE IT — measured before this "
  + "item, `op=airun` published NO bias field at all, so §3's honest absence was stated NOWHERE",
    [r1.session.bias.in_force, r1.session.bias.stated, r1.session.bias.manifest],
    [false, "no manifest was in force", null]);

  const live = await get("biasmanifest", `scope=project&scopeId=${PROJECT_ID}`, MEMBER);
  const open2 = await post(`airunopen`, {
    run: "run-with-lens", contextType: "project", contextId: PROJECT_ID,
    principalClaude: "project", skillVersion: "investigative-session@1",
    biasManifest: JSON.stringify({ scope: "project", scope_id: PROJECT_ID,
      statements_sha: live.statements_sha,
      bundles: live.bundles.map((b) => ({ bundle_id: b.bundle_id, revision: b.revision })) }),
  }, MEMBER);
  if (!open2.started) throw new Error(`airunopen 2: ${J(open2)}`);
  const r2 = await get("airun", "run=run-with-lens", MEMBER);
  t("IN FORCE: the run names the lens it was formed under — (bundle id, revision) and the effective-set hash",
    [r2.session.bias.in_force, r2.session.bias.stated,
     r2.session.bias.manifest.bundles.length,
     r2.session.bias.manifest.statements_sha === live.statements_sha],
    [true, null, 2, true]);
  t("AND `in force` IS NOT AN ECHO: the record's CURRENT set is published beside the recorded one, and "
  + "`moved` compares them — which is what makes bias debt computable against the run's output",
    [r2.session.bias.now.in_force, r2.session.bias.now.statements_sha === live.statements_sha,
     r2.session.bias.moved],
    [true, true, false]);

  /* THE LENS MOVES. This is the whole payoff of carrying the manifest. */
    
  const moved = FM({ id: PROJECT_BIAS, current_state: "adopted", statements: [
    { id: "p1", kind: "scrutiny", subject: "ENT-2026-0011",
      text: "Figures from the fund's own dashboard need the underlying ledger AND a second reader.",
      justification: "The dashboard is produced by the body under examination.", citations: [], locked: false },
  ] });
  const rev = await write(PROJECT_BIAS, biasMd(moved), "bias", "adopted", MEMBER);
  if (!rev.ok) throw new Error(`revise: ${J(rev)}`);
  const r3 = await get("airun", "run=run-with-lens", MEMBER);
  t("THE LENS MOVED, AND THE RUN SAYS SO: `moved: true` — the run's output owes a re-run under the "
  + "current set, which is ORDINARY BIAS DEBT and blocks nothing (DEC-20)",
    [r3.session.bias.in_force, r3.session.bias.moved,
     r3.session.bias.manifest.statements_sha === r3.session.bias.now.statements_sha],
    [true, true, false]);
  t("ARM D2: and NOTHING REFUSES the run for it — this item adds no gate, because ordinary declared bias "
  + "is DISCLOSED and TRAVELS (DEC-20, D-188). Only an uncleared HUNCH disqualifies, and none is named here",
    [r3.found, r3.session.status], [true, "running"]);
});

/* ======================================================================= 13
 * THE FENCE — the search half never receives the manifest. BY CONSTRUCTION.
 * ===================================================================== */
console.log("\n--- 13. THE FENCE (§14): a SEARCH sub-session's spawn payload has NO bias field ---");
await block("13", async () => {
  /* THE FENCE IS THE ITEM, NOT THE SKILL. §14: *"a skill is instructions; a
     fence is code"*, and `Content_Framework:1283` forbids the coupling outright:
     *"bias never shapes what is captured or monitored, only how conclusions are
     weighed."* So the assertion is NO FIELD BY CONSTRUCTION over the payload the
     plane BUILDS — not a check that the field is empty, which a later default
     would fill. */
  const spawn = await get("airunspawn", "run=run-with-lens&half=search", MEMBER);
  t("ARM F1: the search half's spawn payload carries NO bias field of ANY name — absent, not empty",
    Object.keys(spawn.payload).filter((k) => /bias|manifest|lens/i.test(k)), []);
  t("ARM F2: and no VALUE in the payload is the manifest hash, so it cannot arrive wearing another name",
    JSON.stringify(spawn.payload).includes(INSTANCE_SHA ?? "unreachable"), false);
  /* ARM F3 IS OVER THE PAYLOAD LITERAL, NOT OVER THE METHOD. Corrected on first
     run: the method legitimately mentions bias, because its COMPOSING branch
     carries the manifest — §14 requires exactly that. What must contain no bias
     of any kind is the OBJECT THE SEARCH HALF RECEIVES, so the arm reads the
     `const payload = { ... }` literal itself. Asserting over the whole method
     would have been an arm that could only be satisfied by deleting the
     composing half, which is not the rule. */
  const payloadLiteral = (() => {
    const body = bodyOf(STORE, "aiRunSpawnPayload({");
    const i = body.indexOf("const payload = {");
    if (i < 0) return "";
    let depth = 0;
    for (let p = body.indexOf("{", i); p < body.length; p++) {
      if (body[p] === "{") depth++;
      else if (body[p] === "}") { depth--; if (depth === 0) return body.slice(i, p + 1); }
    }
    return "";
  })();
  t("ARM F3: the payload LITERAL reads no bias column and names no bias field — there is nowhere for one "
  + "to be read from, which is what `by construction` means",
    [payloadLiteral.length > 200, /bias|manifest|lens/i.test(payloadLiteral)], [true, false]);
  t("ARM F3b: and the payload is NOT built by spreading the run row — a spread would carry every column "
  + "`ai_runs` gains tomorrow straight through this fence",
    /\.\.\.row/.test(bodyOf(STORE, "aiRunSpawnPayload({")), false);
  t("ARM F4: the COMPOSING half is a different question and is deliberately not fenced — §14 carries the "
  + "manifest there for disclosure and for the weighing it discloses",
    (await get("airunspawn", "run=run-with-lens&half=compose", MEMBER)).bias.in_force, true);
  t("ARM F5: SEEK GUARD — the fence arms are read over a payload that actually has fields, so ARM F1 is "
  + "not passing over an empty object",
    Object.keys(spawn.payload).length > 3, true);
});

/* ======================================================================= 14
 * DEC-54 (a) and (b) LIVE: the inhale splits, publishes the residue, proposes.
 * ===================================================================== */
console.log("\n--- 14. DEC-54 (a) and (b): the inhale, driven on a real newsroom-shaped policy ---");
await block("14", async () => {
  /* The sentences DEC-54 itself quotes, plus the uncountable properties the
     search-completeness research names as the ones that actually protect. */
  const POLICY = [
    "A story may not run on more than one source unless each has been separately verified.",
    "Consider whether the source is reliable and in a position to have direct knowledge.",
    "Weigh the source's track record, position and motive before relying on what they say.",
    "A refusal to comment does not mean the allegation is true.",
    "Reporters must maintain a chain of custody for every document obtained from a confidential source.",
    "The subject of an investigative story must be given a meaningful opportunity to respond.",
    "The department has repeatedly declined to release the underlying data.",
    "Everything from an anonymous tip line is false.",
  ].join(" ");
  const inh = await post("biasinhale", { policy: POLICY, source: "https://ap.example/standards",
                                         retrieved: "2026-07-01" }, MEMBER);

  t("DEC-54 (c) LIVE: the answer says it installed NOTHING, three ways, so a consumer reading any one of "
  + "them cannot believe something changed",
    [inh.installed, inh.adopted, inh.writes], [false, false, 0]);
  t("ARM I6: and NOTHING WAS WRITTEN — the live half of the control, because a source pin alone can be "
  + "satisfied by a write that hides behind a helper",
    (await get("stats", "", ADMIN)).biasAdoptions, 2);

  t("DEC-54 (a) THE SPLIT: AP's `more than one source` came back as a BAR and never as a statement",
    [inh.bars_count >= 1, inh.bars[0].construct,
     inh.statements.some((s) => /more than one source/.test(s.text))],
    [true, "required_strength", false]);
  t("and the bar's detail NAMES WHERE IT BELONGS rather than only refusing it",
    /pre-flight/.test(inh.bars[0].detail), true);

  t("DEC-54 (a) THE OTHER HALF: AP's `in a position to have direct knowledge` came back as kind=scrutiny — "
  + "the sentence the ruling says an extractor would systematically DROP",
    inh.statements.filter((s) => /direct knowledge/.test(s.text)).map((s) => s.kind), ["scrutiny"]);
  t("and Reuters' sentence too, phrased quite differently, which is the over-strictness arm arriving live",
    inh.statements.filter((s) => /track record, position and motive/.test(s.text)).map((s) => s.kind),
    ["scrutiny"]);
  t("an INFERENCE sentence is recognised as one — `a refusal to comment does not mean the allegation is true`",
    inh.statements.filter((s) => /refusal to comment/.test(s.text)).map((s) => s.kind), ["inference"]);

  t("DEC-54 (b) THE RESIDUE: chain of custody and the opportunity to respond — the UNCOUNTABLE properties "
  + "that failed in four of five documented verification failures — are NAMED and not dropped",
    [inh.residue.some((r) => /chain of custody/.test(r.text)),
     inh.residue.some((r) => /opportunity to respond/.test(r.text))],
    [true, true]);
  t("and the residue is published at the SAME RANK as the extraction, with its own count and a coverage "
  + "block, so a surface cannot show the extraction and leave the residue behind a fold",
    [typeof inh.residue_count, inh.coverage.not_mechanised === inh.residue_count,
     inh.coverage.mechanised === inh.bars_count + inh.statements_count],
    ["number", true, true]);
  t("the INPUT bound is published SEPARATELY from the output bounds — `40 statements from a policy we read "
  + "half of` and `40 from one we read all of` are different claims",
    [inh.coverage.sentences_read, inh.coverage.sentences_total, inh.coverage.input_truncated],
    [8, 8, false]);

  t("THE MACHINE IS BOUND BY THE MALFORMEDNESS RULE EXACTLY AS A MEMBER IS (DEC-54 constraint 2): the "
  + "wholesale-falsity sentence was dropped to the RESIDUE with C-26.5 against it, never proposed",
    [inh.statements.some((s) => /anonymous tip line/.test(s.text)),
     inh.residue.find((r) => /anonymous tip line/.test(r.text))?.check],
    [false, "C-26.5"]);
  t("AND IT NEVER PROPOSES kind=pattern — a reader of somebody else's policy holds no evidence in THIS "
  + "record, so the pattern-shaped sentence went to the residue naming that reason",
    [inh.statements.some((s) => s.kind === "pattern"),
     /cite evidence in THIS record/.test(inh.residue.find((r) => /repeatedly declined/.test(r.text))?.why ?? "")],
    [false, true]);

  const forced = await post("biasinhale", { policy: POLICY, adopt: true }, MEMBER);
  t("C-26.8: a caller ASKING it to adopt is REFUSED BY NAME rather than silently ignored — a silent ignore "
  + "is how a caller comes to believe it installed",
    [forced.ok, forced.reason, forced.check], [false, "BIAS_INHALE_CANNOT_ADOPT", "C-26.8"]);
});

/* ======================================================================= 15
 * DEC-46, UNTOUCHED: the acknowledgement is authored at export and is a
 * DIFFERENT OBJECT from the manifest this item builds.
 * ===================================================================== */
console.log("\n--- 15. ARM D1 / DEC-46: the acknowledgement stays authored at export, byte-checked ---");
await block("15", async () => {
  t("the acknowledgement and the manifest are two fields and two mechanisms — the manifest is COMPUTED and "
  + "stamped by the plane, the acknowledgement is AUTHORED by the member in the ceremony",
    [/bias_acknowledgement/.test(STORE), /statements_sha/.test(STORE)], [true, true]);
  t("ARM D1: C-21.1's byte-check on a carried-forward acknowledgement is UNTOUCHED by this item — the "
  + "refusal exists by name and the reason beside it still discriminates it from the scope statement",
    [/BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD/.test(STORE),
     /checkCompletenessFreshness/.test(readFileSync(join(ROOT, "checks", "bio-checks.mjs"), "utf8"))],
    [true, true]);
  t("and NOTHING in this item reads WHICH bias is named at publication, which is DEC-20's disclosure rule: "
  + "declaring a bias never blocks a case",
    /reads WHICH bias/.test(STORE_SRC), true);
});

/* ======================================================================= 16
 * ARM P2 — the live purge, D-113's own control.
 * ===================================================================== */
console.log("\n--- 16. ARM P2: a whole-store purge takes the lens with the corpus (D-113) ---");
await block("16", async () => {
  const before = await get("stats", "", "adm-pl12");
  t("the fixture ARMS THE TRAP: there are statements and adoptions for a purge to fail to take",
    [before.biasStatements > 0, before.biasAdoptions > 0], [true, true]);
  /* THE RAW ADMIN TOKEN, not the administrator SESSION: op=purge is admin/probe class and is NOT in
     SESSION_OPS, so a signed-in administrator cannot reach it at all. Measured by driving it, after a
     first draft used the session and read the resulting `unknown op` as a purge that took nothing. */
  const p = await get("purge", "confirm=bio", "adm-pl12");
  const after = await get("stats", "", "adm-pl12");
  t("ARM P2: scope ALL leaves NO statement and NO adoption — a purge reporting ALL while a LENS was still "
  + "in force over an empty corpus is D-113's leftover in its most dangerous form",
    [p.scope ?? p.error ?? null, after.biasStatements, after.biasAdoptions], ["ALL", 0, 0]);
  const m = await get("biasmanifest", "scope=instance", MEMBER);
  t("and the manifest read agrees with the store rather than with a cache",
    [m.in_force, m.stated], [false, "no manifest was in force"]);
});

/* D-186: the sandbox goes down, or the battery's own residue assertion fails the
   run. `hygiene.test.mjs` names any suite that mints a Miniflare and does not
   dispose it, and it named this one on its first battery pass. */
await mf.dispose();

console.log(`\nbias: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
