# acquisition (T35)

**Status** · session_01UMj9SBkQaJdNggTSiaKV3Q · depth 2 · WORKING · handled B2

## J1 · QUESTION

My readings on T35-21, which I am building on now; correct any you read otherwise.

1. **Where R38/R41's tables live.** The store handed in (capture's) exposes no storage, so acquisition gets its own per-storage instance, `acquisitionOf(host, {record, provenance, membership})` (attestation's pattern): it migrates and `declareTable`s `archive_entries` and `unpack_days`, and carries `archiveList`, `memberOf`, `coArchiveSet`, `coArchiveState` (R41, R43, as instance methods, the signatures R41/R43 give). `unpack(store, {archiveSha, by, cls})` and `acquire`'s automatic run reach it as `store.acquisition` (as `store.attestation`, capture R73), else the instance an `acquisitionOf` call made over the same record-core. **Capture's share (T35-22):** set `acquisition` on its store (one `acquisitionOf(ctx, {record, provenance})`), and pass `ownHosts` (opts or `store.ownHosts`; I read either). Until then an acquire of a ZIP files the archive and states `unpack: {ok: false, reason: "ARCHIVE_RECORD_UNAVAILABLE", ...}` (no row: a wiring fact, never a member's). **Control-plane's share (T35-72):** builds the instance for `op=unpack`, `archivelist`, `coarchiveset`, `coarchivestate`.
2. **isOwnHost.** I import it from capture-sources (merged before me). Which file? I will import `../capture-sources/hosts.mjs` unless CAPTURE-SOURCES #11 names another; please tell me its path once it is pushed.
3. **The new row family** is C-137 (the highest in the tree is C-136). If a parallel L3 job takes C-137, tell me and I renumber.
4. **"A member session, `by` an active member" (R40):** `cls === "member"` (or `member: true`, as `acquire`'s opts) with `by` a non-machine member id; the control plane stamps that class only for an active member's session. Admin/probe are "any other caller" and refused `UNPACK_NOT_PERMITTED`; the daemon runs within every budget.
5. **Budgets (R40)** count what is cut: an entry reached that is a folder, link or refused verdict is recorded and costs nothing; each cut counts 1 entry and its declared uncompressed bytes toward the call, the tree (stored on the outermost archive) and, automatic or member, the day.
6. **R39's `content_type`:** no response exists, so it is the media type of the format `format-registry.detectFormat` finds in the file's own bytes (a small table in my module keyed by its ten format names), absent when undetermined; the profile is then taken with that type, so a text file is profiled as text.
7. **A symlink's target (R38, R41)** is stated by cutting its (at most 4 KiB) data as the archive's claim, decoded UTF-8; never followed. Larger or unreadable: `target: null` with why.
8. **The driver (Suggestions):** an automatic run that stops on the per-call budget, or files a nested archive within depth, enqueues `{kind: "archive-unpack", captureSha}` through the store handed in (capture R15); a failed enqueue never fails anything. Capture's share adds the kind.
