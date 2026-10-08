# acquisition (T39)

**Status** · session_01KoNcJWSwALaZQ9B5mKBcnH · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T39-4 done: `job/T39/acquisition`, from `tranche/T39` @ efe0298974; no merge of the tranche needed (BOB changed nothing I read after START).

**Entries applied:** T39-4 (N804; K2307): new `bio-plane/test/m/acquisition/archive-entries.test.mjs`, four tests naming R45, each through a later module's own SQL over archives captured and opened through `acquire` and `unpack`: (1) the table carries `archive_sha`, `idx`, `name`, `kind`, `state`, `sha256`, keyed (archive_sha, idx); (2) an opened archive is its row at `idx` −1 plus one row per listing entry 0…n−1, every row's `name`, `kind`, `state` and `sha256` checked against R41's `archiveList` answer for the same entry (folder/`dir`, filed, already held, not filed, link/`symlink`, a non-ASCII name, a nested archive whose `sha256` becomes an `archive_sha` with its own −1 row once opened); (3) the listing is written whole at first opening (103 entries: all rows present after the first call, those not reached `waiting` with no digest; a later call adds or removes no row; no entry row anywhere without its −1 row); (4) no −1 row means no recorded listing: held never opened, refused whole (`ARCHIVE_AMBIGUOUS`), `NOT_AN_ARCHIVE` and past `ARCHIVE_DEPTH_MAX` each leave no row at all, with an opened archive as the negative control. Coverage's rule 3 item 1 clears. R45's `*(not yet met: T39)*` mark can go (yours to remove).

**Fixed in passing (own module):** `index.mjs`:1 header said R1–R43 (now names R44 and R45/R38–R41 in `unpack.mjs`); `index.mjs`:557 acquire's comment omitted R31, R32, R35; `dec149.test.mjs` titles cited moved lines (index.mjs :536/:544/:625/:715/:826, keyed.mjs:64 → :569/:577/:658/:752/:878, :65); `acquire.test.mjs`:687 a near-vacuous assertion (`!("registerHolds" in w.prov && w.prov.register)`) replaced by counting `register` rows before and after; `acquire.test.mjs`:140 indentation.

**Deferred (own module), why:** `co-archive.test.mjs`:58's comment claims the archive arm asks no co-archive and records none as not asked, with no assertion behind it; testing it needs an archive-arm capture in that file, beyond a test-only entry; noted for the next acquisition job.

**Found elsewhere / generated artifact:** my `index.mjs` comment edits stale the plane bundle (`fleetbundles`: bio-plane STALE BUNDLE from `src/acquisition/index.mjs`; accepted red 7, regenerated at layer close). No other module's flaw found.

**Reading set:** START's measure 612 KB, over 300 KB. Read whole myself: `requirements/acquisition.md`, layer 3's row of `layers.md`, the plan's T39-4 entry and rule 3, K2307, `src/acquisition/unpack.mjs` (the table, its writes and R41's read), `archivelist.test.mjs`, `fixture.mjs`, and case-carriage's two reads of the table (`index.mjs`:44, :445–475). The used services my Uses names that this test touches are only the table itself (record-core's `declareTable` declaration is in `unpack.mjs`, read). A worker read whole `index.mjs`, `checks.mjs`, `keyed.mjs` and the 16 other test files (444 KB); its summary (~6 KB, each statement citing file:line) covered every read or write of `archive_entries`/`unpack_days`, the test helpers, and flaws (applied above). Nothing it left out mattered: the contract lives wholly in `unpack.mjs`, which I read.

**Tests:** `archive-entries.test.mjs` 4/4; acquisition (`test/m/acquisition/`) 157 pass, 0 fail; `acquire` + `dec149` after the fixes 44/44. No layer tests named in the manifest.
**Checks:** format 0 failures; architecture 0 failures; coverage 45 of 45, 0 failures; ownership 0 failures (5 files).

Size (session_01KoNcJWSwALaZQ9B5mKBcnH): test runs 7, module lines 2954
