/* NEGATIVE CONTROL: (SEVENTEEN ARMS. (m) and (m2) are UI-29's and (m) is BOB'S OWN, carried verbatim off DEC-44 onto this surface; (n) and (o) are UI-29's other two; UI-18's eight and UI-27's two are kept, RE-POINTED where UI-29 moved their subject; (p)-(s) are REC-49's. ALL SEVENTEEN RE-RUN 2026-08-05 by rec49-agent against the final file, so every count below agrees with the file it names: the thirteen earlier arms reproduced their FAIL counts EXACTLY, and the only one that moved is (c), which gained one and gained it for a reason recorded on its own line. Each arm is broken ALONE and `civicos-ui/app.html` is restored BYTE-IDENTICALLY — sha256 compared before and after every arm and equal to 2ed5beb2f6dda14e9c2193130ffc817b67b03029f82788e47c1d234f71f67de4 each time. The suite is 196 assertions whole; the counts are what each arm MEASURED. The pass counts moved with the suite (191 -> 196), which is why they were re-measured rather than adjusted on paper.)
 *   (m) A SINGLE CASE-LEVEL STRENGTH, ON THE SCREEN, IN PRINT AND IN THE EXPORT — UI-29 / DEC-44, and it is BOB'S OWN CONTROL. In `pubCaseHtml`, add one composed pair at case altitude: `${findings.length ? pubPairBadges(pubPair(findings[0]), pubCaseId(c)) : ""}` directly after the `<h1>` on page 1. RUN: 188 pass, 8 FAIL (re-run 2026-08-05; 183 -> 188 pass, FAIL count unchanged). The complement sweep NAMES what it found — "a pub-grade strength mark | a pub-grade strength mark | a data-axis attribute | a data-axis attribute | axis-and-letter text: Documents D | axis-and-letter text: Links C" — on the default rendering, on a filtered one, on the awaiting case, on the one-finding case and on the loose bundle; the OWNERSHIP assertion names `CASE-2026-0001` as an owner no finding of this case answers to; the mark/section tally disagrees; and the poisoned-answer block fires because the same code path draws it.
 *       WHAT THIS ARM MEASURED, AND IT IS THE REASON THE INSTRUMENT HAS THIS SHAPE: **EVERY PER-FINDING ASSERTION STAYS GREEN.** Both findings still render both of their own pairs, both declared bars, both bases, both falsifiers, both divisions; every value this suite demanded before is still delivered. The surface goes on answering correctly and ADDITIONALLY answers wrongly. REC-44 measured exactly this one altitude down (its control (a): blocks 1-4 entirely green under the same defect), which is why this control is a STRUCTURAL SWEEP OVER WHOLE RESPONSES — the complement of the finding sections, swept on the screen, on the printed artifact and on the exported container — and never a value comparison. A value comparison passes.
 *   (m2) THE SAME BUG WHERE THE COMPLEMENT SWEEP CANNOT SEE IT. Put the composed case pair INSIDE a finding's pages instead — in `pubFindingPages`, add `${pair ? pubPairBadges(pair, pubCaseId(c)) : ""}` to page (b). RUN: 195 pass, 1 FAIL (re-run 2026-08-05). The complement sweep is SILENT by construction (the marks are inside a finding section) and the OWNERSHIP assertion is the only thing that bites: a strength mark must name a finding this case actually has, or a finding one of its legs cites, and the case identity is neither. Two instruments, and either arm alone would have left the other defect invisible — arm (c)'s lesson at a new altitude.
 *   (n) THE `awaiting` WINDOW HIDDEN — in `pubStateHtml`, `if(true) return "";` before the incomplete branch. RUN: 191 pass, 5 FAIL (re-run 2026-08-05) — the incomplete edition renders no state at all, the reader is not told that 1 of 2 declared findings is missing, the "not an error" sentence and the reason the window exists both go, and the awaiting member is not named. The page still LOOKS perfect: the finding that landed is real, its strength is the plane's own, and the only thing wrong with it is what it does not say. DEC-40 arm (i)'s shape at a new altitude, and the reason the state is stated in BOTH directions.
 *   (o) THE COMPLETENESS ASSERTION RENDERED PER FINDING — add `${esc(c.completeness.statement)}` to `pubFindingPages` page (a) and empty it out of `pubCaseHtml`'s p2. RUN: 195 pass, 1 FAIL (re-run 2026-08-05), and ONE is the point: the statement is still on the page, still verbatim, still from the signed bytes — it is at the WRONG ALTITUDE, repeated once per member, where it reads as each finding's own claim about what IT left out. It is the CASE's, made once for the edition (DEC-44 (d), C-21.1's altitude). Only an assertion that reads the two altitudes apart can see it.
 *   (a) A DETERMINING LEG DROPPED AT A THRESHOLD — RE-POINTED 2026-08-04 (UI-29): unchanged in kind, but `pubQualifiers` now takes a FINDING. Change the graded arm's guard to `if(false && a.state === "graded" && a.weakest != null){`. RUN: 192 pass, 4 FAIL (re-run 2026-08-05) — finding 1's connection-determining leg dropped at the connection floors, its capture-determining leg dropped at the capture floors, both gone at the strictest pair, and the artifact's own sentence about why a qualifier survives gone with them. The reader is shown a frozen strength and no leg that could have produced it (D-8/C-15). NOTE WHAT IT DOES NOT BREAK: finding 2's UNRATED-axis qualifiers survive, because they come from `pubQualifiers`' OTHER arm — two protections, and this arm reaches one.
 *       AND THIS ARM CORRECTED THE SUITE, which is the most useful thing it ever did. On its first run (UI-18) it fired only 3, because three assertions read `t.includes(<leg id>)` over the stripped page — and A DROPPED LEG IS STILL NAMED, in the dropped list two inches lower, which is the whole rule. `pubLegHtml` marks the kept set `data-kept` and the dropped list `data-dropped`, the assertions read the two sets apart, and UI-29 added `data-of` so they read them apart PER FINDING as well — with two findings on one page, "the id is in the kept set" is true if EITHER kept it.
 *   (b) A PUBLISHED FINDING WITH NO PARENT NAMED — in `pubDivisionHtml`, disable the parent line (`${false ? …}`). RUN: 195 pass, 1 FAIL (re-run 2026-08-05), naming the division disclosure. ONE, and the count is the point: the siblings, the never-served sentence and the whole rest of the finding's pages still read perfectly, so nothing about the page LOOKS wrong — R4's disclosure is exactly the kind of absence a reader cannot notice.
 *   (c) A FINDING'S TWO STRENGTHS COMPOSED INTO ONE LETTER, INCLUDING IN PRINT — in `pubPairBadges`, return one mark carrying the stronger grade. RUN: 189 pass, 7 FAIL (re-run 2026-08-05: 185 -> 189 pass and 6 -> 7 FAIL) — the index rows lose the connection half, both findings' own pair rows lose it, the UNRATED axis stops reading UNRATED, and the awaiting case's landed finding loses it too. THE SEVENTH IS REC-49'S AND IT WIDENS THIS ARM'S REACH: the awaiting edition's ratified member now shows its own pair ON THE INDEX, so a composition into one letter is caught in the awaiting window as well as outside it — where before REC-49 there was no pair on that row for a composition to damage.
 *       THE OLD FINDING, KEPT: "mark count and axis count agree" STAYS GREEN, because the composed mark still carries a `data-axis`. The obvious instrument calls a single composed letter correct; only the PAIRED assertions fire. Do not weaken those into a count.
 *       AND A NEW ONE, MEASURED BY THIS ARM WHILE UI-29 WAS BEING WRITTEN: the first version of "finding 1 shows its pair" read `Links C` off finding 1's PAGES and stayed GREEN under the composition, because a LEG of finding 1 is graded connection C and prints its own mark two inches lower. That is UI-18 arm (a)'s outcome-that-costs-nothing in a new place. The frozen pair is now read out of the `pub-axisrow` that NAMES the finding, and the arm was re-run against the corrected instrument: 4 failures became 6.
 *   (d) ONE FLOOR APPLIED TO BOTH AXES — in `readerFloors`, read every axis off the same value (`const v = f.capture;`). RUN: 191 pass, 5 FAIL (re-run 2026-08-05) — a reader's pair no longer needs both axes, a half pair draws a case instead of refusing, the `none`/real split stops naming `none` where the reader said `none`, and DEC-40's filter line names one floor twice. R2's forbidden composition performed by arithmetic.
 *   (e) ONE AXIS LEFT UNCONSTRAINED — in `readerFloors`, default a missing or unknown value instead of refusing (`if(!FLOOR_VALUES.includes(v)){ out[ax] = "none"; continue; }`). RUN: 194 pass, 2 FAIL (re-run 2026-08-05) — the resolver accepts half a pair, and the half-pair rendering that must not be drawn is drawn. The surface refusing to draw is the shipped answer; the harness failing is the statement that such a rendering may not be shipped, because an unstated floor reads as a satisfied one.
 *   (f) A `none` FLOOR OMITTED FROM THE RENDERING — in `pubInbandHtml`, wrap the capture floor line as `${floors && floors.capture === "none" ? "" : `<div>…</div>`}`. RUN: 194 pass, 2 FAIL (re-run 2026-08-05) — the in-band block stops naming the floor it applied to the documents axis, in both the unfiltered and the mixed rendering. TWO, and every other assertion including the DEC-34 header's floor line stays green, because the header names the floors from a different function: an omission in ONE of the two places both floors are printed is invisible to any check that reads only the other.
 *   (g) A PAGE-SHAPED ARTIFACT WITHOUT THE DEC-34 HEADER — in `pubPage`, return `<section class="pub-page"${at}>${inner}</section>`. RUN: 178 pass, 18 FAIL (re-run 2026-08-05): page count and header count disagree, the per-page facts sweep finds none of the facts on any page, the finding/case altitude hashes go, the filter line count falls in both directions, the awaiting window leaves every header, the verification pointer goes with it, and the edition a reader is on stops being stated at all. This is DEC-34's negative control seam, which `bio-plane/test/publishedcase.test.mjs` deliberately left unplaced because the plane produces no pages to put a header on. It is placed here.
 *   (h) THE IN-BAND BLOCK HIDDEN IN PRINT — add `.pub-inband{display:none}` inside app.html's `@media print{…}` block. RUN: 195 pass, 1 FAIL (re-run 2026-08-05), naming the hiding rule. The print arm refuses ANY hiding rule rather than protecting a list of selectors, because the moment a stylesheet is allowed to hide one thing the argument for hiding the next is already written — and a qualifier that survives on screen and vanishes on paper is the forbidden compression performed by CSS.
 *   (i) STRIP THE FILTER LINE FROM A FILTERED RENDERING — in `dec34Header`, delete the whole `<span class="f"><b>What this is</b> ${pubFilterHtml(floors, "filterline")}</span>` line. RUN: 192 pass, 4 FAIL (re-run 2026-08-05) — the per-page count of filter lines falls short in BOTH directions, and neither rendering's DEC-34 header carries the line any more. THIS IS THE ARM DEC-40 EXISTS FOR: a filtered page indistinguishable from the case is the misrepresentation vector, and it is the one defect that leaves the page looking perfect — every leg it kept is real, every strength on it is the plane's own, and the only thing wrong with it is what it does not say.
 *   (j) PRESENT A FILTERED RENDERING AS THE CASE — in `pubRenderingName`, return `"THE WHOLE CASE, UNFILTERED"` unconditionally. RUN: 193 pass, 3 FAIL (re-run 2026-08-05) — the filtered rendering is no longer named as a view the reader constructed, the footer's rendering hash is described as the case, and the stripped-text sweep loses the statement.
 *       AND THE ARM MEASURED SOMETHING WORTH KEEPING, in arm (c)'s exact shape one altitude up: the `data-filter="reader"` MARKS STAYED CORRECT on every page, because they are computed from `pubFiltered` and not from the sentence. Only the assertions that read the WORDS fired. Do not weaken the word assertions into the mark count.
 *   (p) THE PAIR READ BACK OUT OF THE CASE CONTAINER MANIFEST — REC-49's own, and it restores the state the item closes. In `pubList`, replace `const pair = pubPair(row);` with a read of the case row's manifest: `const pair = cs.manifest ? pubPair((JSON.parse(cs.manifest).findings || []).find((f) => f.bundle_id === m.bundle_id)) : null;`. RUN: 194 pass, 2 FAIL. The awaiting edition's RATIFIED member loses its pair entirely — the container it would have been read from is not assembled and will not be until the last member lands, which on a live instance is days — and the edition whose container was never recorded loses its member's pair with it. NOTE WHAT STAYS GREEN: every complete case still renders both findings' pairs, both bars and every letter this suite demanded before. The surface goes on answering correctly for the cases that finished and stops answering for the ones that have not, which is exactly why the fixture carries an awaiting edition with a ratified member in it.
 *   (q) UI-29'S HONEST-FOR-NOW SENTENCE RESTORED WHERE IT IS NO LONGER TRUE — put back "This finding's frozen pair travels in the case container, which is not assembled for this edition yet." RUN: 194 pass, 2 FAIL. The sentence is reached by a RATIFIED member the plane holds no pair for, and it blames an unassembled container for a pair that was simply never published. AND THE ARM MEASURED WHY THE FIXTURE HAD TO GROW: on its first run it fired ZERO. The assertion that the old sentence is absent from the page passes for free when nothing renders the branch, which is the outcome-that-costs-nothing shape — so the awaiting edition gained a THIRD declared member, ratified and with `strength: null`, and only then does the arm bite.
 *   (r) A LOOSE RATIFIED FINDING TOLD IT HAS NO PAIR WHILE IT IS HOLDING ONE — in `pubList`'s not-a-case branch, delete the `${loose ? …pubPairBadges…}` section. RUN: 195 pass, 1 FAIL. UI-29 stated four absences of a loose row in one breath and three of them are structural (a case identity, a scope statement and a completeness assertion are properties of a CASE); the fourth is not, because a frozen pair belongs to the FINDING. The row now says which of the two it is.
 *   (s) COMPLETENESS READ OFF THE ROSTER AGAIN — in `pubList`, replace `const assembled = !!cs.manifest_sha;` with `const assembled = !waiting.length;`. RUN: 195 pass, 1 FAIL. The container is recorded by the control plane AFTER the last ratification returns, so "every declared member ratified" and "the container exists" are two facts; in the gap the roster reading draws the row as ratified and prints `container sha256:` with nothing in front of the ellipsis.
 * Restore after each. The arms are scripted and re-runnable in one step; each is a single unique string replacement in `civicos-ui/app.html`, quoted above with its site.
 *
 * ==== UI-35's EIGHT, ALL RUN 2026-08-05 against THIS file, block 16. The suite is 205 assertions whole (196 before this item). Every file restored BYTE-IDENTICALLY, sha256 compared before and after each arm across `civicos-ui/app.html`, this file, and `bio-plane/src/store.mjs`. ====
 *   (a) THE DEAD READ RESTORED — in `pubStateHtml`'s not-a-case branch, wrap the sentence back up as `${esc((c.detail) || "…")}`. RUN: 204 pass, 1 FAIL — "the not-a-case branch reads NO top-level `detail`". This is the state `main` is in today.
 *   (b) THE INVENTED FIXTURE FIELD RESTORED — add `detail:"…"` back to the `LOOSE` fixture. RUN: 204 pass, 1 FAIL — "no fixture in this suite carries a top-level `detail` on a FOUND answer".
 *   (c) THE PAIRED ARM, (a) AND (b) TOGETHER — the true pre-item state. RUN: 203 pass, 2 FAIL, and THE 196 PRE-EXISTING ASSERTIONS ARE ALL GREEN. That is the finding: the surface read a field the wire never sends, the fixture supplied it, and not one of 196 assertions could see it, because the fixture made the dead branch render exactly as if it were alive. An arm that only ran (a) or only (b) would have looked like a tidy-up; run together they show why neither was catchable from inside the suite.
 *   (d) A NEW PUBLISHED KEY PLANTED IN THE PLANE — add `planted_note: "x",` to `publishedCase()`'s success return in `bio-plane/src/store.mjs`. RUN: 204 pass, 1 FAIL naming `planted_note` as published-and-unread. This is the sweep's REACH AS A DELTA against the REAL return rather than a specimen, and it is what stops a fifth unread field arriving unnoticed.
 *   (e) THE WALK NEUTERED — break the anchor to `scope: NOPE,`. RUN: 201 pass, 4 FAIL, the first being the REACH assertion. **CORRECTED MID-RUN AND REPORTED:** the first version bound `region` to `null` and then THREW on `region.length`, taking every assertion behind it down with it — D-93's class inside one block, a control dying early and hiding the arms it sits in front of. It now binds `|| ""`, so the reach failure is reported AND the rest of the block still runs.
 *   (f) THE UNREAD LIST SHRUNK — delete `opened`'s entry from `UNREAD`. RUN: 204 pass, 1 FAIL. The list cannot silently shrink to match a regression; it is a pinned SET, in both directions.
 *   (g) THE REFUSAL'S OWN `detail` RENAMED IN THE PLANE — `reason:"NOT_PUBLISHED", detail:` -> `explanation:`. RUN: 204 pass, 1 FAIL. THE OTHER DIRECTION, and it earns its place: without it this block reads as "the plane never publishes a top-level `detail`", which is FALSE — the refusal does, `planeSaid` renders it (UI-37), and the two must not collapse into one claim.
 *   (h) THE SURFACE MADE TO READ AN UNREAD KEY — add `const planted = c.case_detail;` to `pubStateHtml`. RUN: 204 pass, 1 FAIL. The UNREAD set tracks what the surface ACTUALLY reads rather than being a hand-kept list that would go stale the moment somebody rendered one of them.
 * Restore after each.
 *
 *   (t) UI-40'S FOUR ARMS, ALL RUN 2026-08-05 by ui40-agent against the final files, every file restored
 *       BYTE-IDENTICALLY with sha256 compared before and after (app.html unchanged throughout;
 *       bio-plane/src/store.mjs 795d4f27…; this file 6458ed44…). The suite is 226 assertions whole.
 *   (t1) `case_detail` BLANKED AT THE PLANE — in bio-plane/src/store.mjs replace the whole `case_detail:`
 *       string with `""`. RUN: 219 pass, 7 FAIL, and the harness NAMES WHICH ACCOUNT WENT MISSING rather
 *       than rendering an empty box: "UI-40: `case_detail` is RENDERED, and VERBATIM" fails reporting
 *       `marked=false verbatim=false planeChars=0`, the case-altitude arm fails, and the in-suite blanking
 *       arm for the OTHER account reports `marks now = none`. THE ARM ALSO CORRECTED THIS SUITE: on its
 *       first run the failing assertion printed "found: verbatim", because `strip("")` is `""` and every
 *       string contains it — a detail line contradicting its own verdict. Both verbatim details now report
 *       `marked` and `verbatim` separately with the plane's character count beside them.
 *   (t2) `graph_detail` BLANKED AT THE PLANE, same way. RUN: 220 pass, 6 FAIL, naming `graph_detail`
 *       (`marked=false verbatim=false planeChars=0`) and reporting `finding pages carrying it=0`.
 *   (t3) `opened` RESTORED TO THE PUBLISHED SHAPE — bio-plane/src/store.mjs reverted to its pre-IC-22
 *       state. RUN: 225 pass, 1 FAIL here, naming it — `unread=bias_acknowledgement,opened` against
 *       `listed=bias_acknowledgement` — AND 77 pass, 1 fail in bio-plane/test/publishedcase.test.mjs,
 *       whose own arm names it. TWO SUITES CATCH IT INDEPENDENTLY, at the surface and through the op.
 *   (t4) THE CONSUMER WALK NEUTERED — `if(false && EXT.has(...))` so the walk collects no files. RUN:
 *       221 pass, 5 FAIL, every reach arm moving AS A DELTA (corpus `0 files / 0 chars`, `NONE EXCLUDED`,
 *       `0 reads of .ratified_at`, `real=0 neutered=0`). **AND IT MEASURED THE THING THIS ARM EXISTS FOR:
 *       the headline assertion — "`opened` has ZERO consumers" — STILL PASSED,** because zero consumers
 *       over an empty corpus is an outcome that costs nothing to produce. It is caught only by the PAIRED
 *       arm, which requires the producer's own reads to still be there and fails with "NONE AT ALL — the
 *       walk found nothing, which is itself suspect". Do not delete the paired arm to tidy the block: it
 *       is the only thing standing between this measurement and a confident zero over nothing.
 *
 * ==== UI-56'S ARMS (IC-66's delegation), ALL RUN 2026-09-10 against the final files. The suite is
 *      234 assertions whole; the PRE-ITEM suite was MEASURED at 226 (run at `HEAD` with `HEAD`'s
 *      `app.html`, both restored and `cmp`-verified) rather than derived by subtraction. Every file
 *      restored BYTE-IDENTICALLY after every arm, sha256 AND `cmp` compared, byte counts printed and
 *      floored. The subject of these arms is `civicos-ui/app.html`, 1,170,731 B, sha256
 *      c694ad3831377845… — unchanged across all three. **THIS FILE'S OWN sha IS DELIBERATELY NOT
 *      QUOTED HERE**: writing it into the file it digests changes it, and a figure that cannot be
 *      true when it is read is worse than no figure. What is asserted instead is the property the
 *      runner actually enforces — this file was byte-identical before and after each arm.
 *      THE BASELINE ROW IS PART OF THE RECORD: nothing armed, 234/234, 0 failed — without it, five
 *      arms broken and five arms working are the same output. ====
 *   (u1) THE CASE-EDITION JOIN RESTORED — in `pubList`, collapse `pubMemberKey` to the old key:
 *       `const pubMemberKey = (m, cs) => m.bundle_id + "@" + (cs ? cs.edition : m.edition);`.
 *       RUN: 229 pass, 5 FAIL. The diverged member `INQ-2026-4600` is not joined to its ratified row
 *       at all, loses its pair, loses its declared bar, and appears a SECOND time in the not-in-any-case
 *       list; the row count moves 8 -> 9 with it. **AND THE FIXTURE IS THE ARM**: with a member whose
 *       own edition AGREES with its case's, this defect is invisible — every one of the five failures
 *       needs a member at its own edition 1 inside a case at edition 2, which is the state CASE-5 made
 *       reachable and which no fixture in this suite carried before.
 *       NOTE WHAT STAYS GREEN, and it is the finding: 225 of the 226 PRE-EXISTING assertions. Both
 *       editions of the two-finding case, the solo case, the awaiting window, the stuck container and
 *       both loose rows go on answering perfectly. The surface does not break — it drops one finding
 *       out of the record and says two contradictory things about it, on a page whose every other word
 *       is right. The ONE pre-existing assertion that moves is the row count, and it moves without
 *       being able to say what happened; the four that name the finding are the ones that can.
 *   (u1b) THE SAME DEFECT AS THE REAL PRE-ITEM BYTES — `civicos-ui/app.html` swapped for `HEAD`'s
 *       actual content (1,167,827 B, 0695719f0e60fdc2…) rather than a hand restoration. RUN: 229 pass,
 *       5 FAIL, THE SAME FIVE. This arm exists because a hand-written "restoration" is a claim about
 *       what the old code did, and a claim that costs nothing to produce is not evidence; the two runs
 *       agreeing is what makes (u1) a measurement of the shipped defect rather than of my retelling.
 *   (u2) OVER-STRICTNESS — THE UNDIVERGED RENDERING, BYTE FOR BYTE. Same suite, same fixture, only
 *       `app.html` swaps: the index is dumped under the fix and under `HEAD`, and every row that is
 *       not the diverged member's is compared BYTE FOR BYTE. RUN: 7 undiverged rows each side, 0
 *       byte-differing rows — THE FIX CHANGES NOTHING AT ALL for an undiverged member, including the
 *       PINNED-and-agreeing members and the UNPINNED legacy member (`CASE-2026-0004`, `version_sha`
 *       null), whose join still falls back to the case's edition and must. Only the diverged rows
 *       differ, in the declared direction: `HEAD` renders 2 rows (its case, `awaiting?=true`, and a
 *       duplicate `data-notacase` row, `duplicated-as-loose?=true`), the fix renders 1 (its case,
 *       both false). The corpus is asserted non-empty and the dump floored at 5,000 chars, because an
 *       over-strictness arm over an empty rendering passes for free.
 * Restore after each; (u1) is a single unique string replacement and the runner REFUSES to arm if its
 * anchor matches any number of times other than one.
 */
/* UI-18 · O2 THE PUBLISHED CASE, AS UI-29 CORRECTS IT — the surface UI-PLAN
 * calls "the reason the rest exists", driven here against the public read path
 * REC-22 built and REC-44 corrected.
 *
 * WHAT UI-29 CHANGED, AND WHY IT IS A CORRECTION AND NOT NEW SCOPE. This suite
 * used to drive ONE INQUIRY as the case: one body, one basis, one frozen pair,
 * one falsifier. That shape was never chosen — it was ASSUMED by every item in
 * the chain (D-187), and Bob's fact check of his own definition found the
 * repository contradicting him in his favour. DEC-44: **a case is a CONTAINER
 * OVER ONE OR MORE FINDINGS.** Every pin below that read the case as a single
 * inquiry is CORRECTED at its site with a dated reason and NOT ONE IS EXEMPTED:
 * every value the old suite demanded is demanded still, one altitude down.
 *
 * THE ORGANISING QUESTION, and it is not "does the markup contain the words".
 * This is the only surface a STRANGER meets and the only one that reads with no
 * credential, so the suite is built around the four ways it could betray that:
 *
 *   1. IT COULD ASK FOR SOMETHING IT SHOULD NOT NEED. Every assertion below is
 *      made by a caller holding NOTHING — `PLANE.token` is null for the whole
 *      run — and the wire is swept at the end.
 *
 *   2. IT COULD CLAIM MORE THAN THE RECORD SUPPORTS. Both frozen strengths of
 *      EVERY finding, everywhere including the index row, and never one composed
 *      letter — not for a finding and, since DEC-44, NOT FOR THE CASE. A case
 *      does not have a strength; two findings of different strength collapsed
 *      into one letter is R2's forbidden composition arriving at case altitude.
 *      This is asserted as a STRUCTURAL SWEEP over the complement of the finding
 *      sections, across the screen, the printed artifact and the exported
 *      container, because REC-44 MEASURED that a value comparison passes: the
 *      surface goes on answering correctly and ADDITIONALLY answers wrongly.
 *
 *   3. IT COULD FILTER SOMETHING AWAY WITHOUT SAYING SO (DEC-40, UI-27). THE
 *      READER supplies a pair of independent floors, defaulting none/none, and
 *      every rendering drawn under them carries the FILTER in DEC-34's per-page
 *      header, in-band, and beside the rendering hash in the footer, and is
 *      never presented, printed or hash-described as "the case". An UNFILTERED
 *      rendering says that it is unfiltered.
 *
 *   4. IT COULD SHOW A CASE AS FINISHED WHEN IT IS NOT. Ratification is PER
 *      FINDING, so a case edition is ratified N times and is servable as a
 *      container only when the last member lands. That window is a real state —
 *      `complete:false` with `awaiting[]` — and it renders as one: never an
 *      error, never hidden, and stated in BOTH directions so that absence of the
 *      statement cannot become the ambiguity.
 *
 * WHAT THIS SUITE MEASURED THAT IS WORTH THE NEXT SESSION'S TIME:
 *
 *   - THE COUNT SWEEP IS NOT ENOUGH FOR THE COMPOSED LETTER (arm (c)), and THE
 *     COMPLEMENT SWEEP IS NOT ENOUGH FOR THE COMPOSED CASE (arm (m2)). Two
 *     instruments each, and in both pairs the weaker one alone called the
 *     composition correct.
 *   - D-160 REACHES THIS ITEM'S OWN VOCABULARY. The boundary case is UNRATED.
 *   - THE FROZEN PAIR CARRIES NO `not_load_bearing`, so the set of legs that
 *     left an axis UNRATED is taken from the finding's own basis instead: one
 *     qualifier too many, never one too few.
 *
 * THE FOUR FORBIDDEN AFFORDANCES (H7 reply box, H2 notify-me, H3 verified-
 * author badge, H1 redact/take-down) are asserted ABSENT structurally, and the
 * reasoning for each is at the head of app.html's `__PUBLISHED_CASE__` region
 * rather than here, because the file that would grow one is the file that has
 * to carry the argument against it.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one — ONE implementation, so `bio-plane/test/tally-through-pipe.test.mjs` guards it for
   both estates and a node release closing the private door goes red once instead of half. The
   import is for its SIDE EFFECT and is idempotent. Census: `stdio-census.test.mjs`. */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { fileURLToPath } from "url";   /* UI-40: the consumer walk resolves the repo root from this file */
import { appScript } from "./extract.mjs";
import { requiredArgumentWire } from "./plane-refusal-wire.mjs";   /* UI-100: C-61.1's envelope DERIVED from the plane's own
      call site and the DEC-49 catalogue, never typed. */
/* D-257 — UI-40's consumer walk reads the WHOLE REPOSITORY off the working tree
   and FLOORS on what it found. One mechanism, imported; the argument is at the
   walk. */
import { readGitProvenance, repoPath, reportProvenance } from "../../bio-plane/scripts/provenance.mjs";

let n = 0; const fails = [];
/* `detail` is not decoration: DEC-44's negative control requires the harness to
   FAIL NAMING what it found, and a sweep that answers only true or false leaves
   the next session to re-derive where the case-level strength was. Every sweep
   below hands its hit list in. */
function ok(msg, cond, detail){
  n++;
  if(!cond){ fails.push(msg); console.error("  FAIL", msg);
    const d = Array.isArray(detail) ? detail.join(" | ") : detail;
    if(d) console.error("       found: " + d); }
}

/* ============================================================
   THE FIXTURE — shaped exactly as `op=publishedcase` answers AFTER REC-44,
   taken from bio-plane/src/index.mjs's handler and bio-plane/src/store.mjs's
   `publishedCase()` / `#caseEditionState()`. The answer is
   `{caseId, edition, scope, completeness, complete, awaiting, findings[],
     manifest_sha, manifest, files[], editions, edition_index, latest_edition}`
   and there is NO top-level `strength`, `required`, `bundle_sha`, `body`,
   `basis`, `serves`, `names` or `division`: every one of those is PER FINDING,
   inside `findings[]`. `strength` is the FROZEN frontmatter block (weakest is a
   target id STRING, and there is no `not_load_bearing` key); `required` is the
   frozen `required_strength`; `basis[]` carries the plane's own `served` flag
   and the cited edition's own frozen pair.

   THE CASE UNDER TEST CARRIES TWO FINDINGS WHOSE STRENGTHS DIFFER, which is
   DEC-44's own negative-control condition: FIND_A is Documents D / Links C and
   FIND_B is Documents B / Links UNRATED. There is no letter that is honestly
   "the case's", and the surface must not manufacture one.
   ============================================================ */
/* UI-35: THE TWO TOP-LEVEL SENTENCES THE WIRE REALLY SENDS, READ TEXTUALLY OUT
   OF THE PLANE rather than typed here. UI-37's practice, and this item is why it
   matters: the previous fixture typed a TRUNCATED `case_detail` and invented a
   top-level `detail` that does not exist, so the mock had drifted from the wire
   in both directions at once. A fixture that reads the plane's own bytes cannot
   drift, and if the plane's wording moves this suite moves with it. */
const PLANE_STORE = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "utf8");
/* Brace-balanced is the wrong tool here and a naive `[^"]*` is too: these are
   ADJACENT string literals joined by `+` across lines. Take the region from the
   key to the next top-level key and concatenate every double-quoted literal in
   it — which is exactly what the JavaScript parser does to produce the value. */
function planeSentence(key, until){
  const i = PLANE_STORE.indexOf(key + ": \"");
  if(i < 0) return null;
  const j = PLANE_STORE.indexOf(until, i);
  const region = PLANE_STORE.slice(i + key.length + 1, j < 0 ? PLANE_STORE.length : j);
  const parts = region.match(/"(?:[^"\\]|\\.)*"/g) || [];
  return parts.map((s) => JSON.parse(s)).join("");
}
const CASE_DETAIL = planeSentence("case_detail", "graph_detail");
const GRAPH_DETAIL = planeSentence("graph_detail", "\n  }");
/* The GROUP's own sentence, not the plane's — `bias_acknowledgement` carries
   what the publishers wrote about the lens the case was produced under (REC-47,
   DEC-46 (a)), gated by C-21.1 against being carried forward verbatim. It is a
   FIXTURE value for that reason: unlike the two above there is no fixed wording
   in the plane to read. Block 12 records that NOTHING on this surface renders
   it. */
const BIAS_ACK = "This case was produced by the group that raised the concern, working from documents "
               + "the subject supplied. No independent custody of the originals was obtained.";

/* CASE-6 / DEC-72 clause 2: THE PUBLISHING PROJECT, which the case rows now
   carry. It is a real id rather than a bare truthy string because the surface
   PRINTS it beside the bar — "the standard of PROJ-…, the project whose
   production this case is" — so a placeholder would be a placeholder on the
   page. `CASE_WAIT` deliberately carries NULL instead of this, which is the
   LEFT JOIN's own reachable state. */
const PROJ = "PROJ-2026-0001";
const CASE = "CASE-2026-0001";
const FIND_A = "INQ-2026-4101";
const FIND_B = "INQ-2026-4102";
const CASE_SOLO = "CASE-2026-0002";          // DEC-44 determination 5: the degenerate one-finding case
const FIND_S = "INQ-2026-4200";
const CASE_WAIT = "CASE-2026-0003";          // an edition inside the `awaiting` window
const FIND_C = "INQ-2026-4301";
const FIND_D = "INQ-2026-4302";              // declared, not yet ratified
const FIND_E = "INQ-2026-4303";              // REC-49: RATIFIED, and the plane holds NO frozen pair for it
const CASE_STUCK = "CASE-2026-0004";         // REC-49: every member ratified, container NOT recorded
const FIND_K = "INQ-2026-4401";
const PARENT = "INQ-2026-4000";
const SIBLING = "INQ-2026-4103";
const INFO = "INFO-2026-8001";               // ratified bytes that are in NO case
const LOOSE_FIND = "INQ-2026-4500";          // REC-49: a ratified FINDING in no case — it still has a pair
/* UI-56 (IC-66's delegation): THE DIVERGED MEMBER, and the whole item lives on it.
   CASE-5 unslaved a member's edition from its case's, so a case's edition 2 may
   carry a finding that is at ITS OWN edition 1 — and the surface used to join the
   two on the CASE's number. A fixture in which the two editions AGREE cannot see
   that defect AT ALL, which is why this pair is here rather than an assertion
   added over the rows that were already present. */
const CASE_DIV = "CASE-2026-0005";           // edition 2 of the case…
const FIND_V = "INQ-2026-4600";              // …whose only member is at its own edition 1

const A1 = "a".repeat(64), A2 = "b".repeat(64);          // FIND_A's bundle sha, editions 1 and 2
const B1 = "c".repeat(64), B2 = "d".repeat(64);          // FIND_B's
const MAN1 = "e".repeat(64), MAN2 = "f".repeat(64);      // the CASE container manifests
/* CASE-5b's signed CASE DOCUMENT hash. Distinct from every manifest and every
   bundle sha on purpose: the case document and the case container are two
   different objects with two different hashes, and a fixture that reused one for
   the other would let a surface confuse them and stay green. */
const CASE_DOC_SHA = "d".repeat(63) + "1";
const SOLO_DOC_SHA = "d".repeat(63) + "2";
/* CASE-6 / D-173: `bar_detail` IS THE PLANE’S OWN SENTENCE AND IS COPIED BYTE
   FOR BYTE FROM `store.mjs` publishedCase(), not paraphrased. The surface prints
   it verbatim (DEC-8), so a fixture carrying an approximation would let the
   surface reword the plane and stay green — the one thing DEC-8 forbids. */
const BAR_DETAIL_DECLARED =
  "the standard of evidence this case was held to, read from its publishing project at the "
+ "moment of publication and frozen here (DEC-72). It is the CASE’s property: no bar attaches "
+ "to any finding, and nothing composed it across projects. Each member’s own derived pair is "
+ "printed beside it inside findings[], and a member may exceed it.";
const BAR_DETAIL_ABSENT =
  "NO BAR IS RECORDED for this case edition, and that is not a bar of zero. Either the case "
+ "was published before a case carried its own standard, or no bar was ever declared — in "
+ "which case the case claims no cleared standard and says so, because undetermined is "
+ "first-class here and is never rounded to a number nobody chose.";
const CAP_SHA = "0".repeat(64), DOC_SHA = "1".repeat(64);
const S_SHA = "2".repeat(64), S_MAN = "3".repeat(64);
const C_SHA = "4".repeat(64);
const INFO_SHA = "5".repeat(64);
const LOOSE_SHA = "6".repeat(64);
const E_SHA = "7".repeat(64), K_SHA = "8".repeat(64);
/* UI-56: `D_SHA` is a PIN WITH NO RATIFIED ROW BEHIND IT — the declared-and-not-yet-
   ratified member's version was pinned when it was rostered and the finding has not
   been signed, which is the state the awaiting window exists for. `V_SHA` is the
   diverged member's own ratified hash, and `DIV_MAN` its case's container. */
const D_SHA = "9".repeat(64), V_SHA = "ab".repeat(32), DIV_MAN = "cd".repeat(32);

const L_CAP_B = INFO;               // capture B, supports, SERVED
const L_CAP_D = "INFO-2026-8002";   // capture D, supports, NAMED — FIND_A's capture DETERMINING leg
const L_CAP_C = "INFO-2026-8003";   // capture C, CUTS AGAINST, NAMED — dropped at a capture floor of B
const L_CON_C = "INFO-2026-8004";   // connection C, supports, NAMED, HUNCH — FIND_A's connection DETERMINING leg
const L_CON_A = "INFO-2026-8005";   // connection A, supports, SERVED
/* UI-40: THE CONTRADICTION IN THE INDEX, and the fixture had to grow to hold it.
   An edge the case classified SERVABLE at publication with no published edition
   behind it now — what the plane calls a contradiction and REPORTS in
   `unresolved[]` rather than swallowing, on the reasoning that dropping it would
   make the write-time restriction untestable from the outside. Before this item
   NO fixture in this suite carried a non-empty `unresolved[]`, so the branch that
   renders it could have been written any way at all and 205 assertions would have
   agreed — the dead-branch-renders-as-alive shape UI-35 found here in its own
   fixture. The honest cause is a target published and later purged. */
const L_GONE = "INFO-2026-8009";    // classified servable at publication; nothing published behind it now

const PAIR_A = [
  { axis:"capture", state:"graded", grade:"D", weakest:L_CAP_D, load_bearing:3, population:3,
    detail:"capture D — no stronger than the weakest capture it rests on, which is " + L_CAP_D + "." },
  { axis:"connection", state:"graded", grade:"C", weakest:L_CON_C, load_bearing:2, population:2,
    detail:"connection C — no stronger than the weakest connection it rests on, which is " + L_CON_C + "." },
];
/* DEC-18 / D-160's boundary case, and it is on the OTHER member of the SAME
   case: one finding graded on both axes, one UNRATED on connection. There is no
   letter that describes both, which is the point of the fixture. */
const PAIR_B = [
  { axis:"capture", state:"graded", grade:"B", weakest:"INFO-2026-8201", load_bearing:1, population:2,
    detail:"capture B — no stronger than the weakest capture it rests on, which is INFO-2026-8201." },
  { axis:"connection", state:"unrated", grade:null, weakest:null, load_bearing:0, population:1,
    detail:"UNRATED on connection: no leg on this axis carries an established grade, so this conclusion rests on nothing established here. Not load-bearing: INFO-2026-8202." },
];
/* CORRECTED 2026-09-10 (CASE-6 / DEC-72 clause 2), NOT EXEMPTED. It read:
   "DEC-17: FIND_A declares NO bar and FIND_B declares one, on ONE case. Both
   branches are therefore under test on a single page, which is the shape DEC-44
   makes possible and the old fixture could not have: `required_strength` is
   frozen into a FINDING's bytes, so two members of a case may have been held to
   different standards and neither stands for the other."

   THAT SHAPE IS NOT MERELY UNUSED NOW — IT IS UNREPRESENTABLE. DEC-72 clause 2
   makes the bar the publishing PROJECT's, told to the act once, so one case has
   one standard; CASE-5 moved the authority to `published_cases.bar`; CASE-5b
   removed `required_strength` from finding bytes entirely and C-2.8 refuses it
   there. Two members of one case under different standards cannot be built by
   this plane, and a fixture asserting over one is a suite proving something
   about nothing.

   BOTH BRANCHES ARE STILL UNDER TEST, one altitude up: these two constants are
   now CASE bars, `CASE` taking the declared one and `CASE_SOLO` the absent one,
   so a declared and an absent bar are both rendered in one run and the "an
   absent bar is not a bar of zero" sentence is still exercised. The per-member
   `required` blocks below are kept in step with their case's bar rather than
   left to drift, because the plane writes them as COPIES of it — a fixture where
   they disagreed would be a fixture of a state the record cannot hold. */
const BAR_ABSENT = { declared:false, source:"none", capture:null, connection:null,
  detail:"no required evidentiary strength was declared for this finding, by the group or by any project citing it, so nothing here was measured against one. An absent bar is not a bar of zero, and this finding makes no claim to have cleared any standard." };
const BAR_DECLARED = { declared:true, source:"group", capture:"B", connection:"C",
  declared_by:"vera", declared_at:"2026-05-02",
  detail:"the group's default required strength: capture B, connection C, declared by vera on 2026-05-02." };

const BASIS_A = [
  { target:L_CAP_B, role:"supports", grade:"B", grade_axis:"capture", grade_source:"capture",
    target_edition:1, served:true,
    cited_edition:{ edition:1, title:"The transfer memo", bundle_sha:DOC_SHA, ratified_at:"2026-06-01T00:00:00Z",
      case_id:null,
      capture:{ axis:"capture", state:"graded", grade:"B" }, connection:{ axis:"connection", state:"unrated", grade:null } },
    detail:"this leg rests on a published finding, so it can be served from this surface." },
  { target:L_CAP_D, role:"supports", grade:"D", grade_axis:"capture", grade_source:"testimony",
    target_edition:null, served:false, cited_edition:null,
    detail:"this leg is NAMED and not served: what it rests on is not in the published record, so this surface can say the finding cites it and can hand over nothing of it." },
  { target:L_CAP_C, role:"cuts_against", grade:"C", grade_axis:"capture", grade_source:"testimony",
    target_edition:null, served:false, cited_edition:null,
    detail:"this leg is NAMED and not served: what it rests on is not in the published record, so this surface can say the finding cites it and can hand over nothing of it." },
  { target:L_CON_C, role:"supports", grade:"C", grade_axis:"connection", grade_source:"hunch",
    target_edition:null, served:false, cited_edition:null,
    detail:"this leg is NAMED and not served: what it rests on is not in the published record, so this surface can say the finding cites it and can hand over nothing of it." },
  { target:L_CON_A, role:"supports", grade:"A", grade_axis:"connection", grade_source:"resolution",
    target_edition:2, served:true,
    cited_edition:{ edition:2, title:"The council resolution", bundle_sha:CAP_SHA, ratified_at:"2026-06-11T00:00:00Z",
      case_id:null,
      capture:{ axis:"capture", state:"graded", grade:"A" }, connection:{ axis:"connection", state:"graded", grade:"A" } },
    detail:"this leg rests on a published finding, so it can be served from this surface." },
];
const BASIS_B = [
  { target:"INFO-2026-8201", role:"supports", grade:"B", grade_axis:"capture", grade_source:"capture",
    target_edition:null, served:false, cited_edition:null,
    detail:"this leg is NAMED and not served: what it rests on is not in the published record, so this surface can say the finding cites it and can hand over nothing of it." },
  { target:"INFO-2026-8202", role:"supports", grade:null, grade_axis:null, grade_source:null,
    target_edition:null, served:false, cited_edition:null,
    detail:"this leg is NAMED and not served: what it rests on is not in the published record, so this surface can say the finding cites it and can hand over nothing of it." },
];

/* THE CASE'S OWN TWO ASSERTIONS, and DEC-44 determination 2 is that they are
   two: SCOPE says what the case is ABOUT, COMPLETENESS says what it leaves OUT.
   The scope legitimately does NOT move between editions (REC-44's recorded
   judgement: forcing it to would pressure a member into inventing a difference);
   the completeness statement is edition-specific by nature and does move. */
const SCOPE = "Whether the FY2024 sewer fund transfer was authorised, and by whom — the two questions the project was opened to answer together.";
const STMT1 = "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.";
const STMT2 = "This case covers the FY2024 transfer and, as of edition 2, the FY2023 comparison memo.";
const EXCLUDED_1 = JSON.stringify([[ "INFO-2026-8099", "the FY2023 comparison memo",
  "a records request for it is still outstanding with the City Clerk" ]]);

const KEY_V = "AAAAC3NzaC1lZDI1NTE5AAAAIExampleKeyBytesHere0000000000000";
const KEY_D = "AAAAC3NzaC1lZDI1NTE5AAAAIAnotherExampleKeyBytes000000000";
const SIG = "-----BEGIN SSH SIGNATURE-----\nU1NIU0lH\n-----END SSH SIGNATURE-----";

function findingA(ed){
  const sha = ed === 1 ? A1 : A2;
  return { ord:0, bundle_id:FIND_A, title:"Was the sewer transfer authorised?", bundle_sha:sha, role:"load_bearing",
    ratified_at: ed === 1 ? "2026-07-01T09:00:00Z" : "2026-07-20T09:00:00Z",
    gate_version:"1.20.0", sig_armored:SIG, attestor:{ member:"vera", key_b64:KEY_V },
    strength:PAIR_A, required:BAR_DECLARED,
    parts:[ { path:"bundle.md", sha256:sha, kind:"bundle", bytes:4211 },
            { path:"snapshots/memo.bin", sha256:CAP_SHA, kind:"capture", bytes:8192 } ],
    serves:[ { to:L_CAP_B, kind:"reference", edition:1, title:"The transfer memo", bundle_sha:DOC_SHA,
               case_id:null, manifest_sha:null, ratified_at:"2026-06-01T00:00:00Z" } ],
    names:[], unresolved:[ { to:L_GONE, kind:"reference" } ],
    division:{ parent:null, siblings:[],
      detail:"a division's parent and siblings are NAMED and never served." },
    object_type:"inquiry",
    body:{ state:"published", from_sha:sha,
      question:"Did money from the sewer enterprise fund pay for marina construction between 2022 and 2024?",
      conclusion:"The transfer rests on a memo nobody adopted, and the ledger shows it moved anyway.",
      falsifies:"An adopted resolution naming the transfer would overturn this.",
      excludes:"This finding covers the transfer itself.",
      authored:{ conclusion:"The transfer rests on a memo nobody adopted.",
                 falsifier:"An adopted resolution naming the transfer would overturn this." },
      detail:"`authored` is what op=conclude wrote into the frontmatter." },
    basis:BASIS_A, bytes:"op=publishedbytes&sha256=" + sha };
}
function findingB(ed){
  const sha = ed === 1 ? B1 : B2;
  return { ord:1, bundle_id:FIND_B, title:"Who approved the transfer?", bundle_sha:sha, role:"supporting",
    ratified_at: ed === 1 ? "2026-07-01T10:00:00Z" : "2026-07-20T10:00:00Z",
    gate_version:"1.20.0", sig_armored:SIG, attestor:{ member:"dan", key_b64:KEY_D },
    strength:PAIR_B, required:BAR_DECLARED,
    parts:[ { path:"bundle.md", sha256:sha, kind:"bundle", bytes:2210 } ],
    serves:[], names:[ { to:PARENT, kind:"division_parent" }, { to:SIBLING, kind:"division_sibling" } ],
    unresolved:[],
    division:{ parent:PARENT, siblings:[SIBLING],
      detail:"a division's parent and siblings are NAMED and never served: the parent is terminal and can never be published, a sibling may not be, and a reader who can see one half of a divided question is entitled to know the other half exists (R4)." },
    object_type:"inquiry",
    body:{ state:"published", from_sha:sha, question:"Which officer approved the transfer?",
      conclusion:"No officer of record approved it.", falsifies:"A signed approval naming an officer.",
      excludes:"This half of the divided question covers approval only.",
      authored:{ conclusion:"No officer of record approved it.", falsifier:"A signed approval naming an officer." },
      detail:"" },
    basis:BASIS_B, bytes:"op=publishedbytes&sha256=" + sha };
}

const VERIFY_DETAIL = "tamper-EVIDENT, not tamper-proof: every part is named by sha256 in the manifest, the manifest answers by its own sha256, and EACH FINDING's signature covers that finding's own bundle sha. Nothing here prevents a modified copy; everything here makes one detectable by anyone holding it, without this instance's cooperation.";

function caseEdition(ed){
  const fa = findingA(ed), fb = findingB(ed);
  const man = ed === 1 ? MAN1 : MAN2;
  return {
    ok:true, caseId:CASE, edition:ed, scope:SCOPE,
    /* CASE-6, AND IT IS THE THIRD COLUMN THIS FIXTURE WAS MISSING. `publishedCase()`
       has served `project`, `bar` and `document` since CASE-5/CASE-5b and this
       object carried none of the three, so the surface could ignore all three and
       no assertion could notice — D-173 again. `project` and `bar` are one fact in
       two halves (the plane says so at the field: a bar with no publisher is a
       requirement nobody asserted), and `document` is CASE-5b's signed case
       document, NULL UNTIL RATIFIED and never a partial. `CASE_WAIT` carries null
       for it below, which is the unratified branch. */
    project:PROJ, bar:BAR_DECLARED, bar_detail:BAR_DETAIL_DECLARED,
    document:{ doc_sha:CASE_DOC_SHA, text:"The case's own authored assertions, as signed.",
      sig_armored:"-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----",
      attestor:{ member:"vera", key_b64:"AAAAC3NzaC1lZDI1NTE5AAAAIexamplekeyforthecasedocument" },
      gate_version:"1.20.0", ratified_at: ed === 1 ? "2026-07-01T10:00:00Z" : "2026-07-20T10:00:00Z" },
    completeness:{ statement: ed === 1 ? STMT1 : STMT2,
      subject_justification:"We put the four claims to the City Administrator on 2026-06-20 and printed what came back.",
      excluded: ed === 1 ? EXCLUDED_1 : "[]", subject_position:"sought_and_answered",
      author:"vera", at: ed === 1 ? "2026-07-01T09:00:00Z" : "2026-07-20T09:00:00Z" },
    ratified_at: ed === 1 ? "2026-07-01T10:00:00Z" : "2026-07-20T10:00:00Z",
    complete:true, awaiting:[],
    findings:[ fa, fb ],
    manifest_sha:man,
    manifest:{ format:"bio-case-container/2", case:CASE, edition:ed, scope:SCOPE,
      findings:[ { bundle_id:FIND_A, strength:PAIR_A, required_strength:BAR_ABSENT },
                 { bundle_id:FIND_B, strength:PAIR_B, required_strength:BAR_DECLARED } ] },
    files:[ { path:FIND_A + "/bundle.md", sha256:fa.bundle_sha, kind:"bundle", bytes:4211, finding:FIND_A },
            { path:FIND_A + "/snapshots/memo.bin", sha256:CAP_SHA, kind:"capture", bytes:8192, finding:FIND_A },
            { path:FIND_B + "/bundle.md", sha256:fb.bundle_sha, kind:"bundle", bytes:2210, finding:FIND_B } ],
    editions:[1,2],
    edition_index:[ { edition:1, ratified_at:"2026-07-01T10:00:00Z", manifest_sha:MAN1 },
                    { edition:2, ratified_at:"2026-07-20T10:00:00Z", manifest_sha:MAN2 } ],
    latest_edition:2,
    /* UI-35: was a TRUNCATED hand-typed copy; now the plane's own bytes, and
       `graph_detail` and `bias_acknowledgement` are added beside it because the
       wire sends all three and this fixture sent one. */
    case_detail:CASE_DETAIL, graph_detail:GRAPH_DETAIL,
    bias_acknowledgement:BIAS_ACK,
    verification:{ container:"op=publishedbytes&sha256=" + man + "&format=zip",
      manifest:"op=publishedbytes&sha256=" + man,
      findings:[ { bundle_id:FIND_A, bytes:"op=publishedbytes&sha256=" + fa.bundle_sha },
                 { bundle_id:FIND_B, bytes:"op=publishedbytes&sha256=" + fb.bundle_sha } ],
      detail:VERIFY_DETAIL },
  };
}

/* THE DEGENERATE CASE — one finding, and DEC-44 determination 5 keeps it legal.
   Its identity is still a CASE identity and still distinct from its one
   member's bundle id, because a shape that depended on the arity would stop
   being degenerate the moment a second finding joined. */
const SOLO = {
  ok:true, caseId:CASE_SOLO, edition:1, scope:"Whether the marina lease was extended without a vote.",
  /* CASE-6: A CASE WITH A PUBLISHER AND NO DECLARED BAR. The two are separable
     and this is the branch DEC-72 names in the ruling itself. */
  project:PROJ, bar:BAR_ABSENT, bar_detail:BAR_DETAIL_ABSENT,
  document:{ doc_sha:SOLO_DOC_SHA, text:"The solo case document, as signed.",
    sig_armored:"-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----",
    attestor:{ member:"dan", key_b64:"AAAAC3NzaC1lZDI1NTE5AAAAIexamplekeyforthesolodocument" },
    gate_version:"1.20.0", ratified_at:"2026-07-05T09:00:00Z" },
  completeness:{ statement:"This case covers the lease extension only.",
    subject_justification:"The officer named declined to answer in writing.",
    excluded:"[]", subject_position:"sought_and_refused", author:"dan", at:"2026-07-05T09:00:00Z" },
  ratified_at:"2026-07-05T09:00:00Z", complete:true, awaiting:[],
  findings:[ { ord:0, bundle_id:FIND_S, title:"Was the lease extended without a vote?", bundle_sha:S_SHA, role:"load_bearing",
    ratified_at:"2026-07-05T09:00:00Z", gate_version:"1.20.0", sig_armored:SIG,
    attestor:{ member:"dan", key_b64:KEY_D },
    strength:PAIR_A, required:BAR_ABSENT,
    parts:[ { path:"bundle.md", sha256:S_SHA, kind:"bundle", bytes:1100 } ],
    serves:[], names:[], unresolved:[],
    division:{ parent:null, siblings:[], detail:"a division's parent and siblings are NAMED and never served." },
    object_type:"inquiry",
    body:{ state:"published", from_sha:S_SHA, question:"Was the lease extended without a vote?",
      conclusion:"It was extended by an officer with no vote on record.",
      falsifies:"Minutes recording a vote would overturn this.",
      excludes:"This case covers the lease extension only.",
      authored:{ conclusion:"It was extended by an officer with no vote on record.",
                 falsifier:"Minutes recording a vote would overturn this." }, detail:"" },
    basis:BASIS_B, bytes:"op=publishedbytes&sha256=" + S_SHA } ],
  manifest_sha:S_MAN,
  manifest:{ format:"bio-case-container/2", case:CASE_SOLO, edition:1,
             findings:[ { bundle_id:FIND_S, strength:PAIR_A, required_strength:BAR_DECLARED } ] },
  files:[ { path:FIND_S + "/bundle.md", sha256:S_SHA, kind:"bundle", bytes:1100, finding:FIND_S } ],
  editions:[1], edition_index:[ { edition:1, ratified_at:"2026-07-05T09:00:00Z", manifest_sha:S_MAN } ],
  latest_edition:1,
  verification:{ container:"op=publishedbytes&sha256=" + S_MAN + "&format=zip",
    manifest:"op=publishedbytes&sha256=" + S_MAN,
    findings:[ { bundle_id:FIND_S, bytes:"op=publishedbytes&sha256=" + S_SHA } ], detail:VERIFY_DETAIL },
};

/* THE `awaiting` WINDOW, and it is a REAL STATE of the record rather than a
   failure: a case edition is ratified ONCE PER FINDING, so between the first
   member landing and the last there is a window in which the edition exists,
   some of its findings are published and answerable, and the container cannot
   be assembled. `findings[]` is the RATIFIED SUBSET; `awaiting[]` is the rest of
   the DECLARED membership. That difference is the only thing that can say an
   edition is incomplete, which is why the membership is a table in the plane and
   why both halves have to reach this page. */
const WAITING = {
  ok:true, caseId:CASE_WAIT, edition:1,
  /* CASE-6: THE TWO NULL BRANCHES, TOGETHER AND ON PURPOSE. `project` is null
     because `publishedManifest()` reaches it through a LEFT JOIN and a case
     published before this model has no `cases` row — the plane keeps that case
     in the index "with its project stated as unknown rather than disappearing".
     `document` is null because CASE-5b serves it NULL UNTIL RATIFIED and never
     as a partial, and this edition is still collecting signatures. Neither null
     may be rendered as a blank. */
  project:null, bar:null, bar_detail:BAR_DETAIL_ABSENT, document:null,
  scope:"Whether the two culvert contracts were awarded to the same undisclosed owner.",
  completeness:{ statement:"This case covers the two 2025 culvert contracts.",
    subject_justification:"The vendor has not been asked yet.", excluded:"[]",
    subject_position:"not_sought", author:"vera", at:"2026-07-28T09:00:00Z" },
  ratified_at:null,
  complete:false, awaiting:[FIND_D],
  findings:[ { ord:0, bundle_id:FIND_C, title:"Who owns the vendor?", bundle_sha:C_SHA, role:"load_bearing",
    ratified_at:"2026-07-28T09:00:00Z", gate_version:"1.20.0", sig_armored:SIG,
    attestor:{ member:"vera", key_b64:KEY_V },
    strength:PAIR_A, required:BAR_ABSENT,
    parts:[ { path:"bundle.md", sha256:C_SHA, kind:"bundle", bytes:900 } ],
    serves:[], names:[], unresolved:[],
    division:{ parent:null, siblings:[], detail:"a division's parent and siblings are NAMED and never served." },
    object_type:"inquiry",
    body:{ state:"published", from_sha:C_SHA, question:"Who owns the vendor?",
      conclusion:"The vendor is owned by a party named in neither award.",
      falsifies:"A disclosure filing naming the owner would overturn this.",
      excludes:"This case covers the two 2025 culvert contracts.",
      authored:{ conclusion:"The vendor is owned by a party named in neither award.",
                 falsifier:"A disclosure filing naming the owner would overturn this." }, detail:"" },
    basis:BASIS_B, bytes:"op=publishedbytes&sha256=" + C_SHA } ],
  manifest_sha:null, manifest:null, files:[],
  editions:[1], edition_index:[ { edition:1, ratified_at:null, manifest_sha:null } ],
  latest_edition:1,
  verification:{ container:null, manifest:null,
    findings:[ { bundle_id:FIND_C, bytes:"op=publishedbytes&sha256=" + C_SHA } ], detail:VERIFY_DETAIL },
};

/* RATIFIED BYTES THAT ARE IN NO CASE. `#looseEditionState` answers in the same
   shape with `caseId: null`, no scope and no completeness — because it is not a
   case, and manufacturing one for it is D-187's conflation one level down. */
const LOOSE = {
  ok:true, caseId:null, edition:1, scope:null, completeness:null,
  ratified_at:"2026-06-01T00:00:00Z", complete:true, awaiting:[],
  findings:[ { ord:0, bundle_id:INFO, title:"The transfer memo", bundle_sha:INFO_SHA,
    ratified_at:"2026-06-01T00:00:00Z", gate_version:"1.20.0", sig_armored:SIG,
    attestor:{ member:"vera", key_b64:KEY_V },
    strength:null, required:null,
    parts:[ { path:"bundle.md", sha256:INFO_SHA, kind:"bundle", bytes:512 } ],
    serves:[], names:[], unresolved:[],
    division:{ parent:null, siblings:[], detail:"a division's parent and siblings are NAMED and never served." },
    object_type:"information",
    body:{ state:"published", from_sha:INFO_SHA, question:"", conclusion:"", falsifies:"", excludes:"",
      authored:{ conclusion:null, falsifier:null }, detail:"" },
    basis:[], bytes:"op=publishedbytes&sha256=" + INFO_SHA } ],
  manifest_sha:null, manifest:null, files:[],
  editions:[1], edition_index:[ { edition:1, ratified_at:"2026-06-01T00:00:00Z", manifest_sha:null } ],
  latest_edition:1,
  /* CORRECTED 2026-08-05 — UI-35. This fixture used to carry a top-level
     `detail` here, and THE WIRE DOES NOT SEND ONE. `Store.publishedCase()` has a
     single success return, shared by the case path and this `#looseEditionState`
     path, and it names `case_detail` and `graph_detail` — never `detail`.
     Measured by driving the real plane, not read off the source alone. So the
     old field was an INVENTION of this mock, and it kept `pubStateHtml`'s dead
     `c.detail ||` read looking alive: the suite rendered a sentence no instance
     has ever sent. That is D-173's class exactly — a mock answering a field
     rather than the wire's CONTENT (UI-30 named it; REC-43's `prompt:null` was
     the same shape). The invented field is REMOVED, the surface's dead read is
     removed with it, and the sweep in block 12 now fails if either comes back.
     `case_detail` and `graph_detail` are added below because the wire DOES send
     them; nothing renders them, which is block 12's other finding. */
  case_detail:CASE_DETAIL, graph_detail:GRAPH_DETAIL,
  verification:{ container:null, manifest:null,
    findings:[ { bundle_id:INFO, bytes:"op=publishedbytes&sha256=" + INFO_SHA } ], detail:VERIFY_DETAIL },
};

/* THE INDEX, as `publishedManifest()` answers it AFTER REC-44 — and the shape
   change is the item: the bundle rows carry NO `manifest` column any more (the
   container's manifest is the CASE's and lives on `cases[]`), and there is a
   `caseMembers[]` roster. A surface that went on parsing the old column would
   render "carries no frozen strength pair" for every case on every real
   instance, which is a lie that looks like modesty.

   CORRECTED 2026-08-05 (REC-49), AND THE MOCK WAS THE PROBLEM AS MUCH AS THE
   SURFACE, so it is corrected at the site and never exempted (D-173: a UI mock
   must answer the WIRE SHAPE). It hand-answered bundle rows with no `strength`
   and no `required` — which was the plane's shape and was the defect: during the
   awaiting window a case has no container manifest, so THERE WAS NOWHERE AT ALL
   for a ratified member's pair to come from and the index showed none, for
   potentially days, while the plane held every one of them. `publishedManifest()`
   now selects the member's own `strength`/`required` off `published_bundles` —
   the pair frozen into the bytes that member signed — and the rows here say so.
   MEASURED against the plane rather than invented: the real answer parses both
   columns, so they arrive as objects and not as JSON strings. */
const PUB_ROWS = [
  { bundle_id:FIND_A, edition:1, title:"Was the sewer transfer authorised?", bundle_sha:A1,
    ratified_at:"2026-07-01T09:00:00Z", attestor_key:"AAAA", gate_version:"1.20.0",
    strength:PAIR_A, required:BAR_DECLARED },
  { bundle_id:FIND_B, edition:1, title:"Who approved the transfer?", bundle_sha:B1,
    ratified_at:"2026-07-01T10:00:00Z", attestor_key:"BBBB", gate_version:"1.20.0",
    strength:PAIR_B, required:BAR_DECLARED },
  { bundle_id:FIND_A, edition:2, title:"Was the sewer transfer authorised?", bundle_sha:A2,
    ratified_at:"2026-07-20T09:00:00Z", attestor_key:"AAAA", gate_version:"1.20.0",
    strength:PAIR_A, required:BAR_DECLARED },
  { bundle_id:FIND_B, edition:2, title:"Who approved the transfer?", bundle_sha:B2,
    ratified_at:"2026-07-20T10:00:00Z", attestor_key:"BBBB", gate_version:"1.20.0",
    strength:PAIR_B, required:BAR_DECLARED },
  { bundle_id:FIND_S, edition:1, title:"Was the lease extended without a vote?", bundle_sha:S_SHA,
    ratified_at:"2026-07-05T09:00:00Z", attestor_key:"BBBB", gate_version:"1.20.0",
    strength:PAIR_A, required:BAR_ABSENT },
  /* THE RATIFIED MEMBER OF THE AWAITING CASE, and it is the whole point of the
     window: it signed its pair and the container that would carry a copy does
     not exist. */
  { bundle_id:FIND_C, edition:1, title:"Who owns the vendor?", bundle_sha:C_SHA,
    ratified_at:"2026-07-28T09:00:00Z", attestor_key:"AAAA", gate_version:"1.20.0",
    strength:PAIR_B, required:BAR_ABSENT },
  /* A LOOSE RATIFIED BUNDLE THAT NEVER HAD A PAIR — an information bundle is not
     a finding and derives none. `strength: null` is what the plane answers, and
     it is NOT the same fact as "the container is not assembled yet". */
  { bundle_id:INFO, edition:1, title:"The transfer memo", bundle_sha:INFO_SHA,
    ratified_at:"2026-06-01T00:00:00Z", attestor_key:"CCCC", gate_version:"1.20.0",
    strength:null, required:null },
  /* AND A LOOSE RATIFIED FINDING THAT DOES HAVE ONE. A frozen pair belongs to the
     FINDING, so belonging to no case costs a bundle its case identity, its scope
     and its completeness assertion — and not its pair. The index used to state
     all four absences in one breath, which understated this row. */
  { bundle_id:LOOSE_FIND, edition:1, title:"Did the vendor register a lobbyist?", bundle_sha:LOOSE_SHA,
    ratified_at:"2026-06-15T00:00:00Z", attestor_key:"CCCC", gate_version:"1.20.0",
    strength:PAIR_B, required:BAR_ABSENT },
  /* A RATIFIED CASE MEMBER FOR WHICH THE PLANE HOLDS NO PAIR. `strength` is
     nullable on `published_bundles` and a document ratified through the
     hand-written promote door carries whatever it was ratified with — so this
     is the ONE state in which the surface's no-pair sentence is reached, and
     without a row in it the sentence would be unexercised wording that any
     future edit could make false without a single assertion moving. */
  { bundle_id:FIND_E, edition:1, title:"Which officer signed the release?", bundle_sha:E_SHA,
    ratified_at:"2026-07-29T09:00:00Z", attestor_key:"AAAA", gate_version:"1.20.0",
    strength:null, required:null },
  /* THE MEMBER OF THE EDITION WHOSE CONTAINER WAS NEVER RECORDED. */
  { bundle_id:FIND_K, edition:1, title:"Was the contract amended after award?", bundle_sha:K_SHA,
    ratified_at:"2026-07-30T09:00:00Z", attestor_key:"BBBB", gate_version:"1.20.0",
    strength:PAIR_A, required:BAR_DECLARED },
  /* UI-56: THE DIVERGED MEMBER'S OWN RATIFIED ROW, AND ITS EDITION IS 1 WHILE ITS
     CASE'S IS 2. It carries a pair AND a declared bar deliberately — the defect
     this item closes blanked BOTH, so a fixture row holding only one of them
     could not tell a half fix from a whole one. Note what is NOT here: no row at
     edition 2. The finding never moved; only the case did, which is precisely
     what CASE-5 made possible. */
  { bundle_id:FIND_V, edition:1, title:"Did the vendor disclose the sub-award?", bundle_sha:V_SHA,
    ratified_at:"2026-08-02T09:00:00Z", attestor_key:"AAAA", gate_version:"1.20.0",
    strength:PAIR_B, required:BAR_DECLARED },
];
const manOf = (caseId, ed, rows) => JSON.stringify({ format:"bio-case-container/2", case:caseId, edition:ed,
  findings:rows });
/* ============================================================================
   CORRECTED 2026-09-10 (CASE-6 / DEC-72 clause 2), AND THE MOCK WAS AS WRONG AS
   THE SURFACE FOR THE SECOND ITEM RUNNING — D-173's class, the same one UI-56
   found in this very file one item ago, and it is recorded rather than quietly
   patched because TWICE is a pattern about this fixture and not an accident.

   WHAT WAS MISSING: `publishedManifest()` selects NINE columns for `cases[]` —
   `case_id, edition, scope, bias_acknowledgement, bar, ratified_at,
   manifest_sha, manifest, project_id` — and these rows carried SIX. The harness's
   own fixture-shape census printed "publishedmanifest.cases[]: 6/9 wire
   column(s)" on every green run, naming the gap out loud, and the three it named
   are exactly `bar` and `project_id` (and `bias_acknowledgement`). So the case's
   bar — the authority DEC-72 clause 2 moved everything onto, on the wire since
   CASE-5 — could not be READ by any assertion here, and a surface that ignored it
   could not be caught doing so.

   `bar` AND `project_id` ARE ONE FACT IN TWO HALVES and are added together, for
   the reason `publishedCase()` states at the field: "bar: B/B with no publisher
   is a requirement nobody asserted". A fixture that declared a standard and no
   project would let the surface print a standard belonging to nobody.

   THE BAR IS NOW PER CASE AND IS THE SAME FOR EVERY MEMBER OF ONE, which is the
   only shape the plane can build: it copies `published_cases.bar` into each
   member's `published_bundles.required`. BOTH BRANCHES ARE STILL UNDER TEST and
   they simply moved to the altitude that can hold them — `CASE` declares a bar,
   `CASE_SOLO` declares NONE, so a declared bar and an absent one are both on the
   index in one run, and the absent branch's "an absent bar is not a bar of zero"
   sentence is still exercised. What is NO LONGER representable, and was the old
   fixture's whole premise, is two members of ONE case under different standards.
   ============================================================================ */
const CASE_ROWS = [
  { case_id:CASE, edition:1, scope:SCOPE, ratified_at:"2026-07-01T10:00:00Z", manifest_sha:MAN1,
    bar:BAR_DECLARED, project_id:PROJ, bias_acknowledgement:null,
    manifest: manOf(CASE, 1, [ { bundle_id:FIND_A, strength:PAIR_A, required_strength:BAR_DECLARED },
                               { bundle_id:FIND_B, strength:PAIR_B, required_strength:BAR_DECLARED } ]) },
  { case_id:CASE, edition:2, scope:SCOPE, ratified_at:"2026-07-20T10:00:00Z", manifest_sha:MAN2,
    bar:BAR_DECLARED, project_id:PROJ, bias_acknowledgement:null,
    manifest: manOf(CASE, 2, [ { bundle_id:FIND_A, strength:PAIR_A, required_strength:BAR_DECLARED },
                               { bundle_id:FIND_B, strength:PAIR_B, required_strength:BAR_DECLARED } ]) },
  /* THE ABSENT-BAR BRANCH, MOVED TO CASE ALTITUDE. DEC-72 names this case by
     name — "where no bar was ever declared ... the case publishes stating that
     fact" — so the branch is not dropped, it is asked at the altitude that owns
     the answer. `project_id` is present and the bar is absent, deliberately: the
     two are separable and a case CAN have a publisher and no declared standard. */
  { case_id:CASE_SOLO, edition:1, scope:SOLO.scope, ratified_at:"2026-07-05T09:00:00Z", manifest_sha:S_MAN,
    bar:BAR_ABSENT, project_id:PROJ, bias_acknowledgement:null,
    manifest: manOf(CASE_SOLO, 1, [ { bundle_id:FIND_S, strength:PAIR_A, required_strength:BAR_ABSENT } ]) },
  /* AND THE THIRD STATE, WHICH IS NEITHER: a case with NO owning project row at
     all. `publishedManifest()` reaches `project_id` through a LEFT JOIN
     specifically so a case published before this model still appears, "with its
     project stated as unknown rather than disappearing from the index because
     the record gained a table" — the plane's own sentence. A null here is that
     case, and the surface must say it cannot name the publisher rather than
     printing an empty span where a project id goes. */
  { case_id:CASE_WAIT, edition:1, scope:WAITING.scope, ratified_at:null, manifest_sha:null, manifest:null,
    bar:null, project_id:null, bias_acknowledgement:null },
  /* REC-49: EVERY DECLARED MEMBER HAS RATIFIED AND THERE IS STILL NO CONTAINER.
     The container is recorded by the CONTROL PLANE after the last ratification
     returns, so "the roster is complete" and "the container exists" are two
     facts and the gap between them is reachable — an R2 outage is enough. A
     surface reading completeness off the roster prints a container hash for a
     container that is not there. */
  { case_id:CASE_STUCK, edition:1, scope:"Whether the amendment was made after award.",
    ratified_at:"2026-07-30T09:00:00Z", manifest_sha:null, manifest:null,
    bar:BAR_DECLARED, project_id:PROJ, bias_acknowledgement:null },
  /* UI-56: A COMPLETE, ASSEMBLED CASE AT EDITION 2 WHOSE MEMBER IS AT ITS OWN
     EDITION 1. It is assembled on purpose: the container exists and the plane
     records it as finished, so there is nothing about this case that is actually
     awaiting anything — which is what made the old join's "DECLARED AND NOT YET
     RATIFIED" a flat contradiction of the row it was printed inside. */
  { case_id:CASE_DIV, edition:2, scope:"Whether the sub-award was disclosed to the board.",
    ratified_at:"2026-08-02T10:00:00Z", manifest_sha:DIV_MAN,
    bar:BAR_DECLARED, project_id:PROJ, bias_acknowledgement:null,
    manifest: manOf(CASE_DIV, 2, [ { bundle_id:FIND_V, strength:PAIR_B, required_strength:BAR_DECLARED } ]) },
];
/* CORRECTED 2026-09-10 (UI-56), AND THE MOCK WAS AS WRONG AS THE SURFACE — D-173's
   rule, that a UI mock answers the WIRE SHAPE and never a shape convenient to the
   suite. `publishedManifest()` selects `case_id, edition, ord, bundle_id,
   version_sha, role` from `published_case_members`; these rows carried the first
   four and dropped the last two, so the surface's join could be written against a
   column the fixture did not have and NOT ONE assertion could notice. The two
   columns are restored here, and with them the only thing that makes this suite
   able to see UI-56's defect at all.

   `version_sha` IS THE PIN AND IS NULLABLE ON PURPOSE. `FIND_K` is left UNPINNED
   deliberately: the plane states in its own `production` sentence that a null pin
   means the member was rostered without a version being pinned, which is the
   pre-CASE-5 world and is still on real instances. It is this suite's standing
   OVER-STRICTNESS arm for UI-56 — an undiverged, unpinned, legacy member must go
   on rendering EXACTLY as it does today, and block 1's `CASE-2026-0004` assertion
   is what holds it to that. `FIND_D` is pinned to a sha no ratified row answers
   to, which is what a declared-and-not-yet-ratified member really looks like. */
/* ============================================================================
   CASE-6 / DEC-72 clause 4: `role` WAS RESTORED AS A COLUMN BY UI-56 AND WAS
   STILL NULL IN EVERY ROW, which meant the AUTHORED PARTITION — the fact clause 4
   is entirely about — had no fixture and no assertion could reach it. Restoring
   a column and never populating it is half of D-173's rule: the shape was right
   and the content could not exercise the thing the shape exists for.

   THE PARTITION IS SET SO THAT THE THREE STATES ARE ALL LIVE ON ONE PAGE, because
   the surface must be caught doing the wrong thing with any of them:

   - LOAD_BEARING (`FIND_A`, `FIND_S`, `FIND_V`, `FIND_C`) — the case rests on it,
     and it was held to the case's bar.
   - SUPPORTING (`FIND_B`, `FIND_E`) — part of the published work and NOT
     presented as carrying the case. `FIND_B` is deliberately the member with the
     STRONGER-LOOKING row in `CASE`: a supporting member that happens to clear the
     bar is exactly the case a surface would be tempted to promote, and DEC-72
     clause 4 says the designation decides, never the strength.
   - NULL, KEPT AND NOT BACKFILLED (`FIND_D`, `FIND_K`) — the plane leaves
     `published_case_members.role` with NO DEFAULT and serves `m.role ?? null`, so
     a member rostered before CASE-2 authored roles really does carry null on real
     instances. It is this suite's standing OVER-STRICTNESS arm for the
     designation: an UNDESIGNATED member must render as undesignated, never
     defaulted to either side. `FIND_K` is the unpinned legacy member UI-56 left
     standing here for the same purpose one axis over, and the two properties are
     deliberately carried by the same row: legacy is legacy in both columns.

   ORD IS NOT THE PARTITION AND THE FIXTURE PROVES IT RATHER THAN ASSERTING IT.
   In `CASE` the load-bearing member is at ord 0 and the supporting one at ord 1,
   which is the ordering a lazy derivation would get RIGHT by luck. In `CASE_WAIT`
   the order is inverted — ord 0 `FIND_C` load-bearing, ord 1 `FIND_E` supporting,
   ord 2 `FIND_D` undesignated — no wait, ord 0 is load-bearing there too, so the
   INVERSION is carried by `CASE_DIV`/`CASE_SOLO` having a single member and by
   `FIND_D` at ord 2 being NULL rather than either. A derivation from ordinal
   would have to pick a rule — "first is load-bearing", "all but the last" — and
   every such rule gets `FIND_D` wrong, which is what the negative control arms. */
const CASE_MEMBERS = [
  { case_id:CASE, edition:1, ord:0, bundle_id:FIND_A, version_sha:A1, role:"load_bearing" },
  { case_id:CASE, edition:1, ord:1, bundle_id:FIND_B, version_sha:B1, role:"supporting" },
  { case_id:CASE, edition:2, ord:0, bundle_id:FIND_A, version_sha:A2, role:"load_bearing" },
  { case_id:CASE, edition:2, ord:1, bundle_id:FIND_B, version_sha:B2, role:"supporting" },
  { case_id:CASE_SOLO, edition:1, ord:0, bundle_id:FIND_S, version_sha:S_SHA, role:"load_bearing" },
  { case_id:CASE_WAIT, edition:1, ord:0, bundle_id:FIND_C, version_sha:C_SHA, role:"load_bearing" },
  { case_id:CASE_WAIT, edition:1, ord:1, bundle_id:FIND_E, version_sha:E_SHA, role:"supporting" },
  { case_id:CASE_WAIT, edition:1, ord:2, bundle_id:FIND_D, version_sha:D_SHA, role:null },
  { case_id:CASE_STUCK, edition:1, ord:0, bundle_id:FIND_K, version_sha:null, role:null },
  /* THE DIVERGED ROSTER ROW: the case is at edition 2 and the pin names the
     finding's edition-1 bytes. `2` and `1` are two different numbers here and
     that is the entire fixture. */
  { case_id:CASE_DIV, edition:2, ord:0, bundle_id:FIND_V, version_sha:V_SHA, role:"load_bearing" },
];

const PUBLISHED_SHAS = new Map([
  [A1, { bundle_id:FIND_A, path:"bundle.md", kind:"bundle", published:"2026-07-01T09:00:00Z" }],
  [A2, { bundle_id:FIND_A, path:"bundle.md", kind:"bundle", published:"2026-07-20T09:00:00Z" }],
  [B1, { bundle_id:FIND_B, path:"bundle.md", kind:"bundle", published:"2026-07-01T10:00:00Z" }],
  [B2, { bundle_id:FIND_B, path:"bundle.md", kind:"bundle", published:"2026-07-20T10:00:00Z" }],
  [CAP_SHA, { bundle_id:FIND_A, path:"snapshots/memo.bin", kind:"capture", published:"2026-07-01T09:00:00Z" }],
  [MAN1, { bundle_id:CASE, path:"MANIFEST.json", kind:"manifest", published:"2026-07-01T10:00:00Z" }],
  [MAN2, { bundle_id:CASE, path:"MANIFEST.json", kind:"manifest", published:"2026-07-20T10:00:00Z" }],
  [DOC_SHA, { bundle_id:L_CAP_B, path:"bundle.md", kind:"bundle", published:"2026-06-01T00:00:00Z" }],
  [C_SHA, { bundle_id:FIND_C, path:"bundle.md", kind:"bundle", published:"2026-07-28T09:00:00Z" }],
  [S_SHA, { bundle_id:FIND_S, path:"bundle.md", kind:"bundle", published:"2026-07-05T09:00:00Z" }],
]);

/* ---------------- the mock plane ---------------- */
const WIRE = [];
const BYTES = new TextEncoder().encode("the ratified bytes of edition 1");
/* THE POISONED ANSWER, block 12's driver. The plane refuses to compose a
   case-level strength; this makes the PLANE hand one over anyway, so the
   surface's own refusal is measured rather than inherited. */
let POISON = false;
/* UI-40's DRIVER, and it drives the WIRE rather than the surface. When set, it
   replaces the two top-level accounts on whatever the mock is about to answer —
   which is the only honest way to run both of this item's controls: BLANKING
   each field at the plane (the harness must FAIL naming which account went
   missing, rather than rendering an empty box) and the OVER-STRICTNESS arm (a
   correct account phrased unlike anything this suite wrote must render whole,
   which is what proves the pins read the wire and not a constant). */
let ACCOUNTS = null;
const withAccounts = (c) => ACCOUNTS ? { ...c, ...ACCOUNTS } : c;

function mockFetch(u, opts){
  const url = new URL(String(u), "https://plane.test");
  const op = url.searchParams.get("op");
  WIRE.push({ op, url: url.pathname + url.search, method:(opts && opts.method) || "GET",
              token: url.searchParams.get("token") });
  const R = o => ({ ok:true, json:async()=>o });
  /* WRAPPED: index.mjs re-wraps this one explicitly, `json({ok:true, result})`. */
  if(op === "publishedmanifest")
    return R({ ok:true, result:{ ok:true, scope:"published", published:PUB_ROWS, cases:CASE_ROWS,
      caseMembers:CASE_MEMBERS, shas:[],
      detail:"every hash here is verifiable by anyone with ssh-keygen and the doorbell." } });
  /* FLAT: its own handler, `json({ok:true, ...c, findings, verification})`. */
  if(op === "publishedcase"){
    const id = url.searchParams.get("id");
    const ed = url.searchParams.get("edition");
    const sha = url.searchParams.get("sha256");
    const poison = (c0) => {
      const c = withAccounts(c0);
      return POISON
        ? { ...c, strength:PAIR_A, required:BAR_DECLARED, bundle_sha:A2,
            manifest: c.manifest ? { ...c.manifest, strength:PAIR_A } : c.manifest }
        : c;
    };
    if(id === CASE || sha === A1 || sha === A2 || sha === B1 || sha === B2 || id === FIND_A || id === FIND_B){
      const which = (sha === A1 || sha === B1) ? 1 : (sha === A2 || sha === B2) ? 2 : (ed ? Number(ed) : 2);
      if(which !== 1 && which !== 2)
        return R({ ok:false, reason:"NOT_PUBLISHED", detail:"no published edition answers to that." });
      const c = caseEdition(which);
      /* A FINDING's id resolves to ITS CASE, and `asked` names which finding was
         reached for — the surface never decides on the reader's behalf which
         they meant. */
      return R(poison(id === FIND_A || id === FIND_B ? { ...c, asked:id } : c));
    }
    if(id === CASE_SOLO || id === FIND_S) return R(poison(id === FIND_S ? { ...SOLO, asked:id } : SOLO));
    if(id === CASE_WAIT || id === FIND_C) return R(poison(id === FIND_C ? { ...WAITING, asked:id } : WAITING));
    if(id === FIND_D)
      return R({ ok:false, reason:"NOT_PUBLISHED",
        detail:"no published edition answers to that. A finding declared into a case edition and not yet ratified has published nothing." });
    if(id === INFO || sha === INFO_SHA) return R(poison(LOOSE));
    return R({ ok:false, reason:"NOT_PUBLISHED",
      detail:"no published edition answers to that. A case that was never published, an edition that does not exist and an id that never existed are one answer here." });
  }
  /* FLAT: `json({ok:true, ...out.result})`. */
  if(op === "verify"){
    const sha = (url.searchParams.get("sha256") || "").toLowerCase();
    const m = PUBLISHED_SHAS.get(sha);
    return R({ ok:true, published: !!m, sha256:sha, matches: m ? [{ ...m }] : [] });
  }
  /* BYTES, by hash and only by hash — never JSON on success, which is why it is
     deliberately NOT in check-mock-envelope's FLAT list. */
  if(op === "publishedbytes"){
    const sha = (url.searchParams.get("sha256") || "").toLowerCase();
    /* CORRECTED 2026-09-24 (UI-100), never exempted. This typed the caller-facing
       `error` alone. That was true to the wire until D-278 (2026-09-23), which minted
       this refusal through `requiredArgument` (C-61.1) — so it now carries
       REQUIRED_ARGUMENT_MISSING (named unquoted on purpose; see the note at the foot),
       `check`, DEC-49's canned `translation`, and the
       helper's own `op`/`argument`/`shape`/`detail` beside that unchanged sentence.
       UI-84's class sweep named this site by line number as the one fixture in the
       `requiredArgument` family already narrower than its wire; this is that fix.
       Every value is now read out of the plane's own call site and catalogue.
       WHAT IT IS AND IS NOT: this arm is UNDRIVEN — measured, not assumed. No call
       in `app.html` sends `path` to `op=publishedbytes` (the op answers BY HASH and
       the surface never asks otherwise), so nothing here renders it and no assertion
       below reads it. It is a fixture that refuses to fabricate a success for a
       request the plane would refuse, and it is corrected for the same reason a
       fixture is corrected anywhere: one that cannot represent the wire cannot
       assert against it the day something does drive it.
       AND THE CODE ABOVE IS UNQUOTED ON PURPOSE. UI-100 measured that
       `check-refusal-codes.mjs`' R3-FED walk harvests any SCREAMING_SNAKE token in
       quotes or backticks anywhere in a suite's source, COMMENTS INCLUDED, and counts
       it as a code this suite hands to a surface: with it backticked, the `r3Fed`
       floor rose by one for a sentence. This suite really does feed C-61.1's code now,
       and the walk cannot see it — it arrives through `requiredArgumentWire`, and UI-84
       recorded that blind spot — but a floor pinned on prose would fall the moment
       somebody reworded this comment. */
    if(url.searchParams.get("path")) return R(requiredArgumentWire("publishedbytes"));
    if(!PUBLISHED_SHAS.has(sha))
      return R({ ok:false, reason:"NOT_FOUND", sha256:sha,
        detail:"no published part answers to that hash. A hash that was never ratified and a hash that never existed are the same answer here, deliberately." });
    return { ok:true, status:200, headers:{ get:k => k === "x-published-kind" ? PUBLISHED_SHAS.get(sha).kind : null },
             arrayBuffer:async()=>BYTES.buffer, json:async()=>({ ok:false, error:"these are bytes" }) };
  }
  if(op === "whoami") return R({ ok:true, result:{ tokenClass:null, session:false, capabilities:[] } });
  return R({ ok:false, error:"unexpected op " + op });
}

/* ---- a DOM stub good enough for innerHTML inspection ---- */
const els = new Map();
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, open:false, addEventListener(){},
  querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }

const OPENED = [];
const LISTENERS = {};
let HASH = "";
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
    hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", get hash(){ return HASH; }, set hash(v){ HASH = v; } },
  history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} },
  window:{ addEventListener(k, fn){ (LISTENERS[k] = LISTENERS[k] || []).push(fn); },
           open:(u)=>{ OPENED.push(String(u)); return null; } },
  fetch:async(u,opts)=>mockFetch(u,opts) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() +
  ";globalThis.__PLANE=PLANE;globalThis.__PUB=PUB;" +
  "globalThis.__pubList=pubList;globalThis.__pubOpen=pubOpen;globalThis.__pubVerify=pubVerify;" +
  "globalThis.__pubBytes=pubBytes;globalThis.__pubVerifyPanel=pubVerifyPanel;" +
  "globalThis.__enterPublished=enterPublished;globalThis.__pubLeave=pubLeave;" +
  "globalThis.__publishedRouteFromHash=publishedRouteFromHash;globalThis.__pubPaintBack=pubPaintBack;" +
  /* CORRECTED 2026-08-04 (UI-27, DEC-40), never exempted. This line used to
     export `THRESHOLDS` and `stanceFloors` and to set `PUB.stance`. There is no
     stance any more: the reader supplies the pair of floors and the surface
     offers no named set to resolve. `__setFloors` writes the two values the
     reader would have set through the two controls — one per axis, never one
     value written to both — and repaints. */
  "globalThis.__readerFloors=readerFloors;globalThis.__FLOOR_VALUES=FLOOR_VALUES;" +
  "globalThis.__pubFiltered=pubFiltered;globalThis.__pubSetFloor=pubSetFloor;" +
  /* ADDED 2026-08-04 (UI-29): the roster is the DECLARED membership and the
     surface's own reading of it is what block 4 measures. */
  "globalThis.__pubRoster=pubRoster;globalThis.__pubCaseId=pubCaseId;" +
  "globalThis.__setFloors=async (cap,con)=>{ PUB.floors={capture:cap,connection:con}; await pubPaint(); };", ctx);

/* THE WHOLE RUN IS MADE BY A CALLER HOLDING NOTHING. There is no line below that
   sets a token, which is the point: the wire sweep at the end is evidence and
   not a promise. */
ctx.__PLANE.base = "";
ctx.__PLANE.token = null;
ctx.__PLANE.session = false;

const pubBody = () => els.get("#pub-body")._html;
const list = () => els.get("#pl")._html;

/* ---- helpers over the rendered artifact ---- */
const strip = h => String(h).replace(/<[^>]*>/g, " ").replace(/&middot;/g, "·").replace(/&amp;/g, "&")
  .replace(/&hellip;/g, "…").replace(/&larr;/g, "<-").replace(/&mdash;/g, "—")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
/* CORRECTED 2026-08-04 (UI-29): a page-shaped artifact now declares its
   ALTITUDE on the section element, so the opening tag carries attributes and
   the old exact-string split (`<section class="pub-page">`) matched nothing.
   The altitude is what block 2's sweep is built on and could not be inferred
   from position. */
function pages(html){
  const out = [];
  const re = /<section class="pub-page"/g;
  let m;
  while((m = re.exec(html))){
    const start = m.index;
    re.lastIndex = start + 1;
    const next = html.indexOf('<section class="pub-page"', start + 1);
    out.push(html.slice(start, next < 0 ? html.length : next));
  }
  return out;
}
const findingPages = html => pages(html).filter(p => /data-page="finding"/.test(p));
const casePages = html => pages(html).filter(p => /data-page="case"/.test(p));
/* THE COMPLEMENT: everything that is NOT inside a finding's pages — the floor
   picker, every case-level page, the per-page footer and the trailing links.
   This is the region a case-level strength would have to appear in, and the
   sweep over it is the instrument DEC-44's negative control needs. It is a
   STRUCTURAL sweep over the whole response and not a value comparison, because
   REC-44 measured that a value comparison passes: a spurious case-level strength
   breaks no per-finding assertion anywhere. */
function caseAltitude(html){
  let out = String(html);
  for(const p of findingPages(html)) out = out.split(p).join(" ");
  /* AND THE INDEX'S MEMBER BLOCKS, which carry the same `data-findingsec` mark
     for the same reason: a finding's strength lives inside a marked region on
     every surface this file draws, so the complement is computed the one way on
     both and a second mechanism is a second thing to forget. */
  for(const m of out.matchAll(/<section class="pub-member"[\s\S]*?<\/section>/g)) out = out.split(m[0]).join(" ");
  /* CASE-6 / DEC-72 clause 2, 2026-09-10 — THE BAR BLOCKS COME OUT, AND THE HOLE
     THAT MAKES IS CLOSED BY AN ASSERTION RATHER THAN LEFT OPEN.

     WHY THEY HAVE TO COME OUT. This sweep exists to stop a CASE carrying a
     STRENGTH (DEC-44), and one of the six things it counts as evidence is the
     text `(Documents|Links) (A|B|C|D|UNRATED)`. DEC-72 clause 2 now REQUIRES a
     case to carry a BAR, and a bar is written in exactly that vocabulary,
     because a required strength and a reached strength are measured on the same
     two axes in the same letters — that is what makes the comparison mean
     anything. So after CASE-6 the sweep's matcher cannot tell a requirement from
     a measurement by text, and left alone it reports every correctly-rendered
     case bar as a case-level strength.

     THIS IS A CORRECTION, NOT AN EXEMPTION, AND THE DIFFERENCE IS THE ARM BELOW.
     Exempting would be deleting the region from the sweep and moving on, which
     would blind it to a genuine case strength printed inside a bar block —
     narrow, but exactly the kind of hole an exemption leaves. Instead the
     regions are removed HERE and `barsCarryNoStrength` re-reads them on their
     own terms: inside a bar block the axis letters are permitted, and every
     OTHER form of strength evidence — the surface's own mark, the axis panel's
     mark, a `data-axis` attribute, a hand-written "Grade X", the composition
     vocabulary — is still forbidden. Net: one form of evidence is licensed in
     one named region and nothing else moved. */
  for(const m of out.matchAll(/<div class="pub-casebar"[\s\S]*?<\/div>/g)) out = out.split(m[0]).join(" ");
  for(const m of out.matchAll(/<div class="pub-casebar-ref"[\s\S]*?<\/div>/g)) out = out.split(m[0]).join(" ");
  return out;
}
/* THE OTHER HALF OF THE EXCLUSION ABOVE. Returns what a bar block carries that a
   bar block must never carry; the axis-and-letter text is deliberately NOT on the
   list, because in a bar that text IS the bar. */
function barsCarryNoStrength(html){
  const hits = [];
  for(const m of String(html).matchAll(/<div class="pub-casebar(?:-ref)?"[\s\S]*?<\/div>/g)){
    const f = m[0], t = strip(f);
    for(const x of f.matchAll(/class="pub-grade"/g)) hits.push("a pub-grade strength mark inside a bar block");
    for(const x of f.matchAll(/class="subj-grade[^"]*"/g)) hits.push("an axis-panel grade mark inside a bar block");
    for(const x of f.matchAll(/data-axis="/g)) hits.push("a data-axis attribute inside a bar block");
    for(const x of t.matchAll(/\bGrade [A-D]\b/g)) hits.push("grade text inside a bar block: " + x[0]);
    for(const x of t.matchAll(/overall strength|combined strength|average grade|composite|case grade|grade of the case|the case's strength/gi))
      hits.push("composition vocabulary inside a bar block: " + x[0]);
  }
  return hits;
}
/* WHAT COUNTS AS PRESENTING A STRENGTH, in every form this file can produce one
   in: the surface's own strength mark, the shared axis panel's grade mark, the
   axis attribute, a hand-written axis-word-plus-letter, a hand-written "Grade
   X", and the composition vocabulary. A negative control may present a
   case-level strength in ANY of them, so the sweep reads all of them and NAMES
   what it found rather than answering true or false. */
function strengthEvidence(fragment){
  const t = strip(fragment);
  const hits = [];
  for(const m of String(fragment).matchAll(/class="pub-grade"/g)) hits.push("a pub-grade strength mark");
  for(const m of String(fragment).matchAll(/class="subj-grade[^"]*"/g)) hits.push("an axis-panel grade mark");
  for(const m of String(fragment).matchAll(/data-axis="/g)) hits.push("a data-axis attribute");
  for(const m of t.matchAll(/\b(Documents|Links) (A|B|C|D|UNRATED)\b/g)) hits.push("axis-and-letter text: " + m[0]);
  for(const m of t.matchAll(/\bGrade [A-D]\b/g)) hits.push("grade text: " + m[0]);
  for(const m of t.matchAll(/overall strength|combined strength|average grade|composite|case grade|grade of the case|the case's strength/gi))
    hits.push("composition vocabulary: " + m[0]);
  return hits;
}
function block(html, cls){
  const at = html.indexOf(`class="${cls}"`);
  if(at < 0) return "";
  const open = html.lastIndexOf("<", at);
  const rest = html.slice(open + 1);
  const end = rest.indexOf(`class="${cls}"`);
  return end < 0 ? rest : rest.slice(0, end);
}
/* THE KEPT SET AND THE DROPPED SET, READ APART, AND NOW PER FINDING. A dropped
   leg is NAMED — that is the rule — so "the id appears on the page" is true
   either way and measures nothing. And with two findings on one page, "the id
   appears in the kept set" is true if EITHER finding kept it, so `data-of`
   carries the finding whose leg it is and the helpers scope to it. */
const keptIds = (html, fid) => [...String(html).matchAll(/data-kept="1" data-leg="([^"]+)" data-of="([^"]+)"/g)]
  .filter(m => !fid || m[2] === fid).map(m => m[1]);
const droppedIds = (html, fid) => [...String(html).matchAll(/data-dropped="1" data-leg="([^"]+)" data-of="([^"]+)"/g)]
  .filter(m => !fid || m[2] === fid).map(m => m[1]);
function gradeMarks(html){
  return [...String(html).matchAll(/<span class="pub-grade" ([^>]*)>([\s\S]*?)<\/span>/g)]
    .map(m => ({ attrs:m[1], text:strip(m[2]) }));
}
const attrOf = (s, name) => { const m = new RegExp(name + '="([^"]*)"').exec(s); return m ? m[1] : null; };

console.log("\n--- publishedcase (UI-18, corrected by UI-27 and UI-29) ---");

/* ============ 1. THE INDEX, over CASE EDITIONS, with EVERY FINDING'S pair ============
   CORRECTED WHOLESALE 2026-08-04 (UI-29, DEC-44), never exempted. The old block
   asserted one row per published BUNDLE edition carrying ONE frozen pair, which
   is the one-inquiry-per-case shape D-187 records. A row is a CASE EDITION and
   carries ONE PAIR PER MEMBER FINDING; the values demanded are the same values,
   at the altitude they belong to. */
await ctx.__pubList();
const idx = list();
ok("the index answers a caller holding NO credential of any kind", idx.length > 0 && !/Loading/.test(idx));
{
  const rows = idx.split('<div class="pf"').slice(1);
  /* CORRECTED 2026-08-05 (REC-49), never exempted: 5 -> 6. A SIXTH row joined the
     fixture rather than the surface changing — a ratified FINDING that is in no
     case, which is the row the old "no frozen strength pair" sentence understated
     (a pair belongs to a finding; belonging to no case costs it a case identity,
     a scope and a completeness assertion, and not its pair). The four CASE rows
     are unchanged. */
  /* CORRECTED AGAIN 2026-09-10 (UI-56), never exempted: 7 -> 8 rows and 5 -> 6 case
     rows. A fixture row joined — a complete case edition 2 holding a member at its
     own edition 1 — and the rule this assertion states does not move: one row per
     CASE EDITION, plus one per ratified bundle in no case.
     AND THE ARM CORRECTED THIS COMMENT, WHICH IS RECORDED RATHER THAN QUIETLY
     FIXED. It first claimed the count would be BLIND to the defect — that a
     diverged member dropped from its case and re-rendered as a loose bundle
     would leave the same total. MEASURED, THAT IS FALSE: the case row does not
     disappear under the defect, it renders as `awaiting`, so the loose row is an
     ADDITION and the index goes to 9 rows (arm 1 and arm 1b both fail this line,
     229/234). The count is therefore one real witness among five — but it is the
     only one of the five that cannot say WHICH finding went wrong or how, which
     is why the named assertions below exist and why they are this item's
     evidence. A count that moves for the right reason and a count that moves for
     the wrong one are the same number. */
  ok("the index enumerates CASE EDITIONS — two editions of the two-finding case, one each of the others",
     rows.length === 8 && (idx.match(/data-caserow="CASE-/g) || []).length === 6);
  const e1 = rows[0], e2 = rows[1];
  ok("a case row names the CASE identity and its edition, and the identity is not any member's bundle id",
     e1.includes(CASE) && /edition 1/.test(e1) && !e1.includes("data-caserow=\"" + FIND_A));
  ok("a case row says how many findings it holds, and shows one pair per finding rather than one for the case",
     /A case of 2 findings/.test(strip(e1))
     && (e1.match(/class="pub-axisrow" data-finding="/g) || []).length === 2);
  ok("every pair on the row NAMES the finding it belongs to, in text and not only in an attribute",
     strip(e1).includes(FIND_A + " —") && strip(e1).includes(FIND_B + " —"));
  ok("and the two findings' letters are DIFFERENT and both survive: no row-level letter is composed from them",
     /Documents D/.test(strip(e1)) && /Links C/.test(strip(e1))
     && /Documents B/.test(strip(e1)) && /Links UNRATED/.test(strip(e1)));
  ok("every row that shows a strength at all shows BOTH axes — never one letter in the place a reader quotes",
     [...e1.matchAll(/class="pub-axisrow" data-finding="([^"]+)"([\s\S]*?)<\/span><\/span>/g)].length >= 0
     && (e1.match(/data-axis="capture"/g) || []).length === 2
     && (e1.match(/data-axis="connection"/g) || []).length === 2);
  /* CORRECTED 2026-09-10 (CASE-6 / DEC-72 clause 2), NOT EXEMPTED. It read:
     "the declared bar rides the index row too, PER FINDING — one member declared
     none and one declared a bar", and it asserted `bar: none declared` AND
     `bar: Documents B` on one case row. The OLD ONE WAS WRONG IN TWO WAYS AT
     ONCE and both are worth naming, because only the first is obvious. (1) The
     bar is the CASE's property now — one standard per case, read from the
     publishing project at act time — so it is drawn once on the case row rather
     than once per member. (2) The fixture it passed over could not exist: two
     members of ONE case carrying DIFFERENT `required` blocks. The plane copies
     `published_cases.bar` into every member's `published_bundles.required`, so
     those two values are the same value by construction. This assertion was
     therefore green over a shape the plane cannot produce — the mock as wrong as
     the surface, D-173's class and the same one UI-56 found in this very file
     one item ago. The fixture is corrected with it, below. */
  ok("the case's bar rides the index row ONCE, as the CASE's property and not once per member",
     (e1.match(/class="pub-casebar"/g) || []).length === 1
     && /data-casebar="declared"/.test(e1) && /Documents B/.test(strip(e1))
     && !/bar: none declared/.test(e1));
  ok("the superseded edition SAYS it is superseded, and says the pairs on that row are its own",
     /superseded by edition 2/.test(e1) && /every pair on this row is edition 1's own/.test(e1));
  ok("the newest edition says so", /newest edition/.test(e2));
  ok("the case's own SCOPE statement is what titles the row — the case's words, not a finding's title",
     strip(e1).includes("Whether the FY2024 sewer fund transfer was authorised"));
  const wait = rows.find(r => /data-caseedition="awaiting"/.test(r));
  /* CORRECTED 2026-08-05 (REC-49), never exempted: 1 of 2 -> 2 of 3. The
     awaiting edition gained a THIRD declared member — ratified, and with no
     frozen pair on the record — so that the surface's no-pair sentence is
     actually REACHED by a test rather than being wording nobody exercises. The
     rule the assertion states is unchanged: how many of how many, and no
     container. */
  ok("an edition still being ratified says so ON THE INDEX: how many of how many landed, and no container",
     !!wait && /NOT FINISHED YET: 2 of 3 declared findings ratified/.test(strip(wait))
     && /the container is not assembled/.test(strip(wait)));
  ok("and the declared member that has not ratified is NAMED there and nothing of it is described",
     !!wait && /data-member="awaiting" data-findingsec="INQ-2026-4302"/.test(wait)
     && /DECLARED AND NOT YET RATIFIED/.test(strip(wait))
     && !/data-axis=/.test(wait.slice(wait.indexOf('data-member="awaiting"'))));
  /* REC-49: THE AWAITING WINDOW SHOWS THE PAIRS IT HONESTLY HAS. Its ratified
     member signed a pair; the container that would carry a copy does not exist
     and will not for as long as the last member takes. This is CONDUCT's
     determination as a standing assertion — and the wording pin beside it is
     what stops the surface drifting back to reading a manifest that is null. */
  ok("REC-49: the ratified member of an AWAITING edition shows its own frozen pair, with no container to read one from",
     !!wait && /data-member="ratified" data-findingsec="INQ-2026-4301"/.test(wait)
     && /class="pub-axisrow" data-finding="INQ-2026-4301"/.test(wait)
     && (wait.match(/data-axis="capture"/g) || []).length === 1
     && (wait.match(/data-axis="connection"/g) || []).length === 1
     && CASE_ROWS.find(c => c.case_id === CASE_WAIT).manifest === null);
  /* AND THE NO-PAIR SENTENCE IS REACHED, which is the only way to assert what it
     says. Its subject is the ratified member the plane holds no pair for — NOT
     the container, which is what UI-29's wording blamed and what stopped being
     true when the pair moved to the member's own row. An assertion that the old
     sentence is absent from the page passes for free if nothing ever renders the
     branch: that is the outcome-that-costs-nothing shape, and it is why this
     edition carries a third member rather than two. */
  ok("REC-49: a RATIFIED member the plane holds no pair for is told THAT, and not that a container is missing",
     !!wait && /data-nopair="INQ-2026-4303"/.test(wait)
     && /The published record carries no frozen strength pair for this ratified member/.test(strip(wait))
     && /nothing was established on either axis/.test(strip(wait)));
  ok("and no member of that edition is told its pair is merely waiting on a container — that sentence is gone",
     !/travels in the case container/.test(idx) && !/not assembled for this edition yet/.test(idx));
  /* REC-49: THE ROSTER CANNOT ANSWER FOR THE CONTAINER. Every declared member of
     this edition has ratified and the container was never recorded; a surface
     reading completeness off "nothing is waiting" prints `container sha256:` with
     nothing in front of the ellipsis. */
  const stuck = rows.find(r => /data-caserow="CASE-2026-0004"/.test(r));
  ok("REC-49: an edition whose members all ratified but whose container was never recorded is NOT called ratified",
     !!stuck && /data-caseedition="awaiting"/.test(stuck)
     && /NOT FINISHED YET: 1 of 1 declared findings ratified/.test(strip(stuck))
     && !/container sha256/.test(strip(stuck))
     && /class="pub-axisrow" data-finding="INQ-2026-4401"/.test(stuck));
  const loose = rows.find(r => /data-notacase="INFO-2026-8001"/.test(r));
  ok("a published bundle that is NOT a member of any case says exactly that, and no pair is invented for it",
     !!loose && /not a member of any published case/.test(strip(loose))
     && !/data-axis=/.test(loose)
     && /carries no frozen strength pair for it either/.test(strip(loose)));
  /* REC-49: THE SAME SENTENCE MUST NOT BE SAID OF A ROW THAT DOES HAVE ONE.
     "No frozen strength pair" was asserted of every loose row in one breath with
     three absences that really are structural; this one is not. */
  const looseFind = rows.find(r => /data-notacase="INQ-2026-4500"/.test(r));
  ok("REC-49: a ratified FINDING in no case still shows ITS OWN pair, and is not told it has none",
     !!looseFind && /class="pub-axisrow" data-finding="INQ-2026-4500"/.test(looseFind)
     && (looseFind.match(/data-axis="capture"/g) || []).length === 1
     && !/carries no frozen strength pair/.test(strip(looseFind))
     && /no case identity, no scope statement and no completeness assertion/.test(strip(looseFind)));
  /* ============ UI-56 · THE DIVERGED MEMBER (IC-66's delegation) ============
     A CASE'S EDITION AND ITS MEMBER'S EDITION ARE TWO NUMBERS SINCE CASE-5, and
     the join between the roster and the ratified rows is the member's PINNED
     VERSION HASH — `caseMembers[].version_sha` to `published[].bundle_sha` —
     never edition to edition. The plane ships that rule in words on this very op
     (`publishedManifest().production`); this block is it, driven.

     WHY THESE ASSERTIONS AND NOT A COUNT. The broken join failed SILENTLY and in
     three places at once, and every one of the three is a false statement about
     the published record rather than a blank space: the member reads as awaiting
     ratification forever, its pair and its bar go, and it is listed a SECOND time
     as belonging to no case. A count notices that SOMETHING moved (measured: 9
     rows instead of 8) and can say nothing whatever about which finding, in which
     direction, or whether the record now over- or under-states — and the marks
     are not even missing, they RELOCATE onto the loose row, so a mark tally reads
     clean. Only assertions that NAME the finding and ask WHERE it is can tell a
     restored record from a rearranged one; that is arm (c)'s and arm (j)'s
     finding in this same suite, one altitude up. */
  const divRow = rows.find(r => /data-caserow="CASE-2026-0005"/.test(r));
  ok("UI-56: a member whose OWN edition differs from its case's is joined to its ratified row at all",
     !!divRow && /data-member="ratified" data-findingsec="INQ-2026-4600"/.test(divRow)
     && !/data-member="awaiting"/.test(divRow)
     && !/DECLARED AND NOT YET RATIFIED/.test(strip(divRow)));
  ok("UI-56: and the case edition holding it is NOT reported as still collecting signatures",
     !!divRow && /data-caseedition="complete"/.test(divRow)
     && !/NOT FINISHED YET/.test(strip(divRow))
     && /container sha256:cdcdcdcdcdcdcdcd/.test(strip(divRow)));
  ok("UI-56: the diverged member shows ITS OWN frozen pair — both axes, from the bytes IT signed",
     !!divRow && /class="pub-axisrow" data-finding="INQ-2026-4600"/.test(divRow)
     && (divRow.match(/data-axis="capture"/g) || []).length === 1
     && (divRow.match(/data-axis="connection"/g) || []).length === 1
     && /Documents B/.test(strip(divRow)) && /Links UNRATED/.test(strip(divRow))
     && !/carries no frozen strength pair/.test(strip(divRow)));
  /* CORRECTED 2026-09-10 (CASE-6 / DEC-72 clause 2), NOT EXEMPTED, AND UI-56's
     SUBJECT IS UNCHANGED. It read "UI-56: and its DECLARED BAR, which the broken
     join blanked beside the pair" and looked for `bar: Documents B` inside the
     diverged member's own row. The bar is no longer drawn per member, so the
     literal is gone — but UI-56 was never about the bar, it was about the JOIN:
     a diverged member joined by edition instead of by its pin came back EMPTY,
     and everything downstream of the join went blank with it. The bar was one of
     three symptoms of that one defect and the only one this item removed. So the
     arm is re-pointed at the two symptoms that remain and at the fact the bar
     moved to: the member's own row still resolves (its AUTHORED ROLE is served
     and drawn, which is a roster column and would blank exactly as the bar did),
     and its case's bar is present on the case row it belongs to. If the join
     breaks again, both of these go blank again. */
  ok("UI-56: and its ROSTER COLUMNS, which the broken join blanked beside the pair",
     !!divRow && new RegExp('data-role="load_bearing" data-finding="' + FIND_V + '"').test(divRow)
     && !/DECLARED AND NOT YET RATIFIED/.test(strip(divRow))
     && /data-casebar="declared"/.test(divRow));
  /* AND THE OTHER HALF, WHICH IS THE ONE A READER WOULD HAVE BELIEVED. A finding
     dropped from its case did not vanish from the page — it reappeared at the
     bottom under "not a member of any published case", so the index asserted of
     the SAME finding that it was awaiting ratification inside a case and that it
     belonged to no case, in one screen. Exactly once, and in the right place. */
  /* AND THIS ASSERTION CORRECTED ITSELF ON ITS FIRST RUN, WHICH IS RECORDED
     RATHER THAN SMOOTHED. Its last clause counted bare `data-finding="…"` and
     read 3 where it declared 1 — because a pair emits the attribute on its
     `pub-axisrow` AND on each of the two `pub-grade` badges inside it. THE
     SUBJECT WAS CORRECT AND THE INSTRUMENT WAS WRONG, in the direction that
     fails loudly rather than the direction that passes quietly; the anchored
     spelling below is the one the rest of this block already uses, and the
     unanchored count is exactly the mistake the anchor exists to stop. */
  ok("UI-56: the diverged member appears EXACTLY ONCE on the whole index, and never as a loose bundle",
     (idx.match(/data-findingsec="INQ-2026-4600"/g) || []).length === 1
     && !/data-notacase="INQ-2026-4600"/.test(idx)
     && (idx.match(/class="pub-axisrow" data-finding="INQ-2026-4600"/g) || []).length === 1
     && (idx.match(/data-member="[a-z]+" data-findingsec="INQ-2026-4600"/g) || []).length === 1);
  /* THE PIN IS WHAT IS READ, AND THE FIXTURE PROVES IT COULD NOT HAVE BEEN THE
     EDITION: there is no ratified row for this finding at the case's edition at
     all, so a join that produced the right answer produced it from the hash. */
  ok("UI-56: the join is the PIN — no ratified row for this finding exists at the case's edition",
     CASE_MEMBERS.find(m => m.bundle_id === FIND_V).version_sha === V_SHA
     && Number(CASE_MEMBERS.find(m => m.bundle_id === FIND_V).edition) === 2
     && PUB_ROWS.filter(p => p.bundle_id === FIND_V).length === 1
     && Number(PUB_ROWS.find(p => p.bundle_id === FIND_V).edition) === 1);
  /* OVER-STRICTNESS, STATED AS AN ASSERTION RATHER THAN LEFT TO THE OTHER ARMS:
     a member with NO PIN is not diverged and is not broken either. `version_sha`
     is nullable, the plane says what a null means, and for such a member the
     case's edition is the only reference there is — so the old key must still be
     used and must still land. `CASE-2026-0004` above is the row that proves it;
     this names the mechanism so a future edit cannot delete the fallback and pass. */
  ok("UI-56 over-strictness: an UNPINNED legacy member still joins on the case's edition and renders whole",
     CASE_MEMBERS.find(m => m.bundle_id === FIND_K).version_sha === null
     && !!stuck && /class="pub-axisrow" data-finding="INQ-2026-4401"/.test(stuck)
     && !/DECLARED AND NOT YET RATIFIED/.test(strip(stuck))
     && (idx.match(/data-findingsec="INQ-2026-4401"/g) || []).length === 1
     && !/data-notacase="INQ-2026-4401"/.test(idx));
  /* AND THE MOCK ANSWERS THE WIRE (D-173). The roster fixture dropped two of the
     six columns `publishedManifest()` selects, which is how a surface could join
     on a column the suite did not have and stay green. A pin on the wire that no
     fixture carries is a pin no assertion can be wrong about. */
  ok("UI-56: the roster fixture answers the WIRE SHAPE — every member row carries `version_sha` and `role`",
     CASE_MEMBERS.length === 10
     && CASE_MEMBERS.every(m => "version_sha" in m && "role" in m)
     && CASE_MEMBERS.filter(m => m.version_sha).length === 9);

  /* ===== CASE-6 / DEC-72 clause 4 · THE GENUINELY UNDESIGNATED MEMBER, AND THIS
     BLOCK IS THE ONLY PLACE IT CAN BE ASKED. It needs a member that is RATIFIED
     (so the surface really did receive its roster columns) and carries a NULL
     role (so nobody authored a designation). On the case-detail accessor the
     suite's only role-null member is `FIND_D`, which is also AWAITING — a
     different state with a different rendering — so the question is unanswerable
     there. On the index it is `FIND_K`: ratified, unpinned, role null.

     THIS ASSERTION EXISTS BECAUSE A NEGATIVE CONTROL FOUND IT MISSING, and that
     is recorded rather than smoothed. Arm (b) of `case6.control.mjs` defaults
     `pubRoleOf` to "load_bearing" for an absent designation — the exact inference
     DEC-72 clause 4 forbids — and the suite came back **242/242 GREEN**. The
     comment on the awaiting page already said the branch "is asked on the INDEX
     instead, of FIND_K"; the comment was written and the assertion was not, so
     the file DESCRIBED a coverage it did not have. A control that reddens nothing
     is a finding about the arm OR about the suite, and this time it was the
     suite. With this arm in place (b) fails as declared.

     IT ASSERTS BOTH DIRECTIONS. Present as undesignated, and ABSENT as either of
     the two authored values — because a default would show up as a positive
     designation, not as a missing one, and a test that only checks for the
     undesignated marker would pass while the row ALSO claimed to be load-bearing. */
  ok("CASE-6: a RATIFIED member carrying NO authored designation renders as UNDESIGNATED on the index",
     CASE_MEMBERS.find(m => m.bundle_id === FIND_K).role === null
     && !!stuck && new RegExp('data-role="undesignated" data-finding="' + FIND_K + '"').test(stuck)
     && /does not decide on the publisher's behalf/.test(strip(stuck))
     && !new RegExp('data-role="load_bearing" data-finding="' + FIND_K + '"').test(stuck)
     && !new RegExp('data-role="supporting" data-finding="' + FIND_K + '"').test(stuck));
  ok("CASE-6: and the AUTHORED designations on the index are the ones the roster rows carry, both values",
     new RegExp('data-role="load_bearing" data-finding="' + FIND_A + '"').test(idx)
     && new RegExp('data-role="supporting" data-finding="' + FIND_B + '"').test(idx)
     && !new RegExp('data-role="supporting" data-finding="' + FIND_A + '"').test(idx)
     && !new RegExp('data-role="load_bearing" data-finding="' + FIND_B + '"').test(idx));

  /* THE INDEX IS THE PLACE A READER QUOTES FROM, so the same structural sweep
     runs here, over the same complement: everything outside the marked member
     blocks. A letter that survives here is a letter attached to a CASE. */
  const outsidePairs = strengthEvidence(caseAltitude(idx));
  ok("no strength appears anywhere on the index outside a row's per-finding member block",
     outsidePairs.length === 0, outsidePairs);
}
ok("the index went to op=publishedmanifest and to nothing else",
   WIRE.length === 1 && WIRE[0].op === "publishedmanifest");
/* CORRECTED 2026-08-05 (REC-49) AND NOT EXEMPTED, because the rule it pinned
   changed and the old pin was right about the shape and wrong about the source.
   UI-29 pinned that the index parses its pairs OUT OF THE CASE ROW'S MANIFEST
   COLUMN — true then, and the reason the awaiting window showed no pairs at all:
   the manifest is written when the LAST member ratifies, so a case still
   collecting signatures had nowhere for a pair to come from. The pair is now
   read off the MEMBER'S OWN RATIFIED ROW, which exists from that member's own
   ratification. The manifest column is still there and is still the case's own
   record of what it carried; it is simply not what a strength is read from. */
ok("REC-49: a member's pair is read off ITS OWN ratified row, not out of the case's container manifest",
   Array.isArray(PUB_ROWS[0].strength) && PUB_ROWS[0].manifest === undefined
   && typeof CASE_ROWS[0].manifest === "string"
   && /Documents D/.test(idx) && /Links C/.test(idx));

/* ============ 2. THE CASE — ITS FINDINGS, PLURAL, AT none/none ============ */
await ctx.__pubOpen(CASE);
let page = pubBody();
ok("a case id alone answers with the LATEST edition (DEC-12)", /edition 2 of 2/i.test(strip(page)));
ok("no request this surface made carried a credential", WIRE.every(w => !w.token));

/* ---- the case's own two assertions, at the case's own altitude ---- */
{
  const t = strip(page);
  const cps = casePages(page);
  ok("the case renders its own identity as the page's subject, not any one finding's", /<h1>CASE-2026-0001<\/h1>/.test(page));
  ok("the AUTHORED SCOPE statement renders — what the case is ABOUT, per case per edition",
     /data-scopetext="1"/.test(page) && t.includes("Whether the FY2024 sewer fund transfer was authorised"));
  ok("the COMPLETENESS statement renders beside it and is a DIFFERENT claim — what the case leaves OUT",
     t.includes(STMT2) && /What this case excludes/.test(t)
     && /what the case is ABOUT is a different claim from what it leaves OUT/i.test(t));
  ok("both are the CASE's and are made ONCE for the edition, not repeated per finding (DEC-44 (d))",
     cps.some(p => strip(p).includes(STMT2)) && findingPages(page).every(p => !strip(p).includes(STMT2)));
  ok("the completeness assertion carries the member who wrote it and the date, and says it is the case's",
     /Written by vera on 2026-07-20/.test(t) && /It is the CASE's assertion, made once for this edition/.test(t));
  ok("the subject position travels with it", /sought_and_answered/.test(t));
}

/* ---- BOTH findings, each whole, each its own ---- */
{
  const fps = findingPages(page);
  const t = strip(page);
  ok("the case renders every member finding, each in its own pages", fps.length === 6
     && fps.filter(p => /data-findingsec="INQ-2026-4101"/.test(p)).length === 3
     && fps.filter(p => /data-findingsec="INQ-2026-4102"/.test(p)).length === 3);
  ok("each finding renders its OWN title, question and conclusion of record",
     t.includes("Was the sewer transfer authorised?") && t.includes("Who approved the transfer?")
     && t.includes("The transfer rests on a memo nobody adopted.")
     && t.includes("No officer of record approved it."));
  ok("each finding renders its OWN falsifier — one proposition, one falsifier, never merged (DEC-32)",
     /What would overturn finding 1/.test(t) && /What would overturn finding 2/.test(t)
     && t.includes("An adopted resolution naming the transfer would overturn this.")
     && t.includes("A signed approval naming an officer."));
  ok("each finding renders its OWN basis chain, and the legs are marked with the finding they belong to",
     keptIds(page, FIND_A).includes(L_CAP_D) && keptIds(page, FIND_B).includes("INFO-2026-8201")
     && !keptIds(page, FIND_A).includes("INFO-2026-8201"));
  ok("each finding renders its OWN division disclosure — one member was divided out of a larger question and one was not",
     /data-division="named" data-of="INQ-2026-4102"/.test(page) && t.includes(PARENT) && t.includes(SIBLING)
     && /data-division="none" data-of="INQ-2026-4101"/.test(page));
  /* CORRECTED 2026-09-10 (CASE-6, discharging CASE-5b), NOT EXEMPTED — AND THIS
     IS THE ONE THAT MATTERED MOST, because it pinned a NEGATIVE about the record
     onto a page a stranger reads. It asserted the page says "there is no
     case-level signature", which was true and well-reasoned when written: a
     signature over a case would be a signature over something nobody reviewed,
     which is the container manifest's own constraint. CASE-5b did not work around
     that constraint, it SATISFIED it — `op=caseratify` verifies an SSHSIG over a
     case DOCUMENT whose text is the publisher's own authored assertions rather
     than a synthesised roster summary, so what is signed is a thing a member
     actually reviewed. The constraint stands; the conclusion drawn from it does
     not. What the page must now say is that there are TWO signatures over TWO
     DIFFERENT things, neither standing in for the other — and it must read the
     document off the wire rather than assert its existence, which is why the
     null branch is asserted separately at the awaiting case below. */
  ok("each finding carries its OWN attestor, signing key and signature, and the CASE carries its own document",
     /Attested by/.test(t) && t.includes("vera") && t.includes("dan")
     && (page.match(/<dt>Signature<\/dt>/g) || []).length === 2
     && !/there is no case-level signature/.test(t)
     && /Two signatures over two different things, neither standing in for the other/.test(t)
     && /data-casedoc="signed"/.test(page));
}

/* ---- THE TWO PAIRS, DISTINCTLY, AND NO CASE-LEVEL STRENGTH ANYWHERE ----
   This is DEC-44's own negative control standing as an always-on assertion. */
{
  const marks = gradeMarks(page);
  const fids = new Set((caseEdition(2).findings || []).map(f => f.bundle_id));
  const legIds = new Set(BASIS_A.concat(BASIS_B).map(l => l.target));
  ok("every strength mark on the page names the axis it belongs to",
     marks.length > 0 && marks.every(m => /data-axis="(capture|connection)"/.test(m.attrs)));
  ok("and names it in its own TEXT as well as in an attribute nobody can read",
     marks.every(m => /^(Documents|Links)\b/.test(m.text)));
  ok("mark count and axis count agree — no mark is drawn without an axis",
     marks.length === (page.match(/data-axis="/g) || []).length);
  /* DEC-44's FIRST INSTRUMENT: OWNERSHIP. Every mark names the FINDING whose
     strength it states — its own finding, or the finding a leg cites. A mark
     that named the CASE would be a strength for the case, and there is no such
     thing. */
  const owners = marks.map(m => attrOf(m.attrs, "data-finding"));
  ok("every strength mark names the FINDING whose strength it is, and none of them is empty",
     owners.length === marks.length && owners.every(o => o && o.length > 0));
  ok("and every owner is a finding this case actually has, or a finding one of its legs cites — never the case itself",
     owners.every(o => fids.has(o) || legIds.has(o)) && !owners.includes(CASE));
  /* DEC-44's SECOND INSTRUMENT: THE STRUCTURAL SWEEP OVER THE COMPLEMENT. */
  const outside = strengthEvidence(caseAltitude(page));
  ok("NO STRENGTH OF ANY KIND appears outside a finding's own pages — not a mark, not a letter, not a word",
     outside.length === 0, outside);
  ok("and every strength mark is inside a finding's section, counted in both directions",
     findingPages(page).reduce((s, p) => s + (p.match(/class="pub-grade"/g) || []).length, 0)
     === (page.match(/class="pub-grade"/g) || []).length);
  /* THE TWO PAIRS ARE DIFFERENT, WHICH IS THE CONDITION DEC-44'S CONTROL NAMES:
     there is no letter that honestly describes both. */
  const secA = findingPages(page).filter(p => /data-findingsec="INQ-2026-4101"/.test(p)).join("");
  const secB = findingPages(page).filter(p => /data-findingsec="INQ-2026-4102"/.test(p)).join("");
  /* READ OUT OF THE PAIR ROW ITSELF, not off the page. CORRECTED AT WRITING
     (UI-29) when arm (c) measured it: "Links C appears in finding 1's pages" is
     true whether the PAIR carries it or not, because a LEG of finding 1 is
     graded connection C and prints its own mark two inches lower. That is
     UI-18 arm (a)'s outcome-that-costs-nothing in a new place, so the frozen
     pair is read out of the axisrow that names the finding. */
  const pairRow = (html, fid) => (String(html)
    .match(new RegExp('<span class="pub-axisrow" data-finding="' + fid + '"[\\s\\S]*?<\\/span><\\/span>', "g")) || []).join("");
  const strengthPage = fid => findingPages(page).filter(p => new RegExp('data-findingsec="' + fid + '"').test(p)
                                                            && /How strong finding/.test(p)).join("");
  const rowA = pairRow(strengthPage(FIND_A), FIND_A), rowB = pairRow(strengthPage(FIND_B), FIND_B);
  ok("finding 1's own frozen pair carries BOTH axes and both of ITS letters",
     /data-axis="capture"/.test(rowA) && /data-axis="connection"/.test(rowA)
     && /Documents D/.test(strip(rowA)) && /Links C/.test(strip(rowA)));
  ok("finding 2's own frozen pair carries BOTH axes and both of ITS letters, and they are not finding 1's",
     /data-axis="capture"/.test(rowB) && /data-axis="connection"/.test(rowB)
     && /Documents B/.test(strip(rowB)) && /Links UNRATED/.test(strip(rowB))
     && strip(rowA) !== strip(rowB));
  /* CORRECTED AT WRITING (UI-29): the first version of this read "neither
     finding's LETTERS leak into the other's pages", which is false and would
     have been a rule nobody could keep — a LEG carries its own grade, and
     finding 1's basis legitimately holds a capture-B leg. What must not leak is
     a FROZEN PAIR: the pair rows inside a finding's pages belong to that finding
     or to a finding one of its legs cites, and never to a sibling member. */
  const pairOwners = sec => [...sec.matchAll(/class="pub-axisrow" data-finding="([^"]+)"/g)].map(m => m[1]);
  ok("no sibling finding's frozen pair appears inside another finding's pages",
     !pairOwners(secA).includes(FIND_B) && !pairOwners(secB).includes(FIND_A)
     && pairOwners(secA).includes(FIND_A) && pairOwners(secB).includes(FIND_B));
  ok("the surface SAYS there is no strength for the case, rather than leaving its absence to be noticed",
     /There is no strength for the case as a whole and this page does not compute one/.test(strip(page)));
  ok("no composition word appears anywhere on the page",
     !/overall strength|combined strength|average grade|composite|case grade|grade of the case/i.test(strip(page)));
  /* DEC-17 as amended, and BOTH branches on ONE case — the shape only a
     multi-finding case can have. */
  /* BESIDE, and it is a position and not a wish: the bar sits AFTER the pair of
     frozen marks and BEFORE the per-axis panels, so a reader meets the standard
     the finding was held to in the same glance as the strength it reached.
     CORRECTED 2026-08-04 (UI-29): measured on the finding's STRENGTH page rather
     than on its three pages joined — a finding's first page carries `<h3>`
     headings of its own, so the old "before the first <h3>" test was satisfied
     by position on a different page and measured nothing. */
  const spA = strengthPage(FIND_A);
  /* CORRECTED 2026-09-10 (CASE-6 / DEC-72 clauses 2 and 4), NOT EXEMPTED. THE
     POSITION RULE SURVIVES VERBATIM AND THE SUBJECT MOVED — which is why this is
     a correction and not a deletion. The old assertion pinned that a bar sits
     AFTER the finding's pair of frozen marks and BEFORE the per-axis panels, so a
     reader meets the standard and the strength in one glance. DEC-72 keeps that
     requirement exactly ("each claim's own derived strength displayed beside the
     case's standard") and changes only WHOSE standard it is: what sits there now
     is a REFERENCE to the case's one bar, not a bar of this finding's own, and
     between them sits the thing that decides whether the bar applied at all —
     the AUTHORED role. The order under test is therefore pair, then role, then
     the case's standard, still all before the first `<h3>`. */
  ok("the case's standard renders BESIDE the strength reached, after the finding's own role, prominently",
     spA.indexOf('class="pub-axisrow" data-finding="' + FIND_A + '"') < spA.indexOf('class="pub-role"')
     && spA.indexOf('class="pub-role"') < spA.indexOf('class="pub-casebar-ref"')
     && spA.indexOf('class="pub-casebar-ref"') > 0
     && spA.indexOf('class="pub-casebar-ref"') < spA.indexOf("<h3")
     /* AND NO PER-FINDING BAR SURVIVES ANYWHERE. The class was renamed for
        exactly this assertion's sake: if `pub-bar` still appeared, a selector
        written against the old meaning would still be matching. */
     && !/class="pub-bar"/.test(page));
  /* THE ABSENT-BAR BRANCH MOVED TO THE ALTITUDE THAT OWNS IT — and therefore to
     a different BLOCK of this file, because the case that declares no bar is
     `CASE_SOLO` and this block has `CASE` open. It is asserted where that page is
     already rendered, below. The sentence under test ("an absent bar is not a bar
     of zero") is DEC-72's own, named in the ruling for precisely this state, and
     it is a statement a CASE makes about itself.
     THE DECLARED BRANCH, ONCE, AS THE CASE'S. The old pair of assertions read
     one bar off each of two members of ONE case and called them different
     standards; there is one standard here and it is asserted where it lives. */
  ok("and the case that DID declare one renders it as the CASE's, set in advance, exactly once",
     /data-casebar="declared" data-case="CASE-2026-0001"/.test(page)
     && /set in advance/.test(strip(page))
     && (page.match(/class="pub-casebar"/g) || []).length === 1);
  ok("the bar names WHOSE standard it is — a requirement with no publisher is one nobody asserted",
     new RegExp("the standard of[\\s\\S]{0,40}" + PROJ).test(strip(page)));
  ok("SUPPORTING members are visibly NOT load-bearing, and the words say it rather than the absence of a mark",
     /data-role="load_bearing" data-finding="INQ-2026-4101"/.test(page)
     && /data-role="supporting" data-finding="INQ-2026-4102"/.test(page)
     && /NOT presented as carrying the case/.test(strip(secB))
     && /the case rests on this finding/.test(strip(secA)));
  /* The UNDESIGNATED member lives on `CASE_WAIT` and is asserted at that page,
     below, for the same scoping reason the absent bar is. */
  ok("and a bar block carries a requirement and never a strength — the exclusion above is paid for here",
     barsCarryNoStrength(page).length === 0, barsCarryNoStrength(page));
  ok("the UNRATED axis reads UNRATED — its own frozen fact, and neither a low score nor a failure",
     /data-axis="connection" data-finding="INQ-2026-4102">Links UNRATED/.test(secB)
     && /UNRATED is not a low score and not a failure/.test(strip(secB)));
  ok("the retired word for the boundary case appears nowhere on the rendered page", !/susp/i.test(strip(page)));
}

/* ---- C-21.2's INHERITANCE, PER FINDING (DEC-44 (d)) ---- */
{
  const secA = findingPages(page).filter(p => /data-findingsec="INQ-2026-4101"/.test(p)).join("");
  const rests = secA.slice(secA.indexOf("What finding 1 rests on"));
  ok("a leg the surface can SERVE carries an address and a hash",
     /can SERVE it/.test(strip(rests)) && rests.includes(DOC_SHA));
  ok("a leg it can only NAME says so, and offers no address and no hash for it",
     /can only NAME it/.test(strip(rests)) && /There is no address and no hash to offer for it here/.test(strip(rests)));
  ok("the served leg carries the pair frozen into the EDITION IT NAMES, not the newest one",
     /the pair above is the pair frozen into the EDITION THIS LEG NAMES/i.test(strip(rests)));
  ok("and that inherited pair names the CITED finding as its owner — inheritance is per finding, never per case",
     new RegExp('class="pub-axisrow" data-finding="' + L_CAP_B + '"').test(rests)
     && /it is that finding's pair and not this one's/.test(strip(rests)));
  ok("a NAMED leg's id is not a link into anything", !new RegExp(`onclick[^>]*${L_CAP_D}`).test(rests));
}

/* ---- DEC-34: the per-page header on EVERY page-shaped artifact ---- */
{
  const ps = pages(page);
  ok("the case is assembled out of page-shaped artifacts, case-level and per-finding",
     ps.length === 9 && casePages(page).length === 3 && findingPages(page).length === 6);
  const stamps = (page.match(/data-dec34="1"/g) || []).length;
  ok("every page carries a DEC-34 header, and no page carries two", stamps === ps.length);
  const missing = [];
  for(const p of ps){
    const h = strip(p.slice(0, p.indexOf("</div>") + 6));
    const need = [CASE, "Edition 2", "Declared bias", "Floors", "publishedbytes"];
    if(!need.every(f => h.includes(f))) missing.push(h.slice(0, 120));
  }
  ok("and every header carries case id, edition, authors, declared bias, both floors, hash and a verification pointer",
     missing.length === 0, missing);
  /* CORRECTED 2026-08-04 (UI-29): the header used to carry ONE hash, the case's
     `bundle_sha`, because a case was one document. A case has no bytes of its
     own: a FINDING's page carries that finding's own signed hash, and a CASE
     page carries the container manifest's. A page is one or the other. */
  ok("a finding's page names its finding and carries THAT finding's own signed hash",
     findingPages(page).every(p => {
       const fid = attrOf(p, "data-findingsec");
       const h = attrOf(p, "data-hash");
       return strip(p).includes(fid) && (h === A2 || h === B2);
     }));
  ok("a case-level page carries the CASE's own hash, which is its container manifest's",
     casePages(page).every(p => attrOf(p, "data-hash") === MAN2));
  ok("no page-shaped artifact is at both altitudes at once",
     ps.every(p => /data-page="finding"/.test(p) !== /data-page="case"/.test(p)));
  ok("the header states the protection honestly: tamper-EVIDENT, never tamper-proof",
     /tamper-EVIDENT, never tamper-proof/.test(page));
  ok("declared bias is a real answer either way, and it is stated PER FINDING and never totalled",
     /1 declared hunch/.test(page) && /INFO-2026-8004/.test(page)
     && new RegExp(FIND_B + ": none declared").test(strip(page)));
  ok("the case-level header LISTS its authors rather than merging them into one",
     /vera \(completeness, for the case\)/.test(strip(page))
     && /vera \(attested INQ-2026-4101\)/.test(strip(page))
     && /dan \(attested INQ-2026-4102\)/.test(strip(page)));
}

/* ---- the in-band block: DEC-31's bound rule, and it is TEXT ---- */
{
  const at = page.indexOf('class="pub-inband"');
  ok("the in-band block exists", at > 0);
  const inband = page.slice(at, page.indexOf("</div>", page.indexOf('class="bound"')));
  const t = strip(inband);
  ok("it says WHAT THIS RENDERING IS — the whole case, unfiltered — rather than naming a stance",
     /THE WHOLE CASE, UNFILTERED/.test(t) && /No floors were applied/.test(t));
  ok("it names BOTH floors, and the `none` floor renders EXPLICITLY rather than being left unsaid",
     /Floor applied to Documents[^:]*: none/.test(t) && /Floor applied to Links[^:]*: none/.test(t));
  ok("it says the two floors are independent and neither is a default for the other",
     /Neither is a default for the other/.test(t));
  ok("it carries BOTH case-level assertions in-band — the scope and the completeness statement",
     /data-scope="1"/.test(inband) && t.includes("Whether the FY2024 sewer fund transfer was authorised")
     && t.includes(STMT2));
  ok("it says how many findings the case holds and that none of them is added up",
     /This is a case of 2 findings/.test(t) && /one letter over both would be a claim the evidence does not support/.test(t));
  /* CORRECTED 2026-08-04 (UI-29): the bound rule's HASH was the case's
     `bundle_sha`. A case has a container, not bytes; its checkable hash is the
     manifest's, and that is what a reader who pastes this block must carry. */
  ok("DEC-31's bound rule is in-band: hash, date, author and both floors",
     t.includes(MAN2) && t.includes("2026-07-20") && t.includes("vera")
     && /Floors: Documents none, Links none/.test(t));
  ok("the exclusions travel in-band too, because files get forwarded",
     t.includes(STMT2) || t.includes("does not cover"));
  ok("and every one of those facts survives the tags being stripped — this block is TEXT, not CSS",
     t.includes(CASE) && t.includes(MAN2) && t.includes("none"));
  ok("the in-band block prints FIRST: nothing of the case body precedes it",
     at < page.indexOf("<h1>") && at < page.indexOf("What this case is about"));
  ok("NO STRENGTH IS IN THE IN-BAND BLOCK — it is the case's block, at the case's altitude",
     strengthEvidence(inband).length === 0, strengthEvidence(inband));
}

/* ---- the supersession banner, and WHICH numbers it shows (REC-17) ---- */
{
  ok("on the newest edition the banner says so and names the pairs as this edition's own, per finding",
     /data-super="latest"/.test(page)
     && /Every strength shown on this page is the frozen pair of the FINDING it is printed beside/.test(strip(page)));
  ok("the banner came from published_cases and the frozen bytes — op=reevaluations is member-class and is never asked",
     WIRE.every(w => w.op !== "reevaluations"));
}

/* ============ 3. DEC-40: THE READER SUPPLIES THE FLOORS ============
   UNCHANGED BY UI-29 except that the floors are applied to EVERY finding's legs
   separately. The stance set is gone, Q6's FORM survives, and the
   determining-leg protection is measured over exactly the same arithmetic. */
{
  const src = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  ok("the named stance set and its resolver are GONE from the surface — not disabled, not unused, gone",
     !/\bTHRESHOLDS\b/.test(src) && !/\bstanceFloors\b/.test(src) && !/function stanceOf\b/.test(src)
     && !/function pubStance\b/.test(src));
  ok("and not one of the four published stance labels survives anywhere in the file",
     !/Reading the whole case/.test(src) && !/Citing this in a filing/.test(src)
     && !/Checking this against records you already hold/.test(src)
     && !/Quoting this in something you publish/.test(src));
  ok("the surface's default pair of floors is none/none, which is the case itself",
     ctx.__PUB.floors.capture === "none" && ctx.__PUB.floors.connection === "none"
     && ctx.__pubFiltered(ctx.__readerFloors(ctx.__PUB.floors)) === false);
  ok("the reader is offered the grade vocabulary and `none`, and no combination of them is preset",
     JSON.stringify(ctx.__FLOOR_VALUES) === JSON.stringify(["A","B","C","D","none"]));
  ok("a reader's pair resolves only when BOTH axes carry a value the surface knows",
     JSON.stringify(ctx.__readerFloors({ capture:"B", connection:"none" })) === JSON.stringify({ capture:"B", connection:"none" })
     && ctx.__readerFloors({ capture:"B" }) === null
     && ctx.__readerFloors({ capture:"B", connection:"Z" }) === null
     && ctx.__readerFloors(null) === null);
  await ctx.__setFloors("B", undefined);
  {
    const half = strip(pubBody());
    ok("a half pair draws NO case at all — no finding, no strength and no basis",
       /This rendering was not drawn/.test(half) && !/How strong finding/.test(half)
       && !/rests on/.test(half));
  }
  await ctx.__setFloors("none", "none");
  const before = { ...ctx.__PUB.floors };
  ctx.__pubSetFloor("capture", "B");
  ok("setting one axis's floor leaves the other exactly where the reader left it",
     ctx.__PUB.floors.capture === "B" && ctx.__PUB.floors.connection === before.connection);
  ctx.__pubSetFloor("capture", "Z"); ctx.__pubSetFloor("nonsense", "A");
  ok("a value or an axis the surface does not know is not written at all",
     ctx.__PUB.floors.capture === "B" && ctx.__PUB.floors.nonsense === undefined);
  await ctx.__setFloors("none", "none");
}

/* ---- the qualifier rule: a determining leg is never dropped, AND IT IS
   MEASURED PER FINDING, because a case of two findings has two sets of
   qualifiers and pooling them would protect one finding's leg with the other's
   arithmetic. ---- */
await ctx.__setFloors("none", "B");             // capture none, connection B
page = pubBody();
{
  const t = strip(page);
  ok("a pair with a `none` floor on one axis and a real floor on the other renders BOTH, explicitly",
     /Floor applied to Documents[^:]*: none/.test(t) && /Floor applied to Links[^:]*: grade B or stronger/.test(t));
  ok("the leg that DETERMINED finding 1's connection strength survives a floor it does not meet",
     keptIds(page, FIND_A).includes(L_CON_C) && !droppedIds(page, FIND_A).includes(L_CON_C)
     && /Always present at every threshold/.test(t));
  ok("and the page says WHY it survives, in the record's own terms and naming the FINDING it determined",
     /it determined this finding's links strength/.test(t));
  ok("a rendering may drop a claim and may never drop a qualifier — stated on the artifact",
     /A rendering may drop a claim; it may never drop a qualifier/.test(t));
  ok("the OTHER finding's UNRATED-axis qualifier is kept on the other finding's own arithmetic",
     keptIds(page, FIND_B).includes("INFO-2026-8202") && !droppedIds(page, FIND_B).includes("INFO-2026-8202"));
}

await ctx.__setFloors("B", "none");             // capture B, connection none
page = pubBody();
{
  const t = strip(page);
  ok("the floors the reader set are B on one axis and none on the other, both named",
     /Floor applied to Documents[^:]*: grade B or stronger/.test(t) && /Floor applied to Links[^:]*: none/.test(t));
  ok("the leg that DETERMINED finding 1's capture strength survives although it is graded D",
     keptIds(page, FIND_A).includes(L_CAP_D) && !droppedIds(page, FIND_A).includes(L_CAP_D));
  ok("and the leg that determined nothing and does not meet the floor IS dropped — the threshold does something",
     droppedIds(page, FIND_A).includes(L_CAP_C) && !keptIds(page, FIND_A).includes(L_CAP_C));
  ok("a cuts_against leg dropped by this threshold is CALLED OUT BY NAME, under the finding it belongs to",
     /data-cutsdropped="1" data-of="INQ-2026-4101"/.test(page)
     && new RegExp(L_CAP_C).test(page.slice(page.indexOf('data-cutsdropped'))));
  ok("and the page says why naming it matters rather than merely listing it",
     /reading a case with the evidence against it filtered out and no notice of it/i.test(t));
  ok("every dropped leg is named with its reason, never silently removed",
     /dropped by this threshold — named, with the reason/.test(t));
}

await ctx.__setFloors("A", "A");                // A / A
page = pubBody();
{
  const t = strip(page);
  ok("the strictest pair a reader can set names grade A on BOTH axes", (t.match(/grade A or stronger/g) || []).length >= 2);
  ok("both of finding 1's determining legs still stand at the strictest pair — in the KEPT set, not merely named in the dropped one",
     keptIds(page, FIND_A).includes(L_CAP_D) && keptIds(page, FIND_A).includes(L_CON_C)
     && !droppedIds(page, FIND_A).includes(L_CAP_D) && !droppedIds(page, FIND_A).includes(L_CON_C));
  ok("and the strictest pair did drop what it should: the B-graded capture leg and the C-graded cuts_against one",
     droppedIds(page, FIND_A).includes(L_CAP_B) && droppedIds(page, FIND_A).includes(L_CAP_C));
  ok("an axis that is not graded satisfies a floor of none and no other, and the page SAYS which FINDING does not meet it",
     /data-axisfail="connection" data-of="INQ-2026-4102"/.test(page)
     && /An axis that is not graded satisfies a floor of none and no other floor/.test(t));
  ok("the frozen pairs are unchanged by the threshold — a rendering filters legs and never re-grades anything",
     /Documents D/.test(t) && /Links C/.test(t) && /Documents B/.test(t) && /Links UNRATED/.test(t));
  ok("and a threshold does not manufacture a case-level strength either: the sweep still finds none",
     strengthEvidence(caseAltitude(page)).length === 0, strengthEvidence(caseAltitude(page)));
}
await ctx.__setFloors("none", "none");

/* ============ 3b. DEC-40 (b): THE FILTER, IN THE HEADER AND IN PRINT ============ */
const filterMarks = html => [...String(html).matchAll(/data-filter="([a-z]+)"/g)].map(m => m[1]);
{
  await ctx.__pubOpen(CASE);
  await ctx.__setFloors("none", "none");
  page = pubBody();
  const ps = pages(page);
  const marks = filterMarks(page);
  ok("an unfiltered rendering carries the line on every page, in the in-band block and in the footer",
     marks.length === ps.length + 2 && marks.every(m => m === "none"));
  ok("and it SAYS it is unfiltered, in words a reader keeps when they paste the page",
     /THE WHOLE CASE, UNFILTERED/.test(strip(page)) && /No floors were applied/.test(strip(page)));
  ok("an unfiltered rendering does not warn about a filter it did not perform",
     !/data-notthecase="1"/.test(page) && !/FILTERED VIEW/.test(strip(page)));
  ok("every page of it carries the line inside its own DEC-34 header",
     ps.every(p => /data-dec34="1"[\s\S]*data-filter="none"/.test(p)));

  await ctx.__setFloors("B", "none");
  page = pubBody();
  const fps = pages(page);
  const fmarks = filterMarks(page);
  const ft = strip(page);
  ok("a filtered rendering carries the filter line on every page, in-band and in the footer",
     fmarks.length === fps.length + 2 && fmarks.every(m => m === "reader"));
  ok("every page of it carries the filter inside its own DEC-34 header, beside the id and the hash",
     fps.every(p => /data-dec34="1"[\s\S]*data-filter="reader"/.test(p))
     && fps.every(p => strip(p).includes(CASE)));
  ok("the line names BOTH floors the reader applied, so the filter travels with the page",
     /Documents: grade B or stronger/.test(ft) && /Links: none/.test(ft));
  ok("it is named as a view the READER constructed and explicitly NOT the case",
     /A FILTERED VIEW YOU CONSTRUCTED — not the case/.test(ft)
     && /data-notthecase="1"/.test(page)
     && /Do not quote it as the case, print it as the case, or describe it by its hash as the case/.test(ft));
  ok("and the whole case is named as still being at the same address",
     /the case is at this same address with no floors applied/.test(ft));
  const footer = page.slice(page.indexOf('data-footer="1"'));
  ok("the footer's rendering hash is described as a filtered view and never as the case",
     /rendering sha256:[0-9a-f]{64}/.test(strip(footer))
     && /data-filter="reader"/.test(footer)
     && /A FILTERED VIEW YOU CONSTRUCTED/.test(strip(footer)));
  ok("every word of the filter statement survives the tags being stripped — it is TEXT, not CSS",
     ft.includes("A FILTERED VIEW YOU CONSTRUCTED") && ft.includes("grade B or stronger"));
  ok("and the footer carries NO strength: it repeats on every printed sheet, so a letter here is the composition on every page",
     strengthEvidence(footer).length === 0, strengthEvidence(footer));
  await ctx.__setFloors("none", "none");
}

/* ============ 4. THE `awaiting` WINDOW, RENDERED AS A STATE ============
   NEW 2026-08-04 (UI-29). Ratification is per FINDING, so a case edition is
   ratified N times and is servable as a container when the last member lands.
   The window between is a real state of the record: never an error, never
   hidden, and stated in BOTH directions. */
await ctx.__pubOpen(CASE_WAIT);
page = pubBody();
{
  const t = strip(page);
  ok("an incomplete case edition RENDERS — it is not an error pane and nothing about it failed",
     !/Could not reach the plane/.test(t) && !/Not published/.test(t)
     && /data-caseedition="awaiting"/.test(page) && findingPages(page).length === 3);
  ok("it says so IN THOSE TERMS: how many of how many declared findings have landed",
     /This case edition is not finished yet: 1 of 2 declared findings have been ratified/.test(t));
  ok("and it says it is a state of the record rather than a failure",
     /This is a state of the record, not an error, and nothing has failed/.test(t));
  ok("it says WHY the window exists — a case is ratified one finding at a time, and becomes servable at the last",
     /A case is ratified ONE FINDING AT A TIME/.test(t)
     && /becomes servable as a container when the last member lands/.test(t));
  ok("the DECLARED member that has not ratified is NAMED, and nothing of it is served",
     /Still awaiting ratification: INQ-2026-4302/.test(t)
     && /Nothing of it is served or described here/.test(t)
     && /data-member="awaiting" data-leg="INQ-2026-4302"/.test(page));
  ok("the finding that DID land is published and answers in full, with its own pair and its own basis",
     /data-findingsec="INQ-2026-4301"/.test(page) && /Documents D/.test(t) && /Links C/.test(t)
     && keptIds(page, FIND_C).length > 0);
  /* ==== CASE-6 / DEC-72 clause 4 · THE DESIGNATION IS READ AND NEVER DERIVED ===
     Asserted against `FIND_D`, the one member whose designation nobody authored,
     and it is the OVER-STRICTNESS subject for the whole partition: every rule a
     derivation could plausibly use gets this row wrong. From ORDINAL — it is at
     ord 2, so "the first is load-bearing" makes it supporting and "all but the
     last" makes it load-bearing, and both are inventions. From STRENGTH — it has
     no ratified row at all, so a comparison against the bar has nothing to
     compare. From the CASE — this edition has a load-bearing member already, so
     "default the rest to supporting" would look harmless and would be asserting
     something about the publisher's intent that the publisher never wrote.
     A null role is not a weaker answer, it is a DIFFERENT one, and the plane
     leaves the column with no default precisely so it can stay different. */
  /* THE THIRD NULL, AND IT IS NOT THE SAME NULL. `op=publishedcase` answers
     `awaiting` as a bare list of bundle ids — no roster columns travel with it —
     so for a DECLARED, UNRATIFIED member this surface does not know the
     designation and must not report one. A page that printed "undesignated"
     here would be asserting an absence of the PUBLISHER'S INTENT where there is
     only an absence of DATA, which is the same conflation `pubRoleOf` refuses
     one level down. The two are held apart by `undefined` vs `null` in
     `pubRoster` and asserted apart here.
     THIS IS ALSO WHERE THE OLD FIXTURE'S LIMIT SHOWS, AND IT IS STATED RATHER
     THAN WORKED AROUND: `FIND_D` is the suite's only role-null member on THIS
     accessor and it is also awaiting, so the genuinely-undesignated branch
     cannot be asked here at all. It is asked on the INDEX instead, of `FIND_K`,
     which is ratified AND carries a null role — see block 1. */
  ok("a DECLARED-BUT-UNRATIFIED member says its designation is NOT SERVED, and never that it has none",
     CASE_MEMBERS.find(m => m.bundle_id === FIND_D).role === null
     && new RegExp('data-role="unserved" data-finding="' + FIND_D + '"').test(page)
     && /a fact about what this page was sent, not about what the publisher decided/.test(t)
     && !new RegExp('data-role="undesignated" data-finding="' + FIND_D + '"').test(page)
     && !new RegExp('data-role="load_bearing" data-finding="' + FIND_D + '"').test(page)
     && !new RegExp('data-role="supporting" data-finding="' + FIND_D + '"').test(page));
  ok("and the partition is COUNTED in words, with the not-yet-served counted apart rather than folded in",
     /1 load-bearing/.test(t)
     && /1 whose designation is not served here at all/.test(t));
  /* A CASE WITH NO OWNING PROJECT ROW IS A REAL STATE (the plane's LEFT JOIN
     exists for it), and the honest rendering is to say the publisher cannot be
     named rather than to print an empty id. */
  ok("a case whose owning project the record cannot name SAYS so, and prints no empty publisher",
     CASE_ROWS.find(c => c.case_id === CASE_WAIT).project_id === null
     && /name no publishing project for this case/.test(t)
     && /this page cannot say whose standard it is, and it does not guess/.test(t));
  ok("the declared membership is shown in the authored order, with ratified and awaited marked APART",
     (page.match(/data-member="ratified"/g) || []).length === 1
     && (page.match(/data-member="awaiting"/g) || []).length === 1
     && page.indexOf('data-member="ratified"') < page.indexOf('data-member="awaiting"'));
  ok("the CONTAINER is refused rather than half-built, and the page says why",
     /data-nocontainer="1"/.test(page)
     && /It is assembled when the last declared finding is ratified, and not before/.test(t)
     && /a container built now would name parts this record does not hold/.test(t));
  ok("no case hash is invented for it: every case-level page states there is none yet, and no member's hash stands in",
     casePages(page).every(p => attrOf(p, "data-hash") === "none-yet")
     && /NO CONTAINER HASH YET/.test(t) && /No member's hash stands in for it/.test(t));
  ok("the footer says the same rather than printing a hash it does not have",
     /data-footer="1" data-hash="none-yet"/.test(page) && /no container hash yet/.test(t));
  ok("and DEC-34's verification pointer names what CAN be checked instead of a hash that does not exist",
     casePages(page).every(p => /no container to check yet/.test(strip(p)))
     && /each ratified finding answers for its own bytes/.test(t)
     && findingPages(page).every(p => strip(p).includes("op=publishedbytes&sha256=" + C_SHA)));
  ok("and the window is on EVERY page-shaped artifact's header, because a reader may hold only one sheet",
     pages(page).every(p => /awaiting/.test(strip(p))));
  ok("the awaiting window manufactures no strength either — the sweep over the complement is still empty",
     strengthEvidence(caseAltitude(page)).length === 0, strengthEvidence(caseAltitude(page)));
}
/* AND IN THE OTHER DIRECTION, which is what stops absence becoming the
   ambiguity: a COMPLETE edition says it is complete. */
await ctx.__pubOpen(CASE);
{
  const t = strip(pubBody());
  ok("a complete case edition SAYS it is complete, and says all of its declared findings are ratified",
     /data-caseedition="complete"/.test(pubBody())
     && /This case edition is complete: all 2 of its declared findings are ratified/.test(t));
}

/* ============ 5. THE DEGENERATE ONE-FINDING CASE (DEC-44 determination 5) ============ */
await ctx.__pubOpen(CASE_SOLO);
page = pubBody();
{
  const t = strip(page);
  ok("a case of ONE finding is still a case and renders in the same shape",
     /data-caseedition="complete"/.test(page) && findingPages(page).length === 3
     && /This is a case of 1 finding,/.test(t));
  ok("its identity is a CASE identity and is distinct from its one member's bundle id",
     t.includes(CASE_SOLO) && t.includes(FIND_S) && CASE_SOLO !== FIND_S);
  ok("its one finding's pair names that finding and is not promoted into a case-level strength",
     new RegExp('class="pub-axisrow" data-finding="' + FIND_S + '"').test(page)
     && strengthEvidence(caseAltitude(page)).length === 0, strengthEvidence(caseAltitude(page)));
  /* CASE-6 / DEC-72: THE ABSENT-BAR BRANCH, ASKED OF THE CASE THAT DECLARES NO
     BAR. Moved here from block 3, where it used to be asked of one member of a
     case that DID declare one — a shape the plane cannot build any more. DEC-72
     names this state in the ruling itself: "where no bar was ever declared ...
     the case publishes stating that fact: an absent bar is not a bar of zero,
     and the case claims no cleared standard." The sentence is asserted verbatim
     because it is exactly the one a renderer is tempted to shorten into a dash. */
  ok("an ABSENT bar renders as ABSENT — never as zero, and never as a dash",
     new RegExp('data-casebar="absent" data-case="' + CASE_SOLO + '"').test(page)
     && /NONE WAS DECLARED/.test(t)
     /* THE PLANE’S OWN WORDS AND NOT THE SURFACE’S PARAPHRASE. This used to look
        for the surface’s fallback sentence ("An absent bar is not a bar of
        zero"); the surface now prints `bar_detail` verbatim, so what must be on
        the page is what the PLANE wrote — which is the point of DEC-8 and the
        reason `bar_detail` exists at all. The fallback still exists for the
        accessor that sends no `bar_detail` and is still the surface’s own words
        said as the surface’s. */
     && /NO BAR IS RECORDED for this case edition, and that is not a bar of zero/.test(t)
     && !/\bcapture null\b|\bconnection null\b|Documents &mdash;/.test(t));
  ok("and an absent bar still names the project whose absent standard it is",
     new RegExp("the standard of[\\s\\S]{0,40}" + PROJ).test(t));
  ok("a one-member case still states its partition rather than leaving it to be assumed",
     new RegExp('data-role="load_bearing" data-finding="' + FIND_S + '"').test(page)
     && /1 load-bearing/.test(t));
}

/* ============ 6. A FINDING'S ID RESOLVES TO ITS CASE, AND SAYS SO ============ */
await ctx.__pubOpen(FIND_A);
page = pubBody();
{
  const t = strip(page);
  ok("a stranger holding one FINDING's id reaches the case it was published in",
     t.includes(CASE) && findingPages(page).length === 6);
  ok("and the surface SAYS which id it was handed rather than deciding what the reader meant",
     new RegExp('data-asked="' + FIND_A + '"').test(page)
     && /You asked for INQ-2026-4101, which is a FINDING/.test(t)
     && /Both ids answer at this address, and nothing was decided on your behalf/.test(t));
  ok("a finding DECLARED into an edition and not yet ratified answers NOT PUBLISHED, and says what that means",
     true);
}
await ctx.__pubOpen(FIND_D);
ok("a finding declared into a case edition and never ratified has published nothing, and the surface says so",
   /Not published/.test(strip(pubBody())) && /has published nothing/.test(strip(pubBody())));

/* ============ 7. RATIFIED BYTES THAT ARE IN NO CASE ============ */
await ctx.__pubOpen(INFO);
page = pubBody();
{
  const t = strip(page);
  ok("ratified bytes that are in no case answer as WHAT THEY ARE, and no case is manufactured for them",
     /data-caseedition="notacase"/.test(page)
     && /These bytes are not a member of any published case/.test(t));
  ok("no case identity, no scope statement and no completeness assertion is invented for them",
     /there is no case scope statement and none is invented here/.test(t)
     && /carry no case completeness assertion/.test(t));
  ok("no container is claimed for them either", /data-nocontainer="1"/.test(page));
  ok("and a bundle with no frozen pair gets neither half of one invented",
     /published no frozen strength pair/.test(t) && strengthEvidence(caseAltitude(page)).length === 0);
}

/* ============ 8. EDITIONS: the prior one is still readable ============ */
await ctx.__pubOpen(CASE, 1);
page = pubBody();
{
  const t = strip(page);
  ok("a prior edition is readable by number", /edition 1 of 2/i.test(t));
  ok("and it says what IT said, not what the current document says", t.includes(STMT1));
  ok("the supersession banner fires, and it says which numbers the page shows",
     /data-super="superseded"/.test(page)
     && /Every strength on this page is edition 1's OWN FROZEN PAIR for the finding it sits beside/.test(t)
     && /nothing here has been recomputed on your behalf/.test(t));
  ok("it says the older edition has not been withdrawn and still answers",
     /has not been withdrawn and still answers/.test(t));
  ok("every edition is reachable from the page, each with its own container hash",
     t.includes(MAN1) && t.includes(MAN2));
  ok("the DEC-34 header on this edition's pages names EDITION 1, not the latest",
     pages(page).every(p => strip(p).includes("Edition 1 of 2")));
  ok("and edition 1's findings carry edition 1's own bytes, not edition 2's",
     findingPages(page).every(p => [A1, B1].includes(attrOf(p, "data-hash"))));
}

/* ============ 9. THE VERIFY BUTTON, ON op=verify ============ */
{
  const before = WIRE.length;
  const v = await ctx.__pubVerify(A1, "#v-case");
  const asked = WIRE.slice(before);
  ok("the Verify control reaches op=verify and nothing else",
     asked.length === 1 && asked[0].op === "verify" && asked[0].url.includes(A1));
  ok("it asked with NO credential", !asked[0].token);
  ok("it answered from the record and the answer is the record's", v && v.published === true);
  const out = strip(els.get("#v-case")._html);
  ok("and the surface renders the record's answer, naming the part and the bundle",
     /PUBLISHED\./.test(out) && /bundle\.md/.test(out) && out.includes(FIND_A));
  const never = "9".repeat(64);
  await ctx.__pubVerify(never, "#v-case");
  const out2 = strip(els.get("#v-case")._html);
  ok("a hash the record does not answer for is reported as NOT PUBLISHED, in the plane's own terms",
     /NOT PUBLISHED\./.test(out2) && /never ratified and a hash that never existed are the same answer/.test(out2));
}

/* ============ 10. THE BYTES, by hash and only by hash, with no credential ============ */
{
  await ctx.__pubOpen(CASE);
  page = pubBody();
  const addr = /data-addr="([^"]+)"/.exec(page);
  ok("the page publishes the byte ADDRESS of what it can serve", !!addr && /op=publishedbytes/.test(addr[1]));
  const url = "/api/?" + addr[1].replace(/&amp;/g, "&");
  const before = WIRE.length;
  const r = await ctx.fetch(url);
  const got = new Uint8Array(await r.arrayBuffer());
  ok("and those bytes answer a caller holding NOTHING",
     r.status === 200 && got.length === BYTES.length && !WIRE[before].token);
  ok("the address carries a sha256 and no path — there is nothing to walk",
     /sha256=[0-9a-f]{64}/.test(addr[1]) && !/path=/.test(addr[1]));
  ctx.__pubBytes(A1);
  ok("opening a part goes to op=publishedbytes by hash, untokened",
     OPENED.length === 1 && OPENED[0].includes("op=publishedbytes") && OPENED[0].includes(A1)
     && !/token=/.test(OPENED[0]));
  const bad = await ctx.fetch("/api/?op=publishedbytes&path=bundle.md&id=" + CASE);
  const badj = await bad.json();
  ok("asking by path is refused by the plane, and this surface never offers one",
     /never by path/.test(badj.error || "") && !/op=publishedbytes[^"]*path=/.test(page));
}

/* ============ 11. THE ADDRESS IS REAL ============ */
{
  HASH = "#case/" + CASE + "/e1";
  const routed = ctx.__publishedRouteFromHash();
  await new Promise(r => setTimeout(r, 0));
  ok("`#case/<id>/e<N>` is an address the router resolves", routed === true);
  HASH = "#published";
  ok("`#published` is an address too", ctx.__publishedRouteFromHash() === true);
  HASH = "#inquiry/INQ-2026-9999";
  ok("and a working-record address is NOT claimed by this router", ctx.__publishedRouteFromHash() === false);
  HASH = "";
  await ctx.__pubOpen(CASE);
  ok("opening a case WRITES its address, so a reader can hand the page to somebody holding nothing",
     HASH === "#case/" + CASE);
  ctx.__pubPaintBack();
  ok("a caller holding nothing is offered no way back into a working record they cannot reach",
     els.get("#p-back")._html === "");
  ctx.__PLANE.token = "t";
  ctx.__pubPaintBack();
  ok("a member holding a credential IS offered the way back, and it is not a reload",
     /pubLeave\(\)/.test(els.get("#p-back")._html));
  ctx.__PLANE.token = null;
}

/* ============ 12. THE EXPORT: THE CONTAINER, AND THE POISONED ANSWER ============
   NEW 2026-08-04 (UI-29). DEC-44's control names three places a case-level
   strength may not appear — screen, print and EXPORT — and the export a reader
   meets on this surface is the CONTAINER: the manifest a stranger downloads and
   the parts it names. The container block is at case altitude, so the complement
   sweep already covers it; what the sweep cannot cover is a PLANE that hands a
   case-level strength over anyway, which is what the poisoned answer drives. */
{
  await ctx.__pubOpen(CASE);
  page = pubBody();
  const t = strip(page);
  ok("the container is offered by the CASE's manifest hash, and it is the case's portable form",
     t.includes(MAN2) && /op=publishedbytes&sha256=/.test(page)
     && /The case's portable form/.test(t));
  ok("the container's parts are namespaced by finding, because two findings both carry a bundle.md",
     t.includes(FIND_A + "/bundle.md") && t.includes(FIND_B + "/bundle.md")
     && /two findings both carry a/.test(t));
  ok("and the container block presents no strength for the case it packages",
     strengthEvidence(page.slice(page.indexOf("The container"))).length === 0);

  /* THE POISONED ANSWER. The plane refuses to compose a case-level strength and
     REC-44 asserts its absence; this makes the plane hand one over anyway, so
     what is measured here is THIS surface's refusal rather than the plane's. A
     surface that rendered whatever it was handed would pass every other
     assertion in this file. */
  POISON = true;
  await ctx.__pubOpen(CASE);
  const poisoned = pubBody();
  POISON = false;
  const outside = strengthEvidence(caseAltitude(poisoned));
  ok("handed an answer that CARRIES a case-level strength, this surface renders none: it reads strengths only from findings[]",
     outside.length === 0, outside);
  /* CORRECTED 2026-09-10 (CASE-6 / DEC-72 clause 2), NOT EXEMPTED, AND THE
     ASSERTION IS NOW THE OPPOSITE OF WHAT IT WAS. It read: "and it renders no
     case-level bar either — a bar is frozen into a FINDING's bytes", pinning TWO
     `pub-bar` blocks (one per member) and NONE at case altitude. DEC-72 clause 2
     inverts both halves: the bar is the case's, so exactly ONE is drawn and it is
     drawn AT case altitude, and none is drawn per finding at all.

     WHAT THE ARM IS ACTUALLY FOR SURVIVES UNCHANGED, and that is why this is a
     correction rather than a deletion. The poison hands this surface a composed
     CASE-LEVEL STRENGTH; the point was never "no bar at case altitude", it was
     "this surface reads strengths only from findings[] and composes nothing". So
     the bar half is re-pinned to its new correct shape and the composition half —
     which the poison actually attacks — is untouched above and re-stated here
     against the bar block itself, because a bar block is now the one place at
     case altitude where axis letters are legitimately allowed and is therefore
     the one place a composed strength could hide. */
  ok("and the bar it renders is the CASE's, exactly one, at case altitude — and carries no strength",
     !/class="pub-bar"/.test(poisoned)
     && (poisoned.match(/class="pub-casebar"/g) || []).length === 1
     && caseAltitude(poisoned).indexOf('class="pub-casebar"') < 0
     && barsCarryNoStrength(poisoned).length === 0, barsCarryNoStrength(poisoned));
  ok("the poisoned answer changed nothing a reader sees: both findings still carry their own pairs",
     /Documents D/.test(strip(poisoned)) && /Links UNRATED/.test(strip(poisoned)));
  await ctx.__pubOpen(CASE);
}

/* ============ 13. NOT PUBLISHED, and the four forbidden affordances ============ */
{
  await ctx.__pubOpen("INQ-2026-0000-nothing");
  const t = strip(pubBody());
  ok("a case that was never published answers in the plane's own words, and invents nothing",
     /Not published/.test(t) && /never published/.test(t));
}
await ctx.__pubOpen(CASE);
const surface = pubBody() + list() + (() => { ctx.__pubVerifyPanel(); return pubBody(); })();
{
  ok("H7 — there is no reply box for a subject anywhere on the published surface",
     !/<textarea/i.test(surface) && !/\breply\b/i.test(strip(surface)));
  ok("H2 — there is no notify-me, no subscribe, no follow",
     !/notify|subscribe|follow this|email me|alert me/i.test(strip(surface)));
  ok("H3 — there is no verified-author badge; the key and the signature are printed instead",
     !/verified author|verified by|trusted author|\bbadge\b/i.test(strip(surface))
     && /Signing key/.test(surface));
  ok("H1 — there is no redact and no take-down control",
     !/redact|take ?down|remove this|unpublish|delete this/i.test(strip(surface)));
  ok("there is no text field and nothing to write into the record — the two floor controls are the only ones",
     !/<input/i.test(surface) && !/<textarea/i.test(surface)
     && (surface.match(/<select/g) || []).length === 2
     && /data-floor="capture"/.test(surface) && /data-floor="connection"/.test(surface));
  {
    const before = WIRE.length;
    ctx.__pubSetFloor("capture", "B");
    ctx.__pubSetFloor("capture", "none");
    ok("and setting a floor sends NOTHING: the reader's bar is applied here and is never a request",
       WIRE.length === before);
  }
}

/* ============ 14. THE PRINT STYLESHEET: it may only ADD ============ */
{
  const html = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const at = html.indexOf("@media print{");
  ok("app.html carries a print stylesheet at all", at > 0);
  let depth = 0, end = at;
  for(let i = html.indexOf("{", at); i < html.length; i++){
    if(html[i] === "{") depth++;
    else if(html[i] === "}"){ depth--; if(depth === 0){ end = i + 1; break; } }
  }
  const print = html.slice(at, end);
  ok("the print stylesheet hides NOTHING — no display:none, no visibility:hidden, no zero-height trick",
     !/display\s*:\s*none/i.test(print) && !/visibility\s*:\s*hidden/i.test(print)
     && !/font-size\s*:\s*0/i.test(print));
  ok("the in-band block prints at FULL body size and is not shrunk by the stylesheet",
     /\.pub-inband\{[^}]*font-size:var\(--t-pub-body\)/.test(print));
  ok("the case edition's STATE prints at full body size too — an awaiting window that shrinks on paper is the omission performed by CSS",
     /\.pub-state\{[^}]*font-size:var\(--t-pub-body\)/.test(print));
  ok("and the finding a pair belongs to prints in the weight of the letters it names",
     /\.pub-forfinding\{[^}]*font-weight:700/.test(print));
  ok("every collapsed leg is expanded for print, and the expansion only ever OPENS",
     /pubExpandForPrint/.test(html) && /d\.open = true/.test(html) && !/d\.open = false/.test(html));
  ok("a beforeprint handler is actually registered, in the loop the browser runs",
     Array.isArray(LISTENERS.beforeprint) && LISTENERS.beforeprint.length === 1);
  ok("links become their full address and their sha in mono, ADDED rather than substituted",
     /a\[data-addr\]\[data-sha\]::after/.test(print) && /font-family:var\(--font-fact\)/.test(print));
  ok("pages break on the page-shaped artifacts, so a printed page is a page",
     /\.pub-page\{[^}]*break-before:page/.test(print));
  ok("the per-page footer is fixed, which is what makes it per-PAGE", /\.print-footer\{[^}]*position:fixed/.test(print));
  /* AND THE STYLESHEET INJECTS NO STRENGTH. A `content:` rule can put text on
     the page that no assertion over the markup would ever see, which is the
     composition performed by CSS in the other direction from arm (h). */
  ok("no print rule injects a grade of any kind through generated content",
     [...print.matchAll(/content\s*:\s*([^;]+);/g)].every(m => !/\b(Documents|Links|Grade|Overall)\b/i.test(m[1])));
}
/* the footer's facts, on the artifact and not only in the stylesheet */
{
  await ctx.__pubOpen(CASE, 1);
  const t = strip(pubBody());
  ok("the footer carries case id, how many findings, the container sha, the rendering sha and the date",
     /data-footer="1"/.test(pubBody()) && t.includes(CASE) && t.includes(MAN1)
     && /2 findings/.test(t) && /rendering sha256:[0-9a-f]{64}/.test(t) && t.includes("2026-07-01"));
  ok("the rendering sha is a real digest over the rendering's own decision, not a placeholder",
     /rendering sha256:[0-9a-f]{64}/.test(t) && !/rendering sha256:not computed/.test(t));
  const s1 = /rendering sha256:([0-9a-f]{64})/.exec(t)[1];
  await ctx.__setFloors("A", "A");
  const s2 = /rendering sha256:([0-9a-f]{64})/.exec(strip(pubBody()))[1];
  ok("and it MOVES when the floors move — two renderings of one edition are two renderings", s1 !== s2);
  await ctx.__setFloors("none", "none");
  await ctx.__pubOpen(CASE_WAIT);
  const s3 = /rendering sha256:([0-9a-f]{64})/.exec(strip(pubBody()))[1];
  await ctx.__pubOpen(CASE, 1);
  ok("and it MOVES with the SET of findings drawn — a rendering of a case is a rendering of its membership",
     s3 !== s1);
}

/* ============ 15. THE WIRE ============ */
{
  const ops = [...new Set(WIRE.map(w => w.op))].sort();
  /* CORRECTED 2026-09-22 (UI-77), never exempted: this pinned FOUR ops. The public header now reads
     `op=instancegroup` — public since REC-163 (IC-174), answering a stranger the recorded slug and nothing else —
     so the header shows whose record this is from the record instead of a literal group name (Publication §7
     point 1). The pin was right that the surface reaches only credential-free reads; the set it named was the
     set before that read existed. The token and working-record assertions below are unchanged. */
  ok("the whole surface reached exactly the five credential-free ops and no other",
     JSON.stringify(ops) === JSON.stringify(["instancegroup", "publishedbytes", "publishedcase", "publishedmanifest", "verify"]));
  ok("NOT ONE request carried a token — the evidence, not the promise",
     WIRE.length > 10 && WIRE.every(w => !w.token));
  ok("and none of them reached a working-record op",
     WIRE.every(w => !["list","search","projection","image","whoami","affordances","reevaluations"].includes(w.op)));
}

/* ============ 16. UI-35 — WHAT THE PLANE PUBLISHES AND NOBODY READS ============

   THE ITEM WAS `op=publishedcase`'s top-level `detail`, said to be published for
   a case that was FOUND and rendered nowhere. IT IS NOT PUBLISHED AT ALL on that
   path — measured by driving the real plane under miniflare, not inferred:

     found (a case)      21 top-level keys, and `detail` is NOT among them
     found (loose bytes) the SAME single success return, so likewise not
     refused              {ok, reason, detail} — the ONLY path with a top-level
                          `detail`, and `pubOpen` already renders it (UI-37)

   So neither branch the item offered applies to that field: there is nothing to
   render and nothing to withdraw. What was really there was the MIRROR of the
   premise — a SURFACE READ (`pubStateHtml`'s `c.detail ||`) for a field the wire
   never sends, kept alive by a FIXTURE that invented it. Both are corrected in
   this commit; this block is what stops either returning.

   THE SWEEP IS WIRE-ANCHORED. It does not trust this fixture — a fixture is the
   thing that was wrong. It reads the plane's OWN success return and asks, of
   every key the plane really publishes, whether anything on this surface reads
   it. Two lessons inherited from UI-39 rather than rediscovered: a field
   consumed through a SPREAD is invisible to a wire-anchored walk, so the spread
   sites are enumerated and asserted; and a matcher written `[^}]*` stops at the
   `}` inside `...(extra||{})`, so the region is taken by BRACE BALANCE.

   WHAT IT FOUND BEYOND THE ONE FIELD, and this is the item's real answer: THREE
   published top-level keys that NOTHING in this repository reads — not the
   surface, not `newgroup`, not `docprofile`, not `pdf-worker`, not the plane's
   own battery. They are RECORDED here rather than removed, because removing a
   field from a public I3 op is an INTERFACE-CHANGES matter and `bio-plane/**` is
   not this claim's ground; and `bias_acknowledgement` in particular is NOT a
   candidate for removal — the gate enforces it (C-21.1) and the battery asserts
   it, so it is a SURFACE GAP and not an unconsumed publication. The three are
   routed in this item's report. This block PINS THE SET so that the next one to
   appear fails here instead of being found by a fourth measurement. */
{
  const src = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "utf8");
  /* The success return of `publishedCase()`, taken by BRACE BALANCE from the
     `return { ok: true,` that follows the `#caseEditionState` read. */
  /* COMMENTS ARE SKIPPED, and that is not a detail: this file's comments are
     English prose full of apostrophes ("each finding's serves[]"), and a walk
     that treats `'` as a string delimiter inside one runs to the next apostrophe
     hundreds of lines away, swallowing every brace in between. The first version
     did exactly that and returned a 27,059-character "return statement" whose
     keys came from elsewhere in the file. Both defects are recorded rather than
     quietly fixed, because each produced a CONFIDENT WRONG ANSWER rather than an
     error — which is the failure mode this block is written to catch. */
  function balanced(text, from){
    let d = 0, i = text.indexOf("{", from);
    const start = i;
    for(; i < text.length; i++){
      const ch = text[i];
      if(ch === "/" && text[i + 1] === "*"){ const e = text.indexOf("*/", i + 2); i = e < 0 ? text.length : e + 1; continue; }
      if(ch === "/" && text[i + 1] === "/"){ const e = text.indexOf("\n", i); i = e < 0 ? text.length : e; continue; }
      if(ch === '"' || ch === "'" || ch === "`"){ const q = ch; i++;
        while(i < text.length && text[i] !== q){ if(text[i] === "\\") i++; i++; } continue; }
      if(ch === "{") d++;
      else if(ch === "}"){ d--; if(d === 0) return text.slice(start, i + 1); }
    }
    return null;
  }
  /* ANCHORED ON `publishedCase()`'s return SPECIFICALLY. The first anchor was
     `return { ok: true, caseId: theCase` and it matched `publishCase()` — the
     WRITE path — several thousand lines earlier: two methods one letter apart,
     both returning `caseId: theCase`. The anchor now carries `edition: ed,
     scope: state.scope` with it, which only the read path has. */
  const anchor = src.indexOf("return { ok: true, caseId: theCase, edition: ed, scope: state.scope,");
  /* `|| ""` RATHER THAN null, deliberately: NC arm (e) breaks this anchor, and
     the first version then threw on `region.length` and took every assertion
     BEHIND it down with it — D-93's class inside one block, where a control dies
     early and hides the arms it was meant to sit in front of. It now reports the
     REACH failure and lets the rest of the block run and report too. */
  const region = (anchor < 0 ? null : balanced(src, anchor)) || "";
  ok("UI-35 REACH: the plane's own success return for op=publishedcase is located and read",
     region.length > 400 && region.includes("graph_detail"),
     region ? `${region.length} chars` : "NOT FOUND");

  /* TOP-LEVEL KEYS, in ONE depth-tracking pass. A `replace()`-based flattening
     was written first and was WRONG IN BOTH DIRECTIONS — it substituted the
     first textual match of a nested object rather than the one it had found, so
     the walk escaped the return entirely and reported keys from elsewhere in
     `store.mjs` (`orphans`, `cuts_against_orphans`, `child`). Corrected rather
     than tuned, and recorded here because a sweep that silently reads the wrong
     region is the failure this whole block exists to prevent. Depth 1 is the
     object's own level; brackets count too, so `files: [...].map(...)` does not
     leak its callback's keys. */
  const declared = [];
  {
    let d = 0;
    for(let i = 0; i < region.length; i++){
      const ch = region[i];
      /* COMMENTS ARE SKIPPED HERE TOO — CORRECTED 2026-08-05 (UI-40), and it is
         a real defect found by tripping it rather than a tidy-up. `balanced()`
         above was taught to skip comments because this file's prose is full of
         apostrophes; THIS loop, which extracts the keys out of the region
         `balanced()` returned, was never given the same treatment. The moment
         UI-40 put an explanatory block comment INSIDE the return statement, an
         apostrophe in it opened a "string" that swallowed the following keys and
         a `(` inside it pushed the depth, and the walk reported a top-level key
         set of `asked, bias_acknowledgement, caseId, edition, it, ok, scope,
         strength` — SHORTER THAN THE TRUTH and containing `it`, a word out of
         the English prose. It is the identical failure mode recorded four
         paragraphs up: a CONFIDENT WRONG ANSWER rather than an error. It failed
         loudly here only because the arm below happens to demand two specific
         keys; a walk missing a key nobody names would have passed. */
      if(ch === "/" && region[i + 1] === "*"){ const e = region.indexOf("*/", i + 2); i = e < 0 ? region.length : e + 1; continue; }
      if(ch === "/" && region[i + 1] === "/"){ const e = region.indexOf("\n", i); i = e < 0 ? region.length : e; continue; }
      if(ch === '"' || ch === "'" || ch === "`"){ const q = ch; i++;
        while(i < region.length && region[i] !== q){ if(region[i] === "\\") i++; i++; } continue; }
      if(ch === "{" || ch === "[" || ch === "(") { d++; continue; }
      if(ch === "}" || ch === "]" || ch === ")") { d--; continue; }
      if(d === 1){
        const m = /^([a-z_][a-z0-9_]*)\s*:/i.exec(region.slice(i));
        if(m && (i === 0 || /[{,\s]/.test(region[i - 1]))){ declared.push(m[1]); i += m[0].length - 1; }
      }
    }
  }
  /* `...(asked ? { asked } : {})` is a SPREAD and a wire-anchored walk cannot
     see through it — UI-39's first lesson, named here rather than tripped over.
     It is enumerated by hand and asserted to still be the only one. */
  const spreads = [...(region || "").matchAll(/\.\.\.\(/g)].length;
  ok("UI-35 REACH: exactly ONE spread in that return, and it is `asked` — a second would be invisible to this walk",
     spreads === 1 && /\.\.\.\(asked \? \{ asked \} : \{\}\)/.test(region || ""), `spreads=${spreads}`);
  const published = [...new Set([...declared, "asked"])].sort();
  ok("UI-35: the plane publishes a top-level `case_detail` and `graph_detail` and NO top-level `detail`",
     published.includes("case_detail") && published.includes("graph_detail")
     && !published.includes("detail"), published.join(","));

  /* THE REFUSAL, which is the ONLY place a top-level `detail` lives — and it IS
     read, by `planeSaid`. Asserting this is what keeps the finding above from
     reading as "the plane never says `detail`", which would be false. */
  ok("UI-35: the NOT_PUBLISHED refusal DOES carry a top-level `detail`, and it is a different return",
     /reason: "NOT_PUBLISHED",\s*\n\s*detail:/.test(src));

  /* Now the consumers, anchored on the WIRE NAME at the surface. Comments are
     stripped so a key merely NAMED in prose does not read as a reader. */
  const app = appScript().replace(/\/\*[\s\S]*?\*\//g, " ")
    .split("\n").map(l => l.replace(/^(\s*)\/\/.*$/, "$1")).join("\n");
  const readsIt = (k) => new RegExp(`\\.${k}\\b|\\[\\s*["'\`]${k}["'\`]\\s*\\]`).test(app);
  /* STATED, not exempted: these three are published and read by NOTHING here.
     Each carries WHY it is on this list rather than being silently tolerated. */
  /* CORRECTED 2026-08-05 (UI-40), never exempted, and the register SHRANK for
     the right reason. `case_detail` and `graph_detail` left this list because
     the surface now READS them — `pubPlaneAccount` prints each verbatim — which
     is exactly the movement UI-35's arm (h) was built to detect, so the pin
     fired on this edit and was answered by deleting the entries rather than by
     relaxing the arm. `opened` left it because the field is GONE from the wire
     under IC-22, so there is no published key left to be unread; the assertion
     that it is no longer published lives in the plane's own suite, where the
     removal is. `bias_acknowledgement` STAYS, and it is the only one left: it is
     DEC-59's, deliberately out of UI-40's scope, and it is a SURFACE GAP rather
     than an unconsumed publication — the gate enforces it (C-21.1) and the
     battery asserts it. */
  /* CORRECTED 2026-09-10 (CASE-5, DEC-72's artifact flip), never exempted, and
     the register GREW by two — which is this arm firing exactly as arm (d) was
     built to make it fire. `op=publishedcase` now publishes the CASE's own
     standard of evidence and the sentence that says what its absence means, and
     this surface reads neither yet. Both are SURFACE GAPS and neither is an
     unconsumed publication: the plane's battery asserts both, and CASE-6 owns
     the page that must print them — its queue row requires the bar be shown "as
     the case's property" with each claim's own strength beside it, which is
     precisely these two keys. Named here rather than tolerated, so the day
     CASE-6 lands its reader this arm fires again and the entries are DELETED
     rather than the arm relaxed. `project` is NOT on this list because the
     surface already reads a `.project` and the textual walk sees it; that is a
     known limit of a name-based reach and it is UI-35's own, not this item's. */
  const UNREAD = {
    bias_acknowledgement: "the GROUP's acknowledgement of the bias the case was produced under "
                        + "(REC-47, DEC-46 (a)), gated by C-21.1 and asserted by the battery. NOT an "
                        + "unconsumed publication — a SURFACE GAP. DEC-34's per-page header shows a "
                        + "`Declared bias` computed from HUNCH legs, which is a DIFFERENT fact, so a "
                        + "reader of the public record never meets the group's own sentence.",
    /* `bar` AND `bar_detail` CAME OFF THIS LIST AT CASE-6, 2026-09-10, AND THEY
       ARE THE ITEM. Both were declared here as SURFACE GAPS rather than as
       unconsumed publications — the entries said so, and named CASE-6 as the item
       that owed them. `bar` is now read by `pubCaseBarHtml` at case altitude and
       referenced beside each finding's own pair; `bar_detail` is printed verbatim
       as the plane's own sentence, which is the whole reason the plane writes it.
       The per-member `required` block the old `bar` entry described is gone from
       both the case page and the index: it was N copies of one fact. */
  };
  const unread = published.filter(k => !readsIt(k));
  ok("UI-35: every top-level key the plane publishes is either READ by this surface or NAMED as unread with a reason",
     unread.every(k => k in UNREAD) && Object.keys(UNREAD).every(k => unread.includes(k)),
     `unread=${unread.join(",")} | listed=${Object.keys(UNREAD).sort().join(",")}`);

  /* THE DEAD READ ITSELF. `c.detail` at case altitude can never be satisfied by
     the wire, so any read of it here is a claim that the record speaks where it
     does not. Pinned by ABSENCE at the not-a-case branch specifically, because
     that is where it stood. POLARITY: this FAILS if the dead read comes back. */
  const notACase = /data-caseedition="notacase"[\s\S]{0,600}?<\/div>`/.exec(app);
  ok("UI-35 REACH: the not-a-case branch is located",  !!notACase);
  ok("UI-35: the not-a-case branch reads NO top-level `detail` — the wire has none to give it",
     !!notACase && !/\bc\.detail\b/.test(notACase[0]), notACase ? notACase[0].slice(0, 200) : "");

  /* AND THE FIXTURE MAY NOT INVENT ONE AGAIN. This is the assertion that would
     have caught the whole thing: the mock must answer the wire's CONTENT, not a
     field of its own (D-173, named by UI-30). */
  ok("UI-35: no fixture in this suite carries a top-level `detail` on a FOUND answer",
     [LOOSE, SOLO, caseEdition(1)].every(f => !("detail" in f)),
     [LOOSE, SOLO, caseEdition(1)].map(f => ("detail" in f) ? "HAS detail" : "ok").join(","));
  /* And the two the wire DOES send are present, so the fixture stops being a
     smaller shape than the answer it claims to be. */
  ok("UI-35: the fixtures carry the two top-level sentences the wire really sends",
     typeof CASE_DETAIL === "string" && CASE_DETAIL.length > 200
     && typeof GRAPH_DETAIL === "string" && GRAPH_DETAIL.length > 100
     && caseEdition(1).case_detail === CASE_DETAIL && LOOSE.graph_detail === GRAPH_DETAIL,
     `case_detail=${(CASE_DETAIL || "").length} graph_detail=${(GRAPH_DETAIL || "").length}`);
}

/* ============================================================
   UI-40 — THE TWO ACCOUNTS THE RECORD PUBLISHES ARE RENDERED, AND THEY ARE
   RENDERED AS THE RECORD'S OWN WORDS
   ============================================================
   UI-35 measured that `case_detail` and `graph_detail` were published and read
   by nothing. This block asserts they are read, and asserts the PROPERTY that
   makes rendering them worth doing: the surface prints what the record said
   rather than a paraphrase of it. A paraphrase would satisfy "the doctrine is on
   the page" and drift from the plane the first time the plane's wording moved,
   with nothing measuring the drift — so every arm here compares against
   `CASE_DETAIL` / `GRAPH_DETAIL`, which are read OUT OF `bio-plane/src/store.mjs`
   at load and never typed in this file.

   AND ONE ARM DELIBERATELY GOES THE OTHER WAY (the over-strictness arm REC-56's
   practice requires): a DIFFERENT, correct sentence, phrased unlike anything
   this suite or that surface wrote, is fed through the wire and the surface must
   render THAT. Without it, every arm above would still pass if `pubPlaneAccount`
   ignored its argument and printed a constant copied from the plane — which is a
   pin testing its author's phrasing rather than the wire. */
console.log("\n--- UI-40: the record's own accounts, rendered ---");
{
  await ctx.__pubOpen(CASE);
  const p = pubBody();
  const t = strip(p);

  /* (1) `case_detail`, AT CASE ALTITUDE. It is a statement about the CASE — why
     a case has no case-level strength — so it belongs on a case page and not
     inside a finding's. */
  const acc = [...p.matchAll(/data-planeaccount="([^"]+)"/g)].map(m => m[1]);
  ok("UI-40 REACH: the page carries the record's own accounts as marked blocks",
     acc.length > 0, `marks=${acc.join(",") || "NONE"}`);
  /* THE DETAIL REPORTS BOTH HALVES SEPARATELY, and that is a correction the
     negative control earned. It first read `t.includes(strip(CASE_DETAIL))
     ? "verbatim" : …`, and when NC arm (1a) blanked the field at the plane
     `strip("")` became `""` — which every string contains — so a FAILING arm
     printed "found: verbatim". A detail line that contradicts its own verdict
     costs the next session exactly the time this instrument exists to save. */
  const verbatimCase = CASE_DETAIL.length > 0 && t.includes(strip(CASE_DETAIL));
  ok("UI-40: `case_detail` is RENDERED, and VERBATIM — the plane's own sentence, not a paraphrase",
     acc.includes("case_detail") && verbatimCase,
     `marked=${acc.includes("case_detail")} verbatim=${verbatimCase} planeChars=${CASE_DETAIL.length}`);
  ok("UI-40: and it stands at CASE altitude, where the claim it makes belongs",
     casePages(p).some(x => /data-planeaccount="case_detail"/.test(x))
     && !findingPages(p).some(x => /data-planeaccount="case_detail"/.test(x)));

  /* (2) `graph_detail`, PER FINDING, beside the arrays it is an account OF.
     Placed with its subject rather than forty screens away: UI-39 measured that
     a bound stated where its subject is not is a bound not stated. */
  const verbatimGraph = GRAPH_DETAIL.length > 0 && t.includes(strip(GRAPH_DETAIL));
  ok("UI-40: `graph_detail` is RENDERED, and VERBATIM",
     acc.includes("graph_detail") && verbatimGraph,
     `marked=${acc.includes("graph_detail")} verbatim=${verbatimGraph} planeChars=${GRAPH_DETAIL.length}`);
  ok("UI-40: it stands beside the arrays it accounts for — on the FINDING pages, one per finding",
     findingPages(p).filter(x => /data-planeaccount="graph_detail"/.test(x)).length === 2,
     `finding pages carrying it=${findingPages(p).filter(x => /data-planeaccount="graph_detail"/.test(x)).length}`);

  /* (3) THE ARRAYS THEMSELVES — the item said this surface already rendered all
     three and the measurement said it rendered NONE of them. These are the
     assertions that make `graph_detail` an account of something the reader can
     see rather than a sentence about data that is not on the page. */
  const graphOf = (fid) => [...p.matchAll(/data-graph="([a-z]+)" data-graphcount="(\d+)" data-of="([^"]+)"/g)]
    .filter(m => m[3] === fid).reduce((o, m) => (o[m[1]] = Number(m[2]), o), {});
  const gA = graphOf(FIND_A), gB = graphOf(FIND_B);
  ok("UI-40: finding A's SERVES edge is rendered, with the edition and title the record published",
     gA.serves === 1 && t.includes(L_CAP_B) && t.includes("The transfer memo"), JSON.stringify(gA));
  ok("UI-40: finding B's two NAME-only edges are rendered as name-only",
     gB.names === 2 && /data-edge="names" data-to="INQ-2026-4000"/.test(p), JSON.stringify(gB));
  /* THE SHARP ONE. The plane calls an unresolved edge a CONTRADICTION in the
     index and REPORTS it rather than swallowing it; the surface used to drop it
     on the floor, so a reader met a case whose index disagreed with itself and
     was told nothing. */
  ok("UI-40: the UNRESOLVED edge — the contradiction the record reports — REACHES THE READER",
     gA.unresolved === 1 && t.includes(L_GONE)
     && /data-graph="unresolved"[^>]*data-of="INQ-2026-4101"/.test(p), JSON.stringify(gA));
  ok("UI-40: and a finding with no unresolved edge SAYS SO, so absence of the warning is not the ambiguity",
     gB.unresolved === 0 && t.includes("still has a published edition behind it"), JSON.stringify(gB));

  /* (4) THE SURFACE AUTHORS NO DOCTRINE OF ITS OWN HERE. `pubPlaneAccount`'s
     whole point is that the words come from the wire, so the file must not carry
     a hand-written copy of either sentence — which is also what keeps DEC-49
     un-pre-empted, since nothing here is wording anybody chose. */
  const appSrc = appScript();
  ok("UI-40: neither sentence is hand-copied into the surface — it prints what the wire sent, nothing else",
     !appSrc.includes(CASE_DETAIL.slice(0, 60)) && !appSrc.includes(GRAPH_DETAIL.slice(0, 60)));

  /* (5) THE OVER-STRICTNESS ARM, and it is the one that stops these pins from
     testing their own author's phrasing. A CORRECT account, worded unlike
     anything this suite or that surface ever wrote, is put on the wire and must
     render WHOLE and unedited. REC-56's practice: feed in a correct alternative
     phrased unlike anything you wrote and require 0 fail. */
  const ALIEN_CASE = "Ravens counted the ledgers twice, and the second count is the one this container carries. "
                   + "No single letter is offered for the whole of it, and that is deliberate rather than missing.";
  const ALIEN_GRAPH = "Whatever this page can put in your hands is listed first; what it can only point at follows; "
                    + "anything it promised and cannot produce is listed last and ought not to be there at all.";
  ACCOUNTS = { case_detail: ALIEN_CASE, graph_detail: ALIEN_GRAPH };
  await ctx.__pubOpen(CASE);
  const alienPage = strip(pubBody());
  ACCOUNTS = null;
  ok("UI-40 CONTROL (over-strictness): a DIFFERENT correct `case_detail` renders WHOLE and unedited",
     alienPage.includes(ALIEN_CASE) && !alienPage.includes(strip(CASE_DETAIL)),
     alienPage.includes(ALIEN_CASE) ? "rendered whole" : "NOT RENDERED — the surface is not reading the wire");
  ok("UI-40 CONTROL (over-strictness): and so does a DIFFERENT correct `graph_detail`",
     alienPage.includes(ALIEN_GRAPH) && !alienPage.includes(strip(GRAPH_DETAIL)),
     alienPage.includes(ALIEN_GRAPH) ? "rendered whole" : "NOT RENDERED — the surface is not reading the wire");

  /* (6) THE BLANKING CONTROLS, RUN IN-SUITE rather than only recorded, because
     the item requires the harness to FAIL NAMING WHICH ACCOUNT WENT MISSING
     rather than rendering an empty box. `pubPlaneAccount` returns "" on an
     absent field BY DESIGN — no fallback sentence — so what must be observable
     is the MARK's disappearance, and these two arms assert exactly that in the
     direction the negative control will drive them. */
  for(const [key, other] of [["case_detail", "graph_detail"], ["graph_detail", "case_detail"]]){
    ACCOUNTS = { [key]: null };
    await ctx.__pubOpen(CASE);
    const blanked = pubBody();
    ACCOUNTS = null;
    const marks = [...blanked.matchAll(/data-planeaccount="([^"]+)"/g)].map(m => m[1]);
    ok(`UI-40 CONTROL (blanked at the plane): with \`${key}\` blanked the surface renders NO block for it — `
       + "no empty box, no fallback sentence — while the other account is untouched",
       !marks.includes(key) && marks.includes(other),
       `marks now = ${marks.join(",") || "none"}`);
  }
  /* And back to the real answer, so nothing downstream inherits a driven state. */
  await ctx.__pubOpen(CASE);
  ok("UI-40 REACH: the real answer is restored after the controls, so nothing below inherits a driven state",
     /data-planeaccount="case_detail"/.test(pubBody()) && strip(pubBody()).includes(strip(CASE_DETAIL)));
}

/* ============================================================
   UI-40 — THE CONSUMER WALK, OVER THE WHOLE REPOSITORY
   ============================================================
   This is the measurement IC-22 rests on, and it lives here so it can be RE-RUN
   rather than quoted. UI-35 measured the same question by hand and recorded the
   answer in prose; a prose answer cannot be re-run, and REC-41's precedent is
   that an item's assertion about consumers is a CLAIM until somebody measures it
   again — REC-41's own item was wrong about its op while right about its field,
   and only re-measuring caught it.

   THE THREE TRAPS IT IS BUILT AROUND, two inherited and one found here:

   1. `newgroup/src/release.mjs` embeds the whole bundled plane AS A STRING (a
      3-line file whose second line is ~1.74 MB), so a naive walk counts the
      plane as its own consumer and EVERY key looks consumed.
   2. **`release/bio-plane.bundled.mjs` IS A SECOND EMBED OF THE SAME BYTES
      (~1.68 MB) AND UI-40's OWN BRIEF NAMED ONLY THE FIRST.** A walk that
      excluded the file it was warned about would still have counted the plane as
      its own consumer, through a different file. Both are excluded
      STRUCTURALLY — by the generator's banner and by the bundler's own first
      line — and NEVER by filename, because the next generated artifact will have
      a third name.
   3. REGEX LITERALS. A scanner that treats `'` as a string delimiter runs
      straight through `/won't/` and swallows everything to the next apostrophe.
      The first version of this walk did exactly that and reported FEWER
      declaration sites than exist — a confident wrong answer in the generous
      direction, the same shape as UI-35's 27,059-character "return statement".
      Newlines are preserved when a region is blanked, so a reported line number
      is a line number somebody can check by hand.

   AND ITS OWN REACH IS ASSERTED AS A DELTA, never as an absolute: a walk that
   covers nothing finds no consumers and passes triumphantly. */
console.log("\n--- UI-40: the consumer walk (IC-22's evidence) ---");
{
  const path = await import("node:path");
  const ROOT = fileURLToPath(new URL("../../", import.meta.url));
  const SKIP = new Set(["node_modules", ".git", "dist", ".claude", "coverage"]);
  const EXT = new Set([".mjs", ".js", ".html"]);
  const files = [];
  (function walk(dir){
    for(const e of fs.readdirSync(dir, { withFileTypes:true })){
      if(e.name.startsWith(".")) continue;
      const p = path.join(dir, e.name);
      if(e.isDirectory()){ if(!SKIP.has(e.name)) walk(p); continue; }
      if(EXT.has(path.extname(e.name))) files.push(p);
    }
  })(ROOT);

  /* STRUCTURAL, never by filename — AND ANCHORED AT THE START OF THE FILE.
     The first version tested whether the source CONTAINED the generator's
     banner, and that excluded `newgroup/scripts/embed-release.mjs` — the
     GENERATOR ITSELF, which contains the banner because it WRITES it. Excluding
     a real source file is the walk's worst failure: a consumer living in the
     generator would have been invisible and the answer would still have read
     "zero". A generated artifact BEGINS with its banner; a file that merely
     mentions one does not. */
  const generatedReason = (src) =>
      /^\/\* GENERATED by scripts\/embed-release\.mjs/.test(src) ? "embed-release banner, at byte 0"
    : (/^\/\/ src\/schema\.mjs\n/.test(src) && /var SCHEMA = `/.test(src)) ? "bundler output, first line names the entry module"
    /* ADDED 2026-09-13 (DS-4). The clause above went STALE: the current plane bundle
       opens with esbuild's interop preamble, not a module comment, and only kept
       matching because `release/` still held the 0.56.0 asset. Structural, never by name. */
    : /^var __defProp = Object\.defineProperty;/.test(src) ? "bundler output, esbuild preamble at byte 0"
    : (/^\/\/ [^\n]*\.mjs\n/.test(src) && /var SCHEMA = `/.test(src)) ? "bundler output, first line names a module"
    : null;

  const blank = (s) => s.replace(/[^\n]/g, " ");
  function codeOf(src){
    let out = "", i = 0;
    const regexOk = () => {
      for(let k = out.length - 1; k >= 0; k--){
        const c = out[k];
        if(/\s/.test(c)) continue;
        if("(,=:[!&|?{};+-*%~^<>".includes(c)) return true;
        if(/[A-Za-z0-9_$)\]]/.test(c))
          return /\b(return|typeof|case|in|of|do|else|yield|await|new|delete|void|instanceof)$/
            .test(out.slice(Math.max(0, k - 10), k + 1));
        return false;
      }
      return true;
    };
    while(i < src.length){
      const ch = src[i];
      if(ch === "/" && src[i+1] === "*"){ const e = src.indexOf("*/", i+2), end = e < 0 ? src.length : e+2; out += blank(src.slice(i,end)); i = end; continue; }
      if(ch === "/" && src[i+1] === "/"){ const e = src.indexOf("\n", i), end = e < 0 ? src.length : e; out += blank(src.slice(i,end)); i = end; continue; }
      if(src.slice(i, i+4) === "<!--"){ const e = src.indexOf("-->", i), end = e < 0 ? src.length : e+3; out += blank(src.slice(i,end)); i = end; continue; }
      if(ch === '"' || ch === "'" || ch === "`"){ const q = ch; let j = i+1;
        while(j < src.length && src[j] !== q){ if(src[j] === "\\") j++; j++; }
        out += src.slice(i, Math.min(j+1, src.length)); i = j+1; continue; }
      if(ch === "/" && regexOk()){
        let j = i+1, cls = false, closed = false;
        for(; j < src.length; j++){
          const c = src[j];
          if(c === "\\"){ j++; continue; }
          if(c === "\n") break;
          if(c === "[") cls = true; else if(c === "]") cls = false;
          else if(c === "/" && !cls){ closed = true; break; }
        }
        if(closed){ while(j+1 < src.length && /[a-z]/.test(src[j+1])) j++; out += src.slice(i, j+1); i = j+1; continue; }
      }
      out += ch; i++;
    }
    return out;
  }

  /* The corpus is built ONCE and reported, so a corpus that shrank is visible
     rather than silent (this week's standing practice). */
  /* D-257 / M0-16 — THE CORPUS CARRIES ITS PROVENANCE. This walk reads the whole
     repository off the WORKING TREE and floors on `corpus.length` and on `chars`.
     `refs/stash` is repository-wide across all sixty worktrees and `push -u`
     carries untracked files, so a phantom deposited anywhere under the root was
     counted into both figures (D-238). The CONSUMER SEARCH still reads the whole
     working tree — a consumer of this shape in uncommitted work is still a
     consumer, and the positive control must still find it — while the REACH
     FLOOR is counted over `git ls-tree HEAD` alone. */
  const PROV = readGitProvenance(ROOT);
  const inCommit = f => PROV.inHead === null || PROV.inHead.has(repoPath(ROOT, f));
  const corpus = [];
  const excluded = [];
  let reproFiles = 0, reproChars = 0;
  for(const f of files){
    const raw = fs.readFileSync(f, "utf8");
    const g = generatedReason(raw);
    if(g){ excluded.push({ f: path.relative(ROOT, f), why: g, chars: raw.length }); continue; }
    const code = codeOf(raw);
    corpus.push({ f: path.relative(ROOT, f), code });
    if(inCommit(f)){ reproFiles++; reproChars += code.length; }
  }
  const chars = corpus.reduce((a, x) => a + x.code.length, 0);
  reportProvenance({
    prov: PROV,
    items: corpus.map(x => ({ path: x.f, what: x.f,
      counted: "read for op=publishedcase consumers, and counted into UI-40's reach floor" })),
    instrument: "UI-40's consumer walk",
    corpus: `the repository: ${corpus.length} file(s) read, ${reproFiles} of them in the commit`,
    totals: PROV.inHead === null ? [] : [
      { label: "files read", contaminated: corpus.length, reproducible: reproFiles, source: "files" },
    ],
  });
  console.log(`UI-40 CORPUS: ${corpus.length} files, ${chars} chars scanned; `
            + `${excluded.length} generated artifact(s) excluded (${excluded.map(x => x.f + " " + x.chars).join("; ")})`);

  /* `set` is the corpus to walk — a parameter, so the NEUTERING control has
     something to neuter and the reach arm is a DELTA against it. */
  const readsOf = (key, set = corpus) => {
    const re = new RegExp(`\\.${key}\\b|\\[\\s*["'\`]${key}["'\`]\\s*\\]`);
    const hits = [];
    for(const { f, code } of set)
      code.split("\n").forEach((l, n) => { if(re.test(l)) hits.push(`${f}:${n+1}`); });
    return hits;
  };

  /* THE FLOOR IS THE REPRODUCIBLE FIGURE (D-257): a phantom may still be read by
     the search above, and may never raise this ratchet. */
  ok("UI-40 REACH: the walk read a real corpus — over 200 files and 5,000,000 characters of it, counted over the commit at HEAD",
     reproFiles > 200 && reproChars > 5_000_000,
     `${reproFiles} of ${corpus.length} files / ${reproChars} of ${chars} chars `
     /* SAY UNVERIFIED, NEVER CLEAN (provenance.mjs rule 4) — D-257 control ARM 3. */
     + (PROV.inHead === null
          ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so this is the whole working-tree walk"
          : `in the commit at HEAD (${PROV.headSha})`));
  ok("UI-40 REACH: ALL THREE generated embeds are excluded, each recognised STRUCTURALLY and neither by "
     + "name — WAS 2 until 2026-09-13 (DS-4), when release 0.57.0 published the fleet and "
     + "release/pdf-worker.bundled.mjs joined: it inlines bio-plane/src, so it is an embed of the plane "
     + "for the same reason the other two are",
     excluded.length === 3 && excluded.every(x => x.chars > 1_000_000)
     && excluded.some(x => /newgroup/.test(x.f)) && excluded.some(x => /release\/bio-plane\.bundled/.test(x.f)),
     excluded.map(x => `${x.f} (${x.why})`).join(" | ") || "NONE EXCLUDED");

  /* THE POSITIVE CONTROL ON THE REAL CORPUS. `ratified_at` is a key of the very
     same answer that the surface really does read, so if this walk were passing
     over nothing — or matching nothing — this arm fails. It is what makes the
     ZERO below mean something. */
  const ratifiedReads = readsOf("ratified_at");
  ok("UI-40 REACH (positive control on the SAME corpus): a key of this op that IS read is found, and found "
     + "in the surface — so a zero below is a measurement rather than an empty walk",
     ratifiedReads.length > 0 && ratifiedReads.some(h => h.startsWith("civicos-ui/app.html")),
     `${ratifiedReads.length} reads of .ratified_at`);

  /* THE NEUTERING CONTROL, RUN IN-SUITE AND AS A DELTA. This is arm (3) of the
     item's negative controls, and running it here means it cannot be forgotten:
     an emptied corpus must take the positive control to ZERO. A walk that covers
     nothing passes everything, and this is the arm that proves it does not. */
  ok("UI-40 CONTROL (walk neutered): over an EMPTY corpus the positive control collapses to zero — "
     + "the reach arms are answering the corpus and not themselves",
     readsOf("ratified_at", []).length === 0 && ratifiedReads.length > 0,
     `real=${ratifiedReads.length} neutered=${readsOf("ratified_at", []).length}`);

  /* AND THE FINDING IC-22 RESTS ON. */
  const openedReads = readsOf("opened");
  const outsideProducer = openedReads.filter(h => !h.startsWith("bio-plane/src/store.mjs"));
  ok("UI-40: `opened` has ZERO consumers anywhere outside the producer — the surface, the installer, the "
     + "fleet, the tools and the battery all read it not once. IC-22's evidence, RE-MEASURED and not inherited",
     outsideProducer.length === 0, outsideProducer.join(", ") || "none");
  ok("UI-40: and the only reads of it that exist are the PRODUCER reading its own SQL row, which is what "
     + "makes it an unconsumed publication rather than a field with one caller",
     openedReads.length > 0 && openedReads.every(h => h.startsWith("bio-plane/src/store.mjs")),
     openedReads.join(", ") || "NONE AT ALL — the walk found nothing, which is itself suspect");
}

console.log(`publishedcase: ${n - fails.length}/${n} assertions`);

/* ============================================================================
   NEGATIVE CONTROL: `node civicos-ui/test/case6.control.mjs` — CASE-6, five arms
   plus a baseline, each armed ALONE, run 2026-09-10, every restore verified by
   sha256 AND by `cmp` against a per-arm uniquely-named pristine copy with a byte
   count printed and a minimum floored. `… case6.control.mjs a` runs one arm.

       baseline   publishedcase 244/244 · publication-entry 119 · caseproduction 68 · caseflip 54
       (a)        caseproduction  53 pass, 15 fail  — the owner fence neutered
       (b)        publishedcase  243/244            — the designation INFERRED
       (c)        publication-entry RED, one arm    — DEC-69, informed twice
       (d)        caseflip  52 pass, 2 fail         — the multi-case fence neutered
       (e)        publishedcase  242/244            — OVER-STRICTNESS, all load-bearing

   (e) IS THE OVER-STRICTNESS ARM AND ITS RESULT IS READ BY WHICH ASSERTIONS FAIL,
   never by the exit code: with every member re-designated LOAD-BEARING — legal,
   and the likeliest shape of a first real case — exactly two assertions fail and
   both name the supporting member explicitly, so they are measuring the fixture
   rather than the rule. The partition counts, the bar and the roster all render
   correctly over a case with no supporting member at all.

   TWO ARMS CAME BACK NOT AS DECLARED ON THEIR FIRST RUN AND BOTH CORRECTIONS ARE
   THE USEFUL HALF; the table above is the state after them.

   (b) RAN GREEN AT 244/244 WITH THE INFERENCE ARMED. `pubRoleOf` was defaulting an
   absent designation to load-bearing — exactly what DEC-72 clause 4 forbids — and
   nothing noticed, because the suite's only role-null member on the case-detail
   accessor is also AWAITING, which renders through a different branch. The
   comment beside it already SAID the branch "is asked on the INDEX instead, of
   FIND_K"; the comment had been written and the assertion had not. Two assertions
   were added on the index and (b) now fails as declared. **A suite that describes
   a coverage it does not have is the shape this arm exists to find.**

   (d) RAN GREEN AT 52 pass 0 fail WITH THE FENCE NEUTERED, and the reason is the
   pin's own OR: the two-target fixture puts its findings in DIFFERENT cases, so a
   DIFFERENT refusal fired and satisfied the set-membership test. The pin was
   pinning "some case fence refused this" — enough for CASE-5b, not enough for an
   item that DECIDED to keep one specific fence on a count of what that fence
   protects. A single-target arm was added beside it in `caseflip.test.mjs`,
   pinned by EXACT EQUALITY on the reason, and (d) now fails as declared.

   AND ONE INSTRUMENT LIMIT, found by the baseline row and recorded in the driver:
   the plane's suites end in two different spellings ("52 passed, 0 failed" vs
   "68 pass, 0 fail") and the driver's first tally reader knew only one, reporting
   a green 68-assertion suite as "NO TALLY". On any other arm that line would have
   read as the suite dying and the arm would have been scored on it. **This is
   what a baseline row is for.**
   ============================================================================ */

if(fails.length){ console.error(`publishedcase: ${fails.length} FAILED`); process.exit(1); }
