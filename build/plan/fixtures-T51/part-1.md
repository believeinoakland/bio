# Fixture round, part 1 (T51): slice fx-part-1.txt, 362 findings read, FIX-E 74, FIX-L 149, FALSE 129, CODE 10 (sum 362); by check class: answer 163, stub 184, code 15

Path shorthand: `bp/m/` = bio-plane/test/m/, `bp/t/` = bio-plane/test/. A line number followed by `a`, `s` or `c` marks the check class (answer, stub, code) where one line carries two findings in different groups; `xN` marks N findings of one class on that line. Marker note: a `fixtures-contract` marker covers its own line and the 8 lines below, so each FIX-L site needs one within that span; one id may cover many sites; the provider needs one `fixtures-run: <user> <id>` per user module.

## Providers
### office-readers (module 15)
- FIX-E fixture `cellsInRefusal`: `xlsxEntry.cellsIn(partsOrBytes, {sheet, ...})` on a generated workbook (test-support sheetgen) for a sheet it cannot give: the real `{ok:false, reason|why}` (no_such_sheet, invalid_argument). Users and findings: file-safety 1, reading-pipeline 1 (total 2); re-point: mechanical 0, judgment 2.
### pdf-pixels (module 28)
- FIX-E fixture `pixelRefusal`: `pixelRefusal(reason)` = the real refusal answer of `renderPageToPixels` over an input that provokes it: NOT_A_PDF (bytes that are no PDF), PAGE_HAS_TEXT_LAYER, MULTIPLE_IMAGES_ON_PAGE, UNSUPPORTED_FILTER, PIXELS_UNDETERMINED (turn asked, orientation undeterminable); IMAGE_TOO_LARGE with `bound_name` PICTURE_FRAME_MAX from `renderPictureToPixels` over an over-frame picture. Users and findings: ocr-worker 7 (total 7); re-point: mechanical 6, judgment 1.
- FIX-E fixture `renderedPage`: `renderPageToPixels(bytes, page, opts)` (and `renderPictureToPixels(bytes, 0, {maxEdge, grey, prepare})`) over a tiny generated PDF or picture (test-support make-pdf, imggen), returning its real `{ok:true, route, mediaType, bytes, width, height, upright, rotate_deg, pixels_sha256, page_geometry}`. Users and findings: ocr-worker 1 (total 1); re-point: mechanical 0, judgment 1.
### pdf-worker (module 31)
- FIX-E fixture `tier2Answer`: the worker's real tier-2 answer `{ok:true, tier:2, text:{document,pages,undetermined,counts}, ...}` for the committed mixed legistar PDF, produced when the test runs (replaces `tier2-recorded.json`, a stored copy). Users and findings: reading-pipeline 1 (total 1); re-point: mechanical 0, judgment 1.
### ocr-worker (module 32)
- FIX-E fixture `memberWorker`: `ocrWorkerDef()` (the real member in a worker) plus the provider's named deviations applied to its real answers: throw on a page, refuse (PAGE_NOT_RENDERABLE), engine version change, stray page; log of the page lists asked. Users and findings: reading-pipeline 2 (total 2); re-point: mechanical 0, judgment 2.
- FIX-E fixture `pageNotRenderable`: the real member handler's 200 `{ok:false, reason:'PAGE_NOT_RENDERABLE', page, deferred, notes, refusal:{render:{reason, detail}}}` over bytes the real renderer refuses (parameter `renderReason`). Users and findings: reading-pipeline 4 (total 4); re-point: mechanical 0, judgment 4.
### file-scanner (module 34)
- FIX-E fixture `reputationRefresh`: the real reputation provider's refresh answer `{ok:false, list_version, fetched_at, error}` for a list with a bad checksum (LIST_CHECKSUM_MISMATCH:THREAT) and an unreadable list (LIST_UNREADABLE), run over a scripted list fetch. Users and findings: file-safety 2 (total 2); re-point: mechanical 0, judgment 2.
### member-roster (module 35)
- FIX-E fixture `listenerRefusals`: `listenerRefusal(held, module, fn)` (member-roster, re-exported by membership; through `registerPasswordSetter` twice and with a non-function): LISTENER_MALFORMED and LISTENER_DECLARED, whole answers with check and translation. Users and findings: credentials 2 (total 2); re-point: mechanical 0, judgment 2.
### record-core (module 36)
- FIX-E fixture `coreOver`: `recordOf(ctx, ...)` migrated over the test's SQLite with `bundles` rows, exposing `bundleInfo`, `declarePurge`, `declareTable` as record-core answers them (TABLE_DECLARED naming the holder, TABLE_CLASS_MISSING, TABLE_CLASS_UNKNOWN); replaces the duplicated `stubCore(db)`. Users and findings: ai-accounts 5, credentials 5 (total 10); re-point: mechanical 8, judgment 2.
- FIX-E fixture `evidencePartsRefusal`: `evidenceStore().putFromParts(digest, parts)` on a record-core whose evidence bucket refuses the whole object: EVIDENCE_STORE_REFUSED (C-102.39), plus a variant that throws. Users and findings: capture 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `tableDeclarationRefusals`: `tableDeclarationRefusals(table, {by})`: the real `declarePurge` / `declareTable` called twice for one table (TABLE_DECLARED with `declaredBy`), with an invalid name (TABLE_NAME_INVALID) and with an unknown class value (TABLE_CLASS_UNKNOWN). Users and findings: project-roster 1, ai-accounts 3, credentials 2, doorbell 2 (total 8); re-point: mechanical 8, judgment 0.
### membership (module 37)
- FIX-E fixture `projectActRefusals`: the real membership (`membershipOf(ctx, {record})`) with a project, owner and participants set through its own acts: `projectAuthority(p, identity, need, act)` -> PROJECT_ACT_NOT_A_PARTICIPANT; `visibilitySettingRefusal(v)` -> PROJECT_VISIBILITY_UNKNOWN_SETTING; also the whole `makeMembership` double of promotion's fixtures.mjs. Users and findings: promotion 2 (total 2); re-point: mechanical 0, judgment 2.
### project-roster (module 38)
- FIX-L contract `project-guard` (marker `// fixtures-contract: project-roster project-guard` in each user; no fixture): the guard's refusal of an act: `{ok:false, reason:'PROJECT_SCOPE_OWN', code, check, detail, ...}` relayed unchanged by membership. Provider test: project-roster's test makes the refusal with its real guard (invite on the sole owner's own scope) and compares it with the literal. Users and findings: membership 1 (total 1).
### ai-accounts (module 39)
- FIX-E fixture `accountForRefused`: `accountFor({member, act})` of the real ai-accounts for a member with no account: the whole NO_ACCOUNT refusal with check C-29.1 and translation. Users and findings: reading-pipeline 4 (total 4); re-point: mechanical 4, judgment 0.
- FIX-E fixture `accountForResult`: `accountFor({member, act})` of the real ai-accounts for a member with an account set through `accountReferenceSet`: `{ok:true, level, key}`. Users and findings: reading-pipeline 1 (total 1); re-point: mechanical 0, judgment 1.
### provenance (module 43)
- FIX-E fixture `captureGradeAs`: a provenance whose real receipts earn the stated `captureGrade` (direct, archive.org, unpacked, capture-request vias); replaces `{homeOf, captureGrade: () => gradeAs}`. Users and findings: sources 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `heldParts`: `heldParts(wholeSha, parts)`: the real `partsOf(sha)` of a multi-part capture registered through the real register path; `null` for an unregistered digest. Users and findings: acquisition 2 (total 2); re-point: mechanical 0, judgment 2.
- FIX-E fixture `holdsOf`: `holdsOf({registered, acquired, bundle})`: the real `registerHolds({sha})` answer `{ok, sha, asked, registered, acquired}` of a provenance whose register/receipts stand in the stated state (made by registering/recording through the real acts). Users and findings: capture 10 (total 10); re-point: mechanical 0, judgment 10.
- FIX-E fixture `homeOf`: `homeOf(captureSha)` of a capture registered in a bundle through the real register acts: `{bundleId, path, encoding, bytes, registered, authored}` or null. Users and findings: doorbell 2 (total 2); re-point: mechanical 2, judgment 0.
- FIX-E fixture `provenanceOver`: `provenanceOf(ctx, {record, membership, now})` migrated over the user's record-core (as sources/fixture.mjs already does): `recordReceipt`, `registerHolds`, `homeOf`, `capturesOf`, `captureGrade`, `receiptsOfCapture`, `signReceipt` as provenance answers them. Users and findings: acquisition 4 (total 4); re-point: mechanical 0, judgment 4.
### capture-sources (module 46)
- FIX-E fixture `renderFailure`: `renderFailure({class, elapsed_ms})`: the failed render answer `{ok:false, error, elapsed_ms, failure_class}` made by the real `renderWithBinding` / `browserBindingRenderer` over capture-sources' own fake binding (no session free = permanent, open bound / session refused = transient); the success answer (`OK()`) can come from the same fixture. Users and findings: acquisition 8 (total 8); re-point: mechanical 2, judgment 6.
### ai-use (module 88)
- FIX-L contract `use-check` (marker `// fixtures-contract: ai-use use-check` in each user; no fixture): `useCheck({owner, member, use, at})` -> `{ok:false, code:'AI_LIMIT_REACHED', detail}` (check/translation) while a limit is spent; null otherwise. Provider test: ai-use's test spends a limit and compares the real useCheck answer with the literal. Users and findings: reading-pipeline 1 (total 1).
### answer-envelope (module 155)
- FIX-L contract `relay-helpers` (marker `// fixtures-contract: answer-envelope relay-helpers` in each user; no fixture): `storeSilent(op, correlation)` -> 502 `{ok:false, reason:'STORE_DID_NOT_ANSWER', code, op, detail, correlation?}` with its check and translation; `storeRefusal`; the UNKNOWN_OP row `{reason, code, error, translation}` as the relay carries it; `doAnswer` reading `{ok, result}`. Provider test: answer-envelope's test builds each value with its real storeSilent/storeRefusal/doAnswer and compares it with the user's literal. Users and findings: host-governor 1, capture 9, doorbell 9 (total 19).
### store-door (module 156)
- FIX-L contract `store-envelope` (marker `// fixtures-contract: store-door store-envelope` in each user; no fixture): the store's own replies behind a relay: 400 `{ok:false, reason:'BAD_JSON', error}`, 404 `{ok:false, error:'unknown op: <op>'}`, 500 `{ok:false, error:<stack>}` (never relayed), STORE_INTERNAL_ERROR with and without a UUID correlation, `{ok:true, result}` from a route. Provider test: store-door's dispatch test produces each reply from its real dispatch and compares it with the hand-built body. Users and findings: host-governor 7, capture 7, doorbell 6 (total 20).
### control-plane (module 169)
- FIX-L contract `deliver-owed` (marker `// fixtures-contract: control-plane deliver-owed` in each user; no fixture): `deliverOwedRender({ctx, env, storeName, answer, session})` -> `{ok:true, bundleId, reading_pending?}` or `{ok:false, reason}`: DELIVERY_FAILED (throw caught), and promotion's CAPTURE_HELD_BY_ANOTHER_BUNDLE relayed with kind, capture_sha, holder. Provider test: control-plane's test runs deliverOwedRender for each hand-built answer (a delivery that completes, one that throws, one promotion refuses as held). Users and findings: acquisition 35 (total 35).
### plane (module 170)
- FIX-L contract `job-registrar` (marker `// fixtures-contract: plane job-registrar` in each user; no fixture): `registerJob(e)` -> `{ok:true, existed, state}` or `{ok:false, reason}` (JOB_ENTRY_INVALID, JOB_KIND_UNKNOWN, JOB_SESSION_MISSING, JOB_SHA_INVALID, JOB_NOT_KEPT), idempotent on (sha or session, kind); `armJobs()` resolves; the shared `jobRegistrarStub` of test-support (its value is the contract). Provider test: plane's test (pending.registerJob and armJobs over a real pending table) runs every case of the stub and every hand-built value, with one `// fixtures-run: <user> job-registrar` per user; refusal values using the invented JOB_TABLE_FULL / NO_ROOM become JOB_NOT_KEPT (see CODE). Users and findings: test-support 4, acquisition 10, capture 10, doorbell 4, file-safety 3 (total 31).
- FIX-L contract `keep-later` (marker `// fixtures-contract: plane keep-later` in each user; no fixture): `keepLater({sha, parts})` -> `{ok:true}` (a `keep` job row); the entry handed in is `{sha, parts}`. Provider test: plane's test runs keepLater on a real pending table and shows the row. Users and findings: acquisition 7, capture 2 (total 9).
- FIX-L contract `owed-ledger` (marker `// fixtures-contract: plane owed-ledger` in each user; no fixture): `owedLater(entry)` -> `{ok:true}` with entries keyed by session (`subresources`, `fetch`, a pending render) or sha (`unpack`), re-registration re-arms; refusal `{ok:false, reason:'PENDING_MALFORMED'}` for a kind it does not take. Provider test: plane's test runs these entries and the PENDING_MALFORMED case against pending.owedLater. Users and findings: acquisition 33 (total 33).

Fixture file: `fixtures.mjs` in the provider's test directory, following the promotion and screens-inquiry pattern (`bio-plane/test/m/<module>/fixtures.mjs`, imported as `../<module>/fixtures.mjs`); for providers whose tests live elsewhere (pdf-pixels and pdf-worker: `pdf-worker/test/`; ocr-worker: `ocr-worker/test/`; file-scanner: `file-scanner/test/`; office-readers, capture-sources: `bio-plane/test/m/<module>/`) the provider job uses the path under its `tests` entry in modules.json. Each fixture runs the provider's real code when the test runs and is itself checked by a test of the provider.

## Users
### test-support (module 6, 18 findings)
- FIX-L plane/job-registrar: bp/t/job-registrar-stub.mjs:23,35,38,56
- FALSE GENERATOR-VOCAB: bp/t/imggen.mjs:419
- FALSE HARNESS-OWN: bp/m/test-support/declared-ops.test.mjs:21,36,47,50,57,63,92,106,126; bp/m/test-support/test-support.test.mjs:247,253,255; bp/t/platform-sqlite.mjs:42
### signatures (module 8, 1 findings)
- FALSE NAME-CLASH: bp/m/signatures/signatures.test.mjs:819
### bundler (module 9, 7 findings)
- FALSE PLATFORM-DOUBLE: bp/m/bundler/g54-observability.test.mjs:20; bp/m/bundler/g83-g84.test.mjs:23; bp/m/bundler/release.test.mjs:248,1163,2067; bp/m/bundler/repo.mjs:278x2
### ooxml (module 13, 1 findings)
- FALSE NAME-CLASH: bp/m/ooxml/ooxml.test.mjs:750
### odf-reader (module 16, 1 findings)
- FALSE EXPECTED-VALUE: bp/m/odf-reader/entries.test.mjs:161
### pdf-reader (module 17, 1 findings)
- FALSE BAD-INPUT: bp/m/pdf-reader/pagesource.test.mjs:177
### format-registry (module 18, 1 findings)
- FALSE EXPECTED-VALUE: bp/m/format-registry/pictures.test.mjs:139
### docprofile (module 21, 13 findings)
- FALSE SYNTHETIC-PLUGIN: docprofile/test/docprofile.test.mjs:19x3; docprofile/test/g48-readings.mjs:6x3; docprofile/test/memory.test.mjs:12x2; docprofile/test/reading-position.test.mjs:17x2; docprofile/test/stubs.mjs:28,86,126
### doc-clean (module 30, 1 findings)
- FALSE NAME-CLASH: bp/m/doc-clean/clean.test.mjs:21
### pdf-worker (module 31, 2 findings)
- FALSE EXPECTED-VALUE: pdf-worker/test/structure.test.mjs:303
- FALSE HARNESS-OWN: pdf-worker/test/table-recognition-worker.mjs:30
### ocr-worker (module 32, 10 findings)
- FIX-E pdf-pixels/pixelRefusal: ocr-worker/test/ocr-worker.test.mjs:407 (judgment)
- FIX-E pdf-pixels/pixelRefusal: ocr-worker/test/ocr-worker.test.mjs:399,678,699,705,982,1164 (mechanical)
- FIX-E pdf-pixels/renderedPage: ocr-worker/test/ocr-worker.test.mjs:219 (judgment)
- FALSE OWN-ENGINE: ocr-worker/test/ocr-worker.test.mjs:205,466
### member-roster (module 35, 3 findings)
- FALSE BAD-INPUT: bp/m/member-roster/t19-enrol-boot.test.mjs:40; bp/m/member-roster/t47-check-tables.test.mjs:89; bp/m/member-roster/t9-notice-bounds.test.mjs:184
### record-core (module 36, 3 findings)
- FALSE OWN-SEAM-CALLBACK: bp/m/record-core/record-core.test.mjs:777; bp/m/record-core/t33.test.mjs:590; bp/m/record-core/t35.test.mjs:94
### membership (module 37, 7 findings)
- FIX-L project-roster/project-guard: bp/m/membership/t45-project-guard.test.mjs:51
- FALSE BAD-INPUT: bp/m/membership/t19-enrol-boot.test.mjs:39; bp/m/membership/t45-project-guard.test.mjs:124,125; bp/m/membership/t47-check-tables.test.mjs:86
- FALSE OWN-SEAM-CALLBACK: bp/m/membership/t45-project-guard.test.mjs:83,176
### project-roster (module 38, 1 findings)
- FIX-E record-core/tableDeclarationRefusals: bp/m/project-roster/figures-purge.test.mjs:149 (mechanical)
### ai-accounts (module 39, 16 findings)
- FIX-E record-core/coreOver: bp/m/ai-accounts/fixture.mjs:33 (judgment)
- FIX-E record-core/coreOver: bp/m/ai-accounts/fixture.mjs:44,51,53,54 (mechanical)
- FIX-E record-core/tableDeclarationRefusals: bp/m/ai-accounts/seam.test.mjs:68,71; bp/m/ai-accounts/seams.test.mjs:340 (mechanical)
- FALSE EXPECTED-VALUE: bp/m/ai-accounts/account.test.mjs:13; bp/m/ai-accounts/group-key.test.mjs:15; bp/m/ai-accounts/t36.test.mjs:14; bp/m/ai-accounts/t37.test.mjs:11; bp/m/ai-accounts/t38.test.mjs:16; bp/m/ai-accounts/t40.test.mjs:19; bp/m/ai-accounts/t41.test.mjs:19
- FALSE PLATFORM-DOUBLE: bp/m/ai-accounts/seam.test.mjs:66
### credentials (module 40, 18 findings)
- FIX-E member-roster/listenerRefusals: bp/m/credentials/seam.test.mjs:175,176 (judgment)
- FIX-E record-core/coreOver: bp/m/credentials/fixture.mjs:37 (judgment)
- FIX-E record-core/coreOver: bp/m/credentials/fixture.mjs:48,55,57,58 (mechanical)
- FIX-E record-core/tableDeclarationRefusals: bp/m/credentials/seam.test.mjs:153,156 (mechanical)
- FALSE EXPECTED-VALUE: bp/m/credentials/grant.test.mjs:13; bp/m/credentials/keyed.test.mjs:12; bp/m/credentials/t35-tally.test.mjs:15; bp/m/credentials/t36.test.mjs:16; bp/m/credentials/t37.test.mjs:12; bp/m/credentials/t38.test.mjs:11; bp/m/credentials/t40.test.mjs:11; bp/m/credentials/t41.test.mjs:11
- FALSE PLATFORM-DOUBLE: bp/m/credentials/seam.test.mjs:151
### promotion (module 41, 4 findings)
- FIX-E membership/projectActRefusals: bp/m/promotion/fixtures.mjs:163,166 (judgment)
- FALSE BAD-INPUT: bp/t/system/row-census.test.mjs:482
- FALSE OWN-SEAM-CALLBACK: bp/m/promotion/converts.test.mjs:39
### host-governor (module 42, 10 findings)
- FIX-L answer-envelope/relay-helpers: bp/m/host-governor/ops.test.mjs:87
- FIX-L store-door/store-envelope: bp/m/host-governor/ops.test.mjs:104,105,122,131,135x2,174
- FALSE OWN-SEAM-CALLBACK: bp/m/host-governor/ops.test.mjs:106
- FALSE PLATFORM-DOUBLE: bp/m/host-governor/ops.test.mjs:96
### provenance (module 43, 2 findings)
- FALSE EXPECTED-VALUE: bp/m/provenance/convert-versionchain.test.mjs:45
- FALSE OWN-SEAM-CALLBACK: bp/m/provenance/testimony-slot.test.mjs:105
### capture-sources (module 46, 5 findings)
- FALSE OWN-INPUT: bp/m/capture-sources/render.test.mjs:297,314,315
- FALSE PLATFORM-DOUBLE: bp/m/capture-sources/fake-binding.mjs:7,19
### acquisition (module 47, 110 findings)
- FIX-E capture-sources/renderFailure: bp/m/acquisition/r7-render-failed.test.mjs:45,66; bp/m/acquisition/r9-render-charge.test.mjs:24,38x2,48 (judgment)
- FIX-E capture-sources/renderFailure: bp/m/acquisition/acquire.test.mjs:244; bp/m/acquisition/checks.test.mjs:66 (mechanical)
- FIX-E provenance/heldParts: bp/m/acquisition/r9-read-range.test.mjs:20,27 (judgment)
- FIX-E provenance/provenanceOver: bp/m/acquisition/fixture.mjs:99,107; bp/m/acquisition/offers-worker.mjs:30,32 (judgment)
- FIX-L control-plane/deliver-owed: bp/m/acquisition/fix4b-owed.test.mjs:149,169; bp/m/acquisition/fix5-render-owed.test.mjs:54,75,108; bp/m/acquisition/fix6-t51.test.mjs:113,181,361; bp/m/acquisition/r123-batch-d.test.mjs:77,89,93,104a,104s,107; bp/m/acquisition/r7-fetchdone.test.mjs:30; bp/m/acquisition/r7-render-failed.test.mjs:32; bp/m/acquisition/r8-fetch-refused.test.mjs:30,37,64,113a,113s,116a,116s,128a,128s,134a,134s; bp/m/acquisition/r8-open-captures.test.mjs:72,74,89; bp/m/acquisition/r8-render-bar.test.mjs:102; bp/m/acquisition/r9-failed-ends.test.mjs:20; bp/m/acquisition/r9-pending-render.test.mjs:43,66,97
- FIX-L plane/job-registrar: bp/m/acquisition/r9-registrar.test.mjs:9,13,69,84x2,95x2,129,133x2
- FIX-L plane/keep-later: bp/m/acquisition/fix3-t51.test.mjs:168,182; bp/m/acquisition/fix4b-owed.test.mjs:243,248,255; bp/m/acquisition/r7-t51.test.mjs:159,180
- FIX-L plane/owed-ledger: bp/m/acquisition/fix4b-owed.test.mjs:22,42,97,109,128,163,187,198,212,228; bp/m/acquisition/fix5-render-owed.test.mjs:26; bp/m/acquisition/fix6-t51.test.mjs:82,143a,143s,286; bp/m/acquisition/g27-g32-t51.test.mjs:37,85; bp/m/acquisition/g27-memory-child.mjs:21; bp/m/acquisition/r123-batch-d.test.mjs:66; bp/m/acquisition/r7-fetchdone.test.mjs:19; bp/m/acquisition/r7-render-failed.test.mjs:24; bp/m/acquisition/r8-fetch-refused.test.mjs:21,97; bp/m/acquisition/r8-open-captures.test.mjs:21; bp/m/acquisition/r8-render-bar.test.mjs:35; bp/m/acquisition/r9-ceilings.test.mjs:24,30; bp/m/acquisition/r9-failed-ends.test.mjs:16; bp/m/acquisition/r9-pending-render.test.mjs:22,28,57,77,89
- CODE JOB_TABLE_FULL is in no source: use plane's JOB_NOT_KEPT (pending.mjs: the registrar could not keep the row): bp/m/acquisition/r9-registrar.test.mjs:69,95
- CODE OBJECT_TOO_LARGE is in no source: use record-core's EVIDENCE_STORE_REFUSED (C-102.39), the refusal putFromParts gives when the store will not take the whole: bp/m/acquisition/fix3-t51.test.mjs:152
- FALSE FAULT-INJECTION: bp/m/acquisition/acquire.test.mjs:395,440,446,724; bp/m/acquisition/fix5-render-owed.test.mjs:83
- FALSE MALFORMED-ANSWER: bp/m/acquisition/fix4b-owed.test.mjs:146; bp/m/acquisition/fix5-render-owed.test.mjs:55; bp/m/acquisition/r7-t51.test.mjs:165
### capture (module 48, 54 findings)
- FIX-E provenance/holdsOf: bp/m/capture/fixture.mjs:93; bp/m/capture/g127f-t51.test.mjs:526; bp/m/capture/g127f-worker.mjs:22; bp/m/capture/held.test.mjs:37,127; bp/m/capture/r9-t51.test.mjs:102,119,240,475; bp/m/capture/upload.test.mjs:173 (judgment)
- FIX-E record-core/evidencePartsRefusal: bp/m/capture/r103-t51.test.mjs:92 (judgment)
- FIX-L answer-envelope/relay-helpers: bp/m/capture/g27-reset.probe.mjs:54,56; bp/m/capture/g27-t51.test.mjs:18; bp/m/capture/ops.test.mjs:14; bp/m/capture/r6-t51.test.mjs:211; bp/m/capture/relays.test.mjs:30,52; bp/m/capture/t35.test.mjs:15; bp/m/capture/trace.test.mjs:21
- FIX-L plane/job-registrar: bp/m/capture/g127f-t51.test.mjs:10,90,91,469; bp/m/capture/r9-t51.test.mjs:12,56,57,137,158,254
- FIX-L plane/keep-later: bp/m/capture/r103-t51.test.mjs:31; bp/m/capture/r7-upload-t51.test.mjs:76
- FIX-L store-door/store-envelope: bp/m/capture/relays.test.mjs:51,53,70,81,86,88,92
- CODE NO_ROOM / JOB_TABLE_FULL are in no source: use plane's JOB_NOT_KEPT (pending.mjs): bp/m/capture/g127f-t51.test.mjs:469; bp/m/capture/r9-t51.test.mjs:158,254
- FALSE FAULT-INJECTION: bp/m/capture/r103-t51.test.mjs:116,117; bp/m/capture/r9-t51.test.mjs:159,167
- FALSE HARNESS-OWN: bp/m/capture/g127f-worker.mjs:47
- FALSE NAME-CLASH: bp/m/capture/g127f-plane.test.mjs:30; bp/m/capture/g127f-t51.test.mjs:106
- FALSE OWN-SEAM-CALLBACK: bp/m/capture/g127f-t51.test.mjs:487; bp/m/capture/ops.test.mjs:163; bp/m/capture/trace.test.mjs:29
- FALSE PLATFORM-DOUBLE: bp/m/capture/g27-t51.test.mjs:110; bp/m/capture/ops.test.mjs:18
### doorbell (module 49, 32 findings)
- FIX-E provenance/homeOf: bp/m/doorbell/held.test.mjs:14; bp/m/doorbell/r9-t51.test.mjs:14 (mechanical)
- FIX-E record-core/tableDeclarationRefusals: bp/m/doorbell/instance.test.mjs:76,79 (mechanical)
- FIX-L answer-envelope/relay-helpers: bp/m/doorbell/doorbell.test.mjs:17; bp/m/doorbell/inbox.test.mjs:14; bp/m/doorbell/invariants.test.mjs:121,133; bp/m/doorbell/knock-name.test.mjs:12; bp/m/doorbell/knocker.test.mjs:22; bp/m/doorbell/ops.test.mjs:13; bp/m/doorbell/rows.test.mjs:82; bp/m/doorbell/t35.test.mjs:19
- FIX-L plane/job-registrar: bp/m/doorbell/r9-t51.test.mjs:7,24,25,87
- FIX-L store-door/store-envelope: bp/m/doorbell/invariants.test.mjs:132,141,149,151,157,159
- CODE JOB_TABLE_FULL is in no source: use plane's JOB_NOT_KEPT (pending.mjs): bp/m/doorbell/r9-t51.test.mjs:84
- FALSE OWN-SEAM-CALLBACK: bp/m/doorbell/r9-t51.test.mjs:124
- FALSE PLATFORM-DOUBLE: bp/m/doorbell/doorbell.test.mjs:25; bp/m/doorbell/inbox.test.mjs:18; bp/m/doorbell/knock-name.test.mjs:16; bp/m/doorbell/knocker.test.mjs:26; bp/m/doorbell/ops.test.mjs:15; bp/m/doorbell/rows.test.mjs:86; bp/m/doorbell/t35.test.mjs:24
### file-safety (module 50, 6 findings)
- FIX-E file-scanner/reputationRefresh: bp/m/file-safety/tools.test.mjs:412; bp/m/file-safety/wakes.test.mjs:163 (judgment)
- FIX-E office-readers/cellsInRefusal: bp/m/file-safety/g44-large.test.mjs:210 (judgment)
- FIX-L plane/job-registrar: bp/m/file-safety/r1-registrar.test.mjs:7,43a,43s
### sources (module 51, 1 findings)
- FIX-E provenance/captureGradeAs: bp/m/sources/fixture.mjs:100 (judgment)
### reading-pipeline (module 53, 34 findings)
- FIX-E ai-accounts/accountForRefused: bp/m/reading-pipeline/text-units.test.mjs:528a,528s; bp/m/reading-pipeline/transcribe.test.mjs:261,264 (mechanical)
- FIX-E ai-accounts/accountForResult: bp/m/reading-pipeline/text-units.test.mjs:525 (judgment)
- FIX-E ocr-worker/memberWorker: bp/t/d606-perpage-ocr.test.mjs:145,164 (judgment)
- FIX-E ocr-worker/pageNotRenderable: bp/m/reading-pipeline/convert-ocr.test.mjs:193; bp/m/reading-pipeline/picture.test.mjs:46; bp/m/reading-pipeline/r10-refusals.test.mjs:110; bp/m/reading-pipeline/r37.test.mjs:101 (judgment)
- FIX-E office-readers/cellsInRefusal: bp/m/reading-pipeline/g41-held.test.mjs:317 (judgment)
- FIX-E pdf-worker/tier2Answer: bp/t/tier2-wire.test.mjs:315 (judgment)
- FIX-L ai-use/use-check: bp/m/reading-pipeline/transcribe.test.mjs:174
- CODE OVER_ENVELOPE is in no source: use a real pdf-worker refusal for a range, BAD_RANGE: bp/m/reading-pipeline/r9-reader.test.mjs:403
- CODE OVER_ENVELOPE is in no source: use a real pdf-worker refusal, e.g. NOT_FOUND (the worker answers and cannot help): bp/m/reading-pipeline/r37.test.mjs:111
- CODE PAGE_TOO_LARGE is in no source: use ocr-worker's FRAME_OVER_MEASURED_BOUND: bp/m/reading-pipeline/convert-ocr.test.mjs:253
- FALSE DELEGATING-SPY: bp/m/reading-pipeline/transcribe.test.mjs:207,346,398,503
- FALSE FAULT-INJECTION: bp/m/reading-pipeline/text-units.test.mjs:527; bp/m/reading-pipeline/transcribe.test.mjs:326,381,382,406
- FALSE OWN-SEAM-CALLBACK: bp/m/reading-pipeline/read.test.mjs:196; bp/m/reading-pipeline/text-units.test.mjs:507,511,530; bp/m/reading-pipeline/transcribe.test.mjs:234,320
- FALSE SYNTHETIC-PLUGIN: bp/m/reading-pipeline/classify-once.test.mjs:69; bp/m/reading-pipeline/g41-held.test.mjs:329

## Check rules
Each rule is a general condition by which the check could skip the finding (BOB fixes the check text).
- PLATFORM-DOUBLE (21): a platform double: Cloudflare API script (`okStub`), Durable Object or binding stub that only forwards a body or routes to the user's own ops, SQL handle, fake Browser binding and its inner helpers (`deliver`, `later`). Examples: bp/m/bundler/g54-observability.test.mjs:20, bp/m/bundler/g83-g84.test.mjs:23.
- EXPECTED-VALUE (19): an expected value in the user's own shape: a literal held in a variable and used only as the expected side of an assert, or a builder over the user's own check table (`X_CHECKS[code]`). Examples: bp/m/odf-reader/entries.test.mjs:161, bp/m/format-registry/pictures.test.mjs:139.
- OWN-SEAM-CALLBACK (18): a callback or literal handed to the user's own function or plug-in registrar, whose refusal the function relays opaquely (`within`, `readAcquired`, guard, fence, act, member, transcriber); the code is an arbitrary or invented pass-through, not a provider's answer. Examples: bp/m/record-core/record-core.test.mjs:777, bp/m/record-core/t33.test.mjs:590.
- HARNESS-OWN (15): test-support's own self-tests and probes (stand-in ops under test, root/uid probe answers, platform error codes) and a user's own harness worker's reply: the harness's shape, not a module's answer. Examples: bp/m/test-support/declared-ops.test.mjs:21, bp/m/test-support/declared-ops.test.mjs:36.
- SYNTHETIC-PLUGIN (15): synthetic readers, types or format entries registered through the user's own seam (`stubMeetings`, `withEntry`): they claim nothing about any provider's type; their reasons are opaque. Examples: docprofile/test/docprofile.test.mjs:19, docprofile/test/g48-readings.mjs:6.
- FAULT-INJECTION (14): a stand-in that only throws, returns undefined or is absent: a fault or absence injected, no answer built. Examples: bp/m/acquisition/acquire.test.mjs:395, bp/m/acquisition/acquire.test.mjs:440.
- BAD-INPUT (9): a deliberately malformed or forged input in a list of cases or a negative control (failing setter, `NO_SUCH_CODE`, `CONTROL_ARRIVAL`, malformed source or guard answers). Examples: bp/m/pdf-reader/pagesource.test.mjs:177, bp/m/member-roster/t19-enrol-boot.test.mjs:40.
- NAME-CLASH (5): a local test helper whose name hits an interface or stub word (`partsOf`, `fakeToken`) but that builds the user's own input bytes. Examples: bp/m/signatures/signatures.test.mjs:819, bp/m/ooxml/ooxml.test.mjs:750.
- DELEGATING-SPY (4): a wrapper that counts or records and returns the REAL provider's answer (`accountFor: (q) => acc.accountFor(q)`). Examples: bp/m/reading-pipeline/transcribe.test.mjs:207, bp/m/reading-pipeline/transcribe.test.mjs:346.
- OWN-INPUT (3): a literal argument of the user's own function through a local wrapper (`block({ok:false,...})`): an input. Examples: bp/m/capture-sources/render.test.mjs:297, bp/m/capture-sources/render.test.mjs:314.
- MALFORMED-ANSWER (3): a nameless refusal (`{ok:false}`) handed to the user's own function to show its own default code: an answer the provider never gives. Examples: bp/m/acquisition/fix4b-owed.test.mjs:146, bp/m/acquisition/fix5-render-owed.test.mjs:55.
- OWN-ENGINE (2): a stand-in for the user module's own engine seam (ocr-worker `createOCREngine`), defined in the user's own source. Examples: ocr-worker/test/ocr-worker.test.mjs:205, ocr-worker/test/ocr-worker.test.mjs:466.
- GENERATOR-VOCAB (1): a code in a test-support generator's own ground-truth output (imggen `unread` reason): the generator's vocabulary, no module's refusal. Examples: bp/t/imggen.mjs:419.

## Uncertain
- Durable Object stubs (`stubOf` in capture and doorbell, `acquireStub`, `stubStore`): classified FALSE PLATFORM-DOUBLE because each only forwards a body or routes to the user's own ops; the `{ok:true, result}` envelope it returns is store-door's wire format. If BOB wants the envelope covered, add them to the FIX-L `store-door/store-envelope` contract (10 findings: capture 2, doorbell 7, host-governor 1).
- FAULT-INJECTION (14) and MALFORMED-ANSWER (3): stand-ins that throw, are absent, or answer `{ok:false}` with no code. Read literally, K4990 still flags them as stubs of an interface, but no fixture made by real code can throw or answer nameless. BOB to rule FALSE (as here) or have the provider publish a faulting wrapper of its real instance (provenance registerHolds, plane registerJob/armJobs/keepLater, ai-accounts accountFor).
- provenance/testimony-slot.test.mjs:105 (CONTENT_EXTENT_REFUSED, invented, "a stand-in row", relayed unchanged): put under FALSE OWN-SEAM-CALLBACK (provenance relays whatever a registered testimony check refuses). The provider is content (module 55, later); alternative is FIX-L content/testimony-refusal with a content test running it.
- docprofile stubs (stub_meetings, stub_items, stub_fallback and their 11 import lines): FALSE SYNTHETIC-PLUGIN, by the file's own statement that they claim nothing about any real type. The real types are doctypes (module 22, later); no marker is possible without making them stand for doctypes' answers.
- The plane's registrar: both control-plane/jobs.mjs (door-side retry) and plane/pending.mjs (the table) touch `registerJob`; chosen plane/pending.mjs, because plane/store.mjs wires `capture.registerJob = pending.registerJob`. The deliver hand-in of owedRun/owedFetch is control-plane's `deliverOwedRender` (plane/store.mjs imports it); chosen control-plane. If BOB prefers one provider (plane), merge the contract.
- test-support's `job-registrar-stub.mjs` is itself a hand-built value of a later module (plane): FIX-L, so all 5 users (test-support, acquisition, capture, doorbell, file-safety) each need a marker and the plane a `fixtures-run` per user; the import lines of the stub in users are flagged too (use-site marker).
- CODE choices are recommendations: OBJECT_TOO_LARGE -> EVIDENCE_STORE_REFUSED (record-core, exists); JOB_TABLE_FULL and NO_ROOM -> JOB_NOT_KEPT (plane/pending.mjs, exists); PAGE_TOO_LARGE -> FRAME_OVER_MEASURED_BOUND (ocr-worker); OVER_ENVELOPE -> NOT_FOUND (r37) and BAD_RANGE (r9-reader) (pdf-worker). In no case does the product lack a code.
- office-readers/cellsInRefusal (file-safety g44-large:210 `cells_in_failed`, reading-pipeline g41-held:317 `no_such_sheet`): the real cellsIn reason strings are lower-case `reason`/`why` values, not UPPER_SNAKE codes; the fixture job must confirm which the real call gives for a missing sheet.
- reading-pipeline/tier2-wire.test.mjs:315 reads a stored recording (`tier2-recorded.json`); the ruling forbids stored copies, so the pdf-worker fixture must run the real tier-2 code; whether that is feasible inside the test runtime is for the pdf-worker job.
- host-governor/ops.test.mjs:106 SOMETHING_ELSE (invented) is FALSE OWN-SEAM-CALLBACK: a made-up code proving verbatim relay.
- pdf-reader pagesource.test.mjs:177 (NOT_HELD) is a malformed-source case (FALSE BAD-INPUT); the real held-bytes reader (acquisition/file-safety) refuses with other codes, so no fixture applies.
