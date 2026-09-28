# escalation (T8)

**Status** · session_01Dj21W7K2W3BqsaQUEQKpDo · depth 2 · COMPLETE · handled B10

## J1 · QUESTION

Q1. My uses `conformance`, `consequences`, `actions` and `filings` run beside me in layer 9 and none exists on `tranche/T8` yet, so a static import of their factories would not load. Best reading, which I am building to now: `escalationOf(host, deps)` (K61) takes each as a dep, and its tests drive it over stand-ins shaped exactly as each one's Provides (conformance R9/R11 `determinationRead`/`determinationsFor`; consequences R9 `addressed`; actions R12 `actionFacts`, R29 `actionRead`; filings R13 `filingsFor`, R21 `availableActions`), with real record-core, membership, promotion and jurisdictions. When you merge those providers into `tranche/T8` (early, §4), I merge it in and default each dep to its factory on the same host (`conformanceOf`, `consequencesModule` per K171 (17), `actionsOf`, `filingsOf`, unless you tell me other names) and run the suite over the real modules too. Until then the plane cannot build my instance without them. Please tell me (a) the factory names, and (b) the answer shapes these four jobs settle for: conformance's per-standard outcome and act fields (I read `{act: {id, actor: {role, body}}, outcomes: [{standard, outcome}], live, at}`), actions' ledger entries (`{ord, direction, at, recorded_at}`) and legs (from the document's `action_basis`, `breach: true`).

Readings I am applying, no answer needed unless you disagree:
- R2 instants: a trigger with alternatives (R6: a reply, or the clock) is first met at the earliest alternative met; each alternative's instant is the latest date of its ids. A ledger date `YYYY-MM-DD` reads as that day's 00:00Z; a clock's instant is the day after its date.
- R7: in stage 4 the trigger reads the latest evaluation made since the escalation last entered stage 4, so a 6→4 or 7→4 re-entry is evaluated afresh; R8's "evaluation in force" is the latest overall. R11/R12's "a `received` entry later than the latest evaluation" is one recorded (`recorded_at`) after that evaluation.
- R9: "breach action" read from the action's document (`breach: true`, a `rests_on` leg naming the escalation's determination) through record-core's `readFile`, after `actions.actionRead` answers it visible; `NO_SUCH_ACTION` for its absent, invisible and not-an-action answers.
- R21: the escalation is an `ESC-` bundle in the determination's project, each act one promotion of its document (history in the document), the five tables its projections written in the same transaction; a registered promotion check refuses a raw promotion of an escalation document that is machine-written or rewrites its history (R17, R18).

## J2 · REPORT

Status: built and tested over stand-ins (commit on `job/T8/escalation`, pushed). `bio-plane/src/escalation/` (index, doc, schema, checks: C-116.1–.44), `bio-plane/test/m/escalation/` 23 tests, 23 pass, every R1–R21 named; format, architecture, coverage and ownership 0 failures. The four layer-9 providers are injected deps; an absent one answers `PROVIDER_UNAVAILABLE` (C-116.44), never passes (K248). What remains of the job: on each provider's CHANGE, merge `tranche/T8`, default the dep to its factory on the same host, and re-run the suite over the real module, adjusting the answer-shape readers (`outcomesOf`, `ledgerOf`, `actionFacts`, `addressed`'s parts) to the shapes each confirms. I stay open for that.

For other modules (not mine to change; §12.2 gives me no legacy module):
1. legacy-store / control-plane (layer 10–11): nothing builds `escalationOf(ctx)` in the plane yet, and no op reaches R1–R16. Map §4's ~25 lines (dispatch, `OPS` entries and classes for the ten services) are the owners' of those files; the construction call needs `conformanceOf`, `consequencesModule`, `actionsOf`, `filingsOf` on the same host once they exist.
2. monitoring (layer 10) reads R16 `escalationsDue({nowMs, limit?, viewer})` → `{ok, as_of, items: [{id, project, from, to, stage, instant, age_ms, ids, by}], truncated, limit}`.
3. affordances (layer 11): a published act or `NON_ACTS` row for each of the ten services (K225 (3)).
4. The DEC-49 guard (legacy-tests): C-116 mints codes other modules also mint for their own conditions (`NO_REASON`, `NOT_A_PARTICIPANT`, `NO_SUCH_DETERMINATION`, `DETERMINATION_SUPERSEDED`, `NO_SUCH_ACTION`). Each is minted once here with its own row; if K238's "one condition, one helper" is to apply across modules, that is BOB's ruling.
Readings added since J1, applied: attach and evaluate on an ended escalation refuse `ESCALATION_ENDED`; end twice `ALREADY_ENDED`; suspend twice `ALREADY_SUSPENDED`; resume when open `NOT_SUSPENDED`; decline's machine refusal is `MACHINE_CANNOT_DECLINE` (R17 names the act), suspend's and resume's `MACHINE_CANNOT_SUSPEND`/`_RESUME`; R19 refuses an input carrying a judgment key `ESCALATION_CARRIES_NO_JUDGMENT`.

## J3 · REPORT

B3–B6 applied: `tranche/T8` merged; escalation defaults `conformanceOf`, `consequencesModule` and `actionsOf` on its host, and reads each one's settled shape (conformance's `outcomes`/`act`/`live`/`at`; consequences' `addressed`; actions' `correspondence`, `legs`, `breach`, `counterparty`, and its exported `actionFacts` as the one clock rule). New `test/m/escalation/real.test.mjs` runs escalation over the real conformance, consequences and actions (on conformance's test scene). 26 pass, 0 fail, 1 todo; format, architecture, coverage, ownership 0 failures. Fixed on the way: `escalationOpen`'s `proposed` was read with no viewer, which the real conformance answers as seeing nothing (now the opener's).

**Filings is not on `tranche/T8`** (@ the head I merged there is no `bio-plane/src/filings/`), so B6's "every provider is there" does not yet hold for me: filings stays an injected dep, absent answering `PROVIDER_UNAVAILABLE` (C-116.44). I record completion when its CHANGE comes.

**Flaw in `actions` (against its R8 with R15/R16):** `actionCorrespond` (store line ~1080) and its other acts that revise an action through `#revise` (~291) call `promotion.promote` without the `viewer`, so actions' own step (`#breachRefusal(nextFm, pkg.viewer ?? c.viewer ?? null)`, ~511) reads the determination with a null viewer; the real conformance answers a null viewer as seeing nothing (`#seen`: `sight(...) === FULL`), so every correspondence on a `breach: true` action is refused `ACTION_NO_DETERMINATION`. Reproduced in my `real.test.mjs` on conformance's scene: the breach action is created (viewer given), `actionCorrespond({target, direction: "sent", …, viewer, author})` is refused. Consequence: escalation's stage 2→3 and 3→4 triggers can never be met in the plane. Fix is actions': pass `viewer` (or the author as viewer) into each promote. My arm for it is a `test.todo` naming this cause; stages 2–3 stay tested over the stand-in.

**For monitoring (N216 and its job):** conformance answers a call with no viewer as unseen, so `escalationsDue` must be called with monitoring's own viewer; with none, the stage-1 trigger reads the determination as absent.

## Completion

**Entries applied.** Layer 9's escalation bullet: built per requirements (a new module; map: nothing moves), R1–R21 met in `bio-plane/src/escalation/` (`index.mjs`, `doc.mjs`, `schema.mjs`, `checks.mjs`): the seven stages and the stage table; each edge's trigger derived from the record at `nowMs` with its first-met instant and age (R2, K171 (16)); `escalationOpen`, `escalationRead`, `escalationAttach`, `escalationEvaluate`, `escalationAdvance`, `escalationDecline`, `escalationEnd`, `escalationSuspend`, `escalationResume`, `escalationsDue`; R12's `elected` and `oversight` markers read from the active profiles' combined view (jurisdictions R24, N130); stage 7's `purpose` and `standards` on the attachment (K171 (15)); R14 with `CONSEQUENCES_UNDETERMINED` (K172); an `ESC-` record object promoted through `promotion` (R21, N129, K171 (3)): each act one promotion appending to the document's Escalation Log, the five tables its projections (registered projection), a registered check refusing any other promotion of an escalation document but a replay; refusal family C-116.1–.44 (K248), one code one site. Providers reached through their factories on the same host: `conformanceOf` (K252), `consequencesModule` (K250), `actionsOf` (K253, K256), `filingsOf` (B8); an absent one answers `PROVIDER_UNAVAILABLE` (C-116.44). CHANGEs B3–B6, B8, B9 applied; readings of J1 confirmed by B2, J2's added readings stand.

**Deferred.** Nothing of this module.

**Found in other modules** (REPORT J2, J3): actions' acts promoted without the viewer (fixed, K256); legacy-store / control-plane construct no escalation instance and route none of its ten services (N216, next plan); monitoring must call `escalationsDue` with its own viewer (conformance answers no viewer as unseen; in its layer-10 entry); affordances needs a published act or `NON_ACTS` row per service (K225 (3)); C-116 mints codes other modules also mint for their own conditions (`NO_REASON`, `NOT_A_PARTICIPANT`, `NO_SUCH_DETERMINATION`, `DETERMINATION_SUPERSEDED`, `NO_SUCH_ACTION`), each once here: BOB's under K231/K238 if one row is wanted across modules. No generated artifact is made stale (escalation is in no bundle).

**Tests and checks** (on `job/T8/escalation` with `tranche/T8` @ B9 merged):
- `node --test bio-plane/test/m/escalation/`: tests 27, pass 27, fail 0, todo 0 (stand-ins in `open`, `stages`, `exit`, `invariants`; the real conformance, consequences, actions and filings in `real.test.mjs`).
- Layer 9's providers on the merged tree, unchanged by this job: conformance 29/29, consequences 22/22, actions 30/30, filings 30/30.
- format: 69 modules, 64 requirements files; 0 failures. architecture: 10 product files, 30 relative imports; 0 failures. coverage: 21 of 21 live ids; 0 failures. ownership: 11 files changed; 0 failures (no legacy file touched).

Size (session_01SpVCFJ485ktPaATS1SaQpH): test runs 32, module lines 1425

## J4 · COMPLETE

B9 applied; escalation COMPLETE: R1–R21 met over the real conformance, consequences, actions and filings; 27/27 tests, 0 todo; format, architecture, coverage, ownership 0 failures; no legacy file touched. Record § Completion.

## Completion (ESCALATION #2, B10)

**Entries applied.** B10 (K267): `escalationOf(host, deps)` now runs the module's `migrate()` at construction, before it declares its five tables to purge, as the other layer-9 factories do; `migrate()` stays public and idempotent (each `CREATE ... IF NOT EXISTS`). A caller that only constructs the module (monitoring, R35) now leaves the tables in place, so record-core's purge finds them. The test fixture and `real.test.mjs` no longer call `migrate()` themselves, so every arm runs on the construction path. New test (R20): after `escalationOf(host)` with no explicit `migrate()`, a whole-store purge and a bundle purge answer `ok` and clear the declared tables; a second construction and a second `migrate()` change nothing.

**Deferred.** Nothing.

**Found in other modules.** Nothing new. N235 (instance-setup's `mdFor` counterparty shape) is BOB's, from LEGACY-TESTS #5.

**Tests and checks** (on `job/T8/escalation` @ `tranche/T8`):
- `node --test bio-plane/test/m/escalation/`: tests 28, pass 28, fail 0, todo 0. With the construction migrate removed: 0 pass, 28 fail (the failure reproduced).
- `node --test bio-plane/test/m/monitoring/`: tests 52, pass 42, fail 0, todo 10 (unchanged).
- `action-loop`, `actionquote`, `rec195-laws-proposal` (legacy-tests' versions from `job/T8/legacy-tests`, over this branch's escalation): 81/0, 49/0, 40/0; without the fix 79/2, 46/3, 38/2. On this branch's own copies these three files do not load (`QUOTE_CHECKS` is not exported by `bio-checks.mjs` at this base); legacy-tests' branch carries their update.
- format: 69 modules, 64 requirements files; 0 failures. architecture: 10 product files, 34 relative imports; 0 failures. coverage: 21 of 21 live ids; 0 failures. ownership: 5 files changed; 0 failures (no legacy file touched).

Size (session_01Dj21W7K2W3BqsaQUEQKpDo): test runs 12, module lines 1428

## J5 · COMPLETE

B10 applied (K267): escalationOf migrates its tables at construction, so a purge after construction finds them. New R20 test: whole-store and bundle purge ok after escalationOf(host) with no migrate(). Escalation 28/28; monitoring 42/0 (10 todo); action-loop 81/0, actionquote 49/0, rec195-laws-proposal 40/0 on legacy-tests' files (79/2, 46/3, 38/2 without the fix); format, architecture, coverage, ownership 0 failures. Record § Completion (ESCALATION #2, B10).
