# G47 platform check L: the whole chain at and over CASE_DOCUMENT_BYTES_MAX (measured, nothing committed)

Tip measured: `origin/tranche/T51` at 319ed673e1 (scratch worktree `/home/user/g47-wt`, node_modules symlinked, removed after). Bound `CASE_DOCUMENT_BYTES_MAX` = 1,572,864 B (read from publication's exports). Node v26.10.0, Miniflare/workerd from `bio-plane/node_modules`. One process at a time.

## Method
Case built exactly as case-authoring's R17 test does (`test/m/case-authoring/document.test.mjs`:214-267): `world()` of `test/m/case-authoring/fixture.mjs` (all modules real), 501 `content`+`inquiry_basis` rows = 501 captures of one source (DOC) under supporting Q1, load-bearing Q2 on the same DOC, driven through the real act `w.publish` (real `materialRows`, real `caseDocumentFormatFor`, so `/9` with attestation `sha`). The R17 case alone is 1,220,403 B; to reach the bound the same act also carries N `excluded` entries of ~1.5 KB (the pattern of `g47-refusal.test.mjs` (d)), each costing ~4.73 KB of document. N=73 gives **1,565,495 B = 99.5 % of the bound**. 1.2x = 1,887,496 B. The act refuses that size, so the 1.2x text is made by taking the stored at-bound document, padding its tail with comment lines and UPDATEing `case_documents` (bypassing the store, as the publication job's own 1.2x measure had to); the doc_sha is recomputed so every reader sees a consistent row.

Two harnesses, both scratch (in `/tmp/claude-0/-home-user/589324c9-39f3-5dc8-8783-b80620e56495/scratchpad/`):
1. Capped child: `g47L-child.mjs` + `run.sh` + `summarize.mjs`. `node --import bio-plane/test/platform-sqlite.mjs --expose-gc --max-old-space-size=<cap> --trace-gc`. node:sqlite under the platform's value-limit preload (2,098,176 B per bound value). Per step: gc before, ok/error, heap peak = largest pre-GC heap printed by `--trace-gc` inside the step window, heap/rss after, process max rss. Caps swept 128/112/96/80/64.
2. Miniflare real Durable Object SQLite: `mf/entry.mjs` (bundled by esbuild into `mf/bundle.mjs`, 22 MB) + `mf/fixture-do.mjs` (copy of the case-authoring fixture whose `storage()` is replaced by the DO's `ctx.storage.sql`/`transactionSync`) + `mf/mfrun.mjs`. The same world, same 501-capture case and same steps run INSIDE a workerd `useSQLite` Durable Object, so every statement the modules issue (the `case_documents` INSERT, `published_cases`, `published_shas`, `case_checks`, ...) is judged by the platform's real SQLite, not the preload. Control: a raw 2,098,176 B bind passes and 2,252,800 B is refused in that object (the known limit, so the real limit was live).

Step entry points (module level, the same code the ops call; the door's JSON/HTTP layer is not in the loop):
- act: `caseAuthoring.publishCase` via the fixture's `w.publish` (two renders + `storeCaseDocument`).
- casedocument: `publication.caseDocument(case, edition, viewer)`. casedocfacts: `publication.caseDocumentFacts`.
- caseratify parse: `ratification.caseGate` (parses the stored document and runs the case gate); caseratify signing: the fixture's `w.ratify` = `publication.commitCaseEdition` over the document's `doc_sha` with a fixture signature string (the real op verifies an SSH signature over the 32-byte hash, cost independent of document size).
- case-check: `caseCheckOf(...).checkAndHold` (pre-flight + a rolled-back dry run + the real act: three builds), run on a fresh world (mode check, ratification pre-flight stood in "ready" as case-check's own real.test does), then `caseCheckOf` read.
- public page: `publicReadOf(...).publishedCase` (docket stood in empty). publishedbytes: `verifySha` + `publishedCaseDocumentText` + SHA-256 re-hash (the `publishedRoutes` logic, `publication/worker.mjs:465-510`).

## Per-step table, capped child at --max-old-space-size=128 (heap peak = pre-GC maximum in the step; the fixture world itself holds ~54 MB of heap before each step)
At the bound (doc 1,565,495 B):

| step | answer | ms | heap peak MB | rss MB (max) |
|---|---|---|---|---|
| act (two renders + storeCaseDocument) | ok | 630 | 100.3 | 300 |
| casedocument | ok, 1,565,495 B, sha matches | 243 | 95.8 | 299 |
| casedocfacts | ok | 180 | 98.5 | 302 |
| caseratify gate (parse) | ok, refusals [] | 212 | 98.5 | 302 |
| caseratify commit (sign) | ok | 167 | 107.8 | 309 |
| public page | ok, answer 2,119,751 B | 191 | 101.7 | 311 |
| publishedbytes | ok, re-hash equals | 110 | 101.7 | 311 |
| case-check (checkAndHold) | ok, held | 1586 | 115.7 | 323 |
| caseCheckOf read | ok, state held | 129 | 100 | 323 |

At 1.2x the bound (1,887,496 B, store bypassed), cap 128: all steps ok; heap peaks act 100.1, casedocument 107.3, casedocfacts 109.7, gate 109.7, **commit 122.2**, public page 115 (answer 2,445,778 B), publishedbytes 111.6; max rss 302 MB.
Reference, the R17 case alone (1,220,403 B, 0.78x): all ok, peaks 94-103 MB.

Cap sweep (exit 0 = whole chain answered; 134 = V8 heap death):

| cap | at bound (act+chain) | at bound, case-check | at 1.2x |
|---|---|---|---|
| 128 | ok | ok | ok (peak 122 MB at commit) |
| 112 | ok | ok | ok |
| 96 | ok | ok | ok |
| 80 | ok | ok | dies, in `caseratify commit` |
| 64 | dies, in the act | dies, in case-check | dies, in the act |
Margin: at the bound the chain survives down to 80 MB (1.6x below the 128 MB cap), 1.2x down to 96 MB (1.33x); the fixture's 54 MB world is included in all of these, so the document's own share is smaller.

## Miniflare real DO SQLite (same steps inside workerd)
| case | result |
|---|---|
| at the bound, 1,565,495 B | act ok (row stored, `max(length(text))` = 1,565,495), casedocument ok (sha matches), casedocfacts ok, gate ok, commit ok, public page ok (2,119,751 chars), publishedbytes ok (re-hash true) |
| 1.2x, 1,887,496 B (UPDATE in the real SQLite) | the row is accepted (under the platform's 2,098,176 B); casedocument, casedocfacts, gate, commit, public page (2,445,778 chars), publishedbytes all ok |
| case-check at the bound | `checkAndHold` ok (held, a `case_checks` row written), `caseCheckOf` ok |
| reference 1,220,403 B | all ok |
| control, raw binds | 1,572,864 / 1,887,496 / 2,098,176 B accepted, 2,252,800 B refused (limit is live) |

## Over the bound: the act refuses, nothing written
- Capped child (cap 128) and Miniflare both: 1,598,591 B (N=80) and 3,111,855 B (N=400, above the platform's value limit, which would have thrown "string or blob too big" at the INSERT without the bound):
  `{ok:false, reason:"CASE_DOCUMENT_TOO_LARGE", code:"CASE_DOCUMENT_TOO_LARGE", check:"C-136.9", size, bound:1572864, materials:502, members:2}`, nothing thrown. A snapshot of every table before and after the act is byte-equal (`snapshotEqual: true`), `case_documents` has 0 rows (so no reevaluation, no acknowledgement, no row anywhere).

## Findings
1. No step fails under the bound. Every step answers, at the bound and at 1.2x, in the capped child and in the real DO SQLite, and the stored row is accepted by the real SQLite at both sizes. No error text to quote.
2. Observation (not a failure): the **public page answer is 2,119,751 B at the bound and 2,445,778 B at 1.2x**, above the platform's 2,098,176 B single-value limit (the answer is 1.35x the document, as the attestation/material lines are expanded). It is an answer, never bound into SQL in this chain, so nothing broke; but any future consumer that stores or binds the whole page (a cache, a manifest column) would hit SQLITE_TOOBIG at the bound. Worth a line in the record.
3. Heap is the tight resource, not the SQLite value: at 1.2x the commit peaked at 122 MB under a 128 MB cap (including the ~54 MB the test world holds), and 80 MB kills it. The bound at 1.5 MiB has about 1.3-1.6x of memory margin in this harness, not more.
4. The `/9` document at k=501 is the R17 case: 1,220,403 B (the published size `docBytes` of K4676's ~1.24-1.28 MB); the 1.5 MiB bound sits 1.29x above it.

## Not covered (stated, so no one reads more into this than was measured)
- The HTTP door layers (JSON stringify of answers across `stub.fetch`, worker response size) and the `caseratify` op's post-commit steps (`assembleCaseContainer`, material copies, bucket writes, `ops.mjs:236-256`): not in the plan's list; not driven.
- Signature check is the fixture's string, not a real SSH signature (cost independent of size).
- The 1.2x document was made by bypassing the store (the act refuses it); it is the real-shape text (501 captures plus padding), padding is comment lines at the tail.
- Heap peaks are `--trace-gc` pre-GC maxima, so a peak between two GCs is bounded by the next GC line, not read exactly; the cap sweep is the decisive number.
