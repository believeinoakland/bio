# file-safety (T38)

**Status** · session_01Jj7S96F3fqJH68Y3RMjAAY · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied: T38-18 (N789; N791, its share; K2235, K2239, K2264).** Both T38 marks in `build/requirements/file-safety.md` are met:
- **R39** `renderWake` answers null with no renderer bound (the `FILE_SCANNER` binding, as `renderBatch` refuses `RENDERER_ABSENT`), as `scanWake` does with no scanner, whatever is queued. A receipt's R40 arming reads `renderWake`, so with no renderer bound it arms no render either.
- **R28** `host` (from `config`, or a generic template's `template.host`) and `region` are trimmed text, held apart from `config` as the spec's own fields (stored in `fs_tools.host`/`region`, carried on the spec), and count as given when the entry's `config` list names them (required or not). `CONFIG_UNKNOWN` still never names them. `HANDLING_NOT_SHOWN` compares `handlingDigest` with the entry's catalogue digest (R27; for a generic template, the template entry's own). The tool's stored `handling_digest` and `handling` are those of the descriptor it works under (`resolveDescriptor`, for a template the handling stated in `config`), computed here. The refusal order is unchanged: a generic template with no host at all still answers `PROVIDER_UNKNOWN` (as `file-scanner` R21 does) before `CONFIG_MISSING`.

**Tests:** `wakes.test.mjs` new R39 (T38) test, both arms (no renderer and a view queued, a safe copy too: null; a renderer bound and a view queued: an instant). `tools.test.mjs` has two new R28 (T38) tests: (1) a generic template (`icap`) added with its host (in `template.host` or in `config`) and stated handling, plus a refusal when the stated handling's digest is offered instead of the catalogue's; the stored digest is the stated handling's, and the spec carries the host. (2) `splunk-hec` with its host, `scanii` with its region (absent: `CONFIG_MISSING` naming each, writing nothing), and `opswat-deep-cdr` without a host. The fixture's `tool()` now offers the catalogue digest (a template's included) and fills a required `region` (the entry's first) or `host` the test does not name. The direct adds of `scanii` in R28/R29 now name the region its entry requires since T38-17.

**Inherited reds:** plan rule 6 item 9's 29 tests are green (file-safety 52/0).

**Deferred:** nothing.

**Found in other modules (REPORT J1):** scheduler `files.test.mjs`:288 ("R24: against the real file-safety with no scanner bound, … render's refusal RENDERER_ABSENT is its tick's answer") pins the render wake this entry removes. With no renderer bound, render is now not due and the tick has no `filerender` key. It is red from my change and is scheduler's to change (with no renderer bound, render, like scan, wants no wake). Second, unnamed in rule 6 and not this module's: `migrate-released.test.mjs` (Tests run, below). The red it was meant to clear, K2235's (scheduler `plane.test.mjs`, the test at :199 on the base), is green. Also the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (not_product's artifact) is stale from this change, for the layer close.

**Reading set:** measured myself at about 245 KB (own requirements 33 KB; the used modules' Purposes and the services my Uses names, about 68 KB; code 144 KB), at most 300 KB, so read whole. I read all of it myself: the requirements; layer 3's contract; plan T38-18 and rule 6 item 9; K2235, K2239, K2264; every file under `src/file-safety/`; the fixture, `tools.test.mjs` and `wakes.test.mjs`; the used modules' Purposes and named services (file-scanner R1, R2, R19, R21, R27–R29, R31 among them); and `file-scanner/src/providers/catalogue.mjs` (`resolveDescriptor`, the entries' `config`). No worker summary was used. The other test files under my `tests` were run, not read: this entry did not change them.

**Tests run** (on `job/T38/file-safety` from `tranche/T38` @ `a5d1fd0953`):
- `test/m/file-safety/`: 52 pass, 0 fail (was 20/29 at the START: rule 6 item 9).
- scheduler: 109/1 with my change (`files.test.mjs`:288, above); 109/1 on the base without it (`plane.test.mjs`:199, K2235's red, cleared).
- Users the same with and without my change (each red named in rule 6): affordances 189/29 (`plane.test.mjs` ×28, `t36.test.mjs`:40; item 11); op-declarations 112/2 (`t34.test.mjs`:144, `t37.test.mjs`:175); answer-envelope 25/3 (`catalogue-end`:17, `families`:49, :360; items 11, 13); plane 144/2 (`stats.test.mjs`:43, :98; item 11).
- Users green: notice-producers 74/0, setup-page 83/0, store-door 41/0, control-plane 192/0.
- plane's `test/system/migrate-released.test.mjs`: 0/1, the same 28 checks failing with and without my change (identical output). For each release from 0.58.0 to 0.80.0, "no table a fresh store lacks" finds `project_owner_votes` left in the migrated store (one release also `project_join_requests`, `project_owner_decisions`). That is the membership/project-roster split (T38-3/T38-4), not this module, and plan rule 6 does not name it (reported in COMPLETE).
- No layer tests are named in the manifest.

**Checks** (process repository):
- `format: 137 modules, 136 requirements files; 0 failures`
- `architecture: 15 product files, 61 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 41 of 41 live requirement ids named by a test; 0 failures`
- `ownership: 5 files changed by file-safety between tranche/T38 and HEAD; 0 failures`

**P6:** the module's own code is 2,258 lines (was 2,250); its tests are 2,281 lines.

Size (session_01Jj7S96F3fqJH68Y3RMjAAY): test runs 34, module lines 2,258


## J1 · REPORT

R39 is done (renderWake answers null with no renderer bound), and it turns one scheduler test red because that test pins the old behaviour. scheduler on tranche/T38 without my change: 109 pass, 1 fail (plane.test.mjs, test at :199, K2235's red). With my change: 109 pass, 1 fail: that red clears, and files.test.mjs:288 ('R24: against the real file-safety with no scanner bound, … render's refusal RENDERER_ABSENT is its tick's answer') goes red. With no scanner bound, renderWake is now null, so render is not due and the tick has no filerender key (r.filerender is undefined at :296). The test asserts what R39 as amended at my START removes. It is scheduler's to change: with no renderer bound, render, like scan, wants no wake. I have not touched it (P7). The rest of my job goes on.
