# Diagnosis R6-unplaced: seven walker rows round 6 does not place (K4426 fields)

tranche/T51 at ab6fb6cfd5, 2026-10-22. Read-only; the live copy not probed; only offline node timing run. Paths under `bio-plane/`. Platform: L local workerd, P read-only live probe, N none.

| Row | Cause | Owner | Fixed by a merged change? |
|---|---|---|---|
| B-15 | certain mechanism; requirement ambiguity is BOB's | case-authoring, screens-publish | no |
| B-21 | unknown; two candidates | control-plane, interface-shell | no |
| A-27 | probable: by design / walker artefact | interface-shell (tests) | nothing to fix; tests missing |
| A-23 | certain: op right, screen never offers it | screens-inquiry (test) | "nothing follows" half: yes in code (K4574) |
| A-14 | certain for the op | acquisition | partly (G2) |
| A-21 | certain: not a regression; dead alarm | scheduler | yes in code, live proof owed |
| A-18 | certain, already diagnosed | extraction, control-plane | half (R88, G12d) |

## B-15 · `citations.rows` holds no evidence sha

(1) Cause. `casedocument.citations.rows` are the case project's own `cites` edges (`publication/index.mjs:1933-1937`, built by `case-authoring/index.mjs` `#caseCitations` :1936-1976). A case prepared from a question holds one edge, to the question, unpinned (`citation/index.mjs:891`; `no_bytes`, :1969). The EEOC passage was cited inside the question (`citation/index.mjs:700-745`, `ontoInquiry` arm), so its capture reaches the signed text only as `captures:`/`materials:`, as the walker saw. The ceremony signs one line per row with a 64-hex `version` (`screens-publish/parts.mjs:443-448`); there is none, so "signs all 2". Conflict: `requirements/screens-publish.md` R13 says "per piece of evidence they rest on"; the code reads only the case's direct edges. Whether the findings' evidence must also be signed rows is a requirement ruling for BOB; the walker said the same.
(2) Missed. `seam4.test.mjs:200-236` (K4536) pins the roster; its evidence is a hand-written `citations`, never made by the real cite, conclude, prepare flow.
(3) Test. Real case-authoring world, no doubles: cite a document passage in a question, conclude, prepare the case, publish; `casedocument` must carry a row for that document with its full capture sha, and `sitting()` an evidence line. Red today (one `no_bytes` row). If BOB rules "signed through `captures`", the test instead pins R13's wording and the ceremony count line.
(4) N. (5) case-authoring (`#caseCitations`), screens-publish (`sitting`); ruling BOB's, once in rulings.md.

## B-21 · front page failed to draw in 20 s and 30 s

(1) Cause unknown. `GET /` is `control-plane/index.mjs:870-877` -> `page()` :828-832; it makes no object call, so object cost and the dead alarm do not reach it. Offline (nine real screen modules): the script is 4,784,802 bytes; first build 1.03 s; each page request hashes the whole script twice (`page()` :830, then `interfacePage` interface-shell/index.mjs:471), 46-87 ms each, plus `checkScreens`/`checkGuide` (:436-439); only the source is memoised (:434-445), never the hash: 100-180 ms of synchronous Worker CPU per page in node, more on workerd. Candidates: (a) Worker isolate contention while 40 MB uploads stream through it (`captureupload` passes `req.body`) and screens send 19-53 parallel requests; (b) the 4.8 MB script download (compression unknown). The 0.6-9.3 s was curl of HTML; the 20/30 s was a browser draw: two different measures. Not reproduced.
(2) Missed. No test times the page route; e12/p9 count requests, not CPU; nothing loads the Worker as a walk does.
(3) Tests. (i) unit: the hash computed once per release (counter on `sha256HexSync`); red today (twice per hit). (ii) L: workerd with the object's limits (plan E3 harness): 10 concurrent `GET /` and script fetches during a 20 MB `captureupload`; HTML under 2 s, script under 5 s; red unknown until run.
(4) L for (ii). P once, read-only: 20 timed `curl` of `/` and the script with `Server-Timing` and `content-encoding`, idle and during a walk. Deploy logs a `page` CPU line (K4428).
(5) control-plane (hash once), interface-shell (memoise hash, check once).

## A-27 · `queue` x2; 49 requests on the first sign-in load

(1) Cause probable, not reproduced. The Queue screen reads the open list and the muted list, two queries of one op by design (`screens-daily/queue.mjs:44-48`); the shell shares only identical `(op, query)` (`interface-shell/browser.mjs:105-135`) and `e12.test.mjs:18-23` proves it. The frame asks `queue count=true` only when the list answer is cut or absent (`browser.mjs:414-437`; list default 200, `queue/index.mjs:1078`); a live count read would mean the list answer was not whole, which I cannot see. The doubled first load fits the walker's own account (two document loads in one profile): the `storage` listener routes a second tab again on a session change (`browser.mjs:2475-2485`, R32 by design) and dedupe is per document. Unproven.
(2) Missed. `e12` boots one page, one route; no sign-in-then-route or two-document case.
(3) Tests, controls first. (i) boot signed out, run the real `signedIn` (:1651-1665), count requests to settled; each `(op, query)` once. (ii) Queue with a live-shaped whole list (`items`, `truncated:false`): no `count` read. Both green closes the row as a walker artefact, recorded in rulings.md; red names the fix.
(4) N. (5) interface-shell (tests); screens-daily only if (ii) is red.

## A-23 · 409 `REEXTRACT_NOT_READ` on an unread scan

(1) Cause certain. The 409 is right: `extraction/index.mjs:1856-1860` (`reextractBasis` finds no `readings` row), and the screen never offers the act for an unread copy (`screens-inquiry/document.mjs:558-567` excludes `unread`, `repairable`). The walker sent `pdfstructure ocr=1` by hand. "Read it" 200 with the page still Unread is the dead alarm: a 2.6 MB PDF is over `READING_DEFER_PDF_BYTES` (control-plane :212, :700), so `readheld` is sent `defer=1` (:2917-2928), answers `READING_PENDING` (extraction :745), the door writes the row (:3711-3713) and no alarm ran it; SCHEDULER #39 (merge 2930557265, K4574; `scheduler/index.mjs:586-660`) fixes that.
(2) Missed. The 409 is tested (`pdfstructure.test.mjs:135`, `r80.test.mjs:64`); the "Read it" follow was untested over a spent alarm (K4561).
(3) Test. Op: none new. Screen: an unread document page draws `readheld` and never `pdfstructure` (extend `fr28-document-acts.test.mjs`). Follow: the 2a check (Read it, `owedwork` attempts, `reading` found).
(4) P after the deploy. (5) screens-inquiry (test only). Close the 409 as "op correct, unreachable from the screen".

## A-14 · a held file downloaded again on the second capture

(1) Cause certain for the op. `acquire {locator}` cannot know a copy is held: it reads the body (acquisition/index.mjs:1257-1330, `download` split), checks held parts by digest (:1291-1300) and computes `existed` after (:1391-1405). Held-by-address knowledge exists only as `heldat` and as the caller's `heldSha` for a conditional request (:972, :1135-1141; 304 -> `unchanged`, :1198-1204). The real screen asks `heldat` first and sends no `acquire` for a held copy (`screens-intake/capture.mjs:479-486`, R38), so the walker's double `acquire` exercised the bare op. Merged G2 (1e4d79e4b7, :1242-1285) parks a declared length over 8 MiB, so a second call answers at once, but (a) the background fetch downloads the file again (`twin`, :1246, matches only a live parked session, not a held copy), and (b) `mayPark` needs a member session (`askingMember`, :911, :1242): a bearer caller still reads inline. The walker's credential class is not in the walk file. Unproven: whether nps.gov sends `ETag`/`Last-Modified`.
(2) Missed. `t51-large-pdfs.test.mjs:46-52` serves instantly with a Content-Length; a repeat download costs 0 ms and nothing counts bytes pulled.
(3) Test. Acquisition, upstream throttled to 0.7 MB/s with `Content-Length: 15932155` and an `ETag`, bytes-pulled counter: `acquire` twice; the second pulls no body (304, `existed, unchanged`) or, without validators, creates no parked fetch when a capture of that address with that length is held. Red today. Repeat under a bearer credential to settle (b).
(4) L; P: one `curl -I` of the nps.gov file (not the live copy).
(5) acquisition (look up the held capture by address, send its validators), capture provides `validatorsOf`. Whether bare `acquire` may short-circuit (a member who asks for "the new copy" must still get one) is BOB's.

## A-21 · "inline first 24 pages gone"

(1) Cause certain: not a code regression, and the premise is wrong. Rewalk4's row (walk-T51-rewalk4/A.md:16) wrote the first pass "about 40 s" after an upload answered at 3.6 s: the alarm read it. A PDF over 2 MiB has been deferred since R120 (1c00deda79; `git log -L212,213` shows the constant never changed). What changed is the alarm: spent after eight kills 05:57-06:03Z, none since (K4561; `scheduler` `#reconcile` trusted a past alarm). SCHEDULER #39 merged (231baf9789, 6945dddbf3, 022938e71a). A-10, A-21, A-22 are this cause; OCR continuation by cursor is `readHeld kind:"ocr"` (extraction/index.mjs:820-834), also never run.
(2) Missed. Every fixture alarm starts null; `l77` kills once, never past the retry cap.
(3) Test. Placed for the cause (`stale-alarm.test.mjs`). On the walker's case: a 60-page 2.6 MB image PDF through the real door, a spent alarm, `heal`, ticks until `op=reading` shows 24 OCR pages, then 60, no press (plan E3).
(4) L; P at the re-walk (`owedwork`). (5) scheduler, plane. Fixed in code; proven only live.

## A-18 · 0115's statement against a part digest; no repair

(1) Cause certain; already in diagnosis-R6-capture.md F. `REGISTER_FIRST` (capture/index.mjs:246) returned the lowest-sorting digest, so 0115's row carried part 4 (161911ac...) and the press sent `readheld` with it; `readHeld` found no document, used a bare `{capture:{sha256,bytes}}` stub and wrote "non-textual or too large", no size, `at:null`, against the part (`reading-pipeline/index.mjs:2094-2096`). Merged: G6/R88 (`#wholeOfPart`, extraction :868-881; `readHeld` :698-703; `round6.test.mjs:65-83`) and capture's whole-digest row (e65bc0f3cd). Unplaced: (a) the stale part-keyed `readings` row stays on the live copy; it counts as a second capture in `#caseCitations` (`case-authoring/index.mjs:1960-1963` unions `readings.capture_sha`), so 0115 reads `undetermined`, not `only_capture`; no R-OLD entry. (b) `readingWontFit` (control-plane :2556-2558) still defers on the clock half for a capture over 24 MiB although `tooBigToReadInline` exempts it (:694), so the 41.5 MB capture at 18.7 s answers `reading_pending`, not a statement with its size (diagnosis F.2 not made).
(2) Missed. Wholes sort first or have one part in fixtures; the old state was seeded only as an answer (`round6.test.mjs:73-78`), not as a migration; no test crosses a >17 s acquire with a >24 MiB capture.
(3) Tests. (a) 5-part document, a `final` reading on part 4 and none on the whole; run the start-up repair and the tick; the part row is gone or superseded, the whole holds a `final` statement with 41,502,904 and `at`; the document then reads `only_capture`. Red today. (b) slow upstream (>17 s), 41.5 MB five-part capture: the answer carries the sized `final` statement, no `reading_pending`. Red today.
(4) N. P once, read-only, before writing the migration: 0115's `data/provenance.json` (`capture.sha256`, `parts`) and `readings` rows by bundle.
(5) (a) extraction (migration, precedent `reading_migrations` :67; R-OLD ruling), (b) control-plane.
