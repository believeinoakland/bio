> **Split K5021.** Part of `audit-fixtures-part5-L5plus.md`, split by section; contains the tables by provider module, member-roster to agent-worker (index 35 to 100). The rest: the header, the findings for BOB and the Summary (with its lists): `audit-fixtures-part5-L5plus.md`; the tables by provider module, intent to control-plane (index 101 to 169): `audit-fixtures-part5-L5plus-tables-b.md`.

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

