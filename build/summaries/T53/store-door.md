# Task summary · T53 · store-door

Stands for: build/plan/current.md lines 453-460 (the module's plan block); build/plan/T53-R1/store-door.md (rows file); build/requirements/store-door.md (R1-R21; R20, R21 marked not yet met, T53); build/layers.md (head; layer 11 row: store-door follows admission and answer-envelope, precedes signin-door); and the Public part (Purpose, plus the services store-door names) of each used module's requirements file. Sources stay binding; "read R<n> whole" marks a compressed requirement, and the job reads any cited section in full when its work touches it.

## Entries

- T53-553 (current.md:454; K5677; credentials R72 retired): `routes.test.mjs` calls `aiAccountsOf(ctx)` and reads `ai-accounts`' `AI_ACCOUNT_CHECKS`, never credentials' delegates or its `ACCOUNT_CHECKS` view. This is R16 (read R16 whole); `ai-accounts` R32 (`aiAccountsOf(ctx, {record, membership, sealSecret})`) and R33 (`AI_ACCOUNT_CHECKS`, `AI_WORDS` keep rows, codes, words).
- T53-367 (current.md:455; N1264): one RPC admits, stamps, runs: R20 (read R20 whole) with `admission` R34 (`admit` callable inside the room; parity of R1-R12, R14 refusals; R8 before R9 before R10 before R11).
- C T52-44 (current.md:456; rows file, carried-T52-R1.md): W22, B-K1 pull filer, BLOCKER: `pull.mjs` files the knock through provenance's helper (after W5). Red then green: the knock to "Vouched for by ...". PL1 W22. Touches R7 (read R7 whole).
- C T52-45 (current.md:457; rows file): N1264, K4599 (a): the admission fold and the combined read in one object call, with admission and op-declarations: R20, R21. Rows file: `platform/combined-read-and-fold-draft.md` §3 (one RPC admits, stamps, runs; `screenread` inside it; slow reads cut, PL14, PL15); after-figures compared with P-22's bar (plan-T53-platform-rows.md: administrator Home 3,526 ms, Queue 3,456, Add 2,752, Project 4,768 net; slow reads `bootstrap`, `memberlist`, `grouplanguages`, `profiles`, `queue`, `heldcaptures`) on the same seed against the budget class (`time-budgets-draft.md` §2). Cite R20, R21.
- T53-368 (current.md:458; K5457): off the retired AI ops (FOLD-AI §2.8, rows file): store-door re-points the retired AI ops and service names in the same round, no aliases (ai-accounts For BOB 6): R16, R10, R11. See Source gaps.
- T53-369 (current.md:459; K5565): English in tests, the module's own entry (rows file, plan-T53-tests-english.md): convert the module's English-in-test sites to the word key and its values; each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site first gets its key in the module (a words row, UX-DESIGN's wording where shown to a member); a C site is input data or a dead assertion: kept or removed with its reason; every test the job touches for other entries is converted with it. Sources `tests-sweep/CENSUS.md`, `CENSUS-RX.md`. Module: literal A/B files 0 / 0; regex A/B/C sites 2 / 1 / 1 (3 files). Test: the words check's baseline loses the module's files, the module's suite is green. Model `sonnet-5-5` where a B site needs a module key first (BOB #324, K3518). R17's `store-door.declared.groupdescriptiondraft` is a words key.

## store-door (own requirements)

### Public

Purpose (R1): the record store's door `dispatch(req)`: routes each internal request to the module map serving it, answers a project-naming read with the existence act first, refuses a purge a litigation hold forbids, holds the promotion step the old store registered, files a doorbell pull and its promotion as one act, resolves the assistant for a draft before the draft's handler. It decides no route's behaviour; the envelope is `answer-envelope`'s. The door is reached only from the Worker through `plane`'s store; a stamp is set by `control-plane` from the authenticated caller (`store-request` R4) and the door reads stamps from the request, never a body's own fields.

- R1 (was control-plane R26): empty POST body is `null`; a non-JSON body is refused 400 `BAD_JSON`; a route no module serves is refused 400 `unknown op: <op>`; an answer is `{ok: true, result}`; the routes are the modules' own maps (the `membershipOps` pattern).
- R13 (K2157): a route-map answer that is a `Response` (`file-safety`'s `openoriginal`, `openwithwarning`, `safeview`, `safecopy`) is returned as given, status, headers and body unchanged, never wrapped in R1's envelope.
- R2 (was control-plane R27; G12c, K4571; read R2 whole): a read whose parameters name a project (declared `PROJECT_NAMING_READS`), with a stamped `viewer` and naming a discoverable project, is answered by `membership.existenceAct` first (C-70.1) before its route runs; reads naming no project are listed with the reason. `PROJECT_NAMING_READS` also holds list keys `casedrafts` `projects` and `inquirystrength` `ids` (`PROJECT_NAMING_LISTS`). A list of bundle ids is fenced id by id: each distinct id asked of `visibilityOf`, and `existenceAct` for a discoverable one; a project seen only at EXISTENCE is answered with the single read's answer for that id byte for byte, the lowest such id when several (order independent); a hidden or fully seen id falls through with the list as sent. A list is an array (body, or a string) or in the query a JSON array, comma list or repeated key, split on anything that cannot be in an id; a comma in a single `id` is not a list. The door never truncates (the bound is the owner's). `reviewcopy`'s `drafts`/`draft` are draft ids: unfenced, among the reads naming no project. Test (`dispatch.test.mjs`): five spellings, six id mixes, controls, order independence, one `visibilityOf` per distinct id, no viewer, malformed lists, `reviewcopy` unfenced.
- R3 (was control-plane R47; DEC-113, DEC-36): `projectholds` (`actions` R58) is among the reads naming no project (R2), because it answers each project the viewer does not see at `FULL` as `held: null`, never refused. `actionholdrelease`, `actionholdpreview`, `projectholds` are routed through `actions`' own map (R1) with the stamps `op-declarations` R12 declares, none taken from the caller (control-plane R29).
- R4 (was control-plane R46; DEC-113; K1252, K1253; read R4 whole): an `op=purge` reaching the `bio` namespace store (the object's own name, `store-assembly` R2) is refused 409 `PURGE_HOLD_IN_PLACE` (C-69.5, row in `answer-envelope` R8) when `actions.purgeHeld({bundleId})` (actions R60) answers `true`: the whole-store purge (`bundleId` absent or empty) while any litigation hold is `in_place`; the single-bundle purge of material in a held project, of an action carrying a standing hold, or of a bundle whose project cannot be determined. A failure to ask refuses too. The check runs before `record-core`'s `purge` arm (R72): nothing cleared, read for proof or written. The refusal names no action, project, member or bundle but the `bundleId` asked. A removal ordered while a hold stands waits for the release (`op=actionholdrelease`, actions R56). A purge reaching the `scratch` store is never refused for a hold.
- R5 (was control-plane R42; K764, K861; provenance R52; read R5 whole): the door holds the promotion step `legacy-store` registered (`store-assembly` R100); it exports the step whole for `store-assembly` to register under this module's name, registers nothing itself, edits no file of `plane`'s. The step is `provenance`'s `testimonySlot()` (`check`; `project`, whose refusal rolls the promotion back and whose `testimony` joins the answer on the testimony path only) and `membership`'s sight index (`reindexProjectSight` on every promotion, D-497). It runs at `legacy-store`'s old rank: `check` after the checks of every module before that place (`monitoring`'s included) and before `tasks`', `project` after those modules' projections and before any later module's, all else as today.
- R6 (was control-plane R25, the store's half; Worker's is answer-envelope R5): an error thrown anywhere in the door is answered `STORE_INTERNAL_ERROR` (C-69.4) with a correlation id; never the stack, message, path or line; the stack is logged server-side under the correlation id.
- R7 (was control-plane R36; N364, DEC-78 item 1; N826, K2656; read R7 whole): the pull (`pullAndFile`, internal route `inboxpullfile`) reached by `op=inboxpull` pulls through `doorbell`'s `pullKnock` (doorbell R13) with `by` and `viewer` as stamped (so `holder` is answered to a viewer who may see the holding bundle; K5129), and in the same act promotes the pulled document as a new information bundle at `collected`, the puller its author, its title a sentence naming no knock id (the knock's instant instead; `screens-intake` R32 (3)). Pull and promotion are one act through doorbell R13's `within` (K559, K580): a refusal or fault of either leaves neither written; a fault answers a fixed sentence, never store text. `op=inboxresolve` with `status: "pulled"` is that pull reached as doorbell R3's resolve (`inboxResolve`) and takes its reason: absent, not a string, blank or over 2,000 characters is refused `RESOLVE_NO_REASON` (C-118.7, 400, doorbell R21's row alone) before anything is written; an admitted reason is carried to doorbell and recorded with the pull in the one act; `op=inboxpull` takes no reason (K1023). `inboxpullfile` hands `pullAndFile` `doorbellOf(ctx)` as `deps.doorbell`, never `captureOf`.
- R8 (was control-plane R50): internal route `wizardrefusaltally` calls `wizard-scripts.tallyRefusal(op, code)` (its R16) with the op and code given, nothing else about the call.
- R9 (was control-plane R59; K1943, K2038; N761, K2129, K2175; read R9 whole): the door reads a stamped `session` and an ask's `grant` from the request's body or a header, never its query, and places no credential, secret or digest of either in the address of any request it makes. Headers: `x-bio-session` (a stamped session; the token `admission` asks `session` to resolve), `x-bio-grant`, `x-bio-credential-sha` (the digest `admission` asks `aicredentiallook` to resolve); each value goes to its owner's map on the in-process URL object passed to `store.routes(url, body)` (as `session`, `grant`, `t`, `sha`), no request's address. A grant's `secretSha` (review, template, case edition, statement acknowledgement, and `aicredentialmint`'s) reaches the owners' maps only in the internal request's body, handed to `store.routes(url, body)` as it arrived: no `secretSha` on the in-process URL, no header for it, and one found in the query is removed from that URL before any owner's map receives it (credentials R53, review R29, ratification R32, case-inputs R5, filing-templates R27).
- R10 (was control-plane R57; K1943; N812, K2373; K2500; read R10 whole): for the three drafts (`groupdescriptiondraft`, `writinghelp`, `translationdraft` both directions) the door resolves per act `assistant`: `{on}` from `instance-setup`'s `assistantState` and `{account}` from `ai-accounts.accountFor` for the stamped member, kind `draft` (R7, R11; never the key), and passes it to the handler. Before any model turn it answers in order: `AI_KEPT_AWAY` as `ai-accounts.aiKeptAway({use: "draft"})` answers it (R7); then `NO_ACCOUNT` (R7), `AI_USE_SWITCHED_OFF` (R11), then `ai-use.useCheck`'s `AI_LIMIT_REACHED` (R3). These come after the handler's own first refusal: `groupdescriptiondraft`'s `NOT_AN_ADMIN`, `translationdraft`'s refusal of a member who may not translate that language or, for `to_english`, is not an administrator. The account and limit are answered by `answers.askAccount` (answers R30) for the stamped member, kind `draft`, in place of the door's own `accountFor` and `useCheck`: its refusal (`NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED`, fail-closed `LIMITS_UNREADABLE`, `ACCOUNT_UNREADABLE`) is answered as given at that place in the order, and the handler's `assistant.account` is `{kind, level}`, never the key. `translationdraft` (K2238): first `translations.translationDraftRefusal` (its R1), relayed as given; then the gate (`ai-accounts.aiKeptAway()`, then `answers.askAccount`); then `translationDraft` with `assistant = {on, account: {kind, level}}`.
- R15 (T47; K3143; admission R25, credentials R71): store-internal route `reauthdue` (no op spec, `op-declarations` R6) answers `{due}` from `credentials.reauthDue({token})`, the token being the `x-bio-session` value handed on as `session`; a token naming no session answers `{due: false}` and the admission gate's own session read refuses it. Test with a control.
- R11 (was control-plane R53, store half; K1674, K1685, K1974; read R11 whole): a read served under an ask's grant (R9's `grant`) is recorded in the grant's read log through `store.logRead` (`answers`' `logRead`, handed by `plane`), its answer scrubbed there and answered as recorded; `rule` records its own (answers R7). A read that cannot be recorded is answered as R6, never unrecorded. The ask's store-internal routes, each its owner's, with the member the stamped viewer: `aigrantadmit` (credentials R28), `askceiling` (answers `askAccount({member: viewer, kind: "ask"})`'s refusal as given, else `{ok: true}`), `askusage` (counts through `ai-use.countAskUsage({member: viewer, mode, usage, calls, owner})`, `mode` the body's, `ask` when absent, `owner` the paying account `ai-accounts.accountFor` answers, "not recorded" when none) and `askcheck` (answers R4, over the grant's read log). Each read is recorded with the grant's `use`: `draft` for a grant minted for a draft (`store-assembly` R49), else `ask`, so rows of projects `projectsKeptAway({use})` names are removed first; the plane's `logRead` (plane R33) supplies the `use` and the door adds none. `writinghelp` is called with the door's account and limit answer in `assistant.refusal` (keep-away stays first at the door) so `writingHelp` orders the refusals as wizard-scripts R27 says.
- R16 (T48; N996; K3101; `extraction/credentials-split.md` §5; read R16 whole): the door reads `aiKeptAway`, `accountFor`, `subscriptionConnected` from `ai-accounts` (its R7, R18), in R10's gate, R11's `askusage` owner and the store-internal routes `aikeptaway` and `subscriptionconnected`, never through credentials' delegates. Two such routes (no spec, `op-declarations` R6) join `controlPlaneRoutes` beside `aigrantadmit`, for `signin-door` R1: `aikeptaway` answers `credentialsOf(ctx).aiKeptAway() ?? {ok: true}`; `subscriptionconnected` answers `credentialsOf(ctx).subscriptionConnected({member: q("by")})` (as worded; R16 moves both to ai-accounts). The door keeps `credentials` for `aiGrantAdmit`, `signerRegisterOwn`, `signerRevokeOwn`. Every answer, refusal and order is unchanged. Test: each route answers as before with credentials' delegates removed.
- R14 (T47; N970; amends R2): `PROJECT_NAMING_READS` gains `statusreportassist` with parameter `plan` (a `PLN-` bundle id), as `statusreportdraft` is held, so a plan's project seen only at `EXISTENCE` is answered by `existenceAct` first. `projectquestions` is held in `PROJECT_NAMING_READS_NOT` (answers a project the viewer does not see at `FULL` as an empty page, never refused; basis-versions R50), as `projectholds` is (R3); `projectlist` names no project. Control: `statusreportassist` naming a plan in a discoverable project seen at `EXISTENCE` answers C-70.1; `projectquestions` for such a project answers its empty page.
- R17 (fix round; K4206; op-declarations R80, op-grades R49): the door's map states `DECLARED_OPS` beside `controlPlaneRoutes`: `groupdescriptiondraft`, a read that writes nothing (`mutating` false, `weight` `read`, registers without refusal under op-grades R49, K4247), for an administrator or a member, `by` and `viewer` stamped from the query; `fields.accepts` and `fields.requires` are `answers`; its handler refuses an absent or malformed `answers` naming it (`GROUP_DRAFT_ANSWERS_MALFORMED`). `assistant` is resolved by the door and declared nowhere. Description is the localized `store-door.declared.groupdescriptiondraft`. Test (`declared-ops.test.mjs`, `declaredOpHolds`): a call without `answers` is refused naming it, a body field outside `accepts` is dropped; a control shows a false declaration is refused.
- R18 (F6; K4487; control-plane R123): `inboxpull` answers `sha` (the capture digest) and `reading_pending: true` unless the document carries a reading or extraction already holds one; a refusal carries neither; the door then reads it. Test: a 3 MB PDF knock pulled by every path (direct, repeated, `pulled` resolve, pull-around): each answer names it pending.
- R19 (G127f; K4928; capture R113, control-plane R72): a POST to an op of `STREAMED_BODY_OPS` (`captureupload`, `captureuploadpart`) is handed its request's own body stream, unread, never `BAD_JSON`. Test: binary non-JSON bytes to `captureuploadpart` reach capture's arm as `bytes`, stream unread; control: a JSON op's body is parsed as before.
- R20 (T53; N1264, K4599 (a); PL14; admission R34; NOT YET MET: T53; read R20 whole): the room's RPC `admitted(op, request)` resolves the session, judges admission (`admission.admit`), stamps and runs the op in one call; `screenread` (`op-declarations`) runs its waves inside that one call. The answer carries `in_ms` and the per-read times, which the door reports as `Server-Timing` (`do-<route>`, `in-<route>`; control-plane R121 stands). Test: a `whoami` makes one call to the room (counted by the test double), `groupidentity` one, `bootstrap` one, `queue` one.
- R21 (T53; N1264, K4599 (a); PL15; K4354; NOT YET MET: T53): a read in a combined answer that would run longer than its declared bound is cut, answered `ok: false, status: "slow"` with the bound; the other reads are not held. Test: a read made to exceed its bound is cut and answered `slow` with its bound; the rest answer whole.

### Private

- Uses (R2, R5, R7, R10, R11, R15, R16, R20): the modules in the `## Uses` sections below (each cited at its service); `capture` in tests only (the shared fixture composes it as the composition root does; R7's negative control names `captureOf`); `ai-accounts` and `admission` are new edges (admission 154 before store-door 156). `actions`' `purgeHeld` (R4) and the routes' own maps are reached as `plane` composes them (R1); `plane` uses this module (`plane/store.mjs`:69-70), not the reverse (P4).
- R12 (invariant; copy of control-plane R33): no place is named in this module's behaviour or outward text.
- R1, R9, R5 (suggestions): the job copies `dispatch.mjs`, `pull.mjs`, `step.mjs` whole into `bio-plane/src/store-door/`; `dispatch.mjs` reads `DISPATCH_CHECKS` from `answer-envelope`; `dispatch.mjs`:220's grant read leaves the query (R9); whether `plane` registers the step under `store-door` or keeps `control-plane`'s name is the job's to report. Tests moving (R2, R4, R5, R7): `dispatch.test.mjs`, `purge-hold.test.mjs`, `promotion-step.test.mjs`, the `pull.mjs` cases of `inbox-door` and `doorbell`. `controlPlaneRoutes` keeps its exported name (R1).

## Uses: setup-words

- Purpose only (§ Purpose; T53-369): the interface's word list as frozen data (`words.json`), the key and value source for the English-in-tests entry.

## Uses: record-grammar

- Purpose only (§ Purpose; no service named by store-door).

## Uses: record-core

- Purpose (§ Purpose; R4): owns storage: id allocation, leases, append-only history, purge; no member or promotion write path.
- R22 (record-core; store-door R4): with no `bundleId`, purge clears every row of every declared non-exempt table; with one, only rows keyed to it; undeclared tables untouched.
- R72 (record-core; store-door R4): `recordCoreOps` route arms keyed by op name (`allocid`, `lease`, `snapkeycensus`, `digestcensus`, `stats`, `audit`, `purge`), parameters from `url`'s query. `purge` from `bundleId` (absent or empty is the whole store) runs in one `transact`, clears `capture-requests` rows whose `lead_inquiry` names a purged bundle, answers `{ok: true, scope, before, after, removed}`. Read R72 whole when touching purge.

## Uses: membership

- Purpose (§ Purpose; R2): who the members are and what each may do; projects, visibility, the fence; no credential.
- R77 (membership; store-door R2, R14): `existenceAct(projectId, viewer)` answers `PROJECT_SEEN_NOT_A_PARTICIPANT` (C-70.1: id and name only) when `viewer`'s sight is existence only (R43), else `null`; `null` when no `viewer`. An administrator at a hidden project's `EXISTENCE` also gets `owners` (R65's order). Never throws. R78: `noSuchProject` is asked after R77.

## Uses: credentials

- Purpose (§ Purpose; R15, R16): passwords, sessions, reauth, signer keys, the grant an ask reads under; which AI account serves an act is `ai-accounts`'.
- R71 (credentials; store-door R15): `reauthDue({token})`, in-plane, answers `null` while the window is open, else `REAUTH_DUE` (a locked or ended session included).
- R9, R10 (credentials; store-door R16): `signerRegisterOwn({keyB64, comment, by})` (`op=signerregister`, also `signerregisterown`; its refusals are credentials R9's); `signerRevokeOwn({keyB64, by})` (`op=signerrevoke`, also `signerrevokeown`).
- R28 (credentials; store-door R11): the grant class holds `AI_GRANT_OPS`: a request under a grant is admitted only for a listed op and only as a read, else `GRANT_OP_REFUSED`; `answers` holds the same list as `ASK_SCOPE` plus `rule`.
- R53 (credentials; store-door R9): `aicredentialmint`'s `secretSha` only from the body, never the query; one not 64 lowercase hex is `AI_CREDENTIAL_NO_SECRET`. R72: retired (T53, K5457).

## Uses: promotion

- Purpose (§ Purpose; R5, R7): the one write path for a bundle; whole-promotion refusal.
- `promote(pkg)` (promotion; store-door R7): `pkg` is `{bundleId?, base, files, meta, snapKey, author, writer?, operation?, register?, drop?, replay?, visibility?}` plus the caller's identity stamps; answers `{ok:true, bundleId, bundleSha, rowVersion, owner, ...}` or `{ok:false, reason, ...}`.

## Uses: provenance

- Purpose (§ Purpose; R5): the record's trust root: register, receipts, capture grade, firsthand observation.
- R52 (provenance; store-door R5): `testimonySlot()` returns `{check(c), project(c)}`, no-ops without the testimony path (record-grammar R28's), else runs every registered `check`, then after commit every `project`, once each, in `MODULE_ORDER` (membership R83: `extraction`, `content`, `observation-log`); the first refusing check refuses the promotion as it came; a throwing projection rolls the promotion back; answers join into `testimony`.

## Uses: capture

- Purpose (§ Purpose; R19): brings material in with provenance, writes no bundle.
- R113 (capture; store-door R19): a file past the request-body ceiling is sent in parts: `beginPartedUpload` (`op=captureuploadbegin`), `putUploadPart({upload, index, bytes, sha256, by, declared, ledger})` (`op=captureuploadpart`), `completePartedUpload` (`op=captureuploadcomplete`), `abortPartedUpload` (`op=captureuploadabort`); begin refused `TOO_LARGE` 413 against `CAPTURE_MAX`.

## Uses: sources

- Purpose only (§ Purpose; no service named by store-door).

## Uses: answers

- Purpose (§ Purpose; R10, R11): the plane's half of the assistant: what an ask may read, the checks every answer passes, rule services, standing questions.
- R2 (answers; store-door R11): a read under a grant never answers or counts a declared tie (`MTI-`), a source-to-person link, or a row of a project hidden from the asker; those rows are removed before the read log records the answer. R30 widens: also rows of projects `ai-accounts.projectsKeptAway({use})` names.
- R4 (answers): `checkAnswer(answer, {readLog, viewer})` withholds each failing sentence (`askcheck`). R7: `ruleAnswer({service, args, viewer, at?})`, unknown service `RULE_SERVICE_UNKNOWN`, recorded in the grant's read log.
- R30 (answers; store-door R10, R11): an ask calls `accountFor` with kind `ask`, a standing question kind `standing`, judged by `ai-use.useCheck`. `askAccount({member, project?, at?, kind?})`: `kind` `ask` when absent, or `draft`; any other is refused as ai-accounts R3 refuses it.

## Uses: wizard-scripts

- Purpose (§ Purpose; R8): the authored wizard step lists, their checks and unattributed daily tallies.
- R16 (wizard-scripts; store-door R8): `tallyRefusal` adds one to an unattributed tally per (op, code) and per day, keeping nothing else.
- R27 (wizard-scripts; store-door R10, R11): `writingHelp({op, field, told, draftHeld, assistant, by, viewer})` (`op=writinghelp`); refusals in order: R24's codes; `WRITING_HELP_NOTHING_TOLD` (`told` empty or over 4,000 characters); `AI_LIMIT_REACHED` (ai-use R3) and `AI_USE_SWITCHED_OFF` (ai-accounts R11); then `ASSISTANT_DRAFT_UNAVAILABLE`. Its keep-away asks `ai-accounts.aiKeptAway({use: "draft"})`.

## Uses: affordances

- Purpose only (§ Purpose; no service named by store-door).

## Uses: tasks

- Purpose only (§ Purpose; no service named by store-door).

## Uses: queue

- Purpose only (§ Purpose; R20): the member's one feed; `queue` makes one room call in R20's test.

## Uses: instance-setup

- Purpose (§ Purpose; R10): what a group's Civicsmith is: slug, name, domain, profiles, self-reports.
- R53, R55 (instance-setup; store-door R10): `assistantState()` answers `{on, set_by, set_at, reason}` from `ai-accounts.aiKeepAwayState()`: `on: false` exactly while the group keeps material away (an unreadable state reads as kept away); gates nothing. `assistantGate()` stays exported, answering `ai-accounts.aiKeptAway()` as given (`null`, else `AI_KEPT_AWAY` with `keep_away: {reason, set_by, set_at}`). `ASSISTANT_OFF` (C-119.5) retired. R67 retired into `translations` R1.

## Uses: answer-envelope

- Purpose (§ Purpose; R4, R6): the shape of every answer: refusals decorated with their catalogue row, a fault with a named code and correlation id; routes nothing, admits no one.
- R8 (answer-envelope; store-door R4, R6): holds the rows C-69.1, C-69.2, the two internal-error rows, C-68.2-C-68.4, C-66.6, C-69.5 and C-61.1, codes, checks and translations unchanged; `where` for C-69.4 and C-69.5 is `src/store-door/dispatch.mjs`. `DISPATCH_CHECKS` answers the rows store-door mints. R14: C-69.6 retired. R16: `SIGNINTRACE_NOT_TEST` joins `DISPATCH_CHECKS`. R5: the Worker's `PLANE_INTERNAL_ERROR`.

## Uses: attestation

- Purpose only (§ Purpose; no service named by store-door).

## Uses: provenance-routes

- Purpose only (§ Purpose; no service named by store-door).

## Uses: calibration

- Purpose only (§ Purpose; no service named by store-door).

## Uses: extraction

- Purpose only (§ Purpose; R18): readings from captured bytes; related to R18's reading of a pulled document (control-plane R123).

## Uses: content

- Purpose only (§ Purpose; no service named by store-door).

## Uses: entities

- Purpose only (§ Purpose; no service named by store-door).

## Uses: connections

- Purpose only (§ Purpose; no service named by store-door).

## Uses: progressions

- Purpose only (§ Purpose; no service named by store-door).

## Uses: bias

- Purpose only (§ Purpose; no service named by store-door).

## Uses: observation-log

- Purpose only (§ Purpose; no service named by store-door).

## Uses: retrieval

- Purpose only (§ Purpose; no service named by store-door).

## Uses: inquiry-grammar

- Purpose only (§ Purpose; no service named by store-door).

## Uses: inquiry

- Purpose only (§ Purpose; no service named by store-door).

## Uses: basis-versions

- Purpose (§ Purpose; R14): an inquiry's basis versions and the version a project stands on. R50 (basis-versions): `projectquestions` answers a project the viewer does not see at `FULL` as an empty page, never refused (cited by store-door R14).

## Uses: contradiction

- Purpose only (§ Purpose; no service named by store-door).

## Uses: run-productions

- Purpose only (§ Purpose; no service named by store-door).

## Uses: capture-requests

- Purpose only (§ Purpose; R4): record-core R72's purge clears rows whose `lead_inquiry` names a purged bundle (capture-requests R35).

## Uses: intent

- Purpose only (§ Purpose; no service named by store-door).

## Uses: file-safety

- Purpose (§ Purpose; R13): keeps every captured file safe to open without touching its bytes, digest or grade.
- R8 (file-safety; store-door R13): `openOriginal({captureSha, viewer, override, warned})` (`op=openoriginal`, also `op=openwithwarning` with `warned`) answers the capture's bytes exactly as `capture.getCapture` serves them, digest header equal to `captureSha`, or the first refusal (`FILE_NOT_HELD` first); with `safeview` and `safecopy` these are the `Response` answers R13 returns unchanged. R51: a member viewer is refused `FILE_NOT_HELD` for a capture whose home is not found.

## Uses: ai-use

- Purpose (§ Purpose; R10, R11): what each AI account has spent and may spend; holds no credential and does not choose the account.
- R3 (ai-use; T53, not yet met; store-door R10): `useCheck({owner, member, use, at, entry_id?})` answers `null` or `AI_LIMIT_REACHED` with `{whose, scope, unit, period, source, resets_at?, walkable}` and its plain-words row, naming no cost.
- R1 (ai-use; T53, not yet met; store-door R11): `countAskUsage({member, mode, entry_id, label, usage, calls, at})` counts an ask or a draft, `mode` `ask` or `draft`, its owner as `accountFor` answered it; any other `mode` is `AI_RUN_CONSUME_INVALID`; reads no price table. Read ai-use R1, R15 whole when touching `askusage`.

## Uses: ai-runs

- Purpose (§ Purpose; R11): the AI run object. Its R48, R50 (`aiUseCheck`, `countAskUsage`) are retired into ai-use; the door calls no ai-runs service (R11).

## Uses: doorbell

- Purpose (§ Purpose; R7): the public intake and the member's inbox; a knock is not a capture or a bundle; writes no bundle.
- R3 (doorbell; store-door R7): every resolve takes the member's `reason` (absent, non-string, blank or over 2,000 characters is `RESOLVE_NO_REASON`, C-118.7, 400, after `BAD_STATUS` and `NO_SUCH_KNOCK` 404, before any write); a knock becomes `pulled` only by R13; `op=inboxpull` takes no reason.
- R13 (doorbell; store-door R7; read R13 whole): `pullKnock({knockId, by})` (`op=inboxpull`). Refusals in order: member-session fence; `NO_SUCH_KNOCK` (C-118.2); `KNOCK_DISCARDED` (C-118.4); `EVIDENCE_NOT_HELD`. A knock already pulled answers `existed: true`. Otherwise, in one act: bytes held, one receipt written (`via: "doorbell"`, address `knock:<knockId>`), knock `pulled`, `by` recorded as capture actor; the answer carries a provenance document (`source` `{kind: "knocker", named: false, pseudonym, receipt}`, `capture.actor` = `by`, never `contact`). `within` (synchronous, called with the document inside the pull's transaction): `{ok: false}` rolls the pull back and is its answer with `knockId`; a throw or non-synchronous answer rolls back and answers `PULL_WITHIN_FAILED` (500), fixed `detail`. R25: `doorbellOf(ctx, deps)`, one instance per storage.

## Uses: ai-accounts

- Purpose (§ Purpose; R10, R16): the sealed AI accounts, the choice of the one an act uses, per-use switches, material limits, notices.
- R7 (ai-accounts, T53): `accountFor({member, act})` answers `{account_id, level, owner, provider, plan, means, entry_id, entries, member, project?, suggestions?, personal, disclosed}`. Keep-away is asked first: `AI_KEPT_AWAY` with its row and `keep_away: {reason, set_by, set_at}` (null when unreadable: fail closed). `aiKeptAway({project?, use?})` is the one site that mints it: the group's `AI_KEPT_AWAY` when its limit covers `use`, else `PROJECT_AI_KEPT_AWAY`, else `null`.
- R11 (ai-accounts, T53): `act` is `{kind, member, project?, interactive?}`. Order: keep-away; level; head pair; head refused, never skipped, on `AI_USE_SWITCHED_OFF` (or free tier, due notice, `PAYER_NOT_VERIFIED`); none usable: `NO_ACCOUNT` else `NO_ENTRY_OFFERED`.
- `projectsKeptAway({use})` (ai-accounts Public): ids of projects whose limit covers `use`. R18 retired (T53, K5457).

## Uses: translations

- Purpose (§ Purpose; R10): the interface's words, group translations by granted speakers, assistant drafts.
- R1 (translations; store-door R10): `translationDraft({language, direction, keys?, key?, assistant, by})` (`op=translationdraft`); `direction` `to_language` or `to_english`, else `TRANSLATION_DIRECTION_UNKNOWN`; `language` accepted by `jurisdictions.isLocale`, else `LANGUAGE_MALFORMED`. `translationDraftRefusal({language, direction, keys?, key?, by})`, in-process, answers `null` or the first refusal (`TRANSLATION_NOT_GRANTED`/`NOT_AN_ADMIN`, `NO_SUCH_WORD`, ...), writing nothing. Past the keep-away gate (a throwing provider is `STORE_DID_NOT_ANSWER`), `translationDraft` answers `{ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE", direction, language, words}`, the signal the door drafts on.

## Uses: test-support

- Purpose only (§ Purpose; no service named by store-door).

## Uses: admission

- Purpose (§ Purpose; R15, R20): who may call an op, judged before it runs; never runs an op.
- R34 (admission, T53, not yet met; store-door R20): `admit` is callable from inside the room with the session row the room holds (`resolveSession` runs beside the session rows). Every refusal of R1-R12 and R14 (codes, statuses, `check`, `translation`) is answered as now, in the same order, wherever admission runs. Test: a parity table; the order test (R8 before R9 before R10 before R11).
- R25 (admission; store-door R15): an act `REAUTH_ACTS` names is refused by `credentials.reauthDue({token})`'s answer unless null.

## Source gaps found (R10, R11, R15, R16)

- R16: store-door R16 cites `ai-accounts` R18 for `subscriptionConnected`, but ai-accounts R18 is retired (T53, K5457) and its Public part names no `subscriptionConnected`; `aiGrantAdmit` (R11, R16) is not found by name in credentials' Public part (only R28's `AI_GRANT_OPS`). The job settles the owner of routes `subscriptionconnected`, `aigrantadmit` (T53-368).
- R11 still cites ai-runs R48, R50 (now ai-use R1-R3) and `credentials.projectsKeptAway` (now ai-accounts); R10 cites instance-setup R67 (now `translations` R1).
