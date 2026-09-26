<!-- The capture-sources extraction map, written for BOB #42 on 2026-09-26 on tranche/T3; superseded where it disagrees with build/requirements/capture-sources.md. -->
# capture-sources — extraction map

**Status** · Measured 2026-09-26 by a drafting worker for BOB #42 (P18), reviewed by BOB. Line ranges are in the legacy files on `tranche/T3` at that date; the extraction job confirms them. Measured at `91933d7587`: `store.mjs` 53,685 lines, `index.mjs` 13,438, `schema.mjs` 4,180, `bio-checks.mjs` 16,591. The contract is `build/requirements/capture-sources.md` (R1–R54); K48 applies. `modules.json` gives this module no `from`: it already owns its four files and uses only `subresources` (K48 removed the unused `runtime-limits` edge, and `modules.json` already reads `["subresources"]`). So this is a map of what it owns and who reads it, not of a move.

## 1. What the module owns, and what its job changes there

Nothing moves from a legacy module. The first job edits only these files:

| file | lines | holds | the job's changes |
| --- | --- | --- | --- |
| `bio-plane/src/render.mjs` | 540 | R1–R18: `RENDER_DEFAULTS` 38, `RENDER_TICK_UNDETERMINED` 70, `waitFiredClass` 109, `completenessReading` 124, `renderAllowanceMs` 139, `renderConcurrencyCap` 166, `renderReserveMs` 190, `NON_DATA_TYPES` 205, `keepRenderBodies` 283, `originKey` 315, `renderBlock` 325–458, `renderedAuthority` 469, `rendererFor` 528 | R54 `renderLocaleFor(view)` is new. R3 adds `settled`, and R4/R14 add `settled_with_open_requests`, both inert until N is measured (K48, D-570) |
| `bio-plane/src/browserrender.mjs` | 496 | R19–R26: `openSession` 105, `collectBodies` 130, `cdpConnection` 184, `renderWithBinding` 239–491, `browserBindingRenderer` 494 | R26's rule (`quiet_excluding_long_lived`), off until N is measured and stated with its measurement |
| `bio-plane/src/cdx.mjs` | 187 | R27–R37: `EMPTY_BODY_DIGEST` 31, `parseCdx` 36, `cdxTimestampToIso` 60, `rowRefusal` 71, `selectCapture` 94–129, `replayLocator` 133, `cdxQuery` 141, `archiveHop` 163–187 | R36: `selectCapture` keeps `urlkey` and `archiveHop` names it (K48, in the first job). R37 (Memento) stays not yet met and unscheduled |
| `bio-plane/src/drive.mjs` | 451 | R38–R46: `DRIVE_HOSTS` 52, `DRIVE_KINDS` 67, `readDriveAddress` 119, `exportAddressFor` 218, `driveHop` 238, `driveConvertStep` 323, `DRIVE_HOP_FACT_KEYS` 339, `callerSuppliedHopFacts` 343–346, `driveBaselineRow` 389, `classifyDriveBaseline` 399 | none required |

About 1,670 lines are owned; the job adds perhaps 60–120.

**Tables:** none (R47). **Ops:** none, in `index.mjs` or `store.mjs`. **Checks:** none. No `bio-checks.mjs` finding or refusal family is this module's. The render refusals (C-83) and the Drive refusals (C-48) are `capture`'s (its R4, R5, R37). A search of `store.mjs`, `index.mjs`, `schema.mjs` and `bio-checks.mjs` for this module's literals (`EMPTY_BODY_DIGEST`, the replay URL shape, the tick and reading sentences, Drive's export host, `google-export`) finds no legacy copy, except one comment at index.mjs 9789.

## 2. Who reads it (callers, all outside this module)

| caller | where | reads | after extraction |
| --- | --- | --- | --- |
| `index.mjs` imports | 98–99, 117–119, 147 | Drive, render and CDX exports | move with the importing code into `capture` (capture map §1) |
| `archiveSelect` | index.mjs 214–269 | `parseCdx`, `selectCapture`, `replayLocator`, `cdxQuery`, `archiveHop` | `capture` (R3) |
| `acquire`'s Drive arm, render arm, subresource walk | index.mjs 7984–10153 | `readDriveAddress`, `driveHop`, `driveConvertStep`, `callerSuppliedHopFacts`, `rendererFor`, `renderBlock`, `renderedAuthority`, `keepRenderBodies`, `renderReserveMs`, `renderAllowanceMs`, `renderConcurrencyCap`, `RENDER_DEFAULTS` | `capture`. R54's locale is passed by `capture` (its R41), not here |
| `op=monitor` | index.mjs 10318–10923 | `RENDER_TICK_UNDETERMINED`, `completenessReading`, `readDriveAddress` | `monitoring` |
| `driveShells` | store.mjs 17272–17325 (import at store 234) | `readDriveAddress`, `driveBaselineRow`, `classifyDriveBaseline` | `monitoring` (capture's Suggestions). It reads the register and receipts itself (17307), through provenance once that is extracted |

## 3. Private calls that leave the module, and conflicts

- Calls out: `subresources.originOf`, `SUBRESOURCE_CAP`/`MAX`/`BUDGET` (render.mjs 29, browserrender.mjs 74). They match Uses. `render.mjs` imports `browserrender.mjs`, internal. Nothing else is imported.
- **R54 and the view.** `renderLocaleFor(view)` takes `jurisdictions.combine`'s view from the caller, so this module needs no `jurisdictions` edge. The profiles name no locale yet (K48); until a profile section exists, every answer is the fallback. Which profile key names the locale is `jurisdictions`' to state.
- **R26 measurement.** N ("no request younger than N seconds") is unmeasured. The job ships the rule off and names the measurement owed. D-570's built work is on the snapshot branch.
- **R18 wrapping.** `rendererFor`'s service renderer rejects when the service's `fetch` throws. The Suggestion (answer `{ok: false, error}`) is compatible with R19; take it in the first job or leave it stated.
- No conflict with `modules.json`: `uses: ["subresources"]` is exactly what the code imports.

## 4. Undetermined (stated, not guessed)

1. **The archive's 24/min for `web.archive.org`.** It is set by `archiveSelect` (index.mjs 235–240) as a `governorconfig` call. `capture` claims it (its R3), this module's Suggestions offer to hold it ("here or in `capture`"), and `host-governor` R25 says only that it is not the governor's. If it lives here, it is a constant (`ARCHIVE_APPETITE_PER_MIN`, stated as the archive's figure) that `capture` passes to `host-governor.governorConfig`. Stated in the capture and host-governor maps' §4 too.
2. **`cdpConnection` and `collectBodies`** are exported for tests only (Suggestions); the job keeps them exported and outside Provides.
3. **Test directory.** `bio-plane/test/m/capture-sources/` does not exist yet; the job creates it with requirement-named tests.

## 5. Old tests (legacy-tests) that anchor on this module's text

Nothing moves, so none breaks from a move. These patch this module's files by exact text, and break if the job edits the anchored lines:
- `nc-d490.mjs` (40–55: `browserrender.mjs` and `render.mjs` lines, among them `requests: sawNetwork ? `)
- `nc-d64.mjs` (33–49: `render.mjs` lines in `renderedAuthority`/`renderBlock`)
- `retirement.control.mjs` (44, 162: `cdx.mjs` by file)

These pin behaviour the job changes:
- `cdx.test.mjs` (`selectCapture`'s `chosen` without `urlkey`, R36)
- `browser-render.test.mjs` and `rendered-capture.test.mjs` (the `en-US` locale, R54; the wait classes, R3/R14)
- `drive.test.mjs`, `drive-convert.test.mjs`, `d525-driveshells.test.mjs`, `d522-unattended-render.test.mjs`, `monitor-rendered.test.mjs`, `d524-archive-baseline.test.mjs` (they import from these files, and stay green unless an export's shape changes)
