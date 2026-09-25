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
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

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
  /* 1.30.0 (D-147, 2026-09-25, branch land/worker/D-147): ELEVEN ARRIVALS, NO DEPARTURES — C-94.1-11, LIFECYCLE_CHECKS. 466 -> 477, count AND digest from THIS SUITE'S OWN PRINT on the item's tree over origin/main 964da679. IF ANOTHER BRANCH IN THE SAME BATCH ALSO ADDS ROWS, CONDUCT takes the next number and re-reads the census from this suite's print on the merged tree. */
  "1.30.0": { count: 477, digest: "b06cb8dce8d8ce12f4d719b0b8e44e8d1f78c7501fb1b803126870967bcb39f4" },
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
  "row.check": "BASIS_VERSION_CHECKS and SUGGEST_CHECKS (basisVersionFindings' two push helpers)",
  "checkId": "checkLegExtentGrammar's parameter — 'C-2.8' here, 'C-25.10' from src/store.mjs "
           + "(BASIS_VERSION_CHECKS.VERSION_LEG_NOT_CITABLE)",
};

const mod = await import("../checks/bio-checks.mjs");
const src = readFileSync(CATALOG, "utf8");
const tables = declaredTables(mod);
const { literal, computed } = emissionSites(src);

const tableIds = new Set([...tables.values()].flat());
const census = new Set([...tableIds, ...literal]);
const count = census.size, digest = digestOf(census);

say(`\nD-470 — the catalogue's check census, taken from ${CATALOG.split("/").slice(-2).join("/")}`);
say(`  S1  declared tables:        ${tables.size} tables, ${tableIds.size} distinct C-numbers`);
say(`  S2  literal emission sites: ${literal.size} distinct C-numbers`);
say(`  computed emission sites:    ${computed.size} spelling(s) — ${[...computed.keys()].sort().join(", ")}`);
say(`  CENSUS: ${count} checks · sha256 ${digest}`);
say(`  THE LIMIT: this census is a census OF THE CATALOGUE FILE. It establishes what the`);
say(`  catalogue HOLDS, and it does not establish that any check RAN, nor that a version`);
say(`  recorded below was the version actually stamped on any past ratification.`);

const { CATALOG_VERSION, GATE_VERSION } = await import("../src/gate.mjs");
say(`  the stamp: ${GATE_VERSION}`);

/* (A1) THE CORPUS IS NON-EMPTY AND FLOORED. A headline totality assertion over an
   empty corpus has passed three times in this estate (kickoffs/WORKER.md). */
t("(A1) THE CENSUS IS NON-EMPTY AND FLOORED — both sources contributed",
  [count >= 400, tables.size >= 40, literal.size >= 50], [true, true, true]);

/* (A2) EVERY EMISSION SITE RESOLVES. A computed site is not scored zero: it is
   named here or it fails. */
{
  const unaccounted = [...computed.keys()].filter((k) => !(k in RELAYS)).sort();
  for (const k of unaccounted) console.log(`          UNACCOUNTED EMISSION SPELLING: ${k}`);
  t("(A2) EVERY EMISSION SITE RESOLVES — no computed spelling this suite cannot name",
    unaccounted, []);
}

/* (A3) THE CENSUS PIN — the arm the row is for. */
{
  const recorded = CATALOG_CENSUS[CATALOG_VERSION] || null;
  if (!recorded) {
    console.log(`          CATALOG_VERSION ${CATALOG_VERSION} has NO recorded census. Record one:`);
    console.log(`            "${CATALOG_VERSION}": { count: ${count}, digest: "${digest}" },`);
  } else if (recorded.digest !== digest) {
    console.log(`          THE CATALOGUE MOVED AND THE STAMP DID NOT. Recorded for ${CATALOG_VERSION}: `
              + `${recorded.count} checks, sha256 ${recorded.digest}. Measured now: ${count} checks, sha256 ${digest}.`);
    console.log(`          MOVE CATALOG_VERSION (MINOR) in src/gate.mjs and record the new census here:`);
    console.log(`            "<new version>": { count: ${count}, digest: "${digest}" },`);
  }
  t("(A3) THE CENSUS PIN: the catalogue's census is the one recorded for CATALOG_VERSION",
    recorded ? { count: recorded.count, digest: recorded.digest } : null, { count, digest });
}

/* (A4) ONE VERSION, ONE CATALOGUE — this row's defect inverted. */
{
  const seen = new Map();
  const collisions = [];
  for (const [v, e] of Object.entries(CATALOG_CENSUS)) {
    if (seen.has(e.digest)) collisions.push(`${seen.get(e.digest)} and ${v} record the same census`);
    else seen.set(e.digest, v);
  }
  for (const c of collisions) console.log(`          ${c}`);
  t("(A4) ONE VERSION, ONE CATALOGUE — no two recorded versions carry the same census", collisions, []);
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
t("(A5) THE STAMP READS THE CATALOGUE'S VERSION — plane-gate/1.0 (bio-checks 1.30.0)",
  [GATE_VERSION, CATALOG_VERSION], ["plane-gate/1.0 (bio-checks 1.30.0)", "1.30.0"]);
/* CORRECTED 2026-09-25 by D-147, never exempted: 1.29.0 -> 1.30.0. The catalogue gained C-94.1-11
   (LIFECYCLE_CHECKS), so the catalogue under the stamp moved and the stamp moved with it; the old literal
   named 1.29.0's catalogue, which this tree no longer holds. Edited by hand in the commit that moves the
   constant, as the note above requires. */
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
