# capture-sources (T51)

**Status** · session_01VkPqfYMY5TAWWZDzvyfhZm · depth 2 · WAITING ON BOB (J3) · handled B2

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
