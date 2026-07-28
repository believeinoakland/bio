# CivicOS Layer 3 UI: state and next-session kickoff

v25, 2026-07-28 session, part twenty-three. MONITORING COLUMNS: the two
monitoring tables replace Updated with "Last checked" (monitor_last_checked
from the search hit) and "Next check" (computed via monitorNext from the
frequency; the frequency word shows when the arithmetic cannot; reeval-only
rows dash both). Both columns sort with the shared mechanism. CONFORMANCE
ANSWER RECORDED (Bob asked whether crucial-while-collected is conformant):
YES. From store.mjs: cite refuses only non-Information targets and never
checks current_state, so collected Information is citable; criticality is a
declared frontmatter stance at promotion, not derived from citations; the
one hard crucial rule is CRUCIAL NEVER RIDES A BATCH. Declaring crucial
before verification is the design working as intended: it forces the
individually co-attested release path for the material that matters most.
If Bob ever wants "citation targets must be verified" as policy, that is a
new refusing arm in cite, a plane change to weigh deliberately.

(v24 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v24, 2026-07-28 session, part twenty-two: origin-scoped search. A search
launched from a typed page stays in that page's world: Focuses searches
type:focus, Projects type:project, Review state:collected (all as terms in
the plane's own query language, confirmed against query.mjs's filter
vocabulary), and Monitoring filters client-side on monitor_enabled or
reeval_flag since it is an or-of-flags. Scope predicates ride along so the
op=list fallback path honors the scope identically. The results line names
the scope with a "search everything" widen link (also offered on empty
scoped results); an empty search returns to the ORIGIN page, not always the
record; the remembered-search nav restore carries the scope. LESSON PAID
FOR A THIRD TIME and now a rule: every s.replace on app.html gets an
assert; the scope initially never reached the plane because a patch
targeted an api() call that is really rec() and no-opped silently. The
record-list harness drives the scoped path end to end (from Focuses, the
plane query carries type:focus and the results line names the scope).

(v23 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v23, 2026-07-28 session, part twenty-one, Bob's three. Focuses and Projects
lists drop the Type column (single-type lists; the sortable table takes a
showType flag). Review converts its collected chips and the crucial mark to
the SAME seals as everywhere else (the crucial seal replaces both the crux
text in the pick column and the word chip beside titles), and its Item,
State, and Updated headers sort with the shared mechanism; a sort repaint
preserves a selection in progress exactly like the liveness repaint does.
Monitoring's two sections (Needs a second look, Watched sources) gain full
sortable headed tables; one sort governs both, and the Type column stays
there because those lists can mix types.

(v22 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v22, 2026-07-28 session, part twenty. TYPE_LABEL for information shortened
to "Info" everywhere the label renders (the Type column, filtered lists,
the document page's cited-by rows). Harness updated.

(v21 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v21, 2026-07-28 session, part nineteen: the record list, Bob's four. An
identity band tops the list page (verdigris-dk from the palette; umber
stays the document page's). A Type column joins Item, State, and Updated
(the type label leaves the title cell). Every column header sorts:
ascending on click, flipped on a second click of the current column, with
an arrow on the active header; sorting is per-screen and resets on
navigation; the filtered lists (Focuses, Projects) share the same sortable
table. State indicators are now the SAME seals as the document page, with
the same hover strings and click-over disclosure (word chips everywhere
also gained hover titles); crucial shows as its seal beside the title. New
record-list harness asserts the band, the Type column, both sort
directions with arrows, and the seal indicators.

(v20 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v20, 2026-07-28 session, part eighteen. Default collapse revised by Bob: In
the case opens EXPANDED; only Trust and The record open collapsed (with
Session Log, Review Notes, and Source Material still folded within the
prose). Harness updated both ways.

(v19 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v19, 2026-07-28 session, part seventeen. "Source Material" (title case), and
its heading now matches Session Log and Review Notes exactly: those are the
document's own ## headings styled by the prose rules (19px record serif),
while the built heading had been the smaller structural h2.sec (17px). The
built subsection heading gets its own ch2 class carrying the prose
subsection treatment, so all subsection titles on the page read at one
size. Harness asserts the class and the title.

(v18 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v18, 2026-07-28 session, part sixteen. "The source material" renamed to
"Source material", and it now opens collapsed like Session Log and Review
Notes; the primary document remains one gesture away through the tab bar's
Open-the-document link regardless. Harness asserts the rename and the
default state.

(v17 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v17, 2026-07-28 session, part fifteen. Default collapse states: a document
page opens with What it says expanded and In the case, Trust, and The
record collapsed; within the prose, Session Log and Review Notes open
collapsed (matched by heading title, so it applies to any bundle carrying
them) while Summary, Provenance Notes, and other headings open expanded.
Selecting a collapsed section's tab scrolls to it AND expands it in the
same gesture, with the tab and the stratum's verdigris rule marked active
immediately rather than waiting for the scrollspy to catch up. The
document-page harness asserts the default states both ways (closed strata
closed, s1 and Summary open, Session Log closed).

(v16 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v16, 2026-07-28 session, part fourteen: search, round two. The stepped-on
icon and clear control were the input's own focus ring drawn inside the
field row; the ring moved to the FIELD (focus-within on the .msearch
wrapper, inner input outline suppressed), so it now wraps icon, text, and
clear as one control. ONE SEARCH BOX EVER: the masthead's on desktop (the
Search screen shows none), the screen's own on phones where the masthead
search is hidden; searchEl() picks the visible one, values mirror on run,
and the results line names the query ("2 results for \u201Csewer 2025\u201D").
Long queries follow the researched standard for single-line inputs: the
masthead field grows on focus (200 to 400px, quiet transition), text
ellipsizes when blurred, and editing relies on the input's native
horizontal scroll (browsers deliberately drop the ellipsis on focus so it
never fights the caret; css-wg text-overflow discussion, Gecko/WebKit
behavior).

(v15 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v15, 2026-07-28 session, part thirteen: search, Bob's four. The mangled
"running" indicator was the magnifier icon clipped: the sprite is drawn on
a 20-unit grid and the inline viewports never declared a viewBox, so it
truncated to a C in both the masthead and the search screen; viewBox added
everywhere the icon renders small. The Run button is gone (Enter runs; the
screen's box autofocuses). Both search boxes gain a clear \u00d7 inside
their right edge, shown only when there is text, clearing and refocusing
(and on the search screen, clearing the results). An EMPTY search (Enter on
an empty box, from either box while on the Search screen) returns to the
record with the cursor waiting in the masthead search box.

(v14 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v14, 2026-07-28 session, part twelve. Disclosure triangles: every stratum
title (the eyebrows) and every subsection title collapses and expands its
own contents. Subsections come from two places and both get the gesture:
the document's own ## headings (Summary, Provenance Notes, Session Log,
Review Notes) via mdLite, which now wraps each heading's run in a csec with
a triangle, and the built headings (The source material) via the sec2
helper. Built structurally in the templates, not DOM surgery, so the
harness asserts the shapes. A tab click on a collapsed stratum reopens it
before scrolling. The Release heading at the bottom deliberately keeps no
triangle: an action area should not fold away. State per page, not
persisted.

(v13 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v13, 2026-07-28 session, part eleven. The Open-the-document control moved
from a header button into the tab bar's final entry, after The record,
dressed as a link so its nature is legible: verdigris semibold with an
outward arrow, a hairline separating it from the strata tabs, hover
underline, and no underline-tab behavior (the scrollspy never activates it).
Same behavior as before: a browser tab for what renders, a native download
otherwise, verification silent until it refuses. The title row simplifies to
the title alone. Suite updated and green; the open tab now announces stale
builds itself (v12), so this is the first change shipped under that regime.

(v12 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v12, 2026-07-28 session, part ten: the missing tag was a stale tab, and the
app now tells you.

**Changelog v12.** Bob reported the type tag absent. Root cause: his open
tab was running the app instance loaded before the v11 deploy; the SPA never
reloads between deploys, so an old build keeps navigating live data.
Definitive proof before any code was touched: the LIVE served page code was
rendered against the LIVE data of the exact bundle in his screenshot and
produced the pdf tag and the "Released by bob" fact. The recurrence gap is
closed per the alive principle: the build step now injects a build id (12
hex of the app source's sha256) into both the page and the worker, the
worker serves it at /build (no-store), and an open tab checks every five
minutes while visible; when a newer build is serving, a quiet "Updated \u00b7
reload" button appears in the masthead. THE CANONICAL BUILD STEP CHANGED:
compute the id, inject __BUILD_ID__ into app.html bytes AND the template,
then base64-embed (see the build block in this session's transcript; the v1
snippet's plain embed is superseded). Also: a piped test invocation let a
shim-only failure slip past one deploy (exit status was grep's, not the
suite's); run `node test/run.mjs` bare, never piped, before deploying.

(v11 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v11, 2026-07-28 session, part nine: facts from the record's real shapes; the
type tag.

**Changelog v11.** The verified seal's document fact was silent because the
fact parser was built on INVENTED promotion-record fields (to_state, member,
acknowledgment); the real records carry target/base/files/created/author and
nothing else, and the who-released-it narrative lives in bundle.md's own
Session Log headings ("### Session DATE | TITLE | AUTHOR"). The fact now
reads the Session Log (releaseFact: the entry whose title says released /
collected to verified / ratification), verified live against the ACFR
bundle ("Ratification: collected to verified | bob"). Promotion records in
stratum four render their real fields (author, created, files count) as
"revision recorded" entries. The document-page harness fixture now mirrors
the record's REAL shapes so invented-field parsing can never pass again. NEW:
a file-type tag (pdf, html, csv, ...) sits beside the seals, derived from
the primary artifact (with .b64 wrappers stripped), speaking its filename,
size, and parts on hover and click-over from a FILETYPES table. An ordering
bug found on the way: PRIMARY_K was computed after the seals string was
built, so the tag could never have rendered; sources and the primary
artifact now precede the seals.

(v10 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v10, 2026-07-28 session, part eight: the two clarifications.

**Changelog v10.** THE SCROLL WINDOW IS THE AREA BELOW THE TAB BAR, as Bob
meant it. The document header (band, crumb, title, open control, tabs,
seals) is no longer a sticky element inside the page's scroller; the page is
now header plus its own scroll box (#docscroll) holding the strata. Nothing
can appear above the band, ever, because the region above the band does not
scroll; the sticky and negative-margin machinery is gone, the scrollspy
watches the document's own box, and navigation remembers and restores
whichever box scrolls on the current page (scrollBox()). CAPTURED HTML OPENS
IN A REAL BROWSER TAB, as Bob meant it, like any link. Safety moved from
the inline sandbox into the bytes: scripts, inline handlers, and
javascript: references are stripped before the rendering blob is created
(the RAW capture in the record stays untouched and is what the download
gives), and the tab is severed from its opener before it loads. The
document-page harness now asserts the structure (every stratum inside the
scroll box, the band in the fixed header, none leaking above) and the
artifact harness proves the sanitizer strips scripts, handlers, and
javascript: while preserving content, styles, and image references.

(v9 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v9, 2026-07-28 session, part seven: a production break, its root cause, and
the durable fix.

**Changelog v9.** The v8 deploy broke every document page ("Could not reach
the plane", which is errPane dressing a ReferenceError). Root cause: the v8
slice-replace that installed the link-style openArtifact was bounded "from
openArtifact to openBundle", and parseLog, renderLogEntry, lineDiff, and
toggleDiff sat between those anchors; the replacement deleted all four. The
harnesses missed it because none drove openBundle end to end. Fix: the four
functions are restored from the v3.3 commit, and the testing hole is closed
for good: the harnesses moved from /tmp into the repo as civicos-ui/test/
(six .test.mjs files, extract.mjs reading app.html directly, run.mjs running
everything plus the semantics check), including a NEW document-page harness
that renders the full page against a realistic stubbed plane (prose, bundle
glossary, chunked pdf, promotion log, revision, projection with references)
and asserts every element of the page: frozen header, open control, the
three fact-carrying seals, both glossary layers, the session log with the
member's acknowledgment as speech, revision compare, artifact links, trust
hashes, cited-by rows, and all four strata. Run `node test/run.mjs` before
every deploy. ALSO: per Bob, no more per-turn zip deliverables; the repo and
the live deploy are the delivery.

(v8 and earlier follow.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v8, 2026-07-28 session, part six: Bob's five, round two.

**Changelog v8.** THE FROZEN HEADER: the sticky region is now everything
above the content, as Bob meant it: band, crumb, title, and the tab bar
freeze as one unit while the strata scroll beneath; anchor scrolling and the
scrollspy account for the header's measured height. SEALS SPEAK THE
DOCUMENT'S FACTS: the verified seal names who released it and when (read
from the bundle's own promotion log), the crucial seal names the cases it is
load-bearing for (from reverse citations), and the monitored seal gives the
last re-check and the approximate next one (computed from the monitor
frequency); the general meaning from SEMANTICS and the instance fact appear
together on hover and in the click-over. OPENING IS A LINK: one verdigris
"Open the document" in the frozen header opens the primary artifact the way
any link would: a new tab for what a browser renders (opened synchronously
so popup blockers never bite), a native download for what it does not;
verification runs underneath and speaks only on failure, when it REFUSES in
the plane's voice. Artifact names in the source-material cards are now plain
links to the same behavior; the fetch-and-verify button and the inline embed
are gone; the hashes live under a quiet "integrity" disclosure. Captured
HTML renders in a sandboxed, scriptless, unique-origin frame so a hostile
capture can reach nothing. BUNDLE-CARRIED GLOSSARY ADOPTED (Bob, today):
data/glossary.json in a bundle layers the document's own terms over the
shared floor for every prose render on its page; the convention is part of
capture from here on. CAPTURE FIDELITY for HTML sources (css and supporting
files captured so the rendition is credible) is specified in
CAPTURE-FIDELITY.md and is the next plane release (0.36.0).

(v7 and earlier follow; all still hold.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v7, 2026-07-28 session, part five: THE DOCUMENT ITSELF OPENS ON THE DOCUMENT
PAGE.

**Changelog v7, and a correction that retires gap G2.** G2 ("the plane
serves no binary blob bytes") was wrong: `op=capture`'s GET arm has served
raw capture bytes by sha256 all along, content-addressed under
`<store>/captures/<sha>`, Range-capable, and every snapshot part was written
to exactly those keys at promotion. The gap was the UI's knowledge of the
plane, not the plane; no plane release was needed and none was made. The
document page now has the viewer: every binary artifact card carries "Open
the document (size)". Opening fetches each part through `op=capture` with a
live progress bar, hashes every part in the browser with WebCrypto, and
compares against the sha the record carries. ONLY VERIFIED BYTES ARE EVER
SHOWN: a mismatch renders a refusal in the plane's voice (REFUSING TO
DISPLAY, expected vs got) instead of the document. On success: a verdigris
"every byte verified against the record" line, the PDF inline in an embed
(images inline as images; .tsr and unknown types verify-and-download), and a
download of the same verified bytes under the original filename. Proven
live end to end: both parts of the 41.5MB FY23-25 budget book fetched
through the civicos proxy, both shas identical to the record, and the
reassembled file is a well-formed PDF (%PDF header, %%EOF trailer). Harness
covers part ordering, concatenation, the integrity refusal, and the
missing-capture reason; all prior harnesses and the semantics check stay
green.

(v6 and earlier follow; all still hold, except G2 which is retired as
mis-diagnosed.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v6, 2026-07-28 session, part four: Bob's five fixes from the live document
page.

**Changelog v6.** THE ROOT CAUSE FIRST: #work used min-height:100vh, so a
tall page scrolled the whole body instead of the content pane. That single
bug produced two of Bob's five reports: the rail and tab bar scrolling away
(nothing could stick because the pane they stick within never scrolled), and
the strata strips staying grey past the first (the scrollspy watches the
content pane, which never moved). The grid is now height:100dvh with
min-height:0 on the scroll children; the rail and tab bar hold, and the
strips follow the reader. The rest: BACK moved to the masthead at top level,
left of the wordmark, bigger (21px), appearing whenever there is somewhere
to go back to; the crumb is a location line again. Back now restores the
EXACT scroll position through a settle-proof restore (set, two animation
frames, and a 120ms re-set, because web-font reflow was clamping the offset
set at first paint), the browser back button and the in-app arrow converge
on one stack without double-popping, and a Search screen on the way back
re-runs its remembered query so the result list the reader was working
through comes back scrolled to where they were. CHIPS became SEALS: the
document's states now render as single-mark stamps (V verified, ! crucial,
M monitored, and marks for every state in the semantics table) riding
right-justified in the sticky tab bar, so load-bearing state never scrolls
away; hover names them, click discloses the full semantics row, and the
seal marks live in the SEMANTICS table like everything else. The chips row
left the body of stratum one.

(v5 and earlier follow; all still hold.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v5, 2026-07-28 session, part three: Bob's eight document-page refinements.

**Changelog v5, all from Bob's review of the live page:** the strata tab bar's
stray scrollbar is gone and the bar now sticks to the top of the page while
content scrolls, with a scrollspy keeping the active tab true to the reader's
position (tabs scroll to a stratum; nothing is hidden, and the banding makes
that legible). Each stratum is a banded section: a left rule that turns
verdigris as the reader enters it, under a mono eyebrow naming it, so the
content belonging to each tab is visibly delimited without new colors. The
Design page's warm band is captured as an ADDITIVE token (--band, umber) in
tokens.css and tops every document page as its identity. The rail collapses
to an icon-only 56px strip (toggle in the masthead, persisted, tooltips on
icons; hidden on phones where the rail is already a top bar). Back returns
the reader to the exact scroll position of the page they came from, via an
in-app navigation stack wired to the browser's own back button; the crumb
shows where back leads. Tabs, eyebrows, and the docband carry explanatory
tooltips from STRATA_INFO. A GLOSSARY table (sibling of SEMANTICS: same
one-source-of-truth idea) wraps system and civic-finance terms (ACFR, GPF,
FY, sha256, RFC 3161, SSHSIG, manifest, provenance, frontmatter) in rendered
prose with dotted-underline click-overs; the wrapper never touches tags or
attributes and handles compounds like FY23. Document-SPECIFIC terminology is
deliberately not in the UI table; if adopted, it belongs in the bundle at
capture time (open decision below).

(v4 text follows; all of it still holds.)

---

v4, 2026-07-28 session, part two: the record screen rebuilt on Bob's UX
principles.

**Changelog v4: the document page is content-first on four strata, the
semantics table is live with its consistency check, lists are live-updating,
and the working space lays out on phones.**

## New in v4

- **The document page** (openBundle) now answers the reader's questions in the
  reader's order, four strata with an in-page nav: WHAT IT SAYS (state and
  criticality chips, the prose, then the captured source material itself:
  text files including JSON open and render in place; chunked binary
  snapshots fold into one card per artifact with parts, sizes, RFC 3161
  timestamp, and per-part hashes); IN THE CASE (a project's objective and
  work-product state, forward references with their notes, and reverse
  citations computed client-side by walking the projections of every focus
  and project); TRUST (authority, source link, retrieved, source status,
  content and bundle hashes with copy, monitor schedule, and the
  anyone-may-verify sentence); THE RECORD (the session log parsed from the
  bundle's own _history/promotion_*.json, each entry with its actor, its
  move, and the member's recorded acknowledgment and mitigation rendered as
  speech, plus every earlier revision with an in-place line diff against the
  current text). Release stays at the end, after the reading.
- **SEMANTICS** is the one source of truth for presentation: for every object
  type and state in the plane's catalog, plus criticality and flags and the
  two spaces, one row declares the chip, the reader-language meaning, what it
  enables, what it forbids and why, and the legal next states. Every chip is
  a click-over disclosing that row (tap works; nothing is hover-only). The
  block is marker-extractable, and `check-semantics.mjs` fails the build if
  any plane state lacks a row or the table invents a state. THE CHECK PAID
  FOR ITSELF ON ITS FIRST RUN: it caught two invented states ("modified",
  "deactivated") that existed in UI copy but nowhere in the plane; both are
  gone, and Monitoring now reads the real drift signals (reeval_flag,
  monitor_enabled) instead of a state that does not exist.
- **Liveness**: polite 45s polling while the tab is visible; the Record and
  Review lists reconcile in place when the record actually changed, never
  while a dialog is open, and a review selection in progress is preserved
  across an update.
- **Phones**: below 680px the rail becomes a scrolling top bar and everything
  lays out in one column; the strata nav scrolls horizontally. Viewing is
  fully served; judgment surfaces remain best on larger screens, per the
  agreed viewing-MVP posture.
- **Gap G2, named**: the plane serves no binary blob bytes (`op=file` returns
  text or hash metadata only), so archived binary snapshots (the captured
  PDFs) cannot be viewed in the browser yet. The document page says so
  honestly on each such artifact and shows the verify path. A blob-serving
  op is plane-side work, and the public reading surface (G1) will want it
  too.

(For the v1-v3 narrative, op contracts, and deploy procedure, see the v3 text
below; all of it still holds.)

---

# CivicOS Layer 3 UI: state and next-session kickoff

v3, 2026-07-28 session: record headings dropped to the canonical token
(--t-rec 22px, inline sizes removed); Bob resolved the open heading decision in
favor of the token/Design value. Bob's standing UX principles recorded verbatim
in UI-KICKOFF.md. (Previously: v2, 2026-07-27 session (doc previously dated ahead; plane is 0.35.0 on biosmoke7,
see BIO_DATAPLANE_STATE.md).)

**Changelog v2: the first write action is wired. Release runs end to end from
the UI: per-document from the bundle page and batch from Review, through
`op=select` (enumerated) then `op=release`, with the doctrine's recorded
acknowledgment and mitigation.** Details below; v1 narrative follows unchanged.

## New in v2: the release flow

- **Review** now loads collected Information via `op=search`
  (`type:information state:collected`, limit 500) because search's provenance
  columns carry `criticality`, which `op=list` does not; the flow needs it to
  keep crucial material out of `op=release` before the plane has to refuse it.
  Fallback to `op=list` if search cannot answer (criticality then unknown; the
  plane's refusal renders verbatim).
- **Batch release from Review.** Checkbox selection (select-all included), one
  verdigris primary that counts the set. The dialog states what a batch release
  is, lists the set, and requires the member to type the homogeneity
  acknowledgment and what they actually checked. Nothing is prefilled: the
  doctrine's record is the member's own words. Client-side validation mirrors
  the store exactly: each field <=500 chars, no quote, backslash, or newline.
- **Per-document release from the bundle page**, placed at the BOTTOM, after
  the prose and history, because the doctrine's reviewer must see the source
  material before the judgment. Same dialog, per-document language.
- **Crucial material never enters the flow.** Any selection containing
  crucial-criticality material is refused whole by the store, so the UI gives
  crucial rows no checkbox and says why: verifying crucial means checking its
  co-attestations, per-document work, surface not built yet.
- **Capability- and session-shaped.** The release affordance EXISTS only for a
  member session holding `contribute` (`canRelease()`); a machine token sees
  the read-only review with the doctrine's own sentence about why it cannot
  release. Absent, not greyed.
- **Refusals teach.** The plane's refusal JSON renders verbatim with offenders
  named (`ENTRY_REQUIREMENTS` lists each document's exact lacks,
  `ILLEGAL_TRANSITION` its current state). `SET_MOVED` refreshes the list and
  says to look again; it is never auto-retried, because refuse-weight means
  the operator looks again.
- **After success** the UI lands on Review with a confirmation card naming the
  released ids and the Session Log record each now carries, and the record
  cache is invalidated so chips show verified.
- The facts card no longer shows `classification` (removed from the catalog in
  plane 0.33.0; frontmatter residue is inert and drains on promotion).
- Flow verified against a stub plane implementing the store's exact contracts
  (select POST shape, release params, refusal shapes, the 500-char rule). The
  harness caught one real bug before it shipped: a local `const go` shadowing
  the router's `go()` in the success path.

### Op contracts added in v2 (verified against src/index.mjs, src/store.mjs)

- `POST /api/?op=select&kind=enumerated&token=T` with body `{ids:[...]}` ->
  `{ok, handle, kind, n, expires, ttlSeconds}`. Owner and viewer are stamped
  server-side from the credential; a selection is readable only by the
  credential that made it. TTL 300s, refreshed on resolve.
- `GET /api/?op=release&handle=H&acknowledgment=A&mitigation=M&token=T` ->
  `{ok, released:[ids], acknowledgment, mitigation, weight:"refuse", drift}`.
  Requires a MEMBER SESSION holding `contribute`; a machine credential is
  refused by the store on the author stamp's shape (MACHINE_CANNOT_RELEASE).
  Only collected, non-crucial Information; refusals carry offenders. Both text
  fields <=500 chars, no quote, backslash, or newline (RELEASE_ACK_MAX).

---

## v1 narrative (2026-07-27, first UI build session)

v1, 2026-07-28. Follows plane **0.35.0** on biosmoke7 (see BIO_DATAPLANE_STATE.md).

**The Layer 3 UI runtime exists and is live, reading the real record from R2.**
Open https://civicos.believeinoakland.workers.dev and it serves the CivicOS
client, which loads the actual 30-bundle working record (the sewer-fund
evidence series, the auditor report, the ACFR statements, the OpenGov transfer
series) from the biosmoke7 plane. It is a real runtime wired to the live ops,
not a prototype. The signed plane and its record are untouched: `op=audit`
reads 30 checked, 30 clean.

## What runs where, and why the UI is a separate worker

The UI does **not** live in the plane. It runs as an isolated dev worker named
`civicos`, which serves `app.html` and forwards `/api/*` to the plane
(`biosmoke7`) through a Cloudflare **service binding** named `PLANE`. The plane
is signed and its deployed bytes are verified identical to the signed release;
injecting UI code into it would break that discipline and put the record within
reach of a deploy mistake. So the dev UI is a separate artifact. For production
the UI folds into the real domain as `believeinoakland.com/CivicOS` once that
zone is in place; the dev proxy worker is scaffolding, not the shipped shape.

The service binding is required, not a preference: a worker cannot HTTP-fetch
another worker on the same `*.workers.dev` zone (Cloudflare error 1042). The
binding routes worker-to-worker directly and avoids it.

## The design source of truth

`civicos-ui/tokens.css` is canonical (Bob's design foundation from the Claude
Design session; the handoff calls it the drop-in deliverable, do not fork the
values). Civic-ledger register: verdigris `#2F6F62` is the only signature
(primary action, verified fill), terracotta `#B3441E` is rationed to at most one
attention element per screen, working sits on `--paper`, published on `--sheet`.
Two spaces are set by `[data-space="working"|"published"]` on the document root.
The fence is a printer's double rule and appears nowhere else. Serif is
judgment, sans is plain speech, mono is machine fact. Chips are lowercase; the
only uppercase in the system is mono eyebrows. Radius ceiling is 2px, no pill.
The standing design brief is `docs/development/UI-KICKOFF.md`; requirements are
`docs/development/BIO_Design_Requirements_v2.md`. The full design-language
foundation (tokens plus the two register proofs) came from the Claude Design
session; `civicos-ui/tokens.css` is its committed, canonical output.

## The runtime (`civicos-ui/app.html`)

Self-contained client. It inlines `tokens.css` verbatim for standalone opening
(canonical remains `tokens.css`; when served, swap the inline block for
`<link rel="stylesheet" href="/tokens.css">`). Fonts load from Google Fonts for
dev convenience; production embeds the OFL WOFF2 faces under `/fonts/` per the
`@font-face` block already in `tokens.css`.

Connection: `const PLANE = { base:"", token, session, preview }`. Empty `base`
means same-origin, which is true when served by the `civicos` worker, so
`/api/...` calls reach the proxy and no CORS is involved. The gate offers three
ways in: sign in with `op=login` (member handle, or empty handle for the
administrator), paste a `MEMBER_TOKEN`, or "preview the design" with no data.

Wired to real ops and live on connect:
- Rail is capability-shaped from `op=whoami` (a capability the member lacks is
  absent, not greyed; Members & Keys hides for a non-admin).
- Record from `op=list`, leading with the human title (bundle id dropped from
  the row), lowercase chips, verdigris fill for verified.
- Bundle view from `op=image`, parsing the real nested YAML frontmatter into the
  facts card plus a mono provenance line, and rendering the prose and the
  append-only history.
- Search from `op=search` with a client-side fallback over `op=list`.
- Published space from `op=publishedmanifest` (public, currently empty).
- Members from `op=memberlist`.

## Op contracts (verified against biosmoke7 this session)

- Auth is a query param: `/api/?op=X&token=Y`. `op=login` is a POST of
  `{role, password}` returning `{ok, token}`; `role` is the member handle, empty
  is the administrator. The returned token is then passed as `token=`.
- `op=list` -> `{result:[{bundle_id, object_type, title, current_state, last_updated}]}`.
- `op=image&id=X` -> `{result:{filename: content | {sha256, bytes, ...}}}`.
  `bundle.md` carries YAML frontmatter: top-level `current_state`,
  `criticality`, `classification`, `content_hash` (`sha256:...`),
  `source_status`, and a nested `source: { locator, authority, retrieved }`.
- `op=whoami` -> `{result:{tokenClass, session, member, handle, administer,
  capabilities, vocabulary}}`. A `MEMBER_TOKEN` returns `tokenClass:"member"`,
  `session:false`, `capabilities:null` (reads work; capability-shaping needs a
  member session via login).
- `op=publishedmanifest` is public, no token ->
  `{result:{published:[{bundle_id, bundle_sha, ratified_at, attestor_member,
  gate_version}], shas:[]}}`. Currently `published:[]`.
- The worker sets **no CORS headers**. That is the whole reason the UI must be
  same-origin (served or proxied) rather than a local file calling the plane.

## Build and deploy the dev worker

`civicos-ui/worker.template.mjs` is the proxy logic with an
`__APP_HTML_BASE64__` placeholder. To (re)deploy after any UI edit, from a shell
with a Cloudflare deploy token:

    # 1. embed the current app.html into a deployable worker.mjs
    python3 - <<'PY'
    import base64,re
    app=open("civicos-ui/app.html","rb").read()
    t=open("civicos-ui/worker.template.mjs").read()
    t=t.replace("__APP_HTML_BASE64__", base64.b64encode(app).decode())
    open("/tmp/worker.mjs","w").write(t)
    PY

    # 2. deploy the 'civicos' script (account + subdomain below)
    ACCT=20b533579290b9b93168345edd3b7f72        # from the credentials file
    curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACCT/workers/scripts/civicos" \
      -H "Authorization: Bearer $CF_TOKEN" \
      -F 'metadata={"main_module":"worker.mjs","compatibility_date":"2026-07-01","bindings":[{"type":"service","name":"PLANE","service":"biosmoke7"}]};type=application/json' \
      -F 'worker.mjs=@/tmp/worker.mjs;type=application/javascript+module'

    # 3. first time only: enable the workers.dev URL
    curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCT/workers/scripts/civicos/subdomain" \
      -H "Authorization: Bearer $CF_TOKEN" -H "content-type: application/json" \
      --data '{"enabled":true,"previews_enabled":false}'

Account subdomain is `believeinoakland`, so the URL is
`https://civicos.believeinoakland.workers.dev`. The plane is never touched by
this.

## Done this session

Adopted the design foundation; built the runtime and wired it to the live ops;
stood up the `civicos` dev worker and verified it end to end against real R2
data; refined the record layout, wordmark, chips, and the bundle view to match
the storyboard.

## Next

1. **Wire the write actions.** Release is DONE (v2 above): per-document and
   batch, acknowledgment recorded. Next in the ladder: triage on Focuses
   (`op=dispose`, to deferred or dismissed with a reason), cite in Projects,
   capture in Add (`op=capture` / `op=promote`).
2. **Keep refining the look** against the storyboard as Bob drives real data.
3. **Production shape.** Decide whether to keep the dev proxy worker or fold the
   UI into the plane's own serving path for `believeinoakland.com/CivicOS`.
4. **Fonts.** Embed the OFL WOFF2 faces under `/fonts/` instead of Google Fonts.
5. **The published reading surface** (gap G1): no public op renders a ratified
   case-file body yet; the manifest and per-hash verify exist.

## Open decision for Bob

RESOLVED 2026-07-28: Bob chose the token value. Headings now ride `--t-rec`
(22px) with inline sizes removed; the token file stays unforked.

## Grants (pasted per session, never committed)

Same model as SESSION-KICKOFF.md. This work needs: a **Cloudflare deploy token**
(redeploy `civicos`), a throwaway **MEMBER_TOKEN** (read and verify against
biosmoke7), and the **GitHub token** (push). The account id and instance ids are
in the credentials file Bob pastes; no value is stored here.
