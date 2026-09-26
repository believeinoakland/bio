# record-core — requirements

**Status** · DRAFT by BOB #38, 2026-09-26 (P18 preparation), from a drafting worker's reading of the code, reviewed by BOB; for Bob's approval (a product module, P17). Layer 2. Code today: inside the legacy modules `bio-plane/src/store.mjs` and `schema.mjs`; the module is extracted from them by its first job. R16 and R26 are not yet met (D-674, N10).

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
- **R16** Manifest entries are given back in the order this module recorded them (write order), never
  resorted by a caller-chosen key. *(not yet met: `readImage` sorts entries by `snap_key` text, which is
  not write order — see report §3, D-674's amendment to State Rules I-20.)*
- **R17** Returns `null` when the bundle is not held.
- Errors: never throws.

**auditPass({after, limit, viewer}) → page report**
- **R18** Runs the check catalogue (`legacy-checks`) against a bounded page of bundles in id order from
  `after`, and reports, for the page: how many bundles were clean, how many carried an error, and every
  error tallied both by check and by check-and-code.
- **R19** Every reference a check must resolve is resolved against the WHOLE corpus, never the viewer's
  slice of it, so a check never manufactures a dangling-reference finding out of a viewer's position; the
  page returned, and any bundle it names, is limited to what the given viewer may see.
- **R20** Resumable: the cursor returned is the last bundle id seen on the page, independent of any
  snapshot of the store.
- Errors: never throws.

**declarePurge(module, tables, {exempt?}) → void**
- **R21** A module that owns tables declares them here once, at start. `purge` clears every declared table except those declared `exempt`; this module's own tables (`bundles`, `files`, `history`, `manifest`, `leases`) are declared by it. A table declared twice, or by two modules, is refused with `TABLE_DECLARED`.

**purge({bundleId}) → report**
- **R22** With no `bundleId`, clears every row of every declared, non-exempt table; with one, clears only the rows keyed to that bundle. A table no module has declared is never touched.
- **R23** Never clears the id counter (`seq`), the opaque-id ledger (`minted_ids`) or a table declared `exempt` (such as the instance's identity and settings), in either form: an id once allocated or minted is never reissued, purged store or not.
- **R24** Reports which form ran (`scope`, `"ALL"` or the bundle id) and a per-table count of what was removed, naming every declared table even when it removed nothing.
- Errors: never throws.

**getSetting(name) → value or null; setSetting(name, value, by) → void**
- **R25** Holds the instance's settings as named values, each recorded with who set it and when. `getSetting` returns the value last set, or `null` when none was. Settings are exempt from `purge`.
- **R26** The instance's active jurisdiction profiles are the setting `jurisdiction_profiles`: an ordered list of profile ids, which a consumer passes to `jurisdictions.combine`. *(not yet met: N10)*

## Private

### Uses

- `legacy-checks`: the check catalogue `auditPass` runs, and the check ids and translations this
  module's own refusals cite (`ALLOCID_PREFIX_GATED`, C-59.5).
- `id-spaces` is a permitted dependency (`build/layers.md`) but nothing in this module's share calls it
  today.

### Invariants

- **R27** **C-59.5.** A caller never allocates a sequential id for a gated prefix (`PROJ`, `CASE`,
  `DRAFT`, `RVG`, `TASK`); those objects' ids are opaque and minted only by the act that creates them.
- **R28** An id this module has allocated or minted is never handed out to a second object, by any path,
  purged store or not (D-432).
- **R29** `history` and `manifest` are append-only: no service of this module modifies or deletes a row
  of either; the only sanctioned removal is `purge`.
- **R30** A lease is never held under an anonymous actor (R10 restated as the rule the module keeps, not
  merely the shape of one refusal).
- **R31** Every service of this module reads and writes only this module's own tables and the system
  clock (and `purge` clears the tables other modules declared to it, R21); it makes no network call and holds no member, capability or fence.

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

- The inline `INSERT`s into `files`, `history`, `manifest` and `bundles` that `promote()` performs today
  (`store.mjs` roughly lines 19289–19363) belong at this module's own interface, as write primitives
  (for example a `commitFiles`/`writeBundle` service) that `promotion` calls, rather than `promotion`
  reaching into these tables' rows directly. That is an extraction decision, not a requirement of
  behaviour.
- `#mintProjectId`'s slug derivation is project-specific; whether it stays here (a thin wrapper over
  `mintOpaqueId`) or moves to `promotion` (the module that actually mints `PROJ` ids) is an open
  extraction question, not a requirement.
- `purge` today clears some 40 tables in one method, most of them other modules' (entities, connections, progressions, ai-runs and more). Under R21 each module declares its own tables when it is extracted; until then the legacy store declares the rest, so `purge` keeps clearing them.
