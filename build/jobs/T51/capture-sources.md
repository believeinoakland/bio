# capture-sources (T51)

**Status** · session_016XY41FauSzZ6Ec9JTB5R7K · depth 2 · WORKING · handled B2

## J1 · REPORT

Completion record, capture-sources in T51 (words, T51-181). Code commit b6aaa8fb43 on job/T51/capture-sources (tranche/T51 merged in, never rebased).

Entries applied
- Words-pass findings (build/plan/words-pass/capture-sources.md), all fixed by the words rule:
  - Plain findings (K3957): each member-facing sentence read through localize('capture-sources.<stem>.<slug>', en, vars). These are refusal details (credentials.mjs, memento.mjs, cdx.mjs), RENDER_BLOCKED_REASONS (browserrender.mjs) and evidence/detail sentences. Nothing judged developer-only, so no string is listed as unkeyed.
  - Inline findings: the sentence fragments passed as variables (drive.mjs:245, render.mjs:472, :475, :476) now each a localize call with vars; render.mjs:151 and :477 read word('render.unstated_number') and word('render.renderer_report_wait').
  - Test copies (K3962): each copied sentence compared with localize(id, en, vars) (same id and en as the product call), or word(key, vars) where a words.json row exists (dec149 R46 basis sentences, R12, render.test lengths and cap/budget reasons). A test never holds a sentence's text any more.
- Beyond the check (setup-words R13 binds every member-read sentence): render.mjs settled and quiet-window reasons, the undetermined requests/scripts sentences, the scripts-executed authority reason, the not-sniffed evidence line, cdx's 'no digest', 'digest is the empty-body digest', 'the CDX record carried no urlkey', credentials' 'no secret was given', the no-host and no-key reasons, and memento's two Link header details. Converted to localize with the same en.
- Left as they are, per BOB's ruling on built-in error constructors (dev text): every `new Error(...)` message in browserrender.mjs and drive.mjs. Identifiers (codes, op names, the CDX_ and MEMENTO_ reason codes) are unchanged.

Deferred: none.

Found in another module: none in this module's files. The whole-product run of checks/run.mjs reports 4078 words failures in other modules (for example wizard-scripts t48.test.mjs, observation-log vocabulary.mjs:1367), and 30 coverage failures; none is capture-sources. Those belong to their own jobs; reporting them here so BOB can see the run is not clean outside this module.

Tests and checks (final run on b6aaa8fb43)
- node --test test/m/capture-sources/*.test.mjs (bio-plane): tests 96, pass 96, fail 0.
- checks/words.mjs /home/user/bio capture-sources: 0 failures (inline 0, plain 0, testcopy 0, missingkey 0, marker 0).
- checks/format.mjs: 175 modules, 174 requirements files, 0 failures.
- checks/architecture.mjs capture-sources: 23 product files, 0 failures.
- checks/coverage.mjs capture-sources: 65 of 65 live requirement ids named by a test, 0 failures.
- checks/ownership.mjs /home/user/bio capture-sources tranche/T51 job/T51/capture-sources: 14 files changed by capture-sources, 0 failures.
- checks/run.mjs /home/user/bio: format 0, architecture 0, words shows no finding in capture-sources; the remaining findings are other modules' (see above).
- node bio-plane/src/setup-words/build.mjs --check: the rows.mjs stale-rows note is expected (BOB regenerates at the layer close); no refusal naming capture-sources.

Commit note: the commit message carries no model identifier, following the process rule for pushed artifacts; no Co-Authored-By model line.

Size (session_015AzGmWcjbqBcwr292qPePs): test runs 3, module lines 2664

## J2 · COMPLETE

capture-sources (T51-181) complete on b6aaa8fb43: the words findings are fixed by key and the module's tests, checks and ownership pass. Details are in J1.

## J3 · QUESTION

R67's test uses test-support's declaredOpHolds (BOB's START names it), but capture-sources' modules.json uses does not list test-support, so checks/architecture.mjs capture-sources fails: 'imports bio-plane/test/declared-ops.mjs of test-support, which capture-sources does not declare in uses' (1 failure; everything else green: tests 110/110, coverage 67/67, words 0, format 0, ownership 0). modules.json is yours (ownership). Best reading: add "test-support" to capture-sources' uses (it is already ordered before it). Code is pushed on db9afe06a7 (R66, R67, ops.mjs with captureSourcesOps and DECLARED_OPS, tests). I carry on with my record meanwhile; I will merge tranche/T51 and COMPLETE once the edge is there.

## J4 · COMPLETE

Fix round 3, C13 (P5), my part: the browser render. Requirements met: capture-sources R68 (new) and R25 (amended timing); R20 held, R49 (null for a phase not reached).

**Built** (`bio-plane/src/browserrender.mjs`): a body collector takes each completed load's body as its `Network.loadingFinished` arrives, `BODY_CONCURRENCY` (6, exported) at a time, so bodies are collected during the load. `collectBodies` (still exported for tests) is a wrapper over it. At the end of the wait and the document taken, `finish` offers the unseen entries (redirect hops, ids missing) and waits for the outstanding bodies to the least of `BODY_PHASE_MS` (10,000 ms) and the render's `navMs + timeoutMs`; an outstanding body or an unstarted one is `body_unavailable` with R25's sentence (the render's reserved bound, or the 10,000 ms bound), and a late result is ignored, never filled. The count and byte ceilings are held in the order the loads completed (a slot reserved per body in flight). Each fetch call is bounded by what remains of the render's bound.

**The field that carries the phase times (named here, as the RC asks):** `phases_ms: {session, load, quiet, bodies}` on the answer, whole milliseconds. session = start to the navigation sent; load = navigation to the load event (or to the end of the wait when it never fired); quiet = load event to the end of the wait, `null` when the load event never fired; bodies = what the render waited for bodies after taking the document (0 with no sub-resources). A failed render answers `{ok: false, error}` only, as before. Documented in `render.mjs`'s RENDER_ANSWER comment (one line). `render.mjs` ignores the field today: it is not on the record. If BOB wants it recorded on the capture's `render` block or on `timings`, that is a requirement for BOB to write (acquisition/capture side).

**Tests** (`bio-plane/test/m/capture-sources/browserrender.test.mjs`), seen failing first on the old source, then green: R68 (20 bodies of 1 s each: all kept, concurrency between 2 and 6, first body asked for before the document is taken, body phase under half the sum, four whole-ms phases, render inside its bound); R68 (hung bodies at the cap are `body_unavailable` with the sentence, finished ones kept, quiet `null` when load never fired); R68 control (no sub-resources: four phases, bodies 0, document, requests, wait unchanged; the 400-body ceiling still holds). R19's answer-shape list gained `phases_ms`. R25's old test of the time bounds assumed one-after-another collection (a clock jump per body); I rewrote it for the amended R25: a hung body at the 10,000 ms bound and at the reserved bound, the finished bodies kept. Nothing skipped or weakened; the sentences are asserted by key through `word`.

**Not done / for BOB.** The 504s in the re-walk also come from the host governor's double booking (P4b: host-governor peek R29, acquisition R97) and the 3 s attest wait (P4a), which are other jobs'; this change cuts the body phase (up to 10 s sequential → about the slowest few) and bounds it to the door, but the page's own load and quiet wait (up to 15 s) remain. No early answer, per K4360. No stand-in words and no new member-facing sentences; no census op of mine changed (the ops file is untouched).

**Ran.** `node --test --test-force-exit bio-plane/test/m/capture-sources/`: tests 113, pass 113, fail 0. `bio-plane/test/m/acquisition/` (the user of capture-sources): tests 185, pass 185. impact.mjs names 113 modules (the plane's whole closure); I ran the direct user, not all 1,645 files. checks/run.mjs: architecture 0 failures; words 0; coverage shows no finding in capture-sources; format 1 failure, `build/rulings.md:4346` (K4349 lacks a standing-list decision), on the tranche tip and not mine. ownership: 1 file changed by capture-sources... see the run: 0 failures (files: browserrender.mjs, render.mjs, the test).
Merge: `tranche/T51` already merged, no provider named for this cause.

Size (session_016XY41FauSzZ6Ec9JTB5R7K): test runs 8, module lines 2664
