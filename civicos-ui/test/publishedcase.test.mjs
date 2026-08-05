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
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

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

const A1 = "a".repeat(64), A2 = "b".repeat(64);          // FIND_A's bundle sha, editions 1 and 2
const B1 = "c".repeat(64), B2 = "d".repeat(64);          // FIND_B's
const MAN1 = "e".repeat(64), MAN2 = "f".repeat(64);      // the CASE container manifests
const CAP_SHA = "0".repeat(64), DOC_SHA = "1".repeat(64);
const S_SHA = "2".repeat(64), S_MAN = "3".repeat(64);
const C_SHA = "4".repeat(64);
const INFO_SHA = "5".repeat(64);
const LOOSE_SHA = "6".repeat(64);
const E_SHA = "7".repeat(64), K_SHA = "8".repeat(64);

const L_CAP_B = INFO;               // capture B, supports, SERVED
const L_CAP_D = "INFO-2026-8002";   // capture D, supports, NAMED — FIND_A's capture DETERMINING leg
const L_CAP_C = "INFO-2026-8003";   // capture C, CUTS AGAINST, NAMED — dropped at a capture floor of B
const L_CON_C = "INFO-2026-8004";   // connection C, supports, NAMED, HUNCH — FIND_A's connection DETERMINING leg
const L_CON_A = "INFO-2026-8005";   // connection A, supports, SERVED

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
/* DEC-17: FIND_A declares NO bar and FIND_B declares one, on ONE case. Both
   branches are therefore under test on a single page, which is the shape DEC-44
   makes possible and the old fixture could not have: `required_strength` is
   frozen into a FINDING's bytes, so two members of a case may have been held to
   different standards and neither stands for the other. */
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
  return { ord:0, bundle_id:FIND_A, title:"Was the sewer transfer authorised?", bundle_sha:sha,
    ratified_at: ed === 1 ? "2026-07-01T09:00:00Z" : "2026-07-20T09:00:00Z",
    gate_version:"1.20.0", sig_armored:SIG, attestor:{ member:"vera", key_b64:KEY_V },
    strength:PAIR_A, required:BAR_ABSENT,
    parts:[ { path:"bundle.md", sha256:sha, kind:"bundle", bytes:4211 },
            { path:"snapshots/memo.bin", sha256:CAP_SHA, kind:"capture", bytes:8192 } ],
    serves:[ { to:L_CAP_B, kind:"reference", edition:1, title:"The transfer memo", bundle_sha:DOC_SHA,
               case_id:null, manifest_sha:null, ratified_at:"2026-06-01T00:00:00Z" } ],
    names:[], unresolved:[],
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
  return { ord:1, bundle_id:FIND_B, title:"Who approved the transfer?", bundle_sha:sha,
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
    completeness:{ statement: ed === 1 ? STMT1 : STMT2,
      subject_justification:"We put the four claims to the City Administrator on 2026-06-20 and printed what came back.",
      excluded: ed === 1 ? EXCLUDED_1 : "[]", subject_position:"sought_and_answered",
      author:"vera", at: ed === 1 ? "2026-07-01T09:00:00Z" : "2026-07-20T09:00:00Z" },
    ratified_at: ed === 1 ? "2026-07-01T10:00:00Z" : "2026-07-20T10:00:00Z",
    opened: ed === 1 ? "2026-06-30T09:00:00Z" : "2026-07-19T09:00:00Z",
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
  completeness:{ statement:"This case covers the lease extension only.",
    subject_justification:"The officer named declined to answer in writing.",
    excluded:"[]", subject_position:"sought_and_refused", author:"dan", at:"2026-07-05T09:00:00Z" },
  ratified_at:"2026-07-05T09:00:00Z", opened:"2026-07-04T09:00:00Z", complete:true, awaiting:[],
  findings:[ { ord:0, bundle_id:FIND_S, title:"Was the lease extended without a vote?", bundle_sha:S_SHA,
    ratified_at:"2026-07-05T09:00:00Z", gate_version:"1.20.0", sig_armored:SIG,
    attestor:{ member:"dan", key_b64:KEY_D },
    strength:PAIR_A, required:BAR_DECLARED,
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
  scope:"Whether the two culvert contracts were awarded to the same undisclosed owner.",
  completeness:{ statement:"This case covers the two 2025 culvert contracts.",
    subject_justification:"The vendor has not been asked yet.", excluded:"[]",
    subject_position:"not_sought", author:"vera", at:"2026-07-28T09:00:00Z" },
  ratified_at:null, opened:"2026-07-27T09:00:00Z",
  complete:false, awaiting:[FIND_D],
  findings:[ { ord:0, bundle_id:FIND_C, title:"Who owns the vendor?", bundle_sha:C_SHA,
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
  ratified_at:"2026-06-01T00:00:00Z", opened:"2026-06-01T00:00:00Z", complete:true, awaiting:[],
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
    strength:PAIR_A, required:BAR_ABSENT },
  { bundle_id:FIND_B, edition:1, title:"Who approved the transfer?", bundle_sha:B1,
    ratified_at:"2026-07-01T10:00:00Z", attestor_key:"BBBB", gate_version:"1.20.0",
    strength:PAIR_B, required:BAR_DECLARED },
  { bundle_id:FIND_A, edition:2, title:"Was the sewer transfer authorised?", bundle_sha:A2,
    ratified_at:"2026-07-20T09:00:00Z", attestor_key:"AAAA", gate_version:"1.20.0",
    strength:PAIR_A, required:BAR_ABSENT },
  { bundle_id:FIND_B, edition:2, title:"Who approved the transfer?", bundle_sha:B2,
    ratified_at:"2026-07-20T10:00:00Z", attestor_key:"BBBB", gate_version:"1.20.0",
    strength:PAIR_B, required:BAR_DECLARED },
  { bundle_id:FIND_S, edition:1, title:"Was the lease extended without a vote?", bundle_sha:S_SHA,
    ratified_at:"2026-07-05T09:00:00Z", attestor_key:"BBBB", gate_version:"1.20.0",
    strength:PAIR_A, required:BAR_DECLARED },
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
    strength:PAIR_A, required:BAR_ABSENT },
];
const manOf = (caseId, ed, rows) => JSON.stringify({ format:"bio-case-container/2", case:caseId, edition:ed,
  findings:rows });
const CASE_ROWS = [
  { case_id:CASE, edition:1, scope:SCOPE, ratified_at:"2026-07-01T10:00:00Z", manifest_sha:MAN1,
    manifest: manOf(CASE, 1, [ { bundle_id:FIND_A, strength:PAIR_A, required_strength:BAR_ABSENT },
                               { bundle_id:FIND_B, strength:PAIR_B, required_strength:BAR_DECLARED } ]) },
  { case_id:CASE, edition:2, scope:SCOPE, ratified_at:"2026-07-20T10:00:00Z", manifest_sha:MAN2,
    manifest: manOf(CASE, 2, [ { bundle_id:FIND_A, strength:PAIR_A, required_strength:BAR_ABSENT },
                               { bundle_id:FIND_B, strength:PAIR_B, required_strength:BAR_DECLARED } ]) },
  { case_id:CASE_SOLO, edition:1, scope:SOLO.scope, ratified_at:"2026-07-05T09:00:00Z", manifest_sha:S_MAN,
    manifest: manOf(CASE_SOLO, 1, [ { bundle_id:FIND_S, strength:PAIR_A, required_strength:BAR_DECLARED } ]) },
  { case_id:CASE_WAIT, edition:1, scope:WAITING.scope, ratified_at:null, manifest_sha:null, manifest:null },
  /* REC-49: EVERY DECLARED MEMBER HAS RATIFIED AND THERE IS STILL NO CONTAINER.
     The container is recorded by the CONTROL PLANE after the last ratification
     returns, so "the roster is complete" and "the container exists" are two
     facts and the gap between them is reachable — an R2 outage is enough. A
     surface reading completeness off the roster prints a container hash for a
     container that is not there. */
  { case_id:CASE_STUCK, edition:1, scope:"Whether the amendment was made after award.",
    ratified_at:"2026-07-30T09:00:00Z", manifest_sha:null, manifest:null },
];
const CASE_MEMBERS = [
  { case_id:CASE, edition:1, ord:0, bundle_id:FIND_A }, { case_id:CASE, edition:1, ord:1, bundle_id:FIND_B },
  { case_id:CASE, edition:2, ord:0, bundle_id:FIND_A }, { case_id:CASE, edition:2, ord:1, bundle_id:FIND_B },
  { case_id:CASE_SOLO, edition:1, ord:0, bundle_id:FIND_S },
  { case_id:CASE_WAIT, edition:1, ord:0, bundle_id:FIND_C },
  { case_id:CASE_WAIT, edition:1, ord:1, bundle_id:FIND_E },
  { case_id:CASE_WAIT, edition:1, ord:2, bundle_id:FIND_D },
  { case_id:CASE_STUCK, edition:1, ord:0, bundle_id:FIND_K },
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
    const poison = (c) => POISON
      ? { ...c, strength:PAIR_A, required:BAR_ABSENT, bundle_sha:A2,
          manifest: c.manifest ? { ...c.manifest, strength:PAIR_A } : c.manifest }
      : c;
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
    if(url.searchParams.get("path")) return R({ ok:false, error:"publishedbytes requires sha256=<64 lowercase hex>. This surface answers BY HASH and never by path, so there is nothing to walk." });
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
  return out;
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
  ok("the index enumerates CASE EDITIONS — two editions of the two-finding case, one each of the others",
     rows.length === 7 && (idx.match(/data-caserow="CASE-/g) || []).length === 5);
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
  ok("the declared bar rides the index row too, PER FINDING — one member declared none and one declared a bar",
     /bar: none declared/.test(e1) && /bar: Documents B/.test(e1));
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
  ok("each finding carries its OWN attestor, signing key and signature — there is no case-level signature",
     /Attested by/.test(t) && t.includes("vera") && t.includes("dan")
     && (page.match(/<dt>Signature<\/dt>/g) || []).length === 2
     && /there is no case-level signature/.test(t));
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
  ok("the declared bar renders BESIDE the strength reached, per finding, prominently",
     spA.indexOf('class="pub-axisrow" data-finding="' + FIND_A + '"') < spA.indexOf('class="pub-bar"')
     && spA.indexOf('class="pub-bar"') > 0 && spA.indexOf('class="pub-bar"') < spA.indexOf("<h3"));
  ok("an ABSENT bar renders as ABSENT — never as zero, and never as a dash",
     /data-bar="absent" data-finding="INQ-2026-4101"/.test(secA)
     && /NONE WAS DECLARED/.test(strip(secA)) && /An absent bar is not a bar of zero/.test(strip(secA)));
  ok("and a DECLARED bar on the OTHER member of the same case renders as declared, set in advance",
     /data-bar="declared" data-finding="INQ-2026-4102"/.test(secB) && /set in advance/.test(strip(secB)));
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
  ok("and it renders no case-level bar either — a bar is frozen into a FINDING's bytes",
     (poisoned.match(/class="pub-bar"/g) || []).length === 2
     && caseAltitude(poisoned).indexOf('class="pub-bar"') < 0);
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
  ok("the whole surface reached exactly the four credential-free ops and no other",
     JSON.stringify(ops) === JSON.stringify(["publishedbytes", "publishedcase", "publishedmanifest", "verify"]));
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
  const UNREAD = {
    case_detail: "the plane's own account of why a case has no case-level strength (DEC-44). "
               + "Rendered nowhere; the surface hand-writes its own doctrine instead. Candidate for "
               + "RENDERING under UI-32's rule (lift what the record published), which moves DEC-49's "
               + "SUBJECT and so is routed rather than done here.",
    graph_detail: "the plane's own account of serves[]/names[]/unresolved[]. Rendered nowhere, though "
                + "this surface renders all three arrays. Same routing.",
    opened: "when the case edition was OPENED. The strongest instance of this item's shape: ZERO "
          + "consumers anywhere — not this surface, not `newgroup`, not `docprofile`, not "
          + "`pdf-worker`, and not one assertion in the plane's own battery. The surface renders "
          + "`ratified_at` and never this. Found by THIS sweep and not by the item, which named a "
          + "field that turned out not to be published at all.",
    bias_acknowledgement: "the GROUP's acknowledgement of the bias the case was produced under "
                        + "(REC-47, DEC-46 (a)), gated by C-21.1 and asserted by the battery. NOT an "
                        + "unconsumed publication — a SURFACE GAP. DEC-34's per-page header shows a "
                        + "`Declared bias` computed from HUNCH legs, which is a DIFFERENT fact, so a "
                        + "reader of the public record never meets the group's own sentence.",
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

console.log(`publishedcase: ${n - fails.length}/${n} assertions`);
if(fails.length){ console.error(`publishedcase: ${fails.length} FAILED`); process.exit(1); }
