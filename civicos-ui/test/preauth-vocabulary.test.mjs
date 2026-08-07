/* UI-31 — THE VOCABULARY GUARD REACHES THE PRE-AUTHENTICATION SURFACES.
 *
 * WHY THIS EXISTS, and it decides everything about how it is built.
 *
 * UI-4's member-facing vocabulary guard and its siblings — `subject-view`,
 * `capture-honesty`, `document-structure`, `inquiry-page`, `queue`, the act
 * suites — are each scoped to their OWN rendered surface. Every one of those
 * surfaces is behind a credential. So **no guard in this repository covered any
 * surface a member can see BEFORE authenticating**, and that is now where the
 * plane's own vocabulary stands: REC-41 gave `op=login` its first refusal
 * SENTENCE, UI-30 renders it verbatim under DEC-8, and it says "no active
 * credential", "a salted derivation", "its stored hash", "this instance" on the
 * first screen a member ever meets.
 *
 * **THIS FILE DOES NOT SETTLE WHO OWNS THE WORDING.** That is DEC-49, open with
 * Bob. It turns an UNMEASURED tension into a MEASURED one, and nothing else:
 * nothing here translates a plane sentence, blanks one, or introduces a mapping
 * layer, and `app.html` was not touched by UI-31 at all.
 *
 * **THAT LAST CLAUSE IS UI-31'S AND STAYS TRUE OF UI-31.** UI-33 later DID change
 * `app.html` — but only words this surface wrote itself, never a plane string,
 * and DEC-49 remains open and un-pre-empted. See "WHAT UI-33 DID TO THIS FILE"
 * below before reading the counts in this header as UI-31's.
 *
 * THREE THINGS IT DOES.
 *
 *   1 REACH. It drives every surface a member can see before authenticating —
 *     the gate as it is served, the token panel, a refused sign-in, a sign-in
 *     against a plane that cannot be reached, an empty token, the public record,
 *     the design preview, and the two published ADDRESSES that resolve at load
 *     for somebody holding nothing.
 *
 *   2 REPORT, NOT FAIL. Every plane-vocabulary term it finds is printed with the
 *     surface it stands on and where the words came from. It does not FAIL on
 *     them. A guard that failed on the shipped sentence would leave a surface
 *     two choices, and DEC-8 forbids both: compose a translation, or blank what
 *     the plane said. Pressuring a surface into inventing wording is the
 *     bug-in-the-gate shape `CLAUDE.md` names, so the arm reports until Bob has
 *     ruled. **HOW IT BECOMES A FAILING ARM: set `REPORT_ONLY` to `false`.** One
 *     line, at the arm itself, and it is correct under EITHER answer to DEC-49 —
 *     (a) the plane learns member-facing wording and the plane-sourced hits go
 *     away at their source; (b) surfaces get a licensed translation layer and
 *     they go away at the surface. Either way "no plane vocabulary reaches a
 *     pre-authentication surface" is the state the ruling produces.
 *
 *   3 THE MEASUREMENT ITSELF, printed as `PRE-AUTH VOCABULARY REPORT:` lines and
 *     carried into `docs/development/MEASUREMENTS.md` with its date and this
 *     file as the instrument, because DEC-49 should be answered against a
 *     measurement rather than an impression.
 *
 * EVERYTHING IS FOUND BY WALKING, BECAUSE A LIST FALLS BEHIND THE THING IT
 * DESCRIBES (D-93). Three walks, and each one's own reach is asserted:
 *
 *   - THE SURFACES. The gate's own markup in `app.html` is the authority on what
 *     a member can touch before signing in: every `id` in it is read out, and
 *     every one the script binds a handler to is a pre-authentication entry
 *     point that some scenario below must drive. Add a control to the gate and
 *     this file fails until it is driven.
 *   - THE ADDRESSES. `publishedRouteFromHash()` is the one router that runs at
 *     load with no credential. Its own body is read for the address shapes it
 *     matches, and each shape must be driven. Add a third address and this file
 *     fails until it is driven.
 *   - THE TERMS. The term list is not written here. It is HARVESTED from every
 *     sibling vocabulary sweep in this directory — each of them is a
 *     `for(const word of [...])` over a surface's rendered HTML — so this guard
 *     inherits every term its siblings already police and cannot fall behind
 *     them. Four PHRASES are added on top and declared as added: they are the
 *     four DEC-49 itself quotes, and a measurement that could not see the very
 *     words the decision is about would be worthless.
 *
 * A WALK THAT COVERS NOTHING PASSES EVERYTHING. This project has hit that class
 * three times in two days — UI-30 found it in an instrument, REC-49 had an arm
 * that first fired ZERO, UI-28 had to guard a source-region read that would have
 * made every `includes()` trivially true. So every walk here asserts its own
 * reach BY NAME and BY COUNT, every scenario asserts a marker proving it
 * rendered its subject rather than an error pane, and the harvested surface set
 * is compared to an expected set with both differences named.
 *
 * HOW A TERM IS ATTRIBUTED, and it is the honest half of the report. For each
 * scenario the mock records every string the PLANE answered. Each occurrence of
 * a term in the rendered HTML is located, and if its character range falls
 * inside a run of text the plane supplied (raw or `esc()`-escaped) it is
 * PLANE-SOURCED; otherwise the surface put it there and it is SURFACE-AUTHORED.
 * That is per-occurrence and not per-term, so the same word can be plane-sourced
 * in one place and surface-authored in another, which is exactly what happens.
 *
 *   UNAVOIDABLE = plane-sourced. DEC-8 forbids the surface translating it or
 *     blanking it, so nothing UI can do today removes it; only DEC-49 can.
 *   INCIDENTAL  = surface-authored. This surface wrote the word and could word
 *     it differently tomorrow without touching a ruling.
 *
 * That partition is mechanical, and it is deliberately NOT a judgement about
 * whether any particular word is bad. It says who would have to act.
 *
 * WHAT THIS DOES NOT MEASURE, stated so nobody trusts it for more. The
 * plane-sourced side is measured against what the MOCK answers. For `op=login`
 * that is the plane's own constant, read textually out of `bio-plane/src/store.mjs`
 * and never typed here, so the refusal is exact. For `op=publishedmanifest` and
 * `op=publishedcase` the fixtures are wire-shaped but are this file's own, so a
 * real instance's `detail` sentences may carry terms these do not: the
 * plane-sourced column for the published surfaces is a LOWER BOUND. The
 * surface-authored column is exact everywhere, because it is read off the
 * shipped `app.html`.
 *
 * Run alone: `node test/preauth-vocabulary.test.mjs`.
 *
 * ============================================================================
 * WHAT UI-33 DID TO THIS FILE, 2026-08-04, AND WHAT IT DELIBERATELY DID NOT.
 * ============================================================================
 * UI-33 closed the SURFACE-AUTHORED half of what this file measured — the words
 * `app.html` wrote itself, which NEITHER answer to DEC-49 would ever have
 * removed. The report went from 13 terms to 9, and **all EIGHT plane-sourced
 * rows are unchanged in number and in source**, which is the assertion that
 * matters: a reword that quietly edited a plane string would otherwise have
 * looked exactly like success.
 *
 * THE MEASUREMENT ITSELF IS UNTOUCHED. Walks 1-3, `planeRanges`, `countIn`, the
 * HITS loop, the report and `REPORT_ONLY` all behave identically — verified by
 * running the changed file against the UNCHANGED `app.html` and diffing the
 * `PRE-AUTH VOCABULARY REPORT:` block, which came back character-identical.
 * Three things changed, each for a stated reason:
 *   - `structuralTerms()` was lifted out of the HITS loop unchanged, so the
 *     liveness arm can exercise the real detector instead of a re-typed copy.
 *   - THE STRUCTURAL LIVENESS ARM WAS CORRECTED, not exempted. It used to
 *     require the two rules to have matched something on the REAL surfaces —
 *     which was true only because `MEMBER_TOKEN`, `CORS` and `R2` were still
 *     standing there. It was fed by the defect it was watching for, so fixing
 *     the defect would have turned it red. Full reasoning at the arm.
 *   - ONE REACH ASSERTION WAS ADDED, and arm (g) below is why.
 *
 * NEGATIVE CONTROL, SEVEN ARMS, RUN 2026-08-04 against this file as it stands
 * and the counts are that run's. Arms (a)-(d) are reached through this file's
 * own switches, the way `auth-surface.test.mjs`'s arm (c) is, so each is
 * re-runnable in ONE STEP and NOTHING is written to disk — there is no restore
 * to get wrong. Arms (e)-(g) are on disk; `app.html` was restored
 * byte-identically after every one of them, sha256 compared before and after.
 *
 *   (a) HIDE A MEMBER-FACING SURFACE FROM THE WALK — UI-31's own control, run
 *       three times because the three hidings fail through three different
 *       assertions and each names something the others cannot.
 *       `UI31_HIDE=public-record node test/preauth-vocabulary.test.mjs`
 *       -> **2 of 30 FAIL**: the scenario set ("MISSING: public-record") and the
 *       gate control that lost its only driver ("UNCOVERED: g-pub").
 *       `UI31_HIDE=design-preview` -> **3 of 31 FAIL**: those two
 *       (`design-preview`, `g-preview`) plus the surface set, which prints
 *       "STOPPED COVERING: [#content, #m-grp, #m-handle, #m-idstr, #rail]" —
 *       five member-facing surfaces that leave the walk with that one scenario.
 *       `UI31_HIDE=case-address-at-load` -> **3 of 30 FAIL**: the scenario, the
 *       published ADDRESS SHAPE nothing opens any more (the failure prints the
 *       router's own regex, `/^#case\/([A-Za-z0-9._-]+)(?:\/e(\d+))?$/`), and
 *       the harvest collapsing from 33,535 characters to 8,714. **THIS IS THE
 *       ARM THAT PROVES THE ADDRESS WALK IS LOAD-BEARING**: that scenario
 *       renders into `#pub-body`, which another scenario also renders, so a
 *       surface-set check alone would have stayed perfectly green while the
 *       largest pre-authentication surface in the product stopped being read.
 *
 *   (b) NEUTER THE TERM HARVEST — `UI31_EMPTY_TERMS=1`. The walk over the
 *       sibling suites returns nothing, which is "covers nothing, passes
 *       everything" arriving in the instrument rather than the subject.
 *       RUN: **4 of 32 FAIL** — the empty harvest ("read 0 suites []"), the
 *       inherited terms, DEC-49's own four phrases, and the attribution's
 *       non-degeneracy, which collapses with them.
 *
 *   (c) BREAK THE ATTRIBUTION — `UI31_NO_PLANE_RANGES=1` makes every occurrence
 *       read as surface-authored, which is what a silently-failing subtraction
 *       looks like (UI-28's instrument lesson: the publication must be
 *       subtracted before the remainder means anything, and UI-30's, that an
 *       extraction yielding "" makes every `includes()` trivially true).
 *       RUN: **1 of 32 FAILS**, printing "0 plane-sourced rows and 12
 *       surface-authored" — the report would have blamed this surface for the
 *       plane's own sentence, which is the one error that would have misdirected
 *       DEC-49 outright.
 *
 *   (d) THE REPORTING ARM AS A FAILING ARM — `UI31_ENFORCE=1`, which is exactly
 *       the one-line flip DEC-49's answer will make permanent. RUN: **1 of 32
 *       FAILS**, naming all NINE remaining terms with their sources (it named
 *       thirteen before UI-33). That is what this file will say the day the
 *       ruling lands, measured now rather than promised.
 *
 *   (e) ON DISK — put a plane term where no plane put it. The gate's own token
 *       hint in `app.html` gains the words "including every capture_sha". RUN:
 *       **32 of 32 green** and the report grows from 9 terms to 10, the new row
 *       being `"capture_sha" x1 (1 visible) INCIDENTAL [inherited] | surface:
 *       gate-as-served app.html:#gate (served markup)` — the right term, the
 *       right surface, and attributed to the surface that wrote it rather than
 *       to the plane. This arm answers what the switch arms cannot: **does the
 *       report SEE something it was not built against**, or is it only
 *       reproducing its own fixtures.
 *
 *   (f) UI-33'S OWN, AND THE ONE THAT GUARDS THE HARD CONSTRAINT — **THE SURFACE
 *       TRANSLATES A PLANE-SOURCED TERM.** `signIn()` renders the plane's refusal
 *       through `String(l.detail).replace("a salted derivation","a scrambled
 *       copy")`. That is the surface composing wording for a refusal it received,
 *       which DEC-8 forbids outright and which UI-33 was told above all else not
 *       to do — pre-empting DEC-49, the error UI-31 deliberately refused to make.
 *       RUN: **2 of 32 FAIL**, and the pair is the point.
 *       The REACH arm names the act — "the gate rendered the plane's own
 *       sentence, whole — which is the subject of this item".
 *       The ATTRIBUTION arm names the CONSEQUENCE: three of the plane's terms
 *       (`its stored hash`, `no active credential`, `register`) flip from
 *       UNAVOIDABLE to **INCIDENTAL**, and `a salted derivation` vanishes from
 *       the report altogether. The measurement DEC-49 is to be answered against
 *       would have blamed this surface for the plane's own sentence and shrunk
 *       the ruling's subject by one term, which is a worse outcome than the
 *       wording change itself.
 *
 *   (g) THE SAME OVERSTEP ON THE CASE PAGE — and this arm FOUND A GAP AND CLOSED
 *       IT, so both numbers are recorded. `pubCasePages` renders the plane's
 *       `verification.detail` through `.replace("this instance","this group")`.
 *       **BEFORE UI-33 added its REACH assertion: 31 of 31 GREEN, exit 0.** The
 *       only thing that moved was the report — `this instance` went x3 to x2 and
 *       lost its case-page plane source. A surface silently translating a plane
 *       sentence on the LARGEST pre-authentication surface in the product, the
 *       one a stranger actually arrives on, was invisible to every assertion in
 *       this file; only the gate's sentence was pinned. **AFTER: 1 of 32 FAILS**,
 *       naming `verification.detail` and DEC-8. The gap was found by running the
 *       control rather than by reading the file, which is the whole argument for
 *       running it.
 *
 * ============================================================================
 * WHAT UI-34 DID TO THIS FILE, 2026-08-04. IT CHANGED THE MEASUREMENT BASIS,
 * AND THAT IS THE POINT RATHER THAN A SIDE EFFECT.
 * ============================================================================
 * Everything above counted over TEN scenarios. It now counts over ELEVEN, and a
 * reader comparing this file's numbers to UI-31's or UI-33's must know that.
 *
 * WHY. `pubVerifyPanel()` renders a whole pre-authentication pane — the
 * verification claim this product rests on, addressed to somebody holding
 * nothing — and NO SCENARIO DROVE IT. The reason is structural and is the real
 * finding: walk 1 discovers pre-authentication controls by reading `#gate`'s
 * markup, and that control is on `#pub`'s rail. The published space is entered
 * with no credential; its masthead's own links were discovered by NOTHING. So a
 * whole uncredentialed surface sat outside the measurement, and UI-33 could
 * reword its words without moving a number here — which it did, and said so.
 * WHAT WAS ADDED. **WALK 1b**, which reads the published masthead's own inline
 * handlers the way walk 1 reads the gate's ids, plus the cross-check that every
 * one of them must be driven; **one scenario**, `published-verify-panel`; and
 * **one REACH assertion** pinning that it rendered its own subject. A third link
 * on that rail now fails this file until somebody opens it (arm (i)).
 * WHAT ELSE WAS ADDED, AND IT IS THE LARGER OF THE TWO. **DEC-49'S SUBJECT IS
 * NOW PINNED** — the eight plane-sourced rows, by TERM and by SOURCE, in
 * `DEC49_SUBJECT` beside the report. The hard constraint every item working on
 * these surfaces inherits is "leave every plane-sourced term exactly as it is",
 * and until now it was verified by a worker reading a report and writing the
 * result into a landing. That is a check done carefully once and skipped the
 * third time. It is machine-checked now, and it earns its place immediately:
 * arms (a3), (b), (c), (f) and (g) all trip it, and (g) — the DEC-8 overstep on
 * the case page that UI-33 needed a bespoke reach assertion to catch — is now
 * caught GENERICALLY, by name, without anybody having anticipated that field.
 * THE READING, BEFORE AND AFTER, both carried into MEASUREMENTS.md with the date
 * and this file as the instrument: 10 scenarios -> 11; 33,535 -> 34,375
 * characters; 9 terms -> 9 terms; 55 -> 57 occurrences; 45 -> 47 visible. THE
 * WHOLE DELTA IS ONE ROW: `sha256` x30 (26 visible) -> x32 (28), on its
 * SURFACE-authored half, from the verify pane's own two sentences. **EVERY
 * PLANE-SOURCED ROW IS UNCHANGED IN NUMBER AND IN SOURCE**, which is now
 * asserted rather than observed.
 *
 * ============================================================================
 * WHAT UI-36 DID TO THIS FILE, 2026-08-04. **DEC-49'S SUBJECT GREW — 8 ROWS TO
 * 11 — AND THAT IS THE RESULT RATHER THAN A SIDE EFFECT.**
 * ============================================================================
 * A PUBLIC OP NOBODY DROVE. `pubVerify(sha, into)` is the only place a
 * pre-authentication surface CALLS the plane on the reader's behalf: it renders
 * FIVE times on the published case page, a stranger reaches it holding nothing,
 * it asks `op=verify` (`classes: null`), and it prints the plane's answer back
 * — `matches[0].path`, `.kind`, `.bundle_id`. No scenario had ever clicked it,
 * so every word of that answer stood OUTSIDE the reading DEC-49 is being
 * answered against. That is the plane-sourced column being a lower bound in a
 * SECOND way, unrelated to the two wire-shaped fixtures UI-31 named.
 *
 * WHAT WAS ADDED. **WALK 1c**, which discovers the controls the CASE PAGE
 * serves by reading the page AS RENDERED — walks 1 and 1b read served markup,
 * and this page's controls are written by script out of what the plane
 * answered, so no read of `app.html` finds them at all. Every control it finds
 * must be DRIVEN by a scenario or NAMED by the load-time router's own body
 * (which is how `pubOpen` is accounted for, read out of
 * `publishedRouteFromHash` rather than asserted). Then the existing
 * `case-address-at-load` scenario DRIVES every `pubVerify` and `pubBytes` call
 * site the page rendered, EVALUATING THE CALL AS THE PAGE WROTE IT, and the mock
 * learns `op=verify` FLAT with its refusal read textually out of
 * `bio-plane/src/index.mjs`.
 *
 * IT IS THE EXISTING SCENARIO AND NOT A TWELFTH ONE, DELIBERATELY. A second
 * scenario opening the same address renders the whole case page again and
 * DOUBLE-COUNTS every plane-sourced occurrence on the largest pre-authentication
 * surface in the product; the delta would then be a re-render rather than this
 * control. That is the indistinguishability UI-33 and UI-34 each avoided, and
 * UI-34's `fromNav` entry was the same reasoning. **THE INSTRUMENT IS PROVED
 * UNCHANGED THE WAY UI-33 AND UI-34 PROVED IT**: this file with the drive hidden
 * (`UI31_HIDE=case-verify`) reproduces UI-34's report CHARACTER-IDENTICALLY, so
 * every number that moved was moved by the drive and by nothing else.
 *
 * THE READING, BEFORE AND AFTER: 11 scenarios -> 11 (unchanged); 12 surfaces ->
 * 19; 34,375 -> 35,835 characters; 9 terms -> 13; 57 -> 67 occurrences; 47 -> 57
 * visible. **THE SUBJECT: 8 PLANE-SOURCED ROWS -> 11**, all four movements from
 * `op=verify`'s own answer and every one named at `DEC49_SUBJECT` below —
 * `manifest` NEW (the plane's `kind` VALUE, printed as a word), `CASE` NEW (the
 * acronym rule on the plane's real minted id prefix), `FIND` NEW (the same rule
 * on the FIXTURE's id spelling, labelled as such), and `bundle.md` gaining THREE
 * SOURCES as `op=verify` echoes the part path the case page already showed.
 *
 * **AND THE ITEM'S OWN PREMISE IS CONTRADICTED BY THE MEASUREMENT, WHICH IS THE
 * MORE IMPORTANT HALF.** UI-36 was routed on the reading that `pubVerify`'s
 * `catch` branch "prints `e.error || e.reason` verbatim under DEC-8". IT CANNOT,
 * and no plane word can reach that branch: `apiQ` goes through `api`, which is
 * `fetch(...).then(r => r.json())` and REJECTS only on a transport failure or a
 * body that is not JSON — neither carries an `error` or a `reason`. Arm (l)
 * measures it: translating that expression, a DEC-8 overstep, leaves this file
 * 48/48 GREEN and the report CHARACTER-IDENTICAL.
 * **THE CONSEQUENCE IS A LIVE DEFECT AND IT IS PINNED, NOT FIXED, HERE.**
 * Because `apiQ` does not throw on `ok:false`, a REFUSAL from `op=verify`
 * arrives as an ordinary value with `published` undefined and falls into the
 * NOT-PUBLISHED branch — so a reader who asked a question the plane DECLINED to
 * answer is told "No published part answers to that hash", a substantive claim
 * about the record, on the one surface whose whole purpose is "check this
 * without us". It is reachable by a click (the container row fills its hash from
 * `bundle_sha || ""`). The surface is NOT changed by this item: DEC-49 is open,
 * and every reading in this chain is worth what it is worth because nothing on
 * the surface moved while it was taken. The state is measured, asserted and
 * routed instead.
 *
 * ============================================================
 * UI-37, 2026-08-04 — THE DEFECT ABOVE IS FIXED, AND THIS FILE'S PIN OF IT IS
 * CORRECTED RATHER THAN EXEMPTED. D-195 CLOSED.
 * ============================================================
 * WHAT WAS WRONG, in one sentence: `pubVerify` had TWO branches for THREE
 * answers, so "the plane said no" and "the plane would not say" were one
 * sentence — and the sentence a stranger got was the substantive one.
 *
 * THE SWEEP FOUND MORE THAN THE ITEM NAMED, twice over, and both findings are
 * why the brief asked for a sweep instead of a fix:
 *   THREE REFUSALS, not one. Beside `op=verify`'s malformed-hash arm there is
 *     `unknown op` — what any surface deployed ahead of its plane receives, and
 *     `civicos-ui` ships on its own schedule — and, worse, an answer that is not
 *     an answer AND NOT `ok:false` EITHER: section 7a returns
 *     `json({ok:true, ...out.result})` without checking `out.ok`, so a Durable
 *     Object failure arrives as `{ok:true}` at HTTP 200 with nothing in it.
 *     **That last one settled the item's open design question.** Making `apiQ`
 *     throw on `ok:false` the way `rec` does would have sailed straight past it
 *     and left the surface still saying NOT PUBLISHED, so the fix is a POSITIVE
 *     SHAPE TEST at each site and `apiQ` is unchanged with all three of its
 *     callers keeping their own error paths.
 *   THREE SITES, not one. Both sibling public reads on this page had the same
 *     collapse. `pubList` read `(r && r.published) || []`, so a refusal produced
 *     "This group has not published any case files yet" — a claim about the
 *     ENTIRE published record, which is worse than the one this item was routed
 *     for. `pubOpen` printed `<h1>Not published</h1>` over every refusal while
 *     reading only `detail`, so the two arms that carry `error` had their words
 *     dropped and replaced by this surface's own negative.
 *
 * AND THE SIXTH STATE IS THE ONE NOBODY WOULD HAVE ADDED: the TRUE NEGATIVE,
 * driven with a well-formed hash the record genuinely does not hold. A surface
 * that stops calling a refusal a negative must not start calling a negative a
 * refusal, and arm (q) shows that failure is one character away.
 *
 * THE SENTENCE WAS NOT DELETED. Its second clause — "a hash that was never
 * ratified and a hash that never existed are the same answer here, deliberately"
 * — is TRUE of a real not-published answer and FALSE of a refusal, and that is
 * precisely what made the whole sentence convincing where it did not belong. It
 * moved to the branch where it is true and is pinned VERBATIM there.
 *
 * THE READING: 11 scenarios -> 15; 19 surfaces -> 22; 35,835 -> 38,468
 * characters; 13 terms -> 13; 67 -> 68 occurrences; 57 -> 58 visible.
 * **THE SUBJECT: 11 PLANE-SOURCED ROWS -> 11. ONE NEW SOURCE ON ONE EXISTING
 * TERM**, `sha256` at `case-address-at-load #v-refused`, which is `op=verify`'s
 * own refusal rendered instead of swallowed. No new term enters the subject.
 * Plane wording that this item DID put in front of a stranger and that the
 * instrument cannot pin — the `unknown op` refusal on three surfaces, and the
 * store's own NOT_PUBLISHED sentence — is named at `DEC49_SUBJECT` rather than
 * left to be discovered, because "we added plane wording and the subject did not
 * move" is a claim a reader should distrust until it is itemised.
 *
 * THE FOUR NEW SCENARIOS MOVE NO NUMBER IN THE REPORT, measured rather than
 * asserted: this file against the FINAL app.html with all four hidden gives
 * 54/54 green, 11 scenarios, 22 surfaces, 36,527 characters, 13 terms, 68
 * occurrences and 58 visible — the same 68/58 as the full run, and the subject
 * arm PASSES. So they add 2,110 characters of harvest and four assertions, and
 * everything that moved in the vocabulary report came from the FIX on surfaces
 * this walk already covered.
 */
import vm from "vm"; import fs from "fs"; import path from "path";
import { webcrypto } from "crypto";
import { fileURLToPath } from "url";
import { appScript } from "./extract.mjs";

const SELF = fileURLToPath(import.meta.url);
const HERE = path.dirname(SELF);
const UIROOT = path.dirname(HERE);

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* The switches the negative-control arms are reached through. Nothing on disk is
   mutated by any of them. */
/* `UI31_HIDE` TAKES A COMMA LIST AS OF UI-37, 2026-08-04, and a bare name still
   means exactly what it always did — every arm recorded by UI-31, UI-34 and
   UI-36 runs unchanged. It was widened for ONE reason: UI-37 adds four scenarios,
   and the only honest way to show that the instrument itself did not move is to
   hide all four at once and diff the report against UI-36's. A control that can
   only be run one scenario at a time cannot make that statement. */
const HIDE            = process.env.UI31_HIDE || "";
const HIDDEN          = new Set(HIDE.split(",").map(s => s.trim()).filter(Boolean));
const HID             = k => HIDDEN.has(k);
const EMPTY_TERMS     = !!process.env.UI31_EMPTY_TERMS;
const NO_PLANE_RANGES = !!process.env.UI31_NO_PLANE_RANGES;

const APP_SRC  = fs.readFileSync(path.join(UIROOT, "app.html"), "utf8");
const SCRIPT   = appScript();
/* `app.html`'s own escaper, mirrored so a plane string can be located in the
   rendered HTML in the form the surface actually wrote it. */
const esc = s => (s==null?"":String(s)).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ============================================================
   WALK 1 — THE GATE'S OWN MARKUP NAMES WHAT A MEMBER CAN TOUCH
   ============================================================
   The gate is served as static HTML, so the markup is the authority on what
   exists before a single line of script has decided anything. Every `id` in it
   is read out; every one the script binds a handler to is an entry point some
   scenario below must drive. A hand-kept list of gate controls would be a list
   that falls behind `app.html` the first time somebody adds a button. */
function gateMarkup(){
  const start = APP_SRC.indexOf('<div id="gate">');
  if(start < 0) return "";
  /* balance <div …> against </div> from the opening tag */
  let i = start, depth = 0;
  const tag = /<\/?div\b[^>]*>/g;
  tag.lastIndex = start;
  let m;
  while((m = tag.exec(APP_SRC))){
    depth += m[0][1] === "/" ? -1 : 1;
    i = m.index + m[0].length;
    if(depth === 0) break;
  }
  return depth === 0 ? APP_SRC.slice(start, i) : "";
}
const GATE = gateMarkup();
const GATE_IDS = [...new Set([...GATE.matchAll(/\bid="([A-Za-z0-9_-]+)"/g)].map(x => x[1]))].sort();
/* A control is BOUND when the script attaches a handler to it by id. Both event
   properties the gate uses are looked for; a third would show up as a control
   with no binding and be reported as unreachable rather than silently dropped. */
const BOUND = GATE_IDS.filter(id =>
  new RegExp('\\$\\("#' + id.replace(/[-]/g, "\\-") + '"\\)\\.on(click|input)\\s*=').test(SCRIPT));

ok("WALK 1 REACH: the gate's markup was extracted from app.html and is the real thing",
   GATE.length > 800 && GATE.includes('id="g-signin"') && GATE.includes("</div>"));
ok("WALK 1 REACH: the gate declares the controls this walk expects — "
   + "found [" + GATE_IDS.join(", ") + "]",
   GATE_IDS.length === 12
   && ["gate","g-base","g-err","g-handle","g-preview","g-pub","g-pw","g-signin","g-token","g-token-go",
       "g-token-toggle","g-token-wrap"].every(id => GATE_IDS.includes(id)));
ok("WALK 1 REACH: six of them are BOUND to a handler and are therefore entry points — "
   + "found [" + BOUND.join(", ") + "]",
   BOUND.length === 6
   && ["g-base","g-preview","g-pub","g-signin","g-token-go","g-token-toggle"].every(id => BOUND.includes(id)));

/* ============================================================
   WALK 1b — THE PUBLISHED SPACE'S OWN CONTROLS (ADDED BY UI-34, 2026-08-04)
   ============================================================
   THE GATE IS NOT THE ONLY PRE-AUTHENTICATION SURFACE WITH CONTROLS, AND UNTIL
   THIS WALK NOTHING SAID SO. `#pub` is entered with no credential — that is the
   product claim — and its masthead carries its own links, served as static
   markup with inline handlers, reachable by a stranger who has signed in to
   nothing. Walk 1 reads `#gate` and only `#gate`, so those controls were
   discovered by NOBODY, and the consequence was measurable: `pubVerifyPanel()`
   renders an entire pre-authentication pane and **no scenario drove it**. UI-33
   reworded that pane's own words anyway — same stranger, same screen — and said
   so at the site, because adding a scenario would have moved UI-31's measurement
   basis mid-flight while DEC-49 is being answered against it. UI-34 is where that
   move is made deliberately and reported before and after.
   The controls are DISCOVERED the way the gate's are, from the served markup's
   own inline handlers rather than from a list here, so a third link on that rail
   fails this file until some scenario opens it. */
function pubMasthead(){
  const start = APP_SRC.indexOf('<div class="pub-mast">');
  if(start < 0) return "";
  let i = start, depth = 0, m;
  const tag = /<\/?div\b[^>]*>/g; tag.lastIndex = start;
  while((m = tag.exec(APP_SRC))){ depth += m[0][1] === "/" ? -1 : 1; i = m.index + m[0].length; if(!depth) break; }
  return depth === 0 ? APP_SRC.slice(start, i) : "";
}
const PUBMAST = pubMasthead();
const PUB_CONTROLS = [...new Set([...PUBMAST.matchAll(/onclick="([A-Za-z0-9_]+)\(\)"/g)].map(x => x[1]))].sort();
ok("WALK 1b REACH: the published masthead was extracted from app.html and is the real thing",
   PUBMAST.length > 200 && PUBMAST.includes('id="p-gname"') && PUBMAST.includes("</div>"));
ok("WALK 1b REACH: it declares exactly the uncredentialed controls this walk has classified — found ["
   + PUB_CONTROLS.join(", ") + "] (a third link on that rail must be driven before this passes)",
   PUB_CONTROLS.length === 2 && ["pubList","pubVerifyPanel"].every(f => PUB_CONTROLS.includes(f)));

/* ============================================================
   WALK 2 — THE ADDRESSES THAT RESOLVE FOR SOMEBODY HOLDING NOTHING
   ============================================================
   `boot()` cannot run without a credential, so the routers it asks are not
   pre-authentication surfaces. `publishedRouteFromHash()` is: `app.html` calls
   it at the top level, before the gate is ever shown, precisely so a published
   address resolves for a stranger. Its OWN body is read for the address shapes
   it matches, and each shape must be driven below. */
function fnBody(name){
  const h = SCRIPT.indexOf("function " + name + "(");
  if(h < 0) return "";
  const end = SCRIPT.indexOf("\n}", h);
  return end < 0 ? "" : SCRIPT.slice(h, end + 2);
}
const PUBROUTE = fnBody("publishedRouteFromHash");
const ADDRESS_SHAPES = [...PUBROUTE.matchAll(/\/\^#([^/\\]|\\.)*\//g)].map(x => x[0]);
const ROUTE_FNS = [...new Set([...SCRIPT.matchAll(/\b([A-Za-z]*[Rr]outeFromHash)\(/g)].map(x => x[1]))].sort();

ok("WALK 2 REACH: publishedRouteFromHash's body was read and is the real function",
   PUBROUTE.length > 200 && PUBROUTE.includes("enterPublished"));
ok("WALK 2 REACH: it matches exactly two published ADDRESS SHAPES — found ["
   + ADDRESS_SHAPES.join(" , ") + "]", ADDRESS_SHAPES.length === 2);
/* A NEW ROUTER IS A NEW ADDRESS, and an address that resolves before sign-in is
   a pre-authentication surface. This does not judge the new one; it stops it
   from arriving unclassified. */
/* CORRECTED 2026-08-07 BY UI-38, four -> FIVE, and the old assertion was RIGHT
   to fail rather than wrong to exist: `aiSessionRouteFromHash` arrived with the
   once-only running-session surface and this arm stopped it arriving
   UNCLASSIFIED, which is exactly what it is for. The classification, made
   against this walk's own rule ("`boot()` cannot run without a credential, so
   the routers it asks are not pre-authentication surfaces"):

     `aiSessionRouteFromHash` is POST-AUTHENTICATION. It is asked inside
     `boot()`'s router chain and NOWHERE at the top level, so `#session/<id>`
     resolves for nobody holding nothing. It is therefore not a pre-auth
     surface and adds no member-facing pre-auth vocabulary.

   Asserted rather than asserted-by-comment: the two pins below check both
   halves of that classification, so a later edit that hoists the router above
   the gate fails HERE and the surface is re-classified rather than drifting
   into the pre-auth set unnoticed. */
ok("WALK 2 REACH: the script declares exactly the five routers this walk has classified — found ["
   + ROUTE_FNS.join(", ") + "] (a sixth must be classified as pre-auth or not before this passes)",
   ROUTE_FNS.length === 5
   && ["actionRouteFromHash","aiSessionRouteFromHash","projectRouteFromHash",
       "publishedRouteFromHash","routeFromHash"].every(f => ROUTE_FNS.includes(f)));
{
  /* The running-session router is asked in boot()'s chain ... */
  const BOOTCHAIN = /if\(!publishedRouteFromHash\(\)[\s\S]{0,400}?\)\s*go\("queue"/.exec(SCRIPT);
  ok("WALK 2 REACH: the boot() router chain was found and is the real one",
     !!BOOTCHAIN && BOOTCHAIN[0].includes("routeFromHash"));
  ok("WALK 2 CLASSIFICATION: aiSessionRouteFromHash is asked INSIDE boot(), which is what makes it post-authentication",
     !!BOOTCHAIN && BOOTCHAIN[0].includes("aiSessionRouteFromHash()"));
  /* ... and NOWHERE outside it. The published router is asked at the top level
     on purpose; a second one appearing there would be a new pre-auth surface. */
  const TOPLEVEL = SCRIPT.slice(SCRIPT.indexOf("/*__AI_SESSION_END__*/"));
  ok("WALK 2 CLASSIFICATION: and it is NOT asked at the top level before the gate — so #session/<id> resolves for nobody holding nothing",
     !TOPLEVEL.includes("aiSessionRouteFromHash()"));
}
ok("WALK 2 REACH: and app.html asks the published router at the TOP LEVEL, outside boot()",
   /\n\s*if\(\/\^#\(published[\s\S]{0,80}publishedRouteFromHash\(\);?\n?\}catch/.test(SCRIPT)
   || SCRIPT.slice(SCRIPT.indexOf("/*__PUBLISHED_CASE_END__*/")).includes("publishedRouteFromHash()"));

/* ============================================================
   THE PLANE, MIRRORED AT THE WIRE
   ============================================================ */

/* THE REFUSAL SENTENCE IS READ OUT OF THE PLANE, NEVER TYPED HERE — UI-30's
   technique, for UI-30's reason: a hand-typed copy agrees with its source at
   zero cost and leaves every assertion green while the two drift, and this file
   exists to measure that sentence's exact words. `store.mjs` cannot be imported
   (it opens with `import … from "cloudflare:workers"`), so it is read textually,
   the way `check-semantics.mjs` already reads it. The read is GUARDED: an
   extraction that silently yielded "" would make the whole measurement report
   nothing and pass. */
const STORE_SRC = fs.readFileSync(path.join(UIROOT, "..", "bio-plane", "src", "store.mjs"), "utf8");
function planeLoginRefusal(){
  const block = /static LOGIN_REFUSAL_DETAIL = \{\n([\s\S]*?)\n {2}\};/.exec(STORE_SRC);
  if(!block) return null;
  const out = {};
  for(const part of block[1].split(/^ {4}(?=[A-Z_]+:)/m)){
    const k = /^([A-Z_]+):/.exec(part);
    if(!k) continue;
    const lits = [...part.slice(k[0].length).matchAll(/"((?:[^"\\]|\\.)*)"/g)]
      .map(x => JSON.parse('"' + x[1] + '"'));
    if(lits.length) out[k[1]] = lits.join("");
  }
  return out;
}
const REFUSAL = planeLoginRefusal();
const REFUSAL_CODE = REFUSAL ? Object.keys(REFUSAL)[0] : "";
const REFUSAL_SENTENCE = REFUSAL ? REFUSAL[REFUSAL_CODE] : "";
ok("the plane's login-refusal sentence is readable from here, whole, and is prose",
   !!REFUSAL_CODE && REFUSAL_SENTENCE.length > 200 && /^[a-z].*\.$/s.test(REFUSAL_SENTENCE));

/* AND `op=verify`'S OWN REFUSAL, READ THE SAME WAY AND FOR THE SAME REASON —
   ADDED BY UI-36, 2026-08-04. `op=verify` is answered by the CONTROL PLANE
   rather than by the store (`index.mjs`, section 7a: "Anyone, no token, no
   session"), and when it will not answer a hash it says so in its own words.
   Those words are read textually out of index.mjs, never typed here: a
   hand-typed copy would agree with its source at zero cost, and this file's
   whole subject is whether the plane's exact words reach an uncredentialed
   reader. The read is GUARDED, because an extraction that silently yielded ""
   would make the refusal arm below trivially true. */
const INDEX_SRC = fs.readFileSync(path.join(UIROOT, "..", "bio-plane", "src", "index.mjs"), "utf8");
function planeVerifyRefusal(){
  const m = /op === "verify"\)\s*\{[\s\S]{0,600}?error:\s*"((?:[^"\\]|\\.)*)"/.exec(INDEX_SRC);
  return m ? JSON.parse('"' + m[1] + '"') : "";
}
const VERIFY_REFUSAL = planeVerifyRefusal();
ok("the plane's own refusal for op=verify is readable from here and is the control plane's own sentence — "
   + JSON.stringify(VERIFY_REFUSAL),
   VERIFY_REFUSAL.length > 20 && /verify/.test(VERIFY_REFUSAL) && /sha256/.test(VERIFY_REFUSAL));

/* ============================================================
   THE REST OF THE REFUSAL SET — UI-37, 2026-08-04
   ============================================================
   UI-37 was routed naming ONE refusal (`op=verify`'s malformed-hash arm) and
   told to sweep `index.mjs` for the others rather than trust that count. It
   found TWO MORE that reach these surfaces, and both are read textually out of
   the plane exactly as the first one is, so neither is a fixture anybody typed:

   (2) `unknown op`. Every op in this file's reach passes the OPS-table lookup at
       the top of `fetch`, and a name that is not in the table is refused at 400.
       This is NOT hypothetical on these surfaces and that is the whole reason it
       is driven: `civicos-ui` is a separately deployed worker that carries no
       version number and whose deploy is explicitly NOT gated on a plane release
       (`kickoffs/UI.md`), so a surface talking to a plane older than itself is
       the NORMAL condition, not an edge case. The three public reads are also
       the ops most likely to be newer than the instance a stranger reaches,
       because they are the ones a stranger reaches.

   (3) THE ANSWER THAT IS NOT AN ANSWER AND IS NOT `ok:false` EITHER, and it is
       the arm that decides this item's design question. Section 7a answers
       `json({ ok: true, ...out.result }, 200)`. When the Durable Object throws
       it returns `{ok:false, error:<stack>}` at 500 with NO `result`, and
       spreading `undefined` is a no-op — so what leaves the control plane is
       `{ok:true}`, HTTP 200, with no `published`, no `sha256` and no `matches`.
       A seam that threw on `ok:false` would sail straight past it and the
       surface would still have rendered NOT PUBLISHED. That is the measured
       reason `apiQ` was left alone and the fix is a POSITIVE SHAPE TEST at each
       site; it is asserted below rather than argued, and the spread is read out
       of index.mjs so the assertion is about the plane and not about a belief. */
function planeUnknownOpRefusal(){
  const m = /if \(!spec\) return json\(\{ ok: false, error: "((?:[^"\\]|\\.)*)"/.exec(INDEX_SRC);
  return m ? JSON.parse('"' + m[1] + '"') : "";
}
const UNKNOWN_OP_REFUSAL = planeUnknownOpRefusal();
ok("the plane's own refusal for an op it does not have is readable from here too — "
   + JSON.stringify(UNKNOWN_OP_REFUSAL) + " — which is what a surface deployed ahead of its plane gets, "
   + "and civicos-ui's deploy is not gated on a plane release",
   UNKNOWN_OP_REFUSAL.length > 5 && /op/.test(UNKNOWN_OP_REFUSAL));
/* THE NON-ANSWER'S MECHANISM, PINNED IN THE PLANE'S OWN SOURCE.
 *
 * CORRECTED 2026-08-05 (REC-52) AND NEVER EXEMPTED, exactly as UI-37 wrote it
 * expecting. The old assertion required section 7a to STILL CARRY THE DEFECT:
 *
 *     /if \(op === "verify"\)[\s\S]{0,900}?return json\(\{ ok: true, \.\.\.out\.result \}, 200\);/
 *
 * and it was green for that reason. It was written honestly — UI-37 said at
 * this site that the day 7a learned to check `out.ok`, the drive below would
 * stop meaning anything and this pin was what would say so. That day is today.
 * REC-52 closed the defect at eleven caller-facing sites, of which this was
 * one, so the OLD assertion would now be RED FOR THE FIX and GREEN FOR THE BUG
 * — which is the trap UI-36's refusal arm fell into whole, and the reason
 * CLAUDE.md requires a superseded assertion to be corrected at the site rather
 * than deleted or exempted.
 *
 * WHAT IT PINS NOW IS THE SAME PROPERTY WITH THE POLARITY THE OTHER WAY UP:
 * section 7a CHECKS the envelope before it spreads it. So this arm goes RED
 * the day the defect comes back, which is what a pin is for. The drive below
 * KEEPS ITS SUBJECT AND IS NOT WEAKENED: `civicos-ui` deploys on its own
 * schedule and is explicitly not gated on a plane release (`kickoffs/UI.md`),
 * so a surface talking to a plane OLDER than itself is the normal condition —
 * an empty `{ok:true}` from a pre-REC-52 plane is still something a stranger
 * can be served today, and this surface must still refuse to read an absence
 * out of it. The plane's own guarantee and the surface's own defence are two
 * different assertions, and only the first one moved. */
const SEVENA_GUARDED =
  /if \(op === "verify"\)[\s\S]{0,2400}?const out = await doAnswer\([\s\S]{0,200}?if \(!out\.answered\) return storeSilent\("verify"\);/
    .test(INDEX_SRC);
const SEVENA_RAW_SPREAD =
  /if \(op === "verify"\)[\s\S]{0,900}?const out = await r\.json\(\);\s*\n\s*return json\(\{ ok: true, \.\.\.out\.result \}, 200\);/
    .test(INDEX_SRC);
ok("MEASURED IN THE PLANE'S SOURCE: op=verify now OPENS the Durable Object envelope before it spreads "
   + "it — `doAnswer` then `if (!out.answered) return storeSilent(\"verify\")` — so a store failure "
   + "leaves the plane as a REFUSAL and no longer as {ok:true} at HTTP 200 with no `published`. This "
   + "arm is red for the defect and green for the fix, which is the direction UI-36's pin had backwards",
   SEVENA_GUARDED && !SEVENA_RAW_SPREAD);
/* AND THE TRUE NEGATIVE FOR A CASE, READ THE SAME WAY. `op=publishedcase`'s
   genuine "the published projection does not hold that" is the STORE's own
   answer and carries the store's own sentence; the surface must keep rendering
   it as the negative it is. Read textually so this arm cannot drift from the
   sentence the plane actually sends, which is the whole reason the arm exists —
   the two directions of this collapse are told apart by `reason`, and a
   hand-typed `reason` would agree with its source at zero cost. */
function planeCaseNotPublished(){
  const m = /return \{ ok: false, reason: "(NOT_PUBLISHED)",\s*\n\s*detail: "((?:[^"\\]|\\.)*)"\s*\n?\s*\+ "((?:[^"\\]|\\.)*)"\s*\n?\s*\+ "((?:[^"\\]|\\.)*)" \};/.exec(STORE_SRC);
  return m ? { ok:false, reason:m[1], detail: JSON.parse('"' + m[2] + m[3] + m[4] + '"') } : null;
}
const CASE_NOT_PUBLISHED = planeCaseNotPublished();
ok("the store's own NOT_PUBLISHED answer for op=publishedcase is readable from here, whole — "
   + JSON.stringify(CASE_NOT_PUBLISHED && CASE_NOT_PUBLISHED.detail),
   !!CASE_NOT_PUBLISHED && CASE_NOT_PUBLISHED.reason === "NOT_PUBLISHED"
   && CASE_NOT_PUBLISHED.detail.length > 100 && /published projection/.test(CASE_NOT_PUBLISHED.detail));

/* The two public ops. Wire-shaped: `op=publishedmanifest` is WRAPPED (index.mjs
   re-wraps it explicitly), `op=publishedcase` is FLAT (its own handler), which
   is what `check-mock-envelope.mjs`'s wire map says and what its arm B judges
   these answers against. */
const CASE_ID = "CASE-2026-0001", FIND_ID = "FIND-2026-0001";
const SHA = "a".repeat(64), MAN = "b".repeat(64), CAP = "c".repeat(64);
/* UI-37's three extra hashes, all WELL-FORMED — that is the point of them. The
   surface's old test was "did an answer arrive with a truthy `published`", which
   makes a refusal, a broken answer and a genuine absence one thing; these are the
   three the surface must now tell apart while asking the plane the same
   syntactically valid question every time.
   `UNKNOWN` is a hash the published projection genuinely does not hold — the TRUE
   NEGATIVE, which must keep reading as one. `NONE` draws the `unknown op` refusal
   and `NOANS` draws the empty success; see the mock. */
const UNKNOWN = "f".repeat(64), NONE = "e".repeat(64), NOANS = "d".repeat(64);
const MANIFEST_ANSWER = {
  ok:true, scope:"published",
  published:[{ bundle_id:FIND_ID, edition:1, title:"Was the sewer transfer authorised?", bundle_sha:SHA,
    ratified_at:"2026-07-01T09:00:00Z", attestor_key:"SHA256:zzz", gate_version:"1.20.0",
    strength:{ capture:"B", connection:"C" }, required:{ capture:"B", connection:"C" } }],
  cases:[{ case_id:CASE_ID, edition:1, scope:"Whether the sewer transfer was authorised.",
    ratified_at:"2026-07-01T10:00:00Z", manifest_sha:MAN,
    manifest:JSON.stringify({ format:"bio-case-container/2", case:CASE_ID, edition:1,
      findings:[{ bundle_id:FIND_ID, strength:{ capture:"B", connection:"C" },
                  required_strength:{ capture:"B", connection:"C" } }] }) }],
  caseMembers:[{ case_id:CASE_ID, edition:1, ord:0, bundle_id:FIND_ID }],
  shas:[],
  detail:"every hash here is verifiable by anyone with ssh-keygen and the doorbell, without this "
       + "instance's cooperation or continued existence.",
};
/* THE TWO TOP-LEVEL ACCOUNTS `op=publishedcase` REALLY SENDS, READ OUT OF THE
   PLANE — ADDED 2026-08-05 (UI-40), and adding them is the whole reason this
   file's measurement is honest again.

   UI-40 made the published-case surface RENDER `case_detail` and `graph_detail`
   verbatim, which puts two long plane-authored sentences in front of an
   UNCREDENTIALED reader — exactly this file's subject. The change should
   therefore have moved DEC-49's subject, and on the first run it DID NOT AND THE
   SUITE PASSED. The reason is the failure mode this file was built to catch,
   arriving in its own fixture: `CASE_ANSWER` did not carry either field, so the
   mock answered a SMALLER SHAPE than the wire and the guard measured vocabulary
   that was not there to measure. A guard whose fixture is shorter than the
   answer reports a clean surface by construction.

   Read TEXTUALLY out of `store.mjs` rather than typed here, for the reason
   stated above `planeLoginRefusal`: a hand-typed copy agrees with its source at
   zero cost, and whether the plane's EXACT words reach a stranger is the only
   question this file asks. The read is GUARDED below.

   AND `opened` IS GONE from this fixture (UI-40, IC-22), never exempted: the
   wire no longer sends it, and a fixture answering a key the plane does not
   publish is the D-173 class UI-35 found on this very op. THIS SUITE WAS NOT
   NAMED BY UI-35'S CONSUMER TABLE and was found by UI-40's own re-measurement,
   which is the argument for re-measuring rather than inheriting a table. */
function planeAccount(key, until){
  const i = STORE_SRC.indexOf(key + ": \"");
  if(i < 0) return null;
  const j = STORE_SRC.indexOf(until, i);
  const region = STORE_SRC.slice(i + key.length + 1, j < 0 ? STORE_SRC.length : j);
  const parts = region.match(/"(?:[^"\\]|\\.)*"/g) || [];
  return parts.map(s => JSON.parse(s)).join("");
}
const CASE_DETAIL_SENTENCE  = planeAccount("case_detail", "graph_detail");
const GRAPH_DETAIL_SENTENCE = planeAccount("graph_detail", "\n  }");
ok("the plane's two published ACCOUNTS are readable from here, whole, and are prose — the fixture "
   + "below answers the wire's own words and not a shorter shape of them",
   typeof CASE_DETAIL_SENTENCE === "string" && CASE_DETAIL_SENTENCE.length > 200
   && typeof GRAPH_DETAIL_SENTENCE === "string" && GRAPH_DETAIL_SENTENCE.length > 100);
const CASE_ANSWER = {
  ok:true, caseId:CASE_ID, edition:1,
  scope:"Whether the sewer transfer was authorised.",
  completeness:"Every finding this case declared has been ratified.",
  ratified_at:"2026-07-01T10:00:00Z", complete:true, awaiting:[],
  case_detail:CASE_DETAIL_SENTENCE, graph_detail:GRAPH_DETAIL_SENTENCE,
  findings:[{ ord:0, bundle_id:FIND_ID, title:"Was the sewer transfer authorised?", bundle_sha:SHA,
    ratified_at:"2026-07-01T09:00:00Z", gate_version:"1.20.0",
    sig_armored:"-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----",
    attestor:{ member:"vera", key_b64:"AAAAC3Nza" },
    strength:{ capture:"B", connection:"C" }, required:{ capture:"B", connection:"C" },
    parts:[{ path:"bundle.md", sha256:SHA, kind:"bundle", bytes:512 },
           { path:"snapshots/memo.bin", sha256:CAP, kind:"capture", bytes:2048 }],
    serves:[], names:[], unresolved:[],
    division:{ parent:null, siblings:[],
      detail:"a division's parent and siblings are NAMED and never served." },
    object_type:"finding",
    body:{ state:"published", from_sha:SHA, question:"Was the sewer transfer authorised?",
      conclusion:"The transfer was made without the authorisation the ordinance requires.",
      falsifies:"A council authorisation dated before the transfer.", excludes:"",
      authored:{ conclusion:null, falsifier:null }, detail:"" },
    basis:[{ bundle_id:"INFO-2026-0100", title:"The transfer memo", role:"supports",
      grade:{ capture:"B", connection:"C" }, sha256:CAP, load_bearing:true }],
    bytes:"op=publishedbytes&sha256=" + SHA }],
  manifest_sha:MAN,
  manifest:{ format:"bio-case-container/2", case:CASE_ID, edition:1,
    findings:[{ bundle_id:FIND_ID, strength:{ capture:"B", connection:"C" },
                required_strength:{ capture:"B", connection:"C" } }] },
  files:[{ path:CASE_ID + "/" + FIND_ID + "/bundle.md", sha256:SHA, bytes:512 }],
  editions:[1], edition_index:[{ edition:1, ratified_at:"2026-07-01T10:00:00Z", manifest_sha:MAN }],
  latest_edition:1,
  detail:"this is one published edition of a case.",
  verification:{ container:"op=publishedbytes&sha256=" + MAN, manifest:"op=publishedbytes&sha256=" + MAN,
    findings:[{ bundle_id:FIND_ID, bytes:"op=publishedbytes&sha256=" + SHA }],
    detail:"every hash here is checkable by anyone with ssh-keygen, without this instance." },
};

/* THE PUBLISHED PROJECTION'S ANSWER FOR A HASH — `op=verify`, ADDED BY UI-36.
   Every row is taken from `CASE_ANSWER`'s OWN parts and its own manifest rather
   than invented, so what the verify control renders is what this case actually
   contains: a stranger who checks a hash off this page is told about the same
   part the page just showed them. `MANIFEST.json` is the container's real file
   name (the same one UI-33 kept when it reworded the prose around it). */
const VERIFY_MATCHES = new Map([
  [SHA, { bundle_id:FIND_ID, path:"bundle.md",          kind:"bundle",   published:"2026-07-01T09:00:00Z" }],
  [CAP, { bundle_id:FIND_ID, path:"snapshots/memo.bin", kind:"capture",  published:"2026-07-01T09:00:00Z" }],
  [MAN, { bundle_id:CASE_ID, path:"MANIFEST.json",      kind:"manifest", published:"2026-07-01T10:00:00Z" }],
]);

/* Every string the plane hands over in a scenario, recursively, so the report
   can say who wrote each word rather than guessing. */
function stringsOf(v, out){
  out = out || [];
  if(typeof v === "string"){ if(v.length >= 4) out.push(v); }
  else if(Array.isArray(v)) for(const x of v) stringsOf(x, out);
  else if(v && typeof v === "object") for(const k of Object.keys(v)) stringsOf(v[k], out);
  return out;
}

/* ---- the mock, wrapping every answer the way the plane does ---- */
function makePlane(mode){
  const CALLS = [];
  const SAID = [];                       // every string the plane answered here
  const opts = mode || {};
  async function fetch(u, init){
    const url = new URL(String(u), "https://plane.test");
    const op = url.searchParams.get("op");
    let body = null; try{ body = init && init.body ? JSON.parse(init.body) : null; }catch(_){}
    CALLS.push({ op, method:(init && init.method) || "GET", token:url.searchParams.get("token"), body });
    if(opts.unreachable) throw new TypeError("Failed to fetch");
    const R = o => ({ ok:true, json:async()=>o });
    const W = r => R({ ok:true, result:r, store:"bio", tokenClass:null });
    const say = r => { stringsOf(r, SAID); return r; };
    /* store.mjs login(): a refusal is a VALUE inside a successful envelope, and
       it carries the plane's own sentence beside its one code (REC-41). */
    if(op === "login")
      return W(say({ ok:false, reason:REFUSAL_CODE, detail:REFUSAL_SENTENCE }));
    /* THE TWO SIBLING PUBLIC READS, IN THEIR REFUSAL AND THEIR TRUE-NEGATIVE
       STATES TOO — UI-37, 2026-08-04. UI-37's brief required a check of whether
       the siblings on this page had `pubVerify`'s collapse; they did, so they
       are driven the same way and each is driven in BOTH directions, because a
       surface that stops calling a refusal a negative must not start calling a
       negative a refusal.
         `manifestArm:"unknownop"` — the plane does not have the op (an older
            instance than the surface reaching it).
         `manifestArm:"nonanswer"` — the control plane's own re-wrap,
            `json({ok:true, result:(await r.json()).result})`, when the Durable
            Object threw and there is no `result`: HTTP 200, no `ok:false`, and
            nothing to read.
         `manifestArm:"empty"`     — the plane ANSWERED and this group has
            genuinely published nothing. The true negative, which must keep
            reading as one.
         `caseArm:"unknownop"`     — as above.
         `caseArm:"notpublished"`  — the STORE's own NOT_PUBLISHED, wrapped by
            index.mjs at 404. The true negative for a case. */
    if(op === "publishedmanifest"){
      if(opts.manifestArm === "unknownop")
        return { ok:false, status:400, json:async()=>say({ ok:false, error:UNKNOWN_OP_REFUSAL, op }) };
      if(opts.manifestArm === "nonanswer")
        return { ok:true, status:200, json:async()=>({ ok:true, result:undefined }) };
      if(opts.manifestArm === "empty")
        return W(say({ ok:true, scope:"published", published:[], cases:[], caseMembers:[] }));
      return W(say(MANIFEST_ANSWER));
    }
    if(op === "publishedcase"){
      if(opts.caseArm === "unknownop")
        return { ok:false, status:400, json:async()=>say({ ok:false, error:UNKNOWN_OP_REFUSAL, op }) };
      if(opts.caseArm === "notpublished")
        return { ok:false, status:404, json:async()=>say({ ok:false, ...CASE_NOT_PUBLISHED }) };
      return R(say(CASE_ANSWER));
    }
    /* `op=verify` — FLAT (`index.mjs` op==="verify": json({ok:true, ...out.result})),
       which is what check-mock-envelope's wire map says and what its arm B judges
       this answer against. THREE ANSWERS, because the op has three and the
       surface renders each differently:
         a well-formed hash the published projection knows -> published, with the
           part NAMED, which is the plane-sourced text UI-36 exists to harvest;
         a well-formed hash it does not know -> published:false, nothing named;
         anything that is not a 64-hex hash -> a REFUSAL in the control plane's
           own words, carrying the sentence read out of index.mjs above.
       `opts.verifyUnreachable` is set MID-SCENARIO rather than at construction:
       a plane that goes away between the page loading and the reader clicking
       Verify is the state the `catch` branch exists for, and it cannot be
       reached from a plane that was unreachable when the page was drawn. */
    if(op === "verify"){
      if(opts.verifyUnreachable) throw new TypeError("Failed to fetch");
      const sha = (url.searchParams.get("sha256") || "").toLowerCase();
      if(!/^[0-9a-f]{64}$/.test(sha)){
        const refused = say({ ok:false, error:VERIFY_REFUSAL });
        return { ok:false, status:400, json:async()=>refused };
      }
      /* THE OTHER TWO REFUSALS UI-37's SWEEP FOUND, keyed by SENTINEL HASHES so
         all four of `op=verify`'s states are driven inside the SAME scenario and
         this item does not enlarge the measurement basis on the surface it is
         actually about. Both are WELL-FORMED hashes: what makes them refusals is
         what the plane does with them, not their shape, which is the distinction
         the surface got wrong.
           NONE — an older plane that does not have the op at all (400).
           NOANS — the Durable Object threw and section 7a's `{ok:true,
             ...out.result}` spread handed the caller an empty success (200). No
             `ok:false`, so no transport seam could throw on it. */
      if(sha === NONE) return { ok:false, status:400,
        json:async()=>say({ ok:false, error:UNKNOWN_OP_REFUSAL, op }) };
      if(sha === NOANS) return { ok:true, status:200, json:async()=>({ ok:true }) };
      const m = VERIFY_MATCHES.get(sha);
      return R(say({ ok:true, published:!!m, sha256:sha, matches:m ? [{ ...m }] : [] }));
    }
    return { ok:false, json:async()=>({ ok:false, error:"unknown op " + op }) };
  }
  return { CALLS, SAID, fetch };
}

/* ---- a DOM stub with REAL class lists, and an element map that IS the walk:
   whatever the surface wrote to, this file harvests, so a surface nobody thought
   of is still measured. ---- */
function makeCtx(plane, hash){
  const els = new Map();
  function el(){
    const classes = new Set();
    const e = {
      classList:{ add:(...c)=>c.forEach(x=>classes.add(x)),
                  remove:(...c)=>c.forEach(x=>classes.delete(x)),
                  toggle:(c,on)=>{ if(on===undefined){ classes.has(c)?classes.delete(c):classes.add(c); }
                                   else if(on) classes.add(c); else classes.delete(c); },
                  contains:c=>classes.has(c) },
      classes, style:{}, dataset:{}, value:"", _html:"", textContent:"", scrollTop:0,
      disabled:false, offsetHeight:120, addEventListener(){}, removeEventListener(){},
      querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(p,h){ e._html += h; },
      focus(){}, click(){}, remove(){}, setAttribute(){}, getAttribute:()=>null, onclick:null, oninput:null,
    };
    Object.defineProperty(e,"innerHTML",{ get(){ return e._html; }, set(v){ e._html = v; } });
    return e;
  }
  const doc = {
    querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){},
    documentElement:{ _attrs:{}, setAttribute(k,v){ this._attrs[k]=v; }, getAttribute(k){ return this._attrs[k]; } },
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{ appendChild(){} },
  };
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
    IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;},
    clearTimeout(){}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({ matches:false }),
    document:doc, location:{ protocol:"https:", hash: hash || "" },
    history:{ pushState(){}, back(){}, replaceState(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,init)=>plane.fetch(u,init) };
  ctx.globalThis = ctx; vm.createContext(ctx); ctx.__els = els; ctx.__doc = doc;
  return ctx;
}

const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__signIn=signIn;globalThis.__previewShell=previewShell;"
  + "globalThis.__enterPublished=enterPublished;globalThis.__tokenConnect=tokenConnect;"
  + "globalThis.__toggleToken=()=>$(\"#g-token-toggle\").onclick();"
  + "globalThis.__setBase=v=>$(\"#g-base\").oninput({target:{value:v}});"
  /* UI-34: the published rail's second link, so walk 1b's control can be driven
     through the function the markup itself names. */
  + "globalThis.__pubVerifyPanel=pubVerifyPanel;";

function load(plane, hash){
  const ctx = makeCtx(plane, hash);
  vm.runInContext(SCRIPT + EXPORTS, ctx);
  return ctx;
}
const settle = () => new Promise(r => setTimeout(r, 0));

/* Everything the member could read, harvested from whatever the surface wrote
   to. Not a list of selectors — the map is populated by `app.html` itself. */
function harvest(ctx){
  const out = new Map();
  for(const [sel, e] of ctx.__els){
    const html = e._html || "";
    const text = e.textContent ? String(e.textContent) : "";
    if(html || text) out.set(sel, html + (text ? "\n" + text : ""));
  }
  return out;
}

/* ============================================================
   THE SCENARIOS — every surface a member can see before authenticating
   ============================================================
   Each declares WHICH entry point it exercises, and the cross-check below binds
   these declarations to what walks 1 and 2 discovered. A scenario dropped from
   this list fails the walk by name; a control or an address nobody drives fails
   the walk by name. */
const SCENARIOS = [];
async function scenario(key, label, spec){
  if(HID(key)) return;                            // NEGATIVE CONTROL (a)
  const rec = { key, label, controls:spec.controls || [], address:spec.address || null,
                pubControls:spec.pubControls || [], caseControls:spec.caseControls || [],
                surfaces:new Map(), said:[] };
  const plane = makePlane(spec.mode);
  const ctx = load(plane, spec.hash || "");
  if(spec.drive) await spec.drive(ctx, plane);
  await settle();
  rec.surfaces = harvest(ctx);
  /* A surface a member reads that no script wrote — the served markup itself.
     Carried as an explicit entry rather than injected into the DOM stub, so the
     harvest stays what `app.html` actually rendered. */
  for(const [k, v] of (spec.extra || [])) rec.surfaces.set(k, v);
  rec.said = plane.SAID.slice();
  rec.calls = plane.CALLS.slice();
  rec.ctx = ctx;
  SCENARIOS.push(rec);
  return rec;
}
const E = (c, sel) => c.__doc.querySelector(sel);

const SERVED = "app.html:#gate (served markup)";

/* 1 THE GATE AS IT IS SERVED. No script has run for the member yet: this is the
   markup itself — every label, hint and placeholder a member reads before
   touching anything, including the token panel's text, which is served with the
   page and merely revealed later. */
await scenario("gate-as-served", "the sign-in gate, as served", {
  controls:[], extra:[[SERVED, GATE]],
});

/* 2 THE TOKEN PANEL, revealed by the gate's own control. It RENDERS NOTHING NEW
   — its words are in the served markup above — so what is driven here is the
   reveal itself, and the marker below is the class flip rather than a string.
   The stub starts the panel in the class the markup serves it with, or the
   toggle would be measured against a state that never ships. */
await scenario("token-panel", "the token panel, revealed", {
  controls:["g-token-toggle"],
  drive:(ctx)=>{
    if(/id="g-token-wrap"[^>]*class="[^"]*\bhidden\b/.test(GATE))
      E(ctx, "#g-token-wrap").classList.add("hidden");
    ctx.__toggleToken();
  },
});

/* 3 THE PLANE ADDRESS FIELD, typed into. Also renders nothing new; what is
   driven is that the address a member types becomes the address the surface
   uses, before any credential exists. */
await scenario("plane-address", "a plane address typed at the gate", {
  controls:["g-base"],
  drive:(ctx)=>{ ctx.__setBase("https://plane.example"); },
});

/* 4 A REFUSED SIGN-IN — the surface this whole item is about. */
await scenario("refused-signin", "a refused sign-in", {
  controls:["g-signin"],
  drive:async(ctx)=>{
    E(ctx, "#g-handle").value = "member:m_alice";
    E(ctx, "#g-pw").value = "not the password";
    await ctx.__signIn();
  },
});

/* 5 A SIGN-IN AGAINST A PLANE THAT CANNOT BE REACHED. `teach()`'s fallback is
   this surface's own sentence and no plane sent it — the one refusal at the gate
   that is entirely the surface's, which is why it is driven separately. */
await scenario("unreachable-plane", "a sign-in against an unreachable plane", {
  controls:["g-signin"], mode:{ unreachable:true },
  drive:async(ctx)=>{
    E(ctx, "#g-handle").value = "member:m_alice";
    E(ctx, "#g-pw").value = "whatever";
    await ctx.__signIn();
  },
});

/* 6 CONNECT WITH AN EMPTY TOKEN — the gate's other refusal, also its own. */
await scenario("empty-token", "connect pressed with no token", {
  controls:["g-token-go"],
  drive:async(ctx)=>{ await ctx.__tokenConnect(); },
});

/* 7 THE PUBLIC RECORD — reached with NO credential, which is the product claim.
   `enterPublished()` calls the rail's own `pubList()`, so that control is driven
   here rather than by a second scenario doing the same thing. */
await scenario("public-record", "the published record, entered with no credential", {
  controls:["g-pub"], pubControls:["pubList"],
  drive:async(ctx)=>{ ctx.__enterPublished(); await settle(); },
});

/* 8 THE DESIGN PREVIEW — the whole working shell, rendered before sign-in. */
await scenario("design-preview", "the design preview, before any credential", {
  controls:["g-preview"],
  drive:(ctx)=>{ ctx.__previewShell(); },
});

/* 9 and 10 THE TWO PUBLISHED ADDRESSES, resolved AT LOAD by app.html's own
   top-level code — no gate, no sign-in, no handler of this file's. The hash is
   set before the script runs, exactly as a stranger's browser would. */
await scenario("published-address-at-load", "the published index address, opened by a stranger", {
  controls:[], address:"#published", hash:"#published",
  drive:async()=>{ await settle(); },
});
/* THE CASE PAGE, AND — ADDED BY UI-36, 2026-08-04 — ITS OWN CONTROLS, DRIVEN.
   `pubVerify(sha, into)` is the control this item is about: a PUBLIC,
   UNCREDENTIALED op's button that the case page renders FIVE times, that a
   stranger reaches holding nothing, and that renders the plane's OWN words back
   at them — `matches[0].path`, `.kind` and `.bundle_id`. Until now NO scenario
   clicked it, so those words were outside every reading DEC-49 is being answered
   against, and the plane-sourced column was a lower bound in a second way that
   had nothing to do with the two wire-shaped fixtures.
   IT IS DRIVEN INSIDE THIS SCENARIO RATHER THAN AS A TWELFTH ONE, and the
   reason is UI-34's own: a second scenario opening the same address would render
   the whole case page a second time and DOUBLE-COUNT every plane-sourced
   occurrence on the largest pre-authentication surface in the product — the
   delta would be a re-render rather than this control, which is exactly the
   indistinguishability UI-33 and UI-34 each went out of their way to avoid.
   Driving the buttons the page already rendered adds the verify panes and
   NOTHING ELSE. `UI31_HIDE=case-verify` hides the drive (and only the drive),
   which is the arm that puts this file back in the state it was in before this
   item; the walk 1c cross-check then names `pubVerify` as an uncredentialed
   control nobody drives.
   EVERY CALL IS THE PAGE'S OWN. The call sites are read out of the RENDERED
   html and EVALUATED AS WRITTEN — nothing is re-typed here, so this cannot
   drift from what a click actually does, and a sixth call site is driven the
   day the page renders one. */
const CASE_MODE = {};                       // mutated mid-drive; see the mock
const CASE_CALLS_DRIVEN = [];               // the call-site source, exactly as rendered
const unesc = s => String(s).replace(/&quot;/g,'"').replace(/&#39;/g,"'")
  .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
await scenario("case-address-at-load", "a published case address, opened by a stranger", {
  controls:[], address:"#case/", hash:"#case/" + CASE_ID, mode:CASE_MODE,
  caseControls:HID("case-verify") ? [] : ["pubVerify", "pubBytes"],
  drive:async(ctx)=>{
    await settle();
    if(HID("case-verify")) return;                        // NEGATIVE CONTROL (j)
    /* The address resolves through two awaits before the page exists, so the
       drive waits for the page rather than assuming a turn count. The bound is
       the point: a page that never arrives leaves `sites` empty and the walk
       1c reach assertion above fails naming it, instead of this drive silently
       clicking nothing. */
    for(let i = 0; i < 20 && !(ctx.__doc.querySelector("#pub-body")._html || "").includes("onclick="); i++)
      await settle();
    const body = ctx.__doc.querySelector("#pub-body")._html || "";
    const sites = [...body.matchAll(/onclick="((?:pubVerify|pubBytes)\([^"]*\))"/g)].map(m => unesc(m[1]));
    for(const call of sites){ CASE_CALLS_DRIVEN.push(call); await vm.runInContext(call, ctx); }
    await settle();
    /* THE REFUSAL, and it is a call THIS PAGE COMPOSES rather than one invented
       here: `pubCaseVerifyRows` fills the hash from
       `(findings.find(...) || {}).bundle_sha || ""`, so a case whose
       `verification` block names a finding the case body does not carry sends an
       EMPTY hash — which the control plane refuses in its own words. The `|| ""`
       fallback is pinned from the source below, so this drive is evidence about
       a reachable state and not a hypothetical. */
    const verifySites = sites.filter(c => c.startsWith("pubVerify("));
    const refusalCall = verifySites[0].replace(/\('[0-9a-f]*'/, "(''")
                                      .replace(/,'[^']*'\)$/, ",'#v-refused')");
    CASE_CALLS_DRIVEN.push(refusalCall); await vm.runInContext(refusalCall, ctx);
    /* THE OTHER THREE ANSWERS `op=verify` CAN GIVE — UI-37, 2026-08-04. Each is
       the PAGE'S OWN call site with only the hash and the container swapped, so
       what runs is what a click runs; nothing about the call is re-typed here.
       Every one of these hashes is WELL-FORMED, which is what makes the set a
       test of the surface's judgement rather than of its input validation:
         UNKNOWN — the plane answers, and answers `published:false`. THE TRUE
           NEGATIVE. It must still read as NOT PUBLISHED, or this item has
           merely collapsed the pair in the other direction.
         NONE    — the plane refuses because it does not have the op.
         NOANS   — the plane hands back an empty success with nothing in it. */
    for(const [hash, box] of [[UNKNOWN, "#v-notpublished"], [NONE, "#v-unknownop"], [NOANS, "#v-nonanswer"]]){
      const call = verifySites[0].replace(/\('[0-9a-f]*'/, "('" + hash + "'")
                                 .replace(/,'[^']*'\)$/, ",'" + box + "')");
      CASE_CALLS_DRIVEN.push(call); await vm.runInContext(call, ctx);
    }
    await settle();
    /* AND THE `catch` BRANCH: the plane goes away between the page being drawn
       and the reader clicking. The call is one of the page's own, redirected to
       its own container so the success reading above is not overwritten. */
    CASE_MODE.verifyUnreachable = true;
    const goneCall = verifySites[0].replace(/,'[^']*'\)$/, ",'#v-unreachable')");
    CASE_CALLS_DRIVEN.push(goneCall); await vm.runInContext(goneCall, ctx);
    await settle();
  },
});

/* 11 THE VERIFY PANE, opened from the published rail by somebody holding
   nothing — ADDED BY UI-34, 2026-08-04, AND IT MOVES THIS FILE'S MEASUREMENT
   BASIS ON PURPOSE.
   WHY IT WAS MISSING. `pubVerifyPanel()` renders a whole pre-authentication pane
   — "Check this without us", the sha256 paragraph, the verification claim this
   product rests on — and until walk 1b existed nothing in this file could
   discover it, because walk 1 reads `#gate` and this control is on `#pub`'s
   rail. So the surface a stranger reaches by clicking "Verify" was never
   measured, and UI-33 could reword its words without moving a number here.
   WHY UI-33 LEFT IT ALONE AND UI-34 DOES NOT. Adding a scenario ENLARGES the
   walk, which changes what "13 terms" and then "9 terms" were counted over — and
   DEC-49 is being answered against exactly that count. Changing the basis inside
   an item whose subject was the wording would have made the two indistinguishable
   in the report. It is changed here instead, alone, with the reading taken
   BEFORE and AFTER and both carried into MEASUREMENTS.md, so the change to the
   basis is visible rather than silent. THE NEW BASIS IS 11 SCENARIOS.
   IT ENTERS WITH `fromNav`, which is faithful and also isolates the delta: the
   rail is reachable however the member arrived, and skipping the index re-render
   means every occurrence this scenario adds is the verify pane's own. */
await scenario("published-verify-panel", "the Verify pane, opened from the published rail by a stranger", {
  controls:[], pubControls:["pubVerifyPanel"],
  drive:async(ctx)=>{ ctx.__enterPublished(true); ctx.__pubVerifyPanel(); await settle(); },
});

/* ============================================================
   12-15 THE TWO SIBLING PUBLIC READS, EACH IN BOTH DIRECTIONS
   — ADDED BY UI-37, 2026-08-04, AND THEY ENLARGE THE MEASUREMENT BASIS ON
   PURPOSE. 11 SCENARIOS -> 15.
   ============================================================
   WHY THEY EXIST. UI-37's brief required a sweep for whether the sibling public
   reads on this page shared `pubVerify`'s collapse. THEY DID, and the index's
   was the worse of the two: `pubList` read `(r && r.published) || []`, so a
   REFUSAL produced the empty state — "This group has not published any case
   files yet" — a substantive claim about the ENTIRE published record, made to a
   stranger, out of an answer the plane never gave. `pubOpen` had the milder
   form: it knew a refusal when it saw one and then printed `<h1>Not published</h1>`
   over every one of them, while reading only `detail` and therefore DROPPING the
   words of the two arms that carry `error`.
   WHY EACH IS DRIVEN TWICE. The correction has an obvious failure mode in the
   opposite direction — a surface so careful about refusals that it stops
   reporting a real absence — and the true negative is exactly what nobody would
   think to check after fixing the false one. So the index is driven both refused
   AND genuinely EMPTY, and the case is driven both refused AND genuinely
   NOT_PUBLISHED, with the store's own sentence read out of store.mjs.
   WHY THEY ARE SCENARIOS AND THE THREE NEW VERIFY ARMS ARE NOT. `harvest()` runs
   once at the end of a drive, so a second render into `#pl` or `#pub-body` would
   OVERWRITE the success reading that scenario exists to take. The verify panes
   each have their own container, so all four of `op=verify`'s states fit inside
   `case-address-at-load` and the basis does not move for them. The basis DOES
   move for these four, that is a change to what every number in the report below
   is counted over, and it is stated in MEASUREMENTS.md with its date rather than
   absorbed — UI-34's rule, applied to a bigger step than UI-34's.
   `UI31_HIDE` takes a comma list so all four can be hidden at once and the
   instrument shown not to have moved. */
await scenario("published-index-refused", "the published index, when the plane refuses", {
  controls:[], pubControls:[], mode:{ manifestArm:"unknownop" },
  drive:async(ctx)=>{ ctx.__enterPublished(); await settle(); },
});
await scenario("published-index-empty", "the published index, when this group has published nothing", {
  controls:[], pubControls:[], mode:{ manifestArm:"empty" },
  drive:async(ctx)=>{ ctx.__enterPublished(); await settle(); },
});
await scenario("case-address-refused", "a published case address, when the plane refuses", {
  controls:[], address:null, hash:"#case/" + CASE_ID, mode:{ caseArm:"unknownop" },
  drive:async(ctx)=>{ for(let i = 0; i < 20; i++) await settle(); },
});
await scenario("case-address-not-published", "a published case address the record does not hold", {
  controls:[], address:null, hash:"#case/" + CASE_ID, mode:{ caseArm:"notpublished" },
  drive:async(ctx)=>{ for(let i = 0; i < 20; i++) await settle(); },
});

/* ============================================================
   REACH — asserted, because a walk that covers nothing passes everything
   ============================================================ */
const KEYS = SCENARIOS.map(s => s.key);
const EXPECT_KEYS = ["gate-as-served","token-panel","plane-address","refused-signin","unreachable-plane",
                     "empty-token","public-record","design-preview","published-address-at-load",
                     "case-address-at-load","published-verify-panel"];
{
  const missing = EXPECT_KEYS.filter(k => !KEYS.includes(k));
  ok("REACH: every pre-authentication scenario was driven — MISSING: "
     + (missing.length ? missing.join(", ") : "none, " + KEYS.length + " driven"),
     missing.length === 0);
}
/* THE CROSS-CHECK THAT BINDS THE WALK TO THE COVERAGE. Walk 1 discovered which
   gate controls are entry points; this asserts every one of them is driven by
   some scenario. Add a control to the gate and this names it; drop a scenario
   and this names the control that lost its only driver. */
{
  const driven = new Set(SCENARIOS.flatMap(s => s.controls));
  const uncovered = BOUND.filter(id => !driven.has(id));
  ok("REACH: every BOUND gate control is driven by a scenario — UNCOVERED: "
     + (uncovered.length ? uncovered.join(", ") : "none, all " + BOUND.length),
     uncovered.length === 0);
}
/* AND THE SAME FOR THE PUBLISHED RAIL (UI-34). This is the arm that would have
   caught `pubVerifyPanel` from the day walk 1b existed: a control served on an
   uncredentialed surface that no scenario opens is a pre-authentication pane
   nobody is measuring. */
{
  const driven = new Set(SCENARIOS.flatMap(s => s.pubControls));
  const uncovered = PUB_CONTROLS.filter(f => !driven.has(f));
  ok("REACH: every control the PUBLISHED masthead serves to an uncredentialed reader is driven by a "
     + "scenario — UNCOVERED: " + (uncovered.length ? uncovered.join(", ") : "none, all "
     + PUB_CONTROLS.length + " [" + PUB_CONTROLS.join(", ") + "]"),
     uncovered.length === 0);
}
/* ============================================================
   WALK 1c — THE CONTROLS THE PUBLISHED CASE PAGE SERVES (UI-36, 2026-08-04)
   ============================================================
   WALK 1 READS THE GATE'S SERVED MARKUP AND WALK 1b THE PUBLISHED MASTHEAD'S,
   AND BOTH READ MARKUP THAT SHIPS IN THE FILE. THE CASE PAGE'S CONTROLS ARE
   WRITTEN BY SCRIPT, out of what the plane answered, so no read of `app.html`
   discovers them at all — and that is the second half of the class walk 1b
   opened. `pubVerify` renders five times on a page a stranger arrives on
   directly, asks a public op, and prints the plane's answer; nothing in this
   file could see it, and nothing in this file could see that nobody drove it.
   SO THIS WALK READS THE PAGE AS RENDERED, from the harvest of the scenario
   that opened the address — discovery by WALKING and not by reading, which is
   the only kind that finds a control the source does not spell out.
   EVERY CONTROL IT FINDS MUST BE ACCOUNTED FOR, in one of two ways, and both
   are evidence rather than a list: a scenario DRIVES it, or the load-time
   router's own body NAMES it (which is how `pubOpen` is driven — the address
   itself calls it, and that is read out of `publishedRouteFromHash`). A sixth
   name on this page fails here until somebody says which it is. */
const CASE_PAGE_HTML = (S => S ? (S.surfaces.get("#pub-body") || "") : "")(SCENARIOS.find(s => s.key === "case-address-at-load"));
const CASE_SITES = [...CASE_PAGE_HTML.matchAll(/onclick="([A-Za-z0-9_]+)\(/g)].map(m => m[1]);
const CASE_CONTROLS = [...new Set(CASE_SITES)].sort();
const CASE_SITE_COUNT = t => CASE_SITES.filter(x => x === t).length;
ok("WALK 1c REACH: the published CASE PAGE was read as RENDERED and carries controls — "
   + CASE_SITES.length + " call sites over [" + CASE_CONTROLS.join(", ") + "]",
   CASE_PAGE_HTML.length > 2000 && CASE_SITES.length >= 8 && CASE_CONTROLS.length === 4);
ok("WALK 1c REACH: it serves exactly the uncredentialed controls this walk has classified — found ["
   + CASE_CONTROLS.map(c => c + " x" + CASE_SITE_COUNT(c)).join(", ")
   + "] (a fifth must be driven or classified before this passes)",
   ["pubBytes","pubList","pubOpen","pubVerify"].every(f => CASE_CONTROLS.includes(f)));
/* AND THE COUNT THIS ITEM WAS ROUTED ON, MEASURED RATHER THAN QUOTED: five
   Verify buttons on one case page, each on a different hash — the finding's, the
   manifest's, both parts', and the container row's. */
ok("WALK 1c REACH: pubVerify is rendered " + CASE_SITE_COUNT("pubVerify")
   + " times on this one case page, to a reader holding nothing", CASE_SITE_COUNT("pubVerify") === 5);
{
  const driven = new Set(SCENARIOS.flatMap(s => [...s.caseControls, ...s.pubControls]));
  /* `pubOpen` is driven BY THE ADDRESS: the load-time router calls it, which is
     read out of the router's own body rather than asserted here. */
  const byRouter = CASE_CONTROLS.filter(f => new RegExp("\\b" + f + "\\(").test(PUBROUTE));
  const uncovered = CASE_CONTROLS.filter(f => !driven.has(f) && !byRouter.includes(f));
  ok("REACH: every control the published CASE PAGE serves to an uncredentialed reader is driven — "
     + "UNCOVERED: [" + (uncovered.join(", ") || "none") + "] · driven by a scenario: ["
     + [...driven].sort().join(", ") + "] · driven by the load-time address itself: ["
     + byRouter.join(", ") + "]",
     uncovered.length === 0);
}

/* And the same for walk 2's address shapes: each shape the load-time router
   matches must be opened by a scenario. This is the arm that keeps
   `case-address-at-load` load-bearing — it renders into `#pub-body` like the
   index does, so a selector-only check would not notice its absence. */
{
  const driven = SCENARIOS.map(s => s.address).filter(Boolean);
  const undriven = ADDRESS_SHAPES.filter(sh =>
    !driven.some(a => sh.includes(a.replace(/^#/, "").replace(/\/$/, ""))));
  ok("REACH: every published ADDRESS SHAPE the load-time router matches is opened by a scenario — "
     + "UNDRIVEN: " + (undriven.length ? undriven.join(" , ") : "none, both driven as [" + driven.join(", ") + "]"),
     undriven.length === 0 && driven.length === 2);
}
/* THE SURFACES ACTUALLY WALKED, by name and by count. */
const ALL_SURFACES = [...new Set(SCENARIOS.flatMap(s => [...s.surfaces.keys()]))].sort();
/* UI-36 added the five verify panes the case page's own buttons write into, plus
   the two containers the refusal and the transport-failure drives are aimed at.
   They are SURFACES in their own right — a reader watches the answer appear
   beside the hash they clicked — and they carry plane-sourced text, which is the
   whole of what this item found. */
const EXPECT_SURFACES = ["#content","#g-err","#m-grp","#m-handle","#m-idstr",
                         "#p-gid","#p-gname","#p-mono","#pl","#pub-body","#rail", SERVED,
                         "#v-c-" + FIND_ID, "#v-f-" + FIND_ID, "#v-man",
                         "#v-part-" + SHA.slice(0, 12), "#v-part-" + CAP.slice(0, 12),
                         "#v-refused", "#v-unreachable",
                         /* UI-37, 2026-08-04 — the three answers `op=verify` can
                            give that UI-36's drive never asked for: a well-formed
                            hash the record genuinely does not hold (the TRUE
                            negative), an older plane that does not have the op,
                            and the empty success section 7a produces when the
                            Durable Object throws. */
                         "#v-notpublished", "#v-unknownop", "#v-nonanswer"];
{
  const missing = EXPECT_SURFACES.filter(s => !ALL_SURFACES.includes(s));
  const extra   = ALL_SURFACES.filter(s => !EXPECT_SURFACES.includes(s));
  ok("REACH: the walk covers exactly the pre-authentication surfaces it claims — "
     + "STOPPED COVERING: [" + (missing.join(", ") || "nothing") + "] · "
     + "NEWLY RENDERED AND UNCLASSIFIED: [" + (extra.join(", ") || "nothing") + "] · "
     + "walked " + ALL_SURFACES.length + ": " + ALL_SURFACES.join(", "),
     missing.length === 0 && extra.length === 0);
}
/* EVERY SCENARIO RENDERED ITS OWN SUBJECT. A scenario that silently produced an
   error pane, or nothing at all, would enlarge the walk's claimed reach while
   measuring nothing — the zero-cost outcome arriving in the instrument. */
const S = k => SCENARIOS.find(x => x.key === k);
const textOf = (k, sel) => { const s = S(k); return s && s.surfaces.get(sel) || ""; };
const allOf = k => { const s = S(k); return s ? [...s.surfaces.values()].join("\n") : ""; };
if(S("gate-as-served"))
  ok("REACH: the gate scenario carries the served markup, sign-in control and all",
     textOf("gate-as-served", SERVED).includes('id="g-signin"')
     && /Sign in to open this group's working record/.test(textOf("gate-as-served", SERVED)));
if(S("token-panel"))
  ok("REACH: the token panel scenario actually revealed the panel",
     !S("token-panel").ctx.__doc.querySelector("#g-token-wrap").classList.contains("hidden"));
if(S("plane-address"))
  ok("REACH: the plane-address scenario actually set the address on the surface",
     S("plane-address").ctx.__PLANE.base === "https://plane.example");
if(S("refused-signin")){
  ok("REACH: the refused sign-in reached op=login with NO credential and was refused",
     S("refused-signin").calls.some(c => c.op === "login" && c.token === null)
     && S("refused-signin").ctx.__PLANE.session !== true);
  ok("REACH: and the gate rendered the plane's own sentence, whole — which is the subject of this item",
     REFUSAL_SENTENCE.length > 0 && textOf("refused-signin", "#g-err").includes(REFUSAL_SENTENCE));
}
if(S("unreachable-plane"))
  ok("REACH: the unreachable-plane scenario rendered this surface's OWN fallback sentence",
     /Could not reach the plane/.test(textOf("unreachable-plane", "#g-err")));
if(S("empty-token"))
  ok("REACH: the empty-token scenario rendered the gate's own refusal and sent nothing",
     /paste a token first/.test(textOf("empty-token", "#g-err")) && S("empty-token").calls.length === 0);
if(S("public-record")){
  ok("REACH: the public record was reached with NO credential on the wire",
     S("public-record").calls.some(c => c.op === "publishedmanifest" && c.token === null)
     && S("public-record").calls.every(c => c.token === null));
  ok("REACH: and it listed the group's published case rather than the empty statement",
     textOf("public-record", "#pl").includes(CASE_ID)
     && !/has not published any case files/i.test(textOf("public-record", "#pl")));
}
if(S("design-preview"))
  ok("REACH: the design preview rendered the working shell with no credential and asked the plane nothing",
     textOf("design-preview", "#rail").length > 500
     && /Preview mode/.test(textOf("design-preview", "#content"))
     && S("design-preview").calls.length === 0);
if(S("published-address-at-load"))
  ok("REACH: the #published address resolved AT LOAD, uncredentialed, from app.html's own top-level code",
     S("published-address-at-load").calls.some(c => c.op === "publishedmanifest" && c.token === null)
     && S("published-address-at-load").ctx.__doc.documentElement.getAttribute("data-space") === "published");
if(S("case-address-at-load"))
  ok("REACH: the #case/<id> address resolved AT LOAD and drew the case, not a not-published pane",
     S("case-address-at-load").calls.some(c => c.op === "publishedcase" && c.token === null)
     && textOf("case-address-at-load", "#pub-body").includes("Was the sewer transfer authorised?")
     && !/Not published/.test(textOf("case-address-at-load", "#pub-body")));
/* THE PLANE'S SENTENCES ON THE CASE PAGE ARE RENDERED WHOLE — ADDED BY UI-33,
   2026-08-04, AND IT CLOSES A GAP THIS ITEM'S OWN NEGATIVE CONTROL FOUND.
   The refused-signin arm above pins the plane's refusal sentence verbatim at the
   GATE, so a surface that edited THAT is caught by name. Nothing pinned the same
   thing on the published case page — and that page is the LARGEST
   pre-authentication surface in the product and the one a stranger actually
   arrives on. MEASURED, not supposed: with `verification.detail` rendered through
   a `.replace("this instance","this group")` at `pubCasePages`, this file ran
   **31 of 31 GREEN, exit 0**, and the only thing that moved was the REPORT (the
   `this instance` row went x3 to x2 and lost its case-page plane source). A
   surface silently translating a plane sentence — the precise move DEC-8 forbids
   and the precise thing UI-33 was told not to do — was invisible to every
   assertion here.
   It is a REACH assertion and not a vocabulary one: it says the plane's own
   string arrives on the page unedited, which is what makes the attribution below
   mean anything. The sentence is taken from the fixture rather than typed, so
   this cannot drift from what the mock actually answers.
   ITS SUBJECT IS `verification.detail` AND ONLY THAT, and the narrowing is
   measured rather than assumed. The first version of this arm also required the
   answer's TOP-LEVEL `detail` and FAILED on the clean file: for a case that was
   FOUND, `op=publishedcase`'s `detail` is rendered nowhere — `app.html` prints it
   only on the not-found branch and on the not-a-case branch. That is reported
   here rather than smoothed away, and it is not this item's to change: whether a
   found case should show the plane's own one-line description is a rendering
   question inside UI-29's ground. What matters for THIS arm is that a sentence
   nothing renders cannot be pinned as rendered-whole, so the arm pins the one
   sentence this page does print. */
if(S("case-address-at-load"))
  ok("REACH: and it rendered the plane's OWN sentence WHOLE — `verification.detail`, neither "
     + "edited, shortened nor re-spelled by this surface (DEC-8: a surface may render what it "
     + "received and may never compose or translate it)",
     !!CASE_ANSWER.verification.detail
     && textOf("case-address-at-load", "#pub-body").includes(esc(CASE_ANSWER.verification.detail)));
/* ============================================================
   THE VERIFY CONTROL, IN ALL SIX OF ITS STATES — UI-36, 2026-08-04
   EXTENDED FROM FOUR TO SIX BY UI-37, 2026-08-04
   ============================================================
   `pubVerify` is the only PUBLIC OP a pre-authentication surface CALLS on the
   reader's behalf. Everything else on these surfaces is either the page the
   plane drew at load or the surface's own prose. So its states are pinned one by
   one, and under UI-36 two of the four were findings rather than confirmations.
   WHY THERE ARE NOW SIX. UI-37 was routed naming ONE refusal and instructed to
   sweep `index.mjs` rather than trust that count. The sweep found three refusals
   reaching this control, not one, and the two extra ones are not decoration:
   `unknown op` is what a surface deployed ahead of its plane gets and civicos-ui
   ships on its own schedule, and the EMPTY SUCCESS from section 7a's
   `{ok:true, ...out.result}` spread is the arm that settled how the defect had to
   be fixed — it carries no `ok:false` at all, so a transport seam that threw on
   `ok:false` would have sailed straight past it and left the surface still
   telling a stranger NOT PUBLISHED. The sixth state is the one nobody would
   think to add after fixing the other five: THE TRUE NEGATIVE, driven with a
   well-formed hash the record genuinely does not hold, because a surface that
   stops calling a refusal a negative must not start calling a negative a
   refusal. */
if(S("case-address-at-load") && !HID("case-verify")){
  const sc = S("case-address-at-load");
  const asked = sc.calls.filter(c => c.op === "verify");
  ok("REACH: the case page's own Verify buttons were driven AS THE PAGE WROTE THEM — " + CASE_CALLS_DRIVEN.length
     + " call sites evaluated verbatim, " + asked.length + " of them reaching op=verify, EVERY ONE with no "
     + "credential on the wire (a public op asked by somebody holding nothing is the product claim)",
     CASE_CALLS_DRIVEN.length === 14 && asked.length === 10 && asked.every(c => c.token === null)
     && sc.calls.every(c => c.token === null));
  /* (1) THE SUCCESS BRANCH, WHICH IS WHY THIS ITEM EXISTS. The plane names the
     part, its kind and the bundle it sits in, and the surface prints all three
     verbatim. The expected strings come from the fixture the mock answered
     rather than being typed, so this arm cannot drift from what the plane said.
     THIS IS PLANE-SOURCED TEXT ON A PRE-AUTHENTICATION SURFACE, and it is new
     to the report below — DEC-49's subject grew here. */
  const m = VERIFY_MATCHES.get(SHA);
  const okPane = textOf("case-address-at-load", "#v-f-" + FIND_ID);
  ok("REACH: the SUCCESS branch rendered the plane's answer WHOLE — the part it names ("
     + JSON.stringify(m.path) + "), its kind and the bundle it sits in, neither edited nor re-spelled "
     + "(DEC-8: a surface may render what it received and may never compose or translate it)",
     /PUBLISHED\./.test(okPane) && okPane.includes(esc(m.path)) && okPane.includes(esc(m.kind))
     && okPane.includes(esc(m.bundle_id)));
  /* (2) THE NOT-PUBLISHED BRANCH, AND UI-37 CORRECTED HOW IT IS CHECKED — read
     the reason, because the old form would have passed while wrong.
     **AS UI-36 WROTE IT, THIS ARM ASSERTED `VERIFY_MATCHES.size === 3`.** That
     is a statement about the FIXTURE, not about the surface: it says three
     hashes were put in a map. Nothing in it drove the branch, nothing in it read
     a pane, and it would have stayed green through every change UI-37 makes —
     including a version that collapsed the true negative INTO the refusal, which
     is the exact opposite error and the one this item is most at risk of
     introducing. It is CORRECTED to a drive (2026-08-04), never exempted: a
     well-formed hash the published projection genuinely does not hold is asked,
     and the pane is harvested and read.
     WHAT MUST BE TRUE OF IT, and both halves matter. The sentence must still be
     the negative — the plane said `published:false`, so saying so is reporting
     what it said. AND its second clause must survive verbatim: "a hash that was
     never ratified and a hash that never existed are the same answer here,
     deliberately" is TRUE of this answer, and it was the honest half of the
     sentence that D-195 found standing over refusals. UI-37 moved it here rather
     than deleting it, which is the whole difference between fixing this defect
     and blunting the surface. */
  const notPublishedPane = textOf("case-address-at-load", "#v-notpublished");
  ok("REACH, AND IT IS THE OTHER DIRECTION OF THE COLLAPSE: a WELL-FORMED hash the published projection "
     + "does not hold is answered published:false, and it STILL reads as the negative it is — with the "
     + "clause that explains why an unratified hash and a nonexistent one are one answer kept VERBATIM, "
     + "because that clause is true HERE and was false where D-195 found it",
     /NOT PUBLISHED\./.test(notPublishedPane)
     && /No published part answers to that hash/.test(notPublishedPane)
     && /never ratified and a hash that never existed are the same answer here, deliberately/
        .test(notPublishedPane)
     && !notPublishedPane.includes(VERIFY_REFUSAL)
     && !/NOT ANSWERED/.test(notPublishedPane)
     && sc.calls.some(c => c.op === "verify"));
  /* (3) THE REFUSAL.
     **CORRECTED 2026-08-04 BY UI-37, WHICH IS WHAT THIS ASSERTION ASKED FOR AT
     THE SITE — read the previous form before assuming this one is routine.**
     UI-36 wrote this arm to pin a DEFECT and said so here: `op=verify` refuses a
     malformed hash in the control plane's own words, `apiQ` — unlike `rec` — does
     not throw on `ok:false`, so the refusal arrived as an ordinary value with
     `published` undefined, fell into the NOT-PUBLISHED branch, and told an
     uncredentialed reader "No published part answers to that hash". The old
     assertion therefore required the pane to say NOT PUBLISHED and required the
     plane's refusal to be ABSENT from it. **Every one of those requirements is
     now exactly backwards**, which is why a pin written to hold a defect has to
     be corrected the day the defect goes and can never be exempted: left alone
     it would have gone red for the fix and green for the bug.
     WHAT IS PINNED NOW: the pane says the question was NOT ANSWERED, it does not
     say NOT PUBLISHED, and it carries the plane's own refusal sentence WHOLE —
     neither edited nor re-spelled, which is DEC-8 and is also why this arm is a
     new row in DEC49_SUBJECT below. Reachable by a click, unchanged: the
     container row still fills its hash from `bundle_sha || ""`, and that is
     pinned separately from app.html's source directly below. */
  const refusedPane = textOf("case-address-at-load", "#v-refused");
  ok("CORRECTED 2026-08-04 (UI-37, D-195) FROM THE ASSERTION THAT PINNED THE DEFECT: the plane REFUSED "
     + "the question in its own words (" + JSON.stringify(VERIFY_REFUSAL) + ") and the reader is now told "
     + "the QUESTION was not answered, in the plane's own sentence rendered WHOLE — not that the RECORD "
     + "has no such hash. A declined question and a genuine absence are two sentences here",
     /NOT ANSWERED\./.test(refusedPane)
     && refusedPane.includes(esc(VERIFY_REFUSAL))
     && !/NOT PUBLISHED\./.test(refusedPane)
     && !/No published part answers to that hash/.test(refusedPane));
  /* And the call that produces it is one the page COMPOSES, read out of
     app.html rather than supposed: the container row's hash falls back to the
     empty string when the plane's `verification` block names a finding the case
     body does not carry. */
  ok("and the empty hash that reaches it is composed by the page itself — the container row's "
     + "`bundle_sha || \"\"` fallback, read out of app.html",
     /pubVerify\('\$\{esc\(String\(\(findings\.find[\s\S]{0,80}?bundle_sha \|\| ""\)\)\}'/.test(APP_SRC));
  /* (4) THE `catch` BRANCH — THE ITEM'S OWN PREMISE, AND THE MEASUREMENT
     CONTRADICTS IT. UI-36 was routed on the reading that this branch "prints
     `e.error || e.reason` verbatim under DEC-8". IT CANNOT. `apiQ` reaches the
     plane through `api`, which is `fetch(...).then(r => r.json())` and rejects
     only on a transport failure or a body that is not JSON — neither of which
     carries an `error` or a `reason` — so the expression always falls through
     to this surface's own fallback sentence. The branch is DEC-8-shaped code
     that no plane string can reach, which is why arm (k) below moves nothing.
     Measured, not read: the plane is taken away and the pane is harvested. */
  const gonePane = textOf("case-address-at-load", "#v-unreachable");
  ok("MEASURED: the ERROR branch renders NO plane word at all. The plane went away between the page "
     + "being drawn and the reader clicking, and every word in the pane is this surface's own — "
     + "`e.error || e.reason` has no value to render, because apiQ rejects only with a transport error",
     /Could not ask\./.test(gonePane) && /the record did not answer/.test(gonePane)
     && !gonePane.includes(VERIFY_REFUSAL));
  /* (5) THE SECOND REFUSAL UI-37's SWEEP FOUND — `unknown op`, which is what a
     surface reaching a plane older than itself is told. It is driven because
     `civicos-ui` carries no version number and its deploy is explicitly NOT
     gated on a plane release (`kickoffs/UI.md`), so a stranger's browser talking
     to an instance that predates `op=verify` is an ordinary Tuesday. The plane's
     wording here is terse and it is still the plane's; the surface renders it
     and adds nothing about the record. */
  const unknownPane = textOf("case-address-at-load", "#v-unknownop");
  ok("REACH: the SECOND refusal — a plane that does not have the op at all (" + JSON.stringify(UNKNOWN_OP_REFUSAL)
     + "), which is what a surface deployed ahead of its plane receives — reads as NOT ANSWERED carrying "
     + "the plane's own word, and never as a statement about the record",
     /NOT ANSWERED\./.test(unknownPane) && unknownPane.includes(esc(UNKNOWN_OP_REFUSAL))
     && !/NOT PUBLISHED\./.test(unknownPane)
     && !/No published part answers to that hash/.test(unknownPane));
  /* (6) THE THIRD, AND IT IS THE ARM THAT DECIDED THE DESIGN. Section 7a spreads
     `out.result` into a `{ok:true}` envelope without checking `out.ok`, so a
     Durable Object failure arrives here as HTTP 200, `{ok:true}`, no
     `published`, no `matches` and NO `ok:false` anywhere for a transport seam to
     throw on. **This is the measured reason `apiQ` was left unchanged**: making
     it throw on `ok:false` the way `rec` does would not have closed this arm,
     and the surface would still have told a stranger NOT PUBLISHED. The pane has
     no plane sentence to render, so it says only what this surface can honestly
     observe — that it has no answer — and it invents no reason for one.
     WHEN THE PLANE IS FIXED, this arm's fixture stops matching the plane and the
     SEVENA_SPREAD assertion near the top of this file is what says so. */
  const nonAnswerPane = textOf("case-address-at-load", "#v-nonanswer");
  ok("REACH, AND IT IS WHY THE FIX IS A SHAPE TEST RATHER THAN A THROWING SEAM: an answer that is not an "
     + "answer and is not ok:false either — {ok:true} at HTTP 200, section 7a's spread of an absent "
     + "`result` — reads as NOT ANSWERED with NO reason invented for it, where a seam throwing on "
     + "ok:false would have passed it through to NOT PUBLISHED",
     /NOT ANSWERED\./.test(nonAnswerPane)
     && /the record did not say why/.test(nonAnswerPane)
     && !/The record's own words/.test(nonAnswerPane)
     && !/NOT PUBLISHED\./.test(nonAnswerPane)
     && !/No published part answers to that hash/.test(nonAnswerPane));
  /* AND THE SEAM IS PINNED AS UNCHANGED, from app.html's own source. UI-37's
     judgement was to fix at the three sites rather than in `apiQ`, and a later
     reader must be able to see that `apiQ` still does not throw — otherwise the
     reasoning recorded at `pubVerify` describes a file that no longer exists.
     The sweep's REACH is asserted as a DELTA rather than as an absolute count
     (REC-48's lesson, and the sixth time this discipline was needed): what is
     pinned is that `apiQ` has exactly the three callers this item swept and that
     none of them lost its own error path. */
  const APIQ_CALLERS = [...APP_SRC.matchAll(/apiQ\("([a-z]+)"/g)].map(m => m[1]).sort();
  ok("SWEEP: `apiQ` is UNCHANGED and still does not throw on ok:false — it opens the envelope and returns "
     + "the value, exactly as before — and its callers are the " + APIQ_CALLERS.length + " this item swept ["
     + APIQ_CALLERS.join(", ") + "], each keeping its own error path rather than being routed into one "
     + "generic catch",
     /async function apiQ\(op, params\)\{\n  const j = await api\(op, null, params\|\|\{\}\);\n  return \(j && j\.result !== undefined\) \? j\.result : j;\n\}/.test(APP_SRC)
     && APIQ_CALLERS.length === 3
     && APIQ_CALLERS.join(",") === "publishedcase,publishedmanifest,verify");
}

/* AND THE NEW SCENARIO RENDERED ITS OWN SUBJECT (UI-34). The verify pane is the
   product's verification CLAIM, addressed to somebody holding nothing, and it is
   this surface's OWN prose throughout — no plane string reaches it, which is why
   it can be reworded at all and why UI-33 could. The marker is the pane's own
   headline rather than a term from the sweep, so this arm cannot be satisfied by
   the very words it exists to make measurable. */
if(S("published-verify-panel"))
  ok("REACH: the Verify pane opened from the published rail with NO credential, rendered its own subject, "
     + "and asked the plane nothing",
     /Check this without us/.test(textOf("published-verify-panel", "#pub-body"))
     && /Verifying what you are reading/.test(textOf("published-verify-panel", "#pub-body"))
     && S("published-verify-panel").calls.every(c => c.token === null));

/* ============================================================
   THE TWO SIBLING PUBLIC READS, EACH IN BOTH DIRECTIONS — UI-37, 2026-08-04
   ============================================================
   UI-37's brief required a sweep for whether the siblings on this page shared
   `pubVerify`'s collapse. Both did. These four arms are the sweep's result made
   permanent, and each pair is a pair on purpose: the false negative and the
   true one are told apart by ONE field of the plane's answer, and an item that
   fixed the first while breaking the second would have moved the lie rather than
   removed it. */
if(S("published-index-refused")){
  const pane = textOf("published-index-refused", "#pl");
  ok("REACH, AND IT IS THE WORSE OF THE TWO SIBLINGS: the published INDEX, refused by the plane, no longer "
     + "tells a stranger that this group has published nothing — a claim about the ENTIRE record made out "
     + "of an answer that was never given. It renders the plane's own word (" + JSON.stringify(UNKNOWN_OP_REFUSAL)
     + ") and says what it cannot say",
     pane.includes(esc(UNKNOWN_OP_REFUSAL))
     && !/has not published any case files yet/.test(pane)
     && /cannot say what this group has published/.test(pane)
     && S("published-index-refused").calls.every(c => c.token === null));
}
if(S("published-index-empty")){
  const pane = textOf("published-index-empty", "#pl");
  ok("REACH: and a group that genuinely HAS published nothing still reads as exactly that — the plane "
     + "answered, the answer was an empty list, and the empty state is the truth about it. The two must "
     + "not collapse in this direction either",
     /has not published any case files yet/.test(pane)
     && !pane.includes(esc(UNKNOWN_OP_REFUSAL))
     && !/cannot say what this group has published/.test(pane)
     && /verify it against its published hash/.test(pane));
}
if(S("case-address-refused")){
  const pane = textOf("case-address-refused", "#pub-body");
  ok("REACH: a published case ADDRESS opened against a plane that refuses no longer gets the heading "
     + "\"Not published\" — the plane declined the question and the page says so, carrying the refusal's "
     + "own words, which the old branch dropped entirely because it read only `detail` and this arm "
     + "carries `error`",
     /Not answered/.test(pane) && pane.includes(esc(UNKNOWN_OP_REFUSAL))
     && !/<h1>Not published<\/h1>/.test(pane)
     && !/No published edition answers to that\./.test(pane)
     && S("case-address-refused").calls.every(c => c.token === null));
}
if(S("case-address-not-published")){
  const pane = textOf("case-address-not-published", "#pub-body");
  ok("REACH: and the STORE's own NOT_PUBLISHED still reads as \"Not published\", with the store's own "
     + "sentence rendered WHOLE and its bare reason code kept off a stranger's screen because the plane "
     + "sent prose beside it (UI-30's rule: the sentence when there is one, the bare reason when there "
     + "is not, never a blank and never a translation)",
     /<h1>Not published<\/h1>/.test(pane)
     && pane.includes(esc(CASE_NOT_PUBLISHED.detail))
     && !/Not answered/.test(pane)
     && !/NOT_PUBLISHED/.test(pane));
}
/* And the walk is not thin: a harvest of a few hundred characters would satisfy
   every assertion above while measuring almost nothing. */
{
  const chars = SCENARIOS.reduce((a,s)=>a + [...s.surfaces.values()].join("").length, 0);
  ok("REACH: the walk harvested " + chars + " characters of member-facing pre-authentication surface",
     chars > 30000);
}

/* ============================================================
   WALK 3 — THE TERM LIST, HARVESTED FROM THE SIBLING GUARDS
   ============================================================
   Every member-facing vocabulary sweep in this directory has the same shape: a
   `for(const word of [...])` whose body asserts `!html.includes(word)`. They are
   read here rather than copied, so this guard polices, on the pre-authentication
   surfaces, exactly the vocabulary its siblings already police on theirs — and
   it cannot fall behind them. Sweeps that are not substring sweeps (the
   publication-entry reversibility sweep builds a RegExp) are excluded by the
   `includes(word)` requirement, because their entries are ordinary English. */
function harvestSiblingTerms(){
  if(EMPTY_TERMS) return { terms:[], files:[] };   // NEGATIVE CONTROL (b)
  const files = fs.readdirSync(HERE).filter(f => f.endsWith(".test.mjs") && path.join(HERE,f) !== SELF).sort();
  const terms = new Set(); const from = [];
  for(const f of files){
    const src = fs.readFileSync(path.join(HERE, f), "utf8");
    let hit = 0;
    for(const m of src.matchAll(/for\(const word of \[([\s\S]*?)\]\)([\s\S]{0,300})/g)){
      if(!m[2].includes("includes(word)")) continue;
      for(const lit of m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)){ terms.add(JSON.parse('"' + lit[1] + '"')); hit++; }
    }
    if(hit) from.push(f + "(" + hit + ")");
  }
  return { terms:[...terms].sort(), files:from };
}
const SIBLING = harvestSiblingTerms();
/* THE FOUR PHRASES DEC-49 ITSELF QUOTES, added on top and declared as added.
   They are not identifiers, so no sibling sweep contains them; a measurement
   that could not see the very words the open decision is about would be
   worthless. Nothing else is added by hand. */
const DEC49_PHRASES = ["no active credential", "a salted derivation", "its stored hash", "this instance"];
const TERMS = [...new Set([...SIBLING.terms, ...(EMPTY_TERMS ? [] : DEC49_PHRASES)])];

ok("WALK 3 REACH: the term list was harvested from the sibling sweeps and is not empty — read "
   + SIBLING.files.length + " suites [" + SIBLING.files.join(", ") + "]",
   SIBLING.terms.length > 0 && SIBLING.files.length >= 8);
ok("WALK 3 REACH: it inherits " + SIBLING.terms.length + " terms from the siblings, including the ones "
   + "every one of them polices", ["op=", "capture_sha", "bundle_id"].every(t => SIBLING.terms.includes(t)));
ok("WALK 3 REACH: and it carries the four phrases DEC-49 quotes, so the measurement can see its own subject",
   DEC49_PHRASES.every(p => TERMS.includes(p)));

/* ============================================================
   ATTRIBUTION — who wrote each word
   ============================================================
   A term occurrence is PLANE-SOURCED when it sits inside a run of text the plane
   supplied, raw or escaped; otherwise this surface wrote it. Per occurrence, not
   per term: the same word is plane-sourced in one place and surface-authored in
   another, and collapsing that would misreport who has to act. */
function planeRanges(html, said){
  if(NO_PLANE_RANGES) return [];                   // NEGATIVE CONTROL (c)
  const ranges = [];
  /* A surface may render a LINE of what the plane sent rather than the whole of
     it — `sig_armored`'s first line is the case page's signature row — so each
     line counts as plane territory in its own right. Without this an excerpt of
     the plane's own bytes reads as words this surface wrote. */
  const parts = [...new Set(said.flatMap(s => [s, ...String(s).split("\n")]))];
  for(const s of parts){
    for(const v of [s, esc(s)]){
      if(v.length < 8) continue;
      let i = html.indexOf(v);
      while(i >= 0){ ranges.push([i, i + v.length]); i = html.indexOf(v, i + 1); }
    }
  }
  return ranges;
}
const inside = (ranges, a, b) => ranges.some(r => r[0] <= a && r[1] >= b);
/* WHAT A MEMBER ACTUALLY READS. The sibling sweeps run over rendered HTML,
   attributes and all, and this one does too so the two are comparable — but a
   term that only ever appears inside a `data-` attribute or a class name is not
   the same finding as one printed on the page, and DEC-49 turns on what a member
   READS. So every count is reported twice: over the HTML, and over the visible
   text with tags removed and entities resolved. */
const visibleText = h => String(h).replace(/<[^>]*>/g, " ")
  .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"')
  .replace(/&middot;/g,"·").replace(/&hellip;/g,"…").replace(/&rarr;/g,"→").replace(/&larr;/g,"←");

/* THE STRUCTURAL DETECTOR, which is a RULE rather than a list and so cannot fall
   behind. Any SCREAMING_SNAKE_CASE identifier standing on a member-facing
   surface is machine vocabulary by its shape alone — no list has to be kept
   current for it to be caught, and it is how `MEMBER_TOKEN` (printed as a FIELD
   LABEL at the gate) is found. The inherited term list would never have had it:
   no sibling surface shows it, because no sibling surface is the gate. */
const SNAKE = /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g;
/* The second structural rule, and it needed a discriminator to be worth having.
   A bare ALL-CAPS token is either an ACRONYM (`R2`, `CORS`, `SSH`) or ordinary
   EMPHASIS (`THE WHOLE CASE`), and this surface uses a lot of the second. The
   rule that separates them without a dictionary and without a list: an emphasis
   word is a word, so it also appears in ordinary case somewhere on the same
   surface; an acronym does not. Measured before it was adopted — with the
   discriminator off, this arm reported `THE`, `WHOLE`, `WAS`, `OUT`, `OWN` and,
   worse, `CASE` and `FIND` out of this file's own fixture ids. Tags are stripped
   WITHOUT inserting a space here, so `Civic<span>OS</span>` reads as `CivicOS`
   and the product's own name is not mistaken for an acronym.
   THE RULE STOPS AT FOUR CHARACTERS, and the limit is named rather than hidden:
   at five it reported `SERVE` (from *"a leg this surface can SERVE"*) beside
   `BEGIN` (from a PEM signature armor), and on these surfaces a five-letter
   all-caps token is emphasis far more often than it is an acronym. The armored
   signature is still flagged at the same site, by `SSH`. */
const ACRONYM = /\b[A-Z][A-Z0-9]{1,3}\b/g;
const tightText = h => String(h).replace(/<[^>]*>/g, "")
  .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"');

/* THE TWO STRUCTURAL RULES, APPLIED. Lifted out of the HITS loop by UI-33 and
   NOT otherwise changed — every caller passes the same two arguments the loop
   built inline before, so the measurement is identical. It is a function now for
   one reason: the liveness arm below must exercise the DETECTOR itself on a
   planted string, and a control that re-types the detector is a control that
   agrees with it at zero cost (REC-48's lesson, this project's most-repeated). */
function structuralTerms(html, vis){
  const acronyms = [...new Set([...tightText(html).matchAll(ACRONYM)].map(m => m[0]))]
    .filter(a => !vis.includes(a.toLowerCase()));
  return new Set([...String(html).matchAll(SNAKE)].map(m => m[0]).concat(acronyms));
}

function countIn(hay, t, ranges){
  let i = hay.indexOf(t), plane = 0, surface = 0;
  while(i >= 0){
    if(inside(ranges, i, i + t.length)) plane++; else surface++;
    i = hay.indexOf(t, i + 1);
  }
  return { plane, surface };
}

/* HITS: one row per (scenario, surface, term, source), carrying both counts. */
const HITS = [];
for(const sc of SCENARIOS){
  for(const [sel, html] of sc.surfaces){
    const vis = visibleText(html);
    const rRaw = planeRanges(html, sc.said);
    const rVis = planeRanges(vis, sc.said);
    const structural = structuralTerms(html, vis);
    const subjects = [...TERMS.map(t => [t, "inherited"]), ...[...structural].map(t => [t, "structural"])];
    for(const [t, kind] of subjects){
      const raw = countIn(html, t, rRaw);
      const v   = countIn(vis,  t, rVis);
      if(raw.plane)   HITS.push({ scenario:sc.key, surface:sel, term:t, kind, source:"plane",
                                  count:raw.plane,   visible:v.plane });
      if(raw.surface) HITS.push({ scenario:sc.key, surface:sel, term:t, kind, source:"surface",
                                  count:raw.surface, visible:v.surface });
    }
  }
}
/* BOTH structural rules are asserted LIVE, separately. A rule that matched
   nothing would be a rule nobody could tell was broken — it would sit in the
   file looking like coverage and contribute none.
   **CORRECTED BY UI-33, 2026-08-04, AND IT IS A CORRECTION RATHER THAN AN
   EXEMPTION (`CLAUDE.md`: correct a superseded test, never exempt it).** As
   UI-31 wrote it, this arm read the rules' output on the REAL surfaces and
   required each rule to have matched something THERE. That passed only because
   the surface was still printing `MEMBER_TOKEN` as a field label (the one
   SCREAMING_SNAKE) and `CORS`/`R2` in prose (the two acronyms) — which is to say
   it was fed by the very defect UI-33 was queued to close. Under the old form,
   removing all three would have turned this assertion RED **for the subject
   being FIXED**, and its only remedy would have been to keep a defect alive to
   feed the instrument. That is a rule nobody could satisfy honestly.
   What must stay live is the DETECTOR, not the defect. So the detector is
   exercised through `structuralTerms()` — the same function the measurement
   calls, never a re-typed copy of it — on a planted string carrying one
   identifier, one genuine acronym and one emphasis word, and all THREE
   properties are pinned: SCREAMING_SNAKE fires, the acronym rule fires, and the
   discriminator that separates an acronym from emphasis still suppresses the
   emphasis word (that third property was never asserted at all before). What the
   rules find on the real pre-authentication surfaces is REPORTED beside it, and
   after UI-33 the correct answer there is NOTHING. */
{
  const struct = [...new Set(HITS.filter(h => h.kind === "structural").map(h => h.term))];
  const PLANT_HTML = '<b>CORS</b> and THE PLANTED_IDENT in the whole case';
  const PLANT_VIS  = visibleText(PLANT_HTML);
  const got = structuralTerms(PLANT_HTML, PLANT_VIS);
  ok("both structural rules are live rather than decorative — fired on a PLANTED control through the same "
     + "function the measurement calls, giving [" + [...got].sort().join(", ") + "]: SCREAMING_SNAKE caught "
     + "PLANTED_IDENT, the acronym rule caught CORS, and the discriminator still suppressed THE (an emphasis "
     + "word appears in ordinary case on the same surface; an acronym does not). On the real "
     + "pre-authentication surfaces the two rules now find [" + (struct.join(", ") || "NOTHING, which is "
     + "UI-33's result and not a dead rule — see the comment above") + "]",
     got.has("PLANTED_IDENT") && got.has("CORS") && !got.has("THE"));
}
/* THE ATTRIBUTION IS NON-DEGENERATE, and this is the assertion that catches a
   silently broken subtraction. If the plane ranges came back empty, every
   occurrence would read surface-authored and the report would blame the surface
   for the plane's own sentence — the zero-cost equality arriving in the
   instrument (UI-28's lesson, one item on). */
{
  const planeSide   = HITS.filter(h => h.source === "plane");
  const surfaceSide = HITS.filter(h => h.source === "surface");
  const refusalAttributed = planeSide.some(h => h.scenario === "refused-signin");
  ok("ATTRIBUTION: the partition is non-degenerate — " + planeSide.length + " plane-sourced rows and "
     + surfaceSide.length + " surface-authored, and the refusal sentence's own terms are attributed to "
     + "the PLANE (they are read out of store.mjs, so anything else means the subtraction broke)",
     planeSide.length > 0 && surfaceSide.length > 0 && refusalAttributed);
}

/* ============================================================
   THE REPORT — the measurement DEC-49 should be answered against
   ============================================================ */
const byTerm = new Map();
for(const h of HITS){
  if(!byTerm.has(h.term)) byTerm.set(h.term, { plane:new Set(), surface:new Set(), n:0, vis:0, kind:h.kind });
  const e = byTerm.get(h.term);
  e[h.source].add(h.scenario + " " + h.surface);
  e.n += h.count; e.vis += h.visible;
}
const ordered = [...byTerm.entries()].sort((a,b)=> b[1].vis - a[1].vis || b[1].n - a[1].n || a[0].localeCompare(b[0]));
const R = s => console.log("PRE-AUTH VOCABULARY REPORT: " + s);
R("walked " + ALL_SURFACES.length + " surfaces over " + SCENARIOS.length + " scenarios, "
  + SCENARIOS.reduce((a,s)=>a + [...s.surfaces.values()].join("").length, 0)
  + " characters of member-facing pre-authentication surface, against " + TERMS.length
  + " inherited terms plus two structural rules.");
R(ordered.length + " plane-vocabulary terms reach " + new Set(HITS.map(h=>h.surface)).size
  + " of the " + ALL_SURFACES.length + " pre-authentication surfaces walked, across " + SCENARIOS.length
  + " scenarios: " + HITS.reduce((a,h)=>a+h.count,0) + " occurrences in the rendered HTML, "
  + HITS.reduce((a,h)=>a+h.visible,0) + " of them in text a member READS.");
R("UNAVOIDABLE = the plane said it and DEC-8 forbids this surface translating or blanking it, so only "
  + "DEC-49 can remove it. INCIDENTAL = this surface wrote it and could word it differently today "
  + "without touching a ruling. BOTH = it arrives by both routes and each has its own owner.");
R("x<n> counts the rendered HTML the way every sibling sweep counts it; (<v> visible) counts only what "
  + "survives with the tags removed. A term with 0 visible stands in an attribute or a class name.");
for(const [term, e] of ordered){
  const owner = e.plane.size && e.surface.size ? "BOTH" : (e.plane.size ? "UNAVOIDABLE" : "INCIDENTAL");
  R("  " + JSON.stringify(term) + "  x" + e.n + " (" + e.vis + " visible)  " + owner + "  [" + e.kind + "]"
    + (e.plane.size   ? "  | plane: "   + [...e.plane].join("; ")   : "")
    + (e.surface.size ? "  | surface: " + [...e.surface].join("; ") : ""));
}

/* ============================================================
   DEC-49'S SUBJECT, PINNED — ADDED BY UI-34, 2026-08-04
   ============================================================
   THE HARD CONSTRAINT EVERY ITEM ON THESE SURFACES INHERITS IS "LEAVE EVERY
   PLANE-SOURCED TERM EXACTLY AS IT IS", AND UNTIL NOW IT WAS CHECKED BY HAND.
   UI-33 verified it row by row and wrote the result into its landing; that is a
   worker reading a report, which is exactly the kind of check that is done
   carefully once and skipped the third time. DEC-49 is open with Bob and its
   subject is these eight rows, so any movement in them is a FAILURE of whatever
   item moved them and not a result — and a failure has to be MACHINE-CHECKED to
   be one.
   WHAT IS PINNED, AND WHY IT IS THE SET AND NOT THE COUNTS. The counts move for
   an honest reason: enlarging the walk (this item enlarges it by one scenario)
   can render a plane string on one more surface. What must never move without
   somebody deciding to move it is WHICH TERMS the plane puts in front of an
   unauthenticated reader and WHERE they arrive — that is the subject Bob is
   answering against. So the term set and each term's plane SOURCES are pinned,
   and BOTH differences are named: a row that DISAPPEARED is a surface having
   edited or blanked what the plane said (DEC-8's overstep, and the shape arms
   (f) and (g) exercise); a row that APPEARED enlarges the ruling's subject and
   Bob has to be told. Neither is allowed to happen quietly.
   A SCENARIO ADDED LATER WILL LAND HERE, and that is the design: adding one is a
   change to the measurement basis, it belongs in MEASUREMENTS.md with its date,
   and this arm is what makes a session state it rather than absorb it.
   ============================================================
   UPDATED DELIBERATELY BY UI-36, 2026-08-04 — 8 ROWS -> 11, AND THE THREE NEW
   ONES PLUS THREE NEW SOURCES ON AN OLD ONE ARE NAMED HERE, IN THE COMMIT, IN
   MEASUREMENTS.md AND IN THE REPORT TO CONDUCT. THIS IS NOT A RE-BASELINE.
   ============================================================
   WHAT GREW AND WHY. `pubVerify` calls `op=verify` — a public op no scenario
   had ever driven — and prints the plane's answer back to a stranger:
   `matches[0].path`, `.kind` and `.bundle_id`. Harvesting that is what UI-36
   was routed to do, and it ADDS to the very column Bob is ruling on. Each new
   row is annotated with what it actually is, because "a term reached the
   report" and "a WORD reached a reader" are not the same finding:
     `manifest`  — the plane's own `kind` VALUE, printed as a word in a sentence
        ("it names MANIFEST.json (manifest) in CASE-2026-0001"). This is the
        genuinely new vocabulary: an English noun the plane chose, standing on a
        pre-authentication surface, and UI-33 had removed the surface-authored
        `manifest` from these surfaces entirely — it is back, from the plane.
     `bundle.md` — the same `parts[].path` the case page already showed, now
        ECHOED BACK by a second op. Not a new word; three new places it arrives.
     `CASE`      — the structural ACRONYM rule firing on the plane's minted
        identifier prefix. `allocId("CASE", year)` is real: `CASE-<year>-<seq>`
        is what a live instance mints, so this is the plane's spelling and not
        the fixture's invention.
     `FIND`      — the same rule on `FIND-2026-0001`, and this one IS the
        fixture's own spelling: the real prefixes are INFO/INQ/FOCUS/PROB/PROJ/
        ACTN (app.html's `PREFIX`) and nothing mints FIND. It is pinned anyway,
        because the pin's job is to make movement visible, and it is labelled
        here so nobody reads it as evidence about a live instance.
   AND AN INSTRUMENT PROPERTY WORTH KNOWING, reported rather than corrected:
   both acronym rows appear because the discriminator that separates an acronym
   from EMPHASIS is per-SURFACE — an emphasis word is suppressed when the same
   surface also uses it in ordinary case. The verify panes are one sentence
   long, so `CASE`, `FIND` (and, surface-authored, `NOT`) have nowhere to be
   suppressed from. The rule is unchanged and the measurement is unchanged; the
   granularity of the surfaces it now runs over is what moved. */
/* ============================================================
   UPDATED DELIBERATELY AGAIN BY UI-37, 2026-08-04 — AND THE HONEST HEADLINE IS
   THAT THE SUBJECT BARELY MOVED. 11 TERMS -> 11 TERMS, ONE NEW SOURCE ON ONE
   EXISTING TERM. THIS IS NOT A RE-BASELINE AND IT IS NOT A GROWTH EITHER; IT IS
   THE MEASUREMENT, AND SAYING SO PRECISELY IS THE POINT.
   ============================================================
   WHAT CHANGED, AND IT IS EXACTLY ONE ROW:
     `sha256` gains `case-address-at-load #v-refused` as a PLANE source. UI-37
        makes the surface render `op=verify`'s refusal instead of swallowing it,
        and that refusal is "verify requires sha256=<64 lowercase hex>" — so the
        plane's own sentence now stands in front of an uncredentialed reader on
        one more surface, carrying a term the subject already contained from
        `#pub-body`. NO NEW TERM ENTERS THE SUBJECT.
   WHAT THIS ITEM ADDED THAT DID *NOT* REACH THE SUBJECT, stated because "we
   added plane wording and the subject did not move" is the kind of claim a
   reader is right to distrust:
     - the `unknown op` refusal now renders on THREE surfaces (`#v-unknownop`,
       `published-index-refused #pl`, `case-address-refused #pub-body`). It is
       genuinely plane wording on a pre-authentication surface and Bob should
       know it is there — it simply contains none of the 74 inherited terms and
       trips neither structural rule, so the instrument has nothing to pin. That
       is a fact about the sweep's vocabulary, not evidence the wording is
       harmless, and it is named here rather than left to be discovered.
     - the store's own NOT_PUBLISHED sentence now renders whole at
       `case-address-not-published #pub-body`, replacing a surface-authored
       stand-in. Same finding: real plane prose, no tracked term in it.
     - `NOT_PUBLISHED`, the bare reason CODE, briefly DID reach the subject while
       this item was being written, because the first version of `planeSaid`
       joined `reason` with `detail`. It was corrected to prefer the plane's
       PROSE and keep the bare code only when the plane sent nothing else —
       UI-30's rule — so a SCREAMING_SNAKE wire code does not stand in front of a
       stranger when a sentence was available. Recorded because the instrument
       caught it and because the near-miss is the argument for the instrument. */
const DEC49_SUBJECT = {
  "sha256":              ["case-address-at-load #pub-body",
                          /* NEW SOURCE 2026-08-04, UI-37 — op=verify's own refusal,
                             rendered instead of swallowed (D-195) */
                          "case-address-at-load #v-refused"],
  "op=":                 ["case-address-at-load #pub-body"],
  "bundle.md":           ["case-address-at-load #pub-body",
                          /* NEW 2026-08-04, UI-36 — op=verify echoing the part's path */
                          "case-address-at-load #v-part-" + SHA.slice(0, 12),
                          "case-address-at-load #v-f-" + FIND_ID,
                          "case-address-at-load #v-c-" + FIND_ID],
  "this instance":       ["case-address-at-load #pub-body", "refused-signin #g-err"],
  "a salted derivation": ["refused-signin #g-err"],
  "its stored hash":     ["refused-signin #g-err"],
  "no active credential":["refused-signin #g-err"],
  "register":            ["refused-signin #g-err"],
  /* NEW ROWS, UI-36, 2026-08-04 — all four from op=verify's answer. */
  "manifest":            ["case-address-at-load #v-man"],
  "CASE":                ["case-address-at-load #v-man"],
  "FIND":                ["case-address-at-load #v-part-" + SHA.slice(0, 12),
                          "case-address-at-load #v-part-" + CAP.slice(0, 12),
                          "case-address-at-load #v-f-" + FIND_ID,
                          "case-address-at-load #v-c-" + FIND_ID],
  /* NEW ROW, UI-40, 2026-08-05 — AND IT IS A REAL GROWTH IN DEC-49'S SUBJECT
     RATHER THAN AN INSTRUMENT ARTEFACT, so it is recorded here and REPORTED to
     Bob rather than absorbed. UI-40 made the published-case surface print
     `case_detail` VERBATIM (UI-32's rule: lift what the record published rather
     than hand-write doctrine), and that sentence ends "composing two findings'
     strengths into one letter is the substitution R2 forbids". `R2` is an
     internal doctrine reference, and it now stands in front of a reader holding
     no credential, on the page a stranger arrives at.
     THE SURFACE CANNOT FIX THIS AND MUST NOT TRY: translating or blanking a
     plane sentence are the two moves DEC-8 forbids, which is precisely why this
     arm records the growth instead of demanding a repair. Only DEC-49 can
     remove it — either the plane learns member-facing wording, or surfaces get a
     licensed translation layer.
     ONE THING THIS ROW DOES NOT COVER, stated rather than left to be found:
     the same sentence also says "never a verdict this PLANE reached", and the
     word `plane` is flagged by nothing here because no sibling sweep polices it
     and it is not one of the four phrases DEC-49 quotes. The term list is
     HARVESTED by design and is not hand-extended here; the gap is reported with
     this item rather than papered over. */
  "R2":                  ["case-address-at-load #pub-body"],
};
{
  const now = {};
  for(const [term, e] of byTerm) if(e.plane.size) now[term] = [...e.plane].sort();
  const gone    = Object.keys(DEC49_SUBJECT).filter(t => !now[t]);
  const arrived = Object.keys(now).filter(t => !DEC49_SUBJECT[t]);
  const moved   = Object.keys(now).filter(t => DEC49_SUBJECT[t]
                    && DEC49_SUBJECT[t].slice().sort().join(" | ") !== now[t].join(" | "));
  ok("DEC-49'S SUBJECT HAS NOT MOVED — the PLANE-SOURCED rows are the same " + Object.keys(DEC49_SUBJECT).length
     + " terms arriving from the same places. VANISHED (a surface edited or blanked what the plane said, "
     + "which DEC-8 forbids): [" + (gone.join(", ") || "none") + "] · NEWLY REACHING AN UNAUTHENTICATED "
     + "READER (the ruling's subject grew and Bob must be told): [" + (arrived.join(", ") || "none")
     + "] · ARRIVING FROM SOMEWHERE ELSE: [" + (moved.map(t => t + " {" + now[t].join(", ") + "}").join(" · ")
     || "none") + "]",
     gone.length === 0 && arrived.length === 0 && moved.length === 0);
}

/* ============================================================
   THE REPORTING ARM — and the one line that makes it a failing arm
   ============================================================
   DEC-49 is OPEN. Until it is answered, a guard that FAILED here would leave the
   surface only the two moves DEC-8 forbids — compose a translation, or blank
   what the plane said — and a gate that pressures someone into inventing wording
   is a bug in the gate (CLAUDE.md). So this arm REPORTS.

   **WHEN DEC-49 IS ANSWERED, SET `REPORT_ONLY` TO `false`. That is the whole
   change**, and it is right under either answer: (a) the plane learns
   member-facing wording, so the plane-sourced rows disappear at their source;
   (b) surfaces get a licensed translation layer, so they disappear at the
   surface. Either way the state the ruling produces is "no plane vocabulary
   reaches a pre-authentication surface", which is what the assertion below then
   holds the harness to — naming every term, surface and source it still finds.
   `UI31_ENFORCE=1` runs that arm today without editing anything, which is how
   its exact failure was measured for the negative-control line above. */
const REPORT_ONLY = !process.env.UI31_ENFORCE;
{
  const named = ordered.map(([t,e]) => JSON.stringify(t) + "("
    + (e.plane.size ? "plane" : "") + (e.plane.size && e.surface.size ? "+" : "")
    + (e.surface.size ? "surface" : "") + ")").join(", ");
  ok("DEC-49 IS OPEN, so this arm REPORTS rather than fails: " + ordered.length
     + " plane-vocabulary terms stand on pre-authentication surfaces — " + named,
     REPORT_ONLY || HITS.length === 0);
}

if(fails.length){ console.error(`preauth-vocabulary: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`preauth-vocabulary: ${n} assertions, all green — every surface a member can see BEFORE authenticating is walked (the gate as served, its token panel, its address field, a refused sign-in, an unreachable plane, an empty token, the public record, the design preview, the VERIFY PANE opened from the published rail, and both published addresses resolved at load by app.html's own top-level code); the walk's own reach asserted by name and by count against the gate's markup, THE PUBLISHED MASTHEAD'S OWN CONTROLS, the load-time router's address shapes and the sibling suites' own sweeps; the plane's own sentences pinned VERBATIM at the gate AND on the case page (DEC-8, and UI-33's arm (g) is why the second one exists); DEC-49'S SUBJECT — the ELEVEN plane-sourced rows, eight until UI-36 drove op=verify — PINNED BY TERM AND BY SOURCE, so any movement in them FAILS rather than being reported (UI-34: the hard constraint every item on these surfaces inherits was checked by hand until now); and the plane vocabulary standing on those surfaces REPORTED with its exact terms, each occurrence attributed to the plane or to this surface — reported and not failed, because DEC-49 is open and a guard that failed would force a surface to invent a translation DEC-8 forbids. UI-33 (2026-08-04) closed the SURFACE-AUTHORED half: 13 terms -> 9, all EIGHT plane-sourced rows unchanged. UI-34 (2026-08-04) ENLARGED THE BASIS BY ONE SCENARIO, deliberately and alone: 10 scenarios -> 11, 33,535 -> 34,375 characters, 55 -> 57 occurrences and 45 -> 47 visible, the whole delta being 'sha256' x30(26) -> x32(28) on its SURFACE half from the verify pane's own prose, with EVERY PLANE-SOURCED ROW UNCHANGED IN NUMBER AND IN SOURCE. UI-36 (2026-08-04) DROVE op=verify, THE PUBLIC OP NOBODY HAD ASKED: 12 surfaces -> 19, 34,375 -> 35,835 characters, 9 terms -> 13, 57 -> 67 occurrences and 47 -> 57 visible, scenarios UNCHANGED at 11 — and DEC-49'S SUBJECT GREW 8 ROWS -> 11, every movement named at DEC49_SUBJECT ('manifest' NEW, the plane's kind VALUE as a word; 'CASE' NEW, the acronym rule on the plane's real minted id prefix; 'FIND' NEW, the same rule on the fixture's own id spelling and labelled as such; 'bundle.md' +3 SOURCES as op=verify echoes the part path). The instrument itself is UNCHANGED, proved by running this file with the new drive hidden and diffing UI-34's report to CHARACTER-IDENTICAL; NEGATIVE CONTROL: RUN, thirteen arms, all re-run against the FINAL file — (a) UI31_HIDE=<scenario> hides a member-facing surface and the harness fails NAMING what it stopped covering (three hidings: public-record 4/46, design-preview 3/47, case-address-at-load 8/40 which ALSO takes walk 1c's whole subject away — 0 call sites discovered, so a walk that covers nothing FAILS here instead of passing everything — and trips the subject arm) (b) UI31_EMPTY_TERMS=1 neuters the term harvest, 5/48 (c) UI31_NO_PLANE_RANGES=1 breaks the attribution so the plane's own sentence would be blamed on this surface, 2/48 (d) UI31_ENFORCE=1 runs the reporting arm AS the failing arm DEC-49's answer will make it, 1/48 naming all thirteen (e) ON DISK, app.html's gate hint gains "capture_sha" and the report grows 13 terms to 14 naming the gate as the author, 48/48 green (f) THE HARD CONSTRAINT'S OWN ARM — signIn() translates the plane's refusal ("a salted derivation" -> "a scrambled copy"), 3/48 FAIL: the REACH arm names the act, the ATTRIBUTION arm names the consequence, and the DEC-49 SUBJECT arm names all four terms that VANISHED (g) the same overstep on the case page, verification.detail through .replace("this instance","this group") — 2/48 FAIL, the subject arm reporting 'this instance' now ARRIVING only from refused-signin #g-err (h) UI-34'S OWN — UI31_HIDE=published-verify-panel, 2/47 naming the scenario and pubVerifyPanel as an uncredentialed control nobody drives (i) a THIRD link planted on the published rail, 2/48 naming pubExpandForPrint in walk 1b and as undriven (j) UI-36'S OWN — UI31_HIDE=case-verify hides the verify DRIVE and 3/42 FAIL, naming pubVerify and pubBytes as controls on an uncredentialed page that NO scenario drives, the seven verify surfaces that stopped being covered, and the subject collapsing back to its pre-item state (manifest, CASE, FIND VANISHED and bundle.md losing three sources) — which is exactly the state this file was in before this item (k) UI-36'S DEC-8 ARM — pubVerify's SUCCESS branch translates the plane's own matches[0].path ("bundle.md" -> "the finding's own write-up"), 2/48 FAIL: the REACH arm names the act and the SUBJECT arm names the consequence generically, without anybody having anticipated the field (l) **THE ARM THAT MOVED NOTHING, AND IT IS A FINDING RATHER THAN A GAP** — pubVerify's ERROR branch translates its "e.error || e.reason" expression, the same DEC-8 overstep one branch over: 48/48 GREEN and the report CHARACTER-IDENTICAL, because that expression can never hold a plane string (apiQ rejects only with a transport error), which is why the refusal assertion above pins a defect instead (m) a SIXTH control planted on the case page, 2/48 naming pubShout in walk 1c and as undriven, so a new control on the page a stranger arrives on cannot arrive unmeasured — app.html restored byte-identically after every on-disk arm, sha256 333b4d7f… before and after. UI-37 (2026-08-04) FIXED THE DEFECT UI-36 PINNED (D-195) AND CORRECTED THE PIN: 11 scenarios -> 15, 19 surfaces -> 22, 35,835 -> 38,637 characters, 13 terms -> 13, 67 -> 68 occurrences, 57 -> 58 visible, and DEC-49'S SUBJECT 11 ROWS -> 11 with ONE NEW SOURCE on one existing term ('sha256' at case-address-at-load #v-refused, op=verify's own refusal rendered instead of swallowed) - no new term enters the subject, and the plane wording this item added that the instrument CANNOT pin ('unknown op' on three surfaces, the store's NOT_PUBLISHED sentence) is itemised at DEC49_SUBJECT rather than left to be found. THE SWEEP FOUND THREE REFUSALS WHERE THE ITEM NAMED ONE and THREE SITES WHERE IT NAMED ONE; the third refusal - section 7a's {ok:true, ...out.result} spread over an absent result, HTTP 200 with no ok:false - is why apiQ is UNCHANGED and the fix is a positive shape test at each site, since a seam throwing on ok:false could never have caught it. THE FOUR NEW SCENARIOS MOVE NO NUMBER IN THE REPORT, MEASURED: this file against the FINAL app.html with all four hidden gives 54/54 green, 11 scenarios, 22 surfaces, 36,527 characters, 13 terms, 68 occurrences, 58 visible - the same 68/58 as the full run - and the subject arm PASSES, so the four add 2,110 characters and four assertions and nothing else. NEGATIVE CONTROL: RUN, six more arms, every one on disk against the FINAL file with app.html restored BYTE-IDENTICALLY (sha256 74cc1646… before and after each) - (n) THE ITEM'S OWN, D-195 restored exactly as it shipped (the truthy test back, the third branch deleted) -> 4 of 58 FAIL, naming ALL THREE refusals rendered as a substantive negative AND the DEC-49 subject arm noticing the plane's sentence VANISHED from #v-refused; the true-negative arm stays green, which is what makes the four failures specific (q) THE OTHER DIRECTION, one character - the published:false branch made unreachable so a GENUINE absence is reported as a question nobody answered -> 1 of 58 here AND publishedcase.test.mjs fails too, a second suite catching it independently (o) the published INDEX's collapse restored -> 2 fails in two suites: this file naming the refusal, and auth-surface's own NEG-CONTROL (a) - which is the finding that D-173's 'honest-looking blank screen' WAS this exact sentence (p) the case ADDRESS's collapse restored (one heading over every refusal, only 'detail' read) -> 1 of 58 (s) THE DEC-8 OVERSTEP one branch over from UI-36's arm (k) - the surface TRANSLATES the refusal it now renders ('64 lowercase hex' -> 'a proper fingerprint') -> 2 of 58: the refusal arm names the act and the SUBJECT arm names the consequence (r) THE INSTRUMENT'S OWN - app.html reverted to the PRE-ITEM COMMIT 1cbc70f (the defect back) with the four new scenarios hidden -> 4 of 54, the walk returns to 11 scenarios and the report to 70 occurrences / 60 visible, so the new arms are answering the surface and not themselves. **AND THIS ARM HAD TO BE CORRECTED MID-RUN, REPORTED RATHER THAN SMOOTHED:** it first reverted to HEAD, which stopped being the pre-item state the moment this item's own commit landed, and it quietly fell from 4 of 54 to 1 of 54 - a control that reverts to a moving target measures nothing, and the only reason it was caught is that the arm was re-run after a later edit instead of being trusted from its first result. BATTERY UNMOVED and it is measured, not assumed: 98/98 at 5,544 assertions with UI-37 applied, and 98/98 at 5,544 with the whole change stashed - no bio-plane file is touched by this item`);
