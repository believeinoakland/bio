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

## Completion (J3)

**Entries applied (T35-21).**
- **N661:** `profileOf`'s comment and `origin.test.mjs`'s header drop "or a knock".
- **DEC-149 sweep (N664, N693), 18 rows:** `checks.mjs`:45, :66, :84, :94 (C-83.4), :103, :131, :155, :183, :212, :226, :227, :242; `index.mjs`:536, :544, :625, :715, :826; `keyed.mjs`:64, each with a test naming its string (`dec149.test.mjs`). The X rows (`index.mjs`:691, :693, bindings) stay.
- **N688 (R17, R25–R27, R38–R41):** `unpack.mjs` (new): `acquisitionOf(host, {record, provenance, membership})` holds this module's two tables (`archive_entries`, `unpack_days`, `declareTable`'d as the Suggestions name them); `unpack(store, {archiveSha, by, cls, member})` with every R38 refusal, each entry's outcome, receipts `via: "unpacked"` at `<address>#zip:<i>` / `zip:<sha>!<i>`, R39's document per file; R40's per-call (100 entries, 64 MiB), tree (counted on the outermost archive), depth (outermost 1) and daily (1 GiB, 40,000) budgets, each exported and named with its figure by every wait; `archiveList` and `memberOf` (R41). `acquire` opens a ZIP it captures in the same call and answers `unpack` beside `document` (R40); `profileOf` names `zip` from the bytes, past the read's bound over the stored parts too, never for an office or ODF file (R17).
- **F16 (R42):** `OWN_HOST_REFUSED` for `acquire` (before any request; redirects followed by hand when `ownHosts` is given), supporting files (`fetch_reason`), the render (`own_hosts`), `keyedFetch` and `citationLookup`; `ownHosts` from opts or the store; none given, nothing refused.
- **K1888 (R20, R43):** `coArchiveSet` (an active administrator's; `NOT_AN_ADMIN` through membership; `CO_ARCHIVE_SETTING_INVALID`), `coArchiveState` (on by default, K60); a member's per-capture choice (`body.coArchive` from a member session, `captureRequest.coArchive`); a co-archive not asked is recorded `{service: "co_archive", kind: "co_archive", attempted: false, ok: false, asked: false, by}` (C-18.1's shape, not a failed attempt).
- **R29:** the C-137 family, C-137.1–C-137.19 (BOB's B2: C-137 is this module's), member words in DEC-149's voice, no figure in any.

**Readings applied (J1, all confirmed by B2):** as J1 states. Also: the first cut of a call always fits the per-call byte share, so a file larger than 64 MiB is never held back for ever; MEMBER_MAX is unreachable through ooxml's listing while `MEMBER_MAX` = `ARCHIVE_TOTAL_MAX` (a member over it puts the archive over the total, refused whole first), so its path is the generic not-cut verdict, tested with ARCHIVE_RATIO_MAX; an archive past the depth bound is answered all `waiting` on `ARCHIVE_DEPTH_MAX` and nothing of it is recorded, so R41 reads it as not opened; a cut whose storage fails, or whose source becomes unreadable, is not filed as `ARCHIVE_UNREADABLE` with its why; files' `authority_state` is `undetermined` with a dated basis (C-18.1 requires one), no authority task is enqueued per file.

**Deferred:** none in this module. Not proven here: the integration with provenance's real R59 grade and `UNPACKED_VIA`, and with capture-sources' `isOwnHost` (both L3 jobs not yet merged): this branch imports `UNPACKED_VIA` from `provenance/index.mjs` and `isOwnHost` from `capture-sources/index.mjs` (B2), so it loads only once both have merged; its tests passed against local stand-ins of the two exports, not committed. See J2.

**Found in other modules (J2):** control-plane's `rows-before-r43.json` pins ten of the re-worded rows; the plane bundle is stale; capture's and control-plane's shares; see J2.

**Tests and checks run.**
- `node --test bio-plane/test/m/acquisition/`: tests 144, pass 144, fail 0.
- Users (my tree against `tranche/T35` @ e13746c597's tree): capture 127/0, capture-requests 86/0, monitoring 121/0, ratification 212/0, standards 51/0, link-sweep 29/0, provenance 88/0, attestation 19/0, instance-setup 99/0, provenance-routes 37/0, retrieval 139/0, scheduler 95/0, public-read 131/0, case-authoring 145/0, `cap13-reuse-pages` 1/0, `tier2-wire` 1/0; control-plane 181/1 (catalogue-end, accepted red 19, red on the base too), extraction 115/6 (accepted red 6), workbooks 25/1 (accepted red 8). No layer tests are named in the manifest.
- `format: 129 modules, 128 requirements files; 0 failures`
- `architecture: 22 product files, 99 relative imports (2 naming no tracked file, not judged); 0 failures` (the two are the pending capture-sources and provenance exports above)
- `coverage: 1 modules, 43 of 43 live requirement ids named by a test; 0 failures`
- `ownership: 14 files changed by acquisition between tranche/T35 and HEAD; 0 failures`

Size (session_01UMj9SBkQaJdNggTSiaKV3Q): test runs 22, module lines 2842
