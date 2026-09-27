# record-core — requirements

**Status** · APPROVED by Bob 2026-09-26 (a product module, P17). DRAFT by BOB #38, 2026-09-26 (P18 preparation), from a drafting worker's reading of the code, reviewed by BOB. Layer 2. Code today: inside the legacy modules `bio-plane/src/store.mjs` and `schema.mjs`; the module is extracted from them by its first job. BOB #40 added `transact`, `commit`, `bundleInfo` and `listBundles` (R32–R35) and gave `auditPass` a caller's visibility predicate, from the promotion and membership reviews (K31). N64 and N66 folded by a drafting worker for BOB #43, 2026-09-26: R49–R55 (`PER_ITEM_MAX`, `perItem`, `manifestByAuthor`, `isFirstBoot`, C-75), not yet met; R37's widening left for Bob (it changes an approved requirement). N40 folded by a drafting worker for BOB #43, 2026-09-26: R56–R58 (`digestCensus`, `snapKeyCensus`, and the one file digest and size they share with `promotion`), not yet met; both censuses read only this module's tables (`files`, `history`, `manifest`, `bundles`), checked at `566bb7f811`.

## Public

### Purpose

Owns the record's storage: id allocation, leases, the append-only history and manifest of every
promotion, and purge — the tables and services no later module owns. It holds no member, capability or
fence (`membership`'s share) and no promotion write path (`promotion`'s share); it is what those modules,
and every other module that stores anything, write through and read from.

### Provides

**allocId(prefix, year) → `{id}`**
- **R1** Returns `<prefix>-<year>-NNNN`, NNNN the next unused number in the `<prefix>-<year>` scope,
  four digits zero-padded, and steps that scope's counter so the same number is never returned twice for
  it again, purge or no purge.
- **R2** Takes the identical step whether called on its own or from inside a caller's own transaction
  (a promotion minting a scoped id as part of a larger write), so the two never diverge.
- Errors: never throws.

**allocIdOp(prefix, year) → `{id}` or refusal**
- **R3** Refuses a prefix in the module's fixed gated set (`PROJ`, `CASE`, `DRAFT`, `RVG`, `TASK`) with
  `ALLOCID_PREFIX_GATED` (C-59.5): those objects' ids are minted by the act that creates them, never
  handed out in advance, because a caller stepping their counter would learn how many exist, hidden ones
  included.
- **R4** Gating is decided on the scope string (`<prefix>-<year>`), never on the prefix alone: a prefix
  that only begins with a gated one's letters keys a different scope and is not refused.
- **R5** A refusal echoes only the prefix and year the caller sent; nothing is allocated.
- Errors: never throws.

**mintOpaqueId(prefix, year, tail, taken) → id or null**
- **R6** Returns `<prefix>-<year>-DDDD<tail>`, DDDD four digits drawn uniformly at random (rejection
  sampling over a CSPRNG so 0000–9999 are equally likely), checked against both the caller's own
  `taken(id)` and every id this service has ever handed out; a collision draws again.
- **R7** Every id returned is recorded, before it is returned, in the same transaction as the call that
  asked for it — never one of the service's own — so a caller whose transaction rolls back takes its
  drawn id back with it.
- **R8** An id once recorded is never drawn again by this service, for any caller, purged store or not
  (D-432): its record of what has been minted is exempt from `purge`, in both the whole-store and the
  single-bundle form.
- **R9** Returns `null` only when 64 draws in a row all collide.
- Errors: never throws.

**acquireLease(bundleId, actor, ttlMs) → lease or refusal**
- **R10** Refuses an empty or non-string `actor` with `ANONYMOUS_LEASE`: a lease is never held under no
  name.
- **R11** Refuses when a live, unexpired lease is held by a different actor, and reports who holds it and
  until when.
- **R12** Otherwise takes the lease under the given actor until `ttlMs` from now, replacing any prior
  holder, and returns the bundle's current stored digest as the caller's edit base.
- Errors: never throws.

**readFile(bundleId, path) → `{text, sha256}` or `{blobSha, bytes, sha256}` or null**
- **R13** Returns the file's live content when it is stored inline, or its blob reference (never its
  bytes) when it is stored as a blob, read from this module's own tables alone.
- **R14** Returns `null` when the bundle or the path is not held.
- Errors: never throws.

**readImage(bundleId) → `{path → content or blob reference}` or null**
- **R15** Assembles, from this module's own tables alone: every live file; every historical snapshot,
  each named by a fixed derivation from its path and the snapshot key that archived it; and one manifest
  document listing every promotion recorded for the bundle (its key, kind, base, author, created time,
  and the files it touched).
- **R16** Write order is never lost: every manifest entry given back carries `seq`, its rank in the order
  this module recorded the entries, and a caller that needs write order takes it from `seq`, never from
  the snap key. The manifest document itself lists its entries by key, as the catalogue's C-12.1 requires
  (the D-700 form; K65).
- **R17** Returns `null` when the bundle is not held.
- Errors: never throws.

**auditPass({after, limit, visible, context?}) → page report**
- **R18** Runs the check catalogue (`legacy-checks`) against a bounded page of bundles in id order from
  `after`, and reports, for the page: how many bundles were clean, how many carried an error, and every
  error tallied both by check and by check-and-code.
- **R19** Every reference a check must resolve is resolved against the WHOLE corpus, never the viewer's
  slice of it, so a check never manufactures a dangling-reference finding out of a viewer's position; the
  page returned, and any bundle it names, is limited to the bundles the caller's `visible(bundleId)`
  predicate admits (the sight rule is `membership`'s; this module never decides it).
- **R20** Resumable: the cursor returned is the last bundle id seen on the page, independent of any
  snapshot of the store.
- **R45** `context(bundleId)`, when the caller gives it, answers extra options for that bundle's checks (today the earned and published registries later modules build); they are passed to the catalogue with the bundle. This module builds none itself. (K61)
- Errors: never throws.

**declarePurge(module, tables, {exempt?}) → void**
- **R21** A module that owns tables declares them here once, at start. `purge` clears every declared table except those declared `exempt`; this module's own tables (`bundles`, `files`, `history`, `manifest`, `leases`) are declared by it. A table declared twice, or by two modules, is refused with `TABLE_DECLARED`.
- **R46** A declared table is a name, keyed to a bundle by its `bundle_id` column when it has one, or `{name, keys: [columns], whole: "<WHERE clause>"}`: keyed to a bundle by the named columns (any of them matching), and cleared by the whole-store form only where the clause holds. (K61)

**purge({bundleId}) → report**
- **R22** With no `bundleId`, clears every row of every declared, non-exempt table; with one, clears only the rows keyed to that bundle. A table no module has declared is never touched.
- **R23** Never clears the id counter (`seq`), the opaque-id ledger (`minted_ids`) or a table declared `exempt` (such as the instance's identity and settings), in either form: an id once allocated or minted is never reissued, purged store or not.
- **R24** Reports which form ran (`scope`, `"ALL"` or the bundle id) and a per-table count of what was removed, naming every declared table even when it removed nothing.
- Errors: never throws.

**getSetting(name) → value or null; setSetting(name, value, by) → void**
- **R25** Holds the instance's settings as named values, each recorded with who set it and when. `getSetting` returns the value last set, or `null` when none was. Settings are exempt from `purge`.
- **R26** The instance's active jurisdiction profiles are the setting `jurisdiction_profiles`: an ordered list of profile ids, which a consumer passes to `jurisdictions.combine`.

**transact(fn) → fn's result**
- **R32** Runs `fn` as one transaction over the whole store: when `fn` throws or returns a refusal
  (`ok:false`), every row written inside it, in any module's tables, is rolled back, and no id allocated
  inside it is spent. This holds for a nested call too: it joins the outer transaction, and a
  nested call that throws or refuses rolls back its own writes and ids (a savepoint), while the outer
  call decides the rest.
- Errors: rethrows what `fn` throws, after the rollback.

**commit({bundleId, type, title, project, snapKey, kind, base, author, writer, operation, files, state, priorState, group, created, lastUpdated, criticality, at}) → `{bundleSha, rowVersion}`**
- **R33** The one write path into this module's tables, called inside `transact`: it copies every live
  file the commit replaces into `history` under `snapKey`, writes the new live files (inline text, or a
  blob reference), sets the bundle's row, and appends exactly one `manifest` entry recording the key,
  kind, base, author, time, writer, operation and each file's digest. It never modifies or removes an
  existing `history` row or `manifest` entry. What may be committed is decided by its caller
  (`promotion`), never here.
- **R44** The bundle's row records `state`, `priorState`, `group`, `created`, `lastUpdated` and `criticality` as the caller gives them, and the manifest entry's time is `at`, the caller's stated time. (K61)
- Errors: never throws for a well-formed call.

**bundleInfo(bundleId) → `{id, type, title, project}` or null; listBundles({project, after, limit}) → `{ids, cursor}`**
- **R34** `bundleInfo` answers a held bundle's type, title and project from this module's tables, or
  `null` when it is not held.
- **R35** `listBundles` lists held bundle ids in id order after `after`, limited to `project` when
  given, at most `limit`; `cursor` is the last id listed.
- Errors: never throws.

**listByType({type, after, limit}) → `{ids, cursor}`; the `bundles` read contract; evidenceStore() → `{head, get, put}`** (K57)
- **R36** `listByType` lists held bundle ids of one `object_type` in id order after `after`, at most `limit`; `cursor` is the last id listed. Never throws.
- **R37** The table `bundles` and its columns `bundle_id` and `object_type` are a stated read contract: a later module may join them in its own SQL (a projection bounded by SQL, as membership's directory is, D-497), and this module changes neither column's name, type or meaning without a requirement change carried to every such reader (P5). The columns `current_state`, `title` and `criticality` are part of it too, on the same terms (N64, K96: `affordances` and `queue` read them). The tables `files` and `history`, with their columns `bundle_id`, `path` and `sha256` (and `history.snap_key`), and the columns `bundles.created` and `bundles.last_updated`, are part of it too, on the same terms (N83: `provenance` reads them). No other column is part of the contract. The projection columns on `bundles` and `fts_id` are `retrieval`'s (its migrate declares them and only its projection writes them), not this module's, until they move to a table of retrieval's own (K144, N106).
- **R38** `evidenceStore()` answers the instance's evidence store (R2 bucket) as `{head(key), get(key), put(key, bytes)}`, the object key of a digest being fixed by this module; `null` when the instance has none bound, so callers answer undetermined (provenance R8–R9). *(not yet met: K49 — callers reach the binding directly today)*

**How the module is reached: recordOf(ctx, opts?) → the instance** (K61)
- **R39** Answers the one instance of this module for a Durable Object's storage (`ctx.storage`, with its `sql` and `transactionSync`): every caller in the object gets the same instance, so all share one transaction depth, one purge declaration list and one evidence binding. `opts` (`{evidence, evidencePrefix}`) is read on the first call only. The services above are its methods, by their names.

**seedMintLedger(sources) → void** (K61)
- **R40** Before the first mint, seeds the opaque-id ledger with the ids live in the tables and columns its caller names (`[[prefix, table, column], …]`), each named by that table's owner as `declarePurge`'s tables are. It reads nothing else of another module's tables: with `purge`, the one reading of other modules' tables R31 allows, and only as they are declared.

**head(bundleId), manifestEntry(bundleId, snapKey), livePaths(bundleId)** (K61)
- **R41** `head` answers a held bundle's `{bundleSha, rowVersion, type, title, currentState, priorState, groupId}`, or `null`.
- **R42** `manifestEntry` answers the manifest entry recorded under `snapKey` as `{kind, base, author, created, files, writer, operation}`, or `null`.
- **R43** `livePaths` answers the paths of a held bundle's live files in path order, or `null` when the bundle is not held. None of the three throws.

**stampInstant(precision, when?) → string; instantOrder(a, b) → number** (N58, K85; module-level functions, not methods)
- **R47** `stampInstant` spells the instant `when` (milliseconds since the epoch, default now) in UTC as ISO 8601: `"second"` gives `YYYY-MM-DDTHH:MM:SSZ`, `"millisecond"` gives `YYYY-MM-DDTHH:MM:SS.sssZ`; any other precision throws, naming it.
- **R48** `instantOrder` compares two instants in either spelling as instants, never as strings (`…:00Z` is before `…:00.123Z`): negative, zero or positive as a comparator, and NaN when either side is not a non-empty readable instant. Never throws.

**PER_ITEM_MAX; perItem(act, body, stamped, one, {itemKeys, sharedKeys}) → answer** (N64, K91 (4): the set form of an act, generic over its identity groups)
- **R49** `PER_ITEM_MAX` is 100, the most items one set may carry; `affordances` re-exports it unchanged.
- **R50** `perItem` applies `one` to each item of `body.items` on its own. Refused whole, before any item is
  tried, with `op` (= `act`), `weight: "per-item"` and `count`: `items` absent, not an array or empty,
  `SET_NO_ITEMS` (C-75.1); more than `PER_ITEM_MAX` items, `SET_TOO_LARGE` (C-75.2) with `max`. Otherwise each
  item in order, whatever became of the others: one that is not an object is retained as
  `SET_ITEM_MALFORMED` (C-75.3); else `one` is called once with the rest of `body` (the shared values), then
  the item's own fields, then `stamped` over both, and no `items`; a call that throws is retained as
  `SET_ITEM_FAILED` (C-75.4); an answer with `ok: true` is `applied`, any other is `retained` carrying that
  answer's own fields verbatim. Every outcome is `{index, outcome, asked, …}`, `asked` the item's scalar
  fields (strings cut at 400 characters), so `applied + retained = count`.
- **R51** Identity groups: a key in some group of `itemKeys` and not in `sharedKeys` is an identity key. An
  item that names an identity key (a trimmed, non-empty string) receives the shared values of every key in
  the groups it names, and no shared value of any other identity key; an item that names none receives the
  shared values whole. With no `itemKeys` nothing is narrowed.
- **R52** The answer is `{ok: true, op, weight: "per-item", count, applied, retained: 0, items, detail}`
  when every item applied, else `SET_ITEMS_RETAINED` (C-75.5) with the same fields beside it. Items are not
  one transaction: an applied item stands whatever a later one does. Every refusal carries its `check` and
  `translation`. `perItem` itself writes nothing and never throws.

**manifestByAuthor({authorPrefix, after, limit}) → `{bundles, cursor}`** (N64: the manifest read `queue`'s
unattended-capture producer needs)
- **R53** Lists, in id order after `after` and at most `limit`, each held bundle with at least one manifest
  entry whose author begins with `authorPrefix`, as `{bundleId, latest, firstOther}`: `latest` is its latest
  entry `{snapKey, kind, base, author, created, writer, operation}`, ordered by `created` and then by the
  order this module recorded the entries; `firstOther` is its earliest entry, in the same order, whose
  author is non-empty and does not begin with `authorPrefix`, or `null`. `cursor` is the last id listed.
  Which of them a viewer may see is the caller's to decide (`membership`), as for R19. Never throws.
 

**isFirstBoot() → boolean** (N66)
- **R54** `true` throughout the boot at which the store had never held the record's schema (no `bundles`
  table before this module created its tables), and `false` at every later boot. It is decided once, before
  any table is created or altered, and never throws. `instance-setup` reads it (its R2, R13).
 

**digestCensus({limit}) → report; snapKeyCensus({limit}) → report** (N40, K72 (12): read-only audits of this module's own tables, `op=digestcensus` and `op=snapkeycensus`)
- **R56** `digestCensus` answers `{ok: true, files, history, rewritten: 0, note}`, one part for the live files and one for the historical snapshots, each `{rows, inline, blob, digest_disagrees, bytes_disagree, listed}`. A row's digest disagrees when its stored digest, lower-cased, differs from the digest R58 computes from its stored content; a row with neither text nor blob address is not judged. A live inline row's size disagrees when its stored size differs from R58's size of its text; historical rows hold no size and are not judged for it. `listed` holds at most `limit` disagreeing rows per part, each `{bundle_id, snap_key (historical rows), path, stored, computed, bytes_stored (only when the size disagrees), digest: "disagrees" | "agrees"}`; the counts are always whole. `limit` is an integer from 0 to 500 (a larger one is 500, a negative one 0), and 50 when absent, empty or not an integer. It writes nothing, repairs nothing and never throws.
- **R57** `snapKeyCensus` answers `{ok: true, bundles, manifest_rows, promotions, overwritten, undetermined, bundles_with_deficit, excess, orphan_manifest_bundles, listed, rewritten: 0, note}`. For each held bundle its promotions are its `rowVersion` (one per `commit`, R33) and its deficit is promotions less its manifest entries: a negative deficit adds to `excess`; a positive one counts toward `bundles_with_deficit` and is split into `undetermined` (1 when the bundle has no creation entry, one whose `base` is the SHA-256 of the empty string, else 0) and `overwritten` (the rest). Its `unanchored` entries are the snap keys of its non-creation entries whose `base` is not the `bundle.md` digest recorded by any of its own entries (an entry's file list that does not parse counts as empty). A bundle with a positive deficit or any unanchored entry is listed, at most `limit` of them, as `{bundle_id, promotions, manifest_rows, overwritten, undetermined, creation_row, unanchored}`. Manifest entries of a bundle id not held add to `manifest_rows` and count once per id in `orphan_manifest_bundles`. `limit` as R56. It writes nothing and never throws.
- **R58** `fileDigestOf(f)` answers the SHA-256, lowercase hex, of the UTF-8 bytes of an inline file's `text` exactly as given (no trimming, no line-ending change), or a blob-backed file's `blobSha` lower-cased, or `null` for neither; `inlineBytesOf(f)` answers the UTF-8 length of an inline file's `text`, or `null` for a blob. They are module-level functions, and the one computation of a file's digest and size: `promotion`'s digest and size checks and R56 read them, so the door and the census cannot disagree about what a disagreement is (REC-175, REC-178).

**registerAuditCheck(module, check)** (N51, K130: the K31 pattern for audit checks)
- **R59** A later module registers, once at its start, an audit check `check(image, context)` over the same image `checkBundle` gets, with R19's whole-corpus resolution and R45's context. `auditPass` runs the catalogue and then every registered check on each bundle of the page, and counts a bundle's errors once in its clean and with-errors counts, its tallies and its offenders. A second registration by the same module is refused `AUDIT_CHECK_DECLARED`, a registration that is not a module name and a function `AUDIT_CHECK_MALFORMED`; a check that throws counts as one error `AUDIT_CHECK_FAILED` on that bundle, never as clean.

## Private

### Uses

- `legacy-checks`: the check catalogue `auditPass` runs, and the check ids and translations this
  module's own refusals cite (`ALLOCID_PREFIX_GATED`, C-59.5; `PER_ITEM_CHECKS`, C-75, until they move
  here, R55).
- `id-spaces` is a permitted dependency (`build/layers.md`) but nothing in this module's share calls it
  today.

### Invariants

- **R27** **C-59.5.** A caller never allocates a sequential id for a gated prefix (`PROJ`, `CASE`,
  `DRAFT`, `RVG`, `TASK`); those objects' ids are opaque and minted only by the act that creates them.
- **R28** An id this module has allocated or minted is never handed out to a second object, by any path,
  purged store or not (D-432).
- **R29** `history` and `manifest` are append-only: `commit` (R33) only appends to them, no service of
  this module modifies or deletes a row of either, and the only sanctioned removal is `purge`.
- **R30** A lease is never held under an anonymous actor (R10 restated as the rule the module keeps, not
  merely the shape of one refusal).
- **R31** Every service of this module reads and writes only this module's own tables and the system
  clock (and `purge` clears the tables other modules declared to it, R21); it makes no network call and holds no member, capability or fence.
- **R55** **C-75.** The set form's five refusals (R50, R52) move here as an invariant with their test
  (K6): C-75.1–C-75.5.

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3 (construct 3, "The record") and §4.
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §1.2 (canonical id grammar — the shape this
  module's ids answer to, minted by `membership`/`promotion`'s callers against it); §2.4 (history is
  append-only; nothing in it is ever modified or deleted — the storage half of convergent promotion,
  never the write algorithm itself); §2.5 (accretive store and gated deletion — the storage `purge`
  performs is the module's own share of it); §6 invariants I-1 (id uniqueness and immutability), I-5
  (append-only surfaces, `history`/`manifest`/deletion records), I-7 (accretive discipline — no removal
  outside a gated path), I-12 (history coherence — manifest entries sequenced and complete), I-19
  (expunge integrity, drafted — the sanctioned exception to append-only that this module's `purge` will
  need to support once `expunge` is built; not binding yet), I-20 (mechanical-writer conformance — the
  "prior" ordering rule R16 states and today does not meet).
- `docs/architecture/BIO_Technical_Architecture_Decisions_v10.md` §10.2 (accretive store, as a general
  integrity rule; deletion is exceptional, reason-gated and preserved).

### Suggestions

- `#mintProjectId`'s slug derivation is project-specific; whether it stays here (a thin wrapper over
  `mintOpaqueId`) or moves to `promotion` (the module that actually mints `PROJ` ids) is an open
  extraction question, not a requirement.
- **R26's writer** is `instance-setup`: its R13 at the first boot (reading R54) and its R14 after (K93, N66).
- **`perItem`'s callers** (R50) are `entities` (`op=resolve`) and `queue` (`taskresolve`, `taskforward`,
  `proposedispose`), each passing its act's published identity groups (`affordances`' `PER_ITEM_ACTS`).
- **The censuses (N40).** The creation marker (the SHA-256 of the empty string) is defined here for R57; `promotion` exports its own `EMPTY_STRING_SHA` today and can import this module's. `promotion`'s `fileDigestOf` and `inlineBytesOf` (its `promotion/index.mjs`) give way to R58's, a change in `promotion` its next job makes (an entry for it). `homeCensus`, beside them in the store, reads provenance's `register` and is not this module's.
- `purge` today clears some 40 tables in one method, most of them other modules' (entities, connections, progressions, ai-runs and more). Under R21 each module declares its own tables when it is extracted; until then the legacy store declares the rest, so `purge` keeps clearing them.
