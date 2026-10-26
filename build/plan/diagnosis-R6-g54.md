# Published case with no case-file manifest on biosmoke8: diagnosis (read-only)

Verdict: SPLIT. Two of the four are expected. Two are a defect (a complete edition whose case file was never built, with the failure stated nowhere a reader or the scheduler can find).

## The four, from op=publishedcase (public, GET)
| case | signed/published_at | ratified_at | complete | awaiting | manifest | verdict |
|---|---|---|---|---|---|---|
| CASE-2026-4864 | 2026-10-22T06:35:17Z | null | false | INQ-2026-0023 | null | EXPECTED: committed, member has not signed |
| CASE-2026-8024 | 2026-10-22T06:28:43Z | null | false | INQ-2026-0022 | null | EXPECTED: same |
| CASE-2026-4783 | 2026-10-21T20:06:28Z | same | TRUE | [] | null | DEFECT |
| CASE-2026-6227 | 2026-10-22T13:39:22Z | same | TRUE | [] | null | DEFECT |
The three with a manifest: 7238 (10-21 06:08), 2057 (10-21 12:41), 6644 (10-22 06:37).

The probe's "7 published" counts committed-but-incomplete editions (published_cases row exists from the case commit; findings list is empty, ratified_at null). A case file is assembled only when the edition COMPLETES (every pinned member ratified): publication/worker.mjs:161-171 (assembleCaseContainer, called only at completion), ratification/finding.mjs:330-334 `casesToAssemble` and :394-398 `editionsToAssemble` both require `cs.complete && !cs.manifest_sha`. So 4864 and 8024 have no manifest by design; they will get one when their member is ratified.

## Why 4783 and 6227 are not "expected"
- Not "before case files existed": case-file code landed 2026-10-03 (af28dfb06a, public-read T28); biosmoke8 was bootstrapped 2026-10-15 (status consumedAt). Every case here is later.
- Not a version window: failing and succeeding cases interleave in time (ok 10-21 06:08, ok 10-21 12:41, FAIL 10-21 20:06, ok 10-22 06:37, FAIL 10-22 13:39). Same signer route on all (delivered_by founder, gate plane-gate/1.0). public-read/publication case-file code unchanged between them (last touches 10-21 07:57 and 14:34 only change finding body/R41 evidence words).
- Not "an edition without held materials": the case-file builder never fails for a missing material; it lists it in `unheld` and still builds (public-read/casefile.mjs ~:100-135, buildCaseFile; only a missing finding bytes or a doc-hash mismatch returns CASE_FILE_NOT_ASSEMBLED, :53 and :69-73). I fetched both members' bundle.md by hash from biosmoke8 (`publishedbytes`, 200, 3320 and 3001 bytes), so that cause is ruled out for both.
- Not "assembled on demand later": nothing assembles on read. public-read never builds; publishedcase just returns manifest_sha:null (public-read/index.mjs:834, :1365).
- Not a different publish path: legacy (pre-/6) container branch also records a manifest (worker.mjs:395-408), so any path that runs records one.
So assembly either never ran or ran and failed, and the plane kept no record of which.

## Where the manifest is written, what decides
- Build + record: publication/worker.mjs:417-449 `assembleCaseFile` (buildCaseFile -> put files in bucket by hash -> POST do/recordcasemanifest -> put manifest bytes). Entry `assembleCaseContainer` worker.mjs:161 (casefilefacts -> assembleCaseFile; non-/6 docs fall to the legacy container).
- Persist: publication/index.mjs:2229-2255 `recordCaseManifest` (UPDATE published_cases SET manifest_sha, manifest; registers MANIFEST.json + every listed file in published_shas; same hash again = retry no-op; other hash = MANIFEST_EXISTS). Routed at publication/index.mjs:2768.
- Triggers (3): op=ratify of the last member (ratification/ops.mjs:415-416, via casesToAssemble); op=caseratify (ops.mjs:247, editionsToAssemble); the scheduled publisher (ratification/index.mjs:1018-1022, via "publishscheduled"; skipped entirely if no worker deps / bucket, :1024-1027 `after.not_done`).

## What happens when assembly fails
- Failure is only a return value: `{ok:false, reason: CASE_FILE_NOT_ASSEMBLED | MANIFEST_NOT_RECORDED | STORE_SILENT...}` (worker.mjs:429, 441-442). The act has already committed; casefile.mjs:53 says "the case edition is published ... its case file was not built". That statement goes into the answer of the act that failed (`container` in op=ratify / op=caseratify), seen once by whoever called it.
- Not persisted: no column, ledger row or log line (grep: no console/log, no `manifest_sha IS NULL` sweep anywhere in bio-plane/src).
- Scheduled publish is worse: ratification/index.mjs:1018-1022 stores the failure in `after.container` (and a throw becomes `ASSEMBLY_FAILED`), but publish-schedule/schedule.mjs:206-229 `takeOne` reads only `answer.stopped`; `after` is thrown away. The row is settled `published`, reasons null. Also :1020 overwrites `after.container` per edition, keeping only the last of several.
- Retry: only manual. Re-sending op=caseratify (or the finding's op=ratify) with the same signature re-runs assembly because the edition is complete with manifest_sha null (ratification/index.mjs:838-843 `#completedCase`, :1180; ratification/finding.mjs:330; test schedule.test.mjs:408-418). No alarm, scheduler tick or owed-work entry re-tries it (owed work/alarm exists for captures only, acquisition/index.mjs:31, 394, 2077).

## What a reader sees for 4783 / 6227
- op=publishedcase: ok:true, complete:true, awaiting [], manifest_sha:null, manifest:null, files [], verification.container:null and manifest:null (publication/worker.mjs:819-820). No word that the case file is missing or why. Identical to the incomplete editions except for `complete`.
- Public page (screens-publish/published.mjs:164-166): the "download the case file" button is simply not drawn (only drawn when manifest_sha is 64 hex); "Check the signature" is drawn with an empty sha and answers "This edition carries nothing to check." (rows.mjs:3375, published.mjs:230). No explanation, no link to anything.
- Zip / bytes routes: unreachable by a reader, because there is no hash to ask for; asking `format=zip` on any other hash is NOT_A_CONTAINER/400 (worker.mjs:538-544). A reader holding the member's hash can still fetch the finding bytes (I did), so the findings verify; only the case file (case document + signature + materials + manifest) is missing.
- Checker: case-checker works from a manifest (check.mjs:733 `manifest_sha: str(...)`; null for such a case), so a case cited from one of these cannot be checked against its case file.

## Verdict
Defect, 4783 and 6227. Root cause of why assembly did not complete on these two specific cases cannot be proven read-only (no worker log, no scheduled_editions row, no way to see the act's answer). Provable defects in the code, in the order they bite:
1. D1 No durable statement. A complete edition with manifest_sha null is indistinguishable from a healthy one to every reader and to the operator (worker.mjs:429-449; public-read/index.mjs:834). Owner: publication (store column/state) + public-read (R23/R24 reader statement) + screens-publish (button/message).
2. D2 Scheduled path drops the failure (publish-schedule/schedule.mjs:206-229 vs ratification/index.mjs:1018-1022). Owner: publish-schedule (settle with the container outcome) with ratification.
3. D3 No automatic retry/sweep for complete-without-manifest. Owner: scheduler/ratification (an idempotent re-run of `#completedCase` assembly; recordCaseManifest is already idempotent by hash).
4. D4 :1020 keeps only the last edition's container in `after`.
The interleaving (ok, ok, fail, ok, fail) with identical inputs points to the scheduled or sitting path hitting a transient (store silence on casefilefacts/recordcasemanifest, bucket put) rather than data, which is exactly the case D1-D3 hide. Confirming needs the instance's worker log for 2026-10-21T20:06Z and 10-22T13:39Z, or one write (re-send op=caseratify), neither done.

## Can a member reach it today? Yes
Any member/founder who completes an edition (last member's op=ratify, op=caseratify, or the scheduled publish) and meets one transient failure gets a published, complete case with no case file, no notice, and no retry. Their own case page shows the same silent absence. Workaround: re-send the same-signature op=caseratify (writes; not done here).

## Failing-first tests (modules/tests to add)
1. ratification/schedule.test.mjs (next to :408): scheduled publish with `assembleCaseContainer` stubbed to return `{ok:false, reason:"CASE_FILE_NOT_ASSEMBLED"}`. Assert the scheduled_editions outcome (or the case's published record) states the unbuilt case file. Fails today: takeOne ignores `after`.
2. publication test: a complete edition with manifest_sha null; `publishedcase` (public-read) answers `verification.case_file = {built:false, reason}`/a stated reason, and a screens-publish test asserts the page names the missing case file instead of omitting the button. Fails today: both silent.
3. scheduler/ratification test: tick with a complete edition and manifest_sha null re-runs assembly once and a second tick does nothing (recordCaseManifest same-hash returns existed). Fails today: nothing re-runs it.
4. ratification test: two editions to assemble in one act keep both outcomes (D4).

**Reproduction** (K4701): attempted at the builder's shape on the five editions' real bytes, recorded in `diagnosis-R6-g54-cause.md` section 2 (all five build `ok`); the failing step is therefore not the data, and G54's step 0 reproduces the candidates in Miniflare with the deploy's logging naming the cause.
