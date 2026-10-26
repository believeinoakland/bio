# Fixture round part 4: findings read 334; FIX-E 147 (mechanical 71, judgment 76), FIX-L 8, FALSE 163, CODE 16

Slice: scratchpad fx-part-4.txt (334 lines; user modules answer-envelope, store-door, signin-door, interface-shell, screens-entry/wizards/settings/intake/daily/inquiry/investigate/publish/action, control-plane, plane, installer, journey-check). Paths are relative to bio-plane/test/m unless they start with newgroup/, journey-check/ or bio-plane/test/system/. `(xN)` = N findings on one line. Rule codes (FALSE): A, R, G, H, P, W, S, I (see Check rules).

## Providers

### pdf-pixels (module 28)
- FIX-E `pageRefusal(reason)`: real page-pixels call on a page that has a text layer / a JPEG process it cannot decode / a non-picture (`pagepixels.mjs`, `picturepixels.mjs`), giving PAGE_HAS_TEXT_LAYER, UNSUPPORTED_JPEG_PROCESS (+jpeg, process, page), NOT_A_PICTURE. Users: plane 5.

### ocr-worker (module 32)
- FIX-E `badPages`: real ocr-worker handler called with a request naming no page: its 400 `{ok:false, code:'BAD_PAGES', detail}`. Users: plane 1.

### member-roster (module 35)
- FIX-E `consensusRequired`: `memberRosterOf(ctx)`: two admins, one votes `adminendorse`/`remove` of a member: CONSENSUS_REQUIRED `{memberId, have, awaiting}`. Users: interface-shell 1.
- FIX-E `expertiseWithdrawn`: `memberRosterOf(ctx).expertiseWithdraw({memberId, label, reason, by})` on a declared label: ok answer with state `withdrawn`. Users: screens-settings 1.

### record-core (module 36)
- FIX-E `perItemRetained(items)`: `perItem('taskresolve', {items}, stamped, one)` where one item applies and one is refused: SET_ITEMS_RETAINED with `items[]`, `applied`, `retained`, `count`. Users: screens-daily 2.

### membership (module 37)
- FIX-E `existenceRefusal(project, viewer)`: `membershipOf(ctx)` over a world where the project is discoverable and the viewer is no participant; publish the object `{visibilityOf, existenceAct}` (real) so `store.membership()` is real; `existenceAct(P, viewer)` gives PROJECT_SEEN_NOT_A_PARTICIPANT (C-70.1). Users: store-door 3, control-plane 5 (8).
- FIX-E `noSuchProject(project)`: a real membership/project act or read on an id that names nothing: NO_SUCH_PROJECT `{project}`. Users: plane 1.

### ai-accounts (module 39)
- FIX-E `keptAway`: `aiAccountsOf(ctx)`: `aiKeepAwaySet({on:true, reason, by})` then `aiKeptAway()`: AI_KEPT_AWAY with `keep_away`. Users: signin-door 1.
- FIX-E `keepAwayUnreadable`: `aiKeepAwayState()` over an account whose SQL read throws: `{on:null, reason:null, set_by:null, set_at:null, uses:null}`. Users: screens-settings 1.
- FIX-E `keepAwaySet(b)`: `aiKeepAwaySet({on, uses, reason, by})` ok answer (parameterised by the body). Users: screens-settings 1.
- FIX-E `keepAwayState(kept)`: `aiKeepAwayState()` after a set (kept) and on a fresh account (off). Users: screens-settings 1.
- FIX-E `notYourAccount`: `subscriptionDisconnect({member: other, by})` and the account-reference read as another member: NOT_YOUR_ACCOUNT. Users: signin-door 2.
- FIX-E `tokenMalformedHold`: the sign-in token hold with a malformed token (`signintokenhold` path): SUBSCRIPTION_TOKEN_MALFORMED. Users: signin-door 1.
- FIX-E `projectKeptAway`: `projectAiKeepAwaySet({project, on:true, reason, by})` then `aiKeptAway({project})`: PROJECT_AI_KEPT_AWAY. Users: plane 1.

### promotion (module 41)
- FIX-E `retireCited`: promote a copy to `retired` while inquiries Q and Q2 cite it: CITED `{to:'retired', offenders:[{id, citedBy}]}` (promotion/index.mjs, the `retire` op). Users: screens-inquiry 1.

### provenance (module 43)
- FIX-E `homeOfWorld(home)`: real `provenanceOf(ctx)` over a record world with a registered home (or none) for a capture sha, returned with a call counter wrapped around the real `homeOf`; replaces `{homeOf: () => ...}`. Users: store-door 2, control-plane 2 (4).

### capture-sources (module 46)
- FIX-E `renderRefusal({failure_class, error, elapsed_ms})`: the render runner's failing answer from `render.mjs`/`browserrender.mjs`: `{ok:false, error, failure_class:'permanent'|'transient', elapsed_ms}` for connection refused, session refused, not HTML, navigation timeout. Users: control-plane 5.

### acquisition (module 47)
- FIX-E `owedRunAnswer(kind)`: real `acquisitionOf(ctx).owedRun` over a pending entry, kinds `done`, `outstanding`, `final(reason)` (RENDER_FAILED, NOT_A_PAGE, DELIVERY_FINAL). Users: plane 12.
- FIX-E `owedFetchAnswer(kind)`: real `owedFetch`, kinds `done`, `final(CAPTURE_HELD_BY_ANOTHER_BUNDLE | TOO_LARGE | ...)`, with the `refusal.detail` the real one carries. Users: plane 12.
- FIX-E `unpackWaiting(code)`: the unpack continuation `{ok:true, result:{ok:true, complete:false, waiting_on:{code}}}` for UNPACK_DAILY_BYTES, ARCHIVE_TREE_ENTRIES_MAX. Users: plane 2.
- FIX-E `archiveNotHeld`: unpack continuation for an archive the capture does not hold: ARCHIVE_NOT_HELD (409). Users: plane 1.

### capture (module 48)
- FIX-E `heldSetAside`: `captureOf(ctx)` heldsetaside act: `{ok:true, act:'set_aside', ids, reason, documents:[{id, waiting:[...]}]}`. Users: screens-intake 1.

### file-safety (module 50)
- FIX-E `toolTested`: `securityToolTest` ok answer `{tool_id, state:'on', passed:true, detail, tested_at}`. Users: screens-settings 1.
- FIX-E `toolTestFailed`: `securityToolTest` with a tool whose key is refused: `{state:'test_failed', passed:false, detail}`. Users: screens-settings 1.
- FIX-E `scannerAbsent`: `securityToolTest` with no scanner: SCANNER_ABSENT with its row. Users: screens-settings 1.

### reading-pipeline (module 53)
- FIX-E `storeFailedTransient`: reading-pipeline run against a bucket whose put fails: `{ok:false, transient:true, reason:'STORE_FAILED'}`. Users: plane 1.

### extraction (module 54)
- FIX-E `readHeldAnswer(kind)`: real `extractionOf(ctx).readHeld(args)` over fixture captures: kinds `noHome` ({ok:true, read:false, why:'NO_HOME'}), `read` ({ok:true, read:true}), `piece(cursor|next_page, counters, killed)` (more:true, detail), `final(why)` (NO_TEXT), and a sequence helper `pieces(n)`; the test keeps its timing/clock/hang wrappers around it. Users: plane 35.

### entities (module 56)
- FIX-E `unreadable`: entities `kind` listing over a registry whose read throws: `{ok:false, reason:'UNREADABLE', detail}`. Users: screens-settings 1.

### standards (module 63)
- FIX-E `standardRow`: `standardsOf(ctx)` read of one held standard (cite, kind, issuer, texts, period) plus `standards` list; the STD id and CNT id become fixture exports. Users: screens-investigate 2.

### bias (module 70)
- FIX-E `biasRefusedPromote`: `biasOf(ctx).promotionCheck({promotedType:'bias', files:<bad set>})`: BIAS_REFUSED with `findings`. Users: screens-settings 1.

### basis-versions (module 84)
- FIX-E `adoptNewerRefusal(code)`: real adopt-newer-version call refused with BASIS_VERSION_REFUSED and its `findings` (C-45.x) as basis-versions answers them. Users: screens-inquiry 1.

### strength (module 85)
- FIX-E `strengthBarSet(b)`: `strengthbarset` ok answer `{group, capture, connection, author, at, reason}` from the real call. Users: screens-settings 1.

### ai-runs (module 89)
- FIX-E `airunDispatchRefusal(code)`: real ai-runs dispatch refusals: MEMBER_RUN_MODE_NOT_ADMITTED, AI_RUN_NOT_PRINCIPAL (ai-runs); with ACCOUNT_MEMBER_NOT_ACTIVE from ai-accounts and AI_RUN_CREDENTIAL_MALFORMED from credentials produced by their real calls and published under this name. Users: screens-inquiry 1.
- FIX-E `airunOpenRefusal(code)`: real `airunopen` refusals: AI_RUN_MODE_NOT_DEPLOYED, AI_NO_ACCOUNT (ai-runs) and AI_LIMIT_REACHED with `{whose, period, use, when}` (ai-use). Users: screens-inquiry 1.

### agent-worker (module 100)
- FIX-E `signinStepAnswer`: the real agent-worker sign-in handler (`signin.mjs`) as a fetch binding: `{ok:true, member, step}` for start/code/state/signout, 400 BAD_STEP for any other. Users: control-plane 1.
- FIX-E `modelSilentEnding`: agent-worker `/transcribe` or `/draft` ending silent: `{ok:false, reason:'MODEL_SILENT', ending:'silent', usage, calls}`. Users: plane 1.

### network-notices (module 113)
- FIX-E `noticePrepareRefusal(code)`: real `noticeprepare` refusals NOTICE_ALREADY_OPEN, NOTICE_SINCE_BEFORE_PROJECT (+project_created), NOTICE_NO_GROUP_SLUG, NOTICE_NO_INSTANCE_KEY, NOTICE_PROJECT_CLOSED, NOTICE_SINCE_IN_FUTURE, NOTICE_WORDING_MALFORMED. Users: screens-inquiry 1.

### ratification (module 115)
- FIX-E `noCaseDocument`: real `casedocument` read by a stranger (secret not honoured): NO_CASE_DOCUMENT; and the document answer it gives the holder. Users: control-plane 1.

### case-import (module 117)
- FIX-E `importDocumentNotMissing`: real `caseimportdocument` for a document that is not missing: IMPORT_DOCUMENT_NOT_MISSING. Users: control-plane 1.

### case-disclosures (module 118)
- FIX-E `gateRefusal(code, fields)`: real publish pre-flight gate refusals with their translation and fields: DOCUMENT_COPY_PENDING (+document), PHOTO_UNCHECKED (+photo), CO_ATTESTATION_UNACKNOWLEDGED, TENSION_NOT_DISCLOSED. Users: screens-publish 7.

### case-inputs (module 120)
- FIX-E `statementAck`: real `caseInputsOps(act, url, body).statementack()` over a real case-inputs `acknowledgeStatement` (NO_REVIEW_COPY via review's `noReviewCopy`, STATEMENT_ACK_NO_REASON, ok `{acknowledged:true, reason}`). Users: control-plane 2.

### wizard-scripts (module 141)
- FIX-E `draftUnavailable`: `wizardScriptsOf(ctx).writingHelp({op:'groupdescriptiondraft', told, assistant:{on:true, account}})`: ASSISTANT_DRAFT_UNAVAILABLE (also WRITING_HELP_NOTHING_TOLD). Users: store-door 1.

### instance-setup (module 151)
- FIX-E `assistantState(kept)`: instance-setup `assistantstate` answer: `{ok:true, on, set_by, set_at, reason}` kept and not kept. Users: screens-settings 1.
- FIX-E `instanceGroupAnswer(group)`: real `instancegroup` answer: `{ok:true, group}` or `{ok:true, group:null, detail:'NO_GROUP_RECORDED'}` (setup.mjs). Users: installer 2.

### answer-envelope (module 155)
- FIX-E `planeHelpers`: the real `json`, `doAnswer`, `storeSilent`, `requiredArgument`, `StoreSilent`, `STORE_SILENT_REASON/DETAIL` as one object, for `bindPublishedPlane(...)`. Users: screens-publish 3.
- FIX-E `storeSilent(op)`: real `storeSilent(op)` Response (502 STORE_DID_NOT_ANSWER, `{op}`) and its parsed form. Users: screens-action 1, plane 3 (4).
- FIX-E `refusedAnswer(status, body)`: real `doAnswer(Response)` of a refused store reply: `{answered:false, refused:true, result:undefined, reply:{status, body}}`. Users: signin-door 1.

### store-door (module 156)
- FIX-E `internalErrorAnswer(overrides)`: real `dispatch(req, store)` with a route that throws: 500 STORE_INTERNAL_ERROR with `correlation` (uuid), no `error` text; negative controls override `correlation`/`reason`. Users: control-plane 5.

### signin-door (module 157)
- FIX-E `signinRefusal(code, extra)`: real signin-door `subscriptionsignin` step `code` answering the agent-runner refusal: NO_SIGNIN_WAITING, SIGNIN_UNAVAILABLE, SIGNIN_ADDRESS_UNEXPECTED, AGENT_WORKER_UNBOUND, SIGNIN_REFUSED with `detail`, `trace`. Users: screens-settings 2.

### screens-action (module 168)
- FIX-L contract `plan-screen-shape`: screens-inquiry/project.test.mjs:186 `{id:'plan', reads:()=>({}), render:()=>'', acts:[], words:[]}` registered beside SCREENS; provider test `// fixtures-run: screens-inquiry plan-screen-shape` runs that value through interface-shell's `checkScreens`/screen registry together with screens-action's real `plan` screen id. Users: screens-inquiry (1).

### plane (module 170)
- FIX-E `servedPlane`: the real plane (`plane/index.mjs`) served in-process (Miniflare as in plane/test or `plane/fixture.mjs`) with a seeded admin, replacing journey-check's `fakePlane({admins, flaws, adminActs, assistantControls, doors, signPage, dashNothing})`; knobs become options of the fixture. Users: journey-check 2.
- FIX-L contract `owed-later`: hand-built value `async () => ({ok:true})` as `store.owedLater` (screens-intake/g128i-504-kept.test.mjs:24); provider test `// fixtures-run: screens-intake owed-later` runs it against plane's real `owedLater(entry)` (plane/pending.mjs) and asserts the real answer is ok:true and writes the row. Users: screens-intake (1).
- FIX-L contract `owed-ledger`: hand-built ledger `owedLater: async (e) => { entries.set(e.session, e); return {ok:true}; }` (control-plane/t51-visitor-copy.test.mjs:32,42); provider test `// fixtures-run: control-plane owed-ledger` runs the same against plane's real `owedLater` + `ledgerLast`. Users: control-plane (2).
- FIX-L contract `job-registrar`: test-support `jobRegistrarStub()` standing for plane's `registerJob`/`armJobs` (control-plane r72-parted:10,44; r9-seam-limits:270,278); provider test `// fixtures-run: control-plane job-registrar` runs the stub's contract (register, arm, transact) against plane's real registrar; BOB may rather give the contract to test-support (see Uncertain). Users: control-plane (4).

## Users

### answer-envelope (14)
- FALSE A: answer-envelope/envelope.test.mjs:31, answer-envelope/envelope.test.mjs:45, answer-envelope/envelope.test.mjs:52, answer-envelope/envelope.test.mjs:53, answer-envelope/envelope.test.mjs:87, answer-envelope/envelope.test.mjs:97 (x2), answer-envelope/envelope.test.mjs:102, answer-envelope/envelope.test.mjs:112 (x2), answer-envelope/envelope.test.mjs:143, answer-envelope/envelope.test.mjs:148 (x2), answer-envelope/envelope.test.mjs:169

### store-door (16)
- FIX-E membership/existenceRefusal: store-door/dispatch.test.mjs:16 (judgment)
- FIX-E membership/existenceRefusal: store-door/dispatch.test.mjs:31, store-door/dispatch.test.mjs:348 (mechanical)
- FIX-E provenance/homeOfWorld: store-door/pull.test.mjs:212, store-door/pull.test.mjs:281 (judgment)
- FIX-E wizard-scripts/draftUnavailable: store-door/routes.test.mjs:110 (judgment)
- FALSE R: store-door/dispatch.test.mjs:63, store-door/dispatch.test.mjs:679, store-door/promotion-step.test.mjs:163
- FALSE S: store-door/pull.test.mjs:311, store-door/pull.test.mjs:316, store-door/pull.test.mjs:318
- FALSE W: store-door/routes.test.mjs:123, store-door/routes.test.mjs:125, store-door/routes.test.mjs:319, store-door/routes.test.mjs:330

### signin-door (8)
- FIX-E ai-accounts/keptAway: signin-door/door.test.mjs:13 (mechanical)
- FIX-E ai-accounts/notYourAccount: signin-door/door.test.mjs:280, signin-door/door.test.mjs:293 (mechanical)
- FIX-E ai-accounts/tokenMalformedHold: signin-door/door.test.mjs:246 (mechanical)
- FIX-E answer-envelope/refusedAnswer: signin-door/door.test.mjs:31 (mechanical)
- FALSE A: signin-door/door.test.mjs:145, signin-door/door.test.mjs:147, signin-door/door.test.mjs:307

### interface-shell (7)
- FIX-E member-roster/consensusRequired: interface-shell/fixround3.test.mjs:12 (mechanical)
- FALSE G: interface-shell/p9.test.mjs:71, interface-shell/t50.test.mjs:318, interface-shell/t50.test.mjs:455
- FALSE H: interface-shell/harness.mjs:22, interface-shell/harness.mjs:23
- FALSE P: interface-shell/harness.mjs:124

### screens-entry (2)
- CODE MEMBER_EXISTS: real code is EXISTS (member-roster memberAdd, duplicate id): screens-entry/setup.test.mjs:542
- CODE NOT_ALLOWED: real code is NOT_AN_ADMIN (member-roster courtNoticeSet, non-admin): screens-entry/setup.test.mjs:573

### screens-wizards (1)
- FALSE H: screens-wizards/fixtures.mjs:6

### screens-settings (20)
- FIX-E ai-accounts/keepAwaySet: screens-settings/fixtures.mjs:134 (judgment)
- FIX-E ai-accounts/keepAwayState: screens-settings/fixtures.mjs:176 (judgment)
- FIX-E ai-accounts/keepAwayUnreadable: screens-settings/connect.test.mjs:47 (judgment)
- FIX-E bias/biasRefusedPromote: screens-settings/bias.test.mjs:135 (mechanical)
- FIX-E entities/unreadable: screens-settings/places.test.mjs:41 (judgment)
- FIX-E file-safety/scannerAbsent: screens-settings/security.test.mjs:72 (mechanical)
- FIX-E file-safety/toolTested: screens-settings/fixtures.mjs:337 (judgment)
- FIX-E file-safety/toolTestFailed: screens-settings/security.test.mjs:63 (mechanical)
- FIX-E instance-setup/assistantState: screens-settings/fixtures.mjs:176 (judgment)
- FIX-E member-roster/expertiseWithdrawn: screens-settings/members.test.mjs:472 (judgment)
- FIX-E signin-door/signinRefusal: screens-settings/connect.test.mjs:157, screens-settings/connect.test.mjs:318 (judgment)
- FIX-E strength/strengthBarSet: screens-settings/fixtures.mjs:258 (judgment)
- CODE KEY_REFUSED: no such code; ai-accounts groupKeySet gives NO_SECRET (blank key) or NOT_AN_ADMIN: screens-settings/teamai.test.mjs:63
- FALSE G: screens-settings/common.test.mjs:136, screens-settings/panel.test.mjs:132, screens-settings/panel.test.mjs:160, screens-settings/security.test.mjs:75, screens-settings/storage.test.mjs:66
- FALSE H: screens-settings/fixtures.mjs:7

### screens-intake (8)
- FIX-E capture/heldSetAside: screens-intake/held.test.mjs:156 (judgment)
- FIX-L plane/owed-later: screens-intake/g128i-504-kept.test.mjs:24 (judgment)
- CODE ZIP_ENCRYPTED: real code is MEMBER_ENCRYPTED (acquisition checks; unpack not_filed verdict): screens-intake/archive.test.mjs:17
- FALSE G: screens-intake/capture.test.mjs:166, screens-intake/r67-supporting-reasons.test.mjs:11, screens-intake/r8-supporting.test.mjs:36, screens-intake/r9-states.test.mjs:111
- FALSE H: screens-intake/r9-parts.test.mjs:17

### screens-daily (2)
- FIX-E record-core/perItemRetained: screens-daily/queue-states.test.mjs:48 (judgment)
- FIX-E record-core/perItemRetained: screens-daily/queue-states.test.mjs:93 (mechanical)

### screens-inquiry (14)
- FIX-E ai-runs/airunDispatchRefusal: screens-inquiry/assistant.test.mjs:190 (judgment)
- FIX-E ai-runs/airunOpenRefusal: screens-inquiry/assistant.test.mjs:225 (judgment)
- FIX-E basis-versions/adoptNewerRefusal: screens-inquiry/fr2-document.test.mjs:180 (judgment)
- FIX-E network-notices/noticePrepareRefusal: screens-inquiry/t51-project-notice.test.mjs:209 (judgment)
- FIX-E promotion/retireCited: screens-inquiry/fr3-document.test.mjs:112 (judgment)
- FIX-L screens-action/plan-screen-shape: screens-inquiry/project.test.mjs:186 (judgment)
- CODE NO_SUCH_KEY_HELD: no such finding code; use a real basis-version-grammar finding code (e.g. VERSION_PARTITION_INCOMPLETE) or one basis-versions gives: screens-inquiry/fr2-question.test.mjs:123
- FALSE G: screens-inquiry/assistant.test.mjs:204, screens-inquiry/assistant.test.mjs:214, screens-inquiry/b22-question.test.mjs:67, screens-inquiry/fr2-question.test.mjs:127, screens-inquiry/fr3-question.test.mjs:43
- FALSE H: screens-inquiry/fr2-question.test.mjs:14, screens-inquiry/fr3-question.test.mjs:11

### screens-investigate (2)
- FIX-E standards/standardRow: screens-investigate/fix2.test.mjs:198, screens-investigate/fixtures.mjs:132 (judgment)

### screens-publish (18)
- FIX-E answer-envelope/planeHelpers: screens-publish/c47-seam.test.mjs:29, screens-publish/g54-page.test.mjs:29, screens-publish/seam4.test.mjs:17 (mechanical)
- FIX-E case-disclosures/gateRefusal: screens-publish/ceremony.test.mjs:253, screens-publish/ceremony.test.mjs:254 (judgment)
- FIX-E case-disclosures/gateRefusal: screens-publish/fix2.test.mjs:53, screens-publish/fix3.test.mjs:33, screens-publish/fix4.test.mjs:14, screens-publish/fr30.test.mjs:225, screens-publish/fr30b.test.mjs:80 (mechanical)
- FALSE G: screens-publish/ceremony.test.mjs:263, screens-publish/fixtures.mjs:42, screens-publish/g54-page.test.mjs:123, screens-publish/public.test.mjs:327, screens-publish/review.test.mjs:214, screens-publish/t50.test.mjs:117
- FALSE I: screens-publish/c47-seam.test.mjs:15, screens-publish/g54-page.test.mjs:15

### screens-action (8)
- FIX-E answer-envelope/storeSilent: screens-action/plan.test.mjs:260 (mechanical)
- CODE BREACH_ON_HYPOTHESIS: no such code; the refusal optionstartpreview carries comes from actions/action-plans; see Uncertain: screens-action/start-send.test.mjs:24
- CODE LEG_ON_ACTION: no such finding code; use a real finding code actions gives under ACTION_BASIS_REFUSED (findingsOf of C-2.10 findings); provider job confirms: screens-action/actionnew-fix.test.mjs:21
- FALSE G: screens-action/join-t51.test.mjs:63, screens-action/plan.test.mjs:232
- FALSE H: screens-action/plan-t51.test.mjs:12, screens-action/real.mjs:54, screens-action/send-t51.test.mjs:16

### control-plane (115)
- FIX-E agent-worker/signinStepAnswer: control-plane/declared-ops.test.mjs:82 (judgment)
- FIX-E capture-sources/renderRefusal: control-plane/r9-seam-safety.mjs:185, control-plane/r9-seam-safety.mjs:209, control-plane/r9-seam-safety.mjs:211, control-plane/r9-seam-safety.mjs:213, control-plane/r9-seam-safety.mjs:221 (judgment)
- FIX-E case-import/importDocumentNotMissing: control-plane/r49-routes.test.mjs:142 (mechanical)
- FIX-E case-inputs/statementAck: control-plane/statementack.test.mjs:22, control-plane/statementack.test.mjs:24 (judgment)
- FIX-E membership/existenceRefusal: control-plane/doorbell.test.mjs:313, control-plane/r45-routes.test.mjs:242, control-plane/r48-routes.test.mjs:194, control-plane/r49-routes.test.mjs:130, control-plane/routes.test.mjs:149 (mechanical)
- FIX-E provenance/homeOfWorld: control-plane/doorbell.test.mjs:425, control-plane/doorbell.test.mjs:494 (judgment)
- FIX-E ratification/noCaseDocument: control-plane/converts.test.mjs:111 (mechanical)
- FIX-E store-door/internalErrorAnswer: control-plane/envelope.test.mjs:317, control-plane/envelope.test.mjs:326, control-plane/envelope.test.mjs:327, control-plane/envelope.test.mjs:337, control-plane/envelope.test.mjs:350 (mechanical)
- FIX-L plane/job-registrar: control-plane/r72-parted.test.mjs:10, control-plane/r72-parted.test.mjs:44, control-plane/r9-seam-limits.mjs:270, control-plane/r9-seam-limits.mjs:278 (judgment)
- FIX-L plane/owed-ledger: control-plane/t51-visitor-copy.test.mjs:32, control-plane/t51-visitor-copy.test.mjs:42 (judgment)
- CODE NO_SUCH_LANGUAGE: real codes are LANGUAGE_MALFORMED / LANGUAGE_NOT_SET (translations): control-plane/r8-words-cache.test.mjs:157, control-plane/r8-words-cache.test.mjs:158, control-plane/r8-words-cache.test.mjs:166, control-plane/t51-interfacewords.test.mjs:98
- CODE NOT_RENDERED: real code is NOT_RENDERABLE (file-scanner render.mjs KNOWN set, status 422): control-plane/r9-seam-reading.mjs:210, control-plane/r9-seam-safety.mjs:31
- FALSE A: control-plane/archive.test.mjs:87, control-plane/doorbell.test.mjs:273, control-plane/envelope.test.mjs:77, control-plane/envelope.test.mjs:90, control-plane/envelope.test.mjs:127 (x2), control-plane/envelope.test.mjs:158, control-plane/envelope.test.mjs:171 (x2), control-plane/envelope.test.mjs:193, control-plane/envelope.test.mjs:194, control-plane/envelope.test.mjs:223, control-plane/envelope.test.mjs:349, control-plane/envelope.test.mjs:350, control-plane/envelope.test.mjs:376, control-plane/envelope.test.mjs:550, control-plane/r100-upload.test.mjs:65, control-plane/r117-held.test.mjs:165, control-plane/r135-job-state.test.mjs:33, control-plane/r8-door-phases.test.mjs:39, control-plane/t41-door.test.mjs:173, control-plane/t50-door.test.mjs:175, control-plane/t50-door.test.mjs:352, control-plane/t51-acquire-timings.test.mjs:62, control-plane/t51-server-timing.test.mjs:83
- FALSE G: control-plane/doorbell.test.mjs:225 (x2), control-plane/inbox-door.test.mjs:144, control-plane/inbox-door.test.mjs:145, control-plane/new-ops.test.mjs:126, control-plane/r117-held.test.mjs:89, control-plane/r117-held.test.mjs:90, control-plane/r117-held.test.mjs:146, control-plane/r123-reading.test.mjs:84, control-plane/r130-jobs.test.mjs:20, control-plane/r9-seam-documents.mjs:514, control-plane/r9-seam-reading.mjs:146, control-plane/r9-seam-reading.mjs:147, control-plane/r9-seam-reading.mjs:149
- FALSE H: control-plane/r123-reading.test.mjs:116, control-plane/t51-round5-door.test.mjs:21
- FALSE P: control-plane/r130-jobs.test.mjs:29, control-plane/r130-jobs.test.mjs:45, control-plane/r133-r134-follow.test.mjs:125
- FALSE R: control-plane/door-routes.mjs:62, control-plane/doorbell.test.mjs:224, control-plane/draft.test.mjs:64, control-plane/draft.test.mjs:93, control-plane/envelope.test.mjs:83, control-plane/envelope.test.mjs:111, control-plane/envelope.test.mjs:209, control-plane/envelope.test.mjs:398, control-plane/envelope.test.mjs:545, control-plane/envelope.test.mjs:562, control-plane/envelope.test.mjs:567, control-plane/inbox-door.test.mjs:138, control-plane/inbox-door.test.mjs:139, control-plane/inbox-door.test.mjs:141, control-plane/inbox-door.test.mjs:142, control-plane/new-ops.test.mjs:121, control-plane/new-ops.test.mjs:122, control-plane/new-ops.test.mjs:123, control-plane/new-ops.test.mjs:124, control-plane/new-ops.test.mjs:125, control-plane/owner-ops.test.mjs:175, control-plane/r100-upload.test.mjs:58, control-plane/r117-held.test.mjs:179, control-plane/r123-reading.test.mjs:145, control-plane/r53-routes.test.mjs:152, control-plane/t36-door.test.mjs:227, control-plane/t36-door.test.mjs:293, control-plane/t37-door.test.mjs:78, control-plane/t37-door.test.mjs:206, control-plane/t37-door.test.mjs:212, control-plane/t37-door.test.mjs:214, control-plane/t42-door.test.mjs:114, control-plane/t46-door.test.mjs:127, control-plane/t48-door.test.mjs:102
- FALSE S: control-plane/door-share.test.mjs:16
- FALSE W: control-plane/t51-visitor-copy.test.mjs:79, control-plane/t51-visitor-copy.test.mjs:92

### plane (93)
- FIX-E acquisition/archiveNotHeld: plane/unpack.test.mjs:40 (mechanical)
- FIX-E acquisition/owedFetchAnswer: plane/fix6-pending.test.mjs:31, plane/fix6-pending.test.mjs:52 (judgment)
- FIX-E acquisition/owedFetchAnswer: plane/fix6-pending.test.mjs:71, plane/fix6-pending.test.mjs:82, plane/r9-jobs.test.mjs:151 (x2), plane/r9-jobs.test.mjs:567, plane/r9-jobs.test.mjs:568, plane/r9-jobs.test.mjs:569, plane/r9-jobs.test.mjs:574, plane/r9-jobs.test.mjs:671 (x2) (mechanical)
- FIX-E acquisition/owedRunAnswer: plane/fix4b-r77.test.mjs:144 (x3), plane/r9-jobs.test.mjs:113 (x2) (judgment)
- FIX-E acquisition/owedRunAnswer: plane/fix4b-r77.test.mjs:160, plane/fix4b-r77.test.mjs:197 (x2), plane/fix5-r77.test.mjs:115 (x2), plane/fix6-pending.test.mjs:84 (x2) (mechanical)
- FIX-E acquisition/unpackWaiting: plane/fix4b-r77.test.mjs:145, plane/fix4b-r77.test.mjs:151 (judgment)
- FIX-E agent-worker/modelSilentEnding: plane/t42.test.mjs:349 (judgment)
- FIX-E ai-accounts/projectKeptAway: plane/t46.test.mjs:160 (mechanical)
- FIX-E answer-envelope/storeSilent: plane/round6-extraction.test.mjs:33, plane/unpack.test.mjs:40, plane/unpack.test.mjs:84 (mechanical)
- FIX-E extraction/readHeldAnswer: plane/fix4-r75.test.mjs:34, plane/fix4b-r77.test.mjs:26, plane/fix5-r77.test.mjs:29, plane/fix6-pending.test.mjs:32, plane/fix6-pending.test.mjs:135 (x2), plane/fix6-pending.test.mjs:145, plane/fix6-pending.test.mjs:156, plane/fix6-pending.test.mjs:174, plane/l75-entry.mjs:57, plane/r7-contention-entry.mjs:66 (x2), plane/r7-contention-entry.mjs:72, plane/r7-lastmem.test.mjs:59, plane/r7-lastms.test.mjs:52, plane/r9-jobs.test.mjs:33, plane/r9-jobs.test.mjs:90, plane/r9-jobs.test.mjs:92, plane/r9-jobs.test.mjs:296, plane/r9-jobs.test.mjs:309, plane/r9-jobs.test.mjs:317 (x2), plane/r9-jobs.test.mjs:337, plane/r9-jobs.test.mjs:360, plane/r9-jobs.test.mjs:393, plane/r9-jobs.test.mjs:404, plane/r9-jobs.test.mjs:454 (judgment)
- FIX-E extraction/readHeldAnswer: plane/fix3-r74.test.mjs:17, plane/fix3-r74.test.mjs:46, plane/fix4-r75.test.mjs:109, plane/fix5-r77.test.mjs:113, plane/l75-entry.mjs:39, plane/l79-entry.mjs:18, plane/r7-keephome.test.mjs:19, plane/watchdog.test.mjs:124 (mechanical)
- FIX-E membership/noSuchProject: plane/t48.test.mjs:183 (mechanical)
- FIX-E ocr-worker/badPages: plane/t46.test.mjs:333 (judgment)
- FIX-E pdf-pixels/pageRefusal: plane/t42.test.mjs:379, plane/t43.test.mjs:117, plane/t44.test.mjs:138, plane/t44.test.mjs:142, plane/t44.test.mjs:157 (mechanical)
- FIX-E reading-pipeline/storeFailedTransient: plane/r9-jobs.test.mjs:318 (judgment)
- CODE CAPTURE_SESSION_GONE: no such reason; owedRun's real finals are RENDER_FAILED, NOT_A_PAGE and DELIVERY_FINAL (CAPTURE_HELD_BY_ANOTHER_BUNDLE, OVERSIZE_INLINE, TOO_LARGE, PROMOTE_NOT_A_PARTICIPANT): plane/fix4b-r77.test.mjs:160
- CODE FETCH_REFUSED, UPSTREAM_SLOW: no such codes; a final owedFetch reason is one of DELIVERY_FINAL, a transient is acquisition's own (STORE_FAILED is reading-pipeline's): plane/fix6-pending.test.mjs:52
- CODE NOT_RENDERED: real code is NOT_RENDERABLE (file-scanner render.mjs KNOWN set, status 422): plane/r8-headofline.test.mjs:52
- FALSE G: plane/r7-keephome.test.mjs:37 (x2), plane/r7-lastmem.test.mjs:22, plane/r7-lastmem.test.mjs:59, plane/r9-jobs.test.mjs:91, plane/r9-jobs.test.mjs:318, plane/t36.test.mjs:54
- FALSE H: bio-plane/test/system/migrate-released.test.mjs:231
- FALSE P: plane/shape/harness.mjs:219, plane/t46.test.mjs:411
- FALSE W: plane/l75-entry.mjs:50, plane/r7-contention-entry.mjs:76, plane/r8-headofline-entry.mjs:25, plane/shape/harness.mjs:329 (x2)

### installer (2)
- FIX-E instance-setup/instanceGroupAnswer: newgroup/test/fixture.mjs:549, newgroup/test/wizard.test.mjs:1115 (mechanical)

### journey-check (4)
- FIX-E plane/servedPlane: journey-check/fake-plane.mjs:37, journey-check/live.test.mjs:18 (judgment)
- FALSE A: journey-check/walker.test.mjs:45, journey-check/walker.test.mjs:156

## Check rules

- A Input to the user module's own code (44): literal is an argument, scripted reply or hook result fed to the user module's own function, relay, door or hook, and the test asserts that code's handling (envelope, status, redaction, hook order), reading at most ok/status/reason as an opaque value. Examples: answer-envelope/envelope.test.mjs:31, control-plane/envelope.test.mjs:158.
- R Round trip (37): the literal's `reason` is asserted back unchanged on the user's own output (the user passes the owner's answer through); extend the existing pass-through exemption from class `code` to class `answer` (reason also appears as an expected value in an assertion of the same test). Examples: store-door/dispatch.test.mjs:63, control-plane/new-ops.test.mjs:122.
- G Synthetic code or reply on purpose (46): a made-up code or generic reply (X, NOPE, ZZ_*, SOMETHING_ELSE, NOT_A_CODE, R9_*, STORE_DOWN, UNKNOWN_ROUTE, a scripted-service fall-through) used to prove the user's handling of a code it holds no word for or of an outage; no product module is meant to give it. Examples: interface-shell/p9.test.mjs:71, screens-action/plan.test.mjs:232.
- H Harness or builder helper (13): a generic builder whose code arrives as a parameter (`refused(code)`, `refuse(code)`, `refusedBody(code)`), or a local data builder (`partsOf`, `harness.mjs`, `real.mjs`) in the user's own test support; the hand-built answers are at its call sites, which the check does not follow. Examples: interface-shell/harness.mjs:22, screens-action/plan-t51.test.mjs:12.
- P Platform double (6): Durable Object stub (`newStub`, `stubFor`, `fakeStub`, `stubOf`) or browser IndexedDB double; add `IndexedDB`, and a `stub`/`newStub`/`stubFor` whose body is `fetch(` of a DO, to PLATFORM_DOUBLE. Examples: interface-shell/harness.mjs:124, plane/shape/harness.mjs:219.
- W Wrapper, tripwire or hang (11): a replacement of a service method that delegates to the real method, restores it, throws, or never answers (`boom`, `() => new Promise(() => {})`, `async () => { throw }`), or counts calls then calls the real one; it builds no answer. Examples: store-door/routes.test.mjs:123, plane/l75-entry.mjs:50.
- S Sentinel probe (4): answer made of the probe's own name (`${who}_ANSWERED`, `HOOK_REACHED`) to show which object the user called; the answer carries no provider shape. Examples: store-door/pull.test.mjs:311, control-plane/door-share.test.mjs:16.
- I Import of a published fixture (2): an identifier named stub*/*Stub imported from a provider's own `fixture.mjs`/`fixtures.mjs` (that import is the remedy, not a hand-built double). Examples: screens-publish/c47-seam.test.mjs:15, screens-publish/g54-page.test.mjs:15.
- CODE (16): not a check rule; 16 findings name a code no product file gives; each is listed under its user as CODE with the real code or defect. 14 have an existing real code to use (named); screens-action actionnew-fix.test.mjs:21 and start-send.test.mjs:24 have none found (see Uncertain 5).

## Uncertain

1. Builders hide the real candidates (rule H, 13 findings: interface-shell/harness.mjs:22,23; screens-wizards/fixtures.mjs:6; screens-settings/fixtures.mjs:7; screens-intake/r9-parts.test.mjs:17; screens-inquiry/fr2-question.test.mjs:14, fr3-question.test.mjs:11; screens-action/plan-t51.test.mjs:12, send-t51.test.mjs:16, real.mjs:54; control-plane r123-reading:116, t51-round5-door:21; plane migrate-released.test.mjs:231). The hand-built owner answers are at the call sites (`refusedBody("BASIS_VERSION_REFUSED", ...)`, `refuse("...")`), which the check does not list. A re-point from this list misses them; BOB should have the check follow a builder to its call sites (a function whose body is a refusal literal parameterised by its code) before the user jobs run.
2. Scripted plane tables (screens-settings/fixtures.mjs, screens-investigate/fixtures.mjs, screens-daily/fixtures, screens-wizards/fixtures.mjs, control-plane `world({answer})`) hand-build hundreds of owner answers; only those carrying a `reason`/`ok:false` key are in this list (the 5 at screens-settings/fixtures.mjs are a sample). The provider fixtures named here cover only the listed lines. BOB decides whether the user jobs for screens-* re-point whole tables (then each owner publishes one fixture per op it answers) or only the listed lines.
3. Rule R (round trip) is a policy call. 34 findings in control-plane and 3 in store-door are real owner codes (NO_SUCH_KNOCK, KNOCK_DISCARDED, TASK_NOT_YOURS, MINT_EXHAUSTED, SAFE_VIEW_ONLY, CURRENT_PASSWORD_WRONG, TRANSLATION_TEXT_REFUSED, TRANSCRIBE_NOT_DEPLOYED, AI_PART_NOT_DEPLOYED, NO_SUCH_NOTE, SET-aside codes, GRANT_*, ...) that the test hands to the door and asserts back unchanged; I took them as inputs (the door under test passes the owner's answer). If K4990 wants a provider-published refusal even for pass-through, they become FIX-E mechanical; owners then: doorbell, capture, tasks, record-core, file-safety, credentials, translations, hypotheses, extraction, run-rules, steps.
4. job-registrar (control-plane r72-parted:10,44; r9-seam-limits:270,278): the stub is test-support's file (job-registrar-stub.mjs, module test-support), not the user's. The check resolves its provider to plane (later), so FIX-L to plane is as the check reads it; BOB may rule instead that test-support's stub carries its own contract.
5. CODE with no obvious real code: screens-action/start-send.test.mjs:24 (BREACH_ON_HYPOTHESIS, the refusal `optionstartpreview` carries from action-plans/actions) and screens-action/actionnew-fix.test.mjs:21 (LEG_ON_ACTION, a finding under ACTION_BASIS_REFUSED). I found no existing code that fits; the action-plans/actions provider jobs must name the real one, or the product lacks it (defect: actions).
6. Provider choice by where the code lives, not who relays: signin-door/signinRefusal (codes born in agent-runner/agent-worker, answered through signin-door); pdf-pixels vs pdf-worker for PAGE_HAS_TEXT_LAYER (pdf-pixels' files are pdf-worker/src/pagepixels*.mjs); case-disclosures vs case-authoring for the publish pre-flight (gates are case-disclosures'; the pre-flight composite is case-authoring's, whose PREFLIGHT builder in screens-publish/fixtures.mjs is not flagged); acquisition vs capture for EMPTY (R-classed).
7. extraction/readHeldAnswer (35 findings in plane): the `more`/`detail.cursor`/`counters`/`killed`/`next_page` pieces may be a job protocol plane's pending.mjs defines rather than extraction's real answer. The provider job must check that real readHeld, run over a fixture multi-piece capture, can give them; if not, these become FIX-L (plane defines, extraction conforms) and the contract runs in extraction. plane/r7-lastmem.test.mjs:22,59 pass answers through plane's own `pendingOf(ctx, {workers})` seam (invented AGAIN, SLOW taken as G).
8. journey-check/fake-plane.mjs:37 and live.test.mjs:18: `fakePlane` is a whole fake of the plane HTTP surface (flaws, adminActs, doors). Replacing it by the real served plane is a design choice (judgment), not a swap.
9. G cannot be told from CODE by the check: deliberate unknown codes (NOT_A_CODE, SOMETHING_ELSE, ZZ_REASON, NO_SUCH_DOOR_CODE, NO_WORDS_FOR_THIS_CODE) exist to prove the fallback for a code with no word. Suggest the check accept a one-line marker `// fixtures-generic: <CODE>` and skip a code so marked; rule G has 46 findings here, 11 of them class `code`.
10. Ordinal assumptions where one line carries several findings of the same kind (assigned in listing order): screens-settings/fixtures.mjs:176 (#1 assistantstate, #2 aikeepawaystate), plane/fix6-pending.test.mjs:52 (owed, then refusal), plane/r9-jobs.test.mjs:318 (STORE_FAILED, then R2_HICCUP), plane/r7-lastmem.test.mjs:59, plane/unpack.test.mjs:40, control-plane/envelope.test.mjs:350. A user job should read each such line whole.
11. Not read to the end: store-door promotion-step.test.mjs:163 (PROBE_REFUSED, taken R from its asserts at 138, 176); control-plane t50-door.test.mjs:175 (taken A: the door reads ok only); screens-settings/connect.test.mjs:157 (the 5 SIGNIN_* codes plus a spec-driven list; one fixture by code assumed).

## Verification

Counts per class: FIX-E 147 + FIX-L 8 + FALSE 163 + CODE 16 = 334 = lines in the slice (fx-part-4.txt, 334 lines). Each finding is classified once; findings sharing a file:line are shown `(xN)` and counted N times.
