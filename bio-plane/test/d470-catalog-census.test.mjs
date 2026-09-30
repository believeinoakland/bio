/* D-470 — THE CATALOG'S VERSION IS PINNED TO THE CATALOG'S CHECK CENSUS.
 *
 * THE DEFECT, and it is a defect in the RECORD rather than in a feature
 * (SCHEDULER #17, 2026-09-24, on REC-188's worker's finding via CONDUCT #19): a
 * signed record that claims more precision than it holds. Every ratification
 * stamps `GATE_VERSION` — `plane-gate/1.0 (bio-checks <CATALOG_VERSION>)` — and
 * `src/gate.mjs` says in its own words why: *"the catalogue's own version records
 * what judged a bundle, and every ratification stamps it, so an action refused
 * here is distinguishable from one refused by 1.19.0 without reading this file."*
 * That sentence is only true while the version MOVES when the catalogue does.
 * `CATALOG_VERSION` sat at 1.20.0 (REC-23/D-130, 2026-09-18) while the catalogue
 * took C-41.10's acknowledgement arms (D-150), C-44.2 (`CASE_DERIVATION_CHECKS`,
 * IC-185), C-73.1 (`GOVERNING_LAW_CHECKS`, D-149) and others — so two different
 * catalogues stamped the same number, and a stranger reading `1.20.0` on two
 * ratifications cannot tell that the second was judged by a catalogue the first
 * one did not have. The stamp claimed a precision the record did not hold.
 *
 * THE DESIGN AUTHORITY is `BIO_Publication_v0_1.md` §3, under `architecture/`
 * (the document and the SECTION, which is what a citation names — CORPUS-STANDARD
 * §4.7. NEITHER THIS FILE NOR ITS CONTROL SPELLS A PATH UNDER THE DOCUMENTATION
 * DIRECTORY, OR A PATH UNDER THE REPOSITORY'S TOOL DIRECTORY, AND PUTTING ONE
 * BACK SILENTLY WIDENS A GATE. `gates.mjs`'s `docFacing()` (it sits beside the
 * other repository tools) reads a suite as DOC-FACING iff its SOURCE — COMMENTS
 * INCLUDED — contains either of those two directory prefixes, so ONE CITATION IN
 * PROSE enrols this suite in every prose-only gate run. Measured 2026-09-24: with
 * the documentation prefix spelled, a
 * MEASUREMENTS-only change selected 75 units against `statepaths.test.mjs`'s
 * ceiling of 74 and the gate went RED, naming this suite's own header. This
 * suite reads `checks/bio-checks.mjs` and `src/gate.mjs` and no prose at all, so
 * doc-facing is the WRONG answer and the citation is what was wrong, not the
 * ceiling. That `docFacing` credits a MENTION rather than a READ is a real defect
 * of its own — D-277's class, one instrument over — and it is REPORTED rather
 * than fixed here, because widening this row to the gate's classifier is not
 * this row's to take.)
 * §3 is the case document's gate stamp: rule 12 (c) — every assertion stays under a
 * signature, each in one place, and the record claims neither more nor less —
 * and §3 rule 10's stranger, who rebuilds and verifies without this instance).
 * The BUMP follows REC-14's precedent as `gate.mjs` records it: 1.18.0 -> 1.19.0
 * was MINOR, and so was 1.19.0 -> 1.20.0, for a change that made the catalogue
 * refuse documents that used to pass. This is the same class, and the bump is
 * MINOR: 1.20.0 -> 1.21.0, 1.21.0 -> 1.22.0 at c20-batch13, 1.22.0 -> 1.23.0 at
 * c20-batch14 and 1.23.0 -> 1.24.0 at the union of D-507 and D-508 (CONDUCT #20, c20-batch22; all below).
 *
 * WHAT THE CENSUS IS. The set of C-numbers THIS CATALOGUE HOLDS, taken from
 * `checks/bio-checks.mjs` by two sources that are unioned and never subtracted:
 *
 *   (S1) THE DECLARED TABLES, read at RUNTIME from the module's own exports —
 *        every exported object whose values carry a `check` string shaped like a
 *        C-number. That is `CASE_DOCUMENT_FAMILY` and all 51 `*_CHECKS` families.
 *        It is read from the LIVE MODULE rather than from the source text, so a
 *        family written in any spelling at all is counted.
 *   (S2) THE LITERAL EMISSION SITES — every `f('C-n.m', …)` in the catalogue's
 *        CODE, the source with its comments removed. `f` is the catalogue's one
 *        finding constructor, so this is where a check that belongs to no family
 *        table (C-1.1 … C-26.7, the bundle catalogue's own) is declared.
 *
 * WHAT THE MATCHER CAN AND CANNOT SEE, stated plainly because a census that does
 * not say this cannot be told from a walk looking in the wrong place:
 *   - IT SEES a check declared in any exported table, under any name, and a
 *     check emitted at a literal `f(` site in any whitespace spelling (A6).
 *   - IT DOES NOT SEE a C-number that appears only in PROSE — and must not (A7).
 *   - IT DOES NOT RESOLVE a `f(` site whose first argument is computed. Those are
 *     not guessed at: every such SPELLING is enumerated below with the table it
 *     relays, and a spelling this suite has not accounted for FAILS A2 rather
 *     than being silently scored zero. All four today relay a declared table:
 *     `C41.*` is `CASE_DOCUMENT_FAMILY`, `row.check` is `BASIS_VERSION_CHECKS`
 *     and `SUGGEST_CHECKS`, and `checkId` is `checkLegExtentGrammar`'s parameter
 *     — whose callers pass 'C-2.8' and, FROM `src/store.mjs`, 'C-25.10', which is
 *     declared as `BASIS_VERSION_CHECKS.VERSION_LEG_NOT_CITABLE`. So every
 *     computed site's id is already in S1, and the census loses nothing.
 *   - IT CANNOT SEE a check the plane emits from OUTSIDE the catalogue file. The
 *     census is a census OF THE CATALOGUE, which is what `CATALOG_VERSION` names.
 *
 * HOW A LIAR WOULD MAKE EACH ARM GREEN, and what refuses it:
 *   - Add a check and say nothing -> A3 goes RED and names the ids added. To get
 *     green the liar must record a census entry, and an entry is keyed on
 *     `CATALOG_VERSION`, so recording one under the SAME version collides with
 *     that version's existing entry (A3 compares against it) — the only quiet
 *     path is to MOVE the version, which is the act this row exists to force.
 *   - Add a check in a spelling the matcher cannot resolve -> A2 goes RED naming
 *     the spelling. The census never scores an unreadable site as zero.
 *   - Rewrite a PAST version's recorded entry to launder the present one -> A4
 *     goes RED: two recorded versions may not carry the same census, which is
 *     THIS ROW'S DEFECT INVERTED.
 *   - Move the version and leave the table alone -> A3 goes RED: no entry.
 *   THE LIMIT, and it is not hidden: an actor who edits BOTH `gate.mjs` and this
 *   table in one turn is not refused by any arm here, because the pin is a record
 *   of intent, not a proof of it. What the pin removes is the SILENT path — a
 *   check landing with the stamp unmoved and nothing turning red — which is how
 *   1.20.0 came to stamp two catalogues.
 *
 * NEGATIVE CONTROL: the five arms live in `test/d470-catalog-census.control.mjs`
 * and are re-run in one step with `node test/d470-catalog-census.control.mjs [arm]`
 * from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others
 * held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified
 * by sha256, by content AND by `cmp`, with the byte count printed and a minimum
 * guarded. A missing tally is -1, never 0. Declared before the first run:
 * (a) BASELINE — nothing armed; every arm GREEN, which is what distinguishes
 * five-arms-working from five-arms-broken. (b) ADD A CHECK WITHOUT MOVING THE
 * VERSION — THE ROW'S OWN NAMED CONTROL: one new row in `GOVERNING_LAW_CHECKS`;
 * A3 MUST FAIL BY NAME and nothing else may move. (c) ADD A CHECK AT AN
 * UNRESOLVABLE EMISSION SITE — `f(NEW_FAMILY.THING, …)` in `checkBundle`; A2 MUST
 * FAIL BY NAME, and A3 MUST NOT, because the id is unreadable rather than
 * missing and the two facts are different. (d) MOVE THE VERSION AND LEAVE THE
 * TABLE — `CATALOG_VERSION` to 1.99.0; A3 and A5 MUST FAIL BY NAME. (e)
 * OVER-STRICTNESS — correct work in a spelling this suite did not anticipate: an
 * existing literal emission site rewritten with its arguments across lines; every
 * arm MUST STAY GREEN. ALL FIVE ARMS RUN 2026-09-24 by the D-470 worker; 5 of 5
 * AS DECLARED (baseline 9 pass 0 fail; (b) 8/1, A3 alone; (c) 8/1, A2 alone, A3
 * green; (d) 7/2, A3 and A5; (e) 9/0, green). The per-arm figures and the restore
 * digests are at the foot of the driver.
 * RE-RUN IN FULL 2026-09-24 at c20-batch13 (CONDUCT #20) AFTER MOVING THIS
 * SUITE'S SUBJECT — the catalogue version 1.21.0 -> 1.22.0, its census row and
 * the C41.DISCLOSURES relay — because a control coupled to the old constant can
 * be disarmed by the very edit it is meant to guard, and arm (d)'s needle IS
 * that constant. 5 OF 5 AS DECLARED, unchanged in shape: baseline 9/0; (b) 8/1,
 * A3 alone; (c) 8/1, A2 alone; (d) 7/2, A3 and A5; (e) 9/0. Every restore
 * verified by sha256, by content and by `cmp` (gate.mjs 10,338 B; bio-checks.mjs
 * 917,688 B), driver exit 0. The arms are the same arms — what moved was the
 * figure they are armed against, which is the distinction this file is about.
 * RE-RUN IN FULL AGAIN 2026-09-24 by D-507, for the same reason and after the same
 * kind of edit — the catalogue version 1.23.0 -> 1.24.0, its census row, and the
 * six C-82.2..C-82.7 rows the bump is for. Arm (d)'s needle IS that constant, so a
 * control coupled to the old literal would have stopped arming silently; it was
 * moved with it. 5 OF 5 AS DECLARED, unchanged in shape: baseline 9/0; (b) 8/1, A3
 * alone; (c) 8/1, A2 alone; (d) 7/2, A3 and A5; (e) 9/0. Every restore verified by
 * sha256, by content and by `cmp`, driver exit 0.
 * (f) ADDED BY D-450, 2026-09-25 — A CHANGED-CHECK ENTRY THAT DOES NOT SAY WHAT
 * CHANGED: `changed` stripped from 1.29.0, whose census equals 1.28.0's because
 * C-41.12 changed and nothing was added; A4 MUST FAIL BY NAME and nothing else.
 * RE-RUN IN FULL 2026-09-25 by D-450 after moving this suite's subject (1.28.0 ->
 * 1.29.0, A4's collision key widened to census + `changed`, arm (d)'s needle moved
 * with the constant): 6 OF 6 AS DECLARED — baseline 9/0; (b) 8/1; (c) 8/1; (d) 7/2;
 * (e) 9/0; (f) 8/1, A4 alone. Every restore verified by sha256, by content and by
 * `cmp`, driver exit 0.
 * (g)-(k) ADDED BY M0-195, 2026-09-25 — THE SOURCE PIN (A9), rule 17's backstop for a CHANGED check, declared
 * before the first run: (g) THE ROW'S OWN NAMED CONTROL — C-15.1's body edited ('error' -> 'warning'), no id
 * moved, no census row: A9 MUST FAIL BY NAME, alone (A3 cannot see it, which is the defect). (h) ACCEPTS-WHEN —
 * the same edit under a NEW version whose row declares `changed: ["C-15.1"]` and the source THE SUITE PRINTED
 * on the armed tree: every arm GREEN. (i) OVER-STRICTNESS — comment-only edits to the REAL catalogue (a line
 * comment on its own line, a trailing one, a block comment across lines inside the call): every arm GREEN.
 * (j) a behaviour-free code edit (`void 0;`) declared `behaviour: "unchanged"` against the printed digest under
 * the SAME version: every arm GREEN. (k) OVER-STRICTNESS FOR A4's widening — C-41.12 changed AGAIN at a later
 * version with nothing added, a different source: GREEN (before M0-195 A4 would call it a collision). Arms
 * (b) and (c) now ALSO fail A9 — adding a row or an emission site is a code edit — and are re-declared so.
 * RUN IN FULL 2026-09-25 by M0-195 on origin/main 5e8a65a8 + this change: 11 OF 11 AS DECLARED — baseline
 * 13/0; (b) 11/2, A3+A9; (c) 11/2, A2+A9; (d) 11/2, A3+A5; (e) 13/0 (a check re-laid across lines leaves the
 * source digest unmoved); (f) 12/1, A4; (g) 12/1, A9 ALONE; (h) 13/0; (i) 13/0; (j) 13/0; (k) 13/0. Every
 * restore verified by sha256, by content and by `cmp` (bio-checks.mjs 1,006,173 B; gate.mjs 24,856 B; this
 * file 50,959 B at the run, before this record was written), driver exit 0.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { transformSync, version as ESBUILD_VERSION } from "esbuild";   /* M0-195: the parser behind `behaviourSource` */

const DIR = dirname(fileURLToPath(import.meta.url));
const CATALOG = join(DIR, "..", "checks", "bio-checks.mjs");

/* Everything this suite prints is TEED into `printed`, so A8 measures the OUTPUT
   rather than comparing a literal with itself — an equality that costs nothing to
   produce is not evidence (CLAUDE.md §5). Delete the limit's console.log and A8
   goes red. */
const printed = [];
const say = (...xs) => { printed.push(xs.join(" ")); console.log(...xs); };

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}`);
  if (!ok) console.log(`          got:  ${JSON.stringify(got)}\n          want: ${JSON.stringify(want)}`);
};

const C_NUMBER = /^C-\d+\.\d+[a-zA-Z]*$/;

/* Comments stripped OUTSIDE string and template literals, so a C-number written
   in prose is not counted as a check (A7). A regex literal is not tokenised:
   the only way it could confuse this scanner is by opening with `//` or `/*`,
   neither of which is a legal way to start one. */
export function codeOnly(src) {
  let out = "", i = 0; const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === "'" || c === '"' || c === "`") {
      const q = c; out += c; i++;
      while (i < n) {
        if (src[i] === "\\") { out += src[i] + (src[i + 1] ?? ""); i += 2; continue; }
        out += src[i];
        if (src[i] === q) { i++; break; }
        i++;
      }
      continue;
    }
    if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === "/" && src[i + 1] === "*") { i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; out += " "; continue; }
    out += c; i++;
  }
  return out;
}

/* M0-195 — THE CATALOGUE'S BEHAVIOUR SOURCE: the file with everything that cannot change what a check does taken
   out, so its digest moves on a CODE edit and stays put on a COMMENT edit (rule 17's backstop, BOB #35).
   HOW COMMENTS ARE STRIPPED: not by a scanner of our own but by a real JavaScript PARSER — esbuild's, from this
   package's lockfile — which parses the module and prints it back with `minifyWhitespace` and no comments
   (`legalComments: "none"`). Because it is a parse, a `//` inside a string, a template or a regex is code, and
   a comment anywhere is gone; because it is a print, layout is gone too — indentation, a check's arguments
   re-laid across lines, and blank lines — and automatic semicolon insertion is RESOLVED by the parser, so a
   line break that changes what ASI inserts changes the print while one that does not, does not. Nothing is
   renamed or folded (whitespace minification only), so every token of code survives into the digest.
   So: A COMMENT-ONLY EDIT DOES NOT MOVE THE DIGEST (A11 and control arm (i) prove it on the real file), and an
   edit to any token of code does. What the print ALSO normalises, and is therefore also invisible: a string's
   quote style and a number's spelling (`1.0` / `1`), which change no behaviour. What it can move WITHOUT a code
   edit: an esbuild upgrade that prints differently — loud, never silent, and answered by a `behaviour:
   "unchanged"` declaration; the version in use is printed beside the digest. A `@__PURE__`-style
   annotation esbuild keeps is the one kind of comment that can move it. */
export function behaviourSource(src) {
  return transformSync(src, { loader: "js", format: "esm", minifyWhitespace: true, legalComments: "none" }).code;
}

/* Every call of the catalogue's one finding constructor. `\s*` after `f(` is what
   makes the arguments' LAYOUT irrelevant (A6); the lookbehinds keep `f`'s own
   declaration and any `.f(`/`xf(` out. */
const EMIT = /(?<![A-Za-z0-9_$.])(?<!function )f\(\s*('C-\d+\.\d+[a-zA-Z]*'|[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*)\s*,/g;

export function emissionSites(src) {
  const literal = new Set(), computed = new Map();
  for (const m of codeOnly(src).matchAll(EMIT)) {
    const a = m[1];
    if (a.startsWith("'C-")) literal.add(a.slice(1, -1));
    else computed.set(a, (computed.get(a) || 0) + 1);
  }
  return { literal, computed };
}

export function declaredTables(mod) {
  const tables = new Map();
  for (const [name, v] of Object.entries(mod)) {
    if (!v || typeof v !== "object" || Array.isArray(v)) continue;
    const ids = Object.values(v)
      .filter((r) => r && typeof r === "object" && typeof r.check === "string" && C_NUMBER.test(r.check))
      .map((r) => r.check);
    if (ids.length) tables.set(name, ids);
  }
  return tables;
}

const digestOf = (ids) => createHash("sha256").update([...ids].sort().join("\n")).digest("hex");

/* ------------------------------------------------------------------------ *
 * THE PIN. One entry per version of the catalogue, keyed on the version the
 * stamp carries. AN ENTRY IS NEVER REWRITTEN: it records what a ratification
 * stamped with that number was judged by, and a ratification is not walked back
 * (BIO_Publication_v0_1.md §3 rule 1). A new check moves `count` and `digest`,
 * A3 goes red, and the only quiet way to green is a MINOR bump here and in
 * `src/gate.mjs`.
 *
 * 1.21.0 (D-470, 2026-09-24): the first census taken. It is NOT a claim that the
 * catalogue changed at this bump — it is the bump that makes the number mean
 * something from here on, and 1.20.0 is deliberately absent because nobody
 * measured the catalogue it stamped and inventing that figure now would be the
 * defect this row is closing, wearing the other face.
 *
 * 1.23.0 (CONDUCT #20, c20-batch14, 2026-09-24): THE SECOND MOVE, and it is the same
 * arm doing the same job one integration on. c20-batch13 and c20-integ1b had each
 * re-done the c19-batch10 + `main` union independently; c20-integ1b carried D-64,
 * whose `RENDER_CAPTURE_CHECKS` family (C-83.1 to C-83.7) the census at 1.22.0 had
 * never seen. At this union A3 went red naming both figures and the exact line to
 * write, and this is that line: 445 and its digest, from what THIS SUITE PRINTED on
 * the merged tree, never 438 + 7. SEVEN ARRIVALS, NO DEPARTURES, so the bump is
 * ADDITIVE and MINOR on the precedent below. 1.21.0's and 1.22.0's rows STAY: each is
 * what the catalogue held at that version, and a ratification is not walked back.
 *
 * 1.22.0 (CONDUCT #20, c20-batch13, 2026-09-24): THE FIRST MOVE THIS CENSUS
 * FORCED, and it is the arm working rather than the arm being maintained. D-470
 * measured 433 on ITS OWN BASE; the other side of this integration,
 * c20-batch11fix, had grown the catalogue while standing at 1.20.0 with no
 * census suite on it to notice. At the union A3 went red naming both figures and
 * the exact line to write, and this is that line: 438, from the digest THIS
 * SUITE PRINTED on the merged tree, never arithmetic on 433. FIVE ARRIVALS, NO
 * DEPARTURES — C-32.19, C-41.13, C-71.8, C-71.9 and C-78.2 — so the bump is
 * ADDITIVE and MINOR on the same precedent as the one above. 1.21.0's row STAYS:
 * it is what the catalogue held at that version and A4 needs both to mean
 * anything. (A4's own arm confirms the two censuses differ, which they do.)
 * ------------------------------------------------------------------------ */
const CATALOG_CENSUS = {
  "1.21.0": { count: 433, digest: "7e1c85cd94bffdf2140d52e6269b6a1178d3dbc76c40f8ec1b870b5626293e02" },
  /* 1.22.0 (CONDUCT #20, c20-batch18): D-484's C-33.40/C-33.41, from this suite's own print. */
  "1.22.0": { count: 435, digest: "a388b6427a3c28ee399c62b7f709e38ae95a65d1119f1dbb32fd7ea25f77bb35" },
  /* 1.23.0 (CONDUCT #20, c20-batch14, 2026-09-24): THE UNION'S OWN catalogue, 447 checks, from THIS SUITE'S
     OWN PRINT on the merged tree and never arithmetic. 433 (origin/main's 1.21.0) + FOURTEEN arrivals, no
     departures: c20-batch11fix's five (C-32.19, C-41.13, C-71.8, C-71.9, C-78.2), c20-integ1b's seven (D-64's
     C-83.1..7) and origin/main's two (D-484's C-33.40, C-33.41). ADDITIVE, so the bump stays MINOR.
     **c20-batch13's 1.22.0 = {438, 1cce052a…} IS DROPPED HERE AND THE ROW ABOVE IS origin/main's {435,
     a388b642…}**: that branch wrote a 1.22.0 for ITS union and the number never reached `main`, which then
     published a different catalogue under it. ONE VERSION NAMES ONE CATALOGUE, which is this table's whole
     rule, so the landed row stands and this union takes the next number. */
  "1.23.0": { count: 447, digest: "3309735d2983f422ff63ba8491b6fcd3e350e1642de29716bb578dc8077ab9da" },
  /* 1.24.0 (D-507, 2026-09-24, branch land/worker/D-507): THE THIRD MOVE. The catalogue took six rows
     in an EXISTING family — C-82.2..C-82.7 in STATEMENT_ACK_CHECKS, the six `acknowledgeStatement`
     refusals that reached a member with no canned translation — so 447 -> 453. ADDITIVE and MINOR on
     the precedent below: no check moved and none left, and nothing that passed now fails. Taken from
     THIS SUITE'S OWN PRINT on the item's tree over origin/main 68fecb8d, never computed by hand.
     1.21.0's, 1.22.0's and 1.23.0's rows STAY: each is the census of the catalogue that stamped it. */
  /* 1.24.0 (D-508, 2026-09-24): the doorbell's two rate refusals — C-85.1 RATE_IP and C-85.2
     RATE_GLOBAL, the new KNOCK_CHECKS family — take catalogue rows, so the census is 449 and its
     digest is the one THIS SUITE PRINTED on the item's tree over origin/main 68fecb8d0, never 447 + 2.
     TWO ARRIVALS, NO DEPARTURES, so the bump is ADDITIVE and MINOR on the precedent above. 1.21.0's,
     1.22.0's and 1.23.0's rows STAY: each is what the catalogue held at that version, and a
     ratification is not walked back. D-507 moves the same constant and writes a row of its own in
     parallel; ONE VERSION NAMES ONE CATALOGUE (A4), so at integration CONDUCT takes the next number
     once and records the census THIS SUITE PRINTS on the merged tree — the figure below is this
     branch's catalogue and is not the union's. */
  /* 1.24.0 AT THE UNION (CONDUCT #20, c20-batch22): D-507's 453 and D-508's 449 were each ONE
     branch's catalogue and neither reached main; ONE VERSION NAMES ONE CATALOGUE (A4), so the union takes
     1.24.0 once, and its count and digest are THIS SUITE'S OWN PRINT on the merged tree. Both branch rows
     above are DROPPED (their comments kept as history). */
  "1.24.0": { count: 455, digest: "df931d73139465e12a67becf836b16e892f8e809350a2ab104c482a4b8f6be91" },
  /* 1.24.0 (REC-211, 2026-09-24): IC-273's two arrivals — C-33.42 NO_DEFINITION_VERSION and C-33.43
     DEFINITION_MOVED, `op=proposedispose` binding the definition version the member SAW. 449, FROM
     THIS SUITE'S OWN PRINT on this tree and never 447 + 2: the figure is a measurement of the
     catalogue that is here, and the arithmetic would agree with it for free. TWO ARRIVALS, NO
     DEPARTURES, so the bump is MINOR on the rule above. */
  /* 1.25.0 AT THE SECOND UNION (CONDUCT #20, c20-batch23): REC-211's 449 was ITS branch's 1.24.0 and main's 1.24.0
     is already the D-507 + D-508 catalogue (455). ONE VERSION NAMES ONE CATALOGUE (A4), so the union takes the NEXT
     number, MINOR (two arrivals, no departures), and its count and digest are THIS SUITE'S OWN PRINT on the merged
     tree. REC-211's branch row is DROPPED (its comment kept as history). */
  "1.25.0": { count: 457, digest: "b333cf2716ad870d295d9373e081076a15e1a7543e1beda28ab312fad77ca3c5" },
  /* 1.24.0 (D-491, 2026-09-24, branch land/worker/D-491): ONE arrival, no departures —
     C-28.16 CAPTURE_REQUEST_RENDER_MALFORMED in CAPTURE_REQUEST_CHECKS, the door's refusal
     of a `render` flag that is neither true nor absent (IC-276). 448 and the digest below
     are THIS SUITE'S OWN PRINT on the item's committed tree, never 447 + 1: the count and
     the digest are two facts and only one of them is arithmetic. ADDITIVE, so the bump stays
     MINOR. 1.23.0's row STAYS — it is what the catalogue held at that version, and A4 needs
     both rows to mean anything. IF A CONCURRENT ITEM ALSO TOOK 1.24.0 (D-490, D-492 and
     D-499 were in render and capture code the same night), the integrator re-reads this
     suite's print on the union and this row takes the next number: ONE VERSION NAMES ONE
     CATALOGUE is this table's whole rule. */

  /* 1.26.0 AT THE THIRD UNION (CONDUCT #20, c20-batch25): D-491's C-28.16 over 1.25.0's 457; its branch row (1.24.0 = 448) DROPPED, comment kept; count and digest are THIS SUITE'S PRINT on the merged tree. */
  "1.26.0": { count: 458, digest: "c7acb768bfd46e72469e9f414b2bc94151a911c6b479ffaa6ed07a9a2df82f65" },
  /* 1.24.0 (D-472, 2026-09-24, WORKER D-472 under CONDUCT #20, branch land/worker/D-472): TWO ARRIVALS,
     NO DEPARTURES — C-48.8 and C-48.9, `op=monitor`'s own two Drive-shell refusals, which are NOT
     `op=acquire`'s C-48.5/C-48.7 firing from a second site (a capture that meets the shell has captured
     nothing; a TICK that meets it has lost the CHECK, and one canned sentence cannot be true of both).
     447 -> 449, count AND digest from THIS SUITE'S OWN PRINT on this tree, never arithmetic on 447.
     1.23.0's row STAYS: it is what the catalogue held at that version, and A4 needs both to mean anything.
     **IF ANOTHER BRANCH IN THE SAME BATCH ALSO ADDS ROWS, THIS ROW IS NOT THE UNION'S: CONDUCT takes the
     next number and re-reads the census from this suite's print on the merged tree.** */

  /* 1.27.0 AT THE UNION (CONDUCT #20, c20-batch25): D-472's rows over 1.26.0; its branch row DROPPED, comment kept; count and digest are THIS SUITE'S PRINT on the merged tree. */
  "1.27.0": { count: 460, digest: "f77e4fba4cfc5ad7e58511b035cae4584a8643bb8c9d9c2718ffbb208d24cc75" },
  /* D-510 (2026-09-24): 1.23.0 -> 1.24.0, MINOR — one check ADDED and none changed or removed: C-86.1,
     `ENVELOPE_TYPE_DISAGREES`, the one row of the new PROMOTED_TYPE_CHECKS family. The count and the digest
     are THIS SUITE'S OWN PRINT on the item's tree over origin/main e9b21be6, never computed by hand.
     CONDUCT reconciles the VERSION at integration if another branch takes 1.24.0 first; the census is the
     catalogue's and moves with it. */

  /* 1.28.0 AT THE UNION (CONDUCT #20, c20-batch25): D-510's rows over 1.27.0; its branch row DROPPED, comment kept; count and digest are THIS SUITE'S PRINT on the merged tree. */
  "1.28.0": { count: 461, digest: "3c28396e5c9e7c561a01625f9fe1f2965799f661b0d9a595d3ae752e21c61d89" },
  /* 1.26.0 (D-463, 2026-09-24, REBASED onto main @ 1a7f0bcc): TWO ARRIVALS, no departures — C-78.3
     NAMESPACE_CONFINED and C-29.10 AI_CONFINEMENT_NOT_SCRATCH, the confined-credential item's own rows.
     457 -> 459, the count AND the digest taken from THIS SUITE'S OWN PRINT on the rebased tree and never
     arithmetic (the digest cannot be computed by hand, which is why it is pinned beside the count).
     **THIS BRANCH'S OWN 1.24.0 = {449, 3821d157…} IS DROPPED:** it was the census of this item's rows over
     the OLD base e9b21be6, and main has since published a different catalogue under 1.24.0 (D-507 + D-508)
     and another under 1.25.0 (REC-211). ONE VERSION NAMES ONE CATALOGUE, which is this table's whole rule,
     so the landed rows stand and this item takes the next number. */

  /* 1.29.0 AT THE UNION (CONDUCT #20, c20-batch27): D-463's rows over 1.28.0; its branch row DROPPED, comment kept; count and digest are THIS SUITE'S PRINT on the merged tree. */
  "1.29.0": { count: 466, digest: "82d13f0339c9228ff961949ec5e5f804d77c27a7e8aabd8d4f401bad4ba2e8e6" },
  /* 1.31.0 (REC-150, 2026-09-25, branch land/worker/REC-150): the C-95 family (§7.14's request to join) over 1.29.0,
     466 -> 475, nine arrivals and no departures. 1.30.0 is skipped because c21-batch28 holds it for another catalogue.
     Count and digest are THIS SUITE'S OWN PRINT on the item's tree, never 466 + 9. */
  /* REC-150 side, kept as history (branch row DROPPED at c22-batch29; CONDUCT takes the union's number once and re-reads
     count and digest from this suite's print): "1.31.0": { count: 475, digest: "3f2a8c5d60fd03c79db5560e4818ece84983c3a18223cddb0acc77162c09085a" } */
  /* D-134 side, kept as history (branch row DROPPED at c22-batch29 — ours already holds "1.30.0" for the c21-batch28
     catalogue, and one version names one catalogue; CONDUCT takes the union's number once and re-reads count and digest
     from this suite's print): 1.30.0 (D-134, 2026-09-25): CUSTODIAL_CHECKS C-96.1-.9 over 1.29.0;
     "1.30.0": { count: 475, digest: "7792c2e9a57e10c68358c11e922932b08b9a42c2c2632959964d073e42037447" } */
  /* REC-219 side, kept as history (branch row DROPPED at c22-batch29 — ours already holds "1.30.0" for the c21-batch28
     catalogue; CONDUCT takes the union's number once and re-reads count and digest from this suite's print):
     1.30.0 (REC-219, 2026-09-25): TWO ARRIVALS, NO DEPARTURES — C-41.14 `CASE_DOCUMENT_FAMILY.PENDING` and C-41.15
     `CITATIONS` (D-579(a)) (§3 rule 18, BOB #34), 466 -> 468 over origin/main 964da679;
     "1.30.0": { count: 468, digest: "ce0367d3116f97e0947d02029ae42648b93e613f0f92bcc098197243d9758706" } */
  /* REC-203 side, kept as history (branch row DROPPED at c22-batch29 — ours already holds "1.30.0" for the c21-batch28
     catalogue; CONDUCT takes the union's number once and re-reads count and digest from this suite's print):
     1.30.0 (REC-203, 2026-09-25): THREE ARRIVALS, NO DEPARTURES — C-91.1, C-91.2 and C-91.3, `op=idmatch`'s
     IDSPACE_CHECKS, 466 -> 469 over origin/main 964da679;
     "1.30.0": { count: 469, digest: "6da20e8de085e334d03f8d97e3211365179d5b427ec92d5e01e1a6d6e65d7f8c" } */
  /* MK-7 side, kept as history (branch row DROPPED at c22-batch29 — ours already holds "1.30.0" for the c21-batch28
     catalogue; CONDUCT takes the union's number once and re-reads count and digest from this suite's print):
     1.30.0 (MK-7, 2026-09-25): TWELVE ARRIVALS, no departures — ATTRIBUTION_CHECKS, C-92.1..C-92.12, 466 -> 478;
     "1.30.0": { count: 478, digest: "7fb9adb53cb99f703ca909c8e27594906ee11ceac381b6e4d778f72e4370cf01" } */
  /* REC-147 side, kept as history (branch row DROPPED at c22-batch29 — ours already holds "1.30.0" for the c21-batch28
     catalogue; CONDUCT takes the union's number once and re-reads count and digest from this suite's print):
     1.30.0 (REC-147, 2026-09-25, branch land/worker/REC-147): C-93's seven candidate refusals over 1.29.0; count and
     digest are THIS SUITE'S PRINT on this branch's tree. At a union, re-read them from the merged tree's print. *\/
     "1.30.0": { count: 473, digest: "9582069bf3086b0cc1a5fda3e50b9535be332ce087565a1163a247ec7831d2d6" }, */
  /* 1.26.0 (D-513, 2026-09-24, branch land/worker/D-513): `op=knock`'s three pre-store refusals take
     rows in the EXISTING KNOCK_CHECKS family — C-85.3 KNOCK_ENVELOPE_TOO_LARGE, C-85.4
     KNOCK_PAYLOAD_TOO_LARGE, C-85.5 KNOCK_EMPTY — so 457 -> 460. THREE ARRIVALS, NO DEPARTURES, so the
     bump is ADDITIVE and MINOR on the precedent above. Count and digest are THIS SUITE'S OWN PRINT on
     the item's tree over origin/main 1a7f0bcc0, never 457 + 3. Every earlier row STAYS: each is the
     census of the catalogue that stamped it, and a ratification is not walked back. CONDUCT #20's
     c20-batch25 moves this same constant in parallel; ONE VERSION NAMES ONE CATALOGUE (A4), so at
     integration CONDUCT takes the next number once and records what THIS SUITE PRINTS on the merged
     tree — the figure below is this branch's catalogue and is not the union's. */

  /* D-513's rows ride 1.29.0 AT THE UNION (CONDUCT #20, c20-batch27) beside D-463's; its branch row (1.26.0) DROPPED, comment kept. */
  /* 1.29.0 (D-547, 2026-09-25, branch land/worker/D-547 over land/worker/D-526): ONE ARRIVAL, NO DEPARTURES —
     C-86.2 `REVISION_RETYPES_BUNDLE`, the second row of PROMOTED_TYPE_CHECKS. 461 -> 462, count AND digest from
     THIS SUITE'S OWN PRINT on this tree. Other branches also take 1.29.0: CONDUCT takes the next number at the
     union and re-reads this suite's print on the merged tree. */
  /* 1.29.0 (REC-217, 2026-09-24, branch land/worker/REC-217): C-44.3 PUBLISH_DRAFT_NOT_FOUND, C-44.4
     PUBLISH_DRAFT_NOT_THIS_CASE and C-44.5 PUBLISH_DRAFT_ALREADY_BOUND joined CASE_DERIVATION_CHECKS — the three
     refusals of a draft link that would be false (BIO_Publication §3 rule 13, BOB #33 19:14Z). THREE ARRIVALS, NO
     DEPARTURES. Count and digest are THIS SUITE'S PRINT on this branch; if another branch also took 1.29.0, the
     integrator re-reads the census on the union and one of them takes the next number. */
  /* 1.29.0 (D-448, 2026-09-24): C-87 REVIEW_COPY_CHECKS, the review copy's eleven refusals, over 1.28.0.
     1.28.0's row STAYS: each row is the census of the catalogue that stamped it. Count and digest are
     THIS SUITE'S OWN PRINT on the item's tree; CONDUCT re-reads both at integration, where neither
     branch's figure is the union's. */
  /* 1.29.0 (D-468, 2026-09-24): ONE arrival -- C-26.12 BIAS_ILLEGAL_TRANSITION, `op=promote` holding a bias
     set to the declared STATES edges read from its head. MINOR: one arrival, no departures. This item took
     1.26.0 over origin/main 1a7f0bcc0 and then MERGED a main already at 1.28.0 (whose own 1.26.0 row is a
     DIFFERENT catalogue), so the stamp moves once more and the count and digest are THIS SUITE'S OWN PRINT on
     the merged tree -- never either base's figure plus one. */
  /* 1.29.0 (REC-214, 2026-09-24, branch land/worker/REC-214): FIVE ARRIVALS, NO DEPARTURES — C-90.1..5, the
     RISK_TIER_REVISION_CHECKS family (`op=actionrisktier` and promote's RISK_TIER_REWRITTEN). 461 -> 466, count AND
     digest from THIS SUITE'S OWN PRINT on the item's tree over origin/main 9f8b69e6, never arithmetic. If another
     branch in the batch also adds rows, CONDUCT takes the next number and re-reads the census on the merged tree. */
  /* 1.29.0 (D-549): C-68.5 over 1.28.0; count and digest are THIS SUITE'S PRINT on base 9f8b69e6 plus D-549. */
  /* 1.29.0 (D-450, 2026-09-25, branch land/worker/D-450): NO ARRIVALS, NO DEPARTURES — ONE CHECK CHANGED.
     C-41.12 admits `null` for an axis nobody set (BIO_Publication_v0_1.md §3 rule 14, BOB #32 2026-09-23),
     so a one-axis bar that 1.28.0 refused now signs. Rule 17 moves the version for a CHANGED check too, and
     a census of ids cannot see a change, so the entry NAMES it in `changed` and A4 keys on census + changes
     (see A4). Count and digest are this suite's own print on the item's tree over origin/main 8bdf20e6.
     **IF ANOTHER BRANCH IN THE SAME BATCH TAKES 1.29.0, THIS ROW IS NOT THE UNION'S: CONDUCT takes the next
     number, re-reads count and digest from this suite's print on the merged tree, and CARRIES
     `changed: ["C-41.12"]` onto that entry.** */
  /* D-512 (2026-09-24, branch land/worker/D-512): 1.28.0 -> 1.29.0, MINOR — one check ADDED, none changed or removed:
     C-66.6 `REPLAY_UNVERIFIED` in SURFACE_CHECKS. Count and digest are THIS SUITE'S OWN PRINT on the item's tree over
     origin/main 9f8b69e6, never arithmetic on 461. CONDUCT re-reads it at the union if another branch adds rows. */
  /* 1.26.0 (REC-205, 2026-09-24, branch land/worker/REC-205): ONE arrival, C-33.44 CLASS_NOT_DISPOSED in
     ACT_SHAPE_CHECKS, and no departure — MINOR. The code was given a canned translation AT THE MINT rather
     than added bare to the 293 untranslated ones, which is why `check-refusal-codes`' `untranslated` floor
     did not move for this landing. Count and digest are THIS SUITE'S OWN PRINT on the item's tree. */
  /* 1.26.0 (REC-207, 2026-09-24, branch land/worker/REC-207): ten arrivals, no departures — C-26.13 to
     C-26.19 (the member's resolve of a bias debt) and C-33.45 to C-33.47 (the re-run link's three
     refusals at op=airunopen). MINOR on the rule above. The count and the digest below are THIS SUITE'S
     OWN PRINT on this tree and never 457 + 10: the figure is a measurement of the catalogue that is
     here, and the arithmetic would agree with it for free. */
  /* 1.29.0 (D-530, 2026-09-24): C-89.1 CAPTURE_HELD_IN_PARTS over 1.28.0; count and digest are THIS SUITE'S PRINT on the D-530 tree. */
  /* 1.29.0 (D-454, 2026-09-25, WORKER D-454, branch land/worker/D-454): ONE ARRIVAL, NO DEPARTURES — C-74.4
     CONNECTION_CHOICE_OCCURRENCE_UNNAMED. 461 -> 462, count AND digest from THIS SUITE'S OWN PRINT on the item's
     tree over origin/main 8bdf20e6. IF ANOTHER BRANCH IN THE SAME BATCH ALSO ADDS ROWS, THIS ROW IS NOT THE UNION'S. */

  /* 1.30.0 AT THE UNION (CONDUCT #21, c21-batch28): every branch row above that took 1.26.0 or 1.29.0 over its own
     base is DROPPED, its comment kept; the union's ONE new number holds all of them (REC-207's ids renumbered off
     D-468's C-26.12 and REC-205's C-33.44), and CARRIES D-450's `changed: ["C-41.12"]` as its note above asks.
     Count and digest are THIS SUITE'S PRINT on the merged tree. */
  /* THE SOURCE PIN (M0-195, 2026-09-25; rule 17 as BOB #35 folded it). `source` is the sha256 of the catalogue's
     BEHAVIOUR SOURCE (`behaviourSource` above — the file parsed and printed back without comments or layout, esbuild 0.25.12), so
     a check whose BODY changes under an unmoved version fails (A9) by name even though its number did not move.
     1.30.0's is THIS SUITE'S OWN PRINT on origin/main 5e8a65a8, and it IS 1.30.0's source: `git diff d5d437c46
     origin/main -- bio-plane/checks/bio-checks.mjs` is empty, d5d437c46 being the commit that set 1.30.0. No
     EARLIER version carries a `source`: nobody measured the code those versions stamped, and inventing it now
     would be the defect this table exists to close. An edit that moves `source` without changing what any check
     refuses or admits is recorded, under the SAME version, as
         unchanged: [{ source: "<the new print>", behaviour: "unchanged", by: "<the landing's id>" }]
     and anything else takes a new version, with `changed: [C-n.m, …]` naming the checks whose behaviour moved. */
  "1.30.0": { count: 502, digest: "b55afdc7fb1fbce736a34f447d2df960032900e099a15a8efe02e027d9f17d8f",
              changed: ["C-41.12"],
              source: "58c505cd178722403908de61287fbdfe60418b90b57f6cacf882f865a7766514" },
  /* 1.29.0 (D-520, 2026-09-25): C-83.8 RENDER_AT_CAPACITY added to RENDER_CAPTURE_CHECKS, none changed or removed. Count and
     digest are THIS SUITE'S OWN PRINT on the item's tree over origin/main 8bdf20e6. CONDUCT reconciles at the union. */
  /* D-520 side, kept as history (branch row DROPPED at c22-batch29; CONDUCT takes the union's number once and re-reads
     count and digest from this suite's print): "1.29.0": { count: 462, digest: "bbbbc10c8a9a3d179dd984d5c9bfb902dccc5b9fd91ba63a67edff5c6f4d0439" } */
  /* D-147 side, kept as history (branch row DROPPED at c22-batch29 — ours already holds "1.30.0" for the c21-batch28
     catalogue; CONDUCT takes the union's number once and re-reads count and digest from this suite's print):
     1.30.0 (D-147, 2026-09-25): ELEVEN ARRIVALS, NO DEPARTURES — C-94.1-11, LIFECYCLE_CHECKS, 466 -> 477 over
     origin/main 964da679;
     "1.30.0": { count: 477, digest: "b06cb8dce8d8ce12f4d719b0b8e44e8d1f78c7501fb1b803126870967bcb39f4" } */
  /* REC-186 side, kept as history (branch row DROPPED at c22-batch29 — its "1.29.0" is a different catalogue from ours'
     1.29.0; CONDUCT takes the union's number once and re-reads count and digest from this suite's print):
     1.29.0 (REC-186, 2026-09-25): C-33.48 LAST_OWNER_CANNOT_LEAVE joined ACT_SHAPE_CHECKS (BOB #31's ruling:
     op=projectleave refuses a project's only owner), 461 -> 462;
     "1.29.0": { count: 462, digest: "679731bf482feb496fa2c6fdd0443fc6d503cf8375b52cb6cf98142fd361d73a" } */
  /* REC-197 side, kept as history (branch row DROPPED at c22-batch29 — ours already holds "1.30.0" for the c21-batch28
     catalogue; CONDUCT takes the union's number once and re-reads count and digest from this suite's print):
     1.30.0 (REC-197, 2026-09-25, branch land/worker/REC-197, stacked on land/worker/REC-196 @ 82f604d2): TWO ARRIVALS,
     NO DEPARTURES — C-97.1 PROJECT_VISIBILITY_NO_OWNER and C-97.2 PROJECT_VISIBILITY_NOT_A_CREATION (a creation's
     `visibility`, BOB #32's ruling (b)). 466 -> 468, count AND digest from THIS SUITE'S OWN PRINT on the item's tree,
     never 466 + 2. 1.29.0's row STAYS. **IF ANOTHER BRANCH IN THE SAME BATCH ALSO ADDS ROWS, THIS ROW IS NOT THE
     UNION'S: CONDUCT takes the next number and re-reads the census from this suite's print on the merged tree.** *\/
     "1.30.0": { count: 468, digest: "78740e5c8072d6d694c354539ffa0f2d3d0924c3ecc8f38a4437fbb1953c09ad" }, */
  /* D-521b side, kept as history (branch row DROPPED at c22-batch29 — ours already holds "1.30.0" for the c21-batch28
     catalogue; CONDUCT takes the union's number once and re-reads count and digest from this suite's print):
     1.31.0 (D-521, 2026-09-25, branch land/worker/D-521b): NO ARRIVALS, ONE DEPARTURE. C-82.1
     STATEMENT_ACK_DOCUMENTS_OVER_BOUND is RETIRED: the read it guarded returns at most two rows by its keys, against
     a bound of 8, so no input could reach it. Rule 17 moves the version for a REMOVED check. A departure changes the
     census, so A4 needs no `changed` note. (M0-195's `changed:` grammar is not built; this row follows the table's
     current grammar, and the departure is named here in words.) MINOR: nothing that passed now fails. 502 -> 501,
     count AND digest from THIS SUITE'S OWN PRINT on the item's tree over origin/main 5e8a65a8, never arithmetic.
     If another branch in the batch also moves this constant, CONDUCT takes the next number and re-reads the
     census on the merged tree. *\/
     "1.31.0": { count: 501, digest: "398bfcff3bb62cdfefd1cac1c96deb94928ab20af1e07627de634a4474cab2ad" }, */
  /* D-563 side, kept as history (branch row DROPPED at c22-batch29 — ours already holds "1.30.0" for the c21-batch28
     catalogue; CONDUCT takes the union's number once and re-reads count and digest from this suite's print):
     1.31.0 (D-563, 2026-09-25, WORKER D-563, branch land/worker/D-563): TWO ARRIVALS, NO DEPARTURES, NONE CHANGED —
     C-86.3 ENVELOPE_TITLE_DISAGREES and C-86.4 ENVELOPE_STATE_DISAGREES. 502 -> 504, count AND digest from THIS SUITE'S
     OWN PRINT on the item's tree over origin/main 5e8a65a8; no `changed` field, because no existing check's rule moved
     (M0-195's grammar: `changed` names a CHANGED check, and this entry has none). IF ANOTHER BRANCH IN THE SAME BATCH
     ALSO MOVES THE VERSION, THIS ROW IS NOT THE UNION'S. *\/
     "1.31.0": { count: 504, digest: "0837d14bb242d7b5589152a2053642b701712145d469910fd6f15432640008e2" }, */
  /* D-561 side, kept as history (branch row DROPPED at c22-batch29 — ours already holds "1.30.0" for the c21-batch28
     catalogue; CONDUCT takes the union's number once and re-reads count and digest from this suite's print):
     1.31.0 (D-561, 2026-09-25, branch land/worker/D-561 over origin/main 5e8a65a8): the new PUBLISHED_READ_CHECKS
     family (C-98.1..8) and C-69.2 STORE_DID_NOT_ANSWER in DISPATCH_CHECKS — nine arrivals, none moved or removed,
     MINOR. 502 -> 511, count AND digest from THIS SUITE'S OWN PRINT on the item's tree. If another branch in the
     same batch also takes 1.31.0, the integrator re-reads the census on the union. *\/
     "1.31.0": { count: 511, digest: "b27f51ddb69af8ad9f5eacdbe45226c03573e5e947af4c88aab72da513cce243" }, */
  /* 1.31.0 AT THE UNION (CONDUCT #22, c22-batch29 union, 2026-09-25): every branch row above that took 1.29.0, 1.30.0
     or 1.31.0 over its own base is DROPPED, its comment kept; the union takes ONE number for the catalogue that runs.
     ARRIVALS (68): C-33.48 (REC-186); C-41.14, C-41.15 (REC-219); C-69.2 and C-98.1..8 (D-561); C-83.8 (D-520);
     C-86.3, C-86.4 (D-563); C-91.1..3 (REC-203); C-92.1..12 (MK-7); C-93.1..7 (REC-147); C-94.1..11 (D-147);
     C-95.1..9 (REC-150); C-96.1..9 (D-134); C-97.1, C-97.2 (REC-197). DEPARTURE (1): C-82.1, retired by D-521b.
     502 + 68 - 1 = 569, and that sum is NOT the figure: count, digest and source are THIS SUITE'S OWN PRINT on the
     merged tree (HEAD ee29c763 + the gate.mjs bump; esbuild 0.25.12). Arrivals and departures were read by
     diffing this suite's census of origin/main 5e8a65a8 against the merged tree.
     `changed` — EXISTING ids whose refusal or admission moved in this batch (rule 17 as BOB #35 folded it), each
     read at its site in `git diff origin/main..HEAD -- bio-plane/checks/bio-checks.mjs` and the emitting code:
       C-2.8   D-598: checkInheritedLeg reads only an INQUIRY entry as published, so `grade_source: inherited` on a
               leg whose target was published as EVIDENCE is now refused C-2.8 (it went to C-21.2's arms before);
       C-21.2  D-598: its inheritance arms no longer fire on a leg over published evidence (BOB #34);
       C-2.10  D-147: correspondenceFindings gained the LIFECYCLE arm (lifecycleFindings), new refusals under C-2.10;
       C-41.1  REC-219: bio-case-document/4 joins CASE_DOCUMENT_FORMATS_ACCEPTED — a /4 token it refused, it admits;
       C-41.13 REC-219: caseDocumentRequiresDisclosures answers yes for /4 as well as /3;
       C-53.10, C-53.11, C-53.12  MK-7: the publication fence NARROWED to an observation that still names its author
               in its own files (and what rests on one); every other observation crosses under C-92;
       C-70.3  REC-197: the value check moved into #visibilitySettingRefusal, which a project's creation or fork
               (op=promote's new `visibility`) also asks — a second door refused by the same row.
     NOT listed, read and judged wording-only (what is refused or admitted did not move): C-29.9 and C-38.7's
     translations (REC-162 — the same set refused, the sentence names the session), C-33.29..31's `where` (D-589's
     regions), C-2.8's earned-leg hint text ("the MEASUREMENTS ledger"). THE LIMIT: `changed` is read from the
     catalogue and the code at the sites named; a behaviour moved through a helper elsewhere is not seen here. */
  "1.31.0": { count: 569, digest: "d1e8a679256b530d49f955460b893064fdb2e6bea67f19a6b3f94a2684d592b0",
              changed: ["C-2.8", "C-2.10", "C-21.2", "C-41.1", "C-41.13", "C-53.10", "C-53.11", "C-53.12", "C-70.3"],
              source: "832fbe02962e8f75e5b75b28d6ab83a08d083c8124a864c5b5260110ad6ceda9" },
  /* 1.32.0 (PROMOTION #1, T3, 2026-09-26; K64, K66; recorded by legacy-tests, T3-4): NO ARRIVALS; C-4.2, C-17.2,
     C-18.8 and C-20.1 left `bio-checks.mjs` for `promotion`, whose gate runs them after `checkBundle` (src/gate.mjs's
     1.32.0 note), so THIS census, which is of the catalogue file, lost their ids (569 -> 566; one arm of C-4.2 stays
     in `checkStateLegality`, which C-2.6 needs). Count, digest and source are this suite's own print on the tranche. */
  "1.32.0": { count: 566, digest: "2bd1637d11ad4d0ab1643a5961aab700a02f8efdd68504c12d7d180353578c13",
              changed: ["C-4.2", "C-17.2", "C-18.8", "C-20.1"],
              source: "e6ee5523495cb692894222ab98a36e8adc8d11451076bc576f58b1c89dfbd8ff" },
  /* 1.33.0 (PROMOTION #2, T4-2b, 2026-09-27; recorded by legacy-tests, T4-5): six arrivals from LEGACY-CHECKS #1 (N44,
     N36): C-29.11, C-29.12, C-96.10, C-96.11, C-96.12, C-33.49; C-33.48 changed its code to LAST_COMMITTED_OWNER.
     Count, digest and source are PROMOTION #2's print of this suite on `job/T4/promotion` when it minted the version.
     PROVENANCE #1 (T4-2) then moved C-18.1, C-18.3, C-18.4 and C-18.9 out of the catalogue file (572 -> 568) with the
     version unmoved, so A3 names the census that has no version of its own (legacy-tests' T4 REPORT). */
  "1.33.0": { count: 572, digest: "86ddf728cfe6d389ec3ffb28cd31179cae70bc0f681c8f227c96eda70d95443b",
              changed: ["C-33.48"],
              source: "1513f4a898edc422ecff7efebfd2b029e38b899396981092c9d3f2061277e113" },
  /* 1.34.0 (PROMOTION #3, T5 layer 2, 2026-09-27, N86; recorded by legacy-tests, T5-12): NO ARRIVALS; C-18.1, C-18.3,
     C-18.4 and C-18.9 had left the catalogue file for `provenance` under 1.33.0 (572 -> 568). Count, digest and source
     are PROMOTION #3's print of this suite when it minted the version (its record). Kept although the tranche moved on
     to 1.35.0 before this row was pinned: ratifications were stamped 1.34.0 in between, and an entry is never
     rewritten or dropped. */
  "1.34.0": { count: 568, digest: "4f93c5f65a5d7444ca59f172ae598905f3c440fc9c5d0b222431335edc003f14",
              changed: [],
              source: "4fa025acf0d59e03324c294d5225adea40c826afaa031b1d8bb71dd6c76fff31" },
  /* 1.35.0 (PROMOTION #4, T5 layer 5, 2026-09-27, K150; recorded by legacy-tests, T5-12): NO ARRIVALS, forty-nine
     departures to their modules (C-42.1-.7 calibration, C-51.1-.5 extraction, C-91.1-.3 entities, C-33.26/.42/.43
     progressions, C-54.2-.10 observation-log, C-26.1-.11 and C-26.13-.19 bias, C-23.1, C-23.2, C-33.20, C-33.32
     retrieval: src/gate.mjs's 1.35.0 note), none changed (568 -> 519; digest as PROMOTION #4 printed it). The source
     is this suite's print on `tranche/T5` @ 7a2cc56e1f, after CONNECTIONS #1 moved the two pair predicates (C-49.1,
     C-49.2's code, not their rows) out of the file: PROMOTION #4's 18a61872... was measured before that merge. */
  "1.35.0": { count: 519, digest: "e4d92a7e563ee9a0052239476766b449021eee501a6d2d7547a2e53c370c56bf",
              changed: [],
              source: "32b7b0bb91da53a06a4a3e5c3549cee4d3a40a61f37847edff15802be03eb89b" },
  /* 1.36.0 (PROMOTION #5, T6 layer 2, 2026-09-27, LEGACY-CHECKS #2 REPORT 7; recorded by legacy-tests, LEGACY-TESTS #4,
     T7): THIRTY-ONE ARRIVALS, no departures, none changed (519 -> 550) — C-22.17, C-28.17, C-28.18, C-81.11-.14,
     C-102.1-.5, C-103.1-.7 and C-104.1-.12, named by diffing this suite's census on `tranche/T5` against
     `tranche/T6`; PROMOTION #5's own note counts 31, LEGACY-CHECKS #2's list names 30 and omits C-104.12, which the
     census holds. Count, digest and source are PROMOTION #5's print of this suite when it minted the version, re-measured
     identical on `origin/tranche/T6`. T7's extractions then took SIXTY-ONE rows out of the catalogue file with the
     version unmoved (550 -> 489; reevaluation's C-10.1 among them, which is also A1's one departed literal site), so
     A3 and A9 name the census that has no version of its own until CATALOG_VERSION moves (legacy-tests' T7 REPORT to
     promotion). */
  "1.36.0": { count: 550, digest: "d35d735ccace42ab30a04939c19caa764e252f3e28d50b7b213bfd48d9d62c05",
              changed: [],
              source: "66baec44ad8ce11923787ac18b567062257490ff00d7fd699a6acb426693bc5c" },
  /* 1.37.0 (PROMOTION #6, T8 layer 2, a99312070e; N147, K233), RECORDED 2026-09-28 by legacy-tests T8 from THIS SUITE'S
     OWN PRINT on that commit's tree (a git archive of a99312070e, run unmodified): 550 -> 491, the figures promotion's
     J2 item 3 quotes. CHANGED under unmoved ids, as the constant's note in `src/gate.mjs` names them: C-2.5 and the
     state tables (C-4.1, `checkStateLegality`) now pass the six record types layer 1 admitted (STD, CONF, CONS, ESC, ASP,
     GOAL). Ratifications were stamped 1.37.0 until 1.38.0 was minted, so the row is recorded, never skipped. */
  "1.37.0": { count: 491, digest: "42a9d0a3f36d1af8d714458aa8af2916b5b07034c6fd28427aeb8e5c746014f0",
              changed: ["C-2.5", "C-4.1"],
              source: "17c6fd162802b67d0bfacfbd930611cb14b7b11004cb519e111180aa97dd86a4" },
  /* 1.38.0 (PROMOTION #7, T8 after layer 9, f16a6c55b1; N147, K233, K253), RECORDED 2026-09-28 by legacy-tests T8 from
     THIS SUITE'S OWN PRINT on that commit's tree (a git archive of f16a6c55b1, run unmodified): 491 -> 395, no arrivals,
     ninety-six departures; `changed` is the constant's note's three (promotion's J4 item 1): C-2.8, C-2.10 and C-6.1,
     arms `checkBundle` no longer runs because their module runs them at its own registration.
     AND THE CATALOGUE HAS MOVED AGAIN UNDER THIS NUMBER SINCE, which A3 and A9 name rather than this row absorbing:
     monitoring's T8 extraction (5501b53e10, merged fb72fdc808) took C-18.5's literal emission site out of the file with
     CATALOG_VERSION unmoved, so the file at HEAD prints 394 checks (sha256 7bb13138…) and source eaaf9b18…. This row is
     what a ratification stamped 1.38.0 by f16a6c55b1 was judged by, and an entry is never rewritten; the next stamp is
     promotion's (rule 17), reported by legacy-tests T8. */
  "1.38.0": { count: 395, digest: "c22e257463a71e5ef07465bd8960687b586dd556c964b1b437451325da8b4db2",
              changed: ["C-2.8", "C-2.10", "C-6.1"],
              source: "4108bfa49f11a4de75a5902772fdde1d34c366eea6695a24e4796eafe5004f58" },
  /* 1.39.0 (PROMOTION #9, T9 layer 2, 8926590d63; N240), RECORDED 2026-09-28 by legacy-tests T9 from THIS SUITE'S OWN
     PRINT (PROMOTION #9's record; `bio-checks.mjs` is byte-identical from 8926590d63 to the T9 HEAD this was measured on):
     395 -> 397, three arrivals (C-102.8 STEP_DECLARED, C-102.9 CASE_CATALOGUE_FAILED, C-102.10 CASE_MEMBER_REFUSED), one
     departure (C-18.5, monitoring's T8 extraction, which 1.38.0's note names), none changed; the `where` moves of C-32.6,
     C-33.14 (N212), C-48.8 and C-48.9 (N226) change no condition, code or translation. */
  "1.39.0": { count: 397, digest: "e1c688c54da82c743a275e01ee65f060341edbe145a34494dfc1001ec934b007",
              changed: [],
              source: "9927c1ad88a362754324cc4ab86f6a9850502a8366a0cf6567442ec5f6720c1e" },
  /* 1.40.0 (PROMOTION #10, T9 re-opened after layer 4, 97cb7a30d2; K288, K300), RECORDED 2026-09-28 by legacy-tests T9
     from THIS SUITE'S OWN PRINT on the T9 tree: the catalogue FILE did not move, so the census and source equal 1.39.0's;
     capture-sources' own row table did (rows are counted wherever they live, R34, R47): C-105.10 and C-105.11 arrived
     outside this file, and C-105.8 NO_KEY and C-105.9 NO_SUCH now each refuse one condition, so they are `changed`,
     which is also what keeps this row from colliding with 1.39.0's under A4. */
  "1.40.0": { count: 397, digest: "e1c688c54da82c743a275e01ee65f060341edbe145a34494dfc1001ec934b007",
              changed: ["C-105.8", "C-105.9"],
              source: "9927c1ad88a362754324cc4ab86f6a9850502a8366a0cf6567442ec5f6720c1e" },
  /* 1.41.0 (PROMOTION #11, T11 layer 2, 907fb5feac; N281, K350, K352), RECORDED 2026-09-29 by legacy-tests T11 as
     PROMOTION #11 J2 printed it (its record, which replaces J1's 396) and re-measured identical on the T11 tree after
     layer 10: the catalogue FILE did not move (C-22.7's row restored there, K350, until N299), so census and source
     equal 1.40.0's; every arrival and departure 1.41.0 stamps sits in a module's own table (R34, R47). `changed` is
     C-22.1 and C-22.17 (observation-log's `checkObservation` answers a stored never-looked look C-22.17), which also
     keeps this row apart from 1.40.0's under A4. NOT stamped here: C-22.18 (ai-runs N293) and C-22.7's `where` (N289),
     which T11 layer 6 moved after 1.41.0; both are promotion's N302 (T12), and neither is in the catalogue file. */
  "1.41.0": { count: 397, digest: "e1c688c54da82c743a275e01ee65f060341edbe145a34494dfc1001ec934b007",
              changed: ["C-22.1", "C-22.17"],
              source: "9927c1ad88a362754324cc4ab86f6a9850502a8366a0cf6567442ec5f6720c1e" },
  /* 1.42.0 (PROMOTION #12, T12 layer 2, f955769afc; N302, K369, K381), RECORDED 2026-09-29 by LEGACY-TESTS #10 (T12
     layer 11) as PROMOTION #12 J1 printed it (its record) and re-measured identical, count, digest AND source, on the T12
     tree at layer 11: the catalogue FILE lost C-22.7's copy (N299, K381; the row is held once, in ai-runs' table), so
     397 -> 396. Every other arrival, departure and change 1.42.0 stamps sits in a module's own table (R34, R47);
     `changed` is the constant's note's one, C-113.17 (it now refuses one condition, C-113.22 taking the absent reason),
     as 1.41.0's row carries its note's. NOT stamped here: the row changes after promotion's layer (N318: C-87.12 added in
     review's own table, C-113.9/.18, C-114.1, C-116.3/.4 retired, renames) — all in module tables, none in the catalogue
     file (whose census and source did not move since f955769afc), and all promotion's next number in T13. */
  /* HISTORY: this declaration was carried as 1.42.0's `moved` field until 1.43.0 stamped the moves (LEGACY-TESTS #11,
     T13, N318); the row below no longer carries it, and A12 verifies any later one.
     MOVED UNDER 1.42.0 (RE-PINNED 2026-09-29 by LEGACY-TESTS #10, T12 layer 11 round 2; K409 QUEUE #2, K413 CONTROL-PLANE
     #2, K414 INSTANCE-SETUP #1; BOB B5, B8, B9). The row above is NOT rewritten: it is what the catalogue held when
     1.42.0 was minted. After it, three extractions took THIRTY-SEVEN rows out of the catalogue FILE into their modules'
     own tables, with CATALOG_VERSION unmoved (promotion's to stamp, N318, T13), and the file now prints 359. They
     MOVED rather than left: each keeps its C-number and its code key in the table it went to, which (A12) imports and
     checks, and the file's census plus the departed ids is 1.42.0's census exactly (digest and count), so nothing
     arrived and nothing else left. No function of the catalogue changed (its exported functions are identical from
     6641ad6462 to ce41cfb5d6; the file's diff is those rows and their comments). Figures are THIS SUITE'S OWN PRINT on
     `job/T12/legacy-tests` @ ce41cfb5d6; the departures were read by running this census over a git archive of
     6641ad6462 (which prints 1.42.0's 396, de54b8bd…) against the tree.
       queue (K409, `src/queue/checks.mjs`): C-31.1–.3 (QUEUE_MINT_CHECKS), C-76.1 (TASK_ACTOR_CHECKS), C-32.10, C-32.11
         (now QUEUE_MACHINE_CHECKS), C-33.27, C-33.44 (now QUEUE_ACT_CHECKS);
       control-plane (K413, `src/control-plane/checks.mjs`): C-38.1–.8 (ADMISSION_CHECKS), C-78.1–.3 (NAMESPACE_CHECKS),
         C-69.1, C-69.2 (DISPATCH_CHECKS), C-68.2–.4 (now BOOTSTRAP_CHECKS), C-29.6–.10 (now AI_SCOPE_CHECKS), C-32.17
         (now OPERATOR_FENCE_CHECKS), C-64.4 (now GROUP_IDENTITY_FENCE_CHECKS), C-66.6 (now REPLAY_CHECKS);
       instance-setup (K414, `src/setup.mjs`): C-64.2, C-64.3, C-64.5, C-64.6, C-64.7 (now INSTANCE_SETUP_CHECKS).
     Every moved row's `where` names its new home, and C-33.44's translation was reworded by queue (N301): both are in
     module tables, outside this file, and promotion's next stamp with the rest of N318. */
  "1.42.0": { count: 396, digest: "de54b8bd85553c5d588c0b82fdbf0ea48a4bed3fe47d982fd9a8c1e3c5c023fe",
              changed: ["C-113.17"],
              source: "8ada0f4c65a617f0e120bdfe8359f2b591d039b8a02e2cc3967d8aa27fd90f03" },
  /* 1.43.0 (PROMOTION #14, T13 layer 2; N318, N319, K425, K431, K432), RECORDED 2026-09-29 by LEGACY-TESTS #11 (T13,
     last) as PROMOTION #14 J2 printed it and re-measured identical, count, digest AND source, on `tranche/T13` with every
     T13 job merged (a353b478f3). It REPLACES the `moved` declaration 1.42.0 carried since T12 (the thirty-seven rows
     queue, control-plane and instance-setup took out of this file, above): 1.43.0 stamps those moves, so the census they
     left is this version's own and 1.42.0's row is again only what the catalogue held when it was minted. The file did
     not move since T12's close (359, b28a8a91…, source 3a8dae6c…). Every other row change 1.43.0 stamps (arrivals,
     departures, renames, C-96.1 held twice) sits in a module's own table, outside this census (R34, R47), and is R50's
     (`row-census.test.mjs`). No `changed`: no check in this file refuses or admits anything new, and the census alone
     keeps this row apart from 1.42.0's under A4. */
  "1.43.0": { count: 359, digest: "b28a8a91387ef629dab08baa025b766015f33d6a0a71eda9f392d0d6de2d2605",
              source: "3a8dae6c959d33b5f83e18dc592c0ccb5b77ecddf1adcd5f8b71c2047dca2a40" },
  /* 1.44.0 (PROMOTION #15, T14 layer 2, 872f6d4bd8; N318, N350, K458, K464), RECORDED 2026-09-30 by LEGACY-TESTS #12
     (T14, last) as PROMOTION #15's record gives it (358, 0586303a…) and re-measured identical, count, digest AND source,
     on `tranche/T14` with every T14 job merged (12e562af6d); the file did not move after the stamp. 359 -> 358: C-96.1's
     catalogue copy (`CUSTODIAL_CHECKS.NOT_AN_ADMIN`) left (K408 (4), LEGACY-CHECKS #8), membership's row standing. The
     source moved with `checkBundle` no longer running C-19.1 (N325's layer-1 share, stamped here, K464); queue's layer-11
     registration of C-19.1 at the promote gate is in queue's own table and T15's to stamp. No `changed`: the census
     alone keeps this row apart from 1.43.0's under A4, and the composition change is the source pin's to carry. */
  "1.44.0": { count: 358, digest: "0586303ad42e5af722030da5fdbbd2ff0aee5c956017a2d51b63c0cc3f40f98d",
              source: "19ce939b4111972c509e9162f885622e2aad84d4834d2c837846686b91b85d64" },
  /* 1.45.0 (PROMOTION #16, T15 layer 2, 2545e421b6; N318, K425, K482, K483), RECORDED 2026-09-30 by LEGACY-TESTS #13
     (T15, last) as PROMOTION #16's record gives it (356, 968acdfb…, source b7d4112b…) and re-measured identical, count,
     digest AND source, on `job/T15/legacy-tests` with every T15 job merged; the file did not move after the stamp.
     358 -> 356, two departures, no arrivals, read by diffing this census over 872f6d4bd8 (1.44.0) against the tree:
     C-19.1's literal emission sites left with `checkInboxGrammar` (LEGACY-CHECKS #9, N325; queue holds it whole in
     `src/queue/checks.mjs`), and C-29.12 `AI_CREDENTIAL_ORG_NOT_ADMIN` retired with its family header (N327). No
     `changed`: the census alone keeps this row apart from 1.44.0's under A4. */
  "1.45.0": { count: 356, digest: "968acdfb95e0ea07805a2727b1095090bf760ac6adac654a0c9f5ed80ab57510",
              source: "b7d4112b8a54b44118429e5ffaa63683c8959423c38cd6cc563529b594060181" },
  /* 1.46.0 (PROMOTION #17, T16 layer 2, 1dcde36e8b; N318, K425, K483, K529), RECORDED 2026-09-30 by LEGACY-TESTS #14
     (T16, last) as PROMOTION #17's record gives it (356, 968acdfb…, source b7d4112b…) and re-measured identical, count,
     digest AND source, on `job/T16/legacy-tests` with every T16 job merged: `bio-checks.mjs` is byte-identical from
     2545e421b6 (1.45.0) through 1dcde36e8b to this tree (LEGACY-CHECKS #10 deferred N361's removal to T17), so census and
     source equal 1.45.0's. Every row 1.46.0 stamps sits in a module's own table (R34, R47; R50's `row-census`). `changed`
     is C-102.9 CASE_CATALOGUE_FAILED: the case gate no longer falls back to this file's `checkCaseDocument` and, with no
     catalogue registered, answers C-102.9 (N361's share, K529, K534) — a check whose answer moved with no id moving,
     which also keeps this row apart from 1.45.0's under A4 (1.40.0's and 1.41.0's precedent). */
  "1.46.0": { count: 356, digest: "968acdfb95e0ea07805a2727b1095090bf760ac6adac654a0c9f5ed80ab57510",
              changed: ["C-102.9"],
              source: "b7d4112b8a54b44118429e5ffaa63683c8959423c38cd6cc563529b594060181" },
  /* 1.47.0 (PROMOTION #18, T17 layer 2, 6645daa0e0; N318, N372, K575, K577, K579), RECORDED 2026-09-30 by LEGACY-TESTS
     #16 (T17, last) as PROMOTION #18's record gives it (340, c56ccc26…, source 15465533…) and re-measured identical,
     count, digest AND source, on `job/T17/legacy-tests` with every T17 job merged. 356 -> 340, sixteen departures, no
     arrivals, read by diffing this census over 1dcde36e8b (1.46.0) against the tree: LEGACY-CHECKS #11 (N372, cce4d99e29)
     deleted the catalogue's case-document gate, so C-41.1–C-41.15 (the file's copy of `CASE_DOCUMENT_FAMILY`;
     ratification's table keeps the rows) and C-21.1 (its one literal site here was `checkCaseDocument`'s case-altitude
     arm; case-authoring and ratification keep theirs) left the file. The `C41.*` spellings in RELAYS below are no longer
     emitted here and are kept as history; A2 fails only an unaccounted spelling. No `changed`: the census alone keeps
     this row apart from 1.46.0's under A4. */
  "1.47.0": { count: 340, digest: "c56ccc26b13997c298dcc6fe0a7e6fe3f58548bd0164d2109505f9724f50cd4a",
              source: "1546553323e10c1275e989d356c7467842a7e57470a7877f9383fa6dbc441462" },
};

/* The computed emission spellings this suite accounts for, each with the
   declared table it relays. A spelling absent from here fails A2. */
const RELAYS = {
  "C41.FORMAT": "CASE_DOCUMENT_FAMILY", "C41.IDENTITY": "CASE_DOCUMENT_FAMILY",
  "C41.EDITION": "CASE_DOCUMENT_FAMILY", "C41.PROJECT": "CASE_DOCUMENT_FAMILY",
  "C41.SCOPE": "CASE_DOCUMENT_FAMILY", "C41.BIAS": "CASE_DOCUMENT_FAMILY",
  "C41.ROSTER": "CASE_DOCUMENT_FAMILY", "C41.ROLES": "CASE_DOCUMENT_FAMILY",
  "C41.PINS": "CASE_DOCUMENT_FAMILY", "C41.COMPLETENESS": "CASE_DOCUMENT_FAMILY",
  "C41.EXCLUDED": "CASE_DOCUMENT_FAMILY", "C41.BAR": "CASE_DOCUMENT_FAMILY",
  /* ADDED at c20-batch13 (CONDUCT #20, 2026-09-24): REC-188's disclosures arm
     (C-41.13) landed on the OTHER side of this integration, so D-470's table —
     written on a base without it — could not name it and A2 went red at the
     union. It is the thirteenth member of the SAME family as the twelve above,
     relayed the same way; nothing about the mechanism changed. */
  "C41.DISCLOSURES": "CASE_DOCUMENT_FAMILY",
  /* REC-219 (2026-09-25): the fourteenth member, C-41.14 (a /4 document's adoptions pinning a proposed
     revision), and C-41.15 (its citation edges and their versions, D-579(a)), relayed the same way. */
  "C41.PENDING": "CASE_DOCUMENT_FAMILY",
  "C41.CITATIONS": "CASE_DOCUMENT_FAMILY",
  "row.check": "BASIS_VERSION_CHECKS and SUGGEST_CHECKS (basisVersionFindings' two push helpers)",
  "checkId": "checkLegExtentGrammar's parameter — 'C-2.8' here, 'C-25.10' from src/store.mjs "
           + "(BASIS_VERSION_CHECKS.VERSION_LEG_NOT_CITABLE)",
};

const mod = await import("../checks/bio-checks.mjs");
const src = readFileSync(CATALOG, "utf8");
const tables = declaredTables(mod);
const { literal, computed } = emissionSites(src);

const behaviour = behaviourSource(src);
const sourceDigest = createHash("sha256").update(behaviour).digest("hex");
const tableIds = new Set([...tables.values()].flat());
const census = new Set([...tableIds, ...literal]);
const count = census.size, digest = digestOf(census);

say(`\nD-470 — the catalogue's check census, taken from ${CATALOG.split("/").slice(-2).join("/")}`);
say(`  S1  declared tables:        ${tables.size} tables, ${tableIds.size} distinct C-numbers`);
say(`  S2  literal emission sites: ${literal.size} distinct C-numbers`);
say(`  computed emission sites:    ${computed.size} spelling(s) — ${[...computed.keys()].sort().join(", ")}`);
say(`  CENSUS: ${count} checks · sha256 ${digest}`);
say(`  SOURCE: ${src.length} bytes, ${behaviour.length} once comments and layout are stripped (esbuild ${ESBUILD_VERSION}) · sha256 ${sourceDigest}`);
say(`  THE LIMIT: this census is a census OF THE CATALOGUE FILE. It establishes what the`);
say(`  catalogue HOLDS, and it does not establish that any check RAN, nor that a version`);
say(`  recorded below was the version actually stamped on any past ratification.`);

const { CATALOG_VERSION, GATE_VERSION } = await import("../src/gate.mjs");
say(`  the stamp: ${GATE_VERSION}`);

/* (A1) THE CORPUS IS NON-EMPTY AND FLOORED. A headline totality assertion over an
   empty corpus has passed three times in this estate (kickoffs/WORKER.md).
   RE-PINNED 2026-09-27 (T5-12, legacy-tests): the literal-site floor 50 -> 46, the measured figure. The seven that
   left are C-26.1-C-26.7, `checkBiasExtension`'s sites, which BIAS #1 moved to `src/bias/checks.mjs` with the rows
   (1.35.0); every other literal site of the T5 opening (53) is still here, compared by name. */
/* RE-PINNED 2026-09-28 (LEGACY-TESTS #4, T7): the literal-site floor 46 -> 45, the measured figure. The one that left
   is C-10.1 (`reeval_pending`'s shape, five literal sites in `checkBundle`), which REEVALUATION #1 moved with its number
   to `src/reevaluation/checks.mjs` (K6, its R23); every other literal site of T6 (46) is still here, compared by name. */
/* RE-PINNED 2026-09-28 (legacy-tests T8), both floors from this suite's print at HEAD: the count floor 400 -> 390 (the
   print reads 394: 1.38.0's 395 less C-18.5, below), and the literal-site floor 45 -> 43, compared by name against T7's
   45: C-11.1 left with `checkActionExtension`'s clock arm for actions (1.38.0), and C-18.5 with monitoring's extraction
   (5501b53e10, after 1.38.0, under the unmoved stamp that A3 and A9 name). */
/* RE-PINNED 2026-09-29 (LEGACY-TESTS #10, T12 round 2; K409, K413, K414): the count floor 390 -> 359, this suite's print
   on ce41cfb5d6: thirty-seven rows MOVED to queue's, control-plane's and instance-setup's own tables under 1.42.0 (named
   in 1.42.0's `moved` declaration and verified by A12). The literal-site floor (43) and the table floor (40; 44 now,
   five whole families having left: QUEUE_MINT_CHECKS, TASK_ACTOR_CHECKS, ADMISSION_CHECKS, NAMESPACE_CHECKS,
   DISPATCH_CHECKS) are unmoved. */
/* RE-PINNED 2026-09-30 (LEGACY-TESTS #12, T14; K458): the count floor 359 -> 358, this suite's print on 12e562af6d,
   C-96.1's catalogue copy having left (1.44.0's row). The literal-site and table floors are unmoved. */
/* RE-PINNED 2026-09-30 (LEGACY-TESTS #13, T15; N325, N327): the count floor 358 -> 356 and the literal-site floor
   43 -> 42, this suite's print on the tree with every T15 job merged (1.45.0's row), compared by name against 872f6d4bd8:
   C-19.1's literal sites left with `checkInboxGrammar` (queue's own since T14) and C-29.12's row retired. The table
   floor is unmoved. */
/* CONFIRMED 2026-09-30 (LEGACY-TESTS #14, T16): no floor moves; the print on the T16 tree is 1.45.0's (356 checks, 44
   tables, 42 literal sites), `bio-checks.mjs` unchanged in T16. N361's removal of the C-41 family (T17, LEGACY-CHECKS)
   will move the count floor and A3/A9 under T17's own version: this census is of the catalogue FILE, so its C-41 reads
   (`CASE_DOCUMENT_FAMILY` and the `C41.*` relays below) are not re-anchored on ratification's exports, which are
   `row-census`' (R50) to count. */
/* RE-PINNED 2026-09-30 (LEGACY-TESTS #16, T17; N372, K575): the count floor 356 -> 340 and the literal-site floor
   42 -> 41, this suite's print on the tree with every T17 job merged (1.47.0's row), compared by name against 1dcde36e8b:
   C-41.1–C-41.15's catalogue copies and C-21.1's literal site left with `checkCaseDocument` (LEGACY-CHECKS #11). The
   table floor (40; 43 now, `CASE_DOCUMENT_FAMILY` having left) is unmoved. */
t("(A1) THE CENSUS IS NON-EMPTY AND FLOORED — both sources contributed",
  [count >= 340, tables.size >= 40, literal.size >= 41], [true, true, true]);

/* (A2) EVERY EMISSION SITE RESOLVES. A computed site is not scored zero: it is
   named here or it fails. */
{
  const unaccounted = [...computed.keys()].filter((k) => !(k in RELAYS)).sort();
  for (const k of unaccounted) console.log(`          UNACCOUNTED EMISSION SPELLING: ${k}`);
  t("(A2) EVERY EMISSION SITE RESOLVES — no computed spelling this suite cannot name",
    unaccounted, []);
}

/* (A3) THE CENSUS PIN — the arm the row is for. */
/* MOVED, NOT CHANGED (LEGACY-TESTS #10, T12, 2026-09-29). A version's entry may carry `moved` declarations: a census
   the file reached under that SAME version only because rows left it for a module's own table (an extraction), which
   changes where a row is written and not what any check refuses or admits. A3 admits such a census, and A9 its source,
   ONLY through a declaration that A12 verifies whole: its ids plus the measured census ARE the version's recorded census
   (so nothing arrived and nothing else left), and every departed id is declared, under a row table, in one of the files
   it names. A row REMOVED (in no table) or ADDED still turns A3 red, and so does any census no declaration names. */
const movedOf = (entry) => (entry && Array.isArray(entry.moved) ? entry.moved : []);
{
  const recorded = CATALOG_CENSUS[CATALOG_VERSION] || null;
  const movedHere = movedOf(recorded).find((m) => m && m.digest === digest && m.count === count) || null;
  if (movedHere) {
    console.log(`          ${CATALOG_VERSION}'s census is its declared MOVED census (${movedHere.departed.length} rows to `
              + `${movedHere.into.join(", ")}, by ${movedHere.by}); A12 verifies the declaration.`);
  } else if (!recorded) {
    console.log(`          CATALOG_VERSION ${CATALOG_VERSION} has NO recorded census. Record one:`);
    console.log(`            "${CATALOG_VERSION}": { count: ${count}, digest: "${digest}" },`);
  } else if (recorded.digest !== digest) {
    console.log(`          THE CATALOGUE MOVED AND THE STAMP DID NOT. Recorded for ${CATALOG_VERSION}: `
              + `${recorded.count} checks, sha256 ${recorded.digest}. Measured now: ${count} checks, sha256 ${digest}.`);
    console.log(`          MOVE CATALOG_VERSION (MINOR) in src/gate.mjs and record the new census here:`);
    console.log(`            "<new version>": { count: ${count}, digest: "${digest}" },`);
  }
  const admittedCensus = movedHere || recorded;
  t("(A3) THE CENSUS PIN: the catalogue's census is the one recorded for CATALOG_VERSION",
    admittedCensus ? { count: admittedCensus.count, digest: admittedCensus.digest } : null, { count, digest });
}

/* (A12) EVERY `moved` DECLARATION IS VERIFIED, not trusted: the departed ids are disjoint from the measured census
   (for the declaration A3 admitted), the two together are the version's recorded census to the digest and the count,
   and each departed id is a `check` in a row table exported by one of the files the declaration names. */
{
  const problems = [];
  const tablesIn = async (f) => declaredTables(await import(join(DIR, "..", f)));
  for (const [v, e] of Object.entries(CATALOG_CENSUS)) {
    for (const m of movedOf(e)) {
      const departed = Array.isArray(m.departed) ? m.departed : [];
      if (!(m.count >= 1) || !/^[a-f0-9]{64}$/.test(m.digest || "") || !/^[a-f0-9]{64}$/.test(m.source || "")
          || !m.by || !Array.isArray(m.into) || !m.into.length || !departed.length) {
        problems.push(`${v}: a \`moved\` declaration must carry count, digest, source, by, into and departed — got ${JSON.stringify(m).slice(0, 200)}`);
        continue;
      }
      if (m.count + departed.length !== e.count) problems.push(`${v}: moved ${m.count} + ${departed.length} departed is not ${e.count}`);
      if (v === CATALOG_VERSION && m.digest === digest) {
        const overlap = departed.filter((id) => census.has(id));
        if (overlap.length) problems.push(`${v}: departed ids still in the catalogue file: ${overlap.join(", ")}`);
        if (digestOf(new Set([...census, ...departed])) !== e.digest)
          problems.push(`${v}: the measured census plus the departed ids is NOT ${v}'s recorded census — something else moved`);
      }
      const homes = new Set();
      for (const f of m.into) for (const ids of (await tablesIn(f)).values()) for (const id of ids) homes.add(id);
      const homeless = departed.filter((id) => !homes.has(id));
      if (homeless.length) problems.push(`${v}: departed ids in no row table of ${m.into.join(", ")} (removed, not moved): ${homeless.join(", ")}`);
    }
  }
  for (const p of problems) console.log(`          ${p}`);
  t("(A12) EVERY MOVED DECLARATION HOLDS — its rows left the file for a module's own table, and nothing else moved",
    problems, []);
}

/* (A4) ONE VERSION, ONE CATALOGUE — this row's defect inverted.
   D-450 (2026-09-25): the collision key is the census AND the checks an entry says it CHANGED. Rule 17
   moves the version for an added, removed OR CHANGED check, and a census of ids is blind to the third,
   so before this line a version moved for a changed check could not be recorded at all (it collided
   with its predecessor). An entry names what changed in `changed`; two entries with the same census and
   the same (or no) `changed` still collide — laundering a past entry is refused exactly as before. The
   limit the header states applies here too: `changed` is a record of intent, not a proof of it. */
{
  const seen = new Map();
  const collisions = [];
  for (const [v, e] of Object.entries(CATALOG_CENSUS)) {
    /* M0-195: an entry that DECLARES a change is also identified by its `source`, so the same check changed
       twice with nothing added (C-41.12 again at a later version, say) is two catalogues, not a collision.
       An entry declaring no change is keyed as before — it cannot escape A4 by carrying a new source. */
    const ch = [...(e.changed || [])].sort().join(",");
    const key = `${e.digest}|${ch}|${ch && e.source ? e.source : ""}`;
    if (seen.has(key)) collisions.push(`${seen.get(key)} and ${v} record the same census`);
    else seen.set(key, v);
  }
  for (const c of collisions) console.log(`          ${c}`);
  t("(A4) ONE VERSION, ONE CATALOGUE — no two recorded versions carry the same census", collisions, []);
}

/* (A9) THE SOURCE PIN — M0-195, rule 17's backstop (BOB #35, 2026-09-25). A3 sees a check ADDED or REMOVED; it
   cannot see a check CHANGED, because a census of ids is blind to a body. This arm pins the current version to
   the digest of the catalogue's behaviour source, so an edit to any check's code under an unmoved version fails
   HERE, by name, unless the landing either takes a new version (A3 then wants its census row, with `changed`) or
   declares under this one `{ source, behaviour: "unchanged", by }` against the new digest. A comment-only edit
   does not move the digest (A11), so a comment never costs a version. If esbuild's version moved and the code
   did not, the print may have moved alone: that too is a `behaviour: "unchanged"` declaration, saying so.
   THE LIMIT: `behaviour: "unchanged"` is a declaration, not a proof — the same record-of-intent limit as the
   header's; what the arm removes is the SILENT path. And it pins the catalogue FILE: a check whose behaviour
   moves through a helper imported from elsewhere is not seen. No entry for CATALOG_VERSION is A3's to name;
   this arm does not count it twice. */
{
  const recorded = CATALOG_CENSUS[CATALOG_VERSION] || null;
  const problems = [];
  if (recorded) {
    const declared = recorded.unchanged || [];
    for (const d of declared) {
      if (!d || d.behaviour !== "unchanged" || !/^[a-f0-9]{64}$/.test(d.source || "") || !d.by)
        problems.push(`${CATALOG_VERSION}: an \`unchanged\` declaration must be { source: <sha256>, behaviour: "unchanged", by: <id> } — got ${JSON.stringify(d)}`);
    }
    const admitted = [recorded.source, ...declared.filter((d) => d && d.behaviour === "unchanged").map((d) => d.source),
                      ...movedOf(recorded).filter((m) => m && m.digest === digest).map((m) => m.source)];
    if (!recorded.source) {
      problems.push(`${CATALOG_VERSION} records NO source digest`);
      console.log(`          CATALOG_VERSION ${CATALOG_VERSION} pins no source. Add to its entry:  source: "${sourceDigest}"`);
    } else if (!admitted.includes(sourceDigest)) {
      problems.push(`THE CATALOGUE'S CODE MOVED AND THE STAMP DID NOT: ${CATALOG_VERSION} pins source ${recorded.source}`
                  + (declared.length ? ` (+${declared.length} declared unchanged)` : "") + `, measured ${sourceDigest}`);
      console.log(`          A CHECK'S CODE CHANGED UNDER ${CATALOG_VERSION}. Either MOVE CATALOG_VERSION and record`);
      console.log(`            "<new version>": { count: ${count}, digest: "${digest}", changed: ["C-n.m", …], source: "${sourceDigest}" },`);
      console.log(`          or, ONLY if no check refuses or admits anything differently, add to ${CATALOG_VERSION}'s entry`);
      console.log(`            unchanged: [{ source: "${sourceDigest}", behaviour: "unchanged", by: "<this landing's id>" }]`);
    }
  }
  for (const p of problems) console.log(`          ${p}`);
  t("(A9) THE SOURCE PIN: the catalogue's behaviour source is the one pinned for CATALOG_VERSION", problems, []);
}

/* (A10) THE STRIPPED SOURCE IS NOT EMPTY AND STILL HOLDS THE CODE. A digest of an empty or truncated print agrees
   with every other one for free (CLAUDE.md §5), so the print is floored, and every C-number the census found at a
   literal emission site (S2, read by a different matcher) must still be in it. */
{
  const lost = [...literal].filter((id) => !behaviour.includes(`"${id}"`) && !behaviour.includes(`'${id}'`)).sort();
  t("(A10) THE STRIPPED SOURCE IS NOT EMPTY AND STILL HOLDS THE CODE — floored, every literal emission site present",
    [behaviour.length > 100000, lost], [true, []]);
}

/* (A11) OVER-STRICTNESS FOR A9: a comment-only edit is not a behaviour change and must not move the digest —
   a comment added on its own line, at the end of a line, inside a template's `${}`, a block comment spanning
   lines, a line re-indented, and a call's arguments re-laid across lines. And the other direction, so the arm
   is not satisfied by a function that returns a constant: a changed token, a `//` INSIDE A STRING or a regex
   (which is code), and a line break that changes what ASI inserts, do move it. */
{
  const base = "const re = /a\\/b[/]c/g;\nexport function g(x) {\n  if (x > 1) return f('C-1.1', 'error', `n=${x}`);\n  return x / 2;\n}\n";
  const same = [
    "// a new comment\n" + base,
    base.replace("if (x > 1)", "if (x > 1) /* inline */"),
    base.replace("return x / 2;", "return x / 2; // trailing"),
    base.replace("`n=${x}`", "`n=${x /* inside */}`"),
    base.replace("{\n  if", "{ /* spans\n lines */\n  if"),
    base.replace("  return x / 2;", "        return   x  /  2;"),
  ];
  same.push(base.replace("f('C-1.1', 'error', `n=${x}`)", "f(\n      'C-1.1',\n      'error',\n      `n=${x}`\n    )"));
  const moved = [base.replace("x > 1", "x > 2"), base.replace("'error'", "'error // not a comment'"),
                 base.replace("/a\\/b[/]c/g", "/a\\/b[/]c\/\/d/g"),
                 base.replace("return x / 2;", "return\n x / 2;")];   /* ASI: now returns undefined */
  const d0 = behaviourSource(base);
  t("(A11) OVER-STRICTNESS FOR A9: a comment-only or layout-only edit leaves the source digest unmoved",
    same.map((s) => behaviourSource(s) === d0), same.map(() => true));
  t("(A11) …and a code edit, a `//` inside a string or a regex, or an ASI-changing break, MOVES it",
    moved.map((s) => behaviourSource(s) !== d0), moved.map(() => true));
}

/* (A5) THE STAMP READS THE CATALOGUE'S VERSION, and reads the bumped one. */
/* CORRECTED at c20-batch13, never exempted: the catalogue moved under this pin
   at the union (five arrivals from c20-batch11fix's side), so 1.21.0 had stopped
   naming one catalogue — the exact defect the header describes. */
/* CORRECTED AGAIN by D-508 (2026-09-24), never exempted, and the reason the old
   value was right when written is the same one: at c20-batch14 the catalogue this
   pin named WAS 1.23.0's. D-508 gives the doorbell's two rate refusals catalogue
   rows (C-85.1, C-85.2), so the catalogue under the stamp moved and the stamp
   moved with it. A5 is a literal rather than a read of `CATALOG_CENSUS`'s last
   key on purpose — a pin derived from the thing it pins agrees for free (CLAUDE.md
   §5), so this line is edited by hand in the same commit that moves the constant,
   and going red here is the arm working. */
/* CORRECTED at c21-batch28 (CONDUCT #21): 1.29.0 -> 1.30.0, the union's one number for this batch's rows. */
/* CORRECTED at the c22-batch29 union (CONDUCT #22), never exempted: 1.30.0 -> 1.31.0, the union's one number for
   every branch below (the catalogue under the stamp moved 502 -> 569 by this suite's print); the literal moves by
   hand with the constant, which is its whole rule. */
/* UPDATED 2026-09-26 (T3, legacy-tests): 1.31.0 -> 1.32.0, promotion's move of four checks (K64).
   UPDATED 2026-09-27 (T4, legacy-tests): 1.32.0 -> 1.33.0, promotion's T4-2b.
   UPDATED 2026-09-27 (T5-12, legacy-tests): 1.33.0 -> 1.35.0, promotion's N86 (1.34.0) and K150 (1.35.0).
   UPDATED 2026-09-28 (LEGACY-TESTS #4, T7): 1.35.0 -> 1.36.0, PROMOTION #5's T6 move (LEGACY-CHECKS #2 REPORT 7).
   UPDATED 2026-09-28 (legacy-tests T8): 1.36.0 -> 1.38.0, PROMOTION #6's 1.37.0 (T8 layer 2) and #7's 1.38.0 (after
   layer 9), N147.
   UPDATED 2026-09-28 (legacy-tests T9): 1.38.0 -> 1.40.0, PROMOTION #9's 1.39.0 (N240) and #10's 1.40.0 (K288).
   UPDATED 2026-09-29 (legacy-tests T11): 1.40.0 -> 1.41.0, PROMOTION #11's N281 (K352).
   UPDATED 2026-09-29 (LEGACY-TESTS #10, T12): 1.41.0 -> 1.42.0, PROMOTION #12's N302 (K369, K381).
   UPDATED 2026-09-29 (LEGACY-TESTS #11, T13): 1.42.0 -> 1.43.0, PROMOTION #14's N318 (K425, K432).
   UPDATED 2026-09-30 (LEGACY-TESTS #12, T14): 1.43.0 -> 1.44.0, PROMOTION #15's N318 (K458, K464).
   UPDATED 2026-09-30 (LEGACY-TESTS #13, T15): 1.44.0 -> 1.45.0, PROMOTION #16's N318 (K425, K482, K483).
   UPDATED 2026-09-30 (LEGACY-TESTS #14, T16): 1.45.0 -> 1.46.0, PROMOTION #17's N318 (K425, K483, K529).
   UPDATED 2026-09-30 (LEGACY-TESTS #16, T17): 1.46.0 -> 1.47.0, PROMOTION #18's N318 (K575, K577, K579). */
t("(A5) THE STAMP READS THE CATALOGUE'S VERSION — plane-gate/1.0 (bio-checks 1.47.0)",
  [GATE_VERSION, CATALOG_VERSION], ["plane-gate/1.0 (bio-checks 1.47.0)", "1.47.0"]);
/* REC-150 side, kept as history — its A5 pin read 1.31.0 on its own branch; ours is kept at c22-batch29 and CONDUCT
   moves this literal with the constant once:
   /* CORRECTED by REC-150 (2026-09-25), never exempted: 1.29.0 -> 1.31.0, because the C-95 family moved the catalogue
      under the stamp (466 -> 475) and this literal moves in the same commit as the constant, which is its whole rule. *\/
   t("(A5) THE STAMP READS THE CATALOGUE'S VERSION — plane-gate/1.0 (bio-checks 1.31.0)",
     [GATE_VERSION, CATALOG_VERSION], ["plane-gate/1.0 (bio-checks 1.31.0)", "1.31.0"]);
*/
/* D-134 side, kept as history — its A5 pin read 1.30.0 on its own branch (1.29.0 -> 1.30.0, the C-96 rows); ours is kept
   at c22-batch29 and CONDUCT moves this literal with the constant once. */
/* REC-219 side, kept as history — its A5 pin read 1.30.0 on its own branch (1.29.0 -> 1.30.0, C-41.14/C-41.15); ours is
   kept at c22-batch29 and CONDUCT moves this literal with the constant once. */
/* REC-203 side, kept as history — its A5 pin read 1.30.0 on its own branch (1.29.0 -> 1.30.0, C-91's three rows); ours is
   kept at c22-batch29 and CONDUCT moves this literal with the constant once. */
/* D-147 side, kept as history — its A5 pin read 1.30.0 on its own branch (1.29.0 -> 1.30.0, C-94.1-11); ours is
   kept at c22-batch29 and CONDUCT moves this literal with the constant once. */
/* MK-7 side, kept as history — its A5 pin read 1.30.0 on its own branch (1.29.0 -> 1.30.0, C-92's twelve rows); ours is
   kept at c22-batch29 and CONDUCT moves this literal with the constant once. */
/* REC-147 side, kept as history — its A5 pin read 1.30.0 on its own branch (C-93's seven rows); ours is
   kept at c22-batch29 and CONDUCT moves this literal with the constant once. */
/* REC-197 side, kept as history — its A5 pin read 1.30.0 on its own branch (C-97's two rows); ours is
   kept at c22-batch29 and CONDUCT moves this literal with the constant once. */
/* D-521b side, kept as history — its A5 pin read 1.31.0 on its own branch (C-82.1 retired, one departure); ours is
   kept at c22-batch29 and CONDUCT moves this literal with the constant once. */
/* D-563 side, kept as history — its A5 pin read 1.31.0 on its own branch (C-86.3/C-86.4, two arrivals); ours is
   kept at c22-batch29 and CONDUCT moves this literal with the constant once. */
/* D-561 side, kept as history — its A5 pin read 1.31.0 on its own branch (C-98.1..8 and C-69.2, nine arrivals); ours is
   kept at c22-batch29 and CONDUCT moves this literal with the constant once. */
/* CORRECTED AGAIN by D-513 (2026-09-24), never exempted, and the reason the old value was right when
   written is unchanged: at c20-batch23 the catalogue this pin named WAS 1.25.0's. D-513 gives
   `op=knock`'s three pre-store refusals catalogue rows (C-85.3, C-85.4, C-85.5), so the catalogue under
   the stamp moved and the stamp moved with it. The label in the first argument lags the assertion on
   purpose — it is the sentence a reader sees when this line goes red — and both are edited by hand in
   the same commit that moves the constant, because a pin derived from the thing it pins agrees for
   free (CLAUDE.md §5). */
/* D-513's own A5 assertion (1.26.0) is SUPERSEDED at c20-batch27 (CONDUCT #20), not exempted: D-513's
   checks ride the union's 1.29.0 with D-463's, and the ONE A5 assertion above pins that stamp. Two
   assertions pinning two versions of one constant could never both pass. */

  /* D-513's rows ride 1.29.0 AT THE UNION (CONDUCT #20, c20-batch27) beside D-463's; its branch row (1.26.0) DROPPED, comment kept. */
/* CORRECTED by D-547 (2026-09-25): 1.28.0 -> 1.29.0 — C-86.2 joined the catalogue, so 1.28.0 names the old one. */
/* CORRECTED 2026-09-24 by D-448, never exempted: 1.28.0 -> 1.29.0, because C-87's eleven rows moved the
   census 461 -> 472 and this arm's whole point is that the literal moves whenever the catalogue does.
   FOUND BY THE GATE, not by reading: D-448 corrected `ratify.test.mjs`'s stamp pin and MISSED THIS ONE,
   which is the second reader of the same constant inside this suite's own file — the rule that a fix
   verified only where you changed it is not verified (CLAUDE.md §5), paid for once more here. */
/* CORRECTED 2026-09-24 by REC-214: 1.28.0 -> 1.29.0, C-90.1..5 under the stamp; the arm working as the note says. */
/* CORRECTED by D-549: 1.28.0 -> 1.29.0 — C-68.5 joined the catalogue, and the old literal names one that no longer runs. */
/* CORRECTED by D-450 (2026-09-25), never exempted: C-41.12 changed what it admits, so the catalogue
   under the stamp is no longer 1.28.0's and the stamp moves with it (rule 17). */
/* CORRECTED AGAIN by D-512 (2026-09-24), never exempted: C-66.6 moved the catalogue, so the stamp moved with it. */
/* CORRECTED 2026-09-25 by D-454: 1.28.0 -> 1.29.0 with the catalogue (C-74.4 arrived); the stamp moves with it. */
/* D-520 side, kept as history — its A5 pin read 1.29.0 on its own branch; ours is kept at c22-batch29 and CONDUCT
   moves this literal with the constant once:
   /* CORRECTED by D-520 (2026-09-25), never exempted: 1.28.0 named the catalogue before C-83.8 arrived; the catalogue
      under the stamp moved, so the stamp moved with it and this literal is edited by hand in the same commit. *\/
   t("(A5) THE STAMP READS THE CATALOGUE'S VERSION — plane-gate/1.0 (bio-checks 1.29.0)",
     [GATE_VERSION, CATALOG_VERSION], ["plane-gate/1.0 (bio-checks 1.29.0)", "1.29.0"]);
*/
/* REC-186 side, kept as history — its A5 pin read 1.29.0 on its own branch (1.28.0 -> 1.29.0, C-33.48); ours is
   kept at c22-batch29 and CONDUCT moves this literal with the constant once. */

/* (A6) OVER-STRICTNESS. Correct work in spellings this suite did not anticipate
   must be SEEN: arguments across lines, extra whitespace, a `return f(` rather
   than a `findings.push(f(`, and a family table carrying keys beside `check`. */
{
  const fixture = [
    "function f(check, severity, message) { return { check, severity, message }; }",
    "findings.push(f(  'C-901.1'  , 'error', 'spaces'));",
    "findings.push(f(\n      'C-901.2',\n      'error',\n      'across lines'));",
    "const g = () => f('C-901.3', 'error', 'returned rather than pushed');",
    "push(f('C-901.4','error','no space at all'));",
  ].join("\n");
  const got = [...emissionSites(fixture).literal].sort();
  t("(A6) OVER-STRICTNESS: a check emitted in a spelling this suite did not anticipate is SEEN",
    got, ["C-901.1", "C-901.2", "C-901.3", "C-901.4"]);
  const famMod = { NEW_FAMILY: { THING: { check: "C-902.1", code: "X", what: "a family with keys beside check" },
                                 NOT_A_CHECK: { what: "no check key" } } };
  t("(A6) OVER-STRICTNESS: a family table under a name nobody anticipated is READ",
    [...declaredTables(famMod).get("NEW_FAMILY") || []], ["C-902.1"]);
}

/* (A7) THE MATCHER READS CODE, NOT PROSE — the other direction of A6, and the
   defect D-277 pointed at drivers, arriving at the catalogue. */
{
  const prose = "/* C-903.1 is discussed at length here, and f('C-903.2', 'error', 'x') is quoted too. */\n"
              + "// f('C-903.3', 'error', 'a line comment')\n"
              + "findings.push(f('C-903.4', 'error', 'the only real one'));";
  t("(A7) THE MATCHER READS CODE, NOT PROSE — a C-number in a comment is not a check",
    [...emissionSites(prose).literal].sort(), ["C-903.4"]);
}

/* (A8) THE LIMIT IS PRINTED. An instrument that drops its own caveat keeps
   printing the figure while the reader stops being told what it is worth. */
{
  const out = printed.join("\n");
  t("(A8) THE LIMIT IS PRINTED — the census says what it does not establish",
    [/THE LIMIT: this census is a census OF THE CATALOGUE FILE/.test(out),
     /does not establish that any check RAN/.test(out),
     /CENSUS: \d+ checks/.test(out)], [true, true, true]);
}

console.log(`\nd470-catalog-census.test.mjs: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
