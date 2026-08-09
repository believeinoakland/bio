/* THE CATALOG'S CORPUS IS DECLARED CODE, NOT RAW SOURCE — D-277.
 *
 * WHAT WENT WRONG. `scripts/coverage.mjs` built the conformance catalog by
 * matching an id shape over the RAW bytes of `checks/bio-checks.mjs`, comments
 * included. So a numeral written in PROSE — a comment explaining a rule, a note
 * recording which numeral an allocation deliberately skipped — became a
 * CATALOGUED CHECK that no assertion names, and `--strict` exited 1 on a family
 * that was complete. That is on a GATE, and a gate that fails honest runs gets
 * switched off, which is `VERIFICATION.md`'s own stated reason for not making
 * `--strict` the gate yet. The catalogue had already bent ITSELF around the
 * instrument once: its renumbering note says in its own words that it deleted its
 * own worked example because this harvester read it as code.
 *
 * WHAT THIS SUITE IS FOR. `test/declared-corpus.control.mjs` drives the REAL gate
 * end to end and is the evidence that the FAILURE changed. This suite asks the
 * questions a fixture can answer honestly: does the rule hold on inputs chosen to
 * break it, in BOTH directions. Over-strictness is half of it — an instrument
 * that stopped catalogueing REAL checks would be the same defect wearing the
 * opposite sign, and losing a check from the contract is the worse half.
 *
 * WHAT IT CANNOT SEE, plainly. It drives `scripts/declared-source.mjs`, which is
 * a SCANNER and not a parser: its regex-literal rule is a heuristic and a nested
 * template inside a `${...}` ends a string span early. Neither can delete code —
 * a misread blanks a span and offsets are preserved — but neither is proven here
 * beyond the arms below. It says nothing about whether a catalogued check is
 * correct, reachable, or ever fires; `check-firing.test.mjs` owns that.
 *
 * THE ID-SHAPED TOKENS IN THIS FILE ARE BUILT FROM PARTS, NEVER WRITTEN WHOLE,
 * and that is the item's own trap taken seriously. A suite is corpus: the credit
 * side of `coverage.mjs` reads every suite's code, so an id literal here would
 * CREDIT that check for free — a check reading as covered because a test about
 * corpora happened to spell it. The families used are outside anything the
 * catalogue allocates, and the suite ASSERTS that rather than assuming it.
 *
 * NEGATIVE CONTROL: the arms that drive the REAL gate live in
 * `test/declared-corpus.control.mjs` — COMMITTED, so they re-run in one step with
 * `node test/declared-corpus.control.mjs all` from `bio-plane/`. Seven arms, each
 * armed ALONE with every other defence held open, each restored from a uniquely
 * named per-arm pristine copy verified by sha256 AND by `cmp`, byte counts
 * printed and floored, and each DECLARING before it ran what must fail and what
 * must not:
 *   (0) BASELINE, nothing armed -> exit 0, and a catalog count that is a NUMBER.
 *   (A) an ordinary explanatory comment naming an unallocated numeral -> exit 0,
 *       catalog unmoved, the numeral reported on the prose-only line. This is the
 *       arm the item exists for: before it, this was exit 1.
 *   (B) a real `check:` row nothing names -> exit 1, naming it.
 *   (C) OVER-STRICTNESS — a real declaration in a spelling nobody anticipated, an
 *       id in a bare array literal -> exit 1, naming it. Green here would mean a
 *       check had vanished from the contract in silence.
 *   (D) a real check's only code-level assertion turned into PROSE -> exit 1.
 *   (E) only a SIBLING id named in a suite -> exit 1, naming the declared id.
 *   (F) OVER-STRICTNESS — a comment naming a foreign-namespace id whose dotted
 *       tail has a check id's shape -> exit 0, catalogued nowhere.
 *
 * RUN 2026-08-09 (worktree agent-a44fc12233348817a): 18 pass, 0 fail, FOOT
 * REACHED, and ZERO arms behaved other than declared. Every restore verified by
 * sha256 AND by `cmp`: the catalogue at 539,891 bytes against a floor of
 * 400,000, `check-firing.test.mjs` at 43,627 against 30,000, this file at 12,277
 * against 3,000.
 *
 * AND THE ARMS WERE SHOWN TO BITE, which is the part a green run does not
 * establish. `scripts/declared-source.mjs` was put back to the OLD rules and the
 * whole set re-run: 10 pass, 8 FAIL. Arm (A) went to exit 1 with the catalog at
 * 225 against a baseline 224 — D-271's failure, reproduced through this harness
 * rather than described. Arm (E) went to exit 0, the sibling crediting its
 * neighbour exactly as measured. Arm (F) went to exit 1 with the catalog at 225,
 * a DECISION id counted as a check. Arms (B), (C) and (D) stayed green under the
 * old rules, and that is RECORDED rather than smoothed: (B) and (C) guard against
 * a FUTURE narrowing rather than against the defect being fixed, and (D)'s
 * counter-arm needed a second edit, because reverting the module alone leaves
 * `coverage.mjs` still choosing a code-only corpus for the credit side. Reverting
 * THAT one line as well — the credit corpus back to raw source — took arm (D) to
 * exit 0: a check whose only mention is a sentence read as covered. Both
 * counter-runs were restored and re-verified by sha256 before this line was
 * written.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { codeOnly, declaredCheckIds, proseOnlyCheckIds, namesCheckId, CHECK_ID }
  from "../scripts/declared-source.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n        want ${JSON.stringify(want)}\n        got  ${JSON.stringify(got)}`}`);
};

/* Built from parts. See the header: an id literal in a suite is a credit. */
const ID = (fam, mem) => "C" + "-" + fam + "." + mem;
const OPEN = "/" + "*", CLOSE = "*" + "/";

/* ============================ 1. THE REAL CATALOGUE, AND ITS FLOOR ========= */
/* A rule proven only on fixtures is a rule proven against its author. These
   figures are the real file's, PRINTED so a reader can see the corpus rather
   than take a percentage on trust, and FLOORED so a scanner that goes blind
   fails here instead of reporting a beautiful 100% over nothing — a shape this
   project has caught passing three times. MOVE THE FLOOR ONLY UPWARD and only to
   a figure a green run PRINTED. */
console.log("\n--- 1. the real catalogue ---");
const catalogSrc = readFileSync(join(PLANE, "checks", "bio-checks.mjs"), "utf8");
const declared = declaredCheckIds(catalogSrc);
const prose = proseOnlyCheckIds(catalogSrc);
const rawIds = [...new Set([...catalogSrc.matchAll(CHECK_ID)].map((m) => m[0]))];
const CATALOG_FLOOR = 221;   /* what a green run PRINTED on 2026-08-09, D-277. */
console.log(`  corpus: ${declared.length} ids DECLARED in code · ${prose.length} prose-only · ${rawIds.length} in the raw text`);
console.log(`  prose only: ${prose.join(" ") || "(none)"}`);
t("the catalogue declares at least the floor (a blind scanner fails HERE)", declared.length >= CATALOG_FLOOR, true);
t("declared is a SUBSET of raw — stripping prose cannot invent an id",
  declared.every((id) => rawIds.includes(id)), true);
t("declared and prose-only are disjoint", declared.some((id) => prose.includes(id)), false);
t("declared + prose-only accounts for every id in the raw text",
  declared.length + prose.length, rawIds.length);
/* The retirements table writes its ids as QUOTED OBJECT KEYS — a third spelling,
   and the one a matcher built from the two obvious shapes would lose. Its own
   header requires those ids to keep being catalogued, because the assertion that
   names a retired id is the one PROVING IT NO LONGER FIRES. Read out of the
   module rather than hand-listed. */
const { CHECK_RETIREMENTS } = await import("../checks/bio-checks.mjs");
const retired = Object.keys(CHECK_RETIREMENTS);
t("the retirements table is non-empty (a walk over nothing passes everything)", retired.length > 0, true);
t("every RETIRED id is still catalogued, though its spelling is a quoted key",
  retired.filter((id) => !declared.includes(id)), []);

/* ============================ 2. PROSE IS NOT DECLARATION ================== */
console.log("\n--- 2. prose is not declaration ---");
const P1 = ID(901, 1), P2 = ID(901, 2), P3 = ID(901, 3);
t("an id in a BLOCK comment is not declared",
  declaredCheckIds(`${OPEN} the numeral ${P1} was skipped ${CLOSE}\nexport const x = 1;\n`), []);
t("an id in a LINE comment is not declared",
  declaredCheckIds(`// see ${P2} for why\nexport const y = 2;\n`), []);
t("an id in a JSDoc block is not declared",
  declaredCheckIds(`${OPEN}* ${P3} is documented here ${CLOSE}\nexport const z = 3;\n`), []);
t("and all three are REPORTED as prose-only, never dropped in silence",
  proseOnlyCheckIds(`${OPEN} ${P1} ${CLOSE}\n// ${P2}\n${OPEN}* ${P3} ${CLOSE}\n`), [P1, P2, P3]);

/* ============================ 3. OVER-STRICTNESS =========================== */
/* THE HALF THAT MATTERS MORE. A real declaration must survive a spelling nobody
   anticipated — the catalogue already writes three, and a fence tighter than its
   rule is an undeclared interface change wearing the costume of caution. */
console.log("\n--- 3. over-strictness: a real declaration in any spelling ---");
const D1 = ID(902, 1), D2 = ID(902, 2), D3 = ID(902, 3), D4 = ID(902, 4),
      D5 = ID(902, 5), D6 = ID(902, 6), D7 = ID(902, 7);
t("the family-row spelling", declaredCheckIds(`const R = { check: '${D1}' };\n`), [D1]);
t("the finding-factory spelling", declaredCheckIds(`findings.push(f('${D2}', 'error', 'x'));\n`), [D2]);
t("the QUOTED OBJECT KEY spelling (the retirements table's)",
  declaredCheckIds(`const T = { '${D3}': { retired: '2026-01-01' } };\n`), [D3]);
t("a bare ARRAY LITERAL — no shape anybody wrote a matcher for",
  declaredCheckIds(`export const A = ['${D4}'];\n`), [D4]);
t("a TEMPLATE literal, interpolation and all",
  declaredCheckIds("const m = `refused by " + D5 + " at ${site}`;\n"), [D5]);
t("a double-quoted default parameter",
  declaredCheckIds(`function g(id = "${D6}") { return id; }\n`), [D6]);
t("a Map entry across lines",
  declaredCheckIds(`const M = new Map([\n  [\n    '${D7}',\n    1,\n  ],\n]);\n`), [D7]);

/* ============================ 4. THE SCANNER ITSELF ======================== */
/* A comment opener that is not one, and a string that is. These are the inputs a
   naive `replace(/\/\*[\s\S]*?\*\//g, "")` gets wrong, and getting them wrong
   would DELETE declarations rather than prose — the dangerous direction. */
console.log("\n--- 4. the scanner: openers that are not openers ---");
const S1 = ID(903, 1), S2 = ID(903, 2), S3 = ID(903, 3), S4 = ID(903, 4);
t("a `//` inside a string does not start a comment",
  declaredCheckIds(`const u = "https://example.invalid"; const c = '${S1}';\n`), [S1]);
t("a block-comment opener inside a string does not open a comment",
  declaredCheckIds(`const s = "${OPEN} not a comment"; const c = '${S2}';\n`), [S2]);
t("a division is not a regex literal",
  declaredCheckIds(`const q = (a) / (b); const c = '${S3}';\n`), [S3]);
t("a real regex literal containing a slash does not swallow the next declaration",
  declaredCheckIds(`const re = /a\\/b/g; const c = '${S4}';\n`), [S4]);
t("codeOnly preserves length, so offsets and line numbers still address the same place",
  (() => { const src = `${OPEN} ${ID(903, 9)} ${CLOSE}\nconst c = 1;\n`; return codeOnly(src).length === src.length; })(), true);
t("codeOnly preserves newlines, so a line number is still a line number",
  (() => { const src = `${OPEN} a\n b\n c ${CLOSE}\nconst c = 1;\n`;
           return codeOnly(src).split("\n").length === src.split("\n").length; })(), true);

/* ============================ 5. BOTH WORD BOUNDARIES ===================== */
console.log("\n--- 5. the boundaries ---");
const B1 = ID(904, 1), B10 = ID(904, 10), B18 = ID(904, 18);
t("a one-digit member is NOT credited by its family's tenth", namesCheckId(B1, `const x = "${B10}";`), false);
t("nor by its family's eighteenth", namesCheckId(B1, `const x = "${B18}";`), false);
t("it IS credited by itself", namesCheckId(B1, `const x = "${B1}";`), true);
t("and by itself ending a sentence in a message string",
  namesCheckId(B1, `const m = "refused under ${B1}.";`), true);
t("the tenth is credited by itself and not by the one-digit member",
  [namesCheckId(B10, `"${B10}"`), namesCheckId(B10, `"${B1}"`)], [true, false]);
/* The LEFT boundary, and it is the one that put a phantom in this repository's
   catalog: a decision id of the same dotted form ENDS with a check id's bytes. */
const FOREIGN = "DEC" + "-" + "905.6";
t("a foreign-namespace id is not harvested as a check",
  declaredCheckIds(`const d = "${FOREIGN}";\n`), []);
t("and it is not reported as prose-only either — it was never an id",
  proseOnlyCheckIds(`${OPEN} ${FOREIGN} ${CLOSE}\n`), []);
t("nor does it CREDIT the check whose bytes it ends with",
  namesCheckId(ID(905, 6), `const d = "${FOREIGN}";`), false);

/* ============================ 6. THE EMPTY-CORPUS TRAP ==================== */
console.log("\n--- 6. an empty corpus is not a clean one ---");
t("a file of nothing but prose declares NOTHING and says so",
  [declaredCheckIds(`${OPEN} ${ID(906, 1)} ${ID(906, 2)} ${CLOSE}\n`).length,
   proseOnlyCheckIds(`${OPEN} ${ID(906, 1)} ${ID(906, 2)} ${CLOSE}\n`).length], [0, 2]);
t("an EMPTY file declares nothing and reports nothing — no phantom either way",
  [declaredCheckIds("").length, proseOnlyCheckIds("").length], [0, 0]);

console.log(`\ndeclared-corpus: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
