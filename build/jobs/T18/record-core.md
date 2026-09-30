# record-core (T18)

**Status** · session_01Lj5VggHJkUrDw8F1WKQdSq · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three points; I am carrying on with every entry on the readings below, and with R64 on (1)'s recommendation, so none of them stops me.

**(1) R64 (`op=stats`' disclosure, K621) cannot be a straight move of `store.mjs`' `#counts`.** Its body counts about 40 other modules' tables (`refs`, `register`, `capture_text`, `entities`, `observation_log`, `leads`, …) and takes the caller's sight from membership's `hiddenBundles` and ai-runs' `hiddenRuns`. In record-core that breaks R31 (own tables only) and P4 (membership and ai-runs are later modules). What can move is the disclosure itself: which keys each form carries, and `dbBytes`.

My reading (recommended): record-core provides `registerStatsSource(module, figures)`, one registrant, where `figures({viewer, proof})` answers the instance's literal figures through the caller's sight. The counting and the sight stay with their owners: legacy-store today, R63 registrations as they move in T19. `stats({capacity, viewer})` then takes the source's figures with `proof: false` and applies R64:
- it drops `leads`, `observations`, `themes` and `themePlacements`;
- it keeps `observationsNonLead`;
- it adds `dbBytes` (the storage's `databaseSize`) only when `capacity === true`.

A private `proofCounts()` answers purge's form: the source's figures with `proof: true`, whole, keeping `observations`, `leads`, `themes` and `themePlacements`, without `observationsNonLead`, and always with `dbBytes`. Legacy-store registers its `#counts` body as the source, its route and `purge` call record-core, and the key-choosing lines leave `store.mjs` (§12.2). That is about 40 lines out of `store.mjs`, not ~150. With no source registered, `stats` answers `dbBytes` alone, or `{}`.

Two points for you:
- (a) R64 names neither `themes` nor `themePlacements`, which are purge-only today (D-162). I keep them off the wire; say if R64 should name them.
- (b) The new service needs an R. My wording: "**R65** `registerStatsSource(module, figures)`: once, at start, one module registers `figures({viewer, proof})`, which answers the instance's figures through the caller's sight; a second registration is refused `STATS_SOURCE_DECLARED` naming the holder, one without a module name or a function `STATS_SOURCE_MALFORMED`. `stats` and purge's proof read it; with none registered they answer only what this module holds."

The alternative is R63's `counts(hid)` with a sight registration (`registerSight`, membership's `hiddenBundles`). It fails on the run subtraction: `observationsNonLead` and `aiRunLog` need ai-runs' `hiddenRuns(viewer)`, not a bundle set, so R63's functions would need the viewer too. That is a change to R63.

**(2) `afterCommit` (N406) has no R in `record-core.md` yet.** My wording, beside R32: "**R66** `afterCommit(fn)`: outside any `transact`, runs `fn` at once. Inside one, holds `fn` and runs it synchronously just after the outermost `transact` has committed, before that call returns, in the order the calls were made. It is dropped when the transaction, or the savepoint holding it, rolls back (a throw or an `ok:false` answer); a savepoint that commits hands its held calls to the one around it. A held `fn` that throws does not undo the commit, stop the other held calls, or change what `transact` answers. A non-function is a `TypeError`. It writes nothing itself."

**(3) The grammar seam (§1b) has no R yet either.** My wording, beside R59: "**R67** `registerGrammar(module, {ids, arm})`: once, at start, a later module registers a type grammar for `legacy-checks`' `checkBundle` (`opts.grammars`); `grammars()` answers every registration as `{module, ids, arm}`, in registration order. Refused `GRAMMAR_MALFORMED` (C-102.16):
- a module that is not a non-empty string;
- `ids` that are not a non-empty list of C-ids;
- an `arm` that is not a function;
- ids that claim part of one of the catalogue's `EXTENSION_ARMS`, or ids of two of them.

Refused `GRAMMAR_DECLARED` (C-102.15), naming the holder: a module's second registration, or an id another registration holds. A refused registration registers nothing." R18 amended: "…runs the check catalogue, passed `grammars()` as `opts.grammars`, against a bounded page…"; an arm that throws in the audit counts as one `AUDIT_CHECK_FAILED` error on that bundle (R59's rule), never as clean and never as a throw out of `auditPass`.

Rows: C-102.15 and .16 are new, in `record-core/checks.mjs`. By the entry, C-59.5 and C-102.1–.3 are copied there and C-75 is moved there whole (the catalogue's copy deleted). `registerAuditCheck`'s two refusals gain their `code`, `check` and `translation` (they carried none), and all of these rows are named `awaiting stamp` in my record.

## J2 · REPORT

What this job's change means for other modules:

1. **Stale generated artifacts (§14).**
   - The plane bundle, `bio-plane/dist/bio-plane.bundled.mjs`: `store.mjs`, `record-core/` and `bio-checks.mjs` changed.
   - The agent-worker bundle: it takes `bio-checks.mjs` as an input (K189), and C-75 left it.

   I rebuilt neither; both are yours at the layer close.
2. **promotion (layer 2).** `record.grammars()` is live (R67): pass it to the gate's `checkBundle` as `opts.grammars`. Registrations are validated here against the catalogue's `EXTENSION_ARMS`, so a list from `grammars()` never makes `checkBundle` throw. At the gate the arm is passed as registered. Only the audit wraps it, so that a throwing arm is one `AUDIT_CHECK_FAILED` finding; the gate's handling of a throw is promotion's to decide.
3. **promotion's stamp (layer 2): the rows changed, all `awaiting stamp`.**
   - **C-75.1–.5 moved** to `record-core/checks.mjs` `PER_ITEM_CHECKS`, rows unchanged, and the catalogue's copy deleted.
   - **C-59.5 copied** to `RECORD_CORE_CHECKS`. The catalogue's `PROJECT_ID_CHECKS` copy stays for T19.
   - **C-102.1–.3 copied** to `RECORD_CORE_CHECKS`, translations unchanged. Each `where` now names a DEC-49 region: `registerAuditCheck > is-audit-check-registration` and `auditPass > is-audit-check-failed`. The catalogue's `REGISTRATION_CHECKS` copies stay for T19. `registerAuditCheck`'s refusals now carry `code`, `check` and `translation`; they carried none.
   - **C-102.15 and .16 are new:** `GRAMMAR_DECLARED`, `GRAMMAR_MALFORMED` (R67).
   - **C-102.17 and .18 are new:** `STATS_SOURCE_DECLARED`, `STATS_SOURCE_MALFORMED` (R65). R65 names the codes, not the row numbers, so this record names them.
   - `ROW_CENSUS` moves by these.
4. **legacy-checks (T19's layer 1).**
   - Delete the copies of C-59.5 and C-102.1–.3 once promotion and ratification hold their split tables.
   - The C-102 family's header comment still names `PER_ITEM_CHECKS` (about line 9595). It is text only; I left it, since a removal-only edit there would garble the sentence.
5. **reevaluation (layer 7), for N406's share.** `afterCommit` defers only inside record-core's `transact`. Capture (`capture/index.mjs` :417, :466, :800) and ai-runs (:416, :905, :1067, :1369) call `ctx.storage.transactionSync` directly. A call made inside one of those would run at once, before that transaction commits.

   This does not bear on `raise` as long as its callers write through `transact`. It is a flaw in those two modules against record-core R32 ("one transaction over the whole store"): I recommend they move to `record.transact` at their next jobs.
6. **The DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`, run only at a release) harvests `*_CHECKS` from the catalogue only. C-75 now reads as unregistered there, as C-35 does (K641's note).
7. **Size note, for the plan.** R64/R65 left `store.mjs` at 4 lines added and 25 removed, not ~150: the counting stays in the source (`#counts`), per K645.
