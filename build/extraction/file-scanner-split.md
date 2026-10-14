# file-scanner → file-engines — split map (N1059), reference only (K3225: no split owed)

**Status** · Draft for BOB (a worker's, T48), to move to `build/extraction/file-scanner-split.md` if adopted. Written in credentials-split.md's form (K3101). N1059.

**Why.** `plan/next.md`:31 (N1059) and K3209 (`rulings.md`:3210) read FILE-SCANNER #5's Size line, "module lines 4756" (`jobs/T48/file-scanner.md`:26), as file-scanner's own code, past K617's ~4,000 mark.

**Read whole:** `requirements/file-scanner.md`; its `modules.json` entry (index 32) and its three users' (44 `acquisition`, 47 `file-safety`, 163 `plane`); every file under `file-scanner/` but `test/` and `dist/`; `extraction/credentials-split.md` (the format); K617, K624, K702, K1024, K1821, K2085, K2513, K3209 in `rulings.md`.
**Read in part:** the users' call sites, by `git grep` over `bio-plane/src`, `bio-plane/test`, `newgroup/`, `.github/` (bundles excluded); tests by file name, imports and the R ids each names.
**Line numbers:** `tranche/T48` @ `dfc7d4b755` (T48-7 merged).

## 0. The answer

**No split is owed.** The 4,756 counts the module's tests. K1821, K2085 and K2513 measure hand-written code only, not tests and not the bundle. By that measure file-scanner is **2,831 lines**, and 2,511 of those are `.mjs`.
- The figure is reproduced exactly. Every tracked file under `file-scanner/` except `dist/`, `package-lock.json`, the two dotfiles and `test/fixtures/encrypted.pdf` sums to 4,756. Of that, `test/` holds 1,925.
- K2085 measured the module the same way at T36: "4,257 lines with tests, 2,721 without (K1821 measures own code, not tests)" (`rulings.md`:2087). Since then it grew by 110 lines.
- No other module's path lies inside `file-scanner/`, so the module owns every file there.

**Recommendation (doubt 1):** close N1059 the way K2513 closed agent-worker's, and record the corrected figure against K3209. Keep this map for reference, as `extraction/agent-worker-split.md` was kept, in case the module passes ~4,000 by its own code. The requirements' own estimate tops out at about 3,400 (`requirements/file-scanner.md`:5), so that could happen.

**If BOB splits anyway (for headroom, as K2982 did), the cut is the built-in engines.** A new module, **`file-engines`**, would take:
- ClamAV's scan (R1–R4) and its signature mirror (R6);
- the safe view (R7);
- the bucket copy every route reads, and the module's one write site (R2, R11);
- the fixed sets and bounds (R15, R16);
- the two container images: their servers, Dockerfiles and package statements.

**file-scanner keeps** the fleet member (R8–R10: the Worker, its two classes, the surface the plane binds to) and the whole provider contract (R5, R13, R19–R31).

| | lines (own code, with comments) | of which `.mjs` |
|---|---|---|
| file-scanner today | **2,831** | 2,511 |
| file-scanner after | about **1,919** | 1,719 |
| file-engines | about **912** | 792 |

**The edge runs one way: file-scanner uses file-engines, never the reverse.**
- `clamav.mjs`, `render.mjs`, `store.mjs` and `limits.mjs` import only one another and `node:` modules (`clamav.mjs`:9–10, `render.mjs`:3–4, `store.mjs`:5–6, `limits.mjs`).
- Both image servers import only `container/common.mjs` and `src/limits.mjs` (`scanner.mjs`:19–20, `renderer.mjs`:15–16).
- The upper side reaches down in these places, and only these:
  - `handler.mjs`:4–6 (`scan`, `mirror`, `signatureState`, `render`, `BOUNDS`);
  - `worker.mjs`:9–10 (`runMirror`, `MEMBER_LIMITS_STATEMENT`);
  - `providers/routes.mjs`:4–5 (five bounds, five store services);
  - `providers/reputation.mjs`:8 (`writeObject`, `deleteObject`, `readJson`);
  - `providers/net.mjs`:6 and `providers/probes.mjs`:4 (one bound each).

**Why this seam and not the provider contract (seam B, doubt 2).** K2085 named the provider contract as the seam "if it grows". It cannot be cut out alone and placed before file-scanner, because it imports `store.mjs` and `limits.mjs`. Taking those two with it would put R2, R11, R15 and R16 in a module named for outside tools. It would also give the images' only Worker-side input (`src/limits.mjs`, copied into both images by `Dockerfile.*`:24) to the tools module, and add about 30 cross-names against seam A's 20. Seam A's lower half is exactly what the images are built from, plus the Worker code that drives them.

## 1. The new module

| | `file-engines` |
|---|---|
| purpose | The built-in engines of the `file-scanner` member: ClamAV's verdicts on a duplicate of each target's stored bytes, its signatures mirrored daily in the group's bucket, and the safe view rendered as page images. Includes the two container images that run them with no internet, the bucket copy every route reads (each digest checked), the member's one write site, and its fixed sets and bounds. It holds no record and no key, and never writes a capture. The member, its surface and the outside tools are `file-scanner`'s. |
| layer | 1 (as file-scanner) |
| place in `modules.json` | Directly before `file-scanner`, which moves from 32 to 33. The new order runs `sheet-worker` (31), **`file-engines`** (32), `file-scanner` (33), `record-core` (34). It uses nothing earlier but `test-support`, so any place in L1 is legal. Next to its user is the natural place. |
| paths / tests | **Path-only, recommended (doubt 3):** the files stay where they are, and the most specific path owns each one (K1024, K1821). `paths`: `file-scanner/src/clamav.mjs`, `file-scanner/src/render.mjs`, `file-scanner/src/store.mjs`, `file-scanner/src/limits.mjs`, `file-scanner/container/`, `file-scanner/Dockerfile.scanner`, `file-scanner/Dockerfile.renderer`, `file-scanner/packages-scanner.json`, `file-scanner/packages-renderer.json`. `tests`: `file-scanner/test/engines/`. This is the precedent of `image-codecs` and `pdf-pixels`, which own files inside `pdf-worker/src/` (`modules.json`), and of public-read owning `publication/worker.mjs` (K702). |
| from | none (not legacy; K624) |
| uses | `test-support` (its tests import `bio-plane/test/sandbox.mjs` through `helpers.mjs`:4, and `pdf-worker/test/make-pdf.mjs`). No runtime import outside `node:`. |
| entry point | none: it has no factory and no record. Its services are plain functions taking the member's `deps`, as today. |
| exports | services `scan(deps, body)`, `mirror(deps)`, `runMirror(deps)`, `signatureState(bucket)`, `render(deps, body)`; the store services `normaliseTarget`, `knownStore`, `sizeTarget`, `targetStream`, `verifyTarget`, `writeObject`, `deleteObject`, `readJson`; constants `NAMESPACES`, `PLANE_OPS`, every R16 bound, `LOG_COUNT_KINDS`, `BOUNDS`, `MEMBER_LIMITS`, `MEMBER_LIMITS_STATEMENT`; the image servers' `start`, `parseScan`, `verifyFile`, `sniff`, `jpegInfo`, `writeImagePdf`. Nothing new is written: every name exists today. |

## 2. What moves

All from `file-scanner/`. With the path-only form, nothing is copied and no byte changes. Only the owning module changes (doubt 3).

| moved | file (lines) | file-scanner id |
|---|---|---|
| `NAMESPACES`, `PLANE_OPS`, the bounds, `LOG_COUNT_KINDS`, `SCAN_TIME_MS`, `RENDER_TIME_MS`, `MEMBER_LIMITS*`, `BOUNDS` | `src/limits.mjs` 1–40 (40) | R15, R16 |
| `AREAS`, `objectKey`, `captureKey`, `normaliseTarget`, `knownStore`, `sizeTarget`, `targetStream`, `verifyTarget`, `targetBytes`, `writeObject`, `deleteObject`, `readJson` | `src/store.mjs` 1–134 (134) | R1, R2, R11 |
| `scan`, `ensureSet`, `ask`, `signaturesOf`; the mirror `runMirror`, `putStream`, `mirror`; `signatureState` | `src/clamav.mjs` 1–199 (199) | R1–R4, R6, R8's `signatures` |
| `render`, `checkOne` | `src/render.mjs` 1–51 (51) | R7 |
| the image servers: `common.mjs` (49), `scanner.mjs` (150), `renderer.mjs` (169) | `container/` (368) | R3, R4, R6, R7, R12, R14 |
| the images' builds and package statements | `Dockerfile.scanner` (27), `Dockerfile.renderer` (27), `packages-scanner.json` (29), `packages-renderer.json` (37) | R10's image half (bundler R27) |

**Stays in file-scanner:**
- `src/worker.mjs` (58): R10's Worker, the two `Container` classes and `depsOf`.
- `src/handler.mjs` (46): R8, R9, the route table.
- `src/providers/*` (1,598): R5, R13, R19–R31.
- `scripts/build.mjs` (17), `fleet-member.json` (116), `wrangler.jsonc` (67), `package.json` (17).

The class names `FileScanner` and `SafeViewRenderer`, their ports and the image references stay in file-scanner's marker and configuration (`fleet-member.json`:22–80, `wrangler.jsonc`:38–61). Their images are built from file-engines' files.

**No check rows, tables or ops move.** The member has none: it answers `{ok:false, code}` on its own surface, and `PLANE_OPS` is empty (`limits.mjs`:10).

**Found while reading (for file-scanner's or file-engines' next job, not part of the split):**
- `store.mjs`:108–115 `targetBytes` and `store.mjs`:14 `captureKey` have no caller.
- `render.mjs`:12's comment ("shared with the outside tools' routes") is stale: the routes check their own targets (`routes.mjs`:109–130).

## 3. How it runs (K624), and who re-points

**Path-only (recommended).** One act, at the START of the layer that holds it (L1 of T49), with no job between:
1. `modules.json` gains `file-engines` at 32, with the paths above and `uses: ["test-support"]`.
2. file-scanner's `uses` gains `file-engines`. It keeps `runtime-limits` (`reputation.mjs`:6, `sha256hex`), `bundler` (`scripts/build.mjs`:8) and `test-support`.
3. file-safety's `uses` gains `file-engines`, because it imports `limits.mjs` (`file-safety/index.mjs`:34). It keeps file-scanner for `catalogue.mjs` (:35–36) and for the binding's routes.
4. `requirements/file-engines.md` (§4) and the re-worded `file-scanner.md` are added, with a `layers.md` L1 row.
5. membership's `MODULE_ORDER` (`membership/index.mjs`:282) gains `file-engines` before `file-scanner` (K657).

Then **FILE-ENGINES' job** (L1) moves its test arms (§4, Tests) into `test/engines/`, driving `scan`, `render` and `mirror` directly rather than through `handle`, since a test of the earlier module may not import the later one. **FILE-SCANNER's job** (L1, after it merges) deletes the moved arms and re-tags its own.
- Nothing is held twice, so K624's rule is met with no copy at all.
- No user is red at any point: no import path changes.

**Copy-then-delete into a new directory (K624's usual form; not recommended).** FILE-ENGINES would copy the files to `file-engines/`, and FILE-SCANNER would then delete them and re-point. Re-pointing means:
- four Worker-side import sites: `handler.mjs`:4–6, `worker.mjs`:9–10, `routes.mjs`:4–5, `reputation.mjs`:8, plus `net.mjs`:6 and `probes.mjs`:4;
- file-safety's `index.mjs`:34 and its tests `intake.test.mjs`:10 (L3);
- the images.

The images are the cost:
- `Dockerfile.*`:23–24 `COPY container/…` and `src/limits.mjs` from the build context `file-scanner`, as do `fleet-member.json`:46–50, 75–79 and `.github/workflows/container-images.yml`:15–16, 33–34.
- Moving those files changes the context, so each image digest pinned in `fleet-member.json`:27, 55 and `wrangler.jsonc`:41, 47 no longer matches its source until a release rebuilds both images (R10; K1898: never built in a session).
- No delegate can cover that.

**Delegates.** With the path-only form none is needed. With copy-then-delete, one re-export file would keep users green until they re-point: `src/limits.mjs` as `export * from '../../file-engines/src/limits.mjs'`. That would cover file-safety and its four test files (`absent`, `fixture`, `intake`, `tools` import only `limits.mjs` and `catalogue.mjs`). But it would break both images, which copy `src/limits.mjs` alone (`Dockerfile.*`:24).

**Users of the binding only (no change in either form):**
- `acquisition` (`acquisition/index.mjs`:1274, `/provider/reputation`);
- `plane` (`wrangler.jsonc`:126, `store.mjs`:501);
- `instance-setup` (`setup-fleet.mjs`:15, `/version`);
- `newgroup` (its R44 test).

They reach the member's surface, which stays file-scanner's.

## 4. Requirement ids

| file-scanner | file-engines | what |
|---|---|---|
| R1 | **R1** | `/scan`'s request checks, answered by `scan` |
| R2 | **R2** | each target read as a checked copy (`captures/` or `derived/`) |
| R3 | **R3** | ClamAV's verdicts, archives and documents scanned inside |
| R4 | **R4** | only the mirrored set; `SIGNATURES_ABSENT`, `SIGNATURES_STALE` |
| R6 | **R5** | the mirror (`runMirror`, `mirror`) |
| R7 | **R6** | the safe view (`render`) |
| R11 | **R7** | the one write site (`writeObject`, `deleteObject`), under `clamav/` and `reputation/` only |
| R15 | **R8** | `NAMESPACES`, `PLANE_OPS` |
| R16 | **R9** | the bounds, `LOG_COUNT_KINDS`, `BOUNDS`, `MEMBER_LIMITS_STATEMENT` |
| R14 (the images' and the copy's share) | **R10** | a fresh temporary copy per request, removed when it ends; the same bytes and set give the same verdict |
| R12 (the images' and the mirror's share) | **R11** | the images open no connection; the mirror reaches only ClamAV's host |
| R17 (EICAR, corpus, renderer) | **R12** | the offline tests of the engines |
| R10 (the images' half) | **R13** | the two image servers, their Dockerfiles and package statements (bundler R27), named and deployed by file-scanner R10 |
| new | **R14** | the services file-scanner's handler, Worker and routes call (§1 exports), each answering as the route it backs |
| R18 | **R15** | no place named |

**Retired in file-scanner as "moved to `file-engines` R<n>":** R1 → R1, R2 → R2, R3 → R3, R4 → R4, R6 → R5, R7 → R6, R11 → R7, R15 → R8, R16 → R9 (9 ids).

**Re-worded in file-scanner** (meaning unchanged; BOB's wording):
- Purpose: "its built-in engines are `file-engines`'";
- `POST /scan`, `/mirror` and `/render`: each "answered through file-engines R1–R4, R5, R6";
- R8: `signatures` and `bounds` from file-engines R5 and R9;
- R10: images built from file-engines R13;
- R12, R14, R17: the outside calls' share only;
- R5, R23, R24: "R1 and R2's checks" read "file-engines R1 and R2";
- R21: `REACH_NOT_BOUND` unchanged;
- R32: unchanged (its refusals include `/render`'s, served through file-scanner);
- Uses: gains `file-engines`; `runtime-limits` now `sha256hex` only (`makeMeter` is named at `file-scanner.md`:73 but no source calls it);
- Size.

**Elsewhere (wording only, each module's own job):**
- file-safety's Uses (`requirements/file-safety.md`:97): `SCAN_BATCH_MAX` and `LOG_COUNT_KINDS` become file-engines R9's (re-exported by its R21; keyed by its R35). The rest of that line stays file-scanner's.

**Tests** (by file, the ids each names):

| file | ids named | after |
|---|---|---|
| `scan.test.mjs` (185) | R1–R4, R14, R17 | file-engines, whole |
| `render.test.mjs` (153) | R1, R2, R7, R14, R17 | file-engines, whole |
| `mirror.test.mjs` (116) | R2, R6, R8, R11 | file-engines, except R8's `/version` arm (imports `catalogue.mjs`:7), which stays |
| `helpers.mjs` (139) | R2 | copied to both (K57's small-helper rule), since `vendors.mjs`:6 imports it |
| `worker.test.mjs` (229) | R8–R12, R15, R16, R18, R25, R26 | file-scanner, except the R11, R15 and R16 arms, which move |
| `adapters` (437), `contract` (310), `vendors` (221), `words` (104), `stubs/` (31) | R5, R12, R13, R17, R19–R32 | file-scanner |

Every arm keeps its old id under its new number, and each new id gets an explicit test (K874).

## 5. Generated artifacts (`build/manifest.md` §14)

- **`file-scanner/dist/file-scanner.bundled.mjs`, `.bundle.json`** (file-scanner's). Its inputs include `src/clamav.mjs`, `limits.mjs`, `render.mjs` and `store.mjs`, which file-engines now owns. That is allowed: pdf-worker's bundle takes `pdf-reader`'s files.
  - Path-only: no byte or path changes, so it stays fresh.
  - Copy-then-delete: input paths change, so it is stale from FILE-SCANNER's delete until its own rebuild.
- **`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`** (`not_product`). It takes `../file-scanner/src/limits.mjs` and three provider files through file-safety.
  - Path-only: unchanged.
  - Copy-then-delete: stale until the layer's close regenerates it.
- **The two container images** (`ghcr.io/believeinoakland/file-scanner-{scanner,renderer}@sha256:…`). They are built by `container-images.yml` from context `file-scanner`.
  - Path-only: unchanged.
  - Copy-then-delete: stale digests until the next release (§3). This is the deciding cost.
- `newgroup` (`release.mjs`, `RELEASE.json`): changes only at a release.

## 6. Doubts for BOB

1. **Split or not.** *Reading:* not now. K617 counts own code (K1821, K2085, K2513): 2,831 lines, not 4,756. Close N1059 under K2513's rule, note the corrected figure against K3209, and file this map under `extraction/` for reference. Re-measure at each file-scanner COMPLETE by own code; the Size line's "module lines" figure there includes tests.
2. **The seam, if split.** A (this map: `file-engines` before file-scanner, taking the engines, store and bounds) against B (the provider contract out, before file-scanner). B must also take `store.mjs` and `limits.mjs` to avoid a cycle (`routes.mjs`:4–5, `reputation.mjs`:8). That gives R2, R11, R15 and R16, and the images' one Worker-side input, to a module named for outside tools. *Reading:* A.
3. **Path-only or copy-then-delete.** *Reading:* path-only. K624 forbids holding code twice across tranches; it does not require moving files. The precedents are `image-codecs` and `pdf-pixels` owning files in `pdf-worker/src/`, and K702. Copy-then-delete into `file-engines/` would stale both image digests until a release (`Dockerfile.*`:23–24, `fleet-member.json`:46–50, `container-images.yml`:15–16) and would buy nothing. This is technical, BOB's.
4. **Who owns the images.** The images are built from file-engines' files, but are named, pinned and deployed by file-scanner's marker and configuration (R10). *Reading:* keep R10 (names, digests, classes, deploy) in file-scanner. file-engines R13 states only what is inside each image. A rebuild is then a file-engines change that file-scanner's next release re-pins, as an image that bundles another module's files does today.
5. **`LOG_COUNT_KINDS` and the provider bounds** (`PROVIDER_TIMEOUT_MS`, `SANDBOX_TIMEOUT_MS`, `REPUTATION_LIST_MAX_AGE_MS`) belong to the provider contract but sit in `limits.mjs`, which both images copy. *Reading:* leave them there (R9 in file-engines). Moving them would change the images' input and so their digests. It would also split R16's one `bounds` statement.
6. **Name.** `file-engines` (the built-in engines and their images). *Alternatives:* `builtin-engines`, `scanner-images`. Names are BOB's (K569, K2982).
7. **Bob's or BOB's.** A size split is BOB's (K617), and no id changes meaning. Nothing here is Bob's.
