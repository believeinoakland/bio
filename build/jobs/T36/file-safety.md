# file-safety (T36)

**Status** · session_017HHK6Ecu8dE2tpWEUqLyxZ · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings I am building on; answer only if one is wrong.

1. **"Membership's sight refusal" (R2, R6, R8, R9, R11, R13, R33).** A capture registered under a bundle the viewer may not see (membership R43 over provenance's register, the rule `capture`'s own `#captureGate` applies) answers `membership.noSuchProject(null)` (R78: absent, naming no project the viewer did not ask about). A digest no receipt, register row or held object names answers my own `NO_SUCH_CAPTURE` (C-140). Alternative: `NO_SUCH_CAPTURE` for both, as acquisition's `ARCHIVE_NOT_HELD` does.
2. **Byte answers (R8 `openoriginal`/`openwithwarning`, R11 `safeview`, R33 `safecopy`).** The module's method answers a `Response` with the bytes exactly as `capture`'s R21 get (`captureObjectOp`) serves them (`x-capture-sha256` equal to `captureSha`), or a refusal object. My ops map (`fileSafetyOps`) returns that `Response` for those ops; how the door carries a byte answer out of the store is control-plane/plane's routing (T36-37, T36-49), not mine.
3. **Not yet merged services.** provenance R60 (`receiptsOfCapture`) and R61 (`reputation` on the `onReceipt` payload) and acquisition R44 land before me in L3's merge order. My code calls `receiptsOfCapture` when present and otherwise `receipts()` filtered by capture; my R1/R34 tests drive provenance's real `recordReceipt` with `reputation`, so those few tests are red on my branch until T36-9 merges. I will verify them against PROVENANCE #18's branch once it is COMPLETE, and say so in my COMPLETE.

## J2 · QUESTION

Adds to J1 (does not replace it). **R33's ClamAV scan of a safe copy cannot be asked of `file-scanner` as it stands.** R33 stores the rebuilt file "under its own digest outside `captures/`" and then has it "scanned by ClamAV"; but `file-scanner` R1–R2 read a target only at `${store}/captures/<sha>` (`store.mjs` `captureKey`), so `/scan` answers the copy `not_scanned` `NOT_FOUND`.

Options: (A) `file-scanner` gains a target over the derived area (a field such as `area: "derived"`, reading `${store}/derived/<sha>`), a later file-scanner job; until then every safe copy is withheld (`SAFE_COPY_WITHHELD`, its copy note `not_scanned`), which is safe and makes the safe copy unusable. (B) The copy is stored under `${store}/captures/<copySha>` as an unregistered, content-addressed object, which `/scan` can read; it is still never registered, graded or cited (R37 holds), but it sits under `captures/`, against R33's wording.

Recommendation and my best reading, which I am building: (A). I store copies (and safe views) under `${store}/derived/<sha>`, send the copy's scan as `/scan {store, targets:[{capture_sha:<copy sha>, parts:null}], area:"derived"}` (today's member ignores `area` and answers `NOT_FOUND`), and withhold the copy until a `clean` note. If you choose (B) it is a two-line change here.

## Reading set (mechanics §17, N739)

Measured at the start as §3 asks for a job on its own module's Provides: my requirements (26 KB) and, for each module my Uses names, its Purpose and the services my Uses names from its Provides (97 KB): 123 KB, under 300 KB. I read that set whole, plus layer 3's row of `build/layers.md`, plan T36's rules at the opening and entry T36-11, `file-scanner`'s whole public part, and DEC-169 and DEC-173 in `docs/development/DECISIONS.md`. The module had no code or tests before this job.

## Entries applied (T36-11)

The whole module, new: `bio-plane/src/file-safety/` (`index.mjs` the services and the route map, `checks.mjs` the C-140 rows and the reasons' words, `kinds.mjs` R38's table, `formats.mjs` the readers' reads, `schema.mjs` the tables) and its tests `bio-plane/test/m/file-safety/` (8 files, 42 tests, every one of R1–R38 named).

- **R1** intake: provenance's `onReceipt` listener queues every receipt's capture once (one row per digest), the render wake renders only a file with a safe-view route; a receipt's `reputation` (provenance R61, acquisition R44) adds a `reputation` note; a failure never fails the receipt.
- **R2, R3** append-only notes; **R2 as K2098 words it (B2)**: a capture the viewer may not see answers exactly as an absent one, `NO_SUCH_CAPTURE`, here and everywhere the sight refusal applies (R6, R8, R9, R11, R13, R33, R17's release).
- **R4, R5** the daily batch (one `/scan` request, `SCAN_BATCH_MAX`, oldest due first), routine scan tools within their monthly limit; the status for administrators, `overdue` stated.
- **R6, R7, R20** the grade computed at the call (fetched source, the readers' `active`, encryption, hold, listed reputation; the archive rule over `acquisition.archiveList`, nested archives, cycles); never stored.
- **R8, R9, R10** the original as `capture`'s R21 get serves it, every refusal in R8's order (DEC-173's warned path, `op=openwithwarning`); `originalState` by the same rule without scanning; nothing records who opened or confirmed.
- **R11, R12** the safe view (the image-only PDF under `${store}/derived/<sha>`, a spreadsheet's held cells as data); rendered after capture, served under a hold.
- **R13, R14, R36** the deeper check: structure check, ClamAV on demand, every outside scan and sandbox tool with budget left; `clean`, `flagged`, `incomplete`; the wake that polls sandboxes.
- **R15–R19** findings, holds, release by two members or a second, different engine (ClamAV-only holds), new names a new hold.
- **R21** the constants. **R27–R32** the tools (catalogue with handling digests, add with every refusal, test, remove, events, private-mode switch-off, routine use for the organization's own servers only). **R33** the safe copy, **as K2099 rules it (B3)**: stored under `${store}/derived/<sha>`, its scan sent as `/scan {…, area: "derived"}`, withheld (`SAFE_COPY_WITHHELD`, note `not_scanned`) until a clean note: **safe copies are withheld until N753** (file-scanner reading the derived area). **R34** `reputationTool()`. **R35** counts forwarding, absent never zero. **R22–R26, R37, R38** the invariants and the finding kinds.
- K2093's notes on `credentials` applied (a set with no key removes; a set of fields answered as the object set).

Readings J1 (2) and (3) stand (B2): byte answers are Responses from the ops map (`openoriginal`, `openwithwarning`, `safeview`, `safecopy`); `receiptsOfCapture` is used now that T36-9 is merged.

## Detail decisions (BOB's to record in `rulings.md`, P17)

- Tables `fs_files`, `fs_notes`, `fs_holds`, `fs_deeper`, `fs_copies` (keyed to the capture's home bundle, `purge: clear`, `sight: source`), `fs_tools`, `fs_tool_usage`, `fs_tool_events`, `fs_counts` (`purge: exempt`, the group's).
- `SCAN_WAIT_MS` 5,000 (R8's wait before `SCAN_PENDING`; the scan goes on and writes its note); `OVERDUE_MS` one day (R5); `RELEASE_REASON_MAX` 2,000.
- R6's fetched routes are `direct`, `archive.org`, `capture-request` (Drive and render record `direct`); `doorbell` is handed in; `unpacked` takes its archive's.
- R16: a found note widens an open hold that names the same finding with its engine, so R18 sees every engine behind a hold; a `copy` note's finding withholds the copy and holds nothing (it is not the original).
- R17: the first member's act marks every open hold of the file pending; a second, different member releases them; machine identities (`class:…`, `record-grammar`'s non-member authors) and an absent `by` are `MACHINE_CANNOT_RELEASE`.
- R14: a tool past its limit is listed `skipped` and does not make the check incomplete; an image or plain text passes the structure check by its kind; a format no reader reads (HTML, SVG, legacy OLE) is a check that could not run, so its deeper check is `incomplete`.
- R32's "recipient is the organization" read by the catalogue's own words (`onOwnServers`): "the organization…", or a service "(the organization's own …)" (see finding 2).
- Note and check ids `FSN-`/`FSD-` + 16 random hex; tool ids `<provider_id>-<n>`.

## Found in other modules and in my own (REPORT)

1. **file-scanner R1–R2** read a target only under `${store}/captures/`, so R33's copy scan answers `NOT_FOUND`: N753 (B3, K2099). Until then every safe copy is withheld.
2. **file-scanner R20's catalogue** states no descriptor's `handling.recipient` as exactly "the organization", which R32 names. Read by wording, `metadefender-core` and `defender-storage` take routine use; no catalogued **CDR** tool can (`glasswall-halo` "the deployment the organization runs or subscribes to"; `opswat-deep-cdr` "OPSWAT (Cloud), or the organization's own Core server"), so R32's routine CDR is reachable only once a self-run descriptor states the organization as recipient (a file-scanner change; my test sets the use as R28 would record it).
3. **Codes held by other families** (requirement-fixed here): `NO_REASON` (credentials C-29.32, progressions), `NO_SUCH_CAPTURE` (sources C-121.9), `MACHINE_CANNOT_RELEASE` (ratification). When T36-47 adds `src/file-safety/checks.mjs` to `CHECK_FAMILY_FILES` in module order, `dec49Row` keeps credentials' `NO_REASON` but decorates `NO_SUCH_CAPTURE` and `MACHINE_CANNOT_RELEASE` with mine (file-safety precedes sources and ratification); their own tests may pin those decorations.
4. **The users' wiring** (later layers): the route map `fileSafetyOps` with byte answers for four ops; `reputationTool()` for control plane to hand acquisition; the scheduler's wakes; nothing in the plane imports the module yet, so no generated artifact is stale.
5. **answer-envelope** `R7, R2` ("every code decorated before the catalogue's end …") and **row-census** fail on the tranche tip without my change too (not mine).

Rows added, each awaiting stamp (T37's promotion job), all in `src/file-safety/checks.mjs` `FILE_SAFETY_CHECKS`:
- C-140.1 NO_SUCH_CAPTURE awaiting stamp
- C-140.2 SCANNER_ABSENT awaiting stamp
- C-140.3 SCANNER_UNREACHABLE awaiting stamp
- C-140.4 NOT_SCANNED awaiting stamp
- C-140.5 SCAN_PENDING awaiting stamp
- C-140.6 SCAN_HOLD awaiting stamp
- C-140.7 SCAN_STALE awaiting stamp
- C-140.8 WARNING_NOT_CONFIRMED awaiting stamp
- C-140.9 SAFE_VIEW_ONLY awaiting stamp
- C-140.10 NO_SAFE_VIEW awaiting stamp
- C-140.11 SAFE_VIEW_PENDING awaiting stamp
- C-140.12 SAFE_VIEW_FAILED awaiting stamp
- C-140.13 RENDERER_ABSENT awaiting stamp
- C-140.14 NO_OUTSIDE_TOOL awaiting stamp
- C-140.15 DEEPER_CHECK_BUDGET_SPENT awaiting stamp
- C-140.16 MACHINE_CANNOT_RELEASE awaiting stamp
- C-140.17 NO_REASON awaiting stamp
- C-140.18 NOT_HELD awaiting stamp
- C-140.19 SAME_MEMBER awaiting stamp
- C-140.20 PROVIDER_REFUSED awaiting stamp
- C-140.21 PROVIDER_HELD awaiting stamp
- C-140.22 PROVIDER_UNKNOWN awaiting stamp
- C-140.23 DESCRIPTOR_MALFORMED awaiting stamp
- C-140.24 PROVIDER_SHARES_SAMPLES awaiting stamp
- C-140.25 HANDLING_NOT_STATED awaiting stamp
- C-140.26 NEVER_SENDS_INCOMPLETE awaiting stamp
- C-140.27 ADDRESS_WOULD_LEAVE awaiting stamp
- C-140.28 PRIVATE_MODE_UNVERIFIABLE awaiting stamp
- C-140.29 HANDLING_NOT_SHOWN awaiting stamp
- C-140.30 RETENTION_NOT_CONFIRMED awaiting stamp
- C-140.31 CREDENTIALS_MISSING awaiting stamp
- C-140.32 USE_NOT_ALLOWED awaiting stamp
- C-140.33 LIMIT_INVALID awaiting stamp
- C-140.34 NO_SUCH_TOOL awaiting stamp
- C-140.35 NO_SAFE_COPY awaiting stamp
- C-140.36 SAFE_COPY_PENDING awaiting stamp
- C-140.37 SAFE_COPY_FAILED awaiting stamp
- C-140.38 SAFE_COPY_WITHHELD awaiting stamp
- C-140.39 FORWARD_PERIOD_INVALID awaiting stamp

For BOB to fill in `modules.json`: file-safety `paths` `["bio-plane/src/file-safety/"]`, `tests` `["bio-plane/test/m/file-safety/"]`.

Deferred: nothing of my own module. P6: 3,679 lines with tests (1,971 source), under about 4,000.

## Tests and checks

- `node --test test/m/file-safety/` (after merging `tranche/T36` @ the L3 merges): **42 pass, 0 fail**.
- The modules I use, on my branch: provenance 111/111, acquisition 152/152, capture 153/153, sources 30/30, credentials 119/119, membership 172/172; answer-envelope 25 pass, 1 fail (fails identically on the tranche tip); row-census fails on the tranche tip (red 4) and, with my paths filled, also lists my 39 rows arriving (accepted red 4 until T37).
- `node checks/format.mjs`: 0 failures. With my `paths` and `tests` filled in a local, uncommitted copy of `modules.json`: `architecture.mjs` 14 product files, 58 relative imports, 0 failures; `coverage.mjs` 38 of 38 live ids named by a test, 0 failures; `ownership.mjs` 15 files, 0 failures. Without them (as committed) architecture judges 0 files and coverage and ownership fail on the empty entry (red 2's file-safety half, which clears when BOB fills them).

Size (session_017HHK6Ecu8dE2tpWEUqLyxZ): test runs 31, module lines 3679
