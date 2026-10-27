# Fixture round, plan part 2

Slice fx-part-2: findings read 405; FIX-E 135 (mechanical 31, judgment 104), FIX-L 136, FALSE 104, CODE 30; sum 405. Paths in the Users section are relative to the user's test dir (bio-plane/test/m/<user>/ or <user>/test/); `#n` marks a file:line the check lists more than once.

## Providers

FIX-E fixtures are published by the provider (real code at run time); FIX-L contracts need a provider test carrying `// fixtures-run: <user> <id>`.

### pdf-reader
- fixture `notAPdf` (FIX-E): extractPdfStructure(new TextEncoder().encode("not a pdf")) -> {ok:false, container:"pdf", reason:"NOT_A_PDF"}. Users: extraction 3; 3 findings.

### ocr-worker
- fixture `memberRefusal` (FIX-E): the real ocr-worker member (src/member.mjs) answering an image it declines: PAGE_NOT_LEGIBLE, PIXELS_UNREADABLE (final decline), ENGINE_FAILED, UNEXPECTED_FAILURE; "busy" and "UNREADABLE" are in no ocr-worker file. Users: extraction 3; 3 findings.

### sheet-worker
- fixture `recomputeNotEnabled` (FIX-E): the sheet-worker member (src/member.mjs) handling a recompute request with SHEET_RECOMPUTE unset -> {ok:false, reason:"NOT_ENABLED"}. Users: workbooks 1; 1 finding.
- fixture `recomputeEngineFailed` (FIX-E): the member given a workbook its engine refuses -> ENGINE_FAILED with its detail. Users: workbooks 1; 1 finding.

### ai-accounts
- fixture `accountsServing` (FIX-E): a real ai-accounts (as ai-accounts/fixture.mjs world()) with an API key referenced for the member; `accountFor({member, act})` is the service; the member and key are parameters. Users: extraction 10, answers 2; 12 findings.
- fixture `keptAwayProject` (FIX-E): the project keep-away set (R22) -> PROJECT_AI_KEPT_AWAY (C-29.38). Users: extraction 4; 4 findings.
- fixture `keptAwayGroup` (FIX-E): aiKeptAway / accountFor with the group keep-away setting on -> AI_KEPT_AWAY (C-29.31), keep_away {reason,set_by,set_at}. Users: extraction 1, answers 2; 3 findings.
- fixture `noAccount` (FIX-E): accountFor for a member with no reference and no sign-in -> NO_ACCOUNT. Users: extraction 1, answers 2; 3 findings.
- fixture `keptAwayUnreadable` (FIX-E): the keep-away setting unreadable (R34) -> AI_KEPT_AWAY with keep_away {null,null,null} and detail. Users: extraction 1, answers 1; 2 findings.
- fixture `switchedOff` (FIX-E): accountFor with the member (own) or group switch off (R11) -> AI_USE_SWITCHED_OFF {whose, use}. Users: answers 1; 1 finding.

### credentials
- fixture `aiRunMintRefusedNotParticipant` (FIX-E): aiRunCredentialMint({project, run, ...}) for a member who left the project -> PROJECT_ACT_NOT_A_PARTICIPANT. Users: ai-runs 1; 1 finding.

### promotion
- fixture `makePromotion` (FIX-E): already published (promotion/fixtures.mjs); add `promotionOver({record, membership, host})` so a test keeps its own record, and a readback of registered steps (`registeredSteps(p)`) that returns what registerStep accepted; real registerStep refusal STEP_DECLARED on a second registration. Users: extraction 1, entities 1, events 1, lines 1, progressions 1, money 1, strength 1; 7 findings.
- fixture `oversizeInlineRefusal` (FIX-E): promote() of a package with an inline file over the inline bound -> {ok:false, reason:"OVERSIZE_INLINE"}. Users: inquiry 1; 1 finding.
- fixture `staleBaseRefusal` (FIX-E): already published (promotion/fixtures.mjs staleBaseRefusal()); no new work. Users: strength 1; 1 finding.

### provenance
- fixture `registeredHomes` (FIX-E): real provenance (provenance/fixture.mjs world()) with captures registered by really promoting a bundle with a register document (w.promoteInfo); returns {provenance, register(sha, {bundleId,path,...})}; `provenance.homeOf` and `onTestimony` are the real ones; an empty one is the same with nothing registered. Needs to accept the user's own record/membership/promotion (extraction fresh() builds its own) via `provenanceOver({record, membership, promotion})`. Users: extraction 20, content 2, progressions 1, retrieval-browse 1, calculations 1, intent 2; 27 findings.
- fixture `versionChainNoSuchVersion` (FIX-E): versionChain({addressNorm, at}) for an address with no such version -> VERSION_CHAIN_NO_SUCH_VERSION (C-24.2). Users: agent-steps 1; 1 finding.
- fixture `onReceiptRefusals` (FIX-E): onReceipt(module, fn) with a malformed fn / a second registration -> LISTENER_MALFORMED / LISTENER_DECLARED, and a registration that throws. Users: case-carriage 1; 1 finding.

### acquisition
- fixture `keyedServiceOff` (FIX-E): citationLookup(store without a held key, {text}) -> {ok:false, reason:"KEYED_SERVICE_OFF", code, service}. Users: law-relations 2, standards 1; 3 findings.
- fixture `notHeldRange` (FIX-E): readRange(store holding nothing, sha, 0, n) -> {ok:false, reason:"NOT_HELD"}. Users: content 1; 1 finding.

### capture
- fixture `heldActsUnreadable` (FIX-E): heldActsOf(question) over a store it cannot read -> {ok:false, reason:"HELD_ACTS_UNREADABLE", acts:null}. Users: inquiry 2; 2 findings.
- fixture `storageNotConfigured` (FIX-E): acquire() with no evidence store -> EVIDENCE_STORAGE_NOT_CONFIGURED (503). Users: extraction 1; 1 finding.
- fixture `evidenceNotHeld` (FIX-E): the capture op for an unheld digest -> EVIDENCE_NOT_HELD. Users: extraction 1; 1 finding.
- fixture `captureArm` (FIX-E): a real capture (captureOf) over a real record with a scripted fetch and evidence store: acquire(body, opts), registerReader(slot, module, fn); calls recorded. Users: capture-requests 1; 1 finding.
- fixture `acquireRefusal` (FIX-E): acquire() refused with a render-deferral code and render state, by code (status 409). Users: capture-requests 1; 1 finding.

### extraction
- fixture `unheldStructure` (FIX-E): extraction.pdfStructure({sha}) of an unheld digest -> its real {status, body:{ok:false,...}}. Users: connections 1; 1 finding.
- fixture `extractionNotice` (FIX-E): a real extraction's onReading / onIndexed registry (R24, R62): one listener per module, LISTENER_DECLARED on a repeat; `fire`. Users: observation-log 1; 1 finding.
- fixture `progressOf` (FIX-E): extraction.progressOf(shas) (R108) over a seeded store: state none/partial/whole, read_through, total, owed. Users: retrieval 1; 1 finding.

### entities
- fixture `namingInRefused` (FIX-E): entities.namingIn({captureShas, kinds}) with an input it refuses (bad kinds or over the cap) -> its real refusal. Users: retrieval-browse 2; 2 findings.

### events
- fixture `recordedByMalformedExtent` (FIX-E): events.recordedBy({extent: malformed}) -> EXTENT_MALFORMED. Users: retrieval-browse 1; 1 finding.
- fixture `usesOf` (FIX-E): events usesOf (src/events/uses.mjs) over a seeded events world (record a use of kind discretion/waiver/assessment with provision, decider, subject); usesOf({kinds:["x"]}) -> KIND_NOT_DISCRETION. Users: calculations 1; 1 finding.

### standards
- fixture `standardRead` (FIX-E): standards.standardRead({id, viewer}) over a seeded standards world (a standard with cite, issuer, designation, edition, access, requires, texts); NO_SUCH_STANDARD for an absent or unseen id (R17). Users: capture-requests 1, publication 4, public-read 1; 6 findings.
- contract `host-refusals` (FIX-L): the ten refusals law-relations' host mints: each code with {ok:false, reason, code, host:true, detail, ...fields}. Users: law-relations 1; 1 finding.

### duties
- fixture `occurrencesOf` (FIX-E): duties.occurrencesOf({dutyId, asOf}) over a seeded duty with occurrences (met / undetermined); NO_SUCH_DUTY otherwise. Users: inquiry 1; 1 finding.

### retrieval-browse
- fixture `findInCaptureNotHeld` (FIX-E): findIn({scope:{capture: unheld sha}, kinds}) -> CAPTURE_NOT_HELD. Users: answers 1; 1 finding.

### retrieval
- fixture `selectionResolve` (FIX-E): a real retrieval (retrievalOf) with selectionCreate({owner, ids}) and selectionResolve({handle, viewer, owner, weight}) -> NO_SUCH_SELECTION, NOT_YOURS, SET_MOVED (weight "refuse"), {ok, members, drift}; a helper `selection(ids, owner)` that makes the handle. Users: inquiry 2, contradiction 1, intent 2, reevaluation 1, publication 1; 7 findings.
- contract `selection-read` (FIX-L): selectionRead({handle, viewer, owner}) -> NO_SUCH_SELECTION (detail "unknown, released, or expired"), NOT_YOURS, {ok:true, members, viewer}. Users: retrieval-browse 2; 2 findings.
- fixture `meaningRowsUnknownArm` (FIX-E): meaningRows with an unknown arm -> MEANING_ROWS_UNKNOWN_ARM (C-23.2). Users: agent-worker 2; 2 findings.

### inquiry
- fixture `migratedSurfacing` (FIX-E): inquiry.migratedSurfacing(id) (R49): null for a question not migrated, the surfacing record for one that is. Users: ai-runs 2; 2 findings.
- fixture `basisRefusals` (FIX-E): the promotion step check of a real inquiry refusing a project: BASIS_REFUSED (with findings), SELF_BASIS, BASIS_CYCLE (path), MACHINE_PASSAGE_UNCHECKED; each from a real promote of a bad basis. Users: citation 1; 1 finding.
- fixture `dispose` (FIX-E): inquiry.dispose({handle, to, reason, viewer, owner, author}) over a real selection (together with personFacts), incl. its refusals BAD_TARGET_STATE, NO_REASON, BAD_REASON, EMPTY_SELECTION. Users: intent 1; 1 finding.

### steps
- fixture `stepsWorld` (FIX-E): a real steps (R1,R2,R4,R5,R9, registerRunHolder) over the real record: step({step, viewer}) -> NO_SUCH_STEP for an unseen one, stepCreate({by, run, work, place}) refusals STEP_NOT_YOUR_RUN, STEP_NO_WORK, stepEnd, recordProduct; acts recorded. Users: ai-runs 6; 6 findings.

### basis-versions
- fixture `concludeRefusals` (FIX-E): a real basis-versions: conclude({target, conclusion|reading, version}) -> NO_CONCLUSION, BAD_READING, NO_CLAIM; accepted versions set by really appending/accepting them. Users: contradiction 3; 3 findings.
- fixture `appendVersionRefusal` (FIX-E): appendVersion refused by a real basis-versions (e.g. a bad name or a promotion refusal) with its code, check, translation and findings. Users: run-productions 2, reevaluation 1; 3 findings.

### ai-use
- fixture `ceilingRefusal` (FIX-E): the ai-use ceiling check over a spent daily ceiling -> AI_USE_CEILING_REACHED (C-22.30) with translation. Users: agent-worker 3; 3 findings.
- contract `use-check-refusal` (FIX-L): useCheck refusal AI_LIMIT_REACHED (C-130.1) with translation. Users: extraction 1; 1 finding.

### ai-runs
- fixture `airunRefusal` (FIX-E): the refusal of a real ai-runs read of a run the caller may not see (ai-runs code, check, translation) through op=airun / airunlog. Users: agent-steps 1, agent-worker 1; 2 findings.
- fixture `tickStateTooLarge` (FIX-E): a real ai-runs tick whose state exceeds AI_RUN_STATE_MAX_BYTES -> AI_RUN_STATE_TOO_LARGE (C-22.18) with bytes and limit. Users: agent-worker 1; 1 finding.

### run-productions
- fixture `suggestRefusals` (FIX-E): suggest() refused: SUGGEST_BOILERPLATE (C-27.12, boilerplate description), SUGGEST_UNWRITABLE_STATE (C-27.13). Users: agent-worker 3; 3 findings.
- contract `machine-passage` (FIX-L): the machine-passage read fn({legs, author, viewer}) -> null or {ok:false, reason:"PROPOSAL_NOT_TAKEN_UP", code, legs:[{ord, proposal}]} (the basis-versions form has legs as [version, ord] pairs: one of the two is wrong). Users: inquiry 1, basis-versions 1; 2 findings.

### answers
- fixture `standingSwitchOff` (FIX-E): a standing tick held back by STANDING_SWITCH_OFF from real answers. Users: agent-worker 1; 1 finding.

### agent-runner
- contract `runner-refusals` (FIX-L): runner replies {ok:false, code, detail}: SDK_ERROR, NOT_SIGNED_IN, NOT_THIS_MEMBER, SIGNIN_NOT_HELD, SIGNIN_TOKEN_REFUSED, ACCOUNT_REFERENCE_UNUSABLE; NOT_SIGNED_IN is credentials' code, not the runner's. Users: agent-model 10; 10 findings.
- contract `runner-wire` (FIX-L): fakeRunner: GET /version -> {ok, name:"agent-runner", version, capabilities?}; websocket messages in/out per R4, R24; the runner test runs the same scripts. Users: agent-model 2; 2 findings.
- fixture `runnerWire` (FIX-E): the runner driven in process over its own wire (startRunner of agent-runner/test/helpers.mjs, its SDK double stays), conversation answering its final tool then ending with usage and optional num_turns. Users: agent-worker 1; 1 finding.
- fixture `runnerRefusal` (FIX-E): one real runner refusal per code of RUNNER_REQUIREMENT_CODES (signin.mjs, runner.mjs), body {ok:false, reason, code, detail}. Users: agent-worker 1; 1 finding.

### agent-steps
- contract `dispatch-refusals` (FIX-L): the dispatch refusal RUN_NAMES_A_DIFFERENT_PAYER as agent-steps/src/drive.mjs gives it and agent-worker relays with status 409. Users: ai-runs 1; 1 finding.

### agent-worker
- contract `transcribe-refusal` (FIX-L): the worker's refusal body {ok:false, reason, code, detail, worker:"agent-worker", status?} for its six codes BAD_BODY, BAD_SHA, BAD_PAGES, NO_ACCOUNT, BAD_ACCOUNT, TRANSCRIBE_NEEDS_API_KEY (R72) as plane relays it. Users: extraction 4; 4 findings.
- contract `dispatch-refusal` (FIX-L): a 4xx refusal body of the worker's /run dispatch, with a real code. Users: ai-runs 2; 2 findings.
- contract `transcribe-not-sent` (FIX-L): transcribe answers AGENT_WORKER_UNBOUND, EVIDENCE_ABSENT, NO_PAGE_RENDERED. Users: extraction 1; 1 finding.
- contract `transcribe-declined` (FIX-L): the worker's answer when the AI declines ({ok:false, reason:"busy"}) and when the worker is silent; the provider run shows the real worker's shape. Users: extraction 1; 1 finding.

### publication
- fixture `stampEditionRefusal` (FIX-E): stampEdition({case, editions, ...}) refused by a real publication: NO_SUCH_CASE_EDITION or STAMP_NO_ORDER. Users: docket 1; 1 finding.

### action-plans
- contract `optionpropose-refusal` (FIX-L): op=optionpropose refused ADDRESSEE_REFUSED (C-120.9) with check and translation (a real row has the real C number). Users: agent-steps 1, agent-worker 1; 2 findings.
- contract `plan-open-check` (FIX-L): the open-check fn registered with ai-runs.registerOpenCheck("action-plans", "plan", fn) returning {ok:false, code:"PLAN_NOT_OPEN", check, translation, detail}. Users: ai-runs 1; 1 finding.

### link-sweep
- contract `sweep-scope` (FIX-L): the scope check fn({sweep, locators, run, target}) registered by link-sweep: {ok:false, reason: unknown|unratified|held|out-of-scope, detail?} | {ok:true, scope}; the in-scope rule "equal or continues at a /". Users: capture-requests 4; 4 findings.

### instance-setup
- contract `group-identity-public` (FIX-L): groupIdentityPublic() with no group recorded: {ok:true, group:null, display_name:null, domain:null, domain_verified_at:null, detail}. Users: public-read 1; 1 finding.

### admission
- contract `credential-revoked` (FIX-L): AI_CREDENTIAL_REVOKED (C-29.7) body; also AI_CREDENTIAL_EXPIRED (C-29.30) for the GRANT_EXPIRED uses. Users: agent-worker 1; 1 finding.

### answer-envelope
- contract `required-argument` (FIX-L): the local requiredArgument(op, argument, shape, error) -> {ok:false, reason:"REQUIRED_ARGUMENT_MISSING", op, argument, shape, error} lacks the real row's code, check, translation and detail (src/answer-envelope/index.mjs:373); the provider test runs the local value against the real one and the user takes the real function's output shape. Users: public-read 38; 38 findings.
- contract `envelope-helpers` (FIX-L): the local copies of json(), doAnswer(), storeRefusal(), storeSilent() (STORE_DID_NOT_ANSWER, 502, correlation) must equal answer-envelope's exports on the same inputs. Users: extraction 1, connections 1, publication 1; 3 findings.

### store-door
- contract `store-reply` (FIX-L): the store's own replies as dispatch() gives them: BAD_JSON 400, unknown op 400 ({ok:false,error:"unknown op: x"}), STORE_INTERNAL_ERROR 500 with and without correlation, a bare stack {ok:false,error} 500; the provider test dispatches the bad inputs and compares to the values used. Users: extraction 7, connections 3, publication 3, public-read 9; 22 findings.

### control-plane
- contract `ask-wire` (FIX-L): the plane worker's /?op=<op> envelope as the agent worker sees it: {ok:true, result, store, tokenClass}, refusals 403 {ok:false, reason, code, check, translation}, UNKNOWN_OP 400/404, silent 500; ops whoami, airun, airunlog, airunspawn, airuntick, airunclose, agentpack, plan, plans, meaningrows, basisversions, versionchain, search, suggest, optionpropose, capturerequest, askcheck, askceiling, askusage. Users: agent-steps 15, agent-worker 13; 28 findings.

### plane
- contract `job-registrar` (FIX-L): registerJob({kind, sha|session, ...}) -> {ok, existed, state} | {ok:false, reason}; armJobs(); transact; idempotent re-arm; refusals JOB_ENTRY_INVALID, JOB_KIND_UNKNOWN, JOB_SESSION_MISSING, JOB_SHA_INVALID. The plane test (src/plane/pending.mjs) runs jobRegistrarStub's cases against the real table. One marker covers the shared stub; each user adds a `fixtures-run` line. Users: extraction 9; 9 findings.

## Users

### extraction (77)
- FIX-E ai-accounts/accountsServing: c17.test.mjs:66, r103.test.mjs:69, r103.test.mjs:86, r103.test.mjs:100, t46.test.mjs:28 (mechanical)
- FIX-E pdf-reader/notAPdf: dec149.test.mjs:18, pagetranscribe.test.mjs:52, pdfstructure.test.mjs:19 (mechanical)
- FIX-E ai-accounts/keptAwayProject: declared-ops.test.mjs:12, pagetranscribe.test.mjs:98, t44.test.mjs:144, t48.test.mjs:112 (mechanical)
- FIX-E provenance/registeredHomes: declared-ops.test.mjs:63, g33.test.mjs:12, g38.test.mjs:10, g40.test.mjs:14, g41-undetermined.test.mjs:14, g41.test.mjs:17, r101.test.mjs:12, r104.test.mjs:12, r7-words-read.test.mjs:11, r77.test.mjs:12, r8-owe.test.mjs:14, r80-counters.test.mjs:8, r80-failed.test.mjs:11, r80.test.mjs:11, r82.test.mjs:11, r99-r107.test.mjs:18, round5.test.mjs:13, round6-pieces.test.mjs:11, round6.test.mjs:14, s25-pieces-chain.test.mjs:41 (judgment)
- FIX-E promotion/makePromotion: fixture.mjs:115 (judgment)
- FIX-E ai-accounts/accountsServing: pagetranscribe.test.mjs:39, t43.test.mjs:23, t44.test.mjs:55, t48.test.mjs:21, t50.test.mjs:37 (judgment)
- FIX-E ocr-worker/memberRefusal: pdfstructure.test.mjs:180, r82.test.mjs:169 (judgment)
- FIX-E ocr-worker/memberRefusal: r103.test.mjs:136 (mechanical)
- FIX-E capture/storageNotConfigured: relays.test.mjs:16 (judgment)
- FIX-E capture/evidenceNotHeld: relays.test.mjs:141 (judgment)
- FIX-E ai-accounts/keptAwayGroup: t48.test.mjs:110 (mechanical)
- FIX-E ai-accounts/keptAwayUnreadable: t48.test.mjs:114 (mechanical)
- FIX-E ai-accounts/noAccount: t50.test.mjs:221 (judgment)
- FIX-L plane/job-registrar: fixture.mjs:6, pdfstructure.test.mjs:7, r103.test.mjs:10, r8-owe.test.mjs:11, r8-owe.test.mjs:73#2, r8-owe.test.mjs:73#3, r82.test.mjs:276, r99-r107.test.mjs:13, s25-pieces-chain.test.mjs:12
- FIX-L answer-envelope/envelope-helpers: relays.test.mjs:33
- FIX-L store-door/store-reply: relays.test.mjs:74, relays.test.mjs:75, relays.test.mjs:76, relays.test.mjs:94, relays.test.mjs:105, relays.test.mjs:159, relays.test.mjs:193
- FIX-L ai-use/use-check-refusal: t43.test.mjs:107
- FIX-L agent-worker/transcribe-not-sent: t44.test.mjs:91
- FIX-L agent-worker/transcribe-refusal: t44.test.mjs:160#2, t46.test.mjs:113, t46.test.mjs:149, t50.test.mjs:59
- FIX-L agent-worker/transcribe-declined: t50.test.mjs:101
- FALSE throw-injection: r8-owe.test.mjs:79
- FALSE deliberate-unknown-code: relays.test.mjs:120
- FALSE local-helper-name: round6-pieces.test.mjs:81
- CODE JOB_TABLE_FULL is in no product file: r8-owe.test.mjs:73#1. Fix: plane gives JOB_ENTRY_INVALID, JOB_KIND_UNKNOWN, JOB_SESSION_MISSING, JOB_SHA_INVALID, JOB_NOT_KEPT; use one (JOB_NOT_KEPT) and carry the refusal under the plane job-registrar contract
- CODE PAYLOAD_TOO_LARGE is in no product file; no door gives a 413: relays.test.mjs:77. Fix: use BAD_JSON (400) or drop the row; store-door gives BAD_JSON, UNKNOWN_OP, STORE_INTERNAL_ERROR; not a product defect unless Bob wants a size refusal
- CODE SOME_REFUSAL is in no product file: t44.test.mjs:147. Fix: use BAD_PAGES (one of agent-worker R72's six: BAD_BODY, BAD_SHA, BAD_PAGES, NO_ACCOUNT, BAD_ACCOUNT, TRANSCRIBE_NEEDS_API_KEY); the literal also falls under agent-worker/transcribe-refusal
- CODE SOME_OTHER_CODE is in no product file: t44.test.mjs:160#1. Fix: use BAD_PAGES

### content (3)
- FIX-E provenance/registeredHomes: g41-real.test.mjs:23, r9-sheet-real.test.mjs:35 (judgment)
- FIX-E acquisition/notHeldRange: r9-units.test.mjs:357 (judgment)

### entities (1)
- FIX-E promotion/makePromotion: fixture.mjs:62 (judgment)

### events (2)
- FIX-E promotion/makePromotion: fixture.mjs:48 (judgment)
- FALSE own-fn-input: events.test.mjs:246

### lines (1)
- FIX-E promotion/makePromotion: fixture.mjs:57 (judgment)

### connections (8)
- FIX-E extraction/unheldStructure: fixture.mjs:95 (judgment)
- FIX-L answer-envelope/envelope-helpers: converts-links.test.mjs:47
- FIX-L store-door/store-reply: converts-links.test.mjs:69, converts-links.test.mjs:132, converts-links.test.mjs:142
- FALSE do-double: converts-links.test.mjs:53, converts-links.test.mjs:66
- CODE OVERLOADED is in no product file: converts-links.test.mjs:146. Fix: use STORE_INTERNAL_ERROR (500) or, for a 503, add a real code; the product has no overload refusal

### observation-log (1)
- FIX-E extraction/extractionNotice: fixture.mjs:71 (judgment)

### law-relations (3)
- FIX-E acquisition/keyedServiceOff: courts.test.mjs:148, fixture.mjs:136 (mechanical)
- FIX-L standards/host-refusals: fixture.mjs:72

### standards (1)
- FIX-E acquisition/keyedServiceOff: reads.test.mjs:64 (mechanical)

### progressions (2)
- FIX-E provenance/registeredHomes: fixture.mjs:128 (judgment)
- FIX-E promotion/makePromotion: integration.test.mjs:20 (judgment)

### money (2)
- FIX-E promotion/makePromotion: ops.test.mjs:48 (judgment)
- FALSE transact-callback: g55-view.test.mjs:74

### duties (1)
- FALSE own-fn-input: exports.test.mjs:153

### retrieval-browse (6)
- FIX-E provenance/registeredHomes: g41-findin.test.mjs:39 (judgment)
- FIX-E events/recordedByMalformedExtent: t36.test.mjs:139 (judgment)
- FIX-E entities/namingInRefused: t37.test.mjs:172, words.test.mjs:60 (judgment)
- FIX-L retrieval/selection-read: fixture.mjs:172, fixture.mjs:173

### retrieval (1)
- FIX-E extraction/progressOf: t51-round9.test.mjs:211 (judgment)

### calculations (2)
- FIX-E events/usesOf: fixture.mjs:123 (judgment)
- FIX-E provenance/registeredHomes: g41-cells.test.mjs:185 (judgment)

### workbooks (2)
- FIX-E sheet-worker/recomputeNotEnabled: add.test.mjs:78 (judgment)
- FIX-E sheet-worker/recomputeEngineFailed: recompute.test.mjs:94 (judgment)

### inquiry (9)
- FIX-E promotion/oversizeInlineRefusal: divide.test.mjs:107 (judgment)
- FIX-E capture/heldActsUnreadable: document-waits.test.mjs:115, document-waits.test.mjs:124 (judgment)
- FIX-E retrieval/selectionResolve: fixture.mjs:102, fixture.mjs:103 (judgment)
- FIX-E duties/occurrencesOf: held-legs.test.mjs:118 (judgment)
- FIX-L run-productions/machine-passage: machine-passage.test.mjs:29
- FALSE word-double: contradiction.test.mjs:32
- FALSE transact-callback: raise.test.mjs:62

### hypotheses (2)
- CODE PERSON_NO_PUBLIC_ROLE is in no product file: t41.test.mjs:248, t41.test.mjs:293. Fix: use PERSON_IN_NO_PUBLIC_ROLE (inquiry R59; investigation PERSON_WARNING_CODE); better still the real personWarning exported by inquiry (FIX-E inquiry/personWarning)

### citation (2)
- FIX-E inquiry/basisRefusals: cite-refusals.test.mjs:274 (judgment)
- CODE SOME_STEP_REFUSED is in no product file: draw.test.mjs:197. Fix: use BASIS_REFUSED (inquiry step refusal)

### basis-versions (1)
- FIX-L run-productions/machine-passage: machine-passage.test.mjs:25

### strength (2)
- FIX-E promotion/makePromotion: fixture.mjs:153 (judgment)
- FIX-E promotion/staleBaseRefusal: projectbar.test.mjs:272 (mechanical)

### contradiction (4)
- FIX-E basis-versions/concludeRefusals: acts.test.mjs:254, fixture.mjs:128, fixture.mjs:132 (judgment)
- FIX-E retrieval/selectionResolve: fixture.mjs:89 (judgment)

### ai-runs (19)
- FIX-E inquiry/migratedSurfacing: plan.test.mjs:6, world.mjs:83 (mechanical)
- FIX-E steps/stepsWorld: t41.test.mjs:5, t46.test.mjs:108, words.test.mjs:7, world.mjs:272, world.mjs:283, world.mjs:284 (judgment)
- FIX-E credentials/aiRunMintRefusedNotParticipant: t50.test.mjs:217 (judgment)
- FIX-L agent-steps/dispatch-refusals: converts.test.mjs:115
- FIX-L action-plans/plan-open-check: plan.test.mjs:93
- FIX-L agent-worker/dispatch-refusal: scheduler.test.mjs:238, t46.test.mjs:352
- FALSE transact-callback: producers.test.mjs:58
- FALSE own-fn-input: r085.test.mjs:99
- FALSE throw-injection: t48.test.mjs:63
- FALSE external-provider-reply: usage.test.mjs:394, usage.test.mjs:417
- CODE PLAN_NOT_AFTER_RESPONSE is in no product file: reexam.test.mjs:111. Fix: use PLAN_NOT_OPEN (action-plans); the literal is also action-plans/plan-open-check

### run-productions (2)
- FIX-E basis-versions/appendVersionRefusal: suggest.test.mjs:243, suggest.test.mjs:249 (judgment)

### capture-requests (9)
- FIX-E capture/captureArm: fixture.mjs:74 (judgment)
- FIX-E capture/acquireRefusal: fixture.mjs:113 (judgment)
- FIX-E standards/standardRead: t35.test.mjs:232 (judgment)
- FIX-L link-sweep/sweep-scope: sweep.test.mjs:21, sweep.test.mjs:22, sweep.test.mjs:23, sweep.test.mjs:24
- FALSE bucket-double: drain.test.mjs:286
- FALSE deliberate-unknown-code: reads.test.mjs:106

### skills (8)
- FALSE synthetic-input-data: pack.test.mjs:152#1, pack.test.mjs:152#2, pack.test.mjs:246#1, pack.test.mjs:246#2, pack.test.mjs:247#1, pack.test.mjs:247#2, pack.test.mjs:248#1, pack.test.mjs:248#2

### question-explorer (1)
- CODE NOT_IN_THESE_TESTS is in no product file (a trap sentinel): fixture.mjs:257. Fix: replace the content stand-in with the real content (FIX-E content/contentWorld), or use CONTENT_EXTENT_NO_CHAIN

### answers (10)
- FIX-E ai-accounts/keptAwayGroup: standing.test.mjs:308, standing.test.mjs:327 (judgment)
- FIX-E ai-accounts/accountsServing: standing.test.mjs:309, standing.test.mjs:374 (judgment)
- FIX-E ai-accounts/noAccount: standing.test.mjs:311, standing.test.mjs:326 (judgment)
- FIX-E ai-accounts/switchedOff: standing.test.mjs:315 (judgment)
- FIX-E ai-accounts/keptAwayUnreadable: standing.test.mjs:321 (judgment)
- FIX-E retrieval-browse/findInCaptureNotHeld: standingfind.test.mjs:188 (judgment)
- CODE NO_PROFILES is in no product file: words.test.mjs:40. Fix: none: the real combine([]) answers {ok:true, view:{profiles:[]}}; re-point to FIX-E jurisdictions/noProfileView

### agent-model (13)
- FIX-L agent-runner/runner-wire: agent-model.test.mjs:47, agent-model.test.mjs:63
- FIX-L agent-runner/runner-refusals: agent-model.test.mjs:231, agent-model.test.mjs:312, agent-model.test.mjs:316, agent-model.test.mjs:389, agent-model.test.mjs:548, agent-model.test.mjs:661, agent-model.test.mjs:934, agent-model.test.mjs:1311, agent-model.test.mjs:1365, agent-model.test.mjs:1367
- FALSE callback-result: agent-model.test.mjs:1436

### agent-runner (18)
- FALSE platform-runtime-double: container.test.mjs:7, disabled.test.mjs:5, hold.test.mjs:6, remote-session.test.mjs:7, stubs/runtime.mjs:72, worker.test.mjs:5
- FALSE external-sdk-double: container.test.mjs:8, conversation.test.mjs:6, helpers.mjs:14, helpers.mjs:65, hold.test.mjs:5, images.test.mjs:8, signin.test.mjs:4, surface.test.mjs:5, trace.test.mjs:5, words.test.mjs:17, worker.test.mjs:4
- FALSE own-harness: remote-log.test.mjs:16

### agent-steps (30)
- FIX-E ai-runs/airunRefusal: interface.test.mjs:36 (judgment)
- FIX-E provenance/versionChainNoSuchVersion: t49r90.test.mjs:94 (judgment)
- FIX-L control-plane/ask-wire: interface.test.mjs:224, plan.test.mjs:45, plan.test.mjs:97, plan.test.mjs:99, r096.test.mjs:30, r096.test.mjs:63, r101.test.mjs:29, r101.test.mjs:62, r103.test.mjs:32, r103.test.mjs:73, r107.test.mjs:28, r107.test.mjs:62, t49r90.test.mjs:100, world.mjs:15, world.mjs:71
- FIX-L action-plans/optionpropose-refusal: plan.test.mjs:69
- FALSE own-fn-input: readers.test.mjs:28, readers.test.mjs:130, t49r90.test.mjs:38
- FALSE own-harness: shell.mjs:13
- FALSE bare-local-helper: subsessions.test.mjs:52
- CODE CHAIN_REFUSED / VERSION_CHAIN_REFUSED is in no product file: interface.test.mjs:149. Fix: use VERSION_CHAIN_NO_SUCH_VERSION (provenance versionChain); the literal is FIX-E provenance/versionChainNoSuchVersion
- CODE CLOSE_REFUSED is in no product file: interface.test.mjs:207. Fix: use an ai-runs refusal code (AI_RUN_NOT_PRINCIPAL); the literal is FIX-E ai-runs/airunRefusal
- CODE NOT_FOR_YOU is in no product file: interface.test.mjs:248. Fix: use a capture/ai-runs reading refusal; take it from FIX-E capture/acquireRefusal
- CODE AI_LOG_REFUSED is in no product file: interface.test.mjs:265, interface.test.mjs:267. Fix: use the code ai-runs' tick really puts in refused[]; read src/ai-runs/index.mjs tick before fixing (see Uncertain)
- CODE SUGGEST_REFUSED_FOR_TEST is in no product file: r107.test.mjs:52, r107.test.mjs:154. Fix: use SUGGEST_BOILERPLATE or SUGGEST_UNWRITABLE_STATE (run-productions)

### agent-worker (41)
- FIX-E ai-use/ceilingRefusal: ask.test.mjs:38, inprocess.mjs:120, t35.test.mjs:556 (mechanical)
- FIX-E agent-runner/runnerWire: ask.test.mjs:310 (judgment)
- FIX-E run-productions/suggestRefusals: inprocess.mjs:94, requirements.test.mjs:1428, t35.test.mjs:106 (mechanical)
- FIX-E ai-runs/airunRefusal: requirements.test.mjs:516 (judgment)
- FIX-E retrieval/meaningRowsUnknownArm: requirements.test.mjs:782, requirements.test.mjs:874 (mechanical)
- FIX-E ai-runs/tickStateTooLarge: requirements.test.mjs:1032 (judgment)
- FIX-E answers/standingSwitchOff: t41.test.mjs:44 (judgment)
- FIX-E agent-runner/runnerRefusal: t47.test.mjs:206 (judgment)
- FIX-L control-plane/ask-wire: ask.test.mjs:74, inprocess.mjs:58, inprocess.mjs:130, plan.test.mjs:41, plan.test.mjs:93, plan.test.mjs:95, r085.test.mjs:42, r085.test.mjs:84, t35.test.mjs:69, t35.test.mjs:129, t45.test.mjs:69, t45.test.mjs:102, t49.test.mjs:43
- FIX-L action-plans/optionpropose-refusal: plan.test.mjs:65
- FIX-L admission/credential-revoked: requirements.test.mjs:1424
- FALSE binding-double: t37.test.mjs:53, t42.test.mjs:38, t42.test.mjs:43, versions.test.mjs:232
- FALSE own-fn-input: versions.test.mjs:89
- CODE GRANT_EXPIRED is in no product file: ask.test.mjs:57, t35.test.mjs:567, t36.test.mjs:120. Fix: use AI_CREDENTIAL_EXPIRED (C-29.30, admission); the literal is also FIX-L admission/credential-expired
- CODE AI_RUN_NOT_VISIBLE is in no product file: requirements.test.mjs:467. Fix: use an ai-runs refusal (AI_RUN_NOT_PRINCIPAL / AI_RUN_NO_SUCH_CONTEXT); the literal is FIX-E ai-runs/airunRefusal
- CODE CHAIN_REFUSED / VERSION_CHAIN_REFUSED is in no product file: requirements.test.mjs:846, requirements.test.mjs:850. Fix: use VERSION_CHAIN_NO_SUCH_VERSION (provenance versionChain); the literal is FIX-E provenance/versionChainNoSuchVersion
- CODE MEANING_ROWS_REFUSED is in no product file: t50.test.mjs:83, t50.test.mjs:526. Fix: use MEANING_ROWS_UNKNOWN_ARM (retrieval); the literal is FIX-E retrieval/meaningRowsUnknownArm

### intent (6)
- FIX-E provenance/registeredHomes: fixture.mjs:113, reasons.test.mjs:139 (mechanical)
- FIX-E retrieval/selectionResolve: fixture.mjs:125, fixture.mjs:132 (judgment)
- FIX-E inquiry/dispose: fixture.mjs:165 (judgment)
- CODE HELD_ELSEWHERE is in no product file: discovery.test.mjs:220. Fix: use an inquiry dispose refusal (EMPTY_SELECTION, BAD_TARGET_STATE, NO_REASON); the stand-in itself is FIX-E inquiry/dispose

### reevaluation (5)
- FIX-E retrieval/selectionResolve: fixture.mjs:160 (judgment)
- FIX-E basis-versions/appendVersionRefusal: sweep.test.mjs:182 (judgment)
- FALSE transact-callback: raise.test.mjs:212, raise.test.mjs:237
- CODE NO_CASE_EDITION is in no product file: caseparts.test.mjs:30. Fix: use NO_SUCH_CASE_EDITION (publication, public-read); the stand-in is also FIX-L publication/case-cited-parts

### case-carriage (1)
- FIX-E provenance/onReceiptRefusals: documents.test.mjs:437 (judgment)

### publication (11)
- FIX-E retrieval/selectionResolve: fixture.mjs:137 (judgment)
- FIX-E standards/standardRead: t35.test.mjs:37, t35.test.mjs:245, t37.test.mjs:32, t47.test.mjs:24 (judgment)
- FIX-L answer-envelope/envelope-helpers: door.test.mjs:30
- FIX-L store-door/store-reply: door.test.mjs:91, door.test.mjs:93, door.test.mjs:223
- FALSE do-double: door.test.mjs:36, door.test.mjs:47

### docket (1)
- FIX-E publication/stampEditionRefusal: fixture.mjs:137 (judgment)

### public-read (97)
- FIX-E standards/standardRead: criteria.test.mjs:36 (judgment)
- FIX-L answer-envelope/required-argument: archives.test.mjs:34, calculations.test.mjs:24, casefile.test.mjs:26, checks.test.mjs:24, cleaned-key.test.mjs:19, convert-caseflip.test.mjs:27, convert-casesign.test.mjs:30, convert-d442-publish-writes-nothing.test.mjs:28, convert-deliverer.test.mjs:26, convert-multifinding.test.mjs:31, convert-publishedcase.test.mjs:35, court-orders.test.mjs:21, dec149.test.mjs:21, dec149.test.mjs:136, docket-real.test.mjs:20, docket.test.mjs:32, door.test.mjs:28, evidence-names.test.mjs:21, finding-page.test.mjs:18, finding-words.test.mjs:18, g50-copies.test.mjs:29, g50-scenes.mjs:19, g54-attempt.test.mjs:22, label-key.test.mjs:21, lowercase.test.mjs:18, make-g50-goldens.mjs:28, obscured.test.mjs:28, photos.test.mjs:27, project-reference.test.mjs:18, public-path.test.mjs:29, public-reads.test.mjs:30, r8-assemble.test.mjs:21, record-word.test.mjs:18, record-word.test.mjs:118, relay.test.mjs:30, sampling.test.mjs:29, served.mjs:28, worker.test.mjs:26
- FIX-L store-door/store-reply: docket.test.mjs:224, door.test.mjs:79, door.test.mjs:80, door.test.mjs:81, public-reads.test.mjs:201, relay.test.mjs:36, relay.test.mjs:37, relay.test.mjs:38, relay.test.mjs:39
- FIX-L instance-setup/group-identity-public: group-fields.test.mjs:18
- FALSE do-double: archives.test.mjs:17, calculations.test.mjs:9, casefile.test.mjs:10, checks.test.mjs:11, cleaned-key.test.mjs:9, convert-caseflip.test.mjs:17, convert-caseobject.test.mjs:11, convert-casesign.test.mjs:16, convert-d442-publish-writes-nothing.test.mjs:16, convert-deliverer.test.mjs:13, convert-fence.test.mjs:10, convert-multifinding.test.mjs:19, convert-publishedcase.test.mjs:19, court-orders.test.mjs:10, credit.test.mjs:9, dec149.test.mjs:11, docket.test.mjs:10, door.test.mjs:8, evidence-names.test.mjs:8, finding-page.test.mjs:7, finding-words.test.mjs:7, fixture.mjs:192, fixture.mjs:200, g50-copies.test.mjs:11, g50-scenes.mjs:8, g54-attempt.test.mjs:12, label-key.test.mjs:10, lowercase.test.mjs:8, make-g50-goldens.mjs:18, obscured.test.mjs:13, photos.test.mjs:14, project-reference.test.mjs:8, public-path.test.mjs:11, public-reads.test.mjs:10, r8-assemble.test.mjs:11, record-word.test.mjs:8, relay.test.mjs:54, relay.test.mjs:59, sampling.test.mjs:9, served.mjs:8, worker.test.mjs:9
- FALSE local-helper-name: convert-ratify.test.mjs:35
- FALSE own-fn-input: dec149.test.mjs:129
- FALSE deliberate-unknown-code: g54-attempt.test.mjs:163, g54-attempt.test.mjs:165, g54-attempt.test.mjs:219
- CODE STORE_BUSY is in no product file: docket.test.mjs:221, docket.test.mjs:332. Fix: use STORE_INTERNAL_ERROR; the reply is also FIX-L store-door/store-reply

## Check rules

For BOB: each FALSE group, with the general rule that would let the check skip it.

- do-double (45): A function (or the import of one) whose result is an object with `fetch(req)` standing in for a Durable Object / the published store (`stubOf`, `fakeStore`, `stubOf(w)`), dispatching to the real modules' op maps, and every literal in its trap branch (`unknown op`, `UNEXPECTED`). Skip the declaration, its imports, and literals inside its default branch. Examples: connections/converts-links.test.mjs:53, public-read/worker.test.mjs:9.
- external-sdk-double (11): Doubles of an external service the product does not own: the Claude Agent SDK and CLI (`stubSdk`, `stubClaude`). Add Sdk, Claude, Cli, Anthropic to PLATFORM_DOUBLE. Examples: agent-runner/container.test.mjs:8, agent-runner/worker.test.mjs:4.
- own-fn-input (8): A literal passed as an argument to the user module's own function (or to a helper the test declares and the module exports a twin of): `noSuchDuty("D", hostile)`, `planeAnswer({...})`, `documentHoldings([...])`, `sentences({...})`. Skip a literal whose callee is the user module's export, also through a loop variable bound by destructuring its import. Examples: events/events.test.mjs:246, public-read/dec149.test.mjs:129.
- synthetic-input-data (8): Made-up rows (`MACHINE_CANNOT_ALPHA`, family Z_CHECKS) built as a catalogue and fed to the user's own pure function (`machineFences`, `renderPack`), asserted back unchanged. Skip a code literal that appears both in an input object and in the assertion of the same test (pass-through) even when under `code`. Examples: skills/pack.test.mjs:152, skills/pack.test.mjs:248.
- platform-runtime-double (6): Doubles of the Workers runtime (`fakeCtx` a Durable Object ctx, `installRuntime`, `loadWorker`). Add Ctx, Runtime, Loader to PLATFORM_DOUBLE. Examples: agent-runner/container.test.mjs:7, agent-runner/worker.test.mjs:5.
- deliberate-unknown-code (5): A code the test names as unknown on purpose to prove the default branch (`NOT_A_CODE`, `SOMETHING_ELSE`, reason `OTHER`). Skip a literal in a test whose assertion says unknown/other/no row; or a code matching NOT_A_CODE|SOMETHING_ELSE. Examples: extraction/relays.test.mjs:120, public-read/g54-attempt.test.mjs:219.
- transact-callback (5): An `{ok:false, reason}` returned from the callback a test hands to a real provider's `record.transact(() => ...)` to force a rollback: the code is only a marker. Skip a literal returned by an arrow passed to `.transact(`. Examples: money/g55-view.test.mjs:74, reevaluation/raise.test.mjs:237.
- binding-double (4): A service-binding or namespace double that records calls and must never be called (`planeStub`/`runnerStub` returning `{calls, binding:{fetch}}`; a Miniflare DO stub). Skip a stub whose value is `{ calls, binding }` or `.get(idFromName(...))`. Examples: agent-worker/t37.test.mjs:53, agent-worker/versions.test.mjs:232.
- throw-injection (2): A replacement of a provider method by a function that only throws, to prove the throw is caught (`registerJob: () => { throw }`, `accountFor = async () => { throw }`). The answer is a throw, not another module's answer. Skip when the body is a single `throw`. Examples: extraction/r8-owe.test.mjs:79, ai-runs/t48.test.mjs:63.
- local-helper-name (2): A test-local helper whose name equals an INTERFACE_NAMES entry (`homeOf`, `partsOf`) but is never handed to the module as that dependency. A stand-in is reported only when the function is assigned to, or passed as, the dependency. Examples: extraction/round6-pieces.test.mjs:81, public-read/convert-ratify.test.mjs:35.
- external-provider-reply (2): Error vocabulary of the model provider (`enforced_spend_limit_reached`, `overloaded_error`) relayed through a binding double: not a module code. Skip an `ok:false` body whose reason is lower_snake_case. Examples: ai-runs/usage.test.mjs:394, ai-runs/usage.test.mjs:417.
- own-harness (2): A test-local harness counting its own calls (`stubInterface`) or the test shell's own refusals (`shell.mjs` `refusal()` with worker:"test-shell"). Skip a literal whose object names `test-shell`; skip a stub with only `call`/`requests`. Examples: agent-runner/remote-log.test.mjs:16, agent-steps/shell.mjs:13.
- word-double (1): The word-pattern `double` matched the data key `double_speak_or_reversal`. STUB_WORD must not match `double_`/`fake_`/`stub_` when the identifier is a string-valued object key or a snake_case data word. Examples: inquiry/contradiction.test.mjs:32.
- bucket-double (1): A minimal object whose only content is an evidence-store (R2 bucket) double `{core:{evidenceStore:()=>({head,get,put})}}` passed to a real acquire. Add a rule: object literal with `evidenceStore` returning `head/get/put` is a Bucket double. Examples: capture-requests/drain.test.mjs:286.
- callback-result (1): A value returned by a callback the caller supplies to the user module's own function (agent-model's tool-input `check`), whose code belongs to the caller. Skip a code returned inside a function passed under a `check`/`validate` key. Examples: agent-model/agent-model.test.mjs:1436.
- bare-local-helper (1): A local `const stub = async (...) =>` helper that drives the module; only its name matches. The bare-spy rule applies only where the value or assignments name an exported name of another module, and `VERSION` here is an env key. Examples: agent-steps/subsessions.test.mjs:52.

## Uncertain

- job-registrar-stub.mjs (test-support R27, 9 extraction findings) is classed FIX-L with provider plane (src/plane/pending.mjs holds the real registrar; control-plane/jobs.mjs only reads it). If BOB treats the shared stub as a harness helper, these 9 become FALSE (rule: a stub file inside test-support's paths).
- ask-wire (28 findings, agent-steps 15, agent-worker 13): the plane's op door is answered by many modules. Classed FIX-L, provider control-plane (UNKNOWN_OP, the `{ok,result,store,tokenClass}` envelope). BOB may split it: ops answered by earlier modules (airun*, basisversions, versionchain, meaningrows, suggest, plan reads) could instead take FIX-E fixtures from ai-runs, basis-versions, provenance, retrieval, run-productions; only the envelope would stay FIX-L. Provider could be store-door or plane instead.
- do-double (45) is FALSE: stubOf/fakeStore build `{ok:true,result}` around the real modules' op maps. If BOB wants the envelope held to the real one, they become FIX-L store-door/store-reply.
- store-reply is split store-door (the store's replies) / answer-envelope (the relay helpers); the provider job may merge them. The local requiredArgument (38) omits check, translation, detail, so its contract run will fail until the tests take the real shape.
- Codes to confirm in source before fixing: the real code in ai-runs' tick `refused[]` (interface.test.mjs:265, 267, AI_LOG_REFUSED); an ai-runs read refusal for AI_RUN_NOT_VISIBLE (requirements:467) and CLOSE_REFUSED (interface:207): AI_RUN_NOT_PRINCIPAL is a guess; whether NOT_FOR_YOU (interface:248) should come from capture or ai-runs; "busy" and "UNREADABLE" (OCR member, 2) have no ocr-worker equivalent beyond PIXELS_UNREADABLE.
- No product defect found among CODE: PAYLOAD_TOO_LARGE, OVERLOADED, STORE_BUSY, JOB_TABLE_FULL have no product source; each test can use an existing refusal. Whether the product should give a size or overload refusal is BOB's.
- Stand-ins larger than the flagged line: the flagged literal is part of a whole stand-in (calculations events usesOf, contradiction bv, intent inquiry, capture-requests fakeCapture, retrieval-browse host reads, ai-runs stepsStub, question-explorer content). The fixture must replace the whole stand-in.
- usage.test.mjs:394, 417 (FALSE, external-provider-reply) are bodies a binding double returns for the model provider's errors; agent-worker (later) is what relays them; FIX-L agent-worker/dispatch-refusal if BOB wants them held.
- citation cite-refusals:274 mixes five refusals; PROPOSAL_NOT_TAKEN_UP is run-productions' (later), the other four inquiry's (earlier). run-productions/machine-passage: inquiry's form has `legs` as objects, basis-versions' as `[version, ord]` pairs; one is wrong.
- Each FIX-L contract needs one `fixtures-run: <user> <id>` line per user module in the provider's tests (extraction, connections, publication, public-read, agent-model, agent-steps, agent-worker, ai-runs, capture-requests, inquiry, basis-versions, law-relations, retrieval-browse, public-read).
- The registeredHomes fixture (27 findings) must work over a user's own record and membership (extraction's fresh() builds them); progressions/fixture.mjs:128 gives rows with bundleId null, which the real register cannot.

Verification: FIX-E 135 + FIX-L 136 + FALSE 104 + CODE 30 = 405 = lines in fx-part-2.txt (405); the Users section lists 405 file:line references, one per finding (repeated lines carry #n).
