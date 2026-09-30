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
