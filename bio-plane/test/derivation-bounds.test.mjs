/* NEGATIVE CONTROL: (run 2026-08-08, rec66-agent, REC-66) FIVE armed arms and one armed by
   construction, each armed ALONE with every other held open, driven by `test/nc-rec66.mjs`
   (`cd bio-plane && node test/nc-rec66.mjs`), every file restored from a PRISTINE pre-arm
   copy named UNIQUELY PER ARM and verified by sha256 AND by `cmp`. BASELINE ROW FIRST, and
   it is not decoration: derivation-bounds **42/0**, meaning-bounds **85/0**, bounds
   **151/0**.
   (1) RESTORE THE UNBOUNDED DERIVATION — in src/store.mjs `deriveConnections`, put the
   bound-free scan back (`SELECT capture_sha, bundle_id, grade FROM resolutions WHERE
   entity_id=? ORDER BY capture_sha`) and derive over every distinct capture (`const ends =
   distinct;`). MEASURED: **derivation-bounds 29/13, and meaning-bounds 85/0 and bounds
   151/0 — BOTH SIBLINGS FULLY GREEN.** The 13 are this file's: the store holds 780
   connection rows where the bound admits 496, the scan returned 40 rows where it may return
   33, `documents` reads 40 against a `document_limit` of 32, the class walk puts
   `connect->deriveConnections` back on its roster and the ratchet fails at 30 of 29.
   **THE ARM THAT DECIDES THE ITEM — and the two green siblings are the finding beside it:
   an envelope stays perfectly honest over an unbounded scan, which is D-227 reproduced one
   step earlier and the whole reason this file exists.**
   (2) THE NAIVE FIX — the one a review passes and this suite must not: leave the derivation
   unbounded and CUT THE ANSWER instead (`connections.slice(0, cap)`, `count` and
   `documents` clamped, `limit`/`truncated` still published honestly). MEASURED:
   **derivation-bounds 33/9, meaning-bounds 85/0, bounds 151/0.** The RESPONSE arms pass —
   the answer is the right size and says it was cut — and every DERIVATION arm fails: 780
   rows in the store, 40 documents read, `resolution_rows` 40. **This is the arm that proves
   the two fixes are distinguishable at all.**
   (3) BREAK THE TAINT PROPAGATION — in this file, the `if (mentions(m[2], tainted))
   tainted.add(m[1])` pass deleted, so a collection DERIVED from an unbounded scan is no
   longer unbounded. MEASURED: **37/5**, headed by the SUBJECT-SHAPE arm: the walk stops
   seeing the pre-REC-66 `deriveConnections` shape at all (its amplifying loops iterate
   `ends`, never `rows`), the class FLOOR fails and the by-name pin fails. **The cause of
   the first draft's blindness, named — a longer list of loop spellings would never have
   found it.**
   (3a) AND THIS ARM FOUND A DEFECT IN THE INSTRUMENT RATHER THAN CONFIRMING IT, which is
   why the numbers above are the SECOND run's. On the first run the SUBJECT-SHAPE arm STAYED
   GREEN under a broken taint: a BRACE-LESS loop body (`for (const r of rows) byKey.set(…);`)
   was given an extent that ran to the next block in the method and SWALLOWED the quadratic
   loops. The walk was right for the wrong reason. `loopBodyEnd` was written for that, and a
   second reading of the same run found the mirror defect — a `for…of` whose iterable
   contains a `)` (`mine.slice(0, Math.max(0, n))`) ended its header early and DROPPED the
   loop, taking `selectionCreate` off the roster. Both are corrected and both corrections
   are stated at the site.
   (4) NEUTER THE WALK — `if (1) return out;` at the head of `classMembers`. MEASURED:
   **33/9**, corpus PRINTED AS ZERO, every REACH-AS-A-DELTA arm among the failures together
   with the FLOOR and both SUBJECT-SHAPE arms. **The CEILING stays green over the empty
   roster**, which is exactly why the floor is there.
   (5) OVER-STRICTNESS — five arms, all PASSING on the clean tree and all RED under (4) or
   (3), which is what makes them armed rather than decorative: a bounded scan with the same
   nested loops is NOT in the class; a LINEAR read over an unbounded scan is NOT (this class
   is amplification, not size); quadratic work over a CALLER-SUPPLIED array with no scan is
   NOT; a per-row scan phrased with `.map` and no `for` anywhere IS; and live, a small
   subject is derived WHOLE — neither truncated nor refused.
   (6) UNARM THE FIXTURE — `BIG_K = 3`, a quadratic subject too small for the bound to bite.
   MEASURED: **32/10.** The fixture arm fails first and every `truncated: true` arm with it,
   which is the proof that those arms are not passing at zero cost over a fixture that could
   never have cut.

   ===== REC-99 / D-365, 2026-09-15 — THE ARMS FOR THE GRADED CENSUS. SIX arms, each armed
   ALONE with every other held open, driven by `test/nc-rec99.mjs` (`cd bio-plane && node
   test/nc-rec99.mjs`), every file restored from a PRISTINE copy named UNIQUELY PER ARM and
   verified by sha256 AND by `cmp` (2,088,831 bytes on `store.mjs`, floored, 0 copies left
   behind, and the CLOSING baseline re-measured equal to the opening one). Every arm asserts
   it ARMED — the patch must match EXACTLY ONCE — and all six did.
   BASELINE ROW FIRST: derivation-bounds **50/0, census 103** · bounds **167/0** ·
   meaning-bounds **92/0**.
   (7) THE RATCHET'S OWN FIGURE RAISED BY ONE BY HAND (103 -> 104). MEASURED: **49/1**, the
   CENSUS FLOOR and nothing else, census still printing 103. **This is the arm that says the
   census is GRADED rather than reported** — before this item the same edit was impossible to
   make, because there was no figure to raise.
   (8) `LIMIT ?` AND ITS `cap + 1` REMOVED FROM `resolutionsForCapture` — D-365's own arm.
   MEASURED: **46/4, census 104**, and the failure NAMES THE READ:
   `["resolutionsForCapture:rows (no SQL LIMIT)"]`. **The siblings stayed FULLY GREEN —
   bounds 167/0, meaning-bounds 92/0 — which is D-365's measurement reproduced exactly**: the
   envelope is honest over an unbounded scan and only this file can see it. The difference from
   2026-09-14 is that the walk now FAILS on what it counts.
   (9) THE SAME ON `documentsConcerning`. MEASURED: **46/4, census 104**, naming
   `["documentsConcerning:scan (no SQL LIMIT)"]`, siblings green.
   (9b) THE SAME ON `connectionsFor`'s ENTITY ARM. MEASURED: **46/4, census 104**, naming
   `["connectionsFor:scan (no SQL LIMIT)"]`, siblings green. **AND THIS ARM FOUND A DEFECT IN
   THE INSTRUMENT RATHER THAN CONFIRMING IT, which is why this row is the second run's:** on
   the first run it read 47/3, because the by-name arm asked only that the three reads appear
   in `graded` — and `connectionsFor` assigns `scan` in TWO branches, so the CAPTURE arm's
   surviving verdict satisfied the pin while the ENTITY arm was broken. The arm now requires
   absence from `violations` as well; the reason is stated at the site. The violations arm had
   caught it either way, so nothing rested on the weaker form — but an arm satisfiable by the
   healthy half of the method it pins is not pinning it.
   (10) THE CAP THAT IS NOT THE PUBLISHED CAP — `LIMIT ?`/`cap + 1` replaced by a LITERAL
   `LIMIT 5000`, so the envelope publishes 500 over a scan that read 5,000. MEASURED: **47/3,
   AND THE CENSUS DID NOT MOVE — 103, ceiling and floor both GREEN** — with the failure naming
   `["resolutionsForCapture:rows (SQL bound is not the published cap)"]`. **THIS IS THE ARM
   THAT EARNS HALF (2) ITS PLACE**: the count half is structurally incapable of seeing this,
   because the SQL is still bounded.
   (11) OVER-STRICTNESS — the same correct read in a spelling the grader did not anticipate,
   the cap passed through an alias (`const window = cap + 1`). MEASURED: **50/0, everything
   green.** A grader that reds here would be tighter than its rule.
   THE OVER-STRICTNESS ARM THE CENSUS CARRIES BY CONSTRUCTION, stated because it is easy to
   miss: the 103 reads that were ALREADY unbounded and are declared so all PASS at baseline —
   the ceiling grades ARRIVALS, never the standing roster.

   ===== M0-38 / D-369, 2026-09-15 — THE ARMS FOR THE IN-MEMORY TRUNCATION AND THE OUT-OF-REACH
   ROSTERS. SIX arms, each armed ALONE with every other held open, driven by `test/nc-m038.mjs`
   (`cd bio-plane && node test/nc-m038.mjs`), every file restored from a PRISTINE copy named
   UNIQUELY PER ARM and verified by sha256 AND by `cmp` (2,139,502 bytes on `store.mjs`, floored,
   0 copies left behind, and the CLOSING baseline re-measured equal to the opening one). Every arm
   asserts it ARMED — each patch must match EXACTLY ONCE — and all six did; two are TWO-PART
   patches and both parts are asserted independently.
   BASELINE ROW FIRST: derivation-bounds **58/0, census 104** · bounds **167/0** ·
   meaning-bounds **92/0**.
   (12) THE IN-MEMORY CUT MADE AT A BOUND THE ANSWER DOES NOT PUBLISH — `documentsNamingEntity`
   keeps `limit: cap` and `truncated: merged.length > cap` and cuts at `merged.slice(0, 5000)`.
   MEASURED: **57/1, census UNMOVED at 104, bounds 167/0, meaning-bounds 92/0**, naming
   `["documentsNamingEntity:merged (cut at a bound the published claim does not name)"]`.
   **THIS IS THE ARM THE ROW EXISTS FOR, and the three green figures beside it are the finding:
   before this block the same edit failed NOWHERE** — the census cannot move because no SQL
   changed, REC-99's inversion never looks because there is no row source, and the envelope suites
   read the honest published cap.
   (13) THE SAME ON `biasInhale`'s `bars`. MEASURED: **57/1, census 104, siblings green**, naming
   `["biasInhale:bars (cut at a bound the published claim does not name)"]` — a second method, so
   the arm measures the property and not one site.
   (14) THE CUT REMOVED ENTIRELY — `const out = items.slice(0, cap)` becomes `const out = items`,
   so `queueFeed` publishes `truncated: items.length > out.length` over a cut it no longer makes.
   MEASURED: **57/1, census 104**, naming `["queueFeed:items (claims a cut this method does not
   make)"]`. **AND `bounds` MOVED TO 165/2 HERE AND ONLY HERE, WHICH IS RECORDED RATHER THAN
   SMOOTHED:** this is the one arm whose edit changes the ANSWER as well as the claim — the feed
   returns every item — so the envelope suite legitimately catches it too. That is exactly why
   (12) and (13) carry the item: they move only WHERE THE CUT WAS MADE, and this block is then the
   sole instrument that fails.
   (15) THE SOURCE BOUND MIGRATING OUT OF REACH — `frontier`'s `this.#frontierLatest("document",
   { limit: cap + 1, … })` becomes `{ limit: 5000, … }`, so the row source is no longer fetched by
   a call the published cap controls. MEASURED: **57/1, census 104, siblings green**, and the
   failure is the OUT-OF-REACH ROSTER naming the arrival — `frontier:page` joins the five. **The
   CUT arm stayed GREEN, which is the point of taking two verdicts: the cut is still at the
   published cap and only the SOURCE moved.**
   (16) SET 2's ROSTER IS A RATCHET IN BOTH DIRECTIONS — BOTH of `biasManifest`'s row sources
   given a `LIMIT`, so the method LEAVES the census and both SET 2 rosters. MEASURED: **53/5,
   census 103**, the SET 2 pin naming `["#calDriftFor", "#frontierContent", "documentsNamingEntity",
   "frontier", "queueFeed"]` and the PARTITION pin naming the four left in it. **THE ARM CAME BACK
   WITH MORE THAN WAS DECLARED AND THE SURPLUS IS NAMED:** three failures were declared and five
   arrived — the two extra are REC-66's CLASS ratchet FLOOR and its dispatched-members pin, because
   the same edit takes `biasManifest` off the CLASS roster (34 → 33) and `biasmanifest->biasManifest`
   out of CLASS OPS. The declaration was incomplete, not the instrument: one method left three
   rosters at once, which is REC-94's arrival accounting run backwards.
   (17) OVER-STRICTNESS, AND IT IS THE ARM THAT MATTERS MOST HERE — the same CORRECT cut in a
   spelling the grader did not anticipate, the cap passed through an ALIAS (`const take = cap;`
   then `merged.slice(0, take)`). MEASURED: **58/0, census 104, everything green.** A grading that
   reds here would be tighter than its rule, and REC-99's arm (11) is the model.
   THE OVER-STRICTNESS THIS BLOCK CARRIES BY CONSTRUCTION, stated because it is the half the row
   weighted most heavily: **the five methods that publish a bound while LEGITIMATELY holding an
   unbounded scan — `#frontierContent`, `biasManifest`, `documentsNamingEntity`, `frontier`,
   `queueFeed` — all PASS at baseline, byte-identically, and nothing added here can fail them.**
   They are NAMED, not graded; the block's only failing conditions are a cut that disagrees with
   the claim, a roster that moved, and a form that arrived.

   ===== M0-40 / D-384, 2026-09-16 — THE ARMS FOR THE HOIST, AND FOR THE CORRECTION THIS ITEM
   DELIBERATELY DID NOT MAKE. SIX arms, each armed ALONE with every other held open, driven by
   `test/nc-m040.mjs` (`cd bio-plane && node test/nc-m040.mjs`), every file restored from a
   PRISTINE copy named UNIQUELY PER ARM and verified by sha256 AND by `cmp` (2,182,088 bytes on
   `store.mjs`, 116,483 on this file, both floored, 0 copies left behind, and the CLOSING
   baseline re-measured equal to the opening one). Every arm asserts it ARMED — each part must
   match EXACTLY ONCE — and all six did; two are multi-part patches and every part is asserted
   independently. **TWO ARMS PATCH THIS SUITE RATHER THAN THE PLANE, on purpose: the defect
   M0-40 measured lives in the INSTRUMENT, so two of its arms have to be able to reach it.**
   BASELINE ROW FIRST: derivation-bounds **66/0, 35 in the class / 105 scanning** · bounds
   **167/0** · meaning-bounds **92/0**.
   (18) REC-88's HOIST RECONSTRUCTED ON THE REAL `earnedBasisRegistry` — the scan taken out of
   the `for` header into a `const`, the same query and the same rows. MEASURED: **61/5, 34 in
   the class**, and the five NAME the method: REC-66's FLOOR, the by-name CLASS roster, the
   roster/count identity, the HOIST-FRAGILE roster and the worked-example pin. **THE SIBLINGS
   STAYED FULLY GREEN — bounds 167/0, meaning-bounds 92/0 — which is D-227 reproduced once
   more**: nothing the plane publishes changed, because nothing the plane does changed.
   (19) THE ARM THAT EARNS THE BY-NAME ROSTER ITS PLACE — the same hoist PLUS a new member
   arriving, so REC-88's failure is reproduced with the COUNT NEUTRALISED. MEASURED: **61/5,
   and `CLASS.size` is STILL 35, so REC-66's CEILING and FLOOR are BOTH GREEN.** Only the
   by-name arms fire. **This is the arm the item exists for**: the count that caught REC-88
   caught it by luck of arithmetic, and a wave that hoisted one method while adding another
   would have shipped green before today.
   (19a) AND IT CAME BACK WITH MORE THAN WAS DECLARED — the surplus is NAMED and the reason is
   STRUCTURAL rather than a slip. Four failures were declared and five arrived; the extra is
   REC-99's CENSUS CEILING (105 -> 106), because **a method cannot join THIS class without
   also gaining an unbounded row source, so a class-count-neutral swap necessarily moves the
   census by one.** The declaration was incomplete, not the instrument, and the two ratchets
   being unable to move independently here is worth knowing on its own.
   (20) NEUTER THE HOIST TRANSFORM — it recognises no inline row source at all. MEASURED:
   **63/3**: both rosters go EMPTY and the worked-example pin fails, while the PARTITION arm
   stays GREEN over an all-unreached partition. **That green is the whole reason the rosters
   are pinned BY NAME beside the partition** — a totality check is satisfied by a walk that
   found nothing, which is how three walks in this estate congratulated themselves in one week.
   (21) OVER-STRICTNESS — a BOUNDED row source written inline in a for-header, with real nested
   loops and a write in its body: correct work in the exact spelling the classifier is
   sensitive to. MEASURED: **66/0, census unmoved at 105, everything green.** A roster that
   enrolled it would be tighter than its rule.
   (22) OVER-STRICTNESS, THE OTHER DIRECTION — the same arrival with its row source UNBOUNDED,
   so it genuinely joins the class with amplification its BODY carries. MEASURED: **61/5, 36 in
   the class**, the CEILING and the by-name roster naming the arrival — **and HOIST-FRAGILE
   STAYED GREEN**, which is the arm that proves fragile and stable are told apart on a real
   arrival and not only on a fixture. The same census surplus as (19a), same structural cause.
   (23) THE CORRECTION D-384 PRICES, ARMED SO IT CANNOT BE MADE SILENTLY — the header credit
   removed, so a scan that is the loop's own row source is no longer counted as a scan PER ROW.
   MEASURED: **59/7, 14 in the class** — twenty-one departures — with the pinned
   `ncLinearInline` contradiction RED and REC-66's own CLASS OPS pin red beside it. **This is
   the arm that says M0-40 chose not to do something rather than failed to see it**: the
   correction is available, it is one substitution, and what it costs is a ceiling falling by
   twenty-one methods, which is a decision about what the class MEANS and not a worker's.
*/
/* REC-66 · D-224 / D-227 — THE BOUND ON THE DERIVATION, AND THE WALK FOR ITS CLASS.
 * ============================================================================
 *
 * `op=connect` was D-225's class one step earlier and strictly worse than the three REC-60
 * fixed. Those three returned an unbounded ANSWER over rows that already existed. This one
 * READ THE ENTITY'S RESOLUTIONS WITH NO LIMIT and then did k(k-1)/2 work to produce the
 * answer — so **the derivation was unbounded, not merely the response**, and a cap on the
 * array it returned would have left the scan and the write exactly where they were.
 *
 * THAT DISTINCTION IS THIS FILE'S SUBJECT, and it is why the file exists beside
 * `bounds.test.mjs` (which pins the published envelope) and `meaning-bounds.test.mjs`
 * (which grades what a method publishes). **Neither of them can see it**: D-227 measured an
 * envelope staying perfectly honest over a scan whose `LIMIT` had been removed, and the
 * negative control (2) above reproduces that here on purpose. What proves a derivation
 * bounded is not the answer's shape but **the work the store actually did** — how many rows
 * the scan returned, how many documents were read, how many rows were WRITTEN.
 *
 * THE WALK ASKS A THIRD QUESTION, and it is not the bare-collection roster's:
 *   REC-60 asked  *what does this method PUBLISH, and is it bounded?*
 *   REC-70 asked  *which dispatched ops does that walk not reach at all?*
 *   THIS asks     **which methods DERIVE — do work amplified per row — over a scan that is
 *                   itself unbounded?** A read may answer a small number after doing an
 *                   enormous amount of work, and every instrument above it reads clean.
 *
 * THE MECHANISM, AND IT IS TAINT PROPAGATION RATHER THAN A LIST OF SPELLINGS. The first
 * draft of this walk looked for a loop iterating a local assigned straight from an
 * unbounded `#rows(` call, plus a nested loop or a write inside it. **IT DID NOT SEE ITS
 * OWN SUBJECT.** `deriveConnections` collapsed `rows` into a Map, took `ends` out of the
 * Map, and looped over `ends` — so the amplifying loops never mentioned the scan's local at
 * all. Lengthening a list of loop shapes would not have found that in a hundred years; what
 * finds it is the property itself: **a collection GROWN inside a loop over an unbounded
 * collection, or ASSIGNED from an expression mentioning one, IS unbounded**, iterated to a
 * fixed point. The synthetic SUBJECT-SHAPE arm below is that draft's failure kept as a
 * test, and negative control (3) re-arms it.
 *
 * WHAT THIS WALK CANNOT SEE, stated here rather than discovered later:
 *   - It reads ONE FILE, `store.mjs`, and one method at a time. Work done in a HELPER the
 *     method calls is invisible; the helper is judged on its own body, and if the helper
 *     receives the unbounded collection as an ARGUMENT the taint does not cross into it.
 *   - It cannot see amplification inside SQL. A JOIN that fans out, or a correlated
 *     subquery, is one `#rows(` call to this reader.
 *   - It reads `LIMIT` as the only bound. A scan bounded by a `WHERE` over a key that
 *     happens to be unique reads as unbounded here — the safe direction, and it is why the
 *     class roster is a CEILING that may fall rather than a list of defects.
 *   - Recursion is invisible, and so is a loop whose iterable is rebuilt through a function
 *     call the taint cannot follow (`JSON.parse(JSON.stringify(rows))`).
 *   - `.map`/`.forEach`/`.filter`/`.reduce`/`.flatMap` on a tainted receiver ARE followed;
 *     any other callback form is not.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ==========================================================================
 * THE WALK — every method that derives over an unbounded scan.
 * ========================================================================== */
const SRC_STORE = readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8");

/* Comments blanked before any anchor is matched — the siblings' reader, reused because it
   was measured there. A walk whose anchors match PROSE measures the prose, and this file's
   header names its own subject a dozen times. */
const decomment = (text) => text.split("\n").map(((state) => (L) => {
  let out = "", i = 0;
  while (i < L.length) {
    if (state.block) {
      const e = L.indexOf("*/", i);
      if (e < 0) { i = L.length; } else { state.block = false; i = e + 2; }
      continue;
    }
    const b = L.indexOf("/*", i), s = L.indexOf("//", i);
    if (b >= 0 && (s < 0 || b < s)) { out += L.slice(i, b); state.block = true; i = b + 2; continue; }
    if (s >= 0 && (b < 0 || s < b)) { out += L.slice(i, s); i = L.length; continue; }
    out += L.slice(i); i = L.length;
  }
  return out;
})({ block: false })).join("\n");

/* Method segments bounded by the NEXT signature — `bounds.test.mjs`'s segmenter. */
const segments = (code) => {
  const lines = code.split("\n");
  const sig = /^ {2}(?:static\s+|async\s+)?(#?[A-Za-z_$][\w$]*)\s*\(/;
  const heads = [];
  for (let i = 0; i < lines.length; i++) { const m = sig.exec(lines[i]); if (m) heads.push([i, m[1]]); }
  const out = new Map();
  for (let k = 0; k < heads.length; k++) {
    const j = k + 1 < heads.length ? heads[k + 1][0] : lines.length;
    out.set(heads[k][1], lines.slice(heads[k][0], j).join("\n"));
  }
  return out;
};

const closeParen = (s, from) => {
  let i = s.indexOf("(", from), d = 0;
  for (; i >= 0 && i < s.length; i++) { if (s[i] === "(") d++; else if (s[i] === ")") { d--; if (!d) return i + 1; } }
  return s.length;
};
/* THE EXTENT OF A LOOP BODY, and this reader was WRONG in its first draft in a way only a
   negative control could have shown. It used to be "brace-match from the next `{`" — and a
   BRACE-LESS loop body (`for (const r of rows) byKey.set(r.a, r);`) has no `{` of its own,
   so the extent ran forward to the NEXT block in the method and swallowed it. That made
   negative control (3) pass for the wrong reason: with the taint propagation deleted, the
   subject-shape arm STAYED GREEN because the collapse loop's extent had absorbed the
   quadratic loops it was never supposed to reach. **A control finding the instrument wrong
   rather than the subject, for the sixth recorded time in this estate.** A single-statement
   body now ends at its own `;`, at depth zero, exactly as the language says. */
const loopBodyEnd = (s, headEnd) => {
  let i = headEnd;
  while (i < s.length && /\s/.test(s[i])) i++;
  if (s[i] !== "{") {
    let d = 0;
    for (; i < s.length; i++) {
      if ("{[(".includes(s[i])) d++;
      else if ("}])".includes(s[i])) { if (!d) return i; d--; }
      else if (s[i] === ";" && !d) return i + 1;
    }
    return s.length;
  }
  let d = 0;
  for (; i < s.length; i++) { if (s[i] === "{") d++; else if (s[i] === "}") { d--; if (!d) return i + 1; } }
  return s.length;
};
/* Every `#rows(` call and whether its SQL carries a LIMIT. The same reader
   `meaning-bounds.test.mjs` uses for its verdicts, deliberately, so the two files cannot
   disagree about what "bounded" means at the row source. */
const scans = (body) => {
  const out = []; const re = /#rows\(/g; let m;
  while ((m = re.exec(body))) {
    const end = closeParen(body, m.index + m[0].length - 1);
    out.push({ from: m.index, to: end, bounded: /\bLIMIT\b/i.test(body.slice(m.index, end)) });
  }
  return out;
};
const mentions = (expr, ids) =>
  [...ids].some((id) => new RegExp(`\\b${id.replace(/\$/g, "\\$")}\\b`).test(expr));

/* THE ANALYSIS. Seeds, fixed-point taint, tainted loops, amplification. */
const analyse = (body) => {
  const sc = scans(body);
  const unbounded = sc.filter((s) => !s.bounded);
  const tainted = new Set();
  /* SEED: a local assigned straight from an UNBOUNDED scan. */
  { const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*[^;]*/g; let m;
    while ((m = re.exec(body)))
      if (unbounded.some((s) => s.from > m.index && s.from < m.index + m[0].length)) tainted.add(m[1]); }
  const loopsOver = (ids) => {
    const out = []; let m;
    /* THE HEADER IS READ WITH BALANCED PARENTHESES, not with `[^)]*`, and that too is a
       correction the controls forced. `for (const old of mine.slice(0, Math.max(0, n)))`
       has a `)` inside its iterable, so a non-balanced reader ended the header early, took
       the wrong body extent, and DROPPED the loop — `selectionCreate` left the class roster
       for no reason but a regex. One reader for both `for…of` and the counted `for`. */
    const forHead = /\bfor\s*\(/g;
    while ((m = forHead.exec(body))) {
      const end = closeParen(body, m.index);
      const head = body.slice(m.index, end);
      const of = head.indexOf(" of ");
      const iterable = of >= 0 ? head.slice(of + 4, -1)
                     : head.includes(";") ? head.split(";")[1] : "";
      if (!iterable.trim()) continue;
      if (mentions(iterable, ids) || unbounded.some((s) => s.from > m.index && s.from < end))
        out.push({ from: m.index, to: loopBodyEnd(body, end) });
    }
    for (const id of ids) {
      const cb = new RegExp(`\\b${id.replace(/\$/g, "\\$")}\\s*\\.\\s*(?:map|forEach|flatMap|filter|reduce)\\s*\\(`, "g");
      let x; while ((x = cb.exec(body))) out.push({ from: x.index, to: closeParen(body, x.index + x[0].length - 1) });
    }
    return out;
  };
  /* THE FIXED POINT, and it is the whole reason this walk sees its own subject: a
     collection ASSIGNED FROM a tainted expression is tainted, and a collection GROWN
     inside a loop over a tainted one is tainted. `deriveConnections` reached its pairs
     through a Map and an array spread, two hops from the scan. */
  for (let round = 0; round < 8; round++) {
    const before = tainted.size;
    const loops = loopsOver(tainted);
    const inLoop = (i) => loops.some((L) => i > L.from && i < L.to);
    { const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]*)/g; let m;
      while ((m = re.exec(body))) if (mentions(m[2], tainted)) tainted.add(m[1]); }
    { const re = /\b([A-Za-z_$][\w$]*)\s*\.\s*(?:push|set|add|unshift|concat)\s*\(/g; let m;
      while ((m = re.exec(body))) if (inLoop(m.index)) tainted.add(m[1]); }
    if (tainted.size === before) break;
  }
  const loops = loopsOver(tainted);
  const inLoop = (i) => loops.some((L) => i > L.from && i < L.to);
  /* AMPLIFICATION: work whose cost is a MULTIPLE of the unbounded scan — another loop, a
     write, or another scan, per row. A single linear pass is not this class and must not
     be called one; that is an over-strictness arm below. */
  const nested = [...body.matchAll(/\b(?:for|while)\s*\(/g)].filter((x) => inLoop(x.index)).length;
  const writes = [...body.matchAll(/this\.sql\.exec\(/g)].filter((x) => inLoop(x.index)).length;
  const perRowScan = sc.filter((s) => inLoop(s.from)).length;
  return { scans: sc.length, unbounded: unbounded.length, tainted: [...tainted],
           loops: loops.length, nested, writes, perRowScan, amplified: nested + writes + perRowScan };
};

const classMembers = (code) => {
  const out = new Map();
  for (const [name, body] of segments(code)) {
    const a = analyse(body);
    if (!a.unbounded || !a.loops || !a.amplified) continue;
    out.set(name, a);
  }
  return out;
};
/* op -> method, off the dispatch arrow. The siblings' reader, reused. */
const dispatchedOps = (code) => {
  const out = new Map();
  const re = /^\s+([a-z][a-z0-9]*):\s*(?:async\s*)?\(\)\s*=>\s*(?:await\s+)?this\.([A-Za-z_$][\w$]*)\(/gm;
  let m; while ((m = re.exec(code))) out.set(m[1], m[2]);
  return out;
};

const CODE = decomment(SRC_STORE);
const SEGMENTS = segments(CODE);
const CLASS = classMembers(CODE);
const DISPATCHED = dispatchedOps(CODE);
const SCANNING = [...SEGMENTS].filter(([, b]) => scans(b).some((s) => !s.bounded)).length;
const CLASS_OPS = [...DISPATCHED].filter(([, meth]) => CLASS.has(meth))
  .map(([op, meth]) => `${op}->${meth}`).sort();

console.log("\n--- WALK: every method that DERIVES over an unbounded scan (REC-66's class) ---");
console.log(`  CORPUS: store.mjs ${SRC_STORE.split("\n").length} lines, ${SEGMENTS.size} method segments, `
          + `${SCANNING} scanning UNBOUNDED, ${CLASS.size} in the class, reaching ${CLASS_OPS.length} of `
          + `${DISPATCHED.size} DISPATCHED ops`);
for (const [name, a] of CLASS)
  console.log(`    ${name.padEnd(30)} unbounded=${a.unbounded} loops=${a.loops} `
            + `nested=${a.nested} writes=${a.writes} scans-per-row=${a.perRowScan}`);
console.log(`  CLASS OPS: ${CLASS_OPS.join(", ")}`);

/* ------------------------------------------------------------------- GUARDS. */
t("WALK GUARD: comments are blanked, and a known CODE line SURVIVES it",
  /static SEARCH_ORPHAN_MAX = 100;/.test(CODE), true);
t("WALK GUARD: and a known PROSE line does NOT — this file's own subject is named in the source's comments",
  /the DERIVATION was unbounded, not merely the response/.test(CODE), false);
t("WALK GUARD: the segmenter partitions the class into a plausible number of methods",
  SEGMENTS.size > 250, true);
t("WALK GUARD: the corpus is NON-EMPTY at every level the verdict depends on — methods, unbounded "
+ "scans, class members, dispatched ops. A headline assertion over an empty corpus is how three "
+ "walks congratulated themselves this week",
  [SEGMENTS.size > 0, SCANNING > 0, CLASS.size > 0, DISPATCHED.size > 100], [true, true, true, true]);

/* ---------------------------------------------- THE SUBJECT SHAPE, BOTH DIRECTIONS.
   The pre-REC-66 `deriveConnections` in miniature, kept as a fixture rather than as a
   memory: an unbounded scan, a collapse into a Map, an array taken OUT of the Map, and the
   quadratic loops over THAT — so the amplifying loops never mention the scan's own local.
   The first draft of this walk found nothing here, which is the whole reason the taint
   propagates. Negative control (3) deletes the propagation and this arm goes red. */
const SUBJECT_UNBOUNDED = `class Z {
  ncDerive({ id } = {}) {
    const rows = this.#rows(\`SELECT a, b FROM t WHERE id=? ORDER BY a\`, id);
    const byKey = new Map();
    for (const r of rows) byKey.set(r.a, r);
    const ends = [...byKey.values()];
    const out = [];
    for (let i = 0; i < ends.length; i++) {
      for (let j = i + 1; j < ends.length; j++) {
        this.sql.exec(\`INSERT INTO pairs (a,b) VALUES (?,?)\`, ends[i].a, ends[j].a);
        out.push({ a: ends[i].a, b: ends[j].a });
      }
    }
    return { ok: true, count: out.length, out };
  }
  end() { return 1; }
}`;
/* The same shape with the scan BOUNDED — the fix, phrased as a fixture. */
const SUBJECT_BOUNDED = SUBJECT_UNBOUNDED
  .replace("WHERE id=? ORDER BY a`, id)", "WHERE id=? ORDER BY a LIMIT ?`, id, cap + 1)");
t("SUBJECT SHAPE: the walk SEES the pre-REC-66 derivation — an unbounded scan collapsed through a "
+ "Map and a quadratic loop over what came OUT of the Map, which is the exact shape whose amplifying "
+ "loops never mention the scan's own local",
  [classMembers(SUBJECT_UNBOUNDED).has("ncDerive"),
   classMembers(SUBJECT_UNBOUNDED).get("ncDerive")?.amplified > 0], [true, true]);
t("SUBJECT SHAPE (the other direction): the SAME shape with the scan bounded is NOT in the class — "
+ "so the arm above measures the bound and not the loops",
  classMembers(SUBJECT_BOUNDED).has("ncDerive"), false);
t("SUBJECT SHAPE: and the taint reached it through TWO hops — the Map it was collapsed into and the "
+ "array taken out of it. A reader that followed only the scan's own local finds nothing here, which "
+ "is what the first draft of this walk did",
  ["byKey", "ends", "out"].filter((v) => !(classMembers(SUBJECT_UNBOUNDED).get("ncDerive")?.tainted || []).includes(v)),
  []);

/* -------------------------------------------------------------- THE ITEM'S OWN OP. */
t("REC-66: `op=connect` is OFF this class roster — the derivation's scan is bounded, and this is "
+ "measured off the source by the walk that would otherwise name it",
  CLASS_OPS.filter((e) => e.startsWith("connect->")), []);
t("REC-66: and `deriveConnections` scans rows and has NO unbounded scan left in it — stated "
+ "positively, so the arm fails if the method is ever returned to the state this item found it in",
  (() => { const a = analyse(SEGMENTS.get("deriveConnections") || ""); return [a.scans > 0, a.unbounded]; })(),
  [true, 0]);
/* D-227's PIN, one step earlier than D-227 wrote it. The published envelope cannot stand in
   for the SQL bound — CONDUCT measured an honest envelope over an unbounded scan at REC-60's
   integration — so both bounds are pinned off this method's own comment-stripped segment. */
t("REC-66 / D-227: the SQL bounds themselves, pinned off `deriveConnections`' comment-stripped "
+ "segment — the scan is bounded by DOCUMENTS (the inner select) and by ROWS (the outer LIMIT), "
+ "and both ask for one more than they may use so the answer can tell that more existed",
  [/SELECT capture_sha FROM resolutions WHERE entity_id=\? GROUP BY capture_sha\s+ORDER BY capture_sha LIMIT \?/
     .test(SEGMENTS.get("deriveConnections") || ""),
   /ORDER BY capture_sha LIMIT \?`, entityId, entityId, endsCap \+ 1, rowCap \+ 1\)/
     .test(SEGMENTS.get("deriveConnections") || "")], [true, true]);
t("REC-66: the bound is the plane's OWN pair and is not a literal at the call site — the document "
+ "bound is DERIVED from the pair bound by #maxEndsForPairs, so the two can never disagree",
  [/Store\.#MEANING_LIMIT_DEFAULT/.test(SEGMENTS.get("deriveConnections") || ""),
   /Store\.#MEANING_LIMIT_MAX/.test(SEGMENTS.get("deriveConnections") || ""),
   /Store\.#maxEndsForPairs\(cap\)/.test(SEGMENTS.get("deriveConnections") || "")], [true, true, true]);

/* ------------------------------------------------------------------ THE RATCHET.
   The class is REAL and this item does not pretend to have emptied it: 29 methods derive
   over an unbounded scan and 10 of them are reachable through the control plane. What is
   pinned is that it cannot GROW, and — separately — that it cannot SHRINK without somebody
   moving the figure, because a roster that shrank because the READER broke is the failure
   every walk in this estate has now met at least once. */
/* MOVED 29 -> 30 AT INTEGRATION 2026-08-08 by CONDUCT, and the ratchet EARNED ITSELF
   ON ITS FIRST DAY. REC-66 landed this pin in the morning; by the evening REC-63 had
   landed `op=provenanceroute`, whose marker walk derives over `auditPass`'s unbounded
   scan — so `audit->auditPass` JOINED THE CLASS and the ceiling fired, naming it.
   Neither worker could see the other: REC-66 measured 29 correctly on its own tree and
   REC-63 added a method that qualifies, and a class membership count is a property of
   the MERGED source exactly as `regionLines` and the register floor are.
   BOTH HALVES MOVE TOGETHER AND THE BY-NAME ROSTER GAINS ITS MEMBER, because the pin's
   own text says a bare count is satisfied by ANY ten — moving the number without naming
   the arrival would leave the pin asserting a size over a set nobody checked, which is
   the shape REC-66 wrote it to prevent. THIS IS NOT A REGRESSION AND IS NOT LICENSED AS
   ONE: `auditPass` is bounded at 20 with `markedTotal` published, so the new op reads a
   bounded page; it qualifies for the class because the DERIVATION walks the scan, which
   is precisely the distinction REC-66 established when it proved that capping the answer
   would leave the scan in place. Whether it needs its own bound is REC-66's question one
   op later, and it is delegated rather than answered here. */
/* MOVED 30 → 31 ON 2026-08-10 BY D-280, AND THE ARRIVAL IS NAMED BECAUSE THE PIN
   ABOVE SAYS A BARE COUNT IS SATISFIED BY ANY SET. **THE NEW MEMBER IS
   `#routeTask`, MEASURED AND NOT GUESSED**: the roster was re-derived over
   `git show HEAD:bio-plane/src/store.mjs` and over the working tree by this same
   walk, and `comm` reports exactly one arrival and no departure. `restingOn` and
   `#requiredStrengthFor` also changed in that item and neither moved the class —
   `#requiredStrengthFor` was ALREADY a member, which is worth knowing.

   WHY IT QUALIFIES: it stopped reading one row with `#one` and now reads the
   citing-project rows for the target and asks, per row, whether that citer
   WITHDREW (D-267's `#refEdgeSevered`, which must read the citing document —
   `refs` carries the relation and drops the status, so the question cannot be
   asked in SQL). That is a derivation walking a scan, which is exactly REC-66's
   distinction and exactly why capping an answer would not have helped.

   WHY IT IS NOT A REGRESSION, AND IT IS NOT LICENSED AS ONE. Two bounds, and
   the second is the one that matters: the scan is `WHERE r.target_id = ?` over
   the `refs_target` index, so it is bounded by the FAN-IN OF ONE DOCUMENT and
   never by the corpus; and the loop is a `find` that STOPS AT THE FIRST LIVE
   CITER, so in the ordinary case — no withdrawals — it performs exactly the one
   document read the old `#one` shape performed. The extra work is bounded by the
   number of consecutively-withdrawn citers ahead of a live one. No literal bound
   was invented at the call site, because this file's own REC-66 arm is that a
   bound belongs to the plane and not to the caller. Whether this read wants a
   real bound is REC-66's question one method later, and it is DELEGATED rather
   than answered here. */
/* MOVED 31 → 30 ON 2026-08-10 BY CASE-2, AND THE DEPARTURE IS NAMED AND MEASURED
   BECAUSE THIS FIGURE HAS A FLOOR AS WELL AS A CEILING. The FLOOR exists exactly
   so a shrinking roster cannot read as progress — REC-60's 27 was a shrunken
   measurement nobody could distinguish from an improvement and it went unnoticed
   for two days — so a session that lowers it owes the same account as one that
   raises it.

   **THE DEPARTED MEMBER IS `#requiredStrengthFor`, MEASURED AND NOT INFERRED.**
   The roster was re-derived by THIS SAME WALK over `git show HEAD:bio-plane/src/store.mjs`
   and over the working tree, and `comm` over the two sorted rosters reports
   EXACTLY ONE DEPARTURE AND NO ARRIVAL. That is the same instrument and the same
   method D-280 used to name its own arrival one entry up, run in the opposite
   direction.

   WHY IT LEFT: it did not stop qualifying — it ceased to exist. Bob ruled DEC-72
   on 2026-08-10, making the standard of evidence a property of a PROJECT;
   `CASE-AS-PRODUCTION.md`'s supersession table removes DEC-17's
   strictest-across-citers composition, which WAS the cross-citer walk that put
   this method in the class.

   **AND ITS REPLACEMENT DELIBERATELY DOES NOT JOIN.** `#projectBar` reads ONE
   project's bundle.md with `#one` and walks nothing — no scan, so no
   amplification, so no membership. That is asserted rather than assumed: the
   walk above ran over the working tree and reports no arrival at all. A
   replacement that had quietly re-entered the class would mean the composition
   survived under a new name, and this ratchet is one of the two instruments in
   the estate that could have seen it. */
/* MOVED 30 -> 31 on 2026-09-10 by CASE-4, AND THE ARRIVAL IS NAMED RATHER THAN
   ABSORBED: `#flagCasesOnRevision`, the revision flag DEC-72 requires, raised in
   `promote()` when the version a case froze is replaced.
   WHAT THE WALKER SEES AND WHAT IS ACTUALLY THERE, stated because a ratchet
   moved without its measurement is the thing this instrument exists to catch.
   The walker sees a `#rows(` with no LIMIT followed by a `for`, which is exactly
   its class definition and it is right to name it. The SCAN, measured: it is
   `published_case_members WHERE bundle_id=? AND version_sha=?` — an equality on
   the indexed leading column (`published_case_members_bundle`, CASE-1's) AND an
   equality on the pinned hash. A row can only match if some case edition froze
   THIS finding at THIS exact sha, so the result is bounded by the number of case
   editions holding one hash, which the schema makes at most one per (case,
   edition).

   ===== CORRECTED BY D-309, 2026-09-10 — THE BOUND IS UNCHANGED AND ITS REASON IS
   NOT. This paragraph used to finish: *"and which is 1 in every shape the plane
   can currently produce (a finding belongs to one case — FINDING_IN_ANOTHER_CASE
   — so the ceiling is that case's edition count)."* D-309 deletes that refusal in
   order to enact DEC-72 clause 6, so the parenthesis became FALSE the moment the
   fence came down, and a bound argument resting on a deleted rule is a bound
   nobody is checking. Corrected here rather than exempted.

   WHAT THE BOUND IS NOW, and it is still small and still measured: the result is
   bounded by the number of (case, edition) pairs that froze THIS finding at THIS
   exact sha. A finding may now serve many cases, so the ceiling is the sum of
   those cases' edition counts rather than one case's — a larger constant, still a
   constant, and still not a function of corpus size. In practice it stays at 1
   for the common shape for a reason D-309 measured rather than assumed: joining a
   second case REVISES the member (`op=publish` promotes every member), so each
   case pins a DIFFERENT sha and only a case document authored before the first
   ratification can pin one twice. The LOOP does one indexed `cases` lookup and
   one INSERT per matched row. It is a real member of the class by the walker's
   own definition and is counted honestly; the bound is stated here rather than
   claimed by exempting it, because an exempted member is a rule nobody is
   enforcing. */
/* CASE-5b / DEC-72, 2026-09-10: THE ARRIVAL IS `#caseClaimInBytes`, AND THE BOUND
   IS MEASURED AND STATED RATHER THAN CLAIMED BY EXEMPTING IT — the same posture
   `#flagCasesOnRevision` above takes, and for the same reason: an exempted member
   is a rule nobody is enforcing.

   WHAT THE WALKER SEES AND WHAT IS ACTUALLY THERE. It sees a `#rows(` with no
   LIMIT followed by a `for`, which is exactly its class definition and it is
   right to name it. The SCAN, measured: `SELECT case_id, edition, text FROM
   case_documents WHERE ratified_at IS NULL` — every case document AUTHORED AND
   NOT YET SIGNED. The loop parses each one's frontmatter and looks for this
   finding at this finding's current hash.

   THE BOUND IS THE NUMBER OF CEREMONIES STARTED AND NOT FINISHED, which is a
   different quantity from "the corpus" in a way worth being exact about: a row
   leaves this set permanently the moment a member signs it (`ratified_at` is
   stamped once and never cleared), and the whole-store `purge` clears exactly
   the unsigned ones. So it does not grow with the number of published cases, the
   number of findings, or the age of the instance — only with the number of
   publications a group opened and abandoned. It is 0 on an instance where every
   ceremony was completed.

   WHY IT IS A SCAN AT ALL, since the honest answer is not "it had to be": the
   pins live INSIDE the signed document, which is the whole point of the item, so
   there is no column to index them by until a signature commits them to
   `published_case_members`. A derived index over unsigned documents would be a
   second authority for a fact the signature does not yet cover — the shape this
   record refuses — so the scan is the price of the pins being authored rather
   than projected, and it is paid over the smallest set in the store. */
/* 32 -> 33, 2026-09-14 by REC-93 (IC-92). THE ARRIVAL IS `frontier`, and this
   ratchet fired on it correctly rather than pedantically, so the reason is
   recorded here rather than the number being nudged.
   WHAT IT ACTUALLY CAUGHT: `Store#frontier` loops over the rows its scan
   returned and issues queries PER ROW — two in `#frontierVerification`
   (`last_verified`, and the earliest LOOKED_INDETERMINATE after it) and one
   against `register` to annotate a `result_ref` whose capture has been purged.
   That is genuine amplification and the classifier is right to name it.
   WHY IT IS ADMITTED RATHER THAN REWRITTEN: the scan underneath it is
   `LIMIT`-bounded and the bound is PUBLISHED on every answer, including the
   empty one — `FRONTIER_LIMIT_DEFAULT` 200, `_MAX` 2000, driven in
   `bounds.test.mjs` where a cap of one provably bites. So the work is bounded by
   a figure a caller can read, not by how much the instance has ever looked at,
   which is the property this ratchet exists to protect. The honest cost is
   stated rather than hidden: at the default cap this method issues up to ~600
   round trips inside the DO, and if the frontier ever needs to answer at 2000
   the three per-row reads should be folded into the scan first.
   THE FIGURE IS TAKEN FROM THIS ARM'S OWN FAILURE OUTPUT, never by adding one.

   33 -> 34, 2026-09-15 by REC-94 (IC-95). THE ARRIVAL IS `#frontierContent`, the
   content level of the same reader, and the ratchet fired on it for the same
   reason and is admitted on the same terms — stated again rather than inherited,
   because "the neighbouring method was allowed" is not an argument.
   WHAT IT CAUGHT: three queries per row — the two in `#frontierVerification`
   that `frontier` already pays, plus one against `register` that resolves the
   capture to the bundle REC-36's withholding is applied over. It is three and
   not four because the drift join is asked ONCE for the whole answer and never
   per row; `#calDriftFor` is itself bounded at birth, by this arm's own doing.
   WHY IT IS ADMITTED: the same property, measured and not assumed — the scan is
   the SAME `#frontierLatest` under the SAME published `FRONTIER_LIMIT_DEFAULT`
   200 / `_MAX` 2000, so the cost is bounded by a figure the caller reads off the
   answer. The honest cost is the same ~600 round trips at the default cap, and
   the same remedy applies first if this ever has to answer at 2000: fold the
   three per-row reads into the scan.
   WHAT WOULD HAVE BEEN WRONG: dropping the register read to keep the count down.
   That read is the fence — without it the content frontier discloses which
   documents a project holds to a viewer who may not see them — and a ratchet
   that pressures an item into removing a fence is a ratchet being read as a
   rule about numbers rather than about work. The figure moved; the fence stayed.
   34 -> 35, 2026-09-15 by REC-95. THE ARRIVAL IS `#frontierMeaning`, the MEANING
   level of the same reader, and it is the third time this one reader has moved
   this ceiling — document (REC-93), content (REC-94), meaning (REC-95). It is
   admitted on the same terms, STATED AGAIN rather than inherited, because "the
   neighbouring method was allowed" is not an argument and "my own two siblings
   were allowed" is a worse one.
   WHAT IT CAUGHT: the per-row reads this level cannot avoid — the two in
   `#frontierVerification` that both siblings already pay, plus the register read
   that resolves a capture to the bundle REC-36's withholding is applied over,
   plus ONE `#missingMeaningCause` per subject that has no row. The last is this
   level's own cost and it is the one worth naming: §5.1 says a missing row has
   three causes and they are different facts, and telling them apart takes a read
   per subject. It is at most two indexed probes and an aggregate, and it is only
   paid for subjects with NO observation.
   WHY IT IS ADMITTED: the same property, measured and not assumed — every scan
   is under the SAME published `FRONTIER_LIMIT_DEFAULT` 200 / `_MAX` 2000 that
   both siblings use, so the cost is bounded by a figure the caller reads off the
   answer. The honest cost is HIGHER than either sibling's and is stated rather
   than hidden: this level walks THREE subject partitions rather than one, so at
   the default cap it issues up to roughly three times the sibling's ~600 round
   trips. If the frontier ever has to answer at 2000, this is the arm to fold
   first, and it should be folded before either sibling.
   WHAT WOULD HAVE BEEN WRONG: dropping `#missingMeaningCause` to keep the count
   down. That read IS §5.1 — without it every subject with no row reads
   never-looked, which is the defect the design was written to prevent and which
   REC-94 shipped once and caught mid-run. A ratchet that pressures an item into
   removing the rule it was sent to build is a ratchet being read as a rule about
   numbers rather than about work. The figure moved; the order stayed.
   THE FIGURE IS TAKEN FROM THIS ARM'S OWN FAILURE OUTPUT (`35 methods derive
   over an unbounded scan`), never by adding one to the number in the file. */
const CLASS_MEASURED_2026_08_08 = 35;
console.log(`  RATCHET: ${CLASS.size} methods derive over an unbounded scan, `
          + `${CLASS_OPS.length} of them dispatched — measured 2026-08-08, moved to 31 on 2026-08-10 by D-280 (the arrival is #routeTask), moved to 30 the same day by CASE-2 (the departure is #requiredStrengthFor, removed with DEC-17's composition under DEC-72), moved to 31 on 2026-09-10 by CASE-4 (the arrival is #flagCasesOnRevision, DEC-72's revision flag), moved to 32 the same day by CASE-5b (the arrival is #caseClaimInBytes, over UNSIGNED case documents only), moved to 33 on 2026-09-14 by REC-93 (the arrival is frontier), moved to 34 on 2026-09-15 by REC-94 (the arrival is #frontierContent, the same reader's content level), moved to 35 the same day by REC-95 (the arrival is #frontierMeaning, the same reader's MEANING level — one reader, three levels, three movements)`);
t("RATCHET: the class is a CEILING — a NEW method that amplifies work over an unbounded scan pushes "
+ "this over the figure measured on 2026-08-08 and fails here, with the roster printed above so the "
+ "failure names it",
  CLASS.size <= CLASS_MEASURED_2026_08_08, true);
t("RATCHET: and a FLOOR beside it — the roster shrinking without this figure being moved means the "
+ "READER lost sight of methods, not that the plane got better. REC-60's 27 was a shrunken "
+ "measurement nobody could distinguish from progress, and it went unnoticed for two days",
  CLASS.size >= CLASS_MEASURED_2026_08_08, true);
t("RATCHET: the dispatched members are pinned BY NAME, not merely counted — a bare count of ten is "
+ "satisfied by ANY ten, and what a caller can reach is the half that matters",
  CLASS_OPS, ["audit->auditPass", "biasmanifest->biasManifest", "export->exportManifest",
              /* REC-93: the observation log's frontier read. Pinned BY NAME here
                 and not merely counted, which is this arm's whole point — the
                 ceiling moving by one says "something arrived", and only the
                 name says WHAT. */
              "frontier->frontier",
              "proposals->proposalsFeed",
              "publishedcase->publishedCase", "queue->queueFeed", "readingname->documentsNamingEntity",
              "reevaluations->reevaluations", "select->selectionCreate", "selection->selectionResolve",
              "selectionrelease->selectionRelease"]);


/* ====================== M0-40 · THE SPELLING THE CLASSIFIER READS AMPLIFICATION OFF,
 * AND WHY THE ANSWER IS A ROSTER BY NAME RATHER THAN A CLEVERER CLASSIFIER.
 *
 * WHAT WAS FOUND, AND NOBODY WAS LOOKING FOR IT. REC-88's first draft hoisted a scan out of
 * a `for` header into a `const` — the SAME query, the SAME rows, the SAME work — and
 * `earnedBasisRegistry` silently LEFT this class, 33 -> 32. The FLOOR above caught the
 * departure; the CEILING never could. REC-88 kept the inline shape, said so at the site in
 * `store.mjs`, and recorded the blind spot rather than moving the figure. This block is the
 * answer to it.
 *
 * THE ROW OFFERED TWO ROUTES — teach the classifier to FOLLOW A LOCAL BINDING to its row
 * source, or STATE PRECISELY WHY IT CANNOT and add a second arm that catches the departure BY
 * NAME rather than by count. It is the second, and the reason is MEASURED on this tree rather
 * than argued, because the first route looks obviously right until it is run.
 *
 * WHY THE CLASSIFIER IS NOT TAUGHT TO FOLLOW THE BINDING, AND THE FINDING IS BIGGER THAN THE
 * HOLE. `perRowScan` counts scans lying INSIDE A LOOP, and a loop's extent begins at its `for`
 * KEYWORD — so a scan written in the loop's own HEADER is counted as a scan PER ROW when it is
 * the loop's ROW SOURCE and runs exactly once. **That credit is unsound on its own terms**, and
 * the hoist blind spot is the same unsoundness seen from the other side. Making the two
 * spellings agree therefore means choosing which one is wrong, and all three directions were
 * DRIVEN on this tree (2026-09-16, M0-40, off this file's own classifier text):
 *   - FOLLOW THE BINDING for `for…of` only — roster 35 -> 46, ELEVEN arrivals, and the linear
 *     read `ncLinearFor` in the over-strictness block below is enrolled.
 *   - FOLLOW THE BINDING for every loop form this walk follows — roster 35 -> 56, TWENTY-ONE
 *     arrivals, and `ncLinear` itself is enrolled: the shape this file already declares BY NAME
 *     is NOT this class. **A classifier that over-collects is worse here than one that
 *     under-collects, because the roster is a CEILING and a false arrival forces a real one out
 *     of sight.**
 *   - REMOVE THE HEADER CREDIT instead — roster 35 -> 14, TWENTY-ONE departures, measured twice
 *     by two independent readers that agree on the same 21 names (an `inLoop` that excludes the
 *     header, and the source transform below, which share no code path).
 * Every one of those is a ratchet moving to fit what its reader cannot see, which is the
 * failure REC-60's shrunken 27 already cost this project two days over. **So the classifier is
 * left BYTE-IDENTICAL and nothing added here grades anything**: `CLASS` is the same 35 and no
 * method enters or leaves. What is added is a NAME for every membership that rests on the
 * spelling, so the next hoist fails saying WHICH method left instead of `34 of 35`.
 *
 * WHAT THIS BLOCK CANNOT SETTLE, STATED HERE RATHER THAN DISCOVERED LATER. It does NOT decide
 * whether the 21 belong in the class. Twenty-one of thirty-five memberships are held by a
 * credit this file's own header calls out of scope — "a LINEAR read over an unbounded scan is
 * NOT (this class is amplification, not size)" — so the ceiling's SOUNDNESS is an open
 * question, and it is `DEBT.md` D-384's, not this block's. Naming them is what makes that
 * question askable at all: before this, nothing in the estate could say which memberships were
 * spelling-held.
 * ====================================================================================== */

/* REC-88's HOIST, RECONSTRUCTED AS A TRANSFORM AND DRIVEN — not described. Every `for…of`
   whose iterable is written inline as `this.#rows(…)` is rewritten to a `const` above the
   loop, which is exactly the edit REC-88 drafted, and the member is re-classified by the SAME
   `analyse` above. The transform reuses `closeParen`, so a header whose SQL contains its own
   parentheses is read the way the classifier reads it and the two cannot disagree. */
const hoistRowSources = (body) => {
  let out = body, n = 0;
  for (;;) {
    const forHead = /\bfor\s*\(/g; let m, changed = false;
    while ((m = forHead.exec(out))) {
      const end = closeParen(out, m.index);
      const head = out.slice(m.index, end);
      const of = head.indexOf(" of ");
      if (of < 0) continue;
      const iterable = head.slice(of + 4, -1).trim();
      if (!/^this\.#rows\(/.test(iterable)) continue;
      out = `${out.slice(0, m.index)}const __rowSrc${n} = ${iterable};\n    `
          + `${head.slice(0, of)} of __rowSrc${n})${out.slice(end)}`;
      n++; changed = true; break;                 /* indices moved; restart the scan */
    }
    if (!changed) return { body: out, hoists: n };
  }
};

const HOIST = { fragile: [], stable: [], noInlineSource: [] };
for (const name of CLASS.keys()) {
  const h = hoistRowSources(SEGMENTS.get(name) || "");
  if (!h.hoists) { HOIST.noInlineSource.push(name); continue; }
  const a = analyse(h.body);
  (a.unbounded && a.loops && a.amplified ? HOIST.stable : HOIST.fragile).push(name);
}
for (const k of Object.keys(HOIST)) HOIST[k].sort();
console.log(`\n--- M0-40: which of the ${CLASS.size} memberships survive REC-88's HOIST ---`);
console.log(`  HOIST-FRAGILE (${HOIST.fragile.length} — membership rests on the row source being written INSIDE `
          + `a for-header; hoisting it to a local is the same work and they LEAVE): ${HOIST.fragile.join(", ")}`);
console.log(`  HOIST-STABLE (${HOIST.stable.length} — an inline row source, but amplification the body carries `
          + `anyway): ${HOIST.stable.join(", ")}`);
console.log(`  NO INLINE ROW SOURCE IN A for-HEADER (${HOIST.noInlineSource.length} — the transform does not `
          + `apply, so this arm reaches no verdict on them): ${HOIST.noInlineSource.join(", ")}`);

t("M0-40: the hoist partition is TOTAL over the class and disjoint — a member the transform cannot "
+ "reach must be NAMED as unreached, never silently scored stable. A partition that does not add up "
+ "is a walk looking in the wrong place",
  [HOIST.fragile.length + HOIST.stable.length + HOIST.noInlineSource.length, CLASS.size,
   new Set([...HOIST.fragile, ...HOIST.stable, ...HOIST.noInlineSource]).size],
  [CLASS.size, CLASS.size, CLASS.size]);

/* THE ARM THE ROW EXISTS FOR, AND IT IS BY NAME BECAUSE A COUNT IS WHAT FAILED REC-88.
   The floor above fires on `34 of 35` and says nothing about WHICH method the reader lost.
   This roster names every membership a hoist can take away, so the failure reads
   `earnedBasisRegistry left`. Moving it means naming the arrival or the departure, exactly as
   the ceiling's own comments demand — and an ARRIVAL here is a new method written in the
   spelling, which is a fact worth knowing even though it grades nothing. */
const HOIST_FRAGILE_2026_09_16 = [
  "#caseClaimInBytes", "#citesInto", "#conditionsCaptureRequested", "#conditionsCaptureUnattended",
  "#conditionsGovernorHolding", "#conditionsPartialCapture", "#findingsOutOfInquiryLead",
  "#frontierContent", "#frontierMeaning", "#monitorCadencePlan", "#queueAncestorEdges",
  "#queueMutes", "#queueRenotifyWake", "#restsOnLive", "#routeTask", "auditPass",
  "danglingRefs", "earnedBasisRegistry", "frontier", "publishedCaseRegistryFor", "queueFeed",
];
t("M0-40: the HOIST-FRAGILE roster is pinned BY NAME — this is the second arm the row asked for, "
+ "and it is by name because the FLOOR that caught REC-88 could only say the count fell. A member "
+ "leaving this roster means the reader's grip on it changed; one arriving means a method was "
+ "written in the spelling the classifier is sensitive to",
  HOIST.fragile, HOIST_FRAGILE_2026_09_16);

t("M0-40: `earnedBasisRegistry` is the WORKED EXAMPLE and is pinned on its own — REC-88's draft "
+ "hoisted exactly this method's scan and it left the class for no reason but the spelling. The "
+ "transform is driven here, not recalled, and it must still take the method out",
  [CLASS.has("earnedBasisRegistry"),
   (() => { const h = hoistRowSources(SEGMENTS.get("earnedBasisRegistry") || "");
            const a = analyse(h.body);
            return [h.hoists, Boolean(a.unbounded && a.loops && a.amplified)]; })()],
  [true, [1, false]]);

/* AND THE CLASS ITSELF, BY NAME. The ceiling and the floor between them say only that the size
   did not move, and every comment above this pin has had to name an arrival or a departure BY
   HAND for that reason. With the roster pinned, the instrument names it. */
const CLASS_ROSTER_2026_09_16 = [
  "#assembleInstance", "#caseClaimInBytes", "#citesInto", "#conditionsCaptureRequested",
  "#conditionsCaptureUnattended", "#conditionsGovernorHolding", "#conditionsPartialCapture",
  "#findingsOutOfInquiryLead", "#flagCasesOnRevision", "#frontierContent", "#frontierMeaning",
  "#monitorCadencePlan", "#overdueScan", "#queueAncestorEdges", "#queueMutes",
  "#queueRenotifyWake", "#restsOnLive", "#routeTask", "#sweepSelections", "auditPass",
  "biasManifest", "danglingRefs", "documentsNamingEntity", "earnedBasisRegistry",
  "exportManifest", "frontier", "proposalsFeed", "publishedCase", "publishedCaseRegistryFor",
  "publishedRegistryFor", "queueFeed", "reevaluations", "selectionCreate", "selectionRelease",
  "selectionResolve",
];
t("M0-40: the class roster is pinned BY NAME beside the ceiling and the floor, so a departure "
+ "names itself instead of reading `34 of 35`. Every movement comment above had to name its "
+ "arrival by hand precisely because this pin did not exist",
  [...CLASS.keys()].sort(), CLASS_ROSTER_2026_09_16);
t("M0-40: and the by-name roster and the counted ratchet are ONE reader — a pin that could "
+ "disagree with the figure beside it would be two instruments, and this file has already paid "
+ "once for a by-name arm satisfiable by the healthy half of what it pinned (control 9b)",
  CLASS_ROSTER_2026_09_16.length, CLASS.size);

/* OVER-STRICTNESS FOR THE NEW ARM, and it is the half the row weighted most heavily. Nothing
   added above can enrol a method: the partition iterates `CLASS` and cannot reach outside it,
   so a method holding no unbounded row source is untouchable by construction. That is asserted
   rather than asserted-by-comment, in both directions — a BOUNDED scan in a for-header is in
   no roster because it is in no class, and a member whose body carries real amplification is
   HOIST-STABLE rather than fragile. */
const NC_BOUNDED_HEADER = `class Z {
  ncBoundedHeader({ id, cap } = {}) {
    const out = [];
    for (const r of this.#rows(\`SELECT a FROM t WHERE id=? LIMIT ?\`, id, cap)) out.push(r.a);
    return { ok: true, count: out.length, out };
  }
  end() { return 1; }
}`;
t("M0-40 OVER-STRICTNESS: a BOUNDED row source written inline in a for-header is in no class and "
+ "therefore in no roster this block builds — the new arm can only ever NAME members, never enrol "
+ "one. A classifier that over-collects is worse here than one that under-collects",
  [classMembers(NC_BOUNDED_HEADER).has("ncBoundedHeader"),
   HOIST.fragile.length + HOIST.stable.length <= CLASS.size], [false, true]);
t("M0-40 OVER-STRICTNESS, the other direction: a member whose BODY carries the amplification is "
+ "HOIST-STABLE and must not be called fragile — otherwise the roster would name every inline row "
+ "source and say nothing. These four are measured, not chosen",
  HOIST.stable, ["documentsNamingEntity", "proposalsFeed", "publishedCase", "selectionRelease"]);

/* ================================================== THE CENSUS, GRADED (REC-99 · D-365).
 *
 * WHAT WAS WRONG, AND IT WAS NOT BLINDNESS. REC-89 measured it on 2026-09-14 and the
 * measurement is D-365: drop ONLY the `LIMIT ?` and its `cap + 1` argument from
 * `resolutionsForCapture`, from `documentsConcerning` or from `connectionsFor`'s entity arm —
 * leaving `truncated`, the `slice(0, cap)` and the published `limit` exactly as they are — and
 * **every bounds suite stayed FULLY GREEN, 0 failing assertions on every arm.** This file
 * PRINTED the difference: the CORPUS line read `102 scanning UNBOUNDED` at baseline and `103`
 * under each arm. **The walk COUNTED the newly-unbounded method and nothing failed, because
 * that census carried no ratchet.** An instrument that prints a number nobody grades is not a
 * weaker instrument than one that is blind; it is a MORE EXPENSIVE one, because it has already
 * paid for the measurement and then throws away the verdict.
 *
 * SO THE CENSUS IS GRADED HERE, IN TWO HALVES THAT FAIL FOR DIFFERENT REASONS, and the second
 * exists because the first has a blind spot this item MEASURED rather than assumed:
 *
 *   (1) THE COUNT — a ceiling and a floor on the printed figure, the same shape the class
 *       ratchet above carries and for the same reasons. The roster is PRINTED by name, so a
 *       failure of the ceiling is read against the previous run's roster and the arrival is
 *       named rather than guessed at.
 *   (2) THE TRUNCATION SOURCE, BY NAME — and this is the half that names the method WITHOUT a
 *       roster diff. **A method that publishes `truncated` has made a CLAIM about the work it
 *       did**, and the claim is only worth the row source it was measured over: if `truncated`
 *       is read off `X.length > cap`, then the `#rows(` that assigned `X` must carry a SQL
 *       `LIMIT` **and must be PASSED the cap** (the cap identifier, or a local assigned from
 *       it, appearing in the ARGUMENTS and not merely inside the SQL text). That is an
 *       INVERSION rather than a list of three method names: it grades every read that makes
 *       the claim, including ones written after this line.
 *
 * WHY (2) IS NOT REDUNDANT, MEASURED ON THIS TREE AND NOT REASONED:
 *   - **THE COUNT CANNOT SEE A CAP THAT IS NOT THE PUBLISHED CAP.** Replace `LIMIT ?` / `cap + 1`
 *     with a literal `LIMIT 5000` and the SQL is still bounded, so the census does not move at
 *     all — and the envelope now says 500 over a scan that read 5000. Negative control (10)
 *     arms exactly that: the census stays at its figure, GREEN, and (2) fails naming the read.
 *   - **THE COUNT IS A COUNT OF METHODS, so a method that ALREADY scans unbounded somewhere
 *     else can lose its paging LIMIT without the figure moving.** Four methods publish a bound
 *     and hold an unbounded scan today (`documentsNamingEntity`, `queueFeed`, `frontier`,
 *     `biasManifest` — every one of them legitimately: an alias lookup on a unique key, a
 *     GROUP BY aggregate, a dispositions table). None of the four is graded by (2) either,
 *     which is stated below rather than left to be discovered.
 *
 * WHAT THIS CANNOT GRADE, NAMED HERE AND PINNED BELOW rather than silently scored zero. Six
 * `truncated` measurements are taken over an IN-MEMORY collection — merged, filtered or
 * assembled after several reads — so there is no single `#rows(` to grade. They are the same
 * class one step further on and they are D-369, not this item: pinning the roster means a
 * SEVENTH such shape must be declared here before it can pass.
 */
const SCANNING_NAMES = [...SEGMENTS].filter(([, b]) => scans(b).some((s) => !s.bounded))
  .map(([n]) => n).sort();
console.log(`  CENSUS ROSTER (${SCANNING_NAMES.length} methods scanning UNBOUNDED): ${SCANNING_NAMES.join(", ")}`);

t("CENSUS: the roster this ratchet grades IS the figure the CORPUS line prints — ONE reader, not "
+ "two. A ratchet over a second reader can hold while the printed census drifts, and then neither "
+ "number means anything",
  SCANNING_NAMES.length, SCANNING);

/* MEASURED 2026-09-15 BY REC-99 ON `origin/main` `6e88e35`, AND THE BRIEFED FIGURE WAS STALE BY
   ONE, WHICH IS WHY THE ARRIVAL IS NAMED HERE RATHER THAN THE NUMBER BEING TAKEN ON TRUST.
   D-365 recorded 102 on 2026-09-14 and that was right on the tree it was measured on
   (`68b5603`). Today's figure is 103. **THE ARRIVAL IS `frontier`, MEASURED AND NOT INFERRED:**
   this same walk was re-derived over `git show 68b5603:bio-plane/src/store.mjs` and over the
   working tree, and `comm` over the two sorted rosters reports EXACTLY ONE ARRIVAL AND NO
   DEPARTURE — the same instrument, and the same method, D-280 and CASE-2 used on the class
   ratchet above. It is REC-93's observation-log read, which arrived the same day and is the
   same method that moved the CLASS ceiling 32 -> 33; its `observation_log` state census is a
   GROUP BY aggregate returning one row per state, so it is a real member of this census by the
   walker's own definition and is counted honestly rather than exempted. */
/* MOVED 103 -> 104 AT REC-94's INTEGRATION, 2026-09-15 by CONDUCT #11, AND THE ARRIVAL IS
   NAMED BY THE SAME METHOD THIS BLOCK DEMANDS RATHER THAN BY TRUST. The walk was re-derived
   over a PRISTINE `git worktree add` at `origin/main` `2a18b4d` and over the merged tree, and
   the two sorted rosters diff to EXACTLY ONE ARRIVAL AND NO DEPARTURE: **`#frontierContent`**,
   REC-94's content-level frontier read. It is the same method that moved the CLASS ceiling
   33 -> 34 and that the ungraded-truncation pin below now declares as a seventh — ONE arrival
   accounting for all three movements, which is what makes this a measurement rather than three
   coincidences. **It is counted honestly rather than exempted, and it belongs to D-369's SECOND
   set — a method that publishes a bound while legitimately holding an unbounded scan** (the
   frontier is bounded to the caller; the scan underneath it is not), which is precisely the
   category M0-38 exists to grade or to name. REC-99 recorded on its own row that this constant
   is a property of the MERGED source exactly as `REGISTER_FLOOR` is; this is that rule being
   obeyed on the first tree where it bit. */
/* MOVED 104 -> 105, 2026-09-15 by REC-95, AND THE ARRIVAL IS NAMED BY THE SAME METHOD THIS
   BLOCK DEMANDS RATHER THAN BY TRUST. The roster this run PRINTED contains exactly one member
   that `origin/main` at `58b77ea` does not — **`#frontierMeaning`**, REC-95's meaning-level
   frontier read — and there is NO departure. It is the same method that moves the CLASS ceiling
   34 -> 35 above and that the ungraded-truncation pin below now declares as an EIGHTH: **ONE
   arrival accounting for all three movements**, which is what makes this a measurement rather
   than three coincidences, and it is the identical pattern REC-94 recorded one level down.
   **Counted honestly rather than exempted, and it belongs to D-369's SECOND set** — a method
   that publishes a bound while legitimately holding an unbounded scan (the frontier is bounded
   to the caller; the scans underneath it are not), the category M0-38 exists to grade or name.
   REC-99 recorded that this constant is a property of the MERGED source exactly as
   `REGISTER_FLOOR` is, and REC-94 obeyed that on the first tree where it bit; this is the
   second. **CONDUCT must re-read it on the merged tree** rather than carrying 105 across. */
const SCANNING_MEASURED_2026_09_15 = 105;
t("CENSUS IS A CEILING: a method that gains an unbounded row source pushes the printed figure "
+ "over what was measured on 2026-09-15 and FAILS HERE — which is precisely what D-365 measured "
+ "NOT happening, when removing a SQL `LIMIT` from a capped read moved this number and nothing "
+ "cared. The roster is printed above, so the failing run names the arrival",
  SCANNING <= SCANNING_MEASURED_2026_09_15, true);
t("CENSUS IS A FLOOR: the figure falling without somebody moving it means the READER stopped "
+ "seeing row sources, not that the plane got better — the same direction REC-60's shrunken 27 "
+ "fell in, unnoticed for two days",
  SCANNING >= SCANNING_MEASURED_2026_09_15, true);

/* ---- (2) THE TRUNCATION SOURCE. `truncated` is a CLAIM; this grades what it was measured over. */
const TRUNC_RE = /\btruncated\b\s*[:=]\s*([A-Za-z_$][\w$]*)\s*\.\s*length\s*>\s*([A-Za-z_$][\w$]*)/g;
/* The cap, and every local assigned FROM it — `const window = cap + 1` is the same cap by
   another name, and an instrument that reads only the one spelling is the list-of-spellings
   failure this file's own header was written against. Over-strictness arm (11) is that
   spelling, and it must PASS. */
const capIdentifiers = (body, capId) => {
  const ids = new Set([capId]);
  for (let round = 0; round < 4; round++) {
    const before = ids.size;
    const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]*)/g; let m;
    while ((m = re.exec(body))) if (mentions(m[2], ids)) ids.add(m[1]);
    if (ids.size === before) break;
  }
  return ids;
};
/* Every `#rows(` that ASSIGNS this identifier — `const scan = this.#rows(` and the bare
   `scan = this.#rows(` of a `let` declared above a branch both match, which is not incidental:
   `connectionsFor` assigns its scan in TWO arms and a reader that saw only the `const` form
   would grade the method on one of its two doors. */
const rowSourceCalls = (body, id) => {
  const out = []; const re = new RegExp(`\\b${id.replace(/\$/g, "\\$")}\\s*=\\s*this\\.#rows\\(`, "g");
  let m; while ((m = re.exec(body))) out.push(body.slice(m.index, closeParen(body, m.index + m[0].length - 1)));
  return out;
};
const truncationVerdicts = (code) => {
  const graded = [], ungraded = [], violations = [];
  for (const [name, body] of segments(code)) {
    let m; TRUNC_RE.lastIndex = 0;
    while ((m = TRUNC_RE.exec(body))) {
      const [, src, capId] = m;
      const calls = rowSourceCalls(body, src);
      if (!calls.length) { ungraded.push(`${name}:${src}`); continue; }
      const ids = capIdentifiers(body, capId);
      for (const call of calls) {
        const bounded = /\bLIMIT\b/i.test(call);
        /* The cap must be PASSED, so only the arguments are read — a `cap` mentioned inside the
           SQL text is not a bound the caller's figure controls. */
        const args = call.lastIndexOf("`") > 0 ? call.slice(call.lastIndexOf("`")) : call;
        if (bounded && mentions(args, ids)) graded.push(`${name}:${src}`);
        else violations.push(`${name}:${src}${bounded ? " (SQL bound is not the published cap)" : " (no SQL LIMIT)"}`);
      }
    }
  }
  return { graded, ungraded, violations };
};
const TRUNCATION = truncationVerdicts(CODE);
console.log(`  TRUNCATION SOURCES: ${TRUNCATION.graded.length} graded, `
          + `${TRUNCATION.ungraded.length} ungradeable (named below), ${TRUNCATION.violations.length} in violation`);
console.log(`    GRADED: ${TRUNCATION.graded.join(", ")}`);

t("TRUNCATION SOURCE, BY NAME: every `truncated` measured off a row source was measured over a "
+ "source the SQL bounded AND the published cap controlled. THIS IS THE ARM D-365 EXISTS FOR — "
+ "removing `LIMIT ?` from any of REC-60's three fixed-key reads fails HERE, naming the read, "
+ "rather than being counted one line up",
  TRUNCATION.violations, []);
/* BOTH CONDITIONS, AND THE SECOND IS HERE BECAUSE ARM (9b) CAME BACK A SURPRISING GREEN ON THIS
   ARM AND THE SURPRISE IS RECORDED RATHER THAN SMOOTHED. `connectionsFor` assigns `scan` in TWO
   branches, so both verdicts are filed under the one name `connectionsFor:scan`: with the ENTITY
   arm's `LIMIT` removed, the CAPTURE arm's surviving verdict still satisfied "is in `graded`",
   and this assertion stayed green while the read was genuinely broken. The violations arm above
   caught it and named it, so the item's own accept never rested on this arm — but an arm that
   can be satisfied by the healthy half of the method it is pinning is not pinning it. Requiring
   ABSENCE FROM `violations` as well closes it, and it is the general fix rather than a special
   case for this one method: any method with two row sources behaves the same way. */
t("TRUNCATION SOURCE: and REC-60's three reads are graded BY NAME rather than being anywhere in a "
+ "total, AND appear in no violation — a count of twenty is satisfied by ANY twenty, and a method "
+ "that assigns its scan in two branches is satisfied by its healthy branch unless both are asked. "
+ "These three are the reads D-225 was raised for and REC-60 capped on 2026-08-07 under IC-25",
  ["resolutionsForCapture:rows", "documentsConcerning:scan", "connectionsFor:scan"]
    .filter((x) => !TRUNCATION.graded.includes(x)
                || TRUNCATION.violations.some((v) => v.startsWith(`${x} `))), []);
/* A FLOOR on the grader's REACH, because a verdict of "0 violations" is exactly what a reader
   that matched nothing also produces — the failure this file has met in every other walk it
   carries. Measured 2026-09-15: 20 graded sources across 19 methods. */
t("TRUNCATION SOURCE IS A FLOOR TOO: the grader reaches at least the 20 row sources measured on "
+ "2026-09-15. Zero violations over zero readings is how a walk congratulates itself, and this "
+ "estate has recorded that three times",
  TRUNCATION.graded.length >= 20, true);
t("WHAT THIS CANNOT GRADE IS NAMED, NEVER SCORED ZERO: six `truncated` figures are measured over "
+ "an in-memory collection built from several reads, so no single row source can be graded. They "
+ "are D-369 and not this item; pinning them means a SEVENTH must be declared here before it can "
+ "pass, rather than arriving ungraded and invisible",
  TRUNCATION.ungraded.sort(),
  /* SEVENTH DECLARED 2026-09-15 by CONDUCT #11 at REC-94's integration: `#frontierContent:page`,
     the content-level twin of `frontier:page` already here. THE ARM WORKED EXACTLY AS WRITTEN —
     it FAILED rather than absorbing the new figure, and its failure message named the arrival,
     so this declaration is a reading of the instrument's own output and not a guess. Same
     disposition as the other six: D-369's, not this suite's, and named here so it cannot arrive
     ungraded and invisible. */
  /* EIGHTH DECLARED 2026-09-15 by REC-95: `#frontierMeaning:rows`, the meaning-level twin of
     `frontier:page` and `#frontierContent:page` already here, and the third member of one
     reader's family. THE ARM WORKED EXACTLY AS WRITTEN — it FAILED rather than absorbing the
     new figure, and its failure message named the arrival, so this declaration is a reading of
     the instrument's own output and not a guess. Same disposition as the other seven: D-369's,
     not this suite's, and named here so it cannot arrive ungraded and invisible.
     WHY IT CANNOT BE GRADED, stated rather than left to the category: `truncated` at the
     meaning level WAS `rows.length > cap || missing.length > cap` — and that expression was a
     DEFECT this arm caught at REC-95's integration (2026-09-15), not a shape to declare: `rows`
     is the RAW fetch at `(cap + 1) * 3`, over-fetched because a withholding gate filters it, and
     the published page is cut from `gated`; `missing` is not the list `never_looked` is paged
     from either. **Both disjuncts over-reported.** Corrected at the site to
     `gated.length > cap || never.length > cap`, which is what `#frontierDocument` one screen up
     already does. What remains, and is declared here, is that `gated` is an in-memory collection
     assembled from THREE bounded reads — one per subject kind — so no single row source carries
     the figure. Each read underneath it does carry a SQL `LIMIT`, which is what the graded arm
     above would check if the figure were attributable to one of them. **Fix what is wrong, then
     declare what is out of reach — in that order.** */
  ["#backfillLegContent:need", "#frontierContent:page", "#frontierMeaning:gated",
   "biasInhale:bars", "documentsNamingEntity:merged", "frontier:page",
   "queueFeed:dispAll", "queueFeed:items"]);
const noRowSources = CODE.replace(/#rows\(/g, "#norows(");
t("REACH IS A DELTA (the truncation grader): over a copy of store.mjs with no `#rows(` in it, "
+ "every graded source becomes UNGRADEABLE and none is silently scored as compliant — the "
+ "direction that matters, since a reader that finds no row sources must not report a clean bill",
  [truncationVerdicts(noRowSources).graded.length, TRUNCATION.graded.length > 0], [0, true]);

/* ============================ THE IN-MEMORY TRUNCATION, AND THE ROSTER OF WHAT IS STILL OUT OF
 * REACH (M0-38 · D-369).
 *
 * WHAT REC-99 LEFT BEHIND WAS **TWO** BLIND SPOTS, AND THEY ARE BLIND FOR DIFFERENT REASONS.
 * They are closed in one block and reported APART, because conflating them is how the gap
 * arrived: D-369's own row says so, and the row that spawned this work says so again.
 *
 *   SET 1 — SEVEN `truncated` FIGURES MEASURED OVER AN IN-MEMORY COLLECTION. The count half
 *     watches SQL row sources; the inversion half ties a published cap to a `#rows(` call. **A
 *     figure computed over an array in memory satisfies NEITHER BY CONSTRUCTION**, so REC-99
 *     PINNED the seven names and graded none of them. Pinning a name is not grading a bound.
 *   SET 2 — METHODS THAT PUBLISH A BOUND WHILE ALREADY HOLDING AN UNBOUNDED SCAN. The census is
 *     a COUNT OF METHODS, so a method already on the roster can lose a paging `LIMIT` on a
 *     different read and the figure does not move. Here the count half is blind BY CONSTRUCTION
 *     rather than by omission.
 *
 * WHAT THIS BLOCK GRADES, AND WHAT IT REFUSES TO PRETEND TO GRADE. An in-memory collection has
 * no single row source, so the question "was the scan bounded" HAS NO ANSWER a one-method text
 * walk can give. The question that DOES have one is the in-memory twin of REC-99's negative
 * control (10) — **THE CUT AND THE CLAIM MUST AGREE**:
 *
 *   a method that publishes `truncated: SRC.length > C` has claimed that SRC was cut at C. So
 *   either C is a local ASSIGNED FROM a cut of SRC (`const run = need.slice(0, MAX)` — the claim
 *   is measured against the page itself, the strongest form there is), or the method must cut
 *   SRC at a bound the published cap CONTROLS (`merged.slice(0, cap)`, the cap or an alias of
 *   it, `capIdentifiers` above being REC-99's reader reused so the two cannot disagree about
 *   what "the same cap" means).
 *
 * **THAT IS THE ARM THIS ROW EXISTS FOR.** Replace `merged.slice(0, cap)` with
 * `merged.slice(0, 5000)` and leave `limit: cap` and `truncated: merged.length > cap` exactly as
 * they are — an answer that says it cut at 100 over a page of 5,000 — and before this block
 * NOTHING ANYWHERE FAILED: the census cannot move (no SQL changed), REC-99's inversion never
 * looks (there is no row source), and the envelope suites read the honest published figure. It
 * now fails HERE, naming the method and the collection.
 *
 * A SECOND VERDICT IS TAKEN AND IT IS DELIBERATELY WEAKER THAN IT LOOKS — **THE SOURCE BOUND** —
 * and its whole value is that it PARTITIONS the seven into what can be reached and what cannot,
 * by NAME and with the reason on the row. A collection assigned from a CALL that is PASSED the
 * published cap (`this.#frontierLatest("document", { limit: cap + 1 })`) is bounded at its
 * source **as far as this walk can see, and no further** — the callee's own body is not read,
 * which is the first limitation this file's own header declares. A collection ASSEMBLED in
 * memory from several reads, or DERIVED from an array the CALLER handed in, has no source this
 * reader can bound at all. Those are OUT OF REACH, they are listed by name with the reason, and
 * the roster is pinned so one cannot arrive quietly.
 *
 * **AN INSTRUMENT THAT CANNOT REACH SOMETHING MUST SAY SO BY NAME RATHER THAN PASS SILENTLY
 * OVER IT.** Every roster below is PRINTED and PINNED for exactly that reason, and the rosters
 * are kept SEPARATE because a reader must be able to tell a blind spot from an omission.
 *
 * WHAT THIS READER CANNOT SEE, STATED HERE RATHER THAN DISCOVERED LATER — and the third entry is
 * the hole REC-88 found in the class walk one screen up (M0-40's row), checked against this
 * block rather than assumed absent from it:
 *   - It reads a cut written as `SRC.slice(0, …)` and NOTHING ELSE. A cut hoisted into a helper,
 *     or spelled `.splice`, or made by `break`ing out of a loop, is invisible — and such a claim
 *     lands in `violations` as `claims a cut this method does not make`, which is LOUD and in the
 *     safe direction, never a silent pass. If a legitimate method ever cuts that way the arm is
 *     widened AT THIS SITE with the reason stated — never the roster lowered to fit it.
 *   - It reads the DECLARATION of the collection to classify where it came from. A collection
 *     assigned through a branch, or re-assigned later, is classified on its first declaration.
 *   - **IT DOES NOT INHERIT REC-88's HOLE, AND THAT IS CHECKED RATHER THAN ASSERTED:** that hole
 *     is in `analyse`'s loop reader (an amplifying loop whose ITERABLE is hoisted to a local
 *     scores zero, so the method leaves the CLASS roster), and nothing in this block calls
 *     `analyse`, `loopsOver` or `classMembers`. What this block reads is `segments`, `scans` —
 *     every `#rows(` and its `LIMIT` — and plain declarations, none of which has a loop in it.
 *     SET 2's roster is built from `SCANNING_NAMES`, which is `scans()`-derived for the same
 *     reason. M0-40 is that hole's row and it is NOT fixed here.
 *   - **IT READS ONE SPELLING OF THE CLAIM, `X.length > Y`, BECAUSE REC-99's `TRUNC_RE` DOES**,
 *     and a reader that grades one spelling is this file's own oldest failure. The claims that
 *     spelling cannot read are therefore COUNTED AND NAMED in the third roster below rather than
 *     being absent from every list — which is how `biasManifest`'s offset form came to be named
 *     in D-369 as one of the four while being in NO roster the instrument printed.
 */

/* Every `SRC.slice(0, …)` in a body, whole call text. `closeParen` from the match start lands on
   the `(` of `.slice` because the receiver is a bare identifier and carries no parenthesis. */
const sliceCuts = (body, src) => {
  const out = []; const re = new RegExp(`\\b${src.replace(/\$/g, "\\$")}\\s*\\.\\s*slice\\s*\\(`, "g");
  let m; while ((m = re.exec(body))) out.push(body.slice(m.index, closeParen(body, m.index)));
  return out.filter((c) => /\.\s*slice\s*\(\s*0\s*,/.test(c));
};
/* WHERE THE COLLECTION CAME FROM — four answers and a fifth that is PRINTED rather than scored.
   `UNCLASSIFIED` is a first-class outcome here: a thing the matcher does not understand must be
   NAMED, never silently given a verdict it did not earn. */
const sourceOrigin = (body, src) => {
  const esc = src.replace(/\$/g, "\\$");
  const decl = new RegExp(`\\b(?:const|let|var)\\s+${esc}\\s*=\\s*([^;]*)`).exec(body);
  if (!decl) return { kind: "UNCLASSIFIED", why: "no declaration of this collection in the method segment", rhs: "" };
  const rhs = decl[1];
  const grown = new RegExp(`\\b${esc}\\s*\\.\\s*(?:push|concat|unshift)\\s*\\(`).test(body);
  if (/this\s*\.\s*#?[A-Za-z_$][\w$]*\s*\(/.test(rhs) && !grown)
    return { kind: "CALL", why: "assigned from a call; the callee's body is not read by this walk", rhs };
  if (/^\s*\[/.test(rhs) || grown)
    return { kind: "ASSEMBLED", why: "assembled in memory — grown or spread from several reads, so there is no single source to bound", rhs };
  const recv = /^\s*([A-Za-z_$][\w$]*)\s*\.\s*(?:filter|map|slice|concat|sort|flatMap|reduce)\s*\(/.exec(rhs);
  if (recv) {
    const local = new RegExp(`\\b(?:const|let|var)\\s+${recv[1].replace(/\$/g, "\\$")}\\b`).test(body);
    return local
      ? { kind: "DERIVED", why: `derived from the local \`${recv[1]}\`, whose own source this verdict does not follow`, rhs }
      : { kind: "CALLER-SUPPLIED", why: `derived from \`${recv[1]}\`, which this method does not declare — it is an ARGUMENT, and there is no read here to bound`, rhs };
  }
  return { kind: "UNCLASSIFIED", why: "the declaration is a shape this reader does not classify", rhs };
};

/* The verdicts. ONE pass over the same segments REC-99's grader walks, taking only the claims it
   reported as UNGRADEABLE — this reader must never disagree with that one about which claims are
   in its scope, which is why the row-source test below is REC-99's `rowSourceCalls`, reused. */
const inMemoryVerdicts = (code) => {
  const cut = { graded: [], violations: [] }, source = { graded: [], outOfReach: [] };
  for (const [name, body] of segments(code)) {
    let m; TRUNC_RE.lastIndex = 0;
    while ((m = TRUNC_RE.exec(body))) {
      const [, src, capId] = m;
      if (rowSourceCalls(body, src).length) continue;      /* REC-99's half owns this one. */
      const label = `${name}:${src}`;
      const ids = capIdentifiers(body, capId);
      const cuts = sliceCuts(body, src);
      const againstPage = new RegExp(
        `\\b(?:const|let|var)\\s+${capId.replace(/\$/g, "\\$")}\\s*=\\s*${src.replace(/\$/g, "\\$")}\\s*\\.\\s*slice\\s*\\(`
      ).test(body);
      if (againstPage) cut.graded.push(`${label} (measured against the page cut from it)`);
      else if (!cuts.length) cut.violations.push(`${label} (claims a cut this method does not make)`);
      else if (cuts.some((c) => mentions(c.slice(c.indexOf(",")), ids)))
        cut.graded.push(`${label} (cut at the published cap)`);
      else cut.violations.push(`${label} (cut at a bound the published claim does not name)`);
      const origin = sourceOrigin(body, src);
      if (origin.kind === "CALL" && mentions(origin.rhs, ids))
        source.graded.push(`${label} (bounded at the source by a CAP-CARRYING CALL; callee not read)`);
      else source.outOfReach.push(`${label} — ${origin.kind}: ${origin.why}`);
    }
  }
  return { cut, source };
};
const INMEM = inMemoryVerdicts(CODE);
console.log(`  IN-MEMORY TRUNCATION (M0-38 · D-369): ${INMEM.cut.graded.length} cut-graded, `
          + `${INMEM.cut.violations.length} in violation; source bound ${INMEM.source.graded.length} graded, `
          + `${INMEM.source.outOfReach.length} OUT OF REACH`);
for (const g of INMEM.cut.graded.slice().sort()) console.log(`    CUT GRADED    ${g}`);
for (const g of INMEM.source.graded.slice().sort()) console.log(`    SOURCE GRADED ${g}`);
for (const g of INMEM.source.outOfReach.slice().sort()) console.log(`    OUT OF REACH  ${g}`);

t("IN-MEMORY TRUNCATION, THE ARM THIS ROW EXISTS FOR: every `truncated` figure measured over an "
+ "in-memory collection was measured against the cut the method actually makes — either the PAGE "
+ "itself or a slice at a bound the published cap controls. Cutting at a bound the answer does not "
+ "publish fails HERE, naming the method and the collection, and it fails NOWHERE ELSE: the census "
+ "cannot move because no SQL changed, and REC-99's inversion never looks because there is no row "
+ "source",
  INMEM.cut.violations, []);

/* A FLOOR ON THE REACH, and it is not decoration: `0 violations` is exactly what a reader that
   matched NOTHING also produces — the failure this file has met in every other walk it carries,
   and three times elsewhere in this estate over an empty corpus. The seven claims are the SAME
   seven REC-99 pinned as ungradeable one assertion up, which is ASSERTED rather than assumed:
   two readers that disagree about which claims are in scope are measuring two different things
   and then neither figure means anything. */
t("IN-MEMORY TRUNCATION IS A FLOOR TOO: this grader reaches the SAME claims REC-99's grader "
+ "reported it could not grade — not a set of its own choosing. If the two readers ever disagree "
+ "about which claims are in scope, one of them is measuring something else",
  [...INMEM.cut.graded, ...INMEM.cut.violations].map((x) => x.split(" ")[0]).sort(),
  TRUNCATION.ungraded.slice().sort());

t("IN-MEMORY TRUNCATION: and the SOURCE BOUND is reported as TWO rosters, never one number — what "
+ "this walk can bound at the source and what it cannot, each by NAME with its reason on the row. "
+ "An instrument that cannot reach something must SAY SO by name rather than pass silently over "
+ "it, which is this block's entire content",
  [INMEM.source.graded.length + INMEM.source.outOfReach.length, INMEM.source.graded.length > 0],
  [8, true]);

/* THE OUT-OF-REACH ROSTER, PINNED BY NAME. Same discipline as REC-99's ungraded pin: an EIGHTH
   in-memory figure, or one MIGRATING between the two rosters, must be declared here before it can
   pass. A migration is the movement that matters most — a method whose cut moves into a helper
   leaves `graded` and arrives here, and a bare count would never see it. */
t("OUT OF REACH, BY NAME AND WITH ITS REASON — the deliverable of D-369's row as much as the "
+ "grading is. Five of the seven have no source this one-method walk can bound: four ASSEMBLED in "
+ "memory from several reads and one handed in by the CALLER. The other two are bounded by a "
+ "cap-carrying call and no further — the callee is not read",
  INMEM.source.outOfReach.map((x) => x.split(" ")[0]).sort(),
  ["#backfillLegContent:need", "#frontierMeaning:gated", "biasInhale:bars",
   "documentsNamingEntity:merged", "queueFeed:dispAll", "queueFeed:items"]);

/* ---- SET 2. THE METHODS THE CENSUS COUNT CANNOT GRADE BY CONSTRUCTION.
   DERIVED BY INVERSION, NEVER LISTED — AND THE INVERSION FOUND ONE MORE THAN THE LEDGER'S HAND
   LIST DID, WHICH IS THE ARGUMENT FOR INVERTING. D-369 named four on 2026-09-15 and a fifth
   (`#frontierContent`) arrived at REC-94's integration the same day; computing the property
   instead of writing the names finds SIX, the sixth being `#calDriftFor`. That is the
   list-of-spellings failure this file's own header was written against, met once more.

   THE PROPERTY: a method that PUBLISHES a `truncated` claim while ALREADY holding an unbounded
   row source is already counted in the census, so it can lose a paging `LIMIT` on a different
   read without the figure moving.

   **AND THE SIX ARE PARTITIONED RATHER THAN REPORTED AS ONE NUMBER, because conflating two
   different blindnesses is the exact failure D-369's row exists to prevent.** `#calDriftFor` is
   blind to the COUNT and DEFENDED BY THE OTHER HALF — it publishes its bound off a row source
   REC-99's inversion grades by name (`#calDriftFor:page`), so removing that `LIMIT ?` still fails,
   one assertion up. The remaining FIVE are blind to BOTH halves, and they are D-369's set 2
   exactly. **THEY MUST ALL STILL PASS, BYTE-IDENTICALLY** — every one is unbounded for a
   legitimate reason (an alias lookup on a unique key, a GROUP BY aggregate, a dispositions table,
   a frontier bounded to its caller over a log that is not) — and a grading that refuses correct
   work is worse than the gap it closed. Nothing here fails them; it NAMES them. */
const PUBLISHES_BOUND = (body) => /\btruncated\b\s*[:=]/.test(body);
const CENSUS_BLIND = [...SEGMENTS]
  .filter(([n, b]) => PUBLISHES_BOUND(b) && SCANNING_NAMES.includes(n)).map(([n]) => n).sort();
const DOUBLY_BLIND = CENSUS_BLIND.filter((n) => !TRUNCATION.graded.some((g) => g.startsWith(`${n}:`)));
console.log(`  CENSUS-BLIND (${CENSUS_BLIND.length} methods publish a bound AND already scan `
          + `unbounded, so the COUNT cannot move if one loses a paging LIMIT): ${CENSUS_BLIND.join(", ")}`);
console.log(`  BLIND TO BOTH HALVES (${DOUBLY_BLIND.length}, D-369's set 2): ${DOUBLY_BLIND.join(", ")}`);
t("SET 2, NAMED BY NAME: the methods whose published bound the CENSUS COUNT is blind to BY "
+ "CONSTRUCTION, derived by INVERSION rather than listed — and the inversion finds SIX where "
+ "D-369's hand list has five, the arrival being `#calDriftFor`. Each is legitimately unbounded "
+ "and each still PASSES; what changes is that the instrument now SAYS which methods its count "
+ "cannot defend, instead of a reader having to re-derive it from a debt row",
  CENSUS_BLIND,
  ["#calDriftFor", "#frontierContent", "#frontierMeaning", "biasManifest",
   "documentsNamingEntity", "frontier", "queueFeed"]);
t("SET 2, PARTITIONED — and the partition is the point. `#calDriftFor` is blind to the COUNT but "
+ "DEFENDED by REC-99's inversion, which grades its row source by name; the other five are blind "
+ "to BOTH halves and are D-369's set 2 exactly. Reporting six as one number would put a method "
+ "that IS defended into a roster of methods that are not, which is the conflation this row was "
+ "written to undo",
  DOUBLY_BLIND,
  ["#frontierContent", "#frontierMeaning", "biasManifest", "documentsNamingEntity",
   "frontier", "queueFeed"]);

/* ---- AND THE CLAIMS THE GRADER'S OWN SPELLING CANNOT READ AT ALL.
   FOUND BY THIS ITEM AND NAMED RATHER THAN FIXED, because widening `TRUNC_RE` would enlarge
   REC-99's `graded` and `ungraded` rosters in the same breath and this item's claim on this file
   is additive. **`biasManifest` IS THE PROOF THAT THIS ROSTER IS OWED:** D-369 names it as one of
   the four, and it publishes `from + page.length < all.length` — an OFFSET form — so it is in
   `graded`, in `ungraded` and in `violations` NOWHERE. A debt row named it; no instrument did.
   Three shapes are here: OFFSET (`from + page.length < all.length`), `>=` where the grader reads
   only `>`, and a disjunction whose FIRST term is not a length comparison.

   WHAT THIS ROSTER'S OWN READER CANNOT SEE, since it is subject to the same rule as everything
   else in this file: (a) it reads the right-hand side to the first `,` or `;` on the line, so a
   claim spanning two lines is read as its first line; (b) it blanks TEMPLATE-LITERAL CONTENTS
   before matching — without that, the word `truncated` inside a refusal message counted as a
   claim, which is the prose-matching failure the walk guards above already record for comments;
   (c) it does not count a REPUBLICATION (`out.truncated = truncated`, `truncated: !!raw.truncated`,
   `...(atts.truncated ? { truncated: true } : {})`) as a claim of its own, because the figure was
   computed — and graded, or named — elsewhere. Those republications are COUNTED and the count is
   printed, never silently dropped.

   AND THE BLANKER IS QUOTE-AWARE, WHICH IS A CORRECTION A CONTROL FORCED RATHER THAN A FLOURISH.
   Its first draft toggled on every backtick. `store.mjs` contains an ODD number of them — at
   least one lives inside a `'`- or `"`-quoted string — so the scanner latched `inTemplate` at
   line 33242 of the previous pass and **blanked the rest of the file**, which silently removed
   `biasManifest`'s own claim from the roster this block exists to name. A blanker that runs off
   the end is indistinguishable from a corpus with nothing in it, which is this file's oldest
   failure met from a new direction. */
const blankTemplates = (text) => {
  let out = "", i = 0, q = null;
  while (i < text.length) {
    const c = text[i];
    if (c === "\\") { out += q === "`" ? "  " : text.slice(i, i + 2); i += 2; continue; }
    if (q === null && (c === "`" || c === "'" || c === '"')) { q = c; out += c; i++; continue; }
    if (q !== null && c === q) { q = null; out += c; i++; continue; }
    if (q === "'" || q === '"') { if (c === "\n") q = null; out += c; i++; continue; }
    out += q === "`" && c !== "\n" ? " " : c; i++;
  }
  return out;
};
/* `(?<![=!<>])[:=](?![=])` so `shared.truncated === true` is a COMPARISON and not an assignment —
   four of those read as claims on the first run of this block, which is the arm finding the
   instrument rather than the subject, again. */
const CLAIM_RE = /\btruncated\b\s*(?<![=!<>])[:=](?![=])\s*([^,;\n]*)/g;
const UNREAD_FORMS = []; let republished = 0;
for (const [name, body] of segments(blankTemplates(CODE))) {
  CLAIM_RE.lastIndex = 0; let m;
  while ((m = CLAIM_RE.exec(body))) {
    const rhs = m[1].replace(/[\s})\]]+$/, "").trim();
    if (/^(?:true|false)\b/.test(rhs)) continue;                      /* a constant, not a measurement */
    if (/^[A-Za-z_$][\w$]*\s*\.\s*length\s*>\s*[A-Za-z_$][\w$]*/.test(rhs)) continue;  /* TRUNC_RE reads it */
    if (/^!{0,2}[A-Za-z_$][\w$]*(?:\s*\.\s*[A-Za-z_$][\w$]*)*$/.test(rhs)) { republished++; continue; }
    UNREAD_FORMS.push(`${name}: ${rhs}`);
  }
}
console.log(`  TRUNCATION FORMS THE GRADER'S SPELLING CANNOT READ (${UNREAD_FORMS.length}; `
          + `${republished} further claims REPUBLISH a figure computed elsewhere and are not counted here):`);
for (const u of UNREAD_FORMS.slice().sort()) console.log(`    UNREAD        ${u}`);
t("WHAT THE GRADER'S OWN SPELLING CANNOT READ IS COUNTED AND NAMED, never merely absent: a "
+ "`truncated` claim written in a form `X.length > Y` does not match is in NO roster REC-99 prints "
+ "— not graded, not ungraded, not in violation. `biasManifest` is the proof this roster is owed: "
+ "D-369 NAMES it and no instrument did. A reader that grades one spelling is this file's oldest "
+ "failure, so the unread forms get a roster of their own and a NEW one must be declared here",
  UNREAD_FORMS.slice().sort(),
  ["basisVersions: from + versions.length < total",
   "biasManifest: from + page.length < all.length",
   "deriveConnections: rowsCut || distinct.length > endsCap",
   "extractProposals: listed.length >= n",
   "search: ids.length >= IDS_MAX",
   "suggestVersion: rc ? !rc.legs_complete : false",
   "versionChain: from + versions.length < total"]);

/* REACH AS A DELTA, for this block's own readers. A walk that matches nothing reports zero
   violations forever, and this estate has recorded that outcome three times. */
const noCuts = inMemoryVerdicts(CODE.replace(/\.slice\(/g, ".noslice("));
t("REACH IS A DELTA (the in-memory cut reader): over a copy of store.mjs with no `.slice(` in it, "
+ "every in-memory claim becomes a VIOLATION and none is silently scored as compliant — the "
+ "direction that matters, since a reader that finds no cuts must not report a clean bill",
  [noCuts.cut.graded.length, noCuts.cut.violations.length > 0, INMEM.cut.graded.length > 0],
  [0, true, true]);

/* ------------------------------------------------ REACH, AS DELTAS.
   A walk that matches nothing reports zero and passes forever. Each reader is re-run over a
   MECHANICALLY BROKEN copy of the same source and must find FEWER. */
const strippedScans = CODE.replace(/#rows\(/g, "#norows(");
t("REACH IS A DELTA (the scan anchor): a copy of store.mjs with no `#rows(` in it yields NO class "
+ "members — every verdict here begins at a row source",
  [classMembers(strippedScans).size, CLASS.size > 0], [0, true]);
const strippedLoops = CODE.replace(/\bfor\s*\(/g, "forx (");
t("REACH IS A DELTA (the loop anchor): a copy with the `for` keyword broken finds FEWER, because "
+ "amplification is read off loops and not off the scan alone",
  classMembers(strippedLoops).size < CLASS.size, true);
const emptyClass = classMembers("");
console.log(`  REACH CONTROL: the same reader over an EMPTY corpus — 0 lines, `
          + `${segments("").size} segments, ${emptyClass.size} class members`);
t("REACH IS A DELTA (empty corpus): the same reader over NOTHING finds NOTHING, while over the real "
+ "source it does not — and the empty corpus is PRINTED above",
  [emptyClass.size, CLASS.size > 0], [0, true]);
t("REACH: THE FAILURE MODE NAMED — over that same empty corpus, `op=connect is off the roster` STILL "
+ "READS TRUE. That is exactly how a covering-nothing walk congratulates itself, and it is asserted "
+ "here so the reason the deltas and the FLOOR exist cannot be forgotten",
  [...dispatchedOps("")].filter(([, meth]) => emptyClass.has(meth)).length, 0);

/* ==========================================================================
 * LIVE — the op driven through its real route, over a fixture LARGE ENOUGH that the
 * bound bites at the DERIVATION. A quadratic subject needs a big fixture or the arms
 * prove nothing: at k=3 every `truncated: true` below would pass at zero cost.
 * ========================================================================== */
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r66", MEMBER_TOKEN: "mem-r66", PROBE_TOKEN: "prb-r66",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

const NOW = "2026-07-16T00:00:00Z";
const BIG_LABEL = "Coliseum Payment Allocation";
const SMALL_LABEL = "A Subject With Three Documents";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`, "produced_by:", "  mode: assisted",
  "  capability_tier: session", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
  "  since: null", "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:", "  locator: in hand",
  "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false",
  "  frequency: none", "---", "", "## Summary", "", "An agenda item.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");

/* FORTY documents on ONE subject, and the number is chosen rather than convenient: the
   default pair bound of 500 admits 32 documents (496 pairs), so 40 is the smallest round
   figure that CUTS the derivation while still forming 780 pairs unbounded — enough that
   "the store holds 496 rows, not 780" is a real difference and not a rounding one. THREE
   on a second subject, for the over-strictness arm. */
const BIG_K = 40, SMALL_K = 3;
const promote = async (i, label) => {
  const id = `INFO-2026-${String(i).padStart(4, "0")}-r66`;
  const md = bundleMd(id);
  const capture = sha(`r66-${i}`);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: capture, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: `legislation:26-${String(i).padStart(4, "0")}`, kind: "legislation",
                            key: String(i), label }] } }] });
  const files = [
    { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
    { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
  ];
  const r = await POST("op=promote&token=mem-r66", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "r66", files,
    register: [{ sha256: capture, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }],
    meta: { object_type: "information", group: "believe-in-oakland", title: id,
            current_state: "collected", created: NOW, last_updated: NOW } });
  if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 300)}`);
  return capture;
};
const BIG_CAPS = [], SMALL_CAPS = [];
for (let i = 1; i <= BIG_K; i++) BIG_CAPS.push(await promote(i, BIG_LABEL));
for (let i = BIG_K + 1; i <= BIG_K + SMALL_K; i++) SMALL_CAPS.push(await promote(i, SMALL_LABEL));
const BIG = (await POST("op=entitycreate&token=mem-r66", { kind: "contract", label: BIG_LABEL })).entity_id;
const SMALL = (await POST("op=entitycreate&token=mem-r66", { kind: "contract", label: SMALL_LABEL })).entity_id;
if (!BIG || !SMALL) throw new Error("entitycreate failed");
for (const c of [...BIG_CAPS, ...SMALL_CAPS]) {
  const r = await POST("op=resolve&token=mem-r66", { captureSha: c, resolvedBy: "r66" });
  if (r?.ok === false) throw new Error(`resolve ${c}: ${JSON.stringify(r).slice(0, 300)}`);
}

console.log("\n--- LIVE: the fixture, proved ARMED and proved LARGE ENOUGH before anything is asserted ---");
const bigConcerns = await GET(`op=concerns&token=mem-r66&id=${BIG}&limit=5000`);
t("FIXTURE ARMED: forty documents concern the big subject, and the answer that says so is itself "
+ "COMPLETE — the number is measured, not assumed",
  [bigConcerns.count, bigConcerns.truncated], [BIG_K, false]);
t("FIXTURE ARMED: three concern the small one, so the over-strictness arm is over a real subject",
  (await GET(`op=concerns&token=mem-r66&id=${SMALL}&limit=5000`)).count, SMALL_K);
t("FIXTURE IS LARGE ENOUGH FOR A QUADRATIC SUBJECT: 40 documents exceed the 32 the default bound "
+ "admits, so the bound BITES — at k=3 every `truncated: true` below would pass at zero cost, which "
+ "is exactly how a green suite has twice been recorded over a defect this week",
  [BIG_K > 32, (BIG_K * (BIG_K - 1)) / 2 > 500], [true, true]);

console.log("\n--- LIVE: the DERIVATION is bounded — the work the store DID, not the answer's shape ---");
const cut = await POST("op=connect&token=mem-r66", { entityId: BIG, assertedBy: "r66" });
t("op=connect: publishes the bound it APPLIED and the DOCUMENT bound derived from it — 500 pairs "
+ "admits 32 documents, and 32 is what the scan was allowed to read",
  [cut.limit, cut.document_limit], [500, 32]);
t("op=connect: a cut derivation SAYS SO — whether the record worked out the connections among ALL "
+ "the documents or among the first N is READABLE, not inferred",
  cut.truncated, true);
t("op=connect: the DERIVATION read 32 documents of the 40 that concern the subject — the bound is on "
+ "the SCAN, and this is the number a response-only cap could not have changed",
  [cut.documents, cut.document_limit, bigConcerns.count], [32, 32, 40]);
t("op=connect: and the SCAN ITSELF returned 33 rows against the 40 the record holds — one more than "
+ "it may use, which is how the answer learns that more existed. THIS IS THE ROW SOURCE BOUND D-227 "
+ "asked for: a store driven with more rows than the ceiling, and the query cannot return them",
  [cut.resolution_rows, cut.resolution_rows < bigConcerns.count], [33, true]);
t("op=connect: the pairs are 496 — 32*31/2 — and never more than the bound asked for, because the "
+ "document bound is the INVERSE of the quadratic rather than a second figure beside it",
  [cut.count, cut.count <= cut.limit, (cut.document_limit * (cut.document_limit - 1)) / 2], [496, true, 496]);
/* THE ARM THAT DISTINGUISHES THE FIX FROM THE NAIVE ONE, and it is the item. A derivation
   that ran whole and then cut its answer would publish EVERY figure above identically. What
   it could not do is leave 496 rows in the table where 780 pairs exist. */
const afterCut = await GET(`op=connections&token=mem-r66&id=${BIG}&limit=5000`);
t("THE WORK, MEASURED IN THE RECORD: the store holds 496 connection rows for the subject and not the "
+ "780 that k(k-1)/2 would produce — a derivation that ran whole and then SLICED its answer would "
+ "publish every figure above identically and leave 780 rows here. This is the arm that decides it",
  [afterCut.count, afterCut.truncated, (BIG_K * (BIG_K - 1)) / 2], [496, false, 780]);

console.log("\n--- LIVE: the bound NOT biting, at the ceiling and at a small subject ---");
const whole = await POST("op=connect&token=mem-r66", { entityId: BIG, assertedBy: "r66", limit: 5000 });
t("op=connect: at the ceiling the SAME subject is derived WHOLE — 100 documents admitted, 40 read, "
+ "780 pairs, and `truncated: false` said rather than implied",
  [whole.limit, whole.document_limit, whole.documents, whole.count, whole.truncated],
  [5000, 100, 40, 780, false]);
t("op=connect: DELTA — 'this is all of it' and 'this is the first N' do NOT read alike on the same "
+ "record, which is the whole reason `truncated` is published rather than inferred from `count`",
  [cut.truncated !== whole.truncated, cut.count !== whole.count], [true, true]);
t("THE WORK, AGAIN: the store now holds all 780 rows — the derivation was RESUMABLE by asking for a "
+ "wider bound, so a bounded derivation loses nothing permanently",
  (await GET(`op=connections&token=mem-r66&id=${BIG}&limit=5000`)).count, 780);
const small = await POST("op=connect&token=mem-r66", { entityId: SMALL, assertedBy: "r66" });
t("OVER-STRICTNESS: a small subject is derived WHOLE and is neither truncated nor refused — a bound "
+ "that turned away a legitimate three-document subject would be a worse defect than the one this "
+ "item fixed",
  [small.count, small.documents, small.truncated, small.ok], [3, 3, false, true]);

console.log("\n--- LIVE: the two answers of the SAME COUNT, one cut and one complete ---");
const cut3 = await POST("op=connect&token=mem-r66", { entityId: BIG, assertedBy: "r66", limit: 3 });
const whole3 = await POST("op=connect&token=mem-r66", { entityId: SMALL, assertedBy: "r66", limit: 3 });
t("SAME-COUNT DELTA: two derivations answer `count: 3` — one CUT from forty documents, one COMPLETE "
+ "over three — and `count` cannot tell them apart while `truncated` can",
  [cut3.count, whole3.count, cut3.truncated, whole3.truncated], [3, 3, true, false]);
t("SAME-COUNT DELTA: and `count === limit` is NOT the test either — it is true of BOTH here, so a "
+ "consumer inferring truncation from the arithmetic gets it wrong on the complete answer",
  [cut3.count === cut3.limit, whole3.count === whole3.limit], [true, true]);

console.log("\n--- LIVE: the clamp, the doors, and the inverse of the quadratic ---");
const over = await POST("op=connect&token=mem-r66", { entityId: SMALL, limit: 99999 });
t("op=connect: an over-ask is answered at the CEILING and the ceiling is what is published — echoing "
+ "99999 back would be a second way of lying about the same fact",
  [over.limit, over.document_limit], [5000, 100]);
const viaQuery = await POST(`op=connect&token=mem-r66&limit=2`, { entityId: BIG });
t("op=connect: the bound is reachable from the QUERY STRING as well as the body — this op has two "
+ "real doors (the surface POSTs a body, a probe passes `&id=`) and a bound only one of them could "
+ "ask for would be half a bound",
  [viaQuery.limit, viaQuery.document_limit, viaQuery.count], [2, 2, 1]);
const viaId = await POST(`op=connect&token=mem-r66&id=${SMALL}`, {});
t("op=connect: and the ENTITY is still reachable from `&id=` with an empty body — the door this op "
+ "shipped with, unmoved",
  [viaId.ok, viaId.entity_id, viaId.count], [true, SMALL, 3]);
const inverse = [];
for (const n of [1, 2, 3, 10, 100, 500, 5000]) {
  const r = await POST("op=connect&token=mem-r66", { entityId: SMALL, limit: n });
  inverse.push([n, r.limit, r.document_limit]);
}
t("THE INVERSE OF THE QUADRATIC, driven rather than argued: for every bound the plane accepts, the "
+ "documents admitted form NO MORE pairs than the bound — and one more document would form MORE, so "
+ "it is the largest honest figure and not a cautious one",
  inverse.map(([, lim, d]) => [(d * (d - 1)) / 2 <= lim, ((d + 1) * d) / 2 > lim]),
  inverse.map(() => [true, true]));
t("THE INVERSE OF THE QUADRATIC: and the pairs the ceiling admits are 4,950 against a 5,000 bound — "
+ "MEASURED at 798 bytes and 65ms per derivation at that size (test/connections-growth.measure.mjs, "
+ "2026-08-08), which is the figure the ceiling was chosen from rather than a round number",
  inverse.find(([n]) => n === 5000).slice(1), [5000, 100]);

/* ==========================================================================
 * OVER-STRICTNESS, at the WALK. A classifier that calls everything a defect is as
 * useless as one that finds nothing, and this class is AMPLIFICATION rather than SIZE.
 * ========================================================================== */
console.log("\n--- OVER-STRICTNESS: shapes that are NOT this class must be graded out ---");
const NOT_THE_CLASS = [
  /* A LINEAR read over an unbounded scan. It is REC-60's class and not this one: the answer
     may be enormous, but the work is one pass. Calling it this class would make the roster
     unholdable, which is PL-15's finding one instrument over. */
  ["ncLinear", `  ncLinear({ id } = {}) {
    const rows = this.#rows(\`SELECT a FROM t WHERE id=?\`, id);
    return { ok: true, count: rows.length, rows: rows.map((r) => r.a) };
  }`],
  /* Nested loops, but over a BOUNDED scan — the fix's shape. */
  ["ncBoundedNest", `  ncBoundedNest({ id, cap } = {}) {
    const rows = this.#rows(\`SELECT a FROM t WHERE id=? LIMIT ?\`, id, cap);
    for (const x of rows) for (const y of rows) this.sql.exec(\`INSERT INTO p VALUES (?,?)\`, x.a, y.a);
    return { ok: true, count: rows.length };
  }`],
  /* Quadratic work over a CALLER-SUPPLIED array and no scan at all. Unbounded input is a
     different defect with a different fix (a refusal, as op=suggest's caps are), and this
     walk deliberately reaches no verdict on it. */
  ["ncNoScan", `  ncNoScan({ items } = {}) {
    for (const x of items) for (const y of items) this.sql.exec(\`INSERT INTO p VALUES (?,?)\`, x, y);
    return { ok: true, count: items.length };
  }`],
];
for (const [name, src] of NOT_THE_CLASS)
  t(`OVER-STRICTNESS: \`${name}\` is NOT in the class, and the reason is in this file's header`,
    classMembers(`class Z {\n${src}\n  end() { return 1; }\n}`).has(name), false);
/* M0-40: THE CONTRADICTION ITSELF, PINNED RATHER THAN EXEMPTED OR SMOOTHED. `ncLinear` above is
   declared NOT this class and that verdict is right — one linear pass over an unbounded scan is
   REC-60's class and not this one. **The SAME read with the scan left INLINE in the for-header IS
   in the class**, because `perRowScan` counts a scan lying inside a loop's extent and a loop's
   extent begins at its `for` keyword. Same query, same rows, same work, opposite verdicts, and the
   only difference is where the call is written. That is the whole of M0-40's finding stated as two
   fixtures, and it is asserted in the state the instrument is ACTUALLY in rather than exempted:
   a session that corrects the header credit reds THIS line and reads the reason here, and
   `DEBT.md` D-384 is where that correction is priced (roster 35 -> 14, twenty-one departures). */
const NC_LINEAR_INLINE = `  ncLinearInline({ id } = {}) {
    const out = [];
    for (const r of this.#rows(\`SELECT a FROM t WHERE id=?\`, id)) out.push(r.a);
    return { ok: true, count: out.length, out };
  }`;
t("M0-40: `ncLinearInline` — `ncLinear`'s own read with the scan left in the for-header — IS in the "
+ "class, while `ncLinear` is NOT. The pair is the defect M0-40 measured, pinned so that neither "
+ "direction of correcting it can happen silently",
  [classMembers(`class Z {\n${NC_LINEAR_INLINE}\n  end() { return 1; }\n}`).has("ncLinearInline"),
   classMembers(`class Z {\n${NOT_THE_CLASS[0][1]}\n  end() { return 1; }\n}`).has("ncLinear")],
  [true, false]);

/* And the classifier must still SEE the class in a phrasing this file never wrote — an
   over-strictness block that only rejects proves nothing about what it accepts. */
const ALT_MEMBER = `  ncPerRow({ id } = {}) {
    const hits = this.#rows(\`SELECT k FROM t WHERE id=?\`, id);
    const keys = hits.map((h) => h.k);
    const out = keys.map((k) => this.#rows(\`SELECT v FROM u WHERE k=? LIMIT ?\`, k, 10));
    return { ok: true, count: out.length, out };
  }`;
t("OVER-STRICTNESS (the other direction): a per-row SCAN off an unbounded scan — a query per row, "
+ "phrased with `.map` and never a `for` — IS in the class, so the arms above measure the property "
+ "and not the spelling",
  classMembers(`class Z {\n${ALT_MEMBER}\n  end() { return 1; }\n}`).has("ncPerRow"), true);

await mf.dispose();

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
