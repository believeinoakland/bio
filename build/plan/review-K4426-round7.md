# K4426 review of fix-round-7-T51.md against walk-T51-rewalk6 A.md and B.md

Reviewer: independent (did not write the plan). Read whole: the plan (365 lines), the four R7 diagnoses, A.md, B.md, round 6's review, and the K4426, K4297, K4354, K4269, K4164 lines. Every file:line the plan relies on was opened at HEAD d442c733bc; `git diff 6351c8fb14 HEAD` shows no change under `bio-plane/src` or `site-profiles`, so the plan's lines still hold. Nothing was run. Nothing but this file was written.

Marks: DEFECT = must change before use; GAP = should change; NOTE = for the record. Fields: (1) cause with evidence and owner (K4164); (2) why tests missed it and gap closed; (3) failing-first test on the walker's case, would it be red today; (4) platform marker; (5) regression or Bob's change.

## 1. Counts

DEFECT 3 (G78, G80, G81). GAP 20 (G59, G61, G62, G63, G64, G65, G66, G68 x2, G70 x2, G72, G73, G75, G76 x2, G79 x2, G80 split, A.md:44 unplaced). NOTE 10. Verified without finding: G58, G59 (cause), G60, G61 (cause), G65 (cause), G67 (cause), G69, G71, G73 (sentence), G77.

## 2. Per cause

### G58 founder `owedwork` (certain) - OK
`store.mjs:807-809` takes only `class:admin` or `member:<id>`; `admission/index.mjs:344-352` gives the founder the bare `admin`; the door stamps it (`control-plane/index.mjs:1355, 1413`); `pending.mjs:318-326` returns the bare answer. Cause, test through the door, marker (P) all hold. Red today. NOTE: `stalled()` also returns the bare answer when `health` answers a falsy value; the plan's hardening (c) covers it.

### G59 vouched upload cannot be signed (certain)
Verified: `capture/index.mjs:842` dotless name; `bundle.mjs:588-590` and `:653` extension-only; `RecordCore.snapPath` (`record-core/index.mjs:723-731`) splits the NAME after the last `/`. Test (b) is the walker's case and is red today.
- GAP (2): record-grammar (L1) cannot import record-core, so the plan adds a fourth copy of the derivation (`snapPath`, `promotion/history.mjs`, `document.mjs:754`, now `bundle.mjs`). The family recurs unless a parity test lives in a higher module (record-core or ratification) asserting the helper equals `RecordCore.snapPath` for dotted, dotless, subfolder and dotted-directory paths. Also add `a.b/c` (dotted directory, dotless file) to fixture (a): `bundle.mjs:589` takes `lastIndexOf('.')` over the whole path, `snapPath` over the name only, so the plan's `a/b/c` case does not exercise the difference.

### G60 findings never drawn (certain) - OK
`ceremony.mjs:535-545` names four refusals; `parts.mjs:91-96` returns only the word. Red today. NOTE: the heading is a stand-in with a UX row (section 5), fine under K4269 because a refused signing with no stated problem blocks the operation.

### G61 member's Queue refuses (certain)
Verified: `notice-producers/index.mjs:161-164` mints `fetch-done`, `ingest-done`, `ingest-stopped`; `queuestate.mjs` `classOfKind` (:428-434) returns null; `queue/index.mjs:1257-1258` refuses whole. Test (a) cross-check and (b) are red today. Owner queue is right (`queuestate.mjs` is in queue's paths).
- GAP (1): the plan says the opener of any large capture "would lose their Queue". Walker A (founder) opened a large capture that finished (A.md:15, A.md:43) and his Queue answered 200 with "no 'fetched' notice" and no `fetch` row. That row is not placed anywhere (not a cause, not 2b, not carried). `notice-producers/index.mjs:1410` returns nothing when `#active(me)` is false, which probably explains the founder (bare `admin` vs `member:admin`, the same family as G58), but nothing in the plan says so. Place it in 2b with that evidence, or as a cause; and make the `fetch-done` leg of the seam test run as an enrolled member (a founder run is green for the wrong reason).

### G62 time zone (cause unknown, reproduction tried offline)
Honest unknown with a recorded fixture-shape reproduction; logging and the screen change ride the deploy.
- GAP (1): candidate (ii)'s fix ("fall back to the profiles Settings draws from") is already in the code: `retrieval/index.mjs:183, 202, 515` default `combine` to `combineProfiles`, and `zone()` falls through to it unless two profiles disagree. So (ii) as written cannot be the cause; the live differences left are `jurisdiction_profiles` unreadable, `ratify.reached` false, or a stale answer. Restate the candidates and drop the no-op "best-reading fix" from retrieval.
- NOTE: `#publishAtOffer` (`ratification/index.mjs:676-686`) only falls back to profiles on a THROW; `zone()` returns null without throwing. That asymmetry is real and cheap to fix in ratification, and is a better best-reading than (ii).
- Three modules edit (retrieval, ratification, screens-publish); acceptable as provider/user, owner named.

### G63 `moneyingest` 4.1 s (cause unknown)
- GAP (1,4): K4426 says an unknown cause plans logging that names it on the one redeploy; G63 has none (only a P read of Server-Timing against a trivial act). Add per-stage `Server-Timing` entries in the act (table cache hit or cold, bytes hashed, picked-list build) so the one redeploy names it.
- NOTE: the cold-cache hypothesis is weak for the walk (declare, adopt, ingest within minutes in one busy object, cache warm); the act floor is likelier. The plan's restart-between-steps test is not the walker's exact case. Acceptable only because the job reports to BOB before any fix.

### G64 tab-delimited source
`csvScan` is comma-only (`tables.mjs:39-70`) and `delimiterSignature`, `createRecordWalk` exist in csv-reader (`:385, :446`). New `uses` edge calculations (74) to csv-reader (14, L1) is legal.
- GAP (1,3): "so his file was tab-delimited" is an inference from how the walker printed row 0, and the plan itself says 18,101 vs 18,098 is unexplained (a tab file gives header + 18,098 = 18,099, not 18,101). The builder (`tables.mjs:268-272`) also keeps the header as row 0 for a comma file whose first line differs cell-for-cell (case, a rename, a BOM-less variant). The cause label "certain" is only certain for "csvScan reads comma only". Before shaping: a P read of `op=table` d4023049 (the plan already names it) and put the walker's actual first bytes in the START; the failing-first test must then be the walker's file, not a constructed tab file.
- NOTE (5): the new refusal (d) rejects declarations accepted today; it is a technical refusal with a stated reason, fine; say in the START that existing tables are untouched.

### G65 "was read as ." (certain) - OK on cause
`queue-producers/words.mjs:92-96` lower-cases `NOT_FOUND` to `not_found`; the row is `notfound` (`rows.mjs:7212`). Red today.
- GAP (K4269): the walker rated it MINOR and it stops no operation. The plan calls it code, not wording, which is right for the fix, but K4269's test is the effect, not the fix. State the K4269 basis (a sentence with a hole in it) or move it to T52; a two-line fix is cheap either way. Also A.md:39 reports DUPLICATE "newer version" items on Home ("four on the walk's questions") and says "duplicates ... not researched"; the plan places "was read as" but not the duplicates. Put them in 2b with the evidence (one per holder/reference/newer capture, `reevaluation/index.mjs` id formula) or as a cause.

### G66 no "newer version" item (cause unknown, reproduction 3 of 3 green)
`#sweepPending` (`reevaluation/index.mjs:2616-2621`), `receiptSeen`, and the 1 s `REEVAL_NOTICE_DELAY_MS` (:114) support the best reading: the sweep runs 1 s after the receipt, before promote and the reading.
- GAP (1,5): the fix "bounded three passes at its delay" is three passes at 1 s, i.e. 3 s; a newer capture whose reading takes minutes (any large file) is still missed. Bound by state (re-open while any leg is `chain_unread` and the newer capture has a reading row owed), not by pass count. And "a bundle that becomes a newer capture counts as a receipt" needs promotion (L2) or extraction (L4) to call reevaluation (L7): an illegal edge. Say the whole fix lives in reevaluation (poll the unread legs), or name the legal hook.
- NOTE: the logging (`examined`, `unread`, `raised`) is exactly right.

### G67 `last_ms` (certain, measurement)
Verified `pending.mjs:89, 133-137`, `scheduler/index.mjs:573, 589`: `started_at` is the alarm's `now`. Red test is the walker's shape.
- NOTE (5): the plan judges the 10 s bar on `own_ms - wait_ms`; K4670 kept the bar as BOB's technical call, so this is BOB's to record, not Bob's. Say it is a ruling to write, not an interpretation.
- NOTE: G67 changes what the field means; it does not show the 93 s / 75 s outliers are inherited time (the plan says "probably"). The bar stays unproven until the new fields are read at P.

### G68 per-tick whole-file work (certain) / 12 MB text 30 s (unknown)
- GAP (3,5): the fix (byte-window cursor for text and CSV; PDF range against an already-parsed index) is a rewrite of the reading path with member-visible output; the failing-first test counts bytes only. Add an equivalence assertion: the pieces' units, words and `completeness` equal the whole-read's, with a multi-byte UTF-8 character and a quoted multi-line CSV field straddling a window edge.
- GAP (1): "unknown" for the 12 MB text without a reproduction tried at the platform's shape (the diagnosis says "none yet"); Miniflare reproductions were run for G69 in the same diagnosis, so one for this was possible. Run it, or state that G67's fields are the only plan.

### G69 `last_mem` 0 (certain, reproduced at L) - OK
`pending.mjs:60` `memory()` returns 0 for workerd's zeros. NOTE: this makes G39's "last_mem on the first heavy row" unmeetable on the platform; the plan says the capped-child harness stays the proof but does not say the requirement text changes. BOB records that in `rulings.md`.

### G70 pace 28-64 s between ticks (cause unknown)
- GAP (3,4): the failing-first test drives a storage double "whose `setAlarm(t)` fires `t` after a configurable platform delay", so it encodes the hypothesis; it cannot be red for the real cause. Miniflare's alarm is not Cloudflare's, so the L half cannot see platform re-arm latency either. Only the per-alarm log at P can. The best-reading fix (`max(want, Date.now())`) is a no-op for the platform (a past `setAlarm` already fires at once) and edits the scheduler's core contract (R1/R4/R16). Ship the logging alone; keep the fix out until the log names the gap. Another candidate not listed: the `*/5` watchdog and `heal`/`arm` interplay (`#held` R27, `HEAL_EVERY_MS`).
- GAP (K4426 (1)): no reproduction tried at the real alarm.

### G71 `words_read` (certain) - OK
`extraction/index.mjs:1484` as the plan says. Test asserts the sum of the pieces; the job should also confirm `capture_text_state.words_read` is accumulated for PDF pieces by the writer (:1400-1404), or the override alone shows nothing.

### G72 RENDER_FAILED, "Finish it" 404
Verified `acquisition/index.mjs:2244-2246` drops the session on a stated failure; `:1025` answers 404. Honest unknown for the render, logging planned.
- GAP (3): the plan's screen test re-reads `opencaptures` and expects the line to go. But the session was already dropped server-side, so a fresh `opencaptures` should not list it, yet A.md:55 reports the Unfinished line still on the Add screen at the end. Add an acquisition assertion that after `owedRun` ends `final` the open-captures read no longer lists the session; if it still does, the screen fix does not help.

### G73 stated sentence + other project's name (certain for the sentence)
Verified `capture.mjs:205-209` passes the reading's sentence as a code; `document.mjs:393` draws it correctly.
- NOTE (5): the name of the other project is drawn "by the read rule, id never drawn". That is a visibility rule over K4404's "by design", and diagnosis R5 said it needed Bob's rule. The plan decides it as BOB's (not a privacy question because the same account). A project's name seen by a non-member is a policy line (P17); at least write the ruling in `rulings.md` the day it is applied, with the read rule stated.
- GAP (1): "whether it was really filed in her project" is unknown with no reproduction; the capture-side test and the P read are the plan, fine, but it has no logging; acceptable only if the test is red-or-green before the deploy.

### G74 member files into a project she is not in
- GAP (1,3): how the member's Add screen reached a project she cannot read is not established (A.md:25 says "through the screen"; the project comes from the screen's route, `capture.mjs:52-60, 124`). The failing-first test starts at `promote` with `project=P`; start from the Add screen opened on that route, as the walker did. The owner `promotion` is a guess until the unit run; name the fallback module (control-plane `:3276`, or inquiry) in the START.
- NOTE (5): "refuse, or file unprojected, BOB's choice by the test's result" is a member-visible rule on who may file where; record the choice as a ruling before the job merges.

### G75 "Untitled capture"
- GAP (1): labelled "probable", no reproduction. It is a read of where `bundles.title` is written from the promoted front matter (`promoteDocument` writes `title:`, `control-plane/index.mjs:803-811`) against `copyOf`/`heldat` (`screens-intake/capture.mjs:622-629`); do that now so the job gets a cause, not two alternatives. K4269: a held-list name is a rendering unless it stops an operation; state the basis (rows indistinguishable in the Held list) or defer.

### G76 CSV profiled as a shell (certain, reproduced)
Verified `client-rendered.mjs` NO_PROSE (`bodyLen > 2000 && anchors === 0 && paras <= 1`, POSSIBLE on one signal). Fix is in site-profiles; repair is extraction's.
- GAP (4,5): the repair "reading row owed ... the tick re-profiles it" re-reads a whole held CSV or text (a 17 MiB CSV is 30 minutes of ticks, and the Document may drop from "whole" to "partial" meanwhile). Specify a profile-only pass over the stored head, not a re-reading; marker **N** is wrong for the migration (start-up load of an unknown count of rows): make it **L** (count, memory) and **P** (the count).
- GAP (job table): §2 puts "reading-pipeline `read` of a CSV: profile not a shell" in G76's test, but the reading-pipeline row lists only G68. Add G76 (test) to that row or move the test.

### G77 "Next page" stuck (certain, reproduced) - OK
Verified `browser.mjs:841` ids by position and `restore` at :1471 (`el.checked === !!DRAWN[id]` then restores). Test asserts press 5 times. Marker L + P right (Chromium radio semantics).

### G78 `heldcaptures` 7.4 s
- **DEFECT (1,5)**: the fix "answer `whole` from the register when it records it" misreads the field. `reg.whole === true` (`capture/index.mjs:1819`) means the first capture's digest is the WHOLE of a multipart capture (`capture_sha` is the whole's sha); it does not say the store holds that object. `#wholeOf`'s `head` exists precisely because the whole can be owed or never kept (`keepPast`, >32 MiB, `keep_pending`); the screens withhold vouch and OCR from rows whose answer is false (comment at :1698-1702). Answering true from the register would offer vouch and OCR on a 40 MB capture with no whole object. The test as written ("register `whole` true, second draw makes 0 heads") is green only under the wrong meaning. Change: remember only POSITIVE head answers per digest (immutable once the object exists), never infer from the register; add a golden row for a parts-only 40 MB capture that must still answer false.
- NOTE: the measured saving is small (six multipart rows at 175-223 ms, 8 lanes), so this does not touch the walker's 6.2 s; the plan is honest that (b) is unknown. The contention hypothesis rests on G80's unmeasured premise.

### G79 uploads and captures over the bars
Verified `capture/index.mjs:754, 763`, `keepWhole`/`keepPast` (`acquisition/index.mjs:437-485`), `RENDER_WAIT_MS` 10 s. The 40 MB case is explained to the second (2.5 s + 20 s wait).
- GAP (1,4): the dena (16.8 s) and Wikipedia (15.2 s) causes are read off constants (10 s fetch + 10 s render). The code states the co-attestation (timestamp and co-archive, "measured 9.6 to 21.5 s a page") is also awaited, and `acquiretimings` / the `trace` give stage times. Read the stage times at P first; the render-wait fix may not reach 15 s.
- GAP (4): no predicted figure for the 24 MiB upload. Dropping the read-back cuts store traffic from about 72 MiB to 48 MiB; the walker's `in-` was 17.2 s, of which about 3 s is the body. State the expected time or make `putFromParts` (server-side) the primary route; hold the 128 MB memory case at L (the plan marks L; keep it).
- NOTE (5): handing the keep to the ledger at once for >32 MiB reverses R103/F2's "await it". The ledger keeps it alive, so the reason holds; the Document for such a file is "stated" anyway.

### G80 contention (certain "from measurement")
- **DEFECT (5)**: "compute `queue` once per ledger version" has no defined key. The feed is derived on read from many tables and the clock (`queue/index.mjs`, nothing cached today); a version of the reading ledger would not change when a question, a deadline, a notice or a mute changes, so a member would see a stale to-do list. The test ("no change in the ledger does no recompute") cannot catch it. Define a record-wide write counter plus a time bucket, key by viewer, and assert invalidation for each producer's write and for a mute.
- GAP (1, K4164): G80 has three owners (queue, extraction, plane). Split it: the queue count (measured, certain, queue-only) and tick slicing (extraction/plane). The second is stated "certain" but nothing measured shows a tick blocking the thread: R-CLOCK says the object cannot time its own compute, G67 says `last_ms` is not compute, and G68 says the outliers "are not CPU-shaped". It is an unknown until the L run; plan it as such, and do not slice before L shows a block. Say how a slice yields (a bare `await` of a resolved promise does not let another request run in a Durable Object; it needs real I/O or a timer).
- NOTE: the p95 < 500 ms timing assertion by the test's own clock is flake-prone on a shared host; run it alone, five times, as the other heavy files.

### G81 kept frame reads
- **DEFECT (5)**: G12b kept six reads and asked each again once so the frame follows the answer (`browser.mjs:2654-2657`). G81 stops asking for up to a day. Four of the six (`assistantstate`, `accountreference`, `subscriptionsignin`, `groupkeystate`) are changed by other actors or devices (another administrator turns the assistant off, a subscription lapses, the group key is turned on), and the plan's invalidation list ("sign-out, a settings act, a role or word change") covers only the member's own acts. The member would see "connected" or "on" for a day and meet a refusal. The plan never names the six. Change: keep the single re-ask (it is the cost of correctness) or a freshness of minutes for the four, and skip the re-ask only for the two constants (`groupidentity`, `infolevel`); add a test per read that another actor's change is seen on the next route.
- NOTE: the walkers rated the counts MINOR; request count is not K4354's bar. The case for the job is the time, which it does not measure; say what saving at P justifies the staleness.

## 3. Structural checks

- One job per module: 19 rows, each module once. Every cause of a module is in its row except G76's reading-pipeline test (GAP above). G73's capture test and G66's scheduler logging are in their rows.
- Merge order follows `build/modules.json` index: record-grammar 1, site-profiles 20, promotion 41, acquisition 47, capture 48, reading-pipeline 53, extraction 54, retrieval 73, calculations 74, reevaluation 103, ratification 115, scheduler 140, queue-producers 147, queue 149, interface-shell 159, screens-intake 163, screens-publish 167, control-plane 169, plane 170. Matches the table.
- New `uses` edge: calculations to csv-reader only; csv-reader (L1, index 14) is earlier than calculations (L5): legal. G66's "receipt on filing" and G69's last-run record could create illegal or unnamed edges (see G66, G69); G69's plane-side table needs no job outside plane.
- K4164: G80 (queue + extraction + plane), G62 (retrieval + ratification + screens-publish) and G79 (capture + acquisition) each span modules. G62 and G79 name one owner with providers and stay in the pattern the earlier rounds used; G80 should be split.
- Wording-only items: none became a job. G65 and G75 are code but have rendering-only effects (K4269 basis needed).
- Seam owner: control-plane writes one file `t51-round7-seam.test.mjs` for ten causes; with the G59 case-checker regeneration the file cannot go green until BOB regenerates, as the plan says.

## 4. Walker rows STILL/NEW and their placement

Placed: A.md:10 (G58), :12-13 (G79), :17-19 (G72, G79), :18 (G79, G73 for "filed here as well"), :20 (G70, G71), :21 (G67, G69), :22 and :28 (G77), :24 (G67, G68), :25 (G74), :27 (G69), :29 (G79), :31 (G73), :32 (G76; R7b in 2b), :36 (G81), :37 (2b proxy), :38 (G78), :39 (G65, G66), :40-41 (G67, G80, floor to K4599). B.md:13 (G59, G60), :14 (section 5), :15 (G62), :21 (G63, G64), :22 (G61), :25, :27 (2b B5), :33 (G58), :34 (G66, G75), :35, :36 (2b, section 5), :37 (G80, floor).

Not placed:
- GAP: A.md:15 and :43, no "your capture finished" notice and no `fetch` row for the finished 15.5 MB capture (see G61).
- GAP: A.md:39, duplicate "newer version" items on Home (see G65).
- GAP: A.md:44, cited range cells / cited by row range (G41f-1/2, G48) not exercised; not in section 7's carried list.
- NOTE: B.md:12, `CASE-2026-1297` file `INTERRUPTED` at attempt 1, built at attempt 2 three minutes later with no press. The walker scored it FIXED; the plan is silent on the interruption.
- NOTE: B.md:27, a 297 KB ODS whose reading is "too large to keep whole: 9.2 MB; the largest part is cells". Probably G44 by design; say so in 2b.

## 5. Why-the-tests-missed and unknown causes

Gaps (2) are real for G58, G59, G60, G61, G65, G67, G69, G71, G77 and are closed by the tests named. For G63, G68 (12 MB), G70, G73 (filing), G75 the "unknown" lacks a reproduction tried at the platform's shape (K4426 (1)); G72 and G78 state why none was possible. Nine unknown causes are closed only by their logging at the re-walk; G63 and G73 plan none (GAP above).

## Second review

Reviewer: second, short. Read whole: this file, then `fix-round-7-T51.md` (381 lines). `node /home/user/cp-close/checks/fixplan.mjs /home/user/bio` answers **87 causes, 3 fix-round plans, 0 failures**. Opened at HEAD: `record-core/index.mjs` (no write counter), `acquisition/index.mjs:400-490`, `plane/store.mjs:807-809`, `modules.json` (layers, `uses`, index order). Nothing else written; nothing committed; no act refused.

### 1. The first review's 3 DEFECTs and 20 GAPs
All three DEFECTs are answered as BOB decided, with one exception noted below: G78 (positive heads only, parts-only golden row that must stay false), G80 split into G80 (queue count) and G82 (tick, "Cause unknown" until L, with how a slice really yields), G81 (only `groupidentity` and `infolevel` skipped, one test per other read). All GAPs are resolved or placed: G59 (parity test in ratification, dotted-directory case), G61 (A.md:15/43 placed, member run), G62 (candidates restated, ratification null fall-back), G63 (stage `Server-Timing`), G64 (P read of `op=table` first, delimiter refusal), G65 (K4269 basis, duplicates placed), G66 (state bound), G68 (equivalence tests), G70 (logging only), G72 (3b), G73/G74 (name never id, no change of who files), G75 (two sites named), G76 (profile-only pass, markers L and P, reading-pipeline row), G79 (stage times first, predicted 8-12 s), A.md:44 (carried, section 7). G67's bar is on `own_ms` as a BOB ruling. G58/G60 unchanged and fine.

### 2. New defects and gaps
- **DEFECT G80 (a fix that relies on a provider that does not exist).** The cache key is "the record's own write counter, a provided read of record-core, which queue already uses" and the seam list says the test "needs record-core's write counter only". There is no such counter in `record-core/index.mjs` (the only `seq` is the image entry's write-order rank, `:794`; no `data_version`, no `total_changes`, no counter anywhere in `src`), and no job touches record-core (index 36). As written the job either invents a queue-local counter that cannot see other modules' writes (stale list again) or cannot be done. Change: add a record-core job (provider, merges before queue) that increments one counter in the single write path every module uses and exposes a read of it, with its own test (each write path bumps it, a read does not), or name another existing signal; update the job count (19), the table, the numbers in section 1 and the seam providers line.
- **GAP G66 (illegal or unnamed edge).** The state bound asks reevaluation (L7) to know that "the newer capture's reading is still owed". That state lives in the plane ledger (L11) and extraction (L4); reevaluation's `uses` has neither. Say how reevaluation learns it from what it already uses (`text-chain`, `content`: the newer bundle exists and has no reading row), with an age cap so a leg stuck unread is not polled for ever, or name the `uses` edge to extraction for BOB to record.
- NOTE G79: `putFromParts` already exists (`record-core/index.mjs:1905`) and acquisition already has `keepFromParts` (`acquisition/index.mjs:409`, used above 32 MiB). The job extends its use to 2-4 parts and to the upload path (capture passes no `bytes` today); "builds the route" should read "uses and extends".
- NOTE G71: the earlier note stands, the job should confirm the writer accumulates `capture_text_state.words_read` for PDF pieces.
- NOTE G81: the four "another actor's change is seen on the next route" tests are green today (they keep today's behaviour); fine as characterization, say so.
- Checked and clean: merge order is `modules.json` index order (record-grammar 1, site-profiles 20, acquisition 47, capture 48, reading-pipeline 53, extraction 54, retrieval 73, calculations 74, reevaluation 103, ratification 115, scheduler 140, queue-producers 147, queue 149, interface-shell 159, screens-intake 163, screens-publish 167, control-plane 169, plane 170); calculations to csv-reader (14) is a legal new edge; every cause of a module is in its row; markers L/P/N suit each cause (G76 migration L and P, G77 L, G67/G68 L and P); no test is left that cannot fail where the plan says red.

Remaining: 1 DEFECT (G80), 1 GAP (G66), 3 NOTEs.
