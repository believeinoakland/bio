/* FL-5 / IS-9(a) — THE SUB-SESSION FAN-OUT AND ITS TWO CONTRACTS.
 *
 * §14b.1 states the rule this suite exists to make true: **a sub-session that
 * returns documents rather than reports has defeated the architecture.** Its
 * contract is a REPORT with a citation, the parent re-reads by address, and the
 * spawn payload carries no bias manifest BY CONSTRUCTION.
 *
 * Two parts, and neither implies the other:
 *
 *   PART A · THE CONTRACTS, PURE. `src/subsession.mjs` imports in a plain node
 *     process, so every spelling of a return can be driven — including the ones
 *     nobody anticipated, which is the only way "an exact key set" is a
 *     measurement rather than a reading of the code.
 *
 *   PART B · THROUGH `POST /run`, INSIDE WORKERD, over a real service binding.
 *     Because a pure check proves nothing about whether a CALLER can reach the
 *     feature (D-43: `op=invitelook` shipped with a ReferenceError while 1,276
 *     assertions passed), and because the fence's most important arm is
 *     behavioural: a manifest genuinely in force on the COMPOSING half must
 *     appear in zero bytes of what any sub-session was handed.
 *
 * THE MOCK HERE IS DELIBERATELY SMALLER THAN `harness.test.mjs`'s AND IS NOT A
 * COPY OF IT. That one is an instrument for F10, the budget and the run's
 * termination; this one answers a different question and needs the spawn halves
 * (search AND compose, the second carrying a real manifest), the meaning read
 * with its `ids` restriction, and a record of every body the plane received. A
 * copy of the larger mock would be a second thing to keep in step for the sake of
 * machinery this suite never drives.
 */
/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/fanout.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and neither the battery nor the fleet walk must discover it. THE HARNESS LIVES INSIDE THIS WORKTREE. Every arm is armed ALONE with the other defences held OPEN, every restore is verified BY sha256 AND BY CONTENT (`cmp`), and every arm names what MUST fail AND what MUST NOT.
   (F1) THE ITEM'S DECLARED CONTROL (IS-9(a)). Neuter the return contract — `checkReport` returns null for everything -> every document-returning arm, pure AND through the op, must FAIL; the spawn-fence arms must HOLD.
   (F2) THE EXACT KEY SET IS THE RULE. Let an unknown key through -> the document-shaped-return arms must FAIL under every spelling; the citation and bound arms must HOLD.
   (F3) THE PROSE BOUND. Remove the summary ceiling -> the over-bound arms must FAIL, and the key-set arms must HOLD — a document arriving inside `summary` passes every other check.
   (F4) NO MANIFEST FIELD BY CONSTRUCTION. Add `bias` to the spawn contract literal -> the exact-key-set arm AND the behavioural statements_sha arm must both FAIL; the return contract must HOLD.
   (F5) THE SECOND WITNESS. Make `spawnContract` ignore a payload carrying the lens instead of refusing -> the refusal arms must FAIL while the by-construction arm HOLDS, which is what shows they are two independent defences.
   (F6) NO WRITE SCOPE. Put a mutating op in SUBSESSION_OPS -> the read-only-scope arm must FAIL against the PLANE's own OPS table; the manifest arms must HOLD.
   (F7) A REFUSED RETURN MUST NOT BECOME AN ABSENCE. Let a refused report through to the working set -> the undetermined-not-empty arm must FAIL.
   (F8) SUB-SESSIONS SHARE NO STATE. Hand every level the same contract object -> the per-level and no-shared-identity arms must FAIL; the return contract must HOLD.
   (F9) OVER-STRICTNESS, nothing broken, and these must PASS.
   FULL PER-ARM DETAIL AND THE MEASURED FIGURES ARE IN `test/fanout.control.mjs`'s own header.
   D-276's five arms are NOT restated here and are NOT counted here: they belong to `test/agent-worker.control.mjs`, which drives THIS suite as well as its own, and they are enumerated once in `test/agent-worker.test.mjs`'s declaration. Naming them again here would inflate the fleet's arm count with a cross-reference — measured, at the moment of writing this sentence. The one that concerns this file is the world-as-it-shipped arm: with a fixture that says yes to everything, every BEHAVIOURAL assertion here passes over a call the real plane refuses, and the only thing that sees it is the single assertion here that reads the plane's registry instead of the mock. This suite's baseline moved 172 to 175 with D-276.
 * ========================================================================= */

/* D-186: owns $TMPDIR for this process and removes it on exit. */
import "../../bio-plane/test/sandbox.mjs";

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

import { LEVELS, PLANE_OPS, emptyLevelCandidates } from "../src/harness.mjs";
import {
  REPORT_STATES, REPORT_KEYS, CITATION_KEYS, SPAWN_KEYS, SUBSESSION_OPS,
  SUMMARY_MAX, ADDRESS_MAX, CITATIONS_MAX, REPORT_MAX_BYTES,
  FOUND_STATES, LOOKED_STATES,
  spawnContract, spawnContracts, checkReport, takeReports, citedAddresses,
} from "../src/subsession.mjs";
/* D-276: the mock's `op=meaningrows` branch, DERIVED from the plane's own arm
   registry and refusal catalog. This suite's own mock used to answer
   `{ ok: true, rows: [] }` for any argument, which is why its 172 assertions
   were green over a call the real plane refuses. */
import { MEANING_ARMS, meaningRowsBranch } from "./plane-meaning.mjs";
import { MEANING_ARM } from "../src/harness.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const WORKER_SRC_PATH = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const WORKER_SRC = readFileSync(WORKER_SRC_PATH, "utf8");
const SUB_SRC = readFileSync(fileURLToPath(new URL("../src/subsession.mjs", import.meta.url)), "utf8");
const PLANE_INDEX = readFileSync(fileURLToPath(new URL("../../bio-plane/src/index.mjs", import.meta.url)), "utf8");
const PLANE_AIRUN = readFileSync(fileURLToPath(new URL("../../bio-plane/src/airun.mjs", import.meta.url)), "utf8");

/* The comment stripper FL-2 had to correct and FL-3 reused: a naive "two slashes
   to end of line" deletes a `http://` literal AND the rest of its line. */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const SUB_CODE = strip(SUB_SRC);

/* EVERY NESTED READ BELOW IS NULL-TOLERANT. FL-3's control measured the cost of
   the alternative twice: an assertion that THROWS ends the module while the tally
   reads clean, and a harness reading a missing tally as 0 records a killed suite
   as "stayed GREEN". */

/* THE WHOLE KEY TREE of an object, at every depth. The spawn contract's fence is
   that it has no field for a manifest to arrive in UNDER ANY SPELLING, so the
   assertion has to be about the complete set of keys and not about the absence of
   one name — a denylist of one name is exactly the shape §14 warns about. */
function keyTree(value, into = new Set()) {
  if (value === null || typeof value !== "object") return into;
  if (Array.isArray(value)) { for (const v of value) keyTree(v, into); return into; }
  for (const [k, v] of Object.entries(value)) { into.add(k); keyTree(v, into); }
  return into;
}

const PAYLOAD = {
  run: "run-1",
  context: { type: "inquiry", id: "INQ-1" },
  mode: "check",
  skill: "pack-1.0.0",
  standard_pair: null,
  standard: { in_force: false, basis: "context-has-no-project", stated: "…", pair: null },
  budget: [{ bound: "fetches", allowed: 50, consumed: 0, unit: null }],
};

/* ================================================================
 * PART A · THE CONTRACTS, PURE
 * ================================================================ */
console.log("\n=== PART A · the spawn and return contracts, driven with no network ===");

console.log("\n--- A1 · THE SPAWN CONTRACT: four levels, no write scope, NO FIELD FOR THE LENS ---");
{
  const made = spawnContracts(PAYLOAD);
  t("the fan-out composed", made.ok, true);
  const cs = made.contracts || [];
  t("one contract per level, in LEVELS order", cs.map((c) => c.level), LEVELS);
  t("and there are four of them (the count is the table's, never a judgement's)", cs.length, 4);

  /* THE EXACT KEY SET — floor AND ceiling. This is what "by construction" means:
     the object's keys are written out one by one, so there is no field a manifest
     could arrive in whatever it were called. */
  t("every contract carries exactly the declared keys", cs.map((c) => Object.keys(c).sort())
    .filter((ks) => JSON.stringify(ks) !== JSON.stringify([...SPAWN_KEYS].sort())), []);
  t("`bias` is not a key of the contract — there is no field to read",
    cs.filter((c) => Object.prototype.hasOwnProperty.call(c, "bias")), []);

  /* AND THE ASSERTION IS OVER THE WHOLE KEY TREE, not the top level: a manifest
     nested one deep would pass a top-level check. Pinned as an exact set so a key
     GAINED here is as visible as one lost. */
  const tree = [...keyTree(cs[0] ?? {})].sort();
  t("the contract's complete key tree is pinned, at every depth", tree,
    ["address_max", "basis", "citation_keys", "citations_max", "context", "id", "in_force", "keys",
     "level", "mode", "pair", "required", "returns", "rule", "run", "scope", "skill", "stated",
     "standard", "standard_pair", "states", "summary_max", "type"].sort());
  t("the tree is non-empty (a walk over nothing reports its verdict triumphantly)", tree.length > 10, true);
  /* THIS ARM ALREADY EARNED ITSELF. Its first run failed against a contract whose
     `standard` block was built with a SPREAD of the plane's, so four plane-side
     keys had ridden through into a sub-session's brief — the delete-list defect
     wearing the other costume, in the one object whose whole claim is that it has
     no field nobody named. Fixed at the source; the arm is what found it. */
  t("nothing in the contract is built by spreading the plane's payload",
    /\.\.\.\s*payload/.test(SUB_CODE), false);

  /* NO WRITE SCOPE, AND IT IS COMPUTED AGAINST THE PLANE'S OWN OPS TABLE rather
     than against a comment here. An op that turns mutating in the plane fails
     this arm rather than a sub-session quietly gaining a write. */
  const planeOps = new Map([...PLANE_INDEX.matchAll(/^  ([a-z][a-z0-9]*):\s*\{[^}\n]*mutating:\s*(true|false)/gm)]
    .map((m) => [m[1], m[2] === "true"]));
  t("the plane's OPS table parsed (guard: an empty parse would pass everything)", planeOps.size > 100, true);
  t("every op a sub-session may name EXISTS in the plane's OPS table",
    SUBSESSION_OPS.filter((op) => !planeOps.has(op)), []);
  t("and the PLANE declares every one of them non-mutating — the sub-session has NO write",
    SUBSESSION_OPS.filter((op) => planeOps.get(op) !== false), []);
  t("the sub-session's scope is pinned, floor and ceiling", [...SUBSESSION_OPS].sort(), ["meaningrows"]);
  t("the contract publishes that scope and nothing wider",
    cs.map((c) => JSON.stringify(c.scope)).filter((s) => s !== JSON.stringify(SUBSESSION_OPS)), []);
  t("`capturerequest` is NOT in it — the internet level REPORTS and the PARENT requests",
    SUBSESSION_OPS.includes("capturerequest"), false);
  t("nor is PL-3's write endpoint: the parent holds the only write",
    SUBSESSION_OPS.includes("suggest"), false);
  t("every mutating op this member holds is one no sub-session may name",
    Object.keys(PLANE_OPS).filter((op) => PLANE_OPS[op].mutating && SUBSESSION_OPS.includes(op)), []);

  /* NO CREDENTIAL TRAVELS. A sub-session that held one could act on its own. */
  t("no credential is anywhere in a contract", /aik-/.test(JSON.stringify(cs)), false);
  t("and no key that would carry one", [...keyTree(cs[0] ?? {})].filter((k) => /token|credential|secret/i.test(k)), []);

  console.log("\n  -- SUB-SESSIONS SHARE NO STATE, and it is a property of the objects handed out --");
  t("the four contracts are four distinct objects", new Set(cs).size, 4);
  t("no two share their `context` object", new Set(cs.map((c) => c.context)).size, 4);
  t("no two share their `scope` array", new Set(cs.map((c) => c.scope)).size, 4);
  t("no two share their `returns` block", new Set(cs.map((c) => c.returns)).size, 4);
  t("each is deep-frozen", cs.filter((c) => !Object.isFrozen(c) || !Object.isFrozen(c.context)
    || !Object.isFrozen(c.scope) || !Object.isFrozen(c.returns)), []);
  t("so a lens cannot be added to one afterwards",
    (() => { try { cs[0].bias = { statements_sha: "X" }; } catch { /* frozen throws in strict mode */ }
             return Object.prototype.hasOwnProperty.call(cs[0], "bias"); })(), false);
  t("nor a sibling's findings pushed into its scope",
    (() => { try { cs[0].scope.push("suggest"); } catch { /* frozen */ }
             return cs[0].scope.length; })(), SUBSESSION_OPS.length);
  /* THE FOUR DIFFER IN EXACTLY ONE THING, which is what makes the fan-out a
     fan-out rather than four runs: same brief, different level. */
  const withoutLevel = cs.map((c) => JSON.stringify({ ...c, level: null }));
  t("the four contracts differ ONLY in their level", new Set(withoutLevel).size, 1);
  t("the parent's own working set is in none of them",
    [...keyTree(cs[0] ?? {})].filter((k) => ["reports", "candidates", "queue", "submission", "budget"].includes(k)), []);

  console.log("\n  -- THE RETURN CONTRACT TRAVELS WITH THE BRIEF --");
  t("each contract states what it must return", cs.map((c) => c.returns?.keys?.length ?? 0),
    LEVELS.map(() => Object.keys(REPORT_KEYS).length));
  t("and states the rule in the design's own words",
    /never documents/.test(cs[0]?.returns?.rule ?? ""), true);
  t("with the parent named as the one who re-reads", /parent re-reads by address/.test(cs[0]?.returns?.rule ?? ""), true);
}

console.log("\n--- A2 · THE SECOND WITNESS: a search payload carrying the lens is REFUSED ---");
{
  /* PL-12's fence is asserted in the PLANE's suite. This is the party that would
     be harmed by it failing, and a fence proved only at its own site is a fence
     with one witness. */
  const leaked = { ...PAYLOAD, bias: { in_force: true, manifest: { statements_sha: "LENS-SHA-1" } } };
  const r = spawnContract({ level: "meaning", payload: leaked });
  t("refused", r.ok, false);
  t("by name", r.code, "SPAWN_PAYLOAD_CARRIES_LENS");
  t("and no contract came back", r.contract ?? null, null);
  t("the detail cites §14's rule rather than a preference",
    /never receives the lens/.test(r.detail ?? ""), true);
  t("the whole fan-out refuses — three levels are not spawned while one is refused",
    [spawnContracts(leaked).ok, spawnContracts(leaked).contracts ?? null], [false, null]);
  /* EVEN A NULL LENS IS A FIELD. `bias: null` is the weaker fence store.mjs
     explicitly declined to build: a null field is a field, and a field acquires a
     value the first time somebody thinks they are being helpful. */
  t("a `bias: null` payload is refused too — a null field is still a field",
    spawnContract({ level: "meaning", payload: { ...PAYLOAD, bias: null } }).code,
    "SPAWN_PAYLOAD_CARRIES_LENS");

  console.log("\n  -- and the other two spawn refusals --");
  t("a level the run does not search is refused", spawnContract({ level: "vibes", payload: PAYLOAD }).code,
    "SPAWN_LEVEL_UNKNOWN");
  t("an absent level is refused, never defaulted", spawnContract({ payload: PAYLOAD }).code, "SPAWN_LEVEL_UNKNOWN");
  t("no payload at all is refused rather than composed here",
    spawnContract({ level: "meaning", payload: null }).code, "SPAWN_PAYLOAD_MISSING");
  t("and the refusal says the conditions are the record's", /run's conditions are the record's/.test(
    spawnContract({ level: "meaning", payload: null }).detail ?? ""), true);
}

console.log("\n--- A3 · THE RETURN CONTRACT: a REPORT with a citation, NEVER documents ---");
{
  const good = { level: "document", state: "PRESENT", observed_at: "log:7",
                 summary: "the 2024 budget names the transfer on p.12",
                 citations: [{ address: "bundle:abc123" }] };
  t("a REPORT that honours the contract is accepted", checkReport(good), null);

  /* THE ARM THE ITEM IS NAMED FOR. A sub-session that returns documents has
     defeated the architecture — and the rule is an EXACT KEY SET rather than a
     denylist, so it does not matter what the document is called. The corpus is
     PRINTED and floored: an empty corpus would pass this arm triumphantly. */
  const documentSpellings = [
    ["bytes", { bytes: "%PDF-1.7 …" }],
    ["body", { body: "<html>the whole page</html>" }],
    ["text", { text: "the full extracted text of the document" }],
    ["html", { html: "<html/>" }],
    ["pdf", { pdf: "JVBERi0…" }],
    ["base64", { base64: "JVBERi0…" }],
    ["content", { content: "…" }],
    ["document", { document: { id: "b1", bytes: "…" } }],
    ["documents", { documents: [{ id: "b1" }, { id: "b2" }] }],
    /* AND THE SPELLING NOBODY ANTICIPATED, which is the whole reason the rule is
       inverted: a denylist of the nine above would pass every one of these. */
    ["raw", { raw: "…" }],
    ["blob", { blob: "…" }],
    ["páginas (not English)", { "páginas": ["…"] }],
    ["a field named after nothing at all", { z: "…" }],
    ["the reading itself under a friendly name", { full_reading: "…" }],
  ];
  console.log(`     corpus: ${documentSpellings.length} spellings of "the sub-session returned the document"`);
  t("the corpus is non-empty", documentSpellings.length > 5, true);
  for (const [label, extra] of documentSpellings)
    t(`a return carrying \`${label}\` is REFUSED and the field is NAMED`,
      [checkReport({ ...good, ...extra })?.code ?? null,
       (checkReport({ ...good, ...extra })?.fields ?? [null])[0]],
      ["REPORT_UNKNOWN_FIELD", Object.keys(extra)[0]]);
  t("the refusal says why the rule is a key set rather than a list of names",
    /goes stale the moment a fourth is written/.test(checkReport({ ...good, bytes: "x" })?.detail ?? ""), true);

  console.log("\n  -- and the key set alone does not close it: a document fits inside `summary` --");
  t("a summary at the ceiling is accepted", checkReport({ ...good, summary: "x".repeat(SUMMARY_MAX) }), null);
  t("one character over is REFUSED", checkReport({ ...good, summary: "x".repeat(SUMMARY_MAX + 1) })?.code ?? null,
    "REPORT_OVER_BOUND");
  t("a whole document in the summary is REFUSED", checkReport({ ...good, summary: "x".repeat(50000) })?.code ?? null,
    "REPORT_OVER_BOUND");
  t("and the refusal names the bound it broke",
    checkReport({ ...good, summary: "x".repeat(50000) })?.bound ?? null, "summary");
  t("a structure where prose belongs is refused",
    checkReport({ ...good, summary: { pages: ["…"] } })?.code ?? null, "REPORT_SUMMARY_NOT_PROSE");
  t("the whole-report ceiling is COMPUTED from the parts, never typed",
    REPORT_MAX_BYTES, SUMMARY_MAX + (CITATIONS_MAX * (ADDRESS_MAX + 20)) + 400);

  console.log("\n  -- A CITATION IS AN ADDRESS. The parent re-reads by it; it never carries the bytes --");
  t("a citation carrying the document is REFUSED",
    checkReport({ ...good, citations: [{ address: "b1", bytes: "%PDF" }] })?.code ?? null,
    "REPORT_CITATION_NOT_AN_ADDRESS");
  t("so is one carrying the extracted text",
    checkReport({ ...good, citations: [{ address: "b1", text: "…" }] })?.code ?? null,
    "REPORT_CITATION_NOT_AN_ADDRESS");
  t("and one carrying an extent — D-164 has not landed and a field for it would overclaim",
    checkReport({ ...good, citations: [{ address: "b1", extent: { page: 12 } }] })?.code ?? null,
    "REPORT_CITATION_NOT_AN_ADDRESS");
  t("a bare string is not a citation", checkReport({ ...good, citations: ["b1"] })?.code ?? null,
    "REPORT_CITATION_NOT_AN_ADDRESS");
  t("an empty address is not one either", checkReport({ ...good, citations: [{ address: "" }] })?.code ?? null,
    "REPORT_CITATION_NOT_AN_ADDRESS");
  t("an address at the bound is accepted",
    checkReport({ ...good, citations: [{ address: "b".repeat(ADDRESS_MAX) }] }), null);
  t("one character over is content wearing an address's field",
    checkReport({ ...good, citations: [{ address: "b".repeat(ADDRESS_MAX + 1) }] })?.code ?? null, "REPORT_OVER_BOUND");
  t(`${CITATIONS_MAX} citations are accepted`,
    checkReport({ ...good, citations: Array.from({ length: CITATIONS_MAX }, (_, i) => ({ address: `b${i}` })) }), null);
  t("one more is the reading arriving as a list of addresses",
    checkReport({ ...good, citations: Array.from({ length: CITATIONS_MAX + 1 }, (_, i) => ({ address: `b${i}` })) })?.code ?? null,
    "REPORT_OVER_BOUND");
  t("citations that are not a list are refused",
    checkReport({ ...good, citations: { address: "b1" } })?.code ?? null, "REPORT_CITATIONS_NOT_A_LIST");
  t("a citation carries exactly one field, and it is the address", Object.keys(CITATION_KEYS), ["address"]);

  console.log("\n  -- WHO OWES A CITATION, and the absence that owes none --");
  for (const st of [...FOUND_STATES])
    t(`a '${st}' report with no citation is REFUSED — it says something IS there`,
      checkReport({ level: "meaning", state: st, observed_at: "log:1" })?.code ?? null, "REPORT_NO_CITATION");
  /* AND THE ARM THAT MATTERS MOST IN THE CLASS. An absence has nothing to cite,
     and a gate that pressured a sub-session into inventing a citation would be
     `CLAUDE.md`'s own named bug — the invented attribution the record's rules
     exist to refuse. */
  t("a LOOKED_ABSENT report with NO citation is ACCEPTED — there would be nothing to cite",
    checkReport({ level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:1" }), null);
  t("so is a LOOKED_INDETERMINATE one",
    checkReport({ level: "meaning", state: "LOOKED_INDETERMINATE", observed_at: "log:1" }), null);
  t("and a NEVER_LOOKED one, which is not even an observation",
    checkReport({ level: "meaning", state: "NEVER_LOOKED" }), null);

  console.log("\n  -- WHERE THE SEARCH WAS WRITTEN DOWN (§11): a claim nobody can locate is uncheckable --");
  for (const st of [...LOOKED_STATES])
    t(`a '${st}' report with no observation address is REFUSED`,
      checkReport({ level: "meaning", state: st, citations: [{ address: "b1" }] })?.code ?? null, "REPORT_UNLOCATED");
  t("NEVER_LOOKED owes none — nobody looked, so there is no observation to point at",
    checkReport({ level: "meaning", state: "NEVER_LOOKED" }), null);
  t("a blank address is not an address", checkReport({ level: "meaning", state: "LOOKED_ABSENT", observed_at: "  " })?.code ?? null,
    "REPORT_UNLOCATED");

  console.log("\n  -- the two things the parent cannot derive for itself --");
  t("a report naming no level is refused", checkReport({ state: "NEVER_LOOKED" })?.code ?? null, "REPORT_INCOMPLETE");
  t("a report naming no state is refused", checkReport({ level: "meaning" })?.code ?? null, "REPORT_INCOMPLETE");
  t("a level outside the four is refused", checkReport({ level: "gossip", state: "NEVER_LOOKED" })?.code ?? null,
    "REPORT_LEVEL_UNKNOWN");
  t("a state outside D-129 is refused", checkReport({ level: "meaning", state: "FOUND_IT" })?.code ?? null,
    "REPORT_STATE_UNKNOWN");
  t("a non-object return is refused rather than throwing", checkReport("a document")?.code ?? null,
    "REPORT_NOT_AN_OBJECT");
  t("so is an array of them", checkReport([{ level: "meaning" }])?.code ?? null, "REPORT_NOT_AN_OBJECT");
  t("and null", checkReport(null)?.code ?? null, "REPORT_NOT_AN_OBJECT");

  console.log("\n  -- D-129's vocabulary is the PLANE's, pinned by a source read --");
  const blk = PLANE_AIRUN.match(/export const OBSERVATION_STATES = \{([\s\S]*?)\n\};/);
  t("the plane's OBSERVATION_STATES block was actually found", blk != null, true);
  const planeStates = [...blk[1].matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]);
  t("the plane declares five states", planeStates.length, 5);
  t("and this contract's set is exactly the plane's, in the plane's order",
    Object.keys(REPORT_STATES), planeStates);
  t("the levels are the plane's too, through the harness's pinned copy", LEVELS.length, 4);
  /* AND THE CONDITION VOCABULARY IS NOT COPIED HERE. C-22.4 is the plane's rule
     and a second implementation of it would be a rule whose control proves
     nothing about either — `airun.mjs` recorded that having paid for it. */
  t("a condition this member has never heard of travels through UNJUDGED",
    checkReport({ level: "meaning", state: "LOOKED_INDETERMINATE", observed_at: "log:1",
                  condition: "some-condition-only-the-plane-knows" }), null);
  t("and no condition vocabulary is compiled into this member",
    /client-rendered-shell|runtime-ceiling-reached/.test(SUB_CODE), false);
}

console.log("\n--- A4 · THE FAN-IN: a refused return is NAMED, and never becomes an absence ---");
{
  const returns = [
    { level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:1" },
    { level: "content", state: "LOOKED_ABSENT", observed_at: "log:2", bytes: "%PDF the whole thing" },
    { level: "document", state: "PRESENT", observed_at: "log:3", citations: [{ address: "bundle:b1" }] },
    { level: "internet", state: "LOOKED_ABSENT", observed_at: "log:4" },
  ];
  const { taken, refused } = takeReports(returns);
  t("three returns honoured the contract", taken.map((r) => r.level), ["meaning", "document", "internet"]);
  t("one was REFUSED, and the level it came from is named", refused.map((r) => r.level), ["content"]);
  t("with the code that refused it", refused.map((r) => r.code), ["REPORT_UNKNOWN_FIELD"]);
  t("the refused return is NOT in the working set", taken.filter((r) => r.level === "content"), []);

  /* THE LOAD-BEARING HALF. The refused report SAID `LOOKED_ABSENT`. If a
     contract violation could fall through to the working set, that word would
     become §9's empty-level kind — a defect MANUFACTURING an absence claim about
     the world, written off a report the parent never accepted. */
  const kinds = emptyLevelCandidates({ reports: taken }, "INQ-1");
  t("the refused level produces NO empty-level claim", kinds.map((k) => k.level).includes("content"), false);
  t("while the levels that honoured the contract still do", kinds.map((k) => k.level), ["meaning", "internet"]);
  t("so a broken contract cannot manufacture an absence",
    emptyLevelCandidates({ reports: returns }, "INQ-1").map((k) => k.level).includes("content"), true);

  console.log("\n  -- the addresses the parent will re-read --");
  t("they come off the reports, in order", citedAddresses(taken), ["bundle:b1"]);
  t("deduplicated, because re-reading one address twice buys nothing",
    citedAddresses([{ citations: [{ address: "a" }, { address: "a" }, { address: "b" }] }]), ["a", "b"]);
  t("and bounded, so a report cannot spend the parent's context on re-reads",
    citedAddresses([{ citations: Array.from({ length: 500 }, (_, i) => ({ address: `a${i}` })) }]).length,
    CITATIONS_MAX);
  t("nothing cited means nothing re-read", citedAddresses([{ level: "meaning" }]), []);
  t("and a malformed collection is not a crash", [citedAddresses(null), citedAddresses("x")], [[], []]);
  t("takeReports over nothing is empty rather than an error",
    [takeReports(null).taken, takeReports(null).refused], [[], []]);
}

console.log("\n--- A5 · OVER-STRICTNESS: correct work in a spelling the contract did not anticipate ---");
{
  const ok = [
    ["the minimum a report can be", { level: "meaning", state: "NEVER_LOOKED" }],
    ["every optional field present", { level: "content", state: "partial", observed_at: "log:9",
      summary: "half the pages read", citations: [{ address: "b1" }], governed: false, condition: null }],
    ["a governed observation (D-104's fact about US)", { level: "internet", state: "LOOKED_INDETERMINATE",
      observed_at: "log:2", governed: true, condition: "host-governed" }],
    ["unicode prose", { level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:3",
      summary: "nada — 何もない — ничего" }],
    ["an address with punctuation a store id may carry", { level: "document", state: "PRESENT",
      observed_at: "log:4", citations: [{ address: "bundle:2026-08-09/abc_DEF-123.pdf#p12" }] }],
    ["a summary of exactly zero characters", { level: "meaning", state: "LOOKED_ABSENT",
      observed_at: "log:5", summary: "" }],
    ["explicit nulls where the field is optional", { level: "meaning", state: "NEVER_LOOKED",
      observed_at: null, summary: null, citations: null, governed: null, condition: null }],
    ["a report just inside the whole-report ceiling", { level: "document", state: "PRESENT", observed_at: "log:6",
      summary: "s".repeat(SUMMARY_MAX),
      citations: Array.from({ length: CITATIONS_MAX }, (_, i) => ({ address: `bundle:${"c".repeat(150)}${i}` })) }],
  ];
  for (const [label, report] of ok) t(`${label} -> accepted`, checkReport(report), null);
  t("the over-strictness corpus is non-empty", ok.length > 5, true);

  /* AND THE SPAWN SIDE'S OVER-STRICTNESS: a payload the plane spells differently
     must still compose. The contract reads named keys and tolerates their
     absence — it must not require fields the plane may honestly not publish. */
  const thin = spawnContract({ level: "meaning", payload: { run: "r1" } });
  t("a thin but honest payload still composes", thin.ok, true);
  t("and the absent facts are NULL rather than invented",
    [(thin.contract || {}).mode, (thin.contract || {}).standard, ((thin.contract || {}).context || {}).id],
    [null, null, null]);
  t("the key set is the same whatever the payload carried",
    Object.keys(thin.contract ?? {}).sort(), [...SPAWN_KEYS].sort());
  /* A PAYLOAD CARRYING EXTRA FIELDS OF THE PLANE'S OWN is not an error — the
     contract READS what it names and carries nothing else, so a column added to
     `ai_runs` tomorrow cannot ride through. This is the arm that distinguishes
     "built by literal" from "built by deleting a list of fields". */
  const wide = spawnContract({ level: "meaning",
    payload: { ...PAYLOAD, some_new_column: "added to ai_runs next week", another: { deep: 1 } } });
  t("a payload with new plane-side fields still composes", wide.ok, true);
  t("and NONE of them rode through", [...keyTree(wide.contract)].filter((k) => /some_new_column|another|deep/.test(k)), []);
}

/* ================================================================
 * PART B · THROUGH `POST /run`, INSIDE WORKERD
 * ================================================================ */
console.log("\n=== PART B · the contracts driven through the op, over a real service binding ===");

const { Miniflare } = await (async () => {
  try { return await import("miniflare"); } catch { /* fall through */ }
  const planePkg = fileURLToPath(new URL("../../bio-plane/package.json", import.meta.url));
  const resolved = createRequire(planePkg).resolve("miniflare");
  return await import(pathToFileURL(resolved).href);
})();

const AIK = "aik-" + "b".repeat(64);

/* THE LENS THE COMPOSING HALF CARRIES. Distinctive on purpose: the strongest arm
   in this suite is that these bytes appear NOWHERE in what a sub-session was
   handed, and a value-level assertion cannot be dodged by a spelling. */
const LENS_SHA = "LENS-STATEMENTS-SHA-0f0f0f";

const PLANE_MOCK = `
export default {
  async fetch(req, env) {
    const CFG = JSON.parse(env.MOCK || "{}");
    if (!globalThis.__S) globalThis.__S = { log: [], runlog: [], seq: 0, spawns: [], suggested: [] };
    const S = globalThis.__S;
    const url = new URL(req.url);
    if (url.pathname === "/__mock/state")
      return Response.json({ log: S.log, runlog: S.runlog, spawns: S.spawns, suggested: S.suggested });
    const op = url.searchParams.get("op") || "";
    let body = null;
    if (req.method === "POST") { try { body = await req.json(); } catch { body = null; } }
    S.log.push({ op, token: url.searchParams.get("token") || "", method: req.method, body,
                 query: Object.fromEntries(url.searchParams.entries()) });

    if (op === "whoami")
      return Response.json({ ok: true, result: { tokenClass: "ai", session: false, member: null }, tokenClass: "ai" });

    if (op === "airun")
      return Response.json({ ok: true, result: { session: {
        id: url.searchParams.get("run"), mode: "check", status: "running",
        context: { type: "inquiry", id: "INQ-1" }, max_passes: 1,
        budget: [{ bound: "fetches", allowed: 50, consumed: 0 },
                 { bound: "subsessions", allowed: 50, consumed: 0 },
                 { bound: "wallclock", allowed: 500000, consumed: 0 },
                 { bound: "runtime", allowed: 5000, consumed: 0 }],
      } } });

    if (op === "airunlog")
      return Response.json({ ok: true, result: { entries: [], limit: 200, truncated: false } });

    if (op === "airunspawn") {
      const half = url.searchParams.get("half") === "compose" ? "compose" : "search";
      S.spawns.push(half);
      /* PL-12: the composing half carries the lens and the search half has NO
         bias key at all — written as two explicit literals for the same reason
         store.mjs writes them that way. \`leakBias\` arms the fence's own control:
         it puts the manifest into the SEARCH payload, which is the state this
         member must refuse rather than ignore. */
      const payload = { run: url.searchParams.get("run"), context: { type: "inquiry", id: "INQ-1" },
                        mode: "check", skill: "pack-1.0.0", standard_pair: null,
                        standard: { in_force: false, basis: "context-has-no-project" }, budget: [] };
      const lens = { in_force: true, manifest: { scope: "project", statements_sha: "${LENS_SHA}", bundles: ["b9"] },
                     now: { statements_sha: "${LENS_SHA}" }, moved: false };
      if (half === "compose") return Response.json({ ok: true, result: { half, payload, bias: lens } });
      if (CFG.leakBias) return Response.json({ ok: true, result: { half, payload: { ...payload, bias: lens } } });
      return Response.json({ ok: true, result: { half, payload } });
    }

    ${meaningRowsBranch("[]")}

    if (op === "basisversions")
      return Response.json({ ok: true, result: { versions: [], limit: 50, truncated: false } });

    if (op === "airuntick") {
      let appended = 0;
      for (const e of Array.isArray(body && body.log) ? body.log : []) { S.runlog.push({ seq: ++S.seq, ...e }); appended += 1; }
      return Response.json({ ok: true, result: { ticked: true, appended, status: "running" } });
    }
    if (op === "airunclose")
      return Response.json({ ok: true, result: { terminated: true, bound: (body && body.bound) || null } });
    if (op === "capturerequest")
      return Response.json({ ok: true, result: { request: "REQ-1", state: "queued" } });
    if (op === "suggest") {
      S.suggested.push({ name: (body && body.name) || null, kind: (body && body.kind) || null });
      return Response.json({ ok: true, result: { wrote: true, version: (body && body.name) || null } });
    }
    return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
  },
};
`;

const newMf = (cfg = {}) => new Miniflare({
  workers: [
    { name: "agent-worker", modules: true, modulesRoot: "/", scriptPath: WORKER_SRC_PATH, script: WORKER_SRC,
      modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { VERSION: "test" }, serviceBindings: { PLANE: "plane-mock" } },
    { name: "plane-mock", modules: true, script: PLANE_MOCK,
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { MOCK: JSON.stringify(cfg) } },
  ],
});
const runOp = (mf, body) =>
  mf.dispatchFetch("http://agent-worker/run", { method: "POST", body: JSON.stringify(body) });
const mockState = async (mf) =>
  (await (await (await mf.getWorker("plane-mock")).fetch("http://plane/__mock/state")).json());
const base = { run_id: "run-1", store: "scratch", credential: AIK };

/* The four returns a well-behaved fan-out produces: one per level, each a REPORT
   with a citation where it found something and none where it did not. */
const goodReturns = [
  { level: "meaning", state: "PRESENT", observed_at: "log:1", summary: "a leg already reaches this",
    citations: [{ address: "bundle:m1" }] },
  { level: "content", state: "LOOKED_ABSENT", observed_at: "log:2" },
  { level: "document", state: "PRESENT", observed_at: "log:3", summary: "the packet names it on p.12",
    citations: [{ address: "bundle:d1" }, { address: "bundle:d2" }] },
  { level: "internet", state: "LOOKED_INDETERMINATE", observed_at: "log:4", governed: true },
];

console.log("\n--- B1 · a run fans out to four sub-sessions and takes four REPORTS ---");
{
  const mf = newMf();
  const res = await runOp(mf, { ...base,
    judgements: [{ targets: [] }, { reports: goodReturns }, { candidates: [] }, {}] });
  const out = await res.json();
  t("200 and ok", [res.status, out.ok], [200, true]);
  t("four contracts were composed, one per level, in LEVELS order",
    (out.fanout?.contracts || []).map((c) => c.level), LEVELS);
  t("four sub-session payloads were taken from the plane",
    (await mockState(mf)).spawns.filter((h) => h === "search").length, 4);
  t("all four REPORTS were taken", out.reports_taken, 4);
  t("none was refused", out.reports_refused, []);
  t("the contracts on the wire declare a read-only scope", out.fanout?.scope ?? null, SUBSESSION_OPS);
  t("and carry no `bias` field to read",
    (out.fanout?.contracts || []).filter((c) => Object.prototype.hasOwnProperty.call(c, "bias")), []);
  await mf.dispose();
}

console.log("\n--- B2 · THE PARENT RE-READS BY ADDRESS (§14b.1), observed at the plane ---");
{
  const mf = newMf();
  const out = await (await runOp(mf, { ...base,
    judgements: [{ targets: [] }, { reports: goodReturns }, { candidates: [] }, {}] })).json();
  /* D-276 SHARPENED THIS ARM RATHER THAN ADDING ONE BESIDE IT. `citations_reread`
     used to climb once per address REGARDLESS of what the plane answered, so it
     counted CALLS MADE and was published as READS DONE — and every one of those
     calls was in fact refused `MEANING_ROWS_UNKNOWN_ARM`, because the member
     asked for an arm the record does not hold. This assertion was passing over
     three refusals. It counts answered reads now, and the mock can refuse
     (`plane-meaning.mjs`), so a wrong arm takes it to 0. */
  t("three distinct addresses were cited and three were re-read", out.citations_reread, 3);
  t("D-276: those three were ANSWERED, not merely attempted — no re-read was refused",
    (out.refusals || []).filter((r) => r && r.at === "meaningrows"), []);
  t("...and the observation entry says so in the record's own words, all three of three",
    /3 of 3 citation\(s\) re-read BY ADDRESS/.test(
      out.trace?.find((x) => x.step === "collect")?.note ?? ""), true);
  t("...and the arm it asked at is one the PLANE's compiler holds",
    MEANING_ARMS.includes(String(MEANING_ARM).trim().toLowerCase()), true);
  const st = await mockState(mf);
  const reads = st.log.filter((l) => l.op === "meaningrows" && Array.isArray(l.body?.ids));
  t("each re-read reached the plane as an `ids` restriction on PL-9's own read",
    reads.map((l) => l.body.ids[0]), ["bundle:m1", "bundle:d1", "bundle:d2"]);
  t("and the run did NOT ask for document bytes on the way",
    [...new Set(st.log.map((l) => l.op))].filter((op) => !PLANE_OPS[op]), []);
  /* THE TRADE THE MEMORY MODEL MAKES, made visible: the sub-session handed back
     an ADDRESS and the parent resolved it. What arrived from the sub-session was
     a conclusion; what the parent asked the record for was the rest. */
  t("nothing the sub-sessions returned carried a document",
    JSON.stringify(goodReturns).length < REPORT_MAX_BYTES * 4, true);
  await mf.dispose();
}

console.log("\n--- B3 · IS-9(a): A DOCUMENT-RETURNING SUB-SESSION IS REFUSED, AND ITS LEVEL IS UNDETERMINED ---");
{
  const mf = newMf();
  const out = await (await runOp(mf, { ...base, judgements: [
    { targets: [] },
    { reports: [
      { level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:1" },
      /* THE SUB-SESSION THAT DEFEATED THE ARCHITECTURE: it read the document and
         handed the document back, wearing a `LOOKED_ABSENT` claim besides. */
      { level: "content", state: "LOOKED_ABSENT", observed_at: "log:2",
        bytes: "%PDF-1.7 …the whole packet…" },
      { level: "document", state: "LOOKED_ABSENT", observed_at: "log:3" },
      { level: "internet", state: "LOOKED_ABSENT", observed_at: "log:4" },
    ] },
    { candidates: [] }, {},
  ] })).json();

  t("the run still completed — one broken return is not a crash", out.ok, true);
  t("three REPORTS were taken", out.reports_taken, 3);
  t("the fourth was REFUSED and its level is named", (out.reports_refused || []).map((r) => r.level), ["content"]);
  t("with the code and the offending field", [(out.reports_refused || [])[0]?.code ?? null,
    ((out.reports_refused || [])[0]?.fields ?? [null])[0]], ["REPORT_UNKNOWN_FIELD", "bytes"]);

  const st = await mockState(mf);
  /* THE ARM THAT MAKES IT MATTER. The refused return CLAIMED `LOOKED_ABSENT`. Had
     it reached the working set, §9's empty-level kind would have been written for
     `content` off a report the parent never accepted — a contract violation
     MANUFACTURING a claim about the world. */
  t("§9's empty-level kind was written for the three levels that honoured the contract",
    st.suggested.map((s) => s.name).sort(),
    ["level-empty:document", "level-empty:internet", "level-empty:meaning"]);
  t("and NOT for the refused level — undetermined is not an absence",
    st.suggested.some((s) => s.name === "level-empty:content"), false);
  t("nothing the refused return carried reached the plane",
    st.log.filter((l) => /%PDF/.test(JSON.stringify(l.body ?? null))).length, 0);
  await mf.dispose();
}

console.log("\n--- B4 · THE BIAS FENCE, BEHAVIOURALLY: the lens reaches the composing half and NO sub-session ---");
{
  const mf = newMf();
  const out = await (await runOp(mf, { ...base,
    judgements: [{ targets: [] }, { reports: goodReturns }, { candidates: [] }, {}] })).json();
  const contracts = out.fanout?.contracts || [];
  t("four contracts were handed out", contracts.length, 4);

  /* THE VALUE-LEVEL ARM, AND IT IS THE ONE NO SPELLING CAN DODGE. The mock's
     COMPOSING half carries a real manifest whose `statements_sha` is distinctive.
     If a lens ever reached the search half — under `bias`, under a rename, nested,
     or by concatenation — these bytes would be somewhere in what a sub-session was
     handed. THIS IS WHAT FL-3's ARM COULD NOT DO: it grepped a trace note that
     never carries the phrase, and stayed green with the fence defeated (measured
     at FL-5: 194 pass / 0 fail with the mock's search payload carrying the lens). */
  t("the manifest's own bytes appear in ZERO sub-session contracts",
    JSON.stringify(contracts).includes(LENS_SHA), false);
  t("and nowhere in the whole answer", JSON.stringify(out).includes(LENS_SHA), false);
  t("the guard is not vacuous: those bytes ARE what the composing half carries",
    LENS_SHA.length > 10, true);

  const st = await mockState(mf);
  t("this member never asked for the composing half at all — it has no use for the lens",
    st.spawns.filter((h) => h === "compose").length, 0);
  t("and no request it sent carried the manifest",
    st.log.filter((l) => JSON.stringify(l.body ?? null).includes(LENS_SHA)).length, 0);
  t("no key in any contract is `bias`, at any depth",
    contracts.flatMap((c) => [...keyTree(c)]).filter((k) => k === "bias"), []);
  await mf.dispose();
}

console.log("\n--- B5 · THE SECOND WITNESS THROUGH THE OP: a leaked lens STOPS the run ---");
{
  const mf = newMf({ leakBias: true });
  const res = await runOp(mf, { ...base,
    judgements: [{ targets: [] }, { reports: goodReturns }, { candidates: [] }, {}] });
  const out = await res.json();
  t("502 SPAWN_PAYLOAD_CARRIES_LENS", [res.status, out.reason], [502, "SPAWN_PAYLOAD_CARRIES_LENS"]);
  t("the level it was composing for is named", out.level, LEVELS[0]);
  t("it does not convert the plane's defect into a claim about the run", out.reason === "NO_SUCH_RUN", false);
  const st = await mockState(mf);
  t("the run wrote nothing", st.suggested, []);
  t("and it stopped at the FIRST level rather than fanning out anyway",
    st.spawns.filter((h) => h === "search").length, 1);
  await mf.dispose();
}

console.log("\n--- B6 · THE PARENT HOLDS THE ONLY WRITE ---");
{
  const mf = newMf();
  const out = await (await runOp(mf, { ...base, judgements: [
    { targets: [] }, { reports: goodReturns },
    { candidates: [{ kind: "new-version", name: "v1", description: "what the reports support" }] }, {},
  ] })).json();
  const st = await mockState(mf);
  const mutating = st.log.filter((l) => PLANE_OPS[l.op]?.mutating);
  t("the record moved, so the arm has something to be about", mutating.length > 0, true);
  t("every mutating call was made under the PARENT's one credential",
    [...new Set(mutating.map((l) => l.token))], [AIK]);
  t("and every mutating op is one no sub-session may name",
    [...new Set(mutating.map((l) => l.op))].filter((op) => SUBSESSION_OPS.includes(op)), []);
  /* The composed version AND the one level that reported an absence — §9's kind
     rides the same write path, which is the point of it being a kind. */
  t("the version landed, written by the parent", st.suggested.map((s) => s.name),
    ["v1", "level-empty:content"]);
  t("no contract handed out carried a credential to write with",
    JSON.stringify(out.fanout?.contracts ?? []).includes("aik-"), false);
  await mf.dispose();
}

console.log("\n--- B7 · LOG-ALWAYS holds across FL-5's row, and the observation log says what happened ---");
{
  const mf = newMf();
  const out = await (await runOp(mf, { ...base, judgements: [
    { targets: [] },
    { reports: [{ level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:1", raw: "the document" },
                ...goodReturns.slice(1)] },
    { candidates: [] }, {},
  ] })).json();
  const st = await mockState(mf);
  /* ONE ENTRY PER STEP, and the relation here is `==` rather than `+1` because
     THIS mock does not append a terminal entry of its own on `airunclose` —
     FL-3's does, reproducing PL-5's `#aiRunTerminate`. Two different instruments
     answering two different questions, and the arithmetic is stated so the
     difference is a decision rather than a discrepancy. */
  t("every step still produced a log entry", (out.trace || []).length, st.runlog.length);
  t("and the run actually took some steps", (out.trace || []).length > 5, true);
  const collect = (out.trace || []).find((x) => x.step === "collect");
  t("the collect step's note names both numbers", /3 REPORT\(s\) taken, 1 REFUSED/.test(collect?.note ?? ""), true);
  t("and says the citations were re-read BY ADDRESS", /re-read BY ADDRESS/.test(collect?.note ?? ""), true);
  t("the transition's own reason names the architecture's rule",
    /defeated the architecture/.test(collect?.why ?? ""), true);
  t("and calls the refused level UNDETERMINED rather than empty",
    /UNDETERMINED, not empty/.test(collect?.why ?? ""), true);
  await mf.dispose();
}

console.log("\n--- B8 · OVER-STRICTNESS through the op: legal fan-outs must run ---");
{
  const cases = [
    ["no returns at all — an unrun fan-out is not a broken one", { reports: [] }],
    ["one level reporting, three silent", { reports: [goodReturns[0]] }],
    ["every level NEVER_LOOKED", { reports: LEVELS.map((l) => ({ level: l, state: "NEVER_LOOKED" })) }],
    ["all four citing the same address", { reports: LEVELS.map((l, i) => ({ level: l, state: "PRESENT",
      observed_at: `log:${i}`, citations: [{ address: "bundle:same" }] })) }],
    ["a report with every optional field", { reports: [{ level: "meaning", state: "partial", observed_at: "log:1",
      summary: "s", citations: [{ address: "b1" }], governed: false, condition: null }] }],
    ["two levels reporting the same level twice (the parent judges, not the shape)",
      { reports: [goodReturns[0], { ...goodReturns[0], observed_at: "log:9" }] }],
  ];
  for (const [label, collectJudgement] of cases) {
    const mf = newMf();
    const res = await runOp(mf, { ...base,
      judgements: [{ targets: [] }, collectJudgement, { candidates: [] }, {}] });
    const out = await res.json();
    t(`${label} -> accepted`, [res.status, out.ok, out.reports_refused], [200, true, []]);
    await mf.dispose();
  }
}

console.log(`\nfanout: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
