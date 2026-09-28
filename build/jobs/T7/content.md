# content (T7)

**Status** · session_014cVKFvJhGvHewaQ6myVSLX · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N119 changes what `cropOf` answers, so R32's text needs your fold (step 5: BOB updates the requirements first). My proposed R32, which I am building to now:

- **R32** The crop of an image cited by page and rectangle, through `pdf-pixels`, served as a derived rendition that says so; its bytes travel as `bytes_base64` (standard base64 of the rendition's file, whose `file_sha256` the answer states), never as raw octets; an absent or invisible row is `NO_SUCH_CONTENT`.

The module encodes it (so every route, not only the plane's, gets one wire form); the answer no longer carries `bytes`. Effect elsewhere: `bio-plane/test/d419-content-crop.test.mjs` (legacy-tests) reads `g.bytes` / `j.bytes`; its `octets` helper already decodes base64, so it needs only `bytes` → `bytes_base64` at its three reads. I will REPORT that at completion.

Also, for your record (not a question): N117's bound on `markStale` is stated in my record at completion; in short, one read (at most 200 rows graded, total counted in the same statement) and one UPDATE per re-read, and ONE notice per listener per re-read carrying the graded rows, never a notice per row.

## J2 · REPORT

Found in other modules (none changed by me):

1. **legacy-tests · `bio-plane/test/d419-content-crop.test.mjs`** (R32 as folded, K179; N119): the crop's answer carries `bytes_base64` and no longer `bytes`. Its `octets` helper already decodes base64; the reads `octets(g.bytes)` and `octets(j.bytes)` (lines 193, 199) become `octets(g.bytes_base64)` / `octets(j.bytes_base64)`. Until then it reads 14/2 (the two arms that hash the crop's bytes); 16/0 on the base.
2. **legacy-tests · `bio-plane/test/derivation-bounds.test.mjs`** (N117, an improvement): `content/index:markStale` leaves the unbounded-derivation class (its read now carries `LIMIT ?`). CLASS 31 → 30 (walk 19 → 18), CENSUS 179 → 178; re-pin the ratchet (its `want [31,33]` arm, red on the base too, now reads `[30,33]`) and drop markStale from T5-12's arrivals note. 66/7 on the base and here, the same seven arms.
3. **legacy-tests (or whoever owns the DEC-49 guard) · `civicos-ui/check-refusal-codes.mjs`** (LEGACY-CHECKS #2 REPORT 8, applied): the store's `versionNotice` passage arm now delegates to `passageNotice`, so the guard's "refusal("VERSION_NOTICE_NO_CONTENT") is NOT a row" failure is cleared. `VERSION_NOTICE_NO_CONTENT` is now minted at one site, so its entry in `MULTI_SITE_CLOSED` is stale (arm G fails it by name): remove it. Also `regionLines` 4682 → 4681 and `codesChecked`/`refusalsJudged` 621/617 → 620/616 for the re-pin print. Failures 102 before, 102 after (one cleared, one stale-closure added).
4. **Unchanged, measured:** versionnotice 41/0, versiongrade 28/0, version-notice-surface 29/0, gate-reads 115/0, machinefences-dec49 89/0; hygiene red identically on the base (`record.registerAuditCheck is not a function` from provenance, line 807).

## J3 · COMPLETE

**Entries applied**

- **N117** (its share; R41): `markStale` is bounded. Per re-read, inside the writer's transaction (extraction R24): ONE read, `SELECT … count(*) OVER () AS n … ORDER BY content_id LIMIT 200` (`STALE_GRADED_MAX`, exported), which returns at most 200 rows with the total; ONE `UPDATE content SET stale=1` over the whole set (unchanged predicate: other non-null chain, not stale, not a typing). The return is the total staled. With a listener, the rows read are graded (R31's `gradeAcross`, unitsBefore against the index after) and each listener is called ONCE per re-read, never per row, with `{capture_sha, chain, staled, graded, rows: [{content_id, bundle_id, capture_sha, ref, grade, affects, reason, why, found_at, similarity, stale}], ungraded, ungraded_after, ungraded_affects: "undetermined", ungraded_why, says}`. `rows` holds only the graded rows that are affected or undetermined; rows past the bound are marked, counted in `ungraded`, and are exactly the capture's stale rows whose `content_id` sorts after `ungraded_after` (R45's read contract lets the listener list them). No listener call when nothing is affected, undetermined or ungraded.
  **Proposed R41 wording, for your fold before inquiry starts (B2):**
  - **R41** When a replaced reading marks rows stale (R22), the re-read costs one read and one update however many rows it marks: the read returns at most 200 of them (`STALE_GRADED_MAX`), in content-id order, with the total in the same statement, and one UPDATE marks them all; `markStale` answers the total. Each row read is graded old text against new as R31 grades a newer capture (`A`, `B`, `C`, `NOT_FOUND`, `UNDETERMINED`; `UNDETERMINED` when the old text is not held). A module that tells members (inquiry, K31's pattern) registers once with `onStale(module, fn)` (a second registration `LISTENER_DECLARED`), and each `fn` is called once per re-read, never per row, with the rows whose grade is affected or undetermined and the count of rows past the bound (`ungraded`, undetermined, those whose content id sorts after `ungraded_after`), and not at all when there is none; each member citing such a row is told, as for a newer version of the document; the member chooses to keep the row or adopt the passage under the new chain, and nothing moves by itself (R34) (K102, N117).
- **N119** (R32 as folded, K179): `cropOf` answers `bytes_base64` (standard base64 of the rendition's file, chunked so a large crop cannot overflow the stack) and no `bytes`; `file_sha256` states its hash. Tested: no `bytes` key, the string survives JSON as itself, decodes to the file whose hash is `file_sha256` and to the image's own samples.
- **Forwarded LEGACY-CHECKS #2 REPORT 8**: the store's `versionNotice` passage arm (`content=`) now delegates to `passageNotice` (its refusal returned as is; its notice folded into the store's envelope unchanged); the store no longer mints `VERSION_NOTICE_NO_CONTENT`. Legacy lines: 5 added (all `contentOf` / its result), 6 removed; ownership check lists them.

**Deferred:** nothing. **"Not yet met" markers** in the requirements' Status line (R9, R10, R11, R14, R18, R32, R33, R41): every one is built and tested here; R41's bound is met once you fold the wording above. The markers are yours to clear.

**Other modules:** J2 (legacy-tests: d419 reads `bytes_base64`; derivation-bounds re-pin 31 → 30; the DEC-49 guard's stale `MULTI_SITE_CLOSED` entry for `VERSION_NOTICE_NO_CONTENT`). No generated artifact made stale beyond the plane bundle every layer regenerates (`bio-plane/dist/bio-plane.bundled.mjs` embeds `src/content/` and `store.mjs`).

**Tests and checks** (on `job/T7/content` after merging `tranche/T7` @ B2):
- Module: `node --test bio-plane/test/m/content/` → tests 50, pass 50, fail 0 (49/49 at the start; one test added, `R41 (N117)`: one bounded read and one update, 203 rows, one notice, ungraded 3).
- Layer tests: none named in `build/manifest.md`. Users of `onStale`: none registered yet (inquiry, layer 6).
- Legacy suites touching the store change or my outputs: versionnotice 41/0, versiongrade 28/0, version-notice-surface 29/0, gate-reads 115/0, machinefences-dec49 89/0; d419-content-crop 14/2 (J2.1); derivation-bounds 66/7 (same arms as the base, J2.2); hygiene red identically on the base; the DEC-49 guard 102 failures before and after (J2.3).
- `node checks/format.mjs` → 0 failures; `architecture.mjs … content` → 13 product files, 39 relative imports, 0 failures; `coverage.mjs … content` → 45 of 45 live ids named by a test, 0 failures; `ownership.mjs … content tranche/T7` → 5 files, legacy-store 5 added / 6 removed, 0 failures.

Size (session_014cVKFvJhGvHewaQ6myVSLX): test runs 4, module lines 2187
