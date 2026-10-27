# K4426 review of fix-round-8-T51.md against walk-T51-rewalk7 A.md and B.md

Reviewer: independent (did not write the plan), sonnet. Read whole: the plan (481 lines, in five parts), the five diagnoses (`diagnosis-R8-watchdog.md`, `-reading.md`, `-capture.md`, `-speed.md`, `-live-reads.md`), `rewalk7-found.md`, `walk-T51-rewalk7/A.md` and `B.md`, `pdf-envelope-T51.md` §1.3 and §3.2 (the corpus rows the plan names), `rulings-active.md`, K4795-K4807, `review-K4426-round7.md`, `modules.json`. No file was too large to read whole. The source at HEAD 076097b670 equals the deployed commit (`git diff 2496ff995b HEAD -- bio-plane/src` empty), so every file:line was opened as it stands. `node /home/user/cp-close/checks/fixplan.mjs /home/user/bio` answers 6 plans, 125 causes, 0 failures. No test was run. Nothing but this file was written; nothing committed; no site contacted; no secret printed; no act refused by a safety check.

Marks: DEFECT = must change before use; GAP = should change; NOTE = for the record.

## 1. Counts

**DEFECT 11, GAP 17, NOTE 12.**

DEFECTs in one line each:
1. G115 is still spread across record-core, credentials, admission and plane (K4807 (3) not applied): jobs 3, 17 and 20 carry wraps, the counter design is still "BOB's choice", and queue merges before admission and plane.
2. G96 still gives the migration to plane (K4807 (6) not applied) and keeps two registrars of one debt (extraction `owe` and control-plane `readUploaded`).
3. G92's cause is misstated: `scanBatch` makes one batched `/scan` request, not one per file; the serial per-file awaits are `#render`, `#providerScan` and `#makeCopy`, so its failing-first test shape does not match the code.
4. G91 test (a) asserts "a `pass` before the first `scan-end`/`render-end`" for a 3 s scanner, which the fix as shaped (8 s call bound, 10 s budget) can never satisfy.
5. G95's fix shape ("whether or not another firing completed") contradicts K4807 (2) ("no firing completed") and has no control against a healthy backlog.
6. G97's control ("a 3-page scan is read inline whole") contradicts its own fix ("the inline pass makes no OCR call") and its assertion ("at most 3").
7. G114 keys a year-long, immutable cache by release only, but the answer varies by viewer language and by adoptions, and the shell names no language.
8. G122 names the wrong provider: the declared-unpacked-size helper already exists in `ooxml.mjs:121` (module ooxml); odf-reader gets no new helper, and control-plane has no `uses` edge to ooxml.
9. G99 and G122 door tests run "under the L harness's heap cap", but that harness is a node child without the Worker door, and Miniflare enforces no cap, so the "isolate dies" red cannot occur at the door.
10. G105 cites `control-plane/index.mjs:830-831` for the refusal code; it is at `:808` (`:830-831` is the end of the function).
11. G91 says a failed tick "backs off 15 s doubling to 480 s" citing `pending.mjs:60-61`; those lines set the cap at 1 hour (`PENDING_RETRY_MAX_MS = 3_600_000`).

## 2. K4807 applied to the plan (the points the instruction asked for)

| K4807 | Applied? | Where it is not |
|---|---|---|
| (1) interface-shell has no job | yes (G113 provider note, §3 cross-job notes) | but see DEFECT 7: G114 now needs the shell's language, which (1) forbids without a CHANGE |
| (2) G91 figures adopted | yes (10 s, 8 s) | G95's rule differs from "300 s with no firing completed or a firing running longer" (DEFECT 5) |
| (3) G115 in one owner | **no** | lines 26, 27, 286, 291, 419-420, 434, 437, 441, 445, 468 (DEFECT 1) |
| (4) G102 reads empty-password PDFs | yes in the fix shape | the test says "ends whole or stated" (GAP 6) |
| (5) G122 audit of other containers | text only | no audit test in G122 (3) (GAP 1) |
| (6) G96 migration is extraction's | **no** | lines 90, 95, 437 (DEFECT 2) |
| (7) the two "Next page" controls to `later-ux.md` | yes (§5, last bullet) | |

## 3. Findings

### DEFECT 1 · G115 spread across four modules (K4164, K4807 (3))
Cause: the plan was drafted before K4807 and still carries the wraps. Evidence: line 286 ("a service its writers wrap their statements in, `uncounted(fn)` ... *prov* credentials, admission, plane wrap their writes"); §3 row 3 (credentials job exists only for G115), row 17 (admission "G115 (prov: wraps `doorwindow`)"), row 20 (plane "G115 (prov: wraps the alarm and ledger bookkeeping)"); line 26 ("record-core (provider of G115's counter)"); line 27 and line 468 ("G115's counter design" listed as BOB's choice); line 291 ("the alternative, a per-table version in queue") and line 445 ("G115's counter design is the one cross-layer edit (four modules) ... BOB's choice at the START"); line 441 ("record-core, credentials, admission, plane (providers merge first), queue"). Merge order: queue is index 150, admission 155, plane 171 (`modules.json`), so as written queue's test `r8-count-through-door` merges before two of its providers.
Mechanism gap that K4807 (3) leaves to the plan: credentials receives the raw `sql` (`credentials/index.mjs:122-123`, the write at `:565`), and `writeCount()` is `total_changes()` (`record-core/index.mjs:439`), so "bookkeeping tables excluded in record-core" needs a hook record-core owns over writes it does not make; the plan names none.
Change: (a) delete job 3 (credentials) and the G115 clauses of rows 17 and 20; jobs 20 -> 19, and every "20" in §1 (line 26), §3 (line 414 "At most 20"), §7; (b) rewrite G115's owner line, fix shape and "Old records" to: owner record-core (the counter excludes the bookkeeping tables, amending R89/R90), queue keys on it; (c) delete "G115's counter design" from lines 27, 468 and the BOB-choice sentences at 291 and 445 (ruled, K4807 (3)); (d) line 441: providers become record-core only; (e) name the hook (for example record-core owning the connection or the exclusion list it subtracts) and make `record-core/r8-bookkeeping.test.mjs` drive the REAL credentials `touch` (`:565`), admission `doorWindow` and the scheduler/ledger writes, not stand-ins; if the job finds no record-core-only hook it returns to BOB, it does not widen to the three modules; (f) G119's `doorwindow` decision no longer carries G115 (line 327).

### DEFECT 2 · G96's migration given to plane; one debt, two registrars (K4807 (6), K4164)
Evidence: line 90 ("*prov* ... plane (the migration)"), line 95 ("a MIGRATION in the `migrateRepairs` pattern (R89), written by the plane job (plane owns the migration hook)"), line 437 (plane row "G96 (prov: the migration re-registering unregistered readings, R-OLD)"). `migrateRepairs` is `extraction/index.mjs:1982`, with the ledger registration already held there (`#owe`, `:491`, `:1965-1966`, used at `:2002, :2039`). G98 (line 113) and G122 (line 363) say "as G96's migration" and inherit the error.
Second part: G96's fix writes the same row in two places, `extraction.read` passing `owe` (before the answer leaves, `reading-pipeline/index.mjs:2708` already calls it) and `readUploaded` writing the `ocr` row (control-plane, "the registration at its source, control-plane", line 95). `owe` inside the object is at the source and is awaited before the answer; the control-plane copy is a second owner of the same cause.
Change: extraction owns the migration (extraction row in §3 gains it and its R-OLD test: stored readings with `tier3_candidate` or `ocr_left` and no `ocr` row, and documents held with no reading and no row, the ODS 84a1a376...); delete the plane clause at lines 90, 95, 437. Keep ONE registrar: extraction `owe`. Control-plane keeps only the logging lines and the test file; if the belt stays it is marked as logging-only (no second write).

### DEFECT 3 · G92: `scanBatch` is one request, not a loop over files
Evidence: plan lines 49 and 51 ("`scanBatch` (:1064-1112) and `renderBatch` (:1009-1040) call them for each queued file in turn"; test "`scanBatch` over two queued files returns ... with the first file still pending and its call in flight"). Code: `scanBatch` builds one `batch` and makes ONE call, `this.#scanner("/scan", { store, targets: batch.map(...) })` (`file-safety/index.mjs:1090`); the serial per-file awaits are `renderBatch`'s `for (const row of views) await this.#render(row)` (`:1032`), the routine-tool loop `for (const d of batch) await this.#providerScan(...)` (`:1106-1109`) and `#makeCopy` (`:1035`). `#scanner` has about twenty call sites (`:445, :973, :1090, :1131, :1142, :1504, :1591, :1621, :1718, :1732, ...`), the plan bounds none of the rest.
Change: restate the cause (one batched `/scan` plus per-file `/render`, provider scans and copies, all unbounded awaits); the bound goes in `#scanner` itself (one place, every caller) returning "still running" with the call kept; the test: a gated scanner, one batch of two files, the batch returns within the bound with BOTH files still queued, and the gated renderer with two queued views returns after the first with the second untouched; keep "a second batch does not start a second call for the same batch/file".

### DEFECT 4 · G91 test (a) cannot pass with a 3 s scanner after the fix
Evidence: line 42: the scanner "answers after 3 s, then the same after 40 s"; assertions "the first `pass` is recorded before the first `scan-end`" and "every `pass` of the text is recorded before the first `render-end`". With the shaped fix (call bound 8 s, firing budget 10 s, `pending-work` not first, line 44), a 3 s scan ends at 3 s and a 3 s render at 6 s, both inside the budget, so the first `pass` follows both; only the 40 s variant can put a `pass` first. As written the test is red today and red after.
Change: give each variant its own assertion: 40 s scanner: first `pass` before the first `scan-end` and before `render-end`; 3 s scanner: the first `pass` within one firing budget of the upload (counted as consumers run before it, not seconds), the order scan, render, pass accepted.

### DEFECT 5 · G95 contradicts K4807 (2) and has no false-positive control
Evidence: line 84 "stale is true when work is owed and the oldest wake already come is older than one health cycle ... whether or not another firing completed". K4807 (2): "`stale` at 300 s with no firing completed or a firing running longer". R28's definition is "no firing completed in them" (`scheduler/index.mjs:705-707`). As written, a healthy object draining 30 queued uploads (a row owed 400 s while a firing completes every 10 s) reads `stale: true`; the plan's controls (line 82: owed 60 s with a firing 30 s ago; nothing owed; back-off not due) do not include it, and line 84's "a healthy object never reaches it" assumes G91.
Change: `stale = work owed >= 300 s old AND no firing completed in the last 300 s (last_run, END of the last completed firing), OR a firing running > 300 s`; add the controls "30 rows owed, oldest 400 s, a firing completing every 10 s: false" and "one row owed 400 s, last completed firing 20 s ago: false"; the walker's numbers (oldest_overdue 691 s, last_run 551 s) stay red-then-true. Note `last_run` is the START of the last completed firing (`:611`), so state which instant the rule reads.

### DEFECT 6 · G97: control and assertions contradict the fix
Evidence: lines 102-104: the unit "`read(..., {ocrInvocations: 0})` makes no OCR call"; the seam asserts "the OCR calls seen inline at most 3 (red: 24; the fix makes it 0)"; the same unit's control says "a 3-page scan is read inline whole (no row owed, no `ocr_left`)". With zero inline OCR a 3-page scan is owed, not whole. G96's belt (line 95) registers on `tier3_candidate` as well as `ocr_left`; a fully read small scan has `tier3_candidate` true (`control-plane/index.mjs:854` pushes `ocrOnly` for it too), so it would get a pointless `ocr` row. Also `askMemberPerPage` makes its first call unconditionally (`reading-pipeline/index.mjs:362`, before the `invocations` loop), so "0" needs that call skipped, not just `:2611`.
Change: choose. Recommended: an inline OCR budget of at most 3 calls (about 5 s at the live 1.6 s a call), then `ocr_left` and the row; the control stays true; assertions "at most 3" stay; the unit also covers `0` for the ledger path. Register on `ocr_left` only, never on `tier3_candidate` alone. Name the first-call skip in `askMemberPerPage`.

### DEFECT 7 · G114: a one-year immutable cache keyed by release is wrong for this answer
Evidence: the shell sends only the release (`interface-shell/browser.mjs:2648`, `call("interfacewords", {query: {v}})`, no `language`); with no language the arm answers the viewer's OWN language and the team's current adoptions (`translations/index.mjs:715-724, 733-737`); `words-cache.mjs:30-32` sets `max-age=31536000, immutable` and `vary: Authorization, Accept-Encoding`. Dropping `Authorization` from `vary` (line 280) makes the browser's key the URL alone, so (a) a member who changes her language in Settings, (b) a team adoption (`translationadopt`/`translationconfirm`) or (c) a second member signing in on the same browser sees the first answer for up to a year. The plan says "the answer holds no member data" and "keyed by release and language"; neither is true of this request, and K4807 (1) forbids the shell change that would put the language in the URL.
Change: G114 keeps correctness first: `private, no-cache` with the content `etag` (a 304 costs one small round trip and G113 makes the body bytes), `vary: Authorization` replaced by nothing only if the validator is per-viewer-language (etag over the body already is); drop the year/immutable for the no-language arm (keep it only for a request that names `language` and `v`); add to the test: two members with different languages in ONE browser context each get their own words, an adoption mid-release is seen at the next load, and the second sign-in costs a 304 (no body). Drop "whether the words may be served without a session" (not touched). If a year is wanted it needs the language in the URL: a CHANGE to an unstarted interface-shell job (K4807 (1)).

### DEFECT 8 · G122: wrong provider; the helper exists in ooxml
Evidence: line 358 and §3 row 1 ("odf-reader (*prov*: a declared-unpacked-size helper read from the zip's central directory, never inflating)"). `ooxml.mjs:121` already has `export function declaredTextBytes(container, isTextPart)` ("the DECLARED UNCOMPRESSED size ... from the central directory BEFORE inflation", used by `odf.mjs:677-679` and the office readers), and `listArchive`/`hasZipMagic` (imported by `acquisition/index.mjs:55`). Module ooxml is index 14 (L1). control-plane's `uses` list has no ooxml, no odf-reader, no office-readers. The gate (`tooBigToReadInline`, `control-plane/index.mjs:733-747`) is a pure function of the descriptor today; it has no bytes.
Change: provider is ooxml (no new helper unless the job proves one is missing); add the edge control-plane -> ooxml (BOB records it in `modules.json`); say where the bytes come from: only a container whose stored size is at most `READING_DEFER_TEXT_BYTES` (3 MiB) is checked, read from the evidence bucket the door already reads for a `whole` descriptor (`heldWholeFacts`, `:749-752`), a bigger one is already deferred; a corrupt or lying central directory is treated as large (already in line 361). Remove G122 from odf-reader's row.

### DEFECT 9 · G99 and G122: the "heap cap" cannot be applied at the door
Evidence: line 122 ("The door run is under the L harness's heap cap") and line 361 ("`captureupload` as the member under the L harness's heap cap ... (red: the read is inline, the isolate dies)"). The L harness (`plane/shape/harness.mjs`, header lines 1-4) is a node child hosting the Store and feeding it through `captureOf(ctx).uploadCapture`, not the Worker door where `readUploaded` and the gate live; Miniflare/workerd enforces no 128 MB cap (the plan says so itself, line 120, and the diagnosis `reading.md` B (4)). So the door test cannot see the isolate die; its reds are `reading_pending`, the row at the upload and the reading after the ticks (the 15 s wall is green today: the inline read took 3.6 s uncapped).
Change: split each: Miniflare door test asserts deferral (no `extractread` during the upload, `reading_pending: true`, row listed before any promote, reading whole after ticks); the memory proof is a `shapeRun` child with the ODS (an `odsFile` generator already exists, `plane/shape/g44-gen.mjs:34`) at the object's cap. Delete "the isolate dies" from the red claims and the 15 s wall from the G122 reds (keep it as a control).

### DEFECT 10 · G105: wrong line for the refusal code
Evidence: line 181 "`deliverOwedRender` already returns `{ok: false, reason}`, `control-plane/index.mjs:830-831`". The refusal code is returned at `:808` (`if (made.refused !== undefined) return { ok: false, reason: (made.refused && (made.refused.reason || made.refused.code)) || "PROMOTE_REFUSED" }`); `:830-831` is the end of the function (the `DELIVERY_FAILED` catch is `:836`). The conclusion (no control-plane change) holds. Change: cite `:808`.

### DEFECT 11 · G91: the back-off cap is misquoted
Evidence: line 40 "a failed tick backs off 15 s doubling to 480 s, `pending.mjs:60-61, 90, 142-145`". Those lines: `PENDING_RETRY_MS = 15_000`, `PENDING_RETRY_MAX_MS = 3_600_000` (`:60-61`), `backoff()` at `:90`; the cap is one hour. (The same copy is in the diagnosis, `watchdog.md` Finding 4.) It matters: a row can wait an hour, which G95's control "a row in back-off not yet due" must cover and which the "451 s gap" analysis cannot rule out. Change: "doubling to one hour"; add to the P read the rows' `attempts` and `next_try`.

### GAP 1 · K4807 (5): the audit test is not written
G122's failing-first (line 361) covers the ODS and a corrupt directory only. K4807 (5) asks the same job's audit test to cover xlsx, docx, pptx, odt (and zip/epub). Add to `control-plane/r8-gate.test.mjs`: one fixture per container kind, small stored and over-bound unpacked, each deferred; a CHANGE to the owner for any kind whose reader then fails (P10).

### GAP 2 · G91/G92: who holds the in-flight call, and the unknown consumers
Line 44 first says "a handler cannot be preempted", then asks the scheduler for "an in-flight set" and that a consumer "is not abandoned" (which only a scheduler race can do), while G92 asks file-safety for the same semantics for two consumers. Telemetry says `monitor-cadence` (a 30-39 s run about every 5 minutes) and `document-copy` cannot be excluded as the live holder (`watchdog.md` Finding 1, "Not understood (i)"); a bound inside file-safety does not cover them. Change: state one rule: the scheduler races EVERY consumer tick against the budget and keeps its promise in an in-flight set (covers unknown consumers); file-safety's bound (G92) is the module's share that keeps its result and its queue state. Add an L assertion that the dangling call completes and writes its result after the handler returned (on workerd a pending promise after an alarm handler returns is not guaranteed; G91 (3)(a) "the file ends scanned" at 40 s is that test, make it explicit) and keep a P line on `scheduler_alarm` events for any consumer over 10 s.

### GAP 3 · R-LOG: the logging several causes plan is untested
R-LOG (line 17) says the line is itself tested. Tested: G91, G92, G106, G116, G117. Not tested: G96 (readUploaded/followEntries start and end lines), G122 (`extractread` start/end line), G113 (`body;dur`, `bytes=`), G118 (`fleet;dur`, `facts;dur`), G120 (`gate;dur` ... `reuse;dur`). G98's event is `pendsha_failed` in (1) and `pend_failed` in (3); make one. Add a test per line (exists, fields, written before the await).

### GAP 4 · Server-Timing entries have no provider
`control-plane/phase-clock.mjs:38-48` builds the header from the op, `do-<route>` and `in-<route>` only (and `objectTime` reads only `object;dur`, `:57-64`). G113 (`body;dur`, `bytes=`), G116 (`rows-queue;dur`, `queue-count;desc=hit|miss`), G117 (per-request object calls and bytes), G118 (`fleet;dur`, `facts;dur`) and G120 (five phase entries) all need the door to accept module-stated entries, an edit control-plane's row does not list. Add to control-plane: the phase clock accepts a token-checked list stated by the object or the door's own phase marks (METRIC_MAX raised), with a test; the owners then state their entries.

### GAP 5 · G99's old-record repair has no owner
Line 124: "the repair is a re-read of stored readings whose `too_large.key` is `cells` and whose container is an ODF (count at P)". No job row (extraction's lists only G96, G97), no test. R-OLD says new data only or carry a repair. Add it to extraction's migration with its test, or say "new data only; the member presses Finish it" and count at P.

### GAP 6 · Fixtures for G102 and G96 (iv) do not exist this round
G102 (3) uses "corpus C11 and C14", G96 (iv) "corpus D4 (100 text pages then 30 scanned)". The generator `pdfgen.mjs` is "BOB's acts ... not jobs of this round" (line 410, §7 item 3), and no encrypted-PDF or mixed text-and-scan builder is named. Name the builder each job uses (the pdf-reader tests already build `/Encrypt` files, `pdf-reader/pdfdoc.test.mjs`, `active.test.mjs`; `pdf-worker/test/make-pdf.mjs` makes image pages) or have BOB commit the generator first and say so in the START. Also tighten G102: line 151 "the empty-password file ends whole or stated" must be "whole" (K4807 (4) reads empty-password PDFs; stated only for the user-password file).

### GAP 7 · The seam owner merges before the provider of three seam sections
Control-plane is index 170, plane 171. Seam §G94 and §G95 need plane's route fields (`watchdog_ran`, `running_since` through `WATCHDOG_FIELDS`, `plane/pending.mjs:388`), §G98 plane's answers. Round 7 had the same order; here the seam file ships red by name until job 20. K1965 says the seam owner merges last on its path. Change: put §G94/§G95 in plane's own test file (plane is already seam owner for G91), leave control-plane the sections whose providers are earlier; or state in §3 that sections G94/G95/G98 are red by name until job 20.

### GAP 8 · G98: register before reading, and a better broken-stub test
G98's cause is "inferred, not shown" (line 109). The robust invariant is that the row exists BEFORE the inline read starts, so a killed read (as `exceededMemory` at 19:52:53) cannot leave nothing owed whatever `pendSha` does after. Add it as a fix and a test: `extractread` made to die mid-read leaves a `reading` row. The throw test (line 111) should wrap the `STORE` binding so the first `stub.fetch` rejects and stays broken, the shape `plane/shape/harness.mjs` already uses (`fault: {remote: true}`, header lines on FAULT), not a Store subclass (a throw inside the object returns a 500, it does not break the stub). One event name.

### GAP 9 · G91: the walker's pace (G70) is not asserted
G70 is "gaps up to 451 s" between a text's ticks. Test (a) asserts order only. With rotation, `pending-work` is last in the registry, so the reading ticks once per rotation. Add a count assertion: between two `pass` events of the text, at most N consumers (N the budget's worth) and at most one firing; with four slow neighbours the reading's ticks per firing do not fall below one.

### GAP 10 · New `uses` edges are not stated
DEFECT 8 (control-plane -> ooxml). G103 (line 165): "the one shared predicate (the spelling the G58 fix uses)" is `baseViewer`/`viewerMember` in `member-roster/index.mjs:45, 59` (module 36, L2); acquisition's `uses` has no member-roster. Say BOB records both edges; both are legal (lower layers).

### GAP 11 · G105: the same swallow at two more sites
`acquisition/index.mjs:2272` and `:2290` (the render-delivery paths) return `DELIVERY_REFUSED` the same way as `:2364`. K4571's audit applies: fix all three or say why the render paths differ; add a unit case each.

### GAP 12 · G111: the mechanism is left open
Line 244: "either the `search` hit carries its `project` (the module that owns `search`; one field) or one batched read replaces the per-project ones". The first names a module not in the table; the second names no owner. Decide (K4164): recommended, screens-intake reads `projectlist` once and asks one batched question read, or search owner's field with its job; the test "at most 1 call" fits both.

### GAP 13 · G119: the mechanism and the BOB decision precede the test
Line 327: "the door passes it on" implies a control-plane code change that is not in its row (only tests). The session is read three times by admission's own functions (`gate` `:667`, `readerOf` `:873`, `liveSessionDigest` `:1017`), each with `(t, env, doAnswer, background)`; a per-request memo inside admission (keyed on the `req`) needs no door change, so say that. The test (line 330) assumes `doorwindow` is dropped for session holders ("`groupidentity` at most 2") while the decision is "recorded at adoption": settle it first. Also confirm no admission requirement makes the window a security control for signed-in requests (see NOTE 9).

### GAP 14 · Owners' red tests live in another job's file
G113 (translations), G118 (instance-setup), G119 (admission) and G120 (ratification) have no failing-first test of their own; theirs are in control-plane's `r8-words-door`, `r8-bootstrap-fanout`, `r8-hops`, `r8-caseratify-calls`, written by a job that runs in parallel and merges after them (index 170). The owner cannot see its test red first (R-FOUR (3)). Each owner gets a module-level test at its own interface (count the fleet binding calls of `partsReport`; the shown-words arm unit; admission's session reads per request; the ratification chain depth with stubs); control-plane keeps the door confirmation.

### GAP 15 · G113 changes a documented op contract
`interfacewords` is declared as "every interface word in a language ... never blank, with `en` beside it" (`op-grades/t37.mjs:67`, `setup-words/rows.mjs:21294`, translations R8, `translations/index.mjs:713-715`). A default arm that drops fallback words changes it. Add: translations R8 and the op's declared description are amended in the same job (BOB's edit of the requirement and the row), and the settings screen's `language` arm keeps "every word".

### GAP 16 · G116 reverses a pinned test
Line 300 "the list is no longer made on every ask" reverses `r7-count-cache.test.mjs` "control: the list ... never served from the count's keeping" (and R94). Name the test to rewrite and the bound (same 5 s bucket and counter), and add the control that a list a to-do write has just changed is not served stale.

### GAP 17 · Walker rows with no explicit placement
B.md:17 (G81 "FIXED (MINOR residual)": the residual is not said; §2b lists G81 as plainly FIXED). B.md:14 (the member's Queue 4.2 s for 51 items, "close to the 5 s bar") and B.md:22's acts (`captureupload` 3.5-4.1 s, cite 1.7 s, `casedraft` 1.9-2.2 s) are over K4354's 2 s; §6 (6) covers them only for `caseratify`. Add one line in §2b: the acts at 1.7-4.1 s are the act floor (K4599), Bob's after the alpha, and the Queue 4.2 s is G115/G116's; ask the next walker for the G81 residual.

## 4. Notes

1. Line cites that are approximate or off by a little: `pending.mjs` "~:392" is `:388` (`WATCHDOG_FIELDS`) with `pendingOps` `:401-415`; `words-cache.mjs:27` for "`arrayBuffer`, parse, SHA-256, gzip" is `:24-28`; `keepRenderBodies` "(:1469-1500 after the wait)" is called at `acquisition/index.mjs:1515` (the second `stageBegin(t,"render")` is `:1499`); `#owe` ":1963" is `:1965-1966`. The conclusions hold.
2. G92 is counted "certain" (line 23) though its own text says the long consumer is only probable; count it with the six "certain with a part unknown" (22 certain, 7 with a part unknown); the totals stay 32.
3. G106 (3): `do-acquire` less `in-acquire` is transport plus compute plus queueing (`plane/store.mjs:48-50`), not only "the wait for the thread"; keep it as a reported figure and assert only the test's own wall (R-CLOCK is otherwise respected).
4. K3810: G108's test says the drawn line has no "filed under" and no `under .` (line 218), and G109's "not 'A page from'" (line 227): read the expected text from the word table or assert the empty fill, not a copy of the sentence.
5. G96 (iii), the cancelled promote: no diagnosis ran an aborted promote in Miniflare (the reproduction registered the row without the cancellation, line 91). The job must see it red or say Miniflare does not reproduce the cancellation and cover it with the unit (`owe` before the answer).
6. G107: the keep (`keepRenderBodies`, `KEEP_LANES = 8`) lives in module capture-sources (`render.mjs`, index 47), not acquisition; if the job finds more lanes are the fix, that is a CHANGE to an unstarted job.
7. G110: the machine words originate in capture-sources (`browserrender.mjs:233-237`, `render.mjs:343`); the code-per-reason in acquisition is a fair cut; say so.
8. G97's title blames the gate; the fix is not in the gate. Retitle: "the inline reading pass has no OCR bound".
9. G119: `doorwindow` counts requests by source for the door's knock/rate window (`admission/index.mjs:1030-1055`). Dropping it for session holders is a protective-limit change in the loosening direction; K1881 puts a limit that changes what a member may do with Bob; this does not change what she may do, so BOB's, but record the admission requirement it relaxes.
10. G94 adds `watchdog_ran` and `running_since` to the administrator's `owedwork` answer. K4565 says a stall is "never shown to administrators or members"; R80 already shows five fields to the administrator as a process route. Say in the START that no screen draws them.
11. G100/G101 are rightly two causes (index shape, then table-from-bytes); G101's first assertion is red today only because G100 is unmerged, which is fine at the plan's merge order.
12. G98 (3) "carries a stated refusal the screen can draw" is a new member-visible refusal row; K4269 allows a stand-in in code and a `later-ux.md` line; add the line to §5.

## 5. Per cause (the four fields), spot-checked at the code

Files opened at HEAD for every cause; at least two lines per cause. All lines for G91, G96, G113-G115, G122.

| Cause | Result |
|---|---|
| G91 | `scheduler/index.mjs:581, 589-600, 611-612, 662-664, 684, 693-716, 721, 725-728`, `SCHEDULER_ORDER` `:97-104`, file-safety registration `:310-311`, `store.mjs:504`: all say what is claimed. DEFECT 4, 11, GAP 2, 9. |
| G92 | `file-safety/index.mjs:430-441, 973, 1009-1040, 1064-1112`: DEFECT 3. |
| G93 | `grep heal(` finds only `scheduler/index.mjs:684`: OK. |
| G94 | `watchdog.mjs:38`, `scheduler/index.mjs:725-728, 709-716`, `pending.mjs:388, 401-415`: OK (the "~:392" is `:388`). |
| G95 | `scheduler/index.mjs:709-716`; `spent.test.mjs:103-125`: DEFECT 5. |
| G96 | `extraction/index.mjs:683-692, 491, 1965`; `reading-pipeline/index.mjs:2647, 2708`; `control-plane/index.mjs:854, 2658-2663, 2678-2681, 2729-2756, 3869`: cause OK. DEFECT 2. |
| G97 | `control-plane/index.mjs:733-747, 2552-2572`, `reading-pipeline/index.mjs:354-401, 2611`: OK. DEFECT 6. |
| G98 | `control-plane/index.mjs:2658-2663`, `plane/pending.mjs:add` `PENDING_NOT_KEPT`: OK. GAP 8. |
| G99 | `odf.mjs:674-700` (and no `inlineCellsMax`/`cellsIn` in it); `formats-xlsx.mjs:77-81, 957, 1087, 1272`; `csv-reader` `:803-872`: OK. GAP 5, DEFECT 9. |
| G100 | `reading-pipeline/index.mjs:43, 1385-1412`, `content/notice.mjs:120-123`, `calculations/index.mjs:486-514`, `tables.mjs:262-276`: OK. |
| G101 | same lines: OK. |
| G102 | `pdfstructure.mjs:4525-4529`, `reading-pipeline/index.mjs:1548-1559`: OK. GAP 6. |
| G103 | `screens-intake/capture.mjs:711-736`, `acquisition/index.mjs:2390-2391`, `control-plane/index.mjs:1355-1357`, `credentials/index.mjs:515-523`: OK. GAP 10. |
| G104 | `acquisition/index.mjs:2354-2365, 2391`: OK. |
| G105 | `acquisition/index.mjs:2363-2364`, `plane/pending.mjs:243-252`: OK; DEFECT 10, GAP 11. |
| G106 | `control-plane/index.mjs:2552-2570`: OK; unknown honestly planned. |
| G107 | `acquisition/index.mjs:527-540, 1489-1500, 1515`, `render.mjs:321-324`: OK (note 1, 6). |
| G108-G111 | `capture.mjs:322, 334-337, 342-349, 376-380, 665, 294-307`, `capture/index.mjs:1482`, `browserrender.mjs:233-237`, `render.mjs:343`: OK. GAP 12. |
| G112 | `case-authoring/index.mjs:1599-1611, 1760-1763, 1904-1906`, `screens-publish/ceremony.mjs:372-385`: OK. |
| G113 | `translations/index.mjs:716-737`, `interface-shell/browser.mjs:2641-2652`, `control-plane/index.mjs:142-147, 160-163, 882-886`: OK. GAP 15. |
| G114 | `words-cache.mjs:32` (the plan corrects the diagnosis's `:38`): OK as found; fix DEFECT 7. |
| G115 | `queue/index.mjs:187-191`, `record-core/index.mjs:430-439`, `credentials/index.mjs:565`, `admission` `doorwindow` `:1049`: cause OK. DEFECT 1. |
| G116 | `r7-count-cache.test.mjs` pin: GAP 16. |
| G117 | unknown planned with the lag meter: OK. |
| G118 | `setup.mjs:91-113, 154-167, 3149`, `browser.mjs:2849`: OK. |
| G119 | `admission/index.mjs:667, 873, 1017, 1049`: OK. GAP 13. |
| G120/G121 | `ratification/ops.mjs:314-331`, `publication/worker.mjs:532` (owned by public-read, `modules.json` index 112): OK. |
| G122 | `control-plane/index.mjs:213-217, 733-747`: cause OK; DEFECT 8, 9. |

## 6. Walker rows

All 25 rows the plan quotes were diffed against `A.md` and `B.md`: every one is verbatim (A.md:11, 12, 15, 16, 21, 22, 24, 26, 33, 34, 35, 37, 39, 46; B.md:9, 11, 13, 22, 23, 24, 25).

Every MAJOR of both walkers is placed: A.md:12 (G91, G93, G95), :22 (G91), :15 and :26 (G103, G104, G105), :21 (G96, G97), :37 (G99, G122, G98), :34 (G115, G116), :35 (G117), :39 (G118); B.md:13 (G100, G101), :23 (G113, G114), :24 (G106), B.md:9/:22 speed (G118-G121). The MINORs (A.md:16, :24, :27, :33; B.md:10, :11, :16, :25) are G108-G112, §5 and §2b. Not placed: GAP 17. Merged families are sound (G91 with G70; G96 with N2 and the live reads; G103 with the `fetch-done` comparison); no merged cause is two (G96's two sites are one debt: DEFECT 2 keeps one registrar); the split G100/G101 and G91/G92 are two causes each (GAP 2 on the second).

## 7. Structural checks

- Merge order is `modules.json` ascending: odf-reader 17, record-core 37, credentials 41, acquisition 48, file-safety 51, reading-pipeline 54, extraction 55, content 56, calculations 75, public-read 112, ratification 116, case-authoring 122, scheduler 141, queue 150, translations 151, instance-setup 152, admission 155, screens-intake 164, control-plane 170, plane 171. A user merging before its provider: queue before admission and plane (DEFECT 1, removed by K4807 (3)); control-plane's seam sections before plane (GAP 7). Everything else has the provider first.
- Jobs: 20 as drafted (not over 20); 19 after DEFECT 1.
- Causes: 32 = 23 + 6 + 1 + 2 holds; with NOTE 2, 22 + 7 + 1 + 2.
- Platform checks present for every cause; the G102 P is "none" with the corpus subset at the redeploy, acceptable once GAP 6 is met.
- Bob's questions (§6): the test holds. Nothing is raised as Bob's that is BOB's, and nothing BOB's decides what is Bob's: B-1, B-2, B-5 are K4628/K4630 figures (engineering), B-3 and B-4 are named as Bob's and not waited for (lines 466-468 (3), (5)), B-6 is in §2c. Two stale phrases remain: line 27 and line 468 still list "G115's counter design" as BOB's decision to record (DEFECT 1), and G119's `doorwindow` is BOB's only with the admission requirement stated (NOTE 9). K4803's B-1..B-6 sorting is unchanged.
- R-CLOCK: no test asserts the object's clock; G97, G106 and G107 take the test's own wall or a test clock around awaits; G91 (b)'s double clock is the scheduler's injected one. No R-CLOCK defect.
- Failing-first tests that would pass today: none found as stated except where DEFECT 4 (can never pass), DEFECT 9 (the 15 s wall and "isolate dies" are not red at the door) and GAP 8 (the Store-subclass throw is red but does not model the broken stub) apply; the labelled controls and characterisation (`r8-document-reads`) are green by design.
