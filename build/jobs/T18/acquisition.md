# acquisition (T18)

**Status** · session_016FKEhQzcqEZnTrvcRTaFgY · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (`build/plan/current.md` layer 3, `acquisition`):
- The split by copy (K617, K649 (1), K624 (1)): `capture/acquire.mjs` copied into `bio-plane/src/acquisition/index.mjs`, its catalogue imports re-pointed to this module's `checks.mjs`, its comments renumbered to acquisition's ids (capture's own Rs named as `capture R<n>`). `capture/acquire.mjs` is untouched: capture's job reduces it to a re-export.
- `bio-plane/src/acquisition/checks.mjs` (R29, R24): C-83.1–C-83.8 (`RENDER_CAPTURE_CHECKS`), C-48.1–C-48.7 (`DRIVE_CAPTURE_CHECKS`, without C-48.8/.9, monitoring's), C-28.13 (`CAPTURE_REQUEST_ARM_CHECKS`), `CIVICOS_CONTACT_URL`, `civicosUserAgent`, and `ACQUISITION_CHECKS` (all 16 rows by code). Verified in the job: every code, number and translation identical to the catalogue's, and the agent byte-identical; each `where` re-pointed to `src/acquisition/index.mjs acquire > <region>` (the DEC-49 regions kept in the file). **These 16 rows are `awaiting stamp` for T19's promotion job.** The catalogue's copies are held twice until T19's layer 1 (K529). All re-exported from `index.mjs` for the importers that re-point in their T18 jobs.
- Converts (all nine): `cap14-reused-from` and `subresources` → `subresources-walk.test.mjs`; `d57selflink` and `d522-unattended-render` → `selflink-render.test.mjs`; `profile`, `framework-digest-audit`, `capture-container-extent` → `profile.test.mjs`; `drive-convert`, `daemon-token` → `grades.test.mjs`. Each carries acquisition's share; the rest of each suite is named by its owner below. Capture's tests of the moved Rs are carried, renumbered, in `acquire.test.mjs`.
- Built work named by the requirements' Suggestions, judged: `land/worker/D-340` and `D-702` are link containment and site chrome (capture R28), not this module's; `D-698` (one archive letter) is already met here (R18 reads provenance's `ARCHIVE_CAPTURE_GRADE`). Nothing taken.

**Fixed in the job (my module):**
- **R4:** a Drive export over 1 KiB (every real one) was recorded `export_format_confirmed: true`, "confirmed from the bytes", on Google's declared content type alone: `profile.format` reads only the first KiB (R17) and an OpenDocument package's central directory lies past it, so detection fell back to the label, which the hop took as confirmation. The hop's confirmation is now a detection over the stored export's bytes, whole (bounded by `ODF_DIGEST_MAX`), else "not sniffed". Found by the `drive-convert` convert; tested (`grades.test.mjs`).
- **R28:** redirects followed by hand (R23's credentialed fetch) are now held to the public-locator fence: a hop to a non-public address is not followed and the source is refused by name.
- A `store.env` absent no longer throws when the chain's first hop is written.

**Not yet met marks:** R17's N3 and N10 name docprofile's T2 view work and instance-setup's T12 setting, both done; the act profiles under `jurisdictions.combine` of `jurisdiction_profiles` and records the view (tested, `acquire.test.mjs` R17, `profile.test.mjs`): **R17 is met; BOB may strike its mark.** R7 (N77) stays: the mechanism asks `renderLocaleFor(view)` (tested), but no profile names a locale yet.

**For BOB (a requirement question, not blocking):** R17's "the first KiB read back" means an office file over 1 KiB served as `application/octet-stream` profiles as format `undetermined`, and an OpenDocument one then gets no container digest (every office test fixture over 1 KiB is recognised only by its declared type, `likely`). Reading the whole object for format detection up to `ODF_DIGEST_MAX` (already read for the digests) would recognise it from its bytes. Left as worded.

**Found in other modules (REPORT):**
- `tools/mail.mjs` (process): `mail state` commits everything staged along with the record: my staged module files went into `0933c8141b` ("state RUNNING …") and were pushed under that message. Harmless here (all mine), but the tool should commit only the record (`git commit -- <record>`).
- `capture`: `capture/index.mjs` imports `profileOf`, `profileView`, `governedFetch`, `governedCall` from `acquire.mjs` for its own uses (the knock's pull, `reattest`): capture's job re-points them to `acquisition` along with the re-export. Capture's `acquire.test.mjs` duplicates this module's tests until capture's job deletes it.
- No generated artifact made stale (no bundle's inputs include `src/acquisition/`).

**Converts' remainders, by owner** (assertions not carried because they are not acquisition's): capture (R24–R25 `site_assets`/`reusedParts`, R27 link resolution and tallies, R39 the allowance ledger, its store routes and `CAPTURE_ADDITIVE_COLUMNS` migration); capture-requests (the request row, drain lists, the flag's wiring from row to arm); provenance (R43 register refusals, the audit tally); extraction and text-chain (the convert step, readings, extents, chain pins); content and promotion (extent citations, `op=promote`); connections (link projection, `links_to`); instance-setup (runtime observations, cpuprobe); control-plane (the ops table and tokens); subresources' own library rules. Source-text pins dropped (P7).

**Tests:** `node --test bio-plane/test/m/acquisition/` → tests 55, pass 55, fail 0, todo 0. No layer tests (`build/manifest.md`). No provided service changed (a new module).

**Checks** (civicos-process):
- `node checks/format.mjs` → 79 modules, 74 requirements files; 0 failures
- `node checks/architecture.mjs … acquisition` → 9 product files, 37 relative imports; 0 failures
- `node checks/coverage.mjs … acquisition` → 30 of 30 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … acquisition tranche/T18` → 10 files changed; legacy-checks: 0 lines added, 0 removed; 0 failures

Size (session_016FKEhQzcqEZnTrvcRTaFgY): test runs 16, module lines 1247

## J1 · REPORT

Other modules: (1) tools/mail.mjs: 'mail state' commits everything staged with the record (my staged module files went into 0933c8141b under a state message); it should commit only the record. (2) capture: capture/index.mjs imports profileOf, profileView, governedFetch, governedCall from acquire.mjs for its own uses; capture's job re-points them with the re-export, and deletes its acquire.test.mjs (duplicated here). (3) For BOB, not blocking: R17's 'first KiB read back' leaves office files over 1 KiB served as octet-stream with format undetermined (and ODF with no container digest); reading whole up to ODF_DIGEST_MAX would fix it if you re-word R17. No generated artifact stale.

## J2 · COMPLETE

acquisition built by copy and merged-ready on job/T18/acquisition: src/acquisition/index.mjs (the act, from capture/acquire.mjs) and checks.mjs (C-83.1-.8, C-48.1-.7, C-28.13, civicosUserAgent, CIVICOS_CONTACT_URL; rows identical to the catalogue's, where re-pointed, awaiting stamp for T19). All nine converts done. Fixed in the job: R4 (a Drive export over 1 KiB was 'confirmed from the bytes' on its declared type), R28 fence on hand-followed redirects. R17's N3/N10 mark can be struck (met); R7 (N77) stays. Tests 55/55; format, architecture, coverage, ownership 0 failures. Record: build/jobs/T18/acquisition.md.

## Completion of B2 (CHANGE, K659)

**Applied:** R17 as re-worded: `profileOf` reads the stored bytes back whole up to `ODF_DIGEST_MAX` when not already read (was the first KiB), so an office file's format and an OpenDocument package's container digest are judged from its bytes; one read serves both (the second read-back for the container is gone). Over the bound, or multipart or unreadable, nothing is read and the declared type stands with the absence stated. Merged `tranche/T18` first (4c0d6f8cd6).

**Tests:** `profile.test.mjs` now proves every office format (docx, xlsx, pptx, odt, ods, odp) is recognised from its bytes (a magic-byte signal) when served as `application/octet-stream`, the ODT and ODS keeping their container digest; over the bound no read and the declared type; at the bound one whole read. (An OOXML package detects `likely` from its bytes by office-readers' own rule, its main type being in a deflated part; the test asserts the byte signal, not the confidence.) `node --test bio-plane/test/m/acquisition/` → tests 55, pass 55, fail 0.

**Checks:** format 82 modules, 77 requirements files, 0 failures; architecture 9 product files, 37 imports, 0 failures; coverage 30 of 30, 0 failures; ownership 3 files, legacy-checks 0/0, 0 failures.

Size (session_016FKEhQzcqEZnTrvcRTaFgY): test runs 22, module lines 1246
