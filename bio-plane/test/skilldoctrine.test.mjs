/* NEGATIVE CONTROL: every arm below was RUN on 2026-08-10 by the SK-2 worker (worktree agent-ab0c5fdce6f2627dc) from `test/skilldoctrine.control.mjs`, which is committed beside this file so the next session re-runs them in one step instead of re-deriving how to break the subject. Every restore verified BY CONTENT as well as by sha256. Clean tree: 43 pass, 0 fail. Nine arms run, 0 wrong.
   (1) THE ROW'S OWN — MOVE LOOP TERMINATION INTO MODEL JUDGEMENT. Rewrite the what-to-search clause so it also decides when the loop stops and how many passes to run, and hand back neither deterministic row -> 41 pass, 2 FAIL: ARM C1 (the scan names the authority in the grant text) and ARM B2 (a left-column row no clause defers). **THE PLAN'S OWN REVIEW SAID THIS ROW'S NC WAS "a review criterion, not a runnable control" AND ASKED FOR A SOURCE-SCAN TO SHIP WITH SK-2. This is that criterion EXECUTED** — the same edit, made to the real source, measured rather than noticed.
   (2) THE SAME MOVE, THE QUIET DIRECTION — claim a judgement row the design's table never granted, and leave the prose clean -> 41 pass, 2 FAIL: ARM B1 and ARM B3, with C1 correctly ABSORBED. **Both directions are run because they fail differently and only the first is visible to a text scan**: authority arrives by claiming ground as often as by writing a number down, which is why both columns of §14b.4's table are parsed and compared.
   (3) THE TABLE IS THE AUTHORITY, NOT THIS FILE'S MEMORY OF IT. Move a row from the DESIGN DOCUMENT's deterministic column into its judgement column, doctrine untouched -> 41 pass, 2 FAIL: ARM A2 and ARM A3. The defect one altitude up — somebody edits the design rather than the skill — and the doctrine goes red for deferring what the design now says it decides.
   (4) THE FOUR ABSENCES MADE TO READ ALIKE. Give two levels the same words for what their emptiness means -> 41 pass, 2 FAIL: ARM E2 (pairwise distinctness) and ARM E3 (the fact is no longer where CLAUDE.md's chain puts it). Nothing throws and every level still states something, which is exactly why it needs an assertion: 'no document' and 'nothing extracted' collapsing is the loss of a FACT, not of a field.
   (5) THE ESCALATION CHAIN, REORDERED WHERE IT IS ACTUALLY HELD — swap two members of `OBSERVATION_LEVELS` in airun.mjs, doctrine untouched -> 42 pass, 1 FAIL: ARM E3 alone. **THIS ARM'S EXPECTATION WAS WRONG ON ITS FIRST RUN AND THE CORRECTION IS THE FINDING.** It named E1 too — and E1 compares the map's keys against `OBSERVATION_LEVELS`' keys while the map DERIVES them from that same object, so a reorder moves both sides together and **E1 is blind to it BY CONSTRUCTION**: the equality-that-costs-nothing shape, in this suite, found by running the control. ARM E3 — the four facts pinned to the order CLAUDE.md names them in — is the ONLY thing standing between a reorder in airun.mjs and a silently rewritten escalation chain.
   (6) THE CITATION THAT POINTS NOWHERE. Point a clause at a fence that does not exist -> 42 pass, 1 FAIL: ARM D2. A citation reads as a fence whether or not one is there, so a broken one is worse than none.
   (7) THE INSTRUMENT ITSELF. Neuter `controlFlowAuthority` so it matches nothing, doctrine untouched -> 41 pass, 2 FAIL: ARM C2 and ARM C3, while **ARM C1 passes VACUOUSLY over a scan that reads nothing** — the shape of every walk that has gone blind while reporting green, and the reason C1's silence is only worth something with C2/C3 beside it.
   (8) THE BIAS FENCE, BROKEN WHERE IT ACTUALLY LIVES. Give the SEARCH half the lens in `store.mjs aiRunSpawnPayload` -> 42 pass, 1 FAIL: ARM H1, with ARM H2 correctly ABSORBED — **the doctrine's bias clause is untouched and still SAYS the right thing while the coupling §14 forbids is live.** That asymmetry IS §14b.4: the sentence is worth nothing and the field is worth everything.
   (9) OVER-STRICTNESS, ARMED FROM THE OTHER SIDE. Widen the termination-decision pattern back to the shape it was FIRST written in (decide/judge + when|whether|how many, with no requirement that the object be control flow) -> 41 pass, 2 FAIL: ARM C4 and ARM C1, because it then flags the doctrine's own granted judgement — a row of the design's right-hand column. A scan that refuses the grant would make the next author phrase prose around the instrument, and C4 is what stops that. */
/* SK-2 — THE INVESTIGATIVE SKILL. THE SUITE.
 *
 * `IS-BUILD-PLAN.md` SK-2; `INVESTIGATIVE-SESSION.md` §5, §6, §9, §11, §14,
 * §14b.4; `CLAUDE.md`'s sparse-at-every-level section. The subject is
 * `src/skilldoctrine.mjs`, merged into SK-1's pack by `src/skillpack.mjs`.
 *
 * WHAT THIS SUITE IS FOR, IN ONE SENTENCE: **SK-2's row's accepts-when is "the
 * skill text contains no control-flow authority", and that has to be MEASURED
 * over the text rather than reviewed by eye.** The plan's own review of this row
 * said so — *"SK-2's NC is a review criterion, not a runnable control … a
 * source-scan over the skill text should ship with SK-2"* — so the scan and its
 * coverage arms are the deliverable here, and everything else supports them.
 *
 * THE SECOND HALF OF THE ACCEPTS-WHEN IS NOT CHECKABLE YET AND IS NOT PRETENDED
 * TO BE. The row also asks that *"a sampled run's descriptions name their
 * ungraded legs"*. There is no run to sample: FL-3's harness composes nothing
 * until VF-4 drives one live. The plan records this — *"uncheckable at authoring
 * time (W1) and becomes checkable at VF-4"* — and this suite therefore asserts
 * the DESCRIPTION STANDARD and the code that refuses a boilerplate one, and
 * makes no claim about any run's actual output. That gap is named in BLOCK G's
 * corpus line every time this suite runs, so it cannot quietly become a claim.
 *
 * FOUR RULES KEPT THROUGHOUT, each of which has cost this project real time:
 *
 *   - SETS ARE DRIVEN OR IMPORTED, NEVER TYPED. §14b.4's table is PARSED out of
 *     the design document; the levels, states, grade sources and C-numbers are
 *     imported; the doctrine's own quoted sentences are checked against the
 *     documents they were quoted from.
 *   - THE REAL PATH AND THE MUTATED PATH GO THROUGH ONE FUNCTION.
 *     `controlFlowAuthority`, the table parser and the citation resolver are
 *     each run on the real subject AND on a fixture that must trip them.
 *   - OVER-STRICTNESS IS TESTED IN-SUITE. A scan that flagged the design's own
 *     granted judgements would be worse than no scan, because the next author
 *     would phrase prose around the instrument. BLOCK C arm C4 is that control.
 *   - EVERY WALK PRINTS ITS CORPUS SIZE, and states what it cannot see.
 *
 * DRIVEN THROUGH THE CONTROL PLANE (D-43): `op=airunspawn` is reached with its
 * literal written out so `scripts/coverage.mjs` credits it — BLOCK H's proof
 * that the bias fence is CODE and this skill only cites it.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as CATALOGUE from "../checks/bio-checks.mjs";
import { SUGGEST_LEVELS, SUGGEST_CHECKS, MACHINE_FENCE_CHECKS, EARNED_GRADE_SOURCES,
         VERSION_STRENGTH_INERT_SOURCES, GRADE_SOURCES, BASIS_ROLES, GRADE_AXES,
         isBoilerplate, checkInquiryBasis } from "../checks/bio-checks.mjs";
import { OBSERVATION_LEVELS, OBSERVATION_STATES, DEFINITIVE_STATES, RUN_BOUNDS,
         RUN_ENDINGS, AI_RUN_CHECKS } from "../src/airun.mjs";
import { renderPack } from "../src/skillpack.mjs";
import { CLAUSES, DEFERRED_ROWS, JUDGED_ROWS, TABLE_SOURCE, FACTS_SOURCE,
         LOOP_TERMINATION_EVIDENCE, CONTROL_FLOW_AUTHORITY, controlFlowAuthority,
         absenceByLevel, reportsAs, LICENSES_A_CONCLUSION, LICENSES_NOTHING,
         COMPOSITION, DESCRIPTION_STANDARD, judgementLayers,
         JUDGEMENT_ID, JUDGEMENT_EDITION } from "../src/skilldoctrine.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const DOCTRINE_SRC = readFileSync(fileURLToPath(new URL("../src/skilldoctrine.mjs", import.meta.url)), "utf8");
const CHECKS_SRC = readFileSync(fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url)), "utf8");
const DOC = (rel) => readFileSync(fileURLToPath(new URL("../../" + rel, import.meta.url)), "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-sk2", MEMBER_TOKEN: "mem-sk2", PROBE_TOKEN: "prb-sk2",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());

const TOK = "mem-sk2";
const BUNDLE = "INQ-2026-0810-sk2-investigative-skill";
const SHA_A = "c".repeat(64);
const T0 = "2026-08-10T09:00:00Z";

/* ---------------------------------------------------------------------------
 *  THREE INSTRUMENTS, EACH RUN ON ITS REAL SUBJECT AND ON A FIXTURE THAT MUST
 *  TRIP IT. One function, two corpora — never a parallel implementation that
 *  agrees with the real one at zero cost.
 * ------------------------------------------------------------------------- */

/** Markdown normalised to one line, SK-1's normaliser, so a quoted doctrine
 *  sentence can be looked for in the document it was quoted from. */
function flatten(md) {
  return md.split("\n").map((l) => l.replace(/^[\s>]*[-*]?\s*/, "")).join(" ")
           .replace(/[*_`]/g, "").replace(/\s+/g, " ");
}

/** THE TABLE PARSER. Finds a two-column markdown table by its HEADER TEXT and
 *  returns its rows. Used on the design document AND on a fixture (arm A3), so
 *  a parser that silently found nothing would be caught rather than reported as
 *  a clean subject — the shape of every walk that has gone blind reporting
 *  green. `—` is the design's own placeholder for "this row grants nothing" and
 *  is returned as null rather than as a row of the judgement column. */
function parseTwoColumnTable(md, leftHeader) {
  const lines = md.split("\n");
  const head = lines.findIndex((l) => l.startsWith("|") && l.includes(leftHeader));
  if (head < 0) return null;
  const rows = [];
  for (let i = head + 2; i < lines.length; i++) {
    if (!lines[i].startsWith("|")) break;
    const cells = lines[i].split("|").slice(1, -1).map((s) => s.trim());
    if (cells.length !== 2) break;
    rows.push({ left: cells[0], right: cells[1] === "—" ? null : cells[1] });
  }
  return rows.length ? rows : null;
}

/** Every STRING LITERAL in a JavaScript source, comments removed first. SK-1's
 *  scanner, applied to SK-2's subject: doctrine is DISCUSSED at length in this
 *  module's header and a scanner reading prose would report the discussion as a
 *  copy. The stripper is itself checked (arm J0) against a fixture. */
function stripComments(src) {
  let out = "", i = 0;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "*") { const e = src.indexOf("*/", i + 2); i = e < 0 ? src.length : e + 2; continue; }
    if (c === "/" && d === "/") { const e = src.indexOf("\n", i); i = e < 0 ? src.length : e; continue; }
    if (c === '"' || c === "'" || c === "`") {
      const q = c; out += c; i++;
      while (i < src.length) {
        if (src[i] === "\\") { out += src.slice(i, i + 2); i += 2; continue; }
        out += src[i];
        if (src[i] === q) { i++; break; }
        i++;
      }
      continue;
    }
    out += c; i++;
  }
  return out;
}

function literalsOf(src) {
  const bare = stripComments(src);
  const out = [];
  for (const m of bare.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) out.push(m[1]);
  for (const m of bare.matchAll(/'((?:[^'\\\n]|\\.)*)'/g)) out.push(m[1]);
  return out;
}

function quotedIn(src, terms) {
  const lits = literalsOf(src);
  const exact = [], inside = [];
  const screaming = terms.filter((x) => /^[A-Z][A-Z0-9_]{2,}$/.test(x));
  for (const lit of lits) {
    const trimmed = lit.trim();
    if (terms.includes(trimmed)) exact.push(trimmed);
    for (const s of screaming) if (lit.includes(s)) inside.push(s);
  }
  return { exact: [...new Set(exact)], inside: [...new Set(inside)], literals: lits.length };
}

/** THE CITATION RESOLVER. A C-number a clause cites must actually be pushed
 *  somewhere in the check catalogue's source. Run on the real citations AND on a
 *  fabricated one (arm D4), so "every citation resolves" is a measurement rather
 *  than a search that matches everything. */
function citationResolves(cNumber) {
  if (!/^C-\d+(?:\.\d+)?$/.test(String(cNumber || ""))) return false;
  return CHECKS_SRC.includes(`'${cNumber}'`) || CHECKS_SRC.includes(`"${cNumber}"`);
}

/* A real inquiry for the run to be ABOUT. Deliberately minimal: this suite is
   not about promotion, and a fixture that fails for its own reasons hides the
   subject. */
const promoteFixture = () => POST(`op=promote&token=${TOK}`, {
  bundleId: BUNDLE, base: null, snapKey: "20260810T090000Z_inbox", author: "ruth",
  meta: { object_type: "inquiry", group: "believe-in-oakland",
          title: "What did this run decide, and what did it never decide?",
          current_state: "open", created: T0, last_updated: T0 },
  files: [{ path: "bundle.md", text: `---\nid: ${BUNDLE}\n---\n\n## Question\n\nWhat did this run decide?\n`,
            bytes: 84, sha256: SHA_A }],
  register: [],
});

const run = async () => {
  const fx = await promoteFixture();
  if (fx?.ok !== true && fx?.promoted !== true && !fx?.bundleId)
    console.log(`  note: fixture promote answered ${JSON.stringify(fx).slice(0, 200)}`);

  /* ==========================================================================
     BLOCK A — §14b.4's TABLE IS THE AUTHORITY, AND IT IS PARSED, NOT REMEMBERED.
     ======================================================================== */
  console.log("\nBLOCK A — the deterministic table is read out of the design document");

  const design = DOC(TABLE_SOURCE);
  const table = parseTwoColumnTable(design, "deterministic — code, not skill");
  console.log(`  corpus: ${TABLE_SOURCE}, ${design.length} characters; §14b.4's table parsed to `
            + `${table ? table.length : 0} row(s), ${table ? table.filter((r) => r.right).length : 0} of which grant judgement`);

  t("ARM A1: the table is IN the design document and has rows — the pin every arm below rests on, "
    + "because a parser that found nothing would make each of them pass over an empty set",
    [table !== null, (table || []).length >= 6], [true, true]);

  t("ARM A2: DEFERRED_ROWS IS the table's left column, in the document's own order and words — the "
    + "skill holds no second list of what it does not decide",
    DEFERRED_ROWS, (table || []).map((r) => r.left));

  t("ARM A3: JUDGED_ROWS IS the right column, the em-dash row excluded — so the whole of what this "
    + "skill may decide is the design's own grant and nothing beside it",
    JUDGED_ROWS, (table || []).map((r) => r.right).filter((x) => x !== null));

  /* THE PARSER'S OWN CONTROL, IN-SUITE AND THROUGH THE SAME FUNCTION. A parser
     that stopped reading reports the same clean answer as a subject in order. */
  const fixtureTable = "| deterministic — code, not skill | the model's judgement |\n"
    + "| --- | --- |\n| a row this document never had | a grant this skill never got |\n";
  const parsedFixture = parseTwoColumnTable(fixtureTable, "deterministic — code, not skill");
  t("ARM A4: THE TABLE PARSER CAN SEE A ROW THAT MOVED — the SAME parser over a fixture returns its "
    + "rows, and over a document with no such table returns null. Without this, A2/A3 would pass "
    + "over a parser that had gone blind",
    [(parsedFixture || []).map((r) => r.left), parseTwoColumnTable("no table here at all", "deterministic — code, not skill")],
    [["a row this document never had"], null]);

  const designFlat = flatten(design);
  t("ARM A5: the measured evidence for the first deferred row is the design document's own sentence, "
    + "with its figures — the row a model is likeliest to think it can improve on carries the "
    + "measurement that says otherwise",
    designFlat.includes(flatten(LOOP_TERMINATION_EVIDENCE)), true);

  t("ARM A6: THE DOCUMENT SCANNER CAN MISS — the same normaliser and search over a sentence that is "
    + "NOT in the document reports absence, so A5 is a measurement rather than a search that "
    + "matches everything",
    designFlat.includes(flatten("TREC 2011 found searchers estimating their own recall to be reliable")),
    false);

  /* ==========================================================================
     BLOCK B — THE SKILL TAKES EXACTLY THE RIGHT COLUMN AND DEFERS EXACTLY THE LEFT.
     ======================================================================== */
  console.log("\nBLOCK B — what the skill claims, and what it hands back, both measured against the table");

  const claimed = [...new Set(CLAUSES.flatMap((c) => c.judges))].sort();
  const deferred = [...new Set(CLAUSES.flatMap((c) => c.defers))].sort();
  console.log(`  corpus: ${CLAUSES.length} clauses across ${new Set(CLAUSES.map((c) => c.area)).size} areas; `
            + `${claimed.length} judgement row(s) claimed, ${deferred.length} deterministic row(s) deferred`);

  t("ARM B1: THE SKILL'S AUTHORITY IS EXACTLY THE TABLE'S RIGHT COLUMN — nothing claimed that the "
    + "design did not grant, and nothing granted that no clause exercises",
    claimed, [...JUDGED_ROWS].sort());

  t("ARM B2: AND EVERY DETERMINISTIC ROW IS DEFERRED BY SOME CLAUSE — a left-column row that no "
    + "clause hands back is a row the skill has quietly taken, which is the defect §14b.4 names",
    deferred, [...DEFERRED_ROWS].sort());

  t("ARM B3: no clause names a row outside either column, so a failure above names an offender "
    + "rather than a set difference",
    [CLAUSES.filter((c) => c.judges.some((j) => !JUDGED_ROWS.includes(j))).map((c) => c.id),
     CLAUSES.filter((c) => c.defers.some((d) => !DEFERRED_ROWS.includes(d))).map((c) => c.id)],
    [[], []]);

  t("ARM B4: every clause is well-formed — an id, an area, a decides, a why — because a clause "
    + "missing its grant would pass every set arm above by contributing nothing to either union",
    CLAUSES.filter((c) => !(c.id && c.area && typeof c.decides === "string" && c.decides.length > 40
                            && typeof c.why === "string" && c.why.length > 20)).map((c) => c.id ?? "(unnamed)"),
    []);

  /* ==========================================================================
     BLOCK C — THE CONTROL-FLOW AUTHORITY SCAN. THE ROW'S OWN ACCEPTS-WHEN.
     ======================================================================== */
  console.log("\nBLOCK C — no control-flow authority in the skill text, MEASURED over the text");

  const scanned = CLAUSES.map((c) => c.decides).join("\n");
  console.log(`  corpus: ${scanned.length} characters of GRANT text across ${CLAUSES.length} clauses, `
            + `scanned against ${CONTROL_FLOW_AUTHORITY.length} authority patterns`);
  console.log(`  what this instrument CANNOT see: a bound stated in words no pattern holds ("keep `
            + `going while it is still productive"), and authority written into the DEFERRAL text `
            + `— deliberately, because that is where a deferred subject is legitimately named.`);

  const offenders = CLAUSES.map((c) => ({ id: c.id, hits: controlFlowAuthority(c.decides) }))
                           .filter((x) => x.hits.length);
  t("ARM C1 (SK-2's ACCEPTS-WHEN): no clause's GRANT text carries control-flow authority — no bound, "
    + "no termination condition, and no decision about either. Loop bounds, fan-out and gates live in "
    + "the deterministic table and this text does not restate one",
    offenders, []);

  /* THE SCAN'S OWN CONTROL, IN-SUITE. This is SK-2's negative control expressed
     as a fixture: the row's NC is *"a skill edit that moves loop termination
     into model judgement"*, and this is that edit's text. The control HARNESS
     (`skilldoctrine.control.mjs`) makes the same edit to the real source; this
     arm makes it impossible for the scan to be silently broken between runs. */
  const MOVED_INTO_JUDGEMENT =
    "You decide when the loop stops and how many passes to run. Keep searching until you are "
    + "satisfied that the record has been covered, spawning at most three sub-sessions per level.";
  const tripped = controlFlowAuthority(MOVED_INTO_JUDGEMENT);
  console.log(`  the NC fixture trips: ${JSON.stringify(tripped)}`);
  t("ARM C2: THE SCAN CAN FIRE — the SAME function over loop termination moved into model judgement "
    + "names it, on more than one pattern. Without this arm C1 would pass over a scan that had "
    + "stopped reading, which is what every green walk over an empty corpus looks like",
    [tripped.length >= 3, tripped.includes("the termination decision itself")], [true, true]);

  /* EVERY PATTERN GUARDS SOMETHING. A pattern that matches nothing anywhere is a
     pattern nobody would notice going stale. */
  const specimens = {
    "a bound stated as a quantity": "run at most three passes over the level",
    "a bound stated as a numeral": "open four sub-sessions and read what comes back",
    "a termination condition": "stop the search once the level has been covered",
    "the termination decision itself": "decide how many passes this inquiry deserves",
    "self-assessed recall as a stopping rule": "carry on until you are confident nothing is left",
    "a loop written as an instruction": "repeat the level walk while anything new is arriving",
  };
  const dead = CONTROL_FLOW_AUTHORITY.map((p) => p.name)
    .filter((n) => !controlFlowAuthority(specimens[n] ?? "").includes(n));
  t("ARM C3: every authority pattern fires on a specimen of the shape it exists to catch — a dead "
    + "pattern is a guard that would go stale without anyone noticing", dead, []);

  /* OVER-STRICTNESS, AND IT IS THE ARM THAT KEEPS THIS SCAN HONEST. Two of the
     five sentences below are the design's OWN granted judgements, verbatim from
     the table's right column. A scan that refused those would push the next
     author to phrase the grant around the instrument — prose shaped by the
     detector rather than measured by it, and the detector would then be reading
     its own reflection. */
  const legitimate = [
    ...JUDGED_ROWS,
    "Decide what to look for, and which of the four levels is worth asking next.",
    "Say where the work stopped and what a reader must not read into what is missing.",
    "Judge whether a reading says something in substance the record does not already hold.",
    "Weigh what cuts against the claim exactly as hard as what supports it.",
  ];
  const overStrict = legitimate.map((s) => ({ s: s.slice(0, 44), hits: controlFlowAuthority(s) }))
                               .filter((x) => x.hits.length);
  t(`ARM C4 (OVER-STRICTNESS): none of ${legitimate.length} legitimate sentences trips the scan, and `
    + "the design's own granted judgements are among them — a scan that refused the grant would be "
    + "worse than no scan",
    overStrict, []);

  /* ==========================================================================
     BLOCK D — EVERY CLAUSE EITHER CITES CODE OR SAYS IT CITES NONE.
     ======================================================================== */
  console.log("\nBLOCK D — a clause with no fence behind it says so, and every cited fence resolves");

  const cited = [...new Set(CLAUSES.flatMap((c) => c.enforced_by))];
  const instructionOnly = CLAUSES.filter((c) => c.enforced_by.length === 0);
  console.log(`  corpus: ${cited.length} distinct C-number(s) cited: ${cited.sort().join(", ")}`);
  console.log(`  MEASURED: ${instructionOnly.length} of ${CLAUSES.length} clauses are INSTRUCTION ONLY `
            + `(${instructionOnly.map((c) => c.id).join(", ")}) — this is how much of this skill a `
            + `careless model could ignore, published rather than implied.`);

  t("ARM D1: every clause either cites code or SAYS it cites none — undetermined is first-class and "
    + "must be STATED, and a clause backed by nothing may not read like a clause backed by a fence",
    CLAUSES.filter((c) => c.enforced_by.length === 0
                       && !(typeof c.unenforced_because === "string" && c.unenforced_because.length > 40))
           .map((c) => c.id),
    []);

  t("ARM D2: every cited C-number RESOLVES in the check catalogue — a citation pointing at a fence "
    + "that does not exist is worse than no citation, because it reads as one that does",
    cited.filter((c) => !citationResolves(c)), []);

  t("ARM D3: THE CITATION RESOLVER CAN FAIL — the SAME function over a fabricated number and over a "
    + "malformed one reports both missing, so D2 is a measurement",
    [citationResolves("C-99.99"), citationResolves("not-a-check"), citationResolves(cited[0])],
    [false, false, true]);

  /* THE ONE HAND-WRITTEN NUMBER, PINNED. `checkEarnedLeg`'s hunch arms push
     their C-number at the call site rather than through a keyed registry, so
     there is no `.check` for the doctrine to read. It is NAMED as the exception
     in the subject's own comment and held here instead. */
  t("ARM D4: the one C-number the doctrine writes out — the hunch arms', which have no catalogue row "
    + "to read — is still the number the catalogue pushes on a hunch with no author",
    /a hunch with no author[\s\S]{0,80}?DEC-15/.test(CHECKS_SRC)
      && CHECKS_SRC.includes("f('C-2.8', 'error', `basis[${i}] is a hunch with no author"),
    true);

  /* NO SECOND COPY OF A REFUSAL SENTENCE. SK-1's ARM E8, one file over: the
     code, the C-number and the words a member reads are ONE row, and a skill
     that paraphrased a refusal would be answering for the plane. */
  const translations = [...Object.values(SUGGEST_CHECKS), ...Object.values(MACHINE_FENCE_CHECKS),
                        ...Object.values(AI_RUN_CHECKS)]
    .map((r) => r.translation).filter((s) => typeof s === "string" && s.length > 40);
  t(`ARM D5: src/skilldoctrine.mjs holds NO copy of any of the ${translations.length} canned refusal `
    + "sentences it cites — it names the fence and never speaks for it",
    translations.filter((s) => DOCTRINE_SRC.includes(s.slice(0, 40))), []);

  /* ==========================================================================
     BLOCK E — THE FOUR-LEVEL SEARCH, AND WHICH ABSENCE IS STATED AT EACH.
     ======================================================================== */
  console.log("\nBLOCK E — four levels, four DIFFERENT facts, and they must not read alike");

  const byLevel = absenceByLevel();
  const levels = Object.keys(byLevel);
  const facts = levels.map((l) => byLevel[l].states_when_absent);
  console.log(`  corpus: ${levels.length} level(s) from OBSERVATION_LEVELS; ${SUGGEST_LEVELS.length} `
            + `from SUGGEST_LEVELS; ${Object.keys(OBSERVATION_STATES).length} absence state(s), of `
            + `which ${LICENSES_A_CONCLUSION.length} license a conclusion`);
  console.log(`  the four facts: ${JSON.stringify(facts)}`);

  t("ARM E1: the absence map is KEYED BY the record's own levels, in the record's own order — a "
    + "level added, removed or renamed in airun.mjs fails HERE by name rather than leaving this "
    + "doctrine quietly guarding a smaller set",
    levels, Object.keys(OBSERVATION_LEVELS));

  t("ARM E2: every level STATES which absence it hit, and the four are PAIRWISE DISTINCT — 'no "
    + "meaning derived', 'nothing extracted', 'no document' and 'nobody looked' are four different "
    + "facts about the record and reading alike is exactly the defect",
    [facts.filter((f) => typeof f === "string" && f.length > 0).length,
     new Set(facts).size,
     levels.filter((l) => !byLevel[l].does_not_mean).length],
    [4, 4, 0]);

  /* THE FOUR FACTS ARE CLAUDE.md's OWN, AND THE ESCALATION IS THE DOCUMENT'S
     ORDER. `ask_next` is derived from OBSERVATION_LEVELS' key order rather than
     from a second chain, so this arm is what stops a reorder there silently
     rewriting the doctrine: it holds that order to the order CLAUDE.md names
     the four facts in. */
  const claudeFlat = flatten(DOC(FACTS_SOURCE));
  const positions = facts.map((f) => claudeFlat.indexOf(f));
  console.log(`  the four facts' positions in ${FACTS_SOURCE}: ${JSON.stringify(positions)}`);
  t("ARM E3: all four facts are CLAUDE.md's own words, and they appear there in the ESCALATION'S "
    + "ORDER — so the chain each level points down is the document's chain and not this file's "
    + "invention, and a reorder in airun.mjs fails here",
    [positions.every((p) => p >= 0),
     positions.every((p, i) => i === 0 || p > positions[i - 1])],
    [true, true]);

  t("ARM E4: THE DOCUMENT SCANNER CAN MISS — a fact that is NOT in CLAUDE.md reports absent, so E3 "
    + "is a measurement rather than a search that matches everything",
    claudeFlat.indexOf("no meaning derived is evidence that nothing exists"), -1);

  t("ARM E5: each level points at the NEXT level to ask before concluding anything, and only the "
    + "last points nowhere — absence at one level is not evidence of absence at the next",
    [levels.map((l) => byLevel[l].ask_next),
     levels.filter((l) => byLevel[l].ask_next === null).length],
    [[...levels.slice(1), null], 1]);

  t("ARM E6: an absence is stated in the RECORD'S OWN state vocabulary, and only the definitive "
    + "states license a conclusion — imported from airun.mjs, both sides non-empty, and this file "
    + "types neither",
    [byLevel[levels[0]].states, LICENSES_A_CONCLUSION.length > 0, LICENSES_NOTHING.length > 0,
     LICENSES_A_CONCLUSION.every((s) => DEFINITIVE_STATES.has(s)),
     LICENSES_NOTHING.some((s) => DEFINITIVE_STATES.has(s))],
    [Object.keys(OBSERVATION_STATES), true, true, true, false]);

  /* THE BRIDGE, AND THE DIVERGENCE IT BRIDGES IS MEASURED RATHER THAN ASSUMED.
     A run writes its log in one spelling and its `level-empty` suggestion in
     the other. This asserts COVERAGE in both directions, so it holds whether or
     not the two rosters are ever unified — and fails naming the level if a
     fifth appears in either. Delegated in CLAIMS.md; both rosters are outside
     this area's paths. */
  const divergent = levels.filter((l) => byLevel[l].logged_as !== byLevel[l].reported_as);
  console.log(`  MEASURED: ${divergent.length} of ${levels.length} level(s) are spelled differently `
            + `by the two rosters: ${divergent.map((l) => `${byLevel[l].logged_as} -> ${byLevel[l].reported_as}`).join(", ") || "(none)"}`);
  t("ARM E7: every level carries BOTH spellings and every member of BOTH rosters is reached — the "
    + "doctrine bridges the two rather than picking one, so a run can join its log entry to its "
    + "suggestion. If the rosters converge this still passes; if either gains a member it fails",
    [levels.filter((l) => byLevel[l].reported_as === null),
     SUGGEST_LEVELS.filter((s) => !levels.some((l) => byLevel[l].reported_as === s))],
    [[], []]);

  t("ARM E8: THE BRIDGE CAN FAIL — the same derivation over a level neither roster holds returns "
    + "null rather than guessing a spelling", reportsAs("provenance"), null);

  /* ==========================================================================
     BLOCK F — COMPOSITION: GRADES ARE COMPOSED, NEVER MINTED.
     ======================================================================== */
  console.log("\nBLOCK F — the grades arrive from the record, and a hunch is unreachable from here");

  console.log(`  corpus: ${GRADE_SOURCES.length} grade source(s) in the catalogue, of which `
            + `${EARNED_GRADE_SOURCES.length} are EARNED and ${VERSION_STRENGTH_INERT_SOURCES.length} `
            + `is what the strength walk treats as inert`);

  t("ARM F1: the sources a machine-composed leg may carry are the record's EARNED set, imported — "
    + "'assign strength values' means composing legs whose earned grades produce a supported "
    + "calculation, and this doctrine holds no letter and no source of its own",
    [COMPOSITION.grade_arrives_from, COMPOSITION.roles,
     COMPOSITION.grade_arrives_from.every((s) => GRADE_SOURCES.includes(s))],
    [EARNED_GRADE_SOURCES, BASIS_ROLES, true]);

  t("ARM F2: the source that is a member's own marking is DISJOINT from the earned set — a "
    + "machine-composed leg is never a hunch, because it either carries a grade the record earned "
    + "or it is absent-and-named (DEC-15, SWEEP §1.3)",
    [COMPOSITION.unreachable_to_a_machine,
     COMPOSITION.unreachable_to_a_machine.filter((s) => EARNED_GRADE_SOURCES.includes(s))],
    [VERSION_STRENGTH_INERT_SOURCES, []]);

  /* AND THE FENCE IS CODE, DRIVEN THROUGH THE CATALOGUE'S OWN CHECKER. This is
     the arm that makes F2 a fact about the plane rather than a sentence in a
     doctrine file: the same leg, twice, differing only in whether a member's
     name stands behind the hunch. */
  const legFor = (extra) => ({
    object_type: "inquiry", id: BUNDLE,
    basis: [{ target_id: "DOC-2026-0810-a", target_type: "information",
              role: BASIS_ROLES[0], grade_axis: GRADE_AXES[1], ...extra }],
  });
  const findingsNoAuthor = [];
  checkInquiryBasis(legFor({ grade_source: VERSION_STRENGTH_INERT_SOURCES[0], grade: "C" }),
                    findingsNoAuthor, null, null);
  const findingsEarned = [];
  checkInquiryBasis(legFor({ grade_source: EARNED_GRADE_SOURCES[0] }), findingsEarned, null, null);
  const authorMsgs = findingsNoAuthor.filter((f) => /hunch with no author/.test(f.message ?? ""));
  console.log(`  driven: the catalogue's own checker returned ${findingsNoAuthor.length} finding(s) `
            + `for a hunch with no author and ${findingsEarned.length} for the same leg resting on `
            + `an earned source`);
  t("ARM F3 (THE FENCE IS CODE): a hunch with no member behind it is REFUSED by the catalogue's own "
    + "checker, by C-number — that refusal is what makes a hunch unreachable to a machine, and this "
    + "doctrine cites it rather than restating it as a rule a model could ignore",
    [authorMsgs.length > 0, authorMsgs[0]?.check ?? null,
     findingsEarned.filter((f) => /hunch/.test(f.message ?? "")).length],
    [true, "C-2.8", 0]);

  /* ==========================================================================
     BLOCK G — THE DESCRIPTION, TO A COMMIT MESSAGE'S STANDARD.
     ======================================================================== */
  console.log("\nBLOCK G — the description standard, and the boilerplate fence underneath it");
  console.log(`  WHAT THIS BLOCK CANNOT CHECK, stated rather than implied: SK-2's row also asks that `
            + `"a sampled run's descriptions name their ungraded legs". THERE IS NO RUN TO SAMPLE — `
            + `the harness composes nothing until VF-4 drives one live — so nothing below claims `
            + `anything about a run's OUTPUT. It checks the standard and the code that refuses a `
            + `boilerplate description.`);

  t("ARM G1: the standard is §6 rule 1's own — held to a commit message's standard — and the phrase "
    + "is in the design document",
    [designFlat.includes(flatten("It is held to a commit message's standard: what changed and why")),
     DESCRIPTION_STANDARD.held_to.includes("commit message's standard")],
    [true, true]);

  t("ARM G2: the standard REQUIRES every ungraded leg to be named, and to be read from the record's "
    + "own answer rather than recalled — DEC-18's plural clause is the obligation, and inert never "
    + "means invisible",
    [DESCRIPTION_STANDARD.must_carry.some((x) => /every ungraded leg, named/.test(x)),
     /record's own answer/.test(DESCRIPTION_STANDARD.read_the_ungraded_legs_from),
     /\binert\b/i.test(COMPOSITION.ungraded_leg) && /\bNAMED\b/.test(COMPOSITION.ungraded_leg),
     /inert never means invisible/i.test(COMPOSITION.ungraded_leg)],
    [true, true, true, true]);

  t("ARM G3 (THE FENCE IS CODE): the plane's own boilerplate predicate refuses a placeholder "
    + "description and accepts a real one — so the standard above is instruction sitting on top of "
    + "a refusal, not the refusal itself",
    [isBoilerplate("TBD"), isBoilerplate("   "), isBoilerplate("<description here>"),
     isBoilerplate("Three legs rest on the same contract; the fourth is ungraded because the "
                   + "record earned nothing for it, and it is named below.")],
    [true, true, true, false]);

  /* ==========================================================================
     BLOCK H — BIAS SITS ON TOP OF A FENCE THAT IS CODE. DRIVEN THROUGH THE OP.
     ======================================================================== */
  console.log("\nBLOCK H — the lens fence is code; this skill cites it and implements none of it");

  const RUN = "AIRUN-2026-0810-sk2-bias";
  const pack = renderPack(await GET(`op=affordances&token=${TOK}`), CATALOGUE);
  const opened = await POST(`op=airunopen&token=${TOK}`, {
    run: RUN, contextType: "inquiry", contextId: BUNDLE, mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: pack.version, bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }],
    state: {}, at: T0 });
  const searchHalf = await GET(`op=airunspawn&token=${TOK}&run=${RUN}&half=search`);
  const composeHalf = await GET(`op=airunspawn&token=${TOK}&run=${RUN}&half=compose`);
  t("ARM H1 (THE FENCE IS CODE, DRIVEN): op=airunspawn hands the SEARCH half no lens field at all "
    + "and the COMPOSING half one — the coupling §14 forbids is absent by construction, not by "
    + "instruction, and there is no field here for a skill to be trusted about",
    [opened?.started, searchHalf?.half, "bias" in (searchHalf ?? {}),
     composeHalf?.half, "bias" in (composeHalf ?? {})],
    [true, "search", false, "compose", true]);

  const biasClause = CLAUSES.find((c) => c.area === "bias");
  t("ARM H2: and the bias clause CITES that fence while enforcing nothing — minimisation sits ON TOP "
    + "of the fence, never instead of it, which is the ordering v2 got wrong and §14b.4 names as "
    + "the defect",
    [biasClause?.enforced_by, typeof biasClause?.unenforced_because,
     /op=airunspawn/.test(biasClause?.unenforced_because ?? ""),
     /no field to read/.test(biasClause?.unenforced_because ?? ""),
     biasClause?.judges],
    [[], "string", true, true, []]);

  /* ==========================================================================
     BLOCK I — THE PACK CARRIES IT, AND THE VERSION MOVES WHEN IT MOVES.
     ======================================================================== */
  console.log("\nBLOCK I — SK-2's layers are in SK-1's pack, under the disclosure standard");

  const layers = judgementLayers();
  console.log(`  corpus: ${Object.keys(layers).length} judgement layer(s): ${Object.keys(layers).join(", ")}`);

  t("ARM I1: every judgement layer is IN the rendered pack's disclosed half, each naming the work "
    + "that loads it — a run that does not know a layer exists cannot ask for it",
    [Object.keys(layers).filter((k) => !(k in pack.disclosed)),
     Object.values(layers).every((l) => typeof l.load_when === "string" && l.load_when.length > 0),
     pack.sourcing.judgement],
    [[], true, "authored"]);

  t("ARM I2: every clause reaches the pack — a layer that rendered its `load_when` and dropped its "
    + "body would satisfy I1 and carry no doctrine at all",
    CLAUSES.filter((c) => !JSON.stringify(pack.disclosed).includes(c.id)).map((c) => c.id), []);

  /* THE DISCLOSURE STANDARD, ONE LAYER DOWN. SK-1's whole item is that a run
     under vN and a rerun under vN+1 are distinguishable; this is the arm that
     says SK-2's doctrine is INSIDE that guarantee rather than beside it. */
  const withMovedClause = { ...pack,
    disclosed: { ...pack.disclosed,
      search: { ...pack.disclosed.search,
        body: { ...pack.disclosed.search.body, evidence: LOOP_TERMINATION_EVIDENCE + " (moved)" } } } };
  const { packVersion } = await import("../src/skillpack.mjs");
  t("ARM I3: move one sentence of this doctrine and the PACK'S VERSION moves — so a run composed "
    + "under one edition of the judgement layer and a rerun under the next are distinguishable in "
    + "their run objects, without anyone remembering to bump anything",
    [packVersion(withMovedClause) !== pack.version,
     `${JUDGEMENT_ID}@${JUDGEMENT_EDITION}`.length > 0],
    [true, true]);

  t("ARM I4: the boundary layer PUBLISHES what this text is — a run reading it learns that every "
    + "fence named here is enforced somewhere else, so it does not mistake instruction for a gate",
    [/INSTRUCTION/.test(pack.disclosed.judgement_boundary.body.note),
     pack.disclosed.judgement_boundary.body.decided_here,
     pack.disclosed.judgement_boundary.body.decided_by_the_harness],
    [true, JUDGED_ROWS, DEFERRED_ROWS]);

  /* ==========================================================================
     BLOCK J — SOURCING. THIS FILE TYPES NO IMPORTED VOCABULARY MEMBER EITHER.
     ======================================================================== */
  console.log("\nBLOCK J — SK-1's sourcing arm, turned on SK-2's subject");

  const stripFixture = `/* "TYPED_IN_A_COMMENT" */ const a = "TYPED_IN_CODE"; // "TYPED_IN_LINE_COMMENT"`;
  t("ARM J0: the comment stripper keeps code literals and drops comment ones — every arm below is "
    + "built on it, and this doctrine's header discusses its own vocabularies at length",
    literalsOf(stripFixture), ["TYPED_IN_CODE"]);

  const CORPUS = [...new Set([
    ...Object.keys(OBSERVATION_LEVELS), ...Object.keys(OBSERVATION_STATES),
    ...Object.keys(RUN_BOUNDS), ...Object.keys(RUN_ENDINGS),
    ...SUGGEST_LEVELS, ...GRADE_SOURCES, ...EARNED_GRADE_SOURCES,
    ...VERSION_STRENGTH_INERT_SOURCES, ...BASIS_ROLES, ...GRADE_AXES,
    ...Object.values(SUGGEST_CHECKS).map((r) => r.check),
    ...Object.values(MACHINE_FENCE_CHECKS).map((r) => r.check),
    ...Object.values(AI_RUN_CHECKS).map((r) => r.check),
  ])];
  const found = quotedIn(DOCTRINE_SRC, CORPUS);
  console.log(`  corpus: ${CORPUS.length} sourced terms, scanned against ${found.literals} string `
            + `literals in src/skilldoctrine.mjs (comments removed)`);
  console.log(`  what this instrument CANNOT see: a term reproduced in a comment (deliberately), and `
            + `a term spelled differently. It sees a COPY, which is the failure this project has `
            + `measured most often.`);

  /* THE INSTRUMENT'S LIMIT, CORRECTED HERE AFTER THIS ARM FAILED ON ITS FIRST
     RUN AND THE ASSERTION WAS THE THING THAT WAS WRONG. It was written expecting
     `["C-2.8"]` — the one C-number the doctrine writes out — on the assumption
     that every C-number is in this corpus. **IT MEASURED `[]`, and `[]` is
     correct**: the corpus is built from the KEYED catalogue registries
     (`SUGGEST_CHECKS`, `MACHINE_FENCE_CHECKS`, `AI_RUN_CHECKS`), and `C-2.8` is
     pushed at a CALL SITE with no row to read — which is exactly why the
     doctrine has to write it out at all. So this scanner cannot see that one
     term, arm D4 holds it instead, and the assertion is corrected to the fact
     rather than the fact to the assertion. The expected value is EMPTY, so a
     hand-typed member of any keyed vocabulary still fails here immediately. */
  t("ARM J1: no sourced term appears as a string literal in src/skilldoctrine.mjs — every vocabulary "
    + "member is imported. The scanner's corpus is the KEYED catalogue registries and does not "
    + "reach a C-number pushed at a call site, which is the one number this doctrine writes out and "
    + "which ARM D4 pins instead",
    found.exact, []);

  t("ARM J2: and no literal NAMES a sourced SCREAMING_SNAKE term inside a longer sentence",
    found.inside, []);

  const handCopy = `const states = ["${CORPUS.find((x) => /^[A-Z][A-Z0-9_]{2,}$/.test(x))}"];`
    + ` const note = "the run reports ${CORPUS.find((x) => /^[A-Z][A-Z0-9_]{2,}$/.test(x))} at this level";`;
  const trippedCopy = quotedIn(handCopy, CORPUS);
  t("ARM J3: THE SOURCING SCANNER CAN FAIL — the SAME function over a hand copy finds it, both ways. "
    + "Without this arm J1/J2 would pass over a scanner that stopped reading",
    [trippedCopy.exact.length > 0, trippedCopy.inside.length > 0], [true, true]);

  await mf.dispose();
};

await run();

/* THE TAIL LINE IS THE BATTERY'S CONTRACT, not decoration: `scripts/battery.mjs`
   reads `N pass, M fail` off it, and a suite whose count cannot be read reports
   as UNKNOWN rather than as zero (D-93's `sshsig` 16-vs-18 case). The explicit
   exit is `hygiene.test.mjs`'s rule — a suite ends on its own result rather than
   on whatever the runtime decides to do with a pending handle — and it is read
   from the LAST 400 characters of this file, so both lines live here. */
console.log(`\nskilldoctrine: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
