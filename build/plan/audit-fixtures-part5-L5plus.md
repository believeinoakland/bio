# K4995 audit, part 5: test files of layer 5 and above (without plane and control-plane)

Branch tranche/T51, read only. Paths are from the repository root. Provider indexes are positions in build/modules.json (lower = earlier). Row format, classes (A, B, C, A*) and method are those of part 1 (`build/plan/audit-fixtures-K4990.md`); a row is a seam (one hand-built provider answer), not a file.

## Header: what was covered and what was not

**Scope.** 2,008 test files, 519,485 lines, in 118 modules (every module of layer 5 and above in modules.json except plane and control-plane; includes agent-worker, newgroup/installer, stewards, site, journey-check). This is far more than one reader can read whole. I chose the files that define the seams (fixtures, worlds, stand-in files, doors) and a few test files that use them, and I say below exactly what I read. **I claim nothing for any file not listed.**

**Read in full (every line), 28 files, 6,982 lines (1.3 % of the scope):**
screens-inquiry: fixtures.mjs, assistant.test.mjs, fr5-document.test.mjs, fr6-document.test.mjs. screens-settings: fixtures.mjs. screens-investigate: fixtures.mjs, real-plane.mjs. screens-publish: fixtures.mjs. screens-wizards: fixtures.mjs, standin.mjs. screens-action: declared.mjs. screens-intake: page.mjs. interface-shell: harness.mjs. scheduler: fixture.mjs. queue: world.mjs. queue-producers: world.mjs, reads.test.mjs. publication: door.test.mjs. store-door: dispatch.test.mjs. affordances: door.test.mjs. answer-envelope: envelope.test.mjs. instance-setup: fixture.mjs, r8-parts-report.test.mjs, r9-parts-kept-outside-isolate.test.mjs. signin-door: door.test.mjs. public-read: g54-attempt.test.mjs. case-import: accept.test.mjs. case-disclosures: fixture.mjs.

**Read by line range (the row names the range):** screens-action/real.mjs 1-30 of 87; screens-intake/t51-fix5.test.mjs 20-60 of 236; ratification/fixture.mjs 1-60 of 433 (+ grep); notice-producers/fixture.mjs 1-60; escalation/fixture.mjs 90-215 of 422; action-plans/fixture.mjs 85-182 of 322; monitoring/fixture.mjs 196-215 and 300-381 of 381; newgroup/test/fixture.mjs 1-25 and 530-592 of 648; agent-steps/test/plane-suggest.mjs 1-40 of 319, plane-meaning.mjs 1-22 of 77, plane-versions.mjs 1-22 of 32, plane-capturerequest.mjs 1-22 of 106; journey-check/live.test.mjs 1-15; machinery-producers/world.mjs 1-12; action-producers/world.mjs 1-14; and windows of 10-17 lines around single hand-built refusals in monitoring/understanding.test.mjs 506-516, monitoring/tick.test.mjs 564-576, ratification/retire.test.mjs 268-284, hypotheses/t41.test.mjs 240-252, queue-producers/contradictions.test.mjs 150-162, intent/discovery.test.mjs 214-226, store-door/pull.test.mjs 104-116, reevaluation/sweep.test.mjs 176-188.

**Checked against the provider's code (file:line in the rows):** extraction (reading, completeness, readHeld), capture (heldcaptures, supporting), actions (actionRead), promotion (CAS_STALE, registration refusal), member-roster (adminMath), ai-runs (withheld codes, reap), monitoring (archiveTick), case-import (watchItems), progressions (NO_KEY), instance-setup (instancegroup), citation (repairs), the method names of 45 stand-in providers (all exist), and text-chain's closed extent kinds.

**Two scans over the whole scope (mechanical, not reading; they find candidates and are NOT a coverage claim):**
1. Every `reason|why|code|failure|error: "UPPER_CASE"` literal in the 2,008 files (452 distinct codes) was looked up as an upper-case token in the source of every module in modules.json. **74 codes occur in no module source.** The list is at the end. About half are visibly deliberate unknown-code controls by their names; the others are rows above where I read the line. A code built at run time from parts would be reported missing in error.
2. Every `extent: {kind: "..."}` literal in the screens, retrieval, queue, case-*, inquiry and related tests, against text-chain's closed kinds (textchain.mjs:1547-1556; content/extent.mjs:51). Kinds that exist nowhere: `line`, `paragraph`, `page`, `heading` (rows in extraction below). `nonsense` and `nope` are deliberate controls.

**Not covered:** the other 1,980 files. Where the same pattern is likely is in the census at the end. Class C rows (faults, platform, unknown-code controls) were not enumerated: this audit looked for seams.

## Findings for BOB (not row-level)

1. **Order blocks the rule in only 12 of 170 rows (the A* rows); the rest can be fixed by a provider fixture imported by a later module.** The A* rows are: queue's `homesOf`/`optionsOf` retyped in queue-producers, machinery-producers, action-producers and notice-producers (queue 149 is later than all four); the control-plane / store-door / answer-envelope reply helpers (`doAnswer`, `storeSilent`, `storeRefusal`, `json`) retyped in publication, answer-envelope, affordances, instance-setup and public-read; review's provider registered by hand in publication (review 122, publication 108); screens-intake's `DOCUMENT_STUB` of screens-inquiry (165 vs 163); and interface-shell's frame answers (`whoami` is control-plane's). The `doAnswer` helper exists in at least three hand-typed copies (instance-setup/fixture.mjs:152-162, publication/door.test.mjs:17-27, public-read/g54-attempt.test.mjs:18-19) beside the real one; part 1 reached the same conclusion for the registrar.
2. **The screens are the largest block and every screen module is later than every provider it reads.** 242 test files in 9 screens modules answer from a scripted plane; 12 of them (screens-action 2, screens-intake 2, screens-inquiry 4, screens-investigate 1, screens-publish 1, screens-daily 2) boot the real plane or the real owners (listed under "good models"). interface-shell's harness checks every REQUEST against the owner's declared fields (`declaredOpsOf`, R104, harness.mjs:30-78: the right shape of check), but an ANSWER is `ok(result)`: any object. Nothing compares an answer with its owner. Because no order problem stands in the way, the natural fix is the one part 1 proposed per provider (a published answer fixture made by the owner's real code) with the harness's `ok` replaced by a lookup of the owner's fixture, and `test-support`'s collector (`declared-ops.mjs`) as its home. That is BOB's call; my recommendation is to start with the ops the screens read from extraction, capture, strength, ai-runs and instance-setup, where the rows below show real drift.
3. **The same op is typed differently in sibling fixtures**, which no provider fixture can allow: `heldcaptures` (`rows` in screens-inquiry/fixtures.mjs:121, `held` in three siblings; the real key is `held`, capture/index.mjs:2108), `reading` (`capture_sha` vs `sha256`), `watchItems` (with and without `ok`: queue/world.mjs:173 vs queue-producers/world.mjs:168), `availableActions` (three shapes in escalation, action-plans and affordances), `strengthbarof` (two shapes), `actionRead` (see 4).
4. **Hand-built refusals the owner never raises (this audit's strongest rows):** promotion's stale-base refusal is `CAS_STALE` (promotion/index.mjs:750) but monitoring (two files), ratification and store-door hand it `BASE_MISMATCH`, `BASE_MOVED`, `STALE_BASE`, `PROMOTE_REFUSED_HERE`; `actionRead` refuses with `NO_SUCH_ACTION` (actions/index.mjs:2893, action-records/index.mjs:104) but escalation's and action-plans' stand-ins answer `NO_SUCH_BUNDLE` and `NOT_AN_ACTION`; `PRIMARY_TOO_LARGE` is fed to the document screen as a not-walked reason that acquisition never emits (it emits `TOO_LARGE_TO_PARSE`); instance-setup's absent-group answer is the code string where the real one is the sentence. In each of them the screen or module under test accepts both spellings, so the tests pass.
5. **Good models already in the tree (use as the pattern):** screens-investigate/real-plane.mjs (the deployed Worker under Miniflare, nothing scripted); screens-action/real.mjs (the real `filings` world answering each op through its owner's map); screens-intake/t51-fix5.test.mjs (real `captureOps().heldat()` beside a scripted twin); store-door/dispatch.test.mjs (a fake membership and a real-record arm in one file, so the fake's drift is visible: it omits `check: "C-70.1"`); publication/door.test.mjs (a stub Durable Object that serves the REAL `caseTensionsOps` and `publicationOps`); public-read/g54-attempt.test.mjs (real publication, store and bucket shape; the failures are the bucket's and the store's own); case-disclosures/fixture.mjs (real modules throughout; `realImports` and `realCarriage` options compose the real `case-import` and `case-carriage` instead of the stand-ins in the same file, so each stand-in can be checked against its twin); instance-setup/fixture.mjs:104-110 (`aiKeptAway` built from the real `AI_ACCOUNT_CHECKS` row); agent-steps/test/plane-*.mjs (mocks derived from the owners' constants and functions; their headers record that the earlier mocks answered yes to anything and hid a wrong field name for a whole tranche).

## Tables by provider module (modules.json order)

### member-roster (index 35)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-settings/fixtures.mjs:61-63 `arithRow`, `ARITH` (file read in full) | screens-settings (162) | member-roster `adminArithmetic` / `Members.adminMath` (member-roster/index.mjs:673-686) | the formula retyped: `votesNeeded = floor(n/2)+1`, `eligibleVoters = max(0,n-1)`, `possible`, for 1..9 and the live row | yes, same keys and formula as `adminMath` (:673-677); a copy, so a rule change at the owner cannot reach the test | B |
| 2 | bio-plane/test/m/screens-settings/fixtures.mjs:18-26 ROSTER, :78-104 `membersTable`, :116 FOUNDER_ROW (memberlist, memberadd, membercaps, memberset, adminendorse, adminremove, expertiselist, expertiseconfirm, invitewithdraw, websitekeycreate, joinlinkenable, adminrecoverystep, adminremovalsopen, passwordresetlink) | screens-settings (162) | member-roster / membership ops | roster rows `{member_id, handle, role, status, capabilities, cover, expertise, invitation, created}`, `founder: true` row, act answers `{ok, memberId, invite, expires, ...}`; refusals through `refuse(code)` = `{ok:false, reason, code, translation: "translated <code>"}` | unknown (not compared op by op); the translation is invented text for every refusal | A |

### membership (index 37)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/store-door/dispatch.test.mjs:16-37 (file read in full; the real arm is :306-336, :596-652) | store-door (156) | membership.visibilityOf / existenceAct | `fakeStore().membership()`: `existenceAct` -> `{ok:false, reason:"PROJECT_SEEN_NOT_A_PARTICIPANT", project}` or null; `visibilityOf` -> "discoverable"/"hidden" from a list | partly: the same file's real arm (:324) reads `own.check === "C-70.1"`, so the real answer carries `check`, which the fake's does not | A |
| 2 | bio-plane/test/m/instance-setup/fixture.mjs:76 (file read in full) | instance-setup (151) | membership.isAdministrator | `membership: { isAdministrator: (id) => p.admins.has(id) }` beside the REAL record-core | unknown (not compared); the real `membershipOf` is built on a bare storage in two other fixtures in this scope (queue/world.mjs:48, queue-producers/world.mjs:62) | B |

### ai-accounts (index 39)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/signin-door/door.test.mjs:13-16 (file read in full) | signin-door (157) | ai-accounts `aiKeptAway`, `disclosureDue` | `keptAway = {ok:false, reason, code, detail:"kept away", keep_away:{reason}}`; `disclosureDue` with `check:"C-29.40"` and `translation:"Read what connecting means first."` typed | keptAway: no (the real row has check, translation, `keep_away{reason,set_by,set_at}`: instance-setup/fixture.mjs:104-110 builds it from `AI_ACCOUNT_CHECKS`); disclosureDue translation: no (answer-envelope/envelope.test.mjs:312-316 reads the real one from words.json `refusal.DISCLOSURE_DUE`) | A |
| 2 | bio-plane/test/m/instance-setup/fixture.mjs:95-111 (file read in full) | instance-setup (151) | ai-accounts `aiKeepAwayState`, `aiKeptAway` | `aiKeptAway` rebuilt from the REAL `AI_ACCOUNT_CHECKS.AI_KEPT_AWAY` row with the module's two real `localize` sentences; `keepAway` state set by the test | yes by construction (imports the real row), but the choice logic (`on === false` -> null) is retyped | B |
| 3 | bio-plane/test/m/screens-settings/fixtures.mjs:30-41, 118-140, 168-204 (`connectTable`, `teamaiTable`: accountreference, accountuses, ailimits, aiusage, aiuseovertime, accounthistory, groupkeystate, aikeepawaystate, subscriptionsignin, disclosureof) | screens-settings (162) | ai-accounts / ai-use / credentials account ops | `ALL_USES`, `LIMITS`, `USAGE`, `OVER`, `HISTORY`, `KEEPAWAY_ON` typed; `subscriptionsignin` answered at the top level | unknown (not compared) | A |
| 4 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `projectAccountsSuspended` | `[]` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### credentials (index 40)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-settings/fixtures.mjs:65-75, 94-96, 142-166, 295-305, 325-341 (signerlist rows, signerset, signeradd, signerregisterown, signerrevokeown, recoverycodesstate, recoverycodesissue, securitymap, securitytools*, setpassword) | screens-settings (162) | credentials ops | signer rows `{key_b64, member_id, status, origin, registered_by, member_status, attests, attests_why}`, `securitymap` buckets/countries, recovery codes `CODE-0000-SENTINEL` | unknown (not compared) | A |
| 2 | bio-plane/test/m/notice-producers/fixture.mjs:19-20 (range 1-60) | notice-producers (148) | credentials.securityLevel / securityMap | `securityMap: () => ({ok:false, reason:"NOT_AN_ADMIN", code:"NOT_AN_ADMIN"})` (no check, no translation) | methods exist (credentials/index.mjs); the real refusal row carries check and translation (answer not compared) | A |

### promotion (index 41)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/instance-setup/fixture.mjs:77-83 (file read in full) | instance-setup (151) | promotion `registerFact` / `fact` | `registerFact` refuses a second name with `{ok:false, reason:"STEP_DECLARED", fact}` | no: the real refusal is `{ok:false, reason, code, check, translation, ...}` (promotion/index.mjs:186-189) | B |
| 2 | bio-plane/test/m/monitoring/tick.test.mjs:564-576; monitoring/understanding.test.mjs:506-516 (ranges read) | monitoring (137) | promotion `promote` | `promote` replaced for one author/operation by `{ok:false, reason:"BASE_MISMATCH", detail:"moved"}` / `{ok:false, reason:"BASE_MOVED"}` | NO: the stale-base refusal is `CAS_STALE` (promotion/index.mjs:750-753); neither code exists in any module source | A |
| 3 | bio-plane/test/m/store-door/pull.test.mjs:104-116 (range read) | store-door (156) | promotion `promote` | `promotion = { promote() { ... return {ok:false, reason:"PROMOTE_REFUSED_HERE", detail:"raced"} } }` or a throw | NO for the code (not in any source); the throw is a fault injection (C) | A |
| 4 | bio-plane/test/m/ratification/retire.test.mjs:268-284 (range read; helper `drive` not read) | ratification (115) | promotion `promote` (via retire) | a refusal `{ok:false, reason:"STALE_BASE", detail:"d"}` handed to the retire drive | NO: not a code promotion raises (real: `CAS_STALE`) | A |

### host-governor (index 42)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:120; queue-producers/world.mjs:149 | queue (149) | host-governor `governorHolding` | `governorHolding: () => []` | method exists (host-governor/index.mjs:225); answer not compared | A |
| 2 | bio-plane/test/m/instance-setup/fixture.mjs:91-94 (file read in full) | instance-setup (151) | host-governor `governorAdmit`, `governorReport` | `governorAdmit` -> `{admitted:true, wait_ms:0}` or `{admitted:false, reason}`; `governorReport` -> `{recorded:true}` | partly: part 1 found the real admit answer also carries `appetite_per_min` and, on refusal, `retry_in_ms` | A |

### provenance (index 43)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue-producers/reads.test.mjs:227; queue-producers/world.mjs:150 (both read in full) | queue-producers (147) | provenance `homeOf` | `homeOf: (sha) => ({ bundleId: "DOC-" + sha.slice(3) })`; default `homeOf: () => null` | default null: yes. `{bundleId}` alone: no (part 1: the real row is `{bundleId, path, encoding, bytes, registered, authored}`) | A |
| 2 | bio-plane/test/m/queue/world.mjs:121 (read in full) | queue (149) | provenance `homeOf` | `homeOf: () => null` | yes (null for an unregistered digest) | B |
| 3 | bio-plane/test/m/notice-producers/fixture.mjs:31 (range 1-60) | notice-producers (148) | provenance `homeOf` | `homeOf: () => null` | yes (null for an unregistered digest) | B |
| 4 | bio-plane/test/m/screens-inquiry/fixtures.mjs:58, 120-123, 134-135; fr5-document.test.mjs:14; fr6-document.test.mjs:18 (read in full) | screens-inquiry (165) | provenance: the bundle's `data/provenance.json`, `gradenote`, `capturegrade`, `versionchain`, `origins`, `provenanceroutes` | `provenanceOf(sha) = {documents:[{capture:{sha256}}]}` (and the five-part variant with `parts`); grade `{grade:"B", route:"fetched", determined:true}`; `versionchain` `{versions:[{capture_sha, first_retrieved}], at_index}` | the file shape is a minimum: a real document (case-disclosures/fixture.mjs:452-460 `provDoc`) carries file, locator, retrieved, authority*, capture{method,grade,actor_class,sha256,encoding,bytes}, origin; the ops' shapes are not compared | A |
| 5 | bio-plane/test/m/store-door/promotion-step.test.mjs:131 (line seen by grep) | store-door (156) | provenance `onTestimony` listener | `{[which]: () => ({ok:false, reason:"PROBE_REFUSED"})}` | listener-refusal injection; the code is the probe's own | C |

### acquisition (index 47)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-inquiry/fr6-document.test.mjs:198-209 (file read in full) | screens-inquiry (165) | acquisition `supportingOf` (acquisition/index.mjs:2148-2176) | provenance document `capture.supporting = {kept, skipped, total, reasons:[{reason:"TOO_LARGE", count, limit, detail}], not_walked:"PRIMARY_TOO_LARGE"}` | `reasons` yes; `not_walked: "PRIMARY_TOO_LARGE"` NO: acquisition emits `TOO_LARGE_TO_PARSE` (:2212) or `RENDER_PENDING` (:1744); `PRIMARY_TOO_LARGE` exists only in the screen (screens-inquiry/document.mjs:364), whose regex accepts both, so the test passes on a value the provider never gives | A |

### capture (index 48)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:122-123 (read in full) | queue (149) | capture `liveCaptureSessions`, `taskEvents`, `taskEventCount`, `taskEventAttempt`, `taskEventRemove`, `on` | empties: `[]`, `0`, `true`, `{ok:true}` | methods exist (capture/index.mjs:3261, 3549, 3566, 3574, 3586, 1406); answers not compared | A |
| 2 | bio-plane/test/m/queue-producers/world.mjs:151 (read in full) | queue-producers (147) | capture `liveCaptureSessions` | `liveCaptureSessions: () => []`, typed again in each fixture | method exists (capture/index.mjs:3261) | A |
| 3 | bio-plane/test/m/notice-producers/fixture.mjs:33-34 (range 1-60) | notice-producers (148) | capture `fetchesDone` | `{ok:true, fetches:[], limit:200, truncated:false, next:null}` | method exists (capture/index.mjs:1406); answer not compared | A |
| 4 | bio-plane/test/m/screens-inquiry/fixtures.mjs:121 (file read in full) against screens-settings/fixtures.mjs:428, screens-investigate/fixtures.mjs:30, 35, screens-publish/fixtures.mjs:116 | screens-inquiry (165) | capture `heldcaptures` (capture/index.mjs:2108, 2135) | screens-inquiry answers `{ok:true, rows:[{document, capture:{sha256, grade}}]}`; the three sibling fixtures answer `{ok:true, held:[{bundle_id, title, capture:{sha256}}]}` | NO for `rows`: the real answer is `{ok:true, held: rows, state, sort, dir, limit, truncated}`; the screen reads `held` (screens-inquiry/document.mjs:189), so the DEFAULT plane gives the document screen nothing held and only a test that overrides the op sees a row | A |
| 5 | bio-plane/test/m/screens-settings/fixtures.mjs:422-429; screens-investigate/fixtures.mjs:30-36; screens-publish/fixtures.mjs:116-117 | screens-settings (162) | capture `heldcaptures` | `held` rows typed three different ways (settings: `{title, capture}` with no `bundle_id`; investigate: `{bundle_id, title, capture}`; publish: `{bundle_id, title, since, capture}`); `HELD_VOUCHED` adds a row for `state:"held_and_vouched"` | top-level key yes; row keys not compared | A |
| 6 | bio-plane/test/m/screens-intake/t51-fix5.test.mjs:30-37 (range 20-60) | screens-intake (163) | capture `heldat` | a REAL `captureOps(...).heldat()` over a real store (:30-36, good) beside `SCRIPTED_HELDAT` `{ok, held, copy:{sha256, document, project, retrieved, actor, address}, versions, truncated, changed:{state}}` (:37) | real arm yes; scripted twin's `changed` not compared (real keys capture/index.mjs:1789-1798) | A |
| 7 | bio-plane/test/m/instance-setup/fixture.mjs:89 | instance-setup (151) | capture `on` | `on(event, module, fn)` -> `{ok:true, event, module}` | unknown | B |

### file-safety (index 50)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `scanWake`, `renderWake`, `deeperWake`, `forwardWake`, `reputationWake`, `refreshReputationLists`, `onFileWork`, `scanBatch`, `renderBatch`, `deeperBatch`, `forwardSecurityCounts` | batches `{ok, scanned, found, not_scanned, remaining}` etc.; `onFileWork` keeps the listener and answers `{ok:true}` | unknown | A |
| 2 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `scanFindings`, `securityToolEvents`, `securityTools` | `{ok, findings:[], cursor, truncated:false}` etc. | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### calibration (index 52)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `calibrationDue/Wake/Tick` | `{due:[]}` | unknown | A |

### extraction (index 54)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-inquiry/fixtures.mjs:71-78 READING; fr5-document.test.mjs:133-137; fr6-document.test.mjs:21-23, 66-67, 102-118, 136, 146, 152 (read in full) | screens-inquiry (165) | extraction `reading` (extraction/index.mjs:1944-1979, 2248) | `{ok, found, capture_sha, reading:{...}, text_units:[{seq, extent, reference, truncated, text}], unread_pages}`; `completeness:{state, why, skipped:[{units}]}`; `more/read_through/total`; `next/units_total`; `repairable` | keys yes (repairable :1944, completeness+units_total :1947, next :2248, read_through/total :495/:968); `completeness` is partial against the real `{state, counts, counters, skipped[{from,to,units,side,first_seq,last_seq}], owed?, failure?, why?, stated_units?}` (:1958-1979) | A |
| 2 | bio-plane/test/m/screens-intake/t51-fix5.test.mjs:20-24, 41 (range) | screens-intake (163) | extraction `reading`, `readheld` | `read(units)`/`failedFinal` answers; `readheld` -> `{ok:true, read:true, bundle_id, found: afterRead.length > 0}` | reading: partly; readheld: yes when found/bundle_id given (:1076-1083) | A |
| 3 | bio-plane/test/m/screens-settings/fixtures.mjs:420-429; screens-investigate/fixtures.mjs:200-203 (read in full) | screens-settings (162) | extraction `reading` | `reading: ok({ok:true, text_units: UNITS_OF_DOC})` with `{seq, text, extent:{kind:"pdf-page", page}}`; investigate answers `{ok, sha256, unread_pages:[], text_units:[{extent, reference, text, truncated}]}` | partly: settings omits `found`, `capture_sha`, `reading`; investigate answers `sha256` where the real and the inquiry fixture say `capture_sha` | A |
| 4 | bio-plane/test/m/screens-inquiry/fixtures.mjs:71-78 vs screens-investigate/fixtures.mjs:201-203 | screens-investigate (166) | extraction `reading` | see the row above; the two sibling fixtures disagree on the answer's top-level key | see above | A |
| 5 | bio-plane/test/m/screens-inquiry/fr5-document.test.mjs:137, 156, 162; fr6-document.test.mjs:50 (read in full) | screens-inquiry (165) | extraction `readheld` (extraction/index.mjs:861, 881-885, 1076-1083) | `{ok:true, read:true, bundle_id, found:true}`; `{ok:true, read:true}` (fr6:50); `{ok:true, read:false, why:"NO_WHOLE_OBJECT"\|"NO_HOME"\|"READING_HELD"}` | all yes except fr6:50, which lacks `bundle_id`/`found` that a real `read:true` always has (part 1) | A |
| 6 | bio-plane/test/m/case-disclosures/fixture.mjs:109-113, 214-224 (file read in full) | case-disclosures (118) | extraction `readingOf`, `unitsOf`, `capturesReadFor`, `onReading`; tables `capture_text`, `capture_text_state` | `exProvider = {readingOf: () => null, unitsOf: () => ({units:[], state:null}), ...}` handed to `content` and `events`; `indexText()` INSERTs raw rows into extraction's own tables with `extent_kind 'doc-para'` | unknown for the provider answers; the raw inserts bypass `extraction`'s writer | A |
| 7 | bio-plane/test/m/screens-inquiry/fr6-document.test.mjs:65 (read in full); fr28-document.test.mjs:210 and t51-document.test.mjs:407 (single lines seen by grep, files not read); r9-document.test.mjs:105 (part 1) | screens-inquiry (165) | extraction / text-chain text_units extents | `extent:{kind:"line", line}` (fr6:65); `{kind:"paragraph", para}` (fr28:210); a `heading` unit (t51-document:407) | NO: textchain.mjs:1547-1556 closes the kinds at document, pdf-page, sheet-cell, slide-shape, doc-para, sheet-range, doc-table, image (content/extent.mjs:51 adds doc-part, envelope) | A |
| 8 | bio-plane/test/m/screens-intake/t51-fix5.test.mjs:20; t51-fix6.test.mjs:145 (second line seen by grep only) | screens-intake (163) | extraction text_units extents | `extent:{kind:"page", page:1}` | NO: `page` is not a kind (the kind is `pdf-page`) | A |

### entities (index 56)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `readEntity` | `{ok:true, found:false, entity_id}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### local-facts (index 59)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:180 | queue (149) | local-facts `factsDue` | `{ok:true, due:[], unknown:[], absent:[]}` | method exists (local-facts/index.mjs:478) | A |

### connections (index 60)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `wake`, `sweep` | `{entities:0, remaining:0, swept:[]}` | unknown | A |

### standards (index 63)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/action-plans/fixture.mjs:118-122 (range) | action-plans (135) | standards `standardRead` | `{ok:true, id, ...held}`; `{ok:false, reason:"NO_SUCH_STANDARD"}` | method exists; shape unknown | A |

### progressions (index 64)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:128-133 (read in full) | queue (149) | progressions `proposalsFeed`, `disposeProposal` | `disposeProposal` refusal `{ok:false, reason:"NO_KEY", code:"NO_KEY", detail:"a proposal disposition names its progression ..."}` when neither `progressionKey` nor `key` with `::` | NO_KEY yes (progressions/index.mjs:398 via `generic("NO_KEY", ...)`); the fake's detail sentence is its own | A |
| 2 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `overdueScan` | `{overdue_count:0, next_deadline, next_deadline_at:null}` | unknown | A |

### money-checks (index 66)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `runDetectors` | `{ok, written, unchanged, raised, skipped:{}, persons_skipped, detectors, remaining, cursor}` | unknown | A |
| 2 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `noticed` | `{ok:true, project, label:"Noticed", items:[], truncated:false}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### duties (index 67)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `recordTransitions` | `{ok, as_of, duties_read:0, recorded:0, cursor:null, done:true}` | unknown | A |
| 2 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `dutiesOf`, `occurrencesOf` | `{ok, entity, as, duties:[], count:0, limit:500, truncated:false}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### people (index 68)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `evaluateChecks` | `{ok, evaluated:0, remaining:false}` | unknown | A |
| 2 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `checkResults`, `listChecks` | `{ok:true, checks:[]}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### bias (index 70)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/case-disclosures/fixture.mjs:354-368 `lensStandIn` (file read in full) | case-disclosures (118) | bias `statementInForce`, `biasManifest` | `{ok, statement, scope, in_force, kind:"scrutiny"\|null, text}`; `biasManifest -> {ok:true, in_force:false}` | unknown (not compared) | A |
| 2 | bio-plane/test/m/queue/world.mjs:135-136; queue-producers/world.mjs:157 | queue (149) | bias `uncleared`, `settled` | `{debts:[], limit:200, truncated:false}` | method exists (bias/index.mjs:1070) | A |
| 3 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `biasDebtDue/Wake/Sweep` | `{raised:0}` | unknown | A |

### retrieval (index 73)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/case-disclosures/fixture.mjs:130, 205 (read in full) | case-disclosures (118) | retrieval `selectionResolve`, `zone` | `selectionResolve -> {ok:false, reason:"NO_SUCH_SELECTION", check:"C-33.20"}`; `zone: () => team.zone` | reason yes (retrieval/checks.mjs:51-54); the real row also carries a translation, absent here | A |
| 2 | bio-plane/test/m/ratification/r7-publish-at.test.mjs:45 (line seen by grep; file not read) | ratification (115) | retrieval `zone` | `standIn({zone:null, source:null, why:"PROFILES_DISAGREE"})` | NO: `PROFILES_DISAGREE` appears in no module source | A |
| 3 | bio-plane/test/m/scheduler/fixture.mjs:37-38 (read in full) | scheduler (140) | retrieval `sweepWake`, `sweepSelections` | `sweepWake -> v(...)`, `sweepSelections -> 0` | methods not compared | A |
| 4 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `browse` | `{ok, kinds:[], only, items:[], count:0, limit:200, truncated:false, next:null}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### calculations (index 74)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `ingestDue/Wake/Tick`, `onIngestWork` | `{ok, ingest:null, state:"ingesting", rows_done:0, finished:0}` | unknown | A |
| 2 | bio-plane/test/m/scheduler/g55-ingest.test.mjs:141 (line seen by grep, file not read) | scheduler (140) | calculations `onIngestWork` | `"ingest-work": { tick: { ok:false, reason:"REGISTRATION_CLOSED" } }` | NO: `REGISTRATION_CLOSED` is in no source | A |
| 3 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `ingestNotices` | `{ok:true, items:[], next:null}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### inquiry (index 79)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/hypotheses/t41.test.mjs:246-252 (range 240-252) | hypotheses (80) | inquiry R59 person warning (`personWarning`) | `setup({personWarning: ({text, viewer}) => text.includes("ENT-2026-0003") ? {code:"PERSON_NO_PUBLIC_ROLE", persons:[...]} : null})` | NO for the code: `PERSON_NO_PUBLIC_ROLE` is in no module source | A |
| 2 | bio-plane/test/m/intent/discovery.test.mjs:214-226 (range) | intent (101) | inquiry `dispose` (inquiry/index.mjs:1679-1680) | `dispose = () => ({ok:false, reason:"HELD_ELSEWHERE"})` | NO: `HELD_ELSEWHERE` is in no source (real refusals include BAD_REASON, BAD_TARGET_STATE, NO_REASON, EMPTY_SELECTION) | A |
| 3 | bio-plane/test/m/notice-producers/fixture.mjs:18 (range 1-60) | notice-producers (148) | inquiry `datedWaits` | `datedWaits -> {ok:true, member, waits:[]}` | method exists (inquiry/index.mjs) | A |
| 4 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `datedWaitsDue/Wake/Tick` | `{marked:[]}` | unknown | A |

### steps (index 81)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `laterFound`, `stepsDue`, `costShares`, `costMessages` | `{ok:true, found:[]}` etc. | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### citation (index 82)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-inquiry/fr5-document.test.mjs:49-52 (read in full) | screens-inquiry (165) | citation `cite` refusal with repairs (citation/index.mjs:400-401) | `{ok:false, reason:"BASIS_REFUSED", findings:[{check:"C-2.8", code:null, detail, repairs:[]}], repairs:[{key, act, fields, text}]}` | repairs: yes (`{key, act, fields, text}` with `citation.index.repair_add_to_group`); findings unknown | A |

### basis-versions (index 84)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-inquiry/fixtures.mjs:63-68 BASIS (read in full) | screens-inquiry (165) | basis-versions `basisversions` | `{ok, inquiry, versions:[{name, state, author, moved, grounds, legs:[{ord, target, role, grade, words, target_title, status?, scale?}]}]}` | unknown (not compared) | A |
| 2 | bio-plane/test/m/queue/world.mjs:126-127; queue-producers/world.mjs:153-154 (read in full) | queue (149) | basis-versions `projectsDrawingOn`, `conclusionOf`, `conclusionRecordOf`, `basisVersions` | `projectsDrawingOn: () => Object.assign([], {bound:32, truncated:false})`, `conclusionRecordOf: () => ({stance:null})`, `basisVersions: () => ({ok:true, versions:[], truncated:false})` | methods exist (basis-versions/index.mjs:722, :625); answers not compared | A |
| 3 | bio-plane/test/m/reevaluation/sweep.test.mjs:176-188 (range) | reevaluation (103) | basis-versions `appendVersion` | `appendVersion = () => ({ok:false, reason:"VERSION_REFUSED_HERE", detail})`; later `() => null` | NO: `VERSION_REFUSED_HERE` is in no source | A |
| 4 | bio-plane/test/m/basis-versions/own-reading.test.mjs:201 (line seen by grep) | basis-versions (84) | run-productions `onMachinePassage` listener | `() => ({ok:false, reason:"MACHINE_PASSAGE_NOT_TAKEN_UP"})` | NO: in no source | A |

### strength (index 85)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-inquiry/fixtures.mjs:79-81, 98-99, 108-109; screens-settings/fixtures.mjs:251, 258 (read in full) | screens-inquiry (165) | strength `inquirystrength`, `strengthbarof`, `versionstrength` | `STRENGTH[Q] = {capture:{state:"graded", grade, weakest:{title}}, connection:{state, grade, detail}, testimony:{state:"unrated"}}`; batch `{ok, results:{id: single}}`; bar `{ok, project, bar:{declared, source, capture, connection}}` | unknown (not compared); the batch form is the fixture's own `batchStrength` (:23) | A |
| 2 | bio-plane/test/m/screens-settings/fixtures.mjs:251, 258 | screens-settings (162) | strength `strengthbarof`, `strengthbarset` | `{ok, group, bar:{group_id, capture, connection, author, at, reason}, seeds_new_projects}`: a second shape for the op the inquiry fixture answers with `{project, bar:{declared, source, ...}}` | unknown | A |
| 3 | bio-plane/test/m/action-plans/fixture.mjs:116 (range) | action-plans (135) | strength `projectBar` | `({declared, capture, connection})` | unknown | A |

### contradiction (index 86)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue-producers/reads.test.mjs:44-100, 105-124; queue-producers/world.mjs:177-178 (read in full) | queue-producers (147) | contradiction `candidatesFor`, `conflictNotices` and case-tensions `caseTensions` | `{ok:true, wrote:false, candidates:[], truncated:false, undetermined:true, empty:{level}}` and `{ok:true, ...notices:[], undetermined:true, why}`; refusals NOT_A_PARTICIPANT, NO_SUCH_PROJECT, PROJECT_SEEN_NOT_A_PARTICIPANT; `SOMETHING`/`SOME_REFUSAL`/`OTHER` as unknown-code controls | methods exist (contradiction/index.mjs:1591, 2841; case-tensions); answer keys not compared; the three project codes exist in source; the controls are deliberate (C) | A |
| 2 | bio-plane/test/m/queue-producers/contradictions.test.mjs:150-159 (range) | queue-producers (147) | contradiction `conflictNotices` | `return {ok:false, reason:"PROJECT_NOT_PARTICIPANT"}` for any project the viewer is not in | NO: `PROJECT_NOT_PARTICIPANT` is in no source (the real codes are in the row above) | A |

### run-rules (index 87)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-inquiry/assistant.test.mjs:14-22 `openRule` (read in full) | screens-inquiry (165) | run-rules allowance rule (AI_RUN_BOUND_NO_ALLOWANCE, AI_RUN_PLAN_NO_SEARCH) | the rule retyped in the fake plane | unknown; run-rules is earlier (87), so its function can be called | B |

### ai-use (index 88)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `exploreAsksPending`, `limitsReached` | `{ok:true, asks:[]}`, `{ok:true, reached:[]}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### ai-runs (index 89)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-inquiry/assistant.test.mjs:25-45, 106-124, 185-230 (file read in full) | screens-inquiry (165) | ai-runs `airunopen`, `airundispatch`, `airun`, `airuns`, `airunlog`, `airunclose`; run-productions `suggest` | stub plane: `airunopen -> {run, started:true, status, ticks, untested}`, `airundispatch -> {run, found, dispatched, status, withheld?}`, `airun -> {found, session:{id,status,ticks,untested,condition}}`, `suggest -> {record:{name,description}}`; `openRule()` retypes run-rules' allowance rule | withheld names yes except as listed (ai-runs/index.mjs:2120-2135 raises AGENT_WORKER_UNBOUND, NAMESPACE_UNDETERMINED, CREDENTIAL_RECORD_SILENT, INSTANCE_AI_CREDENTIAL_NOT_ON_RECORD, INSTANCE_AI_CREDENTIAL_REVOKED, cred.reason); answer keys not compared; `suggest` success shape differs from agent-steps' derived mock (`wrote`) | A |
| 2 | bio-plane/test/m/action-plans/fixture.mjs:142-168 (range 85-182) | action-plans (135) | ai-runs `open`, `registerOpenCheck`, `onRunOpened`, `runFor`, `read`, `boundOf`, `consumeBound` | a working in-memory ai-runs; refusal `{run, started:false, code, check:"C-stub", translation:"stub", detail:null}` | the open's `{run, started, status}` shape matches assistant.test.mjs; `C-stub` is an invented check row | A |
| 3 | bio-plane/test/m/case-disclosures/fixture.mjs:147-153 (read in full) | case-disclosures (118) | ai-runs run gate registered with `contradiction.registerRunGate` | `refusal: {ok:false, reason:"AI_RUN_NOT_PRINCIPAL", code:"AI_RUN_NOT_PRINCIPAL"}` | code yes; no check or translation (the real gate's row is not compared) | A |
| 4 | bio-plane/test/m/queue/world.mjs:134; queue-producers/world.mjs:156 | queue (149) | ai-runs `runFor` | `runFor: () => null` | method exists; null yes | A |
| 5 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `reapDue/reapWake/reap`, `wakeDue/wakeWake/wake` | reap `{at, lapsed:0, reaped:[]}`; wake `{held:[], woken:[]}` | reap yes (ai-runs/index.mjs:1857-1866 returns `{at, lapsed, reaped}`); wake not compared | A |

### run-productions (index 90)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/agent-steps/test/plane-suggest.mjs:1-40 (range; 319 lines), plane-meaning.mjs:1-22, plane-versions.mjs:1-22, plane-capturerequest.mjs:1-22 (ranges) | agent-steps (99) | run-productions `suggest`, retrieval `meaningrows` / `search` / `versionchain`, capture-requests `capturerequest` | plane-mock branches DERIVED from the owners' constants (`SUGGEST_KINDS`, `SUGGEST_LEVELS`, `VERSION_NAME_RE`, `isBoilerplate`, `runPrincipalGate`, `isPublicHttpsLocator`, `MEANING`) and refusing by name in the plane's order; the headers record that the earlier mocks answered yes to anything | constants yes (imported); the branch order is retyped; checked against a deployed plane by the authors (VF-4, FL-12) but not by this audit | A |

### capture-requests (index 91)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:124; queue-producers/world.mjs:152; queue-producers/reads.test.mjs:223-242 | queue (149) | capture-requests `completed`, `leads`, `rendersHeld` | `{requests:[]}`; reads.test.mjs:225-226 builds lead rows `{request, run, target, lead_inquiry, address, host, purpose, ua_mode, capture_sha, captured_at, attribution}` | methods exist (capture-requests/index.mjs:1201 and siblings); rows not compared | A |
| 2 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `drainPending`, `drainIntervalMs`, `drain` | `{drained:0}` | unknown | A |

### question-explorer (index 94)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `exploreDue/Wake/Tick` | `{at, gate:"open", opened:[], asked:[], refused:0, considered:0}` | unknown | A |
| 2 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `findsFor` | `{ok:true, finds:[], truncated:false}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### answers (index 95)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `standingDue/Wake/Tick` | `{at, ran:[], remaining:0}` | unknown | A |
| 2 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `standingAnswersFor` | `{ok:true, entries:[], cursor:null}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### agent-worker (index 100)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/instance-setup/r8-parts-report.test.mjs:14-25; r9-parts-kept-outside-isolate.test.mjs:16-28 (both read in full) | instance-setup (151) | agent-worker / file-scanner binding answers to the fleet-version ask | `Response.json({name:"agent-worker", version:"1.0.0", runner:true})`, `{name:"file-scanner", version:"1.0.0"}`; `MEMBER_VERSIONS` in screens-settings/fixtures.mjs:397-404 states `SERVING/SILENT/MISNAMED/UNBOUND` | unknown: agent-worker's own answer (agent-worker/src/index.mjs) was not read | A |
| 2 | bio-plane/test/m/signin-door/door.test.mjs:39-47, 48-56 (file read in full) | signin-door (157) | agent-worker `POST /signin` and the store's routes (`aikeptaway`, `signindisclosuredue`, `accountreference`, `subscriptionconnected`, `signintokenhold`, `signintokenrefused`, `signintraceread`, `signintracekeep`, `subscriptiondisconnect`) | `agentWorker()` answers `{ok, address, attempt}` for start, `{ok, member}` otherwise, refusals `NOT_THIS_MEMBER`, `RUNNER_NOT_CONFIGURED`, `BAD_STEP`; `storeOf()` returns each route's result as `doAnswer`'s shape | RUNNER_NOT_CONFIGURED is asserted against the SIGNIN_WORDS key; the runner's real answers (agent-worker/src/signin.mjs) not compared; store route answers not compared with ai-accounts' (R18, R19) | A |

### intent (index 101)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:151; queue-producers/world.mjs:172 (read in full) | queue (149) | intent `gaps` | `{ok:true, gaps:[]}` | method exists (intent/index.mjs:675) | A |
| 2 | bio-plane/test/m/monitoring/fixture.mjs:322-338 `stubIntent` (range 300-381) | monitoring (137) | intent `watchSet`, `registerSource` | `watchSet` pages of two `{entities:[], progressions:[], captures, limit:2, truncated, cursor}`; `registerSource -> {ok:true}` | method exists (intent/index.mjs:700); answer keys not compared | A |
| 3 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `ageDue/ageWake/ageSurfaced`, `servesOf` | `{aged:[]}`; `{ok:true, serves:[], truncated:false}` | unknown; intent/discovery.test.mjs:222-223 asserts `ageSurfaced` also answers `refused` | A |

### investigation (index 102)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `milestonesOverdue`, `quietPrompts` | `{ok:true, due:[]}`, `{ok:true, prompts:[]}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### reevaluation (index 103)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-inquiry/fr5-document.test.mjs:31 (read in full) | screens-inquiry (165) | reevaluation / content `versionnotice` (content/index.mjs:1265) | `{ok, target, notices:[{ord, target, content_id, capture_sha, state:"newer_capture_matched", newer, affects, candidates, chains}], count, wrote:false}` | state name yes (content/index.mjs:1265); other keys unknown | A |
| 2 | bio-plane/test/m/queue/world.mjs:144-150; queue-producers/world.mjs:164-167 (read in full) | queue (149) | reevaluation `notices`, `correctedDependents`, `docketDependents`, `citedCaseDependents` | empty pages with `limit`, `truncated`, `cursor`, `count`, `wrote` | methods exist (reevaluation/index.mjs:1953, 2081); answers not compared | A |
| 3 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `noticeSweepDue/Wake/noticeSweep` | `{pending:false}` | unknown | A |
| 4 | bio-plane/test/m/reevaluation/caseparts.test.mjs:30 (line seen by grep) | reevaluation (103) | publication `parts` | `pub.ratified[c] \|\| {ok:false, reason:"NO_CASE_EDITION"}` | NO: in no source | A |

### corpus-export (index 105)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:141; queue-producers/world.mjs:163 | queue (149) | corpus-export `exportLog` | `{ok:true, exports:[], limit:200, truncated:false}` | method exists (corpus-export/index.mjs:217) | A |

### case-carriage (index 106)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/case-disclosures/fixture.mjs:308-348 `marksStandIn` (file read in full) | case-disclosures (118) | case-carriage `photoMarks`, `documentCopy` (R10, R16, R22) | stand-in with held photos `{ok, capture, photo, state, marks, copy, refused, obscured:{copy,label,marked,kind}}`, default `{state:"public", copy:null, refused:null}`; the same fixture composes the REAL case-carriage when `realCarriage` (:176-189) | unknown; checkable against the real arm in the same file | B |
| 2 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `copyWake`, `copyBatch`, `onCopyWork` | `{ok, copied, clean, public, refused, failed, remaining}` | unknown | A |

### publication (index 108)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:137; queue-producers/world.mjs:159 (read in full) | queue-producers (147) | publication `caseDocumentFacts` | `(c, e) => ({ok:false, reason:"NO_CASE_DOCUMENT", case:c, edition:e})` | method exists (publication/index.mjs); reason is the one publication/door.test.mjs:138 asserts | A |

### publish-schedule (index 109)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:139; queue-producers/world.mjs:160; scheduler/fixture.mjs:125-128 | queue (149) | publish-schedule `scheduledEditions`; `publishWake`, `publishDue` | `{ok:true, editions:[], limit:500, cursor:null}` | method exists (publish-schedule/index.mjs:113) | A |
| 2 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `publishWake`, `publishDue` | `{ok:true, taken:[]}` | method exists (publish-schedule/index.mjs:113 area); keys not compared | A |

### docket (index 110)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:171; queue-producers/world.mjs:183 (read in full) | queue (149) | docket `coreDue` | `{ok:true, items:[], count:0, wrote:false}` | method exists (docket/index.mjs:970) | A |

### network-notices (index 113)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:143; queue-producers/world.mjs:184 (read in full) | queue (149) | network-notices `noticesOf` | `{ok:true, notices:[]}` / `{ok, project, notices:[], sealed_weeks:[], methodVersion:1}` | method exists (network-notices/index.mjs:861) | A |
| 2 | bio-plane/test/m/ratification/fixture.mjs:220 (header 1-60 and grep of the file; not read in full) | ratification (115) | network-notices `openSeals` | "a stand-in: each call kept in `sealCalls`, answered by `w.openSeals`" | unknown | A |
| 3 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `sealDue/Wake/Tick`, `attestDue/Wake/Tick` | `{ok, sealed:[]}`; `{ok, monthly, missed, closed, lapsed, openings}` | unknown | A |

### case-checker (index 116)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/case-disclosures/fixture.mjs:156-168 (read in full) | case-disclosures (118) | case-checker `checkCaseFile` | `checkCaseFile: async () => ({format:"bio-case-file/1", case, edition, group, checker:{grading_versions, checks_version:"1.57.0"}, integrity, signatures, ..., findings})` scripted for the real case-import | unknown (case-checker 116 is earlier than case-disclosures 118; its real output not compared) | A |

### case-import (index 117)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:173 against queue-producers/world.mjs:168 (both read in full) | queue (149) | case-import `watchItems` (case-import/index.mjs:1947-1951) | queue/world.mjs answers `{ok:true, entries:[], refused:[], unreadable:[]}`; queue-producers/world.mjs answers `{entries, refused, unreadable}` | the second is the real shape (`empty = {entries, refused, unreadable}`, no `ok`); the first adds an `ok` the provider never answers | A |
| 2 | bio-plane/test/m/case-disclosures/fixture.mjs:370-417 `importsStandIn` (file read in full) | case-disclosures (118) | case-import `importedCase`, `acceptanceOf`, `openFlagsOn`, registration `finding`/`openFlags`/`withdrawals` | a full in-memory stand-in of the module's registration with the accepted-work seam (`registerAcceptedWork("case-import", imports.registration)`); the same file offers the REAL module when `realImports` (:157-168) | unknown; the real arm exists in the same fixture, so the stand-in is checkable against it | B |
| 3 | bio-plane/test/m/monitoring/fixture.mjs:359-381 `stubCaseImport` (range 300-381) | monitoring (137) | case-import `watchedImports`, `recordDocketRead` (case-import/index.mjs:1700, 1801) | pages of two in import order; `recordDocketRead` -> `{ok:true, outcome, new_entries, new_moves:0, new_refused:0}` or a configured refusal/throw | methods exist; answer keys not compared | A |

### case-authoring (index 121)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/case-authoring/documents.test.mjs:22; photos.test.mjs:29; rests.test.mjs:136 (lines seen by grep) | case-authoring (121) | case-carriage / image-cover / case-import answers | `{code:"PDF_ENCRYPTED", detail}`; `refused:{code:"FORMAT_NOT_COVERABLE", detail:"HEIC"}`; `{ok:false, reason:"NO_SUCH_IMPORT"}` | NO for all three (in no module source; the real image-cover/clean codes are not compared) | A |

### review (index 122)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/publication/door.test.mjs:142-150 (file read in full) | publication (108) | review (122) provider registered through `publication.registerReviewProvider` | `registerReviewProvider("review", {draftForMember: () => null, ..., grantAdmitsCaseEdition: (s,c,e) => grant.live && ...})` | review is LATER (122) than publication (108): the rule cannot be met as written | A* |
| 2 | bio-plane/test/m/notice-producers/fixture.mjs:42 (range 1-60) | notice-producers (148) | review `reviewCommentsLeftOut` | `{ok:true, items:[], undetermined:0, truncated:false}` | method exists (review/index.mjs); answer not compared | A |

### conformance (index 124)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/escalation/fixture.mjs:98-137 (range 90-215) | escalation (134) | conformance `determinationRead`, `determinationsFor`, `curesOf` | an in-memory ledger answering `{ok:true, ...determination, live}`, paged `{ok, items, cursor, truncated}` with sight rules, `NO_SUCH_DETERMINATION` | refusal code exists; answer shape not compared (conformance/index.mjs:1335) | A |
| 2 | bio-plane/test/m/action-plans/fixture.mjs:100-115 (range 85-182) | action-plans (135) | conformance `determinationRead`, `determinationsFor` | the same ledger retyped with `out_of_view` | as above | A |
| 3 | bio-plane/test/m/monitoring/fixture.mjs:203 | monitoring (137) | conformance `determinationRead`, `registerStep` | `determinationRead: () => ({ok:false, reason:"NO_SUCH_DETERMINATION"})`, `registerStep: () => ({ok:true})` | refusal code exists | A |

### consequences (index 125)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/escalation/fixture.mjs:140-157 (range) | escalation (134) | consequences `addressed`, `consequencesOf` (consequences/index.mjs:941, 1018) | `{state:"undetermined", parts:[], says}`; `{ok, determination, standard, parts, totals, undetermined, unproven, says}` | answer keys not compared | A |

### actions (index 128)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/escalation/fixture.mjs:158-205 (lines 162-165 are the refusals; range 90-215) | escalation (134) | actions `actionRead`, `actionsFor`, `actionFacts` (actions/index.mjs:2890-2915) | reimplemented from the record: refusals `NO_SUCH_BUNDLE` and `NOT_AN_ACTION`; ok answer `{ok, id, current_state, kind, resolution, reply_owed, correspondence, legs:[{target,kind}], premise_override, breach, counterparty, clock}` | NO for the refusals: the real read answers `NO_SUCH_ACTION` for an absent, unseen or non-action id (:2893-2894, action-records/index.mjs:104); ok answer has `title`, `project`, `state_history`, `law`, legs with `note`, `at`, `target_type`, `extent_capture` that the stand-in lacks | A |
| 2 | bio-plane/test/m/action-plans/fixture.mjs:170, 179-181 (range) | action-plans (135) | actions `actionRead` (wrapped) | the REAL `actionsOf` wrapped so a hidden action answers `{ok:false, reason:"NO_SUCH_BUNDLE", target}` | NO: the real refusal is `NO_SUCH_ACTION` | A |
| 3 | bio-plane/test/m/queue-producers/world.mjs:180 | queue-producers (147) | actions `place` | `({time_zone:{value:"UTC", status:"ruled", basis:"TEST"}})` | method exists (actions/index.mjs); shape not compared | A |
| 4 | bio-plane/test/m/affordances/door.test.mjs:66-77, 12-16 (file read in full) | affordances (143) | actions `actionkinds` (actions/index.mjs:3331), affordances store routes `affordancescreens`, `affordancevocab`, `affordancefacts` | store stub: `{answered:true, result:{kinds: KINDS}}` for `actionkinds`; `SCREENS`, `PROFILE` and `FACTS` literals; `{answered:false, correlation}` / `{refused:true, reason:"STORE_REFUSED"}` as the helpers' answers | `actionkinds`: the real answer is `{ok:true, kinds}` (the stub's lacks `ok`); screens come from screens modules and wizard-scripts (all LATER); `STORE_REFUSED` is the recorder's own word | A |

### action-holds (index 129)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:160-162 | queue (149) | action-holds `holdsDue`, `holdsReleased` | empties | methods exist (action-holds/index.mjs:720, 597) | A |

### filing-templates (index 132)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:179 | queue (149) | filing-templates `reviewsRequested` | `({limit}) => ({ok:true, items:[], limit: limit ?? 500, truncated:false, cursor:null})` | method exists (filing-templates/index.mjs:1328) | A |

### filings (index 133)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/escalation/fixture.mjs:209-215 (range) | escalation (134) | filings `filingsFor`, `availableActions` | `{ok, drafts:[{id,tier}], packets:[]}`; `{ok, kinds:[{kind, tier, words, counsel?}]}` | unknown (not compared) | A |
| 2 | bio-plane/test/m/action-plans/fixture.mjs:134 (range) | action-plans (135) | filings `availableActions` | `{ok:true, determination, kinds:[{kind:"complaint", tier:1}]}` | unknown (not compared); a third shape of the same answer (escalation adds `words`, `counsel`) | A |

### escalation (index 134)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/action-plans/fixture.mjs:123-133 (range) | action-plans (135) | escalation `escalationsFor`, `escalationRead` | `{ok, determination, items:[{id,state,stage}]}`; `NO_SUCH_ESCALATION` | refusal codes exist; shapes unknown | A |

### action-plans (index 135)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:168-169 | queue (149) | action-plans `checkpointsDue`, `plansToLookAgain` | empties | methods exist (action-plans/index.mjs:1968, 1674) | A |

### plan-work (index 136)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:166-167 | queue (149) | plan-work `planReviewsDue`, `takeUpsFor` | empties `{ok:true, items:[], limit:500, truncated:false}` | methods exist (plan-work/index.mjs:385, 967) | A |

### monitoring (index 137)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:152-154; queue-producers/world.mjs:173-175 | queue (149) | monitoring `monitoring`, `flagged`, `archiveEligible` | `{ok:true, items:[], truncated:false}`, `{ok:true, eligible:[], limit:50, truncated:false, paused:{paused:false}}` | methods exist (monitoring/index.mjs:2942, 2972) | A |
| 2 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `configured`, `archiveDue/Wake/Tick`, `cadenceDue/Wake/Tick`, `deadlineRecheckDue/Wake/deadlineRecheck` | archiveTick default `{configured, at, checked, epoch, eligible, fired, failed, skipped}` | partly: the real archiveTick answers also carry `paused` and, when busy, `busy:true` (monitoring/index.mjs:2142-2170) | A |

### following (index 138)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:165 (read in full) | queue (149) | following `watchQuestions` | `{ok:true, questions:[], truncated:false, cursor:null}` | method exists (following/index.mjs:1288) | A |
| 2 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `followDue/Wake/Tick` | `{configured, at, epoch, read, captured, unscheduled, member_act_required, failed, paused}` | method exists (following/index.mjs:593); keys not compared | A |
| 3 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `policyChanges`, `dutyWatchEndAt`, `watchedBy` | `{ok:true, changes:[], cursor:null}`, `null`, `{ok:true, watchers:[]}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### link-sweep (index 139)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:156; queue-producers/world.mjs:176 (read in full) | queue (149) | link-sweep `sweepConditions` | `{ok:true, conditions:[]}` | method exists (link-sweep/sweep.mjs:651) | A |
| 2 | bio-plane/test/m/monitoring/fixture.mjs:292-320 (range 196-215, 300-381) | monitoring (137) | link-sweep sweep grammar / `fence` / `dueForSlate` | a stand-in that re-implements the entry check (C-18.5 findings per extra key, id uniqueness, `SWEEP_TERM_REFUSED` for a lookahead) and `fence` -> `{ok:false, reason:"SWEEP_NOT_A_MEMBER", code, detail:"fenced by the stand-in"}` | the grammar is retyped; the detail is the stand-in's own wording | A |
| 3 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `sweepDue/Wake/Tick` | `{ran:[]}` | unknown | A |

### scheduler (index 140)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:184 | queue (149) | scheduler `arm`, `register` | `arm: async () => null`, `register: () => ({ok:true})` | unknown | A |

### wizard-scripts (index 141)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-wizards/fixtures.mjs:1-72 (file read in full) | screens-wizards (161) | wizard-scripts `wizards`, `wizardread`, `baseupdates`, `wizarddraft`, `wizardrevise`, `wizardsubmit`, `wizardapprove`, `wizardretire` | `CIV`/`COPY`/`SUBMITTED`/`RETIRED` script rows `{id, origin, name, scope, required, based_on, versions:[{id, version, state, author, contributors, approved, created_at, broken, use}]}`; `read()` -> `{ok, script, version:{id,state,steps}}` or `refuse("NO_SUCH_WIZARD")`; the library scripts are the REAL `CIVICSMITH_LIBRARY` entries | library ids/steps real; the rows and answers are typed (wizard-scripts/index.mjs:1496 and the declared ops not compared) | A |
| 2 | bio-plane/test/m/queue/world.mjs:175-176; queue-producers/world.mjs:169-171 | queue (149) | wizard-scripts `brokenScripts`, `submittedFor`, `baseUpdates` | `{ok:true, entries:[], cursor:null, truncated:false}` | methods exist (wizard-scripts/index.mjs:835, 1641, baseUpdates) | A |

### affordances (index 143)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:183 | queue (149) | affordances `affordanceFacts` | `affordanceFacts: () => ({ok:false})` | method exists (affordances/facts.mjs:368); the refusal has no reason | A |

### action-producers (index 146)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue-producers/world.mjs:182 | queue-producers (147) | action-producers `actionItems` | `({items:[], facts:{}})` | method exists (action-producers/index.mjs); action-producers (146) is earlier than queue-producers (147) | A |

### queue-producers (index 147)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue-producers/scheduled.test.mjs:62; contradictions.test.mjs:159 (lines seen) | queue-producers (147) | publication reasons | `{code:"SCHEDULED_SOURCE_CHANGED", translation}` | NO: in no source | A |

### notice-producers (index 148)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:182 | queue (149) | notice-producers `noticeItems` | `({items:[], facts:{}})` | method exists (notice-producers/index.mjs:281); the real module is composed by a test option (:73) | B |

### queue (index 149)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue-producers/world.mjs:8-10, 83-102, 136-141 (read in full); machinery-producers/world.mjs:1-12 and action-producers/world.mjs:1-14 (ranges) | queue-producers (147) | queue `homesOf`, `optionsOf` (queue R7, R12) | a walk up basis legs and `cites` edges through the viewer's gate, returning `{state:"determined", ungrouped, reasons, depth_bound:6, ancestors, of}`; `optionsOf` answers `[{id:"opt", on}]` and records what was asked | queue is LATER (149) than queue-producers (147), machinery-producers (145), action-producers (146): their fixtures retype the caller's side of queue's interface | A* |
| 2 | bio-plane/test/m/machinery-producers/world.mjs:1-12 and action-producers/world.mjs:1-14 (ranges); notice-producers/fixture.mjs:55-62 (range 1-60 and grep) | notice-producers (148) | queue `homesOf`, `optionsOf` | `homesOf: (s) => ({state:"determined", ungrouped:true, reasons:[], depth_bound:6, ancestors:[]})` recorded in `asked` | same: queue is later (149) than notice-producers (148) | A* |
| 3 | bio-plane/test/m/machinery-producers/world.mjs; action-producers/world.mjs (header ranges) | machinery-producers (145) | queue `homesOf`, `optionsOf` | copied from queue-producers' world (K1850) | queue later (149) | A* |
| 4 | bio-plane/test/m/action-producers/world.mjs (header range) | action-producers (146) | queue `homesOf`, `optionsOf` | copied from queue-producers' world (K624) | queue later (149) | A* |

### instance-setup (index 151)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-settings/fixtures.mjs:186, 236-266, 343-404 (file read in full): `bootstrap`, `selftest`, `runtime`, `updatenotice`, `translations`, `groupidentity`, `factstatus`, `profiles`, `hostingaccess`, `declaredstakeset` | screens-settings (162) | instance-setup ops | `bootstrap -> {ok, service, version:"0.83.0", part_signin, part_scanner, part_safe_view, installed_at, memberVersions?}` at the top level; `selftest`; `runtime` measured metrics | bootstrap flat keys yes per instance-setup/r8-parts-report.test.mjs:136-137 (`BOOTSTRAP_FACT_KEYS`, `BOOTSTRAP_VIEWER_KEYS`); the others unknown | A |
| 2 | bio-plane/test/m/newgroup/test/fixture.mjs:1-25, 530-592 (ranges; 648 lines) | installer (172) | instance-setup `instancegroup`, `instancegroupseed`, `selftest`, `bootstrap`, `bootstrapfacts` | the fake copy answers `instancegroup` `{ok, group}` flat or `{ok, result:{ok, group\|null, detail:"NO_GROUP_RECORDED"}}`, the seed refusal `{ok:false, result:{ok:false, code:"GROUP_ALREADY_RECORDED", group}}` or a configured code, `selftest {ok, bindings:{STORE:true}}`, `bootstrap {ok, version, storeVersion, memberVersions}` | NO for the absent group: the real answer is `{ok:true, group:null, recorded_at, source, recorded_by, detail: NO_GROUP_RECORDED}` where the constant is the SENTENCE (bio-plane/src/setup.mjs:895, 1147), not the code; `GROUP_ALREADY_RECORDED` is a real row (setup.mjs:269) with check and translation that the fake omits | A |

### op-declarations (index 153)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/interface-shell/harness.mjs:30-78, 86-99 (file read in full) | interface-shell (159) | op-declarations `DECLARED_OPS` (request side) and the frame's answers | REQUESTS are checked against the owners' declared `fields` (`declaredOpsOf`, R104): good; ANSWERS are `ok(result)`: any object. FRAME defaults typed: `whoami`, `queue` (3 items `{id, class}`), `groupidentity`, `infolevel`, `assistantstate`, `accountreference`, `subscriptionsignin`, `groupkeystate` | nothing checks an answer against its owner; whoami keys match control-plane/index.mjs:1333-1343 (rootOfTrust, confinedTo) | A* |
| 2 | bio-plane/test/m/screens-investigate/fixtures.mjs:41-164 (file read in full) | screens-investigate (166) | entities / people / lines / events / money / calculations / progressions / standards / explore ops (person, peopledirectory, samepersoncandidates, entity, explore, exploregraph, timeline, event, moneyset, money, calculation, spotcheck, partiesof, dutiesof, follows, proceedingdates, standard, lawrelations, standardproposals, instances, instance, progression, themeread, memberties) | `PERSON`, `DIRECTORY`, `WALK`, `GRAPH`, `TIMELINE`, `EVENT`, `FACTS`, `TRAIL`, `CALCULATION`, `SPOT`, `ENTITY`, `PARTIES`, `DUTIES`, `FOLLOWS`, `STANDARD`, `RELATIONS`, `TIES`, `MATTER`, `DEF`, `THEME` typed; `money` unknown id -> `{ok:false, reason:"NO_SUCH_FACT"}`; the comment says shapes were "surveyed on tranche/T47" | unknown (not compared op by op); `NO_SUCH_FACT` exists in source; the same file's seam test (`real-plane.mjs`, Miniflare over the deployed Worker) is the model | A |
| 3 | bio-plane/test/m/screens-publish/fixtures.mjs:24-137 (file read in full) | screens-publish (167) | review / case-inputs / case-authoring / case-check / case-tensions / case-carriage / ratification / publish-schedule / public-read / case-import / docket ops (reviewcopy, casedrafts, casecheck, casedocument, publishpreflight, publishtensions, photomarks, publish, caseratify, publishat, publishedcase, verify, importedcases, importedcase, docket, docketpublic, docketprepare, docketpost, casedetails, casedetailspublic, knock) | `COPY`, `PREFLIGHT`, `DOCUMENT`, `PUBLISHED_CASE`, `DETAILS`; `casedocument` answers `NO_CASE_DOCUMENT` until `publish` flips a closure flag; `publishedcase` answers `NOT_PUBLISHED`; `PREFLIGHT.first.code = "PHOTO_CHECK_UNWORDED"` (deliberately a code the word list lacks) | `PHOTO_CHECK_UNWORDED` exists in no source (an invented code by design); `NO_CASE_DOCUMENT` real (publication/door.test.mjs:138); `NOT_PUBLISHED` not compared; the shapes cite `casedocument`'s real answer in the fixture comment (:51-52) | A |
| 4 | bio-plane/test/m/screens-inquiry/fixtures.mjs:83-141 (file read in full) | screens-inquiry (165) | retrieval / project-roster / project-stage / hypotheses / connections / link-sweep / intent ops (list, projectstage, projectparticipants, projectquestions, projectaccountstate, projectdirectory, projectvisibility, projectownervotes, plans, partitionindependence, hypotheses, questionwaits, backlinks, themeread, captureprogressions, inquirypartition, groupidentity, projectstake, publishedlist, links, connections, reevaluationnotices, importedcases, transcriptions, memberlist) | literals per op, e.g. `projectstage -> {ok, project, stage:"investigating", questions:{read, with_legs, concluded}}`, `links -> {ok, links:[]}`; `links` in fr6-document.test.mjs:159 `{address, partition:"deferred", resolution:"offsite", verdict:null}` | unknown (not compared op by op) | A |

### answer-envelope (index 155)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/affordances/door.test.mjs:72-86 (file read in full) | affordances (143) | answer-envelope / control-plane `json`, `doAnswer`, `storeSilent`, `storeRefusal` | recorders: `json: (body, status) => ({body, status})`, `doAnswer: async (r) => r`, `storeSilent: (op, correlation) => ({silent: op, correlation})`, `storeRefusal: (out) => ({refusal: out})` | answer-envelope (155) and control-plane (169) are LATER than affordances (143) | A* |

### store-door (index 156)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/answer-envelope/envelope.test.mjs:25-35, 106-162, 164-195 (file read in full) | answer-envelope (155) | store-door `dispatch` replies (BAD_JSON, unknown op, STORE_INTERNAL_ERROR with correlation) | `reply({ok:false, reason:"BAD_JSON", detail}, 400)`, `{ok:false, error:"unknown op: nosuch"}`, `{ok:false, reason:"SOME_STORE_REASON", error}`, `{ok:false, reason:"STORE_INTERNAL_ERROR", correlation, error}` | BAD_JSON / unknown op / STORE_INTERNAL_ERROR: yes (store-door/dispatch.test.mjs:46-51, 378-381 shows the real ones); `SOME_STORE_REASON`, `WRONG_PASSWORD` are deliberate unknown-code controls (C); store-door is LATER (156) than answer-envelope (155) | A* |
| 2 | bio-plane/test/m/publication/door.test.mjs:17-31, 36-49 (file read in full) | publication (108) | store-door / control-plane helpers `doAnswer`, `storeSilent`, `storeRefusal`, `json` and the store's Durable Object `fetch` | retyped from `control-plane` R23, R25; a stub `fetch` serving the REAL `caseTensionsOps` and `publicationOps` (good) wrapped in `{ok:true, result}`; refusal `STORE_DID_NOT_ANSWER` built by the test | helpers: control-plane (169) and store-door (156) are LATER than publication (108); the real ops are used | A* |

### signin-door (index 157)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-settings/fixtures.mjs:182-184 | screens-settings (162) | signin-door / agent-worker `subscriptionsignin` | `start -> {ok, address}`, `state -> {ok, connected, member}`, other -> `{ok, connected:true, member}` | unknown (agent-worker answer in signin-door/door.test.mjs:39-46 is a third copy: `{ok, address, attempt}` / `{ok, member}`) | A |

### interface-shell (index 159)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-wizards/standin.mjs:73-153 (file read in full) | screens-wizards (161) | interface-shell `cs` kit and route | `standIn()` rebuilds `cs.call/set/go/ring/fieldOf/fill/value/kept/keep/act/field/choice`, `enter`, `start`, `control`, `pressed`, `ring`, `render`; header: tested "before the shell's half lands" | interface-shell (159) is earlier than screens-wizards (161): the shell's real kit is what `harness.mjs` boots | A |

### screens-entry (index 160)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-entry/setup.test.mjs:542, 573 (lines seen by grep; file not read) | screens-entry (160) | membership `memberadd`, instance-setup `courtnoticeset` refusals | `{ok:false, code:"MEMBER_EXISTS"}`, `{ok:false, code:"NOT_ALLOWED"}` | NO for both codes (in no module source) | A |

### screens-settings (index 162)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-settings/teamai.test.mjs:63; security.test.mjs (SOME_NEW_CODE) (lines seen by grep) | screens-settings (162) | credentials `groupkeyset` refusal | `{ok:false, reason:"KEY_REFUSED", code:"KEY_REFUSED"}`; `SOME_NEW_CODE` as an unknown-code control | KEY_REFUSED: NO (in no source); SOME_NEW_CODE: deliberate control (C) | A |

### screens-intake (index 163)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-intake/archive.test.mjs:17 (line seen by grep) | screens-intake (163) | provenance / acquisition unpack file row | `E(6, "not_filed", {name, code:"ZIP_ENCRYPTED", check:"C-1", translation})` | NO: `ZIP_ENCRYPTED` is in no source | A |

### screens-inquiry (index 165)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-intake/page.mjs:24-26 (file read in full) | screens-intake (163) | screens-inquiry `document` screen | `DOCUMENT_STUB = {id:"document", reads: () => ({}), render: () => "", acts: [], words: []}` | screens-inquiry (165) is LATER than screens-intake (163); imported by 27 of the 42 screens-intake test files (grep) | A* |

### screens-action (index 168)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-action/start-send.test.mjs:24; actionnew-fix.test.mjs:21 (lines seen by grep) | screens-action (168) | actions / hypotheses refusals | `BREACH_ON_HYPOTHESIS` (with a typed translation), `LEG_ON_ACTION` finding | NO for both (in no module source) | A |

### control-plane (index 169)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/instance-setup/fixture.mjs:148-203 (file read in full) | instance-setup (151) | control-plane `doAnswer`, `storeSilent`, `storeRefusal`, store-door frame | copied by hand: `doAnswer` (the same code as publication/door.test.mjs), `io`, `frame()` (empty body = null, non-JSON = 400 BAD_JSON, throw = 500 STORE_INTERNAL_ERROR with a uuid); the header says control-plane "comes after this module in the order" | yes by comparison with store-door/dispatch.test.mjs:39-51, 378-381; a third copy of the same helper (after publication/door.test.mjs and answer-envelope's own) | A* |
| 2 | bio-plane/test/m/public-read/g54-attempt.test.mjs:17-22 (file read in full) | public-read (111) | control-plane helpers bound into `bindPublishedPlane` | `doAnswer` reduced to `{answered:true, result}` / `{answered:false}`, `storeSilent`, `requiredArgument`, `json` retyped; the rest of the file drives the real publication, store and bucket shape (good) | control-plane/answer-envelope are LATER than public-read (111) | A* |
## Summary

### Published fixtures each provider would need (additions to part 1's list)

- **membership**: `existenceFixture(project, viewer)` (the C-70.1 answer, with `check`), `membershipWithAdmins(ids)` (part 1).
- **member-roster**: use `Members.adminMath` directly; `rosterRows()` for `memberlist`.
- **credentials / ai-accounts**: `keptAwayRefusal({reason,set_by,set_at})` and `disclosureDueRefusal()` made from the real rows; account-state answers (`accountreference`, `accountuses`, `ailimits`, `aiusage`, `aiuseovertime`, `accounthistory`); signer rows.
- **promotion**: `stepRegistry()` (part 1) with the real `STEP_DECLARED` refusal; `refusedPromote(reason)` that accepts only reasons promotion raises (`CAS_STALE` and the rest), so no test can invent `BASE_MOVED`.
- **provenance / capture / acquisition**: `homeOfRow(...)` and `provenanceDocument(bytes)` (part 1); `heldCapturesAnswer(rows)` (key `held`), `heldAtAnswer`, `emptyCaptureProvider()` (the nine empty methods queue, queue-producers and notice-producers each retype); `supportingFacts({...})` made by `supportingOf`.
- **extraction**: `readingAnswer({units, completeness, more, next, repairable})` made by the real reader, with extent kinds limited to the closed list (part 1's `readHeldAnswers` goes with it).
- **strength / basis-versions / citation / reevaluation**: `strengthAnswer`, `basisVersionsAnswer`, `citeRefusalWithRepairs`, `versionNotice`, and the empty pages queue and queue-producers retype.
- **ai-runs / run-rules / run-productions**: `openAnswer`, `dispatchAnswer({withheld})`, `runGate(runs)`, `aiRunsWorld()` (the in-memory ai-runs three fixtures rebuild); export run-rules' allowance rule as a function.
- **conformance / consequences / actions / filings / escalation / standards**: `determinationLedger()`, `actionReadFor(id)` (with `NO_SUCH_ACTION`), `availableActionsAnswer()`, `escalationsFor()`: the stand-ins escalation and action-plans rebuild with their own sight rules.
- **case-import / case-checker / case-carriage / bias / retrieval**: `importsWorld()` and `photoMarksWorld()` (already available as real twins in case-disclosures/fixture.mjs), `lensManifest()`, `selectionResolveRefusal()` (with its translation).
- **instance-setup**: `bootstrapAnswer`, `instanceGroupAnswer` (absent and recorded), `groupAlreadyRecordedRefusal`, `selftestAnswer`, `memberVersions`.
- **queue (A\*)**: `homesOfFor(viewer)` and `optionsOf` recorder, published by queue for its four earlier users; needs a ruling (contract fixture run by queue's tests, as part 1 proposed for the registrar).
- **control-plane / store-door / answer-envelope (A\*)**: one `doorHelpers` contract (`doAnswer`, `storeSilent`, `storeRefusal`, `json`, `frame`) that the three later modules run against their real code; the five hand-typed copies then import it.
- **interface-shell**: its `cs` kit as a fixture (screens-wizards/standin.mjs rebuilds it) and the frame defaults.
- **scheduler's providers**: one `{due, wake, tick}` facet per owner (22 owners), made by running each owner's real methods on an empty world.
- **screens' op owners (screens-investigate and screens-publish)**: op-by-op answer fixtures per owner (entities, people, lines, events, money, calculations, progressions, standards, explore; review, case-inputs, case-authoring, ratification, public-read, docket).

### Rows by user module (A, A*, B, C)

| user module | A | A* | B | C | total |
|---|---|---|---|---|---|
| hypotheses (80) | 1 | 0 | 0 | 0 | 1 |
| basis-versions (84) | 1 | 0 | 0 | 0 | 1 |
| agent-steps (99) | 1 | 0 | 0 | 0 | 1 |
| intent (101) | 1 | 0 | 0 | 0 | 1 |
| reevaluation (103) | 2 | 0 | 0 | 0 | 2 |
| publication (108) | 0 | 2 | 0 | 0 | 2 |
| public-read (111) | 0 | 1 | 0 | 0 | 1 |
| ratification (115) | 3 | 0 | 0 | 0 | 3 |
| case-disclosures (118) | 5 | 0 | 2 | 0 | 7 |
| case-authoring (121) | 1 | 0 | 0 | 0 | 1 |
| escalation (134) | 4 | 0 | 0 | 0 | 4 |
| action-plans (135) | 7 | 0 | 0 | 0 | 7 |
| monitoring (137) | 5 | 0 | 0 | 0 | 5 |
| scheduler (140) | 24 | 0 | 0 | 0 | 24 |
| affordances (143) | 1 | 1 | 0 | 0 | 2 |
| machinery-producers (145) | 0 | 1 | 0 | 0 | 1 |
| action-producers (146) | 0 | 1 | 0 | 0 | 1 |
| queue-producers (147) | 8 | 1 | 0 | 0 | 9 |
| notice-producers (148) | 18 | 1 | 1 | 0 | 20 |
| queue (149) | 25 | 0 | 2 | 0 | 27 |
| instance-setup (151) | 2 | 1 | 4 | 0 | 7 |
| answer-envelope (155) | 0 | 1 | 0 | 0 | 1 |
| store-door (156) | 2 | 0 | 0 | 1 | 3 |
| signin-door (157) | 2 | 0 | 0 | 0 | 2 |
| interface-shell (159) | 0 | 1 | 0 | 0 | 1 |
| screens-entry (160) | 1 | 0 | 0 | 0 | 1 |
| screens-wizards (161) | 2 | 0 | 0 | 0 | 2 |
| screens-settings (162) | 9 | 0 | 1 | 0 | 10 |
| screens-intake (163) | 4 | 1 | 0 | 0 | 5 |
| screens-inquiry (165) | 12 | 0 | 1 | 0 | 13 |
| screens-investigate (166) | 2 | 0 | 0 | 0 | 2 |
| screens-publish (167) | 1 | 0 | 0 | 0 | 1 |
| screens-action (168) | 1 | 0 | 0 | 0 | 1 |
| installer (172) | 1 | 0 | 0 | 0 | 1 |
| **all** | 146 | 12 | 11 | 1 | 170 |

Of the 170 rows: 146 A (a provider fixture made by its real code, re-pointed with judgment), 12 A* (provider later than user), 11 B (a real provider function or fixture exists now), 1 C. A, B and A* rows are all rows the rule forbids as written. The counts are of rows (seams) in the files named; the real total is much higher (see the census).

### Hand-built refusal codes found in no module source (mechanical scan, 74 codes)

Rows above cover those I could read. By name, the rest are mostly deliberate unknown-code controls (`SOMETHING_ELSE`, `SOME_REFUSAL`, `NO_SUCH_DOOR_CODE`, `ZZ_REASON`, `NOPE`, `TEST_REFUSED`, and similar) and need no fixture, but a reader should confirm each before calling it a control.

| code | uses | module(s) | file(s) (up to 3) |
|---|---|---|---|
| ACCOUNT_MALFORMED | 2 | case-disclosures | case-disclosures/account.test.mjs, case-disclosures/seam.test.mjs |
| AI_LOG_REFUSED | 1 | agent-steps | agent-steps/test/interface.test.mjs |
| BASE_MISMATCH | 2 | monitoring | monitoring/docket.test.mjs, monitoring/tick.test.mjs |
| BASE_MOVED | 3 | monitoring | monitoring/understanding.test.mjs |
| BREACH_ON_HYPOTHESIS | 2 | screens-action | screens-action/start-send.test.mjs |
| CALLER_REFUSED | 5 | ai-runs, publication | ai-runs/producers.test.mjs, ai-runs/transact.test.mjs, ai-runs/usage.test.mjs |
| CALLER_ROLLED_BACK | 1 | inquiry | inquiry/raise.test.mjs |
| CODE_NO_ONE_HAS_A_WORD_FOR | 1 | screens-action | screens-action/plan.test.mjs |
| DOCUMENT_COPY_UNWORDED | 1 | screens-publish | screens-publish/ceremony.test.mjs |
| FORMAT_NOT_COVERABLE | 2 | case-authoring | case-authoring/photos.test.mjs |
| HELD_ELSEWHERE | 1 | intent | intent/discovery.test.mjs |
| HTTP_404 | 2 | intent | intent/pursuits.test.mjs |
| INNER_REFUSED | 1 | reevaluation | reevaluation/raise.test.mjs |
| KEY_REFUSED | 2 | screens-settings | screens-settings/teamai.test.mjs |
| LATE_REFUSAL | 1 | ai-runs | ai-runs/surfacing.test.mjs |
| LEG_ON_ACTION | 1 | screens-action | screens-action/actionnew-fix.test.mjs |
| LIMIT_OUT_OF_RANGE | 2 | public-read | public-read/public-reads.test.mjs |
| MACHINE_CANNOT_ALPHA | 1 | skills | skills/pack.test.mjs |
| MACHINE_CANNOT_MID | 1 | skills | skills/pack.test.mjs |
| MACHINE_CANNOT_MOVED | 1 | skills | skills/pack.test.mjs |
| MACHINE_CANNOT_ZED | 1 | skills | skills/pack.test.mjs |
| MACHINE_PASSAGE_NOT_TAKEN_UP | 1 | basis-versions | basis-versions/own-reading.test.mjs |
| MEMBER_EXISTS | 1 | screens-entry | screens-entry/setup.test.mjs |
| NOPE | 2 | interface-shell | interface-shell/p9.test.mjs |
| NOT_ALLOWED | 1 | screens-entry | screens-entry/setup.test.mjs |
| NOT_FOR_YOU | 2 | agent-steps | agent-steps/test/interface.test.mjs |
| NOT_IN_THESE_TESTS | 1 | question-explorer | question-explorer/fixture.mjs |
| NO_CASE_EDITION | 1 | reevaluation | reevaluation/caseparts.test.mjs |
| NO_PROFILES | 1 | answers | answers/words.test.mjs |
| NO_ROW_FOR_THIS_CODE | 2 | answer-envelope | answer-envelope/envelope.test.mjs |
| NO_SUCH_DOOR_CODE | 4 | screens-inquiry | screens-inquiry/assistant.test.mjs |
| NO_SUCH_ENTRY | 1 | plan-work | plan-work/fixture.mjs |
| NO_SUCH_IMPORT | 2 | case-authoring, case-disclosures | case-authoring/rests.test.mjs, case-disclosures/imported.test.mjs |
| NO_SUCH_KEY_HELD | 1 | screens-inquiry | screens-inquiry/fr2-question.test.mjs |
| NO_SUCH_READING | 1 | journey-check | journey-check/walker.test.mjs |
| NO_WORDS_FOR_THIS_CODE | 1 | screens-publish | screens-publish/review.test.mjs |
| NO_WORD_NO_TRANSLATION | 1 | screens-intake | screens-intake/capture.test.mjs |
| ONLY_A_REASON | 1 | run-productions | run-productions/suggest.test.mjs |
| OUTER_REFUSES | 1 | money | money/g55-view.test.mjs |
| OVERLOADED | 1 | connections | connections/converts-links.test.mjs |
| PDF_ENCRYPTED | 2 | case-authoring | case-authoring/copy-now.test.mjs, case-authoring/documents.test.mjs |
| PERSON_NO_PUBLIC_ROLE | 2 | hypotheses | hypotheses/t41.test.mjs |
| PHOTO_CHECK_UNWORDED | 2 | screens-publish | screens-publish/fixtures.mjs |
| PLAN_NOT_AFTER_RESPONSE | 1 | ai-runs | ai-runs/reexam.test.mjs |
| PROBE_REFUSED | 3 | store-door | store-door/promotion-step.test.mjs |
| PROFILES_DISAGREE | 4 | ratification | ratification/r7-publish-at.test.mjs |
| PROJECT_NOT_PARTICIPANT | 1 | queue-producers | queue-producers/contradictions.test.mjs |
| PROMOTE_REFUSED_HERE | 2 | store-door | store-door/pull.test.mjs |
| PROVIDER_DOWN | 1 | ai-runs | ai-runs/r085.test.mjs |
| REGISTRATION_CLOSED | 1 | scheduler | scheduler/g55-ingest.test.mjs |
| ROLLED_BACK | 1 | reevaluation | reevaluation/raise.test.mjs |
| SCHEDULED_SOURCE_CHANGED | 2 | queue-producers | queue-producers/scheduled.test.mjs |
| SOMEONE_ELSES | 3 | action-plans, case-import | action-plans/words.test.mjs, case-import/flags.test.mjs |
| SOMETHING_ELSE | 6 | public-read, reevaluation, screens-inquiry, screens-intake | public-read/g54-attempt.test.mjs, reevaluation/raise.test.mjs, screens-inquiry/b22-question.test.mjs |
| SOMETHING_NEW | 4 | affordances, screens-intake | affordances/catalogue.test.mjs, affordances/t33.test.mjs, screens-intake/r67-supporting-reasons.test.mjs |
| SOME_NEW_CODE | 2 | screens-settings | screens-settings/security.test.mjs |
| SOME_REFUSAL | 2 | queue-producers | queue-producers/reads.test.mjs |
| SOME_STEP_REFUSED | 2 | citation | citation/draw.test.mjs |
| SOME_STORE_REASON | 1 | answer-envelope | answer-envelope/envelope.test.mjs |
| STALE_BASE | 4 | ratification | ratification/release.test.mjs, ratification/retire.test.mjs |
| STANDARD_DEPARTED | 1 | screens-publish | screens-publish/t50.test.mjs |
| STEP_GONE | 1 | queue | queue/watched.test.mjs |
| STORE_BUSY | 2 | public-read | public-read/docket.test.mjs |
| STORE_REFUSED | 3 | affordances | affordances/door.test.mjs |
| SUGGEST_REFUSED_FOR_TEST | 2 | agent-steps | agent-steps/test/r107.test.mjs |
| TEST_REFUSED | 4 | contradiction | contradiction/acts.test.mjs |
| THE_OUTER_ACT_REFUSED | 1 | answers | answers/endset.test.mjs |
| UNEXPECTED | 1 | public-read | public-read/relay.test.mjs |
| VERIFY_NOT_RUN | 1 | screens-publish | screens-publish/public.test.mjs |
| VERSION_REFUSED_HERE | 1 | reevaluation | reevaluation/sweep.test.mjs |
| WRONG_PASSWORD | 1 | answer-envelope | answer-envelope/envelope.test.mjs |
| ZIP_ENCRYPTED | 1 | screens-intake | screens-intake/archive.test.mjs |
| ZZ_REASON | 1 | interface-shell | interface-shell/t50.test.mjs |
| ZZ_STOP | 1 | interface-shell | interface-shell/t50.test.mjs |

### Census of what was not read (grep counts, NOT findings)

Files per module that name a stand-in word (stub, fake, mock, double, canned, stand-in, scripted) or one of registerJob, readHeld, armJobs, keepLater, owedLater, largest first (module (index): files, lines, files naming a stand-in word, `ok:` literals, reason/why/code literals). The words also match the platform ("double", "fake clock"), so the numbers over-count: screens-inquiry (165): 57, 16,287, 54, 768, 212; public-read (111): 60, 11,116, 46, 165, 130; screens-intake (163): 43, 6,553, 15, 527, 155; agent-worker (100): 36, 13,511, 25, 234, 132; screens-investigate (166): 25, 9,433, 20, 249, 110; queue (149): 36, 6,145, 28, 86, 117; ratification (115): 34, 8,517, 25, 126, 84; screens-settings (162): 27, 5,670, 11, 336, 103; queue-producers (147): 26, 4,414, 19, 194, 66; screens-daily (164): 34, 11,132, 9, 341, 69; instance-setup (151): 29, 5,827, 20, 133, 60; installer (172): 27, 9,828, 18, 89, 24; interface-shell (159): 41, 7,977, 17, 90, 28; screens-entry (160): 8, 2,123, 5, 278, 36; notice-producers (148): 17, 3,342, 10, 148, 29; agent-runner (98): 19, 2,482, 17, 21, 0; publication (108): 33, 5,924, 14, 65, 67; agent-steps (99): 17, 3,067, 12, 97, 45; scheduler (140): 21, 3,987, 11, 109, 12; case-authoring (121): 42, 7,748, 11, 90, 94; journey-check (175): 26, 2,522, 12, 64, 19; screens-publish (167): 28, 5,110, 11, 79, 141; affordances (143): 30, 7,549, 12, 56, 169; monitoring (137): 19, 5,397, 8, 117, 81; case-disclosures (118): 15, 4,085, 9, 87, 74; screens-wizards (161): 13, 1,981, 7, 114, 85; screens-action (168): 33, 5,189, 7, 108, 228; reevaluation (103): 23, 4,947, 10, 37, 50; action-producers (146): 9, 1,802, 7, 80, 23; inquiry (79): 34, 5,647, 7, 35, 110; installer-steps (171): 10, 2,691, 7, 28, 18; following (138): 14, 3,192, 4, 67, 29; answer-envelope (155): 7, 2,568, 2, 100, 55.

Likeliest places for more rows, in my judgment: the 41 other files of screens-inquiry (the scripted-plane tests: 54 of 57 files), the 30 other screens-intake files (including r67-supporting-reasons.test.mjs and r8-supporting.test.mjs, which type the supporting-files reasons), screens-daily (34 files, no fixture read), screens-entry/setup.test.mjs (746 lines, 102 `ok:` literals, invented codes MEMBER_EXISTS and NOT_ALLOWED), screens-action (30 files; `reads-t51`, `plan`, `matter-t51`, `request` type the ops of the Action layer), the agent-worker and agent-runner suites (platform/model fakes: likely class C, not read), public-read (60 files; only g54-attempt read), ratification (34 files; fixture read only to line 60), and the plane-mock sources agent-steps inject as text.

### Lines seen by grep only (no row, no claim beyond the line)

store-door/promotion-step.test.mjs:131 (`PROBE_REFUSED`, a provenance listener refusal; class C, one row above), plan-work/fixture.mjs:34 (`NO_SUCH_ENTRY` for a docket pressure read), ratification/r7-publish-at.test.mjs:45 (one row above), screens-publish/t50.test.mjs:117 (`STANDARD_DEPARTED`), screens-publish/review.test.mjs and ceremony.test.mjs (`NO_WORDS_FOR_THIS_CODE`, `DOCUMENT_COPY_UNWORDED`: unworded-code controls), screens-settings/security.test.mjs (`SOME_NEW_CODE`), ai-runs/reexam.test.mjs:111 (`PLAN_NOT_AFTER_RESPONSE`, `C-0.0`), ai-runs/r085.test.mjs:99 (`PROVIDER_DOWN`), public-read/docket.test.mjs:221 (`STORE_BUSY`), public-read/public-reads.test.mjs:192 (`LIMIT_OUT_OF_RANGE`), queue/watched.test.mjs:38 (`STEP_GONE` with check C-131.1), intent/pursuits.test.mjs (`HTTP_404`), answers/words.test.mjs:40 (`NO_PROFILES`), journey-check/walker.test.mjs:156 (`NO_SUCH_READING`).
